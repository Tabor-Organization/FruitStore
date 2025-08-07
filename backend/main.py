from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
import hashlib
import re
from datetime import datetime

app = FastAPI()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
db = client["fruitstore"]
fruits_collection = db["fruits"]
orders_collection = db["orders"]
users_collection = db["users"]

class Fruit(BaseModel):
    name: str
    price: float
    stock: int

class FruitInDB(Fruit):
    id: str

class OrderItem(BaseModel):
    fruit_id: str
    quantity: int

class Order(BaseModel):
    items: List[OrderItem]
    total: float

class OrderInDB(Order):
    id: str

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

class User(BaseModel):
    email: EmailStr
    password_hash: str
    created_at: datetime
    is_verified: bool = False

class UserInDB(BaseModel):
    id: str
    email: str
    created_at: datetime
    is_verified: bool

class UserResponse(BaseModel):
    message: str
    user: Optional[UserInDB] = None

@app.get("/fruits", response_model=List[FruitInDB])
def get_fruits():
    fruits = []
    for fruit in fruits_collection.find():
        fruits.append(FruitInDB(id=str(fruit["_id"]), name=fruit["name"], price=fruit["price"], stock=fruit["stock"]))
    return fruits

@app.post("/fruits", response_model=FruitInDB)
def add_fruit(fruit: Fruit):
    result = fruits_collection.insert_one(fruit.dict())
    return FruitInDB(id=str(result.inserted_id), **fruit.dict())

@app.put("/fruits/{fruit_id}", response_model=FruitInDB)
def update_fruit(fruit_id: str, fruit: Fruit):
    result = fruits_collection.update_one({"_id": ObjectId(fruit_id)}, {"$set": fruit.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fruit not found")
    return FruitInDB(id=fruit_id, **fruit.dict())

@app.delete("/fruits/{fruit_id}")
def delete_fruit(fruit_id: str):
    result = fruits_collection.delete_one({"_id": ObjectId(fruit_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fruit not found")
    return {"message": "Fruit deleted"}

@app.post("/orders", response_model=OrderInDB)
def create_order(order: Order):
    order_dict = order.dict()
    result = orders_collection.insert_one(order_dict)
    return OrderInDB(id=str(result.inserted_id), **order_dict)

@app.get("/orders", response_model=List[OrderInDB])
def get_orders():
    orders = []
    for order in orders_collection.find():
        orders.append(OrderInDB(id=str(order["_id"]), items=order["items"], total=order["total"]))
    return orders

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"

@app.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegistration):
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validate password strength
    is_strong, message = validate_password_strength(user_data.password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=message)
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        created_at=datetime.utcnow(),
        is_verified=False
    )
    
    result = users_collection.insert_one(user.dict())
    
    user_in_db = UserInDB(
        id=str(result.inserted_id),
        email=user.email,
        created_at=user.created_at,
        is_verified=user.is_verified
    )
    
    return UserResponse(
        message="User registered successfully",
        user=user_in_db
    )

@app.get("/users/{email}")
def check_email_exists(email: str):
    """Check if email already exists"""
    user = users_collection.find_one({"email": email})
    return {"exists": user is not None}

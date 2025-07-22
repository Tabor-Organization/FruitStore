from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pymongo import MongoClient
from bson import ObjectId
import os

app = FastAPI()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
db = client["fruitstore"]
fruits_collection = db["fruits"]
orders_collection = db["orders"]

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

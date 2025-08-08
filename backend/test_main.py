import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient
import os
from main import app, fruits_collection, orders_collection

# Test client
client = TestClient(app)

# Test database setup
TEST_MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
test_client = MongoClient(TEST_MONGO_URL)
test_db = test_client["fruitstore_test"]


@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Setup and teardown for each test"""
    # Clear test collections before each test
    test_db.fruits.delete_many({})
    test_db.orders.delete_many({})
    yield
    # Clean up after each test
    test_db.fruits.delete_many({})
    test_db.orders.delete_many({})


@pytest.fixture
def sample_fruit():
    """Sample fruit data for testing"""
    return {
        "name": "Apple",
        "price": 1.50,
        "stock": 100
    }


@pytest.fixture
def sample_fruits():
    """Multiple sample fruits for testing"""
    return [
        {"name": "Apple", "price": 1.50, "stock": 100},
        {"name": "Banana", "price": 0.75, "stock": 50},
        {"name": "Orange", "price": 2.00, "stock": 75}
    ]


class TestFruits:
    """Test cases for fruit endpoints"""

    def test_get_fruits_empty(self):
        """Test getting fruits when database is empty"""
        response = client.get("/fruits")
        assert response.status_code == 200
        assert response.json() == []

    def test_add_fruit(self, sample_fruit):
        """Test adding a new fruit"""
        response = client.post("/fruits", json=sample_fruit)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == sample_fruit["name"]
        assert data["price"] == sample_fruit["price"]
        assert data["stock"] == sample_fruit["stock"]
        assert "id" in data

    def test_add_fruit_invalid_data(self):
        """Test adding fruit with invalid data"""
        invalid_fruit = {
            "name": "Apple",
            "price": "invalid_price",  # Should be float
            "stock": 100
        }
        response = client.post("/fruits", json=invalid_fruit)
        assert response.status_code == 422

    def test_get_fruits_with_data(self, sample_fruits):
        """Test getting fruits when database has data"""
        # Add fruits first
        fruit_ids = []
        for fruit in sample_fruits:
            response = client.post("/fruits", json=fruit)
            fruit_ids.append(response.json()["id"])

        # Get all fruits
        response = client.get("/fruits")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == len(sample_fruits)
        
        # Check that all fruits are returned
        fruit_names = [fruit["name"] for fruit in data]
        expected_names = [fruit["name"] for fruit in sample_fruits]
        assert set(fruit_names) == set(expected_names)

    def test_update_fruit(self, sample_fruit):
        """Test updating an existing fruit"""
        # Add a fruit first
        response = client.post("/fruits", json=sample_fruit)
        fruit_id = response.json()["id"]

        # Update the fruit
        updated_fruit = {
            "name": "Green Apple",
            "price": 1.75,
            "stock": 80
        }
        response = client.put(f"/fruits/{fruit_id}", json=updated_fruit)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == updated_fruit["name"]
        assert data["price"] == updated_fruit["price"]
        assert data["stock"] == updated_fruit["stock"]
        assert data["id"] == fruit_id

    def test_update_nonexistent_fruit(self):
        """Test updating a fruit that doesn't exist"""
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
        updated_fruit = {
            "name": "Nonexistent Fruit",
            "price": 1.00,
            "stock": 10
        }
        response = client.put(f"/fruits/{fake_id}", json=updated_fruit)
        assert response.status_code == 404
        assert response.json()["detail"] == "Fruit not found"

    def test_delete_fruit(self, sample_fruit):
        """Test deleting an existing fruit"""
        # Add a fruit first
        response = client.post("/fruits", json=sample_fruit)
        fruit_id = response.json()["id"]

        # Delete the fruit
        response = client.delete(f"/fruits/{fruit_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Fruit deleted"

        # Verify fruit is deleted
        response = client.get("/fruits")
        assert response.json() == []

    def test_delete_nonexistent_fruit(self):
        """Test deleting a fruit that doesn't exist"""
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
        response = client.delete(f"/fruits/{fake_id}")
        assert response.status_code == 404
        assert response.json()["detail"] == "Fruit not found"


class TestOrders:
    """Test cases for order endpoints"""

    def test_create_order(self, sample_fruits):
        """Test creating a new order"""
        # Add fruits first
        fruit_ids = []
        for fruit in sample_fruits:
            response = client.post("/fruits", json=fruit)
            fruit_ids.append(response.json()["id"])

        # Create an order
        order_data = {
            "items": [
                {"fruit_id": fruit_ids[0], "quantity": 2},
                {"fruit_id": fruit_ids[1], "quantity": 3}
            ],
            "total": 5.25
        }
        response = client.post("/orders", json=order_data)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5.25
        assert "id" in data

    def test_create_order_invalid_data(self):
        """Test creating order with invalid data"""
        invalid_order = {
            "items": [],  # Empty items
            "total": "invalid_total"  # Should be float
        }
        response = client.post("/orders", json=invalid_order)
        assert response.status_code == 422

    def test_get_orders_empty(self):
        """Test getting orders when database is empty"""
        response = client.get("/orders")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_orders_with_data(self, sample_fruits):
        """Test getting orders when database has data"""
        # Add fruits first
        fruit_ids = []
        for fruit in sample_fruits:
            response = client.post("/fruits", json=fruit)
            fruit_ids.append(response.json()["id"])

        # Create multiple orders
        orders_data = [
            {
                "items": [{"fruit_id": fruit_ids[0], "quantity": 1}],
                "total": 1.50
            },
            {
                "items": [{"fruit_id": fruit_ids[1], "quantity": 2}],
                "total": 1.50
            }
        ]

        order_ids = []
        for order in orders_data:
            response = client.post("/orders", json=order)
            order_ids.append(response.json()["id"])

        # Get all orders
        response = client.get("/orders")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == len(orders_data)


class TestIntegration:
    """Integration tests for the complete workflow"""

    def test_complete_fruit_store_workflow(self):
        """Test a complete workflow: add fruits, create order, verify data"""
        # Step 1: Add fruits
        fruits = [
            {"name": "Apple", "price": 1.50, "stock": 100},
            {"name": "Banana", "price": 0.75, "stock": 50}
        ]
        
        fruit_ids = []
        for fruit in fruits:
            response = client.post("/fruits", json=fruit)
            assert response.status_code == 200
            fruit_ids.append(response.json()["id"])

        # Step 2: Verify fruits are added
        response = client.get("/fruits")
        assert response.status_code == 200
        assert len(response.json()) == 2

        # Step 3: Create an order
        order_data = {
            "items": [
                {"fruit_id": fruit_ids[0], "quantity": 2},
                {"fruit_id": fruit_ids[1], "quantity": 3}
            ],
            "total": 5.25
        }
        response = client.post("/orders", json=order_data)
        assert response.status_code == 200
        order_id = response.json()["id"]

        # Step 4: Verify order is created
        response = client.get("/orders")
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) == 1
        assert orders[0]["id"] == order_id

        # Step 5: Update a fruit
        updated_fruit = {"name": "Green Apple", "price": 1.75, "stock": 90}
        response = client.put(f"/fruits/{fruit_ids[0]}", json=updated_fruit)
        assert response.status_code == 200

        # Step 6: Delete a fruit
        response = client.delete(f"/fruits/{fruit_ids[1]}")
        assert response.status_code == 200

        # Step 7: Verify only one fruit remains
        response = client.get("/fruits")
        assert response.status_code == 200
        remaining_fruits = response.json()
        assert len(remaining_fruits) == 1
        assert remaining_fruits[0]["name"] == "Green Apple"


class TestEdgeCases:
    """Test edge cases and error conditions"""

    def test_invalid_object_id_format(self):
        """Test endpoints with invalid ObjectId format"""
        invalid_id = "invalid_id_format"
        
        # Test update with invalid ID
        fruit_data = {"name": "Test", "price": 1.0, "stock": 10}
        response = client.put(f"/fruits/{invalid_id}", json=fruit_data)
        assert response.status_code == 422 or response.status_code == 400

        # Test delete with invalid ID
        response = client.delete(f"/fruits/{invalid_id}")
        assert response.status_code == 422 or response.status_code == 400

    def test_negative_values(self):
        """Test handling of negative values"""
        invalid_fruit = {
            "name": "Test Fruit",
            "price": -1.0,  # Negative price
            "stock": -10    # Negative stock
        }
        # The API should ideally validate this, but currently it doesn't
        # This test documents current behavior
        response = client.post("/fruits", json=invalid_fruit)
        # Currently the API accepts negative values, but this could be improved
        assert response.status_code == 200

    def test_zero_values(self):
        """Test handling of zero values"""
        fruit_with_zeros = {
            "name": "Free Fruit",
            "price": 0.0,
            "stock": 0
        }
        response = client.post("/fruits", json=fruit_with_zeros)
        assert response.status_code == 200
        
        data = response.json()
        assert data["price"] == 0.0
        assert data["stock"] == 0

    def test_empty_string_name(self):
        """Test fruit with empty name"""
        invalid_fruit = {
            "name": "",  # Empty name
            "price": 1.0,
            "stock": 10
        }
        response = client.post("/fruits", json=invalid_fruit)
        # Currently the API accepts empty names, but this could be improved
        assert response.status_code == 200

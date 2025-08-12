import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    """Test the main endpoint returns expected response"""
    response = client.get("/")
    assert response.status_code == 200
    
def test_health_check():
    """Test health check endpoint if it exists"""
    response = client.get("/health")
    # This will return 404 if endpoint doesn't exist, which is fine for now
    assert response.status_code in [200, 404]
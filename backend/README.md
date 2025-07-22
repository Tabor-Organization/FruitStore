# Fruit Store Backend

This is the backend for the Fruit Store webapp, built with FastAPI and MongoDB.

## Setup

1. Create a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```powershell
   pip install fastapi uvicorn pymongo
   ```
3. Start the server:
   ```powershell
   uvicorn main:app --reload
   ```

## MongoDB
- Make sure MongoDB is running locally or update the connection string in `main.py`.

## Endpoints
- `/fruits` - CRUD for fruits
- `/orders` - CRUD for orders

---

# Fruit Store Webapp

This project is a simple web application for buying fruits (apples, bananas, oranges, grapes).

## Tech Stack
- **Frontend:** Vite + TypeScript (SPA)
- **Backend:** FastAPI (Python)
- **Database:** MongoDB

## Features
- View available fruits
- Add fruits to cart
- Place orders
- CRUD operations for fruits and orders

## Getting Started

### Frontend
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```

### Backend
1. Navigate to the `backend` folder:
   ```powershell
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```powershell
   uvicorn main:app --reload
   ```

### MongoDB
- Make sure MongoDB is running locally or update the connection string in `backend/main.py`.

---

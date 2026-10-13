# ShopKart Backend API

Express & Mongoose REST API powering the **ShopKart** full-stack e-commerce lab project.

## Features

- **JWT Authentication**: Secure token generation stored in `httpOnly` cookies with Bcrypt password hashing.
- **MongoDB Atlas Integration**: Automated collection seeding, transactional order creation, and stock updates.
- **RESTful Endpoints**:
  - `/customers`: Registration, Login, Current User (`/me`), and Logout.
  - `/products`: Catalog listing with search, category filtering, price sorting, and details by ID.
  - `/wishlist`: Customer wishlist management (get, add, remove).
  - `/cart`: Cart manipulation with stock boundary verification and quantity adjustments.
  - `/orders`: Payment order generation, Razorpay HMAC-SHA256 signature verification, and order history.
- **Razorpay Test Mode Integration**: Secure order generation and webhook-free client verification with cryptographic signature validation.

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `FRONTEND_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |
| `MONGO_URI` | MongoDB connection URI | `mongodb+srv://<user>:<password>@cluster0...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Mode Key Secret | `your_secret_key` |

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit backend/.env with your MongoDB Atlas URI and Razorpay keys
   ```

3. **Start the API**:
   ```bash
   npm start
   # Or with nodemon:
   npm run dev
   ```

4. **Run Automated Tests**:
   ```bash
   npm test
   ```

# ShopKart - Full-Stack E-Commerce Lab Project

[![Node.js Version](https://img.shields.io/badge/Node.js-20.19%2B%20%7C%2022.12%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

**ShopKart** is a full-stack MERN e-commerce web application engineered for the trimester lab submission. It provides a complete e-commerce experience including user authentication with HTTP-only cookies, dynamic catalog browsing with search and filtering, a persistent wishlist, real-time stock-validated shopping cart, Razorpay Test Mode checkout with HMAC-SHA256 signature verification, and complete order history tracking.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Setup & Installation](#local-setup--installation)
- [Automated Testing & Quality Checks](#automated-testing--quality-checks)
- [API Endpoints Reference](#api-endpoints-reference)
- [Deployment Guide](#deployment-guide)
- [Security & Submission Compliance](#security--submission-compliance)

---

## Features

- **Authentication & Security**:
  - Customer registration and login with input validation.
  - Password hashing via Bcrypt (10 salt rounds).
  - JWT issued in HTTP-only, secure, `sameSite` cookies (passwords excluded from serialization).
  - Protected route middleware for private dashboard and checkout access.

- **Product Catalog & Discovery**:
  - Live search by product name with regex sanitization.
  - Category-based filtering (Electronics, Fashion, Books, Home).
  - Price sorting (ascending & descending).
  - Automated initial database seeding with rich product information and images.

- **Wishlist & Cart Management**:
  - Persistent user wishlist saved to MongoDB Atlas.
  - Dynamic shopping cart with quantity adjustments and stock boundary enforcement.
  - Immediate stock checks preventing over-ordering beyond warehouse availability.

- **Checkout & Payment Integration**:
  - Razorpay Test Mode checkout modal integration.
  - Server-side order creation calculating amounts securely in paise.
  - Cryptographic HMAC-SHA256 signature verification on payment success.
  - MongoDB transactional stock deduction upon verified payment.

- **Order Management & Profile**:
  - Order tracking with status indicators (`PENDING_PAYMENT`, `PAID`, `CANCELLED`).
  - Itemized order breakdown showing purchase-time price snapshots and shipping details.
  - User profile with personal information and secure session logout.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Axios, Modern Responsive CSS |
| **Backend** | Node.js, Express 5, Mongoose 9, Bcrypt, JsonWebToken, Cookie-Parser, Cors |
| **Database** | MongoDB Atlas (Cloud Replica Set) |
| **Payments** | Razorpay SDK & Razorpay Checkout Modal (Test Mode) |
| **Testing & Quality** | Node.js Native Test Runner (`node --test`), Oxlint |

---

## Project Architecture

```
shopKart/
├── backend/
│   ├── config/              # Razorpay and DB configurations
│   ├── controllers/         # Business logic (customer, product, cart, wishlist, order)
│   ├── middlewares/         # JWT authentication guard
│   ├── models/              # Mongoose data schemas (Customer, Product, Order)
│   ├── routes/              # Express route declarations
│   ├── tests/               # Automated unit & integration tests
│   ├── utils/               # Token generation, signature verifier
│   ├── .env.example         # Environment template for backend
│   ├── index.js             # Server entrypoint and Atlas connection
│   └── package.json
│
├── frontend/
│   ├── public/              # SVG icons & static assets
│   ├── src/
│   │   ├── api/             # Axios instance configured with credentials & base URL
│   │   ├── assets/          # Static images & graphics
│   │   ├── components/      # Reusable UI (Navbar, Footer, ProductCard, Layout)
│   │   ├── context/         # CartContext & provider
│   │   ├── hooks/           # useCart custom hook
│   │   ├── pages/           # Home, Products, Cart, Checkout, Orders, Profile, etc.
│   │   ├── routes/          # ProtectedRoute guard
│   │   ├── App.jsx          # Route definitions
│   │   ├── index.css        # Responsive stylesheet
│   │   └── main.jsx         # React application root
│   ├── .env.example         # Environment template for frontend
│   ├── index.html
│   └── package.json
│
├── .gitignore               # Multi-layer exclusion of secrets, keys, and build files
├── README.md                # Project documentation
└── package.json             # Root monorepo scripts
```

---

## Prerequisites

- **Node.js**: `v20.19.0+` or `v22.12.0+`
- **npm**: `v10.0.0+`
- **MongoDB Atlas** connection string or local MongoDB instance
- **Razorpay Test Mode** Key ID and Key Secret (from [Razorpay Dashboard](https://dashboard.razorpay.com/))

---

## Environment Configuration

In strict adherence to security requirements, **no real credentials, private keys, or `.env` files are pushed to GitHub**.

### 1. Backend (`backend/.env`)

Copy the template:
```bash
cp backend/.env.example backend/.env
# On Windows PowerShell:
# Copy-Item backend\.env.example backend\.env
```

Populate the values:
```env
PORT=5000
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.yfig0qn.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

### 2. Frontend (`frontend/.env`)

Copy the template:
```bash
cp frontend/.env.example frontend/.env
# On Windows PowerShell:
# Copy-Item frontend\.env.example frontend\.env
```

Populate the values:
```env
VITE_API_URL=http://localhost:5000
```

---

## Local Setup & Installation

### Option A: Running with Monorepo Root Commands

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start Backend**:
   ```bash
   npm run start:backend
   # Or for development with auto-reload:
   npm run dev:backend
   ```

3. **Start Frontend** (in a separate terminal):
   ```bash
   npm run dev:frontend
   ```

---

### Option B: Running Services Individually

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *The API will listen at `http://localhost:5000` and automatically connect to MongoDB Atlas.*

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The client will launch at `http://localhost:5173`.*

---

## Automated Testing & Quality Checks

Run the complete test suite and linters to verify code health:

### 1. Backend Tests
Executes unit tests verifying schema validations, password omission, cart boundaries, and Razorpay HMAC cryptographic verification:
```bash
npm run test:backend
# Or inside backend/:
npm test
```

### 2. Frontend Build & Lint
Ensures strict bundle generation and zero linter warnings:
```bash
npm run build:frontend
npm run lint:frontend
# Or inside frontend/:
npm run build
npm run lint
```

---

## API Endpoints Reference

### Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/customers/register` | Register customer with name, email, phone, password | No |
| `POST` | `/customers/login` | Authenticate customer and set HTTP-only cookie | No |
| `GET` | `/customers/me` | Retrieve profile of currently authenticated user | Yes |
| `POST` | `/customers/logout` | Clear session cookie | Yes |

### Products (`/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/products` | Query products (`?search=`, `?category=`, `?sort=`) | No |
| `GET` | `/products/:id` | Fetch single product by ID | No |
| `POST` | `/products` | Create a product entry | No |

### Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/wishlist` | Get user's saved wishlist items | Yes |
| `POST` | `/wishlist/:productId` | Add a product to wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove a product from wishlist | Yes |

### Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/cart` | Retrieve user cart with populated products | Yes |
| `POST` | `/cart/:productId` | Increment/add item to cart with stock validation | Yes |
| `PATCH` | `/cart/:productId` | Update item quantity (`{ quantity }`) | Yes |
| `DELETE` | `/cart/:productId` | Remove item from cart | Yes |

### Orders & Payments (`/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/orders/create-payment-order` | Validate stock, address & create Razorpay order | Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC signature and commit inventory | Yes |
| `GET` | `/orders` | List customer order history | Yes |
| `GET` | `/orders/:id` | Get details and item breakdown for a specific order | Yes |

---

## Deployment Guide

### Backend (e.g., Render, Railway)
1. Deploy the `backend/` directory as a Node Web Service.
2. Build Command: `npm install`
3. Start Command: `node index.js`
4. Set Environment Variables in your provider's dashboard:
   - `PORT=5000`
   - `MONGO_URI=<your-atlas-uri>`
   - `JWT_SECRET=<your-secret>`
   - `RAZORPAY_KEY_ID=<your-test-key-id>`
   - `RAZORPAY_KEY_SECRET=<your-test-key-secret>`
   - `FRONTEND_ORIGINS=https://<your-frontend-domain>.vercel.app`

### Frontend (e.g., Vercel, Netlify)
1. Deploy the `frontend/` directory.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variables:
   - `VITE_API_URL=https://<your-backend-domain>.onrender.com`

---

## Security & Submission Compliance

- [x] **Repository**: Hosted at [https://github.com/Sam-272007/ShopKart-Lab-Project](https://github.com/Sam-272007/ShopKart-Lab-Project).
- [x] **No Secrets Committed**: All `.env`, API keys, and credentials are rigorously excluded via `.gitignore` and audited across Git history.
- [x] **Working Database**: Integrated with MongoDB Atlas with schema models and automated seeding.
- [x] **Tested & Verified**: Backend automated test suite passing (9/9), frontend building and linting with zero errors.
- [x] **Setup Instructions**: Comprehensive setup guides provided for both monorepo and individual microservices.

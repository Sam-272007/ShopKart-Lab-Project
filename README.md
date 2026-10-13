# ShopKart

ShopKart is a MERN engineering lab project. It keeps the original customer authentication and product catalog, then adds a persistent wishlist, stock-validated cart, and Razorpay Test Mode checkout with order history.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB connection string
- Razorpay Test Mode API keys for completing checkout

## Setup

Create the backend environment file from the template and set private values locally:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in `backend\.env`. Razorpay credentials must be Test Mode keys. Do not expose or commit `RAZORPAY_KEY_SECRET`.

Install dependencies and start the services in separate terminals:

```powershell
cd backend
npm install
npm start
```

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

## Validation

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm run build
npm run lint
```

## Main routes

- `/register`, `/login`, `/home`
- `/products`, `/products/:id`
- `/wishlist`, `/cart`, `/checkout`
- `/orders`, `/orders/:id`, `/order-success/:id`

Razorpay credentials are intentionally not included in this repository. Without Test Mode keys, order creation responds with an explicit configuration error; all other API and UI flows remain available.

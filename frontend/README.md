# ShopKart Frontend

The modern, responsive client-side web application for **ShopKart**, built with React 19, Vite, React Router 7, and modern CSS.

## Features

- **Authentication Flow**: User registration and login with session persistence using secure HTTP-only cookies.
- **Product Catalog**: Dynamic catalog with real-time text search, category filtering, and price sorting.
- **Product Details**: Comprehensive product view with real-time stock availability, descriptions, and high-res imagery.
- **Persistent Wishlist**: Save favorite items across sessions with instantaneous add/remove toggles.
- **Stock-Validated Cart**: Dynamic cart with quantity increments, real-time subtotal calculation, and stock boundary checks.
- **Razorpay Checkout**: Seamless integration with Razorpay Checkout modal for mock payments.
- **Order Tracking**: Detailed purchase history and per-order breakdown with payment verification status.
- **Customer Profile**: Profile dashboard displaying account details and one-click secure logout.

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to point to your backend API (defaults to `http://localhost:5000`).

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Production build**:
   ```bash
   npm run build
   ```

5. **Linting**:
   ```bash
   npm run lint
   ```

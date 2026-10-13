const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const Product = require("./models/product.model");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = new Set(
    (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        try {
            const host = new URL(origin).hostname;
            if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) {
                return callback(null, true);
            }
        } catch {
            // ignore url parsing error
        }
        return callback(null, true);
    },
    credentials: true
}));

const seedProducts = async () => {
    const productCount = await Product.countDocuments();

    if (productCount > 0) {
        return;
    }

    const sampleProducts = [
        {
            name: "Aurora Wireless Headphones",
            description: "Premium noise-cancelling headphones with a 30-hour battery life and immersive sound.",
            price: 12999,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
            stock: 18
        },
        {
            name: "Luna Everyday Backpack",
            description: "A lightweight backpack designed for daily commutes, travel, and quick getaways.",
            price: 4499,
            category: "Fashion",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
            stock: 26
        },
        {
            name: "Summit Ceramic Coffee Set",
            description: "A modern ceramic coffee set for slow mornings and cozy gatherings at home.",
            price: 2899,
            category: "Home",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
            stock: 12
        },
        {
            name: "Cinderhill Fiction Bundle",
            description: "A curated bundle of bestselling fiction picks for readers who enjoy atmospheric stories.",
            price: 1999,
            category: "Books",
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
            stock: 31
        },
        {
            name: "Orbit Smart Watch",
            description: "Track workouts, sleep, and notifications with a sleek design built for daily life.",
            price: 8999,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
            stock: 15
        },
        {
            name: "Harbor Knit Throw",
            description: "Soft, premium knit throw that adds warmth and texture to any living space.",
            price: 3299,
            category: "Home",
            image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80",
            stock: 20
        }
    ];

    await Product.insertMany(sampleProducts);
    console.log("Seeded default products");
};

// Database connection helper
let isConnected = false;
const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
    await seedProducts();
};

// Ensure database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Routes mounted at root and at /api for Vercel Services compatibility
const mountRoutes = (prefix = "") => {
    app.use(`${prefix}/customers`, customerRoutes);
    app.use(`${prefix}/products`, productRoutes);
    app.use(`${prefix}/wishlist`, wishlistRoutes);
    app.use(`${prefix}/cart`, cartRoutes);
    app.use(`${prefix}/orders`, orderRoutes);

    app.get(`${prefix}/test-route`, (req, res) => {
        res.json({ message: "Routes are working" });
    });

    app.get(prefix || "/", (req, res) => {
        res.json({ message: "ShopKart Backend is running" });
    });
};

mountRoutes("");
mountRoutes("/api");

// Local development server listener
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to start server:", error.message);
        });
}

module.exports = app;
 
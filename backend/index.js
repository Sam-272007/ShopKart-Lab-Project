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
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
}));

// Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/test-route", (req, res) => {
    res.json({
        message: "Routes are working"
    });
});
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "ShopKart Backend is running"
    });
});

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected");
        await seedProducts();

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    }); 
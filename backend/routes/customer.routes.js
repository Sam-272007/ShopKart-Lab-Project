const express = require("express");

const {
    registerCustomer,
    loginCustomer
} = require("../controllers/customer.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

router.get("/me", authMiddleware, (req, res) => {
    const customer = req.user.toObject();
    delete customer.password;

    res.status(200).json({
        success: true,
        customer
    });
});

router.post("/logout", authMiddleware, (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
});

module.exports = router;
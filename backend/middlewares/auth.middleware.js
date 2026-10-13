const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    try {
        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        req.user = customer;
        return next();
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to authenticate request"
        });
    }
};

module.exports = authMiddleware;
const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body || {};

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof phone !== "string" ||
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingCustomer = await Customer.findOne({ email: normalizedEmail });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone.trim()
        });

        const customerResponse = customer.toObject();
        delete customerResponse.password;

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: customerResponse
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to register customer"
        });
    }
};


const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const customer = await Customer.findOne({ email: email.trim().toLowerCase() });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(customer._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        const customerResponse = customer.toObject();
        delete customerResponse.password;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            customer: customerResponse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to log in"
        });
    }
};


module.exports = {
    registerCustomer,
    loginCustomer
};
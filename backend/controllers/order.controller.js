const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const getRazorpayClient = require("../config/razorpay");
const isValidPaymentSignature = require("../utils/paymentSignature");

const shippingFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const validateShippingAddress = (address) => {
    if (!address || typeof address !== "object" || Array.isArray(address)) {
        return "Shipping address is required";
    }

    for (const field of shippingFields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            return `${field} is required`;
        }
    }

    if (!isValidPhone(address.phone.trim())) {
        return "Phone number must be a valid 10-digit Indian mobile number";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
        return "Pincode must contain 6 digits";
    }

    return null;
};

const createPaymentOrder = async (req, res) => {
    const addressError = validateShippingAddress(req.body?.shippingAddress);

    if (addressError) {
        return res.status(400).json({
            success: false,
            message: addressError
        });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
        return res.status(503).json({
            success: false,
            message: "Razorpay Test Mode is not configured on the server"
        });
    }

    try {
        const user = await Customer.findById(req.user._id);
        if (!user || !user.cart?.length) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const productIds = user.cart.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productsById = new Map(products.map((product) => [product._id.toString(), product]));
        const orderItems = [];
        let totalPaise = 0;

        for (const cartItem of user.cart) {
            const product = productsById.get(cartItem.product.toString());

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                });
            }

            if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemPaise = Math.round(product.price * 100) * cartItem.quantity;
            if (!Number.isSafeInteger(itemPaise) || itemPaise <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${product.name}`
                });
            }
            totalPaise += itemPaise;
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
        }

        if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to calculate a valid order total"
            });
        }

        const order = await Order.create({
            user: user._id,
            items: orderItems,
            shippingAddress: Object.fromEntries(
                shippingFields.map((field) => [field, req.body.shippingAddress[field].trim()])
            ),
            totalAmount: totalPaise / 100,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        try {
            const razorpayOrder = await razorpay.orders.create({
                amount: totalPaise,
                currency: "INR",
                receipt: order._id.toString()
            });

            order.razorpayOrderId = razorpayOrder.id;
            await order.save();

            return res.status(201).json({
                success: true,
                shopKartOrderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: totalPaise,
                currency: "INR",
                key: process.env.RAZORPAY_KEY_ID.trim()
            });
        } catch {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(502).json({
                success: false,
                message: "Unable to create a Razorpay payment order. Your cart is unchanged."
            });
        }
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to create payment order"
        });
    }
};

const verifyPayment = async (req, res) => {
    const {
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
    } = req.body || {};

    if (
        typeof shopKartOrderId !== "string" ||
        !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
        typeof razorpayOrderId !== "string" ||
        typeof razorpayPaymentId !== "string" ||
        typeof razorpaySignature !== "string" ||
        !/^[a-f\d]{64}$/i.test(razorpaySignature)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment details"
        });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId?.startsWith("rzp_test_") || !keySecret) {
        return res.status(503).json({
            success: false,
            message: "Razorpay Test Mode is not configured on the server"
        });
    }

    try {
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Payment order does not match"
            });
        }

        if (!isValidPaymentSignature(
            order.razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            keySecret
        )) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        if (order.paymentStatus === "PAID") {
            if (order.razorpayPaymentId !== razorpayPaymentId) {
                return res.status(409).json({
                    success: false,
                    message: "Order has already been paid"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const currentOrder = await Order.findOne({
                    _id: order._id,
                    user: req.user._id
                }).session(session);

                if (!currentOrder) {
                    throw new Error("Order not found during payment verification");
                }

                if (currentOrder.paymentStatus !== "PAID") {
                    currentOrder.paymentStatus = "PAID";
                    currentOrder.status = "PLACED";
                    currentOrder.razorpayPaymentId = razorpayPaymentId;
                    await currentOrder.save({ session });
                    await Customer.updateOne(
                        { _id: req.user._id },
                        { $set: { cart: [] } },
                        { session }
                    );
                }
            });
        } finally {
            await session.endSession();
        }

        const confirmedOrder = await Order.findById(order._id);
        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order: confirmedOrder
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to verify payment"
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load orders"
        });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    try {
        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load order"
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById,
    validateShippingAddress
};

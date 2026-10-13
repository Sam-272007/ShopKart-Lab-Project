const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const cartProductFields = "name description price category image stock createdAt";

const sendCart = async (res, user, statusCode = 200, message) => {
    await user.populate({
        path: "cart.product",
        select: cartProductFields
    });

    const response = {
        success: true,
        cart: user.cart
    };
    if (message) {
        response.message = message;
    }

    return res.status(statusCode).json(response);
};

const loadCurrentUser = (userId) => Customer.findById(userId).select("cart");

const getCart = async (req, res) => {
    try {
        const user = await loadCurrentUser(req.user._id);
        return await sendCart(res, user);
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load cart"
        });
    }
};

const addToCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(productId).select("stock");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let added = false;
        for (let attempt = 0; attempt < 3 && !added; attempt += 1) {
            const user = await loadCurrentUser(req.user._id);
            const cartItem = (user?.cart || []).find((item) => item.product.equals(product._id));

            if ((cartItem?.quantity || 0) + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            const filter = cartItem
                ? {
                    _id: req.user._id,
                    cart: { $elemMatch: { product: product._id, quantity: cartItem.quantity } }
                }
                : {
                    _id: req.user._id,
                    cart: { $not: { $elemMatch: { product: product._id } } }
                };
            const update = cartItem
                ? { $inc: { "cart.$.quantity": 1 } }
                : { $push: { cart: { product: product._id, quantity: 1 } } };
            const result = await Customer.updateOne(filter, update);
            added = result.modifiedCount === 1;
        }

        if (!added) {
            return res.status(409).json({
                success: false,
                message: "Cart changed while updating. Please try again."
            });
        }

        const user = await loadCurrentUser(req.user._id);
        return await sendCart(res, user, 200, "Cart updated");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to update cart"
        });
    }
};

const updateCartQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    try {
        const product = await Product.findById(productId).select("stock");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        const result = await Customer.updateOne(
            { _id: req.user._id, "cart.product": product._id },
            { $set: { "cart.$.quantity": quantity } }
        );

        if (result.modifiedCount === 0) {
            const exists = await Customer.exists({
                _id: req.user._id,
                "cart.product": product._id
            });
            if (!exists) {
                return res.status(404).json({
                    success: false,
                    message: "Product is not in the cart"
                });
            }
        }

        const user = await loadCurrentUser(req.user._id);
        return await sendCart(res, user, 200, "Cart quantity updated");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to update cart"
        });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const result = await Customer.updateOne(
            { _id: req.user._id, "cart.product": productId },
            { $pull: { cart: { product: productId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart"
            });
        }

        const user = await loadCurrentUser(req.user._id);
        return await sendCart(res, user, 200, "Product removed from cart");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to update cart"
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart
};

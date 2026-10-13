const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const wishlistProductFields = "name description price category image stock createdAt";

const getWishlist = async (req, res) => {
    try {
        await req.user.populate({
            path: "wishlist",
            select: wishlistProductFields
        });

        return res.status(200).json({
            success: true,
            count: req.user.wishlist.length,
            wishlist: req.user.wishlist
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load wishlist"
        });
    }
};

const addToWishlist = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const updatedCustomer = await Customer.findOneAndUpdate(
            {
                _id: req.user._id,
                wishlist: { $ne: product._id }
            },
            { $addToSet: { wishlist: product._id } },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(409).json({
                success: false,
                message: "Product is already in the wishlist"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to update wishlist"
        });
    }
};

const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const itemIndex = (req.user.wishlist || []).findIndex((id) => id.equals(productId));

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the wishlist"
            });
        }

        req.user.wishlist.splice(itemIndex, 1);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to update wishlist"
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};

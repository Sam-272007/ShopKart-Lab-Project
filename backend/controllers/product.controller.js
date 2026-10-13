const mongoose = require("mongoose");
const Product = require("../models/product.model");

const productFields = "name description price category image stock createdAt";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product data",
                errors: Object.values(error.errors || {}).map((item) => item.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create product"
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const query = {};

        if (search && search.trim()) {
            query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        if (category && category.trim()) {
            query.category = category.trim();
        }

        let productsQuery = Product.find(query).select(productFields);

        if (sort === "price_asc") {
            productsQuery = productsQuery.sort({ price: 1 });
        } else if (sort === "price_desc") {
            productsQuery = productsQuery.sort({ price: -1 });
        }

        const products = await productsQuery;

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load products"
        });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(id).select(productFields);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to load product"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById
};

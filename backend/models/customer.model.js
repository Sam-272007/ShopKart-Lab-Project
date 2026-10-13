const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        }
    }]
});

customerSchema.set("toJSON", {
    transform: (_document, result) => {
        delete result.password;
        return result;
    }
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
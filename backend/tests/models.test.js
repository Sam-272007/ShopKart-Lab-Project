const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const getValidationError = async (document) => {
    try {
        await document.validate();
        return null;
    } catch (error) {
        return error;
    }
};

test("customer schema requires authentication fields and defaults feature collections", async () => {
    const customer = new Customer();
    const validation = await getValidationError(customer);

    assert.ok(validation.errors.fullName);
    assert.ok(validation.errors.email);
    assert.ok(validation.errors.password);
    assert.ok(validation.errors.phone);
    assert.ok(customer.createdAt instanceof Date);
    assert.deepEqual(customer.wishlist, []);
    assert.deepEqual(customer.cart, []);
});

test("customer JSON serialization never includes the password", () => {
    const customer = new Customer({
        fullName: "Test Customer",
        email: "test@example.com",
        password: "hashed-password",
        phone: "9876543210"
    });

    assert.equal(Object.hasOwn(customer.toJSON(), "password"), false);
});

test("product schema enforces required fields, positive price, and nonnegative stock", async () => {
    const missingFields = await getValidationError(new Product());
    assert.ok(missingFields.errors.name);
    assert.ok(missingFields.errors.description);
    assert.ok(missingFields.errors.category);
    assert.ok(missingFields.errors.image);
    assert.ok(missingFields.errors.price);
    assert.ok(missingFields.errors.stock);

    const invalidProduct = new Product({
        name: "Invalid",
        description: "Invalid product",
        category: "Electronics",
        image: "https://example.test/item.png",
        price: 0,
        stock: -1
    });
    const invalidProductValidation = await getValidationError(invalidProduct);
    assert.ok(invalidProductValidation.errors.price);
    assert.ok(invalidProductValidation.errors.stock);

    const validProduct = new Product({
        name: "Valid",
        description: "Valid product",
        category: "Electronics",
        image: "https://example.test/item.png",
        price: 1,
        stock: 0
    });
    assert.equal(await getValidationError(validProduct), null);
});

test("cart schema rejects quantities below one", async () => {
    const customer = new Customer({
        fullName: "Test Customer",
        email: "cart@example.com",
        password: "hashed-password",
        phone: "9876543210",
        cart: [{ product: new mongoose.Types.ObjectId(), quantity: 0 }]
    });

    assert.ok((await getValidationError(customer)).errors["cart.0.quantity"]);
});

test("order model requires purchase-time item snapshots and shipping details", async () => {
    const order = new Order();
    const validation = await getValidationError(order);

    assert.ok(validation.errors.user);
    assert.ok(validation.errors.items);
    assert.ok(validation.errors.shippingAddress);
    assert.ok(validation.errors.totalAmount);
    assert.equal(order.paymentStatus, "PENDING");
    assert.equal(order.status, "PENDING_PAYMENT");
});

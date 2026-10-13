const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const isValidPaymentSignature = require("../utils/paymentSignature");
const {
    createPaymentOrder,
    verifyPayment,
    validateShippingAddress
} = require("../controllers/order.controller");

const createMockResponse = () => ({
    statusCode: null,
    body: null,
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

test("payment order returns a configuration error when Test Mode credentials are missing", async () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const missingCredentialCases = [
        { RAZORPAY_KEY_ID: "rzp_test_your_key_id", RAZORPAY_KEY_SECRET: "" },
        { RAZORPAY_KEY_ID: "", RAZORPAY_KEY_SECRET: "your_test_key_secret" }
    ];

    try {
        for (const credentials of missingCredentialCases) {
            Object.assign(process.env, credentials);
            const response = createMockResponse();

            await createPaymentOrder({
                body: {
                    shippingAddress: {
                        fullName: "Aarav Sharma",
                        phone: "9876543210",
                        addressLine1: "22 MG Road",
                        city: "Bengaluru",
                        state: "Karnataka",
                        pincode: "560001"
                    }
                }
            }, response);

            assert.equal(response.statusCode, 503);
            assert.deepEqual(response.body, {
                success: false,
                message: "Razorpay Test Mode is not configured on the server"
            });
        }
    } finally {
        if (keyId === undefined) {
            delete process.env.RAZORPAY_KEY_ID;
        } else {
            process.env.RAZORPAY_KEY_ID = keyId;
        }
        if (keySecret === undefined) {
            delete process.env.RAZORPAY_KEY_SECRET;
        } else {
            process.env.RAZORPAY_KEY_SECRET = keySecret;
        }
    }
});

test("payment verification returns a configuration error when Test Mode credentials are missing", async () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    try {
        const response = createMockResponse();
        await verifyPayment({
            body: {
                shopKartOrderId: "507f1f77bcf86cd799439011",
                razorpay_order_id: "order_test_123",
                razorpay_payment_id: "pay_test_456",
                razorpay_signature: "0".repeat(64)
            }
        }, response);

        assert.equal(response.statusCode, 503);
        assert.deepEqual(response.body, {
            success: false,
            message: "Razorpay Test Mode is not configured on the server"
        });
    } finally {
        if (keyId === undefined) {
            delete process.env.RAZORPAY_KEY_ID;
        } else {
            process.env.RAZORPAY_KEY_ID = keyId;
        }
        if (keySecret === undefined) {
            delete process.env.RAZORPAY_KEY_SECRET;
        } else {
            process.env.RAZORPAY_KEY_SECRET = keySecret;
        }
    }
});

test("shipping address rejects whitespace, invalid mobile numbers, and invalid pincodes", () => {
    const address = {
        fullName: "Aarav Sharma",
        phone: "9876543210",
        addressLine1: "22 MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001"
    };

    assert.equal(validateShippingAddress(address), null);
    assert.match(validateShippingAddress({ ...address, city: "  " }), /city is required/i);
    assert.match(validateShippingAddress({ ...address, phone: "12345" }), /phone number/i);
    assert.match(validateShippingAddress({ ...address, pincode: "56001" }), /6 digits/i);
});

test("Razorpay HMAC verification accepts a valid signature and rejects a forged one", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const secret = "test-secret";
    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    assert.equal(isValidPaymentSignature(orderId, paymentId, signature, secret), true);
    assert.equal(isValidPaymentSignature(orderId, paymentId, "0".repeat(64), secret), false);
    assert.equal(isValidPaymentSignature(orderId, paymentId, "short", secret), false);
});

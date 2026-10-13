const Razorpay = require("razorpay");

const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId?.startsWith("rzp_test_") || !keySecret) {
        return null;
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

module.exports = getRazorpayClient;

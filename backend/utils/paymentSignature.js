const crypto = require("crypto");

const isValidPaymentSignature = (orderId, paymentId, signature, secret) => {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest();
    const received = Buffer.from(signature, "hex");

    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};

module.exports = isValidPaymentSignature;

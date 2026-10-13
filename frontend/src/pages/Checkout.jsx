import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import useCart from "../hooks/useCart";
import api from "../api/axios";

const emptyAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true);
        return;
    }

    document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')?.remove();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
        script.remove();
        resolve(false);
    };
    document.body.appendChild(script);
});

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, loading: cartLoading, error: cartError, clearCart } = useCart();
    const [address, setAddress] = useState(emptyAddress);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const availableItems = cartItems.filter((item) => item.product);
    const total = availableItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleChange = (event) => {
        setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
        setFieldErrors((current) => ({ ...current, [event.target.name]: "" }));
    };

    const validateAddress = () => {
        const errors = {};
        Object.entries(address).forEach(([field, value]) => {
            if (!value.trim()) {
                errors[field] = "This field is required.";
            }
        });
        if (address.phone.trim() && !/^[6-9]\d{9}$/.test(address.phone.trim())) {
            errors.phone = "Enter a valid 10-digit Indian mobile number.";
        }
        if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
            errors.pincode = "Pincode must contain 6 digits.";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!validateAddress()) {
            return;
        }
        if (availableItems.length === 0) {
            setError("Your cart is empty. Add products before checkout.");
            return;
        }

        setLoading(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded || !window.Razorpay) {
                throw new Error("Unable to load Razorpay Checkout. Check your connection and try again.");
            }

            const response = await api.post("/orders/create-payment-order", {
                shippingAddress: address
            });
            const checkoutData = response.data;
            const payment = new window.Razorpay({
                key: checkoutData.key,
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: checkoutData.razorpayOrderId,
                prefill: {
                    name: address.fullName,
                    contact: address.phone
                },
                modal: {
                    ondismiss: () => {
                        setError("Checkout was cancelled. Your cart has not been cleared.");
                        setLoading(false);
                    }
                },
                handler: async (paymentResponse) => {
                    try {
                        const verification = await api.post("/orders/verify-payment", {
                            shopKartOrderId: checkoutData.shopKartOrderId,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });
                        clearCart();
                        navigate(`/order-success/${verification.data.order._id}`);
                    } catch (verificationError) {
                        setError(verificationError.response?.data?.message || "Payment verification failed. Your cart has not been cleared.");
                    } finally {
                        setLoading(false);
                    }
                },
                theme: { color: "#243b68" }
            });

            payment.on("payment.failed", () => {
                setError("Payment failed. Your cart has not been cleared. Please try again.");
                setLoading(false);
            });
            payment.open();
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || "Unable to start checkout.");
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <section className="feature-page page-container">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Secure checkout</p>
                        <h1>Checkout</h1>
                    </div>
                    <Link className="text-link" to="/cart">← Back to cart</Link>
                </div>
                {cartLoading && <p className="state-message">Loading your cart...</p>}
                {!cartLoading && cartError && <p className="state-message error" role="alert">{cartError}</p>}
                {!cartLoading && !cartError && cartItems.length === 0 && (
                    <div className="empty-state surface-card">
                        <h2>Your cart is empty</h2>
                        <p>Add products before continuing to checkout.</p>
                        <Link className="button button-primary" to="/products">Browse Products</Link>
                    </div>
                )}
                {!cartLoading && cartItems.length > 0 && (
                    <div className="checkout-layout">
                        <form className="checkout-form surface-card" onSubmit={handleSubmit} noValidate>
                            <h2>Shipping Details</h2>
                            <div className="checkout-fields">
                                {[
                                    ["fullName", "Full Name"],
                                    ["phone", "Phone Number"],
                                    ["addressLine1", "Address Line"],
                                    ["city", "City"],
                                    ["state", "State"],
                                    ["pincode", "Pincode"]
                                ].map(([field, label]) => (
                                    <div className={`form-field ${field === "addressLine1" ? "field-wide" : ""}`} key={field}>
                                        <label htmlFor={`shipping-${field}`}>{label}</label>
                                        <input
                                            id={`shipping-${field}`}
                                            name={field}
                                            type={field === "phone" || field === "pincode" ? "tel" : "text"}
                                            autoComplete={field === "addressLine1" ? "street-address" : field}
                                            value={address[field]}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(fieldErrors[field])}
                                            aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
                                        />
                                        {fieldErrors[field] && <p className="field-error" id={`${field}-error`}>{fieldErrors[field]}</p>}
                                    </div>
                                ))}
                            </div>
                            {error && <p className="error inline-message" role="alert">{error}</p>}
                            <button className="button button-primary" type="submit" disabled={loading || availableItems.length === 0}>
                                {loading ? "Starting secure payment..." : "Place Order"}
                            </button>
                        </form>
                        <aside className="cart-summary surface-card">
                            <p className="eyebrow">Review your items</p>
                            <h2>Order Summary</h2>
                            {availableItems.map((item) => (
                                <div className="checkout-summary-row" key={item.product._id}>
                                    <span>{item.product.name} × {item.quantity}</span>
                                    <strong>{`Rs. ${(item.product.price * item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</strong>
                                </div>
                            ))}
                            <div className="checkout-summary-total"><span>Total</span><strong>{`Rs. ${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</strong></div>
                            <p className="muted-copy">The server rechecks current product prices and stock before payment.</p>
                        </aside>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default Checkout;

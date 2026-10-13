import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import api from "../api/axios";

function OrderDetails() {
    const { id } = useParams();
    const location = useLocation();
    const isConfirmation = location.pathname.startsWith("/order-success/");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load this order.");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    return (
        <AuthenticatedLayout>
            <section className="feature-page page-container">
                {loading && <p className="state-message">Loading order...</p>}
                {!loading && error && <div className="state-panel"><p className="state-message error">{error}</p><Link className="button button-secondary" to="/orders">Back to My Orders</Link></div>}
                {!loading && order && (
                    <article className="order-detail surface-card">
                        {isConfirmation && <p className="eyebrow success">Payment verified</p>}
                        <p className="eyebrow">{isConfirmation ? "Order confirmation" : "Order details"}</p>
                        <h1>{isConfirmation ? "Order placed successfully" : `Order #${order._id}`}</h1>
                        {isConfirmation && <p>Your order has been saved successfully.</p>}
                        <dl className="order-detail-meta">
                            <div><dt>Order ID</dt><dd>{order._id}</dd></div>
                            <div><dt>Date</dt><dd>{new Date(order.createdAt).toLocaleString()}</dd></div>
                            <div><dt>Status</dt><dd>{order.status.replaceAll("_", " ")}</dd></div>
                            <div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div>
                            <div><dt>Total</dt><dd>{`Rs. ${order.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</dd></div>
                        </dl>
                        <h2>Items</h2>
                        <div className="order-item-list">
                            {order.items.map((item) => (
                                <div className="checkout-summary-row" key={`${item.product}-${item.name}`}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <strong>{`Rs. ${(item.price * item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="order-detail-actions">
                            <Link className="button button-primary" to="/orders">View My Orders</Link>
                            <Link className="button button-secondary" to="/products">Continue Shopping</Link>
                        </div>
                    </article>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default OrderDetails;

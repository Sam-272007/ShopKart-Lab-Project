import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import api from "../api/axios";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        const loadOrders = async () => {
            try {
                const response = await api.get("/orders");
                if (isCurrent) {
                    setOrders(response.data.orders);
                }
            } catch (requestError) {
                if (isCurrent) {
                    setError(requestError.response?.data?.message || "Unable to load your orders.");
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        };
        loadOrders();
        return () => {
            isCurrent = false;
        };
    }, [retryKey]);

    return (
        <AuthenticatedLayout>
            <section className="feature-page page-container">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Your purchase history</p>
                        <h1>My Orders</h1>
                    </div>
                </div>
                {loading && <p className="state-message">Loading your orders...</p>}
                {!loading && error && (
                    <div className="state-panel">
                        <p className="state-message error">{error}</p>
                        <button className="button button-secondary" type="button" onClick={() => { setLoading(true); setError(""); setRetryKey((key) => key + 1); }}>Try Again</button>
                    </div>
                )}
                {!loading && !error && orders.length === 0 && (
                    <div className="empty-state surface-card">
                        <h2>You have not placed any orders yet.</h2>
                        <p>Once you place an order, it will appear here.</p>
                        <Link className="button button-primary" to="/products">Start Shopping</Link>
                    </div>
                )}
                {!loading && !error && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article className="order-card surface-card" key={order._id}>
                                <div className="order-card-header">
                                    <div>
                                        <p className="eyebrow">Order #{order._id}</p>
                                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span>
                                </div>
                                <div className="order-item-list">
                                    {order.items.map((item) => <p key={`${item.product}-${item.name}`}>{item.name} × {item.quantity}</p>)}
                                </div>
                                <div className="order-card-footer">
                                    <strong>{`Total: Rs. ${order.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</strong>
                                    <Link className="button button-secondary" to={`/orders/${order._id}`}>View Details</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default Orders;

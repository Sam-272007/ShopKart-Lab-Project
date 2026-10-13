import { Link } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import useCart from "../hooks/useCart";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function Cart() {
    const { cartItems, loading, error, refreshCart, updateQuantity, removeFromCart } = useCart();
    const subtotal = cartItems.reduce((total, item) => (
        item.product ? total + item.product.price * item.quantity : total
    ), 0);

    return (
        <AuthenticatedLayout>
            <section className="feature-page page-container">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Ready when you are</p>
                        <h1>Shopping Cart</h1>
                    </div>
                    {!loading && <p className="product-count">{cartItems.reduce((count, item) => count + item.quantity, 0)} item(s)</p>}
                </div>
                {loading && <p className="state-message">Loading your cart...</p>}
                {!loading && error && (
                    <div className="state-panel cart-error-panel">
                        <p className="state-message error">{error}</p>
                        <button className="button button-secondary" type="button" onClick={() => refreshCart().catch(() => {})}>Try Again</button>
                    </div>
                )}
                {!loading && !error && cartItems.length === 0 && (
                    <div className="empty-state surface-card">
                        <p className="empty-state-icon" aria-hidden="true">🛒</p>
                        <h2>Your cart is empty</h2>
                        <p>Discover something you would love to take home.</p>
                        <Link className="button button-primary" to="/products">Browse Products</Link>
                    </div>
                )}
                {!loading && cartItems.length > 0 && (
                    <div className="cart-layout">
                        <div className="cart-list">
                            {cartItems.map((item) => (
                                <article className="cart-item surface-card" key={item.product?._id || item._id}>
                                    {item.product ? (
                                        <>
                                            <img src={item.product.image} alt={item.product.name} />
                                            <div className="cart-item-info">
                                                <h2>{item.product.name}</h2>
                                                <p>{item.product.category}</p>
                                                <strong>{formatPrice(item.product.price)}</strong>
                                                <div className="quantity-control" aria-label={`Quantity for ${item.product.name}`}>
                                                    <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1 || loading} onClick={() => updateQuantity(item.product._id, item.quantity - 1).catch(() => {})}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button type="button" aria-label="Increase quantity" disabled={item.quantity >= item.product.stock || loading} onClick={() => updateQuantity(item.product._id, item.quantity + 1).catch(() => {})}>+</button>
                                                </div>
                                                <button className="text-button danger-text" type="button" onClick={() => removeFromCart(item.product._id).catch(() => {})}>Remove</button>
                                            </div>
                                            <strong className="cart-line-total">{formatPrice(item.product.price * item.quantity)}</strong>
                                        </>
                                    ) : (
                                        <div className="cart-item-info">
                                            <h2>Unavailable product</h2>
                                            <p>This product is no longer available.</p>
                                            <button className="text-button danger-text" type="button" onClick={() => refreshCart().catch(() => {})}>Refresh cart</button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                        <aside className="cart-summary surface-card">
                            <p className="eyebrow">Order summary</p>
                            <h2>Subtotal</h2>
                            <p className="summary-total">{formatPrice(subtotal)}</p>
                            <p className="muted-copy">Final prices and stock will be checked again at checkout.</p>
                            <Link className="button button-primary" to="/checkout">Proceed to Checkout</Link>
                            <Link className="text-link" to="/products">Continue shopping</Link>
                        </aside>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default Cart;

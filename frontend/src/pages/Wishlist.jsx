import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import ProductCard from "../components/ProductCard";
import api from "../api/axios";

function Wishlist() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [removingId, setRemovingId] = useState("");
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        const loadWishlist = async () => {
            try {
                const response = await api.get("/wishlist");
                if (isCurrent) {
                    setProducts(response.data.wishlist);
                    setActionError("");
                }
            } catch (requestError) {
                if (isCurrent) {
                    setError(requestError.response?.data?.message || "Unable to load wishlist.");
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        };
        loadWishlist();
        return () => {
            isCurrent = false;
        };
    }, [retryKey]);

    const removeProduct = async (productId) => {
        setRemovingId(productId);
        setActionError("");
        try {
            await api.delete(`/wishlist/${productId}`);
            setProducts((current) => current.filter((product) => product._id !== productId));
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || "Unable to remove product from wishlist.");
        } finally {
            setRemovingId("");
        }
    };

    return (
        <AuthenticatedLayout>
            <section className="feature-page page-container">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Saved for later</p>
                        <h1>My Wishlist</h1>
                    </div>
                    {!loading && !error && <p className="product-count">{products.length} saved product{products.length === 1 ? "" : "s"}</p>}
                </div>
                {loading && <p className="state-message">Loading your wishlist...</p>}
                {!loading && error && (
                    <div className="state-panel">
                        <p className="state-message error">{error}</p>
                        <button className="button button-secondary" type="button" onClick={() => { setLoading(true); setError(""); setRetryKey((key) => key + 1); }}>Try Again</button>
                    </div>
                )}
                {!loading && actionError && <p className="error inline-message" role="alert">{actionError}</p>}
                {!loading && !error && products.length === 0 && (
                    <div className="empty-state surface-card">
                        <p className="empty-state-icon" aria-hidden="true">♡</p>
                        <h2>Your wishlist is empty</h2>
                        <p>Start saving products you love and find them here later.</p>
                        <Link className="button button-primary" to="/products">Browse Products</Link>
                    </div>
                )}
                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                showWishlistAction={false}
                                onRemoveWishlist={() => removeProduct(product._id)}
                                removingWishlist={removingId === product._id}
                            />
                        ))}
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default Wishlist;

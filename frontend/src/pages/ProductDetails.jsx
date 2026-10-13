import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import api from "../api/axios";
import useCart from "../hooks/useCart";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);
    const [savingWishlist, setSavingWishlist] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    "Something went wrong while loading this product."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        setAddingToCart(true);
        setActionError("");
        setActionMessage("");
        try {
            await addToCart(product._id);
            setActionMessage("Added to your cart.");
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || "Unable to add product to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        setSavingWishlist(true);
        setActionError("");
        setActionMessage("");
        try {
            await api.post(`/wishlist/${product._id}`);
            setWishlistAdded(true);
            setActionMessage("Added to your wishlist.");
        } catch (requestError) {
            if (requestError.response?.status === 409) {
                setWishlistAdded(true);
                setActionMessage("Already in your wishlist.");
            } else {
                setActionError(requestError.response?.data?.message || "Unable to save product.");
            }
        } finally {
            setSavingWishlist(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="products-page">
                <div className="details-content page-container">
                {loading && <p className="state-message">Loading product...</p>}
                {!loading && error && <p className="state-message error">{error}</p>}
                {!loading && !error && product && (
                    <article className="details-card">
                        <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.src = "https://placehold.co/800x800/e7edf8/243b68?text=ShopKart"; }} />
                        <div className="details-copy">
                            <Link className="back-link" to="/products">← Back to Products</Link>
                            <p className="product-category">{product.category}</p>
                            <h1>{product.name}</h1>
                            <p className="product-price">Rs. {product.price.toLocaleString()}</p>
                            <p className="description">{product.description}</p>
                            <p className={product.stock === 0 ? "out-of-stock" : "stock-status"}>
                                {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                            </p>
                            <div className="details-actions">
                                <button type="button" onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}>
                                    {addingToCart ? "Adding..." : "Add to Cart"}
                                </button>
                                <button className="button-secondary" type="button" onClick={handleAddToWishlist} disabled={savingWishlist || wishlistAdded}>
                                    {savingWishlist ? "Saving..." : wishlistAdded ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
                                </button>
                            </div>
                            {actionMessage && <p className="success" role="status">{actionMessage}</p>}
                            {actionError && <p className="error" role="alert">{actionError}</p>}
                        </div>
                    </article>
                )}
                {!loading && !error && !product && (
                    <p className="state-message">Product not found.</p>
                )}
                {error && (
                    <button type="button" className="secondary-button" onClick={() => navigate("/products")}>
                        Back to products
                    </button>
                )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default ProductDetails;

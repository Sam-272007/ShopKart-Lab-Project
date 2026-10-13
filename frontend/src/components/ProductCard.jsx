import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useCart from "../hooks/useCart";

function ProductCard({
    product,
    showWishlistAction = true,
    onRemoveWishlist,
    removingWishlist = false
}) {
    const navigate = useNavigate();
    const { cartItems, addToCart } = useCart();
    const [savingWishlist, setSavingWishlist] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const isInCart = cartItems.some((item) => item.product?._id === product._id);

    const handleAddToWishlist = async () => {
        setSavingWishlist(true);
        setActionMessage("");
        setActionError("");
        try {
            await api.post(`/wishlist/${product._id}`);
            setWishlistAdded(true);
            setActionMessage("Added to your wishlist.");
        } catch (error) {
            if (error.response?.status === 409) {
                setWishlistAdded(true);
                setActionMessage("Already in your wishlist.");
            } else {
                setActionError(error.response?.data?.message || "Unable to save product. Please try again.");
            }
        } finally {
            setSavingWishlist(false);
        }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        setActionMessage("");
        setActionError("");
        try {
            await addToCart(product._id);
            setActionMessage("Added to your cart.");
        } catch (error) {
            setActionError(error.response?.data?.message || "Unable to add product to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <article className="product-card">
            <div className="product-image-wrap">
                <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.src = "https://placehold.co/600x480/e7edf8/243b68?text=ShopKart"; }} />
                <span className="category-badge">{product.category}</span>
            </div>
            <div className="product-card-content">
                <h2>{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <p className="product-price">Rs. {product.price.toLocaleString()}</p>
                <p className={product.stock === 0 ? "out-of-stock" : "stock-status"}>
                    {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                </p>
                <div className="product-card-actions">
                    <button type="button" onClick={() => navigate(`/products/${product._id}`)}>View Details</button>
                    {showWishlistAction && (
                        <button
                            className="button-secondary"
                            type="button"
                            disabled={savingWishlist || wishlistAdded}
                            onClick={handleAddToWishlist}
                        >
                            {savingWishlist ? "Saving..." : wishlistAdded ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
                        </button>
                    )}
                    {onRemoveWishlist && (
                        <button className="button-secondary" type="button" disabled={removingWishlist} onClick={onRemoveWishlist}>
                            {removingWishlist ? "Removing..." : "Remove from Wishlist"}
                        </button>
                    )}
                    <button
                        className="button-secondary"
                        type="button"
                        disabled={addingToCart || product.stock === 0}
                        onClick={handleAddToCart}
                    >
                        {addingToCart ? "Adding..." : isInCart ? "Add Another" : "Add to Cart"}
                    </button>
                </div>
                {actionMessage && <p className="success product-action-message" role="status">{actionMessage}</p>}
                {actionError && <p className="error product-action-message" role="alert">{actionError}</p>}
            </div>
        </article>
    );
}

export default ProductCard;

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CartContext from "./CartContext";

function getErrorMessage(error, fallback) {
    return error.response?.data?.message || fallback;
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const applyCart = useCallback((cart) => {
        setCartItems(cart);
        setError("");
    }, []);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/cart");
            applyCart(response.data.cart);
            return response.data.cart;
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Unable to load your cart."));
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, [applyCart]);

    useEffect(() => {
        let isCurrent = true;
        const loadCart = async () => {
            try {
                const response = await api.get("/cart");
                if (isCurrent) {
                    applyCart(response.data.cart);
                }
            } catch (requestError) {
                if (isCurrent) {
                    setError(getErrorMessage(requestError, "Unable to load your cart."));
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        };

        loadCart();
        return () => {
            isCurrent = false;
        };
    }, [applyCart]);

    const mutateCart = useCallback(async (request, fallback) => {
        setError("");
        try {
            const response = await request();
            applyCart(response.data.cart);
            return response.data;
        } catch (requestError) {
            setError(getErrorMessage(requestError, fallback));
            throw requestError;
        }
    }, [applyCart]);

    const addToCart = useCallback(
        (productId) => mutateCart(() => api.post(`/cart/${productId}`), "Unable to add this product to your cart."),
        [mutateCart]
    );

    const updateQuantity = useCallback(
        (productId, quantity) => mutateCart(
            () => api.patch(`/cart/${productId}`, { quantity }),
            "Unable to update cart quantity."
        ),
        [mutateCart]
    );

    const removeFromCart = useCallback(
        (productId) => mutateCart(() => api.delete(`/cart/${productId}`), "Unable to remove this product from your cart."),
        [mutateCart]
    );

    const clearCart = useCallback(() => {
        setCartItems([]);
        setError("");
    }, []);

    const value = useMemo(() => ({
        cartItems,
        loading,
        error,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    }), [cartItems, loading, error, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

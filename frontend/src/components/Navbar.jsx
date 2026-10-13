import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useCart from "../hooks/useCart";

function Navbar() {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const handleLogout = async () => {
        setLogoutError("");
        try {
            await api.post("/customers/logout");
            navigate("/login", { replace: true });
        } catch (error) {
            setLogoutError(error.response?.data?.message || "Unable to log out. Please try again.");
        }
    };

    return (
        <nav className="site-nav">
            <div className="nav-inner">
                <Link className="brand" to="/home" onClick={() => setMenuOpen(false)}>
                    <span className="brand-mark">S</span>
                    <span>ShopKart</span>
                </Link>
                <button
                    className="menu-toggle"
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
                    <NavLink to="/home" onClick={() => setMenuOpen(false)}>Home</NavLink>
                    <NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink>
                    <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
                    <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                        Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                    </NavLink>
                    <NavLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</NavLink>
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
                    <button className="nav-logout" type="button" onClick={handleLogout}>Logout</button>
                </div>
                {logoutError && <p className="nav-error" role="alert">{logoutError}</p>}
            </div>
        </nav>
    );
}

export default Navbar;

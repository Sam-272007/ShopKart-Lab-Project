import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="site-footer">
            <div>
                <Link className="footer-brand" to="/home">ShopKart</Link>
                <p>Your simple way to discover great products.</p>
            </div>
            <div className="footer-links">
                <span className="footer-label">Explore</span>
                <Link to="/home">Home</Link>
                <Link to="/products">Products</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/profile">Profile</Link>
            </div>
            <p className="footer-copyright">© 2026 ShopKart</p>
        </footer>
    );
}

export default Footer;

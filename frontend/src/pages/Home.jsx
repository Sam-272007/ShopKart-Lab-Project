import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import ProductCard from "../components/ProductCard";
import api from "../api/axios";

const features = [
    { icon: "01", title: "Wide selection", text: "Browse a focused collection of products for everyday needs." },
    { icon: "02", title: "Easy discovery", text: "Search and filter quickly to find something that fits." },
    { icon: "03", title: "Secure shopping", text: "Your account and session stay protected throughout the experience." }
];

function Home() {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsError, setProductsError] = useState("");
    const [profileError, setProfileError] = useState("");

    useEffect(() => {
        const loadHome = async () => {
            const [profileResult, productsResult] = await Promise.allSettled([
                api.get("/customers/me"),
                api.get("/products")
            ]);

            if (profileResult.status === "fulfilled") {
                setCustomer(profileResult.value.data.customer);
            } else if (profileResult.reason.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            } else {
                setProfileError("We could not load your profile right now.");
            }

            if (productsResult.status === "fulfilled") {
                setProducts(productsResult.value.data.products.slice(0, 4));
            } else {
                setProductsError("We could not load your featured products right now.");
            }

            setLoading(false);
        };

        loadHome();
    }, [navigate]);

    if (loading) {
        return <AuthenticatedLayout><p className="state-message">Loading your ShopKart...</p></AuthenticatedLayout>;
    }

    return (
        <AuthenticatedLayout>
            <div className="home-page">
                <section className="hero-section page-container">
                    <div className="hero-copy">
                        <p className="eyebrow">Welcome back{customer ? `, ${customer.fullName.split(" ")[0]}` : ""}</p>
                        <h1>Everything you need, all in one place.</h1>
                        <p className="hero-description">Discover useful products, compare what matters, and keep your next find simple.</p>
                        <div className="hero-actions">
                            <button className="button button-primary" type="button" onClick={() => navigate("/products")}>Shop now <span aria-hidden="true">→</span></button>
                            <Link className="text-link" to="/profile">View profile <span aria-hidden="true">↗</span></Link>
                        </div>
                        {profileError && <p className="error" role="alert">{profileError}</p>}
                        {customer && (
                            <dl className="home-customer surface-card">
                                <div><dt>Customer</dt><dd>{customer.fullName}</dd></div>
                                <div><dt>Email</dt><dd>{customer.email}</dd></div>
                                <div><dt>Phone</dt><dd>{customer.phone}</dd></div>
                            </dl>
                        )}
                    </div>
                    <div className="hero-visual" aria-hidden="true">
                        <div className="hero-orbit orbit-one" />
                        <div className="hero-orbit orbit-two" />
                        <div className="hero-note"><span>Curated for you</span><strong>Find your next favorite.</strong></div>
                    </div>
                </section>

                <section className="features-section page-container" aria-labelledby="why-shopkart">
                    <div className="section-heading compact-heading"><div><p className="eyebrow">The simple way to shop</p><h2 id="why-shopkart">Made for a better browse</h2></div></div>
                    <div className="feature-grid">
                        {features.map((feature) => <article className="feature-card" key={feature.title}><span className="feature-number">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
                    </div>
                </section>

                <section className="featured-section page-container" aria-labelledby="featured-products">
                    <div className="section-heading"><div><p className="eyebrow">A little inspiration</p><h2 id="featured-products">Featured products</h2></div><Link className="text-link" to="/products">Explore all products <span aria-hidden="true">→</span></Link></div>
                    {productsError && <p className="state-message error">{productsError}</p>}
                    {!productsError && products.length === 0 && <p className="state-message">No products found.</p>}
                    {!productsError && products.length > 0 && <div className="product-grid featured-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

export default Home;
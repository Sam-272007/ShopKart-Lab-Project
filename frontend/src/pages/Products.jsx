import { useEffect, useState } from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import ProductCard from "../components/ProductCard";
import api from "../api/axios";

const categories = ["Electronics", "Fashion", "Books", "Home"];

function Products() {
    const [products, setProducts] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/products", {
                    params: {
                        ...(search && { search }),
                        ...(category && { category })
                    }
                });
                setProducts(response.data.products);
            } catch {
                setError("Something went wrong while loading products.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, category, retryKey]);

    const handleSearch = (event) => {
        event.preventDefault();
        setSearch(searchInput.trim());
    };

    return (
        <AuthenticatedLayout>
            <div className="products-page">
                <div className="products-content page-container">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Your next find starts here</p>
                        <h1>Discover products you&apos;ll love.</h1>
                    </div>
                    <p className="product-count">
                        {loading ? "" : `${products.length} product${products.length === 1 ? "" : "s"}`}
                    </p>
                </div>

                <div className="catalog-controls surface-card">
                    <form className="search-form" onSubmit={handleSearch}>
                        <label htmlFor="product-search">Search products</label>
                        <div className="search-row">
                            <input
                                id="product-search"
                                type="search"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                            />
                            <button type="submit">Search</button>
                        </div>
                    </form>
                    <div className="category-control">
                        <label htmlFor="category-filter">Category</label>
                        <select
                            id="category-filter"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && <p className="state-message">Loading products...</p>}
                {!loading && error && <div className="state-panel"><p className="state-message error">Something went wrong while loading products.</p><button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>Try Again</button></div>}
                {!loading && !error && products.length === 0 && (
                    <div className="state-panel"><p className="state-message">{search || category ? "No products found matching your search." : "No products found."}</p>{(search || category) && <button className="button button-secondary" type="button" onClick={() => { setSearchInput(""); setSearch(""); setCategory(""); }}>Clear filters</button>}</div>
                )}
                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Products;

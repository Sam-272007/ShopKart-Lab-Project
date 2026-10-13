import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import api from "../api/axios";

function Profile() {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/customers/me");
                setCustomer(response.data.customer);
            } catch {
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        setError("");
        try {
            await api.post("/customers/logout");
            navigate("/login", { replace: true });
        } catch {
            setError("Logout failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <p className="state-message">Loading profile...</p>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <section className="profile-page page-container">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Account</p>
                        <h1>My Profile</h1>
                        <p>Manage your ShopKart customer details.</p>
                    </div>
                </div>

                {customer && (
                    <div className="profile-layout">
                        <article className="profile-intro surface-card">
                            <div className="avatar" aria-hidden="true">
                                {customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <h2>{customer.fullName}</h2>
                            <p>{customer.email}</p>
                        </article>

                        <article className="profile-details surface-card">
                            <div className="card-heading">
                                <div>
                                    <p className="eyebrow">Your details</p>
                                    <h2>Personal Information</h2>
                                </div>
                            </div>
                            <dl className="details-list">
                                <div>
                                    <dt>Full Name</dt>
                                    <dd>{customer.fullName}</dd>
                                </div>
                                <div>
                                    <dt>Email</dt>
                                    <dd>{customer.email}</dd>
                                </div>
                                <div>
                                    <dt>Phone</dt>
                                    <dd>{customer.phone}</dd>
                                </div>
                                <div>
                                    <dt>Member Since</dt>
                                    <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                            {error && <p className="error inline-message">{error}</p>}
                            <button className="button button-danger" type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </article>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

export default Profile;

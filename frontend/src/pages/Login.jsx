import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await api.post(
                "/customers/login",
                formData
            );

            navigate("/home");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>ShopKart</h1>
                <p className="eyebrow auth-eyebrow">Your account is waiting</p>
                <h2>Welcome back</h2>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        aria-label="Email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        aria-label="Password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {error && (
                    <p className="error">{error}</p>
                )}

                <p>
                    Don't have an account?{" "}
                    <button
                        className="link-button"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </p>

            </div>
        </div>
    );
}

export default Login;
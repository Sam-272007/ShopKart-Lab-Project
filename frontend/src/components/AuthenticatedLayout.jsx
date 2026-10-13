import Navbar from "./Navbar";
import Footer from "./Footer";

function AuthenticatedLayout({ children }) {
    return (
        <div className="app-shell">
            <Navbar />
            <main className="app-main">{children}</main>
            <Footer />
        </div>
    );
}

export default AuthenticatedLayout;

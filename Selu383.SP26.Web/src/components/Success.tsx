import { Link } from "react-router-dom";
import conceptLogo from "../styles/assets/ConceptLogo2.png";

function Success() {
  return (
    <div className="success-shell">
      <div className="success-card">
        <img
          src={conceptLogo}
          alt="Caffeinated Lions Logo"
          className="success-logo"
        />
        <div className="success-badge">Payment received</div>
        <h1 className="success-title">Order confirmed</h1>
        <p className="success-copy">
          Your Stripe checkout completed successfully. Your order is in the
          system and should appear in your order history shortly.
        </p>
        <div className="success-actions">
          <Link to="/order" className="success-link success-link-primary">
            View orders
          </Link>
          <Link to="/menu" className="success-link">
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Success;

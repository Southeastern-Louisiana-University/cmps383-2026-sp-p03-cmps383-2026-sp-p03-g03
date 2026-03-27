import { Link } from "react-router-dom";
import conceptLogo from "../assets/ConceptLogo2.png";

function Cancel() {
  return (
    <div className="success-shell">
      <div className="success-card">
        <img
          src={conceptLogo}
          alt="Caffeinated Lions Logo"
          className="success-logo"
        />
        <div className="success-badge">Checkout cancelled</div>
        <h1 className="success-title">Payment not completed</h1>
        <p className="success-copy">
          Your Stripe checkout was cancelled before payment was completed. Your
          order was not paid through Stripe, and you can return to the app to
          try checkout again.
        </p>
        <div className="success-actions">
          <Link to="/menu" className="success-link success-link-primary">
            Return to menu
          </Link>
          <Link to="/order" className="success-link">
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cancel;
import { Link } from "react-router-dom";
import "./error-page.css";
export default function ErrorPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <p className="error-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div style={{ paddingTop: 10 }}>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

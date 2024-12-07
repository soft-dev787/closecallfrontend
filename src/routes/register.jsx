import { useEffect, useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";
import { afterLoginRegister } from "../utils/afterLoginRegister";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill out all fields");
    } else {
      setError("");
      setLoading("Loading.....");

      axiosInstance
        .post("/register", {
          email,
          password,
        })
        .then((resp) => {
          afterLoginRegister(resp.data);
          navigate("/");
        })
        .catch((error) => {
          setError(error.response.data.message);
        })
        .finally(() => {
          setLoading("");
        });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <p className="loading-message">{loading}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Register
          </button>
        </form>

        <p className="register">
          Have an account? <Link to={"/login"}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

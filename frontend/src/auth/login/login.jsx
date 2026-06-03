import { useState } from "react";
import "./login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");

    let hasError = false;

    
    if (!email) {
      setEmailError("Please fill email");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please fill password");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.fullName);

      
      window.location.href = "/dashboard";

    } catch (err) {
      console.log(err);
      setServerError("Server not reachable");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box fade-in" onSubmit={handleLogin}>
        <h2>User Login</h2>

        {/* EMAIL */}
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
          />
        </div>
        {emailError && <p className="error">{emailError}</p>}

        {}
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
          />
        </div>
        {passwordError && <p className="error">{passwordError}</p>}

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link className="forgot-link" to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="login-btn">
          LOGIN
        </button>

        {serverError && <p className="error">{serverError}</p>}
      </form>
    </div>
  );
};

export default Login;
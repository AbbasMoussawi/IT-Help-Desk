import { useState } from "react";
import "./login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

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

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        setServerError(data.message || "Invalid email or password");
        return;
      }

      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      
      const role = data.user.role?.trim().toLowerCase();

      console.log("ROLE:", role);

      if (role === "employee") {
        navigate("/dashboard");
      } 
      else if (role === "it support") {
        navigate("/dashboard");
      } 
      else if (role === "admin" || role === "manager") {
        navigate("/dashboard");
      } 
      else {
        setServerError("Invalid role");
      }
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
        <div className="login-input-group">
          <FaEnvelope className="login-icon" />
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
        {emailError && <p className="login-error">{emailError}</p>}

        {/* PASSWORD */}
        <div className="login-input-group">
          <FaLock className="login-icon" />
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
        {passwordError && <p className="login-error">{passwordError}</p>}

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>

          <Link className="forgot-link" to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="login-btn">
          LOGIN
        </button>

        {serverError && <p className="login-error">{serverError}</p>}
      </form>
    </div>
  );
};

export default Login;
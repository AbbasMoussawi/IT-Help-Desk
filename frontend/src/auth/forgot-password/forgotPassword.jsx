import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./forgotPassword.css";
import { FaEnvelope } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5050/api/password/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      // نجاح → روح على verify email
      navigate("/verify-email", {
        state: { email },
      });

    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-box fade-in" onSubmit={handleSubmit}>

        <h2>Forgot Password</h2>

        <p className="subtitle">
          Enter your email address and we will send you a reset code
        </p>

        {message && <p className="message">{message}</p>}

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="forgot-btn">
          SEND RESET CODE
        </button>

        <div className="back-forgot">
          <Link to="/">Back to Login</Link>
        </div>

      </form>
    </div>
  );
};

export default ForgotPassword;
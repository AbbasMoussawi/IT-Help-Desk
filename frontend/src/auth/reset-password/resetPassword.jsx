import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./resetPassword.css";

function ResetPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = localStorage.getItem("reset_token");

  const email =
    location.state?.email ||
    localStorage.getItem("reset_email");

  useEffect(() => {
    const step = localStorage.getItem("reset_step");

    if (!email) {
      navigate("/forgot-password");
      return;
    }

    if (step !== "verified") {
      navigate("/verify-email");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword || !confirmPassword) {
        setMessage("Please fill all fields");
        setMessageType("error");
        return;
    }

    if (newPassword.length < 8) {
        setMessage("Password must be at least 8 characters");
        setMessageType("error");
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match");
        setMessageType("error");
        return;
    }

    try {
      setLoading(true);
        console.log("Email:", email);
        console.log("NEW PASSWORD:", newPassword);
      const res = await fetch(
        "http://localhost:5050/api/password/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Error resetting password");
        setLoading(false);
        return;
      }

      
      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_step");
      localStorage.setItem("reset_done", "true");
      
      navigate("/password-success");

    } catch (error) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">

        <h1 className="title">Reset Your Password</h1>

        <p className="subtitle">
          Please enter your new password below
        </p>

        {message && (
            <p className={`message ${messageType}`}>
                {message}
            </p>
        )}

        <form onSubmit={handleSubmit}>

          <div className="input-wrapper">
            <FaLock className="left-icon" />

            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
            >
              {showNewPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="input-wrapper">
            <FaLock className="left-icon" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <button
            type="submit"
            className="reset-btn"
            disabled={loading}
          >
            {loading ? "UPDATING..." : "RESET PASSWORD"}
          </button>

        </form>

        <Link to="/" className="back-link">
          Back To Login
        </Link>

      </div>
    </div>
  );
}

export default ResetPassword;
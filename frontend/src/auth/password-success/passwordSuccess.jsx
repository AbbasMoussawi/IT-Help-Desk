import "./passwordSuccess.css";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function PasswordSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetDone = localStorage.getItem("reset_done");

    if (resetDone !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = () => {
    setLoading(true);

    localStorage.removeItem("reset_done");

    setTimeout(() => {
      navigate("/");
    }, 1200);
  };

  return (
    <div className="success-page">
      <div className="success-card">

        <div className="success-icon">
          <FaCheck />
        </div>

        <h1>Password Changed Successfully!</h1>

        <p>
          Your password has been changed successfully.
          You can now login with your new password.
        </p>

        <div className="success-message">
          ✓ Password updated successfully
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            "Back To Login"
          )}
        </button>

      </div>
    </div>
  );
}

export default PasswordSuccess;
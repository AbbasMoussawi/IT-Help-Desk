import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./verifyEmail.css";

const VerifyEmail = () => {
  const location=useLocation();
  const navigate=useNavigate();

  const email=location.state?.email || localStorage.getItem("reset_email");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(600);
  const [canResend, setCanResend] = useState(false);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCode = code.join("");

    if (finalCode.length !== 6) {
      setMessage("Please enter the full 6-digit code");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5050/api/password/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code: finalCode,
          }),
        }
      );

      const data = await res.json();
      localStorage.setItem("reset_token", data.resetToken);

      if (!res.ok) {
        setMessage(data.message);
        setMessageType("error");
        return;
      }

      localStorage.setItem("reset_email", email);
      localStorage.setItem("reset_step", "verified");

      navigate("/reset-password", {
        state: {
          email,
        },
      });
    } catch (error) {
      setMessage("Server error");
      setMessageType("error");
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(
        "http://localhost:5050/api/password/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        setMessageType("error");
        return;
      }

      setSeconds(600);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);

      setMessage("Verification code sent again");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to resend code");
      setMessageType("error");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">

        <h2>Verify Your Email</h2>

        <div className="email-box">
          <span>Verification sent to</span>
          <p>{email}</p>
        </div>

        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>

          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
              />
            ))}
          </div>

          <p className="resend">
            {canResend ? (
              <span
                onClick={handleResend}
                style={{ cursor: "pointer" }}
              >
                Resend Code
              </span>
            ) : (
              <span className="timer">
                Expires in {formatTime(seconds)}
              </span>
            )}
          </p>

          <button
            type="submit"
            className="verify-btn"
          >
            VERIFY CODE
          </button>

        </form>

      </div>
    </div>
  );
};

export default VerifyEmail;
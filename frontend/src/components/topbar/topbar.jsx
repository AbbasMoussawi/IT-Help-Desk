import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./topbar.css";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaCircle
} from "react-icons/fa" ;
import { useNavigate } from "react-router-dom";


function TopBar({ setIsOpen, showSearch = true, title = "", icon: Icon }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isMe = !id || currentUser?.id == id;
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(JSON.parse(localStorage.getItem("user")));

  const fullName = user?.fullName || "Unknown";
  const role = user?.role || "No role";

  const avatar =
    fullName !== "Unknown"
      ? fullName.split(" ").map(n => n[0]).join("").toUpperCase()
      : "U";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5050/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log(error);
    }

    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setCount(data.count);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchCount();
  }, []);
  const handleNotificationClick = async () => {
    
      navigate("/notifications");
    
  };

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button className="menu-btn" onClick={() => setIsOpen(true)}>
          <FaBars />
        </button>

        <div className="topbar-title">
          {Icon && <Icon />}
          {title}
        </div>

      </div>

      <div className="topbar-right">

        <div className="notification" onClick={handleNotificationClick}>
          <FaBell />

          {count > 0 && (
            <span className="notif-badge">{count}</span>
          )}
        </div>

        {/* PROFILE */}
        <div
          className="profile"
          ref={dropdownRef}
          onClick={() => setOpen(!open)}
        >

          {/* avatar */}
          <div className="avatar">
            {user?.image ? (
              <img
                src={`http://localhost:5050/uploads/${user.image}`}
                alt="profile"
              />
            ) : (
              <span>{avatar}</span>
            )}
          </div>

          {/* info */}
          <div className="profile-info">
            <h4>{fullName}</h4>

            <div className="role-line">
                
                <span className="role-text">{role}</span>
                <span className={user?.isOnline ? "online-text" : "offline-text"}>
                    <FaCircle className={user?.isOnline ? "online-dot" : "offline-dot"} />
                    {user?.isOnline ? "Online" : "Offline"}
                </span>

                
            </div>
          </div>

          <FaChevronDown className={`arrow ${open ? "rotate" : ""}`} />

          {/* dropdown */}
          <div className={`dropdown ${open ? "show" : ""}`}>

            <div
              className="dropdown-item"
              onClick={() => navigate(`/users/${currentUser?.id}`)}
            >
              <FaUser />
              <span>Profile</span>
            </div>

            <div className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default TopBar;
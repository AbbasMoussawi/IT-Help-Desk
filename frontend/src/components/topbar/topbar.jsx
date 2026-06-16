import { useState, useEffect, useRef } from "react";
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

function TopBar({ setIsOpen, showSearch = true, title = "", icon: Icon }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fullName = user?.fullName || "Unknown";
  const role = user?.role || "No role";

  const avatar =
    fullName !== "Unknown"
      ? fullName.split(" ").map(n => n[0]).join("").toUpperCase()
      : "U";

  const handleLogout = () => {
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

        <div className="notification">
          <FaBell />
          <span>3</span>
        </div>

        {/* PROFILE */}
        <div
          className="profile"
          ref={dropdownRef}
          onClick={() => setOpen(!open)}
        >

          {/* avatar */}
          <div className="avatar">{avatar}</div>

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

            <div className="dropdown-item">
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
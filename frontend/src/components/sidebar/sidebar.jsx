import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaTicketAlt,
  FaPlusCircle,
  FaBell,
  FaBullhorn,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaFolderOpen,
  FaSpinner,
  FaCheckCircle,
  FaUsers
} from "react-icons/fa";

function Sidebar({ isOpen, setIsOpen, menuType, counts, context}) {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const fullName = user?.fullName || "Unknown";
  const role = (user?.role || "").trim().toLowerCase();;
  const isEmployee=role==="employee";
  const isIT=role==="it support";

  const avatar =
    fullName !== "Unknown"
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

  const isActive = (path) => location.pathname === path;

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

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "show" : ""} ${menuType}`}>

        {/* TOP */}
        <div className="sidebar-top">

          <div className="logo-section">
            <div className="logo-box">Q</div>

            <div>
              <h2>HelpDesk</h2>
              <span>Ticket System</span>
            </div>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes />
          </button>

        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          <ul>

            {isIT ? (
              <>
                <li className={isActive("/dashboard") ? "active" : ""}>
                  <Link to="/dashboard">
                    <FaHome />
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li className={isActive("/assigned-tickets") ? "active" : ""}>
                  <Link to="/assigned-tickets">
                    <FaTicketAlt />
                    <span className="menu-item">
                      <span className="label">Assigned Tickets</span>
                      <span className="count assigned">{counts?.assigned ?? 0}</span>
                    </span>
                  </Link>
                </li>

                <li className={isActive("/open-tickets") ? "active" : ""}>
                  <Link to="/open-tickets">
                    <FaFolderOpen />
                    <span className="menu-item">
                      <span className="label">Open Tickets</span>
                      <span className="count open">{counts?.open ?? 0}</span>
                    </span>
                  </Link>
                </li>

                <li className={isActive("/in-progress") ? "active" : ""}>
                  <Link to="/in-progress">
                    <FaSpinner />
                    <span className="menu-item">
                      <span className="label">In Progress</span>
                      <span className="count in-progress">{counts?.in_progress ?? 0}</span>
                    </span>
                  </Link>
                </li>

                <li className={isActive("/resolved") ? "active" : ""}>
                  <Link to="/resolved">
                    <FaCheckCircle />
                    <span className="menu-item">
                      <span className="label">Resolved</span>
                      <span className="count resolved">{counts?.resolved ?? 0}</span>
                    </span>
                  </Link>
                </li>

                <li className={isActive("/closed") ? "active" : ""}>
                  <Link to="/closed">
                    <FaCheckCircle />
                    <span className="menu-item">
                      <span className="label">Closed</span>
                      <span className="count closed">{counts?.closed ?? 0}</span>
                    </span>
                  </Link>
                </li>

                

                <li className={isActive("/profile") ? "active" : ""}>
                  <Link to={`/users/${user?.ID || user?.id}`}>
                    <FaUser />
                    <span>Profile</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className={isActive("/dashboard") ? "active" : ""}>
                  <Link to="/dashboard">
                    <FaHome />
                    <span>Dashboard</span>
                  </Link>
                </li>

                {/* EMPLOYEE */}
                {role === "employee" && (
                  <>
                    <li className={isActive("/my-tickets") ? "active" : ""}>
                      <Link to="/my-tickets">
                        <FaTicketAlt />
                        <span>My Tickets</span>
                      </Link>
                    </li>

                    <li className={isActive("/create-ticket") ? "active" : ""}>
                      <Link to="/create-ticket">
                        <FaPlusCircle />
                        <span>Create Ticket</span>
                      </Link>
                    </li>

                    

                    <li className={isActive("/profile") ? "active" : ""}>
                      <Link to={`/users/${user?.ID || user?.id}`}>
                        <FaUser />
                        <span>Profile</span>
                      </Link>
                    </li>

                    
                  </>
                )}

                {/* ADMIN + MANAGER */}
                {(role === "admin" || role === "manager") && (
                  <>
                    <li className={isActive("/ticket-management") ? "active" : ""}>
                      <Link to="/ticket-management">
                        <FaTicketAlt />
                        <span>Tickets</span>
                      </Link>
                    </li>
                    <li className={isActive("/my-tickets") ? "active" : ""}>
                      <Link to="/my-tickets">
                        <FaTicketAlt />
                        <span>My Tickets</span>
                      </Link>
                    </li>

                    <li className={isActive("/create-ticket") ? "active" : ""}>
                      <Link to="/create-ticket">
                        <FaPlusCircle />
                        <span>Create Ticket</span>
                      </Link>
                    </li>
                    <li className={isActive("/team-performance") ? "active" : ""}>
                      <Link to="/team-performance">
                        <FaUsers />
                        <span>Team Performance</span>
                      </Link>
                    </li>

                    {role === "admin" && (
                      <li className={isActive("/users") ? "active" : ""}>
                        <Link to="/users">
                          <FaUser />
                          <span>Users</span>
                        </Link>
                      </li>
                    )}


                    <li className={isActive("/profile") ? "active" : ""}>
                      <Link to={`/users/${user?.ID || user?.id}`}>
                        <FaUser />
                        <span>Profile</span>
                      </Link>
                    </li>

                    
                  </>
                )}
              </>
            )}

          </ul>

          {/* FOOTER */}
          <div className="sidebar-footer">

            <Link to={`/users/${user?.ID || user?.id}`} className="employee-card">

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

              <div className="employee-info">
                <h4>{fullName}</h4>
                <span>{role.toUpperCase()}</span>
                <p className="online-status">
                  ● {user?.isOnline ? "Online" : "Offline"}
                </p>
              </div>

            </Link>

            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>

          </div>

        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
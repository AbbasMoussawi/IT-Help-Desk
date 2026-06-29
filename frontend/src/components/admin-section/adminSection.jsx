import "./adminSection.css";
import {
  FiUsers, FiFileText, FiTool, FiCheckCircle,
  FiActivity, FiAlertTriangle,
  FiBell,
  FiAward,
  FiUserPlus,
  FiShield,
  FiLayers,
  FiTrendingUp,
  FiMessageSquare,
  FiUser,
  FiUserCheck,
  FiCpu,
  FiPaperclip,

} from "react-icons/fi";
import { useState } from "react";
import { useEffect } from "react";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Link } from "react-router-dom";
import { FaHeadset } from "react-icons/fa";
import { getNotificationStyle } from "../../utils/notificationsUtils";

function AdminSection() {
  const [activities, setActivities] = useState([]);
  const [topITStaff, setTopITStaff] = useState([]);
  const [userOverview, setUserOverview] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [highPriorityTickets, setHighPriorityTickets] = useState([]);
  const [notifications, setNotifications]=useState([]);

  const roleOrder = {
    Admin: 1,
    Manager: 2,
    "IT Support": 3,
    Employee: 4,
  };
  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <FiShield />;
      case "Manager":
        return <FiUserCheck />;
      case "IT Support":
        return <FaHeadset />;
      case "Employee":
        return <FiUser />;
      default:
        return <FiUser />;
    }
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Hardware":
        return <FiCpu />;

      case "Software":
        return <FiFileText />;

      case "Network":
        return <FiActivity />;

      default:
        return <FiLayers />;
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/activity?mode=dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchTopITStaff = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/team-performance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setTopITStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUserOverview = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/user-overview",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setUserOverview(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchTicketCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/ticket-categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log(data);

        setTicketCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchHighPriority = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/high-priority-tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setHighPriorityTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem("token");

          const res = await fetch(
            "http://localhost:5050/api/dashboard/notifications?limit=5",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
          console.log(err);
        }
    };
    
    fetchActivities();
    fetchTopITStaff();
    fetchUserOverview();
    fetchTicketCategories();
    fetchHighPriority();
    fetchNotifications();
  }, []);

  const adminActivity = activities.map((a) => {
    let icon = <FiActivity />;
    let color = "blue";

    if (a.Action === "Created Ticket") {
      icon = <FiUserPlus />;
      color = "green";
    }

    if (a.Action === "Status Changed") {
      icon = <FiCheckCircle />;
      color = "orange";
    }

    if (a.Action === "User Created") {
      icon = <FiUsers />;
      color = "blue";
    }

    if (a.Action === "Role Updated") {
      icon = <FiTool />;
      color = "purple";
    }

    return {
      icon,
      color,
      title: `${a.UserName} - ${a.Action}`,
      description: a.NewValue,
      time: formatTimeAgo(a.CreatedAt),
    };
  });


  

  

  

  

  

  const sortedUserOverview = [...userOverview].sort(
    (a, b) => {
      return (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
    }
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "status-resolved";
      case "Open":
        return "status-open";
      case "Closed":
        return "status-closed";
      case "In Progress":
        return "status-progress";
      default:
        return "status-default";
    } 
  };
  
  console.log(notifications);
  return (
    <div className="admin-dashboard-section">

      

      {/* FIRST ROW */}
      <div className="admin-top-grid">

        {/* User Overview */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2><FiUsers className="users-icon" />User Overview</h2>
            
          </div>

          <div className="admin-list">
            {sortedUserOverview.map((item, index) => (
              <Link
                key={index}
                className="admin-row"
                to={`/users?role=${item.role}`}
              >
                <span>
                  <div className={`role-icon ${item.role}`}>
                    {getRoleIcon(item.role)}
                  </div>
                  {item.role}
                </span>

                <strong>{item.count}</strong>
              </Link>
            ))}
            <Link to="/users" className="admin-ticket-bottom-btn">
              View All User
            </Link>
          </div>
        </div>

        {/* System Activity */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2> <FiTrendingUp className="activity-icon" />System Activity</h2>
            
          </div>

          <div className="admin-list">
            {adminActivity.map((a, index) => (
              <div key={index} className="admin-activity-item">

                <div className={`admin-mini-icon ${a.color}`}>
                  {a.icon}
                </div>

                <div className="admin-activity-main">
                  <h4>{a.title}</h4>
                  <p>{a.description}</p>
                </div>

                <span className="admin-activity-time">
                  {a.time}
                </span>

              </div>
            ))}
            <Link to="/activity" className="admin-ticket-bottom-btn">View All Activity</Link>
          </div>
        </div>

        {/* Critical Issues */}
        {/* High Priority Tickets */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              <FiAlertTriangle className="critical-icon" />
              High Priority Tickets
            </h2>
          </div>

          <div className="admin-list">
            {highPriorityTickets.length === 0 ? (
              <div className="admin-empty-state">
                <FiAlertTriangle />
                <p>No high priority tickets</p>
              </div>
            ) : (
              highPriorityTickets.map((ticket) => (
                <div key={ticket.ID} className="admin-priority-item">
                  
                  <div className="admin-priority-icon">
                    <FiAlertTriangle />
                  </div>

                  <div className="admin-priority-content">
                    <h4>{ticket.Title}</h4>

                    <span className="admin-priority-content-number">
                      {ticket.TicketNumber}
                    </span>

                    <div className="admin-meta">
                      <span className={`status ${getStatusClass(ticket.StatusName)}`}>
                        {ticket.StatusName}
                      </span>

                      <span className="admin-dot">•</span>

                      <span className="admin-time">
                        {formatTimeAgo(ticket.CreatedAt)}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            )}

            <Link
              to="/ticket-management?priority=High"
              className="admin-ticket-bottom-btn"
            >
              View All High Priority Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="admin-bottom-grid">

        {/* Categories */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2><FiLayers className="category-icon" />Ticket Categories</h2>
          </div>

          <div className="admin-list">
            {ticketCategories.map((item) => (
              <Link
                key={item.Category}
                className="admin-row"
                to={`/ticket-management?category=${item.Category}`}
              >
                <span className="category-left">
                  <div className={`category-icon-box ${item.Category}`}>
                    {getCategoryIcon(item.Category)}
                  </div>
                  <span className="category-text">{item.Category}</span>
                </span>

                <strong>{item.Count}</strong>
              </Link>
            ))}
            <Link to="/ticket-management" className="admin-ticket-bottom-btn">View All Activity</Link>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2><FiAward className="staff-icon" />Top IT Staff</h2>
            
          </div>

          <div className="admin-list">
            {topITStaff.map((staff, index) => (
               <div key={staff.ID} className="admin-row">
                <span>
                  <FiAward className={`award-${index + 1}`} />{staff.FullName}
                </span>
                <strong>{staff.ResolvedCount} Resolved</strong>
              </div>
            ))}
            <Link to="/team-performance" className="admin-ticket-bottom-btn">View All Top IT Support</Link>
          </div>
        </div>
        {/* Notifications */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2><FiBell className="notification-icon" />Notifications</h2>
            
          </div>

          <div className="admin-list">
            {notifications.map((n, index) => {
              const { icon, color } = getNotificationStyle(n.Type);

              return (
                <div key={index} className="admin-activity-item">
                  <div className={`mini-icon ${color}`}>
                    {icon}
                  </div>

                  <div className="admin-activity-main">
                    <h4>
                      {n.FullName} {n.Title}
                    </h4>

                    <p>{n.Message}</p>

                    <small className="notification-time">{formatTimeAgo(n.CreatedAt)}</small>
                  </div>

                  
                </div>
              );
            })}
            <Link to="/notifications" className="admin-ticket-bottom-btn">View All Notifications</Link>
          </div>
        </div>

        
        
      </div>
    </div>
  );
}

export default AdminSection;
import "./employeeSection.css";
import {
  FiMessageSquare,
  FiUser,
  FiCheckCircle,
  FiFileText,
  FiPrinter,
  FiMail,
  FiWifi,
  FiLock,
  FiPlusSquare,
  FiBookOpen,
  FiMonitor,
  FiActivity,
  FiClipboard,
  FiZap,
  FiTool
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function EmployeeSection() {
  

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;

    return date.toLocaleDateString("en-GB");
  };
  const getActivityStyle = (action) => {
    switch (action) {
      case "Created Ticket":
        return {
          icon: <FiPlusSquare />,
          color: "green",
        };

      case "Status Changed":
        return {
          icon: <FiCheckCircle />,
          color: "orange",
        };

      case "Ticket Updated":
        return {
          icon: <FiTool />,
          color: "blue",
        };

      case "Comment Added":
        return {
          icon: <FiMessageSquare />,
          color: "purple",
        };

      case "Assigned Ticket":
        return {
          icon: <FiUser />,
          color: "teal",
        };

      case "Attachment Uploaded":
        return {
          icon: <FiFileText />,
          color: "gray",
        };

      default:
        return {
          icon: <FiActivity />,
          color: "blue",
        };
    }
  };

  

  const [activities, setActivities] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/activity?mode=dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("ERROR loading activities:", err);
      }
    };
    const fetchRecentTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/employee/recent-tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setRecentTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchActivity();
    fetchRecentTickets();
  }, []);
  

  const getTicketIcon = (title) => {
    const text = title?.toLowerCase() || "";

    if (text.includes("printer")) return <FiPrinter />;
    if (text.includes("email")) return <FiMail />;
    if (text.includes("vpn")) return <FiWifi />;
    if (text.includes("password")) return <FiLock />;
    if (text.includes("network")) return <FiWifi />;

    return <FiFileText />;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "employee-status-open";

      case "In Progress":
        return "employee-status-progress";

      case "Resolved":
        return "employee-status-resolved";

      case "Closed":
        return "employee-status-closed";

      default:
        return "";
    }
  };
  const quickActions = [
    {
      icon: <FiPlusSquare />,
      title: "Create New Ticket",
      description: "Report a new issue",
      link: "/create-ticket",
    },
    {
      icon: <FiFileText />,
      title: "My Tickets",
      description: "View all your tickets",
      link: "/my-tickets",
    },
    {
      icon: <FiBookOpen />,
      title: "Knowledge Base",
      description: "Find answers to common issues",
      link: "/knowledge",
    },
  ];

  const knowledgeBase = [
    {
      icon: <FiFileText />,
      title: "How to reset password",
      description: "Step by step guide to reset your account password.",
    },
    {
      icon: <FiWifi />,
      title: "Connect to VPN",
      description: "Learn how to connect to the company VPN.",
    },
    {
      icon: <FiPrinter />,
      title: "Install Printer",
      description: "Step by step guide to install a printer.",
    },
    {
      icon: <FiMonitor />,
      title: "Microsoft 365 Guide",
      description: "Basic guide for Microsoft 365 applications.",
    },
  ];

  return (
    <div className="employee-dashboard-section">

      {/* TOP ROW */}

      <div className="employee-top-grid">

        {/* Recent Activity */}

        <div className="employee-activity-card">
          <div className="employee-activity-header">
            <h2><FiActivity />Recent Activity</h2>

            <Link to="/activity" className="employee-activity-view-btn">
              View All
            </Link>
          </div>

          <div className="employee-activity-list">
            {activities.length === 0 ? (
              <p>No activity yet</p>
            ) : (
              activities.map((activity, index) => {
                const { icon, color } = getActivityStyle(activity.Action);

                return (
                  <div key={index} className="employee-activity-item">
                    <div className={`employee-activity-icon ${color}`}>
                      {icon}
                    </div>

                    <div className="employee-activity-content">
                      <h4>
                        {activity.Action}
                        {activity.TicketNumber ? ` ${activity.TicketNumber}` : ""}
                      </h4>

                      <p>{activity.NewValue || "No details"}</p>
                    </div>

                    <span className="employee-activity-time">{formatTime(activity.CreatedAt)}</span>
                  </div>
                );
              })
            )}
          </div>  

          <Link to="/activity" className="employee-ticket-bottom-btn">
            View All Activity
          </Link>
        </div>

        {/* My Recent Tickets */}

        <div className="employee-tickets-card">
          <div className="employee-tickets-header">
            <h2><FiClipboard />My Recent Tickets</h2>

            <Link to="/my-tickets" className="employee-tickets-view-btn">
              View All
            </Link>
          </div>

          <div className="employee-tickets-list">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.ID}
                className="employee-ticket-item"
              >
                <div className="employee-ticket-icon">
                  {getTicketIcon(ticket.Title)}
                </div>

                <div className="employee-ticket-content">
                  <h4>{ticket.Title}</h4>

                  <span>
                    #{ticket.TicketNumber}
                  </span>

                  <p>
                    {formatTime(ticket.CreatedAt)}
                  </p>
                </div>

                <div
                  className={`employee-ticket-status ${getStatusClass(
                    ticket.StatusName
                  )}`}
                >
                  {ticket.StatusName}
                </div>
              </div>
            ))}
          </div>

          <Link to="/my-tickets" className="employee-ticket-bottom-btn">
            View All Tickets
          </Link>
        </div>

        

      </div>

      <div className="employee-bottom-grid">
        <div className="employee-knowledge-card">

            <div className="employee-knowledge-header">
            <h2><FiBookOpen /> Knowledge Base</h2>

            <button className="employee-knowledge-view-btn">
                View All
            </button>
            </div>

            <div className="employee-knowledge-grid">
            {knowledgeBase.map((item, index) => (
                <div
                key={index}
                className="employee-knowledge-item"
                >
                <div className="employee-knowledge-icon">
                    {item.icon}
                </div>

                <h4>{item.title}</h4>

                <p>{item.description}</p>
                </div>
            ))}
            </div>

        </div>

        <div className="employee-actions-card">
            <div className="employee-actions-header">
            <h2><FiZap />Quick Actions</h2>
            </div>

            <div className="employee-actions-list">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="employee-action-item"
                >
                  <div className="employee-action-icon">
                    {action.icon}
                  </div>

                  <div className="employee-action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default EmployeeSection;
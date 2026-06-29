import "./itSection.css";
import {
  FiTool,
  FiAlertTriangle,
  FiBell,
  FiMessageSquare,
  FiCheckCircle,
  FiServer,
  FiWifi,
  FiMonitor,
  FiAlertCircle,
  FiClipboard,
  FiActivity ,
  FiPlusSquare,
  FiUser,
  FiPaperclip,
  
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../../utils/formatTimeAgo"; 
import { getNotificationStyle } from "../../utils/notificationsUtils";


function ITSection() {
  const [updates, setUpdates] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [notifications, setNotifications]=useState([]);

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

  

  useEffect(() => {
    const fetchUpdates = async () => {
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

        setUpdates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("ERROR loading updates:", err);
      }
    };
    const fetchAssignedTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/assigned-tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setAssignedTickets(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log(err);
      }
    };

    const fetchUrgentTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/urgent-tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setUrgentTickets(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log(err);
      }
    };
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.log(err);
      }
    };



    fetchUpdates();
    fetchAssignedTickets();
    fetchUrgentTickets();
    fetchNotifications();
  }, []);

  const getUpdateStyle = (action) => {
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

      case "Assigned":
        return {
          icon: <FiUser />,
          color: "teal",
        };

      default:
        return {
          icon: <FiActivity />,
          color: "gray",
        };
    }
  };
  const recentUpdatesMapped = updates.map((a) => {
    const { icon, color } = getUpdateStyle(a.Action);

    const time = formatTime(a.CreatedAt);

    let title = "";

    if (a.Action === "Status Changed") {
      title = `Status → ${a.NewValue}`;
    } else if (a.Action === "Ticket Updated") {
      title = `Updated Ticket ${a.TicketNumber}`;
    } else if (a.Action === "Created Ticket") {
      title = `Created Ticket ${a.TicketNumber}`;
    } else {
      title = `${a.Action} ${a.TicketNumber}`;
    }

    return {
      icon,
      title,
      time,
      color,
    };
  });
  

  const getTicketIcon = (title) => {
    const text = title?.toLowerCase() || "";

    if (text.includes("printer")) return <FiMonitor />;
    if (text.includes("vpn")) return <FiWifi />;
    if (text.includes("server")) return <FiServer />;

    return <FiClipboard />;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "it-priority-high";

      case "Medium":
        return "it-priority-medium";

      case "Low":
        return "it-priority-low";

      default:
        return "";
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "it-status-open";

      case "In Progress":
        return "it-status-progress";

      case "Resolved":
        return "it-status-resolved";

      case "Closed":
        return "it-status-closed";

      default:
        return "";
    }
  };
  

  return (
    <div className="it-dashboard-section">
      <div className="it-top-grid">

        {/* Assigned Tickets */}
        <div className="it-assigned-card">
          <div className="it-assigned-header">
            <h2><FiClipboard />Assigned Tickets</h2>

            <Link to="/assigned-tickets" className="it-assigned-view-btn">
              View All
            </Link>
          </div>

          <div className="it-assigned-list">
            {assignedTickets.map((ticket) => (
              <div
                key={ticket.ID}
                className="it-ticket-item"
              >
                <div className="it-ticket-icon">
                  {getTicketIcon(ticket.Title)}
                </div>

                <div className="it-ticket-content">
                  <h4>{ticket.Title}</h4>

                  <span>
                    {ticket.TicketNumber}
                  </span>

                  <div className={`it-ticket-status ${getStatusClass(
                      ticket.StatusName
                    )}`}
                  >
                    {ticket.StatusName}
                  </div>
                </div>

                <div
                  className={`it-ticket-priority ${getPriorityClass(
                    ticket.PriorityName
                  )}`}
                >
                  {ticket.PriorityName}
                </div>
              </div>
            ))}
          </div>

          <Link to="/assigned-tickets" className="it-ticket-bottom-btn">
            View All Assigned Tickets
          </Link>
        </div>

        {/* Urgent Tickets */}
        <div className="it-urgent-card">
          <div className="it-urgent-header">
            <h2><FiAlertTriangle />Urgent Tickets</h2>

            
          </div>

          <div className="it-urgent-list">
            {urgentTickets.map((ticket) => (
              <div
                key={ticket.ID}
                className="it-urgent-item"
              >
                <div className="it-urgent-icon">
                  <FiAlertCircle />
                </div>

                <div className="it-urgent-content">
                  <h4>{ticket.Title}</h4>

                  <span>
                    {ticket.TicketNumber}
                  </span>

                  <div className="it-ticket-meta">
                    <span className={`it-status-text ${getStatusClass(ticket.StatusName)}`}>
                      {ticket.StatusName}
                    </span>

                    <span className="it-dot">•</span>

                    <span className="it-time">
                      {formatTimeAgo(ticket.CreatedAt)}
                    </span>
                  </div>
                </div>

                <div className="it-urgent-priority">
                  <FiAlertTriangle />HIGH
                </div>
              </div>
            ))}
            <Link to="/assigned-tickets?priority=High" className="it-ticket-bottom-btn">
              View All Urgent Tickets
            </Link>
          </div>
        </div>
      </div>

      <div className="it-bottom-grid">

        {/* Recent Updates */}
        <div className="it-updates-card">
          <div className="it-updates-header">
            <h2><FiActivity />Recent Updates</h2>

            <Link to="/activity" className="it-updates-view-btn">
              View All
            </Link>
          </div>

          <div className="it-updates-list">
            {recentUpdatesMapped.map((update, index) => (
              <div key={index} className="it-update-item">
                <div className={`it-update-icon ${update.color}`}>
                  {update.icon}
                </div>

                <div className="it-update-content">
                  <h4>{update.title}</h4>
                </div>

                <span className="it-update-time">
                  {update.time}
                </span>
              </div>
            ))}
          </div>
          <Link to="/activity" className="it-ticket-bottom-btn">
            View All Recent Update
          </Link>
        </div>

        {/* Notifications */}
        <div className="it-notifications-card">
          <div className="it-notifications-header">
            <h2><FiBell />Notifications</h2>

            
          </div>

          <div className="it-notifications-list">
            {notifications.map((n) => {
              console.log(n.Type);
              const { icon, color } = getNotificationStyle(n.Type);
              
              return (
                <div key={n.ID} className="it-notification-item">

                  <div className={`mini-icon ${color}`}>
                    {icon}
                  </div>

                  <div className="it-notification-content">

                    <div className="it-notification-title">
                      {n.Title}
                    </div>

                    <div className="it-notification-text">
                      {n.Message}
                    </div>

                    <span className="it-time">
                      {formatTimeAgo(n.CreatedAt)}
                    </span>

                  </div>
                </div>
              );
              
            })}
            <Link to="/notifications" className="it-ticket-bottom-btn">
              View All Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ITSection;
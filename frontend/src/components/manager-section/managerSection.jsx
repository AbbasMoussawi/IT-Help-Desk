import "./managerSection.css";
import {
  FiUserX,
  FiAlertTriangle,
  FiActivity,
  FiBell,
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiMessageSquare,
  FiInbox,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { getNotificationStyle } from "../../utils/notificationsUtils";

function ManagerSection() {
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [highPriorityTickets, setHighPriorityTickets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [notifications, setNotifications]=useState([]);
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

    const fetchUnassigned = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5050/api/dashboard/unassigned-tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setUnassignedTickets(Array.isArray(data) ? data : []);
    };

    const fetchHighPriority = async () => {
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
    };

    const fetchTeamPerformance = async () => {
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

        setTeamPerformance(Array.isArray(data) ? data : []);
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
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchActivities();
    fetchUnassigned();
    fetchHighPriority();
    fetchTeamPerformance();
    fetchNotifications();
  }, []);
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

  const teamActivity = activities.map((a) => {
    let icon = <FiActivity />;
    let color = "blue";

    if (a.Action === "Created Ticket") {
      icon = <FiInbox />;
      color = "green";
    }

    if (a.Action === "Status Changed") {
      icon = <FiCheckCircle />;
      color = "orange";
    }

    if (a.Action === "Ticket Updated") {
      icon = <FiActivity />;
      color = "blue";
    }
    if (a.Action === "Assigned") {
      icon = <FiUsers />;
      color = "purple";
    }

    return {
      icon,
      color,
      title: `${a.UserName} - ${a.Action}`,
      description: a.NewValue,
      ticket: a.TicketNumber,
      time: formatTime(a.CreatedAt),
    };
  });

  
  

  

  

  
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

  
  return (
    <div className="manager-dashboard-section">
      <div className="manager-top-grid">
        {/* Unassigned Tickets */}
        <div className="manager-unassigned-card">
          <div className="manager-unassigned-header">
            <h2><FiInbox />Unassigned Tickets</h2>
            
          </div>

          <div className="manager-unassigned-list">
            {unassignedTickets.length === 0 ? (
              <div className="manager-empty-state">
                <FiInbox />
                <p>No unassigned tickets available</p>
              </div>
            ) : (
              unassignedTickets.map((ticket, index) => (
                <div key={index} className="manager-unassigned-item">
                  <div className="manager-unassigned-icon">
                    <FiUserX />
                  </div>

                  <div className="manager-unassigned-content">
                    <h4>{ticket.Title}</h4>
                    <span>{ticket.TicketNumber}</span>
                    <p>{formatTimeAgo(ticket.CreatedAt)}</p>
                  </div>
                </div>
              ))
            )}
            <Link
              to="/ticket-management?assigned=unassigned"
              className="manager-ticket-bottom-btn"
            >
              View All Unassigned Tickets
            </Link>
          </div>
        </div>

        {/* High Priority */}
        <div className="manager-priority-card">
          <div className="manager-priority-header">
            <h2><FiAlertTriangle />High Priority Tickets</h2>
            
          </div>

          <div className="manager-priority-list">
            {highPriorityTickets.length === 0 ? (
              <div className="manager-empty-state">
                <FiAlertTriangle />
                <p>No high priority tickets</p>
              </div>
            ) : (
              highPriorityTickets.map((ticket) => (
                <div key={ticket.ID} className="manager-priority-item">
                  <div className="manager-priority-icon">
                    <FiAlertTriangle />
                  </div>

                  <div className="manager-priority-content">
                    <h4>{ticket.Title}</h4>
                    <span className="manager-priority-content-number">{ticket.TicketNumber}</span>

                    <div className="manager-meta">
                      <span className={`manager-status ${getStatusClass(ticket.StatusName)}`}>
                        {ticket.StatusName}
                      </span>

                      <span className="manager-dot">•</span>

                      <span className="manager-time">
                        {formatTimeAgo(ticket.CreatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link
              to="/ticket-management?priority=High"
              className="manager-ticket-bottom-btn"
            >
              View All High Priority Tickets
            </Link>
          </div>
        </div>

        {/* Team Performance */}
        <div className="manager-performance-card">
          <div className="manager-performance-header">
            <h2><FiBarChart2 />Team Performance</h2>
          </div>

          <div className="manager-performance-list">
            {teamPerformance.map((member) => (
              <div key={member.ID} className="manager-performance-item">
                <div className="manager-performance-icon">
                  <FiUsers />
                </div>

                <div className="manager-performance-content">
                  <h4>{member.FullName}</h4>
                  <p>{member.ResolvedCount} Resolved</p>
                </div>
              </div>
            ))}
            <Link to="/team-performance"  className="manager-ticket-bottom-btn">
              View All Team Performance
            </Link>
          </div>
        </div>
      </div>

      <div className="manager-bottom-grid">
        <div className="manager-activity-card">
          <div className="manager-activity-header">
            <h2><FiTrendingUp />Team Activity</h2>
            <Link to="/activity" className="manager-updates-view-btn">View All</Link>
          </div>

          <div className="manager-activity-list">
            {teamActivity.map((activity, index) => (
              <div key={index} className="manager-activity-item">

                <div className={`manager-activity-icon ${activity.color}`}>
                  {activity.icon}
                </div>

                <div className="manager-activity-main">

                  <div className="manager-activity-title">
                    {activity.title}
                  </div>

                  <div className="manager-activity-description">
                    {activity.description}
                  </div>

                  <div className="manager-activity-ticket">
                    {activity.ticket}
                  </div>

                </div>

                <div className="manager-activity-time">
                  {activity.time}
                </div>

              </div>
            ))}
            <Link to="/activity" className="manager-ticket-bottom-btn">
              View All Team Activity
            </Link>
          </div>
        </div>
        

        {/* Notifications */}
        <div className="manager-notifications-card">
          <div className="manager-notifications-header">
            <h2><FiBell />Notifications</h2>
            
          </div>

          <div className="manager-notifications-list">
            {notifications.map((n) => {
              const { icon, color } = getNotificationStyle(n.Type);
              return (
                <div key={n.ID} className="manager-notification-item">
                  <div className={`mini-icon ${color}`}>
                    {icon}
                  </div>
                  <div className="manager-notification-content">
                    <h4>{n.Title}</h4>
                    <p className="manager-notification-text">
                      {n.Message}
                    </p>
                    <span className="manager-notification-time">
                      {formatTimeAgo(n.CreatedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <Link to="/notifications" className="manager-ticket-bottom-btn">
              View All Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerSection;
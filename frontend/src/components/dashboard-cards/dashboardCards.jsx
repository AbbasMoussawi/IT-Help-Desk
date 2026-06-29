import "./dashboardCards.css";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";

function DashboardCards({ role, counters }) {
  let cards = [];

  switch (role) {
    case "Employee":
      cards = [
        { title: "My Tickets", value: counters.totalTickets || 0, subtitle: "Total", icon: <FiFileText />, color: "primary", path: "/my-tickets" },
        { title: "Open", value: counters.openTickets || 0, icon: <FiFileText />, color: "open", path: "/my-tickets?status=Open" },
        { title: "In Progress", value: counters.progressTickets || 0, icon: <FiClock />, color: "progress", path: `/my-tickets?status=${encodeURIComponent("In Progress")}` },
        { title: "Resolved", value: counters.resolvedTickets || 0, icon: <FiCheckCircle />, color: "resolved", path: "/my-tickets?status=Resolved" },
        
      ];
      break;

    case "IT Support":
      cards = [
        { title: "Assigned Tickets", value: counters.totalTickets || 0, subtitle: "Total", icon: <FiFileText />, color: "primary", path: "/assigned-tickets" },
        { title: "Open", value: counters.openTickets || 0, icon: <FiFileText />, color: "open", path: "/open-tickets" },
        { title: "In Progress", value: counters.progressTickets || 0, icon: <FiClock />, color: "progress", path: "/in-progress" },
        { title: "Resolved", value: counters.resolvedTickets || 0, icon: <FiCheckCircle />, color: "resolved", path: "/resolved" },
        
      ];
      break;

    case "Manager":
      cards = [
        { title: "Total Tickets", value: counters.totalTickets || 0, subtitle: "Total", icon: <FiFileText />, color: "primary", path: "/ticket-management" },
        { title: "Open", value: counters.openTickets || 0, icon: <FiFileText />, color: "open", path: "/ticket-management?status=Open" },
        { title: "In Progress", value: counters.progressTickets || 0, icon: <FiClock />, color: "progress", path: `/ticket-management?status=${encodeURIComponent("In Progress")}` },
        { title: "Resolved", value: counters.resolvedTickets || 0, icon: <FiCheckCircle />, color: "resolved", path: "/ticket-management?status=Resolved" },
        
      ];
      break;

    case "Admin":
      cards = [
        { title: "Total Users", value: counters.totalUsers || 0, subtitle: "Total",  icon: <FiUsers />, color: "primary", path: "/users" },
        { title: "Total Tickets", value: counters.totalTickets || 0, subtitle: "Total", icon: <FiFileText />, color: "primary", path: "/ticket-management" },
        { title: "Open", value: counters.openTickets || 0, icon: <FiFileText />, color: "open", path: "/ticket-management?status=Open" },
        { title: "In Progress", value: counters.progressTickets || 0, icon: <FiClock />, color: "progress", path: `/ticket-management?status=${encodeURIComponent("In Progress")}` },
        { title: "Resolved", value: counters.resolvedTickets || 0, icon: <FiCheckCircle />, color: "resolved", path: "/ticket-management?status=Resolved" },
      ];
      break;

    default:
      cards = [];
  }

  return (
    <div className="dashboard-cards">
      {cards.map((card, index) => (
        <Link
          key={index}
          to={card.path}
          className={`dashboard-card ${card.color}`}
        >
          <div className="card-container">
            <div className="card-icon">
              {card.icon}
            </div>

            <div className="card-title">
              <h3>{card.title}</h3>
              <h1>{card.value}</h1>
              {card.subtitle && (
                <span className="card-subtitle">{card.subtitle}</span>
              )}
            </div>
          </div>

          <div className="card-footer">
            <div
              to={card.path}
              className="card-link"
            >
              <span className="view-all">
                View all
              </span>

              <FiArrowRight className="arrow" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default DashboardCards;
import "./activityPage.css";
import Sidebar from "../components/sidebar/sidebar";
import TopBar from "../components/topbar/topbar";
import { useEffect, useState } from "react";
import {
  FiPlusSquare,
  FiCheckCircle,
  FiTool,
  FiMessageSquare,
  FiUser,
  FiFileText,
  FiActivity,
  
} from "react-icons/fi";

import { FaArrowLeft, FaHistory } from "react-icons/fa";
import { formatTimeAgo } from "../utils/formatTimeAgo";
import { useNavigate } from "react-router-dom";


function ActivityPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  
  const getActivityStyle = (action) => {
    switch (action) {
      case "Created Ticket":
        return { icon: <FiPlusSquare />, color: "green" };

      case "Status Changed":
        return { icon: <FiCheckCircle />, color: "orange" };

      case "Ticket Updated":
        return { icon: <FiTool />, color: "blue" };

      case "Comment Added":
        return { icon: <FiMessageSquare />, color: "purple" };

      case "Assigned Ticket":
        return { icon: <FiUser />, color: "teal" };

      case "Attachment Uploaded":
        return { icon: <FiFileText />, color: "gray" };

      default:
        return { icon: <FiActivity />, color: "blue" };
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/activity?mode=activity",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setActivities(Array.isArray(data) ? data : []);
        console.log(data);
        console.log(data.map(a => a.Action));
      } catch (err) {
        console.log("ERROR loading activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      search === "" ||
      a.TicketNumber?.toString().toLowerCase().includes(search.toLowerCase()) ||
      a.NewValue?.toLowerCase().includes(search.toLowerCase()) ||
      a.Action?.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      actionFilter === "" || a.Action === actionFilter;

    const matchesStatus =statusFilter === "" || (a.Action === "Status Changed" && a.NewValue?.includes(statusFilter));

    return matchesSearch && matchesAction && matchesStatus;
  });
  const getDetails = (a) => {
    if (a.Action === "Ticket Updated") {
      return a.NewValue || "Ticket fields were modified";
    }

    if (a.Action === "Status Changed") {
      return `Status changed to ${a.NewValue || "-"}`;
    }

    return a.NewValue || "No details";
  };
  
  return (
    <div className="activity-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="activity-main">
        <TopBar setIsOpen={setIsOpen} title="Recent Ticket" icon={FaHistory}/>

        <div className="activity-page">
          <div className="activity-header">
            <FaArrowLeft className="back-icon" onClick={() => navigate(-1)}/>
            <div>
              <h2>Activity</h2>
              <p>All system activities based on your role</p>
            </div>
          </div>
          <div className="activity-filters">

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All Actions</option>
              <option value="Created Ticket">Created</option>
              <option value="Ticket Updated">Updated</option>
              <option value="Status Changed">Status Changed</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

          </div>

          {loading ? (
            <div className="activity-loading">Loading...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="activity-empty">
              No activity found for your filters
            </div>
          ) : (
            <div className="activity-list">
              {filteredActivities.map((a) => {
                const { icon, color } = getActivityStyle(a.Action);

                return (
                  <div key={a.ID} className="activity-card">

                    <div className="activity-card-top activity-grid">
                      <div className="activity-left">
                        <div className={`activity-icon ${color}`}>
                          {icon}
                        </div>
                        <div className="activity-text">
                          <span className="activity-title">
                            {a.UserName} - {a.Action}
                          </span>
                          <span className="activity-subtitle">
                            {getDetails(a)}
                          </span>
                          <span className="activity-ticket">
                            Ticket {a.TicketNumber}
                          </span>
                        </div>
                      </div>
                      <span className="activity-date">
                        {formatTimeAgo(a.CreatedAt)}
                      </span>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}

export default ActivityPage;
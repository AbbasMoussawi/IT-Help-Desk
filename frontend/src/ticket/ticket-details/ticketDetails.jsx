import "./ticketDetails.css";
import { FaDownload, FaUser, FaUserCog, FaLayerGroup, FaFlag, FaPaperclip, FaArrowLeft, FaInfoCircle   } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { getAllowedNextStatuses } from "../../utils/ticketStatusRules";
import {formatTimeAgo} from "../../utils/formatTimeAgo";

import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback  } from "react";
import { useNavigate } from "react-router-dom";


function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const isClosed = ticket?.StatusName === "Closed";
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  
  const [counts, setCounts] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    assigned: 0,
  });

  const role =(JSON.parse(localStorage.getItem("user"))?.role || "").toLowerCase();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const allowedStatuses = getAllowedNextStatuses(ticket?.StatusName, role) || [];
  const allStatuses = ["Open", "In Progress", "Resolved", "Closed"];

  
  const fetchTicket = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5050/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data.Attachments);
        setTicket(data);
        setAttachments(data.Attachments || []);
        setSelectedStatus(data.StatusName);
      }
    } catch (err) {
      console.log(err);
    }
  },[id]);

  
  const fetchComments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5050/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) setComments(data);
    } catch (err) {
      console.log(err);
    }
  },[id]);

  
  const fetchCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5050/api/assigned-tickets/sidebar-counts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) setCounts(data);
    } catch (err) {
      console.log(err);
    }
  },[]);

  
  const updateStatus = async () => {
    console.log("CLICKED");
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5050/api/tickets/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      await fetchTicket();
    } catch (err) {
      console.log(err);
    }
  };


  const addComment = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5050/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId: id,
          commentText: newComment,
          isInternal: isInternal
        }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAttachments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5050/api/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setAttachments(data.Attachments || []);
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  const uploadAttachment = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ticketId", id);

    const token = localStorage.getItem("token");

    await fetch("http://localhost:5050/api/attachments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await fetchAttachments(); 
  };
  
  const fetchActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5050/api/tickets/${id}/activity`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) setActivities(data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);
  useEffect(() => {
    fetchTicket();
    fetchComments();
    fetchCounts();
    fetchActivities();

    const interval = setInterval(() => {
      if (!isClosed) {
        fetchAttachments();
        fetchComments();
        fetchActivities();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, isClosed]);

  if (!ticket) return <div className="loading">Loading...</div>;
  

  const getStatusClass = (status) => {
    if (status === "Open") return "status-open";
    if (status === "In Progress") return "status-in-progress";
    if (status === "Resolved") return "status-resolved";
    return "status-closed";
  };

  const getAllowedStatuses = (currentStatus, role) => {
    if (role !== "Admin" && role !== "Manager" && role !== "IT Support") {
      return [];
    }

    switch (currentStatus) {
      case "Open":
        return ["In Progress"];

      case "In Progress":
        return ["Open", "Resolved"];

      case "Resolved":
        return ["In Progress", "Closed"];

      case "Closed":
        return [];

      default:
        return [];
    }
  };
  
  
  return (
    <div className="ticket-details-page">

      <Sidebar menuType="assigned" counts={counts} />
      <div className="main">

        <TopBar title="Ticket Details" icon={FaInfoCircle}/>

        <div className="ticket-details-container">

          <div className="ticket-details-page-header">
            <div className="ticket-details-page-header-title">
              <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
              <h1>Ticket Details</h1>
            </div>
            <span>{ticket.TicketNumber}</span>
          </div>

          <div className="ticket-details-card">

            <div className="ticket-details-top">
              <div>
                <h2>{ticket.Title}</h2>
                <p>
                  Created on: {formatTimeAgo(ticket.CreatedAt)}
                </p>
              </div>

              <span className={`status-badge ${getStatusClass(ticket.StatusName)}`}>
                {ticket.StatusName}
              </span>
            </div>

            <div className="ticket-details-info-grid">

              <div><FaUser /><div><span>Created By</span><p>{ticket.CreatedByName}</p></div></div>
              <div><FaUserCog /><div><span>Assigned To</span><p>{ticket.AssignedToName}</p></div></div>
              <div><FaLayerGroup /><div><span>Category</span><p>{ticket.CategoryName}</p></div></div>
              <div><FaFlag /><div><span>Priority</span><p>{ticket.PriorityName}</p></div></div>

            </div>

            <div className="description-box">
              <h3>Description</h3>
              <p>{ticket.Description}</p>
            </div>

            {(role === "admin" || role === "it support") && (
              <div className="action-box">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={ticket.StatusName === "Closed"}
                >
                  {allStatuses.map((status) => {
                    const isAllowed =
                      status === ticket.StatusName || allowedStatuses.includes(status);

                    return (
                      <option
                        key={status}
                        value={status}
                        disabled={!isAllowed}
                      >
                        {status}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={updateStatus}
                  disabled={!ticket || isClosed}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* ATTACHMENTS */}
          <div className="section-card">
            <h3>Attachments</h3>

            {attachments.map((a, i) => (
              <div key={i} className="attachment">
                <FaPaperclip />
                <span>{a.FilePath.split("/").pop()}</span>

                <div className="attachment-meta">
                  <small>{a.UploadedBy}</small>
                  <small>{formatTimeAgo(a.CreatedAt)}</small>
                </div>

                <a
                  href={`http://localhost:5050${a.FilePath}`}
                  download
                  className="download-icon"
                >
                  <FaDownload />
                </a>
              </div>
            ))}
          </div>
          {/* COMMENTS */}
          <div className={`section-card ${isClosed ? "closed" : ""}`}>

            <h3>Comments</h3>
            
            {comments.map((c) => {
              const myId = String(currentUser?.ID || currentUser?.id);
              const senderId = String(c.UserId);

              const isMine = myId === senderId;
              const isLeft = isMine;

              return (
                <div
                  key={c.ID}
                  className={`comment ${isLeft ? "comment-other" : "comment-own"}`}
                >
                  <strong>
                    {isMine ? "You" : c.FullName}
                  </strong>

                  <p>{c.CommentText}</p>

                  <small>
                    {formatTimeAgo(c.CreatedAt)}
                  </small>
                </div>
              );
            })}

            <div className={`comment-form ${isClosed ? "closed" : ""}`}>

            

              <div className="comment-form-send">
                <label className="attach-btn">
                  <FaPaperclip />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) uploadAttachment(file);
                    }} disabled={isClosed}
                  />
                </label>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write comment..." disabled={isClosed}
                />

                <button className="send-btn" onClick={addComment} disabled={isClosed || newComment.trim().length===0}>
                  <MdSend className="comment-form-button-icon"/>
                </button>
              </div>
              {/* INTERNAL CHECKBOX */}
              {role !== "employee" && (
                <label className="internal-check">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  Internal Comment
                </label>
              )}

            </div>

          </div>
          {role === "admin" && (
            <div className="activity-section">
              <h3>Activity Log</h3>

              {activities.map((activity) => (
                <div key={activity.ID} className="activity-item">

                  <strong>{activity.FullName}</strong>

                  <p>{activity.Action}</p>

                  {activity.OldValue && (
                    <div className="activity-change">
                      {activity.OldValue} → {activity.NewValue}
                    </div>
                  )}

                  <small>
                    {formatTimeAgo(activity.CreatedAt)}
                  </small>

                </div>
              ))}
            </div>

          )}

        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
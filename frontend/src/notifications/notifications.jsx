import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import Sidebar from "../components/sidebar/sidebar";
import TopBar from "../components/topbar/topbar";
import { formatTimeAgo } from "../utils/formatTimeAgo";
import "./notifications.css";
import { useRef } from "react";
import { getNotificationStyle } from "../utils/notificationsUtils";
import {FaBell} from "react-icons/fa";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({});
  
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      console.log(data[0]);
      setNotifications(data);
    } catch (err) {
      console.log(err);
    }
  };

  const socketRef = useRef(null);
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5050/api/assigned-tickets/sidebar-counts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCounts(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCounts();
    

    socketRef.current = io("http://localhost:5050");

    const userId = Number(localStorage.getItem("userId"));

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", userId);
    });

    socketRef.current.on("newNotification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    

    return () => {
      console.log("unmount fired");
      

      socketRef.current.disconnect();
    };
  }, []);
  

  const groupNotifications = () => {
    const today = [];
    const yesterday = [];
    const last7 = [];
    const older = [];

    const now = new Date();

    notifications.forEach((n) => {
      const date = new Date(n.CreatedAt);
      const diffDays = Math.floor((now - date) / 86400000);

      if (diffDays === 0) today.push(n);
      else if (diffDays === 1) yesterday.push(n);
      else if (diffDays < 7) last7.push(n);
      else older.push(n);
    });

    return { today, yesterday, last7, older };
  };

  const { today, yesterday, last7, older } = groupNotifications();

  const renderGroup = (title, items) => {
    if (!items.length) return null;

    return (
      <div className="notif-group">
        <h3>{title}</h3>

        {items.map((n) => {
          const { icon, color } = getNotificationStyle(n.Type);

          return (
            <div key={n.ID} className={`notif-card ${n.IsRead ? "" : "unread"}`}>

              <div className={`notif-icon ${color}`}>
                {icon}
              </div>

              <div className="notif-content">
                <div className="notif-top">
                  <div className="notif-title">{n.Title}</div>
                  <div className="notif-time">
                    {formatTimeAgo(n.CreatedAt)}
                  </div>
                </div>

                <div className="notif-msg">{n.Message}</div>

                {n.Message?.includes("TK-") && (
                  <div className="ticket-tag">
                    {n.Message.match(/TK-\d+/)?.[0]}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="notif-page">
      <Sidebar counts={counts} />
      <div className="notif-main">
        <TopBar title="Notifications" icon={FaBell}/>

        <div className="notif-container">
          {renderGroup("Today", today)}
          {renderGroup("Yesterday", yesterday)}
          {renderGroup("Last 7 Days", last7)}
          {renderGroup("Older", older)}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
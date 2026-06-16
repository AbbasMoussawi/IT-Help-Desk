import "./assignedTicket.css";
import {
  FaSearch,
  FaUser,
  FaCalendar,
  FaPaperclip,
  FaDownload,
  FaSyncAlt,
} from "react-icons/fa";

import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useEffect, useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";

function AssignedTicket() {
  const [isOpen, setIsOpen] = useState(false);
  const didFetch = useRef(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");

  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    assigned: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [filterData, setFilterData] = useState({
    categories: [],
    statuses: [],
    priorities: [],
  });

  
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5050/api/assigned-tickets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error fetching tickets");
        return;
      }

      setTickets(data.assigned || []);
    } catch (err) {
      console.log(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  
  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5050/api/assigned-tickets/filters",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setFilterData(data);
      }
    } catch (err) {
      console.log("FILTER ERROR:", err);
    }
  };

  
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
    if (didFetch.current) return;

    didFetch.current = true;

    fetchTickets();
    fetchFilters();
    fetchCounts();
  }, []);

  
  const filteredTickets = tickets.filter((t) => {
    const title = t.Title || "";
    const desc = t.Description || "";
    const number = t.TicketNumber || "";

    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      number.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === "All" || t.StatusName === status;

    const matchPriority =
      priority === "All" || t.PriorityName === priority;

    const matchCategory =
      category === "All" || t.CategoryName === category;

    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  
  const handleExport = () => {
    const header = "TicketNumber,Title,Status,Priority,Category,CreatedBy,AssignedTo,CreatedAt\n";

    const rows = tickets
      .map(
        (t) =>
          `${t.TicketNumber},${t.Title},${t.StatusName},${t.PriorityName},${t.CategoryName},${t.CreatedByName || "-"},${t.AssignedToName || "-"},${new Date(t.CreatedAt).toLocaleString()}`
      )
      .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tickets.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="layout">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        menuType="assigned"
        counts={counts}
      />

      <div className="main">
        <TopBar setIsOpen={setIsOpen} />

        <div className="page">

          {/* HEADER */}
          <div className="header">
            <div>
              <h2>Assigned Tickets</h2>
              <p>Tickets assigned to you that need attention.</p>
            </div>

            <div className="header-buttons">
              <button className="btn-outline" onClick={handleExport}>
                <FaDownload /> Export
              </button>

              <button className="btn-primary" onClick={fetchTickets}>
                <FaSyncAlt /> Refresh
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="filters">

            {/* SEARCH */}
            <div className={`search ${search ? "active" : ""}`}>
              <FaSearch />
              <input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {filterData.statuses?.map((s) => (
                <option key={s.ID} value={s.StatusName}>
                  {s.StatusName}
                </option>
              ))}
            </select>

            {/* PRIORITY */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="All">All Priority</option>
              {filterData.priorities?.map((p) => (
                <option key={p.ID} value={p.PriorityName}>
                  {p.PriorityName}
                </option>
              ))}
            </select>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Category</option>
              {filterData.categories?.map((c) => (
                <option key={c.ID} value={c.CategoryName}>
                  {c.CategoryName}
                </option>
              ))}
            </select>

            {/* CLEAR */}
            <button
              className="clear"
              onClick={() => {
                setSearch("");
                setStatus("All");
                setPriority("All");
                setCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* CONTENT */}
          <div className="tickets">

            {loading && (
              <div className="empty-state">Loading tickets...</div>
            )}

            {!loading && error && (
              <div className="empty-state error">{error}</div>
            )}

            {!loading &&
              !error &&
              filteredTickets.length === 0 && (
                <div className="empty-state">
                  <h3>No Results Found</h3>
                  <p>No tickets match your filters.</p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredTickets.map((t) => (
                <div
                  key={t.ID}
                  className={`ticket ${t.StatusName
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <div className="ticket-top">
                    <span className="ticket-number">
                      {t.TicketNumber}
                    </span>

                    <span
                      className={`status ${t.StatusName
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {t.StatusName}
                    </span>
                  </div>

                  <h3>{t.Title}</h3>
                  <p className="desc">{t.Description}</p>

                  <div className="tags">
                    <span>{t.CategoryName}</span>

                    <span className={`priority ${t.PriorityName?.toLowerCase()}`}>
                      {t.PriorityName}
                    </span>
                  </div>

                  <div className="info">
                    <span>
                      <FaUser /> {t.CreatedByName}
                    </span>

                    <span>
                      <FaCalendar />{" "}
                      {new Date(t.CreatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="bottom">
                    <span>
                      <FaPaperclip /> {t.Attachments?.length || 0}
                    </span>

                    <button onClick={() => navigate(`/ticket-details/${t.ID}`)}>
                      View Ticket
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AssignedTicket;
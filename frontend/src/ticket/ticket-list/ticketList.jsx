import "./ticketList.css";
import { useEffect, useState, useCallback, useRef   } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";

import {
  FaSearch,
  FaDownload,
  FaSyncAlt,
  FaUser,
  FaCalendar,
  FaPaperclip,
  FaInbox,
  FaFolderOpen,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function TicketList({ statusFilter }) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const didFetch = useRef(false);
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [filters, setFilters] = useState({
    priorities: [],
    categories: [],
    statuses: [],
  });

  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const url =
            statusFilter && statusFilter !== "All"
                ? `http://localhost:5050/api/tickets?status=${statusFilter}`
                : `http://localhost:5050/api/tickets`;

            const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.ok) {
            setTickets(data.tickets || []);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
  }, [statusFilter]);

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5050/api/assigned-tickets/filters",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) setFilters(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCounts = async () => {
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
  };

  useEffect(() => {
    if (didFetch.current) return;

    didFetch.current = true;

    fetchTickets();
    fetchFilters();
    fetchCounts();
  }, [fetchTickets]);

 
  const filteredTickets = tickets.filter((t) => {
    const text = search.toLowerCase();

    const matchSearch =
      t.Title?.toLowerCase().includes(text) ||
      t.Description?.toLowerCase().includes(text) ||
      t.TicketNumber?.toLowerCase().includes(text);

    const matchPriority =
      priority === "All" || t.PriorityName === priority;

    const matchCategory =
      category === "All" || t.CategoryName === category;

    const matchStatus =
      status === "All" || t.StatusName === status;

    return matchSearch && matchPriority && matchCategory && matchStatus;
  });

  const handleExport = () => {
    const header = "TicketNumber,Title,Status,Priority,Category,CreatedBy,AssignedTo,CreatedAt\n";

    const rows = tickets
      .map(
        (t) =>
          `${t.TicketNumber},${t.Title},${t.StatusName},${t.PriorityName},${t.CategoryName},${t.CreatedByName},${t.AssignedToName || "-"},${new Date(t.CreatedAt).toLocaleString()}`
      )
      .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${statusFilter || "tickets"}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  };
  const pageConfig =
    statusFilter === "Open"
      ? { title: "Tickets Open", icon: FaFolderOpen }
      : statusFilter === "In Progress"
      ? { title: "Tickets In Progress", icon: FaSpinner }
      : statusFilter === "Resolved"
      ? { title: "Tickets Resolved", icon: FaCheckCircle }
      : statusFilter === "Closed"
      ? { title: "Tickets Closed", icon: FaTimesCircle }
      : { title: "All Tickets", icon: FaInbox };

  const { title: pageTitle, icon: PageIcon } = pageConfig;

  return (
    <div className="ticket-list-layout">

      <Sidebar menuType="assigned" counts={counts} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="ticket-list-main">

        <TopBar setIsOpen={setIsOpen}  title={pageTitle} icon={PageIcon}/>

        <div className="ticket-list-page">

          {/* HEADER */}
          <div className="ticket-list-header">
            <h2>{statusFilter || "All Tickets"}</h2>

            <div className="header-actions">
              <button className="header-actions-btn-outline" onClick={handleExport}>
                <FaDownload /> Export
              </button>

              <button className="header-actions-btn-primary" onClick={fetchTickets}>
                <FaSyncAlt /> Refresh
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="ticket-list-filters">

            <div className="search-box">
              <FaSearch />
              <input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>


            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="All">All Priority</option>
              {filters.priorities?.map((p) => (
                <option key={p.ID} value={p.PriorityName}>
                  {p.PriorityName}
                </option>
              ))}
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Category</option>
              {filters.categories?.map((c) => (
                <option key={c.ID} value={c.CategoryName}>
                  {c.CategoryName}
                </option>
              ))}
            </select>

            <button
              className="clear-btn"
              onClick={() => {
                setSearch("");
                setPriority("All");
                setCategory("All");
                setStatus("All");
              }}
            >
              Clear Filtres
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">
              <h3>No Results Found</h3>
              <p>No tickets match your filters.</p>
            </div>
          ) : (
            <div className="ticket-list-container">

              {filteredTickets.map((t) => (
                <div
                    key={t.ID}
                    className={`ticket-list-card ${
                        t.StatusName === "Open"
                        ? "open"
                        : t.StatusName === "In Progress"
                        ? "in-progress"
                        : t.StatusName === "Resolved"
                        ? "resolved"
                        : t.StatusName === "Closed"
                        ? "closed"
                        : ""
                    }`}
                >

                  <div className="ticket-top">
                    <span className="ticket-number">{t.TicketNumber}</span>

                    <span className={`status-badge status-${t.StatusName?.toLowerCase().replace(/\s/g, "-")}`}>
                      {t.StatusName}
                    </span>
                  </div>

                  <h3>{t.Title}</h3>
                  <p>{t.Description}</p>

                  <div className="tags">
                    <span>{t.CategoryName}</span>
                    <span className={`priority ${t.PriorityName?.toLowerCase()}`}>
                      {t.PriorityName}
                    </span>
                  </div>

                  <div className="info">
                    <span><FaUser /> {t.CreatedByName}</span>
                    <span><FaCalendar /> {new Date(t.CreatedAt).toLocaleString()}</span>
                  </div>

                  <div className="bottom">
                    <span><FaPaperclip /> {t.AttachmentCount || 0}</span>

                    <button
                      className="ticket-list-btn"
                      onClick={() => navigate(`/ticket-details/${t.ID}`)}
                    >
                      View Ticket
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default TicketList;
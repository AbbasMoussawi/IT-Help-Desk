import "../assigned-ticket/assignedTicket.css";
import {
  FaSearch,
  FaCalendar,
  FaPaperclip,
  FaDownload,
  FaSyncAlt,
  FaUserCog,
  FaHourglass,
  FaPlus,
  FaTicketAlt 
} from "react-icons/fa";

import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function MyTickets() {
  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(
    searchParams.get("status") || "All"
  );
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "All";
    setStatus(urlStatus);
  }, [searchParams]);
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

  const [filterData, setFilterData] = useState({
    categories: [],
    statuses: [],
    priorities: [],
  });

  const navigate = useNavigate();

  
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5050/api/my-tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error fetching tickets");
        return;
      }

      setTickets(data.tickets || []);
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

      if (res.ok) setFilterData(data);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) setCounts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchFilters();
    fetchCounts();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const text = search.toLowerCase();

    const matchSearch =
      (t.Title || "").toLowerCase().includes(text) ||
      (t.Description || "").toLowerCase().includes(text) ||
      (t.TicketNumber || "").toLowerCase().includes(text);

    const matchStatus = status === "All" || t.StatusName === status;
    const matchPriority = priority === "All" || t.PriorityName === priority;
    const matchCategory = category === "All" || t.CategoryName === category;

    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  const handleExport = () => {
    const header ="TicketNumber,Title,Status,Priority,Category,CreatedBy,AssignedTo,CreatedAt\n";

    const rows = tickets
      .map((t) =>
        [
          t.TicketNumber,
          t.Title,
          t.StatusName,
          t.PriorityName,
          t.CategoryName,
          t.CreatedByName || "-",
          t.AssignedToName || "-",
          new Date(t.CreatedAt).toLocaleString(),
        ].join(",")
      )
      .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "my-tickets.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="layout">

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        menuType="employee"
        counts={counts}
      />

      <div className="main">

        <TopBar setIsOpen={setIsOpen} title="My Tickets" icon={FaTicketAlt }/>

        <div className="page">

          {/* HEADER */}
          <div className="header">
            <div>
              <h2>My Tickets</h2>
              <p>Tickets created by you</p>
            </div>

            <div className="header-buttons">
              <button className="btn-outline" onClick={handleExport}>
                <FaDownload /> Export
              </button>

              <button className="btn-primary" onClick={fetchTickets}>
                <FaSyncAlt /> Refresh
              </button>
              <button className="ticket-management-new-btn"
                  onClick={() => navigate("/create-ticket")}
              >
                  <FaPlus />New Ticket
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="filters">

            <div className="search">
              <FaSearch />
              <input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select value={status} onChange={(e) => {
              const value = e.target.value;
              setStatus(value);

              if (value === "All") {
                setSearchParams({});
              } else {
                setSearchParams({ status: value });
              }
            }}>
              <option value="All">All Status</option>
              {filterData.statuses?.map((s) => (
                <option key={s.ID} value={s.StatusName}>
                  {s.StatusName}
                </option>
              ))}
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="All">All Priority</option>
              {filterData.priorities?.map((p) => (
                <option key={p.ID} value={p.PriorityName}>
                  {p.PriorityName}
                </option>
              ))}
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Category</option>
              {filterData.categories?.map((c) => (
                <option key={c.ID} value={c.CategoryName}>
                  {c.CategoryName}
                </option>
              ))}
            </select>

            <button
              className="clear"
              onClick={() => {
                setSearch("");
                setStatus("All");
                setPriority("All");
                setCategory("All");
                navigate("/my-tickets")
              }}
            >
              Clear Filtres
            </button>

          </div>

          {/* CONTENT */}
          <div className="tickets">

            {loading && <div className="empty-state">Loading...</div>}

            {!loading && error && (
              <div className="empty-state error">{error}</div>
            )}

            {!loading && !error && filteredTickets.length === 0 && (
              <div className="empty-state">
                No tickets found
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

                {/* TOP */}
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

                {/* TITLE */}
                <h3>{t.Title}</h3>
                <p className="desc">{t.Description}</p>

                {/* TAGS (CATEGORY + PRIORITY) */}
                <div className="tags">
                    <span>{t.CategoryName}</span>

                    <span className={`priority ${t.PriorityName?.toLowerCase()}`}>
                    {t.PriorityName}
                    </span>
                </div>

                {/* INFO (DATE + OWNER) */}
                <div className="info">
                    {/* IT ASSIGNMENT */}
                    <span>
                        {t.ITName ? (
                        <>
                            <FaUserCog /> {t.ITName}
                        </>
                        ) : (
                        <>
                            <FaHourglass /> Not yet assigned
                        </>
                        )}
                    </span>
                    {/* CREATED AT */}
                    <span>
                        <FaCalendar />{" "}
                        {new Date(t.CreatedAt).toLocaleString()}
                    </span>

                    

                </div>

                {/* BOTTOM */}
                <div className="bottom">
                    <span>
                    <FaPaperclip /> {t.AttachmentCount || 0}
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

export default MyTickets;
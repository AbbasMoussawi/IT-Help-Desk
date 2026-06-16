import { useState, useEffect } from "react";
import "./ticketManagement.css";

import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { getAllowedNextStatuses } from "../../utils/ticketStatusRules";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSyncAlt,
} from "react-icons/fa";

function TicketManagement() {
  const [isOpen, setIsOpen] = useState(false);
  

  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.trim().toLowerCase();
  const canEdit = role === "admin" || role==="manager";
  const canDelete = role === "admin";
  const canView = role === "admin" || role === "manager";
  const navigate = useNavigate();

  const [filterData, setFilterData] = useState({
    categories: [],
    statuses: [],
    priorities: [],
  });

  

  const filteredTickets = useMemo(() => {
    return ticketsData.filter((t) => {
      const title = t.Title || "";
      const desc = t.Description || "";
      const number = String(t.TicketNumber || "");

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
  }, [ticketsData, search, status, priority, category]);

  const fetchTickets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/ticket-management",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setTicketsData(data.tickets || []);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
  };
  const fetchFilters = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/ticket-management/filters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("FILTERS RESPONSE:", data);

        if (res.ok) {
          setFilterData(data);
        }
      } catch (err) {
        console.log(err);
      }
  };

  const handleExport = () => {
    const header = "TicketNumber,Title,Status,Priority,Category,CreatedBy,AssignedTo,CreatedAt\n";

    const rows = ticketsData
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
    a.download = "tickets.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };
  useEffect(() => {
    fetchFilters();
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5050/api/ticket-management/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      fetchTickets();
    }
  };


  return (
    <div className="ticket-management-page">
      
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="ticket-management-content">
        <TopBar
          setIsOpen={setIsOpen}
          showSearch={false}
          title="Ticket Management"
        />
        
        <div className="ticket-management-container">

          <div className="ticket-management-header">
            <div>
              <h1>Tickets</h1>
              <p>Manage and track all support tickets</p>
            </div>
            <div className="ticket-management-btn">
                <button className="ticket-management-btn-outline" onClick={handleExport}>
                  <FaDownload /> Export
                </button>
                
                <button className="ticket-management-btn-primary refresh-btn"
                  onClick={async () => {
                    setRefreshing(true);
                    await fetchTickets();
                    setRefreshing(false);
                  }}
                >
                  <FaSyncAlt className={refreshing ? "spin" : ""} />
                  Refresh
                </button>
                <button className="ticket-management-new-btn"
                 onClick={() => navigate("/create-ticket")}
                >
                  <FaPlus />New Ticket
                </button>
            </div>
          </div>

          <div className="ticket-management-filters">

            {/* SEARCH */}
            <div className={`ticket-management-search ${search ? "active" : ""}`}>
              <FaSearch />
              <input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Status</option>
              {filterData.statuses?.map((s) => (
                <option key={s.ID} value={s.StatusName}>
                  {s.StatusName}
                </option>
              ))}
            </select>

            {/* PRIORITY */}
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="All">All Priority</option>

              {filterData.priorities?.map((p) => (
                <option key={p.ID} value={p.PriorityName}>
                  {p.PriorityName}
                </option>
              ))}
            </select>

            {/* CATEGORY */}
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Category</option>

              {filterData.categories?.map((c) => (
                <option key={c.ID} value={c.CategoryName}>
                  {c.CategoryName}
                </option>
              ))}
            </select>

            {/* CLEAR */}
            <button
              className="ticket-management-clear"
              onClick={() => {
                setSearch("");
                setStatus("All");
                setPriority("All");
                setCategory("All");
              }}
            >
              <FaSyncAlt />
              Clear Filters
            </button>

          </div>

          <div className="ticket-management-table-wrapper">

            <table className="ticket-management-table">

              <thead>
                <tr>
                  <th>Ticket No</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Assigned To</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="8" className="table-state">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      <div className="empty-state">
                        <h3>No Results Found</h3>
                        <p>No tickets match your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredTickets.map((ticket) => (
                  <tr key={ticket.TicketNumber}>

                    <td className="ticket-management-number">{ticket.TicketNumber}</td>

                    <td>
                      <div className="ticket-management-title-cell">
                        <h4>{ticket.Title}</h4>
                        <span>{ticket.Description}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`ticket-management-badge priority ${ticket.PriorityName
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}>
                        {ticket.PriorityName}
                      </span>
                    </td>

                    <td>
                      <span className={`ticket-management-badge status ${ticket.StatusName
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}>
                        {ticket.StatusName}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/users/${ticket.CreatedByUserId}`}
                        className="ticket-management-user"
                      >
                        <div className="ticket-management-avatar">
                          {ticket.CreatedByName?.charAt(0)}
                        </div>

                        <div>
                          <h5>{ticket.CreatedByName}</h5>
                          <span>{ticket.CreatedByRole}</span>
                        </div>
                      </Link>
                    </td>

                    <td>
                      <Link
                        to={`/users/${ticket.AssignedToUserId}`}
                        className="ticket-management-user"
                      >
                        <div className="ticket-management-avatar">
                          {ticket.AssignedToName?.charAt(0) || "-"}
                        </div>

                        <div>
                          <h5>{ticket.AssignedToName || "-"}</h5>
                          <span>{ticket.AssignedToRole || "-"}</span>
                        </div>
                      </Link>
                    </td>

                    <td>
                      <div className="ticket-management-date">
                        <span>{ticket.CreatedAt}</span>
                        <small>{ticket.time}</small>
                      </div>
                    </td>

                    <td>
                      <div className="ticket-management-actions">

                        {canView && (
                          <button
                            className="view"
                            onClick={() => navigate(`/ticket-details/${ticket.ID}`)}
                          >
                            <FaEye />
                          </button>
                        )}

                        {canEdit && ticket.StatusName !== "Closed" && (
                          <button
                            className="edit"
                            onClick={() => navigate(`/edit-ticket/${ticket.ID}`)}
                          >
                            <FaEdit />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            className="delete"
                            onClick={() => handleDelete(ticket.ID)}
                          >
                            <FaTrash />
                          </button>
                        )}

                      </div>
                  </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>

        </div>
      </div>
    </div>
  );
}

export default TicketManagement;
import { useState, useEffect } from "react";
import "./ticketManagement.css";

import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { getAllowedNextStatuses } from "../../utils/ticketStatusRules";
import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSearchParams} from "react-router-dom";
import { FaTasks } from "react-icons/fa";



import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSyncAlt,
  FaArrowLeft
} from "react-icons/fa";

function TicketManagement() {
  const [isOpen, setIsOpen] = useState(false);
  

  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [status, setStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.trim().toLowerCase();
  const canEdit = role === "admin" || role==="manager";
  const canDelete = role === "admin";
  const canView = role === "admin" || role === "manager";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assigned = searchParams.get("assigned");
  const priorityParam = searchParams.get("priority") || "All";
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFromUrl = params.get("category") || "All";
  const [category, setCategory] = useState(categoryFromUrl);
  

  useEffect(() => {
    const urlStatus = searchParams.get("status") || "All";
    setStatus(urlStatus);
  }, [searchParams]);

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

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

      const matchCategory =
        category === "All" || t.CategoryName === category;

      const matchPriority =
        priorityParam === "All" || t.PriorityName === priorityParam;

      const matchAssigned =
        assigned === "unassigned"
          ? t.AssignedToUserId === null
          : true;

      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchPriority &&
        matchAssigned
      );
    });
  }, [ticketsData, search, status, category, priorityParam, assigned]);

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
          icon={FaTasks}
        />
        
        <div className="ticket-management-container">

          <div className="ticket-management-header">
            <div className="ticket-management-header-title">
              <FaArrowLeft className="back-icon" onClick={() => navigate(-1)}/>
              <div>
                <h1>Tickets</h1>
                <p>Manage and track all support tickets</p>
              </div>
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
            <select
              value={status}
              onChange={(e) => {
                const value = e.target.value;
                setStatus(value);

                if (value === "All") {
                  navigate("/ticket-management");
                } else {
                  navigate(`/ticket-management?status=${encodeURIComponent(value)}`);
                }
              }}
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
              value={priorityParam}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "All") {
                  navigate("/ticket-management");
                } else {
                  navigate(`/ticket-management?priority=${value}`);
                }
              }}
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
              onChange={(e) => {
                const value = e.target.value;

                setCategory(value);

                if (value === "All") {
                  navigate("/ticket-management");
                } else {
                  navigate(`/ticket-management?category=${encodeURIComponent(value)}`);
                }
              }}
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
              className="ticket-management-clear"
              onClick={() => {
                setSearch("");
                setStatus("All");
                setCategory("All");
                navigate("/ticket-management");
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
                          {ticket.CreatedByImage ? (
                            <img
                              src={`http://localhost:5050/uploads/${ticket.CreatedByImage}`}
                              alt="user"
                            />
                          ) : (
                            ticket.CreatedByName?.charAt(0)
                          )}
                        </div>

                        <div>
                          <h5>{ticket.CreatedByName}</h5>
                          <span>{ticket.CreatedByRole}</span>
                        </div>
                      </Link>
                    </td>

                    <td>
                      {ticket.AssignedToUserId ? (
                        <Link
                          to={`/users/${ticket.AssignedToUserId}`}
                          className="ticket-management-user"
                        >
                          <div className="ticket-management-avatar">
                            {ticket.AssignedToImage ? (
                              <img
                                src={`http://localhost:5050/uploads/${ticket.AssignedToImage}`}
                                alt="user"
                              />
                            ) : (
                              ticket.AssignedToName?.charAt(0)?.toUpperCase()
                            )}
                          </div>

                          <div>
                            <h5>{ticket.AssignedToName}</h5>
                            <span>{ticket.AssignedToRole}</span>
                          </div>
                        </Link>
                      ) : (
                        <div className="ticket-management-user unassigned">
                          <div className="ticket-management-avatar">
                            -
                          </div>

                          <div>
                            <h5>Unassigned</h5>
                            <span>No user assigned</span>
                          </div>
                        </div>
                      )}
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
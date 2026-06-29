import "./userOverview.css";
import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useEffect, useState } from "react";
import { FiSearch, FiUserPlus, FiUser,
    FiMail,
    FiShield,
    FiUserCheck,
    
     

 } from "react-icons/fi";
 import { FaEye, FaEdit, FaTrash, FaUser, FaHeadset  } from "react-icons/fa";
 import { useLocation, useNavigate, Link } from "react-router-dom";

 

function UserOverview() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleFromUrl = params.get("role") || "All";
  const [roleFilter, setRoleFilter] = useState(roleFromUrl);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: null,
  });
  useEffect(() => {
    setRoleFilter(roleFromUrl);
  }, [roleFromUrl]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5050/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("DATA:", data);
      setUsers(Array.isArray(data) ? data : []);
    };
    console.log("FETCH USERS START");
    
    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((u) =>
      u.FullName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) =>
      roleFilter === "All" ? true : u.Role === roleFilter
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case "Admin":
            return <FiShield className="icon" />;
            case "Manager":
            return <FiUserCheck className="icon" />;
            case "IT Support":
            return <FaHeadset  className="icon" />;
            default:
            return <FiUser className="icon" />;
        }
    };

    const getAvatarClass = (role) => {
        switch (role) {
            case "Admin":
            return "user-avatar admin";
            case "Manager":
            return "user-avatar manager";
            case "IT Support":
            return "user-avatar it";
            default:
            return "user-avatar employee";
        }
    };

    const getInitials = (fullName) => {
        if (!fullName) return "";

        const parts = fullName.split(" ");

        const first = parts[0]?.charAt(0) || "";
        const second = parts[1]?.charAt(0) || "";

        return (first + second).toUpperCase();
    };
    const handleDelete = async (id) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5050/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.ID !== id));

        setDeleteModal({ open: false, userId: null });
      } else {
        alert(data.message);
      }
    };
  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <TopBar
            title="User Overview"
            icon={FaUser}
        />

        <div className="user-page">

          {/* HEADER */}
          <div className="user-header">
            <h2>User Overview</h2>

            <Link to="/create-user" className="new-user-btn">
              <FiUserPlus />
              New User
            </Link>
          </div>

          {/* SEARCH + FILTER */}
          <div className="user-controls">

            <div className="search-box">
              <FiSearch />
              <input
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                const value = e.target.value;
                setRoleFilter(value);

                navigate(`/users?role=${value}`);
              }}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="IT Support">IT Support</option>
              <option value="Employee">Employee</option>
            </select>

          </div>

          {/* TABLE */}
          <div className="user-table">

            <div className="user-header-row">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Actions</span>
            </div>

            {filteredUsers.map((u) => (
                <div key={u.ID} className="user-row">

                  {/* AVATAR + NAME */}
                  <div className="user-cell name-cell">
                      <div className={getAvatarClass(u.Role)}>
                        {u.Image ? (
                          <img
                            src={`http://localhost:5050/uploads/${u.Image}`}
                            alt="avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}

                        <span style={{ display: u.Image ? "none" : "flex" }}>
                          {getInitials(u.FullName)}
                        </span>
                      </div>
                      <span>{u.FullName}</span>
                  </div>

                  {/* EMAIL */}
                  <div className="user-cell">
                      <FiMail className="icon email-icon" />
                      <span>{u.Email}</span>
                  </div>

                  {/* ROLE */}
                  <div className="user-cell">
                      <div className={`role-icon ${u.Role}`}>
                          {getRoleIcon(u.Role)}
                      </div>
                      <span className={`role ${u.Role}`}>{u.Role}</span>
                  </div>

                  {/* STATUS */}
                  <div className="user-cell">
                      <span className={`status ${u.IsOnline}`}>
                      <span className="dot"></span>
                      {u.IsOnline === "Online" ? "Online" : "Offline"}
                      </span>
                  </div>
                  <div className="user-cell actions-cell">

                      <button
                        className="user-action view"
                        onClick={() => navigate(`/users/${u.ID}`)}
                      >
                        <FaEye />
                      </button>

                      <button
                        to="/edit-user/:id"
                        className="user-action edit"
                        onClick={() => navigate(`/edit-user/${u.ID}`)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="user-action delete"
                        onClick={() =>setDeleteModal({ open: true, userId: u.ID })}
                      >
                        <FaTrash />
                      </button>

                  </div>

                </div>
            ))}
          </div>

        </div>
      </div>
      {deleteModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Deactivate User?</h3>
            <p>Are you sure you want to deactivate this user?</p>

            <div className="modal-actions">

              <button
                className="btn-cancel"
                onClick={() =>
                  setDeleteModal({ open: false, userId: null })
                }
              >
                Cancel
              </button>

              <button
                className="btn-delete"
                onClick={() => handleDelete(deleteModal.userId)}
              >
                Deactivate
              </button>

            </div>  

          </div>
        </div>
      )}
    </div>
  );
}

export default UserOverview;
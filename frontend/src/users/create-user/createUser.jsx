import "./createUser.css";
import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useState,useEffect } from "react";
import { FiUser, FiMail, FiLock, FiShield } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserPlus, FaUserEdit  } from "react-icons/fa";


function CreateUser() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    console.log("ID =", id);
    const [form, setForm] = useState({
      fullName: "",
      email: "",
      password: "",
      role: "Employee",
    });

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const url = isEditMode
        ? `http://localhost:5050/api/users/${id}`
        : "http://localhost:5050/api/users";

    const method = isEditMode ? "PUT" : "POST";

    const body = isEditMode
        ? {
            fullName: form.fullName,
            role: form.role,
        }
        : form;

    const res = await fetch(url, {
        method,
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
        setError("");
        setMessage(
        isEditMode
            ? "User updated successfully ✔."
            : "User created successfully ✔."
        );

        setTimeout(() => {
        navigate("/users");
        }, 1500);
    } else {
        setMessage("");
        setError(data.message || "Something went wrong.");
    }
  };
  useEffect(() => {
    if (!isEditMode) return;

    const fetchUser = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5050/api/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        const data = await res.json();

        if (res.ok) {
          setForm({
            fullName: data.user.fullName,
            email: data.user.email,
            password: "",
            role: data.user.role,
          });
        }
    };

    fetchUser();
  }, [id]);

  const title = isEditMode ? "Edit User" : "Create User";
  const Icon = isEditMode ? FaUserEdit : FaUserPlus;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <TopBar title={title} icon={Icon} />

        <div className="create-user-page">
          <div className="form-card">
            <h2>{isEditMode ? "Edit User" : "Create User"}</h2>

            <form onSubmit={handleSubmit}>

              {/* NAME */}
              <div className="user-input-group">
                <FiUser />
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                />
              </div>

              {/* EMAIL */}
              <div className="user-input-group">
                <FiMail />
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                />
              </div>

              {/* PASSWORD */}
              <div className="user-input-group">
                <FiLock />
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!isEditMode}
                    disabled={isEditMode}
                    placeholder="Password"
                />
              </div>

              {/* ROLE */}
              <div className="user-input-group">
                <FiShield />
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="Employee">Employee</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="user-submit-btn">
                {isEditMode ? "Update User" : "Create User"}
              </button>

            </form>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;
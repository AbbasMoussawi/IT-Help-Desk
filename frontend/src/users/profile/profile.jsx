import "./profile.css";
import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useEffect, useState } from "react";
import { FiUser, FiMail, FiEdit, FiLock, FiMoon, FiSun, FiTrash2 } from "react-icons/fi";
import { FaPenToSquare } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";



function Profile() {
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openPhotoMenu, setOpenPhotoMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const { id } = useParams();
  const isMe = currentUser?.id == id;
  const [counters, setCounters] = useState({});
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem("token");

        const url = isMe
        ? "http://localhost:5050/api/users/me"
        : `http://localhost:5050/api/users/${id}`;

        const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        const data = await res.json();

        if (res.ok) {
        setUser(data.user);
        setForm({
            fullName: data.user.fullName || "",
            email: data.user.email || "",
        });
        }
    };
    const getCounters = async () => {
        try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5050/api/assigned-tickets/sidebar-counts", {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        setCounters(data);
        } catch (err) {
        console.log(err);
        }
    };
    
    fetchProfile();
    getCounters();
  }, [id, isMe]);
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5050/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
        setUser((prev) => ({ ...prev, ...form }));
        setEditOpen(false);
        showMessage("Profile updated successfully", "success");
        } else {
        showMessage(data.message || "Error updating profile", "error");
    }
  };
  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5050/api/users/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwords),
    });

    const data = await res.json();

    if (res.ok) {
        showMessage("Password updated successfully", "success");
        setPasswords({
            oldPassword: "",
            newPassword: "",
        });
        } else {
        showMessage(data.message || "Wrong password", "error");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5050/api/users/upload-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
        const updatedUser = {
            ...user,
            image: data.imageUrl,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  const handleRemoveImage = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5050/api/users/remove-image", {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
    

    const data = await res.json();

    if (res.ok) {
        const updatedUser = {
        ...user,
        image: null,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (!user) return null;

  return (
    <div className={`layout ${darkMode ? "dark" : ""}`}>
        <Sidebar counts={counters} />

        <div className="main">
        <TopBar title="Profile" icon={FaUserCircle}/>

        <div className="profile-page">
            <div className="profile-wrapper">

            {/* HERO */}
            <div className="profile-hero">
                <div className="hero-left">
                <div className="avatar-wrapper">

                    <div className="profile-avatar">
                        {user.image ? (
                        <img
                            src={`http://localhost:5050/uploads/${user.image}`}
                            alt="Profile"
                        />
                        ) : (
                        <span>
                            {user.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        )}
                    </div>

                    {isMe && (
                        <div className="photo-dropdown">

                            <button
                                className="photo-edit-btn"
                                onClick={() => setOpenPhotoMenu(!openPhotoMenu)}
                            >
                                <FaPenToSquare /> Edit
                                
                            </button>

                            {openPhotoMenu && (
                                <div className="photo-menu">

                                <button
                                    onClick={() => {
                                    document.getElementById("uploadInput").click();
                                    setOpenPhotoMenu(false);
                                    }}
                                >
                                    <FaPenToSquare />
                                    Edit Photo
                                </button>

                                {user.image && (
                                    <button
                                    className="delete"
                                    onClick={() => {
                                        handleRemoveImage();
                                        setOpenPhotoMenu(false);
                                    }}
                                    >
                                    <FiTrash2 />
                                    Delete Photo
                                    </button>
                                )}

                                </div>
                            )}

                            <input
                                id="uploadInput"
                                type="file"
                                hidden
                                onChange={handleImageUpload}
                            />
                        </div>
                    )}
                    </div>

                <div className="hero-info">
                    <span className="admin-badge">{user.role}</span>
                    <h1>{user.fullName}</h1>

                    <p>
                        Passionate about creating efficient solutions and managing
                        teams to deliver the best results.
                    </p>

                    <div className="contact-boxes">
                        <div className="contact-item">
                            <FiMail />
                            {user.email}
                        </div>
                    </div>
                </div>
                </div>

                <div className="hero-buttons">
                {isMe && (
                    <button className="edit-btn" onClick={() => setEditOpen(true)}>
                        <FiEdit />
                        Edit Profile
                    </button>
                )}

                <button
                    className="dark-btn"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? <FiSun /> : <FiMoon />}
                    Dark Mode
                </button>
                </div>
            </div>

            {/* GRID */}
            <div className="profile-grid">

                <div className="info-card">
                <h3>Account Information</h3>

                <div className="info-item">
                    <span>Full Name</span>
                    <p>{user.fullName}</p>
                </div>

                <div className="info-item">
                    <span>Email Address</span>
                    <p>{user.email}</p>
                </div>

                <div className="info-item">
                    <span>Role</span>
                    <p>{user.role}</p>
                </div>
                </div>

                {isMe && (
                    <div className="password-card">
                        <h3>Change Password</h3>

                        <input
                            type="password"
                            placeholder="Current Password"
                            value={passwords.oldPassword}
                            onChange={(e) =>
                                setPasswords({
                                ...passwords,
                                oldPassword: e.target.value,
                                })
                            }
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords({
                                ...passwords,
                                newPassword: e.target.value,
                                })
                            }
                        />

                        <button onClick={handleChangePassword}>
                            <FiLock />
                            Update Password
                        </button>
                        {message && (
                            <div className={`message ${messageType}`}>
                                {message}
                            </div>
                        )}
                    </div>
                )}
                
            </div>
            
            </div>
        </div>
        </div>

        {editOpen && (
        <div className="modal">
            <div className="modal-box">
            <h3>Edit Profile</h3>

            <input
                value={form.fullName}
                placeholder="Full Name"
                onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
                }
            />

            <input
                value={form.email}
                placeholder="Email"
                onChange={(e) =>
                setForm({ ...form, email: e.target.value })
                }
            />

            <div className="modal-actions">
                <button onClick={() => setEditOpen(false)}>Cancel</button>
                <button onClick={handleSaveProfile}>Save Changes</button>
            </div>
            </div>
        </div>
        )}
    </div>
    );
}

export default Profile;
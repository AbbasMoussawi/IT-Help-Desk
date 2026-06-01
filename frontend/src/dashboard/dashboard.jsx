import { useEffect, useState } from "react";
import "./dashboard.css";

const Dashboard = () => {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("role") || "";
    const savedName = localStorage.getItem("name") || "";

    setRole(savedRole);
    setName(savedName);
  }, []);

  const getMessage = () => {
    if (role === "admin") return "Welcome to Admin Dashboard";
    if (role === "it") return "Welcome to IT Dashboard";
    if (role === "employee") return "Welcome to Employee Dashboard";
    return "";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="welcome-text">{getMessage()}</h1>

        {name && <p className="user-name">Hello {name}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
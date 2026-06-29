import Sidebar from "../components/sidebar/sidebar";
import TopBar from "../components/topbar/topbar";
import DashboardCards from "../components/dashboard-cards/dashboardCards";

import "./dashboard.css";
import EmployeeSection from "../components/employee-section/employeeSection";
import ITSection from "../components/it-section/itSection";
import ManagerSection from "../components/manager-section/managerSection"
import AdminSection from "../components/admin-section/adminSection";
import { useEffect, useState } from "react";
import { FaHome } from "react-icons/fa"

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const [counters, setCounters] = useState({});
  const [sidebarCounters, setSidebarCounters] = useState({});
  useEffect(() => {
    const getCounters = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5050/api/dashboard/counters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log(data);

        setCounters(data);
      } catch (err) {
        console.log(err);
      }
    };

    getCounters();
  }, []);
  
  useEffect(() => {
    const fetchSidebarCounts = async () => {
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
        setSidebarCounters(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSidebarCounts();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar counts={sidebarCounters} />

      <div className="dashboard-content">
        <TopBar 
          title="Dashboard"   
          icon={FaHome}     
        />

        <DashboardCards role={role} counters={counters} />
        {role === "Employee" && <EmployeeSection />}
        {role === "IT Support" && <ITSection />}
        {role === "Manager" && <ManagerSection />}
        {role === "Admin" && <AdminSection />}
      </div>
    </div>
  );
}

export default Dashboard;
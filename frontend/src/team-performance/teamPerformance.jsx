import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import TopBar from "../components/topbar/topbar";
import { useNavigate } from "react-router-dom";

import "./teamPerformance.css";

import {
  FiUsers,
  FiTrendingUp,
  FiAward,
  
} from "react-icons/fi";

import{
    FaArrowLeft, FaChartLine 
} from "react-icons/fa";
function TeamPerformance() {
  const [isOpen, setIsOpen] = useState(false);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5050/api/dashboard/team-performance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setTeamPerformance(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamPerformance();
  }, []);

  return (
    <div className="team-performance-page">

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="team-performance-content">

        <TopBar
          setIsOpen={setIsOpen}
          showSearch={false}
          title="Team Performance"
          icon={FaChartLine }
        />

        <div className="team-performance-container">

          <div className="team-performance-header">

            <div className="team-performance-header-title">
              
              <FaArrowLeft className="back-icon" onClick={() => navigate(-1)}/>
              <div>
                <h1>Team Performance</h1>
                <p>
                    Monitor employee productivity and resolved tickets
                </p>
              </div>
            </div>

          </div>

          <div className="team-performance-card">

            <div className="team-performance-card-header">
              <FiTrendingUp />
              <h2>Resolved Tickets Ranking</h2>
            </div>

            {loading ? (
              <div className="team-performance-loading">
                Loading...
              </div>
            ) : teamPerformance.length === 0 ? (
              <div className="team-performance-empty">
                No performance data found
              </div>
            ) : (
              <table className="team-performance-table">

                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>IT Support</th>
                    <th>Resolved Tickets</th>
                    <th>Performance</th>
                  </tr>
                </thead>

                <tbody>

                  {teamPerformance.map((member, index) => (

                    <tr key={member.ID}>

                      <td>
                        <td>
                        {index < 3 ? (
                            <FiAward className={`award-${index + 1}`} />
                        ) : (
                            index + 1
                        )}
                        </td>
                      </td>

                      <td>

                        <div className="team-performance-user">

                          <div className="team-performance-avatar">
                            <FiUsers />
                          </div>

                          <span>
                            {member.FullName}
                          </span>

                        </div>

                      </td>

                      <td>

                        <span className="team-performance-resolved">
                          {member.ResolvedCount}
                        </span>

                      </td>

                      <td>

                        {index === 0 ? (
                          <span className="team-performance-badge gold">
                            <FiAward />
                            Top Performer
                          </span>
                        ) : (
                          <span className="team-performance-badge">
                            Active
                          </span>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default TeamPerformance;
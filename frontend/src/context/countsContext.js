import { createContext, useContext, useEffect, useState } from "react";

const CountsContext = createContext();

export function CountsProvider({ children }) {
  const [counts, setCounts] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    assigned: 0,
  });

  const fetchCounts = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5050/api/assigned-tickets/sidebar-counts",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (res.ok) {
      setCounts(data);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <CountsContext.Provider value={{ counts, fetchCounts }}>
      {children}
    </CountsContext.Provider>
  );
}

export const useCounts = () => useContext(CountsContext);
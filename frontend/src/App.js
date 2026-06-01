import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/login/login";
import Dashboard from "./dashboard/dashboard";
import ProtectedRoute from "./protectedroute/protectedroute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
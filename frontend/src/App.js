import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./auth/login/login";
import ForgotPassword from "./auth/forgot-password/forgotPassword";
import VerifyEmail from "./auth/verify-email/verifyEmail";
import ResetPassword from "./auth/reset-password/resetPassword";
import PasswordSuccess from "./auth/password-success/passwordSuccess";

import Dashboard from "./dashboard/dashboard";
import ProtectedRoute from "./protectedroute/protectedroute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-success" element={<PasswordSuccess />} />

        {/* Dashboard */}
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
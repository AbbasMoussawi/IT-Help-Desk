import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CountsProvider } from "./context/countsContext";

import Login from "./auth/login/login";
import ForgotPassword from "./auth/forgot-password/forgotPassword";
import VerifyEmail from "./auth/verify-email/verifyEmail";
import ResetPassword from "./auth/reset-password/resetPassword";
import PasswordSuccess from "./auth/password-success/passwordSuccess";

import CreateTicket from "./ticket/create-ticket/createTicket";
import AssignedTicket from "./ticket/assigned-ticket/assignedTicket";
import TicketDetails from "./ticket/ticket-details/ticketDetails";
import TicketList from "./ticket/ticket-list/ticketList";
import MyTickets from "./ticket/my-tickets/myTickets";
import TicketManagement from "./ticket/ticket-management/ticketManagement";

import Dashboard from "./dashboard/dashboard";
import ProtectedRoute from "./protectedroute/protectedroute";
import ActivityPage from "./page-activity/activityPage";
import TeamPerformance from "./team-performance/teamPerformance";
import UserOverview from "./users/user-overview/userOverview";
import Notifications from "./notifications/notifications";
import CreateUser from "./users/create-user/createUser";
import Profile from "./users/profile/profile";

function App() {
  const location = useLocation();
  const prevPathRef=useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (prevPath === "/notifications" && currentPath !== "/notifications") {
      fetch("http://localhost:5050/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
    }

    prevPathRef.current = currentPath;
  }, [location.pathname]);
  return (
    <CountsProvider>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>

            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-success" element={<PasswordSuccess />} />

            <Route
              path="/ticket-details/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <TicketDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/open-tickets"
              element={
                <ProtectedRoute allowedRoles={["IT Support", "Admin"]}>
                  <TicketList statusFilter="Open" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/in-progress"
              element={
                <ProtectedRoute allowedRoles={["IT Support", "Admin"]}>
                  <TicketList statusFilter="In Progress" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resolved"
              element={
                <ProtectedRoute allowedRoles={["IT Support", "Admin"]}>
                  <TicketList statusFilter="Resolved"  />
                </ProtectedRoute>
              }
            />
            <Route
               path="/closed"
               element={
                <ProtectedRoute allowedRoles={["IT Support", "Admin"]}>
                  <TicketList statusFilter="Closed"  />
                </ProtectedRoute>
               }
            />

            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Admin"]}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-ticket"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Admin", "Manager"]}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-ticket/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <ActivityPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/assigned-tickets"
              element={
                <ProtectedRoute allowedRoles={["IT Support", "Admin"]}>
                  <AssignedTicket />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ticket-management"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TicketManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-performance"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TeamPerformance />
                </ProtectedRoute>
              }
            />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                  <UserOverview />
              </ProtectedRoute>}
            />
            <Route path="/create-user" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                  <CreateUser />
              </ProtectedRoute>}
            />
            
            <Route path="/edit-user/:id" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                  <CreateUser />
              </ProtectedRoute>} 
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "IT Support", "Employee"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<div>404 Not Found</div>} />

          </Routes>
        </motion.div>
      </AnimatePresence>
    </CountsProvider>
  );
}

export default App;
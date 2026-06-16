export function getAllowedNextStatuses(currentStatus, role) {
  if (!currentStatus) return [];

  const isAdminOrManager =
    role === "admin" || role === "manager";

  const isITSupport = role === "it support";

  if (isAdminOrManager) {
    switch (currentStatus) {
      case "Open":
        return ["In Progress"];

      case "In Progress":
        return ["Open", "Resolved"];

      case "Resolved":
        return ["In Progress", "Closed"];

      case "Closed":
        return [];

      default:
        return [];
    }
  }

  if (isITSupport) {
    switch (currentStatus) {
      case "Open":
        return ["In Progress"];

      case "In Progress":
        return ["Resolved"];

      case "Resolved":
        return ["Closed"];

      case "Closed":
        return [];

      default:
        return [];
    }
  }

  return [];
}
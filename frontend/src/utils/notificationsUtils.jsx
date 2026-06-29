import {
  FiBell,
  FiMessageSquare,
  FiUser,
  FiActivity,
  FiPaperclip,
} from "react-icons/fi";

export const getNotificationStyle = (type) => {
  switch (type) {
    case "comment":
      return { icon: <FiMessageSquare />, color: "orange" };
    case "assigned ticket":
      return { icon: <FiUser />, color: "green" };
    case "status":
      return { icon: <FiActivity />, color: "purple" };
    case "attachment":
      return { icon: <FiPaperclip />, color: "blue" };
    default:
      return { icon: <FiBell />, color: "gray" };
  }
};
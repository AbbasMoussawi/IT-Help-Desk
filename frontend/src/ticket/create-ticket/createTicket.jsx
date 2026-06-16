import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import TopBar from "../../components/topbar/topbar";
import { useParams } from "react-router-dom";
import { getAllowedNextStatuses } from "../../utils/ticketStatusRules";

import "./createTicket.css";
import {
  FaArrowLeft,
  FaPaperclip,
} from "react-icons/fa";
import { useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CreateTicket() {

  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "manager";
  
  
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
    attachment: null,
    assignedTo: "",
    department: "",
    status: "",
  });
  
  const [formOptions, setFormOptions] = useState({
    users: [],
    departments: [],
    statuses: [],
    categories: [],
    priorities: [],
  });
  const currentStatusName =
  formOptions.statuses.find(
    (s) => String(s.ID) === String(formData.status)
  )?.StatusName || "";
  const allowedStatuses = currentStatusName? getAllowedNextStatuses(currentStatusName, role): [];
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
        const file = files[0];

        setFormData({
        ...formData,
        attachment: file,
        });

        setPreview(URL.createObjectURL(file));
    } else {
        setFormData({
        ...formData,
        [name]: value,
        });
    }
  };
  console.log(formData.status);
console.log(formOptions.statuses);
console.log(currentStatusName);
  const handleSubmit = async (e) => {
    
    e.preventDefault();
    
    setMessage("");
    setError("");

    try {
        const data = new FormData();

        data.append("title", formData.title);
        data.append("category", formData.category);
        data.append("priority", formData.priority);
        data.append("description", formData.description);
        data.append("assignedTo", formData.assignedTo);
        data.append("department", formData.department);
        data.append("status", formData.status);

        if (formData.attachment) {
          data.append("attachment", formData.attachment);
        }

        const token = localStorage.getItem("token");

        const url = isEditMode
          ? `http://localhost:5050/api/tickets/${id}`
          : "http://localhost:5050/api/tickets";

        const res = await fetch(url, {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });

        const result = await res.json();

        if (!res.ok) {
        setError(result.message);
        return;
        }

        setMessage(isEditMode ? "Ticket updated successfully ✔": "Ticket created successfully ✔");

        if (!isEditMode) {
          setFormData({
            title: "",
            category: "",
            priority: "",
            description: "",
            attachment: null,
          });

          setPreview(null);
        }

        

    } catch (error) {
        setError("Server error");
    }
  };

  useEffect(() => {
    

    const fetchFormData = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5050/api/tickets/form-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setFormOptions(data);
      }
    };

    fetchFormData();
  }, []);

  useEffect(() => {

    if (!isEditMode) return;

    const fetchTicket = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5050/api/tickets/${id}/edit`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if(res.ok){

        setFormData({
          title: data.Title || "",
          category: data.CategoryId || "",
          priority: data.PriorityId || "",
          description: data.Description || "",
          assignedTo: data.AssignedToUserId || "",
          status: data.StatusId || "",
          attachment: null
        });

        if(data.FilePath){
          setPreview(
            `http://localhost:5050${data.FilePath}`
          );
        }
      }
    };

    fetchTicket();

  }, [id]);

  console.log("ROLE =", role);
console.log("CURRENT =", currentStatusName);
console.log("ALLOWED =", allowedStatuses);
  return (
    <div className="layout">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="main">

        <TopBar 
            setIsOpen={setIsOpen}
            showSearch={false}
            title="New Ticket"
            icon={FaPlus}
        />

        <div className="page-header">

          <div className="header-left">
            <FaArrowLeft className="back-icon" onClick={() => navigate(-1)}/>
            <div>
              <h1>{isEditMode ? "Edit Ticket" : "Create New Ticket"}</h1>
              <p>{isEditMode ? "Update ticket information."
                  : "Fill in the details below to create a new support ticket."}
              </p>
            </div>
          </div>

        </div>

        <div className="ticket-container">

          {/* FORM */}
          <div className="ticket-card">

            <form onSubmit={handleSubmit}>
              <div className="create-input-group">
                  <label>Ticket Title <span className="input-start">*</span></label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Ex: Printer not working"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              <div className="grid">

                

                <div className="create-input-group">
                  <label>Category <span className="input-start">*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>

                    {formOptions.categories.map((c) => (
                      <option key={c.ID} value={c.ID}>
                        {c.CategoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="create-input-group">
                  <label>Priority <span className="input-start">*</span></label>
                  <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="">Select Priority</option>

                    {formOptions.priorities.map((p) => (
                      <option key={p.ID} value={p.ID}>
                        {p.PriorityName}
                      </option>
                    ))}
                  </select>
                </div>
                {isAdmin && (
                  <>
                    <div className="create-input-group">
                      <label>Assigned To<span className="input-start">*</span></label>
                      <select name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
                        <option value="">Select User</option>
                        {formOptions.users.map((u) => (
                          <option key={u.ID} value={u.ID}>
                            {u.FullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isEditMode && (
                      <div className="create-input-group">
                        <label>Status<span className="input-start">*</span></label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          {formOptions.statuses.map((s) => {
                            const isAllowed =
                              s.StatusName === currentStatusName ||
                              allowedStatuses.includes(s.StatusName);

                            return (
                              <option
                                key={s.ID}
                                value={s.ID}
                                disabled={!isAllowed}
                              >
                                {s.StatusName}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    {/*
                    <div className="create-input-group">
                      <label>Department</label>
                      <select name="department" onChange={handleChange}>
                        <option value="">Select Department</option>
                        {formOptions.departments.map((d) => (
                          <option key={d.ID} value={d.ID}>
                            {d.DepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>*/}
                  </>
                )}

                

              </div>

              <div className="create-input-group">
                <label>Description <span className="input-start">*</span></label>
                <textarea
                  rows="4"
                  name="description"
                  placeholder="Describe the issue..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* UPLOAD */}
              <div className="upload" onClick={handleUploadClick}>

                    <input
                        type="file"
                        name="attachment"
                        ref={fileInputRef}
                        onChange={handleChange}
                        style={{ display: "none" }}
                    />

                    {preview ? (
                        <div className="upload-preview">
                        <img src={preview} alt="file" />
                        <span>{formData.attachment?.name}</span>
                        </div>
                    ) : (
                        <div className="upload-empty">
                        <FaPaperclip />
                        <div>
                            <p>Drag & Drop or click to upload</p>
                            <span>Max 10MB (PDF,DOC,DOCX,JPG,JPEG,PNG)</span>
                        </div>
                        </div>
                    )}

              </div>
              {message && <p className="success-message">{message}</p>}

              {error && <p className="error-message">{error}</p>}

              <div className="buttons">

                <button type="button" className="cancel">
                  Cancel
                </button>

                <button type="submit" className="submit">
                  {isEditMode ? "Update Ticket" : "Submit Ticket"}
                </button>

              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
}

export default CreateTicket;
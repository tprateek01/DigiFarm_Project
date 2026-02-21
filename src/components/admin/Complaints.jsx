import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);

  // Function to load/refresh complaints
  const loadComplaints = () => {
    userApiService.getAllComplaints().then((data) => {
      setComplaints(data || []);
    });
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleResolve = async (id) => {
    await userApiService.updateComplaintStatus(id, "Resolved");
    loadComplaints(); // Refresh the list
  };

  return (
    <div>
      <h1>Complaints Management</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length > 0 ? (
            complaints.map((item) => (
              <tr key={item.id}>
                <td>{item.userName}</td>
                <td>{item.role}</td>
                <td>{item.issue}</td>
                <td>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.status !== "Resolved" ? (
                    <button onClick={() => handleResolve(item.id)}>
                      Resolve
                    </button>
                  ) : (
                    <span style={{ color: "green" }}>✅ Fixed</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No complaints found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Complaints;
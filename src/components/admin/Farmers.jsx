import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const loadFarmers = () => {
    userApiService.getUsersByRole("Farmer").then(setFarmers);
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    try {
      await userApiService.patchUser(userId, { status });
      loadFarmers();
    } catch(e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await userApiService.patchUser(userId, { isActive: !currentActive });
      loadFarmers();
    } catch(e) {
      console.error(e);
      alert("Failed to toggle visibility");
    }
  };

  const handleRemove = async (userId) => {
    if(!window.confirm("Are you sure you want to deny and remove this farmer?")) return;
    try {
      await userApiService.deleteUser(userId);
      loadFarmers();
    } catch(e) {
      console.error(e);
      alert("Failed to remove farmer");
    }
  };

  return (
    <div className="table-container">
      <h3>Farmers</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Location</th>
            <th>Land Area</th>
            <th>Earnings</th>
            <th>Aadhar</th>
            <th>ID Proof</th>
            <th>Visibility</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map(f => (
            <tr key={f.id}>
              <td>{f.full_name || f.name}</td>
              <td>{f.email}</td>
              <td>{f.mobile}</td>
              <td>{f.location || "N/A"}</td>
              <td>{f.land_area || 0} Acres</td>
              <td>₹{f.earnings || 0}</td>
              <td>{f.aadhar_no || "N/A"}</td>
              <td>
                {f.id_proof ? (
                  <button onClick={() => setViewImage(f.id_proof)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>View</button>
                ) : "No Proof"}
              </td>
              <td>
                <span style={{ fontWeight: 'bold', color: f.isActive === false ? 'red' : 'green' }}>
                  {f.isActive === false ? "Hidden" : "Public"}
                </span>
              </td>
              <td>
                 <span style={{color: f.status==='approved'?'green': f.status==='rejected'?'red':'orange'}}>
                    {f.status?.toUpperCase() || "PENDING"}
                 </span>
              </td>
              <td style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button 
                   disabled={f.status === 'approved'} 
                   onClick={() => handleUpdateStatus(f.id, 'approved')}
                   style={{ backgroundColor: f.status === 'approved' ? 'gray' : '#4CAF50', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button 
                   onClick={() => handleRemove(f.id)}
                   style={{ backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Deny / Delete
                </button>
                <button 
                   onClick={() => handleToggleActive(f.id, f.isActive !== false)}
                   style={{ backgroundColor: f.isActive === false ? '#1976d2' : '#ff9800', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {f.isActive === false ? "Unfreeze" : "Freeze"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setViewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={viewImage} alt="ID Proof" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
            <button style={{ position: 'absolute', top: -40, right: 0, background: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setViewImage(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmers;

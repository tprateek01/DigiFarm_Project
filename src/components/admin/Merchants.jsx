import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const loadMerchants = () => {
    userApiService.getUsersByRole("Merchant").then(setMerchants);
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    try {
      await userApiService.patchUser(userId, { status });
      loadMerchants();
    } catch(e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleRemove = async (userId) => {
    if(!window.confirm("Are you sure you want to remove this merchant?")) return;
    try {
      await userApiService.deleteUser(userId);
      loadMerchants();
    } catch(e) {
      console.error(e);
      alert("Failed to remove merchant");
    }
  };

  return (
    <div className="table-container">
      <h3>Merchants</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Aadhar</th>
            <th>Company Type</th>
            <th>ID Proof</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map(m => (
            <tr key={m.id}>
              <td>{m.full_name || m.name || m.fname + " " + m.lname || "N/A"}</td>
              <td>{m.email}</td>
              <td>{m.mobile || m.phone || "N/A"}</td>
              <td>{m.aadhar_no || "N/A"}</td>
              <td>{m.companyType || m.company_type || m.CompanyType || m.companyName || m.company || "N/A"}</td>
              <td>
                {m.id_proof ? (
                  <button onClick={() => setViewImage(m.id_proof)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>View</button>
                ) : "No Proof"}
              </td>
              <td>
                 <span style={{color: m.status==='approved'?'green': m.status==='rejected'?'red':'orange'}}>
                    {m.status?.toUpperCase() || "PENDING"}
                 </span>
              </td>
              <td style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button 
                   disabled={m.status === 'approved'} 
                   onClick={() => handleUpdateStatus(m.id, 'approved')}
                   style={{ backgroundColor: m.status === 'approved' ? 'gray' : '#4CAF50', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button 
                   onClick={() => handleRemove(m.id)}
                   style={{ backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Deny / Delete
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

export default Merchants;

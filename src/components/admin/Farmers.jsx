import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    userApiService.getUsersByRole("Farmer").then(setFarmers);
  }, []);

  const handleDelete = async (id) => {
    await userApiService.deleteUser(id);
    setFarmers(farmers.filter(f => f.id !== id));
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map(f => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.email}</td>
              <td>{f.mobile}</td>
              <td>
                <button onClick={() => handleDelete(f.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Farmers;

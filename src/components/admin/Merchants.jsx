import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    userApiService.getUsersByRole("Merchant").then(setMerchants);
  }, []);

  return (
    <div className="table-container">
      <h3>Merchants</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map(m => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.mobile}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Merchants;

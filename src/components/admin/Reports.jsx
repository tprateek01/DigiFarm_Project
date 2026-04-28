import React, { useEffect, useState } from "react";
import { userApiService } from "../../api/userApi.js";

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalInventoryValue: 0,
    categoryCount: {},
    topProduct: "N/A",
    totalItems: 0
  });

  useEffect(() => {
    userApiService.getAllProductsAdmin().then((products) => {
      // Filter out invalid or incomplete product entries
      const validProducts = products.filter(p => p.product_name && p.product_Qty);

      // 1. Calculate Total Inventory Value (Qty * Price)
      const totalValue = validProducts.reduce((acc, p) => {
        return acc + (Number(p.product_Qty) * Number(p.product_Unitprice));
      }, 0);

      // 2. Category Breakdown & Find Top Product by Quantity
      const categories = {};
      let maxQty = 0;
      let bestProduct = "N/A";

      validProducts.forEach(p => {
        // Count by category
        const cat = p.product_Category || p.productCategory || p.category || "Uncategorized";
        categories[cat] = (categories[cat] || 0) + 1;

        // Check for Top Selling (highest stock in this context)
        if (Number(p.product_Qty) > maxQty) {
          maxQty = Number(p.product_Qty);
          bestProduct = p.product_name;
        }
      });

      setReportData({
        totalInventoryValue: totalValue,
        categoryCount: categories,
        topProduct: bestProduct,
        totalItems: validProducts.length
      });
    });
  }, []);

  return (
    <div className="reports-container">
      <h1>Reports & Analytics</h1>

      <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Inventory Value</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
            ₹{reportData.totalInventoryValue.toLocaleString()}
          </p>
        </div>

        <div className="card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Highest Stock Product</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
            {reportData.topProduct}
          </p>
        </div>

        <div className="card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Listed Products</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {reportData.totalItems}
          </p>
        </div>
      </div>

      <div className="category-report">
        <h3>Product Distribution by Category</h3>
        <table className="admin-table" style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th>Category</th>
              <th>No. of Products</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(reportData.categoryCount).map(cat => (
              <tr key={cat}>
                <td>{cat}</td>
                <td>{reportData.categoryCount[cat]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
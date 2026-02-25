import { useEffect, useState } from "react";

export default function LivePrices() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setPrices([
        { crop: "Wheat", price: 24 },
        { crop: "Rice", price: 32 },
        { crop: "Mango", price: 65 }
      ]);
    }, 800);
  }, []);

  return (
    <div className="dashboard-box">
      <h3>📈 Live Market Prices</h3>
      {prices.map((p, i) => (
        <p key={i}>{p.crop}: ₹{p.price}/kg</p>
      ))}
    </div>
  );
}

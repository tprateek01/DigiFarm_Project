import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function FarmerAnalytics() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Earnings",
        data: [12000, 15000, 9000, 18000],
        backgroundColor: "#4a7a2f"
      }
    ]
  };

  return (
    <div className="dashboard-box">
      <h3>📊 Analytics</h3>
      <Bar data={data} />
    </div>
  );
}

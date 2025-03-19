// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { defaults } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import useGetData from "../../Hooks/useGetData";

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

export default function RoundChart() {
  const { data: sellData } = useGetData(
    "https://pos-backend-delta.vercel.app/api/customerProduct/getAllCustomerProducts"
  );
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (sellData?.data) {
      const rawData = sellData.data;

      // Step 1: Count payment statuses
      const paymentStatusCounts = rawData.reduce(
        (acc, item) => {
          const status = item.paymentStatus?.toLowerCase() || "pending";
          acc[status]++;
          return acc;
        },
        { paid: 0, pending: 0 } // Initialize counts for "paid" and "pending"
      );

      const total = paymentStatusCounts.paid + paymentStatusCounts.pending;

      // Step 2: Calculate percentages
      const percentages = {
        Paid: ((paymentStatusCounts.paid / total) * 100).toFixed(2),
        Pending: ((paymentStatusCounts.pending / total) * 100).toFixed(2),
      };

      // Step 3: Prepare chart data
      setChartData({
        labels: ["Paid Payments", "Pending Payments"],
        datasets: [
          {
            label: "Payment Status %",
            data: [percentages.Paid , percentages.Pending],
            backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 165, 0, 0.8)"], // Green for Paid, Orange for Pending
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 165, 0, 1)"],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [sellData]);

  return (
    <div>
      <div className="p-5 flex justify-center ">
        <div className="chartContainer w-[100%] h-[500px] border bg-[#fcfaf7] border-blue-50 shadow-xl p-3 rounded-xl">
          {chartData.datasets.length > 0 ? (
            <Doughnut
              data={chartData}
              options={{
                plugins: {
                  title: {
                    text: "Payment Status Distribution",
                  },
                },
              }}
            />
          ) : (
            <div className="flex justify-center items-center mt-[200px]">
              <p>Loading chart data...</p>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}

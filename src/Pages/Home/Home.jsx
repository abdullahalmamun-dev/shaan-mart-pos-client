// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import useGetData from "../../Hooks/useGetData";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import RoundChart from "./RoundChart";
import ProfitSection from "./ProfitSection";
import FinalLoader from './../../Shared/Loader/FinalLoader';
import useLoader from './../../Shared/Loader/Loader';

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

const ProfitChart = () => {
  const { loading } = useLoader();
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

      // Step 1: Aggregate profits by category
      const categoryProfits = rawData.reduce((acc, item) => {
        item.purchasedProducts.forEach((product) => {
          const { p_category, p_price, p_cost, quantity } = product;
          const profit = (p_price - p_cost) * quantity;
          console.log(p_price, p_cost, quantity, profit)
          if (acc[p_category]) {
            acc[p_category] += profit;
          } else {
            acc[p_category] = profit;
          }
        });
        return acc;
      }, {});

      // Step 2: Prepare chart data
      const categories = Object.keys(categoryProfits);
      const profits = Object.values(categoryProfits);

      setChartData({
        labels: categories,
        datasets: [
          {
            label: "Profit",
            data: profits,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [sellData]);

  if (loading) {
    return <FinalLoader />;
  }
  return (
    <div >
      <CommonTopNab />
      <ProfitSection />
      <div className="p-5 flex justify-center">
        <div className="chartContainer w-[100%] h-[500px] border bg-[#fcfaf7] border-blue-50 shadow-xl p-3 rounded-xl">
          <Line
            data={chartData}
            options={{
              elements: {
                line: {
                  tension: 0.5,
                },
              },
              plugins: {
                title: {
                  text: "Profit by Category",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
      <RoundChart />
    </div>

  );
};

export default ProfitChart;

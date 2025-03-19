// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import useGetData from "../../Hooks/useGetData";
import { FcPaid } from "react-icons/fc";
import { MdOutlinePending } from "react-icons/md";
import { SiVirustotal } from "react-icons/si";
import { IoTrophyOutline } from "react-icons/io5";

export default function ProfitSection() {
  const { data: sellData, isLoading: tableLoading } = useGetData(
    "https://pos-backend-delta.vercel.app/api/customerProduct/getAllCustomerProducts"
  );

  const [profitStats, setProfitStats] = useState({
    totalPaidProducts: 0,
    totalPendingProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (sellData?.data) {
      const rawData = sellData.data;

      // Initialize variables
      let totalPaidProducts = 0;
      let totalPendingProducts = 0;
      let totalRevenue = 0;

      rawData.forEach((entry) => {
        if (entry.paymentStatus === "paid") {
          // Count paid products
          totalPaidProducts += entry.purchasedProducts.length;

          // Calculate revenue for paid products
          entry.purchasedProducts.forEach((product) => {
            const { p_price, p_cost, quantity } = product;
            totalRevenue += (p_price * quantity) - (p_cost * quantity);
          });
        } else if (entry.paymentStatus === "") {
          // Count pending products
          totalPendingProducts += entry.purchasedProducts.length;
        }
      });

      // Update state
      setProfitStats({
        totalPaidProducts,
        totalPendingProducts,
        totalRevenue,
      });
    }
  }, [sellData]);

  const totalSell = profitStats.totalPaidProducts + profitStats.totalPendingProducts

  return (
    <div className="p-5 clear-start">
      <h1 className="text-xl font-bold mb-4">Profit Statistics</h1>
      {tableLoading ? (

        <div className="flex justify-center items-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className=" justify-between flex w-[95%]">
          <div>
            <div className="w-[200px] justify-center h-[100px] border rounded-lg flex flex-col items-center border-green-400">
              <FcPaid className="text-5xl
                " />
              <p className="text-sm italic font-semibold">Total Paid Products: {profitStats.totalPaidProducts}</p>
            </div>
          </div>
          <div>
            <div className="w-[200px] justify-center h-[100px] border rounded-lg flex flex-col items-center border-orange-300">
              <MdOutlinePending className="text-orange-400 text-5xl
                " />
              <p className="text-sm italic font-semibold">Total Pending Products: {profitStats.totalPendingProducts}</p>
            </div>
          </div>
          <div>
            <div className="w-[200px] justify-center h-[100px] border rounded-lg flex flex-col items-center border-blue-300">
              <SiVirustotal className="text-blue-400 text-5xl
                " />
              <p className="text-sm italic font-semibold">total sell : {totalSell}</p>
            </div>
          </div>
          <div>
            <div className="w-[200px] justify-center h-[100px] border rounded-lg flex flex-col items-center border-[#733686]">
              <IoTrophyOutline className="text-[#733686] text-5xl
                " />
              <p className="text-sm italic font-semibold">Revenue: ${profitStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

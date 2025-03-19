import { useState } from "react";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import useGetData from './../../Hooks/useGetData';
import FinalLoader from './../../Shared/Loader/FinalLoader';

export default function People() {
    const { data: categoriesData, isLoading: tableLoading } = useGetData(
        "https://pos-backend-delta.vercel.app/api/customerProduct/getAllCustomerProducts"
    );

    const [filter, setFilter] = useState("");

    // Handle input change for filtering
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Sort data by `createdAt` in descending order (latest first)
    const sortedData = categoriesData?.data?.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Remove duplicates based on email ID
    const uniqueData = sortedData?.reduce((acc, current) => {
        if (!acc.some(item => item.customerEmail === current.customerEmail)) {
            acc.push(current);
        }
        return acc;
    }, []);

    // Filter the unique data based on email or phone
    const filteredData = uniqueData?.filter((customer) =>
        customer.customerEmail.toLowerCase().includes(filter.toLowerCase()) ||
        customer.customerPhone.includes(filter)
    );

    if (tableLoading) {
        return <FinalLoader />;
    }
    return (
        <div>
            <CommonTopNab />
            <div className="container mx-auto p-4">
                <h2 className="text-xl font-bold mb-4">Customer List</h2>

                {/* Filter Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by Email or Phone"
                        value={filter}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>

                {/* No Data Found Message */}
                {filteredData?.length === 0 && (
                    <p className="text-red-500 text-center">No such data found.</p>
                )}

                {/* Data Table */}
                {filteredData?.length > 0 && (
                    <table className="table-auto w-full border-collapse border text-sm border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Customer Name</th>
                                <th className="border border-gray-300 px-4 py-2">Email</th>
                                <th className="border border-gray-300 px-4 py-2">Phone</th>
                                <th className="border border-gray-300 px-4 py-2">Address</th>
                                <th className="border border-gray-300 px-4 py-2">Customer Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((customer, index) => (
                                <tr key={index} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerEmail}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerPhone}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerAddress}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

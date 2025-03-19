// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import CommonTopNab from '../../Shared/CommonTopNav/CommonTopNab';
import useGetData from '../../Hooks/useGetData';
import { FaCaretRight, FaEye } from 'react-icons/fa6';
import { NavLink } from 'react-router';
import { AiTwotoneDelete } from 'react-icons/ai';
import toast from 'react-hot-toast';
import FinalLoader from './../../Shared/Loader/FinalLoader';


export default function CustomerList() {
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

    // Filter the data based on email or phone
    const filteredData = sortedData?.filter((customer) =>
        customer.customerEmail.toLowerCase().includes(filter.toLowerCase()) ||
        customer.customerPhone.includes(filter)
    );

    if (tableLoading) {
        return <FinalLoader/>;
    }

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://pos-backend-delta.vercel.app/api/customerProduct/delete/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Product deleted successfully!");
                setTimeout(() => {
                    window.location.reload(); // Reload the page after 1 second
                }, 1000);
                // Optionally refresh or update the UI after deletion
            } else {
                const data = await response.json();
                toast.error(`Failed to delete product: ${data.message}`);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("An error occurred while deleting the product.");
        }
    };


    return (
        <div>
            <CommonTopNab />
            <div className="container mx-auto p-4">
                <h2 className="text-xl font-bold mb-4">Sell List</h2>

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
                                <th className="border border-gray-300 px-4 py-2">Purchase Date</th>
                                <th className="border border-gray-300 px-4 py-2">Total Items</th>
                                <th className="border border-gray-300 px-4 py-2">Grand Total</th>
                                <th className="border border-gray-300 px-4 py-2">Customer Points</th>
                                <th className="border border-gray-300 px-4 py-2">Payment Status</th>
                                <th className="border border-gray-300 px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((customer, index) => (
                                <tr key={index} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerEmail}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerPhone}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerAddress}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {new Date(customer.purchaseDate).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.totalItems}</td>
                                    <td className="border border-gray-300 px-4 py-2">${customer.grandTotal.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.customerPoints}</td>
                                    <td className="border border-gray-300 px-4 py-2">{customer.paymentStatus === "" ? <p className='text-yellow-500'>Pending...</p> : <p className='text-green-600'>Paid</p>}</td>
                                    <div className="dropdown dropdown-left">
                                        <div tabIndex={0} role="button" className="btn m-1 text-blue-500">
                                            Action
                                        </div>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content items-center border border-blue-500 menu bg-white rounded-md z-[1] w-52  shadow"
                                        >
                                            <FaCaretRight className="absolute text-3xl ml-[218px] text-blue-600" />

                                            <NavLink to={`/singleCustomerList/${encodeURIComponent(customer?._id)}`}>
                                                <li className="w-full border-b text-blue-500" >
                                                    <a>
                                                        <FaEye className="text-2xl" />
                                                        View Details
                                                    </a>
                                                </li>
                                            </NavLink>
                                            <li className="w-full border-b text-red-500">
                                                <a
                                                    onClick={() => handleDelete(customer._id)}
                                                    className="cursor-pointer flex items-center  justify-center gap-2"
                                                >
                                                    <AiTwotoneDelete className="text-2xl" /> Delete
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

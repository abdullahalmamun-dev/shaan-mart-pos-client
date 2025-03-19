// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import CommonTopNab from '../../Shared/CommonTopNav/CommonTopNab'
import useUser from '../../Shared/getUser/GetUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import useLoader from '../../Shared/Loader/Loader';
import FinalLoader from '../../Shared/Loader/FinalLoader';

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { loading, online } = useLoader();
    const [refetchToggle, setRefetchToggle] = useState(false); // For triggering refetch
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    // Initialize form data with user values
    useEffect(() => {
        setFormData({
            name: user?.user?.name || "",
            email: user?.user?.email || "",
            phone: user?.user?.phone || "",
        });
    }, [user]);

    const userGet = useUser();
    const id = userGet?.id


    // Fetch user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`https://pos-backend-delta.vercel.app/api/users/${id}`);
                setUser(response.data);
                setFormData(response.data); // Populate form with fetched data
            } catch (err) {
                setError(err);
                console.error("Error fetching user:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, refetchToggle]); // Refetch when refetchToggle changes

    if (isLoading) {
        return <div className='flex justify-center items-center h-screen text-white'>Loading...</div>;
    }

    if (error) {
        return <div>Error fetching user: {error.message}</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

 // Handle form submission for updating user
 const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading1(true);
    try {
        const response = await axios.put(
            `https://pos-backend-delta.vercel.app/api/users/update/${id}`,
            formData
        );
        toast.success(response.data.message);
        setLoading1(false);
        setRefetchToggle(!refetchToggle); // Toggle refetchToggle to refetch user data
    } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user.");
    } finally {
        setLoading1(false);
    }
};




    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading2(true);
        // Frontend validation
        if (!newPassword || !confirmPassword) {
            toast.error("All fields are required!");
            return;
        }

        if (newPassword === currentPassword) {
            toast.error("New password cannot be the same as the current password!");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and Confirm password do not match!");
            return;
        }

        try {
            const response = await axios.put(`https://pos-backend-delta.vercel.app/api/users/update/${id}`, {
                password: newPassword,
                currentPassword, // Include current password for backend verification
            });
            console.log(response.status)
            toast.success("Password updated successfully!");
            setNewPassword("")
            setConfirmPassword("")
            setLoading2(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    };


    if (loading || !online) {
        return <FinalLoader />;
    }

    return (
        <div>
            <div>
                <CommonTopNab />
            </div>
            <div className='p-5'>
                <div className="w-full min-h-screen border border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-5 border-b border-blue-200">
                        <div className="h-16 flex items-center pl-5 text-2xl">
                            <p>My Profile</p>
                        </div>
                    </div>
                    <div className='p-5'>
                        <div className='flex gap-5 items-center'>
                            <p className="w-24 h-24  uppercase text-5xl font-bold rounded-full flex justify-center items-center bg-blue-200">
                                {user?.user?.name?.charAt(0)}
                            </p>
                            <div>
                                Name: {user?.user?.name}
                                <br />
                                email: {user?.user?.email}
                                <br />
                            </div>
                        </div>



                        <div className='flex justify-around'>
                            {/* update basic info */}
                            <div className='w-[500px] h-[410px] border rounded-xl mt-5'>
                                <div className='border-b font-semibold h-10 flex items-center pl-2'>
                                    <p>Update Profile info</p>
                                </div>

                                <form onSubmit={handleFormSubmit}>
                                    <div className="p-2">
                                        <label htmlFor="name" className="block text-sm font-medium">
                                            Name
                                        </label>
                                        <div className="flex items-center bg-white rounded-3xl">
                                            <input
                                                defaultValue={user?.user?.name}
                                                onChange={handleInputChange}
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <label htmlFor="email" className="block text-sm font-medium">
                                            Email
                                        </label>
                                        <div className="flex items-center bg-white rounded-3xl">
                                            <input
                                                defaultValue={user?.user?.email}
                                                onChange={handleInputChange}
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <label htmlFor="phone" className="block text-sm font-medium">
                                            Phone
                                        </label>
                                        <div className="flex items-center bg-white rounded-3xl">
                                            <input
                                                defaultValue={user?.user?.phone}
                                                onChange={handleInputChange}
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <label htmlFor="role" className="block text-sm font-medium">
                                            Role
                                        </label>
                                        <div className="flex items-center bg-white rounded-3xl">
                                            <input
                                                disabled
                                                defaultValue={user?.user?.role}
                                                type="text"
                                                name="role"
                                                className="w-full outline-none border cursor-not-allowed py-2 pl-3 rounded-md"
                                                placeholder="Role"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                    <button type="submit" className="w-40 text-white transition-all duration-300 flex items-center justify-center bg-blue-500 hover:bg-blue-700 rounded-md py-2">
                                            {loading1 ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" /> Updating...
                                                </>
                                            ) : (
                                                "Update"
                                            )}
                                        </button>
                                    </div>
                                </form>


                            </div>

                            {/* update password */}
                            <div className="w-[500px] h-[410px] border rounded-xl mt-5">
                                <div className="border-b font-semibold h-10 flex items-center pl-2">
                                    <p>Update Password</p> <button type="button" onClick={togglePasswordVisibility} className="px-2 text-2xl">
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                <form className='mt-8' onSubmit={handlePasswordSubmit}>
                                    <div className="p-2 hidden">
                                        <label htmlFor="currentPassword" className="block text-sm font-medium">
                                            Current password
                                        </label>
                                        <div className="flex items-center bg-white rounded-md">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Enter current password"

                                            />

                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <label htmlFor="newPassword" className="block text-sm font-medium">
                                            New password
                                        </label>
                                        <div className="flex items-center bg-white rounded-md">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="newPassword"
                                                name="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium">
                                            Confirm New password
                                        </label>
                                        <div className="flex items-center bg-white rounded-md">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full outline-none border py-2 pl-3 rounded-md"
                                                placeholder="Confirm new password"
                                                required
                                            />

                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <button type="submit" className="w-40 transition-all duration-300 text-white flex items-center justify-center bg-blue-500 hover:bg-blue-700 rounded-md py-2">
                                            {loading2 ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" /> Updating...
                                                </>
                                            ) : (
                                                "Update"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>


                    </div>



                </div>
            </div>

        </div>
    )
}

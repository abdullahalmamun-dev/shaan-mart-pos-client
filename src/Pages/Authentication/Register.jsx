// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import { RiShieldUserFill } from 'react-icons/ri';
import { SiGmail } from 'react-icons/si';
import { NavLink, useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`${data?.message}`);
                console.log('Response:', data);
                localStorage.setItem('user', JSON.stringify(data.user)); // Save user info
                navigate("/dashboard");
            } else {
                const errorData = await response.json();
                toast.error(`${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while creating the user.');
        }
    };


    return (
        <div className='bg-register flex justify-center items-center'>
            <form
                className="mx-3 lg:mx-0 p-6 rounded-lg lg:w-[400px] relative"
                onSubmit={handleSubmit}
            >
                <div className="flex justify-center ">
                    <h2 className="text-5xl font-semibold mb-2 Register-text">Pos System</h2>
                </div>

                {/* Name Input */}
                <div className="mb-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                        Name
                    </label>
                    <div className="flex items-center bg-white rounded-3xl p-2">
                        <FaUser className="text-[#9494a0] mr-2" />
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full outline-none"
                            placeholder="Enter your name"
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div className="mb-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <div className="flex items-center bg-white rounded-3xl p-2">
                        <SiGmail className="text-[#9494a0] mr-2" />
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full outline-none"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                {/* Phone Number Input */}
                <div className="mb-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                        Phone Number
                    </label>
                    <div className="flex items-center bg-white rounded-3xl p-2">
                        <FaPhone className="text-[#9494a0] mr-2" />
                        <input
                            required
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full outline-none"
                            placeholder="Enter your phone number"
                        />
                    </div>
                </div>

                {/* Role Input */}
                <div className="mb-2">
                    <label htmlFor="role" className="block text-sm font-medium">
                        Role
                    </label>
                    <div className="flex items-center bg-white rounded-3xl p-2">
                        <RiShieldUserFill className="text-[#9494a0] mr-2" />
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full outline-none"
                            required
                        >
                            <option value="">Select a role</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <div className="flex items-center bg-white rounded-3xl p-2">
                        <FaLock className="text-[#9494a0] mr-2" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full outline-none"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none ml-2"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        className="w-full bg-[#fcda6c] hover:bg-[#f5e091] transition-all duration-300 font-bold py-2 px-4 rounded-3xl"
                    >
                        Register
                    </button>
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick={false}
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </div>


                <div className='flex items-center gap-3 justify-center mt-0'>
                    <div className='w-[100px] h-[2px] bg-white'></div>
                    <p className=''>OR</p>
                    <div className='w-[100px] h-[2px] bg-white'></div>
                </div>
                <div className='flex justify-center'>
                    <small>Already have an account?</small>
                    <NavLink to="/login"><small className='text-blue-500 underline ml-2'>Login</small></NavLink>
                </div>
            </form>
        </div>
    )
}

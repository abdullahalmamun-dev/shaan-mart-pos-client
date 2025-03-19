// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useRef } from "react";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import successSound from ".././../../public/sounds/success.mp3"
import errorSound from ".././../../public/sounds/error.mp3"
import notifications from ".././../../public/sounds/notification.mp3"
import { useNavigate } from "react-router";
export default function Pos() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    // const [selectedDate, setSelectedDate] = useState("");
    // const [subtotal, setSubtotal] = useState(0);
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        purchaseDate: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cart = JSON.parse(sessionStorage.getItem("purchased_products")) || [];
        setPurchasedProducts(cart);
        calculateGrandTotal(cart);
    }, []);

    // Refs for audio elements
    const successSoundRef = useRef(null);
    const errorSoundRef = useRef(null);
    const notificationSoundRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "https://pos-backend-delta.vercel.app/api/products/getProduct"
                );
                setProducts(response.data.products);
                setFilteredProducts(response.data.products);

                const uniqueBrands = [
                    ...new Set(response.data.products.map((item) => item.p_brand)),
                ];
                setBrands(uniqueBrands);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    "https://pos-backend-delta.vercel.app/api/category/getCategories"
                );
                setCategories(response.data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleFilter = () => {
        const filtered = products.filter(
            (item) =>
                (selectedCategory === "" || item.p_category === selectedCategory) &&
                (selectedBrand === "" || item.p_brand === selectedBrand) &&
                (searchCode === "" || item.p_code.includes(searchCode))
        );
        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page
    };

    // Handle add to cart
    const handleAddToCart = (product) => {
        let cart = JSON.parse(sessionStorage.getItem("purchased_products")) || [];
        const productExists = cart.some((item) => item._id === product._id);

        if (productExists) {
            // Product already in cart, play error sound and show error toast
            if (errorSoundRef.current) {
                errorSoundRef.current.play(); // Play error sound
            }
            toast.error("Product already added to the cart!"); // Show error toast
        } else {
            // Add product to cart with default quantity of 1
            cart.push({ ...product, quantity: 1 });
            updateCart(cart);

            // After adding to cart, play success sound and show success toast
            if (successSoundRef.current) {
                successSoundRef.current.play(); // Play success sound
            }
            toast.success("Product added to the cart!"); // Show success toast
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Calculate grand total when purchasedProducts changes
    useEffect(() => {
        calculateGrandTotal();
    }, [purchasedProducts]);

    // Update sessionStorage and state
    const updateCart = (cart) => {
        sessionStorage.setItem("purchased_products", JSON.stringify(cart));
        setPurchasedProducts(cart);
    };

    // Increase quantity
    const increaseQuantity = (productId) => {
        let cart = [...purchasedProducts];
        const productIndex = cart.findIndex((item) => item._id === productId);
        if (productIndex !== -1) {
            cart[productIndex].quantity += 1;
            updateCart(cart);
        }
    };

    // Decrease quantity
    const decreaseQuantity = (productId) => {
        let cart = [...purchasedProducts];
        const productIndex = cart.findIndex((item) => item._id === productId);
        if (productIndex !== -1 && cart[productIndex].quantity > 1) {
            cart[productIndex].quantity -= 1;
            updateCart(cart);
        }
    };


    // Delete product from cart
    const deleteProduct = (productId) => {
        let cart = JSON.parse(sessionStorage.getItem("purchased_products")) || [];
        const updatedCart = cart.filter((item) => item._id !== productId);
        updateCart(updatedCart);

        // Play error sound when product is deleted
        if (errorSoundRef.current) {
            errorSoundRef.current.play();
        }
        toast.success("Product removed from the cart!");
    };

    // Calculate grand total
    const calculateGrandTotal = () => {
        let total = 0;
        purchasedProducts.forEach((product) => {
            const productSubtotal = product.quantity * product.p_price;
            const productTax = (product.tax / 100) * productSubtotal;
            total += productSubtotal + productTax;
        });
        setGrandTotal(total.toFixed(2));
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { customerName, customerEmail, customerPhone, customerAddress, purchaseDate } = formData;

        if (!customerName || !customerEmail || !customerPhone || !customerAddress || !purchaseDate) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (purchasedProducts.length === 0) {
            
            toast.error("No product added to the purchase list");
            errorSoundRef.current.play();
            return;
        }

        const payload = {
            ...formData,
            purchasedProducts,
            grandTotal,
            totalItems: purchasedProducts.reduce((total, product) => total + product.quantity, 0),
        };

        try {
            setIsLoading(true);
            const response = await axios.post(
                "https://pos-backend-delta.vercel.app/api/customerProduct/createCustomerProduct",
                payload
            );

            if (response.status === 201) {
                toast.success("Order submitted successfully!");
                notificationSoundRef.current.play();
                console.log(response.data)
                setTimeout(() => {
                    navigate("/customerList");
                  }, 1000); // 1-second delay
                setFormData({
                    customerName: "",
                    customerEmail: "",
                    customerPhone: "",
                    customerAddress: "",
                    purchaseDate: "",
                });
                setPurchasedProducts([]);
                sessionStorage.removeItem("purchased_products");
                setGrandTotal(0);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Failed to submit order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    console.log(purchasedProducts)


    return (
        <div>
            <CommonTopNab />
            {/* Audio Elements */}
            <audio ref={successSoundRef} src={successSound} preload="auto" />
            <audio ref={errorSoundRef} src={errorSound} preload="auto" />
            <audio ref={notificationSoundRef} src={notifications} preload="auto" />

            {/* Toaster for Notifications */}
            <Toaster
                position="top-center"
                reverseOrder={false}
            />

            <section className="flex mt-2 mb-10">
                <div className="w-[55%] p-3">
                    <div className="">
                        <div className="form-container">
                            <form onSubmit={handleSubmit} className="border-b border-blue-300">
                                <div className="flex flex-wrap gap-2">          
                                <div className="flex flex-col">
                                    <label className="text-sm">
                                        Customer Name<span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        required
                                        className="border h-10 w-[220px] border-blue-100 pl-3 rounded-lg outline-none"                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm">
                                        Customer Email<span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="customerEmail"
                                        type="email"
                                        value={formData.customerEmail}
                                        onChange={handleInputChange}
                                        required
                                         className="border h-10 w-[220px] border-blue-100 pl-3 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm">
                                        Customer Phone<span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        required
                                         className="border h-10 w-[220px] border-blue-100 pl-3 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm">
                                        Customer Address<span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="customerAddress"
                                        value={formData.customerAddress}
                                        onChange={handleInputChange}
                                        required
                                         className="border h-10 w-[500px] border-blue-100 pl-3 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm">
                                        Purchase Date<span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={handleInputChange}
                                        required
                                         className="border h-10 w-[150px] border-blue-100 pl-3 rounded-lg outline-none"
                                    />
                                </div>
                                </div>
                                <button className="border px-2 py-2 mt-2 rounded-lg mb-2 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300" type="submit" disabled={isLoading}>
                                    {isLoading ? "Submitting..." : "Submit Order"}
                                </button>
                            </form>
                        </div>

                        <div className="h-[300px] overflow-y-auto mt-5 text-sm">
                            {purchasedProducts.length === 0 ? (
                               <div className="flex justify-center items-center mt-20"> <p>No product added.</p></div>
                            ) : (
                                <>
                                    <ul>
                                        {purchasedProducts.map((product) => {
                                            const productSubtotal = product.quantity * product.p_price;
                                            const productTax = (product.tax / 100) * productSubtotal;

                                            return (
                                                <li key={product._id} className="mb-4">
                                                    <div className="border p-4 rounded-md flex justify-between items-center">

                                                        <div>
                                                            <p><strong>Product Name:</strong> {product.p_name}</p>
                                                            <p><strong>Product Code:</strong> {product.p_code}</p>
                                                            <p><strong>Brand:</strong> {product.p_brand}</p>
                                                            <p><strong>Category:</strong> {product.p_category}</p>
                                                            <p><strong>Price:</strong> ${product.p_price.toFixed(2)}</p>
                                                            <p><strong>Stock:</strong> {product.p_quantity}</p>
                                                            <p><strong>Tax Rate:</strong> {product.tax}%</p>
                                                        </div>

                                                        <div>
                                                            {/* Quantity Control */}
                                                            <div className="flex items-center mt-4">
                                                                <button
                                                                    onClick={() => decreaseQuantity(product._id)}
                                                                    className="bg-gray-300 px-4 py-2 rounded-l-md"
                                                                >
                                                                    -
                                                                </button>
                                                                {product.quantity > product.p_quantity ? <p className="w-28 flex justify-center">not in stoke</p> : <span className="px-4 border w-28 flex justify-center">{product.quantity}</span>}

                                                                {product.quantity >= product.p_quantity ? <button
                                                                    disabled className="bg-gray-300 px-4 cursor-not-allowed py-2 rounded-r-md"
                                                                >
                                                                    +
                                                                </button> : <button
                                                                    onClick={() => increaseQuantity(product._id)}
                                                                    className="bg-gray-300 px-4 py-2 rounded-r-md"
                                                                >
                                                                    +
                                                                </button>}
                                                            </div>

                                                            {/* Subtotal and Tax */}
                                                            <p className="mt-4">
                                                                <strong>Subtotal:</strong> ${productSubtotal.toFixed(2)}
                                                            </p>
                                                            <p>
                                                                <strong>Tax:</strong> ${productTax.toFixed(2)}
                                                            </p>
                                                            <p>
                                                                <strong>Total for Product:</strong> $
                                                                {(productSubtotal + productTax).toFixed(2)}
                                                            </p>

                                                            {/* Delete Button */}
                                                            <button
                                                                onClick={() => deleteProduct(product._id)}
                                                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>


                                </>
                            )}
                        </div>
                        {/* Grand Total */}
                        <div className="mt-5 border-t pt-4 bg-blue-100 p-5 rounded-lg flex flex-col items-end">
                            <p><strong>Total item:</strong> {purchasedProducts.reduce((total, product) => total + product.quantity, 0)}</p>
                            <p className="text-lg font-semibold">
                                Grand Total: ${grandTotal}
                            </p>
                            {/* Total Quantity */}

                        </div>

                    </div>
                </div>



                <div className="w-[45%] min-h-screen border border-blue-500 rounded-2xl">
                    <div className="flex px-3 py-3 items-center gap-5 border-b border-blue-500">
                        {/* Filter by Category */}
                        <div className="flex flex-col">
                            <select
                                name="p_category"
                                className="w-[130px] outline-none h-8 border rounded-md text-[10px] border-blue-500 border-[#00000026]"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Filter with category</option>
                                {categories?.map((item) => (
                                    <option key={item._id} value={item.category_name}>
                                        {item.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Filter by Brand */}
                        <div className="flex flex-col">
                            <select
                                name="p_brand"
                                className="w-[130px] outline-none h-8 border rounded-md text-[10px] border-blue-500"
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                            >
                                <option value="">Filter with brand</option>
                                {brands?.map((brand, index) => (
                                    <option key={index} value={brand}>
                                        {brand}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Search by Code */}
                        <div className="flex flex-col">
                            <input
                                type="text"
                                placeholder="Search by code"
                                className="w-[130px] outline-none h-8 border pl-2 rounded-md text-[14px] border-blue-500"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                        </div>
                        {/* Apply Filters Button */}
                        <button
                            className="border text-sm px-2 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-300 hover:text-black transition-all duration-300"
                            onClick={handleFilter}
                        >
                            Apply Filters
                        </button>
                    </div>

                    <div className="p-3">
                        {currentItems.length === 0 && (
                            <div className="text-3xl flex justify-center mt-5">No products found</div>
                        )}

                        <div className="flex flex-wrap gap-3 justify-center">
                            {currentItems.map((product) => (
                                <div
                                    key={product._id}
                                    className="rounded-xl border w-40 py-3 text-[10px] flex flex-col items-center"
                                >
                                    <img
                                        className="w-[70px] object-contain rounded-2xl"
                                        src={product?.p_images}
                                        alt={product?.p_name}
                                    />
                                    <p>{product?.p_name}</p>
                                    <p>Code: {product?.p_code}</p>
                                    <p>Brand: {product?.p_brand}</p>
                                    <p>Category: {product?.p_category}</p>
                                    <p>Quantity: {product?.p_quantity}</p>
                                    <p>Price: {product?.p_price}</p>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="border px-3 py-2 w-20 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors duration-300"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-end items-center mt-5 mb-5 mr-5">
                        <button
                            className="btn text-blue-500 mx-1"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        <span className="mx-3">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn text-blue-500 mx-1"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}

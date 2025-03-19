// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCaretRight, FaEye, FaSpinner } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import { CiEdit } from "react-icons/ci";
import toast from "react-hot-toast";
import { AiTwotoneDelete } from "react-icons/ai";
import useLoader from "../../Shared/Loader/Loader";
import FinalLoader from "../../Shared/Loader/FinalLoader";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [singleProduct, setSingleProduct] = useState(null);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [loading1, setLoading1] = useState(false);
  const { loading, online } = useLoader();
  const imageHosKey = '29473dd4ab78ebc95009722bc0558d38';
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products/getProduct"
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:5000/api/products/getProduct");
  //       setProducts(response.data.products);
  //       setFilteredProducts(response.data.products);

  //       const uniqueBrands = [
  //         ...new Set(response.data.products.map((item) => item.p_brand)),
  //       ];
  //       setBrands(uniqueBrands);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     }
  //   };

  //   // Fetch data every 100ms
  //   const interval = setInterval(fetchData, 100);

  //   // Cleanup the interval when component is unmounted or effect is rerun
  //   return () => clearInterval(interval);
  // }, []);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/category/getCategories"
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
        (selectedCategory === "" ||
          item.p_category === selectedCategory) &&
        (selectedBrand === "" || item.p_brand === selectedBrand)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const handleViewProduct = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/single/${id}`
      );
      setSingleProduct(response.data);
      document.getElementById("singleDetailsModal").showModal();
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleUpdateProductFetch = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/single/${id}`
      );
      setUpdateProduct(response.data);
      document.getElementById("updateModal").showModal();
    } catch (error) {
      console.error("Error fetching product details:", error);
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

  console.log(currentItems.length)

  // update product 

  // delete product 
  const handleDeleteProduct = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
    
    if (!isConfirmed) {
      return; // If the user clicks "No", exit the function
    }
  
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/products/delete/${id}`
      );
  
      if (response.status === 200) {
        toast.success('Product deleted successfully!');
        // Remove the deleted product from state without reloading1
        setProducts(products.filter((product) => product._id !== id));
        setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
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
      <div className="p-5">
        <div className="w-full min-h-screen border border-blue-500 rounded-2xl">
          <div className="flex items-center gap-5 border-b border-blue-500">
            <div className="h-16 flex items-center pl-5 text-2xl">
              <p>All Products</p>
            </div>
            {/* Filter by category */}
            <div className="flex flex-col">
              <select
                name="p_category"
                className="select w-[320px] input border-[#00000026] border-blue-500 border"
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
            {/* Filter by brand */}
            <div className="flex flex-col">
              <select
                name="p_brand"
                className="select w-[320px] input border-[#00000026] border-blue-500 border"
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
            <button
              className="border text-sm px-2 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-300 hover:text-black transition-all duration-300"
              onClick={handleFilter}
            >
              Apply Filters
            </button>
          </div>

          <div className="p-3">
            <div className="flex border-b text-sm gap-5">
              <p className="w-[15%] py-2">Image</p>
              <p className="w-[15%] py-2">P-Name</p>
              <p className="w-[10%] py-2">P-Code</p>
              <p className="w-[10%] py-2">Brand</p>
              <p className="w-[10%] py-2">Category</p>
              <p className="w-[10%] py-2">Quantity</p>
              <p className="w-[10%] py-2">Price</p>
              <p className="w-[10%] py-2">Cost</p>
              <p className="w-[10%] py-2">Action</p>
            </div>
            {
              currentItems.length === 0 && <div className="text-3xl flex justify-center mt-5">No products found</div>}


            <div>
              {currentItems.map((product) => (
                <div
                  key={product._id}
                  className="flex border-b items-center py-3 text-sm"
                >
                  <div className="w-[15%]">
                    <img
                      className="w-[70px] object-contain rounded-2xl"
                      src={product?.p_images}
                      alt=""
                    />
                  </div>
                  <div className="w-[15%] px-3">
                    <p>{product?.p_name}</p>
                  </div>
                  <div className="w-[10%]">
                    <p>{product?.p_code}</p>
                  </div>
                  <div className="w-[10%]">
                    <p>{product?.p_brand}</p>
                  </div>
                  <div className="w-[10%]">
                    <p>{product?.p_category}</p>
                  </div>
                  <div className="w-[10%] pl-5">
                    {product?.p_quantity !== 0 &&<p> {product?.p_quantity}</p>}
                    {product?.p_quantity === 0 &&<p className="text-red-600">Stoke out</p>}
                  </div>
                  <div className="w-[10%] pl-2">
                    <p>{product?.p_price}</p>
                  </div>
                  <div className="w-[10%] pl-2">
                    <p>{product?.p_cost}</p>
                  </div>
                  <div className="dropdown dropdown-left">
                    <div tabIndex={0} role="button" className="btn m-1 text-blue-500">
                      Action
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content items-center border border-blue-500 menu bg-white rounded-md z-[1] w-52  shadow"
                    >
                      <FaCaretRight className="absolute text-3xl ml-[218px] text-blue-600" />

                      <li className="w-full border-b text-blue-500" onClick={() => handleViewProduct(product._id)}>
                        <a>
                          <FaEye className="text-2xl" />
                          View
                        </a>
                      </li>
                      <li className="w-full border-b text-blue-500" onClick={() => handleUpdateProductFetch(product._id)}>
                        <a><CiEdit className="text-2xl" /> Edit</a>
                      </li>
                      <li className="w-full border-b text-red-500" onClick={() => handleDeleteProduct(product._id)} >
                        <a><AiTwotoneDelete className="text-2xl" /> Delete</a>
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-5 mb-5 mr-5">
            <button
              className="btn text-blue-500"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="mx-3 ">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn text-blue-500"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>


 
        {/* Modal for product details */}
        <dialog id="singleDetailsModal" className="modal">
          <div className="p-5 rounded-2xl bg-white w-[1000px] body" key={singleProduct?._id}>
            <div className='flex justify-between items-center border-b pb-2 fixed w-[950px] bg-white z-10'>
              <h2 className="text-2xl font-bold">Product Details</h2>
              <button
                className="btn"
                onClick={() => document.getElementById('singleDetailsModal').close()}
              >
                <IoClose className='text-4xl' />
              </button>
            </div>
            <div className='flex gap-5 mt-20'>
              <img src={singleProduct?.p_images} className='w-56 object-contain rounded-xl' alt="" />
              <div>
                <h3 className="font-bold text-lg"><span className='font-bold'>Product Name:</span> {singleProduct?.p_name}</h3>

                <p className="mt-3"><span className='font-bold'>Brand:</span> {singleProduct?.
                  p_brand}</p>
                <p className="mt-3"><span className='font-bold'>Category:</span> {singleProduct?.
                  p_category}</p>
                <p className="mt-3"><span className='font-bold'>Details:</span> {singleProduct?.
                  p_details}</p>
                <p className="mt-3"><span className='font-bold'>Unit:</span> {singleProduct?.p_unit}</p>
                <p className="mt-3"><span className='font-bold'>Code:</span> {singleProduct?.p_code}</p>
                <p className="mt-3"><span className='font-bold'>Price:</span> {singleProduct?.p_price}</p>
                <p className="mt-3"><span className='font-bold'>Cost:</span> {singleProduct?.p_cost}</p>
                <p className="mt-3"><span className='font-bold'>Quantity:</span> {singleProduct?.p_quantity}</p>
                <p className="mt-3"><span className='font-bold'>tax:</span> {singleProduct?.tax}%</p>
               { singleProduct?.p_quantity !== 0 &&<p className="mt-3 text-green-600"><span className='font-bold '>Status:</span> in stoke</p>}
               { singleProduct?.p_quantity === 0 &&<p className="mt-3 text-red-500"><span className='font-bold '>Status:</span> Stoke out</p>}
              </div>
            </div>


          </div>
        </dialog>
        {/* Modal for product details end*/}
        {/* Modal for product details */}
        <dialog id="updateModal" className="modal">
          <div className="p-5 rounded-2xl bg-white w-[1050px] h-[95vh] body" key={updateProduct?._id}>
            <div className="flex justify-between items-center border-b pb-2 fixed w-[950px] bg-white z-10">
              <h2 className="text-2xl font-bold">Edit Products</h2>
              <button
                className="btn"
                onClick={() => document.getElementById("updateModal").close()}
              >
                <IoClose className="text-4xl" />
              </button>
            </div>

            {/* Update form */}
            <form
              className="mt-20"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading1(true);
                const formData = new FormData(e.target);

                const updatedData = {
                  p_name: formData.get("p_name"),
                  p_category: formData.get("p_category"),
                  p_brand: formData.get("p_brand"),
                  p_price: formData.get("p_price"),
                  p_cost: formData.get("p_cost"),
                  p_quantity: formData.get("p_quantity"),
                  p_unit: formData.get("p_unit"),
                  tax: formData.get("tax"),
                  p_details: formData.get("p_details"),
                };

                const imageFile = formData.get("p_image");
                if (imageFile && imageFile.size > 0) {
                  const imageFormData = new FormData();
                  imageFormData.append("image", imageFile);

                  try {
                    const uploadResponse = await fetch(
                      `https://api.imgbb.com/1/upload?key=${imageHosKey}`,
                      {
                        method: "POST",
                        body: imageFormData,
                      }
                    );
                    const uploadResult = await uploadResponse.json();
                    if (uploadResult.success) {
                      updatedData.p_images = uploadResult.data.url; // Just assign the image URL (not an array)
                    }
                  } catch (error) {
                    console.error("Error uploading1 image:", error);
                    toast.error("Image upload failed. Please try again.");
                    return;
                  }
                }

                // Send the PUT request
                try {
                  const response = await fetch(
                    `http://localhost:5000/api/products/update/${updateProduct._id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(updatedData),
                    }
                  );

                  const result = await response.json();

                  if (response.ok) {
                    toast.success("Product updated successfully");
                    document.getElementById("updateModal").close();
                    setLoading1(false);
                    // Optionally refresh product list here
                  } else {
                    toast.error(result.message || "Failed to update product");
                  }
                } catch (error) {
                  console.error("Error updating product:", error);
                  toast.error("An error occurred. Please try again.");
                }

              }}
            >
              <div className="flex gap-5 flex-wrap">
                {/* Form fields */}
                <div>
                  <label className="label">
                    <span className="label-text">Product name</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_name}
                    type="text"
                    placeholder="Product name"
                    name="p_name"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="label-text mb-2 mt-2">Product Category</span>
                  <select
                    name="p_category"
                    className="select w-[320px] input border-[#00000026] border"
                  >
                    <option defaultValue={updateProduct?.p_category}>{updateProduct?.p_category}</option>
                    {categories?.map((item) => (
                      <option key={item._id}>{item.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Brand</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_brand}
                    type="text"
                    placeholder="Brand"
                    name="p_brand"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Product Price</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_price}
                    type="number"
                    placeholder="Product Price"
                    name="p_price"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Product Cost</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_cost}
                    type="number"
                    placeholder="Product Cost"
                    name="p_cost"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Product Quantity</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_quantity}
                    type="number"
                    placeholder="Product Quantity"
                    name="p_quantity"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Product unit</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.p_unit}
                    type="text"
                    placeholder="Product unit"
                    name="p_unit"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Product Tax</span>
                  </label>
                  <input
                    defaultValue={updateProduct?.tax}
                    type="number"
                    placeholder="Product tax"
                    name="tax"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Product Image</span>
                  </label>
                  <input
                    type="file"
                    name="p_image"
                    className="w-[320px] input border-[#00000026] border"
                  />
                </div>
                <div className="w-full h-20">
                  <label className="label">
                    <span className="label-text">Details</span>
                  </label>
                  <textarea
                    defaultValue={updateProduct?.p_details}
                    type="text"
                    placeholder="Details"
                    name="p_details"
                    className="w-[97%] h-full input border-[#00000026] border"
                  />
                </div>
              </div>
              <div className="mt-10">
                <button type="submit" className="btn btn-primary">
                  {loading1 ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
        {/* Modal for product details end*/}
      </div>
    </div>
  );
}

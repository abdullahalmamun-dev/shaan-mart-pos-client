import { useState } from "react";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import toast from "react-hot-toast";
import useGetData from "../../Hooks/useGetData";
import axios from "axios";
import { FaCaretRight, FaEdit } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai";
import useLoader from "../../Shared/Loader/Loader";
import FinalLoader from "../../Shared/Loader/FinalLoader";

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // For storing the category being edited
  const [editLoading, setEditLoading] = useState(false); // For the update loading state
  const { loading2, online } = useLoader();
  const { data: categoriesData, isLoading: tableLoading, refetch } = useGetData(
    "https://pos-backend-delta.vercel.app/api/category/getCategories"
  );

  const { data: productsData } = useGetData("https://pos-backend-delta.vercel.app/api/products/getProduct");

  const enrichedCategories = categoriesData?.categories?.map((category) => {
    const productsInCategory = productsData?.products?.filter(
      (product) => product.p_category === category.category_name
    );
    const brandsInCategory = [
      ...new Set(productsInCategory?.map((product) => product.p_brand)),
    ];

    return {
      ...category,
      productCount: productsInCategory?.length || 0,
      brandCount: brandsInCategory?.length || 0,
    };
  });

  // Adding categories
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://pos-backend-delta.vercel.app/api/category/crate-category",
        {
          category_name: categoryName,
        }
      );

      if (response.status === 201) {
        toast.success("Category added successfully!");
        setCategoryName("");
        refetch(); // Refresh the table data
      } else {
        toast.error("Failed to add category. Please try again.");
      }
    } catch {
      toast.error("Category Already Exists. Please Change the Name.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single category details
  const handleEditCategory = async (id) => {
    try {
      const response = await axios.get(`https://pos-backend-delta.vercel.app/api/category/single/${id}`);
      if (response.status === 200) {
        setEditingCategory(response.data); // Set the category being edited
        setCategoryName(response.data.category_name); // Set the input value
        document.getElementById("my_modal_2").showModal(); // Open the modal
      } else {
        toast.error("Failed to fetch category details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching category details:", error);
      toast.error("An error occurred while fetching the category.");
    }
  };

  // Update the category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const response = await axios.put(
        `https://pos-backend-delta.vercel.app/api/category/update/${editingCategory._id}`,
        { category_name: categoryName }
      );

      if (response.status === 200) {
        toast.success("Category updated successfully!");
        setEditingCategory(null); // Reset editing category
        refetch(); // Refresh the table data
        document.getElementById("my_modal_2").close(); // Close the modal
      } else {
        toast.error("Failed to update category. Please try again.");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("An error occurred while updating the category.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete the category
  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await axios.delete(
          `https://pos-backend-delta.vercel.app/api/category/delete/${id}`
        );
        if (response.status === 200) {
          toast.success("Category deleted successfully!");
          refetch();
        } else {
          toast.error("Failed to delete category. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("An error occurred while deleting the category.");
      }
    }
  };

  if (tableLoading) {
    return <FinalLoader />;
  }

  if (loading2 || !online) {
    return <FinalLoader />;
  }

  return (
    <div>
      <CommonTopNab />
      <div className="p-5">
        <div className="w-full border border-blue-500 rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-5">Add Category</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="category_name" className="font-medium mb-2">
                Category Name:
              </label>
              <input
                id="category_name"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="input border border-gray-300 p-2 rounded-md w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>
      <div className="p-5">
        <div className="w-full min-h-screen border border-blue-500 rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-5">Products Category Table</h2>

          <table className="table-auto w-full border-collapse border border-gray-300 ">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="border border-gray-300 px-4 py-2">Category Name</th>
                <th className="border border-gray-300 px-4 py-2">Products Count</th>
                <th className="border border-gray-300 px-4 py-2">Brands Count</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {enrichedCategories?.map((category) => (
                <tr key={category._id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {category.category_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {category.productCount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {category.brandCount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="dropdown dropdown-left flex justify-center">
                      <div>
                        <button className="btn m-1 text-blue-500">Action</button>
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content items-center border border-blue-500 menu bg-white rounded-md z-[1] w-52 shadow"
                      >
                        <FaCaretRight className="absolute text-3xl ml-[218px] text-blue-600" />
                        <li
                          className="w-full border-b text-blue-500"
                          onClick={() => handleEditCategory(category._id)}
                        >
                          <a>
                            <FaEdit className="text-2xl" />
                            Edit
                          </a>
                        </li>
                        <li
                          className="w-full border-b text-red-500"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <a>
                            <AiTwotoneDelete className="text-2xl" />
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box bg-white">
            <form onSubmit={handleUpdateCategory}>
              <div className="flex flex-col">
                <label className="text-sm">Edit Category</label>
                <input
                  name="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="border h-10 w-[220px] border-blue-100 pl-3 rounded-lg outline-none"
                />
              </div>
              <button
                type="submit"
                className="border px-2 py-2 mt-2 rounded-lg mb-2 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300"
                disabled={editLoading}
              >
                {editLoading ? "Updating..." : "Update Category"}
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}

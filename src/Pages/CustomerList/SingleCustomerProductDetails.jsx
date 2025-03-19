// eslint-disable-next-line no-unused-vars
import React from "react";
import CommonTopNab from "../../Shared/CommonTopNav/CommonTopNab";
import { useLoaderData } from "react-router";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { TiPrinter } from "react-icons/ti";
import { FaRegFilePdf } from "react-icons/fa6";
import toast from "react-hot-toast";
import axios from "axios";

export default function SingleCustomerProductDetails() {
  const data = useLoaderData();
  // Add null check for data
  const customer = data?.data;

  // If customer data is not available, show a loading state or error message
  if (!customer) {
    return (
      <div>
        <CommonTopNab />
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Loading data or no data available...</h2>
        </div>
      </div>
    );
  }

  const calculateTax = (price, taxRate) => ((price * taxRate) / 100).toFixed(2);
  const calculateProductTotal = (price, quantity, tax) =>
    (price * quantity + parseFloat(tax)).toFixed(2);

  const formatDateTime = (dateString) => {
    // Ensure the input date is a valid Date object
    if (!dateString) return "No date available";
    
    const date = new Date(dateString);
    
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date and time for the Asia/Dhaka timezone
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka", // Convert to Bangladeshi time zone
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use AM/PM format
    });
  };

  // Update grand total to consider dynamic tax rates, with proper null checks
  const grandTotal = customer.purchasedProducts?.reduce(
    (total, product) =>
      total +
      parseFloat(
        calculateProductTotal(
          product.p_price,
          product.quantity,
          calculateTax(product.p_price, product.tax || 0) // Default to 0 if tax is undefined
        )
      ),
    0
  );

  const handlePrint = () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .table th { background-color: #f4f4f4; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .footer { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add custom header
    doc.setFontSize(18);
    doc.text("Positive IT Solution", doc.internal.pageSize.getWidth() / 2, 10, {
      align: "center",
    });

    // Add customer details with null checks
    doc.setFontSize(12);
    doc.text(`Customer Name: ${customer.customerName || "N/A"}`, 10, 20);
    doc.text(`Customer Email: ${customer.customerEmail || "N/A"}`, 10, 25);
    doc.text(`Customer Phone: ${customer.customerPhone || "N/A"}`, 10, 30);
    doc.text(`Customer Address: ${customer.customerAddress || "N/A"}`, 10, 35);
    doc.text(`Purchase Date: ${formatDateTime(customer.purchaseDate || customer.createdAt)}`, 10, 40);
    doc.text(`Total Items: ${customer.totalItems || 0}`, 10, 45);
    doc.text(`Grand Total: $${grandTotal || 0}`, 10, 50);
    doc.text(`Customer Points: ${customer.customerPoints || 0}`, 10, 55);
    doc.text(`Payment Status: ${customer.paymentStatus || "Pending"}`, 10, 60);

    // Add purchased products table
    const tableColumnHeaders = [
      "#",
      "Product Name",
      "Code",
      "Category",
      "Brand",
      "Price",
      "Quantity",
      "Tax Rate",
      "Tax",
      "Total",
    ];

    const tableRows = customer?.purchasedProducts?.map((product, index) => {
      const tax = calculateTax(product.p_price, product.tax || 0);
      return [
        index + 1,
        product.p_name || "N/A",
        product.p_code || "N/A",
        product.p_category || "N/A",
        product.p_brand || "N/A",
        `${product.p_price || 0}`,
        product.quantity || 0,
        `${product.tax || 0}%`,
        `${(tax * (product.quantity || 0)).toFixed(2)}`,
        `${((tax * (product.quantity || 0)) + ((product.p_price || 0) * (product.quantity || 0))).toFixed(2)}`,
      ];
    }) || [];

    doc.autoTable({
      startY: 70,
      head: [tableColumnHeaders],
      body: tableRows,
    });

    // Save the PDF
    doc.save(`${customer.customerName || "customer"}-purchased-products.pdf`);
  };

  const handlePaymentConfirmation = async () => {
    try {
      // Fetch all products
      const productsResponse = await axios.get("http://localhost:5000/api/products/getProduct");
      console.log("Products API Response:", productsResponse);

      // Extract products array from response
      const allProducts = productsResponse.data?.products;
      if (!Array.isArray(allProducts)) {
        throw new Error("Failed to fetch products or invalid response structure.");
      }

      console.log("All Products:", allProducts);
      console.log("Purchased Products:", customer.purchasedProducts);

      // Process each purchased product
      for (const purchasedProduct of customer.purchasedProducts || []) {
        const matchingProduct = allProducts.find(
          (product) => product.p_code === purchasedProduct.p_code
        );

        if (matchingProduct) {
          console.log("Found Matching Product:", matchingProduct);

          const updatedQuantity = matchingProduct.p_quantity - purchasedProduct.quantity;

          if (updatedQuantity < 0) {
            toast.error(`Not enough stock for ${purchasedProduct.p_name}.`);
            return;
          }

          // Update product quantity in the database
          await axios.put(`http://localhost:5000/api/products/update/${matchingProduct._id}`, {
            p_quantity: updatedQuantity,
          });
        } else {
          toast.error(`Product with code ${purchasedProduct.p_code} not found.`);
          return;
        }
      }

      // Update payment status
      await axios.put(`http://localhost:5000/api/customerProduct/update/${customer._id}`, {
        paymentStatus: "paid",
      });

      toast.success("Payment completed and stock updated successfully!");
      setTimeout(() => {
        window.location.reload(); // Reload the page after 1 second
      }, 1000);
    } catch (error) {
      console.error("Error in payment confirmation:", error);
      toast.error("Failed to confirm payment. Please try again.");
    }
  };

  return (
    <div>
      <CommonTopNab />
      <div>
        <div>
          {/* Buttons */}
          <div className="mt-6 flex gap-4 justify-end mr-10">
            <button
              onClick={handlePrint}
              className="flex items-center border px-2 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 py-1"
            >
              Print <TiPrinter className="text-3xl " />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center border px-2 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 py-1 gap-2"
            >
              Download <FaRegFilePdf />
            </button>
          </div>
        </div>
        <div id="print-area" className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold mb-4">Sell Details</h2>
          </div>

          <div className="bg-gray-100 p-4 rounded shadow-md">
            <p>
              <strong>Name:</strong> {customer.customerName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {customer.customerEmail || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {customer.customerPhone || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {customer.customerAddress || "N/A"}
            </p>
            <p>
              <strong>Purchase Date:</strong> {formatDateTime(customer.purchaseDate || customer.createdAt)}
            </p>
            <p>
              <strong>Total Items:</strong> {customer.totalItems || 0}
            </p>
            <p>
              <strong>Grand Total:</strong> ${customer.grandTotal || 0}
            </p>
            <p>
              <strong>Customer Points:</strong> {customer.customerPoints || 0}
            </p>
            <div className="flex items-center gap-3"><strong>Payment Status:</strong>
              <div className="w-24 text-center">{customer.paymentStatus === "" ? <p className='text-yellow-500 px-2 py-1 rounded-lg'>Pending...</p> : <p className=' px-2 py-1 rounded-lg bg-green-500 text-white'>Paid</p>}</div>
            </div>
            {customer?.paymentStatus !== "paid" && (
              <button
                className="mt-2 border px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-400 transition-all duration-300"
                onClick={handlePaymentConfirmation}
              >
                Click to confirm payment
              </button>
            )}
          </div>

          <h3 className="text-xl font-bold mt-6">Purchased Products</h3>
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-200 w-full bg-white shadow-md rounded">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">#</th>
                  <th className="border border-gray-300 px-4 py-2">Product Name</th>
                  <th className="border border-gray-300 px-4 py-2">Product Code</th>
                  <th className="border border-gray-300 px-4 py-2">Category</th>
                  <th className="border border-gray-300 px-4 py-2">Brand</th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2">Tax Rate</th>
                  <th className="border border-gray-300 px-4 py-2">Tax</th>
                  <th className="border border-gray-300 px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {customer?.purchasedProducts?.length > 0 ? (
                  customer?.purchasedProducts?.map((product, index) => {
                    const tax = calculateTax(product.p_price, product.tax || 0); // Default to 0 if tax is undefined
                    return (
                      <tr key={index} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.p_name}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.p_code}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.p_category}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.p_brand}</td>
                        <td className="border border-gray-300 px-4 py-2">${product.p_price}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2">%{product.tax || 0}</td>
                        <td className="border border-gray-300 px-4 py-2">${(tax * product.quantity).toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">${(product.p_price * product.quantity + tax * product.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="border border-gray-300 px-4 py-2 text-center">
                      No purchased products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

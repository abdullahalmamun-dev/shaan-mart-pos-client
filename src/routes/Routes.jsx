import { createBrowserRouter } from "react-router";
import App from "../App";
import Home from "../Pages/Home/Home";
import NotFound from "../Shared/notFound/NotFound";
import Register from "../Pages/Authentication/Register";
import Login from "../Pages/Authentication/Login";
import AddProduct from "../Pages/AddProduct/AddProduct";
import AllProducts from "../Pages/AllProducts/AllProducts";
import MyProfile from "../Pages/MyProfile/MyProfile";
import Pos from "../Pages/Sale/Pos";
import AddCategory from "../Pages/AddCategory/AddCategory";
import CustomerList from "../Pages/CustomerList/CustomerList";
import SingleCustomerProductDetails from "../Pages/CustomerList/SingleCustomerProductDetails";
import People from "../Pages/CustomerList/People";

const routes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/dashboard',
                element:<Home/>,
            },
            {
                path: '/',
                element:<Home/>,
            },
            {
                path: '/addCategory',
                element:<AddCategory/>,
            },
            {
                path: '/addProduct',
                element:<AddProduct/>,
            },
            {
                path: '/allProducts',
                element:<AllProducts/>,
            },
            {
                path: '/myProfile',
                element:<MyProfile/>,
            },
            {
                path: '/customerList',
                element:<CustomerList/>,
            },
            {
                path: '/peopleList',
                element:<People/>,
            },
            {
                path: '/singleCustomerList/:id',
                element:<SingleCustomerProductDetails/>,
                loader:async ({params}) =>{
                    return fetch(`https://pos-backend-delta.vercel.app/api/customerProduct/single/${params?.id}`)
                }
            },
            {
                path: '*',
                element: <NotFound/>,
            },
        ],
    },
    {
        path: "/register",
        element: <Register />,
       },
    {
        path: "/login",
        element: <Login />,
       },
       {
        path: '/pos',
        element:<Pos/>,
    },
]);

export default routes;
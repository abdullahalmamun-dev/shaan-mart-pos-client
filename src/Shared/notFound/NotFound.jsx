/* eslint-disable react/no-unescaped-entities */
import { Link } from 'react-router';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="mb-4 text-6xl font-bold text-red-500">404</h1>
            <img className='w-40' src="https://cdn.pixabay.com/animation/2023/05/16/19/08/19-08-28-374_512.gif" alt="" />
            <p className="mb-8 text-xl ">Oops! Page not found</p>
            
            <Link to="/" className="text-lg text-red hover:underline">
                Go back to Home
            </Link>
        </div>
    );
};

export default NotFound;
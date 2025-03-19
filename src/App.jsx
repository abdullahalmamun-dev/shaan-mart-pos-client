

import { ToastContainer } from 'react-toastify'
import './App.css'
import MainLayout from './layout/MainLayout'
import { Toaster } from 'react-hot-toast'



function App() {


  return (
    <main>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <MainLayout />
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
    </main>
  )
}

export default App

import React, { useState } from "react";
import Footer from "../components/Footer.js";
import Header from "../components/Header.js";
import Sidebar from "../components/Sidebar.js";

// localStorage utility নেই, তাই সরিয়ে দিন বা সরাসরি localStorage ব্যবহার করুন

export default function AdminLayout({ children }) {
  const [isOpenSidebar, setIsOpenSidebar] = useState(true);
  const toggleSidebar = () => setIsOpenSidebar((v) => !v);
  return (
    <>
      <Sidebar isOpenSidebar={isOpenSidebar} onCloseSidebar={toggleSidebar} />
      <div className={`relative ${isOpenSidebar ? 'md:ml-56' : 'md:ml-0'} duration-150 bg-gray-100 min-h-screen flex flex-col`}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={isOpenSidebar} />
        <div className="mx-auto w-full">
          {children}
        </div>
        <Footer />
      </div>

    </>
  );
} 
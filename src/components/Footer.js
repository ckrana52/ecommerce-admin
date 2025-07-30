import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-primary-50 border-t border-gray-100 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Section - Developer Info */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-100">
            <span className="text-gray-600 text-sm font-medium">Developed by</span>
            <span className="text-gray-800 font-semibold">© 2025 Rana Ahmed</span>
          </div>

          {/* Right Section - Navigation Links */}
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/admin" 
              className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 px-4 py-2 rounded-xl border border-green-100 text-gray-700 hover:text-green-700 transition-all duration-300 hover:shadow-sm group text-sm font-medium"
            >
              <span>Admin</span>
            </a>
            
            <a 
              href="/about" 
              className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 px-4 py-2 rounded-xl border border-yellow-100 text-gray-700 hover:text-orange-700 transition-all duration-300 hover:shadow-sm group text-sm font-medium"
            >
              <span>About Us</span>
            </a>
            
            <a 
              href="/blog" 
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 px-4 py-2 rounded-xl border border-purple-100 text-gray-700 hover:text-purple-700 transition-all duration-300 hover:shadow-sm group text-sm font-medium"
            >
              <span>Blog</span>
            </a>
            
            <a 
              href="https://opensource.org/licenses/MIT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-1 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 px-4 py-2 rounded-xl border border-gray-100 text-gray-700 hover:text-gray-800 transition-all duration-300 hover:shadow-sm group text-sm font-medium"
            >
              <span>MIT License</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          </div>
        </div>

        {/* Bottom Section - Additional Info */}
        {/* Removed: Built with React & Tailwind CSS, Optimized for performance, All systems operational */}
      </div>
    </footer>
  );
}
import { useState, useRef } from 'react';
import { Menu, Bell, User, ChevronDown, LogOut, Plus, Barcode, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ toggleSidebar, sidebarOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef();
  const searchTimeout = useRef();
  const navigate = useNavigate();

  // Search handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(!!value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/orders/search?q=${encodeURIComponent(value)}`, {
          headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  // Prevent search box from being auto-focused or auto-filled by other actions
  // (No code needed unless you are programmatically focusing the input elsewhere)

  // Go to order details (if available)
  const handleResultClick = (order) => {
    setShowDropdown(false);
    setSearch("");
    setSearchResults([]);
    if (order.id) {
      navigate(`/orders?highlight=${order.id}`); // Or use your order details route
    }
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-3 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left: Sidebar toggle + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-200"
            title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-2 w-64 relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search By Order ID or Phone"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm placeholder-gray-400"
                onFocus={() => setShowDropdown(!!search)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" /></svg>
              </span>
            </div>
            {showDropdown && (
              <div className="absolute left-0 top-11 w-full bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-3 text-sm text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-gray-400">No results found</div>
                ) : (
                  searchResults.map(order => (
                    <button
                      key={order.id}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex flex-col border-b last:border-b-0"
                      onClick={() => handleResultClick(order)}
                    >
                      <span className="font-semibold text-blue-700">Order #{order.id}</span>
                      <span className="text-xs text-gray-500">{order.name} &bull; {order.phone}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right: Actions + Notification + Profile */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg font-medium text-white transition-all hidden md:flex">
            <Barcode className="w-4 h-4" />
            <span>Barcode</span>
          </button>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition-all hidden md:flex">
            <RefreshCw className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
          {/* Notification */}
          <button className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all hidden md:inline-flex">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">3</span>
          </button>
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full border border-gray-700 transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </span>
              <span className="font-semibold">Admin</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 font-medium">Welcome !</div>
                <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left">
                  <LogOut className="w-4 h-4 text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
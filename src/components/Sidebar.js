import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  MdDashboard, 
  MdShoppingCart, 
  MdPeople, 
  MdLocalShipping, 
  MdReceipt, 
  MdSettings, 
  MdStore, 
  MdLogout, 
  MdExpandMore, 
  MdExpandLess, 
  MdPendingActions, 
  MdCheckCircle, 
  MdReportProblem, 
  MdAccountBalance, 
  MdAssessment, 
  MdPerson,
  MdWeb,
  FaTachometerAlt,
  MdSms,
  MdCategory,
  MdBrandingWatermark,
  MdLocationOn,
  MdAttachMoney,
  MdReceiptLong
} from 'react-icons/md';

export default function Sidebar({ isOpenSidebar = true, onCloseSidebar }) {
  const [activeLink, setActiveLink] = useState(null);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  // Pending Invoiced count state
  const [pendingInvoiceCount, setPendingInvoiceCount] = useState(0);
  
  const fetchPendingInvoiceCount = () => {
    // Fetch pending invoice count from orders API instead
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    
    fetch('/api/orders', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const completedOrders = data.filter(order => order.status === 'Completed');
          setPendingInvoiceCount(completedOrders.length);
        } else {
          setPendingInvoiceCount(0);
        }
      })
      .catch(err => {
        console.error('Error fetching pending invoice count:', err);
        setPendingInvoiceCount(0);
      });
  };
  
  useEffect(() => {
    fetchPendingInvoiceCount();
    
    // Listen for invoice creation events
    const handleInvoiceCreated = () => {
      fetchPendingInvoiceCount();
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isOpenSidebar && window.innerWidth < 768) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpenSidebar]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Helper: Check if any submenu is active
  const isSubmenuActive = (children) => {
    return children?.some((sub) => location.pathname === sub.to);
  };

  // Helper: handle link click (close sidebar on mobile)
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const menuItems = [
    { to: '/', label: 'Dashboards', icon: <MdDashboard />, exact: true },
    {
      label: 'System Settings', icon: <MdWeb />, children: [
        { to: '/website/slider', label: 'Slider' },
        { to: '/website/review', label: 'Review' },
        { to: '/website/settings', label: 'Settings' },
        { to: '/website/sms', label: 'SMS' },
      ]
    },
    {
      label: 'Shop', icon: <MdStore />, children: [
        { to: '/shop/products', label: 'Products' },
        { to: '/shop/categories', label: 'Categories' }, // Changed route back as per user request
        { to: '/shop/brands', label: 'Brands' },
      ]
    },
    {
      label: 'Courier', icon: <MdLocalShipping />, children: [
        { to: '/courier/api', label: 'Courier API' },
        { to: '/courier/city-zone', label: 'City & Zone' },
      ]
    },
    { to: '/customers', label: 'Customers', icon: <MdPeople /> },
    { to: '/incomplete', label: 'Incomplete', icon: <MdPendingActions />, badge: 'New' },
    { to: '/orders', label: 'Orders', icon: <MdShoppingCart /> },
    { to: '/orders/status/Pending%20Invoiced', label: 'Invoice', icon: <MdReceipt />, badge: pendingInvoiceCount > 0 ? pendingInvoiceCount : undefined },
    { to: '/orders/status/Delivered', label: 'Delivered', icon: <MdCheckCircle /> },
    { to: '/complain', label: 'Complain', icon: <MdReportProblem /> },
    {
      label: 'Accounts', icon: <MdAccountBalance />, children: [
        { to: '/accounts/transactions', label: 'Transactions' },
        { to: '/accounts/expenses', label: 'Expenses' },
      ]
    },
    {
      label: 'Report', icon: <MdAssessment />, children: [
        { to: '/report/sales', label: 'Sales Report' },
        { to: '/report/orders', label: 'Order Report' },
      ]
    },
    {
      label: 'User', icon: <MdPerson />, children: [
        { to: '/user', label: 'User' },
        { to: '/user/roles', label: 'Roles' },
      ]
    },
    { to: '/logout', label: 'Logout', icon: <MdLogout /> },
  ];

  return (
    <>
      {/* Mobile overlay/backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-all duration-300 ${isOpenSidebar ? 'block' : 'hidden'}`}
        onClick={onCloseSidebar}
        aria-hidden="true"
      />
      <aside
        className={`
          bg-white border-r border-gray-100 text-gray-800 min-h-screen p-4 shadow-sm
          fixed h-screen overflow-y-auto z-50
          w-full md:w-56
          left-0 top-0
          ${isOpenSidebar ? 'block' : 'hidden'}
          transition-all duration-300
        `}
      >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-bold text-xl mb-6 text-gray-900 border-b border-gray-100 pb-3"
      >
        Admin Panel
      </motion.div>
      <nav className="space-y-1">
        <AnimatePresence>
          {menuItems.map((item, index) => (
            <motion.div
                key={item.label || item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.07, duration: 0.25 }}
              className="relative"
            >
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900 focus:outline-none ${
                      (openMenus[item.label] || isSubmenuActive(item.children)) ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
                    }`}
                  >
                    <span className="mr-3 text-base flex-shrink-0 text-gray-400 group-hover:text-gray-600">{item.icon}</span>
                    <span className="font-medium truncate min-w-0 flex-1 text-left">{item.label}</span>
                    <span className="ml-2">{openMenus[item.label] ? <MdExpandLess /> : <MdExpandMore />}</span>
                  </button>
                ) : (
              <Link
                to={item.to}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                      location.pathname === item.to
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                }`}
                    onClick={handleLinkClick}
              >
                <span className={`mr-3 text-base flex-shrink-0 transition-colors duration-200 ${
                      location.pathname === item.to ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium truncate min-w-0">
                  {item.label}
                </span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-400 text-white">{item.badge}</span>
                    )}
                    {location.pathname === item.to && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
                )}
                {/* Submenu */}
                {item.children && openMenus[item.label] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-7 mt-1 space-y-1"
                  >
                    {item.children.length > 0 ? (
                      item.children.map((sub, subIdx) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                            location.pathname === sub.to
                              ? 'bg-blue-100 text-blue-700 font-semibold'
                              : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          onClick={handleLinkClick}
                        >
                          {sub.label}
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400 italic bg-gray-50 rounded-md border border-dashed border-gray-200 flex items-center gap-2">
                        <span className="material-icons text-base text-gray-300">info</span>
                        No page found
                      </div>
                    )}
                  </motion.div>
                )}
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>
    </aside>
    </>
  );
}
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Store, ShoppingBag, Clock, Star, Bell } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [hourlyOrders, setHourlyOrders] = useState([]);
  const [todayReport, setTodayReport] = useState(null);
  const [productOfMonth, setProductOfMonth] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulating API calls with mock data for demo
    setTimeout(() => {
      setSummary({
        totalRevenue: 125000,
        totalOrders: 847,
        totalStore: 12,
        totalUsers: 3254
      });
      setHourlyOrders([20, 35, 28, 42, 55, 38, 45, 62, 48, 35, 28, 52, 67, 45, 38, 55, 72, 58, 42, 35, 28, 25, 18, 15]);
      setTodayReport({
        todayOrder: 12,
        websiteOrder: 8,
        manualOrder: 4,
        processing: 2,
        pendingPayment: 1,
        onHold: 1,
        scheduleDelivery: 0,
        cancelled: 0,
        completed: 6,
        pendingInvoiced: 0,
        invoiced: 2,
        invoiceChecked: 2,
        stockOut: 0,
        delivered: 5,
        courierHold: 0,
        courierReturn: 0,
        paid: 7,
        return: 0,
        damaged: 0
      });
      setProductOfMonth([
        { name: 'Premium Coffee', count: 234 },
        { name: 'Ice Cream Cake', count: 189 },
        { name: 'Chicken Burger', count: 156 },
        { name: 'Strawberry Smoothie', count: 143 },
        { name: 'Kimchi Stew', count: 128 }
      ]);
      setRecentUpdates([
        { text: 'New store opened in downtown area' },
        { text: 'Summer menu has been launched' },
        { text: 'Delivery time has been reduced' },
        { text: 'Customer satisfaction increased to 4.8 stars' },
        { text: 'New discount event has started' }
      ]);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, bgColor, textColor }) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Have a great day ahead! 📊</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-medium shadow-sm">
              Live Updates
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={<span className="font-bold"><span className="text-xl mr-1 font-extrabold">৳</span>{summary?.totalRevenue?.toLocaleString() ?? 0}</span>}
            icon={TrendingUp}
            color="bg-gradient-to-r from-green-400 to-emerald-500"
            bgColor="bg-white"
            textColor="text-white"
          />
          <StatCard
            title="All Orders"
            value={summary?.totalOrders ?? 0}
            icon={ShoppingBag}
            color="bg-gradient-to-r from-blue-400 to-cyan-500"
            bgColor="bg-white"
            textColor="text-white"
          />
          <StatCard
            title="Total Store"
            value={summary?.totalStore ?? 0}
            icon={Store}
            color="bg-gradient-to-r from-purple-400 to-pink-500"
            bgColor="bg-white"
            textColor="text-white"
          />
          <StatCard
            title="Total Users"
            value={summary?.totalUsers?.toLocaleString() ?? 0}
            icon={Users}
            color="bg-gradient-to-r from-orange-400 to-red-500"
            bgColor="bg-white"
            textColor="text-white"
          />
        </div>

        {/* Hourly Orders Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8 mb-8 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Hourly Orders Report (Last 24h)
            </h2>
            <div className="bg-blue-50 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-blue-600">Live</span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-1 px-2">
            {hourlyOrders.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg shadow-sm hover:from-blue-500 hover:to-blue-400 transition-colors duration-300"
                  style={{ height: `${Math.max(val * 2, 8)}px` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-4 px-2">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        {/* Today Report & Product of Month */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Today Report</h2>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {todayReport && Object.entries(todayReport).map(([k, v]) => {
                const labels = {
                  todayOrder: 'Today Order',
                  websiteOrder: 'Website Order',
                  manualOrder: 'Manual Order',
                  processing: 'Processing',
                  pendingPayment: 'Pending Payment',
                  onHold: 'On Hold',
                  scheduleDelivery: 'Schedule Delivery',
                  cancelled: 'Cancelled',
                  completed: 'Completed',
                  pendingInvoiced: 'Pending Invoiced',
                  invoiced: 'Invoiced',
                  invoiceChecked: 'Invoice Checked',
                  stockOut: 'Stock Out',
                  delivered: 'Delivered',
                  courierHold: 'Courier Hold',
                  courierReturn: 'Courier Return',
                  paid: 'Paid',
                  return: 'Return',
                  damaged: 'Damaged'
                };
                
                // Color coding for different statuses
                const getStatusColor = (key) => {
                  if (['completed', 'delivered', 'paid', 'invoiceChecked'].includes(key)) {
                    return 'from-green-50 to-emerald-50 border-green-100';
                  } else if (['processing', 'pendingPayment', 'onHold', 'pendingInvoiced'].includes(key)) {
                    return 'from-yellow-50 to-orange-50 border-yellow-100';
                  } else if (['cancelled', 'stockOut', 'courierReturn', 'damaged'].includes(key)) {
                    return 'from-red-50 to-pink-50 border-red-100';
                  } else if (['todayOrder', 'websiteOrder', 'manualOrder'].includes(key)) {
                    return 'from-blue-50 to-indigo-50 border-blue-100';
                  } else {
                    return 'from-purple-50 to-pink-50 border-purple-100';
                  }
                };

                return (
                  <div key={k} className={`bg-gradient-to-r ${getStatusColor(k)} p-3 rounded-xl border hover:shadow-sm transition-all duration-300`}>
                    <p className="text-xs font-medium text-gray-600 mb-1">{labels[k] || k}</p>
                    <p className="text-lg font-bold text-gray-800">{v}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Product Of The Month
            </h2>
            <div className="space-y-4">
              {productOfMonth.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                      {i + 1}
                    </div>
                    <span className="font-medium text-gray-800">{p.name}</span>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-lg font-bold text-purple-600">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-md transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Updates</h2>
          <div className="space-y-3">
            {recentUpdates.map((u, i) => (
              <div key={i} className="flex items-start p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-sm transition-all duration-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 font-medium">{u.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

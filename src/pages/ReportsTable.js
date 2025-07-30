import { useEffect, useState } from 'react';

export default function ReportsTable() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/reports/summary', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">Total Sales</div>
          <div className="text-2xl">৳{report?.totalSales ?? 0}</div>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">Total Orders</div>
          <div className="text-2xl">{report?.totalOrders ?? 0}</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">Total Customers</div>
          <div className="text-2xl">{report?.totalCustomers ?? 0}</div>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">Total Products</div>
          <div className="text-2xl">{report?.totalProducts ?? 0}</div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold mb-2">Sales Chart (Last 30 Days)</h2>
        <div className="h-40 flex items-end gap-1">
          {report?.salesChart?.map((val, i) => (
            <div key={i} className="flex-1 bg-blue-400 rounded" style={{ height: `${val}px` }}></div>
          ))}
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span>Day 30</span>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold mb-2">Export Reports</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => window.print()}>Print Report</button>
        {/* Add CSV/Excel export here if needed */}
      </div>
    </div>
  );
} 
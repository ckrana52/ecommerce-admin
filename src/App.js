import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { OrderProvider } from './contexts/OrderContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CategoryTable from './pages/CategoryTable';

import ProductTable from './pages/ProductTable';
import Order from './pages/Order';
import CustomerTable from './pages/CustomerTable';
import ReviewTable from './pages/ReviewTable';
import SliderTable from './pages/SliderTable';
import ReportsTable from './pages/ReportsTable';
import SettingsTable from './pages/SettingsTable';
import CourierTable from './pages/CourierTable';
import SMSTable from './pages/SMSTable';
import AdminLayout from './layouts/AdminLayout';
import BlankLayout from './layouts/BlankLayout';
import ProductEditPage from './pages/ProductEditPage';
import Brands from './pages/Brands';
import CourierAPI from './pages/CourierAPI';
import CityZone from './pages/CityZone';
import SettingsIndex from './pages/settings';
import User from './pages/User';
import IncompleteOrders from './pages/IncompleteOrders';


function NotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Site under construction. Please check back soon.</h2>
      <div className="text-gray-600">If you are the admin, please login to the admin panel.</div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<BlankLayout><Login /></BlankLayout>} />
          <Route path="/" element={<PrivateRoute><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>} />
          <Route path="/shop/categories" element={<PrivateRoute><AdminLayout><CategoryTable /></AdminLayout></PrivateRoute>} />
          <Route path="/shop/products" element={<PrivateRoute><AdminLayout><ProductTable /></AdminLayout></PrivateRoute>} />
          <Route path="/shop/brands" element={<PrivateRoute><AdminLayout><Brands/></AdminLayout></PrivateRoute>} />
          <Route path="/products/add" element={<PrivateRoute><AdminLayout><ProductEditPage /></AdminLayout></PrivateRoute>} />
          <Route path="/products/edit/:id" element={<PrivateRoute><AdminLayout><ProductEditPage /></AdminLayout></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><AdminLayout><Order /></AdminLayout></PrivateRoute>} />
          <Route path="/orders/status/:status" element={<PrivateRoute><AdminLayout><Order /></AdminLayout></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><AdminLayout><CustomerTable /></AdminLayout></PrivateRoute>} />
          <Route path="/reviews" element={<PrivateRoute><AdminLayout><ReviewTable /></AdminLayout></PrivateRoute>} />
          <Route path="/website/review" element={<PrivateRoute><AdminLayout><ReviewTable /></AdminLayout></PrivateRoute>} />
          <Route path="/website/slider" element={<PrivateRoute><AdminLayout><SliderTable /></AdminLayout></PrivateRoute>} /> 
          <Route path="/reports" element={<PrivateRoute><AdminLayout><ReportsTable /></AdminLayout></PrivateRoute>} />
          <Route path="/website/settings" element={<PrivateRoute><AdminLayout><SettingsIndex /></AdminLayout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><AdminLayout><SettingsIndex /></AdminLayout></PrivateRoute>} />
          <Route path="/couriers" element={<PrivateRoute><AdminLayout><CourierTable /></AdminLayout></PrivateRoute>} />
          <Route path="/website/sms" element={<PrivateRoute><AdminLayout><SMSTable /></AdminLayout></PrivateRoute>} />
          <Route path="/courier/api" element={<PrivateRoute><AdminLayout><CourierAPI /></AdminLayout></PrivateRoute>} />
          <Route path="/courier/city-zone" element={<PrivateRoute><AdminLayout><CityZone /></AdminLayout></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><AdminLayout><User /></AdminLayout></PrivateRoute>} />
          <Route path="/incomplete" element={<PrivateRoute><AdminLayout><IncompleteOrders /></AdminLayout></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </OrderProvider>
  );
}

export default App;

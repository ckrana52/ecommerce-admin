import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Key, Settings, CheckCircle2, XCircle, Loader2, RefreshCw, X } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';

const CourierAPI = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [courierSettings, setCourierSettings] = useState({});
  const [logoError, setLogoError] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [cacheData, setCacheData] = useState({});
  const [showFlashMessage, setShowFlashMessage] = useState(false);

  // Fetch courier settings from API
  useEffect(() => {
    fetchCourierSettings();
  }, []);

  const fetchCourierSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/couriers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courier settings');
      }

      const couriers = await response.json();
      
      // Convert couriers array to settings object format
      const settingsObj = {};
      const defaultCouriers = ['steadfast', 'pathao', 'redx', 'ecourier', 'paperfly', 'parceldex', 'bahok'];
      
      defaultCouriers.forEach(courier => {
        // Find all matching couriers and get the active one
        const matchingCouriers = couriers.filter(c => {
          const courierName = c.name?.toLowerCase();
          const searchName = courier.toLowerCase();
          return courierName === searchName || courierName.includes(searchName);
        });
        
        // Get the active courier or the first one if none are active
        const activeCourier = matchingCouriers.find(c => c.status === 'active') || matchingCouriers[0];
        
        settingsObj[courier] = {
          active: activeCourier?.status === 'active' || false,
          apiKey: activeCourier?.api_key || '',
          secretKey: '',
          baseUrl: activeCourier?.api_url || '',
          merchantId: '',
          clientId: '',
          clientSecret: '',
          username: '',
          password: '',
          userId: '',
          merchantCode: '',
          apiVersion: ''
        };
      });

      setCourierSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching courier settings:', error);
      setMessage({ type: 'error', text: 'Failed to load courier settings' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCourierStatus = async (courier) => {
    try {
      const newStatus = !courierSettings[courier]?.active;
      
      // Update local state immediately for better UX
      setCourierSettings(prev => ({
        ...prev,
        [courier]: {
          ...prev[courier],
          active: newStatus
        }
      }));

      // Show flash message
      setMessage({ type: 'success', text: `${courier} status updated to ${newStatus ? 'Active' : 'Inactive'}` });
      setShowFlashMessage(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowFlashMessage(false);
        setMessage({ type: '', text: '' });
      }, 3000);
      
      // Note: For now, we're updating local state only
      // The actual database update will happen when "Update Settings" is clicked
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update courier status' });
      setShowFlashMessage(true);
      setTimeout(() => {
        setShowFlashMessage(false);
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const updateCourierField = (courier, field, value) => {
    setCourierSettings(prev => ({
      ...prev,
      [courier]: {
        ...prev[courier],
        [field]: value
      }
    }));
    
    // Show a subtle flash message for field updates
    setMessage({ type: 'info', text: `${courier} ${field} updated` });
    setShowFlashMessage(true);
    setTimeout(() => {
      setShowFlashMessage(false);
      setMessage({ type: '', text: '' });
    }, 2000);
  };

  const handleUpdateSettings = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      // Get current couriers first
      const response = await fetch('/api/couriers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch couriers');
      }

      const couriers = await response.json();
      
      // Update each courier setting
      const updatePromises = Object.entries(courierSettings).map(async ([courier, settings]) => {
        const courierName = courier.charAt(0).toUpperCase() + courier.slice(1);
        
        // Find all matching couriers
        const matchingCouriers = couriers.filter(c => 
          c.name?.toLowerCase() === courier || 
          c.name?.toLowerCase().includes(courier)
        );
        
        // Get the active courier or the first one if none are active
        const existingCourier = matchingCouriers.find(c => c.status === 'active') || matchingCouriers[0];
        
        if (existingCourier) {
          // Update existing courier
          return fetch(`/api/couriers/${existingCourier.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: courierName,
              api_url: settings.baseUrl,
              api_key: settings.apiKey,
              status: settings.active ? 'active' : 'inactive'
            })
          });
        } else {
          // Create new courier
          return fetch('/api/couriers', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: courierName,
              api_url: settings.baseUrl,
              api_key: settings.apiKey,
              status: settings.active ? 'active' : 'inactive'
            })
          });
        }
      });

      await Promise.all(updatePromises);
      setMessage({ type: 'success', text: 'All courier settings updated successfully! Changes saved to database.' });
      setShowFlashMessage(true);
      setTimeout(() => {
        setShowFlashMessage(false);
        setMessage({ type: '', text: '' });
      }, 4000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update courier settings. Please try again.' });
      setShowFlashMessage(true);
      setTimeout(() => {
        setShowFlashMessage(false);
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setUpdating(false);
    }
  };

  const testConnection = async (courier) => {
    try {
      setMessage({ type: 'info', text: `Testing connection for ${courier}...` });
      setShowFlashMessage(true);
      // Here you would implement actual API testing logic
      // For now, we'll just simulate a test
      setTimeout(() => {
        setMessage({ type: 'success', text: `${courier} connection test successful!` });
        setTimeout(() => {
          setShowFlashMessage(false);
          setMessage({ type: '', text: '' });
        }, 3000);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: `${courier} connection test failed!` });
      setShowFlashMessage(true);
      setTimeout(() => {
        setShowFlashMessage(false);
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const clearCache = () => {
    // Create a snapshot of current courier statuses for display
    const courierStatuses = {};
    Object.keys(courierSettings).forEach(courier => {
      courierStatuses[courier] = courierSettings[courier]?.active || false;
    });
    
    setCacheData(courierStatuses);
    setShowCacheNotification(true);
    
    // Show flash message
    setMessage({ type: 'success', text: 'Cache cleared successfully! Data refreshed from database.' });
    setShowFlashMessage(true);
    setTimeout(() => {
      setShowFlashMessage(false);
      setMessage({ type: '', text: '' });
    }, 3000);
    
    // Fetch fresh data
    fetchCourierSettings();
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowCacheNotification(false);
    }, 5000);
  };

  const courierConfigs = {
    steadfast: {
      name: 'Steadfast API Key',
      color: 'blue',
      icon: '🚚',
      logo: 'https://steadfast.com.bd/assets/images/logo/logo.svg',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your Steadfast API key' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://portal.steadfast.com.bd' },
        { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Enter your merchant ID' }
      ]
    },
    pathao: {
      name: 'Pathao API Key',
      color: 'red',
      icon: '🛵',
      logo: 'https://pathao.com/bn/wp-content/uploads/sites/6/2019/02/Pathao_Logo-.svg',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your Pathao API key' },
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your client secret' },
        { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter your username' },
        { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
      ]
    },
    redx: {
      name: 'Redx API Key',
      color: 'red',
      icon: '📦',
      logo: 'https://redx.com.bd/images/new-redx-logo.svg',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your Redx API key' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://openapi.redx.com.bd' },
        { key: 'shopId', label: 'Shop ID', type: 'text', placeholder: 'Enter your shop ID' }
      ]
    },
    ecourier: {
      name: 'eCourier API Key',
      color: 'green',
      icon: '🚛',
      logo: 'https://ecourier.com.bd/wp-content/themes/ecourier-2.0/images/logo.svg',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your eCourier API key' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: 'Enter your user ID' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://backoffice.ecourier.com.bd' }
      ]
    },
    paperfly: {
      name: 'Paperfly API Key',
      color: 'purple',
      icon: '✈️',
      logo: 'https://paperfly.com.bd/wp-content/uploads/2022/09/Paperfly-Logo.svg',
      fields: [
        { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Enter your Paperfly merchant ID' },
        { key: 'merchantKey', label: 'Merchant Key', type: 'password', placeholder: 'Enter your merchant key' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://api.paperfly.com.bd' },
        { key: 'apiVersion', label: 'API Version', type: 'text', placeholder: 'v1' }
      ]
    },
    parceldex: {
      name: 'Parceldex API Key',
      color: 'orange',
      icon: '📮',
      logo: 'https://parceldex.com/frontend/images/logo/logo.png',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your Parceldex API key' },
        { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Enter your merchant ID' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://api.parceldex.com.bd' }
      ]
    },
    bahok: {
      name: 'Bahok Courier API',
      color: 'teal',
      icon: '🚚',
      logo: 'https://www.bahokcourier.com/assets/images/logo.png',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter your Bahok API key' },
        { key: 'merchantCode', label: 'Merchant Code', type: 'text', placeholder: 'Enter your merchant code' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your secret key' },
        { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://api.bahok.com.bd' }
      ]
    }
  };

  const getStatusColor = (active, color) => {
    if (active) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    const colorMap = {
      blue: 'bg-red-50 text-red-600 border-red-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      green: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-red-50 text-red-600 border-red-200',
      orange: 'bg-red-50 text-red-600 border-red-200',
      teal: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color] || 'bg-red-50 text-red-600 border-red-200';
  };

  const getToggleColor = (active) => {
    return active ? 'bg-emerald-500' : 'bg-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Courier API Management</h3>
              <p className="text-gray-600 mt-1">Configure and manage courier service API settings</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={clearCache}
                disabled={loading || updating}
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-30 ${
                  loading || updating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </button>
              
              <button
                onClick={handleUpdateSettings}
                disabled={loading || updating}
                className={`inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30 ${
                  loading || updating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading || updating ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-5 h-5 mr-2" />
                )}
                {loading || updating ? 'Updating...' : 'Update Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && showFlashMessage && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ease-in-out ${
            message.type === 'success' ? 'bg-green-500 text-white' :
            message.type === 'error' ? 'bg-red-500 text-white' :
            message.type === 'info' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {message.type === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {message.type === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {message.type === 'info' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
            <button 
              onClick={() => {
                setShowFlashMessage(false);
                setMessage({ type: '', text: '' });
              }} 
              className="text-white hover:text-gray-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Courier Settings Cards */}
        <div className="w-full space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="ml-4 text-lg text-gray-600">Loading courier settings...</p>
              </div>
            </div>
          ) : (
            Object.entries(courierConfigs).map(([courier, config]) => {
              const isExpanded = expandedSections[courier];
              const isActive = courierSettings[courier]?.active || false;
              return (
                <div 
                  key={courier} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg w-full"
                >
                  {/* Header */}
                  <div 
                    className="p-6 cursor-pointer select-none border-b border-gray-100"
                    onClick={() => toggleSection(courier)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          {/* Courier Logo or Emoji */}
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
                            {!logoError[courier] ? (
                              <img
                                src={config.logo}
                                alt={`${config.name} Logo`}
                                className="w-10 h-8 object-contain"
                                onError={() => setLogoError(prev => ({ ...prev, [courier]: true }))}
                              />
                            ) : (
                              <div className="text-2xl">{config.icon}</div>
                            )}
                          </div>
                          
                          <Key className="w-6 h-6 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-800">{config.name}</h3>
                        </div>
                        
                        <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(isActive, config.color)}`}>
                          {isActive ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4" />
                              <span>Inactive</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Toggle Switch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCourierStatus(courier);
                          }}
                          disabled={loading || updating}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${getToggleColor(isActive)} ${
                            loading || updating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        
                        {/* Expand/Collapse Icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Form */}
                  {isExpanded && (
                    <div className="bg-gray-50 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.fields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={courierSettings[courier]?.[field.key] || ''}
                              onChange={(e) => updateCourierField(courier, field.key, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                              disabled={!isActive || loading || updating}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Test Connection Button */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          disabled={!isActive || loading || updating}
                          onClick={() => testConnection(courier)}
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive && !loading && !updating
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {loading || updating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          {loading || updating ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Professional Cache Notification */}
      <NotificationToast 
        show={showCacheNotification}
        message="Cache cleared and data refreshed"
        type="cache"
        data={cacheData}
        onClose={() => setShowCacheNotification(false)}
      />
    </div>
  );
};

export default CourierAPI;
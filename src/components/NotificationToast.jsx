import React from 'react';
import { CheckCircle, XCircle, RefreshCw, X, Database, Clock } from 'lucide-react';

export default function NotificationToast({ show, message, type = 'success', data = null, onClose }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'cache':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'cache':
        return 'bg-blue-600';
      default:
        return 'bg-green-600';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'cache':
        return 'border-blue-200';
      default:
        return 'border-green-200';
    }
  };

  if (type === 'cache' && data) {
    return (
      <div className={`
        fixed top-6 right-6 z-50 max-w-md w-full
        transition-all duration-700 ease-out
        transform ${show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'}
      `}>
        {/* Main Notification */}
        <div className={`
          ${getBgColor()} text-white px-6 py-4 rounded-xl shadow-2xl 
          border-2 ${getBorderColor()} backdrop-blur-sm
          flex items-center space-x-3 mb-3
          animate-pulse
        `}>
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{message}</div>
            <div className="text-sm opacity-90 mt-1">Cache has been successfully cleared</div>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Data Box */}
        <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden transform transition-all duration-300 hover:scale-105">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-800">Refreshed Data</span>
              <div className="flex items-center space-x-1 ml-auto">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(data).map(([key, value], index) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value}
                    </span>
                    {typeof value === 'boolean' && (
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total couriers: {Object.keys(data).length}</span>
                <span>Status updated successfully</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default notification for other types
  return (
    <div className={`
      fixed top-6 right-6 z-50
      ${getBgColor()} text-white px-6 py-3 rounded-xl shadow-lg 
      flex items-center space-x-3
      transition-all duration-300
      ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
    `}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <span className="font-semibold">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 
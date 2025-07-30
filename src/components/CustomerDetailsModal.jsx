import React from 'react';
import { X, User, Mail, Phone, MapPin, Hash, Calendar, Edit, Trash2 } from 'lucide-react';

export default function CustomerDetailsModal({ customer, isOpen, onClose, onEdit, onDelete }) {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Customer Details</h2>
                <p className="text-blue-100 text-xs">ID: {customer.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Customer Info */}
          <div className="space-y-2">
            {/* Name */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Name</p>
                <p className="text-sm font-semibold text-gray-900">{customer.name || 'N/A'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.email ? (
                    <a 
                      href={`mailto:${customer.email}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.phone ? (
                    <a 
                      href={`tel:${customer.phone}`} 
                      className="text-green-600 hover:text-green-800 hover:underline"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <MapPin className="w-3 h-3 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Address</p>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                  {customer.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* IP Address */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <Hash className="w-3 h-3 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">IP Address</p>
                <p className="text-sm font-semibold text-gray-900 font-mono">
                  {customer.ip_address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Calendar className="w-3 h-3 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Created</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(customer.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-blue-600 font-medium">Orders</div>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">৳0</div>
              <div className="text-xs text-green-600 font-medium">Total Spent</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                onEdit(customer);
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-colors"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this customer?')) {
                  onDelete(customer.id);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
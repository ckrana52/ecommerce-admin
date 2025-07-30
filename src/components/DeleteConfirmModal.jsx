import React from 'react';

export default function DeleteConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 modal">
      <div className="modal-content p-8 rounded-2xl shadow-2xl max-w-md w-full transform translate-y-0 opacity-100 transition-all duration-200 bg-white/90 backdrop-blur">
        <div className="flex items-center space-x-3 mb-4">
          <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
          <h2 className="text-2xl font-semibold text-gray-900">Confirm Deletion</h2>
        </div>
        <p className="text-gray-700 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            className="btn bg-gray-200 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-300 shadow-md flex items-center space-x-2"
            onClick={onCancel}
          >
            <i className="fas fa-times"></i>
            <span>Cancel</span>
          </button>
          <button
            className="btn bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 shadow-md flex items-center space-x-2"
            onClick={onConfirm}
          >
            <i className="fas fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
} 
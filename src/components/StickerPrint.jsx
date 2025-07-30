import React, { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';
import BarcodeGenerator from './BarcodeGenerator';

const StickerPrint = ({ selectedOrders, orders, onClose, invoiceString }) => {
  const [isLoading, setIsLoading] = useState(true);

  const getSelectedOrdersData = () => {
    return orders.filter(order => selectedOrders.includes(order.id));
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const selectedOrdersData = getSelectedOrdersData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header - Hidden in print */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Sticker Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Stickers
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="print:block">
            {/* Sticker Grid - 2 stickers per row */}
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              {selectedOrdersData.map((order) => (
                <div
                  key={order.id}
                  className="border-2 border-dashed border-gray-800 p-4 print:p-3 bg-white print:break-inside-avoid"
                  style={{ minHeight: '280px', pageBreakInside: 'avoid' }}
                >
                  {/* Order ID with Barcode */}
                  <div className="text-center mb-3">
                    <div className="font-bold text-lg print:text-base mb-2">
                      {invoiceString ? `${invoiceString}${order.id}` : `#${order.id}`}
                    </div>
                    <div className="mb-2">
                      <BarcodeGenerator 
                        text={order.id} 
                        width={180} 
                        height={50} 
                        showText={true}
                      />
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3 print:mb-2">
                    <div className="font-bold text-sm print:text-xs mb-1 text-gray-800">TO:</div>
                    <div className="font-semibold text-base print:text-sm text-black">{order.name}</div>
                    <div className="text-sm print:text-xs text-gray-700 font-medium">{order.phone}</div>
                  </div>

                  {/* Phone Barcode */}
                  <div className="text-center mb-3 print:mb-2">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Phone:</div>
                    <BarcodeGenerator 
                      text={order.phone.replace(/\D/g, '')} 
                      width={160} 
                      height={40} 
                      showText={true}
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-3 print:mb-2">
                    <div className="font-bold text-xs mb-1 text-gray-800">ADDRESS:</div>
                    <div className="text-xs print:text-[10px] break-words text-black leading-tight">
                      {order.address || 'No address provided'}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="border-t-2 border-gray-400 pt-2 print:pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-gray-800">TOTAL:</span>
                      <span className="font-bold text-sm text-black">৳{Math.floor(order.total)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-700">Items:</span>
                      <span className="text-xs text-black font-medium">
                        {order.products ? order.products.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-700">Status:</span>
                      <span className="text-xs font-medium text-black">{order.status}</span>
                    </div>
                    {order.courier && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-700">Courier:</span>
                        <span className="text-xs font-medium capitalize text-black">{order.courier}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-center mt-2 print:mt-1">
                    <div className="text-[10px] text-gray-600 font-medium">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print\\:text-xs {
            font-size: 0.75rem !important;
          }

          .print\\:text-sm {
            font-size: 0.875rem !important;
          }

          .print\\:text-base {
            font-size: 1rem !important;
          }

          .print\\:text-\\[10px\\] {
            font-size: 10px !important;
          }

          .print\\:p-3 {
            padding: 0.75rem !important;
          }

          .print\\:mb-1 {
            margin-bottom: 0.25rem !important;
          }

          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }

          .print\\:mt-1 {
            margin-top: 0.25rem !important;
          }

          .print\\:pt-1 {
            padding-top: 0.25rem !important;
          }

          .print\\:gap-2 {
            gap: 0.5rem !important;
          }

          /* Ensure black text for print */
          .text-black {
            color: #000000 !important;
          }

          .text-gray-800 {
            color: #1f2937 !important;
          }

          .text-gray-700 {
            color: #374151 !important;
          }

          .text-gray-600 {
            color: #4b5563 !important;
          }

          /* Ensure borders are visible in print */
          .border-gray-800 {
            border-color: #1f2937 !important;
          }

          .border-gray-400 {
            border-color: #9ca3af !important;
          }

          /* Optimize for black and white printing */
          .border-dashed {
            border-style: dashed !important;
          }

          .border-2 {
            border-width: 2px !important;
          }

          .border-t-2 {
            border-top-width: 2px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickerPrint;
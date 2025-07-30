import React, { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';

const InvoicePrint = ({ selectedOrders, orders, onClose, invoiceString }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    address: 'Company Address Line 1, Line 2, City, Country',
    phone: '+880 1234-567890',
    email: 'info@company.com',
    website: 'www.company.com'
  });

  // Enhanced barcode generator with better pattern support
  const generateBarcode = (text) => {
    const patterns = {
      '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
      '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
      '8': '0110111', '9': '0001011'
    };
    
    let barcodePattern = '101'; // Start pattern
    
    // Convert text to string and process each character
    const textStr = text.toString();
    for (let char of textStr) {
      if (patterns[char]) {
        barcodePattern += patterns[char];
      } else {
        // For non-numeric characters, use a default pattern
        barcodePattern += '0001011';
      }
    }
    
    barcodePattern += '101'; // End pattern
    return barcodePattern;
  };

  const renderBarcode = (text, width = 200, height = 60) => {
    const pattern = generateBarcode(text);
    const barWidth = Math.max(width / pattern.length, 1); // Ensure minimum bar width
    
    return (
      <div className="barcode-container flex flex-col items-center">
        <svg width={width} height={height} className="barcode-svg bg-white border border-gray-300">
          {pattern.split('').map((bit, index) => (
            <rect
              key={index}
              x={index * barWidth}
              y={0}
              width={barWidth}
              height={height - 20}
              fill={bit === '1' ? '#000000' : '#ffffff'}
              stroke="none"
            />
          ))}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#000000"
            fontFamily="monospace, Arial"
            fontWeight="bold"
          >
            {text}
          </text>
        </svg>
      </div>
    );
  };

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header - Hidden in print */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Invoice Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
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
          <div className="print:block max-w-4xl mx-auto">
            {selectedOrdersData.map((order, orderIndex) => (
              <div
                key={order.id}
                className={`bg-white print:break-after-page ${orderIndex > 0 ? 'mt-8 print:mt-0' : ''}`}
                style={{ pageBreakAfter: orderIndex < selectedOrdersData.length - 1 ? 'always' : 'auto' }}
              >
                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
                      <div className="text-sm text-gray-600">
                        <div className="font-semibold text-lg text-black">{companyInfo.name}</div>
                        <div className="text-gray-700">{companyInfo.address}</div>
                        <div className="text-gray-700">Phone: {companyInfo.phone}</div>
                        <div className="text-gray-700">Email: {companyInfo.email}</div>
                        {companyInfo.website && (
                          <div className="text-gray-700">Web: {companyInfo.website}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-2 text-black">
                        {invoiceString ? `${invoiceString}${order.id}` : `#${order.id}`}
                      </div>
                      <div className="mb-4">
                        {renderBarcode(order.id, 200, 60)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="text-black"><strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : ''}</div>
                        <div className="text-black"><strong>Status:</strong> <span className="font-semibold">{order.status}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">BILL TO:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                      <div className="font-semibold text-lg mb-2 text-black">{order.name}</div>
                      <div className="text-sm text-gray-700 mb-2 font-medium">{order.phone}</div>
                      <div className="mb-3">
                        {renderBarcode(order.phone.replace(/\D/g, ''), 180, 50)}
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong className="text-black">Address:</strong><br />
                        <span className="text-black">{order.address || 'No address provided'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">ORDER DETAILS:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-700"><strong>Order ID:</strong></div>
                        <div className="text-black font-medium">{invoiceString ? `${invoiceString}${order.id}` : `#${order.id}`}</div>
                        
                        <div className="text-gray-700"><strong>Total Items:</strong></div>
                        <div className="text-black font-medium">{order.products ? order.products.length : 0}</div>
                        
                        <div className="text-gray-700"><strong>Order Status:</strong></div>
                        <div className="font-semibold text-black">{order.status}</div>
                        
                        {order.courier && (
                          <>
                            <div className="text-gray-700"><strong>Courier:</strong></div>
                            <div className="capitalize text-black font-medium">{order.courier}</div>
                          </>
                        )}
                        
                        <div className="text-gray-700"><strong>Order Date:</strong></div>
                        <div className="text-black font-medium">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Table */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">PRODUCTS:</h3>
                  <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">#</th>
                          <th className="px-4 py-3 text-left font-bold">Product Name</th>
                          <th className="px-4 py-3 text-center font-bold">Qty</th>
                          <th className="px-4 py-3 text-right font-bold">Unit Price</th>
                          <th className="px-4 py-3 text-right font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.products && order.products.length > 0 ? (
                          order.products.map((product, index) => (
                            <tr key={index} className="border-b-2 border-gray-200">
                              <td className="px-4 py-3 text-black font-medium">{index + 1}</td>
                              <td className="px-4 py-3 font-medium text-black">{product.name || 'Unknown Product'}</td>
                              <td className="px-4 py-3 text-center text-black font-medium">{product.quantity}</td>
                              <td className="px-4 py-3 text-right text-black font-medium">৳{Math.floor(product.price)}</td>
                              <td className="px-4 py-3 text-right font-semibold text-black">
                                ৳{Math.floor(product.quantity * product.price)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Section */}
                <div className="flex justify-end mb-6">
                  <div className="w-72">
                    <div className="bg-gray-50 border-2 border-gray-400 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="text-black font-medium">৳{Math.floor(order.total || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Delivery Charge:</span>
                          <span className="text-black font-medium">৳0</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-gray-400 pt-2 font-bold text-lg">
                          <span className="text-gray-800">Total Amount:</span>
                          <span className="text-black">৳{Math.floor(order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {order.note && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">NOTES:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                      <p className="text-sm text-black">{order.note}</p>
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">TERMS & CONDITIONS:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                    <ul className="text-xs text-black space-y-1">
                      <li>• Payment is due within 30 days of invoice date.</li>
                      <li>• Late payments may incur additional charges.</li>  
                      <li>• All products are subject to availability.</li>
                      <li>• Returns accepted within 7 days of delivery.</li>
                      <li>• Damaged products must be reported within 24 hours.</li>
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-800 pt-4">
                  <div className="text-center text-sm text-gray-600">
                    <p className="mb-2 text-black font-semibold">Thank you for your business!</p>
                    <p className="text-black">For any queries, please contact us at {companyInfo.phone} or {companyInfo.email}</p>
                    {companyInfo.website && (
                      <p className="text-black">Visit us at: {companyInfo.website}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Print Styles */}
      <style jsx>{`
        .barcode-container {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .barcode-svg {
          background-color: white;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
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
          
          .print\\:break-after-page {
            break-after: page;
            page-break-after: always;
          }

          .print\\:mt-0 {
            margin-top: 0 !important;
          }

          /* Ensure proper spacing and sizing for print */
          table {
            border-collapse: collapse !important;
          }
          
          th, td {
            border: 1px solid #6b7280 !important;
          }
          
          .bg-gray-800 {
            background-color: #1f2937 !important;
            color: white !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }

          .border-gray-400 {
            border-color: #9ca3af !important;
          }

          .border-2 {
            border-width: 2px !important;
          }

          .border-t-2 {
            border-top-width: 2px !important;
          }

          .border-b-2 {
            border-bottom-width: 2px !important;
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

          .text-black {
            color: #000000 !important;
          }

          /* Ensure fonts are bold where needed */
          .font-bold {
            font-weight: bold !important;
          }

          .font-semibold {
            font-weight: 600 !important;
          }

          .font-medium {
            font-weight: 500 !important;
          }

          /* Barcode specific styles */
          .barcode-svg {
            background-color: white !important;
            border: 1px solid #d1d5db !important;
          }

          .barcode-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint;
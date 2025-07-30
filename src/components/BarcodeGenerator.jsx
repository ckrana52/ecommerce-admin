import React from 'react';

const BarcodeGenerator = ({ text, width = 200, height = 60, showText = true }) => {
  // Enhanced barcode pattern generator
  const generateBarcodePattern = (text) => {
    // Code 39 patterns for better compatibility
    const patterns = {
      '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
      '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
      '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
      'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
      'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
      'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
      'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
      'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
      'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
      '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
      '/': '010100010', '+': '010001010', '%': '001010100', '*': '010010100'
    };

    // Start pattern
    let barcodePattern = '010010100'; // Start/Stop pattern for Code 39
    
    // Convert text to uppercase and process
    const upperText = text.toString().toUpperCase();
    for (let char of upperText) {
      if (patterns[char]) {
        barcodePattern += '0' + patterns[char]; // Add narrow space between characters
      } else if (!isNaN(char)) {
        barcodePattern += '0' + patterns[char];
      } else {
        // Default pattern for unknown characters
        barcodePattern += '0010010100';
      }
    }
    
    // End pattern
    barcodePattern += '0010010100';
    
    return barcodePattern;
  };

  const pattern = generateBarcodePattern(text);
  const barWidth = Math.max(width / pattern.length, 0.8); // Ensure minimum bar width

  return (
    <div className="barcode-container flex flex-col items-center">
      <svg 
        width={width} 
        height={height} 
        className="barcode-svg bg-white border border-gray-200"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Generate barcode bars */}
        {pattern.split('').map((bit, index) => (
          <rect
            key={index}
            x={index * barWidth}
            y={0}
            width={Math.max(barWidth, 0.8)}
            height={showText ? height - 20 : height}
            fill={bit === '1' ? '#000000' : '#ffffff'}
            stroke="none"
          />
        ))}
        
        {/* Text below barcode */}
        {showText && (
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#000000"
            fontFamily="monospace, 'Courier New', Arial"
            fontWeight="bold"
          >
            {text}
          </text>
        )}
      </svg>
      
      <style jsx>{`
        .barcode-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 2px 0;
        }
        
        .barcode-svg {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 2px;
        }
        
        @media print {
          .barcode-svg {
            border: 1px solid #9ca3af !important;
            background-color: white !important;
          }
          
          .barcode-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin: 1px 0 !important;
          }
          
          /* Ensure barcode text is black */
          text {
            fill: #000000 !important;
            font-weight: bold !important;
          }
          
          /* Ensure bars are black */
          rect[fill="#000000"] {
            fill: #000000 !important;
          }
          
          rect[fill="#ffffff"] {
            fill: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodeGenerator;
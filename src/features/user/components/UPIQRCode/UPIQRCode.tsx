import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UPIQRCodeProps {
  upiId: string;
  amount: number;
  merchantName: string;
  size?: number;
}

const UPIQRCode: React.FC<UPIQRCodeProps> = ({ 
  upiId, 
  amount, 
  merchantName, 
  size = 200 
}) => {
  // Generate UPI payment URL in the correct format
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

  const handleOpenUPIApp = () => {
    // Try to open UPI app with the payment URL
    window.location.href = upiUrl;
  };

  const handleCopyUPIUrl = () => {
    navigator.clipboard.writeText(upiUrl);
    // You could add a toast notification here
    alert('UPI URL copied to clipboard!');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG 
          value={upiUrl} 
          size={size} 
          level="M"
          includeMargin={true}
        />
      </div>
      <div className="text-center space-y-3">
        <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-1">
          Scan to pay ₹{amount}
        </p>
        <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
          UPI ID: {upiId}
        </p>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleOpenUPIApp}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Open UPI App
          </button>
          <button
            onClick={handleCopyUPIUrl}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default UPIQRCode; 
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      console.log('📷 Starting camera...');
      setError(null);
      setScanCount(0);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      });

      console.log('✅ Camera access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        
        // Start scanning after video is ready
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video ready, starting QR detection...');
          console.log(`Video dimensions: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          startScanning();
        };
      }
    } catch (err: any) {
      console.error('❌ Camera access error:', err);
      setError('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setScanCount(0);
    console.log('📷 Camera stopped');
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    console.log('🔍 Starting QR scan loop (every 300ms)...');
    
    // Scan every 300ms for faster detection
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 300);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = detectQRCode(imageData);

      // Increment scan count for debugging
      setScanCount(prev => {
        const newCount = prev + 1;
        if (newCount % 10 === 0) {
          console.log(`🔍 Scanned ${newCount} times...`);
        }
        return newCount;
      });

      if (qrCode) {
        console.log('✅ QR Code found! Verifying...');
        handleQRCodeDetected(qrCode);
      }
    } catch (err) {
      console.error('❌ QR scanning error:', err);
    }
  };

  // Actual QR detection using jsQR library
  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      // Try normal detection first
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      // If not found, try with inversion attempts (for different lighting)
      if (!code) {
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
      }
      
      if (code) {
        console.log('✅ QR Code detected!');
        console.log('QR Data length:', code.data.length);
        console.log('QR Data preview:', code.data.substring(0, 50) + '...');
        return code.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ QR detection error:', error);
      return null;
    }
  };

  const handleQRCodeDetected = (data: string) => {
    stopCamera();
    onScan(data);
    onClose();
  };

  // Manual input fallback
  const handleManualInput = () => {
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      stopCamera();
      onScan(manualCode.trim());
      setManualCode('');
      setShowManualInput(false);
      onClose();
    }
  };

  const handleManualCancel = () => {
    setManualCode('');
    setShowManualInput(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-lg mx-4 rounded-xl overflow-hidden bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Scan QR Code</h3>
              <p className="text-xs sm:text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Point camera at mess QR code</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
            aria-label="Close scanner"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 SmartMess-light-text dark:SmartMess-dark-text" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="bg-black border-x border-border">
          <div className="relative aspect-video bg-black overflow-hidden">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XMarkIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm sm:text-base text-red-600 dark:text-red-400 px-4">{error}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[280px] h-[280px] sm:w-64 sm:h-64">
                    {/* Corner markers - L-shaped, light blue/white */}
                    <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-t-[3px] border-l-[3px] border-cyan-400 sm:border-cyan-300 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 border-t-[3px] border-r-[3px] border-cyan-400 sm:border-cyan-300 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-b-[3px] border-l-[3px] border-cyan-400 sm:border-cyan-300 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 border-b-[3px] border-r-[3px] border-cyan-400 sm:border-cyan-300 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Top Status Indicator */}
                <div className="absolute top-4 left-0 right-0 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <p className="text-white text-xs sm:text-sm font-medium">
                        Scanning... ({scanCount})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Instructions */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className="bg-black/80 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <p className="text-white text-xs sm:text-sm font-semibold">
                        Position QR code within the frame
                      </p>
                    </div>
                    <p className="text-white/80 text-xs text-center">
                      Hold steady • Good lighting • Fill the frame
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border p-4 space-y-3">
          <button
            onClick={handleManualInput}
            className="w-full px-4 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm sm:text-base"
          >
            Enter Code Manually
          </button>
          <p className="text-xs text-center SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary px-2">
            Having trouble? Try manual input or check camera permissions
          </p>
        </div>
        </div>
      </div>

      {/* Manual Input Modal */}
      {showManualInput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden bg-card border border-border shadow-2xl">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">
                  Enter QR Code Manually
                </h3>
                <button
                  onClick={handleManualCancel}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5 SmartMess-light-text dark:SmartMess-dark-text" />
                </button>
              </div>
              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-4">
                Paste or type the QR code data below
              </p>
              <textarea
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter QR code data..."
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder-muted-foreground resize-none min-h-[120px] text-sm"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleManualCancel}
                  className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRScannerModal;

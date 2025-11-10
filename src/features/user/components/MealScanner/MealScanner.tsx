import React, { useState, useEffect, useRef } from 'react';
import { QrCodeIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { CameraIcon, BoltIcon } from '@heroicons/react/24/solid';
import mealActivationService from '@/services/api/mealActivationService';

interface MealScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (result: any) => void;
  scannerType?: 'user' | 'mess_owner';
}

const MealScanner: React.FC<MealScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  scannerType = 'user'
}) => {
  const [_isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Note: Toast functionality will be added when useToast hook is available

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      setError(null);
      
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setHasCamera(false);
        setError('No camera found on this device');
        return;
      }

      // Request camera permission
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
        
        // Start scanning for QR codes
        startQRScanning();
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setHasCamera(false);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const startQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && !isProcessing) {
        scanQRCode();
      }
    }, 500); // Scan every 500ms
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for QR code detection
      // const imageData = context.getImageData(0, 0, canvas.width, canvas.height); // Unused
      
      // Use a QR code detection library (you'll need to install one)
      // For now, we'll simulate QR code detection
      // In a real implementation, you'd use libraries like 'qr-scanner' or 'jsqr'
      
      // Placeholder for QR code detection
      // const qrCode = detectQRCode(imageData);
      // if (qrCode) {
      //   await processQRCode(qrCode.data);
      // }
      
    } catch (err) {
      console.error('Error scanning QR code:', err);
    }
  };

  const processQRCode = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      let result;
      
      if (scannerType === 'user') {
        result = await mealActivationService.userScanQRCode(qrCodeData);
      } else {
        result = await mealActivationService.scanQRCode(qrCodeData);
      }

      setScanResult(result);
      stopCamera();
      
      // Toast notification would go here
      console.log('Meal activated successfully:', result.mealInfo?.name);

      if (onScanSuccess) {
        onScanSuccess(result);
      }

    } catch (error: any) {
      setError(error.message);
      // Toast notification would go here
      console.error('Scan failed:', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      setError('Please enter QR code data');
      return;
    }

    await processQRCode(manualInput.trim());
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    try {
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        const track = tracks[0];
        if (track) {
          const capabilities = track.getCapabilities();
          
          if ('torch' in capabilities) {
            await track.applyConstraints({
              advanced: [{ torch: !flashEnabled } as any]
            });
            setFlashEnabled(!flashEnabled);
          }
        }
      }
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setManualInput('');
    setShowManualInput(false);
    if (isOpen) {
      initializeCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-card rounded-xl border border-border w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <QrCodeIcon className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {scannerType === 'user' ? 'Scan Your Meal' : 'Scan User Meal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {scanResult ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Meal Activated Successfully!
                </h3>
                <p className="text-muted-foreground">
                  {scanResult.mealInfo?.name} has been activated for {scanResult.activation?.mealType}
                </p>
              </div>
              <button
                onClick={resetScanner}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Scan Another
              </button>
            </div>
          ) : (
            <>
              {/* Camera View */}
              {hasCamera && !showManualInput ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                      </div>
                    </div>

                    {/* Flash Button */}
                    <button
                      onClick={toggleFlash}
                      className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                        flashEnabled 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <BoltIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {isProcessing && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Processing scan...</p>
                    </div>
                  )}

                  <p className="text-center text-sm text-muted-foreground">
                    Position the QR code within the frame to scan
                  </p>
                </div>
              ) : (
                // Manual Input or No Camera
                <div className="space-y-4">
                  {!hasCamera && (
                    <div className="text-center py-8">
                      <CameraIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Camera Not Available
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Enter the QR code data manually
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      QR Code Data
                    </label>
                    <textarea
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste or type the QR code data here..."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim() || isProcessing}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Activate Meal'}
                  </button>

                  {hasCamera && (
                    <button
                      onClick={() => setShowManualInput(false)}
                      className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                    >
                      Use Camera Instead
                    </button>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Manual Input Toggle */}
              {hasCamera && !showManualInput && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Enter code manually
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealScanner;

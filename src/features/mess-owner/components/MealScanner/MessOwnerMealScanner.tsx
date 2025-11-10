import React, { useState, useEffect } from 'react';
import { 
  QrCodeIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CameraIcon, BoltIcon } from '@heroicons/react/24/solid';
import mealActivationService, { ActivationStats } from '@/services/api/mealActivationService';

interface MessOwnerMealScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (result: any) => void;
}

const MessOwnerMealScanner: React.FC<MessOwnerMealScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [_isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [stats, setStats] = useState<ActivationStats | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const scanIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
      loadStats();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
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
          facingMode: 'environment',
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
    }, 500);
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // QR code detection would be implemented here
      // For now, this is a placeholder for the actual QR scanning logic
      
    } catch (err) {
      console.error('Error scanning QR code:', err);
    }
  };

  const processQRCode = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const result = await mealActivationService.scanQRCode(qrCodeData);

      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 scans
      stopCamera();
      
      console.log('Meal activated successfully:', result.mealInfo?.name);

      if (onScanSuccess) {
        onScanSuccess(result);
      }

      // Reload stats after successful scan
      await loadStats();

    } catch (error: any) {
      setError(error.message);
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

  const loadStats = async () => {
    try {
      const statsData = await mealActivationService.getActivationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setManualInput('');
    setShowManualInput(false);
    if (isOpen) {
      initializeScanner();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-card rounded-xl border border-border w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex">
        {/* Main Scanner Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <QrCodeIcon className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Meal Scanner - Mess Owner
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
          <div className="flex-1 p-4 overflow-y-auto">
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
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p className="text-foreground font-medium">
                      {scanResult.mealInfo?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      User: {scanResult.activation?.userId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Meal Type: {scanResult.activation?.mealType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Activated at: {new Date(scanResult.activation?.activatedAt).toLocaleString()}
                    </p>
                  </div>
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
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
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
                        <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
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
                      Ask the user to show their QR code and position it within the frame
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

        {/* Stats Sidebar */}
        <div className="w-80 border-l border-border bg-muted/30 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Today's Stats
          </h3>

          {/* Stats Cards */}
          {stats && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.summary.totalActivated}
                  </div>
                  <div className="text-xs text-muted-foreground">Activated</div>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.summary.pending}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.summary.totalExpired}
                  </div>
                  <div className="text-xs text-muted-foreground">Expired</div>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-primary">
                    {stats.summary.activationRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Scans */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Recent Scans
            </h4>
            {recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent scans</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan, index) => (
                  <div key={index} className="bg-card rounded-lg p-3 border border-border">
                    <div className="text-sm font-medium text-foreground">
                      {scan.mealInfo?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scan.activation?.mealType} • {new Date(scan.activation?.activatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessOwnerMealScanner;

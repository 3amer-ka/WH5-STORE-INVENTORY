/**
 * QR Scanner component for scanning QR codes to find inventory items
 */
import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  QrCode, 
  Camera, 
  Search, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Flashlight
} from 'lucide-react';

interface QRScannerProps {
  onViewChange: (view: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onViewChange }) => {
  const { state } = useInventory();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setHasPermission(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start QR code detection simulation
        // In a real implementation, you would use a QR code detection library
        // like jsQR or ZXing
        simulateQRDetection();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn }]
          });
          setIsFlashOn(!isFlashOn);
        } catch (err) {
          console.log('Flash not supported on this device');
        }
      }
    }
  };

  // Simulate QR code detection for demo purposes
  const simulateQRDetection = () => {
    setTimeout(() => {
      if (isScanning) {
        // Simulate finding a QR code with item data
        const mockQRData = JSON.stringify({
          itemId: state.items[0]?.id || 'demo-item',
          name: state.items[0]?.name || 'Demo Item',
          type: 'inventory_item'
        });
        
        handleQRDetection(mockQRData);
      }
    }, 3000);
  };

  const handleQRDetection = (data: string) => {
    setScannedData(data);
    
    try {
      // Try to parse as JSON first
      const parsedData = JSON.parse(data);
      
      if (parsedData.type === 'inventory_item') {
        const item = state.items.find(i => i.id === parsedData.itemId);
        if (item) {
          setFoundItems([item]);
          setError('');
        } else {
          setError('Item not found in inventory');
          setFoundItems([]);
        }
      } else {
        searchByText(data);
      }
    } catch {
      // If not JSON, treat as plain text
      searchByText(data);
    }
  };

  const searchByText = (text: string) => {
    const searchTerm = text.toLowerCase();
    const results = state.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.waybillNumber.toLowerCase().includes(searchTerm) ||
      item.id === searchTerm
    );
    
    setFoundItems(results);
    if (results.length === 0) {
      setError('No items found matching the scanned code');
    } else {
      setError('');
    }
  };

  const clearResults = () => {
    setScannedData('');
    setFoundItems([]);
    setError('');
  };

  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 10) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <QrCode className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Scanner</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Scan QR codes to quickly find inventory items
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => onViewChange('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Camera Scanner</span>
            </CardTitle>
            <CardDescription>
              Point your camera at a QR code to scan it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasPermission === false ? (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Camera access is required for QR scanning. Please enable camera permissions and refresh the page.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                      style={{ display: isScanning ? 'block' : 'none' }}
                    />
                    
                    {!isScanning && (
                      <div className="w-full h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Camera preview will appear here</p>
                        </div>
                      </div>
                    )}
                    
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-2">
                    {!isScanning ? (
                      <Button onClick={startScanning} className="flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Start Scanning</span>
                      </Button>
                    ) : (
                      <>
                        <Button onClick={stopScanning} variant="outline" className="flex items-center space-x-2">
                          <Pause className="w-4 h-4" />
                          <span>Stop</span>
                        </Button>
                        <Button onClick={toggleFlash} variant="outline" className="flex items-center space-x-2">
                          <Flashlight className={`w-4 h-4 ${isFlashOn ? 'text-yellow-500' : ''}`} />
                          <span>{isFlashOn ? 'Flash Off' : 'Flash On'}</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {isScanning && (
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-sm">Scanning for QR codes...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Scan Results</span>
              </CardTitle>
              {(scannedData || foundItems.length > 0 || error) && (
                <Button variant="outline" size="sm" onClick={clearResults}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scannedData && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Scanned Data:</h4>
                <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
                  {scannedData}
                </code>
              </div>
            )}

            {foundItems.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">Found {foundItems.length} item(s)</h4>
                </div>
                
                {foundItems.map((item) => {
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-lg">{item.name}</h5>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Quantity:</span>
                          <span className="ml-2">{item.quantity} {item.unit}</span>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <div className="inline-flex items-center ml-2">
                            <div 
                              className="w-3 h-3 rounded-full mr-1" 
                              style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                            />
                            <span>{getCategoryName(item.categoryId)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {item.waybillNumber && (
                        <div className="text-sm">
                          <span className="font-medium">Waybill:</span>
                          <span className="ml-2">{item.waybillNumber}</span>
                        </div>
                      )}
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !error && !scannedData && (
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Scan a QR code to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Scanning Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Start Scanning" to activate the camera</li>
                <li>Point your camera at a QR code</li>
                <li>Keep the QR code within the scanning frame</li>
                <li>The scanner will automatically detect and process the code</li>
                <li>View the results in the results panel</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Supported QR Code Formats</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>JSON format with item ID and metadata</li>
                <li>Plain text item names or descriptions</li>
                <li>Waybill numbers</li>
                <li>Item IDs</li>
                <li>Custom inventory codes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
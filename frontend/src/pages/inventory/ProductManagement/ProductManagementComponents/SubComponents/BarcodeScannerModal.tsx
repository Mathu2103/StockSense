import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

type BarcodeScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = "barcode-scanner-reader";

  useEffect(() => {
    if (!isOpen) return;

    // 1. Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to environment (back) camera if possible, otherwise user (front)
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          const frontCam = devices.find((d) => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('user'));
          const defaultCam = backCam || frontCam || devices[0];
          setSelectedCameraId(defaultCam.id);
        } else {
          setErrorMsg("No camera devices found.");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        setErrorMsg("Failed to list camera devices: Permission denied or not secure context (HTTPS/localhost).");
      });

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedCameraId && isOpen) {
      startScanner(selectedCameraId);
    }
  }, [selectedCameraId, isOpen]);

  const startScanner = async (cameraId: string) => {
    // Stop any existing scanner first
    await stopScanner();

    try {
      const html5QrCode = new Html5Qrcode(readerId, {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      });
      qrCodeRef.current = html5QrCode;

      // Configuration for scanning
      const config = {
        fps: 15,
        qrbox: (width: number, height: number) => {
          // Adjust scanner box dimensions dynamically
          const minEdge = Math.min(width, height);
          const qrboxSize = Math.round(minEdge * 0.7);
          return {
            width: qrboxSize,
            height: Math.round(qrboxSize * 0.5), // wider box for barcodes
          };
        },
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          // Success callback
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (errorMessage) => {
          // Verbose error, ignore to keep console clean
        }
      );

      setIsCameraActive(true);
      setErrorMsg('');
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      setErrorMsg(`Failed to start camera: ${err.message || err}`);
      setIsCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      try {
        await qrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    qrCodeRef.current = null;
    setIsCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">qr_code_scanner</span>
            Live Camera Barcode Scanner
          </h2>
          <button 
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Camera Feed Area */}
        <div className="bg-slate-900 p-6 flex flex-col items-center justify-center relative min-h-[300px]">
          
          {/* html5-qrcode reader element */}
          <div 
            id={readerId} 
            className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-dashed border-white/20 bg-slate-950 shadow-inner"
          />

          {/* Visual laser overlay if active */}
          {isCameraActive && (
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
              <div className="w-[280px] h-[140px] relative border-2 border-primary rounded-lg">
                {/* Red Laser Line */}
                <div 
                  className="absolute w-full h-[2px] bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"
                  style={{
                    animation: 'scanLine 2s linear infinite',
                    position: 'absolute',
                    left: 0,
                  }}
                />
                <style>{`
                  @keyframes scanLine {
                    0% { top: 5%; }
                    50% { top: 95%; }
                    100% { top: 5%; }
                  }
                `}</style>
              </div>
            </div>
          )}

          {/* Error Message display */}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white">
              <span className="material-symbols-outlined text-red-500 text-4xl mb-3">videocam_off</span>
              <p className="text-sm font-semibold mb-2">Camera Access Restricted</p>
              <p className="text-xs text-slate-400 max-w-xs">{errorMsg}</p>
              <button
                type="button"
                onClick={() => {
                  const mockBarcode = `479${Math.floor(1000000000 + Math.random() * 9000000000)}`;
                  onScan(mockBarcode);
                  onClose();
                }}
                className="mt-6 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 shadow-lg transition-all"
              >
                Simulate Successful Scan
              </button>
            </div>
          )}

          {!isCameraActive && !errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-400">Initializing camera stream...</p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Camera selection dropdown */}
          {cameras.length > 1 ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">photo_camera</span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="flex-1 sm:flex-none appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
              >
                {cameras.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.label || `Camera ${device.id.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {cameras.length === 1 ? "Active: Single Camera" : "Offline"}
            </span>
          )}

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {/* Fallback mock scan simulator */}
            {isCameraActive && (
              <button
                type="button"
                onClick={() => {
                  const mockBarcode = `479${Math.floor(1000000000 + Math.random() * 9000000000)}`;
                  onScan(mockBarcode);
                  stopScanner();
                  onClose();
                }}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Mock Scan
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                stopScanner();
                onClose();
              }} 
              className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

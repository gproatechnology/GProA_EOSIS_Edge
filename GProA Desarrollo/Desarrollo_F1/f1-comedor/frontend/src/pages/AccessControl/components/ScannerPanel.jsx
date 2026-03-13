import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'

export default function ScannerPanel({ isScanning, setIsScanning, onScan, setSystemStatus }) {
  const html5QrcodeScannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    setSystemStatus(s => ({ ...s, camera: 'ONLINE', scanner: 'SCANNING' }))
    
    setTimeout(() => {
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        'f1-qr-reader',
        {
          fps: 15,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: false, // helps with mirror cams
        },
        false
      )

      html5QrcodeScannerRef.current.render(
        (decodedText) => {
          onScan(decodedText)
        },
        () => {
          // Ignore general read errors (noise)
        }
      )
    }, 100)
  }

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(() => {})
    }
    setIsScanning(false)
    setSystemStatus(s => ({ ...s, camera: 'OFFLINE', scanner: 'IDLE' }))
  }

  return (
    <div className="h-full flex flex-col relative group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E10600] z-10 hidden sm:block pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E10600] z-10 hidden sm:block pointer-events-none"></div>

      <div className="flex justify-between items-center p-4 border-b border-[#233554] bg-[#0A192F]/50">
        <h3 className="text-[#E6EDF3] font-black italic uppercase tracking-wider text-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isScanning ? 'bg-[#00E676]' : 'bg-[#FF3B30]'}`}></span>
          Scanner Engine Feed
        </h3>
        
        {isScanning ? (
          <button
            onClick={stopScanning}
            className="text-[10px] font-bold text-[#FF3B30] hover:text-white uppercase tracking-widest border border-[#FF3B30] hover:bg-[#FF3B30] px-3 py-1 rounded transition-colors"
          >
            [ HALT FEED ]
          </button>
        ) : (
          <button
            onClick={startScanning}
            className="text-[10px] font-bold text-[#E10600] hover:text-white uppercase tracking-widest border border-[#E10600] hover:bg-[#E10600] px-3 py-1 rounded transition-colors"
          >
            [ START UP ]
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#050D19]">
        {!isScanning ? (
          <div className="text-center p-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#233554]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-[#8892B0] font-mono text-xs uppercase tracking-widest">CAMERA OFFLINE. AWAITING START UP SEQUENCE.</p>
          </div>
        ) : (
          <div className="w-full h-full p-2 relative">
            <div id="f1-qr-reader" className="w-full h-full flex flex-col items-center justify-center [&>div]:w-full [&>div]:border-none [&>div>video]:w-full [&>div>video]:object-cover [&>div>video]:rounded-lg [&>div>video]:border [&>div>video]:border-[#233554] [&>#qr-shaded-region]:!border-[#112240] [&>#qr-shaded-region]:!border-[60px]" style={{ minHeight: '300px'}}></div>
            {/* Animated Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#E10600] shadow-[0_0_15px_#E10600] animate-[scan_2s_ease-in-out_infinite] pointer-events-none opacity-50"></div>
          </div>
        )}
      </div>
    </div>
  )
}

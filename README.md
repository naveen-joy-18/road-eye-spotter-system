# ROADSENSE AI - Pothole Detection System

A comprehensive pothole detection and reporting system using YOLO-based computer vision, GPS tracking, and real-time alerts.

## 🚀 Features

- **Real YOLO-based Detection**: Pretrained object detection using Hugging Face Transformers (DETR model)
- **Text File Reporting**: Automatic download of pothole reports as text files
- **Image Storage**: Uploaded images saved alongside reports
- **Bangalore Live Map**: Real-time pothole data from Bangalore via embedded map
- **GPS Integration**: Capture and track pothole locations
- **Driver Alerts**: Voice and visual notifications (only from actual detections)
- **Interactive Maps**: Visualize pothole locations
- **AI Chat Assistant**: Get insights about road conditions

## 🛠️ Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd roadsense-ai
```

2. **Install dependencies**:
```bash
npm install
```

3. **The YOLO model** (Hugging Face DETR) loads automatically from CDN - no manual download needed!

4. **Configure API keys** (optional):
   - Create `.env` file in root directory
   - Add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## ✨ Key Changes from Previous Version

### 1. Text File Reports (No Database)
- All pothole reports are automatically downloaded as `.txt` files
- Reports include GPS coordinates, severity, timestamp, and detection details
- Uploaded images are saved as separate `.jpg` files in the same directory

### 2. Real YOLO Integration
- Uses Hugging Face Transformers (@huggingface/transformers)
- Pretrained DETR (DEtection TRansformer) model from Facebook AI
- Runs in browser with WebGPU acceleration (falls back to simulation if needed)
- No manual model download required!

### 3. Bangalore Live Pothole Map
- New tab in Map section showing real-time Bangalore pothole data
- Embedded iframe from https://blr-potholes.pages.dev/
- Can be opened in new tab for full-screen viewing

### 4. Driver Alerts - Fixed
- **REMOVED**: Random automatic alerts that appeared without reason
- **NOW**: Alerts only trigger from actual pothole detections
- No more dummy location names (e.g., "MG Road, Bangalore")

### 5. No Random Place Names
- All random Indian city/location names removed
- Detection reports show only: distance, GPS coordinates, severity
- Cleaner, more logical output

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── alerts/          # Alert system (fixed - no random alerts)
│   ├── map/             # Map components
│   ├── BangaloreLivePotholeMap.tsx  # NEW: Bangalore live map
│   └── ui/              # UI components (shadcn)
├── services/            # Core services
│   ├── yoloDetectionReal.ts  # NEW: Real YOLO with HuggingFace
│   ├── yoloDetection.ts      # Original (simulation)
│   ├── gpsService.ts         # GPS tracking
│   └── reportingService.ts   # Text file reports (updated)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions (cleaned up)
└── pages/               # Page components
```

## 📖 Usage Guide

### 1. Real-time Detection

- Navigate to "Real-Time Detection" page
- Allow camera access when prompted
- System uses real YOLO model to detect potholes
- Voice alerts notify you ONLY when potholes are actually detected
- Reports auto-download as text files

### 2. Video Analysis

- Upload a video or use sample videos
- Click "Start Analysis" to begin detection
- View detected potholes with timestamps
- Download reports as text files
- No random location names - only real data

### 3. Map View

- **Map Visualization**: View all detected potholes
- **Bangalore Live**: Real-time Bangalore pothole map (NEW!)
- **Traffic Analysis**: Traffic patterns
- **Road Damage Stats**: Statistics

### 4. Pothole Reporting

When a pothole is detected:
1. GPS coordinates are automatically captured
2. Detection details are compiled
3. **Text file** is auto-downloaded (e.g., `pothole_report_12345.txt`)
4. If you uploaded an image, it's also downloaded (e.g., `pothole_image_12345.jpg`)

Report contents:
```
POTHOLE DETECTION REPORT
========================

Report ID: report_1234567890_abc123
Timestamp: 2025-10-20T10:30:00.000Z
Report Type: AUTOMATIC

DETECTION DETAILS
-----------------
Confidence: 87.5%
Severity: HIGH
Distance from Vehicle: 45 meters

POTHOLE CHARACTERISTICS
-----------------------
Estimated Depth: 12 cm
Surface Damage: 75%

LOCATION INFORMATION
--------------------
Latitude: 12.9716
Longitude: 77.5946
Accuracy: 10 meters
```

## 🤖 YOLO Model - Real Integration

### How It Works

1. **Hugging Face Transformers** library loads automatically
2. Uses Facebook's **DETR (DEtection TRansformer)** pretrained model
3. Runs inference in the browser using **WebGPU** (hardware acceleration)
4. Falls back to simulation if model loading fails

### Code Example

```typescript
import { yoloRealService } from '@/services/yoloDetectionReal';

// Load model (automatic from HuggingFace)
await yoloRealService.loadModel();

// Detect potholes
const detections = await yoloRealService.detectPotholes(imageElement);

// Process video
const cleanup = await yoloRealService.processVideoStream(
  videoElement,
  (detections) => console.log('Real detections:', detections)
);
```

### Switching Between Real and Simulated

- Real YOLO: `yoloRealService` (src/services/yoloDetectionReal.ts)
- Simulation: `yoloService` (src/services/yoloDetection.ts)

To use custom YOLO model:
1. Train your own YOLOv8 model
2. Convert to ONNX format
3. Use ONNX.js to load in browser
4. Update detection service

## 🗺️ Bangalore Live Map

Access the Bangalore live pothole map in two ways:

1. **In-app**: Go to Map section → "Bangalore Live" tab
2. **Direct link**: https://blr-potholes.pages.dev/

The map shows:
- Real-time pothole reports from Bangalore
- Community-submitted data
- Interactive markers
- Severity indicators

## ✅ Fixed Issues

### Driver Alerts Fixed
**Before**: Random alerts appeared every 5 seconds, even without detections
**After**: Alerts only trigger from actual pothole detections

### No More Random Locations
**Before**: "MG Road, Bangalore", "Connaught Place, Delhi", etc.
**After**: Only real GPS coordinates and distances

### Text File Storage
**Before**: Reports saved to localStorage (lost on browser clear)
**After**: Reports auto-download as .txt files to your computer

### Real YOLO Integration
**Before**: Pure simulation
**After**: Actual ML model (DETR) with fallback to simulation

## 🌐 Browser Compatibility

- **Chrome/Edge**: Full support with WebGPU
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **Opera**: Full support

## ⚡ Performance Tips

- WebGPU provides 3-5x faster inference
- Lower video resolution for faster processing
- Reduce FPS if experiencing lag
- Close unnecessary tabs for better performance

## 🔧 Troubleshooting

### Model Not Loading
- Check internet connection (model loads from CDN)
- Wait for initial download (30-60 seconds first time)
- Check browser console for errors
- Falls back to simulation if needed

### GPS Not Working
- Enable location permissions
- Use HTTPS connection
- Check browser compatibility

### Reports Not Downloading
- Check browser download permissions
- Disable popup blockers
- Check Downloads folder

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License

## 🙏 Acknowledgments

- Hugging Face Transformers
- Facebook AI Research (DETR model)
- Bangalore Pothole Data Community
- Google Maps Platform
- shadcn/ui

---

**Built for safer roads 🛣️**

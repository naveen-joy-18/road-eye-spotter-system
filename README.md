# ROADSENSE AI - Advanced Pothole Detection System

A comprehensive real-time pothole detection system using YOLO (You Only Look Once) deep learning models, integrated with GPS tracking, automated reporting, and driver alert systems.

## 🚀 Features

- **YOLOv8 Integration**: Real-time pothole detection using YOLO models
- **Real-time Alerts**: Voice and visual warnings for detected potholes
- **GPS Integration**: Automatic location capture for pothole reports
- **Text File Reporting**: Save detailed reports as downloadable text files
- **Interactive Maps**: View pothole locations on Google Maps
- **AI Chat Assistant**: Get help and information about potholes

## 🛠️ Quick Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Download YOLO Model**:
   ```bash
   mkdir -p public/models
   # Download yolo8n.pt and place in public/models/yolo8n.pt
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

## 📱 Usage

1. Navigate to "Video Analysis" page
2. Click "Start Detection" to activate camera
3. Grant camera and GPS permissions
4. System will detect potholes and create automatic reports
5. Download reports as text files from the interface

## 🔧 Model Setup

Place your YOLO model file (`yolo8n.pt`) in `public/models/` directory. The system will automatically load it for real-time detection.

**Note**: Leave space for manual YOLO model download as requested.

## 🗂️ Key Components

- `src/services/yoloDetection.ts` - YOLO model integration
- `src/services/gpsService.ts` - GPS and location services  
- `src/services/reportingService.ts` - Text file reporting system
- `src/components/RealTimeDetection.tsx` - Camera-based detection
- `src/components/MapView.tsx` - Interactive map with markers

## 📄 Report Format

Reports are saved as structured text files containing:
- Detection details (confidence, severity, algorithm)
- GPS coordinates and address
- Timestamp and technical metadata
- Pothole characteristics (depth, surface damage)

## 🎯 Next Steps

1. Download your preferred YOLO model (yolo8n.pt recommended)
2. Place in `public/models/` directory
3. Configure Google Maps API key for mapping features
4. Start detecting potholes in real-time!

Built with React, TypeScript, and cutting-edge AI technology.

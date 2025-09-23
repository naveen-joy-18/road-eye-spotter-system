# YOLO Model Directory

## Setup Instructions

1. **Download YOLO Model**: 
   - Download `yolo8n.pt` from the official YOLOv8 repository
   - Place the file in this directory (`public/models/yolo8n.pt`)

2. **Model File Location**:
   ```
   public/models/yolo8n.pt
   ```

3. **Alternative Models**:
   - You can also use `yolo8s.pt`, `yolo8m.pt`, or `yolo8l.pt` for better accuracy
   - Update the model path in `src/services/yoloDetection.ts` if using a different model

4. **Custom Pothole Dataset**:
   - To train on your own pothole dataset, follow YOLOv8 training documentation
   - Replace the default model with your trained model
   - Update the model path accordingly

## Model Download Links

- **YOLOv8n**: https://github.com/ultralytics/yolov8/releases/download/v8.0.0/yolo8n.pt
- **YOLOv8s**: https://github.com/ultralytics/yolov8/releases/download/v8.0.0/yolo8s.pt
- **YOLOv8m**: https://github.com/ultralytics/yolov8/releases/download/v8.0.0/yolo8m.pt

## File Structure
```
public/
└── models/
    ├── README.md (this file)
    └── yolo8n.pt (place your YOLO model here)
```
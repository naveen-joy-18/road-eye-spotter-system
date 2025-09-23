// YOLO Pothole Detection Service
import { PotholeDetection } from '@/types';

export interface YOLOModel {
  net: any;
  isLoaded: boolean;
  modelPath: string;
}

export interface DetectionResult {
  bbox: number[];
  confidence: number;
  class: string;
  severity: 'low' | 'medium' | 'high';
}

class YOLODetectionService {
  private model: YOLOModel | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Initialize YOLO model
   * Note: Place yolo8n.pt in public/models/ directory
   */
  async loadModel(modelPath: string = '/models/yolo8n.pt'): Promise<boolean> {
    try {
      console.log('[YOLO] Loading model from:', modelPath);
      
      // Check if model file exists
      const response = await fetch(modelPath);
      if (!response.ok) {
        throw new Error(`Model file not found at ${modelPath}. Please ensure yolo8n.pt is placed in public/models/`);
      }

      // TODO: Implement actual YOLO model loading
      // This is a placeholder for YOLO integration
      // You'll need to integrate with ONNX.js or TensorFlow.js to load the actual model
      
      this.model = {
        net: null, // Placeholder for actual model
        isLoaded: true,
        modelPath
      };

      console.log('[YOLO] Model loaded successfully');
      return true;
    } catch (error) {
      console.error('[YOLO] Failed to load model:', error);
      return false;
    }
  }

  /**
   * Detect potholes in image/video frame
   */
  async detectPotholes(
    imageElement: HTMLImageElement | HTMLVideoElement,
    options: {
      confidenceThreshold?: number;
      nmsThreshold?: number;
    } = {}
  ): Promise<DetectionResult[]> {
    if (!this.model?.isLoaded) {
      throw new Error('YOLO model not loaded. Call loadModel() first.');
    }

    const { confidenceThreshold = 0.5, nmsThreshold = 0.4 } = options;

    try {
      // Prepare image for inference
      this.prepareImage(imageElement);

      // TODO: Implement actual YOLO inference
      // This is a simulation until real YOLO model is integrated
      const detections = this.simulateDetection(confidenceThreshold);

      console.log('[YOLO] Detected', detections.length, 'potholes');
      return detections;
    } catch (error) {
      console.error('[YOLO] Detection failed:', error);
      return [];
    }
  }

  /**
   * Process video stream for real-time detection
   */
  async processVideoStream(
    videoElement: HTMLVideoElement,
    onDetection: (detections: PotholeDetection[]) => void,
    options: {
      fps?: number;
      confidenceThreshold?: number;
    } = {}
  ): Promise<() => void> {
    const { fps = 10, confidenceThreshold = 0.5 } = options;
    let isProcessing = true;

    const processFrame = async () => {
      if (!isProcessing || videoElement.paused) return;

      try {
        const detections = await this.detectPotholes(videoElement, { confidenceThreshold });
        
        if (detections.length > 0) {
          const potholeDetections = this.convertToDetections(detections, videoElement.currentTime);
          onDetection(potholeDetections);
        }
      } catch (error) {
        console.error('[YOLO] Frame processing error:', error);
      }

      setTimeout(processFrame, 1000 / fps);
    };

    processFrame();

    // Return cleanup function
    return () => {
      isProcessing = false;
    };
  }

  /**
   * Convert YOLO detections to application format
   */
  private convertToDetections(detections: DetectionResult[], timeInVideo: number): PotholeDetection[] {
    return detections.map((detection, index) => ({
      id: `yolo-${Date.now()}-${index}`,
      timeInVideo,
      confidence: detection.confidence,
      severity: detection.severity,
      size: this.determineSizeFromBbox(detection.bbox),
      boundingBox: {
        x: detection.bbox[0],
        y: detection.bbox[1],
        width: detection.bbox[2],
        height: detection.bbox[3]
      },
      depthEstimate: this.estimateDepth(detection.bbox, detection.confidence),
      surfaceDamageEstimate: this.estimateSurfaceDamage(detection.severity),
      detectionAlgorithm: 'YOLOv8',
      distance: this.estimateDistance(detection.bbox),
      locationName: null
    }));
  }

  /**
   * Prepare image for YOLO inference
   */
  private prepareImage(imageElement: HTMLImageElement | HTMLVideoElement): ImageData {
    // Set canvas size to match YOLO input requirements (typically 640x640)
    this.canvas.width = 640;
    this.canvas.height = 640;

    // Draw image to canvas with resizing
    this.ctx.drawImage(imageElement, 0, 0, 640, 640);

    // Get image data for processing
    return this.ctx.getImageData(0, 0, 640, 640);
  }

  /**
   * Simulate YOLO detection (replace with actual inference)
   */
  private simulateDetection(confidenceThreshold: number): DetectionResult[] {
    const detections: DetectionResult[] = [];
    
    // Simulate random detections for demonstration
    const numDetections = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numDetections; i++) {
      const confidence = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
      
      if (confidence >= confidenceThreshold) {
        detections.push({
          bbox: [
            Math.random() * 400 + 100, // x
            Math.random() * 400 + 100, // y
            Math.random() * 100 + 50,  // width
            Math.random() * 100 + 50   // height
          ],
          confidence,
          class: 'pothole',
          severity: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
        });
      }
    }

    return detections;
  }

  private determineSizeFromBbox(bbox: number[]): 'small' | 'medium' | 'large' {
    const area = bbox[2] * bbox[3]; // width * height
    if (area < 2500) return 'small';
    if (area < 10000) return 'medium';
    return 'large';
  }

  private estimateDepth(bbox: number[], confidence: number): number {
    // Estimate depth based on bounding box size and confidence
    const area = bbox[2] * bbox[3];
    const baseDepth = (area / 1000) * confidence;
    return Math.min(Math.max(baseDepth, 2), 25); // 2-25 cm
  }

  private estimateSurfaceDamage(severity: 'low' | 'medium' | 'high'): number {
    switch (severity) {
      case 'high': return Math.floor(Math.random() * 30) + 70; // 70-100%
      case 'medium': return Math.floor(Math.random() * 40) + 30; // 30-70%
      case 'low': return Math.floor(Math.random() * 30) + 5; // 5-35%
    }
  }

  private estimateDistance(bbox: number[]): number {
    // Estimate distance based on size in frame (larger = closer)
    const area = bbox[2] * bbox[3];
    const maxArea = 640 * 640;
    const ratio = area / maxArea;
    return Math.floor((1 - ratio) * 100 + 10); // 10-110 meters
  }
}

export const yoloService = new YOLODetectionService();
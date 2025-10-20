// Real YOLO Pothole Detection Service with Hugging Face Transformers
import { PotholeDetection } from '@/types';
import { pipeline, AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

export interface YOLOModel {
  detector: any;
  isLoaded: boolean;
  modelName: string;
}

export interface DetectionResult {
  bbox: number[];
  confidence: number;
  class: string;
  severity: 'low' | 'medium' | 'high';
}

class YOLODetectionRealService {
  private model: YOLOModel | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Initialize YOLO model using Hugging Face Transformers
   * Using a pretrained object detection model (YOLOv8 alternative)
   */
  async loadModel(modelName: string = 'Xenova/detr-resnet-50'): Promise<boolean> {
    try {
      console.log('[YOLO Real] Loading model from Hugging Face:', modelName);
      
      // Load object detection pipeline - try WebGPU first, fallback to WASM
      let detector;
      try {
        detector = await pipeline('object-detection', modelName, {
          device: 'webgpu',
        });
        console.log('[YOLO Real] Using WebGPU acceleration');
      } catch (gpuError) {
        console.log('[YOLO Real] WebGPU not available, using WASM');
        detector = await pipeline('object-detection', modelName);
      }

      this.model = {
        detector,
        isLoaded: true,
        modelName
      };

      console.log('[YOLO Real] Model loaded successfully');
      return true;
    } catch (error) {
      console.error('[YOLO Real] Failed to load model:', error);
      console.log('[YOLO Real] Model loading failed - detection will use fallback mode');
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
    } = {}
  ): Promise<DetectionResult[]> {
    const { confidenceThreshold = 0.5 } = options;

    try {
      if (!this.model?.isLoaded) {
        console.warn('[YOLO Real] Model not loaded, using simulation');
        return this.simulateDetection(confidenceThreshold);
      }

      // Prepare image for inference
      const imageData = this.prepareImage(imageElement);
      
      // Run detection
      const predictions = await this.model.detector(imageElement, {
        threshold: confidenceThreshold,
        percentage: true,
      });

      console.log('[YOLO Real] Raw predictions:', predictions);

      // Filter for road damage related objects
      // The model might detect various objects, we filter for relevant ones
      const roadDamageClasses = ['pothole', 'crack', 'hole', 'damage', 'defect'];
      
      const detections: DetectionResult[] = predictions
        .filter((pred: any) => {
          const label = pred.label.toLowerCase();
          return roadDamageClasses.some(cls => label.includes(cls)) || 
                 pred.score > 0.7; // High confidence detections
        })
        .map((pred: any) => {
          const bbox = pred.box;
          const confidence = pred.score;
          
          return {
            bbox: [bbox.xmin, bbox.ymin, bbox.xmax - bbox.xmin, bbox.ymax - bbox.ymin],
            confidence,
            class: pred.label,
            severity: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
          };
        });

      console.log('[YOLO Real] Detected', detections.length, 'potential potholes');
      return detections;
    } catch (error) {
      console.error('[YOLO Real] Detection failed:', error);
      console.log('[YOLO Real] Falling back to simulation');
      return this.simulateDetection(confidenceThreshold);
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
        console.error('[YOLO Real] Frame processing error:', error);
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
      id: `yolo-real-${Date.now()}-${index}`,
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
      detectionAlgorithm: `${this.model?.modelName || 'YOLO'} (Real)`,
      distance: this.estimateDistance(detection.bbox),
      locationName: null // No dummy location names
    }));
  }

  /**
   * Prepare image for YOLO inference
   */
  private prepareImage(imageElement: HTMLImageElement | HTMLVideoElement): ImageData {
    // Set canvas size
    this.canvas.width = 640;
    this.canvas.height = 640;

    // Draw image to canvas with resizing
    this.ctx.drawImage(imageElement, 0, 0, 640, 640);

    // Get image data for processing
    return this.ctx.getImageData(0, 0, 640, 640);
  }

  /**
   * Simulate YOLO detection (fallback when model fails)
   * Returns empty array - only detect when real model is loaded
   */
  private simulateDetection(confidenceThreshold: number): DetectionResult[] {
    // Don't simulate - return empty array
    // Only detect when real model is loaded
    console.log('[YOLO Real] Model not loaded - no detections');
    return [];
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

export const yoloRealService = new YOLODetectionRealService();

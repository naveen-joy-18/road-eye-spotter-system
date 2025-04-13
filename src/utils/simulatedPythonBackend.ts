
/**
 * This file simulates a Python backend for pothole detection
 * In a real implementation, this would be an API that connects to a Python server
 */

import { toast } from 'sonner';

// Types for pothole detection
export type PotholeDetection = {
  timeInVideo: number; // seconds
  confidence: number;
  size: 'small' | 'medium' | 'large';
  severity: 'low' | 'medium' | 'high';
  location?: { lat: number; lng: number };
  distance?: number; // meters from current position
  locationName?: string; 
  frameNumber: number;
  pixelCoordinates: { x1: number; y1: number; x2: number; y2: number };
  surfaceDamageEstimate: number; // percentage of surface damaged
  depthEstimate: number; // estimated depth in cm
  detectionAlgorithm: 'YOLOv5' | 'Faster R-CNN' | 'EfficientDet' | 'SIFT' | 'PotholeNet';
  impactForce?: number; // estimated impact force in Newtons
  roadType?: string; // type of road (concrete, asphalt, etc)
  weatherConditions?: string; // current weather conditions
  timeToRepair?: number; // estimated time to repair in days
  vehicleRiskLevel?: number; // risk level for vehicles (1-10)
};

// Indian city/location names for simulation
const INDIAN_LOCATIONS = [
  "Connaught Place, Delhi",
  "MG Road, Bangalore",
  "Marine Drive, Mumbai",
  "Park Street, Kolkata",
  "Lal Darwaza, Hyderabad",
  "Anna Salai, Chennai",
  "FC Road, Pune",
  "Hazratganj, Lucknow",
  "Mall Road, Shimla",
  "MG Marg, Gangtok"
];

// Road types for simulation
const ROAD_TYPES = [
  "Asphalt",
  "Concrete",
  "Bitumen",
  "WBM (Water Bound Macadam)",
  "Gravel",
  "PMGSY Standard"
];

// Weather conditions for simulation
const WEATHER_CONDITIONS = [
  "Clear",
  "Rainy",
  "Post-rain",
  "Humid",
  "Hot",
  "Monsoon"
];

// Detection algorithms with weights (some more likely than others)
const DETECTION_ALGORITHMS = [
  { name: 'YOLOv5', weight: 0.4 },
  { name: 'Faster R-CNN', weight: 0.2 },
  { name: 'EfficientDet', weight: 0.1 },
  { name: 'SIFT', weight: 0.1 },
  { name: 'PotholeNet', weight: 0.2 }
];

// Specific locations with higher pothole probabilities (for more realistic patterns)
const HIGH_RISK_LOCATIONS = [
  { name: "MG Road, Bangalore", probability: 0.8, typicalSeverity: 'high' },
  { name: "Anna Salai, Chennai", probability: 0.75, typicalSeverity: 'medium' },
  { name: "Connaught Place, Delhi", probability: 0.6, typicalSeverity: 'medium' },
];

// Predictable patterns based on video time (more potholes in certain sections)
const getTimeProbability = (time: number, duration: number): number => {
  // More likely to find potholes in the middle section of the video
  if (time > duration * 0.3 && time < duration * 0.7) {
    return 0.7;
  } else if (time > duration * 0.7 && time < duration * 0.9) {
    return 0.5;
  }
  return 0.3;
};

/**
 * Simulates a Python backend processing a video file
 */
export const simulateVideoProcessing = (videoUrl: string, options: {
  sensitivityLevel: number,
  detectionThreshold: number,
  onProgress: (progress: number, stats: ProcessingStats) => void,
  onComplete: (detections: PotholeDetection[]) => void
}) => {
  let progress = 0;
  let cancellationToken = false;
  const processingInterval = setInterval(() => {
    if (cancellationToken) {
      clearInterval(processingInterval);
      return;
    }
    
    const randomIncrement = Math.random() * 2 + 0.5;
    progress += randomIncrement;
    
    // Calculate realistic processing stats
    const framesProcessed = Math.floor(progress * 30); // 30 frames per progress point
    const stats: ProcessingStats = {
      framesProcessed,
      framesPerSecond: 25 + Math.sin(progress / 10) * 5, // Fluctuating FPS between 20-30
      detectionAccuracy: Math.min(99, 70 + (progress / 3)), // Accuracy improves over time
      memoryUsage: 800 + Math.sin(progress / 5) * 200, // Memory usage fluctuates
      tensorflowStatus: 'Running',
      gpuUtilization: Math.min(100, 60 + Math.sin(progress / 7) * 20), // GPU usage between 40-80%
      modelName: getRandomModelName(),
      detectionEvents: Math.floor(progress / 10)
    };
    
    options.onProgress(Math.min(progress, 100), stats);
    
    if (progress >= 100) {
      clearInterval(processingInterval);
      console.log('[Python Backend] Processing complete');
      
      // Simulate Python generating detections
      const detections = generateRealisticDetections(videoUrl);
      
      // Simulate logs that would come from Python
      console.log(`[Python Backend] Detected ${detections.length} potholes`);
      console.log('[Python Backend] Model inference complete: ' + stats.modelName);
      console.log('[Python Backend] Accuracy metrics: Precision: 0.91, Recall: 0.87, F1-Score: 0.89');
      
      options.onComplete(detections);
    }
  }, 200);
  
  // Simulate Python backend log messages
  console.log(`[Python Backend] Starting video processing on ${videoUrl}`);
  console.log('[Python Backend] Loading TensorFlow model: ' + getRandomModelName());
  console.log('[Python Backend] GPU acceleration enabled');
  console.log('[Python Backend] Processing with sensitivity level:', options.sensitivityLevel);

  // Return a function to cancel processing
  return {
    cancel: () => {
      cancellationToken = true;
      console.log('[Python Backend] Processing cancelled');
    }
  };
};

function getRandomModelName() {
  const models = [
    "PotholeNet-v3.4",
    "RoadDamageDetector-v2.1",
    "YOLO-Pothole-v4.5",
    "InfraSense-v1.2",
    "UrbanRoad-QualityNet"
  ];
  return models[Math.floor(Math.random() * models.length)];
}

export interface ProcessingStats {
  framesProcessed: number;
  framesPerSecond: number;
  detectionAccuracy: number;
  memoryUsage: number;
  tensorflowStatus: string;
  gpuUtilization: number;
  modelName: string;
  detectionEvents: number;
}

/**
 * Generates realistic pothole detections for a given video
 */
const generateRealisticDetections = (videoUrl: string): PotholeDetection[] => {
  // Simulate different numbers of detections based on video
  const isDemoVideo = videoUrl.includes('ForBiggerBlazes');
  const videoDuration = isDemoVideo ? 30 : 60; // seconds
  
  // Determine number of detections based on demo or uploaded video
  const numDetections = isDemoVideo ? 
    8 : // Fixed number for consistent demo
    Math.floor(Math.random() * 6) + 5; // Random for uploaded videos
    
  const detections: PotholeDetection[] = [];
  
  // For demo video, create predictable/repeatable pattern
  if (isDemoVideo) {
    // Create specific timed detections for the demo video
    const demoDetections = [
      { time: 3.5, severity: 'low', size: 'small', location: 'MG Road, Bangalore' },
      { time: 7.2, severity: 'medium', size: 'medium', location: 'Connaught Place, Delhi' },
      { time: 11.5, severity: 'low', size: 'small', location: 'FC Road, Pune' },
      { time: 15.0, severity: 'high', size: 'large', location: 'Anna Salai, Chennai' },
      { time: 18.3, severity: 'medium', size: 'medium', location: 'Park Street, Kolkata' },
      { time: 21.7, severity: 'high', size: 'large', location: 'Marine Drive, Mumbai' },
      { time: 24.8, severity: 'medium', size: 'small', location: 'Lal Darwaza, Hyderabad' },
      { time: 27.5, severity: 'low', size: 'small', location: 'Hazratganj, Lucknow' }
    ];
    
    demoDetections.forEach((demo, i) => {
      // Select algorithm using weighted random
      const algorithmRand = Math.random();
      let algorithm: 'YOLOv5' | 'Faster R-CNN' | 'EfficientDet' | 'SIFT' | 'PotholeNet' = 'YOLOv5';
      let cumWeight = 0;
      
      for (const alg of DETECTION_ALGORITHMS) {
        cumWeight += alg.weight;
        if (algorithmRand <= cumWeight) {
          algorithm = alg.name as 'YOLOv5' | 'Faster R-CNN' | 'EfficientDet' | 'SIFT' | 'PotholeNet';
          break;
        }
      }

      // Create detection with detailed attributes
      detections.push({
        timeInVideo: demo.time,
        confidence: 0.75 + (Math.random() * 0.2),
        size: demo.size as 'small' | 'medium' | 'large',
        severity: demo.severity as 'low' | 'medium' | 'high',
        location: {
          lat: 20.5937 + (Math.random() - 0.5) * 5,
          lng: 78.9629 + (Math.random() - 0.5) * 5
        },
        distance: Math.floor(Math.random() * 80) + 10,
        locationName: demo.location,
        frameNumber: Math.floor(demo.time * 30), // Assuming 30fps
        pixelCoordinates: {
          x1: Math.floor(Math.random() * 300) + 100,
          y1: Math.floor(Math.random() * 200) + 100,
          x2: Math.floor(Math.random() * 100) + 400,
          y2: Math.floor(Math.random() * 100) + 300,
        },
        surfaceDamageEstimate: Math.floor(Math.random() * 30) + 10,
        depthEstimate: Math.floor(Math.random() * 10) + 1,
        detectionAlgorithm: algorithm,
        impactForce: Math.floor(Math.random() * 1000) + 500,
        roadType: ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)],
        weatherConditions: WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)],
        timeToRepair: Math.floor(Math.random() * 30) + 1,
        vehicleRiskLevel: Math.floor(Math.random() * 10) + 1
      });
    });
  } else {
    // For uploaded videos, spread detections throughout
    for (let i = 0; i < numDetections; i++) {
      const baseTime = (i / numDetections) * videoDuration;
      const timeVariation = (videoDuration / numDetections) * 0.5;
      const timeInVideo = baseTime + (Math.random() * timeVariation);
      
      // Location selection logic with bias toward high-risk areas
      let locationName = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
      let severityBias = 0;
      
      // Check if this is a high-risk location
      const highRiskLocation = HIGH_RISK_LOCATIONS.find(loc => loc.name === locationName);
      if (highRiskLocation && Math.random() < highRiskLocation.probability) {
        // Use the typical severity for this location
        severityBias = highRiskLocation.typicalSeverity === 'high' ? 2 : 
                       highRiskLocation.typicalSeverity === 'medium' ? 1 : 0;
      }
      
      // Time-based probability adjustment
      if (Math.random() < getTimeProbability(timeInVideo, videoDuration)) {
        severityBias += 1;
      }
      
      const severityIndex = Math.min(2, Math.floor(Math.random() * 3) + severityBias);
      const sizeIndex = Math.min(2, Math.floor(Math.random() * 3) + (severityIndex > 1 ? 1 : 0));
      
      // Select algorithm using weighted random
      const algorithmRand = Math.random();
      let algorithm: 'YOLOv5' | 'Faster R-CNN' | 'EfficientDet' | 'SIFT' | 'PotholeNet' = 'YOLOv5';
      let cumWeight = 0;
      
      for (const alg of DETECTION_ALGORITHMS) {
        cumWeight += alg.weight;
        if (algorithmRand <= cumWeight) {
          algorithm = alg.name as 'YOLOv5' | 'Faster R-CNN' | 'EfficientDet' | 'SIFT' | 'PotholeNet';
          break;
        }
      }
      
      // Map indices to values
      const sizes = ['small', 'medium', 'large'] as const;
      const severities = ['low', 'medium', 'high'] as const;
      
      detections.push({
        timeInVideo,
        confidence: 0.7 + (Math.random() * 0.3),
        size: sizes[sizeIndex],
        severity: severities[severityIndex],
        location: {
          // Indian approximate lat/lng coordinates
          lat: 20.5937 + (Math.random() - 0.5) * 10,
          lng: 78.9629 + (Math.random() - 0.5) * 10
        },
        distance: Math.floor(Math.random() * 100) + 10,
        locationName,
        frameNumber: Math.floor(timeInVideo * 30), // Assuming 30fps
        pixelCoordinates: {
          x1: Math.floor(Math.random() * 300) + 100,
          y1: Math.floor(Math.random() * 200) + 100,
          x2: Math.floor(Math.random() * 100) + 400,
          y2: Math.floor(Math.random() * 100) + 300,
        },
        surfaceDamageEstimate: Math.floor(Math.random() * 30) + 10,
        depthEstimate: Math.floor(Math.random() * 10) + 1,
        detectionAlgorithm: algorithm,
        impactForce: Math.floor(Math.random() * 1000) + 500,
        roadType: ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)],
        weatherConditions: WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)],
        timeToRepair: Math.floor(Math.random() * 30) + 1,
        vehicleRiskLevel: Math.floor(Math.random() * 10) + 1
      });
    }
  }
  
  // Sort by time
  detections.sort((a, b) => a.timeInVideo - b.timeInVideo);
  return detections;
};

/**
 * Simulate Python real-time analysis on a running video
 */
export const simulateRealTimeAnalysis = (
  currentTime: number, 
  detections: PotholeDetection[],
  onDetection: (detection: PotholeDetection) => void
) => {
  // Find detections that match the current time (with a small buffer)
  const timeBuffer = 0.5;
  const currentDetections = detections.filter(d => {
    return Math.abs(d.timeInVideo - currentTime) < timeBuffer;
  });
  
  // Return detections that should be triggered
  if (currentDetections.length > 0) {
    currentDetections.forEach(detection => {
      console.log(`[Python Backend] Detection event at ${currentTime.toFixed(2)}s - ${detection.severity} pothole`);
      console.log(`[Python Backend] Detection confidence: ${(detection.confidence * 100).toFixed(1)}%`);
      console.log(`[Python Backend] Algorithm used: ${detection.detectionAlgorithm}`);
      console.log(`[Python Backend] Road type: ${detection.roadType}, Weather: ${detection.weatherConditions}`);
      console.log(`[Python Backend] Vehicle risk level: ${detection.vehicleRiskLevel}/10`);
      onDetection(detection);
    });
  }
  
  return currentDetections;
};

/**
 * Generate Python-style console output for processing
 */
export const generatePythonConsoleOutput = (progress: number): string => {
  const outputs = [
    "[INFO] Processing frame {frame_num}...",
    "[INFO] Batch processing complete: {frames} frames",
    "[DEBUG] GPU memory usage: {memory}MB",
    "[INFO] Detection confidence threshold: {threshold}%",
    "[DEBUG] Model inference time: {time}ms per frame",
    "[INFO] Road surface analysis complete for segment {segment}",
    "[DEBUG] Running non-maximum suppression on detections",
    "[INFO] Found {pothole_count} potential road anomalies",
    "[DEBUG] Applying texture analysis to frame {frame_num}",
    "[INFO] Weather condition detected: {weather}",
    "[DEBUG] Road type classification: {road_type}"
  ];
  
  const weathers = ["Clear", "Rainy", "Overcast", "Sunny", "Post-rain"];
  const roadTypes = ["Asphalt", "Concrete", "Bitumen", "Gravel", "WBM"];
  
  // Select a random output format and fill in the variables
  const output = outputs[Math.floor(Math.random() * outputs.length)]
    .replace("{frame_num}", Math.floor(progress * 30).toString())
    .replace("{frames}", Math.floor(Math.random() * 30 + 20).toString())
    .replace("{memory}", (800 + Math.random() * 200).toFixed(1))
    .replace("{threshold}", (65 + Math.random() * 10).toFixed(1))
    .replace("{time}", (15 + Math.random() * 10).toFixed(1))
    .replace("{segment}", Math.floor(progress / 10).toString())
    .replace("{pothole_count}", (Math.floor(Math.random() * 5) + 1).toString())
    .replace("{weather}", weathers[Math.floor(Math.random() * weathers.length)])
    .replace("{road_type}", roadTypes[Math.floor(Math.random() * roadTypes.length)]);
    
  return output;
};

/**
 * Simulate Python terminal output for display in the UI
 */
export const generatePythonTerminalOutput = (frameCount: number): string[] => {
  const outputs = [
    `[Frame ${frameCount}] Processing with ${DETECTION_ALGORITHMS[Math.floor(Math.random() * DETECTION_ALGORITHMS.length)].name}...`,
    `[INFO] Detected objects: ${Math.floor(Math.random() * 3)}`,
    `[DEBUG] Inference time: ${(15 + Math.random() * 10).toFixed(1)}ms`,
    `[INFO] Applying spatial filtering to detections`,
    `[DEBUG] GPU memory: ${(800 + Math.random() * 200).toFixed(0)}MB / 4096MB`,
    `[INFO] Road segmentation complete`,
    `[DEBUG] Batch size: 16, Processing efficiency: ${(85 + Math.random() * 10).toFixed(1)}%`,
    `[INFO] Running feature extraction on frame regions...`,
    `[DEBUG] TensorFlow operations dispatched to GPU`,
    `[WARN] Low confidence detection filtered: ${(30 + Math.random() * 20).toFixed(1)}%`,
    `[INFO] Surface texture analysis: ${(Math.random() * 100).toFixed(1)} roughness index`,
    `[DEBUG] Calculating pothole depth using stereo vision: ${(Math.random() * 10).toFixed(1)}cm`,
    `[INFO] Weather condition detected: ${WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)]}`,
    `[DEBUG] Road type detected: ${ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)]}`,
    `[INFO] Running semantic segmentation on frame ${frameCount}`,
    `[DEBUG] Vehicle detection: ${Math.random() > 0.5 ? 'True' : 'False'}`,
    `[INFO] Impact force estimation: ${(Math.random() * 1000 + 500).toFixed(1)}N`
  ];
  
  // Return a subset of outputs to simulate terminal scrolling
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 lines at once
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * outputs.length);
    result.push(outputs[idx]);
  }
  
  return result;
};

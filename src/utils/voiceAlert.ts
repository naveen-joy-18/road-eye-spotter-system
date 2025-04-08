
/**
 * Utility functions for text-to-speech driver alerts
 */

export type VoiceAlertOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
};

export type AlertSeverity = 'low' | 'medium' | 'high';

export const speakAlert = (text: string, options?: VoiceAlertOptions) => {
  // Check if browser supports speech synthesis
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default voice settings
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;
    
    // Set voice if specified
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to use a more natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') ||
        voice.name.includes('Premium')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    return true;
  }
  
  // Speech synthesis not supported
  console.warn('Text-to-speech is not supported in this browser');
  return false;
};

export const cancelSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    return true;
  }
  return false;
};

export const pauseSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
    return true;
  }
  return false;
};

export const resumeSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
    return true;
  }
  return false;
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};

/**
 * Checks if speech synthesis is currently speaking
 */
export const isSpeaking = (): boolean => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

/**
 * Speaks alert with severity-appropriate voice settings
 */
export const speakAlertWithSeverity = (text: string, severity: AlertSeverity) => {
  const options: VoiceAlertOptions = {
    rate: severity === 'high' ? 1.2 : severity === 'medium' ? 1.1 : 1.0,
    pitch: severity === 'high' ? 1.2 : severity === 'medium' ? 1.1 : 1.0,
    volume: severity === 'high' ? 1.0 : severity === 'medium' ? 0.9 : 0.8,
  };
  
  return speakAlert(text, options);
};

/**
 * Speaks alert with distance-appropriate urgency
 * @param text The text to speak
 * @param distanceInMeters Distance to the hazard in meters
 * @param severityLevel Optional severity level to adjust the tone
 */
export const speakDistanceAlert = (text: string, distanceInMeters: number, severityLevel?: AlertSeverity) => {
  let rate = 1.0;
  let pitch = 1.0;
  let volume = 0.8;
  
  // Adjust based on distance
  if (distanceInMeters < 30) {
    // Very close - urgent
    rate = 1.3;
    pitch = 1.3;
    volume = 1.0;
  } else if (distanceInMeters < 100) {
    // Medium distance - moderately urgent
    rate = 1.1;
    pitch = 1.1;
    volume = 0.9;
  }
  
  // Further adjust based on severity if provided
  if (severityLevel === 'high') {
    rate += 0.1;
    pitch += 0.1;
    volume = 1.0;
  } else if (severityLevel === 'low') {
    rate -= 0.1;
    pitch -= 0.1;
  }
  
  return speakAlert(text, { rate, pitch, volume });
};

/**
 * Speaks alert with custom sound effects before or after the alert
 * @param text The text to speak
 * @param effectType The type of sound effect to play ('warning', 'notification', 'caution')
 * @param options Additional speech options
 */
export const speakAlertWithEffect = (
  text: string, 
  effectType: 'warning' | 'notification' | 'caution',
  options?: VoiceAlertOptions
) => {
  // In a real implementation, this would play actual sound effects
  // Here we just simulate it with specific alert texts
  
  let alertPrefix = '';
  
  switch (effectType) {
    case 'warning':
      alertPrefix = 'Warning! ';
      break;
    case 'notification':
      alertPrefix = 'Notice. ';
      break;
    case 'caution':
      alertPrefix = 'Caution. ';
      break;
  }
  
  return speakAlert(alertPrefix + text, options);
};

/**
 * Queue multiple alerts to be spoken in sequence
 * @param alerts Array of text to speak and their options
 */
export const queueAlerts = (alerts: Array<{ text: string, options?: VoiceAlertOptions }>) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech is not supported in this browser');
    return false;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Create and queue all utterances
  alerts.forEach(({ text, options }) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options if provided
    if (options) {
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      if (options.voice) {
        utterance.voice = options.voice;
      }
    }
    
    // Queue this utterance
    window.speechSynthesis.speak(utterance);
  });
  
  return true;
};

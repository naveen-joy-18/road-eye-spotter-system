
/**
 * Utility functions for text-to-speech driver alerts
 */

export const speakAlert = (text: string, options?: SpeechSynthesisUtterance) => {
  // Check if browser supports speech synthesis
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Apply any custom options
    if (options) {
      Object.assign(utterance, options);
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

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};

/**
 * Speaks alert with severity-appropriate voice settings
 */
export const speakAlertWithSeverity = (text: string, severity: 'low' | 'medium' | 'high') => {
  const options: Partial<SpeechSynthesisUtterance> = {
    rate: severity === 'high' ? 1.2 : 1.0,
    pitch: severity === 'high' ? 1.2 : 1.0,
    volume: severity === 'high' ? 1.0 : 0.8,
  };
  
  return speakAlert(text, options as SpeechSynthesisUtterance);
};


/**
 * Cerebras AI API service for pothole detection and chatbot
 */
import { toast } from "sonner";

// API key should ideally come from environment variables
const API_KEY = "csk-5dfccvdv9eccpv8jftx2fne5w22vfxhcwr9cndtck924f9cy";

/**
 * Interface for chat message structure
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Process a video frame for pothole detection using Cerebras AI
 */
export async function detectPotholesInFrame(
  frameData: string,
  frameNumber: number
): Promise<any> {
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: "You are a specialized pothole detection AI. Analyze the video frame data and return JSON with pothole information including location, size, severity, and confidence level."
          },
          {
            role: "user",
            content: `Analyze this video frame data for potholes: ${frameData.substring(0, 100)}... (Frame #${frameNumber})`
          }
        ],
        max_completion_tokens: 1024,
        temperature: 0.2,
        top_p: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error detecting potholes:", error);
    return null;
  }
}

/**
 * Execute Python-like command using Cerebras AI
 */
export async function executePythonCommand(command: string): Promise<string[]> {
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: "You are a Python interpreter for pothole detection. Generate realistic terminal output for the given Python commands related to video analysis and pothole detection."
          },
          {
            role: "user",
            content: command
          }
        ],
        max_completion_tokens: 512,
        temperature: 0.2,
        top_p: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.choices[0]?.message?.content || "No output generated";
    
    // Split by newlines to create array of terminal lines
    return output.split("\n");
  } catch (error) {
    console.error("Error executing Python command:", error);
    return ["Error: Failed to execute command"];
  }
}

/**
 * Get chat response from Cerebras AI
 */
export async function getPotholeAIResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: "You are a pothole expert AI assistant helping users understand road damage, pothole detection, and prevention methods. Provide informative, accurate and concise responses about pothole-related topics. Include technical details when appropriate."
          },
          ...messages
        ],
        stream: false,
        max_completion_tokens: 1024,
        temperature: 0.2,
        top_p: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error getting AI response:", error);
    toast.error("Failed to get AI response");
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
}

/**
 * Stream chat response from Cerebras AI 
 */
export async function streamPotholeAIResponse(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: "You are a pothole expert AI assistant helping users understand road damage, pothole detection, and prevention methods. Provide informative, accurate and concise responses about pothole-related topics. Include technical details when appropriate."
          },
          ...messages
        ],
        stream: true,
        max_completion_tokens: 2048,
        temperature: 0.2,
        top_p: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse the SSE data
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr === '[DONE]') {
              break;
            }
            
            try {
              const jsonData = JSON.parse(jsonStr);
              const content = jsonData.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    }
    
    onComplete();
  } catch (error) {
    console.error("Error streaming AI response:", error);
    onError(error as Error);
  }
}


/**
 * Service to generate 3D mesh models from pothole images using AIML API
 */

import { toast } from "sonner";

// The API key should ideally be stored in a more secure way
// For demo purposes, we'll use a hardcoded key
const AIML_API_KEY = "d9368702f89c4c488e8f44c7e9f43082";

interface MeshGenerationResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
  imageUrl?: string;
}

/**
 * Generate a 3D mesh from an image using AIML API
 * @param imageUrl - URL of the image to generate 3D mesh from
 * @returns Promise with mesh generation result
 */
export const generate3DMesh = async (imageUrl: string): Promise<MeshGenerationResult> => {
  try {
    console.log("Generating 3D mesh for image:", imageUrl);
    
    const response = await fetch("https://api.aimlapi.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "triposr",
        image_url: imageUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API error response:", errorData);
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.model_mesh || !data.model_mesh.url) {
      return {
        success: false,
        error: "No mesh URL returned from API"
      };
    }
    
    const meshUrl = data.model_mesh.url;
    const fileName = data.model_mesh.file_name || "pothole-mesh.glb";

    // In a real application, we might download and store the mesh file
    // For this demo, we'll just return the URL
    return {
      success: true,
      url: meshUrl,
      fileName: fileName,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Error generating 3D mesh:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Download a 3D mesh file from URL
 * @param url - URL of the mesh file
 * @param fileName - Name to save the file as
 */
export const downloadMeshFile = async (url: string, fileName: string): Promise<boolean> => {
  try {
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error("Error downloading mesh file:", error);
    toast.error("Failed to download 3D model");
    return false;
  }
};

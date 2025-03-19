import { json, type ActionFunctionArgs } from "@remix-run/node";
import path from "path";
import fs from "fs";

/**
 * Mock API endpoint for handling file uploads locally without Google Cloud Storage
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Only allow PUT requests
    if (request.method !== "PUT") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const fileName = url.searchParams.get("fileName");
    const contentType = url.searchParams.get("contentType");
    
    if (!fileName || !contentType) {
      return json({ error: "Missing fileName or contentType" }, { status: 400 });
    }
    
    // In a real implementation, this would store the file in Google Cloud Storage
    // For testing purposes, we'll just log that we received the file
    console.log(`[MOCK] Received file: ${fileName}, type: ${contentType}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // For a real implementation, we'd save the file here
    // For mock purposes, we just pretend we saved it
    
    return json({ 
      success: true,
      fileUrl: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error("Error handling mock upload:", error);
    return json({ 
      error: "Failed to handle mock upload" 
    }, { status: 500 });
  }
} 
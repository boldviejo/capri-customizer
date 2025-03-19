import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getSignedUploadUrl } from "~/utils/storage.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Only allow POST requests
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    
    // Get request body
    const body = await request.json();
    const { fileName, contentType } = body;
    
    if (!fileName || !contentType) {
      return json({ error: "Missing fileName or contentType" }, { status: 400 });
    }
    
    // Add timestamp and random string to avoid name collisions
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniqueFileName = `${timestamp}-${randomString}-${fileName}`;
    
    // Generate signed URL
    const { uploadUrl, fileUrl } = await getSignedUploadUrl(uniqueFileName, contentType);
    
    return json({ 
      success: true, 
      uploadUrl,
      fileUrl
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return json({ 
      error: "Failed to generate upload URL" 
    }, { status: 500 });
  }
} 
/**
 * Mock implementation of the storage server for local development
 * Use this for testing without a Google Cloud account
 */

/**
 * Generates a fake signed URL for uploading an image
 * @param fileName - The name of the file to create
 * @param contentType - The content type of the file
 * @returns A mock signed URL and file URL
 */
export async function getSignedUploadUrl(fileName: string, contentType: string) {
  console.log(`[MOCK] Generating signed URL for file: ${fileName}, type: ${contentType}`);
  
  // In a real implementation, this would generate a signed URL for Google Cloud Storage
  // For testing purposes, we'll create a mock response
  const mockUploadUrl = `/api/mock-upload?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
  const mockFileUrl = `/uploads/${fileName}`;
  
  return {
    uploadUrl: mockUploadUrl,
    fileUrl: mockFileUrl
  };
}

/**
 * Mock implementation of making an image public
 * @param fileName - The name of the file to make public
 * @returns The mock public URL of the file
 */
export async function makeImagePublic(fileName: string) {
  console.log(`[MOCK] Making file public: ${fileName}`);
  
  // In a real implementation, this would update permissions on the GCS object
  // For mock purposes, we just return a URL
  return `/uploads/${fileName}`;
} 
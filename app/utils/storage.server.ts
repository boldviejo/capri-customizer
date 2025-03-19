import { Storage } from '@google-cloud/storage';
import * as mockStorage from './storage.server.mock';

const isDevelopment = process.env.NODE_ENV === 'development';
const useMockStorage = process.env.USE_MOCK_STORAGE === 'true';

// Initialize storage with credentials
let storage: Storage;

try {
  if (isDevelopment || useMockStorage) {
    console.log('[STORAGE] Using mock implementation');
    // In development or when mock is explicitly enabled, use the mock implementation
    storage = null as any;
  } else {
    // In production, use credentials from environment or service account
    storage = new Storage();
  }
} catch (error) {
  console.error('Failed to initialize Google Cloud Storage:', error);
  // Fallback to a mock storage implementation
  storage = null as any;
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'capri-customizer-images';

/**
 * Generates a signed URL for uploading an image directly to Google Cloud Storage
 * @param fileName - The name of the file to create
 * @param contentType - The content type of the file
 * @returns A signed URL for uploading
 */
export async function getSignedUploadUrl(fileName: string, contentType: string) {
  // In development, when mock is enabled, or if initialization failed, use mock implementation
  if (isDevelopment || useMockStorage || !storage) {
    return mockStorage.getSignedUploadUrl(fileName, contentType);
  }

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);
    
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType
    });
    
    return {
      uploadUrl: url,
      fileUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`
    };
  } catch (error) {
    console.error('Failed to get signed URL:', error);
    throw new Error('Failed to initialize image upload');
  }
}

/**
 * Makes an image public after it has been uploaded
 * @param fileName - The name of the file to make public
 * @returns The public URL of the file
 */
export async function makeImagePublic(fileName: string) {
  // In development, when mock is enabled, or if initialization failed, use mock implementation
  if (isDevelopment || useMockStorage || !storage) {
    return mockStorage.makeImagePublic(fileName);
  }

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);
    
    await file.makePublic();
    
    return `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('Failed to make image public:', error);
    throw new Error('Failed to publish image');
  }
} 
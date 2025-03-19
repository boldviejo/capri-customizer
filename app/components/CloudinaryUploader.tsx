import { useEffect, useRef, useState } from 'react';
import { Box, Text, Button } from '@shopify/polaris';

/**
 * CloudinaryUploader - A component for uploading and cropping pet photos using Cloudinary
 * 
 * @param {Object} props
 * @param {string} props.cloudName - Your Cloudinary cloud name
 * @param {string} props.uploadPreset - Your Cloudinary upload preset for unsigned uploads
 * @param {Function} props.onImageUploaded - Callback function that receives the uploaded image URL
 * @param {Function} props.onUploadError - Callback function that receives any upload errors
 */

interface CloudinaryUploaderProps {
  cloudName: string;
  uploadPreset: string;
  onImageUploaded: (url: string) => void;
  onUploadError?: (error: any) => void;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUploader({ 
  cloudName, 
  uploadPreset, 
  onImageUploaded, 
  onUploadError 
}: CloudinaryUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const cloudinaryScript = useRef<HTMLScriptElement | null>(null);

  // Load the Cloudinary script when component mounts
  useEffect(() => {
    if (!cloudinaryScript.current) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = createUploadWidget;
      document.body.appendChild(script);
      cloudinaryScript.current = script;
    } else {
      createUploadWidget();
    }

    return () => {
      if (cloudinaryScript.current) {
        document.body.removeChild(cloudinaryScript.current);
        cloudinaryScript.current = null;
      }
    };
  }, [cloudName, uploadPreset]);

  const createUploadWidget = () => {
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          cropping: true, // Enable built-in cropping
          croppingAspectRatio: 1, // Square crop for pet portraits
          croppingDefaultSelectionRatio: 0.8, // Default selection area
          croppingShowDimensions: true, // Show pixel dimensions
          croppingCoordinatesMode: 'custom', // Allow custom selection
          maxImageWidth: 2000, // Limit image size
          maxImageHeight: 2000,
          maxFileSize: 10000000, // 10MB
          sources: ['local', 'url', 'camera'], // Upload sources
          resourceType: 'image',
          allowedFormats: ['jpg', 'jpeg', 'png', 'gif'], // Image types
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#F4F4F5'
            },
            fonts: {
              default: null,
              "'Poppins', sans-serif": {
                url: 'https://fonts.googleapis.com/css?family=Poppins',
                active: true
              }
            }
          },
          text: {
            en: {
              menu: {
                files: 'My Device',
                url: 'Web Address',
                camera: 'Camera'
              },
              local: {
                browse: 'Browse Files',
                dd_title_single: 'Drag and Drop your pet photo here',
                drop_title_single: 'Drop your photo here'
              },
              queue: {
                title: 'Upload Pet Photo',
                ti_instructions: 'Crop your pet photo to highlight their face'
              },
              crop: {
                title: 'Crop Your Pet Photo',
                crop_btn: 'Crop',
                skip_btn: 'Skip',
                reset_btn: 'Reset',
                close_btn: 'Close'
              }
            }
          }
        },
        (error: any, result: any) => {
          setIsUploading(false);
          if (error) {
            console.error('Upload error:', error);
            if (onUploadError) onUploadError(error);
            return;
          }
          
          if (result.event === 'success') {
            const secureUrl = result.info.secure_url;
            setImageUrl(secureUrl);
            if (onImageUploaded) onImageUploaded(secureUrl);
          }
        }
      );
      
      setUploadWidget(widget);
    }
  };

  const handleUploadClick = () => {
    if (uploadWidget) {
      setIsUploading(true);
      uploadWidget.open();
    }
  };

  return (
    <Box padding="400">
      <Box paddingBlockEnd="400">
        <Text variant="headingMd" as="h2">Pet Photo</Text>
        <Text variant="bodyMd" as="p">
          Upload a clear photo of your pet for the portrait
        </Text>
      </Box>
      
      {imageUrl ? (
        <Box>
          <Box paddingBlockEnd="400">
            <div
              style={{
                width: '100%',
                maxWidth: '300px',
                aspectRatio: '1/1',
                borderRadius: '8px',
                overflow: 'hidden',
                margin: '0 auto'
              }}
            >
              <img 
                src={imageUrl} 
                alt="Your pet" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }} 
              />
            </div>
          </Box>
          <Box>
            <Button onClick={handleUploadClick}>
              Change Photo
            </Button>
          </Box>
        </Box>
      ) : (
        <Button 
          onClick={handleUploadClick}
          variant="primary"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Your Pet Photo'}
        </Button>
      )}
    </Box>
  );
} 
import { useState } from 'react';
import { Page, Card, Form, TextField, Select, Button, Box, Divider } from '@shopify/polaris';
import CloudinaryUploader from './CloudinaryUploader';

// These would come from your environment variables
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = 'Capri Customizer';

export default function PetPortraitCustomizer() {
  // Form state
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [petPhotoUrl, setPetPhotoUrl] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [variants, setVariants] = useState([
    { label: 'Small (8x8")', value: '12345678' },
    { label: 'Medium (12x12")', value: '23456789' },
    { label: 'Large (16x16")', value: '34567890' },
  ]);
  
  // Form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate required fields
    if (!customText || !selectedVariantId || !petPhotoUrl) {
      alert('Please complete all required fields, including uploading a pet photo.');
      return;
    }
    
    try {
      // In a real implementation, this would use the Shopify Storefront API or AJAX
      // to add the item to the cart with line item properties
      
      // Build the cart data with line item properties
      const cartData = {
        items: [{
          id: selectedVariantId,
          quantity: 1,
          properties: {
            'Custom Text': customText,
            'Font': fontFamily,
            'Font Size': fontSize.toString(),
            'Text Color': textColor,
            'Pet Photo URL': petPhotoUrl,
          }
        }]
      };
      
      console.log('Cart data to be submitted:', cartData);
      
      // Add to cart via AJAX (example)
      /*
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
      })
      .then(response => response.json())
      .then(data => {
        // Redirect to the cart or show success message
        window.location.href = '/cart';
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
      });
      */
      
      // For this example, just show success
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an error adding the item to your cart.');
    }
  };
  
  // Handle the uploaded image URL from CloudinaryUploader
  const handleImageUploaded = (imageUrl) => {
    console.log('Pet photo uploaded:', imageUrl);
    setPetPhotoUrl(imageUrl);
  };
  
  // Handle any upload errors
  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    alert('There was an error uploading your pet photo. Please try again.');
  };
  
  return (
    <Page title="Customize Your Pet Portrait">
      <Card>
        <Form onSubmit={handleSubmit}>
          <Box padding="400">
            <Select
              label="Size"
              options={variants}
              value={selectedVariantId}
              onChange={setSelectedVariantId}
              requiredIndicator
            />
          </Box>
          
          <Divider />
          
          <CloudinaryUploader
            cloudName={CLOUDINARY_CLOUD_NAME}
            uploadPreset={CLOUDINARY_UPLOAD_PRESET}
            onImageUploaded={handleImageUploaded}
            onUploadError={handleUploadError}
          />
          
          <Divider />
          
          <Box padding="400">
            <TextField
              label="Custom Text"
              value={customText}
              onChange={setCustomText}
              helpText="Enter the text to appear on your pet portrait"
              requiredIndicator
            />
          </Box>
          
          <Box padding="400">
            <Select
              label="Font"
              options={[
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Comic Sans MS', value: 'Comic Sans MS' },
              ]}
              value={fontFamily}
              onChange={setFontFamily}
            />
          </Box>
          
          <Box padding="400">
            <Select
              label="Font Size"
              options={[
                { label: 'Small', value: 12 },
                { label: 'Medium', value: 16 },
                { label: 'Large', value: 24 },
              ]}
              value={fontSize}
              onChange={(value) => setFontSize(parseInt(value))}
            />
          </Box>
          
          <Box padding="400">
            <div>
              <label htmlFor="textColor">Text Color</label>
              <div style={{ marginTop: '8px' }}>
                <input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>
            </div>
          </Box>
          
          <Box padding="400">
            <Button primary fullWidth submit disabled={!customText || !selectedVariantId || !petPhotoUrl}>
              Add to Cart
            </Button>
          </Box>
        </Form>
      </Card>
      
      {petPhotoUrl && customText && (
        <Card title="Preview" sectioned>
          <Box padding="400">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '300px', 
                height: '300px', 
                backgroundImage: `url(${petPhotoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                position: 'relative',
                marginBottom: '16px'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '0',
                  right: '0',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  padding: '10px',
                  textAlign: 'center',
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  color: textColor
                }}>
                  {customText}
                </div>
              </div>
              <p>This is how your pet portrait will look</p>
            </div>
          </Box>
        </Card>
      )}
    </Page>
  );
} 
# Integrating Cloudinary with the Existing Customizer

This guide explains how to integrate the CloudinaryUploader component with your existing Pet Portrait customizer code.

## Installation

First, install the necessary packages:

```bash
npm install @cloudinary/url-gen @cloudinary/react
```

## Environment Setup

Add Cloudinary credentials to your environment variables in `.env`:

```
CLOUDINARY_CLOUD_NAME=dqnlrk9jl
CLOUDINARY_UPLOAD_PRESET=capricustomizer
```

## Integration Steps

1. **Import the CloudinaryUploader Component**

Import the CloudinaryUploader component in your customizer file:

```jsx
import CloudinaryUploader from '../../components/CloudinaryUploader';
```

2. **Add State for Pet Photo URL**

Add a state variable to track the uploaded photo URL:

```jsx
const [petPhotoUrl, setPetPhotoUrl] = useState('');
```

3. **Add Image URL to Form Submission**

Modify your form submission to include the pet photo URL as a line item property:

```jsx
// Current form submission code
formData.append("text", customText);
formData.append("fontFamily", fontFamily);
formData.append("fontSize", fontSize.toString());
formData.append("color", color);
formData.append("variantId", selectedVariantId);

// Add the pet photo URL
formData.append("petPhotoUrl", petPhotoUrl);
```

4. **Update Server-Side Action Handler**

Update your server-side action handler (in the same file) to process the pet photo URL:

```jsx
// Inside the action function
const text = formData.get("text");
const fontFamily = formData.get("fontFamily");
const fontSize = formData.get("fontSize");
const color = formData.get("color");
const variantId = formData.get("variantId");
const petPhotoUrl = formData.get("petPhotoUrl"); // Get the pet photo URL

// When building the response data:
return {
  success: true,
  customizationData: {
    text,
    fontFamily,
    fontSize,
    color,
    variantId,
    petPhotoUrl, // Include pet photo URL in the response
    shopifyDomain: getShopifyDomain()
  }
};
```

5. **Update the Bridge Template**

When building the bridge URL, include the pet photo URL parameter:

```jsx
const bridgeUrl = `https://${domain}/pages/add-to-cart-bridge?` + 
  `variant_id=${encodeURIComponent(data.variantId)}&` +
  `custom_text=${encodeURIComponent(data.text || '')}&` +
  `font_family=${encodeURIComponent(data.fontFamily || '')}&` +
  `font_size=${encodeURIComponent(data.fontSize || '')}&` +
  `text_color=${encodeURIComponent(data.color || '')}&` +
  `pet_photo_url=${encodeURIComponent(data.petPhotoUrl || '')}&` +
  `return_url=${encodeURIComponent(returnUrl)}`;
```

6. **Update Shopify Bridge Template**

Update your `page.add-to-cart-bridge.liquid` template to handle the pet photo URL:

```javascript
// Get parameters from URL
const variantId = getParam('variant_id');
const customText = getParam('custom_text');
const fontFamily = getParam('font_family');
const fontSize = getParam('font_size');
const textColor = getParam('text_color');
const petPhotoUrl = getParam('pet_photo_url'); // Add this line

// Build properties object for line item
const properties = {};
if (customText) properties['Custom Text'] = customText;
if (fontFamily) properties['Font'] = fontFamily;
if (fontSize) properties['Font Size'] = fontSize;
if (textColor) properties['Text Color'] = textColor;
if (petPhotoUrl) properties['Pet Photo URL'] = petPhotoUrl; // Add this line
```

7. **Add CloudinaryUploader Component to the Form**

Place the CloudinaryUploader component in your form, right after the variant selection and before the text customization options:

```jsx
<Divider />

<CloudinaryUploader
  cloudName={process.env.CLOUDINARY_CLOUD_NAME || "dqnlrk9jl"}
  uploadPreset="capricustomizer"
  onImageUploaded={(url) => setPetPhotoUrl(url)}
  onUploadError={(error) => console.error('Upload error:', error)}
/>

<Divider />

{/* Text customization options continue here */}
```

8. **Update the Button Disabled State**

Update your "Add to Cart" button to require a pet photo:

```jsx
<Button 
  submit
  variant="primary" 
  disabled={!customText || !selectedVariantId || !petPhotoUrl}
  size="large"
  fullWidth
>
  Add Customized Item to Cart
</Button>
```

## Add Live Preview (Optional)

For a better user experience, add a live preview showing the pet photo with the customized text:

```jsx
{petPhotoUrl && customText && (
  <Box padding="400">
    <Text variant="headingMd" as="h2">Live Preview</Text>
    <div style={{ 
      width: '100%', 
      maxWidth: '300px', 
      aspectRatio: '1/1',
      backgroundImage: `url(${petPhotoUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px',
      position: 'relative',
      margin: '16px auto'
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
        color: color
      }}>
        {customText}
      </div>
    </div>
  </Box>
)}
```

## Accessing the Photo URL in Your Admin

As a store owner, you'll be able to see the photo URL in the line item properties for each order. You can click the URL to view and download the pet photo for creating the portrait. 
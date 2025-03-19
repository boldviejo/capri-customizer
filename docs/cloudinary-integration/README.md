# Cloudinary Photo Upload Integration for Pet Portraits

This document outlines how to integrate Cloudinary's upload widget into the pet portrait customizer to allow customers to upload their own pet photos.

## Overview

We'll be using Cloudinary's Upload Widget which offers:
- A clean, minimal interface
- Image cropping and basic editing
- Mobile-responsive design
- Secure, cloud-based storage
- Fast CDN delivery of images

The uploaded image URL will be passed to the Shopify cart as a line item property, allowing us to access the customer's pet photo during the order fulfillment process.

## Setup Requirements

1. **Cloudinary Account**
   - Sign up for a free account at [Cloudinary](https://cloudinary.com/users/register/free)
   - The free tier includes 25GB storage and 25GB bandwidth/month
   - Get your Cloud Name from the dashboard
   - Create an "Upload Preset" for unsigned uploads (in Settings > Upload)

2. **Integration Components**
   - Upload Widget JavaScript
   - React component wrapper
   - Shopify line item property handling

## Implementation Steps

1. **Add Cloudinary Upload Widget to the project**
   ```bash
   npm install @cloudinary/url-gen @cloudinary/react
   ```

2. **Create a component to handle the upload widget**
   - See the `CloudinaryUploader.jsx` component in this directory
   - The component manages the widget state and uploads

3. **Integrate with customizer form**
   - Add the uploader to the customizer form
   - Store the uploaded image URL in the form state
   - Pass the URL as a line item property to Shopify cart

4. **Update the cart submission logic**
   - Modify the form submission to include the pet photo URL
   - Pass the URL along with other customization options

## Security Considerations

- Using unsigned uploads for simplicity
- Set proper upload restrictions in the Cloudinary preset:
  - Limit file types to images (jpg, png, etc.)
  - Set maximum file size (e.g., 10MB)
  - Configure auto-tagging for easier management
  - Enable moderation if needed

## User Experience

1. Customer clicks "Upload Your Pet Photo"
2. Cloudinary widget opens with a clean interface
3. Customer uploads photo, crops/adjusts as needed
4. Preview shows in the customizer alongside text options
5. All customization data (including image URL) is sent to cart upon submission

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget Documentation](https://cloudinary.com/documentation/upload_widget)
- [Shopify Line Item Properties](https://shopify.dev/docs/api/liquid/objects/line_item#line_item-properties) 
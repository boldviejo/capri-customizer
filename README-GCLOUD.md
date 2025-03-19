# Google Cloud Deployment Guide for Capri Customizer

This guide walks you through deploying the Capri Customizer app to Google Cloud Platform, including setting up Cloud Storage for image uploads.

## Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
2. Node.js and npm installed
3. A Google Cloud account with billing enabled

## Setup Steps

### 1. Install Google Cloud SDK

If you haven't already, install the Google Cloud SDK by following the instructions at https://cloud.google.com/sdk/docs/install

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
```

### 3. Create a Google Cloud Project

```bash
gcloud projects create capri-customizer
gcloud config set project capri-customizer
```

### 4. Enable Required APIs

```bash
gcloud services enable storage.googleapis.com run.googleapis.com
```

### 5. Set Up Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file and set your Google Cloud project ID:

```
GCS_PROJECT_ID=capri-customizer
GCS_BUCKET_NAME=capri-customizer-images
```

## Deployment

### Option 1: Using the Deployment Script

The simplest way to deploy is using the provided script:

```bash
./deploy-to-gcloud.sh
```

This script will:
- Create a Cloud Storage bucket if it doesn't exist
- Set appropriate permissions
- Deploy the app to Cloud Run
- Output the deployed URL

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. Create a Cloud Storage bucket:

```bash
gcloud storage buckets create gs://capri-customizer-images --location=us-central1 --uniform-bucket-level-access
```

2. Set bucket permissions:

```bash
gcloud storage buckets add-iam-policy-binding gs://capri-customizer-images \
    --member=allUsers \
    --role=roles/storage.objectViewer
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy capri-customizer \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="GCS_BUCKET_NAME=capri-customizer-images,GCS_PROJECT_ID=capri-customizer"
```

## Local Development with Google Cloud Storage

For local development with Google Cloud Storage integration:

1. Create a service account key:

```bash
gcloud iam service-accounts create capri-customizer-app

gcloud projects add-iam-policy-binding capri-customizer \
    --member="serviceAccount:capri-customizer-app@capri-customizer.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud iam service-accounts keys create ./key.json \
    --iam-account=capri-customizer-app@capri-customizer.iam.gserviceaccount.com
```

2. Add the key path to your environment variables:

```
GOOGLE_APPLICATION_CREDENTIALS=./key.json
```

3. Run the app locally:

```bash
npm run dev
```

## Testing the Image Upload

After deployment, you can test the image upload functionality by:

1. Navigate to `/example-form` in your deployed app
2. Upload an image using the form
3. Verify the image appears in your Cloud Storage bucket

## Troubleshooting

- **Permission denied errors**: Make sure your service account has the correct permissions for Cloud Storage.
- **Upload URL errors**: Check that your bucket name is correctly set in environment variables.
- **Deployment failures**: Ensure you have billing enabled on your Google Cloud account.

## Security Notes

- The deployment script sets the bucket to be publicly readable, which is required for serving images. If you need more restrictive permissions, consider using signed URLs for limited-time access.
- For production deployments, consider setting up custom domains and HTTPS. 
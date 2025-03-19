#!/bin/bash
set -e

# Set these variables to match your configuration
PROJECT_ID=${GCS_PROJECT_ID:-"capri-customizer"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"capri-customizer"}
BUCKET_NAME=${GCS_BUCKET_NAME:-"capri-customizer-images"}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Google Cloud SDK (gcloud) is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate with Google Cloud if needed
echo "Authenticating with Google Cloud..."
gcloud auth login --quiet

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Create bucket if it doesn't exist
echo "Checking if bucket $BUCKET_NAME exists..."
if ! gcloud storage buckets describe gs://$BUCKET_NAME &> /dev/null; then
    echo "Creating Cloud Storage bucket: $BUCKET_NAME in $REGION..."
    gcloud storage buckets create gs://$BUCKET_NAME --location=$REGION --uniform-bucket-level-access
    
    # Make the bucket public
    echo "Setting bucket permissions..."
    gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
        --member=allUsers \
        --role=roles/storage.objectViewer
else
    echo "Bucket $BUCKET_NAME already exists."
fi

# Build and deploy to Cloud Run
echo "Building and deploying service to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="GCS_BUCKET_NAME=$BUCKET_NAME,GCS_PROJECT_ID=$PROJECT_ID" \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ Deployment complete!"
echo "Your app is available at: $SERVICE_URL"
echo "Make sure to update your APP_URL environment variable with this URL." 
# Capri Customizer Credentials

This file contains important credentials and settings for the Capri Customizer application. Keep this information secure and do not commit it to public repositories.

## Shopify API Credentials

| Setting | Value |
|---------|-------|
| Store Domain | `capri-dev-store.myshopify.com` |
| Storefront API Token | `27ec404f3ab614fdb943f48e56ef3739` |

## Google Cloud Settings

| Setting | Value |
|---------|-------|
| Project ID | `capri-customizer` |
| Region | `us-central1` |
| Service URL | `https://capri-customizer-6sablvg6la-uc.a.run.app` |
| GCS Bucket Name | `capri-customizer-images` |

## Environment Variables

Use these environment variables in your deployment configurations:

```bash
# Cloud Run Environment Variables
SHOPIFY_DOMAIN=capri-dev-store.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=27ec404f3ab614fdb943f48e56ef3739
GCS_BUCKET_NAME=capri-customizer-images
GCS_PROJECT_ID=capri-customizer
NODE_ENV=production
```

## Deployment Command

To update the application with these credentials:

```bash
gcloud run services update capri-customizer \
  --region=us-central1 \
  --update-env-vars="SHOPIFY_DOMAIN=capri-dev-store.myshopify.com,SHOPIFY_STOREFRONT_API_TOKEN=27ec404f3ab614fdb943f48e56ef3739,GCS_BUCKET_NAME=capri-customizer-images,GCS_PROJECT_ID=capri-customizer,NODE_ENV=production"
```

## For Future Deployments

When building a new Docker image, include these environment variables in your build and deployment commands:

```bash
# Build the Docker image
docker build --platform linux/amd64 -t capri-customizer:latest -t gcr.io/capri-customizer/capri-customizer:latest .

# Push to Google Container Registry
docker push gcr.io/capri-customizer/capri-customizer:latest

# Deploy to Cloud Run
gcloud run deploy capri-customizer \
  --image gcr.io/capri-customizer/capri-customizer:latest \
  --platform managed \
  --allow-unauthenticated \
  --region=us-central1 \
  --set-env-vars="SHOPIFY_DOMAIN=capri-dev-store.myshopify.com,SHOPIFY_STOREFRONT_API_TOKEN=27ec404f3ab614fdb943f48e56ef3739,GCS_BUCKET_NAME=capri-customizer-images,GCS_PROJECT_ID=capri-customizer,NODE_ENV=production"
``` 
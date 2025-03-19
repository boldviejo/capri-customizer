# Setting Up GitHub Integration with Cloud Build

Follow these steps to connect your GitHub repository to Google Cloud Build for automatic deployments:

## Step 1: Access Cloud Build Triggers

1. Go to the Google Cloud Console: https://console.cloud.google.com
2. Navigate to Cloud Build > Triggers
3. Make sure your project "capri-customizer" is selected

## Step 2: Connect to GitHub

1. Click the "Connect Repository" button
2. Select "GitHub (Cloud Build GitHub App)"
3. Click "Continue"
4. You'll be asked to authorize Google Cloud Build. Click "Authorize Google Cloud Build by Google Cloud"
5. Confirm by clicking "Install Google Cloud Build" on the GitHub page that opens

## Step 3: Select Repository

1. Choose your GitHub account
2. Find and select the "boldviejo/capri-customizer" repository
3. Click "Connect"

## Step 4: Create a Trigger

1. Click "Create Trigger"
2. Fill in the following information:
   - Name: `capri-customizer-deploy`
   - Description: `Automatically deploy to Cloud Run on push to main branch`
   - Event: Select "Push to a branch"
   - Branch: Enter `^main$` (this is a regex that matches exactly "main")
   - Configuration: Select "Cloud Build configuration file (yaml or json)"
   - Location: Select "Repository"
   - Cloud Build configuration file location: Enter `cloudbuild.yaml`
3. Click "Create"

## Step 5: Test the Trigger

1. Make a small change to your code
2. Commit and push to GitHub
3. Go to Cloud Build > History to watch the build progress
4. Once completed, check your Cloud Run service to confirm the deployment

## Troubleshooting

If you encounter any permission issues:

1. Go to IAM & Admin > IAM
2. Find the Cloud Build service account (typically named like `[PROJECT-NUMBER]@cloudbuild.gserviceaccount.com`)
3. Click "Edit" (pencil icon)
4. Add roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
5. Click "Save"

This should ensure Cloud Build has the necessary permissions to deploy to Cloud Run. 
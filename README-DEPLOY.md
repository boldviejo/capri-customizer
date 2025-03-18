# Capri Customizer Deployment Guide

This Shopify app is configured for deployment on Vercel. Follow these steps to get it up and running:

## 1. Push the code to GitHub

First, create a new GitHub repository and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/capri-customizer.git
git push -u origin main
```

## 2. Set up the database

This app uses a PostgreSQL database. For free hosting, you can use Supabase:

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Get your PostgreSQL connection string from Supabase dashboard (Settings > Database > Connection String > URI)
4. Replace the password placeholder with your actual database password

Supabase's free tier offers:
- 500 MB database space
- Unlimited API requests
- Up to 50,000 monthly active users
- 2GB total bandwidth
- 1GB file storage

## 3. Deploy on Vercel

1. Create a free account at [Vercel](https://vercel.com)
2. Create a new project and import your GitHub repository
3. Set the following environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `NODE_ENV`: `production`
   - `SHOPIFY_API_KEY`: Your Shopify API key
   - `SHOPIFY_API_SECRET`: Your Shopify API secret
   - `SCOPES`: `write_products` (adjust as needed)
   - `HOST`: Your Vercel deployment URL (e.g. `https://capri-customizer.vercel.app`)
   - `SHOPIFY_APP_URL`: Same as your HOST URL

4. Deploy your app and wait for the build to complete

## 4. Configure your Shopify app

1. Go to your [Shopify Partner Dashboard](https://partners.shopify.com/apps)
2. Update your app's URLs:
   - App URL: Your Vercel deployment URL
   - Allowed redirection URL(s): `https://your-vercel-url.vercel.app/api/auth`

## 5. Install the app on your store

1. Visit your app URL
2. Follow the installation process to add it to your store

## Updating your app

Whenever you push changes to your GitHub repository, Vercel will automatically rebuild and deploy your app. 
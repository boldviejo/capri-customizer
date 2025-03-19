# Standalone Product Customizer

This is a standalone product customizer that uses Shopify's Storefront API to access product data and add customized items to cart.

## Features

- Display a list of products from your Shopify store
- Allow customers to customize products with text, fonts, colors, etc.
- Add customized products to cart
- Proceed to checkout when ready

## Architecture

This application is a standalone frontend that communicates directly with Shopify's Storefront API. It is built with:

- [Remix](https://remix.run/) - A web framework
- [Polaris](https://polaris.shopify.com/) - Shopify's design system
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront) - To access Shopify product data

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Shopify store
- A Storefront API access token

### Environment Variables

Create a `.env` file with the following variables:

```
SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_api_token
SHOPIFY_DOMAIN=your-store.myshopify.com
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment

This application can be deployed to any Node.js hosting platform. It's pre-configured for Vercel deployment.

### Vercel Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables:
   - `SHOPIFY_STOREFRONT_API_TOKEN`
   - `SHOPIFY_DOMAIN` (optional, defaults to capri-dev-store.myshopify.com)

## How It Works

The application is structured around Remix routes:

- `/unauthenticated/customize` - Displays a list of products
- `/unauthenticated/customize/:handle` - Displays the product customizer for a specific product

When a user customizes a product and submits the form, a cart is created using the Storefront API, and the customized product is added with customization details as line item attributes. The user can then proceed to checkout directly from Shopify.

## Customization

You can customize the appearance and functionality of the product customizer by modifying the following files:

- `app/routes/unauthenticated.customize._index.tsx` - Product listing page
- `app/routes/unauthenticated.customize.$handle.tsx` - Product customizer page
- `app/routes/unauthenticated.tsx` - Layout for the customizer

## License

This project is licensed under the MIT License.
Force Run
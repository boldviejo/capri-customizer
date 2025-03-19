// This file contains Storefront API utilities

/**
 * Get the Storefront API token from environment variables
 */
export const getStorefrontApiToken = () => {
  return process.env.SHOPIFY_STOREFRONT_API_TOKEN;
};

/**
 * Gets the Shopify domain from environment variables
 * or falls back to a hardcoded default for development.
 * 
 * This function is used to form URLs for redirects and API requests
 * across the application.
 */
export function getShopifyDomain(): string {
  // Try to get from environment variables
  const envDomain = process.env.SHOPIFY_DOMAIN;
  
  if (envDomain) {
    // Ensure the domain doesn't have a protocol prefix
    if (envDomain.startsWith('http://') || envDomain.startsWith('https://')) {
      const url = new URL(envDomain);
      return url.hostname;
    }
    return envDomain;
  }
  
  // Default fallback - should be configured in environment variables in production
  // Typically this has .myshopify.com format if it's a non-custom domain
  console.warn('SHOPIFY_DOMAIN environment variable not set, using fallback');
  return 'capri-dev-store.myshopify.com';
}

/**
 * Create headers for Storefront API requests
 */
export const getStorefrontHeaders = () => {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": getStorefrontApiToken() || "",
  };
};

/**
 * Get the Storefront API URL
 */
export const getStorefrontApiUrl = () => {
  return `https://${getShopifyDomain()}/api/2024-01/graphql.json`;
};

/**
 * Execute a query against the Storefront API
 */
export const queryStorefrontApi = async (query: string, variables: Record<string, any> = {}) => {
  const response = await fetch(getStorefrontApiUrl(), {
    method: "POST",
    headers: getStorefrontHeaders(),
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return response.json();
};

/**
 * Temporary stub to satisfy build
 * @deprecated This is only kept for backward compatibility during build
 */
export const authenticate = {
  admin: async () => ({
    admin: null
  })
};

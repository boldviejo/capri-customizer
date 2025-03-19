// This file contains Storefront API utilities

/**
 * Get the Storefront API token from environment variables
 */
export const getStorefrontApiToken = () => {
  return process.env.SHOPIFY_STOREFRONT_API_TOKEN;
};

/**
 * Get the Shopify domain from environment variables
 */
export const getShopifyDomain = () => {
  return process.env.SHOPIFY_DOMAIN || "capri-dev-store.myshopify.com";
};

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

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
  
  if (!envDomain) {
    console.warn('⚠️ SHOPIFY_DOMAIN environment variable not set, using fallback');
    // Default fallback - should be configured in environment variables in production
    return 'capri-dev-store.myshopify.com';
  }
  
  // Ensure the domain doesn't have a protocol prefix
  if (envDomain.startsWith('http://') || envDomain.startsWith('https://')) {
    try {
      const url = new URL(envDomain);
      return url.hostname;
    } catch (error) {
      console.error(`⚠️ Error parsing Shopify domain URL: ${envDomain}`, error);
      return envDomain;
    }
  }
  
  return envDomain;
}

/**
 * Create headers for Storefront API requests
 */
export const getStorefrontHeaders = () => {
  const token = getStorefrontApiToken();
  if (!token) {
    console.warn('⚠️ SHOPIFY_STOREFRONT_API_TOKEN is not set!');
  }
  
  return {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token || "",
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
  const url = getStorefrontApiUrl();
  const headers = getStorefrontHeaders();
  
  console.log(`🔍 Querying Shopify Storefront API at: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Shopify API Error (${response.status}): ${errorText}`);
      throw new Error(`Shopify API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      console.error('❌ GraphQL Errors:', data.errors);
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Failed to query Shopify API:`, error);
    throw error;
  }
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

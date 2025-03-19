import { useState, useEffect } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type LinksFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, Form, useActionData } from "@remix-run/react";
import {
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
  TextField,
  Select,
  InlineStack,
} from "@shopify/polaris";
import { queryStorefrontApi, getShopifyDomain } from "~/shopify.server";
import CloudinaryUploader from "~/components/CloudinaryUploader";
import ModernCustomizer from "~/components/ModernCustomizer";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css" },
];

// Define types for our data
interface ProductVariant {
  id: string;
  title: string;
  price: string;
  availableForSale: boolean;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  variants: ProductVariant[];
  images: { 
    url: string;
    altText: string;
  }[];
}

interface LoaderData {
  product?: Product;
  error: string | null;
  shopifyDomain?: string;
}

interface ActionData {
  success: boolean;
  message?: string;
  bridgeUrl?: string;
  error?: string;
}

// Add a helper function to get the Shopify domain on the client side
const getClientShopifyDomain = () => {
  // This is used when the server's getShopifyDomain function isn't available on the client
  // Default to the current hostname if we can't determine the Shopify domain
  // You might need to adjust this logic based on your setup
  if (typeof window !== 'undefined') {
    // Check if we have the domain stored in localStorage (could be set during the loader)
    const storedDomain = localStorage.getItem('shopifyDomain');
    if (storedDomain) return storedDomain;
    
    // Default to the current hostname if no stored domain
    // This assumes your app is hosted on the same domain as your Shopify store
    return window.location.hostname;
  }
  return 'capri-dev-store.myshopify.com'; // Fallback default
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { handle } = params;

  if (!handle) {
    return json({ 
      error: "Product handle is required" 
    }, { status: 400 });
  }

  // Get the Shopify domain
  const shopifyDomain = getShopifyDomain();

  // Check if Storefront API token is available
  if (!process.env.SHOPIFY_STOREFRONT_API_TOKEN) {
    console.warn("SHOPIFY_STOREFRONT_API_TOKEN is not set, returning mock data");
    
    // Check if the handle matches one of our mock products
    if (handle === "sample-product-1" || handle === "sample-product-2") {
      const productNumber = handle === "sample-product-1" ? "1" : "2";
      
      // Return mock data when the token is not available
      return json({
        product: {
          id: `gid://shopify/Product/${productNumber}`,
          title: `Sample Product ${productNumber}`,
          handle: handle,
          description: `<p>This is a detailed description for Sample Product ${productNumber}. This appears when the Storefront API token is not configured.</p>`,
          variants: [
            {
              id: `gid://shopify/ProductVariant/${productNumber}1`,
              title: "Default",
              price: "19.99",
              availableForSale: true
            }
          ],
          images: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: `Sample product ${productNumber} image`
            }
          ]
        },
        error: null,
        shopifyDomain
      });
    } else {
      return json({ 
        error: "Product not found" 
      }, { status: 404 });
    }
  }

  try {
    // Get the product by handle using Storefront API
    const query = `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          descriptionHtml
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `;
    
    const variables = { handle };
    const responseData = await queryStorefrontApi(query, variables);
    const productData = responseData.data.productByHandle;

    if (!productData) {
      return json({ 
        error: "Product not found" 
      }, { status: 404 });
    }

    const product = {
      id: productData.id,
      title: productData.title,
      handle: productData.handle,
      description: productData.descriptionHtml,
      variants: productData.variants.edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        price: node.price.amount,
        availableForSale: node.availableForSale,
      })),
      images: productData.images.edges.map(({ node }: any) => ({
        url: node.url,
        altText: node.altText || productData.title,
      }))
    };

    return json({
      product,
      error: null,
      shopifyDomain
    });
  } catch (error) {
    console.error("Error loading product:", error);
    return json({ 
      error: "Failed to load product" 
    }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  const text = String(formData.get("text") || "");
  const fontFamily = String(formData.get("fontFamily") || "");
  const fontSize = String(formData.get("fontSize") || "16");
  const color = String(formData.get("color") || "");
  const variantId = String(formData.get("variantId") || "");
  const position = String(formData.get("position") || "center");
  const uploadedImage = formData.get("uploadedImage") ? String(formData.get("uploadedImage")) : null;
  
  if (!text || !fontFamily || !fontSize || !color || !variantId) {
    return json({
      error: "Missing required fields",
      success: false
    });
  }
  
  try {
    // Get the Shopify domain - this is critical for forming the correct URL
    const shopifyDomain = getShopifyDomain();
    
    if (!shopifyDomain) {
      throw new Error("Could not determine Shopify domain");
    }
    
    // Make sure the variant ID is properly formatted for Shopify
    // Sometimes IDs need to be transformed from the GraphQL format
    let finalVariantId = variantId;
    if (variantId.startsWith('gid://shopify/ProductVariant/')) {
      // Extract just the ID part from the GraphQL ID
      finalVariantId = variantId.replace('gid://shopify/ProductVariant/', '');
    }
    
    // Format the bridge URL with all parameters - be explicit with the bridge page path
    const bridgeUrl = new URL(`https://${shopifyDomain}/pages/add-to-cart-bridge`);
    
    // Add parameters using URLSearchParams for proper encoding
    bridgeUrl.searchParams.append('variant_id', finalVariantId);
    bridgeUrl.searchParams.append('custom_text', text);
    bridgeUrl.searchParams.append('font_family', fontFamily);
    bridgeUrl.searchParams.append('font_size', fontSize);
    bridgeUrl.searchParams.append('text_color', color);
    bridgeUrl.searchParams.append('position', position);
    
    // Add pet photo URL if available
    if (uploadedImage) {
      bridgeUrl.searchParams.append('pet_photo_url', uploadedImage);
    }
    
    console.log("Generated bridge URL:", bridgeUrl.toString());
    
    // Return bridge URL for client to handle
    return json({
      success: true,
      bridgeUrl: bridgeUrl.toString(),
      message: "Redirecting to add-to-cart bridge"
    });
  } catch (error) {
    console.error("Error creating bridge URL:", error);
    return json({
      error: error instanceof Error ? error.message : "An error occurred during checkout",
      success: false
    });
  }
};

export default function ProductCustomizer() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { product, error, shopifyDomain } = data;
  const actionData = useActionData<typeof action>() as ActionData;
  const submit = useSubmit();
  
  // State to track if a bridge request is pending and retry count
  const [pendingBridgeRequest, setPendingBridgeRequest] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Store shopify domain in session storage for fallback purposes
  useEffect(() => {
    if (shopifyDomain && typeof window !== 'undefined') {
      sessionStorage.setItem('shopifyDomain', shopifyDomain);
    }
  }, [shopifyDomain]);
  
  // Handle the action response (success/error)
  const handleActionResponse = (response: ActionData) => {
    if (response?.bridgeUrl) {
      // Store the bridge URL in state and session storage for retries
      setPendingBridgeRequest(response.bridgeUrl);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingBridgeRequest', response.bridgeUrl);
      }
      
      try {
        console.log("Redirecting to bridge URL:", response.bridgeUrl);
        // Use window.location.replace instead of href for a cleaner redirect experience
        window.location.replace(response.bridgeUrl);
      } catch (error) {
        console.error("Error redirecting to bridge:", error);
        alert("There was an error redirecting to the cart. Please try again.");
      }
    } else if (response?.error) {
      // Handle error with more meaningful messages
      console.error("Add to cart error:", response.error);
      alert(`Error: ${response.error}. Please try again.`);
    }
  };
  
  // Check for action data when it changes
  useEffect(() => {
    if (actionData) {
      handleActionResponse(actionData);
    }
  }, [actionData]);
  
  // Look for a stored bridge URL on initial load to handle post-redirect recovery
  useEffect(() => {
    const checkForStoredBridgeRequest = () => {
      if (typeof window !== 'undefined') {
        const storedRequest = sessionStorage.getItem('pendingBridgeRequest');
        if (storedRequest) {
          setPendingBridgeRequest(storedRequest);
          
          // Only auto-retry if we know we're returning from a bridge
          const isReturningFromBridge = document.referrer.includes('/pages/add-to-cart-bridge');
          if (isReturningFromBridge) {
            // Auto-retry once if we're coming back from a failed bridge redirect
            retryLastBridge();
          }
        }
      }
    };
    
    // Check on initial load
    checkForStoredBridgeRequest();
  }, []);
  
  // Custom function to retry the last bridge if needed
  const retryLastBridge = () => {
    if (pendingBridgeRequest && retryCount < maxRetries) {
      setRetryCount(prevCount => prevCount + 1);
      
      try {
        console.log(`Retry attempt ${retryCount + 1} for bridge URL:`, pendingBridgeRequest);
        // Use window.location.replace instead of href for a cleaner redirect
        window.location.replace(pendingBridgeRequest);
        
        // Optionally add a delay if needed
        // setTimeout(() => window.location.replace(pendingBridgeRequest), 500);
      } catch (error) {
        console.error("Error in retry redirect:", error);
        alert("Failed to redirect to cart. Please try again later.");
        
        if (typeof window !== 'undefined') {
          // Clear the stored request after max retries
          if (retryCount >= maxRetries - 1) {
            sessionStorage.removeItem('pendingBridgeRequest');
            setPendingBridgeRequest(null);
            setRetryCount(0);
          }
        }
      }
    } else if (retryCount >= maxRetries) {
      // Clear stored data after max retries
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingBridgeRequest');
      }
      setPendingBridgeRequest(null);
      setRetryCount(0);
      alert("Unable to add item to cart after multiple attempts. Please try again later.");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    // Reset retry count for new submissions
    setRetryCount(0);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingBridgeRequest');
    }
    
    submit(formData, { method: "post" });
  };
  
  if (error) {
    return (
      <Card>
        <BlockStack gap="400">
          <Box padding="400">
            <Text as="p" tone="critical">{error}</Text>
          </Box>
        </BlockStack>
      </Card>
    );
  }
  
  if (!product) {
    return (
      <Card>
        <BlockStack gap="400">
          <Box padding="400">
            <Text as="p">Loading product...</Text>
          </Box>
        </BlockStack>
      </Card>
    );
  }
  
  return (
    <>
      <ModernCustomizer product={product} onSubmit={handleSubmit} />
    </>
  );
} 
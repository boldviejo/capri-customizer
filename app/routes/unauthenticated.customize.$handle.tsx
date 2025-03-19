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
  
  // Get the Shopify domain
  const shopifyDomain = getShopifyDomain();
  
  // Format the bridge URL with all parameters
  const bridgeUrl = `https://${shopifyDomain}/pages/add-to-cart-bridge?variant_id=${variantId}&custom_text=${encodeURIComponent(text)}&font_family=${encodeURIComponent(fontFamily)}&font_size=${encodeURIComponent(fontSize)}&text_color=${encodeURIComponent(color)}`;
  
  // Add pet photo URL if available
  const finalBridgeUrl = uploadedImage 
    ? `${bridgeUrl}&pet_photo_url=${encodeURIComponent(uploadedImage)}` 
    : bridgeUrl;
  
  // Check if Storefront API token is available
  if (!process.env.SHOPIFY_STOREFRONT_API_TOKEN) {
    console.warn("SHOPIFY_STOREFRONT_API_TOKEN is not set, returning bridge URL");
    
    // Return a bridge URL for testing
    return json({
      success: true,
      bridgeUrl: finalBridgeUrl,
      message: "Redirecting to add-to-cart bridge"
    });
  }
  
  try {
    // Even with the Storefront API token, we'll use the bridge URL approach
    // as it works better with customizations
    return json({
      success: true,
      bridgeUrl: finalBridgeUrl,
      message: "Redirecting to add-to-cart bridge"
    });
    
    /* 
    // Commenting out the direct cart API usage in favor of the bridge
    // Create a cart
    const cartCreateQuery = `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const cartCreateResult = await queryStorefrontApi(cartCreateQuery);
    const cartData = cartCreateResult.data.cartCreate;
    
    if (cartData.userErrors && cartData.userErrors.length > 0) {
      console.error("Error creating cart:", cartData.userErrors);
      return json({
        error: "Error creating cart: " + cartData.userErrors[0].message,
        success: false
      });
    }
    
    const cartId = cartData.cart.id;
    
    // Add the customized item to the cart
    const customAttributes = [
      { key: "Custom Text", value: text },
      { key: "Font", value: fontFamily },
      { key: "Font Size", value: fontSize },
      { key: "Text Color", value: color },
      { key: "Position", value: position }
    ];
    
    if (uploadedImage) {
      customAttributes.push({ key: "Uploaded Image", value: uploadedImage });
    }
    
    const attributesString = customAttributes
      .map(attr => `{key: "${attr.key}", value: "${attr.value}"}`)
      .join(",");
    
    const cartAddQuery = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const cartAddVariables = {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity: 1,
          attributes: customAttributes
        }
      ]
    };
    
    const cartAddResult = await queryStorefrontApi(cartAddQuery, cartAddVariables);
    const cartAddData = cartAddResult.data.cartLinesAdd;
    
    if (cartAddData.userErrors && cartAddData.userErrors.length > 0) {
      console.error("Error adding item to cart:", cartAddData.userErrors);
      return json({
        error: "Error adding item to cart: " + cartAddData.userErrors[0].message,
        success: false
      });
    }
    
    // Return the checkout URL
    return json({
      success: true,
      checkoutUrl: cartAddData.cart.checkoutUrl,
      message: "Item added to cart successfully"
    });
    */
    
  } catch (error) {
    console.error("Error in checkout process:", error);
    return json({
      error: "An error occurred during checkout",
      success: false
    });
  }
};

export default function ProductCustomizer() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { product, error, shopifyDomain } = data;
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  // State to track if a bridge request is pending
  const [pendingBridgeRequest, setPendingBridgeRequest] = useState<string | null>(null);
  
  // Handle the action response (success/error)
  const handleActionResponse = (response: any) => {
    if (response?.bridgeUrl) {
      // If we have a bridge URL, redirect to it
      window.location.href = response.bridgeUrl;
    } else if (response?.error) {
      // Handle error
      alert(response.error);
    }
  };
  
  // Check for action data when it changes
  useEffect(() => {
    if (actionData) {
      handleActionResponse(actionData);
    }
  }, [actionData]);
  
  // Custom function to retry the last bridge if needed
  const retryLastBridge = () => {
    if (pendingBridgeRequest) {
      // Implementation would depend on your bridge setup
      console.log("Retrying bridge request:", pendingBridgeRequest);
      setPendingBridgeRequest(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
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
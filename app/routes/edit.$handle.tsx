import { useState, useEffect } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type LinksFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, Form, useActionData, useSearchParams } from "@remix-run/react";
import {
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
} from "@shopify/polaris";

import { getShopifyDomain, queryStorefrontApi } from "~/shopify.server";
import ModernCustomizer from "~/components/ModernCustomizer";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@11.0.0/build/esm/styles.css" },
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
  initialValues: {
    customText?: string;
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    position?: string;
    petPhotoUrl?: string;
    variantId?: string;
    itemKey?: string;
  };
  debug: {
    handle: string;
    rawParams: Record<string, string | null>;
    responseData?: any;
    apiError?: string;
  };
}

interface ActionData {
  success: boolean;
  message: string;
  bridgeUrl?: string;
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const { handle } = params;
    console.log("Received request for product handle:", handle);
    console.log("Full request URL:", request.url);
    
    if (!handle) {
      console.log("Error: Product handle is missing");
      return json({ 
        error: "Product handle is required",
        initialValues: {},
        debug: { params }
      }, { status: 400 });
    }

    // Parse query parameters for initial values
    const url = new URL(request.url);
    const rawParams = Object.fromEntries([...url.searchParams.entries()]);
    console.log("URL search params:", rawParams);
    
    // Check for both snake_case and camelCase parameter formats to handle both Shopify and direct parameters
    const initialValues = {
      customText: url.searchParams.get('custom_text') || url.searchParams.get('customText') || '',
      fontFamily: url.searchParams.get('font_family') || url.searchParams.get('fontFamily') || 'Arial',
      fontSize: url.searchParams.get('font_size') || url.searchParams.get('fontSize') || '16',
      textColor: url.searchParams.get('text_color') || url.searchParams.get('textColor') || '#000000',
      position: url.searchParams.get('position') || 'center',
      petPhotoUrl: url.searchParams.get('pet_photo_url') || url.searchParams.get('petPhotoUrl') || undefined,
      variantId: url.searchParams.get('variant_id') || url.searchParams.get('variantId') || '',
      itemKey: url.searchParams.get('item_key') || url.searchParams.get('itemKey') || ''
    };
    
    console.log("Parsed initialValues:", initialValues);
    
    try {
      // Using Storefront API for product fetching
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
      console.log("Querying Shopify API with variables:", variables);
      
      const responseData = await queryStorefrontApi(query, variables);
      console.log("Shopify API response received");
      
      if (!responseData.data || !responseData.data.productByHandle) {
        console.error("Product not found in Shopify API response:", responseData);
        return json({ 
          error: "Product not found in Shopify store",
          initialValues,
          debug: { 
            handle,
            rawParams,
            responseData 
          }
        }, { status: 404 });
      }
      
      const productData = responseData.data.productByHandle;
      console.log("Product data found:", productData.title);

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
        initialValues,
        debug: { handle, rawParams }
      });
    } catch (apiError) {
      console.error("Error in Shopify API request:", apiError);
      return json({ 
        error: "Failed to fetch product data from Shopify",
        initialValues,
        debug: { 
          handle, 
          rawParams,
          apiError: apiError instanceof Error ? apiError.message : String(apiError)
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error in loader:", error);
    return json({ 
      error: "An unexpected error occurred while loading the product",
      initialValues: {},
      debug: { 
        params,
        error: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    
    console.log("Received form data:", Object.fromEntries(formData.entries()));
    
    // Extract values from form data
    const text = String(formData.get("text") || "");
    const fontFamily = String(formData.get("fontFamily") || "");
    const fontSize = String(formData.get("fontSize") || "16");
    const color = String(formData.get("color") || "");
    const variantId = String(formData.get("variantId") || "");
    const position = String(formData.get("position") || formData.get("textPosition") || "center");
    const uploadedImage = formData.get("uploadedImage") ? String(formData.get("uploadedImage")) : null;
    const itemKey = String(formData.get("itemKey") || "");
    
    console.log("Extracted form values:", { text, fontFamily, fontSize, color, variantId, position, uploadedImage, itemKey });
    
    if (!text || !fontFamily || !fontSize || !color || !variantId) {
      console.error("Missing required fields:", { text, fontFamily, fontSize, color, variantId });
      return json({
        success: false,
        message: "Missing required fields",
        debug: { 
          receivedValues: { text, fontFamily, fontSize, color, variantId, position, itemKey },
          missingFields: [
            !text ? 'text' : null,
            !fontFamily ? 'fontFamily' : null,
            !fontSize ? 'fontSize' : null,
            !color ? 'color' : null,
            !variantId ? 'variantId' : null
          ].filter(Boolean)
        }
      });
    }
    
    // Get the Shopify domain
    const shopifyDomain = getShopifyDomain();
    
    if (!shopifyDomain) {
      console.error("Could not determine Shopify domain");
      throw new Error("Could not determine Shopify domain");
    }
    
    // Make sure the variant ID is properly formatted for Shopify
    let finalVariantId = variantId;
    if (variantId.startsWith('gid://shopify/ProductVariant/')) {
      finalVariantId = variantId.replace('gid://shopify/ProductVariant/', '');
    }
    
    // Format the bridge URL with all parameters for updating the existing item
    try {
      const bridgeUrl = new URL(`https://${shopifyDomain}/pages/update-cart-item-bridge`);
      
      // Add parameters using URLSearchParams for proper encoding
      bridgeUrl.searchParams.append('variant_id', finalVariantId);
      bridgeUrl.searchParams.append('custom_text', text);
      bridgeUrl.searchParams.append('font_family', fontFamily);
      bridgeUrl.searchParams.append('font_size', fontSize);
      bridgeUrl.searchParams.append('text_color', color);
      bridgeUrl.searchParams.append('position', position);
      
      // Add item key to identify which cart item to update
      if (itemKey) {
        bridgeUrl.searchParams.append('item_key', itemKey);
      }
      
      // Add pet photo URL if available
      if (uploadedImage) {
        bridgeUrl.searchParams.append('pet_photo_url', uploadedImage);
      }
      
      console.log("Generated update bridge URL:", bridgeUrl.toString());
      
      // Return bridge URL for client to handle
      return json({
        success: true,
        bridgeUrl: bridgeUrl.toString(),
        message: "Redirecting to update item bridge"
      });
    } catch (urlError) {
      console.error("Error creating bridge URL:", urlError);
      throw new Error(`Failed to create bridge URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
    }
  } catch (error) {
    console.error("Error processing form submission:", error);
    return json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating your customization",
      debug: { error: String(error) }
    });
  }
};

export default function EditCustomizer() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { product, error, initialValues, debug } = data;
  const actionData = useActionData<typeof action>() as ActionData;
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  
  // State to track if a bridge request is pending and retry count
  const [pendingBridgeRequest, setPendingBridgeRequest] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Handle the action response (success/error)
  useEffect(() => {
    if (actionData?.bridgeUrl) {
      // Store the bridge URL in state and session storage for retries
      setPendingBridgeRequest(actionData.bridgeUrl);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingBridgeRequest', actionData.bridgeUrl);
        sessionStorage.setItem('retryCount', '0');
      }
      
      // Redirect to the bridge URL
      window.location.href = actionData.bridgeUrl;
    }
  }, [actionData]);
  
  // Check for stored bridge requests on initial load
  useEffect(() => {
    const checkForStoredBridgeRequest = () => {
      if (typeof window !== 'undefined') {
        const storedBridgeRequest = sessionStorage.getItem('pendingBridgeRequest');
        const storedRetryCount = parseInt(sessionStorage.getItem('retryCount') || '0', 10);
        
        if (storedBridgeRequest) {
          setPendingBridgeRequest(storedBridgeRequest);
          setRetryCount(storedRetryCount);
          
          if (storedRetryCount < maxRetries) {
            // Increment retry count
            sessionStorage.setItem('retryCount', (storedRetryCount + 1).toString());
            // Redirect to bridge URL
            window.location.href = storedBridgeRequest;
          } else {
            // Clear stored request if max retries reached
            sessionStorage.removeItem('pendingBridgeRequest');
            sessionStorage.removeItem('retryCount');
            alert("Failed to update your cart after multiple attempts. Please try again.");
          }
        }
      }
    };
    
    checkForStoredBridgeRequest();
  }, [maxRetries]);
  
  const retryLastBridge = () => {
    if (pendingBridgeRequest) {
      if (retryCount < maxRetries) {
        setRetryCount(prevCount => prevCount + 1);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('retryCount', (retryCount + 1).toString());
        }
        window.location.href = pendingBridgeRequest;
      } else {
        setPendingBridgeRequest(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('pendingBridgeRequest');
          sessionStorage.removeItem('retryCount');
        }
        alert("Failed to update your cart after multiple attempts. Please try again.");
      }
    }
  };
  
  const clearPendingBridgeRequest = () => {
    setPendingBridgeRequest(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingBridgeRequest');
      sessionStorage.removeItem('retryCount');
    }
  };
  
  // Handle form submission
  const handleSubmit = (formData: FormData) => {
    // Add the item key to the form data if available
    if (initialValues.itemKey) {
      formData.append('itemKey', initialValues.itemKey);
    }
    
    // Submit the form data to the action
    submit(formData, { method: 'post' });
  };
  
  if (error) {
    return (
      <div className="error-container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Text variant="heading2xl" as="h1">{error}</Text>
        
        <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "4px", background: "#f8f9fa" }}>
          <Text as="h2" variant="headingLg">Initial Values</Text>
          <pre style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', overflow: 'auto', maxWidth: '100%', borderRadius: "4px" }}>
            {JSON.stringify(initialValues, null, 2)}
          </pre>
          
          {debug && (
            <>
              <Text as="h2" variant="headingLg">Debug Information</Text>
              <pre style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', overflow: 'auto', maxWidth: '100%', borderRadius: "4px" }}>
                {JSON.stringify(debug, null, 2)}
              </pre>
            </>
          )}
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => window.location.href = '/cart'}>
            Return to Cart
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="loading-container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Text as="h1" variant="heading2xl">Loading product data...</Text>
        
        <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "4px", background: "#f8f9fa" }}>
          <Text as="h2" variant="headingLg">Request Information</Text>
          <pre style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', overflow: 'auto', maxWidth: '100%', borderRadius: "4px" }}>
            {JSON.stringify(initialValues, null, 2)}
          </pre>
          
          {debug && (
            <>
              <Text as="h2" variant="headingLg">Debug Information</Text>
              <pre style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0', overflow: 'auto', maxWidth: '100%', borderRadius: "4px" }}>
                {JSON.stringify(debug, null, 2)}
              </pre>
            </>
          )}
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => window.location.href = '/cart'}>
            Return to Cart
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="customizer-container">
      <div className="customizer-header">
        <Text variant="heading2xl" as="h1">Edit Your Customization</Text>
        <Text as="p">Make changes to your customized {product.title}</Text>
      </div>
      
      <Divider />
      
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Box padding="400">
              <div className="form-container">
                <Form method="post" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSubmit(formData);
                }}>
                  <ModernCustomizer 
                    product={product}
                    onSubmit={handleSubmit}
                    initialValues={{
                      customText: initialValues.customText,
                      fontFamily: initialValues.fontFamily,
                      fontSize: initialValues.fontSize ? parseInt(initialValues.fontSize) : undefined,
                      textColor: initialValues.textColor,
                      textPosition: initialValues.position,
                      selectedVariantId: initialValues.variantId,
                      imagePreview: initialValues.petPhotoUrl
                    }}
                    submitButtonText="Update Customization"
                  />
                </Form>
              </div>
            </Box>
          </BlockStack>
        </Card>
        
        <div className="buttons-container">
          <Button variant="plain" onClick={() => window.location.href = '/cart'}>
            Cancel and Return to Cart
          </Button>
        </div>
      </BlockStack>
    </div>
  );
} 
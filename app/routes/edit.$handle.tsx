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
  Banner,
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
    textPosition?: string;
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
  debug?: any;
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
    // Also ensure defaults for all parameters
    const initialValues = {
      customText: url.searchParams.get('custom_text') || url.searchParams.get('customText') || '',
      fontFamily: url.searchParams.get('font_family') || url.searchParams.get('fontFamily') || 'Arial',
      fontSize: url.searchParams.get('font_size') || url.searchParams.get('fontSize') || '16',
      textColor: url.searchParams.get('text_color') || url.searchParams.get('textColor') || '#000000',
      position: url.searchParams.get('position') || url.searchParams.get('textPosition') || 'center',
      textPosition: url.searchParams.get('text_position') || url.searchParams.get('textPosition') || url.searchParams.get('position') || 'center',
      petPhotoUrl: url.searchParams.get('pet_photo_url') || url.searchParams.get('petPhotoUrl') || '',
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
            images(first: 10) {
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

      // Validate that the variantId exists in the product
      if (initialValues.variantId && !product.variants.some((v: ProductVariant) => v.id === initialValues.variantId)) {
        console.warn("Variant ID not found in product variants:", initialValues.variantId);
        console.log("Available variants:", product.variants.map((v: ProductVariant) => v.id));
        
        // Check if the variantId needs to be transformed to a Shopify gid format
        const variantsById = product.variants.reduce((acc: Record<string, string>, v: ProductVariant) => {
          // Extract variant numeric ID from gid format
          const numericId = v.id.replace('gid://shopify/ProductVariant/', '');
          acc[numericId] = v.id;
          return acc;
        }, {} as Record<string, string>);
        
        // Check if we need to add the gid prefix
        if (variantsById[initialValues.variantId]) {
          console.log("Found variant ID by numeric ID, updating format");
          initialValues.variantId = variantsById[initialValues.variantId];
        } else if (initialValues.variantId.includes('gid://shopify/ProductVariant/')) {
          // Extract numeric ID and check if it exists
          const numericId = initialValues.variantId.replace('gid://shopify/ProductVariant/', '');
          if (variantsById[numericId]) {
            console.log("Variant ID format is gid, but needs normalization");
            initialValues.variantId = variantsById[numericId];
          }
        } else {
          console.log("Could not match variant ID, using first available variant");
          initialValues.variantId = product.variants[0]?.id || '';
        }
      }

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
    // Get position from multiple possible field names for compatibility
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
    
    if (!itemKey) {
      console.error("Missing item key - required for cart updates");
      return json({
        success: false,
        message: "Missing item key - required for editing existing items",
        debug: { receivedValues: { text, fontFamily, fontSize, color, variantId, position, itemKey } }
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
      // Use URL constructor to ensure proper URL formation
      const bridgeUrl = new URL(`https://${shopifyDomain}/pages/update-cart-item-bridge`);
      
      // Add parameters using URLSearchParams for proper encoding
      bridgeUrl.searchParams.append('variant_id', finalVariantId);
      bridgeUrl.searchParams.append('custom_text', text);
      bridgeUrl.searchParams.append('font_family', fontFamily);
      bridgeUrl.searchParams.append('font_size', fontSize);
      bridgeUrl.searchParams.append('text_color', color);
      bridgeUrl.searchParams.append('position', position);
      
      // Add item key to identify which cart item to update - this is crucial
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const maxRetries = 3;
  
  // Log all data received from loader for debugging
  useEffect(() => {
    console.log("Edit page loaded with data:", {
      hasProduct: !!product,
      error,
      initialValues,
      searchParams: Object.fromEntries([...searchParams.entries()])
    });
    
    // Clear any stored bridge requests on fresh load to avoid redirect loops
    if (typeof window !== 'undefined') {
      // Check if redirect attempt counter is too high
      const redirectAttempt = parseInt(sessionStorage.getItem('redirectAttempt') || '0', 10);
      if (redirectAttempt > 2) { // Allow only 2 attempts
        console.log("Too many redirect attempts, clearing stored bridge request");
        sessionStorage.removeItem('pendingBridgeRequest');
        sessionStorage.removeItem('retryCount');
        sessionStorage.removeItem('redirectAttempt');
      }
    }
  }, [product, error, initialValues, searchParams]);
  
  // Handle the action response (success/error)
  useEffect(() => {
    console.log("Action data received:", actionData);
    
    if (actionData?.bridgeUrl) {
      console.log("Preparing to redirect to bridge URL:", actionData.bridgeUrl);
      
      // Store the bridge URL in state for the confirmation step
      setPendingBridgeRequest(actionData.bridgeUrl);
      
      // Do not automatically redirect - let the user confirm first
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAttempt'); // Reset counter
      }
    } else if (actionData?.error) {
      console.error("Action error:", actionData.error);
    }
  }, [actionData]);
  
  // Check for stored bridge requests on initial load
  useEffect(() => {
    // Clear any redirect attempt counter on page load to break potential loops
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('redirectAttempt');
      console.log("Cleared redirect attempt counter on page load");
    }
    
    const checkForStoredBridgeRequest = () => {
      if (typeof window !== 'undefined') {
        const storedBridgeRequest = sessionStorage.getItem('pendingBridgeRequest');
        
        if (storedBridgeRequest) {
          console.log("Found stored bridge request:", storedBridgeRequest);
          
          setPendingBridgeRequest(storedBridgeRequest);
          
          // DISABLE AUTOMATIC REDIRECT ON PAGE LOAD
          // We'll let the user initiate the redirect after reviewing their customization
          console.log("Stored bridge request found but not automatically redirecting");
          
          // Clear the stored bridge request to prevent issues on future loads
          // but keep the URL in component state
          sessionStorage.removeItem('pendingBridgeRequest');
        } else {
          console.log("No stored bridge request found");
        }
      }
    };
    
    checkForStoredBridgeRequest();
  }, []);
  
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
          sessionStorage.removeItem('redirectAttempt');
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
      sessionStorage.removeItem('redirectAttempt');
    }
  };
  
  // Handle form submission
  const handleSubmit = (formData: FormData) => {
    // Add the item key to the form data if available
    if (initialValues.itemKey) {
      formData.append('itemKey', initialValues.itemKey);
      console.log("Added itemKey to form data:", initialValues.itemKey);
    }
    
    // Clear any redirect attempt counter
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('redirectAttempt');
    }
    
    // Submit the form data to the action
    console.log("Submitting form to action handler");
    submit(formData, { method: 'post' });
  };
  
  const confirmUpdate = () => {
    if (pendingBridgeRequest) {
      // Set redirect attempt counter to 1 for this redirect
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAttempt'); // Clear first
        sessionStorage.setItem('redirectAttempt', '1'); // Set to 1
      }
      
      console.log("User confirmed, redirecting to bridge URL:", pendingBridgeRequest);
      window.location.href = pendingBridgeRequest;
    }
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
          <Button variant="primary" onClick={() => {
            // Clear any redirect attempt counter
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('redirectAttempt');
            }
            window.location.href = '/cart';
          }}>
            Return to Cart
          </Button>
          <Button onClick={() => {
            // Clear any redirect attempt counter
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('redirectAttempt');
            }
            window.location.reload();
          }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (pendingBridgeRequest) {
    return (
      <div className="customizer-container">
        <div className="customizer-header">
          <Text variant="heading2xl" as="h1">Confirm Your Customization</Text>
          <Text as="p">Your customization is ready to be updated in your cart</Text>
        </div>
        
        <Divider />
        
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Box padding="400">
                <Banner
                  title="Your customization has been prepared"
                  tone="success"
                >
                  <p>Review your customization details before finalizing the update to your cart.</p>
                </Banner>
                
                <div style={{ marginTop: "20px" }}>
                  <Text variant="headingMd" as="h2">Customization Details</Text>
                  <ul style={{ marginTop: "10px" }}>
                    <li><strong>Product:</strong> {product?.title}</li>
                    <li><strong>Custom Text:</strong> {initialValues.customText}</li>
                    <li><strong>Font:</strong> {initialValues.fontFamily}</li>
                    <li><strong>Font Size:</strong> {initialValues.fontSize}</li>
                    <li><strong>Text Color:</strong> {initialValues.textColor}</li>
                    <li><strong>Position:</strong> {initialValues.position || initialValues.textPosition}</li>
                    {initialValues.petPhotoUrl && <li><strong>Pet Photo:</strong> Included</li>}
                  </ul>
                </div>
                
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <Button variant="primary" onClick={confirmUpdate}>
                    Update Cart Item
                  </Button>
                  <Button variant="plain" onClick={() => {
                    // Clear the pending bridge request
                    setPendingBridgeRequest(null);
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('pendingBridgeRequest');
                      sessionStorage.removeItem('retryCount');
                      sessionStorage.removeItem('redirectAttempt');
                    }
                  }}>
                    Edit Again
                  </Button>
                  <Button variant="plain" onClick={() => {
                    // Clear any redirect related data
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('redirectAttempt');
                      sessionStorage.removeItem('pendingBridgeRequest');
                      sessionStorage.removeItem('retryCount');
                    }
                    window.location.href = '/cart';
                  }}>
                    Cancel and Return to Cart
                  </Button>
                </div>
              </Box>
            </BlockStack>
          </Card>
        </BlockStack>
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
                      textPosition: initialValues.textPosition || initialValues.position,
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
          <Button variant="plain" onClick={() => {
            // Clear any redirect attempt counter
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('redirectAttempt');
              sessionStorage.removeItem('pendingBridgeRequest');
              sessionStorage.removeItem('retryCount');
            }
            window.location.href = '/cart';
          }}>
            Cancel and Return to Cart
          </Button>
        </div>
      </BlockStack>
    </div>
  );
} 
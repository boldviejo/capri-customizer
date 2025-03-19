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
  const fontSize = Number(formData.get("fontSize") || 16);
  const color = String(formData.get("color") || "");
  const variantId = String(formData.get("variantId") || "");
  const returnUrl = String(formData.get("returnUrl") || ""); // Optional return URL
  const petPhotoUrl = String(formData.get("petPhotoUrl") || ""); // Get the pet photo URL
  
  if (!text || !fontFamily || !fontSize || !color || !variantId) {
    return json({
      success: false,
      message: "Missing required fields"
    });
  }
  
  try {
    // Get the Shopify domain
    const shopifyDomain = getShopifyDomain();
    
    // Extract the numeric variant ID (removing the gid:// prefix if present)
    const cleanVariantId = variantId.includes('gid://shopify/ProductVariant/') 
      ? variantId.replace("gid://shopify/ProductVariant/", "") 
      : variantId;
    
    // Get the app origin for potential return URL
    const appOrigin = request.headers.get('origin') || 
      request.headers.get('referer')?.split('/').slice(0, 3).join('/') || 
      '';
    
    // Return the data to be passed to the bridge page
    return json({
      success: true,
      customizationData: {
        variantId: cleanVariantId,
        text,
        fontFamily,
        fontSize: fontSize.toString(),
        color,
        petPhotoUrl, // Include pet photo URL
        shopifyDomain,
        // Send the return URL if provided, otherwise use the current app URL
        returnUrl: returnUrl || appOrigin
      },
      message: "Ready to add to cart"
    });
    
  } catch (error) {
    console.error("Error processing customization:", error);
    return json({
      success: false,
      message: "An error occurred while processing your customization"
    });
  }
};

export default function ProductCustomizer() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { product, error, shopifyDomain } = data;
  const submit = useSubmit();
  const actionData = useActionData();
  
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState<number>(16);
  const [color, setColor] = useState('#000000');
  const [petPhotoUrl, setPetPhotoUrl] = useState('');
  
  // Cart state
  const [cartId, setCartId] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Process action data when it changes
  useEffect(() => {
    if (actionData) {
      handleActionResponse(actionData);
    }
  }, [actionData]);
  
  // Set the default variant when the product loads
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const availableVariant = product.variants.find((v: ProductVariant) => v.availableForSale);
      setSelectedVariantId(availableVariant?.id || product.variants[0].id);
    }
    
    // Load cart ID from localStorage if available
    const savedCartId = localStorage.getItem("shopifyCartId");
    if (savedCartId) {
      setCartId(savedCartId);
    }
  }, [product]);
  
  // Store the Shopify domain in localStorage for client-side use
  useEffect(() => {
    if (shopifyDomain && typeof window !== 'undefined') {
      localStorage.setItem('shopifyDomain', shopifyDomain);
    }
  }, [shopifyDomain]);
  
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
  
  // Handle form submission result with improved error handling and retries
  const handleActionResponse = (response: any) => {
    if (response?.success && response.customizationData) {
      // We have the customization data - prepare to redirect to bridge
      const data = response.customizationData;
      const domain = data.shopifyDomain || getClientShopifyDomain();
      
      try {
        // Encode all parameters for URL safety
        const returnUrl = '';
        
        const bridgeUrl = `https://${domain}/pages/add-to-cart-bridge?` + 
          `variant_id=${encodeURIComponent(data.variantId)}&` +
          `custom_text=${encodeURIComponent(data.text || '')}&` +
          `font_family=${encodeURIComponent(data.fontFamily || '')}&` +
          `font_size=${encodeURIComponent(data.fontSize || '')}&` +
          `text_color=${encodeURIComponent(data.color || '')}&` +
          `pet_photo_url=${encodeURIComponent(data.petPhotoUrl || '')}&` +
          `return_url=${encodeURIComponent(returnUrl)}`;
        
        console.log("Redirecting to bridge page:", bridgeUrl);
        
        // Store the last successful bridge URL in localStorage for potential retries
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastBridgeUrl', bridgeUrl);
          localStorage.setItem('lastBridgeTime', Date.now().toString());
        }
        
        // Redirect to the bridge page
        window.location.href = bridgeUrl;
      } catch (error) {
        console.error("Error constructing bridge URL:", error);
        setErrorMessage("An error occurred while processing your request. Please try again.");
      }
    } else if (response?.message) {
      setErrorMessage(response.message);
    }
  };
  
  // Add a retry function
  const retryLastBridge = () => {
    const lastBridgeUrl = localStorage.getItem('lastBridgeUrl');
    if (lastBridgeUrl) {
      window.location.href = lastBridgeUrl;
    } else {
      setErrorMessage("No previous add to cart attempt found. Please try submitting the form again.");
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddedToCart(false);
    setErrorMessage("");
    
    if (!customText) {
      setErrorMessage("Please enter your custom text");
      return;
    }
    
    if (!selectedVariantId) {
      setErrorMessage("Please select a product variant");
      return;
    }
    
    if (!petPhotoUrl) {
      setErrorMessage("Please upload a pet photo");
      return;
    }
    
    const formData = new FormData();
    formData.append("text", customText);
    formData.append("fontFamily", fontFamily);
    formData.append("fontSize", fontSize.toString());
    formData.append("color", color);
    formData.append("variantId", selectedVariantId);
    formData.append("returnUrl", window.location.href);
    formData.append("petPhotoUrl", petPhotoUrl);
    
    submit(formData, { method: "post" });
  };
  
  const variantOptions = product.variants.map((variant: ProductVariant) => ({
    label: variant.title,
    value: variant.id,
  }));
  
  const fontOptions = [
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Verdana", value: "Verdana" },
  ];
  
  const fontSizeOptions = [
    { label: "Small (12px)", value: "12" },
    { label: "Medium (16px)", value: "16" },
    { label: "Large (20px)", value: "20" },
    { label: "Extra Large (24px)", value: "24" },
  ];
  
  const colorOptions = [
    { label: "Black", value: "#000000" },
    { label: "Red", value: "#FF0000" },
    { label: "Blue", value: "#0000FF" },
    { label: "Green", value: "#00FF00" },
    { label: "Gold", value: "#FFD700" },
    { label: "Silver", value: "#C0C0C0" },
  ];
  
  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <BlockStack gap="500">
          <Box padding="400">
            <BlockStack gap="400">
              <Text as="h1" variant="headingXl">{product.title}</Text>
              
              {addedToCart && (
                <Card>
                  <BlockStack gap="200">
                    <Box padding="300">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="bold" tone="success">Your customized item has been added to cart!</Text>
                        <Text as="p">You have {cartQuantity} item(s) in your cart.</Text>
                        <InlineStack gap="200" align="start">
                          <Button url={checkoutUrl} target="_blank">
                            Proceed to Checkout
                          </Button>
                          <Button onClick={() => setAddedToCart(false)} variant="plain">
                            Add Another Item
                          </Button>
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Card>
              )}
              
              {errorMessage && (
                <Card>
                  <Box padding="300">
                    <Text as="p" tone="critical">{errorMessage}</Text>
                  </Box>
                </Card>
              )}
              
              <InlineStack gap="500" wrap={false} align="start">
                <div style={{ flex: '0 0 40%' }}>
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={product.images[0].url} 
                      alt={product.images[0].altText || product.title}
                      style={{ maxWidth: '100%', borderRadius: '8px' }} 
                    />
                  )}
                </div>
                
                <div style={{ flex: '1 1 60%' }}>
                  <BlockStack gap="400">
                    <Form method="post" onSubmit={handleSubmit}>
                      <BlockStack gap="400">
                        {product.variants.length > 1 && (
                          <Select
                            label="Select variant"
                            options={variantOptions}
                            onChange={setSelectedVariantId}
                            value={selectedVariantId}
                          />
                        )}
                        
                        <Divider />
                        
                        <CloudinaryUploader
                          cloudName={process.env.CLOUDINARY_CLOUD_NAME || "dqnlrk9jl"}
                          uploadPreset="capricustomizer"
                          onImageUploaded={(url) => setPetPhotoUrl(url)}
                          onUploadError={(error) => console.error('Upload error:', error)}
                        />
                        
                        <Divider />
                        
                        <TextField
                          label="Your Custom Text"
                          value={customText}
                          onChange={setCustomText}
                          autoComplete="off"
                          placeholder="Enter text for your customization"
                        />
                        
                        <Select
                          label="Font Style"
                          options={fontOptions}
                          onChange={setFontFamily}
                          value={fontFamily}
                        />
                        
                        <Select
                          label="Font Size"
                          options={fontSizeOptions}
                          onChange={(value) => setFontSize(parseInt(value, 10))}
                          value={fontSize.toString()}
                        />
                        
                        <Box paddingBlockStart="200" paddingBlockEnd="200">
                          <Text as="h3" variant="headingMd">Text Color</Text>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {colorOptions.map((option) => (
                              <div 
                                key={option.value}
                                onClick={() => setColor(option.value)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  backgroundColor: option.value,
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  border: color === option.value ? '3px solid #000' : '1px solid #ccc',
                                }}
                                title={option.label}
                              />
                            ))}
                          </div>
                        </Box>
                        
                        <Box paddingBlockStart="200">
                          <Text as="h3" variant="headingMd">Preview</Text>
                          <div 
                            style={{ 
                              fontFamily, 
                              fontSize: `${fontSize}px`, 
                              color: color,
                              padding: '20px',
                              border: '1px dashed #ccc',
                              borderRadius: '8px',
                              minHeight: '100px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: '8px',
                              backgroundColor: '#f9f9f9',
                              backgroundImage: petPhotoUrl ? `url(${petPhotoUrl})` : 'none',
                              backgroundSize: petPhotoUrl ? 'cover' : 'auto',
                              backgroundPosition: 'center',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              padding: '10px',
                              borderRadius: '4px',
                              maxWidth: '80%'
                            }}>
                              {customText || "Your text will appear here"}
                            </div>
                          </div>
                        </Box>
                        
                        <Box paddingBlockStart="400">
                          <Button 
                            submit
                            variant="primary" 
                            disabled={!customText || !selectedVariantId || !petPhotoUrl}
                            size="large"
                            fullWidth
                          >
                            Add Customized Item to Cart
                          </Button>
                        </Box>
                      </BlockStack>
                    </Form>
                  </BlockStack>
                </div>
              </InlineStack>
              
              {product.description && (
                <BlockStack gap="200">
                  <Divider />
                  <Text as="h2" variant="headingLg">Product Description</Text>
                  <div 
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    style={{ lineHeight: '1.6' }}
                  />
                </BlockStack>
              )}
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>
    </div>
  );
} 
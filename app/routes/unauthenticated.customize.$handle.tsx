import { useState, useEffect } from "react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs, type LinksFunction } from "@remix-run/node";
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
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { handle } = params;

  if (!handle) {
    return json({ 
      error: "Product handle is required" 
    }, { status: 400 });
  }

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
        error: null
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
      error: null
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
  const cartId = String(formData.get("cartId") || "");
  
  if (!text || !fontFamily || !fontSize || !color || !variantId) {
    return json({
      success: false,
      message: "Missing required fields"
    });
  }
  
  try {
    let existingCartId = cartId;
    
    // If there's no cartId provided, we'll need to create a new cart
    // Shopify carts are tied to browser cookies, so we can't easily fetch an existing cart
    // without the cart ID
    
    let query = '';
    let variables: any = {};
    
    if (existingCartId) {
      // If we have a cart ID, add to existing cart
      query = `
        mutation addToCart($cartId: ID!, $variantId: ID!, $customText: String!, $fontFamily: String!, $fontSize: String!, $color: String!) {
          cartLinesAdd(
            cartId: $cartId,
            lines: [
              {
                quantity: 1
                merchandiseId: $variantId
                attributes: [
                  { key: "Custom Text", value: $customText }
                  { key: "Font", value: $fontFamily }
                  { key: "Font Size", value: $fontSize }
                  { key: "Text Color", value: $color }
                ]
              }
            ]
          ) {
            cart {
              id
              checkoutUrl
              totalQuantity
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          title
                        }
                      }
                    }
                    attributes {
                      key
                      value
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        cartId: existingCartId,
        variantId,
        customText: text,
        fontFamily,
        fontSize: fontSize.toString(),
        color,
      };
    } else {
      // Create a new cart
      query = `
        mutation createCart($variantId: ID!, $customText: String!, $fontFamily: String!, $fontSize: String!, $color: String!) {
          cartCreate(
            input: {
              lines: [
                {
                  quantity: 1
                  merchandiseId: $variantId
                  attributes: [
                    { key: "Custom Text", value: $customText }
                    { key: "Font", value: $fontFamily }
                    { key: "Font Size", value: $fontSize }
                    { key: "Text Color", value: $color }
                  ]
                }
              ]
            }
          ) {
            cart {
              id
              checkoutUrl
              totalQuantity
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          title
                        }
                      }
                    }
                    attributes {
                      key
                      value
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        variantId,
        customText: text,
        fontFamily,
        fontSize: fontSize.toString(),
        color,
      };
    }

    const responseData = await queryStorefrontApi(query, variables);
    
    // Determine which response structure we get based on the query used
    const operationName = existingCartId ? 'cartLinesAdd' : 'cartCreate';
    const userErrors = responseData.data?.[operationName]?.userErrors || [];
    
    if (userErrors.length > 0) {
      return json({
        success: false,
        message: userErrors[0].message || "Failed to add item to cart"
      });
    }
    
    const cartDetails = responseData.data?.[operationName]?.cart;
    
    if (!cartDetails) {
      return json({
        success: false,
        message: "Failed to create or update cart"
      });
    }
    
    try {
      // Get the Shopify domain
      const shopifyDomain = getShopifyDomain();
      
      // Extract variant ID and quantity from the line items
      const lineItems = cartDetails.lines.edges;
      if (!lineItems || lineItems.length === 0) {
        console.error("No line items found in cart");
        // Fallback to checkout URL if no line items found
        return redirect(cartDetails.checkoutUrl);
      }
      
      // Create a Shopify cart permalink
      // Format: https://domain.myshopify.com/cart/{variant_id}:{quantity}
      // For multiple items: https://domain.myshopify.com/cart/{variant_id}:{quantity},{variant_id2}:{quantity2}
      
      // Extract variant IDs and quantities from the cart
      const itemsString = lineItems.map((item: any) => {
        const variantId = item.node.merchandise.id.split('/').pop();
        const quantity = item.node.quantity;
        return `${variantId}:${quantity}`;
      }).join(',');
      
      // Create the permalink URL for the CART, not checkout
      // Using direct structure for cart
      const cartUrl = `https://${shopifyDomain}/cart/${itemsString}`;
      
      console.log("Redirecting to cart URL:", cartUrl);
      return redirect(cartUrl);
      
    } catch (error) {
      console.error("Error constructing cart URL:", error);
      
      // Fallback - use the raw checkoutUrl provided by Shopify
      return redirect(cartDetails.checkoutUrl);
    }
    
  } catch (error) {
    console.error("Error adding to cart:", error);
    return json({
      success: false,
      message: "An error occurred while adding your customization to cart"
    });
  }
};

export default function ProductCustomizer() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { product, error } = data;
  const submit = useSubmit();
  const actionData = useActionData();
  
  const [customText, setCustomText] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  
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
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddedToCart(false);
    setErrorMessage("");
    
    const formData = new FormData();
    formData.append("text", customText);
    formData.append("fontFamily", fontFamily);
    formData.append("fontSize", fontSize.toString());
    formData.append("color", textColor);
    formData.append("variantId", selectedVariantId);
    
    // Add cart ID if we have one
    if (cartId) {
      formData.append("cartId", cartId);
    }
    
    const response = await submit(formData, { method: "post", replace: true });
    
    // The response is handled by useActionData in a useEffect below
  };
  
  // Handle form submission result
  useEffect(() => {
    // Check if there's action data in the URL (Remix stores it there after non-JS submissions)
    const url = window.location.href;
    if (url.includes('success=true')) {
      // Extract data from URL if needed
      setAddedToCart(true);
    }
  }, []);
  
  // Handle asynchronous response from form submission
  const handleActionResponse = (response: any) => {
    if (response?.success) {
      // Save cart ID for future use
      if (response.cartId) {
        localStorage.setItem("shopifyCartId", response.cartId);
        setCartId(response.cartId);
      }
      
      // Update cart state
      setCheckoutUrl(response.checkoutUrl);
      setCartQuantity(response.totalQuantity);
      setAddedToCart(true);
      
      // Clear form for next item
      setCustomText("");
    } else if (response?.message) {
      setErrorMessage(response.message);
    }
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
                                onClick={() => setTextColor(option.value)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  backgroundColor: option.value,
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  border: textColor === option.value ? '3px solid #000' : '1px solid #ccc',
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
                              color: textColor,
                              padding: '20px',
                              border: '1px dashed #ccc',
                              borderRadius: '8px',
                              minHeight: '100px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: '8px',
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            {customText || "Your text will appear here"}
                          </div>
                        </Box>
                        
                        <Box paddingBlockStart="400">
                          <Button 
                            submit
                            variant="primary" 
                            disabled={!customText || !selectedVariantId}
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
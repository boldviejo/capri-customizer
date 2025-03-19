import { useState, useEffect } from "react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import {
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
  TextField,
  Select,
  ChoiceList,
  InlineStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "stylesheet", href: "@shopify/polaris/build/esm/styles.css" }
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    const { handle } = params;

    if (!handle) {
      return json({ 
        error: "Product handle is required" 
      }, { status: 400 });
    }

    // Get the product by handle
    const productResponse = await admin.graphql(`
      query {
        productByHandle(handle: "${handle}") {
          id
          title
          handle
          description
          variants(first: 100) {
            edges {
              node {
                id
                title
                price
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
    `);

    const response = await productResponse.json();
    const productData = response.data.productByHandle;

    if (!productData) {
      return json({ 
        error: "Product not found" 
      }, { status: 404 });
    }

    const product = {
      id: productData.id,
      title: productData.title,
      handle: productData.handle,
      description: productData.description,
      variants: productData.variants.edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        price: node.price,
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
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    
    const text = String(formData.get("text") || "");
    const fontFamily = String(formData.get("fontFamily") || "");
    const fontSize = Number(formData.get("fontSize") || 16);
    const color = String(formData.get("color") || "");
    const variantId = String(formData.get("variantId") || "");
    
    if (!text || !fontFamily || !fontSize || !color || !variantId) {
      return json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Create a cart and add the item with customization properties
    const cartCreateResponse = await admin.graphql(`
      mutation {
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
    `);
    
    const cartData = await cartCreateResponse.json();
    const cartId = cartData.data.cartCreate.cart.id;
    
    // Create custom attributes for the cart item
    const customAttributes = [
      { key: "Custom Text", value: text },
      { key: "Font", value: fontFamily },
      { key: "Font Size", value: fontSize.toString() },
      { key: "Text Color", value: color }
    ];
    
    // Add the item to the cart with customization notes
    const cartLineAddResponse = await admin.graphql(`
      mutation {
        cartLinesAdd(
          cartId: "${cartId}",
          lines: [
            {
              merchandiseId: "${variantId}",
              quantity: 1,
              attributes: [
                ${customAttributes.map(attr => `{ key: "${attr.key}", value: "${attr.value}" }`).join(',')}
              ]
            }
          ]
        ) {
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
    `);
    
    const cartLineData = await cartLineAddResponse.json();
    
    if (cartLineData.data?.cartLinesAdd?.userErrors?.length > 0) {
      return json({
        success: false,
        message: "Failed to add item to cart"
      });
    }
    
    const checkoutUrl = cartLineData.data.cartLinesAdd.cart.checkoutUrl;
    
    // Redirect to checkout
    return redirect(checkoutUrl);
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
  
  const [customText, setCustomText] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  
  // Set the default variant when the product loads
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const availableVariant = product.variants.find((v: ProductVariant) => v.availableForSale);
      setSelectedVariantId(availableVariant?.id || product.variants[0].id);
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
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    submit(
      {
        text: customText,
        fontFamily,
        fontSize: fontSize.toString(),
        color: textColor,
        variantId: selectedVariantId,
      },
      { method: "post" }
    );
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
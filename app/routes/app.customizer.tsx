import { useState, useCallback } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
  TextField,
  Select,
  InlineStack,
  Banner,
  Frame,
  FooterHelp,
  Link as PolarisLink,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useEffect } from "react";
import { PrismaClient } from "@prisma/client";

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
  variants: ProductVariant[];
}

// Add this type to help TypeScript understand our action data
type ActionData = 
  | { success: true; customization: any; checkoutUrl: string }
  | { success: false; message: string; errors?: any[] };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Get a sample product to demonstrate the customizer
  const products = await admin.graphql(`
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `);

  const response = await products.json();
  
  return json({
    products: response.data.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      variants: node.variants.edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        price: node.price,
        availableForSale: node.availableForSale,
      }))
    })) as Product[]
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const text = String(formData.get("text"));
  const fontFamily = String(formData.get("fontFamily"));
  const fontSize = Number(formData.get("fontSize"));
  const color = String(formData.get("color"));
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  
  try {
    // Save the customization data to our database
    // Use type assertion to bypass the TypeScript error
    const prismaAny = prisma as any;
    const customization = await prismaAny.Customization.create({
      data: {
        shop: session.shop,
        text,
        fontFamily,
        fontSize,
        color,
        productId,
        variantId,
      },
    });
    
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
      { key: "Text Color", value: color },
      { key: "Customization ID", value: customization.id }
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
            lines(first: 10) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
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
    `);
    
    const cartLineData = await cartLineAddResponse.json();
    
    if (cartLineData.data?.cartLinesAdd?.userErrors?.length > 0) {
      return json({
        success: false,
        errors: cartLineData.data.cartLinesAdd.userErrors,
        message: "Failed to add item to cart"
      });
    }
    
    const checkoutUrl = cartLineData.data.cartLinesAdd.cart.checkoutUrl;
    
    return json({ 
      customization,
      success: true,
      checkoutUrl
    });
  } catch (error) {
    console.error("Error:", error);
    return json({
      success: false,
      message: "An error occurred while saving your customization"
    });
  }
};

export default function ProductCustomizer() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  
  const [customText, setCustomText] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  
  // Show success message when action is successful
  useEffect(() => {
    if (actionData?.success) {
      setSuccess(true);
      // Hide success banner after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } else if (actionData && !actionData.success) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  }, [actionData]);
  
  // Update variants when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p: Product) => p.id === selectedProductId);
      if (product) {
        setVariants(product.variants);
        if (product.variants.length > 0) {
          setSelectedVariantId(product.variants[0].id);
        }
      }
    }
  }, [selectedProductId, products]);
  
  const handleSubmit = useCallback(() => {
    submit(
      {
        text: customText,
        fontFamily,
        fontSize: fontSize.toString(),
        color: textColor,
        productId: selectedProductId,
        variantId: selectedVariantId,
      },
      { method: "post" }
    );
  }, [customText, fontFamily, fontSize, textColor, selectedProductId, selectedVariantId, submit]);
  
  const productOptions = products.map((product: Product) => ({
    label: product.title,
    value: product.id,
  }));
  
  const variantOptions = variants.map((variant: ProductVariant) => ({
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
    <Page title="Product Customizer">
      <Frame>
        {success && (
          <Banner
            title="Customization saved"
            tone="success"
            onDismiss={() => setSuccess(false)}
          >
            <p>The customization has been saved. You can now proceed to checkout.</p>
            {actionData?.success && 'checkoutUrl' in actionData && (
              <div style={{ marginTop: '10px' }}>
                <Button
                  url={actionData.checkoutUrl}
                  target="_blank"
                  variant="primary"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </Banner>
        )}
        
        {error && (
          <Banner
            title="Error"
            tone="critical"
            onDismiss={() => setError(false)}
          >
            <p>{actionData && !actionData.success && 'message' in actionData ? actionData.message : "An error occurred while saving your customization"}</p>
          </Banner>
        )}
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Box padding="400">
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingLg">Create Your Custom Product</Text>
                    
                    <Select
                      label="Select a product"
                      options={productOptions}
                      onChange={setSelectedProductId}
                      value={selectedProductId}
                    />
                    
                    {variants.length > 0 && (
                      <Select
                        label="Select a variant"
                        options={variantOptions}
                        onChange={setSelectedVariantId}
                        value={selectedVariantId}
                      />
                    )}
                    
                    <Divider />
                    
                    <TextField
                      label="Custom Text"
                      value={customText}
                      onChange={setCustomText}
                      autoComplete="off"
                      placeholder="Enter text for your customization"
                    />
                    
                    <Select
                      label="Font Family"
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
                    
                    <Select
                      label="Text Color"
                      options={colorOptions}
                      onChange={setTextColor}
                      value={textColor}
                    />
                    
                    <Box paddingBlockStart="400">
                      <InlineStack gap="300" align="end">
                        <Button 
                          variant="primary" 
                          onClick={handleSubmit}
                          loading={isLoading}
                          disabled={!customText || !selectedProductId || !selectedVariantId}
                        >
                          Save & Add to Cart
                        </Button>
                      </InlineStack>
                    </Box>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">Preview</Text>
                    <Divider />
                    <div 
                      style={{ 
                        fontFamily, 
                        fontSize: `${fontSize}px`, 
                        color: textColor,
                        padding: '20px',
                        border: '1px dashed #ccc',
                        borderRadius: '4px',
                        minHeight: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {customText || "Your text will appear here"}
                    </div>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        <FooterHelp>
          This customization will be saved and added to your cart. You can then proceed to checkout.
        </FooterHelp>
      </Frame>
    </Page>
  );
} 
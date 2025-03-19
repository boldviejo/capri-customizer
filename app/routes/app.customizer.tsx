import { useState, useCallback } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
  TextField,
  Select,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useEffect } from "react";

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
  
  // Get product data from the URL query parameters
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  
  if (!productId) {
    return json({
      product: null,
      variants: []
    });
  }
  
  // Get the specific product
  const productQuery = await admin.graphql(`
    query {
      product(id: "${productId}") {
        id
        title
        handle
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
      }
    }
  `);

  const response = await productQuery.json();
  const productData = response.data.product;
  
  if (!productData) {
    return json({
      product: null,
      variants: []
    });
  }
  
  const product = {
    id: productData.id,
    title: productData.title,
    handle: productData.handle,
    variants: productData.variants.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      price: node.price,
      availableForSale: node.availableForSale,
    }))
  };
  
  return json({
    product,
    variants: product.variants
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
  const { product, variants } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  
  const [customText, setCustomText] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(variants.length > 0 ? variants[0].id : "");
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
  
  const handleSubmit = useCallback(() => {
    if (!product) return;
    
    submit(
      {
        text: customText,
        fontFamily,
        fontSize: fontSize.toString(),
        color: textColor,
        productId: product.id,
        variantId: selectedVariantId,
      },
      { method: "post" }
    );
  }, [customText, fontFamily, fontSize, textColor, product, selectedVariantId, submit]);
  
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
  
  if (!product) {
    return <Card>
      <BlockStack gap="400">
        <Box padding="400">
          <Text as="p">Please specify a product ID in the URL parameters</Text>
        </Box>
      </BlockStack>
    </Card>;
  }
  
  return (
    <Card>
      {success && (
        <Banner
          title="Customization saved"
          tone="success"
          onDismiss={() => setSuccess(false)}
        >
          <p>Your customization has been added to cart.</p>
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
      
      <BlockStack gap="400">
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">Customize Your {product.title}</Text>
            
            {variants.length > 1 && (
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
            
            <Select
              label="Text Color"
              options={colorOptions}
              onChange={setTextColor}
              value={textColor}
            />
            
            <div 
              style={{ 
                fontFamily, 
                fontSize: `${fontSize}px`, 
                color: textColor,
                padding: '20px',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              {customText || "Your text will appear here"}
            </div>
            
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!customText || !selectedVariantId}
              size="large"
              fullWidth
            >
              Add Customized Item to Cart
            </Button>
          </BlockStack>
        </Box>
      </BlockStack>
    </Card>
  );
} 
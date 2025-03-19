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
  ChoiceList,
  InlineStack,
} from "@shopify/polaris";

import { authenticate, getShopifyDomain, queryStorefrontApi } from "../shopify.server";
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
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    // Since authenticate.admin() is just a stub in this app, we'll proceed without checking admin
    const { handle } = params;

    if (!handle) {
      return json({ 
        error: "Product handle is required" 
      }, { status: 400 });
    }

    // Mock product data for testing
    if (handle === "sample-product-1" || handle === "sample-product-2") {
      const productNumber = handle === "sample-product-1" ? "1" : "2";
      
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
    }

    // Using Storefront API instead of Admin API for product fetching
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
  try {
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
        success: false,
        message: "Missing required fields"
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
    
    // Return the bridge URL
    return json({
      success: true,
      bridgeUrl: finalBridgeUrl,
      message: "Redirecting to add-to-cart bridge"
    });
    
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
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  // Handle the action response (success/error)
  useEffect(() => {
    if (actionData?.bridgeUrl) {
      // If we have a bridge URL, redirect to it
      window.location.href = actionData.bridgeUrl;
    } else if (actionData?.message && !actionData.success) {
      // Handle error
      alert(actionData.message);
    }
  }, [actionData]);
  
  const handleSubmit = (formData: FormData) => {
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
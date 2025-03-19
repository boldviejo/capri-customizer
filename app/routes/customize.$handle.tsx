import { useState, useEffect } from "react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs, type LinksFunction } from "@remix-run/node";
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
    const authResult = await authenticate.admin(request);
    if (!authResult.admin) {
      return json({
        success: false,
        message: "Authentication failed"
      }, { status: 401 });
    }
    
    const { admin } = authResult;
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
    
    if (cartData.data?.cartCreate?.userErrors?.length > 0) {
      return json({
        success: false,
        message: cartData.data.cartCreate.userErrors[0].message
      });
    }
    
    const cartId = cartData.data.cartCreate.cart.id;
    
    // Create custom attributes for the cart item
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
      .map(attr => `{ key: "${attr.key}", value: "${attr.value}" }`)
      .join(',');
    
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
                ${attributesString}
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
        message: "Failed to add item to cart: " + cartLineData.data.cartLinesAdd.userErrors[0].message
      });
    }
    
    const checkoutUrl = cartLineData.data.cartLinesAdd.cart.checkoutUrl;
    
    // Return the checkout URL for redirect
    return json({
      success: true,
      checkoutUrl,
      message: "Item added to cart successfully"
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
  const submit = useSubmit();
  
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
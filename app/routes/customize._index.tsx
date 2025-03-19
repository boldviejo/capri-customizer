import { useEffect, useState } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Text,
  Card,
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  Button,
  Spinner,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "stylesheet", href: "@shopify/polaris/build/esm/styles.css" }
];

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: {
    url: string;
    altText: string;
  } | null;
}

interface LoaderData {
  products: Product[];
  error: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);

    // Get a list of products
    const productsResponse = await admin.graphql(`
      query {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description(truncateAt: 120)
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    `);

    const response = await productsResponse.json();
    const productsData = response.data.products.edges;

    const products = productsData.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      featuredImage: node.featuredImage ? {
        url: node.featuredImage.url,
        altText: node.featuredImage.altText || node.title,
      } : null
    }));

    return json({
      products,
      error: null
    });
  } catch (error) {
    console.error("Error loading products:", error);
    return json({ 
      products: [],
      error: "Failed to load products" 
    }, { status: 500 });
  }
};

export default function CustomizeProductsIndex() {
  const { products, error } = useLoaderData<typeof loader>() as LoaderData;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to allow Polaris styles to be applied
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spinner size="large" />
      </div>
    );
  }

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

  if (products.length === 0) {
    return (
      <Card>
        <BlockStack gap="400">
          <Box padding="400">
            <Text as="p">No products available for customization.</Text>
          </Box>
        </BlockStack>
      </Card>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BlockStack gap="800">
        <Box padding="400">
          <Text as="h1" variant="headingXl">Customize a Product</Text>
          <Text as="p" variant="bodyLg">Select a product below to add your custom personalization.</Text>
        </Box>

        <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </InlineGrid>
      </BlockStack>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <BlockStack gap="400">
        <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
          {product.featuredImage ? (
            <img 
              src={product.featuredImage.url} 
              alt={product.featuredImage.altText} 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }} 
            />
          ) : (
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f4f6f8',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <Text as="p" variant="bodyMd" tone="subdued">No image available</Text>
            </div>
          )}
        </div>
        
        <Box padding="400">
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">{product.title}</Text>
            {product.description && (
              <Text as="p" truncate>{product.description}</Text>
            )}
            <Box paddingBlockStart="300">
              <Link to={`/customize/${product.handle}`} style={{ textDecoration: 'none' }}>
                <Button fullWidth>Customize This Product</Button>
              </Link>
            </Box>
          </BlockStack>
        </Box>
      </BlockStack>
    </Card>
  );
} 
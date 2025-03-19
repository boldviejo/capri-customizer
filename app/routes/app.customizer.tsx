import { Text, Card, BlockStack, Box, List } from "@shopify/polaris";

export default function CustomizerInfo() {
  return (
    <Card>
      <BlockStack gap="400">
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">Product Customizer</Text>
            
            <Text as="p">
              The Product Customizer is available as a theme block that can be added to your product pages.
            </Text>
            
            <Text as="h3" variant="headingMd">How to add the customizer to your theme:</Text>
            
            <List type="number">
              <List.Item>
                Go to your Shopify admin dashboard
              </List.Item>
              <List.Item>
                Navigate to Online Store &gt; Themes
              </List.Item>
              <List.Item>
                Find your current theme and click "Customize"
              </List.Item>
              <List.Item>
                Open a product page template
              </List.Item>
              <List.Item>
                Click "Add block" and select "Product Customizer"
              </List.Item>
              <List.Item>
                Configure the options as desired
              </List.Item>
              <List.Item>
                Save your changes
              </List.Item>
            </List>
            
            <Text as="p">
              The customizer will now appear on your product pages, allowing customers to personalize products with custom text.
            </Text>
          </BlockStack>
        </Box>
      </BlockStack>
    </Card>
  );
} 
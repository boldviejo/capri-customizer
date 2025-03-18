import { useCallback, useState } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Text, Card, Button, BlockStack, InlineStack, TextField, ColorPicker, hsbToHex, Select } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

interface LoaderData {
  productCount: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  return json<LoaderData>({
    productCount: 0,
  });
};

export default function Index() {
  const { productCount } = useLoaderData<LoaderData>();
  
  // Customizer state
  const [customText, setCustomText] = useState("");
  const [color, setColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
  });
  const [fontSize, setFontSize] = useState("20");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [productPreview, setProductPreview] = useState("");
  
  const fontOptions = [
    {label: "Arial", value: "Arial"},
    {label: "Times New Roman", value: "Times New Roman"},
    {label: "Courier New", value: "Courier New"},
    {label: "Georgia", value: "Georgia"},
    {label: "Verdana", value: "Verdana"},
  ];
  
  const hexColor = hsbToHex(color);
  
  const handleFontFamilyChange = useCallback(
    (value: string) => setFontFamily(value),
    [],
  );
  
  const handleFontSizeChange = useCallback(
    (value: string) => setFontSize(value),
    [],
  );
  
  const handleCustomTextChange = useCallback(
    (value: string) => setCustomText(value),
    [],
  );
  
  const handleColorChange = useCallback(
    (value: any) => setColor(value),
    [],
  );
  
  const handleGeneratePreview = useCallback(() => {
    setProductPreview(`Custom Design Preview: "${customText}" in ${fontFamily}, ${fontSize}px, color ${hexColor}`);
  }, [customText, fontFamily, fontSize, hexColor]);
  
  const handleSaveCustomization = useCallback(() => {
    // In a real app, this would save to the database and apply to a product
    alert("Customization saved! In a real app, this would be applied to a product.");
  }, []);

  return (
    <Page title="Product Customizer">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text variant="headingMd" as="h2">Create your custom design</Text>
                
                <TextField
                  label="Custom Text"
                  value={customText}
                  onChange={handleCustomTextChange}
                  autoComplete="off"
                />
                
                <Select
                  label="Font Family"
                  options={fontOptions}
                  onChange={handleFontFamilyChange}
                  value={fontFamily}
                />
                
                <TextField
                  label="Font Size (px)"
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  type="number"
                  autoComplete="off"
                />
                
                <Text variant="bodyMd" as="p">Text Color</Text>
                <ColorPicker onChange={handleColorChange} color={color} />
                
                <InlineStack gap="300">
                  <Button variant="primary" onClick={handleGeneratePreview}>Preview Design</Button>
                  <Button onClick={handleSaveCustomization}>Save Customization</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text variant="headingMd" as="h2">Design Preview</Text>
                
                {productPreview ? (
                  <div style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px"
                  }}>
                    <div style={{
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      color: hexColor,
                    }}>
                      {customText || "Your custom text will appear here"}
                    </div>
                  </div>
                ) : (
                  <Text variant="bodyMd" as="p">Click "Preview Design" to see your customization</Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

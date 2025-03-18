import { useCallback, useState } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Page, Layout, Text, Card, Button, BlockStack, InlineStack, TextField, ColorPicker, hsbToHex, Select, Toast } from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

interface LoaderData {
  productCount: number;
  customizations: Array<{
    id: string;
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    createdAt: string;
  }>;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Get customizations for the current shop
  const customizations = await prisma.customization.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return json<LoaderData>({
    productCount: 0,
    customizations: customizations.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      fontSize: Number(c.fontSize)
    })),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const { text, fontFamily, fontSize, color } = Object.fromEntries(formData);
  
  // Save the customization to the database
  const customization = await prisma.customization.create({
    data: {
      shop: session.shop,
      text: String(text),
      fontFamily: String(fontFamily),
      fontSize: Number(fontSize),
      color: String(color),
    },
  });
  
  return json({ success: true, customization });
};

export default function Index() {
  const { customizations } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  
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
  const [showToast, setShowToast] = useState(false);
  
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
    // Save to the database
    const formData = new FormData();
    formData.append("text", customText);
    formData.append("fontFamily", fontFamily);
    formData.append("fontSize", fontSize);
    formData.append("color", hexColor);
    
    submit(formData, { method: "post" });
    setShowToast(true);
  }, [customText, fontFamily, fontSize, hexColor, submit]);

  const toggleToast = useCallback(() => setShowToast((showToast) => !showToast), []);

  return (
    <Page title="Product Customizer">
      {showToast && (
        <Toast content="Customization saved successfully!" onDismiss={toggleToast} />
      )}
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
          
          {customizations.length > 0 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <Text variant="headingMd" as="h2">Recent Customizations</Text>
                  
                  {customizations.map((customization) => (
                    <Card key={customization.id}>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">
                          {new Date(customization.createdAt).toLocaleString()}
                        </Text>
                        <div style={{
                          padding: "10px",
                          border: "1px solid #eee",
                          borderRadius: "4px",
                        }}>
                          <div style={{
                            fontFamily: customization.fontFamily,
                            fontSize: `${customization.fontSize}px`,
                            color: customization.color,
                          }}>
                            {customization.text}
                          </div>
                        </div>
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>
    </Page>
  );
}

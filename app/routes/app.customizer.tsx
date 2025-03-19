import { useState } from "react";
import {
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Divider,
  TextField,
  Select,
} from "@shopify/polaris";

export default function ProductCustomizerBlock() {
  const [customText, setCustomText] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  
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
  
  const handleAddToCart = () => {
    // In a real implementation, this would add the item to cart with customization data
    alert("Customized item added to cart!\n\nText: " + customText + 
          "\nFont: " + fontFamily + 
          "\nSize: " + fontSize + "px" +
          "\nColor: " + textColor);
  };
  
  return (
    <Card>
      <BlockStack gap="400">
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">Customize This Product</Text>
            
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
              onClick={handleAddToCart}
              disabled={!customText}
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
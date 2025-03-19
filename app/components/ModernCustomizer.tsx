import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Divider,
  Input,
  Select,
  Image
} from "@heroui/react";

interface CustomizerProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    variants: {
      id: string;
      title: string;
      price: string;
      availableForSale: boolean;
    }[];
    images: {
      url: string;
      altText: string;
    }[];
  };
  onSubmit: (formData: FormData) => void;
}

export default function ModernCustomizer({ product, onSubmit }: CustomizerProps) {
  const [customText, setCustomText] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [textPosition, setTextPosition] = useState("center");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      const availableVariant = product.variants.find(v => v.availableForSale);
      setSelectedVariantId(availableVariant?.id || product.variants[0].id);
    }
    
    if (product && product.images.length > 0) {
      setImagePreview(product.images[0].url);
    }
  }, [product]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append("text", customText);
    formData.append("fontFamily", fontFamily);
    formData.append("fontSize", fontSize.toString());
    formData.append("color", textColor);
    formData.append("variantId", selectedVariantId);
    formData.append("position", textPosition);
    
    if (imagePreview && !product.images.some(img => img.url === imagePreview)) {
      formData.append("uploadedImage", imagePreview);
    }
    
    onSubmit(formData);
  };

  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
  ];

  const positionOptions = [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" },
  ];

  // This simulates the customized text on the product image
  const getTextPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: "80%",
      textAlign: "center",
      fontFamily,
      fontSize: `${fontSize}px`,
      color: textColor,
      padding: "10px",
    };

    const positionStyles: Record<string, React.CSSProperties> = {
      top: { ...baseStyle, top: "10%", left: "10%" },
      center: { ...baseStyle, top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      bottom: { ...baseStyle, bottom: "10%", left: "10%" },
    };

    return positionStyles[textPosition];
  };

  return (
    <Card className="w-full mx-auto max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div>
          <div className="relative h-96 bg-gray-100 rounded-md">
            {imagePreview && (
              <Image 
                src={imagePreview} 
                alt={product.title} 
                className="object-contain h-full w-full" 
              />
            )}
            {customText && (
              <div 
                style={getTextPositionStyle()} 
                className="whitespace-pre-wrap"
              >
                {customText}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{product.title}</h2>
            
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm inline-block w-fit">
              ${product.variants.find(v => v.id === selectedVariantId)?.price || "N/A"}
            </div>
            
            <Divider className="my-2" />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Your Custom Text</label>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your text here"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Text Position</label>
                <Select 
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value)}
                >
                  {positionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Family</label>
                <Select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  {fontOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  min={8}
                  max={36}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            
              <div className="space-y-2">
                <label className="block text-sm font-medium">Product Variant</label>
                <Select 
                  value={selectedVariantId} 
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                >
                  {product.variants.map(variant => (
                    <option 
                      key={variant.id} 
                      value={variant.id} 
                      disabled={!variant.availableForSale}
                    >
                      {variant.title} - ${variant.price} {!variant.availableForSale && "(Out of Stock)"}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            
            <Divider className="my-2" />
            
            <Button 
              type="submit" 
              color="primary" 
              className="w-full py-3 mt-4"
            >
              Add to Cart
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
} 
import { useState, useEffect } from "react";

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
  initialValues?: {
    customText?: string;
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    textPosition?: string;
    selectedVariantId?: string;
    imagePreview?: string;
  };
  submitButtonText?: string;
}

export default function ModernCustomizer({ 
  product, 
  onSubmit, 
  initialValues = {}, 
  submitButtonText = "Add to Cart" 
}: CustomizerProps) {
  const [customText, setCustomText] = useState(initialValues.customText || "");
  const [selectedVariantId, setSelectedVariantId] = useState(initialValues.selectedVariantId || "");
  const [fontFamily, setFontFamily] = useState(initialValues.fontFamily || "Arial");
  const [fontSize, setFontSize] = useState(initialValues.fontSize || 16);
  const [textColor, setTextColor] = useState(initialValues.textColor || "#000000");
  const [textPosition, setTextPosition] = useState(initialValues.textPosition || "center");
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues.imagePreview || null);

  useEffect(() => {
    // Only set default variant if one wasn't provided in initialValues
    if (!initialValues.selectedVariantId && product && product.variants.length > 0) {
      const availableVariant = product.variants.find(v => v.availableForSale);
      setSelectedVariantId(availableVariant?.id || product.variants[0].id);
    }
    
    // Only set default image if one wasn't provided in initialValues
    if (!initialValues.imagePreview && product && product.images.length > 0) {
      setImagePreview(product.images[0].url);
    }
  }, [product, initialValues]);

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
    <div className="bg-white rounded-lg shadow-lg w-full mx-auto max-w-6xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>
          <div className="relative h-96 bg-gray-100 rounded-md flex items-center justify-center">
            {imagePreview && (
              <img 
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
            <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
            
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block w-fit font-medium">
              ${product.variants.find(v => v.id === selectedVariantId)?.price || "N/A"}
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Your Custom Text</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your text here"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Text Position</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value)}
                >
                  {positionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Font Family</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  {fontOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  min={8}
                  max={36}
                  step={1}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Variant</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                </select>
              </div>
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
            >
              {submitButtonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
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

const colorPresets = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Gold", value: "#FFD700" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Purple", value: "#800080" },
];

const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Impact", label: "Impact" },
];

const positionOptions = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export default function ModernCustomizer({ 
  product, 
  onSubmit, 
  initialValues = {}, 
  submitButtonText = "Add to Cart" 
}: CustomizerProps) {
  console.log("ModernCustomizer received initialValues:", initialValues);

  // Initialize state with values or defaults
  const [customText, setCustomText] = useState(initialValues.customText || "");
  const [selectedVariantId, setSelectedVariantId] = useState(initialValues.selectedVariantId || "");
  const [fontFamily, setFontFamily] = useState(initialValues.fontFamily || "Arial");
  const [fontSize, setFontSize] = useState(initialValues.fontSize || 16);
  const [textColor, setTextColor] = useState(initialValues.textColor || "#000000");
  const [textPosition, setTextPosition] = useState(initialValues.textPosition || "center");
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues.imagePreview || null);
  const [currentTab, setCurrentTab] = useState<'text' | 'style' | 'position'>('text');
  const [previewZoom, setPreviewZoom] = useState(100);
  
  // Log the initial state for debugging
  useEffect(() => {
    console.log("ModernCustomizer initialized with state:", {
      customText,
      selectedVariantId,
      fontFamily,
      fontSize,
      textColor,
      textPosition,
      imagePreview,
      productVariants: product.variants.map(v => ({ id: v.id, title: v.title }))
    });
  }, []);

  useEffect(() => {
    // Only set default variant if one wasn't provided in initialValues
    if (!initialValues.selectedVariantId && product && product.variants.length > 0) {
      const availableVariant = product.variants.find(v => v.availableForSale);
      if (availableVariant) {
        console.log("Setting default available variant:", availableVariant.id);
        setSelectedVariantId(availableVariant.id);
      } else {
        console.log("No available variant found, using first variant:", product.variants[0].id);
        setSelectedVariantId(product.variants[0].id);
      }
    } else if (initialValues.selectedVariantId) {
      console.log("Using provided variant ID:", initialValues.selectedVariantId);
    }
    
    // Only set default image if one wasn't provided in initialValues
    if (!initialValues.imagePreview && product && product.images.length > 0) {
      console.log("Setting default product image preview:", product.images[0].url);
      setImagePreview(product.images[0].url);
    } else if (initialValues.imagePreview) {
      console.log("Using provided image preview URL:", initialValues.imagePreview);
    }
  }, [product, initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const formData = new FormData();
    
    // Add all required fields with validation
    formData.append("text", customText || "");
    formData.append("fontFamily", fontFamily || "Arial");
    formData.append("fontSize", fontSize ? fontSize.toString() : "16");
    formData.append("color", textColor || "#000000");
    formData.append("variantId", selectedVariantId);
    
    // Include both position and textPosition for consistency
    formData.append("position", textPosition || "center");
    formData.append("textPosition", textPosition || "center");
    
    // Handle image preview
    if (imagePreview && !product.images.some(img => img.url === imagePreview)) {
      formData.append("uploadedImage", imagePreview);
    }
    
    // Log form data being submitted
    console.log("Submitting form data:", {
      text: customText,
      fontFamily,
      fontSize: fontSize.toString(),
      color: textColor,
      variantId: selectedVariantId,
      position: textPosition,
      textPosition: textPosition,
      hasUploadedImage: !!imagePreview && !product.images.some(img => img.url === imagePreview)
    });
    
    // Submit the form
    onSubmit(formData);
  };

  // This simulates the customized text on the product image
  const getTextPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      maxWidth: "80%",
      textAlign: "center",
      fontFamily,
      fontSize: `${fontSize}px`,
      color: textColor,
      padding: "10px",
      textShadow: textColor === '#FFFFFF' ? '1px 1px 1px rgba(0,0,0,0.5)' : 'none',
      wordWrap: "break-word",
      lineHeight: 1.2,
    };

    const positionStyles: Record<string, React.CSSProperties> = {
      top: { ...baseStyle, top: "10%", left: "50%", transform: "translateX(-50%)" },
      center: { ...baseStyle, top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      bottom: { ...baseStyle, bottom: "10%", left: "50%", transform: "translateX(-50%)" },
      left: { ...baseStyle, top: "50%", left: "10%", transform: "translateY(-50%)" },
      right: { ...baseStyle, top: "50%", right: "10%", transform: "translateY(-50%)" },
    };

    return positionStyles[textPosition] || positionStyles["center"];
  };

  const getSelectedVariantPrice = () => {
    const variant = product.variants.find(v => v.id === selectedVariantId);
    return variant ? variant.price : "N/A";
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full mx-auto max-w-6xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Preview Section */}
        <div className="p-6 bg-gray-50 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview</h3>
          
          <div className="relative flex-grow rounded-lg shadow-inner bg-white flex items-center justify-center overflow-hidden" 
              style={{minHeight: "400px"}}>
            {imagePreview && (
              <div className="relative h-full w-full" style={{transform: `scale(${previewZoom / 100})`}}>
                <img 
                  src={imagePreview} 
                  alt={product.title} 
                  className="object-contain h-full w-full transition-transform duration-300" 
                />
                {customText && (
                  <div 
                    style={getTextPositionStyle()} 
                    className="whitespace-pre-wrap transition-all duration-300"
                  >
                    {customText}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Zoom: {previewZoom}%
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                disabled={previewZoom <= 50}
                aria-label="Zoom out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="range"
                value={previewZoom}
                onChange={(e) => setPreviewZoom(parseInt(e.target.value))}
                min={50}
                max={150}
                step={5}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button 
                onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                disabled={previewZoom >= 150}
                aria-label="Zoom in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Customization Options */}
        <div className="p-6 border-l border-gray-200">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
              <div className="bg-green-100 text-green-800 px-4 py-1.5 rounded-lg text-lg font-medium">
                ${getSelectedVariantPrice()}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex -mb-px space-x-8">
                <button
                  type="button"
                  className={`py-2 ${currentTab === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'} font-medium focus:outline-none`}
                  onClick={() => setCurrentTab('text')}
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`py-2 ${currentTab === 'style' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'} font-medium focus:outline-none`}
                  onClick={() => setCurrentTab('style')}
                >
                  Style
                </button>
                <button
                  type="button"
                  className={`py-2 ${currentTab === 'position' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'} font-medium focus:outline-none`}
                  onClick={() => setCurrentTab('position')}
                >
                  Position
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto" style={{maxHeight: "400px"}}>
              {/* Text Tab */}
              {currentTab === 'text' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Your Custom Text</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter your text here"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    <p className="text-xs text-gray-500">
                      {customText.length} characters
                    </p>
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
              )}
              
              {/* Style Tab */}
              {currentTab === 'style' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Font Family</label>
                    <div className="grid grid-cols-2 gap-2">
                      {fontOptions.map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setFontFamily(option.value)}
                          className={`cursor-pointer border px-4 py-3 rounded-md transition ${fontFamily === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          <span style={{ fontFamily: option.value }}>{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Font Size: {fontSize}px</label>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                        className="p-1 border border-gray-300 rounded"
                        disabled={fontSize <= 8}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="range"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        min={8}
                        max={36}
                        step={1}
                        className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setFontSize(Math.min(36, fontSize + 1))}
                        className="p-1 border border-gray-300 rounded"
                        disabled={fontSize >= 36}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <span style={{ fontSize: `${fontSize}px`, fontFamily }}>Aa</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Text Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <span className="font-medium" style={{color: textColor}}>{textColor}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map(color => (
                        <div 
                          key={color.value}
                          onClick={() => setTextColor(color.value)}
                          className={`cursor-pointer p-2 rounded-md transition flex flex-col items-center ${textColor === color.value ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border border-gray-300 mb-1"
                            style={{ backgroundColor: color.value, boxShadow: color.value === '#FFFFFF' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none' }}
                          ></div>
                          <span className="text-xs">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Position Tab */}
              {currentTab === 'position' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Text Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {positionOptions.map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setTextPosition(option.value)}
                          className={`cursor-pointer border px-4 py-3 rounded-md text-center transition ${textPosition === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 border border-gray-200 rounded-md">
                    <div className="relative h-48 bg-gray-100 rounded flex items-center justify-center">
                      <div className="absolute w-full h-full p-2">
                        <div className={`absolute p-2 ${textPosition === 'top' ? 'top-0 left-1/2 -translate-x-1/2 border-2 border-blue-500 bg-blue-50 rounded' : ''}`}>
                          Top
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 bg-blue-50 rounded' : ''}`}>
                          Center
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 border-2 border-blue-500 bg-blue-50 rounded' : ''}`}>
                          Bottom
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'left' ? 'top-1/2 left-0 -translate-y-1/2 border-2 border-blue-500 bg-blue-50 rounded' : ''}`}>
                          Left
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'right' ? 'top-1/2 right-0 -translate-y-1/2 border-2 border-blue-500 bg-blue-50 rounded' : ''}`}>
                          Right
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-6 mt-auto">
              <button 
                type="submit" 
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
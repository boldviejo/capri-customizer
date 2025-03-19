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
    <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl shadow-soft w-full mx-auto max-w-6xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Product Preview Section */}
        <div className="p-6 lg:p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Preview
          </h3>
          
          <div className="relative flex-grow rounded-xl shadow-soft bg-white flex items-center justify-center overflow-hidden" 
              style={{minHeight: "450px"}}>
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
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-secondary-500 font-medium mb-3 sm:mb-0">
              Zoom: {previewZoom}%
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button 
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                className="p-2 rounded-full bg-secondary-100 hover:bg-secondary-200 text-secondary-700 transition"
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
                className="w-32 sm:w-40 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <button 
                onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                className="p-2 rounded-full bg-secondary-100 hover:bg-secondary-200 text-secondary-700 transition"
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
        <div className="p-6 lg:p-8 bg-white rounded-tl-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2 md:mb-0">{product.title}</h2>
              <div className="bg-accent-50 text-accent-700 px-4 py-2 rounded-lg text-lg font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
                ${getSelectedVariantPrice()}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-secondary-200 mb-6">
              <div className="flex -mb-px space-x-8">
                <button
                  type="button"
                  className={`py-2 px-1 ${currentTab === 'text' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-secondary-500 hover:text-secondary-700'} font-medium focus:outline-none transition-colors duration-200 flex items-center`}
                  onClick={() => setCurrentTab('text')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Text
                </button>
                <button
                  type="button"
                  className={`py-2 px-1 ${currentTab === 'style' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-secondary-500 hover:text-secondary-700'} font-medium focus:outline-none transition-colors duration-200 flex items-center`}
                  onClick={() => setCurrentTab('style')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  Style
                </button>
                <button
                  type="button"
                  className={`py-2 px-1 ${currentTab === 'position' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-secondary-500 hover:text-secondary-700'} font-medium focus:outline-none transition-colors duration-200 flex items-center`}
                  onClick={() => setCurrentTab('position')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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
                    <label className="block text-sm font-medium text-secondary-700">Your Custom Text</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter your text here"
                      rows={3}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition shadow-sm"
                    />
                    <p className="text-xs text-secondary-500 italic">
                      {customText.length} characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-700">Product Variant</label>
                    <select 
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition shadow-sm"
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
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-secondary-700">Font Family</label>
                    <div className="grid grid-cols-2 gap-3">
                      {fontOptions.map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setFontFamily(option.value)}
                          className={`cursor-pointer border px-4 py-3 rounded-lg transition shadow-sm ${fontFamily === option.value ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-300 hover:border-secondary-400 hover:bg-secondary-50'}`}
                        >
                          <span style={{ fontFamily: option.value }}>{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-secondary-700">Font Size: {fontSize}px</label>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                        className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-100 transition"
                        disabled={fontSize <= 8}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="flex-grow h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setFontSize(Math.min(36, fontSize + 1))}
                        className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-100 transition"
                        disabled={fontSize >= 36}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-secondary-50 p-4 rounded-lg text-center shadow-sm border border-secondary-100">
                      <span style={{ fontSize: `${fontSize}px`, fontFamily }}>Aa</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-secondary-700">Text Color</label>
                    <div className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0 shadow-sm"
                      />
                      <span className="font-medium text-lg" style={{color: textColor}}>{textColor}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {colorPresets.map(color => (
                        <div 
                          key={color.value}
                          onClick={() => setTextColor(color.value)}
                          className={`cursor-pointer p-2 rounded-lg transition flex flex-col items-center ${textColor === color.value ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-secondary-50'}`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border border-secondary-300 mb-1"
                            style={{ backgroundColor: color.value, boxShadow: color.value === '#FFFFFF' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none' }}
                          ></div>
                          <span className="text-xs font-medium text-secondary-700">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Position Tab */}
              {currentTab === 'position' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-secondary-700">Text Position</label>
                    <div className="grid grid-cols-3 gap-3">
                      {positionOptions.map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setTextPosition(option.value)}
                          className={`cursor-pointer border px-4 py-3 rounded-lg text-center transition shadow-sm ${textPosition === option.value ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-secondary-300 hover:border-secondary-400 text-secondary-600 hover:bg-secondary-50'}`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-6 border border-secondary-200 rounded-lg bg-secondary-50">
                    <div className="relative h-56 bg-white rounded-lg shadow-inner flex items-center justify-center">
                      <div className="absolute w-full h-full p-4">
                        <div className={`absolute p-2 ${textPosition === 'top' ? 'top-0 left-1/2 -translate-x-1/2 border-2 border-primary-500 bg-primary-50 rounded text-primary-700 font-medium' : ''}`}>
                          Top
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary-500 bg-primary-50 rounded text-primary-700 font-medium' : ''}`}>
                          Center
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 border-2 border-primary-500 bg-primary-50 rounded text-primary-700 font-medium' : ''}`}>
                          Bottom
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'left' ? 'top-1/2 left-0 -translate-y-1/2 border-2 border-primary-500 bg-primary-50 rounded text-primary-700 font-medium' : ''}`}>
                          Left
                        </div>
                        <div className={`absolute p-2 ${textPosition === 'right' ? 'top-1/2 right-0 -translate-y-1/2 border-2 border-primary-500 bg-primary-50 rounded text-primary-700 font-medium' : ''}`}>
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
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white text-lg font-medium rounded-xl transition shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
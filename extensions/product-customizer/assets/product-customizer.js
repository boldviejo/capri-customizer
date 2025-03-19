document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const customizer = document.querySelector('.product-customizer');
  if (!customizer) return;
  
  const textInput = document.getElementById('customizer-text');
  const fontSelect = document.getElementById('customizer-font');
  const sizeSelect = document.getElementById('customizer-size');
  const colorOptions = document.querySelectorAll('.color-option');
  const previewText = document.getElementById('customizer-preview-text');
  const addToCartButton = document.getElementById('customizer-add-to-cart');
  
  // Data attributes
  const productId = customizer.dataset.productId;
  const productHandle = customizer.dataset.productHandle;
  
  // Current selections
  let selectedColor = '#000000'; // Default black
  
  // Initialize: select first color option
  colorOptions[0].classList.add('selected');
  
  // Update preview when input changes
  function updatePreview() {
    if (textInput.value) {
      previewText.textContent = textInput.value;
    } else {
      previewText.textContent = 'Your text will appear here';
    }
    
    previewText.style.fontFamily = fontSelect.value;
    previewText.style.fontSize = `${sizeSelect.value}px`;
    previewText.style.color = selectedColor;
  }
  
  // Handle color selection
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all colors
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked color
      this.classList.add('selected');
      
      // Update selected color
      selectedColor = this.dataset.color;
      
      // Update preview
      updatePreview();
    });
  });
  
  // Event listeners for other inputs
  textInput.addEventListener('input', updatePreview);
  fontSelect.addEventListener('change', updatePreview);
  sizeSelect.addEventListener('change', updatePreview);
  
  // Initial preview update
  updatePreview();
  
  // Handle Add to Cart
  addToCartButton.addEventListener('click', function() {
    // Validate that text is entered
    if (!textInput.value) {
      alert('Please enter your custom text');
      return;
    }
    
    // Disable button during processing
    addToCartButton.disabled = true;
    addToCartButton.textContent = 'Adding...';
    
    // Get the selected variant ID (if we need to get it from the current page)
    let variantId = getSelectedVariantId();
    if (!variantId) {
      console.error('No variant ID found');
      addToCartButton.disabled = false;
      addToCartButton.textContent = 'Add to Cart';
      alert('Error: Could not determine product variant');
      return;
    }
    
    // Prepare cart item properties for customization
    const properties = {
      'Custom Text': textInput.value,
      'Font': fontSelect.value,
      'Size': `${sizeSelect.value}px`,
      'Color': selectedColor
    };
    
    // Add to cart using fetch
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          id: variantId,
          quantity: 1,
          properties: properties
        }]
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        // Error occurred
        console.error('Error adding to cart:', data);
        alert(`Error: ${data.description}`);
      } else {
        // Success - redirect to cart
        if (window.location.pathname.includes('/cart')) {
          window.location.reload();
        } else {
          // Either redirect to cart page or trigger cart drawer if theme has it
          window.location.href = '/cart';
          // Alternatively: document.dispatchEvent(new CustomEvent('product:added-to-cart'));
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while adding to cart');
    })
    .finally(() => {
      // Re-enable button
      addToCartButton.disabled = false;
      addToCartButton.textContent = 'Add to Cart';
    });
  });
  
  // Helper function to get the currently selected variant ID
  function getSelectedVariantId() {
    // Try to get it from the URL if we're on a product page
    const urlParams = new URLSearchParams(window.location.search);
    const variantFromUrl = urlParams.get('variant');
    if (variantFromUrl) return variantFromUrl;
    
    // Try to get it from the form if we're on a product page
    const variantSelector = document.querySelector('input[name="id"], select[name="id"]');
    if (variantSelector) return variantSelector.value;
    
    // If we can't find it, make a call to get the first available variant
    // This is a fallback and might not be ideal in all cases
    return getFirstAvailableVariant();
  }
  
  // Function to get the first available variant as a fallback
  function getFirstAvailableVariant() {
    // This would typically be retrieved via an AJAX call to the product JSON
    // For simplicity in this example, we'll return null and handle the error case
    return null;
  }
}); 
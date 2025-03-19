# Shopify Theme Integration for Customizer App

This directory contains Liquid snippets and templates that need to be added to your Shopify theme to enable the "Edit" button functionality for customized products in the cart.

## Required Files

1. **customization-editor.liquid** - Snippet that adds an "Edit" button next to customized items in the cart
2. **edit-redirect-bridge.liquid** - Bridge page template to redirect from Shopify to the customizer app's edit page
3. **update-cart-item-bridge.liquid** - Bridge page template to handle updating cart items after editing

## Installation Instructions

### Step 1: Add the Snippets to Your Theme

1. Log in to your Shopify Admin Dashboard
2. Go to **Online Store** > **Themes**
3. Find your active theme and click on **Actions** > **Edit code**
4. In the left sidebar, find the **Snippets** folder and click on it
5. Click **Add a new snippet**
6. Name it `customization-editor` and paste the content from `customization-editor.liquid`
7. Save the file
8. Repeat for any other snippets you need to add

### Step 2: Create Bridge Pages

1. Go to **Content** > **Pages** in your Shopify Admin
2. Click **Add page**
3. Title: "Edit Redirect Bridge"
4. Handle: `edit-redirect-bridge`
5. Click on **Theme template** and select **Specific template**
6. In the dropdown, select "edit-redirect-bridge"
7. Save the page
8. Repeat to create another page with:
   - Title: "Update Cart Item Bridge"
   - Handle: `update-cart-item-bridge`
   - Template: "update-cart-item-bridge"

### Step 3: Add the Edit Button to Your Cart Template

1. In your theme editor, locate the cart template file (usually `templates/cart.liquid` or `sections/cart-template.liquid`)
2. Find the loop where cart items are rendered (look for `{% for item in cart.items %}`)
3. Inside this loop, right after the item's title or description, add:

```liquid
{% if item.properties['Custom Text'] %}
  {% render 'customization-editor', item: item %}
{% endif %}
```

4. Save the template

## How It Works

1. The **Edit** button appears next to customized items in the cart
2. When clicked, it uses the `edit-redirect-bridge` page to collect all customization details and redirect to the app's edit page
3. The app's edit page loads with all existing customization values pre-filled
4. When the user submits changes, the app sends them to the `update-cart-item-bridge` page
5. The bridge replaces the old cart item with the updated version

## Troubleshooting

If the Edit button doesn't appear:
- Make sure the customized items have the property 'Custom Text'
- Check that you've added the snippet to the correct location in your cart template
- Verify the snippet is being rendered inside the cart item loop

If editing doesn't save changes:
- Make sure both bridge pages are created with the correct handles
- Check browser console for any JavaScript errors
- Verify the item key is being correctly passed between pages 
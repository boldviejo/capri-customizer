import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  // Check if this is a POST request
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Parse the request body
    const data = await request.json();
    const { text, fontFamily, fontSize, color, productId, variantId, shop } = data;

    // Basic validation
    if (!text || !fontFamily || !fontSize || !color || !productId || !variantId || !shop) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to database using Prisma
    const prismaAny = prisma as any;
    const customization = await prismaAny.Customization.create({
      data: {
        shop,
        text,
        fontFamily,
        fontSize,
        color,
        productId,
        variantId,
      },
    });

    // Return success response
    return json({ 
      success: true, 
      customization 
    });
  } catch (error) {
    console.error("Error saving customization:", error);
    return json({ error: "Failed to save customization" }, { status: 500 });
  }
}

// Handle GET requests (for testing only)
export async function loader({ request }: ActionFunctionArgs) {
  return json({ message: "Use POST to save customizations" });
} 
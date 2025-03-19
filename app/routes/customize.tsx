import { json, type LinksFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@11.0.0/build/esm/styles.css" }
];

export const loader = async () => {
  return json({
    polarisTranslations: {
      locale: 'en',
    },
  });
};

export default function CustomizeLayout() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <AppProvider i18n={enTranslations}>
      <div style={{ padding: "1rem" }}>
        <Outlet />
      </div>
    </AppProvider>
  );
} 
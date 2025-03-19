import { json, type LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

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

export default function UnauthenticatedLayout() {
  return (
    <div style={{ padding: "1rem" }}>
      <Outlet />
    </div>
  );
} 
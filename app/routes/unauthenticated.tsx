import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "stylesheet", href: "@shopify/polaris/build/esm/styles.css" }
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
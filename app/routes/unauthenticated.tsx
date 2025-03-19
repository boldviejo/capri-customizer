import { json, type LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles }
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
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { HeroUIProvider } from "@heroui/react";
import type { LinksFunction } from "@remix-run/node";

// Import CSS files as URL imports
import heroUiStylesHref from "@heroui/react/dist/index.css?url";
import tailwindStylesHref from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: heroUiStylesHref },
  { rel: "stylesheet", href: tailwindStylesHref },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <HeroUIProvider>
          <Outlet />
        </HeroUIProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

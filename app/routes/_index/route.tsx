import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redirect to the standalone customizer
  return redirect("/unauthenticated/customize");
};

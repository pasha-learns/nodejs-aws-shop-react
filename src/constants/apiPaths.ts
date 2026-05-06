const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const productBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_PRODUCT_SERVICE_URL ?? ""
);

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL ?? "");

const API_PATHS = {
  product: productBaseUrl,
  order: apiBaseUrl,
  import: apiBaseUrl,
  bff: apiBaseUrl,
  cart: apiBaseUrl,
};

export default API_PATHS;

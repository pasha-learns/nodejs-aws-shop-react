import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

function shouldUseMsw() {
  const productUrl = (import.meta.env.VITE_PRODUCT_SERVICE_URL ?? "").trim();
  const apiUrl = (import.meta.env.VITE_API_URL ?? "").trim();
  const flag = import.meta.env.VITE_ENABLE_MSW;
  if (flag === "false" || flag === "0") {
    return false;
  }
  if (flag === "true" || flag === "1") {
    return true;
  }
  if (import.meta.env.DEV) {
    return !(productUrl && apiUrl);
  }
  return !productUrl || !apiUrl;
}

async function main() {
  if (shouldUseMsw()) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  const container = document.getElementById("app");
  if (!container) {
    throw new Error("root element #app not found");
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

void main();

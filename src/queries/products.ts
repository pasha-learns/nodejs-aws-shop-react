import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

function normalizeProductList(payload: unknown): AvailableProduct[] {
  if (Array.isArray(payload)) {
    return payload as AvailableProduct[];
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.products)) {
      return o.products as AvailableProduct[];
    }
    if (Array.isArray(o.items)) {
      return o.items as AvailableProduct[];
    }
    if (Array.isArray(o.data)) {
      return o.data as AvailableProduct[];
    }
  }
  return [];
}

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios.get<unknown>(`${API_PATHS.product}/products`);
      return normalizeProductList(res.data);
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const productBase = API_PATHS.product;
      if (productBase) {
        const res = await axios.get<AvailableProduct>(
          `${productBase}/products/${encodeURIComponent(id!)}`
        );
        return res.data;
      }
      const res = await axios.get<AvailableProduct>(
        `${API_PATHS.bff}/product/${id}`
      );
      return res.data;
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

function toNonNegativeInt(value: number): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) => {
    const existingId = values.id?.trim();
    if (existingId) {
      return axios.put<AvailableProduct>(`${API_PATHS.bff}/product`, values, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      });
    }
    const productBase = API_PATHS.product;
    if (!productBase) {
      return Promise.reject(
        new Error("VITE_PRODUCT_SERVICE_URL is required to create a product")
      );
    }
    const body = {
      title: values.title,
      description: values.description ?? "",
      price: toNonNegativeInt(values.price),
      count: toNonNegativeInt(values.count),
    };
    return axios.post<AvailableProduct>(`${productBase}/products`, body);
  });
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}

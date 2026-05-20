import { rest } from "msw";
import API_PATHS from "~/constants/apiPaths";
import {
  availableProducts,
  orders,
  products,
  cart as seedCart,
} from "~/mocks/data";
import { CartItem } from "~/models/CartItem";
import { Order } from "~/models/Order";
import { AvailableProduct, Product } from "~/models/Product";

let productServiceCatalog: AvailableProduct[] = availableProducts.map((p) => ({
  ...p,
}));

function newProductId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}`;
}

function cloneCart(source: CartItem[]): CartItem[] {
  return source.map((row) => ({
    count: row.count,
    product: { ...row.product },
  }));
}

let cartState = cloneCart(seedCart);

const forceAllMocks =
  import.meta.env.VITE_ENABLE_MSW === "true" ||
  import.meta.env.VITE_ENABLE_MSW === "1";

const mockProductService = forceAllMocks || !API_PATHS.product;
const mockApiRoutes = forceAllMocks || !API_PATHS.cart;

const productServiceHandlers = [
  rest.get(`${API_PATHS.product}/products`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(),
      ctx.json<AvailableProduct[]>(productServiceCatalog)
    );
  }),
  rest.get(`${API_PATHS.product}/products/:productId`, (req, res, ctx) => {
    const product = productServiceCatalog.find(
      (p) => p.id === req.params.productId
    );
    if (!product) {
      return res(ctx.status(404), ctx.json({ message: "Product not found" }));
    }
    return res(
      ctx.status(200),
      ctx.delay(),
      ctx.json<AvailableProduct>(product)
    );
  }),
  rest.post(`${API_PATHS.product}/products`, (req, res, ctx) => {
    const raw = req.body as unknown;
    let body: {
      title?: string;
      description?: string;
      price?: number;
      count?: number;
    };
    if (typeof raw === "string") {
      try {
        body = JSON.parse(raw) as typeof body;
      } catch {
        body = {};
      }
    } else if (raw && typeof raw === "object") {
      body = raw as typeof body;
    } else {
      body = {};
    }
    const created: AvailableProduct = {
      id: newProductId(),
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
      price: typeof body.price === "number" ? body.price : 0,
      count: typeof body.count === "number" ? body.count : 0,
    };
    productServiceCatalog = [...productServiceCatalog, created];
    return res(
      ctx.status(201),
      ctx.delay(),
      ctx.json<AvailableProduct>(created)
    );
  }),
];

const bffCartOrderHandlers = [
  rest.get(`${API_PATHS.bff}/product`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(), ctx.json<Product[]>(products));
  }),
  rest.put(`${API_PATHS.bff}/product`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete(`${API_PATHS.bff}/product/:id`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(`${API_PATHS.bff}/product/available`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(),
      ctx.json<AvailableProduct[]>(availableProducts)
    );
  }),
  rest.get(`${API_PATHS.bff}/product/:id`, (req, res, ctx) => {
    const product = availableProducts.find((p) => p.id === req.params.id);
    if (!product) {
      return res(ctx.status(404));
    }
    return res(
      ctx.status(200),
      ctx.delay(),
      ctx.json<AvailableProduct>(product)
    );
  }),
  rest.get(`${API_PATHS.cart}/profile/cart`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(), ctx.json<CartItem[]>(cartState));
  }),
  rest.put(`${API_PATHS.cart}/profile/cart`, (req, res, ctx) => {
    const body = req.body as CartItem;
    const idx = cartState.findIndex((i) => i.product.id === body.product.id);
    if (body.count <= 0) {
      if (idx >= 0) {
        cartState = cartState.filter((_, i) => i !== idx);
      }
    } else if (idx >= 0) {
      cartState = cartState.map((row, i) =>
        i === idx ? { product: { ...body.product }, count: body.count } : row
      );
    } else {
      cartState = [
        ...cartState,
        { product: { ...body.product }, count: body.count },
      ];
    }
    return res(ctx.status(200), ctx.json<CartItem[]>(cartState));
  }),
  rest.get(`${API_PATHS.order}/order`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(), ctx.json<Order[]>(orders));
  }),
  rest.put(`${API_PATHS.order}/order`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(`${API_PATHS.order}/order/:id`, (req, res, ctx) => {
    const order = orders.find((p) => p.id === req.params.id);
    if (!order) {
      return res(ctx.status(404));
    }
    return res(ctx.status(200), ctx.delay(), ctx.json(order));
  }),
  rest.delete(`${API_PATHS.order}/order/:id`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.put(`${API_PATHS.order}/order/:id/status`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];

export const handlers = [
  ...(mockProductService ? productServiceHandlers : []),
  ...(mockApiRoutes ? bffCartOrderHandlers : []),
];

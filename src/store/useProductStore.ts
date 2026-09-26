import { create } from "zustand";
import { productsApi, Product, ProductInput, ProductsResponse } from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes TTL

interface ProductState {
  products: Product[];
  totalProducts: number;
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchProducts: (
    filters?: { search?: string; category?: string; page?: number; limit?: number },
    forceRefresh?: boolean
  ) => Promise<ProductsResponse | void>;
  fetchProduct: (id: string) => Promise<Product | void>;
  createProduct: (data: ProductInput) => Promise<Product | void>;
  updateProduct: (id: string, data: Partial<ProductInput>) => Promise<Product | void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  totalProducts: 0,
  selectedProduct: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchProducts: async (filters, forceRefresh = false) => {
    const { lastFetched, products } = get();
    const now = Date.now();

    // Cache check: return existing products if TTL is valid and no filters specified
    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL_MS && !filters?.search && !filters?.category) {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Returning cached products");
      }
      return;
    }

    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Fetching products with filters:", filters);
      }
      const response = await productsApi.getProducts(filters);
      set({
        products: response.data || [],
        totalProducts: response.total || (response.data ? response.data.length : 0),
        loading: false,
        lastFetched: now,
      });
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch products.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductStore] fetchProducts Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  fetchProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Fetching product detail for ID:", id);
      }
      const product = await productsApi.getProduct(id);
      set({ selectedProduct: product, loading: false });
      return product;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch product ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductStore] fetchProduct Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createProduct: async (data: ProductInput) => {
    const previousProducts = get().products;
    const tempId = `temp-${Date.now()}`;
    const tempProduct: Product = {
      id: tempId,
      sku: data.sku,
      name: data.name,
      category: data.category,
      unit: data.unit,
      reorder_level: data.reorder_level,
      description: data.description,
      image_url: data.image_url,
      created_at: new Date().toISOString(),
      total_stock: 0,
    };

    // Optimistic UI Update
    set({ products: [tempProduct, ...previousProducts], error: null });

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Optimistically creating product:", data.name);
      }
      const createdProduct = await productsApi.createProduct(data);
      // Replace temp product with actual server response
      set((state) => ({
        products: state.products.map((p) => (p.id === tempId ? createdProduct : p)),
      }));
      return createdProduct;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create product.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductStore] createProduct Error. Rolling back state.", err);
      }
      // Rollback state on error
      set({ products: previousProducts, error: errorMessage });
    }
  },

  updateProduct: async (id: string, data: Partial<ProductInput>) => {
    const previousProducts = get().products;
    const previousSelected = get().selectedProduct;

    // Optimistic UI Update
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      selectedProduct: state.selectedProduct?.id === id ? { ...state.selectedProduct, ...data } : state.selectedProduct,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Optimistically updating product:", id);
      }
      const updatedProduct = await productsApi.updateProduct(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        selectedProduct: state.selectedProduct?.id === id ? updatedProduct : state.selectedProduct,
      }));
      return updatedProduct;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to update product ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductStore] updateProduct Error. Rolling back state.", err);
      }
      // Rollback on error
      set({ products: previousProducts, selectedProduct: previousSelected, error: errorMessage });
    }
  },

  deleteProduct: async (id: string) => {
    const previousProducts = get().products;
    const previousSelected = get().selectedProduct;

    // Optimistic UI Update
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProductStore] Optimistically deleting product:", id);
      }
      await productsApi.deleteProduct(id);
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to delete product ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[ProductStore] deleteProduct Error. Rolling back state.", err);
      }
      // Rollback on error
      set({ products: previousProducts, selectedProduct: previousSelected, error: errorMessage });
    }
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  clearError: () => set({ error: null }),
}));

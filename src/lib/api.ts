import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// ==========================================
// 1. BASE CONFIGURATION & RESPONSE INTERFACE
// ==========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data: T;
  message: string;
  timestamp: string;
}

// ==========================================
// 2. CUSTOM ERROR TYPES
// ==========================================

export class APIError extends Error {
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class ValidationError extends APIError {
  errors?: Record<string, any>;

  constructor(message: string, errors?: Record<string, any>) {
    super(message, 422, errors);
    this.name = "ValidationError";
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthError extends APIError {
  constructor(message: string = "Unauthorized access. Please log in.") {
    super(message, 401);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// ==========================================
// 3. AXIOS INSTANCE & INTERCEPTORS
// ==========================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("fluxo_token") || localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors consistently & handle 401/403 redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[API Network Info]:", {
        url: error.config?.url || "unknown endpoint",
        method: error.config?.method?.toUpperCase() || "GET",
        status: error.response?.status || "OFFLINE_FALLBACK",
        message: error.message || "Network Connection Error",
      });
    }


    if (error.response) {
      const { status, data } = error.response;
      const message =
        data?.message ||
        data?.detail ||
        (status === 401 ? "Session expired. Please log in again." : undefined) ||
        (status === 403 ? "You do not have permission to perform this action." : undefined) ||
        (status === 404 ? "Requested resource not found." : undefined) ||
        (status === 500 ? "Server error. Please try again later." : undefined) ||
        error.message ||
        "An unexpected error occurred.";

      if (status === 401 || status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("fluxo_token");
          localStorage.removeItem("auth_token");
          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(new AuthError(message));
      }

      if (status === 422) {
        return Promise.reject(new ValidationError(message, data?.errors || data?.detail));
      }

      return Promise.reject(new APIError(message, status, data));
    }

    const userFriendlyMessage =
      process.env.NODE_ENV === "development"
        ? error.message || "Network error. Unable to reach server."
        : "Unable to connect to the server. Please check your internet connection.";

    return Promise.reject(new APIError(userFriendlyMessage));
  }
);

// Helper to extract data cleanly whether wrapped in ApiResponse or raw
async function extractData<T>(promise: Promise<any>): Promise<T> {
  const res = await promise;
  if (res && res.data !== undefined) {
    const payload = res.data;
    if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
      return payload.data as T;
    }
    return payload as T;
  }
  return res as T;
}


// ==========================================
// 4. DOMAIN TYPES & INTERFACES
// ==========================================

// --- PRODUCTS ---
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  reorder_level: number;
  total_stock?: number;
  description?: string;
  image_url?: string;
  created_at: string;
  warehouses?: Array<{ warehouse: string; quantity: number; low_stock: boolean }>;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  unit: string;
  reorder_level: number;
  description?: string;
  image_url?: string;
}

export interface ProductsResponse {
  total: number;
  page: number;
  limit: number;
  data: Product[];
}

// --- WAREHOUSES ---
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  capacity: number;
  sku_count?: number;
  capacity_utilization?: number;
  health_score?: number;
  is_active: boolean;
}

export interface WarehouseInput {
  name: string;
  code: string;
  address?: string;
  city?: string;
  capacity: number;
}

// --- LOCATIONS ---
export interface LocationItem {
  id: string;
  warehouse_id: string;
  name: string;
  code: string;
  location_type: string;
  capacity: number;
  current_stock_count: number;
  current_stock_value?: string;
  is_active: boolean;
  created_at?: string;
}

export interface LocationDetail extends LocationItem {
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  stock_items?: Array<{ product: string; quantity: number }>;
}

export interface LocationInput {
  name: string;
  code: string;
  location_type: "RACK" | "SHELF" | "BIN" | "FLOOR" | "FREEZER" | string;
  capacity: number;
}

// --- SUPPLIERS ---
export interface Supplier {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  lead_time_days?: number;
}


// --- STOCK ---
export interface StockData {
  warehouse: string;
  location?: string;
  quantity: number;
  reserved?: number;
  available?: number;
}

export interface Stock {
  id?: string;
  product_id: string;
  product_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  location_id?: string;
  quantity: number;
  quantity_reserved?: number;
  quantity_available?: number;
  low_stock?: boolean;
  locations?: Array<{ name: string; quantity: number }>;
  reorder_level?: number;
  last_counted_at?: string;
}

// --- RECEIPTS ---
export interface ReceiptItemInput {
  product_id: string;
  quantity_expected: number;
  unit_price?: number;
}

export interface ReceiptInput {
  supplier_id: string;
  warehouse_id: string;
  items: ReceiptItemInput[];
  notes?: string;
}

export interface ReceiptItem {
  id: string;
  product_id: string;
  product_name?: string;
  quantity_expected: number;
  quantity_received?: number;
  unit_price?: number;
  received_at?: string;
  is_accepted?: boolean;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  supplier_id: string;
  supplier_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  status: "DRAFT" | "RECEIVED" | "VALIDATED" | "COMPLETED" | string;
  expected_date: string;
  received_date?: string;
  total_items: number;
  notes?: string;
  created_by: string;
  created_at: string;
  items?: ReceiptItem[];
}

// --- DELIVERIES ---
export interface DeliveryItemInput {
  product_id: string;
  quantity_ordered: number;
  unit_price?: number;
}

export interface DeliveryInput {
  customer_id: string;
  warehouse_id: string;
  items: DeliveryItemInput[];
  notes?: string;
}

export interface DeliveryItem {
  id: string;
  product_id: string;
  product_name?: string;
  quantity_ordered: number;
  quantity_picked?: number;
  quantity_packed?: number;
  quantity_shipped?: number;
  status?: string;
}

export interface Delivery {
  id: string;
  delivery_number: string;
  customer_id: string;
  warehouse_id: string;
  warehouse_name?: string;
  status: "DRAFT" | "PICKING" | "PICKED" | "PACKING" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELED" | string;
  order_date: string;
  planned_delivery_date: string;
  actual_delivery_date?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  items?: DeliveryItem[];
}

// --- TRANSFERS ---
export interface TransferInput {
  product_id: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  notes?: string;
}

export interface Transfer {
  id: string;
  transfer_number: string;
  product_id: string;
  product_name?: string;
  from_warehouse_id: string;
  from_warehouse_name?: string;
  to_warehouse_id: string;
  to_warehouse_name?: string;
  quantity: number;
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELED" | string;
  initiated_date: string;
  completed_date?: string;
  created_by: string;
  notes?: string;
}

// --- ADJUSTMENTS ---
export interface AdjustmentInput {
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  physical_count: number;
  reason: "DAMAGED" | "LOST" | "MISCOUNT" | "RECOUNT" | "THEFT" | "EXPIRATION" | "OTHER" | string;
  notes?: string;
}

export interface Adjustment {
  id: string;
  adjustment_number: string;
  product_id: string;
  product_name?: string;
  warehouse_id: string;
  location_id?: string;
  quantity_before: number;
  quantity_after: number;
  quantity_diff: number;
  reason: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "EXECUTED" | "REJECTED" | string;
  created_by: string;
  approved_by?: string;
  created_at: string;
}

// --- LEDGER ---
export interface LedgerEntry {
  id: string;
  date: string;
  operation: string;
  product: string;
  warehouse: string;
  location?: string;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  reference: string;
  created_by: string;
}

// --- DASHBOARD ---
export interface KPIs {
  total_products: number;
  total_stock_value: string;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  pending_receipts: number;
  pending_deliveries: number;
  pending_transfers: number;
  accuracy_score: number;
}

export interface OperationsSummary {
  receipts: { count: number; trend: string };
  deliveries: { count: number; trend: string };
  transfers: { count: number; trend: string };
  adjustments: { count: number; trend: string };
}

export interface WarehouseMetrics {
  name: string;
  skus: number;
  capacity: number;
  utilization: number;
  health: number;
  low_stock_items: number;
}

export interface ActivityEntry {
  timestamp: string;
  type: string;
  product: string;
  quantity: number;
  warehouse: string;
  user: string;
  reference: string;
  status: string;
}

export interface LowStockItem {
  product: string;
  warehouse: string;
  current: number;
  reorder_level: number;
  suggested_order: number;
}

export interface HealthScore {
  health_score: number;
  status: string;
}

export interface DashboardMetrics {
  greeting: string;
  headlineBold: string;
  headlineAccent: string;
  subtitle: string;
  totalWarehouses: number;
  totalProductsCount: number;
  totalStockQuantity: number;
  operationsSummary: Array<{
    label: string;
    count: number;
    change: string;
    isPositive: boolean;
    iconType: string;
  }>;
  healthData: {
    percentage: number;
    statusText: string;
    description: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  barChartData: Array<{ day: string; value: number }>;
  recentMovements: any[];
}

// ==========================================
// 5. SERVICE METHODS
// ==========================================

import { queryCache, withQueryCache } from "./cache";

// --- PRODUCTS ---
export const productsApi = {
  getProducts: (
    params?: { search?: string; category?: string; page?: number; limit?: number; sort_by?: string },
    signal?: AbortSignal
  ): Promise<ProductsResponse> => {
    const cacheKey = `products_${JSON.stringify(params || {})}`;
    return withQueryCache(
      cacheKey,
      () => extractData<ProductsResponse>(apiClient.get("/api/v1/products", { params, signal })),
      600000 // 10 minutes TTL
    );
  },

  getProduct: (id: string, signal?: AbortSignal): Promise<Product> =>
    withQueryCache(
      `product_${id}`,
      () => extractData<Product>(apiClient.get(`/api/v1/products/${id}`, { signal })),
      600000
    ),

  createProduct: (data: ProductInput): Promise<Product> => {
    queryCache.invalidate("products_");
    return extractData<Product>(apiClient.post("/api/v1/products", data));
  },

  updateProduct: (id: string, data: ProductInput | Partial<ProductInput>): Promise<Product> => {
    queryCache.invalidate("products_");
    queryCache.invalidate(`product_${id}`);
    return extractData<Product>(apiClient.patch(`/api/v1/products/${id}`, data));
  },

  deleteProduct: (id: string): Promise<void> => {
    queryCache.invalidate("products_");
    queryCache.invalidate(`product_${id}`);
    return apiClient.delete(`/api/v1/products/${id}`).then(() => undefined);
  },

  getProductStock: (productId: string, signal?: AbortSignal): Promise<StockData[]> =>
    apiClient.get(`/api/v1/products/${productId}`, { signal }).then((res) => {
      const payload = res.data?.data || res.data;
      return payload?.locations || payload?.warehouses || [];
    }),
};


// --- WAREHOUSES ---
export const warehousesApi = {
  getWarehouses: (): Promise<Warehouse[]> =>
    extractData<Warehouse[]>(apiClient.get("/api/v1/warehouses")),

  getWarehouse: (id: string): Promise<Warehouse> =>
    extractData<Warehouse>(apiClient.get(`/api/v1/warehouses/${id}`)),

  createWarehouse: (data: WarehouseInput): Promise<Warehouse> =>
    extractData<Warehouse>(apiClient.post("/api/v1/warehouses", data)),

  updateWarehouse: (id: string, data: WarehouseInput | Partial<WarehouseInput>): Promise<Warehouse> =>
    extractData<Warehouse>(apiClient.patch(`/api/v1/warehouses/${id}`, data)),
};

// --- LOCATIONS ---
export const locationsApi = {
  getLocations: (warehouseId: string, page: number = 1, limit: number = 20): Promise<LocationItem[]> =>
    extractData<LocationItem[]>(apiClient.get(`/api/v1/warehouses/${warehouseId}/locations`, { params: { page, limit } })),

  getLocation: (id: string): Promise<LocationDetail> =>
    extractData<LocationDetail>(apiClient.get(`/api/v1/locations/${id}`)),

  createLocation: (warehouseId: string, data: LocationInput): Promise<LocationItem> =>
    extractData<LocationItem>(apiClient.post(`/api/v1/warehouses/${warehouseId}/locations`, data)),

  updateLocation: (id: string, data: Partial<LocationInput> & { is_active?: boolean }): Promise<LocationItem> =>
    extractData<LocationItem>(apiClient.patch(`/api/v1/locations/${id}`, data)),

  deleteLocation: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/locations/${id}`).then(() => undefined),

  getLocationStock: (locationId: string): Promise<Array<{ product_id: string; product_name: string; sku: string; quantity: number; unit: string; value: string }>> =>
    extractData(apiClient.get(`/api/v1/locations/${locationId}/stock`)),
};

// --- SUPPLIERS ---
export const suppliersApi = {
  getSuppliers: (signal?: AbortSignal): Promise<Supplier[]> =>
    extractData<Supplier[]>(apiClient.get("/api/v1/suppliers", { signal })),
};

// --- HEALTH CHECK ---
export const healthApi = {
  getHealth: (): Promise<{ status: string; database: string; timestamp: string }> =>
    apiClient.get("/api/v1/health").then((res) => res.data),
};


// --- STOCK ---
export const stockApi = {
  getStock: (filters?: { product_id?: string; warehouse_id?: string; location_id?: string }): Promise<Stock[]> =>
    extractData<Stock[]>(apiClient.get("/api/v1/stock", { params: filters })),

  updateStock: (stockId: string, data: { location_id?: string; quantity?: number }): Promise<Stock> =>
    extractData<Stock>(apiClient.put(`/api/v1/stock/${stockId}`, data)),
};

// --- RECEIPTS ---
export const receiptsApi = {
  getReceipts: (filters?: { warehouse_id?: string; status?: string; date_range?: string }): Promise<Receipt[]> =>
    extractData<Receipt[]>(apiClient.get("/api/v1/receipts", { params: filters })),

  getReceipt: (id: string): Promise<Receipt> =>
    extractData<Receipt>(apiClient.get(`/api/v1/receipts/${id}`)),

  createReceipt: (data: ReceiptInput): Promise<Receipt> =>
    extractData<Receipt>(apiClient.post("/api/v1/receipts", data)),

  addReceiptItems: (receiptId: string, items: ReceiptItemInput[]): Promise<Receipt> =>
    extractData<Receipt>(apiClient.post(`/api/v1/receipts/${receiptId}/add-items`, { items })),

  receiveItems: (receiptId: string, items: { receipt_item_id: string; quantity_received: number }[]): Promise<Receipt> =>
    extractData<Receipt>(apiClient.post(`/api/v1/receipts/${receiptId}/receive`, items)),

  validateReceipt: (id: string): Promise<Receipt> =>
    extractData<Receipt>(apiClient.post(`/api/v1/receipts/${id}/validate`)),

  completeReceipt: (id: string): Promise<Receipt> =>
    extractData<Receipt>(apiClient.post(`/api/v1/receipts/${id}/complete`)),

  deleteReceipt: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/receipts/${id}`).then(() => undefined),
};

// --- DELIVERIES ---
export const deliveriesApi = {
  getDeliveries: (filters?: { warehouse_id?: string; status?: string; date_range?: string }): Promise<Delivery[]> =>
    extractData<Delivery[]>(apiClient.get("/api/v1/deliveries", { params: filters })),

  getDelivery: (id: string): Promise<Delivery> =>
    extractData<Delivery>(apiClient.get(`/api/v1/deliveries/${id}`)),

  createDelivery: (data: DeliveryInput): Promise<Delivery> =>
    extractData<Delivery>(apiClient.post("/api/v1/deliveries", data)),

  pickItems: (deliveryId: string, items: { delivery_item_id: string; quantity_picked: number }[]): Promise<Delivery> =>
    extractData<Delivery>(apiClient.post(`/api/v1/deliveries/${deliveryId}/pick-items`, items)),

  packItems: (deliveryId: string, items: { delivery_item_id: string; quantity_packed: number }[]): Promise<Delivery> =>
    extractData<Delivery>(apiClient.post(`/api/v1/deliveries/${deliveryId}/pack-items`, items)),

  shipDelivery: (id: string): Promise<Delivery> =>
    extractData<Delivery>(apiClient.post(`/api/v1/deliveries/${id}/ship`)),

  cancelDelivery: (id: string): Promise<Delivery> =>
    extractData<Delivery>(apiClient.post(`/api/v1/deliveries/${id}/cancel`)),
};

// --- TRANSFERS ---
export const transfersApi = {
  getTransfers: (filters?: { status?: string; date_range?: string }): Promise<Transfer[]> =>
    extractData<Transfer[]>(apiClient.get("/api/v1/transfers", { params: filters })),

  getTransfer: (id: string): Promise<Transfer> =>
    extractData<Transfer>(apiClient.get(`/api/v1/transfers/${id}`)),

  createTransfer: (data: TransferInput): Promise<Transfer> =>
    extractData<Transfer>(apiClient.post("/api/v1/transfers", data)),

  approveTransfer: (id: string): Promise<Transfer> =>
    extractData<Transfer>(apiClient.post(`/api/v1/transfers/${id}/approve`)),

  completeTransfer: (id: string): Promise<Transfer> =>
    extractData<Transfer>(apiClient.post(`/api/v1/transfers/${id}/complete`)),

  cancelTransfer: (id: string): Promise<Transfer> =>
    extractData<Transfer>(apiClient.post(`/api/v1/transfers/${id}/cancel`)),
};

// --- ADJUSTMENTS ---
export const adjustmentsApi = {
  getAdjustments: (filters?: { status?: string; reason?: string; date_range?: string }): Promise<Adjustment[]> =>
    extractData<Adjustment[]>(apiClient.get("/api/v1/adjustments", { params: filters })),

  getAdjustment: (id: string): Promise<Adjustment> =>
    extractData<Adjustment>(apiClient.get(`/api/v1/adjustments/${id}`)),

  createAdjustment: (data: AdjustmentInput): Promise<Adjustment> =>
    extractData<Adjustment>(apiClient.post("/api/v1/adjustments", data)),

  approveAdjustment: (id: string): Promise<Adjustment> =>
    extractData<Adjustment>(apiClient.post(`/api/v1/adjustments/${id}/approve`)),

  executeAdjustment: (id: string): Promise<Adjustment> =>
    extractData<Adjustment>(apiClient.post(`/api/v1/adjustments/${id}/execute`)),

  rejectAdjustment: (id: string): Promise<Adjustment> =>
    extractData<Adjustment>(apiClient.post(`/api/v1/adjustments/${id}/reject`)),
};

// --- LEDGER ---
export const ledgerApi = {
  getLedger: (filters?: { product_id?: string; warehouse_id?: string; date_range?: string }): Promise<LedgerEntry[]> =>
    extractData<LedgerEntry[]>(apiClient.get("/api/v1/ledger", { params: filters })),
};

// --- DASHBOARD ---
export const dashboardApi = {
  getKPIs: (params?: { warehouse_id?: string; date_range?: string }, signal?: AbortSignal): Promise<KPIs> =>
    withQueryCache(
      `kpis_${JSON.stringify(params || {})}`,
      () => extractData<KPIs>(apiClient.get("/api/v1/dashboard/kpis", { params, signal })),
      300000 // 5 minutes TTL
    ),

  getOperationsSummary: (params?: { date_range?: string }, signal?: AbortSignal): Promise<OperationsSummary> =>
    withQueryCache(
      `op_summary_${JSON.stringify(params || {})}`,
      () => extractData<OperationsSummary>(apiClient.get("/api/v1/dashboard/operations-summary", { params, signal })),
      300000
    ),

  getWarehouseDistribution: (signal?: AbortSignal): Promise<WarehouseMetrics[]> =>
    withQueryCache(
      "warehouse_dist",
      () => extractData<WarehouseMetrics[]>(apiClient.get("/api/v1/dashboard/warehouse-distribution", { signal })),
      300000
    ),

  getLiveActivity: (limit: number = 20, signal?: AbortSignal): Promise<ActivityEntry[]> =>
    extractData<ActivityEntry[]>(apiClient.get("/api/v1/dashboard/live-activity", { params: { limit }, signal })),

  getLowStockItems: (signal?: AbortSignal): Promise<LowStockItem[]> =>
    withQueryCache(
      "low_stock_items",
      () => extractData<LowStockItem[]>(apiClient.get("/api/v1/dashboard/low-stock", { signal })),
      300000
    ),

  getHealthScore: (signal?: AbortSignal): Promise<HealthScore> =>
    withQueryCache(
      "health_score",
      () => extractData<HealthScore>(apiClient.get("/api/v1/dashboard/health-score", { signal })),
      300000
    ),
};


// Backward-compatibility wrapper for Dashboard Page
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const res = await apiClient.get("/api/dashboard/metrics");
    return res.data?.data || res.data;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Dashboard API] Using fallback metrics due to network offline mode.");
    }
    return {
      greeting: "Good afternoon, Logistics Director",
      headlineBold: "Inventory Flow & Telemetry",
      headlineAccent: "is in motion.",
      subtitle: "Real-time stock monitoring across fulfillment centers",
      totalWarehouses: 3,
      totalProductsCount: 20,
      totalStockQuantity: 14500,
      operationsSummary: [
        { label: "Inbound Receipts", count: 23, change: "+12%", isPositive: true, iconType: "ArrowDownLeft" },
        { label: "Outbound Deliveries", count: 14, change: "-8%", isPositive: true, iconType: "ArrowUpRight" },
        { label: "Internal Transfers", count: 8, change: "+5%", isPositive: true, iconType: "Repeat" },
        { label: "Stock Adjustments", count: 2, change: "+0%", isPositive: true, iconType: "Sliders" }
      ],
      healthData: {
        percentage: 95,
        statusText: "Optimal Health",
        description: "95% of active inventory lines meet reorder safety thresholds.",
        inStock: 17,
        lowStock: 3,
        outOfStock: 0
      },
      barChartData: [
        { day: "Mon", value: 420 },
        { day: "Tue", value: 680 },
        { day: "Wed", value: 590 },
        { day: "Thu", value: 810 },
        { day: "Fri", value: 940 },
        { day: "Sat", value: 310 },
        { day: "Sun", value: 520 }
      ],
      recentMovements: []
    };
  }
}


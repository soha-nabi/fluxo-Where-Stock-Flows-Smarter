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
      console.error("[API Error Interceptor]:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
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
    if (payload && typeof payload === "object" && "data" in payload && payload.status) {
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

// --- PRODUCTS ---
export const productsApi = {
  getProducts: (params?: { search?: string; category?: string; page?: number; limit?: number; sort_by?: string }): Promise<ProductsResponse> =>
    extractData<ProductsResponse>(apiClient.get("/api/v1/products", { params })),

  getProduct: (id: string): Promise<Product> =>
    extractData<Product>(apiClient.get(`/api/v1/products/${id}`)),

  createProduct: (data: ProductInput): Promise<Product> =>
    extractData<Product>(apiClient.post("/api/v1/products", data)),

  updateProduct: (id: string, data: ProductInput | Partial<ProductInput>): Promise<Product> =>
    extractData<Product>(apiClient.patch(`/api/v1/products/${id}`, data)),

  deleteProduct: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/products/${id}`).then(() => undefined),

  getProductStock: (productId: string): Promise<StockData[]> =>
    apiClient.get(`/api/v1/products/${productId}`).then((res) => {
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
  getKPIs: (params?: { warehouse_id?: string; date_range?: string }): Promise<KPIs> =>
    extractData<KPIs>(apiClient.get("/api/v1/dashboard/kpis", { params })),

  getOperationsSummary: (params?: { date_range?: string }): Promise<OperationsSummary> =>
    extractData<OperationsSummary>(apiClient.get("/api/v1/dashboard/operations-summary", { params })),

  getWarehouseDistribution: (): Promise<WarehouseMetrics[]> =>
    extractData<WarehouseMetrics[]>(apiClient.get("/api/v1/dashboard/warehouse-distribution")),

  getLiveActivity: (limit: number = 20): Promise<ActivityEntry[]> =>
    extractData<ActivityEntry[]>(apiClient.get("/api/v1/dashboard/live-activity", { params: { limit } })),

  getLowStockItems: (): Promise<LowStockItem[]> =>
    extractData<LowStockItem[]>(apiClient.get("/api/v1/dashboard/low-stock")),

  getHealthScore: (): Promise<HealthScore> =>
    extractData<HealthScore>(apiClient.get("/api/v1/dashboard/health-score")),
};

// Backward-compatibility wrapper for Dashboard Page
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await apiClient.get("/api/dashboard/metrics");
  return res.data;
}

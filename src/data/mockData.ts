export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: number;
  warehouse: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface StockMovement {
  id: string;
  dateTime: string;
  type: 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment';
  reference: string;
  productName: string;
  from: string;
  to: string;
  quantity: number;
  status: 'Completed' | 'In Transit' | 'Pending';
}

export interface ActivityItem {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  title: string;
  location: string;
  time: string;
  value: string;
  isPositive?: boolean;
}

export interface WarehouseNode {
  id: string;
  name: string;
  skus: number;
  lat: number;
  lng: number;
  status: string;
}

export const MOCK_HERO_DATA = {
  greeting: "Good Morning, Soha",
  headlineBold: "Your inventory",
  headlineAccent: "is in motion.",
  subtitle: "14,820 products across 3 warehouses. Everything is running smoothly.",
  totalWarehouses: 3,
};

export const MOCK_OPERATIONS_SUMMARY = [
  {
    label: "Incoming",
    count: 23,
    change: "+12%",
    isPositive: true,
    iconType: "incoming",
  },
  {
    label: "Outgoing",
    count: 14,
    change: "-8%",
    isPositive: false,
    iconType: "outgoing",
  },
  {
    label: "Transfers",
    count: 8,
    change: "+5%",
    isPositive: true,
    iconType: "transfer",
  },
  {
    label: "Adjustments",
    count: 2,
    change: "+0%",
    isPositive: true,
    iconType: "adjustment",
  },
];

export const MOCK_HEALTH_DATA = {
  percentage: 95,
  statusText: "Healthy",
  description: "Most items are in optimal stock levels.",
  inStock: 12597,
  lowStock: 1482,
  outOfStock: 741,
};

export const MOCK_BAR_CHART_DATA = [
  { day: "Mon", value: 650 },
  { day: "Tue", value: 1200 },
  { day: "Wed", value: 1850 },
  { day: "Thu", value: 1400 },
  { day: "Fri", value: 2400 },
  { day: "Sat", value: 1950 },
  { day: "Sun", value: 2100 },
];

export const MOCK_LIVE_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "receipt",
    title: "+250 Steel Rods received",
    location: "Austin Warehouse",
    time: "2m ago",
    value: "+250",
    isPositive: true,
  },
  {
    id: "act-2",
    type: "delivery",
    title: "-40 Aluminum Sheets shipped",
    location: "Dallas Warehouse",
    time: "12m ago",
    value: "-40",
    isPositive: false,
  },
  {
    id: "act-3",
    type: "transfer",
    title: "Transfer completed",
    location: "Reno → Austin",
    time: "28m ago",
    value: "Transfer",
  },
  {
    id: "act-4",
    type: "adjustment",
    title: "-15 Circuit Boards adjusted",
    location: "Manual Adjustment",
    time: "1h ago",
    value: "-15",
    isPositive: false,
  },
];

export const MOCK_RECENT_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    dateTime: "Today, 14:00",
    type: "Receipt",
    reference: "PO-8921",
    productName: "MicroSemi Conductor Tech",
    from: "Supplier",
    to: "Austin",
    quantity: 3000,
    status: "Completed",
  },
  {
    id: "mov-2",
    dateTime: "Today, 12:15",
    type: "Delivery",
    reference: "DO-7845",
    productName: "Aluminum Extrusions",
    from: "Dallas",
    to: "Customer",
    quantity: -840,
    status: "In Transit",
  },
  {
    id: "mov-3",
    dateTime: "Today, 10:45",
    type: "Transfer",
    reference: "TR-1123",
    productName: "Industrial Screws",
    from: "Reno",
    to: "Austin",
    quantity: 500,
    status: "Completed",
  },
  {
    id: "mov-4",
    dateTime: "Today, 09:20",
    type: "Adjustment",
    reference: "ADJ-0067",
    productName: "PCB Boards",
    from: "Austin",
    to: "—",
    quantity: -15,
    status: "Completed",
  },
];

export const MOCK_WAREHOUSE_NODES: WarehouseNode[] = [
  { id: "wh-1", name: "Austin", skus: 7858, lat: 30, lng: 80, status: "Active" },
  { id: "wh-2", name: "Reno", skus: 4212, lat: 45, lng: 40, status: "Active" },
  { id: "wh-3", name: "Dallas", skus: 2750, lat: 70, lng: 110, status: "Active" },
];

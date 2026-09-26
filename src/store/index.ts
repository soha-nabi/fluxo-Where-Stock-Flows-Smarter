export * from "./useStore";
export * from "./useProductStore";
export * from "./useDashboardStore";
export * from "./useReceiptStore";
export * from "./useDeliveryStore";
export * from "./useTransferStore";
export * from "./useAdjustmentStore";

// Selector helpers for zero re-render overhead state subscriptions
import { useProductStore } from "./useProductStore";
import { useDashboardStore } from "./useDashboardStore";
import { useReceiptStore } from "./useReceiptStore";
import { useDeliveryStore } from "./useDeliveryStore";

export const useProductsList = () => useProductStore((state) => state.products);
export const useProductLoading = () => useProductStore((state) => state.loading);

export const useDashboardKPIs = () => useDashboardStore((state) => state.kpis);
export const useDashboardLoading = () => useDashboardStore((state) => state.loading);

export const useReceiptsList = () => useReceiptStore((state) => state.receipts);
export const useDeliveriesList = () => useDeliveryStore((state) => state.deliveries);


"use me";
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Sliders,
  History,
  BarChart3,
  Settings,
  ChevronRight,
  Boxes,
  Box,
  ArrowRight,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Warehouses", href: "/warehouses", icon: Warehouse },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Receipts", href: "/receipts", icon: ArrowDownLeft, badge: "3" },
  { name: "Deliveries", href: "/deliveries", icon: ArrowUpRight, badge: "14" },
  { name: "Transfers", href: "/transfers", icon: Repeat },
  { name: "Adjustments", href: "/adjustments", icon: Sliders },
  { name: "Move History", href: "/history", icon: History },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0e14] border-r border-[#1e202e] select-none p-4 w-64 shrink-0 justify-between">
      {/* Brand Header */}
      <div>
        <Link href="/" className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6d28d9] via-[#8b5cf6] to-[#c084fc] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white font-sans">
              FLUXO
            </span>
            <span className="text-[10px] text-gray-400 tracking-tight">
              Where Stock Flows Smarter
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileClose && onMobileClose()}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative",
                  isActive
                    ? "bg-[#5b21b6] text-white shadow-[0_0_15px_rgba(91,33,182,0.6)] font-semibold"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#161824]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                  )}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#1f2233] text-gray-400 group-hover:text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Floating Card & User Profile */}
      <div className="space-y-4 pt-4 border-t border-[#1e202e]">
        {/* 3D Glowing Upgrade Promo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181a29] to-[#10121d] border border-[#282b40] p-4 text-left shadow-2xl group">
          <div className="w-10 h-10 mb-3 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#c084fc] flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] transform group-hover:rotate-12 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-gray-200 leading-snug mb-3">
            Real-time inventory across all your locations.
          </p>
          <button className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:brightness-110 text-white text-xs font-semibold flex items-center justify-between transition-all shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <span>Upgrade Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141622] border border-[#1e202e] hover:border-[#2b2e45] cursor-pointer transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow">
              SN
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">Soha Nabi</span>
              <span className="text-[10px] text-gray-400 font-mono">Admin</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onMobileClose}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

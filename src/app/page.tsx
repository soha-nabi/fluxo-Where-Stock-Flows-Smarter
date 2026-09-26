"use me";
"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OperationsOverviewHero } from "@/components/dashboard/OperationsOverviewHero";
import { InventoryHealthSection } from "@/components/dashboard/InventoryHealthSection";
import { StockMovementChart } from "@/components/dashboard/StockMovementChart";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { LiveMovementLogTable } from "@/components/dashboard/LiveMovementLogTable";

export default function MissionControlDashboard() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Section 1 & 4: Operations Overview + 3D Warehouse Network Visualization */}
        <OperationsOverviewHero />

        {/* Section 2 & 3: Mission Control 3-Column Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Inventory Health Widget */}
          <InventoryHealthSection />

          {/* Stock Movement Visualizer */}
          <StockMovementChart />

          {/* Live Activity Stream */}
          <LiveActivityFeed />
        </div>

        {/* Live Movement Feed / Telemetry Log */}
        <LiveMovementLogTable />
      </div>
    </AppShell>
  );
}

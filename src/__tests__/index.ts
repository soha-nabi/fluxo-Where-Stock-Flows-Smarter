/**
 * FLUXO Master Integration Test Runner
 * Executes all 6 integration test suites in sequence.
 */

import { AuthIntegrationTests } from "./auth.test";
import { ReceiptIntegrationTests } from "./receipt.test";
import { DeliveryIntegrationTests } from "./delivery.test";
import { TransferIntegrationTests } from "./transfer.test";
import { AdjustmentIntegrationTests } from "./adjustment.test";
import { ApiIntegrationTests } from "./api.test";

export async function runMasterTestSuite(): Promise<boolean> {
  console.log("=====================================================================");
  console.log("🚀 STARTING FLUXO MASTER INTEGRATION TEST SUITE");
  console.log("=====================================================================\n");

  const results = [
    await AuthIntegrationTests.runAll(),
    await ReceiptIntegrationTests.runAll(),
    await DeliveryIntegrationTests.runAll(),
    await TransferIntegrationTests.runAll(),
    await AdjustmentIntegrationTests.runAll(),
    await ApiIntegrationTests.runAll(),
  ];

  const allPassed = results.every(Boolean);

  console.log("=====================================================================");
  if (allPassed) {
    console.log("🎉 ALL 6 INTEGRATION TEST SUITES PASSED CLEANLY!");
  } else {
    console.log("⚠️ SOME INTEGRATION TESTS FAILED. PLEASE REVIEW LOGS ABOVE.");
  }
  console.log("=====================================================================\n");

  return allPassed;
}

// Execute test runner if invoked directly via ts-node / CLI
if (require.main === module) {
  runMasterTestSuite();
}

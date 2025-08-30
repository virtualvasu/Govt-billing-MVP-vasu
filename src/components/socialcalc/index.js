// Import the modular SocialCalc core
// This replaces the monolithic "./aspiring/SocialCalc.js" import
import SocialCalcFromCore from "./core/index.js";

// Use the imported SocialCalc
const SocialCalc = SocialCalcFromCore;

// Export SocialCalc reference if needed elsewhere
export { SocialCalc };

// Re-export all functions from modules to maintain backward compatibility
export * from "./modules/device.js";
export * from "./modules/init.js";
export * from "./modules/sheets.js";
export * from "./modules/logos.js";
export * from "./modules/history.js";
export * from "./modules/formatting.js";
export * from "./modules/listeners.js";
export * from "./modules/exporters.js";
export * from "./modules/prompts.js";
export * from "./modules/utils.js";
export * from "./modules/weight.js";

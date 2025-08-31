/**
 * @fileoverview SocialCalc Core Index - Modern ES module entry point for SocialCalc
 * @description Imports all core modules and provides a unified export interface.
 * This replaces the monolithic SocialCalc.js file with a modular architecture.
 * @author SocialCalc Team
 * @version 2.0
 * @since 1.0
 */

/**
 * Import all core modules in dependency order.
 * Order is critical - constants must be loaded first as other modules depend on them.
 */
import "./constants.js";           // Core constants and configuration - must be first
import "./core.js";                // Core functionality (Cell, Sheet, WorkBook classes)
import "./format-number.js";       // Number formatting utilities and parsers
import "./formula.js";             // Formula parsing, calculation engine, and functions
import "./table-editor.js";        // Table editor components and UI interactions
import "./spreadsheet-control.js"; // High-level spreadsheet controls and public API

/**
 * Global SocialCalc object reference.
 * The imported modules above contribute to this global object which is available
 * as window.SocialCalc in browsers or global.SocialCalc in Node.js environments.
 * @type {Object|undefined}
 */
let SocialCalc;

/**
 * Detect and assign the SocialCalc global object from the appropriate global scope.
 * Uses nullish coalescing operator for cleaner fallback handling.
 * @type {Object}
 */
SocialCalc = globalThis.SocialCalc 
  ?? (typeof window !== "undefined" && window.SocialCalc) 
  ?? (typeof global !== "undefined" && global.SocialCalc) 
  ?? (() => {
      console.error("SocialCalc not found after loading core modules");
      return {}; // Return empty object as fallback
    })();

/**
 * Default export of the SocialCalc object for ES module compatibility.
 * @type {Object}
 */
export default SocialCalc;

/**
 * Named export of the SocialCalc object for flexible import patterns.
 * @type {Object}
 */
export { SocialCalc };

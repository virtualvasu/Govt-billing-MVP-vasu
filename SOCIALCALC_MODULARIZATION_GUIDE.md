# SocialCalc Modularization Guide

## Overview

The massive `SocialCalc.js` file (32,426+ lines) has been broken down into logical modules. This guide explains how to complete the modularization and maintain imports.

## Module Structure

### 1. **Core Modules** (in `/core/` directory)

- **`constants.js`** - Lines 83-1028 of original file
  - `SocialCalc.Constants`
  - `SocialCalc.ConstantsDefaultClasses`
  - `SocialCalc.ConstantsSetClasses`

- **`core.js`** - Lines 1029-8100 of original file
  - `SocialCalc.Callbacks`
  - `SocialCalc.Cell` class
  - `SocialCalc.Sheet` class
  - Sheet parsing/saving functions

- **`format-number.js`** - Lines 16201-23200 of original file
  - `SocialCalc.FormatNumber` functions
  - Date/time formatting
  - Currency formatting

- **`formula.js`** - Lines 23201-24844 of original file
  - Formula parsing
  - Function definitions
  - Calculation engine

- **`table-editor.js`** - Lines 8101-16200 of original file
  - Table rendering
  - Mouse/keyboard handling
  - Grid display

- **`spreadsheet-control.js`** - Lines 24845-32426 of original file
  - High-level UI controls
  - Toolbars and menus
  - Popup dialogs

## How to Complete the Split

### Step 1: Extract Code Sections

For each module file, you need to:

1. **Copy the relevant code sections** from the original `SocialCalc.js` file
2. **Paste them into the TODO sections** of each module file
3. **Remove the UMD wrapper** from the copied sections (keep only the inner code)

### Step 2: Line Number Mapping

| Module File | Original Lines | What to Copy |
|-------------|----------------|--------------|
| `constants.js` | 83-1028 | All constants definitions |
| `core.js` | 1029-8100 | Cell, Sheet classes and core functions |
| `table-editor.js` | 8101-16200 | Table editor functionality |
| `format-number.js` | 16201-23200 | Number formatting functions |
| `formula.js` | 23201-24844 | Formula parsing and functions |
| `spreadsheet-control.js` | 24845-32426 | UI controls and spreadsheet management |

### Step 3: Extract Code Example

Here's how to extract code for `constants.js`:

```bash
# Extract lines 83-1028 from original file
sed -n '83,1028p' /path/to/original/SocialCalc.js
```

Then paste the extracted code into the TODO section of `constants.js`, replacing:
```javascript
// TODO: Copy SocialCalc.Constants, SocialCalc.ConstantsDefaultClasses, 
// and SocialCalc.ConstantsSetClasses from the original file
```

## Import Structure After Split

### Before (Current):
```
Files.tsx
  └── import * as AppGeneral from "../socialcalc/index.js"
       └── import "./aspiring/SocialCalc.js" (32,426 lines)
```

### After (Modular):
```
Files.tsx
  └── import * as AppGeneral from "../socialcalc/index.js"
       └── import SocialCalcFromCore from "./core/index.js"
            ├── import "./constants.js"
            ├── import "./core.js"  
            ├── import "./format-number.js"
            ├── import "./formula.js"
            ├── import "./table-editor.js"
            └── import "./spreadsheet-control.js"
```

## Key Benefits

1. **No changes needed in consuming files** - `Files.tsx` and other components continue to work unchanged
2. **Better maintainability** - Each module focuses on specific functionality
3. **Improved loading** - Can potentially load modules on demand
4. **Easier debugging** - Smaller, focused files
5. **Better collaboration** - Multiple developers can work on different modules

## Important Notes

### Dependency Order
The modules must be loaded in this order:
1. `constants.js` (defines all constants)
2. `core.js` (basic classes)
3. `format-number.js` (number formatting)
4. `formula.js` (formula engine)
5. `table-editor.js` (UI components)
6. `spreadsheet-control.js` (high-level controls)

### Global Object Maintenance
- Each module contributes to the global `SocialCalc` object
- The UMD pattern is preserved for browser compatibility
- All functions remain accessible as `SocialCalc.FunctionName`

### Testing Strategy
1. Extract one module at a time
2. Test that the app still works after each extraction
3. Start with `constants.js` (safest) and work your way through

## Next Steps

1. **Extract `constants.js` first** - Copy lines 83-1028 from original file
2. **Test the app** - Make sure everything still works
3. **Continue with `core.js`** - Copy lines 1029-8100
4. **Repeat for remaining modules**
5. **Remove original file** once all modules are extracted and tested

## Rollback Plan

If something breaks, you can easily rollback by:
1. Reverting `index.js` to import the original file:
   ```javascript
   import "./aspiring/SocialCalc.js";
   ```
2. The original file remains untouched during this process

## File Structure
```
src/components/socialcalc/
├── index.js (updated to use modular approach)
├── aspiring/
│   └── SocialCalc.js (original file - can be removed after split)
├── core/ (new)
│   ├── index.js (aggregates all core modules)
│   ├── constants.js
│   ├── core.js
│   ├── format-number.js
│   ├── formula.js
│   ├── table-editor.js
│   └── spreadsheet-control.js
└── modules/ (existing)
    ├── device.js
    ├── formatting.js
    └── ... (other existing modules)
```

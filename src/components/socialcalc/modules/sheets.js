// Sheet management and data functions
import { isWorkbookControlReady } from './init.js';

let SocialCalc;

// Ensure SocialCalc is loaded from the global scope
if (typeof window !== "undefined" && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  console.error("SocialCalc not found in global scope");
  SocialCalc = {}; // Fallback to prevent errors
}

export function activateFooterButton(index) {
  if (index === SocialCalc.oldBtnActive) return;
  
  if (!isWorkbookControlReady()) {
    console.error("WorkBook control not properly initialized. Cannot activate footer button.");
    return;
  }
  
  var control = SocialCalc.GetCurrentWorkBookControl();

  var sheets = [];
  for (var key in control.sheetButtonArr) {
    //console.log(key);
    sheets.push(key);
  }
  
  // Sort sheets to ensure consistent ordering
  sheets.sort();
  
  // Map the index - if index is 0-4 (billType), convert to 1-5 (footer index)
  // If index is already 1-5 (footer index), use as is
  let adjustedIndex = index;
  if (index >= 0 && index <= 4) {
    adjustedIndex = index + 1; // Convert 0-4 to 1-5
  }
  
  if (!sheets[adjustedIndex - 1]) {
    console.error(`Sheet at adjusted index ${adjustedIndex} (original: ${index}) not found. Available sheets:`, sheets);
    console.log(`Attempted to access sheets[${adjustedIndex - 1}] but only ${sheets.length} sheets available`);
    
    // Try to map to available sheet - if index is out of bounds, use the last available sheet
    if (sheets.length > 0) {
      const fallbackIndex = Math.min(adjustedIndex - 1, sheets.length - 1);
      console.log(`Using fallback sheet at index ${fallbackIndex}: ${sheets[fallbackIndex]}`);
      var targetSheet = sheets[fallbackIndex];
    } else {
      console.error("No sheets available");
      return;
    }
  } else {
    var targetSheet = sheets[adjustedIndex - 1];
  }
  
  var spreadsheet = control.workbook.spreadsheet;
  var ele = document.getElementById(spreadsheet.formulabarDiv.id);
  if (ele) {
    SocialCalc.ToggleInputLineButtons(false);
    var input = ele.firstChild;
    input.style.display = "none";
    spreadsheet.editor.state = "start";
  }
  SocialCalc.WorkBookControlActivateSheet(targetSheet);

  SocialCalc.oldBtnActive = index;
}

export function viewFile(filename, data) {
  if (!isWorkbookControlReady()) {
    console.error("WorkBook control not properly initialized. Cannot view file.");
    return;
  }

  const control = SocialCalc.GetCurrentWorkBookControl();
  
  SocialCalc.WorkBookControlInsertWorkbook(data);

  control.workbook.spreadsheet.editor.state = "start";

  control.workbook.spreadsheet.ExecuteCommand("redisplay", "");

  window.setTimeout(function () {
    if (isWorkbookControlReady()) {
      const currentControl = SocialCalc.GetCurrentWorkBookControl();
      SocialCalc.ScrollRelativeBoth(
        currentControl.workbook.spreadsheet.editor,
        1,
        0
      );
      SocialCalc.ScrollRelativeBoth(
        currentControl.workbook.spreadsheet.editor,
        -1,
        0
      );
    }
  }, 1000);
}

export function getSpreadsheetContent() {
  return SocialCalc.WorkBookControlSaveSheet();
}

export function getCurrentHTMLContent() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  return control.workbook.spreadsheet.CreateSheetHTML();
}

export function getAllHTMLContent(sheetdata) {
  var appsheets = {};
  // var control = SocialCalc.GetCurrentWorkBookControl();

  for (var i = 1; i <= sheetdata.numsheets; i++) {
    var key = "sheet" + i;
    appsheets[key] = key;
  }

  return SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
}

export function getCurrentSheet() {
  return SocialCalc.GetCurrentWorkBookControl().currentSheetButton.id;
}

export function getAllSheetsData() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.sheetButtonArr) {
    return [];
  }

  var sheetsData = [];
  var currentSheetId = control.currentSheetButton
    ? control.currentSheetButton.id
    : null;

  // Get all sheet names
  for (var sheetId in control.sheetButtonArr) {
    // Temporarily switch to each sheet to get its HTML content
    SocialCalc.WorkBookControlActivateSheet(sheetId);

    var htmlContent = control.workbook.spreadsheet.CreateSheetHTML();

    sheetsData.push({
      id: sheetId,
      name: sheetId.replace("sheet", "Sheet "), // Convert 'sheet1' to 'Sheet 1'
      htmlContent: htmlContent,
    });
  }

  // Switch back to the original sheet if it existed
  if (currentSheetId) {
    SocialCalc.WorkBookControlActivateSheet(currentSheetId);
  }

  return sheetsData;
}

export function getWorkbookInfo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.sheetButtonArr) {
    return { numsheets: 0, sheets: [] };
  }

  var sheets = [];
  for (var sheetId in control.sheetButtonArr) {
    sheets.push(sheetId);
  }

  return {
    numsheets: sheets.length,
    sheets: sheets,
  };
}

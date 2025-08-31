// Spreadsheet initialization functions
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

/**
 * Check if the workbook control is properly initialized
 * @returns {boolean} True if workbook control is ready
 */
export function isWorkbookControlReady() {
  const control = SocialCalc.GetCurrentWorkBookControl();
  return !!(control && control.workbook && control.workbook.spreadsheet && control.currentSheetButton);
}

export function initializeApp(data) {
  /* Initializes the spreadsheet */

  // Wait for DOM to be ready
  const waitForElement = (id, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkElement = () => {
        const element = document.getElementById(id);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element with id '${id}' not found within ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  };

  // Main initialization function
  const performInitialization = async () => {
    try {
      // Wait for required elements to be available
      await waitForElement("tableeditor");
      
      let tableeditor = document.getElementById("tableeditor");
      let spreadsheet = new SocialCalc.SpreadsheetControl();
      let workbook = new SocialCalc.WorkBook(spreadsheet);
      
      // Use the first available sheet from data instead of hardcoded "sheet1"
      let firstSheetId = "sheet1"; // Default fallback
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.sheetArr && Object.keys(parsedData.sheetArr).length > 0) {
          firstSheetId = Object.keys(parsedData.sheetArr)[0];
        }
      } catch (e) {
        console.warn("Could not parse data to get first sheet, using default");
      }
      
      workbook.InitializeWorkBook(firstSheetId);

      spreadsheet.InitializeSpreadsheetControl(tableeditor, 0, 0, 0);
      spreadsheet.ExecuteCommand("redisplay", "");

      let workbookcontrol = new SocialCalc.WorkBookControl(
        workbook,
        "workbookControl",
        firstSheetId
      );
      
      // Wait for the workbook control to be properly initialized
      await new Promise((resolve) => {
        setTimeout(() => {
          workbookcontrol.InitializeWorkBookControl();
          
          // Wait a bit more to ensure the initial sheet is created
          setTimeout(() => {
            // Verify that the control is properly set
            const control = SocialCalc.GetCurrentWorkBookControl();
            if (!control || !control.workbook || !control.currentSheetButton) {
              console.error("WorkBook control initialization failed - missing sheet button");
              resolve();
              return;
            }
            
            // alert("app: "+JSON.stringify(data));
            SocialCalc.WorkBookControlLoad(data);
            // Fixed height setting - this could be problematic for mobile
            let ele = document.getElementById("te_griddiv");
            // ele.style.height = "1600px";
            spreadsheet.DoOnResize();
            resolve();
          }, 100); // Additional delay for sheet creation
        }, 200);
      });
      
    } catch (error) {
      console.error("Error initializing app:", error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  // Return the initialization promise
  return performInitialization();
}

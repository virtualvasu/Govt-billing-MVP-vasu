/**
 * @fileoverview SocialCalc Constants Module
 * Contains customizable constants, strings, and configuration values for SocialCalc.
 * This is where most of the common localizations are done.
 * 
 * @author Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
 * @copyright (c) Copyright 2008, 2009, 2010 Socialtext, Inc. All Rights Reserved.
 * @license Artistic License 2.0 - http://socialcalc.org/licenses/al-20/
 */

/**
 * @namespace SocialCalc
 * @description Main SocialCalc namespace object
 */
const SocialCalc = globalThis.SocialCalc || {};

/**
 * SocialCalc Constants Configuration
 * 
 * TO LEARN HOW TO LOCALIZE OR CUSTOMIZE SOCIALCALC:
 * 
 * The constants are all properties of the SocialCalc.Constants object.
 * They are grouped by functionality and the modules that use them.
 * 
 * Properties whose names start with "s_" are strings, or arrays of strings,
 * that are good candidates for translation from English.
 * 
 * Other properties relate to visual settings, localization parameters, etc.
 * 
 * These values are not used when SocialCalc modules are first loaded.
 * They may be modified before the first use of the routines that use them,
 * e.g., before creating SocialCalc objects.
 * 
 * The exceptions are:
 *    TooltipOffsetX and TooltipOffsetY, as described with their definitions.
 * 
 * SocialCalc IS NOT DESIGNED FOR USE WITH A TRANSLATION FUNCTION each time a string
 * is used. Instead, language translations may be done by modifying this object.
 * 
 * To customize SocialCalc, you may either replace this file with a modified version
 * or you can overwrite the values before use. An example would be to
 * iterate over all the properties looking for names that start with "s_" and
 * use some other mechanism to obtain a localized string and replace the values
 * here with those translated values.
 * 
 * There is also a function, SocialCalc.ConstantsSetClasses, that may be used
 * to easily switch SocialCalc from using explicit CSS styles for many things
 * to using CSS classes. See the function, below, for more information.
 */

/**
 * @typedef {Object} SocialCalcConstants
 * @description Configuration constants for SocialCalc
 */
SocialCalc.Constants = {
    /**
     * Main SocialCalc module constants (socialcalc-3.js)
     */

    /**
     * @description Common Constants
     */

    /** @type {string} Default type for text when reading source file */
    textdatadefaulttype: "t",

    /**
     * @description Common error messages
     */

    /** @type {string} Error message for unsupported browsers */
    s_BrowserNotSupported: "Browser not supported.",

    /** @type {string} Internal error message prefix */
    s_InternalError: "Internal SocialCalc error (probably an internal bug): ",

    /**
     * @description SocialCalc.ParseSheetSave error messages
     * Errors thrown on unexpected values in save file
     */

    /** @type {string} Error for unknown column type */
    s_pssUnknownColType: "Unknown col type item",

    /** @type {string} Error for unknown row type */
    s_pssUnknownRowType: "Unknown row type item",

    /** @type {string} Error for unknown line type */
    s_pssUnknownLineType: "Unknown line type",

    /**
     * @description SocialCalc.CellFromStringParts error messages
     */

    /** @type {string} Error for unknown cell type */
    s_cfspUnknownCellType: "Unknown cell type item",

    /**
     * @description SocialCalc.CanonicalizeSheet configuration
     */

    /** @type {boolean} Whether to perform canonicalization calculations */
    doCanonicalizeSheet: true,

    /**
     * @description ExecuteSheetCommand error messages
     */

    /** @type {string} Error for unknown sheet command */
    s_escUnknownSheetCmd: "Unknown sheet command: ",

    /** @type {string} Error for unknown set coordinate command */
    s_escUnknownSetCoordCmd: "Unknown set coord command: ",

    /** @type {string} Error for unknown command */
    s_escUnknownCmd: "Unknown command: ",

    /**
     * @description SocialCalc.CheckAndCalcCell error messages
     */

    /** @type {string} Circular reference error message */
    s_caccCircRef: "Circular reference to ",

    /**
     * @description SocialCalc.RenderContext configuration
     */

    /** @type {string} Minimum width of the row header column in pixels */
    defaultRowNameWidth: "30",

    /** @type {number} Default assumed row height for guessing */
    defaultAssumedRowHeight: 15,

    /** @type {string|null} Prefix for cell IDs when rendering */
    defaultCellIDPrefix: "cell_",

    /**
     * @description Default sheet display values
     */

    /** @type {string} Default cell layout CSS */
    defaultCellLayout: "padding:2px 2px 1px 2px;vertical-align:top;",

    /** @type {string} Default cell font style */
    defaultCellFontStyle: "normal normal",

    /** @type {string} Default cell font size */
    defaultCellFontSize: "small",

    /** @type {string} Default cell font family */
    defaultCellFontFamily: "Verdana,Arial,Helvetica,sans-serif",

    /** @type {string} Default pane divider width */
    defaultPaneDividerWidth: "2",

    /** @type {string} Default pane divider height */
    defaultPaneDividerHeight: "3",

    /** @type {string} CSS for grid borders when grid is enabled */
    defaultGridCSS: "1px solid #C0C0C0;",

    /**
     * @description Comment cell styling
     */

    /** @type {string} CSS class for cells with comments when grid enabled */
    defaultCommentClass: "",

    /** @type {string} CSS style for cells with comments when grid enabled */
    defaultCommentStyle: "background-repeat:no-repeat;background-position:top right;background-image:url(www/assets/images/sc_commentbg.gif);",

    /** @type {string} CSS class for cells with comments when grid not enabled */
    defaultCommentNoGridClass: "",

    /** @type {string} CSS style for cells with comments when grid not enabled */
    defaultCommentNoGridStyle: "",

    /**
     * @description Column width settings
     */

    /** @type {string} Default column width */
    defaultColWidth: "80",

    /** @type {number} Minimum column width in pixels */
    defaultMinimumColWidth: 10,

    /**
     * @description Highlighting styles - at least one of class and/or style are needed
     */

    /** @type {string} CSS class for cursor highlighting */
    defaultHighlightTypeCursorClass: "",

    /** @type {string} CSS style for cursor highlighting */
    defaultHighlightTypeCursorStyle: "",

    /** @type {string} CSS class for range highlighting */
    defaultHighlightTypeRangeClass: "",

    /** @type {string} CSS style for range highlighting */
    defaultHighlightTypeRangeStyle: "",

    /**
     * @description Column and row header styles
     */

    /** @type {string} Regular column heading letters CSS class */
    defaultColnameClass: "",

    /** @type {string} Regular column heading letters CSS style */
    defaultColnameStyle: "font-size:small;text-align:center;color:#FFFFFF;background-color:#808080;cursor:e-resize;",

    /** @type {string} Selected column heading CSS class */
    defaultSelectedColnameClass: "",

    /** @type {string} Selected column heading CSS style */
    defaultSelectedColnameStyle: "font-size:small;text-align:center;color:#FFFFFF;background-color:#404040;cursor:e-resize;",

    /** @type {string} Regular row heading numbers CSS class */
    defaultRownameClass: "",

    /** @type {string} Regular row heading numbers CSS style */
    defaultRownameStyle: "font-size:small;text-align:right;color:#FFFFFF;background-color:#808080;",

    /** @type {string} Selected row heading CSS class */
    defaultSelectedRownameClass: "",

    /** @type {string} Selected row heading CSS style */
    defaultSelectedRownameStyle: "font-size:small;text-align:right;color:#FFFFFF;background-color:#404040;",

    /** @type {string} Upper left corner cell CSS class */
    defaultUpperLeftClass: "",

    /** @type {string} Upper left corner cell CSS style */
    defaultUpperLeftStyle: "font-size:small;text-align:center;color:#FFFFFF;background-color:#808080;cursor:e-resize;",

    /** @type {string} Skipped cells CSS class (for spanned cells peeking into a pane) */
    defaultSkippedCellClass: "",

    /** @type {string} Skipped cells CSS style */
    defaultSkippedCellStyle: "font-size:small;background-color:#CCC",

    /** @type {string} Pane divider CSS class */
    defaultPaneDividerClass: "",

    /** @type {string} Pane divider CSS style */
    defaultPaneDividerStyle: "font-size:small;background-color:#C0C0C0;padding:0px;",

    /** @type {string} Error message for missing sheet object */
    s_rcMissingSheet: "Render Context must have a sheet object",

    /**
     * @description SocialCalc.format_text_for_display configuration
     */

    /** @type {string} Format string for text-link format */
    defaultLinkFormatString: '<span style="font-size:smaller;text-decoration:none !important;background-color:#66B;color:#FFF;">Link</span>',

    /** @type {string} Format string for page-link format */
    defaultPageLinkFormatString: '<span style="font-size:smaller;text-decoration:none !important;background-color:#66B;color:#FFF;">Page</span>',

    /**
     * @description SocialCalc.format_number_for_display configuration
     */

    /** @type {string} Default date-time format */
    defaultFormatdt: "d-mmm-yyyy h:mm:ss",

    /** @type {string} Default date format */
    defaultFormatd: "d-mmm-yyyy",

    /** @type {string} Default time format */
    defaultFormatt: "[h]:mm:ss",

    /** @type {string} How TRUE value is displayed when rendered */
    defaultDisplayTRUE: "TRUE",

    /** @type {string} How FALSE value is displayed when rendered */
    defaultDisplayFALSE: "FALSE",

    /**
     * @description SocialCalc Table Editor module (socialcalctableeditor.js)
     */

    /**
     * @description SocialCalc.TableEditor configuration
     */

    /** @type {string} URL prefix for images */
    defaultImagePrefix: "www/assets/images/sc_",

    /** @type {string} ID prefix for TableEditor elements */
    defaultTableEditorIDPrefix: "te_",

    /** @type {number} Number of rows to move cursor on PgUp/PgDn keys */
    defaultPageUpDnAmount: 15,

    /** @type {boolean} Enables Ctrl-S trapdoor for setting custom numeric formats and commands */
    AllowCtrlS: true,

    /**
     * @description SocialCalc.CreateTableEditor configuration
     */

    /** @type {number} Short size for scrollbars in pixels */
    defaultTableControlThickness: 0,

    /** @type {string} CSS class for the TableEditor griddiv element */
    cteGriddivClass: "",

    /**
     * @description SocialCalc.EditorGetStatuslineString - status line messages
     */

    /** @type {string} Status message while executing */
    s_statusline_executing: "Executing...",

    /** @type {string} Status message while displaying */
    s_statusline_displaying: "Displaying...",

    /** @type {string} Status message while ordering */
    s_statusline_ordering: "Ordering...",

    /** @type {string} Status message while calculating */
    s_statusline_calculating: "Calculating...",

    /** @type {string} Status message while calculating and loading sheet */
    s_statusline_calculatingls: "Calculating... Loading Sheet...",

    /** @type {string} Status message prefix for server function */
    s_statusline_doingserverfunc: "doing server function ",

    /** @type {string} Status message suffix for cell reference */
    s_statusline_incell: " in cell ",

    /** @type {string} Status message for calculation start */
    s_statusline_calcstart: "Calculation start...",

    /** @type {string} Status message for SUM function */
    s_statusline_sum: "SUM",

    /** @type {string} Status message for recalculation needed */
    s_statusline_recalcneeded: '<span style="color:#999;">(Recalc needed)</span>',

    /** @type {string} Status message prefix for circular reference */
    s_statusline_circref: '<span style="color:red;">Circular reference: ',

    /**
     * @description SocialCalc.InputBoxDisplayCellContents messages
     */

    /** @type {string} Message for multi-line text display */
    s_inputboxdisplaymultilinetext: "[Multi-line text: Click icon on right to edit]",

    /**
     * @description SocialCalc.InputEcho styling
     */

    /** @type {string} CSS class for popup inputEcho div */
    defaultInputEchoClass: "",

    /** @type {string} CSS style for popup inputEcho div */
    defaultInputEchoStyle: "filter:alpha(opacity=90);opacity:.9;backgroundColor:#FFD;border:1px solid #884;fontSize:small;padding:2px 10px 1px 2px;cursor:default;",

    /** @type {string} CSS class for popup inputEcho prompt div */
    defaultInputEchoPromptClass: "",

    /** @type {string} CSS style for popup inputEcho prompt div */
    defaultInputEchoPromptStyle: "filter:alpha(opacity=90);opacity:.9;backgroundColor:#FFD;borderLeft:1px solid #884;borderRight:1px solid #884;borderBottom:1px solid #884;fontSize:small;fontStyle:italic;padding:2px 10px 1px 2px;cursor:default;",

    /**
     * @description SocialCalc.InputEchoText configuration
     */

    /** @type {string} Message displayed when typing unknown function */
    ietUnknownFunction: "Unknown function ",

    /**
     * @description SocialCalc.CellHandles configuration
     */

    /** @type {number} Extent of inner circle within 90px image */
    CH_radius1: 29.0,

    /** @type {number} Extent of outer circle within 90px image */
    CH_radius2: 41.0,

    /** @type {string} Tooltip for fill all handle */
    s_CHfillAllTooltip: "Fill Contents and Formats Down/Right",

    /** @type {string} Tooltip for fill formulas handle */
    s_CHfillContentsTooltip: "Fill Contents Only Down/Right",

    /** @type {string} Tooltip for move paste all */
    s_CHmovePasteAllTooltip: "Move Contents and Formats",

    /** @type {string} Tooltip for move paste contents */
    s_CHmovePasteContentsTooltip: "Move Contents Only",

    /** @type {string} Tooltip for move insert all */
    s_CHmoveInsertAllTooltip: "Slide Contents and Formats within Row/Col",

    /** @type {string} Tooltip for move insert contents */
    s_CHmoveInsertContentsTooltip: "Slide Contents within Row/Col",

    /** @type {Object<string, string>} Short form of operation to follow drag */
    s_CHindicatorOperationLookup: {
        Fill: "Fill",
        FillC: "Fill Contents",
        Move: "Move",
        MoveI: "Slide",
        MoveC: "Move Contents",
        MoveIC: "Slide Contents",
    },

    /** @type {Object<string, string>} Direction that modifies operation during drag */
    s_CHindicatorDirectionLookup: {
        Down: " Down",
        Right: " Right",
        Horizontal: " Horizontal",
        Vertical: " Vertical",
    },

    /**
     * @description SocialCalc.TableControl configuration
     */

    /** @type {number} Length of pane slider in pixels */
    defaultTCSliderThickness: 9,

    /** @type {number} Length of scroll +/- buttons in pixels */
    defaultTCButtonThickness: 20,

    /** @type {number} Length of thumb in pixels */
    defaultTCThumbThickness: 15,

    /**
     * @description SocialCalc.CreateTableControl styling
     */

    /** @type {string} Pseudo style for main div of table control */
    TCmainStyle: "backgroundColor:#EEE;",

    /** @type {string} CSS class for main div of table control */
    TCmainClass: "",

    /** @type {string} Background color style for endcap (used while waiting for image) */
    TCendcapStyle: "backgroundColor:#FFF;",

    /** @type {string} CSS class for endcap */
    TCendcapClass: "",

    /** @type {string} Background color style for pane slider */
    TCpanesliderStyle: "backgroundColor:#CCC;",

    /** @type {string} CSS class for pane slider */
    TCpanesliderClass: "",

    /** @type {string} Tooltip for horizontal table control pane slider */
    s_panesliderTooltiph: "Drag to lock pane vertically",

    /** @type {string} Tooltip for vertical table control pane slider */
    s_panesliderTooltipv: "Drag to lock pane horizontally",

    /** @type {string} Background color style for less button */
    TClessbuttonStyle: "backgroundColor:#AAA;",

    /** @type {string} CSS class for less button */
    TClessbuttonClass: "",

    /** @type {number} Repeat wait time for less button in milliseconds */
    TClessbuttonRepeatWait: 300,

    /** @type {number} Repeat interval for less button in milliseconds */
    TClessbuttonRepeatInterval: 20,

    /** @type {string} Background color style for more button */
    TCmorebuttonStyle: "backgroundColor:#AAA;",

    /** @type {string} CSS class for more button */
    TCmorebuttonClass: "",

    /** @type {number} Repeat wait time for more button in milliseconds */
    TCmorebuttonRepeatWait: 300,

    /** @type {number} Repeat interval for more button in milliseconds */
    TCmorebuttonRepeatInterval: 20,

    /** @type {string} Background color style for scroll area */
    TCscrollareaStyle: "backgroundColor:#DDD;",

    /** @type {string} CSS class for scroll area */
    TCscrollareaClass: "",

    /** @type {number} Repeat wait time for scroll area in milliseconds */
    TCscrollareaRepeatWait: 500,

    /** @type {number} Repeat interval for scroll area in milliseconds */
    TCscrollareaRepeatInterval: 100,

    /** @type {string} CSS class for thumb */
    TCthumbClass: "",

    /** @type {string} Background color style for thumb */
    TCthumbStyle: "backgroundColor:#CCC;",

    /**
     * @description SocialCalc.TCPSDragFunctionStart configuration
     */

    /** @type {string} CSS class for pane slider tracking line display */
    TCPStrackinglineClass: "",

    /** @type {string} CSS style for pane slider tracking line display */
    TCPStrackinglineStyle: "overflow:hidden;position:absolute;zIndex:100;",

    /** @type {string} Narrow dimension of tracking line with units */
    TCPStrackinglineThickness: "2px",

    /**
     * @description SocialCalc.TCTDragFunctionStart configuration
     */

    /** @type {string} CSS class for vertical thumb dragging status display */
    TCTDFSthumbstatusvClass: "",

    /** @type {string} CSS style for vertical thumb dragging status display */
    TCTDFSthumbstatusvStyle: "height:20px;width:auto;border:3px solid #808080;overflow:hidden;backgroundColor:#FFF;fontSize:small;position:absolute;zIndex:100;",

    /** @type {string} CSS class for horizontal thumb dragging status display */
    TCTDFSthumbstatushClass: "",

    /** @type {string} CSS style for horizontal thumb dragging status display */
    TCTDFSthumbstatushStyle: "height:20px;width:auto;border:1px solid black;padding:2px;backgroundColor:#FFF;fontSize:small;position:absolute;zIndex:100;",

    /** @type {string} CSS class for thumb dragging status row number display */
    TCTDFSthumbstatusrownumClass: "",

    /** @type {string} CSS style for thumb dragging status row number display */
    TCTDFSthumbstatusrownumStyle: "color:#FFF;background-color:#808080;font-size:small;white-space:nowrap;padding:3px;",

    /** @type {number} Top offset for vertical thumbstatus display while dragging */
    TCTDFStopOffsetv: 0,

    /** @type {number} Left offset for vertical thumbstatus display while dragging */
    TCTDFSleftOffsetv: -80,

    /** @type {string} Text prefix before row number in vertical thumb status */
    s_TCTDFthumbstatusPrefixv: "Row ",

    /** @type {number} Top offset for horizontal thumbstatus display while dragging */
    TCTDFStopOffseth: -30,

    /** @type {number} Left offset for horizontal thumbstatus display while dragging */
    TCTDFSleftOffseth: 0,

    /** @type {string} Text prefix before column number in horizontal thumb status */
    s_TCTDFthumbstatusPrefixh: "Col ",

    /**
     * @description SocialCalc.TooltipInfo configuration
     * 
     * Note: These two values are used to set the TooltipInfo initial values when the code is first read in.
     * Modifying them here after loading has no effect -- you need to modify SocialCalc.TooltipInfo directly
     * to dynamically set them. This is different than most other constants which may be modified until use.
     */

    /** @type {number} Offset in pixels from mouse position (right on left side, left on right side) */
    TooltipOffsetX: 2,

    /** @type {number} Offset in pixels above mouse position for lower edge */
    TooltipOffsetY: 10,

    /**
     * @description SocialCalc.TooltipDisplay styling
     */

    /** @type {string} CSS class for tooltip display */
    TDpopupElementClass: "",

    /** @type {string} CSS style for tooltip display */
    TDpopupElementStyle: "border:1px solid black;padding:1px 2px 2px 2px;textAlign:center;backgroundColor:#FFF;fontSize:7pt;fontFamily:Verdana,Arial,Helvetica,sans-serif;position:absolute;width:auto;zIndex:110;",

    /**
     * @description SocialCalc Spreadsheet Control module (socialcalcspreadsheetcontrol.js)
     */

    /**
     * @description SocialCalc.SpreadsheetControl styling
     */

    /** @type {string} Toolbar background color style */
    SCToolbarbackground: "background-color:#404040;",

    /** @type {string} Tab background color style */
    SCTabbackground: "background-color:#CCC;",

    /** @type {string} Selected tab CSS style */
    SCTabselectedCSS: "font-size:small;padding:6px 30px 6px 8px;color:#FFF;background-color:#404040;cursor:default;border-right:1px solid #CCC;",

    /** @type {string} Plain tab CSS style */
    SCTabplainCSS: "font-size:small;padding:6px 30px 6px 8px;color:#FFF;background-color:#808080;cursor:default;border-right:1px solid #CCC;",

    /** @type {string} Toolbar text CSS style */
    SCToolbartext: "font-size:x-small;font-weight:bold;color:#FFF;padding-bottom:4px;",

    /** @type {number} Formula bar height in pixels */
    SCFormulabarheight: 0,

    /** @type {number} Status line height in pixels */
    SCStatuslineheight: 20,

    /** @type {string} Status line CSS style */
    SCStatuslineCSS: "font-size:10px;padding:3px 0px;",

    /**
     * @description Workbook configuration
     */

    /** @type {boolean} Enable workbook functionality */
    doWorkBook: true,

    /** @type {number} Sheet bar height in pixels */
    SCSheetBarHeight: 25,

    /** @type {string} Sheet bar background color style */
    SCSheetBarBackground: "background-color:#CCC;",

    /** @type {string} Sheet bar CSS style */
    SCSheetBarCSS: "background-color:#CCC;",

    /** @type {string} Sheet bar width */
    SCSheetBarWidth: "70%",

    /**
     * @description UI control flags
     */

    /** @type {boolean} Disable cell handles */
    SCCellHandlesDisable: true,

    /** @type {boolean} Disable input echo */
    SCNoInputEcho: true,

    /** @type {string} Message for non-editable input box */
    s_inputboxdisplaynoteditable: "[not editable]",

    /** @type {boolean} Hide row names */
    SCNoRowName: true,

    /** @type {boolean} Disable ranging */
    SCNoRanging: true,

    /** @type {boolean} Don't quote in input box */
    SCNoQuoteInInputBox: true,
    /**
     * @description Constants for default Format tab (settings)
     * 
     * IMPORTANT FOR LOCALIZATION:
     * These should be carefully checked for localization. Make sure you understand what they do and how they work!
     * The first part of "first:second|first:second|..." is what is displayed and the second is the value to be used.
     * The value is normally not translated -- only the displayed part. The [cancel], [break], etc., are not translated --
     * they are commands to SocialCalc.SettingsControls.PopupListInitialize
     */

    /** @type {string} Number format options for settings dialog */
    SCFormatNumberFormats: [
        "[cancel]:|[break]:|%loc!Default!:|[custom]:|%loc!Automatic!:general|%loc!Auto w/ commas!:[,]General|[break]:|",
        "00:00|000:000|0000:0000|00000:00000|[break]:|%loc!Formula!:formula|%loc!Hidden!:hidden|[newcol]:",
        "1234:0|1,234:#,##0|1,234.5:#,##0.0|1,234.56:#,##0.00|1,234.567:#,##0.000|1,234.5678:#,##0.0000|",
        "[break]:|1,234%:#,##0%|1,234.5%:#,##0.0%|1,234.56%:#,##0.00%|",
        "[newcol]:|$1,234:$#,##0|$1,234.5:$#,##0.0|$1,234.56:$#,##0.00|[break]:|",
        "(1,234):#,##0_);(#,##0)|(1,234.5):#,##0.0_);(#,##0.0)|(1,234.56):#,##0.00_);(#,##0.00)|[break]:|",
        "($1,234):#,##0_);($#,##0)|($1,234.5):$#,##0.0_);($#,##0.0)|($1,234.56):$#,##0.00_);($#,##0.00)|",
        "[newcol]:|1/4/06:m/d/yy|01/04/2006:mm/dd/yyyy|2006-01-04:yyyy-mm-dd|4-Jan-06:d-mmm-yy|04-Jan-2006:dd-mmm-yyyy|January 4, 2006:mmmm d, yyyy|",
        "[break]:|1\\c23:h:mm|1\\c23 PM:h:mm AM/PM|1\\c23\\c45:h:mm:ss|01\\c23\\c45:hh:mm:ss|26\\c23 (h\\cm):[hh]:mm|69\\c45 (m\\cs):[mm]:ss|69 (s):[ss]|",
        "[newcol]:|2006-01-04 01\\c23\\c45:yyyy-mm-dd hh:mm:ss|January 4, 2006:mmmm d, yyyy hh:mm:ss|Wed:ddd|Wednesday:dddd|"
    ].join(""),

    /** @type {string} Text format options for settings dialog */
    SCFormatTextFormats: "[cancel]:|[break]:|%loc!Default!:|[custom]:|%loc!Automatic!:general|%loc!Plain Text!:text-plain|HTML:text-html|%loc!Wikitext!:text-wiki|%loc!Link!:text-link|%loc!Formula!:formula|%loc!Hidden!:hidden|",

    /** @type {string} Padding size options for settings dialog */
    SCFormatPadsizes: [
        "[cancel]:|[break]:|%loc!Default!:|[custom]:|%loc!No padding!:0px|",
        "[newcol]:|1 pixel:1px|2 pixels:2px|3 pixels:3px|4 pixels:4px|5 pixels:5px|",
        "6 pixels:6px|7 pixels:7px|8 pixels:8px|[newcol]:|9 pixels:9px|10 pixels:10px|11 pixels:11px|",
        "12 pixels:12px|13 pixels:13px|14 pixels:14px|16 pixels:16px|",
        "18 pixels:18px|[newcol]:|20 pixels:20px|22 pixels:22px|24 pixels:24px|28 pixels:28px|36 pixels:36px|"
    ].join(""),

    /** @type {string} Font size options for settings dialog */
    SCFormatFontsizes: [
        "[cancel]:|[break]:|%loc!Default!:|[custom]:|X-Small:x-small|Small:small|Medium:medium|Large:large|X-Large:x-large|",
        "[newcol]:|6pt:6pt|7pt:7pt|8pt:8pt|9pt:9pt|10pt:10pt|11pt:11pt|12pt:12pt|14pt:14pt|16pt:16pt|",
        "[newcol]:|18pt:18pt|20pt:20pt|22pt:22pt|24pt:24pt|28pt:28pt|36pt:36pt|48pt:48pt|72pt:72pt|",
        "[newcol]:|8 pixels:8px|9 pixels:9px|10 pixels:10px|11 pixels:11px|",
        "12 pixels:12px|13 pixels:13px|14 pixels:14px|[newcol]:|16 pixels:16px|",
        "18 pixels:18px|20 pixels:20px|22 pixels:22px|24 pixels:24px|28 pixels:28px|36 pixels:36px|"
    ].join(""),

    /** @type {string} Font family options for settings dialog */
    SCFormatFontfamilies: "[cancel]:|[break]:|%loc!Default!:|[custom]:|Verdana:Verdana,Arial,Helvetica,sans-serif|Arial:arial,helvetica,sans-serif|Courier:'Courier New',Courier,monospace|",

    /** @type {string} Font look options for settings dialog */
    SCFormatFontlook: "[cancel]:|[break]:|%loc!Default!:|%loc!Normal!:normal normal|%loc!Bold!:normal bold|%loc!Italic!:italic normal|%loc!Bold Italic!:italic bold",

    /** @type {string} Text horizontal alignment options for settings dialog */
    SCFormatTextAlignhoriz: "[cancel]:|[break]:|%loc!Default!:|%loc!Left!:left|%loc!Center!:center|%loc!Right!:right|",

    /** @type {string} Number horizontal alignment options for settings dialog */
    SCFormatNumberAlignhoriz: "[cancel]:|[break]:|%loc!Default!:|%loc!Left!:left|%loc!Center!:center|%loc!Right!:right|",

    /** @type {string} Vertical alignment options for settings dialog */
    SCFormatAlignVertical: "[cancel]:|[break]:|%loc!Default!:|%loc!Top!:top|%loc!Middle!:middle|%loc!Bottom!:bottom|",

    /** @type {string} Column width options for settings dialog */
    SCFormatColwidth: "[cancel]:|[break]:|%loc!Default!:|[custom]:|[newcol]:|20 pixels:20|40:40|60:60|80:80|100:100|120:120|140:140|160:160|[newcol]:|180 pixels:180|200:200|220:220|240:240|260:260|280:280|300:300|",

    /** @type {string} Recalculation options for settings dialog */
    SCFormatRecalc: "[cancel]:|[break]:|%loc!Auto!:|%loc!Manual!:off|",

    /**
     * @description SocialCalc.InitializeSpreadsheetControl button styling
     */

    /** @type {string} Normal button border color */
    ISCButtonBorderNormal: "#404040",

    /** @type {string} Hover button border color */
    ISCButtonBorderHover: "#999",

    /** @type {string} Down button border color */
    ISCButtonBorderDown: "#FFF",

    /** @type {string} Down button background color */
    ISCButtonDownBackground: "#888",

    /**
     * @description SocialCalc.SettingsControls.PopupListInitialize constants
     */

    /** @type {string} Cancel option text for popup lists */
    s_PopupListCancel: "[Cancel]",

    /** @type {string} Custom option text for popup lists */
    s_PopupListCustom: "Custom",

    /**
     * @description Localization constants
     * 
     * s_loc_ constants accessed by SocialCalc.LocalizeString and SocialCalc.LocalizeSubstrings
     * Used extensively by socialcalcspreadsheetcontrol.js
     */

    /** @type {string} Align center text */
    s_loc_align_center: "Align Center",

    /** @type {string} Align left text */
    s_loc_align_left: "Align Left",

    /** @type {string} Align right text */
    s_loc_align_right: "Align Right",

    /** @type {string} Alignment text */
    s_loc_alignment: "Alignment",

    /** @type {string} Audit text */
    s_loc_audit: "Audit",

    /** @type {string} Audit trail session text */
    s_loc_audit_trail_this_session: "Audit Trail This Session",

    /** @type {string} Auto text */
    s_loc_auto: "Auto",

    /** @type {string} Auto sum text */
    s_loc_auto_sum: "Auto Sum",

    /** @type {string} Auto with commas text */
    s_loc_auto_wX_commas: "Auto w/ commas",

    /** @type {string} Automatic text */
    s_loc_automatic: "Automatic",

    /** @type {string} Background text */
    s_loc_background: "Background",

    /** @type {string} Bold text */
    s_loc_bold: "Bold",

    /** @type {string} Bold and italics text */
    s_loc_bold_XampX_italics: "Bold &amp; Italics",

    /** @type {string} Bold italic text */
    s_loc_bold_italic: "Bold Italic",

    /** @type {string} Borders text */
    s_loc_borders: "Borders",

    /** @type {string} Borders off text */
    s_loc_borders_off: "Borders Off",

    /** @type {string} Borders on text */
    s_loc_borders_on: "Borders On",

    /** @type {string} Bottom text */
    s_loc_bottom: "Bottom",

    /** @type {string} Bottom border text */
    s_loc_bottom_border: "Bottom Border",

    /** @type {string} Cell settings text */
    s_loc_cell_settings: "CELL SETTINGS",

    /** @type {string} CSV format text */
    s_loc_csv_format: "CSV format",

    /** @type {string} Cancel text */
    s_loc_cancel: "Cancel",

    /** @type {string} Category text */
    s_loc_category: "Category",

    /** @type {string} Center text */
    s_loc_center: "Center",

    /** @type {string} Clear text */
    s_loc_clear: "Clear",

    /** @type {string} Clear SocialCalc clipboard text */
    s_loc_clear_socialcalc_clipboard: "Clear SocialCalc Clipboard",

    /** @type {string} Clipboard text */
    s_loc_clipboard: "Clipboard",

    /** @type {string} Color text */
    s_loc_color: "Color",

    /** @type {string} Column prefix text */
    s_loc_column_: "Column ",

    /** @type {string} Comment text */
    s_loc_comment: "Comment",

    /** @type {string} Copy text */
    s_loc_copy: "Copy",

    /** @type {string} Custom text */
    s_loc_custom: "Custom",

    /** @type {string} Cut text */
    s_loc_cut: "Cut",

    /** @type {string} Default text */
    s_loc_default: "Default",

    /** @type {string} Default alignment text */
    s_loc_default_alignment: "Default Alignment",

    /** @type {string} Default column width text */
    s_loc_default_column_width: "Default Column Width",

    /** @type {string} Default font text */
    s_loc_default_font: "Default Font",

    /** @type {string} Default format text */
    s_loc_default_format: "Default Format",

    /** @type {string} Default padding text */
    s_loc_default_padding: "Default Padding",

    /** @type {string} Delete text */
    s_loc_delete: "Delete",

    /** @type {string} Delete column text */
    s_loc_delete_column: "Delete Column",

    /** @type {string} Delete contents text */
    s_loc_delete_contents: "Delete Contents",

    /** @type {string} Delete row text */
    s_loc_delete_row: "Delete Row",

    /** @type {string} Description text */
    s_loc_description: "Description",

    /** @type {string} Display clipboard in text */
    s_loc_display_clipboard_in: "Display Clipboard in",

    /** @type {string} Down text */
    s_loc_down: "Down",

    /** @type {string} Edit text */
    s_loc_edit: "Edit",

    /** @type {string} Existing names text */
    s_loc_existing_names: "Existing Names",

    /** @type {string} Family text */
    s_loc_family: "Family",

    /** @type {string} Fill down text */
    s_loc_fill_down: "Fill Down",

    /** @type {string} Fill right text */
    s_loc_fill_right: "Fill Right",

    /** @type {string} Font text */
    s_loc_font: "Font",

    /** @type {string} Format text */
    s_loc_format: "Format",

    /** @type {string} Formula text */
    s_loc_formula: "Formula",

    /** @type {string} Function list text */
    s_loc_function_list: "Function List",

    /** @type {string} Functions text */
    s_loc_functions: "Functions",

    /** @type {string} Grid text */
    s_loc_grid: "Grid",

    /** @type {string} Hidden text */
    s_loc_hidden: "Hidden",

    /** @type {string} Horizontal text */
    s_loc_horizontal: "Horizontal",

    /** @type {string} Insert column text */
    s_loc_insert_column: "Insert Column",

    /** @type {string} Insert row text */
    s_loc_insert_row: "Insert Row",

    /** @type {string} Italic text */
    s_loc_italic: "Italic",

    /** @type {string} Last sort text */
    s_loc_last_sort: "Last Sort",

    /** @type {string} Left text */
    s_loc_left: "Left",

    /** @type {string} Left border text */
    s_loc_left_border: "Left Border",

    /** @type {string} Link text */
    s_loc_link: "Link",

    /** @type {string} Link input box text */
    s_loc_link_input_box: "Link Input Box",

    /** @type {string} List text */
    s_loc_list: "List",

    /** @type {string} Load SocialCalc clipboard text */
    s_loc_load_socialcalc_clipboard_with_this: "Load SocialCalc Clipboard With This",

    /** @type {string} Major sort text */
    s_loc_major_sort: "Major Sort",

    /** @type {string} Manual text */
    s_loc_manual: "Manual",

    /** @type {string} Merge cells text */
    s_loc_merge_cells: "Merge Cells",

    /** @type {string} Middle text */
    s_loc_middle: "Middle",

    /** @type {string} Minor sort text */
    s_loc_minor_sort: "Minor Sort",

    /** @type {string} Move insert text */
    s_loc_move_insert: "Move Insert",

    /** @type {string} Move paste text */
    s_loc_move_paste: "Move Paste",

    /** @type {string} Multi-line input box text */
    s_loc_multiXline_input_box: "Multi-line Input Box",

    /** @type {string} Name text */
    s_loc_name: "Name",

    /** @type {string} Names text */
    s_loc_names: "Names",

    /** @type {string} No padding text */
    s_loc_no_padding: "No padding",

    /** @type {string} Normal text */
    s_loc_normal: "Normal",

    /** @type {string} Number text */
    s_loc_number: "Number",

    /** @type {string} Number horizontal text */
    s_loc_number_horizontal: "Number Horizontal",

    /** @type {string} OK text */
    s_loc_ok: "OK",

    /** @type {string} Padding text */
    s_loc_padding: "Padding",

    /** @type {string} Page name text */
    s_loc_page_name: "Page Name",

    /** @type {string} Paste text */
    s_loc_paste: "Paste",

    /** @type {string} Paste formats text */
    s_loc_paste_formats: "Paste Formats",

    /** @type {string} Plain text text */
    s_loc_plain_text: "Plain Text",

    /** @type {string} Recalc text */
    s_loc_recalc: "Recalc",

    /** @type {string} Recalculation text */
    s_loc_recalculation: "Recalculation",
    /** @type {string} Redo text */
    s_loc_redo: "Redo",

    /** @type {string} Right text */
    s_loc_right: "Right",

    /** @type {string} Right border text */
    s_loc_right_border: "Right Border",

    /** @type {string} Sheet settings text */
    s_loc_sheet_settings: "SHEET SETTINGS",

    /** @type {string} Save text */
    s_loc_save: "Save",

    /** @type {string} Save to text */
    s_loc_save_to: "Save to",

    /** @type {string} Set cell contents text */
    s_loc_set_cell_contents: "Set Cell Contents",

    /** @type {string} Set cells to sort text */
    s_loc_set_cells_to_sort: "Set Cells To Sort",

    /** @type {string} Set value to text */
    s_loc_set_value_to: "Set Value To",

    /** @type {string} Set to link format text */
    s_loc_set_to_link_format: "Set to Link format",

    /** @type {string} Set/clear move from text */
    s_loc_setXclear_move_from: "Set/Clear Move From",

    /** @type {string} Show cell settings text */
    s_loc_show_cell_settings: "Show Cell Settings",

    /** @type {string} Show sheet settings text */
    s_loc_show_sheet_settings: "Show Sheet Settings",

    /** @type {string} Show in new browser window text */
    s_loc_show_in_new_browser_window: "Show in new browser window",

    /** @type {string} Size text */
    s_loc_size: "Size",

    /** @type {string} SocialCalc save format text */
    s_loc_socialcalcXsave_format: "SocialCalc-save format",

    /** @type {string} Sort text */
    s_loc_sort: "Sort",

    /** @type {string} Sort prefix text */
    s_loc_sort_: "Sort ",

    /** @type {string} Sort cells text */
    s_loc_sort_cells: "Sort Cells",

    /** @type {string} Swap colors text */
    s_loc_swap_colors: "Swap Colors",

    /** @type {string} Tab-delimited format text */
    s_loc_tabXdelimited_format: "Tab-delimited format",

    /** @type {string} Text text */
    s_loc_text: "Text",

    /** @type {string} Text horizontal text */
    s_loc_text_horizontal: "Text Horizontal",

    /** @type {string} Sample HTML text */
    s_loc_this_is_aXbrXsample: "This is a<br>sample",

    /** @type {string} Top text */
    s_loc_top: "Top",

    /** @type {string} Top border text */
    s_loc_top_border: "Top Border",

    /** @type {string} Undone steps text */
    s_loc_undone_steps: "UNDONE STEPS",

    /** @type {string} URL text */
    s_loc_url: "URL",

    /** @type {string} Undo text */
    s_loc_undo: "Undo",

    /** @type {string} Unmerge cells text */
    s_loc_unmerge_cells: "Unmerge Cells",

    /** @type {string} Up text */
    s_loc_up: "Up",

    /** @type {string} Value text */
    s_loc_value: "Value",

    /** @type {string} Vertical text */
    s_loc_vertical: "Vertical",

    /** @type {string} Wikitext text */
    s_loc_wikitext: "Wikitext",

    /** @type {string} Workspace text */
    s_loc_workspace: "Workspace",

    /** @type {string} New text */
    s_loc_XnewX: "[New]",

    /** @type {string} None text */
    s_loc_XnoneX: "[None]",

    /** @type {string} Select range text */
    s_loc_Xselect_rangeX: "[select range]",

    /**
     * @description SocialCalc Spreadsheet Viewer module (socialcalcviewer.js)
     */

    /**
     * @description SocialCalc.SpreadsheetViewer configuration
     */

    /** @type {number} Status line height in pixels */
    SVStatuslineheight: 20,

    /** @type {string} Status line CSS style */
    SVStatuslineCSS: "font-size:10px;padding:3px 0px;",

    /**
     * @description SocialCalc Format Number module (formatnumber2.js)
     */

    /** @type {string} Thousands separator character for number formatting */
    FormatNumber_separatorchar: ",",

    /** @type {string} Decimal separator character for number formatting */
    FormatNumber_decimalchar: ".",

    /** @type {string} Default currency string */
    FormatNumber_defaultCurrency: "$",

    /**
     * @description Day and month names for date formatting
     */

    /** @type {string[]} Full day names */
    s_FormatNumber_daynames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],

    /** @type {string[]} Short (3 character) day names */
    s_FormatNumber_daynames3: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    /** @type {string[]} Full month names */
    s_FormatNumber_monthnames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],

    /** @type {string[]} Short (3 character) month names */
    s_FormatNumber_monthnames3: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ],

    /** @type {string} AM string for time formatting */
    s_FormatNumber_am: "AM",

    /** @type {string} Single character AM string */
    s_FormatNumber_am1: "A",

    /** @type {string} PM string for time formatting */
    s_FormatNumber_pm: "PM",

    /** @type {string} Single character PM string */
    s_FormatNumber_pm1: "P",

    /**
     * @description SocialCalc Spreadsheet Formula module (formula1.js)
     */

    /**
     * @description Formula parsing error messages
     */

    /** @type {string} Improperly formed number exponent error */
    s_parseerrexponent: "Improperly formed number exponent",

    /** @type {string} Unexpected character in formula error */
    s_parseerrchar: "Unexpected character in formula",

    /** @type {string} Improperly formed string error */
    s_parseerrstring: "Improperly formed string",

    /** @type {string} Improperly formed special value error */
    s_parseerrspecialvalue: "Improperly formed special value",

    /** @type {string} Two operators in a row error */
    s_parseerrtwoops: "Error in formula (two operators inappropriately in a row)",

    /** @type {string} Missing open parenthesis error */
    s_parseerrmissingopenparen: "Missing open parenthesis in list with comma(s). ",

    /** @type {string} Closing parenthesis without open error */
    s_parseerrcloseparennoopen: "Closing parenthesis without open parenthesis. ",

    /** @type {string} Missing close parenthesis error */
    s_parseerrmissingcloseparen: "Missing close parenthesis. ",

    /** @type {string} Missing operand error */
    s_parseerrmissingoperand: "Missing operand. ",

    /** @type {string} General error in formula */
    s_parseerrerrorinformula: "Error in formula.",

    /** @type {string} Error value in formula */
    s_calcerrerrorvalueinformula: "Error value in formula",

    /** @type {string} Error resulting in bad value */
    s_parseerrerrorinformulabadval: "Error in formula resulting in bad value",

    /** @type {string} Formula results in range value */
    s_formularangeresult: "Formula results in range value:",

    /** @type {string} Formula results in bad numeric value */
    s_calcerrnumericnan: "Formula results in an bad numeric value",

    /** @type {string} Numeric overflow error */
    s_calcerrnumericoverflow: "Numeric overflow",

    /** @type {string} Sheet unavailable error prefix */
    s_sheetunavailable: "Sheet unavailable:",

    /** @type {string} Cell reference missing error */
    s_calcerrcellrefmissing: "Cell reference missing when expected.",

    /** @type {string} Sheet name missing error */
    s_calcerrsheetnamemissing: "Sheet name missing when expected.",

    /** @type {string} Circular name reference error */
    s_circularnameref: "Circular name reference to name",

    /** @type {string} Unknown name error */
    s_calcerrunknownname: "Unknown name",

    /** @type {string} Incorrect function arguments error */
    s_calcerrincorrectargstofunction: "Incorrect arguments to function",

    /** @type {string} Unknown function error */
    s_sheetfuncunknownfunction: "Unknown function",

    /** @type {string} LN function argument error */
    s_sheetfunclnarg: "LN argument must be greater than 0",

    /** @type {string} LOG10 function argument error */
    s_sheetfunclog10arg: "LOG10 argument must be greater than 0",

    /** @type {string} LOG function second argument error */
    s_sheetfunclogsecondarg: "LOG second argument must be numeric greater than 0",

    /** @type {string} LOG function first argument error */
    s_sheetfunclogfirstarg: "LOG first argument must be greater than 0",

    /** @type {string} ROUND function second argument error */
    s_sheetfuncroundsecondarg: "ROUND second argument must be numeric",

    /** @type {string} DDB function life argument error */
    s_sheetfuncddblife: "DDB life must be greater than 1",

    /** @type {string} SLN function life argument error */
    s_sheetfuncslnlife: "SLN life must be greater than 1",

    /**
     * @description Function definition text for help system
     */

    /** @type {string} ABS function definition */
    s_fdef_ABS: "Absolute value function. ",

    /** @type {string} ACOS function definition */
    s_fdef_ACOS: "Trigonometric arccosine function. ",

    /** @type {string} AND function definition */
    s_fdef_AND: "True if all arguments are true. ",

    /** @type {string} ASIN function definition */
    s_fdef_ASIN: "Trigonometric arcsine function. ",

    /** @type {string} ATAN function definition */
    s_fdef_ATAN: "Trigonometric arctan function. ",

    /** @type {string} ATAN2 function definition */
    s_fdef_ATAN2: "Trigonometric arc tangent function (result is in radians). ",

    /** @type {string} AVERAGE function definition */
    s_fdef_AVERAGE: "Averages the values. ",

    /** @type {string} CHOOSE function definition */
    s_fdef_CHOOSE: "Returns the value specified by the index. The values may be ranges of cells. ",

    /** @type {string} COLUMNS function definition */
    s_fdef_COLUMNS: "Returns the number of columns in the range. ",

    /** @type {string} COS function definition */
    s_fdef_COS: "Trigonometric cosine function (value is in radians). ",

    /** @type {string} COUNT function definition */
    s_fdef_COUNT: "Counts the number of numeric values, not blank, text, or error. ",

    /** @type {string} COUNTA function definition */
    s_fdef_COUNTA: "Counts the number of non-blank values. ",

    /** @type {string} COUNTBLANK function definition */
    s_fdef_COUNTBLANK: 'Counts the number of blank values. (Note: "" is not blank.) ',

    /** @type {string} COUNTIF function definition */
    s_fdef_COUNTIF: 'Counts the number of number of cells in the range that meet the criteria. The criteria may be a value ("x", 15, 1+3) or a test (>25). ',

    /** @type {string} DATE function definition */
    s_fdef_DATE: 'Returns the appropriate date value given numbers for year, month, and day. For example: DATE(2006,2,1) for February 1, 2006. Note: In this program, day "1" is December 31, 1899 and the year 1900 is not a leap year. Some programs use January 1, 1900, as day "1" and treat 1900 as a leap year. In both cases, though, dates on or after March 1, 1900, are the same. ',

    /** @type {string} DAVERAGE function definition */
    s_fdef_DAVERAGE: "Averages the values in the specified field in records that meet the criteria. ",

    /** @type {string} DAY function definition */
    s_fdef_DAY: "Returns the day of month for a date value. ",

    /** @type {string} DCOUNT function definition */
    s_fdef_DCOUNT: "Counts the number of numeric values, not blank, text, or error, in the specified field in records that meet the criteria. ",

    /** @type {string} DCOUNTA function definition */
    s_fdef_DCOUNTA: "Counts the number of non-blank values in the specified field in records that meet the criteria. ",

    /** @type {string} DDB function definition */
    s_fdef_DDB: "Returns the amount of depreciation at the given period of time (the default factor is 2 for double-declining balance).   ",
    s_fdef_DEGREES: "Converts value in radians into degrees. ",
    s_fdef_DGET:
        "Returns the value of the specified field in the single record that meets the criteria. ",
    s_fdef_DMAX:
        "Returns the maximum of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DMIN:
        "Returns the maximum of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DPRODUCT:
        "Returns the result of multiplying the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DSTDEV:
        "Returns the sample standard deviation of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DSTDEVP:
        "Returns the standard deviation of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DSUM:
        "Returns the sum of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DVAR:
        "Returns the sample variance of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_DVARP:
        "Returns the variance of the numeric values in the specified field in records that meet the criteria. ",
    s_fdef_EVEN:
        "Rounds the value up in magnitude to the nearest even integer. ",
    s_fdef_EXACT:
        'Returns "true" if the values are exactly the same, including case, type, etc. ',
    s_fdef_EXP: "Returns e raised to the value power. ",
    s_fdef_FACT: "Returns factorial of the value. ",
    s_fdef_FALSE: 'Returns the logical value "false". ',
    s_fdef_FIND:
        'Returns the starting position within string2 of the first occurrence of string1 at or after "start". If start is omitted, 1 is assumed. ',
    s_fdef_FV:
        "Returns the future value of repeated payments of money invested at the given rate for the specified number of periods, with optional present value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    s_fdef_HLOOKUP:
        "Look for the matching value for the given value in the range and return the corresponding value in the cell specified by the row offset. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match<=value) instead of exact match. ",
    s_fdef_HOUR: "Returns the hour portion of a time or date/time value. ",
    s_fdef_IF:
        "Results in true-value if logical-expression is TRUE or non-zero, otherwise results in false-value. ",
    s_fdef_INDEX:
        "Returns a cell or range reference for the specified row and column in the range. If range is 1-dimensional, then only one of rownum or colnum are needed. If range is 2-dimensional and rownum or colnum are zero, a reference to the range of just the specified column or row is returned. You can use the returned reference value in a range, e.g., sum(A1:INDEX(A2:A10,4)). ",
    s_fdef_INT:
        "Returns the value rounded down to the nearest integer (towards -infinity). ",
    s_fdef_IRR:
        "Returns the interest rate at which the cash flows in the range have a net present value of zero. Uses an iterative process that will return #NUM! error if it does not converge. There may be more than one possible solution. Providing the optional guess value may help in certain situations where it does not converge or finds an inappropriate solution (the default guess is 10%). ",
    s_fdef_ISBLANK:
        'Returns "true" if the value is a reference to a blank cell. ',
    s_fdef_ISERR:
        'Returns "true" if the value is of type "Error" but not "NA". ',
    s_fdef_ISERROR: 'Returns "true" if the value is of type "Error". ',
    s_fdef_ISLOGICAL:
        'Returns "true" if the value is of type "Logical" (true/false). ',
    s_fdef_ISNA: 'Returns "true" if the value is the error type "NA". ',
    s_fdef_ISNONTEXT: 'Returns "true" if the value is not of type "Text". ',
    s_fdef_ISNUMBER:
        'Returns "true" if the value is of type "Number" (including logical values). ',
    s_fdef_ISTEXT: 'Returns "true" if the value is of type "Text". ',
    s_fdef_LEFT:
        "Returns the specified number of characters from the text value. If count is omitted, 1 is assumed. ",
    s_fdef_LEN: "Returns the number of characters in the text value. ",
    s_fdef_LN: "Returns the natural logarithm of the value. ",
    s_fdef_LOG: "Returns the logarithm of the value using the specified base. ",
    s_fdef_LOG10: "Returns the base 10 logarithm of the value. ",
    s_fdef_LOWER:
        "Returns the text value with all uppercase characters converted to lowercase. ",
    s_fdef_MATCH:
        "Look for the matching value for the given value in the range and return position (the first is 1) in that range. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match<=value) instead of exact match. If rangelookup is -1, act like 1 but the bracket is match>=value. ",
    s_fdef_MAX: "Returns the maximum of the numeric values. ",
    s_fdef_MID:
        "Returns the specified number of characters from the text value starting from the specified position. ",
    s_fdef_MIN: "Returns the minimum of the numeric values. ",
    s_fdef_MINUTE: "Returns the minute portion of a time or date/time value. ",
    s_fdef_MOD:
        "Returns the remainder of the first value divided by the second. ",
    s_fdef_MONTH: "Returns the month part of a date value. ",
    s_fdef_N: "Returns the value if it is a numeric value otherwise an error. ",
    s_fdef_NA:
        "Returns the #N/A error value which propagates through most operations. ",
    s_fdef_NOT: "Returns FALSE if value is true, and TRUE if it is false. ",
    s_fdef_NOW: "Returns the current date/time. ",
    s_fdef_NPER:
        "Returns the number of periods at which payments invested each period at the given rate with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period) has the given present value. ",
    s_fdef_NPV:
        "Returns the net present value of cash flows (which may be individual values and/or ranges) at the given rate. The flows are positive if income, negative if paid out, and are assumed at the end of each period. ",
    s_fdef_ODD: "Rounds the value up in magnitude to the nearest odd integer. ",
    s_fdef_OR: "True if any argument is true ",
    s_fdef_PI: "The value 3.1415926... ",
    s_fdef_PMT:
        "Returns the amount of each payment that must be invested at the given rate for the specified number of periods to have the specified present value, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    s_fdef_POWER: "Returns the first value raised to the second value power. ",
    s_fdef_PRODUCT: "Returns the result of multiplying the numeric values. ",
    s_fdef_PROPER:
        "Returns the text value with the first letter of each word converted to uppercase and the others to lowercase. ",
    s_fdef_PV:
        "Returns the present value of the given number of payments each invested at the given rate, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    s_fdef_RADIANS: "Converts value in degrees into radians. ",
    s_fdef_RATE:
        "Returns the rate at which the given number of payments each invested at the given rate has the specified present value, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). Uses an iterative process that will return #NUM! error if it does not converge. There may be more than one possible solution. Providing the optional guess value may help in certain situations where it does not converge or finds an inappropriate solution (the default guess is 10%). ",
    s_fdef_REPLACE:
        "Returns text1 with the specified number of characters starting from the specified position replaced by text2. ",
    s_fdef_REPT: "Returns the text repeated the specified number of times. ",
    s_fdef_RIGHT:
        "Returns the specified number of characters from the text value starting from the end. If count is omitted, 1 is assumed. ",
    s_fdef_ROUND:
        "Rounds the value to the specified number of decimal places. If precision is negative, then round to powers of 10. The default precision is 0 (round to integer). ",
    s_fdef_ROWS: "Returns the number of rows in the range. ",
    s_fdef_SECOND:
        "Returns the second portion of a time or date/time value (truncated to an integer). ",
    s_fdef_SIN: "Trigonometric sine function (value is in radians) ",
    s_fdef_SLN:
        "Returns the amount of depreciation at each period of time using the straight-line method. ",
    s_fdef_SQRT: "Square root of the value ",
    s_fdef_STDEV:
        "Returns the sample standard deviation of the numeric values. ",
    s_fdef_STDEVP: "Returns the standard deviation of the numeric values. ",
    s_fdef_SUBSTITUTE:
        'Returns text1 with the all occurrences of oldtext replaced by newtext. If "occurrence" is present, then only that occurrence is replaced. ',
    s_fdef_SUM:
        "Adds the numeric values. The values to the sum function may be ranges in the form similar to A1:B5. ",
    s_fdef_SUMIF:
        'Sums the numeric values of cells in the range that meet the criteria. The criteria may be a value ("x", 15, 1+3) or a test (>25). If range2 is present, then range1 is tested and the corresponding range2 value is summed. ',
    s_fdef_SYD: "Depreciation by Sum of Year's Digits method. ",
    s_fdef_T: "Returns the text value or else a null string. ",
    s_fdef_TAN: "Trigonometric tangent function (value is in radians) ",
    s_fdef_TIME:
        "Returns the time value given the specified hour, minute, and second. ",
    s_fdef_TODAY:
        'Returns the current date (an integer). Note: In this program, day "1" is December 31, 1899 and the year 1900 is not a leap year. Some programs use January 1, 1900, as day "1" and treat 1900 as a leap year. In both cases, though, dates on or after March 1, 1900, are the same. ',
    s_fdef_TRIM:
        "Returns the text value with leading, trailing, and repeated spaces removed. ",
    s_fdef_TRUE: 'Returns the logical value "true". ',
    s_fdef_TRUNC:
        "Truncates the value to the specified number of decimal places. If precision is negative, truncate to powers of 10. ",
    s_fdef_UPPER:
        "Returns the text value with all lowercase characters converted to uppercase. ",
    s_fdef_VALUE:
        "Converts the specified text value into a numeric value. Various forms that look like numbers (including digits followed by %, forms that look like dates, etc.) are handled. This may not handle all of the forms accepted by other spreadsheets and may be locale dependent. ",
    s_fdef_VAR: "Returns the sample variance of the numeric values. ",
    s_fdef_VARP: "Returns the variance of the numeric values. ",
    s_fdef_VLOOKUP:
        "Look for the matching value for the given value in the range and return the corresponding value in the cell specified by the column offset. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match>=value) instead of exact match. ",
    s_fdef_WEEKDAY:
        "Returns the day of week specified by the date value. If type is 1 (the default), Sunday is day and Saturday is day 7. If type is 2, Monday is day 1 and Sunday is day 7. If type is 3, Monday is day 0 and Sunday is day 6. ",
    s_fdef_YEAR: "Returns the year part of a date value. ",

    /**
     * @description Function argument patterns for help system
     */

    /** @type {string} Single value argument pattern */
    s_farg_v: "value",

    /** @type {string} Multiple values argument pattern */
    s_farg_vn: "value1, value2, ...",

    /** @type {string} X, Y values argument pattern */
    s_farg_xy: "valueX, valueY",

    /** @type {string} CHOOSE function argument pattern */
    s_farg_choose: "index, value1, value2, ...",

    /** @type {string} Range argument pattern */
    s_farg_range: "range",

    /** @type {string} Range with criteria argument pattern */
    s_farg_rangec: "range, criteria",

    /** @type {string} DATE function argument pattern */
    s_farg_date: "year, month, day",

    /** @type {string} Database function argument pattern */
    s_farg_dfunc: "databaserange, fieldname, criteriarange",

    /** @type {string} DDB function argument pattern */
    s_farg_ddb: "cost, salvage, lifetime, period [, factor]",

    /** @type {string} FIND function argument pattern */
    s_farg_find: "string1, string2 [, start]",

    /** @type {string} FV function argument pattern */
    s_farg_fv: "rate, n, payment, [pv, [paytype]]",

    /** @type {string} HLOOKUP function argument pattern */
    s_farg_hlookup: "value, range, row, [rangelookup]",

    /** @type {string} IF function argument pattern */
    s_farg_iffunc: "logical-expression, true-value, false-value",

    /** @type {string} INDEX function argument pattern */
    s_farg_index: "range, rownum, colnum",

    /** @type {string} IRR function argument pattern */
    s_farg_irr: "range, [guess]",

    /** @type {string} Text, count argument pattern */
    s_farg_tc: "text, count",

    /** @type {string} LOG function argument pattern */
    s_farg_log: "value, base",

    /** @type {string} MATCH function argument pattern */
    s_farg_match: "value, range, [rangelookup]",

    /** @type {string} MID function argument pattern */
    s_farg_mid: "text, start, length",

    /** @type {string} NPER function argument pattern */
    s_farg_nper: "rate, payment, pv, [fv, [paytype]]",

    /** @type {string} NPV function argument pattern */
    s_farg_npv: "rate, value1, value2, ...",

    /** @type {string} PMT function argument pattern */
    s_farg_pmt: "rate, n, pv, [fv, [paytype]]",

    /** @type {string} PV function argument pattern */
    s_farg_pv: "rate, n, payment, [fv, [paytype]]",

    /** @type {string} RATE function argument pattern */
    s_farg_rate: "n, payment, pv, [fv, [paytype, [guess]]]",

    /** @type {string} REPLACE function argument pattern */
    s_farg_replace: "text1, start, length, text2",

    /** @type {string} Value with precision argument pattern */
    s_farg_vp: "value, [precision]",

    /** @type {string} Value, precision argument pattern */
    s_farg_valpre: "value, precision",

    /** @type {string} Cost, salvage, lifetime argument pattern */
    s_farg_csl: "cost, salvage, lifetime",

    /** @type {string} Cost, salvage, lifetime, period argument pattern */
    s_farg_cslp: "cost, salvage, lifetime, period",

    /** @type {string} SUBSTITUTE function argument pattern */
    s_farg_subs: "text1, oldtext, newtext [, occurrence]",

    /** @type {string} SUMIF function argument pattern */
    s_farg_sumif: "range1, criteria [, range2]",

    /** @type {string} Hour, minute, second argument pattern */
    s_farg_hms: "hour, minute, second",

    /** @type {string} Text argument pattern */
    s_farg_txt: "text",

    /** @type {string} VLOOKUP function argument pattern */
    s_farg_vlookup: "value, range, col, [rangelookup]",

    /** @type {string} WEEKDAY function argument pattern */
    s_farg_weekday: "date, [type]",

    /** @type {string} Date argument pattern */
    s_farg_dt: "date",

    /**
     * @description Function classification system
     */

    /** @type {string[]} Order of function classes */
    function_classlist: [
        "all",
        "stat",
        "lookup",
        "datetime",
        "financial",
        "test",
        "math",
        "text",
    ],

    /** @type {string} All functions class label */
    s_fclass_all: "All",

    /** @type {string} Statistics functions class label */
    s_fclass_stat: "Statistics",

    /** @type {string} Lookup functions class label */
    s_fclass_lookup: "Lookup",

    /** @type {string} Date & Time functions class label */
    s_fclass_datetime: "Date & Time",

    /** @type {string} Financial functions class label */
    s_fclass_financial: "Financial",

    /** @type {string} Test functions class label */
    s_fclass_test: "Test",

    /** @type {string} Math functions class label */
    s_fclass_math: "Math",

    /** @type {string} Text functions class label */
    s_fclass_text: "Text",

    /** @type {null} Marker for end of constants */
    lastone: null,
};

/**
 * Default classnames for use with SocialCalc.ConstantsSetClasses
 * @type {Object}
 */
SocialCalc.ConstantsDefaultClasses = {
    defaultComment: "",
    defaultCommentNoGrid: "",
    defaultHighlightTypeCursor: "",
    defaultHighlightTypeRange: "",
    defaultColname: "",
    defaultSelectedColname: "",
    defaultRowname: "",
    defaultSelectedRowname: "",
    defaultUpperLeft: "",
    defaultSkippedCell: "",
    defaultPaneDivider: "",
    /** @description This one has no Style version with it */
    cteGriddiv: "",
    /** @description FireFox won't show warning with this structure */
    defaultInputEcho: {
        classname: "",
        style: "filter:alpha(opacity=90);opacity:.9;",
    },
    TCmain: "",
    TCendcap: "",
    TCpaneslider: "",
    TClessbutton: "",
    TCmorebutton: "",
    TCscrollarea: "",
    TCthumb: "",
    TCPStrackingline: "",
    TCTDFSthumbstatus: "",
    TDpopupElement: "",
};

/**
 * Sets CSS classes for SocialCalc constants
 * 
 * This routine goes through all of the xyzClass/xyzStyle pairs and sets the Class to a default and
 * turns off the Style, if present. The prefix is put before each default.
 * The list of items to set is in SocialCalc.ConstantsDefaultClasses. The names there
 * correspond to the "xyz" parts. If there is a value, it is the default to set. If the
 * default is a null, no change is made. If the default is the null string (""), the
 * name of the item is used (e.g., "defaultComment" would use the classname "defaultComment").
 * If the default is an object, then it expects {classname: classname, style: stylestring} - this
 * lets you combine both.
 * 
 * @param {string} [prefix=""] - Prefix to add before each default classname
 */
SocialCalc.ConstantsSetClasses = function (prefix = "") {
    const defaults = SocialCalc.ConstantsDefaultClasses;
    const scc = SocialCalc.Constants;

    for (const item in defaults) {
        if (typeof defaults[item] === "string") {
            scc[item + "Class"] = prefix + (defaults[item] || item);
            if (scc[item + "Style"] !== undefined) {
                scc[item + "Style"] = "";
            }
        } else if (typeof defaults[item] === "object") {
            scc[item + "Class"] = prefix + (defaults[item].classname || item);
            scc[item + "Style"] = defaults[item].style;
        }
    }
};

// Make sure SocialCalc is available globally
globalThis.SocialCalc = SocialCalc;

// ES6 export for modern module systems
export default SocialCalc;

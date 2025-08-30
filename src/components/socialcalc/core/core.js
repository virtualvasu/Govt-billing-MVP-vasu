// @ts-nocheck
/* eslint-disable */

/**
 * SocialCalc Core Module (Cell, Sheet, and core functions)
 * Extracted from the main SocialCalc.js file
 * 
 * @fileoverview Core SocialCalc module providing Cell and Sheet classes with core functionality
 * @version 2.0.0
 * @license Artistic License 2.0
 * 
 * (c) Copyright 2010 Socialtext, Inc.
 * All Rights Reserved.
 * 
 * The contents of this file are subject to the Artistic License 2.0; you may not
 * use this file except in compliance with the License. You may obtain a copy of 
 * the License at http://socialcalc.org/licenses/al-20/.
 */

/**
 * UMD (Universal Module Definition) wrapper for cross-platform compatibility
 * Supports AMD, CommonJS, and browser globals
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.SocialCalcCore = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {

    /**
     * Get or initialize SocialCalc namespace
     * @type {Object}
     */
    let SocialCalc;
    if (typeof window !== "undefined" && window.SocialCalc) {
        SocialCalc = window.SocialCalc;
    } else if (typeof global !== "undefined" && global.SocialCalc) {
        SocialCalc = global.SocialCalc;
    } else {
        SocialCalc = {};
    }

    /**
     * Initialize SocialCalc namespace if not already present
     * @namespace SocialCalc
     */
    if (!SocialCalc) SocialCalc = {};

    // *************************************
    //
    // Shared values
    //
    // These are "global" values shared by the classes, including default settings
    //
    // *************************************

    /**
     * Callback functions for various SocialCalc operations
     * @namespace
     * @property {Function|null} expand_wiki - Function to expand wiki text
     * @property {Function} expand_markup - Function to expand markup text
     * @property {Function|null} MakePageLink - Function to create page links
     * @property {Function|null} NormalizeSheetName - Function to normalize sheet names
     */
    SocialCalc.Callbacks = {
        /**
         * Function to expand wiki text - should be set if you want wikitext expansion
         * @type {Function|null}
         * @param {string} displayvalue - The value to display
         * @param {Object} sheetobj - The sheet object
         * @param {string} linkstyle - The link style
         * @param {string} valueformat - The value format (text-wiki followed by optional sub-formats)
         */
        expand_wiki: null,

        /**
         * Function to expand markup text - may replace the old wiki expansion function
         * @type {Function}
         * @param {string} displayvalue - The value to display
         * @param {Object} sheetobj - The sheet object
         * @param {string} linkstyle - The link style
         * @returns {string} The expanded markup
         */
        expand_markup: function (displayvalue, sheetobj, linkstyle) {
            return SocialCalc.default_expand_markup(displayvalue, sheetobj, linkstyle);
        },

        /**
         * Function to create href for a link to another "page"
         * @type {Function|null}
         * @param {string} pagename - Name of the page to link to
         * @param {string} workspacename - Name of the workspace
         * @param {string} linkstyle - The link style
         * @param {string} valueformat - The value format
         * @returns {string} The page link URL
         */
        MakePageLink: null,

        /**
         * Function to normalize sheet names for consistent cache slot usage
         * @type {Function|null}
         * @param {string} sheetname - The sheet name to normalize
         * @returns {string} The normalized sheet name (default: lowercase)
         */
        NormalizeSheetName: null, // use default - lowercase
    };

    // *************************************
    //
    // Cell class:
    //
    // *************************************

    /**
     * SocialCalc Cell class representing a single spreadsheet cell
     * @class
     * @param {string} coord - The cell coordinate (e.g., "A1")
     * 
     * @property {string} coord - The column/row as a string, e.g., "A1"
     * @property {string|number} datavalue - Value used for computation and formatting
     * @property {string|null} datatype - Type indicator: v=numeric, t=text, f=formula, c=constant
     * @property {string} formula - Formula without leading "=" or constant value
     * @property {string} valuetype - Type with subtypes: b=blank, n=numeric, t=text, e=error
     * @property {string} [displayvalue] - Rendered version with formatting applied
     * @property {Object} [parseinfo] - Cached parsed version of formula
     * @property {number} [bt] - Top border definition number
     * @property {number} [br] - Right border definition number
     * @property {number} [bb] - Bottom border definition number
     * @property {number} [bl] - Left border definition number
     * @property {number} [layout] - Layout (vertical alignment, padding) definition number
     * @property {number} [font] - Font definition number
     * @property {number} [color] - Text color definition number
     * @property {number} [bgcolor] - Background color definition number
     * @property {number} [cellformat] - Cell format (horizontal alignment) definition number
     * @property {number} [nontextvalueformat] - Custom format for non-text values
     * @property {number} [textvalueformat] - Custom format for text values
     * @property {number} [colspan] - Number of cells to span horizontally for merged cells
     * @property {number} [rowspan] - Number of cells to span vertically for merged cells
     * @property {string} [cssc] - Custom CSS classname for cell
     * @property {string} [csss] - Custom CSS style definition
     * @property {string} [mod] - Modification allowed flag "y" if present
     * @property {string} [comment] - Cell comment string
     */
    SocialCalc.Cell = function (coord) {
        this.coord = coord;
        this.datavalue = "";
        this.datatype = null;
        this.formula = "";
        this.valuetype = "b";
    };

    /**
     * Cell properties categorized by type
     * Type 1: Base properties, Type 2: Attribute properties, Type 3: Special properties
     * @readonly
     * @enum {number}
     */
    SocialCalc.CellProperties = {
        // Base properties (Type 1)
        coord: 1,
        datavalue: 1,
        datatype: 1,
        formula: 1,
        valuetype: 1,
        errors: 1,
        comment: 1,

        // Attribute properties (Type 2)
        bt: 2,
        br: 2,
        bb: 2,
        bl: 2,
        layout: 2,
        font: 2,
        color: 2,
        bgcolor: 2,
        cellformat: 2,
        nontextvalueformat: 2,
        textvalueformat: 2,
        colspan: 2,
        rowspan: 2,
        cssc: 2,
        csss: 2,
        mod: 2,

        // Special properties (Type 3)
        displaystring: 3, // used to cache rendered HTML of cell contents
        parseinfo: 3,     // used to cache parsed formulas
        hcolspan: 3,      // spans taking hidden cols/rows into account (!!! NOT YET !!!)
        hrowspan: 3,
    };

    /**
     * Maps cell properties to their corresponding table types
     * @readonly
     * @enum {string}
     */
    SocialCalc.CellPropertiesTable = {
        bt: "borderstyle",
        br: "borderstyle",
        bb: "borderstyle",
        bl: "borderstyle",
        layout: "layout",
        font: "font",
        color: "color",
        bgcolor: "color",
        cellformat: "cellformat",
        nontextvalueformat: "valueformat",
        textvalueformat: "valueformat",
    };

    // *************************************
    //
    // Sheet class:
    //
    // *************************************

    /**
     * SocialCalc Sheet class representing a complete spreadsheet
     * @class
     * @constructor
     * 
     * @property {Object} cells - Collection of cell objects indexed by coordinate
     * @property {Object} attribs - Sheet-level attributes
     * @property {Object} rowattribs - Row-specific attributes (hide, height)
     * @property {Object} colattribs - Column-specific attributes (width, hide)
     * @property {Object} names - Named ranges and formulas
     * @property {Array} layouts - Layout definitions
     * @property {Object} layouthash - Layout hash for quick lookup
     * @property {Array} fonts - Font definitions
     * @property {Object} fonthash - Font hash for quick lookup
     * @property {Array} colors - Color definitions
     * @property {Object} colorhash - Color hash for quick lookup
     * @property {Array} borderstyles - Border style definitions
     * @property {Object} borderstylehash - Border style hash for quick lookup
     * @property {Array} cellformats - Cell format definitions
     * @property {Object} cellformathash - Cell format hash for quick lookup
     * @property {Array} valueformats - Value format definitions
     * @property {Object} valueformathash - Value format hash for quick lookup
     * @property {string} copiedfrom - Source range if loaded from clipboard
     * @property {SocialCalc.UndoStack} changes - Undo/redo stack
     * @property {boolean} renderneeded - Flag indicating if rendering is needed
     * @property {boolean} changedrendervalues - Flag for span/font changes
     * @property {boolean} recalcchangedavalue - Flag for recalculation changes
     * @property {Function|null} statuscallback - Status callback function
     * @property {*} statuscallbackparams - Parameters for status callback
     */
    SocialCalc.Sheet = function () {
        SocialCalc.ResetSheet(this);

        /**
         * Status callback function called during recalc and commands
         * @type {Function|null}
         * @param {Object} data - Current data context
         * @param {string} status - Status type (calcorder, calccheckdone, etc.)
         * @param {*} arg - Status-specific argument
         * @param {*} params - Callback parameters
         */
        this.statuscallback = null;

        /**
         * Parameters passed to the status callback routine
         * @type {*}
         */
        this.statuscallbackparams = null;
    };

    /**
     * Resets (and/or initializes) sheet data values
     * @param {SocialCalc.Sheet} sheet - The sheet to reset
     * @param {boolean} [reload] - Whether this is a reload operation
     */
    SocialCalc.ResetSheet = function (sheet, reload) {
        // Initialize core properties
        sheet.cells = {}; // at least one for each non-blank cell: coord: cell-object

        // Sheet attributes
        sheet.attribs = {
            lastcol: 1,
            lastrow: 1,
            defaultlayout: 0,
        };

        // Row attributes
        sheet.rowattribs = {
            hide: {},   // access by row number
            height: {},
        };

        // Column attributes
        sheet.colattribs = {
            width: {}, // access by col name
            hide: {},
        };

        // Named ranges and definitions
        sheet.names = {}; // Each is: {desc: "optional description", definition: "B5, A1:B7, or =formula"}

        // Style definitions and their hash tables
        sheet.layouts = [];
        sheet.layouthash = {};
        sheet.fonts = [];
        sheet.fonthash = {};
        sheet.colors = [];
        sheet.colorhash = {};
        sheet.borderstyles = [];
        sheet.borderstylehash = {};
        sheet.cellformats = [];
        sheet.cellformathash = {};
        sheet.valueformats = [];
        sheet.valueformathash = {};

        // Clipboard and change tracking
        sheet.copiedfrom = ""; // if a range, then this was loaded from a saved range as clipboard content
        sheet.changes = new SocialCalc.UndoStack();

        // Rendering flags
        sheet.renderneeded = false;
        sheet.changedrendervalues = true; // if true, spans and/or fonts have changed
        sheet.recalcchangedavalue = false; // true if a recalc resulted in a change to a cell's calculated value
    };

    // *************************************
    // Sheet prototype methods
    // *************************************

    /**
     * Reset this sheet to initial state
     */
    SocialCalc.Sheet.prototype.ResetSheet = function () {
        SocialCalc.ResetSheet(this);
    };

    /**
     * Add a new cell to the sheet
     * @param {SocialCalc.Cell} newcell - The cell to add
     * @returns {SocialCalc.Cell} The added cell
     */
    SocialCalc.Sheet.prototype.AddCell = function (newcell) {
        return (this.cells[newcell.coord] = newcell);
    };

    /**
     * Get a cell, creating it if it doesn't exist
     * @param {string} coord - The cell coordinate
     * @returns {SocialCalc.Cell} The cell object
     */
    SocialCalc.Sheet.prototype.GetAssuredCell = function (coord) {
        return this.cells[coord] || this.AddCell(new SocialCalc.Cell(coord));
    };

    /**
     * Parse saved sheet data into this sheet
     * @param {string} savedsheet - The saved sheet data string
     */
    SocialCalc.Sheet.prototype.ParseSheetSave = function (savedsheet) {
        SocialCalc.ParseSheetSave(savedsheet, this);
    };

    /**
     * Create cell from string parts
     * @param {SocialCalc.Cell} cell - The cell object
     * @param {Array<string>} parts - String parts array
     * @param {number} j - Index in parts array
     * @returns {*} Result of cell creation
     */
    SocialCalc.Sheet.prototype.CellFromStringParts = function (cell, parts, j) {
        return SocialCalc.CellFromStringParts(this, cell, parts, j);
    };

    /**
     * Create a save string for this sheet or a range
     * @param {string} [range] - Optional range to save
     * @param {boolean} [canonicalize] - Whether to canonicalize the output
     * @returns {string} The save string
     */
    SocialCalc.Sheet.prototype.CreateSheetSave = function (range, canonicalize) {
        return SocialCalc.CreateSheetSave(this, range, canonicalize);
    };

    /**
     * Convert cell to string representation
     * @param {SocialCalc.Cell} cell - The cell to convert
     * @returns {string} String representation of the cell
     */
    SocialCalc.Sheet.prototype.CellToString = function (cell) {
        return SocialCalc.CellToString(this, cell);
    };

    /**
     * Canonicalize the sheet data
     * @param {boolean} [full] - Whether to do full canonicalization
     * @returns {*} Result of canonicalization
     */
    SocialCalc.Sheet.prototype.CanonicalizeSheet = function (full) {
        return SocialCalc.CanonicalizeSheet(this, full);
    };

    /**
     * Encode cell attributes for a coordinate
     * @param {string} coord - The cell coordinate
     * @returns {string} Encoded attributes string
     */
    SocialCalc.Sheet.prototype.EncodeCellAttributes = function (coord) {
        return SocialCalc.EncodeCellAttributes(this, coord);
    };

    /**
     * Encode sheet-level attributes
     * @returns {string} Encoded sheet attributes
     */
    SocialCalc.Sheet.prototype.EncodeSheetAttributes = function () {
        return SocialCalc.EncodeSheetAttributes(this);
    };

    /**
     * Decode cell attributes from string
     * @param {string} coord - The cell coordinate
     * @param {string} attribs - The attributes string
     * @param {string} [range] - Optional range context
     * @returns {*} Result of decoding
     */
    SocialCalc.Sheet.prototype.DecodeCellAttributes = function (coord, attribs, range) {
        return SocialCalc.DecodeCellAttributes(this, coord, attribs, range);
    };

    /**
     * Decode sheet-level attributes from string
     * @param {string} attribs - The attributes string
     * @returns {*} Result of decoding
     */
    SocialCalc.Sheet.prototype.DecodeSheetAttributes = function (attribs) {
        return SocialCalc.DecodeSheetAttributes(this, attribs);
    };

    /**
     * Schedule sheet commands for execution
     * @param {string} cmd - The command to execute
     * @param {boolean} [saveundo] - Whether to save undo information
     * @param {boolean} [isRemote] - Whether this is a remote command
     * @returns {*} Result of scheduling
     */
    SocialCalc.Sheet.prototype.ScheduleSheetCommands = function (cmd, saveundo, isRemote) {
        return SocialCalc.ScheduleSheetCommands(this, cmd, saveundo, isRemote);
    };

    /**
     * Undo the last operation
     * @returns {*} Result of undo operation
     */
    SocialCalc.Sheet.prototype.SheetUndo = function () {
        return SocialCalc.SheetUndo(this);
    };

    /**
     * Redo the last undone operation
     * @returns {*} Result of redo operation
     */
    SocialCalc.Sheet.prototype.SheetRedo = function () {
        return SocialCalc.SheetRedo(this);
    };

    /**
     * Create an audit string for the sheet
     * @returns {string} The audit string
     */
    SocialCalc.Sheet.prototype.CreateAuditString = function () {
        return SocialCalc.CreateAuditString(this);
    };

    /**
     * Get style number for a given type and style
     * @param {string} atype - The attribute type
     * @param {string} style - The style definition
     * @returns {number} The style number
     */
    SocialCalc.Sheet.prototype.GetStyleNum = function (atype, style) {
        return SocialCalc.GetStyleNum(this, atype, style);
    };

    /**
     * Get style string for a given type and number
     * @param {string} atype - The attribute type
     * @param {number} num - The style number
     * @returns {string} The style string
     */
    SocialCalc.Sheet.prototype.GetStyleString = function (atype, num) {
        return SocialCalc.GetStyleString(this, atype, num);
    };

    /**
     * Recalculate the entire sheet
     * @returns {*} Result of recalculation
     */
    SocialCalc.Sheet.prototype.RecalcSheet = function () {
        return SocialCalc.RecalcSheet(this);
    };
    /**
     * Sheet save format specification and parsing functions
     * 
     * @fileoverview Handles parsing and processing of sheet save format data
     * 
     * Sheet save format uses line-based structure:
     * linetype:param1:param2:...
     * 
     * Supported line types include:
     * - version: Format version identifier
     * - cell: Cell data with various type/value combinations
     * - col/row: Column and row attributes
     * - sheet: Sheet-level attributes
     * - name: Named range definitions
     * - layout/font/color/border: Style definitions
     * - cellformat/valueformat: Format definitions
     */

    /**
     * Parse saved sheet data and populate sheet object
     * @param {string} savedsheet - The saved sheet data string
     * @param {SocialCalc.Sheet} sheetobj - The sheet object to populate
     * @throws {Error} When encountering unknown line types or cell types
     */
    SocialCalc.ParseSheetSave = function (savedsheet, sheetobj) {
        const lines = savedsheet.split(/\r\n|\n/);
        let parts = [];
        let line;
        let i, j, t, v, coord, cell, attribs, name;
        const scc = SocialCalc.Constants;

        for (i = 0; i < lines.length; i++) {
            line = lines[i];
            parts = line.split(":");

            switch (parts[0]) {
                case "cell":
                    cell = sheetobj.GetAssuredCell(parts[1]);
                    j = 2;
                    sheetobj.CellFromStringParts(cell, parts, j);
                    break;

                case "col":
                    coord = parts[1];
                    j = 2;
                    while ((t = parts[j++])) {
                        switch (t) {
                            case "w":
                                // Width value must be text - could be auto, %, etc.
                                sheetobj.colattribs.width[coord] = parts[j++];
                                break;
                            case "hide":
                                sheetobj.colattribs.hide[coord] = parts[j++];
                                break;
                            default:
                                throw scc.s_pssUnknownColType + " '" + t + "'";
                        }
                    }
                    break;

                case "row":
                    coord = parts[1] - 0;
                    j = 2;
                    while ((t = parts[j++])) {
                        switch (t) {
                            case "h":
                                sheetobj.rowattribs.height[coord] = parts[j++] - 0;
                                break;
                            case "hide":
                                sheetobj.rowattribs.hide[coord] = parts[j++];
                                break;
                            default:
                                throw scc.s_pssUnknownRowType + " '" + t + "'";
                        }
                    }
                    break;

                case "sheet":
                    attribs = sheetobj.attribs;
                    j = 1;
                    while ((t = parts[j++])) {
                        switch (t) {
                            case "c":
                                attribs.lastcol = parts[j++] - 0;
                                break;
                            case "r":
                                attribs.lastrow = parts[j++] - 0;
                                break;
                            case "w":
                                attribs.defaultcolwidth = parts[j++] + "";
                                break;
                            case "h":
                                attribs.defaultrowheight = parts[j++] - 0;
                                break;
                            case "tf":
                                attribs.defaulttextformat = parts[j++] - 0;
                                break;
                            case "ntf":
                                attribs.defaultnontextformat = parts[j++] - 0;
                                break;
                            case "layout":
                                attribs.defaultlayout = parts[j++] - 0;
                                break;
                            case "font":
                                attribs.defaultfont = parts[j++] - 0;
                                break;
                            case "tvf":
                                attribs.defaulttextvalueformat = parts[j++] - 0;
                                break;
                            case "ntvf":
                                attribs.defaultnontextvalueformat = parts[j++] - 0;
                                break;
                            case "color":
                                attribs.defaultcolor = parts[j++] - 0;
                                break;
                            case "bgcolor":
                                attribs.defaultbgcolor = parts[j++] - 0;
                                break;
                            case "circularreferencecell":
                                attribs.circularreferencecell = parts[j++];
                                break;
                            case "recalc":
                                attribs.recalc = parts[j++];
                                break;
                            case "needsrecalc":
                                attribs.needsrecalc = parts[j++];
                                break;
                            default:
                                j += 1;
                                break;
                        }
                    }
                    break;

                case "name":
                    name = SocialCalc.decodeFromSave(parts[1]).toUpperCase();
                    sheetobj.names[name] = {
                        desc: SocialCalc.decodeFromSave(parts[2])
                    };
                    sheetobj.names[name].definition = SocialCalc.decodeFromSave(parts[3]);
                    break;

                case "layout":
                    // Layouts can have ":" in them, so use regex match
                    parts = lines[i].match(/^layout\:(\d+)\:(.+)$/);
                    sheetobj.layouts[parts[1] - 0] = parts[2];
                    sheetobj.layouthash[parts[2]] = parts[1] - 0;
                    break;

                case "font":
                    sheetobj.fonts[parts[1] - 0] = parts[2];
                    sheetobj.fonthash[parts[2]] = parts[1] - 0;
                    break;

                case "color":
                    sheetobj.colors[parts[1] - 0] = parts[2];
                    sheetobj.colorhash[parts[2]] = parts[1] - 0;
                    break;

                case "border":
                    sheetobj.borderstyles[parts[1] - 0] = parts[2];
                    sheetobj.borderstylehash[parts[2]] = parts[1] - 0;
                    break;

                case "cellformat":
                    v = SocialCalc.decodeFromSave(parts[2]);
                    sheetobj.cellformats[parts[1] - 0] = v;
                    sheetobj.cellformathash[v] = parts[1] - 0;
                    break;

                case "valueformat":
                    v = SocialCalc.decodeFromSave(parts[2]);
                    sheetobj.valueformats[parts[1] - 0] = v;
                    sheetobj.valueformathash[v] = parts[1] - 0;
                    break;

                case "version":
                    // Version information - no processing needed
                    break;

                case "copiedfrom":
                    sheetobj.copiedfrom = `${parts[1]}:${parts[2]}`;
                    break;

                case "clipboardrange": // Ignored - from save versions up to 1.3
                case "clipboard":      // Ignored - from wikiCalc
                case "":              // Empty line
                    break;

                default:
                    alert(scc.s_pssUnknownLineType + " '" + parts[0] + "'");
                    throw scc.s_pssUnknownLineType + " '" + parts[0] + "'";
            }
            parts = null;
        }
    };

    /**
     * Parse cell data from string parts and populate cell object
     * Takes string that has been split by ":" in parts, starting at item j,
     * and fills in cell assuming save format.
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet object
     * @param {SocialCalc.Cell} cell - The cell object to populate
     * @param {Array<string>} parts - Array of string parts from split operation
     * @param {number} j - Starting index in parts array
     * @throws {Error} When encountering unknown cell types
     */
    SocialCalc.CellFromStringParts = function (sheet, cell, parts, j) {
        let t, v;

        while ((t = parts[j++])) {
            switch (t) {
                case "v":
                    // Straight numeric value
                    cell.datavalue = SocialCalc.decodeFromSave(parts[j++]) - 0;
                    cell.datatype = "v";
                    cell.valuetype = "n";
                    break;

                case "t":
                    // Straight text/wiki-text in cell, encoded
                    cell.datavalue = SocialCalc.decodeFromSave(parts[j++]);
                    cell.datatype = "t";
                    cell.valuetype = SocialCalc.Constants.textdatadefaulttype;
                    break;

                case "vt":
                    // Value with value type/subtype
                    v = parts[j++];
                    cell.valuetype = v;
                    if (v.charAt(0) === "n") {
                        cell.datatype = "v";
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]) - 0;
                    } else {
                        cell.datatype = "t";
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]);
                    }
                    break;

                case "vtf":
                    // Formula resulting in value with value type/subtype
                    v = parts[j++];
                    cell.valuetype = v;
                    if (v.charAt(0) === "n") {
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]) - 0;
                    } else {
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]);
                    }
                    cell.formula = SocialCalc.decodeFromSave(parts[j++]);
                    cell.datatype = "f";
                    break;

                case "vtc":
                    // Formatted text constant resulting in value with value type/subtype
                    v = parts[j++];
                    cell.valuetype = v;
                    if (v.charAt(0) === "n") {
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]) - 0;
                    } else {
                        cell.datavalue = SocialCalc.decodeFromSave(parts[j++]);
                    }
                    cell.formula = SocialCalc.decodeFromSave(parts[j++]);
                    cell.datatype = "c";
                    break;

                case "e":
                    // Error text - non-blank means formula parsing/calculation error
                    cell.errors = SocialCalc.decodeFromSave(parts[j++]);
                    break;

                case "b":
                    // Border definitions: top, right, bottom, left
                    cell.bt = parts[j++] - 0;
                    cell.br = parts[j++] - 0;
                    cell.bb = parts[j++] - 0;
                    cell.bl = parts[j++] - 0;
                    break;

                case "l":
                    // Layout number in cell layout list
                    cell.layout = parts[j++] - 0;
                    break;

                case "f":
                    // Font number in sheet fonts list
                    cell.font = parts[j++] - 0;
                    break;

                case "c":
                    // Text color number in sheet color list
                    cell.color = parts[j++] - 0;
                    break;

                case "bg":
                    // Background color number in sheet color list
                    cell.bgcolor = parts[j++] - 0;
                    break;

                case "cf":
                    // Cell format number for explicit format
                    cell.cellformat = parts[j++] - 0;
                    break;

                case "ntvf":
                    // Non-text value format number
                    cell.nontextvalueformat = parts[j++] - 0;
                    break;

                case "tvf":
                    // Text value format number
                    cell.textvalueformat = parts[j++] - 0;
                    break;

                case "colspan":
                    // Number of columns spanned in merged cell
                    cell.colspan = parts[j++] - 0;
                    break;

                case "rowspan":
                    // Number of rows spanned in merged cell
                    cell.rowspan = parts[j++] - 0;
                    break;

                case "cssc":
                    // CSS class name for cell when published
                    cell.cssc = parts[j++];
                    break;

                case "csss":
                    // Explicit CSS style information, encoded
                    cell.csss = SocialCalc.decodeFromSave(parts[j++]);
                    break;

                case "mod":
                    // Modification flag - skip processing
                    j += 1;
                    break;

                case "comment":
                    // Encoded text of comment for this cell
                    cell.comment = SocialCalc.decodeFromSave(parts[j++]);
                    break;

                default:
                    throw SocialCalc.Constants.s_cfspUnknownCellType + " '" + t + "'";
            }
        }
    };

    /**
     * Sheet attribute field mappings for serialization
     * Maps long field names to their short form equivalents
     * @readonly
     * @type {Array<string>}
     */
    SocialCalc.sheetfields = [
        "defaultrowheight",
        "defaultcolwidth",
        "circularreferencecell",
        "recalc",
        "needsrecalc",
    ];

    /**
     * Short form field names corresponding to sheetfields
     * @readonly
     * @type {Array<string>}
     */
    SocialCalc.sheetfieldsshort = [
        "h",
        "w",
        "circularreferencecell",
        "recalc",
        "needsrecalc",
    ];

    /**
     * Sheet fields that require translation through lookup tables
     * These fields reference other style/format definitions
     * @readonly
     * @type {Array<string>}
     */
    SocialCalc.sheetfieldsxlat = [
        "defaulttextformat",
        "defaultnontextformat",
        "defaulttextvalueformat",
        "defaultnontextvalueformat",
        "defaultcolor",
        "defaultbgcolor",
        "defaultfont",
        "defaultlayout",
    ];

    /**
     * Short form field names for translation fields
     * @readonly
     * @type {Array<string>}
     */
    SocialCalc.sheetfieldsxlatshort = [
        "tf",
        "ntf",
        "tvf",
        "ntvf",
        "color",
        "bgcolor",
        "font",
        "layout",
    ];

    /**
     * Translation table types for sheet fields
     * Maps field types to their corresponding lookup table names
     * @readonly
     * @type {Array<string>}
     */
    SocialCalc.sheetfieldsxlatxlt = [
        "cellformat",
        "cellformat",
        "valueformat",
        "valueformat",
        "color",
        "color",
        "font",
        "layout",
    ];
    /**
     * Sheet serialization and canonicalization functions
     * 
     * @fileoverview Functions for creating sheet save strings and canonicalizing sheet data
     */

    /**
     * Creates a text representation of the sheet data in save format
     * If a range is present, only those cells are saved as clipboard data with "copiedfrom" set
     * 
     * @param {SocialCalc.Sheet} sheetobj - The sheet object to serialize
     * @param {string} [range] - Optional range to limit serialization (e.g., "A1:C5")
     * @param {boolean} [canonicalize] - Whether to canonicalize the sheet before saving
     * @returns {string} The serialized sheet data as a string
     */
    SocialCalc.CreateSheetSave = function (sheetobj, range, canonicalize) {
        let cell, cr1, cr2, row, col, coord, attrib, line, value, formula, i, t, r, b, l, name, blanklen;
        const result = [];
        let prange;

        // Canonicalize sheet data for consistent output
        sheetobj.CanonicalizeSheet(
            canonicalize || SocialCalc.Constants.doCanonicalizeSheet
        );
        const xlt = sheetobj.xlt;

        // Determine the range to save
        if (range) {
            prange = SocialCalc.ParseRange(range);
        } else {
            prange = {
                cr1: { row: 1, col: 1 },
                cr2: { row: xlt.maxrow, col: xlt.maxcol },
            };
        }
        cr1 = prange.cr1;
        cr2 = prange.cr2;

        // Add version information
        result.push("version:1.5");

        // Process all cells in the specified range
        for (row = cr1.row; row <= cr2.row; row++) {
            for (col = cr1.col; col <= cr2.col; col++) {
                coord = SocialCalc.crToCoord(col, row);
                cell = sheetobj.cells[coord];
                if (!cell) continue;

                line = sheetobj.CellToString(cell);
                if (line.length === 0) continue; // ignore completely empty cells

                line = `cell:${coord}${line}`;
                result.push(line);
            }
        }

        // Process column attributes
        for (col = 1; col <= xlt.maxcol; col++) {
            coord = SocialCalc.rcColname(col);
            if (sheetobj.colattribs.width[coord]) {
                result.push(`col:${coord}:w:${sheetobj.colattribs.width[coord]}`);
            }
            if (sheetobj.colattribs.hide[coord]) {
                result.push(`col:${coord}:hide:${sheetobj.colattribs.hide[coord]}`);
            }
        }

        // Process row attributes
        for (row = 1; row <= xlt.maxrow; row++) {
            if (sheetobj.rowattribs.height[row]) {
                result.push(`row:${row}:h:${sheetobj.rowattribs.height[row]}`);
            }
            if (sheetobj.rowattribs.hide[row]) {
                result.push(`row:${row}:hide:${sheetobj.rowattribs.hide[row]}`);
            }
        }

        // Build sheet attributes line
        line = `sheet:c:${xlt.maxcol}:r:${xlt.maxrow}`;

        // Add non-translated sheet values
        for (i = 0; i < SocialCalc.sheetfields.length; i++) {
            value = SocialCalc.encodeForSave(
                sheetobj.attribs[SocialCalc.sheetfields[i]]
            );
            if (value) {
                line += `:${SocialCalc.sheetfieldsshort[i]}:${value}`;
            }
        }

        // Add translated sheet values
        for (i = 0; i < SocialCalc.sheetfieldsxlat.length; i++) {
            value = sheetobj.attribs[SocialCalc.sheetfieldsxlat[i]];
            if (value) {
                line += `:${SocialCalc.sheetfieldsxlatshort[i]}:${xlt[SocialCalc.sheetfieldsxlatxlt[i] + "sxlat"][value]
                    }`;
            }
        }

        result.push(line);

        // Add style definitions in order
        for (i = 1; i < xlt.newborderstyles.length; i++) {
            result.push(`border:${i}:${xlt.newborderstyles[i]}`);
        }

        for (i = 1; i < xlt.newcellformats.length; i++) {
            result.push(
                `cellformat:${i}:${SocialCalc.encodeForSave(xlt.newcellformats[i])}`
            );
        }

        for (i = 1; i < xlt.newcolors.length; i++) {
            result.push(`color:${i}:${xlt.newcolors[i]}`);
        }

        for (i = 1; i < xlt.newfonts.length; i++) {
            result.push(`font:${i}:${xlt.newfonts[i]}`);
        }

        for (i = 1; i < xlt.newlayouts.length; i++) {
            result.push(`layout:${i}:${xlt.newlayouts[i]}`);
        }

        for (i = 1; i < xlt.newvalueformats.length; i++) {
            result.push(
                `valueformat:${i}:${SocialCalc.encodeForSave(xlt.newvalueformats[i])}`
            );
        }

        // Add named ranges in sorted order
        for (i = 0; i < xlt.namesorder.length; i++) {
            name = xlt.namesorder[i];
            result.push(
                `name:${SocialCalc.encodeForSave(name).toUpperCase()}:${SocialCalc.encodeForSave(sheetobj.names[name].desc)
                }:${SocialCalc.encodeForSave(sheetobj.names[name].definition)}`
            );
        }

        // Add range information if this is clipboard data
        if (range) {
            result.push(
                `copiedfrom:${SocialCalc.crToCoord(cr1.col, cr1.row)}:${SocialCalc.crToCoord(cr2.col, cr2.row)
                }`
            );
        }

        result.push(""); // Add extra line for final newline

        delete sheetobj.xlt; // Clean up translation data

        return result.join("\n");
    };

    /**
     * Convert a cell object to its string representation for save format
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet object containing the cell
     * @param {SocialCalc.Cell} cell - The cell object to convert
     * @returns {string} String representation of the cell data
     */
    SocialCalc.CellToString = function (sheet, cell) {
        let line = "";
        let value, formula, t, r, b, l, xlt;

        if (!cell) return line;

        // Process cell data value and type
        value = SocialCalc.encodeForSave(cell.datavalue);

        if (cell.datatype === "v") {
            // Numeric value
            if (cell.valuetype === "n") {
                line += `:v:${value}`;
            } else {
                line += `:vt:${cell.valuetype}:${value}`;
            }
        } else if (cell.datatype === "t") {
            // Text value
            if (cell.valuetype === SocialCalc.Constants.textdatadefaulttype) {
                line += `:t:${value}`;
            } else {
                line += `:vt:${cell.valuetype}:${value}`;
            }
        } else {
            // Formula or constant
            formula = SocialCalc.encodeForSave(cell.formula);
            if (cell.datatype === "f") {
                line += `:vtf:${cell.valuetype}:${value}:${formula}`;
            } else if (cell.datatype === "c") {
                line += `:vtc:${cell.valuetype}:${value}:${formula}`;
            }
        }

        // Add error information if present
        if (cell.errors) {
            line += `:e:${SocialCalc.encodeForSave(cell.errors)}`;
        }

        // Process border information
        t = cell.bt || "";
        r = cell.br || "";
        b = cell.bb || "";
        l = cell.bl || "";

        if (sheet.xlt) {
            // Use canonical save info with translation
            xlt = sheet.xlt;
            if (t || r || b || l) {
                line += `:b:${xlt.borderstylesxlat[t || 0]}:${xlt.borderstylesxlat[r || 0]
                    }:${xlt.borderstylesxlat[b || 0]}:${xlt.borderstylesxlat[l || 0]}`;
            }
            if (cell.layout) line += `:l:${xlt.layoutsxlat[cell.layout]}`;
            if (cell.font) line += `:f:${xlt.fontsxlat[cell.font]}`;
            if (cell.color) line += `:c:${xlt.colorsxlat[cell.color]}`;
            if (cell.bgcolor) line += `:bg:${xlt.colorsxlat[cell.bgcolor]}`;
            if (cell.cellformat) line += `:cf:${xlt.cellformatsxlat[cell.cellformat]}`;
            if (cell.textvalueformat) line += `:tvf:${xlt.valueformatsxlat[cell.textvalueformat]}`;
            if (cell.nontextvalueformat) line += `:ntvf:${xlt.valueformatsxlat[cell.nontextvalueformat]}`;
        } else {
            // Use direct values without translation
            if (t || r || b || l) line += `:b:${t}:${r}:${b}:${l}`;
            if (cell.layout) line += `:l:${cell.layout}`;
            if (cell.font) line += `:f:${cell.font}`;
            if (cell.color) line += `:c:${cell.color}`;
            if (cell.bgcolor) line += `:bg:${cell.bgcolor}`;
            if (cell.cellformat) line += `:cf:${cell.cellformat}`;
            if (cell.textvalueformat) line += `:tvf:${cell.textvalueformat}`;
            if (cell.nontextvalueformat) line += `:ntvf:${cell.nontextvalueformat}`;
        }

        // Add additional cell properties
        if (cell.colspan) line += `:colspan:${cell.colspan}`;
        if (cell.rowspan) line += `:rowspan:${cell.rowspan}`;
        if (cell.cssc) line += `:cssc:${cell.cssc}`;
        if (cell.csss) line += `:csss:${SocialCalc.encodeForSave(cell.csss)}`;
        if (cell.mod) line += `:mod:${cell.mod}`;
        if (cell.comment) line += `:comment:${SocialCalc.encodeForSave(cell.comment)}`;

        return line;
    };

    /**
     * Goes through the sheet and creates translation tables for canonicalization
     * 
     * Creates sheetobj.xlt with the following properties:
     * - .maxrow, .maxcol - smallest possible lastrow and lastcol
     * - .newlayouts - optimized layouts array without unused entries
     * - .layoutsxlat - maps old layout indices to new ones
     * - Similar ".new*" and "*xlat" properties for fonts, colors, borderstyles, cell and value formats
     * - .namesorder - array with names sorted alphabetically
     * 
     * @param {SocialCalc.Sheet} sheetobj - The sheet object to canonicalize
     * @param {boolean} [full] - Whether to perform full canonicalization
     * 
     * @note sheetobj.xlt should be deleted when finished using it
     * @note If full is false or doCanonicalizeSheet is disabled, returns unchanged values to save processing time
     */
    SocialCalc.CanonicalizeSheet = function (sheetobj, full) {
        let l, coord, cr, cell, filled, an, a, newa, newxlat, used, ahash, i, v;
        let maxrow = 0;
        let maxcol = 0;

        /**
         * List of attribute types to process during canonicalization
         * @type {Array<string>}
         */
        const alist = [
            "borderstyle",
            "cellformat",
            "color",
            "font",
            "layout",
            "valueformat",
        ];

        const xlt = {};

        // Always return a sorted list of names
        xlt.namesorder = [];
        for (a in sheetobj.names) {
            xlt.namesorder.push(a);
        }
        xlt.namesorder.sort();

        // Return make-no-changes values if canonicalization not wanted
        if (!SocialCalc.Constants.doCanonicalizeSheet || !full) {
            for (an = 0; an < alist.length; an++) {
                a = alist[an];
                xlt[`new${a}s`] = sheetobj[`${a}s`];
                l = sheetobj[`${a}s`].length;
                newxlat = new Array(l);
                newxlat[0] = "";
                for (i = 1; i < l; i++) {
                    newxlat[i] = i;
                }
                xlt[`${a}sxlat`] = newxlat;
            }

            xlt.maxrow = sheetobj.attribs.lastrow;
            xlt.maxcol = sheetobj.attribs.lastcol;
            sheetobj.xlt = xlt;
            return;
        }

        // Initialize usage tracking for all attribute types
        for (an = 0; an < alist.length; an++) {
            a = alist[an];
            xlt[`${a}sUsed`] = {};
        }

        // Create convenient references to usage tracking objects
        const colorsUsed = xlt.colorsUsed;
        const borderstylesUsed = xlt.borderstylesUsed;
        const fontsUsed = xlt.fontsUsed;
        const layoutsUsed = xlt.layoutsUsed;
        const cellformatsUsed = xlt.cellformatsUsed;
        const valueformatsUsed = xlt.valueformatsUsed;

        // Check all cells to see which values are used
        for (coord in sheetobj.cells) {
            cr = SocialCalc.coordToCr(coord);
            cell = sheetobj.cells[coord];
            filled = false;

            // Check if cell has content
            if (cell.valuetype && cell.valuetype !== "b") filled = true;

            // Track color usage
            if (cell.color) {
                colorsUsed[cell.color] = 1;
                filled = true;
            }

            if (cell.bgcolor) {
                colorsUsed[cell.bgcolor] = 1;
                filled = true;
            }

            // Track border style usage
            if (cell.bt) {
                borderstylesUsed[cell.bt] = 1;
                filled = true;
            }
            if (cell.br) {
                borderstylesUsed[cell.br] = 1;
                filled = true;
            }
            if (cell.bb) {
                borderstylesUsed[cell.bb] = 1;
                filled = true;
            }
            if (cell.bl) {
                borderstylesUsed[cell.bl] = 1;
                filled = true;
            }

            // Track other attribute usage
            if (cell.layout) {
                layoutsUsed[cell.layout] = 1;
                filled = true;
            }

            if (cell.font) {
                fontsUsed[cell.font] = 1;
                filled = true;
            }

            if (cell.cellformat) {
                cellformatsUsed[cell.cellformat] = 1;
                filled = true;
            }

            if (cell.textvalueformat) {
                valueformatsUsed[cell.textvalueformat] = 1;
                filled = true;
            }

            if (cell.nontextvalueformat) {
                valueformatsUsed[cell.nontextvalueformat] = 1;
                filled = true;
            }

            // Update max row/col if cell has content
            if (filled) {
                if (cr.row > maxrow) maxrow = cr.row;
                if (cr.col > maxcol) maxcol = cr.col;
            }
        }

        // Process sheet-level attribute usage
        for (i = 0; i < SocialCalc.sheetfieldsxlat.length; i++) {
            v = sheetobj.attribs[SocialCalc.sheetfieldsxlat[i]];
            if (v) {
                xlt[SocialCalc.sheetfieldsxlatxlt[i] + "sUsed"][v] = 1;
            }
        }

        // Check explicit row settings
        a = { height: 1, hide: 1 };
        for (v in a) {
            for (cr in sheetobj.rowattribs[v]) {
                if (cr > maxrow) maxrow = cr;
            }
        }

        // Check explicit column settings
        a = { hide: 1, width: 1 };
        for (v in a) {
            for (coord in sheetobj.colattribs[v]) {
                cr = SocialCalc.coordToCr(coord + "1");
                if (cr.col > maxcol) maxcol = cr.col;
            }
        }

        // Create optimized attribute arrays and translation maps
        for (an = 0; an < alist.length; an++) {
            a = alist[an];

            // Create new sorted array of used attributes
            newa = [];
            used = xlt[`${a}sUsed`];
            for (v in used) {
                newa.push(sheetobj[`${a}s`][v]);
            }
            newa.sort();
            newa.unshift(""); // Empty string at index 0

            // Create translation map from old indices to new indices
            newxlat = [""];
            ahash = sheetobj[`${a}hash`];

            for (i = 1; i < newa.length; i++) {
                newxlat[ahash[newa[i]]] = i;
            }

            xlt[`${a}sxlat`] = newxlat;
            xlt[`new${a}s`] = newa;
        }

        // Set final dimensions
        xlt.maxrow = maxrow || 1;
        xlt.maxcol = maxcol || 1;

        // Store translation data for use by caller
        sheetobj.xlt = xlt;
    };
    /**
     * Cell and Sheet attribute encoding/decoding functions
     * 
     * @fileoverview Functions for encoding cell attributes to objects and decoding back to command strings
     */

    /**
     * Encodes a cell's attributes into a structured object format
     * Returns the cell's attributes in an object, each in the following form:
     * { def: true/false, val: full-value }
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet containing the cell
     * @param {string} coord - The cell coordinate (e.g., "A1")
     * @returns {Object} Object containing all cell attributes with def/val structure
     * 
     * @example
     * const attrs = SocialCalc.EncodeCellAttributes(sheet, "A1");
     * // Returns: { alignhoriz: {def: false, val: "left"}, textcolor: {def: true, val: ""}, ... }
     */
    SocialCalc.EncodeCellAttributes = function (sheet, coord) {
        let value, i, b, bb, parts;
        const result = {};

        /**
         * Initialize an attribute with default values
         * @param {string} name - Attribute name to initialize
         */
        const InitAttrib = (name) => {
            result[name] = { def: true, val: "" };
        };

        /**
         * Initialize multiple attributes with default values
         * @param {Array<string>} namelist - Array of attribute names to initialize
         */
        const InitAttribs = (namelist) => {
            for (let i = 0; i < namelist.length; i++) {
                InitAttrib(namelist[i]);
            }
        };

        /**
         * Set an attribute value as non-default
         * @param {string} name - Attribute name to set
         * @param {*} v - Value to set (will be converted to string if null/undefined)
         */
        const SetAttrib = (name, v) => {
            result[name].def = false;
            result[name].val = v || "";
        };

        /**
         * Set an attribute value only if it's not "*" (wildcard)
         * @param {string} name - Attribute name to set
         * @param {*} v - Value to set (ignored if "*")
         */
        const SetAttribStar = (name, v) => {
            if (v === "*") return;
            result[name].def = false;
            result[name].val = v;
        };

        const cell = sheet.GetAssuredCell(coord);

        // cellformat: alignhoriz
        InitAttrib("alignhoriz");
        if (cell.cellformat) {
            SetAttrib("alignhoriz", sheet.cellformats[cell.cellformat]);
        }

        // layout: alignvert, padtop, padright, padbottom, padleft
        InitAttribs(["alignvert", "padtop", "padright", "padbottom", "padleft"]);
        if (cell.layout) {
            parts = sheet.layouts[cell.layout].match(
                /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/
            );
            SetAttribStar("padtop", parts[1]);
            SetAttribStar("padright", parts[2]);
            SetAttribStar("padbottom", parts[3]);
            SetAttribStar("padleft", parts[4]);
            SetAttribStar("alignvert", parts[5]);
        }

        // font: fontfamily, fontlook, fontsize
        InitAttribs(["fontfamily", "fontlook", "fontsize"]);
        if (cell.font) {
            parts = sheet.fonts[cell.font].match(/^(\*|\S+? \S+?) (\S+?) (\S.*)$/);
            SetAttribStar("fontfamily", parts[3]);
            SetAttribStar("fontsize", parts[2]);
            SetAttribStar("fontlook", parts[1]);
        }

        // color: textcolor
        InitAttrib("textcolor");
        if (cell.color) {
            SetAttrib("textcolor", sheet.colors[cell.color]);
        }

        // bgcolor: bgcolor
        InitAttrib("bgcolor");
        if (cell.bgcolor) {
            SetAttrib("bgcolor", sheet.colors[cell.bgcolor]);
        }

        // formatting: numberformat, textformat
        InitAttribs(["numberformat", "textformat"]);
        if (cell.nontextvalueformat) {
            SetAttrib("numberformat", sheet.valueformats[cell.nontextvalueformat]);
        }
        if (cell.textvalueformat) {
            SetAttrib("textformat", sheet.valueformats[cell.textvalueformat]);
        }

        // merges: colspan, rowspan
        InitAttribs(["colspan", "rowspan"]);
        SetAttrib("colspan", cell.colspan || 1);
        SetAttrib("rowspan", cell.rowspan || 1);

        // borders: bXthickness, bXstyle, bXcolor for X = t, r, b, and l
        for (i = 0; i < 4; i++) {
            b = "trbl".charAt(i);
            bb = `b${b}`;
            InitAttrib(bb);
            SetAttrib(bb, cell[bb] ? sheet.borderstyles[cell[bb]] : "");
            InitAttrib(`${bb}thickness`);
            InitAttrib(`${bb}style`);
            InitAttrib(`${bb}color`);
            if (cell[bb]) {
                parts = sheet.borderstyles[cell[bb]].match(/(\S+)\s+(\S+)\s+(\S.+)/);
                SetAttrib(`${bb}thickness`, parts[1]);
                SetAttrib(`${bb}style`, parts[2]);
                SetAttrib(`${bb}color`, parts[3]);
            }
        }

        // misc: cssc, csss, mod
        InitAttribs(["cssc", "csss", "mod"]);
        SetAttrib("cssc", cell.cssc || "");
        SetAttrib("csss", cell.csss || "");
        SetAttrib("mod", cell.mod || "n");

        return result;
    };

    /**
     * Encodes a sheet's default attributes into a structured object format
     * Returns the sheet's attributes in an object, each in the following form:
     * { def: true/false, val: full-value }
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet to encode attributes from
     * @returns {Object} Object containing all sheet attributes with def/val structure
     * 
     * @example
     * const sheetAttrs = SocialCalc.EncodeSheetAttributes(sheet);
     * // Returns: { colwidth: {def: false, val: "80"}, textcolor: {def: true, val: ""}, ... }
     */
    SocialCalc.EncodeSheetAttributes = function (sheet) {
        let value, parts;
        const attribs = sheet.attribs;
        const result = {};

        /**
         * Initialize an attribute with default values
         * @param {string} name - Attribute name to initialize
         */
        const InitAttrib = (name) => {
            result[name] = { def: true, val: "" };
        };

        /**
         * Initialize multiple attributes with default values
         * @param {Array<string>} namelist - Array of attribute names to initialize
         */
        const InitAttribs = (namelist) => {
            for (let i = 0; i < namelist.length; i++) {
                InitAttrib(namelist[i]);
            }
        };

        /**
         * Set an attribute value as non-default
         * @param {string} name - Attribute name to set
         * @param {*} v - Value to set (or use global 'value' if not provided)
         */
        const SetAttrib = (name, v) => {
            result[name].def = false;
            result[name].val = v || value;
        };

        /**
         * Set an attribute value only if it's not "*" (wildcard)
         * @param {string} name - Attribute name to set
         * @param {*} v - Value to set (ignored if "*")
         */
        const SetAttribStar = (name, v) => {
            if (v === "*") return;
            result[name].def = false;
            result[name].val = v;
        };

        // sizes: colwidth, rowheight
        InitAttrib("colwidth");
        if (attribs.defaultcolwidth) {
            SetAttrib("colwidth", attribs.defaultcolwidth);
        }

        InitAttrib("rowheight");
        if (attribs.rowheight) {
            SetAttrib("rowheight", attribs.defaultrowheight);
        }

        // cellformat: textalignhoriz, numberalignhoriz
        InitAttrib("textalignhoriz");
        if (attribs.defaulttextformat) {
            SetAttrib("textalignhoriz", sheet.cellformats[attribs.defaulttextformat]);
        }

        InitAttrib("numberalignhoriz");
        if (attribs.defaultnontextformat) {
            SetAttrib(
                "numberalignhoriz",
                sheet.cellformats[attribs.defaultnontextformat]
            );
        }

        // layout: alignvert, padtop, padright, padbottom, padleft
        InitAttribs(["alignvert", "padtop", "padright", "padbottom", "padleft"]);
        if (attribs.defaultlayout) {
            parts = sheet.layouts[attribs.defaultlayout].match(
                /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/
            );
            SetAttribStar("padtop", parts[1]);
            SetAttribStar("padright", parts[2]);
            SetAttribStar("padbottom", parts[3]);
            SetAttribStar("padleft", parts[4]);
            SetAttribStar("alignvert", parts[5]);
        }

        // font: fontfamily, fontlook, fontsize
        InitAttribs(["fontfamily", "fontlook", "fontsize"]);
        if (attribs.defaultfont) {
            parts = sheet.fonts[attribs.defaultfont].match(
                /^(\*|\S+? \S+?) (\S+?) (\S.*)$/
            );
            SetAttribStar("fontfamily", parts[3]);
            SetAttribStar("fontsize", parts[2]);
            SetAttribStar("fontlook", parts[1]);
        }

        // color: textcolor
        InitAttrib("textcolor");
        if (attribs.defaultcolor) {
            SetAttrib("textcolor", sheet.colors[attribs.defaultcolor]);
        }

        // bgcolor: bgcolor
        InitAttrib("bgcolor");
        if (attribs.defaultbgcolor) {
            SetAttrib("bgcolor", sheet.colors[attribs.defaultbgcolor]);
        }

        // formatting: numberformat, textformat
        InitAttribs(["numberformat", "textformat"]);
        if (attribs.defaultnontextvalueformat) {
            SetAttrib(
                "numberformat",
                sheet.valueformats[attribs.defaultnontextvalueformat]
            );
        }
        if (attribs.defaulttextvalueformat) {
            SetAttrib(
                "textformat",
                sheet.valueformats[attribs.defaulttextvalueformat]
            );
        }

        // recalc: recalc
        InitAttrib("recalc");
        if (attribs.recalc) {
            SetAttrib("recalc", attribs.recalc);
        }

        return result;
    };

    /**
     * Decodes cell attributes from object format back to sheet commands
     * 
     * Takes cell attributes in an object format and returns the sheet commands
     * to make the actual attributes correspond to the desired values.
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet containing the cell
     * @param {string} coord - The cell coordinate (e.g., "A1")
     * @param {Object} newattribs - New attributes in {def: boolean, val: string} format
     * @param {string} [range] - Optional range to apply commands to (instead of single cell)
     * @returns {string|null} Command string to execute, or null if no changes needed
     * 
     * @example
     * const commands = SocialCalc.DecodeCellAttributes(sheet, "A1", {
     *   alignhoriz: {def: false, val: "center"},
     *   textcolor: {def: false, val: "rgb(255,0,0)"}
     * });
     * // Returns: "set A1 cellformat center\nset A1 color rgb(255,0,0)"
     */
    SocialCalc.DecodeCellAttributes = function (sheet, coord, newattribs, range) {
        let value, b, bb;
        const cell = sheet.GetAssuredCell(coord);
        let changed = false;
        let cmdstr = "";

        /**
         * Check if an attribute has changed and add command if needed
         * @param {string} attribname - Name of the attribute to check
         * @param {string} oldval - Current value of the attribute
         * @param {string} cmdname - Command name to use if change is needed
         */
        const CheckChanges = (attribname, oldval, cmdname) => {
            let val;
            if (newattribs[attribname]) {
                if (newattribs[attribname].def) {
                    val = "";
                } else {
                    val = newattribs[attribname].val;
                }
                if (val !== (oldval || "")) {
                    DoCmd(`${cmdname} ${val}`);
                }
            }
        };

        /**
         * Add a command to the command string
         * @param {string} str - Command to add
         */
        const DoCmd = (str) => {
            if (cmdstr) cmdstr += "\n";
            cmdstr += `set ${range || coord} ${str}`;
            changed = true;
        };

        // cellformat: alignhoriz
        CheckChanges(
            "alignhoriz",
            sheet.cellformats[cell.cellformat],
            "cellformat"
        );

        // layout: alignvert, padtop, padright, padbottom, padleft
        if (
            !newattribs.alignvert.def ||
            !newattribs.padtop.def ||
            !newattribs.padright.def ||
            !newattribs.padbottom.def ||
            !newattribs.padleft.def
        ) {
            value = `padding:${newattribs.padtop.def ? "* " : `${newattribs.padtop.val} `
                }${newattribs.padright.def ? "* " : `${newattribs.padright.val} `
                }${newattribs.padbottom.def ? "* " : `${newattribs.padbottom.val} `
                }${newattribs.padleft.def ? "*" : newattribs.padleft.val
                };vertical-align:${newattribs.alignvert.def ? "*;" : `${newattribs.alignvert.val};`
                }`;
        } else {
            value = "";
        }

        if (value !== (sheet.layouts[cell.layout] || "")) {
            DoCmd(`layout ${value}`);
        }

        // font: fontfamily, fontlook, fontsize
        if (
            !newattribs.fontlook.def ||
            !newattribs.fontsize.def ||
            !newattribs.fontfamily.def
        ) {
            value = `${newattribs.fontlook.def ? "* " : `${newattribs.fontlook.val} `
                }${newattribs.fontsize.def ? "* " : `${newattribs.fontsize.val} `
                }${newattribs.fontfamily.def ? "*" : newattribs.fontfamily.val
                }`;
        } else {
            value = "";
        }

        if (value !== (sheet.fonts[cell.font] || "")) {
            DoCmd(`font ${value}`);
        }

        // color: textcolor
        CheckChanges("textcolor", sheet.colors[cell.color], "color");

        // bgcolor: bgcolor
        CheckChanges("bgcolor", sheet.colors[cell.bgcolor], "bgcolor");

        // formatting: numberformat, textformat
        CheckChanges(
            "numberformat",
            sheet.valueformats[cell.nontextvalueformat],
            "nontextvalueformat"
        );

        CheckChanges(
            "textformat",
            sheet.valueformats[cell.textvalueformat],
            "textvalueformat"
        );

        // merges: colspan, rowspan - NOT HANDLED: IGNORED!

        // borders: bX for X = t, r, b, and l; bXthickness, bXstyle, bXcolor ignored
        for (let i = 0; i < 4; i++) {
            b = "trbl".charAt(i);
            bb = `b${b}`;
            CheckChanges(bb, sheet.borderstyles[cell[bb]], bb);
        }

        // misc: cssc, csss, mod
        CheckChanges("cssc", cell.cssc, "cssc");
        CheckChanges("csss", cell.csss, "csss");

        if (newattribs.mod) {
            if (newattribs.mod.def) {
                value = "n";
            } else {
                value = newattribs.mod.val;
            }
            if (value !== (cell.mod || "n")) {
                if (value === "n") value = ""; // restrict to "y" and "" normally
                DoCmd(`mod ${value}`);
            }
        }

        // Return command string if any changes were made
        if (changed) {
            return cmdstr;
        } else {
            return null;
        }
    };
    /**
     * Sheet attributes decoding and command execution system
     * 
     * @fileoverview Functions for decoding sheet attributes and managing command execution with timeslicing
     */

    /**
     * Decodes sheet-level attributes from object format back to sheet commands
     * 
     * Takes sheet attributes in an object format and returns the commands
     * to make the actual sheet attributes correspond to the desired values.
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet to modify
     * @param {Object} newattribs - New attributes in {def: boolean, val: string} format
     * @returns {string|null} Command string to execute, or null if no changes needed
     * 
     * @example
     * const commands = SocialCalc.DecodeSheetAttributes(sheet, {
     *   colwidth: {def: false, val: "100"},
     *   textcolor: {def: false, val: "rgb(0,0,255)"}
     * });
     * // Returns: "set sheet defaultcolwidth 100\nset sheet defaultcolor rgb(0,0,255)"
     */
    SocialCalc.DecodeSheetAttributes = function (sheet, newattribs) {
        let value;
        const attribs = sheet.attribs;
        let changed = false;
        let cmdstr = "";

        /**
         * Check if a sheet attribute has changed and add command if needed
         * @param {string} attribname - Name of the attribute to check
         * @param {string} oldval - Current value of the attribute
         * @param {string} cmdname - Command name to use if change is needed
         */
        const CheckChanges = (attribname, oldval, cmdname) => {
            let val;
            if (newattribs[attribname]) {
                if (newattribs[attribname].def) {
                    val = "";
                } else {
                    val = newattribs[attribname].val;
                }
                if (val !== (oldval || "")) {
                    DoCmd(`${cmdname} ${val}`);
                }
            }
        };

        /**
         * Add a sheet command to the command string
         * @param {string} str - Command to add
         */
        const DoCmd = (str) => {
            if (cmdstr) cmdstr += "\n";
            cmdstr += `set sheet ${str}`;
            changed = true;
        };

        // sizes: colwidth, rowheight
        CheckChanges("colwidth", attribs.defaultcolwidth, "defaultcolwidth");
        CheckChanges("rowheight", attribs.defaultrowheight, "defaultrowheight");

        // cellformat: textalignhoriz, numberalignhoriz
        CheckChanges(
            "textalignhoriz",
            sheet.cellformats[attribs.defaulttextformat],
            "defaulttextformat"
        );

        CheckChanges(
            "numberalignhoriz",
            sheet.cellformats[attribs.defaultnontextformat],
            "defaultnontextformat"
        );

        // layout: alignvert, padtop, padright, padbottom, padleft
        if (
            !newattribs.alignvert.def ||
            !newattribs.padtop.def ||
            !newattribs.padright.def ||
            !newattribs.padbottom.def ||
            !newattribs.padleft.def
        ) {
            value = `padding:${newattribs.padtop.def ? "* " : `${newattribs.padtop.val} `
                }${newattribs.padright.def ? "* " : `${newattribs.padright.val} `
                }${newattribs.padbottom.def ? "* " : `${newattribs.padbottom.val} `
                }${newattribs.padleft.def ? "*" : newattribs.padleft.val
                };vertical-align:${newattribs.alignvert.def ? "*;" : `${newattribs.alignvert.val};`
                }`;
        } else {
            value = "";
        }

        if (value !== (sheet.layouts[attribs.defaultlayout] || "")) {
            DoCmd(`defaultlayout ${value}`);
        }

        // font: fontfamily, fontlook, fontsize
        if (
            !newattribs.fontlook.def ||
            !newattribs.fontsize.def ||
            !newattribs.fontfamily.def
        ) {
            value = `${newattribs.fontlook.def ? "* " : `${newattribs.fontlook.val} `
                }${newattribs.fontsize.def ? "* " : `${newattribs.fontsize.val} `
                }${newattribs.fontfamily.def ? "*" : newattribs.fontfamily.val
                }`;
        } else {
            value = "";
        }

        if (value !== (sheet.fonts[attribs.defaultfont] || "")) {
            DoCmd(`defaultfont ${value}`);
        }

        // color: textcolor
        CheckChanges(
            "textcolor",
            sheet.colors[attribs.defaultcolor],
            "defaultcolor"
        );

        // bgcolor: bgcolor
        CheckChanges(
            "bgcolor",
            sheet.colors[attribs.defaultbgcolor],
            "defaultbgcolor"
        );

        // formatting: numberformat, textformat
        CheckChanges(
            "numberformat",
            sheet.valueformats[attribs.defaultnontextvalueformat],
            "defaultnontextvalueformat"
        );

        CheckChanges(
            "textformat",
            sheet.valueformats[attribs.defaulttextvalueformat],
            "defaulttextvalueformat"
        );

        // recalc: recalc
        CheckChanges("recalc", sheet.attribs.recalc, "recalc");

        // Return command string if any changes were made
        if (changed) {
            return cmdstr;
        } else {
            return null;
        }
    };

    // *************************************
    //
    // Sheet command routines
    //
    // *************************************

    /**
     * Sheet Command Information object
     * Contains state and configuration for sheet command execution
     * 
     * @namespace
     * @property {SocialCalc.Sheet|null} sheetobj - Sheet being operated on
     * @property {SocialCalc.Parse|null} parseobj - Parse object with command string
     * @property {number|null} timerobj - Timer ID used for timeslicing
     * @property {number} firsttimerdelay - Initial delay before starting commands (ms)
     * @property {number} timerdelay - Delay between command slices (ms)  
     * @property {number} maxtimeslice - Maximum time per slice before yielding (ms)
     * @property {boolean} saveundo - Whether to save undo information
     * @property {Object} CmdExtensionCallbacks - Extension command callbacks
     * @property {string} cmdextensionbusy - Command extension busy flag
     */
    SocialCalc.SheetCommandInfo = {
        // Core execution state
        sheetobj: null,
        parseobj: null,
        timerobj: null,

        // Timing configuration
        firsttimerdelay: 50,  // Wait before starting commands (for Chrome compatibility)
        timerdelay: 1,        // Wait between slices
        maxtimeslice: 100,    // Maximum milliseconds per slice

        // Execution options
        saveundo: false,

        // Extension system
        /**
         * Command extension callbacks registry
         * Format: { cmdname: { func: function(cmdname, data, sheet, parseobj, saveundo), data: any } }
         */
        CmdExtensionCallbacks: {},

        /**
         * Command extension busy flag
         * If length > 0, command loop waits for SocialCalc.ResumeFromCmdExtension()
         */
        cmdextensionbusy: "",
    };

    /**
     * Schedules sheet commands for execution with timeslicing
     * 
     * Commands are executed asynchronously to prevent UI blocking.
     * Status callbacks are called at the beginning (cmdstart) and end (cmdend).
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet to execute commands on
     * @param {string} cmdstr - Command string to execute (commands separated by newlines)
     * @param {boolean} saveundo - Whether to save undo information
     * @param {boolean} [isRemote] - Whether this is a remote command (affects broadcasting)
     * 
     * @example
     * SocialCalc.ScheduleSheetCommands(sheet, "set A1 value 42\nset B1 formula A1*2", true);
     */
    SocialCalc.ScheduleSheetCommands = function (sheet, cmdstr, saveundo, isRemote) {
        // Broadcast command to other clients if not remote and broadcasting is enabled
        if (SocialCalc.Callbacks.broadcast && !isRemote) {
            // Skip broadcasting certain commands
            const skipCommands = [
                "redisplay",
                "set sheet defaulttextvalueformat text-wiki",
                "recalc"
            ];

            if (!skipCommands.includes(cmdstr)) {
                SocialCalc.Callbacks.broadcast("execute", {
                    cmdtype: "scmd",
                    id: sheet.sheetid,
                    cmdstr: cmdstr,
                    saveundo: saveundo,
                });
            }
        }

        const sci = SocialCalc.SheetCommandInfo;

        // Initialize command execution state
        sci.sheetobj = sheet;
        sci.parseobj = new SocialCalc.Parse(cmdstr);
        sci.saveundo = saveundo;

        // Notify status callback of command start
        if (sci.sheetobj.statuscallback) {
            sheet.statuscallback(
                sci,
                "cmdstart",
                "",
                sci.sheetobj.statuscallbackparams
            );
        }

        // Add undo checkpoint if requested
        if (sci.saveundo) {
            sci.sheetobj.changes.PushChange(""); // Add step to undo stack
        }

        // Start command execution timer
        sci.timerobj = window.setTimeout(
            SocialCalc.SheetCommandsTimerRoutine,
            sci.firsttimerdelay
        );
    };

    /**
     * Timer routine for executing sheet commands in time slices
     * 
     * Processes commands in chunks to avoid blocking the UI. If a command takes too long,
     * execution is paused and resumed in the next timer cycle.
     * 
     * @private
     */
    SocialCalc.SheetCommandsTimerRoutine = function () {
        let errortext;
        const sci = SocialCalc.SheetCommandInfo;
        const starttime = new Date();

        sci.timerobj = null;

        // Process commands until EOF or time limit reached
        while (!sci.parseobj.EOF()) {
            // Execute next command
            errortext = SocialCalc.ExecuteSheetCommand(
                sci.sheetobj,
                sci.parseobj,
                sci.saveundo
            );

            if (errortext) alert(errortext);
            sci.parseobj.NextLine();

            // Check if command extension is busy (forced wait)
            if (sci.cmdextensionbusy.length > 0) {
                if (sci.sheetobj.statuscallback) {
                    sci.sheetobj.statuscallback(
                        sci,
                        "cmdextension",
                        sci.cmdextensionbusy,
                        sci.sheetobj.statuscallbackparams
                    );
                }
                return;
            }

            // Check if time slice exceeded - yield CPU if needed
            if (new Date() - starttime >= sci.maxtimeslice) {
                sci.timerobj = window.setTimeout(
                    SocialCalc.SheetCommandsTimerRoutine,
                    sci.timerdelay
                );
                return;
            }
        }

        // All commands completed - notify callback
        if (sci.sheetobj.statuscallback) {
            sci.sheetobj.statuscallback(
                sci,
                "cmdend",
                "",
                sci.sheetobj.statuscallbackparams
            );
        }
    };

    /**
     * Resume command execution after command extension completes
     * 
     * Called by command extensions when they finish processing to resume
     * the main command execution loop.
     * 
     * @example
     * // In a command extension:
     * setTimeout(() => {
     *   // Extension work complete
     *   SocialCalc.ResumeFromCmdExtension();
     * }, 1000);
     */
    SocialCalc.ResumeFromCmdExtension = function () {
        const sci = SocialCalc.SheetCommandInfo;
        sci.cmdextensionbusy = "";
        SocialCalc.SheetCommandsTimerRoutine();
    };

    /**
 * Sheet command execution engine
 * 
 * @fileoverview Core function for executing sheet modification commands with undo support
 */

    /**
     * Executes commands that modify sheet data
     * 
     * Processes commands in various formats to modify sheet data, attributes, and structure.
     * Automatically sets "needsrecalc" and "changedrendervalues" flags as needed.
     * Supports undo functionality when saveundo is true.
     * 
     * @param {SocialCalc.Sheet} sheet - The sheet to execute commands on
     * @param {SocialCalc.Parse} cmd - Parse object containing the command to execute
     * @param {boolean} saveundo - Whether to save undo information
     * @returns {string} Error text if command failed, empty string if successful
     * 
     * @description Supported command formats:
     * - set sheet attributename value (plus lastcol and lastrow)
     * - set 22 attributename value (row attributes)
     * - set B attributename value (column attributes)
     * - set A1 attributename value1 value2... (cell attributes)
     * - set A1:B5 attributename value1 value2... (range attributes)
     * - erase/copy/cut/paste/fillright/filldown A1:B5 all/formulas/format
     * - loadclipboard save-encoded-clipboard-data
     * - clearclipboard
     * - merge C3:F3 / unmerge C3
     * - insertcol/insertrow/deletecol/deleterow C5 or C5:E7
     * - movepaste/moveinsert A1:B5 A8 all/formulas/format
     * - sort cr1:cr2 col1 up/down col2 up/down col3 up/down
     * - name define/desc/delete NAME [definition/description]
     * - recalc / redisplay / changedrendervalues
     * - startcmdextension extension rest-of-command
     * 
     * @note The cmd string may contain multiple commands separated by newlines.
     * Only one "step" is put on the undo stack representing all commands.
     * Text values are encoded: newline => \n, \ => \b, : => \c
     */
    SocialCalc.ExecuteSheetCommand = function (sheet, cmd, saveundo) {
        let cmdstr, cmd1, rest, what, attrib, num, pos, pos2, errortext, undostart, val;
        let cr1, cr2, col, row, cr, cell, newcell;
        let fillright, rowstart, colstart, crbase, rowoffset, coloffset, basecell;
        let clipsheet, cliprange, numcols, numrows, attribtable;
        let colend, rowend, newcolstart, newrowstart, newcolend, newrowend, rownext, colnext, colthis, cellnext;
        let lastrow, lastcol, rowbefore, colbefore, oldformula, oldcr;
        let cols, dirs, lastsortcol, i, sortlist, sortcells, sortvalues, sorttypes;
        let slen, valtype, originalrow, sortedcr;
        let name, v1, v2;
        let cmdextension;

        // Get references to commonly used objects
        const attribs = sheet.attribs;
        const changes = sheet.changes;
        const cellProperties = SocialCalc.CellProperties;
        const scc = SocialCalc.Constants;

        /**
         * Parse a range string and update sheet dimensions
         * @private
         */
        const ParseRange = () => {
            const prange = SocialCalc.ParseRange(what);
            cr1 = prange.cr1;
            cr2 = prange.cr2;
            if (cr2.col > attribs.lastcol) attribs.lastcol = cr2.col;
            if (cr2.row > attribs.lastrow) attribs.lastrow = cr2.row;
        };

        errortext = "";

        // Get the full command string for undo purposes
        cmdstr = cmd.RestOfStringNoMove();
        if (saveundo) {
            sheet.changes.AddDo(cmdstr);
        }

        // Parse the first token to determine command type
        cmd1 = cmd.NextToken();

        switch (cmd1) {
            case "set":
                what = cmd.NextToken();
                attrib = cmd.NextToken();
                rest = cmd.RestOfString();
                undostart = `set ${what} ${attrib}`;

                if (what === "sheet") {
                    // Sheet-level attribute commands
                    sheet.renderneeded = true;

                    switch (attrib) {
                        case "defaultcolwidth":
                            if (saveundo) changes.AddUndo(undostart, attribs[attrib]);
                            attribs[attrib] = rest;
                            break;

                        case "defaultcolor":
                        case "defaultbgcolor":
                            if (saveundo) {
                                changes.AddUndo(
                                    undostart,
                                    sheet.GetStyleString("color", attribs[attrib])
                                );
                            }
                            attribs[attrib] = sheet.GetStyleNum("color", rest);
                            break;

                        case "defaultlayout":
                            if (saveundo) {
                                changes.AddUndo(
                                    undostart,
                                    sheet.GetStyleString("layout", attribs[attrib])
                                );
                            }
                            attribs[attrib] = sheet.GetStyleNum("layout", rest);
                            break;

                        case "defaultfont":
                            if (saveundo) {
                                changes.AddUndo(
                                    undostart,
                                    sheet.GetStyleString("font", attribs[attrib])
                                );
                            }
                            if (rest === "* * *") rest = ""; // All default
                            attribs[attrib] = sheet.GetStyleNum("font", rest);
                            break;

                        case "defaulttextformat":
                        case "defaultnontextformat":
                            if (saveundo) {
                                changes.AddUndo(
                                    undostart,
                                    sheet.GetStyleString("cellformat", attribs[attrib])
                                );
                            }
                            attribs[attrib] = sheet.GetStyleNum("cellformat", rest);
                            break;

                        case "defaulttextvalueformat":
                        case "defaultnontextvalueformat":
                            if (saveundo) {
                                changes.AddUndo(
                                    undostart,
                                    sheet.GetStyleString("valueformat", attribs[attrib])
                                );
                            }
                            attribs[attrib] = sheet.GetStyleNum("valueformat", rest);

                            // Clear all cached display strings when format changes
                            for (cr in sheet.cells) {
                                delete sheet.cells[cr].displaystring;
                            }
                            break;

                        case "lastcol":
                        case "lastrow":
                            if (saveundo) changes.AddUndo(undostart, attribs[attrib] - 0);
                            num = rest - 0;
                            if (typeof num === "number") {
                                attribs[attrib] = num > 0 ? num : 1;
                            }
                            break;

                        case "recalc":
                            if (saveundo) changes.AddUndo(undostart, attribs[attrib]);
                            if (rest === "off") {
                                attribs.recalc = rest; // Manual recalc, not auto
                            } else {
                                // All values other than "off" mean "on"
                                delete attribs.recalc;
                            }
                            break;

                        default:
                            errortext = scc.s_escUnknownSheetCmd + cmdstr;
                            break;
                    }
                } else if (/(^[A-Z])([A-Z])?(:[A-Z][A-Z]?){0,1}$/i.test(what)) {
                    // Column attribute commands (e.g., "set A width 100" or "set A:C width 100")
                    sheet.renderneeded = true;
                    what = what.toUpperCase();
                    pos = what.indexOf(":");

                    if (pos >= 0) {
                        // Range of columns
                        cr1 = SocialCalc.coordToCr(what.substring(0, pos) + "1");
                        cr2 = SocialCalc.coordToCr(what.substring(pos + 1) + "1");
                    } else {
                        // Single column
                        cr1 = SocialCalc.coordToCr(what + "1");
                        cr2 = cr1;
                    }

                    // Apply attribute to all columns in range
                    for (col = cr1.col; col <= cr2.col; col++) {
                        if (attrib === "width") {
                            cr = SocialCalc.rcColname(col);
                            if (saveundo) {
                                changes.AddUndo(
                                    `set ${cr} width`,
                                    sheet.colattribs.width[cr]
                                );
                            }
                            if (rest.length > 0) {
                                sheet.colattribs.width[cr] = rest;
                            } else {
                                delete sheet.colattribs.width[cr];
                            }
                        }
                    }
                }

                // Row attributes handling would go here (currently marked with !!!!! comment)
                else if (/([a-z]){0,1}(\d+)/i.test(what)) {
            // Cell and range attribute commands
            ParseRange();

            // Determine rendering optimization scope
            if (
                cr1.row !== cr2.row ||
                cr1.col !== cr2.col ||
                sheet.celldisplayneeded ||
                sheet.renderneeded
            ) {
                // Multi-cell operation or existing render needs
                sheet.renderneeded = true;
                sheet.celldisplayneeded = "";
            } else {
                // Single cell optimization
                sheet.celldisplayneeded = SocialCalc.crToCoord(cr1.col, cr1.row);
            }

            // Process all cells in the specified range
            for (row = cr1.row; row <= cr2.row; row++) {
                for (col = cr1.col; col <= cr2.col; col++) {
                    cr = SocialCalc.crToCoord(col, row);
                    cell = sheet.GetAssuredCell(cr);

                    if (saveundo) {
                        changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                    }

                    /**
                     * Process different cell attribute types
                     */
                    switch (attrib) {
                        case "value":
                            // set coord value type numeric-value
                            pos = rest.indexOf(" ");
                            cell.datavalue = rest.substring(pos + 1) - 0;
                            delete cell.errors;
                            cell.datatype = "v";
                            cell.valuetype = rest.substring(0, pos);
                            delete cell.displaystring;
                            delete cell.parseinfo;
                            attribs.needsrecalc = "yes";
                            break;

                        case "text":
                            // set coord text type text-value
                            pos = rest.indexOf(" ");
                            cell.datavalue = SocialCalc.decodeFromSave(
                                rest.substring(pos + 1)
                            );
                            delete cell.errors;
                            cell.datatype = "t";
                            cell.valuetype = rest.substring(0, pos);
                            delete cell.displaystring;
                            delete cell.parseinfo;
                            attribs.needsrecalc = "yes";
                            break;

                        case "formula":
                            // set coord formula formula-body-less-initial-=
                            cell.datavalue = 0; // Until recalc
                            delete cell.errors;
                            cell.datatype = "f";
                            cell.valuetype = "e#N/A"; // Until recalc
                            cell.formula = rest;
                            delete cell.displaystring;
                            delete cell.parseinfo;
                            attribs.needsrecalc = "yes";
                            break;

                        case "constant":
                            // set coord constant type numeric-value source-text
                            pos = rest.indexOf(" ");
                            pos2 = rest.substring(pos + 1).indexOf(" ");
                            cell.datavalue = rest.substring(pos + 1, pos + 1 + pos2) - 0;
                            cell.valuetype = rest.substring(0, pos);

                            if (cell.valuetype.charAt(0) === "e") {
                                // Error value
                                cell.errors = cell.valuetype.substring(1);
                            } else {
                                delete cell.errors;
                            }

                            cell.datatype = "c";
                            cell.formula = rest.substring(pos + pos2 + 2);
                            delete cell.displaystring;
                            delete cell.parseinfo;
                            attribs.needsrecalc = "yes";
                            break;

                        case "empty":
                            // Erase value
                            cell.datavalue = "";
                            delete cell.errors;
                            cell.datatype = null;
                            cell.formula = "";
                            cell.valuetype = "b";
                            delete cell.displaystring;
                            delete cell.parseinfo;
                            attribs.needsrecalc = "yes";
                            break;

                        case "all":
                            // set coord all :this:val1:that:val2...
                            if (rest.length > 0) {
                                cell = new SocialCalc.Cell(cr);
                                sheet.CellFromStringParts(cell, rest.split(":"), 1);
                                sheet.cells[cr] = cell;
                            } else {
                                delete sheet.cells[cr];
                            }
                            attribs.needsrecalc = "yes";
                            break;

                        default:
                            // Handle formatting and style attributes
                            if (/^b[trbl]$/.test(attrib)) {
                                // Border attributes (bt, br, bb, bl)
                                cell[attrib] = sheet.GetStyleNum("borderstyle", rest);
                                sheet.renderneeded = true; // Affects more than just one cell
                            } else if (attrib === "color" || attrib === "bgcolor") {
                                cell[attrib] = sheet.GetStyleNum("color", rest);
                            } else if (attrib === "layout" || attrib === "cellformat") {
                                cell[attrib] = sheet.GetStyleNum(attrib, rest);
                            } else if (attrib === "font") {
                                // set coord font style weight size family
                                if (rest === "* * *") rest = "";
                                cell[attrib] = sheet.GetStyleNum("font", rest);
                            } else if (
                                attrib === "textvalueformat" ||
                                attrib === "nontextvalueformat"
                            ) {
                                cell[attrib] = sheet.GetStyleNum("valueformat", rest);
                                delete cell.displaystring;
                            } else if (attrib === "cssc") {
                                rest = rest.replace(/[^a-zA-Z0-9\-]/g, "");
                                cell.cssc = rest;
                            } else if (attrib === "csss") {
                                rest = rest.replace(/\n/g, "");
                                cell.csss = rest;
                            } else if (attrib === "mod") {
                                rest = rest.replace(/[^yY]/g, "").toLowerCase();
                                cell.mod = rest;
                            } else if (attrib === "comment") {
                                cell.comment = SocialCalc.decodeFromSave(rest);
                            } else {
                                errortext = scc.s_escUnknownSetCoordCmd + cmdstr;
                            }
                            break;
                    }
                }
            }
        }
        break;

        /**
         * Merge cells command
         * @example merge C3:F3
         */
            case "merge":
                sheet.renderneeded = true;
                what = cmd.NextToken();
                rest = cmd.RestOfString();
                ParseRange();
                cell = sheet.GetAssuredCell(cr1.coord);

                if (saveundo) changes.AddUndo(`unmerge ${cr1.coord}`);

                if (cr2.col > cr1.col) cell.colspan = cr2.col - cr1.col + 1;
                else delete cell.colspan;

                if (cr2.row > cr1.row) cell.rowspan = cr2.row - cr1.row + 1;
                else delete cell.rowspan;

                sheet.changedrendervalues = true;
                break;

        /**
         * Unmerge cells command
         * @example unmerge C3
         */
        case "unmerge":
            sheet.renderneeded = true;
            what = cmd.NextToken();
            rest = cmd.RestOfString();
            ParseRange();
            cell = sheet.GetAssuredCell(cr1.coord);

            if (saveundo) {
                changes.AddUndo(
                    `merge ${cr1.coord}:${SocialCalc.crToCoord(
                        cr1.col + (cell.colspan || 1) - 1,
                        cr1.row + (cell.rowspan || 1) - 1
                    )}`
                );
            }

            delete cell.colspan;
            delete cell.rowspan;
            sheet.changedrendervalues = true;
            break;

        /**
         * Erase or cut cells command
         * @example erase A1:B5 all
         * @example cut A1:B5 formulas
         */
        case "erase":
        case "cut":
            sheet.renderneeded = true;
            sheet.changedrendervalues = true;
            what = cmd.NextToken();
            rest = cmd.RestOfString();
            ParseRange();

            if (saveundo) changes.AddUndo("changedrendervalues");

            if (cmd1 === "cut") {
                // Save copy of whole thing before erasing
                if (saveundo) {
                    changes.AddUndo(
                        "loadclipboard",
                        SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard)
                    );
                }
                SocialCalc.Clipboard.clipboard = SocialCalc.CreateSheetSave(sheet, what);
            }

            // Process each cell in the range
            for (row = cr1.row; row <= cr2.row; row++) {
                for (col = cr1.col; col <= cr2.col; col++) {
                    cr = SocialCalc.crToCoord(col, row);
                    cell = sheet.GetAssuredCell(cr);

                    if (saveundo) {
                        changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                    }

                if (rest === "all") {
                    delete sheet.cells[cr];
                } else if (rest === "formulas") {
                    cell.datavalue = "";
                    cell.datatype = null;
                    cell.formula = "";
                    cell.valuetype = "b";
                    delete cell.errors;
                    delete cell.displaystring;
                    delete cell.parseinfo;
                    if (cell.comment) {
                        // Comments are considered content for erasing
                        delete cell.comment;
                    }
                } else if (rest === "formats") {
                    newcell = new SocialCalc.Cell(cr); // Create new cell without attributes
                    // Copy existing values
                    newcell.datavalue = cell.datavalue;
                    newcell.datatype = cell.datatype;
                    newcell.formula = cell.formula;
                    newcell.valuetype = cell.valuetype;
                    if (cell.comment) {
                        newcell.comment = cell.comment;
                    }
                    sheet.cells[cr] = newcell; // Replace
                }
            }
        }
        attribs.needsrecalc = "yes";
        break;

        /**
         * Fill right or fill down commands
         * @example fillright A1:C1 all
         * @example filldown A1:A3 formulas
         */
        case "fillright":
        case "filldown":
            sheet.renderneeded = true;
            sheet.changedrendervalues = true;
            if (saveundo) changes.AddUndo("changedrendervalues");

            what = cmd.NextToken();
            rest = cmd.RestOfString();
            ParseRange();

            if (cmd1 === "fillright") {
                fillright = true;
            rowstart = cr1.row;
            colstart = cr1.col + 1;
        } else {
            fillright = false;
            rowstart = cr1.row + 1;
            colstart = cr1.col;
        }

        for (row = rowstart; row <= cr2.row; row++) {
            for (col = colstart; col <= cr2.col; col++) {
                cr = SocialCalc.crToCoord(col, row);
                cell = sheet.GetAssuredCell(cr);

                if (saveundo) {
                    changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                }

                if (fillright) {
                    crbase = SocialCalc.crToCoord(cr1.col, row);
                    coloffset = col - colstart + 1;
                    rowoffset = 0;
                } else {
                    crbase = SocialCalc.crToCoord(col, cr1.row);
                    coloffset = 0;
                    rowoffset = row - rowstart + 1;
                }

                basecell = sheet.GetAssuredCell(crbase);

                // Copy format attributes if requested
                if (rest === "all" || rest === "formats") {
                    for (attrib in cellProperties) {
                        if (cellProperties[attrib] === 1) continue; // Skip base properties
                        if (
                            typeof basecell[attrib] === "undefined" ||
                            cellProperties[attrib] === 3
                        ) {
                            delete cell[attrib];
                        } else {
                            cell[attrib] = basecell[attrib];
                        }
                    }
                }

                // Copy formulas and values if requested
                if (rest === "all" || rest === "formulas") {
                    cell.datavalue = basecell.datavalue;
                    cell.datatype = basecell.datatype;
                    cell.valuetype = basecell.valuetype;

                    if (cell.datatype === "f") {
                        // Offset relative coordinates, even in sheet references
                        cell.formula = SocialCalc.OffsetFormulaCoords(
                            basecell.formula,
                            coloffset,
                            rowoffset
                        );
                    } else {
                        cell.formula = basecell.formula;
                    }

                    delete cell.parseinfo;
                    cell.errors = basecell.errors;
                }

                delete cell.displaystring;
            }
        }

        attribs.needsrecalc = "yes";
        break;

        /**
         * Copy command - saves range to clipboard
         * @example copy A1:B5
         */
        case "copy":
            what = cmd.NextToken();
            rest = cmd.RestOfString();

            if (saveundo) {
                changes.AddUndo(
                    "loadclipboard",
                    SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard)
                );
            }

            SocialCalc.Clipboard.clipboard = SocialCalc.CreateSheetSave(sheet, what);
            break;

        /**
         * Load clipboard command
             * @example loadclipboard encoded-clipboard-data
             */
            case "loadclipboard":
        rest = cmd.RestOfString();

        if (saveundo) {
            changes.AddUndo(
                "loadclipboard",
                SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard)
            );
        }

        SocialCalc.Clipboard.clipboard = SocialCalc.decodeFromSave(rest);
        break;

            /**
             * Clear clipboard command
             */
            case "clearclipboard":
        if (saveundo) {
            changes.AddUndo(
                "loadclipboard",
                SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard)
            );
        }
        SocialCalc.Clipboard.clipboard = "";
        break;

            /**
             * Paste command - pastes clipboard contents to specified range
             * @example paste A1 all
             */
            case "paste":
        sheet.renderneeded = true;
        sheet.changedrendervalues = true;
        if (saveundo) changes.AddUndo("changedrendervalues");

        what = cmd.NextToken();
        rest = cmd.RestOfString();
        ParseRange();

        if (!SocialCalc.Clipboard.clipboard) {
            break;
        }

        // Load clipboard contents as another sheet
        clipsheet = new SocialCalc.Sheet();
        clipsheet.ParseSheetSave(SocialCalc.Clipboard.clipboard);
        cliprange = SocialCalc.ParseRange(clipsheet.copiedfrom);

        // Calculate offsets and dimensions
        coloffset = cr1.col - cliprange.cr1.col;
        rowoffset = cr1.row - cliprange.cr1.row;
        numcols = cliprange.cr2.col - cliprange.cr1.col + 1;
        numrows = cliprange.cr2.row - cliprange.cr1.row + 1;

        // Update sheet dimensions if necessary
        if (cr1.col + numcols - 1 > attribs.lastcol) {
            attribs.lastcol = cr1.col + numcols - 1;
        }
        if (cr1.row + numrows - 1 > attribs.lastrow) {
            attribs.lastrow = cr1.row + numrows - 1;
        }

        // Paste data to each cell in the target range
        for (row = cr1.row; row < cr1.row + numrows; row++) {
            for (col = cr1.col; col < cr1.col + numcols; col++) {
                cr = SocialCalc.crToCoord(col, row);
                cell = sheet.GetAssuredCell(cr);

                if (saveundo) {
                    changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                }

                crbase = SocialCalc.crToCoord(col - coloffset, row - rowoffset);
                basecell = clipsheet.GetAssuredCell(crbase);

                // Copy format attributes if requested
                if (rest === "all" || rest === "formats") {
                    for (attrib in cellProperties) {
                        if (cellProperties[attrib] === 1) continue; // Skip base properties
                        if (
                            typeof basecell[attrib] === "undefined" ||
                            cellProperties[attrib] === 3
                        ) {
                            delete cell[attrib];
                        } else {
                            attribtable = SocialCalc.CellPropertiesTable[attrib];
                            if (attribtable && basecell[attrib]) {
                                // Convert table indexes to strings since sheets may have different indexes
                                cell[attrib] = sheet.GetStyleNum(
                                    attribtable,
                                    clipsheet.GetStyleString(attribtable, basecell[attrib])
                                );
                            } else {
                                // Direct value copy for non-table indexes
                                cell[attrib] = basecell[attrib];
                            }
                        }
                    }
                }

                // Copy formulas and values if requested
                if (rest === "all" || rest === "formulas") {
                    cell.datavalue = basecell.datavalue;
                    cell.datatype = basecell.datatype;
                    cell.valuetype = basecell.valuetype;

                    if (cell.datatype === "f") {
                        // Offset relative coordinates, even in sheet references
                        cell.formula = SocialCalc.OffsetFormulaCoords(
                            basecell.formula,
                            coloffset,
                            rowoffset
                        );
                    } else {
                        cell.formula = basecell.formula;
                    }

                    delete cell.parseinfo;
                    cell.errors = basecell.errors;

                    // Handle comments
                    if (basecell.comment) {
                        // Comments are pasted as part of content
                        cell.comment = basecell.comment;
                    } else if (cell.comment) {
                        delete cell.comment;
                    }
                }

                delete cell.displaystring;
            }
        }

        attribs.needsrecalc = "yes";
        break;

            /**
             * Sort command
             * @example sort A1:C10 A up B down C up
             */
            case "sort":
        sheet.renderneeded = true;
        sheet.changedrendervalues = true;
        if (saveundo) changes.AddUndo("changedrendervalues");

        what = cmd.NextToken();
        ParseRange();

        // Get columns and sort directions
        cols = [];
        dirs = [];
        lastsortcol = 0;
        for (i = 0; i <= 3; i++) {
            cols[i] = cmd.NextToken();
            dirs[i] = cmd.NextToken();
            if (cols[i]) lastsortcol = i;
        }

        // Initialize sorting data structures
        sortcells = {}; // Copy of data to replace original in new order
        sortlist = []; // Array of 0, 1, ..., nrows-1 for sorting
        sortvalues = []; // Values to be sorted corresponding to sortlist
        sorttypes = []; // Basic types of the values

        // Fill in the sort information
        for (row = cr1.row; row <= cr2.row; row++) {
            // Copy all cell data for this row
            for (col = cr1.col; col <= cr2.col; col++) {
                cr = SocialCalc.crToCoord(col, row);
                cell = sheet.cells[cr];

                if (cell) {
                    // Only copy non-empty cells
                    sortcells[cr] = sheet.CellToString(cell);
                    if (saveundo) {
                        changes.AddUndo(`set ${cr} all`, sortcells[cr]);
                    }
                } else {
                    if (saveundo) changes.AddUndo(`set ${cr} all`);
                }
            }

            // Build sort arrays
            sortlist.push(sortlist.length);
            sortvalues.push([]);
            sorttypes.push([]);
            const slast = sorttypes.length - 1;

            // Get values for each sort column
            for (i = 0; i <= lastsortcol; i++) {
                cr = cols[i] + row; // Get coordinate on this row in sort column
                cell = sheet.GetAssuredCell(cr);
                val = cell.datavalue;
                valtype = cell.valuetype.charAt(0) || "b";

                // Convert text to lowercase for case-insensitive sorting
                if (valtype === "t") val = val.toLowerCase();

                sortvalues[slast].push(val);
                sorttypes[slast].push(valtype);
            }
        }
        /**
         * Custom sort comparison function for multi-column sorting
         * Handles all data type variations with proper precedence:
         * numbers < text < errors, blank always last regardless of direction
         * 
         * @param {number} a - First sort index
         * @param {number} b - Second sort index
         * @returns {number} -1, 0, or 1 for sort comparison
         */
        const sortfunction = (a, b) => {
            let i, a1, b1, ta, tb, cresult;

            // Compare each sort column in order
            for (i = 0; i <= lastsortcol; i++) {
                // Handle sort direction
                if (dirs[i] === "up") {
                    a1 = a;
                    b1 = b;
                } else {
                    a1 = b;
                    b1 = a;
                }

                ta = sorttypes[a1][i];
                tb = sorttypes[b1][i];

                if (ta === "t") {
                    // Text value comparisons
                    if (tb === "t") {
                        a1 = sortvalues[a1][i];
                        b1 = sortvalues[b1][i];
                        cresult = a1 > b1 ? 1 : a1 < b1 ? -1 : 0;
                    } else if (tb === "n") {
                        cresult = 1; // Text > numbers
                    } else if (tb === "b") {
                        cresult = dirs[i] === "up" ? -1 : 1; // Blank always last
                    } else if (tb === "e") {
                        cresult = -1; // Text < errors
                    }
                } else if (ta === "n") {
                    // Numeric value comparisons
                    if (tb === "t") {
                        cresult = -1; // Numbers < text
                    } else if (tb === "n") {
                        a1 = sortvalues[a1][i] - 0; // Force to numeric
                        b1 = sortvalues[b1][i] - 0;
                        cresult = a1 > b1 ? 1 : a1 < b1 ? -1 : 0;
                    } else if (tb === "b") {
                        cresult = dirs[i] === "up" ? -1 : 1; // Blank always last
                    } else if (tb === "e") {
                        cresult = -1; // Numbers < errors
                    }
                } else if (ta === "e") {
                    // Error value comparisons
                    if (tb === "e") {
                        a1 = sortvalues[a1][i];
                        b1 = sortvalues[b1][i];
                        cresult = a1 > b1 ? 1 : a1 < b1 ? -1 : 0;
                    } else if (tb === "b") {
                        cresult = dirs[i] === "up" ? -1 : 1; // Blank always last
                    } else {
                        cresult = 1; // Errors > everything else except blank
                    }
                } else if (ta === "b") {
                    // Blank value comparisons
                    if (tb === "b") {
                        cresult = 0; // Both blank
                    } else {
                        cresult = dirs[i] === "up" ? 1 : -1; // Blank always last
                    }
                }

                if (cresult) {
                    // Return if not equal, otherwise continue to next column
                    return cresult;
                }
            }

            // Equal values - maintain original order for stability
            cresult = a > b ? 1 : a < b ? -1 : 0;
            return cresult;
        };

        // Perform the sort
        sortlist.sort(sortfunction);

        // Copy original rows into sorted positions
        for (row = cr1.row; row <= cr2.row; row++) {
            originalrow = sortlist[row - cr1.row]; // Original position

            for (col = cr1.col; col <= cr2.col; col++) {
                cr = SocialCalc.crToCoord(col, row);
                sortedcr = SocialCalc.crToCoord(col, originalrow + cr1.row);

                if (sortcells[sortedcr]) {
                    cell = new SocialCalc.Cell(cr);
                    sheet.CellFromStringParts(cell, sortcells[sortedcr].split(":"), 1);

                    if (cell.datatype === "f") {
                        // Offset coordinate references, even relative coords in other sheets
                        cell.formula = SocialCalc.OffsetFormulaCoords(
                            cell.formula,
                            0,
                            row - cr1.row - originalrow
                        );
                    }

                    sheet.cells[cr] = cell;
                } else {
                    delete sheet.cells[cr];
                }
            }
        }

        attribs.needsrecalc = "yes";
        break;

/**
 * Insert column or row command
 * @example insertcol B - inserts column at B
 * @example insertrow 5 - inserts row at 5
 */
case "insertcol":
case "insertrow":
        sheet.renderneeded = true;
        sheet.changedrendervalues = true;
        what = cmd.NextToken();
        rest = cmd.RestOfString();
        ParseRange();

        // Set up parameters based on insert type
        if (cmd1 === "insertcol") {
            coloffset = 1;
            colend = cr1.col;
            rowoffset = 0;
            rowend = 1;
            newcolstart = cr1.col;
            newcolend = cr1.col;
            newrowstart = 1;
            newrowend = attribs.lastrow;
            if (saveundo) changes.AddUndo(`deletecol ${cr1.coord}`);
        } else {
            coloffset = 0;
            colend = 1;
            rowoffset = 1;
            rowend = cr1.row;
            newcolstart = 1;
            newcolend = attribs.lastcol;
            newrowstart = cr1.row;
            newrowend = cr1.row;
            if (saveundo) changes.AddUndo(`deleterow ${cr1.coord}`);
        }

        // Move existing cells to make room
        for (row = attribs.lastrow; row >= rowend; row--) {
            for (col = attribs.lastcol; col >= colend; col--) {
                crbase = SocialCalc.crToCoord(col, row);
                cr = SocialCalc.crToCoord(col + coloffset, row + rowoffset);

                if (!sheet.cells[crbase]) {
                    // Copying empty cell
                    delete sheet.cells[cr];
                } else {
                    // Move existing cell contents
                    sheet.cells[cr] = sheet.cells[crbase];
                }
            }
        }

        // Fill the new empty cells with format attributes from adjacent cells
        for (row = newrowstart; row <= newrowend; row++) {
            for (col = newcolstart; col <= newcolend; col++) {
                cr = SocialCalc.crToCoord(col, row);
                cell = new SocialCalc.Cell(cr);
                sheet.cells[cr] = cell;

                // Copy format attributes from adjacent cell
                crbase = SocialCalc.crToCoord(col - coloffset, row - rowoffset);
                basecell = sheet.GetAssuredCell(crbase);

                for (attrib in cellProperties) {
                    if (cellProperties[attrib] === 2) {
                        // Copy only format attributes
                        cell[attrib] = basecell[attrib];
                    }
                }
            }
        }

        // Update cell references in formulas
        for (cr in sheet.cells) {
            cell = sheet.cells[cr];
            if (cell && cell.datatype === "f") {
                cell.formula = SocialCalc.AdjustFormulaCoords(
                    cell.formula,
                    cr1.col,
                    coloffset,
                    cr1.row,
                    rowoffset
                );
            }
            if (cell) {
                delete cell.parseinfo;
            }
        }

        // Update named range definitions
        for (name in sheet.names) {
            if (sheet.names[name]) {
                v1 = sheet.names[name].definition;
                v2 = "";
                if (v1.charAt(0) === "=") {
                    v2 = "=";
                    v1 = v1.substring(1);
                }
                sheet.names[name].definition = v2 + SocialCalc.AdjustFormulaCoords(
                    v1,
                    cr1.col,
                    coloffset,
                    cr1.row,
                    rowoffset
                );
            }
        }

        // Copy row attributes for row insertion
        if (cmd1 === "insertrow") {
            for (row = attribs.lastrow; row >= rowend; row--) {
                rownext = row + rowoffset;
                for (attrib in sheet.rowattribs) {
                    val = sheet.rowattribs[attrib][row];
                    if (sheet.rowattribs[attrib][rownext] !== val) {
                        if (val) {
                            sheet.rowattribs[attrib][rownext] = val;
                        } else {
                            delete sheet.rowattribs[attrib][rownext];
                        }
                    }
                }
            }
        }

        // Copy column attributes for column insertion
        if (cmd1 === "insertcol") {
            for (col = attribs.lastcol; col >= colend; col--) {
                colthis = SocialCalc.rcColname(col);
                colnext = SocialCalc.rcColname(col + coloffset);
                for (attrib in sheet.colattribs) {
                    val = sheet.colattribs[attrib][colthis];
                    if (sheet.colattribs[attrib][colnext] !== val) {
                        if (val) {
                            sheet.colattribs[attrib][colnext] = val;
                        } else {
                            delete sheet.colattribs[attrib][colnext];
                        }
                    }
                }
            }
        }

        // Update sheet dimensions
        attribs.lastcol += coloffset;
        attribs.lastrow += rowoffset;
        attribs.needsrecalc = "yes";
        break;

/**
 * Delete column or row command
 * @example deletecol B:D - deletes columns B through D
 * @example deleterow 5:7 - deletes rows 5 through 7
 */
case "deletecol":
case "deleterow":
        sheet.renderneeded = true;
        sheet.changedrendervalues = true;
        what = cmd.NextToken();
        rest = cmd.RestOfString();

        // Save old values since ParseRange sets lastcol/lastrow
        lastcol = attribs.lastcol;
        lastrow = attribs.lastrow;
        ParseRange();

        // Set up parameters based on delete type
        if (cmd1 === "deletecol") {
            coloffset = cr1.col - cr2.col - 1; // Negative offset (shrinking)
            rowoffset = 0;
            colstart = cr2.col + 1;
            rowstart = 1;
        } else {
            coloffset = 0;
            rowoffset = cr1.row - cr2.row - 1; // Negative offset (shrinking)
            colstart = 1;
            rowstart = cr2.row + 1;
        }

        // Move cells backwards to fill deleted space
        for (row = rowstart; row <= lastrow - rowoffset; row++) {
            for (col = colstart; col <= lastcol - coloffset; col++) {
                cr = SocialCalc.crToCoord(col + coloffset, row + rowoffset);

                // Save cells being overwritten for undo
                if (saveundo &&
                    (row < rowstart - rowoffset || col < colstart - coloffset)) {
                    cell = sheet.cells[cr];
                    if (!cell) {
                        changes.AddUndo(`erase ${cr} all`);
                    } else {
                        changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                    }
                }

                crbase = SocialCalc.crToCoord(col, row);
                cell = sheet.cells[crbase];

                if (!cell) {
                    // Copying empty cell
                    delete sheet.cells[cr];
                } else {
                    // Move cell contents backward
                    sheet.cells[cr] = cell;
                }
            }
        }

        // Update cell references in formulas (may create #REF! errors)
        for (cr in sheet.cells) {
            cell = sheet.cells[cr];
            if (cell) {
                if (cell.datatype === "f") {
                    oldformula = cell.formula;
                    cell.formula = SocialCalc.AdjustFormulaCoords(
                        oldformula,
                        cr1.col,
                        coloffset,
                        cr1.row,
                        rowoffset
                    );

                    if (cell.formula !== oldformula) {
                        delete cell.parseinfo;
                        // Save old formula if it now contains #REF! errors
                        if (saveundo && cell.formula.indexOf("#REF!") !== -1) {
                            oldcr = SocialCalc.coordToCr(cr);
                            changes.AddUndo(
                                `set ${SocialCalc.rcColname(oldcr.col - coloffset)}${oldcr.row - rowoffset} formula ${oldformula}`
                            );
                        }
                    }
                } else {
                    delete cell.parseinfo;
                }
            }
        }

        // Update named range definitions
        for (name in sheet.names) {
            if (sheet.names[name]) {
                v1 = sheet.names[name].definition;
                v2 = "";
                if (v1.charAt(0) === "=") {
                    v2 = "=";
                    v1 = v1.substring(1);
                }
                sheet.names[name].definition = v2 + SocialCalc.AdjustFormulaCoords(
                    v1,
                    cr1.col,
                    coloffset,
                    cr1.row,
                    rowoffset
                );
            }
        }

        // Copy row attributes backward for row deletion
        if (cmd1 === "deleterow") {
            for (row = rowstart; row <= lastrow - rowoffset; row++) {
                rowbefore = row + rowoffset;
                for (attrib in sheet.rowattribs) {
                    val = sheet.rowattribs[attrib][row];
                    if (sheet.rowattribs[attrib][rowbefore] !== val) {
                        if (saveundo) {
                            changes.AddUndo(
                                `set ${rowbefore} ${attrib}`,
                                sheet.rowattribs[attrib][rowbefore]
                            );
                        }
                        if (val) {
                            sheet.rowattribs[attrib][rowbefore] = val;
                        } else {
                            delete sheet.rowattribs[attrib][rowbefore];
                        }
                    }
                }
            }
        }

        // Copy column attributes backward for column deletion
        if (cmd1 === "deletecol") {
            for (col = colstart; col <= lastcol - coloffset; col++) {
                colthis = SocialCalc.rcColname(col);
                colbefore = SocialCalc.rcColname(col + coloffset);
                for (attrib in sheet.colattribs) {
                    val = sheet.colattribs[attrib][colthis];
                    if (sheet.colattribs[attrib][colbefore] !== val) {
                        if (saveundo) {
                            changes.AddUndo(
                                `set ${colbefore} ${attrib}`,
                                sheet.colattribs[attrib][colbefore]
                            );
                        }
                        if (val) {
                            sheet.colattribs[attrib][colbefore] = val;
                        } else {
                            delete sheet.colattribs[attrib][colbefore];
                        }
                    }
                }
            }
        }

        // Set up undo commands for the deletion
        if (saveundo) {
            if (cmd1 === "deletecol") {
                for (col = cr1.col; col <= cr2.col; col++) {
                    changes.AddUndo(`insertcol ${SocialCalc.rcColname(col)}`);
                }
            } else {
                for (row = cr1.row; row <= cr2.row; row++) {
                    changes.AddUndo(`insertrow ${row}`);
                }
            }
        }

        // Update sheet dimensions
        if (cmd1 === "deletecol") {
            if (cr1.col <= lastcol) {
                // Shrink sheet unless deleted phantom columns off the end
                if (cr2.col <= lastcol) {
                    attribs.lastcol += coloffset;
                } else {
                    attribs.lastcol = cr1.col - 1;
                }
            }
        } else {
            if (cr1.row <= lastrow) {
                // Shrink sheet unless deleted phantom rows off the end
                if (cr2.row <= lastrow) {
                    attribs.lastrow += rowoffset;
                } else {
                    attribs.lastrow = cr1.row - 1;
                }
            }
        }

        attribs.needsrecalc = "yes";
        break;
/**
 * Move and insert commands for spreadsheet operations
 * 
 * @fileoverview Commands for moving cells with paste or insert behavior
 */

/**
 * Move paste or move insert command
 * Moves a range of cells to a new location with optional insertion behavior
 * 
 * @example movepaste A1:B2 D1 all
 * @example moveinsert A1:B2 D1 formulas
 */
case "movepaste":
case "moveinsert":
        let movingcells, dest, destcr, inserthoriz, insertvert, pushamount, movedto;

        sheet.renderneeded = true;
        sheet.changedrendervalues = true;
        if (saveundo) changes.AddUndo("changedrendervalues");

        what = cmd.NextToken();
        dest = cmd.NextToken();
        rest = cmd.RestOfString(); // rest is all/formulas/formats
        if (rest === "") rest = "all";

        ParseRange();
        destcr = SocialCalc.coordToCr(dest);

        // Calculate movement offsets and dimensions
        coloffset = destcr.col - cr1.col;
        rowoffset = destcr.row - cr1.row;
        numcols = cr2.col - cr1.col + 1;
        numrows = cr2.row - cr1.row + 1;

        // Get a copy of moving cells and erase from original location
        movingcells = {};

        for (row = cr1.row; row <= cr2.row; row++) {
            for (col = cr1.col; col <= cr2.col; col++) {
                cr = SocialCalc.crToCoord(col, row);
                cell = sheet.GetAssuredCell(cr);

                if (saveundo) {
                    changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                }

                if (!sheet.cells[cr]) {
                    // Skip empty cells
                    continue;
                }

                // Create copy of moving cell
                movingcells[cr] = new SocialCalc.Cell(cr);

                // Copy all properties based on move type
                for (attrib in cellProperties) {
                    if (typeof cell[attrib] === "undefined") {
                        continue;
                    }

                    movingcells[cr][attrib] = cell[attrib]; // Copy for potential moving

                    // Delete based on move type
                    if (rest === "all") {
                        delete cell[attrib];
                    } else if (rest === "formulas") {
                        if (cellProperties[attrib] === 1 || cellProperties[attrib] === 3) {
                            delete cell[attrib];
                        }
                    } else if (rest === "formats") {
                        if (cellProperties[attrib] === 2) {
                            delete cell[attrib];
                        }
                    }
                }

                if (rest === "formulas") {
                    // Leave pristine deleted cell
                    cell.datavalue = "";
                    cell.datatype = null;
                    cell.formula = "";
                    cell.valuetype = "b";
                }

                if (rest === "all") {
                    // Leave nothing for move all
                    delete sheet.cells[cr];
                }
            }
        }

        // Handle moveinsert logic - check destination and calculate pushing parameters
        if (cmd1 === "moveinsert") {
            inserthoriz = false;
            insertvert = false;

            if (rowoffset === 0 && (destcr.col < cr1.col || destcr.col > cr2.col)) {
                // Horizontal insertion
                if (destcr.col < cr1.col) {
                    // Moving left
                    pushamount = cr1.col - destcr.col;
                    inserthoriz = -1;
                } else {
                    // Moving right
                    destcr.col -= 1;
                    coloffset = destcr.col - cr2.col;
                    pushamount = destcr.col - cr2.col;
                    inserthoriz = 1;
                }
            } else if (coloffset === 0 && (destcr.row < cr1.row || destcr.row > cr2.row)) {
                // Vertical insertion
                if (destcr.row < cr1.row) {
                    // Moving up
                    pushamount = cr1.row - destcr.row;
                    insertvert = -1;
                } else {
                    // Moving down
                    destcr.row -= 1;
                    rowoffset = destcr.row - cr2.row;
                    pushamount = destcr.row - cr2.row;
                    insertvert = 1;
                }
            } else {
                // Not allowed - fallback to movepaste
                cmd1 = "movepaste";
            }
        }

        // Push any cells that need pushing for insertion
        movedto = {}; // Remember what was moved where

        if (insertvert) {
            for (row = 0; row < pushamount; row++) {
                for (col = cr1.col; col <= cr2.col; col++) {
                    let crbase, cr;

                    if (insertvert < 0) {
                        crbase = SocialCalc.crToCoord(col, destcr.row + pushamount - row - 1);
                        cr = SocialCalc.crToCoord(col, cr2.row - row);
                    } else {
                        crbase = SocialCalc.crToCoord(col, destcr.row - pushamount + row + 1);
                        cr = SocialCalc.crToCoord(col, cr1.row + row);
                    }

                    basecell = sheet.GetAssuredCell(crbase);
                    if (saveundo) {
                        changes.AddUndo(`set ${crbase} all`, sheet.CellToString(basecell));
                    }

                    cell = sheet.GetAssuredCell(cr);

                    // Copy format attributes if requested
                    if (rest === "all" || rest === "formats") {
                        for (attrib in cellProperties) {
                            if (cellProperties[attrib] === 1) continue; // Skip base properties
                            if (typeof basecell[attrib] === "undefined" || cellProperties[attrib] === 3) {
                                delete cell[attrib];
                            } else {
                                cell[attrib] = basecell[attrib];
                            }
                        }
                    }

                    // Copy formulas and values if requested
                    if (rest === "all" || rest === "formulas") {
                        cell.datavalue = basecell.datavalue;
                        cell.datatype = basecell.datatype;
                        cell.valuetype = basecell.valuetype;
                        cell.formula = basecell.formula;
                        delete cell.parseinfo;
                        cell.errors = basecell.errors;
                    }

                    delete cell.displaystring;
                    movedto[crbase] = cr; // Track movement
                }
            }
        }

        if (inserthoriz) {
            for (col = 0; col < pushamount; col++) {
                for (row = cr1.row; row <= cr2.row; row++) {
                    let crbase, cr;

                    if (inserthoriz < 0) {
                        crbase = SocialCalc.crToCoord(destcr.col + pushamount - col - 1, row);
                        cr = SocialCalc.crToCoord(cr2.col - col, row);
                    } else {
                        crbase = SocialCalc.crToCoord(destcr.col - pushamount + col + 1, row);
                        cr = SocialCalc.crToCoord(cr1.col + col, row);
                    }

                    basecell = sheet.GetAssuredCell(crbase);
                    if (saveundo) {
                        changes.AddUndo(`set ${crbase} all`, sheet.CellToString(basecell));
                    }

                    cell = sheet.GetAssuredCell(cr);

                    // Copy format attributes if requested
                    if (rest === "all" || rest === "formats") {
                        for (attrib in cellProperties) {
                            if (cellProperties[attrib] === 1) continue; // Skip base properties
                            if (typeof basecell[attrib] === "undefined" || cellProperties[attrib] === 3) {
                                delete cell[attrib];
                            } else {
                                cell[attrib] = basecell[attrib];
                            }
                        }
                    }

                    // Copy formulas and values if requested
                    if (rest === "all" || rest === "formulas") {
                        cell.datavalue = basecell.datavalue;
                        cell.datatype = basecell.datatype;
                        cell.valuetype = basecell.valuetype;
                        cell.formula = basecell.formula;
                        delete cell.parseinfo;
                        cell.errors = basecell.errors;
                    }

                    delete cell.displaystring;
                    movedto[crbase] = cr; // Track movement
                }
            }
        }

        // Paste moved cells into new location
        if (destcr.col + numcols - 1 > attribs.lastcol) {
            attribs.lastcol = destcr.col + numcols - 1;
        }
        if (destcr.row + numrows - 1 > attribs.lastrow) {
            attribs.lastrow = destcr.row + numrows - 1;
        }

        for (row = cr1.row; row < cr1.row + numrows; row++) {
            for (col = cr1.col; col < cr1.col + numcols; col++) {
                cr = SocialCalc.crToCoord(col + coloffset, row + rowoffset);
                cell = sheet.GetAssuredCell(cr);

                if (saveundo) {
                    changes.AddUndo(`set ${cr} all`, sheet.CellToString(cell));
                }

                crbase = SocialCalc.crToCoord(col, row); // Get old cell to move
                movedto[crbase] = cr; // Track movement

                if (rest === "all" && !movingcells[crbase]) {
                    // Moving an empty cell
                    delete sheet.cells[cr];
                    continue;
                }

                basecell = movingcells[crbase];
                if (!basecell) basecell = sheet.GetAssuredCell(crbase);

                // Copy format attributes if requested
                if (rest === "all" || rest === "formats") {
                    for (attrib in cellProperties) {
                        if (cellProperties[attrib] === 1) continue; // Skip base properties
                        if (typeof basecell[attrib] === "undefined" || cellProperties[attrib] === 3) {
                            delete cell[attrib];
                        } else {
                            cell[attrib] = basecell[attrib];
                        }
                    }
                }

                // Copy formulas and values if requested
                if (rest === "all" || rest === "formulas") {
                    cell.datavalue = basecell.datavalue;
                    cell.datatype = basecell.datatype;
                    cell.valuetype = basecell.valuetype;
                    cell.formula = basecell.formula;
                    delete cell.parseinfo;
                    cell.errors = basecell.errors;

                    // Handle comments
                    if (basecell.comment) {
                        cell.comment = basecell.comment;
                    } else if (cell.comment) {
                        delete cell.comment;
                    }
                }

                delete cell.displaystring;
            }
        }

        // Update cell references in formulas to reflect moved cells
        for (cr in sheet.cells) {
            cell = sheet.cells[cr];
            if (cell) {
                if (cell.datatype === "f") {
                    oldformula = cell.formula;
                    cell.formula = SocialCalc.ReplaceFormulaCoords(oldformula, movedto);

                    if (cell.formula !== oldformula) {
                        delete cell.parseinfo;
                        if (saveundo && !movedto[cr]) {
                            // Moved cells are already saved for undo
                            changes.AddUndo(`set ${cr} formula ${oldformula}`);
                        }
                    }
                } else {
                    delete cell.parseinfo;
                }
            }
        }

        // Update named range definitions
        for (name in sheet.names) {
            if (sheet.names[name]) {
                v1 = sheet.names[name].definition;
                oldformula = v1;
                v2 = "";
                if (v1.charAt(0) === "=") {
                    v2 = "=";
                    v1 = v1.substring(1);
                }
                sheet.names[name].definition = v2 + SocialCalc.ReplaceFormulaCoords(v1, movedto);

                if (saveundo && sheet.names[name].definition !== oldformula) {
                    changes.AddUndo(`name define ${name} ${oldformula}`);
                }
            }
        }

        attribs.needsrecalc = "yes";
        break;

/**
 * Named range commands
 * @example name define MYRANGE A1:B5
 * @example name desc MYRANGE "Sales data range"
 * @example name delete MYRANGE
 */
case "name":
        what = cmd.NextToken();
        name = cmd.NextToken();
        rest = cmd.RestOfString();

        // Sanitize name to valid characters
        name = name.toUpperCase().replace(/[^A-Z0-9_\.]/g, "");
        if (name === "") break; // Must have something

        switch (what) {
            case "define":
                if (rest === "") break; // Must have definition

                if (sheet.names[name]) {
                    // Already exists - update
                    if (saveundo) {
                        changes.AddUndo(`name define ${name} ${sheet.names[name].definition}`);
                    }
                    sheet.names[name].definition = rest;
                } else {
                    // Create new
                    if (saveundo) changes.AddUndo(`name delete ${name}`);
                    sheet.names[name] = { definition: rest, desc: "" };
                }
                break;

            case "desc":
                if (sheet.names[name]) {
                    // Must already exist
                    if (saveundo) {
                        changes.AddUndo(`name desc ${name} ${sheet.names[name].desc}`);
                    }
                    sheet.names[name].desc = rest;
                }
                break;

            case "delete":
                if (sheet.names[name]) {
                    if (saveundo) {
                        if (sheet.names[name].desc) {
                            changes.AddUndo(`name desc ${name} ${sheet.names[name].desc}`);
                        }
                        changes.AddUndo(`name define ${name} ${sheet.names[name].definition}`);
                    }
                    delete sheet.names[name];
                }
                break;
        }

        attribs.needsrecalc = "yes";
        break;

/**
 * Recalculation command
 * Forces a recalculation of all formulas
 */
case "recalc":
        attribs.needsrecalc = "yes"; // Request recalc
        sheet.recalconce = true; // Even if turned off
        break;

/**
 * Redisplay command
 * Forces a complete re-render of the sheet
 */
case "redisplay":
        sheet.renderneeded = true;
        break;

/**
 * Change render values command
 * Used internally for undo operations
 */
case "changedrendervalues":
        sheet.changedrendervalues = true;
        break;

/**
 * Start command extension
 * Allows custom command extensions to be executed
 * @example startcmdextension myextension param1 param2
 */
case "startcmdextension":
        name = cmd.NextToken();
        cmdextension = SocialCalc.SheetCommandInfo.CmdExtensionCallbacks[name];
        if (cmdextension) {
            cmdextension.func(name, cmdextension.data, sheet, cmd, saveundo);
        }
        break;

default:
        errortext = scc.s_escUnknownCmd + cmdstr;
        break;
    }

    return errortext;
};

/**
 * Undo the last operation(s) on the sheet
 * Executes all undo commands from the top of stack in reverse order
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet to perform undo on
 */
SocialCalc.SheetUndo = function (sheet) {
    const tos = sheet.changes.TOS();
    const lastone = tos ? tos.undo.length - 1 : -1;
    let cmdstr = "";

    // Execute undo commands in reverse order
    for (let i = lastone; i >= 0; i--) {
        if (cmdstr) cmdstr += "\n";
        cmdstr += tos.undo[i];
    }

    sheet.changes.Undo();
    sheet.ScheduleSheetCommands(cmdstr, false); // Execute undo operations
};

/**
 * Redo the last undone operation(s) on the sheet
 * Executes all commands from the current stack position
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet to perform redo on
 */
SocialCalc.SheetRedo = function (sheet) {
    const didredo = sheet.changes.Redo();
    if (!didredo) {
        sheet.ScheduleSheetCommands("", false); // Schedule doing nothing
        return;
    }

    const tos = sheet.changes.TOS();
    let cmdstr = "";

    // Execute redo commands in forward order
    for (let i = 0; tos && i < tos.command.length; i++) {
        if (cmdstr) cmdstr += "\n";
        cmdstr += tos.command[i];
    }

    sheet.ScheduleSheetCommands(cmdstr, false); // Execute redo operations
};

/**
 * Create an audit string of all commands executed on the sheet
 * Useful for debugging and logging purposes
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet to create audit string for
 * @returns {string} String containing all executed commands
 */
SocialCalc.CreateAuditString = function (sheet) {
    let result = "";
    const stack = sheet.changes.stack;
    const tos = sheet.changes.tos;

    for (let i = 0; i <= tos; i++) {
        for (let j = 0; j < stack[i].command.length; j++) {
            result += stack[i].command[j] + "\n";
        }
    }

    return result;
};

/**
 * Get or create a style number for a given style string
 * Maintains hash tables for quick lookup and assigns new numbers as needed
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet object
 * @param {string} atype - The attribute type (font, color, border, etc.)
 * @param {string} style - The style definition string
 * @returns {number} The style number (0 for empty/default styles)
 */
SocialCalc.GetStyleNum = function (sheet, atype, style) {
    // Empty style means use default (return 0)
    if (style.length === 0) return 0;

    let num = sheet[`${atype}hash`][style];
    if (!num) {
        // Ensure array starts with empty string at index 0
        if (sheet[`${atype}s`].length < 1) sheet[`${atype}s`].push("");

        // Add new style and get its index
        num = sheet[`${atype}s`].push(style) - 1;
        sheet[`${atype}hash`][style] = num;
        sheet.changedrendervalues = true;
    }

    return num;
};

/**
 * Get a style string for a given style number
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet object
 * @param {string} atype - The attribute type (font, color, border, etc.)
 * @param {number} num - The style number
 * @returns {string|null} The style string, or null for invalid/zero numbers
 */
SocialCalc.GetStyleString = function (sheet, atype, num) {
    if (!num) return null; // Zero, null, and undefined return null
    return sheet[`${atype}s`][num];
};
/**
 * Formula coordinate manipulation and recalculation engine
 * 
 * @fileoverview Functions for offsetting, adjusting, and replacing cell coordinates in formulas
 * along with a comprehensive recalculation system for spreadsheet formulas
 */

/**
 * Offset all relative cell references in a formula by specified amounts
 * Changes relative cell references by offsets (even those to other worksheets)
 * to support fill, paste, and sort operations as expected.
 * For absolute references, use $ notation.
 * 
 * @param {string} formula - The formula to process
 * @param {number} coloffset - Number of columns to offset (positive = right, negative = left)
 * @param {number} rowoffset - Number of rows to offset (positive = down, negative = up)
 * @returns {string} The updated formula with offset coordinates
 * 
 * @example
 * SocialCalc.OffsetFormulaCoords("A1+B2", 2, 1) // Returns "C2+D3"
 * SocialCalc.OffsetFormulaCoords("$A1+B$2", 2, 1) // Returns "$A2+D$2" (respects absolute refs)
 */
SocialCalc.OffsetFormulaCoords = function (formula, coloffset, rowoffset) {
    let parseinfo, ttext, ttype, i, cr, newcr;
    let updatedformula = "";
    const scf = SocialCalc.Formula;

    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    // Get token type constants
    const tokentype = scf.TokenType;
    const token_op = tokentype.op;
    const token_string = tokentype.string;
    const token_coord = tokentype.coord;
    const tokenOpExpansion = scf.TokenOpExpansion;

    // Parse formula into tokens
    parseinfo = scf.ParseFormulaIntoTokens(formula);

    // Process each token
    for (i = 0; i < parseinfo.length; i++) {
        ttype = parseinfo[i].type;
        ttext = parseinfo[i].text;

        if (ttype === token_coord) {
            // Handle coordinate token
            newcr = "";
            cr = SocialCalc.coordToCr(ttext);

            // Handle column offset (unless absolute column with $)
            if (ttext.charAt(0) !== "$") {
                cr.col += coloffset;
            } else {
                newcr += "$";
            }
            newcr += SocialCalc.rcColname(cr.col);

            // Handle row offset (unless absolute row with $)
            if (ttext.indexOf("$", 1) === -1) {
                cr.row += rowoffset;
            } else {
                newcr += "$";
            }
            newcr += cr.row;

            // Check for invalid references
            if (cr.row < 1 || cr.col < 1) {
                newcr = "#REF!";
            }

            updatedformula += newcr;
        } else if (ttype === token_string) {
            // Handle string tokens - escape quotes
            if (ttext.indexOf('"') >= 0) {
                updatedformula += `"${ttext.replace(/"/, '""')}"`;
            } else {
                updatedformula += `"${ttext}"`;
            }
        } else if (ttype === token_op) {
            // Handle operator tokens - expand short tokens
            updatedformula += tokenOpExpansion[ttext] || ttext;
        } else {
            // Leave everything else unchanged
            updatedformula += ttext;
        }
    }

    return updatedformula;
};

/**
 * Adjust all cell references in a formula that are affected by row/column insertion or deletion
 * Changes all cell references to cells starting with col/row by specified offsets
 * 
 * @param {string} formula - The formula to process
 * @param {number} col - Starting column for adjustment
 * @param {number} coloffset - Column offset to apply
 * @param {number} row - Starting row for adjustment  
 * @param {number} rowoffset - Row offset to apply
 * @returns {string} The updated formula with adjusted coordinates
 * 
 * @example
 * // Insert column before B (col=2, coloffset=1)
 * SocialCalc.AdjustFormulaCoords("A1+B2+C3", 2, 1, 1, 0) // Returns "A1+C2+D3"
 * 
 * @example
 * // Delete row 2 (row=2, rowoffset=-1) 
 * SocialCalc.AdjustFormulaCoords("A1+A2+A3", 1, 0, 2, -1) // Returns "A1+#REF!+A2"
 */
SocialCalc.AdjustFormulaCoords = function (formula, col, coloffset, row, rowoffset) {
    let ttype, ttext, i, newcr, cr;
    let updatedformula = "";
    let sheetref = false;
    const scf = SocialCalc.Formula;

    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    // Get token type constants
    const tokentype = scf.TokenType;
    const token_op = tokentype.op;
    const token_string = tokentype.string;
    const token_coord = tokentype.coord;
    const tokenOpExpansion = scf.TokenOpExpansion;

    // Parse formula into tokens
    const parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

    // Process each token
    for (i = 0; i < parseinfo.length; i++) {
        ttype = parseinfo[i].type;
        ttext = parseinfo[i].text;

        if (ttype === token_op) {
            // Handle operator tokens and track sheet references
            if (ttext === "!") {
                sheetref = true; // Found sheet reference
            } else if (ttext !== ":") {
                // Reset sheet reference for everything except range operator
                sheetref = false;
            }
            ttext = tokenOpExpansion[ttext] || ttext; // Expand short tokens
        }

        if (ttype === token_coord) {
            cr = SocialCalc.coordToCr(ttext);

            // Check if reference is to deleted cells
            if (
                (coloffset < 0 && cr.col >= col && cr.col < col - coloffset) ||
                (rowoffset < 0 && cr.row >= row && cr.row < row - rowoffset)
            ) {
                // References to deleted cells become invalid (unless sheet reference)
                if (!sheetref) {
                    cr.col = 0;
                    cr.row = 0;
                }
            }

            // Apply offsets to coordinates (unless sheet reference)
            if (!sheetref) {
                if (cr.col >= col) {
                    cr.col += coloffset;
                }
                if (cr.row >= row) {
                    cr.row += rowoffset;
                }
            }

            // Reconstruct coordinate string preserving absolute reference markers
            if (ttext.charAt(0) === "$") {
                newcr = `$${SocialCalc.rcColname(cr.col)}`;
            } else {
                newcr = SocialCalc.rcColname(cr.col);
            }

            if (ttext.indexOf("$", 1) !== -1) {
                newcr += `$${cr.row}`;
            } else {
                newcr += cr.row;
            }

            // Check for invalid references
            if (cr.row < 1 || cr.col < 1) {
                newcr = "#REF!";
            }

            ttext = newcr;
        } else if (ttype === token_string) {
            // Handle string tokens - escape quotes
            if (ttext.indexOf('"') >= 0) {
                ttext = `"${ttext.replace(/"/, '""')}"`;
            } else {
                ttext = `"${ttext}"`;
            }
        }

        updatedformula += ttext;
    }

    return updatedformula;
};

/**
 * Replace cell references in a formula based on a movement mapping
 * Changes all cell references that are keys in movedto to reference movedto[coord]
 * Does not change references to other sheets. Handles range extents specially.
 * 
 * @param {string} formula - The formula to process
 * @param {Object<string, string>} movedto - Mapping of old coordinates to new coordinates
 * @returns {string} The updated formula with replaced coordinates
 * 
 * @example
 * const movedto = { "A1": "C3", "B2": "D4" };
 * SocialCalc.ReplaceFormulaCoords("A1+B2*2", movedto) // Returns "C3+D4*2"
 */
SocialCalc.ReplaceFormulaCoords = function (formula, movedto) {
    let ttype, ttext, i, newcr, coord, cr;
    let updatedformula = "";
    let sheetref = false;
    const scf = SocialCalc.Formula;

    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    // Get token type constants
    const tokentype = scf.TokenType;
    const token_op = tokentype.op;
    const token_string = tokentype.string;
    const token_coord = tokentype.coord;
    const tokenOpExpansion = scf.TokenOpExpansion;

    // Parse formula into tokens
    const parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

    // Process each token
    for (i = 0; i < parseinfo.length; i++) {
        ttype = parseinfo[i].type;
        ttext = parseinfo[i].text;

        if (ttype === token_op) {
            // Handle operator tokens and track sheet references
            if (ttext === "!") {
                sheetref = true; // Found sheet reference
            } else if (ttext !== ":") {
                // Reset sheet reference for everything except range operator
                sheetref = false;
            }

            //!!!! TODO: HANDLE RANGE EXTENT MOVES

            ttext = tokenOpExpansion[ttext] || ttext; // Expand short tokens
        }

        if (ttype === token_coord) {
            cr = SocialCalc.coordToCr(ttext); // Get coordinate parts
            coord = SocialCalc.crToCoord(cr.col, cr.row); // Get "clean" reference

            if (movedto[coord] && !sheetref) {
                // This is a reference to a moved cell
                cr = SocialCalc.coordToCr(movedto[coord]); // Get new row and col

                // Preserve absolute reference markers
                if (ttext.charAt(0) === "$") {
                    newcr = `$${SocialCalc.rcColname(cr.col)}`;
                } else {
                    newcr = SocialCalc.rcColname(cr.col);
                }

                if (ttext.indexOf("$", 1) !== -1) {
                    newcr += `$${cr.row}`;
                } else {
                    newcr += cr.row;
                }

                ttext = newcr;
            }
        } else if (ttype === token_string) {
            // Handle string tokens - escape quotes
            if (ttext.indexOf('"') >= 0) {
                ttext = `"${ttext.replace(/"/, '""')}"`;
            } else {
                ttext = `"${ttext}"`;
            }
        }

        updatedformula += ttext;
    }

    return updatedformula;
};

// ************************
//
// Recalculation Loop Code
//
// ************************

/**
 * Global recalculation information and state management
 * @namespace
 * @property {SocialCalc.Sheet|null} sheet - Sheet currently being recalculated
 * @property {number} currentState - Current recalculation state
 * @property {Object} state - Allowed state values for recalculation process
 * @property {number|null} recalctimer - Timer ID for canceling recalc timer
 * @property {number} maxtimeslice - Maximum milliseconds per recalc time slice
 * @property {number} timeslicedelay - Milliseconds to wait between time slices
 * @property {Date} starttime - When recalculation started
 * @property {Function} LoadSheet - Function to load external sheets during recalc
 */
SocialCalc.RecalcInfo = {
    sheet: null,
    currentState: 0,
    state: {
        start_calc: 1,
        order: 2,
        calc: 3,
        start_wait: 4,
        done_wait: 5
    },
    recalctimer: null,
    maxtimeslice: 100,
    timeslicedelay: 1,
    starttime: 0,

    /**
     * Function that attempts to load a sheet by name
     * @param {string} sheetname - Name of sheet to load
     * @returns {boolean} True if load was started, false if not found
     */
    LoadSheet: function (sheetname) {
        return false; // Default implementation returns not found
    },
};

/**
 * Recalculation data structure for managing calculation order and progress
 * @class
 * @constructor
 */
SocialCalc.RecalcData = function () {
    /** @type {boolean} - Flag indicating recalculation in progress */
    this.inrecalc = true;

    /** @type {Array<string>} - List of all potential cells to calculate */
    this.celllist = [];

    /** @type {number} - Next cell to check when determining order */
    this.celllistitem = 0;

    /** 
     * Chained list of cells to calculate in order
     * @type {Object|null} - Format: "coord: nextcoord", e.g., calclist.A8=="B8" means B8 calculated after A8
     */
    this.calclist = null;

    /** @type {number} - Number of items in calculation list */
    this.calclistlength = 0;

    /** @type {string|null} - Start of the calculation chain */
    this.firstcalc = null;

    /** @type {string|null} - Last item on chain (for adding more to end) */
    this.lastcalc = null;

    /** @type {string|null} - Current position during background recalc */
    this.nextcalc = null;

    /** @type {number} - Number of cells calculated so far */
    this.count = 0;

    /**
     * Information used when determining calculation order
     * @type {Object} - Keys are coordinates, values are RecalcCheckInfo objects or true when complete
     */
    this.checkinfo = {};
};

/**
 * Information stored while checking calculation dependencies during order determination
 * @class
 * @constructor
 */
SocialCalc.RecalcCheckInfo = function () {
    /** @type {string|null} - Chain back up of cells referring to cells */
    this.oldcoord = null;

    /** @type {number} - Which token we are processing */
    this.parsepos = 0;

    // Range processing information
    /** @type {boolean} - True if currently processing a range of coordinates */
    this.inrange = false;

    /** @type {boolean} - True if range loop values not yet initialized */
    this.inrangestart = false;

    /** @type {Object|null} - Range first coordinate as cr object */
    this.cr1 = null;

    /** @type {Object|null} - Range second coordinate as cr object */
    this.cr2 = null;

    /** @type {number|null} - Range column extents */
    this.c1 = null;
    this.c2 = null;

    /** @type {number|null} - Range row extents */
    this.r1 = null;
    this.r2 = null;

    /** @type {number|null} - Current looping position */
    this.c = null;
    this.r = null;
};

/**
 * Initiate recalculation of the entire sheet
 * Sets up recalculation state and starts the background recalculation process
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet to recalculate
 */
SocialCalc.RecalcSheet = function (sheet) {
    const scri = SocialCalc.RecalcInfo;

    // Reset recalculation-wide state
    delete sheet.attribs.circularreferencecell;
    SocialCalc.Formula.FreshnessInfoReset();

    SocialCalc.RecalcClearTimeout();

    // Set up recalculation state
    scri.sheet = sheet;
    scri.currentState = scri.state.start_calc;
    scri.starttime = new Date();

    // Notify status callback of calculation start
    if (sheet.statuscallback) {
        sheet.statuscallback(scri, "calcstart", null, sheet.statuscallbackparams);
    }

    SocialCalc.RecalcSetTimeout();
};

/**
 * Set a timer for the next recalculation step
 * @private
 */
SocialCalc.RecalcSetTimeout = function () {
    const scri = SocialCalc.RecalcInfo;
    scri.recalctimer = window.setTimeout(
        SocialCalc.RecalcTimerRoutine,
        scri.timeslicedelay
    );
};

/**
 * Cancel any pending recalculation timeouts
 * @private
 */
SocialCalc.RecalcClearTimeout = function () {
    const scri = SocialCalc.RecalcInfo;
    if (scri.recalctimer) {
        window.clearTimeout(scri.recalctimer);
        scri.recalctimer = null;
    }
};

/**
 * Called when a sheet finishes loading during recalculation
 * 
 * @param {string|null} sheetname - Name of loaded sheet (null uses waiting sheet name)
 * @param {string} str - Sheet data string
 * @param {boolean} recalcneeded - Whether the loaded sheet should be recalculated
 */
SocialCalc.RecalcLoadedSheet = function (sheetname, str, recalcneeded) {
    const scri = SocialCalc.RecalcInfo;
    const scf = SocialCalc.Formula;

    // Add sheet to cache
    const sheet = SocialCalc.Formula.AddSheetToCache(
        sheetname || scf.SheetCache.waitingForLoading,
        str
    );

    // Chain in new sheet for recalculation if needed
    if (recalcneeded && sheet && sheet.attribs.recalc !== "off") {
        sheet.previousrecalcsheet = scri.sheet;
        scri.sheet = sheet;
        scri.currentState = scri.state.start_calc;
    }

    scf.SheetCache.waitingForLoading = null;
    SocialCalc.RecalcSetTimeout();
};

/**
 * Main recalculation timer routine
 * Handles order determination and cell-by-cell recalculation in background time slices
 * @private
 */
SocialCalc.RecalcTimerRoutine = function () {
    let eresult, cell, coord, err, status;
    const starttime = new Date();
    let count = 0;
    const scf = SocialCalc.Formula;

    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    const scri = SocialCalc.RecalcInfo;
    const sheet = scri.sheet;
    if (!sheet) return;

    let recalcdata = sheet.recalcdata;

    /**
     * Helper function for status callbacks
     * @param {string} status - Status message
     * @param {*} arg - Status argument
     */
    const do_statuscallback = (status, arg) => {
        if (sheet.statuscallback) {
            sheet.statuscallback(recalcdata, status, arg, sheet.statuscallbackparams);
        }
    };

    SocialCalc.RecalcClearTimeout();

    // State: Start calculation - initialize recalc data
    if (scri.currentState === scri.state.start_calc) {
        recalcdata = new SocialCalc.RecalcData();
        sheet.recalcdata = recalcdata;

        // Get list of all cells to check for calculation order
        for (coord in sheet.cells) {
            if (!coord) continue;
            recalcdata.celllist.push(coord);
        }

        recalcdata.calclist = {}; // Start with empty calculation list
        scri.currentState = scri.state.order; // Move to order determination
    }

    // State: Determine calculation order
    if (scri.currentState === scri.state.order) {
        while (recalcdata.celllistitem < recalcdata.celllist.length) {
            coord = recalcdata.celllist[recalcdata.celllistitem++];
            err = SocialCalc.RecalcCheckCell(sheet, coord);

            // Yield CPU if taking too long
            if (new Date() - starttime >= scri.maxtimeslice) {
                do_statuscallback("calcorder", {
                    coord: coord,
                    total: recalcdata.celllist.length,
                    count: recalcdata.celllistitem,
                });
                SocialCalc.RecalcSetTimeout();
                return;
            }
        }

        do_statuscallback("calccheckdone", recalcdata.calclistlength);

        // Start calculation phase
        recalcdata.nextcalc = recalcdata.firstcalc;
        scri.currentState = scri.state.calc;
        SocialCalc.RecalcSetTimeout();
        return;
    }

    // State: Start waiting for external resource
    if (scri.currentState === scri.state.start_wait) {
        scri.currentState = scri.state.done_wait;

        if (scri.LoadSheet) {
            status = scri.LoadSheet(scf.SheetCache.waitingForLoading);
            if (status) return; // Started load operation
        }

        SocialCalc.RecalcLoadedSheet(null, "", false);
        return;
    }

    // State: Finished waiting
    if (scri.currentState === scri.state.done_wait) {
        scri.currentState = scri.state.calc;
        SocialCalc.RecalcSetTimeout();
        return;
    }

    // State: Calculate cells
    if (scri.currentState !== scri.state.calc) {
        alert(`Recalc state error: ${scri.currentState}. Error in SocialCalc code.`);
    }

    // Process calculation chain
    coord = sheet.recalcdata.nextcalc;
    while (coord) {
        cell = sheet.cells[coord];
        eresult = scf.evaluate_parsed_formula(cell.parseinfo, sheet, false);

        // Handle external sheet loading
        if (scf.SheetCache.waitingForLoading) {
            recalcdata.nextcalc = coord; // Restart with this cell
            recalcdata.count += count;
            do_statuscallback("calcloading", {
                sheetname: scf.SheetCache.waitingForLoading
            });
            scri.currentState = scri.state.start_wait;
            SocialCalc.RecalcSetTimeout();
            return;
        }

        // Handle server function calls
        if (scf.RemoteFunctionInfo.waitingForServer) {
            recalcdata.nextcalc = coord; // Restart with this cell
            recalcdata.count += count;
            do_statuscallback("calcserverfunc", {
                funcname: scf.RemoteFunctionInfo.waitingForServer,
                coord: coord,
                total: recalcdata.calclistlength,
                count: recalcdata.count,
            });
            scri.currentState = scri.state.done_wait;
            return;
        }

        // Update cell value if changed
        if (cell.datavalue !== eresult.value || cell.valuetype !== eresult.type) {
            cell.datavalue = eresult.value;
            cell.valuetype = eresult.type;
            delete cell.displaystring;
            sheet.recalcchangedavalue = true;
        }

        if (eresult.error) {
            cell.errors = eresult.error;
        }

        count++;
        coord = sheet.recalcdata.calclist[coord];

        // Yield CPU if taking too long
        if (new Date() - starttime >= scri.maxtimeslice) {
            recalcdata.nextcalc = coord;
            recalcdata.count += count;
            do_statuscallback("calcstep", {
                coord: coord,
                total: recalcdata.calclistlength,
                count: recalcdata.count,
            });
            SocialCalc.RecalcSetTimeout();
            return;
        }
    }

    // Recalculation complete
    recalcdata.inrecalc = false;
    delete sheet.recalcdata; // Free memory
    delete sheet.attribs.needsrecalc; // Mark as recalculated

    // Chain to next sheet if recalculating loaded sheets
    scri.sheet = sheet.previousrecalcsheet || null;
    if (scri.sheet) {
        scri.currentState = scri.state.calc;
        SocialCalc.RecalcSetTimeout();
        return;
    }

    // All recalculation complete
    scf.FreshnessInfo.recalc_completed = true;
    do_statuscallback("calcfinished", new Date() - scri.starttime);
};
/**
 * Recalculation dependency checking, parsing, and undo stack management
 * 
 * @fileoverview Functions for checking cell dependencies during recalculation,
 * command parsing utilities, and a comprehensive undo/redo stack implementation
 */

/**
 * Check a cell to determine if it should be added to the calculation list
 * Analyzes parsed formula tokens and checks dependencies recursively.
 * Detects circular references and builds the calculation order chain.
 * 
 * @param {SocialCalc.Sheet} sheet - The sheet containing the cell
 * @param {string} startcoord - The coordinate of the cell to check (e.g., "A1")
 * @returns {string} Error message if circular reference found, empty string if successful
 * 
 * @description This function:
 * - Parses formula tokens to find cell references
 * - Recursively checks dependent cells
 * - Builds calculation order chain
 * - Detects and reports circular references
 * - Handles ranges and named references
 * - Manages sheet references (external sheets)
 */
SocialCalc.RecalcCheckCell = function (sheet, startcoord) {
    let parseinfo, ttext, ttype, i, rangecoord, circref, value, pos, pos2, cell, coordvals;
    const scf = SocialCalc.Formula;

    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    // Get token type constants
    const tokentype = scf.TokenType;
    const token_op = tokentype.op;
    const token_name = tokentype.name;
    const token_coord = tokentype.coord;

    const recalcdata = sheet.recalcdata;
    const checkinfo = recalcdata.checkinfo;

    let sheetref = false; // True when processing sheet reference (don't check external refs)
    let oldcoord = null; // Coordinate of formula that referred to this one
    let coord = startcoord; // Current cell being checked

    /**
     * Main checking loop - traverse dependency tree
     * Maintains reference stack during tree walk using oldcoord and checkinfo[coord].oldcoord
     */
    mainloop: while (coord) {
        cell = sheet.cells[coord];
        coordvals = checkinfo[coord];

        // Skip if not a formula or already processed
        if (
            !cell ||
            cell.datatype !== "f" || // Don't calculate if not a formula
            (coordvals && typeof coordvals !== "object") // Don't calc if already calculated
        ) {
            // Go back up dependency tree
            coord = oldcoord;
            if (checkinfo[coord]) oldcoord = checkinfo[coord].oldcoord;
            continue;
        }

        // Initialize checking information for this cell
        if (!coordvals) {
            coordvals = new SocialCalc.RecalcCheckInfo();
            checkinfo[coord] = coordvals;
        }

        // Clear previous calculation errors
        if (cell.errors) {
            delete cell.errors;
        }

        // Cache parsed formula if not already done
        if (!cell.parseinfo) {
            cell.parseinfo = scf.ParseFormulaIntoTokens(cell.formula);
        }
        parseinfo = cell.parseinfo;

        // Process each token in the formula
        for (i = coordvals.parsepos; i < parseinfo.length; i++) {

            // Handle range processing
            if (coordvals.inrange) {
                if (coordvals.inrangestart) {
                    // First time processing range - set up loop parameters
                    if (coordvals.cr1.col > coordvals.cr2.col) {
                        coordvals.c1 = coordvals.cr2.col;
                        coordvals.c2 = coordvals.cr1.col;
                    } else {
                        coordvals.c1 = coordvals.cr1.col;
                        coordvals.c2 = coordvals.cr2.col;
                    }
                    coordvals.c = coordvals.c1 - 1; // Start one before

                    if (coordvals.cr1.row > coordvals.cr2.row) {
                        coordvals.r1 = coordvals.cr2.row;
                        coordvals.r2 = coordvals.cr1.row;
                    } else {
                        coordvals.r1 = coordvals.cr1.row;
                        coordvals.r2 = coordvals.cr2.row;
                    }
                    coordvals.r = coordvals.r1; // Start on this row
                    coordvals.inrangestart = false;
                }

                // Process next cell in range
                coordvals.c += 1;
                if (coordvals.c > coordvals.c2) {
                    // Finished columns of this row
                    coordvals.r += 1;
                    if (coordvals.r > coordvals.r2) {
                        // Finished entire range
                        coordvals.inrange = false;
                        continue;
                    }
                    coordvals.c = coordvals.c1; // Start at beginning of next row
                }

                rangecoord = SocialCalc.crToCoord(coordvals.c, coordvals.r);

                // Check this range coordinate for dependencies
                coordvals.parsepos = i; // Remember position
                coordvals.oldcoord = oldcoord; // Remember back-up chain
                oldcoord = coord; // Come back to us
                coord = rangecoord;

                // Check for circular reference
                if (checkinfo[coord] && typeof checkinfo[coord] === "object") {
                    cell.errors = SocialCalc.Constants.s_caccCircRef + startcoord;
                    checkinfo[startcoord] = true;
                    if (!recalcdata.firstcalc) {
                        recalcdata.firstcalc = startcoord;
                    } else {
                        recalcdata.calclist[recalcdata.lastcalc] = startcoord;
                    }
                    recalcdata.lastcalc = startcoord;
                    recalcdata.calclistlength++;
                    sheet.attribs.circularreferencecell = `${coord}|${oldcoord}`;
                    return cell.errors;
                }
                continue mainloop;
            }

            // Process individual tokens
            ttype = parseinfo[i].type;
            ttext = parseinfo[i].text;

            if (ttype === token_op) {
                // Handle sheet references
                if (ttext === "!") {
                    sheetref = true; // Found sheet reference
                } else if (ttext !== ":") {
                    // Reset for everything except range operator
                    sheetref = false;
                }
            }

            if (ttype === token_name) {
                // Handle named ranges and variables
                value = scf.LookupName(sheet, ttext);
                if (value.type === "range") {
                    // Named range - check each cell in range
                    pos = value.value.indexOf("|");
                    if (pos !== -1) {
                        // Range format: "A1|B2|..." - check each cell
                        coordvals.cr1 = SocialCalc.coordToCr(value.value.substring(0, pos));
                        pos2 = value.value.indexOf("|", pos + 1);
                        coordvals.cr2 = SocialCalc.coordToCr(value.value.substring(pos + 1, pos2));
                        coordvals.inrange = true;
                        coordvals.inrangestart = true;
                        i = i - 1; // Back up to restart at this position
                        continue;
                    }
                } else if (value.type === "coord") {
                    // Named coordinate - treat as coordinate token
                    ttype = token_coord;
                    ttext = value.value;
                } else {
                    // Not a defined name - probably a function
                }
            }

            if (ttype === token_coord) {
                // Handle coordinate references

                // Check if this is part of a range (A1:B2)
                if (
                    i >= 2 &&
                    parseinfo[i - 1].type === token_op &&
                    parseinfo[i - 1].text === ":" &&
                    parseinfo[i - 2].type === token_coord &&
                    !sheetref
                ) {
                    // Range - check each cell in the range
                    coordvals.cr1 = SocialCalc.coordToCr(parseinfo[i - 2].text);
                    coordvals.cr2 = SocialCalc.coordToCr(ttext);
                    coordvals.inrange = true;
                    coordvals.inrangestart = true;
                    i = i - 1; // Back up to restart range processing
                    continue;
                } else if (!sheetref) {
                    // Single cell reference
                    if (ttext.indexOf("$") !== -1) {
                        ttext = ttext.replace(/\$/g, ""); // Remove absolute reference markers
                    }

                    coordvals.parsepos = i + 1; // Remember position for return
                    coordvals.oldcoord = oldcoord; // Remember back-up chain
                    oldcoord = coord; // Come back to us
                    coord = ttext;

                    // Check for circular reference
                    if (checkinfo[coord] && typeof checkinfo[coord] === "object") {
                        cell.errors = SocialCalc.Constants.s_caccCircRef + startcoord;
                        checkinfo[startcoord] = true;
                        if (!recalcdata.firstcalc) {
                            recalcdata.firstcalc = startcoord;
                        } else {
                            recalcdata.calclist[recalcdata.lastcalc] = startcoord;
                        }
                        recalcdata.lastcalc = startcoord;
                        recalcdata.calclistlength++;
                        sheet.attribs.circularreferencecell = `${coord}|${oldcoord}`;
                        return cell.errors;
                    }
                    continue mainloop;
                }
            }
        }

        // Finished processing this cell - add to calculation list
        sheetref = false; // Reset sheet reference flag
        checkinfo[coord] = true; // Mark as finished

        if (!recalcdata.firstcalc) {
            recalcdata.firstcalc = coord;
        } else {
            recalcdata.calclist[recalcdata.lastcalc] = coord;
        }
        recalcdata.lastcalc = coord;
        recalcdata.calclistlength++;

        // Go back to the formula that referred to us
        coord = oldcoord;
        oldcoord = checkinfo[coord] ? checkinfo[coord].oldcoord : null;
    }

    return "";
};

// *************************************
//
// Parse class for command parsing
//
// *************************************

/**
 * Command string parser for ExecuteSheetCommand
 * Handles multi-line commands with token-based parsing using delimiters
 * 
 * @class
 * @param {string} str - The command string to parse (may contain multiple lines)
 * 
 * @property {string} str - The original string being parsed
 * @property {number} pos - Current parsing position
 * @property {string} delimiter - Token delimiter (default: space)
 * @property {number} lineEnd - Position of current line end
 */
SocialCalc.Parse = function (str) {
    this.str = str;
    this.pos = 0;
    this.delimiter = " ";
    this.lineEnd = str.indexOf("\n");
    if (this.lineEnd < 0) {
        this.lineEnd = str.length;
    }
};

/**
 * Get the next token as a string
 * Advances position past the token and delimiter
 * 
 * @returns {string} The next token, or empty string if at end
 */
SocialCalc.Parse.prototype.NextToken = function () {
    if (this.pos < 0) return "";

    let pos2 = this.str.indexOf(this.delimiter, this.pos);
    const pos1 = this.pos;

    if (pos2 > this.lineEnd) {
        // Don't go past end of line
        pos2 = this.lineEnd;
    }

    if (pos2 >= 0) {
        this.pos = pos2 + 1;
        return this.str.substring(pos1, pos2);
    } else {
        this.pos = this.lineEnd;
        return this.str.substring(pos1, this.lineEnd);
    }
};

/**
 * Get everything from current position until end of line
 * Advances position to end of current line
 * 
 * @returns {string} Remainder of current line, or empty string if at/past end
 */
SocialCalc.Parse.prototype.RestOfString = function () {
    const oldpos = this.pos;
    if (this.pos < 0 || this.pos >= this.lineEnd) return "";

    this.pos = this.lineEnd;
    return this.str.substring(oldpos, this.lineEnd);
};

/**
 * Get everything from current position until end of line without moving position
 * 
 * @returns {string} Remainder of current line, or empty string if at/past end
 */
SocialCalc.Parse.prototype.RestOfStringNoMove = function () {
    if (this.pos < 0 || this.pos >= this.lineEnd) return "";
    return this.str.substring(this.pos, this.lineEnd);
};

/**
 * Move to the next line in the string
 * Updates position and lineEnd for the new line
 */
SocialCalc.Parse.prototype.NextLine = function () {
    this.pos = this.lineEnd + 1;
    this.lineEnd = this.str.indexOf("\n", this.pos);
    if (this.lineEnd < 0) {
        this.lineEnd = this.str.length;
    }
};

/**
 * Check if at end of string with no more content to process
 * 
 * @returns {boolean} True if at end of string, false otherwise
 */
SocialCalc.Parse.prototype.EOF = function () {
    if (this.pos < 0 || this.pos >= this.str.length) return true;
    return false;
};

// *************************************
//
// UndoStack class for undo/redo functionality
//
// *************************************

/**
 * Implements undo/redo functionality for spreadsheet operations
 * Maintains a stack of changes that can be undone and redone
 * 
 * @class
 * @constructor
 * 
 * @property {Array} stack - Array of change objects: {command: [], type: string, undo: []}
 * @property {number} tos - Top of stack position for undo/redo (-1 if empty)
 * @property {number} maxRedo - Maximum redo stack size (0 = unlimited)
 * @property {number} maxUndo - Maximum undo steps (0 = unlimited)
 * 
 * @description Usage pattern:
 * 1. Call PushChange(type) to start a new change sequence
 * 2. Add "do" commands with AddDo(args...)
 * 3. Add "undo" commands with AddUndo(args...)
 * 4. Use Undo() and Redo() to navigate through changes
 */
SocialCalc.UndoStack = function () {
    /** @type {Array<Object>} - Stack of change objects */
    this.stack = [];

    /** @type {number} - Top of stack position, used for undo/redo */
    this.tos = -1;

    /** @type {number} - Maximum size of redo stack (audit trail) or 0 for no limit */
    this.maxRedo = 0;

    /** @type {number} - Maximum undo steps kept or 0 for no limit */
    this.maxUndo = 50;
};

/**
 * Add a new change to the stack
 * Removes any undone changes after current position
 * 
 * @param {string} type - Type of change (e.g., "typing", "format", "insert row")
 */
SocialCalc.UndoStack.prototype.PushChange = function (type) {
    // Remove any changes that were undone (after current TOS)
    while (this.stack.length > 0 && this.stack.length - 1 > this.tos) {
        this.stack.pop();
    }

    // Add new change
    this.stack.push({ command: [], type: type, undo: [] });

    // Enforce maximum redo limit
    if (this.maxRedo && this.stack.length > this.maxRedo) {
        this.stack.shift(); // Remove oldest entry
    }

    // Enforce maximum undo limit
    if (this.maxUndo && this.stack.length > this.maxUndo) {
        // Remove undo info from oldest entry beyond limit
        this.stack[this.stack.length - this.maxUndo - 1].undo = [];
    }

    this.tos = this.stack.length - 1;
};

/**
 * Add a "do" command to the current change
 * Arguments are joined with spaces to form the command string
 * 
 * @param {...*} arguments - Command arguments (null/undefined ignored)
 */
SocialCalc.UndoStack.prototype.AddDo = function () {
    const args = [];
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) args.push(arguments[i]); // Ignore null/undefined
    }
    const cmd = args.join(" ");
    this.stack[this.stack.length - 1].command.push(cmd);
};

/**
 * Add an "undo" command to the current change
 * Arguments are joined with spaces to form the command string
 * 
 * @param {...*} arguments - Undo command arguments (null/undefined ignored)
 */
SocialCalc.UndoStack.prototype.AddUndo = function () {
    const args = [];
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) args.push(arguments[i]); // Ignore null/undefined
    }
    const cmd = args.join(" ");
    this.stack[this.stack.length - 1].undo.push(cmd);
};

/**
 * Get the top of stack change object
 * 
 * @returns {Object|null} Current change object or null if stack is empty
 */
SocialCalc.UndoStack.prototype.TOS = function () {
    if (this.tos >= 0) return this.stack[this.tos];
    else return null;
};

/**
 * Undo the last change
 * Moves the top of stack pointer back one position
 * 
 * @returns {boolean} True if undo was performed, false if nothing to undo
 */
SocialCalc.UndoStack.prototype.Undo = function () {
    if (
        this.tos >= 0 &&
        (!this.maxUndo || this.tos > this.stack.length - this.maxUndo - 1)
    ) {
        this.tos -= 1;
        return true;
    } else {
        return false;
    }
};

/**
 * Redo the next change
 * Moves the top of stack pointer forward one position
 * 
 * @returns {boolean} True if redo was performed, false if nothing to redo
 */
SocialCalc.UndoStack.prototype.Redo = function () {
    if (this.tos < this.stack.length - 1) {
        this.tos += 1;
        return true;
    } else {
        return false;
    }
};
/**
 * Clipboard management and sheet rendering system
 * 
 * @fileoverview Handles clipboard operations and provides comprehensive sheet rendering
 * with pane support, highlighting, and DOM table generation
 */

// *************************************
//
// Clipboard Object - Global clipboard shared by all sheets
//
// *************************************

/**
 * Global clipboard object shared by all active sheets
 * Stores clipboard data in save format but does not persist between sessions
 * 
 * @namespace
 * @property {string} clipboard - Empty or string in save format with "copiedfrom:" range info
 */
SocialCalc.Clipboard = {
    /** @type {string} - Clipboard content in save format or empty string */
    clipboard: "",
};

// *************************************
//
// RenderContext class for sheet rendering
//
// *************************************

/**
 * Rendering context for converting sheet data into DOM table elements
 * Handles panes, spanning cells, highlighting, fonts, layouts, and formatting
 * 
 * @class
 * @param {SocialCalc.Sheet} sheetobj - The sheet object to render
 * @throws {Error} If sheetobj is missing
 * 
 * @property {SocialCalc.Sheet} sheetobj - Reference to the sheet being rendered
 * @property {boolean} hideRowsCols - Whether to hide rows/columns (panes only work with false)
 * @property {boolean} showGrid - Whether to show grid lines
 * @property {boolean} showRCHeaders - Whether to show row/column headers
 * @property {number} rownamewidth - Width of row name column
 * @property {number} pixelsPerRow - Assumed height per row in pixels
 * @property {Object} cellskip - Maps coordinates of cells covered by spanning cells
 * @property {Object} coordToCR - Maps span-starting coordinates to {row, col} objects
 * @property {Array<string>} colwidth - Precomputed column widths
 * @property {number} totalwidth - Precomputed total table width
 * @property {Array<Object>} rowpanes - Row pane definitions {first, last}
 * @property {Array<Object>} colpanes - Column pane definitions {first, last}
 * @property {number} maxcol - Maximum column to display including spans
 * @property {number} maxrow - Maximum row to display including spans
 * @property {Object} highlights - Cell highlighting: coord -> highlightType
 * @property {string} cursorsuffix - Suffix for cursor highlighting
 * @property {Object} highlightTypes - Highlight style definitions
 */
SocialCalc.RenderContext = function (sheetobj) {
    const attribs = sheetobj.attribs;
    const scc = SocialCalc.Constants;

    // Core properties
    this.sheetobj = sheetobj;
    this.hideRowsCols = false; // Rendering with panes only works with false
    this.showGrid = false;
    this.showRCHeaders = false;
    this.rownamewidth = scc.defaultRowNameWidth;
    this.pixelsPerRow = scc.defaultAssumedRowHeight;

    // Cell spanning and positioning data
    this.cellskip = {}; // Coordinates of cells covered by spanning cells
    this.coordToCR = {}; // For span-starting cells: coord -> {row, col}
    this.colwidth = []; // Precomputed column widths with defaults
    this.totalwidth = 0; // Precomputed total table width

    // Pane configuration
    this.rowpanes = []; // Array of {first: firstrow, last: lastrow}
    this.colpanes = []; // Array of {first: firstcol, last: lastcol}
    this.maxcol = 0; // Max display boundaries including spans
    this.maxrow = 0;

    // Highlighting system
    this.highlights = {}; // coord -> highlightType mapping
    this.cursorsuffix = ""; // Added to cursor highlight types

    /**
     * Highlight type definitions with styles and CSS classes
     * @type {Object<string, Object>}
     */
    this.highlightTypes = {
        cursor: {
            style: scc.defaultHighlightTypeCursorStyle,
            className: scc.defaultHighlightTypeCursorClass,
        },
        range: {
            style: scc.defaultHighlightTypeRangeStyle,
            className: scc.defaultHighlightTypeRangeClass,
        },
        cursorinsertup: {
            style: `color:#FFF;backgroundColor:#A6A6A6;backgroundRepeat:repeat-x;backgroundPosition:top left;backgroundImage:url(${scc.defaultImagePrefix}cursorinsertup.gif);`,
            className: scc.defaultHighlightTypeCursorClass,
        },
        cursorinsertleft: {
            style: `color:#FFF;backgroundColor:#A6A6A6;backgroundRepeat:repeat-y;backgroundPosition:top left;backgroundImage:url(${scc.defaultImagePrefix}cursorinsertleft.gif);`,
            className: scc.defaultHighlightTypeCursorClass,
        },
        range2: {
            style: `color:#000;backgroundColor:#FFF;backgroundImage:url(${scc.defaultImagePrefix}range2.gif);`,
            className: "",
        },
    };

    // Cell ID and linking
    this.cellIDprefix = scc.defaultCellIDPrefix; // Prefix for cell IDs if non-null
    this.defaultlinkstyle = null; // Default linkstyle object for link renderer
    this.defaultHTMLlinkstyle = { type: "html" }; // Default linkstyle for standalone HTML

    // Font and layout constants
    this.defaultfontstyle = scc.defaultCellFontStyle;
    this.defaultfontsize = scc.defaultCellFontSize;
    this.defaultfontfamily = scc.defaultCellFontFamily;
    this.defaultlayout = scc.defaultCellLayout;

    // Pane divider dimensions
    this.defaultpanedividerwidth = scc.defaultPaneDividerWidth;
    this.defaultpanedividerheight = scc.defaultPaneDividerHeight;

    // Grid and comment styling
    this.gridCSS = scc.defaultGridCSS;
    this.commentClassName = scc.defaultCommentClass;
    this.commentCSS = scc.defaultCommentStyle;
    this.commentNoGridClassName = scc.defaultCommentNoGridClass;
    this.commentNoGridCSS = scc.defaultCommentNoGridStyle;

    /**
     * CSS class names for various elements
     * @type {Object<string, string>}
     */
    this.classnames = {
        colname: scc.defaultColnameClass,
        rowname: scc.defaultRownameClass,
        selectedcolname: scc.defaultSelectedColnameClass,
        selectedrowname: scc.defaultSelectedRownameClass,
        upperleft: scc.defaultUpperLeftClass,
        skippedcell: scc.defaultSkippedCellClass,
        panedivider: scc.defaultPaneDividerClass,
    };

    /**
     * Explicit CSS styles (alternative to class names)
     * @type {Object<string, string>}
     */
    this.explicitStyles = {
        colname: scc.defaultColnameStyle,
        rowname: scc.defaultRownameStyle,
        selectedcolname: scc.defaultSelectedColnameStyle,
        selectedrowname: scc.defaultSelectedRownameStyle,
        upperleft: scc.defaultUpperLeftStyle,
        skippedcell: scc.defaultSkippedCellStyle,
        panedivider: scc.defaultPaneDividerStyle,
    };

    // Processing state
    this.cellskip = null;
    this.needcellskip = true;

    // Precomputed style data
    this.fonts = []; // Array of {style, weight, size, family} objects
    this.layouts = []; // Array of computed layout CSS strings
    this.needprecompute = true;

    // Initialize panes if sheet object provided
    if (sheetobj) {
        this.rowpanes[0] = { first: 1, last: attribs.lastrow };
        this.colpanes[0] = { first: 1, last: attribs.lastcol };
    } else {
        throw scc.s_rcMissingSheet;
    }
};

// *************************************
// RenderContext prototype methods
// *************************************

/**
 * Precompute sheet fonts and layouts, filling in defaults indicated by "*"
 */
SocialCalc.RenderContext.prototype.PrecomputeSheetFontsAndLayouts = function () {
    SocialCalc.PrecomputeSheetFontsAndLayouts(this);
};

/**
 * Calculate cell skip data for spanning cells
 */
SocialCalc.RenderContext.prototype.CalculateCellSkipData = function () {
    SocialCalc.CalculateCellSkipData(this);
};

/**
 * Calculate column width data including defaults
 */
SocialCalc.RenderContext.prototype.CalculateColWidthData = function () {
    SocialCalc.CalculateColWidthData(this);
};

/**
 * Set row pane boundaries
 * @param {number} panenum - Pane number
 * @param {number} first - First row in pane
 * @param {number} last - Last row in pane
 */
SocialCalc.RenderContext.prototype.SetRowPaneFirstLast = function (panenum, first, last) {
    this.rowpanes[panenum] = { first: first, last: last };
};

/**
 * Set column pane boundaries
 * @param {number} panenum - Pane number
 * @param {number} first - First column in pane
 * @param {number} last - Last column in pane
 */
SocialCalc.RenderContext.prototype.SetColPaneFirstLast = function (panenum, first, last) {
    this.colpanes[panenum] = { first: first, last: last };
};

/**
 * Check if coordinate is within specified panes
 * @param {string} coord - Cell coordinate
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @returns {boolean} True if coordinate is in pane
 */
SocialCalc.RenderContext.prototype.CoordInPane = function (coord, rowpane, colpane) {
    return SocialCalc.CoordInPane(this, coord, rowpane, colpane);
};

/**
 * Check if row/column is within specified panes
 * @param {number} row - Row number
 * @param {number} col - Column number
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @returns {boolean} True if cell is in pane
 */
SocialCalc.RenderContext.prototype.CellInPane = function (row, col, rowpane, colpane) {
    return SocialCalc.CellInPane(this, row, col, rowpane, colpane);
};

/**
 * Initialize table DOM element with rendering context settings
 * @param {HTMLTableElement} tableobj - Table element to initialize
 */
SocialCalc.RenderContext.prototype.InitializeTable = function (tableobj) {
    SocialCalc.InitializeTable(this, tableobj);
};

/**
 * Render complete sheet as DOM table
 * @param {HTMLTableElement} [oldtable] - Existing table to replace
 * @param {Object} [linkstyle] - Link styling options
 * @returns {HTMLTableElement} New table element
 */
SocialCalc.RenderContext.prototype.RenderSheet = function (oldtable, linkstyle) {
    return SocialCalc.RenderSheet(this, oldtable, linkstyle);
};

/**
 * Render column group element
 * @returns {HTMLElement} Column group element
 */
SocialCalc.RenderContext.prototype.RenderColGroup = function () {
    return SocialCalc.RenderColGroup(this);
};

/**
 * Render column headers row
 * @returns {HTMLTableRowElement} Column headers row element
 */
SocialCalc.RenderContext.prototype.RenderColHeaders = function () {
    return SocialCalc.RenderColHeaders(this);
};

/**
 * Render sizing row for layout
 * @returns {HTMLTableRowElement} Sizing row element
 */
SocialCalc.RenderContext.prototype.RenderSizingRow = function () {
    return SocialCalc.RenderSizingRow(this);
};

/**
 * Render a single row
 * @param {number} rownum - Row number to render
 * @param {number} rowpane - Row pane number
 * @param {Object} [linkstyle] - Link styling options
 * @returns {HTMLTableRowElement} Row element
 */
SocialCalc.RenderContext.prototype.RenderRow = function (rownum, rowpane, linkstyle) {
    return SocialCalc.RenderRow(this, rownum, rowpane, linkstyle);
};

/**
 * Render spacing row between panes
 * @returns {HTMLTableRowElement} Spacing row element
 */
SocialCalc.RenderContext.prototype.RenderSpacingRow = function () {
    return SocialCalc.RenderSpacingRow(this);
};

/**
 * Render a single cell
 * @param {number} rownum - Row number
 * @param {number} colnum - Column number
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @param {boolean} [noElement] - Whether to skip DOM element creation
 * @param {Object} [linkstyle] - Link styling options
 * @returns {HTMLTableCellElement} Cell element
 */
SocialCalc.RenderContext.prototype.RenderCell = function (rownum, colnum, rowpane, colpane, noElement, linkstyle) {
    return SocialCalc.RenderCell(this, rownum, colnum, rowpane, colpane, noElement, linkstyle);
};

// *************************************
// Implementation Functions
// *************************************

/**
 * Precompute fonts and layouts by expanding "*" placeholders with defaults
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * 
 * @description Processes font and layout definitions:
 * - Fonts: "style weight size family" format with "*" for defaults
 * - Layouts: "padding:T R B L;vertical-align:va;" format with "*" for defaults
 */
SocialCalc.PrecomputeSheetFontsAndLayouts = function (context) {
    let defaultfont, parts, layoutre, dparts, sparts, num, s, i;
    const sheetobj = context.sheetobj;
    const attribs = sheetobj.attribs;

    // Process default font
    if (attribs.defaultfont) {
        defaultfont = sheetobj.fonts[attribs.defaultfont];
        defaultfont = defaultfont.replace(/^\*/, SocialCalc.Constants.defaultCellFontStyle);
        defaultfont = defaultfont.replace(/(.+)\*(.+)/, `$1${SocialCalc.Constants.defaultCellFontSize}$2`);
        defaultfont = defaultfont.replace(/\*$/, SocialCalc.Constants.defaultCellFontFamily);

        parts = defaultfont.match(/^(\S+? \S+?) (\S+?) (\S.*)$/);
        context.defaultfontstyle = parts[1];
        context.defaultfontsize = parts[2];
        context.defaultfontfamily = parts[3];
    }

    // Precompute all fonts by filling in "*" placeholders
    for (num = 1; num < sheetobj.fonts.length; num++) {
        s = sheetobj.fonts[num];
        s = s.replace(/^\*/, context.defaultfontstyle);
        s = s.replace(/(.+)\*(.+)/, `$1${context.defaultfontsize}$2`);
        s = s.replace(/\*$/, context.defaultfontfamily);

        parts = s.match(/^(\S+?) (\S+?) (\S+?) (\S.*)$/);
        context.fonts[num] = {
            style: parts[1],
            weight: parts[2],
            size: parts[3],
            family: parts[4],
        };
    }

    // Process layouts
    layoutre = /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/;
    dparts = SocialCalc.Constants.defaultCellLayout.match(layoutre); // Built-in defaults

    if (attribs.defaultlayout) {
        sparts = sheetobj.layouts[attribs.defaultlayout].match(layoutre); // Sheet defaults
    } else {
        sparts = ["", "*", "*", "*", "*", "*"];
    }

    // Precompute all layouts by filling in "*" placeholders
    for (num = 1; num < sheetobj.layouts.length; num++) {
        s = sheetobj.layouts[num];
        parts = s.match(layoutre);

        for (i = 1; i <= 5; i++) {
            if (parts[i] === "*") {
                parts[i] = sparts[i] !== "*" ? sparts[i] : dparts[i]; // Use sheet default or built-in
            }
        }

        context.layouts[num] = `padding:${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]};vertical-align:${parts[5]};`;
    }

    context.needprecompute = false;
};

/**
 * Calculate cell skip data for handling spanning cells (colspan/rowspan)
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * 
 * @description Creates mapping of:
 * - cellskip[coord] = spanning_cell_coord for covered cells
 * - coordToCR[coord] = {row, col} for span-starting cells
 * - Updates maxrow/maxcol to include span extents
 */
SocialCalc.CalculateCellSkipData = function (context) {
    let row, col, coord, cell, contextcell, colspan, rowspan, skiprow, skipcol, skipcoord;

    const sheetobj = context.sheetobj;
    const sheetrowattribs = sheetobj.rowattribs;
    const sheetcolattribs = sheetobj.colattribs;

    context.maxrow = 0;
    context.maxcol = 0;
    context.cellskip = {}; // Reset skip data

    let maxrow, maxcol;

    // Process all cells looking for spans
    for (row = 1; row <= sheetobj.attribs.lastrow; row++) {
        for (col = 1; col <= sheetobj.attribs.lastcol; col++) {
            coord = SocialCalc.crToCoord(col, row);
            cell = sheetobj.cells[coord];

            // Skip undefined cells or already processed cells
            if (cell === undefined || context.cellskip[coord]) continue;

            colspan = cell.colspan || 1;
            rowspan = cell.rowspan || 1;

            // Process spanning cells
            if (colspan > 1 || rowspan > 1) {
                for (skiprow = row; skiprow < row + rowspan; skiprow++) {
                    for (skipcol = col; skipcol < col + colspan; skipcol++) {
                        skipcoord = SocialCalc.crToCoord(skipcol, skiprow);

                        if (skipcoord === coord) {
                            // For the main cell, remember its row and column
                            context.coordToCR[coord] = { row: row, col: col };
                        } else {
                            // For covered cells, flag with main cell coordinate
                            context.cellskip[skipcoord] = coord;
                        }

                        // Update maximum extents
                        if (skiprow > context.maxrow) maxrow = skiprow;
                        if (skipcol > context.maxcol) maxcol = skipcol;
                    }
                }
            }
        }
    }

    context.needcellskip = false;
};

/**
 * Calculate column width data including defaults and total width
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * 
 * @description Processes all columns to:
 * - Apply explicit widths or sheet/global defaults
 * - Handle "blank" and "auto" width specifications
 * - Calculate total table width including row headers
 */
SocialCalc.CalculateColWidthData = function (context) {
    let colnum, colname, colwidth, totalwidth;

    const sheetobj = context.sheetobj;
    const sheetcolattribs = sheetobj.colattribs;

    // Start with row header width if showing
    totalwidth = context.showRCHeaders ? context.rownamewidth - 0 : 0;

    // Process all column panes
    for (let colpane = 0; colpane < context.colpanes.length; colpane++) {
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            colname = SocialCalc.rcColname(colnum);

            // Get width from hierarchy: explicit > sheet default > global default
            colwidth =
                sheetobj.colattribs.width[colname] ||
                sheetobj.attribs.defaultcolwidth ||
                SocialCalc.Constants.defaultColWidth;

            // Handle special width values
            if (colwidth === "blank" || colwidth === "auto") colwidth = "";

            context.colwidth[colnum] = colwidth + "";
            totalwidth += colwidth && colwidth - 0 > 0 ? colwidth - 0 : 10;
        }
    }

    context.totalwidth = totalwidth;
};

/**
 * Initialize table DOM element with proper styling for rendering
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {HTMLTableElement} tableobj - Table element to initialize
 * 
 * @description Sets up:
 * - Border collapse for seamless cell borders
 * - Fixed table width based on calculated column widths
 * - Cell spacing and padding reset
 */
SocialCalc.InitializeTable = function (context, tableobj) {
    // Use border-collapse to avoid corner holes
    // Note: IE and Firefox handle <col> differently under border-collapse
    // Safari has issues with <col> and wide text
    // Table-layout "fixed" can also cause problems

    tableobj.style.borderCollapse = "collapse";
    tableobj.cellSpacing = "0";
    tableobj.cellPadding = "0";
    tableobj.style.width = `${context.totalwidth}px`;
};

/**
 * Render complete sheet as DOM table element
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {HTMLTableElement} [oldtable] - Existing table to replace in DOM
 * @param {Object} [linkstyle] - Link styling options (null/"" for editing mode)
 * @returns {HTMLTableElement} New table element
 * 
 * @description Renders complete sheet including:
 * - Column groups and headers
 * - All row panes with proper spacing
 * - Cell content and styling
 * - Replaces oldtable in DOM if provided
 */
SocialCalc.RenderSheet = function (context, oldtable, linkstyle) {
    let newrow, rowpane;
    let tableobj, colgroupobj, tbodyobj, parentnode;

    // Update precomputed data if needed
    if (context.sheetobj.changedrendervalues) {
        context.needcellskip = true;
        context.needprecompute = true;
        context.sheetobj.changedrendervalues = false;
    }

    if (context.needcellskip) {
        context.CalculateCellSkipData();
    }

    if (context.needprecompute) {
        context.PrecomputeSheetFontsAndLayouts();
    }

    context.CalculateColWidthData(); // Always update column width data

    // Create and initialize table element
    tableobj = document.createElement("table");
    context.InitializeTable(tableobj);

    // Add column group
    colgroupobj = context.RenderColGroup();
    tableobj.appendChild(colgroupobj);

    // Create table body
    tbodyobj = document.createElement("tbody");

    // Add sizing row
    tbodyobj.appendChild(context.RenderSizingRow());

    // Add column headers if enabled
    if (context.showRCHeaders) {
        newrow = context.RenderColHeaders();
        if (newrow) tbodyobj.appendChild(newrow);
    }

    // Render all row panes
    for (rowpane = 0; rowpane < context.rowpanes.length; rowpane++) {
        // Render rows in this pane
        for (
            let rownum = context.rowpanes[rowpane].first;
            rownum <= context.rowpanes[rowpane].last;
            rownum++
        ) {
            newrow = context.RenderRow(rownum, rowpane, linkstyle);
            tbodyobj.appendChild(newrow);
        }

        // Add spacing row between panes (except after last pane)
        if (rowpane < context.rowpanes.length - 1) {
            newrow = context.RenderSpacingRow();
            tbodyobj.appendChild(newrow);
        }
    }

    tableobj.appendChild(tbodyobj);

    // Replace old table in DOM if provided
    if (oldtable) {
        parentnode = oldtable.parentNode;
        if (parentnode) parentnode.replaceChild(tableobj, oldtable);
    }

    // Execute user scripts
    SocialCalc.EvalUserScripts();

    return tableobj;
};

/**
 * Render a single row with all its cells and pane dividers
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {number} rownum - Row number to render
 * @param {number} rowpane - Row pane number
 * @param {Object} [linkstyle] - Link styling options
 * @returns {HTMLTableRowElement} Complete row element
 */
SocialCalc.RenderRow = function (context, rownum, rowpane, linkstyle) {
    const sheetobj = context.sheetobj;
    const result = document.createElement("tr");
    let colnum, newcol, colpane, newdiv;

    // Add row header if enabled
    if (context.showRCHeaders) {
        newcol = document.createElement("td");
        if (context.classnames) newcol.className = context.classnames.rowname;
        if (context.explicitStyles) newcol.style.cssText = context.explicitStyles.rowname;

        newcol.width = context.rownamewidth;
        newcol.style.verticalAlign = "top"; // Safari positioning fix

        if (!SocialCalc.Constants.SCNoRowName) {
            newcol.innerHTML = rownum + "";
        }

        result.appendChild(newcol);
    }

    // Render cells in all column panes
    for (colpane = 0; colpane < context.colpanes.length; colpane++) {
        // Render cells in this pane
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            newcol = context.RenderCell(rownum, colnum, rowpane, colpane, null, linkstyle);
            if (newcol) result.appendChild(newcol);
        }

        // Add pane divider between column panes (except after last pane)
        if (colpane < context.colpanes.length - 1) {
            newcol = document.createElement("td");
            newcol.width = context.defaultpanedividerwidth;

            if (context.classnames.panedivider) {
                newcol.className = context.classnames.panedivider;
            }
            if (context.explicitStyles.panedivider) {
                newcol.style.cssText = context.explicitStyles.panedivider;
            }

            // Add div for Firefox to avoid squishing
            newdiv = document.createElement("div");
            newdiv.style.width = `${context.defaultpanedividerwidth}px`;
            newdiv.style.overflow = "hidden";
            newcol.appendChild(newdiv);

            result.appendChild(newcol);
        }
    }

    return result;
};

/**
 * Render spacing row between row panes
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @returns {HTMLTableRowElement} Spacing row element
 */
SocialCalc.RenderSpacingRow = function (context) {
    let colnum, newcol, colpane, w;
    const sheetobj = context.sheetobj;
    const result = document.createElement("tr");

    // Add row header spacing if enabled
    if (context.showRCHeaders) {
        newcol = document.createElement("td");
        newcol.width = context.rownamewidth;
        newcol.height = context.defaultpanedividerheight;

        if (context.classnames.panedivider) {
            newcol.className = context.classnames.panedivider;
        }
        if (context.explicitStyles.panedivider) {
            newcol.style.cssText = context.explicitStyles.panedivider;
        }

        result.appendChild(newcol);
    }

    // Add spacing cells for all column panes
    for (colpane = 0; colpane < context.colpanes.length; colpane++) {
        // Add spacing for each column in pane
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            newcol = document.createElement("td");

            w = context.colwidth[colnum];
            if (w) newcol.width = w;
            newcol.height = context.defaultpanedividerheight;

            if (context.classnames.panedivider) {
                newcol.className = context.classnames.panedivider;
            }
            if (context.explicitStyles.panedivider) {
                newcol.style.cssText = context.explicitStyles.panedivider;
            }

            if (newcol) result.appendChild(newcol);
        }

        // Add pane divider spacing between column panes
        if (colpane < context.colpanes.length - 1) {
            newcol = document.createElement("td");
            newcol.width = context.defaultpanedividerwidth;
            newcol.height = context.defaultpanedividerheight;

            if (context.classnames.panedivider) {
                newcol.className = context.classnames.panedivider;
            }
            if (context.explicitStyles.panedivider) {
                newcol.style.cssText = context.explicitStyles.panedivider;
            }

            result.appendChild(newcol);
        }
    }

    return result;
};
/**
 * Column headers, column groups, sizing, and cell rendering functionality
 * 
 * @fileoverview Provides complete rendering pipeline for spreadsheet display including
 * headers, column definitions, cell content, styling, and coordinate utilities
 */

/**
 * Render column headers row with proper styling and pane support
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @returns {HTMLTableRowElement|null} Column headers row element, or null if headers disabled
 * 
 * @description Creates the top header row showing column names (A, B, C, etc.)
 * Includes upper-left corner cell and handles pane dividers between column groups
 */
SocialCalc.RenderColHeaders = function (context) {
    const sheetobj = context.sheetobj;

    if (!context.showRCHeaders) return null;

    const result = document.createElement("tr");
    let colnum, newcol;

    // Create upper-left corner cell
    newcol = document.createElement("td");
    if (context.classnames) newcol.className = context.classnames.upperleft;
    if (context.explicitStyles) newcol.style.cssText = context.explicitStyles.upperleft;
    newcol.width = context.rownamewidth;
    result.appendChild(newcol);

    // Create column header cells for each pane
    for (let colpane = 0; colpane < context.colpanes.length; colpane++) {
        // Add column headers for this pane
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            newcol = document.createElement("td");
            if (context.classnames) newcol.className = context.classnames.colname;
            if (context.explicitStyles) newcol.style.cssText = context.explicitStyles.colname;

            // Add column name unless disabled
            if (!SocialCalc.Constants.SCNoColNames) {
                newcol.innerHTML = SocialCalc.rcColname(colnum);
            }

            result.appendChild(newcol);
        }

        // Add pane divider between column panes (except after last pane)
        if (colpane < context.colpanes.length - 1) {
            newcol = document.createElement("td");
            newcol.width = context.defaultpanedividerwidth;
            if (context.classnames.panedivider) {
                newcol.className = context.classnames.panedivider;
            }
            if (context.explicitStyles.panedivider) {
                newcol.style.cssText = context.explicitStyles.panedivider;
            }
            result.appendChild(newcol);
        }
    }

    return result;
};

/**
 * Render column group element defining column widths for table layout
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @returns {HTMLElement} Column group element with width definitions
 * 
 * @description Creates <colgroup> with <col> elements that define column widths
 * for proper table layout across all panes and dividers
 */
SocialCalc.RenderColGroup = function (context) {
    let colpane, colnum, newcol, t;
    const sheetobj = context.sheetobj;
    const result = document.createElement("colgroup");

    // Add row header column if enabled
    if (context.showRCHeaders) {
        newcol = document.createElement("col");
        newcol.width = context.rownamewidth;
        result.appendChild(newcol);
    }

    // Add column definitions for each pane
    for (colpane = 0; colpane < context.colpanes.length; colpane++) {
        // Add columns for this pane
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            newcol = document.createElement("col");
            t = context.colwidth[colnum];
            if (t) newcol.width = t;
            result.appendChild(newcol);
        }

        // Add pane divider column (except after last pane)
        if (colpane < context.colpanes.length - 1) {
            newcol = document.createElement("col");
            newcol.width = context.defaultpanedividerwidth;
            result.appendChild(newcol);
        }
    }

    return result;
};

/**
 * Render sizing row for proper table layout initialization
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @returns {HTMLTableRowElement} Sizing row element
 * 
 * @description Creates invisible row with height=1 to establish column widths
 * Required for proper table layout in some browsers
 */
SocialCalc.RenderSizingRow = function (context) {
    let colpane, colnum, newcell, t;
    const sheetobj = context.sheetobj;
    const result = document.createElement("tr");

    // Add row header sizing cell if enabled
    if (context.showRCHeaders) {
        newcell = document.createElement("td");
        newcell.style.width = `${context.rownamewidth}px`;
        newcell.height = "1";
        result.appendChild(newcell);
    }

    // Add sizing cells for each pane
    for (colpane = 0; colpane < context.colpanes.length; colpane++) {
        // Add sizing cells for this pane
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            newcell = document.createElement("td");
            t = context.colwidth[colnum];
            if (t) newcell.width = t;
            newcell.height = "1";
            result.appendChild(newcell);
        }

        // Add pane divider sizing cell (except after last pane)
        if (colpane < context.colpanes.length - 1) {
            newcell = document.createElement("td");
            newcell.width = context.defaultpanedividerwidth;
            newcell.height = "1";
            result.appendChild(newcell);
        }
    }

    return result;
};

/**
 * Render a single cell with complete formatting, content, and styling
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {number} rownum - Row number of the cell
 * @param {number} colnum - Column number of the cell
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @param {boolean} [noElement] - If true, creates pseudo-element instead of DOM element
 * @param {Object} [linkstyle] - Link styling options
 * @returns {HTMLTableCellElement|Object|null} Cell element or null if skipped
 * 
 * @description Comprehensive cell rendering including:
 * - Cell content formatting and display
 * - Colspan/rowspan handling for merged cells
 * - Font, color, border, and layout styling
 * - Grid lines and comment indicators
 * - Highlighting for cursor/selection
 * - Custom CSS classes and styles
 */
SocialCalc.RenderCell = function (context, rownum, colnum, rowpane, colpane, noElement, linkstyle) {
    const sheetobj = context.sheetobj;
    let num, t, result, span, stylename, cell, sheetattribs, scdefaults;
    let stylestr = "";

    // Ensure numeric values
    rownum = rownum - 0;
    colnum = colnum - 0;

    const coord = SocialCalc.crToCoord(colnum, rownum);

    // Handle cells within spans
    if (context.cellskip[coord]) {
        // Skip if span starts in this pane
        if (context.CoordInPane(context.cellskip[coord], rowpane, colpane)) {
            return null;
        }

        // Create special cell for spans that start outside visible area
        result = noElement ? SocialCalc.CreatePseudoElement() : document.createElement("td");
        if (context.classnames.skippedcell) {
            result.className = context.classnames.skippedcell;
        }
        if (context.explicitStyles.skippedcell) {
            result.style.cssText = context.explicitStyles.skippedcell;
        }
        result.innerHTML = "&nbsp;"; // Ensure proper height
        return result;
    }

    // Create cell element
    result = noElement ? SocialCalc.CreatePseudoElement() : document.createElement("td");

    // Set cell ID if prefix configured
    if (context.cellIDprefix) {
        result.id = context.cellIDprefix + coord;
    }

    // Get cell data or create empty cell
    cell = sheetobj.cells[coord];
    if (!cell) {
        cell = new SocialCalc.Cell(coord);
    }

    sheetattribs = sheetobj.attribs;
    const scc = SocialCalc.Constants;

    // Handle column spanning
    if (cell.colspan > 1) {
        span = 1;
        for (num = 1; num < cell.colspan; num++) {
            if (
                sheetobj.colattribs.hide[SocialCalc.rcColname(colnum + num)] !== "yes" &&
                context.CellInPane(rownum, colnum + num, rowpane, colpane)
            ) {
                span++;
            }
        }
        result.colSpan = span;
    }

    // Handle row spanning
    if (cell.rowspan > 1) {
        span = 1;
        for (num = 1; num < cell.rowspan; num++) {
            if (
                sheetobj.rowattribs.hide[rownum + num + ""] !== "yes" &&
                context.CellInPane(rownum + num, colnum, rowpane, colpane)
            ) {
                span++;
            }
        }
        result.rowSpan = span;
    }

    // Format and display cell content
    if (cell.displaystring === undefined) {
        // Cache the display value
        cell.displaystring = SocialCalc.FormatValueForDisplay(
            sheetobj,
            cell.datavalue,
            coord,
            linkstyle || context.defaultlinkstyle
        );
    } else {
        // Execute scripts if needed
        SocialCalc.CallOutOnRenderCell(sheetobj, cell.datavalue, coord);
    }
    result.innerHTML = cell.displaystring;

    // Apply layout styling
    num = cell.layout || sheetattribs.defaultlayout;
    if (num) {
        stylestr += context.layouts[num]; // Use precomputed layout
    } else {
        stylestr += scc.defaultCellLayout;
    }

    // Apply font styling
    num = cell.font || sheetattribs.defaultfont;
    if (num) {
        // Use expanded font strings from context
        t = context.fonts[num];
        stylestr += `font-style:${t.style};font-weight:${t.weight};font-size:${t.size};font-family:${t.family};`;
    } else {
        // Apply default font settings
        if (scc.defaultCellFontSize) {
            stylestr += `font-size:${scc.defaultCellFontSize};`;
        }
        if (scc.defaultCellFontFamily) {
            stylestr += `font-family:${scc.defaultCellFontFamily};`;
        }
    }

    // Apply text color
    num = cell.color || sheetattribs.defaultcolor;
    if (num) stylestr += `color:${sheetobj.colors[num]};`;

    // Apply background color
    num = cell.bgcolor || sheetattribs.defaultbgcolor;
    if (num) stylestr += `background-color:${sheetobj.colors[num]};`;

    // Apply text alignment
    num = cell.cellformat;
    if (num) {
        stylestr += `text-align:${sheetobj.cellformats[num]};`;
    } else {
        t = cell.valuetype.charAt(0);
        if (t === "t") {
            // Text value - check for default text alignment
            num = sheetattribs.defaulttextformat;
            if (num) stylestr += `text-align:${sheetobj.cellformats[num]};`;
        } else if (t === "n") {
            // Numeric value - check for default number alignment
            num = sheetattribs.defaultnontextformat;
            if (num) {
                stylestr += `text-align:${sheetobj.cellformats[num]};`;
            } else {
                stylestr += "text-align:right;"; // Default for numbers
            }
        } else {
            stylestr += "text-align:left;"; // Default for other types
        }
    }

    // Apply borders
    num = cell.bt;
    if (num) stylestr += `border-top:${sheetobj.borderstyles[num]};`;

    num = cell.br;
    if (num) {
        stylestr += `border-right:${sheetobj.borderstyles[num]};`;
    } else if (context.showGrid) {
        // Add grid line if no explicit border
        if (context.CellInPane(rownum, colnum + (cell.colspan || 1), rowpane, colpane)) {
            t = SocialCalc.crToCoord(colnum + (cell.colspan || 1), rownum);
        } else {
            t = "nomatch";
        }
        if (context.cellskip[t]) t = context.cellskip[t];
        if (!sheetobj.cells[t] || !sheetobj.cells[t].bl) {
            stylestr += `border-right:${context.gridCSS}`;
        }
    }

    num = cell.bb;
    if (num) {
        stylestr += `border-bottom:${sheetobj.borderstyles[num]};`;
    } else if (context.showGrid) {
        // Add grid line if no explicit border
        if (context.CellInPane(rownum + (cell.rowspan || 1), colnum, rowpane, colpane)) {
            t = SocialCalc.crToCoord(colnum, rownum + (cell.rowspan || 1));
        } else {
            t = "nomatch";
        }
        if (context.cellskip[t]) t = context.cellskip[t];
        if (!sheetobj.cells[t] || !sheetobj.cells[t].bt) {
            stylestr += `border-bottom:${context.gridCSS}`;
        }
    }

    num = cell.bl;
    if (num) stylestr += `border-left:${sheetobj.borderstyles[num]};`;

    // Apply comment styling
    if (cell.comment) {
        if (context.showGrid) {
            if (context.commentClassName) {
                result.className = (result.className ? `${result.className} ` : "") + context.commentClassName;
            }
            stylestr += context.commentCSS;
        } else {
            if (context.commentNoGridClassName) {
                result.className = (result.className ? `${result.className} ` : "") + context.commentNoGridClassName;
            }
            stylestr += context.commentNoGridCSS;
        }
    }

    // Apply computed styles
    result.style.cssText = stylestr;

    // NOTE: csss and cssc are not fully supported yet
    // csss needs parsing to override specific attributes
    // cssc needs className assignment

    // Apply highlighting if present
    t = context.highlights[coord];
    if (t) {
        // Handle cursor highlighting with suffixes
        if (t === "cursor") t += context.cursorsuffix;

        if (context.highlightTypes[t].className) {
            result.className = (result.className ? `${result.className} ` : "") + context.highlightTypes[t].className;
        }

        // Apply highlight styles only if cell is editable
        if (
            t === "cursor" &&
            SocialCalc.Callbacks.IsCoordEditable &&
            !SocialCalc.Callbacks.IsCoordEditable(`${context.sheetobj.sheetname}!${coord}`)
        ) {
            SocialCalc.setStyles(result, "");
        } else {
            SocialCalc.setStyles(result, context.highlightTypes[t].style);
        }
    }

    return result;
};

/**
 * Check if a coordinate is within specified row and column panes
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {string} coord - Cell coordinate to check
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @returns {boolean} True if coordinate is within both panes
 * @throws {Error} If coordinate mapping is invalid
 */
SocialCalc.CoordInPane = function (context, coord, rowpane, colpane) {
    const coordToCR = context.coordToCR[coord];
    if (!coordToCR || !coordToCR.row || !coordToCR.col) {
        throw `Bad coordToCR for ${coord}`;
    }
    return context.CellInPane(coordToCR.row, coordToCR.col, rowpane, colpane);
};

/**
 * Check if a row/column position is within specified panes
 * 
 * @param {SocialCalc.RenderContext} context - The rendering context
 * @param {number} row - Row number to check
 * @param {number} col - Column number to check
 * @param {number} rowpane - Row pane number
 * @param {number} colpane - Column pane number
 * @returns {boolean} True if position is within both panes
 * @throws {Error} If pane numbers are invalid
 */
SocialCalc.CellInPane = function (context, row, col, rowpane, colpane) {
    const panerowlimits = context.rowpanes[rowpane];
    const panecollimits = context.colpanes[colpane];

    if (!panerowlimits || !panecollimits) {
        throw `CellInPane called with unknown panes ${rowpane}/${colpane}`;
    }

    if (row < panerowlimits.first || row > panerowlimits.last) return false;
    if (col < panecollimits.first || col > panecollimits.last) return false;

    return true;
};

/**
 * Create a pseudo-element for non-DOM rendering
 * 
 * @returns {Object} Pseudo-element with basic DOM-like properties
 * 
 * @description Used when noElement parameter is true in cell rendering
 * Provides minimal DOM-like interface for testing or non-visual operations
 */
SocialCalc.CreatePseudoElement = function () {
    return {
        style: { cssText: "" },
        innerHTML: "",
        className: ""
    };
};

// *************************************
//
// Coordinate and utility functions
//
// *************************************

/**
 * Convert column number to column name (A, B, C, ..., Z, AA, AB, ...)
 * 
 * @param {number} c - Column number (1-based, max 702 = ZZ)
 * @returns {string} Column name (e.g., 1 -> "A", 27 -> "AA")
 * 
 * @example
 * SocialCalc.rcColname(1)  // Returns "A"
 * SocialCalc.rcColname(26) // Returns "Z"
 * SocialCalc.rcColname(27) // Returns "AA"
 */
SocialCalc.rcColname = function (c) {
    if (c > 702) c = 702; // Maximum ZZ
    if (c < 1) c = 1;

    const collow = ((c - 1) % 26) + 65;
    const colhigh = Math.floor((c - 1) / 26);

    if (colhigh) {
        return String.fromCharCode(colhigh + 64) + String.fromCharCode(collow);
    } else {
        return String.fromCharCode(collow);
    }
};

/**
 * Letter constants for coordinate conversion
 * @type {Array<string>}
 */
SocialCalc.letters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

/**
 * Convert column and row numbers to coordinate string
 * 
 * @param {number} c - Column number (1-based, max 702)
 * @param {number} r - Row number (1-based)
 * @returns {string} Coordinate string (e.g., "A1", "BB42")
 * 
 * @example
 * SocialCalc.crToCoord(1, 1)   // Returns "A1"
 * SocialCalc.crToCoord(27, 5)  // Returns "AA5"
 */
SocialCalc.crToCoord = function (c, r) {
    if (c < 1) c = 1;
    if (c > 702) c = 702; // Maximum ZZ
    if (r < 1) r = 1;

    const collow = (c - 1) % 26;
    const colhigh = Math.floor((c - 1) / 26);

    let result;
    if (colhigh) {
        result = SocialCalc.letters[colhigh - 1] + SocialCalc.letters[collow] + r;
    } else {
        result = SocialCalc.letters[collow] + r;
    }

    return result;
};

/**
 * Coordinate to column/row caches for performance
 * @type {Object<string, number>}
 */
SocialCalc.coordToCol = {}; // Cache to avoid expensive recalculation
SocialCalc.coordToRow = {};

/**
 * Convert coordinate string to column and row numbers
 * 
 * @param {string} cr - Coordinate string (e.g., "A1", "$B$5")
 * @returns {Object} Object with row and col properties
 * @returns {number} returns.row - Row number (1-based)
 * @returns {number} returns.col - Column number (1-based)
 * 
 * @example
 * SocialCalc.coordToCr("A1")   // Returns {row: 1, col: 1}
 * SocialCalc.coordToCr("$B$5") // Returns {row: 5, col: 2}
 */
SocialCalc.coordToCr = function (cr) {
    // Check cache first
    let r = SocialCalc.coordToRow[cr];
    if (r) return { row: r, col: SocialCalc.coordToCol[cr] };

    let c = 0;
    r = 0;

    // Parse coordinate string character by character
    for (let i = 0; i < cr.length; i++) {
        const ch = cr.charCodeAt(i);
        if (ch === 36) {
            // Skip $ characters
        } else if (ch <= 57) {
            // Numeric characters (0-9)
            r = 10 * r + ch - 48;
        } else if (ch >= 97) {
            // Lowercase letters (a-z)
            c = 26 * c + ch - 96;
        } else if (ch >= 65) {
            // Uppercase letters (A-Z)
            c = 26 * c + ch - 64;
        }
    }

    // Cache results
    SocialCalc.coordToCol[cr] = c;
    SocialCalc.coordToRow[cr] = r;

    return { row: r, col: c };
};

/**
 * Parse a range string into start and end coordinates
 * 
 * @param {string} range - Range string (e.g., "A1:B5" or "A1")
 * @returns {Object} Object with cr1 and cr2 properties
 * @returns {Object} returns.cr1 - Start coordinate {row, col, coord}
 * @returns {Object} returns.cr2 - End coordinate {row, col, coord}
 * 
 * @example
 * SocialCalc.ParseRange("A1:B5") // Returns {cr1: {row:1, col:1, coord:"A1"}, cr2: {row:5, col:2, coord:"B5"}}
 * SocialCalc.ParseRange("A1")    // Returns {cr1: {row:1, col:1, coord:"A1"}, cr2: {row:1, col:1, coord:"A1"}}
 */
SocialCalc.ParseRange = function (range) {
    let pos, cr, cr1, cr2;

    if (!range) range = "A1:A1"; // Error fallback
    range = range.toUpperCase();
    pos = range.indexOf(":");

    if (pos >= 0) {
        // Range format "A1:B5"
        cr = range.substring(0, pos);
        cr1 = SocialCalc.coordToCr(cr);
        cr1.coord = cr;

        cr = range.substring(pos + 1);
        cr2 = SocialCalc.coordToCr(cr);
        cr2.coord = cr;
    } else {
        // Single cell "A1"
        cr1 = SocialCalc.coordToCr(range);
        cr1.coord = range;
        cr2 = SocialCalc.coordToCr(range);
        cr2.coord = range;
    }

    return { cr1: cr1, cr2: cr2 };
};

/**
 * Decode a string from save format, handling escape sequences
 * 
 * @param {string|*} s - String to decode (non-strings returned as-is)
 * @returns {string|*} Decoded string with escape sequences converted
 * 
 * @description Converts escape sequences:
 * - \\c -> : (colon)
 * - \\n -> \n (newline)
 * - \\b -> \ (backslash)
 */
SocialCalc.decodeFromSave = function (s) {
    if (typeof s !== "string") return s;
    if (s.indexOf("\\") === -1) return s; // Performance optimization

    let r = s.replace(/\\c/g, ":");
    r = r.replace(/\\n/g, "\n");
    return r.replace(/\\b/g, "\\");
};

/**
 * Decode a string from AJAX format, handling additional escape sequences
 * 
 * @param {string|*} s - String to decode (non-strings returned as-is)
 * @returns {string|*} Decoded string with escape sequences converted
 * 
 * @description Like decodeFromSave but also converts:
 * - \\e -> ]] (double right bracket)
 */
SocialCalc.decodeFromAjax = function (s) {
    if (typeof s !== "string") return s;
    if (s.indexOf("\\") === -1) return s; // Performance optimization

    let r = s.replace(/\\c/g, ":");
    r = r.replace(/\\n/g, "\n");
    r = r.replace(/\\e/g, "]]");
    return r.replace(/\\b/g, "\\");
};

/**
 * Encode a string for save format, adding escape sequences
 * 
 * @param {string|*} s - String to encode (non-strings returned as-is)
 * @returns {string|*} Encoded string with special characters escaped
 * 
 * @description Converts special characters:
 * - \ -> \\b (backslash must be first)
 * - : -> \\c (colon)
 * - \n -> \\n (newline)
 */
SocialCalc.encodeForSave = function (s) {
    if (typeof s !== "string") return s;

    // Performance optimization: check for characters that need encoding
    if (s.indexOf("\\") !== -1) s = s.replace(/\\/g, "\\b");
    if (s.indexOf(":") !== -1) s = s.replace(/:/g, "\\c");
    if (s.indexOf("\n") !== -1) s = s.replace(/\n/g, "\\n");

    return s;
};
/**
 * Utility functions for SocialCalc spreadsheet operations
 * 
 * @fileoverview Essential utilities for HTML escaping, positioning, styling,
 * viewport calculations, and cell content formatting
 */

/**
 * Escape special HTML characters in a string
 * 
 * @param {string} string - String to escape
 * @returns {string} String with HTML entities for &, <, >, and "
 * 
 * @description Only performs replacements if special characters are found
 * for performance optimization. Essential for preventing XSS attacks
 * when displaying user content in HTML.
 * 
 * @example
 * SocialCalc.special_chars('Hello <world> & "friends"')
 * // Returns: 'Hello &lt;world&gt; &amp; &quot;friends&quot;'
 */
SocialCalc.special_chars = function (string) {
    if (/[&<>"]/.test(string)) {
        // Only do "slow" replacements if something needs replacing
        string = string.replace(/&/g, "&amp;");
        string = string.replace(/</g, "&lt;");
        string = string.replace(/>/g, "&gt;");
        string = string.replace(/"/g, "&quot;");
    }
    return string;
};

/**
 * Lookup value in sorted numeric array
 * 
 * @param {number} value - Value to search for
 * @param {Array<number>} list - Sorted array of numbers
 * @returns {number|null} Index of last value less than or equal to search value,
 *                        or null if all values are greater than search value
 * 
 * @description Used for binary-search-like operations on sorted data.
 * Returns the index of the largest value that is still <= the search value.
 * 
 * @example
 * SocialCalc.Lookup(15, [5, 10, 20, 30]) // Returns 1 (index of 10)
 * SocialCalc.Lookup(2, [5, 10, 20, 30])  // Returns null (all values greater)
 * SocialCalc.Lookup(35, [5, 10, 20, 30]) // Returns 3 (index of 30)
 */
SocialCalc.Lookup = function (value, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i] > value) {
            if (i > 0) return i - 1;
            else return null;
        }
    }
    return list.length - 1; // If all values are smaller, match the last
};

/**
 * Set CSS styles on an element from a CSS text string
 * 
 * @param {HTMLElement} element - DOM element to style
 * @param {string} cssText - CSS declarations separated by semicolons
 *                          (e.g., "color:red;font-size:14px;")
 * 
 * @description Parses CSS text and applies each style property to the element.
 * Handles CSS property names (e.g., "font-size") and converts them appropriately.
 * Safe to call with null/empty cssText.
 * 
 * @example
 * SocialCalc.setStyles(myElement, "color:blue;font-weight:bold;text-align:center;")
 */
SocialCalc.setStyles = function (element, cssText) {
    if (!cssText) return;

    const parts = cssText.split(";");
    for (let part = 0; part < parts.length; part++) {
        const pos = parts[part].indexOf(":"); // Find first colon (could be one in URL)
        if (pos !== -1) {
            const name = parts[part].substring(0, pos);
            const value = parts[part].substring(pos + 1);
            if (name && value) {
                // If non-null name and value, set style
                element.style[name] = value;
            }
        }
    }
};

/**
 * Get viewport dimensions and scroll offsets
 * 
 * @returns {Object} Object with viewport info
 * @returns {number} returns.width - Viewport width in pixels
 * @returns {number} returns.height - Viewport height in pixels  
 * @returns {number} returns.horizontalScroll - Horizontal scroll offset in pixels
 * @returns {number} returns.verticalScroll - Vertical scroll offset in pixels
 * 
 * @description Cross-browser compatible viewport information getter.
 * Based on Flanagan's JavaScript, 5th Edition, page 276.
 * Handles different browser implementations of viewport and scroll properties.
 * 
 * @example
 * const viewport = SocialCalc.GetViewportInfo();
 * console.log(`Viewport: ${viewport.width}x${viewport.height}`);
 * console.log(`Scroll: ${viewport.horizontalScroll}, ${viewport.verticalScroll}`);
 */
SocialCalc.GetViewportInfo = function () {
    const result = {};

    if (window.innerWidth) {
        // All browsers except IE
        result.width = window.innerWidth;
        result.height = window.innerHeight;
        result.horizontalScroll = window.pageXOffset;
        result.verticalScroll = window.pageYOffset;
    } else {
        if (document.documentElement && document.documentElement.clientWidth) {
            // IE standards mode
            result.width = document.documentElement.clientWidth;
            result.height = document.documentElement.clientHeight;
            result.horizontalScroll = document.documentElement.scrollLeft;
            result.verticalScroll = document.documentElement.scrollTop;
        } else if (document.body.clientWidth) {
            // IE quirks mode fallback
            result.width = document.body.clientWidth;
            result.height = document.body.clientHeight;
            result.horizontalScroll = document.body.scrollLeft;
            result.verticalScroll = document.body.scrollTop;
        }
    }

    return result;
};

/**
 * Get element position relative to document
 * 
 * @param {HTMLElement} element - Element to get position for
 * @returns {Object} Position object
 * @returns {number} returns.left - Left offset from document edge in pixels
 * @returns {number} returns.top - Top offset from document edge in pixels
 * 
 * @description Gets absolute position by walking up the offsetParent chain.
 * Based on Goodman's JavaScript & DHTML Cookbook, 2nd Edition, page 415.
 * Does not account for scrolling - see GetElementPositionWithScroll for that.
 * 
 * @example
 * const pos = SocialCalc.GetElementPosition(myElement);
 * console.log(`Element is at ${pos.left}, ${pos.top} relative to document`);
 */
SocialCalc.GetElementPosition = function (element) {
    let offsetLeft = 0;
    let offsetTop = 0;

    while (element) {
        offsetLeft += element.offsetLeft;
        offsetTop += element.offsetTop;
        element = element.offsetParent;
    }

    return { left: offsetLeft, top: offsetTop };
};

/**
 * Get element position relative to document accounting for scroll offsets
 * 
 * @param {HTMLElement} element - Element to get position for
 * @returns {Object} Position object adjusted for scrolling
 * @returns {number} returns.left - Left offset adjusted for scroll
 * @returns {number} returns.top - Top offset adjusted for scroll
 * 
 * @description More accurate position calculation that takes into account
 * scroll offsets by traversing the entire DOM tree. Useful for elements
 * inside scrollable containers.
 * 
 * @example
 * const pos = SocialCalc.GetElementPositionWithScroll(myElement);
 * // Position accounts for any scrolled containers
 */
SocialCalc.GetElementPositionWithScroll = function (element) {
    let offsetLeft = 0;
    let offsetTop = 0;
    let offsetElement = element;

    while (element) {
        if (element.tagName === "HTML") break;

        if (element === offsetElement) {
            offsetLeft += element.offsetLeft;
            offsetTop += element.offsetTop;
            offsetElement = element.offsetParent;
        }

        if (element.scrollLeft) {
            offsetLeft -= element.scrollLeft;
        }
        if (element.scrollTop) {
            offsetTop -= element.scrollTop;
        }

        element = element.parentNode;
    }

    return { left: offsetLeft, top: offsetTop };
};

/**
 * Look up an object in array by matching element property
 * 
 * @param {HTMLElement} element - Element to search for
 * @param {Array<Object>} array - Array of objects with "element" properties
 * @returns {Object|null} First matching object or null if not found
 * 
 * @description Linear search through array for object containing the specified element.
 * Used for finding configuration or data objects associated with DOM elements.
 * 
 * @example
 * const widgets = [{element: div1, config: {...}}, {element: div2, config: {...}}];
 * const widget = SocialCalc.LookupElement(div1, widgets);
 * // Returns: {element: div1, config: {...}}
 */
SocialCalc.LookupElement = function (element, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].element === element) return array[i];
    }
    return null;
};

/**
 * Conditionally assign an ID to an element with prefix
 * 
 * @param {Object} obj - Object that may contain idPrefix property
 * @param {HTMLElement} element - Element to assign ID to
 * @param {string} id - ID suffix to append to prefix
 * 
 * @description Only assigns ID if obj has a non-empty idPrefix property.
 * Used for consistent ID assignment across component instances.
 * 
 * @example
 * const component = { idPrefix: "sheet1_" };
 * SocialCalc.AssignID(component, cellElement, "A1");
 * // Sets cellElement.id = "sheet1_A1"
 */
SocialCalc.AssignID = function (obj, element, id) {
    if (obj.idPrefix) {
        // Object must have a non-empty idPrefix attribute
        element.id = obj.idPrefix + id;
    }
};

/**
 * Get cell contents with appropriate type prefix
 * 
 * @param {SocialCalc.Sheet} sheetobj - Sheet containing the cell
 * @param {string} coord - Cell coordinate (e.g., "A1")
 * @returns {string} Cell contents with prefix indicating type
 * 
 * @description Returns cell contents formatted for display or editing:
 * - Values: returned as-is (no prefix)
 * - Text: prefixed with single quote (')
 * - Formulas: prefixed with equals sign (=)
 * - Constants: returned as formula text (no prefix)
 * - Empty cells: returns empty string
 * 
 * @example
 * SocialCalc.GetCellContents(sheet, "A1") // "123" (number)
 * SocialCalc.GetCellContents(sheet, "B1") // "'Hello" (text)  
 * SocialCalc.GetCellContents(sheet, "C1") // "=A1+B1" (formula)
 */
SocialCalc.GetCellContents = function (sheetobj, coord) {
    let result = "";
    const cellobj = sheetobj.cells[coord];

    if (cellobj) {
        switch (cellobj.datatype) {
            case "v":
                result = cellobj.datavalue + "";
                break;
            case "t":
                result = "'" + cellobj.datavalue;
                break;
            case "f":
                result = "=" + cellobj.formula;
                break;
            case "c":
                result = cellobj.formula;
                break;
            default:
                break;
        }
    }

    return result;
};

/**
 * Format cell value for display with proper HTML escaping and formatting
 * 
 * @param {SocialCalc.Sheet} sheetobj - Sheet containing formatting info
 * @param {string|number} value - Raw cell value to format
 * @param {string} cr - Cell coordinate for accessing cell properties
 * @param {Object} [linkstyle] - Link styling options for wiki/link rendering
 * @returns {string} HTML-formatted string ready for display
 * 
 * @description Comprehensive cell value formatter that:
 * - Handles different value types (text, numeric, error)
 * - Applies cell-specific or sheet default formatting
 * - Processes wiki markup and links if enabled
 * - HTML-escapes content for safe display
 * - Handles special formats like formulas and custom formats
 * 
 * @example
 * const display = SocialCalc.FormatValueForDisplay(sheet, 123.45, "A1", null);
 * // Returns formatted number based on cell's number format
 */
SocialCalc.FormatValueForDisplay = function (sheetobj, value, cr, linkstyle) {
    let valueformat, has_parens, has_commas, valuetype, valuesubtype;
    let displayvalue;

    const sheetattribs = sheetobj.attribs;
    const scc = SocialCalc.Constants;

    let cell = sheetobj.cells[cr];

    if (!cell) {
        // Get an empty cell if not there
        cell = new SocialCalc.Cell(cr);
    }

    displayvalue = value;

    valuetype = cell.valuetype || ""; // Get type of value to determine formatting
    valuesubtype = valuetype.substring(1);
    valuetype = valuetype.charAt(0);

    if (cell.errors || valuetype === "e") {
        displayvalue = cell.errors || valuesubtype || "Error in cell";
        return displayvalue;
    }

    if (valuetype === "t") {
        // Text value processing
        valueformat =
            sheetobj.valueformats[cell.textvalueformat - 0] ||
            sheetobj.valueformats[sheetattribs.defaulttextvalueformat - 0] ||
            "";

        if (valueformat === "formula") {
            if (cell.datatype === "f") {
                displayvalue = SocialCalc.special_chars("=" + cell.formula) || "&nbsp;";
            } else if (cell.datatype === "c") {
                displayvalue = SocialCalc.special_chars("'" + cell.formula) || "&nbsp;";
            } else {
                displayvalue = SocialCalc.special_chars("'" + displayvalue) || "&nbsp;";
            }
            return displayvalue;
        }

        displayvalue = SocialCalc.format_text_for_display(
            displayvalue,
            cell.valuetype,
            valueformat,
            sheetobj,
            linkstyle
        );

        if (valueformat === "text-html") {
            SocialCalc.ScriptCheck(sheetobj.sheetid, cr, value);
        }

    } else if (valuetype === "n") {
        // Numeric value processing
        valueformat = cell.nontextvalueformat;
        if (valueformat == null || valueformat === "") {
            valueformat = sheetattribs.defaultnontextvalueformat;
        }
        valueformat = sheetobj.valueformats[valueformat - 0];
        if (valueformat == null || valueformat === "none") {
            valueformat = "";
        }

        if (valueformat === "formula") {
            if (cell.datatype === "f") {
                displayvalue = SocialCalc.special_chars("=" + cell.formula) || "&nbsp;";
            } else if (cell.datatype === "c") {
                displayvalue = SocialCalc.special_chars("'" + cell.formula) || "&nbsp;";
            } else {
                displayvalue = SocialCalc.special_chars("'" + displayvalue) || "&nbsp;";
            }
            return displayvalue;
        } else if (valueformat === "forcetext") {
            if (cell.datatype === "f") {
                displayvalue = SocialCalc.special_chars("=" + cell.formula) || "&nbsp;";
            } else if (cell.datatype === "c") {
                displayvalue = SocialCalc.special_chars(cell.formula) || "&nbsp;";
            } else {
                displayvalue = SocialCalc.special_chars(displayvalue) || "&nbsp;";
            }
            return displayvalue;
        }

        displayvalue = SocialCalc.format_number_for_display(
            displayvalue,
            cell.valuetype,
            valueformat
        );
    } else {
        // Unknown type - probably blank
        displayvalue = "&nbsp;";
    }

    return displayvalue;
};

/**
 * Format text values for display with markup processing
 * 
 * @param {string} rawvalue - Raw text value
 * @param {string} valuetype - Value type with subtype
 * @param {string} valueformat - Format specification
 * @param {SocialCalc.Sheet} sheetobj - Sheet object for context
 * @param {Object} [linkstyle] - Link styling options
 * @returns {string} Formatted HTML string
 * 
 * @description Processes text values according to format specification:
 * - text-plain: HTML-escaped plain text
 * - text-html: Raw HTML (use with caution)
 * - text-wiki: Wiki markup processing
 * - text-url: Convert to clickable link
 * - text-link: Advanced link processing
 * - text-image: Convert to image tag
 * - text-custom: Custom format with placeholders
 * - hidden: Returns non-breaking space
 * 
 * Preserves spaces and line breaks in formatted output.
 */
SocialCalc.format_text_for_display = function (rawvalue, valuetype, valueformat, sheetobj, linkstyle) {
    let valuesubtype, dvsc, dvue, textval;
    let displayvalue;

    valuesubtype = valuetype.substring(1);
    displayvalue = rawvalue;

    if (valueformat === "none" || valueformat == null) valueformat = "";
    if (!/^(text-|custom|hidden)/.test(valueformat)) valueformat = "";

    if (valueformat === "" || valueformat === "General") {
        // Determine format from type
        if (valuesubtype === "h") valueformat = "text-html";
        if (valuesubtype === "w" || valuesubtype === "r") valueformat = "text-wiki";
        if (valuesubtype === "l") valueformat = "text-link";
        if (!valuesubtype) valueformat = "text-plain";
    }

    if (valueformat === "text-html") {
        // HTML - output as is
    } else if (SocialCalc.Callbacks.expand_wiki && /^text-wiki/.test(valueformat)) {
        // Do general wiki markup
        displayvalue = SocialCalc.Callbacks.expand_wiki(displayvalue, sheetobj, linkstyle, valueformat);
    } else if (valueformat === "text-wiki") {
        // Wiki-text - encode then output
        displayvalue = SocialCalc.special_chars(displayvalue);
    } else if (valueformat === "text-url") {
        // Text is a URL for a link
        dvsc = SocialCalc.special_chars(displayvalue);
        dvue = encodeURI(displayvalue);
        displayvalue = `<a href="${dvue}">${dvsc}</a>`;
    } else if (valueformat === "text-link") {
        // More extensive link capabilities for regular web links
        displayvalue = SocialCalc.expand_text_link(displayvalue, sheetobj, linkstyle, valueformat);
    } else if (valueformat === "text-image") {
        // Text is a URL for an image
        dvue = encodeURI(displayvalue);
        displayvalue = `<img src="${dvue}">`;
    } else if (valueformat.substring(0, 12) === "text-custom:") {
        // Construct a custom text format: @r = text raw, @s = special chars, @u = url encoded
        dvsc = SocialCalc.special_chars(displayvalue); // Do special chars
        dvsc = dvsc.replace(/  /g, "&nbsp; "); // Keep multiple spaces
        dvsc = dvsc.replace(/\n/g, "<br>"); // Keep line breaks
        dvue = encodeURI(displayvalue);
        textval = {};
        textval.r = displayvalue;
        textval.s = dvsc;
        textval.u = dvue;
        displayvalue = valueformat.substring(12); // Remove "text-custom:"
        displayvalue = displayvalue.replace(/@(r|s|u)/g, function (a, c) {
            return textval[c];
        }); // Replace placeholders
    } else if (valueformat.substring(0, 6) === "custom") {
        // Custom format
        displayvalue = SocialCalc.special_chars(displayvalue); // Do special chars
        displayvalue = displayvalue.replace(/  /g, "&nbsp; "); // Keep multiple spaces
        displayvalue = displayvalue.replace(/\n/g, "<br>"); // Keep line breaks
        displayvalue += " (custom format)";
    } else if (valueformat === "hidden") {
        displayvalue = "&nbsp;";
    } else {
        // Plain text
        displayvalue = SocialCalc.special_chars(displayvalue); // Do special chars
        displayvalue = displayvalue.replace(/  /g, "&nbsp; "); // Keep multiple spaces
        displayvalue = displayvalue.replace(/\n/g, "<br>"); // Keep line breaks
    }

    return displayvalue;
};
/**
 * Number formatting and value type determination for SocialCalc
 * 
 * @fileoverview Functions for formatting numeric values for display and 
 * determining data types from user input strings
 */

/**
 * Format a numeric value for display based on type and format specification
 * 
 * @param {number|string} rawvalue - Raw numeric value to format
 * @param {string} valuetype - Value type string (e.g., "n", "n%", "n$", "nd")
 * @param {string} valueformat - Format specification or "Auto" for default
 * @returns {string} Formatted string ready for HTML display
 * 
 * @description Handles various numeric display formats:
 * - Auto formatting based on value subtype (%, $, dates, times, logical)
 * - Custom format strings processed by FormatNumber module
 * - Logical values displayed as TRUE/FALSE
 * - Hidden values displayed as non-breaking space
 * 
 * @example
 * SocialCalc.format_number_for_display(0.15, "n%", "Auto") // "15.0%"
 * SocialCalc.format_number_for_display(1234.56, "n$", "Auto") // "$1,234.56"
 * SocialCalc.format_number_for_display(1, "nl", "logical") // "TRUE"
 */
SocialCalc.format_number_for_display = function (rawvalue, valuetype, valueformat) {
    let value, valuesubtype;
    const scc = SocialCalc.Constants;

    value = rawvalue - 0; // Convert to number
    valuesubtype = valuetype.substring(1);

    if (valueformat === "Auto" || valueformat === "") {
        // Cases with default format based on value subtype
        if (valuesubtype === "%") {
            valueformat = "#,##0.0%";
        } else if (valuesubtype === "$") {
            valueformat = "[$]#,##0.00";
        } else if (valuesubtype === "dt") {
            valueformat = scc.defaultFormatdt;
        } else if (valuesubtype === "d") {
            valueformat = scc.defaultFormatd;
        } else if (valuesubtype === "t") {
            valueformat = scc.defaultFormatt;
        } else if (valuesubtype === "l") {
            valueformat = "logical";
        } else {
            valueformat = "General";
        }
    }

    if (valueformat === "logical") {
        // Handle logical format (TRUE/FALSE)
        return value ? scc.defaultDisplayTRUE : scc.defaultDisplayFALSE;
    }

    if (valueformat === "hidden") {
        // Handle hidden format
        return "&nbsp;";
    }

    // Use FormatNumber module for formatting
    return SocialCalc.FormatNumber.formatNumberWithFormat(rawvalue, valueformat, "");
};

/**
 * Determine the data type and parsed value from raw input string
 * 
 * @param {string} rawvalue - Raw input string from user
 * @returns {Object} Object with parsed value and type
 * @returns {number|string} returns.value - Parsed value (numeric or string)
 * @returns {string} returns.type - Data type ("t"=text, "n"=number, "n%"=percent, etc.)
 * 
 * @description Analyzes input strings and determines appropriate data types:
 * - Numbers: integers, decimals, scientific notation
 * - Percentages: numbers followed by %
 * - Currency: numbers with $ symbol
 * - Dates: MM/DD/YYYY, YYYY-MM-DD formats
 * - Times: HH:MM, HH:MM:SS formats  
 * - Fractions: mixed numbers like "1 1/2"
 * - Constants: TRUE, FALSE, error values
 * - URLs: strings starting with http://
 * - Default: text type for unrecognized patterns
 * 
 * Follows spreadsheet VALUE() function specification for type detection.
 * 
 * @example
 * SocialCalc.DetermineValueType("123.45") // {value: 123.45, type: "n"}
 * SocialCalc.DetermineValueType("15%") // {value: 0.15, type: "n%"}
 * SocialCalc.DetermineValueType("$1,234.56") // {value: 1234.56, type: "n$"}
 * SocialCalc.DetermineValueType("2023-12-25") // {value: 45291, type: "nd"}
 * SocialCalc.DetermineValueType("TRUE") // {value: 1, type: "nl"}
 */
SocialCalc.DetermineValueType = function (rawvalue) {
    let value = rawvalue + "";
    let type = "t";
    let tvalue, matches, year, hour, minute, second, denom, num, intgr, constr;

    // Remove leading and trailing whitespace
    tvalue = value.replace(/^\s+/, "").replace(/\s+$/, "");

    if (value.length === 0) {
        type = "";
    } else if (value.match(/^\s+$/)) {
        // Just blanks - leave type "t"
    } else if (tvalue.match(/^[-+]?\d*(?:\.)?\d*(?:[eE][-+]?\d+)?$/)) {
        // General number, including scientific notation
        value = tvalue - 0;
        if (isNaN(value)) {
            // Leave alone - catches things like plain "-"
            value = rawvalue + "";
        } else {
            type = "n";
        }
    } else if (tvalue.match(/^[-+]?\d*(?:\.)?\d*\s*%$/)) {
        // Percent form: 15.1%
        value = (tvalue.slice(0, -1) - 0) / 100;
        type = "n%";
    } else if (tvalue.match(/^[-+]?\$\s*\d*(?:\.)?\d*\s*$/) && tvalue.match(/\d/)) {
        // Dollar format: $1.49
        value = tvalue.replace(/\$/, "") - 0;
        type = "n$";
    } else if (tvalue.match(/^[-+]?(\d*,\d*)+(?:\.)?\d*$/)) {
        // Number format ignoring commas: 1,234.49
        value = tvalue.replace(/,/g, "") - 0;
        type = "n";
    } else if (tvalue.match(/^[-+]?(\d*,\d*)+(?:\.)?\d*\s*%$/)) {
        // Percent with commas: 1,234.49%
        value = (tvalue.replace(/[%,]/g, "") - 0) / 100;
        type = "n%";
    } else if (tvalue.match(/^[-+]?\$\s*(\d*,\d*)+(?:\.)?\d*$/) && tvalue.match(/\d/)) {
        // Dollar and commas: $1,234.49
        value = tvalue.replace(/[\$,]/g, "") - 0;
        type = "n$";
    } else if ((matches = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{1,4})\s*$/))) {
        // MM/DD/YYYY, MM-DD-YYYY
        year = matches[3] - 0;
        year = year < 1000 ? year + 2000 : year;
        value = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(
            year,
            matches[1] - 0,
            matches[2] - 0
        ) - 2415019;
        type = "nd";
    } else if ((matches = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*$/))) {
        // YYYY-MM-DD, YYYY/MM/DD
        year = matches[1] - 0;
        year = year < 1000 ? year + 2000 : year;
        value = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(
            year,
            matches[2] - 0,
            matches[3] - 0
        ) - 2415019;
        type = "nd";
    } else if ((matches = value.match(/^(\d{1,2}):(\d{1,2})\s*$/))) {
        // HH:MM
        hour = matches[1] - 0;
        minute = matches[2] - 0;
        if (hour < 24 && minute < 60) {
            value = hour / 24 + minute / (24 * 60);
            type = "nt";
        }
    } else if ((matches = value.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*$/))) {
        // HH:MM:SS
        hour = matches[1] - 0;
        minute = matches[2] - 0;
        second = matches[3] - 0;
        if (hour < 24 && minute < 60 && second < 60) {
            value = hour / 24 + minute / (24 * 60) + second / (24 * 60 * 60);
            type = "nt";
        }
    } else if ((matches = value.match(/^\s*([-+]?\d+) (\d+)\/(\d+)\s*$/))) {
        // Mixed number: 1 1/2
        intgr = matches[1] - 0;
        num = matches[2] - 0;
        denom = matches[3] - 0;
        if (denom && denom > 0) {
            value = intgr + (intgr < 0 ? -num / denom : num / denom);
            type = "n";
        }
    } else if ((constr = SocialCalc.InputConstants[value.toUpperCase()])) {
        // Special constants like "FALSE" and "#N/A"
        num = constr.indexOf(",");
        value = constr.substring(0, num) - 0;
        type = constr.substring(num + 1);
    } else if (tvalue.length > 7 && tvalue.substring(0, 7).toLowerCase() === "http://") {
        // URL
        value = tvalue;
        type = "tl";
    }

    return { value: value, type: type };
};

/**
 * Constants for special input values that convert to specific types
 * @type {Object<string, string>}
 * @description Maps uppercase input strings to "value,type" format
 * Used by DetermineValueType for recognizing special constants
 */
SocialCalc.InputConstants = {
    // Boolean and error constants
    TRUE: "1,nl",
    FALSE: "0,nl",
    "#N/A": "0,e#N/A",
    "#NULL!": "0,e#NULL!",
    "#NUM!": "0,e#NUM!",
    "#DIV/0!": "0,e#DIV/0!",
    "#VALUE!": "0,e#VALUE!",
    "#REF!": "0,e#REF!",
    "#NAME?": "0,e#NAME?",
};

/**
 * Default markup expansion function (placeholder implementation)
 * 
 * @param {string} displayvalue - Text to process
 * @param {SocialCalc.Sheet} sheetobj - Sheet object for context
 * @param {Object} [linkstyle] - Link styling options
 * @returns {string} Processed text with minimal markup
 * 
 * @description Placeholder for wiki-text processing. Should be replaced
 * by application-specific markup expansion routine. Default implementation
 * only escapes HTML and preserves spaces/line breaks.
 */
SocialCalc.default_expand_markup = function (displayvalue, sheetobj, linkstyle) {
    let result = displayvalue;

    result = SocialCalc.special_chars(result); // Escape HTML
    result = result.replace(/  /g, "&nbsp; "); // Preserve multiple spaces
    result = result.replace(/\n/g, "<br>"); // Preserve line breaks

    return result; // Very minimal processing by default

    // Commented out: Example wiki-style formatting
    // result = result.replace(/('*)'''(.*?)'''/g, "$1<b>$2</b>"); // Bold
    // result = result.replace(/''(.*?)''/g, "<i>$1</i>"); // Italics
    // return result;
};

/**
 * Expand text link markup into HTML anchor elements
 * 
 * @param {string} displayvalue - Link text to parse
 * @param {SocialCalc.Sheet} sheetobj - Sheet object for context
 * @param {Object} [linkstyle] - Link styling options
 * @param {string} [valueformat] - Value format specification
 * @returns {string} HTML anchor element
 * 
 * @description Parses various link text formats:
 * - Plain URLs: http://example.com
 * - URLs with descriptions: "Description"<http://example.com>
 * - Page references: [Page Name] or {Workspace [Page Name]}
 * - New window indicators: <<URL>> or [[Page]]
 * 
 * @example
 * SocialCalc.expand_text_link("http://example.com", sheet, null)
 * // Returns: '<a href="http://example.com" target="_blank">example.com</a>'
 * 
 * SocialCalc.expand_text_link('"Click here"<http://example.com>', sheet, null)
 * // Returns: '<a href="http://example.com" target="_blank">Click here</a>'
 */
SocialCalc.expand_text_link = function (displayvalue, sheetobj, linkstyle, valueformat) {
    let desc, tb, str;
    const scc = SocialCalc.Constants;

    let url = "";
    const parts = SocialCalc.ParseCellLinkText(displayvalue + "");

    if (parts.desc) {
        desc = SocialCalc.special_chars(parts.desc);
    } else {
        desc = parts.pagename
            ? scc.defaultPageLinkFormatString
            : scc.defaultLinkFormatString;
    }

    // Remove http:// prefix from display unless explicitly specified
    if (
        displayvalue.length > 7 &&
        displayvalue.substring(0, 7).toLowerCase() === "http://" &&
        displayvalue.charAt(displayvalue.length - 1) !== ">"
    ) {
        desc = desc.substring(7);
    }

    // Set target for new window
    tb = parts.newwin || !linkstyle ? ' target="_blank"' : "";

    if (parts.pagename) {
        if (SocialCalc.Callbacks.MakePageLink) {
            url = SocialCalc.Callbacks.MakePageLink(
                parts.pagename,
                parts.workspacename,
                linkstyle,
                valueformat
            );
        }
    } else {
        url = encodeURI(parts.url);
    }

    str = `<a href="${url}"${tb}>${desc}</a>`;
    return str;
};

/**
 * Parse cell link text into component parts
 * 
 * @param {string} str - Link text to parse
 * @returns {Object} Parsed link components
 * @returns {string} returns.url - URL for web links
 * @returns {string} returns.desc - Link description/display text
 * @returns {boolean} returns.newwin - Whether to open in new window
 * @returns {string} returns.pagename - Page name for internal links
 * @returns {string} returns.workspace - Workspace name for internal links
 * 
 * @description Supports multiple link text formats:
 * 
 * **URL formats:**
 * - url
 * - <url>
 * - desc<url>
 * - "desc"<url>
 * - <<url>> (new window)
 * 
 * **Page formats:**
 * - [page name]
 * - "desc"[page name]
 * - desc[page name]
 * - {workspace [page name]}
 * - "desc"{workspace [page name]}
 * - [[page]] (new window)
 * 
 * @example
 * SocialCalc.ParseCellLinkText('"Example"<http://example.com>')
 * // Returns: {url: "http://example.com", desc: "Example", newwin: false, ...}
 * 
 * SocialCalc.ParseCellLinkText('{Wiki [Main Page]}')
 * // Returns: {pagename: "Main Page", workspace: "Wiki", newwin: false, ...}
 */
SocialCalc.ParseCellLinkText = function (str) {
    const result = {
        url: "",
        desc: "",
        newwin: false,
        pagename: "",
        workspace: "",
    };

    let pageform = false;
    let urlend = str.length - 1;
    let descstart = 0;
    const lastlt = str.lastIndexOf("<");
    const lastbrkt = str.lastIndexOf("[");
    const lastbrace = str.lastIndexOf("{");
    let descend = -1;

    // Determine format type and extract components
    if (
        (str.charAt(urlend) !== ">" || lastlt === -1) &&
        (str.charAt(urlend) !== "]" || lastbrkt === -1) &&
        (str.charAt(urlend) !== "}" ||
            str.charAt(urlend - 1) !== "]" ||
            lastbrace === -1 ||
            lastbrkt === -1 ||
            lastbrkt < lastbrace)
    ) {
        // Plain URL
        urlend++;
        descend = urlend;
    } else {
        // Markup format
        if (str.charAt(urlend) === ">") {
            // URL form: <url> or desc<url>
            descend = lastlt - 1;
            if (
                lastlt > 0 &&
                str.charAt(descend) === "<" &&
                str.charAt(urlend - 1) === ">"
            ) {
                descend--;
                urlend--;
                result.newwin = true;
            }
        } else if (str.charAt(urlend) === "]") {
            // Page form: [page] or desc[page]
            descend = lastbrkt - 1;
            pageform = true;
            if (
                lastbrkt > 0 &&
                str.charAt(descend) === "[" &&
                str.charAt(urlend - 1) === "]"
            ) {
                descend--;
                urlend--;
                result.newwin = true;
            }
        } else if (str.charAt(urlend) === "}") {
            // Workspace and page form: {workspace [page]}
            descend = lastbrace - 1;
            pageform = true;
            let wsend = lastbrkt;
            urlend--;
            if (
                lastbrkt > 0 &&
                str.charAt(lastbrkt - 1) === "[" &&
                str.charAt(urlend - 1) === "]"
            ) {
                wsend = lastbrkt - 1;
                urlend--;
                result.newwin = true;
            }
            if (str.charAt(wsend - 1) === " ") {
                // Trim trailing space in workspace name
                wsend--;
            }
            result.workspace = str.substring(lastbrace + 1, wsend) || "";
        }

        if (str.charAt(descend) === " ") {
            // Trim trailing space on description
            descend--;
        }

        if (str.charAt(descstart) === '"' && str.charAt(descend) === '"') {
            // Remove surrounding quotes from description
            descstart++;
            descend--;
        }
    }

    // Extract URL or page name
    if (pageform) {
        result.pagename = str.substring(lastbrkt + 1, urlend) || "";
    } else {
        result.url = str.substring(lastlt + 1, urlend) || "";
    }

    // Extract description
    if (descend >= descstart) {
        result.desc = str.substring(descstart, descend + 1);
    }

    return result;
};

/**
 * Convert saved sheet data to other output formats
 * 
 * @param {string} savestr - Sheet data in save format
 * @param {string} outputformat - Target format: "scsave", "html", "csv", "tab"
 * @param {boolean} dorecalc - Whether to recalculate (OBSOLETE - throws error)
 * @returns {string} Converted data in requested format
 * 
 * @description Converts SocialCalc save format to various output formats:
 * - "scsave": Returns original save format unchanged
 * - "html": Renders as HTML table using RenderContext
 * - "csv": Comma-separated values with proper escaping
 * - "tab": Tab-delimited values with quote escaping for multi-line content
 * 
 * For CSV and tab formats, handles:
 * - Quote escaping (double quotes for embedded quotes)
 * - Multi-line content (quoted)
 * - Proper delimiter separation
 * 
 * @throws {Error} If dorecalc is true (no longer supported)
 * 
 * @example
 * const csvData = SocialCalc.ConvertSaveToOtherFormat(saveString, "csv", false);
 * const htmlTable = SocialCalc.ConvertSaveToOtherFormat(saveString, "html", false);
 */
SocialCalc.ConvertSaveToOtherFormat = function (savestr, outputformat, dorecalc) {
    let sheet, context, clipextents, div, ele, row, col, cr, cell, str;
    let result = "";

    if (outputformat === "scsave") {
        return savestr;
    }

    if (savestr === "") {
        return "";
    }

    sheet = new SocialCalc.Sheet();
    sheet.ParseSheetSave(savestr);

    if (dorecalc) {
        // No longer supported as of 9/10/08
        // Recalc is now async, so can't do it this way
        throw "SocialCalc.ConvertSaveToOtherFormat: Not doing recalc.";
    }

    // Determine range to convert
    if (sheet.copiedfrom) {
        clipextents = SocialCalc.ParseRange(sheet.copiedfrom);
    } else {
        clipextents = {
            cr1: { row: 1, col: 1 },
            cr2: { row: sheet.attribs.lastrow, col: sheet.attribs.lastcol },
        };
    }

    if (outputformat === "html") {
        // Render as HTML table
        context = new SocialCalc.RenderContext(sheet);
        if (sheet.copiedfrom) {
            context.rowpanes[0] = {
                first: clipextents.cr1.row,
                last: clipextents.cr2.row,
            };
            context.colpanes[0] = {
                first: clipextents.cr1.col,
                last: clipextents.cr2.col,
            };
        }
        div = document.createElement("div");
        ele = context.RenderSheet(null, context.defaultHTMLlinkstyle);
        div.appendChild(ele);

        // Clean up references
        context = undefined;
        sheet = undefined;
        result = div.innerHTML;
        ele = undefined;
        div = undefined;

        return result;
    }

    // Process each cell for CSV/tab format
    for (row = clipextents.cr1.row; row <= clipextents.cr2.row; row++) {
        for (col = clipextents.cr1.col; col <= clipextents.cr2.col; col++) {
            cr = SocialCalc.crToCoord(col, row);
            cell = sheet.GetAssuredCell(cr);

            if (cell.errors) {
                str = cell.errors;
            } else {
                str = cell.datavalue + ""; // Get value as text
            }

            if (outputformat === "csv") {
                // Handle CSV formatting
                if (str.indexOf('"') !== -1) {
                    str = str.replace(/"/g, '""'); // Double quotes
                }
                if (/[, \n"]/.test(str)) {
                    str = `"${str}"`; // Add quotes if needed
                }
                if (col > clipextents.cr1.col) {
                    str = "," + str; // Add commas between columns
                }
            } else if (outputformat === "tab") {
                // Handle tab-delimited formatting
                if (str.indexOf("\n") !== -1) {
                    // If multiple lines
                    if (str.indexOf('"') !== -1) {
                        str = str.replace(/"/g, '""'); // Double quotes
                    }
                    str = `"${str}"`; // Add quotes
                }
                if (col > clipextents.cr1.col) {
                    str = "\t" + str; // Add tabs between columns
                }
            }

            result += str;
        }
        result += "\n"; // End of row
    }

    return result;
};
/**
 * Format conversion and touch gesture support for SocialCalc
 * 
 * @fileoverview Functions for converting between different data formats (CSV, Tab, HTML)
 * and comprehensive touch gesture support for mobile devices
 */

/**
 * Convert input data from various formats to SocialCalc save format
 * 
 * @param {string} inputstr - Input data string to convert
 * @param {string} inputformat - Source format: "scsave", "csv", "tab"
 * @returns {string} Data converted to SocialCalc save format
 * 
 * @description Parses input data and converts to internal save format:
 * - "scsave": Returns unchanged (already in save format)
 * - "csv": Parses comma-separated values with proper quote handling
 * - "tab": Parses tab-delimited values with proper quote handling
 * 
 * Handles complex CSV/tab parsing including:
 * - Multi-line quoted values
 * - Embedded quotes (doubled quotes)
 * - Mixed quoted/unquoted values
 * - Proper delimiter detection
 * 
 * @example
 * const csvData = 'Name,Age\n"John, Jr",25\n"Jane ""Doe""",30';
 * const saveData = SocialCalc.ConvertOtherFormatToSave(csvData, "csv");
 * // Converts CSV to internal sheet format
 */
SocialCalc.ConvertOtherFormatToSave = function (inputstr, inputformat) {
    let sheet, context, lines, i, line, value, inquote, j, ch, values, row, col, cr, maxc;
    let result = "";

    /**
     * Add current value as a cell and move to next column
     * @private
     */
    const AddCell = function () {
        col++;
        if (col > maxc) maxc = col;
        cr = SocialCalc.crToCoord(col, row);
        SocialCalc.SetConvertedCell(sheet, cr, value);
        value = "";
    };

    if (inputformat === "scsave") {
        return inputstr;
    }

    sheet = new SocialCalc.Sheet();
    lines = inputstr.split(/\r\n|\n/);
    maxc = 0;

    if (inputformat === "csv") {
        row = 0;
        inquote = false;

        for (i = 0; i < lines.length; i++) {
            if (i === lines.length - 1 && lines[i] === "") {
                // Extra null line - ignore
                break;
            }

            if (inquote) {
                // If in quote, continue from where left off
                value += "\n";
            } else {
                // Otherwise start next row
                value = "";
                row++;
                col = 0;
            }

            line = lines[i];
            for (j = 0; j < line.length; j++) {
                ch = line.charAt(j);

                if (ch === '"') {
                    if (inquote) {
                        if (j < line.length - 1 && line.charAt(j + 1) === '"') {
                            // Double quotes - add one quote to value
                            j++; // Skip the second quote
                            value += '"';
                        } else {
                            inquote = false;
                            if (j === line.length - 1) {
                                // At end of line
                                AddCell();
                            }
                        }
                    } else {
                        inquote = true;
                    }
                    continue;
                }

                if (ch === "," && !inquote) {
                    AddCell();
                } else {
                    value += ch;
                }

                if (j === line.length - 1 && !inquote) {
                    AddCell();
                }
            }
        }

        if (maxc > 0) {
            sheet.attribs.lastrow = row;
            sheet.attribs.lastcol = maxc;
            result = sheet.CreateSheetSave(`A1:${SocialCalc.crToCoord(maxc, row)}`);
        }
    }

    if (inputformat === "tab") {
        row = 0;
        inquote = false;

        for (i = 0; i < lines.length; i++) {
            if (i === lines.length - 1 && lines[i] === "") {
                // Extra null line - ignore
                break;
            }

            if (inquote) {
                // If in quote, continue from where left off
                value += "\n";
            } else {
                // Otherwise start next row
                value = "";
                row++;
                col = 0;
            }

            line = lines[i];
            for (j = 0; j < line.length; j++) {
                ch = line.charAt(j);

                if (ch === '"') {
                    if (inquote) {
                        if (j < line.length - 1) {
                            if (line.charAt(j + 1) === '"') {
                                // Double quotes - add one quote to value
                                j++; // Skip the second quote
                                value += '"';
                            } else if (line.charAt(j + 1) === "\t") {
                                // End of quoted item
                                j++;
                                inquote = false;
                                AddCell();
                            }
                        } else {
                            // At end of line
                            inquote = false;
                            AddCell();
                        }
                        continue;
                    }
                    if (value === "") {
                        // Quote at start of item
                        inquote = true;
                        continue;
                    }
                }

                if (ch === "\t" && !inquote) {
                    AddCell();
                } else {
                    value += ch;
                }

                if (j === line.length - 1 && !inquote) {
                    AddCell();
                }
            }
        }

        if (maxc > 0) {
            sheet.attribs.lastrow = row;
            sheet.attribs.lastcol = maxc;
            result = sheet.CreateSheetSave(`A1:${SocialCalc.crToCoord(maxc, row)}`);
        }
    }

    return result;
};

/**
 * Set a cell with a value and type determined from raw input
 * 
 * @param {SocialCalc.Sheet} sheet - Sheet to add cell to
 * @param {string} cr - Cell coordinate (e.g., "A1")
 * @param {string} rawvalue - Raw input value to parse and store
 * 
 * @description Analyzes raw value and sets appropriate cell type:
 * - Numbers that don't need formatting: stored as value (v)
 * - Text values: stored as text (t)
 * - Special number types (dates, currency, etc.): stored as constant (c) with original formula
 */
SocialCalc.SetConvertedCell = function (sheet, cr, rawvalue) {
    const cell = sheet.GetAssuredCell(cr);
    const value = SocialCalc.DetermineValueType(rawvalue);

    if (value.type === "n" && value.value == rawvalue) {
        // Simple number - no need for "constant" to remember original value
        cell.datatype = "v";
        cell.valuetype = "n";
        cell.datavalue = value.value;
    } else if (value.type.charAt(0) === "t") {
        // Text of some sort, left unchanged
        cell.datatype = "t";
        cell.valuetype = value.type;
        cell.datavalue = value.value;
    } else {
        // Special number types (dates, currency, etc.)
        cell.datatype = "c";
        cell.valuetype = value.type;
        cell.datavalue = value.value;
        cell.formula = rawvalue;
    }
};

// *************************************
//
// Touch Gesture Support for Mobile Devices
//
// *************************************

/**
 * Touch support detection and initialization
 * @description Automatically detects mobile devices and enables touch handling
 */
SocialCalc.HasTouch = false;

(function () {
    // Platform-specific touch detection
    const agent = navigator.userAgent.toLowerCase();

    if (
        agent.indexOf("iphone") >= 0 ||
        agent.indexOf("ipad") >= 0 ||
        agent.indexOf("android") >= 0
    ) {
        SocialCalc.HasTouch = true;
    }
})();

/**
 * Touch interaction configuration and state management
 * 
 * @namespace
 * @description Manages touch gesture recognition including:
 * - Single tap: cell selection
 * - Double tap: edit mode activation
 * - Swipe: scrolling (up/down, left/right)
 * - Touch and drag: range selection
 * - Multi-line touch handling for complex gestures
 */
SocialCalc.TouchInfo = {
    /** @type {Array<Object>} - Registered touch-enabled elements */
    registeredElements: [],

    // Swipe detection thresholds
    /** @type {number} - Minimum horizontal pixels for swipe detection */
    threshold_x: 20,
    /** @type {number} - Minimum vertical pixels for swipe detection */
    threshold_y: 20,

    // Touch coordinate tracking
    /** @type {number} - Original touch X coordinate */
    orig_coord_x: 0,
    /** @type {number} - Original touch Y coordinate */
    orig_coord_y: 0,
    /** @type {number} - Final touch X coordinate */
    final_coord_x: 0,
    /** @type {number} - Final touch Y coordinate */
    final_coord_y: 0,

    // Scroll sensitivity
    /** @type {number} - Pixels per row for scroll calculation */
    px_to_rows: 20,
    /** @type {number} - Pixels per column for scroll calculation */
    px_to_cols: 20,

    // Gesture timing
    /** @type {number} - Touch start timestamp */
    touch_start: 0,
    /** @type {boolean} - Whether range selection is active */
    ranging: false,
    /** @type {number} - Milliseconds before touch becomes range selection */
    ranging_threshold: 100,
    /** @type {number} - Movement start timestamp */
    move_start: 0,

    // Double-tap detection
    /** @type {number} - Last touch timestamp */
    last_touch: 0,
    /** @type {number|null} - Timeout handle for double-tap detection */
    timeout_handle: null,
    /** @type {number} - Maximum milliseconds between taps for double-tap */
    doubletap_threshold: 500,
};

/**
 * Register an element for touch event handling
 * 
 * @param {HTMLElement} element - DOM element to make touch-responsive
 * @param {Object} functionobj - Object containing touch event handlers:
 *   @param {Function} [functionobj.SingleTap] - Handler for single tap events
 *   @param {Function} [functionobj.DoubleTap] - Handler for double tap events  
 *   @param {Function} [functionobj.Swipe] - Handler for swipe gestures
 *   @param {SocialCalc.TableEditor} [functionobj.editor] - Editor reference for mouse simulation
 * 
 * @description Sets up touch event listeners and enables gesture recognition.
 * Only registers if device has touch support and element isn't already registered.
 * 
 * @example
 * SocialCalc.TouchRegister(gridElement, {
 *   SingleTap: function(event, touchinfo, wobj) { ... },
 *   DoubleTap: function(event, touchinfo, wobj) { ... },
 *   Swipe: function(event, touchinfo, wobj, deltaY, deltaX) { ... },
 *   editor: myEditor
 * });
 */
SocialCalc.TouchRegister = function (element, functionobj) {
    if (!SocialCalc.HasTouch) {
        return;
    }

    const touchinfo = SocialCalc.TouchInfo;

    if (SocialCalc.LookupElement(element, touchinfo.registeredElements)) {
        // Already registered
        return;
    }

    touchinfo.registeredElements.push({
        element: element,
        functionobj: functionobj,
    });

    if (SocialCalc.HasTouch && element.addEventListener) {
        // Webkit-based touch events
        element.addEventListener("touchstart", SocialCalc.ProcessTouchStart, false);
        element.addEventListener("touchmove", SocialCalc.ProcessTouchMove, false);
        element.addEventListener("touchend", SocialCalc.ProcessTouchEnd, false);
        element.addEventListener("touchcancel", SocialCalc.ProcessTouchCancel, false);
    }
};

/**
 * Find the registered touch element from a touch event
 * @private
 */
SocialCalc.FindTouchElement = function (event) {
    const touchinfo = SocialCalc.TouchInfo;
    const evt = event || window.event;
    let ele = evt.target || evt.srcElement;

    for (let wobj = null; !wobj && ele; ele = ele.parentNode) {
        wobj = SocialCalc.LookupElement(ele, touchinfo.registeredElements);
    }

    return wobj;
};

/**
 * Handle touch start events
 * @private
 */
SocialCalc.ProcessTouchStart = function (event) {
    const touchinfo = SocialCalc.TouchInfo;
    touchinfo.orig_coord_x = event.targetTouches[0].pageX;
    touchinfo.orig_coord_y = event.targetTouches[0].pageY;
    touchinfo.final_coord_x = touchinfo.orig_coord_x;
    touchinfo.final_coord_y = touchinfo.orig_coord_y;
    touchinfo.touch_start = new Date().getTime();
    event.preventDefault();
};

/**
 * Create simulated mouse event from touch event
 * @private
 */
SocialCalc.TouchGetSimulatedMouseEvent = function (event, mouse_evt_name) {
    const touches = event.changedTouches;
    const first = touches[0];
    const simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(
        mouse_evt_name,
        true, // bubbles
        true, // cancelable
        window, // view
        1, // detail
        first.screenX, // screenX
        first.screenY, // screenY
        first.clientX, // clientX
        first.clientY, // clientY
        false, // ctrlKey
        false, // altKey
        false, // shiftKey
        false, // metaKey
        0, // button
        null // relatedTarget
    );
    return simulatedEvent;
};

/**
 * Handle touch move events - manages range selection and dragging
 * @private
 */
SocialCalc.ProcessTouchMove = function (event) {
    const touchinfo = SocialCalc.TouchInfo;
    touchinfo.final_coord_x = event.targetTouches[0].pageX;
    touchinfo.final_coord_y = event.targetTouches[0].pageY;

    const wobj = SocialCalc.FindTouchElement(event);
    if (!wobj) return; // Not one of our elements

    if (touchinfo.move_start === 0) {
        touchinfo.move_start = new Date().getTime();
        if (touchinfo.move_start - touchinfo.touch_start > touchinfo.ranging_threshold) {
            // Delayed move - start range selection
            touchinfo.ranging = true;
            const mouseDn = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousedown");
            wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDn);
        }
    } else if (touchinfo.ranging) {
        // Already ranging - continue with mouse move
        const mouseMv = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousemove");
        wobj.functionobj.editor.fullgrid.dispatchEvent(mouseMv);
    }

    event.preventDefault();
};

/**
 * Handle touch end events - processes taps, double-taps, and swipes
 * @private
 */
SocialCalc.ProcessTouchEnd = function (e) {
    const touchinfo = SocialCalc.TouchInfo;
    const changeX = touchinfo.orig_coord_x - touchinfo.final_coord_x;
    const changeY = touchinfo.orig_coord_y - touchinfo.final_coord_y;
    const wobj = SocialCalc.FindTouchElement(e);

    if (!wobj) return; // Not one of our elements

    const event = e || window.event;
    touchinfo.move_start = 0;
    touchinfo.touch_start = 0;

    if (touchinfo.ranging) {
        // End range selection
        touchinfo.ranging = false;
        const mouseUp = SocialCalc.TouchGetSimulatedMouseEvent(event, "mouseup");
        wobj.functionobj.editor.fullgrid.dispatchEvent(mouseUp);
    } else if (
        Math.abs(changeY) > touchinfo.threshold_y ||
        Math.abs(changeX) > touchinfo.threshold_x
    ) {
        // Swipe gesture detected
        const amount_y = Math.floor(changeY / touchinfo.px_to_rows);
        const amount_x = Math.floor(changeX / touchinfo.px_to_cols);
        if (wobj.functionobj && wobj.functionobj.Swipe) {
            wobj.functionobj.Swipe(event, touchinfo, wobj, amount_y, amount_x);
        }
    } else {
        // Tap gesture - check for double-tap
        const now = new Date().getTime();
        const lasttouch = touchinfo.last_touch || now + 1;
        const delta = now - lasttouch;

        if (touchinfo.timeout_handle) {
            clearTimeout(touchinfo.timeout_handle);
            touchinfo.timeout_handle = null;
        }

        if (delta < touchinfo.doubletap_threshold && delta > 0) {
            // Double-tap detected
            if (wobj.functionobj && wobj.functionobj.DoubleTap) {
                wobj.functionobj.DoubleTap(event, touchinfo, wobj);
            }
        } else {
            // Single tap - use timeout to distinguish from double-tap
            touchinfo.last_touch = now;
            const timeoutFn = function () {
                if (wobj.functionobj && wobj.functionobj.SingleTap) {
                    wobj.functionobj.SingleTap(event, touchinfo, wobj);
                }
            };
            touchinfo.timeout_handle = setTimeout(timeoutFn, touchinfo.doubletap_threshold);
        }
        touchinfo.last_touch = now;
    }

    e.preventDefault();
};

/**
 * Handle touch cancel events - reset touch state
 * @private
 */
SocialCalc.ProcessTouchCancel = function (event) {
    const wobj = SocialCalc.FindTouchElement(event);
    if (!wobj) return; // Do default behavior

    const touchinfo = SocialCalc.TouchInfo;
    touchinfo.orig_coord_x = 0;
    touchinfo.orig_coord_y = 0;
    touchinfo.final_coord_x = 0;
    touchinfo.final_coord_y = 0;
    touchinfo.move_start = 0;
    touchinfo.touch_start = 0;
    touchinfo.ranging = false;
};
/**
 * Touch gesture event handlers and module finalization
 * 
 * @fileoverview Final touch event handlers for spreadsheet interaction
 * and module export configuration for different environments
 */

/**
 * Process swipe gestures for scrolling the spreadsheet
 * 
 * @param {TouchEvent} event - The original touch event
 * @param {Object} touchinfo - Touch gesture information object
 * @param {Object} wobj - Wrapper object containing editor reference
 * @param {number} swipevert - Vertical swipe amount (positive = up, negative = down)
 * @param {number} swipehoriz - Horizontal swipe amount (positive = left, negative = right)
 * 
 * @description Handles swipe gestures to scroll the spreadsheet view:
 * - Ignores gestures when editor is busy or in edit mode
 * - Currently only processes vertical swipes (horizontal swipes ignored)
 * - Scrolls the sheet relative to current position
 * 
 * @example
 * // Swipe up by 3 rows
 * SocialCalc.EditorProcessSwipe(event, touchinfo, wobj, -3, 0);
 * 
 * // Swipe down by 2 rows  
 * SocialCalc.EditorProcessSwipe(event, touchinfo, wobj, 2, 0);
 */
SocialCalc.EditorProcessSwipe = function (event, touchinfo, wobj, swipevert, swipehoriz) {
    if (wobj.functionobj.editor.busy) {
        return; // Ignore if editor is busy
    }

    if (wobj.functionobj.editor.state !== "start") {
        return; // Ignore if cell is being edited
    }

    if (swipevert !== 0 || swipehoriz !== 0) {
        // Currently ignoring horizontal swipes entirely
        // Only process vertical scrolling
        wobj.functionobj.editor.ScrollRelativeBoth(swipevert, 0);
    }
};

/**
 * Process single tap gestures for cell selection
 * 
 * @param {TouchEvent} event - The original touch event
 * @param {Object} touchinfo - Touch gesture information object  
 * @param {Object} wobj - Wrapper object containing editor reference
 * 
 * @description Handles single tap gestures by simulating mouse click:
 * - Ignores taps when editor is busy
 * - Simulates mousedown followed by mouseup events
 * - Allows cell selection and UI interaction via touch
 * 
 * @example
 * // User taps on cell A1 to select it
 * SocialCalc.EditorProcessSingleTap(touchEvent, touchInfo, editorWrapper);
 */
SocialCalc.EditorProcessSingleTap = function (event, touchinfo, wobj) {
    if (wobj.functionobj.editor.busy) {
        return; // Ignore if editor is busy
    }

    // Simulate mouse down event
    const mouseDn = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousedown");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDn);

    // Then simulate mouse up event
    const mouseUp = SocialCalc.TouchGetSimulatedMouseEvent(event, "mouseup");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseUp);
};

/**
 * Process double tap gestures for entering edit mode
 * 
 * @param {TouchEvent} event - The original touch event
 * @param {Object} touchinfo - Touch gesture information object
 * @param {Object} wobj - Wrapper object containing editor reference
 * 
 * @description Handles double tap gestures by simulating double-click:
 * - Ignores double taps when editor is busy
 * - Simulates dblclick event to enter cell edit mode
 * - Provides touch equivalent of double-clicking to edit cells
 * 
 * @example
 * // User double-taps on cell A1 to start editing
 * SocialCalc.EditorProcessDoubleTap(touchEvent, touchInfo, editorWrapper);
 */
SocialCalc.EditorProcessDoubleTap = function (event, touchinfo, wobj) {
    if (wobj.functionobj.editor.busy) {
        return; // Ignore if editor is busy
    }

    // Simulate mouse double-click event
    const mouseDblClick = SocialCalc.TouchGetSimulatedMouseEvent(event, "dblclick");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDblClick);
};

/**
 * Process device orientation change events
 * 
 * @param {Event} event - The orientation change event
 * 
 * @description Handles device orientation changes on mobile devices:
 * - Currently logs orientation change for debugging
 * - Placeholder for responsive layout adjustments
 * - Can be extended to trigger spreadsheet resize/reflow
 * 
 * @todo Implement responsive layout adjustments
 * @todo Add spreadsheet resize handling
 * @todo Consider viewport adjustments for different orientations
 * 
 * @example
 * // Device rotated from portrait to landscape
 * SocialCalc.ProcessOrientationChange(orientationEvent);
 */
SocialCalc.ProcessOrientationChange = function (event) {
    console.log("Orientation change detected");

    // Placeholder for orientation-specific handling
    // const height = window.innerHeight;
    // const width = window.innerWidth;
    // console.log(`New dimensions: ${width}x${height}`);

    // Future implementation could include:
    // - Triggering spreadsheet resize
    // - Adjusting viewport calculations
    // - Recalculating touch gesture thresholds
    // - Updating column/row visibility
};

// *************************************
//
// Module Export and Global Registration
//
// *************************************

/**
 * Ensure SocialCalc is available in global scope across different environments
 * 
 * @description Provides cross-platform module availability:
 * - Browser: Attaches to window object
 * - Node.js: Attaches to global object
 * - Universal compatibility for different JavaScript environments
 * 
 * This ensures the SocialCalc library can be used in:
 * - Web browsers (client-side)
 * - Node.js applications (server-side)
 * - Web workers
 * - Other JavaScript runtime environments
 */
if (typeof window !== "undefined") {
    // Browser environment - attach to window
    window.SocialCalc = SocialCalc;
} else if (typeof global !== "undefined") {
    // Node.js environment - attach to global
    global.SocialCalc = SocialCalc;
}

// Return the SocialCalc object for module systems
return SocialCalc;

});
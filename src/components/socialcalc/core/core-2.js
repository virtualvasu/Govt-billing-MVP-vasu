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
        let sortfunction, slen, valtype, originalrow, sortedcr;
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
        } else if (/([a-z]){0,1}(\d+)/i.test(what)) {
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



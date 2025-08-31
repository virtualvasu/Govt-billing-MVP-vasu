/* eslint-disable */
/**
 * SocialCalc Spreadsheet Control Module
 * Extracted from the main SocialCalc.js file
 * 
 * @fileoverview Provides spreadsheet control functionality with toolbar and tab interface
 * @version 1.0.0
 * @license CPAL-1.0
 */

/**
 * Universal Module Definition (UMD) wrapper for cross-platform compatibility
 * @param {object} root - Global object (window, self, or this)
 * @param {Function} factory - Module factory function
 * @returns {object} SocialCalcSpreadsheetControl module
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.SocialCalcSpreadsheetControl = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {

    /**
     * Get SocialCalc namespace from global scope
     * @type {object}
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
     * SocialCalcSpreadsheetControl
     * 
     * The code module of the SocialCalc package that lets you embed a spreadsheet
     * control with toolbar, etc., into a web page.
     * 
     * @copyright 2008, 2009, 2010 Socialtext, Inc. All Rights Reserved.
     */

    /*
     * LEGAL NOTICES REQUIRED BY THE COMMON PUBLIC ATTRIBUTION LICENSE:
     * 
     * EXHIBIT A. Common Public Attribution License Version 1.0.
     * 
     * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the 
     * "License"); you may not use this file except in compliance with the License. You may obtain a copy 
     * of the License at http://socialcalc.org. The License is based on the Mozilla Public License Version 1.1 but 
     * Sections 14 and 15 have been added to cover use of software over a computer network and provide for 
     * limited attribution for the Original Developer. In addition, Exhibit A has been modified to be 
     * consistent with Exhibit B.
     * 
     * Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY 
     * KIND, either express or implied. See the License for the specific language governing rights and 
     * limitations under the License.
     * 
     * The Original Code is SocialCalc JavaScript SpreadsheetControl.
     * 
     * The Original Developer is the Initial Developer.
     * 
     * The Initial Developer of the Original Code is Socialtext, Inc. All portions of the code written by 
     * Socialtext, Inc., are Copyright (c) Socialtext, Inc. All Rights Reserved.
     * 
     * Contributor: Dan Bricklin.
     * 
     * EXHIBIT B. Attribution Information
     * 
     * When the SpreadsheetControl is producing and/or controlling the display the Graphic Image must be
     * displayed on the screen visible to the user in a manner comparable to that in the 
     * Original Code. The Attribution Phrase must be displayed as a "tooltip" or "hover-text" for
     * that image. The image must be linked to the Attribution URL so as to access that page
     * when clicked. If the user interface includes a prominent "about" display which includes
     * factual prominent attribution in a form similar to that in the "about" display included
     * with the Original Code, including Socialtext copyright notices and URLs, then the image
     * need not be linked to the Attribution URL but the "tool-tip" is still required.
     * 
     * Attribution Copyright Notice:
     *  Copyright (C) 2010 Socialtext, Inc.
     *  All Rights Reserved.
     * 
     * Attribution Phrase (not exceeding 10 words): SocialCalc
     * Attribution URL: http://www.socialcalc.org/
     * Graphic Image: The contents of the sc-logo.gif file in the Original Code or
     * a suitable replacement from http://www.socialcalc.org/licenses specified as
     * being for SocialCalc.
     * 
     * Display of Attribution Information is required in Larger Works which are defined 
     * in the CPAL as a work which combines Covered Code or portions thereof with code 
     * not governed by the terms of the CPAL.
     */

    /**
     * Some of the other files in the SocialCalc package are licensed under
     * different licenses. Please note the licenses of the modules you use.
     * 
     * Code History:
     * Initially coded by Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
     * Unless otherwise specified, referring to "SocialCalc" in comments refers to this
     * JavaScript version of the code, not the SocialCalc Perl code.
     */

    // Validate required dependencies
    if (!SocialCalc) {
        alert("Main SocialCalc code module needed");
        SocialCalc = {};
    }
    if (!SocialCalc.TableEditor) {
        alert("SocialCalc TableEditor code module needed");
    }

    // *************************************
    //
    // SpreadsheetControl class:
    //
    // *************************************

    /**
     * @typedef {object} TabDefinition
     * @property {string} name - Tab identifier name
     * @property {string} text - Display text on tab
     * @property {string} html - HTML content for tab div with replacements
     * @property {string} [view] - View name to show when selected; "sheet" or missing/null is spreadsheet
     * @property {Function} [oncreate] - Called when first created to initialize
     * @property {Function} [onclick] - Called when tab is clicked, missing/null is sheet default
     * @property {string|boolean} [onclickFocus] - Element to focus or boolean for SocialCalc.CmdGotFocus
     * @property {Function} [onunclick] - Called when tab is unselected, missing/null is sheet default
     */

    /**
     * @typedef {object} ViewDefinition
     * @property {string} name - Localized view name
     * @property {HTMLElement} element - DOM node for the view
     * @property {object} replacements - String replacement patterns
     * @property {string} html - HTML content with replacement tokens
     * @property {object} [divStyle] - CSS styles for sheet div
     * @property {Function} [oncreate] - Called when first created to initialize
     * @property {boolean} [needsresize] - Whether view needs resize calculation
     * @property {Function} [onresize] - Called if needs resize
     * @property {object} [values] - Optional values for sharing with handlers
     */

    /**
     * Global reference to current active spreadsheet control object
     * Note: Currently only one can be active at a time
     * @type {SocialCalc.SpreadsheetControl|null}
     */
    SocialCalc.CurrentSpreadsheetControlObject = null;

    /**
     * SpreadsheetControl Constructor
     * Creates a new spreadsheet control with toolbar, tabs, and editing capabilities
     * @constructor
     * @class
     */
    SocialCalc.SpreadsheetControl = function () {
        let scc = SocialCalc.Constants;

        // Core Properties
        /** @type {HTMLElement|null} Parent DOM node */
        this.parentNode = null;
        /** @type {HTMLElement|null} Main spreadsheet container div */
        this.spreadsheetDiv = null;
        /** @type {number} Requested height in pixels */
        this.requestedHeight = 0;
        /** @type {number} Requested width in pixels */
        this.requestedWidth = 0;
        /** @type {number} Requested space below in pixels */
        this.requestedSpaceBelow = 0;
        /** @type {number} Actual height in pixels */
        this.height = 0;
        /** @type {number} Actual width in pixels */
        this.width = 0;
        /** @type {number} Calculated view height below toolbar */
        this.viewheight = 0;

        /**
         * Tab definitions array
         * @type {TabDefinition[]}
         */
        this.tabs = [];

        /**
         * Tab name to index mapping
         * @type {object.<string, number>}
         */
        this.tabnums = {};

        /**
         * String replacement patterns for tabs
         * @type {object.<string, {regex: RegExp, replacement: string}>}
         */
        this.tabreplacements = {};

        /**
         * Currently selected tab index (-1 if none selected)
         * @type {number}
         */
        this.currentTab = -1;

        /**
         * View definitions object
         * @type {object.<string, ViewDefinition>}
         */
        this.views = {};

        // Dynamic Properties
        /** @type {SocialCalc.Sheet|null} The spreadsheet data model */
        this.sheet = null;
        /** @type {SocialCalc.RenderContext|null} Rendering context */
        this.context = null;
        /** @type {SocialCalc.TableEditor|null} Table editor instance */
        this.editor = null;
        /** @type {HTMLElement|null} Main spreadsheet div */
        this.spreadsheetDiv = null;
        /** @type {HTMLElement|null} Editor container div */
        this.editorDiv = null;
        /** @type {string} Remembered range for sort operations */
        this.sortrange = "";
        /** @type {string} Remembered range for move operations */
        this.moverange = "";

        // Configuration Constants
        /** @type {string} Prefix for element IDs, should end in "-" */
        this.idPrefix = "SocialCalc-";
        /** @type {string} Boundary for multipart saves */
        this.multipartBoundary = "SocialCalcSpreadsheetControlSave";
        /** @type {string} Prefix for image sources */
        this.imagePrefix = scc.defaultImagePrefix;

        // Styling Constants
        /** @type {string} Toolbar background CSS */
        this.toolbarbackground = scc.SCToolbarbackground;
        /** @type {string} Tab background CSS */
        this.tabbackground = scc.SCTabbackground;
        /** @type {string} Selected tab CSS */
        this.tabselectedCSS = scc.SCTabselectedCSS;
        /** @type {string} Plain tab CSS */
        this.tabplainCSS = scc.SCTabplainCSS;
        /** @type {string} Toolbar text CSS */
        this.toolbartext = scc.SCToolbartext;

        // Layout Constants
        /** @type {number} Formula bar height in pixels */
        this.formulabarheight = scc.SCFormulabarheight;

        if (scc.doWorkBook) {
            /** @type {number} Sheet bar height in pixels */
            this.sheetbarheight = scc.SCSheetBarHeight;
            /** @type {string} Sheet bar CSS */
            this.sheetbarCSS = scc.SCSheetBarCSS;
        } else {
            this.sheetbarheight = 0;
        }

        /** @type {number} Status line height in pixels */
        this.statuslineheight = scc.SCStatuslineheight;
        /** @type {string} Status line CSS */
        this.statuslineCSS = scc.SCStatuslineCSS;

        // Callback Properties
        /** 
         * Export callback function
         * @type {Function|null}
         * @param {SocialCalc.SpreadsheetControl} spreadsheet_control_object
         */
        this.ExportCallback = null;

        // Initialization Code
        this.sheet = new SocialCalc.Sheet();
        this.context = new SocialCalc.RenderContext(this.sheet);
        this.context.showGrid = true;
        this.context.showRCHeaders = true;
        this.editor = new SocialCalc.TableEditor(this.context);

        this.editor.StatusCallback.statusline = {
            func: SocialCalc.SpreadsheetControlStatuslineCallback,
            params: {
                statuslineid: `${this.idPrefix}statusline`,
                recalcid1: `${this.idPrefix}divider_recalc`,
                recalcid2: `${this.idPrefix}button_recalc`,
            },
        };

        SocialCalc.CurrentSpreadsheetControlObject = this;

        /**
         * Move cell callback for handling cursor suffix display
         * @param {SocialCalc.TableEditor} editor - The table editor instance
         */
        this.editor.MoveECellCallback.movefrom = (editor) => {
            let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
            spreadsheet.context.cursorsuffix = "";

            if (editor.range2.hasrange && !editor.cellhandles.noCursorSuffix) {
                let { ecell, range2 } = editor;

                if (ecell.row === range2.top &&
                    (ecell.col < range2.left || ecell.col > range2.right + 1)) {
                    spreadsheet.context.cursorsuffix = "insertleft";
                }

                if (ecell.col === range2.left &&
                    (ecell.row < range2.top || ecell.row > range2.bottom + 1)) {
                    spreadsheet.context.cursorsuffix = "insertup";
                }
            }
        };

        /**
         * Formula bar button definitions
         * @type {object.<string, {image: string, tooltip: string, command: Function}>}
         */
        this.formulabuttons = {
            formulafunctions: {
                image: "formuladialog.gif",
                tooltip: "Functions", // tooltips are localized when set below
                command: SocialCalc.SpreadsheetControl.DoFunctionList,
            },
            multilineinput: {
                image: "multilinedialog.gif",
                tooltip: "Multi-line Input Box",
                command: SocialCalc.SpreadsheetControl.DoMultiline,
            },
            link: {
                image: "linkdialog.gif",
                tooltip: "Link Input Box",
                command: SocialCalc.SpreadsheetControl.DoLink,
            },
            sum: {
                image: "sumdialog.gif",
                tooltip: "Auto Sum",
                command: SocialCalc.SpreadsheetControl.DoSum,
            },
        };

        // Default tabs initialization

        // Edit Tab
        this.tabnums.edit = this.tabs.length;
        this.tabs.push({
            name: "edit",
            text: "Edit",
            html: [
                ' <div id="%id.edittools" style="padding:10px 0px 0px 0px;">',
                '&nbsp;<img id="%id.button_undo" src="%img.undo.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_redo" src="%img.redo.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_copy" src="%img.copy.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_cut" src="%img.cut.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_paste" src="%img.paste.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_delete" src="%img.delete.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_pasteformats" src="%img.pasteformats.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_filldown" src="%img.filldown.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_fillright" src="%img.fillright.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_movefrom" src="%img.movefromoff.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_movepaste" src="%img.movepasteoff.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_moveinsert" src="%img.moveinsertoff.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_alignleft" src="%img.alignleft.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_aligncenter" src="%img.aligncenter.gif" style="vertical-align:bottom;">',
                ' <img id="%id.button_alignright" src="%img.alignright.gif" style="vertical-align:bottom;">',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_borderon" src="%img.borderson.gif" style="vertical-align:bottom;"> ',
                ' <img id="%id.button_borderoff" src="%img.bordersoff.gif" style="vertical-align:bottom;"> ',
                ' <img id="%id.button_swapcolors" src="%img.swapcolors.gif" style="vertical-align:bottom;"> ',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_merge" src="%img.merge.gif" style="vertical-align:bottom;"> ',
                ' <img id="%id.button_unmerge" src="%img.unmerge.gif" style="vertical-align:bottom;"> ',
                ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_insertrow" src="%img.insertrow.gif" style="vertical-align:bottom;"> ',
                ' <img id="%id.button_insertcol" src="%img.insertcol.gif" style="vertical-align:bottom;"> ',
                '&nbsp; <img id="%id.button_deleterow" src="%img.deleterow.gif" style="vertical-align:bottom;"> ',
                ' <img id="%id.button_deletecol" src="%img.deletecol.gif" style="vertical-align:bottom;"> ',
                ' &nbsp;<img id="%id.divider_recalc" src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ',
                '<img id="%id.button_recalc" src="%img.recalc.gif" style="vertical-align:bottom;"> ',
                " </div>"
            ].join(''),
            oncreate: null,
            onclick: null,
        });

        // Settings (Format) Tab
        this.tabnums.settings = this.tabs.length;
        this.tabs.push({
            name: "settings",
            text: "Format",
            html: [
                '<div id="%id.settingstools" style="display:none;">',
                ' <div id="%id.sheetsettingstoolbar" style="display:none;">',
                '  <table cellspacing="0" cellpadding="0"><tr><td>',
                '   <div style="%tbt.">%loc!SHEET SETTINGS!:</div>',
                "   </td></tr><tr><td>",
                '   <input id="%id.settings-savesheet" type="button" value="%loc!Save!" onclick="SocialCalc.SettingsControlSave(\'sheet\');">',
                '   <input type="button" value="%loc!Cancel!" onclick="SocialCalc.SettingsControlSave(\'cancel\');">',
                '   <input type="button" value="%loc!Show Cell Settings!" onclick="SocialCalc.SpreadsheetControlSettingsSwitch(\'cell\');return false;">',
                "   </td></tr></table>",
                " </div>",
                ' <div id="%id.cellsettingstoolbar" style="display:none;">',
                '  <table cellspacing="0" cellpadding="0"><tr><td>',
                '   <div style="%tbt.">%loc!CELL SETTINGS!: <span id="%id.settingsecell">&nbsp;</span></div>',
                "   </td></tr><tr><td>",
                '  <input id="%id.settings-savecell" type="button" value="%loc!Save!" onclick="SocialCalc.SettingsControlSave(\'cell\');">',
                '  <input type="button" value="%loc!Cancel!" onclick="SocialCalc.SettingsControlSave(\'cancel\');">',
                '  <input type="button" value="%loc!Show Sheet Settings!" onclick="SocialCalc.SpreadsheetControlSettingsSwitch(\'sheet\');return false;">',
                "  </td></tr></table>",
                " </div>",
                "</div>"
            ].join(''),
            view: "settings",
            /**
             * Settings tab click handler
             * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
             * @param {string} t - Tab name
             */
            onclick: function (s, t) {
                SocialCalc.SettingsControls.idPrefix = s.idPrefix;
                SocialCalc.SettingControlReset();

                let sheetattribs = s.sheet.EncodeSheetAttributes();
                let cellattribs = s.sheet.EncodeCellAttributes(s.editor.ecell.coord);

                SocialCalc.SettingsControlLoadPanel(
                    s.views.settings.values.sheetspanel,
                    sheetattribs
                );
                SocialCalc.SettingsControlLoadPanel(
                    s.views.settings.values.cellspanel,
                    cellattribs
                );

                document.getElementById(`${s.idPrefix}settingsecell`).innerHTML = s.editor.ecell.coord;
                SocialCalc.SpreadsheetControlSettingsSwitch("cell");
                s.views.settings.element.style.height = `${s.viewheight}px`;
                s.views.settings.element.firstChild.style.height = `${s.viewheight}px`;

                // Set save message range
                let range;
                if (s.editor.range.hasrange) {
                    range = `${SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top)}:${SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom)}`;
                } else {
                    range = s.editor.ecell.coord;
                }

                document.getElementById(`${s.idPrefix}settings-savecell`).value = `${SocialCalc.LocalizeString("Save to")}: ${range}`;
            },
            onclickFocus: true,
        });

        // Settings View Definition
        this.views["settings"] = {
            name: "settings",
            values: {},
            /**
             * Settings view creation handler
             * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
             * @param {ViewDefinition} viewobj - View object being created
             */
            oncreate: function (s, viewobj) {
                let scc = SocialCalc.Constants;

                viewobj.values.sheetspanel = {
                    colorchooser: { id: `${s.idPrefix}scolorchooser` },
                    formatnumber: {
                        setting: "numberformat",
                        type: "PopupList",
                        id: `${s.idPrefix}formatnumber`,
                        initialdata: scc.SCFormatNumberFormats,
                    },
                    formattext: {
                        setting: "textformat",
                        type: "PopupList",
                        id: `${s.idPrefix}formattext`,
                        initialdata: scc.SCFormatTextFormats,
                    },
                    fontfamily: {
                        setting: "fontfamily",
                        type: "PopupList",
                        id: `${s.idPrefix}fontfamily`,
                        initialdata: scc.SCFormatFontfamilies,
                    },
                    fontlook: {
                        setting: "fontlook",
                        type: "PopupList",
                        id: `${s.idPrefix}fontlook`,
                        initialdata: scc.SCFormatFontlook,
                    },
                    fontsize: {
                        setting: "fontsize",
                        type: "PopupList",
                        id: `${s.idPrefix}fontsize`,
                        initialdata: scc.SCFormatFontsizes,
                    },
                    textalignhoriz: {
                        setting: "textalignhoriz",
                        type: "PopupList",
                        id: `${s.idPrefix}textalignhoriz`,
                        initialdata: scc.SCFormatTextAlignhoriz,
                    },
                    numberalignhoriz: {
                        setting: "numberalignhoriz",
                        type: "PopupList",
                        id: `${s.idPrefix}numberalignhoriz`,
                        initialdata: scc.SCFormatNumberAlignhoriz,
                    },
                    alignvert: {
                        setting: "alignvert",
                        type: "PopupList",
                        id: `${s.idPrefix}alignvert`,
                        initialdata: scc.SCFormatAlignVertical,
                    },
                    textcolor: {
                        setting: "textcolor",
                        type: "ColorChooser",
                        id: `${s.idPrefix}textcolor`,
                    },
                    bgcolor: {
                        setting: "bgcolor",
                        type: "ColorChooser",
                        id: `${s.idPrefix}bgcolor`,
                    },
                    padtop: {
                        setting: "padtop",
                        type: "PopupList",
                        id: `${s.idPrefix}padtop`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    padright: {
                        setting: "padright",
                        type: "PopupList",
                        id: `${s.idPrefix}padright`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    padbottom: {
                        setting: "padbottom",
                        type: "PopupList",
                        id: `${s.idPrefix}padbottom`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    padleft: {
                        setting: "padleft",
                        type: "PopupList",
                        id: `${s.idPrefix}padleft`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    colwidth: {
                        setting: "colwidth",
                        type: "PopupList",
                        id: `${s.idPrefix}colwidth`,
                        initialdata: scc.SCFormatColwidth,
                    },
                    recalc: {
                        setting: "recalc",
                        type: "PopupList",
                        id: `${s.idPrefix}recalc`,
                        initialdata: scc.SCFormatRecalc,
                    },
                };

                viewobj.values.cellspanel = {
                    name: "cell",
                    colorchooser: { id: `${s.idPrefix}scolorchooser` },
                    cformatnumber: {
                        setting: "numberformat",
                        type: "PopupList",
                        id: `${s.idPrefix}cformatnumber`,
                        initialdata: scc.SCFormatNumberFormats,
                    },
                    cformattext: {
                        setting: "textformat",
                        type: "PopupList",
                        id: `${s.idPrefix}cformattext`,
                        initialdata: scc.SCFormatTextFormats,
                    },
                    cfontfamily: {
                        setting: "fontfamily",
                        type: "PopupList",
                        id: `${s.idPrefix}cfontfamily`,
                        initialdata: scc.SCFormatFontfamilies,
                    },
                    cfontlook: {
                        setting: "fontlook",
                        type: "PopupList",
                        id: `${s.idPrefix}cfontlook`,
                        initialdata: scc.SCFormatFontlook,
                    },
                    cfontsize: {
                        setting: "fontsize",
                        type: "PopupList",
                        id: `${s.idPrefix}cfontsize`,
                        initialdata: scc.SCFormatFontsizes,
                    },
                    calignhoriz: {
                        setting: "alignhoriz",
                        type: "PopupList",
                        id: `${s.idPrefix}calignhoriz`,
                        initialdata: scc.SCFormatTextAlignhoriz,
                    },
                    calignvert: {
                        setting: "alignvert",
                        type: "PopupList",
                        id: `${s.idPrefix}calignvert`,
                        initialdata: scc.SCFormatAlignVertical,
                    },
                    ctextcolor: {
                        setting: "textcolor",
                        type: "ColorChooser",
                        id: `${s.idPrefix}ctextcolor`,
                    },
                    cbgcolor: {
                        setting: "bgcolor",
                        type: "ColorChooser",
                        id: `${s.idPrefix}cbgcolor`,
                    },
                    cbt: { setting: "bt", type: "BorderSide", id: `${s.idPrefix}cbt` },
                    cbr: { setting: "br", type: "BorderSide", id: `${s.idPrefix}cbr` },
                    cbb: { setting: "bb", type: "BorderSide", id: `${s.idPrefix}cbb` },
                    cbl: { setting: "bl", type: "BorderSide", id: `${s.idPrefix}cbl` },
                    cpadtop: {
                        setting: "padtop",
                        type: "PopupList",
                        id: `${s.idPrefix}cpadtop`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    cpadright: {
                        setting: "padright",
                        type: "PopupList",
                        id: `${s.idPrefix}cpadright`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    cpadbottom: {
                        setting: "padbottom",
                        type: "PopupList",
                        id: `${s.idPrefix}cpadbottom`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                    cpadleft: {
                        setting: "padleft",
                        type: "PopupList",
                        id: `${s.idPrefix}cpadleft`,
                        initialdata: scc.SCFormatPadsizes,
                    },
                };
                SocialCalc.SettingsControlInitializePanel(viewobj.values.sheetspanel);
                SocialCalc.SettingsControlInitializePanel(viewobj.values.cellspanel);
            },
            replacements: {
                itemtitle: {
                    regex: /\%itemtitle\./g,
                    replacement: 'style="padding:12px 10px 0px 10px;font-weight:bold;text-align:right;vertical-align:top;font-size:small;"',
                },
                sectiontitle: {
                    regex: /\%sectiontitle\./g,
                    replacement: 'style="padding:16px 10px 0px 0px;font-weight:bold;vertical-align:top;font-size:small;color:#C00;"',
                },
                parttitle: {
                    regex: /\%parttitle\./g,
                    replacement: 'style="font-weight:bold;font-size:x-small;padding:0px 0px 3px 0px;"',
                },
                itembody: {
                    regex: /\%itembody\./g,
                    replacement: 'style="padding:12px 0px 0px 0px;vertical-align:top;font-size:small;"',
                },
                bodypart: {
                    regex: /\%bodypart\./g,
                    replacement: 'style="padding:0px 10px 0px 0px;font-size:small;vertical-align:top;"',
                },
            },
            divStyle: "border:1px solid black;overflow:auto;",
            html: [
                '<div id="%id.scolorchooser" style="display:none;position:absolute;z-index:20;"></div>',
                '<table cellspacing="0" cellpadding="0">',
                ' <tr><td style="vertical-align:top;">',
                '<table id="%id.sheetsettingstable" style="display:none;" cellspacing="0" cellpadding="0">',
                "<tr>",
                " <td %itemtitle.><br>%loc!Default Format!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Number!</div>",
                '     <span id="%id.formatnumber"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Text!</div>",
                '     <span id="%id.formattext"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Default Alignment!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Text Horizontal!</div>",
                '     <span id="%id.textalignhoriz"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Number Horizontal!</div>",
                '     <span id="%id.numberalignhoriz"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Vertical!</div>",
                '     <span id="%id.alignvert"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Default Font!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Family!</div>",
                '     <span id="%id.fontfamily"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Bold &amp; Italics!</div>",
                '     <span id="%id.fontlook"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Size!</div>",
                '     <span id="%id.fontsize"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Color!</div>",
                '     <div id="%id.textcolor"></div>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Background!</div>",
                '     <div id="%id.bgcolor"></div>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Default Padding!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Top!</div>",
                '     <span id="%id.padtop"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Right!</div>",
                '     <span id="%id.padright"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Bottom!</div>",
                '     <span id="%id.padbottom"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Left!</div>",
                '     <span id="%id.padleft"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Default Column Width!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>&nbsp;</div>",
                '     <span id="%id.colwidth"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Recalculation!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>&nbsp;</div>",
                '     <span id="%id.recalc"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "</table>",
                '<table id="%id.cellsettingstable" cellspacing="0" cellpadding="0">',
                "<tr>",
                " <td %itemtitle.><br>%loc!Format!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Number!</div>",
                '     <span id="%id.cformatnumber"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Text!</div>",
                '     <span id="%id.cformattext"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Alignment!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Horizontal!</div>",
                '     <span id="%id.calignhoriz"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Vertical!</div>",
                '     <span id="%id.calignvert"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Font!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Family!</div>",
                '     <span id="%id.cfontfamily"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Bold &amp; Italics!</div>",
                '     <span id="%id.cfontlook"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Size!</div>",
                '     <span id="%id.cfontsize"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Color!</div>",
                '     <div id="%id.ctextcolor"></div>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Background!</div>",
                '     <div id="%id.cbgcolor"></div>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Borders!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0">',
                '    <tr><td %bodypart. colspan="3"><div %parttitle.>%loc!Top Border!</div></td>',
                '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Right Border!</div></td>',
                '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Bottom Border!</div></td>',
                '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Left Border!</div></td>',
                "    </tr><tr>",
                "    <td %bodypart.>",
                '     <input id="%id.cbt-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">',
                "    </td>",
                "    <td %bodypart.>",
                '     <div id="%id.cbt-color"></div>',
                "    </td>",
                "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>",
                "    <td %bodypart.>",
                '     <input id="%id.cbr-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">',
                "    </td>",
                "    <td %bodypart.>",
                '     <div id="%id.cbr-color"></div>',
                "    </td>",
                "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>",
                "    <td %bodypart.>",
                '     <input id="%id.cbb-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">',
                "    </td>",
                "    <td %bodypart.>",
                '     <div id="%id.cbb-color"></div>',
                "    </td>",
                "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>",
                "    <td %bodypart.>",
                '     <input id="%id.cbl-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">',
                "    </td>",
                "    <td %bodypart.>",
                '     <div id="%id.cbl-color"></div>',
                "    </td>",
                "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "<tr>",
                " <td %itemtitle.><br>%loc!Padding!:</td>",
                " <td %itembody.>",
                '   <table cellspacing="0" cellpadding="0"><tr>',
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Top!</div>",
                '     <span id="%id.cpadtop"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Right!</div>",
                '     <span id="%id.cpadright"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Bottom!</div>",
                '     <span id="%id.cpadbottom"></span>',
                "    </td>",
                "    <td %bodypart.>",
                "     <div %parttitle.>%loc!Left!</div>",
                '     <span id="%id.cpadleft"></span>',
                "    </td>",
                "   </tr></table>",
                " </td>",
                "</tr>",
                "</table>",
                ' </td><td style="vertical-align:top;padding:12px 0px 0px 12px;">',
                '  <div style="width:100px;height:100px;overflow:hidden;border:1px solid black;background-color:#EEE;padding:6px;">',
                '   <table cellspacing="0" cellpadding="0"><tr>',
                '    <td id="sample-text" style="height:100px;width:100px;"><div>%loc!This is a<br>sample!</div><div>-1234.5</div></td>',
                "   </tr></table>",
                "  </div>",
                " </td></tr></table>",
                "<br>"
            ].join(''),
        };

        // Sort Tab
        this.tabnums.sort = this.tabs.length;
        this.tabs.push({
            name: "sort",
            text: "Sort",
            html: [
                ' <div id="%id.sorttools" style="display:none;">',
                '  <table cellspacing="0" cellpadding="0"><tr>',
                '   <td style="vertical-align:top;padding-right:4px;width:160px;">',
                '    <div style="%tbt.">%loc!Set Cells To Sort!</div>',
                '    <select id="%id.sortlist" size="1" onfocus="%s.CmdGotFocus(this);"><option selected>[select range]</option></select>',
                '    <input type="button" value="%loc!OK!" onclick="%s.DoCmd(this, \'ok-setsort\');" style="font-size:x-small;">',
                "   </td>",
                '   <td style="vertical-align:middle;padding-right:16px;width:100px;text-align:right;">',
                '    <div style="%tbt.">&nbsp;</div>',
                '    <input type="button" id="%id.sortbutton" value="%loc!Sort Cells! A1:A1" onclick="%s.DoCmd(this, \'dosort\');" style="visibility:hidden;">',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:16px;">',
                '    <table cellspacing="0" cellpadding="0"><tr>',
                '     <td style="vertical-align:top;">',
                '      <div style="%tbt.">%loc!Major Sort!</div>',
                '      <select id="%id.majorsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>',
                "     </td><td>",
                '      <input type="radio" name="majorsort" id="%id.majorsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>',
                '      <input type="radio" name="majorsort" id="%id.majorsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>',
                "     </td>",
                "    </tr></table>",
                "   </td>",
                '   <td style="vertical-align:top;padding-right:16px;">',
                '    <table cellspacing="0" cellpadding="0"><tr>',
                '     <td style="vertical-align:top;">',
                '      <div style="%tbt.">%loc!Minor Sort!</div>',
                '      <select id="%id.minorsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>',
                "     </td><td>",
                '      <input type="radio" name="minorsort" id="%id.minorsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>',
                '      <input type="radio" name="minorsort" id="%id.minorsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>',
                "     </td>",
                "    </tr></table>",
                "   </td>",
                '   <td style="vertical-align:top;padding-right:16px;">',
                '    <table cellspacing="0" cellpadding="0"><tr>',
                '     <td style="vertical-align:top;">',
                '      <div style="%tbt.">%loc!Last Sort!</div>',
                '      <select id="%id.lastsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>',
                "     </td><td>",
                '      <input type="radio" name="lastsort" id="%id.lastsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>',
                '      <input type="radio" name="lastsort" id="%id.lastsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>',
                "     </td>",
                "    </tr></table>",
                "   </td>",
                "  </tr></table>",
                " </div>"
            ].join(''),
            onclick: SocialCalc.SpreadsheetControlSortOnclick,
        });

        this.editor.SettingsCallbacks.sort = {
            save: SocialCalc.SpreadsheetControlSortSave,
            load: SocialCalc.SpreadsheetControlSortLoad,
        };

        // Audit Tab
        this.tabnums.audit = this.tabs.length;
        this.tabs.push({
            name: "audit",
            text: "Audit",
            html: [
                '<div id="%id.audittools" style="display:none;">',
                ' <div style="%tbt.">&nbsp;</div>',
                "</div>"
            ].join(''),
            view: "audit",
            /**
             * Audit tab click handler - displays command history
             * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
             * @param {string} t - Tab name
             */
            onclick: function (s, t) {
                let SCLoc = SocialCalc.LocalizeString;
                let str = `<table cellspacing="0" cellpadding="0" style="margin-bottom:10px;"><tr><td style="font-size:small;padding:6px;"><b>${SCLoc("Audit Trail This Session")}:</b><br><br>`;

                let { stack, tos } = s.sheet.changes;

                for (let i = 0; i < stack.length; i++) {
                    if (i === tos + 1) {
                        str += `<br></td></tr><tr><td style="font-size:small;background-color:#EEE;padding:6px;">${SCLoc("UNDONE STEPS")}:<br>`;
                    }

                    for (let j = 0; j < stack[i].command.length; j++) {
                        str += `${SocialCalc.special_chars(stack[i].command[j])}<br>`;
                    }
                }

                s.views.audit.element.innerHTML = `${str}</td></tr></table>`;
                SocialCalc.CmdGotFocus(true);
            },
            onclickFocus: true,
        });

        this.views["audit"] = {
            name: "audit",
            divStyle: "border:1px solid black;overflow:auto;",
            html: "Audit Trail",
        };

        // Comment Tab
        this.tabnums.comment = this.tabs.length;
        this.tabs.push({
            name: "comment",
            text: "Comment",
            html: [
                '<div id="%id.commenttools" style="display:none;">',
                '<table cellspacing="0" cellpadding="0"><tr><td>',
                '<textarea id="%id.commenttext" style="font-size:small;height:32px;width:600px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>',
                '</td><td style="vertical-align:top;">',
                '&nbsp;<input type="button" value="%loc!Save!" onclick="%s.SpreadsheetControlCommentSet();" style="font-size:x-small;">',
                "</td></tr></table>",
                "</div>"
            ].join(''),
            view: "sheet",
            onclick: SocialCalc.SpreadsheetControlCommentOnclick,
            onunclick: SocialCalc.SpreadsheetControlCommentOnunclick,
        });

        // Names Tab
        this.tabnums.names = this.tabs.length;
        this.tabs.push({
            name: "names",
            text: "Names",
            html: [
                '<div id="%id.namestools" style="display:none;">',
                '  <table cellspacing="0" cellpadding="0"><tr>',
                '   <td style="vertical-align:top;padding-right:24px;">',
                '    <div style="%tbt.">%loc!Existing Names!</div>',
                '    <select id="%id.nameslist" size="1" onchange="%s.SpreadsheetControlNamesChangedName();" onfocus="%s.CmdGotFocus(this);"><option selected>[New]</option></select>',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:6px;">',
                '    <div style="%tbt.">%loc!Name!</div>',
                '    <input type="text" id="%id.namesname" style="font-size:x-small;width:75px;" onfocus="%s.CmdGotFocus(this);">',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:6px;">',
                '    <div style="%tbt.">%loc!Description!</div>',
                '    <input type="text" id="%id.namesdesc" style="font-size:x-small;width:150px;" onfocus="%s.CmdGotFocus(this);">',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:6px;">',
                '    <div style="%tbt.">%loc!Value!</div>',
                '    <input type="text" id="%id.namesvalue" width="16" style="font-size:x-small;width:100px;" onfocus="%s.CmdGotFocus(this);">',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:12px;width:100px;">',
                '    <div style="%tbt.">%loc!Set Value To!</div>',
                '    <input type="button" id="%id.namesrangeproposal" value="A1" onclick="%s.SpreadsheetControlNamesSetValue();" style="font-size:x-small;">',
                "   </td>",
                '   <td style="vertical-align:top;padding-right:6px;">',
                '    <div style="%tbt.">&nbsp;</div>',
                '    <input type="button" value="%loc!Save!" onclick="%s.SpreadsheetControlNamesSave();" style="font-size:x-small;">',
                '    <input type="button" value="%loc!Delete!" onclick="%s.SpreadsheetControlNamesDelete()" style="font-size:x-small;">',
                "   </td>",
                "  </tr></table>",
                "</div>"
            ].join(''),
            view: "sheet",
            onclick: SocialCalc.SpreadsheetControlNamesOnclick,
            onunclick: SocialCalc.SpreadsheetControlNamesOnunclick,
        });

        // Clipboard Tab
        this.tabnums.clipboard = this.tabs.length;
        this.tabs.push({
            name: "clipboard",
            text: "Clipboard",
            html: [
                '<div id="%id.clipboardtools" style="display:none;">',
                '  <table cellspacing="0" cellpadding="0"><tr>',
                '   <td style="vertical-align:top;padding-right:24px;">',
                '    <div style="%tbt.">',
                "     &nbsp;",
                "    </div>",
                "   </td>",
                "  </tr></table>",
                "</div>"
            ].join(''),
            view: "clipboard",
            onclick: SocialCalc.SpreadsheetControlClipboardOnclick,
            onclickFocus: "clipboardtext",
        });

        this.views["clipboard"] = {
            name: "clipboard",
            divStyle: "overflow:auto;",
            html: [
                ' <div style="font-size:x-small;padding:5px 0px 10px 0px;">',
                "  <b>%loc!Display Clipboard in!:</b>",
                '  <input type="radio" id="%id.clipboardformat-tab" name="%id.clipboardformat" checked onclick="%s.SpreadsheetControlClipboardFormat(\'tab\');"> %loc!Tab-delimited format! &nbsp;',
                '  <input type="radio" id="%id.clipboardformat-csv" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'csv\');"> %loc!CSV format! &nbsp;',
                '  <input type="radio" id="%id.clipboardformat-scsave" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'scsave\');"> %loc!SocialCalc-save format!',
                " </div>",
                ' <input type="button" value="%loc!Load SocialCalc Clipboard With This!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardLoad();">&nbsp; ',
                ' <input type="button" value="%loc!Clear SocialCalc Clipboard!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardClear();">&nbsp; ',
                " <br>",
                ' <textarea id="%id.clipboardtext" style="font-size:small;height:350px;width:800px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>'
            ].join(''),
        };

        return;
    };

    // *************************************
    //
    // SpreadsheetControl Methods:
    //
    // *************************************

    /**
     * Initialize the spreadsheet control within a DOM node
     * @param {HTMLElement} node - Parent DOM element
     * @param {number} height - Height in pixels
     * @param {number} width - Width in pixels
     * @param {number} spacebelow - Space below in pixels
     * @returns {*} Result of SocialCalc.InitializeSpreadsheetControl
     */
    SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl = function (node, height, width, spacebelow) {
        return SocialCalc.InitializeSpreadsheetControl(this, node, height, width, spacebelow);
    };

    /**
     * Handle window resize events
     * @returns {*} Result of SocialCalc.DoOnResize
     */
    SocialCalc.SpreadsheetControl.prototype.DoOnResize = function () {
        return SocialCalc.DoOnResize(this);
    };

    /**
     * Size the spreadsheet div appropriately
     * @returns {*} Result of SocialCalc.SizeSSDiv
     */
    SocialCalc.SpreadsheetControl.prototype.SizeSSDiv = function () {
        return SocialCalc.SizeSSDiv(this);
    };

    /**
     * Execute a spreadsheet command
     * @param {string} combostr - Combined command string
     * @param {string} sstr - Secondary string parameter
     * @returns {*} Result of SocialCalc.SpreadsheetControlExecuteCommand
     */
    SocialCalc.SpreadsheetControl.prototype.ExecuteCommand = function (combostr, sstr) {
        return SocialCalc.SpreadsheetControlExecuteCommand(this, combostr, sstr);
    };

    /**
     * Create HTML representation of the sheet
     * @returns {string} HTML string of the sheet
     */
    SocialCalc.SpreadsheetControl.prototype.CreateSheetHTML = function () {
        return SocialCalc.SpreadsheetControlCreateSheetHTML(this);
    };

    /**
     * Create a save format of the spreadsheet
     * @param {string} [otherparts] - Additional parts to include in save
     * @returns {string} Save format string
     */
    SocialCalc.SpreadsheetControl.prototype.CreateSpreadsheetSave = function (otherparts) {
        return SocialCalc.SpreadsheetControlCreateSpreadsheetSave(this, otherparts);
    };

    /**
     * Decode a spreadsheet save format string
     * @param {string} str - Save format string to decode
     * @returns {*} Decoded spreadsheet data
     */
    SocialCalc.SpreadsheetControl.prototype.DecodeSpreadsheetSave = function (str) {
        return SocialCalc.SpreadsheetControlDecodeSpreadsheetSave(this, str);
    };

    /**
     * Create HTML for a specific cell
     * @param {string} coord - Cell coordinate (e.g., "A1")
     * @returns {string} HTML representation of the cell
     */
    SocialCalc.SpreadsheetControl.prototype.CreateCellHTML = function (coord) {
        return SocialCalc.SpreadsheetControlCreateCellHTML(this, coord);
    };

    /**
     * Create HTML save format for a range of cells
     * @param {string} range - Cell range (e.g., "A1:B5")
     * @returns {string} HTML save format of the range
     */
    SocialCalc.SpreadsheetControl.prototype.CreateCellHTMLSave = function (range) {
        return SocialCalc.SpreadsheetControlCreateCellHTMLSave(this, range);
    };

    // *************************************
    //
    // Sheet Methods (Convenience wrappers):
    //
    // *************************************

    /**
     * Parse a sheet save format string
     * @param {string} str - Sheet save format string
     * @returns {*} Parsed sheet data
     */
    SocialCalc.SpreadsheetControl.prototype.ParseSheetSave = function (str) {
        return this.sheet.ParseSheetSave(str);
    };

    /**
     * Create a save format string of the current sheet
     * @returns {string} Sheet save format string
     */
    SocialCalc.SpreadsheetControl.prototype.CreateSheetSave = function () {
        return this.sheet.CreateSheetSave();
    };
    // *************************************
    //
    // Functions:
    //
    // *************************************

    /**
     * Initialize the spreadsheet control within a DOM node
     * Creates the control elements and makes them the child of node.
     * If present, height and width specify size. If either is 0 or null (missing),
     * the maximum that fits on the screen (taking spacebelow into account) is used.
     * 
     * Displays the tabs and creates the views (other than "sheet").
     * The first tab is set as selected, but onclick is not invoked.
     * 
     * You should do a redisplay or recalc (which redisplays) after running this.
     * 
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {string|HTMLElement} node - Parent DOM element or its ID
     * @param {number} height - Requested height in pixels (0 or null for auto)
     * @param {number} width - Requested width in pixels (0 or null for auto)
     * @param {number} spacebelow - Space to leave below the control in pixels
     * @returns {void}
     */
    SocialCalc.InitializeSpreadsheetControl = function (spreadsheet, node, height, width, spacebelow) {
        let scc = SocialCalc.Constants;
        let SCLoc = SocialCalc.LocalizeString;
        let SCLocSS = SocialCalc.LocalizeSubstrings;

        let { tabs, views } = spreadsheet;

        spreadsheet.requestedHeight = height;
        spreadsheet.requestedWidth = width;
        spreadsheet.requestedSpaceBelow = spacebelow;

        if (typeof node === "string") {
            node = document.getElementById(node);
        }

        if (node === null) {
            alert("SocialCalc.SpreadsheetControl not given parent node.");
        }

        spreadsheet.parentNode = node;

        // Create node to hold spreadsheet control
        spreadsheet.spreadsheetDiv = document.createElement("div");
        spreadsheet.SizeSSDiv(); // Calculate and fill in the size values

        // Clear existing children
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        // Create the tabbed UI at the top
        let html = `<div><div style="${spreadsheet.toolbarbackground}padding:12px 10px 10px 4px;height:0px;display:none;">`;

        // Add tab HTML content
        for (let i = 0; i < tabs.length; i++) {
            html += tabs[i].html;
        }

        html += `</div><div style="${spreadsheet.tabbackground}padding-bottom:4px;margin:0px 0px 8px 0px;display:none;"><table cellpadding="0" cellspacing="0"><tr>`;

        // Create tab headers
        for (let i = 0; i < tabs.length; i++) {
            let tabStyle = i === 0 ? spreadsheet.tabselectedCSS : spreadsheet.tabplainCSS;
            html += `  <td id="%id.${tabs[i].name}tab" style="${tabStyle}" onclick="%s.SetTab(this);">${SCLoc(tabs[i].text)}</td>`;
        }

        html += " </tr></table></div></div>";
        spreadsheet.currentTab = 0; // This is where we started

        // Apply replacements
        for (let style in spreadsheet.tabreplacements) {
            let replacement = spreadsheet.tabreplacements[style];
            html = html.replace(replacement.regex, replacement.replacement);
        }

        html = html.replace(/\%s\./g, "SocialCalc.")
            .replace(/\%id\./g, spreadsheet.idPrefix)
            .replace(/\%tbt\./g, spreadsheet.toolbartext)
            .replace(/\%img\./g, spreadsheet.imagePrefix);

        html = SCLocSS(html); // Localize with %loc!string! and %scc!constant!

        spreadsheet.spreadsheetDiv.innerHTML = html;
        node.appendChild(spreadsheet.spreadsheetDiv);

        // Initialize SocialCalc buttons
        spreadsheet.Buttons = {
            button_undo: { tooltip: "Undo", command: "undo" },
            button_redo: { tooltip: "Redo", command: "redo" },
            button_copy: { tooltip: "Copy", command: "copy" },
            button_cut: { tooltip: "Cut", command: "cut" },
            button_paste: { tooltip: "Paste", command: "paste" },
            button_pasteformats: { tooltip: "Paste Formats", command: "pasteformats" },
            button_delete: { tooltip: "Delete Contents", command: "delete" },
            button_filldown: { tooltip: "Fill Down", command: "filldown" },
            button_fillright: { tooltip: "Fill Right", command: "fillright" },
            button_movefrom: { tooltip: "Set/Clear Move From", command: "movefrom" },
            button_movepaste: { tooltip: "Move Paste", command: "movepaste" },
            button_moveinsert: { tooltip: "Move Insert", command: "moveinsert" },
            button_alignleft: { tooltip: "Align Left", command: "align-left" },
            button_aligncenter: { tooltip: "Align Center", command: "align-center" },
            button_alignright: { tooltip: "Align Right", command: "align-right" },
            button_borderon: { tooltip: "Borders On", command: "borderon" },
            button_borderoff: { tooltip: "Borders Off", command: "borderoff" },
            button_swapcolors: { tooltip: "Swap Colors", command: "swapcolors" },
            button_merge: { tooltip: "Merge Cells", command: "merge" },
            button_unmerge: { tooltip: "Unmerge Cells", command: "unmerge" },
            button_insertrow: { tooltip: "Insert Row", command: "insertrow" },
            button_insertcol: { tooltip: "Insert Column", command: "insertcol" },
            button_deleterow: { tooltip: "Delete Row", command: "deleterow" },
            button_deletecol: { tooltip: "Delete Column", command: "deletecol" },
            button_recalc: { tooltip: "Recalc", command: "recalc" },
        };

        // Register button event handlers
        for (let button in spreadsheet.Buttons) {
            let bele = document.getElementById(spreadsheet.idPrefix + button);
            if (!bele) continue;

            bele.style.border = `1px solid ${scc.ISCButtonBorderNormal}`;

            SocialCalc.TooltipRegister(bele, SCLoc(spreadsheet.Buttons[button].tooltip), {});

            SocialCalc.ButtonRegister(
                bele,
                {
                    normalstyle: `border:1px solid ${scc.ISCButtonBorderNormal};backgroundColor:${scc.ISCButtonBorderNormal};`,
                    hoverstyle: `border:1px solid ${scc.ISCButtonBorderHover};backgroundColor:${scc.ISCButtonBorderNormal};`,
                    downstyle: `border:1px solid ${scc.ISCButtonBorderDown};backgroundColor:${scc.ISCButtonDownBackground};`,
                },
                {
                    MouseDown: SocialCalc.DoButtonCmd,
                    command: spreadsheet.Buttons[button].command,
                }
            );
        }

        // Create formula bar
        spreadsheet.dummyFormulaDiv = document.createElement("div");
        spreadsheet.dummyFormulaDiv.style.height = `${spreadsheet.formulabarheight}px`;
        spreadsheet.spreadsheetDiv.appendChild(spreadsheet.dummyFormulaDiv);

        spreadsheet.formulabarDiv = document.createElement("div");
        spreadsheet.formulabarDiv.id = "formulabardiv";
        spreadsheet.formulabarDiv.style.height = `${spreadsheet.formulabarheight}px`;
        spreadsheet.formulabarDiv.innerHTML = '<input type="text" size="20" value="" disabled="true">';

        let inputbox = new SocialCalc.InputBox(spreadsheet.formulabarDiv.firstChild, spreadsheet.editor);

        // Create clear button (currently hidden)
        let bele = document.createElement("img");
        bele.id = "testtest";
        bele.src = "lib/aspiring/www/assets/images/delete24.png";
        bele.style.verticalAlign = "middle";
        bele.style.display = "none";

        SocialCalc.ButtonRegister(
            bele,
            { normalstyle: "", hoverstyle: "", downstyle: "" },
            { MouseDown: SocialCalc.InputLineClearText }
        );

        // Initialize tabs that need it
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].oncreate) {
                tabs[i].oncreate(spreadsheet, tabs[i].name);
            }
        }

        // Create sheet view and others
        if (!scc.doWorkBook) {
            spreadsheet.nonviewheight = spreadsheet.statuslineheight +
                spreadsheet.spreadsheetDiv.firstChild.offsetHeight +
                spreadsheet.spreadsheetDiv.lastChild.offsetHeight;
        } else {
            spreadsheet.nonviewheight = 28 + spreadsheet.sheetbarheight +
                spreadsheet.spreadsheetDiv.firstChild.offsetHeight +
                spreadsheet.spreadsheetDiv.lastChild.offsetHeight;
        }

        spreadsheet.viewheight = spreadsheet.height - spreadsheet.nonviewheight;
        spreadsheet.editorDiv = spreadsheet.editor.CreateTableEditor(spreadsheet.width, spreadsheet.viewheight);
        spreadsheet.spreadsheetDiv.appendChild(spreadsheet.editorDiv);

        // Create additional views
        for (let vname in views) {
            let viewHtml = views[vname].html;

            // Apply view-specific replacements
            for (let style in views[vname].replacements) {
                let replacement = views[vname].replacements[style];
                viewHtml = viewHtml.replace(replacement.regex, replacement.replacement);
            }

            viewHtml = viewHtml.replace(/\%s\./g, "SocialCalc.")
                .replace(/\%id\./g, spreadsheet.idPrefix)
                .replace(/\%tbt\./g, spreadsheet.toolbartext)
                .replace(/\%img\./g, spreadsheet.imagePrefix);

            let v = document.createElement("div");
            SocialCalc.setStyles(v, views[vname].divStyle);
            v.style.display = "none";
            v.style.width = `${spreadsheet.width}px`;
            v.style.height = `${spreadsheet.viewheight}px`;

            viewHtml = SCLocSS(viewHtml); // Localize with %loc!string!, etc.

            v.innerHTML = viewHtml;
            spreadsheet.spreadsheetDiv.appendChild(v);
            views[vname].element = v;

            if (views[vname].oncreate) {
                views[vname].oncreate(spreadsheet, views[vname]);
            }
        }

        views.sheet = { name: "sheet", element: spreadsheet.editorDiv };

        // Create statusline
        if (!scc.doWorkBook) {
            spreadsheet.statuslineDiv = document.createElement("div");
            spreadsheet.statuslineDiv.style.cssText = spreadsheet.statuslineCSS;

            let paddingTop = parseInt(spreadsheet.statuslineDiv.style.paddingTop, 10) || 0;
            let paddingBottom = parseInt(spreadsheet.statuslineDiv.style.paddingBottom, 10) || 0;
            spreadsheet.statuslineDiv.style.height = `${spreadsheet.statuslineheight - paddingTop - paddingBottom}px`;
            spreadsheet.statuslineDiv.id = `${spreadsheet.idPrefix}statusline`;
            spreadsheet.spreadsheetDiv.appendChild(spreadsheet.statuslineDiv);
        } else {
            SocialCalc.CreateSheetStatusBar(spreadsheet, scc);
        }

        // Done - refresh screen needed
    };

    /**
     * Create sheet status bar for workbook mode
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {object} scc - SocialCalc constants
     * @returns {void}
     */
    SocialCalc.CreateSheetStatusBar = function (spreadsheet, scc) {
        if (!scc.doWorkBook) {
            return;
        }

        // Create a table with 1 row, containing 3 columns: sheetbar, separator, statusline
        spreadsheet.sheetstatusbarDiv = document.createElement("div");
        spreadsheet.sheetstatusbarDiv.style.height = `${spreadsheet.sheetbarheight + 3}px`;
        spreadsheet.sheetstatusbarDiv.style.backgroundColor = "#CCC";
        spreadsheet.sheetstatusbarDiv.id = `${spreadsheet.idPrefix}sheetstatusbar`;

        spreadsheet.sheetbarDiv = document.createElement("div");
        spreadsheet.sheetbarDiv.id = `${spreadsheet.idPrefix}sheetbar`;

        spreadsheet.statuslineDiv = document.createElement("div");
        spreadsheet.statuslineDiv.style.cssText = spreadsheet.statuslineCSS;
        spreadsheet.statuslineDiv.id = `${spreadsheet.idPrefix}statusline`;

        let table = document.createElement("table");
        spreadsheet.sheetstatusbartable = table;
        table.cellSpacing = 0;
        table.cellPadding = 0;
        table.width = "100%";

        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        let tr = document.createElement("tr");
        tbody.appendChild(tr);

        // Sheet bar column
        let td = document.createElement("td");
        td.appendChild(spreadsheet.sheetbarDiv);
        td.width = scc.SCSheetBarWidth;
        tr.appendChild(td);

        // Separator column
        td = document.createElement("td");
        td.innerHTML = "<span>&nbsp|&nbsp</span>";
        td.width = "1%";
        tr.appendChild(td);

        // Status line column
        td = document.createElement("td");
        td.appendChild(spreadsheet.statuslineDiv);
        tr.appendChild(td);

        spreadsheet.sheetstatusbarDiv.appendChild(table);
        spreadsheet.spreadsheetDiv.appendChild(spreadsheet.sheetstatusbarDiv);
        spreadsheet.sheetstatusbarDiv.style.display = "none";
    };

    /**
     * SocialCalc function to make localization easier.
     * If str is "Text to localize", it returns SocialCalc.Constants.s_loc_text_to_localize
     * if it exists, or else with just "Text to localize".
     * Note that spaces are replaced with "_" and other special chars with "X" in the name
     * of the constant (e.g., "A & B" would look for SocialCalc.Constants.s_loc_a_X_b).
     * 
     * @param {string} str - String to localize
     * @returns {string} Localized string or original string if not found
     */
    SocialCalc.LocalizeString = function (str) {
        let cstr = SocialCalc.LocalizeStringList[str]; // Found already this session?

        if (!cstr) {
            // No - look up
            let constantName = `s_loc_${str.toLowerCase().replace(/\s/g, "_").replace(/\W/g, "X")}`;
            cstr = SocialCalc.Constants[constantName] || str;
            SocialCalc.LocalizeStringList[str] = cstr;
        }

        return cstr;
    };

    /**
     * A list of strings to localize accumulated by the LocalizeString routine
     * @type {object.<string, string>}
     */
    SocialCalc.LocalizeStringList = {};

    /**
     * SocialCalc function to make localization easier using %loc and %scc.
     * 
     * Replaces sections of str with:
     *    %loc!Text to localize!
     * with SocialCalc.Constants.s_loc_text_to_localize if it exists,
     * or else with just "Text to localize".
     * Note that spaces are replaced with "_" and other special chars with "X"
     * in the name of the constant (e.g., %loc!A & B! would look for 
     * SocialCalc.Constants.s_loc_a_X_b). Uses SocialCalc.LocalizeString for this.
     * 
     * Replaces sections of str with:
     *    %ssc!constant-name!
     * with SocialCalc.Constants.constant-name.
     * If the constant doesn't exist, shows an alert.
     * 
     * @param {string} str - String containing localization tokens
     * @returns {string} String with tokens replaced by localized content
     */
    SocialCalc.LocalizeSubstrings = function (str) {
        let SCLoc = SocialCalc.LocalizeString;

        return str.replace(/%(loc|ssc)!(.*?)!/g, (match, type, content) => {
            if (type === "ssc") {
                return SocialCalc.Constants[content] || alert(`Missing constant: ${content}`);
            } else {
                return SCLoc(content);
            }
        });
    };

    /**
     * Returns the current spreadsheet control object
     * @returns {SocialCalc.SpreadsheetControl|null} Current spreadsheet control object or null
     */
    SocialCalc.GetSpreadsheetControlObject = function () {
        let csco = SocialCalc.CurrentSpreadsheetControlObject;
        if (csco) return csco;

        // Optionally throw error: throw ("No current SpreadsheetControl object.");
        return null;
    };

    /**
     * Process an onResize event, setting the different views.
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @returns {void}
     */
    SocialCalc.DoOnResize = function (spreadsheet) {
        let { views } = spreadsheet;
        let needresize = spreadsheet.SizeSSDiv();

        if (!needresize) return;

        // Resize all views
        for (let vname in views) {
            let v = views[vname].element;
            v.style.width = `${spreadsheet.width}px`;
            v.style.height = `${spreadsheet.height - spreadsheet.nonviewheight}px`;
        }

        spreadsheet.editor.ResizeTableEditor(
            spreadsheet.width,
            spreadsheet.height - spreadsheet.nonviewheight
        );
    };

    /**
     * Figure out a reasonable size for the spreadsheet, given any requested values and viewport.
     * Sets spreadsheet div to that size.
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @returns {boolean} True if different than existing values (resized)
     */
    SocialCalc.SizeSSDiv = function (spreadsheet) {
        let fudgefactorX = 10; // For IE compatibility
        let fudgefactorY = 10;
        let resized = false;

        let sizes = SocialCalc.GetViewportInfo();
        let pos = SocialCalc.GetElementPosition(spreadsheet.parentNode);
        pos.bottom = 0;
        pos.right = 0;

        let { style: nodestyle } = spreadsheet.parentNode;

        // Account for margins
        if (nodestyle.marginTop) {
            pos.top += parseInt(nodestyle.marginTop, 10);
        }
        if (nodestyle.marginBottom) {
            pos.bottom += parseInt(nodestyle.marginBottom, 10);
        }
        if (nodestyle.marginLeft) {
            pos.left += parseInt(nodestyle.marginLeft, 10);
        }
        if (nodestyle.marginRight) {
            pos.right += parseInt(nodestyle.marginRight, 10);
        }

        // Calculate and set height
        let newHeight = spreadsheet.requestedHeight ||
            sizes.height - (pos.top + pos.bottom + fudgefactorY) - (spreadsheet.requestedSpaceBelow || 0);

        if (spreadsheet.height !== newHeight) {
            spreadsheet.height = newHeight;
            spreadsheet.spreadsheetDiv.style.height = `${newHeight}px`;
            resized = true;
        }

        // Calculate and set width
        let newWidth = spreadsheet.requestedWidth ||
            sizes.width - (pos.left + pos.right + fudgefactorX) || 700;

        if (spreadsheet.width !== newWidth) {
            spreadsheet.width = newWidth;
            spreadsheet.spreadsheetDiv.style.width = `${newWidth}px`;
            resized = true;
        }

        return resized;
    };
    // *************************************
    //
    // Tab and Command Functions:
    //
    // *************************************

    /**
     * Set the active tab in the spreadsheet control
     * The obj argument is either a string with the tab name or a DOM element with an ID
     * 
     * @param {string|HTMLElement} obj - Tab name string or DOM element with tab ID
     * @returns {void}
     */
    SocialCalc.SetTab = function (obj) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { tabs, views } = spreadsheet;
        let menutabs = {};
        let tools = {};
        let newtab, newtabnum, newview;

        if (typeof obj === "string") {
            newtab = obj;
        } else {
            newtab = obj.id.slice(spreadsheet.idPrefix.length, -3);
        }

        // If busy and switching from "sheet", ignore certain tab switches
        if (spreadsheet.editor.busy &&
            (!tabs[spreadsheet.currentTab].view || tabs[spreadsheet.currentTab].view === "sheet")) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].name === newtab && tabs[i].view && tabs[i].view !== "sheet") {
                    return;
                }
            }
        }

        // Call unclick handler for current tab
        if (spreadsheet.tabs[spreadsheet.currentTab].onunclick) {
            spreadsheet.tabs[spreadsheet.currentTab].onunclick(
                spreadsheet,
                spreadsheet.tabs[spreadsheet.currentTab].name
            );
        }

        // Update tab styles and visibility
        for (let i = 0; i < tabs.length; i++) {
            let tname = tabs[i].name;
            menutabs[tname] = document.getElementById(`${spreadsheet.idPrefix}${tname}tab`);
            tools[tname] = document.getElementById(`${spreadsheet.idPrefix}${tname}tools`);

            if (tname === newtab) {
                newtabnum = i;
                tools[tname].style.display = "block";
                menutabs[tname].style.cssText = spreadsheet.tabselectedCSS;
            } else {
                tools[tname].style.display = "none";
                menutabs[tname].style.cssText = spreadsheet.tabplainCSS;
            }
        }

        spreadsheet.currentTab = newtabnum;

        // Call onclick handler for new tab
        if (tabs[newtabnum].onclick) {
            tabs[newtabnum].onclick(spreadsheet, newtab);
        }

        // Update view visibility
        for (let vname in views) {
            let shouldShow = (!tabs[newtabnum].view && vname === "sheet") || tabs[newtabnum].view === vname;

            if (shouldShow) {
                views[vname].element.style.display = "block";
                newview = vname;
            } else {
                views[vname].element.style.display = "none";
            }
        }

        // Handle focus
        if (tabs[newtabnum].onclickFocus) {
            let ele = tabs[newtabnum].onclickFocus;
            if (typeof ele === "string") {
                ele = document.getElementById(spreadsheet.idPrefix + ele);
                ele.focus();
            }
            SocialCalc.CmdGotFocus(ele);
        } else {
            SocialCalc.KeyboardFocus();
        }

        // Handle view resize if needed
        if (views[newview].needsresize && views[newview].onresize) {
            views[newview].needsresize = false;
            views[newview].onresize(spreadsheet, views[newview]);
        }

        // Handle status line visibility
        if (newview === "sheet") {
            spreadsheet.statuslineDiv.style.display = "block";
            spreadsheet.editor.ScheduleRender();
        } else {
            spreadsheet.statuslineDiv.style.display = "none";
        }
    };

    /**
     * Status line callback for spreadsheet control
     * @param {SocialCalc.TableEditor} editor - The table editor instance
     * @param {string} status - Status type
     * @param {*} arg - Status argument
     * @param {object} params - Parameters including element IDs
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlStatuslineCallback = function (editor, status, arg, params) {
        let ele = document.getElementById(params.statuslineid);

        if (ele) {
            ele.innerHTML = editor.GetStatuslineString(status, arg, params);
        }

        switch (status) {
            case "cmdendnorender":
            case "calcfinished":
            case "doneposcalc":
                let rele1 = document.getElementById(params.recalcid1);
                let rele2 = document.getElementById(params.recalcid2);

                if (!rele1 || !rele2) break;

                let needsRecalc = editor.context.sheetobj.attribs.needsrecalc === "yes";
                let displayStyle = needsRecalc ? "inline" : "none";

                rele1.style.display = displayStyle;
                rele2.style.display = displayStyle;
                break;

            default:
                break;
        }
    };

    /**
     * Update sort range proposed in the UI in element idPrefix+sortlist
     * @param {SocialCalc.TableEditor} editor - The table editor instance
     * @returns {void}
     */
    SocialCalc.UpdateSortRangeProposal = function (editor) {
        let ele = document.getElementById(`${SocialCalc.GetSpreadsheetControlObject().idPrefix}sortlist`);

        if (editor.range.hasrange) {
            let topLeft = SocialCalc.crToCoord(editor.range.left, editor.range.top);
            let bottomRight = SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
            ele.options[0].text = `${topLeft}:${bottomRight}`;
        } else {
            ele.options[0].text = SocialCalc.LocalizeString("[select range]");
        }
    };

    /**
     * Update list of columns for choosing which to sort for Major, Minor, and Last sort
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @returns {void}
     */
    SocialCalc.LoadColumnChoosers = function (spreadsheet) {
        let SCLoc = SocialCalc.LocalizeString;
        let sortrange;

        if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":") === -1) {
            // sortrange is a named range
            let nrange = SocialCalc.Formula.LookupName(spreadsheet.sheet, spreadsheet.sortrange || "");
            if (nrange.type === "range") {
                let rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
                sortrange = `${rparts[1]}:${rparts[2]}`;
            } else {
                sortrange = "A1:A1";
            }
        } else {
            sortrange = spreadsheet.sortrange;
        }

        let range = SocialCalc.ParseRange(sortrange);

        // Update major sort dropdown
        let majorSele = document.getElementById(`${spreadsheet.idPrefix}majorsort`);
        let majorOldIndex = majorSele.selectedIndex;
        majorSele.options.length = 0;
        majorSele.options[0] = new Option(SCLoc("[None]"), "");

        for (let col = range.cr1.col; col <= range.cr2.col; col++) {
            let colname = SocialCalc.rcColname(col);
            majorSele.options[majorSele.options.length] = new Option(`${SCLoc("Column ")}${colname}`, colname);
        }

        majorSele.selectedIndex = (majorOldIndex > 1 && majorOldIndex <= range.cr2.col - range.cr1.col + 1)
            ? majorOldIndex : 1;

        // Update minor sort dropdown
        let minorSele = document.getElementById(`${spreadsheet.idPrefix}minorsort`);
        let minorOldIndex = minorSele.selectedIndex;
        minorSele.options.length = 0;
        minorSele.options[0] = new Option(SCLoc("[None]"), "");

        for (let col = range.cr1.col; col <= range.cr2.col; col++) {
            let colname = SocialCalc.rcColname(col);
            minorSele.options[minorSele.options.length] = new Option(colname, colname);
        }

        minorSele.selectedIndex = (minorOldIndex > 0 && minorOldIndex <= range.cr2.col - range.cr1.col + 1)
            ? minorOldIndex : 0;

        // Update last sort dropdown
        let lastSele = document.getElementById(`${spreadsheet.idPrefix}lastsort`);
        let lastOldIndex = lastSele.selectedIndex;
        lastSele.options.length = 0;
        lastSele.options[0] = new Option(SCLoc("[None]"), "");

        for (let col = range.cr1.col; col <= range.cr2.col; col++) {
            let colname = SocialCalc.rcColname(col);
            lastSele.options[lastSele.options.length] = new Option(colname, colname);
        }

        lastSele.selectedIndex = (lastOldIndex > 0 && lastOldIndex <= range.cr2.col - range.cr1.col + 1)
            ? lastOldIndex : 0;
    };

    /**
     * Set SocialCalc.Keyboard.passThru: obj should be element with focus or "true"
     * @param {HTMLElement|boolean} obj - Element with focus or boolean true
     * @returns {void}
     */
    SocialCalc.CmdGotFocus = function (obj) {
        SocialCalc.Keyboard.passThru = obj;
    };

    /**
     * Handle button command execution
     * @param {Event} e - Event object
     * @param {object} buttoninfo - Button information object
     * @param {object} bobj - Button object containing element and function info
     * @returns {void}
     */
    SocialCalc.DoButtonCmd = function (e, buttoninfo, bobj) {
        SocialCalc.DoCmd(bobj.element, bobj.functionobj.command);
    };

    /**
     * Execute various spreadsheet commands
     * @param {HTMLElement} obj - DOM element that triggered the command
     * @param {string} which - Command identifier
     * @returns {void}
     */
    SocialCalc.DoCmd = function (obj, which) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let combostr, sstr, str, ele, sortrange, nrange, rparts;

        switch (which) {
            case "undo":
                spreadsheet.ExecuteCommand("undo", "");
                break;

            case "redo":
                spreadsheet.ExecuteCommand("redo", "");
                break;

            case "fill-rowcolstuff":
            case "fill-text":
                let cl = which.substring(5);
                let clele = document.getElementById(`${spreadsheet.idPrefix}${cl}list`);
                clele.length = 0;

                for (let i = 0; i < SocialCalc.SpreadsheetCmdTable[cl].length; i++) {
                    clele.options[i] = new Option(SocialCalc.SpreadsheetCmdTable[cl][i].t);
                }

                SocialCalc.DoCmd(obj, `changed-${cl}`); // Fall through to changed code
                return;

            case "changed-rowcolstuff":
            case "changed-text":
                let changeType = which.substring(8);
                let changeClele = document.getElementById(`${spreadsheet.idPrefix}${changeType}list`);
                let slist = SocialCalc.SpreadsheetCmdTable.slists[
                    SocialCalc.SpreadsheetCmdTable[changeType][changeClele.selectedIndex].s
                ];
                let slistele = document.getElementById(`${spreadsheet.idPrefix}${changeType}slist`);
                slistele.length = 0;

                for (let i = 0; i < (slist?.length || 0); i++) {
                    slistele.options[i] = new Option(slist[i].t, slist[i].s);
                }
                return;

            case "ok-rowcolstuff":
            case "ok-text":
                let okType = which.substring(3);
                let okClele = document.getElementById(`${spreadsheet.idPrefix}${okType}list`);
                let okSlistele = document.getElementById(`${spreadsheet.idPrefix}${okType}slist`);
                combostr = SocialCalc.SpreadsheetCmdTable[okType][okClele.selectedIndex].c;
                sstr = okSlistele[okSlistele.selectedIndex].value;
                SocialCalc.SpreadsheetControlExecuteCommand(obj, combostr, sstr);
                break;

            case "ok-setsort":
                let lele = document.getElementById(`${spreadsheet.idPrefix}sortlist`);

                if (lele.selectedIndex === 0) {
                    if (editor.range.hasrange) {
                        let topLeft = SocialCalc.crToCoord(editor.range.left, editor.range.top);
                        let bottomRight = SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
                        spreadsheet.sortrange = `${topLeft}:${bottomRight}`;
                    } else {
                        spreadsheet.sortrange = `${editor.ecell.coord}:${editor.ecell.coord}`;
                    }
                } else {
                    spreadsheet.sortrange = lele.options[lele.selectedIndex].value;
                }

                ele = document.getElementById(`${spreadsheet.idPrefix}sortbutton`);
                ele.value = `${SocialCalc.LocalizeString("Sort ")}${spreadsheet.sortrange}`;
                ele.style.visibility = "visible";
                SocialCalc.LoadColumnChoosers(spreadsheet);

                if (obj?.blur) obj.blur();
                SocialCalc.KeyboardFocus();
                return;

            case "dosort":
                if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":") === -1) {
                    // sortrange is a named range
                    nrange = SocialCalc.Formula.LookupName(spreadsheet.sheet, spreadsheet.sortrange || "");
                    if (nrange.type !== "range") return;
                    rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
                    sortrange = `${rparts[1]}:${rparts[2]}`;
                } else {
                    sortrange = spreadsheet.sortrange;
                }

                if (sortrange === "A1:A1") return;

                str = `sort ${sortrange} `;
                let majorSele = document.getElementById(`${spreadsheet.idPrefix}majorsort`);
                let majorRele = document.getElementById(`${spreadsheet.idPrefix}majorsortup`);
                str += `${majorSele.options[majorSele.selectedIndex].value}${majorRele.checked ? " up" : " down"}`;

                let minorSele = document.getElementById(`${spreadsheet.idPrefix}minorsort`);
                if (minorSele.selectedIndex > 0) {
                    let minorRele = document.getElementById(`${spreadsheet.idPrefix}minorsortup`);
                    str += ` ${minorSele.options[minorSele.selectedIndex].value}${minorRele.checked ? " up" : " down"}`;
                }

                let lastSele = document.getElementById(`${spreadsheet.idPrefix}lastsort`);
                if (lastSele.selectedIndex > 0) {
                    let lastRele = document.getElementById(`${spreadsheet.idPrefix}lastsortup`);
                    str += ` ${lastSele.options[lastSele.selectedIndex].value}${lastRele.checked ? " up" : " down"}`;
                }

                spreadsheet.ExecuteCommand(str, "");
                break;

            case "merge":
                combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
                sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
                spreadsheet.ExecuteCommand(combostr, sstr);

                if (editor.range.hasrange) {
                    // Set ecell to upper left
                    editor.MoveECell(SocialCalc.crToCoord(editor.range.left, editor.range.top));
                    editor.RangeRemove();
                }
                break;

            case "movefrom":
                if (editor.range2.hasrange) {
                    // Toggle if already there
                    spreadsheet.context.cursorsuffix = "";
                    editor.Range2Remove();
                    spreadsheet.ExecuteCommand("redisplay", "");
                } else if (editor.range.hasrange) {
                    // Set range2 to range
                    Object.assign(editor.range2, {
                        top: editor.range.top,
                        right: editor.range.right,
                        bottom: editor.range.bottom,
                        left: editor.range.left,
                        hasrange: true
                    });
                    editor.MoveECell(SocialCalc.crToCoord(editor.range.left, editor.range.top));
                } else {
                    // Set range2 to single cell
                    Object.assign(editor.range2, {
                        top: editor.ecell.row,
                        right: editor.ecell.col,
                        bottom: editor.ecell.row,
                        left: editor.ecell.col,
                        hasrange: true
                    });
                }

                let suffix = editor.range2.hasrange ? "" : "off";
                let moveButtons = ["movefrom", "movepaste", "moveinsert"];

                moveButtons.forEach(buttonName => {
                    let buttonEle = document.getElementById(`${spreadsheet.idPrefix}button_${buttonName}`);
                    buttonEle.src = `${spreadsheet.imagePrefix}${buttonName}${suffix}.gif`;
                });

                if (editor.range2.hasrange) editor.RangeRemove();
                break;

            case "movepaste":
            case "moveinsert":
                if (editor.range2.hasrange) {
                    spreadsheet.context.cursorsuffix = "";
                    let topLeft = SocialCalc.crToCoord(editor.range2.left, editor.range2.top);
                    let bottomRight = SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom);
                    combostr = `${which} ${topLeft}:${bottomRight} ${editor.ecell.coord}`;
                    spreadsheet.ExecuteCommand(combostr, "");
                    editor.Range2Remove();

                    let moveOffButtons = ["movefrom", "movepaste", "moveinsert"];
                    moveOffButtons.forEach(buttonName => {
                        let buttonEle = document.getElementById(`${spreadsheet.idPrefix}button_${buttonName}`);
                        buttonEle.src = `${spreadsheet.imagePrefix}${buttonName}off.gif`;
                    });
                }
                break;

            case "swapcolors":
                let { sheet } = spreadsheet;
                let cell = sheet.GetAssuredCell(editor.ecell.coord);
                let defaultcolor = sheet.attribs.defaultcolor
                    ? sheet.colors[sheet.attribs.defaultcolor]
                    : "rgb(0,0,0)";
                let defaultbgcolor = sheet.attribs.defaultbgcolor
                    ? sheet.colors[sheet.attribs.defaultbgcolor]
                    : "rgb(255,255,255)";

                let color = cell.color ? sheet.colors[cell.color] : defaultcolor;
                if (color === defaultbgcolor) color = ""; // Use default if same as background

                let bgcolor = cell.bgcolor ? sheet.colors[cell.bgcolor] : defaultbgcolor;
                if (bgcolor === defaultcolor) bgcolor = ""; // Use default if same as foreground

                spreadsheet.ExecuteCommand(`set %C color ${bgcolor}%Nset %C bgcolor ${color}`, "");
                break;

            default:
                combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
                sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
                spreadsheet.ExecuteCommand(combostr, sstr);
                break;
        }

        if (obj?.blur) obj.blur();
        SocialCalc.KeyboardFocus();
    };

    /**
     * Command lookup table for spreadsheet operations
     * @type {object.<string, string>}
     */
    SocialCalc.SpreadsheetCmdLookup = {
        copy: "copy %C all",
        cut: "cut %C all",
        paste: "paste %C all",
        pasteformats: "paste %C formats",
        delete: "erase %C formulas",
        filldown: "filldown %C all",
        fillright: "fillright %C all",
        erase: "erase %C all",
        borderon: "set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S",
        borderoff: "set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S",
        merge: "merge %C",
        unmerge: "unmerge %C",
        "align-left": "set %C cellformat left",
        "align-center": "set %C cellformat center",
        "align-right": "set %C cellformat right",
        "align-default": "set %C cellformat",
        insertrow: "insertrow %C",
        insertcol: "insertcol %C",
        deleterow: "deleterow %C",
        deletecol: "deletecol %C",
        undo: "undo",
        redo: "redo",
        recalc: "recalc",
    };

    /**
     * Secondary string lookup table for commands
     * @type {object.<string, string>}
     */
    SocialCalc.SpreadsheetCmdSLookup = {
        borderon: "1px solid rgb(0,0,0)",
        borderoff: "",
    };

    /**
     * Execute a spreadsheet command with parameter substitution
     * @param {HTMLElement} obj - DOM element that triggered the command
     * @param {string} combostr - Command string template with placeholders
     * @param {string} sstr - Secondary string parameter
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlExecuteCommand = function (obj, combostr, sstr) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor: eobj } = spreadsheet;

        let str = {
            P: "%",
            N: "\n"
        };

        if (eobj.range.hasrange) {
            let topLeft = SocialCalc.crToCoord(eobj.range.left, eobj.range.top);
            let bottomRight = SocialCalc.crToCoord(eobj.range.right, eobj.range.bottom);
            str.R = `${topLeft}:${bottomRight}`;
            str.C = str.R;
            str.W = `${SocialCalc.rcColname(eobj.range.left)}:${SocialCalc.rcColname(eobj.range.right)}`;
        } else {
            str.C = eobj.ecell.coord;
            str.R = `${eobj.ecell.coord}:${eobj.ecell.coord}`;
            str.W = SocialCalc.rcColname(SocialCalc.coordToCr(eobj.ecell.coord).col);
        }

        str.S = sstr;

        // Replace all placeholders
        combostr = combostr.replace(/%C/g, str.C)
            .replace(/%R/g, str.R)
            .replace(/%N/g, str.N)
            .replace(/%S/g, str.S)
            .replace(/%W/g, str.W)
            .replace(/%P/g, str.P);

        eobj.EditorScheduleSheetCommands(combostr, true, false);
    };

    /**
     * Create HTML representation of the whole spreadsheet
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @returns {string} HTML representation of the sheet
     */
    SocialCalc.SpreadsheetControlCreateSheetHTML = function (spreadsheet) {
        let context = new SocialCalc.RenderContext(spreadsheet.sheet);
        let div = document.createElement("div");
        let ele = context.RenderSheet(null, { type: "html" });

        div.appendChild(ele);
        let result = div.innerHTML;

        // Cleanup
        return result;
    };

    /**
     * Create HTML representation of a specific cell
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {string} coord - Cell coordinate (e.g., "A1")
     * @param {string} [linkstyle] - Link style for HTML formatting
     * @returns {string} HTML representation of the cell (blank is "", not "&nbsp;")
     */
    SocialCalc.SpreadsheetControlCreateCellHTML = function (spreadsheet, coord, linkstyle) {
        let cell = spreadsheet.sheet.cells[coord];
        if (!cell) return "";

        let result;
        if (cell.displaystring === undefined) {
            result = SocialCalc.FormatValueForDisplay(
                spreadsheet.sheet,
                cell.datavalue,
                coord,
                linkstyle || spreadsheet.context.defaultHTMLlinkstyle
            );
        } else {
            result = cell.displaystring;
        }

        return result === "&nbsp;" ? "" : result;
    };

    /**
     * Create HTML save format for a range of cells
     * Returns HTML representation of a range of cells, or the whole sheet if range is null.
     * The form is:
     *    version:1.0
     *    coord:cell-HTML
     *    coord:cell-HTML
     *    ...
     * 
     * Empty cells are skipped. The cell-HTML is encoded with ":"=>"\c", newline=>"\n", and "\"=>"\b".
     * 
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {string|null} range - Cell range (e.g., "A1:B5") or null for whole sheet
     * @param {string} [linkstyle] - Link style for HTML formatting
     * @returns {string} HTML save format string
     */
    SocialCalc.SpreadsheetControlCreateCellHTMLSave = function (spreadsheet, range, linkstyle) {
        let result = ["version:1.0"];
        let prange;

        if (range) {
            prange = SocialCalc.ParseRange(range);
        } else {
            prange = {
                cr1: { row: 1, col: 1 },
                cr2: {
                    row: spreadsheet.sheet.attribs.lastrow,
                    col: spreadsheet.sheet.attribs.lastcol,
                },
            };
        }

        let { cr1, cr2 } = prange;

        for (let row = cr1.row; row <= cr2.row; row++) {
            for (let col = cr1.col; col <= cr2.col; col++) {
                let coord = SocialCalc.crToCoord(col, row);
                let cell = spreadsheet.sheet.cells[coord];

                if (!cell) continue;

                let cellHTML;
                if (cell.displaystring === undefined) {
                    cellHTML = SocialCalc.FormatValueForDisplay(
                        spreadsheet.sheet,
                        cell.datavalue,
                        coord,
                        linkstyle || spreadsheet.context.defaultHTMLlinkstyle
                    );
                } else {
                    cellHTML = cell.displaystring;
                }

                if (cellHTML === "&nbsp;") continue;

                result.push(`${coord}:${SocialCalc.encodeForSave(cellHTML)}`);
            }
        }

        result.push(""); // Extra newline
        return result.join("\n");
    };

    // *************************************
    //
    // Formula Bar Button Routines:
    //
    // *************************************

    /**
     * Display the function list dialog for selecting and inserting functions
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoFunctionList = function () {
        let scf = SocialCalc.Formula;
        let scc = SocialCalc.Constants;
        let fcl = scc.function_classlist;
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let idp = `${spreadsheet.idPrefix}function`;

        // Check if dialog already exists
        let existingDialog = document.getElementById(`${idp}dialog`);
        if (existingDialog) return;

        scf.FillFunctionInfo();

        // Build function class selector and function list
        let str = [
            '<table><tr><td><span style="font-size:x-small;font-weight:bold">%loc!Category!</span><br>',
            `<select id="${idp}class" size="${fcl.length}" style="width:120px;" onchange="SocialCalc.SpreadsheetControl.FunctionClassChosen(this.options[this.selectedIndex].value);">`
        ].join('');

        for (let i = 0; i < fcl.length; i++) {
            let selected = i === 0 ? ' selected' : '';
            str += `<option value="${fcl[i]}"${selected}>${SocialCalc.special_chars(scf.FunctionClasses[fcl[i]].name)}</option>`;
        }

        str += [
            '</select></td><td>&nbsp;&nbsp;</td><td id="', idp, 'list">',
            '<span style="font-size:x-small;font-weight:bold">%loc!Functions!</span><br>',
            '<select id="', idp, 'name" size="', fcl.length, '" style="width:240px;" ',
            'onchange="SocialCalc.SpreadsheetControl.FunctionChosen(this.options[this.selectedIndex].value);" ',
            'ondblclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">'
        ].join('');

        str += SocialCalc.SpreadsheetControl.GetFunctionNamesStr("all");

        str += [
            '</td></tr><tr><td colspan="3">',
            `<div id="${idp}desc" style="width:380px;height:80px;overflow:auto;font-size:x-small;">`,
            SocialCalc.SpreadsheetControl.GetFunctionInfoStr(scf.FunctionClasses[fcl[0]].items[0]),
            '</div>',
            '<div style="width:380px;text-align:right;padding-top:6px;font-size:small;">',
            '<input type="button" value="%loc!Paste!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">&nbsp;',
            '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();">',
            '</div></td></tr></table>'
        ].join('');

        // Create main dialog element
        let main = document.createElement("div");
        main.id = `${idp}dialog`;
        main.style.position = "absolute";

        let vp = SocialCalc.GetViewportInfo();
        main.style.top = `${vp.height / 3}px`;
        main.style.left = `${vp.width / 3}px`;
        main.style.zIndex = "100";
        main.style.backgroundColor = "#FFF";
        main.style.border = "1px solid black";
        main.style.width = "400px";

        // Build dialog content with header
        let dialogContent = [
            '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>',
            '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">',
            '&nbsp;%loc!Function List!</td>',
            '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();">',
            '&nbsp;X&nbsp;</td></tr></table>',
            '<div style="background-color:#DDD;">', str, '</div>'
        ].join('');

        main.innerHTML = SocialCalc.LocalizeSubstrings(dialogContent);

        // Register drag functionality
        SocialCalc.DragRegister(
            main.firstChild.firstChild.firstChild.firstChild,
            true,
            true,
            {
                MouseDown: SocialCalc.DragFunctionStart,
                MouseMove: SocialCalc.DragFunctionPosition,
                MouseUp: SocialCalc.DragFunctionPosition,
                Disabled: null,
                positionobj: main,
            }
        );

        spreadsheet.spreadsheetDiv.appendChild(main);

        // Set focus to function name selector
        let functionNameElement = document.getElementById(`${idp}name`);
        functionNameElement.focus();
        SocialCalc.CmdGotFocus(functionNameElement);
    };

    /**
     * Get HTML string for function names in a given category
     * @param {string} cname - Category name ("all" for all functions)
     * @returns {string} HTML options string for function names
     */
    SocialCalc.SpreadsheetControl.GetFunctionNamesStr = function (cname) {
        let scf = SocialCalc.Formula;
        let functionClass = scf.FunctionClasses[cname];
        let str = "";

        for (let i = 0; i < functionClass.items.length; i++) {
            let selected = i === 0 ? ' selected' : '';
            str += `<option value="${functionClass.items[i]}"${selected}>${functionClass.items[i]}</option>`;
        }

        return str;
    };

    /**
     * Fill function names in a select element for a given category
     * @param {string} cname - Category name
     * @param {HTMLSelectElement} ele - Select element to populate
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.FillFunctionNames = function (cname, ele) {
        let scf = SocialCalc.Formula;
        let functionClass = scf.FunctionClasses[cname];

        ele.length = 0;
        for (let i = 0; i < functionClass.items.length; i++) {
            ele.options[i] = new Option(functionClass.items[i], functionClass.items[i]);
            if (i === 0) {
                ele.options[i].selected = true;
            }
        }
    };

    /**
     * Get formatted information string for a function
     * @param {string} fname - Function name
     * @returns {string} HTML formatted function information
     */
    SocialCalc.SpreadsheetControl.GetFunctionInfoStr = function (fname) {
        let scf = SocialCalc.Formula;
        let functionInfo = scf.FunctionList[fname];
        let scsc = SocialCalc.special_chars;

        let signature = `${fname}(${scsc(scf.FunctionArgString(fname))})`;
        let description = scsc(functionInfo[3]);

        return `<b>${signature}</b><br>${description}`;
    };

    /**
     * Handle function category selection
     * @param {string} cname - Selected category name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.FunctionClassChosen = function (cname) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let idp = `${spreadsheet.idPrefix}function`;
        let scf = SocialCalc.Formula;

        let nameElement = document.getElementById(`${idp}name`);
        SocialCalc.SpreadsheetControl.FillFunctionNames(cname, nameElement);
        SocialCalc.SpreadsheetControl.FunctionChosen(scf.FunctionClasses[cname].items[0]);
    };

    /**
     * Handle function selection and update description
     * @param {string} fname - Selected function name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.FunctionChosen = function (fname) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let idp = `${spreadsheet.idPrefix}function`;

        let descElement = document.getElementById(`${idp}desc`);
        descElement.innerHTML = SocialCalc.SpreadsheetControl.GetFunctionInfoStr(fname);
    };

    /**
     * Hide the function list dialog
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.HideFunctions = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let dialogElement = document.getElementById(`${spreadsheet.idPrefix}functiondialog`);

        if (!dialogElement) return;

        dialogElement.innerHTML = "";
        SocialCalc.DragUnregister(dialogElement);
        SocialCalc.KeyboardFocus();

        if (dialogElement.parentNode) {
            dialogElement.parentNode.removeChild(dialogElement);
        }
    };

    /**
     * Paste selected function into input
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoFunctionPaste = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let functionNameElement = document.getElementById(`${spreadsheet.idPrefix}functionname`);
        let multilineElement = document.getElementById(`${spreadsheet.idPrefix}multilinetextarea`);

        let text = `${functionNameElement.value}(`;

        SocialCalc.SpreadsheetControl.HideFunctions();

        if (multilineElement) {
            // Multi-line editing is in progress
            multilineElement.value += text;
            multilineElement.focus();
            SocialCalc.CmdGotFocus(multilineElement);
        } else {
            editor.EditorAddToInput(text, "=");
        }
    };

    /**
     * Show multi-line input dialog
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoMultiline = function () {
        let SCLocSS = SocialCalc.LocalizeSubstrings;
        let scc = SocialCalc.Constants;
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let wval = editor.workingvalues;
        let idp = `${spreadsheet.idPrefix}multiline`;

        // Check if dialog already exists
        let existingDialog = document.getElementById(`${idp}dialog`);
        if (existingDialog) return;

        let text;
        switch (editor.state) {
            case "start":
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                editor.RangeRemove();
                text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
                break;

            case "input":
            case "inputboxdirect":
                text = editor.inputBox.GetText();
                break;
        }

        editor.inputBox.element.disabled = true;
        text = SocialCalc.special_chars(text);

        let content = [
            `<textarea id="${idp}textarea" style="width:380px;height:120px;margin:10px 0px 0px 6px;">${text}</textarea>`,
            '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
            SCLocSS([
                '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoMultilinePaste();">&nbsp;',
                '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoMultilineClear();">&nbsp;',
                '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();">',
                '</div></div>'
            ].join('')),
        ].join('');

        // Create main dialog element
        let main = document.createElement("div");
        main.id = `${idp}dialog`;
        main.style.position = "absolute";

        let vp = SocialCalc.GetViewportInfo();
        main.style.top = `${vp.height / 3}px`;
        main.style.left = `${vp.width / 3}px`;
        main.style.zIndex = "100";
        main.style.backgroundColor = "#FFF";
        main.style.border = "1px solid black";
        main.style.width = "400px";

        // Build dialog with header
        main.innerHTML = [
            '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>',
            '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">',
            SCLocSS("&nbsp;%loc!Multi-line Input Box!"),
            '</td>',
            '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();">',
            '&nbsp;X&nbsp;</td></tr></table>',
            '<div style="background-color:#DDD;">', content, '</div>'
        ].join('');

        // Register drag functionality
        SocialCalc.DragRegister(
            main.firstChild.firstChild.firstChild.firstChild,
            true,
            true,
            {
                MouseDown: SocialCalc.DragFunctionStart,
                MouseMove: SocialCalc.DragFunctionPosition,
                MouseUp: SocialCalc.DragFunctionPosition,
                Disabled: null,
                positionobj: main,
            }
        );

        spreadsheet.spreadsheetDiv.appendChild(main);

        // Set focus to textarea
        let textareaElement = document.getElementById(`${idp}textarea`);
        textareaElement.focus();
        SocialCalc.CmdGotFocus(textareaElement);
    };

    /**
     * Hide the multi-line input dialog
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.HideMultiline = function () {
        let scc = SocialCalc.Constants;
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let dialogElement = document.getElementById(`${spreadsheet.idPrefix}multilinedialog`);

        if (!dialogElement) return;

        dialogElement.innerHTML = "";
        SocialCalc.DragUnregister(dialogElement);
        SocialCalc.KeyboardFocus();

        if (dialogElement.parentNode) {
            dialogElement.parentNode.removeChild(dialogElement);
        }

        // Restore input box state
        switch (editor.state) {
            case "start":
                editor.inputBox.DisplayCellContents(null);
                break;

            case "input":
            case "inputboxdirect":
                editor.inputBox.element.disabled = false;
                editor.inputBox.Focus();
                break;
        }
    };

    /**
     * Clear the multi-line textarea
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoMultilineClear = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let textareaElement = document.getElementById(`${spreadsheet.idPrefix}multilinetextarea`);

        textareaElement.value = "";
        textareaElement.focus();
    };

    /**
     * Set cell contents from multi-line input
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoMultilinePaste = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let wval = editor.workingvalues;
        let textareaElement = document.getElementById(`${spreadsheet.idPrefix}multilinetextarea`);

        let text = textareaElement.value;
        SocialCalc.SpreadsheetControl.HideMultiline();

        switch (editor.state) {
            case "start":
                wval.partialexpr = "";
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                break;

            case "input":
            case "inputboxdirect":
                editor.inputBox.Blur();
                editor.inputBox.ShowInputBox(false);
                editor.state = "start";
                break;
        }

        editor.EditorSaveEdit(text);
    };

    /**
     * Show link input dialog for creating hyperlinks
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoLink = function () {
        let SCLoc = SocialCalc.LocalizeString;
        let scc = SocialCalc.Constants;
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let wval = editor.workingvalues;
        let idp = `${spreadsheet.idPrefix}link`;

        // Check if dialog already exists
        let existingDialog = document.getElementById(`${idp}dialog`);
        if (existingDialog) return;

        let text;
        switch (editor.state) {
            case "start":
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                editor.RangeRemove();
                text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
                break;

            case "input":
            case "inputboxdirect":
                text = editor.inputBox.GetText();
                break;
        }

        editor.inputBox.element.disabled = true;

        if (text.charAt(0) === "'") {
            text = text.slice(1);
        }

        let parts = SocialCalc.ParseCellLinkText(text);
        text = SocialCalc.special_chars(text);

        // Check if cell should be set to link format
        let cell = spreadsheet.sheet.cells[editor.ecell.coord];
        let setformat = (!cell || !cell.textvalueformat) ? " checked" : "";
        let popup = parts.newwin ? " checked" : "";

        // Build form content
        let str = [
            '<div style="padding:6px 0px 4px 6px;">',
            '<span style="font-size:smaller;">', SCLoc("Description"), '</span><br>',
            `<input type="text" id="${idp}desc" style="width:380px;" value="${SocialCalc.special_chars(parts.desc)}"><br>`,
            '<span style="font-size:smaller;">', SCLoc("URL"), '</span><br>',
            `<input type="text" id="${idp}url" style="width:380px;" value="${SocialCalc.special_chars(parts.url)}"><br>`
        ].join('');

        if (SocialCalc.Callbacks.MakePageLink) {
            // Only show if handling pagenames here
            str += [
                '<span style="font-size:smaller;">', SCLoc("Page Name"), '</span><br>',
                `<input type="text" id="${idp}pagename" style="width:380px;" value="${SocialCalc.special_chars(parts.pagename)}"><br>`,
                '<span style="font-size:smaller;">', SCLoc("Workspace"), '</span><br>',
                `<input type="text" id="${idp}workspace" style="width:380px;" value="${SocialCalc.special_chars(parts.workspace)}"><br>`
            ].join('');
        }

        str += SocialCalc.LocalizeSubstrings([
            `<input type="checkbox" id="${idp}format"${setformat}>&nbsp;`,
            '<span style="font-size:smaller;">%loc!Set to Link format!</span><br>',
            `<input type="checkbox" id="${idp}popup"${popup}>&nbsp;`,
            '<span style="font-size:smaller;">%loc!Show in new browser window!</span>',
            '</div>',
            '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
            '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoLinkPaste();">&nbsp;',
            '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoLinkClear();">&nbsp;',
            '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideLink();">',
            '</div></div>'
        ].join(''));

        // Create main dialog element
        let main = document.createElement("div");
        main.id = `${idp}dialog`;
        main.style.position = "absolute";

        let vp = SocialCalc.GetViewportInfo();
        main.style.top = `${vp.height / 3}px`;
        main.style.left = `${vp.width / 3}px`;
        main.style.zIndex = "100";
        main.style.backgroundColor = "#FFF";
        main.style.border = "1px solid black";
        main.style.width = "400px";

        // Build dialog with header
        main.innerHTML = [
            '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>',
            '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">',
            `&nbsp;${SCLoc("Link Input Box")}`,
            '</td>',
            '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideLink();">',
            '&nbsp;X&nbsp;</td></tr></table>',
            '<div style="background-color:#DDD;">', str, '</div>'
        ].join('');

        // Register drag functionality
        SocialCalc.DragRegister(
            main.firstChild.firstChild.firstChild.firstChild,
            true,
            true,
            {
                MouseDown: SocialCalc.DragFunctionStart,
                MouseMove: SocialCalc.DragFunctionPosition,
                MouseUp: SocialCalc.DragFunctionPosition,
                Disabled: null,
                positionobj: main,
            }
        );

        spreadsheet.spreadsheetDiv.appendChild(main);

        // Set focus to URL input
        let urlElement = document.getElementById(`${idp}url`);
        urlElement.focus();
        SocialCalc.CmdGotFocus(urlElement);
    };

    /**
     * Hide the link input dialog
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.HideLink = function () {
        let scc = SocialCalc.Constants;
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let dialogElement = document.getElementById(`${spreadsheet.idPrefix}linkdialog`);

        if (!dialogElement) return;

        dialogElement.innerHTML = "";
        SocialCalc.DragUnregister(dialogElement);
        SocialCalc.KeyboardFocus();

        if (dialogElement.parentNode) {
            dialogElement.parentNode.removeChild(dialogElement);
        }

        // Restore input box state
        switch (editor.state) {
            case "start":
                editor.inputBox.DisplayCellContents(null);
                break;

            case "input":
            case "inputboxdirect":
                editor.inputBox.element.disabled = false;
                editor.inputBox.Focus();
                break;
        }
    };
    /**
     * Clear all link input fields
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoLinkClear = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = spreadsheet;

        // Clear all link input fields
        let fieldIds = ['linkdesc', 'linkpagename', 'linkworkspace'];
        fieldIds.forEach(fieldId => {
            let element = document.getElementById(`${idPrefix}${fieldId}`);
            if (element) element.value = "";
        });

        // Focus on URL field after clearing
        let urlElement = document.getElementById(`${idPrefix}linkurl`);
        urlElement.value = "";
        urlElement.focus();
    };

    /**
     * Create and set link from dialog inputs
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoLinkPaste = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let wval = editor.workingvalues;
        let { idPrefix } = spreadsheet;

        // Get all dialog elements
        let elements = {
            desc: document.getElementById(`${idPrefix}linkdesc`),
            url: document.getElementById(`${idPrefix}linkurl`),
            pagename: document.getElementById(`${idPrefix}linkpagename`),
            workspace: document.getElementById(`${idPrefix}linkworkspace`),
            format: document.getElementById(`${idPrefix}linkformat`),
            popup: document.getElementById(`${idPrefix}linkpopup`)
        };

        let text = "";

        // Determine symbols based on popup setting
        let symbols = elements.popup.checked
            ? { left: "<<", right: ">>", openBracket: "[[", closeBracket: "]]" }
            : { left: "<", right: ">", openBracket: "[", closeBracket: "]" };

        // Build link text based on inputs
        if (elements.pagename?.value) {
            if (elements.workspace.value) {
                text = `${elements.desc.value}{${elements.workspace.value}${symbols.openBracket}${elements.pagename.value}${symbols.closeBracket}}`;
            } else {
                text = `${elements.desc.value}${symbols.openBracket}${elements.pagename.value}${symbols.closeBracket}`;
            }
        } else {
            text = `${elements.desc.value}${symbols.left}${elements.url.value}${symbols.right}`;
        }

        SocialCalc.SpreadsheetControl.HideLink();

        // Handle editor state
        switch (editor.state) {
            case "start":
                wval.partialexpr = "";
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                break;

            case "input":
            case "inputboxdirect":
                editor.inputBox.Blur();
                editor.inputBox.ShowInputBox(false);
                editor.state = "start";
                break;
        }

        // Set link format if requested
        if (elements.format.checked) {
            SocialCalc.SpreadsheetControlExecuteCommand(null, "set %C textvalueformat text-link", "");
        }

        editor.EditorSaveEdit(text);
    };

    /**
     * Create auto-sum formula for selected range or column
     * @returns {void}
     */
    SocialCalc.SpreadsheetControl.DoSum = function () {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { editor } = spreadsheet;
        let sheet = editor.context.sheetobj;
        let cmd;

        if (editor.range.hasrange) {
            // Sum selected range and place result below
            let topLeft = SocialCalc.crToCoord(editor.range.left, editor.range.top);
            let bottomRight = SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
            let sumRange = `${topLeft}:${bottomRight}`;
            let resultCell = SocialCalc.crToCoord(editor.range.right, editor.range.bottom + 1);
            cmd = `set ${resultCell} formula sum(${sumRange})`;
        } else {
            // Auto-detect range in current column
            let row = editor.ecell.row - 1;
            let col = editor.ecell.col;

            if (row <= 1) {
                cmd = `set ${editor.ecell.coord} constant e#REF! 0 #REF!`;
            } else {
                let foundvalue = false;

                while (row > 0) {
                    let coord = SocialCalc.crToCoord(col, row);
                    let cell = sheet.GetAssuredCell(coord);

                    if (!cell.datatype || cell.datatype === "t") {
                        if (foundvalue) {
                            row++;
                            break;
                        }
                    } else {
                        foundvalue = true;
                    }
                    row--;
                }

                let startCell = SocialCalc.crToCoord(col, row);
                let endCell = SocialCalc.crToCoord(col, editor.ecell.row - 1);
                cmd = `set ${editor.ecell.coord} formula sum(${startCell}:${endCell})`;
            }
        }

        editor.EditorScheduleSheetCommands(cmd, true, false);
    };

    // *************************************
    //
    // TAB Routines:
    //
    // *************************************

    // Sort Tab Functions

    /**
     * Handle sort tab click - initialize sort interface
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlSortOnclick = function (s, t) {
        SocialCalc.LoadColumnChoosers(s);
        s.editor.RangeChangeCallback.sort = SocialCalc.UpdateSortRangeProposal;

        // Populate named ranges dropdown
        let namelist = Object.keys(s.sheet.names).sort();
        let nl = document.getElementById(`${s.idPrefix}sortlist`);

        nl.length = 0;
        nl.options[0] = new Option(SocialCalc.LocalizeString("[select range]"));

        namelist.forEach((name, index) => {
            nl.options[index + 1] = new Option(name, name);
            if (name === s.sortrange) {
                nl.options[index + 1].selected = true;
            }
        });

        if (!s.sortrange) {
            nl.options[0].selected = true;
        }

        SocialCalc.UpdateSortRangeProposal(s.editor);
        SocialCalc.KeyboardFocus();
    };

    /**
     * Save sort settings to string format
     * @param {SocialCalc.TableEditor} editor - Table editor instance
     * @param {string} setting - Setting name
     * @returns {string} Encoded sort settings
     */
    SocialCalc.SpreadsheetControlSortSave = function (editor, setting) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = spreadsheet;

        let getElementValues = (type) => {
            let selectElement = document.getElementById(`${idPrefix}${type}sort`);
            let radioElement = document.getElementById(`${idPrefix}${type}sortup`);
            return {
                index: selectElement.selectedIndex,
                direction: radioElement.checked ? "up" : "down"
            };
        };

        let major = getElementValues("major");
        let minor = getElementValues("minor");
        let last = getElementValues("last");

        let result = `sort:${SocialCalc.encodeForSave(spreadsheet.sortrange)}:${major.index}:${major.direction}`;

        if (minor.index > 0) {
            result += `:${minor.index}:${minor.direction}`;
        } else {
            result += "::";
        }

        if (last.index > 0) {
            result += `:${last.index}:${last.direction}`;
        } else {
            result += "::";
        }

        return `${result}\n`;
    };

    /**
     * Load sort settings from string format
     * @param {SocialCalc.TableEditor} editor - Table editor instance
     * @param {string} setting - Setting name
     * @param {string} line - Settings line to parse
     * @param {object} flags - Load flags
     * @returns {boolean} True if loaded successfully
     */
    SocialCalc.SpreadsheetControlSortLoad = function (editor, setting, line, flags) {
        let spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = spreadsheet;
        let parts = line.split(":");

        spreadsheet.sortrange = SocialCalc.decodeFromSave(parts[1]);

        let sortButton = document.getElementById(`${idPrefix}sortbutton`);
        if (spreadsheet.sortrange) {
            sortButton.value = `${SocialCalc.LocalizeString("Sort ")}${spreadsheet.sortrange}`;
            sortButton.style.visibility = "visible";
        } else {
            sortButton.style.visibility = "hidden";
        }

        SocialCalc.LoadColumnChoosers(spreadsheet);

        // Set major sort
        document.getElementById(`${idPrefix}majorsort`).selectedIndex = parseInt(parts[2], 10);
        document.getElementById(`${idPrefix}majorsort${parts[3]}`).checked = true;

        // Set minor sort
        let minorSelect = document.getElementById(`${idPrefix}minorsort`);
        if (parts[4]) {
            minorSelect.selectedIndex = parseInt(parts[4], 10);
            document.getElementById(`${idPrefix}minorsort${parts[5]}`).checked = true;
        } else {
            minorSelect.selectedIndex = 0;
            document.getElementById(`${idPrefix}minorsortup`).checked = true;
        }

        // Set last sort
        let lastSelect = document.getElementById(`${idPrefix}lastsort`);
        if (parts[6]) {
            lastSelect.selectedIndex = parseInt(parts[6], 10);
            document.getElementById(`${idPrefix}lastsort${parts[7]}`).checked = true;
        } else {
            lastSelect.selectedIndex = 0;
            document.getElementById(`${idPrefix}lastsortup`).checked = true;
        }

        return true;
    };

    // Comment Tab Functions

    /**
     * Handle comment tab click
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlCommentOnclick = function (s, t) {
        s.editor.MoveECellCallback.comment = SocialCalc.SpreadsheetControlCommentMoveECell;
        SocialCalc.SpreadsheetControlCommentDisplay(s, t);
        SocialCalc.KeyboardFocus();
    };

    /**
     * Display comment for current cell
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlCommentDisplay = function (s, t) {
        let comment = "";
        let { ecell } = s.editor;

        if (ecell?.coord && s.sheet.cells[ecell.coord]) {
            comment = s.sheet.cells[ecell.coord].comment || "";
        }

        document.getElementById(`${s.idPrefix}commenttext`).value = comment;
    };

    /**
     * Handle cell movement in comment tab
     * @param {SocialCalc.TableEditor} editor - Table editor instance
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlCommentMoveECell = function (editor) {
        SocialCalc.SpreadsheetControlCommentDisplay(SocialCalc.GetSpreadsheetControlObject(), "comment");
    };

    /**
     * Set comment for current cell
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlCommentSet = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let commentText = document.getElementById(`${s.idPrefix}commenttext`).value;

        s.ExecuteCommand(`set %C comment ${SocialCalc.encodeForSave(commentText)}`);

        let cellElement = SocialCalc.GetEditorCellElement(s.editor, s.editor.ecell.row, s.editor.ecell.col);
        s.editor.UpdateCellCSS(cellElement, s.editor.ecell.row, s.editor.ecell.col);
        SocialCalc.KeyboardFocus();
    };

    /**
     * Handle comment tab unclick
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlCommentOnunclick = function (s, t) {
        delete s.editor.MoveECellCallback.comment;
    };

    // Names Tab Functions

    /**
     * Handle names tab click
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesOnclick = function (s, t) {
        let { idPrefix } = s;

        // Clear input fields
        ['namesname', 'namesdesc', 'namesvalue'].forEach(fieldId => {
            document.getElementById(`${idPrefix}${fieldId}`).value = "";
        });

        // Set up callbacks
        s.editor.RangeChangeCallback.names = SocialCalc.SpreadsheetControlNamesRangeChange;
        s.editor.MoveECellCallback.names = SocialCalc.SpreadsheetControlNamesRangeChange;

        SocialCalc.SpreadsheetControlNamesRangeChange(s.editor);
        SocialCalc.SpreadsheetControlNamesFillNameList();
        SocialCalc.SpreadsheetControlNamesChangedName();
    };

    /**
     * Fill the names list dropdown
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesFillNameList = function () {
        let SCLoc = SocialCalc.LocalizeString;
        let s = SocialCalc.GetSpreadsheetControlObject();
        let nl = document.getElementById(`${s.idPrefix}nameslist`);
        let currentname = document.getElementById(`${s.idPrefix}namesname`)
            .value.toUpperCase().replace(/[^A-Z0-9_\.]/g, "");

        let namelist = Object.keys(s.sheet.names).sort();

        nl.length = 0;
        nl.options[0] = new Option(namelist.length > 0 ? SCLoc("[New]") : SCLoc("[None]"));

        namelist.forEach((name, index) => {
            nl.options[index + 1] = new Option(name, name);
            if (name === currentname) {
                nl.options[index + 1].selected = true;
            }
        });

        if (!currentname) {
            nl.options[0].selected = true;
        }
    };

    /**
     * Handle name selection change
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesChangedName = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = s;
        let nl = document.getElementById(`${idPrefix}nameslist`);
        let selectedName = nl.options[nl.selectedIndex].value;
        let nameData = s.sheet.names[selectedName];

        if (nameData) {
            document.getElementById(`${idPrefix}namesname`).value = selectedName;
            document.getElementById(`${idPrefix}namesdesc`).value = nameData.desc || "";
            document.getElementById(`${idPrefix}namesvalue`).value = nameData.definition || "";
        } else {
            ['namesname', 'namesdesc', 'namesvalue'].forEach(fieldId => {
                document.getElementById(`${idPrefix}${fieldId}`).value = "";
            });
        }
    };

    /**
     * Handle range change for names tab
     * @param {SocialCalc.TableEditor} editor - Table editor instance
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesRangeChange = function (editor) {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let proposalElement = document.getElementById(`${s.idPrefix}namesrangeproposal`);

        if (editor.range.hasrange) {
            let topLeft = SocialCalc.crToCoord(editor.range.left, editor.range.top);
            let bottomRight = SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
            proposalElement.value = `${topLeft}:${bottomRight}`;
        } else {
            proposalElement.value = editor.ecell.coord;
        }
    };

    /**
     * Handle names tab unclick
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesOnunclick = function (s, t) {
        delete s.editor.RangeChangeCallback.names;
        delete s.editor.MoveECellCallback.names;
    };

    /**
     * Set name value from range proposal
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesSetValue = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = s;
        let proposalValue = document.getElementById(`${idPrefix}namesrangeproposal`).value;

        document.getElementById(`${idPrefix}namesvalue`).value = proposalValue;
        SocialCalc.KeyboardFocus();
    };

    /**
     * Save name definition
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesSave = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = s;
        let name = document.getElementById(`${idPrefix}namesname`).value;

        SocialCalc.SetTab(s.tabs[0].name); // Return to first tab
        SocialCalc.KeyboardFocus();

        if (name) {
            let nameValue = document.getElementById(`${idPrefix}namesvalue`).value;
            let nameDesc = document.getElementById(`${idPrefix}namesdesc`).value;
            let commands = [
                `name define ${name} ${nameValue}`,
                `name desc ${name} ${nameDesc}`
            ].join('\n');

            s.ExecuteCommand(commands);
        }
    };

    /**
     * Delete name definition
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlNamesDelete = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let name = document.getElementById(`${s.idPrefix}namesname`).value;

        SocialCalc.SetTab(s.tabs[0].name); // Return to first tab
        SocialCalc.KeyboardFocus();

        if (name) {
            s.ExecuteCommand(`name delete ${name}`);
        }
    };

    // Clipboard Tab Functions

    /**
     * Handle clipboard tab click
     * @param {SocialCalc.SpreadsheetControl} s - Spreadsheet control instance
     * @param {string} t - Tab name
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlClipboardOnclick = function (s, t) {
        let { idPrefix } = s;
        let clipElement = document.getElementById(`${idPrefix}clipboardtext`);

        document.getElementById(`${idPrefix}clipboardformat-tab`).checked = true;
        clipElement.value = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.Clipboard.clipboard, "tab");
    };

    /**
     * Change clipboard display format
     * @param {string} format - Format type ('tab', 'csv', 'scsave')
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlClipboardFormat = function (format) {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let clipElement = document.getElementById(`${s.idPrefix}clipboardtext`);

        clipElement.value = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.Clipboard.clipboard, format);
    };

    /**
     * Load clipboard content into spreadsheet
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlClipboardLoad = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = s;
        let saveType = "tab";

        if (document.getElementById(`${idPrefix}clipboardformat-csv`).checked) {
            saveType = "csv";
        } else if (document.getElementById(`${idPrefix}clipboardformat-scsave`).checked) {
            saveType = "scsave";
        }

        let clipboardText = document.getElementById(`${idPrefix}clipboardtext`).value;
        let convertedData = SocialCalc.ConvertOtherFormatToSave(clipboardText, saveType);

        SocialCalc.SetTab(s.tabs[0].name); // Return to first tab
        SocialCalc.KeyboardFocus();

        s.editor.EditorScheduleSheetCommands(`loadclipboard ${SocialCalc.encodeForSave(convertedData)}`, true, false);
    };

    /**
     * Clear clipboard content
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlClipboardClear = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let clipElement = document.getElementById(`${s.idPrefix}clipboardtext`);

        clipElement.value = "";
        s.editor.EditorScheduleSheetCommands("clearclipboard", true, false);
        clipElement.focus();
    };

    /**
     * Export clipboard content via callback
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlClipboardExport = function () {
        let s = SocialCalc.GetSpreadsheetControlObject();

        if (s.ExportCallback) {
            s.ExportCallback(s);
        }

        SocialCalc.SetTab(s.tabs[0].name); // Return to first tab
        SocialCalc.KeyboardFocus();
    };

    // Settings Tab Functions

    /**
     * Switch between sheet and cell settings panels
     * @param {string} target - Target panel ('sheet' or 'cell')
     * @returns {void}
     */
    SocialCalc.SpreadsheetControlSettingsSwitch = function (target) {
        SocialCalc.SettingControlReset();
        let s = SocialCalc.GetSpreadsheetControlObject();
        let { idPrefix } = s;

        let elements = {
            sheetTable: document.getElementById(`${idPrefix}sheetsettingstable`),
            cellTable: document.getElementById(`${idPrefix}cellsettingstable`),
            sheetToolbar: document.getElementById(`${idPrefix}sheetsettingstoolbar`),
            cellToolbar: document.getElementById(`${idPrefix}cellsettingstoolbar`)
        };

        if (target === "sheet") {
            elements.sheetTable.style.display = "block";
            elements.cellTable.style.display = "none";
            elements.sheetToolbar.style.display = "block";
            elements.cellToolbar.style.display = "none";
            SocialCalc.SettingsControlSetCurrentPanel(s.views.settings.values.sheetspanel);
        } else {
            elements.sheetTable.style.display = "none";
            elements.cellTable.style.display = "block";
            elements.sheetToolbar.style.display = "none";
            elements.cellToolbar.style.display = "block";
            SocialCalc.SettingsControlSetCurrentPanel(s.views.settings.values.cellspanel);
        }
    };

    /**
     * Save settings changes
     * @param {string} target - Target type ('sheet', 'cell', or 'cancel')
     * @returns {void}
     */
    SocialCalc.SettingsControlSave = function (target) {
        let s = SocialCalc.GetSpreadsheetControlObject();
        let sc = SocialCalc.SettingsControls;
        let panelobj = sc.CurrentPanel;
        let attribs = SocialCalc.SettingsControlUnloadPanel(panelobj);

        SocialCalc.SetTab(s.tabs[0].name); // Return to first tab
        SocialCalc.KeyboardFocus();

        let cmdstr = "";

        if (target === "sheet") {
            cmdstr = s.sheet.DecodeSheetAttributes(attribs);
        } else if (target === "cell") {
            let range;
            if (s.editor.range.hasrange) {
                let topLeft = SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top);
                let bottomRight = SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
                range = `${topLeft}:${bottomRight}`;
            }
            cmdstr = s.sheet.DecodeCellAttributes(s.editor.ecell.coord, attribs, range);
        }
        // If target === 'cancel', do nothing

        if (cmdstr) {
            s.editor.EditorScheduleSheetCommands(cmdstr, true, false);
        }
    };
    // *************************************
    //
    // SAVE / LOAD ROUTINES
    //
    // *************************************

    /**
     * Create spreadsheet save data in multipart MIME format
     * Saves the spreadsheet's sheet data, editor settings, and audit trail (redo stack).
     * The serialized data strings are concatenated together in multi-part MIME format.
     * The first part lists the types of the subsequent parts (e.g., "sheet", "editor", and "audit")
     * 
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {object|null} otherparts - Additional parts to include in save format
     * @param {string} otherparts.partname - Part contents (should end with \n)
     * @returns {string} Complete multipart MIME save string
     */
    SocialCalc.SpreadsheetControlCreateSpreadsheetSave = function (spreadsheet, otherparts) {
        let otherpartsstr = "";
        let otherpartsnames = "";

        if (otherparts) {
            for (let partname in otherparts) {
                let partContent = otherparts[partname];
                let extranl = partContent.charAt(partContent.length - 1) !== "\n" ? "\n" : "";

                otherpartsstr += [
                    `--${spreadsheet.multipartBoundary}`,
                    "Content-type: text/plain; charset=UTF-8",
                    "",
                    partContent + extranl
                ].join('\n');

                otherpartsnames += `part:${partname}\n`;
            }
        }

        let result = [
            "socialcalc:version:1.0",
            "MIME-Version: 1.0",
            `Content-Type: multipart/mixed; boundary=${spreadsheet.multipartBoundary}`,
            `--${spreadsheet.multipartBoundary}`,
            "Content-type: text/plain; charset=UTF-8",
            "",
            "# SocialCalc Spreadsheet Control Save",
            "version:1.0",
            "part:sheet",
            "part:edit",
            "part:audit",
            otherpartsnames.replace(/\n$/, ""), // Remove trailing newline
            `--${spreadsheet.multipartBoundary}`,
            "Content-type: text/plain; charset=UTF-8",
            "",
            spreadsheet.CreateSheetSave(),
            `--${spreadsheet.multipartBoundary}`,
            "Content-type: text/plain; charset=UTF-8",
            "",
            spreadsheet.editor.SaveEditorSettings(),
            `--${spreadsheet.multipartBoundary}`,
            "Content-type: text/plain; charset=UTF-8",
            "",
            spreadsheet.sheet.CreateAuditString(),
            otherpartsstr,
            `--${spreadsheet.multipartBoundary}--`
        ].join('\n');

        return result;
    };

    /**
     * @typedef {object} SavePart
     * @property {number} start - Start position in string
     * @property {number} end - End position in string
     */

    /**
     * Decode spreadsheet save string into component parts
     * Separates the parts from a spreadsheet save string, returning an object with the sub-strings.
     * 
     * @param {SocialCalc.SpreadsheetControl} spreadsheet - The spreadsheet control instance
     * @param {string} str - Multipart MIME save string to decode
     * @returns {object.<string, SavePart>} Object mapping part types to their positions
     */
    SocialCalc.SpreadsheetControlDecodeSpreadsheetSave = function (spreadsheet, str) {
        let parts = {};
        let partlist = [];

        // Find MIME version header
        let pos1 = str.search(/^MIME-Version:\s1\.0/im);
        if (pos1 < 0) return parts;

        // Find multipart boundary
        let mpregex = /^Content-Type:\s*multipart\/mixed;\s*boundary=(\S+)/gim;
        mpregex.lastIndex = pos1;

        let searchinfo = mpregex.exec(str);
        if (!searchinfo || mpregex.lastIndex <= 0) return parts;

        let boundary = searchinfo[1];
        let boundaryregex = new RegExp(`^--${boundary}(?:\r\n|\n)`, "mg");
        boundaryregex.lastIndex = mpregex.lastIndex;

        // Find header section
        let boundaryMatch = boundaryregex.exec(str);
        if (!boundaryMatch) return parts;

        let blanklineregex = /(?:\r\n|\n)(?:\r\n|\n)/gm;
        blanklineregex.lastIndex = boundaryregex.lastIndex;

        let blanklineMatch = blanklineregex.exec(str);
        if (!blanklineMatch) return parts;

        let start = blanklineregex.lastIndex;
        boundaryregex.lastIndex = start;

        boundaryMatch = boundaryregex.exec(str);
        if (!boundaryMatch) return parts;

        let ending = boundaryMatch.index;

        // Parse header to get part list
        let lines = str.substring(start, ending).split(/\r\n|\n/);
        for (let line of lines) {
            let parts_header = line.split(":");
            switch (parts_header[0]) {
                case "version":
                    break;
                case "part":
                    partlist.push(parts_header[1]);
                    break;
            }
        }

        // Extract each part
        for (let pnum = 0; pnum < partlist.length; pnum++) {
            blanklineregex.lastIndex = ending;
            blanklineMatch = blanklineregex.exec(str);
            if (!blanklineMatch) return parts;

            start = blanklineregex.lastIndex;

            // Last part has different boundary format
            if (pnum === partlist.length - 1) {
                boundaryregex = new RegExp(`^--${boundary}--$`, "mg");
            }

            boundaryregex.lastIndex = start;
            boundaryMatch = boundaryregex.exec(str);
            if (!boundaryMatch) return parts;

            ending = boundaryMatch.index;
            parts[partlist[pnum]] = { start, end: ending };
        }

        return parts;
    };

    // *************************************
    //
    // Settings Controls System
    //
    // *************************************

    /**
     * @typedef {object} SettingsControl
     * @property {Function} SetValue - Set control value function
     * @property {boolean} [ColorValues] - Whether to convert between hex and RGB
     * @property {Function} GetValue - Get control value function  
     * @property {Function} [Initialize] - Initialize control function
     * @property {*} [InitialData] - Control-dependent initial data
     * @property {Function} [OnReset] - Reset callback function
     * @property {Function} [ChangedCallback] - Change callback function
     */

    /**
     * Settings Controls management system
     * Each settings panel has an object with control definitions that correspond to control types
     * with SetValue, GetValue, Initialize and other functions for managing UI controls
     * 
     * @namespace
     * @property {object.<string, SettingsControl>} Controls - Available control types
     * @property {object|null} CurrentPanel - Currently active panel object
     */
    SocialCalc.SettingsControls = {
        /** @type {object.<string, SettingsControl>} */
        Controls: {},
        /** @type {object|null} */
        CurrentPanel: null,
    };

    /**
     * Set the current settings panel and trigger popup change callback
     * @param {object} panelobj - Panel object to set as current
     * @returns {void}
     */
    SocialCalc.SettingsControlSetCurrentPanel = function (panelobj) {
        SocialCalc.SettingsControls.CurrentPanel = panelobj;
        SocialCalc.SettingsControls.PopupChangeCallback({ panelobj }, "", null);
    };

    /**
     * Initialize all controls in a settings panel
     * @param {object} panelobj - Panel object containing control definitions
     * @returns {void}
     */
    SocialCalc.SettingsControlInitializePanel = function (panelobj) {
        let sc = SocialCalc.SettingsControls;

        for (let ctrlname in panelobj) {
            if (ctrlname === "name") continue;

            let ctrl = sc.Controls[panelobj[ctrlname].type];
            if (ctrl?.Initialize) {
                ctrl.Initialize(panelobj, ctrlname);
            }
        }
    };

    /**
     * Load attribute values into settings panel controls
     * @param {object} panelobj - Panel object containing control definitions
     * @param {object} attribs - Attribute values to load into controls
     * @returns {void}
     */
    SocialCalc.SettingsControlLoadPanel = function (panelobj, attribs) {
        let sc = SocialCalc.SettingsControls;

        for (let ctrlname in panelobj) {
            if (ctrlname === "name") continue;

            let ctrl = sc.Controls[panelobj[ctrlname].type];
            let setting = panelobj[ctrlname].setting;

            if (ctrl?.SetValue && attribs[setting] !== undefined) {
                ctrl.SetValue(panelobj, ctrlname, attribs[setting]);
            }
        }
    };

    /**
     * Extract attribute values from settings panel controls
     * @param {object} panelobj - Panel object containing control definitions
     * @returns {object} Object containing extracted attribute values
     */
    SocialCalc.SettingsControlUnloadPanel = function (panelobj) {
        let sc = SocialCalc.SettingsControls;
        let attribs = {};

        for (let ctrlname in panelobj) {
            if (ctrlname === "name") continue;

            let ctrl = sc.Controls[panelobj[ctrlname].type];
            let setting = panelobj[ctrlname].setting;

            if (ctrl?.GetValue) {
                attribs[setting] = ctrl.GetValue(panelobj, ctrlname);
            }
        }

        return attribs;
    };

    /**
     * Handle popup control changes and update sample display
     * Updates the visual sample based on current control values
     * 
     * @param {object} attribs - Attributes object containing panelobj
     * @param {object} attribs.panelobj - Panel object with control definitions
     * @param {string} id - Control ID that changed
     * @param {*} value - New value
     * @returns {void}
     */
    SocialCalc.SettingsControls.PopupChangeCallback = function (attribs, id, value) {
        let sc = SocialCalc.Constants;
        let sampleElement = document.getElementById("sample-text");

        if (!sampleElement || !attribs?.panelobj) return;

        let { idPrefix } = SocialCalc.CurrentSpreadsheetControlObject;
        let cellPrefix = attribs.panelobj.name === "cell" ? "c" : "";

        // Parse default cell layout for padding and alignment
        let layoutParts = sc.defaultCellLayout.match(
            /^padding.(\S+) (\S+) (\S+) (\S+).vertical.align.(\S+);$/
        ) || [];

        // Define CSS value mappings
        let cssValues = {
            color: ["textcolor"],
            backgroundColor: ["bgcolor", "#FFF"],
            fontSize: ["fontsize", sc.defaultCellFontSize],
            fontFamily: ["fontfamily"],
            paddingTop: ["padtop", layoutParts[1]],
            paddingRight: ["padright", layoutParts[2]],
            paddingBottom: ["padbottom", layoutParts[3]],
            paddingLeft: ["padleft", layoutParts[4]],
            verticalAlign: ["alignvert", layoutParts[5]],
        };

        // Apply CSS values from popup controls
        for (let [cssProperty, [controlName, defaultValue]] of Object.entries(cssValues)) {
            let controlValue = SocialCalc.Popup.GetValue(`${idPrefix}${cellPrefix}${controlName}`) || defaultValue || "";
            sampleElement.style[cssProperty] = controlValue;
        }

        // Handle cell-specific styling
        if (cellPrefix === "c") {
            // Apply borders
            let borderMappings = {
                borderTop: "cbt",
                borderRight: "cbr",
                borderBottom: "cbb",
                borderLeft: "cbl",
            };

            for (let [cssProperty, controlName] of Object.entries(borderMappings)) {
                let borderValue = SocialCalc.SettingsControls.BorderSideGetValue(attribs.panelobj, controlName);
                sampleElement.style[cssProperty] = borderValue?.val || "";
            }

            // Set horizontal alignment for cell
            let cellAlign = SocialCalc.Popup.GetValue(`${idPrefix}calignhoriz`) || "left";
            sampleElement.style.textAlign = cellAlign;
            sampleElement.childNodes[1].style.textAlign = cellAlign;
        } else {
            // Sheet-level styling
            sampleElement.style.border = "";

            let textAlign = SocialCalc.Popup.GetValue(`${idPrefix}textalignhoriz`) || "left";
            sampleElement.style.textAlign = textAlign;

            let numberAlign = SocialCalc.Popup.GetValue(`${idPrefix}numberalignhoriz`) || "right";
            sampleElement.childNodes[1].style.textAlign = numberAlign;
        }

        // Apply font styling
        let fontLook = SocialCalc.Popup.GetValue(`${idPrefix}${cellPrefix}fontlook`);
        let fontParts = fontLook?.match(/^(\S+) (\S+)$/) || [];
        sampleElement.style.fontStyle = fontParts[1] || "";
        sampleElement.style.fontWeight = fontParts[2] || "";

        // Format sample numbers
        let numberFormat = SocialCalc.Popup.GetValue(`${idPrefix}${cellPrefix}formatnumber`) || "General";
        let formattedNumbers = SocialCalc.FormatNumber.formatNumberWithFormat(9.8765, numberFormat, "");
        let negativeFormatted = SocialCalc.FormatNumber.formatNumberWithFormat(-1234.5, numberFormat, "");

        if (negativeFormatted !== "??-???-??&nbsp;??:??:??") {
            formattedNumbers += `<br>${negativeFormatted}`;
        }

        sampleElement.childNodes[1].innerHTML = formattedNumbers;
    };

    // *************************************
    //
    // PopupList Control Implementation
    //
    // *************************************

    /**
     * Set value for a PopupList control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @param {object} value - Value object with def (default) and val properties
     * @param {boolean} value.def - Whether to use default value
     * @param {*} value.val - The actual value
     * @returns {void}
     */
    SocialCalc.SettingsControls.PopupListSetValue = function (panelobj, ctrlname, value) {
        if (!value) {
            alert(`${ctrlname} no value`);
            return;
        }

        let controlValue = value.def ? "" : value.val;
        SocialCalc.Popup.SetValue(panelobj[ctrlname].id, controlValue);
    };

    /**
     * Get value from a PopupList control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {object|null} Value object with def and val properties, or null if control not found
     */
    SocialCalc.SettingsControls.PopupListGetValue = function (panelobj, ctrlname) {
        let ctl = panelobj[ctrlname];
        if (!ctl) return null;

        let value = SocialCalc.Popup.GetValue(ctl.id);
        return value ? { def: false, val: value } : { def: true, val: 0 };
    };

    /**
     * Initialize a PopupList control with options
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {void}
     */
    SocialCalc.SettingsControls.PopupListInitialize = function (panelobj, ctrlname) {
        let sc = SocialCalc.SettingsControls;
        let controlDef = panelobj[ctrlname];
        let controlType = sc.Controls[controlDef.type];

        let initialdata = controlDef.initialdata || controlType.InitialData || "";
        initialdata = SocialCalc.LocalizeSubstrings(initialdata);

        let optionvals = initialdata.split(/\|/);
        let options = [];

        for (let i = 0; i < optionvals.length; i++) {
            let val = optionvals[i];
            let colonPos = val.indexOf(":");

            if (colonPos === -1) continue;

            let optionText = val.substring(0, colonPos);
            let optionValue = val.substring(colonPos + 1);

            // Handle escaped characters
            if (optionText.indexOf("\\") !== -1) {
                optionText = optionText.replace(/\\c/g, ":").replace(/\\b/g, "\\");
            }

            optionText = SocialCalc.special_chars(optionText);

            // Handle special option types
            if (optionText === "[custom]") {
                options[i] = {
                    o: SocialCalc.Constants.s_PopupListCustom,
                    v: optionValue,
                    a: { custom: true },
                };
            } else if (optionText === "[cancel]") {
                options[i] = {
                    o: SocialCalc.Constants.s_PopupListCancel,
                    v: "",
                    a: { cancel: true },
                };
            } else if (optionText === "[break]") {
                options[i] = { o: "-----", v: "", a: { skip: true } };
            } else if (optionText === "[newcol]") {
                options[i] = { o: "", v: "", a: { newcol: true } };
            } else {
                options[i] = { o: optionText, v: optionValue };
            }
        }

        // Create and initialize popup
        SocialCalc.Popup.Create("List", controlDef.id, {});
        SocialCalc.Popup.Initialize(controlDef.id, {
            options,
            attribs: {
                changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
                panelobj,
            },
        });
    };
    // *************************************
    //
    // Additional Settings Controls
    //
    // *************************************

    /**
     * Reset PopupList control
     * @param {string} ctrlname - Control name
     * @returns {void}
     */
    SocialCalc.SettingsControls.PopupListReset = function (ctrlname) {
        SocialCalc.Popup.Reset("List");
    };

    /**
     * PopupList control definition
     * @type {SettingsControl}
     */
    SocialCalc.SettingsControls.Controls.PopupList = {
        SetValue: SocialCalc.SettingsControls.PopupListSetValue,
        GetValue: SocialCalc.SettingsControls.PopupListGetValue,
        Initialize: SocialCalc.SettingsControls.PopupListInitialize,
        OnReset: SocialCalc.SettingsControls.PopupListReset,
        ChangedCallback: null,
    };

    // *************************************
    //
    // ColorChooser Control Implementation
    //
    // *************************************

    /**
     * Set value for a ColorChooser control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @param {object} value - Value object with def and val properties
     * @returns {void}
     */
    SocialCalc.SettingsControls.ColorChooserSetValue = function (panelobj, ctrlname, value) {
        if (!value) {
            alert(`${ctrlname} no value`);
            return;
        }

        let controlValue = value.def ? "" : value.val;
        SocialCalc.Popup.SetValue(panelobj[ctrlname].id, controlValue);
    };

    /**
     * Get value from a ColorChooser control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {object|null} Value object with def and val properties
     */
    SocialCalc.SettingsControls.ColorChooserGetValue = function (panelobj, ctrlname) {
        let value = SocialCalc.Popup.GetValue(panelobj[ctrlname].id);
        return value ? { def: false, val: value } : { def: true, val: 0 };
    };

    /**
     * Initialize a ColorChooser control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {void}
     */
    SocialCalc.SettingsControls.ColorChooserInitialize = function (panelobj, ctrlname) {
        SocialCalc.Popup.Create("ColorChooser", panelobj[ctrlname].id, {});
        SocialCalc.Popup.Initialize(panelobj[ctrlname].id, {
            attribs: {
                title: "&nbsp;",
                moveable: true,
                width: "106px",
                changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
                panelobj,
            },
        });
    };

    /**
     * Reset ColorChooser control
     * @param {string} ctrlname - Control name
     * @returns {void}
     */
    SocialCalc.SettingsControls.ColorChooserReset = function (ctrlname) {
        SocialCalc.Popup.Reset("ColorChooser");
    };

    /**
     * ColorChooser control definition
     * @type {SettingsControl}
     */
    SocialCalc.SettingsControls.Controls.ColorChooser = {
        SetValue: SocialCalc.SettingsControls.ColorChooserSetValue,
        GetValue: SocialCalc.SettingsControls.ColorChooserGetValue,
        Initialize: SocialCalc.SettingsControls.ColorChooserInitialize,
        OnReset: SocialCalc.SettingsControls.ColorChooserReset,
        ChangedCallback: null,
    };

    // *************************************
    //
    // BorderSide Control Implementation
    //
    // *************************************

    /**
     * Set value for a BorderSide control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @param {object} value - Value object with border specification
     * @returns {void}
     */
    SocialCalc.SettingsControls.BorderSideSetValue = function (panelobj, ctrlname, value) {
        let idstart = panelobj[ctrlname].id;

        if (!value) {
            alert(`${ctrlname} no value`);
            return;
        }

        let checkboxElement = document.getElementById(`${idstart}-onoff-bcb`);
        if (!checkboxElement) return;

        let colorControlId = `${idstart}-color`;

        if (value.val) {
            // Border is enabled
            checkboxElement.checked = true;
            checkboxElement.value = value.val;

            let borderParts = value.val.match(/(\S+)\s+(\S+)\s+(\S.+)/);
            let borderColor = borderParts ? borderParts[3] : "rgb(0,0,0)";

            SocialCalc.Popup.SetValue(colorControlId, borderColor);
            SocialCalc.Popup.SetDisabled(colorControlId, false);
        } else {
            // Border is disabled
            checkboxElement.checked = false;
            checkboxElement.value = value.val;
            SocialCalc.Popup.SetValue(colorControlId, "");
            SocialCalc.Popup.SetDisabled(colorControlId, true);
        }
    };

    /**
     * Get value from a BorderSide control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {object|null} Value object with border specification
     */
    SocialCalc.SettingsControls.BorderSideGetValue = function (panelobj, ctrlname) {
        let idstart = panelobj[ctrlname].id;
        let checkboxElement = document.getElementById(`${idstart}-onoff-bcb`);

        if (!checkboxElement) return null;

        if (checkboxElement.checked) {
            let colorValue = SocialCalc.Popup.GetValue(`${idstart}-color`);
            let borderSpec = `1px solid ${colorValue || "rgb(0,0,0)"}`;
            return { def: false, val: borderSpec };
        } else {
            return { def: false, val: "" };
        }
    };

    /**
     * Initialize a BorderSide control
     * @param {object} panelobj - Panel object containing control definitions
     * @param {string} ctrlname - Control name
     * @returns {void}
     */
    SocialCalc.SettingsControls.BorderSideInitialize = function (panelobj, ctrlname) {
        let idstart = panelobj[ctrlname].id;
        let colorControlId = `${idstart}-color`;

        SocialCalc.Popup.Create("ColorChooser", colorControlId, {});
        SocialCalc.Popup.Initialize(colorControlId, {
            attribs: {
                title: "&nbsp;",
                width: "106px",
                moveable: true,
                changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
                panelobj,
            },
        });
    };

    /**
     * Handle border control change events
     * @param {HTMLElement} ele - The element that changed
     * @returns {void}
     */
    SocialCalc.SettingsControlOnchangeBorder = function (ele) {
        let sc = SocialCalc.SettingsControls;
        let { CurrentPanel: panelobj } = sc;

        let nameparts = ele.id.match(/(^.*\-)(\w+)\-(\w+)\-(\w+)$/);
        if (!nameparts) return;

        let [, prefix, ctrlname, ctrlsubid, ctrlidsuffix] = nameparts;
        let ctrltype = panelobj[ctrlname].type;

        switch (ctrlidsuffix) {
            case "bcb": // border checkbox
                let borderValue = ele.checked
                    ? { def: false, val: ele.value || "1px solid rgb(0,0,0)" }
                    : { def: false, val: "" };

                sc.Controls[ctrltype].SetValue(panelobj, ctrlname, borderValue);
                break;
        }
    };

    /**
     * BorderSide control definition
     * @type {SettingsControl}
     */
    SocialCalc.SettingsControls.Controls.BorderSide = {
        SetValue: SocialCalc.SettingsControls.BorderSideSetValue,
        GetValue: SocialCalc.SettingsControls.BorderSideGetValue,
        OnClick: SocialCalc.SettingsControls.ColorComboOnClick,
        Initialize: SocialCalc.SettingsControls.BorderSideInitialize,
        InitialData: { thickness: "1 pixel:1px", style: "Solid:solid" },
        ChangedCallback: null,
    };

    /**
     * Reset all settings controls
     * @returns {void}
     */
    SocialCalc.SettingControlReset = function () {
        let sc = SocialCalc.SettingsControls;

        for (let ctrlname in sc.Controls) {
            if (sc.Controls[ctrlname].OnReset) {
                sc.Controls[ctrlname].OnReset(ctrlname);
            }
        }
    };

    // *************************************
    //
    // CtrlS Editor for Other Save Parts
    //
    // *************************************

    /**
     * Storage for additional save parts beyond sheet, edit, and audit
     * @type {object.<string, string>}
     */
    SocialCalc.OtherSaveParts = {};

    /**
     * Create editor for SocialCalc.OtherSaveParts
     * @param {string} whichpart - Part name to edit, empty string lists all parts
     * @returns {void}
     */
    SocialCalc.CtrlSEditor = function (whichpart) {
        let strtoedit;

        if (whichpart.length > 0) {
            strtoedit = SocialCalc.special_chars(SocialCalc.OtherSaveParts[whichpart] || "");
        } else {
            strtoedit = "Listing of Parts\n";
            for (let partname in SocialCalc.OtherSaveParts) {
                let partContent = SocialCalc.special_chars(
                    `\nPart: ${partname}\n=====\n${SocialCalc.OtherSaveParts[partname]}\n`
                );
                strtoedit += partContent;
            }
        }

        let editbox = document.createElement("div");
        editbox.style.cssText = [
            "position:absolute",
            "z-index:500",
            "width:300px",
            "height:300px",
            "left:100px",
            "top:200px",
            "border:1px solid black",
            "background-color:#EEE",
            "text-align:center"
        ].join(';') + ';';

        editbox.id = "socialcalc-editbox";
        editbox.innerHTML = [
            whichpart,
            '<br><br>',
            '<textarea id="socialcalc-editbox-textarea" style="width:250px;height:200px;">',
            strtoedit,
            '</textarea><br><br>',
            '<input type="button" ',
            `onclick="SocialCalc.CtrlSEditorDone('socialcalc-editbox', '${whichpart}');" `,
            'value="OK">'
        ].join('');

        document.body.appendChild(editbox);

        let textarea = document.getElementById("socialcalc-editbox-textarea");
        textarea.focus();
        SocialCalc.CmdGotFocus(textarea);
    };

    /**
     * Complete editing and save changes to OtherSaveParts
     * @param {string} idprefix - ID prefix of the editor dialog
     * @param {string} whichpart - Part name being edited
     * @returns {void}
     */
    SocialCalc.CtrlSEditorDone = function (idprefix, whichpart) {
        let edittextarea = document.getElementById(`${idprefix}-textarea`);
        let text = edittextarea.value;

        if (whichpart.length > 0) {
            if (text.length > 0) {
                SocialCalc.OtherSaveParts[whichpart] = text;
            } else {
                delete SocialCalc.OtherSaveParts[whichpart];
            }
        }

        let editbox = document.getElementById(idprefix);
        SocialCalc.KeyboardFocus();
        editbox.parentNode.removeChild(editbox);
    };

    // *************************************
    //
    // WorkBook Class Implementation
    //
    // *************************************

    // Validate dependencies
    if (!SocialCalc) {
        alert("Main SocialCalc code module needed");
        SocialCalc = {};
    }

    /**
     * @typedef {object} WorkBookSheet
     * @property {SocialCalc.Sheet} sheet - The sheet object
     * @property {SocialCalc.RenderContext} context - Rendering context
     * @property {object} editorprop - Editor properties (ecell, range, range2)
     */

    /**
     * WorkBook class - manages a collection of sheets that are worked upon together
     * 
     * @constructor
     * @param {SocialCalc.SpreadsheetControl} spread - The spreadsheet control instance
     * @author Ramu Ramamurthy
     */
    SocialCalc.WorkBook = function (spread) {
        /** @type {SocialCalc.SpreadsheetControl} */
        this.spreadsheet = spread;
        /** @type {string|null} */
        this.defaultsheetname = null;
        /** @type {object.<string, WorkBookSheet>} */
        this.sheetArr = {}; // Note: misnomer, this is not really an array
        /** @type {object} */
        this.clipsheet = {}; // For copy paste of sheets
    };

    // *************************************
    //
    // WorkBook Methods (Prototype definitions)
    //
    // *************************************

    /**
     * Initialize the workbook with a default sheet
     * @param {string} defaultsheet - Name of the default sheet
     * @returns {*} Result of SocialCalc.InitializeWorkBook
     */
    SocialCalc.WorkBook.prototype.InitializeWorkBook = function (defaultsheet) {
        return SocialCalc.InitializeWorkBook(this, defaultsheet);
    };

    /**
     * Add new sheet without switching to it
     * @param {string} sheetid - Sheet ID
     * @param {string} sheetname - Sheet name
     * @param {string} savestr - Save string data
     * @returns {*} Result of SocialCalc.AddNewWorkBookSheetNoSwitch
     */
    SocialCalc.WorkBook.prototype.AddNewWorkBookSheetNoSwitch = function (sheetid, sheetname, savestr) {
        return SocialCalc.AddNewWorkBookSheetNoSwitch(this, sheetid, sheetname, savestr);
    };

    /**
     * Add new sheet and optionally switch to it
     * @param {string} sheetname - Sheet name
     * @param {string} oldsheetname - Previous sheet name
     * @param {boolean} fromclip - Whether creating from clipboard
     * @param {SocialCalc.Sheet} spread - Existing sheet object
     * @returns {*} Result of SocialCalc.AddNewWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.AddNewWorkBookSheet = function (sheetname, oldsheetname, fromclip, spread) {
        return SocialCalc.AddNewWorkBookSheet(this, sheetname, oldsheetname, fromclip, spread);
    };

    /**
     * Activate (switch to) a workbook sheet
     * @param {string} sheetname - Sheet name to activate
     * @param {string} oldsheetname - Currently active sheet name
     * @returns {*} Result of SocialCalc.ActivateWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.ActivateWorkBookSheet = function (sheetname, oldsheetname) {
        // Validate sheet exists before activation
        if (!this.sheetArr[sheetname]) {
            console.error(`Cannot activate sheet '${sheetname}' - not found in workbook`);
            console.log("Available sheets:", Object.keys(this.sheetArr || {}));
            return;
        }
        return SocialCalc.ActivateWorkBookSheet(this, sheetname, oldsheetname);
    };

    /**
     * Delete a workbook sheet
     * @param {string} sheetname - Sheet name to delete
     * @param {string} cursheetname - Currently active sheet name
     * @returns {*} Result of SocialCalc.DeleteWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.DeleteWorkBookSheet = function (sheetname, cursheetname) {
        return SocialCalc.DeleteWorkBookSheet(this, sheetname, cursheetname);
    };

    /**
     * Save a workbook sheet
     * @param {string} sheetid - Sheet ID to save
     * @returns {*} Result of SocialCalc.SaveWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.SaveWorkBookSheet = function (sheetid) {
        return SocialCalc.SaveWorkBookSheet(this, sheetid);
    };

    /**
     * Load and rename a workbook sheet
     * @param {string} sheetid - Sheet ID
     * @param {string} savestr - Save string data
     * @param {string} newname - New sheet name
     * @returns {*} Result of SocialCalc.LoadRenameWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.LoadRenameWorkBookSheet = function (sheetid, savestr, newname) {
        return SocialCalc.LoadRenameWorkBookSheet(this, sheetid, savestr, newname);
    };

    /**
     * Rename a workbook sheet
     * @param {string} oldname - Current sheet name
     * @param {string} newname - New sheet name
     * @param {string} sheetid - Sheet ID
     * @returns {*} Result of SocialCalc.RenameWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.RenameWorkBookSheet = function (oldname, newname, sheetid) {
        return SocialCalc.RenameWorkBookSheet(this, oldname, newname, sheetid);
    };

    /**
     * Copy a workbook sheet
     * @param {string} sheetid - Sheet ID to copy
     * @returns {*} Result of SocialCalc.CopyWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.CopyWorkBookSheet = function (sheetid) {
        return SocialCalc.CopyWorkBookSheet(this, sheetid);
    };

    /**
     * Paste a workbook sheet
     * @param {string} newid - New sheet ID
     * @param {string} oldid - Source sheet ID
     * @returns {*} Result of SocialCalc.PasteWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.PasteWorkBookSheet = function (newid, oldid) {
        return SocialCalc.PasteWorkBookSheet(this, newid, oldid);
    };

    /**
     * Render the workbook sheet
     * @returns {*} Result of SocialCalc.RenderWorkBookSheet
     */
    SocialCalc.WorkBook.prototype.RenderWorkBookSheet = function () {
        return SocialCalc.RenderWorkBookSheet(this);
    };

    /**
     * Check if sheet name exists in workbook
     * @param {string} name - Sheet name to check
     * @returns {boolean} True if sheet name exists
     */
    SocialCalc.WorkBook.prototype.SheetNameExistsInWorkBook = function (name) {
        return SocialCalc.SheetNameExistsInWorkBook(this, name);
    };

    /**
     * Schedule a workbook command
     * @param {object} cmd - Command object
     * @param {boolean} isremote - Whether command is from remote source
     * @returns {*} Result of SocialCalc.WorkbookScheduleCommand
     */
    SocialCalc.WorkBook.prototype.WorkbookScheduleCommand = function (cmd, isremote) {
        return SocialCalc.WorkbookScheduleCommand(this, cmd, isremote);
    };

    /**
     * Schedule a sheet command within the workbook
     * @param {object} cmd - Command object
     * @param {boolean} isremote - Whether command is from remote source
     * @returns {*} Result of SocialCalc.WorkbookScheduleSheetCommand
     */
    SocialCalc.WorkBook.prototype.WorkbookScheduleSheetCommand = function (cmd, isremote) {
        return SocialCalc.WorkbookScheduleSheetCommand(this, cmd, isremote);
    };

    // *************************************
    //
    // WorkBook Implementation Functions
    //
    // *************************************

    /**
     * Schedule a command - could be for sheet or for the workbook itself
     * @param {SocialCalc.WorkBook} workbook - Workbook instance
     * @param {object} cmd - Command object with cmdtype, cmdstr, id properties
     * @param {boolean} isremote - Whether command is from remote source
     * @returns {void}
     */
    SocialCalc.WorkbookScheduleCommand = function (workbook, cmd, isremote) {
        if (cmd.cmdtype === "scmd") {
            workbook.WorkbookScheduleSheetCommand(cmd, isremote);
        }
    };

    /**
     * Schedule a sheet-specific command
     * @param {SocialCalc.WorkBook} workbook - Workbook instance  
     * @param {object} cmd - Command object with id, cmdstr, saveundo properties
     * @param {boolean} isremote - Whether command is from remote source
     * @returns {void}
     */
    SocialCalc.WorkbookScheduleSheetCommand = function (workbook, cmd, isremote) {
        // Check if sheet exists first
        if (workbook.sheetArr[cmd.id]) {
            workbook.sheetArr[cmd.id].sheet.ScheduleSheetCommands(cmd.cmdstr, cmd.saveundo, isremote);
        }
    };

    /**
     * Initialize workbook with default sheet
     * @param {SocialCalc.WorkBook} workbook - Workbook instance
     * @param {string} defaultsheet - Default sheet name
     * @returns {void}
     */
    SocialCalc.InitializeWorkBook = function (workbook, defaultsheet) {
        workbook.defaultsheetname = defaultsheet;

        let { spreadsheet } = workbook;
        let { defaultsheetname } = workbook;

        // Initialize the Spreadsheet Control and display it
        SocialCalc.Formula.SheetCache.sheets[defaultsheetname] = {
            sheet: spreadsheet.sheet,
            name: defaultsheetname,
        };

        spreadsheet.sheet.sheetid = defaultsheetname;
        spreadsheet.sheet.sheetname = defaultsheetname;

        workbook.sheetArr[defaultsheetname] = {
            sheet: spreadsheet.sheet,
            context: spreadsheet.context,
            editorprop: {
                ecell: null,
                range: null,
                range2: null,
            },
        };

        workbook.clipsheet = {
            savestr: null,
            copiedfrom: null,
            editorprop: {},
        };

        let { workingvalues } = spreadsheet.editor;
        workingvalues.currentsheet = spreadsheet.sheet.sheetname;
        workingvalues.startsheet = workingvalues.currentsheet;
        workingvalues.currentsheetid = spreadsheet.sheet.sheetid;
    };

    /**
     * Add new workbook sheet without switching to it
     * @param {SocialCalc.WorkBook} workbook - Workbook instance
     * @param {string} sheetid - Sheet ID
     * @param {string} sheetname - Sheet name
     * @param {string} savestr - Save string data
     * @returns {void}
     */
    SocialCalc.AddNewWorkBookSheetNoSwitch = function (workbook, sheetid, sheetname, savestr) {
        let newsheet = new SocialCalc.Sheet();

        SocialCalc.Formula.SheetCache.sheets[sheetname] = {
            sheet: newsheet,
            name: sheetname,
        };

        newsheet.sheetid = sheetid;
        newsheet.sheetname = sheetname;

        if (savestr) {
            newsheet.ParseSheetSave(savestr);
        }

        workbook.sheetArr[sheetid] = {
            sheet: newsheet,
            context: null,
            editorprop: {
                ecell: { coord: "A1", row: 1, col: 1 },
                range: null,
                range2: null,
            },
        };

        if (workbook.sheetArr[sheetid].sheet.attribs) {
            workbook.sheetArr[sheetid].sheet.attribs.needsrecalc = "yes";
        }
    };

    /**
     * Add new workbook sheet and optionally switch to it
     * @param {SocialCalc.WorkBook} workbook - Workbook instance
     * @param {string} sheetid - Sheet ID
     * @param {string} oldsheetid - Previous sheet ID
     * @param {boolean} fromclip - Whether creating from clipboard
     * @param {SocialCalc.Sheet|null} spread - Existing sheet object
     * @returns {void}
     */
    SocialCalc.AddNewWorkBookSheet = function (workbook, sheetid, oldsheetid, fromclip, spread) {
        let { spreadsheet } = workbook;

        if (spread === null) {
            spreadsheet.sheet = new SocialCalc.Sheet();
            SocialCalc.Formula.SheetCache.sheets[sheetid] = {
                sheet: spreadsheet.sheet,
                name: sheetid,
            };
            spreadsheet.sheet.sheetid = sheetid;
            spreadsheet.sheet.sheetname = sheetid;
        } else {
            spreadsheet.sheet = spread;
        }

        spreadsheet.context = new SocialCalc.RenderContext(spreadsheet.sheet);
        spreadsheet.sheet.statuscallback = SocialCalc.EditorSheetStatusCallback;
        spreadsheet.sheet.statuscallbackparams = spreadsheet.editor;

        workbook.sheetArr[sheetid] = {
            sheet: spreadsheet.sheet,
            context: spreadsheet.context,
            editorprop: {
                ecell: null,
                range: null,
                range2: null,
            },
        };

        if (oldsheetid !== null && workbook.sheetArr[oldsheetid]) {
            let oldSheet = workbook.sheetArr[oldsheetid];
            oldSheet.editorprop.ecell = spreadsheet.editor.ecell;
            oldSheet.editorprop.range = spreadsheet.editor.range;
            oldSheet.editorprop.range2 = spreadsheet.editor.range2;
        }

        spreadsheet.context.showGrid = true;
        spreadsheet.context.showRCHeaders = true;
        spreadsheet.editor.context = spreadsheet.context;

        if (!fromclip) {
            spreadsheet.editor.ecell = { coord: "A1", row: 1, col: 1 };
            spreadsheet.editor.range = { hasrange: false };
            spreadsheet.editor.range2 = { hasrange: false };
        }

        // Set highlights
        spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";

        if (fromclip) {
            // This is the result of a paste sheet
            if (workbook.clipsheet.savestr !== null) {
                spreadsheet.sheet.ParseSheetSave(workbook.clipsheet.savestr);
            }

            spreadsheet.editor.ecell = workbook.clipsheet.editorprop.ecell;
            spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";
        }

        let { workingvalues } = spreadsheet.editor;
        workingvalues.currentsheet = spreadsheet.sheet.sheetname;
        workingvalues.startsheet = workingvalues.currentsheet;
        workingvalues.currentsheetid = spreadsheet.sheet.sheetid;

        spreadsheet.editor.FitToEditTable();
        spreadsheet.editor.ScheduleRender();
    };

    /**
     * Activate (switch to) a workbook sheet
     * @param {SocialCalc.WorkBook} workbook - Workbook instance
     * @param {string} sheetnamestr - Sheet name to activate
     * @param {string} oldsheetnamestr - Currently active sheet name
     * @returns {void}
     */
    SocialCalc.ActivateWorkBookSheet = function (workbook, sheetnamestr, oldsheetnamestr) {
        let { spreadsheet } = workbook;
        let targetSheet = workbook.sheetArr[sheetnamestr];

        // Check if target sheet exists
        if (!targetSheet) {
            console.error(`Target sheet '${sheetnamestr}' not found in workbook.sheetArr`);
            console.log("Available sheets:", Object.keys(workbook.sheetArr || {}));
            return;
        }

        // Check if target sheet has required properties
        if (!targetSheet.sheet) {
            console.error(`Target sheet '${sheetnamestr}' missing sheet property`);
            return;
        }

        spreadsheet.sheet = targetSheet.sheet;
        spreadsheet.context = targetSheet.context;

        if (spreadsheet.context === null) {
            // Context is null, need to reinitialize
            workbook.AddNewWorkBookSheet(sheetnamestr, oldsheetnamestr, false, spreadsheet.sheet);
            return;
        }

        spreadsheet.editor.context = spreadsheet.context;

        // Save current editor state to old sheet
        if (oldsheetnamestr !== null && workbook.sheetArr[oldsheetnamestr]) {
            let oldSheet = workbook.sheetArr[oldsheetnamestr];
            oldSheet.editorprop.ecell = spreadsheet.editor.ecell;
            oldSheet.editorprop.range = spreadsheet.editor.range;
            oldSheet.editorprop.range2 = spreadsheet.editor.range2;
        }

        // Restore editor state from target sheet
        spreadsheet.editor.ecell = targetSheet.editorprop.ecell;
        spreadsheet.editor.range = targetSheet.editorprop.range;
        spreadsheet.editor.range2 = targetSheet.editorprop.range2;

        spreadsheet.sheet.statuscallback = SocialCalc.EditorSheetStatusCallback;
        spreadsheet.sheet.statuscallbackparams = spreadsheet.editor;

        // Handle editor state and focus
        let { workingvalues } = spreadsheet.editor;
        workingvalues.currentsheet = spreadsheet.sheet.sheetname;
        workingvalues.currentsheetid = spreadsheet.sheet.sheetid;

        // Focus input box if not in start state
        if (spreadsheet.editor.state !== "start" && spreadsheet.editor.inputBox) {
            spreadsheet.editor.inputBox.element.focus();
        }

        // Set start sheet if in start state
        if (spreadsheet.editor.state === "start") {
            workingvalues.startsheet = workingvalues.currentsheet;
        }

        // Handle rendering and recalculation
        if (spreadsheet.editor.state !== "start" && spreadsheet.editor.inputBox) {
            spreadsheet.editor.ScheduleRender();
        } else {
            // Ensure sheet attributes exist and mark for recalculation
            if (!spreadsheet.sheet.attribs) {
                spreadsheet.sheet.attribs = {};
            }
            spreadsheet.sheet.attribs.needsrecalc = "yes";

            spreadsheet.ExecuteCommand("redisplay", "");
        }
    };

/**
 * Delete a workbook sheet and clean up references
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} oldname - Sheet name to delete
 * @param {string} curname - Current sheet name for cache cleanup
 * @returns {void}
 */
SocialCalc.DeleteWorkBookSheet = function (workbook, oldname, curname) {
    let sheetToDelete = workbook.sheetArr[oldname];

    if (sheetToDelete) {
        // Clean up sheet references
        delete sheetToDelete.context;
        delete sheetToDelete.sheet;
        delete workbook.sheetArr[oldname];

        // Remove sheet from formula cache
        delete SocialCalc.Formula.SheetCache.sheets[curname];
    }
};

/**
 * Create save data for a workbook sheet
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} sheetid - Sheet ID to save
 * @returns {object} Object containing save string
 */
SocialCalc.SaveWorkBookSheet = function (workbook, sheetid) {
    let sheetData = workbook.sheetArr[sheetid];
    return {
        savestr: sheetData ? sheetData.sheet.CreateSheetSave() : ""
    };
};

/**
 * Load and rename a workbook sheet
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} sheetid - Sheet ID
 * @param {string} savestr - Save string data
 * @param {string} newname - New sheet name
 * @returns {void}
 */
SocialCalc.LoadRenameWorkBookSheet = function (workbook, sheetid, savestr, newname) {
    let targetSheet = workbook.sheetArr[sheetid];

    if (!targetSheet) return;

    // Reset and reload sheet data
    targetSheet.sheet.ResetSheet();
    targetSheet.sheet.ParseSheetSave(savestr);

    // Mark for recalculation
    if (!targetSheet.sheet.attribs) {
        targetSheet.sheet.attribs = {};
    }
    targetSheet.sheet.attribs.needsrecalc = "yes";

    // Update sheet name in formula cache
    let oldSheetName = targetSheet.sheet.sheetname;
    delete SocialCalc.Formula.SheetCache.sheets[oldSheetName];

    targetSheet.sheet.sheetname = newname;
    SocialCalc.Formula.SheetCache.sheets[newname] = {
        sheet: targetSheet.sheet,
        name: newname,
    };
};

/**
 * Render the current workbook sheet
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @returns {void}
 */
SocialCalc.RenderWorkBookSheet = function (workbook) {
    workbook.spreadsheet.editor.ScheduleRender();
};

/**
 * Rename sheet references in a formula
 * @param {string} formula - Formula string to update
 * @param {string} oldname - Old sheet name
 * @param {string} newname - New sheet name
 * @returns {string} Updated formula string
 */
SocialCalc.RenameWorkBookSheetCell = function (formula, oldname, newname) {
    let scf = SocialCalc.Formula;
    if (!scf) {
        return "Need SocialCalc.Formula";
    }

    let { TokenType: tokentype, TokenOpExpansion: tokenOpExpansion } = scf;
    let { op: token_op, string: token_string, coord: token_coord, name: token_name } = tokentype;

    let parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);
    let updatedformula = "";

    for (let i = 0; i < parseinfo.length; i++) {
        let { type: ttype, text: ttext } = parseinfo[i];

        // Check if this token is a sheet name reference
        if (ttype === token_name &&
            scf.NormalizeSheetName(ttext) === oldname &&
            i < parseinfo.length - 1) {

            let nextToken = parseinfo[i + 1];
            if (nextToken.type === token_op && nextToken.text === "!") {
                updatedformula += newname;
            } else {
                updatedformula += ttext;
            }
        } else {
            updatedformula += ttext;
        }
    }

    return updatedformula;
};

/**
 * Rename a workbook sheet and update all formula references
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} oldname - Current sheet name
 * @param {string} newname - New sheet name
 * @param {string} sheetid - Sheet ID
 * @returns {void}
 */
SocialCalc.RenameWorkBookSheet = function (workbook, oldname, newname, sheetid) {
    // Update formula cache
    let oldsheet = SocialCalc.Formula.SheetCache.sheets[oldname].sheet;
    delete SocialCalc.Formula.SheetCache.sheets[oldname];

    SocialCalc.Formula.SheetCache.sheets[newname] = {
        sheet: oldsheet,
        name: newname,
    };

    workbook.sheetArr[sheetid].sheet.sheetname = newname;

    // Update all formula references across all sheets
    for (let sheetKey in workbook.sheetArr) {
        let currentSheet = workbook.sheetArr[sheetKey].sheet;

        for (let cellCoord in currentSheet.cells) {
            let cell = currentSheet.cells[cellCoord];

            if (cell?.datatype === "f") {
                cell.formula = SocialCalc.RenameWorkBookSheetCell(cell.formula, oldname, newname);

                // Clear parse info to force re-parsing
                if (cell.parseinfo) {
                    delete cell.parseinfo;
                }
            }
        }
    }

    // Trigger recalculation
    workbook.spreadsheet.ExecuteCommand("recalc", "");
};

/**
 * Copy a workbook sheet to clipboard
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} sheetid - Sheet ID to copy
 * @returns {void}
 */
SocialCalc.CopyWorkBookSheet = function (workbook, sheetid) {
    let sourceSheet = workbook.sheetArr[sheetid];

    if (!sourceSheet) return;

    workbook.clipsheet = {
        savestr: sourceSheet.sheet.CreateSheetSave(),
        copiedfrom: sheetid,
        editorprop: {
            ecell: { ...workbook.spreadsheet.editor.ecell },
        },
    };
};

/**
 * Paste a workbook sheet from clipboard
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} newsheetid - New sheet ID
 * @param {string} oldsheetid - Previous active sheet ID
 * @returns {void}
 */
SocialCalc.PasteWorkBookSheet = function (workbook, newsheetid, oldsheetid) {
    workbook.AddNewWorkBookSheet(newsheetid, oldsheetid, true);
};

/**
 * Check if a sheet name exists in the workbook
 * @param {SocialCalc.WorkBook} workbook - Workbook instance
 * @param {string} name - Sheet name to check
 * @returns {string|null} Sheet ID if exists, null otherwise
 */
SocialCalc.SheetNameExistsInWorkBook = function (workbook, name) {
    for (let sheetId in workbook.sheetArr) {
        if (workbook.sheetArr[sheetId].sheet.sheetname === name) {
            return sheetId;
        }
    }
    return null;
};

// *************************************
//
// WorkBook Control Implementation
//
// *************************************

// Validate dependencies
if (!SocialCalc) {
    alert("Main SocialCalc code module needed");
    SocialCalc = {};
}

/**
 * Current workbook control object reference
 * @type {SocialCalc.WorkBookControl|null}
 */
SocialCalc.CurrentWorkbookControlObject = null;

/**
 * Test workbook save string for debugging
 * @type {string}
 */
SocialCalc.TestWorkBookSaveStr = "";

/**
 * WorkBook Control class - manages workbook actions (add/del/rename etc)
 * Can appear at the bottom of the screen. Currently appears at the top as proof of concept.
 * 
 * @constructor
 * @param {SocialCalc.WorkBook} book - Workbook instance
 * @param {string} divid - DOM element ID for the control
 * @param {string} defaultsheetname - Default sheet name
 * @author Ramu Ramamurthy
 */
SocialCalc.WorkBookControl = function (book, divid, defaultsheetname) {
    /** @type {SocialCalc.WorkBook} */
    this.workbook = book;
    /** @type {string} */
    this.div = divid;
    /** @type {string} */
    this.defaultsheetname = defaultsheetname;
    /** @type {object.<string, HTMLElement>} */
    this.sheetButtonArr = {};
    /** @type {number} */
    this.sheetCnt = 0;
    /** @type {number} */
    this.numSheets = 0;
    /** @type {HTMLElement|null} */
    this.currentSheetButton = null;
    /** @type {string} */
    this.renameDialogId = "sheetRenameDialog";
    /** @type {string} */
    this.deleteDialogId = "sheetDeleteDialog";
    /** @type {string} */
    this.hideDialogId = "sheetHideDialog";
    /** @type {string} */
    this.unhideDialogId = "sheetUnhideDialog";

    /** @type {string} */
    this.sheetshtml = '<div id="fooBar" style="background-color:#80A9F3;display:none"></div>';

    SocialCalc.CurrentWorkbookControlObject = this;
    /** @type {SocialCalc.SheetBar} */
    this.sheetbar = new SocialCalc.SheetBar();
};

// *************************************
//
// WorkBook Control Methods
//
// *************************************

/**
 * Get current workbook control
 * @returns {SocialCalc.WorkBookControl} Current workbook control instance
 */
SocialCalc.WorkBookControl.prototype.GetCurrentWorkBookControl = function () {
    return SocialCalc.GetCurrentWorkBookControl();
};

/**
 * Initialize workbook control
 * @returns {*} Result of SocialCalc.InitializeWorkBookControl
 */
SocialCalc.WorkBookControl.prototype.InitializeWorkBookControl = function () {
    return SocialCalc.InitializeWorkBookControl(this);
};

/**
 * Execute workbook control command
 * @param {object} cmd - Command object
 * @param {boolean} isremote - Whether command is from remote source
 * @returns {*} Result of SocialCalc.ExecuteWorkBookControlCommand
 */
SocialCalc.WorkBookControl.prototype.ExecuteWorkBookControlCommand = function (cmd, isremote) {
    return SocialCalc.ExecuteWorkBookControlCommand(this, cmd, isremote);
};

/**
 * Execute workbook control command
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @param {object} cmd - Command object with cmdtype, cmdstr properties
 * @param {boolean} isremote - Whether command is from remote source
 * @returns {void}
 */
SocialCalc.ExecuteWorkBookControlCommand = function (control, cmd, isremote) {
    if (cmd.cmdtype === "scmd") {
        // Dispatch a sheet command
        control.workbook.WorkbookScheduleCommand(cmd, isremote);
        return;
    }

    if (cmd.cmdtype !== "wcmd") {
        return;
    }

    let parseobj = new SocialCalc.Parse(cmd.cmdstr);
    let cmd1 = parseobj.NextToken();

    switch (cmd1) {
        case "addsheet":
            SocialCalc.WorkBookControlAddSheetRemote(null);
            break;

        case "addsheetstr":
            SocialCalc.WorkBookControlAddSheetRemote(cmd.sheetstr);
            break;

        case "delsheet":
            let deleteSheetId = parseobj.NextToken();
            SocialCalc.WorkBookControlDelSheetRemote(deleteSheetId);
            break;

        case "rensheet":
            let renameSheetId = parseobj.NextToken();
            let oldname = parseobj.NextToken();
            let newname = parseobj.NextToken();
            SocialCalc.WorkBookControlRenameSheetRemote(renameSheetId, oldname, newname);
            break;

        case "activatesheet":
            let activateSheetId = parseobj.NextToken();
            SocialCalc.WorkBookControlActivateSheet(activateSheetId);
            break;

        case "hidesheet":
            let hideSheetId = parseobj.NextToken();
            // TODO: Implement hide sheet functionality
            break;

        case "unhidesheet":
            let unhideSheetId = parseobj.NextToken();
            // TODO: Implement unhide sheet functionality
            break;
    }
};

/**
 * Get current workbook control instance
 * @returns {SocialCalc.WorkBookControl} Current workbook control
 */
SocialCalc.GetCurrentWorkBookControl = function () {
    if (!SocialCalc.CurrentWorkbookControlObject) {
        console.warn("WorkBook control not yet initialized");
    }
    return SocialCalc.CurrentWorkbookControlObject;
};

/**
 * Initialize workbook control UI
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @returns {void}
 */
SocialCalc.InitializeWorkBookControl = function (control) {
    let element = document.createElement("div");
    element.innerHTML = control.sheetshtml;

    let container = document.getElementById(control.div);
    if (!container) {
        console.error(`InitializeWorkBookControl: Container with id '${control.div}' not found`);
        return;
    }
    
    container.appendChild(element);

    // Add default sheet with a small delay to ensure DOM is ready
    setTimeout(() => {
        SocialCalc.WorkBookControlAddSheet(false);
    }, 50);
};

/**
 * Delete sheet remotely (from another user/session)
 * @param {string} sheetid - Sheet ID to delete
 * @returns {void}
 */
SocialCalc.WorkBookControlDelSheetRemote = function (sheetid) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control || !control.currentSheetButton) {
        console.error("Workbook control not properly initialized");
        return;
    }

    if (sheetid === control.currentSheetButton.id) {
        // The active sheet is being deleted
        SocialCalc.WorkBookControlDelSheet();
        return;
    }

    // Delete non-active sheet
    let sheetContainer = document.getElementById("fooBar");
    let deletedButton = document.getElementById(sheetid);

    if (!deletedButton) return;

    let { id: deletedId, value: deletedName } = deletedButton;
    delete control.sheetButtonArr[deletedId];

    // Remove UI elements
    sheetContainer.removeChild(deletedButton);

    let sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    let sheetbarButton = document.getElementById(`sbsb-${deletedId}`);
    if (sheetbarButton) {
        sheetbar.removeChild(sheetbarButton);
    }

    // Delete the sheet data
    control.workbook.DeleteWorkBookSheet(deletedId, deletedName);
    control.numSheets -= 1;
};

/**
 * Delete current active sheet (assumes current active sheet is being deleted)
 * @returns {void}
 */
SocialCalc.WorkBookControlDelSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control || !control.workbook || !control.currentSheetButton) {
        console.error("Workbook control not properly initialized");
        return;
    }

    // Prevent deletion if not in start state
    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    // Prevent deletion if only one sheet remains
    if (control.numSheets === 1) {
        SocialCalc.WorkBookControlShowMinimumSheetDialog(control, "delete");
        return;
    }

    // Show confirmation dialog
    SocialCalc.WorkBookControlShowDeleteConfirmDialog(control);
};

/**
 * Show dialog when trying to delete/hide the last remaining sheet
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @param {string} action - Action type ("delete" or "hide")
 * @returns {void}
 */
SocialCalc.WorkBookControlShowMinimumSheetDialog = function (control, action) {
    let dialogId = action === "delete" ? control.deleteDialogId : control.hideDialogId;
    let existingDialog = document.getElementById(dialogId);
    if (existingDialog) return;

    let actionText = action === "delete" ? "deleted" : "hidden";
    let actionVerb = action === "delete" ? "delete" : "hide";

    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        '<span><b>A workbook must contain at least one worksheet</b></span><br><br>',
        `<span>To ${actionVerb} the selected sheet, you must first insert a new sheet.</span><br>`,
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        `<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControl${action === "delete" ? "Delete" : "Hide"}SheetHide();">`,
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, dialogId, dialogContent, action);
};

/**
 * Show delete confirmation dialog
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @returns {void}
 */
SocialCalc.WorkBookControlShowDeleteConfirmDialog = function (control) {
    let existingDialog = document.getElementById(control.deleteDialogId);
    if (existingDialog) return;

    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        '<span><b>The selected sheet will be permanently deleted.</b></span><br>',
        '<span><ul>',
        '<li>To delete the selected sheet, click OK.</li>',
        '<li>To cancel the deletion, click cancel.</li>',
        '</ul></span>',
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;',
        '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetSubmit();">',
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, control.deleteDialogId, dialogContent, "delete");
};

/**
 * Create and display a modal dialog
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @param {string} dialogId - Dialog element ID
 * @param {string} content - Dialog content HTML
 * @param {string} type - Dialog type for styling
 * @returns {void}
 */
SocialCalc.WorkBookControlCreateDialog = function (control, dialogId, content, type) {
    let main = document.createElement("div");
    main.id = dialogId;
    main.style.cssText = [
        "position:absolute",
        "z-index:100",
        "background-color:#FFF",
        "border:1px solid black",
        "width:400px"
    ].join(';') + ';';

    let vp = SocialCalc.GetViewportInfo();
    main.style.top = `${vp.height / 3}px`;
    main.style.left = `${vp.width / 3}px`;

    let hideFunction = type === "delete" ? "DeleteSheetHide" : "HideSheetHide";

    main.innerHTML = [
        '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>',
        '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">&nbsp;</td>',
        `<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControl${hideFunction}();">&nbsp;X&nbsp;</td>`,
        '</tr></table>',
        '<div style="background-color:#DDD;">', content, '</div>'
    ].join('');

    // Register drag functionality
    SocialCalc.DragRegister(
        main.firstChild.firstChild.firstChild.firstChild,
        true,
        true,
        {
            MouseDown: SocialCalc.DragFunctionStart,
            MouseMove: SocialCalc.DragFunctionPosition,
            MouseUp: SocialCalc.DragFunctionPosition,
            Disabled: null,
            positionobj: main,
        }
    );

    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
};

/**
 * Hide delete sheet dialog
 * @returns {void}
 */
SocialCalc.WorkBookControlDeleteSheetHide = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let dialogElement = document.getElementById(control.deleteDialogId);

    if (!dialogElement) return;

    dialogElement.innerHTML = "";
    SocialCalc.DragUnregister(dialogElement);
    SocialCalc.KeyboardFocus();

    if (dialogElement.parentNode) {
        dialogElement.parentNode.removeChild(dialogElement);
    }
};

/**
 * Submit delete sheet action
 * @returns {void}
 */
SocialCalc.WorkBookControlDeleteSheetSubmit = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlDeleteSheetHide();

    let sheetContainer = document.getElementById("fooBar");
    let currentButton = document.getElementById(control.currentSheetButton.id);

    if (!currentButton) return;

    let { id: sheetId, value: sheetName } = currentButton;
    delete control.sheetButtonArr[sheetId];

    // Remove UI elements
    sheetContainer.removeChild(currentButton);

    let sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    let sheetbarButton = document.getElementById(`sbsb-${sheetId}`);
    if (sheetbarButton) {
        sheetbar.removeChild(sheetbarButton);
    }

    control.currentSheetButton = null;
    control.workbook.DeleteWorkBookSheet(sheetId, sheetName);
    control.numSheets -= 1;

    // Broadcast deletion command
    let cmdstr = `delsheet ${sheetId}`;
    SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr,
    });

    // Activate first available sheet
    for (let sheetKey in control.sheetButtonArr) {
        if (sheetKey) {
            let newCurrentButton = control.sheetButtonArr[sheetKey];
            control.currentSheetButton = newCurrentButton;
            newCurrentButton.setAttribute("style", "background-color:lightgreen");
            SocialCalc.SheetBarButtonActivate(newCurrentButton.id, true);
            control.workbook.ActivateWorkBookSheet(newCurrentButton.id, null);
            break;
        }
    }
};

/**
 * Hide current sheet (assumes current active sheet is being hidden)
 * @returns {void}
 */
SocialCalc.WorkBookControlHideSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();

    // Prevent hiding if not in start state
    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    // Prevent hiding if only one sheet remains
    if (control.numSheets === 1) {
        SocialCalc.WorkBookControlShowMinimumSheetDialog(control, "hide");
        return;
    }

    // Show confirmation dialog
    SocialCalc.WorkBookControlShowHideConfirmDialog(control);
};

/**
 * Show hide confirmation dialog
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @returns {void}
 */
SocialCalc.WorkBookControlShowHideConfirmDialog = function (control) {
    let existingDialog = document.getElementById(control.hideDialogId);
    if (existingDialog) return;

    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        '<span><b>The selected sheet will be hidden.</b></span><br>',
        '<span><ul>',
        '<li>To hide the selected sheet, click OK.</li>',
        '<li>To cancel the hiding, click cancel.</li>',
        '</ul></span>',
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;',
        '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetSubmit();">',
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, control.hideDialogId, dialogContent, "hide");
};

/**
 * Hide hide sheet dialog
 * @returns {void}
 */
SocialCalc.WorkBookControlHideSheetHide = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let dialogElement = document.getElementById(control.hideDialogId);

    if (!dialogElement) return;

    dialogElement.innerHTML = "";
    SocialCalc.DragUnregister(dialogElement);
    SocialCalc.KeyboardFocus();

    if (dialogElement.parentNode) {
        dialogElement.parentNode.removeChild(dialogElement);
    }
};
/**
 * Submit hide sheet action
 * @returns {void}
 */
SocialCalc.WorkBookControlHideSheetSubmit = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlHideSheetHide();

    let sheetContainer = document.getElementById("fooBar");
    let currentButton = document.getElementById(control.currentSheetButton.id);

    if (!currentButton) return;

    let { id: sheetId, value: sheetName } = currentButton;

    // Hide sheet in UI
    let sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    let sheetbarButton = document.getElementById(`sbsb-${sheetId}`);

    if (sheetbarButton) {
        SocialCalc.SheetBarButtonActivate(sheetId, false);
        sheetbarButton.style.display = "none";
    }

    control.currentSheetButton = null;
    control.numSheets -= 1;

    // Broadcast hide command
    let cmdstr = `hidesheet ${sheetId}`;
    SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr,
    });

    // Find and activate first visible sheet
    for (let sheetKey in control.sheetButtonArr) {
        if (sheetKey) {
            let sheetButton = document.getElementById(`sbsb-${sheetKey}`);
            if (sheetButton?.style.display !== "none") {
                let newCurrentButton = control.sheetButtonArr[sheetKey];
                control.currentSheetButton = newCurrentButton;
                newCurrentButton.setAttribute("style", "background-color:lightgreen");
                SocialCalc.SheetBarButtonActivate(newCurrentButton.id, true);
                control.workbook.ActivateWorkBookSheet(newCurrentButton.id, null);
                break;
            }
        }
    }
};

/**
 * Display unhide sheet dialog with list of hidden sheets
 * @returns {void}
 */
SocialCalc.WorkBookControlUnhideSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();

    // Prevent unhiding if not in start state
    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    // Count hidden sheets
    let hiddenCount = 0;
    for (let sheetKey in control.sheetButtonArr) {
        let sheetButton = document.getElementById(`sbsb-${sheetKey}`);
        if (sheetButton?.style.display === "none") {
            hiddenCount++;
        }
    }

    // Show message if no hidden sheets
    if (hiddenCount === 0) {
        SocialCalc.WorkBookControlShowNoHiddenSheetsDialog(control);
        return;
    }

    // Prevent duplicate dialog
    let existingDialog = document.getElementById(control.unhideDialogId);
    if (existingDialog) return;

    SocialCalc.WorkBookControlShowUnhideSelectionDialog(control);
};

/**
 * Show dialog when no sheets are hidden
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @returns {void}
 */
SocialCalc.WorkBookControlShowNoHiddenSheetsDialog = function (control) {
    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        '<span><b>There are no hidden worksheets.</b></span><br><br>',
        '<span>Before unhiding any sheets, you must first hide a sheet.</span><br>',
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        '<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">',
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, control.unhideDialogId, dialogContent, "unhide");
};

/**
 * Show dialog for selecting which sheet to unhide
 * @param {SocialCalc.WorkBookControl} control - Workbook control instance
 * @returns {void}
 */
SocialCalc.WorkBookControlShowUnhideSelectionDialog = function (control) {
    let hiddenSheetOptions = [];

    for (let sheetKey in control.sheetButtonArr) {
        let sheetButton = document.getElementById(`sbsb-${sheetKey}`);
        if (sheetButton?.style.display === "none") {
            let sheetName = control.sheetButtonArr[sheetKey].value;
            hiddenSheetOptions.push(
                `<input type="radio" value="${sheetKey}" onclick="document.getElementById('unhidesheetform').unhidesheet.value='${sheetKey}';"/>${sheetName}<br>`
            );
        }
    }

    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        '<span><b>The following sheets are hidden.</b></span><br>',
        '<form id="unhidesheetform">',
        '<input type="hidden" name="unhidesheet" value=""/>',
        '<ul>', hiddenSheetOptions.join(''), '</ul>',
        '</form>',
        '<span><ul>',
        '<li>To unhide the selected sheet, click OK.</li>',
        '<li>To cancel the unhiding, click cancel.</li>',
        '</ul></span>',
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;',
        '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetSubmit(document.getElementById(\'unhidesheetform\').unhidesheet.value);">',
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, control.unhideDialogId, dialogContent, "unhide");
};

/**
 * Hide unhide sheet dialog
 * @returns {void}
 */
SocialCalc.WorkBookControlUnhideSheetHide = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let dialogElement = document.getElementById(control.unhideDialogId);

    if (!dialogElement) return;

    dialogElement.innerHTML = "";
    SocialCalc.DragUnregister(dialogElement);
    SocialCalc.KeyboardFocus();

    if (dialogElement.parentNode) {
        dialogElement.parentNode.removeChild(dialogElement);
    }
};

/**
 * Submit unhide sheet action
 * @param {string} name - Sheet ID to unhide
 * @returns {void}
 */
SocialCalc.WorkBookControlUnhideSheetSubmit = function (name) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlUnhideSheetHide();

    // Deactivate current sheet
    if (control.currentSheetButton) {
        let oldSheetId = control.currentSheetButton.id;
        control.currentSheetButton.setAttribute("style", "");
        SocialCalc.SheetBarButtonActivate(oldSheetId, false);
    }

    // Show the unhidden sheet
    let sheetbarButton = document.getElementById(`sbsb-${name}`);
    if (sheetbarButton) {
        sheetbarButton.style.display = "inline";
    }

    control.currentSheetButton = null;
    control.numSheets += 1;

    // Broadcast unhide command
    let cmdstr = `unhidesheet ${name}`;
    SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr,
    });

    // Find and activate first visible sheet
    for (let sheetKey in control.sheetButtonArr) {
        if (sheetKey) {
            let sheetButton = document.getElementById(`sbsb-${sheetKey}`);
            if (sheetButton?.style.display !== "none") {
                let newCurrentButton = control.sheetButtonArr[sheetKey];
                control.currentSheetButton = newCurrentButton;
                newCurrentButton.setAttribute("style", "background-color:lightgreen");
                SocialCalc.SheetBarButtonActivate(newCurrentButton.id, true);
                control.workbook.ActivateWorkBookSheet(newCurrentButton.id, null);
                break;
            }
        }
    }
};

/**
 * Add a sheet button to the workbook control
 * @param {string|null} sheetname - Sheet name (null for auto-generated)
 * @param {string|null} sheetid - Sheet ID (null for auto-generated)
 * @returns {HTMLElement} Created button element
 */
SocialCalc.WorkBookControlAddSheetButton = function (sheetname, sheetid) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let element = document.createElement("input");

    // Generate sheet ID if not provided
    let name = sheetid || `sheet${control.sheetCnt + 1}`;
    if (!sheetid) {
        control.sheetCnt += 1;
    }

    // Configure button element
    element.setAttribute("type", "button");
    element.setAttribute("value", sheetname || name);
    element.setAttribute("id", name);
    element.setAttribute("name", name);
    element.setAttribute("onclick", `SocialCalc.WorkBookControlActivateSheet('${name}')`);

    control.sheetButtonArr[name] = element;

    // Add to DOM with error checking
    let sheetContainer = document.getElementById("fooBar");
    if (sheetContainer) {
        sheetContainer.appendChild(element);
        control.numSheets += 1;
    } else {
        console.warn("Sheet container 'fooBar' not found in DOM");
    }

    // Create sheet bar button with error checking
    let sheetBarContainer = document.getElementById("SocialCalc-sheetbar-buttons");
    if (sheetBarContainer) {
        try {
            let sheetBarButton = new SocialCalc.SheetBarSheetButton(
                `sbsb-${name}`,
                sheetname || name,
                sheetBarContainer,
                {}, // Styling options
                {
                    MouseDown: () => SocialCalc.SheetBarSheetButtonPress(name),
                    Repeat: () => { },
                    Disabled: () => { },
                }
            );
        } catch (error) {
            console.error(`Error creating sheet bar button for ${name}:`, error);
        }
    } else {
        console.warn("Sheet bar container 'SocialCalc-sheetbar-buttons' not found in DOM");
    }

    return element;
};

/**
 * Add a new sheet to the workbook
 * @param {boolean} addworksheet - Whether to actually create the worksheet
 * @param {string|null} sheetname - Sheet name (null for auto-generated)
 * @returns {void}
 */
SocialCalc.WorkBookControlAddSheet = function (addworksheet, sheetname) {
    let control = SocialCalc.GetCurrentWorkBookControl();

    // Prevent adding if not in start state
    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    // Add the button
    let element = SocialCalc.WorkBookControlAddSheetButton(sheetname);
    
    // Ensure element was created successfully
    if (!element) {
        console.error("Failed to create sheet button element");
        return;
    }

    // Update current sheet highlighting
    let oldSheetId = null;
    if (control.currentSheetButton) {
        if (control.currentSheetButton.setAttribute) {
            control.currentSheetButton.setAttribute("style", "");
        }
        oldSheetId = control.currentSheetButton.id;
        SocialCalc.SheetBarButtonActivate(oldSheetId, false);
    }
    
    // If no current sheet, use the first available sheet
    if (!oldSheetId && control.workbook && control.workbook.sheetArr) {
        const availableSheets = Object.keys(control.workbook.sheetArr);
        if (availableSheets.length > 0) {
            oldSheetId = availableSheets[0];
        }
    }

    if (element.setAttribute) {
        element.setAttribute("style", "background-color:lightgreen");
    }
    control.currentSheetButton = element;
    let newSheetId = element.id;
    
    // Add a delay to ensure DOM elements are ready and give more time for sheet bar button creation
    setTimeout(() => {
        // Double-check the element exists before activating
        if (document.getElementById(`sbsb-${newSheetId}`)) {
            SocialCalc.SheetBarButtonActivate(newSheetId, true);
        } else {
            console.warn(`Sheet bar button for ${newSheetId} not found, activation skipped`);
        }
    }, 200);

    // Create the sheet if requested
    if (addworksheet) {
        control.workbook.AddNewWorkBookSheet(newSheetId, oldSheetId, false);

        // Broadcast add command
        SocialCalc.Callbacks.broadcast("execute", {
            cmdtype: "wcmd",
            id: "0",
            cmdstr: "addsheet",
        });
    }
};

/**
 * Add sheet remotely (from another user/session)
 * @param {string|null} savestr - Save string data for the sheet
 * @returns {void}
 */
SocialCalc.WorkBookControlAddSheetRemote = function (savestr) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let element = SocialCalc.WorkBookControlAddSheetButton();

    // Add sheet without switching to it
    control.workbook.AddNewWorkBookSheetNoSwitch(element.id, element.value, savestr);
};

/**
 * Activate (switch to) a specific sheet
 * @param {string} name - Sheet ID to activate
 * @returns {void}
 */
SocialCalc.WorkBookControlActivateSheet = function (name) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control || !control.workbook) {
        console.error("WorkBook control not properly initialized");
        return;
    }
    
    let targetButton = document.getElementById(name);

    if (!targetButton) {
        console.warn(`Target button with id '${name}' not found`);
        return;
    }

    // Update button styling
    targetButton.setAttribute("style", "background-color:lightgreen");
    
    // Check if sheet bar button exists before activating
    if (document.getElementById(`sbsb-${name}`)) {
        SocialCalc.SheetBarButtonActivate(name, true);
    } else {
        console.warn(`Sheet bar button for '${name}' not found, skipping activation`);
    }

    // Deactivate previous sheet
    if (control.currentSheetButton && control.currentSheetButton.id !== name) {
        let oldSheetId = control.currentSheetButton.id;
        control.currentSheetButton.setAttribute("style", "");
        
        // Check if sheet bar button exists before deactivating
        if (document.getElementById(`sbsb-${oldSheetId}`)) {
            SocialCalc.SheetBarButtonActivate(oldSheetId, false);
        } else {
            console.warn(`Sheet bar button for '${oldSheetId}' not found, skipping deactivation`);
        }
    }

    let oldSheetId = control.currentSheetButton ? control.currentSheetButton.id : null;
    control.currentSheetButton = targetButton;

    // Activate workbook sheet
    control.workbook.ActivateWorkBookSheet(name, oldSheetId);
};

/**
 * HTTP request object for Ajax calls
 * @type {XMLHttpRequest|null}
 */
SocialCalc.WorkBookControlHttpRequest = null;

/**
 * Handle Ajax response for workbook operations
 * @returns {void}
 */
SocialCalc.WorkBookControlAlertContents = function () {
    let httpRequest = SocialCalc.WorkBookControlHttpRequest;
    if (!httpRequest || httpRequest.readyState !== 4) return;

    try {
        if (httpRequest.status === 200) {
            let loadedStr = httpRequest.responseText || "";
            SocialCalc.TestWorkBookSaveStr = loadedStr;
            SocialCalc.Clipboard.clipboard = loadedStr;
            SocialCalc.WorkBookControlHttpRequest = null;
        }
    } catch (e) {
        console.error("Error processing Ajax response:", e);
    }
};

/**
 * Make Ajax call for workbook operations
 * @param {string} url - Target URL
 * @param {string} contents - Data to send
 * @returns {boolean} Success status
 */
SocialCalc.WorkBookControlAjaxCall = function (url, contents) {
    let httpRequest = null;

    // Create XMLHttpRequest object
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e2) {
                console.error("Cannot create XMLHTTP instance");
            }
        }
    }

    if (!httpRequest) {
        alert("Cannot create an XMLHTTP instance");
        return false;
    }

    // Configure and send request
    SocialCalc.WorkBookControlHttpRequest = httpRequest;
    httpRequest.onreadystatechange = SocialCalc.WorkBookControlAlertContents;
    httpRequest.open("POST", document.URL, true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.send(contents);

    return true;
};

/**
 * Save the current workbook to JSON format
 * @returns {string} JSON string of workbook save data
 */
SocialCalc.WorkBookControlSaveSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let sheetsave = {
        numsheets: control.numSheets,
        currentid: control.currentSheetButton.id,
        currentname: control.currentSheetButton.value,
        sheetArr: {},
        timestamp: new Date().toString(),
    };

    // Save all sheets
    for (let sheetKey in control.sheetButtonArr) {
        let sheetData = control.workbook.SaveWorkBookSheet(sheetKey);
        let sheetButton = document.getElementById(`sbsb-${sheetKey}`);

        sheetsave.sheetArr[sheetKey] = {
            sheetstr: sheetData,
            name: control.sheetButtonArr[sheetKey].value,
            hidden: sheetButton?.style.display === "none" ? "1" : "0",
        };
    }

    // Save editable cells if specified
    if (SocialCalc.EditableCells?.allow) {
        sheetsave.EditableCells = { ...SocialCalc.EditableCells };
    }

    SocialCalc.TestWorkBookSaveStr = JSON.stringify(sheetsave);
    return SocialCalc.TestWorkBookSaveStr;
};

/**
 * Insert another workbook into existing workbook
 * Assumption: at least 1 sheet exists in existing workbook
 * Sheets with same names will be overwritten
 * @param {string} savestr - JSON string of workbook to insert
 * @returns {void}
 */
SocialCalc.WorkBookControlInsertWorkbook = function (savestr) {
    if (!savestr) return;

    let sheetsave = JSON.parse(savestr);
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control || !control.workbook) {
        console.error("Workbook control not initialized");
        return;
    }

    for (let sheetKey in sheetsave.sheetArr) {
        let sheetSaveStr = sheetsave.sheetArr[sheetKey].sheetstr.savestr;

        // Extract sheet data from save string
        let parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(sheetSaveStr);
        if (parts?.sheet) {
            sheetSaveStr = sheetSaveStr.substring(parts.sheet.start, parts.sheet.end);
        }

        let sheetName = sheetsave.sheetArr[sheetKey].name;
        let existingSheetId = control.workbook.SheetNameExistsInWorkBook(sheetName);

        if (existingSheetId) {
            // Sheet exists, replace it
            console.log(`${sheetName} exists, replacing`);
            control.workbook.LoadRenameWorkBookSheet(existingSheetId, sheetSaveStr, sheetName);
        } else {
            // Create new sheet using original key to preserve sheet IDs
            let newSheetId = sheetKey; // Use original sheet key (sheet1, sheet2, etc.)
            
            // Update sheetCnt to ensure it's at least as high as the current sheet number
            let sheetNum = parseInt(sheetKey.replace('sheet', '')) || 1;
            if (sheetNum > control.sheetCnt) {
                control.sheetCnt = sheetNum;
            }

            SocialCalc.WorkBookControlAddSheetButton(sheetName, newSheetId);
            control.workbook.AddNewWorkBookSheetNoSwitch(newSheetId, sheetName, sheetSaveStr);
        }
    }
};

/**
 * Load a workbook from save string
 * @param {string} savestr - JSON string of workbook save data
 * @returns {void}
 */
SocialCalc.WorkBookControlLoad = function (savestr) {
    if (!savestr) return;

    let sheetsave = JSON.parse(savestr);
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control) {
        console.error("Workbook control not initialized");
        return;
    }

    // Create new workbook
    SocialCalc.WorkBookControlCreateNewBook();
    // At this point there is one sheet and 1 button
    // Create the sequence of buttons and sheets
    let firstrun = true;
    let newbuttons = 0;
    let sheetid = null;
    let currentsheetid = sheetsave.currentid;

    for (let sheet in sheetsave.sheetArr) {
        if (newbuttons > sheetsave.numsheets) {
            break;
        }

        let savestr = sheetsave.sheetArr[sheet].sheetstr.savestr;
        let parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(savestr);

        if (parts?.sheet) {
            savestr = savestr.substring(parts.sheet.start, parts.sheet.end);
        }

        if (firstrun) {
            firstrun = false;
            // Set the first button's name correctly
            sheetid = control.currentSheetButton.id;
            control.currentSheetButton.value = sheetsave.sheetArr[sheet].name;
            SocialCalc.SheetBarButtonSetName(sheetid, sheetsave.sheetArr[sheet].name);

            // Set the sheet data for the first sheet which already exists
            control.workbook.LoadRenameWorkBookSheet(sheetid, savestr, control.currentSheetButton.value);
            currentsheetid = sheetid;
        } else {
            sheetid = `sheet${control.sheetCnt + 1}`;
            control.sheetCnt += 1;
            SocialCalc.WorkBookControlAddSheetButton(sheetsave.sheetArr[sheet].name, sheetid);

            // Create the sheet
            control.workbook.AddNewWorkBookSheetNoSwitch(sheetid, sheetsave.sheetArr[sheet].name, savestr);
        }

        // Handle hidden sheets
        if (sheetsave.sheetArr[sheet].hidden === "1") {
            let sheetbarButton = document.getElementById(`sbsb-${sheetid}`);
            if (sheetbarButton) {
                sheetbarButton.style.display = "none";
                SocialCalc.SheetBarButtonActivate(sheet, false);
                newbuttons -= 1;
            }
        }

        if (sheet === sheetsave.currentid) {
            currentsheetid = sheetid;
        }
        newbuttons += 1;
    }

    // Save the user script data
    if (sheetsave.EditableCells) {
        SocialCalc.EditableCells = { ...sheetsave.EditableCells };
    }

    // Activate the current sheet after a delay
    setTimeout(() => {
        // Validate currentsheetid before activating
        if (!currentsheetid) {
            console.warn("No current sheet ID found, using first available sheet");
            const availableSheets = Object.keys(control.sheetButtonArr);
            if (availableSheets.length > 0) {
                currentsheetid = availableSheets[0];
            } else {
                console.error("No sheets available to activate");
                return;
            }
        }
        
        // Check if the sheet exists in the workbook
        if (!control.workbook.sheetArr[currentsheetid]) {
            console.warn(`Sheet '${currentsheetid}' not found in workbook, using first available sheet`);
            const availableSheets = Object.keys(control.workbook.sheetArr);
            if (availableSheets.length > 0) {
                currentsheetid = availableSheets[0];
                console.log(`Using sheet '${currentsheetid}' instead`);
            } else {
                console.error("No sheets available in workbook");
                return;
            }
        }
        
        SocialCalc.WorkBookControlActivateSheet(currentsheetid);
    }, 200);
};

/**
 * Show rename sheet dialog
 * @returns {void}
 */
SocialCalc.WorkBookControlRenameSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();

    // Prevent renaming if not in start state
    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    // Prevent duplicate dialog
    let existingDialog = document.getElementById(control.renameDialogId);
    if (existingDialog) return;

    let currentsheet = control.currentSheetButton.value;

    let dialogContent = [
        '<div style="padding:6px 0px 4px 6px;">',
        `<span style="font-size:smaller;">Rename-${currentsheet}</span><br>`,
        '<span style="font-size:smaller;">Please ensure that you DO NOT have ANY spaces in the sheet name.</span>',
        `<input type="text" id="newSheetName" style="width:380px;" value="${currentsheet}"><br>`,
        '</div>',
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">',
        '<input type="button" value="Submit" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetSubmit();">&nbsp;',
        '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetHide();">',
        '</div>'
    ].join('');

    SocialCalc.WorkBookControlCreateDialog(control, control.renameDialogId, dialogContent, "rename");

    // Focus the input field
    setTimeout(() => {
        let nameInput = document.getElementById("newSheetName");
        if (nameInput) {
            nameInput.focus();
            SocialCalc.CmdGotFocus(nameInput);
        }
    }, 100);
};

/**
 * Hide rename sheet dialog
 * @returns {void}
 */
SocialCalc.WorkBookControlRenameSheetHide = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let dialogElement = document.getElementById(control.renameDialogId);

    if (!dialogElement) return;

    dialogElement.innerHTML = "";
    SocialCalc.DragUnregister(dialogElement);
    SocialCalc.KeyboardFocus();

    if (dialogElement.parentNode) {
        dialogElement.parentNode.removeChild(dialogElement);
    }
};

/**
 * Submit rename sheet action
 * @returns {void}
 */
SocialCalc.WorkBookControlRenameSheetSubmit = function () {
    let nameInput = document.getElementById("newSheetName");
    if (!nameInput || !nameInput.value.trim()) {
        nameInput?.focus();
        return;
    }

    let control = SocialCalc.GetCurrentWorkBookControl();
    let oldname = control.currentSheetButton.value;
    let newname = nameInput.value.trim();

    // Validate no spaces
    if (newname.includes(" ")) {
        alert("A space was found in the new name. Please ensure that the new name has no spaces");
        return;
    }

    SocialCalc.WorkBookControlRenameSheetHide();

    // Check for name conflicts (case-insensitive)
    let normalizedNewName = newname.toLowerCase();
    for (let sheetKey in workbook.sheetArr) {
        let existingName = workbook.sheetArr[sheetKey].sheet.sheetname;
        if (existingName.toLowerCase() === normalizedNewName) {
            alert(`${newname} already exists`);
            return;
        }
    }

    // Update sheet name
    control.currentSheetButton.value = normalizedNewName;
    SocialCalc.SheetBarButtonSetName(control.currentSheetButton.id, newname);

    // Perform rename for formula references
    control.workbook.RenameWorkBookSheet(oldname, normalizedNewName, control.currentSheetButton.id);

    // Broadcast rename command
    let cmdstr = `rensheet ${control.currentSheetButton.id} ${oldname} ${newname}`;
    SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr,
    });
};

/**
 * Rename sheet remotely (from another user/session)
 * @param {string} sheetid - Sheet ID to rename
 * @param {string} oldname - Current sheet name
 * @param {string} newname - New sheet name
 * @returns {void}
 */
SocialCalc.WorkBookControlRenameSheetRemote = function (sheetid, oldname, newname) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let renameButton = document.getElementById(sheetid);

    if (renameButton) {
        renameButton.value = newname;
        SocialCalc.SheetBarButtonSetName(sheetid, newname);
        control.workbook.RenameWorkBookSheet(oldname, newname, sheetid);
    }
};

/**
 * Create a new workbook by resetting to single default sheet
 * @returns {void}
 */
SocialCalc.WorkBookControlCreateNewBook = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    
    if (!control || !control.workbook) {
        console.error("Workbook control not properly initialized");
        return;
    }
    
    // If no current sheet button exists, create a default one
    if (!control.currentSheetButton) {
        console.warn("No current sheet button found, creating default sheet");
        SocialCalc.WorkBookControlAddSheet(false);
        return; // Exit and let the default sheet be created
    }
    
    if (!control.sheetButtonArr) {
        console.error("Sheet button array not initialized");
        return;
    }

    // Delete all sheets except current one
    let sheetsToDelete = Object.keys(control.sheetButtonArr)
        .filter(sheetId => sheetId !== control.currentSheetButton.id);

    sheetsToDelete.forEach(sheetId => {
        let sheetButton = control.sheetButtonArr[sheetId];
        control.workbook.DeleteWorkBookSheet(sheetButton.id, sheetButton.value);
    });

    // Reset the remaining sheet
    control.workbook.LoadRenameWorkBookSheet(
        control.currentSheetButton.id,
        "",
        control.workbook.defaultsheetname
    );

    // Remove all buttons except current one
    let sheetContainer = document.getElementById("fooBar");
    let sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");

    sheetsToDelete.forEach(sheetId => {
        let button = document.getElementById(sheetId);
        let sheetbarButton = document.getElementById(`sbsb-${sheetId}`);

        if (button) {
            sheetContainer.removeChild(button);
            delete control.sheetButtonArr[sheetId];
        }

        if (sheetbarButton) {
            sheetbar.removeChild(sheetbarButton);
        }

        control.numSheets -= 1;
    });

    // Rename the remaining button
    control.currentSheetButton.value = control.workbook.defaultsheetname;
};

/**
 * Create new workbook and render
 * @returns {void}
 */
SocialCalc.WorkBookControlNewBook = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlCreateNewBook();
    control.workbook.RenderWorkBookSheet();
};

/**
 * Move sheet in specified direction
 * @param {string} direction - Direction to move ("left" or "right")
 * @returns {void}
 */
SocialCalc.WorkBookControlMove = function (direction) {
    let control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    let { sheetButtonArr } = control;
    let sheetid = control.currentSheetButton.id;
    let currentButton = document.getElementById(sheetid);
    let currentSheetBarButton = document.getElementById(`sbsb-${sheetid}`);

    // Find sibling button
    let siblingButton = direction === "left"
        ? currentButton.previousSibling
        : currentButton.nextSibling;
    let siblingSheetBarButton = direction === "left"
        ? currentSheetBarButton.previousSibling
        : currentSheetBarButton.nextSibling;

    if (!siblingSheetBarButton) {
        let directionText = direction === "left" ? "leftmost" : "rightmost";
        alert(`Cannot move ${directionText} Sheet further to the ${direction}`);
        return;
    }

    let currentId = sheetid;
    let siblingId = siblingButton.id;
    let parent = currentButton.parentNode;
    let sheetBarParent = currentSheetBarButton.parentNode;

    // Clone and remove all buttons
    let clonedButtons = {};
    let clonedSheetBarButtons = {};

    for (let buttonId in sheetButtonArr) {
        clonedButtons[buttonId] = document.getElementById(buttonId);
        clonedSheetBarButtons[buttonId] = document.getElementById(`sbsb-${buttonId}`);

        parent.removeChild(clonedButtons[buttonId]);
        sheetBarParent.removeChild(clonedSheetBarButtons[buttonId]);
    }

    // Rebuild button array in new order
    let newSheetButtonArr = {};

    for (let buttonId in sheetButtonArr) {
        if (buttonId !== currentId && buttonId !== siblingId) {
            newSheetButtonArr[buttonId] = sheetButtonArr[buttonId];
            parent.appendChild(clonedButtons[buttonId]);
            sheetBarParent.appendChild(clonedSheetBarButtons[buttonId]);
        } else if (buttonId === currentId) {
            if (direction === "left") {
                newSheetButtonArr[currentId] = sheetButtonArr[currentId];
                newSheetButtonArr[siblingId] = sheetButtonArr[siblingId];
                parent.appendChild(clonedButtons[currentId]);
                parent.appendChild(clonedButtons[siblingId]);
                sheetBarParent.appendChild(clonedSheetBarButtons[currentId]);
                sheetBarParent.appendChild(clonedSheetBarButtons[siblingId]);
            } else {
                newSheetButtonArr[siblingId] = sheetButtonArr[siblingId];
                newSheetButtonArr[currentId] = sheetButtonArr[currentId];
                parent.appendChild(clonedButtons[siblingId]);
                parent.appendChild(clonedButtons[currentId]);
                sheetBarParent.appendChild(clonedSheetBarButtons[siblingId]);
                sheetBarParent.appendChild(clonedSheetBarButtons[currentId]);
            }
        }
    }

    control.sheetButtonArr = newSheetButtonArr;
    SocialCalc.SheetBarButtonActivate(currentId, true);
};

/**
 * Move sheet left
 * @returns {void}
 */
SocialCalc.WorkBookControlMoveLeft = function () {
    SocialCalc.WorkBookControlMove("left");
};

/**
 * Move sheet right
 * @returns {void}
 */
SocialCalc.WorkBookControlMoveRight = function () {
    SocialCalc.WorkBookControlMove("right");
};

/**
 * Copy current sheet to clipboard
 * @returns {void}
 */
SocialCalc.WorkBookControlCopySheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    control.workbook.CopyWorkBookSheet(control.currentSheetButton.id);
    alert(`Copied sheet: ${control.currentSheetButton.value}`);
};

/**
 * Paste sheet from clipboard
 * @returns {void}
 */
SocialCalc.WorkBookControlPasteSheet = function () {
    let control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    let oldId = control.currentSheetButton.id;
    SocialCalc.WorkBookControlAddSheet(false);
    let newId = control.currentSheetButton.id;

    control.workbook.PasteWorkBookSheet(newId, oldId);

    // Broadcast paste command
    SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr: "addsheetstr",
        sheetstr: control.workbook.clipsheet.savestr,
    });
};

/**
 * SheetBar class - manages the sheet bar interface
 * @constructor
 */
SocialCalc.SheetBar = function () {
    /** @type {HTMLElement} */
    this.baseDiv = document.getElementById("SocialCalc-sheetbar");

    // Create pre-buttons section
    this.prebuttonsDiv = document.createElement("div");
    this.prebuttonsDiv.style.cssText = "display:inline;";
    this.prebuttonsDiv.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    this.prebuttonsDiv.id = "SocialCalc-sheetbar-prebuttons";

    // Create buttons container
    this.buttonsDiv = document.createElement("div");
    this.buttonsDiv.id = "SocialCalc-sheetbar-buttons";
    this.buttonsDiv.style.cssText = "display:inline;";

    // Create button actions section
    this.buttonActionsDiv = document.createElement("div");
    this.buttonActionsDiv.id = "SocialCalc-sheetbar-buttonactions";
    this.buttonActionsDiv.style.display = "inline";

    // Add button for adding new sheets
    let addButton = new SocialCalc.SheetBarSheetButton(
        "sbsba-add",
        "sbsba-add",
        this.buttonActionsDiv,
        {},
        {
            MouseDown: () => SocialCalc.WorkBookControlAddSheet(true),
        },
        "add-2.png"
    );

    // Append all sections to base div
    this.baseDiv.appendChild(this.prebuttonsDiv);
    this.baseDiv.appendChild(this.buttonsDiv);
    this.baseDiv.appendChild(this.buttonActionsDiv);
};

/**
 * SheetBarSheetButton class - represents a sheet button in the sheet bar
 * @constructor
 * @param {string} id - Button ID
 * @param {string} name - Button name/label
 * @param {HTMLElement} parentdiv - Parent container element
 * @param {object} params - Button styling parameters
 * @param {object} functions - Button event handlers
 * @param {string} [img] - Optional image filename
 */
SocialCalc.SheetBarSheetButton = function (id, name, parentdiv, params, functions, img) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.name = name;

    if (!img) {
        // Text button with dropdown image
        this.ele.innerHTML = name;
        this.ele.style.cssText = "font-size:small;display:inline;padding:5px 5px 2px 5px;border:1px solid #000;";

        let imgele = document.createElement("img");
        imgele.id = `${id}-img`;
        imgele.src = `${SocialCalc.Constants.defaultImagePrefix}menu-dropdown.png`;
        imgele.style.cssText = "padding:0px 2px;width:16px;height:16px;vertical-align:middle;";

        this.ele.appendChild(imgele);
        SocialCalc.ButtonRegister(this.ele, params, functions);
        SocialCalc.ButtonRegister(imgele, params, functions);
    } else {
        // Icon-only button
        let imgele = document.createElement("img");
        imgele.src = `${SocialCalc.Constants.defaultImagePrefix}${img}`;
        imgele.style.cssText = "width:16px;height:16px;vertical-align:middle;";

        this.ele.appendChild(imgele);
        this.ele.style.cssText = "display:inline;padding:5px 5px 2px 5px;";
        SocialCalc.ButtonRegister(imgele, params, functions);
    }

    parentdiv.appendChild(this.ele);
};

/**
 * Activate or deactivate a sheet bar button
 * @param {string} id - Sheet ID
 * @param {boolean} active - Whether to activate the button
 * @returns {void}
 */
SocialCalc.SheetBarButtonActivate = function (id, active, retryCount = 0) {
    if (!id) {
        console.error("SheetBarButtonActivate: No id provided");
        return;
    }

    let sbbutton = document.getElementById(`sbsb-${id}`);
    if (!sbbutton) {
        if (retryCount < 5) {
            // Retry after a short delay if element not found
            console.warn(`SheetBarButtonActivate: Element with id 'sbsb-${id}' not found, retrying... (${retryCount + 1}/5)`);
            setTimeout(() => {
                SocialCalc.SheetBarButtonActivate(id, active, retryCount + 1);
            }, 150);
            return;
        } else {
            console.warn(`SheetBarButtonActivate: Element with id 'sbsb-${id}' not found after 5 retries`);
            return;
        }
    }

    // Additional safety check for the style property
    if (!sbbutton || !sbbutton.style) {
        console.warn(`SheetBarButtonActivate: Element 'sbsb-${id}' is null or has no style property`);
        return;
    }

    sbbutton.isactive = active;

    try {
        if (active) {
            if (sbbutton && sbbutton.style) {
                sbbutton.style.backgroundColor = "#FFF";
            }

            let imgele = document.getElementById(`sbsb-${id}-img`);
            if (!imgele) {
                imgele = document.createElement("img");
                imgele.id = `sbsb-${id}-img`;
                imgele.src = `${SocialCalc.Constants.defaultImagePrefix}menu-dropdown.png`;
                imgele.style.cssText = "padding:0px 2px;width:16px;height:16px;vertical-align:middle;";

                SocialCalc.ButtonRegister(imgele, {}, {
                    MouseDown: () => SocialCalc.SheetBarSheetButtonPress(id),
                    Repeat: () => { },
                    Disabled: () => { },
                });
            }

            if (imgele && sbbutton && sbbutton.appendChild) {
                sbbutton.appendChild(imgele);
            }
        } else {
            if (sbbutton && sbbutton.style) {
                sbbutton.style.backgroundColor = "#CCC";
            }
            let imgele = document.getElementById(`sbsb-${id}-img`);
            if (imgele && sbbutton && sbbutton.removeChild) {
                try {
                    sbbutton.removeChild(imgele);
                } catch (removeError) {
                    console.warn(`Could not remove image element for ${id}:`, removeError);
                }
            }
        }
    } catch (error) {
        console.error(`Error in SheetBarButtonActivate for ${id}:`, error);
    }

    // Hide menu if visible
    let menu = document.getElementById("sbsb-menu");
    if (menu && menu.style && menu.style.display !== "none") {
        menu.style.display = "none";
    }
};

/**
 * Set the name/label of a sheet bar button
 * @param {string} id - Sheet ID
 * @param {string} name - New name for the button
 * @returns {void}
 */
SocialCalc.SheetBarButtonSetName = function (id, name) {
    let sbbutton = document.getElementById(`sbsb-${id}`);
    if (!sbbutton) return;

    sbbutton.name = name;
    sbbutton.innerHTML = name;

    if (sbbutton.isactive) {
        SocialCalc.SheetBarButtonActivate(id, true);
    }
};

/**
 * Handle sheet bar button press events
 * @param {string} id - Sheet ID
 * @returns {void}
 */
SocialCalc.SheetBarSheetButtonPress = function (id) {
    let sbbutton = document.getElementById(`sbsb-${id}`);
    if (!sbbutton) return;

    if (sbbutton.isactive) {
        // Show/hide context menu for active button
        let menu = document.getElementById("sbsb-menu");
        if (!menu) {
            menu = new SocialCalc.SheetBarSheetButtonMenu("sbsb-menu", id);
        } else {
            menu.clickedsheetid = id;
            let isVisible = menu.style.display !== "none";
            menu.style.display = isVisible ? "none" : "inline";

            if (!isVisible) {
                SocialCalc.SheetBarSheetButtonMenuPosition(menu, id);
            }
        }
    } else {
        // Activate inactive button
        SocialCalc.WorkBookControlActivateSheet(id);
    }
};

/**
 * SheetBarSheetButtonMenuItem class - represents a menu item in sheet button context menu
 * @constructor
 * @param {string} id - Menu item ID
 * @param {string} text - Menu item text
 * @returns {HTMLElement} Created menu item element
 */
SocialCalc.SheetBarSheetButtonMenuItem = function (id, text) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.innerHTML = text;
    this.ele.className = "";
    this.ele.style.cssText = "padding:3px 4px;width:100px;height:20px;background-color:#FFF;";

    let params = {
        normalstyle: "backgroundColor:#FFF;",
        downstyle: "backgroundColor:#CCC;",
        hoverstyle: "backgroundColor:#CCC;",
    };

    let functions = {
        MouseDown: () => SocialCalc.SheetBarMenuItemPress(id),
        Repeat: () => { },
        Disabled: () => { },
    };

    SocialCalc.ButtonRegister(this.ele, params, functions);
    SocialCalc.TouchRegister(this.ele, { SingleTap: functions.MouseDown });

    return this.ele;
};
/**
 * Handle sheet bar menu item press events
 * @param {string} id - Menu item ID
 * @returns {void}
 */
SocialCalc.SheetBarMenuItemPress = function (id) {
    let menu = document.getElementById("sbsb-menu");
    if (!menu) return;

    let clickedsheetid = menu.clickedsheetid;

    // Define menu action handlers
    let menuActions = {
        "sbsb_deletesheet": () => SocialCalc.WorkBookControlDelSheet(),
        "sbsb_hidesheet": () => SocialCalc.WorkBookControlHideSheet(),
        "sbsb_unhidesheet": () => SocialCalc.WorkBookControlUnhideSheet(),
        "sbsb_copysheet": () => SocialCalc.WorkBookControlCopySheet(),
        "sbsb_moveleft": () => SocialCalc.WorkBookControlMoveLeft(),
        "sbsb_moveright": () => SocialCalc.WorkBookControlMoveRight(),
        "sbsb_pastesheet": () => SocialCalc.WorkBookControlPasteSheet(),
        "sbsb_renamesheet": () => SocialCalc.WorkBookControlRenameSheet(),
        "sbsb_closemenu": () => { }, // Just close menu, no additional action
    };

    // Execute action if it exists
    let action = menuActions[id];
    if (action) {
        action();
    }

    // Always hide menu after action
    if (menu && menu.style) {
        menu.style.display = "none";
    }
};

/**
 * SheetBarSheetButtonMenu class - creates context menu for sheet buttons
 * @constructor
 * @param {string} id - Menu element ID
 * @param {string} clickedsheetid - ID of the sheet that was clicked
 */
SocialCalc.SheetBarSheetButtonMenu = function (id, clickedsheetid) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.className = "";
    this.ele.clickedsheetid = clickedsheetid;
    this.ele.style.cssText = "border:1px solid #000;position:absolute;top:200px;left:0px;width:100px;z-index:120;";

    // Define menu items
    let menuItems = [
        { id: "sbsb_deletesheet", text: " Delete Sheet" },
        { id: "sbsb_hidesheet", text: " Hide Sheet " },
        { id: "sbsb_unhidesheet", text: " Unhide Sheet " },
        { id: "sbsb_renamesheet", text: " Rename Sheet " },
        { id: "sbsb_moveleft", text: " Move Left " },
        { id: "sbsb_moveright", text: " Move Right " },
        { id: "sbsb_copysheet", text: " Copy Sheet " },
        { id: "sbsb_pastesheet", text: " Paste Sheet " },
        { id: "sbsb_closemenu", text: " Cancel" },
    ];

    // Create and append menu items
    menuItems.forEach(item => {
        let menuItem = new SocialCalc.SheetBarSheetButtonMenuItem(item.id, item.text);
        this.ele.appendChild(menuItem);
    });

    // Position the menu
    SocialCalc.SheetBarSheetButtonMenuPosition(this.ele, clickedsheetid);

    // Add to DOM
    let control = SocialCalc.GetCurrentWorkBookControl();
    control.workbook.spreadsheet.editor.toplevel.appendChild(this.ele);
};

/**
 * Position the sheet menu relative to the clicked button
 * @param {HTMLElement} menu - Menu element to position
 * @param {string} clickedsheetid - ID of the clicked sheet
 * @returns {void}
 */
SocialCalc.SheetBarSheetButtonMenuPosition = function (menu, clickedsheetid) {
    let hlessbutton = document.getElementById("te_lessbuttonh");
    let sbbutton = document.getElementById(`sbsb-${clickedsheetid}`);

    if (hlessbutton && sbbutton) {
        let top = parseInt(hlessbutton.style.top, 10) - 220;
        let left = sbbutton.offsetLeft + 7;

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
    }
};

/**
 * Script information storage and management
 * @namespace
 */
SocialCalc.ScriptInfo = {
    /** @type {object.<string, string>} */
    scripts: {},
    /** @type {number|null} */
    handle: null,
};

/**
 * Check for and extract scripts from cell text
 * @param {string} sheetid - Sheet ID
 * @param {string} coord - Cell coordinate
 * @param {string} text - Cell text content
 * @returns {void}
 */
SocialCalc.ScriptCheck = function (sheetid, coord, text) {
    let commentStart = text.indexOf("<!--script");
    let commentEnd = text.indexOf("script-->");

    if (commentStart !== -1 && commentEnd !== -1) {
        let script = text.slice(commentStart + 10, commentEnd);
        SocialCalc.ScriptInfo.scripts[coord] = script;

        if (SocialCalc.ScriptInfo.handle === null) {
            SocialCalc.ScriptInfo.handle = window.setTimeout(SocialCalc.EvalUserScripts, 500);
        }
    }
};

/**
 * Evaluate a user script by injecting it into the DOM
 * @param {string} data - Script code to evaluate
 * @returns {void}
 */
SocialCalc.EvalUserScript = function (data) {
    if (!data.trim()) return;

    let head = document.getElementsByTagName("head")[0] || document.documentElement;
    let script = document.createElement("script");
    script.type = "text/javascript";

    try {
        script.appendChild(document.createTextNode(data));
    } catch (e) {
        // IE compatibility: use text property instead
        script.text = data;
    }

    head.insertBefore(script, head.firstChild);
    head.removeChild(script);
};

/**
 * Evaluate all accumulated user scripts
 * @returns {void}
 */
SocialCalc.EvalUserScripts = function () {
    for (let coord in SocialCalc.ScriptInfo.scripts) {
        SocialCalc.EvalUserScript(SocialCalc.ScriptInfo.scripts[coord]);
    }

    // Reset script info
    SocialCalc.ScriptInfo.handle = null;
    SocialCalc.ScriptInfo.scripts = {};
};

/**
 * Callback for rendering cells - checks for HTML content and scripts
 * @param {SocialCalc.Sheet} sheetobj - Sheet object
 * @param {string} value - Cell value
 * @param {string} cr - Cell coordinate
 * @returns {void}
 */
SocialCalc.CallOutOnRenderCell = function (sheetobj, value, cr) {
    let cell = sheetobj.cells[cr];
    if (!cell) return;

    let valuetype = (cell.valuetype || "").charAt(0);
    let sheetattribs = sheetobj.attribs;

    if (valuetype === "t") {
        let valueformat = sheetobj.valueformats[cell.textvalueformat - 0] ||
            sheetobj.valueformats[sheetattribs.defaulttextvalueformat - 0] ||
            "";

        if (valueformat === "text-html") {
            SocialCalc.ScriptCheck(sheetobj.sheetid, cr, value);
        }
    }
};

/**
 * Get cell data value, supports cross-sheet references
 * @param {string} coord - Cell coordinate, optionally prefixed with sheet name (e.g., "Sheet1!A1")
 * @returns {string|number} Cell data value or 0 if not found
 */
SocialCalc.GetCellDataValue = function (coord) {
    let sheetname = null;
    let sheetid = "";

    let bangIndex = coord.indexOf("!");
    if (bangIndex !== -1) {
        sheetname = coord.slice(0, bangIndex);
        coord = coord.slice(bangIndex + 1);
    }

    let control = SocialCalc.GetCurrentWorkBookControl();

    if (sheetname === null) {
        sheetid = control.currentSheetButton.id;
    } else {
        sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
    }

    if (!sheetid) {
        return "0";
    }

    let sheetobj = control.workbook.sheetArr[sheetid].sheet;
    let cell = sheetobj.cells[coord];

    return cell ? cell.datavalue : 0;
};

/**
 * Get array of cell data values from comma-separated coordinates
 * @param {string} coordstr - Comma-separated list of coordinates
 * @param {string|null} sheetname - Optional sheet name prefix
 * @returns {Array} Array of cell values
 */
SocialCalc.GetCellDataArray = function (coordstr, sheetname) {
    let coords = coordstr.split(",");
    let sheetPrefix = sheetname ? `${sheetname}!` : "";

    return coords.map(coord =>
        SocialCalc.GetCellDataValue(`${sheetPrefix}${coord}`)
    );
};

/**
 * User script data storage
 * @type {object}
 */
SocialCalc.UserScriptData = {};

/**
 * Workbook recalculation information
 * @namespace
 */
SocialCalc.WorkBookRecalculateInfo = {
    /** @type {Array<string>} */
    sheets: [],
    /** @type {Array<string>} */
    calcorder: [],
    /** @type {number} */
    current: 0,
    /** @type {number} */
    pass: 0,
};

/**
 * Recalculate all sheets in the workbook
 * @returns {void}
 */
SocialCalc.WorkBookRecalculateAll = function () {
    // If already in the middle of a recalculate-all, ignore this
    let info = SocialCalc.WorkBookRecalculateInfo;
    if (info.current !== 0 || info.calcorder.length !== 0 || info.sheets.length !== 0) {
        return;
    }

    let control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state !== "start") {
        return;
    }

    info.current = 0;
    info.sheets = Object.keys(control.workbook.sheetArr);

    // Reverse order for calculation
    info.calcorder = [...info.sheets].reverse();

    setTimeout(SocialCalc.WorkBookRecalculateStep, 500);
};

/**
 * Execute one step of workbook recalculation
 * @returns {void}
 */
SocialCalc.WorkBookRecalculateStep = function () {
    let info = SocialCalc.WorkBookRecalculateInfo;

    if (info.current === info.calcorder.length) {
        // Reset state
        info.current = 0;
        info.calcorder = [];
        info.sheets = [];

        if (info.pass === 1) {
            info.pass = 0;
            SocialCalc.SpinnerWaitHide();
            return;
        } else {
            info.pass += 1;
            SocialCalc.WorkBookRecalculateAll();
            return;
        }
    }

    let control = SocialCalc.GetCurrentWorkBookControl();
    let sheetid = info.calcorder[info.current];

    SocialCalc.WorkBookControlActivateSheet(sheetid);
    info.current += 1;

    setTimeout(SocialCalc.WorkBookRecalculateStep, 1000);
};

/**
 * Create loading spinner
 * @returns {void}
 */
SocialCalc.SpinnerWaitCreate = function () {
    let existingSpinner = document.getElementById("waitloadingspinner");
    if (existingSpinner) return;

    let main = document.createElement("div");
    main.id = "waitloadingspinner";
    main.style.position = "absolute";

    let vp = SocialCalc.GetViewportInfo();
    main.style.top = `${vp.height / 2}px`;
    main.style.left = `${vp.width / 2}px`;
    main.style.zIndex = "110";
    main.style.width = "50px";
    main.style.height = "50px";
    main.innerHTML = '<img src="static/www/assets/images/spinner.gif" alt="Loading..." />';

    let control = SocialCalc.GetCurrentWorkBookControl();
    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
};

/**
 * Hide loading spinner
 * @returns {void}
 */
SocialCalc.SpinnerWaitHide = function () {
    let spinner = document.getElementById("waitloadingspinner");
    if (spinner) {
        spinner.innerHTML = "";
        if (spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
};

/**
 * Editable cells configuration
 * @namespace
 */
SocialCalc.EditableCells = {
    /** @type {boolean} */
    allow: false,
    /** @type {object.<string, boolean>} */
    cells: {},
};

/**
 * Check if a coordinate is editable
 * @param {string} sheetcoord - Sheet coordinate
 * @returns {boolean} True if editable
 */
SocialCalc.Callbacks.IsCoordEditable = function (sheetcoord) {
    if (!SocialCalc.EditableCells.allow) {
        return true; // By default all cells are editable
    }
    return Boolean(SocialCalc.EditableCells.cells[sheetcoord]);
};

/**
 * Check if current cell is editable
 * @param {SocialCalc.TableEditor} editor - Editor instance
 * @returns {boolean} True if editable
 */
SocialCalc.Callbacks.IsCellEditable = function (editor) {
    let cellname = `${editor.workingvalues.currentsheet}!${editor.ecell.coord}`;
    if (!SocialCalc.EditableCells.allow) {
        return true; // By default all cells are editable
    }
    return Boolean(SocialCalc.EditableCells.cells[cellname]);
};

/**
 * Check if scrolling is possible within bounds
 * @param {number} lastrow - Last row in sheet
 * @param {number} lastcol - Last column in sheet
 * @param {number} curr_vpos - Current vertical position
 * @param {number} curr_hpos - Current horizontal position
 * @param {number} vamount - Vertical scroll amount
 * @param {number} hamount - Horizontal scroll amount
 * @returns {boolean} True if scrolling is possible
 */
SocialCalc.IsScrollPossible = function (lastrow, lastcol, curr_vpos, curr_hpos, vamount, hamount) {
    if (curr_vpos + 10 + vamount > lastrow) {
        return false;
    }
    if (curr_hpos + hamount > lastcol) {
        return false;
    }
    return true;
};

/**
 * Toggle checkmark cell functionality
 * @param {string} cellname - Cell name to toggle
 * @returns {void}
 */
SocialCalc.Callbacks.ToggleCell = function (cellname) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let sheetid = control.currentSheetButton.id;
    let sheetobj = control.workbook.sheetArr[sheetid].sheet;
    let cell = sheetobj.cells[cellname];
    let sheetname = sheetobj.sheetname;

    // Check if cell has toggle constraint
    let constraint = SocialCalc.EditableCells.constraints?.[`${sheetname}!${cellname}`];
    if (!constraint || constraint[0] !== "tc") {
        return;
    }

    let cellInner = document.getElementById(`cell_${cellname}`);
    if (!cellInner) return;

    let checkmarkHtml = '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" height="15" width="15"></div>';
    let emptyHtml = "<div>&nbsp;</div>";

    if (cellInner.innerHTML.includes("&nbsp;")) {
        // Set to checkmark
        cellInner.innerHTML = checkmarkHtml;
        if (cell) {
            cell.displaystring = checkmarkHtml;
            cell.datavalue = checkmarkHtml;
        }
    } else {
        // Set to empty
        cellInner.innerHTML = emptyHtml;
        if (cell) {
            cell.datavalue = emptyHtml;
            cell.displaystring = emptyHtml;
        }
    }
};

/**
 * Create HTML for workbook sheets
 * @param {Array<string>|null} sheetlist - List of sheet IDs, or null for current sheet
 * @returns {string} HTML representation
 */
SocialCalc.WorkbookControlCreateSheetHTML = function (sheetlist) {
    let control = SocialCalc.GetCurrentWorkBookControl();
    let div = document.createElement("div");

    if (!sheetlist) {
        // Single sheet
        let context = new SocialCalc.RenderContext(spreadsheet.sheet);
        let ele = context.RenderSheet(null, { type: "html" });
        div.appendChild(ele);
    } else {
        // Multiple sheets
        sheetlist.forEach(sheetid => {
            let sheet = control.workbook.sheetArr[sheetid]?.sheet;
            if (!sheet) return;

            let context = new SocialCalc.RenderContext(sheet);
            let ele = context.RenderSheet(null, { type: "html" });

            // Set page break behavior
            if (sheetid.substring(5) == control.sheetCnt) {
                ele.style.pageBreakAfter = "auto";
            } else {
                ele.style.pageBreakAfter = "always";
            }

            div.appendChild(ele);
        });
    }

    return div.innerHTML;
};

// Modern JSON implementation with proper global detection
let globalThis = (() => {
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
    if (typeof self !== "undefined") return self;
    return this;
})();

if (!globalThis.JSON) {
    globalThis.JSON = {};
}

// JSON polyfill implementation (modernized)
(() => {
    let f = n => n < 10 ? `0${n}` : n;

    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf())
                ? `${this.getUTCFullYear()}-${f(this.getUTCMonth() + 1)}-${f(this.getUTCDate())}T${f(this.getUTCHours())}:${f(this.getUTCMinutes())}:${f(this.getUTCSeconds())}Z`
                : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
            return this.valueOf();
        };
    }

    let cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    let escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    let gap, indent, rep;

    let meta = {
        "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\"
    };

    let quote = string => {
        escapable.lastIndex = 0;
        return escapable.test(string)
            ? `"${string.replace(escapable, a => {
                let c = meta[a];
                return typeof c === "string" ? c : `\\u${"0000${a.charCodeAt(0).toString(16)}".slice(-4)}`;
            })}"`
            : `"${string}"`;
    };

    let str = (key, holder) => {
        let value = holder[key];

        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
            case "string": return quote(value);
            case "number": return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null": return String(value);
            case "object":
                if (!value) return "null";

                gap += indent;
                let partial = [];

                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    let length = value.length;
                    for (let i = 0; i < length; i++) {
                        partial[i] = str(i, value) || "null";
                    }

                    let v = partial.length === 0 ? "[]" : gap
                        ? `[\n${gap}${partial.join(`,\n${gap}`)}\n${gap.slice(0, -indent.length)}]`
                        : `[${partial.join(",")}]`;
                    gap = gap.slice(0, -indent.length);
                    return v;
                }

                if (rep && typeof rep === "object") {
                    let length = rep.length;
                    for (let i = 0; i < length; i++) {
                        let k = rep[i];
                        if (typeof k === "string") {
                            let v = str(k, value);
                            if (v) {
                                partial.push(`${quote(k)}${gap ? ": " : ":"}${v}`);
                            }
                        }
                    }
                } else {
                    for (let k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            let v = str(k, value);
                            if (v) {
                                partial.push(`${quote(k)}${gap ? ": " : ":"}${v}`);
                            }
                        }
                    }
                }

                let result = partial.length === 0 ? "{}" : gap
                    ? `{\n${gap}${partial.join(`,\n${gap}`)}\n${gap.slice(0, -indent.length)}}`
                    : `{${partial.join(",")}}`;
                gap = gap.slice(0, -indent.length);
                return result;
        }
    };

    if (typeof globalThis.JSON.stringify !== "function") {
        globalThis.JSON.stringify = (value, replacer, space) => {
            gap = "";
            indent = "";

            if (typeof space === "number") {
                indent = " ".repeat(Math.min(space, 10));
            } else if (typeof space === "string") {
                indent = space.slice(0, 10);
            }

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

            return str("", { "": value });
        };
    }

    if (typeof globalThis.JSON.parse !== "function") {
        globalThis.JSON.parse = (text, reviver) => {
            let walk = (holder, key) => {
                let value = holder[key];
                if (value && typeof value === "object") {
                    for (let k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            let v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            };

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, a => `\\u${"0000${a.charCodeAt(0).toString(16)}".slice(-4)}`);
            }

            if (/^[\],:{}\s]*$/.test(
                text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
            )) {
                let j = eval(`(${text})`);
                return typeof reviver === "function" ? walk({ "": j }, "") : j;
            }

            throw new SyntaxError("JSON.parse");
        };
    }
})();

// Constants and configuration
SocialCalc.oldBtnActive = 1;
SocialCalc.Constants.defaultImagePrefix = "www/assets/images/sc_";
SocialCalc.Constants.defaultGridCSS = "";
SocialCalc.Constants.SCNoColNames = true;
SocialCalc.Constants.SCNoRowName = true;
SocialCalc.Constants.defaultRownameStyle = "";
SocialCalc.Constants.defaultSelectedRownameStyle = "";
SocialCalc.Popup.imagePrefix = "www/assets/images/sc_";

/**
 * Toggle visibility of input line buttons
 * @param {boolean} show - Whether to show or hide buttons
 * @returns {void}
 */
SocialCalc.ToggleInputLineButtons = function (show) {
    let buttonElement = document.getElementById("testtest");
    if (buttonElement) {
        buttonElement.style.display = show ? "inline" : "none";
    }
};

/**
 * Clear input line text
 * @returns {void}
 */
SocialCalc.InputLineClearText = function () {
    if (typeof spreadsheet !== "undefined" && spreadsheet.editor?.inputBox) {
        spreadsheet.editor.inputBox.SetText("");
    }
};

/**
 * Broadcast callback placeholder
 * @param {string} type - Broadcast type
 * @param {*} data - Broadcast data
 * @returns {void}
 */
SocialCalc.Callbacks.broadcast = function (type, data) {
    // Implementation depends on specific broadcast mechanism
};

// Server-side compatibility
if (typeof document === "undefined") {
    // Provide no-op implementations for server environment
    let noOpFunctions = [
        "GetEditorCellElement", "ReplaceCell", "EditorRenderSheet",
        "SpreadsheetControlSortSave", "SpreadsheetControlStatuslineCallback"
    ];

    noOpFunctions.forEach(funcName => {
        SocialCalc[funcName] = () => funcName === "SpreadsheetControlSortSave" ? "" : undefined;
    });

    SocialCalc.DoPositionCalculations = function (editor) {
        SocialCalc.EditorSheetStatusCallback(null, "doneposcalc", null, editor);
    };
}

// WebWorker compatibility
if (typeof self !== "undefined" && self.thread) {
    window.setTimeout = (cb, ms) => {
        if (ms <= 1) {
            self.thread.nextTick(cb);
        }
    };
    window.clearTimeout = () => { };
}

// Module export
return SocialCalc;

});

/**
 * @fileoverview SocialCalc Table Editor Module
 * 
 * A comprehensive table editor that displays a scrolling grid with panes
 * and handles keyboard and mouse I/O for spreadsheet functionality.
 * 
 * @author Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
 * @copyright (c) Copyright 2008, 2009, 2010 Socialtext, Inc. All Rights Reserved.
 * @license Common Public Attribution License Version 1.0
 * 
 * Based in part on the SocialCalc 1.1.0 code written in Perl.
 * The SocialCalc 1.1.0 code was:
 *    Portions (c) Copyright 2005, 2006, 2007 Software Garden, Inc.
 *    All Rights Reserved.
 *    Portions (c) Copyright 2007 Socialtext, Inc.
 *    All Rights Reserved.
 * The Perl SocialCalc started as modifications to the wikiCalc(R) program, version 1.0.
 * wikiCalc 1.0 was written by Software Garden, Inc.
 * 
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
 * The Original Code is SocialCalc JavaScript TableEditor.
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
 * When the TableEditor is producing and/or controlling the display the Graphic Image must be
 * displayed on the screen visible to the user in a manner comparable to that in the
 * Original Code. The Attribution Phrase must be displayed as a "tooltip" or "hover-text" for
 * that image. The image must be linked to the Attribution URL so as to access that page
 * when clicked. If the user interface includes a prominent "about" display which includes
 * factual prominent attribution in a form similar to that in the "about" display included
 * with the Original Code, including Socialtext copyright notices and URLs, then the image
 * need not be linked to the Attribution URL but the "tool-tip" is still required.
 * 
 * Attribution Copyright Notice:
 * 
 * Copyright (C) 2010 Socialtext, Inc.
 * All Rights Reserved.
 * 
 * Attribution Phrase (not exceeding 10 words): SocialCalc
 * 
 * Attribution URL: http://www.socialcalc.org/xoattrib
 * 
 * Graphic Image: The contents of the sc-logo.gif file in the Original Code or
 * a suitable replacement from http://www.socialcalc.org/licenses specified as
 * being for SocialCalc.
 * 
 * Display of Attribution Information is required in Larger Works which are defined
 * in the CPAL as a work which combines Covered Code or portions thereof with code
 * not governed by the terms of the CPAL.
 */

/**
 * @namespace SocialCalc
 * @description Main SocialCalc namespace object
 */
let SocialCalc = globalThis.SocialCalc || {};

/**
 * @description Table Editor class for SocialCalc
 * 
 * The main class that provides table editing functionality with scrolling grid,
 * panes, and keyboard/mouse I/O handling.
 */

/**
 * TableEditor Constructor
 * 
 * Creates a new table editor instance with the specified editing context.
 * 
 * @class
 * @param {Object} context - The editing context for this table editor
 * @constructor
 */
SocialCalc.TableEditor = function (context) {
    let scc = SocialCalc.Constants;

    /**
     * @description Core Properties
     */
    
    /** @type {Object} The editing context */
    this.context = context;
    
    /** @type {HTMLElement|null} Top level HTML element for this table editor */
    this.toplevel = null;
    
    /** @type {Object|null} Rendered editing context */
    this.fullgrid = null;

    /** @type {boolean} If true, disable all edit UI and make read-only */
    this.noEdit = false;

    /**
     * @description Dimension Properties
     */
    
    /** @type {number|null} Editor width */
    this.width = null;
    
    /** @type {number|null} Table width */
    this.tablewidth = null;
    
    /** @type {number|null} Editor height */
    this.height = null;
    
    /** @type {number|null} Table height */
    this.tableheight = null;

    /**
     * @description UI Element Properties
     */
    
    /** @type {HTMLElement|null} Input box element */
    this.inputBox = null;
    
    /** @type {Object|null} Input echo element */
    this.inputEcho = null;
    
    /** @type {Object|null} Vertical table control */
    this.verticaltablecontrol = null;
    
    /** @type {Object|null} Horizontal table control */
    this.horizontaltablecontrol = null;

    /** @type {HTMLElement|null} Logo element */
    this.logo = null;

    /** @type {Object|null} Cell handles */
    this.cellhandles = null;

    /**
     * @description Dynamic Properties
     */
    
    /** @type {number|null} Timer id for position calculations */
    this.timeout = null;
    
    /** @type {boolean} True when executing command, calculating, etc. */
    this.busy = false;
    
    /** @type {boolean} If true, ensure ecell is visible after timeout */
    this.ensureecell = false;
    
    /** @type {Array<Object>} Commands to execute after busy, in form: {cmdstr: "cmds", saveundo: t/f} */
    this.deferredCommands = [];

    /**
     * @description Position Properties
     */
    
    /** @type {Object|null} Screen coords of full grid */
    this.gridposition = null;
    
    /** @type {Object|null} Screen coords of upper left of grid within header rows */
    this.headposition = null;
    
    /** @type {number|null} Row number of top row in last (the scrolling) pane */
    this.firstscrollingrow = null;
    
    /** @type {number|null} Position of top row in last (the scrolling) pane */
    this.firstscrollingrowtop = null;
    
    /** @type {number|null} Row number of last displayed row in last non-scrolling pane, or zero */
    this.lastnonscrollingrow = null;
    
    /** @type {number|null} Used for paging down */
    this.lastvisiblerow = null;
    
    /** @type {number|null} Column number of top col in last (the scrolling) pane */
    this.firstscrollingcol = null;
    
    /** @type {number|null} Position of top col in last (the scrolling) pane */
    this.firstscrollingcolleft = null;
    
    /** @type {number|null} Col number of last displayed column in last non-scrolling pane, or zero */
    this.lastnonscrollingcol = null;
    
    /** @type {number|null} Used for paging right */
    this.lastvisiblecol = null;

    /**
     * @description Grid Calculation Properties
     */
    
    /** @type {Array<number>} Screen positions of the top of some rows */
    this.rowpositions = [];
    
    /** @type {Array<number>} Screen positions of the left side of some rows */
    this.colpositions = [];
    
    /** @type {Array<number>} Size in pixels of each row when last checked, for page up */
    this.rowheight = [];
    
    /** @type {Array<number>} Size in pixels of each column when last checked, for page left */
    this.colwidth = [];

    /**
     * @description Cell and State Properties
     */
    
    /** @type {Object|null} Either null or {coord: c, row: r, col: c} */
    this.ecell = null;
    
    /** @type {string} The keyboard states: see EditorProcessKey */
    this.state = "start";

    /** @type {Object} Values used during keyboard editing, etc. */
    this.workingvalues = {};

    /**
     * @description Configuration Constants
     */
    
    /** @type {string} URL prefix for images */
    this.imageprefix = scc.defaultImagePrefix;
    
    /** @type {string} ID prefix for table editor elements */
    this.idPrefix = scc.defaultTableEditorIDPrefix;
    
    /** @type {number} Number of rows to move cursor on PgUp/PgDn keys */
    /** @type {number} Number of rows to move cursor on PgUp/PgDn keys */
    this.pageUpDnAmount = scc.defaultPageUpDnAmount;

    /**
     * @description Callback Functions
     */

    /**
     * Recalculation function: called to perform sheet recalculation
     * Default implementation calls the sheet's RecalcSheet method
     * 
     * @type {Function}
     * @param {SocialCalc.TableEditor} editor - The table editor instance
     * @returns {null|Object} Result of recalculation or null
     */
    this.recalcFunction = (editor) => {
        if (editor.context.sheetobj.RecalcSheet) {
            editor.context.sheetobj.RecalcSheet(
                SocialCalc.EditorSheetStatusCallback,
                editor
            );
        } else {
            return null;
        }
    };

    /**
     * Control key function: handles ctrl-key combinations at top level
     * Returns true for continued processing or false to stop processing
     * 
     * @type {Function}
     * @param {SocialCalc.TableEditor} editor - The table editor instance
     * @param {string} charname - The character name of the key combination
     * @returns {boolean} True to continue processing, false to stop
     */
    this.ctrlkeyFunction = (editor, charname) => {
        let ta, ha, cell, position, cmd, sel, cliptext;

        switch (charname) {
            case "[ctrl-c]":
            case "[ctrl-x]":
                ta = editor.pasteTextarea;
                ta.value = "";
                cell = SocialCalc.GetEditorCellElement(
                    editor,
                    editor.ecell.row,
                    editor.ecell.col
                );
                if (cell) {
                    position = SocialCalc.GetElementPosition(cell.element);
                    ta.style.left = position.left - 1 + "px";
                    ta.style.top = position.top - 1 + "px";
                }
                if (editor.range.hasrange) {
                    sel = `${SocialCalc.crToCoord(editor.range.left, editor.range.top)}:${SocialCalc.crToCoord(editor.range.right, editor.range.bottom)}`;
                } else {
                    sel = editor.ecell.coord;
                }

                // Get what to copy to clipboard
                cliptext = SocialCalc.ConvertSaveToOtherFormat(
                    SocialCalc.CreateSheetSave(editor.context.sheetobj, sel),
                    "tab"
                );

                if (
                    charname === "[ctrl-c]" ||
                    editor.noEdit ||
                    (SocialCalc.Callbacks.IsCellEditable &&
                        !SocialCalc.Callbacks.IsCellEditable(editor))
                ) {
                    // If copy or cut but in no edit mode
                    cmd = `copy ${sel} formulas`;
                } else {
                    // [ctrl-x]
                    cmd = `cut ${sel} formulas`;
                }
                
                // Queue up command to put on SocialCalc clipboard
                editor.EditorScheduleSheetCommands(cmd, true, false);

                ta.style.display = "block";
                ta.value = cliptext; // Must follow "block" setting for Webkit
                ta.focus();
                ta.select();
                
                window.setTimeout(() => {
                    if (!SocialCalc.GetSpreadsheetControlObject) return; // In case not loaded
                    let s = SocialCalc.GetSpreadsheetControlObject();
                    if (!s) return;
                    let currentEditor = s.editor;
                    let textArea = currentEditor.pasteTextarea;
                    textArea.blur();
                    textArea.style.display = "none";
                    SocialCalc.KeyboardFocus();
                }, 200);

                return true;

            case "[ctrl-v]":
                if (editor.noEdit) return true; // Not if no edit
                if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
                    if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
                        return true;
                    }
                }

                let showPasteTextArea = () => {
                    ta = editor.pasteTextarea;
                    ta.value = "";

                    cell = SocialCalc.GetEditorCellElement(
                        editor,
                        editor.ecell.row,
                        editor.ecell.col
                    );
                    if (cell) {
                        position = SocialCalc.GetElementPosition(cell.element);
                        ta.style.left = position.left - 1 + "px";
                        ta.style.top = position.top - 1 + "px";
                    }
                    ta.style.display = "block";
                    ta.value = ""; // Must follow "block" setting for Webkit
                    ta.focus();
                };

                ha = editor.pasteHTMLarea;
                if (ha) {
                    /* Pasting via HTML - Currently IE only */
                    ha.style.visibility = "visible";
                    ha.focus();
                } else {
                    showPasteTextArea();
                }
                
                window.setTimeout(() => {
                    if (!SocialCalc.GetSpreadsheetControlObject) return;
                    let s = SocialCalc.GetSpreadsheetControlObject();
                    if (!s) return;
                    let currentEditor = s.editor;
                    let value = null;
                    let isPasteSameAsClipboard = false;

                    ha = currentEditor.pasteHTMLarea;
                    if (ha) {
                        /* IE: We append a U+FFFC to every TD that's not the last of its row,
                         *     then we obtain innerText, then turn U+FFFC back to \t,
                         *     thereby preserving the cell separations (which gets discarded
                         *     if we simply paste via textarea.
                         */
                        let _ObjectReplacementCharacter_ = String.fromCharCode(0xfffc);
                        let html = ha.innerHTML;

                        if (html.search(/<(?![Bb][Rr])[A-Za-z]/) >= 0) {
                            /* HTML Paste: Mark TDs with U+FFFC accordingly.. */
                            ha.innerHTML = html.replace(
                                /(?:<\/[Tt][Dd]>)/g,
                                _ObjectReplacementCharacter_
                            );
                        } else {
                            /* Text Paste: In IE, \t is transformed into &nbsp;, so replace them with U+FFFC. */
                            ha.innerHTML = html.replace(
                                /&[Nn][Bb][Ss][Pp];/g,
                                _ObjectReplacementCharacter_
                            );
                        }

                        value = ha.innerText.replace(
                            new RegExp(_ObjectReplacementCharacter_, "g"),
                            "\t"
                        );

                        ha.innerHTML = "";
                        ha.blur();
                        ha.style.visibility = "hidden";
                    } else {
                        let textArea = currentEditor.pasteTextarea;
                        value = textArea.value;
                        textArea.blur();
                        textArea.style.display = "none";
                    }

                    value = value.replace(/\r\n/g, "\n").replace(/\n?$/, "\n");
                    let clipstr = SocialCalc.ConvertSaveToOtherFormat(
                        SocialCalc.Clipboard.clipboard,
                        "tab"
                    );
                    if (
                        value === clipstr ||
                        (value.length - clipstr.length === 1 &&
                            value.substring(0, value.length - 1) === clipstr)
                    ) {
                        isPasteSameAsClipboard = true;
                    }

                    let cmdStr = "";
                    // Pastes SocialCalc clipboard if did a Ctrl-C and contents still the same
                    // Webkit adds an extra blank line, so need to allow for that
                    if (!isPasteSameAsClipboard) {
                        cmdStr = `loadclipboard ${SocialCalc.encodeForSave(
                            SocialCalc.ConvertOtherFormatToSave(value, "tab")
                        )}\n`;
                    }
                    
                    let cr;
                    if (currentEditor.range.hasrange) {
                        cr = SocialCalc.crToCoord(currentEditor.range.left, currentEditor.range.top);
                    } else {
                        cr = currentEditor.ecell.coord;
                    }
                    cmdStr += `paste ${cr} formulas`;
                    currentEditor.EditorScheduleSheetCommands(cmdStr, true, false);
                    SocialCalc.KeyboardFocus();
                }, 200);
                return true;

            case "[ctrl-z]":
                editor.EditorScheduleSheetCommands("undo", true, false);
                return false;

            case "[ctrl-s]": // Temporary hack
                window.setTimeout(() => {
                    if (!SocialCalc.GetSpreadsheetControlObject) return;
                    let s = SocialCalc.GetSpreadsheetControlObject();
                    if (!s) return;
                    let currentEditor = s.editor;
                    let sheet = currentEditor.context.sheetobj;
                    let currentCell = sheet.GetAssuredCell(currentEditor.ecell.coord);
                    let ntvf = currentCell.nontextvalueformat
                        ? sheet.valueformats[currentCell.nontextvalueformat - 0] || ""
                        : "";
                    let newntvf = window.prompt(
                        "Advanced Feature:\n\nCustom Numeric Format or Command",
                        ntvf
                    );
                    if (newntvf !== null) {
                        // Not cancelled
                        let commandStr;
                        if (newntvf.match(/^cmd:/)) {
                            commandStr = newntvf.substring(4); // Execute as command
                        } else if (newntvf.match(/^edit:/)) {
                            commandStr = newntvf.substring(5); // Execute as command
                            if (SocialCalc.CtrlSEditor) {
                                SocialCalc.CtrlSEditor(commandStr);
                            }
                            return;
                        } else {
                            let selection;
                            if (currentEditor.range.hasrange) {
                                selection = `${SocialCalc.crToCoord(currentEditor.range.left, currentEditor.range.top)}:${SocialCalc.crToCoord(currentEditor.range.right, currentEditor.range.bottom)}`;
                            } else {
                                selection = currentEditor.ecell.coord;
                            }
                            commandStr = `set ${selection} nontextvalueformat ${newntvf}`;
                        }
                        currentEditor.EditorScheduleSheetCommands(commandStr, true, false);
                    }
                }, 200);
                return false;

            default:
                break;
        }
        return true;
    };

    // Set sheet's status callback
    context.sheetobj.statuscallback = SocialCalc.EditorSheetStatusCallback;
    context.sheetobj.statuscallbackparams = this; // this object: the table editor object

    /**
     * StatusCallback: all values are called at appropriate times, add with unique name, delete when done
     *
     * Each value must be an object in the form of:
     *    func: function(editor, status, arg, params) {...},
     *    params: params value to call func with
     *
     * The values for status and arg are:
     *    all the SocialCalc RecalcSheet statuscallbacks, including:
     *       calccheckdone, calclist length
     *       calcorder, {coord: coord, total: celllist length, count: count}
     *       calcstep, {coord: coord, total: calclist length, count: count}
     *       calcfinished, time in milliseconds
     *
     *    the command callbacks, like cmdstart and cmdend
     *    cmdendnorender
     *
     *    calcstart, null
     *    moveecell, new ecell coord
     *    rangechange, "coord:coord" or "coord" or ""
     *    specialkey, keyname ("[esc]")
     *
     * @type {Object}
     */
    this.StatusCallback = {};

    /**
     * All values are called with editor as arg; add with unique name, delete when done
     * @type {Object}
     */
    this.MoveECellCallback = {};
    
    /**
     * All values are called with editor as arg; add with unique name, delete when done
     * @type {Object}
     */
    this.RangeChangeCallback = {};
    
    /**
     * See SocialCalc.SaveEditorSettings
     * @type {Object}
     */
    this.SettingsCallbacks = {};

    // Set initial cursor
    this.ecell = { coord: "A1", row: 1, col: 1 };
    context.highlights[this.ecell.coord] = "cursor";

    /**
     * @description Range Properties
     * Range has at least hasrange (true/false).
     * It may also have: anchorcoord, anchorrow, anchorcol, top, bottom, left, and right.
     * 
     * @type {Object}
     */
    this.range = { hasrange: false };

    /**
     * @description Range2 Properties
     * Initialize range2 data (used to show selections, such as for move)
     * Range2 has at least hasrange (true/false).
     * It may also have: top, bottom, left, and right.
     * 
     * @type {Object}
     */
    this.range2 = { hasrange: false };
};
/**
 * @description TableEditor Prototype Methods
 * These methods are attached to the TableEditor prototype for instance method access
 */

/**
 * Creates a table editor interface
 * @param {number} width - Width of the editor
 * @param {number} height - Height of the editor
 * @returns {*} Result of CreateTableEditor
 */
SocialCalc.TableEditor.prototype.CreateTableEditor = function (width, height) {
    return SocialCalc.CreateTableEditor(this, width, height);
};

/**
 * Resizes the table editor
 * @param {number} width - New width
 * @param {number} height - New height
 * @returns {*} Result of ResizeTableEditor
 */
SocialCalc.TableEditor.prototype.ResizeTableEditor = function (width, height) {
    return SocialCalc.ResizeTableEditor(this, width, height);
};

/**
 * Saves editor settings
 * @returns {*} Result of SaveEditorSettings
 */
SocialCalc.TableEditor.prototype.SaveEditorSettings = function () {
    return SocialCalc.SaveEditorSettings(this);
};

/**
 * Loads editor settings
 * @param {string} str - Settings string
 * @param {*} flags - Load flags
 * @returns {*} Result of LoadEditorSettings
 */
SocialCalc.TableEditor.prototype.LoadEditorSettings = function (str, flags) {
    return SocialCalc.LoadEditorSettings(this, str, flags);
};

/**
 * Renders the sheet
 */
SocialCalc.TableEditor.prototype.EditorRenderSheet = function () {
    SocialCalc.EditorRenderSheet(this);
};

/**
 * Schedules sheet commands for execution
 * @param {string} cmdstr - Command string
 * @param {boolean} saveundo - Whether to save undo state
 * @param {boolean} ignorebusy - Whether to ignore busy state
 */
SocialCalc.TableEditor.prototype.EditorScheduleSheetCommands = function (
    cmdstr,
    saveundo,
    ignorebusy
) {
    SocialCalc.EditorScheduleSheetCommands(this, cmdstr, saveundo, ignorebusy);
};

/**
 * Schedules sheet commands (legacy method)
 * @param {string} cmdstr - Command string
 * @param {boolean} saveundo - Whether to save undo state
 */
SocialCalc.TableEditor.prototype.ScheduleSheetCommands = function (
    cmdstr,
    saveundo
) {
    this.context.sheetobj.ScheduleSheetCommands(cmdstr, saveundo);
};

/**
 * Undoes the last sheet operation
 */
SocialCalc.TableEditor.prototype.SheetUndo = function () {
    this.context.sheetobj.SheetUndo();
};

/**
 * Redoes the last undone sheet operation
 */
SocialCalc.TableEditor.prototype.SheetRedo = function () {
    this.context.sheetobj.SheetRedo();
};

/**
 * Sets editor step
 * @param {string} status - Status value
 * @param {*} arg - Argument value
 */
SocialCalc.TableEditor.prototype.EditorStepSet = function (status, arg) {
    SocialCalc.EditorStepSet(this, status, arg);
};

/**
 * Gets status line string
 * @param {string} status - Status value
 * @param {*} arg - Argument value  
 * @param {*} params - Parameters
 * @returns {string} Status line string
 */
SocialCalc.TableEditor.prototype.GetStatuslineString = function (
    status,
    arg,
    params
) {
    return SocialCalc.EditorGetStatuslineString(this, status, arg, params);
};

/**
 * Registers mouse event handlers
 * @returns {*} Result of EditorMouseRegister
 */
SocialCalc.TableEditor.prototype.EditorMouseRegister = function () {
    return SocialCalc.EditorMouseRegister(this);
};

/**
 * Unregisters mouse event handlers
 * @returns {*} Result of EditorMouseUnregister
 */
SocialCalc.TableEditor.prototype.EditorMouseUnregister = function () {
    return SocialCalc.EditorMouseUnregister(this);
};

/**
 * Handles mouse range selection
 * @param {string} coord - Cell coordinate
 * @returns {*} Result of EditorMouseRange
 */
SocialCalc.TableEditor.prototype.EditorMouseRange = function (coord) {
    return SocialCalc.EditorMouseRange(this, coord);
};

/**
 * Processes keyboard input
 * @param {string} ch - Character input
 * @param {Event} e - Event object
 * @returns {*} Result of EditorProcessKey
 */
SocialCalc.TableEditor.prototype.EditorProcessKey = function (ch, e) {
    return SocialCalc.EditorProcessKey(this, ch, e);
};

/**
 * Adds text to input
 * @param {string} str - String to add
 * @param {string} prefix - Prefix to add
 * @returns {*} Result of EditorAddToInput
 */
SocialCalc.TableEditor.prototype.EditorAddToInput = function (str, prefix) {
    return SocialCalc.EditorAddToInput(this, str, prefix);
};

/**
 * Displays cell contents
 * @returns {*} Result of EditorDisplayCellContents
 */
SocialCalc.TableEditor.prototype.DisplayCellContents = function () {
    return SocialCalc.EditorDisplayCellContents(this);
};

/**
 * Saves current edit
 * @param {string} text - Text to save
 * @returns {*} Result of EditorSaveEdit
 */
SocialCalc.TableEditor.prototype.EditorSaveEdit = function (text) {
    return SocialCalc.EditorSaveEdit(this, text);
};

/**
 * Applies set commands to range
 * @param {string} cmdline - Command line
 * @param {string} type - Command type
 * @returns {*} Result of EditorApplySetCommandsToRange
 */
SocialCalc.TableEditor.prototype.EditorApplySetCommandsToRange = function (
    cmdline,
    type
) {
    return SocialCalc.EditorApplySetCommandsToRange(this, cmdline, type);
};

/**
 * Moves the edit cell using keyboard input
 * @param {string} ch - Character/key pressed
 * @returns {*} Result of MoveECellWithKey
 */
SocialCalc.TableEditor.prototype.MoveECellWithKey = function (ch) {
    return SocialCalc.MoveECellWithKey(this, ch);
};

/**
 * Moves the edit cell to a new position
 * @param {string} newcell - New cell coordinate
 * @returns {*} Result of MoveECell
 */
SocialCalc.TableEditor.prototype.MoveECell = function (newcell) {
    return SocialCalc.MoveECell(this, newcell);
};

/**
 * Replaces a cell element
 * @param {Object} cell - Cell object
 * @param {number} row - Row number
 * @param {number} col - Column number
 */
SocialCalc.TableEditor.prototype.ReplaceCell = function (cell, row, col) {
    SocialCalc.ReplaceCell(this, cell, row, col);
};

/**
 * Updates cell CSS styling
 * @param {Object} cell - Cell object
 * @param {number} row - Row number
 * @param {number} col - Column number
 */
SocialCalc.TableEditor.prototype.UpdateCellCSS = function (cell, row, col) {
    SocialCalc.UpdateCellCSS(this, cell, row, col);
};

/**
 * Sets edit cell headers
 * @param {boolean} selected - Whether selected
 */
SocialCalc.TableEditor.prototype.SetECellHeaders = function (selected) {
    SocialCalc.SetECellHeaders(this, selected);
};

/**
 * Ensures edit cell is visible
 */
SocialCalc.TableEditor.prototype.EnsureECellVisible = function () {
    SocialCalc.EnsureECellVisible(this);
};

/**
 * Sets range anchor
 * @param {string} coord - Coordinate to anchor
 */
SocialCalc.TableEditor.prototype.RangeAnchor = function (coord) {
    SocialCalc.RangeAnchor(this, coord);
};

/**
 * Extends range selection
 * @param {string} coord - Coordinate to extend to
 */
SocialCalc.TableEditor.prototype.RangeExtend = function (coord) {
    SocialCalc.RangeExtend(this, coord);
};

/**
 * Removes range selection
 */
SocialCalc.TableEditor.prototype.RangeRemove = function () {
    SocialCalc.RangeRemove(this);
};

/**
 * Removes range2 selection
 */
SocialCalc.TableEditor.prototype.Range2Remove = function () {
    SocialCalc.Range2Remove(this);
};

/**
 * Fits editor to edit table
 */
SocialCalc.TableEditor.prototype.FitToEditTable = function () {
    SocialCalc.FitToEditTable(this);
};

/**
 * Calculates editor positions
 */
SocialCalc.TableEditor.prototype.CalculateEditorPositions = function () {
    SocialCalc.CalculateEditorPositions(this);
};

/**
 * Schedules a render operation
 */
SocialCalc.TableEditor.prototype.ScheduleRender = function () {
    SocialCalc.ScheduleRender(this);
};

/**
 * Performs a render step
 */
SocialCalc.TableEditor.prototype.DoRenderStep = function () {
    SocialCalc.DoRenderStep(this);
};

/**
 * Schedules position calculations
 */
SocialCalc.TableEditor.prototype.SchedulePositionCalculations = function () {
    SocialCalc.SchedulePositionCalculations(this);
};

/**
 * Performs position calculations
 */
SocialCalc.TableEditor.prototype.DoPositionCalculations = function () {
    SocialCalc.DoPositionCalculations(this);
};

/**
 * Calculates row positions
 * @param {number} panenum - Pane number
 * @param {Array} positions - Position array
 * @param {Array} sizes - Size array
 * @returns {*} Result of CalculateRowPositions
 */
SocialCalc.TableEditor.prototype.CalculateRowPositions = function (
    panenum,
    positions,
    sizes
) {
    return SocialCalc.CalculateRowPositions(this, panenum, positions, sizes);
};

/**
 * Calculates column positions
 * @param {number} panenum - Pane number
 * @param {Array} positions - Position array
 * @param {Array} sizes - Size array
 * @returns {*} Result of CalculateColPositions
 */
SocialCalc.TableEditor.prototype.CalculateColPositions = function (
    panenum,
    positions,
    sizes
) {
    return SocialCalc.CalculateColPositions(this, panenum, positions, sizes);
};

/**
 * Scrolls relative to current position
 * @param {boolean} vertical - Whether to scroll vertically
 * @param {number} amount - Amount to scroll
 */
SocialCalc.TableEditor.prototype.ScrollRelative = function (vertical, amount) {
    SocialCalc.ScrollRelative(this, vertical, amount);
};

/**
 * Scrolls both vertical and horizontal
 * @param {number} vamount - Vertical amount
 * @param {number} hamount - Horizontal amount
 */
SocialCalc.TableEditor.prototype.ScrollRelativeBoth = function (
    vamount,
    hamount
) {
    SocialCalc.ScrollRelativeBoth(this, vamount, hamount);
};

/**
 * Pages relative to current position
 * @param {boolean} vertical - Whether to page vertically
 * @param {number} direction - Direction to page
 */
SocialCalc.TableEditor.prototype.PageRelative = function (vertical, direction) {
    SocialCalc.PageRelative(this, vertical, direction);
};

/**
 * Limits the last panes
 */
SocialCalc.TableEditor.prototype.LimitLastPanes = function () {
    SocialCalc.LimitLastPanes(this);
};

/**
 * Scrolls table up one row
 * @returns {*} Result of ScrollTableUpOneRow
 */
SocialCalc.TableEditor.prototype.ScrollTableUpOneRow = function () {
    return SocialCalc.ScrollTableUpOneRow(this);
};

/**
 * Scrolls table down one row
 * @returns {*} Result of ScrollTableDownOneRow
 */
SocialCalc.TableEditor.prototype.ScrollTableDownOneRow = function () {
    return SocialCalc.ScrollTableDownOneRow(this);
};

/**
 * Scrolls table left one column
 * @returns {*} Result of ScrollTableLeftOneCol
 */
SocialCalc.TableEditor.prototype.ScrollTableLeftOneCol = function () {
    return SocialCalc.ScrollTableLeftOneCol(this);
};

/**
 * Scrolls table right one column
 * @returns {*} Result of ScrollTableRightOneCol
 */
SocialCalc.TableEditor.prototype.ScrollTableRightOneCol = function () {
    return SocialCalc.ScrollTableRightOneCol(this);
};

/**
 * Contact prototype - changes contact information
 * @param {string} text - Text value
 * @param {string} name - Contact name
 * @param {string} phone - Phone number
 * @param {string} email - Email address
 * @param {string} street - Street address
 * @param {string} city - City
 * @param {string} company - Company
 * @param {*} val - Value
 * @returns {*} Result of EditorChangecontact
 */
SocialCalc.TableEditor.prototype.EditorChangecontact = function (
    text,
    name,
    phone,
    email,
    street,
    city,
    company,
    val
) {
    return SocialCalc.EditorChangecontact(
        this,
        text,
        name,
        phone,
        email,
        street,
        city,
        company,
        val
    );
};

/**
 * Changes color from widget
 * @param {string} text - Color text
 * @returns {*} Result of EditorChangecolorFromWidget
 */
SocialCalc.TableEditor.prototype.EditorChangecolorFromWidget = function (text) {
    return SocialCalc.EditorChangecolorFromWidget(this, text);
};

/**
 * Changes sheet color
 * @param {string} text - Color text
 * @returns {*} Result of EditorChangeSheetcolor
 */
SocialCalc.TableEditor.prototype.EditorChangeSheetcolor = function (text) {
    return SocialCalc.EditorChangeSheetcolor(this, text);
};

/**
 * Changes font from widget
 * @param {string} text - Font text
 * @returns {*} Result of EditorChangefontFromWidget
 */
SocialCalc.TableEditor.prototype.EditorChangefontFromWidget = function (text) {
    return SocialCalc.EditorChangefontFromWidget(this, text);
};

/**
 * Changes sheet font
 * @param {string} text - Font text
 * @returns {*} Result of EditorChangeSheetfont
 */
SocialCalc.TableEditor.prototype.EditorChangeSheetfont = function (text) {
    return SocialCalc.EditorChangeSheetfont(this, text);
};

/**
 * Cuts cells
 * @param {string} text - Text value
 * @param {number} no_of_cells - Number of cells
 * @returns {*} Result of EditorCut
 */
SocialCalc.TableEditor.prototype.EditorCut = function (text, no_of_cells) {
    return SocialCalc.EditorCut(this, text, no_of_cells);
};

/**
 * Clears sheet cells
 * @param {string} text - Text value
 * @param {string} cell_to_clear - Cell coordinate to clear
 * @returns {*} Result of EditorClearSheet
 */
SocialCalc.TableEditor.prototype.EditorClearSheet = function (
    text,
    cell_to_clear
) {
    return SocialCalc.EditorClearSheet(this, text, cell_to_clear);
};

/**
 * @description Static Functions
 */

/**
 * Creates a new table editor instance
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance to initialize
 * @param {number} width - Width of the editor in pixels
 * @param {number} height - Height of the editor in pixels
 * @returns {HTMLElement} The top-level element of the created table editor
 */
SocialCalc.CreateTableEditor = function (editor, width, height) {
    let scc = SocialCalc.Constants;
    let AssignID = SocialCalc.AssignID;

    // Create main container
    editor.toplevel = document.createElement("div");
    editor.width = width;
    editor.height = height;

    // Create grid division
    editor.griddiv = document.createElement("div");
    editor.tablewidth = Math.max(0, width - scc.defaultTableControlThickness);
    editor.tableheight = Math.max(0, height - scc.defaultTableControlThickness);
    editor.griddiv.style.width = `${editor.tablewidth}px`;
    editor.griddiv.style.height = `${editor.tableheight}px`;
    editor.griddiv.style.overflow = "hidden";
    editor.griddiv.style.cursor = "default";
    if (scc.cteGriddivClass) editor.griddiv.className = scc.cteGriddivClass;
    AssignID(editor, editor.griddiv, "griddiv");

    // Initialize editor components
    editor.FitToEditTable();
    editor.EditorRenderSheet();
    editor.griddiv.appendChild(editor.fullgrid);

    // Create vertical table control
    editor.verticaltablecontrol = new SocialCalc.TableControl(
        editor,
        true,
        editor.tableheight
    );
    editor.verticaltablecontrol.CreateTableControl();
    AssignID(editor, editor.verticaltablecontrol.main, "tablecontrolv");

    // Create horizontal table control
    editor.horizontaltablecontrol = new SocialCalc.TableControl(
        editor,
        false,
        editor.tablewidth
    );
    editor.horizontaltablecontrol.CreateTableControl();
    AssignID(editor, editor.horizontaltablecontrol.main, "tablecontrolh");

    // Create layout table structure
    let table = document.createElement("table");
    editor.layouttable = table;
    table.cellSpacing = 0;
    table.cellPadding = 0;
    AssignID(editor, table, "layouttable");

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // First row: grid and vertical control
    let tr = document.createElement("tr");
    tbody.appendChild(tr);
    let td = document.createElement("td");
    td.appendChild(editor.griddiv);
    tr.appendChild(td);
    td = document.createElement("td");
    // td.appendChild(editor.verticaltablecontrol.main); // Commented out in original
    tr.appendChild(td);

    // Second row: horizontal control and logo
    tr = document.createElement("tr");
    tbody.appendChild(tr);
    td = document.createElement("td");
    // td.appendChild(editor.horizontaltablecontrol.main); // Commented out in original
    tr.appendChild(td);

    // Logo display: Required by CPAL License for this code!
    td = document.createElement("td");
    td.innerHTML = `<div style='cursor:pointer;font-size:1px;'><img src='${editor.imageprefix}1x1.gif' border='0' width='18' height='18'></div>`;
    tr.appendChild(td);
    editor.logo = td;
    AssignID(editor, editor.logo, "logo");
    SocialCalc.TooltipRegister(td.firstChild.firstChild, "SocialCalc", null);

    editor.toplevel.appendChild(editor.layouttable);

    // Create input echo if editing is enabled
    if (!editor.noEdit) {
        editor.inputEcho = new SocialCalc.InputEcho(editor);
        AssignID(editor, editor.inputEcho.main, "inputecho");
    }

    // Create cell handles
    editor.cellhandles = new SocialCalc.CellHandles(editor);

    // Create invisible textarea for ctrl-c/ctrl-v operations
    let ta = document.createElement("textarea");
    SocialCalc.setStyles(
        ta,
        "display:none;position:absolute;height:1px;width:1px;opacity:0;filter:alpha(opacity=0);"
    );
    ta.value = "";
    editor.pasteTextarea = ta;
    AssignID(editor, editor.pasteTextarea, "pastetextarea");

    // Special handling for Safari 5 paste functionality
    if (
        navigator.userAgent.match(/Safari\//) &&
        !navigator.userAgent.match(/Chrome\//)
    ) {
        // Remove and re-add event listeners for Safari 5 compatibility
        let events = ["beforepaste", "beforecopy", "beforecut"];
        events.forEach(eventType => {
            window.removeEventListener(eventType, SocialCalc.SafariPasteFunction, false);
            window.addEventListener(eventType, SocialCalc.SafariPasteFunction, false);
        });
    }

    editor.toplevel.appendChild(editor.pasteTextarea);

    // Create HTML paste area for IE compatibility
    let div = document.createElement("div");
    div.innerHTML = "    <br/>";
    if (div.firstChild.nodeType === 1) {
        /* We are running in IE -- Using HTML-based area for Ctrl-V */
        let ha = document.createElement("div");
        editor.pasteHTMLarea = ha;
        editor.toplevel.appendChild(editor.pasteHTMLarea);
        ha.contentEditable = true;
        AssignID(editor, editor.pasteHTMLarea, "pastehtmlarea");
        SocialCalc.setStyles(
            ha,
            "display:block;visibility:hidden;position:absolute;height:1px;width:1px;opacity:0;filter:alpha(opacity=0);overflow:hidden"
        );
    }

    // Register mouse wheel handling
    SocialCalc.MouseWheelRegister(editor.toplevel, {
        WheelMove: SocialCalc.EditorProcessMouseWheel,
        editor: editor,
    });

    // Register touch handling if available
    if (SocialCalc.HasTouch) {
        SocialCalc.TouchRegister(editor.toplevel, {
            Swipe: SocialCalc.EditorProcessSwipe,
            DoubleTap: SocialCalc.EditorProcessDoubleTap,
            SingleTap: SocialCalc.EditorProcessSingleTap,
            editor: editor,
        });
    }

    // Fix obscure Firefox 2 Mac bug with Ctrl-V
    if (editor.inputBox && editor.inputBox.element) {
        editor.inputBox.element.focus();
        editor.inputBox.element.blur();
    }
    
    SocialCalc.KeyboardSetFocus(editor);

    // Perform status reporting
    SocialCalc.EditorSheetStatusCallback(null, "startup", null, editor);

    return editor.toplevel;
};/**
 * Special code needed for Safari 5 paste functionality fix
 * 
 * @param {Event} e - The event object
 */
SocialCalc.SafariPasteFunction = function (e) {
    e.preventDefault();
};

/**
 * Resizes an existing table editor to new dimensions
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor to resize
 * @param {number} width - New width in pixels
 * @param {number} height - New height in pixels
 */
SocialCalc.ResizeTableEditor = function (editor, width, height) {
    let scc = SocialCalc.Constants;

    // Update editor dimensions
    editor.width = width;
    editor.height = height;

    // Resize top level container
    editor.toplevel.style.width = `${width}px`;
    editor.toplevel.style.height = `${height}px`;

    // Calculate and update table dimensions
    editor.tablewidth = Math.max(0, width - scc.defaultTableControlThickness);
    editor.tableheight = Math.max(0, height - scc.defaultTableControlThickness);
    editor.griddiv.style.width = `${editor.tablewidth}px`;
    editor.griddiv.style.height = `${editor.tableheight}px`;

    // Update control dimensions
    editor.verticaltablecontrol.main.style.height = `${editor.tableheight}px`;
    editor.horizontaltablecontrol.main.style.width = `${editor.tablewidth}px`;

    // Recalculate layout and schedule re-render
    editor.FitToEditTable();
    editor.ScheduleRender();
};

/**
 * Saves the editor settings to a string representation
 * 
 * Returns a string representation of the pane settings, etc.
 * 
 * The format is:
 *    version:1.0
 *    rowpane:panenumber:firstnum:lastnum
 *    colpane:panenumber:firstnum:lastnum
 *    ecell:coord -- if set
 *    range:anchorcoord:top:bottom:left:right -- if set
 * 
 * You can add additional values to be saved by using editor.SettingsCallbacks:
 *   editor.SettingsCallbacks["item-name"] = {save: savefunction, load: loadfunction}
 * 
 * where savefunction(editor, "item-name") returns a string with the new lines to be added to the saved settings
 * which include the trailing newlines, and loadfunction(editor, "item-name", line, flags) is given the line to process
 * without the trailing newlines.
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 * @returns {string} String representation of editor settings
 */
SocialCalc.SaveEditorSettings = function (editor) {
    let context = editor.context;
    let range = editor.range;
    let result = "version:1.0\n";

    // Save row panes
    for (let i = 0; i < context.rowpanes.length; i++) {
        result += `rowpane:${i}:${context.rowpanes[i].first}:${context.rowpanes[i].last}\n`;
    }
    
    // Save column panes
    for (let i = 0; i < context.colpanes.length; i++) {
        result += `colpane:${i}:${context.colpanes[i].first}:${context.colpanes[i].last}\n`;
    }

    // Save current edit cell
    if (editor.ecell) {
        result += `ecell:${editor.ecell.coord}\n`;
    }

    // Save current range selection
    if (range.hasrange) {
        result += `range:${range.anchorcoord}:${range.top}:${range.bottom}:${range.left}:${range.right}\n`;
    }

    // Save custom settings via callbacks
    for (let setting in editor.SettingsCallbacks) {
        result += editor.SettingsCallbacks[setting].save(editor, setting);
    }

    return result;
};

/**
 * Loads editor settings from a string representation
 * 
 * Sets the editor settings based on str. See SocialCalc.SaveEditorSettings for more details.
 * Unrecognized lines are ignored.
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 * @param {string} str - String representation of editor settings
 * @param {*} flags - Load flags
 */
SocialCalc.LoadEditorSettings = function (editor, str, flags) {
    let lines = str.split(/\r\n|\n/);
    let context = editor.context;
    let range;

    // Reset to initial state
    context.rowpanes = [{ first: 1, last: 1 }];
    context.colpanes = [{ first: 1, last: 1 }];
    editor.ecell = null;
    editor.range = { hasrange: false };
    editor.range2 = { hasrange: false };
    range = editor.range;
    context.highlights = {};
    let highlights = context.highlights;

    // Process each line of settings
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let parts = line.split(":");
        let setting = parts[0];
        
        switch (setting) {
            case "version":
                // Version information - no action needed
                break;

            case "rowpane":
                context.rowpanes[parseInt(parts[1])] = {
                    first: parseInt(parts[2]),
                    last: parseInt(parts[3]),
                };
                break;

            case "colpane":
                context.colpanes[parseInt(parts[1])] = {
                    first: parseInt(parts[2]),
                    last: parseInt(parts[3]),
                };
                break;

            case "ecell":
                editor.ecell = SocialCalc.coordToCr(parts[1]);
                editor.ecell.coord = parts[1];
                highlights[parts[1]] = "cursor";
                break;

            case "range":
                range.hasrange = true;
                range.anchorcoord = parts[1];
                let cr = SocialCalc.coordToCr(range.anchorcoord);
                range.anchorrow = cr.row;
                range.anchorcol = cr.col;
                range.top = parseInt(parts[2]);
                range.bottom = parseInt(parts[3]);
                range.left = parseInt(parts[4]);
                range.right = parseInt(parts[5]);
                
                // Set highlights for range
                for (let row = range.top; row <= range.bottom; row++) {
                    for (let col = range.left; col <= range.right; col++) {
                        let coord = SocialCalc.crToCoord(col, row);
                        if (highlights[coord] !== "cursor") {
                            highlights[coord] = "range";
                        }
                    }
                }
                break;

            default:
                // Handle custom settings via callbacks
                if (editor.SettingsCallbacks[setting]) {
                    editor.SettingsCallbacks[setting].load(editor, setting, line, flags);
                }
                break;
        }
    }
};

/**
 * Renders the sheet and updates editor.fullgrid
 * Sets event handlers for interaction
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 */
SocialCalc.EditorRenderSheet = function (editor) {
    // Unregister existing mouse handlers
    editor.EditorMouseUnregister();

    // Render the sheet
    editor.fullgrid = editor.context.RenderSheet(editor.fullgrid);

    // Set edit cell headers if there is an active cell
    if (editor.ecell) {
        editor.SetECellHeaders("selected");
    }

    // Assign ID for accessibility and debugging
    SocialCalc.AssignID(editor, editor.fullgrid, "fullgrid");

    // Re-register mouse handlers
    editor.EditorMouseRegister();
};

/**
 * Schedules sheet commands for execution
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 * @param {string} cmdstr - Command string to execute
 * @param {boolean} saveundo - Whether to save undo state
 * @param {boolean} ignorebusy - Whether to ignore busy state
 */
SocialCalc.EditorScheduleSheetCommands = function (
    editor,
    cmdstr,
    saveundo,
    ignorebusy
) {
    // Ignore commands if editing a cell and not forcing execution
    if (editor.state !== "start" && !ignorebusy) {
        return;
    }

    // Hold off on commands if currently executing one, unless ignoring busy state
    if (editor.busy && !ignorebusy) {
        editor.deferredCommands.push({ cmdstr, saveundo });
        return;
    }

    // Handle specific command types
    switch (cmdstr) {
        case "recalc":
        case "redisplay":
            editor.context.sheetobj.ScheduleSheetCommands(cmdstr, false);
            break;

        case "undo":
            editor.SheetUndo();
            break;

        case "redo":
            editor.SheetRedo();
            break;

        default:
            editor.context.sheetobj.ScheduleSheetCommands(cmdstr, saveundo);
            break;
    }
};

/**
 * Editor sheet status callback function
 * Called during recalc, executing commands, etc.
 * 
 * @param {*} recalcdata - Recalculation data
 * @param {string} status - Current status
 * @param {*} arg - Status-specific argument
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 */
SocialCalc.EditorSheetStatusCallback = function (recalcdata, status, arg, editor) {
    let sheetobj = editor.context.sheetobj;
    let cell, dcmd, cr;

    /**
     * Helper function to signal status to all registered callbacks
     * @param {string} s - Status to signal
     */
    let signalstatus = (s) => {
        for (let f in editor.StatusCallback) {
            if (editor.StatusCallback[f].func) {
                editor.StatusCallback[f].func(
                    editor,
                    s,
                    arg,
                    editor.StatusCallback[f].params
                );
            }
        }
    };

    switch (status) {
        case "startup":
            // Initial startup - no action needed
            break;

        case "cmdstart":
            editor.busy = true;
            sheetobj.celldisplayneeded = "";
            break;

        case "cmdextension":
            // Command extension - no action needed
            break;

        case "cmdend":
            signalstatus(status);

            // Handle render value changes
            if (sheetobj.changedrendervalues) {
                editor.context.PrecomputeSheetFontsAndLayouts();
                editor.context.CalculateCellSkipData();
                sheetobj.changedrendervalues = false;
            }

            // Update cell display if needed
            if (sheetobj.celldisplayneeded && !sheetobj.renderneeded) {
                cr = SocialCalc.coordToCr(sheetobj.celldisplayneeded);
                cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
                editor.ReplaceCell(cell, cr.row, cr.col);
            }

            // Execute deferred commands
            if (editor.deferredCommands.length) {
                dcmd = editor.deferredCommands.shift();
                editor.EditorScheduleSheetCommands(dcmd.cmdstr, dcmd.saveundo, true);
                return;
            }

            // Handle recalculation if needed
            if (
                sheetobj.attribs.needsrecalc &&
                (sheetobj.attribs.recalc !== "off" || sheetobj.recalconce) &&
                editor.recalcFunction
            ) {
                editor.FitToEditTable();
                sheetobj.renderneeded = false; // recalc will force a render
                if (sheetobj.recalconce) delete sheetobj.recalconce; // only do once
                editor.recalcFunction(editor);
            } else {
                // Handle rendering or position calculations
                if (sheetobj.renderneeded) {
                    editor.FitToEditTable();
                    sheetobj.renderneeded = false;
                    editor.ScheduleRender();
                } else {
                    editor.SchedulePositionCalculations(); // just in case command changed positions
                }
            }
            return;

        case "calcstart":
            editor.busy = true;
            break;

        case "calccheckdone":
        case "calcorder":
        case "calcstep":
        case "calcloading":
        case "calcserverfunc":
            // Calculation status updates - no action needed here
            break;

        case "calcfinished":
            signalstatus(status);
            editor.ScheduleRender();
            return;

        case "schedrender":
            editor.busy = true; // in case got here without cmd or recalc
            break;

        case "renderdone":
            // Rendering complete - no action needed
            break;

        case "schedposcalc":
            editor.busy = true; // in case got here without cmd or recalc
            break;

        case "doneposcalc":
            if (editor.deferredCommands.length) {
                signalstatus(status);
                dcmd = editor.deferredCommands.shift();
                editor.EditorScheduleSheetCommands(dcmd.cmdstr, dcmd.saveundo, true);
            } else {
                editor.busy = false;
                signalstatus(status);
                if (editor.state === "start") {
                    editor.DisplayCellContents(); // make sure up to date
                }
            }
            return;

        default:
            if (typeof addmsg !== "undefined") {
                addmsg(`Unknown status: ${status}`);
            }
            break;
    }

    signalstatus(status);
};

/**
 * Timer-driven steps for use with SocialCalc.EditorSheetStatusCallback
 * @type {Object}
 */
SocialCalc.EditorStepInfo = {
    /** @type {string} Saved value to pass to callback */
    // status: "",
    
    /** @type {SocialCalc.TableEditor|null} Editor for callback */
    editor: null,
    
    /** @type {*} Argument for callback */
    // arg: null,
    
    /** @type {number|null} Timer object ID */
    // timerobj: null
};

/* Example timer-driven step functions (commented out):
SocialCalc.EditorStepSet = function(editor, status, arg) {
    let esi = SocialCalc.EditorStepInfo;
    if (typeof addmsg !== "undefined") {
        addmsg("step: " + status);
    }
    if (esi.timerobj) {
        alert("Already waiting. Old/new: " + esi.status + "/" + status);
    }
    esi.editor = editor;
    esi.status = status;
    esi.timerobj = window.setTimeout(SocialCalc.EditorStepDone, 1);
};

SocialCalc.EditorStepDone = function() {
    let esi = SocialCalc.EditorStepInfo;
    esi.timerobj = null;
    SocialCalc.EditorSheetStatusCallback(null, esi.status, null, esi.editor);
};
*/

/**
 * Gets the status line string for the editor
 * 
 * Assumes params is an object where it can use "calculating" and "command"
 * to keep track of state.
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor instance
 * @param {string} status - Current status
 * @param {*} arg - Status-specific argument
 * @param {Object} params - Parameters object to track state
 * @returns {string} Status line string
 */
SocialCalc.EditorGetStatuslineString = function (editor, status, arg, params) {
    let scc = SocialCalc.Constants;
    let progress = "";

    // Handle different status types
    switch (status) {
        case "moveecell":
        case "rangechange":
        case "startup":
            // No progress message needed
            break;
            
        case "cmdstart":
            params.command = true;
            document.body.style.cursor = "progress";
            editor.griddiv.style.cursor = "progress";
            progress = scc.s_statusline_executing;
            break;
            
        case "cmdextension":
            progress = `Command Extension: ${arg}`;
            break;
            
        case "cmdend":
            params.command = false;
            break;
            
        case "schedrender":
            progress = scc.s_statusline_displaying;
            break;
            
        case "renderdone":
            progress = " ";
            break;
            
        case "schedposcalc":
            progress = scc.s_statusline_displaying;
            break;
            
        case "cmdendnorender":
        case "doneposcalc":
            document.body.style.cursor = "default";
            editor.griddiv.style.cursor = "default";
            break;
            
        case "calcorder":
            progress = `${scc.s_statusline_ordering}${Math.floor((100 * arg.count) / (arg.total || 1))}%`;
            break;
            
        case "calcstep":
            progress = `${scc.s_statusline_calculating}${Math.floor((100 * arg.count) / (arg.total || 1))}%`;
            break;
            
        case "calcloading":
            progress = `${scc.s_statusline_calculatingls}: ${arg.sheetname}`;
            break;
            
        case "calcserverfunc":
            progress = `${scc.s_statusline_calculating}${Math.floor((100 * arg.count) / (arg.total || 1))}%, ${scc.s_statusline_doingserverfunc}${arg.funcname}${scc.s_statusline_incell}${arg.coord}`;
            break;
            
        case "calcstart":
            params.calculating = true;
            document.body.style.cursor = "progress";
            editor.griddiv.style.cursor = "progress"; // griddiv has an explicit cursor style
            progress = scc.s_statusline_calcstart;
            break;
            
        case "calccheckdone":
            // No action needed
            break;
            
        case "calcfinished":
            params.calculating = false;
            break;
            
        default:
            progress = status;
            break;
    }

    // Default calculating message
    if (!progress && params.calculating) {
        progress = scc.s_statusline_calculating;
    }

    // Calculate sum if there is a range (not during busy times)
    if (
        !params.calculating &&
        !params.command &&
        !progress &&
        editor.range.hasrange &&
        (editor.range.left !== editor.range.right ||
            editor.range.top !== editor.range.bottom)
    ) {
        let sum = 0;
        
        // Sum all numeric cells in the range
        for (let r = editor.range.top; r <= editor.range.bottom; r++) {
            for (let c = editor.range.left; c <= editor.range.right; c++) {
                let cell = editor.context.sheetobj.cells[SocialCalc.crToCoord(c, r)];
                if (!cell) continue;
                if (cell.valuetype && cell.valuetype.charAt(0) === "n") {
                    sum += cell.datavalue - 0;
                }
            }
        }

        // Format the sum
        sum = SocialCalc.FormatNumber.formatNumberWithFormat(sum, "[,]General", "");

        // Create range coordinate string
        let coord = `${SocialCalc.crToCoord(editor.range.left, editor.range.top)}:${SocialCalc.crToCoord(editor.range.right, editor.range.bottom)}`;
        
        // Build progress string with range info
        let width = editor.range.right - editor.range.left + 1;
        let height = editor.range.bottom - editor.range.top + 1;
        progress = `${coord} (${width}x${height}) ${scc.s_statusline_sum}=${sum} ${progress}`;
    }

    // Build main status string
    let sstr = `${editor.ecell.coord} &nbsp; ${progress}`;

    // Add recalc needed indicator
    if (!params.calculating && editor.context.sheetobj.attribs.needsrecalc === "yes") {
        sstr += ` &nbsp; ${scc.s_statusline_recalcneeded}`;
    }

    // Add circular reference indicator
    let circ = editor.context.sheetobj.attribs.circularreferencecell;
    if (circ) {
        circ = circ.replace(/\|/, " referenced by ");
        sstr += ` &nbsp; ${scc.s_statusline_circref}${circ}</span>`;
    }

    return sstr;
};

/**
 * @description Mouse Event Handling
 */

/**
 * Mouse information object for tracking mouse interactions
 * @type {Object}
 */
SocialCalc.EditorMouseInfo = {
    /**
     * The registeredElements array is used to identify editor grid in which the mouse is doing things.
     * One item for each active editor, each an object with: .element, .editor
     * @type {Array<Object>}
     */
    registeredElements: [],

    /** @type {SocialCalc.TableEditor|null} Editor being processed (between mousedown and mouseup) */
    editor: null,
    
    /** @type {HTMLElement|null} Element being processed */
    element: null,

    /** @type {boolean} If true, mousedowns are ignored */
    ignore: false,

    /** @type {string} Coord where mouse went down for drag range */
    mousedowncoord: "",
    
    /** @type {string} Coord where mouse last was during drag */
    mouselastcoord: "",
    
    /** @type {string} Col being resized */
    mouseresizecol: "",
    
    /** @type {number|null} Where resize started */
    mouseresizeclientx: null,
    
    /** @type {HTMLElement|null} Element tracking new size */
    mouseresizedisplay: null,
};

/**
 * Registers mouse event handlers for an editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor to register mouse events for
 */
SocialCalc.EditorMouseRegister = function (editor) {
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let element = editor.fullgrid;
    let i;

    // Check if already registered
    for (i = 0; i < mouseinfo.registeredElements.length; i++) {
        if (mouseinfo.registeredElements[i].editor === editor) {
            if (mouseinfo.registeredElements[i].element === element) {
                return; // already set - don't do it again
            }
            break;
        }
    }

    // Update existing registration or add new one
    if (i < mouseinfo.registeredElements.length) {
        mouseinfo.registeredElements[i].element = element;
    } else {
        mouseinfo.registeredElements.push({ element, editor });
    }

    // Add event listeners
    if (element.addEventListener) {
        // DOM Level 2 -- Firefox, et al
        element.addEventListener("mousedown", SocialCalc.ProcessEditorMouseDown, false);
        element.addEventListener("dblclick", SocialCalc.ProcessEditorDblClick, false);
    } else if (element.attachEvent) {
        // IE 5+
        element.attachEvent("onmousedown", SocialCalc.ProcessEditorMouseDown);
        element.attachEvent("ondblclick", SocialCalc.ProcessEditorDblClick);
    } else {
        // Browser not supported
        throw new Error("Browser not supported");
    }

    mouseinfo.ignore = false; // just in case
};

/**
 * Unregisters mouse event handlers for an editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor to unregister mouse events for
 */
SocialCalc.EditorMouseUnregister = function (editor) {
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let i;

    // Find the editor in registered elements
    for (i = 0; i < mouseinfo.registeredElements.length; i++) {
        if (mouseinfo.registeredElements[i].editor === editor) {
            break;
        }
    }

    // Remove event handlers if found
    if (i < mouseinfo.registeredElements.length) {
        let oldelement = mouseinfo.registeredElements[i].element;
        
        // Remove old handlers
        if (oldelement.removeEventListener) {
            // DOM Level 2
            oldelement.removeEventListener("mousedown", SocialCalc.ProcessEditorMouseDown, false);
            oldelement.removeEventListener("dblclick", SocialCalc.ProcessEditorDblClick, false);
        } else if (oldelement.detachEvent) {
            // IE
            oldelement.detachEvent("onmousedown", SocialCalc.ProcessEditorMouseDown);
            oldelement.detachEvent("ondblclick", SocialCalc.ProcessEditorDblClick);
        }
        
        // Remove from registered elements array
        mouseinfo.registeredElements.splice(i, 1);
    }
};

/**
 * Processes mouse down events for editors
 * 
 * @param {Event} e - The mouse event
 */
SocialCalc.ProcessEditorMouseDown = function (e) {
    let editor = null;
    let result = null;
    let coord = null;
    let textarea = null;
    let wval = null;
    let range = null;

    let event = e || window.event;

    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;
    let clientY = event.clientY + viewport.verticalScroll;

    let mouseinfo = SocialCalc.EditorMouseInfo;
    let ele = event.target || event.srcElement; // source object is often within what we want
    let mobj = null;

    if (mouseinfo.ignore) return; // ignore this

    for (mobj = null; !mobj && ele; ele = ele.parentNode) {
        // go up tree looking for one of our elements
        mobj = SocialCalc.LookupElement(ele, mouseinfo.registeredElements);
    }
    if (!mobj) {
        mouseinfo.editor = null;
        return; // not one of our elements
    }

    editor = mobj.editor;
    mouseinfo.element = ele;
    range = editor.range;
    result = SocialCalc.GridMousePosition(editor, clientX, clientY);

    if (!result || result.rowheader) return; // not on a cell or col header
    mouseinfo.editor = editor; // remember for later

    if (result.colheader && result.coltoresize) {
        // col header - do drag resize
        SocialCalc.ProcessEditorColsizeMouseDown(e, ele, result);
        return;
    }

    if (!result.coord) return; // not us

    if (!range.hasrange) {
        if (e.shiftKey) editor.RangeAnchor();
    }

    SocialCalc.Callbacks.ToggleCell(result.coord);
    coord = editor.MoveECell(result.coord);

    if (range.hasrange) {
        if (e.shiftKey) editor.RangeExtend();
        else editor.RangeRemove();
    }

    mouseinfo.mousedowncoord = coord; // remember if starting drag range select
    mouseinfo.mouselastcoord = coord;

    editor.EditorMouseRange(coord);

    SocialCalc.KeyboardSetFocus(editor);
    if (editor.state !== "start" && editor.inputBox) {
        editor.inputBox.element.focus();
    }

    // Event code from JavaScript, Flanagan, 5th Edition, pg. 422
    if (document.addEventListener) {
        // DOM Level 2 -- Firefox, et al
        document.addEventListener("mousemove", SocialCalc.ProcessEditorMouseMove, true);
        document.addEventListener("mouseup", SocialCalc.ProcessEditorMouseUp, true);
    } else if (ele.attachEvent) {
        // IE 5+
        ele.setCapture();
        ele.attachEvent("onmousemove", SocialCalc.ProcessEditorMouseMove);
        ele.attachEvent("onmouseup", SocialCalc.ProcessEditorMouseUp);
        ele.attachEvent("onlosecapture", SocialCalc.ProcessEditorMouseUp);
    }
    
    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }
};

/**
 * Handles mouse range selection for editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} coord - The coordinate to move to
 */
SocialCalc.EditorMouseRange = function (editor, coord) {
    let inputtext = null;
    let wval = null;
    let range = editor.range;

    switch (editor.state) { // editing a cell - shouldn't get here if no inputBox
        case "input":
            inputtext = editor.inputBox.GetText();
            wval = editor.workingvalues;
            if (
                ("(+-*/,:!&<>=^".indexOf(inputtext.slice(-1)) >= 0 &&
                    inputtext.slice(0, 1) === "=") ||
                inputtext === "="
            ) {
                wval.partialexpr = inputtext;
            }
            if (wval.partialexpr) {
                // if in pointing operation
                if (coord) {
                    if (range.hasrange) {
                        let sheetpref =
                            wval.currentsheet === wval.startsheet
                                ? ""
                                : `${wval.currentsheet}!`;
                        editor.inputBox.SetText(
                            wval.partialexpr +
                            sheetpref +
                            SocialCalc.crToCoord(range.left, range.top) +
                            ":" +
                            sheetpref +
                            SocialCalc.crToCoord(range.right, range.bottom)
                        );
                    } else {
                        let sheetpref =
                            wval.currentsheet === wval.startsheet
                                ? ""
                                : `${wval.currentsheet}!`;
                        editor.inputBox.SetText(wval.partialexpr + sheetpref + coord);
                    }
                }
            } else {
                // not in point -- done editing
                editor.inputBox.Blur();
                editor.inputBox.ShowInputBox(false);
                editor.state = "start";
                editor.cellhandles.ShowCellHandles(true);
                editor.EditorSaveEdit();
                editor.inputBox.DisplayCellContents(null);
            }
            break;

        case "inputboxdirect":
            editor.inputBox.Blur();
            editor.inputBox.ShowInputBox(false);
            editor.state = "start";
            editor.cellhandles.ShowCellHandles(true);
            editor.EditorSaveEdit();
            editor.inputBox.DisplayCellContents(null);
            break;
    }
};

/**
 * Processes mouse move events for editors
 * 
 * @param {Event} e - The mouse event
 */
SocialCalc.ProcessEditorMouseMove = function (e) {
    let editor = null;
    let element = null;
    let result = null;
    let coord = null;
    let now = null;
    let textarea = null;
    let sheetobj = null;
    let cellobj = null;
    let wval = null;

    let event = e || window.event;

    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;
    let clientY = event.clientY + viewport.verticalScroll;

    let mouseinfo = SocialCalc.EditorMouseInfo;
    editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    if (mouseinfo.ignore) return; // ignore this
    element = mouseinfo.element;

    result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with move

    if (!result) return;

    if (result && !result.coord) {
        SocialCalc.SetDragAutoRepeat(editor, result);
        return;
    }

    SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

    if (!result.coord) return;

    if (result.coord !== mouseinfo.mouselastcoord) {
        if (!e.shiftKey && !editor.range.hasrange) {
            editor.RangeAnchor(mouseinfo.mousedowncoord);
        }
        editor.MoveECell(result.coord);
        editor.RangeExtend();
    }
    mouseinfo.mouselastcoord = result.coord;

    editor.EditorMouseRange(result.coord);

    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }
};

/**
 * Processes mouse up events for editors
 * 
 * @param {Event} e - The mouse event
 * @returns {boolean} False to prevent default action
 */
SocialCalc.ProcessEditorMouseUp = function (e) {
    let editor = null;
    let element = null;
    let result = null;
    let coord = null;
    let now = null;
    let textarea = null;
    let sheetobj = null;
    let cellobj = null;
    let wval = null;

    let event = e || window.event;

    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;
    let clientY = event.clientY + viewport.verticalScroll;

    let mouseinfo = SocialCalc.EditorMouseInfo;
    editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    if (mouseinfo.ignore) return; // ignore this
    element = mouseinfo.element;

    result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with up

    SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

    if (!result) return;

    if (!result.coord) result.coord = editor.ecell.coord;

    if (editor.range.hasrange) {
        editor.MoveECell(result.coord);
        editor.RangeExtend();
    } else if (result.coord && result.coord !== mouseinfo.mousedowncoord) {
        editor.RangeAnchor(mouseinfo.mousedowncoord);
        editor.MoveECell(result.coord);
        editor.RangeExtend();
    }

    editor.EditorMouseRange(result.coord);

    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }

    if (document.removeEventListener) {
        // DOM Level 2
        document.removeEventListener("mousemove", SocialCalc.ProcessEditorMouseMove, true);
        document.removeEventListener("mouseup", SocialCalc.ProcessEditorMouseUp, true);
    } else if (element.detachEvent) {
        // IE
        element.detachEvent("onlosecapture", SocialCalc.ProcessEditorMouseUp);
        element.detachEvent("onmouseup", SocialCalc.ProcessEditorMouseUp);
        element.detachEvent("onmousemove", SocialCalc.ProcessEditorMouseMove);
        element.releaseCapture();
    }

    mouseinfo.editor = null;

    return false;
};

/**
 * Processes mouse down events for column resizing
 * 
 * @param {Event} e - The mouse event
 * @param {Element} ele - The target element
 * @param {Object} result - The grid position result
 */
SocialCalc.ProcessEditorColsizeMouseDown = function (e, ele, result) {
    let event = e || window.event;
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let editor = mouseinfo.editor;
    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;

    mouseinfo.mouseresizecolnum = result.coltoresize; // remember col being resized
    mouseinfo.mouseresizecol = SocialCalc.rcColname(result.coltoresize);
    mouseinfo.mousedownclientx = clientX;

    let sizedisplay = document.createElement("div");
    mouseinfo.mouseresizedisplay = sizedisplay;
    sizedisplay.style.width = "auto";
    sizedisplay.style.position = "absolute";
    sizedisplay.style.zIndex = 100;
    sizedisplay.style.top = `${editor.headposition.top + 0}px`;
    sizedisplay.style.left = `${editor.colpositions[result.coltoresize]}px`;
    sizedisplay.innerHTML =
        `<table cellpadding="0" cellspacing="0"><tr><td style="height:100px;` +
        `border:1px dashed black;background-color:white;width:` +
        `${editor.context.colwidth[mouseinfo.mouseresizecolnum] - 2}px;">&nbsp;</td>` +
        `<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">` +
        `${editor.context.colwidth[mouseinfo.mouseresizecolnum]}</div></td></tr></table>`;
    SocialCalc.setStyles(
        sizedisplay.firstChild.lastChild.firstChild.childNodes[0],
        "filter:alpha(opacity=85);opacity:.85;"
    ); // so no warning msg with Firefox about filter

    editor.toplevel.appendChild(sizedisplay);

    // Event code from JavaScript, Flanagan, 5th Edition, pg. 422
    if (document.addEventListener) {
        // DOM Level 2 -- Firefox, et al
        document.addEventListener("mousemove", SocialCalc.ProcessEditorColsizeMouseMove, true);
        document.addEventListener("mouseup", SocialCalc.ProcessEditorColsizeMouseUp, true);
    } else if (editor.toplevel.attachEvent) {
        // IE 5+
        editor.toplevel.setCapture();
        editor.toplevel.attachEvent("onmousemove", SocialCalc.ProcessEditorColsizeMouseMove);
        editor.toplevel.attachEvent("onmouseup", SocialCalc.ProcessEditorColsizeMouseUp);
        editor.toplevel.attachEvent("onlosecapture", SocialCalc.ProcessEditorColsizeMouseUp);
    }
    
    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }
};

/**
 * Processes mouse move events during column resizing
 * 
 * @param {Event} e - The mouse event
 */
SocialCalc.ProcessEditorColsizeMouseMove = function (e) {
    let event = e || window.event;
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;

    let newsize =
        editor.context.colwidth[mouseinfo.mouseresizecolnum] -
        0 +
        (clientX - mouseinfo.mousedownclientx);
    if (newsize < SocialCalc.Constants.defaultMinimumColWidth) {
        newsize = SocialCalc.Constants.defaultMinimumColWidth;
    }

    let sizedisplay = mouseinfo.mouseresizedisplay;
    sizedisplay.innerHTML =
        `<table cellpadding="0" cellspacing="0"><tr><td style="height:100px;` +
        `border:1px dashed black;background-color:white;width:${newsize - 2}px;">&nbsp;</td>` +
        `<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">` +
        `${newsize}</div></td></tr></table>`;
    SocialCalc.setStyles(
        sizedisplay.firstChild.lastChild.firstChild.childNodes[0],
        "filter:alpha(opacity=85);opacity:.85;"
    ); // so no warning msg with Firefox about filter

    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }
};

/**
 * Processes mouse up events during column resizing
 * 
 * @param {Event} e - The mouse event
 * @returns {boolean} False to prevent default action
 */
SocialCalc.ProcessEditorColsizeMouseUp = function (e) {
    let event = e || window.event;
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    let element = mouseinfo.element;
    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;

    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }

    if (document.removeEventListener) {
        // DOM Level 2
        document.removeEventListener("mousemove", SocialCalc.ProcessEditorColsizeMouseMove, true);
        document.removeEventListener("mouseup", SocialCalc.ProcessEditorColsizeMouseUp, true);
    } else if (editor.toplevel.detachEvent) {
        // IE
        editor.toplevel.detachEvent("onlosecapture", SocialCalc.ProcessEditorColsizeMouseUp);
        editor.toplevel.detachEvent("onmouseup", SocialCalc.ProcessEditorColsizeMouseUp);
        editor.toplevel.detachEvent("onmousemove", SocialCalc.ProcessEditorColsizeMouseMove);
        editor.toplevel.releaseCapture();
    }

    let newsize =
        editor.context.colwidth[mouseinfo.mouseresizecolnum] -
        0 +
        (clientX - mouseinfo.mousedownclientx);
    if (newsize < SocialCalc.Constants.defaultMinimumColWidth) {
        newsize = SocialCalc.Constants.defaultMinimumColWidth;
    }

    editor.EditorScheduleSheetCommands(
        `set ${mouseinfo.mouseresizecol} width ${newsize}`,
        true,
        false
    );

    if (editor.timeout) window.clearTimeout(editor.timeout);
    editor.timeout = window.setTimeout(SocialCalc.FinishColsize, 1); // wait - Firefox 2 has a bug otherwise with next mousedown

    return false;
};

/**
 * Finishes column resizing operation
 */
SocialCalc.FinishColsize = function () {
    let mouseinfo = SocialCalc.EditorMouseInfo;
    let editor = mouseinfo.editor;
    if (!editor) return;

    editor.toplevel.removeChild(mouseinfo.mouseresizedisplay);
    mouseinfo.mouseresizedisplay = null;

    //   editor.FitToEditTable();
    //   editor.EditorRenderSheet();
    //   editor.SchedulePositionCalculations();

    mouseinfo.editor = null;
};

    //
    // Handle auto-repeat of dragging the cursor into the borders of the sheet
    //

    SocialCalc.AutoRepeatInfo = {
        timer: null, // timer object for repeating
        mouseinfo: null, // result from SocialCalc.GridMousePosition
        repeatinterval: 1000, // milliseconds to wait between repeats
        editor: null, // editor object to use when it repeats
        repeatcallback: null, // used instead of default when repeating (e.g., for cellhandles)
        // called as: repeatcallback(newcoord, direction)
    };

// Control auto-repeat. If mouseinfo==null, cancel.

/**
 * Sets up or cancels drag auto-repeat functionality
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {Object|null} mouseinfo - Mouse information object or null to cancel
 * @param {Function} callback - Optional callback function
 */
SocialCalc.SetDragAutoRepeat = function (editor, mouseinfo, callback) {
    let repeatinfo = SocialCalc.AutoRepeatInfo;
    let coord = null;
    let direction = null;

    repeatinfo.repeatcallback = callback; // null in regular case

    if (!mouseinfo) {
        // cancel
        if (repeatinfo.timer) {
            // If was repeating, stop
            window.clearTimeout(repeatinfo.timer); // cancel timer
            repeatinfo.timer = null;
        }
        repeatinfo.mouseinfo = null;
        return; // done
    }

    repeatinfo.editor = editor;

    if (repeatinfo.mouseinfo) {
        // check for change while repeating
        if (mouseinfo.rowheader || mouseinfo.rowfooter) {
            if (mouseinfo.row !== repeatinfo.mouseinfo.row) {
                // changed row while dragging sidewards
                coord = SocialCalc.crToCoord(editor.ecell.col, mouseinfo.row); // change to it
                if (repeatinfo.repeatcallback) {
                    if (mouseinfo.row < repeatinfo.mouseinfo.row) {
                        direction = "left";
                    } else if (mouseinfo.row > repeatinfo.mouseinfo.row) {
                        direction = "right";
                    } else {
                        direction = "";
                    }
                    repeatinfo.repeatcallback(coord, direction);
                } else {
                    editor.MoveECell(coord);
                    editor.MoveECell(coord);
                    editor.RangeExtend();
                    editor.EditorMouseRange(coord);
                }
            }
        } else if (mouseinfo.colheader || mouseinfo.colfooter) {
            if (mouseinfo.col !== repeatinfo.mouseinfo.col) {
                // changed col while dragging vertically
                coord = SocialCalc.crToCoord(mouseinfo.col, editor.ecell.row); // change to it
                if (repeatinfo.repeatcallback) {
                    if (mouseinfo.row < repeatinfo.mouseinfo.row) {
                        direction = "left";
                    } else if (mouseinfo.row > repeatinfo.mouseinfo.row) {
                        direction = "right";
                    } else {
                        direction = "";
                    }
                    repeatinfo.repeatcallback(coord, direction);
                } else {
                    editor.MoveECell(coord);
                    editor.RangeExtend();
                    editor.EditorMouseRange(coord);
                }
            }
        }
    }

    repeatinfo.mouseinfo = mouseinfo;

    if (mouseinfo.distance < 5) repeatinfo.repeatinterval = 333;
    else if (mouseinfo.distance < 10) repeatinfo.repeatinterval = 250;
    else if (mouseinfo.distance < 25) repeatinfo.repeatinterval = 100;
    else if (mouseinfo.distance < 35) repeatinfo.repeatinterval = 75;
    else {
        // too far - stop repeating
        if (repeatinfo.timer) {
            // if repeating, cancel it
            window.clearTimeout(repeatinfo.timer); // cancel timer
            repeatinfo.timer = null;
        }
        return;
    }

    if (!repeatinfo.timer) {
        // start if not already running
        repeatinfo.timer = window.setTimeout(
            SocialCalc.DragAutoRepeat,
            repeatinfo.repeatinterval
        );
    }
};

/**
 * Handles the auto-repeat functionality for dragging
 */
SocialCalc.DragAutoRepeat = function () {
    let repeatinfo = SocialCalc.AutoRepeatInfo;
    let mouseinfo = repeatinfo.mouseinfo;

    let direction = null;
    let coord = null;
    let cr = null;

    if (mouseinfo.rowheader) direction = "left";
    else if (mouseinfo.rowfooter) direction = "right";
    else if (mouseinfo.colheader) direction = "up";
    else if (mouseinfo.colfooter) direction = "down";

    if (repeatinfo.repeatcallback) {
        cr = SocialCalc.coordToCr(repeatinfo.editor.ecell.coord);
        if (direction === "left" && cr.col > 1) cr.col--;
        else if (direction === "right") cr.col++;
        else if (direction === "up" && cr.row > 1) cr.row--;
        else if (direction === "down") cr.row++;
        coord = SocialCalc.crToCoord(cr.col, cr.row);
        repeatinfo.repeatcallback(coord, direction);
    } else {
        coord = repeatinfo.editor.MoveECellWithKey(`[a${direction}]shifted`);
        if (coord) repeatinfo.editor.EditorMouseRange(coord);
    }

    repeatinfo.timer = window.setTimeout(
        SocialCalc.DragAutoRepeat,
        repeatinfo.repeatinterval
    );
};

    //
    // Handling Clicking
    //

/**
 * Processes double-click events for editors
 * 
 * @param {Event} e - The mouse event
 */
SocialCalc.ProcessEditorDblClick = function (e) {
    let editor = null;
    let result = null;
    let coord = null;
    let textarea = null;
    let wval = null;
    let range = null;
    let sheetobj = null;

    let event = e || window.event;

    let viewport = SocialCalc.GetViewportInfo();
    let clientX = event.clientX + viewport.horizontalScroll;
    let clientY = event.clientY + viewport.verticalScroll;

    let mouseinfo = SocialCalc.EditorMouseInfo;
    let ele = event.target || event.srcElement; // source object is often within what we want
    let mobj = null;

    if (mouseinfo.ignore) return; // ignore this

    for (mobj = null; !mobj && ele; ele = ele.parentNode) {
        // go up tree looking for one of our elements
        mobj = SocialCalc.LookupElement(ele, mouseinfo.registeredElements);
    }
    if (!mobj) {
        mouseinfo.editor = null;
        return; // not one of our elements
    }

    editor = mobj.editor;

    result = SocialCalc.GridMousePosition(editor, clientX, clientY);
    if (!result || !result.coord) return; // not within cell area - ignore

    mouseinfo.editor = editor; // remember for later
    mouseinfo.element = ele;
    range = editor.range;

    sheetobj = editor.context.sheetobj;

    switch (editor.state) {
        case "start":
            SocialCalc.EditorOpenCellEdit(editor);
            break;

        case "input":
            break;

        default:
            break;
    }

    if (event.stopPropagation) {
        event.stopPropagation(); // DOM Level 2
    } else {
        event.cancelBubble = true; // IE 5+
    }
    
    if (event.preventDefault) {
        event.preventDefault(); // DOM Level 2
    } else {
        event.returnValue = false; // IE 5+
    }
};

/**
 * Opens a cell for editing
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @returns {boolean} True if editing should be prevented
 */
SocialCalc.EditorOpenCellEdit = function (editor) {
    let wval = null;

    if (!editor.ecell) return true; // no ecell
    if (!editor.inputBox) return true; // no input box, so no editing (happens on noEdit)
    if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
        if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
            return true;
        }
    }
    if (editor.inputBox.element.disabled) return true; // multi-line: ignore
    if (editor.inputBox.element.style.display === "none") {
        for (let f in editor.StatusCallback) {
            editor.StatusCallback[f].func(
                editor,
                "editecell",
                null,
                editor.StatusCallback[f].params
            );
        }
        return true; // no inputBox display, so no editing
    }
    editor.inputBox.ShowInputBox(true);
    editor.inputBox.Focus();

    editor.state = "inputboxdirect";

    editor.inputBox.SetText("");
    editor.inputBox.DisplayCellContents();
    editor.inputBox.Select("end");
    wval = editor.workingvalues;
    wval.partialexpr = "";
    wval.ecoord = editor.ecell.coord;
    wval.erow = editor.ecell.row;
    wval.ecol = editor.ecell.col;
    wval.startsheet = wval.currentsheet;
    wval.startsheetid = wval.currentsheetid;
};

/**
 * Processes key input for the editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} ch - The character or key code
 * @param {Event} e - The keyboard event
 * @returns {boolean} True if key should be handled by browser
 */
SocialCalc.EditorProcessKey = function (editor, ch, e) {
    let result = null;
    let cell = null;
    let cellobj = null;
    let valueinfo = null;
    let fch = null;
    let coord = null;
    let inputtext = null;
    let f = null;

    let sheetobj = editor.context.sheetobj;
    let wval = editor.workingvalues;
    let range = editor.range;

    if (typeof ch !== "string") ch = "";

    switch (editor.state) {
        case "start":
            if (e.shiftKey && ch.substr(0, 2) === "[a") {
                ch = ch + "shifted";
            }
            if (ch === "[enter]") ch = "[adown]";
            if (ch === "[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
            if (
                ch.substr(0, 2) === "[a" ||
                ch.substr(0, 3) === "[pg" ||
                ch === "[home]"
            ) {
                result = editor.MoveECellWithKey(ch);
                return !result;
            }
            if (ch === "[del]" || ch === "[backspace]") {
                if (!editor.noEdit) {
                    editor.EditorApplySetCommandsToRange("empty", "");
                }
                if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
                    if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
                        return true;
                    }
                }

                break;
            }
            if (ch === "[esc]") {
                if (range.hasrange) {
                    editor.RangeRemove();
                    editor.MoveECell(range.anchorcoord);
                    for (f in editor.StatusCallback) {
                        editor.StatusCallback[f].func(
                            editor,
                            "specialkey",
                            ch,
                            editor.StatusCallback[f].params
                        );
                    }
                }
                return false;
            }

            if (ch === "[f2]") {
                if (editor.noEdit) return true;
                SocialCalc.EditorOpenCellEdit(editor);
                return false;
            }

            if ((ch.length > 1 && ch.substr(0, 1) === "[") || ch.length === 0) {
                // some control key
                if (editor.ctrlkeyFunction && ch.length > 0) {
                    return editor.ctrlkeyFunction(editor, ch);
                } else {
                    return true;
                }
            }
            if (!editor.ecell) return true; // no ecell
            if (!editor.inputBox) return true; // no inputBox so no editing
            if (editor.inputBox.element.style.display === "none") {
                for (f in editor.StatusCallback) {
                    editor.StatusCallback[f].func(
                        editor,
                        "editecell",
                        ch,
                        editor.StatusCallback[f].params
                    );
                }
                return true; // no inputBox display, so no editing
            }
            if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
                if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
                    return true;
                }
            }

            editor.inputBox.element.disabled = false; // make sure editable
            editor.state = "input";
            editor.inputBox.ShowInputBox(true);
            editor.inputBox.Focus();
            editor.inputBox.SetText(ch);
            editor.inputBox.Select("end");
            wval.partialexpr = "";
            wval.ecoord = editor.ecell.coord;
            wval.erow = editor.ecell.row;
            wval.ecol = editor.ecell.col;
            wval.startsheet = wval.currentsheet;
            wval.startsheetid = wval.currentsheetid;
            editor.RangeRemove();
            break;

        case "input":
            inputtext = editor.inputBox.GetText(); // should not get here if no inputBox
            if (editor.inputBox.skipOne) return false; // ignore a key already handled
            if (
                ch === "[esc]" ||
                ch === "[enter]" ||
                ch === "[tab]" ||
                (ch && ch.substr(0, 2) === "[a")
            ) {
                if (
                    ("(+-*/,:!&<>=^".indexOf(inputtext.slice(-1)) >= 0 &&
                        inputtext.slice(0, 1) === "=") ||
                    inputtext === "="
                ) {
                    wval.partialexpr = inputtext;
                }
                if (wval.partialexpr) {
                    // if in pointing operation
                    if (e.shiftKey && ch.substr(0, 2) === "[a") {
                        ch = ch + "shifted";
                    }
                    coord = editor.MoveECellWithKey(ch);
                    if (coord) {
                        if (range.hasrange) {
                            editor.inputBox.SetText(
                                wval.partialexpr +
                                SocialCalc.crToCoord(range.left, range.top) +
                                ":" +
                                SocialCalc.crToCoord(range.right, range.bottom)
                            );
                        } else {
                            editor.inputBox.SetText(wval.partialexpr + coord);
                        }
                        return false;
                    }
                }
                editor.inputBox.Blur();
                editor.inputBox.ShowInputBox(false);
                editor.state = "start";
                editor.cellhandles.ShowCellHandles(true);
                if (ch !== "[esc]") {
                    editor.EditorSaveEdit();
                    if (editor.ecell.coord !== wval.ecoord) {
                        editor.MoveECell(wval.ecoord);
                    }
                    if (ch === "[enter]") ch = "[adown]";
                    if (ch === "[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
                    if (ch.substr(0, 2) === "[a") {
                        editor.MoveECellWithKey(ch);
                    }
                } else {
                    editor.inputBox.DisplayCellContents();
                    editor.RangeRemove();
                    editor.MoveECell(wval.ecoord);
                }
                break;
            }
            if (wval.partialexpr && ch === "[backspace]") {
                editor.inputBox.SetText(wval.partialexpr);
                wval.partialexpr = "";
                editor.RangeRemove();
                editor.MoveECell(wval.ecoord);
                editor.inputBox.ShowInputBox(true); // make sure it's moved back if necessary
                return false;
            }
            if (ch === "[f2]") return false;
            if (range.hasrange) {
                editor.RangeRemove();
            }
            editor.MoveECell(wval.ecoord);
            if (wval.partialexpr) {
                editor.inputBox.ShowInputBox(true); // make sure it's moved back if necessary
                wval.partialexpr = ""; // not pointing
            }
            return true;

        case "inputboxdirect":
            inputtext = editor.inputBox.GetText(); // should not get here if no inputBox
            if (ch === "[esc]" || ch === "[enter]" || ch === "[tab]") {
                editor.inputBox.Blur();
                editor.inputBox.ShowInputBox(false);
                editor.state = "start";
                editor.cellhandles.ShowCellHandles(true);
                if (ch === "[esc]") {
                    editor.inputBox.DisplayCellContents();
                } else {
                    editor.EditorSaveEdit();
                    if (editor.ecell.coord !== wval.ecoord) {
                        editor.MoveECell(wval.ecoord);
                    }
                    if (ch === "[enter]") ch = "[adown]";
                    if (ch === "[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
                    if (ch.substr(0, 2) === "[a") {
                        editor.MoveECellWithKey(ch);
                    }
                }
                break;
            }
            if (ch === "[f2]") return false;
            return true;

        case "skip-and-start":
            editor.state = "start";
            editor.cellhandles.ShowCellHandles(true);
            return false;

        default:
            return true;
    }

    return false;
};

/**
 * Adds text to the editor input
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} str - The string to add
 * @param {string} prefix - Optional prefix to add
 */
SocialCalc.EditorAddToInput = function (editor, str, prefix) {
    let wval = editor.workingvalues;

    if (editor.noEdit) return;

    if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
        if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
            return true;
        }
    }

    switch (editor.state) {
        case "start":
            editor.state = "input";
            editor.inputBox.ShowInputBox(true);
            editor.inputBox.element.disabled = false; // make sure editable and overwrite old
            editor.inputBox.Focus();
            editor.inputBox.SetText((prefix || "") + str);
            editor.inputBox.Select("end");
            wval.partialexpr = "";
            wval.ecoord = editor.ecell.coord;
            wval.erow = editor.ecell.row;
            wval.ecol = editor.ecell.col;
            wval.startsheet = wval.currentsheet;
            wval.startsheetid = wval.currentsheetid;
            editor.RangeRemove();
            break;

        case "input":
        case "inputboxdirect":
            editor.inputBox.element.focus();
            if (wval.partialexpr) {
                editor.inputBox.SetText(wval.partialexpr);
                wval.partialexpr = "";
                editor.RangeRemove();
                editor.MoveECell(wval.ecoord);
            }
            editor.inputBox.SetText(editor.inputBox.GetText() + str);
            break;

        default:
            break;
    }
};

/**
 * Displays cell contents in the editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 */
SocialCalc.EditorDisplayCellContents = function (editor) {
    if (editor.inputBox) editor.inputBox.DisplayCellContents();
};
let arr = [];

/**
 * Saves the current edit to the sheet
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} text - Optional text to save (otherwise gets from input box)
 */
SocialCalc.EditorSaveEdit = function (editor, text) {
    //console.log("editorSaveEdit");
    let result = null;
    let cell = null;
    let valueinfo = null;
    let fch = null;
    let type = null;
    let value = null;
    let oldvalue = null;
    let cmdline = null;

    let sheetobj = editor.context.sheetobj;
    let wval = editor.workingvalues;

    if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
        if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
            return true;
        }
    }

    type = "text t";
    //changes for prompt

    value = typeof text === "string" ? text : editor.inputBox.GetText(); // either explicit or from input box

    oldvalue = SocialCalc.GetCellContents(sheetobj, wval.ecoord) + "";
    //console.log("old:"+oldvalue)
    //console.log("new:"+value)
    if (value === oldvalue) {
        // no change
        return;
    }
    if ("'" + value === oldvalue) {
        return;
    }

    fch = value.charAt(0);
    if (fch === "=" && value.indexOf("\n") === -1) {
        type = "formula";
        value = value.substring(1);
    } else if (fch === "'") {
        type = "text t";
        value = value.substring(1);
    } else if (value.length === 0) {
        type = "empty";
    } else {
        valueinfo = SocialCalc.DetermineValueType(value);
        if (valueinfo.type === "n" && value === valueinfo.value + "") {
            // see if don't need "constant"
            type = "value n";
        } else if (valueinfo.type.charAt(0) === "t") {
            type = "text " + valueinfo.type;
        } else if (valueinfo.type === "") {
            type = "text t";
        } else {
            type = "constant " + valueinfo.type + " " + valueinfo.value;
        }
    }

    if (type.charAt(0) === "t") {
        // text
        value = SocialCalc.encodeForSave(value); // newlines, :, and \ are escaped
    }

    // if startsheet different from currentsheet, switch to start sheet
    // for the save to take effect
    if (SocialCalc.WorkBook && wval.currentsheet !== wval.startsheet) {
        let control = SocialCalc.GetCurrentWorkBookControl();
        let cmdstr = "activatesheet " + wval.startsheetid;
        control.ExecuteWorkBookControlCommand(
            { cmdtype: "wcmd", id: "0", cmdstr: cmdstr },
            false
        );
    }

    cmdline = `set ${wval.ecoord} ${type} ${value}`;
    editor.EditorScheduleSheetCommands(cmdline, true, false);
};

/**
 * Takes ecell or range and does a "set" command with cmd
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} cmd - The command to apply
 */
SocialCalc.EditorApplySetCommandsToRange = function (editor, cmd) {
    let cell = null;
    let row = null;
    let col = null;
    let line = null;
    let errortext = null;

    let sheetobj = editor.context.sheetobj;
    let ecell = editor.ecell;
    let range = editor.range;

    if (range.hasrange) {
        let coord =
            SocialCalc.crToCoord(range.left, range.top) +
            ":" +
            SocialCalc.crToCoord(range.right, range.bottom);
        line = `set ${coord} ${cmd}`;
        errortext = editor.EditorScheduleSheetCommands(line, true, false);
    } else {
        line = `set ${ecell.coord} ${cmd}`;
        errortext = editor.EditorScheduleSheetCommands(line, true, false);
    }

    editor.DisplayCellContents();
};

/**
 * Processes mouse wheel events for the editor
 * 
 * @param {Event} event - The mouse wheel event
 * @param {number} delta - The wheel delta
 * @param {Object} mousewheelinfo - Mouse wheel information
 * @param {Object} wobj - Window object
 */
SocialCalc.EditorProcessMouseWheel = function (event, delta, mousewheelinfo, wobj) {
    if (wobj.functionobj.editor.busy) return; // ignore if busy

    if (delta > 0) {
        wobj.functionobj.editor.ScrollRelative(true, -1);
    }
    if (delta < 0) {
        wobj.functionobj.editor.ScrollRelative(true, +1);
    }
};

    //
    // GridMousePosition(editor, clientX, clientY)
    //
    // Returns an object with row and col numbers and coord (spans handled for coords),
    // and rowheader/colheader true if in header (where coord will be undefined).
    // If in colheader, will return coltoresize if on appropriate place in col header.
    // Also, there is rowfooter (on right) and colfooter (on bottom).
    // In row/col header/footer, returns "distance" as pixels over the edge.
    //

/**
 * Determines the position of the mouse relative to the grid
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {number} clientX - Client X coordinate
 * @param {number} clientY - Client Y coordinate
 * @returns {Object|null} Position information object or null
 */
SocialCalc.GridMousePosition = function (editor, clientX, clientY) {
    let row = 1;
    let col = 1;
    let colpane = 0;
    let result = {};

    for (row = 1; row < editor.rowpositions.length; row++) {
        if (!editor.rowheight[row]) continue; // not rendered yet -- may be above or below us
        if (editor.rowpositions[row] + editor.rowheight[row] > clientY) {
            break;
        }
    }
    for (col = 1; col < editor.colpositions.length; col++) {
        if (!editor.colwidth[col]) continue;
        if (editor.colpositions[col] + editor.colwidth[col] > clientX) {
            break;
        }
    }

    result.row = row;
    result.col = col;

    if (editor.headposition) {
        if (
            clientX < editor.headposition.left &&
            clientX >= editor.gridposition.left
        ) {
            result.rowheader = true;
            result.distance = editor.headposition.left - clientX;
            return result;
        } else if (
            clientY < editor.headposition.top &&
            clientY > editor.gridposition.top
        ) {
            // > because of sizing row
            result.colheader = true;
            result.distance = editor.headposition.top - clientY;
            result.coltoresize =
                col -
                (editor.colpositions[col] + editor.colwidth[col] / 2 > clientX
                    ? 1
                    : 0) || 1;
            for (colpane = 0; colpane < editor.context.colpanes.length; colpane++) {
                if (
                    result.coltoresize >= editor.context.colpanes[colpane].first &&
                    result.coltoresize <= editor.context.colpanes[colpane].last
                ) {
                    // visible column
                    return result;
                }
            }
            delete result.coltoresize;
            return result;
        } else if (clientX >= editor.verticaltablecontrol.controlborder) {
            result.rowfooter = true;
            result.distance = clientX - editor.verticaltablecontrol.controlborder;
            return result;
        } else if (clientY >= editor.horizontaltablecontrol.controlborder) {
            result.colfooter = true;
            result.distance = clientY - editor.horizontaltablecontrol.controlborder;
            return result;
        } else if (clientX < editor.gridposition.left) {
            result.rowheader = true;
            result.distance = editor.headposition.left - clientX;
            return result;
        } else if (clientY <= editor.gridposition.top) {
            result.colheader = true;
            result.distance = editor.headposition.top - clientY;
            return result;
        } else {
            result.coord = SocialCalc.crToCoord(result.col, result.row);
            if (editor.context.cellskip[result.coord]) {
                // handle skipped cells
                result.coord = editor.context.cellskip[result.coord];
            }
            return result;
        }
    }

    return null;
};

/**
 * Gets the DOM element for a specific cell in the editor
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {number} row - The row number
 * @param {number} col - The column number
 * @returns {Object|null} Object with element, rowpane, colpane or null if not found
 */
SocialCalc.GetEditorCellElement = function (editor, row, col) {
    let rowpane = 0;
    let colpane = 0;
    let c = 0;
    let coord = null;
    let rowindex = 0;
    let colindex = 0;

    for (rowpane = 0; rowpane < editor.context.rowpanes.length; rowpane++) {
        if (
            row >= editor.context.rowpanes[rowpane].first &&
            row <= editor.context.rowpanes[rowpane].last
        ) {
            for (colpane = 0; colpane < editor.context.colpanes.length; colpane++) {
                if (
                    col >= editor.context.colpanes[colpane].first &&
                    col <= editor.context.colpanes[colpane].last
                ) {
                    rowindex += row - editor.context.rowpanes[rowpane].first + 2;
                    for (c = editor.context.colpanes[colpane].first; c <= col; c++) {
                        coord = editor.context.cellskip[SocialCalc.crToCoord(c, row)];
                        if (
                            !coord ||
                            !editor.context.CoordInPane(coord, rowpane, colpane)
                        ) {
                            // don't count col-spanned cells
                            colindex++;
                        }
                    }
                    return {
                        element:
                            editor.griddiv.firstChild.lastChild.childNodes[rowindex]
                                .childNodes[colindex],
                        rowpane: rowpane,
                        colpane: colpane,
                    };
                }
                for (
                    c = editor.context.colpanes[colpane].first;
                    c <= editor.context.colpanes[colpane].last;
                    c++
                ) {
                        coord = editor.context.cellskip[SocialCalc.crToCoord(c, row)];
                        if (!coord || !editor.context.CoordInPane(coord, rowpane, colpane))
                            // don't count col-spanned cells
                            colindex++;
                    }
                    colindex += 1;
                }
            }
            rowindex +=
                editor.context.rowpanes[rowpane].last -
                editor.context.rowpanes[rowpane].first +
                1 +
                1;
        }

        return null;
    };

    //
    // cellcoord = MoveECellWithKey(editor, ch)
/**
 * Processes an arrow key, etc., moving the edit cell
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} ch - The key character/code
 * @returns {string|null} New coordinate or null if not a movement key
 */
SocialCalc.MoveECellWithKey = function (editor, ch) {
    let coord = null;
    let row = 0;
    let col = 0;
    let cell = null;
    let shifted = false;

    if (!editor.ecell) {
        return null;
    }

    if (ch.slice(-7) === "shifted") {
        ch = ch.slice(0, -7);
        shifted = true;
    }

    row = editor.ecell.row;
    col = editor.ecell.col;
    cell = editor.context.sheetobj.cells[editor.ecell.coord];

    switch (ch) {
        case "[adown]":
            row += (cell && cell.rowspan) || 1;
            break;
        case "[aup]":
            row--;
            break;
        case "[pgdn]":
            row += editor.pageUpDnAmount - 1 + ((cell && cell.rowspan) || 1);
            break;
        case "[pgup]":
            row -= editor.pageUpDnAmount;
            break;
        case "[aright]":
            col += (cell && cell.colspan) || 1;
            break;
        case "[aleft]":
            col--;
            break;
        case "[home]":
            row = 1;
            col = 1;
            break;
        default:
            return null;
    }

    if (!editor.range.hasrange) {
        if (shifted) editor.RangeAnchor();
    }

    coord = editor.MoveECell(SocialCalc.crToCoord(col, row));

    if (editor.range.hasrange) {
        if (shifted) editor.RangeExtend();
        else editor.RangeRemove();
    }

    return coord;
};

/**
 * Takes a coordinate and returns the new edit cell coordinate
 * (which may be different if newecell is covered by a span)
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 * @param {string} newcell - The new cell coordinate
 * @returns {string} The actual new cell coordinate
 */
SocialCalc.MoveECell = function (editor, newcell) {
    let cell = null;
    let f = null;

    let highlights = editor.context.highlights;

    if (editor.ecell) {
        //changes for prompt
        if (editor.ecell.coord === newcell) return newcell;

        if (SocialCalc.Callbacks.broadcast) {
            SocialCalc.Callbacks.broadcast("ecell", {
                original: editor.ecell.coord,
                ecell: newcell,
            });
        }

        cell = SocialCalc.GetEditorCellElement(
            editor,
            editor.ecell.row,
            editor.ecell.col
        );
        delete highlights[editor.ecell.coord];
        if (
            editor.range2.hasrange &&
            editor.ecell.row >= editor.range2.top &&
            editor.ecell.row <= editor.range2.bottom &&
            editor.ecell.col >= editor.range2.left &&
            editor.ecell.col <= editor.range2.right
        ) {
            highlights[editor.ecell.coord] = "range2";
        }
        editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
        editor.SetECellHeaders(""); // set to regular col/rowname styles
        editor.cellhandles.ShowCellHandles(false);
    } else if (SocialCalc.Callbacks.broadcast) {
        SocialCalc.Callbacks.broadcast("ecell", { ecell: newcell });
    }
    newcell = editor.context.cellskip[newcell] || newcell;
    editor.ecell = SocialCalc.coordToCr(newcell);
    editor.ecell.coord = newcell;
    cell = SocialCalc.GetEditorCellElement(
        editor,
        editor.ecell.row,
        editor.ecell.col
    );
    highlights[newcell] = "cursor";

    for (f in editor.MoveECellCallback) {
        // let others know
        editor.MoveECellCallback[f](editor);
    }

    editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
    editor.SetECellHeaders("selected");

    for (f in editor.StatusCallback) {
        // let status line, etc., know
        editor.StatusCallback[f].func(
            editor,
            "moveecell",
            newcell,
            editor.StatusCallback[f].params
        );
    }

    if (editor.busy) {
        editor.ensureecell = true; // wait for when not busy
    } else {
        editor.ensureecell = false;
        editor.EnsureECellVisible();
    }

    return newcell;
};

/**
 * Ensures the edit cell is visible by scrolling if necessary
 * 
 * @param {SocialCalc.TableEditor} editor - The table editor
 */
SocialCalc.EnsureECellVisible = function (editor) {
    let vamount = 0;
    let hamount = 0;

        if (editor.ecell.row > editor.lastnonscrollingrow) {
            if (editor.ecell.row < editor.firstscrollingrow) {
                vamount = editor.ecell.row - editor.firstscrollingrow;
            } else if (editor.ecell.row > editor.lastvisiblerow) {
                vamount = editor.ecell.row - editor.lastvisiblerow;
            }
        }
        if (editor.ecell.col > editor.lastnonscrollingcol) {
            if (editor.ecell.col < editor.firstscrollingcol) {
                hamount = editor.ecell.col - editor.firstscrollingcol;
            } else if (editor.ecell.col > editor.lastvisiblecol) {
                hamount = editor.ecell.col - editor.lastvisiblecol;
            }
        }

        if (vamount !== 0 || hamount !== 0) {
            editor.ScrollRelativeBoth(vamount, hamount);
        } else {
            editor.cellhandles.ShowCellHandles(true);
        }
    };

    /**
     * Replaces a cell's content and styling
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {Object} cell - The cell object to replace
     * @param {number} row - The row number
     * @param {number} col - The column number
     */
    SocialCalc.ReplaceCell = function (editor, cell, row, col) {
        let newelement, a;
        if (!cell) return;
        newelement = editor.context.RenderCell(
            row,
            col,
            cell.rowpane,
            cell.colpane,
            true,
            null
        );
        if (newelement) {
            // Don't use a real element and replaceChild, which seems to have focus issues with IE, Firefox, and speed issues
            cell.element.innerHTML = newelement.innerHTML;
            cell.element.style.cssText = "";
            cell.element.className = newelement.className;
            for (a in newelement.style) {
                if (newelement.style[a] !== "cssText")
                    cell.element.style[a] = newelement.style[a];
            }
        }
    };

    /**
     * Updates a cell's CSS styling
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {Object} cell - The cell object to update
     * @param {number} row - The row number
     * @param {number} col - The column number
     */
    SocialCalc.UpdateCellCSS = function (editor, cell, row, col) {
        let newelement, a;
        if (!cell) return;
        newelement = editor.context.RenderCell(
            row,
            col,
            cell.rowpane,
            cell.colpane,
            true,
            null
        );
        if (newelement) {
            cell.element.style.cssText = "";
            cell.element.className = newelement.className;
            for (a in newelement.style) {
                if (newelement.style[a] !== "cssText")
                    cell.element.style[a] = newelement.style[a];
            }
        }
    };

    /**
     * Sets the header styling for the currently selected cell
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {boolean} selected - Whether the cell is selected
     */
    SocialCalc.SetECellHeaders = function (editor, selected) {
        let ecell = editor.ecell;
        let context = editor.context;

        let rowpane, colpane, first, last;
        let rowindex = 0;
        let colindex = 0;
        let headercell;

        if (!ecell) return;

        for (rowpane = 0; rowpane < context.rowpanes.length; rowpane++) {
            first = context.rowpanes[rowpane].first;
            last = context.rowpanes[rowpane].last;
            if (ecell.row >= first && ecell.row <= last) {
                headercell =
                    editor.fullgrid.childNodes[1].childNodes[
                        2 + rowindex + ecell.row - first
                    ].childNodes[0];
                if (headercell) {
                    if (context.classnames)
                        headercell.className = context.classnames[selected + "rowname"];
                    if (context.explicitStyles)
                        headercell.style.cssText =
                            context.explicitStyles[selected + "rowname"];
                    headercell.style.verticalAlign = "top"; // to get around Safari making top of centered row number be
                    // considered top of row (and can't get <row> position in Safari)
                }
            }
            rowindex += last - first + 1 + 1;
        }

        for (colpane = 0; colpane < context.colpanes.length; colpane++) {
            first = context.colpanes[colpane].first;
            last = context.colpanes[colpane].last;
            if (ecell.col >= first && ecell.col <= last) {
                headercell =
                    editor.fullgrid.childNodes[1].childNodes[1].childNodes[
                    1 + colindex + ecell.col - first
                    ];
                if (headercell) {
                    if (context.classnames)
                        headercell.className = context.classnames[selected + "colname"];
                    if (context.explicitStyles)
                        headercell.style.cssText =
                            context.explicitStyles[selected + "colname"];
                }
            }
            colindex += last - first + 1 + 1;
        }
    };

    /**
     * Anchors a range to the specified coordinate
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {string} ecoord - The coordinate to anchor to (optional, defaults to ecell)
     */
    SocialCalc.RangeAnchor = function (editor, ecoord) {
        if (editor.range.hasrange) {
            editor.RangeRemove();
        }

        editor.RangeExtend(ecoord);
    };

    /**
     * Extends the range to the specified coordinate
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {string} ecoord - The coordinate to extend to (optional, defaults to ecell)
     */
    SocialCalc.RangeExtend = function (editor, ecoord) {
        let a, cell, cr, coord, row, col, f;

        let highlights = editor.context.highlights;
        let range = editor.range;
        let range2 = editor.range2;

        let ecell;
        if (ecoord) {
            ecell = SocialCalc.coordToCr(ecoord);
            ecell.coord = ecoord;
        } else ecell = editor.ecell;

        if (!ecell) return; // just in case
        if (SocialCalc.Constants.SCNoRanging) return;

        if (!range.hasrange) {
            // called without RangeAnchor...
            range.anchorcoord = ecell.coord;
            range.anchorrow = ecell.row;
            range.top = ecell.row;
            range.bottom = ecell.row;
            range.anchorcol = ecell.col;
            range.left = ecell.col;
            range.right = ecell.col;
            range.hasrange = true;
        }

        if (range.anchorrow < ecell.row) {
            range.top = range.anchorrow;
            range.bottom = ecell.row;
        } else {
            range.top = ecell.row;
            range.bottom = range.anchorrow;
        }
        if (range.anchorcol < ecell.col) {
            range.left = range.anchorcol;
            range.right = ecell.col;
        } else {
            range.left = ecell.col;
            range.right = range.anchorcol;
        }

        for (coord in highlights) {
            switch (highlights[coord]) {
                case "range":
                    highlights[coord] = "unrange";
                    break;
                case "range2":
                    highlights[coord] = "unrange2";
                    break;
            }
        }

        for (row = range.top; row <= range.bottom; row++) {
            for (col = range.left; col <= range.right; col++) {
                coord = SocialCalc.crToCoord(col, row);
                switch (highlights[coord]) {
                    case "unrange":
                        highlights[coord] = "range";
                        break;
                    case "cursor":
                        break;
                    case "unrange2":
                    default:
                        highlights[coord] = "newrange";
                        break;
                }
            }
        }

        for (row = range2.top; range2.hasrange && row <= range2.bottom; row++) {
            for (col = range2.left; col <= range2.right; col++) {
                coord = SocialCalc.crToCoord(col, row);
                switch (highlights[coord]) {
                    case "unrange2":
                        highlights[coord] = "range2";
                        break;
                    case "range":
                    case "newrange":
                    case "cursor":
                        break;
                    default:
                        highlights[coord] = "newrange2";
                        break;
                }
            }
        }

        for (coord in highlights) {
            switch (highlights[coord]) {
                case "unrange":
                    delete highlights[coord];
                    break;
                case "newrange":
                    highlights[coord] = "range";
                    break;
                case "newrange2":
                    highlights[coord] = "range2";
                    break;
                case "range":
                case "range2":
                case "cursor":
                    continue;
            }

            cr = SocialCalc.coordToCr(coord);
            cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
            editor.UpdateCellCSS(cell, cr.row, cr.col);
        }

        for (f in editor.RangeChangeCallback) {
            // let others know
            editor.RangeChangeCallback[f](editor);
        }

        // create range/coord string and do status callback

        coord = SocialCalc.crToCoord(editor.range.left, editor.range.top);
        if (
            editor.range.left !== editor.range.right ||
            editor.range.top !== editor.range.bottom
        ) {
            // more than one cell
            coord +=
                `:${SocialCalc.crToCoord(editor.range.right, editor.range.bottom)}`;
        }
        for (f in editor.StatusCallback) {
            editor.StatusCallback[f].func(
                editor,
                "rangechange",
                coord,
                editor.StatusCallback[f].params
            );
        }

        return;
    };

    /**
     * Removes the current range selection
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.RangeRemove = function (editor) {
        let cell, cr, coord, row, col, f;

        let highlights = editor.context.highlights;
        let range = editor.range;
        let range2 = editor.range2;

        if (!range.hasrange && !range2.hasrange) return;

        for (row = range2.top; range2.hasrange && row <= range2.bottom; row++) {
            for (col = range2.left; col <= range2.right; col++) {
                coord = SocialCalc.crToCoord(col, row);
                switch (highlights[coord]) {
                    case "range":
                        highlights[coord] = "newrange2";
                        break;
                    case "range2":
                    case "cursor":
                        break;
                    default:
                        highlights[coord] = "newrange2";
                        break;
                }
            }
        }

        for (coord in highlights) {
            switch (highlights[coord]) {
                case "range":
                    delete highlights[coord];
                    break;
                case "newrange2":
                    highlights[coord] = "range2";
                    break;
                case "cursor":
                    continue;
            }
            cr = SocialCalc.coordToCr(coord);
            cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
            editor.UpdateCellCSS(cell, cr.row, cr.col);
        }

        range.hasrange = false;

        for (f in editor.RangeChangeCallback) {
            // let others know
            editor.RangeChangeCallback[f](editor);
        }

        for (f in editor.StatusCallback) {
            editor.StatusCallback[f].func(
                editor,
                "rangechange",
                "",
                editor.StatusCallback[f].params
            );
        }

        return;
    };

    /**
     * Removes the secondary range selection
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.Range2Remove = function (editor) {
        let cell, cr, coord, row, col, f;

        let highlights = editor.context.highlights;
        let range2 = editor.range2;

        if (!range2.hasrange) return;

        for (coord in highlights) {
            switch (highlights[coord]) {
                case "range2":
                    delete highlights[coord];
                    break;
                case "range":
                case "cursor":
                    continue;
            }
            cr = SocialCalc.coordToCr(coord);
            cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
            editor.UpdateCellCSS(cell, cr.row, cr.col);
        }

        range2.hasrange = false;

        return;
    };

    /**
     * Calculates the required table dimensions to fit the editing area
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.FitToEditTable = function (editor) {
        let colnum, colname, colwidth, totalwidth, totalrows, rowpane, needed;
        let colpane; // Declare colpane outside the loop

        let context = editor.context;
        let sheetobj = context.sheetobj;
        let sheetcolattribs = sheetobj.colattribs;

        // Calculate column width data

        totalwidth = context.showRCHeaders ? context.rownamewidth - 0 : 0;
        for (colpane = 0; colpane < context.colpanes.length - 1; colpane++) {
            // Get width of all but last pane
            for (
                colnum = context.colpanes[colpane].first;
                colnum <= context.colpanes[colpane].last;
                colnum++
            ) {
                colname = SocialCalc.rcColname(colnum);
                colwidth =
                    sheetobj.colattribs.width[colname] ||
                    sheetobj.attribs.defaultcolwidth ||
                    SocialCalc.Constants.defaultColWidth;
                if (colwidth == "blank" || colwidth == "auto") colwidth = "";
                totalwidth += colwidth && colwidth - 0 > 0 ? colwidth - 0 : 10;
            }
        }

        for (colnum = context.colpanes[colpane].first; colnum <= 10000; colnum++) {
            //!!! max for safety, but makes that col max!!!
            colname = SocialCalc.rcColname(colnum);
            colwidth =
                sheetobj.colattribs.width[colname] ||
                sheetobj.attribs.defaultcolwidth ||
                SocialCalc.Constants.defaultColWidth;
            if (colwidth == "blank" || colwidth == "auto") colwidth = "";
            totalwidth += colwidth && colwidth - 0 > 0 ? colwidth - 0 : 10;
            if (totalwidth > editor.tablewidth) break;
        }

        context.colpanes[colpane].last = colnum;

        // Calculate row height data

        totalrows = context.showRCHeaders ? 1 : 0;
        for (rowpane = 0; rowpane < context.rowpanes.length - 1; rowpane++) {
            // count all panes but last one
            totalrows +=
                context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 1;
        }

        needed = editor.tableheight - totalrows * context.pixelsPerRow; // estimate amount needed

        context.rowpanes[rowpane].last =
            context.rowpanes[rowpane].first +
            Math.floor(needed / context.pixelsPerRow) +
            1;
    };

    /**
     * Calculates screen positions and values of editing elements
     * Called after grid rendering to update positioning data
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.CalculateEditorPositions = function (editor) {
        let rowpane, colpane, i;

        editor.gridposition = SocialCalc.GetElementPosition(editor.griddiv);
        editor.headposition = SocialCalc.GetElementPosition(
            editor.griddiv.firstChild.lastChild.childNodes[2].childNodes[1]
        ); // 3rd tr 2nd td

        editor.rowpositions = [];
        for (rowpane = 0; rowpane < editor.context.rowpanes.length; rowpane++) {
            editor.CalculateRowPositions(
                rowpane,
                editor.rowpositions,
                editor.rowheight
            );
        }
        for (i = 0; i < editor.rowpositions.length; i++) {
            if (editor.rowpositions[i] > editor.gridposition.top + editor.tableheight)
                break;
        }
        editor.lastvisiblerow = i - 1;

        editor.colpositions = [];
        for (colpane = 0; colpane < editor.context.colpanes.length; colpane++) {
            editor.CalculateColPositions(
                colpane,
                editor.colpositions,
                editor.colwidth
            );
        }
        for (i = 0; i < editor.colpositions.length; i++) {
            if (editor.colpositions[i] > editor.gridposition.left + editor.tablewidth)
                break;
        }
        editor.lastvisiblecol = i - 1;

        editor.firstscrollingrow =
            editor.context.rowpanes[editor.context.rowpanes.length - 1].first;
        editor.firstscrollingrowtop =
            editor.rowpositions[editor.firstscrollingrow] || editor.headposition.top;
        editor.lastnonscrollingrow =
            editor.context.rowpanes.length - 1 > 0
                ? editor.context.rowpanes[editor.context.rowpanes.length - 2].last
                : 0;
        editor.firstscrollingcol =
            editor.context.colpanes[editor.context.colpanes.length - 1].first;
        editor.firstscrollingcolleft =
            editor.colpositions[editor.firstscrollingcol] || editor.headposition.left;
        editor.lastnonscrollingcol =
            editor.context.colpanes.length - 1 > 0
                ? editor.context.colpanes[editor.context.colpanes.length - 2].last
                : 0;

        // Now do the table controls

        editor.verticaltablecontrol.ComputeTableControlPositions();
        editor.horizontaltablecontrol.ComputeTableControlPositions();
    };

    /**
     * Schedules a sheet render operation with timeout handling
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.ScheduleRender = function (editor) {
        if (editor.timeout) window.clearTimeout(editor.timeout); // in case called more than once, just use latest

        SocialCalc.EditorSheetStatusCallback(null, "schedrender", null, editor);
        SocialCalc.EditorStepInfo.editor = editor;
        editor.timeout = window.setTimeout(SocialCalc.DoRenderStep, 1);
    };

    /**
     * Executes the render step and schedules position calculations
     */
    SocialCalc.DoRenderStep = function () {
        let editor = SocialCalc.EditorStepInfo.editor;

        editor.timeout = null;

        editor.EditorRenderSheet();

        SocialCalc.EditorSheetStatusCallback(null, "renderdone", null, editor);

        SocialCalc.EditorSheetStatusCallback(null, "schedposcalc", null, editor);

        editor.timeout = window.setTimeout(SocialCalc.DoPositionCalculations, 1);
    };

    /**
     * Schedules position calculations for the editor
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.SchedulePositionCalculations = function (editor) {
        SocialCalc.EditorStepInfo.editor = editor;

        SocialCalc.EditorSheetStatusCallback(null, "schedposcalc", null, editor);

        editor.timeout = window.setTimeout(SocialCalc.DoPositionCalculations, 1);
    };

    /**
     * Updates editor visuals, sliders, and positioning after DOM rendering
     * Note: Only call after DOM objects have been modified and rendered
     */
    SocialCalc.DoPositionCalculations = function () {
        let editor = SocialCalc.EditorStepInfo.editor;

        editor.timeout = null;

        let ok = false;
        try {
            editor.CalculateEditorPositions();
            ok = true;
        } catch (e) { }

        if (!ok) {
            if (typeof $ != "undefined") {
                $(window).trigger("resize");
                setTimeout(SocialCalc.DoPositionCalculations, 400);
            }
            return; /* Workaround IE6 partial-initialized-DOM bug */
        }

        editor.verticaltablecontrol.PositionTableControlElements();
        editor.horizontaltablecontrol.PositionTableControlElements();

        SocialCalc.EditorSheetStatusCallback(null, "doneposcalc", null, editor);

        if (editor.ensureecell && editor.ecell && !editor.deferredCommands.length) {
            // don't do if deferred cmd to execute
            editor.ensureecell = false;
            editor.EnsureECellVisible(); // this could cause another redisplay
        }

        editor.cellhandles.ShowCellHandles(true);

        //!!! Need to now check to see if this positioned controls out of the editing area
        //!!! (such as when there is a large wrapped cell and it pushes the pane boundary too far down).

        if (SocialCalc.Callbacks.broadcast)
            SocialCalc.Callbacks.broadcast("ask.ecell");
    };

    /**
     * Calculates row positions for a specific pane
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {number} panenum - The pane number
     * @param {Array} positions - Array to store row positions
     * @param {Array} sizes - Array to store row sizes
     */
    SocialCalc.CalculateRowPositions = function (
        editor,
        panenum,
        positions,
        sizes
    ) {
        let toprow, rowpane, rownum, offset, trowobj, cellposition;

        let context = editor.context;
        let sheetobj = context.sheetobj;

        let tbodyobj;

        if (!context.showRCHeaders) throw "Needs showRCHeaders=true";

        tbodyobj = editor.fullgrid.lastChild;

        // Calculate start of this pane as row in this table:

        toprow = 2;
        for (rowpane = 0; rowpane < panenum; rowpane++) {
            toprow +=
                context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
        }

        offset = 0;
        for (
            rownum = context.rowpanes[rowpane].first;
            rownum <= context.rowpanes[rowpane].last;
            rownum++
        ) {
            trowobj = tbodyobj.childNodes[toprow + offset];
            offset++;
            cellposition = SocialCalc.GetElementPosition(trowobj.firstChild);

            // Safari has problem: If a cell in the row is high, cell 1 is centered and it returns top of centered part
            // but if you get position of row element, it always returns the same value (not the row's)
            // So we require row number to be vertical aligned to top

            if (!positions[rownum]) {
                positions[rownum] = cellposition.top; // first one takes precedence
                sizes[rownum] = trowobj.firstChild.offsetHeight;
            }
        }

        return;
    };

    SocialCalc.CalculateColPositions = function (
        editor,
        panenum,
        positions,
        sizes
    ) {
        let leftcol, colpane, colnum, offset, trowobj, cellposition;

        let context = editor.context;
        let sheetobj = context.sheetobj;

        let tbodyobj;

        if (!context.showRCHeaders) throw "Needs showRCHeaders=true";

        tbodyobj = editor.fullgrid.lastChild;

        // Calculate start of this pane as column in this table:

        leftcol = 1;
        for (colpane = 0; colpane < panenum; colpane++) {
            leftcol +=
                context.colpanes[colpane].last - context.colpanes[colpane].first + 2; // skip pane and spacing col
        }

        trowobj = tbodyobj.childNodes[1]; // get heading row, which has all columns
        offset = 0;
        for (
            colnum = context.colpanes[colpane].first;
            colnum <= context.colpanes[colpane].last;
            colnum++
        ) {
            cellposition = SocialCalc.GetElementPosition(
                trowobj.childNodes[leftcol + offset]
            );
            if (!positions[colnum]) {
                positions[colnum] = cellposition.left; // first one takes precedence
                if (trowobj.childNodes[leftcol + offset]) {
                    sizes[colnum] = trowobj.childNodes[leftcol + offset].offsetWidth;
                }
            }
            offset++;
        }

        return;
    };

    /**
     * Scrolls the editor view relative to current position
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {boolean} vertical - If true, scrolls up(-)/down(+), else left(-)/right(+)
     * @param {number} amount - Amount to scroll
     */
    SocialCalc.ScrollRelative = function (editor, vertical, amount) {
        if (vertical) {
            editor.ScrollRelativeBoth(amount, 0);
        } else {
            editor.ScrollRelativeBoth(0, amount);
        }
        return;
    };

    /**
     * Scrolls both vertically and horizontally with one render
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {number} vamount - Vertical scroll amount
     * @param {number} hamount - Horizontal scroll amount
     */
    SocialCalc.ScrollRelativeBoth = function (editor, vamount, hamount) {
        let context = editor.context;

        let vplen = context.rowpanes.length;
        let vlimit = vplen > 1 ? context.rowpanes[vplen - 2].last + 1 : 1; // don't scroll past here
        if (context.rowpanes[vplen - 1].first + vamount < vlimit) {
            // limit amount
            vamount = -context.rowpanes[vplen - 1].first + vlimit;
        }

        let hplen = context.colpanes.length;
        let hlimit = hplen > 1 ? context.colpanes[hplen - 2].last + 1 : 1; // don't scroll past here

        if (context.colpanes[hplen - 1].first + hamount < hlimit) {
            // limit amount
            hamount = -context.colpanes[hplen - 1].first + hlimit;
        }

        if (
            SocialCalc.IsScrollPossible &&
            !SocialCalc.IsScrollPossible(
                editor.context.sheetobj.attribs.lastrow,
                editor.context.sheetobj.attribs.lastcol,
                context.rowpanes[vplen - 1].first,
                context.colpanes[hplen - 1].first,
                vamount,
                hamount
            )
        ) {
            return;
        }

        if ((vamount === 1 || vamount === -1) && hamount === 0) {
            // special case quick scrolls
            if (vamount === 1) {
                editor.ScrollTableUpOneRow();
            } else {
                editor.ScrollTableDownOneRow();
            }
            if (editor.ecell) editor.SetECellHeaders("selected");
            editor.SchedulePositionCalculations();
            return;
        }

        // Do a gross move and render

        if (vamount != 0 || hamount != 0) {
            context.rowpanes[vplen - 1].first += vamount;
            context.rowpanes[vplen - 1].last += vamount;
            context.colpanes[hplen - 1].first += hamount;
            context.colpanes[hplen - 1].last += hamount;
            editor.FitToEditTable();
            editor.ScheduleRender();
        }
    };

    /**
     * Pages up/down or left/right through the editor view
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {boolean} vertical - If true, pages up(direction -)/down(+), else left(-)/right(+)
     * @param {number} direction - Direction to page (-1 or +1)
     */
    SocialCalc.PageRelative = function (editor, vertical, direction) {
        let context = editor.context;
        let panes = vertical ? "rowpanes" : "colpanes";
        let lastpane = context[panes][context[panes].length - 1];
        let lastvisible = vertical ? "lastvisiblerow" : "lastvisiblecol";
        let sizearray = vertical ? editor.rowheight : editor.colwidth;
        let defaultsize = vertical
            ? SocialCalc.Constants.defaultAssumedRowHeight
            : SocialCalc.Constants.defaultColWidth;
        let size, newfirst, totalsize, current;

        if (direction > 0) {
            // down/right
            newfirst = editor[lastvisible];
            if (newfirst === lastpane.first) newfirst += 1; // move at least one
        } else {
            if (vertical) {
                // calculate amount to scroll
                totalsize =
                    editor.tableheight -
                    (editor.firstscrollingrowtop - editor.gridposition.top);
            } else {
                totalsize =
                    editor.tablewidth -
                    (editor.firstscrollingcolleft - editor.gridposition.left);
            }
            totalsize -=
                sizearray[editor[lastvisible]] > 0
                    ? sizearray[editor[lastvisible]]
                    : defaultsize;

            for (newfirst = lastpane.first - 1; newfirst > 0; newfirst--) {
                size = sizearray[newfirst] > 0 ? sizearray[newfirst] : defaultsize;
                if (totalsize < size) break;
                totalsize -= size;
            }

            current = lastpane.first;
            if (newfirst >= current) newfirst = current - 1; // move at least 1
            if (newfirst < 1) newfirst = 1;
        }

        lastpane.first = newfirst;
        lastpane.last = newfirst + 1;
        editor.LimitLastPanes();
        editor.FitToEditTable();
        editor.ScheduleRender();
    };

    /**
     * Ensures that the "first" of the last panes isn't before the last of the previous pane
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.LimitLastPanes = function (editor) {
        let context = editor.context;
        let plen;

        plen = context.rowpanes.length;
        if (
            plen > 1 &&
            context.rowpanes[plen - 1].first <= context.rowpanes[plen - 2].last
        )
            context.rowpanes[plen - 1].first = context.rowpanes[plen - 2].last + 1;

        plen = context.colpanes.length;
        if (
            plen > 1 &&
            context.colpanes[plen - 1].first <= context.colpanes[plen - 2].last
        )
            context.colpanes[plen - 1].first = context.colpanes[plen - 2].last + 1;
    };

    /**
     * Scrolls the table up by one row
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     */
    SocialCalc.ScrollTableUpOneRow = function (editor) {
        let toprow,
            rowpane,
            rownum,
            colnum,
            colpane,
            cell,
            oldrownum,
            maxspan,
            newbottomrow,
            newrow,
            oldchild,
            bottomrownum,
            coord; // Add coord to variable declarations
        let rowneedsrefresh = {};

        let context = editor.context;
        let sheetobj = context.sheetobj;
        let tableobj = editor.fullgrid;

        let tbodyobj;

        tbodyobj = tableobj.lastChild;

        toprow = context.showRCHeaders ? 2 : 1;
        for (rowpane = 0; rowpane < context.rowpanes.length - 1; rowpane++) {
            toprow +=
                context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
        }

        tbodyobj.removeChild(tbodyobj.childNodes[toprow]);

        context.rowpanes[rowpane].first++;
        context.rowpanes[rowpane].last++;
        editor.FitToEditTable();
        context.CalculateColWidthData(); // Just in case, since normally done in RenderSheet

        newbottomrow = context.RenderRow(context.rowpanes[rowpane].last, rowpane);
        tbodyobj.appendChild(newbottomrow);

        // if scrolled off a row with starting rowspans, replace rows for the largest rowspan

        let maxrowspan = 1;
        oldrownum = context.rowpanes[rowpane].first - 1;

        for (colpane = 0; colpane < context.colpanes.length; colpane++) {
            for (
                colnum = context.colpanes[colpane].first;
                colnum <= context.colpanes[colpane].last;
                colnum++
            ) {
                coord = SocialCalc.crToCoord(colnum, oldrownum);
                if (context.cellskip[coord]) continue;
                cell = sheetobj.cells[coord];
                if (cell && cell.rowspan > maxrowspan) maxrowspan = cell.rowspan;
            }
        }

        if (maxrowspan > 1) {
            for (rownum = 1; rownum < maxrowspan; rownum++) {
                if (rownum + oldrownum >= context.rowpanes[rowpane].last) break;
                newrow = context.RenderRow(rownum + oldrownum, rowpane);
                oldchild = tbodyobj.childNodes[toprow + rownum - 1];
                tbodyobj.replaceChild(newrow, oldchild);
            }
        }

        // if added a row that includes rowspans from above, update the size of those to include new row

        bottomrownum = context.rowpanes[rowpane].last;

        for (colpane = 0; colpane < context.colpanes.length; colpane++) {
            for (
                colnum = context.colpanes[colpane].first;
                colnum <= context.colpanes[colpane].last;
                colnum++
            ) {
                coord = context.cellskip[SocialCalc.crToCoord(colnum, bottomrownum)];
                if (!coord) continue; // only look at spanned cells
                rownum = context.coordToCR[coord].row - 0;
                if (
                    rownum == context.rowpanes[rowpane].last ||
                    rownum < context.rowpanes[rowpane].first
                )
                    continue; // this row (colspan) or starts above pane
                cell = sheetobj.cells[coord];
                if (cell && cell.rowspan > 1) rowneedsrefresh[rownum] = true; // remember row num to update
            }
        }

        for (rownum in rowneedsrefresh) {
            newrow = context.RenderRow(rownum, rowpane);
            oldchild =
                tbodyobj.childNodes[
                toprow + (rownum - context.rowpanes[rowpane].first)
                ];
            tbodyobj.replaceChild(newrow, oldchild);
        }

        return tableobj;
    };

    /**
     * Scrolls the table down by one row
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @returns {Object} The table object
     */
    SocialCalc.ScrollTableDownOneRow = function (editor) {
        let toprow,
            rowpane,
            rownum,
            colnum,
            colpane,
            cell,
            newrownum,
            maxspan,
            newbottomrow,
            newrow,
            oldchild,
            bottomrownum,
            maxrowspan,
            coord;
        let rowneedsrefresh = {};

        let context = editor.context;
        let sheetobj = context.sheetobj;
        let tableobj = editor.fullgrid;

        let tbodyobj;

        tbodyobj = tableobj.lastChild;

        toprow = context.showRCHeaders ? 2 : 1;
        for (rowpane = 0; rowpane < context.rowpanes.length - 1; rowpane++) {
            toprow +=
                context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
        }

        tbodyobj.removeChild(
            tbodyobj.childNodes[
            toprow +
            (context.rowpanes[rowpane].last - context.rowpanes[rowpane].first)
            ]
        );

        context.rowpanes[rowpane].first--;
        context.rowpanes[rowpane].last--;
        editor.FitToEditTable();
        context.CalculateColWidthData(); // Just in case, since normally done in RenderSheet

        newrow = context.RenderRow(context.rowpanes[rowpane].first, rowpane);
        tbodyobj.insertBefore(newrow, tbodyobj.childNodes[toprow]);

        // if inserted a row with starting rowspans, replace rows for the largest rowspan

        maxrowspan = 1;
        newrownum = context.rowpanes[rowpane].first;

        for (colpane = 0; colpane < context.colpanes.length; colpane++) {
            for (
                colnum = context.colpanes[colpane].first;
                colnum <= context.colpanes[colpane].last;
                colnum++
            ) {
                coord = SocialCalc.crToCoord(colnum, newrownum);
                if (context.cellskip[coord]) continue;
                cell = sheetobj.cells[coord];
                if (cell && cell.rowspan > maxrowspan) maxrowspan = cell.rowspan;
            }
        }

        if (maxrowspan > 1) {
            for (rownum = 1; rownum < maxrowspan; rownum++) {
                if (rownum + newrownum > context.rowpanes[rowpane].last) break;
                newrow = context.RenderRow(rownum + newrownum, rowpane);
                oldchild = tbodyobj.childNodes[toprow + rownum];
                tbodyobj.replaceChild(newrow, oldchild);
            }
        }

        // if last row now includes rowspans or rowspans from above, update the size of those to remove deleted row

        bottomrownum = context.rowpanes[rowpane].last;

        for (colpane = 0; colpane < context.colpanes.length; colpane++) {
            for (
                colnum = context.colpanes[colpane].first;
                colnum <= context.colpanes[colpane].last;
                colnum++
            ) {
                coord = SocialCalc.crToCoord(colnum, bottomrownum);
                cell = sheetobj.cells[coord];
                if (cell && cell.rowspan > 1) {
                    rowneedsrefresh[bottomrownum] = true; // need to update this row
                    continue;
                }
                coord = context.cellskip[SocialCalc.crToCoord(colnum, bottomrownum)];
                if (!coord) continue; // only look at spanned cells
                rownum = context.coordToCR[coord].row - 0;
                if (rownum == bottomrownum || rownum < context.rowpanes[rowpane].first)
                    continue; // this row (colspan) or starts above pane
                cell = sheetobj.cells[coord];
                if (cell && cell.rowspan > 1) rowneedsrefresh[rownum] = true; // remember row num to update
            }
        }

        for (rownum in rowneedsrefresh) {
            newrow = context.RenderRow(rownum, rowpane);
            oldchild =
                tbodyobj.childNodes[
                toprow + (rownum - context.rowpanes[rowpane].first)
                ];
            tbodyobj.replaceChild(newrow, oldchild);
        }

        return tableobj;
    };

    // *************************************
    //
    // InputBox class:
    //
    // This class deals with the text box for editing cell contents.
    // It mainly controls a user input box for typed content and is used to interact with
    // the keyboard code, etc.
    //
    // You can use this inside a formula bar control of some sort.
    // You create this after you have created a table editor object (but not necessarily
    // done the CreateTableEditor method).
    //
    // When the user starts typing text, or double-clicks on a cell, this object
    // comes into play.
    //
    // The element given when this is first constructed should be an input HTMLElement or
    // something that acts like one. Check the code here to see what is done to it.
    //
    // *************************************

    /**
     * InputBox class for handling text input in the spreadsheet
     * Manages the input element and its interactions with the editor
     * 
     * @param {HTMLElement} element - The input element to associate with this InputBox
     * @param {SocialCalc.TableEditor} editor - The TableEditor this belongs to
     * @constructor
     */
    SocialCalc.InputBox = function (element, editor) {
        if (!element) return; // invoked without enough data to work

        this.element = element; // the input element associated with this InputBox
        this.editor = editor; // the TableEditor this belongs to
        this.inputEcho = null;

        editor.inputBox = this;

        element.onmousedown = SocialCalc.InputBoxOnMouseDown;

        editor.MoveECellCallback.formulabar = function (e) {
            if (e.state !== "start") {
                return;
            } // if not in normal keyboard mode don't replace formula bar
            editor.inputBox.DisplayCellContents(e.ecell.coord);
        };
    };

    // Methods:

    SocialCalc.InputBox.prototype.DisplayCellContents = function (coord) {
        SocialCalc.InputBoxDisplayCellContents(this, coord);
    };
    SocialCalc.InputBox.prototype.ShowInputBox = function (show) {
        this.editor.inputEcho.ShowInputEcho(show);
    };
    SocialCalc.InputBox.prototype.GetText = function () {
        return this.element.value;
    };
    SocialCalc.InputBox.prototype.SetText = function (newtext) {
        if (!this.element) return;
        this.element.value = newtext;

        if (!SocialCalc.Constants.SCNoInputEcho) {
            this.editor.inputEcho.SetText(newtext + "_");
        }
    };
    SocialCalc.InputBox.prototype.Focus = function () {
        SocialCalc.InputBoxFocus(this);
    };
    SocialCalc.InputBox.prototype.Blur = function () {
        return this.element.blur();
    };
    SocialCalc.InputBox.prototype.Select = function (t) {
        if (!this.element) return;
        switch (t) {
            case "end":
                if (document.selection && document.selection.createRange) {
                    /* IE 4+ - Safer than setting .selectionEnd as it also works for Textareas. */
                    let range = document.selection.createRange().duplicate();
                    range.moveToElementText(this.element);
                    range.collapse(false);
                    range.select();
                } else if (this.element.selectionStart != undefined) {
                    this.element.selectionStart = this.element.value.length;
                    this.element.selectionEnd = this.element.value.length;
                }
                break;
        }
    };

    // Functions:

    /**
     * Sets input box to the contents of the specified cell (or ecell if null)
     * 
     * @param {SocialCalc.InputBox} inputbox - The input box to update
     * @param {string} coord - The cell coordinate (optional, defaults to ecell)
     */
    let CoordForColorChange;
    let editCoord;
    SocialCalc.InputBoxDisplayCellContents = function (inputbox, coord) {
        let scc = SocialCalc.Constants;
        let cell, position;

        if (!inputbox) return;

        //changes for prompt
        if (!coord) {
            coord = inputbox.editor.ecell.coord;
        }
        let text = SocialCalc.GetCellContents(
            inputbox.editor.context.sheetobj,
            coord
        );
        if (text.indexOf("\n") !== -1) {
            //text = scc.s_inputboxdisplaymultilinetext;
            text = scc.s_inputboxdisplaynoteditable;
            inputbox.element.disabled = true;
            SocialCalc.ToggleInputLineButtons(false);
        } else if (!SocialCalc.Callbacks.IsCellEditable(inputbox.editor)) {
            text = scc.s_inputboxdisplaynoteditable;
            SocialCalc.ToggleInputLineButtons(false);
            inputbox.element.disabled = true;
            inputbox.element.style.display = "none";
        } else {
            CoordForColorChange = coord;
            editCoord = coord;

            //changes for prompt

            let control = SocialCalc.GetCurrentWorkBookControl();
            let spreadsheet = control.workbook.spreadsheet;
            cell = SocialCalc.GetEditorCellElement(
                inputbox.editor,
                inputbox.editor.ecell.row,
                inputbox.editor.ecell.col
            );
            let left = "100px";
            let top = "100px";
            let width = 0;
            let height = 0;
            if (cell) {
                position = SocialCalc.GetElementPosition(cell.element);
                left = `${position.left}px`;
                top = `${position.top}px`;
                width = cell.element.offsetWidth;
                height = cell.element.offsetHeight;
            }
            if (!cell || width === 0) {
                //scrolled off screen
                SocialCalc.ToggleInputLineButtons(false);
                inputbox.element.disabled = true;
                inputbox.element.style.display = "none";
                // do nothing
                return;
            }
            let ele = document.getElementById(spreadsheet.formulabarDiv.id);
            if (ele) {
                spreadsheet.spreadsheetDiv.removeChild(spreadsheet.formulabarDiv);
            }
            spreadsheet.formulabarDiv.style.left = left;
            spreadsheet.formulabarDiv.style.top = top;
            //spreadsheet.formulabarDiv.style.width = "30px";
            //spreadsheet.formulabarDiv.style.fontSize = "10px";
            spreadsheet.formulabarDiv.style.zIndex = 100;
            spreadsheet.formulabarDiv.style.position = "absolute";
            let input = spreadsheet.formulabarDiv.firstChild;
            //changes for prompt

            input.style.fontSize = "100%";
            input.style.backgroundColor = "white";
            input.style.color = "black";

            input.style.borderBottomColor = "#306eff";
            input.style.borderBottomLeftRadius = "3px";
            input.style.borderBottomRightRadius = "3px";
            input.style.borderBottomStyle = "solid";
            input.style.borderBottomWidth = "2px";
            input.style.borderLeftColor = "#306eff";
            input.style.borderLeftStyle = "solid";
            input.style.borderLeftWidth = "2px";
            input.style.borderRightColor = "#306eff";
            input.style.borderRightStyle = "solid";
            input.style.borderRightWidth = "2px";
            input.style.borderTopColor = "#306eff";
            input.style.borderTopLeftRadius = "3px";
            input.style.borderTopRightRadius = "3px";
            input.style.borderTopStyle = "solid";
            input.style.borderTopWidth = "2px";

            //console.log("cell width ="+width)
            //changes for prompt

            input.style.width = `${width}px`;
            input.style.height = `${height}px`;
            spreadsheet.spreadsheetDiv.appendChild(spreadsheet.formulabarDiv);

            inputbox.element.disabled = false;
            inputbox.element.style.display = "inline";
            SocialCalc.ToggleInputLineButtons(true);
        }
        if (scc.SCNoQuoteInInputBox && text.substring(0, 1) === "'") {
            text = text.substring(1);
        }
        inputbox.SetText(text);
        // autoSave(selectedFile);
    };

    /**
     * Call this to have the input box get the focus and respond to keystrokes
     * but still pass them off to SocialCalc.ProcessKey
     * 
     * @param {SocialCalc.InputBox} inputbox - The input box to focus
     */
    SocialCalc.InputBoxFocus = function (inputbox) {
        if (!inputbox) return;
        inputbox.element.focus();
        let editor = inputbox.editor;
        editor.state = "input";
        let wval = editor.workingvalues;
        wval.partialexpr = "";
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
    };

    /**
     * This is called when the input box gets the focus. It then responds to keystrokes
     * and pass them off to SocialCalc.ProcessKey, but in a different editing state.
     * 
     * @param {Event} e - The mouse down event
     * @returns {boolean} True if browser should handle default behavior
     */
    SocialCalc.InputBoxOnMouseDown = function (e) {
        let editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default
        let wval = editor.workingvalues;

        switch (editor.state) {
            case "start":
                editor.state = "inputboxdirect";
                wval.partialexpr = "";
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                editor.inputEcho.ShowInputEcho(true);
                break;

            case "input":
                wval.partialexpr = ""; // make sure not pointing
                editor.MoveECell(wval.ecoord);
                editor.state = "inputboxdirect";
                SocialCalc.KeyboardFocus(); // may have come here from outside of grid
                break;

            case "inputboxdirect":
                break;
        }
    };

    // *************************************
    //
    // InputEcho class:
    //
    // This object creates and controls an element that echos what's in the InputBox during editing
    // It is draggable.
    //
    // *************************************

    /**
     * InputEcho class for displaying input feedback
     * 
     * @param {SocialCalc.TableEditor} editor - The TableEditor this belongs to
     * @constructor
     */
    SocialCalc.InputEcho = function (editor) {
        let scc = SocialCalc.Constants;

        this.editor = editor; // the TableEditor this belongs to
        this.text = ""; // current value of what is displayed
        this.interval = null; // timer handle

        this.container = null; // element containing main echo as well as prompt line
        this.main = null; // main echo area
        this.prompt = null;

        this.functionbox = null; // function chooser dialog

        this.container = document.createElement("div");
        SocialCalc.setStyles(
            this.container,
            "display:none;position:absolute;zIndex:10;"
        );

        this.topprompt = document.createElement("div");
        if (scc.defaultInputEchoPromptClass)
            this.topprompt.className = scc.defaultInputEchoPromptClass;
        if (scc.defaultInputEchoPromptStyle)
            SocialCalc.setStyles(this.topprompt, scc.defaultInputEchoPromptStyle);
        this.topprompt.innerHTML = "";

        this.container.appendChild(this.topprompt);

        this.main = document.createElement("div");

        if (scc.defaultInputEchoClass)
            this.main.className = scc.defaultInputEchoClass;
        if (scc.defaultInputEchoStyle)
            SocialCalc.setStyles(this.main, scc.defaultInputEchoStyle);

        this.main.innerHTML = "&nbsp;";

        this.container.appendChild(this.main);

        this.prompt = document.createElement("div");
        if (scc.defaultInputEchoPromptClass)
            this.prompt.className = scc.defaultInputEchoPromptClass;
        if (scc.defaultInputEchoPromptStyle)
            SocialCalc.setStyles(this.prompt, scc.defaultInputEchoPromptStyle);
        this.prompt.innerHTML = "";

        this.container.appendChild(this.prompt);

        SocialCalc.DragRegister(this.main, true, true, {
            MouseDown: SocialCalc.DragFunctionStart,
            MouseMove: SocialCalc.DragFunctionPosition,
            MouseUp: SocialCalc.DragFunctionPosition,
            Disabled: null,
            positionobj: this.container,
        });

        editor.toplevel.appendChild(this.container);
    };

    // Methods:

    SocialCalc.InputEcho.prototype.ShowInputEcho = function (show) {
        return SocialCalc.ShowInputEcho(this, show);
    };
    SocialCalc.InputEcho.prototype.SetText = function (str) {
        return SocialCalc.SetInputEchoText(this, str);
    };

    /**
     * Shows or hides the input echo display
     * 
     * @param {SocialCalc.InputEcho} inputecho - The input echo object
     * @param {boolean} show - Whether to show or hide the echo
     */
    SocialCalc.ShowInputEcho = function (inputecho, show) {
        let cell, position;
        let editor = inputecho.editor;

        if (!editor) return;
        if (SocialCalc.Constants.SCNoInputEcho) {
            return;
        }

        if (show) {
            editor.cellhandles.ShowCellHandles(false);
            cell = SocialCalc.GetEditorCellElement(
                editor,
                editor.ecell.row,
                editor.ecell.col
            );
            if (cell) {
                position = SocialCalc.GetElementPosition(cell.element);
                inputecho.container.style.left = `${position.left - 1}px`;
                inputecho.container.style.top = `${position.top - 1}px`;
            }
            inputecho.container.style.display = "block";
            if (inputecho.interval) window.clearInterval(inputecho.interval); // just in case
            inputecho.interval = window.setInterval(
                SocialCalc.InputEchoHeartbeat,
                50
            );
        } else {
            if (inputecho.interval) window.clearInterval(inputecho.interval);
            inputecho.container.style.display = "none";
            inputecho.topprompt.innerHTML = "";
        }
    };

    /**
     * Sets the text content of the input echo
     * 
     * @param {SocialCalc.InputEcho} inputecho - The input echo object
     * @param {string} str - The text to display
     */
    SocialCalc.SetInputEchoText = function (inputecho, str) {
        if (SocialCalc.Constants.SCNoInputEcho) {
            return;
        }

        let scc = SocialCalc.Constants;
        let fname, fstr;
        let newstr = SocialCalc.special_chars(str);
        newstr = newstr.replace(/\n/g, "<br>");

        if (inputecho.text !== newstr) {
            inputecho.main.innerHTML = newstr;
            inputecho.text = newstr;
        }

        let parts = str.match(
            /.*[\+\-\*\/\&\^\<\>\=\,\(]([A-Za-z][A-ZA-z]\w*?)\([^\)]*$/
        );
        if (str.charAt(0) === "=" && parts) {
            fname = parts[1].toUpperCase();
            if (SocialCalc.Formula.FunctionList[fname]) {
                SocialCalc.Formula.FillFunctionInfo(); //  make sure filled
                fstr = SocialCalc.special_chars(
                    fname + "(" + SocialCalc.Formula.FunctionArgString(fname) + ")"
                );
            } else {
                fstr = scc.ietUnknownFunction + fname;
            }
            if (inputecho.prompt.innerHTML !== fstr) {
                inputecho.prompt.innerHTML = fstr;
                inputecho.prompt.style.display = "block";
            }
        } else if (inputecho.prompt.style.display !== "none") {
            inputecho.prompt.innerHTML = "";
            inputecho.prompt.style.display = "none";
        }

        let editor = inputecho.editor;

        if (editor.workingvalues.currentsheet !== editor.workingvalues.startsheet) {
            let promptstr =
                "Editing:" + editor.workingvalues.startsheet + "!" + editor.workingvalues.ecoord;
            if (promptstr !== inputecho.topprompt.innerHTML) {
                inputecho.topprompt.innerHTML =
                    "Editing:" + editor.workingvalues.startsheet + "!" +
                    "!" +
                    editor.workingvalues.ecoord;
                inputecho.topprompt.style.display = "block";
            }
        } else {
            if (inputecho.topprompt.style.display != "none") {
                inputecho.topprompt.innerHTML = "";
                inputecho.topprompt.style.display = "none";
            }
        }
    };

    /**
     * Heartbeat function for input echo updates
     * 
     * @returns {boolean} True if browser should handle default behavior
     */
    SocialCalc.InputEchoHeartbeat = function () {
        let editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default

        if (SocialCalc.Constants.SCNoInputEcho) {
            return;
        }

        if (editor.state === "inputboxdirect") {
            editor.inputEcho.SetText(editor.inputBox.GetText() + "_");
        }
    };

    /**
     * Handles mouse down events on the input echo
     * 
     * @param {Event} e - The mouse down event
     * @returns {boolean} True if browser should handle default behavior
     */
    SocialCalc.InputEchoMouseDown = function (e) {
        let event = e || window.event;

        let editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default

        if (SocialCalc.Constants.SCNoInputEcho) {
            return;
        }

        //      if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
        //      else event.cancelBubble = true; // IE 5+
        //      if (event.preventDefault) event.preventDefault(); // DOM Level 2
        //      else event.returnValue = false; // IE 5+

        editor.inputBox.element.focus();

        //      return false;
    };

    /**
     * CellHandles class for managing cursor cell controls (dragging, etc.)
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @constructor
     */
    SocialCalc.CellHandles = function (editor) {
        let scc = SocialCalc.Constants;
        let functions;

        if (editor.noEdit) return; // leave us with nothing
        if (scc.SCCellHandlesDisable) return;

        this.editor = editor; // the TableEditor this belongs to

        this.noCursorSuffix = false;

        this.movedmouse = false; // used to detect no-op

        this.draghandle = document.createElement("div");
        SocialCalc.setStyles(
            this.draghandle,
            "display:none;position:absolute;zIndex:8;border:1px solid white;width:4px;height:4px;fontSize:1px;backgroundColor:#0E93D8;cursor:default;"
        );
        this.draghandle.innerHTML = "&nbsp;";
        editor.toplevel.appendChild(this.draghandle);
        SocialCalc.AssignID(editor, this.draghandle, "draghandle");

        let imagetype = "png";
        if (navigator.userAgent.match(/MSIE 6\.0/)) {
            imagetype = "gif";
        }

        this.dragpalette = document.createElement("div");
        SocialCalc.setStyles(
            this.dragpalette,
            "display:none;position:absolute;zIndex:8;width:90px;height:90px;fontSize:1px;textAlign:center;cursor:default;" +
            "backgroundImage:url(" +
            SocialCalc.Constants.defaultImagePrefix +
            "drag-handles." +
            imagetype +
            ");"
        );
        this.dragpalette.innerHTML = "&nbsp;";
        editor.toplevel.appendChild(this.dragpalette);
        SocialCalc.AssignID(editor, this.dragpalette, "dragpalette");

        this.dragtooltip = document.createElement("div");
        SocialCalc.setStyles(
            this.dragtooltip,
            "display:none;position:absolute;zIndex:9;border:1px solid black;width:100px;height:auto;fontSize:10px;backgroundColor:#FFFFFF;"
        );
        this.dragtooltip.innerHTML = "&nbsp;";
        editor.toplevel.appendChild(this.dragtooltip);
        SocialCalc.AssignID(editor, this.dragtooltip, "dragtooltip");

        this.fillinghandle = document.createElement("div");
        SocialCalc.setStyles(
            this.fillinghandle,
            "display:none;position:absolute;zIndex:9;border:1px solid black;width:auto;height:14px;fontSize:10px;backgroundColor:#FFFFFF;"
        );
        this.fillinghandle.innerHTML = "&nbsp;";
        editor.toplevel.appendChild(this.fillinghandle);
        SocialCalc.AssignID(editor, this.fillinghandle, "fillinghandle");

        if (this.draghandle.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            this.draghandle.addEventListener(
                "mousemove",
                SocialCalc.CellHandlesMouseMoveOnHandle,
                false
            );
            this.dragpalette.addEventListener(
                "mousedown",
                SocialCalc.CellHandlesMouseDown,
                false
            );
            this.dragpalette.addEventListener(
                "mousemove",
                SocialCalc.CellHandlesMouseMoveOnHandle,
                false
            );
        } else if (this.draghandle.attachEvent) {
            // IE 5+
            this.draghandle.attachEvent(
                "onmousemove",
                SocialCalc.CellHandlesMouseMoveOnHandle
            );
            this.dragpalette.attachEvent(
                "onmousedown",
                SocialCalc.CellHandlesMouseDown
            );
            this.dragpalette.attachEvent(
                "onmousemove",
                SocialCalc.CellHandlesMouseMoveOnHandle
            );
        } else {
            // don't handle this
            throw "Browser not supported";
        }
    };

    // Methods:

    SocialCalc.CellHandles.prototype.ShowCellHandles = function (show, moveshow) {
        return SocialCalc.ShowCellHandles(this, show, moveshow);
    };

    /**
     * Shows or hides cell handles around the current cell
     * 
     * @param {SocialCalc.CellHandles} cellhandles - The cell handles object
     * @param {boolean} show - Whether to show or hide the handles
     * @param {boolean} moveshow - Whether this is a move show operation
     */
    SocialCalc.ShowCellHandles = function (cellhandles, show, moveshow) {
        let cell, cell2, position, position2;
        let editor = cellhandles.editor;
        let doshow = false;
        let row, col, viewport;

        if (!editor) return;

        do {
            // a block that can you can "break" out of easily

            if (!show) break;

            row = editor.ecell.row;
            col = editor.ecell.col;

            if (editor.state !== "start") break;
            if (row >= editor.lastvisiblerow) break;
            if (col >= editor.lastvisiblecol) break;
            if (row < editor.firstscrollingrow) break;
            if (col < editor.firstscrollingcol) break;

            if (
                editor.rowpositions[row + 1] + 20 >
                editor.horizontaltablecontrol.controlborder
            ) {
                break;
            }
            if (editor.rowpositions[row + 1] - 10 < editor.headposition.top) {
                break;
            }
            if (
                editor.colpositions[col + 1] + 20 >
                editor.verticaltablecontrol.controlborder
            ) {
                break;
            }
            if (editor.colpositions[col + 1] - 30 < editor.headposition.left) {
                break;
            }

            cellhandles.draghandle.style.left =
                editor.colpositions[col + 1] - 1 + "px";
            cellhandles.draghandle.style.top =
                editor.rowpositions[row + 1] - 1 + "px";
            cellhandles.draghandle.style.display = "block";

            if (moveshow) {
                cellhandles.draghandle.style.display = "none";
                cellhandles.dragpalette.style.left =
                    editor.colpositions[col + 1] - 45 + "px";
                cellhandles.dragpalette.style.top =
                    editor.rowpositions[row + 1] - 45 + "px";
                cellhandles.dragpalette.style.display = "block";
                viewport = SocialCalc.GetViewportInfo();
                cellhandles.dragtooltip.style.right =
                    viewport.width - (editor.colpositions[col + 1] - 1) + "px";
                cellhandles.dragtooltip.style.bottom =
                    viewport.height - (editor.rowpositions[row + 1] - 1) + "px";
                cellhandles.dragtooltip.style.display = "none";
            }

            doshow = true;
        } while (false); // only do once

        if (!doshow) {
            cellhandles.draghandle.style.display = "none";
        }
        if (!moveshow) {
            cellhandles.dragpalette.style.display = "none";
            cellhandles.dragtooltip.style.display = "none";
        }
    };

    /**
     * Handles mouse move events on cell handles
     * 
     * @param {Event} e - The mouse move event
     * @returns {boolean} True if browser should handle default behavior
     */
    SocialCalc.CellHandlesMouseMoveOnHandle = function (e) {
        let scc = SocialCalc.Constants;

        let event = e || window.event;
        let target = event.target || event.srcElement;
        let viewport = SocialCalc.GetViewportInfo();
        let clientX = event.clientX + viewport.horizontalScroll;
        let clientY = event.clientY + viewport.verticalScroll;

        editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default
        let cellhandles = editor.cellhandles;
        if (!cellhandles.editor) return true; // no handles

        if (!editor.cellhandles.mouseDown) {
            editor.cellhandles.ShowCellHandles(true, true); // show move handles, too

            if (target === cellhandles.dragpalette) {
                let whichhandle = SocialCalc.SegmentDivHit(
                    [scc.CH_radius1, scc.CH_radius2],
                    editor.cellhandles.dragpalette,
                    clientX,
                    clientY
                );
                if (whichhandle === 0) {
                    // off of active part of palette
                    SocialCalc.CellHandlesHoverTimeout();
                    return;
                }
                if (cellhandles.tooltipstimer) {
                    window.clearTimeout(cellhandles.tooltipstimer);
                    cellhandles.tooltipstimer = null;
                }
                cellhandles.tooltipswhichhandle = whichhandle;
                cellhandles.tooltipstimer = window.setTimeout(
                    SocialCalc.CellHandlesTooltipsTimeout,
                    700
                );
            }

            if (cellhandles.timer) {
                window.clearTimeout(cellhandles.timer);
                cellhandles.timer = null;
            }
            cellhandles.timer = window.setTimeout(
                SocialCalc.CellHandlesHoverTimeout,
                3000
            );
        }

        return;
    };

    /**
     * Determines which segment of a divided element was hit by mouse coordinates
     * 
     * @param {Array} segtable - Segment table defining hit areas
     * @param {HTMLElement} divWithMouseHit - The element that was hit
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     * @returns {number} Segment number that was hit
     */
    SocialCalc.SegmentDivHit = function (segtable, divWithMouseHit, x, y) {
        let width = divWithMouseHit.offsetWidth;
        let height = divWithMouseHit.offsetHeight;
        let left = divWithMouseHit.offsetLeft;
        let top = divWithMouseHit.offsetTop;
        let v = 0;
        let table = segtable;
        let len = Math.sqrt(
            Math.pow(x - left - (width / 2.0 - 0.5), 2) +
            Math.pow(y - top - (height / 2.0 - 0.5), 2)
        );

        if (table.length === 2) {
            // type 2 segtable
            if (
                x >= left &&
                x < left + width / 2 &&
                y >= top &&
                y < top + height / 2
            ) {
                // upper left
                if (len <= segtable[0]) v = -1;
                else if (len <= segtable[1]) v = 1;
            }
            if (
                x >= left + width / 2 &&
                x < left + width &&
                y >= top &&
                y < top + height / 2
            ) {
                // upper right
                if (len <= segtable[0]) v = -2;
                else if (len <= segtable[1]) v = 2;
            }
            if (
                x >= left + width / 2 &&
                x < left + width &&
                y >= top + height / 2 &&
                y < top + height
            ) {
                // bottom right
                if (len <= segtable[0]) v = -3;
                else if (len <= segtable[1]) v = 3;
            }
            if (
                x >= left &&
                x < left + width / 2 &&
                y >= top + height / 2 &&
                y < top + height
            ) {
                // bottom right
                if (len <= segtable[0]) v = -4;
                else if (len <= segtable[1]) v = 4;
            }
            return v;
        }

        let quadrant = "";
        while (true) {
            if (
                x >= left &&
                x < left + width / 2 &&
                y >= top &&
                y < top + height / 2
            ) {
                // upper left
                quadrant += "1";
                v = table[0];
                if (typeof v === "number") {
                    break;
                }
                table = v;
                width = width / 2;
                height = height / 2;
                continue;
            }
            if (
                x >= left + width / 2 &&
                x < left + width &&
                y >= top &&
                y < top + height / 2
            ) {
                // upper right
                quadrant += "2";
                v = table[1];
                if (typeof v === "number") {
                    break;
                }
                table = v;
                width = width / 2;
                left = left + width;
                height = height / 2;
                continue;
            }
            if (
                x >= left &&
                x < left + width / 2 &&
                y >= top + height / 2 &&
                y < top + height
            ) {
                // lower left
                quadrant += "3";
                v = table[2];
                if (typeof v === "number") {
                    break;
                }
                table = v;
                width = width / 2;
                height = height / 2;
                top = top + height;
                continue;
            }
            if (
                x >= left + width / 2 &&
                x < left + width &&
                y >= top + height / 2 &&
                y < top + height
            ) {
                // lower right
                quadrant += "4";
                v = table[3];
                if (typeof v === "number") {
                    break;
                }
                table = v;
                width = width / 2;
                height = height / 2;
                left = left + width;
                top = top + height;
                continue;
            }
            v = 0; // not found
            break;
        }

        //addmsg((x-divWithMouseHit.offsetLeft)+","+(y-divWithMouseHit.offsetTop)+"="+quadrant+" "+v);
        return v;
    };

    /**
     * Handles timeout for cell handles hover state
     */
    SocialCalc.CellHandlesHoverTimeout = function () {
        let editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default
        let cellhandles = editor.cellhandles;
        if (cellhandles.timer) {
            window.clearTimeout(cellhandles.timer);
            cellhandles.timer = null;
        }
        if (cellhandles.tooltipstimer) {
            window.clearTimeout(cellhandles.tooltipstimer);
            cellhandles.tooltipstimer = null;
        }
        editor.cellhandles.ShowCellHandles(true, false); // hide move handles
    };

    /**
     * Handles timeout for cell handle tooltips
     */
    SocialCalc.CellHandlesTooltipsTimeout = function () {
        let editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default
        let cellhandles = editor.cellhandles;
        if (cellhandles.tooltipstimer) {
            window.clearTimeout(cellhandles.tooltipstimer);
            cellhandles.tooltipstimer = null;
        }

        let whichhandle = cellhandles.tooltipswhichhandle;
        if (whichhandle === 0) {
            // off of active part of palette
            SocialCalc.CellHandlesHoverTimeout();
            return;
        }
        if (whichhandle === -3) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHfillAllTooltip;
        } else if (whichhandle === 3) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHfillContentsTooltip;
        } else if (whichhandle === -2) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHmovePasteAllTooltip;
        } else if (whichhandle === -4) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHmoveInsertAllTooltip;
        } else if (whichhandle === 2) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHmovePasteContentsTooltip;
        } else if (whichhandle === 4) {
            cellhandles.dragtooltip.innerHTML = scc.s_CHmoveInsertContentsTooltip;
        } else {
            cellhandles.dragtooltip.innerHTML = "&nbsp;";
            cellhandles.dragtooltip.style.display = "none";
            return;
        }

        cellhandles.dragtooltip.style.display = "block";
    };

    /**
     * Handles mouse down events on cell handles
     * @param {Event} e - The mouse event
     * @returns {boolean} Whether to continue with default behavior
     */
    SocialCalc.CellHandlesMouseDown = function (e) {
        let scc = SocialCalc.Constants;
        let editor, result, coord, textarea, wval, range;

        let event = e || window.event;

        let viewport = SocialCalc.GetViewportInfo();
        let clientX = event.clientX + viewport.horizontalScroll;
        let clientY = event.clientY + viewport.verticalScroll;

        let mouseinfo = SocialCalc.EditorMouseInfo;

        editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
        if (!editor) return true; // we're not handling it -- let browser do default

        if (editor.busy) return; // don't do anything when busy (is this correct?)

        let cellhandles = editor.cellhandles;

        cellhandles.movedmouse = false; // detect no-op

        if (cellhandles.timer) {
            // cancel timer
            window.clearTimeout(cellhandles.timer);
            cellhandles.timer = null;
        }
        if (cellhandles.tooltipstimer) {
            window.clearTimeout(cellhandles.tooltipstimer);
            cellhandles.tooltipstimer = null;
        }
        cellhandles.dragtooltip.innerHTML = "&nbsp;";
        cellhandles.dragtooltip.style.display = "none";

        range = editor.range;

        let whichhandle = SocialCalc.SegmentDivHit(
            [scc.CH_radius1, scc.CH_radius2],
            editor.cellhandles.dragpalette,
            clientX,
            clientY
        );
        if (whichhandle === 1 || whichhandle === -1 || whichhandle === 0) {
            cellhandles.ShowCellHandles(true, false); // hide move handles
            return;
        }

        mouseinfo.ignore = true; // stop other code from looking at the mouse

        if (whichhandle === -3) {
            cellhandles.dragtype = "Fill";
            //      mouseinfo.element = editor.cellhandles.fillhandle;
            cellhandles.noCursorSuffix = false;
        } else if (whichhandle === 3) {
            cellhandles.dragtype = "FillC";
            //      mouseinfo.element = editor.cellhandles.fillhandle;
            cellhandles.noCursorSuffix = false;
        } else if (whichhandle == -2) {
            cellhandles.dragtype = "Move";
            //      mouseinfo.element = editor.cellhandles.movehandle1;
            cellhandles.noCursorSuffix = true;
        } else if (whichhandle == -4) {
            cellhandles.dragtype = "MoveI";
            //      mouseinfo.element = editor.cellhandles.movehandle2;
            cellhandles.noCursorSuffix = false;
        } else if (whichhandle == 2) {
            cellhandles.dragtype = "MoveC";
            //      mouseinfo.element = editor.cellhandles.movehandle1;
            cellhandles.noCursorSuffix = true;
        } else if (whichhandle == 4) {
            cellhandles.dragtype = "MoveIC";
            //      mouseinfo.element = editor.cellhandles.movehandle2;
            cellhandles.noCursorSuffix = false;
        }

        cellhandles.filltype = null;

        switch (cellhandles.dragtype) {
            case "Fill":
            case "FillC":
                if (!range.hasrange) {
                    editor.RangeAnchor();
                }
                break;

            case "Move":
            case "MoveI":
            case "MoveC":
            case "MoveIC":
                if (!range.hasrange) {
                    editor.RangeAnchor();
                }
                editor.range2.top = editor.range.top;
                editor.range2.right = editor.range.right;
                editor.range2.bottom = editor.range.bottom;
                editor.range2.left = editor.range.left;
                editor.range2.hasrange = true;
                editor.RangeRemove();
                break;

            default:
                return; // not for us
        }

        cellhandles.fillinghandle.style.left = clientX + "px";
        cellhandles.fillinghandle.style.top = clientY - 17 + "px";
        cellhandles.fillinghandle.innerHTML =
            scc.s_CHindicatorOperationLookup[cellhandles.dragtype] +
            (scc.s_CHindicatorDirectionLookup[editor.cellhandles.filltype] || "");
        cellhandles.fillinghandle.style.display = "block";

        cellhandles.ShowCellHandles(true, false); // hide move handles
        cellhandles.mouseDown = true;

        mouseinfo.editor = editor; // remember for later

        coord = editor.ecell.coord; // start with cell with handles

        cellhandles.startingcoord = coord;
        cellhandles.startingX = clientX;
        cellhandles.startingY = clientY;

        mouseinfo.mouselastcoord = coord;

        SocialCalc.KeyboardSetFocus(editor);

        if (document.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            document.addEventListener(
                "mousemove",
                SocialCalc.CellHandlesMouseMove,
                true
            ); // capture everywhere
            document.addEventListener("mouseup", SocialCalc.CellHandlesMouseUp, true); // capture everywhere
        } else if (cellhandles.draghandle.attachEvent) {
            // IE 5+
            cellhandles.draghandle.setCapture();
            cellhandles.draghandle.attachEvent(
                "onmousemove",
                SocialCalc.CellHandlesMouseMove
            );
            cellhandles.draghandle.attachEvent(
                "onmouseup",
                SocialCalc.CellHandlesMouseUp
            );
            cellhandles.draghandle.attachEvent(
                "onlosecapture",
                SocialCalc.CellHandlesMouseUp
            );
        }
        if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
        else event.cancelBubble = true; // IE 5+
        if (event.preventDefault) event.preventDefault(); // DOM Level 2
        else event.returnValue = false; // IE 5+

        return;
    };

    /**
     * Handles mouse move events for cell handles
     * @param {Event} e - The mouse event
     */
    SocialCalc.CellHandlesMouseMove = function (e) {
        let scc = SocialCalc.Constants;
        let editor, element, result, coord, now, textarea, sheetobj, cellobj, wval;
        let crstart, crend, cr, c, r;

        let event = e || window.event;

        let viewport = SocialCalc.GetViewportInfo();
        let clientX = event.clientX + viewport.horizontalScroll;
        let clientY = event.clientY + viewport.verticalScroll;

        let mouseinfo = SocialCalc.EditorMouseInfo;
        editor = mouseinfo.editor;
        if (!editor) return; // not us, ignore
        let cellhandles = editor.cellhandles;

        element = mouseinfo.element;

        result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with move

        if (!result) return;

        if (result && !result.coord) {
            SocialCalc.SetDragAutoRepeat(
                editor,
                result,
                SocialCalc.CellHandlesDragAutoRepeat
            );
            return;
        }

        SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

        if (!result.coord) return;

        crstart = SocialCalc.coordToCr(editor.cellhandles.startingcoord);
        crend = SocialCalc.coordToCr(result.coord);

        cellhandles.movedmouse = true; // did move, so not no-op

        switch (cellhandles.dragtype) {
            case "Fill":
            case "FillC":
                if (result.coord == cellhandles.startingcoord) {
                    // reset when come back
                    cellhandles.filltype = null;
                    cellhandles.startingX = clientX;
                    cellhandles.startingY = clientY;
                } else {
                    if (cellhandles.filltype) {
                        // moving and have already determined filltype
                        if (cellhandles.filltype == "Down") {
                            // coerse to that
                            crend.col = crstart.col;
                            if (crend.row < crstart.row) crend.row = crstart.row;
                        } else {
                            crend.row = crstart.row;
                            if (crend.col < crstart.col) crend.col = crstart.col;
                        }
                    } else {
                        if (Math.abs(clientY - cellhandles.startingY) > 10) {
                            cellhandles.filltype = "Down";
                        } else if (Math.abs(clientX - cellhandles.startingX) > 10) {
                            cellhandles.filltype = "Right";
                        }
                        crend.col = crstart.col; // until decide, leave it at start
                        crend.row = crstart.row;
                    }
                }
                result.coord = SocialCalc.crToCoord(crend.col, crend.row);
                if (result.coord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(result.coord);
                    editor.RangeExtend();
                }
                break;

            case "Move":
            case "MoveC":
                if (result.coord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(result.coord);
                    c = editor.range2.right - editor.range2.left + result.col;
                    r = editor.range2.bottom - editor.range2.top + result.row;
                    editor.RangeAnchor(SocialCalc.crToCoord(c, r));
                    editor.RangeExtend();
                }
                break;

            case "MoveI":
            case "MoveIC":
                if (result.coord == cellhandles.startingcoord) {
                    // reset when come back
                    cellhandles.filltype = null;
                    cellhandles.startingX = clientX;
                    cellhandles.startingY = clientY;
                } else {
                    if (cellhandles.filltype) {
                        // moving and have already determined filltype
                        if (cellhandles.filltype == "Vertical") {
                            // coerse to that
                            crend.col = editor.range2.left;
                            if (
                                crend.row >= editor.range2.top &&
                                crend.row <= editor.range2.bottom + 1
                            )
                                crend.row = editor.range2.bottom + 2;
                        } else {
                            crend.row = editor.range2.top;
                            if (
                                crend.col >= editor.range2.left &&
                                crend.col <= editor.range2.right + 1
                            )
                                crend.col = editor.range2.right + 2;
                        }
                    } else {
                        if (Math.abs(clientY - cellhandles.startingY) > 10) {
                            cellhandles.filltype = "Vertical";
                        } else if (Math.abs(clientX - cellhandles.startingX) > 10) {
                            cellhandles.filltype = "Horizontal";
                        }
                        crend.col = crstart.col; // until decide, leave it at start
                        crend.row = crstart.row;
                    }
                }
                result.coord = SocialCalc.crToCoord(crend.col, crend.row);
                if (result.coord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(result.coord);
                    if (!cellhandles.filltype) {
                        // no fill type
                        editor.RangeRemove();
                    } else {
                        c = editor.range2.right - editor.range2.left + crend.col;
                        r = editor.range2.bottom - editor.range2.top + crend.row;
                        editor.RangeAnchor(SocialCalc.crToCoord(c, r));
                        editor.RangeExtend();
                    }
                }
                break;
        }

        cellhandles.fillinghandle.style.left = clientX + "px";
        cellhandles.fillinghandle.style.top = clientY - 17 + "px";
        cellhandles.fillinghandle.innerHTML =
            scc.s_CHindicatorOperationLookup[cellhandles.dragtype] +
            (scc.s_CHindicatorDirectionLookup[editor.cellhandles.filltype] || "");
        cellhandles.fillinghandle.style.display = "block";

        mouseinfo.mouselastcoord = result.coord;

        if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
        else event.cancelBubble = true; // IE 5+
        if (event.preventDefault) event.preventDefault(); // DOM Level 2
        else event.returnValue = false; // IE 5+

        return;
    };

    /**
     * Handles auto-repeat during cell handle dragging
     * @param {string} coord - The coordinate being dragged to
     * @param {string} direction - Direction of auto-repeat
     */
    SocialCalc.CellHandlesDragAutoRepeat = function (coord, direction) {
        let mouseinfo = SocialCalc.EditorMouseInfo;
        let editor = mouseinfo.editor;
        if (!editor) return; // not us, ignore
        let cellhandles = editor.cellhandles;

        let crstart = SocialCalc.coordToCr(editor.cellhandles.startingcoord);
        let crend = SocialCalc.coordToCr(coord);

        let newcoord, c, r;

        let vscroll = 0;
        let hscroll = 0;

        if (direction === "left") hscroll = -1;
        else if (direction === "right") hscroll = 1;
        else if (direction === "up") vscroll = -1;
        else if (direction === "down") vscroll = 1;
        editor.ScrollRelativeBoth(vscroll, hscroll);

        switch (cellhandles.dragtype) {
            case "Fill":
            case "FillC":
                if (cellhandles.filltype) {
                    // moving and have already determined filltype
                    if (cellhandles.filltype == "Down") {
                        // coerse to that
                        crend.col = crstart.col;
                        if (crend.row < crstart.row) crend.row = crstart.row;
                    } else {
                        crend.row = crstart.row;
                        if (crend.col < crstart.col) crend.col = crstart.col;
                    }
                } else {
                    crend.col = crstart.col; // until decide, leave it at start
                    crend.row = crstart.row;
                }

                newcoord = SocialCalc.crToCoord(crend.col, crend.row);
                if (newcoord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(coord);
                    editor.RangeExtend();
                }
                break;

            case "Move":
            case "MoveC":
                if (coord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(coord);
                    c = editor.range2.right - editor.range2.left + editor.ecell.col;
                    r = editor.range2.bottom - editor.range2.top + editor.ecell.row;
                    editor.RangeAnchor(SocialCalc.crToCoord(c, r));
                    editor.RangeExtend();
                }
                break;

            case "MoveI":
            case "MoveIC":
                if (cellhandles.filltype) {
                    // moving and have already determined filltype
                    if (cellhandles.filltype == "Vertical") {
                        // coerse to that
                        crend.col = editor.range2.left;
                        if (
                            crend.row >= editor.range2.top &&
                            crend.row <= editor.range2.bottom + 1
                        )
                            crend.row = editor.range2.bottom + 2;
                    } else {
                        crend.row = editor.range2.top;
                        if (
                            crend.col >= editor.range2.left &&
                            crend.col <= editor.range2.right + 1
                        )
                            crend.col = editor.range2.right + 2;
                    }
                } else {
                    crend.col = crstart.col; // until decide, leave it at start
                    crend.row = crstart.row;
                }

                newcoord = SocialCalc.crToCoord(crend.col, crend.row);
                if (newcoord != mouseinfo.mouselastcoord) {
                    editor.MoveECell(newcoord);
                    c = editor.range2.right - editor.range2.left + crend.col;
                    r = editor.range2.bottom - editor.range2.top + crend.row;
                    editor.RangeAnchor(SocialCalc.crToCoord(c, r));
                    editor.RangeExtend();
                }
                break;
        }

        mouseinfo.mouselastcoord = newcoord;
    };

    /**
     * Handles mouse up events for cell handles
     * @param {Event} e - The mouse event
     */
    SocialCalc.CellHandlesMouseUp = function (e) {
        let editor,
            element,
            result,
            coord,
            now,
            textarea,
            sheetobj,
            cellobj,
            wval,
            cstr,
            cmdtype,
            cmdtype2;
        let crstart, crend;
        let sizec, sizer, deltac, deltar;

        let event = e || window.event;

        let viewport = SocialCalc.GetViewportInfo();
        let clientX = event.clientX + viewport.horizontalScroll;
        let clientY = event.clientY + viewport.verticalScroll;

        let mouseinfo = SocialCalc.EditorMouseInfo;
        editor = mouseinfo.editor;
        if (!editor) return; // not us, ignore
        let cellhandles = editor.cellhandles;

        element = mouseinfo.element;

        mouseinfo.ignore = false;

        result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with up

        SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

        cellhandles.mouseDown = false;
        cellhandles.noCursorSuffix = false;

        cellhandles.fillinghandle.style.display = "none";

        if (!result) result = {};
        if (!result.coord) result.coord = editor.ecell.coord;

        switch (cellhandles.dragtype) {
            case "Fill":
            case "Move":
            case "MoveI":
                cmdtype2 = " all";
                break;
            case "FillC":
            case "MoveC":
            case "MoveIC":
                cmdtype2 = " formulas";
                break;
        }

        if (!cellhandles.movedmouse) {
            // didn't move: just leave one cell selected
            cellhandles.dragtype = "Nothing";
        }

        switch (cellhandles.dragtype) {
            case "Nothing":
                editor.Range2Remove();
                editor.RangeRemove();
                break;

            case "Fill":
            case "FillC":
                crstart = SocialCalc.coordToCr(cellhandles.startingcoord);
                crend = SocialCalc.coordToCr(result.coord);
                if (cellhandles.filltype) {
                    if (cellhandles.filltype == "Down") {
                        crend.col = crstart.col;
                    } else {
                        crend.row = crstart.row;
                    }
                }
                result.coord = SocialCalc.crToCoord(crend.col, crend.row);

                editor.MoveECell(result.coord);
                editor.RangeExtend();

                if (editor.cellhandles.filltype == "Right") {
                    cmdtype = "right";
                } else {
                    cmdtype = "down";
                }
                cstr =
                    "fill" +
                    cmdtype +
                    " " +
                    SocialCalc.crToCoord(editor.range.left, editor.range.top) +
                    ":" +
                    SocialCalc.crToCoord(editor.range.right, editor.range.bottom) +
                    cmdtype2;
                editor.EditorScheduleSheetCommands(cstr, true, false);
                break;

            case "Move":
            case "MoveC":
                editor.context.cursorsuffix = "";
                cstr =
                    "movepaste " +
                    SocialCalc.crToCoord(editor.range2.left, editor.range2.top) +
                    ":" +
                    SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom) +
                    " " +
                    editor.ecell.coord +
                    cmdtype2;
                editor.EditorScheduleSheetCommands(cstr, true, false);
                editor.Range2Remove();

                break;

            case "MoveI":
            case "MoveIC":
                editor.context.cursorsuffix = "";
                sizec = editor.range2.right - editor.range2.left;
                sizer = editor.range2.bottom - editor.range2.top;
                deltac = editor.ecell.col - editor.range2.left;
                deltar = editor.ecell.row - editor.range2.top;
                cstr =
                    "moveinsert " +
                    SocialCalc.crToCoord(editor.range2.left, editor.range2.top) +
                    ":" +
                    SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom) +
                    " " +
                    editor.ecell.coord +
                    cmdtype2;
                editor.EditorScheduleSheetCommands(cstr, true, false);
                editor.Range2Remove();
                editor.RangeRemove();
                if (editor.cellhandles.filltype == " Horizontal" && deltac > 0) {
                    editor.MoveECell(
                        SocialCalc.crToCoord(editor.ecell.col - sizec - 1, editor.ecell.row)
                    );
                } else if (editor.cellhandles.filltype == " Vertical" && deltar > 0) {
                    editor.MoveECell(
                        SocialCalc.crToCoord(editor.ecell.col, editor.ecell.row - sizer - 1)
                    );
                }
                editor.RangeAnchor(
                    SocialCalc.crToCoord(
                        editor.ecell.col + sizec,
                        editor.ecell.row + sizer
                    )
                );
                editor.RangeExtend();

                break;
        }

        if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
        else event.cancelBubble = true; // IE 5+
        if (event.preventDefault) event.preventDefault(); // DOM Level 2
        else event.returnValue = false; // IE 5+

        if (document.removeEventListener) {
            // DOM Level 2
            document.removeEventListener(
                "mousemove",
                SocialCalc.CellHandlesMouseMove,
                true
            );
            document.removeEventListener(
                "mouseup",
                SocialCalc.CellHandlesMouseUp,
                true
            );
        } else if (cellhandles.draghandle.detachEvent) {
            // IE
            cellhandles.draghandle.detachEvent(
                "onlosecapture",
                SocialCalc.CellHandlesMouseUp
            );
            cellhandles.draghandle.detachEvent(
                "onmouseup",
                SocialCalc.CellHandlesMouseUp
            );
            cellhandles.draghandle.detachEvent(
                "onmousemove",
                SocialCalc.CellHandlesMouseMove
            );
            cellhandles.draghandle.releaseCapture();
        }

        mouseinfo.editor = null;

        return false;
    };

    // *************************************
    //
    // TableControl class:
    //
    // This class deals with the horizontal and verical scrollbars and pane sliders.
    //
    // +--------------+
    // | Endcap       |
    // +- - - - - - - +
    // |              |
    // +--------------+
    // | Pane Slider  |
    // +--------------+
    // |              |
    // | Less Button  |
    // |              |
    // +--------------+
    // | Scroll Area  |
    // |              |
    // |              |
    // +--------------+
    // | Thumb        |
    // +--------------+
    // |              |
    // +--------------+
    // |              |
    // | More Button  |
    // |              |
    // +--------------+
    //
    // *************************************

    /**
     * TableControl constructor - creates scrollbars and control elements
     * @param {Object} editor - The TableEditor this belongs to
     * @param {boolean} vertical - True if vertical control, false if horizontal
     * @param {number} size - Length in pixels
     */
    SocialCalc.TableControl = function (editor, vertical, size) {
        let scc = SocialCalc.Constants;

        this.editor = editor; // the TableEditor this belongs to

        this.vertical = vertical; // true if vertical control, false if horizontal
        this.size = size; // length in pixels

        this.main = null; // main element containing all the others
        this.endcap = null; // the area at the top/left between the end and the pane slider
        this.paneslider = null; // the slider to adjust the pane split
        this.lessbutton = null; // the top/left scroll button
        this.morebutton = null; // the bottom/right scroll button
        this.scrollarea = null; // the area between the scroll buttons
        this.thumb = null; // the sliding thing in the scrollarea

        // computed position values:

        this.controlborder = null; // left or top screen position for vertical or horizontal control
        this.endcapstart = null; // top or left screen position for vertical or horizontal control
        this.panesliderstart = null;
        this.lessbuttonstart = null;
        this.morebuttonstart = null;
        this.scrollareastart = null;
        this.scrollareaend = null;
        this.scrollareasize = null;
        this.thumbpos = null;

        // constants:

        this.controlthickness = scc.defaultTableControlThickness; // other dimension of complete control in pixels
        this.sliderthickness = scc.defaultTCSliderThickness;
        this.buttonthickness = scc.defaultTCButtonThickness;
        this.thumbthickness = scc.defaultTCThumbThickness;
        this.minscrollingpanesize =
            this.buttonthickness + this.buttonthickness + this.thumbthickness + 20; // the 20 is to leave a little space
    };

    // Methods:

    SocialCalc.TableControl.prototype.CreateTableControl = function () {
        return SocialCalc.CreateTableControl(this);
    };
    SocialCalc.TableControl.prototype.PositionTableControlElements = function () {
        SocialCalc.PositionTableControlElements(this);
    };
    SocialCalc.TableControl.prototype.ComputeTableControlPositions = function () {
        SocialCalc.ComputeTableControlPositions(this);
    };

    // Functions:

    /**
     * Creates table control elements
     * @param {Object} control - The table control object
     */
    SocialCalc.CreateTableControl = function (control) {
        let s, functions, params;
        let AssignID = SocialCalc.AssignID;
        let setStyles = SocialCalc.setStyles;
        let scc = SocialCalc.Constants;
        let TooltipRegister = function (element, etype, vh) {
            if (scc["s_" + etype + "Tooltip" + vh]) {
                SocialCalc.TooltipRegister(
                    element,
                    scc["s_" + etype + "Tooltip" + vh],
                    null
                );
            }
        };

        let imageprefix = control.editor.imageprefix;
        let vh = control.vertical ? "v" : "h";

        control.main = document.createElement("div");
        s = control.main.style;
        s.height =
            (control.vertical ? control.size : control.controlthickness) + "px";
        s.width =
            (control.vertical ? control.controlthickness : control.size) + "px";
        s.zIndex = 0;
        setStyles(control.main, scc.TCmainStyle);
        s.backgroundImage = "url(" + imageprefix + "main-" + vh + ".gif)";
        if (scc.TCmainClass) control.main.className = scc.TCmainClass;

        control.main.style.display = "none"; // wait for layout

        control.endcap = document.createElement("div");
        s = control.endcap.style;
        s.height = control.controlthickness + "px";
        s.width = control.controlthickness + "px";
        s.zIndex = 1;
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.position = "absolute";
        setStyles(control.endcap, scc.TCendcapStyle);
        s.backgroundImage = "url(" + imageprefix + "endcap-" + vh + ".gif)";
        if (scc.TCendcapClass) control.endcap.className = scc.TCendcapClass;
        AssignID(control.editor, control.endcap, "endcap" + vh);

        control.main.appendChild(control.endcap);

        control.paneslider = document.createElement("div");
        s = control.paneslider.style;
        s.height =
            (control.vertical ? control.sliderthickness : control.controlthickness) +
            "px";
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.width =
            (control.vertical ? control.controlthickness : control.sliderthickness) +
            "px";
        s.position = "absolute";
        s[control.vertical ? "top" : "left"] = "4px";
        s.zIndex = 3;
        setStyles(control.paneslider, scc.TCpanesliderStyle);
        s.backgroundImage = "url(" + imageprefix + "paneslider-" + vh + ".gif)";
        if (scc.TCpanesliderClass)
            control.paneslider.className = scc.TCpanesliderClass;
        AssignID(control.editor, control.paneslider, "paneslider" + vh);
        TooltipRegister(control.paneslider, "paneslider", vh);

        functions = {
            MouseDown: SocialCalc.TCPSDragFunctionStart,
            MouseMove: SocialCalc.TCPSDragFunctionMove,
            MouseUp: SocialCalc.TCPSDragFunctionStop,
            Disabled: function () {
                return control.editor.busy;
            },
        };

        functions.control = control; // make sure this is there

        SocialCalc.DragRegister(
            control.paneslider,
            control.vertical,
            !control.vertical,
            functions
        );

        control.main.appendChild(control.paneslider);

        control.lessbutton = document.createElement("div");
        s = control.lessbutton.style;
        s.height =
            (control.vertical ? control.buttonthickness : control.controlthickness) +
            "px";
        s.width =
            (control.vertical ? control.controlthickness : control.buttonthickness) +
            "px";
        s.zIndex = 2;
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.position = "absolute";
        setStyles(control.lessbutton, scc.TClessbuttonStyle);
        s.backgroundImage = "url(" + imageprefix + "less-" + vh + "n.gif)";
        if (scc.TClessbuttonClass)
            control.lessbutton.className = scc.TClessbuttonClass;
        AssignID(control.editor, control.lessbutton, "lessbutton" + vh);

        params = {
            repeatwait: scc.TClessbuttonRepeatWait,
            repeatinterval: scc.TClessbuttonRepeatInterval,
            normalstyle:
                "backgroundImage:url(" + imageprefix + "less-" + vh + "n.gif);",
            downstyle:
                "backgroundImage:url(" + imageprefix + "less-" + vh + "d.gif);",
            hoverstyle:
                "backgroundImage:url(" + imageprefix + "less-" + vh + "h.gif);",
        };
        functions = {
            MouseDown: function () {
                if (!control.editor.busy)
                    control.editor.ScrollRelative(control.vertical, -1);
            },
            Repeat: function () {
                if (!control.editor.busy)
                    control.editor.ScrollRelative(control.vertical, -1);
            },
            Disabled: function () {
                return control.editor.busy;
            },
        };

        SocialCalc.ButtonRegister(control.lessbutton, params, functions);

        control.main.appendChild(control.lessbutton);

        control.morebutton = document.createElement("div");
        s = control.morebutton.style;
        s.height =
            (control.vertical ? control.buttonthickness : control.controlthickness) +
            "px";
        s.width =
            (control.vertical ? control.controlthickness : control.buttonthickness) +
            "px";
        s.zIndex = 2;
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.position = "absolute";
        setStyles(control.morebutton, scc.TCmorebuttonStyle);
        s.backgroundImage = "url(" + imageprefix + "more-" + vh + "n.gif)";
        if (scc.TCmorebuttonClass)
            control.morebutton.className = scc.TCmorebuttonClass;
        AssignID(control.editor, control.morebutton, "morebutton" + vh);

        params = {
            repeatwait: scc.TCmorebuttonRepeatWait,
            repeatinterval: scc.TCmorebuttonRepeatInterval,
            normalstyle:
                "backgroundImage:url(" + imageprefix + "more-" + vh + "n.gif);",
            downstyle:
                "backgroundImage:url(" + imageprefix + "more-" + vh + "d.gif);",
            hoverstyle:
                "backgroundImage:url(" + imageprefix + "more-" + vh + "h.gif);",
        };
        functions = {
            MouseDown: function () {
                if (!control.editor.busy)
                    control.editor.ScrollRelative(control.vertical, +1);
            },
            Repeat: function () {
                if (!control.editor.busy)
                    control.editor.ScrollRelative(control.vertical, +1);
            },
            Disabled: function () {
                return control.editor.busy;
            },
        };

        SocialCalc.ButtonRegister(control.morebutton, params, functions);

        control.main.appendChild(control.morebutton);

        control.scrollarea = document.createElement("div");
        s = control.scrollarea.style;
        s.height = control.controlthickness + "px";
        s.width = control.controlthickness + "px";
        s.zIndex = 1;
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.position = "absolute";
        setStyles(control.scrollarea, scc.TCscrollareaStyle);
        s.backgroundImage = "url(" + imageprefix + "scrollarea-" + vh + ".gif)";
        if (scc.TCscrollareaClass)
            control.scrollarea.className = scc.TCscrollareaClass;
        AssignID(control.editor, control.scrollarea, "scrollarea" + vh);

        params = {
            repeatwait: scc.TCscrollareaRepeatWait,
            repeatinterval: scc.TCscrollareaRepeatWait,
        };
        functions = {
            MouseDown: SocialCalc.ScrollAreaClick,
            Repeat: SocialCalc.ScrollAreaClick,
            Disabled: function () {
                return control.editor.busy;
            },
        };
        functions.control = control;

        SocialCalc.ButtonRegister(control.scrollarea, params, functions);

        control.main.appendChild(control.scrollarea);

        control.thumb = document.createElement("div");
        s = control.thumb.style;
        s.height =
            (control.vertical ? control.thumbthickness : control.controlthickness) +
            "px";
        s.width =
            (control.vertical ? control.controlthickness : control.thumbthickness) +
            "px";
        s.zIndex = 2;
        s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
        s.position = "absolute";
        setStyles(control.thumb, scc.TCthumbStyle);
        control.thumb.style.backgroundImage =
            "url(" + imageprefix + "thumb-" + vh + "n.gif)";
        if (scc.TCthumbClass) control.thumb.className = scc.TCthumbClass;
        AssignID(control.editor, control.thumb, "thumb" + vh);

        functions = {
            MouseDown: SocialCalc.TCTDragFunctionStart,
            MouseMove: SocialCalc.TCTDragFunctionMove,
            MouseUp: SocialCalc.TCTDragFunctionStop,
            Disabled: function () {
                return control.editor.busy;
            },
        };
        functions.control = control; // make sure this is there
        SocialCalc.DragRegister(
            control.thumb,
            control.vertical,
            !control.vertical,
            functions
        );

        params = {
            normalstyle:
                "backgroundImage:url(" + imageprefix + "thumb-" + vh + "n.gif)",
            name: "Thumb",
            downstyle:
                "backgroundImage:url(" + imageprefix + "thumb-" + vh + "d.gif)",
            hoverstyle:
                "backgroundImage:url(" + imageprefix + "thumb-" + vh + "h.gif)",
        };
        SocialCalc.ButtonRegister(control.thumb, params, null); // give it button-like visual behavior

        control.main.appendChild(control.thumb);

        return control.main;
    };

    /**
     * ScrollAreaClick - Button function to process pageup/down clicks
     * @param {Event} e - The event object
     * @param {Object} buttoninfo - Button information
     * @param {Object} bobj - Button object
     */
    SocialCalc.ScrollAreaClick = function (e, buttoninfo, bobj) {
        let control = bobj.functionobj.control;
        let bposition = SocialCalc.GetElementPosition(bobj.element);
        let clickpos = control.vertical ? buttoninfo.clientY : buttoninfo.clientX;
        if (control.editor.busy) {
            // ignore if busy - wait for next repeat
            return;
        }
        control.editor.PageRelative(
            control.vertical,
            clickpos > control.thumbpos ? 1 : -1
        );

        return;
    };

    /**
     * PositionTableControlElements - Positions control elements
     * @param {Object} control - The table control object
     */
    SocialCalc.PositionTableControlElements = function (control) {
        let border, realend, thumbpos;

        let editor = control.editor;

        if (control.vertical) {
            border = control.controlborder + "px";
            control.endcap.style.top = control.endcapstart + "px";
            control.endcap.style.left = border;
            control.paneslider.style.top = control.panesliderstart + "px";
            control.paneslider.style.left = border;
            control.lessbutton.style.top = control.lessbuttonstart + "px";
            control.lessbutton.style.left = border;
            control.morebutton.style.top = control.morebuttonstart + "px";
            control.morebutton.style.left = border;
            control.scrollarea.style.top = control.scrollareastart + "px";
            control.scrollarea.style.left = border;
            control.scrollarea.style.height = control.scrollareasize + "px";
            realend = Math.max(
                editor.context.sheetobj.attribs.lastrow,
                editor.firstscrollingrow + 1
            );
            thumbpos =
                ((editor.firstscrollingrow - (editor.lastnonscrollingrow + 1)) *
                    (control.scrollareasize - 3 * control.thumbthickness)) /
                (realend - (editor.lastnonscrollingrow + 1)) +
                control.scrollareastart -
                1;
            thumbpos = Math.floor(thumbpos);
            control.thumb.style.top = thumbpos + "px";
            control.thumb.style.left = border;
        } else {
            border = control.controlborder + "px";
            control.endcap.style.left = control.endcapstart + "px";
            control.endcap.style.top = border;
            control.paneslider.style.left = control.panesliderstart + "px";
            control.paneslider.style.top = border;
            control.lessbutton.style.left = control.lessbuttonstart + "px";
            control.lessbutton.style.top = border;
            control.morebutton.style.left = control.morebuttonstart + "px";
            control.morebutton.style.top = border;
            control.scrollarea.style.left = control.scrollareastart + "px";
            control.scrollarea.style.top = border;
            control.scrollarea.style.width = control.scrollareasize + "px";
            realend = Math.max(
                editor.context.sheetobj.attribs.lastcol,
                editor.firstscrollingcol + 1
            );
            thumbpos =
                ((editor.firstscrollingcol - (editor.lastnonscrollingcol + 1)) *
                    (control.scrollareasize - control.thumbthickness)) /
                (realend - editor.lastnonscrollingcol) +
                control.scrollareastart -
                1;
            thumbpos = Math.floor(thumbpos);
            control.thumb.style.left = thumbpos + "px";
            control.thumb.style.top = border;
        }
        control.thumbpos = thumbpos;
        control.main.style.display = "block";
    };

    /**
     * ComputeTableControlPositions
     * 
     * This routine computes the screen positions and other values needed for laying out
     * the table control elements.
     * @param {Object} control - The table control object
     */
    SocialCalc.ComputeTableControlPositions = function (control) {
        let editor = control.editor;

        if (!editor.gridposition || !editor.headposition)
            throw "Can't compute table control positions before editor positions";

        if (control.vertical) {
            control.controlborder = editor.gridposition.left + editor.tablewidth; // border=left position
            control.endcapstart = editor.gridposition.top; // start=top position
            control.panesliderstart =
                editor.firstscrollingrowtop - control.sliderthickness;
            control.lessbuttonstart = editor.firstscrollingrowtop - 1;
            control.morebuttonstart =
                editor.gridposition.top + editor.tableheight - control.buttonthickness;
            control.scrollareastart =
                editor.firstscrollingrowtop - 1 + control.buttonthickness;
            control.scrollareaend = control.morebuttonstart - 1;
            control.scrollareasize =
                control.scrollareaend - control.scrollareastart + 1;
        } else {
            control.controlborder = editor.gridposition.top + editor.tableheight; // border=top position
            control.endcapstart = editor.gridposition.left; // start=left position
            control.panesliderstart =
                editor.firstscrollingcolleft - control.sliderthickness;
            control.lessbuttonstart = editor.firstscrollingcolleft - 1;
            control.morebuttonstart =
                editor.gridposition.left + editor.tablewidth - control.buttonthickness;
            control.scrollareastart =
                editor.firstscrollingcolleft - 1 + control.buttonthickness;
            control.scrollareaend = control.morebuttonstart - 1;
            control.scrollareasize =
                control.scrollareaend - control.scrollareastart + 1;
        }
    };

    ////// TCPS - TableControl Pan Slider methods

    //
    // TCPSDragFunctionStart(event, draginfo, dobj)
    /**
     * TableControlPaneSlider function for starting drag
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.TCPSDragFunctionStart = function (event, draginfo, dobj) {
        let editor = dobj.functionobj.control.editor;
        let scc = SocialCalc.Constants;

        SocialCalc.DragFunctionStart(event, draginfo, dobj);

        draginfo.trackingline = document.createElement("div");
        draginfo.trackingline.style.height = dobj.vertical
            ? scc.TCPStrackinglineThickness
            : editor.tableheight -
            (editor.headposition.top - editor.gridposition.top) +
            "px";
        draginfo.trackingline.style.width = dobj.vertical
            ? editor.tablewidth -
            (editor.headposition.left - editor.gridposition.left) +
            "px"
            : scc.TCPStrackinglineThickness;
        draginfo.trackingline.style.backgroundImage =
            "url(" +
            editor.imageprefix +
            "trackingline-" +
            (dobj.vertical ? "v" : "h") +
            ".gif)";
        if (scc.TCPStrackinglineClass)
            draginfo.trackingline.className = scc.TCPStrackinglineClass;
        SocialCalc.setStyles(draginfo.trackingline, scc.TCPStrackinglineStyle);

        if (dobj.vertical) {
            row = SocialCalc.Lookup(
                draginfo.clientY + dobj.functionobj.control.sliderthickness,
                editor.rowpositions
            );
            draginfo.trackingline.style.top =
                (editor.rowpositions[row] || editor.headposition.top) + "px";
            draginfo.trackingline.style.left = editor.headposition.left + "px";
            if (editor.context.rowpanes.length - 1) {
                // has 2 already
                editor.context.SetRowPaneFirstLast(
                    1,
                    editor.context.rowpanes[0].last + 1,
                    editor.context.rowpanes[0].last + 1
                );
                editor.FitToEditTable();
                editor.ScheduleRender();
            }
        } else {
            col = SocialCalc.Lookup(
                draginfo.clientX + dobj.functionobj.control.sliderthickness,
                editor.colpositions
            );
            draginfo.trackingline.style.top = editor.headposition.top + "px";
            draginfo.trackingline.style.left =
                (editor.colpositions[col] || editor.headposition.left) + "px";
            if (editor.context.colpanes.length - 1) {
                // has 2 already
                editor.context.SetColPaneFirstLast(
                    1,
                    editor.context.colpanes[0].last + 1,
                    editor.context.colpanes[0].last + 1
                );
                editor.FitToEditTable();
                editor.ScheduleRender();
            }
        }

        editor.griddiv.appendChild(draginfo.trackingline);
    };

    /**
     * TCPSDragFunctionMove - Handle pane slider drag movement
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.TCPSDragFunctionMove = function (event, draginfo, dobj) {
        let row, col, max, min;
        let control = dobj.functionobj.control;
        let sliderthickness = control.sliderthickness;
        let editor = control.editor;

        if (dobj.vertical) {
            max =
                control.morebuttonstart -
                control.minscrollingpanesize -
                draginfo.offsetY; // restrict movement
            if (draginfo.clientY > max) draginfo.clientY = max;
            min = editor.headposition.top - sliderthickness - draginfo.offsetY;
            if (draginfo.clientY < min) draginfo.clientY = min;

            row = SocialCalc.Lookup(
                draginfo.clientY + sliderthickness,
                editor.rowpositions
            );
            draginfo.trackingline.style.top =
                (editor.rowpositions[row] || editor.headposition.top) + "px";
        } else {
            max =
                control.morebuttonstart -
                control.minscrollingpanesize -
                draginfo.offsetX;
            if (draginfo.clientX > max) draginfo.clientX = max;
            min = editor.headposition.left - sliderthickness - draginfo.offsetX;
            if (draginfo.clientX < min) draginfo.clientX = min;

            col = SocialCalc.Lookup(
                draginfo.clientX + sliderthickness,
                editor.colpositions
            );
            draginfo.trackingline.style.left =
                (editor.colpositions[col] || editor.headposition.left) + "px";
        }

        SocialCalc.DragFunctionPosition(event, draginfo, dobj);
    };

    /**
     * TCPSDragFunctionStop - Handle pane slider drag stop
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.TCPSDragFunctionStop = function (event, draginfo, dobj) {
        let row, col, max, min;
        let control = dobj.functionobj.control;
        let sliderthickness = control.sliderthickness;
        let editor = control.editor;

        if (dobj.vertical) {
            max =
                control.morebuttonstart -
                control.minscrollingpanesize -
                draginfo.offsetY; // restrict movement
            if (draginfo.clientY > max) draginfo.clientY = max;
            min = editor.headposition.top - sliderthickness - draginfo.offsetY;
            if (draginfo.clientY < min) draginfo.clientY = min;

            row = SocialCalc.Lookup(
                draginfo.clientY + sliderthickness,
                editor.rowpositions
            );
            if (row > editor.context.sheetobj.attribs.lastrow)
                row = editor.context.sheetobj.attribs.lastrow; // can't extend sheet here
            if (!row || row <= editor.context.rowpanes[0].first) {
                // set to no panes, leaving first pane settings
                if (editor.context.rowpanes.length > 1)
                    editor.context.rowpanes.length = 1;
            } else if (editor.context.rowpanes.length - 1) {
                // has 2 already
                if (!editor.timeout) {
                    // not waiting for position calc (so positions could be wrong)
                    editor.context.SetRowPaneFirstLast(
                        0,
                        editor.context.rowpanes[0].first,
                        row - 1
                    );
                    editor.context.SetRowPaneFirstLast(1, row, row);
                }
            } else {
                editor.context.SetRowPaneFirstLast(
                    0,
                    editor.context.rowpanes[0].first,
                    row - 1
                );
                editor.context.SetRowPaneFirstLast(1, row, row);
            }
        } else {
            max =
                control.morebuttonstart -
                control.minscrollingpanesize -
                draginfo.offsetX;
            if (draginfo.clientX > max) draginfo.clientX = max;
            min = editor.headposition.left - sliderthickness - draginfo.offsetX;
            if (draginfo.clientX < min) draginfo.clientX = min;

            col = SocialCalc.Lookup(
                draginfo.clientX + sliderthickness,
                editor.colpositions
            );
            if (col > editor.context.sheetobj.attribs.lastcol)
                col = editor.context.sheetobj.attribs.lastcol; // can't extend sheet here
            if (!col || col <= editor.context.colpanes[0].first) {
                // set to no panes, leaving first pane settings
                if (editor.context.colpanes.length > 1)
                    editor.context.colpanes.length = 1;
            } else if (editor.context.colpanes.length - 1) {
                // has 2 already
                if (!editor.timeout) {
                    // not waiting for position calc (so positions could be wrong)
                    editor.context.SetColPaneFirstLast(
                        0,
                        editor.context.colpanes[0].first,
                        col - 1
                    );
                    editor.context.SetColPaneFirstLast(1, col, col);
                }
            } else {
                editor.context.SetColPaneFirstLast(
                    0,
                    editor.context.colpanes[0].first,
                    col - 1
                );
                editor.context.SetColPaneFirstLast(1, col, col);
            }
        }

        editor.FitToEditTable();

        editor.griddiv.removeChild(draginfo.trackingline);

        editor.ScheduleRender();
    };

    ////// TCT - TableControl Thumb methods

    /**
     * TCTDragFunctionStart - TableControlThumb function for starting drag
     * @param {Event} event - The drag event  
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.TCTDragFunctionStart = function (event, draginfo, dobj) {
        let rowpane, colpane, row, col;

        let control = dobj.functionobj.control;
        let editor = control.editor;
        let scc = SocialCalc.Constants;

        SocialCalc.DragFunctionStart(event, draginfo, dobj);

        if (draginfo.thumbstatus) {
            // get rid of old one if mouseup was out of window
            if (draginfo.thumbstatus.rowmsgele) draginfo.thumbstatus.rowmsgele = null;
            if (draginfo.thumbstatus.rowpreviewele)
                draginfo.thumbstatus.rowpreviewele = null;
            editor.toplevel.removeChild(draginfo.thumbstatus);
            draginfo.thumbstatus = null;
        }

        draginfo.thumbstatus = document.createElement("div");

        if (dobj.vertical) {
            if (scc.TCTDFSthumbstatusvClass)
                draginfo.thumbstatus.className = scc.TCTDFSthumbstatusvClass;
            SocialCalc.setStyles(draginfo.thumbstatus, scc.TCTDFSthumbstatusvStyle);
            draginfo.thumbstatus.style.top =
                draginfo.clientY + scc.TCTDFStopOffsetv + "px";
            draginfo.thumbstatus.style.left =
                control.controlborder - 10 - editor.tablewidth / 2 + "px";
            draginfo.thumbstatus.style.width = editor.tablewidth / 2 + "px";

            draginfo.thumbcontext = new SocialCalc.RenderContext(
                editor.context.sheetobj
            );
            draginfo.thumbcontext.showGrid = true;
            draginfo.thumbcontext.rowpanes = [{ first: 1, last: 1 }];
            let pane = editor.context.colpanes[editor.context.colpanes.length - 1];
            draginfo.thumbcontext.colpanes = [{ first: pane.first, last: pane.last }];
            draginfo.thumbstatus.innerHTML =
                '<table cellspacing="0" cellpadding="0"><tr><td valign="top" style="' +
                scc.TCTDFSthumbstatusrownumStyle +
                '" class="' +
                scc.TCTDFSthumbstatusrownumClass +
                '"><div>msg</div></td><td valign="top"><div style="overflow:hidden;">preview</div></td></tr></table>';
            draginfo.thumbstatus.rowmsgele =
                draginfo.thumbstatus.firstChild.firstChild.firstChild.firstChild.firstChild;
            draginfo.thumbstatus.rowpreviewele =
                draginfo.thumbstatus.firstChild.firstChild.firstChild.childNodes[1].firstChild;
            editor.toplevel.appendChild(draginfo.thumbstatus);
            SocialCalc.TCTDragFunctionRowSetStatus(
                draginfo,
                editor,
                editor.firstscrollingrow || 1
            );
        } else {
            if (scc.TCTDFSthumbstatushClass)
                draginfo.thumbstatus.className = scc.TCTDFSthumbstatushClass;
            SocialCalc.setStyles(draginfo.thumbstatus, scc.TCTDFSthumbstatushStyle);
            draginfo.thumbstatus.style.top =
                control.controlborder + scc.TCTDFStopOffseth + "px";
            draginfo.thumbstatus.style.left =
                draginfo.clientX + scc.TCTDFSleftOffseth + "px";
            editor.toplevel.appendChild(draginfo.thumbstatus);
            draginfo.thumbstatus.innerHTML =
                scc.s_TCTDFthumbstatusPrefixh +
                SocialCalc.rcColname(editor.firstscrollingcol);
        }
    };

    //
    // SocialCalc.TCTDragFunctionRowSetStatus(draginfo, editor, row)
    //
    // Render partial row
    //

    SocialCalc.TCTDragFunctionRowSetStatus = function (draginfo, editor, row) {
        let scc = SocialCalc.Constants;
        let msg = scc.s_TCTDFthumbstatusPrefixv + row + " ";

        draginfo.thumbstatus.rowmsgele.innerHTML = msg;

        draginfo.thumbcontext.rowpanes = [{ first: row, last: row }];
        draginfo.thumbrowshown = row;

        let ele = draginfo.thumbcontext.RenderSheet(
            draginfo.thumbstatus.rowpreviewele.firstChild,
            { type: "html" }
        );
    };

    /**
     * TCTDragFunctionMove - Handle thumb drag movement
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information  
     * @param {Object} dobj - Drag object
     */
    SocialCalc.TCTDragFunctionMove = function (event, draginfo, dobj) {
        let first, msg;
        let control = dobj.functionobj.control;
        let thumbthickness = control.thumbthickness;
        let editor = control.editor;
        let scc = SocialCalc.Constants;

        if (dobj.vertical) {
            if (
                draginfo.clientY >
                control.scrollareaend - draginfo.offsetY - control.thumbthickness + 2
            )
                draginfo.clientY =
                    control.scrollareaend - draginfo.offsetY - control.thumbthickness + 2;
            if (draginfo.clientY < control.scrollareastart - draginfo.offsetY - 1)
                draginfo.clientY = control.scrollareastart - draginfo.offsetY - 1;
            draginfo.thumbstatus.style.top = draginfo.clientY + "px";

            first =
                ((draginfo.clientY + draginfo.offsetY - control.scrollareastart + 1) /
                    (control.scrollareasize - control.thumbthickness)) *
                (editor.context.sheetobj.attribs.lastrow -
                    editor.lastnonscrollingrow) +
                editor.lastnonscrollingrow +
                1;
            first = Math.floor(first);
            if (first <= editor.lastnonscrollingrow)
                first = editor.lastnonscrollingrow + 1;
            if (first > editor.context.sheetobj.attribs.lastrow)
                first = editor.context.sheetobj.attribs.lastrow;
            //      msg = scc.s_TCTDFthumbstatusPrefixv+first;
            if (first != draginfo.thumbrowshown) {
                SocialCalc.TCTDragFunctionRowSetStatus(draginfo, editor, first);
            }
        } else {
            if (
                draginfo.clientX >
                control.scrollareaend - draginfo.offsetX - control.thumbthickness + 2
            )
                draginfo.clientX =
                    control.scrollareaend - draginfo.offsetX - control.thumbthickness + 2;
            if (draginfo.clientX < control.scrollareastart - draginfo.offsetX - 1)
                draginfo.clientX = control.scrollareastart - draginfo.offsetX - 1;
            draginfo.thumbstatus.style.left = draginfo.clientX + "px";

            first =
                ((draginfo.clientX + draginfo.offsetX - control.scrollareastart + 1) /
                    (control.scrollareasize - control.thumbthickness)) *
                (editor.context.sheetobj.attribs.lastcol -
                    editor.lastnonscrollingcol) +
                editor.lastnonscrollingcol +
                1;
            first = Math.floor(first);
            if (first <= editor.lastnonscrollingcol)
                first = editor.lastnonscrollingcol + 1;
            if (first > editor.context.sheetobj.attribs.lastcol)
                first = editor.context.sheetobj.attribs.lastcol;
            msg = scc.s_TCTDFthumbstatusPrefixh + SocialCalc.rcColname(first);
            draginfo.thumbstatus.innerHTML = msg;
        }

        SocialCalc.DragFunctionPosition(event, draginfo, dobj);
    };

    /**
     * TCTDragFunctionStop - Handle thumb drag stop
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object  
     */
    SocialCalc.TCTDragFunctionStop = function (event, draginfo, dobj) {
        let first;
        let control = dobj.functionobj.control;
        let editor = control.editor;

        if (dobj.vertical) {
            first =
                ((draginfo.clientY + draginfo.offsetY - control.scrollareastart + 1) /
                    (control.scrollareasize - control.thumbthickness)) *
                (editor.context.sheetobj.attribs.lastrow -
                    editor.lastnonscrollingrow) +
                editor.lastnonscrollingrow +
                1;
            first = Math.floor(first);
            if (first <= editor.lastnonscrollingrow)
                first = editor.lastnonscrollingrow + 1;
            if (first > editor.context.sheetobj.attribs.lastrow)
                first = editor.context.sheetobj.attribs.lastrow;

            editor.context.SetRowPaneFirstLast(
                editor.context.rowpanes.length - 1,
                first,
                first + 1
            );
        } else {
            first =
                ((draginfo.clientX + draginfo.offsetX - control.scrollareastart + 1) /
                    (control.scrollareasize - control.thumbthickness)) *
                (editor.context.sheetobj.attribs.lastcol -
                    editor.lastnonscrollingcol) +
                editor.lastnonscrollingcol +
                1;
            first = Math.floor(first);
            if (first <= editor.lastnonscrollingcol)
                first = editor.lastnonscrollingcol + 1;
            if (first > editor.context.sheetobj.attribs.lastcol)
                first = editor.context.sheetobj.attribs.lastcol;

            editor.context.SetColPaneFirstLast(
                editor.context.colpanes.length - 1,
                first,
                first + 1
            );
        }

        editor.FitToEditTable();

        if (draginfo.thumbstatus.rowmsgele) draginfo.thumbstatus.rowmsgele = null;
        if (draginfo.thumbstatus.rowpreviewele)
            draginfo.thumbstatus.rowpreviewele = null;
        editor.toplevel.removeChild(draginfo.thumbstatus);
        draginfo.thumbstatus = null;

        editor.ScheduleRender();
    };

    // *************************************
    //
    // Dragging functions:
    //
    // *************************************

    SocialCalc.DragInfo = {
        // There is only one of these -- no "new" is done.
        // Only one dragging operation can be active at a time.
        // The registeredElements array is used to decide which item to drag.

        // One item for each draggable thing, each an object with:
        //    .element, .vertical, .horizontal, .functionobj

        registeredElements: [],

        // Items used during a drag

        draggingElement: null, // item being processed (.element is the actual element)
        startX: 0,
        startY: 0,
        startZ: 0,
        clientX: 0, // modifyable version to restrict movement
        clientY: 0,
        offsetX: 0,
        offsetY: 0,
        horizontalScroll: 0, // retrieved at drag start
        verticalScroll: 0,
    };

    //
    // DragRegister(element, vertical, horizontal, functionobj) - make element draggable
    //
    // The functionobj defaults to moving the element contrained only by vertical and horizontal settings.
    //

    SocialCalc.DragRegister = function (
        element,
        vertical,
        horizontal,
        functionobj
    ) {
        let draginfo = SocialCalc.DragInfo;

        if (!functionobj) {
            functionobj = {
                MouseDown: SocialCalc.DragFunctionStart,
                MouseMove: SocialCalc.DragFunctionPosition,
                MouseUp: SocialCalc.DragFunctionPosition,
                Disabled: null,
            };
        }

        draginfo.registeredElements.push({
            element: element,
            vertical: vertical,
            horizontal: horizontal,
            functionobj: functionobj,
        });

        if (element.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            element.addEventListener("mousedown", SocialCalc.DragMouseDown, false);
        } else if (element.attachEvent) {
            // IE 5+
            element.attachEvent("onmousedown", SocialCalc.DragMouseDown);
        } else {
            // don't handle this
            throw SocialCalc.Constants.s_BrowserNotSupported;
        }
    };

    /**
     * DragUnregister - remove object from list
     * @param {Element} element - The element to unregister
     */
    SocialCalc.DragUnregister = function (element) {
        let draginfo = SocialCalc.DragInfo;

        let i;

        if (!element) return;

        for (i = 0; i < draginfo.registeredElements.length; i++) {
            if (draginfo.registeredElements[i].element == element) {
                draginfo.registeredElements.splice(i, 1);
                if (element.removeEventListener) {
                    // DOM Level 2 -- Firefox, et al
                    element.removeEventListener(
                        "mousedown",
                        SocialCalc.DragMouseDown,
                        false
                    );
                } else {
                    // IE 5+
                    element.detachEvent("onmousedown", SocialCalc.DragMouseDown);
                }
                return;
            }
        }

        return; // ignore if not in list
    };

    /**
     * DragMouseDown - Handle mouse down for drag operations
     * @param {Event} event - The mouse event
     */
    SocialCalc.DragMouseDown = function (event) {
        let e = event || window.event;

        let draginfo = SocialCalc.DragInfo;

        let dobj = SocialCalc.LookupElement(
            e.target || e.srcElement,
            draginfo.registeredElements
        );
        if (!dobj) return;

        if (dobj && dobj.functionobj && dobj.functionobj.Disabled) {
            if (dobj.functionobj.Disabled(e, draginfo, dobj)) {
                return;
            }
        }

        draginfo.draggingElement = dobj;

        let viewportinfo = SocialCalc.GetViewportInfo();
        draginfo.horizontalScroll = viewportinfo.horizontalScroll;
        draginfo.verticalScroll = viewportinfo.verticalScroll;

        draginfo.clientX = e.clientX + draginfo.horizontalScroll; // get document-relative coordinates
        draginfo.clientY = e.clientY + draginfo.verticalScroll;
        draginfo.startX = draginfo.clientX;
        draginfo.startY = draginfo.clientY;
        draginfo.startZ = dobj.element.style.zIndex;
        draginfo.offsetX = 0;
        draginfo.offsetY = 0;

        dobj.element.style.zIndex = "100";

        // Event code from JavaScript, Flanagan, 5th Edition, pg. 422
        if (document.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            document.addEventListener("mousemove", SocialCalc.DragMouseMove, true); // capture everywhere
            document.addEventListener("mouseup", SocialCalc.DragMouseUp, true);
        } else if (dobj.element.attachEvent) {
            // IE 5+
            dobj.element.setCapture();
            dobj.element.attachEvent("onmousemove", SocialCalc.DragMouseMove);
            dobj.element.attachEvent("onmouseup", SocialCalc.DragMouseUp);
            dobj.element.attachEvent("onlosecapture", SocialCalc.DragMouseUp);
        }
        if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
        else e.cancelBubble = true; // IE 5+
        if (e.preventDefault) e.preventDefault(); // DOM Level 2
        else e.returnValue = false; // IE 5+

        if (dobj && dobj.functionobj && dobj.functionobj.MouseDown)
            dobj.functionobj.MouseDown(e, draginfo, dobj);

        return false;
    };

    /**
     * DragMouseMove - Handle mouse move for drag operations 
     * @param {Event} event - The mouse event
     */
    SocialCalc.DragMouseMove = function (event) {
        let e = event || window.event;

        let draginfo = SocialCalc.DragInfo;
        draginfo.clientX = e.clientX + draginfo.horizontalScroll;
        draginfo.clientY = e.clientY + draginfo.verticalScroll;

        let dobj = draginfo.draggingElement;

        if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
        else e.cancelBubble = true; // IE 5+

        if (dobj && dobj.functionobj && dobj.functionobj.MouseMove)
            dobj.functionobj.MouseMove(e, draginfo, dobj);

        return false;
    };

    /**
     * DragMouseUp - Handle mouse up for drag operations
     * @param {Event} event - The mouse event
     */
    SocialCalc.DragMouseUp = function (event) {
        let e = event || window.event;

        let draginfo = SocialCalc.DragInfo;
        draginfo.clientX = e.clientX + draginfo.horizontalScroll;
        draginfo.clientY = e.clientY + draginfo.verticalScroll;

        let dobj = draginfo.draggingElement;

        dobj.element.style.zIndex = draginfo.startZ;

        if (dobj && dobj.functionobj && dobj.functionobj.MouseUp)
            dobj.functionobj.MouseUp(e, draginfo, dobj);

        if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
        else e.cancelBubble = true; // IE 5+

        if (document.removeEventListener) {
            // DOM Level 2
            document.removeEventListener("mousemove", SocialCalc.DragMouseMove, true);
            document.removeEventListener("mouseup", SocialCalc.DragMouseUp, true);
            // Note: In old (1.5?) versions of Firefox, this causes the browser to skip the MouseUp for
            // the button code. https://bugzilla.mozilla.org/show_bug.cgi?id=174320
            // Firefox 1.5 is <1% share (http://marketshare.hitslink.com/report.aspx?qprid=7)
        } else if (dobj.element.detachEvent) {
            // IE
            dobj.element.detachEvent("onlosecapture", SocialCalc.DragMouseUp);
            dobj.element.detachEvent("onmouseup", SocialCalc.DragMouseUp);
            dobj.element.detachEvent("onmousemove", SocialCalc.DragMouseMove);
            dobj.element.releaseCapture();
        }

        draginfo.draggingElement = null;

        return false;
    };

    /**
     * DragFunctionStart - Initialize drag operation
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.DragFunctionStart = function (event, draginfo, dobj) {
        let val;
        let element = dobj.functionobj.positionobj || dobj.element;

        val = element.style.top.match(/\d*/);
        draginfo.offsetY = (val ? val[0] - 0 : 0) - draginfo.clientY;
        val = element.style.left.match(/\d*/);
        draginfo.offsetX = (val ? val[0] - 0 : 0) - draginfo.clientX;
    };

    /**
     * DragFunctionPosition - Position element during drag
     * @param {Event} event - The drag event
     * @param {Object} draginfo - Drag information
     * @param {Object} dobj - Drag object
     */
    SocialCalc.DragFunctionPosition = function (event, draginfo, dobj) {
        let element = dobj.functionobj.positionobj || dobj.element;

        if (dobj.vertical)
            element.style.top = draginfo.clientY + draginfo.offsetY + "px";
        if (dobj.horizontal)
            element.style.left = draginfo.clientX + draginfo.offsetX + "px";
    };

    // *************************************
    //
    // Tooltip functions:
    //
    // *************************************

    SocialCalc.TooltipInfo = {
        // There is only one of these -- no "new" is done.
        // Only one tooltip operation can be active at a time.
        // The registeredElements array is used to identify items.

        // One item for each element with a tooltip, each an object with:
        //    .element, .tiptext, .functionobj
        // Currently .functionobj can only contain .offsetx and .offsety.
        // If present they are used instead of the default ones.

        registeredElements: [],

        registered: false, // if true, an event handler has been registered for this functionality

        // Items used during hover over an element

        tooltipElement: null, // item being processed (.element is the actual element)
        timer: null, // timer object waiting to see if holding over element
        popupElement: null, // tooltip element being displayed
        clientX: 0, // modifyable version to restrict movement
        clientY: 0,
        offsetX: SocialCalc.Constants.TooltipOffsetX, // modifyable version to allow positioning
        offsetY: SocialCalc.Constants.TooltipOffsetY,
    };

    /**
     * TooltipRegister - Make element have a tooltip
     * @param {Element} element - The element to add tooltip to
     * @param {string} tiptext - The tooltip text
     * @param {Object} functionobj - Function object for tooltip behavior
     */
    SocialCalc.TooltipRegister = function (element, tiptext, functionobj) {
        let tooltipinfo = SocialCalc.TooltipInfo;
        tooltipinfo.registeredElements.push({
            element: element,
            tiptext: tiptext,
            functionobj: functionobj,
        });

        if (tooltipinfo.registered) return; // only need to add event listener once

        if (document.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            document.addEventListener(
                "mousemove",
                SocialCalc.TooltipMouseMove,
                false
            );
        } else if (document.attachEvent) {
            // IE 5+
            document.attachEvent("onmousemove", SocialCalc.TooltipMouseMove);
        } else {
            // don't handle this
            throw SocialCalc.Constants.s_BrowserNotSupported;
        }

        tooltipinfo.registered = true; // remember

        return;
    };

    /**
     * TooltipMouseMove - Handle mouse movement for tooltips
     * @param {Event} event - The mouse event
     */
    SocialCalc.TooltipMouseMove = function (event) {
        let e = event || window.event;

        let tooltipinfo = SocialCalc.TooltipInfo;

        tooltipinfo.viewport = SocialCalc.GetViewportInfo();
        tooltipinfo.clientX = e.clientX + tooltipinfo.viewport.horizontalScroll;
        tooltipinfo.clientY = e.clientY + tooltipinfo.viewport.verticalScroll;

        let tobj = SocialCalc.LookupElement(
            e.target || e.srcElement,
            tooltipinfo.registeredElements
        );

        if (tooltipinfo.timer) {
            // waiting to see if holding still: didn't hold still
            window.clearTimeout(tooltipinfo.timer); // cancel timer
            tooltipinfo.timer = null;
        }

        if (tooltipinfo.popupElement) {
            // currently displaying a tip: hide it
            SocialCalc.TooltipHide();
        }

        tooltipinfo.tooltipElement = tobj || null;

        if (!tobj || SocialCalc.ButtonInfo.buttonDown) return; // if not an object with a tip or a "button" is down, ignore

        tooltipinfo.timer = window.setTimeout(SocialCalc.TooltipWaitDone, 700);

        if (tooltipinfo.tooltipElement.element.addEventListener) {
            // Register event for mouse down which cancels tooltip stuff
            tooltipinfo.tooltipElement.element.addEventListener(
                "mousedown",
                SocialCalc.TooltipMouseDown,
                false
            );
        } else if (tooltipinfo.tooltipElement.element.attachEvent) {
            // IE
            tooltipinfo.tooltipElement.element.attachEvent(
                "onmousedown",
                SocialCalc.TooltipMouseDown
            );
        }

        return;
    };

    /**
     * TooltipMouseDown - Handle mouse down for tooltips
     * @param {Event} event - The mouse event
     */
    SocialCalc.TooltipMouseDown = function (event) {
        let e = event || window.event;

        let tooltipinfo = SocialCalc.TooltipInfo;

        if (tooltipinfo.timer) {
            window.clearTimeout(tooltipinfo.timer); // cancel timer
            tooltipinfo.timer = null;
        }

        if (tooltipinfo.popupElement) {
            // currently displaying a tip: hide it
            SocialCalc.TooltipHide();
        }

        if (tooltipinfo.tooltipElement) {
            if (tooltipinfo.tooltipElement.element.removeEventListener) {
                // DOM Level 2 -- Firefox, et al
                tooltipinfo.tooltipElement.element.removeEventListener(
                    "mousedown",
                    SocialCalc.TooltipMouseDown,
                    false
                );
            } else if (tooltipinfo.tooltipElement.element.attachEvent) {
                // IE 5+
                tooltipinfo.tooltipElement.element.detachEvent(
                    "onmousedown",
                    SocialCalc.TooltipMouseDown
                );
            }
            tooltipinfo.tooltipElement = null;
        }

        return;
    };

    /**
     * TooltipDisplay - Display a tooltip
     * @param {Object} tobj - The tooltip object
     */
    SocialCalc.TooltipDisplay = function (tobj) {
        let tooltipinfo = SocialCalc.TooltipInfo;
        let scc = SocialCalc.Constants;
        let offsetX =
            tobj.functionobj && typeof tobj.functionobj.offsetx === "number"
                ? tobj.functionobj.offsetx
                : tooltipinfo.offsetX;
        let offsetY =
            tobj.functionobj && typeof tobj.functionobj.offsety === "number"
                ? tobj.functionobj.offsety
                : tooltipinfo.offsetY;

        tooltipinfo.popupElement = document.createElement("div");
        if (scc.TDpopupElementClass)
            tooltipinfo.popupElement.className = scc.TDpopupElementClass;
        SocialCalc.setStyles(tooltipinfo.popupElement, scc.TDpopupElementStyle);

        tooltipinfo.popupElement.innerHTML = tobj.tiptext;

        if (tooltipinfo.clientX > tooltipinfo.viewport.width / 2) {
            // on right side of screen
            tooltipinfo.popupElement.style.bottom =
                tooltipinfo.viewport.height - tooltipinfo.clientY + offsetY + "px";
            tooltipinfo.popupElement.style.right =
                tooltipinfo.viewport.width - tooltipinfo.clientX + offsetX + "px";
        } else {
            // on left side of screen
            tooltipinfo.popupElement.style.bottom =
                tooltipinfo.viewport.height - tooltipinfo.clientY + offsetY + "px";
            tooltipinfo.popupElement.style.left =
                tooltipinfo.clientX + offsetX + "px";
        }

        if (tooltipinfo.clientY < 50) {
            // make sure fits on screen if nothing above grid
            tooltipinfo.popupElement.style.bottom =
                tooltipinfo.viewport.height - tooltipinfo.clientY + offsetY - 50 + "px";
        }

        document.body.appendChild(tooltipinfo.popupElement);
    };

    /**
     * TooltipHide - Hide the current tooltip
     */
    SocialCalc.TooltipHide = function () {
        let tooltipinfo = SocialCalc.TooltipInfo;

        if (tooltipinfo.popupElement) {
            tooltipinfo.popupElement.parentNode.removeChild(tooltipinfo.popupElement);
            tooltipinfo.popupElement = null;
        }
    };

    /**
     * TooltipWaitDone - Handle tooltip wait completion
     */

    SocialCalc.TooltipWaitDone = function () {
        let tooltipinfo = SocialCalc.TooltipInfo;

        tooltipinfo.timer = null;

        SocialCalc.TooltipDisplay(tooltipinfo.tooltipElement);
    };

    // *************************************
    //
    // Button functions:
    //
    // *************************************

    SocialCalc.ButtonInfo = {
        // There is only one of these -- no "new" is done.
        // Only one button operation can be active at a time.
        // The registeredElements array is used to identify items.

        // One item for each clickable element, each an object with:
        //    .element, .normalstyle, .hoverstyle, .downstyle, .repeatinterval, .functionobj
        //
        // .functionobj is an object with optional function objects for:
        //    mouseover, mouseout, mousedown, repeatinterval, mouseup, disabled

        registeredElements: [],

        // Items used during hover over an element, clicking, repeating, etc.

        buttonElement: null, // item being processed, hover or down (.element is the actual element)
        doingHover: false, // true if mouse is over one of our elements
        buttonDown: false, // true if button down and buttonElement not null
        timer: null, // timer object for repeating

        // Used while processing an event

        horizontalScroll: 0,
        verticalScroll: 0,
        clientX: 0,
        clientY: 0,
    };

    /**
     * ButtonRegister - Make element clickable
     * @param {Element} element - The element to make clickable
     * @param {Object} paramobj - Parameter object with style settings
     * @param {Object} functionobj - Function object for button behavior
     * 
     * The arguments (other than element) may be null (meaning no change for style and no repeat)
     * The paramobj has the optional normalstyle, hoverstyle, downstyle, repeatwait, repeatinterval settings
     */
    SocialCalc.ButtonRegister = function (element, paramobj, functionobj) {
        let buttoninfo = SocialCalc.ButtonInfo;

        if (!paramobj) paramobj = {};

        buttoninfo.registeredElements.push({
            name: paramobj.name,
            element: element,
            normalstyle: paramobj.normalstyle,
            hoverstyle: paramobj.hoverstyle,
            downstyle: paramobj.downstyle,
            repeatwait: paramobj.repeatwait,
            repeatinterval: paramobj.repeatinterval,
            functionobj: functionobj,
        });

        if (element.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            element.addEventListener("mousedown", SocialCalc.ButtonMouseDown, false);
            element.addEventListener("mouseover", SocialCalc.ButtonMouseOver, false);
            element.addEventListener("mouseout", SocialCalc.ButtonMouseOut, false);
        } else if (element.attachEvent) {
            // IE 5+
            element.attachEvent("onmousedown", SocialCalc.ButtonMouseDown);
            element.attachEvent("onmouseover", SocialCalc.ButtonMouseOver);
            element.attachEvent("onmouseout", SocialCalc.ButtonMouseOut);
        } else {
            // don't handle this
            throw SocialCalc.Constants.s_BrowserNotSupported;
        }

        return;
    };

    //
    // ButtonMouseOver(event)
    //

    /**
     * ButtonMouseOver - Handle mouse over for buttons
     * @param {Event} event - The mouse event
     */
    SocialCalc.ButtonMouseOver = function (event) {
        let e = event || window.event;

        let buttoninfo = SocialCalc.ButtonInfo;

        let bobj = SocialCalc.LookupElement(
            e.target || e.srcElement,
            buttoninfo.registeredElements
        );

        if (!bobj) return;

        if (buttoninfo.buttonDown) {
            if (buttoninfo.buttonElement == bobj) {
                buttoninfo.doingHover = true; // keep track whether we are on the pressed button or not
            }
            return;
        }

        if (
            buttoninfo.buttonElement &&
            buttoninfo.buttonElement != bobj &&
            buttoninfo.doingHover
        ) {
            // moved to a new one, undo hover there
            SocialCalc.setStyles(
                buttoninfo.buttonElement.element,
                buttoninfo.buttonElement.normalstyle
            );
        }

        buttoninfo.buttonElement = bobj; // remember this one is hovering
        buttoninfo.doingHover = true;

        SocialCalc.setStyles(bobj.element, bobj.hoverstyle); // set style (if provided)

        if (bobj && bobj.functionobj && bobj.functionobj.MouseOver)
            bobj.functionobj.MouseOver(e, buttoninfo, bobj);

        return;
    };

    /**
     * ButtonMouseOut - Handle mouse out for buttons  
     * @param {Event} event - The mouse event
     */
    SocialCalc.ButtonMouseOut = function (event) {
        let e = event || window.event;

        let buttoninfo = SocialCalc.ButtonInfo;

        if (buttoninfo.buttonDown) {
            buttoninfo.doingHover = false; // keep track of overs and outs
            return;
        }

        let bobj = SocialCalc.LookupElement(
            e.target || e.srcElement,
            buttoninfo.registeredElements
        );

        if (buttoninfo.doingHover) {
            // if there was a hover, undo it
            if (buttoninfo.buttonElement)
                SocialCalc.setStyles(
                    buttoninfo.buttonElement.element,
                    buttoninfo.buttonElement.normalstyle
                );
            buttoninfo.buttonElement = null;
            buttoninfo.doingHover = false;
        }

        if (bobj && bobj.functionobj && bobj.functionobj.MouseOut)
            bobj.functionobj.MouseOut(e, buttoninfo, bobj);

        return;
    };

    /**
     * ButtonMouseDown - Handle mouse down for buttons
     * @param {Event} event - The mouse event
     */
    SocialCalc.ButtonMouseDown = function (event) {
        let e = event || window.event;

        let buttoninfo = SocialCalc.ButtonInfo;

        let viewportinfo = SocialCalc.GetViewportInfo();

        let bobj = SocialCalc.LookupElement(
            e.target || e.srcElement,
            buttoninfo.registeredElements
        );

        if (!bobj) return; // not one of our elements

        if (bobj && bobj.functionobj && bobj.functionobj.Disabled) {
            if (bobj.functionobj.Disabled(e, buttoninfo, bobj)) {
                return;
            }
        }

        buttoninfo.buttonElement = bobj;
        buttoninfo.buttonDown = true;

        SocialCalc.setStyles(bobj.element, buttoninfo.buttonElement.downstyle);

        // Register event handler for mouse up

        // Event code from JavaScript, Flanagan, 5th Edition, pg. 422
        if (document.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            document.addEventListener("mouseup", SocialCalc.ButtonMouseUp, true); // capture everywhere
        } else if (bobj.element.attachEvent) {
            // IE 5+
            bobj.element.setCapture();
            bobj.element.attachEvent("onmouseup", SocialCalc.ButtonMouseUp);
            bobj.element.attachEvent("onlosecapture", SocialCalc.ButtonMouseUp);
        }
        if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
        else e.cancelBubble = true; // IE 5+
        if (e.preventDefault) e.preventDefault(); // DOM Level 2
        else e.returnValue = false; // IE 5+

        buttoninfo.horizontalScroll = viewportinfo.horizontalScroll;
        buttoninfo.verticalScroll = viewportinfo.verticalScroll;
        buttoninfo.clientX = e.clientX + buttoninfo.horizontalScroll; // get document-relative coordinates
        buttoninfo.clientY = e.clientY + buttoninfo.verticalScroll;

        if (bobj && bobj.functionobj && bobj.functionobj.MouseDown)
            bobj.functionobj.MouseDown(e, buttoninfo, bobj);

        if (bobj.repeatwait) {
            // if a repeat wait is set, then starting waiting for first repetition
            buttoninfo.timer = window.setTimeout(
                SocialCalc.ButtonRepeat,
                bobj.repeatwait
            );
        }

        return;
    };

    /**
     * ButtonMouseUp - Handle mouse up for buttons
     * @param {Event} event - The mouse event  
     */
    SocialCalc.ButtonMouseUp = function (event) {
        let e = event || window.event;

        let buttoninfo = SocialCalc.ButtonInfo;
        let bobj = buttoninfo.buttonElement;

        if (buttoninfo.timer) {
            // if repeating, cancel it
            window.clearTimeout(buttoninfo.timer); // cancel timer
            buttoninfo.timer = null;
        }

        if (!buttoninfo.buttonDown) return; // already did this (e.g., in IE, releaseCapture fires losecapture)

        if (e.stopPropagation) e.stopPropagation(); // DOM Level 2
        else e.cancelBubble = true; // IE 5+
        if (e.preventDefault) e.preventDefault(); // DOM Level 2
        else e.returnValue = false; // IE 5+

        if (document.removeEventListener) {
            // DOM Level 2
            document.removeEventListener("mouseup", SocialCalc.ButtonMouseUp, true);
        } else if (document.detachEvent) {
            // IE
            bobj.element.detachEvent("onlosecapture", SocialCalc.ButtonMouseUp);
            bobj.element.detachEvent("onmouseup", SocialCalc.ButtonMouseUp);
            bobj.element.releaseCapture();
        }

        if (buttoninfo.buttonElement.downstyle) {
            if (buttoninfo.doingHover)
                SocialCalc.setStyles(bobj.element, buttoninfo.buttonElement.hoverstyle);
            else
                SocialCalc.setStyles(
                    bobj.element,
                    buttoninfo.buttonElement.normalstyle
                );
        }

        buttoninfo.buttonDown = false;

        if (bobj && bobj.functionobj && bobj.functionobj.MouseUp)
            bobj.functionobj.MouseUp(e, buttoninfo, bobj);
    };

    //
    // ButtonRepeat()
    //

    /**
     * ButtonRepeat - Handle button repeat functionality
     */
    SocialCalc.ButtonRepeat = function () {
        let buttoninfo = SocialCalc.ButtonInfo;
        let bobj = buttoninfo.buttonElement;

        if (!bobj) return;

        if (bobj && bobj.functionobj && bobj.functionobj.Repeat)
            bobj.functionobj.Repeat(null, buttoninfo, bobj);

        buttoninfo.timer = window.setTimeout(
            SocialCalc.ButtonRepeat,
            bobj.repeatinterval || 100
        );
    };

    // *************************************
    //
    // MouseWheel functions:
    //
    // *************************************

    SocialCalc.MouseWheelInfo = {
        // There is only one of these -- no "new" is done.
        // The mousewheel only affects the one area the mouse pointer is over
        // The registeredElements array is used to identify items.

        // One item for each element to respond to the mousewheel, each an object with:
        //    .element, .functionobj

        registeredElements: [],
    };

    /**
     * MouseWheelRegister - Make element respond to mousewheel
     * @param {Element} element - The element to register  
     * @param {Object} functionobj - Function object for wheel behavior
     */
    SocialCalc.MouseWheelRegister = function (element, functionobj) {
        let mousewheelinfo = SocialCalc.MouseWheelInfo;

        mousewheelinfo.registeredElements.push({
            element: element,
            functionobj: functionobj,
        });

        if (element.addEventListener) {
            // DOM Level 2 -- Firefox, et al
            element.addEventListener(
                "DOMMouseScroll",
                SocialCalc.ProcessMouseWheel,
                false
            );
            element.addEventListener(
                "mousewheel",
                SocialCalc.ProcessMouseWheel,
                false
            ); // Opera needs this
        } else if (element.attachEvent) {
            // IE 5+
            element.attachEvent("onmousewheel", SocialCalc.ProcessMouseWheel);
        } else {
            // don't handle this
            throw SocialCalc.Constants.s_BrowserNotSupported;
        }

        return;
    };

    /**
     * ProcessMouseWheel - Handle mouse wheel events
     * @param {Event} e - The wheel event
     */
    SocialCalc.ProcessMouseWheel = function (e) {
        let event = e || window.event;
        let delta, coord;

        if (SocialCalc.Keyboard.passThru) return; // ignore

        let mousewheelinfo = SocialCalc.MouseWheelInfo;
        let ele = event.target || event.srcElement; // source object is often within what we want
        let wobj;

        for (wobj = null; !wobj && ele; ele = ele.parentNode) {
            // go up tree looking for one of our elements
            wobj = SocialCalc.LookupElement(ele, mousewheelinfo.registeredElements);
        }
        if (!wobj) return; // not one of our elements

        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
        } else delta = -event.detail / 3;
        if (!delta) delta = 0;

        if (wobj.functionobj && wobj.functionobj.WheelMove)
            wobj.functionobj.WheelMove(event, delta, mousewheelinfo, wobj);

        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
    };

    // *************************************
    //
    // Keyboard functions:
    //
    // For more information about keyboard handling, see: http://unixpapa.com/js/key.html
    //
    // *************************************

    SocialCalc.keyboardTables = {
        specialKeysCommon: {
            8: "[backspace]",
            9: "[tab]",
            13: "[enter]",
            25: "[tab]",
            27: "[esc]",
            33: "[pgup]",
            34: "[pgdn]",
            35: "[end]",
            36: "[home]",
            37: "[aleft]",
            38: "[aup]",
            39: "[aright]",
            40: "[adown]",
            45: "[ins]",
            46: "[del]",
            113: "[f2]",
        },

        specialKeysIE: {
            8: "[backspace]",
            9: "[tab]",
            13: "[enter]",
            25: "[tab]",
            27: "[esc]",
            33: "[pgup]",
            34: "[pgdn]",
            35: "[end]",
            36: "[home]",
            37: "[aleft]",
            38: "[aup]",
            39: "[aright]",
            40: "[adown]",
            45: "[ins]",
            46: "[del]",
            113: "[f2]",
        },

        controlKeysIE: {
            67: "[ctrl-c]",
            83: "[ctrl-s]",
            86: "[ctrl-v]",
            88: "[ctrl-x]",
            90: "[ctrl-z]",
        },

        specialKeysOpera: {
            8: "[backspace]",
            9: "[tab]",
            13: "[enter]",
            25: "[tab]",
            27: "[esc]",
            33: "[pgup]",
            34: "[pgdn]",
            35: "[end]",
            36: "[home]",
            37: "[aleft]",
            38: "[aup]",
            39: "[aright]",
            40: "[adown]",
            45: "[ins]", // issues with releases before 9.5 - same as "-" ("-" changed in 9.5)
            46: "[del]", // issues with releases before 9.5 - same as "." ("." changed in 9.5)
            113: "[f2]",
        },

        controlKeysOpera: {
            67: "[ctrl-c]",
            83: "[ctrl-s]",
            86: "[ctrl-v]",
            88: "[ctrl-x]",
            90: "[ctrl-z]",
        },

        specialKeysSafari: {
            8: "[backspace]",
            9: "[tab]",
            13: "[enter]",
            25: "[tab]",
            27: "[esc]",
            63232: "[aup]",
            63233: "[adown]",
            63234: "[aleft]",
            63235: "[aright]",
            63272: "[del]",
            63273: "[home]",
            63275: "[end]",
            63276: "[pgup]",
            63277: "[pgdn]",
            63237: "[f2]",
        },

        controlKeysSafari: {
            99: "[ctrl-c]",
            115: "[ctrl-s]",
            118: "[ctrl-v]",
            120: "[ctrl-x]",
            122: "[ctrl-z]",
        },

        ignoreKeysSafari: {
            63236: "[f1]",
            63238: "[f3]",
            63239: "[f4]",
            63240: "[f5]",
            63241: "[f6]",
            63242: "[f7]",
            63243: "[f8]",
            63244: "[f9]",
            63245: "[f10]",
            63246: "[f11]",
            63247: "[f12]",
            63289: "[numlock]",
        },

        specialKeysFirefox: {
            8: "[backspace]",
            9: "[tab]",
            13: "[enter]",
            25: "[tab]",
            27: "[esc]",
            33: "[pgup]",
            34: "[pgdn]",
            35: "[end]",
            36: "[home]",
            37: "[aleft]",
            38: "[aup]",
            39: "[aright]",
            40: "[adown]",
            45: "[ins]",
            46: "[del]",
            113: "[f2]",
        },

        controlKeysFirefox: {
            99: "[ctrl-c]",
            115: "[ctrl-s]",
            118: "[ctrl-v]",
            120: "[ctrl-x]",
            122: "[ctrl-z]",
        },

        ignoreKeysFirefox: {
            16: "[shift]",
            17: "[ctrl]",
            18: "[alt]",
            20: "[capslock]",
            19: "[pause]",
            44: "[printscreen]",
            91: "[windows]",
            92: "[windows]",
            112: "[f1]",
            114: "[f3]",
            115: "[f4]",
            116: "[f5]",
            117: "[f6]",
            118: "[f7]",
            119: "[f8]",
            120: "[f9]",
            121: "[f10]",
            122: "[f11]",
            123: "[f12]",
            144: "[numlock]",
            145: "[scrolllock]",
            224: "[cmd]",
        },
    };

    SocialCalc.Keyboard = {
        areListener: false, // if true, we have been installed as a listener for keyboard events
        focusTable: null, // the table editor object that gets keystrokes or null
        passThru: null, // if not null, control element with focus to pass keyboard events to (has blur method), or "true"
        didProcessKey: false, // did SocialCalc.ProcessKey in keydown
        statusFromProcessKey: false, // the status from the keydown SocialCalc.ProcessKey
        repeatingKeyPress: false, // some browsers (Opera, Gecko Mac) repeat special keys as KeyPress not KeyDown
        chForProcessKey: "", // remember so can do repeat in those cases
    };

    SocialCalc.KeyboardSetFocus = function (editor) {
        SocialCalc.Keyboard.focusTable = editor;

        if (!SocialCalc.Keyboard.areListener) {
            document.onkeydown = SocialCalc.ProcessKeyDown;
            document.onkeypress = SocialCalc.ProcessKeyPress;
            SocialCalc.Keyboard.areListener = true;
        }
        if (SocialCalc.Keyboard.passThru) {
            if (SocialCalc.Keyboard.passThru.blur) {
                SocialCalc.Keyboard.passThru.blur();
            }
            SocialCalc.Keyboard.passThru = null;
        }
        window.focus();
    };

    SocialCalc.KeyboardFocus = function () {
        SocialCalc.Keyboard.passThru = null;
        window.focus();
    };

    /**
     * ProcessKeyDown - Handle key down events
     * @param {Event} e - The keyboard event
     */
    SocialCalc.ProcessKeyDown = function (e) {
        let kt = SocialCalc.keyboardTables;
        kt.didProcessKey = false; // always start false
        kt.statusFromProcessKey = false;
        kt.repeatingKeyPress = false;

        let ch = "";
        let status = true;

        if (SocialCalc.Keyboard.passThru) return; // ignore

        e = e || window.event;

        // IE and Safari 3.1+ won't fire keyPress, so check for special keys here.
        if (e.which == undefined || typeof e.keyIdentifier == "string") {
            ch = kt.specialKeysCommon[e.keyCode];
            if (!ch) {
                if (e.ctrlKey) {
                    ch = kt.controlKeysIE[e.keyCode];
                }
                if (!ch) return true;
            }
            status = SocialCalc.ProcessKey(ch, e);

            if (!status) {
                if (e.preventDefault) e.preventDefault();
                e.returnValue = false;
            }
        } else {
            ch = kt.specialKeysCommon[e.keyCode];
            if (!ch) {
                //         return true;
                if (e.ctrlKey || e.metaKey) {
                    ch = kt.controlKeysIE[e.keyCode]; // this works here
                }
                if (!ch) return true;
            }

            status = SocialCalc.ProcessKey(ch, e); // process the key
            kt.didProcessKey = true; // remember what happened
            kt.statusFromProcessKey = status;
            kt.chForProcessKey = ch;
        }

        return status;
    };

    /**
     * ProcessKeyPress - Handle key press events
     * @param {Event} e - The keyboard event  
     */
    SocialCalc.ProcessKeyPress = function (e) {
        let kt = SocialCalc.keyboardTables;

        let ch = "";

        e = e || window.event;

        if (SocialCalc.Keyboard.passThru) return; // ignore
        if (kt.didProcessKey) {
            // already processed this key
            if (kt.repeatingKeyPress) {
                return SocialCalc.ProcessKey(kt.chForProcessKey, e); // process the same key as on KeyDown
            } else {
                kt.repeatingKeyPress = true; // see if get another KeyPress before KeyDown
                return kt.statusFromProcessKey; // do what it said to do
            }
        }

        if (e.which == undefined) {
            // IE
            // Note: Esc and Enter will come through here, too, if not stopped at KeyDown
            ch = String.fromCharCode(e.keyCode); // convert to a character (special chars handled at ev1)
        } else {
            // not IE
            if (!e.which) return false; // ignore - special key
            if (e.charCode == undefined) {
                // Opera
                if (e.which != 0) {
                    // character
                    if (e.which < 32 || e.which == 144) {
                        // special char (144 is numlock)
                        ch = kt.specialKeysOpera[e.which];
                        if (ch) {
                            return true;
                        }
                    } else {
                        if (e.ctrlKey) {
                            ch = kt.controlKeysOpera[e.keyCode];
                        } else {
                            ch = String.fromCharCode(e.which);
                        }
                    }
                } else {
                    // special char
                    return true;
                }
            } else if (e.keyCode == 0 && e.charCode == 0) {
                // OLPC Fn key or something
                return; // ignore
            } else if (e.keyCode == e.charCode) {
                // Safari
                ch = kt.specialKeysSafari[e.keyCode];
                if (!ch) {
                    if (kt.ignoreKeysSafari[e.keyCode])
                        // pass this through
                        return true;
                    if (e.metaKey) {
                        ch = kt.controlKeysSafari[e.keyCode];
                    } else {
                        ch = String.fromCharCode(e.which);
                    }
                }
            } else {
                // Firefox
                if (kt.specialKeysFirefox[e.keyCode]) {
                    return true;
                }
                ch = String.fromCharCode(e.which);
                if (e.ctrlKey || e.metaKey) {
                    ch = kt.controlKeysFirefox[e.which];
                }
            }
        }

        let status = SocialCalc.ProcessKey(ch, e);

        if (!status) {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        }

        return status;
    };

    /* 
  *
  * OLD ProcessKeyDown and ProcessKeyPress -- replaced for handling newer browsers, including Safari 3.1 and Opera 9.5
  *
  
  SocialCalc.ProcessKeyDown = function(e) {
  
  var kt = SocialCalc.keyboardTables;
  
  var ch="";
  var status=true;
  
  if (SocialCalc.Keyboard.passThru) return; // ignore
  
  e = e || window.event;
  
  if (e.which==undefined) { // IE
  ch = kt.specialKeysIE[e.keyCode];
  if (!ch) {
  if (e.ctrlKey) {
  ch=kt.controlKeysIE[e.keyCode];
  }
  if (!ch)
  return true;
  }
  
  status = SocialCalc.ProcessKey(ch, e);
  
  if (!status) {
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
  }
  }
  
  else { // don't do anything for other browsers - wait for keyPress
  ; // special key repeats are done as keypress in those browsers
  }
  
  return status;
  
  }
  
  SocialCalc.ProcessKeyPress = function(e) {
  
  var kt = SocialCalc.keyboardTables;
  
  var ch="";
  
  if (SocialCalc.Keyboard.passThru) return; // ignore
  
  e = e || window.event;
  
  if (e.which==undefined) { // IE
  // Note: Esc and Enter will come through here, too, if not stopped at KeyDown
  ch=String.fromCharCode(e.keyCode); // convert to a character (special chars handled at ev1)
  }
  
  else { // not IE
  if (e.charCode==undefined) { // Opera
  if (e.which!=0) { // character
  if (e.which<32) { // special char
  ch = kt.specialKeysOpera[e.keyCode];
  if (!ch)
  return true;
  }
  else {
  if (e.ctrlKey) {
  ch=kt.controlKeysOpera[e.keyCode];
  }
  else {
  ch = String.fromCharCode(e.which);
  }
  }
  }
  else { // special char
  ch = kt.specialKeysOpera[e.keyCode];
  if (!ch)
  return true;
  }
  }
  
  else if (e.keyCode==0 && e.charCode==0) { // OLPC Fn key or something
  return; // ignore
  }
  
  else if (e.keyCode==e.charCode) { // Safari
  ch = kt.specialKeysSafari[e.keyCode];
  if (!ch) {
  if (kt.ignoreKeysSafari[e.keyCode]) // pass this through
  return true;
  if (e.metaKey) {
  ch=kt.controlKeysSafari[e.keyCode];
  }
  else {
  ch = String.fromCharCode(e.which);
  }
  }
  }
  
  else { // Firefox
  ch = kt.specialKeysFirefox[e.keyCode];
  if (!ch) {
  if (kt.ignoreKeysFirefox[e.keyCode]) // pass this through
  return true;
  if (e.which) { // normal char
  if (e.ctrlKey || e.metaKey) {
  ch = kt.controlKeysFirefox[e.which];
  }
  else {
  ch = String.fromCharCode(e.which);
  }
  }
  else { // usually a special char
  return true; // old Firefox gives extra, empty keyPress for "/" - ignore
  }
  }
  }
  }
  
  var status = SocialCalc.ProcessKey(ch, e);
  
  if (!status) {
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
  }
  
  return status;
  
  }
  */

    //
    // status = SocialCalc.ProcessKey(ch, e)
    /**
     * ProcessKey - Take a key representation and dispatch to appropriate routine
     * @param {string} ch - Character representation of the key
     * @param {Event} e - The keyboard event
     */
    SocialCalc.ProcessKey = function (ch, e) {
        let ft = SocialCalc.Keyboard.focusTable;

        if (!ft) return true; // we're not handling it -- let browser do default

        return ft.EditorProcessKey(ch, e);
    };

    // For Contact
    SocialCalc.EditorChangecontact = function (
        editor,
        text,
        name,
        phone,
        email,
        street,
        city,
        company,
        val
    ) {
        // alert('changecontact called');
        //var wval = editor.workingvalues;
        if (name != "") {
            cmdline = "set " + name + " " + "text t" + " " + contactname;
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        cmdline = "set " + phone + " " + "text t" + " " + contactphoneNumber;
        editor.EditorScheduleSheetCommands(cmdline, true, false);
        if (email != "") {
            cmdline = "set " + email + " " + "text t" + " " + contactemail;
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        cmdline = "set " + street + " " + "text t" + " " + contactStreet;
        editor.EditorScheduleSheetCommands(cmdline, true, false);
        cmdline = "set " + city + " " + "text t" + " " + contactcity;
        editor.EditorScheduleSheetCommands(cmdline, true, false);
        if (val == "y") {
            cmdline = "set " + company + " " + "text t" + " " + contactcompany;
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }

        return;
    };

    //changes by mini for font and color

    SocialCalc.EditorChangeSheetcolor = function (editor, text) {
        let result, cell, valueinfo, fch, type, value, oldvalue, cmdline;

        let sheetobj = editor.context.sheetobj;
        let wval = editor.workingvalues;

        type = "text t";
        //value = typeof text == "string" ? text : editor.inputBox.GetText(); // either explicit or from input box
        value = text;

        oldvalue = SocialCalc.GetCellContents(sheetobj, wval.ecoord) + "";
        if (value == oldvalue) {
            // no change
            return;
        }
        fch = value.charAt(0);
        if (fch == "=" && value.indexOf("\n") == -1) {
            type = "formula";
            value = value.substring(1);
        } else if (fch == "'") {
            type = "text t";
            value = value.substring(1);
        } else if (value.length == 0) {
            type = "empty";
        } else {
            valueinfo = SocialCalc.DetermineValueType(value);
            if (valueinfo.type == "n" && value == valueinfo.value + "") {
                // see if don't need "constant"
                type = "value n";
            } else if (valueinfo.type.charAt(0) == "t") {
                type = "text " + valueinfo.type;
            } else if (valueinfo.type == "") {
                type = "text t";
            } else {
                type = "constant " + valueinfo.type + " " + valueinfo.value;
            }
        }

        if (type.charAt(0) == "t") {
            // text
            value = SocialCalc.encodeForSave(value); // newlines, :, and \ are escaped
        }

        // if startsheet different from currentsheet, switch to start sheet
        // for the save to take effect
        if (SocialCalc.WorkBook && wval.currentsheet != wval.startsheet) {
            let control = SocialCalc.GetCurrentWorkBookControl();
            let cmdstr = "activatesheet " + wval.startsheetid;
            control.ExecuteWorkBookControlCommand(
                { cmdtype: "wcmd", id: "0", cmdstr: cmdstr },
                false
            );
        }

        //cmdline = "set "+wval.ecoord+" "+"font"+" "+value;
        cmdline = "set " + "sheet" + " " + "defaultcolor" + " " + value;
        //cmdline = "set "+"sheet"+" "+"defaultcolor green";
        //var control = SocialCalc.GetCurrentWorkBookControl();
        //alert('u reach sheet' + " "+control.workbook.sheetArr["sheet1"].sheet);
        //cmdline = "set "+sheetobj+" "+"font"+" "+value;
        //cmdline="set "+  control.workbook.sheetArr["sheet1"].sheet+" color blue" ;
        editor.EditorScheduleSheetCommands(cmdline, true, false);

        return;
    };

    SocialCalc.EditorChangecolorFromWidget = function (editor, text) {
        var result, cell, valueinfo, fch, type, value, oldvalue, cmdline;

        var sheetobj = editor.context.sheetobj;
        var wval = editor.workingvalues;
        if (!CoordForColorChange) {
            alert("No active cell");
            return;
        }

        // if startsheet different from currentsheet, switch to start sheet
        // for the save to take effect
        if (SocialCalc.WorkBook && wval.currentsheet != wval.startsheet) {
            var control = SocialCalc.GetCurrentWorkBookControl();
            var cmdstr = "activatesheet " + wval.startsheetid;
            control.ExecuteWorkBookControlCommand(
                { cmdtype: "wcmd", id: "0", cmdstr: cmdstr },
                false
            );
        }

        cmdline = "set " + CoordForColorChange + " " + "color" + " " + text;
        editor.EditorScheduleSheetCommands(cmdline, true, false);

        return;
    };

    SocialCalc.EditorChangefontFromWidget = function (editor, text) {
        var result, cell, valueinfo, fch, type, value, oldvalue, cmdline;

        var sheetobj = editor.context.sheetobj;
        var wval = editor.workingvalues;
        if (!CoordForColorChange) {
            alert("No active cell");
            return;
        }
        //alert(CoordForColorChange);
        // if startsheet different from currentsheet, switch to start sheet
        // for the save to take effect
        if (SocialCalc.WorkBook && wval.currentsheet != wval.startsheet) {
            var control = SocialCalc.GetCurrentWorkBookControl();
            var cmdstr = "activatesheet " + wval.startsheetid;
            control.ExecuteWorkBookControlCommand(
                { cmdtype: "wcmd", id: "0", cmdstr: cmdstr },
                false
            );
        }

        //cmdline = "set "+CoordForColorChange+" "+"font"+" "+text;
        //editor.EditorScheduleSheetCommands(cmdline, true, false);
        var value = text;
        if (value == "a") {
            cmdline = "set " + CoordForColorChange + " font * 12px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value == "b") {
            cmdline = "set " + CoordForColorChange + " font * 14px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value == "c") {
            cmdline = "set " + CoordForColorChange + " font * 16px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value == "d") {
            cmdline = "set " + CoordForColorChange + " font * 18px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }

        return;
    };

    /**
     * Changes the default font for the sheet
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {string} text - The font size indicator ("a"=12px, "b"=14px, "c"=16px, "d"=18px)
     */
    SocialCalc.EditorChangeSheetfont = function (editor, text) {
        let result, cell, valueinfo, fch, type, value, oldvalue, cmdline;

        let sheetobj = editor.context.sheetobj;
        let wval = editor.workingvalues;

        type = "text t";
        value = text;

        oldvalue = SocialCalc.GetCellContents(sheetobj, wval.ecoord) + "";
        if (value === oldvalue) {
            return;
        }
        
        fch = value.charAt(0);
        if (fch === "=" && value.indexOf("\n") === -1) {
            type = "formula";
            value = value.substring(1);
        } else if (fch === "'") {
            type = "text t";
            value = value.substring(1);
        } else if (value.length === 0) {
            type = "empty";
        } else {
            valueinfo = SocialCalc.DetermineValueType(value);
            if (valueinfo.type === "n" && value === valueinfo.value + "") {
                type = "value n";
            } else if (valueinfo.type.charAt(0) === "t") {
                type = `text ${valueinfo.type}`;
            } else if (valueinfo.type === "") {
                type = "text t";
            } else {
                type = `constant ${valueinfo.type} ${valueinfo.value}`;
            }
        }

        if (type.charAt(0) === "t") {
            value = SocialCalc.encodeForSave(value);
        }

        if (SocialCalc.WorkBook && wval.currentsheet !== wval.startsheet) {
            let control = SocialCalc.GetCurrentWorkBookControl();
            let cmdstr = `activatesheet ${wval.startsheetid}`;
            control.ExecuteWorkBookControlCommand(
                { cmdtype: "wcmd", id: "0", cmdstr: cmdstr },
                false
            );
        }

        if (value === "a") {
            cmdline = "set sheet defaultfont * 12px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value === "b") {
            cmdline = "set sheet defaultfont * 14px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value === "c") {
            cmdline = "set sheet defaultfont * 16px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }
        if (value === "d") {
            cmdline = "set sheet defaultfont * 18px *";
            editor.EditorScheduleSheetCommands(cmdline, true, false);
        }

        return;
    };

    /**
     * Handles cut, copy, paste, and erase operations in the editor
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {string} value - The operation type ("a"=cut, "b"=copy, "c"=paste, "d"=erase)
     */
    SocialCalc.EditorCut = function (editor, value) {
        let cmdline = "";
        let sheetobj = editor.context.sheetobj;
        let wval = editor.workingvalues;
        
        if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
            if (!SocialCalc.Callbacks.IsCellEditable(editor)) {
                return true;
            }
        }
        
        if (value === "a") {
            cmdline = `cut ${editCoord} all`;
        } else if (value === "b") {
            cmdline = `copy ${editCoord} all`;
        } else if (value === "c") {
            cmdline = `paste ${editCoord} all`;
        } else if (value === "d") {
            cmdline = `erase ${editCoord} formulas`;
        }
        
        editor.EditorScheduleSheetCommands(cmdline, true, false);
    };

    /**
     * Clears the contents of specified cells in the sheet
     * 
     * @param {SocialCalc.TableEditor} editor - The table editor
     * @param {string} cell_to_clear - The cell or range to clear
     */
    SocialCalc.EditorClearSheet = function (editor, cell_to_clear) {
        let cmdline = `erase ${cell_to_clear} formulas`;
        editor.EditorScheduleSheetCommands(cmdline, true, false);
    };

// Module export for ES6 compatibility
export default SocialCalc;

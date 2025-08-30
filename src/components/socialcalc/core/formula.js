/* eslint-disable */
// SocialCalc Formula Module
// Extracted from the main SocialCalc.js file

/**
 * SocialCalc Formula Module. Handles Popup controls.
 * @module SocialCalcFormula
 * @copyright 2009 Socialtext, Inc.
 * @license Artistic License 2.0
 */

// UMD wrapper
((root, factory) => {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.SocialCalcFormula = factory();
    }
})(typeof self !== "undefined" ? self : this, () => {

    /**
     * Global SocialCalc namespace.
     * @namespace
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
     * @namespace SocialCalc.Popup
     */

    SocialCalc.Popup = {};

    /** @type {Object<string, Object>} Different control types and their methods */
    SocialCalc.Popup.Types = {};

    /** @type {Object<string, Object>} Control definitions by id */
    SocialCalc.Popup.Controls = {};

    /** @type {Object} System-wide values for the currently active control */
    SocialCalc.Popup.Current = {};

    /** @type {string} Image prefix for popup assets */
    SocialCalc.Popup.imagePrefix = "www/assets/images/sc_";

    /**
     * Localizes a string. Override for i18n.
     * @param {string} str
     * @returns {string}
     */
    SocialCalc.Popup.LocalizeString = str => str;

    // GENERAL ROUTINES

    /**
     * Creates a popup control of the specified type.
     * @param {string} type
     * @param {string} id
     * @param {Object} attribs
     */
    SocialCalc.Popup.Create = (type, id, attribs) => {
        let pt = SocialCalc.Popup.Types[type];
        if (pt && pt.Create) pt.Create(type, id, attribs);
    };

    /**
     * Sets the value of a specific control.
     * @param {string} id
     * @param {*} value
     */
    SocialCalc.Popup.SetValue = (id, value) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!spc[id]) {
            alert(`Unknown control ${id}`);
            return;
        }

        let type = spc[id].type;
        let pt = spt[type];
        let spcdata = spc[id].data;

        if (pt && pt.Create) {
            pt.SetValue(type, id, value);
            if (spcdata.attribs?.changedcallback) {
                spcdata.attribs.changedcallback(spcdata.attribs, id, value);
            }
        }
    };

    /**
     * Sets the disabled state of a popup control.
     * @param {string} id
     * @param {boolean} disabled
     */
    SocialCalc.Popup.SetDisabled = (id, disabled) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!spc[id]) {
            alert(`Unknown control ${id}`);
            return;
        }

        let type = spc[id].type;
        let pt = spt[type];

        if (pt && pt.Create) {
            if (sp.Current.id && id === sp.Current.id) {
                pt.Hide(type, sp.Current.id);
                sp.Current.id = null;
            }
            pt.SetDisabled(type, id, disabled);
        }
    };

    /**
     * Gets the current value for a popup control.
     * @param {string} id
     * @returns {*|null}
     */
    SocialCalc.Popup.GetValue = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!spc[id]) {
            alert(`Unknown control ${id}`);
            return;
        }

        let type = spc[id].type;
        let pt = spt[type];
        if (pt && pt.Create) return pt.GetValue(type, id);

        return null;
    };

    /**
     * Initializes a control with data.
     * @param {string} id
     * @param {*} data
     */
    SocialCalc.Popup.Initialize = (id, data) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!spc[id]) {
            alert(`Unknown control ${id}`);
            return;
        }

        let type = spc[id].type;
        let pt = spt[type];
        if (pt && pt.Initialize) pt.Initialize(type, id, data);
    };

    /**
     * Resets popup controls of a specific type.
     * @param {string} type
     */
    SocialCalc.Popup.Reset = type => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        if (spt[type].Reset) spt[type].Reset(type);
    };

    /**
     * Handles click on a popup control, for opening/closing it.
     * @param {string} id
     */
    SocialCalc.Popup.CClick = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!spc[id]) {
            alert(`Unknown control ${id}`);
            return;
        }

        if (spc[id].data?.disabled) return;

        let type = spc[id].type;
        let pt = spt[type];

        if (sp.Current.id) {
            spt[spc[sp.Current.id].type].Hide(type, sp.Current.id);
            if (id === sp.Current.id) {
                sp.Current.id = null;
                return;
            }
        }

        if (pt && pt.Show) pt.Show(type, id);
        sp.Current.id = id;
    };

    /**
     * Closes the current popup, if open.
     */
    SocialCalc.Popup.Close = () => {
        let sp = SocialCalc.Popup;
        if (!sp.Current.id) return;
        sp.CClick(sp.Current.id);
    };

    /**
     * Cancels the popup, restoring old value.
     */
    SocialCalc.Popup.Cancel = () => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (!sp.Current.id) return;

        let type = spc[sp.Current.id].type;
        let pt = spt[type];

        pt.Cancel(type, sp.Current.id);
        sp.Current.id = null;
    };

    /**
     * Creates and returns the main popup div.
     * @param {string} id
     * @param {Object} attribs
     * @returns {HTMLElement}
     */
    SocialCalc.Popup.CreatePopupDiv = (id, attribs) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let main = document.createElement("div");
        main.style.position = "absolute";

        let pos = SocialCalc.GetElementPositionWithScroll(spcdata.mainele);

        main.style.top = `${pos.top + spcdata.mainele.offsetHeight}px`;
        main.style.left = `${pos.left}px`;
        main.style.zIndex = 100;
        main.style.backgroundColor = "#FFF";
        main.style.border = "1px solid black";

        if (attribs.width) main.style.width = attribs.width;

        spcdata.mainele.appendChild(main);

        if (attribs.title) {
            main.innerHTML =
                `<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>` +
                `<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">${attribs.title}</td>` +
                `<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.Popup.Cancel();">&nbsp;X&nbsp;</td></tr></table>`;

            if (attribs.moveable) {
                spcdata.dragregistered =
                    main.firstChild.firstChild.firstChild.firstChild;
                SocialCalc.DragRegister(spcdata.dragregistered, true, true, {
                    MouseDown: SocialCalc.DragFunctionStart,
                    MouseMove: SocialCalc.DragFunctionPosition,
                    MouseUp: SocialCalc.DragFunctionPosition,
                    Disabled: null,
                    positionobj: main,
                });
            }
        }

        return main;
    };

    /**
     * Ensures popup is positioned within its container.
     * @param {string} id
     * @param {HTMLElement} container
     */
    SocialCalc.Popup.EnsurePosition = (id, container) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let main = spcdata.mainele.firstChild;
        if (!main) {
            alert("No main popup element firstChild.");
            return;
        }
        let popup = spcdata.popupele;

        /**
         * Gets layout values for a given element.
         * @param {HTMLElement} ele
         * @returns {Object}
         */
        let GetLayoutValues = ele => {
            let r = SocialCalc.GetElementPositionWithScroll(ele);
            r.height = ele.offsetHeight;
            r.width = ele.offsetWidth;
            r.bottom = r.top + r.height;
            r.right = r.left + r.width;
            return r;
        };

        let p = GetLayoutValues(popup);
        let c = GetLayoutValues(container);
        let m = GetLayoutValues(main);
        let t = 0;

        if (m.bottom + p.height < c.bottom && m.left + p.width < c.right) {
            popup.style.top = `${m.bottom}px`;
            popup.style.left = `${m.left}px`;
            t = 1;
        } else if (m.top - p.height > c.top && m.left + p.width < c.right) {
            popup.style.top = `${m.top - p.height}px`;
            popup.style.left = `${m.left}px`;
            t = 2;
        } else if (m.bottom + p.height < c.bottom && m.right - p.width > c.left) {
            popup.style.top = `${m.bottom}px`;
            popup.style.left = `${m.right - p.width}px`;
            t = 3;
        } else if (m.top - p.height > c.top && m.right - p.width > c.left) {
            popup.style.top = `${m.top - p.height}px`;
            popup.style.left = `${m.right - p.width}px`;
            t = 4;
        } else if (m.bottom + p.height < c.bottom && p.width < c.width) {
            popup.style.top = `${m.bottom}px`;
            popup.style.left = `${c.left + Math.floor((c.width - p.width) / 2)}px`;
            t = 5;
        } else if (m.top - p.height > c.top && p.width < c.width) {
            popup.style.top = `${m.top - p.height}px`;
            popup.style.left = `${c.left + Math.floor((c.width - p.width) / 2)}px`;
            t = 6;
        } else if (p.height < c.height && m.right + p.width < c.right) {
            popup.style.top = `${c.top + Math.floor((c.height - p.height) / 2)}px`;
            popup.style.left = `${m.right}px`;
            t = 7;
        } else if (p.height < c.height && m.left - p.width > c.left) {
            popup.style.top = `${c.top + Math.floor((c.height - p.height) / 2)}px`;
            popup.style.left = `${m.left - p.width}px`;
            t = 8;
        }
        // No fit: leave as is.
    };
    //
    // ele = SocialCalc.Popup.DestroyPopupDiv(ele, dragregistered)
    //
    // Utility function to get rid of the main popup div.
    //

    /**
     * Destroys the main popup div and unregisters drag event listeners.
     * @param {HTMLElement} ele - Popup element to destroy.
     * @param {HTMLElement} dragregistered - Element registered for drag.
     */
    SocialCalc.Popup.DestroyPopupDiv = (ele, dragregistered) => {
        if (!ele) return;
        ele.innerHTML = "";
        SocialCalc.DragUnregister(dragregistered); // OK to do this even if not registered
        if (ele.parentNode) ele.parentNode.removeChild(ele);
    };

    //
    // Color Utility Functions
    //

    /**
     * Converts 'rgb(r,g,b)' string to a hex color string.
     * @param {string} val - The rgb() string.
     * @returns {string} Hex string without a #.
     */
    SocialCalc.Popup.RGBToHex = val => {
        let sp = SocialCalc.Popup;
        if (val === "") return "000000";
        let rgbvals = val.match(/(\d+)\D+(\d+)\D+(\d+)/);
        return rgbvals
            ? sp.ToHex(rgbvals[1]) + sp.ToHex(rgbvals[2]) + sp.ToHex(rgbvals[3])
            : "000000";
    };

    /** @type {string} Allowed hex digits for color conversion. */
    SocialCalc.Popup.HexDigits = "0123456789ABCDEF";

    /**
     * Converts a number (0-255) to its 2-digit hex string.
     * @param {number|string} num
     * @returns {string}
     */
    SocialCalc.Popup.ToHex = num => {
        let sp = SocialCalc.Popup;
        let n = Number(num);
        let first = Math.floor(n / 16);
        let second = n % 16;
        return sp.HexDigits.charAt(first) + sp.HexDigits.charAt(second);
    };

    /**
     * Converts a 2-digit hex string to a number.
     * @param {string} str
     * @returns {number}
     */
    SocialCalc.Popup.FromHex = str => {
        let sp = SocialCalc.Popup;
        let first = sp.HexDigits.indexOf(str.charAt(0).toUpperCase());
        let second = sp.HexDigits.indexOf(str.charAt(1).toUpperCase());
        return (first >= 0 ? first : 0) * 16 + (second >= 0 ? second : 0);
    };

    /**
     * Converts a "#RRGGBB" string to rgb(r,g,b).
     * @param {string} val
     * @returns {string}
     */
    SocialCalc.Popup.HexToRGB = val => {
        let sp = SocialCalc.Popup;
        return `rgb(${sp.FromHex(val.substring(1, 3))},${sp.FromHex(val.substring(3, 5))},${sp.FromHex(val.substring(5, 7))})`;
    };

    /**
     * Returns an rgb(r,g,b) string from separate values.
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {string}
     */
    SocialCalc.Popup.makeRGB = (r, g, b) =>
        `rgb(${r > 0 ? r : 0},${g > 0 ? g : 0},${b > 0 ? b : 0})`;

    /**
     * Splits an "rgb(r,g,b)" string into component numbers.
     * @param {string} rgb
     * @returns {{r: number, g: number, b: number}}
     */
    SocialCalc.Popup.splitRGB = rgb => {
        let parts = rgb.match(/(\d+)\D+(\d+)\D+(\d+)\D/);
        if (!parts) return { r: 0, g: 0, b: 0 };
        return { r: +parts[1], g: +parts[2], b: +parts[3] };
    };

    // * * * * * * * * * * * * * * * *
    // ROUTINES FOR EACH TYPE
    // * * * * * * * * * * * * * * * *

    //
    // List popup type
    //

    SocialCalc.Popup.Types.List = {};

    /**
     * Creates a new 'List' popup control.
     * @param {string} type
     * @param {string} id
     * @param {Object} attribs
     */
    SocialCalc.Popup.Types.List.Create = (type, id, attribs) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        let spcid = { type, value: "", display: "", data: {} };
        if (spc[id]) return;
        spc[id] = spcid;
        let spcdata = spcid.data;

        spcdata.attribs = attribs || {};

        let ele = document.getElementById(id);
        if (!ele) {
            alert(`Missing element ${id}`);
            return;
        }

        spcdata.mainele = ele;

        ele.innerHTML =
            `<input style="cursor:pointer;width:${spcdata.attribs.inputWidth || "100px"};font-size:smaller;" onfocus="this.blur();" onclick="SocialCalc.Popup.CClick('${id}');" value="">`;

        spcdata.options = []; // set to nothing - use Initialize to fill
    };

    /**
     * Sets the value of a 'List' popup and updates its display.
     * @param {string} type
     * @param {string} id
     * @param {*} value
     */
    SocialCalc.Popup.Types.List.SetValue = (type, id, value) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        spcdata.value = value;
        spcdata.custom = false;

        let found = false;
        for (let i = 0; i < spcdata.options.length; i++) {
            let o = spcdata.options[i];
            if (o.a?.skip || o.a?.custom || o.a?.cancel) continue;
            if (o.v == spcdata.value) {
                spcdata.display = o.o;
                found = true;
                break;
            }
        }
        if (!found) {
            spcdata.display = "Custom";
            spcdata.custom = true;
        }

        if (spcdata.mainele?.firstChild)
            spcdata.mainele.firstChild.value = spcdata.display;
    };

    /**
     * Enables or disables a 'List' popup control.
     * @param {string} type
     * @param {string} id
     * @param {boolean} disabled
     */
    SocialCalc.Popup.Types.List.SetDisabled = (type, id, disabled) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        spcdata.disabled = disabled;

        if (spcdata.mainele?.firstChild)
            spcdata.mainele.firstChild.disabled = disabled;
    };

    /**
     * Gets the value of a 'List' popup control.
     * @param {string} type
     * @param {string} id
     * @returns {*}
     */
    SocialCalc.Popup.Types.List.GetValue = (type, id) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        return spcdata.value;
    };

    /**
     * Initializes a 'List' popup with data.
     * @param {string} type
     * @param {string} id
     * @param {{value:*,attribs:Object,options:Array}} data
     */
    SocialCalc.Popup.Types.List.Initialize = (type, id, data) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        for (let a in data.attribs) spcdata.attribs[a] = data.attribs[a];

        spcdata.options = data ? data.options : [];
        if (data.value) sp.SetValue(id, data.value);
    };

    /**
     * Resets all open popups of this type.
     * @param {string} type
     */
    SocialCalc.Popup.Types.List.Reset = type => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        if (sp.Current.id && spc[sp.Current.id].type === type) {
            spt[type].Hide(type, sp.Current.id);
            sp.Current.id = null;
        }
    };

    /**
     * Shows the popup for a 'List' type control.
     * @param {string} type
     * @param {string} id
     */
    SocialCalc.Popup.Types.List.Show = (type, id) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let str = "";

        spcdata.popupele = sp.CreatePopupDiv(id, spcdata.attribs);

        let ele;
        if (spcdata.custom) {
            str = SocialCalc.Popup.Types.List.MakeCustom(type, id);
            ele = document.createElement("div");
            ele.innerHTML =
                `<div style="cursor:default;padding:4px;background-color:#CCC;">${str}</div>`;

            spcdata.customele = ele.firstChild.firstChild.childNodes[1];
            spcdata.listdiv = null;
            spcdata.contentele = ele;
        } else {
            str = SocialCalc.Popup.Types.List.MakeList(type, id);
            ele = document.createElement("div");
            ele.innerHTML = `<div style="cursor:default;padding:4px;">${str}</div>`;

            spcdata.customele = null;
            spcdata.listdiv = ele.firstChild;
            spcdata.contentele = ele;
        }

        if (spcdata.mainele?.firstChild)
            spcdata.mainele.firstChild.disabled = true;

        spcdata.popupele.appendChild(ele);

        if (spcdata.attribs.ensureWithin)
            SocialCalc.Popup.EnsurePosition(id, spcdata.attribs.ensureWithin);
    };

    /**
     * Builds the HTML string for a list dropdown.
     * @param {string} type
     * @param {string} id
     * @returns {string}
     */
    SocialCalc.Popup.Types.List.MakeList = (type, id) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let str = '<table cellspacing="0" cellpadding="0"><tr>';
        let td = '<td style="vertical-align:top;">';

        str += td;
        spcdata.ncols = 1;

        for (let i = 0; i < spcdata.options.length; i++) {
            let o = spcdata.options[i];
            if (o.a) {
                if (o.a.newcol) {
                    str += `</td>${td}&nbsp;&nbsp;&nbsp;&nbsp;</td>${td}`;
                    spcdata.ncols += 1;
                    continue;
                }
                if (o.a.skip) {
                    str += `<div style="font-size:x-small;white-space:nowrap;">${o.o}</div>`;
                    continue;
                }
            }
            let bg =
                o.v == spcdata.value && !(o.a && (o.a.custom || o.a.cancel))
                    ? "background-color:#DDF;"
                    : "";
            str +=
                `<div style="font-size:x-small;white-space:nowrap;${bg}" onclick="SocialCalc.Popup.Types.List.ItemClicked('${id}','${i}');" onmousemove="SocialCalc.Popup.Types.List.MouseMove('${id}',this);">${o.o}</div>`;
        }

        str += "</td></tr></table>";

        return str;
    };
    /**
     * Builds the HTML for the custom value popup in a List control.
     * @param {string} type
     * @param {string} id
     * @returns {string}
     */
    SocialCalc.Popup.Types.List.MakeCustom = (type, id) => {
        let SPLoc = SocialCalc.Popup.LocalizeString;
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let style = 'style="font-size:smaller;"';
        let val = spcdata.value;
        val = SocialCalc.special_chars(val);

        return `
        <div style="white-space:nowrap;"><br>
            <input id="customvalue" value="${val}"><br><br>
            <input ${style} type="button" value="${SPLoc("OK")}" onclick="SocialCalc.Popup.Types.List.CustomOK('${id}');return false;">
            <input ${style} type="button" value="${SPLoc("List")}" onclick="SocialCalc.Popup.Types.List.CustomToList('${id}');">
            <input ${style} type="button" value="${SPLoc("Cancel")}" onclick="SocialCalc.Popup.Close();"><br>
        </div>
    `;
    };

    /**
     * Handles an item click within the List popup.
     * @param {string} id
     * @param {number|string} num
     */
    SocialCalc.Popup.Types.List.ItemClicked = (id, num) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        let a = spcdata.options[num].a;

        if (a?.custom) {
            let oele = spcdata.contentele;
            let str = SocialCalc.Popup.Types.List.MakeCustom("List", id);
            let nele = document.createElement("div");
            nele.innerHTML = `<div style="cursor:default;padding:4px;background-color:#CCC;">${str}</div>`;
            spcdata.customele = nele.firstChild.firstChild.childNodes[1];
            spcdata.listdiv = null;
            spcdata.contentele = nele;
            spcdata.popupele.replaceChild(nele, oele);
            if (spcdata.attribs.ensureWithin) {
                SocialCalc.Popup.EnsurePosition(id, spcdata.attribs.ensureWithin);
            }
            return;
        }
        if (a?.cancel) {
            SocialCalc.Popup.Close();
            return;
        }
        SocialCalc.Popup.SetValue(id, spcdata.options[num].v);
        SocialCalc.Popup.Close();
    };

    /**
     * Switches from the custom value popup back to the canonical list representation.
     * @param {string} id
     */
    SocialCalc.Popup.Types.List.CustomToList = id => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        let oele = spcdata.contentele;
        let str = SocialCalc.Popup.Types.List.MakeList("List", id);
        let nele = document.createElement("div");
        nele.innerHTML = `<div style="cursor:default;padding:4px;">${str}</div>`;
        spcdata.customele = null;
        spcdata.listdiv = nele.firstChild;
        spcdata.contentele = nele;
        spcdata.popupele.replaceChild(nele, oele);

        if (spcdata.attribs.ensureWithin) {
            SocialCalc.Popup.EnsurePosition(id, spcdata.attribs.ensureWithin);
        }
    };

    /**
     * Handles clicking OK for a custom value in the List popup.
     * @param {string} id
     */
    SocialCalc.Popup.Types.List.CustomOK = id => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        SocialCalc.Popup.SetValue(id, spcdata.customele.value);
        SocialCalc.Popup.Close();
    };

    /**
     * Handles mouse movement for row highlighting in List popups.
     * @param {string} id
     * @param {HTMLElement} ele
     */
    SocialCalc.Popup.Types.List.MouseMove = (id, ele) => {
        let spc = SocialCalc.Popup.Controls;
        let spcdata = spc[id].data;
        let list = spcdata.listdiv;
        if (!list) return;
        let rowele = list.firstChild.firstChild.firstChild;

        for (let col = 0; col < spcdata.ncols; col++) {
            for (let i = 0; i < rowele.childNodes[col * 2].childNodes.length; i++) {
                rowele.childNodes[col * 2].childNodes[i].style.backgroundColor = "#FFF";
            }
        }
        ele.style.backgroundColor = "#DDF";
    };

    /**
     * Hides the List popup and restores the disabled state of the input.
     * @param {string} type
     * @param {string} id
     */
    SocialCalc.Popup.Types.List.Hide = (type, id) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        sp.DestroyPopupDiv(spcdata.popupele, spcdata.dragregistered);
        spcdata.popupele = null;
        if (spcdata.mainele?.firstChild)
            spcdata.mainele.firstChild.disabled = false;
    };

    /**
     * Cancels the List popup.
     * @param {string} type
     * @param {string} id
     */
    SocialCalc.Popup.Types.List.Cancel = (type, id) => {
        SocialCalc.Popup.Types.List.Hide(type, id);
    };

    //
    // ColorChooser popup type
    //

    SocialCalc.Popup.Types.ColorChooser = {};

    /**
     * Creates a new 'ColorChooser' popup control.
     * @param {string} type
     * @param {string} id
     * @param {Object} attribs
     */
    SocialCalc.Popup.Types.ColorChooser.Create = (type, id, attribs) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;

        let spcid = { type, value: "", display: "", data: {} };
        if (spc[id]) return;
        spc[id] = spcid;
        let spcdata = spcid.data;

        spcdata.attribs = attribs || {};

        let ele = document.getElementById(id);
        if (!ele) {
            alert(`Missing element ${id}`);
            return;
        }

        spcdata.mainele = ele;

        ele.innerHTML =
            `<input style="cursor:pointer;width:${spcdata.attribs.inputWidth || "80px"};font-size:smaller;" onfocus="this.blur();" onclick="SocialCalc.Popup.CClick('${id}');" value="">`;
    };

    /**
     * Sets the value of a 'ColorChooser' popup and updates its display.
     * @param {string} type
     * @param {string} id
     * @param {*} value
     */
    SocialCalc.Popup.Types.ColorChooser.SetValue = (type, id, value) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        spc[id].value = value;
        spc[id].display = value;
        spcdata.mainele.firstChild.value = value || "";
    };

    /**
     * Gets the value of a 'ColorChooser' popup.
     * @param {string} type
     * @param {string} id
     * @returns {*}
     */
    SocialCalc.Popup.Types.ColorChooser.GetValue = (type, id) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        return spc[id].value;
    };

    /**
     * Sets the disabled state of a 'ColorChooser' popup.
     * @param {string} type
     * @param {string} id
     * @param {boolean} disabled
     */
    SocialCalc.Popup.Types.ColorChooser.SetDisabled = (type, id, disabled) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        if (spcdata.mainele && spcdata.mainele.firstChild) {
            spcdata.mainele.firstChild.disabled = disabled;
        }
    };

    /**
     * Shows the 'ColorChooser' popup.
     * @param {string} type
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.Show = (type, id) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        if (sp.Current.id && sp.Current.id === id) {
            spt.ColorChooser.Hide(type, id);
            return;
        }

        if (sp.Current.id) {
            let oldtype = spc[sp.Current.id].type;
            spt[oldtype].Hide(oldtype, sp.Current.id);
        }

        sp.Current.id = id;
        let mainele = spt.ColorChooser.CreateGrid("ColorChooser", id);
        spcdata.popup = mainele;

        // Position and show the popup
        let ele = spcdata.mainele;
        if (ele) {
            mainele.style.position = "absolute";
            mainele.style.left = (ele.offsetLeft + 10) + "px";
            mainele.style.top = (ele.offsetTop + ele.offsetHeight + 5) + "px";
            mainele.style.zIndex = "1000";
            document.body.appendChild(mainele);
        }
    };

    /**
     * Hides the 'ColorChooser' popup.
     * @param {string} type
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.Hide = (type, id) => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        if (spcdata.popup && spcdata.popup.parentNode) {
            spcdata.popup.parentNode.removeChild(spcdata.popup);
        }
        spcdata.popup = null;
        if (sp.Current.id === id) {
            sp.Current.id = null;
        }
    };

    /**
     * Creates the color chooser grid of selectable colors.
     * @param {string} type
     * @param {string} id
     * @returns {HTMLElement} The main element containing the grid.
     */
    SocialCalc.Popup.Types.ColorChooser.CreateGrid = (type, id) => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;
        let SPLoc = sp.LocalizeString;
        let spcdata = spc[id].data;

        spcdata.grid = {};
        let grid = spcdata.grid;

        let mainele = document.createElement("div");

        // Create table element for the color grid
        let ele = document.createElement("table");
        ele.cellSpacing = 0;
        ele.cellPadding = 0;
        ele.style.width = "100px";
        grid.table = ele;

        ele = document.createElement("tbody");
        grid.table.appendChild(ele);
        grid.tbody = ele;

        // Build 16 rows and 5 columns of the grid
        for (let row = 0; row < 16; row++) {
            let rowele = document.createElement("tr");
            for (let col = 0; col < 5; col++) {
                let g = {};
                grid[`${row},${col}`] = g;

                ele = document.createElement("td");
                ele.style.fontSize = "1px";
                ele.innerHTML = "&nbsp;";
                ele.style.height = "10px";

                if (col <= 1) {
                    ele.style.width = "17px";
                    ele.style.borderRight = "3px solid white";
                } else {
                    ele.style.width = "20px";
                    ele.style.backgroundRepeat = "no-repeat";
                }
                rowele.appendChild(ele);
                g.ele = ele;
            }
            grid.tbody.appendChild(rowele);
        }
        mainele.appendChild(grid.table);

        // Create control buttons area below the grid
        ele = document.createElement("div");
        ele.style.marginTop = "3px";
        ele.innerHTML =
            `<table cellspacing="0" cellpadding="0"><tr>` +
            `<td style="width:17px;background-color:#FFF;background-image:url(${sp.imagePrefix}defaultcolor.gif);height:16px;font-size:10px;cursor:pointer;" title="${SPLoc("Default")}">&nbsp;</td>` +
            `<td style="width:23px;height:16px;font-size:10px;text-align:center;cursor:pointer;" title="${SPLoc("Custom")}">#</td>` +
            `<td style="width:60px;height:16px;font-size:10px;text-align:center;cursor:pointer;">${SPLoc("OK")}</td>` +
            `</tr></table>`;

        grid.defaultbox = ele.firstChild.firstChild.firstChild.childNodes[0];
        grid.defaultbox.onclick = spt.ColorChooser.DefaultClicked;
        grid.custom = ele.firstChild.firstChild.firstChild.childNodes[1];
        grid.custom.onclick = spt.ColorChooser.CustomClicked;
        grid.msg = ele.firstChild.firstChild.firstChild.childNodes[2];
        grid.msg.onclick = spt.ColorChooser.CloseOK;

        mainele.appendChild(ele);

        grid.table.onmousedown = spt.ColorChooser.GridMouseDown;

        spt.ColorChooser.DetermineColors(id);
        spt.ColorChooser.SetColors(id);

        return mainele;
    };

    /**
     * Retrieves the grid cell object at a specific row and column.
     * @param {Object} grid
     * @param {number} row
     * @param {number} col
     * @returns {Object}
     */
    SocialCalc.Popup.Types.ColorChooser.gridToG = (grid, row, col) => grid[`${row},${col}`];

    /**
     * Determines and sets RGB color values for the color grid based on selected value.
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.DetermineColors = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        let grid = spcdata.grid;

        let col, row;
        let rgb = sp.splitRGB(spcdata.value);

        // Red channel
        col = 2;
        row = 16 - Math.floor((rgb.r + 16) / 16);
        grid["selectedrow" + col] = row;
        for (row = 0; row < 16; row++) {
            sptc.gridToG(grid, row, col).rgb = sp.makeRGB(17 * (15 - row), 0, 0);
        }

        // Green channel
        col = 3;
        row = 16 - Math.floor((rgb.g + 16) / 16);
        grid["selectedrow" + col] = row;
        for (row = 0; row < 16; row++) {
            sptc.gridToG(grid, row, col).rgb = sp.makeRGB(0, 17 * (15 - row), 0);
        }

        // Blue channel
        col = 4;
        row = 16 - Math.floor((rgb.b + 16) / 16);
        grid["selectedrow" + col] = row;
        for (row = 0; row < 16; row++) {
            sptc.gridToG(grid, row, col).rgb = sp.makeRGB(0, 0, 17 * (15 - row));
        }

        // Continue setting grayscale colors for column 1
        col = 1;
        for (row = 0; row < 16; row++) {
            sptc.gridToG(grid, row, col).rgb = sp.makeRGB(
                17 * (15 - row),
                17 * (15 - row),
                17 * (15 - row)
            );
        }

        // Set common RGB colors for column 0
        col = 0;
        let steps = [0, 68, 153, 204, 255];
        let commonrgb = [
            "400", "310", "420", "440", "442", "340", "040", "042",
            "032", "044", "024", "004", "204", "314", "402", "414",
        ];
        for (row = 0; row < 16; row++) {
            let x = commonrgb[row];
            sptc.gridToG(grid, row, col).rgb =
                `rgb(${steps[x.charAt(0) - 0]},${steps[x.charAt(1) - 0]},${steps[x.charAt(2) - 0]})`;
        }
    };

    /**
     * Sets the colors on the grid elements based on assigned rgb values.
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.SetColors = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;
        let spcdata = spc[id].data;
        let grid = spcdata.grid;

        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 5; col++) {
                let g = sptc.gridToG(grid, row, col);
                g.ele.style.backgroundColor = g.rgb;
                g.ele.title = sp.RGBToHex(g.rgb);
                if (grid["selectedrow" + col] === row) {
                    g.ele.style.backgroundImage = `url(${sp.imagePrefix}chooserarrow.gif)`;
                } else {
                    g.ele.style.backgroundImage = "";
                }
            }
        }

        sp.SetValue(id, spcdata.value);

        grid.msg.style.backgroundColor = spcdata.value;
        let rgb = sp.splitRGB(spcdata.value || "rgb(255,255,255)");
        if (rgb.r + rgb.g + rgb.b < 220) {
            grid.msg.style.color = "#FFF";
        } else {
            grid.msg.style.color = "#000";
        }
        if (!spcdata.value) {
            grid.msg.style.backgroundColor = "#FFF";
            grid.msg.style.backgroundImage = `url(${sp.imagePrefix}defaultcolor.gif)`;
            grid.msg.title = "Default";
        } else {
            grid.msg.style.backgroundImage = "";
            grid.msg.title = sp.RGBToHex(spcdata.value);
        }
    };

    /**
     * Handles mouse down/up/move events on the color chooser grid.
     * @param {Event} e
     */
    SocialCalc.Popup.Types.ColorChooser.GridMouseDown = e => {
        let event = e || window.event;
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;

        let id = sp.Current.id;
        if (!id) return;

        let spcdata = spc[id].data;
        let grid = spcdata.grid;

        switch (event.type) {
            case "mousedown":
                grid.mousedown = true;
                break;
            case "mouseup":
                grid.mousedown = false;
                break;
            case "mousemove":
                if (!grid.mousedown) {
                    return;
                }
                break;
        }

        let viewport = SocialCalc.GetViewportInfo();
        let clientX = event.clientX + viewport.horizontalScroll;
        let clientY = event.clientY + viewport.verticalScroll;
        let gpos = SocialCalc.GetElementPosition(grid.table);

        let row = Math.floor((clientY - gpos.top - 2) / 10); // -2 corrects IE/FF difference
        row = Math.min(Math.max(row, 0), 15);
        let col = Math.floor((clientX - gpos.left) / 20);
        col = Math.min(Math.max(col, 0), 4);

        let color = sptc.gridToG(grid, row, col).ele.style.backgroundColor;
        let newrgb = sp.splitRGB(color);
        let oldrgb = sp.splitRGB(spcdata.value);

        switch (col) {
            case 2:
                spcdata.value = sp.makeRGB(newrgb.r, oldrgb.g, oldrgb.b);
                break;
            case 3:
                spcdata.value = sp.makeRGB(oldrgb.r, newrgb.g, oldrgb.b);
                break;
            case 4:
                spcdata.value = sp.makeRGB(oldrgb.r, oldrgb.g, newrgb.b);
                break;
            case 0:
            case 1:
                spcdata.value = color;
        }

        sptc.DetermineColors(id);
        sptc.SetColors(id);
    };

    /**
     * Handles click on the color chooser control.
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.ControlClicked = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;

        let cid = sp.Current.id;
        if (!cid || id !== cid) {
            sp.CClick(id);
            return;
        }

        sptc.CloseOK();
    };

    /**
     * Handles 'Default' button click in color chooser.
     * @param {Event} e
     */
    SocialCalc.Popup.Types.ColorChooser.DefaultClicked = e => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;

        let id = sp.Current.id;
        if (!id) return;

        let spcdata = spc[id].data;
        spcdata.value = "";
        SocialCalc.Popup.SetValue(id, spcdata.value);
        SocialCalc.Popup.Close();
    };

    /**
     * Handles 'Custom' button click in color chooser.
     * @param {Event} e
     */
    SocialCalc.Popup.Types.ColorChooser.CustomClicked = e => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;

        let id = sp.Current.id;
        if (!id) return;

        let spcdata = spc[id].data;

        let oele = spcdata.contentele;
        let str = SocialCalc.Popup.Types.ColorChooser.MakeCustom("ColorChooser", id);
        let nele = document.createElement("div");
        nele.innerHTML = `<div style="cursor:default;padding:4px;background-color:#CCC;">${str}</div>`;
        spcdata.customele = nele.firstChild.firstChild.childNodes[2];
        spcdata.contentele = nele;
        spcdata.popupele.replaceChild(nele, oele);

        spcdata.customele.value = sp.RGBToHex(spcdata.value);

        if (spcdata.attribs.ensureWithin) {
            SocialCalc.Popup.EnsurePosition(id, spcdata.attribs.ensureWithin);
        }
    };

    /**
     * Switches from custom color input back to the color grid.
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.CustomToGrid = id => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        SocialCalc.Popup.SetValue(id, sp.HexToRGB("#" + spcdata.customele.value));

        let oele = spcdata.contentele;
        let mainele = SocialCalc.Popup.Types.ColorChooser.CreateGrid("ColorChooser", id);
        let nele = document.createElement("div");
        nele.style.padding = "3px";
        nele.style.backgroundColor = "#CCC";
        nele.appendChild(mainele);

        spcdata.customele = null;
        spcdata.contentele = nele;
        spcdata.popupele.replaceChild(nele, oele);

        if (spcdata.attribs.ensureWithin) {
            SocialCalc.Popup.EnsurePosition(id, spcdata.attribs.ensureWithin);
        }
    };

    /**
     * Accepts custom color OK click, updating the color and closing popup.
     * @param {string} id
     */
    SocialCalc.Popup.Types.ColorChooser.CustomOK = id => {
        let sp = SocialCalc.Popup;
        let spc = sp.Controls;
        let spcdata = spc[id].data;

        SocialCalc.Popup.SetValue(id, sp.HexToRGB("#" + spcdata.customele.value));
        SocialCalc.Popup.Close();
    };

    /**
     * Handles OK button click closing popup without changes.
     * @param {Event} e
     */
    SocialCalc.Popup.Types.ColorChooser.CloseOK = e => {
        let sp = SocialCalc.Popup;
        let spt = sp.Types;
        let sptc = spt.ColorChooser;
        let spc = sp.Controls;

        let id = sp.Current.id;
        if (!id) return;

        let spcdata = spc[id].data;

        SocialCalc.Popup.SetValue(id, spcdata.value);
        SocialCalc.Popup.Close();
    };

    // Make sure SocialCalc is available globally
    if (typeof window !== "undefined") {
        window.SocialCalc = SocialCalc;
    } else if (typeof global !== "undefined") {
        global.SocialCalc = SocialCalc;
    }

    return SocialCalc;
});


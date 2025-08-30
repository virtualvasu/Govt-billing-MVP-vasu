/**
 * @fileoverview SocialCalc Number Formatting Module
 * A standalone module for formatting numbers extracted from the main SocialCalc.js file.
 * 
 * Part of the SocialCalc package.
 * (c) Copyright 2008 Socialtext, Inc.
 * All Rights Reserved.
 * 
 * The contents of this file are subject to the Artistic License 2.0; you may not
 * use this file except in compliance with the License. You may obtain a copy of 
 * the License at http://socialcalc.org/licenses/al-20/.
 */

/* eslint-disable */

// Get SocialCalc namespace from global context
let SocialCalc = globalThis.SocialCalc || {};

// =============================================================================
// MODULE INITIALIZATION
// =============================================================================

/**
 * @namespace SocialCalc.FormatNumber
 * @description Main formatting namespace containing all number formatting functionality
 */
SocialCalc.FormatNumber = SocialCalc.FormatNumber || {};

/**
 * @type {Object<string, Object>}
 * @description Parsed formats are stored here globally
 */
SocialCalc.FormatNumber.format_definitions = SocialCalc.FormatNumber.format_definitions || {};

// =============================================================================
// LOCALIZATION CONSTANTS
// =============================================================================
// Most constants that are often customized for localization are in the SocialCalc.Constants module.
// If you use this module standalone, provide at least the "FormatNumber" values.
// The following values may be customized externally for further localization of the format definitions themselves,
// but that would make them incompatible with other uses and is discouraged.

/**
 * @type {string}
 * @description Character used as thousands separator
 */
SocialCalc.FormatNumber.separatorchar = ",";

/**
 * @type {string}
 * @description Character used as decimal point
 */
SocialCalc.FormatNumber.decimalchar = ".";

/**
 * @type {string[]}
 * @description Full day names for date formatting
 */
SocialCalc.FormatNumber.daynames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

/**
 * @type {string[]}
 * @description Abbreviated day names (3 characters)
 */
SocialCalc.FormatNumber.daynames3 = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

/**
 * @type {string[]}
 * @description Abbreviated month names (3 characters)
 */
SocialCalc.FormatNumber.monthnames3 = [
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
];

/**
 * @type {string[]}
 * @description Full month names for date formatting
 */
SocialCalc.FormatNumber.monthnames = [
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
];

// =============================================================================
// COLOR AND DATE CONFIGURATION
// =============================================================================

/**
 * @type {Object<string, string>}
 * @description Allowed color names mapped to their hex values
 */
SocialCalc.FormatNumber.allowedcolors = {
    BLACK: "#000000",
    BLUE: "#0000FF",
    CYAN: "#00FFFF",
    GREEN: "#00FF00",
    MAGENTA: "#FF00FF",
    RED: "#FF0000",
    WHITE: "#FFFFFF",
    YELLOW: "#FFFF00",
};

/**
 * @type {Object<string, string>}
 * @description Allowed date format patterns
 */
SocialCalc.FormatNumber.alloweddates = {
    H: "h]",
    M: "m]",
    MM: "mm]",
    S: "s]",
    SS: "ss]",
};

// =============================================================================
// COMMAND CONSTANTS
// =============================================================================

/**
 * @type {Object<string, number>}
 * @description Format command constants used in parsing
 */
SocialCalc.FormatNumber.commands = {
    copy: 1,
    color: 2,
    integer_placeholder: 3,
    fraction_placeholder: 4,
    decimal: 5,
    currency: 6,
    general: 7,
    separator: 8,
    date: 9,
    comparison: 10,
    section: 11,
    style: 12,
};

/**
 * @type {Object<string, number>}
 * @description Date calculation constants
 */
SocialCalc.FormatNumber.datevalues = {
    julian_offset: 2415019,
    seconds_in_a_day: 24 * 60 * 60,
    seconds_in_an_hour: 60 * 60,
};

// =============================================================================
// MAIN FORMATTING FUNCTION
// =============================================================================

/**
 * @description Formats a number according to the specified format string and currency character
 * @param {number} rawvalue - The raw numeric value to be formatted
 * @param {string} format_string - The format string describing how to format the number
 * @param {string} [currency_char] - Optional currency character to use in formatting
 * @returns {string} The formatted number as a string
 * @throws {Error} When the format string cannot be parsed
 */
SocialCalc.FormatNumber.formatNumberWithFormat = (rawvalue, format_string, currency_char) => {
    let scc = SocialCalc.Constants;
    let scfn = SocialCalc.FormatNumber;

    let op, operandstr, fromend, cval, operandstrlc;
    let startval, estartval;
    let hrs, mins, secs, ehrs, emins, esecs, ampmstr, ymd;
    let minOK, mpos;
    let result = "";
    let thisformat;
    let section, gotcomparison, compop, compval, cpos, oppos;
    let sectioninfo;
    let i, scaledvalue, strvalue, strparts, integervalue, fractionvalue;
    let integerdigits2, integerpos, fractionpos, textcolor, textstyle, separatorchar, decimalchar;
    let mspos;

    // Convert to number and validate
    rawvalue = Number(rawvalue);
    let value = rawvalue; // working copy to change sign, etc.

    if (!isFinite(value)) return "NaN";

    // Determine sign and special cases
    let negativevalue = value < 0 ? 1 : 0;
    if (negativevalue) value = -value;
    let zerovalue = value === 0 ? 1 : 0;

    // Set default currency character
    currency_char = currency_char || scc?.FormatNumber_DefaultCurrency;

    // Parse format string and get format structure
    scfn.parse_format_string(scfn.format_definitions, format_string);
    thisformat = scfn.format_definitions[format_string];

    if (!thisformat) throw new Error("Format not parsed error!");

    // Get number of sections - 1
    section = thisformat.sectioninfo.length - 1;

    if (thisformat.hascomparison) {
        // Has comparisons - determine which section to use
        section = 0;
        gotcomparison = 0;

        for (cpos = 0; ; cpos++) {
            // Scan for comparisons
            op = thisformat.operators[cpos];
            operandstr = thisformat.operands[cpos];

            if (!op) {
                // At end with no match
                if (gotcomparison) {
                    // If comparison but no match, use default General format
                    format_string = "General";
                    scfn.parse_format_string(scfn.format_definitions, format_string);
                    thisformat = scfn.format_definitions[format_string];
                    section = 0;
                }
                break; // If no comparison, matches on this section
            }

            if (op === scfn.commands.section) {
                // End of section
                if (!gotcomparison) {
                    // No comparison, so it's a match
                    break;
                }
                gotcomparison = 0;
                section++; // Check out next one
                continue;
            }

            if (op === scfn.commands.comparison) {
                // Found a comparison - do we meet it?
                i = operandstr.indexOf(":");
                compop = operandstr.substring(0, i);
                compval = Number(operandstr.substring(i + 1));

                if ((compop === "<" && rawvalue < compval) ||
                    (compop === "<=" && rawvalue <= compval) ||
                    (compop === "=" && rawvalue === compval) ||
                    (compop === "<>" && rawvalue !== compval) ||
                    (compop === ">=" && rawvalue >= compval) ||
                    (compop === ">" && rawvalue > compval)) {
                    // A match
                    break;
                }
                gotcomparison = 1;
            }
        }
    } else if (section > 0) {
        // More than one section (separated by ";")
        if (section === 1) {
            // Two sections
            if (negativevalue) {
                negativevalue = 0; // Sign will be provided by section, not automatically
                section = 1; // Use second section for negative values
            } else {
                section = 0; // Use first for all others
            }
        } else if (section === 2) {
            // Three sections
            if (negativevalue) {
                negativevalue = 0; // Sign will be provided by section, not automatically
                section = 1; // Use second section for negative values
            } else if (zerovalue) {
                section = 2; // Use third section for zero values
            } else {
                section = 0; // Use first for positive
            }
        }
    }

    // Get section information for our specific section
    sectioninfo = thisformat.sectioninfo[section];

    // =============================================================================
    // VALUE SCALING AND PREPROCESSING
    // =============================================================================

    // Scale by thousands if commas are specified
    if (sectioninfo.commas > 0) {
        for (let i = 0; i < sectioninfo.commas; i++) {
            value /= 1000;
        }
    }

    // Apply percent scaling if specified
    if (sectioninfo.percent > 0) {
        for (let i = 0; i < sectioninfo.percent; i++) {
            value *= 100;
        }
    }

    // Cut down to required number of decimal digits
    let decimalscale = 1;
    for (let i = 0; i < sectioninfo.fractiondigits; i++) {
        decimalscale *= 10;
    }
    scaledvalue = Math.floor(value * decimalscale + 0.5);
    scaledvalue = scaledvalue / decimalscale;

    if (typeof scaledvalue !== "number") return "NaN";
    if (!isFinite(scaledvalue)) return "NaN";

    // Convert to string (Number.toFixed doesn't do all we need)
    strvalue = `${scaledvalue}`;

    // Handle zero values - no "-0" unless using multiple sections or General
    if (scaledvalue === 0 && (sectioninfo.fractiondigits || sectioninfo.integerdigits)) {
        negativevalue = 0;
    }

    // If converted to scientific notation, return plain converted raw value
    if (strvalue.indexOf("e") >= 0) {
        return `${rawvalue}`;
    }

    // =============================================================================
    // STRING PARSING AND VALUE EXTRACTION
    // =============================================================================

    // Get integer and fraction parts using regex
    strparts = strvalue.match(/^\+{0,1}(\d*)(?:\.(\d*)){0,1}$/);
    if (!strparts) return "NaN";

    integervalue = strparts[1];
    if (!integervalue || integervalue === "0") integervalue = "";

    fractionvalue = strparts[2];
    if (!fractionvalue) fractionvalue = "";

    // =============================================================================
    // DATE/TIME PROCESSING
    // =============================================================================

    if (sectioninfo.hasdate) {
        // Handle date placeholders
        if (rawvalue < 0) {
            return "??-???-??&nbsp;??:??:??";
        }

        // Get date/time parts
        startval = (rawvalue - Math.floor(rawvalue)) * scfn.datevalues.seconds_in_a_day;
        estartval = rawvalue * scfn.datevalues.seconds_in_a_day; // elapsed time version

        // Calculate hours, minutes, seconds
        hrs = Math.floor(startval / scfn.datevalues.seconds_in_an_hour);
        ehrs = Math.floor(estartval / scfn.datevalues.seconds_in_an_hour);
        startval = startval - hrs * scfn.datevalues.seconds_in_an_hour;
        mins = Math.floor(startval / 60);
        emins = Math.floor(estartval / 60);
        secs = startval - mins * 60;

        // Round appropriately depending if there is ss.0
        decimalscale = 1;
        for (let i = 0; i < sectioninfo.fractiondigits; i++) {
            decimalscale *= 10;
        }
        secs = Math.floor(secs * decimalscale + 0.5);
        secs = secs / decimalscale;
        esecs = Math.floor(estartval * decimalscale + 0.5);
        esecs = esecs / decimalscale;

        // Handle round up into next second, minute, etc.
        if (secs >= 60) {
            secs = 0;
            mins++;
            emins++;
            if (mins >= 60) {
                mins = 0;
                hrs++;
                ehrs++;
                if (hrs >= 24) {
                    hrs = 0;
                    rawvalue++;
                }
            }
        }

        // For "hh:mm:ss.000" format
        fractionvalue = `${secs - Math.floor(secs)}`;
        fractionvalue = fractionvalue.substring(2); // skip "0."

        // Convert Julian date to Gregorian
        ymd = SocialCalc.FormatNumber.convert_date_julian_to_gregorian(
            Math.floor(rawvalue + scfn.datevalues.julian_offset)
        );

        // =============================================================================
        // AM/PM AND MINUTES PROCESSING
        // =============================================================================

        minOK = 0; // says "m" can be minutes if true
        mspos = sectioninfo.sectionstart; // m scan position in ops

        // Scan for "m" and "mm" to see if any minutes fields, and am/pm
        for (; ; mspos++) {
            op = thisformat.operators[mspos];
            operandstr = thisformat.operands[mspos];
            if (!op) break;
            if (op === scfn.commands.section) break;

            if (op === scfn.commands.date) {
                // Handle AM/PM formatting
                if ((operandstrlc === "am/pm" || operandstrlc === "a/p") && !ampmstr) {
                    if (hrs >= 12) {
                        hrs -= 12;
                        ampmstr = operandstrlc === "a/p"
                            ? scc.s_FormatNumber_pm1
                            : scc.s_FormatNumber_pm;
                    } else {
                        ampmstr = operandstrlc === "a/p"
                            ? scc.s_FormatNumber_am1
                            : scc.s_FormatNumber_am;
                    }
                    if (operandstr.indexOf(ampmstr) < 0) {
                        ampmstr = ampmstr.toLowerCase(); // case match
                    }
                }

                // Convert m/mm to min/mmin for minutes after hours
                if (minOK && (operandstr === "m" || operandstr === "mm")) {
                    thisformat.operands[mspos] += "in";
                }

                if (operandstr.charAt(0) === "h") {
                    minOK = 1; // m following h/hh/[h] is minutes not months
                } else {
                    minOK = 0;
                }
            } else if (op !== scfn.commands.copy) {
                minOK = 0; // copying chars can be between h and m
            }
        }

        // Scan backwards for seconds after minutes
        minOK = 0;
        for (--mspos; ; mspos--) {
            op = thisformat.operators[mspos];
            operandstr = thisformat.operands[mspos];
            if (!op) break;
            if (op === scfn.commands.section) break;

            if (op === scfn.commands.date) {
                if (minOK && (operandstr === "m" || operandstr === "mm")) {
                    thisformat.operands[mspos] += "in";
                }
                if (operandstr === "ss") {
                    minOK = 1; // m before ss is minutes not months
                } else {
                    minOK = 0;
                }
            } else if (op !== scfn.commands.copy) {
                minOK = 0; // copying chars can be between ss and m
            }
        }
    }

    // =============================================================================
    // FORMAT EXECUTION SETUP
    // =============================================================================

    // Initialize counters and formatting variables
    integerdigits2 = 0;
    integerpos = 0;
    fractionpos = 0;
    textcolor = "";
    textstyle = "";

    // Set separator and decimal characters with space handling
    separatorchar = scc.FormatNumber_separatorchar;
    if (separatorchar.indexOf(" ") >= 0) {
        separatorchar = separatorchar.replace(/ /g, "&nbsp;");
    }

    decimalchar = scc.FormatNumber_decimalchar;
    if (decimalchar.indexOf(" ") >= 0) {
        decimalchar = decimalchar.replace(/ /g, "&nbsp;");
    }

    oppos = sectioninfo.sectionstart;

    // =============================================================================
    // FORMAT EXECUTION LOOP
    // =============================================================================

    while ((op = thisformat.operators[oppos])) {
        operandstr = thisformat.operands[oppos++];

        if (op === scfn.commands.copy) {
            // Put character in result
            result += operandstr;

        } else if (op === scfn.commands.color) {
            // Set color
            textcolor = operandstr;

        } else if (op === scfn.commands.style) {
            // Set style
            textstyle = operandstr;

        } else if (op === scfn.commands.integer_placeholder) {
            // Insert number part
            if (negativevalue) {
                result += "-";
                negativevalue = 0;
            }

            integerdigits2++;
            if (integerdigits2 === 1) {
                // First integer placeholder - handle overflow
                if (integervalue.length > sectioninfo.integerdigits) {
                    for (; integerpos < integervalue.length - sectioninfo.integerdigits; integerpos++) {
                        result += integervalue.charAt(integerpos);
                        if (sectioninfo.thousandssep) {
                            fromend = integervalue.length - integerpos - 1;
                            if (fromend > 2 && fromend % 3 === 0) {
                                result += separatorchar;
                            }
                        }
                    }
                }
            }

            if (integervalue.length < sectioninfo.integerdigits &&
                integerdigits2 <= sectioninfo.integerdigits - integervalue.length) {
                // Field is wider than value - fill with appropriate characters
                if (operandstr === "0" || operandstr === "?") {
                    result += operandstr === "0" ? "0" : "&nbsp;";
                    if (sectioninfo.thousandssep) {
                        fromend = sectioninfo.integerdigits - integerdigits2;
                        if (fromend > 2 && fromend % 3 === 0) {
                            result += separatorchar;
                        }
                    }
                }
            } else {
                // Normal integer digit - add it
                result += integervalue.charAt(integerpos);
                if (sectioninfo.thousandssep) {
                    fromend = integervalue.length - integerpos - 1;
                    if (fromend > 2 && fromend % 3 === 0) {
                        result += separatorchar;
                    }
                }
                integerpos++;
            }

        } else if (op === scfn.commands.fraction_placeholder) {
            // Add fraction part of number
            if (fractionpos >= fractionvalue.length) {
                if (operandstr === "0" || operandstr === "?") {
                    result += operandstr === "0" ? "0" : "&nbsp;";
                }
            } else {
                result += fractionvalue.charAt(fractionpos);
            }
            fractionpos++;

        } else if (op === scfn.commands.decimal) {
            // Decimal point
            if (negativevalue) {
                result += "-";
                negativevalue = 0;
            }
            result += decimalchar;

        } else if (op === scfn.commands.currency) {
            // Currency symbol
            if (negativevalue) {
                result += "-";
                negativevalue = 0;
            }
            result += operandstr;

        } else if (op === scfn.commands.general) {
            // Insert "General" conversion

            // Cut down number of significant digits to avoid floating point artifacts
            if (value !== 0) {
                let factor = Math.floor(Math.LOG10E * Math.log(value));
                let scalingFactor = Math.pow(10, 13 - factor);
                value = Math.floor(scalingFactor * value + 0.5) / scalingFactor;
                if (!isFinite(value)) return "NaN";
            }

            if (negativevalue) {
                result += "-";
            }

            strvalue = `${value}`;
            if (strvalue.indexOf("e") >= 0) {
                result += strvalue;
                continue;
            }

            strparts = strvalue.match(/^\+{0,1}(\d*)(?:\.(\d*)){0,1}$/);
            integervalue = strparts[1];
            if (!integervalue || integervalue === "0") integervalue = "";
            fractionvalue = strparts[2];
            if (!fractionvalue) fractionvalue = "";

            integerpos = 0;
            fractionpos = 0;

            if (integervalue.length) {
                for (; integerpos < integervalue.length; integerpos++) {
                    result += integervalue.charAt(integerpos);
                    if (sectioninfo.thousandssep) {
                        fromend = integervalue.length - integerpos - 1;
                        if (fromend > 2 && fromend % 3 === 0) {
                            result += separatorchar;
                        }
                    }
                }
            } else {
                result += "0";
            }

            if (fractionvalue.length) {
                result += decimalchar;
                for (; fractionpos < fractionvalue.length; fractionpos++) {
                    result += fractionvalue.charAt(fractionpos);
                }
            }

        } else if (op === scfn.commands.date) {
            // Date placeholder processing
            operandstrlc = operandstr.toLowerCase();

            if (operandstrlc === "y" || operandstrlc === "yy") {
                result += `${ymd.year}`.substring(2);
            } else if (operandstrlc === "yyyy") {
                result += `${ymd.year}`;
            } else if (operandstrlc === "d") {
                result += `${ymd.day}`;
            } else if (operandstrlc === "dd") {
                cval = 1000 + ymd.day;
                result += `${cval}`.substr(2);
            } else if (operandstrlc === "ddd") {
                cval = Math.floor(rawvalue + 6) % 7;
                result += scc.s_FormatNumber_daynames3[cval];
            } else if (operandstrlc === "dddd") {
                cval = Math.floor(rawvalue + 6) % 7;
                result += scc.s_FormatNumber_daynames[cval];
            } else if (operandstrlc === "m") {
                result += `${ymd.month}`;
            } else if (operandstrlc === "mm") {
                cval = 1000 + ymd.month;
                result += `${cval}`.substr(2);
            } else if (operandstrlc === "mmm") {
                result += scc.s_FormatNumber_monthnames3[ymd.month - 1];
            } else if (operandstrlc === "mmmm") {
                result += scc.s_FormatNumber_monthnames[ymd.month - 1];
            } else if (operandstrlc === "mmmmm") {
                result += scc.s_FormatNumber_monthnames[ymd.month - 1].charAt(0);
            } else if (operandstrlc === "h") {
                result += `${hrs}`;
            } else if (operandstrlc === "h]") {
                result += `${ehrs}`;
            } else if (operandstrlc === "mmin") {
                cval = `${1000 + mins}`;
                result += cval.substr(2);
            } else if (operandstrlc === "mm]") {
                if (emins < 100) {
                    cval = `${1000 + emins}`;
                    result += cval.substr(2);
                } else {
                    result += `${emins}`;
                }
            } else if (operandstrlc === "min") {
                result += `${mins}`;
            } else if (operandstrlc === "m]") {
                result += `${emins}`;
            } else if (operandstrlc === "hh") {
                cval = `${1000 + hrs}`;
                result += cval.substr(2);
            } else if (operandstrlc === "s") {
                cval = Math.floor(secs);
                result += `${cval}`;
            } else if (operandstrlc === "ss") {
                cval = `${1000 + Math.floor(secs)}`;
                result += cval.substr(2);
            } else if (operandstrlc === "am/pm" || operandstrlc === "a/p") {
                result += ampmstr;
            } else if (operandstrlc === "ss]") {
                if (esecs < 100) {
                    cval = `${1000 + Math.floor(esecs)}`;
                    result += cval.substr(2);
                } else {
                    cval = Math.floor(esecs);
                    result += `${cval}`;
                }
            }

        } else if (op === scfn.commands.section) {
            // End of section
            break;

        } else if (op === scfn.commands.comparison) {
            // Ignore comparison commands during formatting
            continue;

        } else {
            result += "!! Parse error !!";
        }
    }

    // =============================================================================
    // FINAL FORMATTING AND STYLING
    // =============================================================================

    // Apply text color if specified
    if (textcolor) {
        result = `<span style="color:${textcolor};">${result}</span>`;
    }

    // Apply text style if specified
    if (textstyle) {
        result = `<span style="${textstyle};">${result}</span>`;
    }

    return result;
};
// =============================================================================
// FORMAT STRING PARSING FUNCTIONS
// =============================================================================

/**
 * @description Parses a format string and fills in format_defs with the parsed information
 * @param {Object<string, Object>} format_defs - Hash to store parsed format definitions
 * @param {string} format_string - Format string to parse (e.g., "#,##0.00_);(#,##0.00)")
 * 
 * Format structure:
 * format_defs["#,##0.0"] -> {
 *   operators: [], // array of operators from parsing (each a number)
 *   operands: [], // array of corresponding operands (each usually a string)
 *   sectioninfo: [{}], // one hash for each section of the format
 *   hascomparison: boolean // true if any section has [<100], etc.
 * }
 * 
 * Section info structure:
 * {
 *   start: number,
 *   integerdigits: number,
 *   fractiondigits: number,
 *   commas: number,
 *   percent: number,
 *   thousandssep: boolean,
 *   hasdate: boolean
 * }
 */
SocialCalc.FormatNumber.parse_format_string = (format_defs, format_string) => {
    let scfn = SocialCalc.FormatNumber;

    // Early return if format already exists
    if (format_defs[format_string]) return;

    // Create info structure for this format
    let thisformat = {
        operators: [],
        operands: [],
        sectioninfo: [{}],
        hascomparison: false
    };
    format_defs[format_string] = thisformat;

    // =============================================================================
    // PARSING STATE VARIABLES
    // =============================================================================

    let section = 0; // current section number
    let sectioninfo = thisformat.sectioninfo[section]; // reference to current section info

    // Initialize section info
    sectioninfo.sectionstart = 0; // position in operands that starts this section
    sectioninfo.integerdigits = 0; // number of integer-part placeholders
    sectioninfo.fractiondigits = 0; // fraction placeholders
    sectioninfo.commas = 0; // commas encountered, to handle scaling
    sectioninfo.percent = 0; // times to scale by 100
    sectioninfo.thousandssep = false;
    sectioninfo.hasdate = false;

    // Parsing state flags
    let integerpart = true; // start out in integer part
    let lastwasinteger = false; // last char was an integer placeholder
    let lastwasslash = false; // last char was a backslash - escaping following character
    let lastwasasterisk = false; // repeat next char
    let lastwasunderscore = false; // last char was _ which picks up following char for width
    let inquote = false; // processing a quoted string
    let quotestr = ""; // quoted string content
    let inbracket = false; // processing a bracketed string
    let bracketstr = ""; // bracket content
    let ingeneral = 0; // checks for characters "General"
    let ampmstr = ""; // checks for characters "A/P" and "AM/PM"
    let indate = ""; // keeps track of date/time placeholders

    // =============================================================================
    // MAIN PARSING LOOP
    // =============================================================================

    for (let chpos = 0; chpos < format_string.length; chpos++) {
        let ch = format_string.charAt(chpos); // get next char to examine

        // Handle quoted strings
        if (inquote) {
            if (ch === '"') {
                inquote = false;
                thisformat.operators.push(scfn.commands.copy);
                thisformat.operands.push(quotestr);
                continue;
            }
            quotestr += ch;
            continue;
        }

        // Handle bracketed expressions
        if (inbracket) {
            if (ch === ']') {
                inbracket = false;
                let bracketdata = SocialCalc.FormatNumber.parse_format_bracket(bracketstr);

                if (bracketdata.operator === scfn.commands.separator) {
                    sectioninfo.thousandssep = true; // explicit [,]
                    continue;
                }
                if (bracketdata.operator === scfn.commands.date) {
                    sectioninfo.hasdate = true;
                }
                if (bracketdata.operator === scfn.commands.comparison) {
                    thisformat.hascomparison = true;
                }

                thisformat.operators.push(bracketdata.operator);
                thisformat.operands.push(bracketdata.operand);
                continue;
            }
            bracketstr += ch;
            continue;
        }

        // Handle escaped characters
        if (lastwasslash) {
            thisformat.operators.push(scfn.commands.copy);
            thisformat.operands.push(ch);
            lastwasslash = false;
            continue;
        }

        // Handle repeated characters (asterisk)
        if (lastwasasterisk) {
            thisformat.operators.push(scfn.commands.copy);
            thisformat.operands.push(ch.repeat(5)); // do 5 of them since no real tabs
            lastwasasterisk = false;
            continue;
        }

        // Handle underscore spacing
        if (lastwasunderscore) {
            thisformat.operators.push(scfn.commands.copy);
            thisformat.operands.push("&nbsp;");
            lastwasunderscore = false;
            continue;
        }

        // Handle "General" keyword
        if (ingeneral) {
            if ("general".charAt(ingeneral) === ch.toLowerCase()) {
                ingeneral++;
                if (ingeneral === 7) {
                    thisformat.operators.push(scfn.commands.general);
                    thisformat.operands.push(ch);
                    ingeneral = 0;
                }
                continue;
            }
            ingeneral = 0;
        }

        // Handle date placeholders
        if (indate) {
            if (indate.charAt(0) === ch) {
                // Another of the same char - accumulate it
                indate += ch;
                continue;
            }
            // Something else, save date info
            thisformat.operators.push(scfn.commands.date);
            thisformat.operands.push(indate);
            sectioninfo.hasdate = true;
            indate = "";
        }

        // Handle AM/PM strings
        if (ampmstr) {
            ampmstr += ch;
            let part = ampmstr.toLowerCase();
            if (part !== "am/pm".substring(0, part.length) &&
                part !== "a/p".substring(0, part.length)) {
                ampmstr = "";
            } else if (part === "am/pm" || part === "a/p") {
                thisformat.operators.push(scfn.commands.date);
                thisformat.operands.push(ampmstr);
                ampmstr = "";
            }
            continue;
        }

        // =============================================================================
        // CHARACTER-SPECIFIC PROCESSING
        // =============================================================================

        if (ch === "#" || ch === "0" || ch === "?") {
            // Number placeholders
            if (integerpart) {
                sectioninfo.integerdigits++;
                if (sectioninfo.commas) {
                    // Comma inside of integer placeholders
                    sectioninfo.thousandssep = true; // any number is thousands separator
                    sectioninfo.commas = 0; // reset count of "thousand" factors
                }
                lastwasinteger = true;
                thisformat.operators.push(scfn.commands.integer_placeholder);
                thisformat.operands.push(ch);
            } else {
                sectioninfo.fractiondigits++;
                thisformat.operators.push(scfn.commands.fraction_placeholder);
                thisformat.operands.push(ch);
            }

        } else if (ch === ".") {
            // Decimal point
            lastwasinteger = false;
            thisformat.operators.push(scfn.commands.decimal);
            thisformat.operands.push(ch);
            integerpart = false;

        } else if (ch === "$") {
            // Currency character
            lastwasinteger = false;
            thisformat.operators.push(scfn.commands.currency);
            thisformat.operands.push(ch);

        } else if (ch === ",") {
            // Comma - either thousands separator or literal
            if (lastwasinteger) {
                sectioninfo.commas++;
            } else {
                thisformat.operators.push(scfn.commands.copy);
                thisformat.operands.push(ch);
            }

        } else if (ch === "%") {
            // Percent symbol
            lastwasinteger = false;
            sectioninfo.percent++;
            thisformat.operators.push(scfn.commands.copy);
            thisformat.operands.push(ch);

        } else if (ch === '"') {
            // Start quoted string
            lastwasinteger = false;
            inquote = true;
            quotestr = "";

        } else if (ch === "[") {
            // Start bracketed expression
            lastwasinteger = false;
            inbracket = true;
            bracketstr = "";

        } else if (ch === "\\") {
            // Escape character
            lastwasslash = true;
            lastwasinteger = false;

        } else if (ch === "*") {
            // Repeat character
            lastwasasterisk = true;
            lastwasinteger = false;

        } else if (ch === "_") {
            // Space character
            lastwasunderscore = true;
            lastwasinteger = false;

        } else if (ch === ";") {
            // Section separator - start next section
            section++;
            thisformat.sectioninfo[section] = {}; // create a new section
            sectioninfo = thisformat.sectioninfo[section]; // get reference to current section
            sectioninfo.sectionstart = thisformat.operators.length + 1; // remember where it starts
            sectioninfo.integerdigits = 0; // number of integer-part placeholders
            sectioninfo.fractiondigits = 0; // fraction placeholders
            sectioninfo.commas = 0; // commas encountered, to handle scaling
            sectioninfo.percent = 0; // times to scale by 100
            sectioninfo.thousandssep = false;
            sectioninfo.hasdate = false;
            integerpart = true; // reset for new section
            lastwasinteger = false;
            thisformat.operators.push(scfn.commands.section);
            thisformat.operands.push(ch);

        } else if (ch.toLowerCase() === "g") {
            // Start of "General"
            ingeneral = 1;
            lastwasinteger = false;

        } else if (ch.toLowerCase() === "a") {
            // Start of AM/PM
            ampmstr = ch;
            lastwasinteger = false;

        } else if ("dmyhHs".indexOf(ch) >= 0) {
            // Date/time placeholder
            indate = ch;

        } else {
            // Literal character
            lastwasinteger = false;
            thisformat.operators.push(scfn.commands.copy);
            thisformat.operands.push(ch);
        }
    }

    // Handle any remaining date placeholder
    if (indate) {
        thisformat.operators.push(scfn.commands.date);
        thisformat.operands.push(indate);
        sectioninfo.hasdate = true;
    }
};

/**
 * @description Parses bracket contents and returns operator and operand information
 * @param {string} bracketstr - Contents of bracket (e.g., "RED", ">10")
 * @returns {Object} Bracket data with operator and operand properties
 * @returns {number} returns.operator - Command operator constant
 * @returns {string} returns.operand - Operand string for the command
 */
SocialCalc.FormatNumber.parse_format_bracket = (bracketstr) => {
    let scfn = SocialCalc.FormatNumber;
    let scc = SocialCalc.Constants;

    let bracketdata = {};
    let parts;

    if (bracketstr.charAt(0) === "$") {
        // Currency formatting
        bracketdata.operator = scfn.commands.currency;
        parts = bracketstr.match(/^\$(.+?)(\-.+?){0,1}$/);
        if (parts) {
            bracketdata.operand = parts[1] || scc?.FormatNumber_defaultCurrency || "$";
        } else {
            bracketdata.operand = bracketstr.substring(1) || scc?.FormatNumber_defaultCurrency || "$";
        }

    } else if (bracketstr === "?$") {
        // Special currency case
        bracketdata.operator = scfn.commands.currency;
        bracketdata.operand = "[?$]";

    } else if (scfn.allowedcolors[bracketstr.toUpperCase()]) {
        // Color formatting
        bracketdata.operator = scfn.commands.color;
        bracketdata.operand = scfn.allowedcolors[bracketstr.toUpperCase()];

    } else if ((parts = bracketstr.match(/^style=([^"]*)$/))) {
        // Style formatting [style=...]
        bracketdata.operator = scfn.commands.style;
        bracketdata.operand = parts[1];

    } else if (bracketstr === ",") {
        // Separator
        bracketdata.operator = scfn.commands.separator;
        bracketdata.operand = bracketstr;

    } else if (scfn.alloweddates[bracketstr.toUpperCase()]) {
        // Date formatting
        bracketdata.operator = scfn.commands.date;
        bracketdata.operand = scfn.alloweddates[bracketstr.toUpperCase()];

    } else if ((parts = bracketstr.match(/^[<>=]/))) {
        // Comparison operator
        parts = bracketstr.match(/^([<>=]+)(.+)$/); // split operator and value
        bracketdata.operator = scfn.commands.comparison;
        bracketdata.operand = `${parts[1]}:${parts[2]}`;

    } else {
        // Unknown bracket - treat as literal
        bracketdata.operator = scfn.commands.copy;
        bracketdata.operand = `[${bracketstr}]`;
    }

    return bracketdata;
};
// =============================================================================
// DATE CONVERSION FUNCTIONS
// =============================================================================

/**
 * @description Converts Gregorian date to Julian date number
 * @param {number} year - Year value
 * @param {number} month - Month value (1-12)
 * @param {number} day - Day value (1-31)
 * @returns {number} Julian date number
 * 
 * From: http://aa.usno.navy.mil/faq/docs/JD_Formula.html
 * Uses: Fliegel, H. F. and van Flandern, T. C. (1968). Communications of the ACM, Vol. 11, No. 10 (October, 1968).
 * Translated from the FORTRAN:
 *   I= YEAR, J= MONTH, K= DAY
 *   JD= K-32075+1461*(I+4800+(J-14)/12)/4+367*(J-2-(J-14)/12*12)/12-3*((I+4900+(J-14)/12)/100)/4
 */
SocialCalc.FormatNumber.convert_date_gregorian_to_julian = (year, month, day) => {
    let juliandate = day - 32075 +
        SocialCalc.intFunc((1461 * (year + 4800 + SocialCalc.intFunc((month - 14) / 12))) / 4);

    juliandate += SocialCalc.intFunc(
        (367 * (month - 2 - SocialCalc.intFunc((month - 14) / 12) * 12)) / 12
    );

    juliandate -= SocialCalc.intFunc(
        (3 * SocialCalc.intFunc((year + 4900 + SocialCalc.intFunc((month - 14) / 12)) / 100)) / 4
    );

    return juliandate;
};

/**
 * @description Converts Julian date number to Gregorian date
 * @param {number} juliandate - Julian date number
 * @returns {Object} Date object with year, month, day properties
 * @returns {number} returns.year - Year value
 * @returns {number} returns.month - Month value (1-12)
 * @returns {number} returns.day - Day value (1-31)
 * 
 * From: http://aa.usno.navy.mil/faq/docs/JD_Formula.html
 * Uses: Fliegel, H. F. and van Flandern, T. C. (1968). Communications of the ACM, Vol. 11, No. 10 (October, 1968).
 * Translated from the FORTRAN
 */
SocialCalc.FormatNumber.convert_date_julian_to_gregorian = (juliandate) => {
    let L = juliandate + 68569;
    let N = Math.floor((4 * L) / 146097);
    L = L - Math.floor((146097 * N + 3) / 4);

    let I = Math.floor((4000 * (L + 1)) / 1461001);
    L = L - Math.floor((1461 * I) / 4) + 31;

    let J = Math.floor((80 * L) / 2447);
    let K = L - Math.floor((2447 * J) / 80);
    L = Math.floor(J / 11);
    J = J + 2 - 12 * L;
    I = 100 * (N - 49) + I + L;

    return { year: I, month: J, day: K };
};

/**
 * @description Integer function that handles negative numbers properly for date calculations
 * @param {number} n - Number to get integer part of
 * @returns {number} Integer part of the number
 */
SocialCalc.intFunc = (n) => {
    return n < 0 ? -Math.floor(-n) : Math.floor(n);
};

// =============================================================================
// SOCIALCALC FORMULA LIBRARY INITIALIZATION
// =============================================================================

/**
 * @fileoverview SocialCalc Spreadsheet Formula Library
 * 
 * Part of the SocialCalc package
 * (c) Copyright 2008 Socialtext, Inc.
 * All Rights Reserved.
 * 
 * The contents of this file are subject to the Artistic License 2.0; you may not
 * use this file except in compliance with the License. You may obtain a copy of 
 * the License at http://socialcalc.org/licenses/al-20/.
 * 
 * Code History:
 * Initially coded by Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
 * Based in part on the SocialCalc 1.1.0 code written in Perl.
 */

// // Ensure SocialCalc namespace exists
// let SocialCalc = globalThis.SocialCalc || {};

/**
 * @namespace SocialCalc.Formula
 * @description Formula parsing and evaluation functionality
 */
SocialCalc.Formula = SocialCalc.Formula || {};

// =============================================================================
// FORMULA PARSING CONSTANTS
// =============================================================================

/**
 * @type {Object<string, number>}
 * @description Parse state constants for formula tokenization
 */
SocialCalc.Formula.ParseState = {
    num: 1,
    alpha: 2,
    coord: 3,
    string: 4,
    stringquote: 5,
    numexp1: 6,
    numexp2: 7,
    alphanumeric: 8,
    specialvalue: 9,
};

/**
 * @type {Object<string, number>}
 * @description Token type constants for parsed formula elements
 */
SocialCalc.Formula.TokenType = {
    num: 1,
    coord: 2,
    op: 3,
    name: 4,
    error: 5,
    string: 6,
    space: 7,
};

/**
 * @type {Object<string, number>}
 * @description Character class constants for lexical analysis
 */
SocialCalc.Formula.CharClass = {
    num: 1,
    numstart: 2,
    op: 3,
    eof: 4,
    alpha: 5,
    incoord: 6,
    error: 7,
    quote: 8,
    space: 9,
    specialstart: 10,
};

/**
 * @type {Object<string, number>}
 * @description Character classification table for parsing
 */
SocialCalc.Formula.CharClassTable = {
    " ": 9, "!": 3, '"': 8, "#": 10, "$": 6, "%": 3, "&": 3, "(": 3, ")": 3, "*": 3,
    "+": 3, ",": 3, "-": 3, ".": 2, "/": 3, "0": 1, "1": 1, "2": 1, "3": 1, "4": 1,
    "5": 1, "6": 1, "7": 1, "8": 1, "9": 1, ":": 3, "<": 3, "=": 3, ">": 3,
    "A": 5, "B": 5, "C": 5, "D": 5, "E": 5, "F": 5, "G": 5, "H": 5, "I": 5, "J": 5,
    "K": 5, "L": 5, "M": 5, "N": 5, "O": 5, "P": 5, "Q": 5, "R": 5, "S": 5, "T": 5,
    "U": 5, "V": 5, "W": 5, "X": 5, "Y": 5, "Z": 5, "^": 3, "_": 5,
    "a": 5, "b": 5, "c": 5, "d": 5, "e": 5, "f": 5, "g": 5, "h": 5, "i": 5, "j": 5,
    "k": 5, "l": 5, "m": 5, "n": 5, "o": 5, "p": 5, "q": 5, "r": 5, "s": 5, "t": 5,
    "u": 5, "v": 5, "w": 5, "x": 5, "y": 5, "z": 5,
};

/**
 * @type {Object<string, string>}
 * @description Lowercase to uppercase character mapping table
 */
SocialCalc.Formula.UpperCaseTable = {
    a: "A", b: "B", c: "C", d: "D", e: "E", f: "F", g: "G", h: "H", i: "I", j: "J",
    k: "K", l: "L", m: "M", n: "N", o: "O", p: "P", q: "Q", r: "R", s: "S", t: "T",
    u: "U", v: "V", w: "W", x: "X", y: "Y", z: "Z",
};

/**
 * @type {Object<string, string>}
 * @description Special constant names that turn into error values
 */
SocialCalc.Formula.SpecialConstants = {
    "#NULL!": "0,e#NULL!",
    "#NUM!": "0,e#NUM!",
    "#DIV/0!": "0,e#DIV/0!",
    "#VALUE!": "0,e#VALUE!",
    "#REF!": "0,e#REF!",
    "#NAME?": "0,e#NAME?",
};

// =============================================================================
// OPERATOR PRECEDENCE AND TOKEN MAPPING
// =============================================================================

/**
 * @type {Object<string, number>}
 * @description Operator precedence table
 * 
 * Precedence levels:
 * 1- !, 2- : ,, 3- M P, 4- %, 5- ^, 6- * /, 7- + -, 8- &, 9- < > = G(>=) L(<=) N(<>)
 * Negative values indicate Right Associative operators
 */
SocialCalc.Formula.TokenPrecedence = {
    "!": 1, ":": 2, ",": 2, "M": -3, "P": -3, "%": 4, "^": 5, "*": 6, "/": 6,
    "+": 7, "-": 7, "&": 8, "<": 9, ">": 9, "G": 9, "L": 9, "N": 9,
};

/**
 * @type {Object<string, string>}
 * @description Convert one-char token text to input text
 */
SocialCalc.Formula.TokenOpExpansion = {
    G: ">=",
    L: "<=",
    M: "-",
    N: "<>",
    P: "+",
};

// =============================================================================
// TYPE LOOKUP TABLES
// =============================================================================

/**
 * @type {Object<string, Object<string, string>>}
 * @description Information about resulting value types when doing operations on values
 * 
 * Each object entry contains specific types with result type info:
 * 'type1a': '|type2a:resulta|type2b:resultb|...'
 * 
 * Type matching:
 * - t* or n* matches any of those types not listed
 * - Results may be a type or numbers 1/2 specifying to return type1 or type2
 */
SocialCalc.Formula.TypeLookupTable = {
    unaryminus: {
        "n*": "|n*:1|",
        "e*": "|e*:1|",
        "t*": "|t*:e#VALUE!|",
        "b": "|b:n|",
    },
    unaryplus: {
        "n*": "|n*:1|",
        "e*": "|e*:1|",
        "t*": "|t*:e#VALUE!|",
        "b": "|b:n|",
    },
    unarypercent: {
        "n*": "|n:n%|n*:n|",
        "e*": "|e*:1|",
        "t*": "|t*:e#VALUE!|",
        "b": "|b:n|",
    },
    plus: {
        "n%": "|n%:n%|nd:n|nt:n|ndt:n|n$:n|n:n|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "nd": "|n%:n|nd:nd|nt:ndt|ndt:ndt|n$:n|n:nd|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "nt": "|n%:n|nd:ndt|nt:nt|ndt:ndt|n$:n|n:nt|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "ndt": "|n%:n|nd:ndt|nt:ndt|ndt:ndt|n$:n|n:ndt|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "n$": "|n%:n|nd:n|nt:n|ndt:n|n$:n$|n:n$|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "nl": "|n%:n|nd:n|nt:n|ndt:n|n$:n|n:n|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "n": "|n%:n|nd:nd|nt:nt|ndt:ndt|n$:n$|n:n|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "b": "|n%:n%|nd:nd|nt:nt|ndt:ndt|n$:n$|n:n|n*:n|b:n|e*:2|t*:e#VALUE!|",
        "t*": "|n*:e#VALUE!|t*:e#VALUE!|b:e#VALUE!|e*:2|",
        "e*": "|e*:1|n*:1|t*:1|b:1|",
    },
    concat: {
        "t": "|t:t|th:th|tw:tw|tl:t|t*:2|e*:2|",
        "th": "|t:th|th:th|tw:t|tl:th|t*:t|e*:2|",
        "tw": "|t:tw|th:t|tw:tw|tl:tw|t*:t|e*:2|",
        "tl": "|t:tl|th:th|tw:tw|tl:tl|t*:t|e*:2|",
        "e*": "|e*:1|n*:1|t*:1|",
    },
    oneargnumeric: {
        "n*": "|n*:n|",
        "e*": "|e*:1|",
        "t*": "|t*:e#VALUE!|",
        "b": "|b:n|",
    },
    twoargnumeric: {
        "n*": "|n*:n|t*:e#VALUE!|e*:2|",
        "e*": "|e*:1|n*:1|t*:1|",
        "t*": "|t*:e#VALUE!|n*:e#VALUE!|e*:2|",
    },
    propagateerror: {
        "n*": "|n*:2|e*:2|",
        "e*": "|e*:2|",
        "t*": "|t*:2|e*:2|",
        "b": "|b:2|e*:2|",
    },
};

// =============================================================================
// FORMULA PARSING AND EVALUATION FUNCTIONS
// =============================================================================

/**
 * @description Parses a text string as if it was a spreadsheet formula using a state machine
 * @param {string} line - The formula text to parse
 * @returns {Array<Object>} Parse info array with token objects
 * @returns {string} returns[].text - The characters making up the parsed token
 * @returns {number} returns[].type - The type of the token (a number from TokenType)
 * @returns {string} returns[].opcode - Single character version of operator for precedence table
 * 
 * This uses a simple state machine run on each character in turn.
 * States remember whether a number is being gathered, etc.
 */
SocialCalc.Formula.ParseFormulaIntoTokens = (line) => {
    let scf = SocialCalc.Formula;
    let scc = SocialCalc.Constants;
    let parsestate = scf.ParseState;
    let tokentype = scf.TokenType;
    let charclass = scf.CharClass;
    let charclasstable = scf.CharClassTable;
    let uppercasetable = scf.UpperCaseTable; // much faster than toUpperCase function
    let pushtoken = scf.ParsePushToken;
    let coordregex = /^\$?[A-Z]{1,2}\$?[1-9]\d*$/i;

    let parseinfo = [];
    let str = "";
    let state = 0;
    let haddecimal = false;

    // =============================================================================
    // MAIN PARSING LOOP
    // =============================================================================

    for (let i = 0; i <= line.length; i++) {
        let ch, cclass;

        if (i < line.length) {
            ch = line.charAt(i);
            cclass = charclasstable[ch];
        } else {
            ch = "";
            cclass = charclass.eof;
        }

        // =============================================================================
        // NUMBER PARSING STATES
        // =============================================================================

        if (state === parsestate.num) {
            if (cclass === charclass.num) {
                str += ch;
            } else if (cclass === charclass.numstart && !haddecimal) {
                haddecimal = true;
                str += ch;
            } else if (ch === "E" || ch === "e") {
                str += ch;
                haddecimal = false;
                state = parsestate.numexp1;
            } else {
                // End of number - save it
                pushtoken(parseinfo, str, tokentype.num, 0);
                haddecimal = false;
                state = 0;
            }
        }

        if (state === parsestate.numexp1) {
            if (cclass === charclass.num) {
                str += ch;
                state = parsestate.numexp2;
            } else if ((ch === "+" || ch === "-") &&
                uppercasetable[str.charAt(str.length - 1)] === "E") {
                str += ch;
            } else if (ch === "E" || ch === "e") {
                // Continue processing
            } else {
                pushtoken(parseinfo, scc.s_parseerrexponent, tokentype.error, 0);
                state = 0;
            }
        }

        if (state === parsestate.numexp2) {
            if (cclass === charclass.num) {
                str += ch;
            } else {
                // End of number - save it
                pushtoken(parseinfo, str, tokentype.num, 0);
                state = 0;
            }
        }

        // =============================================================================
        // ALPHABETIC AND COORDINATE PARSING STATES
        // =============================================================================

        if (state === parsestate.alpha) {
            if (cclass === charclass.num) {
                str += ch;
                state = parsestate.coord;
            } else if (cclass === charclass.alpha || ch === ".") {
                // Alpha may be letters, numbers, "_", or "."
                str += ch;
            } else if (cclass === charclass.incoord) {
                str += ch;
                state = parsestate.coord;
            } else if (cclass === charclass.op || cclass === charclass.numstart ||
                cclass === charclass.space || cclass === charclass.eof) {
                pushtoken(parseinfo, str.toUpperCase(), tokentype.name, 0);
                state = 0;
            } else {
                pushtoken(parseinfo, scc.s_parseerrchar, tokentype.error, 0);
                state = 0;
            }
        }

        if (state === parsestate.coord) {
            if (cclass === charclass.num || cclass === charclass.incoord) {
                str += ch;
            } else if (cclass === charclass.alpha) {
                str += ch;
                state = parsestate.alphanumeric;
            } else if (cclass === charclass.op || cclass === charclass.numstart ||
                cclass === charclass.eof || cclass === charclass.space) {
                let t = coordregex.test(str) ? tokentype.coord : tokentype.name;
                pushtoken(parseinfo, str.toUpperCase(), t, 0);
                state = 0;
            } else {
                pushtoken(parseinfo, scc.s_parseerrchar, tokentype.error, 0);
                state = 0;
            }
        }

        if (state === parsestate.alphanumeric) {
            if (cclass === charclass.num || cclass === charclass.alpha) {
                str += ch;
            } else if (cclass === charclass.op || cclass === charclass.numstart ||
                cclass === charclass.space || cclass === charclass.eof) {
                pushtoken(parseinfo, str.toUpperCase(), tokentype.name, 0);
                state = 0;
            } else {
                pushtoken(parseinfo, scc.s_parseerrchar, tokentype.error, 0);
                state = 0;
            }
        }

        // =============================================================================
        // STRING AND SPECIAL VALUE PARSING STATES
        // =============================================================================

        if (state === parsestate.string) {
            if (cclass === charclass.quote) {
                state = parsestate.stringquote; // Got quote: doubled or end of string?
            } else if (cclass === charclass.eof) {
                pushtoken(parseinfo, scc.s_parseerrstring, tokentype.error, 0);
                state = 0;
            } else {
                str += ch;
            }
        } else if (state === parsestate.stringquote) {
            if (cclass === charclass.quote) {
                str += '"';
                state = parsestate.string; // Double quote: add one then continue
            } else {
                // Something else -- end of string
                pushtoken(parseinfo, str, tokentype.string, 0);
                state = 0; // Drop through to process
            }
        } else if (state === parsestate.specialvalue) {
            // Special values like #REF!
            if (str.charAt(str.length - 1) === "!") {
                // Done - save value as a name
                pushtoken(parseinfo, str, tokentype.name, 0);
                state = 0; // Drop through to process
            } else if (cclass === charclass.eof) {
                pushtoken(parseinfo, scc.s_parseerrspecialvalue, tokentype.error, 0);
                state = 0;
            } else {
                str += ch;
            }
        }

        // =============================================================================
        // INITIAL STATE PROCESSING
        // =============================================================================

        if (state === 0) {
            if (cclass === charclass.num) {
                str = ch;
                state = parsestate.num;
            } else if (cclass === charclass.numstart) {
                str = ch;
                haddecimal = true;
                state = parsestate.num;
            } else if (cclass === charclass.alpha || cclass === charclass.incoord) {
                str = ch;
                state = parsestate.alpha;
            } else if (cclass === charclass.specialstart) {
                str = ch;
                state = parsestate.specialvalue;
            } else if (cclass === charclass.op) {
                str = ch;
                let last_token_type, last_token_text;

                // Get information about the last token
                if (parseinfo.length > 0) {
                    let last_token = parseinfo[parseinfo.length - 1];
                    last_token_type = last_token.type;
                    last_token_text = last_token.text;

                    // Handle compound operators like <= >= <>
                    if (last_token_type === tokentype.op) {
                        if (last_token_text === "<" || last_token_text === ">") {
                            str = last_token_text + str;
                            parseinfo.pop();

                            if (parseinfo.length > 0) {
                                let prev_token = parseinfo[parseinfo.length - 1];
                                last_token_type = prev_token.type;
                                last_token_text = prev_token.text;
                            } else {
                                last_token_type = charclass.eof;
                                last_token_text = "EOF";
                            }
                        }
                    }
                } else {
                    last_token_type = charclass.eof;
                    last_token_text = "EOF";
                }

                let t = tokentype.op;

                // Check for unary operators
                if (parseinfo.length === 0 ||
                    (last_token_type === tokentype.op &&
                        last_token_text !== ")" &&
                        last_token_text !== "%")) {

                    // Unary operator handling
                    if (str === "-") {
                        str = "M"; // M is unary minus
                        ch = "M";
                    } else if (str === "+") {
                        str = "P"; // P is unary plus
                        ch = "P";
                    } else if (str === ")" && last_token_text === "(") {
                        // Null arg list OK
                    } else if (str !== "(") {
                        // Binary-op open-paren OK, others no
                        t = tokentype.error;
                        str = scc.s_parseerrtwoops;
                    }
                } else if (str.length > 1) {
                    // Handle compound operators
                    if (str === ">=") {
                        str = "G"; // G is >=
                        ch = "G";
                    } else if (str === "<=") {
                        str = "L"; // L is <=
                        ch = "L";
                    } else if (str === "<>") {
                        str = "N"; // N is <>
                        ch = "N";
                    } else {
                        t = tokentype.error;
                        str = scc.s_parseerrtwoops;
                    }
                }

                pushtoken(parseinfo, str, t, ch);
                state = 0;
            } else if (cclass === charclass.quote) {
                // Starting a string
                str = "";
                state = parsestate.string;
            } else if (cclass === charclass.space) {
                // Store so can reconstruct spacing
                pushtoken(parseinfo, " ", tokentype.space, 0);
            } else if (cclass === charclass.eof) {
                // Ignore -- needed to have extra loop to close out other things
            } else {
                // Unknown class - such as unknown char
                pushtoken(parseinfo, scc.s_parseerrchar, tokentype.error, 0);
            }
        }
    }

    return parseinfo;
};

/**
 * @description Helper function to push tokens onto the parse info array
 * @param {Array<Object>} parseinfo - Array to push token onto
 * @param {string} ttext - Token text
 * @param {number} ttype - Token type
 * @param {string|number} topcode - Token opcode
 */
SocialCalc.Formula.ParsePushToken = (parseinfo, ttext, ttype, topcode) => {
    parseinfo.push({ text: ttext, type: ttype, opcode: topcode });
};

/**
 * @description Evaluates a parsed formula, returning a value, its type, and error info
 * @param {Array<Object>} parseinfo - Parsed formula tokens from ParseFormulaIntoTokens
 * @param {Object} sheet - Sheet object containing cell data and context
 * @param {boolean} [allowrangereturn] - If true, can return a range (e.g., "A1:A10")
 * @returns {Object} Result object with value, type, and error properties
 * @returns {*} returns.value - The calculated value
 * @returns {string} returns.type - The value type
 * @returns {string} returns.error - Error text if any
 */
SocialCalc.Formula.evaluate_parsed_formula = (parseinfo, sheet, allowrangereturn) => {
    let scf = SocialCalc.Formula;

    // Convert infix to reverse polish notation
    let revpolish = scf.ConvertInfixToPolish(parseinfo); // Result is either array or error string

    // Evaluate the polish notation
    let result = scf.EvaluatePolish(parseinfo, revpolish, sheet, allowrangereturn);

    return result;
};

/**
 * @description Converts infix notation to reverse polish notation
 * @param {Array<Object>} parseinfo - Parsed formula tokens
 * @returns {Array<number>|string} Array of token references if successful, error string if failed
 * 
 * Based upon the algorithm shown in Wikipedia "Reverse Polish notation" article
 * and then enhanced for additional spreadsheet functionality
 */
SocialCalc.Formula.ConvertInfixToPolish = (parseinfo) => {
    let scf = SocialCalc.Formula;
    let scc = SocialCalc.Constants;
    let tokentype = scf.TokenType;
    let token_precedence = scf.TokenPrecedence;

    let revpolish = [];
    let parsestack = [];
    let errortext = "";
    let function_start = -1;

    // =============================================================================
    // MAIN CONVERSION LOOP
    // =============================================================================

    for (let i = 0; i < parseinfo.length; i++) {
        let pii = parseinfo[i];
        let ttype = pii.type;
        let ttext = pii.text;

        if (ttype === tokentype.num || ttype === tokentype.coord || ttype === tokentype.string) {
            // Numbers, coordinates, and strings go directly to output
            revpolish.push(i);

        } else if (ttype === tokentype.name) {
            // Function names go on stack and mark function start
            parsestack.push(i);
            revpolish.push(function_start);

        } else if (ttype === tokentype.space) {
            // Ignore spaces
            continue;

        } else if (ttext === ",") {
            // Function argument separator
            while (parsestack.length &&
                parseinfo[parsestack[parsestack.length - 1]].text !== "(") {
                revpolish.push(parsestack.pop());
            }
            if (parsestack.length === 0) {
                errortext = scc.s_parseerrmissingopenparen;
                break;
            }

        } else if (ttext === "(") {
            // Opening parenthesis
            parsestack.push(i);

        } else if (ttext === ")") {
            // Closing parenthesis
            while (parsestack.length &&
                parseinfo[parsestack[parsestack.length - 1]].text !== "(") {
                revpolish.push(parsestack.pop());
            }
            if (parsestack.length === 0) {
                errortext = scc.s_parseerrcloseparennoopen;
                break;
            }
            parsestack.pop(); // Remove the "("

            // If there's a function name on stack, add it to output
            if (parsestack.length &&
                parseinfo[parsestack[parsestack.length - 1]].type === tokentype.name) {
                revpolish.push(parsestack.pop());
            }

        } else if (ttype === tokentype.op) {
            // Handle operators with precedence

            // If there's a function name on stack, pop it first
            if (parsestack.length &&
                parseinfo[parsestack[parsestack.length - 1]].type === tokentype.name) {
                revpolish.push(parsestack.pop());
            }

            // Pop operators with higher or equal precedence
            while (parsestack.length &&
                parseinfo[parsestack[parsestack.length - 1]].type === tokentype.op &&
                parseinfo[parsestack[parsestack.length - 1]].text !== "(") {

                let tprecedence = token_precedence[pii.opcode];
                let tstackprecedence = token_precedence[parseinfo[parsestack[parsestack.length - 1]].opcode];

                if (tprecedence >= 0 && tprecedence < tstackprecedence) {
                    break;
                } else if (tprecedence < 0) {
                    // Right associative
                    let abs_tprecedence = -tprecedence;
                    if (tstackprecedence < 0) tstackprecedence = -tstackprecedence;
                    if (abs_tprecedence <= tstackprecedence) {
                        break;
                    }
                }
                revpolish.push(parsestack.pop());
            }
            parsestack.push(i);

        } else if (ttype === tokentype.error) {
            // Error token
            errortext = ttext;
            break;

        } else {
            // Unknown token type
            errortext = "Internal error while processing parsed formula.";
            break;
        }
    }

    // Pop remaining operators from stack
    while (parsestack.length > 0) {
        if (parseinfo[parsestack[parsestack.length - 1]].text === "(") {
            errortext = scc.s_parseerrmissingcloseparen;
            break;
        }
        revpolish.push(parsestack.pop());
    }

    return errortext ? errortext : revpolish;
};
/**
 * @description Executes reverse polish representation of formula
 * @param {Array<Object>} parseinfo - Parsed formula tokens
 * @param {Array<number>|string} revpolish - Reverse polish token sequence or error string
 * @param {Object} sheet - Sheet object containing cell data and context
 * @param {boolean} [allowrangereturn] - If true, allows returning range values
 * @returns {Object} Result object with value, type, and error properties
 * @returns {*} returns.value - The calculated result value
 * @returns {string} returns.type - The value type (n, t, e#ERROR!, etc.)
 * @returns {string} returns.error - Error text if any occurred
 * 
 * Operand values are objects with "type" and optional "value" properties.
 * Types can be: "tw", "th", "t", "n", "nt", "coord", "range", "start", "eErrorType", "b" (blank)
 * - coord values: "A57" or "A57!sheetname"
 * - range values: "coord|coord|number" where number is offset for iteration
 */
SocialCalc.Formula.EvaluatePolish = (parseinfo, revpolish, sheet, allowrangereturn) => {
    let scf = SocialCalc.Formula;
    let scc = SocialCalc.Constants;
    let tokentype = scf.TokenType;
    let lookup_result_type = scf.LookupResultType;
    let typelookup = scf.TypeLookupTable;
    let operand_as_number = scf.OperandAsNumber;
    let operand_as_text = scf.OperandAsText;
    let operand_value_and_type = scf.OperandValueAndType;
    let operands_as_coord_on_sheet = scf.OperandsAsCoordOnSheet;
    let format_number_for_display = SocialCalc.format_number_for_display ||
        ((v, t, f) => `${v}`);

    let errortext = "";
    let function_start = -1;
    let missingOperandError = {
        value: "",
        type: "e#VALUE!",
        error: scc.s_parseerrmissingoperand,
    };

    let operand = [];

    /**
     * @description Helper function to push operands onto the stack
     * @param {string} t - Operand type
     * @param {*} v - Operand value
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    // Validate input
    if (!parseinfo.length || !(revpolish instanceof Array)) {
        return {
            value: "",
            type: "e#VALUE!",
            error: typeof revpolish === "string" ? revpolish : "",
        };
    }

    // =============================================================================
    // MAIN EVALUATION LOOP
    // =============================================================================

    for (let i = 0; i < revpolish.length; i++) {
        let rii = revpolish[i];

        if (rii === function_start) {
            // Remember the start of a function argument list
            PushOperand("start", 0);
            continue;
        }

        let prii = parseinfo[rii];
        let ttype = prii.type;
        let ttext = prii.text;

        // =============================================================================
        // LITERAL VALUE PROCESSING
        // =============================================================================

        if (ttype === tokentype.num) {
            PushOperand("n", Number(ttext));

        } else if (ttype === tokentype.coord) {
            PushOperand("coord", ttext);

        } else if (ttype === tokentype.string) {
            PushOperand("t", ttext);

        } else if (ttype === tokentype.op) {
            // =============================================================================
            // OPERATOR PROCESSING
            // =============================================================================

            if (operand.length <= 0) {
                return missingOperandError;
            }

            if (ttext === "M") {
                // Unary minus
                let value1 = operand_as_number(sheet, operand);
                let resulttype = lookup_result_type(value1.type, value1.type, typelookup.unaryminus);
                PushOperand(resulttype, -value1.value);

            } else if (ttext === "P") {
                // Unary plus
                let value1 = operand_as_number(sheet, operand);
                let resulttype = lookup_result_type(value1.type, value1.type, typelookup.unaryplus);
                PushOperand(resulttype, value1.value);

            } else if (ttext === "%") {
                // Unary percent - left associative
                let value1 = operand_as_number(sheet, operand);
                let resulttype = lookup_result_type(value1.type, value1.type, typelookup.unarypercent);
                PushOperand(resulttype, 0.01 * value1.value);

            } else if (ttext === "&") {
                // String concatenation
                if (operand.length <= 1) {
                    return missingOperandError;
                }
                let value2 = operand_as_text(sheet, operand);
                let value1 = operand_as_text(sheet, operand);
                let resulttype = lookup_result_type(value1.type, value2.type, typelookup.concat);
                PushOperand(resulttype, value1.value + value2.value);

            } else if (ttext === ":") {
                // Range constructor
                if (operand.length <= 1) {
                    return missingOperandError;
                }
                let value1 = scf.OperandsAsRangeOnSheet(sheet, operand);
                if (value1.error) {
                    errortext = errortext || value1.error;
                }
                PushOperand(value1.type, value1.value);

            } else if (ttext === "!") {
                // Sheet reference operator (sheetname!coord)
                if (operand.length <= 1) {
                    return missingOperandError;
                }
                let value1 = operands_as_coord_on_sheet(sheet, operand);
                if (value1.error) {
                    errortext = errortext || value1.error;
                }
                PushOperand(value1.type, value1.value);

            } else if (["<", "L", "=", "G", ">", "N"].includes(ttext)) {
                // Comparison operators: < <= = >= > <>
                if (operand.length <= 1) {
                    errortext = scc.s_parseerrmissingoperand;
                    break;
                }

                let value2 = operand_value_and_type(sheet, operand);
                let value1 = operand_value_and_type(sheet, operand);

                if (value1.type.charAt(0) === "n" && value2.type.charAt(0) === "n") {
                    // Compare two numbers
                    let cond = 0;
                    switch (ttext) {
                        case "<": cond = value1.value < value2.value ? 1 : 0; break;
                        case "L": cond = value1.value <= value2.value ? 1 : 0; break;
                        case "=": cond = value1.value === value2.value ? 1 : 0; break;
                        case "G": cond = value1.value >= value2.value ? 1 : 0; break;
                        case ">": cond = value1.value > value2.value ? 1 : 0; break;
                        case "N": cond = value1.value !== value2.value ? 1 : 0; break;
                    }
                    PushOperand("nl", cond);

                } else if (value1.type.charAt(0) === "e") {
                    // Error on left
                    PushOperand(value1.type, 0);

                } else if (value2.type.charAt(0) === "e") {
                    // Error on right
                    PushOperand(value2.type, 0);

                } else {
                    // Text comparison (possibly mixed with numbers or blank)
                    let tostype = value1.type.charAt(0);
                    let tostype2 = value2.type.charAt(0);

                    // Convert values to strings for comparison
                    if (tostype === "n") {
                        value1.value = format_number_for_display(value1.value, "n", "");
                    } else if (tostype === "b") {
                        value1.value = "";
                    }

                    if (tostype2 === "n") {
                        value2.value = format_number_for_display(value2.value, "n", "");
                    } else if (tostype2 === "b") {
                        value2.value = "";
                    }

                    // Case-insensitive comparison
                    let val1Lower = value1.value.toLowerCase();
                    let val2Lower = value2.value.toLowerCase();

                    let cond = 0;
                    switch (ttext) {
                        case "<": cond = val1Lower < val2Lower ? 1 : 0; break;
                        case "L": cond = val1Lower <= val2Lower ? 1 : 0; break;
                        case "=": cond = val1Lower === val2Lower ? 1 : 0; break;
                        case "G": cond = val1Lower >= val2Lower ? 1 : 0; break;
                        case ">": cond = val1Lower > val2Lower ? 1 : 0; break;
                        case "N": cond = val1Lower !== val2Lower ? 1 : 0; break;
                    }
                    PushOperand("nl", cond);
                }

            } else {
                // Arithmetic operators: +, -, *, /, ^
                if (operand.length <= 1) {
                    errortext = scc.s_parseerrmissingoperand;
                    break;
                }

                let value2 = operand_as_number(sheet, operand);
                let value1 = operand_as_number(sheet, operand);

                if (ttext === "+") {
                    let resulttype = lookup_result_type(value1.type, value2.type, typelookup.plus);
                    PushOperand(resulttype, value1.value + value2.value);

                } else if (ttext === "-") {
                    let resulttype = lookup_result_type(value1.type, value2.type, typelookup.plus);
                    PushOperand(resulttype, value1.value - value2.value);

                } else if (ttext === "*") {
                    let resulttype = lookup_result_type(value1.type, value2.type, typelookup.plus);
                    PushOperand(resulttype, value1.value * value2.value);

                } else if (ttext === "/") {
                    if (value2.value !== 0) {
                        PushOperand("n", value1.value / value2.value);
                    } else {
                        PushOperand("e#DIV/0!", 0);
                    }

                } else if (ttext === "^") {
                    let result = Math.pow(value1.value, value2.value);
                    if (isNaN(result)) {
                        PushOperand("e#NUM!", 0);
                    } else {
                        PushOperand("n", result);
                    }
                }
            }

        } else if (ttype === tokentype.name) {
            // Function or name processing
            errortext = scf.CalculateFunction(ttext, operand, sheet);
            if (errortext) break;

        } else {
            // Unknown token type
            errortext = `${scc.s_InternalError}Unknown token ${ttype} (${ttext}).`;
            break;
        }
    }

    // =============================================================================
    // FINAL VALUE PROCESSING
    // =============================================================================

    let value = operand[0]?.value || "";
    let tostype = operand[0]?.type || "";

    // Handle name references
    if (tostype === "name") {
        let value1 = SocialCalc.Formula.LookupName(sheet, value);
        value = value1.value;
        tostype = value1.type;
        errortext = errortext || value1.error;
    }

    // Handle coordinate references
    if (tostype === "coord") {
        let value1 = operand_value_and_type(sheet, operand);
        value = value1.value;
        tostype = value1.type;
        if (tostype === "b") {
            tostype = "n";
            value = 0;
        }
    }

    // Check for extra operands (error condition)
    if (operand.length > 1 && !errortext) {
        errortext += scc.s_parseerrerrorinformula;
    }

    // Set return type
    let valuetype = tostype;

    // Handle error values
    if (tostype.charAt(0) === "e") {
        errortext = errortext || tostype.substring(1) || scc.s_calcerrerrorvalueinformula;

    } else if (tostype === "range") {
        // Handle range values
        let vmatch = value.match(/^(.*)\|(.*)\|/);
        let smatch = vmatch[1].indexOf("!");

        if (smatch >= 0) {
            // Swap sheet name format
            vmatch[1] = `${vmatch[1].substring(smatch + 1)}!${vmatch[1].substring(0, smatch).toUpperCase()}`;
        } else {
            vmatch[1] = vmatch[1].toUpperCase();
        }

        value = `${vmatch[1]}:${vmatch[2].toUpperCase()}`;
        if (!allowrangereturn) {
            errortext = `${scc.s_formularangeresult} ${value}`;
        }
    }

    // Set error state if needed
    if (errortext && valuetype.charAt(0) !== "e") {
        value = errortext;
        valuetype = "e";
    }

    // Check for numeric overflow/underflow
    if (valuetype.charAt(0) === "n" && (isNaN(value) || !isFinite(value))) {
        value = 0;
        valuetype = "e#NUM!";
        errortext = isNaN(value) ? scc.s_calcerrnumericnan : scc.s_calcerrnumericoverflow;
    }

    return { value, type: valuetype, error: errortext };
};
// =============================================================================
// OPERAND AND TYPE LOOKUP FUNCTIONS
// =============================================================================

/**
 * @description Looks up result type from operation type table
 * @param {string} type1 - First operand type
 * @param {string} type2 - Second operand type  
 * @param {Object<string, string>} typelookup - Type lookup table
 * @returns {string} Result type or error message
 * 
 * typelookup has values of the form:
 * typelookup{"typespec1"} = "|typespec2A:resultA|typespec2B:resultB|..."
 * 
 * First type1 is looked up. If no match, then the first letter (major type) of type1 plus "*" is looked up.
 * resulttype is type1 if result is "1", type2 if result is "2", otherwise the value of result.
 */
SocialCalc.Formula.LookupResultType = (type1, type2, typelookup) => {
    let table1 = typelookup[type1];

    if (!table1) {
        table1 = typelookup[`${type1.charAt(0)}*`];
        if (!table1) {
            return `e#VALUE! (internal error, missing LookupResultType ${type1.charAt(0)}*)`;
        }
    }

    // Look for exact type match
    let pos1 = table1.indexOf(`|${type2}:`);
    if (pos1 >= 0) {
        let pos2 = table1.indexOf("|", pos1 + 1);
        if (pos2 < 0) {
            return `e#VALUE! (internal error, incorrect LookupResultType ${table1})`;
        }
        let result = table1.substring(pos1 + type2.length + 2, pos2);
        if (result === "1") return type1;
        if (result === "2") return type2;
        return result;
    }

    // Look for wildcard type match
    let wildcardPos = table1.indexOf(`|${type2.charAt(0)}*:`);
    if (wildcardPos >= 0) {
        let pos2 = table1.indexOf("|", wildcardPos + 1);
        if (pos2 < 0) {
            return `e#VALUE! (internal error, incorrect LookupResultType ${table1})`;
        }
        let result = table1.substring(wildcardPos + 4, pos2);
        if (result === "1") return type1;
        if (result === "2") return type2;
        return result;
    }

    return "e#VALUE!";
};

/**
 * @description Returns top of stack value and type, then pops the stack
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with value, type, and optional error properties
 * @returns {*} returns.value - The operand value
 * @returns {string} returns.type - The operand type
 * @returns {string} [returns.error] - Error message if error occurred
 */
SocialCalc.Formula.TopOfStackValueAndType = (sheet, operand) => {
    let scf = SocialCalc.Formula;
    let result = { type: "", value: "" };
    let stacklen = operand.length;

    if (!stacklen) {
        result.error = `${SocialCalc.Constants.s_InternalError}no operand on stack`;
        return result;
    }

    // Get top of stack
    result.value = operand[stacklen - 1].value;
    result.type = operand[stacklen - 1].type;
    operand.pop(); // Pop the stack

    // Handle name references
    if (result.type === "name") {
        return scf.LookupName(sheet, result.value);
    }

    return result;
};

/**
 * @description Gets top of stack as a number, popping the stack
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Operand info with numeric value and type
 * 
 * Uses OperandValueAndType to get top of stack and pops it.
 * Returns numeric value and type. Text values are treated as 0 if they can't be converted.
 */
SocialCalc.Formula.OperandAsNumber = (sheet, operand) => {
    let operandinfo = SocialCalc.Formula.OperandValueAndType(sheet, operand);
    let t = operandinfo.type.charAt(0);

    if (t === "n") {
        operandinfo.value = Number(operandinfo.value);
    } else if (t === "b") {
        // Blank cell
        operandinfo.type = "n";
        operandinfo.value = 0;
    } else if (t === "e") {
        // Error - keep error type, set value to 0
        operandinfo.value = 0;
    } else {
        // Try to determine if text can be converted to number
        let valueinfo = SocialCalc.DetermineValueType
            ? SocialCalc.DetermineValueType(operandinfo.value)
            : { value: Number(operandinfo.value), type: "n" }; // fallback if without rest of SocialCalc

        if (valueinfo.type.charAt(0) === "n") {
            operandinfo.value = Number(valueinfo.value);
            operandinfo.type = valueinfo.type;
        } else {
            operandinfo.value = 0;
            operandinfo.type = valueinfo.type;
        }
    }

    return operandinfo;
};

/**
 * @description Gets top of stack as text, popping the stack
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Operand info with text value, preserving sub-type
 * 
 * Uses OperandValueAndType to get top of stack and pops it.
 * Returns text value, preserving sub-type.
 */
SocialCalc.Formula.OperandAsText = (sheet, operand) => {
    let operandinfo = SocialCalc.Formula.OperandValueAndType(sheet, operand);
    let t = operandinfo.type.charAt(0);

    if (t === "t") {
        // Any flavor of text returns as is
        return operandinfo;
    } else if (t === "n") {
        // Convert number to text
        operandinfo.value = SocialCalc.format_number_for_display
            ? SocialCalc.format_number_for_display(operandinfo.value, operandinfo.type, "")
            : `${operandinfo.value}`;
        operandinfo.type = "t";
    } else if (t === "b") {
        // Blank cell
        operandinfo.value = "";
        operandinfo.type = "t";
    } else if (t === "e") {
        // Error - return empty string but keep error type
        operandinfo.value = "";
    } else {
        // Convert other types to text
        operandinfo.value = `${operandinfo.value}`;
        operandinfo.type = "t";
    }

    return operandinfo;
};

/**
 * @description Pops top of stack and returns it, following coord reference if necessary
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with value, type, and optional error
 * @returns {*} returns.value - The resolved value
 * @returns {string} returns.type - Value type (t, n, th, etc.)
 * @returns {string} [returns.error] - Error message if bad error occurred
 * 
 * Ranges are returned as if they were pushed onto the stack first coord first.
 * Also sets type with "t", "n", "th", etc., as appropriate.
 */
SocialCalc.Formula.OperandValueAndType = (sheet, operand) => {
    let scf = SocialCalc.Formula;
    let result = { type: "", value: "" };
    let stacklen = operand.length;

    if (!stacklen) {
        result.error = `${SocialCalc.Constants.s_InternalError}no operand on stack`;
        return result;
    }

    // Get top of stack
    result.value = operand[stacklen - 1].value;
    result.type = operand[stacklen - 1].type;
    operand.pop();

    // Handle name references
    if (result.type === "name") {
        return scf.LookupName(sheet, result.value);
    }

    // Handle range references
    if (result.type === "range") {
        return scf.StepThroughRangeDown(operand, result.value);
    }

    // Handle coordinate references
    if (result.type === "coord") {
        let coordsheet = sheet;
        let pos = result.value.indexOf("!");

        if (pos !== -1) {
            // Sheet reference
            coordsheet = scf.FindInSheetCache(result.value.substring(pos + 1));
            if (coordsheet === null) {
                // Sheet unavailable
                result.type = "e#REF!";
                result.error = `${SocialCalc.Constants.s_sheetunavailable} ${result.value.substring(pos + 1)}`;
                result.value = 0;
                return result;
            }
            result.value = result.value.substring(0, pos); // Get coord part
        }

        let cellvtype;
        if (coordsheet) {
            let cell = coordsheet.cells[SocialCalc.Formula.PlainCoord(result.value)];
            if (cell) {
                cellvtype = cell.valuetype;
                result.value = cell.datavalue;
            } else {
                cellvtype = "b";
            }
        } else {
            cellvtype = "e#N/A";
            result.value = 0;
        }

        result.type = cellvtype || "b";
        if (result.type === "b") {
            result.value = 0;
        }
    }

    return result;
};

/**
 * @description Gets top of stack as coordinate reference, popping the stack
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with coord value or error
 * 
 * Returns coord value. All other types are treated as an error.
 */
SocialCalc.Formula.OperandAsCoord = (sheet, operand) => {
    let result = { type: "", value: "" };
    let stacklen = operand.length;

    result.value = operand[stacklen - 1].value;
    result.type = operand[stacklen - 1].type;
    operand.pop();

    if (result.type === "name") {
        return SocialCalc.Formula.LookupName(sheet, result.value);
    }

    if (result.type === "coord") {
        return result;
    } else {
        result.value = SocialCalc.Constants.s_calcerrcellrefmissing;
        result.type = "e#REF!";
        return result;
    }
};

/**
 * @description Gets 2 items from top of stack, treating them as sheetname!coord-or-name
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with coord value in stack format or error
 * 
 * Returns stack-style coord value (coord!sheetname, or coord!sheetname|coord|) with
 * a type of coord or range. All others are treated as an error.
 * If sheetname not available, sets result.error.
 */
SocialCalc.Formula.OperandsAsCoordOnSheet = (sheet, operand) => {
    let scf = SocialCalc.Formula;
    let stacklen = operand.length;

    // Get coord or name from top of stack
    let value1 = {
        value: operand[stacklen - 1].value,
        type: operand[stacklen - 1].type
    };
    operand.pop();

    // Get sheetname as text
    let sheetname = scf.OperandAsSheetName(sheet, operand);
    let othersheet = scf.FindInSheetCache(sheetname.value);

    if (othersheet === null) {
        // Sheet unavailable
        return {
            type: "e#REF!",
            value: 0,
            error: `${SocialCalc.Constants.s_sheetunavailable} ${sheetname.value}`
        };
    }

    let result = { type: value1.type, value: value1.value };

    if (value1.type === "name") {
        result = scf.LookupName(othersheet, value1.value);
    }

    if (result.type === "coord") {
        // Return in stack format
        result.value = `${result.value}!${sheetname.value}`;
    } else if (result.type === "range") {
        // Handle range reference
        let pos1 = result.value.indexOf("|");
        let pos2 = result.value.indexOf("|", pos1 + 1);
        result.value = `${result.value.substring(0, pos1)}!${sheetname.value}|${result.value.substring(pos1 + 1, pos2)}|`;
    } else if (result.type.charAt(0) === "e") {
        // Keep error value as is
    } else {
        result.error = SocialCalc.Constants.s_calcerrcellrefmissing;
        result.type = "e#REF!";
        result.value = 0;
    }

    return result;
};

/**
 * @description Gets 2 items from top of stack, treating them as coord2-or-name:coord1
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with range value in stack format or error
 * 
 * Name is evaluated on sheet of coord1.
 * Returns result with "value" of stack-style range value (coord!sheetname|coord|) and
 * "type" of "range". All others are treated as an error.
 */
SocialCalc.Formula.OperandsAsRangeOnSheet = (sheet, operand) => {
    let scf = SocialCalc.Formula;
    let scc = SocialCalc.Constants;
    let stacklen = operand.length;

    // Get "right" side coord or name from top of stack
    let value2 = {
        value: operand[stacklen - 1].value,
        type: operand[stacklen - 1].type
    };
    operand.pop();

    // Get "left" coord
    let value1 = scf.OperandAsCoord(sheet, operand);
    if (value1.type !== "coord") {
        return { value: 0, type: "e#REF!" };
    }

    // Determine which sheet to use
    let othersheet = sheet;
    let pos1 = value1.value.indexOf("!");
    if (pos1 !== -1) {
        // Sheet reference
        let pos2 = value1.value.indexOf("|", pos1 + 1);
        if (pos2 < 0) pos2 = value1.value.length;
        othersheet = scf.FindInSheetCache(value1.value.substring(pos1 + 1, pos2));
        if (othersheet === null) {
            return {
                value: 0,
                type: "e#REF!",
                errortext: `${scc.s_sheetunavailable} ${value1.value.substring(pos1 + 1, pos2)}`
            };
        }
    }

    // Handle name reference for second coordinate
    let resolvedValue2 = value2;
    if (value2.type === "name") {
        resolvedValue2 = scf.LookupName(othersheet, value2.value);
    }

    if (resolvedValue2.type === "coord") {
        // Return combined range in stack format
        return {
            value: `${value1.value}|${resolvedValue2.value}|`,
            type: "range"
        };
    } else {
        return {
            value: scc.s_calcerrcellrefmissing,
            type: "e#REF!"
        };
    }
};

/**
 * @description Gets top of stack as sheet name, popping the stack
 * @param {Object} sheet - Sheet object containing cell data
 * @param {Array<Object>} operand - Operand stack
 * @returns {Object} Result with sheetname value or error
 * 
 * Returns sheetname value. All others are treated as an error.
 * Accepts text, cell reference, and named value which is one of those two.
 */
SocialCalc.Formula.OperandAsSheetName = (sheet, operand) => {
    let result = { type: "", value: "" };
    let stacklen = operand.length;

    // Get top of stack
    result.value = operand[stacklen - 1].value;
    result.type = operand[stacklen - 1].type;
    operand.pop();

    // Handle name references
    if (result.type === "name") {
        let nvalue = SocialCalc.Formula.LookupName(sheet, result.value);
        if (!nvalue.value) {
            // Not a known name - return bare name as the name value
            return result;
        }
        result.value = nvalue.value;
        result.type = nvalue.type;
    }

    // Handle coordinate references
    if (result.type === "coord") {
        let cell = sheet.cells[SocialCalc.Formula.PlainCoord(result.value)];
        if (cell) {
            result.value = cell.datavalue;
            result.type = cell.valuetype;
        } else {
            result.value = "";
            result.type = "b";
        }
    }

    // Check if we have a valid sheet name (text)
    if (result.type.charAt(0) === "t") {
        return result;
    } else {
        result.value = "";
        result.error = SocialCalc.Constants.s_calcerrsheetnamemissing;
        return result;
    }
};

/**
 * @description Returns value and type of a named value
 * @param {Object} sheet - Sheet object containing names and cell data
 * @param {string} name - Name to look up (case insensitive)
 * @returns {Object} Result with value, type, and optional error
 * 
 * Names are case insensitive
 * Names may have a definition which is a coord (A1), a range (A1:B7), or a formula (=OFFSET(A1,0,0,5,1))
 * Note: The range must not have sheet names ("!") in them.
 */
SocialCalc.Formula.LookupName = (sheet, name) => {
    let names = sheet.names;
    let value = {};
    let startedwalk = false;
    let upperName = name.toUpperCase();

    if (names[upperName]) {
        // Name is defined
        value.value = names[upperName].definition;

        if (value.value.charAt(0) === "=") {
            // Formula definition
            if (!sheet.checknamecirc) {
                // Start walking the name tree
                sheet.checknamecirc = {};
                startedwalk = true;
            } else {
                if (sheet.checknamecirc[name]) {
                    // Circular reference detected
                    value.type = "e#NAME?";
                    value.error = `${SocialCalc.Constants.s_circularnameref} "${name}".`;
                    return value;
                }
            }
            sheet.checknamecirc[name] = true;

            // Parse and evaluate the formula
            let parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(value.value.substring(1));
            let evaluatedValue = SocialCalc.Formula.evaluate_parsed_formula(parseinfo, sheet, true);

            // Clean up circular reference tracking
            delete sheet.checknamecirc[name];
            if (startedwalk) {
                delete sheet.checknamecirc;
            }

            if (evaluatedValue.type !== "range") {
                return evaluatedValue;
            }

            // Update value for range processing
            value.value = evaluatedValue.value;
        }

        // Handle range or coordinate
        let pos = value.value.indexOf(":");
        if (pos !== -1) {
            // Range definition
            value.type = "range";
            value.value = `${value.value.substring(0, pos)}|${value.value.substring(pos + 1)}|`;
            value.value = value.value.toUpperCase();
        } else {
            // Coordinate definition
            value.type = "coord";
            value.value = value.value.toUpperCase();
        }
        return value;

    } else {
        // Check for special constants
        let specialc = SocialCalc.Formula.SpecialConstants[upperName];
        if (specialc) {
            let pos = specialc.indexOf(",");
            value.value = Number(specialc.substring(0, pos));
            value.type = specialc.substring(pos + 1);
            return value;
        } else {
            // Unknown name
            value.value = "";
            value.type = "e#NAME?";
            value.error = `${SocialCalc.Constants.s_calcerrunknownname} "${name}"`;
            return value;
        }
    }
};

/**
 * @description Returns next coordinate in a range, keeping track on the operand stack
 * @param {Array<Object>} operand - Operand stack for tracking iteration
 * @param {string} rangevalue - Range value in format "coord1|coord2|sequence"
 * @returns {Object} Next coordinate with type "coord"
 * 
 * Goes from upper left across and down to bottom right.
 */
SocialCalc.Formula.StepThroughRangeDown = (operand, rangevalue) => {
    let scf = SocialCalc.Formula;

    // Parse range parts
    let pos1 = rangevalue.indexOf("|");
    let pos2 = rangevalue.indexOf("|", pos1 + 1);
    let value1 = rangevalue.substring(0, pos1);
    let value2 = rangevalue.substring(pos1 + 1, pos2);
    let sequence = Number(rangevalue.substring(pos2 + 1));

    // Extract sheet references
    let sheet1 = "";
    let sheetPos1 = value1.indexOf("!");
    if (sheetPos1 !== -1) {
        sheet1 = value1.substring(sheetPos1);
        value1 = value1.substring(0, sheetPos1);
    }

    let sheetPos2 = value2.indexOf("!");
    if (sheetPos2 !== -1) {
        value2 = value2.substring(0, sheetPos2);
    }

    let rp = scf.OrderRangeParts(value1, value2);

    // Iterate through range coordinates
    let count = 0;
    for (let r = rp.r1; r <= rp.r2; r++) {
        for (let c = rp.c1; c <= rp.c2; c++) {
            count++;
            if (count > sequence) {
                // Keep range on stack if not done
                if (r !== rp.r2 || c !== rp.c2) {
                    scf.PushOperand(operand, "range", `${value1}${sheet1}|${value2}|${count}`);
                }
                return {
                    value: SocialCalc.crToCoord(c, r) + sheet1,
                    type: "coord"
                };
            }
        }
    }
};

/**
 * @description Decodes range parts and returns sheet data and range information
 * @param {Object} sheetdata - Sheet data object
 * @param {string} range - Range string in format "coord1|coord2|sequence"
 * @returns {Object|null} Range information object or null if error
 * @returns {Object} returns.sheetdata - Sheet data for the range
 * @returns {string} returns.sheetname - Sheet name or empty string
 * @returns {number} returns.col1num - First column number
 * @returns {number} returns.ncols - Number of columns
 * @returns {number} returns.row1num - First row number
 * @returns {number} returns.nrows - Number of rows
 */
SocialCalc.Formula.DecodeRangeParts = (sheetdata, range) => {
    let scf = SocialCalc.Formula;

    // Parse range components
    let pos1 = range.indexOf("|");
    let pos2 = range.indexOf("|", pos1 + 1);
    let value1 = range.substring(0, pos1);
    let value2 = range.substring(pos1 + 1, pos2);

    // Extract sheet references
    let sheet1 = "";
    let sheetPos1 = value1.indexOf("!");
    if (sheetPos1 !== -1) {
        sheet1 = value1.substring(sheetPos1 + 1);
        value1 = value1.substring(0, sheetPos1);
    }

    let sheetPos2 = value2.indexOf("!");
    if (sheetPos2 !== -1) {
        value2 = value2.substring(0, sheetPos2);
    }

    // Get sheet data
    let coordsheetdata = sheetdata;
    if (sheet1) {
        coordsheetdata = scf.FindInSheetCache(sheet1);
        if (coordsheetdata === null) {
            return null; // Sheet unavailable
        }
    }

    let rp = scf.OrderRangeParts(value1, value2);

    return {
        sheetdata: coordsheetdata,
        sheetname: sheet1,
        col1num: rp.c1,
        ncols: rp.c2 - rp.c1 + 1,
        row1num: rp.r1,
        nrows: rp.r2 - rp.r1 + 1,
    };
};

// =============================================================================
// FUNCTION HANDLING SYSTEM
// =============================================================================

/**
 * @type {Object<string, Array>}
 * @description List of functions with their definitions
 * 
 * SocialCalc.Formula.FunctionList["function_name"] = [function_subroutine, number_of_arguments, arg_def, func_def, func_class]
 *   function_subroutine takes arguments (fname, operand, foperand, sheet), returns errortext or null
 *   number_of_arguments: 0 = no args, >0 = exact count, <0 = minimum count, 100 = don't check
 *   arg_def, func_def, func_class are optional metadata
 */
SocialCalc.Formula.FunctionList = SocialCalc.Formula.FunctionList || {};

/**
 * @type {Object|null}
 * @description Function classes organized by category
 */
SocialCalc.Formula.FunctionClasses = null; // Start null to indicate needs filling

/**
 * @type {Object<string, string>}
 * @description Function argument definitions
 */
SocialCalc.Formula.FunctionArgDefs = {};

/**
 * @description Dispatches function calls and handles argument validation
 * @param {string} fname - Function name to execute
 * @param {Array<Object>} operand - Main operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string} Error text if error occurred, empty string if successful
 */
SocialCalc.Formula.CalculateFunction = (fname, operand, sheet) => {
    let scf = SocialCalc.Formula;
    let fobj = scf.FunctionList[fname];
    let errortext = "";

    if (fobj) {
        // Function exists - validate and execute
        let foperand = [];
        let ffunc = fobj[0];
        let argnum = fobj[1];

        scf.CopyFunctionArgs(operand, foperand);

        // Validate argument count
        if (argnum !== 100) {
            if (argnum < 0) {
                if (foperand.length < -argnum) {
                    return scf.FunctionArgsError(fname, operand);
                }
            } else {
                if (foperand.length !== argnum) {
                    return scf.FunctionArgsError(fname, operand);
                }
            }
        }

        errortext = ffunc(fname, operand, foperand, sheet);

    } else {
        // Unknown function - check if it's a name or error
        if (operand.length && operand[operand.length - 1].type === "start") {
            // No arguments - treat as name
            operand.pop();
            scf.PushOperand(operand, "name", fname);
        } else {
            errortext = `${SocialCalc.Constants.s_sheetfuncunknownfunction} ${fname}.`;
        }
    }

    return errortext;
};

/**
 * @description Pushes type and value onto the operand stack
 * @param {Array<Object>} operand - Operand stack
 * @param {string} t - Value type
 * @param {*} v - Value to push
 */
SocialCalc.Formula.PushOperand = (operand, t, v) => {
    operand.push({ type: t, value: v });
};

/**
 * @description Copies function arguments from operand stack to function operand stack
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack (output)
 * 
 * Pops operands from operand stack and pushes on foperand up to function start marker,
 * reversing order in the process.
 */
SocialCalc.Formula.CopyFunctionArgs = (operand, foperand) => {
    // Copy arguments until we hit the start marker
    while (operand.length > 0 && operand[operand.length - 1].type !== "start") {
        foperand.push(operand.pop());
    }
    operand.pop(); // Remove the "start" marker
};

/**
 * @description Handles function argument errors
 * @param {string} fname - Function name that caused the error
 * @param {Array<Object>} operand - Operand stack to push error onto
 * @returns {string} Error message text
 */
SocialCalc.Formula.FunctionArgsError = (fname, operand) => {
    let errortext = `${SocialCalc.Constants.s_calcerrincorrectargstofunction} ${fname}.`;
    SocialCalc.Formula.PushOperand(operand, "e#VALUE!", errortext);
    return errortext;
};

/**
 * @description Pushes a specific error type and message onto operand stack
 * @param {string} fname - Function name (for context)
 * @param {Array<Object>} operand - Operand stack to push error onto
 * @param {string} errortype - Error type (e.g., "e#VALUE!", "e#REF!")
 * @param {string} errortext - Error message text
 * @returns {string} The error text that was pushed
 */
SocialCalc.Formula.FunctionSpecificError = (fname, operand, errortype, errortext) => {
    SocialCalc.Formula.PushOperand(operand, errortype, errortext);
    return errortext;
};

/**
 * @description Checks if a value is an error and pushes it onto stack if so
 * @param {Array<Object>} operand - Operand stack
 * @param {Object} v - Value to check with type and value properties
 * @returns {boolean} True if error was found and pushed, false otherwise
 */
SocialCalc.Formula.CheckForErrorValue = (operand, v) => {
    if (v.type.charAt(0) === "e") {
        operand.push(v);
        return true;
    }
    return false;
};

// =============================================================================
// FUNCTION INFORMATION AND METADATA ROUTINES
// =============================================================================

/**
 * @description Fills out FunctionArgDefs and FunctionClasses from function definitions
 * @description Execute this after any changes to SocialCalc.Constants but before UI is used
 */
SocialCalc.Formula.FillFunctionInfo = () => {
    let scf = SocialCalc.Formula;
    let scc = SocialCalc.Constants;

    // Only fill once
    if (scf.FunctionClasses) {
        return;
    }

    // Fill function argument definitions and descriptions
    for (let fname in scf.FunctionList) {
        let f = scf.FunctionList[fname];

        if (f[2]) {
            // Has an argument definition
            scf.FunctionArgDefs[f[2]] = scc[`s_farg_${f[2]}`] || "";
        }

        if (!f[3]) {
            // No text definition, check constants
            if (scc[`s_fdef_${fname}`]) {
                scf.FunctionList[fname][3] = scc[`s_fdef_${fname}`];
            }
        }
    }

    // Initialize function classes
    scf.FunctionClasses = {};

    // Create class categories
    for (let i = 0; i < scc.function_classlist.length; i++) {
        let cname = scc.function_classlist[i];
        scf.FunctionClasses[cname] = {
            name: scc[`s_fclass_${cname}`],
            items: [],
        };
    }

    // Categorize functions into classes
    for (let fname in scf.FunctionList) {
        let f = scf.FunctionList[fname];
        let classes = f[4] ? f[4].split(",") : [];
        classes.push("all"); // All functions go in "all" category

        for (let i = 0; i < classes.length; i++) {
            let cname = classes[i];
            scf.FunctionClasses[cname].items.push(fname);
        }
    }

    // Sort function lists within each class
    for (let cname in scf.FunctionClasses) {
        scf.FunctionClasses[cname].items.sort();
    }
};

/**
 * @description Returns a string representing the arguments to function fname
 * @param {string} fname - Function name
 * @returns {string} Formatted argument string
 */
SocialCalc.Formula.FunctionArgString = (fname) => {
    let scf = SocialCalc.Formula;
    let fdata = scf.FunctionList[fname];
    let adef = fdata[2];

    if (!adef) {
        let nargs = fdata[1];

        if (nargs === 0) {
            return " ";
        } else if (nargs > 0) {
            // Exact number of arguments
            let str = "v1";
            for (let i = 2; i <= nargs; i++) {
                str += `, v${i}`;
            }
            return str;
        } else if (nargs < 0) {
            // Minimum number of arguments with variadic
            let str = "v1";
            for (let i = 2; i < -nargs; i++) {
                str += `, v${i}`;
            }
            return `${str}, ...`;
        } else {
            return `nargs: ${nargs}`;
        }
    }

    return scf.FunctionArgDefs[adef] || adef;
};

// =============================================================================
// STATISTICAL SERIES FUNCTIONS
// =============================================================================

/**
 * @description Calculates statistical functions on series of values
 * @param {string} fname - Function name (AVERAGE, COUNT, SUM, etc.)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * Supported functions:
 * AVERAGE, COUNT, COUNTA, COUNTBLANK, MAX, MIN, PRODUCT, STDEV, STDEVP, SUM, VAR, VARP
 * 
 * Calculates all statistics and returns the desired one (overhead is in accessing not calculating)
 * If this routine is changed, check the dseries_functions, too.
 */
SocialCalc.Formula.SeriesFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let operand_value_and_type = scf.OperandValueAndType;
    let lookup_result_type = scf.LookupResultType;
    let typelookupplus = scf.TypeLookupTable.plus;

    /**
     * @description Helper to push operand onto stack
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    // Statistical accumulators
    let sum = 0;
    let resulttypesum = "";
    let count = 0;        // Count of numeric values
    let counta = 0;       // Count of non-blank values
    let countblank = 0;   // Count of blank values
    let product = 1;
    let maxval;
    let minval;

    // For variance calculations (Knuth's algorithm)
    // Reference: "The Art of Computer Programming" Vol. 2 3rd edition, page 232
    let mk, sk, mk1, sk1; // M sub k, k-1, and S sub k-1

    // Process all operands
    while (foperand.length > 0) {
        let value1 = operand_value_and_type(sheet, foperand);
        let t = value1.type.charAt(0);

        // Count different types
        if (t === "n") count += 1;
        if (t !== "b") counta += 1;
        if (t === "b") countblank += 1;

        if (t === "n") {
            let v1 = Number(value1.value);

            // Basic arithmetic
            sum += v1;
            product *= v1;
            maxval = maxval !== undefined ? Math.max(v1, maxval) : v1;
            minval = minval !== undefined ? Math.min(v1, minval) : v1;

            // Variance calculation using Knuth's stable algorithm
            if (count === 1) {
                // Initialize with first value
                mk1 = v1;
                sk1 = 0;
            } else {
                // Accumulate S sub 1 through n as per Knuth
                mk = mk1 + (v1 - mk1) / count;
                sk = sk1 + (v1 - mk1) * (v1 - mk);
                sk1 = sk;
                mk1 = mk;
            }

            // Track result type
            resulttypesum = lookup_result_type(
                value1.type,
                resulttypesum || value1.type,
                typelookupplus
            );
        } else if (t === "e" && resulttypesum.charAt(0) !== "e") {
            // Propagate errors
            resulttypesum = value1.type;
        }
    }

    resulttypesum = resulttypesum || "n";

    // Return appropriate result based on function name
    switch (fname) {
        case "SUM":
            PushOperand(resulttypesum, sum);
            break;

        case "PRODUCT":
            // May handle cases with text differently than some other spreadsheets
            PushOperand(resulttypesum, product);
            break;

        case "MIN":
            PushOperand(resulttypesum, minval || 0);
            break;

        case "MAX":
            PushOperand(resulttypesum, maxval || 0);
            break;

        case "COUNT":
            PushOperand("n", count);
            break;

        case "COUNTA":
            PushOperand("n", counta);
            break;

        case "COUNTBLANK":
            PushOperand("n", countblank);
            break;

        case "AVERAGE":
            if (count > 0) {
                PushOperand(resulttypesum, sum / count);
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "STDEV":
            // Sample standard deviation
            if (count > 1) {
                PushOperand(resulttypesum, Math.sqrt(sk / (count - 1)));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "STDEVP":
            // Population standard deviation
            if (count > 0) {
                PushOperand(resulttypesum, Math.sqrt(sk / count));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "VAR":
            // Sample variance
            if (count > 1) {
                PushOperand(resulttypesum, sk / (count - 1));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "VARP":
            // Population variance
            if (count > 0) {
                PushOperand(resulttypesum, sk / count);
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;
    }

    return null;
};

// =============================================================================
// FUNCTION REGISTRATION
// =============================================================================

// Register all statistical functions with the function system
// Format: [function, min_args, arg_definition, description, class]
let statisticalFunctions = {
    "AVERAGE": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "COUNT": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "COUNTA": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "COUNTBLANK": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "MAX": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "MIN": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "PRODUCT": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "STDEV": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "STDEVP": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "SUM": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "VAR": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
    "VARP": [SocialCalc.Formula.SeriesFunctions, -1, "vn", null, "stat"],
};

// =============================================================================
// DATABASE STATISTICAL FUNCTIONS
// =============================================================================

/**
 * @description Calculates statistical functions on database records matching criteria
 * @param {string} fname - Function name (DAVERAGE, DCOUNT, DSUM, etc.)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * Supported functions:
 * DAVERAGE, DCOUNT, DCOUNTA, DGET, DMAX, DMIN, DPRODUCT, DSTDEV, DSTDEVP, DSUM, DVAR, DVARP
 * 
 * All functions operate on a database range with field criteria matching.
 * Calculates all statistics and returns the desired one.
 * If this routine is changed, check the series_functions, too.
 */
SocialCalc.Formula.DSeriesFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let operand_value_and_type = scf.OperandValueAndType;
    let lookup_result_type = scf.LookupResultType;
    let typelookupplus = scf.TypeLookupTable.plus;

    /**
     * @description Helper to push operand onto stack
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    // Get function arguments
    let dbrange = scf.TopOfStackValueAndType(sheet, foperand); // database range
    let fieldname = scf.OperandValueAndType(sheet, foperand); // field name/number
    let criteriarange = scf.TopOfStackValueAndType(sheet, foperand); // criteria range

    // Validate arguments
    if (dbrange.type !== "range" || criteriarange.type !== "range") {
        return scf.FunctionArgsError(fname, operand);
    }

    // Decode range information
    let dbinfo = scf.DecodeRangeParts(sheet, dbrange.value);
    let criteriainfo = scf.DecodeRangeParts(sheet, criteriarange.value);

    // Determine target field column
    let fieldasnum = scf.FieldToColnum(
        dbinfo.sheetdata,
        dbinfo.col1num,
        dbinfo.ncols,
        dbinfo.row1num,
        fieldname.value,
        fieldname.type
    );

    if (fieldasnum <= 0) {
        PushOperand("e#VALUE!", 0);
        return null;
    }

    let targetcol = dbinfo.col1num + fieldasnum - 1;
    let criteriafieldnums = [];

    // Map criteria fields to database columns
    for (let i = 0; i < criteriainfo.ncols; i++) {
        let cell = criteriainfo.sheetdata.GetAssuredCell(
            SocialCalc.crToCoord(criteriainfo.col1num + i, criteriainfo.row1num)
        );
        let criterianum = scf.FieldToColnum(
            dbinfo.sheetdata,
            dbinfo.col1num,
            dbinfo.ncols,
            dbinfo.row1num,
            cell.datavalue,
            cell.valuetype
        );

        if (criterianum <= 0) {
            PushOperand("e#VALUE!", 0);
            return null;
        }
        criteriafieldnums.push(dbinfo.col1num + criterianum - 1);
    }

    // Statistical accumulators
    let sum = 0;
    let resulttypesum = "";
    let count = 0;        // Count of numeric values
    let counta = 0;       // Count of non-blank values
    let countblank = 0;   // Count of blank values
    let product = 1;
    let maxval;
    let minval;

    // For variance calculations (Knuth's algorithm)
    let mk, sk, mk1, sk1;

    // Process each database row
    for (let i = 1; i < dbinfo.nrows; i++) {
        let testok = false;

        // Test against all criteria rows (OR logic between rows)
        CRITERIAROW: for (let j = 1; j < criteriainfo.nrows; j++) {
            // Check all criteria columns in this row (AND logic within row)
            for (let k = 0; k < criteriainfo.ncols; k++) {
                let criteriacr = SocialCalc.crToCoord(
                    criteriainfo.col1num + k,
                    criteriainfo.row1num + j
                );
                let criteriaCell = criteriainfo.sheetdata.GetAssuredCell(criteriacr);
                let criteria = criteriaCell.datavalue;

                // Skip blank criteria
                if (typeof criteria === "string" && criteria.length === 0) continue;

                let testcol = criteriafieldnums[k];
                let testcr = SocialCalc.crToCoord(testcol, dbinfo.row1num + i);
                let testCell = dbinfo.sheetdata.GetAssuredCell(testcr);

                // Test if this cell matches criteria
                if (!scf.TestCriteria(testCell.datavalue, testCell.valuetype || "b", criteria)) {
                    continue CRITERIAROW; // Doesn't match - try next criteria row
                }
            }
            testok = true; // Met all criteria in this row
            break CRITERIAROW;
        }

        if (!testok) continue; // Row doesn't match any criteria

        // Get the target field value for this matching row
        let cr = SocialCalc.crToCoord(targetcol, dbinfo.row1num + i);
        let cell = dbinfo.sheetdata.GetAssuredCell(cr);

        let value1 = {
            value: cell.datavalue,
            type: cell.valuetype || "b"
        };

        let t = value1.type.charAt(0);

        // Count different types
        if (t === "n") count += 1;
        if (t !== "b") counta += 1;
        if (t === "b") countblank += 1;

        if (t === "n") {
            let v1 = Number(value1.value);

            // Basic arithmetic
            sum += v1;
            product *= v1;
            maxval = maxval !== undefined ? Math.max(v1, maxval) : v1;
            minval = minval !== undefined ? Math.min(v1, minval) : v1;

            // Variance calculation using Knuth's stable algorithm
            if (count === 1) {
                mk1 = v1;
                sk1 = 0;
            } else {
                mk = mk1 + (v1 - mk1) / count;
                sk = sk1 + (v1 - mk1) * (v1 - mk);
                sk1 = sk;
                mk1 = mk;
            }

            resulttypesum = lookup_result_type(
                value1.type,
                resulttypesum || value1.type,
                typelookupplus
            );
        } else if (t === "e" && resulttypesum.charAt(0) !== "e") {
            resulttypesum = value1.type;
        }
    }

    resulttypesum = resulttypesum || "n";

    // Return appropriate result based on function name
    switch (fname) {
        case "DSUM":
            PushOperand(resulttypesum, sum);
            break;

        case "DPRODUCT":
            // May handle cases with text differently than some other spreadsheets
            PushOperand(resulttypesum, product);
            break;

        case "DMIN":
            PushOperand(resulttypesum, minval || 0);
            break;

        case "DMAX":
            PushOperand(resulttypesum, maxval || 0);
            break;

        case "DCOUNT":
            PushOperand("n", count);
            break;

        case "DCOUNTA":
            PushOperand("n", counta);
            break;

        case "DAVERAGE":
            if (count > 0) {
                PushOperand(resulttypesum, sum / count);
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "DSTDEV":
            // Sample standard deviation
            if (count > 1) {
                PushOperand(resulttypesum, Math.sqrt(sk / (count - 1)));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "DSTDEVP":
            // Population standard deviation
            if (count > 0) {
                PushOperand(resulttypesum, Math.sqrt(sk / count));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "DVAR":
            // Sample variance
            if (count > 1) {
                PushOperand(resulttypesum, sk / (count - 1));
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "DVARP":
            // Population variance
            if (count > 0) {
                PushOperand(resulttypesum, sk / count);
            } else {
                PushOperand("e#DIV/0!", 0);
            }
            break;

        case "DGET":
            // Get single value - error if not exactly one match
            if (count === 1) {
                PushOperand(resulttypesum, sum);
            } else if (count === 0) {
                PushOperand("e#VALUE!", 0);
            } else {
                PushOperand("e#NUM!", 0);
            }
            break;
    }

    return null;
};

/**
 * @description Converts field name or number to column number within database range
 * @param {Object} sheet - Sheet object containing cell data
 * @param {number} col1num - First column number of database
 * @param {number} ncols - Number of columns in database
 * @param {number} row1num - Header row number
 * @param {string|number} fieldname - Field name or column number
 * @param {string} fieldtype - Type of fieldname parameter
 * @returns {number} Column number (1-based) or 0 if not found
 * 
 * If fieldname is a number, uses it directly if valid.
 * Otherwise looks up string in header row to find field number.
 */
SocialCalc.Formula.FieldToColnum = (sheet, col1num, ncols, row1num, fieldname, fieldtype) => {
    if (fieldtype.charAt(0) === "n") {
        // Numeric field reference - validate range
        let colnum = Number(fieldname);
        if (colnum <= 0 || colnum > ncols) {
            return 0;
        }
        return Math.floor(colnum);
    }

    if (fieldtype.charAt(0) !== "t") {
        // Must be text for field name lookup
        return 0;
    }

    let fieldnameLC = fieldname ? fieldname.toLowerCase() : "";

    // Search column headers for matching field name
    for (let colnum = 0; colnum < ncols; colnum++) {
        let cell = sheet.GetAssuredCell(SocialCalc.crToCoord(col1num + colnum, row1num));
        let value = `${cell.datavalue}`.toLowerCase(); // Case-insensitive comparison

        if (value === fieldnameLC) {
            return colnum + 1; // Return 1-based column number
        }
    }

    return 0; // No match found
};

// =============================================================================
// LOOKUP AND SEARCH FUNCTIONS
// =============================================================================

/**
 * @description Implements HLOOKUP, VLOOKUP, and MATCH functions
 * @param {string} fname - Function name (HLOOKUP, VLOOKUP, MATCH)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.LookupFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    /**
     * @description Helper to push operand onto stack
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    // Get lookup value and convert to lowercase for text comparisons
    let lookupvalue = scf.OperandValueAndType(sheet, foperand);
    if (typeof lookupvalue.value === "string") {
        lookupvalue.value = lookupvalue.value.toLowerCase();
    }

    // Get search range
    let range = scf.TopOfStackValueAndType(sheet, foperand);

    let rangelookup = 1; // Default to approximate match
    let offsetvalue;

    if (fname === "MATCH") {
        // MATCH has optional match type parameter
        if (foperand.length) {
            let rangelookupParam = scf.OperandAsNumber(sheet, foperand);
            if (rangelookupParam.type.charAt(0) !== "n") {
                PushOperand("e#VALUE!", 0);
                return null;
            }
            if (foperand.length) {
                return scf.FunctionArgsError(fname, operand);
            }
            rangelookup = rangelookupParam.value;
        }
    } else {
        // HLOOKUP/VLOOKUP require offset parameter
        let offsetParam = scf.OperandAsNumber(sheet, foperand);
        if (offsetParam.type.charAt(0) !== "n") {
            PushOperand("e#VALUE!", 0);
            return null;
        }
        offsetvalue = Math.floor(offsetParam.value);

        // Optional range lookup parameter
        if (foperand.length) {
            let rangelookupParam = scf.OperandAsNumber(sheet, foperand);
            if (rangelookupParam.type.charAt(0) !== "n") {
                PushOperand("e#VALUE!", 0);
                return null;
            }
            if (foperand.length) {
                return scf.FunctionArgsError(fname, operand);
            }
            rangelookup = rangelookupParam.value ? 1 : 0;
        }
    }

    // Normalize lookup value type
    lookupvalue.type = lookupvalue.type.charAt(0);
    if (lookupvalue.type === "n") {
        lookupvalue.value = Number(lookupvalue.value);
    }

    // Validate range
    if (range.type !== "range") {
        return scf.FunctionArgsError(fname, operand);
    }

    let rangeinfo = scf.DecodeRangeParts(sheet, range.value, range.type);
    if (!rangeinfo) {
        PushOperand("e#REF!", 0);
        return null;
    }

    // Set up search direction and validate offset
    let c = 0, r = 0, cincr = 0, rincr = 0;

    if (fname === "HLOOKUP") {
        cincr = 1; // Search horizontally
        if (offsetvalue > rangeinfo.nrows) {
            PushOperand("e#REF!", 0);
            return null;
        }
    } else if (fname === "VLOOKUP") {
        rincr = 1; // Search vertically
        if (offsetvalue > rangeinfo.ncols) {
            PushOperand("e#REF!", 0);
            return null;
        }
    } else if (fname === "MATCH") {
        // Determine search direction based on range shape
        if (rangeinfo.ncols > 1) {
            if (rangeinfo.nrows > 1) {
                PushOperand("e#N/A", 0);
                return null;
            }
            cincr = 1; // Single row - search horizontally
        } else {
            rincr = 1; // Single column - search vertically
        }
    }

    if (offsetvalue < 1 && fname !== "MATCH") {
        PushOperand("e#VALUE!", 0);
        return null;
    }

    // Search for matching value
    let previousOK = 0;
    let csave, rsave;

    while (true) {
        let cr = SocialCalc.crToCoord(rangeinfo.col1num + c, rangeinfo.row1num + r);
        let cell = rangeinfo.sheetdata.GetAssuredCell(cr);
        let value = cell.datavalue;
        let valuetype = cell.valuetype ? cell.valuetype.charAt(0) : "b";

        if (valuetype === "n") {
            value = Number(value);
        }

        if (rangelookup) {
            // Approximate match logic
            if (lookupvalue.type === "n" && valuetype === "n") {
                if (lookupvalue.value === value) {
                    break; // Exact match
                }
                if ((rangelookup > 0 && lookupvalue.value > value) ||
                    (rangelookup < 0 && lookupvalue.value < value)) {
                    // Potential match - save position
                    previousOK = 1;
                    csave = c;
                    rsave = r;
                } else if (previousOK) {
                    // Previous was OK, this isn't
                    previousOK = 2;
                    break;
                }
            } else if (lookupvalue.type === "t" && valuetype === "t") {
                let valueLC = typeof value === "string" ? value.toLowerCase() : "";
                if (lookupvalue.value === valueLC) {
                    break; // Exact match
                }
                if ((rangelookup > 0 && lookupvalue.value > valueLC) ||
                    (rangelookup < 0 && lookupvalue.value < valueLC)) {
                    // Potential match - save position
                    previousOK = 1;
                    csave = c;
                    rsave = r;
                } else if (previousOK) {
                    // Previous was OK, this isn't
                    previousOK = 2;
                    break;
                }
            }
        } else {
            // Exact match only
            if (lookupvalue.type === "n" && valuetype === "n") {
                if (lookupvalue.value === value) {
                    break;
                }
            } else if (lookupvalue.type === "t" && valuetype === "t") {
                let valueLC = typeof value === "string" ? value.toLowerCase() : "";
                if (lookupvalue.value === valueLC) {
                    break;
                }
            }
        }

        // Move to next position
        r += rincr;
        c += cincr;

        if (r >= rangeinfo.nrows || c >= rangeinfo.ncols) {
            // End of range - check if we had a previous match
            if (previousOK) {
                previousOK = 2;
                break;
            }
            PushOperand("e#N/A", 0);
            return null;
        }
    }

    // Use previous match if needed
    if (previousOK === 2) {
        r = rsave;
        c = csave;
    }

    // Return appropriate result
    let resultValue, resultType;

    if (fname === "MATCH") {
        resultValue = c + r + 1; // Position (only one will be non-zero)
        resultType = "n";
    } else {
        // Calculate result cell coordinate
        let resultCr = SocialCalc.crToCoord(
            rangeinfo.col1num + c + (fname === "VLOOKUP" ? offsetvalue - 1 : 0),
            rangeinfo.row1num + r + (fname === "HLOOKUP" ? offsetvalue - 1 : 0)
        );
        let resultCell = rangeinfo.sheetdata.GetAssuredCell(resultCr);
        resultValue = resultCell.datavalue;
        resultType = resultCell.valuetype;
    }

    PushOperand(resultType, resultValue);
    return null;
};

/**
 * @description Implements INDEX function for array indexing
 * @param {string} fname - Function name (INDEX)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack  
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.IndexFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    /**
     * @description Helper to push operand onto stack
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    // Get range argument
    let range = scf.TopOfStackValueAndType(sheet, foperand);
    if (range.type !== "range") {
        return scf.FunctionArgsError(fname, operand);
    }

    let indexinfo = scf.DecodeRangeParts(sheet, range.value, range.type);
    let sheetname = indexinfo.sheetname ? `!${indexinfo.sheetname}` : "";

    let rowindex = { value: 0 };
    let colindex = { value: 0 };

    // Parse optional row and column indices
    if (foperand.length) {
        rowindex = scf.OperandAsNumber(sheet, foperand);
        if (rowindex.type.charAt(0) !== "n" || rowindex.value < 0) {
            PushOperand("e#VALUE!", 0);
            return null;
        }

        if (foperand.length) {
            colindex = scf.OperandAsNumber(sheet, foperand);
            if (colindex.type.charAt(0) !== "n" || colindex.value < 0) {
                PushOperand("e#VALUE!", 0);
                return null;
            }

            if (foperand.length) {
                return scf.FunctionArgsError(fname, operand);
            }
        } else {
            // Column number missing - handle single row case
            if (indexinfo.nrows === 1) {
                colindex.value = rowindex.value;
                rowindex.value = 0;
            }
        }
    }

    // Validate indices
    if (rowindex.value > indexinfo.nrows || colindex.value > indexinfo.ncols) {
        PushOperand("e#REF!", 0);
        return null;
    }

    // Generate result based on indices
    let result, resulttype;

    if (rowindex.value === 0) {
        if (colindex.value === 0) {
            // Return entire range or single cell
            if (indexinfo.nrows === 1 && indexinfo.ncols === 1) {
                result = SocialCalc.crToCoord(indexinfo.col1num, indexinfo.row1num) + sheetname;
                resulttype = "coord";
            } else {
                result = `${SocialCalc.crToCoord(indexinfo.col1num, indexinfo.row1num)}${sheetname}|${SocialCalc.crToCoord(indexinfo.col1num + indexinfo.ncols - 1, indexinfo.row1num + indexinfo.nrows - 1)}|`;
                resulttype = "range";
            }
        } else {
            // Return column
            if (indexinfo.nrows === 1) {
                result = SocialCalc.crToCoord(indexinfo.col1num + colindex.value - 1, indexinfo.row1num) + sheetname;
                resulttype = "coord";
            } else {
                result = `${SocialCalc.crToCoord(indexinfo.col1num + colindex.value - 1, indexinfo.row1num)}${sheetname}|${SocialCalc.crToCoord(indexinfo.col1num + colindex.value - 1, indexinfo.row1num + indexinfo.nrows - 1)}|`;
                resulttype = "range";
            }
        }
    } else {
        if (colindex.value === 0) {
            // Return row
            if (indexinfo.ncols === 1) {
                result = SocialCalc.crToCoord(indexinfo.col1num, indexinfo.row1num + rowindex.value - 1) + sheetname;
                resulttype = "coord";
            } else {
                result = `${SocialCalc.crToCoord(indexinfo.col1num, indexinfo.row1num + rowindex.value - 1)}${sheetname}|${SocialCalc.crToCoord(indexinfo.col1num + indexinfo.ncols - 1, indexinfo.row1num + rowindex.value - 1)}|`;
                resulttype = "range";
            }
        } else {
            // Return specific cell
            result = SocialCalc.crToCoord(indexinfo.col1num + colindex.value - 1, indexinfo.row1num + rowindex.value - 1) + sheetname;
            resulttype = "coord";
        }
    }

    PushOperand(resulttype, result);
    return null;
};

/**
 * @description Implements COUNTIF and SUMIF functions
 * @param {string} fname - Function name (COUNTIF, SUMIF)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.CountifSumifFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let operand_value_and_type = scf.OperandValueAndType;
    let lookup_result_type = scf.LookupResultType;
    let typelookupplus = scf.TypeLookupTable.plus;

    /**
     * @description Helper to push operand onto stack
     */
    let PushOperand = (t, v) => {
        operand.push({ type: t, value: v });
    };

    let sum = 0;
    let resulttypesum = "";
    let count = 0;

    // Get arguments
    let range = scf.TopOfStackValueAndType(sheet, foperand); // test range
    let criteria = scf.OperandAsText(sheet, foperand); // criteria

    let sumrange;
    if (fname === "SUMIF") {
        if (foperand.length === 1) {
            // Three-argument form
            sumrange = scf.TopOfStackValueAndType(sheet, foperand);
        } else if (foperand.length === 0) {
            // Two-argument form - sum the test range
            sumrange = { value: range.value, type: range.type };
        } else {
            return scf.FunctionArgsError(fname, operand);
        }
    } else {
        sumrange = { value: range.value, type: range.type };
    }

    // Process criteria
    let criteriaValue = criteria.value;
    let criteriaType = criteria.type.charAt(0);

    if (criteriaType === "n") {
        criteriaValue = `${criteriaValue}`; // Convert to text
    } else if (criteriaType === "e" || criteriaType === "b") {
        criteriaValue = null; // Error or blank
    }

    // Validate ranges
    if (range.type !== "coord" && range.type !== "range") {
        return scf.FunctionArgsError(fname, operand);
    }

    if (fname === "SUMIF" && sumrange.type !== "coord" && sumrange.type !== "range") {
        return scf.FunctionArgsError(fname, operand);
    }

    // Set up parallel iteration
    foperand.push(range);
    let f2operand = [sumrange];

    // Process each value pair
    while (foperand.length) {
        let value1 = operand_value_and_type(sheet, foperand); // test value
        let value2 = operand_value_and_type(sheet, f2operand); // sum value

        // Test criteria
        if (!scf.TestCriteria(value1.value, value1.type, criteriaValue)) {
            continue;
        }

        count += 1;

        // Accumulate sum if numeric
        if (value2.type.charAt(0) === "n") {
            sum += Number(value2.value);
            resulttypesum = lookup_result_type(
                value2.type,
                resulttypesum || value2.type,
                typelookupplus
            );
        } else if (value2.type.charAt(0) === "e" && resulttypesum.charAt(0) !== "e") {
            resulttypesum = value2.type;
        }
    }

    resulttypesum = resulttypesum || "n";

    // Return appropriate result
    if (fname === "SUMIF") {
        PushOperand(resulttypesum, sum);
    } else if (fname === "COUNTIF") {
        PushOperand("n", count);
    }

    return null;
};

// =============================================================================
// FUNCTION REGISTRATION
// =============================================================================

// Register database functions
let databaseFunctions = {
    "DAVERAGE": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DCOUNT": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DCOUNTA": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DGET": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DMAX": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DMIN": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DPRODUCT": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DSTDEV": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DSTDEVP": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DSUM": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DVAR": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
    "DVARP": [SocialCalc.Formula.DSeriesFunctions, 3, "dfunc", "", "stat"],
};

// Register lookup functions
let lookupFunctions = {
    "HLOOKUP": [SocialCalc.Formula.LookupFunctions, -3, "hlookup", "", "lookup"],
    "MATCH": [SocialCalc.Formula.LookupFunctions, -2, "match", "", "lookup"],
    "VLOOKUP": [SocialCalc.Formula.LookupFunctions, -3, "vlookup", "", "lookup"],
    "INDEX": [SocialCalc.Formula.IndexFunction, -1, "index", "", "lookup"],
};

// Register conditional functions
let conditionalFunctions = {
    "COUNTIF": [SocialCalc.Formula.CountifSumifFunctions, 2, "rangec", "", "stat"],
    "SUMIF": [SocialCalc.Formula.CountifSumifFunctions, -2, "sumif", "", "stat"],
};

// =============================================================================
// LOGICAL AND CONDITIONAL FUNCTIONS
// =============================================================================

/**
 * @description Implements the IF function for conditional logic
 * @param {string} fname - Function name (IF)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * IF(condition, true_value, false_value)
 * Returns true_value if condition is true, false_value otherwise
 */
SocialCalc.Formula.IfFunction = (fname, operand, foperand, sheet) => {
    let cond = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    let t = cond.type.charAt(0);

    // Condition must be numeric or blank
    if (t !== "n" && t !== "b") {
        operand.push({ type: "e#VALUE!", value: 0 });
        return null;
    }

    // Conditional logic: pop the appropriate value based on condition
    if (!cond.value) {
        foperand.pop(); // Remove true value, keep false value
    }
    operand.push(foperand.pop()); // Push the selected value

    if (cond.value) {
        foperand.pop(); // Remove false value if condition was true
    }

    return null;
};

// =============================================================================
// DATE AND TIME FUNCTIONS
// =============================================================================

/**
 * @description Creates a date serial number from year, month, day
 * @param {string} fname - Function name (DATE)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * DATE(year, month, day)
 * Returns the serial number representing the date
 */
SocialCalc.Formula.DateFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let year = scf.OperandAsNumber(sheet, foperand);
    let month = scf.OperandAsNumber(sheet, foperand);
    let day = scf.OperandAsNumber(sheet, foperand);

    // Determine result type based on input types
    let resulttype = scf.LookupResultType(year.type, month.type, scf.TypeLookupTable.twoargnumeric);
    resulttype = scf.LookupResultType(resulttype, day.type, scf.TypeLookupTable.twoargnumeric);

    let result = 0;
    if (resulttype.charAt(0) === "n") {
        // Convert Gregorian date to Julian, then adjust for spreadsheet date system
        result = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(
            Math.floor(year.value),
            Math.floor(month.value),
            Math.floor(day.value)
        ) - SocialCalc.FormatNumber.datevalues.julian_offset;
        resulttype = "nd"; // Date number type
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Creates a time serial number from hours, minutes, seconds
 * @param {string} fname - Function name (TIME)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * TIME(hour, minute, second)
 * Returns the decimal number for the time (fraction of a day)
 */
SocialCalc.Formula.TimeFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let hours = scf.OperandAsNumber(sheet, foperand);
    let minutes = scf.OperandAsNumber(sheet, foperand);
    let seconds = scf.OperandAsNumber(sheet, foperand);

    // Determine result type
    let resulttype = scf.LookupResultType(hours.type, minutes.type, scf.TypeLookupTable.twoargnumeric);
    resulttype = scf.LookupResultType(resulttype, seconds.type, scf.TypeLookupTable.twoargnumeric);

    let result = 0;
    if (resulttype.charAt(0) === "n") {
        // Convert to fraction of a day
        result = (hours.value * 60 * 60 + minutes.value * 60 + seconds.value) / (24 * 60 * 60);
        resulttype = "nt"; // Time number type
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Extracts date components (DAY, MONTH, YEAR, WEEKDAY)
 * @param {string} fname - Function name (DAY, MONTH, YEAR, WEEKDAY)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.DMYFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;

    let datevalue = scf.OperandAsNumber(sheet, foperand);
    let resulttype = scf.LookupResultType(datevalue.type, datevalue.type, scf.TypeLookupTable.oneargnumeric);

    if (resulttype.charAt(0) === "n") {
        // Convert serial number back to Gregorian date
        let ymd = SocialCalc.FormatNumber.convert_date_julian_to_gregorian(
            Math.floor(datevalue.value + SocialCalc.FormatNumber.datevalues.julian_offset)
        );

        switch (fname) {
            case "DAY":
                result = ymd.day;
                break;

            case "MONTH":
                result = ymd.month;
                break;

            case "YEAR":
                result = ymd.year;
                break;

            case "WEEKDAY":
                let dtype = { value: 1 }; // Default type 1 (Sunday = 1)
                if (foperand.length) {
                    dtype = scf.OperandAsNumber(sheet, foperand);
                    if (dtype.type.charAt(0) !== "n" || dtype.value < 1 || dtype.value > 3) {
                        scf.PushOperand(operand, "e#VALUE!", 0);
                        return null;
                    }
                    if (foperand.length) {
                        return scf.FunctionArgsError(fname, operand);
                    }
                }

                // Calculate weekday with appropriate offset
                let doffset = 6;
                if (dtype.value > 1) {
                    doffset -= 1;
                }
                result = (Math.floor(datevalue.value + doffset) % 7) + (dtype.value < 3 ? 1 : 0);
                break;
        }
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Extracts time components (HOUR, MINUTE, SECOND)
 * @param {string} fname - Function name (HOUR, MINUTE, SECOND)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.HMSFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;

    let datetime = scf.OperandAsNumber(sheet, foperand);
    let resulttype = scf.LookupResultType(datetime.type, datetime.type, scf.TypeLookupTable.oneargnumeric);

    if (resulttype.charAt(0) === "n") {
        if (datetime.value < 0) {
            scf.PushOperand(operand, "e#NUM!", 0); // Must be non-negative
            return null;
        }

        // Extract time components from fractional part of day
        let fraction = datetime.value - Math.floor(datetime.value);
        fraction *= 24;
        let hours = Math.floor(fraction);

        fraction -= Math.floor(fraction);
        fraction *= 60;
        let minutes = Math.floor(fraction);

        fraction -= Math.floor(fraction);
        fraction *= 60;
        let seconds = Math.floor(fraction + (datetime.value >= 0 ? 0.5 : -0.5));

        switch (fname) {
            case "HOUR":
                result = hours;
                break;
            case "MINUTE":
                result = minutes;
                break;
            case "SECOND":
                result = seconds;
                break;
        }
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// TEXT AND STRING FUNCTIONS
// =============================================================================

/**
 * @description Exact string comparison function
 * @param {string} fname - Function name (EXACT)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * EXACT(value1, value2)
 * Returns TRUE if values are exactly equal, FALSE otherwise
 */
SocialCalc.Formula.ExactFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype = "nl";

    let value1 = scf.OperandValueAndType(sheet, foperand);
    let v1type = value1.type.charAt(0);
    let value2 = scf.OperandValueAndType(sheet, foperand);
    let v2type = value2.type.charAt(0);

    // Handle different type combinations
    if (v1type === "t") {
        if (v2type === "t") {
            result = value1.value === value2.value ? 1 : 0;
        } else if (v2type === "b") {
            result = value1.value.length ? 0 : 1;
        } else if (v2type === "n") {
            result = value1.value === `${value2.value}` ? 1 : 0;
        } else if (v2type === "e") {
            result = value2.value;
            resulttype = value2.type;
        } else {
            result = 0;
        }
    } else if (v1type === "n") {
        if (v2type === "n") {
            result = Number(value1.value) === Number(value2.value) ? 1 : 0;
        } else if (v2type === "b") {
            result = 0;
        } else if (v2type === "t") {
            result = `${value1.value}` === value2.value ? 1 : 0;
        } else if (v2type === "e") {
            result = value2.value;
            resulttype = value2.type;
        } else {
            result = 0;
        }
    } else if (v1type === "b") {
        if (v2type === "t") {
            result = value2.value.length ? 0 : 1;
        } else if (v2type === "b") {
            result = 1;
        } else if (v2type === "n") {
            result = 0;
        } else if (v2type === "e") {
            result = value2.value;
            resulttype = value2.type;
        } else {
            result = 0;
        }
    } else if (v1type === "e") {
        result = value1.value;
        resulttype = value1.type;
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Argument list definitions for string functions
 * @type {Object<string, number[]>}
 * 
 * Array for each function, one entry for each possible arg (up to max).
 * If array element is 1 then it's a text argument, if it's 0 then it's numeric, if -1 then get whatever's there
 * Text values are manipulated as UTF-8, converting from and back to byte strings
 */
SocialCalc.Formula.ArgList = {
    FIND: [1, 1, 0],
    LEFT: [1, 0],
    LEN: [1],
    LOWER: [1],
    MID: [1, 0, 0],
    PROPER: [1],
    REPLACE: [1, 0, 0, 1],
    REPT: [1, 0],
    RIGHT: [1, 0],
    SUBSTITUTE: [1, 1, 1, 0],
    TRIM: [1],
    UPPER: [1],
};

/**
 * @description Implements various string manipulation functions
 * @param {string} fname - Function name (FIND, LEFT, LEN, etc.)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.StringFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype = "e#VALUE!";

    let numargs = foperand.length;
    let argdef = scf.ArgList[fname];
    let operand_value = [];
    let operand_type = [];

    // Process arguments according to function definition
    for (let i = 1; i <= numargs; i++) {
        if (i > argdef.length) {
            return scf.FunctionArgsError(fname, operand);
        }

        let value;
        if (argdef[i - 1] === 0) {
            value = scf.OperandAsNumber(sheet, foperand);
        } else if (argdef[i - 1] === 1) {
            value = scf.OperandAsText(sheet, foperand);
        } else if (argdef[i - 1] === -1) {
            value = scf.OperandValueAndType(sheet, foperand);
        }

        operand_value[i] = value.value;
        operand_type[i] = value.type;

        // Check for errors
        if (value.type.charAt(0) === "e") {
            scf.PushOperand(operand, value.type, result);
            return null;
        }
    }

    // Execute specific string function
    switch (fname) {
        case "FIND":
            let offset = operand_type[3] ? operand_value[3] - 1 : 0;
            if (offset < 0) {
                result = "Start is before string";
            } else {
                result = operand_value[2].indexOf(operand_value[1], offset);
                if (result >= 0) {
                    result += 1;
                    resulttype = "n";
                } else {
                    result = "Not found";
                }
            }
            break;

        case "LEFT":
            let leftLen = operand_type[2] ? operand_value[2] : 1;
            if (leftLen < 0) {
                result = "Negative length";
            } else {
                result = operand_value[1].substring(0, leftLen);
                resulttype = "t";
            }
            break;

        case "LEN":
            result = operand_value[1].length;
            resulttype = "n";
            break;

        case "LOWER":
            result = operand_value[1].toLowerCase();
            resulttype = "t";
            break;

        case "MID":
            let start = operand_value[2];
            let len = operand_value[3];
            if (len < 1 || start < 1) {
                result = "Bad arguments";
            } else {
                result = operand_value[1].substring(start - 1, start + len - 1);
                resulttype = "t";
            }
            break;

        case "PROPER":
            // Uppercase first character of words
            result = operand_value[1].replace(/\b\w+\b/g, (word) => {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            resulttype = "t";
            break;

        case "REPLACE":
            let replaceStart = operand_value[2];
            let replaceLen = operand_value[3];
            if (replaceLen < 0 || replaceStart < 1) {
                result = "Bad arguments";
            } else {
                result = operand_value[1].substring(0, replaceStart - 1) +
                    operand_value[4] +
                    operand_value[1].substring(replaceStart - 1 + replaceLen);
                resulttype = "t";
            }
            break;

        case "REPT":
            let count = operand_value[2];
            if (count < 0) {
                result = "Negative count";
            } else {
                result = operand_value[1].repeat(count);
                resulttype = "t";
            }
            break;

        case "RIGHT":
            let rightLen = operand_type[2] ? operand_value[2] : 1;
            if (rightLen < 0) {
                result = "Negative length";
            } else {
                result = operand_value[1].slice(-rightLen);
                resulttype = "t";
            }
            break;

        case "SUBSTITUTE":
            let fulltext = operand_value[1];
            let oldtext = operand_value[2];
            let newtext = operand_value[3];
            let which = 0;

            if (operand_value[4] != null) {
                which = operand_value[4];
                if (which <= 0) {
                    result = "Non-positive instance number";
                    break;
                }
            }

            let substCount = 0;
            let oldpos = 0;
            result = "";

            while (true) {
                let pos = fulltext.indexOf(oldtext, oldpos);
                if (pos >= 0) {
                    substCount++;
                    result += fulltext.substring(oldpos, pos);

                    if (which === 0) {
                        result += newtext; // Substitute all
                    } else if (which === substCount) {
                        result += newtext + fulltext.substring(pos + oldtext.length);
                        break;
                    } else {
                        result += oldtext; // Leave as was
                    }
                    oldpos = pos + oldtext.length;
                } else {
                    result += fulltext.substring(oldpos);
                    break;
                }
            }
            resulttype = "t";
            break;

        case "TRIM":
            result = operand_value[1]
                .replace(/^ */, "")      // Remove leading spaces
                .replace(/ *$/, "")      // Remove trailing spaces
                .replace(/ +/g, " ");    // Replace multiple spaces with single
            resulttype = "t";
            break;

        case "UPPER":
            result = operand_value[1].toUpperCase();
            resulttype = "t";
            break;
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// FUNCTION REGISTRATION
// =============================================================================

// Register logical and conditional functions
let logicalFunctions = {
    "IF": [SocialCalc.Formula.IfFunction, 3, "iffunc", "", "test"],
};

// Register date and time functions
let dateTimeFunctions = {
    "DATE": [SocialCalc.Formula.DateFunction, 3, "date", "", "datetime"],
    "TIME": [SocialCalc.Formula.TimeFunction, 3, "hms", "", "datetime"],
    "DAY": [SocialCalc.Formula.DMYFunctions, 1, "v", "", "datetime"],
    "MONTH": [SocialCalc.Formula.DMYFunctions, 1, "v", "", "datetime"],
    "YEAR": [SocialCalc.Formula.DMYFunctions, 1, "v", "", "datetime"],
    "WEEKDAY": [SocialCalc.Formula.DMYFunctions, -1, "weekday", "", "datetime"],
    "HOUR": [SocialCalc.Formula.HMSFunctions, 1, "v", "", "datetime"],
    "MINUTE": [SocialCalc.Formula.HMSFunctions, 1, "v", "", "datetime"],
    "SECOND": [SocialCalc.Formula.HMSFunctions, 1, "v", "", "datetime"],
};

// Register text functions
let textFunctions = {
    "EXACT": [SocialCalc.Formula.ExactFunction, 2, "", "", "text"],
    "FIND": [SocialCalc.Formula.StringFunctions, -2, "find", "", "text"],
    "LEFT": [SocialCalc.Formula.StringFunctions, -1, "tc", "", "text"],
    "LEN": [SocialCalc.Formula.StringFunctions, 1, "txt", "", "text"],
    "LOWER": [SocialCalc.Formula.StringFunctions, 1, "txt", "", "text"],
    "MID": [SocialCalc.Formula.StringFunctions, 3, "mid", "", "text"],
    "PROPER": [SocialCalc.Formula.StringFunctions, 1, "v", "", "text"],
    "REPLACE": [SocialCalc.Formula.StringFunctions, 4, "replace", "", "text"],
    "REPT": [SocialCalc.Formula.StringFunctions, 2, "tc", "", "text"],
    "RIGHT": [SocialCalc.Formula.StringFunctions, -1, "tc", "", "text"],
    "SUBSTITUTE": [SocialCalc.Formula.StringFunctions, -3, "subs", "", "text"],
    "TRIM": [SocialCalc.Formula.StringFunctions, 1, "v", "", "text"],
    "UPPER": [SocialCalc.Formula.StringFunctions, 1, "v", "", "text"],
};
// =============================================================================
// TYPE CHECKING AND VALIDATION FUNCTIONS
// =============================================================================

/**
 * @description Implements various IS functions for type checking and validation
 * @param {string} fname - Function name (ISBLANK, ISERR, ISERROR, etc.)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * Supported functions:
 * ISBLANK(value) - Returns TRUE if value is a blank cell reference
 * ISERR(value) - Returns TRUE if value is an error (except #N/A)
 * ISERROR(value) - Returns TRUE if value is any error type
 * ISLOGICAL(value) - Returns TRUE if value is logical (TRUE/FALSE)
 * ISNA(value) - Returns TRUE if value is #N/A error
 * ISNONTEXT(value) - Returns TRUE if value is not text
 * ISNUMBER(value) - Returns TRUE if value is numeric
 * ISTEXT(value) - Returns TRUE if value is text
 */
SocialCalc.Formula.IsFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype = "nl"; // Logical result

    let value = scf.OperandValueAndType(sheet, foperand);
    let t = value.type.charAt(0);

    switch (fname) {
        case "ISBLANK":
            result = value.type === "b" ? 1 : 0;
            break;

        case "ISERR":
            // Error but not #N/A
            result = (t === "e" && value.type !== "e#N/A") ? 1 : 0;
            break;

        case "ISERROR":
            // Any error type
            result = t === "e" ? 1 : 0;
            break;

        case "ISLOGICAL":
            // Logical value (TRUE/FALSE)
            result = value.type === "nl" ? 1 : 0;
            break;

        case "ISNA":
            // #N/A error specifically
            result = value.type === "e#N/A" ? 1 : 0;
            break;

        case "ISNONTEXT":
            // Not text type
            result = t !== "t" ? 1 : 0;
            break;

        case "ISNUMBER":
            // Numeric type
            result = t === "n" ? 1 : 0;
            break;

        case "ISTEXT":
            // Text type
            result = t === "t" ? 1 : 0;
            break;
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// VALUE CONVERSION FUNCTIONS
// =============================================================================

/**
 * @description Implements N, T, and VALUE functions for type conversion
 * @param {string} fname - Function name (N, T, VALUE)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * N(value) - Converts value to number (0 if not numeric)
 * T(value) - Converts value to text (empty string if not text)
 * VALUE(value) - Converts text that looks like number to number
 */
SocialCalc.Formula.NTVFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype = "e#VALUE!";

    let value = scf.OperandValueAndType(sheet, foperand);
    let t = value.type.charAt(0);

    switch (fname) {
        case "N":
            // Convert to number, 0 if not numeric
            result = t === "n" ? Number(value.value) : 0;
            resulttype = "n";
            break;

        case "T":
            // Convert to text, empty string if not text
            result = t === "t" ? `${value.value}` : "";
            resulttype = "t";
            break;

        case "VALUE":
            // Convert text representation of number to actual number
            if (t === "n" || t === "b") {
                result = value.value || 0;
                resulttype = "n";
            } else if (t === "t") {
                let parsedValue = SocialCalc.DetermineValueType
                    ? SocialCalc.DetermineValueType(value.value)
                    : { value: Number(value.value), type: "n" };

                if (parsedValue.type.charAt(0) !== "n") {
                    result = 0;
                    resulttype = "e#VALUE!";
                } else {
                    result = Number(parsedValue.value);
                    resulttype = "n";
                }
            }
            break;
    }

    // Error values trump all other processing
    if (t === "e") {
        resulttype = value.type;
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// MATHEMATICAL FUNCTIONS (SINGLE ARGUMENT)
// =============================================================================

/**
 * @description Implements single-argument mathematical functions
 * @param {string} fname - Function name (ABS, ACOS, ASIN, etc.)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * Supported functions:
 * ABS, ACOS, ASIN, ATAN, COS, DEGREES, EVEN, EXP, FACT, INT, LN, LOG10,
 * ODD, RADIANS, SIN, SQRT, TAN
 */
SocialCalc.Formula.Math1Functions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = {};

    let v1 = scf.OperandAsNumber(sheet, foperand);
    let value = v1.value;
    result.type = scf.LookupResultType(v1.type, v1.type, scf.TypeLookupTable.oneargnumeric);

    if (result.type === "n") {
        switch (fname) {
            case "ABS":
                value = Math.abs(value);
                break;

            case "ACOS":
                if (value >= -1 && value <= 1) {
                    value = Math.acos(value);
                } else {
                    result.type = "e#NUM!";
                }
                break;

            case "ASIN":
                if (value >= -1 && value <= 1) {
                    value = Math.asin(value);
                } else {
                    result.type = "e#NUM!";
                }
                break;

            case "ATAN":
                value = Math.atan(value);
                break;

            case "COS":
                value = Math.cos(value);
                break;

            case "DEGREES":
                value = (value * 180) / Math.PI;
                break;

            case "EVEN":
                // Round to next even integer
                let absValue = Math.abs(value);
                let evenValue;
                if (absValue !== Math.floor(absValue)) {
                    // Not an integer - round up to next even
                    evenValue = Math.floor(absValue + 1) + (Math.floor(absValue + 1) % 2);
                } else {
                    // Integer - add 1 if odd to make even
                    evenValue = absValue + (absValue % 2);
                }
                value = v1.value < 0 ? -evenValue : evenValue;
                break;

            case "EXP":
                value = Math.exp(value);
                break;

            case "FACT":
                // Calculate factorial
                let f = 1;
                let intValue = Math.floor(value);
                for (let i = intValue; i > 0; i--) {
                    f *= i;
                }
                value = f;
                break;

            case "INT":
                // Spreadsheet INT is floor(), not truncation
                value = Math.floor(value);
                break;

            case "LN":
                if (value <= 0) {
                    result.type = "e#NUM!";
                    result.error = SocialCalc.Constants?.s_sheetfunclnarg;
                } else {
                    value = Math.log(value);
                }
                break;

            case "LOG10":
                if (value <= 0) {
                    result.type = "e#NUM!";
                    result.error = SocialCalc.Constants?.s_sheetfunclog10arg;
                } else {
                    value = Math.log(value) / Math.log(10);
                }
                break;

            case "ODD":
                // Round to next odd integer
                let absValueOdd = Math.abs(value);
                let oddValue;
                if (absValueOdd !== Math.floor(absValueOdd)) {
                    // Not an integer - round up to next odd
                    oddValue = Math.floor(absValueOdd + 1) + (1 - (Math.floor(absValueOdd + 1) % 2));
                } else {
                    // Integer - add 1 if even to make odd
                    oddValue = absValueOdd + (1 - (absValueOdd % 2));
                }
                value = v1.value < 0 ? -oddValue : oddValue;
                break;

            case "RADIANS":
                value = (value * Math.PI) / 180;
                break;

            case "SIN":
                value = Math.sin(value);
                break;

            case "SQRT":
                if (value >= 0) {
                    value = Math.sqrt(value);
                } else {
                    result.type = "e#NUM!";
                }
                break;

            case "TAN":
                if (Math.cos(value) !== 0) {
                    value = Math.tan(value);
                } else {
                    result.type = "e#NUM!";
                }
                break;
        }
    }

    result.value = value;
    operand.push(result);
    return null;
};

// =============================================================================
// FUNCTION REGISTRATION
// =============================================================================

// Register IS functions (type checking)
let isFunctions = {
    "ISBLANK": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISERR": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISERROR": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISLOGICAL": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISNA": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISNONTEXT": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISNUMBER": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
    "ISTEXT": [SocialCalc.Formula.IsFunctions, 1, "v", "", "test"],
};

// Register conversion functions
let conversionFunctions = {
    "N": [SocialCalc.Formula.NTVFunctions, 1, "v", "", "math"],
    "T": [SocialCalc.Formula.NTVFunctions, 1, "v", "", "text"],
    "VALUE": [SocialCalc.Formula.NTVFunctions, 1, "v", "", "text"],
};

// Register mathematical functions
let mathFunctions = {
    "ABS": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "ACOS": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "ASIN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "ATAN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "COS": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "DEGREES": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "EVEN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "EXP": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "FACT": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "INT": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "LN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "LOG10": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "ODD": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "RADIANS": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "SIN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "SQRT": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
    "TAN": [SocialCalc.Formula.Math1Functions, 1, "v", "", "math"],
};

// =============================================================================
// TWO-ARGUMENT MATHEMATICAL FUNCTIONS
// =============================================================================

/**
 * @description Implements two-argument mathematical functions
 * @param {string} fname - Function name (ATAN2, MOD, POWER, TRUNC)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * ATAN2(x, y) - Returns arctangent of y/x in radians
 * MOD(a, b) - Returns remainder after division (modulo operation)
 * POWER(a, b) - Returns a raised to the power of b
 * TRUNC(value, precision) - Truncates number to specified decimal places
 */
SocialCalc.Formula.Math2Functions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = {};

    let xval = scf.OperandAsNumber(sheet, foperand);
    let yval = scf.OperandAsNumber(sheet, foperand);

    result.type = scf.LookupResultType(xval.type, yval.type, scf.TypeLookupTable.twoargnumeric);

    if (result.type === "n") {
        switch (fname) {
            case "ATAN2":
                if (xval.value === 0 && yval.value === 0) {
                    result.type = "e#DIV/0!";
                } else {
                    result.value = Math.atan2(yval.value, xval.value);
                }
                break;

            case "POWER":
                result.value = Math.pow(xval.value, yval.value);
                if (isNaN(result.value)) {
                    result.value = 0;
                    result.type = "e#NUM!";
                }
                break;

            case "MOD":
                // Modulo operation as per Wikipedia modulo operation standard
                if (yval.value === 0) {
                    result.type = "e#DIV/0!";
                } else {
                    let quotient = Math.floor(xval.value / yval.value);
                    result.value = xval.value - quotient * yval.value;
                }
                break;

            case "TRUNC":
                // Truncate to specified decimal places
                let decimalscale = 1;
                let precision = Math.floor(Math.abs(yval.value));

                for (let i = 0; i < precision; i++) {
                    decimalscale *= 10;
                }

                if (yval.value >= 0) {
                    // Positive precision - truncate decimal places
                    result.value = Math.floor(Math.abs(xval.value) * decimalscale) / decimalscale;
                } else {
                    // Negative precision - truncate to left of decimal
                    result.value = Math.floor(Math.abs(xval.value) / decimalscale) * decimalscale;
                }

                // Apply original sign
                if (xval.value < 0) {
                    result.value = -result.value;
                }
                break;
        }
    }

    operand.push(result);
    return null;
};

/**
 * @description Implements LOG function with optional base parameter
 * @param {string} fname - Function name (LOG)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * LOG(value, [base]) - Returns logarithm of value to specified base (default e)
 */
SocialCalc.Formula.LogFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = {};

    result.value = 0;

    let value = scf.OperandAsNumber(sheet, foperand);
    result.type = scf.LookupResultType(value.type, value.type, scf.TypeLookupTable.oneargnumeric);

    let value2;
    if (foperand.length === 1) {
        // Base parameter provided
        value2 = scf.OperandAsNumber(sheet, foperand);
        if (value2.type.charAt(0) !== "n" || value2.value <= 0) {
            return scf.FunctionSpecificError(
                fname,
                operand,
                "e#NUM!",
                SocialCalc.Constants.s_sheetfunclogsecondarg
            );
        }
    } else if (foperand.length !== 0) {
        return scf.FunctionArgsError(fname, operand);
    } else {
        // Default base is e (natural logarithm)
        value2 = { value: Math.E, type: "n" };
    }

    if (result.type === "n") {
        if (value.value <= 0) {
            return scf.FunctionSpecificError(
                fname,
                operand,
                "e#NUM!",
                SocialCalc.Constants.s_sheetfunclogfirstarg
            );
        }
        result.value = Math.log(value.value) / Math.log(value2.value);
    }

    operand.push(result);
    return null;
};

/**
 * @description Implements ROUND function with optional precision parameter
 * @param {string} fname - Function name (ROUND)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * ROUND(value, [precision]) - Rounds value to specified decimal places (default 0)
 */
SocialCalc.Formula.RoundFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;

    let value = scf.OperandValueAndType(sheet, foperand);
    let resulttype = scf.LookupResultType(value.type, value.type, scf.TypeLookupTable.oneargnumeric);

    let value2;
    if (foperand.length === 1) {
        // Precision parameter provided
        value2 = scf.OperandValueAndType(sheet, foperand);
        if (value2.type.charAt(0) !== "n") {
            return scf.FunctionSpecificError(
                fname,
                operand,
                "e#NUM!",
                SocialCalc.Constants.s_sheetfuncroundsecondarg
            );
        }
    } else if (foperand.length !== 0) {
        return scf.FunctionArgsError(fname, operand);
    } else {
        // Default precision is 0 (round to integer)
        value2 = { value: 0, type: "n" };
    }

    if (resulttype === "n") {
        let precision = Number(value2.value);

        if (precision === 0) {
            result = Math.round(value.value);
        } else if (precision > 0) {
            // Round to decimal places
            let decimalscale = 1;
            let precisionInt = Math.floor(precision);
            for (let i = 0; i < precisionInt; i++) {
                decimalscale *= 10;
            }
            let scaledvalue = Math.round(value.value * decimalscale);
            result = scaledvalue / decimalscale;
        } else {
            // Round to left of decimal point
            let decimalscale = 1;
            let precisionInt = Math.floor(-precision);
            for (let i = 0; i < precisionInt; i++) {
                decimalscale *= 10;
            }
            let scaledvalue = Math.round(value.value / decimalscale);
            result = scaledvalue * decimalscale;
        }
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// LOGICAL FUNCTIONS (AND/OR)
// =============================================================================

/**
 * @description Implements AND and OR logical functions
 * @param {string} fname - Function name (AND, OR)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * AND(v1, v2, ...) - Returns TRUE if all arguments are TRUE
 * OR(v1, v2, ...) - Returns TRUE if any argument is TRUE
 */
SocialCalc.Formula.AndOrFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let resulttype = "";

    // Initialize result based on function type
    let result = fname === "AND" ? 1 : 0;

    while (foperand.length) {
        let value1 = scf.OperandValueAndType(sheet, foperand);

        if (value1.type.charAt(0) === "n") {
            let numValue = Number(value1.value);

            if (fname === "AND") {
                // AND: result is 0 (FALSE) if any value is 0 (FALSE)
                result = numValue !== 0 ? result : 0;
            } else if (fname === "OR") {
                // OR: result is 1 (TRUE) if any value is non-zero (TRUE)
                result = numValue !== 0 ? 1 : result;
            }

            resulttype = scf.LookupResultType(
                value1.type,
                resulttype || "nl",
                scf.TypeLookupTable.propagateerror
            );
        } else if (value1.type.charAt(0) === "e" && resulttype.charAt(0) !== "e") {
            // Propagate errors
            resulttype = value1.type;
        }
    }

    // If no valid arguments were processed
    if (resulttype.length < 1) {
        resulttype = "e#VALUE!";
        result = 0;
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// FUNCTION REGISTRATION
// =============================================================================

// Register two-argument math functions
let math2Functions = {
    "ATAN2": [SocialCalc.Formula.Math2Functions, 2, "xy", "", "math"],
    "MOD": [SocialCalc.Formula.Math2Functions, 2, "", "", "math"],
    "POWER": [SocialCalc.Formula.Math2Functions, 2, "", "", "math"],
    "TRUNC": [SocialCalc.Formula.Math2Functions, 2, "valpre", "", "math"],
};

// Register logarithmic and rounding functions
let advancedMathFunctions = {
    "LOG": [SocialCalc.Formula.LogFunction, -1, "log", "", "math"],
    "ROUND": [SocialCalc.Formula.RoundFunction, -1, "vp", "", "math"],
};

// Register logical functions
let logicalAdvancedFunctions = {
    "AND": [SocialCalc.Formula.AndOrFunctions, -1, "vn", "", "test"],
    "OR": [SocialCalc.Formula.AndOrFunctions, -1, "vn", "", "test"],
};
// =============================================================================
// ADDITIONAL LOGICAL AND UTILITY FUNCTIONS
// =============================================================================

/**
 * @description Implements NOT function for logical negation
 * @param {string} fname - Function name (NOT)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * NOT(value) - Returns the opposite of the logical value
 */
SocialCalc.Formula.NotFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;

    let value = scf.OperandValueAndType(sheet, foperand);
    let resulttype = scf.LookupResultType(value.type, value.type, scf.TypeLookupTable.propagateerror);

    if (value.type.charAt(0) === "n" || value.type === "b") {
        // Perform the "not" operation
        result = Number(value.value) !== 0 ? 0 : 1;
        resulttype = "nl";
    } else if (value.type.charAt(0) === "t") {
        resulttype = "e#VALUE!";
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Implements CHOOSE function for selecting from multiple values
 * @param {string} fname - Function name (CHOOSE)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * CHOOSE(index, value1, value2, ...) - Returns value at specified index position
 */
SocialCalc.Formula.ChooseFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype;

    let cindex = scf.OperandAsNumber(sheet, foperand);

    // Ensure index is a valid integer
    let indexValue = cindex.type.charAt(0) === "n" ? Math.floor(cindex.value) : 0;

    let count = 0;
    while (foperand.length) {
        let value1 = scf.TopOfStackValueAndType(sheet, foperand);
        count += 1;
        if (indexValue === count) {
            result = value1.value;
            resulttype = value1.type;
            break;
        }
    }

    if (resulttype) {
        scf.PushOperand(operand, resulttype, result);
    } else {
        scf.PushOperand(operand, "e#VALUE!", 0);
    }

    return null;
};

/**
 * @description Implements COLUMNS and ROWS functions for range dimensions
 * @param {string} fname - Function name (COLUMNS, ROWS)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * COLUMNS(range) - Returns number of columns in range
 * ROWS(range) - Returns number of rows in range
 */
SocialCalc.Formula.ColumnsRowsFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let result = 0;
    let resulttype;

    let value1 = scf.TopOfStackValueAndType(sheet, foperand);

    if (value1.type === "coord") {
        result = 1;
        resulttype = "n";
    } else if (value1.type === "range") {
        let rangeinfo = scf.DecodeRangeParts(sheet, value1.value);
        if (fname === "COLUMNS") {
            result = rangeinfo.ncols;
        } else if (fname === "ROWS") {
            result = rangeinfo.nrows;
        }
        resulttype = "n";
    } else {
        result = 0;
        resulttype = "e#VALUE!";
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

/**
 * @description Implements zero-argument functions returning constants or current values
 * @param {string} fname - Function name (FALSE, NA, NOW, PI, TODAY, TRUE)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 */
SocialCalc.Formula.ZeroArgFunctions = (fname, operand, foperand, sheet) => {
    let result = { value: 0 };

    switch (fname) {
        case "FALSE":
            result.type = "nl";
            result.value = 0;
            break;

        case "NA":
            result.type = "e#N/A";
            break;

        case "NOW":
            // Current date and time
            let nowDate = new Date();
            let tzOffset = nowDate.getTimezoneOffset();
            let startVal = nowDate.getTime() / 1000; // Convert to seconds
            let start_1_1_1970 = 25569; // Day number of 1/1/1970 starting with 1/1/1900 as 1
            let secondsInDay = 24 * 60 * 60;
            let nowDays = start_1_1_1970 + startVal / secondsInDay - tzOffset / (24 * 60);
            result.value = nowDays;
            result.type = "ndt";
            SocialCalc.Formula.FreshnessInfo.volatile.NOW = true; // Mark as volatile
            break;

        case "PI":
            result.type = "n";
            result.value = Math.PI;
            break;

        case "TODAY":
            // Current date (without time)
            let todayDate = new Date();
            let todayTzOffset = todayDate.getTimezoneOffset();
            let todayStartVal = todayDate.getTime() / 1000;
            let todayStart_1_1_1970 = 25569;
            let todaySecondsInDay = 24 * 60 * 60;
            let todayDays = todayStart_1_1_1970 + todayStartVal / todaySecondsInDay - todayTzOffset / (24 * 60);
            result.value = Math.floor(todayDays);
            result.type = "nd";
            SocialCalc.Formula.FreshnessInfo.volatile.TODAY = true; // Mark as volatile
            break;

        case "TRUE":
            result.type = "nl";
            result.value = 1;
            break;
    }

    operand.push(result);
    return null;
};

// =============================================================================
// FINANCIAL FUNCTIONS
// =============================================================================

/**
 * @description Double-declining balance depreciation
 * @param {string} fname - Function name (DDB)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * DDB(cost, salvage, lifetime, period, [method])
 * Method defaults to 2 for double-declining balance
 * See: http://en.wikipedia.org/wiki/Depreciation
 */
SocialCalc.Formula.DDBFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let cost = scf.OperandAsNumber(sheet, foperand);
    let salvage = scf.OperandAsNumber(sheet, foperand);
    let lifetime = scf.OperandAsNumber(sheet, foperand);
    let period = scf.OperandAsNumber(sheet, foperand);

    if (scf.CheckForErrorValue(operand, cost)) return null;
    if (scf.CheckForErrorValue(operand, salvage)) return null;
    if (scf.CheckForErrorValue(operand, lifetime)) return null;
    if (scf.CheckForErrorValue(operand, period)) return null;

    if (lifetime.value < 1) {
        return scf.FunctionSpecificError(
            fname,
            operand,
            "e#NUM!",
            SocialCalc.Constants.s_sheetfuncddblife
        );
    }

    let method = { value: 2, type: "n" };
    if (foperand.length > 0) {
        method = scf.OperandAsNumber(sheet, foperand);
    }
    if (foperand.length !== 0) {
        return scf.FunctionArgsError(fname, operand);
    }
    if (scf.CheckForErrorValue(operand, method)) return null;

    // Calculate depreciation for each period
    let depreciation = 0;
    let accumulatedDepreciation = 0;

    for (let i = 1; i <= period.value && i <= lifetime.value; i++) {
        depreciation = (cost.value - accumulatedDepreciation) * (method.value / lifetime.value);
        if (cost.value - accumulatedDepreciation - depreciation < salvage.value) {
            // Don't go lower than salvage value
            depreciation = cost.value - accumulatedDepreciation - salvage.value;
        }
        accumulatedDepreciation += depreciation;
    }

    scf.PushOperand(operand, "n$", depreciation);
    return null;
};

/**
 * @description Straight-line depreciation
 * @param {string} fname - Function name (SLN)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * SLN(cost, salvage, lifetime)
 * Depreciation for each period by straight-line method
 */
SocialCalc.Formula.SLNFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let cost = scf.OperandAsNumber(sheet, foperand);
    let salvage = scf.OperandAsNumber(sheet, foperand);
    let lifetime = scf.OperandAsNumber(sheet, foperand);

    if (scf.CheckForErrorValue(operand, cost)) return null;
    if (scf.CheckForErrorValue(operand, salvage)) return null;
    if (scf.CheckForErrorValue(operand, lifetime)) return null;

    if (lifetime.value < 1) {
        return scf.FunctionSpecificError(
            fname,
            operand,
            "e#NUM!",
            SocialCalc.Constants.s_sheetfuncslnlife
        );
    }

    let depreciation = (cost.value - salvage.value) / lifetime.value;
    scf.PushOperand(operand, "n$", depreciation);
    return null;
};

/**
 * @description Sum-of-years' digits depreciation
 * @param {string} fname - Function name (SYD)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * SYD(cost, salvage, lifetime, period)
 * Depreciation by Sum of Year's Digits method
 */
SocialCalc.Formula.SYDFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let cost = scf.OperandAsNumber(sheet, foperand);
    let salvage = scf.OperandAsNumber(sheet, foperand);
    let lifetime = scf.OperandAsNumber(sheet, foperand);
    let period = scf.OperandAsNumber(sheet, foperand);

    if (scf.CheckForErrorValue(operand, cost)) return null;
    if (scf.CheckForErrorValue(operand, salvage)) return null;
    if (scf.CheckForErrorValue(operand, lifetime)) return null;
    if (scf.CheckForErrorValue(operand, period)) return null;

    if (lifetime.value < 1 || period.value <= 0) {
        scf.PushOperand(operand, "e#NUM!", 0);
        return null;
    }

    // Sum of years: 1 + 2 + ... + lifetime
    let sumPeriods = ((lifetime.value + 1) * lifetime.value) / 2;
    let depreciation = ((cost.value - salvage.value) * (lifetime.value - period.value + 1)) / sumPeriods;

    scf.PushOperand(operand, "n$", depreciation);
    return null;
};

/**
 * @description Financial interest functions (FV, NPER, PMT, PV, RATE)
 * @param {string} fname - Function name
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * Following the Open Document Format formula specification for financial calculations
 */
SocialCalc.Formula.InterestFunctions = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let aval = scf.OperandAsNumber(sheet, foperand);
    let bval = scf.OperandAsNumber(sheet, foperand);
    let cval = scf.OperandAsNumber(sheet, foperand);

    let resulttype = scf.LookupResultType(aval.type, bval.type, scf.TypeLookupTable.twoargnumeric);
    resulttype = scf.LookupResultType(resulttype, cval.type, scf.TypeLookupTable.twoargnumeric);

    let dval, evalue, fval;
    if (foperand.length) {
        dval = scf.OperandAsNumber(sheet, foperand);
        resulttype = scf.LookupResultType(resulttype, dval.type, scf.TypeLookupTable.twoargnumeric);
        if (foperand.length) {
            evalue = scf.OperandAsNumber(sheet, foperand);
            resulttype = scf.LookupResultType(resulttype, evalue.type, scf.TypeLookupTable.twoargnumeric);
            if (foperand.length) {
                if (fname !== "RATE") {
                    return scf.FunctionArgsError(fname, operand);
                }
                fval = scf.OperandAsNumber(sheet, foperand);
                resulttype = scf.LookupResultType(resulttype, fval.type, scf.TypeLookupTable.twoargnumeric);
            }
        }
    }

    let result = 0;
    if (resulttype === "n") {
        let rate, n, payment, pv, fv, paytype, guess;

        switch (fname) {
            case "FV": // FV(rate, n, payment, [pv, [paytype]])
                rate = aval.value;
                n = bval.value;
                payment = cval.value;
                pv = dval?.value || 0;
                paytype = evalue?.value ? 1 : 0;

                if (rate === 0) {
                    fv = -pv - payment * n;
                } else {
                    fv = -(pv * Math.pow(1 + rate, n) +
                        (payment * (1 + rate * paytype) * (Math.pow(1 + rate, n) - 1)) / rate);
                }
                result = fv;
                resulttype = "n$";
                break;

            case "PMT": // PMT(rate, n, pv, [fv, [paytype]])
                rate = aval.value;
                n = bval.value;
                pv = cval.value;
                fv = dval?.value || 0;
                paytype = evalue?.value ? 1 : 0;

                if (n === 0) {
                    scf.PushOperand(operand, "e#NUM!", 0);
                    return null;
                } else if (rate === 0) {
                    payment = (fv - pv) / n;
                } else {
                    payment = (0 - fv - pv * Math.pow(1 + rate, n)) /
                        (((1 + rate * paytype) * (Math.pow(1 + rate, n) - 1)) / rate);
                }
                result = payment;
                resulttype = "n$";
                break;
            // Completing the InterestFunctions with remaining cases

            case "PV": // PV(rate, n, payment, [fv, [paytype]])
                rate = aval.value;
                n = bval.value;
                payment = cval.value;
                fv = dval?.value || 0;
                paytype = evalue?.value ? 1 : 0; // Fixed: was eval.value (typo)

                if (rate === -1) {
                    scf.PushOperand(operand, "e#DIV/0!", 0);
                    return null;
                } else if (rate === 0) {
                    // Simple calculation if no interest
                    pv = -fv - payment * n;
                } else {
                    pv = (-fv - (payment * (1 + rate * paytype) * (Math.pow(1 + rate, n) - 1)) / rate) /
                        Math.pow(1 + rate, n);
                }
                result = pv;
                resulttype = "n$";
                break;

            case "RATE": // RATE(n, payment, pv, [fv, [paytype, [guess]]])
                n = aval.value;
                payment = bval.value;
                pv = cval.value;
                fv = dval?.value || 0;
                paytype = evalue?.value ? 1 : 0;
                guess = fval?.value || 0.1;

                // Rate is calculated by repeated approximations
                // The deltas are used to calculate new guesses
                let maxloop = 100;
                let tries = 0;
                let delta = 1;
                let epsilon = 0.0000001; // Close enough convergence
                rate = guess || 0.00000001; // Zero is not allowed
                let oldrate, olddelta;

                while (Math.abs(delta) > epsilon && rate !== oldrate) {
                    delta = fv + pv * Math.pow(1 + rate, n) +
                        (payment * (1 + rate * paytype) * (Math.pow(1 + rate, n) - 1)) / rate;

                    if (olddelta != null) {
                        let m = (delta - olddelta) / (rate - oldrate) || 0.001; // Get slope (not zero)
                        oldrate = rate;
                        rate = rate - delta / m; // Look for zero crossing
                        olddelta = delta;
                    } else {
                        // First time - no old values
                        oldrate = rate;
                        rate = 1.1 * rate;
                        olddelta = delta;
                    }

                    tries++;
                    if (tries >= maxloop) {
                        // Didn't converge yet
                        scf.PushOperand(operand, "e#NUM!", 0);
                        return null;
                    }
                }
                result = rate;
                resulttype = "n%";
                break;
        }
    }

    scf.PushOperand(operand, resulttype, result);
    return null;
};

// =============================================================================
// ADDITIONAL FINANCIAL FUNCTIONS
// =============================================================================

/**
 * @description Net Present Value calculation
 * @param {string} fname - Function name (NPV)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * NPV(rate, value1, value2, ...) - Calculates net present value of cash flows
 */
SocialCalc.Formula.NPVFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;

    let rate = scf.OperandAsNumber(sheet, foperand);
    if (scf.CheckForErrorValue(operand, rate)) return null;

    let sum = 0;
    let resulttypenpv = "n";
    let factor = 1;

    while (foperand.length) {
        let value1 = scf.OperandValueAndType(sheet, foperand);
        if (value1.type.charAt(0) === "n") {
            factor *= 1 + rate.value;
            if (factor === 0) {
                scf.PushOperand(operand, "e#DIV/0!", 0);
                return null;
            }
            sum += value1.value / factor;
            resulttypenpv = scf.LookupResultType(
                value1.type,
                resulttypenpv || value1.type,
                scf.TypeLookupTable.plus
            );
        } else if (value1.type.charAt(0) === "e" && resulttypenpv.charAt(0) !== "e") {
            resulttypenpv = value1.type;
            break;
        }
    }

    if (resulttypenpv.charAt(0) === "n") {
        resulttypenpv = "n$";
    }

    scf.PushOperand(operand, resulttypenpv, sum);
    return null;
};

/**
 * @description Internal Rate of Return calculation
 * @param {string} fname - Function name (IRR)
 * @param {Array<Object>} operand - Main operand stack
 * @param {Array<Object>} foperand - Function operand stack
 * @param {Object} sheet - Sheet object containing cell data
 * @returns {string|null} Error text or null if successful
 * 
 * IRR(range, [guess]) - Calculates internal rate of return for cash flows
 */
SocialCalc.Formula.IRRFunction = (fname, operand, foperand, sheet) => {
    let scf = SocialCalc.Formula;
    let rangeoperand = [];
    let cashflows = [];

    rangeoperand.push(foperand.pop()); // First operand is a range

    // Get values from range for iterative approximations
    while (rangeoperand.length) {
        let value1 = scf.OperandValueAndType(sheet, rangeoperand);
        if (value1.type.charAt(0) === "n") {
            cashflows.push(value1.value);
        } else if (value1.type.charAt(0) === "e") {
            scf.PushOperand(operand, "e#VALUE!", 0);
            return null;
        }
    }

    if (!cashflows.length) {
        scf.PushOperand(operand, "e#NUM!", 0);
        return null;
    }

    let guess = { value: 0 };

    if (foperand.length) {
        // Guess is provided
        guess = scf.OperandAsNumber(sheet, foperand);
        if (guess.type.charAt(0) !== "n" && guess.type.charAt(0) !== "b") {
            scf.PushOperand(operand, "e#VALUE!", 0);
            return null;
        }
        if (foperand.length) {
            // Should be no more args
            return scf.FunctionArgsError(fname, operand);
        }
    }

    guess.value = guess.value || 0.1;

    // Rate is calculated by repeated approximations
    let maxloop = 20;
    let tries = 0;
    let epsilon = 0.0000001; // Close enough convergence
    let rate = guess.value;
    let sum = 1;
    let oldsum, oldrate;

    while (Math.abs(sum) > epsilon && rate !== oldrate) {
        sum = 0;
        let factor = 1;

        for (let i = 0; i < cashflows.length; i++) {
            factor *= 1 + rate;
            if (factor === 0) {
                scf.PushOperand(operand, "e#DIV/0!", 0);
                return null;
            }
            sum += cashflows[i] / factor;
        }

        if (oldsum != null) {
            let m = (sum - oldsum) / (rate - oldrate); // Get slope
            oldrate = rate;
            rate = rate - sum / m; // Look for zero crossing
            oldsum = sum;
        } else {
            // First time - no old values
            oldrate = rate;
            rate = 1.1 * rate;
            oldsum = sum;
        }

        tries++;
        if (tries >= maxloop) {
            // Didn't converge yet
            scf.PushOperand(operand, "e#NUM!", 0);
            return null;
        }
    }

    scf.PushOperand(operand, "n%", rate);
    return null;
};

// =============================================================================
// SHEET CACHE SYSTEM
// =============================================================================

/**
 * @description Sheet cache system for managing external sheet references
 * @type {Object}
 * 
 * Sheet data: Attributes are each sheet in the cache with values of an object with:
 * - sheet: sheet-obj (or null, meaning not found)
 * - recalcstate: constants.asloaded/recalcing/recalcdone
 * - name: name of sheet (in case just have object and don't know name)
 */
SocialCalc.Formula.SheetCache = {
    sheets: {},

    /**
     * @description Waiting for loading indicator
     * If sheet is not in cache, this is set to the sheetname being loaded
     * so it can be tested in the recalc loop to start load and then wait until restarted.
     * Reset to null before restarting.
     */
    waitingForLoading: null,

    /** @description Constants for setting sheets[*].recalcstate */
    constants: { asloaded: 0, recalcing: 1, recalcdone: 2 },

    /** @deprecated Use SocialCalc.RecalcInfo.LoadSheet instead */
    loadsheet: null,
};

/**
 * @description Finds and returns a sheet from the cache
 * @param {string} sheetname - Name of sheet to find
 * @returns {Object|null} SocialCalc.Sheet object or null if not available
 * 
 * Returns a SocialCalc.Sheet object corresponding to string sheetname
 * or null if the sheet is not available or in error.
 * Each sheet is loaded only once and then stored in a cache.
 * Loading is handled elsewhere, e.g., in the recalc loop.
 */
SocialCalc.Formula.FindInSheetCache = (sheetname) => {
    let sfsc = SocialCalc.Formula.SheetCache;
    let nsheetname = SocialCalc.Formula.NormalizeSheetName(sheetname); // Normalize different versions

    if (sfsc.sheets[nsheetname]) {
        // A sheet by that name is in the cache already
        return sfsc.sheets[nsheetname].sheet; // Return it
    }

    if (sfsc.waitingForLoading) {
        // Waiting already - only queue up one
        return null; // Return not found
    }

    sfsc.waitingForLoading = nsheetname; // Let recalc loop know that we have a sheet to load
    return null; // Return not found
};

/**
 * @description Adds a new sheet to the sheet cache
 * @param {string} sheetname - Name of sheet to add
 * @param {string} str - Sheet data as saved sheet string
 * @returns {Object|null} The sheet object filled out with the str
 */
SocialCalc.Formula.AddSheetToCache = (sheetname, str) => {
    let newsheet = null;
    let sfsc = SocialCalc.Formula.SheetCache;
    let sfscc = sfsc.constants;
    let newsheetname = SocialCalc.Formula.NormalizeSheetName(sheetname);

    if (str) {
        newsheet = new SocialCalc.Sheet();
        newsheet.ParseSheetSave(str);
    }

    sfsc.sheets[newsheetname] = {
        sheet: newsheet,
        recalcstate: sfscc.asloaded,
        name: newsheetname,
    };

    SocialCalc.Formula.FreshnessInfo.sheets[newsheetname] = true;
    return newsheet;
};

/**
 * @description Normalizes sheet names for consistent cache keys
 * @param {string} sheetname - Sheet name to normalize
 * @returns {string} Normalized sheet name
 */
SocialCalc.Formula.NormalizeSheetName = (sheetname) => {
    if (SocialCalc.Callbacks.NormalizeSheetName) {
        return SocialCalc.Callbacks.NormalizeSheetName(sheetname);
    } else {
        return sheetname.toLowerCase();
    }
};

// =============================================================================
// REMOTE FUNCTION AND FRESHNESS INFO
// =============================================================================

/**
 * @description Remote function information for server communication
 * @type {Object}
 */
SocialCalc.Formula.RemoteFunctionInfo = {
    /**
     * @description Waiting for server indicator
     * If waiting for an XHR response from the server, this is set to some non-blank status text
     * so it can be tested in the recalc loop to start load and then wait until restarted.
     * Reset to null before restarting.
     */
    waitingForServer: null,
};

/**
 * @description Freshness information generated during recalc
 * @type {Object}
 * 
 * This information is generated during recalc.
 * It may be used to help determine when the recalc data in a spreadsheet
 * may be out of date.
 * For example, it may be used to display a message like:
 * "Dependent on sheet 'FOO' which was updated more recently than this printout"
 */
SocialCalc.Formula.FreshnessInfo = {
    /** @description For each external sheet referenced successfully an attribute of that name with value true */
    sheets: {},

    /** @description For each volatile function that is called an attribute of that name with value true */
    volatile: {},

    /** @description Set to false when started and true when recalc completes */
    recalc_completed: false,
};

/**
 * @description Resets freshness information for new calculation cycle
 */
SocialCalc.Formula.FreshnessInfoReset = () => {
    let scffi = SocialCalc.Formula.FreshnessInfo;
    scffi.sheets = {};
    scffi.volatile = {};
    scffi.recalc_completed = false;
};
// =============================================================================
// MISCELLANEOUS UTILITY FUNCTIONS
// =============================================================================

/**
 * @description Removes any "$" characters from coordinate string
 * @param {string} coord - Coordinate string potentially containing "$" signs
 * @returns {string} Coordinate without any "$" characters
 * 
 * Returns: coord without any $'s
 */
SocialCalc.Formula.PlainCoord = (coord) => {
    return coord.includes("$") ? coord.replace(/\$/g, "") : coord;
};

/**
 * @description Orders range parts to ensure consistent upper-left to lower-right ordering
 * @param {string} coord1 - First coordinate of range
 * @param {string} coord2 - Second coordinate of range
 * @returns {Object} Object with c1, r1, c2, r2 properties where c1/r1 is upper left
 * @returns {number} returns.c1 - Left column number
 * @returns {number} returns.r1 - Top row number  
 * @returns {number} returns.c2 - Right column number
 * @returns {number} returns.r2 - Bottom row number
 */
SocialCalc.Formula.OrderRangeParts = (coord1, coord2) => {
    let cr1 = SocialCalc.coordToCr(coord1);
    let cr2 = SocialCalc.coordToCr(coord2);
    
    let result = {};
    
    if (cr1.col > cr2.col) {
        result.c1 = cr2.col;
        result.c2 = cr1.col;
    } else {
        result.c1 = cr1.col;
        result.c2 = cr2.col;
    }
    
    if (cr1.row > cr2.row) {
        result.r1 = cr2.row;
        result.r2 = cr1.row;
    } else {
        result.r1 = cr1.row;
        result.r2 = cr2.row;
    }

    return result;
};

/**
 * @description Tests whether a value/type meets the specified criteria
 * @param {*} value - Value to test
 * @param {string} type - Type of the value
 * @param {*} criteria - Criteria to test against
 * @returns {boolean} True if value meets criteria, false otherwise
 * 
 * A criteria can be a numeric value, text beginning with <, <=, =, >=, >, <>, 
 * text by itself is start of text to match.
 * Used by a variety of functions, including the "D" functions (DSUM, etc.).
 */
SocialCalc.Formula.TestCriteria = (value, type, criteria) => {
    if (criteria == null) {
        // Undefined (e.g., error value) is always false
        return false;
    }

    let criteriaStr = `${criteria}`;
    let comparitor, basestring;
    
    // Look for comparitor prefix
    let firstChar = criteriaStr.charAt(0);
    if (firstChar === "=" || firstChar === "<" || firstChar === ">") {
        let twoChar = criteriaStr.substring(0, 2);
        if (twoChar === "<=" || twoChar === "<>" || twoChar === ">=") {
            comparitor = twoChar;
            basestring = criteriaStr.substring(2);
        } else {
            comparitor = firstChar;
            basestring = criteriaStr.substring(1);
        }
    } else {
        comparitor = "none";
        basestring = criteriaStr;
    }

    // Get type of value being compared
    let basevalue = SocialCalc.DetermineValueType ? SocialCalc.DetermineValueType(basestring) : null;
    
    if (!basevalue || !basevalue.type) {
        // No criteria base value given
        if (comparitor === "none") {
            // Blank criteria matches nothing
            return false;
        }
        if (type.charAt(0) === "b") {
            // Comparing to empty cell
            return comparitor === "="; // Empty equals empty
        } else {
            return comparitor === "<>"; // "something" does not equal empty
        }
    }

    let cond = false;

    // Handle type conversion for numeric criteria vs text value
    if (basevalue.type.charAt(0) === "n" && type.charAt(0) === "t") {
        // Criteria is number, but value is text
        let testvalue = SocialCalc.DetermineValueType ? SocialCalc.DetermineValueType(value) : null;
        if (testvalue && testvalue.type.charAt(0) === "n") {
            // Could be number - make it one
            value = testvalue.value;
            type = testvalue.type;
        }
    }

    if (type.charAt(0) === "n" && basevalue.type.charAt(0) === "n") {
        // Compare two numbers
        let numValue = Number(value);
        let numBaseValue = Number(basevalue.value);
        
        switch (comparitor) {
            case "<":
                cond = numValue < numBaseValue;
                break;
            case "<=":
                cond = numValue <= numBaseValue;
                break;
            case "=":
            case "none":
                cond = numValue === numBaseValue;
                break;
            case ">=":
                cond = numValue >= numBaseValue;
                break;
            case ">":
                cond = numValue > numBaseValue;
                break;
            case "<>":
                cond = numValue !== numBaseValue;
                break;
        }
    } else if (type.charAt(0) === "e") {
        // Error on left
        cond = false;
    } else if (basevalue.type.charAt(0) === "e") {
        // Error on right
        cond = false;
    } else {
        // Text, maybe mixed with number or blank
        if (type.charAt(0) === "n") {
            value = SocialCalc.format_number_for_display ? 
                   SocialCalc.format_number_for_display(value, "n", "") : 
                   `${value}`;
        }
        
        if (basevalue.type.charAt(0) === "n") {
            // If number and didn't match already, isn't a match
            return false;
        }

        let valueStr = value ? `${value}`.toLowerCase() : "";
        let baseStr = basevalue.value ? `${basevalue.value}`.toLowerCase() : "";

        switch (comparitor) {
            case "<":
                cond = valueStr < baseStr;
                break;
            case "<=":
                cond = valueStr <= baseStr;
                break;
            case "=":
                cond = valueStr === baseStr;
                break;
            case "none":
                cond = valueStr.substring(0, baseStr.length) === baseStr;
                break;
            case ">=":
                cond = valueStr >= baseStr;
                break;
            case ">":
                cond = valueStr > baseStr;
                break;
            case "<>":
                cond = valueStr !== baseStr;
                break;
        }
    }

    return cond;
};

// =============================================================================
// FINAL MODULE EXPORT AND GLOBAL AVAILABILITY
// =============================================================================

// Make sure SocialCalc is available in all environments
if (typeof globalThis !== "undefined") {
    globalThis.SocialCalc = SocialCalc;
} else if (typeof window !== "undefined") {
    window.SocialCalc = SocialCalc;
} else if (typeof global !== "undefined") {
    global.SocialCalc = SocialCalc;
}

// Export the complete SocialCalc FormatNumber module
export default SocialCalc.FormatNumber;

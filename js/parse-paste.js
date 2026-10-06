/**
 * Parse a pasted string into a number, tolerating currency symbols,
 * thousands separators, accounting negatives, percents and surrounding text.
 *
 *   "$1,234.56"   -> 1234.56      "(1,234.56)" -> -1234.56
 *   "1.234,56"    -> 1234.56      "12.5%"      -> 0.125
 *   "Qty 3 @ $4"  -> 3 (first number)
 *
 * format: 'us' (default) or 'eu'. Only used for the ambiguous case of a
 * single separator followed by exactly 3 digits ("1,234" / "1.234").
 *
 * Returns NaN when no number is found.
 */
(function (root) {
    'use strict';

    function parsePasted(text, format) {
        if (text == null) return NaN;
        var s = String(text)
            .replace(/[−‒–—﹣－]/g, '-') // unicode minus/dashes
            .replace(/(\d)[\s  '’](?=\d{3}(?!\d))/g, '$1'); // "1 234" / "1'234"

        var m = /[-+]?(?:\d[\d.,]*\d|\d|[.,]\d+)(?:[eE][-+]?\d+)?/.exec(s);
        if (!m) return NaN;

        var num = m[0], sign = 1;
        if (num[0] === '-' || num[0] === '+') {
            if (num[0] === '-') sign = -1;
            num = num.slice(1);
        }

        // context around the number: "-$1", "($1)", "1%"
        var pre = s.slice(0, m.index).replace(/[\s\p{Sc}]+$/u, '');
        var post = s.slice(m.index + m[0].length).replace(/^[\s\p{Sc}]+/u, '');
        if (/-$/.test(pre)) { sign = -sign; pre = pre.slice(0, -1).replace(/[\s\p{Sc}]+$/u, ''); }
        var percent = post[0] === '%';
        if (/\($/.test(pre) && /^%?\s*\)/.test(post)) sign = -1;

        // split exponent
        var exp = 0, eIdx = num.search(/[eE]/);
        if (eIdx >= 0) { exp = parseInt(num.slice(eIdx + 1), 10); num = num.slice(0, eIdx); }

        var dec = decimalSeparator(num, format);
        var clean = '';
        for (var i = 0; i < num.length; i++) {
            var c = num[i];
            if (c === '.' || c === ',') { if (c === dec && i === num.lastIndexOf(dec)) clean += '.'; }
            else clean += c;
        }
        if (percent) exp -= 2; // shift via exponent to avoid float error from /100

        var val = parseFloat(clean + 'e' + exp);
        return isFinite(val) ? sign * val : NaN;
    }

    // Returns '.', ',' or null (no decimal part).
    function decimalSeparator(num, format) {
        var lastDot = num.lastIndexOf('.'), lastComma = num.lastIndexOf(',');
        if (lastDot >= 0 && lastComma >= 0) return lastDot > lastComma ? '.' : ',';
        var ch = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null;
        if (!ch) return null;
        if (num.indexOf(ch) !== num.lastIndexOf(ch)) return null; // repeated -> thousands

        var idx = num.indexOf(ch), before = idx, after = num.length - idx - 1;
        if (after !== 3 || before === 0 || before > 3) return ch; // clearly decimal
        // ambiguous "1,234" / "1.234"
        return (format === 'eu') ? (ch === ',' ? ',' : null) : (ch === '.' ? '.' : null);
    }

    root.parsePasted = parsePasted;
    if (typeof module !== 'undefined') module.exports = parsePasted;
})(typeof window !== 'undefined' ? window : globalThis);

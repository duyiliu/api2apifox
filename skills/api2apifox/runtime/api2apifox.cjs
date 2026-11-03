#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/java-parser/node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_freeGlobal.js"(exports2, module2) {
    var freeGlobal2 = typeof global == "object" && global && global.Object === Object && global;
    module2.exports = freeGlobal2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_root.js
var require_root = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_root.js"(exports2, module2) {
    var freeGlobal2 = require_freeGlobal();
    var freeSelf2 = typeof self == "object" && self && self.Object === Object && self;
    var root2 = freeGlobal2 || freeSelf2 || Function("return this")();
    module2.exports = root2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Symbol.js"(exports2, module2) {
    var root2 = require_root();
    var Symbol3 = root2.Symbol;
    module2.exports = Symbol3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arrayMap.js"(exports2, module2) {
    function arrayMap2(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    module2.exports = arrayMap2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isArray.js"(exports2, module2) {
    var isArray2 = Array.isArray;
    module2.exports = isArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getRawTag.js"(exports2, module2) {
    var Symbol3 = require_Symbol();
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    var nativeObjectToString3 = objectProto21.toString;
    var symToStringTag3 = Symbol3 ? Symbol3.toStringTag : void 0;
    function getRawTag2(value) {
      var isOwn = hasOwnProperty18.call(value, symToStringTag3), tag = value[symToStringTag3];
      try {
        value[symToStringTag3] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString3.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag3] = tag;
        } else {
          delete value[symToStringTag3];
        }
      }
      return result;
    }
    module2.exports = getRawTag2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_objectToString.js"(exports2, module2) {
    var objectProto21 = Object.prototype;
    var nativeObjectToString3 = objectProto21.toString;
    function objectToString2(value) {
      return nativeObjectToString3.call(value);
    }
    module2.exports = objectToString2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseGetTag.js"(exports2, module2) {
    var Symbol3 = require_Symbol();
    var getRawTag2 = require_getRawTag();
    var objectToString2 = require_objectToString();
    var nullTag2 = "[object Null]";
    var undefinedTag2 = "[object Undefined]";
    var symToStringTag3 = Symbol3 ? Symbol3.toStringTag : void 0;
    function baseGetTag2(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag2 : nullTag2;
      }
      return symToStringTag3 && symToStringTag3 in Object(value) ? getRawTag2(value) : objectToString2(value);
    }
    module2.exports = baseGetTag2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isObjectLike.js"(exports2, module2) {
    function isObjectLike2(value) {
      return value != null && typeof value == "object";
    }
    module2.exports = isObjectLike2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isSymbol.js
var require_isSymbol = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isSymbol.js"(exports2, module2) {
    var baseGetTag2 = require_baseGetTag();
    var isObjectLike2 = require_isObjectLike();
    var symbolTag5 = "[object Symbol]";
    function isSymbol2(value) {
      return typeof value == "symbol" || isObjectLike2(value) && baseGetTag2(value) == symbolTag5;
    }
    module2.exports = isSymbol2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseToString.js
var require_baseToString = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseToString.js"(exports2, module2) {
    var Symbol3 = require_Symbol();
    var arrayMap2 = require_arrayMap();
    var isArray2 = require_isArray();
    var isSymbol2 = require_isSymbol();
    var INFINITY5 = 1 / 0;
    var symbolProto4 = Symbol3 ? Symbol3.prototype : void 0;
    var symbolToString2 = symbolProto4 ? symbolProto4.toString : void 0;
    function baseToString2(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isArray2(value)) {
        return arrayMap2(value, baseToString2) + "";
      }
      if (isSymbol2(value)) {
        return symbolToString2 ? symbolToString2.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY5 ? "-0" : result;
    }
    module2.exports = baseToString2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/toString.js
var require_toString = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/toString.js"(exports2, module2) {
    var baseToString2 = require_baseToString();
    function toString2(value) {
      return value == null ? "" : baseToString2(value);
    }
    module2.exports = toString2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseSlice.js
var require_baseSlice = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseSlice.js"(exports2, module2) {
    function baseSlice2(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    module2.exports = baseSlice2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_castSlice.js
var require_castSlice = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_castSlice.js"(exports2, module2) {
    var baseSlice2 = require_baseSlice();
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === void 0 ? length : end;
      return !start && end >= length ? array : baseSlice2(array, start, end);
    }
    module2.exports = castSlice;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hasUnicode.js
var require_hasUnicode = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hasUnicode.js"(exports2, module2) {
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsZWJ = "\\u200d";
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    module2.exports = hasUnicode;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_asciiToArray.js
var require_asciiToArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_asciiToArray.js"(exports2, module2) {
    function asciiToArray(string) {
      return string.split("");
    }
    module2.exports = asciiToArray;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_unicodeToArray.js
var require_unicodeToArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_unicodeToArray.js"(exports2, module2) {
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsAstral = "[" + rsAstralRange + "]";
    var rsCombo = "[" + rsComboRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsZWJ = "\\u200d";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    module2.exports = unicodeToArray;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stringToArray.js
var require_stringToArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stringToArray.js"(exports2, module2) {
    var asciiToArray = require_asciiToArray();
    var hasUnicode = require_hasUnicode();
    var unicodeToArray = require_unicodeToArray();
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    module2.exports = stringToArray;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_createCaseFirst.js
var require_createCaseFirst = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_createCaseFirst.js"(exports2, module2) {
    var castSlice = require_castSlice();
    var hasUnicode = require_hasUnicode();
    var stringToArray = require_stringToArray();
    var toString2 = require_toString();
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString2(string);
        var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
        var chr = strSymbols ? strSymbols[0] : string.charAt(0);
        var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
        return chr[methodName]() + trailing;
      };
    }
    module2.exports = createCaseFirst;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/upperFirst.js
var require_upperFirst = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/upperFirst.js"(exports2, module2) {
    var createCaseFirst = require_createCaseFirst();
    var upperFirst = createCaseFirst("toUpperCase");
    module2.exports = upperFirst;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/capitalize.js
var require_capitalize = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/capitalize.js"(exports2, module2) {
    var toString2 = require_toString();
    var upperFirst = require_upperFirst();
    function capitalize(string) {
      return upperFirst(toString2(string).toLowerCase());
    }
    module2.exports = capitalize;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arrayReduce.js
var require_arrayReduce = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arrayReduce.js"(exports2, module2) {
    function arrayReduce2(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    module2.exports = arrayReduce2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_basePropertyOf.js
var require_basePropertyOf = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_basePropertyOf.js"(exports2, module2) {
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    module2.exports = basePropertyOf;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_deburrLetter.js
var require_deburrLetter = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_deburrLetter.js"(exports2, module2) {
    var basePropertyOf = require_basePropertyOf();
    var deburredLetters = {
      // Latin-1 Supplement block.
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      // Latin Extended-A block.
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "s"
    };
    var deburrLetter = basePropertyOf(deburredLetters);
    module2.exports = deburrLetter;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/deburr.js
var require_deburr = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/deburr.js"(exports2, module2) {
    var deburrLetter = require_deburrLetter();
    var toString2 = require_toString();
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsCombo = "[" + rsComboRange + "]";
    var reComboMark = RegExp(rsCombo, "g");
    function deburr(string) {
      string = toString2(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
    }
    module2.exports = deburr;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_asciiWords.js
var require_asciiWords = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_asciiWords.js"(exports2, module2) {
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    module2.exports = asciiWords;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hasUnicodeWord.js
var require_hasUnicodeWord = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hasUnicodeWord.js"(exports2, module2) {
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    module2.exports = hasUnicodeWord;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_unicodeWords.js
var require_unicodeWords = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_unicodeWords.js"(exports2, module2) {
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
    var rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    module2.exports = unicodeWords;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/words.js
var require_words = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/words.js"(exports2, module2) {
    var asciiWords = require_asciiWords();
    var hasUnicodeWord = require_hasUnicodeWord();
    var toString2 = require_toString();
    var unicodeWords = require_unicodeWords();
    function words(string, pattern, guard) {
      string = toString2(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module2.exports = words;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_createCompounder.js
var require_createCompounder = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_createCompounder.js"(exports2, module2) {
    var arrayReduce2 = require_arrayReduce();
    var deburr = require_deburr();
    var words = require_words();
    var rsApos = "['\u2019]";
    var reApos = RegExp(rsApos, "g");
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce2(words(deburr(string).replace(reApos, "")), callback, "");
      };
    }
    module2.exports = createCompounder;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/camelCase.js
var require_camelCase = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/camelCase.js"(exports2, module2) {
    var capitalize = require_capitalize();
    var createCompounder = require_createCompounder();
    var camelCase2 = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });
    module2.exports = camelCase2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_listCacheClear.js"(exports2, module2) {
    function listCacheClear2() {
      this.__data__ = [];
      this.size = 0;
    }
    module2.exports = listCacheClear2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/eq.js
var require_eq = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/eq.js"(exports2, module2) {
    function eq2(value, other) {
      return value === other || value !== value && other !== other;
    }
    module2.exports = eq2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_assocIndexOf.js"(exports2, module2) {
    var eq2 = require_eq();
    function assocIndexOf2(array, key) {
      var length = array.length;
      while (length--) {
        if (eq2(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    module2.exports = assocIndexOf2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_listCacheDelete.js"(exports2, module2) {
    var assocIndexOf2 = require_assocIndexOf();
    var arrayProto2 = Array.prototype;
    var splice2 = arrayProto2.splice;
    function listCacheDelete2(key) {
      var data = this.__data__, index = assocIndexOf2(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice2.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    module2.exports = listCacheDelete2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_listCacheGet.js"(exports2, module2) {
    var assocIndexOf2 = require_assocIndexOf();
    function listCacheGet2(key) {
      var data = this.__data__, index = assocIndexOf2(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    module2.exports = listCacheGet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_listCacheHas.js"(exports2, module2) {
    var assocIndexOf2 = require_assocIndexOf();
    function listCacheHas2(key) {
      return assocIndexOf2(this.__data__, key) > -1;
    }
    module2.exports = listCacheHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_listCacheSet.js"(exports2, module2) {
    var assocIndexOf2 = require_assocIndexOf();
    function listCacheSet2(key, value) {
      var data = this.__data__, index = assocIndexOf2(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    module2.exports = listCacheSet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_ListCache.js"(exports2, module2) {
    var listCacheClear2 = require_listCacheClear();
    var listCacheDelete2 = require_listCacheDelete();
    var listCacheGet2 = require_listCacheGet();
    var listCacheHas2 = require_listCacheHas();
    var listCacheSet2 = require_listCacheSet();
    function ListCache2(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache2.prototype.clear = listCacheClear2;
    ListCache2.prototype["delete"] = listCacheDelete2;
    ListCache2.prototype.get = listCacheGet2;
    ListCache2.prototype.has = listCacheHas2;
    ListCache2.prototype.set = listCacheSet2;
    module2.exports = ListCache2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stackClear.js"(exports2, module2) {
    var ListCache2 = require_ListCache();
    function stackClear2() {
      this.__data__ = new ListCache2();
      this.size = 0;
    }
    module2.exports = stackClear2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stackDelete.js"(exports2, module2) {
    function stackDelete2(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    module2.exports = stackDelete2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stackGet.js"(exports2, module2) {
    function stackGet2(key) {
      return this.__data__.get(key);
    }
    module2.exports = stackGet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stackHas.js"(exports2, module2) {
    function stackHas2(key) {
      return this.__data__.has(key);
    }
    module2.exports = stackHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isObject.js"(exports2, module2) {
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    module2.exports = isObject2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isFunction.js"(exports2, module2) {
    var baseGetTag2 = require_baseGetTag();
    var isObject2 = require_isObject();
    var asyncTag2 = "[object AsyncFunction]";
    var funcTag4 = "[object Function]";
    var genTag3 = "[object GeneratorFunction]";
    var proxyTag2 = "[object Proxy]";
    function isFunction2(value) {
      if (!isObject2(value)) {
        return false;
      }
      var tag = baseGetTag2(value);
      return tag == funcTag4 || tag == genTag3 || tag == asyncTag2 || tag == proxyTag2;
    }
    module2.exports = isFunction2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_coreJsData.js"(exports2, module2) {
    var root2 = require_root();
    var coreJsData2 = root2["__core-js_shared__"];
    module2.exports = coreJsData2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isMasked.js"(exports2, module2) {
    var coreJsData2 = require_coreJsData();
    var maskSrcKey2 = function() {
      var uid = /[^.]+$/.exec(coreJsData2 && coreJsData2.keys && coreJsData2.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    function isMasked2(func) {
      return !!maskSrcKey2 && maskSrcKey2 in func;
    }
    module2.exports = isMasked2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_toSource.js"(exports2, module2) {
    var funcProto3 = Function.prototype;
    var funcToString3 = funcProto3.toString;
    function toSource2(func) {
      if (func != null) {
        try {
          return funcToString3.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    module2.exports = toSource2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsNative.js"(exports2, module2) {
    var isFunction2 = require_isFunction();
    var isMasked2 = require_isMasked();
    var isObject2 = require_isObject();
    var toSource2 = require_toSource();
    var reRegExpChar2 = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor2 = /^\[object .+?Constructor\]$/;
    var funcProto3 = Function.prototype;
    var objectProto21 = Object.prototype;
    var funcToString3 = funcProto3.toString;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    var reIsNative2 = RegExp(
      "^" + funcToString3.call(hasOwnProperty18).replace(reRegExpChar2, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative2(value) {
      if (!isObject2(value) || isMasked2(value)) {
        return false;
      }
      var pattern = isFunction2(value) ? reIsNative2 : reIsHostCtor2;
      return pattern.test(toSource2(value));
    }
    module2.exports = baseIsNative2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getValue.js"(exports2, module2) {
    function getValue2(object, key) {
      return object == null ? void 0 : object[key];
    }
    module2.exports = getValue2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getNative.js"(exports2, module2) {
    var baseIsNative2 = require_baseIsNative();
    var getValue2 = require_getValue();
    function getNative2(object, key) {
      var value = getValue2(object, key);
      return baseIsNative2(value) ? value : void 0;
    }
    module2.exports = getNative2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Map.js
var require_Map = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Map.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var root2 = require_root();
    var Map3 = getNative2(root2, "Map");
    module2.exports = Map3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_nativeCreate.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var nativeCreate2 = getNative2(Object, "create");
    module2.exports = nativeCreate2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hashClear.js"(exports2, module2) {
    var nativeCreate2 = require_nativeCreate();
    function hashClear2() {
      this.__data__ = nativeCreate2 ? nativeCreate2(null) : {};
      this.size = 0;
    }
    module2.exports = hashClear2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hashDelete.js"(exports2, module2) {
    function hashDelete2(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    module2.exports = hashDelete2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hashGet.js"(exports2, module2) {
    var nativeCreate2 = require_nativeCreate();
    var HASH_UNDEFINED4 = "__lodash_hash_undefined__";
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function hashGet2(key) {
      var data = this.__data__;
      if (nativeCreate2) {
        var result = data[key];
        return result === HASH_UNDEFINED4 ? void 0 : result;
      }
      return hasOwnProperty18.call(data, key) ? data[key] : void 0;
    }
    module2.exports = hashGet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hashHas.js"(exports2, module2) {
    var nativeCreate2 = require_nativeCreate();
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function hashHas2(key) {
      var data = this.__data__;
      return nativeCreate2 ? data[key] !== void 0 : hasOwnProperty18.call(data, key);
    }
    module2.exports = hashHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hashSet.js"(exports2, module2) {
    var nativeCreate2 = require_nativeCreate();
    var HASH_UNDEFINED4 = "__lodash_hash_undefined__";
    function hashSet2(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate2 && value === void 0 ? HASH_UNDEFINED4 : value;
      return this;
    }
    module2.exports = hashSet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Hash.js"(exports2, module2) {
    var hashClear2 = require_hashClear();
    var hashDelete2 = require_hashDelete();
    var hashGet2 = require_hashGet();
    var hashHas2 = require_hashHas();
    var hashSet2 = require_hashSet();
    function Hash2(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash2.prototype.clear = hashClear2;
    Hash2.prototype["delete"] = hashDelete2;
    Hash2.prototype.get = hashGet2;
    Hash2.prototype.has = hashHas2;
    Hash2.prototype.set = hashSet2;
    module2.exports = Hash2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapCacheClear.js"(exports2, module2) {
    var Hash2 = require_Hash();
    var ListCache2 = require_ListCache();
    var Map3 = require_Map();
    function mapCacheClear2() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash2(),
        "map": new (Map3 || ListCache2)(),
        "string": new Hash2()
      };
    }
    module2.exports = mapCacheClear2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isKeyable.js"(exports2, module2) {
    function isKeyable2(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    module2.exports = isKeyable2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getMapData.js"(exports2, module2) {
    var isKeyable2 = require_isKeyable();
    function getMapData2(map2, key) {
      var data = map2.__data__;
      return isKeyable2(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    module2.exports = getMapData2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapCacheDelete.js"(exports2, module2) {
    var getMapData2 = require_getMapData();
    function mapCacheDelete2(key) {
      var result = getMapData2(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    module2.exports = mapCacheDelete2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapCacheGet.js"(exports2, module2) {
    var getMapData2 = require_getMapData();
    function mapCacheGet2(key) {
      return getMapData2(this, key).get(key);
    }
    module2.exports = mapCacheGet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapCacheHas.js"(exports2, module2) {
    var getMapData2 = require_getMapData();
    function mapCacheHas2(key) {
      return getMapData2(this, key).has(key);
    }
    module2.exports = mapCacheHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapCacheSet.js"(exports2, module2) {
    var getMapData2 = require_getMapData();
    function mapCacheSet2(key, value) {
      var data = getMapData2(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    module2.exports = mapCacheSet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_MapCache.js"(exports2, module2) {
    var mapCacheClear2 = require_mapCacheClear();
    var mapCacheDelete2 = require_mapCacheDelete();
    var mapCacheGet2 = require_mapCacheGet();
    var mapCacheHas2 = require_mapCacheHas();
    var mapCacheSet2 = require_mapCacheSet();
    function MapCache2(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache2.prototype.clear = mapCacheClear2;
    MapCache2.prototype["delete"] = mapCacheDelete2;
    MapCache2.prototype.get = mapCacheGet2;
    MapCache2.prototype.has = mapCacheHas2;
    MapCache2.prototype.set = mapCacheSet2;
    module2.exports = MapCache2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stackSet.js"(exports2, module2) {
    var ListCache2 = require_ListCache();
    var Map3 = require_Map();
    var MapCache2 = require_MapCache();
    var LARGE_ARRAY_SIZE4 = 200;
    function stackSet2(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache2) {
        var pairs = data.__data__;
        if (!Map3 || pairs.length < LARGE_ARRAY_SIZE4 - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache2(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    module2.exports = stackSet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Stack.js"(exports2, module2) {
    var ListCache2 = require_ListCache();
    var stackClear2 = require_stackClear();
    var stackDelete2 = require_stackDelete();
    var stackGet2 = require_stackGet();
    var stackHas2 = require_stackHas();
    var stackSet2 = require_stackSet();
    function Stack2(entries) {
      var data = this.__data__ = new ListCache2(entries);
      this.size = data.size;
    }
    Stack2.prototype.clear = stackClear2;
    Stack2.prototype["delete"] = stackDelete2;
    Stack2.prototype.get = stackGet2;
    Stack2.prototype.has = stackHas2;
    Stack2.prototype.set = stackSet2;
    module2.exports = Stack2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_setCacheAdd.js"(exports2, module2) {
    var HASH_UNDEFINED4 = "__lodash_hash_undefined__";
    function setCacheAdd2(value) {
      this.__data__.set(value, HASH_UNDEFINED4);
      return this;
    }
    module2.exports = setCacheAdd2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_setCacheHas.js"(exports2, module2) {
    function setCacheHas2(value) {
      return this.__data__.has(value);
    }
    module2.exports = setCacheHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_SetCache.js"(exports2, module2) {
    var MapCache2 = require_MapCache();
    var setCacheAdd2 = require_setCacheAdd();
    var setCacheHas2 = require_setCacheHas();
    function SetCache2(values2) {
      var index = -1, length = values2 == null ? 0 : values2.length;
      this.__data__ = new MapCache2();
      while (++index < length) {
        this.add(values2[index]);
      }
    }
    SetCache2.prototype.add = SetCache2.prototype.push = setCacheAdd2;
    SetCache2.prototype.has = setCacheHas2;
    module2.exports = SetCache2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arraySome.js"(exports2, module2) {
    function arraySome2(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    module2.exports = arraySome2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_cacheHas.js"(exports2, module2) {
    function cacheHas2(cache, key) {
      return cache.has(key);
    }
    module2.exports = cacheHas2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_equalArrays.js"(exports2, module2) {
    var SetCache2 = require_SetCache();
    var arraySome2 = require_arraySome();
    var cacheHas2 = require_cacheHas();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var COMPARE_UNORDERED_FLAG5 = 2;
    function equalArrays2(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG7, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG5 ? new SetCache2() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome2(other, function(othValue2, othIndex) {
            if (!cacheHas2(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    module2.exports = equalArrays2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Uint8Array.js"(exports2, module2) {
    var root2 = require_root();
    var Uint8Array3 = root2.Uint8Array;
    module2.exports = Uint8Array3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_mapToArray.js"(exports2, module2) {
    function mapToArray2(map2) {
      var index = -1, result = Array(map2.size);
      map2.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    module2.exports = mapToArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_setToArray.js"(exports2, module2) {
    function setToArray2(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    module2.exports = setToArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_equalByTag.js"(exports2, module2) {
    var Symbol3 = require_Symbol();
    var Uint8Array3 = require_Uint8Array();
    var eq2 = require_eq();
    var equalArrays2 = require_equalArrays();
    var mapToArray2 = require_mapToArray();
    var setToArray2 = require_setToArray();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var COMPARE_UNORDERED_FLAG5 = 2;
    var boolTag5 = "[object Boolean]";
    var dateTag5 = "[object Date]";
    var errorTag4 = "[object Error]";
    var mapTag8 = "[object Map]";
    var numberTag5 = "[object Number]";
    var regexpTag6 = "[object RegExp]";
    var setTag8 = "[object Set]";
    var stringTag6 = "[object String]";
    var symbolTag5 = "[object Symbol]";
    var arrayBufferTag5 = "[object ArrayBuffer]";
    var dataViewTag6 = "[object DataView]";
    var symbolProto4 = Symbol3 ? Symbol3.prototype : void 0;
    var symbolValueOf3 = symbolProto4 ? symbolProto4.valueOf : void 0;
    function equalByTag2(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag6:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag5:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array3(object), new Uint8Array3(other))) {
            return false;
          }
          return true;
        case boolTag5:
        case dateTag5:
        case numberTag5:
          return eq2(+object, +other);
        case errorTag4:
          return object.name == other.name && object.message == other.message;
        case regexpTag6:
        case stringTag6:
          return object == other + "";
        case mapTag8:
          var convert = mapToArray2;
        case setTag8:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG7;
          convert || (convert = setToArray2);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG5;
          stack.set(object, other);
          var result = equalArrays2(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag5:
          if (symbolValueOf3) {
            return symbolValueOf3.call(object) == symbolValueOf3.call(other);
          }
      }
      return false;
    }
    module2.exports = equalByTag2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arrayPush.js"(exports2, module2) {
    function arrayPush2(array, values2) {
      var index = -1, length = values2.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values2[index];
      }
      return array;
    }
    module2.exports = arrayPush2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseGetAllKeys.js"(exports2, module2) {
    var arrayPush2 = require_arrayPush();
    var isArray2 = require_isArray();
    function baseGetAllKeys2(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray2(object) ? result : arrayPush2(result, symbolsFunc(object));
    }
    module2.exports = baseGetAllKeys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arrayFilter.js"(exports2, module2) {
    function arrayFilter2(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    module2.exports = arrayFilter2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/stubArray.js"(exports2, module2) {
    function stubArray2() {
      return [];
    }
    module2.exports = stubArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getSymbols.js"(exports2, module2) {
    var arrayFilter2 = require_arrayFilter();
    var stubArray2 = require_stubArray();
    var objectProto21 = Object.prototype;
    var propertyIsEnumerable3 = objectProto21.propertyIsEnumerable;
    var nativeGetSymbols3 = Object.getOwnPropertySymbols;
    var getSymbols2 = !nativeGetSymbols3 ? stubArray2 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter2(nativeGetSymbols3(object), function(symbol) {
        return propertyIsEnumerable3.call(object, symbol);
      });
    };
    module2.exports = getSymbols2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseTimes.js"(exports2, module2) {
    function baseTimes2(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    module2.exports = baseTimes2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsArguments.js"(exports2, module2) {
    var baseGetTag2 = require_baseGetTag();
    var isObjectLike2 = require_isObjectLike();
    var argsTag5 = "[object Arguments]";
    function baseIsArguments2(value) {
      return isObjectLike2(value) && baseGetTag2(value) == argsTag5;
    }
    module2.exports = baseIsArguments2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isArguments.js"(exports2, module2) {
    var baseIsArguments2 = require_baseIsArguments();
    var isObjectLike2 = require_isObjectLike();
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    var propertyIsEnumerable3 = objectProto21.propertyIsEnumerable;
    var isArguments2 = baseIsArguments2(/* @__PURE__ */ function() {
      return arguments;
    }()) ? baseIsArguments2 : function(value) {
      return isObjectLike2(value) && hasOwnProperty18.call(value, "callee") && !propertyIsEnumerable3.call(value, "callee");
    };
    module2.exports = isArguments2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/stubFalse.js"(exports2, module2) {
    function stubFalse2() {
      return false;
    }
    module2.exports = stubFalse2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isBuffer.js"(exports2, module2) {
    var root2 = require_root();
    var stubFalse2 = require_stubFalse();
    var freeExports4 = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
    var freeModule4 = freeExports4 && typeof module2 == "object" && module2 && !module2.nodeType && module2;
    var moduleExports4 = freeModule4 && freeModule4.exports === freeExports4;
    var Buffer4 = moduleExports4 ? root2.Buffer : void 0;
    var nativeIsBuffer2 = Buffer4 ? Buffer4.isBuffer : void 0;
    var isBuffer2 = nativeIsBuffer2 || stubFalse2;
    module2.exports = isBuffer2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isIndex.js"(exports2, module2) {
    var MAX_SAFE_INTEGER3 = 9007199254740991;
    var reIsUint2 = /^(?:0|[1-9]\d*)$/;
    function isIndex2(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER3 : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint2.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    module2.exports = isIndex2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isLength.js"(exports2, module2) {
    var MAX_SAFE_INTEGER3 = 9007199254740991;
    function isLength2(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER3;
    }
    module2.exports = isLength2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsTypedArray.js"(exports2, module2) {
    var baseGetTag2 = require_baseGetTag();
    var isLength2 = require_isLength();
    var isObjectLike2 = require_isObjectLike();
    var argsTag5 = "[object Arguments]";
    var arrayTag4 = "[object Array]";
    var boolTag5 = "[object Boolean]";
    var dateTag5 = "[object Date]";
    var errorTag4 = "[object Error]";
    var funcTag4 = "[object Function]";
    var mapTag8 = "[object Map]";
    var numberTag5 = "[object Number]";
    var objectTag5 = "[object Object]";
    var regexpTag6 = "[object RegExp]";
    var setTag8 = "[object Set]";
    var stringTag6 = "[object String]";
    var weakMapTag4 = "[object WeakMap]";
    var arrayBufferTag5 = "[object ArrayBuffer]";
    var dataViewTag6 = "[object DataView]";
    var float32Tag4 = "[object Float32Array]";
    var float64Tag4 = "[object Float64Array]";
    var int8Tag4 = "[object Int8Array]";
    var int16Tag4 = "[object Int16Array]";
    var int32Tag4 = "[object Int32Array]";
    var uint8Tag4 = "[object Uint8Array]";
    var uint8ClampedTag4 = "[object Uint8ClampedArray]";
    var uint16Tag4 = "[object Uint16Array]";
    var uint32Tag4 = "[object Uint32Array]";
    var typedArrayTags2 = {};
    typedArrayTags2[float32Tag4] = typedArrayTags2[float64Tag4] = typedArrayTags2[int8Tag4] = typedArrayTags2[int16Tag4] = typedArrayTags2[int32Tag4] = typedArrayTags2[uint8Tag4] = typedArrayTags2[uint8ClampedTag4] = typedArrayTags2[uint16Tag4] = typedArrayTags2[uint32Tag4] = true;
    typedArrayTags2[argsTag5] = typedArrayTags2[arrayTag4] = typedArrayTags2[arrayBufferTag5] = typedArrayTags2[boolTag5] = typedArrayTags2[dataViewTag6] = typedArrayTags2[dateTag5] = typedArrayTags2[errorTag4] = typedArrayTags2[funcTag4] = typedArrayTags2[mapTag8] = typedArrayTags2[numberTag5] = typedArrayTags2[objectTag5] = typedArrayTags2[regexpTag6] = typedArrayTags2[setTag8] = typedArrayTags2[stringTag6] = typedArrayTags2[weakMapTag4] = false;
    function baseIsTypedArray2(value) {
      return isObjectLike2(value) && isLength2(value.length) && !!typedArrayTags2[baseGetTag2(value)];
    }
    module2.exports = baseIsTypedArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseUnary.js"(exports2, module2) {
    function baseUnary2(func) {
      return function(value) {
        return func(value);
      };
    }
    module2.exports = baseUnary2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_nodeUtil.js"(exports2, module2) {
    var freeGlobal2 = require_freeGlobal();
    var freeExports4 = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
    var freeModule4 = freeExports4 && typeof module2 == "object" && module2 && !module2.nodeType && module2;
    var moduleExports4 = freeModule4 && freeModule4.exports === freeExports4;
    var freeProcess2 = moduleExports4 && freeGlobal2.process;
    var nodeUtil2 = function() {
      try {
        var types = freeModule4 && freeModule4.require && freeModule4.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess2 && freeProcess2.binding && freeProcess2.binding("util");
      } catch (e) {
      }
    }();
    module2.exports = nodeUtil2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isTypedArray.js"(exports2, module2) {
    var baseIsTypedArray2 = require_baseIsTypedArray();
    var baseUnary2 = require_baseUnary();
    var nodeUtil2 = require_nodeUtil();
    var nodeIsTypedArray2 = nodeUtil2 && nodeUtil2.isTypedArray;
    var isTypedArray2 = nodeIsTypedArray2 ? baseUnary2(nodeIsTypedArray2) : baseIsTypedArray2;
    module2.exports = isTypedArray2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_arrayLikeKeys.js"(exports2, module2) {
    var baseTimes2 = require_baseTimes();
    var isArguments2 = require_isArguments();
    var isArray2 = require_isArray();
    var isBuffer2 = require_isBuffer();
    var isIndex2 = require_isIndex();
    var isTypedArray2 = require_isTypedArray();
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function arrayLikeKeys2(value, inherited) {
      var isArr = isArray2(value), isArg = !isArr && isArguments2(value), isBuff = !isArr && !isArg && isBuffer2(value), isType = !isArr && !isArg && !isBuff && isTypedArray2(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes2(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty18.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex2(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    module2.exports = arrayLikeKeys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isPrototype.js"(exports2, module2) {
    var objectProto21 = Object.prototype;
    function isPrototype2(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto21;
      return value === proto;
    }
    module2.exports = isPrototype2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_overArg.js"(exports2, module2) {
    function overArg2(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    module2.exports = overArg2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_nativeKeys.js"(exports2, module2) {
    var overArg2 = require_overArg();
    var nativeKeys2 = overArg2(Object.keys, Object);
    module2.exports = nativeKeys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseKeys.js"(exports2, module2) {
    var isPrototype2 = require_isPrototype();
    var nativeKeys2 = require_nativeKeys();
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function baseKeys2(object) {
      if (!isPrototype2(object)) {
        return nativeKeys2(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty18.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    module2.exports = baseKeys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/isArrayLike.js"(exports2, module2) {
    var isFunction2 = require_isFunction();
    var isLength2 = require_isLength();
    function isArrayLike2(value) {
      return value != null && isLength2(value.length) && !isFunction2(value);
    }
    module2.exports = isArrayLike2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/keys.js
var require_keys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/keys.js"(exports2, module2) {
    var arrayLikeKeys2 = require_arrayLikeKeys();
    var baseKeys2 = require_baseKeys();
    var isArrayLike2 = require_isArrayLike();
    function keys2(object) {
      return isArrayLike2(object) ? arrayLikeKeys2(object) : baseKeys2(object);
    }
    module2.exports = keys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getAllKeys.js"(exports2, module2) {
    var baseGetAllKeys2 = require_baseGetAllKeys();
    var getSymbols2 = require_getSymbols();
    var keys2 = require_keys();
    function getAllKeys2(object) {
      return baseGetAllKeys2(object, keys2, getSymbols2);
    }
    module2.exports = getAllKeys2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_equalObjects.js"(exports2, module2) {
    var getAllKeys2 = require_getAllKeys();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function equalObjects2(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG7, objProps = getAllKeys2(object), objLength = objProps.length, othProps = getAllKeys2(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty18.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    module2.exports = equalObjects2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_DataView.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var root2 = require_root();
    var DataView2 = getNative2(root2, "DataView");
    module2.exports = DataView2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Promise.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var root2 = require_root();
    var Promise3 = getNative2(root2, "Promise");
    module2.exports = Promise3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_Set.js
var require_Set = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_Set.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var root2 = require_root();
    var Set3 = getNative2(root2, "Set");
    module2.exports = Set3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_WeakMap.js"(exports2, module2) {
    var getNative2 = require_getNative();
    var root2 = require_root();
    var WeakMap3 = getNative2(root2, "WeakMap");
    module2.exports = WeakMap3;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getTag.js"(exports2, module2) {
    var DataView2 = require_DataView();
    var Map3 = require_Map();
    var Promise3 = require_Promise();
    var Set3 = require_Set();
    var WeakMap3 = require_WeakMap();
    var baseGetTag2 = require_baseGetTag();
    var toSource2 = require_toSource();
    var mapTag8 = "[object Map]";
    var objectTag5 = "[object Object]";
    var promiseTag2 = "[object Promise]";
    var setTag8 = "[object Set]";
    var weakMapTag4 = "[object WeakMap]";
    var dataViewTag6 = "[object DataView]";
    var dataViewCtorString2 = toSource2(DataView2);
    var mapCtorString2 = toSource2(Map3);
    var promiseCtorString2 = toSource2(Promise3);
    var setCtorString2 = toSource2(Set3);
    var weakMapCtorString2 = toSource2(WeakMap3);
    var getTag2 = baseGetTag2;
    if (DataView2 && getTag2(new DataView2(new ArrayBuffer(1))) != dataViewTag6 || Map3 && getTag2(new Map3()) != mapTag8 || Promise3 && getTag2(Promise3.resolve()) != promiseTag2 || Set3 && getTag2(new Set3()) != setTag8 || WeakMap3 && getTag2(new WeakMap3()) != weakMapTag4) {
      getTag2 = function(value) {
        var result = baseGetTag2(value), Ctor = result == objectTag5 ? value.constructor : void 0, ctorString = Ctor ? toSource2(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString2:
              return dataViewTag6;
            case mapCtorString2:
              return mapTag8;
            case promiseCtorString2:
              return promiseTag2;
            case setCtorString2:
              return setTag8;
            case weakMapCtorString2:
              return weakMapTag4;
          }
        }
        return result;
      };
    }
    module2.exports = getTag2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsEqualDeep.js"(exports2, module2) {
    var Stack2 = require_Stack();
    var equalArrays2 = require_equalArrays();
    var equalByTag2 = require_equalByTag();
    var equalObjects2 = require_equalObjects();
    var getTag2 = require_getTag();
    var isArray2 = require_isArray();
    var isBuffer2 = require_isBuffer();
    var isTypedArray2 = require_isTypedArray();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var argsTag5 = "[object Arguments]";
    var arrayTag4 = "[object Array]";
    var objectTag5 = "[object Object]";
    var objectProto21 = Object.prototype;
    var hasOwnProperty18 = objectProto21.hasOwnProperty;
    function baseIsEqualDeep2(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray2(object), othIsArr = isArray2(other), objTag = objIsArr ? arrayTag4 : getTag2(object), othTag = othIsArr ? arrayTag4 : getTag2(other);
      objTag = objTag == argsTag5 ? objectTag5 : objTag;
      othTag = othTag == argsTag5 ? objectTag5 : othTag;
      var objIsObj = objTag == objectTag5, othIsObj = othTag == objectTag5, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer2(object)) {
        if (!isBuffer2(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack2());
        return objIsArr || isTypedArray2(object) ? equalArrays2(object, other, bitmask, customizer, equalFunc, stack) : equalByTag2(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG7)) {
        var objIsWrapped = objIsObj && hasOwnProperty18.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty18.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack2());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack2());
      return equalObjects2(object, other, bitmask, customizer, equalFunc, stack);
    }
    module2.exports = baseIsEqualDeep2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsEqual.js"(exports2, module2) {
    var baseIsEqualDeep2 = require_baseIsEqualDeep();
    var isObjectLike2 = require_isObjectLike();
    function baseIsEqual2(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike2(value) && !isObjectLike2(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep2(value, other, bitmask, customizer, baseIsEqual2, stack);
    }
    module2.exports = baseIsEqual2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIsMatch.js
var require_baseIsMatch = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIsMatch.js"(exports2, module2) {
    var Stack2 = require_Stack();
    var baseIsEqual2 = require_baseIsEqual();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var COMPARE_UNORDERED_FLAG5 = 2;
    function baseIsMatch2(object, source, matchData, customizer) {
      var index = matchData.length, length = index, noCustomizer = !customizer;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0], objValue = object[key], srcValue = data[1];
        if (noCustomizer && data[2]) {
          if (objValue === void 0 && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack2();
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === void 0 ? baseIsEqual2(srcValue, objValue, COMPARE_PARTIAL_FLAG7 | COMPARE_UNORDERED_FLAG5, customizer, stack) : result)) {
            return false;
          }
        }
      }
      return true;
    }
    module2.exports = baseIsMatch2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isStrictComparable.js
var require_isStrictComparable = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isStrictComparable.js"(exports2, module2) {
    var isObject2 = require_isObject();
    function isStrictComparable2(value) {
      return value === value && !isObject2(value);
    }
    module2.exports = isStrictComparable2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_getMatchData.js
var require_getMatchData = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_getMatchData.js"(exports2, module2) {
    var isStrictComparable2 = require_isStrictComparable();
    var keys2 = require_keys();
    function getMatchData2(object) {
      var result = keys2(object), length = result.length;
      while (length--) {
        var key = result[length], value = object[key];
        result[length] = [key, value, isStrictComparable2(value)];
      }
      return result;
    }
    module2.exports = getMatchData2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_matchesStrictComparable.js
var require_matchesStrictComparable = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_matchesStrictComparable.js"(exports2, module2) {
    function matchesStrictComparable2(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
      };
    }
    module2.exports = matchesStrictComparable2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseMatches.js
var require_baseMatches = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseMatches.js"(exports2, module2) {
    var baseIsMatch2 = require_baseIsMatch();
    var getMatchData2 = require_getMatchData();
    var matchesStrictComparable2 = require_matchesStrictComparable();
    function baseMatches2(source) {
      var matchData = getMatchData2(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable2(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch2(object, source, matchData);
      };
    }
    module2.exports = baseMatches2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_isKey.js
var require_isKey = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_isKey.js"(exports2, module2) {
    var isArray2 = require_isArray();
    var isSymbol2 = require_isSymbol();
    var reIsDeepProp2 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp2 = /^\w*$/;
    function isKey2(value, object) {
      if (isArray2(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol2(value)) {
        return true;
      }
      return reIsPlainProp2.test(value) || !reIsDeepProp2.test(value) || object != null && value in Object(object);
    }
    module2.exports = isKey2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/memoize.js
var require_memoize = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/memoize.js"(exports2, module2) {
    var MapCache2 = require_MapCache();
    var FUNC_ERROR_TEXT3 = "Expected a function";
    function memoize2(func, resolver) {
      if (typeof func != "function" || resolver != null && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT3);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize2.Cache || MapCache2)();
      return memoized;
    }
    memoize2.Cache = MapCache2;
    module2.exports = memoize2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_memoizeCapped.js
var require_memoizeCapped = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_memoizeCapped.js"(exports2, module2) {
    var memoize2 = require_memoize();
    var MAX_MEMOIZE_SIZE2 = 500;
    function memoizeCapped2(func) {
      var result = memoize2(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE2) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    module2.exports = memoizeCapped2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_stringToPath.js
var require_stringToPath = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_stringToPath.js"(exports2, module2) {
    var memoizeCapped2 = require_memoizeCapped();
    var rePropName2 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar2 = /\\(\\)?/g;
    var stringToPath2 = memoizeCapped2(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46) {
        result.push("");
      }
      string.replace(rePropName2, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar2, "$1") : number || match);
      });
      return result;
    });
    module2.exports = stringToPath2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_castPath.js
var require_castPath = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_castPath.js"(exports2, module2) {
    var isArray2 = require_isArray();
    var isKey2 = require_isKey();
    var stringToPath2 = require_stringToPath();
    var toString2 = require_toString();
    function castPath2(value, object) {
      if (isArray2(value)) {
        return value;
      }
      return isKey2(value, object) ? [value] : stringToPath2(toString2(value));
    }
    module2.exports = castPath2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_toKey.js
var require_toKey = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_toKey.js"(exports2, module2) {
    var isSymbol2 = require_isSymbol();
    var INFINITY5 = 1 / 0;
    function toKey2(value) {
      if (typeof value == "string" || isSymbol2(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY5 ? "-0" : result;
    }
    module2.exports = toKey2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseGet.js
var require_baseGet = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseGet.js"(exports2, module2) {
    var castPath2 = require_castPath();
    var toKey2 = require_toKey();
    function baseGet2(object, path8) {
      path8 = castPath2(path8, object);
      var index = 0, length = path8.length;
      while (object != null && index < length) {
        object = object[toKey2(path8[index++])];
      }
      return index && index == length ? object : void 0;
    }
    module2.exports = baseGet2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/get.js
var require_get = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/get.js"(exports2, module2) {
    var baseGet2 = require_baseGet();
    function get2(object, path8, defaultValue) {
      var result = object == null ? void 0 : baseGet2(object, path8);
      return result === void 0 ? defaultValue : result;
    }
    module2.exports = get2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseHasIn.js
var require_baseHasIn = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseHasIn.js"(exports2, module2) {
    function baseHasIn2(object, key) {
      return object != null && key in Object(object);
    }
    module2.exports = baseHasIn2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_hasPath.js
var require_hasPath = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_hasPath.js"(exports2, module2) {
    var castPath2 = require_castPath();
    var isArguments2 = require_isArguments();
    var isArray2 = require_isArray();
    var isIndex2 = require_isIndex();
    var isLength2 = require_isLength();
    var toKey2 = require_toKey();
    function hasPath2(object, path8, hasFunc) {
      path8 = castPath2(path8, object);
      var index = -1, length = path8.length, result = false;
      while (++index < length) {
        var key = toKey2(path8[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength2(length) && isIndex2(key, length) && (isArray2(object) || isArguments2(object));
    }
    module2.exports = hasPath2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/hasIn.js
var require_hasIn = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/hasIn.js"(exports2, module2) {
    var baseHasIn2 = require_baseHasIn();
    var hasPath2 = require_hasPath();
    function hasIn2(object, path8) {
      return object != null && hasPath2(object, path8, baseHasIn2);
    }
    module2.exports = hasIn2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseMatchesProperty.js
var require_baseMatchesProperty = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseMatchesProperty.js"(exports2, module2) {
    var baseIsEqual2 = require_baseIsEqual();
    var get2 = require_get();
    var hasIn2 = require_hasIn();
    var isKey2 = require_isKey();
    var isStrictComparable2 = require_isStrictComparable();
    var matchesStrictComparable2 = require_matchesStrictComparable();
    var toKey2 = require_toKey();
    var COMPARE_PARTIAL_FLAG7 = 1;
    var COMPARE_UNORDERED_FLAG5 = 2;
    function baseMatchesProperty2(path8, srcValue) {
      if (isKey2(path8) && isStrictComparable2(srcValue)) {
        return matchesStrictComparable2(toKey2(path8), srcValue);
      }
      return function(object) {
        var objValue = get2(object, path8);
        return objValue === void 0 && objValue === srcValue ? hasIn2(object, path8) : baseIsEqual2(srcValue, objValue, COMPARE_PARTIAL_FLAG7 | COMPARE_UNORDERED_FLAG5);
      };
    }
    module2.exports = baseMatchesProperty2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/identity.js
var require_identity = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/identity.js"(exports2, module2) {
    function identity2(value) {
      return value;
    }
    module2.exports = identity2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseProperty.js
var require_baseProperty = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseProperty.js"(exports2, module2) {
    function baseProperty2(key) {
      return function(object) {
        return object == null ? void 0 : object[key];
      };
    }
    module2.exports = baseProperty2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_basePropertyDeep.js
var require_basePropertyDeep = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_basePropertyDeep.js"(exports2, module2) {
    var baseGet2 = require_baseGet();
    function basePropertyDeep2(path8) {
      return function(object) {
        return baseGet2(object, path8);
      };
    }
    module2.exports = basePropertyDeep2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/property.js
var require_property = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/property.js"(exports2, module2) {
    var baseProperty2 = require_baseProperty();
    var basePropertyDeep2 = require_basePropertyDeep();
    var isKey2 = require_isKey();
    var toKey2 = require_toKey();
    function property2(path8) {
      return isKey2(path8) ? baseProperty2(toKey2(path8)) : basePropertyDeep2(path8);
    }
    module2.exports = property2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseIteratee.js
var require_baseIteratee = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseIteratee.js"(exports2, module2) {
    var baseMatches2 = require_baseMatches();
    var baseMatchesProperty2 = require_baseMatchesProperty();
    var identity2 = require_identity();
    var isArray2 = require_isArray();
    var property2 = require_property();
    function baseIteratee2(value) {
      if (typeof value == "function") {
        return value;
      }
      if (value == null) {
        return identity2;
      }
      if (typeof value == "object") {
        return isArray2(value) ? baseMatchesProperty2(value[0], value[1]) : baseMatches2(value);
      }
      return property2(value);
    }
    module2.exports = baseIteratee2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_createFind.js
var require_createFind = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_createFind.js"(exports2, module2) {
    var baseIteratee2 = require_baseIteratee();
    var isArrayLike2 = require_isArrayLike();
    var keys2 = require_keys();
    function createFind2(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike2(collection)) {
          var iteratee = baseIteratee2(predicate, 3);
          collection = keys2(collection);
          predicate = function(key) {
            return iteratee(iterable[key], key, iterable);
          };
        }
        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
      };
    }
    module2.exports = createFind2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseFindIndex.js
var require_baseFindIndex = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseFindIndex.js"(exports2, module2) {
    function baseFindIndex2(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    module2.exports = baseFindIndex2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_trimmedEndIndex.js
var require_trimmedEndIndex = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_trimmedEndIndex.js"(exports2, module2) {
    var reWhitespace2 = /\s/;
    function trimmedEndIndex2(string) {
      var index = string.length;
      while (index-- && reWhitespace2.test(string.charAt(index))) {
      }
      return index;
    }
    module2.exports = trimmedEndIndex2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/_baseTrim.js
var require_baseTrim = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/_baseTrim.js"(exports2, module2) {
    var trimmedEndIndex2 = require_trimmedEndIndex();
    var reTrimStart2 = /^\s+/;
    function baseTrim2(string) {
      return string ? string.slice(0, trimmedEndIndex2(string) + 1).replace(reTrimStart2, "") : string;
    }
    module2.exports = baseTrim2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/toNumber.js
var require_toNumber = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/toNumber.js"(exports2, module2) {
    var baseTrim2 = require_baseTrim();
    var isObject2 = require_isObject();
    var isSymbol2 = require_isSymbol();
    var NAN2 = 0 / 0;
    var reIsBadHex2 = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary2 = /^0b[01]+$/i;
    var reIsOctal2 = /^0o[0-7]+$/i;
    var freeParseInt2 = parseInt;
    function toNumber2(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol2(value)) {
        return NAN2;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = baseTrim2(value);
      var isBinary = reIsBinary2.test(value);
      return isBinary || reIsOctal2.test(value) ? freeParseInt2(value.slice(2), isBinary ? 2 : 8) : reIsBadHex2.test(value) ? NAN2 : +value;
    }
    module2.exports = toNumber2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/toFinite.js
var require_toFinite = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/toFinite.js"(exports2, module2) {
    var toNumber2 = require_toNumber();
    var INFINITY5 = 1 / 0;
    var MAX_INTEGER2 = 17976931348623157e292;
    function toFinite2(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber2(value);
      if (value === INFINITY5 || value === -INFINITY5) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER2;
      }
      return value === value ? value : 0;
    }
    module2.exports = toFinite2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/toInteger.js
var require_toInteger = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/toInteger.js"(exports2, module2) {
    var toFinite2 = require_toFinite();
    function toInteger2(value) {
      var result = toFinite2(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    module2.exports = toInteger2;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/findLastIndex.js
var require_findLastIndex = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/findLastIndex.js"(exports2, module2) {
    var baseFindIndex2 = require_baseFindIndex();
    var baseIteratee2 = require_baseIteratee();
    var toInteger2 = require_toInteger();
    var nativeMax5 = Math.max;
    var nativeMin = Math.min;
    function findLastIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = length - 1;
      if (fromIndex !== void 0) {
        index = toInteger2(fromIndex);
        index = fromIndex < 0 ? nativeMax5(length + index, 0) : nativeMin(index, length - 1);
      }
      return baseFindIndex2(array, baseIteratee2(predicate, 3), index, true);
    }
    module2.exports = findLastIndex;
  }
});

// ../../node_modules/java-parser/node_modules/lodash/findLast.js
var require_findLast = __commonJS({
  "../../node_modules/java-parser/node_modules/lodash/findLast.js"(exports2, module2) {
    var createFind2 = require_createFind();
    var findLastIndex = require_findLastIndex();
    var findLast2 = createFind2(findLastIndex);
    module2.exports = findLast2;
  }
});

// ../../node_modules/fast-glob/out/utils/array.js
var require_array = __commonJS({
  "../../node_modules/fast-glob/out/utils/array.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.splitWhen = exports2.flatten = void 0;
    function flatten2(items) {
      return items.reduce((collection, item) => [].concat(collection, item), []);
    }
    exports2.flatten = flatten2;
    function splitWhen(items, predicate) {
      const result = [[]];
      let groupIndex = 0;
      for (const item of items) {
        if (predicate(item)) {
          groupIndex++;
          result[groupIndex] = [];
        } else {
          result[groupIndex].push(item);
        }
      }
      return result;
    }
    exports2.splitWhen = splitWhen;
  }
});

// ../../node_modules/fast-glob/out/utils/errno.js
var require_errno = __commonJS({
  "../../node_modules/fast-glob/out/utils/errno.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEnoentCodeError = void 0;
    function isEnoentCodeError(error) {
      return error.code === "ENOENT";
    }
    exports2.isEnoentCodeError = isEnoentCodeError;
  }
});

// ../../node_modules/fast-glob/out/utils/fs.js
var require_fs = __commonJS({
  "../../node_modules/fast-glob/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name, stats) {
      return new DirentFromStats(name, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// ../../node_modules/fast-glob/out/utils/path.js
var require_path = __commonJS({
  "../../node_modules/fast-glob/out/utils/path.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPosixPathToPattern = exports2.convertWindowsPathToPattern = exports2.convertPathToPattern = exports2.escapePosixPath = exports2.escapeWindowsPath = exports2.escape = exports2.removeLeadingDotSegment = exports2.makeAbsolute = exports2.unixify = void 0;
    var os3 = require("os");
    var path8 = require("path");
    var IS_WINDOWS_PLATFORM = os3.platform() === "win32";
    var LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2;
    var POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
    var WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;
    var DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
    var WINDOWS_BACKSLASHES_RE = /\\(?![!()+@[\]{}])/g;
    function unixify(filepath) {
      return filepath.replace(/\\/g, "/");
    }
    exports2.unixify = unixify;
    function makeAbsolute(cwd, filepath) {
      return path8.resolve(cwd, filepath);
    }
    exports2.makeAbsolute = makeAbsolute;
    function removeLeadingDotSegment(entry) {
      if (entry.charAt(0) === ".") {
        const secondCharactery = entry.charAt(1);
        if (secondCharactery === "/" || secondCharactery === "\\") {
          return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
        }
      }
      return entry;
    }
    exports2.removeLeadingDotSegment = removeLeadingDotSegment;
    exports2.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
    function escapeWindowsPath(pattern) {
      return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapeWindowsPath = escapeWindowsPath;
    function escapePosixPath(pattern) {
      return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapePosixPath = escapePosixPath;
    exports2.convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;
    function convertWindowsPathToPattern(filepath) {
      return escapeWindowsPath(filepath).replace(DOS_DEVICE_PATH_RE, "//$1").replace(WINDOWS_BACKSLASHES_RE, "/");
    }
    exports2.convertWindowsPathToPattern = convertWindowsPathToPattern;
    function convertPosixPathToPattern(filepath) {
      return escapePosixPath(filepath);
    }
    exports2.convertPosixPathToPattern = convertPosixPathToPattern;
  }
});

// ../../node_modules/is-extglob/index.js
var require_is_extglob = __commonJS({
  "../../node_modules/is-extglob/index.js"(exports2, module2) {
    module2.exports = function isExtglob(str) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      var match;
      while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
        if (match[2]) return true;
        str = str.slice(match.index + match[0].length);
      }
      return false;
    };
  }
});

// ../../node_modules/is-glob/index.js
var require_is_glob = __commonJS({
  "../../node_modules/is-glob/index.js"(exports2, module2) {
    var isExtglob = require_is_extglob();
    var chars = { "{": "}", "(": ")", "[": "]" };
    var strictCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      var pipeIndex = -2;
      var closeSquareIndex = -2;
      var closeCurlyIndex = -2;
      var closeParenIndex = -2;
      var backSlashIndex = -2;
      while (index < str.length) {
        if (str[index] === "*") {
          return true;
        }
        if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
          return true;
        }
        if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
          if (closeSquareIndex < index) {
            closeSquareIndex = str.indexOf("]", index);
          }
          if (closeSquareIndex > index) {
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
          }
        }
        if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
          closeCurlyIndex = str.indexOf("}", index);
          if (closeCurlyIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
              return true;
            }
          }
        }
        if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
          closeParenIndex = str.indexOf(")", index);
          if (closeParenIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
        if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
          if (pipeIndex < index) {
            pipeIndex = str.indexOf("|", index);
          }
          if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
            closeParenIndex = str.indexOf(")", pipeIndex);
            if (closeParenIndex > pipeIndex) {
              backSlashIndex = str.indexOf("\\", pipeIndex);
              if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
                return true;
              }
            }
          }
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    var relaxedCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      while (index < str.length) {
        if (/[*?{}()[\]]/.test(str[index])) {
          return true;
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    module2.exports = function isGlob(str, options) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      if (isExtglob(str)) {
        return true;
      }
      var check = strictCheck;
      if (options && options.strict === false) {
        check = relaxedCheck;
      }
      return check(str);
    };
  }
});

// ../../node_modules/glob-parent/index.js
var require_glob_parent = __commonJS({
  "../../node_modules/glob-parent/index.js"(exports2, module2) {
    "use strict";
    var isGlob = require_is_glob();
    var pathPosixDirname = require("path").posix.dirname;
    var isWin32 = require("os").platform() === "win32";
    var slash = "/";
    var backslash = /\\/g;
    var enclosure = /[\{\[].*[\}\]]$/;
    var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
    var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
    module2.exports = function globParent(str, opts) {
      var options = Object.assign({ flipBackslashes: true }, opts);
      if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
        str = str.replace(backslash, slash);
      }
      if (enclosure.test(str)) {
        str += slash;
      }
      str += "a";
      do {
        str = pathPosixDirname(str);
      } while (isGlob(str) || globby.test(str));
      return str.replace(escaped, "$1");
    };
  }
});

// ../../node_modules/braces/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/braces/lib/utils.js"(exports2) {
    "use strict";
    exports2.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports2.find = (node, type) => node.nodes.find((node2) => node2.type === type);
    exports2.exceedsLimit = (min2, max, step = 1, limit) => {
      if (limit === false) return false;
      if (!exports2.isInteger(min2) || !exports2.isInteger(max)) return false;
      return (Number(max) - Number(min2)) / Number(step) >= limit;
    };
    exports2.escapeNode = (block2, n = 0, type) => {
      const node = block2.nodes[n];
      if (!node) return;
      if (type && node.type === type || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports2.encloseBrace = (node) => {
      if (node.type !== "brace") return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isInvalidBrace = (block2) => {
      if (block2.type !== "brace") return false;
      if (block2.invalid === true || block2.dollar) return true;
      if (block2.commas >> 0 + block2.ranges >> 0 === 0) {
        block2.invalid = true;
        return true;
      }
      if (block2.open !== true || block2.close !== true) {
        block2.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text") acc.push(node.value);
      if (node.type === "range") node.type = "text";
      return acc;
    }, []);
    exports2.flatten = (...args) => {
      const result = [];
      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const ele = arr[i];
          if (Array.isArray(ele)) {
            flat(ele);
            continue;
          }
          if (ele !== void 0) {
            result.push(ele);
          }
        }
        return result;
      };
      flat(args);
      return result;
    };
  }
});

// ../../node_modules/braces/lib/stringify.js
var require_stringify = __commonJS({
  "../../node_modules/braces/lib/stringify.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    module2.exports = (ast, options = {}) => {
      const stringify = (node, parent = {}) => {
        const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        let output = "";
        if (node.value) {
          if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
            return "\\" + node.value;
          }
          return node.value;
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes) {
          for (const child2 of node.nodes) {
            output += stringify(child2);
          }
        }
        return output;
      };
      return stringify(ast);
    };
  }
});

// ../../node_modules/is-number/index.js
var require_is_number = __commonJS({
  "../../node_modules/is-number/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(num) {
      if (typeof num === "number") {
        return num - num === 0;
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }
      return false;
    };
  }
});

// ../../node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS({
  "../../node_modules/to-regex-range/index.js"(exports2, module2) {
    "use strict";
    var isNumber = require_is_number();
    var toRegexRange = (min2, max, options) => {
      if (isNumber(min2) === false) {
        throw new TypeError("toRegexRange: expected the first argument to be a number");
      }
      if (max === void 0 || min2 === max) {
        return String(min2);
      }
      if (isNumber(max) === false) {
        throw new TypeError("toRegexRange: expected the second argument to be a number.");
      }
      let opts = { relaxZeros: true, ...options };
      if (typeof opts.strictZeros === "boolean") {
        opts.relaxZeros = opts.strictZeros === false;
      }
      let relax = String(opts.relaxZeros);
      let shorthand = String(opts.shorthand);
      let capture = String(opts.capture);
      let wrap = String(opts.wrap);
      let cacheKey = min2 + ":" + max + "=" + relax + shorthand + capture + wrap;
      if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
        return toRegexRange.cache[cacheKey].result;
      }
      let a = Math.min(min2, max);
      let b = Math.max(min2, max);
      if (Math.abs(a - b) === 1) {
        let result = min2 + "|" + max;
        if (opts.capture) {
          return `(${result})`;
        }
        if (opts.wrap === false) {
          return result;
        }
        return `(?:${result})`;
      }
      let isPadded = hasPadding(min2) || hasPadding(max);
      let state = { min: min2, max, a, b };
      let positives = [];
      let negatives = [];
      if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
      }
      if (a < 0) {
        let newMin = b < 0 ? Math.abs(b) : 1;
        negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
        a = state.a = 0;
      }
      if (b >= 0) {
        positives = splitToPatterns(a, b, state, opts);
      }
      state.negatives = negatives;
      state.positives = positives;
      state.result = collatePatterns(negatives, positives, opts);
      if (opts.capture === true) {
        state.result = `(${state.result})`;
      } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
      }
      toRegexRange.cache[cacheKey] = state;
      return state.result;
    };
    function collatePatterns(neg, pos, options) {
      let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
      let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
      let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
      let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
      return subpatterns.join("|");
    }
    function splitToRanges(min2, max) {
      let nines = 1;
      let zeros = 1;
      let stop = countNines(min2, nines);
      let stops = /* @__PURE__ */ new Set([max]);
      while (min2 <= stop && stop <= max) {
        stops.add(stop);
        nines += 1;
        stop = countNines(min2, nines);
      }
      stop = countZeros(max + 1, zeros) - 1;
      while (min2 < stop && stop <= max) {
        stops.add(stop);
        zeros += 1;
        stop = countZeros(max + 1, zeros) - 1;
      }
      stops = [...stops];
      stops.sort(compare);
      return stops;
    }
    function rangeToPattern(start, stop, options) {
      if (start === stop) {
        return { pattern: start, count: [], digits: 0 };
      }
      let zipped = zip(start, stop);
      let digits = zipped.length;
      let pattern = "";
      let count = 0;
      for (let i = 0; i < digits; i++) {
        let [startDigit, stopDigit] = zipped[i];
        if (startDigit === stopDigit) {
          pattern += startDigit;
        } else if (startDigit !== "0" || stopDigit !== "9") {
          pattern += toCharacterClass(startDigit, stopDigit, options);
        } else {
          count++;
        }
      }
      if (count) {
        pattern += options.shorthand === true ? "\\d" : "[0-9]";
      }
      return { pattern, count: [count], digits };
    }
    function splitToPatterns(min2, max, tok, options) {
      let ranges = splitToRanges(min2, max);
      let tokens = [];
      let start = min2;
      let prev;
      for (let i = 0; i < ranges.length; i++) {
        let max2 = ranges[i];
        let obj = rangeToPattern(String(start), String(max2), options);
        let zeros = "";
        if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
          if (prev.count.length > 1) {
            prev.count.pop();
          }
          prev.count.push(obj.count[0]);
          prev.string = prev.pattern + toQuantifier(prev.count);
          start = max2 + 1;
          continue;
        }
        if (tok.isPadded) {
          zeros = padZeros(max2, tok, options);
        }
        obj.string = zeros + obj.pattern + toQuantifier(obj.count);
        tokens.push(obj);
        start = max2 + 1;
        prev = obj;
      }
      return tokens;
    }
    function filterPatterns(arr, comparison, prefix, intersection, options) {
      let result = [];
      for (let ele of arr) {
        let { string } = ele;
        if (!intersection && !contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
        if (intersection && contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
      }
      return result;
    }
    function zip(a, b) {
      let arr = [];
      for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
      return arr;
    }
    function compare(a, b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    function contains(arr, key, val) {
      return arr.some((ele) => ele[key] === val);
    }
    function countNines(min2, len) {
      return Number(String(min2).slice(0, -len) + "9".repeat(len));
    }
    function countZeros(integer, zeros) {
      return integer - integer % Math.pow(10, zeros);
    }
    function toQuantifier(digits) {
      let [start = 0, stop = ""] = digits;
      if (stop || start > 1) {
        return `{${start + (stop ? "," + stop : "")}}`;
      }
      return "";
    }
    function toCharacterClass(a, b, options) {
      return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
    }
    function hasPadding(str) {
      return /^-?(0+)\d/.test(str);
    }
    function padZeros(value, tok, options) {
      if (!tok.isPadded) {
        return value;
      }
      let diff = Math.abs(tok.maxLen - String(value).length);
      let relax = options.relaxZeros !== false;
      switch (diff) {
        case 0:
          return "";
        case 1:
          return relax ? "0?" : "0";
        case 2:
          return relax ? "0{0,2}" : "00";
        default: {
          return relax ? `0{0,${diff}}` : `0{${diff}}`;
        }
      }
    }
    toRegexRange.cache = {};
    toRegexRange.clearCache = () => toRegexRange.cache = {};
    module2.exports = toRegexRange;
  }
});

// ../../node_modules/fill-range/index.js
var require_fill_range = __commonJS({
  "../../node_modules/fill-range/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var toRegexRange = require_to_regex_range();
    var isObject2 = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    var transform = (toNumber2) => {
      return (value) => toNumber2 === true ? Number(value) : String(value);
    };
    var isValidValue = (value) => {
      return typeof value === "number" || typeof value === "string" && value !== "";
    };
    var isNumber = (num) => Number.isInteger(+num);
    var zeros = (input) => {
      let value = `${input}`;
      let index = -1;
      if (value[0] === "-") value = value.slice(1);
      if (value === "0") return false;
      while (value[++index] === "0") ;
      return index > 0;
    };
    var stringify = (start, end, options) => {
      if (typeof start === "string" || typeof end === "string") {
        return true;
      }
      return options.stringify === true;
    };
    var pad = (input, maxLength, toNumber2) => {
      if (maxLength > 0) {
        let dash = input[0] === "-" ? "-" : "";
        if (dash) input = input.slice(1);
        input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
      }
      if (toNumber2 === false) {
        return String(input);
      }
      return input;
    };
    var toMaxLen = (input, maxLength) => {
      let negative = input[0] === "-" ? "-" : "";
      if (negative) {
        input = input.slice(1);
        maxLength--;
      }
      while (input.length < maxLength) input = "0" + input;
      return negative ? "-" + input : input;
    };
    var toSequence = (parts, options, maxLen) => {
      parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      let prefix = options.capture ? "" : "?:";
      let positives = "";
      let negatives = "";
      let result;
      if (parts.positives.length) {
        positives = parts.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
      }
      if (parts.negatives.length) {
        negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
      }
      if (positives && negatives) {
        result = `${positives}|${negatives}`;
      } else {
        result = positives || negatives;
      }
      if (options.wrap) {
        return `(${prefix}${result})`;
      }
      return result;
    };
    var toRange = (a, b, isNumbers, options) => {
      if (isNumbers) {
        return toRegexRange(a, b, { wrap: false, ...options });
      }
      let start = String.fromCharCode(a);
      if (a === b) return start;
      let stop = String.fromCharCode(b);
      return `[${start}-${stop}]`;
    };
    var toRegex = (start, end, options) => {
      if (Array.isArray(start)) {
        let wrap = options.wrap === true;
        let prefix = options.capture ? "" : "?:";
        return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
      }
      return toRegexRange(start, end, options);
    };
    var rangeError = (...args) => {
      return new RangeError("Invalid range arguments: " + util.inspect(...args));
    };
    var invalidRange = (start, end, options) => {
      if (options.strictRanges === true) throw rangeError([start, end]);
      return [];
    };
    var invalidStep = (step, options) => {
      if (options.strictRanges === true) {
        throw new TypeError(`Expected step "${step}" to be a number`);
      }
      return [];
    };
    var fillNumbers = (start, end, step = 1, options = {}) => {
      let a = Number(start);
      let b = Number(end);
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        if (options.strictRanges === true) throw rangeError([start, end]);
        return [];
      }
      if (a === 0) a = 0;
      if (b === 0) b = 0;
      let descending = a > b;
      let startString = String(start);
      let endString = String(end);
      let stepString = String(step);
      step = Math.max(Math.abs(step), 1);
      let padded = zeros(startString) || zeros(endString) || zeros(stepString);
      let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
      let toNumber2 = padded === false && stringify(start, end, options) === false;
      let format = options.transform || transform(toNumber2);
      if (options.toRegex && step === 1) {
        return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
      }
      let parts = { negatives: [], positives: [] };
      let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        if (options.toRegex === true && step > 1) {
          push(a);
        } else {
          range.push(pad(format(a, index), maxLen, toNumber2));
        }
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return step > 1 ? toSequence(parts, options, maxLen) : toRegex(range, null, { wrap: false, ...options });
      }
      return range;
    };
    var fillLetters = (start, end, step = 1, options = {}) => {
      if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
        return invalidRange(start, end, options);
      }
      let format = options.transform || ((val) => String.fromCharCode(val));
      let a = `${start}`.charCodeAt(0);
      let b = `${end}`.charCodeAt(0);
      let descending = a > b;
      let min2 = Math.min(a, b);
      let max = Math.max(a, b);
      if (options.toRegex && step === 1) {
        return toRange(min2, max, false, options);
      }
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        range.push(format(a, index));
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return toRegex(range, null, { wrap: false, options });
      }
      return range;
    };
    var fill = (start, end, step, options = {}) => {
      if (end == null && isValidValue(start)) {
        return [start];
      }
      if (!isValidValue(start) || !isValidValue(end)) {
        return invalidRange(start, end, options);
      }
      if (typeof step === "function") {
        return fill(start, end, 1, { transform: step });
      }
      if (isObject2(step)) {
        return fill(start, end, 0, step);
      }
      let opts = { ...options };
      if (opts.capture === true) opts.wrap = true;
      step = step || opts.step || 1;
      if (!isNumber(step)) {
        if (step != null && !isObject2(step)) return invalidStep(step, opts);
        return fill(start, end, 1, step);
      }
      if (isNumber(start) && isNumber(end)) {
        return fillNumbers(start, end, step, opts);
      }
      return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
    };
    module2.exports = fill;
  }
});

// ../../node_modules/braces/lib/compile.js
var require_compile = __commonJS({
  "../../node_modules/braces/lib/compile.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var utils = require_utils();
    var compile = (ast, options = {}) => {
      const walk = (node, parent = {}) => {
        const invalidBlock = utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        const invalid2 = invalidBlock === true || invalidNode === true;
        const prefix = options.escapeInvalid === true ? "\\" : "";
        let output = "";
        if (node.isOpen === true) {
          return prefix + node.value;
        }
        if (node.isClose === true) {
          console.log("node.isClose", prefix, node.value);
          return prefix + node.value;
        }
        if (node.type === "open") {
          return invalid2 ? prefix + node.value : "(";
        }
        if (node.type === "close") {
          return invalid2 ? prefix + node.value : ")";
        }
        if (node.type === "comma") {
          return node.prev.type === "comma" ? "" : invalid2 ? node.value : "|";
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          const range = fill(...args, { ...options, wrap: false, toRegex: true, strictZeros: true });
          if (range.length !== 0) {
            return args.length > 1 && range.length > 1 ? `(${range})` : range;
          }
        }
        if (node.nodes) {
          for (const child2 of node.nodes) {
            output += walk(child2, node);
          }
        }
        return output;
      };
      return walk(ast);
    };
    module2.exports = compile;
  }
});

// ../../node_modules/braces/lib/expand.js
var require_expand = __commonJS({
  "../../node_modules/braces/lib/expand.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var stringify = require_stringify();
    var utils = require_utils();
    var append = (queue = "", stash = "", enclose = false) => {
      const result = [];
      queue = [].concat(queue);
      stash = [].concat(stash);
      if (!stash.length) return queue;
      if (!queue.length) {
        return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
      }
      for (const item of queue) {
        if (Array.isArray(item)) {
          for (const value of item) {
            result.push(append(value, stash, enclose));
          }
        } else {
          for (let ele of stash) {
            if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
            result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
          }
        }
      }
      return utils.flatten(result);
    };
    var expand = (ast, options = {}) => {
      const rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
      const walk = (node, parent = {}) => {
        node.queue = [];
        let p = parent;
        let q = parent.queue;
        while (p.type !== "brace" && p.type !== "root" && p.parent) {
          p = p.parent;
          q = p.queue;
        }
        if (node.invalid || node.dollar) {
          q.push(append(q.pop(), stringify(node, options)));
          return;
        }
        if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
          q.push(append(q.pop(), ["{}"]));
          return;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
            throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
          }
          let range = fill(...args, options);
          if (range.length === 0) {
            range = stringify(node, options);
          }
          q.push(append(q.pop(), range));
          node.nodes = [];
          return;
        }
        const enclose = utils.encloseBrace(node);
        let queue = node.queue;
        let block2 = node;
        while (block2.type !== "brace" && block2.type !== "root" && block2.parent) {
          block2 = block2.parent;
          queue = block2.queue;
        }
        for (let i = 0; i < node.nodes.length; i++) {
          const child2 = node.nodes[i];
          if (child2.type === "comma" && node.type === "brace") {
            if (i === 1) queue.push("");
            queue.push("");
            continue;
          }
          if (child2.type === "close") {
            q.push(append(q.pop(), queue, enclose));
            continue;
          }
          if (child2.value && child2.type !== "open") {
            queue.push(append(queue.pop(), child2.value));
            continue;
          }
          if (child2.nodes) {
            walk(child2, node);
          }
        }
        return queue;
      };
      return utils.flatten(walk(ast));
    };
    module2.exports = expand;
  }
});

// ../../node_modules/braces/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/braces/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      MAX_LENGTH: 1e4,
      // Digits
      CHAR_0: "0",
      /* 0 */
      CHAR_9: "9",
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: "A",
      /* A */
      CHAR_LOWERCASE_A: "a",
      /* a */
      CHAR_UPPERCASE_Z: "Z",
      /* Z */
      CHAR_LOWERCASE_Z: "z",
      /* z */
      CHAR_LEFT_PARENTHESES: "(",
      /* ( */
      CHAR_RIGHT_PARENTHESES: ")",
      /* ) */
      CHAR_ASTERISK: "*",
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: "&",
      /* & */
      CHAR_AT: "@",
      /* @ */
      CHAR_BACKSLASH: "\\",
      /* \ */
      CHAR_BACKTICK: "`",
      /* ` */
      CHAR_CARRIAGE_RETURN: "\r",
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: "^",
      /* ^ */
      CHAR_COLON: ":",
      /* : */
      CHAR_COMMA: ",",
      /* , */
      CHAR_DOLLAR: "$",
      /* . */
      CHAR_DOT: ".",
      /* . */
      CHAR_DOUBLE_QUOTE: '"',
      /* " */
      CHAR_EQUAL: "=",
      /* = */
      CHAR_EXCLAMATION_MARK: "!",
      /* ! */
      CHAR_FORM_FEED: "\f",
      /* \f */
      CHAR_FORWARD_SLASH: "/",
      /* / */
      CHAR_HASH: "#",
      /* # */
      CHAR_HYPHEN_MINUS: "-",
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: "<",
      /* < */
      CHAR_LEFT_CURLY_BRACE: "{",
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: "[",
      /* [ */
      CHAR_LINE_FEED: "\n",
      /* \n */
      CHAR_NO_BREAK_SPACE: "\xA0",
      /* \u00A0 */
      CHAR_PERCENT: "%",
      /* % */
      CHAR_PLUS: "+",
      /* + */
      CHAR_QUESTION_MARK: "?",
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: ">",
      /* > */
      CHAR_RIGHT_CURLY_BRACE: "}",
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: "]",
      /* ] */
      CHAR_SEMICOLON: ";",
      /* ; */
      CHAR_SINGLE_QUOTE: "'",
      /* ' */
      CHAR_SPACE: " ",
      /*   */
      CHAR_TAB: "	",
      /* \t */
      CHAR_UNDERSCORE: "_",
      /* _ */
      CHAR_VERTICAL_LINE: "|",
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
      /* \uFEFF */
    };
  }
});

// ../../node_modules/braces/lib/parse.js
var require_parse = __commonJS({
  "../../node_modules/braces/lib/parse.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var {
      MAX_LENGTH,
      CHAR_BACKSLASH,
      /* \ */
      CHAR_BACKTICK,
      /* ` */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_RIGHT_SQUARE_BRACKET,
      /* ] */
      CHAR_DOUBLE_QUOTE,
      /* " */
      CHAR_SINGLE_QUOTE,
      /* ' */
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE
    } = require_constants();
    var parse2 = (input, options = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      const opts = options || {};
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      if (input.length > max) {
        throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
      }
      const ast = { type: "root", input, nodes: [] };
      const stack = [ast];
      let block2 = ast;
      let prev = ast;
      let brackets = 0;
      const length = input.length;
      let index = 0;
      let depth = 0;
      let value;
      const advance = () => input[index++];
      const push = (node) => {
        if (node.type === "text" && prev.type === "dot") {
          prev.type = "text";
        }
        if (prev && prev.type === "text" && node.type === "text") {
          prev.value += node.value;
          return;
        }
        block2.nodes.push(node);
        node.parent = block2;
        node.prev = prev;
        prev = node;
        return node;
      };
      push({ type: "bos" });
      while (index < length) {
        block2 = stack[stack.length - 1];
        value = advance();
        if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
          continue;
        }
        if (value === CHAR_BACKSLASH) {
          push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
          continue;
        }
        if (value === CHAR_RIGHT_SQUARE_BRACKET) {
          push({ type: "text", value: "\\" + value });
          continue;
        }
        if (value === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          let next;
          while (index < length && (next = advance())) {
            value += next;
            if (next === CHAR_LEFT_SQUARE_BRACKET) {
              brackets++;
              continue;
            }
            if (next === CHAR_BACKSLASH) {
              value += advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              brackets--;
              if (brackets === 0) {
                break;
              }
            }
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_PARENTHESES) {
          block2 = push({ type: "paren", nodes: [] });
          stack.push(block2);
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_RIGHT_PARENTHESES) {
          if (block2.type !== "paren") {
            push({ type: "text", value });
            continue;
          }
          block2 = stack.pop();
          push({ type: "text", value });
          block2 = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
          const open = value;
          let next;
          if (options.keepQuotes !== true) {
            value = "";
          }
          while (index < length && (next = advance())) {
            if (next === CHAR_BACKSLASH) {
              value += next + advance();
              continue;
            }
            if (next === open) {
              if (options.keepQuotes === true) value += next;
              break;
            }
            value += next;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_CURLY_BRACE) {
          depth++;
          const dollar = prev.value && prev.value.slice(-1) === "$" || block2.dollar === true;
          const brace = {
            type: "brace",
            open: true,
            close: false,
            dollar,
            depth,
            commas: 0,
            ranges: 0,
            nodes: []
          };
          block2 = push(brace);
          stack.push(block2);
          push({ type: "open", value });
          continue;
        }
        if (value === CHAR_RIGHT_CURLY_BRACE) {
          if (block2.type !== "brace") {
            push({ type: "text", value });
            continue;
          }
          const type = "close";
          block2 = stack.pop();
          block2.close = true;
          push({ type, value });
          depth--;
          block2 = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_COMMA && depth > 0) {
          if (block2.ranges > 0) {
            block2.ranges = 0;
            const open = block2.nodes.shift();
            block2.nodes = [open, { type: "text", value: stringify(block2) }];
          }
          push({ type: "comma", value });
          block2.commas++;
          continue;
        }
        if (value === CHAR_DOT && depth > 0 && block2.commas === 0) {
          const siblings = block2.nodes;
          if (depth === 0 || siblings.length === 0) {
            push({ type: "text", value });
            continue;
          }
          if (prev.type === "dot") {
            block2.range = [];
            prev.value += value;
            prev.type = "range";
            if (block2.nodes.length !== 3 && block2.nodes.length !== 5) {
              block2.invalid = true;
              block2.ranges = 0;
              prev.type = "text";
              continue;
            }
            block2.ranges++;
            block2.args = [];
            continue;
          }
          if (prev.type === "range") {
            siblings.pop();
            const before = siblings[siblings.length - 1];
            before.value += prev.value + value;
            prev = before;
            block2.ranges--;
            continue;
          }
          push({ type: "dot", value });
          continue;
        }
        push({ type: "text", value });
      }
      do {
        block2 = stack.pop();
        if (block2.type !== "root") {
          block2.nodes.forEach((node) => {
            if (!node.nodes) {
              if (node.type === "open") node.isOpen = true;
              if (node.type === "close") node.isClose = true;
              if (!node.nodes) node.type = "text";
              node.invalid = true;
            }
          });
          const parent = stack[stack.length - 1];
          const index2 = parent.nodes.indexOf(block2);
          parent.nodes.splice(index2, 1, ...block2.nodes);
        }
      } while (stack.length > 0);
      push({ type: "eos" });
      return ast;
    };
    module2.exports = parse2;
  }
});

// ../../node_modules/braces/index.js
var require_braces = __commonJS({
  "../../node_modules/braces/index.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var compile = require_compile();
    var expand = require_expand();
    var parse2 = require_parse();
    var braces = (input, options = {}) => {
      let output = [];
      if (Array.isArray(input)) {
        for (const pattern of input) {
          const result = braces.create(pattern, options);
          if (Array.isArray(result)) {
            output.push(...result);
          } else {
            output.push(result);
          }
        }
      } else {
        output = [].concat(braces.create(input, options));
      }
      if (options && options.expand === true && options.nodupes === true) {
        output = [...new Set(output)];
      }
      return output;
    };
    braces.parse = (input, options = {}) => parse2(input, options);
    braces.stringify = (input, options = {}) => {
      if (typeof input === "string") {
        return stringify(braces.parse(input, options), options);
      }
      return stringify(input, options);
    };
    braces.compile = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      return compile(input, options);
    };
    braces.expand = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      let result = expand(input, options);
      if (options.noempty === true) {
        result = result.filter(Boolean);
      }
      if (options.nodupes === true) {
        result = [...new Set(result)];
      }
      return result;
    };
    braces.create = (input, options = {}) => {
      if (input === "" || input.length < 3) {
        return [input];
      }
      return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
    };
    module2.exports = braces;
  }
});

// ../../node_modules/picomatch/lib/constants.js
var require_constants2 = __commonJS({
  "../../node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var path8 = require("path");
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      SEP: path8.sep,
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// ../../node_modules/picomatch/lib/utils.js
var require_utils2 = __commonJS({
  "../../node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var path8 = require("path");
    var win32 = process.platform === "win32";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants2();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports2.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path8.sep === "\\";
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  }
});

// ../../node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "../../node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants2();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// ../../node_modules/picomatch/lib/parse.js
var require_parse2 = __commonJS({
  "../../node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants2();
    var utils = require_utils2();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel2 = (input) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values2 = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values2.length; i++) {
        for (let j = i + 1; j < values2.length; j++) {
          const a = values2[i];
          const b = values2[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel2(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel2(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse2 = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const win32 = utils.isWindows(options);
      const PLATFORM_CHARS = constants.globChars(win32);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star2 = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star2 = `(${star2})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate2 = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star2;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.value += tok.value;
          prev.output = (prev.output || "") + tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star2;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star2 || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse2(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first2, rest, index) => {
          if (first2 === "\\") {
            backslashes = true;
            return m;
          }
          if (first2 === "?") {
            if (esc) {
              return esc + first2 + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first2 === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first2 === "*") {
            if (esc) {
              return esc + first2 + (rest ? star2 : "");
            }
            return star2;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (next === "<" && !utils.supportsLookbehinds()) {
              throw new Error("Node.js v10 or higher is required for regex lookbehinds");
            }
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate2();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star2;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star2 };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse2.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const win32 = utils.isWindows(options);
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(win32);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star2 = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star2 = `(${star2})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star2;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star2}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star2}`;
          case "*.*":
            return `${nodot}${star2}${DOT_LITERAL}${ONE_CHAR}${star2}`;
          case "*/*":
            return `${nodot}${star2}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star2}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star2}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star2}${DOT_LITERAL}${ONE_CHAR}${star2}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star2}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse2;
  }
});

// ../../node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "../../node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var path8 = require("path");
    var scan = require_scan();
    var parse2 = require_parse2();
    var utils = require_utils2();
    var constants = require_constants2();
    var isObject2 = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject2(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = utils.isWindows(options);
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(path8.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch.parse(p, options));
      return parse2(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse2.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse2(input, options);
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true) throw err;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// ../../node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "../../node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_picomatch();
  }
});

// ../../node_modules/micromatch/index.js
var require_micromatch = __commonJS({
  "../../node_modules/micromatch/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var braces = require_braces();
    var picomatch = require_picomatch2();
    var utils = require_utils2();
    var isEmptyString = (v) => v === "" || v === "./";
    var hasBraces = (v) => {
      const index = v.indexOf("{");
      return index > -1 && v.indexOf("}", index) > -1;
    };
    var micromatch = (list, patterns, options) => {
      patterns = [].concat(patterns);
      list = [].concat(list);
      let omit = /* @__PURE__ */ new Set();
      let keep = /* @__PURE__ */ new Set();
      let items = /* @__PURE__ */ new Set();
      let negatives = 0;
      let onResult = (state) => {
        items.add(state.output);
        if (options && options.onResult) {
          options.onResult(state);
        }
      };
      for (let i = 0; i < patterns.length; i++) {
        let isMatch = picomatch(String(patterns[i]), { ...options, onResult }, true);
        let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
        if (negated) negatives++;
        for (let item of list) {
          let matched = isMatch(item, true);
          let match = negated ? !matched.isMatch : matched.isMatch;
          if (!match) continue;
          if (negated) {
            omit.add(matched.output);
          } else {
            omit.delete(matched.output);
            keep.add(matched.output);
          }
        }
      }
      let result = negatives === patterns.length ? [...items] : [...keep];
      let matches = result.filter((item) => !omit.has(item));
      if (options && matches.length === 0) {
        if (options.failglob === true) {
          throw new Error(`No matches found for "${patterns.join(", ")}"`);
        }
        if (options.nonull === true || options.nullglob === true) {
          return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
        }
      }
      return matches;
    };
    micromatch.match = micromatch;
    micromatch.matcher = (pattern, options) => picomatch(pattern, options);
    micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    micromatch.any = micromatch.isMatch;
    micromatch.not = (list, patterns, options = {}) => {
      patterns = [].concat(patterns).map(String);
      let result = /* @__PURE__ */ new Set();
      let items = [];
      let onResult = (state) => {
        if (options.onResult) options.onResult(state);
        items.push(state.output);
      };
      let matches = new Set(micromatch(list, patterns, { ...options, onResult }));
      for (let item of items) {
        if (!matches.has(item)) {
          result.add(item);
        }
      }
      return [...result];
    };
    micromatch.contains = (str, pattern, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      if (Array.isArray(pattern)) {
        return pattern.some((p) => micromatch.contains(str, p, options));
      }
      if (typeof pattern === "string") {
        if (isEmptyString(str) || isEmptyString(pattern)) {
          return false;
        }
        if (str.includes(pattern) || str.startsWith("./") && str.slice(2).includes(pattern)) {
          return true;
        }
      }
      return micromatch.isMatch(str, pattern, { ...options, contains: true });
    };
    micromatch.matchKeys = (obj, patterns, options) => {
      if (!utils.isObject(obj)) {
        throw new TypeError("Expected the first argument to be an object");
      }
      let keys2 = micromatch(Object.keys(obj), patterns, options);
      let res = {};
      for (let key of keys2) res[key] = obj[key];
      return res;
    };
    micromatch.some = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (items.some((item) => isMatch(item))) {
          return true;
        }
      }
      return false;
    };
    micromatch.every = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (!items.every((item) => isMatch(item))) {
          return false;
        }
      }
      return true;
    };
    micromatch.all = (str, patterns, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      return [].concat(patterns).every((p) => picomatch(p, options)(str));
    };
    micromatch.capture = (glob, input, options) => {
      let posix = utils.isWindows(options);
      let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
      let match = regex.exec(posix ? utils.toPosixSlashes(input) : input);
      if (match) {
        return match.slice(1).map((v) => v === void 0 ? "" : v);
      }
    };
    micromatch.makeRe = (...args) => picomatch.makeRe(...args);
    micromatch.scan = (...args) => picomatch.scan(...args);
    micromatch.parse = (patterns, options) => {
      let res = [];
      for (let pattern of [].concat(patterns || [])) {
        for (let str of braces(String(pattern), options)) {
          res.push(picomatch.parse(str, options));
        }
      }
      return res;
    };
    micromatch.braces = (pattern, options) => {
      if (typeof pattern !== "string") throw new TypeError("Expected a string");
      if (options && options.nobrace === true || !hasBraces(pattern)) {
        return [pattern];
      }
      return braces(pattern, options);
    };
    micromatch.braceExpand = (pattern, options) => {
      if (typeof pattern !== "string") throw new TypeError("Expected a string");
      return micromatch.braces(pattern, { ...options, expand: true });
    };
    micromatch.hasBraces = hasBraces;
    module2.exports = micromatch;
  }
});

// ../../node_modules/fast-glob/out/utils/pattern.js
var require_pattern = __commonJS({
  "../../node_modules/fast-glob/out/utils/pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAbsolute = exports2.partitionAbsoluteAndRelative = exports2.removeDuplicateSlashes = exports2.matchAny = exports2.convertPatternsToRe = exports2.makeRe = exports2.getPatternParts = exports2.expandBraceExpansion = exports2.expandPatternsWithBraceExpansion = exports2.isAffectDepthOfReadingPattern = exports2.endsWithSlashGlobStar = exports2.hasGlobStar = exports2.getBaseDirectory = exports2.isPatternRelatedToParentDirectory = exports2.getPatternsOutsideCurrentDirectory = exports2.getPatternsInsideCurrentDirectory = exports2.getPositivePatterns = exports2.getNegativePatterns = exports2.isPositivePattern = exports2.isNegativePattern = exports2.convertToNegativePattern = exports2.convertToPositivePattern = exports2.isDynamicPattern = exports2.isStaticPattern = void 0;
    var path8 = require("path");
    var globParent = require_glob_parent();
    var micromatch = require_micromatch();
    var GLOBSTAR = "**";
    var ESCAPE_SYMBOL = "\\";
    var COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
    var REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
    var REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
    var GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
    var BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
    var DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
    function isStaticPattern(pattern, options = {}) {
      return !isDynamicPattern(pattern, options);
    }
    exports2.isStaticPattern = isStaticPattern;
    function isDynamicPattern(pattern, options = {}) {
      if (pattern === "") {
        return false;
      }
      if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
        return true;
      }
      if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
        return true;
      }
      return false;
    }
    exports2.isDynamicPattern = isDynamicPattern;
    function hasBraceExpansion(pattern) {
      const openingBraceIndex = pattern.indexOf("{");
      if (openingBraceIndex === -1) {
        return false;
      }
      const closingBraceIndex = pattern.indexOf("}", openingBraceIndex + 1);
      if (closingBraceIndex === -1) {
        return false;
      }
      const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
      return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
    }
    function convertToPositivePattern(pattern) {
      return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
    }
    exports2.convertToPositivePattern = convertToPositivePattern;
    function convertToNegativePattern(pattern) {
      return "!" + pattern;
    }
    exports2.convertToNegativePattern = convertToNegativePattern;
    function isNegativePattern(pattern) {
      return pattern.startsWith("!") && pattern[1] !== "(";
    }
    exports2.isNegativePattern = isNegativePattern;
    function isPositivePattern(pattern) {
      return !isNegativePattern(pattern);
    }
    exports2.isPositivePattern = isPositivePattern;
    function getNegativePatterns(patterns) {
      return patterns.filter(isNegativePattern);
    }
    exports2.getNegativePatterns = getNegativePatterns;
    function getPositivePatterns(patterns) {
      return patterns.filter(isPositivePattern);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getPatternsInsideCurrentDirectory(patterns) {
      return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
    }
    exports2.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
    function getPatternsOutsideCurrentDirectory(patterns) {
      return patterns.filter(isPatternRelatedToParentDirectory);
    }
    exports2.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
    function isPatternRelatedToParentDirectory(pattern) {
      return pattern.startsWith("..") || pattern.startsWith("./..");
    }
    exports2.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
    function getBaseDirectory(pattern) {
      return globParent(pattern, { flipBackslashes: false });
    }
    exports2.getBaseDirectory = getBaseDirectory;
    function hasGlobStar(pattern) {
      return pattern.includes(GLOBSTAR);
    }
    exports2.hasGlobStar = hasGlobStar;
    function endsWithSlashGlobStar(pattern) {
      return pattern.endsWith("/" + GLOBSTAR);
    }
    exports2.endsWithSlashGlobStar = endsWithSlashGlobStar;
    function isAffectDepthOfReadingPattern(pattern) {
      const basename3 = path8.basename(pattern);
      return endsWithSlashGlobStar(pattern) || isStaticPattern(basename3);
    }
    exports2.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
    function expandPatternsWithBraceExpansion(patterns) {
      return patterns.reduce((collection, pattern) => {
        return collection.concat(expandBraceExpansion(pattern));
      }, []);
    }
    exports2.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
    function expandBraceExpansion(pattern) {
      const patterns = micromatch.braces(pattern, { expand: true, nodupes: true, keepEscaping: true });
      patterns.sort((a, b) => a.length - b.length);
      return patterns.filter((pattern2) => pattern2 !== "");
    }
    exports2.expandBraceExpansion = expandBraceExpansion;
    function getPatternParts(pattern, options) {
      let { parts } = micromatch.scan(pattern, Object.assign(Object.assign({}, options), { parts: true }));
      if (parts.length === 0) {
        parts = [pattern];
      }
      if (parts[0].startsWith("/")) {
        parts[0] = parts[0].slice(1);
        parts.unshift("");
      }
      return parts;
    }
    exports2.getPatternParts = getPatternParts;
    function makeRe(pattern, options) {
      return micromatch.makeRe(pattern, options);
    }
    exports2.makeRe = makeRe;
    function convertPatternsToRe(patterns, options) {
      return patterns.map((pattern) => makeRe(pattern, options));
    }
    exports2.convertPatternsToRe = convertPatternsToRe;
    function matchAny(entry, patternsRe) {
      return patternsRe.some((patternRe) => patternRe.test(entry));
    }
    exports2.matchAny = matchAny;
    function removeDuplicateSlashes(pattern) {
      return pattern.replace(DOUBLE_SLASH_RE, "/");
    }
    exports2.removeDuplicateSlashes = removeDuplicateSlashes;
    function partitionAbsoluteAndRelative(patterns) {
      const absolute = [];
      const relative4 = [];
      for (const pattern of patterns) {
        if (isAbsolute4(pattern)) {
          absolute.push(pattern);
        } else {
          relative4.push(pattern);
        }
      }
      return [absolute, relative4];
    }
    exports2.partitionAbsoluteAndRelative = partitionAbsoluteAndRelative;
    function isAbsolute4(pattern) {
      return path8.isAbsolute(pattern);
    }
    exports2.isAbsolute = isAbsolute4;
  }
});

// ../../node_modules/merge2/index.js
var require_merge2 = __commonJS({
  "../../node_modules/merge2/index.js"(exports2, module2) {
    "use strict";
    var Stream = require("stream");
    var PassThrough = Stream.PassThrough;
    var slice = Array.prototype.slice;
    module2.exports = merge2;
    function merge2() {
      const streamsQueue = [];
      const args = slice.call(arguments);
      let merging = false;
      let options = args[args.length - 1];
      if (options && !Array.isArray(options) && options.pipe == null) {
        args.pop();
      } else {
        options = {};
      }
      const doEnd = options.end !== false;
      const doPipeError = options.pipeError === true;
      if (options.objectMode == null) {
        options.objectMode = true;
      }
      if (options.highWaterMark == null) {
        options.highWaterMark = 64 * 1024;
      }
      const mergedStream = PassThrough(options);
      function addStream() {
        for (let i = 0, len = arguments.length; i < len; i++) {
          streamsQueue.push(pauseStreams(arguments[i], options));
        }
        mergeStream();
        return this;
      }
      function mergeStream() {
        if (merging) {
          return;
        }
        merging = true;
        let streams = streamsQueue.shift();
        if (!streams) {
          process.nextTick(endStream);
          return;
        }
        if (!Array.isArray(streams)) {
          streams = [streams];
        }
        let pipesCount = streams.length + 1;
        function next() {
          if (--pipesCount > 0) {
            return;
          }
          merging = false;
          mergeStream();
        }
        function pipe(stream) {
          function onend() {
            stream.removeListener("merge2UnpipeEnd", onend);
            stream.removeListener("end", onend);
            if (doPipeError) {
              stream.removeListener("error", onerror);
            }
            next();
          }
          function onerror(err) {
            mergedStream.emit("error", err);
          }
          if (stream._readableState.endEmitted) {
            return next();
          }
          stream.on("merge2UnpipeEnd", onend);
          stream.on("end", onend);
          if (doPipeError) {
            stream.on("error", onerror);
          }
          stream.pipe(mergedStream, { end: false });
          stream.resume();
        }
        for (let i = 0; i < streams.length; i++) {
          pipe(streams[i]);
        }
        next();
      }
      function endStream() {
        merging = false;
        mergedStream.emit("queueDrain");
        if (doEnd) {
          mergedStream.end();
        }
      }
      mergedStream.setMaxListeners(0);
      mergedStream.add = addStream;
      mergedStream.on("unpipe", function(stream) {
        stream.emit("merge2UnpipeEnd");
      });
      if (args.length) {
        addStream.apply(null, args);
      }
      return mergedStream;
    }
    function pauseStreams(streams, options) {
      if (!Array.isArray(streams)) {
        if (!streams._readableState && streams.pipe) {
          streams = streams.pipe(PassThrough(options));
        }
        if (!streams._readableState || !streams.pause || !streams.pipe) {
          throw new Error("Only readable stream can be merged.");
        }
        streams.pause();
      } else {
        for (let i = 0, len = streams.length; i < len; i++) {
          streams[i] = pauseStreams(streams[i], options);
        }
      }
      return streams;
    }
  }
});

// ../../node_modules/fast-glob/out/utils/stream.js
var require_stream = __commonJS({
  "../../node_modules/fast-glob/out/utils/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.merge = void 0;
    var merge2 = require_merge2();
    function merge(streams) {
      const mergedStream = merge2(streams);
      streams.forEach((stream) => {
        stream.once("error", (error) => mergedStream.emit("error", error));
      });
      mergedStream.once("close", () => propagateCloseEventToSources(streams));
      mergedStream.once("end", () => propagateCloseEventToSources(streams));
      return mergedStream;
    }
    exports2.merge = merge;
    function propagateCloseEventToSources(streams) {
      streams.forEach((stream) => stream.emit("close"));
    }
  }
});

// ../../node_modules/fast-glob/out/utils/string.js
var require_string = __commonJS({
  "../../node_modules/fast-glob/out/utils/string.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEmpty = exports2.isString = void 0;
    function isString2(input) {
      return typeof input === "string";
    }
    exports2.isString = isString2;
    function isEmpty2(input) {
      return input === "";
    }
    exports2.isEmpty = isEmpty2;
  }
});

// ../../node_modules/fast-glob/out/utils/index.js
var require_utils3 = __commonJS({
  "../../node_modules/fast-glob/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.string = exports2.stream = exports2.pattern = exports2.path = exports2.fs = exports2.errno = exports2.array = void 0;
    var array = require_array();
    exports2.array = array;
    var errno = require_errno();
    exports2.errno = errno;
    var fs7 = require_fs();
    exports2.fs = fs7;
    var path8 = require_path();
    exports2.path = path8;
    var pattern = require_pattern();
    exports2.pattern = pattern;
    var stream = require_stream();
    exports2.stream = stream;
    var string = require_string();
    exports2.string = string;
  }
});

// ../../node_modules/fast-glob/out/managers/tasks.js
var require_tasks = __commonJS({
  "../../node_modules/fast-glob/out/managers/tasks.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPatternGroupToTask = exports2.convertPatternGroupsToTasks = exports2.groupPatternsByBaseDirectory = exports2.getNegativePatternsAsPositive = exports2.getPositivePatterns = exports2.convertPatternsToTasks = exports2.generate = void 0;
    var utils = require_utils3();
    function generate(input, settings) {
      const patterns = processPatterns(input, settings);
      const ignore = processPatterns(settings.ignore, settings);
      const positivePatterns = getPositivePatterns(patterns);
      const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);
      const staticPatterns = positivePatterns.filter((pattern) => utils.pattern.isStaticPattern(pattern, settings));
      const dynamicPatterns = positivePatterns.filter((pattern) => utils.pattern.isDynamicPattern(pattern, settings));
      const staticTasks = convertPatternsToTasks(
        staticPatterns,
        negativePatterns,
        /* dynamic */
        false
      );
      const dynamicTasks = convertPatternsToTasks(
        dynamicPatterns,
        negativePatterns,
        /* dynamic */
        true
      );
      return staticTasks.concat(dynamicTasks);
    }
    exports2.generate = generate;
    function processPatterns(input, settings) {
      let patterns = input;
      if (settings.braceExpansion) {
        patterns = utils.pattern.expandPatternsWithBraceExpansion(patterns);
      }
      if (settings.baseNameMatch) {
        patterns = patterns.map((pattern) => pattern.includes("/") ? pattern : `**/${pattern}`);
      }
      return patterns.map((pattern) => utils.pattern.removeDuplicateSlashes(pattern));
    }
    function convertPatternsToTasks(positive, negative, dynamic) {
      const tasks = [];
      const patternsOutsideCurrentDirectory = utils.pattern.getPatternsOutsideCurrentDirectory(positive);
      const patternsInsideCurrentDirectory = utils.pattern.getPatternsInsideCurrentDirectory(positive);
      const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
      const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
      tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
      if ("." in insideCurrentDirectoryGroup) {
        tasks.push(convertPatternGroupToTask(".", patternsInsideCurrentDirectory, negative, dynamic));
      } else {
        tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
      }
      return tasks;
    }
    exports2.convertPatternsToTasks = convertPatternsToTasks;
    function getPositivePatterns(patterns) {
      return utils.pattern.getPositivePatterns(patterns);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getNegativePatternsAsPositive(patterns, ignore) {
      const negative = utils.pattern.getNegativePatterns(patterns).concat(ignore);
      const positive = negative.map(utils.pattern.convertToPositivePattern);
      return positive;
    }
    exports2.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
    function groupPatternsByBaseDirectory(patterns) {
      const group = {};
      return patterns.reduce((collection, pattern) => {
        const base = utils.pattern.getBaseDirectory(pattern);
        if (base in collection) {
          collection[base].push(pattern);
        } else {
          collection[base] = [pattern];
        }
        return collection;
      }, group);
    }
    exports2.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
    function convertPatternGroupsToTasks(positive, negative, dynamic) {
      return Object.keys(positive).map((base) => {
        return convertPatternGroupToTask(base, positive[base], negative, dynamic);
      });
    }
    exports2.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
    function convertPatternGroupToTask(base, positive, negative, dynamic) {
      return {
        dynamic,
        positive,
        negative,
        base,
        patterns: [].concat(positive, negative.map(utils.pattern.convertToNegativePattern))
      };
    }
    exports2.convertPatternGroupToTask = convertPatternGroupToTask;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/providers/async.js
var require_async = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read(path8, settings, callback) {
      settings.fs.lstat(path8, (lstatError, lstat) => {
        if (lstatError !== null) {
          callFailureCallback(callback, lstatError);
          return;
        }
        if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
          callSuccessCallback(callback, lstat);
          return;
        }
        settings.fs.stat(path8, (statError, stat) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              callFailureCallback(callback, statError);
              return;
            }
            callSuccessCallback(callback, lstat);
            return;
          }
          if (settings.markSymbolicLink) {
            stat.isSymbolicLink = () => true;
          }
          callSuccessCallback(callback, stat);
        });
      });
    }
    exports2.read = read;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// ../../node_modules/@nodelib/fs.stat/out/providers/sync.js
var require_sync = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read(path8, settings) {
      const lstat = settings.fs.lstatSync(path8);
      if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        return lstat;
      }
      try {
        const stat = settings.fs.statSync(path8);
        if (settings.markSymbolicLink) {
          stat.isSymbolicLink = () => true;
        }
        return stat;
      } catch (error) {
        if (!settings.throwErrorOnBrokenSymbolicLink) {
          return lstat;
        }
        throw error;
      }
    }
    exports2.read = read;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/adapters/fs.js
var require_fs2 = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs7 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs7.lstat,
      stat: fs7.stat,
      lstatSync: fs7.lstatSync,
      statSync: fs7.statSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/settings.js
var require_settings = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fs7 = require_fs2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
        this.fs = fs7.createFileSystemAdapter(this._options.fs);
        this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
      }
      _getValue(option2, value) {
        return option2 !== null && option2 !== void 0 ? option2 : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.stat/out/index.js
var require_out = __commonJS({
  "../../node_modules/@nodelib/fs.stat/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.statSync = exports2.stat = exports2.Settings = void 0;
    var async = require_async();
    var sync = require_sync();
    var settings_1 = require_settings();
    exports2.Settings = settings_1.default;
    function stat(path8, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path8, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path8, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.stat = stat;
    function statSync2(path8, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path8, settings);
    }
    exports2.statSync = statSync2;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/queue-microtask/index.js
var require_queue_microtask = __commonJS({
  "../../node_modules/queue-microtask/index.js"(exports2, module2) {
    var promise;
    module2.exports = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : global) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err) => setTimeout(() => {
      throw err;
    }, 0));
  }
});

// ../../node_modules/run-parallel/index.js
var require_run_parallel = __commonJS({
  "../../node_modules/run-parallel/index.js"(exports2, module2) {
    module2.exports = runParallel;
    var queueMicrotask2 = require_queue_microtask();
    function runParallel(tasks, cb) {
      let results, pending, keys2;
      let isSync = true;
      if (Array.isArray(tasks)) {
        results = [];
        pending = tasks.length;
      } else {
        keys2 = Object.keys(tasks);
        results = {};
        pending = keys2.length;
      }
      function done(err) {
        function end() {
          if (cb) cb(err, results);
          cb = null;
        }
        if (isSync) queueMicrotask2(end);
        else end();
      }
      function each(i, err, result) {
        results[i] = result;
        if (--pending === 0 || err) {
          done(err);
        }
      }
      if (!pending) {
        done(null);
      } else if (keys2) {
        keys2.forEach(function(key) {
          tasks[key](function(err, result) {
            each(key, err, result);
          });
        });
      } else {
        tasks.forEach(function(task, i) {
          task(function(err, result) {
            each(i, err, result);
          });
        });
      }
      isSync = false;
    }
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/constants.js
var require_constants3 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
    var NODE_PROCESS_VERSION_PARTS = process.versions.node.split(".");
    if (NODE_PROCESS_VERSION_PARTS[0] === void 0 || NODE_PROCESS_VERSION_PARTS[1] === void 0) {
      throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
    }
    var MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
    var MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
    var SUPPORTED_MAJOR_VERSION = 10;
    var SUPPORTED_MINOR_VERSION = 10;
    var IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
    var IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/utils/fs.js
var require_fs3 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name, stats) {
      return new DirentFromStats(name, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/utils/index.js
var require_utils4 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fs = void 0;
    var fs7 = require_fs3();
    exports2.fs = fs7;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/common.js
var require_common = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = void 0;
    function joinPathSegments(a, b, separator) {
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/async.js
var require_async2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var rpl = require_run_parallel();
    var constants_1 = require_constants3();
    var utils = require_utils4();
    var common = require_common();
    function read(directory, settings, callback) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        readdirWithFileTypes(directory, settings, callback);
        return;
      }
      readdir(directory, settings, callback);
    }
    exports2.read = read;
    function readdirWithFileTypes(directory, settings, callback) {
      settings.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const entries = dirents.map((dirent) => ({
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        }));
        if (!settings.followSymbolicLinks) {
          callSuccessCallback(callback, entries);
          return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, rplEntries);
        });
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function makeRplTaskEntry(entry, settings) {
      return (done) => {
        if (!entry.dirent.isSymbolicLink()) {
          done(null, entry);
          return;
        }
        settings.fs.stat(entry.path, (statError, stats) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              done(statError);
              return;
            }
            done(null, entry);
            return;
          }
          entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          done(null, entry);
        });
      };
    }
    function readdir(directory, settings, callback) {
      settings.fs.readdir(directory, (readdirError, names) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const tasks = names.map((name) => {
          const path8 = common.joinPathSegments(directory, name, settings.pathSegmentSeparator);
          return (done) => {
            fsStat.stat(path8, settings.fsStatSettings, (error, stats) => {
              if (error !== null) {
                done(error);
                return;
              }
              const entry = {
                name,
                path: path8,
                dirent: utils.fs.createDirentFromStats(name, stats)
              };
              if (settings.stats) {
                entry.stats = stats;
              }
              done(null, entry);
            });
          };
        });
        rpl(tasks, (rplError, entries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, entries);
        });
      });
    }
    exports2.readdir = readdir;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/providers/sync.js
var require_sync2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var constants_1 = require_constants3();
    var utils = require_utils4();
    var common = require_common();
    function read(directory, settings) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        return readdirWithFileTypes(directory, settings);
      }
      return readdir(directory, settings);
    }
    exports2.read = read;
    function readdirWithFileTypes(directory, settings) {
      const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
      return dirents.map((dirent) => {
        const entry = {
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        };
        if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
          try {
            const stats = settings.fs.statSync(entry.path);
            entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          } catch (error) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              throw error;
            }
          }
        }
        return entry;
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function readdir(directory, settings) {
      const names = settings.fs.readdirSync(directory);
      return names.map((name) => {
        const entryPath = common.joinPathSegments(directory, name, settings.pathSegmentSeparator);
        const stats = fsStat.statSync(entryPath, settings.fsStatSettings);
        const entry = {
          name,
          path: entryPath,
          dirent: utils.fs.createDirentFromStats(name, stats)
        };
        if (settings.stats) {
          entry.stats = stats;
        }
        return entry;
      });
    }
    exports2.readdir = readdir;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/adapters/fs.js
var require_fs4 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs7 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs7.lstat,
      stat: fs7.stat,
      lstatSync: fs7.lstatSync,
      statSync: fs7.statSync,
      readdir: fs7.readdir,
      readdirSync: fs7.readdirSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/settings.js
var require_settings2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path8 = require("path");
    var fsStat = require_out();
    var fs7 = require_fs4();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
        this.fs = fs7.createFileSystemAdapter(this._options.fs);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path8.sep);
        this.stats = this._getValue(this._options.stats, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
        this.fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this.followSymbolicLinks,
          fs: this.fs,
          throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option2, value) {
        return option2 !== null && option2 !== void 0 ? option2 : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.scandir/out/index.js
var require_out2 = __commonJS({
  "../../node_modules/@nodelib/fs.scandir/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.scandirSync = exports2.scandir = void 0;
    var async = require_async2();
    var sync = require_sync2();
    var settings_1 = require_settings2();
    exports2.Settings = settings_1.default;
    function scandir(path8, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path8, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path8, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.scandir = scandir;
    function scandirSync(path8, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path8, settings);
    }
    exports2.scandirSync = scandirSync;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/reusify/reusify.js
var require_reusify = __commonJS({
  "../../node_modules/reusify/reusify.js"(exports2, module2) {
    "use strict";
    function reusify(Constructor) {
      var head2 = new Constructor();
      var tail = head2;
      function get2() {
        var current = head2;
        if (current.next) {
          head2 = current.next;
        } else {
          head2 = new Constructor();
          tail = head2;
        }
        current.next = null;
        return current;
      }
      function release(obj) {
        tail.next = obj;
        tail = obj;
      }
      return {
        get: get2,
        release
      };
    }
    module2.exports = reusify;
  }
});

// ../../node_modules/fastq/queue.js
var require_queue = __commonJS({
  "../../node_modules/fastq/queue.js"(exports2, module2) {
    "use strict";
    var reusify = require_reusify();
    function fastqueue(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      if (!(_concurrency >= 1)) {
        throw new Error("fastqueue concurrency must be equal to or greater than 1");
      }
      var cache = reusify(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;
      var errorHandler = null;
      var self2 = {
        push,
        drain: noop2,
        saturated: noop2,
        pause,
        paused: false,
        get concurrency() {
          return _concurrency;
        },
        set concurrency(value) {
          if (!(value >= 1)) {
            throw new Error("fastqueue concurrency must be equal to or greater than 1");
          }
          _concurrency = value;
          if (self2.paused) return;
          for (; queueHead && _running < _concurrency; ) {
            _running++;
            release();
          }
        },
        running,
        resume,
        idle,
        length,
        getQueue,
        unshift,
        empty: noop2,
        kill,
        killAndDrain,
        error,
        abort
      };
      return self2;
      function running() {
        return _running;
      }
      function pause() {
        self2.paused = true;
      }
      function length() {
        var current = queueHead;
        var counter = 0;
        while (current) {
          current = current.next;
          counter++;
        }
        return counter;
      }
      function getQueue() {
        var current = queueHead;
        var tasks = [];
        while (current) {
          tasks.push(current.value);
          current = current.next;
        }
        return tasks;
      }
      function resume() {
        if (!self2.paused) return;
        self2.paused = false;
        if (queueHead === null) {
          _running++;
          release();
          return;
        }
        for (; queueHead && _running < _concurrency; ) {
          _running++;
          release();
        }
      }
      function idle() {
        return _running === 0 && self2.length() === 0;
      }
      function push(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop2;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self2.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self2.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function unshift(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop2;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self2.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self2.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function release(holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next && _running <= _concurrency) {
          if (!self2.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self2.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self2.drain();
        }
      }
      function kill() {
        queueHead = null;
        queueTail = null;
        self2.drain = noop2;
      }
      function killAndDrain() {
        queueHead = null;
        queueTail = null;
        self2.drain();
        self2.drain = noop2;
      }
      function abort() {
        var current = queueHead;
        queueHead = null;
        queueTail = null;
        while (current) {
          var next = current.next;
          var callback = current.callback;
          var errorHandler2 = current.errorHandler;
          var val = current.value;
          var context2 = current.context;
          current.value = null;
          current.callback = noop2;
          current.errorHandler = null;
          current.next = null;
          if (errorHandler2) {
            errorHandler2(new Error("abort"), val);
          }
          callback.call(context2, new Error("abort"));
          cache.release(current);
          current = next;
        }
        self2.drain = noop2;
      }
      function error(handler) {
        errorHandler = handler;
      }
    }
    function noop2() {
    }
    function Task() {
      this.value = null;
      this.callback = noop2;
      this.next = null;
      this.release = noop2;
      this.context = null;
      this.errorHandler = null;
      var self2 = this;
      this.worked = function worked(err, result) {
        var callback = self2.callback;
        var errorHandler = self2.errorHandler;
        var val = self2.value;
        self2.value = null;
        self2.callback = noop2;
        if (self2.errorHandler) {
          errorHandler(err, val);
        }
        callback.call(self2.context, err, result);
        self2.release(self2);
      };
    }
    function queueAsPromised(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      function asyncWrapper(arg, cb) {
        worker.call(this, arg).then(function(res) {
          cb(null, res);
        }, cb);
      }
      var queue = fastqueue(context, asyncWrapper, _concurrency);
      var pushCb = queue.push;
      var unshiftCb = queue.unshift;
      queue.push = push;
      queue.unshift = unshift;
      queue.drained = drained;
      return queue;
      function push(value) {
        var p = new Promise(function(resolve6, reject2) {
          pushCb(value, function(err, result) {
            if (err) {
              reject2(err);
              return;
            }
            resolve6(result);
          });
        });
        p.catch(noop2);
        return p;
      }
      function unshift(value) {
        var p = new Promise(function(resolve6, reject2) {
          unshiftCb(value, function(err, result) {
            if (err) {
              reject2(err);
              return;
            }
            resolve6(result);
          });
        });
        p.catch(noop2);
        return p;
      }
      function drained() {
        var p = new Promise(function(resolve6) {
          process.nextTick(function() {
            if (queue.idle()) {
              resolve6();
            } else {
              var previousDrain = queue.drain;
              queue.drain = function() {
                if (typeof previousDrain === "function") previousDrain();
                resolve6();
                queue.drain = previousDrain;
              };
            }
          });
        });
        return p;
      }
    }
    module2.exports = fastqueue;
    module2.exports.promise = queueAsPromised;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/common.js
var require_common2 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = exports2.replacePathSegmentSeparator = exports2.isAppliedFilter = exports2.isFatalError = void 0;
    function isFatalError(settings, error) {
      if (settings.errorFilter === null) {
        return true;
      }
      return !settings.errorFilter(error);
    }
    exports2.isFatalError = isFatalError;
    function isAppliedFilter(filter2, value) {
      return filter2 === null || filter2(value);
    }
    exports2.isAppliedFilter = isAppliedFilter;
    function replacePathSegmentSeparator(filepath, separator) {
      return filepath.split(/[/\\]/).join(separator);
    }
    exports2.replacePathSegmentSeparator = replacePathSegmentSeparator;
    function joinPathSegments(a, b, separator) {
      if (a === "") {
        return b;
      }
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/reader.js
var require_reader = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common = require_common2();
    var Reader = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._root = common.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
      }
    };
    exports2.default = Reader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/async.js
var require_async3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var events_1 = require("events");
    var fsScandir = require_out2();
    var fastq = require_queue();
    var common = require_common2();
    var reader_1 = require_reader();
    var AsyncReader = class extends reader_1.default {
      constructor(_root, _settings) {
        super(_root, _settings);
        this._settings = _settings;
        this._scandir = fsScandir.scandir;
        this._emitter = new events_1.EventEmitter();
        this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
        this._isFatalError = false;
        this._isDestroyed = false;
        this._queue.drain = () => {
          if (!this._isFatalError) {
            this._emitter.emit("end");
          }
        };
      }
      read() {
        this._isFatalError = false;
        this._isDestroyed = false;
        setImmediate(() => {
          this._pushToQueue(this._root, this._settings.basePath);
        });
        return this._emitter;
      }
      get isDestroyed() {
        return this._isDestroyed;
      }
      destroy() {
        if (this._isDestroyed) {
          throw new Error("The reader is already destroyed");
        }
        this._isDestroyed = true;
        this._queue.killAndDrain();
      }
      onEntry(callback) {
        this._emitter.on("entry", callback);
      }
      onError(callback) {
        this._emitter.once("error", callback);
      }
      onEnd(callback) {
        this._emitter.once("end", callback);
      }
      _pushToQueue(directory, base) {
        const queueItem = { directory, base };
        this._queue.push(queueItem, (error) => {
          if (error !== null) {
            this._handleError(error);
          }
        });
      }
      _worker(item, done) {
        this._scandir(item.directory, this._settings.fsScandirSettings, (error, entries) => {
          if (error !== null) {
            done(error, void 0);
            return;
          }
          for (const entry of entries) {
            this._handleEntry(entry, item.base);
          }
          done(null, void 0);
        });
      }
      _handleError(error) {
        if (this._isDestroyed || !common.isFatalError(this._settings, error)) {
          return;
        }
        this._isFatalError = true;
        this._isDestroyed = true;
        this._emitter.emit("error", error);
      }
      _handleEntry(entry, base) {
        if (this._isDestroyed || this._isFatalError) {
          return;
        }
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._emitEntry(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _emitEntry(entry) {
        this._emitter.emit("entry", entry);
      }
    };
    exports2.default = AsyncReader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/async.js
var require_async4 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async3();
    var AsyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._storage = [];
      }
      read(callback) {
        this._reader.onError((error) => {
          callFailureCallback(callback, error);
        });
        this._reader.onEntry((entry) => {
          this._storage.push(entry);
        });
        this._reader.onEnd(() => {
          callSuccessCallback(callback, this._storage);
        });
        this._reader.read();
      }
    };
    exports2.default = AsyncProvider;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, entries) {
      callback(null, entries);
    }
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/stream.js
var require_stream2 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var async_1 = require_async3();
    var StreamProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._stream = new stream_1.Readable({
          objectMode: true,
          read: () => {
          },
          destroy: () => {
            if (!this._reader.isDestroyed) {
              this._reader.destroy();
            }
          }
        });
      }
      read() {
        this._reader.onError((error) => {
          this._stream.emit("error", error);
        });
        this._reader.onEntry((entry) => {
          this._stream.push(entry);
        });
        this._reader.onEnd(() => {
          this._stream.push(null);
        });
        this._reader.read();
        return this._stream;
      }
    };
    exports2.default = StreamProvider;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/readers/sync.js
var require_sync3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsScandir = require_out2();
    var common = require_common2();
    var reader_1 = require_reader();
    var SyncReader = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._scandir = fsScandir.scandirSync;
        this._storage = [];
        this._queue = /* @__PURE__ */ new Set();
      }
      read() {
        this._pushToQueue(this._root, this._settings.basePath);
        this._handleQueue();
        return this._storage;
      }
      _pushToQueue(directory, base) {
        this._queue.add({ directory, base });
      }
      _handleQueue() {
        for (const item of this._queue.values()) {
          this._handleDirectory(item.directory, item.base);
        }
      }
      _handleDirectory(directory, base) {
        try {
          const entries = this._scandir(directory, this._settings.fsScandirSettings);
          for (const entry of entries) {
            this._handleEntry(entry, base);
          }
        } catch (error) {
          this._handleError(error);
        }
      }
      _handleError(error) {
        if (!common.isFatalError(this._settings, error)) {
          return;
        }
        throw error;
      }
      _handleEntry(entry, base) {
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._pushToStorage(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _pushToStorage(entry) {
        this._storage.push(entry);
      }
    };
    exports2.default = SyncReader;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/providers/sync.js
var require_sync4 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync3();
    var SyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new sync_1.default(this._root, this._settings);
      }
      read() {
        return this._reader.read();
      }
    };
    exports2.default = SyncProvider;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/settings.js
var require_settings3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path8 = require("path");
    var fsScandir = require_out2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.basePath = this._getValue(this._options.basePath, void 0);
        this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
        this.deepFilter = this._getValue(this._options.deepFilter, null);
        this.entryFilter = this._getValue(this._options.entryFilter, null);
        this.errorFilter = this._getValue(this._options.errorFilter, null);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path8.sep);
        this.fsScandirSettings = new fsScandir.Settings({
          followSymbolicLinks: this._options.followSymbolicLinks,
          fs: this._options.fs,
          pathSegmentSeparator: this._options.pathSegmentSeparator,
          stats: this._options.stats,
          throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option2, value) {
        return option2 !== null && option2 !== void 0 ? option2 : value;
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/@nodelib/fs.walk/out/index.js
var require_out3 = __commonJS({
  "../../node_modules/@nodelib/fs.walk/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.walkStream = exports2.walkSync = exports2.walk = void 0;
    var async_1 = require_async4();
    var stream_1 = require_stream2();
    var sync_1 = require_sync4();
    var settings_1 = require_settings3();
    exports2.Settings = settings_1.default;
    function walk(directory, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        new async_1.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
        return;
      }
      new async_1.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
    }
    exports2.walk = walk;
    function walkSync(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new sync_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkSync = walkSync;
    function walkStream(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new stream_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkStream = walkStream;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// ../../node_modules/fast-glob/out/readers/reader.js
var require_reader2 = __commonJS({
  "../../node_modules/fast-glob/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path8 = require("path");
    var fsStat = require_out();
    var utils = require_utils3();
    var Reader = class {
      constructor(_settings) {
        this._settings = _settings;
        this._fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
        });
      }
      _getFullEntryPath(filepath) {
        return path8.resolve(this._settings.cwd, filepath);
      }
      _makeEntry(stats, pattern) {
        const entry = {
          name: pattern,
          path: pattern,
          dirent: utils.fs.createDirentFromStats(pattern, stats)
        };
        if (this._settings.stats) {
          entry.stats = stats;
        }
        return entry;
      }
      _isFatalError(error) {
        return !utils.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
      }
    };
    exports2.default = Reader;
  }
});

// ../../node_modules/fast-glob/out/readers/stream.js
var require_stream3 = __commonJS({
  "../../node_modules/fast-glob/out/readers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderStream = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkStream = fsWalk.walkStream;
        this._stat = fsStat.stat;
      }
      dynamic(root2, options) {
        return this._walkStream(root2, options);
      }
      static(patterns, options) {
        const filepaths = patterns.map(this._getFullEntryPath, this);
        const stream = new stream_1.PassThrough({ objectMode: true });
        stream._write = (index, _enc, done) => {
          return this._getEntry(filepaths[index], patterns[index], options).then((entry) => {
            if (entry !== null && options.entryFilter(entry)) {
              stream.push(entry);
            }
            if (index === filepaths.length - 1) {
              stream.end();
            }
            done();
          }).catch(done);
        };
        for (let i = 0; i < filepaths.length; i++) {
          stream.write(i);
        }
        return stream;
      }
      _getEntry(filepath, pattern, options) {
        return this._getStat(filepath).then((stats) => this._makeEntry(stats, pattern)).catch((error) => {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        });
      }
      _getStat(filepath) {
        return new Promise((resolve6, reject2) => {
          this._stat(filepath, this._fsStatSettings, (error, stats) => {
            return error === null ? resolve6(stats) : reject2(error);
          });
        });
      }
    };
    exports2.default = ReaderStream;
  }
});

// ../../node_modules/fast-glob/out/readers/async.js
var require_async5 = __commonJS({
  "../../node_modules/fast-glob/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var stream_1 = require_stream3();
    var ReaderAsync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkAsync = fsWalk.walk;
        this._readerStream = new stream_1.default(this._settings);
      }
      dynamic(root2, options) {
        return new Promise((resolve6, reject2) => {
          this._walkAsync(root2, options, (error, entries) => {
            if (error === null) {
              resolve6(entries);
            } else {
              reject2(error);
            }
          });
        });
      }
      async static(patterns, options) {
        const entries = [];
        const stream = this._readerStream.static(patterns, options);
        return new Promise((resolve6, reject2) => {
          stream.once("error", reject2);
          stream.on("data", (entry) => entries.push(entry));
          stream.once("end", () => resolve6(entries));
        });
      }
    };
    exports2.default = ReaderAsync;
  }
});

// ../../node_modules/fast-glob/out/providers/matchers/matcher.js
var require_matcher = __commonJS({
  "../../node_modules/fast-glob/out/providers/matchers/matcher.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var Matcher = class {
      constructor(_patterns, _settings, _micromatchOptions) {
        this._patterns = _patterns;
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this._storage = [];
        this._fillStorage();
      }
      _fillStorage() {
        for (const pattern of this._patterns) {
          const segments = this._getPatternSegments(pattern);
          const sections = this._splitSegmentsIntoSections(segments);
          this._storage.push({
            complete: sections.length <= 1,
            pattern,
            segments,
            sections
          });
        }
      }
      _getPatternSegments(pattern) {
        const parts = utils.pattern.getPatternParts(pattern, this._micromatchOptions);
        return parts.map((part) => {
          const dynamic = utils.pattern.isDynamicPattern(part, this._settings);
          if (!dynamic) {
            return {
              dynamic: false,
              pattern: part
            };
          }
          return {
            dynamic: true,
            pattern: part,
            patternRe: utils.pattern.makeRe(part, this._micromatchOptions)
          };
        });
      }
      _splitSegmentsIntoSections(segments) {
        return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
      }
    };
    exports2.default = Matcher;
  }
});

// ../../node_modules/fast-glob/out/providers/matchers/partial.js
var require_partial = __commonJS({
  "../../node_modules/fast-glob/out/providers/matchers/partial.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var matcher_1 = require_matcher();
    var PartialMatcher = class extends matcher_1.default {
      match(filepath) {
        const parts = filepath.split("/");
        const levels = parts.length;
        const patterns = this._storage.filter((info) => !info.complete || info.segments.length > levels);
        for (const pattern of patterns) {
          const section = pattern.sections[0];
          if (!pattern.complete && levels > section.length) {
            return true;
          }
          const match = parts.every((part, index) => {
            const segment = pattern.segments[index];
            if (segment.dynamic && segment.patternRe.test(part)) {
              return true;
            }
            if (!segment.dynamic && segment.pattern === part) {
              return true;
            }
            return false;
          });
          if (match) {
            return true;
          }
        }
        return false;
      }
    };
    exports2.default = PartialMatcher;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/deep.js
var require_deep = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/deep.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var partial_1 = require_partial();
    var DeepFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
      }
      getFilter(basePath, positive, negative) {
        const matcher = this._getMatcher(positive);
        const negativeRe = this._getNegativePatternsRe(negative);
        return (entry) => this._filter(basePath, entry, matcher, negativeRe);
      }
      _getMatcher(patterns) {
        return new partial_1.default(patterns, this._settings, this._micromatchOptions);
      }
      _getNegativePatternsRe(patterns) {
        const affectDepthOfReadingPatterns = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);
        return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
      }
      _filter(basePath, entry, matcher, negativeRe) {
        if (this._isSkippedByDeep(basePath, entry.path)) {
          return false;
        }
        if (this._isSkippedSymbolicLink(entry)) {
          return false;
        }
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._isSkippedByPositivePatterns(filepath, matcher)) {
          return false;
        }
        return this._isSkippedByNegativePatterns(filepath, negativeRe);
      }
      _isSkippedByDeep(basePath, entryPath) {
        if (this._settings.deep === Infinity) {
          return false;
        }
        return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
      }
      _getEntryLevel(basePath, entryPath) {
        const entryPathDepth = entryPath.split("/").length;
        if (basePath === "") {
          return entryPathDepth;
        }
        const basePathDepth = basePath.split("/").length;
        return entryPathDepth - basePathDepth;
      }
      _isSkippedSymbolicLink(entry) {
        return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
      }
      _isSkippedByPositivePatterns(entryPath, matcher) {
        return !this._settings.baseNameMatch && !matcher.match(entryPath);
      }
      _isSkippedByNegativePatterns(entryPath, patternsRe) {
        return !utils.pattern.matchAny(entryPath, patternsRe);
      }
    };
    exports2.default = DeepFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/entry.js
var require_entry = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var EntryFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this.index = /* @__PURE__ */ new Map();
      }
      getFilter(positive, negative) {
        const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);
        const patterns = {
          positive: {
            all: utils.pattern.convertPatternsToRe(positive, this._micromatchOptions)
          },
          negative: {
            absolute: utils.pattern.convertPatternsToRe(absoluteNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true })),
            relative: utils.pattern.convertPatternsToRe(relativeNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true }))
          }
        };
        return (entry) => this._filter(entry, patterns);
      }
      _filter(entry, patterns) {
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._settings.unique && this._isDuplicateEntry(filepath)) {
          return false;
        }
        if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
          return false;
        }
        const isMatched = this._isMatchToPatternsSet(filepath, patterns, entry.dirent.isDirectory());
        if (this._settings.unique && isMatched) {
          this._createIndexRecord(filepath);
        }
        return isMatched;
      }
      _isDuplicateEntry(filepath) {
        return this.index.has(filepath);
      }
      _createIndexRecord(filepath) {
        this.index.set(filepath, void 0);
      }
      _onlyFileFilter(entry) {
        return this._settings.onlyFiles && !entry.dirent.isFile();
      }
      _onlyDirectoryFilter(entry) {
        return this._settings.onlyDirectories && !entry.dirent.isDirectory();
      }
      _isMatchToPatternsSet(filepath, patterns, isDirectory) {
        const isMatched = this._isMatchToPatterns(filepath, patterns.positive.all, isDirectory);
        if (!isMatched) {
          return false;
        }
        const isMatchedByRelativeNegative = this._isMatchToPatterns(filepath, patterns.negative.relative, isDirectory);
        if (isMatchedByRelativeNegative) {
          return false;
        }
        const isMatchedByAbsoluteNegative = this._isMatchToAbsoluteNegative(filepath, patterns.negative.absolute, isDirectory);
        if (isMatchedByAbsoluteNegative) {
          return false;
        }
        return true;
      }
      _isMatchToAbsoluteNegative(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const fullpath = utils.path.makeAbsolute(this._settings.cwd, filepath);
        return this._isMatchToPatterns(fullpath, patternsRe, isDirectory);
      }
      _isMatchToPatterns(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const isMatched = utils.pattern.matchAny(filepath, patternsRe);
        if (!isMatched && isDirectory) {
          return utils.pattern.matchAny(filepath + "/", patternsRe);
        }
        return isMatched;
      }
    };
    exports2.default = EntryFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/filters/error.js
var require_error = __commonJS({
  "../../node_modules/fast-glob/out/providers/filters/error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var ErrorFilter = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getFilter() {
        return (error) => this._isNonFatalError(error);
      }
      _isNonFatalError(error) {
        return utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
      }
    };
    exports2.default = ErrorFilter;
  }
});

// ../../node_modules/fast-glob/out/providers/transformers/entry.js
var require_entry2 = __commonJS({
  "../../node_modules/fast-glob/out/providers/transformers/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils3();
    var EntryTransformer = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getTransformer() {
        return (entry) => this._transform(entry);
      }
      _transform(entry) {
        let filepath = entry.path;
        if (this._settings.absolute) {
          filepath = utils.path.makeAbsolute(this._settings.cwd, filepath);
          filepath = utils.path.unixify(filepath);
        }
        if (this._settings.markDirectories && entry.dirent.isDirectory()) {
          filepath += "/";
        }
        if (!this._settings.objectMode) {
          return filepath;
        }
        return Object.assign(Object.assign({}, entry), { path: filepath });
      }
    };
    exports2.default = EntryTransformer;
  }
});

// ../../node_modules/fast-glob/out/providers/provider.js
var require_provider = __commonJS({
  "../../node_modules/fast-glob/out/providers/provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path8 = require("path");
    var deep_1 = require_deep();
    var entry_1 = require_entry();
    var error_1 = require_error();
    var entry_2 = require_entry2();
    var Provider = class {
      constructor(_settings) {
        this._settings = _settings;
        this.errorFilter = new error_1.default(this._settings);
        this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
        this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
        this.entryTransformer = new entry_2.default(this._settings);
      }
      _getRootDirectory(task) {
        return path8.resolve(this._settings.cwd, task.base);
      }
      _getReaderOptions(task) {
        const basePath = task.base === "." ? "" : task.base;
        return {
          basePath,
          pathSegmentSeparator: "/",
          concurrency: this._settings.concurrency,
          deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
          entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
          errorFilter: this.errorFilter.getFilter(),
          followSymbolicLinks: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          stats: this._settings.stats,
          throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
          transform: this.entryTransformer.getTransformer()
        };
      }
      _getMicromatchOptions() {
        return {
          dot: this._settings.dot,
          matchBase: this._settings.baseNameMatch,
          nobrace: !this._settings.braceExpansion,
          nocase: !this._settings.caseSensitiveMatch,
          noext: !this._settings.extglob,
          noglobstar: !this._settings.globstar,
          posix: true,
          strictSlashes: false
        };
      }
    };
    exports2.default = Provider;
  }
});

// ../../node_modules/fast-glob/out/providers/async.js
var require_async6 = __commonJS({
  "../../node_modules/fast-glob/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async5();
    var provider_1 = require_provider();
    var ProviderAsync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new async_1.default(this._settings);
      }
      async read(task) {
        const root2 = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = await this.api(root2, task, options);
        return entries.map((entry) => options.transform(entry));
      }
      api(root2, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root2, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderAsync;
  }
});

// ../../node_modules/fast-glob/out/providers/stream.js
var require_stream4 = __commonJS({
  "../../node_modules/fast-glob/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var stream_2 = require_stream3();
    var provider_1 = require_provider();
    var ProviderStream = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new stream_2.default(this._settings);
      }
      read(task) {
        const root2 = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const source = this.api(root2, task, options);
        const destination = new stream_1.Readable({ objectMode: true, read: () => {
        } });
        source.once("error", (error) => destination.emit("error", error)).on("data", (entry) => destination.emit("data", options.transform(entry))).once("end", () => destination.emit("end"));
        destination.once("close", () => source.destroy());
        return destination;
      }
      api(root2, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root2, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderStream;
  }
});

// ../../node_modules/fast-glob/out/readers/sync.js
var require_sync5 = __commonJS({
  "../../node_modules/fast-glob/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderSync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkSync = fsWalk.walkSync;
        this._statSync = fsStat.statSync;
      }
      dynamic(root2, options) {
        return this._walkSync(root2, options);
      }
      static(patterns, options) {
        const entries = [];
        for (const pattern of patterns) {
          const filepath = this._getFullEntryPath(pattern);
          const entry = this._getEntry(filepath, pattern, options);
          if (entry === null || !options.entryFilter(entry)) {
            continue;
          }
          entries.push(entry);
        }
        return entries;
      }
      _getEntry(filepath, pattern, options) {
        try {
          const stats = this._getStat(filepath);
          return this._makeEntry(stats, pattern);
        } catch (error) {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        }
      }
      _getStat(filepath) {
        return this._statSync(filepath, this._fsStatSettings);
      }
    };
    exports2.default = ReaderSync;
  }
});

// ../../node_modules/fast-glob/out/providers/sync.js
var require_sync6 = __commonJS({
  "../../node_modules/fast-glob/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync5();
    var provider_1 = require_provider();
    var ProviderSync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new sync_1.default(this._settings);
      }
      read(task) {
        const root2 = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = this.api(root2, task, options);
        return entries.map(options.transform);
      }
      api(root2, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root2, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderSync;
  }
});

// ../../node_modules/fast-glob/out/settings.js
var require_settings4 = __commonJS({
  "../../node_modules/fast-glob/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
    var fs7 = require("fs");
    var os3 = require("os");
    var CPU_COUNT = Math.max(os3.cpus().length, 1);
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = {
      lstat: fs7.lstat,
      lstatSync: fs7.lstatSync,
      stat: fs7.stat,
      statSync: fs7.statSync,
      readdir: fs7.readdir,
      readdirSync: fs7.readdirSync
    };
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.absolute = this._getValue(this._options.absolute, false);
        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
        this.cwd = this._getValue(this._options.cwd, process.cwd());
        this.deep = this._getValue(this._options.deep, Infinity);
        this.dot = this._getValue(this._options.dot, false);
        this.extglob = this._getValue(this._options.extglob, true);
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
        this.fs = this._getFileSystemMethods(this._options.fs);
        this.globstar = this._getValue(this._options.globstar, true);
        this.ignore = this._getValue(this._options.ignore, []);
        this.markDirectories = this._getValue(this._options.markDirectories, false);
        this.objectMode = this._getValue(this._options.objectMode, false);
        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
        this.stats = this._getValue(this._options.stats, false);
        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
        this.unique = this._getValue(this._options.unique, true);
        if (this.onlyDirectories) {
          this.onlyFiles = false;
        }
        if (this.stats) {
          this.objectMode = true;
        }
        this.ignore = [].concat(this.ignore);
      }
      _getValue(option2, value) {
        return option2 === void 0 ? value : option2;
      }
      _getFileSystemMethods(methods = {}) {
        return Object.assign(Object.assign({}, exports2.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
      }
    };
    exports2.default = Settings;
  }
});

// ../../node_modules/fast-glob/out/index.js
var require_out4 = __commonJS({
  "../../node_modules/fast-glob/out/index.js"(exports2, module2) {
    "use strict";
    var taskManager = require_tasks();
    var async_1 = require_async6();
    var stream_1 = require_stream4();
    var sync_1 = require_sync6();
    var settings_1 = require_settings4();
    var utils = require_utils3();
    async function FastGlob(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, async_1.default, options);
      const result = await Promise.all(works);
      return utils.array.flatten(result);
    }
    (function(FastGlob2) {
      FastGlob2.glob = FastGlob2;
      FastGlob2.globSync = sync;
      FastGlob2.globStream = stream;
      FastGlob2.async = FastGlob2;
      function sync(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, sync_1.default, options);
        return utils.array.flatten(works);
      }
      FastGlob2.sync = sync;
      function stream(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, stream_1.default, options);
        return utils.stream.merge(works);
      }
      FastGlob2.stream = stream;
      function generateTasks(source, options) {
        assertPatternsInput(source);
        const patterns = [].concat(source);
        const settings = new settings_1.default(options);
        return taskManager.generate(patterns, settings);
      }
      FastGlob2.generateTasks = generateTasks;
      function isDynamicPattern(source, options) {
        assertPatternsInput(source);
        const settings = new settings_1.default(options);
        return utils.pattern.isDynamicPattern(source, settings);
      }
      FastGlob2.isDynamicPattern = isDynamicPattern;
      function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
      }
      FastGlob2.escapePath = escapePath;
      function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertPathToPattern(source);
      }
      FastGlob2.convertPathToPattern = convertPathToPattern;
      let posix;
      (function(posix2) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapePosixPath(source);
        }
        posix2.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertPosixPathToPattern(source);
        }
        posix2.convertPathToPattern = convertPathToPattern2;
      })(posix = FastGlob2.posix || (FastGlob2.posix = {}));
      let win32;
      (function(win322) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapeWindowsPath(source);
        }
        win322.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertWindowsPathToPattern(source);
        }
        win322.convertPathToPattern = convertPathToPattern2;
      })(win32 = FastGlob2.win32 || (FastGlob2.win32 = {}));
    })(FastGlob || (FastGlob = {}));
    function getWorks(source, _Provider, options) {
      const patterns = [].concat(source);
      const settings = new settings_1.default(options);
      const tasks = taskManager.generate(patterns, settings);
      const provider = new _Provider(settings);
      return tasks.map(provider.read, provider);
    }
    function assertPatternsInput(input) {
      const source = [].concat(input);
      const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
      if (!isValidSource) {
        throw new TypeError("Patterns must be a string (non empty) or an array of strings");
      }
    }
    module2.exports = FastGlob;
  }
});

// package.json
var require_package = __commonJS({
  "package.json"(exports2, module2) {
    module2.exports = {
      name: "@duyiliu/api2apifox",
      version: "0.1.5",
      private: true,
      description: "Internal CLI runtime source for the api2apifox Skill (not published to npm)",
      license: "MIT",
      repository: {
        type: "git",
        url: "https://github.com/duyiliu/api2apifox"
      },
      type: "commonjs",
      engines: {
        node: ">=20"
      },
      scripts: {
        build: "node build.js",
        typecheck: "tsc -p tsconfig.json --noEmit",
        test: "npm run build && node --test test/*.test.js"
      },
      dependencies: {
        "fast-glob": "^3.3.3",
        "java-parser": "^2.1.1"
      },
      devDependencies: {
        "@types/node": "^20.14.0",
        esbuild: "^0.23.0",
        typescript: "^5.5.0"
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  buildCliSyncReport: () => buildCliSyncReport,
  renderReportHtml: () => renderReportHtml,
  runCli: () => runCli,
  syncReportPath: () => syncReportPath
});
module.exports = __toCommonJS(main_exports);
var fs6 = __toESM(require("node:fs"));
var path7 = __toESM(require("node:path"));
var readline = __toESM(require("node:readline/promises"));
var import_node_process = require("node:process");

// ../../src/core/projectAnalyzer.ts
var fs3 = __toESM(require("node:fs"));
var path4 = __toESM(require("node:path"));

// ../../src/config/helperProperties.ts
var BACKTICK = "```";
function parseProperties(text, file = "<memory>") {
  const entries = [];
  const warnings = [];
  const rawLines = text.split(/\r\n|\r|\n/);
  const lines = rawLines.map((t, i2) => ({ text: t, lineNo: i2 + 1 }));
  let i = 0;
  while (i < lines.length) {
    let { text: text2, lineNo } = lines[i];
    if (text2.trimEnd().endsWith(BACKTICK) && !text2.trim().startsWith("#")) {
      const startLine = lineNo;
      const firstPart = text2.slice(0, text2.lastIndexOf(BACKTICK));
      const bodyLines = [];
      if (firstPart.includes("=") || firstPart.includes(":") || firstPart.trim().length === 0) {
        const assignIdx2 = findKeySeparator(firstPart);
        if (assignIdx2 < 0) {
          warnings.push(`${file}:${lineNo} \u591A\u884C\u914D\u7F6E\u7F3A\u5C11 key`);
          i++;
          while (i < lines.length && !lines[i].text.trim().startsWith(BACKTICK)) {
            i++;
          }
          continue;
        }
        const keyRaw2 = firstPart.slice(0, assignIdx2).trim();
        const { key: key2, cond: cond2 } = splitKeyCond(keyRaw2);
        if (!key2) {
          warnings.push(`${file}:${startLine} \u7A7A\u914D\u7F6E key,\u5DF2\u8DF3\u8FC7`);
        }
        let prefix = firstPart.slice(assignIdx2 + 1).trim();
        i++;
        while (i < lines.length && !lines[i].text.trim().startsWith(BACKTICK)) {
          bodyLines.push(lines[i].text);
          i++;
        }
        const value2 = prefix + "\n" + bodyLines.join("\n");
        const cleaned = trimBlankLines(value2);
        if (key2) {
          entries.push({ key: key2, cond: cond2, value: cleaned, file, line: startLine });
        }
        i++;
        continue;
      }
      i++;
      continue;
    }
    const trimmed = text2.trimStart();
    if (trimmed.startsWith("#") || trimmed.startsWith("!")) {
      i++;
      continue;
    }
    if (trimmed.length === 0) {
      i++;
      continue;
    }
    const assignIdx = findKeySeparator(text2);
    if (assignIdx < 0) {
      warnings.push(`${file}:${lineNo} \u65E0\u6CD5\u89E3\u6790\u7684\u884C(\u7F3A\u5C11 = \u6216 :):${trimmed.slice(0, 40)}`);
      i++;
      continue;
    }
    const keyRaw = text2.slice(0, assignIdx).trim();
    let value = text2.slice(assignIdx + 1).trimStart();
    const { key, cond } = splitKeyCond(keyRaw);
    if (!key) {
      warnings.push(`${file}:${lineNo} \u7A7A\u914D\u7F6E key,\u5DF2\u8DF3\u8FC7`);
    }
    while (endsWithOddBackslash(value)) {
      const raw2 = value;
      value = raw2.slice(0, -1);
      value = value.replace(/[ \t]+$/, "");
      if (i + 1 < lines.length) {
        i++;
        value += lines[i].text.replace(/^[ \t]+/, "");
      } else {
        warnings.push(`${file}:${lineNo} \u884C\u672B \\ \u7EED\u884C\u540E\u65E0\u5185\u5BB9`);
        break;
      }
    }
    const finalValue = trimTrailingWs(value);
    if (key) {
      entries.push({ key, cond, value: finalValue, file, line: lineNo });
    }
    i++;
  }
  return { entries, warnings };
}
function loadPropertiesFiles(files, readFile) {
  const entries = [];
  const warnings = [];
  const visited = /* @__PURE__ */ new Set();
  const watched = /* @__PURE__ */ new Set();
  const loaded = [];
  const queue = [...files];
  while (queue.length) {
    const cur = queue.shift();
    if (visited.has(cur.path)) {
      continue;
    }
    visited.add(cur.path);
    watched.add(cur.path);
    if (cur.content === "" && readFile && isPlausibleFile(cur.path)) {
      const content = readFile(cur.path);
      if (content === void 0) {
        warnings.push(`properties.additional \u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u53EF\u8BFB,\u5DF2\u8DF3\u8FC7:${cur.path}`);
        continue;
      }
      cur.content = content;
    }
    loaded.push(cur.path);
    const r = parseProperties(cur.content, cur.path);
    entries.push(...r.entries);
    warnings.push(...r.warnings);
    for (const e of r.entries) {
      if (e.key === "properties.additional") {
        const p = resolveAdditionalPath(cur.path, e.value);
        if (p && !visited.has(p)) {
          queue.push({ path: p, content: "" });
        }
      }
    }
  }
  return { entries, warnings, files: loaded, watchedFiles: [...watched] };
}
function isPlausibleFile(p) {
  return p.length > 0 && !p.endsWith("/");
}
function resolveAdditionalPath(baseFile, raw) {
  let p = raw.trim();
  if (!p) {
    return void 0;
  }
  p = p.replace(/\$\{module_path\}/g, dirOf(baseFile));
  if (!isAbsolute(p)) {
    p = joinPath(dirOf(baseFile), p);
  }
  return normalizePath(p);
}
function splitKeyCond(keyRaw) {
  const idx = keyRaw.indexOf("[");
  if (idx < 0 || !keyRaw.endsWith("]")) {
    return { key: keyRaw };
  }
  const key = keyRaw.slice(0, idx).trim();
  const cond = keyRaw.slice(idx + 1, -1);
  return { key, cond: cond || void 0 };
}
function findKeySeparator(line) {
  let inStr = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "=" || ch === ":") {
      return i;
    }
  }
  return -1;
}
function endsWithOddBackslash(s) {
  let n = 0;
  for (let i = s.length - 1; i >= 0 && s[i] === "\\"; i--) {
    n++;
  }
  return n % 2 === 1;
}
function trimBlankLines(s) {
  return s.replace(/^\s*\n/, "").replace(/\s+$/, "");
}
function trimTrailingWs(s) {
  return s.replace(/[ \t\r]+$/, "");
}
function dirOf(p) {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i < 0 ? "" : p.slice(0, i);
}
function normalizePath(p) {
  return p.replace(/\\/g, "/");
}
function isAbsolute(p) {
  return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("/") || p.startsWith("\\\\");
}
function joinPath(a, b) {
  if (!a) {
    return b;
  }
  return a.replace(/[\\/]+$/, "") + "/" + b.replace(/^[\\/]+/, "");
}
function unescapeProp(s) {
  return s.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_m, g) => {
    if (g.startsWith("u")) {
      return String.fromCharCode(parseInt(g.slice(1), 16));
    }
    switch (g) {
      case "n":
        return "\n";
      case "t":
        return "	";
      case "r":
        return "\r";
      case "f":
        return "\f";
      case "\\":
        return "\\";
      default:
        return g;
    }
  });
}

// ../../src/java/jarIndex.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var zlib = __toESM(require("zlib"));

// ../../src/java/descriptor.ts
function parseFieldSignature(sig) {
  try {
    const p = new SigParser(sig);
    return p.parseType();
  } catch {
    return void 0;
  }
}
function parseClassSignature(sig) {
  try {
    const p = new SigParser(sig);
    const typeParams = [];
    if (p.peek() === "<") {
      p.next();
      while (p.pos < p.s.length && p.peek() !== ">") {
        const name = p.readIdentifier();
        p.next();
        p.parseType();
        while (p.pos < p.s.length && p.peek() === ":") {
          p.next();
          p.parseType();
        }
        typeParams.push(name);
      }
      p.next();
    }
    const superSig = p.peek() ? p.parseType() : void 0;
    return { typeParams, superSig };
  } catch {
    return void 0;
  }
}
function sigToText(t) {
  let s = t.name;
  if (t.args.length) {
    s += "<" + t.args.map(sigToText).join(", ") + ">";
  }
  return s + "[]".repeat(t.dims);
}
var SigParser = class {
  constructor(s) {
    this.s = s;
  }
  pos = 0;
  peek(offset = 0) {
    return this.s[this.pos + offset] ?? "";
  }
  next() {
    return this.s[this.pos++] ?? "";
  }
  skip(ch) {
    while (this.peek() === ch) {
      this.pos++;
    }
  }
  readIdentifier() {
    let out = "";
    while (this.pos < this.s.length && /[\w$.]/.test(this.s[this.pos])) {
      out += this.next();
    }
    return out;
  }
  /** 解析一个类型:数组维度(前缀 [)+ 基础类型/类类型(可能带 <...>)/类型变量/通配符 */
  parseType() {
    let dims = 0;
    while (this.peek() === "[") {
      this.next();
      dims++;
    }
    let t;
    const c = this.peek();
    if (c === "T") {
      this.next();
      const name = this.readIdentifier();
      this.skip(";");
      t = { name, args: [], dims };
    } else if (c === "*") {
      this.next();
      t = { name: "Object", args: [], dims };
    } else if (c === "+" || c === "-") {
      this.next();
      t = this.parseType();
      t = { ...t, dims };
    } else if (c === "L") {
      this.next();
      let name = "";
      let args = [];
      while (this.pos < this.s.length) {
        const ch = this.peek();
        if (ch === "<") {
          this.next();
          while (this.pos < this.s.length && this.peek() !== ">") {
            args.push(this.parseType());
          }
          this.next();
          continue;
        }
        if (ch === ";") {
          this.next();
          break;
        }
        if (ch === ".") {
          name += ".";
          this.next();
          continue;
        }
        name += this.next();
      }
      t = { name: name.replace(/\//g, "."), args, dims };
    } else {
      const base = this.next();
      const prim = {
        B: "byte",
        C: "char",
        D: "double",
        F: "float",
        I: "int",
        J: "long",
        S: "short",
        Z: "boolean",
        V: "void"
      };
      t = { name: prim[base] ?? "Object", args: [], dims };
    }
    return t;
  }
};

// ../../src/java/classFile.ts
var CP_UTF8 = 1;
var CP_INTEGER = 3;
var CP_FLOAT = 4;
var CP_LONG = 5;
var CP_DOUBLE = 6;
var CP_CLASS = 7;
var CP_STRING = 8;
var CP_FIELDREF = 9;
var CP_METHODREF = 10;
var CP_IFACEMETHODREF = 11;
var CP_NAMEANDTYPE = 12;
var CP_METHODHANDLE = 15;
var CP_METHODTYPE = 16;
var CP_DYNAMIC = 17;
var CP_INVOKEDYNAMIC = 18;
var CP_MODULE = 19;
var CP_PACKAGE = 20;
var ACC_INTERFACE = 512;
var ACC_SYNTHETIC = 4096;
var ACC_ANNOTATION_TYPE = 8192;
var ACC_ENUM = 16384;
var ACC_STATIC = 8;
var ACC_FINAL = 16;
function parseClassFile(buf) {
  const r = new ByteReader(buf);
  const magic = r.u4();
  if (magic !== 3405691582) {
    throw new Error(`\u4E0D\u662F class \u6587\u4EF6(magic=0x${magic.toString(16)})`);
  }
  r.u2();
  r.u2();
  const cpCount = r.u2();
  const cp = new Array(cpCount);
  let i = 1;
  while (i < cpCount) {
    const tag = r.u1();
    switch (tag) {
      case CP_UTF8:
        cp[i] = r.utf8();
        break;
      case CP_INTEGER:
      case CP_FLOAT:
        cp[i] = r.bytes(4).readUInt32BE(0);
        break;
      case CP_LONG:
      case CP_DOUBLE:
        cp[i] = new LongVal(r.bytes(8));
        i++;
        break;
      case CP_CLASS:
      case CP_STRING:
      case CP_METHODTYPE:
      case CP_MODULE:
      case CP_PACKAGE:
        cp[i] = { index: r.u2() };
        break;
      case CP_FIELDREF:
      case CP_METHODREF:
      case CP_IFACEMETHODREF:
      case CP_NAMEANDTYPE:
      case CP_DYNAMIC:
      case CP_INVOKEDYNAMIC: {
        const a = r.u2();
        const b = r.u2();
        cp[i] = { index: a, index2: b };
        break;
      }
      case CP_METHODHANDLE: {
        const a = r.u1();
        const b = r.u2();
        cp[i] = { index: b, kind: a };
        break;
      }
      default:
        throw new Error(`\u672A\u77E5\u5E38\u91CF\u6C60 tag: ${tag}`);
    }
    i++;
  }
  const utf8 = (idx) => typeof cp[idx] === "string" ? cp[idx] : "";
  const classNameOf = (idx) => {
    const e = cp[idx];
    if (!e || typeof e.index !== "number") {
      return "";
    }
    return utf8(e.index).replace(/\//g, ".");
  };
  const accessFlags = r.u2();
  const thisClass = classNameOf(r.u2());
  const superClassIdx = r.u2();
  const interfacesCount = r.u2();
  for (let k = 0; k < interfacesCount; k++) {
    r.u2();
  }
  const fieldsCount = r.u2();
  const fields = [];
  const enumConstants = [];
  const selfDesc = "L" + thisClass.replace(/\./g, "/") + ";";
  for (let k = 0; k < fieldsCount; k++) {
    const fAccess = r.u2();
    const fNameIdx = r.u2();
    const fDescIdx = r.u2();
    const name = utf8(fNameIdx);
    const descriptor = utf8(fDescIdx);
    const anns = [];
    let signature;
    const attrCount = r.u2();
    for (let a = 0; a < attrCount; a++) {
      const attrName = utf8(r.u2());
      const attrLen = r.u4();
      const attrBody = r.bytes(attrLen);
      if (attrName === "Signature") {
        signature = utf8(attrBody.readUInt16BE(0));
      } else if (attrName === "RuntimeVisibleAnnotations") {
        try {
          anns.push(...readAnnotations(new ByteReader(attrBody), cp, utf8));
        } catch {
        }
      }
    }
    const synthetic = (fAccess & ACC_SYNTHETIC) !== 0;
    const isStatic = (fAccess & ACC_STATIC) !== 0;
    const isEnumConst = (accessFlags & ACC_ENUM) !== 0 && descriptor === selfDesc && isStatic && (fAccess & ACC_FINAL) !== 0;
    if (isEnumConst) {
      enumConstants.push(name);
      continue;
    }
    if (synthetic || isStatic) {
      continue;
    }
    const sig = signature ?? descriptor;
    const parsed = parseFieldSignature(sig);
    fields.push({
      name,
      typeText: parsed ? sigToText(parsed) : "Object",
      annotations: anns,
      static: isStatic,
      synthetic,
      enumConstant: false
    });
  }
  const methodsCount = r.u2();
  for (let k = 0; k < methodsCount; k++) {
    r.u2();
    r.u2();
    r.u2();
    const attrCount = r.u2();
    for (let a = 0; a < attrCount; a++) {
      r.u2();
      r.bytes(r.u4());
    }
  }
  let classSignature;
  const classAnns = [];
  const classAttrCount = r.u2();
  for (let a = 0; a < classAttrCount; a++) {
    const attrName = utf8(r.u2());
    const attrLen = r.u4();
    const attrBody = r.bytes(attrLen);
    if (attrName === "Signature") {
      classSignature = utf8(attrBody.readUInt16BE(0));
    } else if (attrName === "RuntimeVisibleAnnotations") {
      try {
        classAnns.push(...readAnnotations(new ByteReader(attrBody), cp, utf8));
      } catch {
      }
    }
  }
  let typeParams = [];
  let superClass;
  if (classSignature) {
    const cs = parseClassSignature(classSignature);
    if (cs) {
      typeParams = cs.typeParams;
      if (cs.superSig) {
        const text = sigToText(cs.superSig);
        if (text !== "java.lang.Object" && text !== "Object") {
          superClass = text;
        }
      }
    }
  } else if (superClassIdx !== 0) {
    const sc = classNameOf(superClassIdx);
    if (sc && sc !== "java.lang.Object") {
      superClass = sc;
    }
  }
  const kind = (accessFlags & ACC_ANNOTATION_TYPE) !== 0 ? "annotation" : (accessFlags & ACC_ENUM) !== 0 ? "enum" : (accessFlags & ACC_INTERFACE) !== 0 ? "interface" : "class";
  const simpleName2 = thisClass.slice(thisClass.lastIndexOf(".") + 1);
  return { fqcn: thisClass, simpleName: simpleName2, kind, typeParams, superClass, fields, enumConstants, annotations: classAnns };
}
var LongVal = class {
  constructor(buf) {
    this.buf = buf;
  }
};
var ByteReader = class {
  constructor(buf) {
    this.buf = buf;
  }
  pos = 0;
  u1() {
    return this.buf.readUInt8(this.pos++);
  }
  u2() {
    const v = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return v;
  }
  u4() {
    const v = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return v;
  }
  bytes(n) {
    const b = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }
  utf8() {
    const len = this.u2();
    const raw = this.bytes(len);
    return raw.toString("utf8");
  }
};
function readAnnotations(r, cp, utf8) {
  const num = r.u2();
  const out = [];
  for (let k = 0; k < num; k++) {
    out.push(readAnnotation(r, cp, utf8));
  }
  return out;
}
function readAnnotation(r, cp, utf8) {
  const typeDesc = utf8(r.u2());
  const fqcn = typeDesc.replace(/^L|;$/g, "").replace(/\//g, ".");
  const numPairs = r.u2();
  const args = {};
  for (let k = 0; k < numPairs; k++) {
    const name = utf8(r.u2());
    args[name] = readElementValue(r, cp, utf8);
  }
  return { name: fqcn.slice(fqcn.lastIndexOf(".") + 1), fqcn, args };
}
function readElementValue(r, cp, utf8) {
  const tag = String.fromCharCode(r.u1());
  switch (tag) {
    case "B":
    case "C":
    case "I":
    case "S": {
      const idx = r.u2();
      const v = cp[idx];
      return typeof v === "number" ? v : void 0;
    }
    case "Z": {
      const idx = r.u2();
      const v = cp[idx];
      return typeof v === "number" ? v !== 0 : void 0;
    }
    case "D":
    case "F":
    case "J": {
      const idx = r.u2();
      const v = cp[idx];
      if (v instanceof LongVal) {
        const lo = v.buf.readUInt32BE(4);
        return lo;
      }
      return typeof v === "number" ? v : void 0;
    }
    case "s":
      return utf8(r.u2());
    case "e": {
      r.u2();
      return utf8(r.u2());
    }
    case "c": {
      const d = utf8(r.u2());
      return d.replace(/^L|;$/g, "").replace(/\//g, ".");
    }
    case "@": {
      const ann = readAnnotation(r, cp, utf8);
      return ann;
    }
    case "[": {
      const n = r.u2();
      const arr = [];
      for (let k = 0; k < n; k++) {
        arr.push(readElementValue(r, cp, utf8));
      }
      return arr;
    }
    default:
      return void 0;
  }
}

// ../../src/java/jarIndex.ts
var EOCD_SIG = 101010256;
var CDE_SIG = 33639248;
var LFH_SIG = 67324752;
function findEocdIndex(tail) {
  const minTail = 22;
  const start = Math.max(0, tail.length - minTail - 65535);
  for (let i = tail.length - minTail; i >= start; i--) {
    if (tail.readUInt32LE(i) === EOCD_SIG) {
      return i;
    }
  }
  return -1;
}
function parseCentralDirectory(cd, total) {
  const out = [];
  let p = 0;
  for (let k = 0; k < total; k++) {
    if (p + 46 > cd.length || cd.readUInt32LE(p) !== CDE_SIG) {
      break;
    }
    const method = cd.readUInt16LE(p + 10);
    const compressedSize = cd.readUInt32LE(p + 20);
    const nameLen = cd.readUInt16LE(p + 28);
    const extraLen = cd.readUInt16LE(p + 30);
    const commentLen = cd.readUInt16LE(p + 32);
    const localOffset = cd.readUInt32LE(p + 42);
    const name = cd.toString("utf8", p + 46, p + 46 + nameLen);
    out.push({ name, method, compressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}
var ZipSource = class _ZipSource {
  constructor(fd, size) {
    this.fd = fd;
    this.size = size;
  }
  static open(jarPath) {
    const fd = fs.openSync(jarPath, "r");
    try {
      return new _ZipSource(fd, fs.fstatSync(fd).size);
    } catch (err) {
      try {
        fs.closeSync(fd);
      } catch {
      }
      throw err;
    }
  }
  /** 读取 [offset, offset+length);文件尾部不足时返回实际读到的长度 */
  read = (offset, length) => {
    const b = Buffer.allocUnsafe(length);
    const n = fs.readSync(this.fd, b, 0, length, offset);
    return n === length ? b : b.subarray(0, n);
  };
  close() {
    try {
      fs.closeSync(this.fd);
    } catch {
    }
  }
};
function readDirectory(src) {
  const tailSize = Math.min(src.size, 22 + 65535);
  const tail = src.read(src.size - tailSize, tailSize);
  const eocd = findEocdIndex(tail);
  if (eocd < 0) {
    throw new Error("zip: \u672A\u627E\u5230 EOCD");
  }
  const total = tail.readUInt16LE(eocd + 10);
  const cdSize = tail.readUInt32LE(eocd + 12);
  const cdOffset = tail.readUInt32LE(eocd + 16);
  const cd = src.read(cdOffset, cdSize);
  return new Map(parseCentralDirectory(cd, total).map((e) => [e.name, e]));
}
function readZipEntryFrom(read, entry) {
  const head2 = read(entry.localOffset, 30);
  if (head2.length < 30 || head2.readUInt32LE(0) !== LFH_SIG) {
    throw new Error(`zip: local header \u6821\u9A8C\u5931\u8D25(${entry.name})`);
  }
  const nameLen = head2.readUInt16LE(26);
  const extraLen = head2.readUInt16LE(28);
  const raw = read(entry.localOffset + 30 + nameLen + extraLen, entry.compressedSize);
  if (entry.method === 0) {
    return Buffer.from(raw);
  }
  if (entry.method === 8) {
    return zlib.inflateRawSync(raw);
  }
  throw new Error(`zip: \u4E0D\u652F\u6301\u7684\u538B\u7F29\u65B9\u5F0F ${entry.method}(${entry.name})`);
}
function toAnnotationInfo(a) {
  const args = {};
  for (const [k, v] of Object.entries(a.args)) {
    args[k] = toArgValue(v);
  }
  return { name: a.name, raw: `@${a.fqcn}`, args };
}
function toArgValue(v) {
  if (Array.isArray(v)) {
    return v.map((x) => toArgValue(x));
  }
  if (v === null || v === void 0) {
    return "";
  }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return v;
  }
  if (typeof v === "object" && "name" in v && "args" in v) {
    const nested = v.args ?? {};
    const first2 = Object.values(nested)[0];
    return typeof first2 === "string" || typeof first2 === "number" || typeof first2 === "boolean" ? first2 : "";
  }
  return String(v);
}
function toClassInfo(pc) {
  const fields = pc.fields.map((f) => ({
    name: f.name,
    typeText: f.typeText,
    annotations: f.annotations.map(toAnnotationInfo),
    javadoc: void 0
  }));
  const kind = pc.kind === "enum" ? "enum" : pc.kind === "interface" ? "interface" : "class";
  return {
    simpleName: pc.simpleName,
    qualifiedName: pc.fqcn,
    kind,
    typeParams: pc.typeParams,
    fields,
    recordComponents: [],
    enumConstants: pc.enumConstants,
    annotations: pc.annotations.map(toAnnotationInfo),
    superClass: pc.superClass
  };
}
var JarClassIndex = class _JarClassIndex {
  bySimple = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  jarCache = /* @__PURE__ */ new Map();
  /** 解析失败的条目(jar 缺失/损坏),用于诊断 */
  warnings = [];
  static build(jarPaths) {
    const idx = new _JarClassIndex();
    for (const jp of jarPaths) {
      const jar = idx.jarOf(jp);
      if (!jar) {
        continue;
      }
      for (const e of jar.entries.values()) {
        if (!e.name.endsWith(".class")) {
          continue;
        }
        if (e.name.endsWith("module-info.class") || e.name.endsWith("package-info.class")) {
          continue;
        }
        const base = e.name.slice(0, -".class".length);
        const simple = base.slice(base.lastIndexOf("/") + 1).split("$").pop() ?? base;
        if (!simple || !/^[A-Za-z_]\w*$/.test(simple)) {
          continue;
        }
        if (!idx.bySimple.has(simple)) {
          idx.bySimple.set(simple, { jarPath: jp, entryName: e.name });
        }
      }
    }
    return idx;
  }
  get size() {
    return this.bySimple.size;
  }
  jarOf(jarPath) {
    if (this.jarCache.has(jarPath)) {
      return this.jarCache.get(jarPath) ?? null;
    }
    try {
      const src = ZipSource.open(jarPath);
      try {
        const val = { src, entries: readDirectory(src) };
        this.jarCache.set(jarPath, val);
        return val;
      } catch (err) {
        src.close();
        throw err;
      }
    } catch (err) {
      this.warnings.push(`\u8BFB\u53D6 jar \u5931\u8D25 ${jarPath}:${err instanceof Error ? err.message : String(err)}`);
      this.jarCache.set(jarPath, null);
      return null;
    }
  }
  /** 按简单类名取 ClassInfo;无/失败返回 undefined */
  lookup(simpleName2) {
    if (this.cache.has(simpleName2)) {
      const hit = this.cache.get(simpleName2);
      return hit ?? void 0;
    }
    const ref = this.bySimple.get(simpleName2);
    if (!ref) {
      this.cache.set(simpleName2, null);
      return void 0;
    }
    try {
      const jar = this.jarOf(ref.jarPath);
      const entry = jar?.entries.get(ref.entryName);
      if (!jar || !entry) {
        this.cache.set(simpleName2, null);
        return void 0;
      }
      const classBytes = readZipEntryFrom(jar.src.read, entry);
      const info = toClassInfo(parseClassFile(classBytes));
      this.cache.set(simpleName2, info);
      return info;
    } catch (err) {
      this.warnings.push(`\u89E3\u6790 ${ref.jarPath}!${ref.entryName} \u5931\u8D25:${err instanceof Error ? err.message : String(err)}`);
      this.cache.set(simpleName2, null);
      return void 0;
    }
  }
  /** 释放所有持有的 jar fd;索引被替换/丢弃前调用,避免长会话 fd 泄漏 */
  dispose() {
    for (const jar of this.jarCache.values()) {
      jar?.src.close();
    }
    this.jarCache.clear();
    this.cache.clear();
  }
};
async function discoverMavenRepos(configured) {
  const repos = [];
  const push = async (p) => {
    if (!p) {
      return;
    }
    try {
      if ((await fs.promises.stat(p)).isDirectory() && !repos.includes(p)) {
        repos.push(p);
      }
    } catch {
    }
  };
  for (const r of configured) {
    await push(r);
  }
  for (const dir of jetbrainsOptionDirs()) {
    let products = [];
    try {
      products = await fs.promises.readdir(dir);
    } catch {
      continue;
    }
    for (const prod of products) {
      const optBase = path.join(dir, prod, "options");
      const macros = await readTextSafe(path.join(optBase, "path.macros.xml"));
      if (macros) {
        const m = /<macro\s+name="MAVEN_REPOSITORY"\s+value="([^"]+)"/.exec(macros);
        if (m) {
          await push(m[1]);
        }
      }
      const indices = await readTextSafe(path.join(optBase, "mavenIndicesState.xml"));
      if (indices) {
        for (const em of indices.matchAll(/<entry key="([^"]+)">/g)) {
          const v = em[1];
          if (v && !/^https?:/i.test(v)) {
            await push(v);
          }
        }
      }
    }
  }
  const settings = path.join(os.homedir(), ".m2", "settings.xml");
  const settingsText = await readTextSafe(settings);
  if (settingsText) {
    const m = /<localRepository>([^<]+)<\/localRepository>/.exec(settingsText);
    if (m) {
      await push(m[1].trim());
    }
  }
  await push(path.join(os.homedir(), ".m2", "repository"));
  return repos;
}
function jetbrainsOptionDirs() {
  const out = [];
  const appData = process.env.APPDATA;
  if (appData) {
    out.push(path.join(appData, "JetBrains"));
  }
  const home = os.homedir();
  out.push(path.join(home, ".config", "JetBrains"));
  out.push(path.join(home, "Library", "Application Support", "JetBrains"));
  return out;
}
async function readTextSafe(p) {
  try {
    return await fs.promises.readFile(p, "utf8");
  } catch {
    return void 0;
  }
}
function parsePomDependencies(content) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const m of content.matchAll(/<dependency>[\s\S]*?<\/dependency>/g)) {
    const d = m[0];
    if (/<scope>\s*(test|provided)\s*<\/scope>/.test(d)) {
      continue;
    }
    const g = /<groupId>\s*([^<]+?)\s*<\/groupId>/.exec(d)?.[1];
    const a = /<artifactId>\s*([^<]+?)\s*<\/artifactId>/.exec(d)?.[1];
    if (!g || !a || g.includes("${") || a.includes("${")) {
      continue;
    }
    const key = `${g}:${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ groupId: g, artifactId: a });
    }
  }
  return out;
}
function versionCompare(a, b) {
  const pa = a.split(/[.-]/);
  const pb = b.split(/[.-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const xa = pa[i] ?? "";
    const xb = pb[i] ?? "";
    const na = /^\d+$/.test(xa) ? parseInt(xa, 10) : NaN;
    const nb = /^\d+$/.test(xb) ? parseInt(xb, 10) : NaN;
    if (!isNaN(na) && !isNaN(nb)) {
      if (na !== nb) {
        return na - nb;
      }
      continue;
    }
    const c = xa.localeCompare(xb);
    if (c !== 0) {
      return c;
    }
  }
  return 0;
}
async function readEmbeddedPomXml(jarPath) {
  const fh = await fs.promises.open(jarPath, "r");
  try {
    const readAt = async (offset, length) => {
      const b = Buffer.allocUnsafe(length);
      const { bytesRead } = await fh.read(b, 0, length, offset);
      return bytesRead === length ? b : b.subarray(0, bytesRead);
    };
    const size = (await fh.stat()).size;
    const tailSize = Math.min(size, 22 + 65535);
    const tail = await readAt(size - tailSize, tailSize);
    const eocd = findEocdIndex(tail);
    if (eocd < 0) {
      return void 0;
    }
    const total = tail.readUInt16LE(eocd + 10);
    const cdSize = tail.readUInt32LE(eocd + 12);
    const cdOffset = tail.readUInt32LE(eocd + 16);
    const cd = await readAt(cdOffset, cdSize);
    const pom = parseCentralDirectory(cd, total).find(
      (e) => /^META-INF\/maven\/[^/]+\/[^/]+\/pom\.xml$/.test(e.name)
    );
    if (!pom) {
      return void 0;
    }
    const head2 = await readAt(pom.localOffset, 30);
    if (head2.length < 30 || head2.readUInt32LE(0) !== LFH_SIG) {
      throw new Error(`zip: local header \u6821\u9A8C\u5931\u8D25(${pom.name})`);
    }
    const raw = await readAt(pom.localOffset + 30 + head2.readUInt16LE(26) + head2.readUInt16LE(28), pom.compressedSize);
    const data = pom.method === 0 ? Buffer.from(raw) : pom.method === 8 ? zlib.inflateRawSync(raw) : void 0;
    if (!data) {
      throw new Error(`zip: \u4E0D\u652F\u6301\u7684\u538B\u7F29\u65B9\u5F0F ${pom.method}(${pom.name})`);
    }
    return data.toString("utf8");
  } finally {
    await fh.close().catch(() => void 0);
  }
}
async function resolveDependencyJars(repos, pomCoords, opts = {}) {
  const maxRounds = opts.maxRounds ?? 2;
  const maxJars = opts.maxJars ?? 120;
  const collected = [];
  const collectedSet = /* @__PURE__ */ new Set();
  const knownCoords = new Set(pomCoords.map((c) => `${c.groupId}:${c.artifactId}`));
  const warnings = [];
  let roundCoords = pomCoords;
  let dropped = 0;
  const droppedNames = [];
  for (let round = 0; round <= maxRounds && collected.length < maxJars; round++) {
    const jars = await findJarsForCoordinates(repos, roundCoords);
    const fresh = jars.filter((j) => !collectedSet.has(j));
    for (const j of fresh) {
      if (collected.length >= maxJars) {
        dropped++;
        if (droppedNames.length < 10) {
          droppedNames.push(path.basename(j));
        }
        continue;
      }
      collected.push(j);
      collectedSet.add(j);
    }
    if (round === maxRounds || !fresh.length) {
      break;
    }
    const next = [];
    for (const j of jars) {
      try {
        const pomXml = await readEmbeddedPomXml(j);
        if (pomXml) {
          for (const c of parsePomDependencies(pomXml)) {
            const key = `${c.groupId}:${c.artifactId}`;
            if (!knownCoords.has(key)) {
              knownCoords.add(key);
              next.push(c);
            }
          }
        }
      } catch (err) {
        warnings.push(`\u8BFB\u53D6 ${j} \u5185\u5D4C pom \u5931\u8D25:${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (!next.length) {
      break;
    }
    roundCoords = next;
  }
  if (dropped) {
    warnings.push(
      `\u4F9D\u8D56 jar \u6570\u91CF\u8FBE\u5230\u4E0A\u9650 ${maxJars},\u5FFD\u7565 ${dropped} \u4E2A\u5DF2\u5B9A\u4F4D\u4F9D\u8D56 jar:${droppedNames.join(", ")}${dropped > droppedNames.length ? " \u7B49" : ""}(\u66F4\u6DF1\u5C42\u672A\u5C55\u5F00\u7684\u4F20\u9012\u4F9D\u8D56\u4E0D\u5728\u5176\u4E2D;\u53EF\u7528 maxDependencyJars \u8C03\u9AD8\u4E0A\u9650\u6216 dependencyJars \u663E\u5F0F\u8865\u5145)`
    );
  }
  return { jars: collected, warnings };
}
async function findJarsForCoordinates(repos, coords) {
  const jars = [];
  const seen = /* @__PURE__ */ new Set();
  for (const c of coords) {
    let versions = [];
    let artifactDirHit = "";
    for (const repo of repos) {
      const artifactDir = path.join(repo, ...c.groupId.split("."), c.artifactId);
      let list;
      try {
        list = await fs.promises.readdir(artifactDir);
      } catch {
        continue;
      }
      const vers = [];
      for (const v of list) {
        if (/^\./.test(v)) {
          continue;
        }
        try {
          if ((await fs.promises.stat(path.join(artifactDir, v))).isDirectory()) {
            vers.push(v);
          }
        } catch {
        }
      }
      if (vers.length) {
        artifactDirHit = artifactDir;
        versions = vers;
        break;
      }
    }
    if (!versions.length) {
      continue;
    }
    versions.sort(versionCompare);
    for (let i = versions.length - 1; i >= 0; i--) {
      const vDir = path.join(artifactDirHit, versions[i]);
      try {
        const jar = (await fs.promises.readdir(vDir)).find(
          (f) => f === `${c.artifactId}-${versions[i]}.jar` && !f.includes("sources") && !f.includes("javadoc")
        );
        if (jar) {
          const full = path.join(vDir, jar);
          if (!seen.has(full)) {
            seen.add(full);
            jars.push(full);
          }
          break;
        }
      } catch {
      }
    }
  }
  return jars;
}

// ../../src/java/cst.ts
function isCstNode(el) {
  return !!el && typeof el === "object" && "name" in el && "children" in el;
}
function isToken(el) {
  return !!el && typeof el === "object" && "image" in el;
}
function childAll(node, name) {
  return node?.children?.[name] ?? [];
}
function child(node, name) {
  return childAll(node, name)[0];
}
function childNode(node, name) {
  const c = child(node, name);
  return isCstNode(c) ? c : void 0;
}
function tokenImage(node, name) {
  const c = child(node, name);
  return isToken(c) ? c.image : void 0;
}
function findAll(node, name, out = [], depth = 0) {
  if (!node || depth > 200) {
    return out;
  }
  if (node.name === name) {
    out.push(node);
  }
  for (const v of Object.values(node.children ?? {})) {
    for (const el of v) {
      if (isCstNode(el)) {
        findAll(el, name, out, depth + 1);
      }
    }
  }
  return out;
}
function nodeText(source, node) {
  const loc = node.location;
  if (!loc) {
    return "";
  }
  return source.slice(loc.startOffset, loc.endOffset + 1);
}
function nodeJavadoc(node) {
  const comments = node?.leadingComments ?? [];
  const jd = comments.find((c) => c.image.trimEnd().startsWith("/**"));
  return jd ? jd.image : void 0;
}
function typeNameOf(decl, rule = "typeIdentifier") {
  const ti = childNode(decl, rule);
  if (ti) {
    return tokenImage(ti, "Identifier") ?? tokenImage(ti, rule) ?? "";
  }
  return tokenImage(decl, rule) ?? tokenImage(decl, "Identifier") ?? "";
}

// ../../src/java/annotation.ts
function collectAnnotations(modifiers, source) {
  const result = [];
  for (const mod of modifiers) {
    const ann = childNode(mod, "annotation");
    if (!ann) {
      continue;
    }
    result.push(parseAnnotation(ann, source));
  }
  return result;
}
function parseAnnotation(ann, source) {
  const raw = nodeText(source, ann);
  const typeName = childNode(ann, "typeName");
  const ids = childAll(typeName, "Identifier").filter(isToken);
  const name = ids.length ? ids[ids.length - 1].image : "";
  let args = {};
  const lbrace = tokenImage(ann, "LBrace");
  if (lbrace) {
    const inner = raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")")).trim();
    args = inner ? parseArgsText(inner) : {};
  }
  return { name, raw, args };
}
function parseArgsText(text) {
  const args = {};
  for (const part of splitTopLevel(text)) {
    const eq2 = findTopLevelEquals(part);
    let key = "value";
    let valueText = part.trim();
    if (eq2 >= 0) {
      key = part.slice(0, eq2).trim();
      valueText = part.slice(eq2 + 1).trim();
    }
    args[key] = parseValueText(valueText);
  }
  return args;
}
function parseValueText(text) {
  const t = text.trim();
  if (t.startsWith("{") && t.endsWith("}")) {
    return splitTopLevel(t.slice(1, -1)).map((s) => s.trim()).filter((s) => s.length > 0).map(parseValueText);
  }
  if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
    return unescapeJava(t.slice(1, -1));
  }
  if (t === "true") {
    return true;
  }
  if (t === "false") {
    return false;
  }
  if (/^-?\d+$/.test(t)) {
    return parseInt(t, 10);
  }
  if (/^-?\d*\.\d+([eE][+-]?\d+)?$/.test(t)) {
    return parseFloat(t);
  }
  return t;
}
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let inStr = null;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      cur += ch;
      if (ch === "\\") {
        if (i + 1 < text.length) {
          cur += text[++i];
        }
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
    } else if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim().length > 0) {
    parts.push(cur);
  }
  return parts;
}
function findTopLevelEquals(text) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
    } else if (ch === "=" && depth === 0 && text[i + 1] !== "=" && text[i - 1] !== "=" && text[i - 1] !== "!" && text[i - 1] !== ">" && text[i - 1] !== "<") {
      return i;
    }
  }
  return -1;
}
function unescapeJava(s) {
  return s.replace(/\\(.)/g, (_m, c) => {
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "	";
      case "r":
        return "\r";
      case '"':
        return '"';
      case "'":
        return "'";
      case "\\":
        return "\\";
      default:
        return c;
    }
  });
}

// ../../src/java/javadoc.ts
function parseJavadoc(raw) {
  if (!raw) {
    return void 0;
  }
  const cleaned = cleanJavadoc(raw);
  if (!cleaned) {
    return void 0;
  }
  const lines = cleaned.split("\n");
  const params = {};
  let returns;
  const descLines = [];
  let currentTag = null;
  let currentParamName = null;
  for (const line of lines) {
    const tagMatch = line.match(/^\s*@(\w+)\s*(.*)$/);
    if (tagMatch) {
      const tag = tagMatch[1];
      const rest = tagMatch[2].trim();
      if (tag === "param") {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) {
          params[m[1]] = m[2];
          currentParamName = m[1];
        }
        currentTag = tag;
      } else if (tag === "return") {
        returns = rest;
        currentParamName = null;
        currentTag = tag;
      } else {
        currentParamName = null;
        currentTag = tag;
      }
      continue;
    }
    if (currentTag === "param" && currentParamName) {
      if (line.trim()) {
        params[currentParamName] = `${params[currentParamName]}
${line.trim()}`;
      }
      continue;
    }
    if (currentTag === "return") {
      if (line.trim()) {
        returns = `${returns}
${line.trim()}`;
      }
      continue;
    }
    if (currentTag) {
      continue;
    }
    descLines.push(line);
  }
  const description = descLines.join("\n").trim();
  const firstLine = descLines.find((l) => l.trim().length > 0)?.trim() ?? "";
  return { firstLine, description, params, returns };
}
function cleanJavadoc(raw) {
  let text = raw.trim();
  if (text.startsWith("/**")) {
    text = text.slice(3);
  }
  if (text.endsWith("*/")) {
    text = text.slice(0, -2);
  }
  const lines = text.split("\n").map((line) => line.replace(/^\s*\*/, "").trimEnd());
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  return lines.join("\n").trim();
}

// ../../src/java/typeText.ts
function parseTypeText(text) {
  const parser2 = new TypeParser(text.replace(/\s+/g, " ").trim());
  const t = parser2.parseType();
  return t;
}
function typeToKeyText(t) {
  const base = t.name + (t.args.length ? "\xAB" + t.args.map(typeToKeyText).join(",") + "\xBB" : "");
  return base + "[]".repeat(t.dims);
}
function simpleName(qualified) {
  const i = qualified.lastIndexOf(".");
  return i >= 0 ? qualified.slice(i + 1) : qualified;
}
var TypeParser = class {
  constructor(text) {
    this.text = text;
  }
  pos = 0;
  parseType() {
    let t = this.parseBase();
    while (this.peek() === "[") {
      this.expect("[");
      this.expect("]");
      t = { ...t, dims: t.dims + 1 };
    }
    return t;
  }
  parseBase() {
    this.skipSpaces();
    while (this.peek() === "@") {
      this.pos++;
      const ident = /^\w+(?:\.\w+)*/.exec(this.text.slice(this.pos));
      if (ident) {
        this.pos += ident[0].length;
      }
      this.skipSpaces();
      if (this.peek() === "(") {
        let depth = 0;
        let inStr = "";
        while (this.pos < this.text.length) {
          const c = this.text[this.pos++];
          if (inStr) {
            if (c === inStr && this.text[this.pos - 2] !== "\\") {
              inStr = "";
            }
          } else if (c === '"' || c === "'") {
            inStr = c;
          } else if (c === "(") {
            depth++;
          } else if (c === ")" && --depth === 0) {
            break;
          }
        }
      }
      this.skipSpaces();
    }
    if (this.peek() === "?") {
      this.pos++;
      this.skipSpaces();
      if (this.matchWord("extends")) {
        const inner = this.parseType();
        return { ...inner, wildcard: "extends" };
      }
      if (this.matchWord("super")) {
        const inner = this.parseType();
        return { ...inner, wildcard: "super" };
      }
      return { name: "Object", args: [], dims: 0, wildcard: "?" };
    }
    const nameMatch = /^\w+(?:\.\w+)*/.exec(this.text.slice(this.pos));
    if (!nameMatch) {
      return { name: this.text.trim() || "Object", args: [], dims: 0 };
    }
    this.pos += nameMatch[0].length;
    let args = [];
    this.skipSpaces();
    if (this.peek() === "<") {
      this.pos++;
      args = this.parseArgs();
      this.expect(">");
    }
    return { name: nameMatch[0], args, dims: 0 };
  }
  parseArgs() {
    const args = [];
    for (; ; ) {
      args.push(this.parseType());
      this.skipSpaces();
      if (this.peek() === ",") {
        this.pos++;
        continue;
      }
      break;
    }
    return args;
  }
  peek() {
    return this.text[this.pos] ?? "";
  }
  skipSpaces() {
    while (this.text[this.pos] === " ") {
      this.pos++;
    }
  }
  expect(ch) {
    if (this.text[this.pos] === ch) {
      this.pos++;
    }
  }
  matchWord(word) {
    if (this.text.startsWith(word, this.pos)) {
      this.pos += word.length;
      this.skipSpaces();
      return true;
    }
    return false;
  }
};

// ../../src/java/ruleEval.ts
function detectValueSyntax(value) {
  const t = value.trimStart();
  if (t.startsWith("groovy:")) {
    return { type: "groovy", body: t.slice("groovy:".length) };
  }
  if (t.startsWith("js:")) {
    return { type: "js", body: t.slice("js:".length) };
  }
  if (t.startsWith("#")) {
    return { type: "tag", body: t.slice(1).trim() };
  }
  if (t.startsWith("@")) {
    return { type: "ann-attr", body: t.slice(1).trim() };
  }
  return { type: "literal", body: t.trim() };
}
function evalRuleValue(raw, ctx, key, _onWarning) {
  const syntax = detectValueSyntax(raw);
  if (syntax.type === "tag") {
    const v = javadocTagValue(ctx.javadocRaw, syntax.body);
    return { matched: v !== void 0, value: v };
  }
  if (syntax.type === "ann-attr") {
    const { fqcn, attr } = splitAnnRef(syntax.body);
    const ann = findAnnotationByName(ctx.annotations, fqcn);
    if (!ann) {
      return { matched: false };
    }
    if (!attr) {
      const v2 = readAttr(ann, "value");
      return { matched: true, value: v2 !== void 0 ? String(v2) : "" };
    }
    const v = readAttr(ann, attr);
    return { matched: v !== void 0, value: v !== void 0 ? String(v) : void 0 };
  }
  if (syntax.type === "literal") {
    return { matched: true, value: syntax.body };
  }
  const r = trySafeGroovy(syntax.body, ctx);
  if (r.matched === false && !r.unsupported) {
    return { matched: false };
  }
  if (r.value !== void 0) {
    return { matched: true, value: r.value };
  }
  return {
    matched: true,
    skipped: true,
    reason: `${key} \u7684 groovy/js \u89C4\u5219\u65E0\u6CD5\u5728\u65E0\u811A\u672C\u8FD0\u884C\u65F6\u4E0B\u5B89\u5168\u6267\u884C,\u5DF2\u8DF3\u8FC7:${truncate(raw, 60)}`
  };
}
function evalCondition(cond, ctx, _key, _onWarning) {
  if (!cond || !cond.trim()) {
    return { hit: true, supported: true };
  }
  const c = cond.trim();
  let negate2 = false;
  let body = c;
  if (c.startsWith("!")) {
    negate2 = true;
    body = c.slice(1).trim();
  }
  if (body.startsWith("groovy:") || body.startsWith("js:")) {
    return { hit: false, supported: false };
  }
  if (body.startsWith("#")) {
    const tag = body.slice(1).trim();
    const has2 = hasJavadocTag(ctx.javadocRaw, tag);
    return { hit: negate2 ? !has2 : has2, supported: true };
  }
  if (body.startsWith("@")) {
    const { fqcn } = splitAnnRef(body.slice(1).trim());
    const has2 = !!findAnnotationByName(ctx.annotations, fqcn);
    return { hit: negate2 ? !has2 : has2, supported: true };
  }
  return { hit: false, supported: false };
}
function trySafeGroovy(script, ctx) {
  const s = script.trim();
  const clean = s.replace(/^```\s*/g, "").replace(/```\s*$/g, "").trim();
  const tern = findTopLevelTernary(clean);
  if (tern) {
    const { cond, thenExpr, elseExpr } = tern;
    const condVal = evalSafeCondition(cond, ctx);
    if (condVal === void 0) {
      return { matched: false, unsupported: true };
    }
    const elseClean = stripParens(elseExpr).trim();
    if (!/^(null|""|''|undefined)?$/.test(elseClean)) {
      return { matched: false, unsupported: true };
    }
    const thenVal = evalSafeStringExpr(thenExpr, ctx);
    if (thenVal === void 0) {
      return { matched: false, unsupported: true };
    }
    return condVal ? { matched: true, value: thenVal } : { matched: false };
  }
  const v = evalSafeStringExpr(clean, ctx);
  if (v !== void 0) {
    return { matched: true, value: v };
  }
  return { matched: false, unsupported: true };
}
function evalSafeCondition(cond, ctx) {
  let c = stripParens(cond.trim());
  const ors = splitTopLevelOps(c, "||");
  if (ors.length > 1) {
    const vals = ors.map((o) => evalSafeCondition(o, ctx));
    if (vals.some((v) => v === true)) {
      return true;
    }
    if (vals.some((v) => v === void 0)) {
      return void 0;
    }
    return false;
  }
  const ands = splitTopLevelOps(c, "&&");
  if (ands.length > 1) {
    const vals = ands.map((o) => evalSafeCondition(o, ctx));
    if (vals.some((v) => v === false)) {
      return false;
    }
    if (vals.some((v) => v === void 0)) {
      return void 0;
    }
    return true;
  }
  if (c.startsWith("!")) {
    const inner = evalSafeCondition(c.slice(1).trim(), ctx);
    return inner === void 0 ? void 0 : !inner;
  }
  const lowerMatch = /^Character\.isLowerCase\(it\.name\(\)\.charAt\(0\)\)$/.test(c);
  if (lowerMatch) {
    const n = ctxFieldName(ctx);
    return n !== void 0 && n.length > 0 && /^[a-z]/.test(n);
  }
  const lenMatch = /^it\.name\(\)\?*\.length\(\)\s*>\s*0$/.test(c);
  if (lenMatch) {
    const n = ctxFieldName(ctx);
    return n !== void 0 && n.length > 0;
  }
  if (c.includes("isEnum()") && (c.includes("findClass") || c.includes("it.type()"))) {
    return ctx.isEnum === true;
  }
  const hasAnn = /^it\.hasAnn\("([^"]+)"\)$/.exec(c) || /^it\.hasAnn\("([^"]+)","([^"]+)"\)$/.exec(c);
  if (hasAnn) {
    return !!findAnnotationByName(ctx.annotations, hasAnn[1]);
  }
  const hasAnnSimple = /^it\.hasAnn\(([^)]+)\)$/.exec(c);
  if (hasAnnSimple) {
    const q = stripQuotes(hasAnnSimple[1]);
    if (q !== void 0) {
      return !!findAnnotationByName(ctx.annotations, q);
    }
  }
  const accCond = evalAccessorCondition(c, ctx);
  if (accCond !== void 0) {
    return accCond;
  }
  return void 0;
}
function evalAccessorCondition(expr, ctx) {
  const methodCall = /^(.+?)\??\.(equals|equalsIgnoreCase|startsWith|endsWith|contains|matches)\((.*)\)$/s.exec(expr);
  if (methodCall) {
    const acc = accessorValue(methodCall[1].trim(), ctx);
    if (!acc.handled) {
      return void 0;
    }
    const arg = stripQuotes(methodCall[3].trim());
    if (arg === void 0 || acc.value === void 0) {
      return false;
    }
    switch (methodCall[2]) {
      case "equals":
        return acc.value === arg;
      case "equalsIgnoreCase":
        return acc.value.toLowerCase() === arg.toLowerCase();
      case "startsWith":
        return acc.value.startsWith(arg);
      case "endsWith":
        return acc.value.endsWith(arg);
      case "contains":
        return acc.value.includes(arg);
      case "matches":
        try {
          return new RegExp(arg).test(acc.value);
        } catch {
          return false;
        }
    }
    return false;
  }
  const cmp = /^(.+?)\s*(==|!=)\s*(.+?)\s*$/s.exec(expr);
  if (cmp) {
    const acc = accessorValue(cmp[1].trim(), ctx);
    if (!acc.handled) {
      return void 0;
    }
    const raw = cmp[3].trim();
    const rhs = raw === "null" ? void 0 : stripQuotes(raw);
    const same = acc.value === rhs;
    return cmp[2] === "==" ? same : !same;
  }
  return void 0;
}
function accessorValue(expr, ctx) {
  if (/^it\.name\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldName };
  }
  if (/^it\.type\(\)\?*\.simpleName\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldTypeSimple };
  }
  if (/^it\.type\(\)\?*\.name\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldType };
  }
  return { handled: false };
}
function evalSafeStringExpr(expr, ctx) {
  const cleaned = stripParens(expr.trim()).trim();
  if (!cleaned) {
    return "";
  }
  const parts = splitTopLevelOps(cleaned, "+");
  if (parts.length > 1) {
    let out = "";
    for (const part of parts) {
      const v = evalSafeStringExpr(part, ctx);
      if (v === void 0) {
        return void 0;
      }
      out += v;
    }
    return out;
  }
  const str = tryUnquote(cleaned);
  if (str !== void 0) {
    return str;
  }
  if (cleaned.includes("it.type()") && (cleaned.includes("substring") || cleaned.includes("name") || cleaned.includes("simpleName"))) {
    return ctx.enumSimpleName !== void 0 ? ctx.enumSimpleName : "";
  }
  const annCall = /^it\.ann\("([^"]+)"\s*,\s*"([^"]+)"\)$/.exec(cleaned);
  if (annCall) {
    const ann = findAnnotationByName(ctx.annotations, annCall[1]);
    if (!ann) {
      return void 0;
    }
    const v = readAttr(ann, annCall[2]);
    return v !== void 0 ? String(v) : void 0;
  }
  const annCall1 = /^it\.ann\("([^"]+)"\)$/.exec(cleaned);
  if (annCall1) {
    const ann = findAnnotationByName(ctx.annotations, annCall1[1]);
    if (!ann) {
      return void 0;
    }
    const v = readAttr(ann, "value");
    return v !== void 0 ? String(v) : void 0;
  }
  return void 0;
}
function ctxFieldName(ctx) {
  return ctx.fieldName;
}
function javadocTagValue(raw, tag) {
  if (!raw) {
    return void 0;
  }
  const re = new RegExp(`@${escapeRe(tag)}\\s+([^@\\n]+)`, "m");
  const m = re.exec(raw);
  if (!m) {
    return void 0;
  }
  const v = m[1].trim();
  return v || void 0;
}
function hasJavadocTag(raw, tag) {
  if (!raw) {
    return false;
  }
  return new RegExp(`(^|\\n)\\s*\\*?\\s*@${escapeRe(tag)}\\b`, "m").test(raw);
}
function findAnnotationByName(annotations, nameOrFqcn) {
  if (!nameOrFqcn) {
    return void 0;
  }
  const simple = nameOrFqcn.slice(nameOrFqcn.lastIndexOf(".") + 1);
  return annotations.find((a) => a.name === simple || a.name === nameOrFqcn);
}
function readAttr(ann, attr) {
  if (attr === "value" && ann.args["value"] !== void 0) {
    return ann.args["value"];
  }
  if (ann.args[attr] !== void 0) {
    return ann.args[attr];
  }
  return void 0;
}
function splitAnnRef(body) {
  const idx = body.indexOf("#");
  if (idx < 0) {
    return { fqcn: body };
  }
  return { fqcn: body.slice(0, idx).trim(), attr: body.slice(idx + 1).trim() || void 0 };
}
function findTopLevelTernary(s) {
  let depth = 0;
  let inStr = null;
  let qIdx = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (ch === "?" && depth === 0 && qIdx < 0) {
      qIdx = i;
      break;
    }
  }
  if (qIdx < 0) {
    return void 0;
  }
  let colonIdx = -1;
  depth = 0;
  inStr = null;
  for (let i = qIdx + 1; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (ch === ":" && depth === 0) {
      colonIdx = i;
      break;
    }
  }
  if (colonIdx < 0) {
    return void 0;
  }
  return {
    cond: s.slice(0, qIdx).trim(),
    thenExpr: s.slice(qIdx + 1, colonIdx).trim(),
    elseExpr: s.slice(colonIdx + 1).trim()
  };
}
function splitTopLevelOps(s, op) {
  const out = [];
  let depth = 0;
  let inStr = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      cur += ch;
      if (ch === "\\") {
        if (i + 1 < s.length) {
          cur += s[++i];
        }
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (s.startsWith(op, i) && depth === 0) {
      out.push(cur.trim());
      cur = "";
      i += op.length - 1;
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) {
    out.push(cur.trim());
  }
  return out;
}
function stripParens(s) {
  let t = s.trim();
  while (t.startsWith("(") && t.endsWith(")") && balanced(t.slice(1, -1))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}
function balanced(s) {
  let d = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
    } else if (ch === "(") {
      d++;
    } else if (ch === ")") {
      d--;
      if (d < 0) {
        return false;
      }
    }
  }
  return d === 0 && !inStr;
}
function tryUnquote(s) {
  const t = s.trim();
  if (t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'"))) {
    return unescapeProp(t.slice(1, -1));
  }
  return void 0;
}
function stripQuotes(s) {
  const t = s.trim();
  if (t.length >= 2 && (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + "\u2026" : s;
}

// ../../src/java/model.ts
function annStr(args, ...keys2) {
  for (const k of keys2) {
    const v = args[k];
    if (typeof v === "string") {
      return v;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return String(v);
    }
  }
  return void 0;
}
function annArray(args, ...keys2) {
  for (const k of keys2) {
    const v = args[k];
    if (Array.isArray(v)) {
      return v.map(String);
    }
    if (v !== void 0) {
      return [String(v)];
    }
  }
  return [];
}
function annBool(args, key) {
  const v = args[key];
  return typeof v === "boolean" ? v : void 0;
}
function findAnn(annotations, ...names) {
  return annotations.find((a) => names.includes(a.name));
}

// ../../node_modules/lodash-es/_freeGlobal.js
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeGlobal_default = freeGlobal;

// ../../node_modules/lodash-es/_root.js
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal_default || freeSelf || Function("return this")();
var root_default = root;

// ../../node_modules/lodash-es/_Symbol.js
var Symbol2 = root_default.Symbol;
var Symbol_default = Symbol2;

// ../../node_modules/lodash-es/_getRawTag.js
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
var getRawTag_default = getRawTag;

// ../../node_modules/lodash-es/_objectToString.js
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
var objectToString_default = objectToString;

// ../../node_modules/lodash-es/_baseGetTag.js
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
}
var baseGetTag_default = baseGetTag;

// ../../node_modules/lodash-es/isObjectLike.js
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_default = isObjectLike;

// ../../node_modules/lodash-es/isSymbol.js
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
}
var isSymbol_default = isSymbol;

// ../../node_modules/lodash-es/_arrayMap.js
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var arrayMap_default = arrayMap;

// ../../node_modules/lodash-es/isArray.js
var isArray = Array.isArray;
var isArray_default = isArray;

// ../../node_modules/lodash-es/_baseToString.js
var INFINITY = 1 / 0;
var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
var symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var baseToString_default = baseToString;

// ../../node_modules/lodash-es/_trimmedEndIndex.js
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var trimmedEndIndex_default = trimmedEndIndex;

// ../../node_modules/lodash-es/_baseTrim.js
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
}
var baseTrim_default = baseTrim;

// ../../node_modules/lodash-es/isObject.js
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_default = isObject;

// ../../node_modules/lodash-es/toNumber.js
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol_default(value)) {
    return NAN;
  }
  if (isObject_default(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject_default(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim_default(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_default = toNumber;

// ../../node_modules/lodash-es/toFinite.js
var INFINITY2 = 1 / 0;
var MAX_INTEGER = 17976931348623157e292;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber_default(value);
  if (value === INFINITY2 || value === -INFINITY2) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
var toFinite_default = toFinite;

// ../../node_modules/lodash-es/toInteger.js
function toInteger(value) {
  var result = toFinite_default(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
var toInteger_default = toInteger;

// ../../node_modules/lodash-es/identity.js
function identity(value) {
  return value;
}
var identity_default = identity;

// ../../node_modules/lodash-es/isFunction.js
var asyncTag = "[object AsyncFunction]";
var funcTag = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_default = isFunction;

// ../../node_modules/lodash-es/_coreJsData.js
var coreJsData = root_default["__core-js_shared__"];
var coreJsData_default = coreJsData;

// ../../node_modules/lodash-es/_isMasked.js
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var isMasked_default = isMasked;

// ../../node_modules/lodash-es/_toSource.js
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var toSource_default = toSource;

// ../../node_modules/lodash-es/_baseIsNative.js
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto2 = Function.prototype;
var objectProto3 = Object.prototype;
var funcToString2 = funcProto2.toString;
var hasOwnProperty2 = objectProto3.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject_default(value) || isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource_default(value));
}
var baseIsNative_default = baseIsNative;

// ../../node_modules/lodash-es/_getValue.js
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
var getValue_default = getValue;

// ../../node_modules/lodash-es/_getNative.js
function getNative(object, key) {
  var value = getValue_default(object, key);
  return baseIsNative_default(value) ? value : void 0;
}
var getNative_default = getNative;

// ../../node_modules/lodash-es/_WeakMap.js
var WeakMap2 = getNative_default(root_default, "WeakMap");
var WeakMap_default = WeakMap2;

// ../../node_modules/lodash-es/_baseCreate.js
var objectCreate = Object.create;
var baseCreate = /* @__PURE__ */ function() {
  function object() {
  }
  return function(proto) {
    if (!isObject_default(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = void 0;
    return result;
  };
}();
var baseCreate_default = baseCreate;

// ../../node_modules/lodash-es/_apply.js
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var apply_default = apply;

// ../../node_modules/lodash-es/noop.js
function noop() {
}
var noop_default = noop;

// ../../node_modules/lodash-es/_copyArray.js
function copyArray(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var copyArray_default = copyArray;

// ../../node_modules/lodash-es/_shortOut.js
var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
var shortOut_default = shortOut;

// ../../node_modules/lodash-es/constant.js
function constant(value) {
  return function() {
    return value;
  };
}
var constant_default = constant;

// ../../node_modules/lodash-es/_defineProperty.js
var defineProperty = function() {
  try {
    var func = getNative_default(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var defineProperty_default = defineProperty;

// ../../node_modules/lodash-es/_baseSetToString.js
var baseSetToString = !defineProperty_default ? identity_default : function(func, string) {
  return defineProperty_default(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant_default(string),
    "writable": true
  });
};
var baseSetToString_default = baseSetToString;

// ../../node_modules/lodash-es/_setToString.js
var setToString = shortOut_default(baseSetToString_default);
var setToString_default = setToString;

// ../../node_modules/lodash-es/_arrayEach.js
function arrayEach(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
var arrayEach_default = arrayEach;

// ../../node_modules/lodash-es/_baseFindIndex.js
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
var baseFindIndex_default = baseFindIndex;

// ../../node_modules/lodash-es/_baseIsNaN.js
function baseIsNaN(value) {
  return value !== value;
}
var baseIsNaN_default = baseIsNaN;

// ../../node_modules/lodash-es/_strictIndexOf.js
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
var strictIndexOf_default = strictIndexOf;

// ../../node_modules/lodash-es/_baseIndexOf.js
function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf_default(array, value, fromIndex) : baseFindIndex_default(array, baseIsNaN_default, fromIndex);
}
var baseIndexOf_default = baseIndexOf;

// ../../node_modules/lodash-es/_arrayIncludes.js
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf_default(array, value, 0) > -1;
}
var arrayIncludes_default = arrayIncludes;

// ../../node_modules/lodash-es/_isIndex.js
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var isIndex_default = isIndex;

// ../../node_modules/lodash-es/_baseAssignValue.js
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && defineProperty_default) {
    defineProperty_default(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var baseAssignValue_default = baseAssignValue;

// ../../node_modules/lodash-es/eq.js
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_default = eq;

// ../../node_modules/lodash-es/_assignValue.js
var objectProto4 = Object.prototype;
var hasOwnProperty3 = objectProto4.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty3.call(object, key) && eq_default(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue_default(object, key, value);
  }
}
var assignValue_default = assignValue;

// ../../node_modules/lodash-es/_copyObject.js
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue_default(object, key, newValue);
    } else {
      assignValue_default(object, key, newValue);
    }
  }
  return object;
}
var copyObject_default = copyObject;

// ../../node_modules/lodash-es/_overRest.js
var nativeMax = Math.max;
function overRest(func, start, transform) {
  start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply_default(func, this, otherArgs);
  };
}
var overRest_default = overRest;

// ../../node_modules/lodash-es/_baseRest.js
function baseRest(func, start) {
  return setToString_default(overRest_default(func, start, identity_default), func + "");
}
var baseRest_default = baseRest;

// ../../node_modules/lodash-es/isLength.js
var MAX_SAFE_INTEGER2 = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
}
var isLength_default = isLength;

// ../../node_modules/lodash-es/isArrayLike.js
function isArrayLike(value) {
  return value != null && isLength_default(value.length) && !isFunction_default(value);
}
var isArrayLike_default = isArrayLike;

// ../../node_modules/lodash-es/_isIterateeCall.js
function isIterateeCall(value, index, object) {
  if (!isObject_default(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike_default(object) && isIndex_default(index, object.length) : type == "string" && index in object) {
    return eq_default(object[index], value);
  }
  return false;
}
var isIterateeCall_default = isIterateeCall;

// ../../node_modules/lodash-es/_createAssigner.js
function createAssigner(assigner) {
  return baseRest_default(function(object, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
    if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
      customizer = length < 3 ? void 0 : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}
var createAssigner_default = createAssigner;

// ../../node_modules/lodash-es/_isPrototype.js
var objectProto5 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto5;
  return value === proto;
}
var isPrototype_default = isPrototype;

// ../../node_modules/lodash-es/_baseTimes.js
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var baseTimes_default = baseTimes;

// ../../node_modules/lodash-es/_baseIsArguments.js
var argsTag = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike_default(value) && baseGetTag_default(value) == argsTag;
}
var baseIsArguments_default = baseIsArguments;

// ../../node_modules/lodash-es/isArguments.js
var objectProto6 = Object.prototype;
var hasOwnProperty4 = objectProto6.hasOwnProperty;
var propertyIsEnumerable = objectProto6.propertyIsEnumerable;
var isArguments = baseIsArguments_default(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments_default : function(value) {
  return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArguments_default = isArguments;

// ../../node_modules/lodash-es/stubFalse.js
function stubFalse() {
  return false;
}
var stubFalse_default = stubFalse;

// ../../node_modules/lodash-es/isBuffer.js
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer2 = moduleExports ? root_default.Buffer : void 0;
var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse_default;
var isBuffer_default = isBuffer;

// ../../node_modules/lodash-es/_baseIsTypedArray.js
var argsTag2 = "[object Arguments]";
var arrayTag = "[object Array]";
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var funcTag2 = "[object Function]";
var mapTag = "[object Map]";
var numberTag = "[object Number]";
var objectTag = "[object Object]";
var regexpTag = "[object RegExp]";
var setTag = "[object Set]";
var stringTag = "[object String]";
var weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
  return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[baseGetTag_default(value)];
}
var baseIsTypedArray_default = baseIsTypedArray;

// ../../node_modules/lodash-es/_baseUnary.js
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var baseUnary_default = baseUnary;

// ../../node_modules/lodash-es/_nodeUtil.js
var freeExports2 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule2 = freeExports2 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
var freeProcess = moduleExports2 && freeGlobal_default.process;
var nodeUtil = function() {
  try {
    var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var nodeUtil_default = nodeUtil;

// ../../node_modules/lodash-es/isTypedArray.js
var nodeIsTypedArray = nodeUtil_default && nodeUtil_default.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary_default(nodeIsTypedArray) : baseIsTypedArray_default;
var isTypedArray_default = isTypedArray;

// ../../node_modules/lodash-es/_arrayLikeKeys.js
var objectProto7 = Object.prototype;
var hasOwnProperty5 = objectProto7.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes_default(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex_default(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var arrayLikeKeys_default = arrayLikeKeys;

// ../../node_modules/lodash-es/_overArg.js
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var overArg_default = overArg;

// ../../node_modules/lodash-es/_nativeKeys.js
var nativeKeys = overArg_default(Object.keys, Object);
var nativeKeys_default = nativeKeys;

// ../../node_modules/lodash-es/_baseKeys.js
var objectProto8 = Object.prototype;
var hasOwnProperty6 = objectProto8.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype_default(object)) {
    return nativeKeys_default(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty6.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var baseKeys_default = baseKeys;

// ../../node_modules/lodash-es/keys.js
function keys(object) {
  return isArrayLike_default(object) ? arrayLikeKeys_default(object) : baseKeys_default(object);
}
var keys_default = keys;

// ../../node_modules/lodash-es/assign.js
var objectProto9 = Object.prototype;
var hasOwnProperty7 = objectProto9.hasOwnProperty;
var assign = createAssigner_default(function(object, source) {
  if (isPrototype_default(source) || isArrayLike_default(source)) {
    copyObject_default(source, keys_default(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty7.call(source, key)) {
      assignValue_default(object, key, source[key]);
    }
  }
});
var assign_default = assign;

// ../../node_modules/lodash-es/_nativeKeysIn.js
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var nativeKeysIn_default = nativeKeysIn;

// ../../node_modules/lodash-es/_baseKeysIn.js
var objectProto10 = Object.prototype;
var hasOwnProperty8 = objectProto10.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject_default(object)) {
    return nativeKeysIn_default(object);
  }
  var isProto = isPrototype_default(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty8.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var baseKeysIn_default = baseKeysIn;

// ../../node_modules/lodash-es/keysIn.js
function keysIn(object) {
  return isArrayLike_default(object) ? arrayLikeKeys_default(object, true) : baseKeysIn_default(object);
}
var keysIn_default = keysIn;

// ../../node_modules/lodash-es/_isKey.js
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var isKey_default = isKey;

// ../../node_modules/lodash-es/_nativeCreate.js
var nativeCreate = getNative_default(Object, "create");
var nativeCreate_default = nativeCreate;

// ../../node_modules/lodash-es/_hashClear.js
function hashClear() {
  this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
  this.size = 0;
}
var hashClear_default = hashClear;

// ../../node_modules/lodash-es/_hashDelete.js
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var hashDelete_default = hashDelete;

// ../../node_modules/lodash-es/_hashGet.js
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var objectProto11 = Object.prototype;
var hasOwnProperty9 = objectProto11.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate_default) {
    var result = data[key];
    return result === HASH_UNDEFINED ? void 0 : result;
  }
  return hasOwnProperty9.call(data, key) ? data[key] : void 0;
}
var hashGet_default = hashGet;

// ../../node_modules/lodash-es/_hashHas.js
var objectProto12 = Object.prototype;
var hasOwnProperty10 = objectProto12.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty10.call(data, key);
}
var hashHas_default = hashHas;

// ../../node_modules/lodash-es/_hashSet.js
var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
  return this;
}
var hashSet_default = hashSet;

// ../../node_modules/lodash-es/_Hash.js
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear_default;
Hash.prototype["delete"] = hashDelete_default;
Hash.prototype.get = hashGet_default;
Hash.prototype.has = hashHas_default;
Hash.prototype.set = hashSet_default;
var Hash_default = Hash;

// ../../node_modules/lodash-es/_listCacheClear.js
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
var listCacheClear_default = listCacheClear;

// ../../node_modules/lodash-es/_assocIndexOf.js
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var assocIndexOf_default = assocIndexOf;

// ../../node_modules/lodash-es/_listCacheDelete.js
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var listCacheDelete_default = listCacheDelete;

// ../../node_modules/lodash-es/_listCacheGet.js
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  return index < 0 ? void 0 : data[index][1];
}
var listCacheGet_default = listCacheGet;

// ../../node_modules/lodash-es/_listCacheHas.js
function listCacheHas(key) {
  return assocIndexOf_default(this.__data__, key) > -1;
}
var listCacheHas_default = listCacheHas;

// ../../node_modules/lodash-es/_listCacheSet.js
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var listCacheSet_default = listCacheSet;

// ../../node_modules/lodash-es/_ListCache.js
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear_default;
ListCache.prototype["delete"] = listCacheDelete_default;
ListCache.prototype.get = listCacheGet_default;
ListCache.prototype.has = listCacheHas_default;
ListCache.prototype.set = listCacheSet_default;
var ListCache_default = ListCache;

// ../../node_modules/lodash-es/_Map.js
var Map2 = getNative_default(root_default, "Map");
var Map_default = Map2;

// ../../node_modules/lodash-es/_mapCacheClear.js
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash_default(),
    "map": new (Map_default || ListCache_default)(),
    "string": new Hash_default()
  };
}
var mapCacheClear_default = mapCacheClear;

// ../../node_modules/lodash-es/_isKeyable.js
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var isKeyable_default = isKeyable;

// ../../node_modules/lodash-es/_getMapData.js
function getMapData(map2, key) {
  var data = map2.__data__;
  return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var getMapData_default = getMapData;

// ../../node_modules/lodash-es/_mapCacheDelete.js
function mapCacheDelete(key) {
  var result = getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var mapCacheDelete_default = mapCacheDelete;

// ../../node_modules/lodash-es/_mapCacheGet.js
function mapCacheGet(key) {
  return getMapData_default(this, key).get(key);
}
var mapCacheGet_default = mapCacheGet;

// ../../node_modules/lodash-es/_mapCacheHas.js
function mapCacheHas(key) {
  return getMapData_default(this, key).has(key);
}
var mapCacheHas_default = mapCacheHas;

// ../../node_modules/lodash-es/_mapCacheSet.js
function mapCacheSet(key, value) {
  var data = getMapData_default(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var mapCacheSet_default = mapCacheSet;

// ../../node_modules/lodash-es/_MapCache.js
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear_default;
MapCache.prototype["delete"] = mapCacheDelete_default;
MapCache.prototype.get = mapCacheGet_default;
MapCache.prototype.has = mapCacheHas_default;
MapCache.prototype.set = mapCacheSet_default;
var MapCache_default = MapCache;

// ../../node_modules/lodash-es/memoize.js
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache_default)();
  return memoized;
}
memoize.Cache = MapCache_default;
var memoize_default = memoize;

// ../../node_modules/lodash-es/_memoizeCapped.js
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var memoizeCapped_default = memoizeCapped;

// ../../node_modules/lodash-es/_stringToPath.js
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped_default(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var stringToPath_default = stringToPath;

// ../../node_modules/lodash-es/toString.js
function toString(value) {
  return value == null ? "" : baseToString_default(value);
}
var toString_default = toString;

// ../../node_modules/lodash-es/_castPath.js
function castPath(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
}
var castPath_default = castPath;

// ../../node_modules/lodash-es/_toKey.js
var INFINITY3 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY3 ? "-0" : result;
}
var toKey_default = toKey;

// ../../node_modules/lodash-es/_baseGet.js
function baseGet(object, path8) {
  path8 = castPath_default(path8, object);
  var index = 0, length = path8.length;
  while (object != null && index < length) {
    object = object[toKey_default(path8[index++])];
  }
  return index && index == length ? object : void 0;
}
var baseGet_default = baseGet;

// ../../node_modules/lodash-es/get.js
function get(object, path8, defaultValue) {
  var result = object == null ? void 0 : baseGet_default(object, path8);
  return result === void 0 ? defaultValue : result;
}
var get_default = get;

// ../../node_modules/lodash-es/_arrayPush.js
function arrayPush(array, values2) {
  var index = -1, length = values2.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values2[index];
  }
  return array;
}
var arrayPush_default = arrayPush;

// ../../node_modules/lodash-es/_isFlattenable.js
var spreadableSymbol = Symbol_default ? Symbol_default.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray_default(value) || isArguments_default(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
var isFlattenable_default = isFlattenable;

// ../../node_modules/lodash-es/_baseFlatten.js
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = isFlattenable_default);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush_default(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
var baseFlatten_default = baseFlatten;

// ../../node_modules/lodash-es/flatten.js
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten_default(array, 1) : [];
}
var flatten_default = flatten;

// ../../node_modules/lodash-es/_getPrototype.js
var getPrototype = overArg_default(Object.getPrototypeOf, Object);
var getPrototype_default = getPrototype;

// ../../node_modules/lodash-es/_baseSlice.js
function baseSlice(array, start, end) {
  var index = -1, length = array.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}
var baseSlice_default = baseSlice;

// ../../node_modules/lodash-es/_arrayReduce.js
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1, length = array == null ? 0 : array.length;
  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}
var arrayReduce_default = arrayReduce;

// ../../node_modules/lodash-es/_stackClear.js
function stackClear() {
  this.__data__ = new ListCache_default();
  this.size = 0;
}
var stackClear_default = stackClear;

// ../../node_modules/lodash-es/_stackDelete.js
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var stackDelete_default = stackDelete;

// ../../node_modules/lodash-es/_stackGet.js
function stackGet(key) {
  return this.__data__.get(key);
}
var stackGet_default = stackGet;

// ../../node_modules/lodash-es/_stackHas.js
function stackHas(key) {
  return this.__data__.has(key);
}
var stackHas_default = stackHas;

// ../../node_modules/lodash-es/_stackSet.js
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache_default) {
    var pairs = data.__data__;
    if (!Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache_default(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var stackSet_default = stackSet;

// ../../node_modules/lodash-es/_Stack.js
function Stack(entries) {
  var data = this.__data__ = new ListCache_default(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear_default;
Stack.prototype["delete"] = stackDelete_default;
Stack.prototype.get = stackGet_default;
Stack.prototype.has = stackHas_default;
Stack.prototype.set = stackSet_default;
var Stack_default = Stack;

// ../../node_modules/lodash-es/_baseAssign.js
function baseAssign(object, source) {
  return object && copyObject_default(source, keys_default(source), object);
}
var baseAssign_default = baseAssign;

// ../../node_modules/lodash-es/_baseAssignIn.js
function baseAssignIn(object, source) {
  return object && copyObject_default(source, keysIn_default(source), object);
}
var baseAssignIn_default = baseAssignIn;

// ../../node_modules/lodash-es/_cloneBuffer.js
var freeExports3 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule3 = freeExports3 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
var Buffer3 = moduleExports3 ? root_default.Buffer : void 0;
var allocUnsafe = Buffer3 ? Buffer3.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
var cloneBuffer_default = cloneBuffer;

// ../../node_modules/lodash-es/_arrayFilter.js
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var arrayFilter_default = arrayFilter;

// ../../node_modules/lodash-es/stubArray.js
function stubArray() {
  return [];
}
var stubArray_default = stubArray;

// ../../node_modules/lodash-es/_getSymbols.js
var objectProto13 = Object.prototype;
var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter_default(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable2.call(object, symbol);
  });
};
var getSymbols_default = getSymbols;

// ../../node_modules/lodash-es/_copySymbols.js
function copySymbols(source, object) {
  return copyObject_default(source, getSymbols_default(source), object);
}
var copySymbols_default = copySymbols;

// ../../node_modules/lodash-es/_getSymbolsIn.js
var nativeGetSymbols2 = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols2 ? stubArray_default : function(object) {
  var result = [];
  while (object) {
    arrayPush_default(result, getSymbols_default(object));
    object = getPrototype_default(object);
  }
  return result;
};
var getSymbolsIn_default = getSymbolsIn;

// ../../node_modules/lodash-es/_copySymbolsIn.js
function copySymbolsIn(source, object) {
  return copyObject_default(source, getSymbolsIn_default(source), object);
}
var copySymbolsIn_default = copySymbolsIn;

// ../../node_modules/lodash-es/_baseGetAllKeys.js
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_default(object) ? result : arrayPush_default(result, symbolsFunc(object));
}
var baseGetAllKeys_default = baseGetAllKeys;

// ../../node_modules/lodash-es/_getAllKeys.js
function getAllKeys(object) {
  return baseGetAllKeys_default(object, keys_default, getSymbols_default);
}
var getAllKeys_default = getAllKeys;

// ../../node_modules/lodash-es/_getAllKeysIn.js
function getAllKeysIn(object) {
  return baseGetAllKeys_default(object, keysIn_default, getSymbolsIn_default);
}
var getAllKeysIn_default = getAllKeysIn;

// ../../node_modules/lodash-es/_DataView.js
var DataView = getNative_default(root_default, "DataView");
var DataView_default = DataView;

// ../../node_modules/lodash-es/_Promise.js
var Promise2 = getNative_default(root_default, "Promise");
var Promise_default = Promise2;

// ../../node_modules/lodash-es/_Set.js
var Set2 = getNative_default(root_default, "Set");
var Set_default = Set2;

// ../../node_modules/lodash-es/_getTag.js
var mapTag2 = "[object Map]";
var objectTag2 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag2 = "[object Set]";
var weakMapTag2 = "[object WeakMap]";
var dataViewTag2 = "[object DataView]";
var dataViewCtorString = toSource_default(DataView_default);
var mapCtorString = toSource_default(Map_default);
var promiseCtorString = toSource_default(Promise_default);
var setCtorString = toSource_default(Set_default);
var weakMapCtorString = toSource_default(WeakMap_default);
var getTag = baseGetTag_default;
if (DataView_default && getTag(new DataView_default(new ArrayBuffer(1))) != dataViewTag2 || Map_default && getTag(new Map_default()) != mapTag2 || Promise_default && getTag(Promise_default.resolve()) != promiseTag || Set_default && getTag(new Set_default()) != setTag2 || WeakMap_default && getTag(new WeakMap_default()) != weakMapTag2) {
  getTag = function(value) {
    var result = baseGetTag_default(value), Ctor = result == objectTag2 ? value.constructor : void 0, ctorString = Ctor ? toSource_default(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag2;
        case mapCtorString:
          return mapTag2;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag2;
        case weakMapCtorString:
          return weakMapTag2;
      }
    }
    return result;
  };
}
var getTag_default = getTag;

// ../../node_modules/lodash-es/_initCloneArray.js
var objectProto14 = Object.prototype;
var hasOwnProperty11 = objectProto14.hasOwnProperty;
function initCloneArray(array) {
  var length = array.length, result = new array.constructor(length);
  if (length && typeof array[0] == "string" && hasOwnProperty11.call(array, "index")) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}
var initCloneArray_default = initCloneArray;

// ../../node_modules/lodash-es/_Uint8Array.js
var Uint8Array2 = root_default.Uint8Array;
var Uint8Array_default = Uint8Array2;

// ../../node_modules/lodash-es/_cloneArrayBuffer.js
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array_default(result).set(new Uint8Array_default(arrayBuffer));
  return result;
}
var cloneArrayBuffer_default = cloneArrayBuffer;

// ../../node_modules/lodash-es/_cloneDataView.js
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer_default(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var cloneDataView_default = cloneDataView;

// ../../node_modules/lodash-es/_cloneRegExp.js
var reFlags = /\w*$/;
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}
var cloneRegExp_default = cloneRegExp;

// ../../node_modules/lodash-es/_cloneSymbol.js
var symbolProto2 = Symbol_default ? Symbol_default.prototype : void 0;
var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : void 0;
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}
var cloneSymbol_default = cloneSymbol;

// ../../node_modules/lodash-es/_cloneTypedArray.js
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var cloneTypedArray_default = cloneTypedArray;

// ../../node_modules/lodash-es/_initCloneByTag.js
var boolTag2 = "[object Boolean]";
var dateTag2 = "[object Date]";
var mapTag3 = "[object Map]";
var numberTag2 = "[object Number]";
var regexpTag2 = "[object RegExp]";
var setTag3 = "[object Set]";
var stringTag2 = "[object String]";
var symbolTag2 = "[object Symbol]";
var arrayBufferTag2 = "[object ArrayBuffer]";
var dataViewTag3 = "[object DataView]";
var float32Tag2 = "[object Float32Array]";
var float64Tag2 = "[object Float64Array]";
var int8Tag2 = "[object Int8Array]";
var int16Tag2 = "[object Int16Array]";
var int32Tag2 = "[object Int32Array]";
var uint8Tag2 = "[object Uint8Array]";
var uint8ClampedTag2 = "[object Uint8ClampedArray]";
var uint16Tag2 = "[object Uint16Array]";
var uint32Tag2 = "[object Uint32Array]";
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag2:
      return cloneArrayBuffer_default(object);
    case boolTag2:
    case dateTag2:
      return new Ctor(+object);
    case dataViewTag3:
      return cloneDataView_default(object, isDeep);
    case float32Tag2:
    case float64Tag2:
    case int8Tag2:
    case int16Tag2:
    case int32Tag2:
    case uint8Tag2:
    case uint8ClampedTag2:
    case uint16Tag2:
    case uint32Tag2:
      return cloneTypedArray_default(object, isDeep);
    case mapTag3:
      return new Ctor();
    case numberTag2:
    case stringTag2:
      return new Ctor(object);
    case regexpTag2:
      return cloneRegExp_default(object);
    case setTag3:
      return new Ctor();
    case symbolTag2:
      return cloneSymbol_default(object);
  }
}
var initCloneByTag_default = initCloneByTag;

// ../../node_modules/lodash-es/_initCloneObject.js
function initCloneObject(object) {
  return typeof object.constructor == "function" && !isPrototype_default(object) ? baseCreate_default(getPrototype_default(object)) : {};
}
var initCloneObject_default = initCloneObject;

// ../../node_modules/lodash-es/_baseIsMap.js
var mapTag4 = "[object Map]";
function baseIsMap(value) {
  return isObjectLike_default(value) && getTag_default(value) == mapTag4;
}
var baseIsMap_default = baseIsMap;

// ../../node_modules/lodash-es/isMap.js
var nodeIsMap = nodeUtil_default && nodeUtil_default.isMap;
var isMap = nodeIsMap ? baseUnary_default(nodeIsMap) : baseIsMap_default;
var isMap_default = isMap;

// ../../node_modules/lodash-es/_baseIsSet.js
var setTag4 = "[object Set]";
function baseIsSet(value) {
  return isObjectLike_default(value) && getTag_default(value) == setTag4;
}
var baseIsSet_default = baseIsSet;

// ../../node_modules/lodash-es/isSet.js
var nodeIsSet = nodeUtil_default && nodeUtil_default.isSet;
var isSet = nodeIsSet ? baseUnary_default(nodeIsSet) : baseIsSet_default;
var isSet_default = isSet;

// ../../node_modules/lodash-es/_baseClone.js
var CLONE_DEEP_FLAG = 1;
var CLONE_FLAT_FLAG = 2;
var CLONE_SYMBOLS_FLAG = 4;
var argsTag3 = "[object Arguments]";
var arrayTag2 = "[object Array]";
var boolTag3 = "[object Boolean]";
var dateTag3 = "[object Date]";
var errorTag2 = "[object Error]";
var funcTag3 = "[object Function]";
var genTag2 = "[object GeneratorFunction]";
var mapTag5 = "[object Map]";
var numberTag3 = "[object Number]";
var objectTag3 = "[object Object]";
var regexpTag3 = "[object RegExp]";
var setTag5 = "[object Set]";
var stringTag3 = "[object String]";
var symbolTag3 = "[object Symbol]";
var weakMapTag3 = "[object WeakMap]";
var arrayBufferTag3 = "[object ArrayBuffer]";
var dataViewTag4 = "[object DataView]";
var float32Tag3 = "[object Float32Array]";
var float64Tag3 = "[object Float64Array]";
var int8Tag3 = "[object Int8Array]";
var int16Tag3 = "[object Int16Array]";
var int32Tag3 = "[object Int32Array]";
var uint8Tag3 = "[object Uint8Array]";
var uint8ClampedTag3 = "[object Uint8ClampedArray]";
var uint16Tag3 = "[object Uint16Array]";
var uint32Tag3 = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag3] = cloneableTags[arrayTag2] = cloneableTags[arrayBufferTag3] = cloneableTags[dataViewTag4] = cloneableTags[boolTag3] = cloneableTags[dateTag3] = cloneableTags[float32Tag3] = cloneableTags[float64Tag3] = cloneableTags[int8Tag3] = cloneableTags[int16Tag3] = cloneableTags[int32Tag3] = cloneableTags[mapTag5] = cloneableTags[numberTag3] = cloneableTags[objectTag3] = cloneableTags[regexpTag3] = cloneableTags[setTag5] = cloneableTags[stringTag3] = cloneableTags[symbolTag3] = cloneableTags[uint8Tag3] = cloneableTags[uint8ClampedTag3] = cloneableTags[uint16Tag3] = cloneableTags[uint32Tag3] = true;
cloneableTags[errorTag2] = cloneableTags[funcTag3] = cloneableTags[weakMapTag3] = false;
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== void 0) {
    return result;
  }
  if (!isObject_default(value)) {
    return value;
  }
  var isArr = isArray_default(value);
  if (isArr) {
    result = initCloneArray_default(value);
    if (!isDeep) {
      return copyArray_default(value, result);
    }
  } else {
    var tag = getTag_default(value), isFunc = tag == funcTag3 || tag == genTag2;
    if (isBuffer_default(value)) {
      return cloneBuffer_default(value, isDeep);
    }
    if (tag == objectTag3 || tag == argsTag3 || isFunc && !object) {
      result = isFlat || isFunc ? {} : initCloneObject_default(value);
      if (!isDeep) {
        return isFlat ? copySymbolsIn_default(value, baseAssignIn_default(result, value)) : copySymbols_default(value, baseAssign_default(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag_default(value, tag, isDeep);
    }
  }
  stack || (stack = new Stack_default());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet_default(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap_default(value)) {
    value.forEach(function(subValue, key2) {
      result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
  }
  var keysFunc = isFull ? isFlat ? getAllKeysIn_default : getAllKeys_default : isFlat ? keysIn_default : keys_default;
  var props = isArr ? void 0 : keysFunc(value);
  arrayEach_default(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    assignValue_default(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
  });
  return result;
}
var baseClone_default = baseClone;

// ../../node_modules/lodash-es/clone.js
var CLONE_SYMBOLS_FLAG2 = 4;
function clone(value) {
  return baseClone_default(value, CLONE_SYMBOLS_FLAG2);
}
var clone_default = clone;

// ../../node_modules/lodash-es/compact.js
function compact(array) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var compact_default = compact;

// ../../node_modules/lodash-es/_setCacheAdd.js
var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED3);
  return this;
}
var setCacheAdd_default = setCacheAdd;

// ../../node_modules/lodash-es/_setCacheHas.js
function setCacheHas(value) {
  return this.__data__.has(value);
}
var setCacheHas_default = setCacheHas;

// ../../node_modules/lodash-es/_SetCache.js
function SetCache(values2) {
  var index = -1, length = values2 == null ? 0 : values2.length;
  this.__data__ = new MapCache_default();
  while (++index < length) {
    this.add(values2[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd_default;
SetCache.prototype.has = setCacheHas_default;
var SetCache_default = SetCache;

// ../../node_modules/lodash-es/_arraySome.js
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
var arraySome_default = arraySome;

// ../../node_modules/lodash-es/_cacheHas.js
function cacheHas(cache, key) {
  return cache.has(key);
}
var cacheHas_default = cacheHas;

// ../../node_modules/lodash-es/_equalArrays.js
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache_default() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome_default(other, function(othValue2, othIndex) {
        if (!cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var equalArrays_default = equalArrays;

// ../../node_modules/lodash-es/_mapToArray.js
function mapToArray(map2) {
  var index = -1, result = Array(map2.size);
  map2.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var mapToArray_default = mapToArray;

// ../../node_modules/lodash-es/_setToArray.js
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var setToArray_default = setToArray;

// ../../node_modules/lodash-es/_equalByTag.js
var COMPARE_PARTIAL_FLAG2 = 1;
var COMPARE_UNORDERED_FLAG2 = 2;
var boolTag4 = "[object Boolean]";
var dateTag4 = "[object Date]";
var errorTag3 = "[object Error]";
var mapTag6 = "[object Map]";
var numberTag4 = "[object Number]";
var regexpTag4 = "[object RegExp]";
var setTag6 = "[object Set]";
var stringTag4 = "[object String]";
var symbolTag4 = "[object Symbol]";
var arrayBufferTag4 = "[object ArrayBuffer]";
var dataViewTag5 = "[object DataView]";
var symbolProto3 = Symbol_default ? Symbol_default.prototype : void 0;
var symbolValueOf2 = symbolProto3 ? symbolProto3.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag5:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag4:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array_default(object), new Uint8Array_default(other))) {
        return false;
      }
      return true;
    case boolTag4:
    case dateTag4:
    case numberTag4:
      return eq_default(+object, +other);
    case errorTag3:
      return object.name == other.name && object.message == other.message;
    case regexpTag4:
    case stringTag4:
      return object == other + "";
    case mapTag6:
      var convert = mapToArray_default;
    case setTag6:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
      convert || (convert = setToArray_default);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG2;
      stack.set(object, other);
      var result = equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag4:
      if (symbolValueOf2) {
        return symbolValueOf2.call(object) == symbolValueOf2.call(other);
      }
  }
  return false;
}
var equalByTag_default = equalByTag;

// ../../node_modules/lodash-es/_equalObjects.js
var COMPARE_PARTIAL_FLAG3 = 1;
var objectProto15 = Object.prototype;
var hasOwnProperty12 = objectProto15.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = getAllKeys_default(object), objLength = objProps.length, othProps = getAllKeys_default(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty12.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var equalObjects_default = equalObjects;

// ../../node_modules/lodash-es/_baseIsEqualDeep.js
var COMPARE_PARTIAL_FLAG4 = 1;
var argsTag4 = "[object Arguments]";
var arrayTag3 = "[object Array]";
var objectTag4 = "[object Object]";
var objectProto16 = Object.prototype;
var hasOwnProperty13 = objectProto16.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag3 : getTag_default(object), othTag = othIsArr ? arrayTag3 : getTag_default(other);
  objTag = objTag == argsTag4 ? objectTag4 : objTag;
  othTag = othTag == argsTag4 ? objectTag4 : othTag;
  var objIsObj = objTag == objectTag4, othIsObj = othTag == objectTag4, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_default(object)) {
    if (!isBuffer_default(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack_default());
    return objIsArr || isTypedArray_default(object) ? equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
    var objIsWrapped = objIsObj && hasOwnProperty13.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty13.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack_default());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack_default());
  return equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
}
var baseIsEqualDeep_default = baseIsEqualDeep;

// ../../node_modules/lodash-es/_baseIsEqual.js
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
}
var baseIsEqual_default = baseIsEqual;

// ../../node_modules/lodash-es/_baseIsMatch.js
var COMPARE_PARTIAL_FLAG5 = 1;
var COMPARE_UNORDERED_FLAG3 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack_default();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var baseIsMatch_default = baseIsMatch;

// ../../node_modules/lodash-es/_isStrictComparable.js
function isStrictComparable(value) {
  return value === value && !isObject_default(value);
}
var isStrictComparable_default = isStrictComparable;

// ../../node_modules/lodash-es/_getMatchData.js
function getMatchData(object) {
  var result = keys_default(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable_default(value)];
  }
  return result;
}
var getMatchData_default = getMatchData;

// ../../node_modules/lodash-es/_matchesStrictComparable.js
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
var matchesStrictComparable_default = matchesStrictComparable;

// ../../node_modules/lodash-es/_baseMatches.js
function baseMatches(source) {
  var matchData = getMatchData_default(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch_default(object, source, matchData);
  };
}
var baseMatches_default = baseMatches;

// ../../node_modules/lodash-es/_baseHasIn.js
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
var baseHasIn_default = baseHasIn;

// ../../node_modules/lodash-es/_hasPath.js
function hasPath(object, path8, hasFunc) {
  path8 = castPath_default(path8, object);
  var index = -1, length = path8.length, result = false;
  while (++index < length) {
    var key = toKey_default(path8[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_default(length) && isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
}
var hasPath_default = hasPath;

// ../../node_modules/lodash-es/hasIn.js
function hasIn(object, path8) {
  return object != null && hasPath_default(object, path8, baseHasIn_default);
}
var hasIn_default = hasIn;

// ../../node_modules/lodash-es/_baseMatchesProperty.js
var COMPARE_PARTIAL_FLAG6 = 1;
var COMPARE_UNORDERED_FLAG4 = 2;
function baseMatchesProperty(path8, srcValue) {
  if (isKey_default(path8) && isStrictComparable_default(srcValue)) {
    return matchesStrictComparable_default(toKey_default(path8), srcValue);
  }
  return function(object) {
    var objValue = get_default(object, path8);
    return objValue === void 0 && objValue === srcValue ? hasIn_default(object, path8) : baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
  };
}
var baseMatchesProperty_default = baseMatchesProperty;

// ../../node_modules/lodash-es/_baseProperty.js
function baseProperty(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
var baseProperty_default = baseProperty;

// ../../node_modules/lodash-es/_basePropertyDeep.js
function basePropertyDeep(path8) {
  return function(object) {
    return baseGet_default(object, path8);
  };
}
var basePropertyDeep_default = basePropertyDeep;

// ../../node_modules/lodash-es/property.js
function property(path8) {
  return isKey_default(path8) ? baseProperty_default(toKey_default(path8)) : basePropertyDeep_default(path8);
}
var property_default = property;

// ../../node_modules/lodash-es/_baseIteratee.js
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity_default;
  }
  if (typeof value == "object") {
    return isArray_default(value) ? baseMatchesProperty_default(value[0], value[1]) : baseMatches_default(value);
  }
  return property_default(value);
}
var baseIteratee_default = baseIteratee;

// ../../node_modules/lodash-es/_arrayAggregator.js
function arrayAggregator(array, setter, iteratee, accumulator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    var value = array[index];
    setter(accumulator, value, iteratee(value), array);
  }
  return accumulator;
}
var arrayAggregator_default = arrayAggregator;

// ../../node_modules/lodash-es/_createBaseFor.js
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var createBaseFor_default = createBaseFor;

// ../../node_modules/lodash-es/_baseFor.js
var baseFor = createBaseFor_default();
var baseFor_default = baseFor;

// ../../node_modules/lodash-es/_baseForOwn.js
function baseForOwn(object, iteratee) {
  return object && baseFor_default(object, iteratee, keys_default);
}
var baseForOwn_default = baseForOwn;

// ../../node_modules/lodash-es/_createBaseEach.js
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_default(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var createBaseEach_default = createBaseEach;

// ../../node_modules/lodash-es/_baseEach.js
var baseEach = createBaseEach_default(baseForOwn_default);
var baseEach_default = baseEach;

// ../../node_modules/lodash-es/_baseAggregator.js
function baseAggregator(collection, setter, iteratee, accumulator) {
  baseEach_default(collection, function(value, key, collection2) {
    setter(accumulator, value, iteratee(value), collection2);
  });
  return accumulator;
}
var baseAggregator_default = baseAggregator;

// ../../node_modules/lodash-es/_createAggregator.js
function createAggregator(setter, initializer) {
  return function(collection, iteratee) {
    var func = isArray_default(collection) ? arrayAggregator_default : baseAggregator_default, accumulator = initializer ? initializer() : {};
    return func(collection, setter, baseIteratee_default(iteratee, 2), accumulator);
  };
}
var createAggregator_default = createAggregator;

// ../../node_modules/lodash-es/defaults.js
var objectProto17 = Object.prototype;
var hasOwnProperty14 = objectProto17.hasOwnProperty;
var defaults = baseRest_default(function(object, sources) {
  object = Object(object);
  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : void 0;
  if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
    length = 1;
  }
  while (++index < length) {
    var source = sources[index];
    var props = keysIn_default(source);
    var propsIndex = -1;
    var propsLength = props.length;
    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];
      if (value === void 0 || eq_default(value, objectProto17[key]) && !hasOwnProperty14.call(object, key)) {
        object[key] = source[key];
      }
    }
  }
  return object;
});
var defaults_default = defaults;

// ../../node_modules/lodash-es/isArrayLikeObject.js
function isArrayLikeObject(value) {
  return isObjectLike_default(value) && isArrayLike_default(value);
}
var isArrayLikeObject_default = isArrayLikeObject;

// ../../node_modules/lodash-es/_arrayIncludesWith.js
function arrayIncludesWith(array, value, comparator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}
var arrayIncludesWith_default = arrayIncludesWith;

// ../../node_modules/lodash-es/_baseDifference.js
var LARGE_ARRAY_SIZE2 = 200;
function baseDifference(array, values2, iteratee, comparator) {
  var index = -1, includes2 = arrayIncludes_default, isCommon = true, length = array.length, result = [], valuesLength = values2.length;
  if (!length) {
    return result;
  }
  if (iteratee) {
    values2 = arrayMap_default(values2, baseUnary_default(iteratee));
  }
  if (comparator) {
    includes2 = arrayIncludesWith_default;
    isCommon = false;
  } else if (values2.length >= LARGE_ARRAY_SIZE2) {
    includes2 = cacheHas_default;
    isCommon = false;
    values2 = new SetCache_default(values2);
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee == null ? value : iteratee(value);
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values2[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes2(values2, computed, comparator)) {
        result.push(value);
      }
    }
  return result;
}
var baseDifference_default = baseDifference;

// ../../node_modules/lodash-es/difference.js
var difference = baseRest_default(function(array, values2) {
  return isArrayLikeObject_default(array) ? baseDifference_default(array, baseFlatten_default(values2, 1, isArrayLikeObject_default, true)) : [];
});
var difference_default = difference;

// ../../node_modules/lodash-es/last.js
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : void 0;
}
var last_default = last;

// ../../node_modules/lodash-es/drop.js
function drop(array, n, guard) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger_default(n);
  return baseSlice_default(array, n < 0 ? 0 : n, length);
}
var drop_default = drop;

// ../../node_modules/lodash-es/dropRight.js
function dropRight(array, n, guard) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger_default(n);
  n = length - n;
  return baseSlice_default(array, 0, n < 0 ? 0 : n);
}
var dropRight_default = dropRight;

// ../../node_modules/lodash-es/_castFunction.js
function castFunction(value) {
  return typeof value == "function" ? value : identity_default;
}
var castFunction_default = castFunction;

// ../../node_modules/lodash-es/forEach.js
function forEach(collection, iteratee) {
  var func = isArray_default(collection) ? arrayEach_default : baseEach_default;
  return func(collection, castFunction_default(iteratee));
}
var forEach_default = forEach;

// ../../node_modules/lodash-es/_arrayEvery.js
function arrayEvery(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false;
    }
  }
  return true;
}
var arrayEvery_default = arrayEvery;

// ../../node_modules/lodash-es/_baseEvery.js
function baseEvery(collection, predicate) {
  var result = true;
  baseEach_default(collection, function(value, index, collection2) {
    result = !!predicate(value, index, collection2);
    return result;
  });
  return result;
}
var baseEvery_default = baseEvery;

// ../../node_modules/lodash-es/every.js
function every(collection, predicate, guard) {
  var func = isArray_default(collection) ? arrayEvery_default : baseEvery_default;
  if (guard && isIterateeCall_default(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee_default(predicate, 3));
}
var every_default = every;

// ../../node_modules/lodash-es/_baseFilter.js
function baseFilter(collection, predicate) {
  var result = [];
  baseEach_default(collection, function(value, index, collection2) {
    if (predicate(value, index, collection2)) {
      result.push(value);
    }
  });
  return result;
}
var baseFilter_default = baseFilter;

// ../../node_modules/lodash-es/filter.js
function filter(collection, predicate) {
  var func = isArray_default(collection) ? arrayFilter_default : baseFilter_default;
  return func(collection, baseIteratee_default(predicate, 3));
}
var filter_default = filter;

// ../../node_modules/lodash-es/_createFind.js
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike_default(collection)) {
      var iteratee = baseIteratee_default(predicate, 3);
      collection = keys_default(collection);
      predicate = function(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
  };
}
var createFind_default = createFind;

// ../../node_modules/lodash-es/findIndex.js
var nativeMax2 = Math.max;
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
  if (index < 0) {
    index = nativeMax2(length + index, 0);
  }
  return baseFindIndex_default(array, baseIteratee_default(predicate, 3), index);
}
var findIndex_default = findIndex;

// ../../node_modules/lodash-es/find.js
var find = createFind_default(findIndex_default);
var find_default = find;

// ../../node_modules/lodash-es/head.js
function head(array) {
  return array && array.length ? array[0] : void 0;
}
var head_default = head;

// ../../node_modules/lodash-es/_baseMap.js
function baseMap(collection, iteratee) {
  var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
  baseEach_default(collection, function(value, key, collection2) {
    result[++index] = iteratee(value, key, collection2);
  });
  return result;
}
var baseMap_default = baseMap;

// ../../node_modules/lodash-es/map.js
function map(collection, iteratee) {
  var func = isArray_default(collection) ? arrayMap_default : baseMap_default;
  return func(collection, baseIteratee_default(iteratee, 3));
}
var map_default = map;

// ../../node_modules/lodash-es/flatMap.js
function flatMap(collection, iteratee) {
  return baseFlatten_default(map_default(collection, iteratee), 1);
}
var flatMap_default = flatMap;

// ../../node_modules/lodash-es/groupBy.js
var objectProto18 = Object.prototype;
var hasOwnProperty15 = objectProto18.hasOwnProperty;
var groupBy = createAggregator_default(function(result, value, key) {
  if (hasOwnProperty15.call(result, key)) {
    result[key].push(value);
  } else {
    baseAssignValue_default(result, key, [value]);
  }
});
var groupBy_default = groupBy;

// ../../node_modules/lodash-es/_baseHas.js
var objectProto19 = Object.prototype;
var hasOwnProperty16 = objectProto19.hasOwnProperty;
function baseHas(object, key) {
  return object != null && hasOwnProperty16.call(object, key);
}
var baseHas_default = baseHas;

// ../../node_modules/lodash-es/has.js
function has(object, path8) {
  return object != null && hasPath_default(object, path8, baseHas_default);
}
var has_default = has;

// ../../node_modules/lodash-es/isString.js
var stringTag5 = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray_default(value) && isObjectLike_default(value) && baseGetTag_default(value) == stringTag5;
}
var isString_default = isString;

// ../../node_modules/lodash-es/_baseValues.js
function baseValues(object, props) {
  return arrayMap_default(props, function(key) {
    return object[key];
  });
}
var baseValues_default = baseValues;

// ../../node_modules/lodash-es/values.js
function values(object) {
  return object == null ? [] : baseValues_default(object, keys_default(object));
}
var values_default = values;

// ../../node_modules/lodash-es/includes.js
var nativeMax3 = Math.max;
function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike_default(collection) ? collection : values_default(collection);
  fromIndex = fromIndex && !guard ? toInteger_default(fromIndex) : 0;
  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax3(length + fromIndex, 0);
  }
  return isString_default(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf_default(collection, value, fromIndex) > -1;
}
var includes_default = includes;

// ../../node_modules/lodash-es/indexOf.js
var nativeMax4 = Math.max;
function indexOf(array, value, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
  if (index < 0) {
    index = nativeMax4(length + index, 0);
  }
  return baseIndexOf_default(array, value, index);
}
var indexOf_default = indexOf;

// ../../node_modules/lodash-es/isEmpty.js
var mapTag7 = "[object Map]";
var setTag7 = "[object Set]";
var objectProto20 = Object.prototype;
var hasOwnProperty17 = objectProto20.hasOwnProperty;
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike_default(value) && (isArray_default(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer_default(value) || isTypedArray_default(value) || isArguments_default(value))) {
    return !value.length;
  }
  var tag = getTag_default(value);
  if (tag == mapTag7 || tag == setTag7) {
    return !value.size;
  }
  if (isPrototype_default(value)) {
    return !baseKeys_default(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty17.call(value, key)) {
      return false;
    }
  }
  return true;
}
var isEmpty_default = isEmpty;

// ../../node_modules/lodash-es/_baseIsRegExp.js
var regexpTag5 = "[object RegExp]";
function baseIsRegExp(value) {
  return isObjectLike_default(value) && baseGetTag_default(value) == regexpTag5;
}
var baseIsRegExp_default = baseIsRegExp;

// ../../node_modules/lodash-es/isRegExp.js
var nodeIsRegExp = nodeUtil_default && nodeUtil_default.isRegExp;
var isRegExp = nodeIsRegExp ? baseUnary_default(nodeIsRegExp) : baseIsRegExp_default;
var isRegExp_default = isRegExp;

// ../../node_modules/lodash-es/isUndefined.js
function isUndefined(value) {
  return value === void 0;
}
var isUndefined_default = isUndefined;

// ../../node_modules/lodash-es/_baseLt.js
function baseLt(value, other) {
  return value < other;
}
var baseLt_default = baseLt;

// ../../node_modules/lodash-es/_baseExtremum.js
function baseExtremum(array, iteratee, comparator) {
  var index = -1, length = array.length;
  while (++index < length) {
    var value = array[index], current = iteratee(value);
    if (current != null && (computed === void 0 ? current === current && !isSymbol_default(current) : comparator(current, computed))) {
      var computed = current, result = value;
    }
  }
  return result;
}
var baseExtremum_default = baseExtremum;

// ../../node_modules/lodash-es/min.js
function min(array) {
  return array && array.length ? baseExtremum_default(array, identity_default, baseLt_default) : void 0;
}
var min_default = min;

// ../../node_modules/lodash-es/negate.js
var FUNC_ERROR_TEXT2 = "Expected a function";
function negate(predicate) {
  if (typeof predicate != "function") {
    throw new TypeError(FUNC_ERROR_TEXT2);
  }
  return function() {
    var args = arguments;
    switch (args.length) {
      case 0:
        return !predicate.call(this);
      case 1:
        return !predicate.call(this, args[0]);
      case 2:
        return !predicate.call(this, args[0], args[1]);
      case 3:
        return !predicate.call(this, args[0], args[1], args[2]);
    }
    return !predicate.apply(this, args);
  };
}
var negate_default = negate;

// ../../node_modules/lodash-es/_baseSet.js
function baseSet(object, path8, value, customizer) {
  if (!isObject_default(object)) {
    return object;
  }
  path8 = castPath_default(path8, object);
  var index = -1, length = path8.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index < length) {
    var key = toKey_default(path8[index]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object;
    }
    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : void 0;
      if (newValue === void 0) {
        newValue = isObject_default(objValue) ? objValue : isIndex_default(path8[index + 1]) ? [] : {};
      }
    }
    assignValue_default(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}
var baseSet_default = baseSet;

// ../../node_modules/lodash-es/_basePickBy.js
function basePickBy(object, paths, predicate) {
  var index = -1, length = paths.length, result = {};
  while (++index < length) {
    var path8 = paths[index], value = baseGet_default(object, path8);
    if (predicate(value, path8)) {
      baseSet_default(result, castPath_default(path8, object), value);
    }
  }
  return result;
}
var basePickBy_default = basePickBy;

// ../../node_modules/lodash-es/pickBy.js
function pickBy(object, predicate) {
  if (object == null) {
    return {};
  }
  var props = arrayMap_default(getAllKeysIn_default(object), function(prop) {
    return [prop];
  });
  predicate = baseIteratee_default(predicate);
  return basePickBy_default(object, props, function(value, path8) {
    return predicate(value, path8[0]);
  });
}
var pickBy_default = pickBy;

// ../../node_modules/lodash-es/_baseReduce.js
function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
  eachFunc(collection, function(value, index, collection2) {
    accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
  });
  return accumulator;
}
var baseReduce_default = baseReduce;

// ../../node_modules/lodash-es/reduce.js
function reduce(collection, iteratee, accumulator) {
  var func = isArray_default(collection) ? arrayReduce_default : baseReduce_default, initAccum = arguments.length < 3;
  return func(collection, baseIteratee_default(iteratee, 4), accumulator, initAccum, baseEach_default);
}
var reduce_default = reduce;

// ../../node_modules/lodash-es/reject.js
function reject(collection, predicate) {
  var func = isArray_default(collection) ? arrayFilter_default : baseFilter_default;
  return func(collection, negate_default(baseIteratee_default(predicate, 3)));
}
var reject_default = reject;

// ../../node_modules/lodash-es/_baseSome.js
function baseSome(collection, predicate) {
  var result;
  baseEach_default(collection, function(value, index, collection2) {
    result = predicate(value, index, collection2);
    return !result;
  });
  return !!result;
}
var baseSome_default = baseSome;

// ../../node_modules/lodash-es/some.js
function some(collection, predicate, guard) {
  var func = isArray_default(collection) ? arraySome_default : baseSome_default;
  if (guard && isIterateeCall_default(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee_default(predicate, 3));
}
var some_default = some;

// ../../node_modules/lodash-es/_createSet.js
var INFINITY4 = 1 / 0;
var createSet = !(Set_default && 1 / setToArray_default(new Set_default([, -0]))[1] == INFINITY4) ? noop_default : function(values2) {
  return new Set_default(values2);
};
var createSet_default = createSet;

// ../../node_modules/lodash-es/_baseUniq.js
var LARGE_ARRAY_SIZE3 = 200;
function baseUniq(array, iteratee, comparator) {
  var index = -1, includes2 = arrayIncludes_default, length = array.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes2 = arrayIncludesWith_default;
  } else if (length >= LARGE_ARRAY_SIZE3) {
    var set = iteratee ? null : createSet_default(array);
    if (set) {
      return setToArray_default(set);
    }
    isCommon = false;
    includes2 = cacheHas_default;
    seen = new SetCache_default();
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes2(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var baseUniq_default = baseUniq;

// ../../node_modules/lodash-es/uniq.js
function uniq(array) {
  return array && array.length ? baseUniq_default(array) : [];
}
var uniq_default = uniq;

// ../../node_modules/lodash-es/uniqBy.js
function uniqBy(array, iteratee) {
  return array && array.length ? baseUniq_default(array, baseIteratee_default(iteratee, 2)) : [];
}
var uniqBy_default = uniqBy;

// ../../node_modules/@chevrotain/utils/lib/src/print.js
function PRINT_ERROR(msg) {
  if (console && console.error) {
    console.error(`Error: ${msg}`);
  }
}
function PRINT_WARNING(msg) {
  if (console && console.warn) {
    console.warn(`Warning: ${msg}`);
  }
}

// ../../node_modules/@chevrotain/utils/lib/src/timer.js
function timer(func) {
  const start = (/* @__PURE__ */ new Date()).getTime();
  const val = func();
  const end = (/* @__PURE__ */ new Date()).getTime();
  const total = end - start;
  return { time: total, value: val };
}

// ../../node_modules/@chevrotain/utils/lib/src/to-fast-properties.js
function toFastProperties(toBecomeFast) {
  function FakeConstructor() {
  }
  FakeConstructor.prototype = toBecomeFast;
  const fakeInstance = new FakeConstructor();
  function fakeAccess() {
    return typeof fakeInstance.bar;
  }
  fakeAccess();
  fakeAccess();
  if (1)
    return toBecomeFast;
  (0, eval)(toBecomeFast);
}

// ../../node_modules/@chevrotain/gast/lib/src/model.js
function tokenLabel(tokType) {
  if (hasTokenLabel(tokType)) {
    return tokType.LABEL;
  } else {
    return tokType.name;
  }
}
function hasTokenLabel(obj) {
  return isString_default(obj.LABEL) && obj.LABEL !== "";
}
var AbstractProduction = class {
  get definition() {
    return this._definition;
  }
  set definition(value) {
    this._definition = value;
  }
  constructor(_definition) {
    this._definition = _definition;
  }
  accept(visitor) {
    visitor.visit(this);
    forEach_default(this.definition, (prod) => {
      prod.accept(visitor);
    });
  }
};
var NonTerminal = class extends AbstractProduction {
  constructor(options) {
    super([]);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
  set definition(definition) {
  }
  get definition() {
    if (this.referencedRule !== void 0) {
      return this.referencedRule.definition;
    }
    return [];
  }
  accept(visitor) {
    visitor.visit(this);
  }
};
var Rule = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.orgText = "";
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var Alternative = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.ignoreAmbiguities = false;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var Option = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var RepetitionMandatory = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var RepetitionMandatoryWithSeparator = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var Repetition = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var RepetitionWithSeparator = class extends AbstractProduction {
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var Alternation = class extends AbstractProduction {
  get definition() {
    return this._definition;
  }
  set definition(value) {
    this._definition = value;
  }
  constructor(options) {
    super(options.definition);
    this.idx = 1;
    this.ignoreAmbiguities = false;
    this.hasPredicates = false;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
};
var Terminal = class {
  constructor(options) {
    this.idx = 1;
    assign_default(this, pickBy_default(options, (v) => v !== void 0));
  }
  accept(visitor) {
    visitor.visit(this);
  }
};
function serializeGrammar(topRules) {
  return map_default(topRules, serializeProduction);
}
function serializeProduction(node) {
  function convertDefinition(definition) {
    return map_default(definition, serializeProduction);
  }
  if (node instanceof NonTerminal) {
    const serializedNonTerminal = {
      type: "NonTerminal",
      name: node.nonTerminalName,
      idx: node.idx
    };
    if (isString_default(node.label)) {
      serializedNonTerminal.label = node.label;
    }
    return serializedNonTerminal;
  } else if (node instanceof Alternative) {
    return {
      type: "Alternative",
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof Option) {
    return {
      type: "Option",
      idx: node.idx,
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof RepetitionMandatory) {
    return {
      type: "RepetitionMandatory",
      idx: node.idx,
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof RepetitionMandatoryWithSeparator) {
    return {
      type: "RepetitionMandatoryWithSeparator",
      idx: node.idx,
      separator: serializeProduction(new Terminal({ terminalType: node.separator })),
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof RepetitionWithSeparator) {
    return {
      type: "RepetitionWithSeparator",
      idx: node.idx,
      separator: serializeProduction(new Terminal({ terminalType: node.separator })),
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof Repetition) {
    return {
      type: "Repetition",
      idx: node.idx,
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof Alternation) {
    return {
      type: "Alternation",
      idx: node.idx,
      definition: convertDefinition(node.definition)
    };
  } else if (node instanceof Terminal) {
    const serializedTerminal = {
      type: "Terminal",
      name: node.terminalType.name,
      label: tokenLabel(node.terminalType),
      idx: node.idx
    };
    if (isString_default(node.label)) {
      serializedTerminal.terminalLabel = node.label;
    }
    const pattern = node.terminalType.PATTERN;
    if (node.terminalType.PATTERN) {
      serializedTerminal.pattern = isRegExp_default(pattern) ? pattern.source : pattern;
    }
    return serializedTerminal;
  } else if (node instanceof Rule) {
    return {
      type: "Rule",
      name: node.name,
      orgText: node.orgText,
      definition: convertDefinition(node.definition)
    };
  } else {
    throw Error("non exhaustive match");
  }
}

// ../../node_modules/@chevrotain/gast/lib/src/visitor.js
var GAstVisitor = class {
  visit(node) {
    const nodeAny = node;
    switch (nodeAny.constructor) {
      case NonTerminal:
        return this.visitNonTerminal(nodeAny);
      case Alternative:
        return this.visitAlternative(nodeAny);
      case Option:
        return this.visitOption(nodeAny);
      case RepetitionMandatory:
        return this.visitRepetitionMandatory(nodeAny);
      case RepetitionMandatoryWithSeparator:
        return this.visitRepetitionMandatoryWithSeparator(nodeAny);
      case RepetitionWithSeparator:
        return this.visitRepetitionWithSeparator(nodeAny);
      case Repetition:
        return this.visitRepetition(nodeAny);
      case Alternation:
        return this.visitAlternation(nodeAny);
      case Terminal:
        return this.visitTerminal(nodeAny);
      case Rule:
        return this.visitRule(nodeAny);
      /* c8 ignore next 2 */
      default:
        throw Error("non exhaustive match");
    }
  }
  /* c8 ignore next */
  visitNonTerminal(node) {
  }
  /* c8 ignore next */
  visitAlternative(node) {
  }
  /* c8 ignore next */
  visitOption(node) {
  }
  /* c8 ignore next */
  visitRepetition(node) {
  }
  /* c8 ignore next */
  visitRepetitionMandatory(node) {
  }
  /* c8 ignore next 3 */
  visitRepetitionMandatoryWithSeparator(node) {
  }
  /* c8 ignore next */
  visitRepetitionWithSeparator(node) {
  }
  /* c8 ignore next */
  visitAlternation(node) {
  }
  /* c8 ignore next */
  visitTerminal(node) {
  }
  /* c8 ignore next */
  visitRule(node) {
  }
};

// ../../node_modules/@chevrotain/gast/lib/src/helpers.js
function isSequenceProd(prod) {
  return prod instanceof Alternative || prod instanceof Option || prod instanceof Repetition || prod instanceof RepetitionMandatory || prod instanceof RepetitionMandatoryWithSeparator || prod instanceof RepetitionWithSeparator || prod instanceof Terminal || prod instanceof Rule;
}
function isOptionalProd(prod, alreadyVisited = []) {
  const isDirectlyOptional = prod instanceof Option || prod instanceof Repetition || prod instanceof RepetitionWithSeparator;
  if (isDirectlyOptional) {
    return true;
  }
  if (prod instanceof Alternation) {
    return some_default(prod.definition, (subProd) => {
      return isOptionalProd(subProd, alreadyVisited);
    });
  } else if (prod instanceof NonTerminal && includes_default(alreadyVisited, prod)) {
    return false;
  } else if (prod instanceof AbstractProduction) {
    if (prod instanceof NonTerminal) {
      alreadyVisited.push(prod);
    }
    return every_default(prod.definition, (subProd) => {
      return isOptionalProd(subProd, alreadyVisited);
    });
  } else {
    return false;
  }
}
function isBranchingProd(prod) {
  return prod instanceof Alternation;
}
function getProductionDslName(prod) {
  if (prod instanceof NonTerminal) {
    return "SUBRULE";
  } else if (prod instanceof Option) {
    return "OPTION";
  } else if (prod instanceof Alternation) {
    return "OR";
  } else if (prod instanceof RepetitionMandatory) {
    return "AT_LEAST_ONE";
  } else if (prod instanceof RepetitionMandatoryWithSeparator) {
    return "AT_LEAST_ONE_SEP";
  } else if (prod instanceof RepetitionWithSeparator) {
    return "MANY_SEP";
  } else if (prod instanceof Repetition) {
    return "MANY";
  } else if (prod instanceof Terminal) {
    return "CONSUME";
  } else {
    throw Error("non exhaustive match");
  }
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/rest.js
var RestWalker = class {
  walk(prod, prevRest = []) {
    forEach_default(prod.definition, (subProd, index) => {
      const currRest = drop_default(prod.definition, index + 1);
      if (subProd instanceof NonTerminal) {
        this.walkProdRef(subProd, currRest, prevRest);
      } else if (subProd instanceof Terminal) {
        this.walkTerminal(subProd, currRest, prevRest);
      } else if (subProd instanceof Alternative) {
        this.walkFlat(subProd, currRest, prevRest);
      } else if (subProd instanceof Option) {
        this.walkOption(subProd, currRest, prevRest);
      } else if (subProd instanceof RepetitionMandatory) {
        this.walkAtLeastOne(subProd, currRest, prevRest);
      } else if (subProd instanceof RepetitionMandatoryWithSeparator) {
        this.walkAtLeastOneSep(subProd, currRest, prevRest);
      } else if (subProd instanceof RepetitionWithSeparator) {
        this.walkManySep(subProd, currRest, prevRest);
      } else if (subProd instanceof Repetition) {
        this.walkMany(subProd, currRest, prevRest);
      } else if (subProd instanceof Alternation) {
        this.walkOr(subProd, currRest, prevRest);
      } else {
        throw Error("non exhaustive match");
      }
    });
  }
  walkTerminal(terminal, currRest, prevRest) {
  }
  walkProdRef(refProd, currRest, prevRest) {
  }
  walkFlat(flatProd, currRest, prevRest) {
    const fullOrRest = currRest.concat(prevRest);
    this.walk(flatProd, fullOrRest);
  }
  walkOption(optionProd, currRest, prevRest) {
    const fullOrRest = currRest.concat(prevRest);
    this.walk(optionProd, fullOrRest);
  }
  walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
    const fullAtLeastOneRest = [
      new Option({ definition: atLeastOneProd.definition })
    ].concat(currRest, prevRest);
    this.walk(atLeastOneProd, fullAtLeastOneRest);
  }
  walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
    const fullAtLeastOneSepRest = restForRepetitionWithSeparator(atLeastOneSepProd, currRest, prevRest);
    this.walk(atLeastOneSepProd, fullAtLeastOneSepRest);
  }
  walkMany(manyProd, currRest, prevRest) {
    const fullManyRest = [
      new Option({ definition: manyProd.definition })
    ].concat(currRest, prevRest);
    this.walk(manyProd, fullManyRest);
  }
  walkManySep(manySepProd, currRest, prevRest) {
    const fullManySepRest = restForRepetitionWithSeparator(manySepProd, currRest, prevRest);
    this.walk(manySepProd, fullManySepRest);
  }
  walkOr(orProd, currRest, prevRest) {
    const fullOrRest = currRest.concat(prevRest);
    forEach_default(orProd.definition, (alt) => {
      const prodWrapper = new Alternative({ definition: [alt] });
      this.walk(prodWrapper, fullOrRest);
    });
  }
};
function restForRepetitionWithSeparator(repSepProd, currRest, prevRest) {
  const repSepRest = [
    new Option({
      definition: [
        new Terminal({ terminalType: repSepProd.separator })
      ].concat(repSepProd.definition)
    })
  ];
  const fullRepSepRest = repSepRest.concat(currRest, prevRest);
  return fullRepSepRest;
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/first.js
function first(prod) {
  if (prod instanceof NonTerminal) {
    return first(prod.referencedRule);
  } else if (prod instanceof Terminal) {
    return firstForTerminal(prod);
  } else if (isSequenceProd(prod)) {
    return firstForSequence(prod);
  } else if (isBranchingProd(prod)) {
    return firstForBranching(prod);
  } else {
    throw Error("non exhaustive match");
  }
}
function firstForSequence(prod) {
  let firstSet = [];
  const seq = prod.definition;
  let nextSubProdIdx = 0;
  let hasInnerProdsRemaining = seq.length > nextSubProdIdx;
  let currSubProd;
  let isLastInnerProdOptional = true;
  while (hasInnerProdsRemaining && isLastInnerProdOptional) {
    currSubProd = seq[nextSubProdIdx];
    isLastInnerProdOptional = isOptionalProd(currSubProd);
    firstSet = firstSet.concat(first(currSubProd));
    nextSubProdIdx = nextSubProdIdx + 1;
    hasInnerProdsRemaining = seq.length > nextSubProdIdx;
  }
  return uniq_default(firstSet);
}
function firstForBranching(prod) {
  const allAlternativesFirsts = map_default(prod.definition, (innerProd) => {
    return first(innerProd);
  });
  return uniq_default(flatten_default(allAlternativesFirsts));
}
function firstForTerminal(terminal) {
  return [terminal.terminalType];
}

// ../../node_modules/chevrotain/lib/src/parse/constants.js
var IN = "_~IN~_";

// ../../node_modules/chevrotain/lib/src/parse/grammar/follow.js
var ResyncFollowsWalker = class extends RestWalker {
  constructor(topProd) {
    super();
    this.topProd = topProd;
    this.follows = {};
  }
  startWalking() {
    this.walk(this.topProd);
    return this.follows;
  }
  walkTerminal(terminal, currRest, prevRest) {
  }
  walkProdRef(refProd, currRest, prevRest) {
    const followName = buildBetweenProdsFollowPrefix(refProd.referencedRule, refProd.idx) + this.topProd.name;
    const fullRest = currRest.concat(prevRest);
    const restProd = new Alternative({ definition: fullRest });
    const t_in_topProd_follows = first(restProd);
    this.follows[followName] = t_in_topProd_follows;
  }
};
function computeAllProdsFollows(topProductions) {
  const reSyncFollows = {};
  forEach_default(topProductions, (topProd) => {
    const currRefsFollow = new ResyncFollowsWalker(topProd).startWalking();
    assign_default(reSyncFollows, currRefsFollow);
  });
  return reSyncFollows;
}
function buildBetweenProdsFollowPrefix(inner, occurenceInParent) {
  return inner.name + occurenceInParent + IN;
}

// ../../node_modules/@chevrotain/regexp-to-ast/lib/src/utils.js
function cc(char) {
  return char.charCodeAt(0);
}
function insertToSet(item, set) {
  if (Array.isArray(item)) {
    item.forEach(function(subItem) {
      set.push(subItem);
    });
  } else {
    set.push(item);
  }
}
function addFlag(flagObj, flagKey) {
  if (flagObj[flagKey] === true) {
    throw "duplicate flag " + flagKey;
  }
  const x = flagObj[flagKey];
  flagObj[flagKey] = true;
}
function ASSERT_EXISTS(obj) {
  if (obj === void 0) {
    throw Error("Internal Error - Should never get here!");
  }
  return true;
}
function ASSERT_NEVER_REACH_HERE() {
  throw Error("Internal Error - Should never get here!");
}
function isCharacter(obj) {
  return obj["type"] === "Character";
}

// ../../node_modules/@chevrotain/regexp-to-ast/lib/src/character-classes.js
var digitsCharCodes = [];
for (let i = cc("0"); i <= cc("9"); i++) {
  digitsCharCodes.push(i);
}
var wordCharCodes = [cc("_")].concat(digitsCharCodes);
for (let i = cc("a"); i <= cc("z"); i++) {
  wordCharCodes.push(i);
}
for (let i = cc("A"); i <= cc("Z"); i++) {
  wordCharCodes.push(i);
}
var whitespaceCodes = [
  cc(" "),
  cc("\f"),
  cc("\n"),
  cc("\r"),
  cc("	"),
  cc("\v"),
  cc("	"),
  cc("\xA0"),
  cc("\u1680"),
  cc("\u2000"),
  cc("\u2001"),
  cc("\u2002"),
  cc("\u2003"),
  cc("\u2004"),
  cc("\u2005"),
  cc("\u2006"),
  cc("\u2007"),
  cc("\u2008"),
  cc("\u2009"),
  cc("\u200A"),
  cc("\u2028"),
  cc("\u2029"),
  cc("\u202F"),
  cc("\u205F"),
  cc("\u3000"),
  cc("\uFEFF")
];

// ../../node_modules/@chevrotain/regexp-to-ast/lib/src/regexp-parser.js
var hexDigitPattern = /[0-9a-fA-F]/;
var decimalPattern = /[0-9]/;
var decimalPatternNoZero = /[1-9]/;
var RegExpParser = class {
  constructor() {
    this.idx = 0;
    this.input = "";
    this.groupIdx = 0;
  }
  saveState() {
    return {
      idx: this.idx,
      input: this.input,
      groupIdx: this.groupIdx
    };
  }
  restoreState(newState2) {
    this.idx = newState2.idx;
    this.input = newState2.input;
    this.groupIdx = newState2.groupIdx;
  }
  pattern(input) {
    this.idx = 0;
    this.input = input;
    this.groupIdx = 0;
    this.consumeChar("/");
    const value = this.disjunction();
    this.consumeChar("/");
    const flags = {
      type: "Flags",
      loc: { begin: this.idx, end: input.length },
      global: false,
      ignoreCase: false,
      multiLine: false,
      unicode: false,
      sticky: false
    };
    while (this.isRegExpFlag()) {
      switch (this.popChar()) {
        case "g":
          addFlag(flags, "global");
          break;
        case "i":
          addFlag(flags, "ignoreCase");
          break;
        case "m":
          addFlag(flags, "multiLine");
          break;
        case "u":
          addFlag(flags, "unicode");
          break;
        case "y":
          addFlag(flags, "sticky");
          break;
      }
    }
    if (this.idx !== this.input.length) {
      throw Error("Redundant input: " + this.input.substring(this.idx));
    }
    return {
      type: "Pattern",
      flags,
      value,
      loc: this.loc(0)
    };
  }
  disjunction() {
    const alts = [];
    const begin = this.idx;
    alts.push(this.alternative());
    while (this.peekChar() === "|") {
      this.consumeChar("|");
      alts.push(this.alternative());
    }
    return { type: "Disjunction", value: alts, loc: this.loc(begin) };
  }
  alternative() {
    const terms = [];
    const begin = this.idx;
    while (this.isTerm()) {
      terms.push(this.term());
    }
    return { type: "Alternative", value: terms, loc: this.loc(begin) };
  }
  term() {
    if (this.isAssertion()) {
      return this.assertion();
    } else {
      return this.atom();
    }
  }
  assertion() {
    const begin = this.idx;
    switch (this.popChar()) {
      case "^":
        return {
          type: "StartAnchor",
          loc: this.loc(begin)
        };
      case "$":
        return { type: "EndAnchor", loc: this.loc(begin) };
      // '\b' or '\B'
      case "\\":
        switch (this.popChar()) {
          case "b":
            return {
              type: "WordBoundary",
              loc: this.loc(begin)
            };
          case "B":
            return {
              type: "NonWordBoundary",
              loc: this.loc(begin)
            };
        }
        throw Error("Invalid Assertion Escape");
      // '(?=' or '(?!'
      case "(":
        this.consumeChar("?");
        let type;
        switch (this.popChar()) {
          case "=":
            type = "Lookahead";
            break;
          case "!":
            type = "NegativeLookahead";
            break;
        }
        ASSERT_EXISTS(type);
        const disjunction = this.disjunction();
        this.consumeChar(")");
        return {
          type,
          value: disjunction,
          loc: this.loc(begin)
        };
    }
    return ASSERT_NEVER_REACH_HERE();
  }
  quantifier(isBacktracking = false) {
    let range = void 0;
    const begin = this.idx;
    switch (this.popChar()) {
      case "*":
        range = {
          atLeast: 0,
          atMost: Infinity
        };
        break;
      case "+":
        range = {
          atLeast: 1,
          atMost: Infinity
        };
        break;
      case "?":
        range = {
          atLeast: 0,
          atMost: 1
        };
        break;
      case "{":
        const atLeast = this.integerIncludingZero();
        switch (this.popChar()) {
          case "}":
            range = {
              atLeast,
              atMost: atLeast
            };
            break;
          case ",":
            let atMost;
            if (this.isDigit()) {
              atMost = this.integerIncludingZero();
              range = {
                atLeast,
                atMost
              };
            } else {
              range = {
                atLeast,
                atMost: Infinity
              };
            }
            this.consumeChar("}");
            break;
        }
        if (isBacktracking === true && range === void 0) {
          return void 0;
        }
        ASSERT_EXISTS(range);
        break;
    }
    if (isBacktracking === true && range === void 0) {
      return void 0;
    }
    if (ASSERT_EXISTS(range)) {
      if (this.peekChar(0) === "?") {
        this.consumeChar("?");
        range.greedy = false;
      } else {
        range.greedy = true;
      }
      range.type = "Quantifier";
      range.loc = this.loc(begin);
      return range;
    }
  }
  atom() {
    let atom2;
    const begin = this.idx;
    switch (this.peekChar()) {
      case ".":
        atom2 = this.dotAll();
        break;
      case "\\":
        atom2 = this.atomEscape();
        break;
      case "[":
        atom2 = this.characterClass();
        break;
      case "(":
        atom2 = this.group();
        break;
    }
    if (atom2 === void 0 && this.isPatternCharacter()) {
      atom2 = this.patternCharacter();
    }
    if (ASSERT_EXISTS(atom2)) {
      atom2.loc = this.loc(begin);
      if (this.isQuantifier()) {
        atom2.quantifier = this.quantifier();
      }
      return atom2;
    }
    return ASSERT_NEVER_REACH_HERE();
  }
  dotAll() {
    this.consumeChar(".");
    return {
      type: "Set",
      complement: true,
      value: [cc("\n"), cc("\r"), cc("\u2028"), cc("\u2029")]
    };
  }
  atomEscape() {
    this.consumeChar("\\");
    switch (this.peekChar()) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        return this.decimalEscapeAtom();
      case "d":
      case "D":
      case "s":
      case "S":
      case "w":
      case "W":
        return this.characterClassEscape();
      case "f":
      case "n":
      case "r":
      case "t":
      case "v":
        return this.controlEscapeAtom();
      case "c":
        return this.controlLetterEscapeAtom();
      case "0":
        return this.nulCharacterAtom();
      case "x":
        return this.hexEscapeSequenceAtom();
      case "u":
        return this.regExpUnicodeEscapeSequenceAtom();
      default:
        return this.identityEscapeAtom();
    }
  }
  decimalEscapeAtom() {
    const value = this.positiveInteger();
    return { type: "GroupBackReference", value };
  }
  characterClassEscape() {
    let set;
    let complement = false;
    switch (this.popChar()) {
      case "d":
        set = digitsCharCodes;
        break;
      case "D":
        set = digitsCharCodes;
        complement = true;
        break;
      case "s":
        set = whitespaceCodes;
        break;
      case "S":
        set = whitespaceCodes;
        complement = true;
        break;
      case "w":
        set = wordCharCodes;
        break;
      case "W":
        set = wordCharCodes;
        complement = true;
        break;
    }
    if (ASSERT_EXISTS(set)) {
      return { type: "Set", value: set, complement };
    }
    return ASSERT_NEVER_REACH_HERE();
  }
  controlEscapeAtom() {
    let escapeCode;
    switch (this.popChar()) {
      case "f":
        escapeCode = cc("\f");
        break;
      case "n":
        escapeCode = cc("\n");
        break;
      case "r":
        escapeCode = cc("\r");
        break;
      case "t":
        escapeCode = cc("	");
        break;
      case "v":
        escapeCode = cc("\v");
        break;
    }
    if (ASSERT_EXISTS(escapeCode)) {
      return { type: "Character", value: escapeCode };
    }
    return ASSERT_NEVER_REACH_HERE();
  }
  controlLetterEscapeAtom() {
    this.consumeChar("c");
    const letter = this.popChar();
    if (/[a-zA-Z]/.test(letter) === false) {
      throw Error("Invalid ");
    }
    const letterCode = letter.toUpperCase().charCodeAt(0) - 64;
    return { type: "Character", value: letterCode };
  }
  nulCharacterAtom() {
    this.consumeChar("0");
    return { type: "Character", value: cc("\0") };
  }
  hexEscapeSequenceAtom() {
    this.consumeChar("x");
    return this.parseHexDigits(2);
  }
  regExpUnicodeEscapeSequenceAtom() {
    this.consumeChar("u");
    return this.parseHexDigits(4);
  }
  identityEscapeAtom() {
    const escapedChar = this.popChar();
    return { type: "Character", value: cc(escapedChar) };
  }
  classPatternCharacterAtom() {
    switch (this.peekChar()) {
      // istanbul ignore next
      case "\n":
      // istanbul ignore next
      case "\r":
      // istanbul ignore next
      case "\u2028":
      // istanbul ignore next
      case "\u2029":
      // istanbul ignore next
      case "\\":
      // istanbul ignore next
      case "]":
        throw Error("TBD");
      default:
        const nextChar = this.popChar();
        return { type: "Character", value: cc(nextChar) };
    }
  }
  characterClass() {
    const set = [];
    let complement = false;
    this.consumeChar("[");
    if (this.peekChar(0) === "^") {
      this.consumeChar("^");
      complement = true;
    }
    while (this.isClassAtom()) {
      const from = this.classAtom();
      const isFromSingleChar = from.type === "Character";
      if (isCharacter(from) && this.isRangeDash()) {
        this.consumeChar("-");
        const to = this.classAtom();
        const isToSingleChar = to.type === "Character";
        if (isCharacter(to)) {
          if (to.value < from.value) {
            throw Error("Range out of order in character class");
          }
          set.push({ from: from.value, to: to.value });
        } else {
          insertToSet(from.value, set);
          set.push(cc("-"));
          insertToSet(to.value, set);
        }
      } else {
        insertToSet(from.value, set);
      }
    }
    this.consumeChar("]");
    return { type: "Set", complement, value: set };
  }
  classAtom() {
    switch (this.peekChar()) {
      // istanbul ignore next
      case "]":
      // istanbul ignore next
      case "\n":
      // istanbul ignore next
      case "\r":
      // istanbul ignore next
      case "\u2028":
      // istanbul ignore next
      case "\u2029":
        throw Error("TBD");
      case "\\":
        return this.classEscape();
      default:
        return this.classPatternCharacterAtom();
    }
  }
  classEscape() {
    this.consumeChar("\\");
    switch (this.peekChar()) {
      // Matches a backspace.
      // (Not to be confused with \b word boundary outside characterClass)
      case "b":
        this.consumeChar("b");
        return { type: "Character", value: cc("\b") };
      case "d":
      case "D":
      case "s":
      case "S":
      case "w":
      case "W":
        return this.characterClassEscape();
      case "f":
      case "n":
      case "r":
      case "t":
      case "v":
        return this.controlEscapeAtom();
      case "c":
        return this.controlLetterEscapeAtom();
      case "0":
        return this.nulCharacterAtom();
      case "x":
        return this.hexEscapeSequenceAtom();
      case "u":
        return this.regExpUnicodeEscapeSequenceAtom();
      default:
        return this.identityEscapeAtom();
    }
  }
  group() {
    let capturing = true;
    this.consumeChar("(");
    switch (this.peekChar(0)) {
      case "?":
        this.consumeChar("?");
        this.consumeChar(":");
        capturing = false;
        break;
      default:
        this.groupIdx++;
        break;
    }
    const value = this.disjunction();
    this.consumeChar(")");
    const groupAst = {
      type: "Group",
      capturing,
      value
    };
    if (capturing) {
      groupAst["idx"] = this.groupIdx;
    }
    return groupAst;
  }
  positiveInteger() {
    let number = this.popChar();
    if (decimalPatternNoZero.test(number) === false) {
      throw Error("Expecting a positive integer");
    }
    while (decimalPattern.test(this.peekChar(0))) {
      number += this.popChar();
    }
    return parseInt(number, 10);
  }
  integerIncludingZero() {
    let number = this.popChar();
    if (decimalPattern.test(number) === false) {
      throw Error("Expecting an integer");
    }
    while (decimalPattern.test(this.peekChar(0))) {
      number += this.popChar();
    }
    return parseInt(number, 10);
  }
  patternCharacter() {
    const nextChar = this.popChar();
    switch (nextChar) {
      // istanbul ignore next
      case "\n":
      // istanbul ignore next
      case "\r":
      // istanbul ignore next
      case "\u2028":
      // istanbul ignore next
      case "\u2029":
      // istanbul ignore next
      case "^":
      // istanbul ignore next
      case "$":
      // istanbul ignore next
      case "\\":
      // istanbul ignore next
      case ".":
      // istanbul ignore next
      case "*":
      // istanbul ignore next
      case "+":
      // istanbul ignore next
      case "?":
      // istanbul ignore next
      case "(":
      // istanbul ignore next
      case ")":
      // istanbul ignore next
      case "[":
      // istanbul ignore next
      case "|":
        throw Error("TBD");
      default:
        return { type: "Character", value: cc(nextChar) };
    }
  }
  isRegExpFlag() {
    switch (this.peekChar(0)) {
      case "g":
      case "i":
      case "m":
      case "u":
      case "y":
        return true;
      default:
        return false;
    }
  }
  isRangeDash() {
    return this.peekChar() === "-" && this.isClassAtom(1);
  }
  isDigit() {
    return decimalPattern.test(this.peekChar(0));
  }
  isClassAtom(howMuch = 0) {
    switch (this.peekChar(howMuch)) {
      case "]":
      case "\n":
      case "\r":
      case "\u2028":
      case "\u2029":
        return false;
      default:
        return true;
    }
  }
  isTerm() {
    return this.isAtom() || this.isAssertion();
  }
  isAtom() {
    if (this.isPatternCharacter()) {
      return true;
    }
    switch (this.peekChar(0)) {
      case ".":
      case "\\":
      // atomEscape
      case "[":
      // characterClass
      // TODO: isAtom must be called before isAssertion - disambiguate
      case "(":
        return true;
      default:
        return false;
    }
  }
  isAssertion() {
    switch (this.peekChar(0)) {
      case "^":
      case "$":
        return true;
      // '\b' or '\B'
      case "\\":
        switch (this.peekChar(1)) {
          case "b":
          case "B":
            return true;
          default:
            return false;
        }
      // '(?=' or '(?!'
      case "(":
        return this.peekChar(1) === "?" && (this.peekChar(2) === "=" || this.peekChar(2) === "!");
      default:
        return false;
    }
  }
  isQuantifier() {
    const prevState = this.saveState();
    try {
      return this.quantifier(true) !== void 0;
    } catch (e) {
      return false;
    } finally {
      this.restoreState(prevState);
    }
  }
  isPatternCharacter() {
    switch (this.peekChar()) {
      case "^":
      case "$":
      case "\\":
      case ".":
      case "*":
      case "+":
      case "?":
      case "(":
      case ")":
      case "[":
      case "|":
      case "/":
      case "\n":
      case "\r":
      case "\u2028":
      case "\u2029":
        return false;
      default:
        return true;
    }
  }
  parseHexDigits(howMany) {
    let hexString = "";
    for (let i = 0; i < howMany; i++) {
      const hexChar = this.popChar();
      if (hexDigitPattern.test(hexChar) === false) {
        throw Error("Expecting a HexDecimal digits");
      }
      hexString += hexChar;
    }
    const charCode = parseInt(hexString, 16);
    return { type: "Character", value: charCode };
  }
  peekChar(howMuch = 0) {
    return this.input[this.idx + howMuch];
  }
  popChar() {
    const nextChar = this.peekChar(0);
    this.consumeChar(void 0);
    return nextChar;
  }
  consumeChar(char) {
    if (char !== void 0 && this.input[this.idx] !== char) {
      throw Error("Expected: '" + char + "' but found: '" + this.input[this.idx] + "' at offset: " + this.idx);
    }
    if (this.idx >= this.input.length) {
      throw Error("Unexpected end of input");
    }
    this.idx++;
  }
  loc(begin) {
    return { begin, end: this.idx };
  }
};

// ../../node_modules/@chevrotain/regexp-to-ast/lib/src/base-regexp-visitor.js
var BaseRegExpVisitor = class {
  visitChildren(node) {
    for (const key in node) {
      const child2 = node[key];
      if (node.hasOwnProperty(key)) {
        if (child2.type !== void 0) {
          this.visit(child2);
        } else if (Array.isArray(child2)) {
          child2.forEach((subChild) => {
            this.visit(subChild);
          }, this);
        }
      }
    }
  }
  visit(node) {
    switch (node.type) {
      case "Pattern":
        this.visitPattern(node);
        break;
      case "Flags":
        this.visitFlags(node);
        break;
      case "Disjunction":
        this.visitDisjunction(node);
        break;
      case "Alternative":
        this.visitAlternative(node);
        break;
      case "StartAnchor":
        this.visitStartAnchor(node);
        break;
      case "EndAnchor":
        this.visitEndAnchor(node);
        break;
      case "WordBoundary":
        this.visitWordBoundary(node);
        break;
      case "NonWordBoundary":
        this.visitNonWordBoundary(node);
        break;
      case "Lookahead":
        this.visitLookahead(node);
        break;
      case "NegativeLookahead":
        this.visitNegativeLookahead(node);
        break;
      case "Character":
        this.visitCharacter(node);
        break;
      case "Set":
        this.visitSet(node);
        break;
      case "Group":
        this.visitGroup(node);
        break;
      case "GroupBackReference":
        this.visitGroupBackReference(node);
        break;
      case "Quantifier":
        this.visitQuantifier(node);
        break;
    }
    this.visitChildren(node);
  }
  visitPattern(node) {
  }
  visitFlags(node) {
  }
  visitDisjunction(node) {
  }
  visitAlternative(node) {
  }
  // Assertion
  visitStartAnchor(node) {
  }
  visitEndAnchor(node) {
  }
  visitWordBoundary(node) {
  }
  visitNonWordBoundary(node) {
  }
  visitLookahead(node) {
  }
  visitNegativeLookahead(node) {
  }
  // atoms
  visitCharacter(node) {
  }
  visitSet(node) {
  }
  visitGroup(node) {
  }
  visitGroupBackReference(node) {
  }
  visitQuantifier(node) {
  }
};

// ../../node_modules/chevrotain/lib/src/scan/reg_exp_parser.js
var regExpAstCache = {};
var regExpParser = new RegExpParser();
function getRegExpAst(regExp) {
  const regExpStr = regExp.toString();
  if (regExpAstCache.hasOwnProperty(regExpStr)) {
    return regExpAstCache[regExpStr];
  } else {
    const regExpAst = regExpParser.pattern(regExpStr);
    regExpAstCache[regExpStr] = regExpAst;
    return regExpAst;
  }
}
function clearRegExpParserCache() {
  regExpAstCache = {};
}

// ../../node_modules/chevrotain/lib/src/scan/reg_exp.js
var complementErrorMessage = "Complement Sets are not supported for first char optimization";
var failedOptimizationPrefixMsg = 'Unable to use "first char" lexer optimizations:\n';
function getOptimizedStartCodesIndices(regExp, ensureOptimizations = false) {
  try {
    const ast = getRegExpAst(regExp);
    const firstChars = firstCharOptimizedIndices(ast.value, {}, ast.flags.ignoreCase);
    return firstChars;
  } catch (e) {
    if (e.message === complementErrorMessage) {
      if (ensureOptimizations) {
        PRINT_WARNING(`${failedOptimizationPrefixMsg}	Unable to optimize: < ${regExp.toString()} >
	Complement Sets cannot be automatically optimized.
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#COMPLEMENT for details.`);
      }
    } else {
      let msgSuffix = "";
      if (ensureOptimizations) {
        msgSuffix = "\n	This will disable the lexer's first char optimizations.\n	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#REGEXP_PARSING for details.";
      }
      PRINT_ERROR(`${failedOptimizationPrefixMsg}
	Failed parsing: < ${regExp.toString()} >
	Using the @chevrotain/regexp-to-ast library
	Please open an issue at: https://github.com/chevrotain/chevrotain/issues` + msgSuffix);
    }
  }
  return [];
}
function firstCharOptimizedIndices(ast, result, ignoreCase) {
  switch (ast.type) {
    case "Disjunction":
      for (let i = 0; i < ast.value.length; i++) {
        firstCharOptimizedIndices(ast.value[i], result, ignoreCase);
      }
      break;
    case "Alternative":
      const terms = ast.value;
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        switch (term.type) {
          case "EndAnchor":
          // A group back reference cannot affect potential starting char.
          // because if a back reference is the first production than automatically
          // the group being referenced has had to come BEFORE so its codes have already been added
          case "GroupBackReference":
          // assertions do not affect potential starting codes
          case "Lookahead":
          case "NegativeLookahead":
          case "StartAnchor":
          case "WordBoundary":
          case "NonWordBoundary":
            continue;
        }
        const atom2 = term;
        switch (atom2.type) {
          case "Character":
            addOptimizedIdxToResult(atom2.value, result, ignoreCase);
            break;
          case "Set":
            if (atom2.complement === true) {
              throw Error(complementErrorMessage);
            }
            forEach_default(atom2.value, (code) => {
              if (typeof code === "number") {
                addOptimizedIdxToResult(code, result, ignoreCase);
              } else {
                const range = code;
                if (ignoreCase === true) {
                  for (let rangeCode = range.from; rangeCode <= range.to; rangeCode++) {
                    addOptimizedIdxToResult(rangeCode, result, ignoreCase);
                  }
                } else {
                  for (let rangeCode = range.from; rangeCode <= range.to && rangeCode < minOptimizationVal; rangeCode++) {
                    addOptimizedIdxToResult(rangeCode, result, ignoreCase);
                  }
                  if (range.to >= minOptimizationVal) {
                    const minUnOptVal = range.from >= minOptimizationVal ? range.from : minOptimizationVal;
                    const maxUnOptVal = range.to;
                    const minOptIdx = charCodeToOptimizedIndex(minUnOptVal);
                    const maxOptIdx = charCodeToOptimizedIndex(maxUnOptVal);
                    for (let currOptIdx = minOptIdx; currOptIdx <= maxOptIdx; currOptIdx++) {
                      result[currOptIdx] = currOptIdx;
                    }
                  }
                }
              }
            });
            break;
          case "Group":
            firstCharOptimizedIndices(atom2.value, result, ignoreCase);
            break;
          /* istanbul ignore next */
          default:
            throw Error("Non Exhaustive Match");
        }
        const isOptionalQuantifier = atom2.quantifier !== void 0 && atom2.quantifier.atLeast === 0;
        if (
          // A group may be optional due to empty contents /(?:)/
          // or if everything inside it is optional /((a)?)/
          atom2.type === "Group" && isWholeOptional(atom2) === false || // If this term is not a group it may only be optional if it has an optional quantifier
          atom2.type !== "Group" && isOptionalQuantifier === false
        ) {
          break;
        }
      }
      break;
    /* istanbul ignore next */
    default:
      throw Error("non exhaustive match!");
  }
  return values_default(result);
}
function addOptimizedIdxToResult(code, result, ignoreCase) {
  const optimizedCharIdx = charCodeToOptimizedIndex(code);
  result[optimizedCharIdx] = optimizedCharIdx;
  if (ignoreCase === true) {
    handleIgnoreCase(code, result);
  }
}
function handleIgnoreCase(code, result) {
  const char = String.fromCharCode(code);
  const upperChar = char.toUpperCase();
  if (upperChar !== char) {
    const optimizedCharIdx = charCodeToOptimizedIndex(upperChar.charCodeAt(0));
    result[optimizedCharIdx] = optimizedCharIdx;
  } else {
    const lowerChar = char.toLowerCase();
    if (lowerChar !== char) {
      const optimizedCharIdx = charCodeToOptimizedIndex(lowerChar.charCodeAt(0));
      result[optimizedCharIdx] = optimizedCharIdx;
    }
  }
}
function findCode(setNode, targetCharCodes) {
  return find_default(setNode.value, (codeOrRange) => {
    if (typeof codeOrRange === "number") {
      return includes_default(targetCharCodes, codeOrRange);
    } else {
      const range = codeOrRange;
      return find_default(targetCharCodes, (targetCode) => range.from <= targetCode && targetCode <= range.to) !== void 0;
    }
  });
}
function isWholeOptional(ast) {
  const quantifier = ast.quantifier;
  if (quantifier && quantifier.atLeast === 0) {
    return true;
  }
  if (!ast.value) {
    return false;
  }
  return isArray_default(ast.value) ? every_default(ast.value, isWholeOptional) : isWholeOptional(ast.value);
}
var CharCodeFinder = class extends BaseRegExpVisitor {
  constructor(targetCharCodes) {
    super();
    this.targetCharCodes = targetCharCodes;
    this.found = false;
  }
  visitChildren(node) {
    if (this.found === true) {
      return;
    }
    switch (node.type) {
      case "Lookahead":
        this.visitLookahead(node);
        return;
      case "NegativeLookahead":
        this.visitNegativeLookahead(node);
        return;
    }
    super.visitChildren(node);
  }
  visitCharacter(node) {
    if (includes_default(this.targetCharCodes, node.value)) {
      this.found = true;
    }
  }
  visitSet(node) {
    if (node.complement) {
      if (findCode(node, this.targetCharCodes) === void 0) {
        this.found = true;
      }
    } else {
      if (findCode(node, this.targetCharCodes) !== void 0) {
        this.found = true;
      }
    }
  }
};
function canMatchCharCode(charCodes, pattern) {
  if (pattern instanceof RegExp) {
    const ast = getRegExpAst(pattern);
    const charCodeFinder = new CharCodeFinder(charCodes);
    charCodeFinder.visit(ast);
    return charCodeFinder.found;
  } else {
    return find_default(pattern, (char) => {
      return includes_default(charCodes, char.charCodeAt(0));
    }) !== void 0;
  }
}

// ../../node_modules/chevrotain/lib/src/scan/lexer.js
var PATTERN = "PATTERN";
var DEFAULT_MODE = "defaultMode";
var MODES = "modes";
var SUPPORT_STICKY = typeof new RegExp("(?:)").sticky === "boolean";
function analyzeTokenTypes(tokenTypes, options) {
  options = defaults_default(options, {
    useSticky: SUPPORT_STICKY,
    debug: false,
    safeMode: false,
    positionTracking: "full",
    lineTerminatorCharacters: ["\r", "\n"],
    tracer: (msg, action) => action()
  });
  const tracer = options.tracer;
  tracer("initCharCodeToOptimizedIndexMap", () => {
    initCharCodeToOptimizedIndexMap();
  });
  let onlyRelevantTypes;
  tracer("Reject Lexer.NA", () => {
    onlyRelevantTypes = reject_default(tokenTypes, (currType) => {
      return currType[PATTERN] === Lexer.NA;
    });
  });
  let hasCustom = false;
  let allTransformedPatterns;
  tracer("Transform Patterns", () => {
    hasCustom = false;
    allTransformedPatterns = map_default(onlyRelevantTypes, (currType) => {
      const currPattern = currType[PATTERN];
      if (isRegExp_default(currPattern)) {
        const regExpSource = currPattern.source;
        if (regExpSource.length === 1 && // only these regExp meta characters which can appear in a length one regExp
        regExpSource !== "^" && regExpSource !== "$" && regExpSource !== "." && !currPattern.ignoreCase) {
          return regExpSource;
        } else if (regExpSource.length === 2 && regExpSource[0] === "\\" && // not a meta character
        !includes_default([
          "d",
          "D",
          "s",
          "S",
          "t",
          "r",
          "n",
          "t",
          "0",
          "c",
          "b",
          "B",
          "f",
          "v",
          "w",
          "W"
        ], regExpSource[1])) {
          return regExpSource[1];
        } else {
          return options.useSticky ? addStickyFlag(currPattern) : addStartOfInput(currPattern);
        }
      } else if (isFunction_default(currPattern)) {
        hasCustom = true;
        return { exec: currPattern };
      } else if (typeof currPattern === "object") {
        hasCustom = true;
        return currPattern;
      } else if (typeof currPattern === "string") {
        if (currPattern.length === 1) {
          return currPattern;
        } else {
          const escapedRegExpString = currPattern.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
          const wrappedRegExp = new RegExp(escapedRegExpString);
          return options.useSticky ? addStickyFlag(wrappedRegExp) : addStartOfInput(wrappedRegExp);
        }
      } else {
        throw Error("non exhaustive match");
      }
    });
  });
  let patternIdxToType;
  let patternIdxToGroup;
  let patternIdxToLongerAltIdxArr;
  let patternIdxToPushMode;
  let patternIdxToPopMode;
  tracer("misc mapping", () => {
    patternIdxToType = map_default(onlyRelevantTypes, (currType) => currType.tokenTypeIdx);
    patternIdxToGroup = map_default(onlyRelevantTypes, (clazz) => {
      const groupName = clazz.GROUP;
      if (groupName === Lexer.SKIPPED) {
        return void 0;
      } else if (isString_default(groupName)) {
        return groupName;
      } else if (isUndefined_default(groupName)) {
        return false;
      } else {
        throw Error("non exhaustive match");
      }
    });
    patternIdxToLongerAltIdxArr = map_default(onlyRelevantTypes, (clazz) => {
      const longerAltType = clazz.LONGER_ALT;
      if (longerAltType) {
        const longerAltIdxArr = isArray_default(longerAltType) ? map_default(longerAltType, (type) => indexOf_default(onlyRelevantTypes, type)) : [indexOf_default(onlyRelevantTypes, longerAltType)];
        return longerAltIdxArr;
      }
    });
    patternIdxToPushMode = map_default(onlyRelevantTypes, (clazz) => clazz.PUSH_MODE);
    patternIdxToPopMode = map_default(onlyRelevantTypes, (clazz) => has_default(clazz, "POP_MODE"));
  });
  let patternIdxToCanLineTerminator;
  tracer("Line Terminator Handling", () => {
    const lineTerminatorCharCodes = getCharCodes(options.lineTerminatorCharacters);
    patternIdxToCanLineTerminator = map_default(onlyRelevantTypes, (tokType) => false);
    if (options.positionTracking !== "onlyOffset") {
      patternIdxToCanLineTerminator = map_default(onlyRelevantTypes, (tokType) => {
        if (has_default(tokType, "LINE_BREAKS")) {
          return !!tokType.LINE_BREAKS;
        } else {
          return checkLineBreaksIssues(tokType, lineTerminatorCharCodes) === false && canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN);
        }
      });
    }
  });
  let patternIdxToIsCustom;
  let patternIdxToShort;
  let emptyGroups;
  let patternIdxToConfig;
  tracer("Misc Mapping #2", () => {
    patternIdxToIsCustom = map_default(onlyRelevantTypes, isCustomPattern);
    patternIdxToShort = map_default(allTransformedPatterns, isShortPattern);
    emptyGroups = reduce_default(onlyRelevantTypes, (acc, clazz) => {
      const groupName = clazz.GROUP;
      if (isString_default(groupName) && !(groupName === Lexer.SKIPPED)) {
        acc[groupName] = [];
      }
      return acc;
    }, {});
    patternIdxToConfig = map_default(allTransformedPatterns, (x, idx) => {
      return {
        pattern: allTransformedPatterns[idx],
        longerAlt: patternIdxToLongerAltIdxArr[idx],
        canLineTerminator: patternIdxToCanLineTerminator[idx],
        isCustom: patternIdxToIsCustom[idx],
        short: patternIdxToShort[idx],
        group: patternIdxToGroup[idx],
        push: patternIdxToPushMode[idx],
        pop: patternIdxToPopMode[idx],
        tokenTypeIdx: patternIdxToType[idx],
        tokenType: onlyRelevantTypes[idx]
      };
    });
  });
  let canBeOptimized = true;
  let charCodeToPatternIdxToConfig = [];
  if (!options.safeMode) {
    tracer("First Char Optimization", () => {
      charCodeToPatternIdxToConfig = reduce_default(onlyRelevantTypes, (result, currTokType, idx) => {
        if (typeof currTokType.PATTERN === "string") {
          const charCode = currTokType.PATTERN.charCodeAt(0);
          const optimizedIdx = charCodeToOptimizedIndex(charCode);
          addToMapOfArrays(result, optimizedIdx, patternIdxToConfig[idx]);
        } else if (isArray_default(currTokType.START_CHARS_HINT)) {
          let lastOptimizedIdx;
          forEach_default(currTokType.START_CHARS_HINT, (charOrInt) => {
            const charCode = typeof charOrInt === "string" ? charOrInt.charCodeAt(0) : charOrInt;
            const currOptimizedIdx = charCodeToOptimizedIndex(charCode);
            if (lastOptimizedIdx !== currOptimizedIdx) {
              lastOptimizedIdx = currOptimizedIdx;
              addToMapOfArrays(result, currOptimizedIdx, patternIdxToConfig[idx]);
            }
          });
        } else if (isRegExp_default(currTokType.PATTERN)) {
          if (currTokType.PATTERN.unicode) {
            canBeOptimized = false;
            if (options.ensureOptimizations) {
              PRINT_ERROR(`${failedOptimizationPrefixMsg}	Unable to analyze < ${currTokType.PATTERN.toString()} > pattern.
	The regexp unicode flag is not currently supported by the regexp-to-ast library.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNICODE_OPTIMIZE`);
            }
          } else {
            const optimizedCodes = getOptimizedStartCodesIndices(currTokType.PATTERN, options.ensureOptimizations);
            if (isEmpty_default(optimizedCodes)) {
              canBeOptimized = false;
            }
            forEach_default(optimizedCodes, (code) => {
              addToMapOfArrays(result, code, patternIdxToConfig[idx]);
            });
          }
        } else {
          if (options.ensureOptimizations) {
            PRINT_ERROR(`${failedOptimizationPrefixMsg}	TokenType: <${currTokType.name}> is using a custom token pattern without providing <start_chars_hint> parameter.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE`);
          }
          canBeOptimized = false;
        }
        return result;
      }, []);
    });
  }
  return {
    emptyGroups,
    patternIdxToConfig,
    charCodeToPatternIdxToConfig,
    hasCustom,
    canBeOptimized
  };
}
function validatePatterns(tokenTypes, validModesNames) {
  let errors = [];
  const missingResult = findMissingPatterns(tokenTypes);
  errors = errors.concat(missingResult.errors);
  const invalidResult = findInvalidPatterns(missingResult.valid);
  const validTokenTypes = invalidResult.valid;
  errors = errors.concat(invalidResult.errors);
  errors = errors.concat(validateRegExpPattern(validTokenTypes));
  errors = errors.concat(findInvalidGroupType(validTokenTypes));
  errors = errors.concat(findModesThatDoNotExist(validTokenTypes, validModesNames));
  errors = errors.concat(findUnreachablePatterns(validTokenTypes));
  return errors;
}
function validateRegExpPattern(tokenTypes) {
  let errors = [];
  const withRegExpPatterns = filter_default(tokenTypes, (currTokType) => isRegExp_default(currTokType[PATTERN]));
  errors = errors.concat(findEndOfInputAnchor(withRegExpPatterns));
  errors = errors.concat(findStartOfInputAnchor(withRegExpPatterns));
  errors = errors.concat(findUnsupportedFlags(withRegExpPatterns));
  errors = errors.concat(findDuplicatePatterns(withRegExpPatterns));
  errors = errors.concat(findEmptyMatchRegExps(withRegExpPatterns));
  return errors;
}
function findMissingPatterns(tokenTypes) {
  const tokenTypesWithMissingPattern = filter_default(tokenTypes, (currType) => {
    return !has_default(currType, PATTERN);
  });
  const errors = map_default(tokenTypesWithMissingPattern, (currType) => {
    return {
      message: "Token Type: ->" + currType.name + "<- missing static 'PATTERN' property",
      type: LexerDefinitionErrorType.MISSING_PATTERN,
      tokenTypes: [currType]
    };
  });
  const valid = difference_default(tokenTypes, tokenTypesWithMissingPattern);
  return { errors, valid };
}
function findInvalidPatterns(tokenTypes) {
  const tokenTypesWithInvalidPattern = filter_default(tokenTypes, (currType) => {
    const pattern = currType[PATTERN];
    return !isRegExp_default(pattern) && !isFunction_default(pattern) && !has_default(pattern, "exec") && !isString_default(pattern);
  });
  const errors = map_default(tokenTypesWithInvalidPattern, (currType) => {
    return {
      message: "Token Type: ->" + currType.name + "<- static 'PATTERN' can only be a RegExp, a Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.",
      type: LexerDefinitionErrorType.INVALID_PATTERN,
      tokenTypes: [currType]
    };
  });
  const valid = difference_default(tokenTypes, tokenTypesWithInvalidPattern);
  return { errors, valid };
}
var end_of_input = /[^\\][$]/;
function findEndOfInputAnchor(tokenTypes) {
  class EndAnchorFinder extends BaseRegExpVisitor {
    constructor() {
      super(...arguments);
      this.found = false;
    }
    visitEndAnchor(node) {
      this.found = true;
    }
  }
  const invalidRegex = filter_default(tokenTypes, (currType) => {
    const pattern = currType.PATTERN;
    try {
      const regexpAst = getRegExpAst(pattern);
      const endAnchorVisitor = new EndAnchorFinder();
      endAnchorVisitor.visit(regexpAst);
      return endAnchorVisitor.found;
    } catch (e) {
      return end_of_input.test(pattern.source);
    }
  });
  const errors = map_default(invalidRegex, (currType) => {
    return {
      message: "Unexpected RegExp Anchor Error:\n	Token Type: ->" + currType.name + "<- static 'PATTERN' cannot contain end of input anchor '$'\n	See chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.",
      type: LexerDefinitionErrorType.EOI_ANCHOR_FOUND,
      tokenTypes: [currType]
    };
  });
  return errors;
}
function findEmptyMatchRegExps(tokenTypes) {
  const matchesEmptyString = filter_default(tokenTypes, (currType) => {
    const pattern = currType.PATTERN;
    return pattern.test("");
  });
  const errors = map_default(matchesEmptyString, (currType) => {
    return {
      message: "Token Type: ->" + currType.name + "<- static 'PATTERN' must not match an empty string",
      type: LexerDefinitionErrorType.EMPTY_MATCH_PATTERN,
      tokenTypes: [currType]
    };
  });
  return errors;
}
var start_of_input = /[^\\[][\^]|^\^/;
function findStartOfInputAnchor(tokenTypes) {
  class StartAnchorFinder extends BaseRegExpVisitor {
    constructor() {
      super(...arguments);
      this.found = false;
    }
    visitStartAnchor(node) {
      this.found = true;
    }
  }
  const invalidRegex = filter_default(tokenTypes, (currType) => {
    const pattern = currType.PATTERN;
    try {
      const regexpAst = getRegExpAst(pattern);
      const startAnchorVisitor = new StartAnchorFinder();
      startAnchorVisitor.visit(regexpAst);
      return startAnchorVisitor.found;
    } catch (e) {
      return start_of_input.test(pattern.source);
    }
  });
  const errors = map_default(invalidRegex, (currType) => {
    return {
      message: "Unexpected RegExp Anchor Error:\n	Token Type: ->" + currType.name + "<- static 'PATTERN' cannot contain start of input anchor '^'\n	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.",
      type: LexerDefinitionErrorType.SOI_ANCHOR_FOUND,
      tokenTypes: [currType]
    };
  });
  return errors;
}
function findUnsupportedFlags(tokenTypes) {
  const invalidFlags = filter_default(tokenTypes, (currType) => {
    const pattern = currType[PATTERN];
    return pattern instanceof RegExp && (pattern.multiline || pattern.global);
  });
  const errors = map_default(invalidFlags, (currType) => {
    return {
      message: "Token Type: ->" + currType.name + "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
      type: LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND,
      tokenTypes: [currType]
    };
  });
  return errors;
}
function findDuplicatePatterns(tokenTypes) {
  const found = [];
  let identicalPatterns = map_default(tokenTypes, (outerType) => {
    return reduce_default(tokenTypes, (result, innerType) => {
      if (outerType.PATTERN.source === innerType.PATTERN.source && !includes_default(found, innerType) && innerType.PATTERN !== Lexer.NA) {
        found.push(innerType);
        result.push(innerType);
        return result;
      }
      return result;
    }, []);
  });
  identicalPatterns = compact_default(identicalPatterns);
  const duplicatePatterns = filter_default(identicalPatterns, (currIdenticalSet) => {
    return currIdenticalSet.length > 1;
  });
  const errors = map_default(duplicatePatterns, (setOfIdentical) => {
    const tokenTypeNames = map_default(setOfIdentical, (currType) => {
      return currType.name;
    });
    const dupPatternSrc = head_default(setOfIdentical).PATTERN;
    return {
      message: `The same RegExp pattern ->${dupPatternSrc}<-has been used in all of the following Token Types: ${tokenTypeNames.join(", ")} <-`,
      type: LexerDefinitionErrorType.DUPLICATE_PATTERNS_FOUND,
      tokenTypes: setOfIdentical
    };
  });
  return errors;
}
function findInvalidGroupType(tokenTypes) {
  const invalidTypes = filter_default(tokenTypes, (clazz) => {
    if (!has_default(clazz, "GROUP")) {
      return false;
    }
    const group = clazz.GROUP;
    return group !== Lexer.SKIPPED && group !== Lexer.NA && !isString_default(group);
  });
  const errors = map_default(invalidTypes, (currType) => {
    return {
      message: "Token Type: ->" + currType.name + "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
      type: LexerDefinitionErrorType.INVALID_GROUP_TYPE_FOUND,
      tokenTypes: [currType]
    };
  });
  return errors;
}
function findModesThatDoNotExist(tokenTypes, validModes) {
  const invalidModes = filter_default(tokenTypes, (clazz) => {
    return clazz.PUSH_MODE !== void 0 && !includes_default(validModes, clazz.PUSH_MODE);
  });
  const errors = map_default(invalidModes, (tokType) => {
    const msg = `Token Type: ->${tokType.name}<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->${tokType.PUSH_MODE}<-which does not exist`;
    return {
      message: msg,
      type: LexerDefinitionErrorType.PUSH_MODE_DOES_NOT_EXIST,
      tokenTypes: [tokType]
    };
  });
  return errors;
}
function findUnreachablePatterns(tokenTypes) {
  const errors = [];
  const canBeTested = reduce_default(tokenTypes, (result, tokType, idx) => {
    const pattern = tokType.PATTERN;
    if (pattern === Lexer.NA) {
      return result;
    }
    if (isString_default(pattern)) {
      result.push({ str: pattern, idx, tokenType: tokType });
    } else if (isRegExp_default(pattern) && noMetaChar(pattern)) {
      result.push({ str: pattern.source, idx, tokenType: tokType });
    }
    return result;
  }, []);
  forEach_default(tokenTypes, (tokType, testIdx) => {
    forEach_default(canBeTested, ({ str, idx, tokenType }) => {
      if (testIdx < idx && testTokenType(str, tokType.PATTERN)) {
        const msg = `Token: ->${tokenType.name}<- can never be matched.
Because it appears AFTER the Token Type ->${tokType.name}<-in the lexer's definition.
See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE`;
        errors.push({
          message: msg,
          type: LexerDefinitionErrorType.UNREACHABLE_PATTERN,
          tokenTypes: [tokType, tokenType]
        });
      }
    });
  });
  return errors;
}
function testTokenType(str, pattern) {
  if (isRegExp_default(pattern)) {
    const regExpArray = pattern.exec(str);
    return regExpArray !== null && regExpArray.index === 0;
  } else if (isFunction_default(pattern)) {
    return pattern(str, 0, [], {});
  } else if (has_default(pattern, "exec")) {
    return pattern.exec(str, 0, [], {});
  } else if (typeof pattern === "string") {
    return pattern === str;
  } else {
    throw Error("non exhaustive match");
  }
}
function noMetaChar(regExp) {
  const metaChars = [
    ".",
    "\\",
    "[",
    "]",
    "|",
    "^",
    "$",
    "(",
    ")",
    "?",
    "*",
    "+",
    "{"
  ];
  return find_default(metaChars, (char) => regExp.source.indexOf(char) !== -1) === void 0;
}
function addStartOfInput(pattern) {
  const flags = pattern.ignoreCase ? "i" : "";
  return new RegExp(`^(?:${pattern.source})`, flags);
}
function addStickyFlag(pattern) {
  const flags = pattern.ignoreCase ? "iy" : "y";
  return new RegExp(`${pattern.source}`, flags);
}
function performRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
  const errors = [];
  if (!has_default(lexerDefinition, DEFAULT_MODE)) {
    errors.push({
      message: "A MultiMode Lexer cannot be initialized without a <" + DEFAULT_MODE + "> property in its definition\n",
      type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE
    });
  }
  if (!has_default(lexerDefinition, MODES)) {
    errors.push({
      message: "A MultiMode Lexer cannot be initialized without a <" + MODES + "> property in its definition\n",
      type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY
    });
  }
  if (has_default(lexerDefinition, MODES) && has_default(lexerDefinition, DEFAULT_MODE) && !has_default(lexerDefinition.modes, lexerDefinition.defaultMode)) {
    errors.push({
      message: `A MultiMode Lexer cannot be initialized with a ${DEFAULT_MODE}: <${lexerDefinition.defaultMode}>which does not exist
`,
      type: LexerDefinitionErrorType.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST
    });
  }
  if (has_default(lexerDefinition, MODES)) {
    forEach_default(lexerDefinition.modes, (currModeValue, currModeName) => {
      forEach_default(currModeValue, (currTokType, currIdx) => {
        if (isUndefined_default(currTokType)) {
          errors.push({
            message: `A Lexer cannot be initialized using an undefined Token Type. Mode:<${currModeName}> at index: <${currIdx}>
`,
            type: LexerDefinitionErrorType.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED
          });
        } else if (has_default(currTokType, "LONGER_ALT")) {
          const longerAlt = isArray_default(currTokType.LONGER_ALT) ? currTokType.LONGER_ALT : [currTokType.LONGER_ALT];
          forEach_default(longerAlt, (currLongerAlt) => {
            if (!isUndefined_default(currLongerAlt) && !includes_default(currModeValue, currLongerAlt)) {
              errors.push({
                message: `A MultiMode Lexer cannot be initialized with a longer_alt <${currLongerAlt.name}> on token <${currTokType.name}> outside of mode <${currModeName}>
`,
                type: LexerDefinitionErrorType.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE
              });
            }
          });
        }
      });
    });
  }
  return errors;
}
function performWarningRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
  const warnings = [];
  let hasAnyLineBreak = false;
  const allTokenTypes = compact_default(flatten_default(values_default(lexerDefinition.modes)));
  const concreteTokenTypes = reject_default(allTokenTypes, (currType) => currType[PATTERN] === Lexer.NA);
  const terminatorCharCodes = getCharCodes(lineTerminatorCharacters);
  if (trackLines) {
    forEach_default(concreteTokenTypes, (tokType) => {
      const currIssue = checkLineBreaksIssues(tokType, terminatorCharCodes);
      if (currIssue !== false) {
        const message = buildLineBreakIssueMessage(tokType, currIssue);
        const warningDescriptor = {
          message,
          type: currIssue.issue,
          tokenType: tokType
        };
        warnings.push(warningDescriptor);
      } else {
        if (has_default(tokType, "LINE_BREAKS")) {
          if (tokType.LINE_BREAKS === true) {
            hasAnyLineBreak = true;
          }
        } else {
          if (canMatchCharCode(terminatorCharCodes, tokType.PATTERN)) {
            hasAnyLineBreak = true;
          }
        }
      }
    });
  }
  if (trackLines && !hasAnyLineBreak) {
    warnings.push({
      message: "Warning: No LINE_BREAKS Found.\n	This Lexer has been defined to track line and column information,\n	But none of the Token Types can be identified as matching a line terminator.\n	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#LINE_BREAKS \n	for details.",
      type: LexerDefinitionErrorType.NO_LINE_BREAKS_FLAGS
    });
  }
  return warnings;
}
function cloneEmptyGroups(emptyGroups) {
  const clonedResult = {};
  const groupKeys = keys_default(emptyGroups);
  forEach_default(groupKeys, (currKey) => {
    const currGroupValue = emptyGroups[currKey];
    if (isArray_default(currGroupValue)) {
      clonedResult[currKey] = [];
    } else {
      throw Error("non exhaustive match");
    }
  });
  return clonedResult;
}
function isCustomPattern(tokenType) {
  const pattern = tokenType.PATTERN;
  if (isRegExp_default(pattern)) {
    return false;
  } else if (isFunction_default(pattern)) {
    return true;
  } else if (has_default(pattern, "exec")) {
    return true;
  } else if (isString_default(pattern)) {
    return false;
  } else {
    throw Error("non exhaustive match");
  }
}
function isShortPattern(pattern) {
  if (isString_default(pattern) && pattern.length === 1) {
    return pattern.charCodeAt(0);
  } else {
    return false;
  }
}
var LineTerminatorOptimizedTester = {
  // implements /\n|\r\n?/g.test
  test: function(text) {
    const len = text.length;
    for (let i = this.lastIndex; i < len; i++) {
      const c = text.charCodeAt(i);
      if (c === 10) {
        this.lastIndex = i + 1;
        return true;
      } else if (c === 13) {
        if (text.charCodeAt(i + 1) === 10) {
          this.lastIndex = i + 2;
        } else {
          this.lastIndex = i + 1;
        }
        return true;
      }
    }
    return false;
  },
  lastIndex: 0
};
function checkLineBreaksIssues(tokType, lineTerminatorCharCodes) {
  if (has_default(tokType, "LINE_BREAKS")) {
    return false;
  } else {
    if (isRegExp_default(tokType.PATTERN)) {
      try {
        canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN);
      } catch (e) {
        return {
          issue: LexerDefinitionErrorType.IDENTIFY_TERMINATOR,
          errMsg: e.message
        };
      }
      return false;
    } else if (isString_default(tokType.PATTERN)) {
      return false;
    } else if (isCustomPattern(tokType)) {
      return { issue: LexerDefinitionErrorType.CUSTOM_LINE_BREAK };
    } else {
      throw Error("non exhaustive match");
    }
  }
}
function buildLineBreakIssueMessage(tokType, details) {
  if (details.issue === LexerDefinitionErrorType.IDENTIFY_TERMINATOR) {
    return `Warning: unable to identify line terminator usage in pattern.
	The problem is in the <${tokType.name}> Token Type
	 Root cause: ${details.errMsg}.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#IDENTIFY_TERMINATOR`;
  } else if (details.issue === LexerDefinitionErrorType.CUSTOM_LINE_BREAK) {
    return `Warning: A Custom Token Pattern should specify the <line_breaks> option.
	The problem is in the <${tokType.name}> Token Type
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_LINE_BREAK`;
  } else {
    throw Error("non exhaustive match");
  }
}
function getCharCodes(charsOrCodes) {
  const charCodes = map_default(charsOrCodes, (numOrString) => {
    if (isString_default(numOrString)) {
      return numOrString.charCodeAt(0);
    } else {
      return numOrString;
    }
  });
  return charCodes;
}
function addToMapOfArrays(map2, key, value) {
  if (map2[key] === void 0) {
    map2[key] = [value];
  } else {
    map2[key].push(value);
  }
}
var minOptimizationVal = 256;
var charCodeToOptimizedIdxMap = [];
function charCodeToOptimizedIndex(charCode) {
  return charCode < minOptimizationVal ? charCode : charCodeToOptimizedIdxMap[charCode];
}
function initCharCodeToOptimizedIndexMap() {
  if (isEmpty_default(charCodeToOptimizedIdxMap)) {
    charCodeToOptimizedIdxMap = new Array(65536);
    for (let i = 0; i < 65536; i++) {
      charCodeToOptimizedIdxMap[i] = i > 255 ? 255 + ~~(i / 255) : i;
    }
  }
}

// ../../node_modules/chevrotain/lib/src/scan/tokens.js
function tokenStructuredMatcher(tokInstance, tokConstructor) {
  const instanceType = tokInstance.tokenTypeIdx;
  if (instanceType === tokConstructor.tokenTypeIdx) {
    return true;
  } else {
    return tokConstructor.isParent === true && tokConstructor.categoryMatchesMap[instanceType] === true;
  }
}
function tokenStructuredMatcherNoCategories(token, tokType) {
  return token.tokenTypeIdx === tokType.tokenTypeIdx;
}
var tokenShortNameIdx = 1;
var tokenIdxToClass = {};
function augmentTokenTypes(tokenTypes) {
  const tokenTypesAndParents = expandCategories(tokenTypes);
  assignTokenDefaultProps(tokenTypesAndParents);
  assignCategoriesMapProp(tokenTypesAndParents);
  assignCategoriesTokensProp(tokenTypesAndParents);
  forEach_default(tokenTypesAndParents, (tokType) => {
    tokType.isParent = tokType.categoryMatches.length > 0;
  });
}
function expandCategories(tokenTypes) {
  let result = clone_default(tokenTypes);
  let categories = tokenTypes;
  let searching = true;
  while (searching) {
    categories = compact_default(flatten_default(map_default(categories, (currTokType) => currTokType.CATEGORIES)));
    const newCategories = difference_default(categories, result);
    result = result.concat(newCategories);
    if (isEmpty_default(newCategories)) {
      searching = false;
    } else {
      categories = newCategories;
    }
  }
  return result;
}
function assignTokenDefaultProps(tokenTypes) {
  forEach_default(tokenTypes, (currTokType) => {
    if (!hasShortKeyProperty(currTokType)) {
      tokenIdxToClass[tokenShortNameIdx] = currTokType;
      currTokType.tokenTypeIdx = tokenShortNameIdx++;
    }
    if (hasCategoriesProperty(currTokType) && !isArray_default(currTokType.CATEGORIES)) {
      currTokType.CATEGORIES = [currTokType.CATEGORIES];
    }
    if (!hasCategoriesProperty(currTokType)) {
      currTokType.CATEGORIES = [];
    }
    if (!hasExtendingTokensTypesProperty(currTokType)) {
      currTokType.categoryMatches = [];
    }
    if (!hasExtendingTokensTypesMapProperty(currTokType)) {
      currTokType.categoryMatchesMap = {};
    }
  });
}
function assignCategoriesTokensProp(tokenTypes) {
  forEach_default(tokenTypes, (currTokType) => {
    currTokType.categoryMatches = [];
    forEach_default(currTokType.categoryMatchesMap, (val, key) => {
      currTokType.categoryMatches.push(tokenIdxToClass[key].tokenTypeIdx);
    });
  });
}
function assignCategoriesMapProp(tokenTypes) {
  forEach_default(tokenTypes, (currTokType) => {
    singleAssignCategoriesToksMap([], currTokType);
  });
}
function singleAssignCategoriesToksMap(path8, nextNode) {
  forEach_default(path8, (pathNode) => {
    nextNode.categoryMatchesMap[pathNode.tokenTypeIdx] = true;
  });
  forEach_default(nextNode.CATEGORIES, (nextCategory) => {
    const newPath = path8.concat(nextNode);
    if (!includes_default(newPath, nextCategory)) {
      singleAssignCategoriesToksMap(newPath, nextCategory);
    }
  });
}
function hasShortKeyProperty(tokType) {
  return has_default(tokType, "tokenTypeIdx");
}
function hasCategoriesProperty(tokType) {
  return has_default(tokType, "CATEGORIES");
}
function hasExtendingTokensTypesProperty(tokType) {
  return has_default(tokType, "categoryMatches");
}
function hasExtendingTokensTypesMapProperty(tokType) {
  return has_default(tokType, "categoryMatchesMap");
}
function isTokenType(tokType) {
  return has_default(tokType, "tokenTypeIdx");
}

// ../../node_modules/chevrotain/lib/src/scan/lexer_errors_public.js
var defaultLexerErrorProvider = {
  buildUnableToPopLexerModeMessage(token) {
    return `Unable to pop Lexer Mode after encountering Token ->${token.image}<- The Mode Stack is empty`;
  },
  buildUnexpectedCharactersMessage(fullText, startOffset, length, line, column) {
    return `unexpected character: ->${fullText.charAt(startOffset)}<- at offset: ${startOffset}, skipped ${length} characters.`;
  }
};

// ../../node_modules/chevrotain/lib/src/scan/lexer_public.js
var LexerDefinitionErrorType;
(function(LexerDefinitionErrorType2) {
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["MISSING_PATTERN"] = 0] = "MISSING_PATTERN";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["INVALID_PATTERN"] = 1] = "INVALID_PATTERN";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["EOI_ANCHOR_FOUND"] = 2] = "EOI_ANCHOR_FOUND";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["UNSUPPORTED_FLAGS_FOUND"] = 3] = "UNSUPPORTED_FLAGS_FOUND";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["DUPLICATE_PATTERNS_FOUND"] = 4] = "DUPLICATE_PATTERNS_FOUND";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["INVALID_GROUP_TYPE_FOUND"] = 5] = "INVALID_GROUP_TYPE_FOUND";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["PUSH_MODE_DOES_NOT_EXIST"] = 6] = "PUSH_MODE_DOES_NOT_EXIST";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE"] = 7] = "MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY"] = 8] = "MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST"] = 9] = "MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED"] = 10] = "LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["SOI_ANCHOR_FOUND"] = 11] = "SOI_ANCHOR_FOUND";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["EMPTY_MATCH_PATTERN"] = 12] = "EMPTY_MATCH_PATTERN";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["NO_LINE_BREAKS_FLAGS"] = 13] = "NO_LINE_BREAKS_FLAGS";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["UNREACHABLE_PATTERN"] = 14] = "UNREACHABLE_PATTERN";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["IDENTIFY_TERMINATOR"] = 15] = "IDENTIFY_TERMINATOR";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["CUSTOM_LINE_BREAK"] = 16] = "CUSTOM_LINE_BREAK";
  LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE"] = 17] = "MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE";
})(LexerDefinitionErrorType || (LexerDefinitionErrorType = {}));
var DEFAULT_LEXER_CONFIG = {
  deferDefinitionErrorsHandling: false,
  positionTracking: "full",
  lineTerminatorsPattern: /\n|\r\n?/g,
  lineTerminatorCharacters: ["\n", "\r"],
  ensureOptimizations: false,
  safeMode: false,
  errorMessageProvider: defaultLexerErrorProvider,
  traceInitPerf: false,
  skipValidations: false,
  recoveryEnabled: true
};
Object.freeze(DEFAULT_LEXER_CONFIG);
var Lexer = class {
  constructor(lexerDefinition, config = DEFAULT_LEXER_CONFIG) {
    this.lexerDefinition = lexerDefinition;
    this.lexerDefinitionErrors = [];
    this.lexerDefinitionWarning = [];
    this.patternIdxToConfig = {};
    this.charCodeToPatternIdxToConfig = {};
    this.modes = [];
    this.emptyGroups = {};
    this.trackStartLines = true;
    this.trackEndLines = true;
    this.hasCustom = false;
    this.canModeBeOptimized = {};
    this.TRACE_INIT = (phaseDesc, phaseImpl) => {
      if (this.traceInitPerf === true) {
        this.traceInitIndent++;
        const indent = new Array(this.traceInitIndent + 1).join("	");
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          console.log(`${indent}--> <${phaseDesc}>`);
        }
        const { time, value } = timer(phaseImpl);
        const traceMethod = time > 10 ? console.warn : console.log;
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`);
        }
        this.traceInitIndent--;
        return value;
      } else {
        return phaseImpl();
      }
    };
    if (typeof config === "boolean") {
      throw Error("The second argument to the Lexer constructor is now an ILexerConfig Object.\na boolean 2nd argument is no longer supported");
    }
    this.config = assign_default({}, DEFAULT_LEXER_CONFIG, config);
    const traceInitVal = this.config.traceInitPerf;
    if (traceInitVal === true) {
      this.traceInitMaxIdent = Infinity;
      this.traceInitPerf = true;
    } else if (typeof traceInitVal === "number") {
      this.traceInitMaxIdent = traceInitVal;
      this.traceInitPerf = true;
    }
    this.traceInitIndent = -1;
    this.TRACE_INIT("Lexer Constructor", () => {
      let actualDefinition;
      let hasOnlySingleMode = true;
      this.TRACE_INIT("Lexer Config handling", () => {
        if (this.config.lineTerminatorsPattern === DEFAULT_LEXER_CONFIG.lineTerminatorsPattern) {
          this.config.lineTerminatorsPattern = LineTerminatorOptimizedTester;
        } else {
          if (this.config.lineTerminatorCharacters === DEFAULT_LEXER_CONFIG.lineTerminatorCharacters) {
            throw Error("Error: Missing <lineTerminatorCharacters> property on the Lexer config.\n	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#MISSING_LINE_TERM_CHARS");
          }
        }
        if (config.safeMode && config.ensureOptimizations) {
          throw Error('"safeMode" and "ensureOptimizations" flags are mutually exclusive.');
        }
        this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking);
        this.trackEndLines = /full/i.test(this.config.positionTracking);
        if (isArray_default(lexerDefinition)) {
          actualDefinition = {
            modes: { defaultMode: clone_default(lexerDefinition) },
            defaultMode: DEFAULT_MODE
          };
        } else {
          hasOnlySingleMode = false;
          actualDefinition = clone_default(lexerDefinition);
        }
      });
      if (this.config.skipValidations === false) {
        this.TRACE_INIT("performRuntimeChecks", () => {
          this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(performRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters));
        });
        this.TRACE_INIT("performWarningRuntimeChecks", () => {
          this.lexerDefinitionWarning = this.lexerDefinitionWarning.concat(performWarningRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters));
        });
      }
      actualDefinition.modes = actualDefinition.modes ? actualDefinition.modes : {};
      forEach_default(actualDefinition.modes, (currModeValue, currModeName) => {
        actualDefinition.modes[currModeName] = reject_default(currModeValue, (currTokType) => isUndefined_default(currTokType));
      });
      const allModeNames = keys_default(actualDefinition.modes);
      forEach_default(actualDefinition.modes, (currModDef, currModName) => {
        this.TRACE_INIT(`Mode: <${currModName}> processing`, () => {
          this.modes.push(currModName);
          if (this.config.skipValidations === false) {
            this.TRACE_INIT(`validatePatterns`, () => {
              this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(validatePatterns(currModDef, allModeNames));
            });
          }
          if (isEmpty_default(this.lexerDefinitionErrors)) {
            augmentTokenTypes(currModDef);
            let currAnalyzeResult;
            this.TRACE_INIT(`analyzeTokenTypes`, () => {
              currAnalyzeResult = analyzeTokenTypes(currModDef, {
                lineTerminatorCharacters: this.config.lineTerminatorCharacters,
                positionTracking: config.positionTracking,
                ensureOptimizations: config.ensureOptimizations,
                safeMode: config.safeMode,
                tracer: this.TRACE_INIT
              });
            });
            this.patternIdxToConfig[currModName] = currAnalyzeResult.patternIdxToConfig;
            this.charCodeToPatternIdxToConfig[currModName] = currAnalyzeResult.charCodeToPatternIdxToConfig;
            this.emptyGroups = assign_default({}, this.emptyGroups, currAnalyzeResult.emptyGroups);
            this.hasCustom = currAnalyzeResult.hasCustom || this.hasCustom;
            this.canModeBeOptimized[currModName] = currAnalyzeResult.canBeOptimized;
          }
        });
      });
      this.defaultMode = actualDefinition.defaultMode;
      if (!isEmpty_default(this.lexerDefinitionErrors) && !this.config.deferDefinitionErrorsHandling) {
        const allErrMessages = map_default(this.lexerDefinitionErrors, (error) => {
          return error.message;
        });
        const allErrMessagesString = allErrMessages.join("-----------------------\n");
        throw new Error("Errors detected in definition of Lexer:\n" + allErrMessagesString);
      }
      forEach_default(this.lexerDefinitionWarning, (warningDescriptor) => {
        PRINT_WARNING(warningDescriptor.message);
      });
      this.TRACE_INIT("Choosing sub-methods implementations", () => {
        if (SUPPORT_STICKY) {
          this.chopInput = identity_default;
          this.match = this.matchWithTest;
        } else {
          this.updateLastIndex = noop_default;
          this.match = this.matchWithExec;
        }
        if (hasOnlySingleMode) {
          this.handleModes = noop_default;
        }
        if (this.trackStartLines === false) {
          this.computeNewColumn = identity_default;
        }
        if (this.trackEndLines === false) {
          this.updateTokenEndLineColumnLocation = noop_default;
        }
        if (/full/i.test(this.config.positionTracking)) {
          this.createTokenInstance = this.createFullToken;
        } else if (/onlyStart/i.test(this.config.positionTracking)) {
          this.createTokenInstance = this.createStartOnlyToken;
        } else if (/onlyOffset/i.test(this.config.positionTracking)) {
          this.createTokenInstance = this.createOffsetOnlyToken;
        } else {
          throw Error(`Invalid <positionTracking> config option: "${this.config.positionTracking}"`);
        }
        if (this.hasCustom) {
          this.addToken = this.addTokenUsingPush;
          this.handlePayload = this.handlePayloadWithCustom;
        } else {
          this.addToken = this.addTokenUsingMemberAccess;
          this.handlePayload = this.handlePayloadNoCustom;
        }
      });
      this.TRACE_INIT("Failed Optimization Warnings", () => {
        const unOptimizedModes = reduce_default(this.canModeBeOptimized, (cannotBeOptimized, canBeOptimized, modeName) => {
          if (canBeOptimized === false) {
            cannotBeOptimized.push(modeName);
          }
          return cannotBeOptimized;
        }, []);
        if (config.ensureOptimizations && !isEmpty_default(unOptimizedModes)) {
          throw Error(`Lexer Modes: < ${unOptimizedModes.join(", ")} > cannot be optimized.
	 Disable the "ensureOptimizations" lexer config flag to silently ignore this and run the lexer in an un-optimized mode.
	 Or inspect the console log for details on how to resolve these issues.`);
        }
      });
      this.TRACE_INIT("clearRegExpParserCache", () => {
        clearRegExpParserCache();
      });
      this.TRACE_INIT("toFastProperties", () => {
        toFastProperties(this);
      });
    });
  }
  tokenize(text, initialMode = this.defaultMode) {
    if (!isEmpty_default(this.lexerDefinitionErrors)) {
      const allErrMessages = map_default(this.lexerDefinitionErrors, (error) => {
        return error.message;
      });
      const allErrMessagesString = allErrMessages.join("-----------------------\n");
      throw new Error("Unable to Tokenize because Errors detected in definition of Lexer:\n" + allErrMessagesString);
    }
    return this.tokenizeInternal(text, initialMode);
  }
  // There is quite a bit of duplication between this and "tokenizeInternalLazy"
  // This is intentional due to performance considerations.
  // this method also used quite a bit of `!` none null assertions because it is too optimized
  // for `tsc` to always understand it is "safe"
  tokenizeInternal(text, initialMode) {
    let i, j, k, matchAltImage, longerAlt, matchedImage, payload, altPayload, imageLength, group, tokType, newToken, errLength, droppedChar, msg, match;
    const orgText = text;
    const orgLength = orgText.length;
    let offset = 0;
    let matchedTokensIndex = 0;
    const guessedNumberOfTokens = this.hasCustom ? 0 : Math.floor(text.length / 10);
    const matchedTokens = new Array(guessedNumberOfTokens);
    const errors = [];
    let line = this.trackStartLines ? 1 : void 0;
    let column = this.trackStartLines ? 1 : void 0;
    const groups = cloneEmptyGroups(this.emptyGroups);
    const trackLines = this.trackStartLines;
    const lineTerminatorPattern = this.config.lineTerminatorsPattern;
    let currModePatternsLength = 0;
    let patternIdxToConfig = [];
    let currCharCodeToPatternIdxToConfig = [];
    const modeStack = [];
    const emptyArray = [];
    Object.freeze(emptyArray);
    let getPossiblePatterns;
    function getPossiblePatternsSlow() {
      return patternIdxToConfig;
    }
    function getPossiblePatternsOptimized(charCode) {
      const optimizedCharIdx = charCodeToOptimizedIndex(charCode);
      const possiblePatterns = currCharCodeToPatternIdxToConfig[optimizedCharIdx];
      if (possiblePatterns === void 0) {
        return emptyArray;
      } else {
        return possiblePatterns;
      }
    }
    const pop_mode = (popToken) => {
      if (modeStack.length === 1 && // if we have both a POP_MODE and a PUSH_MODE this is in-fact a "transition"
      // So no error should occur.
      popToken.tokenType.PUSH_MODE === void 0) {
        const msg2 = this.config.errorMessageProvider.buildUnableToPopLexerModeMessage(popToken);
        errors.push({
          offset: popToken.startOffset,
          line: popToken.startLine,
          column: popToken.startColumn,
          length: popToken.image.length,
          message: msg2
        });
      } else {
        modeStack.pop();
        const newMode = last_default(modeStack);
        patternIdxToConfig = this.patternIdxToConfig[newMode];
        currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode];
        currModePatternsLength = patternIdxToConfig.length;
        const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false;
        if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
          getPossiblePatterns = getPossiblePatternsOptimized;
        } else {
          getPossiblePatterns = getPossiblePatternsSlow;
        }
      }
    };
    function push_mode(newMode) {
      modeStack.push(newMode);
      currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode];
      patternIdxToConfig = this.patternIdxToConfig[newMode];
      currModePatternsLength = patternIdxToConfig.length;
      currModePatternsLength = patternIdxToConfig.length;
      const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false;
      if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
        getPossiblePatterns = getPossiblePatternsOptimized;
      } else {
        getPossiblePatterns = getPossiblePatternsSlow;
      }
    }
    push_mode.call(this, initialMode);
    let currConfig;
    const recoveryEnabled = this.config.recoveryEnabled;
    while (offset < orgLength) {
      matchedImage = null;
      const nextCharCode = orgText.charCodeAt(offset);
      const chosenPatternIdxToConfig = getPossiblePatterns(nextCharCode);
      const chosenPatternsLength = chosenPatternIdxToConfig.length;
      for (i = 0; i < chosenPatternsLength; i++) {
        currConfig = chosenPatternIdxToConfig[i];
        const currPattern = currConfig.pattern;
        payload = null;
        const singleCharCode = currConfig.short;
        if (singleCharCode !== false) {
          if (nextCharCode === singleCharCode) {
            matchedImage = currPattern;
          }
        } else if (currConfig.isCustom === true) {
          match = currPattern.exec(orgText, offset, matchedTokens, groups);
          if (match !== null) {
            matchedImage = match[0];
            if (match.payload !== void 0) {
              payload = match.payload;
            }
          } else {
            matchedImage = null;
          }
        } else {
          this.updateLastIndex(currPattern, offset);
          matchedImage = this.match(currPattern, text, offset);
        }
        if (matchedImage !== null) {
          longerAlt = currConfig.longerAlt;
          if (longerAlt !== void 0) {
            const longerAltLength = longerAlt.length;
            for (k = 0; k < longerAltLength; k++) {
              const longerAltConfig = patternIdxToConfig[longerAlt[k]];
              const longerAltPattern = longerAltConfig.pattern;
              altPayload = null;
              if (longerAltConfig.isCustom === true) {
                match = longerAltPattern.exec(orgText, offset, matchedTokens, groups);
                if (match !== null) {
                  matchAltImage = match[0];
                  if (match.payload !== void 0) {
                    altPayload = match.payload;
                  }
                } else {
                  matchAltImage = null;
                }
              } else {
                this.updateLastIndex(longerAltPattern, offset);
                matchAltImage = this.match(longerAltPattern, text, offset);
              }
              if (matchAltImage && matchAltImage.length > matchedImage.length) {
                matchedImage = matchAltImage;
                payload = altPayload;
                currConfig = longerAltConfig;
                break;
              }
            }
          }
          break;
        }
      }
      if (matchedImage !== null) {
        imageLength = matchedImage.length;
        group = currConfig.group;
        if (group !== void 0) {
          tokType = currConfig.tokenTypeIdx;
          newToken = this.createTokenInstance(matchedImage, offset, tokType, currConfig.tokenType, line, column, imageLength);
          this.handlePayload(newToken, payload);
          if (group === false) {
            matchedTokensIndex = this.addToken(matchedTokens, matchedTokensIndex, newToken);
          } else {
            groups[group].push(newToken);
          }
        }
        text = this.chopInput(text, imageLength);
        offset = offset + imageLength;
        column = this.computeNewColumn(column, imageLength);
        if (trackLines === true && currConfig.canLineTerminator === true) {
          let numOfLTsInMatch = 0;
          let foundTerminator;
          let lastLTEndOffset;
          lineTerminatorPattern.lastIndex = 0;
          do {
            foundTerminator = lineTerminatorPattern.test(matchedImage);
            if (foundTerminator === true) {
              lastLTEndOffset = lineTerminatorPattern.lastIndex - 1;
              numOfLTsInMatch++;
            }
          } while (foundTerminator === true);
          if (numOfLTsInMatch !== 0) {
            line = line + numOfLTsInMatch;
            column = imageLength - lastLTEndOffset;
            this.updateTokenEndLineColumnLocation(newToken, group, lastLTEndOffset, numOfLTsInMatch, line, column, imageLength);
          }
        }
        this.handleModes(currConfig, pop_mode, push_mode, newToken);
      } else {
        const errorStartOffset = offset;
        const errorLine = line;
        const errorColumn = column;
        let foundResyncPoint = recoveryEnabled === false;
        while (foundResyncPoint === false && offset < orgLength) {
          text = this.chopInput(text, 1);
          offset++;
          for (j = 0; j < currModePatternsLength; j++) {
            const currConfig2 = patternIdxToConfig[j];
            const currPattern = currConfig2.pattern;
            const singleCharCode = currConfig2.short;
            if (singleCharCode !== false) {
              if (orgText.charCodeAt(offset) === singleCharCode) {
                foundResyncPoint = true;
              }
            } else if (currConfig2.isCustom === true) {
              foundResyncPoint = currPattern.exec(orgText, offset, matchedTokens, groups) !== null;
            } else {
              this.updateLastIndex(currPattern, offset);
              foundResyncPoint = currPattern.exec(text) !== null;
            }
            if (foundResyncPoint === true) {
              break;
            }
          }
        }
        errLength = offset - errorStartOffset;
        column = this.computeNewColumn(column, errLength);
        msg = this.config.errorMessageProvider.buildUnexpectedCharactersMessage(orgText, errorStartOffset, errLength, errorLine, errorColumn);
        errors.push({
          offset: errorStartOffset,
          line: errorLine,
          column: errorColumn,
          length: errLength,
          message: msg
        });
        if (recoveryEnabled === false) {
          break;
        }
      }
    }
    if (!this.hasCustom) {
      matchedTokens.length = matchedTokensIndex;
    }
    return {
      tokens: matchedTokens,
      groups,
      errors
    };
  }
  handleModes(config, pop_mode, push_mode, newToken) {
    if (config.pop === true) {
      const pushMode = config.push;
      pop_mode(newToken);
      if (pushMode !== void 0) {
        push_mode.call(this, pushMode);
      }
    } else if (config.push !== void 0) {
      push_mode.call(this, config.push);
    }
  }
  chopInput(text, length) {
    return text.substring(length);
  }
  updateLastIndex(regExp, newLastIndex) {
    regExp.lastIndex = newLastIndex;
  }
  // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
  updateTokenEndLineColumnLocation(newToken, group, lastLTIdx, numOfLTsInMatch, line, column, imageLength) {
    let lastCharIsLT, fixForEndingInLT;
    if (group !== void 0) {
      lastCharIsLT = lastLTIdx === imageLength - 1;
      fixForEndingInLT = lastCharIsLT ? -1 : 0;
      if (!(numOfLTsInMatch === 1 && lastCharIsLT === true)) {
        newToken.endLine = line + fixForEndingInLT;
        newToken.endColumn = column - 1 + -fixForEndingInLT;
      }
    }
  }
  computeNewColumn(oldColumn, imageLength) {
    return oldColumn + imageLength;
  }
  createOffsetOnlyToken(image, startOffset, tokenTypeIdx, tokenType) {
    return {
      image,
      startOffset,
      tokenTypeIdx,
      tokenType
    };
  }
  createStartOnlyToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn) {
    return {
      image,
      startOffset,
      startLine,
      startColumn,
      tokenTypeIdx,
      tokenType
    };
  }
  createFullToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn, imageLength) {
    return {
      image,
      startOffset,
      endOffset: startOffset + imageLength - 1,
      startLine,
      endLine: startLine,
      startColumn,
      endColumn: startColumn + imageLength - 1,
      tokenTypeIdx,
      tokenType
    };
  }
  addTokenUsingPush(tokenVector, index, tokenToAdd) {
    tokenVector.push(tokenToAdd);
    return index;
  }
  addTokenUsingMemberAccess(tokenVector, index, tokenToAdd) {
    tokenVector[index] = tokenToAdd;
    index++;
    return index;
  }
  handlePayloadNoCustom(token, payload) {
  }
  handlePayloadWithCustom(token, payload) {
    if (payload !== null) {
      token.payload = payload;
    }
  }
  matchWithTest(pattern, text, offset) {
    const found = pattern.test(text);
    if (found === true) {
      return text.substring(offset, pattern.lastIndex);
    }
    return null;
  }
  matchWithExec(pattern, text) {
    const regExpArray = pattern.exec(text);
    return regExpArray !== null ? regExpArray[0] : null;
  }
};
Lexer.SKIPPED = "This marks a skipped Token pattern, this means each token identified by it willbe consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.";
Lexer.NA = /NOT_APPLICABLE/;

// ../../node_modules/chevrotain/lib/src/scan/tokens_public.js
function tokenLabel2(tokType) {
  if (hasTokenLabel2(tokType)) {
    return tokType.LABEL;
  } else {
    return tokType.name;
  }
}
function hasTokenLabel2(obj) {
  return isString_default(obj.LABEL) && obj.LABEL !== "";
}
var PARENT = "parent";
var CATEGORIES = "categories";
var LABEL = "label";
var GROUP = "group";
var PUSH_MODE = "push_mode";
var POP_MODE = "pop_mode";
var LONGER_ALT = "longer_alt";
var LINE_BREAKS = "line_breaks";
var START_CHARS_HINT = "start_chars_hint";
function createToken(config) {
  return createTokenInternal(config);
}
function createTokenInternal(config) {
  const pattern = config.pattern;
  const tokenType = {};
  tokenType.name = config.name;
  if (!isUndefined_default(pattern)) {
    tokenType.PATTERN = pattern;
  }
  if (has_default(config, PARENT)) {
    throw "The parent property is no longer supported.\nSee: https://github.com/chevrotain/chevrotain/issues/564#issuecomment-349062346 for details.";
  }
  if (has_default(config, CATEGORIES)) {
    tokenType.CATEGORIES = config[CATEGORIES];
  }
  augmentTokenTypes([tokenType]);
  if (has_default(config, LABEL)) {
    tokenType.LABEL = config[LABEL];
  }
  if (has_default(config, GROUP)) {
    tokenType.GROUP = config[GROUP];
  }
  if (has_default(config, POP_MODE)) {
    tokenType.POP_MODE = config[POP_MODE];
  }
  if (has_default(config, PUSH_MODE)) {
    tokenType.PUSH_MODE = config[PUSH_MODE];
  }
  if (has_default(config, LONGER_ALT)) {
    tokenType.LONGER_ALT = config[LONGER_ALT];
  }
  if (has_default(config, LINE_BREAKS)) {
    tokenType.LINE_BREAKS = config[LINE_BREAKS];
  }
  if (has_default(config, START_CHARS_HINT)) {
    tokenType.START_CHARS_HINT = config[START_CHARS_HINT];
  }
  return tokenType;
}
var EOF = createToken({ name: "EOF", pattern: Lexer.NA });
augmentTokenTypes([EOF]);
function createTokenInstance(tokType, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
  return {
    image,
    startOffset,
    endOffset,
    startLine,
    endLine,
    startColumn,
    endColumn,
    tokenTypeIdx: tokType.tokenTypeIdx,
    tokenType: tokType
  };
}
function tokenMatcher(token, tokType) {
  return tokenStructuredMatcher(token, tokType);
}

// ../../node_modules/chevrotain/lib/src/parse/errors_public.js
var defaultParserErrorProvider = {
  buildMismatchTokenMessage({ expected, actual, previous, ruleName }) {
    const hasLabel = hasTokenLabel2(expected);
    const expectedMsg = hasLabel ? `--> ${tokenLabel2(expected)} <--` : `token of type --> ${expected.name} <--`;
    const msg = `Expecting ${expectedMsg} but found --> '${actual.image}' <--`;
    return msg;
  },
  buildNotAllInputParsedMessage({ firstRedundant, ruleName }) {
    return "Redundant input, expecting EOF but found: " + firstRedundant.image;
  },
  buildNoViableAltMessage({ expectedPathsPerAlt, actual, previous, customUserDescription, ruleName }) {
    const errPrefix = "Expecting: ";
    const actualText = head_default(actual).image;
    const errSuffix = "\nbut found: '" + actualText + "'";
    if (customUserDescription) {
      return errPrefix + customUserDescription + errSuffix;
    } else {
      const allLookAheadPaths = reduce_default(expectedPathsPerAlt, (result, currAltPaths) => result.concat(currAltPaths), []);
      const nextValidTokenSequences = map_default(allLookAheadPaths, (currPath) => `[${map_default(currPath, (currTokenType) => tokenLabel2(currTokenType)).join(", ")}]`);
      const nextValidSequenceItems = map_default(nextValidTokenSequences, (itemMsg, idx) => `  ${idx + 1}. ${itemMsg}`);
      const calculatedDescription = `one of these possible Token sequences:
${nextValidSequenceItems.join("\n")}`;
      return errPrefix + calculatedDescription + errSuffix;
    }
  },
  buildEarlyExitMessage({ expectedIterationPaths, actual, customUserDescription, ruleName }) {
    const errPrefix = "Expecting: ";
    const actualText = head_default(actual).image;
    const errSuffix = "\nbut found: '" + actualText + "'";
    if (customUserDescription) {
      return errPrefix + customUserDescription + errSuffix;
    } else {
      const nextValidTokenSequences = map_default(expectedIterationPaths, (currPath) => `[${map_default(currPath, (currTokenType) => tokenLabel2(currTokenType)).join(",")}]`);
      const calculatedDescription = `expecting at least one iteration which starts with one of these possible Token sequences::
  <${nextValidTokenSequences.join(" ,")}>`;
      return errPrefix + calculatedDescription + errSuffix;
    }
  }
};
Object.freeze(defaultParserErrorProvider);
var defaultGrammarResolverErrorProvider = {
  buildRuleNotFoundError(topLevelRule, undefinedRule) {
    const msg = "Invalid grammar, reference to a rule which is not defined: ->" + undefinedRule.nonTerminalName + "<-\ninside top level rule: ->" + topLevelRule.name + "<-";
    return msg;
  }
};
var defaultGrammarValidatorErrorProvider = {
  buildDuplicateFoundError(topLevelRule, duplicateProds) {
    function getExtraProductionArgument2(prod) {
      if (prod instanceof Terminal) {
        return prod.terminalType.name;
      } else if (prod instanceof NonTerminal) {
        return prod.nonTerminalName;
      } else {
        return "";
      }
    }
    const topLevelName = topLevelRule.name;
    const duplicateProd = head_default(duplicateProds);
    const index = duplicateProd.idx;
    const dslName = getProductionDslName(duplicateProd);
    const extraArgument = getExtraProductionArgument2(duplicateProd);
    const hasExplicitIndex = index > 0;
    let msg = `->${dslName}${hasExplicitIndex ? index : ""}<- ${extraArgument ? `with argument: ->${extraArgument}<-` : ""}
                  appears more than once (${duplicateProds.length} times) in the top level rule: ->${topLevelName}<-.                  
                  For further details see: https://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES 
                  `;
    msg = msg.replace(/[ \t]+/g, " ");
    msg = msg.replace(/\s\s+/g, "\n");
    return msg;
  },
  buildNamespaceConflictError(rule) {
    const errMsg = `Namespace conflict found in grammar.
The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <${rule.name}>.
To resolve this make sure each Terminal and Non-Terminal names are unique
This is easy to accomplish by using the convention that Terminal names start with an uppercase letter
and Non-Terminal names start with a lower case letter.`;
    return errMsg;
  },
  buildAlternationPrefixAmbiguityError(options) {
    const pathMsg = map_default(options.prefixPath, (currTok) => tokenLabel2(currTok)).join(", ");
    const occurrence = options.alternation.idx === 0 ? "" : options.alternation.idx;
    const errMsg = `Ambiguous alternatives: <${options.ambiguityIndices.join(" ,")}> due to common lookahead prefix
in <OR${occurrence}> inside <${options.topLevelRule.name}> Rule,
<${pathMsg}> may appears as a prefix path in all these alternatives.
See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#COMMON_PREFIX
For Further details.`;
    return errMsg;
  },
  buildAlternationAmbiguityError(options) {
    const pathMsg = map_default(options.prefixPath, (currtok) => tokenLabel2(currtok)).join(", ");
    const occurrence = options.alternation.idx === 0 ? "" : options.alternation.idx;
    let currMessage = `Ambiguous Alternatives Detected: <${options.ambiguityIndices.join(" ,")}> in <OR${occurrence}> inside <${options.topLevelRule.name}> Rule,
<${pathMsg}> may appears as a prefix path in all these alternatives.
`;
    currMessage = currMessage + `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES
For Further details.`;
    return currMessage;
  },
  buildEmptyRepetitionError(options) {
    let dslName = getProductionDslName(options.repetition);
    if (options.repetition.idx !== 0) {
      dslName += options.repetition.idx;
    }
    const errMsg = `The repetition <${dslName}> within Rule <${options.topLevelRule.name}> can never consume any tokens.
This could lead to an infinite loop.`;
    return errMsg;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildTokenNameError(options) {
    return "deprecated";
  },
  buildEmptyAlternationError(options) {
    const errMsg = `Ambiguous empty alternative: <${options.emptyChoiceIdx + 1}> in <OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.
Only the last alternative may be an empty alternative.`;
    return errMsg;
  },
  buildTooManyAlternativesError(options) {
    const errMsg = `An Alternation cannot have more than 256 alternatives:
<OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.
 has ${options.alternation.definition.length + 1} alternatives.`;
    return errMsg;
  },
  buildLeftRecursionError(options) {
    const ruleName = options.topLevelRule.name;
    const pathNames = map_default(options.leftRecursionPath, (currRule) => currRule.name);
    const leftRecursivePath = `${ruleName} --> ${pathNames.concat([ruleName]).join(" --> ")}`;
    const errMsg = `Left Recursion found in grammar.
rule: <${ruleName}> can be invoked from itself (directly or indirectly)
without consuming any Tokens. The grammar path that causes this is: 
 ${leftRecursivePath}
 To fix this refactor your grammar to remove the left recursion.
see: https://en.wikipedia.org/wiki/LL_parser#Left_factoring.`;
    return errMsg;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildInvalidRuleNameError(options) {
    return "deprecated";
  },
  buildDuplicateRuleNameError(options) {
    let ruleName;
    if (options.topLevelRule instanceof Rule) {
      ruleName = options.topLevelRule.name;
    } else {
      ruleName = options.topLevelRule;
    }
    const errMsg = `Duplicate definition, rule: ->${ruleName}<- is already defined in the grammar: ->${options.grammarName}<-`;
    return errMsg;
  }
};

// ../../node_modules/chevrotain/lib/src/parse/grammar/resolver.js
function resolveGrammar(topLevels, errMsgProvider) {
  const refResolver = new GastRefResolverVisitor(topLevels, errMsgProvider);
  refResolver.resolveRefs();
  return refResolver.errors;
}
var GastRefResolverVisitor = class extends GAstVisitor {
  constructor(nameToTopRule, errMsgProvider) {
    super();
    this.nameToTopRule = nameToTopRule;
    this.errMsgProvider = errMsgProvider;
    this.errors = [];
  }
  resolveRefs() {
    forEach_default(values_default(this.nameToTopRule), (prod) => {
      this.currTopLevel = prod;
      prod.accept(this);
    });
  }
  visitNonTerminal(node) {
    const ref = this.nameToTopRule[node.nonTerminalName];
    if (!ref) {
      const msg = this.errMsgProvider.buildRuleNotFoundError(this.currTopLevel, node);
      this.errors.push({
        message: msg,
        type: ParserDefinitionErrorType.UNRESOLVED_SUBRULE_REF,
        ruleName: this.currTopLevel.name,
        unresolvedRefName: node.nonTerminalName
      });
    } else {
      node.referencedRule = ref;
    }
  }
};

// ../../node_modules/chevrotain/lib/src/parse/grammar/interpreter.js
var AbstractNextPossibleTokensWalker = class extends RestWalker {
  constructor(topProd, path8) {
    super();
    this.topProd = topProd;
    this.path = path8;
    this.possibleTokTypes = [];
    this.nextProductionName = "";
    this.nextProductionOccurrence = 0;
    this.found = false;
    this.isAtEndOfPath = false;
  }
  startWalking() {
    this.found = false;
    if (this.path.ruleStack[0] !== this.topProd.name) {
      throw Error("The path does not start with the walker's top Rule!");
    }
    this.ruleStack = clone_default(this.path.ruleStack).reverse();
    this.occurrenceStack = clone_default(this.path.occurrenceStack).reverse();
    this.ruleStack.pop();
    this.occurrenceStack.pop();
    this.updateExpectedNext();
    this.walk(this.topProd);
    return this.possibleTokTypes;
  }
  walk(prod, prevRest = []) {
    if (!this.found) {
      super.walk(prod, prevRest);
    }
  }
  walkProdRef(refProd, currRest, prevRest) {
    if (refProd.referencedRule.name === this.nextProductionName && refProd.idx === this.nextProductionOccurrence) {
      const fullRest = currRest.concat(prevRest);
      this.updateExpectedNext();
      this.walk(refProd.referencedRule, fullRest);
    }
  }
  updateExpectedNext() {
    if (isEmpty_default(this.ruleStack)) {
      this.nextProductionName = "";
      this.nextProductionOccurrence = 0;
      this.isAtEndOfPath = true;
    } else {
      this.nextProductionName = this.ruleStack.pop();
      this.nextProductionOccurrence = this.occurrenceStack.pop();
    }
  }
};
var NextAfterTokenWalker = class extends AbstractNextPossibleTokensWalker {
  constructor(topProd, path8) {
    super(topProd, path8);
    this.path = path8;
    this.nextTerminalName = "";
    this.nextTerminalOccurrence = 0;
    this.nextTerminalName = this.path.lastTok.name;
    this.nextTerminalOccurrence = this.path.lastTokOccurrence;
  }
  walkTerminal(terminal, currRest, prevRest) {
    if (this.isAtEndOfPath && terminal.terminalType.name === this.nextTerminalName && terminal.idx === this.nextTerminalOccurrence && !this.found) {
      const fullRest = currRest.concat(prevRest);
      const restProd = new Alternative({ definition: fullRest });
      this.possibleTokTypes = first(restProd);
      this.found = true;
    }
  }
};
var AbstractNextTerminalAfterProductionWalker = class extends RestWalker {
  constructor(topRule, occurrence) {
    super();
    this.topRule = topRule;
    this.occurrence = occurrence;
    this.result = {
      token: void 0,
      occurrence: void 0,
      isEndOfRule: void 0
    };
  }
  startWalking() {
    this.walk(this.topRule);
    return this.result;
  }
};
var NextTerminalAfterManyWalker = class extends AbstractNextTerminalAfterProductionWalker {
  walkMany(manyProd, currRest, prevRest) {
    if (manyProd.idx === this.occurrence) {
      const firstAfterMany = head_default(currRest.concat(prevRest));
      this.result.isEndOfRule = firstAfterMany === void 0;
      if (firstAfterMany instanceof Terminal) {
        this.result.token = firstAfterMany.terminalType;
        this.result.occurrence = firstAfterMany.idx;
      }
    } else {
      super.walkMany(manyProd, currRest, prevRest);
    }
  }
};
var NextTerminalAfterManySepWalker = class extends AbstractNextTerminalAfterProductionWalker {
  walkManySep(manySepProd, currRest, prevRest) {
    if (manySepProd.idx === this.occurrence) {
      const firstAfterManySep = head_default(currRest.concat(prevRest));
      this.result.isEndOfRule = firstAfterManySep === void 0;
      if (firstAfterManySep instanceof Terminal) {
        this.result.token = firstAfterManySep.terminalType;
        this.result.occurrence = firstAfterManySep.idx;
      }
    } else {
      super.walkManySep(manySepProd, currRest, prevRest);
    }
  }
};
var NextTerminalAfterAtLeastOneWalker = class extends AbstractNextTerminalAfterProductionWalker {
  walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
    if (atLeastOneProd.idx === this.occurrence) {
      const firstAfterAtLeastOne = head_default(currRest.concat(prevRest));
      this.result.isEndOfRule = firstAfterAtLeastOne === void 0;
      if (firstAfterAtLeastOne instanceof Terminal) {
        this.result.token = firstAfterAtLeastOne.terminalType;
        this.result.occurrence = firstAfterAtLeastOne.idx;
      }
    } else {
      super.walkAtLeastOne(atLeastOneProd, currRest, prevRest);
    }
  }
};
var NextTerminalAfterAtLeastOneSepWalker = class extends AbstractNextTerminalAfterProductionWalker {
  walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest) {
    if (atleastOneSepProd.idx === this.occurrence) {
      const firstAfterfirstAfterAtLeastOneSep = head_default(currRest.concat(prevRest));
      this.result.isEndOfRule = firstAfterfirstAfterAtLeastOneSep === void 0;
      if (firstAfterfirstAfterAtLeastOneSep instanceof Terminal) {
        this.result.token = firstAfterfirstAfterAtLeastOneSep.terminalType;
        this.result.occurrence = firstAfterfirstAfterAtLeastOneSep.idx;
      }
    } else {
      super.walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest);
    }
  }
};
function possiblePathsFrom(targetDef, maxLength, currPath = []) {
  currPath = clone_default(currPath);
  let result = [];
  let i = 0;
  function remainingPathWith(nextDef) {
    return nextDef.concat(drop_default(targetDef, i + 1));
  }
  function getAlternativesForProd(definition) {
    const alternatives = possiblePathsFrom(remainingPathWith(definition), maxLength, currPath);
    return result.concat(alternatives);
  }
  while (currPath.length < maxLength && i < targetDef.length) {
    const prod = targetDef[i];
    if (prod instanceof Alternative) {
      return getAlternativesForProd(prod.definition);
    } else if (prod instanceof NonTerminal) {
      return getAlternativesForProd(prod.definition);
    } else if (prod instanceof Option) {
      result = getAlternativesForProd(prod.definition);
    } else if (prod instanceof RepetitionMandatory) {
      const newDef = prod.definition.concat([
        new Repetition({
          definition: prod.definition
        })
      ]);
      return getAlternativesForProd(newDef);
    } else if (prod instanceof RepetitionMandatoryWithSeparator) {
      const newDef = [
        new Alternative({ definition: prod.definition }),
        new Repetition({
          definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition)
        })
      ];
      return getAlternativesForProd(newDef);
    } else if (prod instanceof RepetitionWithSeparator) {
      const newDef = prod.definition.concat([
        new Repetition({
          definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition)
        })
      ]);
      result = getAlternativesForProd(newDef);
    } else if (prod instanceof Repetition) {
      const newDef = prod.definition.concat([
        new Repetition({
          definition: prod.definition
        })
      ]);
      result = getAlternativesForProd(newDef);
    } else if (prod instanceof Alternation) {
      forEach_default(prod.definition, (currAlt) => {
        if (isEmpty_default(currAlt.definition) === false) {
          result = getAlternativesForProd(currAlt.definition);
        }
      });
      return result;
    } else if (prod instanceof Terminal) {
      currPath.push(prod.terminalType);
    } else {
      throw Error("non exhaustive match");
    }
    i++;
  }
  result.push({
    partialPath: currPath,
    suffixDef: drop_default(targetDef, i)
  });
  return result;
}
function nextPossibleTokensAfter(initialDef, tokenVector, tokMatcher, maxLookAhead) {
  const EXIT_NON_TERMINAL = "EXIT_NONE_TERMINAL";
  const EXIT_NON_TERMINAL_ARR = [EXIT_NON_TERMINAL];
  const EXIT_ALTERNATIVE = "EXIT_ALTERNATIVE";
  let foundCompletePath = false;
  const tokenVectorLength = tokenVector.length;
  const minimalAlternativesIndex = tokenVectorLength - maxLookAhead - 1;
  const result = [];
  const possiblePaths = [];
  possiblePaths.push({
    idx: -1,
    def: initialDef,
    ruleStack: [],
    occurrenceStack: []
  });
  while (!isEmpty_default(possiblePaths)) {
    const currPath = possiblePaths.pop();
    if (currPath === EXIT_ALTERNATIVE) {
      if (foundCompletePath && last_default(possiblePaths).idx <= minimalAlternativesIndex) {
        possiblePaths.pop();
      }
      continue;
    }
    const currDef = currPath.def;
    const currIdx = currPath.idx;
    const currRuleStack = currPath.ruleStack;
    const currOccurrenceStack = currPath.occurrenceStack;
    if (isEmpty_default(currDef)) {
      continue;
    }
    const prod = currDef[0];
    if (prod === EXIT_NON_TERMINAL) {
      const nextPath = {
        idx: currIdx,
        def: drop_default(currDef),
        ruleStack: dropRight_default(currRuleStack),
        occurrenceStack: dropRight_default(currOccurrenceStack)
      };
      possiblePaths.push(nextPath);
    } else if (prod instanceof Terminal) {
      if (currIdx < tokenVectorLength - 1) {
        const nextIdx = currIdx + 1;
        const actualToken = tokenVector[nextIdx];
        if (tokMatcher(actualToken, prod.terminalType)) {
          const nextPath = {
            idx: nextIdx,
            def: drop_default(currDef),
            ruleStack: currRuleStack,
            occurrenceStack: currOccurrenceStack
          };
          possiblePaths.push(nextPath);
        }
      } else if (currIdx === tokenVectorLength - 1) {
        result.push({
          nextTokenType: prod.terminalType,
          nextTokenOccurrence: prod.idx,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        });
        foundCompletePath = true;
      } else {
        throw Error("non exhaustive match");
      }
    } else if (prod instanceof NonTerminal) {
      const newRuleStack = clone_default(currRuleStack);
      newRuleStack.push(prod.nonTerminalName);
      const newOccurrenceStack = clone_default(currOccurrenceStack);
      newOccurrenceStack.push(prod.idx);
      const nextPath = {
        idx: currIdx,
        def: prod.definition.concat(EXIT_NON_TERMINAL_ARR, drop_default(currDef)),
        ruleStack: newRuleStack,
        occurrenceStack: newOccurrenceStack
      };
      possiblePaths.push(nextPath);
    } else if (prod instanceof Option) {
      const nextPathWithout = {
        idx: currIdx,
        def: drop_default(currDef),
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWithout);
      possiblePaths.push(EXIT_ALTERNATIVE);
      const nextPathWith = {
        idx: currIdx,
        def: prod.definition.concat(drop_default(currDef)),
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWith);
    } else if (prod instanceof RepetitionMandatory) {
      const secondIteration = new Repetition({
        definition: prod.definition,
        idx: prod.idx
      });
      const nextDef = prod.definition.concat([secondIteration], drop_default(currDef));
      const nextPath = {
        idx: currIdx,
        def: nextDef,
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPath);
    } else if (prod instanceof RepetitionMandatoryWithSeparator) {
      const separatorGast = new Terminal({
        terminalType: prod.separator
      });
      const secondIteration = new Repetition({
        definition: [separatorGast].concat(prod.definition),
        idx: prod.idx
      });
      const nextDef = prod.definition.concat([secondIteration], drop_default(currDef));
      const nextPath = {
        idx: currIdx,
        def: nextDef,
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPath);
    } else if (prod instanceof RepetitionWithSeparator) {
      const nextPathWithout = {
        idx: currIdx,
        def: drop_default(currDef),
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWithout);
      possiblePaths.push(EXIT_ALTERNATIVE);
      const separatorGast = new Terminal({
        terminalType: prod.separator
      });
      const nthRepetition = new Repetition({
        definition: [separatorGast].concat(prod.definition),
        idx: prod.idx
      });
      const nextDef = prod.definition.concat([nthRepetition], drop_default(currDef));
      const nextPathWith = {
        idx: currIdx,
        def: nextDef,
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWith);
    } else if (prod instanceof Repetition) {
      const nextPathWithout = {
        idx: currIdx,
        def: drop_default(currDef),
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWithout);
      possiblePaths.push(EXIT_ALTERNATIVE);
      const nthRepetition = new Repetition({
        definition: prod.definition,
        idx: prod.idx
      });
      const nextDef = prod.definition.concat([nthRepetition], drop_default(currDef));
      const nextPathWith = {
        idx: currIdx,
        def: nextDef,
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      };
      possiblePaths.push(nextPathWith);
    } else if (prod instanceof Alternation) {
      for (let i = prod.definition.length - 1; i >= 0; i--) {
        const currAlt = prod.definition[i];
        const currAltPath = {
          idx: currIdx,
          def: currAlt.definition.concat(drop_default(currDef)),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(currAltPath);
        possiblePaths.push(EXIT_ALTERNATIVE);
      }
    } else if (prod instanceof Alternative) {
      possiblePaths.push({
        idx: currIdx,
        def: prod.definition.concat(drop_default(currDef)),
        ruleStack: currRuleStack,
        occurrenceStack: currOccurrenceStack
      });
    } else if (prod instanceof Rule) {
      possiblePaths.push(expandTopLevelRule(prod, currIdx, currRuleStack, currOccurrenceStack));
    } else {
      throw Error("non exhaustive match");
    }
  }
  return result;
}
function expandTopLevelRule(topRule, currIdx, currRuleStack, currOccurrenceStack) {
  const newRuleStack = clone_default(currRuleStack);
  newRuleStack.push(topRule.name);
  const newCurrOccurrenceStack = clone_default(currOccurrenceStack);
  newCurrOccurrenceStack.push(1);
  return {
    idx: currIdx,
    def: topRule.definition,
    ruleStack: newRuleStack,
    occurrenceStack: newCurrOccurrenceStack
  };
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/lookahead.js
var PROD_TYPE;
(function(PROD_TYPE2) {
  PROD_TYPE2[PROD_TYPE2["OPTION"] = 0] = "OPTION";
  PROD_TYPE2[PROD_TYPE2["REPETITION"] = 1] = "REPETITION";
  PROD_TYPE2[PROD_TYPE2["REPETITION_MANDATORY"] = 2] = "REPETITION_MANDATORY";
  PROD_TYPE2[PROD_TYPE2["REPETITION_MANDATORY_WITH_SEPARATOR"] = 3] = "REPETITION_MANDATORY_WITH_SEPARATOR";
  PROD_TYPE2[PROD_TYPE2["REPETITION_WITH_SEPARATOR"] = 4] = "REPETITION_WITH_SEPARATOR";
  PROD_TYPE2[PROD_TYPE2["ALTERNATION"] = 5] = "ALTERNATION";
})(PROD_TYPE || (PROD_TYPE = {}));
function getProdType(prod) {
  if (prod instanceof Option || prod === "Option") {
    return PROD_TYPE.OPTION;
  } else if (prod instanceof Repetition || prod === "Repetition") {
    return PROD_TYPE.REPETITION;
  } else if (prod instanceof RepetitionMandatory || prod === "RepetitionMandatory") {
    return PROD_TYPE.REPETITION_MANDATORY;
  } else if (prod instanceof RepetitionMandatoryWithSeparator || prod === "RepetitionMandatoryWithSeparator") {
    return PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR;
  } else if (prod instanceof RepetitionWithSeparator || prod === "RepetitionWithSeparator") {
    return PROD_TYPE.REPETITION_WITH_SEPARATOR;
  } else if (prod instanceof Alternation || prod === "Alternation") {
    return PROD_TYPE.ALTERNATION;
  } else {
    throw Error("non exhaustive match");
  }
}
function getLookaheadPaths(options) {
  const { occurrence, rule, prodType, maxLookahead } = options;
  const type = getProdType(prodType);
  if (type === PROD_TYPE.ALTERNATION) {
    return getLookaheadPathsForOr(occurrence, rule, maxLookahead);
  } else {
    return getLookaheadPathsForOptionalProd(occurrence, rule, type, maxLookahead);
  }
}
function buildLookaheadFuncForOr(occurrence, ruleGrammar, maxLookahead, hasPredicates, dynamicTokensEnabled, laFuncBuilder) {
  const lookAheadPaths = getLookaheadPathsForOr(occurrence, ruleGrammar, maxLookahead);
  const tokenMatcher2 = areTokenCategoriesNotUsed(lookAheadPaths) ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
  return laFuncBuilder(lookAheadPaths, hasPredicates, tokenMatcher2, dynamicTokensEnabled);
}
function buildLookaheadFuncForOptionalProd(occurrence, ruleGrammar, k, dynamicTokensEnabled, prodType, lookaheadBuilder) {
  const lookAheadPaths = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k);
  const tokenMatcher2 = areTokenCategoriesNotUsed(lookAheadPaths) ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
  return lookaheadBuilder(lookAheadPaths[0], tokenMatcher2, dynamicTokensEnabled);
}
function buildAlternativesLookAheadFunc(alts, hasPredicates, tokenMatcher2, dynamicTokensEnabled) {
  const numOfAlts = alts.length;
  const areAllOneTokenLookahead = every_default(alts, (currAlt) => {
    return every_default(currAlt, (currPath) => {
      return currPath.length === 1;
    });
  });
  if (hasPredicates) {
    return function(orAlts) {
      const predicates = map_default(orAlts, (currAlt) => currAlt.GATE);
      for (let t = 0; t < numOfAlts; t++) {
        const currAlt = alts[t];
        const currNumOfPaths = currAlt.length;
        const currPredicate = predicates[t];
        if (currPredicate !== void 0 && currPredicate.call(this) === false) {
          continue;
        }
        nextPath: for (let j = 0; j < currNumOfPaths; j++) {
          const currPath = currAlt[j];
          const currPathLength = currPath.length;
          for (let i = 0; i < currPathLength; i++) {
            const nextToken = this.LA(i + 1);
            if (tokenMatcher2(nextToken, currPath[i]) === false) {
              continue nextPath;
            }
          }
          return t;
        }
      }
      return void 0;
    };
  } else if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
    const singleTokenAlts = map_default(alts, (currAlt) => {
      return flatten_default(currAlt);
    });
    const choiceToAlt = reduce_default(singleTokenAlts, (result, currAlt, idx) => {
      forEach_default(currAlt, (currTokType) => {
        if (!has_default(result, currTokType.tokenTypeIdx)) {
          result[currTokType.tokenTypeIdx] = idx;
        }
        forEach_default(currTokType.categoryMatches, (currExtendingType) => {
          if (!has_default(result, currExtendingType)) {
            result[currExtendingType] = idx;
          }
        });
      });
      return result;
    }, {});
    return function() {
      const nextToken = this.LA(1);
      return choiceToAlt[nextToken.tokenTypeIdx];
    };
  } else {
    return function() {
      for (let t = 0; t < numOfAlts; t++) {
        const currAlt = alts[t];
        const currNumOfPaths = currAlt.length;
        nextPath: for (let j = 0; j < currNumOfPaths; j++) {
          const currPath = currAlt[j];
          const currPathLength = currPath.length;
          for (let i = 0; i < currPathLength; i++) {
            const nextToken = this.LA(i + 1);
            if (tokenMatcher2(nextToken, currPath[i]) === false) {
              continue nextPath;
            }
          }
          return t;
        }
      }
      return void 0;
    };
  }
}
function buildSingleAlternativeLookaheadFunction(alt, tokenMatcher2, dynamicTokensEnabled) {
  const areAllOneTokenLookahead = every_default(alt, (currPath) => {
    return currPath.length === 1;
  });
  const numOfPaths = alt.length;
  if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
    const singleTokensTypes = flatten_default(alt);
    if (singleTokensTypes.length === 1 && isEmpty_default(singleTokensTypes[0].categoryMatches)) {
      const expectedTokenType = singleTokensTypes[0];
      const expectedTokenUniqueKey = expectedTokenType.tokenTypeIdx;
      return function() {
        return this.LA(1).tokenTypeIdx === expectedTokenUniqueKey;
      };
    } else {
      const choiceToAlt = reduce_default(singleTokensTypes, (result, currTokType, idx) => {
        result[currTokType.tokenTypeIdx] = true;
        forEach_default(currTokType.categoryMatches, (currExtendingType) => {
          result[currExtendingType] = true;
        });
        return result;
      }, []);
      return function() {
        const nextToken = this.LA(1);
        return choiceToAlt[nextToken.tokenTypeIdx] === true;
      };
    }
  } else {
    return function() {
      nextPath: for (let j = 0; j < numOfPaths; j++) {
        const currPath = alt[j];
        const currPathLength = currPath.length;
        for (let i = 0; i < currPathLength; i++) {
          const nextToken = this.LA(i + 1);
          if (tokenMatcher2(nextToken, currPath[i]) === false) {
            continue nextPath;
          }
        }
        return true;
      }
      return false;
    };
  }
}
var RestDefinitionFinderWalker = class extends RestWalker {
  constructor(topProd, targetOccurrence, targetProdType) {
    super();
    this.topProd = topProd;
    this.targetOccurrence = targetOccurrence;
    this.targetProdType = targetProdType;
  }
  startWalking() {
    this.walk(this.topProd);
    return this.restDef;
  }
  checkIsTarget(node, expectedProdType, currRest, prevRest) {
    if (node.idx === this.targetOccurrence && this.targetProdType === expectedProdType) {
      this.restDef = currRest.concat(prevRest);
      return true;
    }
    return false;
  }
  walkOption(optionProd, currRest, prevRest) {
    if (!this.checkIsTarget(optionProd, PROD_TYPE.OPTION, currRest, prevRest)) {
      super.walkOption(optionProd, currRest, prevRest);
    }
  }
  walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
    if (!this.checkIsTarget(atLeastOneProd, PROD_TYPE.REPETITION_MANDATORY, currRest, prevRest)) {
      super.walkOption(atLeastOneProd, currRest, prevRest);
    }
  }
  walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
    if (!this.checkIsTarget(atLeastOneSepProd, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, currRest, prevRest)) {
      super.walkOption(atLeastOneSepProd, currRest, prevRest);
    }
  }
  walkMany(manyProd, currRest, prevRest) {
    if (!this.checkIsTarget(manyProd, PROD_TYPE.REPETITION, currRest, prevRest)) {
      super.walkOption(manyProd, currRest, prevRest);
    }
  }
  walkManySep(manySepProd, currRest, prevRest) {
    if (!this.checkIsTarget(manySepProd, PROD_TYPE.REPETITION_WITH_SEPARATOR, currRest, prevRest)) {
      super.walkOption(manySepProd, currRest, prevRest);
    }
  }
};
var InsideDefinitionFinderVisitor = class extends GAstVisitor {
  constructor(targetOccurrence, targetProdType, targetRef) {
    super();
    this.targetOccurrence = targetOccurrence;
    this.targetProdType = targetProdType;
    this.targetRef = targetRef;
    this.result = [];
  }
  checkIsTarget(node, expectedProdName) {
    if (node.idx === this.targetOccurrence && this.targetProdType === expectedProdName && (this.targetRef === void 0 || node === this.targetRef)) {
      this.result = node.definition;
    }
  }
  visitOption(node) {
    this.checkIsTarget(node, PROD_TYPE.OPTION);
  }
  visitRepetition(node) {
    this.checkIsTarget(node, PROD_TYPE.REPETITION);
  }
  visitRepetitionMandatory(node) {
    this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY);
  }
  visitRepetitionMandatoryWithSeparator(node) {
    this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR);
  }
  visitRepetitionWithSeparator(node) {
    this.checkIsTarget(node, PROD_TYPE.REPETITION_WITH_SEPARATOR);
  }
  visitAlternation(node) {
    this.checkIsTarget(node, PROD_TYPE.ALTERNATION);
  }
};
function initializeArrayOfArrays(size) {
  const result = new Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = [];
  }
  return result;
}
function pathToHashKeys(path8) {
  let keys2 = [""];
  for (let i = 0; i < path8.length; i++) {
    const tokType = path8[i];
    const longerKeys = [];
    for (let j = 0; j < keys2.length; j++) {
      const currShorterKey = keys2[j];
      longerKeys.push(currShorterKey + "_" + tokType.tokenTypeIdx);
      for (let t = 0; t < tokType.categoryMatches.length; t++) {
        const categoriesKeySuffix = "_" + tokType.categoryMatches[t];
        longerKeys.push(currShorterKey + categoriesKeySuffix);
      }
    }
    keys2 = longerKeys;
  }
  return keys2;
}
function isUniquePrefixHash(altKnownPathsKeys, searchPathKeys, idx) {
  for (let currAltIdx = 0; currAltIdx < altKnownPathsKeys.length; currAltIdx++) {
    if (currAltIdx === idx) {
      continue;
    }
    const otherAltKnownPathsKeys = altKnownPathsKeys[currAltIdx];
    for (let searchIdx = 0; searchIdx < searchPathKeys.length; searchIdx++) {
      const searchKey = searchPathKeys[searchIdx];
      if (otherAltKnownPathsKeys[searchKey] === true) {
        return false;
      }
    }
  }
  return true;
}
function lookAheadSequenceFromAlternatives(altsDefs, k) {
  const partialAlts = map_default(altsDefs, (currAlt) => possiblePathsFrom([currAlt], 1));
  const finalResult = initializeArrayOfArrays(partialAlts.length);
  const altsHashes = map_default(partialAlts, (currAltPaths) => {
    const dict = {};
    forEach_default(currAltPaths, (item) => {
      const keys2 = pathToHashKeys(item.partialPath);
      forEach_default(keys2, (currKey) => {
        dict[currKey] = true;
      });
    });
    return dict;
  });
  let newData = partialAlts;
  for (let pathLength = 1; pathLength <= k; pathLength++) {
    const currDataset = newData;
    newData = initializeArrayOfArrays(currDataset.length);
    for (let altIdx = 0; altIdx < currDataset.length; altIdx++) {
      const currAltPathsAndSuffixes = currDataset[altIdx];
      for (let currPathIdx = 0; currPathIdx < currAltPathsAndSuffixes.length; currPathIdx++) {
        const currPathPrefix = currAltPathsAndSuffixes[currPathIdx].partialPath;
        const suffixDef = currAltPathsAndSuffixes[currPathIdx].suffixDef;
        const prefixKeys = pathToHashKeys(currPathPrefix);
        const isUnique = isUniquePrefixHash(altsHashes, prefixKeys, altIdx);
        if (isUnique || isEmpty_default(suffixDef) || currPathPrefix.length === k) {
          const currAltResult = finalResult[altIdx];
          if (containsPath(currAltResult, currPathPrefix) === false) {
            currAltResult.push(currPathPrefix);
            for (let j = 0; j < prefixKeys.length; j++) {
              const currKey = prefixKeys[j];
              altsHashes[altIdx][currKey] = true;
            }
          }
        } else {
          const newPartialPathsAndSuffixes = possiblePathsFrom(suffixDef, pathLength + 1, currPathPrefix);
          newData[altIdx] = newData[altIdx].concat(newPartialPathsAndSuffixes);
          forEach_default(newPartialPathsAndSuffixes, (item) => {
            const prefixKeys2 = pathToHashKeys(item.partialPath);
            forEach_default(prefixKeys2, (key) => {
              altsHashes[altIdx][key] = true;
            });
          });
        }
      }
    }
  }
  return finalResult;
}
function getLookaheadPathsForOr(occurrence, ruleGrammar, k, orProd) {
  const visitor = new InsideDefinitionFinderVisitor(occurrence, PROD_TYPE.ALTERNATION, orProd);
  ruleGrammar.accept(visitor);
  return lookAheadSequenceFromAlternatives(visitor.result, k);
}
function getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k) {
  const insideDefVisitor = new InsideDefinitionFinderVisitor(occurrence, prodType);
  ruleGrammar.accept(insideDefVisitor);
  const insideDef = insideDefVisitor.result;
  const afterDefWalker = new RestDefinitionFinderWalker(ruleGrammar, occurrence, prodType);
  const afterDef = afterDefWalker.startWalking();
  const insideFlat = new Alternative({ definition: insideDef });
  const afterFlat = new Alternative({ definition: afterDef });
  return lookAheadSequenceFromAlternatives([insideFlat, afterFlat], k);
}
function containsPath(alternative, searchPath) {
  compareOtherPath: for (let i = 0; i < alternative.length; i++) {
    const otherPath = alternative[i];
    if (otherPath.length !== searchPath.length) {
      continue;
    }
    for (let j = 0; j < otherPath.length; j++) {
      const searchTok = searchPath[j];
      const otherTok = otherPath[j];
      const matchingTokens = searchTok === otherTok || otherTok.categoryMatchesMap[searchTok.tokenTypeIdx] !== void 0;
      if (matchingTokens === false) {
        continue compareOtherPath;
      }
    }
    return true;
  }
  return false;
}
function isStrictPrefixOfPath(prefix, other) {
  return prefix.length < other.length && every_default(prefix, (tokType, idx) => {
    const otherTokType = other[idx];
    return tokType === otherTokType || otherTokType.categoryMatchesMap[tokType.tokenTypeIdx];
  });
}
function areTokenCategoriesNotUsed(lookAheadPaths) {
  return every_default(lookAheadPaths, (singleAltPaths) => every_default(singleAltPaths, (singlePath) => every_default(singlePath, (token) => isEmpty_default(token.categoryMatches))));
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/checks.js
function validateLookahead(options) {
  const lookaheadValidationErrorMessages = options.lookaheadStrategy.validate({
    rules: options.rules,
    tokenTypes: options.tokenTypes,
    grammarName: options.grammarName
  });
  return map_default(lookaheadValidationErrorMessages, (errorMessage) => Object.assign({ type: ParserDefinitionErrorType.CUSTOM_LOOKAHEAD_VALIDATION }, errorMessage));
}
function validateGrammar(topLevels, tokenTypes, errMsgProvider, grammarName) {
  const duplicateErrors = flatMap_default(topLevels, (currTopLevel) => validateDuplicateProductions(currTopLevel, errMsgProvider));
  const termsNamespaceConflictErrors = checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider);
  const tooManyAltsErrors = flatMap_default(topLevels, (curRule) => validateTooManyAlts(curRule, errMsgProvider));
  const duplicateRulesError = flatMap_default(topLevels, (curRule) => validateRuleDoesNotAlreadyExist(curRule, topLevels, grammarName, errMsgProvider));
  return duplicateErrors.concat(termsNamespaceConflictErrors, tooManyAltsErrors, duplicateRulesError);
}
function validateDuplicateProductions(topLevelRule, errMsgProvider) {
  const collectorVisitor2 = new OccurrenceValidationCollector();
  topLevelRule.accept(collectorVisitor2);
  const allRuleProductions = collectorVisitor2.allProductions;
  const productionGroups = groupBy_default(allRuleProductions, identifyProductionForDuplicates);
  const duplicates = pickBy_default(productionGroups, (currGroup) => {
    return currGroup.length > 1;
  });
  const errors = map_default(values_default(duplicates), (currDuplicates) => {
    const firstProd = head_default(currDuplicates);
    const msg = errMsgProvider.buildDuplicateFoundError(topLevelRule, currDuplicates);
    const dslName = getProductionDslName(firstProd);
    const defError = {
      message: msg,
      type: ParserDefinitionErrorType.DUPLICATE_PRODUCTIONS,
      ruleName: topLevelRule.name,
      dslName,
      occurrence: firstProd.idx
    };
    const param = getExtraProductionArgument(firstProd);
    if (param) {
      defError.parameter = param;
    }
    return defError;
  });
  return errors;
}
function identifyProductionForDuplicates(prod) {
  return `${getProductionDslName(prod)}_#_${prod.idx}_#_${getExtraProductionArgument(prod)}`;
}
function getExtraProductionArgument(prod) {
  if (prod instanceof Terminal) {
    return prod.terminalType.name;
  } else if (prod instanceof NonTerminal) {
    return prod.nonTerminalName;
  } else {
    return "";
  }
}
var OccurrenceValidationCollector = class extends GAstVisitor {
  constructor() {
    super(...arguments);
    this.allProductions = [];
  }
  visitNonTerminal(subrule) {
    this.allProductions.push(subrule);
  }
  visitOption(option2) {
    this.allProductions.push(option2);
  }
  visitRepetitionWithSeparator(manySep) {
    this.allProductions.push(manySep);
  }
  visitRepetitionMandatory(atLeastOne) {
    this.allProductions.push(atLeastOne);
  }
  visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
    this.allProductions.push(atLeastOneSep);
  }
  visitRepetition(many) {
    this.allProductions.push(many);
  }
  visitAlternation(or) {
    this.allProductions.push(or);
  }
  visitTerminal(terminal) {
    this.allProductions.push(terminal);
  }
};
function validateRuleDoesNotAlreadyExist(rule, allRules, className, errMsgProvider) {
  const errors = [];
  const occurrences = reduce_default(allRules, (result, curRule) => {
    if (curRule.name === rule.name) {
      return result + 1;
    }
    return result;
  }, 0);
  if (occurrences > 1) {
    const errMsg = errMsgProvider.buildDuplicateRuleNameError({
      topLevelRule: rule,
      grammarName: className
    });
    errors.push({
      message: errMsg,
      type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
      ruleName: rule.name
    });
  }
  return errors;
}
function validateRuleIsOverridden(ruleName, definedRulesNames, className) {
  const errors = [];
  let errMsg;
  if (!includes_default(definedRulesNames, ruleName)) {
    errMsg = `Invalid rule override, rule: ->${ruleName}<- cannot be overridden in the grammar: ->${className}<-as it is not defined in any of the super grammars `;
    errors.push({
      message: errMsg,
      type: ParserDefinitionErrorType.INVALID_RULE_OVERRIDE,
      ruleName
    });
  }
  return errors;
}
function validateNoLeftRecursion(topRule, currRule, errMsgProvider, path8 = []) {
  const errors = [];
  const nextNonTerminals = getFirstNoneTerminal(currRule.definition);
  if (isEmpty_default(nextNonTerminals)) {
    return [];
  } else {
    const ruleName = topRule.name;
    const foundLeftRecursion = includes_default(nextNonTerminals, topRule);
    if (foundLeftRecursion) {
      errors.push({
        message: errMsgProvider.buildLeftRecursionError({
          topLevelRule: topRule,
          leftRecursionPath: path8
        }),
        type: ParserDefinitionErrorType.LEFT_RECURSION,
        ruleName
      });
    }
    const validNextSteps = difference_default(nextNonTerminals, path8.concat([topRule]));
    const errorsFromNextSteps = flatMap_default(validNextSteps, (currRefRule) => {
      const newPath = clone_default(path8);
      newPath.push(currRefRule);
      return validateNoLeftRecursion(topRule, currRefRule, errMsgProvider, newPath);
    });
    return errors.concat(errorsFromNextSteps);
  }
}
function getFirstNoneTerminal(definition) {
  let result = [];
  if (isEmpty_default(definition)) {
    return result;
  }
  const firstProd = head_default(definition);
  if (firstProd instanceof NonTerminal) {
    result.push(firstProd.referencedRule);
  } else if (firstProd instanceof Alternative || firstProd instanceof Option || firstProd instanceof RepetitionMandatory || firstProd instanceof RepetitionMandatoryWithSeparator || firstProd instanceof RepetitionWithSeparator || firstProd instanceof Repetition) {
    result = result.concat(getFirstNoneTerminal(firstProd.definition));
  } else if (firstProd instanceof Alternation) {
    result = flatten_default(map_default(firstProd.definition, (currSubDef) => getFirstNoneTerminal(currSubDef.definition)));
  } else if (firstProd instanceof Terminal) {
  } else {
    throw Error("non exhaustive match");
  }
  const isFirstOptional = isOptionalProd(firstProd);
  const hasMore = definition.length > 1;
  if (isFirstOptional && hasMore) {
    const rest = drop_default(definition);
    return result.concat(getFirstNoneTerminal(rest));
  } else {
    return result;
  }
}
var OrCollector = class extends GAstVisitor {
  constructor() {
    super(...arguments);
    this.alternations = [];
  }
  visitAlternation(node) {
    this.alternations.push(node);
  }
};
function validateEmptyOrAlternative(topLevelRule, errMsgProvider) {
  const orCollector = new OrCollector();
  topLevelRule.accept(orCollector);
  const ors = orCollector.alternations;
  const errors = flatMap_default(ors, (currOr) => {
    const exceptLast = dropRight_default(currOr.definition);
    return flatMap_default(exceptLast, (currAlternative, currAltIdx) => {
      const possibleFirstInAlt = nextPossibleTokensAfter([currAlternative], [], tokenStructuredMatcher, 1);
      if (isEmpty_default(possibleFirstInAlt)) {
        return [
          {
            message: errMsgProvider.buildEmptyAlternationError({
              topLevelRule,
              alternation: currOr,
              emptyChoiceIdx: currAltIdx
            }),
            type: ParserDefinitionErrorType.NONE_LAST_EMPTY_ALT,
            ruleName: topLevelRule.name,
            occurrence: currOr.idx,
            alternative: currAltIdx + 1
          }
        ];
      } else {
        return [];
      }
    });
  });
  return errors;
}
function validateAmbiguousAlternationAlternatives(topLevelRule, globalMaxLookahead, errMsgProvider) {
  const orCollector = new OrCollector();
  topLevelRule.accept(orCollector);
  let ors = orCollector.alternations;
  ors = reject_default(ors, (currOr) => currOr.ignoreAmbiguities === true);
  const errors = flatMap_default(ors, (currOr) => {
    const currOccurrence = currOr.idx;
    const actualMaxLookahead = currOr.maxLookahead || globalMaxLookahead;
    const alternatives = getLookaheadPathsForOr(currOccurrence, topLevelRule, actualMaxLookahead, currOr);
    const altsAmbiguityErrors = checkAlternativesAmbiguities(alternatives, currOr, topLevelRule, errMsgProvider);
    const altsPrefixAmbiguityErrors = checkPrefixAlternativesAmbiguities(alternatives, currOr, topLevelRule, errMsgProvider);
    return altsAmbiguityErrors.concat(altsPrefixAmbiguityErrors);
  });
  return errors;
}
var RepetitionCollector = class extends GAstVisitor {
  constructor() {
    super(...arguments);
    this.allProductions = [];
  }
  visitRepetitionWithSeparator(manySep) {
    this.allProductions.push(manySep);
  }
  visitRepetitionMandatory(atLeastOne) {
    this.allProductions.push(atLeastOne);
  }
  visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
    this.allProductions.push(atLeastOneSep);
  }
  visitRepetition(many) {
    this.allProductions.push(many);
  }
};
function validateTooManyAlts(topLevelRule, errMsgProvider) {
  const orCollector = new OrCollector();
  topLevelRule.accept(orCollector);
  const ors = orCollector.alternations;
  const errors = flatMap_default(ors, (currOr) => {
    if (currOr.definition.length > 255) {
      return [
        {
          message: errMsgProvider.buildTooManyAlternativesError({
            topLevelRule,
            alternation: currOr
          }),
          type: ParserDefinitionErrorType.TOO_MANY_ALTS,
          ruleName: topLevelRule.name,
          occurrence: currOr.idx
        }
      ];
    } else {
      return [];
    }
  });
  return errors;
}
function validateSomeNonEmptyLookaheadPath(topLevelRules, maxLookahead, errMsgProvider) {
  const errors = [];
  forEach_default(topLevelRules, (currTopRule) => {
    const collectorVisitor2 = new RepetitionCollector();
    currTopRule.accept(collectorVisitor2);
    const allRuleProductions = collectorVisitor2.allProductions;
    forEach_default(allRuleProductions, (currProd) => {
      const prodType = getProdType(currProd);
      const actualMaxLookahead = currProd.maxLookahead || maxLookahead;
      const currOccurrence = currProd.idx;
      const paths = getLookaheadPathsForOptionalProd(currOccurrence, currTopRule, prodType, actualMaxLookahead);
      const pathsInsideProduction = paths[0];
      if (isEmpty_default(flatten_default(pathsInsideProduction))) {
        const errMsg = errMsgProvider.buildEmptyRepetitionError({
          topLevelRule: currTopRule,
          repetition: currProd
        });
        errors.push({
          message: errMsg,
          type: ParserDefinitionErrorType.NO_NON_EMPTY_LOOKAHEAD,
          ruleName: currTopRule.name
        });
      }
    });
  });
  return errors;
}
function checkAlternativesAmbiguities(alternatives, alternation2, rule, errMsgProvider) {
  const foundAmbiguousPaths = [];
  const identicalAmbiguities = reduce_default(alternatives, (result, currAlt, currAltIdx) => {
    if (alternation2.definition[currAltIdx].ignoreAmbiguities === true) {
      return result;
    }
    forEach_default(currAlt, (currPath) => {
      const altsCurrPathAppearsIn = [currAltIdx];
      forEach_default(alternatives, (currOtherAlt, currOtherAltIdx) => {
        if (currAltIdx !== currOtherAltIdx && containsPath(currOtherAlt, currPath) && // ignore (skip) ambiguities with this "other" alternative
        alternation2.definition[currOtherAltIdx].ignoreAmbiguities !== true) {
          altsCurrPathAppearsIn.push(currOtherAltIdx);
        }
      });
      if (altsCurrPathAppearsIn.length > 1 && !containsPath(foundAmbiguousPaths, currPath)) {
        foundAmbiguousPaths.push(currPath);
        result.push({
          alts: altsCurrPathAppearsIn,
          path: currPath
        });
      }
    });
    return result;
  }, []);
  const currErrors = map_default(identicalAmbiguities, (currAmbDescriptor) => {
    const ambgIndices = map_default(currAmbDescriptor.alts, (currAltIdx) => currAltIdx + 1);
    const currMessage = errMsgProvider.buildAlternationAmbiguityError({
      topLevelRule: rule,
      alternation: alternation2,
      ambiguityIndices: ambgIndices,
      prefixPath: currAmbDescriptor.path
    });
    return {
      message: currMessage,
      type: ParserDefinitionErrorType.AMBIGUOUS_ALTS,
      ruleName: rule.name,
      occurrence: alternation2.idx,
      alternatives: currAmbDescriptor.alts
    };
  });
  return currErrors;
}
function checkPrefixAlternativesAmbiguities(alternatives, alternation2, rule, errMsgProvider) {
  const pathsAndIndices = reduce_default(alternatives, (result, currAlt, idx) => {
    const currPathsAndIdx = map_default(currAlt, (currPath) => {
      return { idx, path: currPath };
    });
    return result.concat(currPathsAndIdx);
  }, []);
  const errors = compact_default(flatMap_default(pathsAndIndices, (currPathAndIdx) => {
    const alternativeGast = alternation2.definition[currPathAndIdx.idx];
    if (alternativeGast.ignoreAmbiguities === true) {
      return [];
    }
    const targetIdx = currPathAndIdx.idx;
    const targetPath = currPathAndIdx.path;
    const prefixAmbiguitiesPathsAndIndices = filter_default(pathsAndIndices, (searchPathAndIdx) => {
      return (
        // ignore (skip) ambiguities with this "other" alternative
        alternation2.definition[searchPathAndIdx.idx].ignoreAmbiguities !== true && searchPathAndIdx.idx < targetIdx && // checking for strict prefix because identical lookaheads
        // will be be detected using a different validation.
        isStrictPrefixOfPath(searchPathAndIdx.path, targetPath)
      );
    });
    const currPathPrefixErrors = map_default(prefixAmbiguitiesPathsAndIndices, (currAmbPathAndIdx) => {
      const ambgIndices = [currAmbPathAndIdx.idx + 1, targetIdx + 1];
      const occurrence = alternation2.idx === 0 ? "" : alternation2.idx;
      const message = errMsgProvider.buildAlternationPrefixAmbiguityError({
        topLevelRule: rule,
        alternation: alternation2,
        ambiguityIndices: ambgIndices,
        prefixPath: currAmbPathAndIdx.path
      });
      return {
        message,
        type: ParserDefinitionErrorType.AMBIGUOUS_PREFIX_ALTS,
        ruleName: rule.name,
        occurrence,
        alternatives: ambgIndices
      };
    });
    return currPathPrefixErrors;
  }));
  return errors;
}
function checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider) {
  const errors = [];
  const tokenNames = map_default(tokenTypes, (currToken) => currToken.name);
  forEach_default(topLevels, (currRule) => {
    const currRuleName = currRule.name;
    if (includes_default(tokenNames, currRuleName)) {
      const errMsg = errMsgProvider.buildNamespaceConflictError(currRule);
      errors.push({
        message: errMsg,
        type: ParserDefinitionErrorType.CONFLICT_TOKENS_RULES_NAMESPACE,
        ruleName: currRuleName
      });
    }
  });
  return errors;
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/gast/gast_resolver_public.js
function resolveGrammar2(options) {
  const actualOptions = defaults_default(options, {
    errMsgProvider: defaultGrammarResolverErrorProvider
  });
  const topRulesTable = {};
  forEach_default(options.rules, (rule) => {
    topRulesTable[rule.name] = rule;
  });
  return resolveGrammar(topRulesTable, actualOptions.errMsgProvider);
}
function validateGrammar2(options) {
  options = defaults_default(options, {
    errMsgProvider: defaultGrammarValidatorErrorProvider
  });
  return validateGrammar(options.rules, options.tokenTypes, options.errMsgProvider, options.grammarName);
}

// ../../node_modules/chevrotain/lib/src/parse/exceptions_public.js
var MISMATCHED_TOKEN_EXCEPTION = "MismatchedTokenException";
var NO_VIABLE_ALT_EXCEPTION = "NoViableAltException";
var EARLY_EXIT_EXCEPTION = "EarlyExitException";
var NOT_ALL_INPUT_PARSED_EXCEPTION = "NotAllInputParsedException";
var RECOGNITION_EXCEPTION_NAMES = [
  MISMATCHED_TOKEN_EXCEPTION,
  NO_VIABLE_ALT_EXCEPTION,
  EARLY_EXIT_EXCEPTION,
  NOT_ALL_INPUT_PARSED_EXCEPTION
];
Object.freeze(RECOGNITION_EXCEPTION_NAMES);
function isRecognitionException(error) {
  return includes_default(RECOGNITION_EXCEPTION_NAMES, error.name);
}
var RecognitionException = class extends Error {
  constructor(message, token) {
    super(message);
    this.token = token;
    this.resyncedTokens = [];
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var MismatchedTokenException = class extends RecognitionException {
  constructor(message, token, previousToken) {
    super(message, token);
    this.previousToken = previousToken;
    this.name = MISMATCHED_TOKEN_EXCEPTION;
  }
};
var NoViableAltException = class extends RecognitionException {
  constructor(message, token, previousToken) {
    super(message, token);
    this.previousToken = previousToken;
    this.name = NO_VIABLE_ALT_EXCEPTION;
  }
};
var NotAllInputParsedException = class extends RecognitionException {
  constructor(message, token) {
    super(message, token);
    this.name = NOT_ALL_INPUT_PARSED_EXCEPTION;
  }
};
var EarlyExitException = class extends RecognitionException {
  constructor(message, token, previousToken) {
    super(message, token);
    this.previousToken = previousToken;
    this.name = EARLY_EXIT_EXCEPTION;
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/recoverable.js
var EOF_FOLLOW_KEY = {};
var IN_RULE_RECOVERY_EXCEPTION = "InRuleRecoveryException";
var InRuleRecoveryException = class extends Error {
  constructor(message) {
    super(message);
    this.name = IN_RULE_RECOVERY_EXCEPTION;
  }
};
var Recoverable = class {
  initRecoverable(config) {
    this.firstAfterRepMap = {};
    this.resyncFollows = {};
    this.recoveryEnabled = has_default(config, "recoveryEnabled") ? config.recoveryEnabled : DEFAULT_PARSER_CONFIG.recoveryEnabled;
    if (this.recoveryEnabled) {
      this.attemptInRepetitionRecovery = attemptInRepetitionRecovery;
    }
  }
  getTokenToInsert(tokType) {
    const tokToInsert = createTokenInstance(tokType, "", NaN, NaN, NaN, NaN, NaN, NaN);
    tokToInsert.isInsertedInRecovery = true;
    return tokToInsert;
  }
  canTokenTypeBeInsertedInRecovery(tokType) {
    return true;
  }
  canTokenTypeBeDeletedInRecovery(tokType) {
    return true;
  }
  tryInRepetitionRecovery(grammarRule, grammarRuleArgs, lookAheadFunc, expectedTokType) {
    const reSyncTokType = this.findReSyncTokenType();
    const savedLexerState = this.exportLexerState();
    const resyncedTokens = [];
    let passedResyncPoint = false;
    const nextTokenWithoutResync = this.LA(1);
    let currToken = this.LA(1);
    const generateErrorMessage = () => {
      const previousToken = this.LA(0);
      const msg = this.errorMessageProvider.buildMismatchTokenMessage({
        expected: expectedTokType,
        actual: nextTokenWithoutResync,
        previous: previousToken,
        ruleName: this.getCurrRuleFullName()
      });
      const error = new MismatchedTokenException(msg, nextTokenWithoutResync, this.LA(0));
      error.resyncedTokens = dropRight_default(resyncedTokens);
      this.SAVE_ERROR(error);
    };
    while (!passedResyncPoint) {
      if (this.tokenMatcher(currToken, expectedTokType)) {
        generateErrorMessage();
        return;
      } else if (lookAheadFunc.call(this)) {
        generateErrorMessage();
        grammarRule.apply(this, grammarRuleArgs);
        return;
      } else if (this.tokenMatcher(currToken, reSyncTokType)) {
        passedResyncPoint = true;
      } else {
        currToken = this.SKIP_TOKEN();
        this.addToResyncTokens(currToken, resyncedTokens);
      }
    }
    this.importLexerState(savedLexerState);
  }
  shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck) {
    if (notStuck === false) {
      return false;
    }
    if (this.tokenMatcher(this.LA(1), expectTokAfterLastMatch)) {
      return false;
    }
    if (this.isBackTracking()) {
      return false;
    }
    if (this.canPerformInRuleRecovery(expectTokAfterLastMatch, this.getFollowsForInRuleRecovery(expectTokAfterLastMatch, nextTokIdx))) {
      return false;
    }
    return true;
  }
  // Error Recovery functionality
  getFollowsForInRuleRecovery(tokType, tokIdxInRule) {
    const grammarPath = this.getCurrentGrammarPath(tokType, tokIdxInRule);
    const follows = this.getNextPossibleTokenTypes(grammarPath);
    return follows;
  }
  tryInRuleRecovery(expectedTokType, follows) {
    if (this.canRecoverWithSingleTokenInsertion(expectedTokType, follows)) {
      const tokToInsert = this.getTokenToInsert(expectedTokType);
      return tokToInsert;
    }
    if (this.canRecoverWithSingleTokenDeletion(expectedTokType)) {
      const nextTok = this.SKIP_TOKEN();
      this.consumeToken();
      return nextTok;
    }
    throw new InRuleRecoveryException("sad sad panda");
  }
  canPerformInRuleRecovery(expectedToken, follows) {
    return this.canRecoverWithSingleTokenInsertion(expectedToken, follows) || this.canRecoverWithSingleTokenDeletion(expectedToken);
  }
  canRecoverWithSingleTokenInsertion(expectedTokType, follows) {
    if (!this.canTokenTypeBeInsertedInRecovery(expectedTokType)) {
      return false;
    }
    if (isEmpty_default(follows)) {
      return false;
    }
    const mismatchedTok = this.LA(1);
    const isMisMatchedTokInFollows = find_default(follows, (possibleFollowsTokType) => {
      return this.tokenMatcher(mismatchedTok, possibleFollowsTokType);
    }) !== void 0;
    return isMisMatchedTokInFollows;
  }
  canRecoverWithSingleTokenDeletion(expectedTokType) {
    if (!this.canTokenTypeBeDeletedInRecovery(expectedTokType)) {
      return false;
    }
    const isNextTokenWhatIsExpected = this.tokenMatcher(this.LA(2), expectedTokType);
    return isNextTokenWhatIsExpected;
  }
  isInCurrentRuleReSyncSet(tokenTypeIdx) {
    const followKey = this.getCurrFollowKey();
    const currentRuleReSyncSet = this.getFollowSetFromFollowKey(followKey);
    return includes_default(currentRuleReSyncSet, tokenTypeIdx);
  }
  findReSyncTokenType() {
    const allPossibleReSyncTokTypes = this.flattenFollowSet();
    let nextToken = this.LA(1);
    let k = 2;
    while (true) {
      const foundMatch = find_default(allPossibleReSyncTokTypes, (resyncTokType) => {
        const canMatch = tokenMatcher(nextToken, resyncTokType);
        return canMatch;
      });
      if (foundMatch !== void 0) {
        return foundMatch;
      }
      nextToken = this.LA(k);
      k++;
    }
  }
  getCurrFollowKey() {
    if (this.RULE_STACK.length === 1) {
      return EOF_FOLLOW_KEY;
    }
    const currRuleShortName = this.getLastExplicitRuleShortName();
    const currRuleIdx = this.getLastExplicitRuleOccurrenceIndex();
    const prevRuleShortName = this.getPreviousExplicitRuleShortName();
    return {
      ruleName: this.shortRuleNameToFullName(currRuleShortName),
      idxInCallingRule: currRuleIdx,
      inRule: this.shortRuleNameToFullName(prevRuleShortName)
    };
  }
  buildFullFollowKeyStack() {
    const explicitRuleStack = this.RULE_STACK;
    const explicitOccurrenceStack = this.RULE_OCCURRENCE_STACK;
    return map_default(explicitRuleStack, (ruleName, idx) => {
      if (idx === 0) {
        return EOF_FOLLOW_KEY;
      }
      return {
        ruleName: this.shortRuleNameToFullName(ruleName),
        idxInCallingRule: explicitOccurrenceStack[idx],
        inRule: this.shortRuleNameToFullName(explicitRuleStack[idx - 1])
      };
    });
  }
  flattenFollowSet() {
    const followStack = map_default(this.buildFullFollowKeyStack(), (currKey) => {
      return this.getFollowSetFromFollowKey(currKey);
    });
    return flatten_default(followStack);
  }
  getFollowSetFromFollowKey(followKey) {
    if (followKey === EOF_FOLLOW_KEY) {
      return [EOF];
    }
    const followName = followKey.ruleName + followKey.idxInCallingRule + IN + followKey.inRule;
    return this.resyncFollows[followName];
  }
  // It does not make any sense to include a virtual EOF token in the list of resynced tokens
  // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
  addToResyncTokens(token, resyncTokens) {
    if (!this.tokenMatcher(token, EOF)) {
      resyncTokens.push(token);
    }
    return resyncTokens;
  }
  reSyncTo(tokType) {
    const resyncedTokens = [];
    let nextTok = this.LA(1);
    while (this.tokenMatcher(nextTok, tokType) === false) {
      nextTok = this.SKIP_TOKEN();
      this.addToResyncTokens(nextTok, resyncedTokens);
    }
    return dropRight_default(resyncedTokens);
  }
  attemptInRepetitionRecovery(prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker, notStuck) {
  }
  getCurrentGrammarPath(tokType, tokIdxInRule) {
    const pathRuleStack = this.getHumanReadableRuleStack();
    const pathOccurrenceStack = clone_default(this.RULE_OCCURRENCE_STACK);
    const grammarPath = {
      ruleStack: pathRuleStack,
      occurrenceStack: pathOccurrenceStack,
      lastTok: tokType,
      lastTokOccurrence: tokIdxInRule
    };
    return grammarPath;
  }
  getHumanReadableRuleStack() {
    return map_default(this.RULE_STACK, (currShortName) => this.shortRuleNameToFullName(currShortName));
  }
};
function attemptInRepetitionRecovery(prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker, notStuck) {
  const key = this.getKeyForAutomaticLookahead(dslMethodIdx, prodOccurrence);
  let firstAfterRepInfo = this.firstAfterRepMap[key];
  if (firstAfterRepInfo === void 0) {
    const currRuleName = this.getCurrRuleFullName();
    const ruleGrammar = this.getGAstProductions()[currRuleName];
    const walker = new nextToksWalker(ruleGrammar, prodOccurrence);
    firstAfterRepInfo = walker.startWalking();
    this.firstAfterRepMap[key] = firstAfterRepInfo;
  }
  let expectTokAfterLastMatch = firstAfterRepInfo.token;
  let nextTokIdx = firstAfterRepInfo.occurrence;
  const isEndOfRule = firstAfterRepInfo.isEndOfRule;
  if (this.RULE_STACK.length === 1 && isEndOfRule && expectTokAfterLastMatch === void 0) {
    expectTokAfterLastMatch = EOF;
    nextTokIdx = 1;
  }
  if (expectTokAfterLastMatch === void 0 || nextTokIdx === void 0) {
    return;
  }
  if (this.shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck)) {
    this.tryInRepetitionRecovery(prodFunc, args, lookaheadFunc, expectTokAfterLastMatch);
  }
}

// ../../node_modules/chevrotain/lib/src/parse/grammar/keys.js
var BITS_FOR_METHOD_TYPE = 4;
var BITS_FOR_OCCURRENCE_IDX = 8;
var BITS_FOR_ALT_IDX = 8;
var OR_IDX = 1 << BITS_FOR_OCCURRENCE_IDX;
var OPTION_IDX = 2 << BITS_FOR_OCCURRENCE_IDX;
var MANY_IDX = 3 << BITS_FOR_OCCURRENCE_IDX;
var AT_LEAST_ONE_IDX = 4 << BITS_FOR_OCCURRENCE_IDX;
var MANY_SEP_IDX = 5 << BITS_FOR_OCCURRENCE_IDX;
var AT_LEAST_ONE_SEP_IDX = 6 << BITS_FOR_OCCURRENCE_IDX;
function getKeyForAutomaticLookahead(ruleIdx, dslMethodIdx, occurrence) {
  return occurrence | dslMethodIdx | ruleIdx;
}
var BITS_START_FOR_ALT_IDX = 32 - BITS_FOR_ALT_IDX;

// ../../node_modules/chevrotain/lib/src/parse/grammar/llk_lookahead.js
var LLkLookaheadStrategy = class {
  constructor(options) {
    var _a;
    this.maxLookahead = (_a = options === null || options === void 0 ? void 0 : options.maxLookahead) !== null && _a !== void 0 ? _a : DEFAULT_PARSER_CONFIG.maxLookahead;
  }
  validate(options) {
    const leftRecursionErrors = this.validateNoLeftRecursion(options.rules);
    if (isEmpty_default(leftRecursionErrors)) {
      const emptyAltErrors = this.validateEmptyOrAlternatives(options.rules);
      const ambiguousAltsErrors = this.validateAmbiguousAlternationAlternatives(options.rules, this.maxLookahead);
      const emptyRepetitionErrors = this.validateSomeNonEmptyLookaheadPath(options.rules, this.maxLookahead);
      const allErrors = [
        ...leftRecursionErrors,
        ...emptyAltErrors,
        ...ambiguousAltsErrors,
        ...emptyRepetitionErrors
      ];
      return allErrors;
    }
    return leftRecursionErrors;
  }
  validateNoLeftRecursion(rules) {
    return flatMap_default(rules, (currTopRule) => validateNoLeftRecursion(currTopRule, currTopRule, defaultGrammarValidatorErrorProvider));
  }
  validateEmptyOrAlternatives(rules) {
    return flatMap_default(rules, (currTopRule) => validateEmptyOrAlternative(currTopRule, defaultGrammarValidatorErrorProvider));
  }
  validateAmbiguousAlternationAlternatives(rules, maxLookahead) {
    return flatMap_default(rules, (currTopRule) => validateAmbiguousAlternationAlternatives(currTopRule, maxLookahead, defaultGrammarValidatorErrorProvider));
  }
  validateSomeNonEmptyLookaheadPath(rules, maxLookahead) {
    return validateSomeNonEmptyLookaheadPath(rules, maxLookahead, defaultGrammarValidatorErrorProvider);
  }
  buildLookaheadForAlternation(options) {
    return buildLookaheadFuncForOr(options.prodOccurrence, options.rule, options.maxLookahead, options.hasPredicates, options.dynamicTokensEnabled, buildAlternativesLookAheadFunc);
  }
  buildLookaheadForOptional(options) {
    return buildLookaheadFuncForOptionalProd(options.prodOccurrence, options.rule, options.maxLookahead, options.dynamicTokensEnabled, getProdType(options.prodType), buildSingleAlternativeLookaheadFunction);
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/looksahead.js
var LooksAhead = class {
  initLooksAhead(config) {
    this.dynamicTokensEnabled = has_default(config, "dynamicTokensEnabled") ? config.dynamicTokensEnabled : DEFAULT_PARSER_CONFIG.dynamicTokensEnabled;
    this.maxLookahead = has_default(config, "maxLookahead") ? config.maxLookahead : DEFAULT_PARSER_CONFIG.maxLookahead;
    this.lookaheadStrategy = has_default(config, "lookaheadStrategy") ? config.lookaheadStrategy : new LLkLookaheadStrategy({ maxLookahead: this.maxLookahead });
    this.lookAheadFuncsCache = /* @__PURE__ */ new Map();
  }
  preComputeLookaheadFunctions(rules) {
    forEach_default(rules, (currRule) => {
      this.TRACE_INIT(`${currRule.name} Rule Lookahead`, () => {
        const { alternation: alternation2, repetition: repetition2, option: option2, repetitionMandatory: repetitionMandatory2, repetitionMandatoryWithSeparator, repetitionWithSeparator } = collectMethods(currRule);
        forEach_default(alternation2, (currProd) => {
          const prodIdx = currProd.idx === 0 ? "" : currProd.idx;
          this.TRACE_INIT(`${getProductionDslName(currProd)}${prodIdx}`, () => {
            const laFunc = this.lookaheadStrategy.buildLookaheadForAlternation({
              prodOccurrence: currProd.idx,
              rule: currRule,
              maxLookahead: currProd.maxLookahead || this.maxLookahead,
              hasPredicates: currProd.hasPredicates,
              dynamicTokensEnabled: this.dynamicTokensEnabled
            });
            const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[currRule.name], OR_IDX, currProd.idx);
            this.setLaFuncCache(key, laFunc);
          });
        });
        forEach_default(repetition2, (currProd) => {
          this.computeLookaheadFunc(currRule, currProd.idx, MANY_IDX, "Repetition", currProd.maxLookahead, getProductionDslName(currProd));
        });
        forEach_default(option2, (currProd) => {
          this.computeLookaheadFunc(currRule, currProd.idx, OPTION_IDX, "Option", currProd.maxLookahead, getProductionDslName(currProd));
        });
        forEach_default(repetitionMandatory2, (currProd) => {
          this.computeLookaheadFunc(currRule, currProd.idx, AT_LEAST_ONE_IDX, "RepetitionMandatory", currProd.maxLookahead, getProductionDslName(currProd));
        });
        forEach_default(repetitionMandatoryWithSeparator, (currProd) => {
          this.computeLookaheadFunc(currRule, currProd.idx, AT_LEAST_ONE_SEP_IDX, "RepetitionMandatoryWithSeparator", currProd.maxLookahead, getProductionDslName(currProd));
        });
        forEach_default(repetitionWithSeparator, (currProd) => {
          this.computeLookaheadFunc(currRule, currProd.idx, MANY_SEP_IDX, "RepetitionWithSeparator", currProd.maxLookahead, getProductionDslName(currProd));
        });
      });
    });
  }
  computeLookaheadFunc(rule, prodOccurrence, prodKey, prodType, prodMaxLookahead, dslMethodName) {
    this.TRACE_INIT(`${dslMethodName}${prodOccurrence === 0 ? "" : prodOccurrence}`, () => {
      const laFunc = this.lookaheadStrategy.buildLookaheadForOptional({
        prodOccurrence,
        rule,
        maxLookahead: prodMaxLookahead || this.maxLookahead,
        dynamicTokensEnabled: this.dynamicTokensEnabled,
        prodType
      });
      const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[rule.name], prodKey, prodOccurrence);
      this.setLaFuncCache(key, laFunc);
    });
  }
  // this actually returns a number, but it is always used as a string (object prop key)
  getKeyForAutomaticLookahead(dslMethodIdx, occurrence) {
    const currRuleShortName = this.getLastExplicitRuleShortName();
    return getKeyForAutomaticLookahead(currRuleShortName, dslMethodIdx, occurrence);
  }
  getLaFuncFromCache(key) {
    return this.lookAheadFuncsCache.get(key);
  }
  /* istanbul ignore next */
  setLaFuncCache(key, value) {
    this.lookAheadFuncsCache.set(key, value);
  }
};
var DslMethodsCollectorVisitor = class extends GAstVisitor {
  constructor() {
    super(...arguments);
    this.dslMethods = {
      option: [],
      alternation: [],
      repetition: [],
      repetitionWithSeparator: [],
      repetitionMandatory: [],
      repetitionMandatoryWithSeparator: []
    };
  }
  reset() {
    this.dslMethods = {
      option: [],
      alternation: [],
      repetition: [],
      repetitionWithSeparator: [],
      repetitionMandatory: [],
      repetitionMandatoryWithSeparator: []
    };
  }
  visitOption(option2) {
    this.dslMethods.option.push(option2);
  }
  visitRepetitionWithSeparator(manySep) {
    this.dslMethods.repetitionWithSeparator.push(manySep);
  }
  visitRepetitionMandatory(atLeastOne) {
    this.dslMethods.repetitionMandatory.push(atLeastOne);
  }
  visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
    this.dslMethods.repetitionMandatoryWithSeparator.push(atLeastOneSep);
  }
  visitRepetition(many) {
    this.dslMethods.repetition.push(many);
  }
  visitAlternation(or) {
    this.dslMethods.alternation.push(or);
  }
};
var collectorVisitor = new DslMethodsCollectorVisitor();
function collectMethods(rule) {
  collectorVisitor.reset();
  rule.accept(collectorVisitor);
  const dslMethods = collectorVisitor.dslMethods;
  collectorVisitor.reset();
  return dslMethods;
}

// ../../node_modules/chevrotain/lib/src/parse/cst/cst.js
function setNodeLocationOnlyOffset(currNodeLocation, newLocationInfo) {
  if (isNaN(currNodeLocation.startOffset) === true) {
    currNodeLocation.startOffset = newLocationInfo.startOffset;
    currNodeLocation.endOffset = newLocationInfo.endOffset;
  } else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
    currNodeLocation.endOffset = newLocationInfo.endOffset;
  }
}
function setNodeLocationFull(currNodeLocation, newLocationInfo) {
  if (isNaN(currNodeLocation.startOffset) === true) {
    currNodeLocation.startOffset = newLocationInfo.startOffset;
    currNodeLocation.startColumn = newLocationInfo.startColumn;
    currNodeLocation.startLine = newLocationInfo.startLine;
    currNodeLocation.endOffset = newLocationInfo.endOffset;
    currNodeLocation.endColumn = newLocationInfo.endColumn;
    currNodeLocation.endLine = newLocationInfo.endLine;
  } else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
    currNodeLocation.endOffset = newLocationInfo.endOffset;
    currNodeLocation.endColumn = newLocationInfo.endColumn;
    currNodeLocation.endLine = newLocationInfo.endLine;
  }
}
function addTerminalToCst(node, token, tokenTypeName) {
  if (node.children[tokenTypeName] === void 0) {
    node.children[tokenTypeName] = [token];
  } else {
    node.children[tokenTypeName].push(token);
  }
}
function addNoneTerminalToCst(node, ruleName, ruleResult) {
  if (node.children[ruleName] === void 0) {
    node.children[ruleName] = [ruleResult];
  } else {
    node.children[ruleName].push(ruleResult);
  }
}

// ../../node_modules/chevrotain/lib/src/lang/lang_extensions.js
var NAME = "name";
function defineNameProp(obj, nameValue) {
  Object.defineProperty(obj, NAME, {
    enumerable: false,
    configurable: true,
    writable: false,
    value: nameValue
  });
}

// ../../node_modules/chevrotain/lib/src/parse/cst/cst_visitor.js
function defaultVisit(ctx, param) {
  const childrenNames = keys_default(ctx);
  const childrenNamesLength = childrenNames.length;
  for (let i = 0; i < childrenNamesLength; i++) {
    const currChildName = childrenNames[i];
    const currChildArray = ctx[currChildName];
    const currChildArrayLength = currChildArray.length;
    for (let j = 0; j < currChildArrayLength; j++) {
      const currChild = currChildArray[j];
      if (currChild.tokenTypeIdx === void 0) {
        this[currChild.name](currChild.children, param);
      }
    }
  }
}
function createBaseSemanticVisitorConstructor(grammarName, ruleNames) {
  const derivedConstructor = function() {
  };
  defineNameProp(derivedConstructor, grammarName + "BaseSemantics");
  const semanticProto = {
    visit: function(cstNode, param) {
      if (isArray_default(cstNode)) {
        cstNode = cstNode[0];
      }
      if (isUndefined_default(cstNode)) {
        return void 0;
      }
      return this[cstNode.name](cstNode.children, param);
    },
    validateVisitor: function() {
      const semanticDefinitionErrors = validateVisitor(this, ruleNames);
      if (!isEmpty_default(semanticDefinitionErrors)) {
        const errorMessages = map_default(semanticDefinitionErrors, (currDefError) => currDefError.msg);
        throw Error(`Errors Detected in CST Visitor <${this.constructor.name}>:
	${errorMessages.join("\n\n").replace(/\n/g, "\n	")}`);
      }
    }
  };
  derivedConstructor.prototype = semanticProto;
  derivedConstructor.prototype.constructor = derivedConstructor;
  derivedConstructor._RULE_NAMES = ruleNames;
  return derivedConstructor;
}
function createBaseVisitorConstructorWithDefaults(grammarName, ruleNames, baseConstructor) {
  const derivedConstructor = function() {
  };
  defineNameProp(derivedConstructor, grammarName + "BaseSemanticsWithDefaults");
  const withDefaultsProto = Object.create(baseConstructor.prototype);
  forEach_default(ruleNames, (ruleName) => {
    withDefaultsProto[ruleName] = defaultVisit;
  });
  derivedConstructor.prototype = withDefaultsProto;
  derivedConstructor.prototype.constructor = derivedConstructor;
  return derivedConstructor;
}
var CstVisitorDefinitionError;
(function(CstVisitorDefinitionError2) {
  CstVisitorDefinitionError2[CstVisitorDefinitionError2["REDUNDANT_METHOD"] = 0] = "REDUNDANT_METHOD";
  CstVisitorDefinitionError2[CstVisitorDefinitionError2["MISSING_METHOD"] = 1] = "MISSING_METHOD";
})(CstVisitorDefinitionError || (CstVisitorDefinitionError = {}));
function validateVisitor(visitorInstance, ruleNames) {
  const missingErrors = validateMissingCstMethods(visitorInstance, ruleNames);
  return missingErrors;
}
function validateMissingCstMethods(visitorInstance, ruleNames) {
  const missingRuleNames = filter_default(ruleNames, (currRuleName) => {
    return isFunction_default(visitorInstance[currRuleName]) === false;
  });
  const errors = map_default(missingRuleNames, (currRuleName) => {
    return {
      msg: `Missing visitor method: <${currRuleName}> on ${visitorInstance.constructor.name} CST Visitor.`,
      type: CstVisitorDefinitionError.MISSING_METHOD,
      methodName: currRuleName
    };
  });
  return compact_default(errors);
}

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/tree_builder.js
var TreeBuilder = class {
  initTreeBuilder(config) {
    this.CST_STACK = [];
    this.outputCst = config.outputCst;
    this.nodeLocationTracking = has_default(config, "nodeLocationTracking") ? config.nodeLocationTracking : DEFAULT_PARSER_CONFIG.nodeLocationTracking;
    if (!this.outputCst) {
      this.cstInvocationStateUpdate = noop_default;
      this.cstFinallyStateUpdate = noop_default;
      this.cstPostTerminal = noop_default;
      this.cstPostNonTerminal = noop_default;
      this.cstPostRule = noop_default;
    } else {
      if (/full/i.test(this.nodeLocationTracking)) {
        if (this.recoveryEnabled) {
          this.setNodeLocationFromToken = setNodeLocationFull;
          this.setNodeLocationFromNode = setNodeLocationFull;
          this.cstPostRule = noop_default;
          this.setInitialNodeLocation = this.setInitialNodeLocationFullRecovery;
        } else {
          this.setNodeLocationFromToken = noop_default;
          this.setNodeLocationFromNode = noop_default;
          this.cstPostRule = this.cstPostRuleFull;
          this.setInitialNodeLocation = this.setInitialNodeLocationFullRegular;
        }
      } else if (/onlyOffset/i.test(this.nodeLocationTracking)) {
        if (this.recoveryEnabled) {
          this.setNodeLocationFromToken = setNodeLocationOnlyOffset;
          this.setNodeLocationFromNode = setNodeLocationOnlyOffset;
          this.cstPostRule = noop_default;
          this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRecovery;
        } else {
          this.setNodeLocationFromToken = noop_default;
          this.setNodeLocationFromNode = noop_default;
          this.cstPostRule = this.cstPostRuleOnlyOffset;
          this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRegular;
        }
      } else if (/none/i.test(this.nodeLocationTracking)) {
        this.setNodeLocationFromToken = noop_default;
        this.setNodeLocationFromNode = noop_default;
        this.cstPostRule = noop_default;
        this.setInitialNodeLocation = noop_default;
      } else {
        throw Error(`Invalid <nodeLocationTracking> config option: "${config.nodeLocationTracking}"`);
      }
    }
  }
  setInitialNodeLocationOnlyOffsetRecovery(cstNode) {
    cstNode.location = {
      startOffset: NaN,
      endOffset: NaN
    };
  }
  setInitialNodeLocationOnlyOffsetRegular(cstNode) {
    cstNode.location = {
      // without error recovery the starting Location of a new CstNode is guaranteed
      // To be the next Token's startOffset (for valid inputs).
      // For invalid inputs there won't be any CSTOutput so this potential
      // inaccuracy does not matter
      startOffset: this.LA(1).startOffset,
      endOffset: NaN
    };
  }
  setInitialNodeLocationFullRecovery(cstNode) {
    cstNode.location = {
      startOffset: NaN,
      startLine: NaN,
      startColumn: NaN,
      endOffset: NaN,
      endLine: NaN,
      endColumn: NaN
    };
  }
  /**
       *  @see setInitialNodeLocationOnlyOffsetRegular for explanation why this work
  
       * @param cstNode
       */
  setInitialNodeLocationFullRegular(cstNode) {
    const nextToken = this.LA(1);
    cstNode.location = {
      startOffset: nextToken.startOffset,
      startLine: nextToken.startLine,
      startColumn: nextToken.startColumn,
      endOffset: NaN,
      endLine: NaN,
      endColumn: NaN
    };
  }
  cstInvocationStateUpdate(fullRuleName) {
    const cstNode = {
      name: fullRuleName,
      children: /* @__PURE__ */ Object.create(null)
    };
    this.setInitialNodeLocation(cstNode);
    this.CST_STACK.push(cstNode);
  }
  cstFinallyStateUpdate() {
    this.CST_STACK.pop();
  }
  cstPostRuleFull(ruleCstNode) {
    const prevToken = this.LA(0);
    const loc = ruleCstNode.location;
    if (loc.startOffset <= prevToken.startOffset === true) {
      loc.endOffset = prevToken.endOffset;
      loc.endLine = prevToken.endLine;
      loc.endColumn = prevToken.endColumn;
    } else {
      loc.startOffset = NaN;
      loc.startLine = NaN;
      loc.startColumn = NaN;
    }
  }
  cstPostRuleOnlyOffset(ruleCstNode) {
    const prevToken = this.LA(0);
    const loc = ruleCstNode.location;
    if (loc.startOffset <= prevToken.startOffset === true) {
      loc.endOffset = prevToken.endOffset;
    } else {
      loc.startOffset = NaN;
    }
  }
  cstPostTerminal(key, consumedToken) {
    const rootCst = this.CST_STACK[this.CST_STACK.length - 1];
    addTerminalToCst(rootCst, consumedToken, key);
    this.setNodeLocationFromToken(rootCst.location, consumedToken);
  }
  cstPostNonTerminal(ruleCstResult, ruleName) {
    const preCstNode = this.CST_STACK[this.CST_STACK.length - 1];
    addNoneTerminalToCst(preCstNode, ruleName, ruleCstResult);
    this.setNodeLocationFromNode(preCstNode.location, ruleCstResult.location);
  }
  getBaseCstVisitorConstructor() {
    if (isUndefined_default(this.baseCstVisitorConstructor)) {
      const newBaseCstVisitorConstructor = createBaseSemanticVisitorConstructor(this.className, keys_default(this.gastProductionsCache));
      this.baseCstVisitorConstructor = newBaseCstVisitorConstructor;
      return newBaseCstVisitorConstructor;
    }
    return this.baseCstVisitorConstructor;
  }
  getBaseCstVisitorConstructorWithDefaults() {
    if (isUndefined_default(this.baseCstVisitorWithDefaultsConstructor)) {
      const newConstructor = createBaseVisitorConstructorWithDefaults(this.className, keys_default(this.gastProductionsCache), this.getBaseCstVisitorConstructor());
      this.baseCstVisitorWithDefaultsConstructor = newConstructor;
      return newConstructor;
    }
    return this.baseCstVisitorWithDefaultsConstructor;
  }
  getLastExplicitRuleShortName() {
    const ruleStack = this.RULE_STACK;
    return ruleStack[ruleStack.length - 1];
  }
  getPreviousExplicitRuleShortName() {
    const ruleStack = this.RULE_STACK;
    return ruleStack[ruleStack.length - 2];
  }
  getLastExplicitRuleOccurrenceIndex() {
    const occurrenceStack = this.RULE_OCCURRENCE_STACK;
    return occurrenceStack[occurrenceStack.length - 1];
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/lexer_adapter.js
var LexerAdapter = class {
  initLexerAdapter() {
    this.tokVector = [];
    this.tokVectorLength = 0;
    this.currIdx = -1;
  }
  set input(newInput) {
    if (this.selfAnalysisDone !== true) {
      throw Error(`Missing <performSelfAnalysis> invocation at the end of the Parser's constructor.`);
    }
    this.reset();
    this.tokVector = newInput;
    this.tokVectorLength = newInput.length;
  }
  get input() {
    return this.tokVector;
  }
  // skips a token and returns the next token
  SKIP_TOKEN() {
    if (this.currIdx <= this.tokVector.length - 2) {
      this.consumeToken();
      return this.LA(1);
    } else {
      return END_OF_FILE;
    }
  }
  // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
  // or lexers dependent on parser context.
  LA(howMuch) {
    const soughtIdx = this.currIdx + howMuch;
    if (soughtIdx < 0 || this.tokVectorLength <= soughtIdx) {
      return END_OF_FILE;
    } else {
      return this.tokVector[soughtIdx];
    }
  }
  consumeToken() {
    this.currIdx++;
  }
  exportLexerState() {
    return this.currIdx;
  }
  importLexerState(newState2) {
    this.currIdx = newState2;
  }
  resetLexerState() {
    this.currIdx = -1;
  }
  moveToTerminatedState() {
    this.currIdx = this.tokVector.length - 1;
  }
  getLexerPosition() {
    return this.exportLexerState();
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/recognizer_api.js
var RecognizerApi = class {
  ACTION(impl) {
    return impl.call(this);
  }
  consume(idx, tokType, options) {
    return this.consumeInternal(tokType, idx, options);
  }
  subrule(idx, ruleToCall, options) {
    return this.subruleInternal(ruleToCall, idx, options);
  }
  option(idx, actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, idx);
  }
  or(idx, altsOrOpts) {
    return this.orInternal(altsOrOpts, idx);
  }
  many(idx, actionORMethodDef) {
    return this.manyInternal(idx, actionORMethodDef);
  }
  atLeastOne(idx, actionORMethodDef) {
    return this.atLeastOneInternal(idx, actionORMethodDef);
  }
  CONSUME(tokType, options) {
    return this.consumeInternal(tokType, 0, options);
  }
  CONSUME1(tokType, options) {
    return this.consumeInternal(tokType, 1, options);
  }
  CONSUME2(tokType, options) {
    return this.consumeInternal(tokType, 2, options);
  }
  CONSUME3(tokType, options) {
    return this.consumeInternal(tokType, 3, options);
  }
  CONSUME4(tokType, options) {
    return this.consumeInternal(tokType, 4, options);
  }
  CONSUME5(tokType, options) {
    return this.consumeInternal(tokType, 5, options);
  }
  CONSUME6(tokType, options) {
    return this.consumeInternal(tokType, 6, options);
  }
  CONSUME7(tokType, options) {
    return this.consumeInternal(tokType, 7, options);
  }
  CONSUME8(tokType, options) {
    return this.consumeInternal(tokType, 8, options);
  }
  CONSUME9(tokType, options) {
    return this.consumeInternal(tokType, 9, options);
  }
  SUBRULE(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 0, options);
  }
  SUBRULE1(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 1, options);
  }
  SUBRULE2(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 2, options);
  }
  SUBRULE3(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 3, options);
  }
  SUBRULE4(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 4, options);
  }
  SUBRULE5(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 5, options);
  }
  SUBRULE6(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 6, options);
  }
  SUBRULE7(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 7, options);
  }
  SUBRULE8(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 8, options);
  }
  SUBRULE9(ruleToCall, options) {
    return this.subruleInternal(ruleToCall, 9, options);
  }
  OPTION(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 0);
  }
  OPTION1(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 1);
  }
  OPTION2(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 2);
  }
  OPTION3(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 3);
  }
  OPTION4(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 4);
  }
  OPTION5(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 5);
  }
  OPTION6(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 6);
  }
  OPTION7(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 7);
  }
  OPTION8(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 8);
  }
  OPTION9(actionORMethodDef) {
    return this.optionInternal(actionORMethodDef, 9);
  }
  OR(altsOrOpts) {
    return this.orInternal(altsOrOpts, 0);
  }
  OR1(altsOrOpts) {
    return this.orInternal(altsOrOpts, 1);
  }
  OR2(altsOrOpts) {
    return this.orInternal(altsOrOpts, 2);
  }
  OR3(altsOrOpts) {
    return this.orInternal(altsOrOpts, 3);
  }
  OR4(altsOrOpts) {
    return this.orInternal(altsOrOpts, 4);
  }
  OR5(altsOrOpts) {
    return this.orInternal(altsOrOpts, 5);
  }
  OR6(altsOrOpts) {
    return this.orInternal(altsOrOpts, 6);
  }
  OR7(altsOrOpts) {
    return this.orInternal(altsOrOpts, 7);
  }
  OR8(altsOrOpts) {
    return this.orInternal(altsOrOpts, 8);
  }
  OR9(altsOrOpts) {
    return this.orInternal(altsOrOpts, 9);
  }
  MANY(actionORMethodDef) {
    this.manyInternal(0, actionORMethodDef);
  }
  MANY1(actionORMethodDef) {
    this.manyInternal(1, actionORMethodDef);
  }
  MANY2(actionORMethodDef) {
    this.manyInternal(2, actionORMethodDef);
  }
  MANY3(actionORMethodDef) {
    this.manyInternal(3, actionORMethodDef);
  }
  MANY4(actionORMethodDef) {
    this.manyInternal(4, actionORMethodDef);
  }
  MANY5(actionORMethodDef) {
    this.manyInternal(5, actionORMethodDef);
  }
  MANY6(actionORMethodDef) {
    this.manyInternal(6, actionORMethodDef);
  }
  MANY7(actionORMethodDef) {
    this.manyInternal(7, actionORMethodDef);
  }
  MANY8(actionORMethodDef) {
    this.manyInternal(8, actionORMethodDef);
  }
  MANY9(actionORMethodDef) {
    this.manyInternal(9, actionORMethodDef);
  }
  MANY_SEP(options) {
    this.manySepFirstInternal(0, options);
  }
  MANY_SEP1(options) {
    this.manySepFirstInternal(1, options);
  }
  MANY_SEP2(options) {
    this.manySepFirstInternal(2, options);
  }
  MANY_SEP3(options) {
    this.manySepFirstInternal(3, options);
  }
  MANY_SEP4(options) {
    this.manySepFirstInternal(4, options);
  }
  MANY_SEP5(options) {
    this.manySepFirstInternal(5, options);
  }
  MANY_SEP6(options) {
    this.manySepFirstInternal(6, options);
  }
  MANY_SEP7(options) {
    this.manySepFirstInternal(7, options);
  }
  MANY_SEP8(options) {
    this.manySepFirstInternal(8, options);
  }
  MANY_SEP9(options) {
    this.manySepFirstInternal(9, options);
  }
  AT_LEAST_ONE(actionORMethodDef) {
    this.atLeastOneInternal(0, actionORMethodDef);
  }
  AT_LEAST_ONE1(actionORMethodDef) {
    return this.atLeastOneInternal(1, actionORMethodDef);
  }
  AT_LEAST_ONE2(actionORMethodDef) {
    this.atLeastOneInternal(2, actionORMethodDef);
  }
  AT_LEAST_ONE3(actionORMethodDef) {
    this.atLeastOneInternal(3, actionORMethodDef);
  }
  AT_LEAST_ONE4(actionORMethodDef) {
    this.atLeastOneInternal(4, actionORMethodDef);
  }
  AT_LEAST_ONE5(actionORMethodDef) {
    this.atLeastOneInternal(5, actionORMethodDef);
  }
  AT_LEAST_ONE6(actionORMethodDef) {
    this.atLeastOneInternal(6, actionORMethodDef);
  }
  AT_LEAST_ONE7(actionORMethodDef) {
    this.atLeastOneInternal(7, actionORMethodDef);
  }
  AT_LEAST_ONE8(actionORMethodDef) {
    this.atLeastOneInternal(8, actionORMethodDef);
  }
  AT_LEAST_ONE9(actionORMethodDef) {
    this.atLeastOneInternal(9, actionORMethodDef);
  }
  AT_LEAST_ONE_SEP(options) {
    this.atLeastOneSepFirstInternal(0, options);
  }
  AT_LEAST_ONE_SEP1(options) {
    this.atLeastOneSepFirstInternal(1, options);
  }
  AT_LEAST_ONE_SEP2(options) {
    this.atLeastOneSepFirstInternal(2, options);
  }
  AT_LEAST_ONE_SEP3(options) {
    this.atLeastOneSepFirstInternal(3, options);
  }
  AT_LEAST_ONE_SEP4(options) {
    this.atLeastOneSepFirstInternal(4, options);
  }
  AT_LEAST_ONE_SEP5(options) {
    this.atLeastOneSepFirstInternal(5, options);
  }
  AT_LEAST_ONE_SEP6(options) {
    this.atLeastOneSepFirstInternal(6, options);
  }
  AT_LEAST_ONE_SEP7(options) {
    this.atLeastOneSepFirstInternal(7, options);
  }
  AT_LEAST_ONE_SEP8(options) {
    this.atLeastOneSepFirstInternal(8, options);
  }
  AT_LEAST_ONE_SEP9(options) {
    this.atLeastOneSepFirstInternal(9, options);
  }
  RULE(name, implementation, config = DEFAULT_RULE_CONFIG) {
    if (includes_default(this.definedRulesNames, name)) {
      const errMsg = defaultGrammarValidatorErrorProvider.buildDuplicateRuleNameError({
        topLevelRule: name,
        grammarName: this.className
      });
      const error = {
        message: errMsg,
        type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
        ruleName: name
      };
      this.definitionErrors.push(error);
    }
    this.definedRulesNames.push(name);
    const ruleImplementation = this.defineRule(name, implementation, config);
    this[name] = ruleImplementation;
    return ruleImplementation;
  }
  OVERRIDE_RULE(name, impl, config = DEFAULT_RULE_CONFIG) {
    const ruleErrors = validateRuleIsOverridden(name, this.definedRulesNames, this.className);
    this.definitionErrors = this.definitionErrors.concat(ruleErrors);
    const ruleImplementation = this.defineRule(name, impl, config);
    this[name] = ruleImplementation;
    return ruleImplementation;
  }
  BACKTRACK(grammarRule, args) {
    return function() {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        grammarRule.apply(this, args);
        return true;
      } catch (e) {
        if (isRecognitionException(e)) {
          return false;
        } else {
          throw e;
        }
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    };
  }
  // GAST export APIs
  getGAstProductions() {
    return this.gastProductionsCache;
  }
  getSerializedGastProductions() {
    return serializeGrammar(values_default(this.gastProductionsCache));
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/recognizer_engine.js
var RecognizerEngine = class {
  initRecognizerEngine(tokenVocabulary, config) {
    this.className = this.constructor.name;
    this.shortRuleNameToFull = {};
    this.fullRuleNameToShort = {};
    this.ruleShortNameIdx = 256;
    this.tokenMatcher = tokenStructuredMatcherNoCategories;
    this.subruleIdx = 0;
    this.definedRulesNames = [];
    this.tokensMap = {};
    this.isBackTrackingStack = [];
    this.RULE_STACK = [];
    this.RULE_OCCURRENCE_STACK = [];
    this.gastProductionsCache = {};
    if (has_default(config, "serializedGrammar")) {
      throw Error("The Parser's configuration can no longer contain a <serializedGrammar> property.\n	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_6-0-0\n	For Further details.");
    }
    if (isArray_default(tokenVocabulary)) {
      if (isEmpty_default(tokenVocabulary)) {
        throw Error("A Token Vocabulary cannot be empty.\n	Note that the first argument for the parser constructor\n	is no longer a Token vector (since v4.0).");
      }
      if (typeof tokenVocabulary[0].startOffset === "number") {
        throw Error("The Parser constructor no longer accepts a token vector as the first argument.\n	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_4-0-0\n	For Further details.");
      }
    }
    if (isArray_default(tokenVocabulary)) {
      this.tokensMap = reduce_default(tokenVocabulary, (acc, tokType) => {
        acc[tokType.name] = tokType;
        return acc;
      }, {});
    } else if (has_default(tokenVocabulary, "modes") && every_default(flatten_default(values_default(tokenVocabulary.modes)), isTokenType)) {
      const allTokenTypes2 = flatten_default(values_default(tokenVocabulary.modes));
      const uniqueTokens = uniq_default(allTokenTypes2);
      this.tokensMap = reduce_default(uniqueTokens, (acc, tokType) => {
        acc[tokType.name] = tokType;
        return acc;
      }, {});
    } else if (isObject_default(tokenVocabulary)) {
      this.tokensMap = clone_default(tokenVocabulary);
    } else {
      throw new Error("<tokensDictionary> argument must be An Array of Token constructors, A dictionary of Token constructors or an IMultiModeLexerDefinition");
    }
    this.tokensMap["EOF"] = EOF;
    const allTokenTypes = has_default(tokenVocabulary, "modes") ? flatten_default(values_default(tokenVocabulary.modes)) : values_default(tokenVocabulary);
    const noTokenCategoriesUsed = every_default(allTokenTypes, (tokenConstructor) => isEmpty_default(tokenConstructor.categoryMatches));
    this.tokenMatcher = noTokenCategoriesUsed ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
    augmentTokenTypes(values_default(this.tokensMap));
  }
  defineRule(ruleName, impl, config) {
    if (this.selfAnalysisDone) {
      throw Error(`Grammar rule <${ruleName}> may not be defined after the 'performSelfAnalysis' method has been called'
Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.`);
    }
    const resyncEnabled = has_default(config, "resyncEnabled") ? config.resyncEnabled : DEFAULT_RULE_CONFIG.resyncEnabled;
    const recoveryValueFunc = has_default(config, "recoveryValueFunc") ? config.recoveryValueFunc : DEFAULT_RULE_CONFIG.recoveryValueFunc;
    const shortName = this.ruleShortNameIdx << BITS_FOR_METHOD_TYPE + BITS_FOR_OCCURRENCE_IDX;
    this.ruleShortNameIdx++;
    this.shortRuleNameToFull[shortName] = ruleName;
    this.fullRuleNameToShort[ruleName] = shortName;
    let invokeRuleWithTry;
    if (this.outputCst === true) {
      invokeRuleWithTry = function invokeRuleWithTry2(...args) {
        try {
          this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx);
          impl.apply(this, args);
          const cst = this.CST_STACK[this.CST_STACK.length - 1];
          this.cstPostRule(cst);
          return cst;
        } catch (e) {
          return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc);
        } finally {
          this.ruleFinallyStateUpdate();
        }
      };
    } else {
      invokeRuleWithTry = function invokeRuleWithTryCst(...args) {
        try {
          this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx);
          return impl.apply(this, args);
        } catch (e) {
          return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc);
        } finally {
          this.ruleFinallyStateUpdate();
        }
      };
    }
    const wrappedGrammarRule = Object.assign(invokeRuleWithTry, { ruleName, originalGrammarAction: impl });
    return wrappedGrammarRule;
  }
  invokeRuleCatch(e, resyncEnabledConfig, recoveryValueFunc) {
    const isFirstInvokedRule = this.RULE_STACK.length === 1;
    const reSyncEnabled = resyncEnabledConfig && !this.isBackTracking() && this.recoveryEnabled;
    if (isRecognitionException(e)) {
      const recogError = e;
      if (reSyncEnabled) {
        const reSyncTokType = this.findReSyncTokenType();
        if (this.isInCurrentRuleReSyncSet(reSyncTokType)) {
          recogError.resyncedTokens = this.reSyncTo(reSyncTokType);
          if (this.outputCst) {
            const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
            partialCstResult.recoveredNode = true;
            return partialCstResult;
          } else {
            return recoveryValueFunc(e);
          }
        } else {
          if (this.outputCst) {
            const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
            partialCstResult.recoveredNode = true;
            recogError.partialCstResult = partialCstResult;
          }
          throw recogError;
        }
      } else if (isFirstInvokedRule) {
        this.moveToTerminatedState();
        return recoveryValueFunc(e);
      } else {
        throw recogError;
      }
    } else {
      throw e;
    }
  }
  // Implementation of parsing DSL
  optionInternal(actionORMethodDef, occurrence) {
    const key = this.getKeyForAutomaticLookahead(OPTION_IDX, occurrence);
    return this.optionInternalLogic(actionORMethodDef, occurrence, key);
  }
  optionInternalLogic(actionORMethodDef, occurrence, key) {
    let lookAheadFunc = this.getLaFuncFromCache(key);
    let action;
    if (typeof actionORMethodDef !== "function") {
      action = actionORMethodDef.DEF;
      const predicate = actionORMethodDef.GATE;
      if (predicate !== void 0) {
        const orgLookaheadFunction = lookAheadFunc;
        lookAheadFunc = () => {
          return predicate.call(this) && orgLookaheadFunction.call(this);
        };
      }
    } else {
      action = actionORMethodDef;
    }
    if (lookAheadFunc.call(this) === true) {
      return action.call(this);
    }
    return void 0;
  }
  atLeastOneInternal(prodOccurrence, actionORMethodDef) {
    const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_IDX, prodOccurrence);
    return this.atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, laKey);
  }
  atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, key) {
    let lookAheadFunc = this.getLaFuncFromCache(key);
    let action;
    if (typeof actionORMethodDef !== "function") {
      action = actionORMethodDef.DEF;
      const predicate = actionORMethodDef.GATE;
      if (predicate !== void 0) {
        const orgLookaheadFunction = lookAheadFunc;
        lookAheadFunc = () => {
          return predicate.call(this) && orgLookaheadFunction.call(this);
        };
      }
    } else {
      action = actionORMethodDef;
    }
    if (lookAheadFunc.call(this) === true) {
      let notStuck = this.doSingleRepetition(action);
      while (lookAheadFunc.call(this) === true && notStuck === true) {
        notStuck = this.doSingleRepetition(action);
      }
    } else {
      throw this.raiseEarlyExitException(prodOccurrence, PROD_TYPE.REPETITION_MANDATORY, actionORMethodDef.ERR_MSG);
    }
    this.attemptInRepetitionRecovery(this.atLeastOneInternal, [prodOccurrence, actionORMethodDef], lookAheadFunc, AT_LEAST_ONE_IDX, prodOccurrence, NextTerminalAfterAtLeastOneWalker);
  }
  atLeastOneSepFirstInternal(prodOccurrence, options) {
    const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_SEP_IDX, prodOccurrence);
    this.atLeastOneSepFirstInternalLogic(prodOccurrence, options, laKey);
  }
  atLeastOneSepFirstInternalLogic(prodOccurrence, options, key) {
    const action = options.DEF;
    const separator = options.SEP;
    const firstIterationLookaheadFunc = this.getLaFuncFromCache(key);
    if (firstIterationLookaheadFunc.call(this) === true) {
      action.call(this);
      const separatorLookAheadFunc = () => {
        return this.tokenMatcher(this.LA(1), separator);
      };
      while (this.tokenMatcher(this.LA(1), separator) === true) {
        this.CONSUME(separator);
        action.call(this);
      }
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        prodOccurrence,
        separator,
        separatorLookAheadFunc,
        action,
        NextTerminalAfterAtLeastOneSepWalker
      ], separatorLookAheadFunc, AT_LEAST_ONE_SEP_IDX, prodOccurrence, NextTerminalAfterAtLeastOneSepWalker);
    } else {
      throw this.raiseEarlyExitException(prodOccurrence, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, options.ERR_MSG);
    }
  }
  manyInternal(prodOccurrence, actionORMethodDef) {
    const laKey = this.getKeyForAutomaticLookahead(MANY_IDX, prodOccurrence);
    return this.manyInternalLogic(prodOccurrence, actionORMethodDef, laKey);
  }
  manyInternalLogic(prodOccurrence, actionORMethodDef, key) {
    let lookaheadFunction = this.getLaFuncFromCache(key);
    let action;
    if (typeof actionORMethodDef !== "function") {
      action = actionORMethodDef.DEF;
      const predicate = actionORMethodDef.GATE;
      if (predicate !== void 0) {
        const orgLookaheadFunction = lookaheadFunction;
        lookaheadFunction = () => {
          return predicate.call(this) && orgLookaheadFunction.call(this);
        };
      }
    } else {
      action = actionORMethodDef;
    }
    let notStuck = true;
    while (lookaheadFunction.call(this) === true && notStuck === true) {
      notStuck = this.doSingleRepetition(action);
    }
    this.attemptInRepetitionRecovery(
      this.manyInternal,
      [prodOccurrence, actionORMethodDef],
      lookaheadFunction,
      MANY_IDX,
      prodOccurrence,
      NextTerminalAfterManyWalker,
      // The notStuck parameter is only relevant when "attemptInRepetitionRecovery"
      // is invoked from manyInternal, in the MANY_SEP case and AT_LEAST_ONE[_SEP]
      // An infinite loop cannot occur as:
      // - Either the lookahead is guaranteed to consume something (Single Token Separator)
      // - AT_LEAST_ONE by definition is guaranteed to consume something (or error out).
      notStuck
    );
  }
  manySepFirstInternal(prodOccurrence, options) {
    const laKey = this.getKeyForAutomaticLookahead(MANY_SEP_IDX, prodOccurrence);
    this.manySepFirstInternalLogic(prodOccurrence, options, laKey);
  }
  manySepFirstInternalLogic(prodOccurrence, options, key) {
    const action = options.DEF;
    const separator = options.SEP;
    const firstIterationLaFunc = this.getLaFuncFromCache(key);
    if (firstIterationLaFunc.call(this) === true) {
      action.call(this);
      const separatorLookAheadFunc = () => {
        return this.tokenMatcher(this.LA(1), separator);
      };
      while (this.tokenMatcher(this.LA(1), separator) === true) {
        this.CONSUME(separator);
        action.call(this);
      }
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        prodOccurrence,
        separator,
        separatorLookAheadFunc,
        action,
        NextTerminalAfterManySepWalker
      ], separatorLookAheadFunc, MANY_SEP_IDX, prodOccurrence, NextTerminalAfterManySepWalker);
    }
  }
  repetitionSepSecondInternal(prodOccurrence, separator, separatorLookAheadFunc, action, nextTerminalAfterWalker) {
    while (separatorLookAheadFunc()) {
      this.CONSUME(separator);
      action.call(this);
    }
    this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
      prodOccurrence,
      separator,
      separatorLookAheadFunc,
      action,
      nextTerminalAfterWalker
    ], separatorLookAheadFunc, AT_LEAST_ONE_SEP_IDX, prodOccurrence, nextTerminalAfterWalker);
  }
  doSingleRepetition(action) {
    const beforeIteration = this.getLexerPosition();
    action.call(this);
    const afterIteration = this.getLexerPosition();
    return afterIteration > beforeIteration;
  }
  orInternal(altsOrOpts, occurrence) {
    const laKey = this.getKeyForAutomaticLookahead(OR_IDX, occurrence);
    const alts = isArray_default(altsOrOpts) ? altsOrOpts : altsOrOpts.DEF;
    const laFunc = this.getLaFuncFromCache(laKey);
    const altIdxToTake = laFunc.call(this, alts);
    if (altIdxToTake !== void 0) {
      const chosenAlternative = alts[altIdxToTake];
      return chosenAlternative.ALT.call(this);
    }
    this.raiseNoAltException(occurrence, altsOrOpts.ERR_MSG);
  }
  ruleFinallyStateUpdate() {
    this.RULE_STACK.pop();
    this.RULE_OCCURRENCE_STACK.pop();
    this.cstFinallyStateUpdate();
    if (this.RULE_STACK.length === 0 && this.isAtEndOfInput() === false) {
      const firstRedundantTok = this.LA(1);
      const errMsg = this.errorMessageProvider.buildNotAllInputParsedMessage({
        firstRedundant: firstRedundantTok,
        ruleName: this.getCurrRuleFullName()
      });
      this.SAVE_ERROR(new NotAllInputParsedException(errMsg, firstRedundantTok));
    }
  }
  subruleInternal(ruleToCall, idx, options) {
    let ruleResult;
    try {
      const args = options !== void 0 ? options.ARGS : void 0;
      this.subruleIdx = idx;
      ruleResult = ruleToCall.apply(this, args);
      this.cstPostNonTerminal(ruleResult, options !== void 0 && options.LABEL !== void 0 ? options.LABEL : ruleToCall.ruleName);
      return ruleResult;
    } catch (e) {
      throw this.subruleInternalError(e, options, ruleToCall.ruleName);
    }
  }
  subruleInternalError(e, options, ruleName) {
    if (isRecognitionException(e) && e.partialCstResult !== void 0) {
      this.cstPostNonTerminal(e.partialCstResult, options !== void 0 && options.LABEL !== void 0 ? options.LABEL : ruleName);
      delete e.partialCstResult;
    }
    throw e;
  }
  consumeInternal(tokType, idx, options) {
    let consumedToken;
    try {
      const nextToken = this.LA(1);
      if (this.tokenMatcher(nextToken, tokType) === true) {
        this.consumeToken();
        consumedToken = nextToken;
      } else {
        this.consumeInternalError(tokType, nextToken, options);
      }
    } catch (eFromConsumption) {
      consumedToken = this.consumeInternalRecovery(tokType, idx, eFromConsumption);
    }
    this.cstPostTerminal(options !== void 0 && options.LABEL !== void 0 ? options.LABEL : tokType.name, consumedToken);
    return consumedToken;
  }
  consumeInternalError(tokType, nextToken, options) {
    let msg;
    const previousToken = this.LA(0);
    if (options !== void 0 && options.ERR_MSG) {
      msg = options.ERR_MSG;
    } else {
      msg = this.errorMessageProvider.buildMismatchTokenMessage({
        expected: tokType,
        actual: nextToken,
        previous: previousToken,
        ruleName: this.getCurrRuleFullName()
      });
    }
    throw this.SAVE_ERROR(new MismatchedTokenException(msg, nextToken, previousToken));
  }
  consumeInternalRecovery(tokType, idx, eFromConsumption) {
    if (this.recoveryEnabled && // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
    eFromConsumption.name === "MismatchedTokenException" && !this.isBackTracking()) {
      const follows = this.getFollowsForInRuleRecovery(tokType, idx);
      try {
        return this.tryInRuleRecovery(tokType, follows);
      } catch (eFromInRuleRecovery) {
        if (eFromInRuleRecovery.name === IN_RULE_RECOVERY_EXCEPTION) {
          throw eFromConsumption;
        } else {
          throw eFromInRuleRecovery;
        }
      }
    } else {
      throw eFromConsumption;
    }
  }
  saveRecogState() {
    const savedErrors = this.errors;
    const savedRuleStack = clone_default(this.RULE_STACK);
    return {
      errors: savedErrors,
      lexerState: this.exportLexerState(),
      RULE_STACK: savedRuleStack,
      CST_STACK: this.CST_STACK
    };
  }
  reloadRecogState(newState2) {
    this.errors = newState2.errors;
    this.importLexerState(newState2.lexerState);
    this.RULE_STACK = newState2.RULE_STACK;
  }
  ruleInvocationStateUpdate(shortName, fullName, idxInCallingRule) {
    this.RULE_OCCURRENCE_STACK.push(idxInCallingRule);
    this.RULE_STACK.push(shortName);
    this.cstInvocationStateUpdate(fullName);
  }
  isBackTracking() {
    return this.isBackTrackingStack.length !== 0;
  }
  getCurrRuleFullName() {
    const shortName = this.getLastExplicitRuleShortName();
    return this.shortRuleNameToFull[shortName];
  }
  shortRuleNameToFullName(shortName) {
    return this.shortRuleNameToFull[shortName];
  }
  isAtEndOfInput() {
    return this.tokenMatcher(this.LA(1), EOF);
  }
  reset() {
    this.resetLexerState();
    this.subruleIdx = 0;
    this.isBackTrackingStack = [];
    this.errors = [];
    this.RULE_STACK = [];
    this.CST_STACK = [];
    this.RULE_OCCURRENCE_STACK = [];
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/error_handler.js
var ErrorHandler = class {
  initErrorHandler(config) {
    this._errors = [];
    this.errorMessageProvider = has_default(config, "errorMessageProvider") ? config.errorMessageProvider : DEFAULT_PARSER_CONFIG.errorMessageProvider;
  }
  SAVE_ERROR(error) {
    if (isRecognitionException(error)) {
      error.context = {
        ruleStack: this.getHumanReadableRuleStack(),
        ruleOccurrenceStack: clone_default(this.RULE_OCCURRENCE_STACK)
      };
      this._errors.push(error);
      return error;
    } else {
      throw Error("Trying to save an Error which is not a RecognitionException");
    }
  }
  get errors() {
    return clone_default(this._errors);
  }
  set errors(newErrors) {
    this._errors = newErrors;
  }
  // TODO: consider caching the error message computed information
  raiseEarlyExitException(occurrence, prodType, userDefinedErrMsg) {
    const ruleName = this.getCurrRuleFullName();
    const ruleGrammar = this.getGAstProductions()[ruleName];
    const lookAheadPathsPerAlternative = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, this.maxLookahead);
    const insideProdPaths = lookAheadPathsPerAlternative[0];
    const actualTokens = [];
    for (let i = 1; i <= this.maxLookahead; i++) {
      actualTokens.push(this.LA(i));
    }
    const msg = this.errorMessageProvider.buildEarlyExitMessage({
      expectedIterationPaths: insideProdPaths,
      actual: actualTokens,
      previous: this.LA(0),
      customUserDescription: userDefinedErrMsg,
      ruleName
    });
    throw this.SAVE_ERROR(new EarlyExitException(msg, this.LA(1), this.LA(0)));
  }
  // TODO: consider caching the error message computed information
  raiseNoAltException(occurrence, errMsgTypes) {
    const ruleName = this.getCurrRuleFullName();
    const ruleGrammar = this.getGAstProductions()[ruleName];
    const lookAheadPathsPerAlternative = getLookaheadPathsForOr(occurrence, ruleGrammar, this.maxLookahead);
    const actualTokens = [];
    for (let i = 1; i <= this.maxLookahead; i++) {
      actualTokens.push(this.LA(i));
    }
    const previousToken = this.LA(0);
    const errMsg = this.errorMessageProvider.buildNoViableAltMessage({
      expectedPathsPerAlt: lookAheadPathsPerAlternative,
      actual: actualTokens,
      previous: previousToken,
      customUserDescription: errMsgTypes,
      ruleName: this.getCurrRuleFullName()
    });
    throw this.SAVE_ERROR(new NoViableAltException(errMsg, this.LA(1), previousToken));
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/context_assist.js
var ContentAssist = class {
  initContentAssist() {
  }
  computeContentAssist(startRuleName, precedingInput) {
    const startRuleGast = this.gastProductionsCache[startRuleName];
    if (isUndefined_default(startRuleGast)) {
      throw Error(`Rule ->${startRuleName}<- does not exist in this grammar.`);
    }
    return nextPossibleTokensAfter([startRuleGast], precedingInput, this.tokenMatcher, this.maxLookahead);
  }
  // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
  // TODO: should this be more explicitly part of the public API?
  getNextPossibleTokenTypes(grammarPath) {
    const topRuleName = head_default(grammarPath.ruleStack);
    const gastProductions = this.getGAstProductions();
    const topProduction = gastProductions[topRuleName];
    const nextPossibleTokenTypes = new NextAfterTokenWalker(topProduction, grammarPath).startWalking();
    return nextPossibleTokenTypes;
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/gast_recorder.js
var RECORDING_NULL_OBJECT = {
  description: "This Object indicates the Parser is during Recording Phase"
};
Object.freeze(RECORDING_NULL_OBJECT);
var HANDLE_SEPARATOR = true;
var MAX_METHOD_IDX = Math.pow(2, BITS_FOR_OCCURRENCE_IDX) - 1;
var RFT = createToken({ name: "RECORDING_PHASE_TOKEN", pattern: Lexer.NA });
augmentTokenTypes([RFT]);
var RECORDING_PHASE_TOKEN = createTokenInstance(
  RFT,
  "This IToken indicates the Parser is in Recording Phase\n	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details",
  // Using "-1" instead of NaN (as in EOF) because an actual number is less likely to
  // cause errors if the output of LA or CONSUME would be (incorrectly) used during the recording phase.
  -1,
  -1,
  -1,
  -1,
  -1,
  -1
);
Object.freeze(RECORDING_PHASE_TOKEN);
var RECORDING_PHASE_CSTNODE = {
  name: "This CSTNode indicates the Parser is in Recording Phase\n	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details",
  children: {}
};
var GastRecorder = class {
  initGastRecorder(config) {
    this.recordingProdStack = [];
    this.RECORDING_PHASE = false;
  }
  enableRecording() {
    this.RECORDING_PHASE = true;
    this.TRACE_INIT("Enable Recording", () => {
      for (let i = 0; i < 10; i++) {
        const idx = i > 0 ? i : "";
        this[`CONSUME${idx}`] = function(arg1, arg2) {
          return this.consumeInternalRecord(arg1, i, arg2);
        };
        this[`SUBRULE${idx}`] = function(arg1, arg2) {
          return this.subruleInternalRecord(arg1, i, arg2);
        };
        this[`OPTION${idx}`] = function(arg1) {
          return this.optionInternalRecord(arg1, i);
        };
        this[`OR${idx}`] = function(arg1) {
          return this.orInternalRecord(arg1, i);
        };
        this[`MANY${idx}`] = function(arg1) {
          this.manyInternalRecord(i, arg1);
        };
        this[`MANY_SEP${idx}`] = function(arg1) {
          this.manySepFirstInternalRecord(i, arg1);
        };
        this[`AT_LEAST_ONE${idx}`] = function(arg1) {
          this.atLeastOneInternalRecord(i, arg1);
        };
        this[`AT_LEAST_ONE_SEP${idx}`] = function(arg1) {
          this.atLeastOneSepFirstInternalRecord(i, arg1);
        };
      }
      this[`consume`] = function(idx, arg1, arg2) {
        return this.consumeInternalRecord(arg1, idx, arg2);
      };
      this[`subrule`] = function(idx, arg1, arg2) {
        return this.subruleInternalRecord(arg1, idx, arg2);
      };
      this[`option`] = function(idx, arg1) {
        return this.optionInternalRecord(arg1, idx);
      };
      this[`or`] = function(idx, arg1) {
        return this.orInternalRecord(arg1, idx);
      };
      this[`many`] = function(idx, arg1) {
        this.manyInternalRecord(idx, arg1);
      };
      this[`atLeastOne`] = function(idx, arg1) {
        this.atLeastOneInternalRecord(idx, arg1);
      };
      this.ACTION = this.ACTION_RECORD;
      this.BACKTRACK = this.BACKTRACK_RECORD;
      this.LA = this.LA_RECORD;
    });
  }
  disableRecording() {
    this.RECORDING_PHASE = false;
    this.TRACE_INIT("Deleting Recording methods", () => {
      const that = this;
      for (let i = 0; i < 10; i++) {
        const idx = i > 0 ? i : "";
        delete that[`CONSUME${idx}`];
        delete that[`SUBRULE${idx}`];
        delete that[`OPTION${idx}`];
        delete that[`OR${idx}`];
        delete that[`MANY${idx}`];
        delete that[`MANY_SEP${idx}`];
        delete that[`AT_LEAST_ONE${idx}`];
        delete that[`AT_LEAST_ONE_SEP${idx}`];
      }
      delete that[`consume`];
      delete that[`subrule`];
      delete that[`option`];
      delete that[`or`];
      delete that[`many`];
      delete that[`atLeastOne`];
      delete that.ACTION;
      delete that.BACKTRACK;
      delete that.LA;
    });
  }
  //   Parser methods are called inside an ACTION?
  //   Maybe try/catch/finally on ACTIONS while disabling the recorders state changes?
  // @ts-expect-error -- noop place holder
  ACTION_RECORD(impl) {
  }
  // Executing backtracking logic will break our recording logic assumptions
  BACKTRACK_RECORD(grammarRule, args) {
    return () => true;
  }
  // LA is part of the official API and may be used for custom lookahead logic
  // by end users who may forget to wrap it in ACTION or inside a GATE
  LA_RECORD(howMuch) {
    return END_OF_FILE;
  }
  topLevelRuleRecord(name, def) {
    try {
      const newTopLevelRule = new Rule({ definition: [], name });
      newTopLevelRule.name = name;
      this.recordingProdStack.push(newTopLevelRule);
      def.call(this);
      this.recordingProdStack.pop();
      return newTopLevelRule;
    } catch (originalError) {
      if (originalError.KNOWN_RECORDER_ERROR !== true) {
        try {
          originalError.message = originalError.message + '\n	 This error was thrown during the "grammar recording phase" For more info see:\n	https://chevrotain.io/docs/guide/internals.html#grammar-recording';
        } catch (mutabilityError) {
          throw originalError;
        }
      }
      throw originalError;
    }
  }
  // Implementation of parsing DSL
  optionInternalRecord(actionORMethodDef, occurrence) {
    return recordProd.call(this, Option, actionORMethodDef, occurrence);
  }
  atLeastOneInternalRecord(occurrence, actionORMethodDef) {
    recordProd.call(this, RepetitionMandatory, actionORMethodDef, occurrence);
  }
  atLeastOneSepFirstInternalRecord(occurrence, options) {
    recordProd.call(this, RepetitionMandatoryWithSeparator, options, occurrence, HANDLE_SEPARATOR);
  }
  manyInternalRecord(occurrence, actionORMethodDef) {
    recordProd.call(this, Repetition, actionORMethodDef, occurrence);
  }
  manySepFirstInternalRecord(occurrence, options) {
    recordProd.call(this, RepetitionWithSeparator, options, occurrence, HANDLE_SEPARATOR);
  }
  orInternalRecord(altsOrOpts, occurrence) {
    return recordOrProd.call(this, altsOrOpts, occurrence);
  }
  subruleInternalRecord(ruleToCall, occurrence, options) {
    assertMethodIdxIsValid(occurrence);
    if (!ruleToCall || has_default(ruleToCall, "ruleName") === false) {
      const error = new Error(`<SUBRULE${getIdxSuffix(occurrence)}> argument is invalid expecting a Parser method reference but got: <${JSON.stringify(ruleToCall)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      error.KNOWN_RECORDER_ERROR = true;
      throw error;
    }
    const prevProd = last_default(this.recordingProdStack);
    const ruleName = ruleToCall.ruleName;
    const newNoneTerminal = new NonTerminal({
      idx: occurrence,
      nonTerminalName: ruleName,
      label: options === null || options === void 0 ? void 0 : options.LABEL,
      // The resolving of the `referencedRule` property will be done once all the Rule's GASTs have been created
      referencedRule: void 0
    });
    prevProd.definition.push(newNoneTerminal);
    return this.outputCst ? RECORDING_PHASE_CSTNODE : RECORDING_NULL_OBJECT;
  }
  consumeInternalRecord(tokType, occurrence, options) {
    assertMethodIdxIsValid(occurrence);
    if (!hasShortKeyProperty(tokType)) {
      const error = new Error(`<CONSUME${getIdxSuffix(occurrence)}> argument is invalid expecting a TokenType reference but got: <${JSON.stringify(tokType)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      error.KNOWN_RECORDER_ERROR = true;
      throw error;
    }
    const prevProd = last_default(this.recordingProdStack);
    const newNoneTerminal = new Terminal({
      idx: occurrence,
      terminalType: tokType,
      label: options === null || options === void 0 ? void 0 : options.LABEL
    });
    prevProd.definition.push(newNoneTerminal);
    return RECORDING_PHASE_TOKEN;
  }
};
function recordProd(prodConstructor, mainProdArg, occurrence, handleSep = false) {
  assertMethodIdxIsValid(occurrence);
  const prevProd = last_default(this.recordingProdStack);
  const grammarAction = isFunction_default(mainProdArg) ? mainProdArg : mainProdArg.DEF;
  const newProd = new prodConstructor({ definition: [], idx: occurrence });
  if (handleSep) {
    newProd.separator = mainProdArg.SEP;
  }
  if (has_default(mainProdArg, "MAX_LOOKAHEAD")) {
    newProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD;
  }
  this.recordingProdStack.push(newProd);
  grammarAction.call(this);
  prevProd.definition.push(newProd);
  this.recordingProdStack.pop();
  return RECORDING_NULL_OBJECT;
}
function recordOrProd(mainProdArg, occurrence) {
  assertMethodIdxIsValid(occurrence);
  const prevProd = last_default(this.recordingProdStack);
  const hasOptions = isArray_default(mainProdArg) === false;
  const alts = hasOptions === false ? mainProdArg : mainProdArg.DEF;
  const newOrProd = new Alternation({
    definition: [],
    idx: occurrence,
    ignoreAmbiguities: hasOptions && mainProdArg.IGNORE_AMBIGUITIES === true
  });
  if (has_default(mainProdArg, "MAX_LOOKAHEAD")) {
    newOrProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD;
  }
  const hasPredicates = some_default(alts, (currAlt) => isFunction_default(currAlt.GATE));
  newOrProd.hasPredicates = hasPredicates;
  prevProd.definition.push(newOrProd);
  forEach_default(alts, (currAlt) => {
    const currAltFlat = new Alternative({ definition: [] });
    newOrProd.definition.push(currAltFlat);
    if (has_default(currAlt, "IGNORE_AMBIGUITIES")) {
      currAltFlat.ignoreAmbiguities = currAlt.IGNORE_AMBIGUITIES;
    } else if (has_default(currAlt, "GATE")) {
      currAltFlat.ignoreAmbiguities = true;
    }
    this.recordingProdStack.push(currAltFlat);
    currAlt.ALT.call(this);
    this.recordingProdStack.pop();
  });
  return RECORDING_NULL_OBJECT;
}
function getIdxSuffix(idx) {
  return idx === 0 ? "" : `${idx}`;
}
function assertMethodIdxIsValid(idx) {
  if (idx < 0 || idx > MAX_METHOD_IDX) {
    const error = new Error(
      // The stack trace will contain all the needed details
      `Invalid DSL Method idx value: <${idx}>
	Idx value must be a none negative value smaller than ${MAX_METHOD_IDX + 1}`
    );
    error.KNOWN_RECORDER_ERROR = true;
    throw error;
  }
}

// ../../node_modules/chevrotain/lib/src/parse/parser/traits/perf_tracer.js
var PerformanceTracer = class {
  initPerformanceTracer(config) {
    if (has_default(config, "traceInitPerf")) {
      const userTraceInitPerf = config.traceInitPerf;
      const traceIsNumber = typeof userTraceInitPerf === "number";
      this.traceInitMaxIdent = traceIsNumber ? userTraceInitPerf : Infinity;
      this.traceInitPerf = traceIsNumber ? userTraceInitPerf > 0 : userTraceInitPerf;
    } else {
      this.traceInitMaxIdent = 0;
      this.traceInitPerf = DEFAULT_PARSER_CONFIG.traceInitPerf;
    }
    this.traceInitIndent = -1;
  }
  TRACE_INIT(phaseDesc, phaseImpl) {
    if (this.traceInitPerf === true) {
      this.traceInitIndent++;
      const indent = new Array(this.traceInitIndent + 1).join("	");
      if (this.traceInitIndent < this.traceInitMaxIdent) {
        console.log(`${indent}--> <${phaseDesc}>`);
      }
      const { time, value } = timer(phaseImpl);
      const traceMethod = time > 10 ? console.warn : console.log;
      if (this.traceInitIndent < this.traceInitMaxIdent) {
        traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`);
      }
      this.traceInitIndent--;
      return value;
    } else {
      return phaseImpl();
    }
  }
};

// ../../node_modules/chevrotain/lib/src/parse/parser/utils/apply_mixins.js
function applyMixins(derivedCtor, baseCtors) {
  baseCtors.forEach((baseCtor) => {
    const baseProto = baseCtor.prototype;
    Object.getOwnPropertyNames(baseProto).forEach((propName) => {
      if (propName === "constructor") {
        return;
      }
      const basePropDescriptor = Object.getOwnPropertyDescriptor(baseProto, propName);
      if (basePropDescriptor && (basePropDescriptor.get || basePropDescriptor.set)) {
        Object.defineProperty(derivedCtor.prototype, propName, basePropDescriptor);
      } else {
        derivedCtor.prototype[propName] = baseCtor.prototype[propName];
      }
    });
  });
}

// ../../node_modules/chevrotain/lib/src/parse/parser/parser.js
var END_OF_FILE = createTokenInstance(EOF, "", NaN, NaN, NaN, NaN, NaN, NaN);
Object.freeze(END_OF_FILE);
var DEFAULT_PARSER_CONFIG = Object.freeze({
  recoveryEnabled: false,
  maxLookahead: 3,
  dynamicTokensEnabled: false,
  outputCst: true,
  errorMessageProvider: defaultParserErrorProvider,
  nodeLocationTracking: "none",
  traceInitPerf: false,
  skipValidations: false
});
var DEFAULT_RULE_CONFIG = Object.freeze({
  recoveryValueFunc: () => void 0,
  resyncEnabled: true
});
var ParserDefinitionErrorType;
(function(ParserDefinitionErrorType2) {
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_RULE_NAME"] = 0] = "INVALID_RULE_NAME";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["DUPLICATE_RULE_NAME"] = 1] = "DUPLICATE_RULE_NAME";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_RULE_OVERRIDE"] = 2] = "INVALID_RULE_OVERRIDE";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["DUPLICATE_PRODUCTIONS"] = 3] = "DUPLICATE_PRODUCTIONS";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["UNRESOLVED_SUBRULE_REF"] = 4] = "UNRESOLVED_SUBRULE_REF";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["LEFT_RECURSION"] = 5] = "LEFT_RECURSION";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["NONE_LAST_EMPTY_ALT"] = 6] = "NONE_LAST_EMPTY_ALT";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["AMBIGUOUS_ALTS"] = 7] = "AMBIGUOUS_ALTS";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["CONFLICT_TOKENS_RULES_NAMESPACE"] = 8] = "CONFLICT_TOKENS_RULES_NAMESPACE";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_TOKEN_NAME"] = 9] = "INVALID_TOKEN_NAME";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["NO_NON_EMPTY_LOOKAHEAD"] = 10] = "NO_NON_EMPTY_LOOKAHEAD";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["AMBIGUOUS_PREFIX_ALTS"] = 11] = "AMBIGUOUS_PREFIX_ALTS";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["TOO_MANY_ALTS"] = 12] = "TOO_MANY_ALTS";
  ParserDefinitionErrorType2[ParserDefinitionErrorType2["CUSTOM_LOOKAHEAD_VALIDATION"] = 13] = "CUSTOM_LOOKAHEAD_VALIDATION";
})(ParserDefinitionErrorType || (ParserDefinitionErrorType = {}));
var Parser = class _Parser {
  /**
   *  @deprecated use the **instance** method with the same name instead
   */
  static performSelfAnalysis(parserInstance) {
    throw Error("The **static** `performSelfAnalysis` method has been deprecated.	\nUse the **instance** method with the same name instead.");
  }
  performSelfAnalysis() {
    this.TRACE_INIT("performSelfAnalysis", () => {
      let defErrorsMsgs;
      this.selfAnalysisDone = true;
      const className = this.className;
      this.TRACE_INIT("toFastProps", () => {
        toFastProperties(this);
      });
      this.TRACE_INIT("Grammar Recording", () => {
        try {
          this.enableRecording();
          forEach_default(this.definedRulesNames, (currRuleName) => {
            const wrappedRule = this[currRuleName];
            const originalGrammarAction = wrappedRule["originalGrammarAction"];
            let recordedRuleGast;
            this.TRACE_INIT(`${currRuleName} Rule`, () => {
              recordedRuleGast = this.topLevelRuleRecord(currRuleName, originalGrammarAction);
            });
            this.gastProductionsCache[currRuleName] = recordedRuleGast;
          });
        } finally {
          this.disableRecording();
        }
      });
      let resolverErrors = [];
      this.TRACE_INIT("Grammar Resolving", () => {
        resolverErrors = resolveGrammar2({
          rules: values_default(this.gastProductionsCache)
        });
        this.definitionErrors = this.definitionErrors.concat(resolverErrors);
      });
      this.TRACE_INIT("Grammar Validations", () => {
        if (isEmpty_default(resolverErrors) && this.skipValidations === false) {
          const validationErrors = validateGrammar2({
            rules: values_default(this.gastProductionsCache),
            tokenTypes: values_default(this.tokensMap),
            errMsgProvider: defaultGrammarValidatorErrorProvider,
            grammarName: className
          });
          const lookaheadValidationErrors = validateLookahead({
            lookaheadStrategy: this.lookaheadStrategy,
            rules: values_default(this.gastProductionsCache),
            tokenTypes: values_default(this.tokensMap),
            grammarName: className
          });
          this.definitionErrors = this.definitionErrors.concat(validationErrors, lookaheadValidationErrors);
        }
      });
      if (isEmpty_default(this.definitionErrors)) {
        if (this.recoveryEnabled) {
          this.TRACE_INIT("computeAllProdsFollows", () => {
            const allFollows = computeAllProdsFollows(values_default(this.gastProductionsCache));
            this.resyncFollows = allFollows;
          });
        }
        this.TRACE_INIT("ComputeLookaheadFunctions", () => {
          var _a, _b;
          (_b = (_a = this.lookaheadStrategy).initialize) === null || _b === void 0 ? void 0 : _b.call(_a, {
            rules: values_default(this.gastProductionsCache)
          });
          this.preComputeLookaheadFunctions(values_default(this.gastProductionsCache));
        });
      }
      if (!_Parser.DEFER_DEFINITION_ERRORS_HANDLING && !isEmpty_default(this.definitionErrors)) {
        defErrorsMsgs = map_default(this.definitionErrors, (defError) => defError.message);
        throw new Error(`Parser Definition Errors detected:
 ${defErrorsMsgs.join("\n-------------------------------\n")}`);
      }
    });
  }
  constructor(tokenVocabulary, config) {
    this.definitionErrors = [];
    this.selfAnalysisDone = false;
    const that = this;
    that.initErrorHandler(config);
    that.initLexerAdapter();
    that.initLooksAhead(config);
    that.initRecognizerEngine(tokenVocabulary, config);
    that.initRecoverable(config);
    that.initTreeBuilder(config);
    that.initContentAssist();
    that.initGastRecorder(config);
    that.initPerformanceTracer(config);
    if (has_default(config, "ignoredIssues")) {
      throw new Error("The <ignoredIssues> IParserConfig property has been deprecated.\n	Please use the <IGNORE_AMBIGUITIES> flag on the relevant DSL method instead.\n	See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#IGNORING_AMBIGUITIES\n	For further details.");
    }
    this.skipValidations = has_default(config, "skipValidations") ? config.skipValidations : DEFAULT_PARSER_CONFIG.skipValidations;
  }
};
Parser.DEFER_DEFINITION_ERRORS_HANDLING = false;
applyMixins(Parser, [
  Recoverable,
  LooksAhead,
  TreeBuilder,
  LexerAdapter,
  RecognizerEngine,
  RecognizerApi,
  ErrorHandler,
  ContentAssist,
  GastRecorder,
  PerformanceTracer
]);
var CstParser = class extends Parser {
  constructor(tokenVocabulary, config = DEFAULT_PARSER_CONFIG) {
    const configClone = clone_default(config);
    configClone.outputCst = true;
    super(tokenVocabulary, configClone);
  }
};

// ../../node_modules/java-parser/src/tokens.js
var import_camelCase = __toESM(require_camelCase(), 1);

// ../../node_modules/java-parser/src/unicodesets.js
var addRanges = (set, rangesArr) => {
  for (let i = 0; i < rangesArr.length; i++) {
    const range = rangesArr[i];
    const start = range[0];
    const end = range[1];
    for (let codePoint = start; codePoint <= end; codePoint++) {
      set.add(codePoint);
    }
  }
};
var fic = /* @__PURE__ */ new Set([
  181,
  257,
  259,
  261,
  263,
  265,
  267,
  269,
  271,
  273,
  275,
  277,
  279,
  281,
  283,
  285,
  287,
  289,
  291,
  293,
  295,
  297,
  299,
  301,
  303,
  305,
  307,
  309,
  314,
  316,
  318,
  320,
  322,
  324,
  326,
  331,
  333,
  335,
  337,
  339,
  341,
  343,
  345,
  347,
  349,
  351,
  353,
  355,
  357,
  359,
  361,
  363,
  365,
  367,
  369,
  371,
  373,
  375,
  378,
  380,
  387,
  389,
  392,
  402,
  405,
  414,
  417,
  419,
  421,
  424,
  429,
  432,
  436,
  438,
  454,
  457,
  460,
  462,
  464,
  466,
  468,
  470,
  472,
  474,
  479,
  481,
  483,
  485,
  487,
  489,
  491,
  493,
  499,
  501,
  505,
  507,
  509,
  511,
  513,
  515,
  517,
  519,
  521,
  523,
  525,
  527,
  529,
  531,
  533,
  535,
  537,
  539,
  541,
  543,
  545,
  547,
  549,
  551,
  553,
  555,
  557,
  559,
  561,
  572,
  578,
  583,
  585,
  587,
  589,
  881,
  883,
  887,
  912,
  985,
  987,
  989,
  991,
  993,
  995,
  997,
  999,
  1001,
  1003,
  1005,
  1013,
  1016,
  1121,
  1123,
  1125,
  1127,
  1129,
  1131,
  1133,
  1135,
  1137,
  1139,
  1141,
  1143,
  1145,
  1147,
  1149,
  1151,
  1153,
  1163,
  1165,
  1167,
  1169,
  1171,
  1173,
  1175,
  1177,
  1179,
  1181,
  1183,
  1185,
  1187,
  1189,
  1191,
  1193,
  1195,
  1197,
  1199,
  1201,
  1203,
  1205,
  1207,
  1209,
  1211,
  1213,
  1215,
  1218,
  1220,
  1222,
  1224,
  1226,
  1228,
  1233,
  1235,
  1237,
  1239,
  1241,
  1243,
  1245,
  1247,
  1249,
  1251,
  1253,
  1255,
  1257,
  1259,
  1261,
  1263,
  1265,
  1267,
  1269,
  1271,
  1273,
  1275,
  1277,
  1279,
  1281,
  1283,
  1285,
  1287,
  1289,
  1291,
  1293,
  1295,
  1297,
  1299,
  1301,
  1303,
  1305,
  1307,
  1309,
  1311,
  1313,
  1315,
  1317,
  1319,
  1321,
  1323,
  1325,
  1327,
  7681,
  7683,
  7685,
  7687,
  7689,
  7691,
  7693,
  7695,
  7697,
  7699,
  7701,
  7703,
  7705,
  7707,
  7709,
  7711,
  7713,
  7715,
  7717,
  7719,
  7721,
  7723,
  7725,
  7727,
  7729,
  7731,
  7733,
  7735,
  7737,
  7739,
  7741,
  7743,
  7745,
  7747,
  7749,
  7751,
  7753,
  7755,
  7757,
  7759,
  7761,
  7763,
  7765,
  7767,
  7769,
  7771,
  7773,
  7775,
  7777,
  7779,
  7781,
  7783,
  7785,
  7787,
  7789,
  7791,
  7793,
  7795,
  7797,
  7799,
  7801,
  7803,
  7805,
  7807,
  7809,
  7811,
  7813,
  7815,
  7817,
  7819,
  7821,
  7823,
  7825,
  7827,
  7839,
  7841,
  7843,
  7845,
  7847,
  7849,
  7851,
  7853,
  7855,
  7857,
  7859,
  7861,
  7863,
  7865,
  7867,
  7869,
  7871,
  7873,
  7875,
  7877,
  7879,
  7881,
  7883,
  7885,
  7887,
  7889,
  7891,
  7893,
  7895,
  7897,
  7899,
  7901,
  7903,
  7905,
  7907,
  7909,
  7911,
  7913,
  7915,
  7917,
  7919,
  7921,
  7923,
  7925,
  7927,
  7929,
  7931,
  7933,
  8126,
  8458,
  8467,
  8495,
  8500,
  8505,
  8526,
  8580,
  11361,
  11368,
  11370,
  11372,
  11377,
  11393,
  11395,
  11397,
  11399,
  11401,
  11403,
  11405,
  11407,
  11409,
  11411,
  11413,
  11415,
  11417,
  11419,
  11421,
  11423,
  11425,
  11427,
  11429,
  11431,
  11433,
  11435,
  11437,
  11439,
  11441,
  11443,
  11445,
  11447,
  11449,
  11451,
  11453,
  11455,
  11457,
  11459,
  11461,
  11463,
  11465,
  11467,
  11469,
  11471,
  11473,
  11475,
  11477,
  11479,
  11481,
  11483,
  11485,
  11487,
  11489,
  11500,
  11502,
  11507,
  11559,
  11565,
  42561,
  42563,
  42565,
  42567,
  42569,
  42571,
  42573,
  42575,
  42577,
  42579,
  42581,
  42583,
  42585,
  42587,
  42589,
  42591,
  42593,
  42595,
  42597,
  42599,
  42601,
  42603,
  42605,
  42625,
  42627,
  42629,
  42631,
  42633,
  42635,
  42637,
  42639,
  42641,
  42643,
  42645,
  42647,
  42649,
  42651,
  42787,
  42789,
  42791,
  42793,
  42795,
  42797,
  42803,
  42805,
  42807,
  42809,
  42811,
  42813,
  42815,
  42817,
  42819,
  42821,
  42823,
  42825,
  42827,
  42829,
  42831,
  42833,
  42835,
  42837,
  42839,
  42841,
  42843,
  42845,
  42847,
  42849,
  42851,
  42853,
  42855,
  42857,
  42859,
  42861,
  42863,
  42874,
  42876,
  42879,
  42881,
  42883,
  42885,
  42887,
  42892,
  42894,
  42897,
  42903,
  42905,
  42907,
  42909,
  42911,
  42913,
  42915,
  42917,
  42919,
  42921,
  42927,
  42933,
  42935,
  42937,
  42939,
  42941,
  42943,
  42947,
  43002,
  119995,
  120779,
  748,
  750,
  884,
  890,
  1369,
  1600,
  2042,
  2074,
  2084,
  2088,
  2417,
  3654,
  3782,
  4348,
  6103,
  6211,
  6823,
  7544,
  8305,
  8319,
  11631,
  11823,
  12293,
  12347,
  40981,
  42508,
  42623,
  42864,
  42888,
  43471,
  43494,
  43632,
  43741,
  65392,
  94179,
  125259,
  170,
  186,
  443,
  660,
  1749,
  1791,
  1808,
  1969,
  2365,
  2384,
  2482,
  2493,
  2510,
  2556,
  2654,
  2749,
  2768,
  2809,
  2877,
  2929,
  2947,
  2972,
  3024,
  3133,
  3200,
  3261,
  3294,
  3389,
  3406,
  3517,
  3716,
  3749,
  3773,
  3840,
  4159,
  4193,
  4238,
  4696,
  4800,
  6108,
  6314,
  7418,
  12294,
  12348,
  12447,
  12543,
  13312,
  19968,
  42606,
  42895,
  42999,
  43259,
  43642,
  43697,
  43712,
  43714,
  43762,
  44032,
  64285,
  64318,
  67592,
  67644,
  68096,
  69415,
  69956,
  70006,
  70106,
  70108,
  70280,
  70461,
  70480,
  70751,
  70855,
  71236,
  71352,
  71935,
  72161,
  72163,
  72192,
  72250,
  72272,
  72349,
  72768,
  73030,
  73112,
  94032,
  94208,
  123214,
  126500,
  126503,
  126521,
  126523,
  126530,
  126535,
  126537,
  126539,
  126548,
  126551,
  126553,
  126555,
  126557,
  126559,
  126564,
  126590,
  131072,
  173824,
  177984,
  178208,
  183984,
  453,
  456,
  459,
  498,
  8124,
  8140,
  8188,
  256,
  258,
  260,
  262,
  264,
  266,
  268,
  270,
  272,
  274,
  276,
  278,
  280,
  282,
  284,
  286,
  288,
  290,
  292,
  294,
  296,
  298,
  300,
  302,
  304,
  306,
  308,
  310,
  313,
  315,
  317,
  319,
  321,
  323,
  325,
  327,
  330,
  332,
  334,
  336,
  338,
  340,
  342,
  344,
  346,
  348,
  350,
  352,
  354,
  356,
  358,
  360,
  362,
  364,
  366,
  368,
  370,
  372,
  374,
  379,
  381,
  388,
  418,
  420,
  425,
  428,
  437,
  444,
  452,
  455,
  458,
  461,
  463,
  465,
  467,
  469,
  471,
  473,
  475,
  478,
  480,
  482,
  484,
  486,
  488,
  490,
  492,
  494,
  497,
  500,
  506,
  508,
  510,
  512,
  514,
  516,
  518,
  520,
  522,
  524,
  526,
  528,
  530,
  532,
  534,
  536,
  538,
  540,
  542,
  544,
  546,
  548,
  550,
  552,
  554,
  556,
  558,
  560,
  562,
  577,
  584,
  586,
  588,
  590,
  880,
  882,
  886,
  895,
  902,
  908,
  975,
  984,
  986,
  988,
  990,
  992,
  994,
  996,
  998,
  1e3,
  1002,
  1004,
  1006,
  1012,
  1015,
  1120,
  1122,
  1124,
  1126,
  1128,
  1130,
  1132,
  1134,
  1136,
  1138,
  1140,
  1142,
  1144,
  1146,
  1148,
  1150,
  1152,
  1162,
  1164,
  1166,
  1168,
  1170,
  1172,
  1174,
  1176,
  1178,
  1180,
  1182,
  1184,
  1186,
  1188,
  1190,
  1192,
  1194,
  1196,
  1198,
  1200,
  1202,
  1204,
  1206,
  1208,
  1210,
  1212,
  1214,
  1219,
  1221,
  1223,
  1225,
  1227,
  1229,
  1232,
  1234,
  1236,
  1238,
  1240,
  1242,
  1244,
  1246,
  1248,
  1250,
  1252,
  1254,
  1256,
  1258,
  1260,
  1262,
  1264,
  1266,
  1268,
  1270,
  1272,
  1274,
  1276,
  1278,
  1280,
  1282,
  1284,
  1286,
  1288,
  1290,
  1292,
  1294,
  1296,
  1298,
  1300,
  1302,
  1304,
  1306,
  1308,
  1310,
  1312,
  1314,
  1316,
  1318,
  1320,
  1322,
  1324,
  1326,
  4295,
  4301,
  7680,
  7682,
  7684,
  7686,
  7688,
  7690,
  7692,
  7694,
  7696,
  7698,
  7700,
  7702,
  7704,
  7706,
  7708,
  7710,
  7712,
  7714,
  7716,
  7718,
  7720,
  7722,
  7724,
  7726,
  7728,
  7730,
  7732,
  7734,
  7736,
  7738,
  7740,
  7742,
  7744,
  7746,
  7748,
  7750,
  7752,
  7754,
  7756,
  7758,
  7760,
  7762,
  7764,
  7766,
  7768,
  7770,
  7772,
  7774,
  7776,
  7778,
  7780,
  7782,
  7784,
  7786,
  7788,
  7790,
  7792,
  7794,
  7796,
  7798,
  7800,
  7802,
  7804,
  7806,
  7808,
  7810,
  7812,
  7814,
  7816,
  7818,
  7820,
  7822,
  7824,
  7826,
  7828,
  7838,
  7840,
  7842,
  7844,
  7846,
  7848,
  7850,
  7852,
  7854,
  7856,
  7858,
  7860,
  7862,
  7864,
  7866,
  7868,
  7870,
  7872,
  7874,
  7876,
  7878,
  7880,
  7882,
  7884,
  7886,
  7888,
  7890,
  7892,
  7894,
  7896,
  7898,
  7900,
  7902,
  7904,
  7906,
  7908,
  7910,
  7912,
  7914,
  7916,
  7918,
  7920,
  7922,
  7924,
  7926,
  7928,
  7930,
  7932,
  7934,
  8025,
  8027,
  8029,
  8031,
  8450,
  8455,
  8469,
  8484,
  8486,
  8488,
  8517,
  8579,
  11360,
  11367,
  11369,
  11371,
  11378,
  11381,
  11394,
  11396,
  11398,
  11400,
  11402,
  11404,
  11406,
  11408,
  11410,
  11412,
  11414,
  11416,
  11418,
  11420,
  11422,
  11424,
  11426,
  11428,
  11430,
  11432,
  11434,
  11436,
  11438,
  11440,
  11442,
  11444,
  11446,
  11448,
  11450,
  11452,
  11454,
  11456,
  11458,
  11460,
  11462,
  11464,
  11466,
  11468,
  11470,
  11472,
  11474,
  11476,
  11478,
  11480,
  11482,
  11484,
  11486,
  11488,
  11490,
  11499,
  11501,
  11506,
  42560,
  42562,
  42564,
  42566,
  42568,
  42570,
  42572,
  42574,
  42576,
  42578,
  42580,
  42582,
  42584,
  42586,
  42588,
  42590,
  42592,
  42594,
  42596,
  42598,
  42600,
  42602,
  42604,
  42624,
  42626,
  42628,
  42630,
  42632,
  42634,
  42636,
  42638,
  42640,
  42642,
  42644,
  42646,
  42648,
  42650,
  42786,
  42788,
  42790,
  42792,
  42794,
  42796,
  42798,
  42802,
  42804,
  42806,
  42808,
  42810,
  42812,
  42814,
  42816,
  42818,
  42820,
  42822,
  42824,
  42826,
  42828,
  42830,
  42832,
  42834,
  42836,
  42838,
  42840,
  42842,
  42844,
  42846,
  42848,
  42850,
  42852,
  42854,
  42856,
  42858,
  42860,
  42862,
  42873,
  42875,
  42880,
  42882,
  42884,
  42886,
  42891,
  42893,
  42896,
  42898,
  42902,
  42904,
  42906,
  42908,
  42910,
  42912,
  42914,
  42916,
  42918,
  42920,
  42934,
  42936,
  42938,
  42940,
  42942,
  42946,
  119964,
  119970,
  120134,
  120778,
  12295,
  66369,
  66378,
  36,
  1423,
  1547,
  2555,
  2801,
  3065,
  3647,
  6107,
  43064,
  65020,
  65129,
  65284,
  123647,
  126128,
  95,
  8276,
  65343
]);
var fic_a = [
  [97, 122],
  [223, 246],
  [248, 255],
  [311, 312],
  [328, 329],
  [382, 384],
  [396, 397],
  [409, 411],
  [426, 427],
  [441, 442],
  [445, 447],
  [476, 477],
  [495, 496],
  [563, 569],
  [575, 576],
  [591, 659],
  [661, 687],
  [891, 893],
  [940, 974],
  [976, 977],
  [981, 983],
  [1007, 1011],
  [1019, 1020],
  [1072, 1119],
  [1230, 1231],
  [1376, 1416],
  [4304, 4346],
  [4349, 4351],
  [5112, 5117],
  [7296, 7304],
  [7424, 7467],
  [7531, 7543],
  [7545, 7578],
  [7829, 7837],
  [7935, 7943],
  [7952, 7957],
  [7968, 7975],
  [7984, 7991],
  [8e3, 8005],
  [8016, 8023],
  [8032, 8039],
  [8048, 8061],
  [8064, 8071],
  [8080, 8087],
  [8096, 8103],
  [8112, 8116],
  [8118, 8119],
  [8130, 8132],
  [8134, 8135],
  [8144, 8147],
  [8150, 8151],
  [8160, 8167],
  [8178, 8180],
  [8182, 8183],
  [8462, 8463],
  [8508, 8509],
  [8518, 8521],
  [11312, 11358],
  [11365, 11366],
  [11379, 11380],
  [11382, 11387],
  [11491, 11492],
  [11520, 11557],
  [42799, 42801],
  [42865, 42872],
  [42899, 42901],
  [43824, 43866],
  [43872, 43879],
  [43888, 43967],
  [64256, 64262],
  [64275, 64279],
  [65345, 65370],
  [66600, 66639],
  [66776, 66811],
  [68800, 68850],
  [71872, 71903],
  [93792, 93823],
  [119834, 119859],
  [119886, 119892],
  [119894, 119911],
  [119938, 119963],
  [119990, 119993],
  [119997, 120003],
  [120005, 120015],
  [120042, 120067],
  [120094, 120119],
  [120146, 120171],
  [120198, 120223],
  [120250, 120275],
  [120302, 120327],
  [120354, 120379],
  [120406, 120431],
  [120458, 120485],
  [120514, 120538],
  [120540, 120545],
  [120572, 120596],
  [120598, 120603],
  [120630, 120654],
  [120656, 120661],
  [120688, 120712],
  [120714, 120719],
  [120746, 120770],
  [120772, 120777],
  [125218, 125251],
  [688, 705],
  [710, 721],
  [736, 740],
  [1765, 1766],
  [2036, 2037],
  [7288, 7293],
  [7468, 7530],
  [7579, 7615],
  [8336, 8348],
  [11388, 11389],
  [12337, 12341],
  [12445, 12446],
  [12540, 12542],
  [42232, 42237],
  [42652, 42653],
  [42775, 42783],
  [43e3, 43001],
  [43763, 43764],
  [43868, 43871],
  [65438, 65439],
  [92992, 92995],
  [94099, 94111],
  [94176, 94177],
  [123191, 123197],
  [13313, 19893],
  [19969, 40943],
  [44033, 55203],
  [94209, 100343],
  [131073, 173782],
  [173825, 177972],
  [177985, 178205],
  [178209, 183969],
  [183985, 191456],
  [448, 451],
  [1488, 1514],
  [1519, 1522],
  [1568, 1599],
  [1601, 1610],
  [1646, 1647],
  [1649, 1747],
  [1774, 1775],
  [1786, 1788],
  [1810, 1839],
  [1869, 1957],
  [1994, 2026],
  [2048, 2069],
  [2112, 2136],
  [2144, 2154],
  [2208, 2228],
  [2230, 2237],
  [2308, 2361],
  [2392, 2401],
  [2418, 2432],
  [2437, 2444],
  [2447, 2448],
  [2451, 2472],
  [2474, 2480],
  [2486, 2489],
  [2524, 2525],
  [2527, 2529],
  [2544, 2545],
  [2565, 2570],
  [2575, 2576],
  [2579, 2600],
  [2602, 2608],
  [2610, 2611],
  [2613, 2614],
  [2616, 2617],
  [2649, 2652],
  [2674, 2676],
  [2693, 2701],
  [2703, 2705],
  [2707, 2728],
  [2730, 2736],
  [2738, 2739],
  [2741, 2745],
  [2784, 2785],
  [2821, 2828],
  [2831, 2832],
  [2835, 2856],
  [2858, 2864],
  [2866, 2867],
  [2869, 2873],
  [2908, 2909],
  [2911, 2913],
  [2949, 2954],
  [2958, 2960],
  [2962, 2965],
  [2969, 2970],
  [2974, 2975],
  [2979, 2980],
  [2984, 2986],
  [2990, 3001],
  [3077, 3084],
  [3086, 3088],
  [3090, 3112],
  [3114, 3129],
  [3160, 3162],
  [3168, 3169],
  [3205, 3212],
  [3214, 3216],
  [3218, 3240],
  [3242, 3251],
  [3253, 3257],
  [3296, 3297],
  [3313, 3314],
  [3333, 3340],
  [3342, 3344],
  [3346, 3386],
  [3412, 3414],
  [3423, 3425],
  [3450, 3455],
  [3461, 3478],
  [3482, 3505],
  [3507, 3515],
  [3520, 3526],
  [3585, 3632],
  [3634, 3635],
  [3648, 3653],
  [3713, 3714],
  [3718, 3722],
  [3724, 3747],
  [3751, 3760],
  [3762, 3763],
  [3776, 3780],
  [3804, 3807],
  [3904, 3911],
  [3913, 3948],
  [3976, 3980],
  [4096, 4138],
  [4176, 4181],
  [4186, 4189],
  [4197, 4198],
  [4206, 4208],
  [4213, 4225],
  [4352, 4680],
  [4682, 4685],
  [4688, 4694],
  [4698, 4701],
  [4704, 4744],
  [4746, 4749],
  [4752, 4784],
  [4786, 4789],
  [4792, 4798],
  [4802, 4805],
  [4808, 4822],
  [4824, 4880],
  [4882, 4885],
  [4888, 4954],
  [4992, 5007],
  [5121, 5740],
  [5743, 5759],
  [5761, 5786],
  [5792, 5866],
  [5873, 5880],
  [5888, 5900],
  [5902, 5905],
  [5920, 5937],
  [5952, 5969],
  [5984, 5996],
  [5998, 6e3],
  [6016, 6067],
  [6176, 6210],
  [6212, 6264],
  [6272, 6276],
  [6279, 6312],
  [6320, 6389],
  [6400, 6430],
  [6480, 6509],
  [6512, 6516],
  [6528, 6571],
  [6576, 6601],
  [6656, 6678],
  [6688, 6740],
  [6917, 6963],
  [6981, 6987],
  [7043, 7072],
  [7086, 7087],
  [7098, 7141],
  [7168, 7203],
  [7245, 7247],
  [7258, 7287],
  [7401, 7404],
  [7406, 7411],
  [7413, 7414],
  [8501, 8504],
  [11568, 11623],
  [11648, 11670],
  [11680, 11686],
  [11688, 11694],
  [11696, 11702],
  [11704, 11710],
  [11712, 11718],
  [11720, 11726],
  [11728, 11734],
  [11736, 11742],
  [12353, 12438],
  [12449, 12538],
  [12549, 12591],
  [12593, 12686],
  [12704, 12730],
  [12784, 12799],
  [40960, 40980],
  [40982, 42124],
  [42192, 42231],
  [42240, 42507],
  [42512, 42527],
  [42538, 42539],
  [42656, 42725],
  [43003, 43009],
  [43011, 43013],
  [43015, 43018],
  [43020, 43042],
  [43072, 43123],
  [43138, 43187],
  [43250, 43255],
  [43261, 43262],
  [43274, 43301],
  [43312, 43334],
  [43360, 43388],
  [43396, 43442],
  [43488, 43492],
  [43495, 43503],
  [43514, 43518],
  [43520, 43560],
  [43584, 43586],
  [43588, 43595],
  [43616, 43631],
  [43633, 43638],
  [43646, 43695],
  [43701, 43702],
  [43705, 43709],
  [43739, 43740],
  [43744, 43754],
  [43777, 43782],
  [43785, 43790],
  [43793, 43798],
  [43808, 43814],
  [43816, 43822],
  [43968, 44002],
  [55216, 55238],
  [55243, 55291],
  [63744, 64109],
  [64112, 64217],
  [64287, 64296],
  [64298, 64310],
  [64312, 64316],
  [64320, 64321],
  [64323, 64324],
  [64326, 64433],
  [64467, 64829],
  [64848, 64911],
  [64914, 64967],
  [65008, 65019],
  [65136, 65140],
  [65142, 65276],
  [65382, 65391],
  [65393, 65437],
  [65440, 65470],
  [65474, 65479],
  [65482, 65487],
  [65490, 65495],
  [65498, 65500],
  [65536, 65547],
  [65549, 65574],
  [65576, 65594],
  [65596, 65597],
  [65599, 65613],
  [65616, 65629],
  [65664, 65786],
  [66176, 66204],
  [66208, 66256],
  [66304, 66335],
  [66349, 66368],
  [66370, 66377],
  [66384, 66421],
  [66432, 66461],
  [66464, 66499],
  [66504, 66511],
  [66640, 66717],
  [66816, 66855],
  [66864, 66915],
  [67072, 67382],
  [67392, 67413],
  [67424, 67431],
  [67584, 67589],
  [67594, 67637],
  [67639, 67640],
  [67647, 67669],
  [67680, 67702],
  [67712, 67742],
  [67808, 67826],
  [67828, 67829],
  [67840, 67861],
  [67872, 67897],
  [67968, 68023],
  [68030, 68031],
  [68112, 68115],
  [68117, 68119],
  [68121, 68149],
  [68192, 68220],
  [68224, 68252],
  [68288, 68295],
  [68297, 68324],
  [68352, 68405],
  [68416, 68437],
  [68448, 68466],
  [68480, 68497],
  [68608, 68680],
  [68864, 68899],
  [69376, 69404],
  [69424, 69445],
  [69600, 69622],
  [69635, 69687],
  [69763, 69807],
  [69840, 69864],
  [69891, 69926],
  [69968, 70002],
  [70019, 70066],
  [70081, 70084],
  [70144, 70161],
  [70163, 70187],
  [70272, 70278],
  [70282, 70285],
  [70287, 70301],
  [70303, 70312],
  [70320, 70366],
  [70405, 70412],
  [70415, 70416],
  [70419, 70440],
  [70442, 70448],
  [70450, 70451],
  [70453, 70457],
  [70493, 70497],
  [70656, 70708],
  [70727, 70730],
  [70784, 70831],
  [70852, 70853],
  [71040, 71086],
  [71128, 71131],
  [71168, 71215],
  [71296, 71338],
  [71424, 71450],
  [71680, 71723],
  [72096, 72103],
  [72106, 72144],
  [72203, 72242],
  [72284, 72329],
  [72384, 72440],
  [72704, 72712],
  [72714, 72750],
  [72818, 72847],
  [72960, 72966],
  [72968, 72969],
  [72971, 73008],
  [73056, 73061],
  [73063, 73064],
  [73066, 73097],
  [73440, 73458],
  [73728, 74649],
  [74880, 75075],
  [77824, 78894],
  [82944, 83526],
  [92160, 92728],
  [92736, 92766],
  [92880, 92909],
  [92928, 92975],
  [93027, 93047],
  [93053, 93071],
  [93952, 94026],
  [100352, 101106],
  [110592, 110878],
  [110928, 110930],
  [110948, 110951],
  [110960, 111355],
  [113664, 113770],
  [113776, 113788],
  [113792, 113800],
  [113808, 113817],
  [123136, 123180],
  [123584, 123627],
  [124928, 125124],
  [126464, 126467],
  [126469, 126495],
  [126497, 126498],
  [126505, 126514],
  [126516, 126519],
  [126541, 126543],
  [126545, 126546],
  [126561, 126562],
  [126567, 126570],
  [126572, 126578],
  [126580, 126583],
  [126585, 126588],
  [126592, 126601],
  [126603, 126619],
  [126625, 126627],
  [126629, 126633],
  [126635, 126651],
  [194560, 195101],
  [8072, 8079],
  [8088, 8095],
  [8104, 8111],
  [65, 90],
  [192, 214],
  [216, 222],
  [376, 377],
  [385, 386],
  [390, 391],
  [393, 395],
  [398, 401],
  [403, 404],
  [406, 408],
  [412, 413],
  [415, 416],
  [422, 423],
  [430, 431],
  [433, 435],
  [439, 440],
  [502, 504],
  [570, 571],
  [573, 574],
  [579, 582],
  [904, 906],
  [910, 911],
  [913, 929],
  [931, 939],
  [978, 980],
  [1017, 1018],
  [1021, 1071],
  [1216, 1217],
  [1329, 1366],
  [4256, 4293],
  [5024, 5109],
  [7312, 7354],
  [7357, 7359],
  [7944, 7951],
  [7960, 7965],
  [7976, 7983],
  [7992, 7999],
  [8008, 8013],
  [8040, 8047],
  [8120, 8123],
  [8136, 8139],
  [8152, 8155],
  [8168, 8172],
  [8184, 8187],
  [8459, 8461],
  [8464, 8466],
  [8473, 8477],
  [8490, 8493],
  [8496, 8499],
  [8510, 8511],
  [11264, 11310],
  [11362, 11364],
  [11373, 11376],
  [11390, 11392],
  [42877, 42878],
  [42922, 42926],
  [42928, 42932],
  [42948, 42950],
  [65313, 65338],
  [66560, 66599],
  [66736, 66771],
  [68736, 68786],
  [71840, 71871],
  [93760, 93791],
  [119808, 119833],
  [119860, 119885],
  [119912, 119937],
  [119966, 119967],
  [119973, 119974],
  [119977, 119980],
  [119982, 119989],
  [120016, 120041],
  [120068, 120069],
  [120071, 120074],
  [120077, 120084],
  [120086, 120092],
  [120120, 120121],
  [120123, 120126],
  [120128, 120132],
  [120138, 120144],
  [120172, 120197],
  [120224, 120249],
  [120276, 120301],
  [120328, 120353],
  [120380, 120405],
  [120432, 120457],
  [120488, 120512],
  [120546, 120570],
  [120604, 120628],
  [120662, 120686],
  [120720, 120744],
  [125184, 125217],
  [5870, 5872],
  [8544, 8578],
  [8581, 8584],
  [12321, 12329],
  [12344, 12346],
  [42726, 42735],
  [65856, 65908],
  [66513, 66517],
  [74752, 74862],
  [162, 165],
  [2046, 2047],
  [2546, 2547],
  [8352, 8383],
  [65504, 65505],
  [65509, 65510],
  [73693, 73696],
  [8255, 8256],
  [65075, 65076],
  [65101, 65103]
];
addRanges(fic, fic_a);
var ricd = /* @__PURE__ */ new Set([
  1471,
  1479,
  1648,
  1809,
  2045,
  2362,
  2364,
  2381,
  2433,
  2492,
  2509,
  2558,
  2620,
  2641,
  2677,
  2748,
  2765,
  2817,
  2876,
  2879,
  2893,
  2902,
  2946,
  3008,
  3021,
  3072,
  3076,
  3201,
  3260,
  3263,
  3270,
  3405,
  3530,
  3542,
  3633,
  3761,
  3893,
  3895,
  3897,
  4038,
  4226,
  4237,
  4253,
  6086,
  6109,
  6313,
  6450,
  6683,
  6742,
  6752,
  6754,
  6783,
  6964,
  6972,
  6978,
  7142,
  7149,
  7405,
  7412,
  8417,
  11647,
  42607,
  43010,
  43014,
  43019,
  43263,
  43443,
  43493,
  43587,
  43596,
  43644,
  43696,
  43713,
  43766,
  44005,
  44008,
  44013,
  64286,
  66045,
  66272,
  68159,
  69633,
  70003,
  70196,
  70206,
  70367,
  70464,
  70726,
  70750,
  70842,
  71229,
  71339,
  71341,
  71351,
  72160,
  72263,
  72767,
  73018,
  73031,
  73109,
  73111,
  94031,
  121461,
  121476,
  173,
  1564,
  1757,
  1807,
  2274,
  6158,
  65279,
  69821,
  69837,
  917505
]);
var ricd_a = [
  [768, 879],
  [1155, 1159],
  [1425, 1469],
  [1473, 1474],
  [1476, 1477],
  [1552, 1562],
  [1611, 1631],
  [1750, 1756],
  [1759, 1764],
  [1767, 1768],
  [1770, 1773],
  [1840, 1866],
  [1958, 1968],
  [2027, 2035],
  [2070, 2073],
  [2075, 2083],
  [2085, 2087],
  [2089, 2093],
  [2137, 2139],
  [2259, 2273],
  [2275, 2306],
  [2369, 2376],
  [2385, 2391],
  [2402, 2403],
  [2497, 2500],
  [2530, 2531],
  [2561, 2562],
  [2625, 2626],
  [2631, 2632],
  [2635, 2637],
  [2672, 2673],
  [2689, 2690],
  [2753, 2757],
  [2759, 2760],
  [2786, 2787],
  [2810, 2815],
  [2881, 2884],
  [2914, 2915],
  [3134, 3136],
  [3142, 3144],
  [3146, 3149],
  [3157, 3158],
  [3170, 3171],
  [3276, 3277],
  [3298, 3299],
  [3328, 3329],
  [3387, 3388],
  [3393, 3396],
  [3426, 3427],
  [3538, 3540],
  [3636, 3642],
  [3655, 3662],
  [3764, 3772],
  [3784, 3789],
  [3864, 3865],
  [3953, 3966],
  [3968, 3972],
  [3974, 3975],
  [3981, 3991],
  [3993, 4028],
  [4141, 4144],
  [4146, 4151],
  [4153, 4154],
  [4157, 4158],
  [4184, 4185],
  [4190, 4192],
  [4209, 4212],
  [4229, 4230],
  [4957, 4959],
  [5906, 5908],
  [5938, 5940],
  [5970, 5971],
  [6002, 6003],
  [6068, 6069],
  [6071, 6077],
  [6089, 6099],
  [6155, 6157],
  [6277, 6278],
  [6432, 6434],
  [6439, 6440],
  [6457, 6459],
  [6679, 6680],
  [6744, 6750],
  [6757, 6764],
  [6771, 6780],
  [6832, 6845],
  [6912, 6915],
  [6966, 6970],
  [7019, 7027],
  [7040, 7041],
  [7074, 7077],
  [7080, 7081],
  [7083, 7085],
  [7144, 7145],
  [7151, 7153],
  [7212, 7219],
  [7222, 7223],
  [7376, 7378],
  [7380, 7392],
  [7394, 7400],
  [7416, 7417],
  [7616, 7673],
  [7675, 7679],
  [8400, 8412],
  [8421, 8432],
  [11503, 11505],
  [11744, 11775],
  [12330, 12333],
  [12441, 12442],
  [42612, 42621],
  [42654, 42655],
  [42736, 42737],
  [43045, 43046],
  [43204, 43205],
  [43232, 43249],
  [43302, 43309],
  [43335, 43345],
  [43392, 43394],
  [43446, 43449],
  [43452, 43453],
  [43561, 43566],
  [43569, 43570],
  [43573, 43574],
  [43698, 43700],
  [43703, 43704],
  [43710, 43711],
  [43756, 43757],
  [65024, 65039],
  [65056, 65071],
  [66422, 66426],
  [68097, 68099],
  [68101, 68102],
  [68108, 68111],
  [68152, 68154],
  [68325, 68326],
  [68900, 68903],
  [69446, 69456],
  [69688, 69702],
  [69759, 69761],
  [69811, 69814],
  [69817, 69818],
  [69888, 69890],
  [69927, 69931],
  [69933, 69940],
  [70016, 70017],
  [70070, 70078],
  [70089, 70092],
  [70191, 70193],
  [70198, 70199],
  [70371, 70378],
  [70400, 70401],
  [70459, 70460],
  [70502, 70508],
  [70512, 70516],
  [70712, 70719],
  [70722, 70724],
  [70835, 70840],
  [70847, 70848],
  [70850, 70851],
  [71090, 71093],
  [71100, 71101],
  [71103, 71104],
  [71132, 71133],
  [71219, 71226],
  [71231, 71232],
  [71344, 71349],
  [71453, 71455],
  [71458, 71461],
  [71463, 71467],
  [71727, 71735],
  [71737, 71738],
  [72148, 72151],
  [72154, 72155],
  [72193, 72202],
  [72243, 72248],
  [72251, 72254],
  [72273, 72278],
  [72281, 72283],
  [72330, 72342],
  [72344, 72345],
  [72752, 72758],
  [72760, 72765],
  [72850, 72871],
  [72874, 72880],
  [72882, 72883],
  [72885, 72886],
  [73009, 73014],
  [73020, 73021],
  [73023, 73029],
  [73104, 73105],
  [73459, 73460],
  [92912, 92916],
  [92976, 92982],
  [94095, 94098],
  [113821, 113822],
  [119143, 119145],
  [119163, 119170],
  [119173, 119179],
  [119210, 119213],
  [119362, 119364],
  [121344, 121398],
  [121403, 121452],
  [121499, 121503],
  [121505, 121519],
  [122880, 122886],
  [122888, 122904],
  [122907, 122913],
  [122915, 122916],
  [122918, 122922],
  [123184, 123190],
  [123628, 123631],
  [125136, 125142],
  [125252, 125258],
  [917760, 917999],
  [1536, 1541],
  [8203, 8207],
  [8234, 8238],
  [8288, 8292],
  [8294, 8303],
  [65529, 65531],
  [78896, 78904],
  [113824, 113827],
  [119155, 119162],
  [917536, 917631]
];
addRanges(ricd, ricd_a);
var mac_a = [
  [0, 8],
  [14, 27],
  [127, 159],
  [768, 879],
  [6832, 6911],
  [7616, 7679],
  [8400, 8447],
  [65056, 65071],
  [48, 57]
];
addRanges(ricd, mac_a);
var ric = new Set(
  function* () {
    yield* fic;
    yield* ricd;
  }()
);

// ../../node_modules/java-parser/src/tokens.js
var fragments = {};
function inlineFragments(def) {
  let inlinedDef = def;
  Object.keys(fragments).forEach((prevFragmentName) => {
    const prevFragmentDef = fragments[prevFragmentName];
    const templateRegExp = new RegExp(`{{${prevFragmentName}}}`, "g");
    inlinedDef = inlinedDef.replace(templateRegExp, prevFragmentDef);
  });
  return inlinedDef;
}
function FRAGMENT(name, def) {
  fragments[name] = inlineFragments(def);
}
function MAKE_PATTERN(def, flags) {
  const inlinedDef = inlineFragments(def);
  return new RegExp(inlinedDef, flags);
}
FRAGMENT("Digits", "[0-9]([0-9_]*[0-9])?");
FRAGMENT("ExponentPart", "[eE][+-]?{{Digits}}");
FRAGMENT("HexDigit", "[0-9a-fA-F]");
FRAGMENT("HexDigits", "{{HexDigit}}(({{HexDigit}}|'_')*{{HexDigit}})?");
FRAGMENT("FloatTypeSuffix", "[fFdD]");
FRAGMENT("LineTerminator", "(\\x0A|(\\x0D(\\x0A)?))");
FRAGMENT("UnicodeMarker", "uu*");
FRAGMENT("UnicodeEscape", "\\\\{{UnicodeMarker}}{{HexDigit}}{4}");
FRAGMENT("RawInputCharacter", "\\\\{{UnicodeMarker}}[0-9a-fA-F]{4}");
FRAGMENT("UnicodeInputCharacter", "({{UnicodeEscape}}|{{RawInputCharacter}})");
FRAGMENT("OctalDigit", "[0-7]");
FRAGMENT("ZeroToThree", "[0-3]");
FRAGMENT(
  "OctalEscape",
  "\\\\({{OctalDigit}}|{{ZeroToThree}}?{{OctalDigit}}{2})"
);
FRAGMENT("EscapeSequence", `\\\\[bstnfr"'\\\\]|{{OctalEscape}}`);
FRAGMENT(
  "StringCharacter",
  '(?:(?:{{EscapeSequence}})|{{UnicodeEscape}}|(?!["\\\\]).)'
);
FRAGMENT(
  "TextBlockCharacter",
  "(?:(?:{{EscapeSequence}})|{{UnicodeEscape}}|(?!\\\\).|\\\\?{{LineTerminator}})"
);
function matchJavaIdentifier(text, startOffset) {
  let endOffset = startOffset;
  let charCode = text.codePointAt(endOffset);
  if (fic.has(charCode)) {
    endOffset++;
    if (charCode > 65535) {
      endOffset++;
    }
    charCode = text.codePointAt(endOffset);
  }
  while (ric.has(charCode)) {
    endOffset++;
    if (charCode > 65535) {
      endOffset++;
    }
    charCode = text.codePointAt(endOffset);
  }
  if (endOffset === startOffset) {
    return null;
  }
  const matchedString = text.substring(startOffset, endOffset);
  return [matchedString];
}
var Identifier = createToken({
  name: "Identifier",
  pattern: { exec: matchJavaIdentifier },
  line_breaks: false,
  start_chars_hint: Array.from(
    fic,
    (x) => String.fromCharCode(x)
  )
});
var allTokens = {
  modes: {
    global: [],
    stringTemplate: [],
    textBlockTemplate: []
  },
  defaultMode: "global"
};
var allModes = Object.keys(allTokens.modes);
var tokenDictionary = {};
function createToken2(options, modes = allModes) {
  if (!options.label) {
    if (typeof options.pattern === "string") {
      options.label = `'${options.pattern}'`;
    } else if (options.pattern instanceof RegExp) {
      options.label = `'${options.name}'`;
    }
  }
  const newTokenType = createToken(options);
  modes.forEach((mode) => allTokens.modes[mode].push(newTokenType));
  tokenDictionary[options.name] = newTokenType;
  return newTokenType;
}
function createKeywordLikeToken(options) {
  options.longer_alt = Identifier;
  return createToken2(options);
}
var RestrictedKeyword = createToken2({
  name: "RestrictedKeyword",
  pattern: Lexer.NA
});
var Keyword = createToken2({
  name: "Keyword",
  pattern: Lexer.NA
});
var AssignmentOperator = createToken2({
  name: "AssignmentOperator",
  pattern: Lexer.NA
});
var BinaryOperator = createToken2({
  name: "BinaryOperator",
  pattern: Lexer.NA
});
var UnaryPrefixOperator = createToken2({
  name: "UnaryPrefixOperator",
  pattern: Lexer.NA
});
var UnaryPrefixOperatorNotPlusMinus = createToken2({
  name: "UnaryPrefixOperatorNotPlusMinus",
  pattern: Lexer.NA
});
var UnarySuffixOperator = createToken2({
  name: "UnarySuffixOperator",
  pattern: Lexer.NA
});
var Separators = createToken2({
  name: "Separators",
  pattern: Lexer.NA
});
createToken2({
  name: "WhiteSpace",
  pattern: MAKE_PATTERN("[\\x09\\x20\\x0C]|{{LineTerminator}}"),
  group: Lexer.SKIPPED
});
createToken2({
  name: "LineComment",
  pattern: /\/\/[^\n\r]*/,
  group: "comments"
});
createToken2({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//,
  group: "comments"
});
createToken2({ name: "BinaryLiteral", pattern: /0[bB][01]([01_]*[01])?[lL]?/ });
createToken2({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "{{Digits}}\\.({{Digits}})?({{ExponentPart}})?({{FloatTypeSuffix}})?|\\.{{Digits}}({{ExponentPart}})?({{FloatTypeSuffix}})?|{{Digits}}{{ExponentPart}}({{FloatTypeSuffix}})?|{{Digits}}({{ExponentPart}})?{{FloatTypeSuffix}}"
  )
});
createToken2({ name: "OctalLiteral", pattern: /0_*[0-7]([0-7_]*[0-7])?[lL]?/ });
createToken2({
  name: "HexFloatLiteral",
  pattern: MAKE_PATTERN(
    "0[xX]({{HexDigits}}\\.?|({{HexDigits}})?\\.{{HexDigits}})[pP][+-]?{{Digits}}[fFdD]?"
  )
});
createToken2({
  name: "HexLiteral",
  pattern: /0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?[lL]?/
});
createToken2({
  name: "DecimalLiteral",
  pattern: MAKE_PATTERN("(0|[1-9](_+{{Digits}}|({{Digits}})?))[lL]?")
});
createToken2({
  name: "CharLiteral",
  // Not using SingleCharacter Terminology because ' and \ are captured in EscapeSequence
  pattern: MAKE_PATTERN(
    "'(?:[^\\\\']|(?:(?:{{EscapeSequence}})|{{UnicodeInputCharacter}}))'"
  )
});
createToken2({
  name: "TextBlock",
  pattern: MAKE_PATTERN(
    '"""[\\x09\\x20\\x0C]*{{LineTerminator}}{{TextBlockCharacter}}*?"""'
  )
});
createToken2({
  name: "TextBlockTemplateBegin",
  pattern: MAKE_PATTERN('"""{{LineTerminator}}{{TextBlockCharacter}}*?\\\\\\{'),
  push_mode: "textBlockTemplate"
});
createToken2(
  {
    name: "TextBlockTemplateEnd",
    pattern: MAKE_PATTERN('\\}{{TextBlockCharacter}}*?"""'),
    pop_mode: true
  },
  ["textBlockTemplate"]
);
createToken2({
  name: "StringLiteral",
  pattern: MAKE_PATTERN('"{{StringCharacter}}*?"')
});
createToken2({
  name: "StringTemplateBegin",
  pattern: MAKE_PATTERN('"{{StringCharacter}}*?\\\\\\{'),
  push_mode: "stringTemplate"
});
createToken2(
  {
    name: "StringTemplateEnd",
    pattern: MAKE_PATTERN('\\}{{StringCharacter}}*?"'),
    pop_mode: true
  },
  ["stringTemplate"]
);
createToken2(
  {
    name: "StringTemplateMid",
    pattern: MAKE_PATTERN("\\}{{StringCharacter}}*?\\\\\\{")
  },
  ["stringTemplate"]
);
createToken2(
  {
    name: "TextBlockTemplateMid",
    pattern: MAKE_PATTERN("\\}{{TextBlockCharacter}}*?\\\\\\{")
  },
  ["textBlockTemplate"]
);
var restrictedKeywords = [
  "open",
  "module",
  "requires",
  "transitive",
  "exports",
  "opens",
  "to",
  "uses",
  "provides",
  "when",
  "with",
  "sealed",
  "non-sealed",
  "permits"
];
sortDescLength(restrictedKeywords).forEach((word) => {
  createKeywordLikeToken({
    name: word[0].toUpperCase() + (0, import_camelCase.default)(word.substr(1)),
    pattern: word,
    // restricted keywords can also be used as an Identifiers according to the spec.
    // TODO: inspect this causes no ambiguities
    categories: [Identifier, RestrictedKeyword]
  });
});
var keywords = [
  "abstract",
  "continue",
  "for",
  "new",
  "switch",
  "assert",
  "default",
  "if",
  "package",
  "synchronized",
  "boolean",
  "do",
  "goto",
  "private",
  "this",
  "break",
  "double",
  "implements",
  "protected",
  "throw",
  "byte",
  "else",
  "import",
  "public",
  "throws",
  "case",
  "enum",
  // "instanceof", // special handling for "instanceof" operator below
  "return",
  "transient",
  "catch",
  "extends",
  "int",
  "short",
  "try",
  "char",
  "final",
  "interface",
  "static",
  "void",
  "class",
  "finally",
  "long",
  "strictfp",
  "volatile",
  "const",
  "float",
  "native",
  "super",
  "while",
  ["_", "underscore"]
];
sortDescLength(keywords).forEach((word) => {
  const isPair = Array.isArray(word);
  const actualName = isPair ? word[1] : word;
  const actualPattern = isPair ? word[0] : word;
  const options = {
    name: actualName[0].toUpperCase() + actualName.substr(1),
    pattern: actualPattern,
    categories: Keyword
  };
  if (isPair) {
    options.label = `'${actualName}'`;
  }
  createKeywordLikeToken(options);
});
createKeywordLikeToken({
  name: "Instanceof",
  pattern: "instanceof",
  categories: [Keyword, BinaryOperator]
});
createKeywordLikeToken({
  name: "Var",
  pattern: "var",
  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-3.html#jls-3.9
  // "var is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({
  name: "Yield",
  pattern: "yield",
  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-3.html#jls-3.9
  // "yield is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({
  name: "Record",
  pattern: "record",
  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-3.html#jls-3.9
  // "record is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({ name: "True", pattern: "true" });
createKeywordLikeToken({ name: "False", pattern: "false" });
createKeywordLikeToken({ name: "Null", pattern: "null" });
createToken2({ name: "At", pattern: "@", categories: [Separators] });
createToken2({ name: "Arrow", pattern: "->" });
createToken2({ name: "DotDotDot", pattern: "...", categories: [Separators] });
createToken2({ name: "Dot", pattern: ".", categories: [Separators] });
createToken2({ name: "Comma", pattern: ",", categories: [Separators] });
createToken2({ name: "Semicolon", pattern: ";", categories: [Separators] });
createToken2({ name: "ColonColon", pattern: "::", categories: [Separators] });
createToken2({ name: "Colon", pattern: ":" });
createToken2({ name: "QuestionMark", pattern: "?" });
createToken2({ name: "LBrace", pattern: "(", categories: [Separators] });
createToken2({ name: "RBrace", pattern: ")", categories: [Separators] });
createToken2({
  name: "LCurly",
  pattern: "{",
  categories: [Separators],
  push_mode: allTokens.defaultMode
});
createToken2(
  { name: "RCurly", pattern: "}", categories: [Separators], pop_mode: true },
  [allTokens.defaultMode]
);
createToken2({ name: "LSquare", pattern: "[", categories: [Separators] });
createToken2({ name: "RSquare", pattern: "]", categories: [Separators] });
createToken2({
  name: "MinusMinus",
  pattern: "--",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
createToken2({
  name: "PlusPlus",
  pattern: "++",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
createToken2({
  name: "Complement",
  pattern: "~",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});
createToken2({
  name: "LessEquals",
  pattern: "<=",
  categories: [BinaryOperator]
});
createToken2({
  name: "LessLessEquals",
  pattern: "<<=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Less", pattern: "<", categories: [BinaryOperator] });
createToken2({
  name: "GreaterEquals",
  pattern: ">=",
  categories: [BinaryOperator]
});
createToken2({
  name: "GreaterGreaterEquals",
  pattern: ">>=",
  categories: [AssignmentOperator]
});
createToken2({
  name: "GreaterGreaterGreaterEquals",
  pattern: ">>>=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Greater", pattern: ">", categories: [BinaryOperator] });
createToken2({
  name: "EqualsEquals",
  pattern: "==",
  categories: [BinaryOperator]
});
createToken2({
  name: "Equals",
  pattern: "=",
  categories: [BinaryOperator, AssignmentOperator]
});
createToken2({
  name: "MinusEquals",
  pattern: "-=",
  categories: [AssignmentOperator]
});
createToken2({
  name: "Minus",
  pattern: "-",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken2({
  name: "PlusEquals",
  pattern: "+=",
  categories: [AssignmentOperator]
});
createToken2({
  name: "Plus",
  pattern: "+",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken2({ name: "AndAnd", pattern: "&&", categories: [BinaryOperator] });
createToken2({
  name: "AndEquals",
  pattern: "&=",
  categories: [AssignmentOperator]
});
createToken2({ name: "And", pattern: "&", categories: [BinaryOperator] });
createToken2({
  name: "XorEquals",
  pattern: "^=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Xor", pattern: "^", categories: [BinaryOperator] });
createToken2({ name: "NotEquals", pattern: "!=", categories: [BinaryOperator] });
createToken2({ name: "OrOr", pattern: "||", categories: [BinaryOperator] });
createToken2({
  name: "OrEquals",
  pattern: "|=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Or", pattern: "|", categories: [BinaryOperator] });
createToken2({
  name: "MultiplyEquals",
  pattern: "*=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Star", pattern: "*", categories: [BinaryOperator] });
createToken2({
  name: "DivideEquals",
  pattern: "/=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Divide", pattern: "/", categories: [BinaryOperator] });
createToken2({
  name: "ModuloEquals",
  pattern: "%=",
  categories: [AssignmentOperator]
});
createToken2({ name: "Modulo", pattern: "%", categories: [BinaryOperator] });
createToken2({
  name: "Not",
  pattern: "!",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});
allModes.forEach((mode) => allTokens.modes[mode].push(Identifier));
tokenDictionary["Identifier"] = Identifier;
function sortDescLength(arr) {
  return arr.sort((a, b) => {
    return b.length - a.length;
  });
}

// ../../node_modules/java-parser/src/utils.js
function getSkipValidations() {
  return (typeof process !== "undefined" && // (not every runtime has a global `process` object
  process.env && process.env["prettier-java-development-mode"] === "enabled") === false;
}

// ../../node_modules/java-parser/src/lexer.js
var lexer_default = new Lexer(allTokens, {
  ensureOptimizations: true,
  skipValidations: getSkipValidations()
});

// ../../node_modules/chevrotain-allstar/lib/atn.js
function buildATNKey(rule, type, occurrence) {
  return `${rule.name}_${type}_${occurrence}`;
}
var ATN_BASIC = 1;
var ATN_RULE_START = 2;
var ATN_PLUS_BLOCK_START = 4;
var ATN_STAR_BLOCK_START = 5;
var ATN_RULE_STOP = 7;
var ATN_BLOCK_END = 8;
var ATN_STAR_LOOP_BACK = 9;
var ATN_STAR_LOOP_ENTRY = 10;
var ATN_PLUS_LOOP_BACK = 11;
var ATN_LOOP_END = 12;
var AbstractTransition = class {
  constructor(target) {
    this.target = target;
  }
  isEpsilon() {
    return false;
  }
};
var AtomTransition = class extends AbstractTransition {
  constructor(target, tokenType) {
    super(target);
    this.tokenType = tokenType;
  }
};
var EpsilonTransition = class extends AbstractTransition {
  constructor(target) {
    super(target);
  }
  isEpsilon() {
    return true;
  }
};
var RuleTransition = class extends AbstractTransition {
  constructor(ruleStart, rule, followState) {
    super(ruleStart);
    this.rule = rule;
    this.followState = followState;
  }
  isEpsilon() {
    return true;
  }
};
function createATN(rules) {
  const atn = {
    decisionMap: {},
    decisionStates: [],
    ruleToStartState: /* @__PURE__ */ new Map(),
    ruleToStopState: /* @__PURE__ */ new Map(),
    states: []
  };
  createRuleStartAndStopATNStates(atn, rules);
  const ruleLength = rules.length;
  for (let i = 0; i < ruleLength; i++) {
    const rule = rules[i];
    const ruleBlock = block(atn, rule, rule);
    if (ruleBlock === void 0) {
      continue;
    }
    buildRuleHandle(atn, rule, ruleBlock);
  }
  return atn;
}
function createRuleStartAndStopATNStates(atn, rules) {
  const ruleLength = rules.length;
  for (let i = 0; i < ruleLength; i++) {
    const rule = rules[i];
    const start = newState(atn, rule, void 0, {
      type: ATN_RULE_START
    });
    const stop = newState(atn, rule, void 0, {
      type: ATN_RULE_STOP
    });
    start.stop = stop;
    atn.ruleToStartState.set(rule, start);
    atn.ruleToStopState.set(rule, stop);
  }
}
function atom(atn, rule, production) {
  if (production instanceof Terminal) {
    return tokenRef(atn, rule, production.terminalType, production);
  } else if (production instanceof NonTerminal) {
    return ruleRef(atn, rule, production);
  } else if (production instanceof Alternation) {
    return alternation(atn, rule, production);
  } else if (production instanceof Option) {
    return option(atn, rule, production);
  } else if (production instanceof Repetition) {
    return repetition(atn, rule, production);
  } else if (production instanceof RepetitionWithSeparator) {
    return repetitionSep(atn, rule, production);
  } else if (production instanceof RepetitionMandatory) {
    return repetitionMandatory(atn, rule, production);
  } else if (production instanceof RepetitionMandatoryWithSeparator) {
    return repetitionMandatorySep(atn, rule, production);
  } else {
    return block(atn, rule, production);
  }
}
function repetition(atn, rule, repetition2) {
  const starState = newState(atn, rule, repetition2, {
    type: ATN_STAR_BLOCK_START
  });
  defineDecisionState(atn, starState);
  const handle = makeAlts(atn, rule, starState, repetition2, block(atn, rule, repetition2));
  return star(atn, rule, repetition2, handle);
}
function repetitionSep(atn, rule, repetition2) {
  const starState = newState(atn, rule, repetition2, {
    type: ATN_STAR_BLOCK_START
  });
  defineDecisionState(atn, starState);
  const handle = makeAlts(atn, rule, starState, repetition2, block(atn, rule, repetition2));
  const sep = tokenRef(atn, rule, repetition2.separator, repetition2);
  return star(atn, rule, repetition2, handle, sep);
}
function repetitionMandatory(atn, rule, repetition2) {
  const plusState = newState(atn, rule, repetition2, {
    type: ATN_PLUS_BLOCK_START
  });
  defineDecisionState(atn, plusState);
  const handle = makeAlts(atn, rule, plusState, repetition2, block(atn, rule, repetition2));
  return plus(atn, rule, repetition2, handle);
}
function repetitionMandatorySep(atn, rule, repetition2) {
  const plusState = newState(atn, rule, repetition2, {
    type: ATN_PLUS_BLOCK_START
  });
  defineDecisionState(atn, plusState);
  const handle = makeAlts(atn, rule, plusState, repetition2, block(atn, rule, repetition2));
  const sep = tokenRef(atn, rule, repetition2.separator, repetition2);
  return plus(atn, rule, repetition2, handle, sep);
}
function alternation(atn, rule, alternation2) {
  const start = newState(atn, rule, alternation2, {
    type: ATN_BASIC
  });
  defineDecisionState(atn, start);
  const alts = map_default(alternation2.definition, (e) => atom(atn, rule, e));
  const handle = makeAlts(atn, rule, start, alternation2, ...alts);
  return handle;
}
function option(atn, rule, option2) {
  const start = newState(atn, rule, option2, {
    type: ATN_BASIC
  });
  defineDecisionState(atn, start);
  const handle = makeAlts(atn, rule, start, option2, block(atn, rule, option2));
  return optional(atn, rule, option2, handle);
}
function block(atn, rule, block2) {
  const handles = filter_default(map_default(block2.definition, (e) => atom(atn, rule, e)), (e) => e !== void 0);
  if (handles.length === 1) {
    return handles[0];
  } else if (handles.length === 0) {
    return void 0;
  } else {
    return makeBlock(atn, handles);
  }
}
function plus(atn, rule, plus2, handle, sep) {
  const blkStart = handle.left;
  const blkEnd = handle.right;
  const loop = newState(atn, rule, plus2, {
    type: ATN_PLUS_LOOP_BACK
  });
  defineDecisionState(atn, loop);
  const end = newState(atn, rule, plus2, {
    type: ATN_LOOP_END
  });
  blkStart.loopback = loop;
  end.loopback = loop;
  atn.decisionMap[buildATNKey(rule, sep ? "RepetitionMandatoryWithSeparator" : "RepetitionMandatory", plus2.idx)] = loop;
  epsilon(blkEnd, loop);
  if (sep === void 0) {
    epsilon(loop, blkStart);
    epsilon(loop, end);
  } else {
    epsilon(loop, end);
    epsilon(loop, sep.left);
    epsilon(sep.right, blkStart);
  }
  return {
    left: blkStart,
    right: end
  };
}
function star(atn, rule, star2, handle, sep) {
  const start = handle.left;
  const end = handle.right;
  const entry = newState(atn, rule, star2, {
    type: ATN_STAR_LOOP_ENTRY
  });
  defineDecisionState(atn, entry);
  const loopEnd = newState(atn, rule, star2, {
    type: ATN_LOOP_END
  });
  const loop = newState(atn, rule, star2, {
    type: ATN_STAR_LOOP_BACK
  });
  entry.loopback = loop;
  loopEnd.loopback = loop;
  epsilon(entry, start);
  epsilon(entry, loopEnd);
  epsilon(end, loop);
  if (sep !== void 0) {
    epsilon(loop, loopEnd);
    epsilon(loop, sep.left);
    epsilon(sep.right, start);
  } else {
    epsilon(loop, entry);
  }
  atn.decisionMap[buildATNKey(rule, sep ? "RepetitionWithSeparator" : "Repetition", star2.idx)] = entry;
  return {
    left: entry,
    right: loopEnd
  };
}
function optional(atn, rule, optional2, handle) {
  const start = handle.left;
  const end = handle.right;
  epsilon(start, end);
  atn.decisionMap[buildATNKey(rule, "Option", optional2.idx)] = start;
  return handle;
}
function defineDecisionState(atn, state) {
  atn.decisionStates.push(state);
  state.decision = atn.decisionStates.length - 1;
  return state.decision;
}
function makeAlts(atn, rule, start, production, ...alts) {
  const end = newState(atn, rule, production, {
    type: ATN_BLOCK_END,
    start
  });
  start.end = end;
  for (const alt of alts) {
    if (alt !== void 0) {
      epsilon(start, alt.left);
      epsilon(alt.right, end);
    } else {
      epsilon(start, end);
    }
  }
  const handle = {
    left: start,
    right: end
  };
  atn.decisionMap[buildATNKey(rule, getProdType2(production), production.idx)] = start;
  return handle;
}
function getProdType2(production) {
  if (production instanceof Alternation) {
    return "Alternation";
  } else if (production instanceof Option) {
    return "Option";
  } else if (production instanceof Repetition) {
    return "Repetition";
  } else if (production instanceof RepetitionWithSeparator) {
    return "RepetitionWithSeparator";
  } else if (production instanceof RepetitionMandatory) {
    return "RepetitionMandatory";
  } else if (production instanceof RepetitionMandatoryWithSeparator) {
    return "RepetitionMandatoryWithSeparator";
  } else {
    throw new Error("Invalid production type encountered");
  }
}
function makeBlock(atn, alts) {
  const altsLength = alts.length;
  for (let i = 0; i < altsLength - 1; i++) {
    const handle = alts[i];
    let transition;
    if (handle.left.transitions.length === 1) {
      transition = handle.left.transitions[0];
    }
    const isRuleTransition = transition instanceof RuleTransition;
    const ruleTransition = transition;
    const next = alts[i + 1].left;
    if (handle.left.type === ATN_BASIC && handle.right.type === ATN_BASIC && transition !== void 0 && (isRuleTransition && ruleTransition.followState === handle.right || transition.target === handle.right)) {
      if (isRuleTransition) {
        ruleTransition.followState = next;
      } else {
        transition.target = next;
      }
      removeState(atn, handle.right);
    } else {
      epsilon(handle.right, next);
    }
  }
  const first2 = alts[0];
  const last2 = alts[altsLength - 1];
  return {
    left: first2.left,
    right: last2.right
  };
}
function tokenRef(atn, rule, tokenType, production) {
  const left = newState(atn, rule, production, {
    type: ATN_BASIC
  });
  const right = newState(atn, rule, production, {
    type: ATN_BASIC
  });
  addTransition(left, new AtomTransition(right, tokenType));
  return {
    left,
    right
  };
}
function ruleRef(atn, currentRule, nonTerminal) {
  const rule = nonTerminal.referencedRule;
  const start = atn.ruleToStartState.get(rule);
  const left = newState(atn, currentRule, nonTerminal, {
    type: ATN_BASIC
  });
  const right = newState(atn, currentRule, nonTerminal, {
    type: ATN_BASIC
  });
  const call = new RuleTransition(start, rule, right);
  addTransition(left, call);
  return {
    left,
    right
  };
}
function buildRuleHandle(atn, rule, block2) {
  const start = atn.ruleToStartState.get(rule);
  epsilon(start, block2.left);
  const stop = atn.ruleToStopState.get(rule);
  epsilon(block2.right, stop);
  const handle = {
    left: start,
    right: stop
  };
  return handle;
}
function epsilon(a, b) {
  const transition = new EpsilonTransition(b);
  addTransition(a, transition);
}
function newState(atn, rule, production, partial) {
  const t = Object.assign({
    atn,
    production,
    epsilonOnlyTransitions: false,
    rule,
    transitions: [],
    nextTokenWithinRule: [],
    stateNumber: atn.states.length
  }, partial);
  atn.states.push(t);
  return t;
}
function addTransition(state, transition) {
  if (state.transitions.length === 0) {
    state.epsilonOnlyTransitions = transition.isEpsilon();
  }
  state.transitions.push(transition);
}
function removeState(atn, state) {
  atn.states.splice(atn.states.indexOf(state), 1);
}

// ../../node_modules/chevrotain-allstar/lib/dfa.js
var DFA_ERROR = {};
var ATNConfigSet = class {
  constructor() {
    this.map = {};
    this.configs = [];
  }
  get size() {
    return this.configs.length;
  }
  finalize() {
    this.map = {};
  }
  add(config) {
    const key = getATNConfigKey(config);
    if (!(key in this.map)) {
      this.map[key] = this.configs.length;
      this.configs.push(config);
    }
  }
  get elements() {
    return this.configs;
  }
  get alts() {
    return map_default(this.configs, (e) => e.alt);
  }
  get key() {
    let value = "";
    for (const k in this.map) {
      value += k + ":";
    }
    return value;
  }
};
function getATNConfigKey(config, alt = true) {
  return `${alt ? `a${config.alt}` : ""}s${config.state.stateNumber}:${config.stack.map((e) => e.stateNumber.toString()).join("_")}`;
}

// ../../node_modules/chevrotain-allstar/lib/all-star-lookahead.js
function createDFACache(startState, decision) {
  const map2 = {};
  return (predicateSet) => {
    const key = predicateSet.toString();
    let existing = map2[key];
    if (existing !== void 0) {
      return existing;
    } else {
      existing = {
        atnStartState: startState,
        decision,
        states: {}
      };
      map2[key] = existing;
      return existing;
    }
  };
}
var PredicateSet = class {
  constructor() {
    this.predicates = [];
  }
  is(index) {
    return index >= this.predicates.length || this.predicates[index];
  }
  set(index, value) {
    this.predicates[index] = value;
  }
  toString() {
    let value = "";
    const size = this.predicates.length;
    for (let i = 0; i < size; i++) {
      value += this.predicates[i] === true ? "1" : "0";
    }
    return value;
  }
};
var EMPTY_PREDICATES = new PredicateSet();
var LLStarLookaheadStrategy = class extends LLkLookaheadStrategy {
  constructor(options) {
    var _a;
    super();
    this.logging = (_a = options === null || options === void 0 ? void 0 : options.logging) !== null && _a !== void 0 ? _a : (message) => console.log(message);
  }
  initialize(options) {
    this.atn = createATN(options.rules);
    this.dfas = initATNSimulator(this.atn);
  }
  validateAmbiguousAlternationAlternatives() {
    return [];
  }
  validateEmptyOrAlternatives() {
    return [];
  }
  buildLookaheadForAlternation(options) {
    const { prodOccurrence, rule, hasPredicates, dynamicTokensEnabled } = options;
    const dfas = this.dfas;
    const logging = this.logging;
    const key = buildATNKey(rule, "Alternation", prodOccurrence);
    const decisionState = this.atn.decisionMap[key];
    const decisionIndex = decisionState.decision;
    const partialAlts = map_default(getLookaheadPaths({
      maxLookahead: 1,
      occurrence: prodOccurrence,
      prodType: "Alternation",
      rule
    }), (currAlt) => map_default(currAlt, (path8) => path8[0]));
    if (isLL1Sequence(partialAlts, false) && !dynamicTokensEnabled) {
      const choiceToAlt = reduce_default(partialAlts, (result, currAlt, idx) => {
        forEach_default(currAlt, (currTokType) => {
          if (currTokType) {
            result[currTokType.tokenTypeIdx] = idx;
            forEach_default(currTokType.categoryMatches, (currExtendingType) => {
              result[currExtendingType] = idx;
            });
          }
        });
        return result;
      }, {});
      if (hasPredicates) {
        return function(orAlts) {
          var _a;
          const nextToken = this.LA(1);
          const prediction = choiceToAlt[nextToken.tokenTypeIdx];
          if (orAlts !== void 0 && prediction !== void 0) {
            const gate = (_a = orAlts[prediction]) === null || _a === void 0 ? void 0 : _a.GATE;
            if (gate !== void 0 && gate.call(this) === false) {
              return void 0;
            }
          }
          return prediction;
        };
      } else {
        return function() {
          const nextToken = this.LA(1);
          return choiceToAlt[nextToken.tokenTypeIdx];
        };
      }
    } else if (hasPredicates) {
      return function(orAlts) {
        const predicates = new PredicateSet();
        const length = orAlts === void 0 ? 0 : orAlts.length;
        for (let i = 0; i < length; i++) {
          const gate = orAlts === null || orAlts === void 0 ? void 0 : orAlts[i].GATE;
          predicates.set(i, gate === void 0 || gate.call(this));
        }
        const result = adaptivePredict.call(this, dfas, decisionIndex, predicates, logging);
        return typeof result === "number" ? result : void 0;
      };
    } else {
      return function() {
        const result = adaptivePredict.call(this, dfas, decisionIndex, EMPTY_PREDICATES, logging);
        return typeof result === "number" ? result : void 0;
      };
    }
  }
  buildLookaheadForOptional(options) {
    const { prodOccurrence, rule, prodType, dynamicTokensEnabled } = options;
    const dfas = this.dfas;
    const logging = this.logging;
    const key = buildATNKey(rule, prodType, prodOccurrence);
    const decisionState = this.atn.decisionMap[key];
    const decisionIndex = decisionState.decision;
    const alts = map_default(getLookaheadPaths({
      maxLookahead: 1,
      occurrence: prodOccurrence,
      prodType,
      rule
    }), (e) => {
      return map_default(e, (g) => g[0]);
    });
    if (isLL1Sequence(alts) && alts[0][0] && !dynamicTokensEnabled) {
      const alt = alts[0];
      const singleTokensTypes = flatten_default(alt);
      if (singleTokensTypes.length === 1 && isEmpty_default(singleTokensTypes[0].categoryMatches)) {
        const expectedTokenType = singleTokensTypes[0];
        const expectedTokenUniqueKey = expectedTokenType.tokenTypeIdx;
        return function() {
          return this.LA(1).tokenTypeIdx === expectedTokenUniqueKey;
        };
      } else {
        const choiceToAlt = reduce_default(singleTokensTypes, (result, currTokType) => {
          if (currTokType !== void 0) {
            result[currTokType.tokenTypeIdx] = true;
            forEach_default(currTokType.categoryMatches, (currExtendingType) => {
              result[currExtendingType] = true;
            });
          }
          return result;
        }, {});
        return function() {
          const nextToken = this.LA(1);
          return choiceToAlt[nextToken.tokenTypeIdx] === true;
        };
      }
    }
    return function() {
      const result = adaptivePredict.call(this, dfas, decisionIndex, EMPTY_PREDICATES, logging);
      return typeof result === "object" ? false : result === 0;
    };
  }
};
function isLL1Sequence(sequences, allowEmpty = true) {
  const fullSet = /* @__PURE__ */ new Set();
  for (const alt of sequences) {
    const altSet = /* @__PURE__ */ new Set();
    for (const tokType of alt) {
      if (tokType === void 0) {
        if (allowEmpty) {
          break;
        } else {
          return false;
        }
      }
      const indices = [tokType.tokenTypeIdx].concat(tokType.categoryMatches);
      for (const index of indices) {
        if (fullSet.has(index)) {
          if (!altSet.has(index)) {
            return false;
          }
        } else {
          fullSet.add(index);
          altSet.add(index);
        }
      }
    }
  }
  return true;
}
function initATNSimulator(atn) {
  const decisionLength = atn.decisionStates.length;
  const decisionToDFA = Array(decisionLength);
  for (let i = 0; i < decisionLength; i++) {
    decisionToDFA[i] = createDFACache(atn.decisionStates[i], i);
  }
  return decisionToDFA;
}
function adaptivePredict(dfaCaches, decision, predicateSet, logging) {
  const dfa = dfaCaches[decision](predicateSet);
  let start = dfa.start;
  if (start === void 0) {
    const closure2 = computeStartState(dfa.atnStartState);
    start = addDFAState(dfa, newDFAState(closure2));
    dfa.start = start;
  }
  const alt = performLookahead.apply(this, [dfa, start, predicateSet, logging]);
  return alt;
}
function performLookahead(dfa, s0, predicateSet, logging) {
  let previousD = s0;
  let i = 1;
  const path8 = [];
  let t = this.LA(i++);
  while (true) {
    let d = getExistingTargetState(previousD, t);
    if (d === void 0) {
      d = computeLookaheadTarget.apply(this, [dfa, previousD, t, i, predicateSet, logging]);
    }
    if (d === DFA_ERROR) {
      return buildAdaptivePredictError(path8, previousD, t);
    }
    if (d.isAcceptState === true) {
      return d.prediction;
    }
    previousD = d;
    path8.push(t);
    t = this.LA(i++);
  }
}
function computeLookaheadTarget(dfa, previousD, token, lookahead, predicateSet, logging) {
  const reach = computeReachSet(previousD.configs, token, predicateSet);
  if (reach.size === 0) {
    addDFAEdge(dfa, previousD, token, DFA_ERROR);
    return DFA_ERROR;
  }
  let newState2 = newDFAState(reach);
  const predictedAlt = getUniqueAlt(reach, predicateSet);
  if (predictedAlt !== void 0) {
    newState2.isAcceptState = true;
    newState2.prediction = predictedAlt;
    newState2.configs.uniqueAlt = predictedAlt;
  } else if (hasConflictTerminatingPrediction(reach)) {
    const prediction = min_default(reach.alts);
    newState2.isAcceptState = true;
    newState2.prediction = prediction;
    newState2.configs.uniqueAlt = prediction;
    reportLookaheadAmbiguity.apply(this, [dfa, lookahead, reach.alts, logging]);
  }
  newState2 = addDFAEdge(dfa, previousD, token, newState2);
  return newState2;
}
function reportLookaheadAmbiguity(dfa, lookahead, ambiguityIndices, logging) {
  const prefixPath = [];
  for (let i = 1; i <= lookahead; i++) {
    prefixPath.push(this.LA(i).tokenType);
  }
  const atnState = dfa.atnStartState;
  const topLevelRule = atnState.rule;
  const production = atnState.production;
  const message = buildAmbiguityError({
    topLevelRule,
    ambiguityIndices,
    production,
    prefixPath
  });
  logging(message);
}
function buildAmbiguityError(options) {
  const pathMsg = map_default(options.prefixPath, (currtok) => tokenLabel2(currtok)).join(", ");
  const occurrence = options.production.idx === 0 ? "" : options.production.idx;
  let currMessage = `Ambiguous Alternatives Detected: <${options.ambiguityIndices.join(", ")}> in <${getProductionDslName2(options.production)}${occurrence}> inside <${options.topLevelRule.name}> Rule,
<${pathMsg}> may appears as a prefix path in all these alternatives.
`;
  currMessage = currMessage + `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES
For Further details.`;
  return currMessage;
}
function getProductionDslName2(prod) {
  if (prod instanceof NonTerminal) {
    return "SUBRULE";
  } else if (prod instanceof Option) {
    return "OPTION";
  } else if (prod instanceof Alternation) {
    return "OR";
  } else if (prod instanceof RepetitionMandatory) {
    return "AT_LEAST_ONE";
  } else if (prod instanceof RepetitionMandatoryWithSeparator) {
    return "AT_LEAST_ONE_SEP";
  } else if (prod instanceof RepetitionWithSeparator) {
    return "MANY_SEP";
  } else if (prod instanceof Repetition) {
    return "MANY";
  } else if (prod instanceof Terminal) {
    return "CONSUME";
  } else {
    throw Error("non exhaustive match");
  }
}
function buildAdaptivePredictError(path8, previous, current) {
  const nextTransitions = flatMap_default(previous.configs.elements, (e) => e.state.transitions);
  const nextTokenTypes = uniqBy_default(nextTransitions.filter((e) => e instanceof AtomTransition).map((e) => e.tokenType), (e) => e.tokenTypeIdx);
  return {
    actualToken: current,
    possibleTokenTypes: nextTokenTypes,
    tokenPath: path8
  };
}
function getExistingTargetState(state, token) {
  return state.edges[token.tokenTypeIdx];
}
function computeReachSet(configs, token, predicateSet) {
  const intermediate = new ATNConfigSet();
  const skippedStopStates = [];
  for (const c of configs.elements) {
    if (predicateSet.is(c.alt) === false) {
      continue;
    }
    if (c.state.type === ATN_RULE_STOP) {
      skippedStopStates.push(c);
      continue;
    }
    const transitionLength = c.state.transitions.length;
    for (let i = 0; i < transitionLength; i++) {
      const transition = c.state.transitions[i];
      const target = getReachableTarget(transition, token);
      if (target !== void 0) {
        intermediate.add({
          state: target,
          alt: c.alt,
          stack: c.stack
        });
      }
    }
  }
  let reach;
  if (skippedStopStates.length === 0 && intermediate.size === 1) {
    reach = intermediate;
  }
  if (reach === void 0) {
    reach = new ATNConfigSet();
    for (const c of intermediate.elements) {
      closure(c, reach);
    }
  }
  if (skippedStopStates.length > 0 && !hasConfigInRuleStopState(reach)) {
    for (const c of skippedStopStates) {
      reach.add(c);
    }
  }
  return reach;
}
function getReachableTarget(transition, token) {
  if (transition instanceof AtomTransition && tokenMatcher(token, transition.tokenType)) {
    return transition.target;
  }
  return void 0;
}
function getUniqueAlt(configs, predicateSet) {
  let alt;
  for (const c of configs.elements) {
    if (predicateSet.is(c.alt) === true) {
      if (alt === void 0) {
        alt = c.alt;
      } else if (alt !== c.alt) {
        return void 0;
      }
    }
  }
  return alt;
}
function newDFAState(closure2) {
  return {
    configs: closure2,
    edges: {},
    isAcceptState: false,
    prediction: -1
  };
}
function addDFAEdge(dfa, from, token, to) {
  to = addDFAState(dfa, to);
  from.edges[token.tokenTypeIdx] = to;
  return to;
}
function addDFAState(dfa, state) {
  if (state === DFA_ERROR) {
    return state;
  }
  const mapKey = state.configs.key;
  const existing = dfa.states[mapKey];
  if (existing !== void 0) {
    return existing;
  }
  state.configs.finalize();
  dfa.states[mapKey] = state;
  return state;
}
function computeStartState(atnState) {
  const configs = new ATNConfigSet();
  const numberOfTransitions = atnState.transitions.length;
  for (let i = 0; i < numberOfTransitions; i++) {
    const target = atnState.transitions[i].target;
    const config = {
      state: target,
      alt: i,
      stack: []
    };
    closure(config, configs);
  }
  return configs;
}
function closure(config, configs) {
  const p = config.state;
  if (p.type === ATN_RULE_STOP) {
    if (config.stack.length > 0) {
      const atnStack = [...config.stack];
      const followState = atnStack.pop();
      const followConfig = {
        state: followState,
        alt: config.alt,
        stack: atnStack
      };
      closure(followConfig, configs);
    } else {
      configs.add(config);
    }
    return;
  }
  if (!p.epsilonOnlyTransitions) {
    configs.add(config);
  }
  const transitionLength = p.transitions.length;
  for (let i = 0; i < transitionLength; i++) {
    const transition = p.transitions[i];
    const c = getEpsilonTarget(config, transition);
    if (c !== void 0) {
      closure(c, configs);
    }
  }
}
function getEpsilonTarget(config, transition) {
  if (transition instanceof EpsilonTransition) {
    return {
      state: transition.target,
      alt: config.alt,
      stack: config.stack
    };
  } else if (transition instanceof RuleTransition) {
    const stack = [...config.stack, transition.followState];
    return {
      state: transition.target,
      alt: config.alt,
      stack
    };
  }
  return void 0;
}
function hasConfigInRuleStopState(configs) {
  for (const c of configs.elements) {
    if (c.state.type === ATN_RULE_STOP) {
      return true;
    }
  }
  return false;
}
function allConfigsInRuleStopStates(configs) {
  for (const c of configs.elements) {
    if (c.state.type !== ATN_RULE_STOP) {
      return false;
    }
  }
  return true;
}
function hasConflictTerminatingPrediction(configs) {
  if (allConfigsInRuleStopStates(configs)) {
    return true;
  }
  const altSets = getConflictingAltSets(configs.elements);
  const heuristic = hasConflictingAltSet(altSets) && !hasStateAssociatedWithOneAlt(altSets);
  return heuristic;
}
function getConflictingAltSets(configs) {
  const configToAlts = /* @__PURE__ */ new Map();
  for (const c of configs) {
    const key = getATNConfigKey(c, false);
    let alts = configToAlts.get(key);
    if (alts === void 0) {
      alts = {};
      configToAlts.set(key, alts);
    }
    alts[c.alt] = true;
  }
  return configToAlts;
}
function hasConflictingAltSet(altSets) {
  for (const value of Array.from(altSets.values())) {
    if (Object.keys(value).length > 1) {
      return true;
    }
  }
  return false;
}
function hasStateAssociatedWithOneAlt(altSets) {
  for (const value of Array.from(altSets.values())) {
    if (Object.keys(value).length === 1) {
      return true;
    }
  }
  return false;
}

// ../../node_modules/java-parser/src/productions/lexical-structure.js
function defineRules($, t) {
  $.RULE("literal", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.integerLiteral) },
      { ALT: () => $.SUBRULE($.floatingPointLiteral) },
      { ALT: () => $.SUBRULE($.booleanLiteral) },
      { ALT: () => $.CONSUME(t.CharLiteral) },
      { ALT: () => $.CONSUME(t.TextBlock) },
      { ALT: () => $.CONSUME(t.StringLiteral) },
      { ALT: () => $.CONSUME(t.Null) }
    ]);
  });
  $.RULE("integerLiteral", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.DecimalLiteral) },
      { ALT: () => $.CONSUME(t.HexLiteral) },
      { ALT: () => $.CONSUME(t.OctalLiteral) },
      { ALT: () => $.CONSUME(t.BinaryLiteral) }
    ]);
  });
  $.RULE("floatingPointLiteral", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.FloatLiteral) },
      { ALT: () => $.CONSUME(t.HexFloatLiteral) }
    ]);
  });
  $.RULE("booleanLiteral", () => {
    $.OR([{ ALT: () => $.CONSUME(t.True) }, { ALT: () => $.CONSUME(t.False) }]);
  });
}

// ../../node_modules/java-parser/src/productions/types-values-and-variables.js
function defineRules2($, t) {
  $.RULE("primitiveType", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.OR([
      { ALT: () => $.SUBRULE($.numericType) },
      { ALT: () => $.CONSUME(t.Boolean) }
    ]);
  });
  $.RULE("numericType", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.integralType) },
      { ALT: () => $.SUBRULE($.floatingPointType) }
    ]);
  });
  $.RULE("integralType", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Byte) },
      { ALT: () => $.CONSUME(t.Short) },
      { ALT: () => $.CONSUME(t.Int) },
      { ALT: () => $.CONSUME(t.Long) },
      { ALT: () => $.CONSUME(t.Char) }
    ]);
  });
  $.RULE("floatingPointType", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Float) },
      { ALT: () => $.CONSUME(t.Double) }
    ]);
  });
  $.RULE("referenceType", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.OR({
      DEF: [
        {
          ALT: () => {
            $.SUBRULE($.primitiveType);
            $.SUBRULE($.dims);
          }
        },
        {
          // Spec Deviation: "typeVariable" alternative is missing because
          //                 it is included in "classOrInterfaceType"
          ALT: () => {
            $.SUBRULE($.classOrInterfaceType);
            $.OPTION(() => {
              $.SUBRULE2($.dims);
            });
          }
        }
      ],
      IGNORE_AMBIGUITIES: true
      // annotation prefix was extracted to remove ambiguities
    });
  });
  $.RULE("classOrInterfaceType", () => {
    $.SUBRULE($.classType);
  });
  $.RULE("classType", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.Identifier);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.MANY3(() => {
        $.SUBRULE2($.annotation);
      });
      $.CONSUME2(t.Identifier);
      $.OPTION2(() => $.SUBRULE2($.typeArguments));
    });
  });
  $.RULE("interfaceType", () => {
    $.SUBRULE($.classType);
  });
  $.RULE("typeVariable", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.Identifier);
  });
  $.RULE("dims", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.LSquare);
    $.CONSUME(t.RSquare);
    $.MANY2({
      GATE: () => $.BACKTRACK_LOOKAHEAD($.isDims),
      DEF: () => {
        $.MANY3(() => {
          $.SUBRULE2($.annotation);
        });
        $.CONSUME2(t.LSquare);
        $.CONSUME2(t.RSquare);
      }
    });
  });
  $.RULE("typeParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.typeParameterModifier);
    });
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeBound);
    });
  });
  $.RULE("typeParameterModifier", () => {
    $.SUBRULE($.annotation);
  });
  $.RULE("typeBound", () => {
    $.CONSUME(t.Extends);
    $.SUBRULE($.classOrInterfaceType);
    $.MANY(() => {
      $.SUBRULE($.additionalBound);
    });
  });
  $.RULE("additionalBound", () => {
    $.CONSUME(t.And);
    $.SUBRULE($.interfaceType);
  });
  $.RULE("typeArguments", () => {
    $.CONSUME(t.Less);
    $.SUBRULE($.typeArgumentList);
    $.CONSUME(t.Greater);
  });
  $.RULE("typeArgumentList", () => {
    $.SUBRULE($.typeArgument);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.typeArgument);
    });
  });
  $.RULE("typeArgument", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.referenceType) },
      { ALT: () => $.SUBRULE($.wildcard) }
    ]);
  });
  $.RULE("wildcard", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.QuestionMark);
    $.OPTION(() => {
      $.SUBRULE($.wildcardBounds);
    });
  });
  $.RULE("wildcardBounds", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Extends) },
      { ALT: () => $.CONSUME(t.Super) }
    ]);
    $.SUBRULE($.referenceType);
  });
}

// ../../node_modules/java-parser/src/productions/names.js
function defineRules3($, t) {
  $.RULE("moduleName", () => {
    $.CONSUME(t.Identifier);
    $.MANY(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
  });
  $.RULE("packageName", () => {
    $.CONSUME(t.Identifier);
    $.MANY(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
  });
  $.RULE("typeName", () => {
    $.CONSUME(t.Identifier);
    $.MANY(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
  });
  $.RULE("expressionName", () => {
    $.CONSUME(t.Identifier);
    $.MANY({
      // expressionName could be called by "qualifiedExplicitConstructorInvocation"
      // in that case it may be followed by ".super" so we need to look two tokens
      // ahead.
      GATE: () => tokenMatcher(this.LA(2).tokenType, t.Identifier),
      DEF: () => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      }
    });
  });
  $.RULE("methodName", () => {
    $.CONSUME(t.Identifier);
  });
  $.RULE("packageOrTypeName", () => {
    $.CONSUME(t.Identifier);
    $.MANY({
      // In some contexts a "Dot Star" (.*) may appear
      // after a "packageOrTypeName", by default Chevrotain will
      // only look a single token ahead (Dot) to determine if another iteration
      // exists which will cause a parsing error for inputs such as:
      // "import a.b.c.*"
      GATE: () => tokenMatcher(this.LA(2).tokenType, t.Star) === false,
      DEF: () => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      }
    });
  });
  $.RULE("ambiguousName", () => {
    $.CONSUME(t.Identifier);
    $.MANY(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
  });
}

// ../../node_modules/java-parser/src/productions/packages-and-modules.js
function defineRules4($, t) {
  $.RULE("compilationUnit", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.ordinaryCompilationUnit) },
      { ALT: () => $.SUBRULE($.modularCompilationUnit) }
    ]);
    $.CONSUME(EOF);
  });
  $.RULE("ordinaryCompilationUnit", () => {
    $.OPTION(() => $.SUBRULE($.packageDeclaration));
    $.MANY(() => {
      $.SUBRULE3($.importDeclaration);
    });
    $.MANY2(() => {
      $.SUBRULE($.typeDeclaration);
    });
  });
  $.RULE("modularCompilationUnit", () => {
    $.MANY(() => {
      $.SUBRULE($.importDeclaration);
    });
    $.SUBRULE($.moduleDeclaration);
  });
  $.RULE("packageDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.packageModifier);
    });
    $.CONSUME(t.Package);
    $.CONSUME(t.Identifier);
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
    $.CONSUME2(t.Semicolon);
  });
  $.RULE("packageModifier", () => {
    $.SUBRULE($.annotation);
  });
  $.RULE("importDeclaration", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Import);
          $.OPTION(() => {
            $.CONSUME(t.Static);
          });
          $.SUBRULE($.packageOrTypeName);
          $.OPTION2(() => {
            $.CONSUME(t.Dot);
            $.CONSUME(t.Star);
          });
          $.CONSUME(t.Semicolon);
        }
      },
      // Spec Deviation: The spec do not allow empty statement in between imports.
      //                 However Java compiler consider empty statements valid, we chose
      //                 to support that case, thus deviate from the spec.
      //                 See here: https://github.com/jhipster/prettier-java/pull/158
      {
        ALT: () => $.SUBRULE($.emptyStatement)
      }
    ]);
  });
  $.RULE("typeDeclaration", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Semicolon) },
      { ALT: () => $.SUBRULE($.classDeclaration) },
      { ALT: () => $.SUBRULE($.interfaceDeclaration) },
      { ALT: () => $.SUBRULE($.fieldDeclaration) },
      { ALT: () => $.SUBRULE($.methodDeclaration) }
    ]);
  });
  $.RULE("moduleDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.OPTION(() => {
      $.CONSUME(t.Open);
    });
    $.CONSUME(t.Module);
    $.CONSUME(t.Identifier);
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.CONSUME2(t.Identifier);
    });
    $.CONSUME(t.LCurly);
    $.MANY3(() => {
      $.SUBRULE($.moduleDirective);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("moduleDirective", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.requiresModuleDirective) },
      { ALT: () => $.SUBRULE($.exportsModuleDirective) },
      { ALT: () => $.SUBRULE($.opensModuleDirective) },
      { ALT: () => $.SUBRULE($.usesModuleDirective) },
      { ALT: () => $.SUBRULE($.providesModuleDirective) }
    ]);
  });
  $.RULE("requiresModuleDirective", () => {
    $.CONSUME(t.Requires);
    $.MANY({
      GATE: () => {
        return (tokenMatcher($.LA(1).tokenType, t.Transitive) && tokenMatcher($.LA(2).tokenType, t.Separators)) === false;
      },
      DEF: () => {
        $.SUBRULE($.requiresModifier);
      }
    });
    $.SUBRULE($.moduleName);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("exportsModuleDirective", () => {
    $.CONSUME(t.Exports);
    $.SUBRULE($.packageName);
    $.OPTION(() => {
      $.CONSUME(t.To);
      $.SUBRULE($.moduleName);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.moduleName);
      });
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("opensModuleDirective", () => {
    $.CONSUME(t.Opens);
    $.SUBRULE($.packageName);
    $.OPTION(() => {
      $.CONSUME(t.To);
      $.SUBRULE($.moduleName);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.moduleName);
      });
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("usesModuleDirective", () => {
    $.CONSUME(t.Uses);
    $.SUBRULE($.typeName);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("providesModuleDirective", () => {
    $.CONSUME(t.Provides);
    $.SUBRULE($.typeName);
    $.CONSUME(t.With);
    $.SUBRULE2($.typeName);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE3($.typeName);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("requiresModifier", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Transitive) },
      { ALT: () => $.CONSUME(t.Static) }
    ]);
  });
}

// ../../node_modules/java-parser/src/productions/classes.js
function defineRules5($, t) {
  $.RULE("classDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.classModifier);
    });
    $.OR([
      { ALT: () => $.SUBRULE($.normalClassDeclaration) },
      { ALT: () => $.SUBRULE($.enumDeclaration) },
      { ALT: () => $.SUBRULE($.recordDeclaration) }
    ]);
  });
  $.RULE("normalClassDeclaration", () => {
    $.CONSUME(t.Class);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.OPTION2(() => {
      $.SUBRULE($.classExtends);
    });
    $.OPTION3(() => {
      $.SUBRULE($.classImplements);
    });
    $.OPTION4(() => {
      $.SUBRULE($.classPermits);
    });
    $.SUBRULE($.classBody);
  });
  $.RULE("classModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) },
      { ALT: () => $.CONSUME(t.Sealed) },
      { ALT: () => $.CONSUME(t.NonSealed) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });
  $.RULE("typeParameters", () => {
    $.CONSUME(t.Less);
    $.SUBRULE($.typeParameterList);
    $.CONSUME(t.Greater);
  });
  $.RULE("typeParameterList", () => {
    $.SUBRULE($.typeParameter);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.typeParameter);
    });
  });
  $.RULE("classExtends", () => {
    $.CONSUME(t.Extends);
    $.SUBRULE($.classType);
  });
  $.RULE("classImplements", () => {
    $.CONSUME(t.Implements);
    $.SUBRULE($.interfaceTypeList);
  });
  $.RULE("interfaceTypeList", () => {
    $.SUBRULE($.interfaceType);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.interfaceType);
    });
  });
  $.RULE("classPermits", () => {
    $.CONSUME(t.Permits);
    $.SUBRULE($.typeName);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.typeName);
    });
  });
  $.RULE("classBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.classBodyDeclaration);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("classBodyDeclaration", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.classMemberDeclaration) },
      { ALT: () => $.SUBRULE($.instanceInitializer) },
      { ALT: () => $.SUBRULE($.staticInitializer) },
      { ALT: () => $.SUBRULE($.constructorDeclaration) }
    ]);
  });
  $.RULE("classMemberDeclaration", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.fieldDeclaration) },
      { ALT: () => $.SUBRULE($.methodDeclaration) },
      { ALT: () => $.SUBRULE($.classDeclaration) },
      { ALT: () => $.SUBRULE($.interfaceDeclaration) },
      { ALT: () => $.CONSUME(t.Semicolon) }
    ]);
  });
  $.RULE("fieldDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.fieldModifier);
    });
    $.SUBRULE($.unannType);
    $.SUBRULE($.variableDeclaratorList);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("fieldModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) },
      { ALT: () => $.CONSUME(t.Transient) },
      { ALT: () => $.CONSUME(t.Volatile) }
    ]);
  });
  $.RULE("variableDeclaratorList", (isSingleDeclarator) => {
    $.SUBRULE($.variableDeclarator);
    $.MANY({
      // TypePattern has a semantic requirement that its VariableDeclaratorList
      // consists of a single VariableDeclarator
      GATE: () => !isSingleDeclarator,
      DEF: () => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.variableDeclarator);
      }
    });
  });
  $.RULE("variableDeclarator", () => {
    $.SUBRULE($.variableDeclaratorId);
    $.OPTION(() => {
      $.CONSUME(t.Equals);
      $.SUBRULE($.variableInitializer);
    });
  });
  $.RULE("variableDeclaratorId", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Identifier);
          $.OPTION(() => {
            $.SUBRULE($.dims);
          });
        }
      },
      { ALT: () => $.CONSUME(t.Underscore) }
    ]);
  });
  $.RULE("variableInitializer", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.expression) },
      { ALT: () => $.SUBRULE($.arrayInitializer) }
    ]);
  });
  $.RULE("unannType", () => {
    $.OR([
      // Spec Deviation: The array type "dims" suffix was extracted to this rule
      // to avoid backtracking for performance reasons.
      { ALT: () => $.SUBRULE($.unannPrimitiveTypeWithOptionalDimsSuffix) },
      { ALT: () => $.SUBRULE($.unannReferenceType) }
    ]);
  });
  $.RULE("unannPrimitiveTypeWithOptionalDimsSuffix", () => {
    $.SUBRULE($.unannPrimitiveType);
    $.OPTION({
      GATE: () => this.BACKTRACK_LOOKAHEAD($.isDims),
      DEF: () => $.SUBRULE2($.dims)
    });
  });
  $.RULE("unannPrimitiveType", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.numericType) },
      { ALT: () => $.CONSUME(t.Boolean) }
    ]);
  });
  $.RULE("unannReferenceType", () => {
    $.SUBRULE($.unannClassOrInterfaceType);
    $.OPTION({
      GATE: () => this.BACKTRACK_LOOKAHEAD($.isDims),
      DEF: () => $.SUBRULE2($.dims)
    });
  });
  $.RULE("unannClassOrInterfaceType", () => {
    $.SUBRULE($.unannClassType);
  });
  $.RULE("unannClassType", () => {
    $.CONSUME(t.Identifier);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.MANY3(() => {
        $.SUBRULE2($.annotation);
      });
      $.CONSUME2(t.Identifier);
      $.OPTION2(() => {
        $.SUBRULE2($.typeArguments);
      });
    });
  });
  $.RULE("unannInterfaceType", () => {
    $.SUBRULE($.unannClassType);
  });
  $.RULE("unannTypeVariable", () => {
    $.CONSUME(t.Identifier);
  });
  $.RULE("methodDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.methodModifier);
    });
    $.SUBRULE($.methodHeader);
    $.SUBRULE($.methodBody);
  });
  $.RULE("methodModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) },
      { ALT: () => $.CONSUME(t.Synchronized) },
      { ALT: () => $.CONSUME(t.Native) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });
  $.RULE("methodHeader", () => {
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
    });
    $.SUBRULE($.result);
    $.SUBRULE($.methodDeclarator);
    $.OPTION2(() => {
      $.SUBRULE($.throws);
    });
  });
  $.RULE("result", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.unannType) },
      { ALT: () => $.CONSUME(t.Void) }
    ]);
  });
  $.RULE("methodDeclarator", () => {
    $.CONSUME(t.Identifier);
    $.CONSUME(t.LBrace);
    $.OR([
      {
        ALT: () => {
          $.SUBRULE($.receiverParameter);
          $.OPTION(() => {
            $.CONSUME(t.Comma);
            $.SUBRULE($.formalParameterList);
          });
        }
      },
      { ALT: () => $.OPTION1(() => $.SUBRULE1($.formalParameterList)) }
    ]);
    $.CONSUME(t.RBrace);
    $.OPTION2(() => {
      $.SUBRULE($.dims);
    });
  });
  $.RULE("receiverParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.SUBRULE($.unannType);
    $.OPTION(() => {
      $.CONSUME(t.Identifier);
      $.CONSUME(t.Dot);
    });
    $.CONSUME(t.This);
  });
  $.RULE("formalParameterList", () => {
    $.SUBRULE($.formalParameter);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.formalParameter);
    });
  });
  $.RULE("formalParameter", () => {
    $.OR([
      // Spec Deviation: extracted to "variableParaRegularParameter"
      { ALT: () => $.SUBRULE($.variableParaRegularParameter) },
      { ALT: () => $.SUBRULE($.variableArityParameter) }
    ]);
  });
  $.RULE("variableParaRegularParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.unannType);
    $.SUBRULE($.variableDeclaratorId);
  });
  $.RULE("variableArityParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.unannType);
    $.MANY2(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.DotDotDot);
    $.CONSUME(t.Identifier);
  });
  $.RULE("variableModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Final) }
    ]);
  });
  $.RULE("throws", () => {
    $.CONSUME(t.Throws);
    $.SUBRULE($.exceptionTypeList);
  });
  $.RULE("exceptionTypeList", () => {
    $.SUBRULE($.exceptionType);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.exceptionType);
    });
  });
  $.RULE("exceptionType", () => {
    $.SUBRULE($.classType);
  });
  $.RULE("methodBody", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.block) },
      { ALT: () => $.CONSUME(t.Semicolon) }
    ]);
  });
  $.RULE("instanceInitializer", () => {
    $.SUBRULE($.block);
  });
  $.RULE("staticInitializer", () => {
    $.CONSUME(t.Static);
    $.SUBRULE($.block);
  });
  $.RULE("constructorDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.constructorModifier);
    });
    $.SUBRULE($.constructorDeclarator);
    $.OPTION(() => {
      $.SUBRULE($.throws);
    });
    $.SUBRULE($.constructorBody);
  });
  $.RULE("constructorModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) }
    ]);
  });
  $.RULE("constructorDeclarator", () => {
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.SUBRULE($.simpleTypeName);
    $.CONSUME(t.LBrace);
    $.OR([
      {
        ALT: () => {
          $.SUBRULE($.receiverParameter);
          $.OPTION1(() => {
            $.CONSUME(t.Comma);
            $.SUBRULE($.formalParameterList);
          });
        }
      },
      { ALT: () => $.OPTION2(() => $.SUBRULE1($.formalParameterList)) }
    ]);
    $.CONSUME(t.RBrace);
  });
  $.RULE("simpleTypeName", () => {
    $.SUBRULE($.typeIdentifier);
  });
  $.RULE("constructorBody", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.explicitConstructorInvocation);
    });
    $.OPTION2(() => {
      $.SUBRULE($.blockStatements);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("explicitConstructorInvocation", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.unqualifiedExplicitConstructorInvocation) },
      { ALT: () => $.SUBRULE($.qualifiedExplicitConstructorInvocation) }
    ]);
  });
  $.RULE("unqualifiedExplicitConstructorInvocation", () => {
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.OR([
      {
        ALT: () => $.CONSUME(t.This)
      },
      {
        ALT: () => $.CONSUME(t.Super)
      }
    ]);
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("qualifiedExplicitConstructorInvocation", () => {
    $.SUBRULE($.expressionName);
    $.CONSUME(t.Dot);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.CONSUME(t.Super);
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("enumDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.classModifier);
    });
    $.CONSUME(t.Enum);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.classImplements);
    });
    $.SUBRULE($.enumBody);
  });
  $.RULE("enumBody", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.enumConstantList);
    });
    $.OPTION2(() => {
      $.CONSUME(t.Comma);
    });
    $.OPTION3(() => {
      $.SUBRULE($.enumBodyDeclarations);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("enumConstantList", () => {
    $.SUBRULE($.enumConstant);
    $.MANY({
      GATE: () => {
        const nextToken = $.LA(2);
        return tokenMatcher(nextToken, t.Identifier) || tokenMatcher(nextToken, t.At);
      },
      DEF: () => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.enumConstant);
      }
    });
  });
  $.RULE("enumConstant", () => {
    $.MANY(() => {
      $.SUBRULE($.enumConstantModifier);
    });
    $.CONSUME(t.Identifier);
    $.OPTION(() => {
      $.CONSUME(t.LBrace);
      $.OPTION2(() => {
        $.SUBRULE($.argumentList);
      });
      $.CONSUME(t.RBrace);
    });
    $.OPTION3(() => {
      $.SUBRULE($.classBody);
    });
  });
  $.RULE("enumConstantModifier", () => {
    $.SUBRULE($.annotation);
  });
  $.RULE("enumBodyDeclarations", () => {
    $.CONSUME(t.Semicolon);
    $.MANY(() => {
      $.SUBRULE($.classBodyDeclaration);
    });
  });
  $.RULE("recordDeclaration", () => {
    $.CONSUME(t.Record);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.SUBRULE($.recordHeader);
    $.OPTION2(() => {
      $.SUBRULE($.classImplements);
    });
    $.SUBRULE($.recordBody);
  });
  $.RULE("recordHeader", () => {
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.recordComponentList);
    });
    $.CONSUME(t.RBrace);
  });
  $.RULE("recordComponentList", () => {
    $.SUBRULE($.recordComponent);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.recordComponent);
    });
  });
  $.RULE("recordComponent", () => {
    $.MANY(() => {
      $.SUBRULE($.recordComponentModifier);
    });
    $.SUBRULE($.unannType);
    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      { ALT: () => $.SUBRULE($.variableArityRecordComponent) }
    ]);
  });
  $.RULE("variableArityRecordComponent", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.DotDotDot);
    $.CONSUME(t.Identifier);
  });
  $.RULE("recordComponentModifier", () => {
    $.SUBRULE($.annotation);
  });
  $.RULE("recordBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.recordBodyDeclaration);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("recordBodyDeclaration", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.compactConstructorDeclaration) },
      { ALT: () => $.SUBRULE($.classBodyDeclaration) }
    ]);
  });
  $.RULE("compactConstructorDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.constructorModifier);
    });
    $.SUBRULE($.simpleTypeName);
    $.SUBRULE($.constructorBody);
  });
  $.RULE("isDims", () => {
    $.MANY($.annotation);
    return tokenMatcher(this.LA(1), t.LSquare) && tokenMatcher(this.LA(2), t.RSquare);
  });
}

// ../../node_modules/java-parser/src/productions/interfaces.js
function defineRules6($, t) {
  $.RULE("interfaceDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceModifier);
    });
    $.OR([
      { ALT: () => $.SUBRULE($.normalInterfaceDeclaration) },
      { ALT: () => $.SUBRULE($.annotationInterfaceDeclaration) }
    ]);
  });
  $.RULE("normalInterfaceDeclaration", () => {
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.OPTION2(() => {
      $.SUBRULE($.interfaceExtends);
    });
    $.OPTION3(() => {
      $.SUBRULE($.interfacePermits);
    });
    $.SUBRULE($.interfaceBody);
  });
  $.RULE("interfaceModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Sealed) },
      { ALT: () => $.CONSUME(t.NonSealed) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });
  $.RULE("interfaceExtends", () => {
    $.CONSUME(t.Extends);
    $.SUBRULE($.interfaceTypeList);
  });
  $.RULE("interfacePermits", () => {
    $.CONSUME(t.Permits);
    $.SUBRULE($.typeName);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.typeName);
    });
  });
  $.RULE("interfaceBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.interfaceMemberDeclaration);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("interfaceMemberDeclaration", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.constantDeclaration) },
      { ALT: () => $.SUBRULE($.interfaceMethodDeclaration) },
      { ALT: () => $.SUBRULE($.classDeclaration) },
      { ALT: () => $.SUBRULE($.interfaceDeclaration) },
      { ALT: () => $.CONSUME(t.Semicolon) }
    ]);
  });
  $.RULE("constantDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.constantModifier);
    });
    $.SUBRULE($.unannType);
    $.SUBRULE($.variableDeclaratorList);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("constantModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) }
    ]);
  });
  $.RULE("interfaceMethodDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceMethodModifier);
    });
    $.SUBRULE($.methodHeader);
    $.SUBRULE($.methodBody);
  });
  $.RULE("interfaceMethodModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Default) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });
  $.RULE("annotationInterfaceDeclaration", () => {
    $.CONSUME(t.At);
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.SUBRULE($.annotationInterfaceBody);
  });
  $.RULE("annotationInterfaceBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.annotationInterfaceMemberDeclaration);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("annotationInterfaceMemberDeclaration", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotationInterfaceElementDeclaration) },
      { ALT: () => $.SUBRULE($.constantDeclaration) },
      { ALT: () => $.SUBRULE($.classDeclaration) },
      { ALT: () => $.SUBRULE($.interfaceDeclaration) },
      { ALT: () => $.CONSUME(t.Semicolon) }
    ]);
  });
  $.RULE("annotationInterfaceElementDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.annotationInterfaceElementModifier);
    });
    $.SUBRULE($.unannType);
    $.CONSUME(t.Identifier);
    $.CONSUME(t.LBrace);
    $.CONSUME(t.RBrace);
    $.OPTION(() => {
      $.SUBRULE($.dims);
    });
    $.OPTION2(() => {
      $.SUBRULE($.defaultValue);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("annotationInterfaceElementModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Abstract) }
    ]);
  });
  $.RULE("defaultValue", () => {
    $.CONSUME(t.Default);
    $.SUBRULE($.elementValue);
  });
  $.RULE("annotation", () => {
    $.CONSUME(t.At);
    $.SUBRULE($.typeName);
    $.OPTION(() => {
      $.CONSUME(t.LBrace);
      $.OR({
        DEF: [
          // https://docs.oracle.com/javase/specs/jls/se22/html/jls-9.html#jls-NormalAnnotation
          { ALT: () => $.SUBRULE($.elementValuePairList) },
          // https://docs.oracle.com/javase/specs/jls/se22/html/jls-9.html#jls-SingleElementAnnotation
          { ALT: () => $.SUBRULE($.elementValue) },
          {
            ALT: () => {
            }
          }
        ],
        IGNORE_AMBIGUITIES: true
      });
      $.CONSUME(t.RBrace);
    });
  });
  $.RULE("elementValuePairList", () => {
    $.SUBRULE($.elementValuePair);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.elementValuePair);
    });
  });
  $.RULE("elementValuePair", () => {
    $.CONSUME(t.Identifier);
    $.CONSUME(t.Equals);
    $.SUBRULE($.elementValue);
  });
  $.RULE("elementValue", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.conditionalExpression) },
      { ALT: () => $.SUBRULE($.elementValueArrayInitializer) },
      { ALT: () => $.SUBRULE($.annotation) }
    ]);
  });
  $.RULE("elementValueArrayInitializer", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.elementValueList);
    });
    $.OPTION2(() => {
      $.CONSUME(t.Comma);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("elementValueList", () => {
    $.SUBRULE($.elementValue);
    $.MANY({
      GATE: () => tokenMatcher($.LA(2).tokenType, t.RCurly) === false,
      DEF: () => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.elementValue);
      }
    });
  });
}

// ../../node_modules/java-parser/src/productions/arrays.js
function defineRules7($, t) {
  $.RULE("arrayInitializer", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.variableInitializerList);
    });
    $.OPTION2(() => {
      $.CONSUME(t.Comma);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("variableInitializerList", () => {
    $.SUBRULE($.variableInitializer);
    $.MANY({
      // The optional last "Comma" of an "arrayInitializer"
      GATE: () => tokenMatcher(this.LA(2).tokenType, t.RCurly) === false,
      DEF: () => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.variableInitializer);
      }
    });
  });
}

// ../../node_modules/java-parser/src/productions/blocks-and-statements.js
function defineRules8($, t) {
  $.RULE("block", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.blockStatements);
    });
    $.CONSUME(t.RCurly);
  });
  $.RULE("blockStatements", () => {
    $.SUBRULE($.blockStatement);
    $.MANY(() => {
      $.SUBRULE2($.blockStatement);
    });
  });
  $.RULE("blockStatement", () => {
    $.OR({
      DEF: [
        { ALT: () => $.SUBRULE($.localVariableDeclarationStatement) },
        { ALT: () => $.SUBRULE($.classDeclaration) },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.SUBRULE($.statement) }
      ],
      IGNORE_AMBIGUITIES: true
    });
  });
  $.RULE("localVariableDeclarationStatement", () => {
    $.SUBRULE($.localVariableDeclaration);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("localVariableDeclaration", (isSingleDeclarator) => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.localVariableType);
    $.SUBRULE($.variableDeclaratorList, { ARGS: [isSingleDeclarator] });
  });
  $.RULE("localVariableType", () => {
    $.OR({
      DEF: [
        { ALT: () => $.SUBRULE($.unannType) },
        { ALT: () => $.CONSUME(t.Var) }
      ],
      IGNORE_AMBIGUITIES: true
    });
  });
  $.RULE("statement", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.statementWithoutTrailingSubstatement) },
      { ALT: () => $.SUBRULE($.labeledStatement) },
      // Spec deviation: combined "IfThenStatement" and "IfThenElseStatement"
      { ALT: () => $.SUBRULE($.ifStatement) },
      { ALT: () => $.SUBRULE($.whileStatement) },
      { ALT: () => $.SUBRULE($.forStatement) }
    ]);
  });
  $.RULE("statementWithoutTrailingSubstatement", () => {
    $.OR({
      DEF: [
        { ALT: () => $.SUBRULE($.block) },
        { ALT: () => $.SUBRULE($.yieldStatement) },
        { ALT: () => $.SUBRULE($.emptyStatement) },
        {
          GATE: () => !tokenMatcher(this.LA(1).tokenType, t.Switch),
          ALT: () => $.SUBRULE($.expressionStatement)
        },
        { ALT: () => $.SUBRULE($.assertStatement) },
        { ALT: () => $.SUBRULE($.switchStatement) },
        { ALT: () => $.SUBRULE($.doStatement) },
        { ALT: () => $.SUBRULE($.breakStatement) },
        { ALT: () => $.SUBRULE($.continueStatement) },
        { ALT: () => $.SUBRULE($.returnStatement) },
        { ALT: () => $.SUBRULE($.synchronizedStatement) },
        { ALT: () => $.SUBRULE($.throwStatement) },
        { ALT: () => $.SUBRULE($.tryStatement) }
      ],
      IGNORE_AMBIGUITIES: true
    });
  });
  $.RULE("emptyStatement", () => {
    $.CONSUME(t.Semicolon);
  });
  $.RULE("labeledStatement", () => {
    $.CONSUME(t.Identifier);
    $.CONSUME(t.Colon);
    $.SUBRULE($.statement);
  });
  $.RULE("expressionStatement", () => {
    $.SUBRULE($.statementExpression);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("statementExpression", () => {
    $.SUBRULE($.expression);
  });
  $.RULE("ifStatement", () => {
    $.CONSUME(t.If);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
    $.OPTION(() => {
      $.CONSUME(t.Else);
      $.SUBRULE2($.statement);
    });
  });
  $.RULE("assertStatement", () => {
    $.CONSUME(t.Assert);
    $.SUBRULE($.expression);
    $.OPTION(() => {
      $.CONSUME(t.Colon);
      $.SUBRULE2($.expression);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("switchStatement", () => {
    $.CONSUME(t.Switch);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.switchBlock);
  });
  $.RULE("switchBlock", () => {
    $.CONSUME(t.LCurly);
    $.OR([
      {
        ALT: () => {
          $.SUBRULE($.switchRule);
          $.MANY(() => $.SUBRULE2($.switchRule));
        }
      },
      { ALT: () => $.MANY2(() => $.SUBRULE($.switchBlockStatementGroup)) }
    ]);
    $.CONSUME(t.RCurly);
  });
  $.RULE("switchBlockStatementGroup", () => {
    $.SUBRULE($.switchLabel);
    $.CONSUME(t.Colon);
    $.OPTION(() => {
      $.SUBRULE($.blockStatements);
    });
  });
  $.RULE("switchLabel", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Case);
          $.OR2([
            {
              ALT: () => {
                $.CONSUME(t.Null);
                $.OPTION2(() => {
                  $.CONSUME3(t.Comma);
                  $.CONSUME(t.Default);
                });
              }
            },
            {
              ALT: () => {
                $.SUBRULE($.casePattern);
                $.MANY(() => {
                  $.CONSUME(t.Comma);
                  $.SUBRULE2($.casePattern);
                });
                $.OPTION(() => {
                  $.SUBRULE($.guard);
                });
              }
            },
            {
              GATE: () => !tokenMatcher($.LA(1).tokenType, t.Null),
              ALT: () => {
                $.SUBRULE($.caseConstant);
                $.MANY2(() => {
                  $.CONSUME2(t.Comma);
                  $.SUBRULE2($.caseConstant);
                });
              }
            }
          ]);
        }
      },
      { ALT: () => $.CONSUME2(t.Default) }
    ]);
  });
  $.RULE("switchRule", () => {
    $.SUBRULE($.switchLabel);
    $.CONSUME(t.Arrow);
    $.OR([
      { ALT: () => $.SUBRULE($.throwStatement) },
      { ALT: () => $.SUBRULE($.block) },
      {
        ALT: () => {
          $.SUBRULE($.expression);
          $.CONSUME(t.Semicolon);
        }
      }
    ]);
  });
  $.RULE("caseConstant", () => {
    $.SUBRULE($.conditionalExpression);
  });
  $.RULE("casePattern", () => {
    $.SUBRULE($.pattern);
  });
  $.RULE("whileStatement", () => {
    $.CONSUME(t.While);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });
  $.RULE("doStatement", () => {
    $.CONSUME(t.Do);
    $.SUBRULE($.statement);
    $.CONSUME(t.While);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("forStatement", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.basicForStatement) },
      { ALT: () => $.SUBRULE($.enhancedForStatement) }
    ]);
  });
  $.RULE("basicForStatement", () => {
    $.CONSUME(t.For);
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.forInit);
    });
    $.CONSUME(t.Semicolon);
    $.OPTION2(() => {
      $.SUBRULE($.expression);
    });
    $.CONSUME2(t.Semicolon);
    $.OPTION3(() => {
      $.SUBRULE($.forUpdate);
    });
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });
  $.RULE("forInit", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.localVariableDeclaration) },
      { ALT: () => $.SUBRULE($.statementExpressionList) }
    ]);
  });
  $.RULE("forUpdate", () => {
    $.SUBRULE($.statementExpressionList);
  });
  $.RULE("statementExpressionList", () => {
    $.SUBRULE($.statementExpression);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.statementExpression);
    });
  });
  $.RULE("enhancedForStatement", () => {
    $.CONSUME(t.For);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.localVariableDeclaration);
    $.CONSUME(t.Colon);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });
  $.RULE("breakStatement", () => {
    $.CONSUME(t.Break);
    $.OPTION(() => {
      $.CONSUME(t.Identifier);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("continueStatement", () => {
    $.CONSUME(t.Continue);
    $.OPTION(() => {
      $.CONSUME(t.Identifier);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("returnStatement", () => {
    $.CONSUME(t.Return);
    $.OPTION(() => {
      $.SUBRULE($.expression);
    });
    $.CONSUME(t.Semicolon);
  });
  $.RULE("throwStatement", () => {
    $.CONSUME(t.Throw);
    $.SUBRULE($.expression);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("synchronizedStatement", () => {
    $.CONSUME(t.Synchronized);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.block);
  });
  $.RULE("tryStatement", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Try);
          $.SUBRULE($.block);
          $.OR2([
            {
              ALT: () => {
                $.SUBRULE($.catches);
                $.OPTION(() => {
                  $.SUBRULE($.finally);
                });
              }
            },
            { ALT: () => $.SUBRULE2($.finally) }
          ]);
        }
      },
      { ALT: () => $.SUBRULE($.tryWithResourcesStatement) }
    ]);
  });
  $.RULE("catches", () => {
    $.SUBRULE($.catchClause);
    $.MANY(() => {
      $.SUBRULE2($.catchClause);
    });
  });
  $.RULE("catchClause", () => {
    $.CONSUME(t.Catch);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.catchFormalParameter);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.block);
  });
  $.RULE("catchFormalParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.catchType);
    $.SUBRULE($.variableDeclaratorId);
  });
  $.RULE("catchType", () => {
    $.SUBRULE($.unannClassType);
    $.MANY(() => {
      $.CONSUME(t.Or);
      $.SUBRULE2($.classType);
    });
  });
  $.RULE("finally", () => {
    $.CONSUME(t.Finally);
    $.SUBRULE($.block);
  });
  $.RULE("tryWithResourcesStatement", () => {
    $.CONSUME(t.Try);
    $.SUBRULE($.resourceSpecification);
    $.SUBRULE($.block);
    $.OPTION(() => {
      $.SUBRULE($.catches);
    });
    $.OPTION2(() => {
      $.SUBRULE($.finally);
    });
  });
  $.RULE("resourceSpecification", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.resourceList);
    $.OPTION(() => {
      $.CONSUME(t.Semicolon);
    });
    $.CONSUME(t.RBrace);
  });
  $.RULE("resourceList", () => {
    $.SUBRULE($.resource);
    $.MANY({
      GATE: () => tokenMatcher($.LA(2).tokenType, t.RBrace) === false,
      DEF: () => {
        $.CONSUME(t.Semicolon);
        $.SUBRULE2($.resource);
      }
    });
  });
  $.RULE("resource", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.localVariableDeclaration) },
      { ALT: () => $.SUBRULE($.variableAccess) }
    ]);
  });
  $.RULE("yieldStatement", () => {
    $.CONSUME(t.Yield);
    $.SUBRULE($.expression);
    $.CONSUME(t.Semicolon);
  });
  $.RULE("variableAccess", () => {
    $.SUBRULE($.primary);
  });
}

// ../../node_modules/java-parser/src/productions/expressions.js
function defineRules9($, t) {
  $.RULE("expression", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.lambdaExpression) },
      { ALT: () => $.SUBRULE($.conditionalExpression) }
    ]);
  });
  $.RULE("lambdaExpression", () => {
    $.SUBRULE($.lambdaParameters);
    $.CONSUME(t.Arrow);
    $.SUBRULE($.lambdaBody);
  });
  $.RULE("lambdaParameters", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.lambdaParametersWithBraces) },
      { ALT: () => $.CONSUME(t.Identifier) },
      { ALT: () => $.CONSUME(t.Underscore) }
    ]);
  });
  $.RULE("lambdaParametersWithBraces", () => {
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.lambdaParameterList);
    });
    $.CONSUME(t.RBrace);
  });
  $.RULE("lambdaParameterList", () => {
    $.OR([
      {
        GATE: () => {
          const nextTokType = this.LA(1).tokenType;
          const nextNextTokType = this.LA(2).tokenType;
          return (tokenMatcher(nextTokType, t.Identifier) || tokenMatcher(nextTokType, t.Underscore)) && (tokenMatcher(nextNextTokType, t.RBrace) || tokenMatcher(nextNextTokType, t.Comma));
        },
        ALT: () => $.SUBRULE($.conciseLambdaParameterList)
      },
      { ALT: () => $.SUBRULE($.normalLambdaParameterList) }
    ]);
  });
  $.RULE("conciseLambdaParameterList", () => {
    $.SUBRULE($.conciseLambdaParameter);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.conciseLambdaParameter);
    });
  });
  $.RULE("normalLambdaParameterList", () => {
    $.SUBRULE($.normalLambdaParameter);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.normalLambdaParameter);
    });
  });
  $.RULE("normalLambdaParameter", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.regularLambdaParameter) },
      { ALT: () => $.SUBRULE($.variableArityParameter) }
    ]);
  });
  $.RULE("regularLambdaParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.lambdaParameterType);
    $.SUBRULE($.variableDeclaratorId);
  });
  $.RULE("lambdaParameterType", () => {
    $.OR({
      DEF: [
        { ALT: () => $.SUBRULE($.unannType) },
        { ALT: () => $.CONSUME(t.Var) }
      ],
      IGNORE_AMBIGUITIES: true
    });
  });
  $.RULE("conciseLambdaParameter", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      { ALT: () => $.CONSUME(t.Underscore) }
    ]);
  });
  $.RULE("lambdaBody", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.expression) },
      { ALT: () => $.SUBRULE($.block) }
    ]);
  });
  $.RULE("conditionalExpression", () => {
    $.SUBRULE($.binaryExpression);
    $.OPTION(() => {
      $.CONSUME(t.QuestionMark);
      $.SUBRULE($.expression);
      $.CONSUME(t.Colon);
      $.SUBRULE2($.expression);
    });
  });
  $.RULE("binaryExpression", () => {
    $.SUBRULE($.unaryExpression);
    $.MANY(() => {
      $.OR({
        DEF: [
          {
            ALT: () => {
              $.CONSUME(t.Instanceof);
              $.OR1([
                { ALT: () => $.SUBRULE($.pattern) },
                { ALT: () => $.SUBRULE($.referenceType) }
              ]);
            }
          },
          {
            ALT: () => {
              $.CONSUME(t.AssignmentOperator);
              $.SUBRULE2($.expression);
            }
          },
          // This is an example of why Java does not have a well designed grammar
          // See: https://manas.tech/blog/2008/10/12/why-java-generics-dont-have-problems-with-right-shift-operator.html
          // TODO: ensure the LT/GT sequences have no whitespace between each other.
          {
            // TODO: this is a bug in Chevrotain lookahead calculation. the "BinaryOperator" token can match "Less" or "Greater"
            //   as well, but because it is a **token Category** Chevrotain does not understand it need to looks two tokens ahead.
            GATE: () => tokenMatcher($.LA(2).tokenType, t.Less) || tokenMatcher($.LA(2).tokenType, t.Greater),
            ALT: () => {
              $.OR2([
                {
                  GATE: () => $.LA(1).startOffset + 1 === $.LA(2).startOffset,
                  ALT: () => {
                    $.CONSUME(t.Less);
                    $.CONSUME2(t.Less);
                  }
                },
                {
                  GATE: () => $.LA(1).startOffset + 1 === $.LA(2).startOffset,
                  ALT: () => {
                    $.CONSUME(t.Greater);
                    $.CONSUME2(t.Greater);
                    $.OPTION({
                      GATE: () => $.LA(0).startOffset + 1 === $.LA(1).startOffset,
                      DEF: () => $.CONSUME3(t.Greater)
                    });
                  }
                }
              ]);
              $.SUBRULE2($.unaryExpression);
            }
          },
          {
            ALT: () => {
              $.CONSUME(t.BinaryOperator);
              $.SUBRULE3($.unaryExpression);
            }
          }
        ],
        IGNORE_AMBIGUITIES: true
        // the ambiguity between 1 and 4 options is resolved by the order (instanceOf is first)
      });
    });
  });
  $.RULE("unaryExpression", () => {
    $.MANY(() => {
      $.CONSUME(t.UnaryPrefixOperator);
    });
    $.SUBRULE($.primary);
    $.MANY2(() => {
      $.CONSUME(t.UnarySuffixOperator);
    });
  });
  $.RULE("unaryExpressionNotPlusMinus", () => {
    $.MANY(() => {
      $.CONSUME(t.UnaryPrefixOperatorNotPlusMinus);
    });
    $.SUBRULE($.primary);
    $.MANY2(() => {
      $.CONSUME(t.UnarySuffixOperator);
    });
  });
  $.RULE("primary", () => {
    $.SUBRULE($.primaryPrefix);
    $.MANY(() => {
      $.SUBRULE($.primarySuffix);
    });
  });
  $.RULE("primaryPrefix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.literal) },
      { ALT: () => $.CONSUME(t.This) },
      { ALT: () => $.CONSUME(t.Void) },
      { ALT: () => $.SUBRULE($.unannPrimitiveTypeWithOptionalDimsSuffix) },
      { ALT: () => $.SUBRULE($.fqnOrRefType) },
      { ALT: () => $.SUBRULE($.castExpression) },
      { ALT: () => $.SUBRULE($.parenthesisExpression) },
      { ALT: () => $.SUBRULE($.newExpression) },
      { ALT: () => $.SUBRULE($.switchStatement) }
    ]);
  });
  $.RULE("primarySuffix", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Dot);
          $.OR2([
            { ALT: () => $.CONSUME(t.This) },
            {
              ALT: () => $.SUBRULE($.unqualifiedClassInstanceCreationExpression)
            },
            {
              ALT: () => {
                $.OPTION(() => {
                  $.SUBRULE($.typeArguments);
                });
                $.CONSUME(t.Identifier);
              }
            },
            { ALT: () => $.SUBRULE($.templateArgument) }
          ]);
        }
      },
      { ALT: () => $.SUBRULE($.methodInvocationSuffix) },
      { ALT: () => $.SUBRULE($.classLiteralSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });
  $.RULE("fqnOrRefType", () => {
    $.SUBRULE($.fqnOrRefTypePartFirst);
    $.MANY({
      // avoids ambiguity with primary suffixes
      GATE: () => {
        const nextNextToken = $.LA(2);
        return !(tokenMatcher(nextNextToken, t.Class) || tokenMatcher(nextNextToken, t.This) || tokenMatcher(nextNextToken, t.New) || tokenMatcher(nextNextToken, t.StringLiteral) || tokenMatcher(nextNextToken, t.TextBlock) || tokenMatcher(nextNextToken, t.StringTemplateBegin) || tokenMatcher(nextNextToken, t.TextBlockTemplateBegin));
      },
      DEF: () => {
        $.CONSUME(t.Dot);
        $.SUBRULE2($.fqnOrRefTypePartRest);
      }
    });
    $.OPTION({
      // it is not enough to check only the opening "[", we must avoid conflict with
      // arrayAccessSuffix
      GATE: () => tokenMatcher($.LA(1).tokenType, t.At) || tokenMatcher($.LA(2).tokenType, t.RSquare),
      DEF: () => {
        $.SUBRULE($.dims);
      }
    });
  });
  $.RULE("fqnOrRefTypePartRest", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.OPTION(() => $.SUBRULE2($.typeArguments));
    $.SUBRULE($.fqnOrRefTypePartCommon);
  });
  $.RULE("fqnOrRefTypePartCommon", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      { ALT: () => $.CONSUME(t.Super) }
    ]);
    let isRefTypeInMethodRef = false;
    if (tokenMatcher($.LA(1).tokenType, t.Less)) {
      isRefTypeInMethodRef = this.BACKTRACK_LOOKAHEAD($.isRefTypeInMethodRef);
    }
    $.OPTION2({
      // unrestricted typeArguments here would create an ambiguity with "LessThan" operator
      // e.g: "var x = a < b;"
      // The "<" would be parsed as the beginning of a "typeArguments"
      // and we will get an error: "expecting '>' but found: ';'"
      GATE: () => isRefTypeInMethodRef,
      DEF: () => {
        $.SUBRULE3($.typeArguments);
      }
    });
  });
  $.RULE("fqnOrRefTypePartFirst", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.SUBRULE($.fqnOrRefTypePartCommon);
  });
  $.RULE("parenthesisExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
  });
  $.RULE("castExpression", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.primitiveCastExpression) },
      { ALT: () => $.SUBRULE($.referenceTypeCastExpression) }
    ]);
  });
  $.RULE("primitiveCastExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.primitiveType);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.unaryExpression);
  });
  $.RULE("referenceTypeCastExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.referenceType);
    $.MANY(() => {
      $.SUBRULE($.additionalBound);
    });
    $.CONSUME(t.RBrace);
    $.OR([
      { ALT: () => $.SUBRULE($.lambdaExpression) },
      { ALT: () => $.SUBRULE($.unaryExpressionNotPlusMinus) }
    ]);
  });
  $.RULE("newExpression", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.arrayCreationExpression) },
      { ALT: () => $.SUBRULE($.unqualifiedClassInstanceCreationExpression) }
    ]);
  });
  $.RULE("unqualifiedClassInstanceCreationExpression", () => {
    $.CONSUME(t.New);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.SUBRULE($.classOrInterfaceTypeToInstantiate);
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
    $.OPTION3(() => {
      $.SUBRULE($.classBody);
    });
  });
  $.RULE("classOrInterfaceTypeToInstantiate", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.Identifier);
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.MANY3(() => {
        $.SUBRULE2($.annotation);
      });
      $.CONSUME2(t.Identifier);
    });
    $.OPTION(() => {
      $.SUBRULE($.typeArgumentsOrDiamond);
    });
  });
  $.RULE("typeArgumentsOrDiamond", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.diamond) },
      { ALT: () => $.SUBRULE($.typeArguments) }
    ]);
  });
  $.RULE("diamond", () => {
    $.CONSUME(t.Less);
    $.CONSUME(t.Greater);
  });
  $.RULE("methodInvocationSuffix", () => {
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
  });
  $.RULE("argumentList", () => {
    $.SUBRULE($.expression);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.expression);
    });
  });
  $.RULE("arrayCreationExpression", () => {
    $.CONSUME(t.New);
    $.OR([
      { ALT: () => $.SUBRULE($.primitiveType) },
      { ALT: () => $.SUBRULE($.classOrInterfaceType) }
    ]);
    $.OR2([
      {
        ALT: () => $.SUBRULE($.arrayCreationExpressionWithoutInitializerSuffix)
      },
      { ALT: () => $.SUBRULE($.arrayCreationWithInitializerSuffix) }
    ]);
  });
  $.RULE("arrayCreationExpressionWithoutInitializerSuffix", () => {
    $.SUBRULE($.dimExprs);
    $.OPTION(() => {
      $.SUBRULE($.dims);
    });
  });
  $.RULE("arrayCreationWithInitializerSuffix", () => {
    $.SUBRULE($.dims);
    $.SUBRULE($.arrayInitializer);
  });
  $.RULE("dimExprs", () => {
    $.SUBRULE($.dimExpr);
    $.MANY({
      // The GATE is to distinguish DimExpr from Dims :
      // the only difference between these two is the presence of an expression in the DimExpr
      // Example: If the GATE is not present double[3][] won't be parsed as the parser will try to parse "[]"
      // as a dimExpr instead of a dims
      GATE: () => tokenMatcher($.LA(2).tokenType, t.RSquare) === false,
      DEF: () => $.SUBRULE2($.dimExpr)
    });
  });
  $.RULE("dimExpr", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.LSquare);
    $.SUBRULE($.expression);
    $.CONSUME(t.RSquare);
  });
  $.RULE("classLiteralSuffix", () => {
    $.MANY(() => {
      $.CONSUME(t.LSquare);
      $.CONSUME(t.RSquare);
    });
    $.CONSUME(t.Dot);
    $.CONSUME(t.Class);
  });
  $.RULE("arrayAccessSuffix", () => {
    $.CONSUME(t.LSquare);
    $.SUBRULE($.expression);
    $.CONSUME(t.RSquare);
  });
  $.RULE("methodReferenceSuffix", () => {
    $.CONSUME(t.ColonColon);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      // TODO: a constructor method reference ("new") can only be used
      //   in specific contexts, but perhaps this verification is best left
      //   for a semantic analysis phase
      { ALT: () => $.CONSUME(t.New) }
    ]);
  });
  $.RULE("templateArgument", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.template) },
      { ALT: () => $.CONSUME(t.StringLiteral) },
      { ALT: () => $.CONSUME(t.TextBlock) }
    ]);
  });
  $.RULE("template", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.stringTemplate) },
      { ALT: () => $.SUBRULE($.textBlockTemplate) }
    ]);
  });
  $.RULE("stringTemplate", () => {
    $.CONSUME(t.StringTemplateBegin);
    $.SUBRULE($.embeddedExpression);
    $.MANY(() => {
      $.CONSUME(t.StringTemplateMid);
      $.SUBRULE1($.embeddedExpression);
    });
    $.CONSUME(t.StringTemplateEnd);
  });
  $.RULE("textBlockTemplate", () => {
    $.CONSUME(t.TextBlockTemplateBegin);
    $.SUBRULE($.embeddedExpression);
    $.MANY(() => {
      $.CONSUME(t.TextBlockTemplateMid);
      $.SUBRULE1($.embeddedExpression);
    });
    $.CONSUME(t.TextBlockTemplateEnd);
  });
  $.RULE("embeddedExpression", () => {
    $.OPTION(() => {
      $.SUBRULE($.expression);
    });
  });
  $.RULE("pattern", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.typePattern) },
      { ALT: () => $.SUBRULE($.recordPattern) }
    ]);
  });
  $.RULE("typePattern", () => {
    $.SUBRULE($.localVariableDeclaration, { ARGS: [true] });
  });
  $.RULE("recordPattern", () => {
    $.SUBRULE($.referenceType);
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.componentPatternList);
    });
    $.CONSUME(t.RBrace);
  });
  $.RULE("componentPatternList", () => {
    $.SUBRULE($.componentPattern);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.componentPattern);
    });
  });
  $.RULE("componentPattern", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.pattern) },
      { ALT: () => $.SUBRULE($.matchAllPattern) }
    ]);
  });
  $.RULE("matchAllPattern", () => {
    $.CONSUME(t.Underscore);
  });
  $.RULE("guard", () => {
    $.CONSUME(t.When);
    $.SUBRULE($.expression);
  });
  $.RULE("isRefTypeInMethodRef", () => {
    let result = void 0;
    $.SUBRULE($.typeArguments);
    const hasDims = $.OPTION(() => {
      $.SUBRULE($.dims);
    });
    const firstTokTypeAfterTypeArgs = this.LA(1).tokenType;
    if (tokenMatcher(firstTokTypeAfterTypeArgs, t.ColonColon)) {
      result = true;
    } else if (hasDims) {
      result = false;
    }
    $.OPTION2(() => {
      $.CONSUME(t.Dot);
      $.SUBRULE($.classOrInterfaceType);
    });
    if (result !== void 0) {
      return result;
    }
    const firstTokTypeAfterRefType = this.LA(1).tokenType;
    return tokenMatcher(firstTokTypeAfterRefType, t.ColonColon);
  });
}
function computeFirstForUnaryExpressionNotPlusMinus() {
  const firstUnaryExpressionNotPlusMinus = this.computeContentAssist(
    "unaryExpressionNotPlusMinus",
    []
  );
  const nextTokTypes = firstUnaryExpressionNotPlusMinus.map(
    (x) => x.nextTokenType
  );
  return nextTokTypes.filter((v, i, a) => a.indexOf(v) === i);
}

// ../../node_modules/java-parser/src/comments.js
var import_findLast = __toESM(require_findLast(), 1);
function findUpperBoundToken(tokens, comment) {
  let diff;
  let i;
  let current;
  let len = tokens.length;
  i = 0;
  while (len) {
    diff = len >>> 1;
    current = i + diff;
    if (tokens[current].startOffset > comment.startOffset) {
      len = diff;
    } else {
      i = current + 1;
      len -= diff + 1;
    }
  }
  return i;
}
function isPrettierIgnoreComment(comment) {
  return comment.image.match(
    /(\/\/(\s*)prettier-ignore(\s*))|(\/\*(\s*)prettier-ignore(\s*)\*\/)/gm
  );
}
function isFormatterOffOnComment(comment) {
  return comment.image.match(
    /(\/\/(\s*)@formatter:(off|on)(\s*))|(\/\*(\s*)@formatter:(off|on)(\s*)\*\/)/gm
  );
}
function completeMostEnclosiveCSTNodeByOffset(tokens, mostEnclosiveCstNodeByStartOffset, mostEnclosiveCstNodeByEndOffset) {
  tokens.forEach((token) => {
    if (mostEnclosiveCstNodeByStartOffset[token.startOffset] === void 0) {
      mostEnclosiveCstNodeByStartOffset[token.startOffset] = token;
    }
    if (mostEnclosiveCstNodeByEndOffset[token.endOffset] === void 0) {
      mostEnclosiveCstNodeByEndOffset[token.endOffset] = token;
    }
  });
}
function extendRangeOffset(comments, tokens) {
  let position;
  comments.forEach((comment) => {
    position = findUpperBoundToken(tokens, comment);
    const extendedStartOffset = position - 1 < 0 ? comment.startOffset : tokens[position - 1].endOffset;
    const extendedEndOffset = position == tokens.length ? comment.endOffset : tokens[position].startOffset;
    comment.extendedOffset = {
      startOffset: extendedStartOffset,
      endOffset: extendedEndOffset
    };
  });
}
function mapCommentsByExtendedRange(comments) {
  const commentsByExtendedEndOffset = {};
  const commentsByExtendedStartOffset = {};
  comments.forEach((comment) => {
    const extendedStartOffset = comment.extendedOffset.startOffset;
    const extendedEndOffset = comment.extendedOffset.endOffset;
    if (commentsByExtendedEndOffset[extendedEndOffset] === void 0) {
      commentsByExtendedEndOffset[extendedEndOffset] = [comment];
    } else {
      commentsByExtendedEndOffset[extendedEndOffset].push(comment);
    }
    if (commentsByExtendedStartOffset[extendedStartOffset] === void 0) {
      commentsByExtendedStartOffset[extendedStartOffset] = [comment];
    } else {
      commentsByExtendedStartOffset[extendedStartOffset].push(comment);
    }
  });
  return { commentsByExtendedEndOffset, commentsByExtendedStartOffset };
}
function shouldAttachTrailingComments(comment, node, mostEnclosiveCstNodeByStartOffset) {
  if (isPrettierIgnoreComment(comment)) {
    return false;
  }
  const nextNode = mostEnclosiveCstNodeByStartOffset[comment.extendedOffset.endOffset];
  if (nextNode === void 0) {
    return true;
  }
  const nodeEndLine = node.location !== void 0 ? node.location.endLine : node.endLine;
  if (comment.startLine !== nodeEndLine) {
    return false;
  }
  const nextNodeStartLine = nextNode.location !== void 0 ? nextNode.location.startLine : nextNode.startLine;
  return comment.endLine !== nextNodeStartLine;
}
function attachComments(tokens, comments, mostEnclosiveCstNodeByStartOffset, mostEnclosiveCstNodeByEndOffset) {
  if (tokens.length === 0) {
    mostEnclosiveCstNodeByStartOffset[NaN].leadingComments = comments;
    return;
  }
  completeMostEnclosiveCSTNodeByOffset(
    tokens,
    mostEnclosiveCstNodeByStartOffset,
    mostEnclosiveCstNodeByEndOffset
  );
  extendRangeOffset(comments, tokens);
  const { commentsByExtendedStartOffset, commentsByExtendedEndOffset } = mapCommentsByExtendedRange(comments);
  const commentsToAttach = new Set(comments);
  Object.keys(mostEnclosiveCstNodeByEndOffset).forEach((endOffset) => {
    if (commentsByExtendedStartOffset[endOffset] !== void 0) {
      const nodeTrailingComments = commentsByExtendedStartOffset[endOffset].filter((comment) => {
        return shouldAttachTrailingComments(
          comment,
          mostEnclosiveCstNodeByEndOffset[endOffset],
          mostEnclosiveCstNodeByStartOffset
        ) && commentsToAttach.has(comment);
      });
      if (nodeTrailingComments.length > 0) {
        mostEnclosiveCstNodeByEndOffset[endOffset].trailingComments = nodeTrailingComments;
      }
      nodeTrailingComments.forEach((comment) => {
        commentsToAttach.delete(comment);
      });
    }
  });
  Object.keys(mostEnclosiveCstNodeByStartOffset).forEach((startOffset) => {
    if (commentsByExtendedEndOffset[startOffset] !== void 0) {
      const nodeLeadingComments = commentsByExtendedEndOffset[startOffset].filter((comment) => commentsToAttach.has(comment));
      if (nodeLeadingComments.length > 0) {
        mostEnclosiveCstNodeByStartOffset[startOffset].leadingComments = nodeLeadingComments;
      }
      for (let i = 0; i < nodeLeadingComments.length; i++) {
        if (isPrettierIgnoreComment(nodeLeadingComments[i])) {
          const node = mostEnclosiveCstNodeByStartOffset[startOffset];
          const ignoreNode = node.name === "blockStatements" ? node.children.blockStatement[0] : node;
          ignoreNode.ignore = true;
          break;
        }
      }
    }
  });
}
function matchFormatterOffOnPairs(comments) {
  const onOffComments = comments.filter(
    (comment) => isFormatterOffOnComment(comment)
  );
  let isPreviousCommentOff = false;
  let isCurrentCommentOff = true;
  const pairs = [];
  let paired = {};
  onOffComments.forEach((comment) => {
    isCurrentCommentOff = comment.image.slice(-3) === "off";
    if (!isPreviousCommentOff) {
      if (isCurrentCommentOff) {
        paired.off = comment;
      }
    } else {
      if (!isCurrentCommentOff) {
        paired.on = comment;
        pairs.push(paired);
        paired = {};
      }
    }
    isPreviousCommentOff = isCurrentCommentOff;
  });
  if (onOffComments.length > 0 && isCurrentCommentOff) {
    paired.on = void 0;
    pairs.push(paired);
  }
  return pairs;
}
function shouldNotFormat(node, commentPairs) {
  const matchingPair = (0, import_findLast.default)(
    commentPairs,
    (comment) => comment.off.endOffset < node.location.startOffset
  );
  if (matchingPair !== void 0 && (matchingPair.on === void 0 || matchingPair.on.startOffset > node.location.endOffset)) {
    node.ignore = true;
  }
}

// ../../node_modules/java-parser/src/parser.js
var JavaParser = class extends CstParser {
  constructor() {
    super(allTokens, {
      lookaheadStrategy: new LLStarLookaheadStrategy({
        logging: getSkipValidations() ? () => {
        } : void 0
      }),
      nodeLocationTracking: "full",
      // traceInitPerf: 2,
      skipValidations: getSkipValidations()
    });
    const $ = this;
    this.mostEnclosiveCstNodeByStartOffset = {};
    this.mostEnclosiveCstNodeByEndOffset = {};
    $.RULE("typeIdentifier", () => {
      $.CONSUME(tokenDictionary.Identifier);
    });
    defineRules.call(this, $, tokenDictionary);
    defineRules2.call(this, $, tokenDictionary);
    defineRules3.call(this, $, tokenDictionary);
    defineRules5.call(this, $, tokenDictionary);
    defineRules4.call(this, $, tokenDictionary);
    defineRules6.call(this, $, tokenDictionary);
    defineRules7.call(this, $, tokenDictionary);
    defineRules8.call(this, $, tokenDictionary);
    defineRules9.call(this, $, tokenDictionary);
    this.firstForUnaryExpressionNotPlusMinus = [];
    this.performSelfAnalysis();
    this.firstForUnaryExpressionNotPlusMinus = computeFirstForUnaryExpressionNotPlusMinus.call(this);
  }
  cstPostNonTerminal(ruleCstResult, ruleName) {
    if (this.isBackTracking()) {
      return;
    }
    super.cstPostNonTerminal(ruleCstResult, ruleName);
    this.mostEnclosiveCstNodeByStartOffset[ruleCstResult.location.startOffset] = ruleCstResult;
    this.mostEnclosiveCstNodeByEndOffset[ruleCstResult.location.endOffset] = ruleCstResult;
    shouldNotFormat(ruleCstResult, this.onOffCommentPairs);
  }
  BACKTRACK_LOOKAHEAD(production, errValue = false) {
    return this.ACTION(() => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        const { ruleName, originalGrammarAction } = production;
        try {
          this.ruleInvocationStateUpdate(
            this.fullRuleNameToShort[ruleName],
            ruleName,
            this.subruleIdx
          );
          return originalGrammarAction.call(this);
        } catch (e) {
          return this.invokeRuleCatch(e, true, () => void 0);
        } finally {
          this.ruleFinallyStateUpdate();
        }
      } catch (e) {
        if (isRecognitionException(e)) {
          return errValue;
        }
        throw e;
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    });
  }
  setOnOffCommentPairs(onOffCommentPairs) {
    this.onOffCommentPairs = onOffCommentPairs;
  }
};

// ../../node_modules/java-parser/src/index.js
var parser = new JavaParser();
var BaseJavaCstVisitor = parser.getBaseCstVisitorConstructor();
var BaseJavaCstVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults();
function lexAndParse(inputText, entryPoint = "compilationUnit") {
  const lexResult = lexer_default.tokenize(inputText);
  if (lexResult.errors.length > 0) {
    const firstError = lexResult.errors[0];
    throw Error(
      "Sad sad panda, lexing errors detected in line: " + firstError.line + ", column: " + firstError.column + "!\n" + firstError.message
    );
  }
  const tokens = lexResult.tokens;
  parser.input = tokens;
  parser.mostEnclosiveCstNodeByStartOffset = {};
  parser.mostEnclosiveCstNodeByEndOffset = {};
  parser.setOnOffCommentPairs(
    matchFormatterOffOnPairs(lexResult.groups.comments)
  );
  const cst = parser[entryPoint]();
  if (parser.errors.length > 0) {
    const error = parser.errors[0];
    throw Error(
      "Sad sad panda, parsing errors detected in line: " + error.token.startLine + ", column: " + error.token.startColumn + "!\n" + error.message + "!\n	->" + error.context.ruleStack.join("\n	->")
    );
  }
  attachComments(
    tokens,
    lexResult.groups.comments,
    parser.mostEnclosiveCstNodeByStartOffset,
    parser.mostEnclosiveCstNodeByEndOffset
  );
  return { cst, tokens };
}
function parse(inputText, entryPoint = "compilationUnit") {
  return lexAndParse(inputText, entryPoint).cst;
}

// ../../src/java/typeIndex.ts
function parseJava(fsPath, content) {
  return { fsPath, source: content, cst: parse(content) };
}
function childNodes(node, key) {
  return childAll(node, key).filter(isCstNode);
}
function hasModifier(mods, name) {
  return mods.some((m) => Object.keys(m.children ?? {}).includes(name));
}
function javadocOf(...nodes) {
  for (const n of nodes) {
    const jd = parseJavadoc(nodeJavadoc(n));
    if (jd) {
      return jd;
    }
  }
  return void 0;
}
function annotationsOf(...nodes) {
  const out = [];
  for (const n of nodes) {
    out.push(...childNodes(n, "classModifier"));
  }
  return out;
}
function collectFields(classBody, source) {
  const fields = [];
  for (const bodyDecl of childNodes(classBody, "classBodyDeclaration")) {
    const member = childNode(bodyDecl, "classMemberDeclaration") ?? childNode(bodyDecl, "memberDeclaration");
    const fd = childNode(member, "fieldDeclaration");
    if (!fd) {
      continue;
    }
    const mods = childNodes(fd, "fieldModifier");
    if (hasModifier(mods, "static")) {
      continue;
    }
    const typeNode = childNode(fd, "unannType");
    const typeText = typeNode ? nodeText(source, typeNode).trim() : "Object";
    const javadocRaw = nodeJavadoc(bodyDecl);
    const javadoc = parseJavadoc(javadocRaw);
    const vdl = childNode(fd, "variableDeclaratorList");
    for (const vd of childNodes(vdl, "variableDeclarator")) {
      const name = tokenImage(childNode(vd, "variableDeclaratorId"), "Identifier");
      if (!name) {
        continue;
      }
      fields.push({ name, typeText, annotations: collectAnnotations(mods, source), javadoc, javadocRaw });
    }
  }
  return fields;
}
function typeParamsOf(decl) {
  const tp = childNode(decl, "typeParameters");
  if (!tp) {
    return [];
  }
  const list = childNode(tp, "typeParameterList") ?? tp;
  return childNodes(list, "typeParameter").map((n) => typeNameOf(n)).filter((s) => s.length > 0);
}
function enumConstantsOf(decl) {
  const list = childNode(childNode(decl, "enumBody"), "enumConstantList");
  return childNodes(list, "enumConstant").map((c) => tokenImage(c, "Identifier") ?? "").filter((s) => s.length > 0);
}
function recordComponentsOf(decl, source) {
  const list = childNode(childNode(decl, "recordHeader"), "recordComponentList");
  const listJavadoc = nodeJavadoc(list);
  return childNodes(list, "recordComponent").map((rc, index) => {
    const typeNode = childNode(rc, "unannType");
    const javadocRaw = nodeJavadoc(rc) ?? (index === 0 ? listJavadoc : void 0);
    return {
      name: tokenImage(rc, "Identifier") ?? "",
      typeText: typeNode ? nodeText(source, typeNode).trim() : "Object",
      annotations: collectAnnotations(childNodes(rc, "recordComponentModifier"), source),
      javadoc: parseJavadoc(javadocRaw),
      javadocRaw
    };
  });
}
function superClassOf(normal, source) {
  const sup = childNode(normal, "classExtends");
  if (!sup) {
    return void 0;
  }
  const typeNode = findFirstType(sup);
  if (!typeNode) {
    return void 0;
  }
  const text = nodeText(source, typeNode).trim();
  return text && parseTypeText(text).name !== "Object" ? text : void 0;
}
function findFirstType(node) {
  return childNode(node, "unannClassOrInterfaceType") ?? childNode(node, "unannType") ?? childNode(node, "classType") ?? findAll(node, "unannClassOrInterfaceType")[0] ?? findAll(node, "classType")[0];
}
function innerTypeDeclOf(decl) {
  return childNode(decl, "normalClassDeclaration") ?? childNode(decl, "enumDeclaration") ?? childNode(decl, "recordDeclaration") ?? childNode(decl, "normalInterfaceDeclaration");
}
function typeBodyOf(decl) {
  const inner = innerTypeDeclOf(decl);
  if (!inner) {
    return void 0;
  }
  return childNode(inner, "classBody") ?? childNode(inner, "interfaceBody") ?? childNode(inner, "enumBody") ?? childNode(inner, "recordBody");
}
function qualify(source, simpleName2, enclosing = []) {
  const m = /^\s*package\s+([\w.]+)\s*;/m.exec(source);
  return [m?.[1], ...enclosing, simpleName2].filter(Boolean).join(".");
}
function classInfoOf(decl, source, enclosing = [], ...javadocCarriers) {
  const normal = childNode(decl, "normalClassDeclaration");
  const enumDecl = childNode(decl, "enumDeclaration");
  const recordDecl = childNode(decl, "recordDeclaration");
  const normalItf = childNode(decl, "normalInterfaceDeclaration");
  const inner = normal ?? enumDecl ?? recordDecl ?? normalItf;
  if (!inner) {
    return void 0;
  }
  const simpleName2 = typeNameOf(inner);
  if (!simpleName2) {
    return void 0;
  }
  const base = {
    simpleName: simpleName2,
    qualifiedName: qualify(source, simpleName2, enclosing),
    ...enclosing.length ? { enclosing: [...enclosing] } : {},
    annotations: collectAnnotations(annotationsOf(decl, inner), source),
    javadoc: javadocOf(...javadocCarriers, decl, inner)
  };
  if (normal) {
    return {
      ...base,
      kind: "class",
      typeParams: typeParamsOf(normal),
      fields: collectFields(childNode(normal, "classBody"), source),
      recordComponents: [],
      enumConstants: [],
      superClass: superClassOf(normal, source)
    };
  }
  if (enumDecl) {
    return {
      ...base,
      kind: "enum",
      typeParams: [],
      fields: [],
      recordComponents: [],
      enumConstants: enumConstantsOf(enumDecl)
    };
  }
  if (recordDecl) {
    return {
      ...base,
      kind: "record",
      typeParams: typeParamsOf(recordDecl),
      fields: [],
      recordComponents: recordComponentsOf(recordDecl, source),
      enumConstants: []
    };
  }
  return {
    ...base,
    kind: "interface",
    typeParams: typeParamsOf(normalItf),
    fields: [],
    recordComponents: [],
    enumConstants: []
  };
}
function directMemberTypeDecls(body) {
  const out = [];
  const consider = (carrier) => {
    const member = childNode(carrier, "classMemberDeclaration") ?? childNode(carrier, "interfaceMemberDeclaration") ?? carrier;
    const decl = childNode(member, "classDeclaration") ?? childNode(member, "interfaceDeclaration");
    if (decl) {
      out.push({ decl, carrier });
    }
  };
  for (const bd of childNodes(body, "classBodyDeclaration")) {
    consider(bd);
  }
  for (const im of childNodes(body, "interfaceMemberDeclaration")) {
    consider(im);
  }
  const enumBodyDecls = childNode(body, "enumBodyDeclarations");
  if (enumBodyDecls) {
    for (const bd of childNodes(enumBodyDecls, "classBodyDeclaration")) {
      consider(bd);
    }
  }
  return out;
}
function indexTypeDecl(pf, decl, carrier, enclosing, out) {
  const info = classInfoOf(decl, pf.source, enclosing, carrier);
  if (!info) {
    return;
  }
  if (enclosing.length) {
    out.nested.set([...enclosing, info.simpleName].join("."), info);
    if (!out.types.has(info.simpleName)) {
      out.types.set(info.simpleName, info);
      out.names.push(info.simpleName);
    }
  } else {
    out.types.set(info.simpleName, info);
    out.names.push(info.simpleName);
  }
  const body = typeBodyOf(decl);
  for (const member of directMemberTypeDecls(body)) {
    indexTypeDecl(pf, member.decl, member.carrier, [...enclosing, info.simpleName], out);
  }
}
function buildIndex(files) {
  const types = /* @__PURE__ */ new Map();
  const nested = /* @__PURE__ */ new Map();
  const byFile = /* @__PURE__ */ new Map();
  for (const pf of files) {
    const names = [];
    const out = { types, nested, names };
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const decl = childNode(typeDecl, "classDeclaration") ?? childNode(typeDecl, "interfaceDeclaration");
      if (!decl) {
        continue;
      }
      indexTypeDecl(pf, decl, typeDecl, [], out);
    }
    byFile.set(pf.fsPath, names);
  }
  return { types, nested, byFile };
}
function resolveScopedType(index, name, scope) {
  const trimmed = name.trim();
  if (!trimmed) {
    return void 0;
  }
  for (const enc of scope ?? []) {
    const hit = index.nested.get(`${enc}.${trimmed}`);
    if (hit) {
      return hit;
    }
  }
  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
      const hit = index.nested.get(parts.slice(i).join("."));
      if (hit) {
        return hit;
      }
    }
  }
  return resolveIndexedType(index, simpleName(trimmed));
}
function typeScopeOf(info) {
  if (!info) {
    return void 0;
  }
  const path8 = [...info.enclosing ?? [], info.simpleName];
  return path8.map((_, i) => path8.slice(0, path8.length - i).join("."));
}
function resolveIndexedType(index, name) {
  const simple = simpleName(name);
  const cached = index.types.get(simple);
  if (cached) {
    return cached;
  }
  const fromJar = index.jarLookup?.(simple);
  if (fromJar) {
    index.types.set(simple, fromJar);
  }
  return fromJar;
}

// ../../src/java/schemaResolver.ts
function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const entries = Object.entries(value).filter(([, v]) => v !== void 0).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return "{" + entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",") + "}";
}
function refTo(name) {
  return { $ref: `#/components/schemas/${name}` };
}
function withRefSiblings(schema, additions) {
  if (!schema.$ref) {
    return { ...schema, ...additions };
  }
  const { $ref, ...rest } = schema;
  return { allOf: [{ $ref }], ...rest, ...additions };
}
var SchemaRegistry = class {
  schemas = {};
  /** 同名不同结构产生的命名冲突告警(由调用方并入 warnings 输出) */
  warnings = [];
  /** 类型身份 -> 最终 schema 名 */
  byIdentity = /* @__PURE__ */ new Map();
  /** 构建前预留唯一名称;循环引用一旦使用该名称,整个构建过程不再重命名。 */
  pending = /* @__PURE__ */ new Map();
  /** 基础组件名 -> 可空变体组件名(同一 DTO 的多个 Optional 复用) */
  nullableByName = /* @__PURE__ */ new Map();
  /** 基础组件尚在构建中时,可空变体先占名,待基础组件登记后填充 */
  nullablePending = /* @__PURE__ */ new Map();
  /**
   * 取已存在的 $ref;不存在则用 make() 生成并登记。
   * @param identity 类型身份(qualifiedName + 泛型实参),同一身份只构建一次
   * @param displayName 期望的 schema 名(简单名[+«泛型»]);冲突时实际登记名可能带 `_N` 后缀
   */
  getOrAdd(identity2, displayName, make) {
    const known = this.byIdentity.get(identity2);
    if (known) {
      return refTo(known);
    }
    const pending = this.pending.get(identity2);
    if (pending) {
      pending.referenced = true;
      return refTo(pending.name);
    }
    const { name: reserved, candidates } = this.reserveName(displayName);
    const entry = { name: reserved, referenced: false };
    this.pending.set(identity2, entry);
    try {
      const schema = make();
      const shape = entry.referenced ? void 0 : stableStringify(schema);
      const equivalent = shape !== void 0 ? candidates.find(([, existing]) => stableStringify(existing) === shape) : void 0;
      const name = equivalent?.[0] ?? reserved;
      if (!equivalent) {
        this.schemas[name] = schema;
      }
      if (!equivalent && name !== displayName) {
        this.warnings.push(`\u540C\u540D\u7C7B\u578B\u51B2\u7A81:${identity2} \u5DF2\u767B\u8BB0\u4E3A ${name},\u4EE5\u4FDD\u7559\u72EC\u7ACB\u6A21\u578B\u53CA\u5FAA\u73AF\u5F15\u7528`);
      }
      this.byIdentity.set(identity2, name);
      this.flushNullable(name);
      return refTo(name);
    } finally {
      this.pending.delete(identity2);
    }
  }
  /**
   * 取/建可空变体组件。基础组件尚未登记(递归构建中)时先预留名称,
   * 待基础组件完成后复制其 schema 并补 nullable/type,避免 allOf 继续强制非 null。
   */
  getOrAddNullableRef(baseName) {
    const known = this.nullableByName.get(baseName);
    if (known) {
      return refTo(known);
    }
    const { name } = this.reserveName(`${baseName}Nullable`);
    this.nullableByName.set(baseName, name);
    const target = this.schemas[baseName];
    if (target) {
      this.registerNullable(name, target);
    } else {
      this.nullablePending.set(baseName, name);
    }
    return refTo(name);
  }
  registerNullable(name, target) {
    const clone2 = JSON.parse(JSON.stringify(target));
    clone2.nullable = true;
    if (!clone2.type) {
      clone2.type = "object";
    }
    this.schemas[name] = clone2;
  }
  flushNullable(baseName) {
    const name = this.nullablePending.get(baseName);
    if (!name) {
      return;
    }
    this.nullablePending.delete(baseName);
    const target = this.schemas[baseName];
    if (target) {
      this.registerNullable(name, target);
    }
  }
  /** 已登记和正在构建的名称均不可占用,保证递归中的类型身份不会发生碰撞。 */
  reserveName(baseName) {
    const reserved = /* @__PURE__ */ new Set([
      ...[...this.pending.values()].map((entry) => entry.name),
      ...this.nullablePending.values()
    ]);
    const candidates = [];
    for (let n = 1; ; n++) {
      const candidate = n === 1 ? baseName : `${baseName}_${n}`;
      const existing = this.schemas[candidate];
      if (existing) {
        candidates.push([candidate, existing]);
      } else if (!reserved.has(candidate)) {
        return { name: candidate, candidates };
      }
    }
  }
};
function resolveTypeText(typeText, ctx) {
  return resolveType(parseTypeText(typeText), ctx);
}
function resolveType(t, ctx) {
  if (t.dims > 0) {
    return { type: "array", items: resolveType({ ...t, dims: t.dims - 1 }, ctx) };
  }
  const name = simpleName(t.name);
  const bound = !t.name.includes(".") ? ctx.bindings?.get(name) : void 0;
  if (bound) {
    const bindings2 = new Map(ctx.bindings);
    bindings2.delete(name);
    return resolveType(bound, { ...ctx, bindings: bindings2 });
  }
  const builtin = builtinSchema(name, t, ctx);
  if (builtin) {
    return builtin;
  }
  const page = pageSchema(name, t, ctx);
  if (page) {
    return page;
  }
  const info = resolveScopedType(ctx.index, t.name, ctx.scope);
  if (!info) {
    const warned = ctx.unresolvedWarned ??= /* @__PURE__ */ new Set();
    if (!warned.has(t.name)) {
      warned.add(t.name);
      ctx.fieldWarnings?.push(`\u672A\u8BC6\u522B\u7684\u7C7B\u578B ${t.name},\u6309 object \u8F93\u51FA(\u68C0\u67E5\u626B\u63CF\u8303\u56F4/\u4F9D\u8D56 jar \u7D22\u5F15)`);
    }
    return { type: "object", description: `\u672A\u8BC6\u522B\u7684\u7C7B\u578B: ${t.name}` };
  }
  if (info.kind === "enum") {
    return enumSchema(info);
  }
  const instance = { ...t, args: t.args.map((arg) => bindTypeArgument(arg, ctx)) };
  const bindings = /* @__PURE__ */ new Map();
  info.typeParams.forEach((param, i) => {
    if (instance.args[i]) {
      bindings.set(param, instance.args[i]);
    }
  });
  return ctx.registry.getOrAdd(
    schemaIdentity(info, instance),
    schemaName(info, instance),
    () => classSchema(info, { ...ctx, bindings })
  );
}
function bindTypeArgument(t, ctx, resolving = /* @__PURE__ */ new Set()) {
  const bound = !t.name.includes(".") ? ctx.bindings?.get(t.name) : void 0;
  if (bound && !resolving.has(t.name)) {
    const next = new Set(resolving).add(t.name);
    const resolved = bindTypeArgument(bound, ctx, next);
    return { ...resolved, dims: resolved.dims + t.dims, wildcard: t.wildcard ?? resolved.wildcard };
  }
  const name = simpleName(t.name);
  const builtin = PRIMITIVES[name] || COLLECTIONS.has(name) || MAPS.has(name) || ["ResponseEntity", "Mono", "Flux", "Optional", "Page", "PageImpl", "Slice", "IPage", "PageInfo"].includes(name);
  const info = builtin ? void 0 : resolveScopedType(ctx.index, t.name, ctx.scope);
  return { ...t, name: info?.qualifiedName ?? t.name, args: t.args.map((arg) => bindTypeArgument(arg, ctx, resolving)) };
}
function schemaIdentity(info, t) {
  return info.qualifiedName + genericKeyText(t);
}
function schemaName(info, t) {
  const displayType = (arg) => ({ ...arg, name: simpleName(arg.name), args: arg.args.map(displayType) });
  return info.simpleName + genericKeyText({ ...t, args: t.args.map(displayType) });
}
function genericKeyText(t) {
  return t.args.length ? "\xAB" + t.args.map(typeToKeyText).join(",") + "\xBB" : "";
}
function classDescription(annotations, javadoc) {
  const schema = findAnn(annotations, "Schema");
  const d1 = schema ? annStr(schema.args, "description", "value") : void 0;
  if (d1) {
    return d1;
  }
  const apiModel = findAnn(annotations, "ApiModel");
  const d2 = apiModel ? annStr(apiModel.args, "value", "description") : void 0;
  if (d2) {
    return d2;
  }
  const text = javadoc?.description || javadoc?.firstLine;
  return text && text.trim() ? text : void 0;
}
function enumSchema(info) {
  const schema = { type: "string", title: info.simpleName };
  if (info.enumConstants.length) {
    schema.enum = [...info.enumConstants];
  }
  const desc = classDescription(info.annotations, info.javadoc);
  if (desc) {
    schema.description = desc;
  }
  return schema;
}
function classSchema(info, ctx) {
  const fields = info.fields.length ? info.fields : info.recordComponents;
  const classCtx = { ...ctx, scope: typeScopeOf(info) };
  const properties = {};
  const required = [];
  if (info.superClass) {
    const supRef = parseTypeText(info.superClass);
    const supInfo = resolveScopedType(ctx.index, supRef.name, classCtx.scope);
    if (supInfo && supInfo.kind !== "enum") {
      const supBindings = /* @__PURE__ */ new Map();
      supInfo.typeParams.forEach((p, i) => {
        if (supRef.args[i]) {
          supBindings.set(p, bindTypeArgument(supRef.args[i], classCtx));
        }
      });
      const supSchema = classSchema(supInfo, { ...classCtx, bindings: supBindings });
      Object.assign(properties, supSchema.properties ?? {});
      required.push(...supSchema.required ?? []);
    }
  }
  for (const field of fields) {
    const rule = fieldRuleEngine(field, info, classCtx);
    if (rule.ignored) {
      continue;
    }
    if (findAnn(field.annotations, "JsonIgnore")) {
      continue;
    }
    if (isHidden(field.annotations)) {
      continue;
    }
    const jsonField = findAnn(field.annotations, "JSONField");
    if (jsonField) {
      const serialize = annBool(jsonField.args, "serialize");
      if (serialize === false) {
        continue;
      }
    }
    const jsonProp = findAnn(field.annotations, "JsonProperty");
    const gsonName = findAnn(field.annotations, "SerializedName");
    const fastName = findAnn(field.annotations, "JSONField");
    const propName = rule.fieldName ?? ((jsonProp ? annStr(jsonProp.args, "value", "name") : void 0) ?? (gsonName ? annStr(gsonName.args, "value", "name") : void 0) ?? (fastName ? annStr(fastName.args, "name") : void 0) ?? field.name);
    let schema2 = resolveTypeText(field.typeText, classCtx);
    if (rule.typeOverride) {
      const overridden = { type: rule.typeOverride.type };
      if (rule.typeOverride.format) {
        overridden.format = rule.typeOverride.format;
      }
      if (schema2.nullable) {
        overridden.nullable = true;
      }
      schema2 = overridden;
    }
    const desc = schemaDescription(field.annotations, field.javadoc?.description);
    const finalDesc = rule.appendDesc(desc, field, ctx);
    if (finalDesc) {
      schema2 = withRefSiblings(schema2, { description: finalDesc });
    }
    const example = schemaExample(field.annotations);
    if (example) {
      schema2 = withRefSiblings(schema2, { example });
    }
    schema2 = applyConstraints(field.annotations, schema2);
    properties[propName] = schema2;
    const schemaAnn = findAnn(field.annotations, "Schema");
    const apiProp = findAnn(field.annotations, "ApiModelProperty");
    const requiredMode = schemaAnn ? annStr(schemaAnn.args, "requiredMode")?.split(".").pop() : void 0;
    let isRequired = annBool(jsonProp?.args ?? {}, "required") === true || !!findAnn(field.annotations, "NotNull", "NotBlank", "NotEmpty") || (apiProp ? annBool(apiProp.args, "required") === true : false) || (schemaAnn ? annBool(schemaAnn.args, "required") === true : false) || requiredMode === "REQUIRED";
    if (rule.required !== void 0) {
      isRequired = rule.required;
    }
    if (isRequired && !required.includes(propName)) {
      required.push(propName);
    }
  }
  const schema = {
    type: "object",
    title: info.simpleName,
    description: classDescription(info.annotations, info.javadoc),
    properties
  };
  if (required.length) {
    schema.required = required;
  }
  return schema;
}
var PRIMITIVES = {
  int: { type: "integer", format: "int32" },
  Integer: { type: "integer", format: "int32" },
  short: { type: "integer", format: "int32" },
  Short: { type: "integer", format: "int32" },
  byte: { type: "integer", format: "int32" },
  Byte: { type: "integer", format: "int32" },
  long: { type: "integer", format: "int64" },
  Long: { type: "integer", format: "int64" },
  BigInteger: { type: "integer", format: "int64" },
  float: { type: "number", format: "float" },
  Float: { type: "number", format: "float" },
  double: { type: "number", format: "double" },
  Double: { type: "number", format: "double" },
  BigDecimal: { type: "number", format: "double" },
  Number: { type: "number" },
  boolean: { type: "boolean" },
  Boolean: { type: "boolean" },
  char: { type: "string" },
  Character: { type: "string" },
  String: { type: "string" },
  CharSequence: { type: "string" },
  Object: { type: "object" },
  // java.lang.Void / void 不可实例化,恒为 null(常见于 ResponseDto<Void>)
  Void: { type: "object" },
  void: { type: "object" },
  Date: { type: "string", format: "date-time" },
  Timestamp: { type: "string", format: "date-time" },
  LocalDateTime: { type: "string", format: "date-time" },
  Instant: { type: "string", format: "date-time" },
  ZonedDateTime: { type: "string", format: "date-time" },
  OffsetDateTime: { type: "string", format: "date-time" },
  LocalDate: { type: "string", format: "date" },
  LocalTime: { type: "string" },
  Duration: { type: "string" },
  MultipartFile: { type: "string", format: "binary" },
  UUID: { type: "string", format: "uuid" }
};
var COLLECTIONS = /* @__PURE__ */ new Set([
  "List",
  "ArrayList",
  "LinkedList",
  "Collection",
  "Set",
  "HashSet",
  "LinkedHashSet",
  "TreeSet",
  "Iterable",
  "Queue",
  "Deque",
  "Stack"
]);
var MAPS = /* @__PURE__ */ new Set(["Map", "HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap", "SortedMap"]);
function pageSchema(name, t, ctx) {
  const itemType = () => t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" };
  const int64 = { type: "integer", format: "int64" };
  const int32 = { type: "integer", format: "int32" };
  const bool = { type: "boolean" };
  if (name === "PageInfo") {
    return {
      type: "object",
      title: `PageInfo\xAB${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}\xBB`,
      description: "\u5206\u9875\u6570\u636E(PageHelper)",
      properties: {
        total: { ...int64, description: "\u603B\u8BB0\u5F55\u6570" },
        list: { type: "array", items: itemType(), description: "\u5F53\u524D\u9875\u6570\u636E" },
        pageNum: { ...int32, description: "\u5F53\u524D\u9875\u7801" },
        pageSize: { ...int32, description: "\u6BCF\u9875\u6761\u6570" },
        pages: { ...int32, description: "\u603B\u9875\u6570" },
        prePage: { ...int32, description: "\u4E0A\u4E00\u9875\u9875\u7801" },
        nextPage: { ...int32, description: "\u4E0B\u4E00\u9875\u9875\u7801" },
        isFirstPage: { ...bool, description: "\u662F\u5426\u9996\u9875" },
        isLastPage: { ...bool, description: "\u662F\u5426\u672B\u9875" },
        hasPreviousPage: { ...bool, description: "\u662F\u5426\u6709\u4E0A\u4E00\u9875" },
        hasNextPage: { ...bool, description: "\u662F\u5426\u6709\u4E0B\u4E00\u9875" }
      }
    };
  }
  if (name === "IPage") {
    return {
      type: "object",
      title: `IPage\xAB${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}\xBB`,
      description: "\u5206\u9875\u6570\u636E(MyBatis-Plus)",
      properties: {
        records: { type: "array", items: itemType(), description: "\u5F53\u524D\u9875\u6570\u636E" },
        total: { ...int64, description: "\u603B\u8BB0\u5F55\u6570" },
        size: { ...int64, description: "\u6BCF\u9875\u6761\u6570" },
        current: { ...int64, description: "\u5F53\u524D\u9875\u7801" },
        pages: { ...int64, description: "\u603B\u9875\u6570" }
      }
    };
  }
  if (name === "Page" || name === "PageImpl" || name === "Slice") {
    const style = name === "Slice" ? "spring-data" : ctx.options?.pageStyle === "spring-data" ? "spring-data" : "mybatis-plus";
    if (style === "spring-data") {
      return {
        type: "object",
        title: `Page\xAB${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}\xBB`,
        description: "\u5206\u9875\u6570\u636E(Spring Data)",
        properties: {
          content: { type: "array", items: itemType(), description: "\u5F53\u524D\u9875\u6570\u636E" },
          totalElements: { ...int64, description: "\u603B\u8BB0\u5F55\u6570" },
          totalPages: { ...int32, description: "\u603B\u9875\u6570" },
          number: { ...int32, description: "\u5F53\u524D\u9875\u7801(0 \u57FA)" },
          size: { ...int32, description: "\u6BCF\u9875\u6761\u6570" },
          numberOfElements: { ...int32, description: "\u5F53\u524D\u9875\u5B9E\u9645\u6761\u6570" },
          first: { ...bool, description: "\u662F\u5426\u9996\u9875" },
          last: { ...bool, description: "\u662F\u5426\u672B\u9875" },
          empty: { ...bool, description: "\u662F\u5426\u4E3A\u7A7A" }
        }
      };
    }
    return {
      type: "object",
      title: `Page\xAB${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}\xBB`,
      description: "\u5206\u9875\u6570\u636E(MyBatis-Plus)",
      properties: {
        records: { type: "array", items: itemType(), description: "\u5F53\u524D\u9875\u6570\u636E" },
        total: { ...int64, description: "\u603B\u8BB0\u5F55\u6570" },
        size: { ...int64, description: "\u6BCF\u9875\u6761\u6570" },
        current: { ...int64, description: "\u5F53\u524D\u9875\u7801" },
        pages: { ...int64, description: "\u603B\u9875\u6570" }
      }
    };
  }
  return void 0;
}
function nullableRefSchema(schema, ctx) {
  const prefix = "#/components/schemas/";
  const ref = schema.$ref;
  if (!ref?.startsWith(prefix)) {
    return void 0;
  }
  return ctx.registry.getOrAddNullableRef(ref.slice(prefix.length));
}
function builtinSchema(name, t, ctx) {
  const prim = PRIMITIVES[name];
  if (prim) {
    return { ...prim };
  }
  if (COLLECTIONS.has(name)) {
    return { type: "array", items: t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" } };
  }
  if (MAPS.has(name)) {
    return { type: "object", additionalProperties: t.args[1] ? resolveType(t.args[1], ctx) : { type: "object" } };
  }
  if (name === "ResponseEntity" || name === "Mono") {
    return t.args[0] ? resolveType(t.args[0], ctx) : void 0;
  }
  if (name === "Flux") {
    return { type: "array", items: t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" } };
  }
  if (name === "Optional") {
    const inner = t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" };
    const nullableRef = nullableRefSchema(inner, ctx);
    if (nullableRef) {
      return nullableRef;
    }
    return withRefSiblings(inner, { nullable: true });
  }
  return void 0;
}
function schemaDescription(annotations, fallback) {
  const schema = findAnn(annotations, "Schema");
  const d1 = schema ? annStr(schema.args, "description", "value") : void 0;
  if (d1) {
    return d1;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  const d2 = modelProp ? annStr(modelProp.args, "value") : void 0;
  if (d2) {
    return d2;
  }
  return fallback && fallback.trim() ? fallback : void 0;
}
function isHidden(annotations) {
  const schema = findAnn(annotations, "Schema");
  if (schema && annBool(schema.args, "hidden") === true) {
    return true;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  return !!modelProp && annBool(modelProp.args, "hidden") === true;
}
var CONSTRAINT_ANNOTATIONS = /* @__PURE__ */ new Set([
  "Size",
  "Min",
  "Max",
  "DecimalMin",
  "DecimalMax",
  "Positive",
  "PositiveOrZero",
  "Negative",
  "NegativeOrZero",
  "Pattern",
  "Email",
  "NotBlank",
  "NotEmpty"
]);
function applyConstraints(annotations, schema) {
  if (!annotations.some((ann) => CONSTRAINT_ANNOTATIONS.has(ann.name))) {
    return schema;
  }
  if (schema.$ref) {
    const ref = schema.$ref;
    delete schema.$ref;
    schema.allOf = [{ $ref: ref }];
  }
  const isString2 = schema.type === "string";
  const isArray2 = schema.type === "array";
  const size = findAnn(annotations, "Size");
  if (size) {
    const min2 = annNum(size.args, "min");
    const max = annNum(size.args, "max");
    if (isArray2) {
      if (min2 !== void 0) {
        schema.minItems = min2;
      }
      if (max !== void 0) {
        schema.maxItems = max;
      }
    } else if (isString2) {
      if (min2 !== void 0) {
        schema.minLength = min2;
      }
      if (max !== void 0) {
        schema.maxLength = max;
      }
    }
  }
  const range = (ann, key) => {
    if (!ann) {
      return;
    }
    const v = annStr(ann.args, "value");
    const num = v !== void 0 ? javaNumberLiteral(v) : void 0;
    if (num === void 0) {
      return;
    }
    schema[key] = num;
    const inclusive = annBool(ann.args, "inclusive");
    if (inclusive === false) {
      if (key === "minimum") {
        schema.exclusiveMinimum = true;
      } else {
        schema.exclusiveMaximum = true;
      }
    }
  };
  range(findAnn(annotations, "Min"), "minimum");
  range(findAnn(annotations, "Max"), "maximum");
  range(findAnn(annotations, "DecimalMin"), "minimum");
  range(findAnn(annotations, "DecimalMax"), "maximum");
  const positive = findAnn(annotations, "Positive", "PositiveOrZero");
  if (positive) {
    schema.minimum = 0;
    if (positive.name === "Positive") {
      schema.exclusiveMinimum = true;
    }
  }
  const negative = findAnn(annotations, "Negative", "NegativeOrZero");
  if (negative) {
    schema.maximum = 0;
    if (negative.name === "Negative") {
      schema.exclusiveMaximum = true;
    }
  }
  const pattern = findAnn(annotations, "Pattern");
  const regexp = pattern ? annStr(pattern.args, "regexp", "value") : void 0;
  if (regexp) {
    schema.pattern = regexp;
  }
  if (isString2 && findAnn(annotations, "Email")) {
    schema.format = "email";
  }
  if (findAnn(annotations, "NotBlank", "NotEmpty")) {
    if (isArray2) {
      schema.minItems = schema.minItems ?? 1;
    } else if (isString2) {
      schema.minLength = schema.minLength ?? 1;
    }
  }
  return schema;
}
function javaNumberLiteral(raw) {
  const s = raw.trim();
  const m = /^([+-]?(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?))[lLdDfF]?$/.exec(s);
  if (!m) {
    return void 0;
  }
  const n = Number(m[1]);
  return Number.isNaN(n) ? void 0 : n;
}
function annNum(args, key) {
  const v = args[key];
  if (typeof v === "number") {
    return v;
  }
  if (typeof v === "string" && v.trim() !== "") {
    return javaNumberLiteral(v);
  }
  return void 0;
}
function schemaExample(annotations) {
  const schema = findAnn(annotations, "Schema");
  const e1 = schema ? annStr(schema.args, "example") : void 0;
  if (e1) {
    return e1;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  return modelProp ? annStr(modelProp.args, "example") : void 0;
}
function enumTypeNameOf(field, ctx) {
  let t = parseTypeText(field.typeText);
  for (let depth = 0; depth < 8; depth++) {
    if (t.dims > 0) {
      t = { ...t, dims: t.dims - 1 };
      continue;
    }
    const name = simpleName(t.name);
    if (COLLECTIONS.has(name) && t.args[0]) {
      t = t.args[0];
      continue;
    }
    const info = resolveScopedType(ctx.index, name, ctx.scope);
    return info && info.kind === "enum" ? name : void 0;
  }
  return void 0;
}
var FIELD_TYPE_OVERRIDABLE = /* @__PURE__ */ new Set(["string", "integer", "number", "boolean", "object", "array"]);
function parseFieldTypeOverride(raw) {
  const m = /^([a-zA-Z]+)(?::([a-zA-Z0-9._-]+))?$/.exec(raw.trim());
  if (!m) {
    return void 0;
  }
  const type = m[1].toLowerCase();
  if (!FIELD_TYPE_OVERRIDABLE.has(type)) {
    return void 0;
  }
  return { type, format: m[2] };
}
function fieldRuleContext(field, classInfo, ctx) {
  const enumName = enumTypeNameOf(field, ctx);
  return {
    annotations: field.annotations,
    javadocRaw: rawJavadocOf(field),
    subject: `${classInfo.simpleName}.${field.name}`,
    fieldName: field.name,
    isEnum: enumName !== void 0,
    enumSimpleName: enumName,
    fieldType: field.typeText.replace(/\s+/g, ""),
    fieldTypeSimple: simpleName(parseTypeText(field.typeText).name)
  };
}
function rawJavadocOf(field) {
  return field.javadocRaw;
}
function fieldRuleEngine(field, classInfo, ctx) {
  const result = {
    ignored: false,
    appendDesc: (_d, _f, _c) => _d
  };
  const enumName = ctx.options?.enumFieldDoc === true ? enumTypeNameOf(field, ctx) : void 0;
  if (enumName) {
    result.appendDesc = (_currentDesc, _f, _c) => _currentDesc ? `${_currentDesc}
(\u679A\u4E3E\u7C7B:${enumName})` : `(\u679A\u4E3E\u7C7B:${enumName})`;
  }
  const rules = ctx.fieldRules;
  if (!rules) {
    return result;
  }
  const entries = rules.entries;
  const rctx = fieldRuleContext(field, classInfo, ctx);
  const warn = (msg) => {
    ctx.fieldWarnings?.push(msg);
  };
  for (const e of entries) {
    if (e.key !== "field.ignore" && e.key !== "json.rule.field.ignore") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const syn = detectValueSyntax(e.value);
    let ignoreNow = false;
    if (syn.type === "literal") {
      ignoreNow = syn.body === field.name;
    } else {
      const v = evalRuleValue(e.value, rctx, e.key, warn);
      if (v.skipped && v.reason) {
        warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
        continue;
      }
      ignoreNow = v.matched && v.value !== void 0 && v.value !== "" && v.value !== "false";
    }
    if (ignoreNow) {
      result.ignored = true;
    }
  }
  if (result.ignored) {
    return result;
  }
  for (const e of entries) {
    if (e.key !== "field.name") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported || !cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.matched && v.value !== void 0 && v.value.trim()) {
      result.fieldName = v.value;
    }
  }
  for (const e of entries) {
    if (e.key !== "field.required") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported || !cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.matched) {
      result.required = v.value === "true" || v.value === "TRUE";
    }
  }
  for (const e of entries) {
    if (e.key !== "field.type" && e.key !== "json.rule.field.type") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.skipped && v.reason) {
      warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!v.matched || v.value === void 0 || !v.value.trim()) {
      continue;
    }
    const override = parseFieldTypeOverride(v.value);
    if (!override) {
      warn(`field.type \u7684\u503C\u4E0D\u662F\u5408\u6CD5\u7684\u7C7B\u578B\u58F0\u660E(type \u6216 type:format):${truncate2(v.value, 40)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    result.typeOverride = override;
  }
  const docRules = [];
  for (const e of entries) {
    if (e.key !== "field.doc" && e.key !== "field.description" && e.key !== "json.rule.field.description") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.skipped && v.reason) {
      warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (v.matched && v.value !== void 0 && v.value.trim()) {
      docRules.push({ text: v.value });
    }
  }
  if (docRules.length) {
    const prevAppend = result.appendDesc;
    result.appendDesc = (currentDesc, field2, ctx2) => {
      let d = prevAppend(currentDesc, field2, ctx2);
      for (const r of docRules) {
        if (!d) {
          d = r.text;
        } else if (!d.includes(r.text)) {
          d = d + "\n" + r.text;
        }
      }
      return d;
    };
  }
  return result;
}
function paramRuleEngine(p, subject, ctx) {
  const result = { ignored: false, appendDoc: [] };
  const rules = ctx.fieldRules;
  if (!rules) {
    return result;
  }
  const entries = rules.entries;
  const t = parseTypeText(p.typeText);
  const info = resolveScopedType(ctx.index, t.name, ctx.scope);
  const rctx = {
    annotations: p.annotations ?? [],
    javadocRaw: p.description,
    subject: `${subject} \u7684\u53C2\u6570 ${p.name}`,
    fieldName: p.name,
    isEnum: info?.kind === "enum",
    enumSimpleName: info?.kind === "enum" ? info.simpleName : void 0,
    fieldType: p.typeText.replace(/\s+/g, ""),
    fieldTypeSimple: simpleName(t.name)
  };
  const warn = (msg) => {
    ctx.fieldWarnings?.push(`${subject}: \u53C2\u6570 ${p.name}: ${msg}`);
  };
  for (const e of entries) {
    if (e.key !== "param.ignore") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`param.ignore \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const syn = detectValueSyntax(e.value);
    let ignoreNow = false;
    if (syn.type === "literal") {
      ignoreNow = syn.body === p.name;
    } else {
      const v = evalRuleValue(e.value, rctx, e.key, warn);
      if (v.skipped && v.reason) {
        warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
        continue;
      }
      ignoreNow = v.matched && v.value !== void 0 && v.value !== "" && v.value !== "false";
    }
    if (ignoreNow) {
      result.ignored = true;
    }
  }
  if (result.ignored) {
    return result;
  }
  for (const e of entries) {
    if (e.key !== "param.required") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported || !cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.matched) {
      result.required = v.value === "true" || v.value === "TRUE";
    }
  }
  for (const e of entries) {
    if (e.key !== "param.type" && e.key !== "json.rule.param.type") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`param.type \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.skipped && v.reason) {
      warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!v.matched || v.value === void 0 || !v.value.trim()) {
      continue;
    }
    const override = parseFieldTypeOverride(v.value);
    if (!override) {
      warn(`param.type \u7684\u503C\u4E0D\u662F\u5408\u6CD5\u7684\u7C7B\u578B\u58F0\u660E(type \u6216 type:format):${truncate2(v.value, 40)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    result.typeOverride = override;
  }
  for (const e of entries) {
    if (e.key !== "param.doc" && e.key !== "param.description") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`param.doc \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate2(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.skipped && v.reason) {
      warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
      continue;
    }
    if (v.matched && v.value !== void 0 && v.value.trim()) {
      result.appendDoc.push(v.value);
    }
  }
  return result;
}
function truncate2(s, n) {
  return s.length > n ? s.slice(0, n) + "\u2026" : s;
}

// ../../src/java/controllerParser.ts
var SPRING_MAPPINGS = {
  GetMapping: ["GET"],
  PostMapping: ["POST"],
  PutMapping: ["PUT"],
  DeleteMapping: ["DELETE"],
  PatchMapping: ["PATCH"]
};
var REQUEST_MAPPING_DEFAULT_VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
var SPRING_MAPPING_NAMES = [...Object.keys(SPRING_MAPPINGS), "RequestMapping"];
var JAXRS_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS"
};
var HTTP_STATUS_BY_NAME = {
  OK: "200",
  CREATED: "201",
  ACCEPTED: "202",
  NO_CONTENT: "204",
  MOVED_PERMANENTLY: "301",
  FOUND: "302",
  NOT_MODIFIED: "304",
  BAD_REQUEST: "400",
  UNAUTHORIZED: "401",
  PAYMENT_REQUIRED: "402",
  FORBIDDEN: "403",
  NOT_FOUND: "404",
  METHOD_NOT_ALLOWED: "405",
  NOT_ACCEPTABLE: "406",
  CONFLICT: "409",
  GONE: "410",
  UNSUPPORTED_MEDIA_TYPE: "415",
  TOO_MANY_REQUESTS: "429",
  INTERNAL_SERVER_ERROR: "500",
  NOT_IMPLEMENTED: "501",
  BAD_GATEWAY: "502",
  SERVICE_UNAVAILABLE: "503"
};
var MEDIA_TYPE_BASE = {
  ALL: "*/*",
  APPLICATION_ATOM_XML: "application/atom+xml",
  APPLICATION_CBOR: "application/cbor",
  APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  APPLICATION_GRAPHQL: "application/graphql",
  APPLICATION_GRAPHQL_RESPONSE: "application/graphql-response+json",
  APPLICATION_JSON: "application/json",
  APPLICATION_JSON_UTF8: "application/json;charset=UTF-8",
  APPLICATION_NDJSON: "application/x-ndjson",
  APPLICATION_OCTET_STREAM: "application/octet-stream",
  APPLICATION_PDF: "application/pdf",
  APPLICATION_PROBLEM_JSON: "application/problem+json",
  APPLICATION_PROBLEM_JSON_UTF8: "application/problem+json;charset=UTF-8",
  APPLICATION_PROBLEM_XML: "application/problem+xml",
  APPLICATION_PROTOBUF: "application/x-protobuf",
  APPLICATION_RSS_XML: "application/rss+xml",
  APPLICATION_STREAM_JSON: "application/stream+json",
  APPLICATION_XHTML_XML: "application/xhtml+xml",
  APPLICATION_XML: "application/xml",
  APPLICATION_YAML: "application/yaml",
  IMAGE_GIF: "image/gif",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_PNG: "image/png",
  MULTIPART_FORM_DATA: "multipart/form-data",
  MULTIPART_MIXED: "multipart/mixed",
  MULTIPART_RELATED: "multipart/related",
  TEXT_EVENT_STREAM: "text/event-stream",
  TEXT_HTML: "text/html",
  TEXT_MARKDOWN: "text/markdown",
  TEXT_PLAIN: "text/plain",
  TEXT_XML: "text/xml",
  WILDCARD: "*/*"
};
var MEDIA_TYPE_CONSTANTS = { ...MEDIA_TYPE_BASE };
for (const [name, mime] of Object.entries(MEDIA_TYPE_BASE)) {
  MEDIA_TYPE_CONSTANTS[`${name}_VALUE`] = mime;
}
function toMimeType(raw) {
  const last2 = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return MEDIA_TYPE_CONSTANTS[last2.trim()] ?? raw.trim().replace(/^"|"$/g, "");
}
function uniqueMediaTypes(values2) {
  const out = [];
  for (const value of values2) {
    const mime = value.trim();
    if (mime && !out.includes(mime)) {
      out.push(mime);
    }
  }
  return out;
}
function parseControllers(files, rules, index) {
  const endpoints = [];
  const ruleWarnings = [];
  const warnings = [];
  const sites = index ? buildTypeSites(files) : void 0;
  for (const pf of files) {
    const fileSites = sites ? sites.byFile.get(pf) ?? [] : findAll(pf.cst, "typeDeclaration").map((d) => typeSiteOf(pf, d)).filter((s) => !!s);
    for (const site of fileSites) {
      const { typeName, typeAnnotations } = site;
      const chain = sites ? superTypeChain(site, sites.byName) : [];
      const hierarchy = [site, ...chain];
      const flavor = detectFlavor(site, chain);
      if (!flavor) {
        continue;
      }
      const basePaths = classBasePaths(hierarchy, flavor);
      const baseMethods = classBaseMethods(hierarchy, flavor);
      const tagAnn = findAnn(typeAnnotations, "Tag");
      const apiAnn = findAnn(typeAnnotations, "Api");
      let tag = tagAnn && annStr(tagAnn.args, "name", "value") || apiAnn && annArray(apiAnn.args, "tags", "value")[0] || typeName;
      const classJavadoc = parseJavadoc(nodeJavadoc(site.carrier));
      let typeIgnored = false;
      if (rules) {
        const classCtx = {
          annotations: typeAnnotations,
          javadocRaw: nodeJavadoc(site.carrier),
          subject: `\u7C7B ${typeName}`
        };
        for (const e of rules.entries) {
          if (e.key !== "ignore") {
            continue;
          }
          const cond = evalCondition(e.cond, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (!cond.supported) {
            ruleWarnings.push(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
            continue;
          }
          if (!cond.hit) {
            continue;
          }
          const v = evalRuleValue(e.value, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (v.skipped && v.reason) {
            ruleWarnings.push(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
            continue;
          }
          if (v.matched && v.value !== void 0 && v.value !== "") {
            typeIgnored = true;
            break;
          }
        }
        for (const e of rules.entries) {
          if (e.key !== "folder.name" || typeIgnored) {
            continue;
          }
          const cond = evalCondition(e.cond, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (!cond.supported) {
            ruleWarnings.push(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
            continue;
          }
          if (!cond.hit) {
            continue;
          }
          const v = evalRuleValue(e.value, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (v.skipped && v.reason) {
            ruleWarnings.push(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
            continue;
          }
          if (v.matched && v.value !== void 0 && v.value.trim()) {
            tag = v.value;
          }
        }
      }
      const classMedia = classMediaTypesOf(hierarchy);
      const methodHits = collectMethodHits(site, chain);
      const settledSignatures = /* @__PURE__ */ new Set();
      for (const hit of methodHits) {
        const { method, wrapper, modifierKey } = hit;
        const source = hit.site.pf.source;
        const signature = methodSignature(hit.site, method);
        if (settledSignatures.has(signature)) {
          continue;
        }
        const methodAnnotations = collectAnnotations(childAll(method, modifierKey).filter(isCstNode), source);
        const operationAnn = findAnn(methodAnnotations, "Operation");
        const apiMethodAnn = findAnn(methodAnnotations, "Api");
        if (annBool(operationAnn?.args ?? {}, "hidden") === true || annBool(apiMethodAnn?.args ?? {}, "hidden") === true) {
          settledSignatures.add(signature);
          continue;
        }
        const header = childNode(method, "methodHeader") ?? method;
        const declarator = childNode(header, "methodDeclarator");
        const methodName = tokenImage(declarator, "Identifier") ?? "";
        if (!methodName) {
          continue;
        }
        let methodIgnored = typeIgnored;
        let ruleSummary;
        let ruleDescAppend;
        let ruleFolder;
        if (rules && !methodIgnored) {
          const methodRawJavadoc = nodeJavadoc(wrapper);
          const mctx = {
            annotations: methodAnnotations,
            javadocRaw: methodRawJavadoc,
            subject: `\u65B9\u6CD5 ${typeName}.${methodName}`,
            extraAnnotations: typeAnnotations
          };
          const warn = (m) => ruleWarnings.push(m);
          for (const e of rules.entries) {
            if (e.key !== "ignore") {
              continue;
            }
            const cond = evalCondition(e.cond, mctx, e.key, warn);
            if (!cond.supported) {
              warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
              continue;
            }
            if (!cond.hit) {
              continue;
            }
            const v = evalRuleValue(e.value, mctx, e.key, warn);
            if (v.skipped && v.reason) {
              warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
              continue;
            }
            if (v.matched && v.value !== void 0 && v.value !== "") {
              methodIgnored = true;
            }
          }
          if (!methodIgnored) {
            for (const e of rules.entries) {
              if (e.key !== "folder.name") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== void 0 && v.value.trim()) {
                ruleFolder = v.value;
              }
            }
            for (const e of rules.entries) {
              if (e.key !== "api.name") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== void 0 && v.value.trim()) {
                ruleSummary = v.value;
              }
            }
            const appends = [];
            for (const e of rules.entries) {
              if (e.key !== "method.description" && e.key !== "method.doc") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} \u6761\u4EF6\u65E0\u6CD5\u6C42\u503C,\u5DF2\u8DF3\u8FC7:${truncate3(e.cond ?? "", 50)}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(\u6587\u4EF6 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== void 0 && v.value.trim()) {
                appends.push(v.value);
              }
            }
            if (appends.length) {
              ruleDescAppend = appends.join("\n");
            }
          }
        }
        if (methodIgnored) {
          settledSignatures.add(signature);
          continue;
        }
        const mappings = resolveMapping(methodAnnotations, flavor, (message) => {
          warnings.push(`${typeName}.${methodName}: ${message}`);
        }, baseMethods);
        if (!mappings.length) {
          continue;
        }
        settledSignatures.add(signature);
        const jaxrsMethodMedia = jaxrsMediaTypesOf(methodAnnotations);
        const springMethodMedia = springMediaTypesOf(methodAnnotations);
        const jaxrsConsumes = [...jaxrsMethodMedia.consumes, ...classMedia.jaxrs.consumes];
        const jaxrsProduces = [...jaxrsMethodMedia.produces, ...classMedia.jaxrs.produces];
        const springConsumes = springMethodMedia.consumes.length ? springMethodMedia.consumes : classMedia.spring.consumes;
        const springProduces = springMethodMedia.produces.length ? springMethodMedia.produces : classMedia.spring.produces;
        const consumes = flavor === "jaxrs" ? jaxrsConsumes : uniqueMediaTypes([...jaxrsConsumes, ...springConsumes]);
        const produces = flavor === "jaxrs" ? jaxrsProduces : uniqueMediaTypes([...jaxrsProduces, ...springProduces]);
        for (const m of mappings) {
          for (const mp of m.paths) {
            for (const bp of basePaths) {
              const ep = buildEndpoint(hit.site.pf, warnings, {
                flavor,
                verb: m.method,
                path: joinPath2(bp, mp),
                tag: ruleFolder ?? tag,
                controller: typeName,
                declaringType: hit.site.typeName,
                ownerPath: pf.fsPath,
                methodName,
                methodAnnotations,
                method,
                wrapper,
                classJavadoc,
                consumes,
                produces,
                ruleSummary,
                ruleDescAppend,
                index
              });
              if (ep) {
                endpoints.push(ep);
              }
            }
          }
        }
      }
    }
  }
  warnings.push(...ruleWarnings);
  return { endpoints, warnings };
}
function typeSiteOf(pf, typeDecl) {
  const classDecl = childNode(typeDecl, "classDeclaration");
  const interfaceDecl = childNode(typeDecl, "interfaceDeclaration");
  const normal = classDecl ? childNode(classDecl, "normalClassDeclaration") : void 0;
  const normalItf = interfaceDecl ? childNode(interfaceDecl, "normalInterfaceDeclaration") : void 0;
  const inner = normal ?? normalItf;
  if (!inner) {
    return void 0;
  }
  const typeName = typeNameOf(inner);
  if (!typeName) {
    return void 0;
  }
  const typeAnnotations = collectAnnotations(
    [
      ...childAll(classDecl, "classModifier"),
      ...childAll(interfaceDecl, "classModifier"),
      ...childAll(interfaceDecl, "interfaceModifier"),
      ...childAll(inner, "classModifier"),
      ...childAll(inner, "interfaceModifier")
    ].filter(isCstNode),
    pf.source
  );
  return { pf, carrier: typeDecl, inner, typeName, isInterface: !!normalItf, typeAnnotations };
}
function buildTypeSites(files) {
  const byName = /* @__PURE__ */ new Map();
  const byFile = /* @__PURE__ */ new Map();
  for (const pf of files) {
    let list = byFile.get(pf);
    if (!list) {
      list = [];
      byFile.set(pf, list);
    }
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const site = typeSiteOf(pf, typeDecl);
      if (site) {
        byName.set(site.typeName, site);
        list.push(site);
      }
    }
  }
  return { byName, byFile };
}
function typeTextName(text) {
  return simpleName(parseTypeText(text).name);
}
function directSuperTypeNames(site) {
  const source = site.pf.source;
  const names = [];
  const pushInterfaceList = (holder) => {
    const list = childNode(holder, "interfaceTypeList");
    if (!list) {
      return;
    }
    for (const it of childAll(list, "interfaceType").filter(isCstNode)) {
      const classType = childNode(it, "classType");
      const name = classType ? typeTextName(nodeText(source, classType)) : "";
      if (name && name !== "Object") {
        names.push(name);
      }
    }
  };
  if (site.isInterface) {
    pushInterfaceList(childNode(site.inner, "interfaceExtends"));
  } else {
    const ext = childNode(site.inner, "classExtends");
    const classType = ext ? childNode(ext, "classType") : void 0;
    const superName = classType ? typeTextName(nodeText(source, classType)) : "";
    if (superName && superName !== "Object") {
      names.push(superName);
    }
    pushInterfaceList(childNode(site.inner, "classImplements"));
  }
  return names;
}
function superTypeChain(root2, sites) {
  const chain = [];
  const visited = /* @__PURE__ */ new Set([root2.typeName]);
  let frontier = [root2];
  while (frontier.length) {
    const next = [];
    for (const site of frontier) {
      for (const name of directSuperTypeNames(site)) {
        if (visited.has(name)) {
          continue;
        }
        const sup = sites.get(name);
        if (!sup) {
          continue;
        }
        visited.add(name);
        chain.push(sup);
        next.push(sup);
      }
    }
    frontier = next;
  }
  return chain;
}
function detectFlavor(site, chain) {
  const probe = (s) => {
    if (findAnn(s.typeAnnotations, "RestController", "Controller")) {
      return "spring-mvc";
    }
    if (s.isInterface && findAnn(s.typeAnnotations, "FeignClient")) {
      return "feign";
    }
    if (findAnn(s.typeAnnotations, "Path")) {
      return "jaxrs";
    }
    if (findAnn(s.typeAnnotations, "Endpoint")) {
      return "actuator";
    }
    return void 0;
  };
  const own = probe(site);
  if (own) {
    return own;
  }
  for (const s of chain) {
    const inherited = s.isInterface ? void 0 : probe(s);
    if (inherited === "spring-mvc") {
      return inherited;
    }
  }
  return void 0;
}
function classBaseMethods(hierarchy, flavor) {
  if (flavor !== "spring-mvc" && flavor !== "feign") {
    return [];
  }
  for (const s of hierarchy) {
    const classMapping = findAnn(s.typeAnnotations, "RequestMapping");
    if (classMapping) {
      return normalizeVerbs(annArray(classMapping.args, "method"));
    }
  }
  return [];
}
function normalizeVerbs(values2) {
  return values2.map((m) => (m.includes(".") ? m.slice(m.lastIndexOf(".") + 1) : m).toUpperCase());
}
function classBasePaths(hierarchy, flavor) {
  if (flavor === "actuator") {
    const endpointAnn = findAnn(hierarchy[0].typeAnnotations, "Endpoint");
    return ["/actuator/" + (annStr(endpointAnn?.args ?? {}, "id", "value") ?? hierarchy[0].typeName.toLowerCase())];
  }
  if (flavor === "jaxrs") {
    for (const s of hierarchy) {
      const pathAnn = findAnn(s.typeAnnotations, "Path");
      if (pathAnn) {
        return pathArgsOf(pathAnn);
      }
    }
    return [""];
  }
  for (const s of hierarchy) {
    const classMapping = findAnn(s.typeAnnotations, "RequestMapping");
    if (classMapping) {
      return pathArgsOf(classMapping);
    }
    if (flavor === "feign") {
      const feign = findAnn(s.typeAnnotations, "FeignClient");
      const feignPath = feign ? annStr(feign.args, "path") : void 0;
      if (feignPath) {
        return [feignPath];
      }
    }
  }
  return [""];
}
function declaredMethodsOf(site) {
  const hits = [];
  if (site.isInterface) {
    for (const member of childAll(childNode(site.inner, "interfaceBody"), "interfaceMemberDeclaration").filter(isCstNode)) {
      const m = childNode(member, "interfaceMethodDeclaration");
      if (m) {
        hits.push({ method: m, wrapper: member, modifierKey: "interfaceMethodModifier", site });
      }
    }
    return hits;
  }
  for (const member of childAll(childNode(site.inner, "classBody"), "classBodyDeclaration").filter(isCstNode)) {
    const memberDecl = childNode(member, "classMemberDeclaration") ?? childNode(member, "memberDeclaration");
    const m = childNode(memberDecl, "methodDeclaration");
    if (m) {
      hits.push({ method: m, wrapper: member, modifierKey: "methodModifier", site });
    }
  }
  return hits;
}
function hasNonHandlerModifier(method, modifierKey) {
  return childAll(method, modifierKey).filter(isCstNode).some((m) => !!m.children && ("Private" in m.children || "Static" in m.children));
}
function collectMethodHits(root2, chain) {
  const hits = declaredMethodsOf(root2);
  for (const sup of chain) {
    for (const hit of declaredMethodsOf(sup)) {
      if (!hasNonHandlerModifier(hit.method, hit.modifierKey)) {
        hits.push(hit);
      }
    }
  }
  return hits;
}
var fileScopeCache = /* @__PURE__ */ new WeakMap();
function fileScopeOf(pf) {
  let scope = fileScopeCache.get(pf);
  if (!scope) {
    const imported = /* @__PURE__ */ new Map();
    for (const match of pf.source.matchAll(/^\s*import\s+(?!static\s+)([\w.]+);/gm)) {
      imported.set(simpleName(match[1]), match[1]);
    }
    scope = { packageName: /^\s*package\s+([\w.]+)\s*;/m.exec(pf.source)?.[1], imported };
    fileScopeCache.set(pf, scope);
  }
  return scope;
}
function methodSignature(site, method) {
  const { pf } = site;
  const header = childNode(method, "methodHeader") ?? method;
  const declarator = childNode(header, "methodDeclarator");
  const paramList = childNode(declarator, "formalParameterList");
  const { packageName, imported } = fileScopeOf(pf);
  const javaLang = /* @__PURE__ */ new Set([
    "Boolean",
    "Byte",
    "Character",
    "Class",
    "Double",
    "Enum",
    "Exception",
    "Float",
    "Integer",
    "Long",
    "Math",
    "Number",
    "Object",
    "Record",
    "RuntimeException",
    "Short",
    "String",
    "Throwable",
    "Void"
  ]);
  const types = [];
  for (const fp of childAll(paramList, "formalParameter").filter(isCstNode)) {
    const regular = childNode(fp, "variableParaRegularParameter") ?? childNode(fp, "variableArityParameter");
    const typeNode = regular ? childNode(regular, "unannType") : void 0;
    if (!typeNode) {
      types.push("?");
      continue;
    }
    const ref = parseTypeText(nodeText(pf.source, typeNode));
    const name = ref.name;
    const resolvedName = /^(?:boolean|byte|short|int|long|char|float|double|void)$/.test(name) ? name : name.includes(".") ? name : imported.get(name) ?? (javaLang.has(name) ? `java.lang.${name}` : /^[A-Z]$/.test(name) ? name : [packageName, name].filter(Boolean).join("."));
    const varargs = !!regular && childNode(fp, "variableArityParameter") !== void 0;
    types.push(`${resolvedName}${"[]".repeat(ref.dims + (varargs ? 1 : 0))}`);
  }
  return `${tokenImage(declarator, "Identifier") ?? ""}(${types.join(",")})`;
}
function truncate3(s, n) {
  return s.length > n ? s.slice(0, n) + "\u2026" : s;
}
function resolveMapping(annotations, flavor, warn, baseMethods = []) {
  if (flavor === "actuator") {
    const op = findAnn(annotations, "ReadOperation", "WriteOperation", "DeleteOperation");
    if (!op) {
      return [];
    }
    const verb = op.name === "ReadOperation" ? "GET" : op.name === "WriteOperation" ? "POST" : "DELETE";
    return [{ method: verb, paths: [""] }];
  }
  if (flavor === "jaxrs") {
    const verbAnn = annotations.find((a) => JAXRS_METHODS[a.name]);
    if (!verbAnn) {
      return [];
    }
    const pathAnn = findAnn(annotations, "Path");
    return [{ method: JAXRS_METHODS[verbAnn.name], paths: pathArgsOf(pathAnn ?? verbAnn) }];
  }
  const mapping = findAnn(annotations, ...SPRING_MAPPING_NAMES);
  if (!mapping) {
    return [];
  }
  const declared = SPRING_MAPPINGS[mapping.name] ?? normalizeVerbs(annArray(mapping.args, "method"));
  let verbs;
  if (baseMethods.length && declared.length) {
    verbs = [...new Set(declared.filter((method) => baseMethods.includes(method)))];
    if (!verbs.length) {
      warn?.(`\u7C7B\u7EA7 method [${baseMethods.join(",")}] \u4E0E\u65B9\u6CD5\u7EA7 method [${declared.join(",")}] \u65E0\u4EA4\u96C6,\u5DF2\u8DF3\u8FC7\u8BE5\u6620\u5C04`);
      return [];
    }
  } else if (baseMethods.length) {
    verbs = [...new Set(baseMethods)];
  } else if (declared.length) {
    verbs = [...new Set(declared)];
  } else {
    warn?.("@RequestMapping \u672A\u58F0\u660E method,\u5DF2\u6309 GET/POST/PUT/PATCH/DELETE \u8F93\u51FA");
    verbs = [...REQUEST_MAPPING_DEFAULT_VERBS];
  }
  const paths = pathArgsOf(mapping);
  return verbs.map((method) => ({ method, paths }));
}
function jaxrsMediaTypesOf(annotations) {
  return {
    consumes: annArray(findAnn(annotations, "Consumes")?.args ?? {}, "value").map(toMimeType),
    produces: annArray(findAnn(annotations, "Produces")?.args ?? {}, "value").map(toMimeType)
  };
}
function springMediaTypesOf(annotations) {
  const mapping = findAnn(annotations, ...SPRING_MAPPING_NAMES);
  if (!mapping) {
    return { consumes: [], produces: [] };
  }
  return {
    consumes: annArray(mapping.args, "consumes").map(toMimeType),
    produces: annArray(mapping.args, "produces").map(toMimeType)
  };
}
function classMediaTypesOf(hierarchy) {
  const jaxrs = jaxrsMediaTypesOf(hierarchy[0].typeAnnotations);
  let spring = { consumes: [], produces: [] };
  for (const site of hierarchy) {
    const classMapping = findAnn(site.typeAnnotations, "RequestMapping");
    if (classMapping) {
      spring = {
        consumes: annArray(classMapping.args, "consumes").map(toMimeType),
        produces: annArray(classMapping.args, "produces").map(toMimeType)
      };
      break;
    }
  }
  return { jaxrs, spring };
}
function buildEndpoint(pf, warnings, a) {
  const javadoc = parseJavadoc(nodeJavadoc(a.wrapper));
  const operationAnn = findAnn(a.methodAnnotations, "Operation");
  const apiOperation = findAnn(a.methodAnnotations, "ApiOperation");
  const summary = operationAnn && annStr(operationAnn.args, "summary", "value") || apiOperation && annStr(apiOperation.args, "value") || a.ruleSummary || javadoc?.firstLine || a.methodName;
  let description = operationAnn && annStr(operationAnn.args, "description") || apiOperation && annStr(apiOperation.args, "notes") || (javadoc && javadoc.description && javadoc.description !== javadoc.firstLine ? javadoc.description : void 0);
  if (a.ruleDescAppend) {
    description = description ? `${description}
${a.ruleDescAppend}` : a.ruleDescAppend;
  }
  const header = childNode(a.method, "methodHeader") ?? a.method;
  const declarator = childNode(header, "methodDeclarator");
  const paramList = childNode(declarator, "formalParameterList");
  const parameters = [];
  const formFields = [];
  let requestBody;
  const paramDocs = { ...a.classJavadoc?.params, ...javadoc?.params };
  for (const fp of childAll(paramList, "formalParameter").filter(isCstNode)) {
    const regular = childNode(fp, "variableParaRegularParameter") ?? childNode(fp, "variableArityParameter");
    if (!regular) {
      continue;
    }
    const annotations = collectAnnotations(childAll(regular, "variableModifier").filter(isCstNode), pf.source);
    const typeNode = childNode(regular, "unannType");
    const typeText = typeNode ? nodeText(pf.source, typeNode).trim() : "Object";
    const paramName = tokenImage(childNode(regular, "variableDeclaratorId"), "Identifier") ?? "";
    if (!paramName) {
      continue;
    }
    if (isHiddenParam(annotations)) {
      continue;
    }
    const docDesc = paramDocs[paramName]?.trim() || void 0;
    const paramAnn = findAnn(annotations, "Parameter");
    const apiParam = findAnn(annotations, "ApiParam");
    const description2 = paramAnn && annStr(paramAnn.args, "description", "value") || apiParam && annStr(apiParam.args, "value") || docDesc;
    const example = paramAnn && annStr(paramAnn.args, "example") || schemaExample(annotations);
    const pathVar = findAnn(annotations, "PathVariable", "PathParam");
    const selector = findAnn(annotations, "Selector");
    const reqParam = findAnn(annotations, "RequestParam", "QueryParam");
    const reqHeader = findAnn(annotations, "RequestHeader", "HeaderParam");
    const reqBody = findAnn(annotations, "RequestBody");
    const reqPart = findAnn(annotations, "RequestPart");
    const defaultValueAnn = findAnn(annotations, "DefaultValue");
    if (pathVar || selector) {
      parameters.push({
        name: pathVar && (annStr(pathVar.args, "value", "name") ?? paramName) || paramName,
        in: "path",
        typeText,
        required: true,
        description: description2,
        example,
        annotations
      });
    } else if (reqHeader) {
      const dv = defaultValueAnn ? annStr(defaultValueAnn.args, "value") : void 0;
      parameters.push({
        name: annStr(reqHeader.args, "value", "name") ?? paramName,
        in: "header",
        typeText,
        // Spring 的 @RequestHeader 默认 required=true(缺头 400),与 easy-yapi 的 findRequired 口径一致;
        // JAX-RS @HeaderParam 缺失同样报错,@DefaultValue 使其可选(easy-yapi v3 一律视为可选,此处按规范更精确)
        required: a.flavor === "jaxrs" ? defaultValueAnn === void 0 : annBool(reqHeader.args, "required") ?? true,
        description: description2,
        example: example ?? dv,
        defaultValue: dv,
        annotations
      });
    } else if (reqBody) {
      requestBody = { typeText, required: annBool(reqBody.args, "required") ?? true, description: description2 };
    } else if (reqPart || typeText.includes("MultipartFile")) {
      formFields.push({
        name: reqPart ? annStr(reqPart.args, "value", "name") ?? paramName : paramName,
        in: "query",
        typeText,
        required: reqPart ? annBool(reqPart.args, "required") ?? true : true,
        description: description2,
        example,
        annotations
      });
    } else if (reqParam) {
      const dv = annStr(reqParam.args, "defaultValue") ?? (defaultValueAnn ? annStr(defaultValueAnn.args, "value") : void 0);
      parameters.push({
        name: annStr(reqParam.args, "value", "name") ?? paramName,
        in: "query",
        typeText,
        // Spring @RequestParam 默认必填;JAX-RS @QueryParam 缺失只是取 null,天然可选
        // (与 easy-yapi v3 的 JAX-RS 口径一致)
        required: dv !== void 0 ? false : annBool(reqParam.args, "required") ?? a.flavor !== "jaxrs",
        description: description2,
        example: example ?? dv,
        defaultValue: dv,
        annotations
      });
    } else if (isPageableType(typeText)) {
      parameters.push(
        { name: "page", in: "query", typeText: "int", required: false, description: "\u9875\u7801(0 \u57FA)", annotations: [] },
        { name: "size", in: "query", typeText: "int", required: false, description: "\u6BCF\u9875\u6761\u6570", annotations: [] },
        { name: "sort", in: "query", typeText: "List<String>", required: false, description: "\u6392\u5E8F,\u5982 name,asc", annotations: [] }
      );
    } else if (isSimpleTypeText(typeText)) {
      parameters.push({
        name: paramName,
        in: "query",
        typeText,
        required: isPrimitiveJavaType(typeText),
        description: description2,
        example,
        annotations
      });
    } else if (a.flavor === "jaxrs") {
      requestBody = { typeText, required: true, description: description2 };
    } else if (a.index) {
      const declaring = a.declaringType ?? a.controller;
      const expansion = expandQueryBean(a.index, paramName, typeText, typeScopeOf(a.index.types.get(declaring)));
      for (const w of expansion.warnings) {
        warnings.push(`${a.controller}.${a.methodName}: ${w}`);
      }
      if (expansion.params.length) {
        for (const f of expansion.params) {
          if (!parameters.some((p) => p.name === f.name) && !formFields.some((p) => p.name === f.name)) {
            parameters.push({ ...f, description: f.description || docDescOf(paramDocs, f.name) });
          }
        }
      } else {
        warnings.push(`${a.controller}.${a.methodName}: \u53C2\u6570 ${paramName} (${typeText}) \u7F3A\u5C11 @RequestParam/@PathVariable/@RequestBody \u6CE8\u89E3,\u4E14\u65E0\u6CD5\u5C55\u5F00\u4E3A\u67E5\u8BE2\u53C2\u6570,\u5DF2\u5FFD\u7565`);
      }
    } else {
      warnings.push(`${a.controller}.${a.methodName}: \u53C2\u6570 ${paramName} (${typeText}) \u7F3A\u5C11 @RequestParam/@PathVariable/@RequestBody \u6CE8\u89E3,\u5DF2\u5FFD\u7565`);
    }
  }
  for (const imp of collectImplicitParams(a.methodAnnotations)) {
    if (imp.paramType === "body") {
      if (!requestBody && imp.dataType) {
        requestBody = { typeText: imp.dataType, required: imp.required, description: imp.description };
      }
      continue;
    }
    if (imp.paramType === "form") {
      if (!parameters.some((p) => p.name === imp.name) && !formFields.some((p) => p.name === imp.name)) {
        formFields.push({ name: imp.name, in: "query", typeText: imp.dataType ?? "String", required: imp.required, description: imp.description, example: imp.example, annotations: [] });
      }
      continue;
    }
    if (parameters.some((p) => p.name === imp.name)) {
      continue;
    }
    parameters.push({
      name: imp.name,
      in: imp.paramType,
      typeText: imp.dataType ?? "String",
      required: imp.required,
      description: imp.description,
      example: imp.example,
      defaultValue: imp.defaultValue,
      annotations: []
    });
  }
  if (formFields.length) {
    if (requestBody) {
      warnings.push(`${a.controller}.${a.methodName}: @RequestBody(${requestBody.typeText}) \u4E0E multipart \u8868\u5355\u53C2\u6570\u5E76\u5B58,JSON \u8BF7\u6C42\u4F53\u88AB multipart \u8986\u76D6`);
    }
    requestBody = { typeText: "__multipart__", required: true, formFields };
  }
  const headerNode = childNode(a.method, "methodHeader") ?? a.method;
  const resultNode = childNode(headerNode, "result");
  const returnType = resultNode ? extractReturnType(pf, resultNode) : void 0;
  const responseDescription = javadoc?.returns?.trim() || "OK";
  let finalPath = a.path;
  if (a.flavor === "actuator") {
    const selectorNames = parameters.filter((p) => p.in === "path").map((p) => `{${p.name}}`);
    if (selectorNames.length) {
      finalPath = joinPath2(a.path, selectorNames.join("/"));
    }
  }
  return {
    method: a.verb,
    path: finalPath,
    tag: a.tag,
    operationId: `${a.controller}_${a.methodName}`,
    methodName: a.methodName,
    summary,
    description,
    parameters,
    requestBody,
    returnType,
    responseDescription,
    fsPath: pf.fsPath,
    controller: a.controller,
    ...a.ownerPath && a.ownerPath !== pf.fsPath ? { ownerFsPath: a.ownerPath } : {},
    ...a.declaringType && a.declaringType !== a.controller ? { declaringType: a.declaringType } : {},
    flavor: a.flavor,
    extraResponses: collectExtraResponses(a.methodAnnotations),
    consumes: a.consumes.length ? a.consumes : void 0,
    produces: a.produces.length ? a.produces : void 0,
    methodRange: methodRangeOf(a.method),
    deprecated: !!findAnn(a.methodAnnotations, "Deprecated")
  };
}
function methodRangeOf(method) {
  const loc = method.location;
  if (!loc) {
    return void 0;
  }
  return { startOffset: loc.startOffset, endOffset: loc.endOffset, startLine: loc.startLine ?? 1 };
}
function collectImplicitParams(annotations) {
  const singles = [];
  const container = findAnn(annotations, "ApiImplicitParams");
  if (container) {
    for (const raw of annArray(container.args, "value")) {
      singles.push(parseAnnotationText(raw));
    }
  }
  const direct = findAnn(annotations, "ApiImplicitParam");
  if (direct) {
    singles.push(direct);
  }
  const out = [];
  for (const imp of singles) {
    if (imp.name !== "ApiImplicitParam") {
      continue;
    }
    const name = annStr(imp.args, "name");
    if (!name) {
      continue;
    }
    const pt = (annStr(imp.args, "paramType") ?? "query").toLowerCase();
    const paramType = pt === "path" ? "path" : pt === "header" ? "header" : pt === "body" ? "body" : pt === "form" ? "form" : "query";
    const allowMultiple = annStr(imp.args, "allowMultiple") === "true";
    const dataType = annStr(imp.args, "dataType");
    out.push({
      name,
      paramType,
      dataType: allowMultiple && dataType ? `List<${dataType}>` : dataType,
      required: annStr(imp.args, "required") === "true" || annBool(imp.args, "required") === true,
      description: annStr(imp.args, "value"),
      example: annStr(imp.args, "example"),
      defaultValue: annStr(imp.args, "defaultValue")
    });
  }
  return out;
}
function parseAnnotationText(raw) {
  const trimmed = raw.trim().replace(/^_nested_/, "").replace(/_annotation$/, "");
  const m = /^@?(?:[\w.]*\.)?(\w+)\(([\s\S]*)\)$/.exec(trimmed);
  if (!m) {
    return { name: trimmed.replace(/^@/, ""), raw, args: {} };
  }
  return { name: m[1], raw, args: parseAnnotationArgsText(m[2]) };
}
function parseAnnotationArgsText(text) {
  return parseArgsText(text);
}
function collectExtraResponses(annotations) {
  const out = [];
  const push = (code, description, schemaText) => {
    if (code) {
      out.push({ code, description, schemaText });
    }
  };
  const responsesContainer = findAnn(annotations, "ApiResponses");
  if (responsesContainer) {
    for (const raw of annArray(responsesContainer.args, "value")) {
      const ann = parseAnnotationText(raw);
      if (ann.name !== "ApiResponse") {
        continue;
      }
      push(
        normalizeStatus(annStr(ann.args, "code", "responseCode") ?? ""),
        annStr(ann.args, "message", "description"),
        implementationOfClass(ann.raw)
      );
    }
  }
  const direct = findAnn(annotations, "ApiResponse");
  if (direct) {
    push(
      normalizeStatus(annStr(direct.args, "code", "responseCode") ?? ""),
      annStr(direct.args, "message", "description"),
      implementationOfClass(direct.raw)
    );
  }
  const status = findAnn(annotations, "ResponseStatus");
  if (status) {
    push(
      normalizeStatus(annStr(status.args, "value", "code") ?? ""),
      annStr(status.args, "reason") || void 0
    );
  }
  return out;
}
function implementationOfClass(rawAnn) {
  const m = /implementation\s*=\s*(\w+(?:\.\w+)*)\.class/.exec(rawAnn);
  return m ? m[1] : void 0;
}
function normalizeStatus(raw) {
  if (/^\d{3}$/.test(raw)) {
    return raw;
  }
  const name = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return HTTP_STATUS_BY_NAME[name.trim()] || raw;
}
function isHiddenParam(annotations) {
  const p = findAnn(annotations, "Parameter");
  if (p && annBool(p.args, "hidden") === true) {
    return true;
  }
  const ap = findAnn(annotations, "ApiParam");
  return !!ap && annBool(ap.args, "hidden") === true;
}
function isPageableType(typeText) {
  const t = typeText.trim();
  return t === "Pageable" || t === "org.springframework.data.domain.Pageable";
}
function docDescOf(paramDocs, fieldName) {
  return paramDocs[fieldName]?.trim() || void 0;
}
var MAX_QUERY_BEAN_DEPTH = 5;
function expandQueryBean(index, paramName, typeText, controllerScope) {
  const t = parseTypeText(typeText);
  const info = resolveScopedType(index, t.name, controllerScope);
  if (!info || info.kind === "enum") {
    return { params: [], warnings: [] };
  }
  const params = [];
  const warnings = [];
  const seen = /* @__PURE__ */ new Set();
  const walk = (ci, prefix, depth, pathTypes) => {
    const fields = ci.fields.length ? ci.fields : ci.recordComponents;
    const scope = typeScopeOf(ci);
    for (const f of fields) {
      const name = prefix ? `${prefix}.${f.name}` : f.name;
      if (seen.has(name)) {
        continue;
      }
      const fRef = parseTypeText(f.typeText);
      const fSimple = simpleName(fRef.name);
      const sub = fRef.dims === 0 ? resolveScopedType(index, fRef.name, scope) : void 0;
      const nested = !!sub && (sub.kind === "class" || sub.kind === "record") && !isPlainValueType(fSimple);
      if (nested) {
        if (depth + 1 >= MAX_QUERY_BEAN_DEPTH) {
          warnings.push(`\u53C2\u6570 ${paramName} \u7684\u5D4C\u5957\u5B57\u6BB5 ${name} \u672A\u5C55\u5F00(\u5D4C\u5957\u5C42\u7EA7\u8D85\u8FC7 ${MAX_QUERY_BEAN_DEPTH} \u5C42)`);
          continue;
        }
        if (pathTypes.has(fSimple)) {
          warnings.push(`\u53C2\u6570 ${paramName} \u7684\u5D4C\u5957\u5B57\u6BB5 ${name} \u672A\u5C55\u5F00(\u68C0\u6D4B\u5230\u5FAA\u73AF\u5F15\u7528:${fSimple})`);
          continue;
        }
        walk(sub, name, depth + 1, /* @__PURE__ */ new Set([...pathTypes, fSimple]));
        continue;
      }
      seen.add(name);
      const required = !!findAnn(f.annotations, "NotNull", "NotBlank", "NotEmpty");
      const desc = schemaDescription(
        f.annotations,
        f.javadoc && (f.javadoc.description || f.javadoc.firstLine) || void 0
      );
      params.push({
        name,
        in: "query",
        typeText: f.typeText,
        required,
        description: desc,
        annotations: f.annotations
      });
    }
    if (ci.superClass) {
      const sup = resolveScopedType(index, parseTypeText(ci.superClass).name, scope);
      if (sup && (sup.kind === "class" || sup.kind === "record")) {
        walk(sup, prefix, depth, pathTypes);
      }
    }
  };
  walk(info, "", 0, /* @__PURE__ */ new Set([info.simpleName]));
  return { params, warnings };
}
function isPlainValueType(simple) {
  return /^(int|Integer|long|Long|short|Short|byte|Byte|float|Float|double|Double|boolean|Boolean|String|char|Character|BigDecimal|BigInteger|Date|LocalDate|LocalDateTime|LocalTime|Instant|ZonedDateTime|OffsetDateTime|Timestamp|UUID|Enum|List|Set|Map|String\[\])$/.test(
    simple
  );
}
function extractReturnType(pf, resultNode) {
  const unannType = childNode(resultNode, "unannType");
  return unannType ? nodeText(pf.source, unannType).trim() : void 0;
}
function pathArgsOf(mapping) {
  const paths = annArray(mapping.args, "value", "path");
  return paths.length ? paths : [""];
}
function joinPath2(base, sub) {
  const p = "/" + [base, sub].filter((s) => s && s !== "/").map((s) => s.replace(/^\/+|\/+$/g, "")).join("/");
  return p.replace(/\/{2,}/g, "/") || "/";
}
function isPrimitiveJavaType(typeText) {
  return /^(boolean|byte|short|int|long|char|float|double)$/.test(typeText.trim());
}
function isSimpleTypeText(typeText) {
  const t = typeText.trim();
  const simple = t.slice(t.lastIndexOf(".") + 1).replace(/(\[\])$/, "");
  return /^(int|Integer|long|Long|short|Short|byte|Byte|float|Float|double|Double|boolean|Boolean|String|char|Character|BigDecimal|BigInteger|Date|LocalDate|LocalDateTime|LocalTime|Instant|ZonedDateTime|OffsetDateTime|Timestamp)$/.test(
    simple
  );
}

// ../../src/openapi/builder.ts
function buildOpenApi(parse2, index, options) {
  const registry = new SchemaRegistry();
  const fieldWarnings = [];
  const ctx = {
    index,
    registry,
    options: { pageStyle: options.pageStyle, enumFieldDoc: options.enumFieldDoc },
    fieldRules: options.rules,
    fieldWarnings
  };
  const paths = {};
  const tags = /* @__PURE__ */ new Map();
  const usedOperationIds = /* @__PURE__ */ new Map();
  const opFlavors = /* @__PURE__ */ new Map();
  for (const ep of parse2.endpoints) {
    tags.set(ep.tag, tags.get(ep.tag) ?? void 0);
    const pathItem = paths[ep.path] ??= {};
    const verbKey = ep.method.toLowerCase();
    const existing = pathItem[verbKey];
    if (existing) {
      const existingFlavor = opFlavors.get(`${ep.path} ${verbKey}`);
      if (existingFlavor === "spring-mvc" || ep.flavor !== "spring-mvc") {
        parse2.warnings.push(`\u63A5\u53E3\u91CD\u590D,\u5DF2\u8DF3\u8FC7: ${ep.method} ${ep.path} (${ep.controller}.${ep.operationId})`);
        continue;
      }
    }
    const count = usedOperationIds.get(ep.operationId) ?? 0;
    usedOperationIds.set(ep.operationId, count + 1);
    opFlavors.set(`${ep.path} ${verbKey}`, ep.flavor);
    pathItem[verbKey] = buildOperation(ep, ctx, count > 0 ? `${ep.operationId}_${count + 1}` : ep.operationId, options.folderOf);
  }
  const spec = {
    openapi: "3.0.3",
    info: {
      title: options.title,
      description: options.description,
      version: "1.0.0"
    },
    tags: [...tags.keys()].map((name) => ({ name })),
    paths
  };
  if (Object.keys(registry.schemas).length) {
    spec.components = { schemas: registry.schemas };
  }
  if (registry.warnings.length) {
    parse2.warnings.push(...registry.warnings);
  }
  if (fieldWarnings.length) {
    parse2.warnings.push(...fieldWarnings);
  }
  return { spec, warnings: parse2.warnings };
}
function buildOperation(ep, ctx, operationId, folderOf) {
  const epScope = typeScopeOf(ctx.index.types.get(ep.declaringType ?? ep.controller));
  const opCtx = epScope ? { ...ctx, scope: epScope } : ctx;
  const op = {
    tags: [ep.tag],
    summary: ep.summary,
    description: ep.description,
    operationId
  };
  if (ep.deprecated) {
    op.deprecated = true;
  }
  if (folderOf) {
    const folder = folderOf(ep);
    if (folder) {
      op["x-apifox-folder"] = folder;
    }
  }
  const paramSubject = `${ep.controller}.${ep.methodName ?? ep.operationId}`;
  const parameters = ep.parameters.map((p) => {
    const rule = paramRuleEngine(p, paramSubject, opCtx);
    if (rule.ignored) {
      return void 0;
    }
    let schema = resolveTypeText(p.typeText, opCtx);
    if (rule.typeOverride) {
      schema = { type: rule.typeOverride.type, ...rule.typeOverride.format ? { format: rule.typeOverride.format } : {} };
    }
    applyParamConstraints(p, schema);
    const param = {
      name: p.name,
      in: p.in,
      required: p.in === "path" ? true : rule.required ?? p.required,
      schema
    };
    const desc = rule.appendDoc.length ? [p.description, ...rule.appendDoc].filter(Boolean).join("\n") : p.description;
    if (desc) {
      param.description = desc;
    }
    if (p.example !== void 0) {
      param.example = p.example;
    }
    if (p.defaultValue !== void 0) {
      param.schema = withRefSiblings(param.schema, { default: p.defaultValue });
    }
    return param;
  }).filter((x) => x !== void 0);
  if (parameters.length) {
    op.parameters = parameters;
  }
  if (ep.requestBody) {
    const rb = ep.requestBody;
    if (rb.formFields) {
      const properties = {};
      const required = [];
      for (const f of rb.formFields) {
        const rule = paramRuleEngine(f, paramSubject, opCtx);
        if (rule.ignored) {
          continue;
        }
        const desc = rule.appendDoc.length ? [f.description, ...rule.appendDoc].filter(Boolean).join("\n") : f.description;
        const schema2 = f.typeText.includes("MultipartFile") ? { type: "string", format: "binary", description: desc } : (() => {
          const s = rule.typeOverride ? { type: rule.typeOverride.type, ...rule.typeOverride.format ? { format: rule.typeOverride.format } : {} } : resolveTypeText(f.typeText, opCtx);
          applyParamConstraints(f, s);
          return s;
        })();
        properties[f.name] = schema2;
        if (rule.required ?? f.required) {
          required.push(f.name);
        }
      }
      const schema = { type: "object", properties };
      if (required.length) {
        schema.required = required;
      }
      op.requestBody = {
        required: rb.required,
        content: buildContent(ep.consumes, "multipart/form-data", { schema })
      };
    } else if (rb.typeText !== "__multipart__") {
      const schema = resolveTypeText(rb.typeText, opCtx);
      const jsonBody = { schema };
      if (rb.description) {
        jsonBody.description = rb.description;
      }
      op.requestBody = {
        required: rb.required,
        content: buildContent(ep.consumes, "application/json", jsonBody)
      };
    }
  }
  const responses = {};
  const okResponse = { description: ep.responseDescription || "OK" };
  const innerReturn = responseInnerType(ep.returnType);
  if (innerReturn) {
    okResponse.content = buildContent(ep.produces, "*/*", { schema: resolveTypeText(innerReturn, opCtx) });
  }
  responses["200"] = okResponse;
  for (const extra of ep.extraResponses ?? []) {
    const resp = { description: extra.description || "" };
    if (extra.schemaText) {
      resp.content = buildContent(ep.produces, "*/*", { schema: resolveTypeText(extra.schemaText, opCtx) });
    }
    responses[extra.code] = resp;
  }
  op.responses = responses;
  return op;
}
function buildContent(mediaTypes, fallback, body) {
  const types = mediaTypes?.length ? mediaTypes : [fallback];
  const content = {};
  for (const type of types) {
    content[type] ??= { ...body };
  }
  return content;
}
function applyParamConstraints(p, schema) {
  if (p.annotations?.length) {
    applyConstraints(p.annotations, schema);
  }
}
function responseInnerType(typeText) {
  if (!typeText) {
    return void 0;
  }
  let t = typeText.trim();
  const m = /^(?:ResponseEntity|Mono|HttpEntity)\s*<(.*)>$/.exec(t);
  if (m) {
    t = m[1].trim();
  }
  if (t === "void" || t === "Void") {
    return void 0;
  }
  return t;
}

// ../../src/pipeline.ts
function dedupeEndpoints(endpoints) {
  const seen = /* @__PURE__ */ new Map();
  for (const ep of endpoints) {
    const key = `${ep.method} ${ep.path}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, ep);
      continue;
    }
    if (existing.flavor !== "spring-mvc" && ep.flavor === "spring-mvc") {
      seen.set(key, ep);
    }
  }
  return [...seen.values()];
}
function filterWarningsForEndpoints(warnings, kept) {
  const keptControllers = new Set(kept.map((e) => e.controller));
  const keptOperations = new Set(kept.map((e) => `${e.controller}.${e.operationId}`));
  const keptMethodNames = new Set(kept.map((e) => `${e.controller}.${e.methodName ?? e.operationId}`));
  return warnings.filter((w) => {
    const methodMatch = /^([A-Za-z0-9_$]+)\.([A-Za-z0-9_$]+)\s*[:：]/.exec(w);
    if (methodMatch) {
      const [, ctrl, method] = methodMatch;
      if (!keptControllers.has(ctrl)) {
        return false;
      }
      return keptOperations.has(`${ctrl}.${method}`) || keptMethodNames.has(`${ctrl}.${method}`);
    }
    const ctrlMatch = /(?:^|类\s*)([A-Za-z0-9_$]+Controller|[A-Za-z0-9_$]+Service)\b/.exec(w);
    if (ctrlMatch) {
      const [, ctrl] = ctrlMatch;
      return keptControllers.has(ctrl);
    }
    return true;
  });
}
function run(files, options, endpointFilter) {
  const parsed = files.map((f) => parseJava(f.fsPath, f.content));
  const index = buildIndex(parsed);
  index.jarLookup = options.jarLookup;
  const parseResult = parseControllers(parsed, options.rules, index);
  const all = dedupeEndpoints(parseResult.endpoints);
  const kept = endpointFilter ? all.filter(endpointFilter) : all;
  const filtered = { ...parseResult, endpoints: kept };
  const { spec } = buildOpenApi(filtered, index, {
    title: options.title,
    pageStyle: options.pageStyle,
    rules: options.rules,
    enumFieldDoc: options.enumFieldDoc,
    folderOf: options.folderOf
  });
  const rawWarnings = [...new Set(parseResult.warnings)];
  const warnings = endpointFilter ? filterWarningsForEndpoints(rawWarnings, kept) : rawWarnings;
  return { spec, endpoints: kept, warnings };
}
function analyze(files, options) {
  const opts = typeof options === "string" ? { title: options } : options;
  return run(files, opts);
}
function analyzeSubset(files, options, endpointFilter) {
  return run(files, options, endpointFilter);
}

// ../../src/core/projectScanner.ts
var fs2 = __toESM(require("node:fs"));
var path3 = __toESM(require("node:path"));
var import_fast_glob = __toESM(require_out4());

// ../../src/java/scanScope.ts
var path2 = __toESM(require("path"));
function isInHiddenDirectory(target, workspaceRoot) {
  const rel = path2.relative(path2.resolve(workspaceRoot), path2.resolve(target));
  if (!rel || rel.startsWith("..") || path2.isAbsolute(rel)) {
    return false;
  }
  return rel.split(/[\\/]+/).some((segment) => segment.startsWith("."));
}
function findNestedCheckoutRoot(target, workspaceRoot, hasGitEntry) {
  const root2 = path2.resolve(workspaceRoot);
  let dir = path2.resolve(target);
  while (true) {
    const rel = path2.relative(root2, dir);
    if (!rel || rel.startsWith("..") || path2.isAbsolute(rel)) {
      return void 0;
    }
    if (hasGitEntry(dir)) {
      return dir;
    }
    const parent = path2.dirname(dir);
    if (parent === dir) {
      return void 0;
    }
    dir = parent;
  }
}
function isSkippedCheckout(target, workspaceRoot, hasGitEntry, allowedCheckoutRoot) {
  const nested = findNestedCheckoutRoot(target, workspaceRoot, hasGitEntry);
  return nested !== void 0 && nested !== allowedCheckoutRoot;
}
function createGitEntryProbe(exists) {
  const cache = /* @__PURE__ */ new Map();
  return {
    hasGitEntry(dir) {
      const cached = cache.get(dir);
      if (cached !== void 0) {
        return cached;
      }
      let found = false;
      try {
        found = exists(path2.join(dir, ".git"));
      } catch {
        found = false;
      }
      cache.set(dir, found);
      return found;
    },
    reset() {
      cache.clear();
    }
  };
}

// ../../src/core/projectScanner.ts
async function scanProject(config, signal) {
  throwIfAborted(signal);
  const diagnostics = [];
  const matches = await (0, import_fast_glob.default)(config.include, {
    cwd: config.projectRoot,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    followSymbolicLinks: false
  });
  matches.sort((a, b) => a.localeCompare(b));
  const probe = createGitEntryProbe((candidate) => fs2.existsSync(candidate));
  let skippedFiles = 0;
  const files = [];
  for (const file of matches) {
    throwIfAborted(signal);
    const dir = path3.dirname(file);
    if (isInHiddenDirectory(dir, config.projectRoot) || isSkippedCheckout(dir, config.projectRoot, probe.hasGitEntry)) {
      skippedFiles++;
      continue;
    }
    try {
      files.push({ fsPath: path3.resolve(file), content: await fs2.promises.readFile(file, "utf8") });
    } catch (error) {
      skippedFiles++;
      diagnostics.push({
        level: "warning",
        code: "FILE_READ_FAILED",
        message: `Java \u6587\u4EF6\u8BFB\u53D6\u5931\u8D25:${error instanceof Error ? error.message : String(error)}`,
        file
      });
    }
  }
  return { files, scannedFiles: files.length, skippedFiles, diagnostics };
}
async function findProjectFiles(projectRoot, pattern, ignore, maxFiles, signal) {
  throwIfAborted(signal);
  const files = await (0, import_fast_glob.default)(pattern, {
    cwd: projectRoot,
    ignore,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    followSymbolicLinks: false
  });
  files.sort((a, b) => a.localeCompare(b));
  const probe = createGitEntryProbe((candidate) => fs2.existsSync(candidate));
  const scopedFiles = [];
  for (const file of files) {
    throwIfAborted(signal);
    const dir = path3.dirname(file);
    if (!isInHiddenDirectory(dir, projectRoot) && !isSkippedCheckout(dir, projectRoot, probe.hasGitEntry)) {
      scopedFiles.push(file);
    }
  }
  return maxFiles === void 0 ? scopedFiles : scopedFiles.slice(0, maxFiles);
}
function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error("\u64CD\u4F5C\u5DF2\u53D6\u6D88");
    error.name = "AbortError";
    throw error;
  }
}

// ../../src/core/projectAnalyzer.ts
async function analyzeProject(request) {
  const { config, signal } = request;
  const scanned = await scanProject(config, signal);
  if (!scanned.files.length) {
    return {
      projectRoot: config.projectRoot,
      scannedFiles: 0,
      skippedFiles: scanned.skippedFiles,
      diagnostics: scanned.diagnostics,
      spec: emptySpec(config.title),
      endpoints: [],
      warnings: []
    };
  }
  throwIfAborted(signal);
  const helperProperties = await loadProjectHelperProperties(config, signal);
  const dependency = await buildProjectJarIndex(config, signal);
  const fileSelectors = normalizeFiles(request.files ?? [], config.projectRoot);
  const endpointSelectors = new Set((request.endpoints ?? []).map(normalizeEndpointSelector));
  const hasFilter = fileSelectors.size > 0 || endpointSelectors.size > 0;
  const folderOf = (endpoint) => {
    const key = config.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
    return config.rootFolderName.trim() ? `${config.rootFolderName.trim()}/${key}` : key;
  };
  const options = {
    title: config.title,
    pageStyle: config.pageTypeStyle,
    rules: helperProperties,
    enumFieldDoc: config.enumFieldDoc,
    folderOf,
    jarLookup: dependency.index ? (name) => dependency.index.lookup(name) : void 0
  };
  try {
    const output = hasFilter ? analyzeSubset(scanned.files, options, (endpoint) => {
      const fileMatch = fileSelectors.size === 0 || fileSelectors.has(normalizeFsPath(endpoint.fsPath)) || !!endpoint.ownerFsPath && fileSelectors.has(normalizeFsPath(endpoint.ownerFsPath));
      const endpointMatch = endpointSelectors.size === 0 || endpointSelectors.has(`${endpoint.method.toUpperCase()} ${normalizeEndpointPath(endpoint.path)}`);
      return fileMatch && endpointMatch;
    }) : analyze(scanned.files, options);
    const dependencyWarnings = [...dependency.warnings, ...dependency.index?.warnings ?? []];
    const warnings = [.../* @__PURE__ */ new Set([...helperProperties?.warnings ?? [], ...dependencyWarnings, ...output.warnings])];
    return {
      ...output,
      warnings,
      projectRoot: config.projectRoot,
      scannedFiles: scanned.scannedFiles,
      skippedFiles: scanned.skippedFiles,
      diagnostics: scanned.diagnostics
    };
  } finally {
    dependency.index?.dispose();
  }
}
async function loadProjectHelperProperties(config, signal) {
  if (!config.helperPropertiesEnabled) {
    return void 0;
  }
  const files = await findProjectFiles(config.projectRoot, "**/.apifox-helper.properties", ["**/node_modules/**"], void 0, signal);
  const contents = [];
  for (const file of files) {
    throwIfAborted(signal);
    try {
      contents.push({ path: normalizeFsPath(file), content: await fs3.promises.readFile(file, "utf8") });
    } catch {
    }
  }
  if (!contents.length) {
    return void 0;
  }
  contents.sort((a, b) => pathDepth(a.path) - pathDepth(b.path) || a.path.localeCompare(b.path));
  return loadPropertiesFiles(contents, (candidate) => {
    try {
      return fs3.readFileSync(candidate, "utf8");
    } catch {
      return void 0;
    }
  });
}
async function buildProjectJarIndex(config, signal) {
  const warnings = [];
  const jars = [];
  for (const configured of config.dependencyJars) {
    const candidate = path4.isAbsolute(configured) ? configured : path4.resolve(config.projectRoot, configured);
    try {
      if (fs3.statSync(candidate).isFile()) {
        jars.push(candidate);
      }
    } catch {
      warnings.push(`\u663E\u5F0F\u4F9D\u8D56 jar \u4E0D\u53EF\u8BFB:${candidate}`);
    }
  }
  const repos = await discoverMavenRepos(
    config.dependencyRepos.map((repo) => path4.isAbsolute(repo) ? repo : path4.resolve(config.projectRoot, repo))
  );
  if (repos.length) {
    const pomFiles = await findProjectFiles(config.projectRoot, "**/pom.xml", ["**/target/**", "**/.*/**"], 200, signal);
    const coordinates = [];
    for (const pom of pomFiles) {
      throwIfAborted(signal);
      try {
        coordinates.push(...parsePomDependencies(await fs3.promises.readFile(pom, "utf8")));
      } catch {
        warnings.push(`pom.xml \u4E0D\u53EF\u8BFB:${pom}`);
      }
    }
    const resolved = await resolveDependencyJars(repos, coordinates, { maxJars: config.maxDependencyJars });
    jars.push(...resolved.jars);
    warnings.push(...resolved.warnings);
  }
  const unique = [...new Set(jars)];
  if (!unique.length) {
    return { warnings };
  }
  const index = JarClassIndex.build(unique);
  return index.size ? { index, warnings } : { warnings: [...warnings, ...index.warnings] };
}
function normalizeFiles(files, projectRoot) {
  return new Set(files.map((file) => normalizeFsPath(path4.isAbsolute(file) ? file : path4.resolve(projectRoot, file))));
}
function normalizeFsPath(file) {
  const normalized = path4.resolve(file).replace(/\\/g, "/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
function normalizeEndpointSelector(selector) {
  const match = /^([A-Za-z]+)\s+(.+)$/.exec(selector.trim());
  return match ? `${match[1].toUpperCase()} ${normalizeEndpointPath(match[2])}` : selector.trim().toUpperCase();
}
function normalizeEndpointPath(endpointPath) {
  const normalized = endpointPath.trim().replace(/\/{2,}/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function pathDepth(file) {
  return file.split("/").length;
}
function emptySpec(title) {
  return { openapi: "3.0.3", info: { title, version: "1.0.0" }, paths: {} };
}

// ../../src/core/config.ts
var fs4 = __toESM(require("node:fs"));
var path5 = __toESM(require("node:path"));
var DEFAULT_INCLUDE = ["**/src/main/java/**/*.java"];
var DEFAULT_EXCLUDE = ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"];
var CONFLICT_BEHAVIORS = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"];
var ConfigError = class extends Error {
  constructor(diagnostics) {
    super(diagnostics.map((item) => item.message).join("\n"));
    this.diagnostics = diagnostics;
  }
};
function resolveConfig(projectRoot, overrides = {}, env = process.env) {
  const root2 = path5.resolve(projectRoot);
  const diagnostics = [];
  const explicitConfig = overrides.configFile ?? env.API2APIFOX_CONFIG;
  const configPath = explicitConfig ? path5.resolve(root2, explicitConfig) : path5.join(root2, ".api2apifox.json");
  const requiredConfig = explicitConfig !== void 0;
  const fileConfig = readConfigFile(configPath, requiredConfig, diagnostics);
  const fileSource = `file:${toPosix(path5.relative(root2, configPath) || path5.basename(configPath))}`;
  validateKnownKeys(fileConfig, configPath, diagnostics);
  if (Object.prototype.hasOwnProperty.call(fileConfig, "token")) {
    diagnostics.push({
      level: "error",
      code: "CONFIG_TOKEN_FORBIDDEN",
      message: `${configPath} \u4E0D\u5141\u8BB8\u5305\u542B token\uFF0C\u8BF7\u4F7F\u7528 API2APIFOX_TOKEN \u73AF\u5883\u53D8\u91CF`,
      file: configPath
    });
  }
  const defaults2 = {
    projectRoot: root2,
    title: path5.basename(root2) || "API",
    projectId: 0,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: [...DEFAULT_INCLUDE],
    exclude: [...DEFAULT_EXCLUDE],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    schemaFolderId: 0,
    helperPropertiesEnabled: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    // 依赖解析的资源预算:默认 120 已覆盖常见项目;超出时告警列出被丢弃的 jar
    maxDependencyJars: 120,
    // OpenAPI 导入首次创建目录、接口和模型可能超过一分钟；CLI 默认等待五分钟。
    timeoutMs: 3e5
  };
  const sources = Object.fromEntries(
    Object.keys(defaults2).filter((key) => key !== "projectRoot" && key !== "title").map((key) => [key, "default"])
  );
  sources.title = "default";
  const config = { ...defaults2 };
  const helper = isRecord(fileConfig.helperProperties) ? fileConfig.helperProperties : {};
  applyFile(config, sources, "projectId", numberValue(fileConfig.projectId, "projectId", diagnostics), fileSource);
  applyFile(config, sources, "apiBaseUrl", stringValue(fileConfig.apiBaseUrl, "apiBaseUrl", diagnostics), fileSource);
  applyFile(config, sources, "endpointConflictBehavior", conflictValue(fileConfig.endpointConflictBehavior, "endpointConflictBehavior", diagnostics), fileSource);
  applyFile(config, sources, "schemaConflictBehavior", conflictValue(fileConfig.schemaConflictBehavior, "schemaConflictBehavior", diagnostics), fileSource);
  applyFile(config, sources, "include", stringArrayValue(fileConfig.include, "include", diagnostics), fileSource);
  applyFile(config, sources, "exclude", stringArrayValue(fileConfig.exclude, "exclude", diagnostics), fileSource);
  applyFile(config, sources, "exportPath", stringValue(fileConfig.exportPath, "exportPath", diagnostics), fileSource);
  applyFile(config, sources, "pageTypeStyle", enumValue(fileConfig.pageTypeStyle, "pageTypeStyle", ["mybatis-plus", "spring-data"], diagnostics), fileSource);
  applyFile(config, sources, "folderNameSource", enumValue(fileConfig.folderNameSource, "folderNameSource", ["tag", "controller"], diagnostics), fileSource);
  applyFile(config, sources, "rootFolderName", stringValue(fileConfig.rootFolderName, "rootFolderName", diagnostics), fileSource);
  applyFile(config, sources, "schemaFolderId", numberValue(fileConfig.schemaFolderId, "schemaFolderId", diagnostics), fileSource);
  applyFile(config, sources, "helperPropertiesEnabled", booleanValue(helper.enabled, "helperProperties.enabled", diagnostics), fileSource);
  applyFile(config, sources, "enumFieldDoc", booleanValue(helper.enumFieldDoc, "helperProperties.enumFieldDoc", diagnostics), fileSource);
  applyFile(config, sources, "dependencyRepos", stringArrayValue(fileConfig.dependencyRepos, "dependencyRepos", diagnostics), fileSource);
  applyFile(config, sources, "dependencyJars", stringArrayValue(fileConfig.dependencyJars, "dependencyJars", diagnostics), fileSource);
  applyFile(config, sources, "maxDependencyJars", numberValue(fileConfig.maxDependencyJars, "maxDependencyJars", diagnostics), fileSource);
  applyFile(config, sources, "timeoutMs", numberValue(fileConfig.timeoutMs, "timeoutMs", diagnostics), fileSource);
  if (typeof fileConfig.title === "string" && fileConfig.title.trim()) {
    config.title = fileConfig.title.trim();
    sources.title = fileSource;
  } else if (fileConfig.title !== void 0) {
    invalid("title \u5FC5\u987B\u662F\u975E\u7A7A\u5B57\u7B26\u4E32", diagnostics);
  }
  applyEnv(config, sources, "projectId", env.API2APIFOX_PROJECT_ID, "API2APIFOX_PROJECT_ID", parseEnvNumber, diagnostics);
  applyEnv(config, sources, "apiBaseUrl", env.API2APIFOX_API_BASE_URL, "API2APIFOX_API_BASE_URL", parseEnvString, diagnostics);
  applyEnv(config, sources, "endpointConflictBehavior", env.API2APIFOX_ENDPOINT_CONFLICT, "API2APIFOX_ENDPOINT_CONFLICT", parseEnvConflict, diagnostics);
  applyEnv(config, sources, "schemaConflictBehavior", env.API2APIFOX_SCHEMA_CONFLICT, "API2APIFOX_SCHEMA_CONFLICT", parseEnvConflict, diagnostics);
  for (const [key, value] of Object.entries(overrides)) {
    if (key === "configFile" || key === "token" || value === void 0 || key === "title") {
      continue;
    }
    config[key] = value;
    sources[key] = "cli";
  }
  if (overrides.title?.trim()) {
    config.title = overrides.title.trim();
    sources.title = "cli";
  }
  validateResolvedConfig(config, diagnostics);
  if (diagnostics.some((item) => item.level === "error")) {
    throw new ConfigError(diagnostics);
  }
  const token = overrides.token ?? env.API2APIFOX_TOKEN;
  const tokenSource = overrides.token ? "cli" : env.API2APIFOX_TOKEN ? "env:API2APIFOX_TOKEN" : void 0;
  return {
    config,
    sources,
    configFile: fs4.existsSync(configPath) ? configPath : void 0,
    token,
    tokenSource,
    diagnostics
  };
}
function validateKnownKeys(config, configPath, diagnostics) {
  const known = /* @__PURE__ */ new Set([
    "$schema",
    "title",
    "projectId",
    "apiBaseUrl",
    "endpointConflictBehavior",
    "schemaConflictBehavior",
    "include",
    "exclude",
    "exportPath",
    "pageTypeStyle",
    "folderNameSource",
    "rootFolderName",
    "schemaFolderId",
    "helperProperties",
    "dependencyRepos",
    "dependencyJars",
    "maxDependencyJars",
    "timeoutMs",
    "token"
  ]);
  for (const key of Object.keys(config)) {
    if (!known.has(key)) {
      invalid(`\u672A\u77E5\u914D\u7F6E\u5B57\u6BB5:${key}`, diagnostics, configPath);
    }
  }
  if (config.helperProperties !== void 0) {
    if (!isRecord(config.helperProperties) || Array.isArray(config.helperProperties)) {
      invalid("helperProperties \u5FC5\u987B\u662F\u5BF9\u8C61", diagnostics, configPath);
    } else {
      for (const key of Object.keys(config.helperProperties)) {
        if (key !== "enabled" && key !== "enumFieldDoc") {
          invalid(`\u672A\u77E5\u914D\u7F6E\u5B57\u6BB5:helperProperties.${key}`, diagnostics, configPath);
        }
      }
    }
  }
}
function readConfigFile(configPath, required, diagnostics) {
  if (!fs4.existsSync(configPath)) {
    if (required) {
      diagnostics.push({ level: "error", code: "CONFIG_NOT_FOUND", message: `\u914D\u7F6E\u6587\u4EF6\u4E0D\u5B58\u5728:${configPath}`, file: configPath });
    }
    return {};
  }
  try {
    const parsed = JSON.parse(fs4.readFileSync(configPath, "utf8"));
    if (!isRecord(parsed) || Array.isArray(parsed)) {
      invalid("\u914D\u7F6E\u6587\u4EF6\u6839\u8282\u70B9\u5FC5\u987B\u662F\u5BF9\u8C61", diagnostics, configPath);
      return {};
    }
    return parsed;
  } catch (error) {
    diagnostics.push({
      level: "error",
      code: "CONFIG_INVALID_JSON",
      message: `\u914D\u7F6E\u6587\u4EF6\u89E3\u6790\u5931\u8D25:${error instanceof Error ? error.message : String(error)}`,
      file: configPath
    });
    return {};
  }
}
function applyFile(config, sources, key, value, source) {
  if (value !== void 0) {
    config[key] = value;
    sources[key] = source;
  }
}
function applyEnv(config, sources, key, raw, envName, parser2, diagnostics) {
  if (raw === void 0) {
    return;
  }
  const value = parser2(raw);
  if (value === void 0) {
    invalid(`${envName} \u7684\u503C\u65E0\u6548:${raw}`, diagnostics);
    return;
  }
  config[key] = value;
  sources[key] = `env:${envName}`;
}
function validateResolvedConfig(config, diagnostics) {
  if (!Number.isInteger(config.projectId) || config.projectId < 0) {
    invalid("projectId \u5FC5\u987B\u662F\u5927\u4E8E\u7B49\u4E8E 0 \u7684\u6574\u6570", diagnostics);
  }
  if (!Number.isInteger(config.schemaFolderId) || config.schemaFolderId < 0) {
    invalid("schemaFolderId \u5FC5\u987B\u662F\u5927\u4E8E\u7B49\u4E8E 0 \u7684\u6574\u6570", diagnostics);
  }
  if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) {
    invalid("timeoutMs \u5FC5\u987B\u662F\u6B63\u6570", diagnostics);
  }
  if (!Number.isInteger(config.maxDependencyJars) || config.maxDependencyJars < 0) {
    invalid("maxDependencyJars \u5FC5\u987B\u662F\u5927\u4E8E\u7B49\u4E8E 0 \u7684\u6574\u6570", diagnostics);
  }
  try {
    const protocol = new URL(config.apiBaseUrl).protocol;
    if (protocol !== "http:" && protocol !== "https:") {
      invalid("apiBaseUrl \u53EA\u5141\u8BB8 http \u6216 https", diagnostics);
    }
  } catch {
    invalid("apiBaseUrl \u4E0D\u662F\u5408\u6CD5 URL", diagnostics);
  }
  if (!config.include.length) {
    invalid("include \u81F3\u5C11\u9700\u8981\u4E00\u4E2A glob", diagnostics);
  }
}
function invalid(message, diagnostics, file) {
  diagnostics.push({ level: "error", code: "CONFIG_INVALID", message, file });
}
function stringValue(value, name, diagnostics) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string") {
    invalid(`${name} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`, diagnostics);
    return void 0;
  }
  return value;
}
function numberValue(value, name, diagnostics) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    invalid(`${name} \u5FC5\u987B\u662F\u6570\u5B57`, diagnostics);
    return void 0;
  }
  return value;
}
function booleanValue(value, name, diagnostics) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "boolean") {
    invalid(`${name} \u5FC5\u987B\u662F\u5E03\u5C14\u503C`, diagnostics);
    return void 0;
  }
  return value;
}
function stringArrayValue(value, name, diagnostics) {
  if (value === void 0) {
    return void 0;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    invalid(`${name} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4`, diagnostics);
    return void 0;
  }
  return value;
}
function conflictValue(value, name, diagnostics) {
  return enumValue(value, name, CONFLICT_BEHAVIORS, diagnostics);
}
function enumValue(value, name, values2, diagnostics) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string" || !values2.includes(value)) {
    invalid(`${name} \u5FC5\u987B\u662F ${values2.join(" | ")}`, diagnostics);
    return void 0;
  }
  return value;
}
function parseEnvNumber(raw) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : void 0;
}
function parseEnvString(raw) {
  return raw;
}
function parseEnvConflict(raw) {
  return CONFLICT_BEHAVIORS.includes(raw) ? raw : void 0;
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function toPosix(value) {
  return value.replace(/\\/g, "/");
}

// ../../src/apifox/client.ts
var ApifoxApiError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};
var APIFOX_API_VERSION = "2024-03-28";
var ApifoxClient = class {
  constructor(baseUrl, token, apiVersion = APIFOX_API_VERSION, timeoutMs = 6e4, signal) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.apiVersion = apiVersion;
    this.timeoutMs = timeoutMs;
    this.signal = signal;
  }
  /**
   * 团队列表。GET /v1/teams(未在开放 API 文档中列出,但为官方客户端在用的有效端点;
   * 旧版 GET /v1/projects 已被 Apifox 下线,命中不存在的路由会 302 跳转帮助页)。
   */
  async listTeams() {
    const body = await this.request("GET", "/v1/teams");
    return extractList(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }
  /**
   * 指定团队下的项目列表。GET /v1/teams/{teamId}/projects。
   */
  async listTeamProjects(teamId) {
    const body = await this.request("GET", `/v1/teams/${teamId}/projects`);
    return extractList(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }
  /**
   * 当前令牌可见的全部项目:先取团队,再逐团队取项目合并。
   * 单个团队拉取失败不影响其余团队(仅跳过并在结果中缺失);
   * 全部失败时抛出首个错误,避免把接口异常误判为"令牌下没有项目"。
   */
  async listProjects() {
    const teams = await this.listTeams();
    let failed = 0;
    let firstError;
    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          const projects2 = await this.listTeamProjects(team.id);
          return projects2.map((p) => ({ ...p, teamName: team.name }));
        } catch (err) {
          failed++;
          firstError ??= err;
          return [];
        }
      })
    );
    const projects = results.flat();
    if (!projects.length && failed > 0 && teams.length > 0) {
      throw firstError instanceof Error ? firstError : new ApifoxApiError(`${failed} \u4E2A\u56E2\u961F\u7684\u9879\u76EE\u5217\u8868\u62C9\u53D6\u5931\u8D25`, 0);
    }
    return projects;
  }
  /**
   * 导入 OpenAPI 数据。input 为 OpenAPI JSON 序列化字符串。
   * 文档:https://apifox-openapi.apifox.cn 「导入 OpenAPI/Swagger 格式数据」
   */
  async importOpenapi(projectId, openapiJson, options = {}) {
    const body = await this.request(
      "POST",
      `/v1/projects/${projectId}/import-openapi`,
      { input: openapiJson, options }
    );
    return {
      counters: body?.counters ?? {},
      errors: body?.errors ?? []
    };
  }
  async request(method, path8, json) {
    const url = this.baseUrl.replace(/\/+$/, "") + path8;
    let res;
    let text;
    try {
      res = await fetch(url, {
        method,
        headers: {
          "X-Apifox-Api-Version": this.apiVersion,
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        body: json === void 0 ? void 0 : JSON.stringify(json),
        signal: combineAbortSignals(
          this.signal ? [this.signal, AbortSignal.timeout(this.timeoutMs)] : [AbortSignal.timeout(this.timeoutMs)]
        )
      });
      text = await res.text();
    } catch (err) {
      if (this.signal?.aborted) {
        const cancelled = new Error("\u64CD\u4F5C\u5DF2\u53D6\u6D88");
        cancelled.name = "AbortError";
        throw cancelled;
      }
      if (isAbortError(err)) {
        throw new ApifoxApiError(`\u8BF7\u6C42\u8D85\u65F6(${this.timeoutMs}ms):${url}`, 0);
      }
      throw new ApifoxApiError(formatNetworkFailure(url, err), 0);
    }
    if (res.redirected) {
      throw new ApifoxApiError(
        `\u8BF7\u6C42\u88AB\u91CD\u5B9A\u5411\u5230 ${res.url}(\u539F\u8DEF\u7531\u53EF\u80FD\u5DF2\u88AB Apifox \u4E0B\u7EBF\u6216\u8C03\u6574),\u8BF7\u68C0\u67E5 apiBaseUrl \u4E0E\u63D2\u4EF6\u7248\u672C`,
        res.status
      );
    }
    let payload;
    try {
      payload = text ? JSON.parse(text) : void 0;
    } catch {
    }
    if (!res.ok) {
      throw new ApifoxApiError(humanizeError(res.status, payload), res.status);
    }
    if (payload && typeof payload.code === "number" && payload.code !== 0) {
      throw new ApifoxApiError(humanizeError(res.status, payload), res.status);
    }
    return payload?.data ?? payload;
  }
};
function combineAbortSignals(signals) {
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  const listeners = [];
  let settled = false;
  const cleanup = () => {
    for (const { signal, listener } of listeners) {
      signal.removeEventListener("abort", listener);
    }
    listeners.length = 0;
  };
  const abortFrom = (source) => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    controller.abort(source.reason);
  };
  for (const signal of signals) {
    if (signal.aborted) {
      abortFrom(signal);
      break;
    }
    const listener = () => abortFrom(signal);
    listeners.push({ signal, listener });
    signal.addEventListener("abort", listener, { once: true });
  }
  return controller.signal;
}
function humanizeError(status, payload) {
  if (status === 401) {
    return "\u8BBF\u95EE\u4EE4\u724C\u65E0\u6548\u6216\u5DF2\u8FC7\u671F(401),\u8BF7\u7528\u300Capi2apifox: \u8BBE\u7F6E\u8BBF\u95EE\u4EE4\u724C\u300D\u91CD\u65B0\u914D\u7F6E";
  }
  if (status === 403) {
    return "\u4EE4\u724C\u6743\u9650\u4E0D\u8DB3\u6216\u4ED6\u4EBA\u6B63\u5728\u5BFC\u5165(403),\u8BF7\u7A0D\u540E\u91CD\u8BD5";
  }
  if (status === 404) {
    return "\u63A5\u53E3\u6216\u9879\u76EE\u4E0D\u5B58\u5728(404),\u8BF7\u68C0\u67E5\u9879\u76EE ID \u4E0E API \u5730\u5740";
  }
  const msg = payload?.message;
  return `Apifox \u5F00\u653E API \u8BF7\u6C42\u5931\u8D25(${status})${msg ? `: ${msg}` : ""}`;
}
function extractList(body, valid) {
  const arr = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [];
  return arr.filter(valid);
}
var MAX_ERROR_DEPTH = 6;
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function isLoopbackHost(host) {
  const normalized = host.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "localhost" || normalized === "::1" || normalized.startsWith("127.");
}
function describeNode(node) {
  const message = readText(node.message);
  const code = readText(node.code);
  if (!code || message.includes(code)) {
    return message;
  }
  return message ? `${message} ${code}` : code;
}
function loopbackEndpoint(node) {
  const host = readText(node.address) || readText(node.hostname);
  if (!host || !isLoopbackHost(host)) {
    return void 0;
  }
  return typeof node.port === "number" ? `${host}:${node.port}` : host;
}
function collectErrorChain(err) {
  const nodes = [];
  const seen = /* @__PURE__ */ new Set();
  const visit = (value, depth) => {
    if (depth > MAX_ERROR_DEPTH || !isRecord2(value) || seen.has(value)) {
      return;
    }
    seen.add(value);
    nodes.push({ name: readText(value.name), text: describeNode(value), loopback: loopbackEndpoint(value) });
    if (Array.isArray(value.errors)) {
      for (const sub of value.errors) {
        visit(sub, depth + 1);
      }
    }
    visit(value.cause, depth + 1);
  };
  visit(err, 0);
  return nodes;
}
function chainText(nodes, err) {
  return nodes.map((node) => node.text).filter(Boolean).join(": ") || String(err);
}
function formatNetworkFailure(url, err) {
  const nodes = collectErrorChain(err);
  let message = `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25(${url}):${chainText(nodes, err)}`;
  const localEndpoint = nodes.find((node) => node.loopback)?.loopback;
  const targetHost = hostOf(url);
  if (localEndpoint && targetHost && !isLoopbackHost(targetHost)) {
    message += `;\u9519\u8BEF\u5730\u5740 ${localEndpoint} \u662F\u672C\u673A\u7AEF\u53E3(\u76EE\u6807\u4E3A ${targetHost}),\u901A\u5E38\u662F IDE/\u7CFB\u7EDF\u4EE3\u7406\u672A\u542F\u52A8,\u8BF7\u68C0\u67E5\u4EE3\u7406\u8BBE\u7F6E\u540E\u91CD\u8BD5`;
  }
  return message;
}
function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return void 0;
  }
}
function isAbortError(err) {
  return collectErrorChain(err).some((node) => node.name === "TimeoutError" || node.name === "AbortError");
}

// ../../src/core/syncService.ts
async function syncProject(request) {
  const { config, analyzed } = request;
  const base = {
    dryRun: request.dryRun ?? false,
    target: { projectId: config.projectId, apiBaseUrl: config.apiBaseUrl },
    scope: { type: request.scopeType ?? "workspace", endpointCount: analyzed.endpoints.length },
    counters: {},
    errors: []
  };
  if (request.dryRun || !analyzed.endpoints.length) {
    return base;
  }
  const client = new ApifoxClient(config.apiBaseUrl, request.token, void 0, config.timeoutMs, request.signal);
  const imported = await client.importOpenapi(config.projectId, JSON.stringify(analyzed.spec), {
    targetSchemaFolderId: config.schemaFolderId > 0 ? config.schemaFolderId : void 0,
    endpointOverwriteBehavior: config.endpointConflictBehavior,
    schemaOverwriteBehavior: config.schemaConflictBehavior,
    deleteUnmatchedResources: false
  });
  return { ...base, counters: imported.counters, errors: imported.errors };
}
function hasImportFailures(result) {
  if (result.errors.length > 0) {
    return true;
  }
  return Object.entries(result.counters).some(([key, value]) => /Failed$/i.test(key) && value > 0);
}

// src/args.ts
var import_node_util = require("node:util");

// src/errors.ts
var CliError = class extends Error {
  constructor(code, message, exitCode, retryable = false, status, details) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.retryable = retryable;
    this.status = status;
    this.details = details;
  }
};
function toCliError(error) {
  if (error instanceof CliError) {
    return error;
  }
  if (error instanceof ConfigError) {
    return new CliError("CONFIG_INVALID", error.message, 2);
  }
  if (error instanceof ApifoxApiError) {
    if (error.status === 401) {
      return new CliError("APIFOX_AUTH_FAILED", error.message, 4, false, error.status);
    }
    if (error.status === 403 || error.status === 404) {
      return new CliError("APIFOX_FORBIDDEN", error.message, 4, false, error.status);
    }
    if (error.status === 0) {
      if (error.message.includes("\u8BF7\u6C42\u8D85\u65F6")) {
        return new CliError(
          "REQUEST_TIMEOUT",
          `${error.message}\u3002\u5BFC\u5165\u53EF\u80FD\u5DF2\u5728 Apifox \u670D\u52A1\u7AEF\u7EE7\u7EED\u6267\u884C\uFF0C\u8BF7\u5148\u67E5\u8BE2\u76EE\u6807\u9879\u76EE\u786E\u8BA4\u7ED3\u679C\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u8BD5\uFF0C\u4E0D\u8981\u7ACB\u5373\u91CD\u590D\u540C\u6B65`,
          5,
          true
        );
      }
      return new CliError("NETWORK_FAILED", error.message, 5, true);
    }
    return new CliError("APIFOX_REQUEST_FAILED", error.message, 5, error.status >= 500, error.status);
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new CliError("CANCELLED", "\u64CD\u4F5C\u5DF2\u53D6\u6D88", 130);
  }
  return new CliError("INTERNAL_ERROR", error instanceof Error ? error.message : String(error), 7);
}

// src/args.ts
var conflictBehaviors = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"];
var argumentOptions = {
  help: { type: "boolean", short: "h", default: false },
  version: { type: "boolean", short: "v", default: false },
  project: { type: "string", default: "." },
  config: { type: "string" },
  format: { type: "string", default: "text" },
  quiet: { type: "boolean", default: false },
  file: { type: "string", multiple: true, default: [] },
  endpoint: { type: "string", multiple: true, default: [] },
  output: { type: "string", short: "o" },
  stdout: { type: "boolean", default: false },
  force: { type: "boolean", default: false },
  "project-id": { type: "string" },
  token: { type: "string" },
  "dry-run": { type: "boolean", default: false },
  yes: { type: "boolean", short: "y", default: false },
  "no-report": { type: "boolean", default: false },
  "endpoint-conflict": { type: "string" },
  "schema-conflict": { type: "string" },
  include: { type: "string", multiple: true, default: [] },
  exclude: { type: "string", multiple: true, default: [] },
  "dependency-repo": { type: "string", multiple: true, default: [] },
  "dependency-jar": { type: "string", multiple: true, default: [] },
  "dependency-max-jars": { type: "string" },
  "timeout-ms": { type: "string" }
};
function parseCliArgs(argv) {
  const first2 = argv[0];
  const command = first2 && !first2.startsWith("-") ? first2 : void 0;
  if (command && !isCommand(command)) {
    throw new CliError("INVALID_ARGUMENT", `\u672A\u77E5\u547D\u4EE4:${command}`, 2);
  }
  const rest = command ? argv.slice(1) : argv;
  let parsed;
  try {
    parsed = (0, import_node_util.parseArgs)({
      args: rest,
      allowPositionals: false,
      strict: true,
      options: argumentOptions
    });
  } catch (error) {
    throw new CliError("INVALID_ARGUMENT", error instanceof Error ? error.message : String(error), 2);
  }
  const format = parsed.values.format;
  if (format !== "text" && format !== "json") {
    throw new CliError("INVALID_ARGUMENT", "--format \u53EA\u652F\u6301 text \u6216 json", 2);
  }
  const projectId = parsed.values["project-id"] === void 0 ? void 0 : parsePositiveInteger(parsed.values["project-id"], "--project-id");
  return {
    command,
    help: parsed.values.help ?? false,
    version: parsed.values.version ?? false,
    project: parsed.values.project ?? ".",
    projectSource: hasOption(rest, "--project") ? "cli" : "default",
    configFile: parsed.values.config,
    format,
    quiet: parsed.values.quiet ?? false,
    files: parsed.values.file ?? [],
    endpoints: parsed.values.endpoint ?? [],
    output: parsed.values.output,
    stdout: parsed.values.stdout ?? false,
    force: parsed.values.force ?? false,
    projectId,
    token: parsed.values.token,
    dryRun: parsed.values["dry-run"] ?? false,
    yes: parsed.values.yes ?? false,
    noReport: parsed.values["no-report"] ?? false,
    endpointConflictBehavior: parseConflict(parsed.values["endpoint-conflict"], "--endpoint-conflict"),
    schemaConflictBehavior: parseConflict(parsed.values["schema-conflict"], "--schema-conflict"),
    includes: parsed.values.include ?? [],
    excludes: parsed.values.exclude ?? [],
    dependencyRepos: parsed.values["dependency-repo"] ?? [],
    dependencyJars: parsed.values["dependency-jar"] ?? [],
    dependencyMaxJars: parsed.values["dependency-max-jars"] === void 0 ? void 0 : parseNonNegativeInteger(parsed.values["dependency-max-jars"], "--dependency-max-jars"),
    timeoutMs: parsed.values["timeout-ms"] === void 0 ? void 0 : parsePositiveInteger(parsed.values["timeout-ms"], "--timeout-ms")
  };
}
function hasOption(args, name) {
  return args.some((arg) => arg === name || arg.startsWith(`${name}=`));
}
function isCommand(value) {
  return value === "scan" || value === "export" || value === "sync" || value === "config";
}
function parsePositiveInteger(raw, option2) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new CliError("INVALID_ARGUMENT", `${option2} \u5FC5\u987B\u662F\u6B63\u6574\u6570`, 2);
  }
  return value;
}
function parseNonNegativeInteger(raw, option2) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new CliError("INVALID_ARGUMENT", `${option2} \u5FC5\u987B\u662F\u5927\u4E8E\u7B49\u4E8E 0 \u7684\u6574\u6570`, 2);
  }
  return value;
}
function parseConflict(raw, option2) {
  if (raw === void 0) {
    return void 0;
  }
  if (!conflictBehaviors.includes(raw)) {
    throw new CliError("INVALID_ARGUMENT", `${option2} \u7684\u503C\u65E0\u6548:${raw}`, 2);
  }
  return raw;
}

// src/output.ts
function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}
`);
}
function writeText(message) {
  process.stdout.write(`${message}
`);
}
function diagnosticMessages(diagnostics) {
  return diagnostics.map((item) => `${item.code}: ${item.message}`);
}

// src/report.ts
var import_node_child_process = require("node:child_process");
var fs5 = __toESM(require("node:fs"));
var os2 = __toESM(require("node:os"));
var path6 = __toESM(require("node:path"));

// ../../src/ui/syncPreflight.ts
var CONFLICT_LABELS = {
  OVERWRITE_EXISTING: "\u8986\u76D6\u5DF2\u6709\u5185\u5BB9",
  AUTO_MERGE: "\u81EA\u52A8\u5408\u5E76",
  KEEP_EXISTING: "\u4FDD\u7559\u5DF2\u6709\u5185\u5BB9\uFF08\u8DF3\u8FC7\u51B2\u7A81\uFF09",
  CREATE_NEW: "\u521B\u5EFA\u65B0\u5185\u5BB9"
};
function conflictBehaviorLabel(value) {
  return CONFLICT_LABELS[value] ?? value;
}

// ../../src/ui/syncResult.ts
var SUMMARY_CATEGORIES = [
  { category: "\u63A5\u53E3", base: "endpoint" },
  { category: "\u6570\u636E\u6A21\u578B", base: "schema" },
  { category: "\u63A5\u53E3\u76EE\u5F55", base: "endpointFolder" },
  { category: "\u6570\u636E\u6A21\u578B\u76EE\u5F55", base: "schemaFolder" }
];
function counterOf(counters, key) {
  const value = counters[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function toSummaryRows(counters) {
  const rows = [];
  for (const { category, base } of SUMMARY_CATEGORIES) {
    const created = counterOf(counters, `${base}Created`);
    const updated = counterOf(counters, `${base}Updated`);
    const ignored = counterOf(counters, `${base}Ignored`);
    const failed = counterOf(counters, `${base}Failed`);
    const total = created + updated + ignored + failed;
    if (total === 0 && base !== "endpoint" && base !== "schema") {
      continue;
    }
    rows.push({ category, created, updated, ignored, failed, total });
  }
  return rows;
}
function formatSyncTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function relativePath(file, root2) {
  const normalized = file.replace(/\\/g, "/");
  if (!root2) {
    return normalized;
  }
  return normalized.startsWith(root2 + "/") ? normalized.slice(root2.length + 1) : normalized;
}
function projectWebUrl(apiBaseUrl, projectId) {
  if (!(projectId > 0)) {
    return void 0;
  }
  try {
    const host = new URL(apiBaseUrl).hostname.toLowerCase();
    if (host === "api.apifox.com" || host === "apifox.com" || host === "www.apifox.com") {
      return `https://app.apifox.com/project/${projectId}`;
    }
  } catch {
  }
  return void 0;
}
function buildSyncReport(input) {
  const root2 = (input.workspaceRoot ?? "").replace(/\\/g, "/").replace(/\/+$/, "");
  const endpoints = input.endpoints.map((ep) => ({
    name: ep.summary?.trim() || ep.operationId,
    method: ep.method,
    path: ep.path,
    folder: input.folderOf(ep),
    controller: ep.controller,
    file: relativePath(ep.fsPath, root2),
    fsPath: ep.fsPath,
    startOffset: ep.methodRange?.startOffset
  }));
  return {
    projectId: input.projectId,
    projectUrl: input.projectUrl,
    target: input.target,
    scope: input.scope,
    finishedAt: formatSyncTime(input.finishedAt ?? /* @__PURE__ */ new Date()),
    conflict: `\u63A5\u53E3=${conflictBehaviorLabel(input.endpointConflictBehavior)}\uFF1B\u6570\u636E\u6A21\u578B=${conflictBehaviorLabel(
      input.schemaConflictBehavior
    )}`,
    summary: toSummaryRows(input.counters),
    endpoints,
    errors: input.errors.map((e) => e.message || e.code || "\u672A\u77E5\u9519\u8BEF"),
    warnings: [...input.warnings]
  };
}

// src/report.ts
function folderOfEndpoint(endpoint, resolved) {
  const key = resolved.config.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
  return resolved.config.rootFolderName.trim() ? `${resolved.config.rootFolderName.trim()}/${key}` : key;
}
function scopeLabel(type) {
  switch (type) {
    case "workspace":
      return "\u6574\u4E2A\u9879\u76EE";
    case "file":
      return "\u6307\u5B9A\u6587\u4EF6";
    case "endpoint":
      return "\u6307\u5B9A\u63A5\u53E3";
    case "selection":
      return "\u6307\u5B9A\u6587\u4EF6\u4E0E\u63A5\u53E3";
  }
}
function buildCliSyncReport(input) {
  const { synced, analyzed, resolved } = input;
  return buildSyncReport({
    counters: synced.counters,
    errors: synced.errors,
    warnings: analyzed.warnings,
    endpoints: analyzed.endpoints,
    target: `Apifox \u9879\u76EE\uFF08ID: ${synced.target.projectId}\uFF09`,
    projectId: synced.target.projectId,
    projectUrl: projectWebUrl(synced.target.apiBaseUrl, synced.target.projectId),
    scope: scopeLabel(synced.scope.type),
    endpointConflictBehavior: resolved.config.endpointConflictBehavior,
    schemaConflictBehavior: resolved.config.schemaConflictBehavior,
    folderOf: (endpoint) => folderOfEndpoint(endpoint, resolved),
    workspaceRoot: resolved.config.projectRoot
  });
}
function syncReportPath(projectId) {
  return path6.join(os2.tmpdir(), `api2apifox-sync-report-${projectId}.html`);
}
function renderReportHtml(report) {
  const data = JSON.stringify(report).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>api2apifox \u540C\u6B65\u7ED3\u679C</title>
<style>
  :root {
    --bg: #f6f8fa; --card: #ffffff; --fg: #1f2328; --muted: #59636e;
    --border: #d1d9e0; --hover: rgba(9, 105, 218, 0.06);
    --btn-bg: rgba(9, 105, 218, 0.08); --btn-fg: #0969da; --btn-hover: rgba(9, 105, 218, 0.16);
    --ok: #1a7f37; --info: #0969da; --warn: #9a6700; --error: #cf222e;
    --m-get: #0969da; --m-post: #1a7f37; --m-put: #9a6700; --m-delete: #cf222e; --m-patch: #8250df;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117; --card: #151b23; --fg: #e6edf3; --muted: #9198a1;
      --border: #3d444d; --hover: rgba(68, 147, 248, 0.12);
      --btn-bg: rgba(68, 147, 248, 0.15); --btn-fg: #4493f8; --btn-hover: rgba(68, 147, 248, 0.25);
      --ok: #3fb950; --info: #4493f8; --warn: #d29922; --error: #f85149;
      --m-get: #4493f8; --m-post: #3fb950; --m-put: #d29922; --m-delete: #f85149; --m-patch: #ab7df8;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--fg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; }
  .page { max-width: 1100px; margin: 0 auto; padding: 24px 20px 56px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; }
  .header-title { font-size: 18px; font-weight: 600; }
  .header-title .brand { font-size: 12px; font-weight: 400; color: var(--muted); margin-left: 8px; }
  .meta { display: grid; grid-template-columns: auto auto; gap: 2px 10px; font-size: 12px; }
  .meta .label { color: var(--muted); }
  .result-banner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid var(--border); border-left: 4px solid var(--ok); border-radius: 6px; background: var(--card); flex-wrap: wrap; }
  .result-banner.warning { border-left-color: var(--warn); }
  .result-banner.error { border-left-color: var(--error); }
  .result-title { font-size: 15px; font-weight: 600; }
  .result-detail { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .section { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; margin-bottom: 18px; }
  .section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
  .section-head h2 { font-size: 14px; font-weight: 600; }
  .count { color: var(--muted); font-weight: 400; margin-left: 6px; }
  .tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  button { background: var(--btn-bg); color: var(--btn-fg); border: none; border-radius: 5px; padding: 5px 12px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
  button:hover { background: var(--btn-hover); }
  button:focus-visible, input:focus-visible, th.sortable:focus-visible { outline: 2px solid var(--info); outline-offset: 1px; }
  button.primary { background: #1f6feb; color: #fff; }
  button.primary:hover { background: #388bfd; }
  @media (prefers-color-scheme: dark) { button.primary { background: #1f6feb; color: #fff; } }
  input[type="search"] { background: var(--bg); color: var(--fg); border: 1px solid var(--border); border-radius: 5px; padding: 5px 10px; font-size: 12.5px; min-width: 250px; font-family: inherit; }
  .copy-hint { color: var(--ok); font-size: 12px; opacity: 0; transition: opacity 0.2s; }
  .copy-hint.show { opacity: 1; }
  .table-wrap { width: 100%; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
  thead th { color: var(--muted); font-weight: 500; white-space: nowrap; position: sticky; top: 0; background: var(--card); }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--fg); }
  th .arrow { margin-left: 4px; font-size: 10px; }
  tbody tr:hover { background: var(--hover); }
  tbody tr:last-child td { border-bottom: none; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .cell-path { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; word-break: break-all; }
  .muted { color: var(--muted); }
  .badge { display: inline-block; min-width: 22px; text-align: center; border-radius: 4px; padding: 0 6px; font-size: 12px; }
  .badge.ok { background: rgba(26, 127, 55, 0.14); color: var(--ok); }
  .badge.info { background: rgba(9, 105, 218, 0.12); color: var(--info); }
  .badge.muted-badge { background: var(--hover); color: var(--muted); }
  .badge.error { background: rgba(207, 34, 46, 0.12); color: var(--error); }
  .method { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; font-weight: 600; }
  .method-get { color: var(--m-get); } .method-post { color: var(--m-post); } .method-put { color: var(--m-put); }
  .method-delete { color: var(--m-delete); } .method-patch { color: var(--m-patch); }
  ul.issues { list-style: none; }
  ul.issues li { padding: 6px 10px; border-left: 3px solid var(--warn); background: rgba(154, 103, 0, 0.08); margin-bottom: 6px; word-break: break-word; border-radius: 0 4px 4px 0; font-size: 13px; }
  ul.issues li.error { border-left-color: var(--error); background: rgba(207, 34, 46, 0.08); }
  .empty { color: var(--muted); padding: 10px 0; }
  .hidden { display: none; }
  .footer { color: var(--muted); font-size: 12px; text-align: center; margin-top: 26px; }
  @media (max-width: 720px) {
    .page { padding: 16px 12px 40px; }
    .header { flex-direction: column; }
    .meta { grid-template-columns: auto 1fr; width: 100%; }
    input[type="search"] { min-width: 180px; width: 100%; }
    #endpointTable th:nth-child(5), #endpointTable td:nth-child(5) { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-title">\u540C\u6B65\u7ED3\u679C<span class="brand">api2apifox</span></div>
    <div class="meta">
      <span class="label">\u76EE\u6807</span><span id="metaTarget">\u2014</span>
      <span class="label">\u8303\u56F4</span><span id="metaScope">\u2014</span>
      <span class="label">\u65F6\u95F4</span><span id="metaTime">\u2014</span>
      <span class="label">\u51B2\u7A81\u7B56\u7565</span><span id="metaConflict">\u2014</span>
    </div>
  </div>

  <div class="result-banner" id="resultBanner" role="status" aria-live="polite">
    <div>
      <div class="result-title" id="resultTitle">\u540C\u6B65\u5B8C\u6210</div>
      <div class="result-detail" id="resultDetail">\u6B63\u5728\u8BFB\u53D6\u540C\u6B65\u7ED3\u679C\u2026</div>
    </div>
    <button type="button" id="btnOpenProject" class="primary">\u5728 Apifox \u4E2D\u6253\u5F00\u9879\u76EE</button>
  </div>

  <div class="section">
    <div class="section-head">
      <h2>\u5BFC\u5165\u8BA1\u6570</h2>
      <div class="tools">
        <button type="button" id="btnCopySummary">\u590D\u5236\u6C47\u603B</button>
        <span class="copy-hint" id="summaryCopyHint" aria-live="polite">\u5DF2\u590D\u5236</span>
      </div>
    </div>
    <div class="table-wrap"><table id="summaryTable">
      <thead>
        <tr><th>\u5206\u7C7B</th><th class="num">\u65B0\u589E</th><th class="num">\u66F4\u65B0</th><th class="num">\u5FFD\u7565</th><th class="num">\u5931\u8D25</th><th class="num">\u5408\u8BA1</th></tr>
      </thead>
      <tbody></tbody>
    </table></div>
    <div class="empty hidden" id="summaryEmpty">Apifox \u672A\u8FD4\u56DE\u8BA1\u6570\u3002</div>
  </div>

  <div class="section hidden" id="issueSection">
    <div class="section-head"><h2>\u9700\u8981\u5173\u6CE8<span class="count" id="issueCount"></span></h2></div>
    <ul class="issues" id="issueList"></ul>
  </div>

  <div class="section">
    <div class="section-head">
      <h2>\u63A5\u53E3\u6E05\u5355<span class="count" id="endpointCount"></span></h2>
      <div class="tools">
        <input id="filter" type="search" placeholder="\u8FC7\u6EE4 \u540D\u79F0/\u65B9\u6CD5/\u8DEF\u5F84/\u76EE\u5F55/\u6587\u4EF6">
        <button type="button" id="btnCopyEndpoints">\u590D\u5236\u6E05\u5355 (TSV)</button>
        <button type="button" id="btnCopyMarkdown">\u590D\u5236 Markdown</button>
        <span class="copy-hint" id="endpointCopyHint" aria-live="polite">\u5DF2\u590D\u5236</span>
      </div>
    </div>
    <div class="table-wrap"><table id="endpointTable">
      <thead>
        <tr>
          <th class="sortable" data-key="name" tabindex="0">\u63A5\u53E3\u540D\u79F0</th>
          <th class="sortable" data-key="method" tabindex="0">\u65B9\u6CD5</th>
          <th class="sortable" data-key="path" tabindex="0">\u8DEF\u5F84</th>
          <th class="sortable" data-key="folder" tabindex="0">\u76EE\u5F55</th>
          <th class="sortable" data-key="file" tabindex="0">\u6E90\u6587\u4EF6</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table></div>
    <div class="empty hidden" id="endpointEmpty">\u6CA1\u6709\u63A5\u53E3\u3002</div>
    <div class="empty hidden" id="endpointFilteredEmpty">\u6CA1\u6709\u5339\u914D\u7684\u63A5\u53E3\u3002</div>
  </div>

  <footer class="footer">\u7531 api2apifox CLI \u751F\u6210 \xB7 \u8BA1\u6570\u6765\u81EA Apifox \u5BFC\u5165\u7ED3\u679C\uFF0C\u9010\u63A5\u53E3\u72B6\u6001 Apifox \u4E0D\u8FD4\u56DE</footer>
</div>

<script>
  var REPORT = ${data};
  var sortKey = "folder";
  var sortDir = 1;
  var keyword = "";

  function el(id) { return document.getElementById(id); }
  function setText(id, text) { el(id).textContent = text; }

  var METHOD_CLASS = { GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete", PATCH: "method-patch" };

  function badge(value, kind) {
    var span = document.createElement("span");
    span.className = "badge " + (value > 0 ? kind : "muted-badge");
    span.textContent = String(value);
    return span;
  }

  function numCell(value, kind) {
    var td = document.createElement("td");
    td.className = "num";
    td.appendChild(badge(value, kind));
    return td;
  }

  function renderSummary() {
    var tbody = el("summaryTable").querySelector("tbody");
    tbody.textContent = "";
    var rows = (REPORT && REPORT.summary) || [];
    el("summaryEmpty").classList.toggle("hidden", rows.length > 0);
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tr = document.createElement("tr");
      var name = document.createElement("td");
      name.textContent = row.category;
      tr.appendChild(name);
      tr.appendChild(numCell(row.created, "ok"));
      tr.appendChild(numCell(row.updated, "info"));
      tr.appendChild(numCell(row.ignored, "muted-badge"));
      tr.appendChild(numCell(row.failed, "error"));
      var total = document.createElement("td");
      total.className = "num muted";
      total.textContent = String(row.total);
      tr.appendChild(total);
      tbody.appendChild(tr);
    }
  }

  function renderResultBanner() {
    var endpoint = ((REPORT && REPORT.summary) || []).filter(function (row) { return row.category === "\u63A5\u53E3"; })[0] || { created: 0, updated: 0, ignored: 0, failed: 0 };
    var errorCount = (REPORT.errors || []).length;
    var warningCount = (REPORT.warnings || []).length;
    var failed = endpoint.failed + errorCount;
    var banner = el("resultBanner");
    banner.classList.toggle("error", failed > 0);
    banner.classList.toggle("warning", failed === 0 && warningCount > 0);
    setText("resultTitle", failed > 0 ? "\u540C\u6B65\u5B8C\u6210\uFF0C\u4F46\u5B58\u5728\u5931\u8D25\u9879" : warningCount > 0 ? "\u540C\u6B65\u5B8C\u6210\uFF0C\u6709\u9700\u8981\u5173\u6CE8\u7684\u8B66\u544A" : "\u540C\u6B65\u5B8C\u6210");
    var parts = ["\u63A5\u53E3\u65B0\u589E " + endpoint.created, "\u66F4\u65B0 " + endpoint.updated, "\u5FFD\u7565 " + endpoint.ignored];
    if (endpoint.failed > 0) { parts.push("\u5931\u8D25 " + endpoint.failed); }
    if (errorCount > 0) { parts.push("\u9519\u8BEF " + errorCount); }
    if (warningCount > 0) { parts.push("\u8B66\u544A " + warningCount); }
    setText("resultDetail", parts.join(" \xB7 "));
    el("btnOpenProject").classList.toggle("hidden", !REPORT.projectUrl);
  }

  function visibleEndpoints() {
    var all = (REPORT && REPORT.endpoints) || [];
    var kw = keyword.trim().toLowerCase();
    var filtered = kw
      ? all.filter(function (r) { return [r.name, r.method, r.path, r.folder, r.controller, r.file].join(" ").toLowerCase().indexOf(kw) >= 0; })
      : all.slice();
    filtered.sort(function (a, b) {
      var av = String(a[sortKey] || "");
      var bv = String(b[sortKey] || "");
      return av.localeCompare(bv, "zh-Hans-CN") * sortDir || a.path.localeCompare(b.path) * sortDir;
    });
    return filtered;
  }

  function renderEndpoints() {
    var tbody = el("endpointTable").querySelector("tbody");
    tbody.textContent = "";
    var all = (REPORT && REPORT.endpoints) || [];
    var rows = visibleEndpoints();
    el("endpointCount").textContent = keyword.trim()
      ? " \u5171 " + all.length + " \u4E2A\uFF0C\u7B5B\u51FA " + rows.length + " \u4E2A"
      : " \u5171 " + all.length + " \u4E2A";
    el("endpointEmpty").classList.toggle("hidden", all.length > 0);
    el("endpointFilteredEmpty").classList.toggle("hidden", !(all.length > 0 && rows.length === 0));

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tr = document.createElement("tr");

      var name = document.createElement("td");
      name.textContent = row.name;
      tr.appendChild(name);

      var method = document.createElement("td");
      var methodSpan = document.createElement("span");
      methodSpan.className = "method " + (METHOD_CLASS[row.method] || "");
      methodSpan.textContent = row.method;
      method.appendChild(methodSpan);
      tr.appendChild(method);

      var p = document.createElement("td");
      p.className = "cell-path";
      p.textContent = row.path;
      tr.appendChild(p);

      var folder = document.createElement("td");
      folder.textContent = row.folder;
      tr.appendChild(folder);

      var file = document.createElement("td");
      file.className = "cell-path";
      file.textContent = row.file;
      tr.appendChild(file);

      tbody.appendChild(tr);
    }

    var headers = document.querySelectorAll("#endpointTable th.sortable");
    for (var j = 0; j < headers.length; j++) {
      var th = headers[j];
      var existing = th.querySelector(".arrow");
      if (existing) { existing.remove(); }
      if (th.dataset.key === sortKey) {
        th.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending");
        var arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = sortDir > 0 ? "\u25B2" : "\u25BC";
        th.appendChild(arrow);
      } else {
        th.setAttribute("aria-sort", "none");
      }
    }
  }

  function renderIssues() {
    var list = el("issueList");
    list.textContent = "";
    var items = [];
    var errors = (REPORT && REPORT.errors) || [];
    var warnings = (REPORT && REPORT.warnings) || [];
    for (var i = 0; i < errors.length; i++) { items.push({ text: errors[i], error: true }); }
    for (var j = 0; j < warnings.length; j++) { items.push({ text: warnings[j], error: false }); }
    el("issueSection").classList.toggle("hidden", items.length === 0);
    setText("issueCount", items.length ? " \u5171 " + items.length + " \u9879" : "");
    for (var k = 0; k < items.length; k++) {
      var li = document.createElement("li");
      li.className = items[k].error ? "error" : "";
      li.textContent = items[k].text;
      list.appendChild(li);
    }
  }

  function render() {
    setText("metaTarget", REPORT.target);
    setText("metaScope", REPORT.scope);
    setText("metaTime", REPORT.finishedAt);
    setText("metaConflict", REPORT.conflict);
    renderResultBanner();
    renderSummary();
    renderEndpoints();
    renderIssues();
    document.title = "\u540C\u6B65\u7ED3\u679C \xB7 " + REPORT.target;
  }

  function summaryTsv() {
    var lines = ["\u5206\u7C7B\\t\u65B0\u589E\\t\u66F4\u65B0\\t\u5FFD\u7565\\t\u5931\u8D25\\t\u5408\u8BA1"];
    var rows = (REPORT && REPORT.summary) || [];
    for (var i = 0; i < rows.length; i++) {
      lines.push([rows[i].category, rows[i].created, rows[i].updated, rows[i].ignored, rows[i].failed, rows[i].total].join("\\t"));
    }
    return lines.join("\\n");
  }

  function endpointTsv() {
    var lines = ["\u63A5\u53E3\u540D\u79F0\\t\u65B9\u6CD5\\t\u8DEF\u5F84\\t\u76EE\u5F55\\t\u6E90\u6587\u4EF6"];
    var rows = visibleEndpoints();
    for (var i = 0; i < rows.length; i++) {
      lines.push([rows[i].name, rows[i].method, rows[i].path, rows[i].folder, rows[i].file].join("\\t"));
    }
    return lines.join("\\n");
  }

  // \u8868\u683C\u5355\u5143\u683C\u8F6C\u4E49:\u63A5\u53E3\u540D/\u8DEF\u5F84\u542B | \u6216\u6362\u884C\u4F1A\u7834\u574F Markdown \u8868\u7ED3\u6784
  // \u6CE8\u610F:\u6B64\u5904\u4F4D\u4E8E TS \u6A21\u677F\u5B57\u7B26\u4E32\u5185,\u53CD\u659C\u6760\u9700\u53CC\u5199(\u8F93\u51FA\u5230\u9875\u9762\u7684 JS \u624D\u662F\u5355\u659C\u6760)
  function mdCell(v) {
    return String(v == null ? "" : v).replace(/\\|/g, "\\\\|").replace(/[\\r\\n]+/g, " ");
  }

  function markdown() {
    var lines = ["## \u540C\u6B65\u7ED3\u679C", "", "- \u76EE\u6807\uFF1A" + REPORT.target, "- \u8303\u56F4\uFF1A" + REPORT.scope, "- \u65F6\u95F4\uFF1A" + REPORT.finishedAt, "- \u51B2\u7A81\u7B56\u7565\uFF1A" + REPORT.conflict, ""];
    lines.push("| \u5206\u7C7B | \u65B0\u589E | \u66F4\u65B0 | \u5FFD\u7565 | \u5931\u8D25 | \u5408\u8BA1 |", "| --- | ---: | ---: | ---: | ---: | ---: |");
    var rows = (REPORT && REPORT.summary) || [];
    for (var i = 0; i < rows.length; i++) {
      lines.push("| " + mdCell(rows[i].category) + " | " + rows[i].created + " | " + rows[i].updated + " | " + rows[i].ignored + " | " + rows[i].failed + " | " + rows[i].total + " |");
    }
    lines.push("", "| \u63A5\u53E3\u540D\u79F0 | \u65B9\u6CD5 | \u8DEF\u5F84 | \u76EE\u5F55 |", "| --- | --- | --- | --- |");
    var endpoints = visibleEndpoints();
    for (var j = 0; j < endpoints.length; j++) {
      lines.push("| " + mdCell(endpoints[j].name) + " | " + mdCell(endpoints[j].method) + " | " + mdCell(endpoints[j].path) + " | " + mdCell(endpoints[j].folder) + " |");
    }
    var errors = REPORT.errors || [];
    if (errors.length) {
      lines.push("", "**\u9519\u8BEF**");
      for (var k = 0; k < errors.length; k++) { lines.push("- " + errors[k]); }
    }
    var warnings = REPORT.warnings || [];
    if (warnings.length) {
      lines.push("", "**\u8B66\u544A**");
      for (var m = 0; m < warnings.length; m++) { lines.push("- " + warnings[m]); }
    }
    return lines.join("\\n");
  }

  // file:// \u4E0B clipboard API \u53EF\u80FD\u88AB\u62D2\u7EDD,\u9000\u56DE execCommand
  function copyText(text, label) {
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      if (ok) { showHint(label); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showHint(label); }, fallback);
    } else {
      fallback();
    }
  }

  function showHint(label) {
    var hint = el(label === "\u6C47\u603B" ? "summaryCopyHint" : "endpointCopyHint");
    hint.classList.add("show");
    setTimeout(function () { hint.classList.remove("show"); }, 1500);
  }

  el("filter").addEventListener("input", function (event) {
    keyword = event.target.value || "";
    renderEndpoints();
  });

  function applySort(target) {
    var th = target.closest ? target.closest("th.sortable") : null;
    if (!th) { return; }
    var key = th.dataset.key;
    if (sortKey === key) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    renderEndpoints();
  }

  document.querySelector("#endpointTable thead").addEventListener("click", function (event) {
    applySort(event.target);
  });
  document.querySelector("#endpointTable thead").addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      applySort(event.target);
    }
  });

  el("btnCopySummary").addEventListener("click", function () { copyText(summaryTsv(), "\u6C47\u603B"); });
  el("btnCopyEndpoints").addEventListener("click", function () { copyText(endpointTsv(), "\u63A5\u53E3\u6E05\u5355"); });
  el("btnCopyMarkdown").addEventListener("click", function () { copyText(markdown(), "\u63A5\u53E3\u6E05\u5355"); });
  el("btnOpenProject").addEventListener("click", function () {
    if (REPORT.projectUrl) { window.open(REPORT.projectUrl, "_blank", "noopener"); }
  });

  render();
</script>
</body>
</html>`;
}
function openInBrowser(target) {
  return new Promise((resolve6) => {
    const command = process.platform === "win32" ? `start "" "${target}"` : process.platform === "darwin" ? `open "${target}"` : `xdg-open "${target}"`;
    (0, import_node_child_process.exec)(command, { timeout: 5e3, windowsHide: true }, (error) => resolve6(!error));
  });
}
async function writeReportAndOpen(report) {
  const file = syncReportPath(report.projectId);
  try {
    await fs5.promises.writeFile(file, renderReportHtml(report), "utf8");
  } catch (error) {
    process.stderr.write(`api2apifox: \u540C\u6B65\u62A5\u544A\u5199\u5165\u5931\u8D25:${error instanceof Error ? error.message : String(error)}
`);
    return void 0;
  }
  if (!await openInBrowser(file)) {
    process.stderr.write(`api2apifox: \u65E0\u6CD5\u81EA\u52A8\u6253\u5F00\u6D4F\u89C8\u5668,\u8BF7\u624B\u52A8\u67E5\u770B\u540C\u6B65\u62A5\u544A:${file}
`);
  }
  return file;
}

// src/main.ts
var VERSION2 = require_package().version;
async function runCli(argv = process.argv.slice(2)) {
  const startedAt = Date.now();
  const requestedFormat = detectRequestedFormat(argv);
  let options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  process.once("SIGINT", abort);
  process.once("SIGTERM", abort);
  try {
    options = parseCliArgs(argv);
    if (options.version) {
      writeText(VERSION2);
      return 0;
    }
    if (options.help || !options.command) {
      writeText(helpText(options.command));
      return 0;
    }
    const resolved = resolveConfig(path7.resolve(options.project), configOverrides(options));
    let result;
    let warnings = [];
    switch (options.command) {
      case "config":
        result = configResult(resolved, options.projectSource);
        warnings = diagnosticMessages(resolved.diagnostics);
        break;
      case "scan": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        result = scanResult(analyzed, resolved);
        warnings = analyzed.warnings;
        break;
      }
      case "export": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        result = await exportResult(analyzed, resolved, options, controller.signal);
        warnings = analyzed.warnings;
        break;
      }
      case "sync": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        validateSyncConfig(resolved, options);
        if (!options.dryRun) {
          await confirmSync(resolved, analyzed, options);
        }
        const synced = await syncProject({
          config: resolved.config,
          token: resolved.token ?? "",
          analyzed,
          dryRun: options.dryRun,
          scopeType: scopeType(options),
          signal: controller.signal
        });
        result = synced;
        warnings = analyzed.warnings;
        if (!options.dryRun && !options.noReport) {
          const reportPath = await writeReportAndOpen(buildCliSyncReport({ synced, analyzed, resolved }));
          if (reportPath) {
            result = { ...synced, reportPath };
          }
        }
        if (hasImportFailures(synced)) {
          throw new CliError("IMPORT_PARTIAL_FAILURE", "Apifox \u5BFC\u5165\u5B8C\u6210\uFF0C\u4F46\u5B58\u5728\u5931\u8D25\u9879", 6, false, void 0, result);
        }
        break;
      }
    }
    outputSuccess(options, result, warnings, Date.now() - startedAt);
    return 0;
  } catch (error) {
    const cliError = toCliError(error);
    outputFailure(options, cliError, Date.now() - startedAt, requestedFormat);
    return cliError.exitCode;
  } finally {
    process.removeListener("SIGINT", abort);
    process.removeListener("SIGTERM", abort);
  }
}
async function analyzeSelected(resolved, options, signal) {
  return analyzeProject({
    config: resolved.config,
    files: options.files,
    endpoints: options.endpoints,
    signal
  });
}
function ensureEndpoints(analyzed, options) {
  if (analyzed.scannedFiles === 0) {
    throw new CliError("NO_JAVA_FILES", "\u6CA1\u6709\u626B\u63CF\u5230\u4EFB\u4F55 Java \u6E90\u6587\u4EF6\uFF0C\u8BF7\u68C0\u67E5 include/exclude \u914D\u7F6E", 3);
  }
  if (!analyzed.endpoints.length) {
    const code = options.files.length || options.endpoints.length ? "NO_ENDPOINT_MATCHED" : "NO_ENDPOINTS_FOUND";
    throw new CliError(code, "\u672A\u53D1\u73B0\u7B26\u5408\u8303\u56F4\u7684 REST \u63A5\u53E3", 3);
  }
}
function scanResult(analyzed, resolved) {
  const schemas = analyzed.spec.components?.schemas ?? {};
  return {
    projectRoot: analyzed.projectRoot,
    scannedFiles: analyzed.scannedFiles,
    skippedFiles: analyzed.skippedFiles,
    endpointCount: analyzed.endpoints.length,
    schemaCount: Object.keys(schemas).length,
    endpoints: analyzed.endpoints.map((endpoint) => ({
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      folder: folderOfEndpoint(endpoint, resolved),
      controller: endpoint.controller,
      file: relativeFile(analyzed.projectRoot, endpoint.fsPath),
      line: endpoint.methodRange?.startLine,
      flavor: endpoint.flavor
    }))
  };
}
async function exportResult(analyzed, resolved, options, signal) {
  if (options.stdout) {
    if (options.format === "json") {
      throw new CliError("INVALID_ARGUMENT", "--stdout \u4E0D\u80FD\u4E0E --format json \u540C\u65F6\u4F7F\u7528", 2);
    }
    process.stdout.write(`${JSON.stringify(analyzed.spec, null, 2)}
`);
    return { stdout: true, endpointCount: analyzed.endpoints.length };
  }
  const output = path7.resolve(resolved.config.projectRoot, options.output ?? resolved.config.exportPath);
  if (fs6.existsSync(output) && !options.force) {
    throw new CliError("OUTPUT_EXISTS", `\u8F93\u51FA\u6587\u4EF6\u5DF2\u5B58\u5728:${output}\uFF0C\u4F7F\u7528 --force \u8986\u76D6`, 2);
  }
  if (signal.aborted) {
    throw new CliError("CANCELLED", "\u64CD\u4F5C\u5DF2\u53D6\u6D88", 130);
  }
  await fs6.promises.mkdir(path7.dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs6.promises.writeFile(temporary, `${JSON.stringify(analyzed.spec, null, 2)}
`, "utf8");
    if (signal.aborted) {
      throw new CliError("CANCELLED", "\u64CD\u4F5C\u5DF2\u53D6\u6D88", 130);
    }
    await fs6.promises.rename(temporary, output);
  } catch (error) {
    await fs6.promises.rm(temporary, { force: true }).catch(() => void 0);
    throw error;
  }
  return {
    output,
    endpointCount: analyzed.endpoints.length,
    schemaCount: Object.keys(analyzed.spec.components?.schemas ?? {}).length
  };
}
function validateSyncConfig(resolved, options) {
  if (resolved.config.projectId <= 0) {
    throw new CliError("PROJECT_ID_REQUIRED", "sync \u9700\u8981 projectId\uFF0C\u53EF\u901A\u8FC7\u914D\u7F6E\u3001\u73AF\u5883\u53D8\u91CF\u6216 --project-id \u63D0\u4F9B", 2);
  }
  if (!options.dryRun && !resolved.token) {
    throw new CliError("TOKEN_REQUIRED", "sync \u9700\u8981 API2APIFOX_TOKEN \u73AF\u5883\u53D8\u91CF\u6216 --token", 2);
  }
}
async function confirmSync(resolved, analyzed, options) {
  if (options.yes) {
    return;
  }
  if (!import_node_process.stdin.isTTY || !import_node_process.stdout.isTTY) {
    throw new CliError("CONFIRMATION_REQUIRED", "\u975E\u4EA4\u4E92\u73AF\u5883\u6267\u884C\u540C\u6B65\u5FC5\u987B\u663E\u5F0F\u4F20\u5165 --yes", 2);
  }
  const prompt = `\u5C06 ${analyzed.endpoints.length} \u4E2A\u63A5\u53E3\u540C\u6B65\u5230 Apifox \u9879\u76EE ${resolved.config.projectId}\uFF0C\u7EE7\u7EED\uFF1F [y/N] `;
  const rl = readline.createInterface({ input: import_node_process.stdin, output: import_node_process.stdout });
  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    if (answer !== "y" && answer !== "yes") {
      throw new CliError("CANCELLED", "\u7528\u6237\u53D6\u6D88\u540C\u6B65", 130);
    }
  } finally {
    rl.close();
  }
}
function configResult(resolved, projectSource) {
  const fields = {};
  for (const [key, value] of Object.entries(resolved.config)) {
    if (key === "projectRoot") {
      fields[key] = { value, source: projectSource };
    } else {
      fields[key] = { value, source: resolved.sources[key] };
    }
  }
  fields.token = { configured: Boolean(resolved.token), source: resolved.tokenSource };
  return { configFile: resolved.configFile, fields };
}
function configOverrides(options) {
  return {
    configFile: options.configFile,
    token: options.token,
    projectId: options.projectId,
    endpointConflictBehavior: options.endpointConflictBehavior,
    schemaConflictBehavior: options.schemaConflictBehavior,
    include: options.includes.length ? options.includes : void 0,
    exclude: options.excludes.length ? options.excludes : void 0,
    dependencyRepos: options.dependencyRepos.length ? options.dependencyRepos : void 0,
    dependencyJars: options.dependencyJars.length ? options.dependencyJars : void 0,
    maxDependencyJars: options.dependencyMaxJars,
    exportPath: options.output,
    timeoutMs: options.timeoutMs
  };
}
function outputSuccess(options, result, warnings, durationMs) {
  if (options.command === "export" && options.stdout) {
    return;
  }
  if (options.format === "json") {
    const envelope = {
      schemaVersion: 1,
      ok: true,
      command: options.command ?? "help",
      version: VERSION2,
      durationMs,
      result,
      warnings
    };
    writeJson(envelope);
    return;
  }
  writeText(formatTextResult(options.command, result, options.quiet ? [] : warnings));
}
function outputFailure(options, error, durationMs, fallbackFormat) {
  if ((options?.format ?? fallbackFormat) === "json") {
    const envelope = {
      schemaVersion: 1,
      ok: false,
      command: options?.command ?? "unknown",
      version: VERSION2,
      durationMs,
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.retryable,
        details: error.details
      },
      warnings: []
    };
    writeJson(envelope);
    return;
  }
  process.stderr.write(`api2apifox: ${error.message}
`);
}
function formatTextResult(command, result, warnings) {
  const value = result;
  const warningText = warnings.length ? `
\u8B66\u544A:
${warnings.map((item) => `- ${item}`).join("\n")}` : "";
  if (command === "scan") {
    return `\u626B\u63CF\u5B8C\u6210: ${value.scannedFiles} \u4E2A Java \u6587\u4EF6\uFF0C${value.endpointCount} \u4E2A\u63A5\u53E3\uFF0C${value.schemaCount} \u4E2A\u6A21\u578B${warningText}`;
  }
  if (command === "export") {
    return `OpenAPI \u5DF2\u5BFC\u51FA\u5230 ${value.output}\uFF0C\u5171 ${value.endpointCount} \u4E2A\u63A5\u53E3${warningText}`;
  }
  if (command === "sync") {
    const sync = result;
    const base = sync.dryRun ? `\u540C\u6B65\u9884\u68C0\u5B8C\u6210:\u9879\u76EE ${sync.target.projectId}\uFF0C${sync.scope.endpointCount} \u4E2A\u63A5\u53E3\uFF0C\u672A\u5199\u5165 Apifox` : `\u540C\u6B65\u5B8C\u6210:\u9879\u76EE ${sync.target.projectId}\uFF0C${sync.scope.endpointCount} \u4E2A\u63A5\u53E3`;
    const reportText = sync.reportPath ? `
\u540C\u6B65\u62A5\u544A:${sync.reportPath}` : "";
    return `${base}${reportText}${warningText}`;
  }
  return `${JSON.stringify(result, null, 2)}${warningText}`;
}
function relativeFile(root2, file) {
  return path7.relative(root2, file).replace(/\\/g, "/");
}
function scopeType(options) {
  if (options.endpoints.length) {
    return options.files.length ? "selection" : "endpoint";
  }
  return options.files.length ? "file" : "workspace";
}
function detectRequestedFormat(argv) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--format=json" || argv[i] === "--format" && argv[i + 1] === "json") {
      return "json";
    }
  }
  return "text";
}
var DEFAULT_INCLUDE_TEXT = "**/src/main/java/**/*.java";
var DEFAULT_EXCLUDE_TEXT = "**/target/**\u3001**/build/**\u3001**/src/test/**\u3001**/sample/** \u7B49 5 \u9879";
var FILTER_HELP = `  --file <path>             \u53EA\u4FDD\u7559\u8BE5\u6E90\u6587\u4EF6\uFF08\u76F8\u5BF9\u9879\u76EE\u6839\u6216\u7EDD\u5BF9\u8DEF\u5F84\uFF09\u91CC\u7684\u63A5\u53E3\uFF0C\u53EF\u91CD\u590D
  --endpoint <METHOD PATH>  \u53EA\u4FDD\u7559\u8BE5\u63A5\u53E3\uFF0C\u5982 "GET /api/users"\uFF0C\u53EF\u91CD\u590D
  --include <glob>          \u626B\u63CF\u5305\u542B\u7684 glob\uFF0C\u53EF\u91CD\u590D\uFF1B\u4F20\u5165\u5373\u6574\u4F53\u66FF\u6362\u9ED8\u8BA4\u503C ${DEFAULT_INCLUDE_TEXT}
  --exclude <glob>          \u626B\u63CF\u6392\u9664\u7684 glob\uFF0C\u53EF\u91CD\u590D\uFF1B\u4F20\u5165\u5373\u6574\u4F53\u66FF\u6362\u9ED8\u8BA4\u503C ${DEFAULT_EXCLUDE_TEXT}`;
var COMMON_HELP = `  --project <dir>           \u9879\u76EE\u6839\u76EE\u5F55\uFF0C\u9ED8\u8BA4\u5F53\u524D\u76EE\u5F55
  --config <file>           \u914D\u7F6E\u6587\u4EF6\uFF0C\u9ED8\u8BA4 <project>/.api2apifox.json
  --format text|json        \u8F93\u51FA\u683C\u5F0F\uFF0C\u9ED8\u8BA4 text\uFF1Bjson \u65F6 stdout \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u4FE1\u5C01
  --quiet                   text \u6A21\u5F0F\u9690\u85CF\u975E\u81F4\u547D\u8B66\u544A\uFF1Bjson \u4FE1\u5C01\u5185\u5BB9\u4E0D\u53D8`;
var HELP_FLAG = `  -h, --help                \u663E\u793A\u5E2E\u52A9`;
var FILTER_NOTE = `\u8BF4\u660E:
  --file / --endpoint \u662F\u89E3\u6790\u540E\u8FC7\u6EE4\uFF0C\u4E0D\u4F1A\u51CF\u5C11\u626B\u63CF\u91CF\uFF1B\u60F3\u52A0\u5FEB\u901F\u5EA6\u8BF7\u7528 --include / --exclude \u6536\u655B\u8303\u56F4\u3002
  --include / --exclude \u4E0D\u662F\u8FFD\u52A0\uFF1A\u4F20\u5165\u5373\u6574\u4F53\u66FF\u6362\u9ED8\u8BA4\u5217\u8868\uFF0C\u9700\u8981\u4FDD\u7559\u9ED8\u8BA4\u8303\u56F4\u65F6\u8BF7\u663E\u5F0F\u5199\u5168\u3002`;
function helpText(command) {
  if (command) {
    return commandHelp(command);
  }
  return `api2apifox ${VERSION2}

\u7528\u6CD5:
  api2apifox <command> [options]

\u547D\u4EE4:
  scan     \u626B\u63CF Java \u9879\u76EE\u5E76\u8F93\u51FA\u63A5\u53E3\u6458\u8981\uFF08\u53EA\u8BFB\uFF0C\u4E0D\u8054\u7F51\uFF09
  export   \u751F\u6210 OpenAPI JSON \u6587\u4EF6\uFF08\u53EA\u8BFB\uFF0C\u4E0D\u8054\u7F51\uFF09
  sync     --dry-run \u9884\u68C0\uFF0C\u6216\u771F\u6B63\u540C\u6B65\u5230 Apifox
  config   \u8F93\u51FA\u6700\u7EC8\u914D\u7F6E\u53CA\u5176\u6765\u6E90\uFF08Token \u53EA\u663E\u793A\u662F\u5426\u5DF2\u914D\u7F6E\uFF09

\u516C\u5171\u53C2\u6570:
${COMMON_HELP}
${FILTER_HELP}
  --dependency-repo <dir>   \u989D\u5916\u7684\u672C\u5730 Maven \u4ED3\u5E93\u76EE\u5F55\uFF0C\u53EF\u91CD\u590D\uFF08\u4F20\u5165\u5373\u66FF\u6362\u914D\u7F6E\u503C\uFF09
  --dependency-jar <path>   \u663E\u5F0F\u4F9D\u8D56 jar \u7684\u7EDD\u5BF9\u8DEF\u5F84\uFF0C\u53EF\u91CD\u590D\uFF08\u4F20\u5165\u5373\u66FF\u6362\u914D\u7F6E\u503C\uFF09
  --dependency-max-jars <n> \u4F9D\u8D56 jar \u89E3\u6790\u603B\u6570\u4E0A\u9650\uFF0C\u9ED8\u8BA4 120\uFF1B0 \u8868\u793A\u4E0D\u505A\u4F9D\u8D56\u89E3\u6790
  --timeout-ms <ms>         Apifox \u8BF7\u6C42\u7B49\u5F85\u4E0A\u9650\uFF0C\u9ED8\u8BA4 300000
${HELP_FLAG}
  -v, --version             \u663E\u793A\u7248\u672C

\u9000\u51FA\u7801:
  0 \u6210\u529F        2 \u53C2\u6570/\u914D\u7F6E/\u786E\u8BA4\u9519\u8BEF   3 \u6CA1\u6709 Java \u6587\u4EF6\u6216\u76EE\u6807\u63A5\u53E3
  4 \u9274\u6743/\u6743\u9650   5 \u7F51\u7EDC/\u8D85\u65F6/\u670D\u52A1\u9519\u8BEF   6 \u5BFC\u5165\u90E8\u5206\u5931\u8D25
  7 \u672C\u5730 I/O \u6216\u5185\u90E8\u9519\u8BEF              130 \u53D6\u6D88

\u914D\u7F6E\u4F18\u5148\u7EA7: \u547D\u4EE4\u884C\u53C2\u6570 > API2APIFOX_* \u73AF\u5883\u53D8\u91CF > .api2apifox.json > \u9ED8\u8BA4\u503C

\u8FD0\u884C api2apifox <command> --help \u67E5\u770B\u8BE5\u547D\u4EE4\u7684\u5B8C\u6574\u53C2\u6570\u3002`;
}
function commandHelp(command) {
  switch (command) {
    case "scan":
      return `api2apifox scan [options]

\u626B\u63CF Java \u9879\u76EE\u5E76\u8F93\u51FA\u63A5\u53E3\u6458\u8981\u3002\u53EA\u8BFB\uFF1A\u4E0D\u5199\u6587\u4EF6\u3001\u4E0D\u8054\u7F51\u3002

\u9009\u9879:
${COMMON_HELP}
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}
  \u6CA1\u6709\u5339\u914D\u5230\u63A5\u53E3\u65F6\u9000\u51FA\u7801\u4E3A 3\u3002`;
    case "export":
      return `api2apifox export [options]

\u628A\u626B\u63CF\u7ED3\u679C\u5BFC\u51FA\u4E3A OpenAPI 3.0 JSON\u3002\u53EA\u8BFB\uFF1A\u4E0D\u8054\u7F51\u3002

\u9009\u9879:
${COMMON_HELP}
  -o, --output <file>       \u8F93\u51FA\u6587\u4EF6\uFF0C\u9ED8\u8BA4\u53D6\u914D\u7F6E exportPath\uFF08openapi.gen.json\uFF09
  --force                   \u76EE\u6807\u6587\u4EF6\u5DF2\u5B58\u5728\u65F6\u8986\u76D6
  --stdout                  \u628A OpenAPI \u76F4\u63A5\u5199\u5230 stdout\uFF08\u4E0D\u80FD\u4E0E --format json \u540C\u65F6\u4F7F\u7528\uFF09
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}`;
    case "sync":
      return `api2apifox sync [options]

\u628A\u63A5\u53E3\u540C\u6B65\u5230 Apifox\uFF1B\u52A0 --dry-run \u53EA\u9884\u68C0\u3001\u4E0D\u5199\u5165\u3002

\u9009\u9879:
${COMMON_HELP}
  --dry-run                 \u53EA\u9884\u68C0\uFF0C\u4E0D\u5199\u5165 Apifox\uFF08\u65E0\u9700 token\uFF09
  -y, --yes                 \u8DF3\u8FC7\u4EA4\u4E92\u786E\u8BA4\uFF1B\u975E\u4EA4\u4E92\u73AF\u5883\u5FC5\u987B\u663E\u5F0F\u4F20\u5165
  --no-report               \u4E0D\u751F\u6210\u5E76\u6253\u5F00\u540C\u6B65\u7ED3\u679C\u62A5\u544A\u9875\uFF08\u9ED8\u8BA4\u771F\u5B9E\u540C\u6B65\u540E\u5728\u6D4F\u89C8\u5668\u5F39\u51FA\u603B\u7ED3\uFF09
  --project-id <id>         \u76EE\u6807 Apifox \u9879\u76EE ID
  --token <token>           Apifox \u8BBF\u95EE\u4EE4\u724C\uFF0C\u63A8\u8350\u6539\u7528 API2APIFOX_TOKEN \u73AF\u5883\u53D8\u91CF
  --endpoint-conflict <\u6A21\u5F0F> \u63A5\u53E3\u51B2\u7A81\u5904\u7406\uFF1AOVERWRITE_EXISTING | AUTO_MERGE | KEEP_EXISTING | CREATE_NEW
  --schema-conflict <\u6A21\u5F0F>   \u6570\u636E\u6A21\u578B\u51B2\u7A81\u5904\u7406\uFF1A\u53D6\u503C\u540C\u4E0A
  --timeout-ms <ms>         \u7B49\u5F85\u4E0A\u9650\uFF0C\u9ED8\u8BA4 300000\uFF1B\u9996\u6B21\u5168\u91CF\u5BFC\u5165\u504F\u6162\uFF0C\u53EF\u8C03\u5927
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}
  \u8FD4\u56DE REQUEST_TIMEOUT \u8868\u793A\u672C\u5730\u5DF2\u505C\u6B62\u7B49\u5F85\uFF0C\u670D\u52A1\u7AEF\u53EF\u80FD\u4ECD\u5728\u5BFC\u5165\uFF1A\u8BF7\u5148\u67E5\u8BE2\u76EE\u6807\u9879\u76EE\u786E\u8BA4\u7ED3\u679C\uFF0C\u4E0D\u8981\u7ACB\u5373\u91CD\u8BD5\u3002`;
    case "config":
      return `api2apifox config [options]

\u8F93\u51FA\u6BCF\u4E2A\u914D\u7F6E\u5B57\u6BB5\u7684\u6700\u7EC8\u503C\u4E0E\u6765\u6E90\uFF08default / file:... / env:... / cli\uFF09\uFF0C
Token \u53EA\u663E\u793A\u662F\u5426\u5DF2\u914D\u7F6E\uFF0C\u4E0D\u8F93\u51FA\u660E\u6587\u3002

\u9009\u9879:
${COMMON_HELP}
${HELP_FLAG}`;
  }
}
if (require.main === module) {
  void runCli().then((code) => {
    process.exitCode = code;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildCliSyncReport,
  renderReportHtml,
  runCli,
  syncReportPath
});
/*! Bundled license information:

is-extglob/index.js:
  (*!
   * is-extglob <https://github.com/jonschlinkert/is-extglob>
   *
   * Copyright (c) 2014-2016, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

is-glob/index.js:
  (*!
   * is-glob <https://github.com/jonschlinkert/is-glob>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-number/index.js:
  (*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

to-regex-range/index.js:
  (*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

fill-range/index.js:
  (*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

queue-microtask/index.js:
  (*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

run-parallel/index.js:
  (*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
//# sourceMappingURL=cli.js.map

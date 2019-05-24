/*
 * Multi Entry Unit
 */

var multiEntryMap = {};

function removeRow(unitID, rowID) {
    var lastIndex = multiEntryMap[unitID + "LastIndex"];
    var lastID = unitID + "[" + lastIndex + "]";
    var row = document.getElementById(rowID);
    var ds = document.getElementById(unitID + "DataSize");
    var size = Number(ds.getAttribute("value"));
    if (size > 1) {
        var pRow = row.previousSibling;
        while (pRow && !pRow.id) {
            pRow = pRow.previousSibling;
        }
        if (!pRow) {
            var nextRow = row.nextSibling;

            while (nextRow && !nextRow.id) {
                nextRow = nextRow.nextSibling;
            }
            var nextHeader = document.getElementById(nextRow.id + "Header");
            if (navigator.product === "Gecko") {
                nextHeader.style.display = "table-row";
            } else {
                nextHeader.style.display = "inline";
            }
        }
        row.parentNode.removeChild(row);
        size--;
        ds.setAttribute("value", size);

        if (lastID === rowID) {
            lastIndex--;
            lastID = unitID + "[" + lastIndex + "]";
            while (!document.getElementById(lastID)) {
                lastIndex--;
                lastID = unitID + "[" + lastIndex + "]";
            }
        }
    }
    multiEntryMap[unitID + "LastIndex"] = lastIndex;
}

function addRow(unitID) {
    var lastIndex = multiEntryMap[unitID + "LastIndex"];
    var lastRowId = unitID + "[" + lastIndex + "]";
    var lastRow = document.getElementById(lastRowId);
    if (!lastRow) {
        lastIndex = 0;
        lastRowId = unitID + "[0]";
        lastRow = document.getElementById(lastRowId);
    }
    var mainDiv = document.getElementById(unitID);
    var newRowId = unitID + "[" + (++lastIndex) + "]";
    var temp = lastRow.innerHTML;
    while (temp.indexOf(lastRowId) > 0) {
        temp = temp.replace(lastRowId, newRowId);
    }
    var newDiv = document.createElement("div");
    newDiv.setAttribute("id", newRowId);
    while (temp.indexOf("selected") > 0) {
        temp = temp.replace("selected", "");
    }
    if (jQuery.datepicker && jQuery.datepicker.markerClassName) {
        while (temp.indexOf(jQuery.datepicker.markerClassName) > 0) {
            temp = temp.replace(jQuery.datepicker.markerClassName, "");
        }
    }
    mainDiv.appendChild(newDiv);
    newDiv.innerHTML = temp;
    if (jQuery.datepicker && jQuery.datepicker._triggerClass) {
        jQuery("."+jQuery.datepicker._triggerClass, newDiv).remove();
    }
    jQuery(newDiv).find("script").each(function() {
        if (this.src) {
            jQuery.ajax({type: "GET", global: false, url: this.src, async: false, dataType: "script"});
        } else {
            jQuery.globalEval((this.text || this.textContent || this.innerHTML || "").replace(/^\s*<!(?:\[CDATA\[|\-\-)/, "/*$0*/"));
        }
    });
    var ds = document.getElementById(unitID + "DataSize");
    var size = Number(ds.getAttribute("value")) + 1;
    ds.setAttribute("value", size);
    if (size >= 2) {
        var header = document.getElementById(newRowId + "Header");
        if (header) {
            header.style.display = "none";
        }
    }
    var inputs = document.getElementsByTagName("input");
    if (inputs) {
        for ( var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var name = input.getAttribute("name");
            var type = input.getAttribute("type");
            if (name && name.indexOf(newRowId) > -1 && type !== "radio" && type !== "checkbox") {
                input.setAttribute("value", "");
            }
        }
    }
    multiEntryMap[unitID + "LastIndex"] = lastIndex;
}

/*
 * Checkable units
 */

var multiChoiceMap = {};

function toggleCheckboxes(layoutId, suffix) {
    var key = multiChoiceMap[layoutId];
    var returnValue = false;
    var unitId = layoutId.substring(0, layoutId.indexOf("_"));
    var fields = document.getElementsByName(unitId + suffix);
    for ( var i = 0; i < fields.length; i++) {
        if ((!key || key === "all") && fields[i].id.substring(0, fields[i].id.lastIndexOf("_")) == layoutId) {
            fields[i].checked = true;
        } else if (key === "none" && fields[i].id.substring(0, fields[i].id.lastIndexOf("_")) == layoutId) {
            fields[i].checked = false;
        }
    }
    if ((!key || key === "all")) {
        key = "none";
        if (jQuery("#" + layoutId + "image")[0]) {
            jQuery("#" + layoutId + "image")[0].className = "unSelectAll";
        }
    } else {
        key = "all";
        if (jQuery("#" + layoutId + "image")[0]) {
            jQuery("#" + layoutId + "image")[0].className = "selectAll";
        }
    }
    multiChoiceMap[layoutId] = key;
    return returnValue;
}

/*
 *Deprecated: use toggleCheckboxes(layoutId, suffix)
 */  
function checkall(unit, index, suffix, anchor, selectAll, unselectAll) {
    var key = multiChoiceMap[unit + "_" + index];
    var returnValue = false;
    var fields = document.getElementsByName(unit + suffix);
    for ( var i = 0; i < fields.length; i++) {
        if ((!key || key === "all") && fields[i].id.substring(fields[i].id.indexOf("_") + 1, fields[i].id.lastIndexOf("_")) == index) {
            fields[i].checked = true;
        } else if (key === "none" && fields[i].id.substring(fields[i].id.indexOf("_") + 1, fields[i].id.lastIndexOf("_")) == index) {
            fields[i].checked = false;
        }
    }
    if ((!key || key === "all")) {
        key = "none";
        if (jQuery("#" + unit + index + "image")[0]) {
            jQuery("#" + unit + index + "image")[0].className = "unSelectAll";
        }
        if (anchor) {
            if (anchor.tagName.toLowerCase() === "a") {
                anchor.innerHTML = unselectAll;
            } else if (anchor.tagName.toLowerCase() === "input") {
                returnValue = true;
            }
        }
    } else {
        key = "all";
        if (jQuery("#" + unit + index + "image")[0]) {
            jQuery("#" + unit + index + "image")[0].className = "selectAll";
        }
        if (anchor) {
            if (anchor.tagName.toLowerCase() === "a") {
                anchor.innerHTML = selectAll;
            } else if (anchor.tagName.toLowerCase() === "input") {
                returnValue = true;
            }
        }
    }
    multiChoiceMap[unit + "_" + index] = key;
    return returnValue;
}



/*
 * Multi Selection Fields
 */

function selectAll(fieldName, status) {
    
    function triggerEventNoDefault($target, type) {
        var evt = new jQuery.Event(type);
        evt.preventDefault();
        $target.trigger(evt);
    }
    
    var $elements = jQuery(":input[name='" + fieldName + "']");
    var $checkboxes = $elements.filter(":checkbox");
    if ($checkboxes.length > 0) {
        $checkboxes.prop("checked", status);
        triggerEventNoDefault($checkboxes.eq(0), "click");
    }
    var $select = $elements.filter("select[multiple]");
    if ($select.length > 0) {
        $select.find("option").prop("selected", status);
        triggerEventNoDefault($select, "change");
    }
}

/*
 * Browser Integration
 */

jQuery(function() {
    var $div = jQuery("#_wr_page");
    if ($div[0] && typeof WebRatio === "undefined" && typeof InstallTrigger === "object") {
        $div.text("WebRatio Browser Integration is enabled, but your browser is missing the required plugin: click here to install it.");
        $div.addClass("_wr_banner");
        $div.removeAttr("title");
        $div.click(function() {
            window.open("http://downloads.webratio.com/browsercontrol");
        });
    }
});

/*
 * Other
 */

jQuery(document).on("keypress", ":text, :password", function(event) {
    if (event.keyCode !== 13 || event.isDefaultPrevented()) {
        return;
    }
    
    var buttonIds = null;
    var classAttr = jQuery(event.target).attr("class");
    jQuery.each(classAttr.split(/\s+/), function(i, cl) {
        var m = /wr-submitButtons:(\S+)/.exec(cl);
        if (m) {
            buttonIds = m[1].split(",");
            return false;
        }
    });
    
    if (buttonIds && buttonIds.length > 0) {
        event.preventDefault();
        clickButton(buttonIds.join("|"));
    }
});

function clickButton(ids) {
    jQuery.each(ids.split("|"), function(i, id) {
        var $button = jQuery("#button\\#" + id + ":enabled, #button\\:" + id + ":enabled");
        if ($button[0]) {
            $button[0].click();
            return false;
        }
    });
}

function setWindowLocation(location) {
    if (/(msie) ([\w.]+)/.test(navigator.userAgent.toLowerCase())) {
        if (!/^http:\/\/|^\//.test(location)) {
            var baseHref = jQuery("base").attr("href");
            if (baseHref) {
                if (baseHref.substr(baseHref.length - 1) !== "/") {
                    location = baseHref + "/" + location;
                } else {
                    location = baseHref + location;
                }
            }
        }
    }
    if (typeof wr !== "undefined") {
        wr.LegacyAjaxPlugin.navigateLocation(location, null);
    } else {
        window.location.href = location;
    }
}

(function() {
    window.PatternConverter = (function(){
        var JAVA_PATTERN_SYMBOLS = "GyMwWDdFEaHkKhmsSzZ";
            
        var PatternConverter = function(rules) {
            var internalRules = {};
            var symbols = JAVA_PATTERN_SYMBOLS;
            iterate(rules || {}, function(symbol, translation) {
                if (symbol.length != 1) {
                    throw new Error("Symbols must be single characters");
                } else if (symbols.indexOf(symbol) >= 0) {
                    symbols += symbol;
                }
                internalRules[symbol] = makeTranslationArray(translation);
            });
            this._tokenExpr = new RegExp(["([", symbols.replace(/([\]\^])/g, "\\$1"), "]+)|(.)"].join(""), "g");
            this._rules = internalRules;
        }
        
        PatternConverter.prototype.convert = function(javaPattern, callback) {
            var result = [], m;
            this._tokenExpr.lastIndex = 0;
            while (m = this._tokenExpr.exec(javaPattern)) {
                var symbolTxt = m[1], symbol = symbolTxt && symbolTxt.charAt(0), symbolLen = symbolTxt && symbolTxt.length, value = m[2];
                if (symbol) {
                    if (callback) {
                        callback(symbol, symbolLen);
                    }
                    var rule = this._rules[symbol];
                    value = rule ? (rule[symbolLen] || rule[0]) : value;
                }
                if (value) {
                    result.push(value);
                }
            }
            return result.join("");
        };
        
        PatternConverter.prototype.indexOfFirstRule = function(javaPattern) {
            return this._indexOfRule(javaPattern, false);
        };
        
        PatternConverter.prototype.indexOfLastRule = function(javaPattern) {
            return this._indexOfRule(javaPattern, true);
        };
        
        PatternConverter.prototype._indexOfRule = function(javaPattern, last) {
            var index = -1, m;
            this._tokenExpr.lastIndex = 0;
            while (m = this._tokenExpr.exec(javaPattern)) {
                if (m[1] && this._rules[m[1][0]]) {
                    index = m.index + (last ? m[1].length : 0);
                    if (!last) {
                        break;
                    }
                }
            }
            return index;
        };
        
        function makeTranslationArray(tr) {
            if (typeof tr === "string") {
                return [ tr ];
            } else if (typeof tr === "object") {
                var arr = [];
                iterate(tr, function(range, subTranslation) {
                    if (!/^(?:\d+(?:,\d+)?)?|%$/.test(range)) {
                        throw new Error("Invalid symbol range");
                    }
                    if (range === "%") {
                        var repeated = "";
                        for (var i = 1; i <= 6; i++) {
                            repeated += subTranslation;
                            arr[i] = "" + repeated; // workaround for IE9 string mutability bug
                        }
                    } else {
                        var nums = range ? range.split(",") : [0, 0];
                        nums = [ Number(nums[0]), Number(nums[1] || nums[0]) ];
                        for (var i = nums[0]; i <= nums[1]; i++) {
                            arr[i] = subTranslation;
                        }
                    }
                });
                return arr;
            }
            throw new Error("Invalid translation object");
        }

        function iterate(o, callback) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    callback.call(o, k, o[k]);
                }
            }
        }

        return PatternConverter;
    })();
    
    if (typeof patternConverterWaiters === "object") {
        for (var i = 0; i < patternConverterWaiters.length; i++) {
            patternConverterWaiters[i]();
        }
        delete patternConverterWaiters;
    }
})();

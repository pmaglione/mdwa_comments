(function($) {

    /*
     * Pattern converters for jQuery UI Datepicker and Richardson Timepicker
     */

    function defineConverter() {
        var dateRules = {
            y: {"1,2": "y", "": "yy"},
            M: {"1": "m", "2": "mm", "3": "M", "": "MM"},
            D: {"%": "o"},
            d: {"%": "d"},
            E: {"1,3": "D", "": "DD"}
        };
        var timeRules = {
            a: "TT",
            H: {"%": "H"},
            h: {"%": "h"},
            K: {"%": "h"},
            m: {"%": "m"},
            s: {"%": "s"},
            S: {"%": "l"}
        };
        var escapeRules = {
            "@": "'@'",
            "!": "'!'",
            "'": "''"
        };

        var dateConverter = new PatternConverter($.extend({}, dateRules, escapeRules));
        var timeConverter = new PatternConverter($.extend({}, timeRules, escapeRules));

        var dateConfigFromJava = function(pattern) {
            return {
                dateFormat: dateConverter.convert(pattern)
            };
        };

        var timeConfigFromJava = function(pattern) {
            var ampm = false;
            var timeFormat = timeConverter.convert(pattern, function(symbol) {
                if (symbol === "h") {
                    ampm = true;
                }
            });
            return {
                timeFormat: timeFormat,
                ampm: ampm
            };
        };

        var datetimeConfigFromJava = function(pattern) {
            var index1 = timeConverter.indexOfFirstRule(pattern);
            var len = pattern.length;
            if (index1 < 0) {
                index1 = len;
            }
            var index0 = dateConverter.indexOfLastRule(pattern.slice(0, index1));
            if (index0 < 0) {
                index0 = index1;
            }
            var datePattern = pattern.substring(0, index0);
            var separator = pattern.substring(index0, index1);
            var timePattern = pattern.substring(index1, len);

            var dateConfig = datePattern ? dateConfigFromJava(datePattern) : {};
            var timeConfig = timePattern ? timeConfigFromJava(timePattern) : {};

            var config = $.extend({
                separator: separator
            }, dateConfig, timeConfig);
            return config;
        };

        $.wr = $.wr || {};

        $.wr.calendar = $.wr.calendar || {};

        $.wr.calendar.dateConfigFromJava = dateConfigFromJava;
        $.wr.calendar.timeConfigFromJava = timeConfigFromJava;
        $.wr.calendar.timestampConfigFromJava = datetimeConfigFromJava;
    }

    if (typeof PatternConverter === "undefined") {
        if (typeof patternConverterWaiters === "undefined") {
            patternConverterWaiters = [];
        }
        patternConverterWaiters.push(defineConverter);
    } else {
        defineConverter();
    }

})(jQuery);

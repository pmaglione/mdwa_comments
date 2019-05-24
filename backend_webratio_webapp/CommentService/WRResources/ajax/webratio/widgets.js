(function($) {

    /*
     * Autocomplete
     */

    $.widget("ui.wrAutocomplete", $.ui.autocomplete, {

        options: $.extend({}, $.ui.autocomplete.prototype.options, {
            source: function(request, setData) {
                runScopedRequest(this.element[0], this.options.wrAction, null, {
                    extraInputs: this._getTermInputs(request),
                    responseType: wr.nav.ResponseType.JSON,
                    dataHandler: setData
                });
            },
            wrTokens: null,
            wrAction: null,
            wrTermFieldName: null,
            wrIdElement: null,
            wrSelect: null,
            wrAfterSelect: null
        }),

        _useTokens: false,

        _tokensRE: null,

        _lastSelectedItem: null,

        _create: function() {
            this._setOptions(this.options);
            this._super();
            this._initTokensRE();

            var handlers = {}, prefix = this.widgetEventPrefix.toLowerCase();
            handlers[prefix + "focus"] = this._focusExt;
            handlers[prefix + "select"] = this._selectExt;
            handlers[prefix + "close"] = this._closeExt;
            this._on(handlers);
        },

        _setOptions: function(options) {
            this._super(this._alterOptions(options));
            this._initTokensRE();
        },

        _alterOptions: function(options) {
            var thisWidget = this;
            var current = this.options;
            var altered = {};
            var useTokens = (options.wrTokens && options.wrTokens.length > 0) || this._useTokens;
            if (useTokens !== this._useTokens) {
                optiosn = $.extend({}, options, {
                    source: current.source
                });
            }
            if (useTokens) {
                if (options.source) {
                    var originalSource = options.source;
                    altered.source = function() {
                        return thisWidget._sourceExt.apply(thisWidget, $.makeArray(arguments).concat(originalSource, this));
                    };
                    altered.source._originalSource = originalSource;
                }
            } else if (this._useTokens) {
                altered.source = current.source._originalSource;
            }
            this._useTokens = useTokens;
            return altered;
        },

        _initTokensRE: function() {
            var escapeRegex = $.ui.autocomplete.escapeRegex;
            var tokens = this.options.wrTokens;
            if (this._useTokens && tokens && tokens.length > 0) {
                this._tokensRE = new RegExp("\\s*(?:" + $.map(tokens, function(t) {
                    return escapeRegex(t);
                }).join("|") + ")+\\s*", "g");
            } else {
                this._tokensRE = null;
            }
        },

        _sourceExt: function(request, response, source, sourceContext) {
            var input = this.element[0];
            var bounds = this._getTokenBounds(request.term, this._getCaretPos(input));
            request.term = request.term.substring(bounds[0], bounds[1]);
            if (request.term.length < this.options.minLength) {
                return response({});
            }
            if (typeof source === "function") {
                return source.call(sourceContext, request, response);
            }
            return response(source);
        },

        _focusExt: function(event, ui) {
            if (this._useTokens) {
                event.preventDefault();
            }
        },

        _selectExt: function(event, ui) {
            this._lastSelectedItem = ui.item;
            if (this._useTokens) {
                event.preventDefault();
                var input = this.element[0], value = input.value;
                var bounds = this._getTokenBounds(value, this._getCaretPos(input));
                input.value = value.substring(0, bounds[0]) + ui.item.value + value.substring(bounds[1], value.length);
                this._setCaretPos(input, bounds[0] + ui.item.value.length);
                return;
            }
            if (this.options.wrIdElement) {
                $(this.options.wrIdElement).val(ui.item.wrId);
            }
            if (typeof this.options.wrSelect === "function") {
                event.preventDefault();
                this.options.wrSelect.call(this, this._createListItem(ui.item));
                return;
            }
        },

        _closeExt: function(event, ui) {
            var item = this._lastSelectedItem;
            if (item) {
                this._lastSelectedItem = null;
                if (typeof this.options.wrAfterSelect === "function") {
                    this.options.wrAfterSelect.call(this, this.element[0], this._createListItem(item));
                }
            }
        },

        _getTokenBounds: function(value, pos) {
            var bounds = [ 0, value.length ];
            var re = this._tokensRE, m;
            if (re) {
                while (m = re.exec(value)) {
                    if (m.index >= pos) {
                        bounds[1] = m.index;
                        break;
                    } else if (m.index < pos) {
                        bounds[0] = m.index + m[0].length;
                        if (bounds[0] > pos) {
                            bounds = [ 0, 0 ];
                            break;
                        }
                    }
                }
                re.lastIndex = 0;
            }
            return bounds;
        },

        _getCaretPos: function(input) {
            if (typeof input.selectionStart === "number") {
                return input.selectionStart;
            } else if (document.selection && document.selection.createRange) {
                var range = document.selection.createRange();
                var rangeLen = document.selection.createRange().text.length;
                range.moveStart("character", -input.value.length);
                return range.text.length - rangeLen;
            }
            return input.value.length;
        },

        _setCaretPos: function(input, pos) {
            if (typeof input.setSelectionRange === "function") {
                input.setSelectionRange(pos, pos, "none");
            } else if (typeof input.createTextRange === "function") {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd("character", pos);
                range.moveStart("character", pos);
                range.select();
            }
        },

        _getTermInputs: function(request) {
            var inputs = {};
            inputs[this.options.wrTermFieldName || this.element.attr("name")] = request.term;
            return inputs;
        },

        _createListItem: function(item) {
            return $("<li>").attr("id", item.wrId).text(item.value);
        }

    });

    /*
     * Tooltip
     */

    $.widget("ui.wrTooltip", $.ui.tooltip, {

        options: $.extend({}, $.ui.tooltip.prototype.options, {
            items: ".wr-tooltipTarget",
            content: function(setContent) {
                runScopedRequest(this, $(this).data("tooltip-action"), null, {
                    dataHandler: function(html) {
                        setContent(sanitizeHTML(html));
                    }
                });
            },
            wrEvents: [ [ "mouseover", "mouseleave" ], [ "focusin", "focusout" ] ],
            position: {
                my: "left top-25%",
                at: "right+50 top"
            },
            show: {
                effect: "fade",
                delay: 150,
                duration: 100
            },
            hide: 100,
            wrWidth: 200,
            wrHeight: 200
        }),

        _create: function() {
            this._suppressedOnTarget = this.element;
            try {
                this._superApply(arguments);
            } finally {
                this._suppressedOnTarget = null;
            }

            /* Bind open events */
            var wrEvents = this.options.wrEvents;
            var openEvents = {};
            this._eventsMap = {};
            for ( var i = 0; i < wrEvents.length; i++) {
                this._eventsMap[wrEvents[i][0]] = wrEvents[i][1];
                openEvents[wrEvents[i][0] + " " + this.options.items] = "open";
            }
            this._on(openEvents);
        },

        open: function(event) {
            var ret = this._superApply(arguments);
            
            /* Retrieve the actual tooltip target as possibly used by the base implementation */
            var target = $(event ? event.target : this.element).closest(this.options.items);
            
            /* If a tooltip has started opening, bind close events */
            if (target.data("ui-tooltip-open")) {
                var closeEvents = this._computeCloseEvents(event);
                if (closeEvents) {
                    this._on(target, closeEvents);
                }
            }
            
            return ret;
        },

        _open: function(event, target, tooltip) {
            var that = this;

            /* Cancel opening if the tooltip is no longer open (fixes jQueryUI bug 8740) */
            if (!target.data( "ui-tooltip-open" )) {
                return;
            }

            this._suppressedOnTarget = target;
            try {
                this._superApply(arguments);
            } finally {
                this._suppressedOnTarget = null;
            }

            /* Add a close button if the tooltip won't close automatically */
            var manualClose = !this._computeCloseEvents(event)
            var uiTooltip = this._find(target);
            if (manualClose) {
                var uiTooltipClose = $("<a href=\"#\"/>").addClass("ui-wrTooltip-close").attr("role", "button");
                uiTooltipClose.prependTo(uiTooltip);
                var uiTooltipCloseText = $("<span>").addClass("ui-icon ui-icon-close").text("close");
                uiTooltipCloseText.appendTo(uiTooltipClose);
                uiTooltipClose.click(function(event) {
                    event.preventDefault();
                    var closeEvent = $.Event("blur");
                    closeEvent.target = closeEvent.currentTarget = target[0];
                    that.close(closeEvent);
                });
                this._hoverable(uiTooltipClose);
                this._focusable(uiTooltipClose);
            } else {
                uiTooltip.find(".ui-wrTooltip-close").remove();
            }

            /* Set size */
            this._size(uiTooltip);

            /* Close other tooltips */
            this._closeOtherTooltips(this._find(target));
        },

        _computeCloseEvents: function(event) {
            var closeEvents = {};
            var closeEvent = this._eventsMap[event.type], openEvent;
            if (closeEvent) {
                closeEvents[closeEvent] = "close";
            } else if (!event.type) {
                for (openEvent in this._eventsMap) {
                    if (this._eventsMap.hasOwnProperty(openEvent)) {
                        closeEvents[this._eventsMap[openEvent]] = "close";
                    }
                }
            } else {
                return null; // manual close
            }
            return closeEvents;
        },

        _tooltip: function(element) {
            var tooltip = this._superApply(arguments);
            tooltip.addClass("ui-wrTooltip");
            tooltip.find(".ui-tooltip-content").on(
                    "click dblclick mousedown mouseup keypress keydown keyup focus blur submit", false);
            return tooltip;
        },

        _size: function(tooltip) {
            var width = this.options.wrWidth, height = this.options.wrHeight;
            var tooltipContent = tooltip.find(".ui-tooltip-content");
            tooltipContent.show().css({
                width: "auto",
                minHeight: 0,
                height: 0
            });
            var nonContentHeight = tooltip.css({
                height: "auto",
                width: width,
                maxWidth: "none"
            }).outerHeight();
            if (height === "auto") {
                tooltipContent.height("auto");
                tooltipContent.css("overflow", "visible");
            } else {
                tooltipContent.height(Math.max(height - nonContentHeight, 0));
                tooltipContent.css("overflow", "auto");
            }
        },

        _closeOtherTooltips: function(tooltip) {
            var that = this;
            var preservedTooltipId = tooltip.attr("id");
            $.each(this.tooltips, function(id, element) {
                if (id !== preservedTooltipId) {
                    var event = $.Event("blur");
                    event.target = event.currentTarget = element[0];
                    that.close(event, true);
                }
            });
        },

        _on: function(suppressDisabledCheck, element, handlers) {
            if (this._suppressedOnTarget) {
                 if (typeof suppressDisabledCheck !== "boolean") {
                     handlers = element;
                     element = suppressDisabledCheck;
                 }
                 if (!handlers) {
                     handlers = element;
                     element = this.element;
                 }
                 if ($(element)[0] === $(this._suppressedOnTarget)[0]) {
                     return;
                 }
            }
            this._superApply(arguments);
        }

    });

    /*
     * Draggable
     */

    $.fn.wrDraggable = function(options) {
        options = $.extend({}, {
            cursor: "move",
            distance: 10,
            helper: "clone",
            opacity: 0.7,
            wrAction: null
        }, options);

        return this.draggable(options);
    };

    /*
     * Droppable
     */

    $.fn.wrDroppable = function(options) {
        options = $.extend({}, {
            drop: function(event, ui) {
                runScopedRequest(event.target, options.wrAction, ui.draggable.draggable("option").wrAction, {
                    extraInputs: {
                        "ajax": "true",
                        "ajaxRefresh": "true"
                    },
                    dataHandler: function(xmlDoc) {
                        wr.runScoped(event.target, function() {
                            new WRAjaxRequest().computeResponse(xmlDoc);
                        });
                    }
                });
            },
            tolerance: "pointer",
            wrAction: null
        }, options);

        return this.droppable(options);
    };

    /*
     * WebRatio request execution
     */

    $.wrWidgetRequest = runScopedRequest;

    function runScopedRequest(scopeElement, descriptor, companionDescriptor, options) {
        wr.runScoped(scopeElement, function() {
            runRequest(descriptor, companionDescriptor, options);
        });
    }
    
    function runRequest(descriptor, companionDescriptor, options) {
        if (typeof descriptor !== "string") {
            return;
        }

        options = $.extend({}, options);

        var app = wr.getApp();
        var actor = new wr.logic.AjaxRequestActor();
        var log = getLog();

        /* Create request */
        var reqInfo = createRequestInfoFromDescriptors(descriptor, companionDescriptor);
        var req = reqInfo.request;
        var actorInput = reqInfo.actorInput;

        /* Add extra inputs, removing form inputs with the same name */
        if (typeof options.extraInputs === "object") {
            var reqInputs = req.getInputs();
            for ( var i = -1; ++i < reqInputs.length;) {
                if (options.extraInputs[$(reqInputs[i]).attr("name")]) {
                    reqInputs.splice(i, 1);
                }
            }
            $.extend(req.getParams(), options.extraInputs);
        }

        /* Set response types */
        if (options.responseType) {
            req.setResponseTypes(options.responseType);
        }

        /* Add listeners */
        if (typeof options.dataHandler === "function") {
            req.addSuccessListener(function(textStatus, responseText, data) {
                try {
                    options.dataHandler(data);
                } catch (e) {
                    handleRequestError("Error handling returned data (" + textStatus + ")", responseText, e);
                }
            });
        }
        req.addFailureListener(function(textStatus, responseText) {
            actor.stopFullWaitUX(actorInput, display);
            handleRequestError("Server request " + textStatus, responseText, null);
        });

        /* Wait experience functions */
        var startWaitFunction = function() {
            return actor.startFullWaitUX(actorInput, app.getPlugin("ui").getDisplay());
        };
        var stopWaitFunction = function() {
            return actor.stopFullWaitUX(actorInput, app.getPlugin("ui").getDisplay());
        };
        
        startWaitFunction().chain(function() {
            return app.getPlugin("nav").navigate(req);
        }).chain(stopWaitFunction, stopWaitFunction);
    }

    function createRequestInfoFromDescriptors(descriptor, companionDescriptor) {

        /* Get normalized descriptor info */
        var descr = parseDescriptor(descriptor);
        var cmpDescr = companionDescriptor ? parseDescriptor(companionDescriptor) : null;
        var url = descr.url;
        var cmpUrl = cmpDescr ? cmpDescr.url : null;
        var formPost = mergeFormPosts(descr.formPost, cmpDescr && cmpDescr.formPost);
        var options = mergeOptions(descr.options, cmpDescr && cmpDescr.options);

        /* If there is a companion URL, merge it into the first one */
        var mergedUrl = cmpUrl ? mergeRequestURLs(url, cmpUrl, formPost) : url;

        return { request: createRequest(mergedUrl, formPost), actorInput: createActorInput(options) };
    }

    function mergeFormPosts(formPost1, formPost2) {
        if (formPost1 && formPost2) {
            if (formPost1.name !== formPost2.name || formPost1.button !== formPost2.button) {
                throw new Error("Incompatible form post information");
            }
            return formPost1;
        } else {
            return formPost1 || formPost2 || null;
        }
    }
    
    function mergeOptions(options1, options2) {
        if (options1 && options2) {
            return jQuery.extend({}, options1, options2);
        } else {
            return options1 || options2 || {};
        }
    }

    function mergeRequestURLs(url1, url2, formPost) {
        var app = wr.getApp();

        /* Create requests for both URLs */
        var req1 = createRequest(url1, formPost);
        var req2 = createRequest(url2, formPost);

        /* Precompute and remove propagation link, if present */
        var navPlugin = app.getPlugin("nav");
        navPlugin.precompute(req1);
        navPlugin.precompute(req2);
        removeLinkId(req1);
        removeLinkId(req2);

        /* Merge propagated parameters together */
        var params = $.extend({}, req1.getParams());
        var params2 = req2.getParams();
        var propagRouter = navPlugin.getRouterOfType(wr.nav.PropagationRouter);
        propagRouter.extendParameters(params, params2, params2["cmplink"]);

		var m = /^(.+?)(#.*)?$/.exec(req1.getURL());
        return m[1] + "?" + $.param(params) + (m[2] || "");
    }

    function removeLinkId(req) {
        var url = req.getURL();
        var idx = url.indexOf("#!link=");
        if (idx >= 0) {
            req.setURL(url.substring(0, idx));
        }
    }

    function parseDescriptor(descriptor) {
        var parts = String(descriptor).split(",");
        return {
            url: parts[0],
            formPost: parts[2] ? {
                name: parts[1],
                button: parts[2]
            } : null,
            options: parts[3] ? jQuery.parseJSON(parts.slice(3).join(",")) : {}
        }
    }

    function createRequest(url, formPost) {
        var params = {}, formInputs = [];
        params["async"] = true;
        if (formPost) {
            var $form = $("#" + wr.util.escapeCss(formPost.name));
            url = extendUrlQuery($form.attr("action"), url);
            Array.prototype.push.apply(formInputs, $form.find(":input").get());
            params[formPost.button] = "link";
        }
        return new wr.nav.Request(url, params, formInputs);
    }
    
    function createActorInput(options) {
        return { indicator: options.indicator, waitWin: options.waitWin };
    }

    function extendUrlQuery(baseURL, addedURL) {
        var queryRE = /\?(.+?)&?$/;
        var mBase = queryRE.exec(baseURL);
        var mAdded = queryRE.exec(addedURL);
        if (mAdded && mAdded[1]) {
            return baseURL + (mBase ? "&" : "?") + mAdded[1];
        } else {
            return baseURL;
        }
    }

    function handleRequestError(message, responseText, e) {
        var log = getLog();
        var eMessage = e && (e.message || e);
        var fullMessage = message + (eMessage ? " - " + eMessage : "");
        var error = e instanceof Error ? e : null;
        log.error(fullMessage, error);
        if (log.isDebugEnabled()) {
            log.debug("Server response was" + (responseText ? ":\r\n" + responseText : " still to be received"));
        }
        return error || new Error(fullMessage);
    }

    /*
     * Utilities
     */

    function sanitizeHTML(html) {
        var m;
        if (m = /<body[^>]*>((?:.|\s)*)<\/body>/i.exec(html)) {
            return m[1];
        }
        return html;
    }

    function getLog() {
        return wr.log.getManager().getLog("wr.widgets");
    }
})(jQuery);

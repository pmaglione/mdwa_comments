var utils = require('sdk/window/utils');
var tabs = require("sdk/tabs");
var { viewFor } = require("sdk/view/core");
var tab_utils = require("sdk/tabs/utils");
var {Ci, Cu, Cc, CC} = require("chrome");
var Request = require("sdk/request").Request;
var NsIDomParser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
var { attach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');
var { InstanceObjectTemplate, IOPropertyTemplate } = require("./templates").getClasses();
//persistence can't be part of the decorator otherwise it can't be clonned
//The same applies to the search engine
var persistence = require("./persistence").getInstance();
const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
var scope = sandbox(utils.getMostRecentBrowserWindow());
load(scope, 'resource://woa-at-lifia-dot-info-dot-unlp-dot-edu-dot-ar/data/src/js/xpathManagement.js');    
var xpathInterpreter = new scope.XPathInterpreter();
	
function AbstractDecorator(io, lang){
	//if(io) IOComponent.call(this, io.className, io.value);
	this.cc = io;
	this.messages = [];
	this.selectedMessages = [];
	this.lang = lang;
	this.locale = {};
	this.mappings = [];
	
	var me = this;
	//Component. Es importante implementar los métodos sin prototype, sino
	//no pueden ser clonados en otros contextos
	this.getId = function() { return me.cc.getId(); };
	this.getName = function() { return me.cc.getName(); };
	this.getTag = function() { return me.cc.getTag(); };
	this.getUrl = function() { return me.cc.getUrl(); };
	this.getXpath = function() { return me.cc.getXpath(); };
	this.getClassName = function() { return undefined; };
	this.getXpath = function() {
		return me.cc.getXpath();
	};
	this.getOrder = function() {
		return me.cc.getOrder();
	};
	this.setProperty = function(data){
		return me.cc.setProperty(data);
	}
	this.addProperty = function(pId, pName, pValue) {
		return me.cc.addProperty(pId, pName, pValue);
	};
	this.getPropertyByClass = function(key) {
		var prop = me.cc.getPropertyByClass(key);
		return (prop && prop.wrappedJSObject)? prop.wrappedJSObject:prop;
	};
	this.getPropertyByName = function(key) {
		key = me.processMappedProperty(key);
		var prop = me.cc.getPropertyByName(key);
		return (prop && prop.wrappedJSObject)? prop.wrappedJSObject:prop;
	};
	this.getCurrentDomWindow = function() {
		return utils.getMostRecentBrowserWindow().content;
	};
	this.processMappedProperty = function(key) {

		for (var i = 0; i < me.mappings.length; i++) { //messageId propName
			if(me.mappings[i].messageId == key){ //message is really the param name
				key = me.mappings[i].propName;
			}
		}
		return key;
	}
	this.getPropertyByTagName = function(key) {
		var prop = me.cc.getPropertyByTagName(key);
		return (prop && prop.wrappedJSObject)? prop.wrappedJSObject:prop;
	};
	this.getPropertyByTemplateId = function(key) {
		var prop = me.cc.getPropertyByTemplateId(key);
		return (prop && prop.wrappedJSObject)? prop.wrappedJSObject:prop;
	};
	this.getProperties = function() {
		return me.cloneIntoSidebarContext(me.cc.getProperties());
	};
	this.getTextValue = function() {
		return me.cc.getTextValue();
	};
	this.getDomElement = function() {
		return me.cc.getDomElement();
	};
	this.getValue = function() {
		return me.cc.getValue();
	};
	this.getSidebarWindow = function() {	
		return utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow[0].wrappedJSObject;
	}
	this.cloneIntoSidebarContext = function(obj){
		var unsafeWindow = this.getSidebarWindow();
	    return Cu.cloneInto( obj, unsafeWindow, { //unsafeWindow[data.as] = Cu.cloneInto( data.object, unsafeWindow, {
	        cloneFunctions: true
	    });	
	}
	this.listTweetsInPanel = function(data, callback){ // data={title,list,emptyMessage}
		var win = utils.getMostRecentBrowserWindow();
		var panel = require("sdk/panel").Panel({
			width: win.innerWidth * 0.85,
    		height: win.innerHeight * 0.8,
			contentURL: "./results-panel-for-decorators.html",
			onShow: function(){
				panel.port.emit("listTweetsInPanel", data);
				callback();
			}
		});
		panel.port.on("closeResultsPanelForDecorator", function(evt){ 
			panel.destroy(); })
		panel.show();
	};
	this.listVideosInPanel = function(data, callback){ //data = {title, link, thumbnail, icon}
		var win = utils.getMostRecentBrowserWindow();
		var panel = require("sdk/panel").Panel({
			width: win.innerWidth * 0.85,
    		height: win.innerHeight * 0.8,
			contentURL: "./results-panel-for-decorators.html",
			onShow: function(){
				panel.port.emit("listVideosInPanel", data);
				callback();
			}
		});
		panel.port.on("closeResultsPanelForDecorator", function(evt){ 
			panel.destroy(); })
		panel.show();
	};
	this.getLocale = function(key){
		return (this.locale[this.lang])? this.locale[this.lang][key]: undefined;
	}
	this.getMessages = function(){}; 
	this.loadStoredSelectedMessages = function(){ 

		me.selectedMessages = [];
		var totalMessages = me.getMessages();
		if(totalMessages == undefined) return;
		var aux = persistence.getMessagesByDecoratorId(me.getId());
		for (var i = 0; i < totalMessages.length; i++) { 
			if(aux.indexOf(totalMessages[i].id) != -1)
				me.selectedMessages.push(totalMessages[i]);
		};
	};
	this.setAsSelectedMessage = function(message){ 

		me.selectedMessages.push(message); //{id:"showOriginalContext", name:"Show original context", class:true}
	};
	this.selectMessage = function(id){ 

		var totalMessages = me.getMessages();
		if(totalMessages == undefined) return;
		for (var i = 0; i < totalMessages.length; i++) { 
			if(totalMessages[i].id == id){
				me.setAsSelectedMessage(totalMessages[i]);
				return;
			}
		};
	};
	this.mapMessageParam = function(decoMessageId, ioPropName){ 
		//TODO: Mappings should be retrieved while a message is executed, not creating a 
		//fake property...
		var map = {messageId: decoMessageId, propName: ioPropName};
		me.mappings.push(map); //So we can apply it then to the ios 	
	};
	this.mapMessageParams = function(mappings){ // id propName
		if(mappings.length && mappings.length > 0){
			for (var i = 0; i < mappings.length; i++) {
				this.mapMessageParam(mappings[i].id, mappings[i].propName);
			}
		}
	}
	this.getMappings = function(decoMessageId, ioPropName){ 
		//This is necessary, because you can't access directly to properties of this object from other contexts
		return Cu.cloneInto( me.mappings, utils.getMostRecentBrowserWindow().content, { 
	        cloneFunctions: true
	    });	
	};
	this.getSelectedMessages = function(){ 
		return Cu.cloneInto( me.selectedMessages, utils.getMostRecentBrowserWindow().content, { 
	        cloneFunctions: true
	    });	
	};
	this.loadMappings = function(props){

		// This is because we are not using decoratos for each instance!!!!!!
		for (var i = 0; i < props.length; i++) {
			me.setProperty(props[i]);
		}

		var mappings = persistence.getParamMappings(me.getId());
		if(mappings == undefined)
			return;

		for (var j = 0; j < mappings.length; j++) {
			var prop = this.getPropertyByTemplateId(mappings[j].propId);
			if(prop){
				this.mapMessageParam(
					mappings[j].id, 
					prop.getName()
				);
			}
		}
	}
	this.getMessagesForInSituInteraction = function(){
		var selectedMessages = me.getSelectedMessages();
		for (var i = 0; i < selectedMessages.length; i++) {
			if(selectedMessages[i].id == "enableInSituInteraction"){
				selectedMessages.splice(i, 1);
				break;
			}
		}
		return selectedMessages;
	}
	this.createMenu = function(document, messages, io, clRect, searchEngine){

		var controls = document.createElement("div");
	    	controls.className = "woa-top-left-floating-menu";
	    	//controls.style["position"] = "relative";
	    	//controls.style["top"] = "-" + clRect.height + "px";
	    	controls.style.zIndex = "2147483646";

	    var cog = document.createElement("button");
	        cog.className = "woa-augmenter-icon";
	        controls.appendChild(cog);
	        cog.popupOpened=false;
	        cog.onclick = function(evt){
	        	
	        	var popup = document.getElementsByClassName("woa-decorator-popup");
	        	if(popup && popup.length && popup.length > 0){
	        		popup[0].remove();
	        	}
	        	else{ try{ 
	        		if(!messages || !messages.length || messages.length == 0)
	        			return;

		        	var popup = document.createElement("div");
				    	popup.className = "popup woa-decorator-popup";
				    	popup.style.width = "265px"; //WA POPUP 
				    	popup.style.height = "67px";
				    	popup.onclick = function(){
				    		this.remove();
				    	}

					var list = document.createElement('div');
						list.className = "list";

					for (var i = 0; i < messages.length; i++) {
						var item01 = document.createElement('div');
							item01.className = 'list-item';
						var span01 = document.createElement('span');
							span01.innerHTML = messages[i].name;
							item01.appendChild(span01);
							item01.messageId = messages[i].id;
							item01.woaIO = io;
							item01.onclick = function(){
								me.enableLoading(document);
								//Trigger themessage
								var deco = searchEngine.decorate(this.woaIO, me.getClassName());
								deco.mapMessageParams(persistence.getParamMappings(me.getId()));
								deco[this.messageId](function(){
									me.disableLoading(document)
								});
								popup.remove();
							}

						list.appendChild(item01);
					};

					popup.appendChild(list);
					this.parentElement.appendChild(popup);
					popup.style.height = list.children[0].getBoundingClientRect().height * messages.length + "px";


					popup.style.left = (this.left + 15) + 'px';
					popup.style.top = (this.bottom) + 'px';

				}catch(err){console.log(err)}}
				evt.stopPropagation(); evt.preventDefault();
	        };
	    return controls; 
	}
}











// ******************************************************************************************
// GENERIC DECORATOR ************************************************************************
// ******************************************************************************************
function GenericDecorator(io, lang){
	AbstractDecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "GenericDecorator"; };

	var me = this;
	this.keywords = "";
	this.showRelatedTweets = function(callback){ 
		var keys = me.keywords || me.getPropertyByName("keywords");
		var query = 'https://twitter.com/search?q=' + encodeURIComponent('"' + keys + '"');
		var req = Request({ url: query, onComplete: function (response) { 
			me.showRelatedTweetsInPanel(response,callback); 
		}});
		req.get();
	}
	this.showRelatedNews = function(callback){	console.log('showRelatedNews');	}
	this.showRelatedMedia = function(callback){	console.log('showRelatedMedia'); }
	this.getDisplayName = function(callback){ return GenericDecorator.getDisplayName(); }
	this.getMessages = function(callback){ return GenericDecorator.getMessages(); }
	this.showOriginalContext = function(callback){
		tabs.open(this.getUrl());
		callback();
	}
	//Private
	this.showRelatedTweetsInPanel = function(response, callback){
		if(	response ){
			var doc = NsIDomParser.parseFromString(response.text, "text/html");
		    var xmlinstances = doc.getElementsByClassName("js-tweet-text tweet-text");
		    var res = [];
		    for (var i = 0; i < xmlinstances.length; i++) {
		    	res.push({
		    		title: xmlinstances[i].parentElement.parentElement.getElementsByClassName("username")[0].textContent,
		    		message: xmlinstances[i].textContent,
		    		icon: "fa fa-twitter custom-fa-twitter"
		    	});
		    }
		    me.listTweetsInPanel({
		    	title: "Related Tweets", 
		    	list: res,
		    	emptyMessage: me.getLocale('no_matching_results')
		    }, callback);
		}
	}
}
//Con prototype, solo podés implementar los métodos de clase... Y hasta por ahí nomás, porque capaz que los necesitamos del otro lado 
GenericDecorator.prototype = new AbstractDecorator();
GenericDecorator.getDisplayName = function(){ return "Generic"; }
GenericDecorator.getMessages = function(){ 
	return [ 
		{id:"showRelatedTweets", name:"Show related tweets", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showRelatedNews", name:"Show related News", properties:[{"id": "name", "name": "Name"}]},
		{id:"showRelatedMedia", name:"Show related Media", properties:[{"id": "name", "name": "Name"}]},
		{id:"showOriginalContext", name:"Show original context", class:true}
	]; 
}
GenericDecorator.getTags = function(){ return ["*"]; }
GenericDecorator.getSemanticEntity = function(){ return; }






// ******************************************************************************************
// WEB AUGMENTATION DECORATOR ***************************************************************
// ******************************************************************************************
function WADecorator(io, lang){
	AbstractDecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "WADecorator"; };
	var me = this;
	this.augmentInstancesInContext = function(url, callback){

		this.loadStoredSelectedMessages();
		var document = utils.getMostRecentBrowserWindow().content.document;
		if(document.URL == url){
			this.loadContextMenus(document, callback);
		}
		else{
			var me = this;
			tabs.open({
				url: url,
				onLoad: function onOpen(tab) {
					var lowLevelTab = viewFor(tab);
	                var tabDocument = tab_utils.getBrowserForTab(lowLevelTab).contentDocument;
					me.loadContextMenus(tabDocument, callback);			
				}
			});
		}		
	}
	this.fakeWA = function(config){

		var cssFiles = [
			"./lib/css/bootstrap.min.css",
			"./src/css/woa-augmenter-icon.css"
		];

		var { attach } = require('sdk/content/mod');
		var { Style } = require('sdk/stylesheet/style');
		
		for (var i = 0; i < cssFiles.length; i++) {
			var style = Style({ uri: cssFiles[i] });
			attach(style, tabs.activeTab);
		};
	} 
	this.loadContextMenus = function(document, callback){

		me.loadContextMenuStyles(document);
		var searchEngine = require("./searchEngine").getInstance(me.lang);
		searchEngine.loadStoredInstances(me.getId(), function(instances){

			//Despite the application of decorators, the clonning into a new context removes the 
			//provileged functionality, so we need to keep just the information of every instance and 
			//recreate the decorator when clicked
			var ios = instances.wrappedJSObject;
			var messages = me.getMessagesForInSituInteraction(); 
			for (var i = 0; i < ios.length; i++) {

				var node = document.evaluate(ios[i].getXpath(), document, null, 9, null);
				if(node){
					console.log(node.singleNodeValue);
					node.singleNodeValue.insertBefore(me.createMenu(
						document, 
						messages,
						ios[i],
						node.singleNodeValue.getBoundingClientRect(),
						searchEngine
					),node.singleNodeValue.firstChild);
				}
			}

			callback();
		});
	}
	this.loadContextMenuStyles = function(document){

		attach(Style({ uri: "./src/css/apps.css" }), tabs.activeTab);
		var doit;
		document.defaultView.addEventListener("resize", function(){

			document.defaultView.clearTimeout(doit);
			doit = document.defaultView.setTimeout(function() {
			    var menus = document.getElementsByClassName("woa-top-left-floating-menu");
				if(menus) {
					for (var i = 0; i < menus.length; i++) {
						var rect = menus[i].parentElement.getBoundingClientRect();
						menus[i].style["top"] = "-" + (rect.height - menus[i].offsetHeight) + "px";
					}
				};
			}, 100);
		});
	}
	this.enableLoading = function(document){

	    var loading = document.createElement("div");
	        loading.id= "woa-full-loading";
	        loading.className = "woa-loading";
	        loading.onclick = function(){ this.remove(); }
	    document.body.appendChild(loading);
	}
	this.disableLoading = function(document){

	    var loading = document.getElementById("woa-full-loading");
	    if(loading) loading.remove();
	}
}


// ******************************************************************************************
// SOCIAL MEDIA DECORATOR ***************************************************************
// ******************************************************************************************
function WASocialMediaDecorator(io, lang){
	WADecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "WASocialMediaDecorator"; };

	var me = this;
	this.showRelatedTweets = function(callback){ 
		var prop = me.getPropertyByName("keywords");
		if(prop.getValue){
			var query = 'https://twitter.com/search?q=' + encodeURIComponent('"' + prop.getValue() + '"');
			var req = Request({ url: query, onComplete: function (response) { 
				me.showRelatedTweetsInPanel(response,callback); 
			}});
			req.get();
		}
	}
	this.showRelatedTweetsInPanel = function(response, callback){ //Private
		if(	response ){
			var doc = NsIDomParser.parseFromString(response.text, "text/html");
		    var xmlinstances = doc.getElementsByClassName("js-tweet-text tweet-text");
		    var res = [];
		    for (var i = 0; i < xmlinstances.length; i++) {
		    	res.push({
		    		title: xmlinstances[i].parentElement.parentElement.getElementsByClassName("username")[0].textContent,
		    		message: xmlinstances[i].textContent,
		    		icon: "fa fa-twitter custom-fa-twitter"
		    	});
		    }
		    me.listTweetsInPanel({
		    	title: "Related Tweets", 
		    	list: res,
		    	emptyMessage: me.getLocale('no_matching_results')
		    }, callback);
		}
	}
}
WASocialMediaDecorator.prototype = new WADecorator();
WASocialMediaDecorator.getDisplayName = function(){ return "Social Media"; }
WASocialMediaDecorator.getMessages = function(){ 
	return [ 
		{id:"showRelatedTweets", name:"Show related tweets", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"enableInSituInteraction", name:"Enable in-situ interaction", class:true}
	]; 
}
WASocialMediaDecorator.getTags = function(){ return ["*"]; }
WASocialMediaDecorator.getSemanticEntity = function(){ return; }


// ******************************************************************************************
// NEWS DECORATOR ***************************************************************************
// ******************************************************************************************
function NewsDecorator(io, lang){
	WASocialMediaDecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "NewsDecorator"; };
	var me = this;
	
	this.getDisplayName = function(callback){ return GenericDecorator.getDisplayName(); }
	this.getMessages = function(callback){ return NewsDecorator.getMessages(); }
	this.enableInSituInteraction = function(callback){ me.augmentInstancesInContext(me.getUrl(), callback); }
	this.showOriginalContext = function(callback){
		tabs.open(this.getUrl());
		callback();
	}
}
//Con prototype, solo podés implementar los métodos de clase... Y hasta por ahí nomás, porque capaz que los necesitamos del otro lado 
NewsDecorator.prototype = new WASocialMediaDecorator();
NewsDecorator.getDisplayName = function(){ return "News"; }
NewsDecorator.getMessages = function(){ 
	return [ 
		{id:"showRelatedTweets", name:"Show related tweets", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showOriginalContext", name:"Show original context", class:true},
		{id:"enableInSituInteraction", name:"Enable in-situ interaction", class:true}
	]; 
}
NewsDecorator.getTags = function(){ return ["news", "post", "blog"]; }
NewsDecorator.getSemanticEntity = function(){ return; }


// ******************************************************************************************
// SCIENTIFIC ARTICLE DECORATOR ***************************************************************************
// ******************************************************************************************
function ScientificArticleDecorator(io, lang){
	WASocialMediaDecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "ScientificArticleDecorator"; };
	var me = this;
	
	this.getDisplayName = function(callback){ return GenericDecorator.getDisplayName(); }
	this.getMessages = function(callback){ return ScientificArticleDecorator.getMessages(); }
	this.enableInSituInteraction = function(callback){ me.fakeWA(); me.augmentInstancesInContext(me.getUrl(), callback); }
	this.showOriginalContext = function(callback){
		tabs.open(this.getUrl());
		callback();
	}
	this.appendAvailableDownloads = function(callback){ this.getCurrentDomWindow().alert("appendAvailableDownloads"); }
	this.showFullPublicationData = function(callback){ this.getCurrentDomWindow().alert("showFullPublicationData"); }
	this.getAuthorCurrentPosition = function(callback){ this.getCurrentDomWindow().alert("getAuthorCurrentPosition"); }
	this.showAuthorTechnicalSkills = function(callback){ this.getCurrentDomWindow().alert("showAuthorTechnicalSkills"); }
	this.getAuthorsRelatedProjects = function(callback){ this.getCurrentDomWindow().alert("getAuthorsRelatedProjects"); }
}
//Con prototype, solo podés implementar los métodos de clase... Y hasta por ahí nomás, porque capaz que los necesitamos del otro lado 
ScientificArticleDecorator.prototype = new WASocialMediaDecorator();
ScientificArticleDecorator.getDisplayName = function(){ return "Scientific article"; }
ScientificArticleDecorator.getMessages = function(){ 
	return [ 
		{id:"appendAvailableDownloads", name:"Append available download links", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showFullPublicationData", name:"Append full publication data", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"getAuthorCurrentPosition", name:"Get author's current position", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showAuthorTechnicalSkills", name:"Get author's technical skills", properties:[{"id": "keywords", "name": "Keywords"}]},		
		{id:"getAuthorsRelatedProjects", name:"Get authors' current projects", properties:[{"id": "keywords", "name": "Keywords"}]}, 		
		{id:"showOriginalContext", name:"Show original context", class:true},
		{id:"enableInSituInteraction", name:"Enable in-situ interaction", class:true}
	]; 
}
ScientificArticleDecorator.getTags = function(){ return ["article", "paper", "study", "review", "research work"]; }
ScientificArticleDecorator.getSemanticEntity = function(){ return; }


// ******************************************************************************************
// NEWS ARTICLE DECORATOR ***************************************************************************
// ******************************************************************************************
function NewsArticleDecorator(io, lang){
	WASocialMediaDecorator.call(this, io, lang);
	this.locale = {
		'en': { 'no_matching_results': 'No results matching your search' },
		'es': {	'no_matching_results': 'No hay resultados que coincidan con tu búsqueda' },
		'fr': { 'no_matching_results': 'Aucun résultat correspondant à votre recherche'}
	};
	this.getClassName = function() { return "NewsArticleDecorator"; };
	var me = this;
	
	this.getDisplayName = function(callback){ return GenericDecorator.getDisplayName(); }
	this.getMessages = function(callback){ return NewsArticleDecorator.getMessages(); }
	this.enableInSituInteraction = function(callback){ me.augmentInstancesInContext(me.getUrl(), callback); }
	this.showOriginalContext = function(callback){
		tabs.open(this.getUrl());
		callback();
	}
	this.appendAvailableDownloads = function(callback){ this.getCurrentDomWindow().alert("appendAvailableDownloads"); }
	this.showFullPublicationData = function(callback){ this.getCurrentDomWindow().alert("showFullPublicationData"); }
	this.getAuthorCurrentPosition = function(callback){ this.getCurrentDomWindow().alert("getAuthorCurrentPosition"); }
	this.showAuthorTechnicalSkills = function(callback){ this.getCurrentDomWindow().alert("showAuthorTechnicalSkills"); }
	this.getAuthorsRelatedProjects = function(callback){ this.getCurrentDomWindow().alert("getAuthorsRelatedProjects"); }
}
//Con prototype, solo podés implementar los métodos de clase... Y hasta por ahí nomás, porque capaz que los necesitamos del otro lado 
NewsArticleDecorator.prototype = new WASocialMediaDecorator();
NewsArticleDecorator.getDisplayName = function(){ return "News article"; }
NewsArticleDecorator.getMessages = function(){ 
	return [ 
		{id:"appendAvailableDownloads", name:"Append available download links", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showFullPublicationData", name:"Append full publication data", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"getAuthorCurrentPosition", name:"Get author's current position", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showAuthorTechnicalSkills", name:"Get author's technical skills", properties:[{"id": "keywords", "name": "Keywords"}]},		
		{id:"getAuthorsRelatedProjects", name:"Get authors' current projects", properties:[{"id": "keywords", "name": "Keywords"}]}, 		
		{id:"showOriginalContext", name:"Show original context", class:true},
		{id:"enableInSituInteraction", name:"Enable in-situ interaction", class:true}
	]; 
}
NewsArticleDecorator.getTags = function(){ return ["article", "paper", "study", "review", "research work"]; }
NewsArticleDecorator.getSemanticEntity = function(){ return; }



// ******************************************************************************************
// FILM DECORATOR ***************************************************************
// ******************************************************************************************
//TODO: there is an overriding problem here!!!!!
function FilmDecorator(io, lang){
	WASocialMediaDecorator.call(this, io, lang);

	var me = this;
	this.keywords = "";
	this.getClassName = function() { return "FilmDecorator"; };
	this.showTrailer = function(callback){	
		var prop = me.getPropertyByName("keywords");
		if(prop.getValue){
			var query = 'https://www.youtube.com/results?search_query=trailer+' + 
			encodeURIComponent('"' + prop.getValue() + '"');
			var req = Request({ url: query, onComplete: function (response) { 
				me.showRelatedVideosInPanel(response,callback); 
			}});
			req.get();
		}
	}
	this.getDisplayName = function(callback){ return GenericDecorator.getDisplayName(); }
	this.getMessages = function(callback){ return FilmDecorator.getMessages(); }
	this.enableInSituInteraction = function(callback){ me.augmentInstancesInContext(me.getUrl(), callback); }
	this.showOriginalContext = function(callback){
		tabs.open(this.getUrl());
		callback();
	}
	this.showRelatedVideosInPanel = function(response, callback){ //Private
		if(	response ){
			var doc = NsIDomParser.parseFromString(response.text, "text/html");
		    var xmlinstances = doc.getElementsByClassName("yt-lockup-dismissable yt-uix-tile");
		    var res = [];
		    for (var i = 0; i < xmlinstances.length; i++) {
		    	var url = xmlinstances[i].getElementsByClassName("yt-uix-sessionlink yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 spf-link")[0].href;
		    	url = url.replace(/watch\?v=/g, "");
		    	res.push({
		    		title: xmlinstances[i].getElementsByClassName("yt-uix-sessionlink yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 spf-link")[0].title,
		    		link: "http://www.youtube.com/embed" + url,
		    		thumbnail: xmlinstances[i].getElementsByTagName("img")[0].src,
		    		icon: "fa icon-film custom-fa-twitter"
		    	});
		    }
		    me.listVideosInPanel({
		    	title: "Matching trailers", 
		    	list: res,
		    	emptyMessage: me.getLocale('no_matching_results')
		    }, callback);
		}
	}
}
//Con prototype, solo podés implementar los métodos de clase... Y hasta por ahí nomás, porque capaz que los necesitamos del otro lado 
FilmDecorator.prototype = new WASocialMediaDecorator();
FilmDecorator.getDisplayName = function(){ return "Films"; }
FilmDecorator.getMessages = function(){ 
	return [ 
		{id:"showRelatedTweets", name:"Show related tweets", properties:[{"id": "keywords", "name": "Keywords"}]}, 
		{id:"showTrailer", name:"Search trailers", properties:[{"id": "title", "name": "Title"}]},
		{id:"showOriginalContext", name:"Show original context", class:true},
		{id:"enableInSituInteraction", name:"Enable in-situ interaction", class:true}
	]; 
}
FilmDecorator.getTags = function(){ return ["movie", "video", "film", "series", "short film"]; }
FilmDecorator.getSemanticEntity = function(){ return ['http://dbpedia.org/ontology/Film']; }





exports.getClasses = function() {
    return [ GenericDecorator, NewsDecorator, FilmDecorator, WASocialMediaDecorator, NewsArticleDecorator, ScientificArticleDecorator ];
}
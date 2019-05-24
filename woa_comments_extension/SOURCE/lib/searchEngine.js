var utils = require('sdk/window/utils');
var Request = require("sdk/request").Request;
var {Ci, Cu, Cc, CC} = require("chrome");
var NsIDomParser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
var { InstanceObjectTemplate, IOPropertyTemplate } = require("./templates").getClasses();

// *************************************************************************************
// *************************************************************************************
// MATERIALIZABLES
// *************************************************************************************
// *************************************************************************************
/*
	IMPORTANT NOTE: this classes are similar to the ones in the templates.js file. 
	They should be normalized, I agree, we are using even different properties names, but
	if there is just one line using privileged access, every function of the object will be discarded
	when cloned into another context. That's the main reason for having both classes.  
*/
function Materializable(data){
	this.value = data.value;
	this.name = data.name;
	this.id = data.id;
	this.tag = data.tag;
	this.xpath = data.xpath || undefined;
	this.url = data.url;
	this.order = data.index;
	this.domElem = data.domElem;
	var me = this;
	this.getId = function() {
		return me.id;
	};
	this.getUrl = function() {
		return me.url;
	};
	this.getDomElement = function() {
		return me.domElem;
	};
	this.getTextValue = function() {
		return me.value;
	};
	this.getValue = function() {
		return Cu.cloneInto( me.value, utils.getMostRecentBrowserWindow().content, {
            cloneFunctions: true
        });
	};
	this.getName = function() {
		return me.name; 
	};
	this.getXpath = function() {
		return me.xpath; 
	};
}
function IOComponent(data){
	// We need to have these clases this way because of prototyped objects are not well cloned 
	Materializable.call(this, data);
	this.properties = [];
	this.addProperty; //abstract
	this.getProperty; //abstract
	this.getOrder;
};
function InstanceObject(data){
	// We need to have these clases this way because of prototyped objects are not well cloned 
	IOComponent.call(this, data);
	this.order; // = new Date().getTime();
	//this.xpath; // TODO: move to materializable, it could be useful for properties. Also move: setXpath and getXpath
	var me = this;
	this.setXpath = function(xpath){
		me.xpath = xpath;
	};
	this.getXpath = function(){
		return me.xpath;
	};
	this.getOrder = function() {data
		return me.order;
	};
	this.getDomElement = function() {

		if(this.properties.length > 0){
			//Another strategy could be hiding all the elements that are not the ones matching with the properties (or their containers). 
			var container = "<div>";

			for (var i = this.properties.length - 1; i >= 0; i--) {
				container += this.properties[i].domElem;
			}
			container += "</div>";
			return container;
		}
		else return "";
	};
	this.addProperty = function(data) {
		return me.properties.push(new InstanceProperty(data));
	};
	this.setProperty = function(data) {
		for (var i = 0; i < me.properties.length; i++) {
			if(me.properties[i].name == data.name){
				me.properties[i] = data; //this.properties[i].value = data.value;
				return;
			}
		}
		me.addProperty(data);
	};
	this.getProperties = function() {
		return me.properties;
	};
	this.getPropertyByClass = function(key) {
		if(me.properties.length == 0) return;
		for (var i = 0; i < me.properties.length; i++) {
			if(me.properties[i].name == key){
				return me.properties[i];
			}
		}
	};
	this.getPropertyByTagName = function(key) {
		//This is used just from the developers API. It's working is not guaranteed from other contexts (try it and delete this message if it's ok!)
		if(me.properties.length == 0) return;

		for (var i = 0; i < me.properties.length; i++) {
			if(me.properties[i].tag == key){
				return Cu.cloneInto( me.properties[i], utils.getMostRecentBrowserWindow().content, {
		            cloneFunctions: true
		        });	
			}
		}
	};
	this.getPropertyByName = function(key) {
		//This is used just from the developers API. It's working is not guaranteed from other contexts (try it and delete this message if it's ok!)
		
		if(me.properties.length == 0) return;
		for (var i = 0; i < me.properties.length; i++) {

			if(me.properties[i].name == key){
				return Cu.cloneInto( me.properties[i], utils.getMostRecentBrowserWindow().content, {
		            cloneFunctions: true
		        });	
			}
		}
	};
	this.getPropertyByTemplateId = function(key) {
		if(me.properties.length == 0) return;
		for (var i = 0; i < me.properties.length; i++) {
			if(me.properties[i].id == key){
				return me.properties[i];
			}
		}
	};
};
function InstanceProperty(data){
	Materializable.call(this, data);
}



// *************************************************************************************
// *************************************************************************************
// SEARCH ENGINE
// *************************************************************************************
// *************************************************************************************

function SearchEngine(lang){

	//Singleton
	/*if (arguments.callee._singletonInstance) {
		return arguments.callee._singletonInstance;
	}
	arguments.callee._singletonInstance = this;*/

	this.lang = lang || "en";
	this.ctemplate;
	this.ptemplates;
	this.decoratorClass;
	this.mappings;
	this.currentInstances;
	this.scope;
	this.loadXPathInterpreter();	
	//NEW ONES
	this.pageWorker;
	this.components = {};
	this.componentsXpaths = {}; //Temporary!!!
	this.currentIndex = 0;
	this.document;
	this.persistence = require("./persistence").getInstance();
	this.onExternalPageLoaded;
	this.decorators = require("./decorators").getClasses(this.lang); 
}
SearchEngine.prototype.loadStoredInstances = function(templateId, callback){

	var template = this.persistence.getFullConceptTemplateData(templateId);
	var io = new InstanceObjectTemplate(template.concept, undefined);
	for (var i = 0; i < template.properties.length; i++) {
		io.addProperty(template.properties[i]);
	}
	var decoratedIO = io;
	var me = this;
	this.loadTemplates(
		decoratedIO, decoratedIO.getProperties(),
		function(inst){
			//me.setDecoratorClass(undefined); // TODO: Just in case. We should implement an initialize
			me.loadInstances();

			//For this reason, there is no sense in decorating the object
			var instances = Cu.cloneInto( me.currentInstances, utils.getMostRecentBrowserWindow().content, {
	            cloneFunctions: true
	        });
			if(callback) callback(instances);
		}
	);
}
SearchEngine.prototype.getDecoratorClass = function(classname){

	for (var i = 0; i < this.decorators.length; i++) {
		if (this.decorators[i].name == classname)
			return this.decorators[i];
	}
	return;
}
SearchEngine.prototype.loadTemplates = function(ctemplate, ptemplates, callback){

	this.lastIndex = 0;
	//Gila, ptemplates es parte de ctemplate!
	this.ctemplate = ctemplate;
	this.ptemplates = ptemplates;
	//console.log(ptemplates); VA OK!
	this.loadDocument(callback);
}
SearchEngine.prototype.getInstanceObjectByOrder = function(num){ //public

	for (var i = 0; i < this.currentInstances.length; i++) {
		if (this.currentInstances[i].getOrder() ==  num)
			return this.currentInstances[i];
	}
	return;
}
SearchEngine.prototype.getCurrentObjectInstances = function(){ //public
	return this.currentInstances;
}
SearchEngine.prototype.setDecoratorClass = function(decorator){

	this.decoratorClass = decorator;
}
SearchEngine.prototype.getDecorator = function(){

	return this.decoratorClass;
}
SearchEngine.prototype.setMappings = function(mappings){

	this.mappings = mappings;
}
SearchEngine.prototype.loadDocument = function(callback){

	this.pageWorker = require("sdk/page-worker").Page({
		contentScriptFile: require("sdk/self").data.url("./src/js/externalPageForSearchEngine.js"),
		contentURL: this.ctemplate.getUrl(),
		contentScriptWhen: "end" 
	});
	var me = this;
	this.onExternalPageLoaded = function(data){ //{url, textContent}
		
		me.document = NsIDomParser.parseFromString(data.textContent, "text/html"); //.wrappedJSObject;
		callback(data);
	};
	this.pageWorker.port.on("externalPageIsLoaded", function(data){
		if(me.onExternalPageLoaded) me.onExternalPageLoaded(data);
	});
}
SearchEngine.prototype.loadInstances = function(){

	//gets the xath of the concept, so we get the current page's instance objects
    var xmlinstances = this.document.evaluate(this.ctemplate.getXpath(), this.document, null, 4, null); //4 = many
    var nodes = [], res = xmlinstances.iterateNext();

    while (res) {
    	//CREATING THE INSTANCE OBJECT
        var iobject = new InstanceObject({
        	value: res.textContent, 
			name: this.ctemplate.getName(),
			tag: this.ctemplate.getTag(),
			id: this.ctemplate.getId(),
        	xpath: this.ctemplate.getXpath(),
        	url: this.ctemplate.getUrl(),
        	index: this.lastIndex,
        	domElem: res.innerHTML
        }); 
    	this.lastIndex++;
        //CREATING THE PROPERTIES
        var distinctUrl = [];
        var ioXpath = this.xpathInterpreter.engine[2].getPath(res);

        // TODO: HAY QUE GUARDAR CON QUE XPATH ENGINE FUE EXTRAIDO, SINO ACÁ CHAU!

        if(ioXpath){
        	ioXpath= ioXpath[0]; 
        	iobject.setXpath(ioXpath);
        	
        	//console.log("PROPERTIES TEMPLATES:", this.ptemplates, this.ptemplates.length);
	        if(this.ptemplates && this.ptemplates.length){
	        	console.log("trying to load props...");
		        for (var i = 0; i < this.ptemplates.length; i++) {
		        	var pinstance;
		        	if(this.ptemplates[i].getUrl() == this.ctemplate.getUrl()){
		        		var domElem = this.document.evaluate(
		        			ioXpath + "/" + this.ptemplates[i].getXpath(), this.document, null, 9, null);
		        		if(domElem && domElem.singleNodeValue){
		        			iobject.addProperty({
		        				value: domElem.singleNodeValue.textContent, 
								name: this.ptemplates[i].getName(),
								tag: this.ptemplates[i].getTag(),
								id: this.ptemplates[i].getId(),
					        	xpath: this.ptemplates[i].getXpath(),
					        	domElem: domElem.singleNodeValue.outerHTML
		        			});
		        		}else{
		        			iobject.addProperty({
		        				value: " ", 
								name: this.ptemplates[i].getName(),
								tag: this.ptemplates[i].getTag(),
								id: this.ptemplates[i].getId(),
					        	xpath: this.ptemplates[i].getXpath(),
					        	domElem: " "
		        			});
		        		}
		        	}else{
		        		distinctUrl.push(this.ptemplates[i]);
		        	}
		        }
		    }
		}
        nodes.push(iobject);  
        res = xmlinstances.iterateNext(); //next!
    }

    if(distinctUrl && distinctUrl.length && distinctUrl.length > 0){
    	console.log('TODO: You should request and add external properties'); //TODO
    }

    //APPLYING THE DECORATOR
    nodes = this.applyDecorator(nodes);	

    if(this.ctemplate.getMappings) this.applyMappedParams(this.ctemplate.getMappings(), nodes);
    if(this.ctemplate.getSelectedMessages) this.applySelectedMessages(this.ctemplate.getSelectedMessages(), nodes);
    this.currentInstances = nodes; //Cu.cloneInto( nodes, utils.getMostRecentBrowserWindow().content.wrappedJSObject, { cloneFunctions: true });
}
SearchEngine.prototype.checkNavigationComponent = function(elemName){
	//Checks if exists in database && current loaded DOM
	return (this.checkNavComponentInDB() && this.checkNavComponentInDOM);
}
SearchEngine.prototype.loadSearchEngineUiComponents = function(){
	//Checks if exists in database 
	if(this.ctemplate){
		var data = this.persistence.getSearchEngineData(this.ctemplate.getId());
		if(!data) return;

		this.components = {}; 
		this.componentsXpaths = {};
		if(data.entry) this.loadComponentFromXpath("entry", data.entry);
		if(data.trigger) this.loadComponentFromXpath("trigger", data.trigger);
		if(data.next) this.loadComponentFromXpath("next", data.next);
		if(data.prev) this.loadComponentFromXpath("prev", data.prev);
	}
	else return;
}
SearchEngine.prototype.isNavigationPossible = function(key, xpath){
	return (this.components["next"] || this.components["prev"])? true:false;
}
SearchEngine.prototype.isSearchPossible = function(key, xpath){
	return (this.components["entry"] && this.components["trigger"])? true:false;
}
SearchEngine.prototype.loadComponentFromXpath = function(key, xpath){
	try{
		if(xpath && xpath.length >0 && xpath.trim().length > 0){
			var domElem = this.document.evaluate(xpath, this.document, null, 9, null);

			if(domElem && domElem.singleNodeValue){
				this.components[key] = domElem.singleNodeValue;
				// The following line is not definitive, just for testing purposes:
				this.componentsXpaths[key] = xpath;
			}
		}
	}catch(err){ console.log(err);}
}
SearchEngine.prototype.checkNavComponentInDB = function(elemName){
	//Checks if exists in database 
	if(this.ctemplate){
		var data = this.persistence.getSearchEngineData(this.ctemplate.id);
		return (data && data[elemName]);
	}
	else return false;
}
SearchEngine.prototype.checkNavComponentInDOM = function(elemName){
	//Checks if exists in current loaded DOM (loaded with loadSearchEngineUiComponents)
	return (this.components[elemName]);
}
SearchEngine.prototype.applyDecorator = function(ois){

	console.log(this.decoratorClass);
	if(this.decoratorClass == undefined){
		console.log("There is no decorator to apply");
		return ois;
	}
	var wrapped = [];
	for (var i = 0; i < ois.length; i++) {
		wrapped.push(new this.decoratorClass(ois[i], this.lang));
	}
	return wrapped;
}
SearchEngine.prototype.decorate = function(io, decoratorClass){

	if(decoratorClass == undefined)
		return;
	
	var decorator = this.getDecoratorClass(decoratorClass);
	return new decorator(io, this.lang);
}
SearchEngine.prototype.applyMappings = function(ios){
	//TODO: Mappings should be part of the decorator! not stored in the search engine

	if(this.mappings == undefined)
		return;

	for (var i = 0; i < ios.length; i++) {
		for (var j = 0; j < this.mappings.length; j++) {
			var prop = ios[i].getPropertyByTemplateId(this.mappings[j].propId);
			if(prop) ios[i][this.mappings[j].id] = prop.getValue();
		}
	}
}
SearchEngine.prototype.applyMappedParams = function(templateMappings, ios){
	//TODO: Mappings should be part of the decorator! not stored in the search engine
	// templateMappings = {messageId, propName}
	if(templateMappings == undefined || templateMappings.length == 0)
		return;
	
	for (var i = 0; i < ios.length; i++) { 
		for (var j = 0; j < templateMappings.length; j++) {
			
			ios[i].mapMessageParam( templateMappings[j].messageId, 
				templateMappings[j].propName);
		}
	}
}
SearchEngine.prototype.applySelectedMessages = function(templateMessages, ios){
	//TODO: Mappings should be part of the decorator! not stored in the search engine

	if(templateMessages == undefined || templateMessages.length == 0)
		return;

	for (var i = 0; i < ios.length; i++) {
		for (var j = 0; j < templateMessages.length; j++) {
			ios[i].selectMessage(templateMessages[j].id);
		}
	}
}
SearchEngine.prototype.loadXPathInterpreter = function(){

	//const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
	var scope = sandbox(utils.getMostRecentBrowserWindow());
	load(scope, 'resource://woa-at-lifia-dot-info-dot-unlp-dot-edu-dot-ar/data/src/js/xpathManagement.js');    
	this.xpathInterpreter = new scope.XPathInterpreter();
}
SearchEngine.prototype.prevConceptInstances = function(callback){

	var me = this;	
	this.onExternalPageLoaded = function(dta){ //{url, textContent}
		
		me.document = NsIDomParser.parseFromString(dta.textContent, "text/html");
		me.loadInstances();
		if(callback) callback();
	};
	this.pageWorker.port.emit("clickElement", {
		id: this.componentsXpaths["prev"]
	});
}
SearchEngine.prototype.nextConceptInstances = function(callback){

	var me = this;	
	this.onExternalPageLoaded = function(dta){ //{url, textContent}
		
		me.document = NsIDomParser.parseFromString(dta.textContent, "text/html");
		me.loadInstances();
		if(callback) callback();
	};
	this.pageWorker.port.emit("clickElement", {
		id: this.componentsXpaths["next"]
	});
}
SearchEngine.prototype.searchConceptInstances = function(keywords, callback){

	if(keywords && keywords.length > 0 && keywords.trim().length >0){
		this.components["entry"].value = keywords;
		var me = this;	
		this.onExternalPageLoaded = function(dta){ //{url, textContent}

			me.document = NsIDomParser.parseFromString(dta.textContent, "text/html");
			me.loadInstances();
			if(callback) callback();
		};
		this.pageWorker.port.emit("searchNewInstances", {
			entry: this.componentsXpaths["entry"],
			trigger: this.componentsXpaths["trigger"],
			keywords: keywords
		});
	}
}
/*
	TODO: ACÁ FALTA TODO EL TEMA DE LA NAVEGACIÓN. 
	* Los xpath ya están disponibles en la base de datos (si el usuario los colectó)
	* Hay que verificar que estén todos, que correspondan con un elemento en el dom extraido (this.document)
	* Hay que habilitar una sección nueva en el <div id="manage-concept-instances" 
	* Para mostrar las opcionesde búsqueda y navegación
*/

exports.getInstance = function(lang) {
    return new SearchEngine(lang);
}
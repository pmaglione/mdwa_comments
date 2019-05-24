var tabs = require("sdk/tabs");
var utils = require('sdk/window/utils');
var tabsUtils = require('sdk/tabs/utils');
var Request = require("sdk/request").Request;
var { ActionButton } = require('sdk/ui/button/action');

var {Ci, Cu, Cc, CC} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
var { InstanceObjectTemplate, IOPropertyTemplate } = require("./templates").getClasses();

function ExtensionManager(locale){
	this.locale = locale;
	this.persistence = require("./persistence").getInstance();
	this.collectors = require("./collectors").getInstances(this.locale('lang_code_helper'));
	this.decorators = require("./decorators").getClasses(this.locale('lang_code_helper')); //this.getWrappersClasses(); 
	this.searchEngine = require("./searchEngine").getInstance(this.locale('lang_code_helper'));
	this.temp = {};
	this.currCTemplateId;
	this.clickedInstanceId; 
	this.appMaker = require('./appMaker.js').getInstance();
	this.uuid;
	this.initialize();
}
ExtensionManager.prototype.initialize = function() {
	var cig = Ci;
	var ccg = Cc;
	var uuidGenerator = ccg["@mozilla.org/uuid-generator;1"].getService(cig.nsIUUIDGenerator);
	var uuid = uuidGenerator.generateUUID();
	this.uuid = uuid.toString();

	this.createBaseMenuItems();
	this.createPimSidebar();
	this.appMaker.createAppMakerUI();
	this.createExtensionMainButton();
}
ExtensionManager.prototype.addIframeToDocument = function (mainDoc, url) {
	var newNode = mainDoc.createElement("iframe");
    newNode.src = url;
    newNode.height = 150;
    newNode.width = "99%";
    newNode.setAttribute("id", "augmentation_data_div");
    newNode.setAttribute("style", "z-index: 9999;position: fixed;bottom:0;left:0;right:0;margin: 10px;background:white;border: 1px solid #4CAF50;");

    mainDoc.getElementsByTagName("body")[0].appendChild(newNode);
}
ExtensionManager.prototype.addElemAfter = function (mainDoc, url, dom_elem) {
	var newNode = mainDoc.createElement("iframe");
    newNode.src = url;
    newNode.height = 150;
    newNode.width = "99%";
    newNode.setAttribute("id", "augmentation_data_div");
    newNode.setAttribute("style", "z-index: 9999;position: float;margin: 10px;background:white;border: 1px solid #4CAF50;");

    dom_elem.parentNode.insertBefore(newNode, dom_elem.nextSibling);
}
ExtensionManager.prototype.showProductionError1 = function (mainDoc) {
	var url = "http://freecd023-freeapp.eu.webratio.net/error1";
	this.addIframeToDocument(mainDoc, url);
}
ExtensionManager.prototype.showProductionError2 = function (mainDoc) {
	var url = "http://freecd023-freeapp.eu.webratio.net/error2";
	this.addIframeToDocument(mainDoc, url);
}
ExtensionManager.prototype.showProductionError3 = function (mainDoc) {
	var url = "http://freecd023-freeapp.eu.webratio.net/error3";
	this.addIframeToDocument(mainDoc, url);
}
ExtensionManager.prototype.callServiceAugmentation = function () {
    //buscar xpath y ejecutar
    //xpath provenientes del servidor para sitio especifico

    var tab = tabsUtils.getActiveTab(utils.getMostRecentBrowserWindow());
    var ownerWindow = tabsUtils.getTabContentWindow(tab);
    var mainDoc = tabsUtils.getBrowserForTab(tab).contentDocument;

    var ownerWindowHref = tabsUtils.getURI(tab);

    var man = this;

    var cors = "";

    var concepts = this.persistence.getCTemplates();

    var title = concepts[0].getName();
    var xpath = concepts[0].getXpath();

    x_path_engine = this.collectors[0].getXpathEngine();
    var dom_elem = x_path_engine.getElementByXPath(xpath, mainDoc);

    var baseUrl = "http://localhost:8080/CommentService/page1/";

    var urlToCall = cors + baseUrl + title;

    //man.addIframeToDocument(mainDoc, encodeURI(urlToCall));

    man.addElemAfter(mainDoc, encodeURI(urlToCall), dom_elem);


	//var cors = "https://crossorigin.me/";
	// var cors = "https://cors-anywhere.herokuapp.com/";

 //    var irapi_get = cors + "http://irapi.herokuapp.com/web/get_concepts?url=" + ownerWindowHref;

 //    var peticion_irapi = new ownerWindow.XMLHttpRequest();

 //    x_path_engine = this.collectors[0].getXpathEngine();

 //    var man = this;

 //    peticion_irapi.open('GET', irapi_get, true);
 //    peticion_irapi.onreadystatechange = function(){
 //        if(peticion_irapi.readyState == 4) {
 //            if(peticion_irapi.status == 200) {
 //            	ownerWindow.console.log("[INFO] Respuesta exitosa de IRAPI");
 //                var response = JSON.parse(peticion_irapi.responseText);	

 //                if (response.Success == true) {
 //                	ownerWindow.console.log("[INFO] Inicio extraccion de datos");
 //                	var concepts = response.Concepts;

 //                	ownerWindow.console.log(concepts);

 //                	var concept1 = concepts[0].Xpath;
 //                	var concept2 = concepts[1].Xpath;
 //                	var concept3 = concepts[2].Xpath;

 //                	var attr1xpath = concept1.replace(new RegExp("\\\\", 'g'), "");
 //                	var attr2xpath = concept2.replace(new RegExp("\\\\", 'g'), "");
 //                	var attr3xpath = concept3.replace(new RegExp("\\\\", 'g'), "");

 //                	var attr1Element = x_path_engine.getElementByXPath(attr1xpath, mainDoc);
 //                	var attr1 = "";
 //                	if (attr1Element != null) {
 //                		attr1 = attr1Element.innerHTML;
 //                		ownerWindow.console.log(attr1);
 //                	}else{
 //                		ownerWindow.console.log("[ERROR] Error en la extraccion del Atributo 1");
 //                		man.showProductionError3(mainDoc);
 //                	}
                	
 //                	var attr2Element = x_path_engine.getElementByXPath(attr2xpath, mainDoc);
 //                	var attr2 = "";
 //                	if (attr2Element != null) {
 //                		attr2 = attr2Element.innerHTML;
 //                		ownerWindow.console.log(attr2);
 //                	}else{
 //                		ownerWindow.console.log("[ERROR] Error en la extraccion del Atributo 2");
 //                		man.showProductionError3(mainDoc);
 //                	}

 //                	var attr3Element = x_path_engine.getElementByXPath(attr3xpath, mainDoc);
 //                	var attr3 = "";
 //                	if (attr3Element != null) {
 //                		attr3 = attr3Element.innerHTML;
 //                		ownerWindow.console.log(attr3);
 //                	}else{
 //                		ownerWindow.console.log("[ERROR] Error en la extraccion del Atributo 3");
 //                		man.showProductionError3(mainDoc);
 //                	}

 //                	var attr4Element = "";
 //                	var attr4 = "";
 //                	if (response.Category == "fertilizer")
 //                	{
 //                		var concept4 = concepts[3].Xpath;
 //                		var attr4xpath = concept4.replace(new RegExp("\\\\", 'g'), "");
 //                		attr4Element = x_path_engine.getElementByXPath(attr4xpath, mainDoc);
	//                 	if (attr4Element != null) {
	//                 		attr4 = attr4Element.innerHTML;
	//                 		ownerWindow.console.log(attr4);
	//                 	}else{
	//                 		ownerWindow.console.log("[ERROR] Error en la extraccion del Atributo 4");
	//                 		man.showProductionError3(mainDoc);
	//                 	}
 //                	}

 //                	//llamado al servicio de produccion
 //                	if (attr1 != null && attr2 != null && attr3 != null)
 //                	{
 //                		attr1 = attr1.replace("/", "");
 //                		attr2 = attr2.replace("/", "");
 //                		attr3 = attr3.replace("/", "");
                		
	// 					var uuid = man.uuid;

 //                		var parameters = "";
 //                		var selectedService = "";
 //                		switch(response.Category) {
	// 					    case "seed":
	// 					        selectedService = "http://freecd023-freeapp.eu.webratio.net/pcu1/";
	// 					        parameters = uuid + "/" + attr1 + "/" + attr2 + "/" + attr3;
	// 					        break;
	// 					    case "fertilizer":
	// 					        selectedService = "http://freecd023-freeapp.eu.webratio.net/pcu2/";
	// 					        attr4 = attr4.replace("/", "");
	// 					        parameters = uuid + "/" + attr1 + "/" + attr2 + "/" + attr3 + "/" + attr4;
	// 					        break;
	// 					    case "pesticide":
	// 					        selectedService = "http://freecd023-freeapp.eu.webratio.net/pcu3/";
	// 					        parameters = uuid + "/" + attr1 + "/" + attr2 + "/" + attr3;
	// 					}

				        
	// 			        var urlToCall = selectedService + parameters;

	// 			        ownerWindow.console.log(urlToCall);

	// 			        //borrado div anterior
	// 			        var previousIframe = mainDoc.getElementById("augmentation_data_div");
	// 			        if (previousIframe) {
	// 			        	previousIframe.parentElement.removeChild(previousIframe);
	// 			        }
				    
	// 			    	man.addIframeToDocument(mainDoc, encodeURI(urlToCall));
	// 			    }
                	
            	
	// 			}else{
 //                    ownerWindow.console.log("[ERROR] No se encontraron conceptos registrados en IRAPI");
 //                    man.showProductionError2(mainDoc);
	// 			}
 //            }else{
 //                ownerWindow.console.log("[ERROR] Ocurrio un error en la comunicacion con el servidor IRAPI");
 //                man.showProductionError1(mainDoc);
 //            }
 //        }
 //    };
    peticion_irapi.send();
}
ExtensionManager.prototype.getDecoratorClass = function(classname){

	for (var i = 0; i < this.decorators.length; i++) {
		if (this.decorators[i].name == classname)
			return this.decorators[i];
	}
	return;
}
ExtensionManager.prototype.emitMessageFromSidebar = function(params) {

	var io = this.searchEngine.getInstanceObjectByOrder(params.instance);
	if(io && io[params.message]) {
		io[params.message](params.callback);
	} else console.log("The message does not exist.");
};
ExtensionManager.prototype.emitClassMessageFromSidebar = function(params) {

	var me = this;
	this.loadTemplateConfiguration(params.templateId, function(){

		var io = me.searchEngine.getCurrentObjectInstances(); //TODO: getFirstIO()

		if(io && io.length && io.length>0){
			if(io[0][params.message]) {
				io[0][params.message](params.callback);
			} else console.log("The message does not exist.");
		}
	});
};
ExtensionManager.prototype.getConceptInstancesContextMenu = function(messages){

	if(messages.length < 1){
		utils.getMostRecentBrowserWindow().alert(this.locale("no_configured_message"));
		return;
	}
	var sidebarWindow = utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow;
	var menupopup = sidebarWindow.document.getElementById("contentAreaContextMenu");
	var man = this;
	var menus = [];
	var existingMessages = sidebarWindow.document.getElementsByClassName("woa-message");
	for (var i = 0; i < existingMessages.length; i++) {	existingMessages[i].remove(); }

	for (var i = 0; i < messages.length; i++) {
		var menuItem = this.createChildContextMenu({ //SIDEBAR INSTANCE MESSAGES
			id: messages[i].id,
			label: messages[i].name,
			menu: menupopup,
			callback: function(evt){
				// Clicked menssage & instance id
				man.sidebarWorker.port.emit("enableLoading");
				console.log(evt);
				man.emitMessageFromSidebar({
					message: evt.target.id,
					instance: man.clickedInstanceId,
					callback: function() { man.sidebarWorker.port.emit("disableLoading"); }
				});
			},
			doc: sidebarWindow.document,
			className: "woa-message"
		});
		menus.push(menuItem);
	}
	return menus;
}
ExtensionManager.prototype.loadContextMenuForSidebar = function(){
	// Creates all the XUL menu elements for context at sidebar. They can be accessed by
	// right click at the gear icon of each template thumbnail.
	var sidebarWindow = utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow;
	var menupopup = sidebarWindow.document.getElementById("contentAreaContextMenu");
	this.hideContextMenuItems(menupopup.childNodes);

	var man = this;
	this.sidebarContextMenus = {};
	this.sidebarContextMenus['mEditTemplate']= this.createParentContextMenu({ //MESSAGES
		id: 'woa-edit',
		label:man.locale('edit'),
		menu: menupopup,
		doc: sidebarWindow.document
	});

		this.createChildContextMenu({
			id: 'woa-manage-concept-templates', 
			label: man.locale('edit_concept'),
			menu: this.sidebarContextMenus['mEditTemplate'],
			doc: sidebarWindow.document,
			callback: function(){
				man.sidebarWorker.port.emit("editCTemplate", man.persistence.getCTemplateById(man.currCTemplateId));
			}
		});
		this.createChildContextMenu({
			id: 'woa-manage-properties', 
			label: this.locale('edit_properties'),
			menu: this.sidebarContextMenus['mEditTemplate'],
			callback: function(){ man.managePTemplates(); },
			doc: sidebarWindow.document
		});
		this.createChildContextMenu({
			id: 'woa-search-engine', 
			label: this.locale('edit_search_engine'),
			menu: this.sidebarContextMenus['mEditTemplate'],
			callback: function(){ man.sidebarWorker.port.emit("editSearchEngine", man.persistence.getSearchEngineData(man.currCTemplateId)); },
			doc: sidebarWindow.document
		});
		this.createChildContextMenu({
			id: 'woa-functionality', 
			label: this.locale('edit_decorator'),
			menu: this.sidebarContextMenus['mEditTemplate'],
			callback: function(){ man.editDecorator(); },
			doc: sidebarWindow.document
		});

	this.sidebarContextMenus["mInstances"] = this.createChildContextMenu({
		id: 'woa-template-instances', 
		label: this.locale('view_template_instances'),
		menu: menupopup,
		callback: function(evt){
			man.accessConceptInstances(man.currCTemplateId);
		},
		doc: sidebarWindow.document
	});
	this.sidebarContextMenus["mMessages"] = this.createParentContextMenu({ //MESSAGES
		id: 'woa-messages',
		label:this.locale('decorator_available_messages'),
		menu: menupopup,
		doc: sidebarWindow.document
	});
	this.sidebarContextMenus["mRemove"] = this.createChildContextMenu({
		id: 'woa-remove', 
		label: this.locale('remove_concept'),
		menu: menupopup,
		callback: function(evt){
			man.sidebarWorker.port.emit("removeFullConceptTemplate", man.currCTemplateId);
		},
		doc: sidebarWindow.document
	});

	this.loadPopupEventsInSidebar(menupopup, sidebarWindow);

	console.log(this.sidebarContextMenus);
}
ExtensionManager.prototype.loadPopupEventsInSidebar = function(menupopup, sidebarWindow){

	var man = this;
	man.sidebarListener = function(e) {
		if(e.eventPhase<3) {

			if(e.target.triggerNode && e.target.triggerNode.className.indexOf('woa-cog-concept') != -1 ){
				//Other e.eventPhases just repeat the action when another sub-menu is opened
				man.currCTemplateId = e.target.triggerNode.parentElement.parentElement.parentElement.id;
				man.createClassMessagesForDecorator( man.sidebarContextMenus["mMessages"], man.currCTemplateId, sidebarWindow.document);
				man.showContextMenuItems([ man.sidebarContextMenus['mEditTemplate'], man.sidebarContextMenus["mInstances"], man.sidebarContextMenus["mMessages"], man.sidebarContextMenus["mRemove"]]);
			} else if(e.target.triggerNode && e.target.triggerNode.className.indexOf('btn-woa-instance-object') != -1){
				//console.log("from Instances View");
				man.clickedInstanceId = e.target.triggerNode.id;
				man.showContextMenuItems(man.instanceMenus);
			} else{
				man.clickedInstanceId = undefined;
				man.currCTemplateId = undefined;
			}
		}
	};
	menupopup.addEventListener("popupshowing", this.sidebarListener, false);
}
ExtensionManager.prototype.createClassMessagesForDecorator = function(menu, templateId, doc){

	menu.innerHTML = "";
	var decoClass = this.persistence.getDecoratorByCTemplateId(templateId).classname;
	var selMessages = this.getSelectedClassMessagesByWrapper(templateId, decoClass);
	var man = this;
	console.log("SELECTED CLASS MESSAGES", menu);
	for (var i = 0; i < selMessages.length; i++) {
		this.createChildContextMenu({
			id: selMessages[i].id, 
			label: selMessages[i].name,
			menu: menu,
			doc: doc,
			callback: function(evt){
				// Clicked menssage & instance id
				man.sidebarWorker.port.emit("enableLoading");
				man.emitClassMessageFromSidebar({
					message: evt.target.id,
					templateId: man.currCTemplateId,
					callback: function() { man.sidebarWorker.port.emit("disableLoading"); }
				});
			}
		});
	}
	
}
ExtensionManager.prototype.loadTemplateConfiguration = function(templateId, callback){
	//TODO: move this to search engine

	var template = this.persistence.getFullConceptTemplateData(templateId);
	//console.log("Getting the full templates data from db", template);
	//Instantiate the template and add all the props
	var io = new InstanceObjectTemplate(template.concept, undefined);

	for (var i = 0; i < template.properties.length; i++) {
		console.log("ADDING PROPERTY", template.properties[i]);
		io.addProperty(template.properties[i]);
	}
	var decoratorClassname = this.persistence.getDecoratorByCTemplateId(templateId).classname;
	var decorator = this.getDecoratorClass(decoratorClassname);
	var decoratedIO = new decorator(io, this.locale('lang_code_helper'));

	var mappings = this.persistence.getParamMappings(templateId);
	for (var j = 0; j < mappings.length; j++) {
		decoratedIO.mapMessageParam( mappings[j].id, 
			decoratedIO.getPropertyByTemplateId(mappings[j].propId).name);
	}
	var me = this;
	this.searchEngine.loadTemplates(
		decoratedIO, decoratedIO.getProperties().wrappedJSObject,
		function(dta){
			me.searchEngine.setDecoratorClass(decorator);
			me.searchEngine.loadInstances();
			if(callback) callback();
		}
	);
}
ExtensionManager.prototype.accessConceptInstances = function(templateId){

	this.sidebarWorker.port.emit("loadConceptInstancesView"); //The form
	this.sidebarWorker.port.emit("enableLoading"); // The effect

	var decorator = this.persistence.getDecoratorByCTemplateId(this.currCTemplateId).classname;
	var selMessages = this.getSelectedInstanceMessagesByWrapper(this.currCTemplateId, decorator);
	this.instanceMenus = this.getConceptInstancesContextMenu(selMessages);
	var me = this;
	this.loadTemplateConfiguration(templateId, function(){
		//TODO: I can't copy objects to another contexts, soI just can copy its data

		//console.log(me.searchEngine.getCurrentObjectInstances());
		me.cloneIntoSidebarContext({
			object: me.searchEngine.getCurrentObjectInstances(), 
			as:'woaInstanceObjects'
		});
		me.sidebarWorker.port.emit("loadConceptInstancesIntoView");
		me.loadSearchEngineUiComponents();
	});
}
ExtensionManager.prototype.loadSearchEngineUiComponents = function(){

	this.searchEngine.loadSearchEngineUiComponents();
	this.sidebarWorker.port.emit("showNavigationComponents", this.searchEngine.isNavigationPossible());
	this.sidebarWorker.port.emit("showSearchComponents", this.searchEngine.isSearchPossible());
}
ExtensionManager.prototype.cloneIntoSidebarContext = function(data){
	var unsafeWindow = this.getSidebarWindow();
	    unsafeWindow[data.as] = Cu.cloneInto( data.object, unsafeWindow, {
	        cloneFunctions: true
	    });	
}
ExtensionManager.prototype.browseApplications = function(){

	try{
		var window = utils.getMostRecentBrowserWindow();
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
			fp.init(window, this.locale("import_application"), Ci.nsIFilePicker.modeOpen);
			fp.appendFilter("JSON", "*.json");

		var rv = fp.show();
		if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace) {
			this.importApplication(fp.file);
		}
	}catch(err){
		console.log(err.message);
	}
}
ExtensionManager.prototype.importApplication = function(nsiFile){

	var data = this.readFileAsJSON(nsiFile);
	//Checking spec
	if(!(data && data.id && data.name && data.index)){
		utils.getMostRecentBrowserWindow().alert(this.locale('application_import_no_required_properties'));
		return;
	}

	//Getting the target dir
	var targetDir = FileUtils.getDir("ProfD", ["jetpack", "woa@lifia.info.unlp.edu.ar", "applications"], false);
	if(targetDir.exists()){
		targetDir.remove(true);
		targetDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
	}

	//Gerring the origin dir
	var originDir = nsiFile.parent;
		originDir.copyTo(targetDir, this.stringToDirArray(data.id));

	utils.getMostRecentBrowserWindow().alert(this.locale('app_successfully_imported'));
	this.sidebarWorker.port.emit("loadExistingApplications", this.getExistingApplications());
}
ExtensionManager.prototype.openApplication = function(path){

	var extManager = this;
	//THIS OBJECT WILL BE THE "API"
	function WOA(){
		var content = utils.getMostRecentBrowserWindow().content;
    	this.getUserStoredCTemplatesData = function(){
    		return extManager.persistence.getCTemplates();
    	}
    	this.getDecoratorClasses = function(){
    		//If the method needs to return something to "the other side",
    		//it's necessary to clone the results before returning them.
    		//Otherwise, you can return just strings
    		return Cu.cloneInto( extManager.getWrappersData(), 
    			content.wrappedJSObject, {
	            cloneFunctions: true
	        });	
    	}
    	this.newInformationObjectTemplate = function(data){
    		return Cu.cloneInto( new InstanceObjectTemplate(data, content), 
    			content.wrappedJSObject, {
	            cloneFunctions: true
	        });	
    	}
    	this.newDecorator = function(decoratorClassname, iot){
    		var decoClass = extManager.getDecoratorClass(decoratorClassname);
    		var decoInstance = new decoClass(iot.wrappedJSObject, extManager.locale('lang_code_helper'));

    		return Cu.cloneInto( decoInstance,
    			content.wrappedJSObject, {
	            cloneFunctions: true
	        });	
    	}
    	this.getInformationObjects = function(infoObjectTemplate, callback){
    		//If the method needs to return something to "the other side",
    		//it's necessary to clone the results before returning them.
    		//Otherwise, you can return just strings
    		// infoObjectTemplate --> 	{ concept: { dbp: id: imageSrc: name: selected: tag: url: xpath: }, 
    		//							properties: [ { dbp: id: imageSrc: name: selected: tag: url: xpath: } ] }
    		var iot = infoObjectTemplate.wrappedJSObject;   
    		var searchEngine = require("./searchEngine").getInstance(extManager.locale('lang_code_helper'));
			searchEngine.loadTemplates(
				iot, iot.getProperties(),
				function(){
					searchEngine.setDecoratorClass(extManager.getDecoratorClass(iot.getClassName()));
					searchEngine.loadInstances();
					var instances = Cu.cloneInto( searchEngine.getCurrentObjectInstances(), content.wrappedJSObject, { cloneFunctions: true });
					callback(instances);
				}
			);
    	}
    	this.getDecoratorsFor = function(tag){
    		var array = [];
    		for (var i = 0; i < extManager.decorators.length; i++) {
    			array.push(new extManager.decorators[i]());	
    		};
    		return Cu.cloneInto( array, 
    			content.wrappedJSObject, 
    			{ cloneFunctions: true }
    		);	
    	}
    };
    //THEN, WE OPEN THE APP AND...
	tabs.open({
		url: 'file:///' + path,
		onReady: function(tab) {
			try{
				// INSTANTIATE AND CLONE THE WOA OBJECT
				var content = utils.getMostRecentBrowserWindow().content;
				content.wrappedJSObject.WOA = Cu.cloneInto(new WOA(), content.wrappedJSObject, {
		            cloneFunctions: true
		        });	
				content.wrappedJSObject.initWOAscript();
			}catch(err){
				console.log(err);
			}
		}
	});
}
ExtensionManager.prototype.stringToDirArray = function(str){

	var dirArray = str.replace(/@/g, "-at-");
		dirArray = dirArray.replace(/\./g, "-dot-");
	return dirArray;
}
ExtensionManager.prototype.removeFile = function(appName){

	var appFolder = this.stringToDirArray(appName); // appName = dr-dashboard@lifia.info.unlp.edu.ar;
	// dr-dashboard-at-lifia-dot-info-dot-unlp-dot-edu-dot-ar
	let file = FileUtils.getDir("ProfD", ["jetpack", "woa@lifia.info.unlp.edu.ar", "applications", appFolder], true);
	if(file.exists() && file.isDirectory()){
		file.remove(true);
	}
}
ExtensionManager.prototype.readFileAsJSON = function(nsiFile){

	var data = this.readFileContent(nsiFile);
	return JSON.parse(data);
}
ExtensionManager.prototype.readFileContent = function(nsiFile){

	var data = "";
	if(nsiFile.exists())
	{
		var data = "";
		var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		var cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
		fstream.init(nsiFile, -1, 0, 0);
		cstream.init(fstream, "ISO-8859-1", 0, 0);
		 
		let str = {};
		let read = 0;
		do { 
			read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
			data += str.value;
		} while (read != 0);
		
		cstream.close(); 
	}
	return data;
}
ExtensionManager.prototype.editDecorator = function(){

	var concept = this.persistence.getCTemplateById(this.currCTemplateId);
	var applDecos = this.getApplicableWrappersData(concept.tag, concept.dbp); 
	var selected = this.persistence.getDecoratorByCTemplateId(this.currCTemplateId); //id classname
	this.sidebarWorker.port.emit("editDecorator", applDecos, selected);
}
ExtensionManager.prototype.getSelectedMessagesByWrapper = function(id, classname){

	var totalMessages = this.getAvailableMessagesByDecorator(classname),
		selectedMessages = [], 
		aux = this.persistence.getMessagesByDecoratorId(id);
	if(totalMessages == undefined) return;

	for (var i = 0; i < totalMessages.length; i++) { 
		if(aux.indexOf(totalMessages[i].id) != -1)
			selectedMessages.push(totalMessages[i]);
	};
	return selectedMessages;
}
ExtensionManager.prototype.getSelectedInstanceMessagesByWrapper = function(id, classname){

	var messages = this.getSelectedMessagesByWrapper(id, classname), iMessages=[];
	for (var i = 0; i < messages.length; i++) {
		if(!(messages[i].class && messages[i].class == true))
			iMessages.push(messages[i]);
	}
	return iMessages;
}
ExtensionManager.prototype.getSelectedClassMessagesByWrapper = function(id, classname){

	var messages = this.getSelectedMessagesByWrapper(id, classname), iMessages=[];
	for (var i = 0; i < messages.length; i++) {
		if(messages[i].class && messages[i].class == true)
			iMessages.push(messages[i]);
	}
	return iMessages;
}
ExtensionManager.prototype.managePTemplates = function(){

	this.sidebarWorker.port.emit("managePTemplates", 
		this.persistence.getCTemplateById(this.currCTemplateId),
		this.persistence.getPTemplatesByCTemplateId(this.currCTemplateId)
	);
}
ExtensionManager.prototype.getApplicableWrappersData = function(tag, entity){
	
	var wrappers = this.getWrappersData(), applicants = [];
	for (var i = 0; i < wrappers.length; i++) {
		if(	wrappers[i].entity == entity || wrappers[i].entity == "*" ||
		  (	wrappers[i].tags.length > 0 && (wrappers[i].tags.indexOf(tag.toLowerCase()) != -1 || wrappers[i].tags.indexOf("*") != -1 )))
			applicants.push(wrappers[i]);
	};
	return applicants;
}
ExtensionManager.prototype.getWrappersData = function(){

	var decorators = [];
	for (var i = 0; i < this.decorators.length; i++) {
		if(this.decorators[i]['getDisplayName']) {
			decorators.push({
				id: this.decorators[i].name,
				name: this.decorators[i].getDisplayName(),
				tags: this.decorators[i].getTags(),
				entity: this.decorators[i].getSemanticEntity()
			});
		} else console.log('You forgot to define an static getDisplayName method for ' + this.decorators[i].name + ' class. Omitting decorator.');
	};
	return decorators;
}
ExtensionManager.prototype.openSidebarContextMenu = function(e){
	try{
		var sidebarWindow = utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow;
		var menupopup = sidebarWindow.document.getElementById("contentAreaContextMenu");
	  	menupopup.openPopup(null, "", e.clientX, e.clientY, true, false);
	}catch(err){
		console.log(err.message);
	}
}
ExtensionManager.prototype.devMode = function(){
	//Just for developers. This function should be commented before extension be published. 
	//This is for forcing console level, so we can see everything despite the new extension installing methos
	/*require("sdk/preferences/service").set( //jid1-8RskSx1RnMDgug is our extension id
		"extensions.jid1-8RskSx1RnMDgug.sdk.console.logLevel", "all"
	);
	require("sdk/preferences/service").set( "extensions.sdk.console.logLevel", "all" );
	//So we can know every time the code is updated
	this.notify({ title: "WOA", text: "Debug mode on: extension was (re)loaded" });*/
	//For testing: Open the Browser Console
	var button = ActionButton({
        id: 'woa-console',
        label: 'Open console',
        badge: '▶',
        badgeColor: 'black',
        icon:'./src/img/icon-16.png',
        onClick: function(){
        	utils.getMostRecentBrowserWindow().document.getElementById('menu_browserConsole').doCommand();
        }
    });
}
ExtensionManager.prototype.notify = function(params) {
	require("sdk/notifications").notify({
		title: params.title,
		text: params.text
	});
}
ExtensionManager.prototype.createPimSidebar = function(config) {
	//TODO: This should be included in the extension manager, and getWorker instead getInstance
	var man = this;
	//if (win.location.href == "chrome://browser/content/web-panels.xul") console.log("sidebar is open");
	this.sidebar = require("sdk/ui/sidebar").Sidebar({ //can't set width
		id: 'woa-pim-sidebar',
		title: ' ',
		url: require("sdk/self").data.url("./pim-sidebar.html"),
		onAttach: function (worker) {
			man.initializeSidebarPorts(worker);
			man.sidebar.isOpen = false;
		},
		onReady: function (worker) {
			//Pasa el bundle localizado como parámetro e inicializa el comportamiento asociado al sidebar
			//Shares the localized bundle with the sidebar and initialized the sidebar behaviour
			worker.port.emit("initSidebar",{ locale: man.getJSONLocalizedBundle() });
		},
		onShow: function () {
			man.sidebar.isOpen = true;
			man.onSidebarReady(); 
		},
		onHide: function () {
			man.sidebar.isOpen = false;
			man.unloadPopupEventsInSidebar();
		}
	});
}
ExtensionManager.prototype.unloadPopupEventsInSidebar = function(){

	var sidebarWindow = utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow;
	if(sidebarWindow){
		var menupopup = sidebarWindow.document.getElementById("contentAreaContextMenu");
			menupopup.removeEventListener("popupshowing", this.sidebarListener, false);
			console.log("Events from sidebar were removed");
	} else console.log("Sidebar was not open, so it's not necessary to unload events.");
}
ExtensionManager.prototype.disableCTemplatesSelection = function() {
	try{
		this.currentWorker.port.emit("disableSelection");
		//this.restoreExternalContextMenuItems();
		//this.hideInternalContextMenuItems();
	}catch(err){}	
}
ExtensionManager.prototype.enableCTemplatesSelection = function() {
	
	this.showInternalContextMenuItems();
	var man = this;

	this.currentWorker = this.getWorker({
		jsFiles: [
			"./lib/js/jquery-1.11.3.min.js",
			"./lib/js/jquery-ui-1.11.min.js",
			"./src/js/xpathManagement.js",
			"./src/js/webPageManager.js"],
		cssFiles: [
			"./lib/js/jquery-ui.min.css",
			"./src/css/dom-elem-selection.css"
		]
	});
	this.currentWorker.port.emit("enableSelection");
};
ExtensionManager.prototype.hideInternalContextMenuItems = function(){

	/*var elems = this.getInternalContextMenuElements();

	if(elems!=undefined && elems.length && elems.length > 0){
		for (var i = 0; i < elems.length; i++) {
			elems[i].style.visibility = "hidden";
			elems[i].style.display = "none";
		};
	}*/
}
ExtensionManager.prototype.showContextMenuItems = function(elems){
	//TODO: refactor con los otrs similares
	/*if(elems && elems.length && elems.length > 0){
		for (var i = 0; i < elems.length; i++) {
			elems[i].style.visibility = "visible";
			elems[i].style.display = "";
		};
	}*/
}
ExtensionManager.prototype.showInternalContextMenuItems = function(){

	/*var elems = this.getInternalContextMenuElements();
	console.log();

	for (var i = 0; i < elems.length; i++) {
		elems[i].style.visibility = "visible";
		elems[i].style.display = "";
	};*/
}
ExtensionManager.prototype.getInternalContextMenuElements = function(){

	return [
		this.conceptsMenu,
		this.propertiesMenu,
		this.searchEngineMenu
	];
}
ExtensionManager.prototype.hideContextMenuItems = function(childNodes){

	if(childNodes && childNodes.length && childNodes.length > 0)
		for (var i = 0; i < childNodes.length; i++) {
	  		childNodes[i].setAttribute("display-before-woa", childNodes[i].style.display.toString());
	  		childNodes[i].setAttribute("display-before-woa", childNodes[i].style.visibility.toString());
	  		//childNodes[i].hidden = true; //NOT WORKING!
	  		childNodes[i].style.visibility = "hidden";
	  		childNodes[i].style.display = "none";
		}
};
ExtensionManager.prototype.restoreExternalContextMenuItems = function(){

	/*var window = utils.getMostRecentBrowserWindow();
	var childNodes = window.document.getElementById("contentAreaContextMenu").childNodes;

	for (var i = 0; i < childNodes.length; i++) {
		//childNodes[i].hidden = false; //NOT WORKING!
		childNodes[i].style.display = childNodes[i].getAttribute("display-before-woa");
		childNodes[i].style.visibility = childNodes[i].getAttribute("visibility-before-woa");
	};	*/
};
ExtensionManager.prototype.getJSONLocalizedBundle = function() {
	//Loads the needed localized strings
	var bundle = {}; 
	var keys = this.getKeysFromDefaultBundle();
	for (var i = 0; i < keys.length; i++) {
		bundle[keys[i]] = this.locale(keys[i]);
	}

	return bundle;
}
ExtensionManager.prototype.showContextMenu = function(data) { //width height options
	var man = this;
	var panel = require("sdk/panel").Panel({
		width: data.width, 
  		height: data.height, 
		contentURL: require("sdk/self").data.url("contextual-menu.html")
	});
	panel.port.on("resizeContextMenuWindow", function(size) {
		panel.resize( size.width, size.height); //p.width, p.height);
	});
	//Registers the listeners and handlers. 
	var addedMsgs = [];
	for (var i = 0; i < data.opts.length; i++) {
		panel.port.on(data.opts[i].on.message, function(cbkData){ //try{

			man[cbkData.worker].port.emit(cbkData.message, cbkData.args);
			panel.destroy();
		});
	}
	//Load the items once the document has been loaded
	panel.port.on("contextMenuAlreadyLoaded", function(){
		for (var i = 0; i < data.opts.length; i++) {
			if (!data.opts[i].on.args) data.opts[i].on.args = null;
			this.emit('loadItem', data.opts[i]);
		}
		this.emit('adjustToContet');
	});
	//Show the panel 
	panel.show({
		position: {	
  			left: data.x,
  			top: data.y
  		}
	});
}
ExtensionManager.prototype.getSidebarWindow = function() {
	
	return utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow[0].wrappedJSObject;
}
ExtensionManager.prototype.focusSidebar = function() {

	utils.getMostRecentBrowserWindow().document.getElementById("sidebar").contentWindow.focus();
}
ExtensionManager.prototype.getMostRecentBrowserWindow = function() {

    return utils.getMostRecentBrowserWindow().document;
}
ExtensionManager.prototype.getKeysFromDefaultBundle = function(){
	//I know, this could be directly used. But I want to avoid using global and there are some benefits from the SDK, like the html tags
	var keys = [];
	try{
		var bnd = Services.strings.createBundle('resource://woa-at-lifia-dot-info-dot-unlp-dot-edu-dot-ar/locale/en-US.properties'); 
		var props = bnd.getSimpleEnumeration();
		
		while (props.hasMoreElements()) {
			keys.push(props.getNext().QueryInterface(Ci.nsIPropertyElement).key);
		}
	}catch(err){
		console.log(err.message);
	}
	return keys;
}
ExtensionManager.prototype.initializeSidebarPorts = function(sidebarWorker){

	this.sidebarWorker = sidebarWorker;
	var man = this;
	//CONTEXTUAL MAIN MENU: REFACTOR!!
	this.sidebarWorker.port.on("prevConceptInstances", function() {
		man.sidebarWorker.port.emit("enableLoading");
		man.searchEngine.prevConceptInstances(function(){

			man.cloneIntoSidebarContext({
				object: man.searchEngine.getCurrentObjectInstances(), 
				as:'woaInstanceObjects'
			});
			man.sidebarWorker.port.emit("loadConceptInstancesIntoView");
			man.loadSearchEngineUiComponents();
			man.sidebarWorker.port.emit("disableLoading");
		});
	}); 
	this.sidebarWorker.port.on("nextConceptInstances", function() {
		man.sidebarWorker.port.emit("enableLoading");
		man.searchEngine.nextConceptInstances(function(){

			man.cloneIntoSidebarContext({
				object: man.searchEngine.getCurrentObjectInstances(), 
				as:'woaInstanceObjects'
			});
			man.sidebarWorker.port.emit("loadConceptInstancesIntoView");
			man.loadSearchEngineUiComponents();
			man.sidebarWorker.port.emit("disableLoading");
		});
	}); 
	this.sidebarWorker.port.on("searchConceptInstances", function(keywords) {
		man.sidebarWorker.port.emit("enableLoading");
		if(keywords) 
			man.searchEngine.searchConceptInstances(keywords, function(){
				man.cloneIntoSidebarContext({
					object: man.searchEngine.getCurrentObjectInstances(), 
					as:'woaInstanceObjects'
				});
				man.sidebarWorker.port.emit("loadConceptInstancesIntoView");
				man.loadSearchEngineUiComponents();
			
				man.sidebarWorker.port.emit("disableLoading");
			});
	}); 
	this.sidebarWorker.port.on("alert", function(value) {
		man.sidebarWorker.port.emit("alert", value);
	}); 
	this.sidebarWorker.port.on("sidebarIsReady", function() {
		man.onSidebarReady();
	}); 
	this.sidebarWorker.port.on("removeApplication", function(filename) {
		man.removeFile(filename);
	}); 
	this.sidebarWorker.port.on("loadContextMenuForSidebar", function() {
		man.loadContextMenuForSidebar();
	});
	this.sidebarWorker.port.on("loadCTemplateForSearchEngineLinkage", function(id) {
		var possibleId = (man.currCTemplateId)? man.currCTemplateId : undefined;
		man.sidebarWorker.port.emit("loadCTemplateForSearchEngineLinkage", man.persistence.getCTemplates(), possibleId, false);
	});
	this.sidebarWorker.port.on("saveSearchEngineData", function(data){
		man.persistence.saveSearchEngineData(data);
	});
	this.sidebarWorker.port.on("editSearchEngineById", function(id){
		man.currCTemplateId = id;
		man.sidebarWorker.port.emit("editSearchEngine", man.persistence.getSearchEngineData(id));
	});
	this.sidebarWorker.port.on("requestCTemplateTokens", function(value) {

		if(value == null || value==undefined || value.length == 0)
			return;

		value = value.toLowerCase();
		var query = 'http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=' + 
					encodeURIComponent('SELECT * \
					WHERE { \
					   ?resource a owl:Class. \
					   ?resource rdfs:label ?label.  \
					   FILTER ( contains(?label, "' + value + '") && contains(str(?resource), "http://dbpedia.org/ontology")). \
					} LIMIT 5') +
					'&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on';

		var req = Request({
			url: query,
			onComplete: function (response) {

				if(	response.json && response.json.results && response.json.results.bindings &&
					response.json.results.bindings.length > 0){
					
					var tags = [], retTags = response.json.results.bindings;
					for (var i = 0; i < retTags.length; i++) {
						tags.push({
							'label': retTags[i].label.value,
							'value': retTags[i].resource.value
						});
					};
					man.sidebarWorker.port.emit("loadCTemplateTokens", tags);
				}
			}
		});
		req.get();
	});
	this.sidebarWorker.port.on("requestPTemplateTokens", function(key, ownerId) {

		var concept = man.persistence.getCTemplateById(ownerId);
		if(concept == null || concept==undefined || concept.length == 0)
			return;

		var query = 'http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=' + 
					encodeURIComponent('SELECT DISTINCT(?prop) \
					WHERE { \
					    ?s a <' + concept.dbp + '> . \
					    ?s ?p ?o . \
					    ?p rdfs:label ?label.  \
					    FILTER ( contains(?label, "' + key + '") && contains(str(?p), "http://dbpedia.org/ontology")). \
					    BIND (str(?label) AS ?prop). \
					} LIMIT 10') + 
					'&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on';

		var req = Request({
			url: query,
			onComplete: function (response) {
				if(	response.json && response.json.results && response.json.results.bindings &&
					response.json.results.bindings.length > 0){
					
					var tags = [], retTags = response.json.results.bindings;
					for (var i = 0; i < retTags.length; i++) {
						tags.push(retTags[i].prop.value);
					};
					man.sidebarWorker.port.emit("loadPTemplateTokens", tags);
				}
			}
		});
		req.get();
	});
	this.sidebarWorker.port.on("updateCurrentCTemplate", function(id) {
		man.currCTemplateId = id;
	});
	this.sidebarWorker.port.on("updateCurrentPTemplateXpaths", function(conceptXpath) {
		man.currentCollector.updateUiData({xpath: conceptXpath}, man);
	});
	this.sidebarWorker.port.on("browseApplications", function(value) {
		man.browseApplications();
	});
	this.sidebarWorker.port.on("showContextMenu", function(data) {
		man.showContextMenu(data);
	});
	this.sidebarWorker.port.on("highlightInDom", function(xpath) {
		man.currentWorker.port.emit("highlightInDom", xpath);
	});
	this.sidebarWorker.port.on("loadMaterializableOptions", function(focus) {
		man.currentCollector.loadMaterializableOptions(man);
	});
	this.sidebarWorker.port.on("managePTemplates", function() { man.managePTemplates(); });
	this.sidebarWorker.port.on("editDecorator", function() { man.editDecorator(); });
	this.sidebarWorker.port.on("saveDecoratorClassname", function(id, classname, callback){

		man.persistence.saveDecoratorClassname(id, classname);
		man.sidebarWorker.port.emit("callback", callback);
	});
	this.sidebarWorker.port.on("saveDecoratorMessages", function(id, messagesIds, callback){
		
		man.persistence.saveDecoratorMessages(id, messagesIds);
		if(callback) man.sidebarWorker.port.emit("callback", callback);
	});
	this.sidebarWorker.port.on("saveDecoratorMappings", function(decoId, mappings, callback){
		
		man.persistence.saveDecoratorMappings(decoId, mappings);
		if(callback) man.sidebarWorker.port.emit("callback", callback);
	});
	this.sidebarWorker.port.on("loadWrapperMessagesData", function(id, classname, callback) { 

		var totalMessages = man.getAvailableMessagesByDecorator(classname),
			selectedMessages = [], 
			aux = man.persistence.getMessagesByDecoratorId(id);

		if(totalMessages == undefined) return;
	 
		for (var i = 0; i < totalMessages.length; i++) { 
			if(aux.indexOf(totalMessages[i].id) != -1)
				selectedMessages.push(totalMessages[i]);
		};
		man.sidebarWorker.port.emit("loadWrapperMessages", { 
			messages: totalMessages, selected: selectedMessages
		});
	});
	this.sidebarWorker.port.on("loadDecoratorParamsMappings", function(decoId, decoClass, msgsIds) {

		var checkedMessages = man.getSelectedMessagesByWrapper(decoId, decoClass), //man.getAvailableMessagesByDecorator(decoClass),
			conceptPropertiesKeys = man.persistence.getPTemplatesNamesByCTemplateId(decoId), 
			storedMappingsIds = man.persistence.getParamMappings(decoId), 
			properties = man.persistence.getPTemplatesByCTemplateId(decoId); 
		var allRequiredMappings = [], aux4RequiredMappings = [];
		for (var i = 0; i < checkedMessages.length; i++) { 
			if(checkedMessages[i].properties){
				for (var j = 0; j < checkedMessages[i].properties.length; j++) { 
					if(	/*storedMappingsIds.indexOf(checkedMessages[i].properties[j].id) == -1 &&  // If not stored, and */
						conceptPropertiesKeys.indexOf(checkedMessages[i].properties[j].id) == -1 && //If it doesn't exist a property with that key-name
						aux4RequiredMappings.indexOf(checkedMessages[i].properties[j].id) == -1) { //And if it haven't been included yet in the allRequiredMappings collection
							
							allRequiredMappings.push(checkedMessages[i].properties[j]); //Add it to the needed matchings
							aux4RequiredMappings.push(checkedMessages[i].properties[j].id);
						}
				};
			};
		};
		man.sidebarWorker.port.emit("loadDecoratorParamsMappings", 
			allRequiredMappings, storedMappingsIds, 
			properties); //last one represent the checked ones, that should be editable
	});
	this.sidebarWorker.port.on("loadExistingApplications", function(selectedMessages) { 
		man.sidebarWorker.port.emit("loadExistingApplications", man.getExistingApplications());
	});
	this.sidebarWorker.port.on("openApplication", function(path) { 
		man.openApplication(path);
	});
	// STORAGE
	this.sidebarWorker.port.on("loadStoredCTemplates", function(key){
		man.sidebarWorker.port.emit("loadStoredCTemplates", man.persistence.getCTemplates());
	}); 
	this.sidebarWorker.port.on("storage.createCTemplate", function(data){
		//console.log('data');
		//console.log(data);
		man.currCTemplateId = man.persistence.createCTemplate(data);
		man.sidebarWorker.port.emit("manageCTemplates");
	});
	this.sidebarWorker.port.on("storage.createPTemplate", function(ownerId, prop){
		man.persistence.createPTemplate(ownerId, prop);
		man.currCTemplateId = ownerId;
		man.sidebarWorker.port.emit("manageCTemplates");
	});
	this.sidebarWorker.port.on("storage.removeFullConceptTemplate", function(id){
		man.persistence.removeFullConceptTemplate(id);
	});
	this.sidebarWorker.port.on("storage.removePTemplate", function(propId){
		man.persistence.removePTemplate(propId);
	});
	this.sidebarWorker.port.on("storage.updateCTemplate", function(concept){
		man.persistence.updateCTemplate(concept);
	});
	this.sidebarWorker.port.on("storage.updatePTemplate", function(prop){
		man.persistence.updatePTemplate(prop);
		man.managePTemplates();
	});
	//SIDEBAR
	this.sidebarWorker.port.on("openSidebarContextMenu", function(evt){
		man.openSidebarContextMenu(evt);
	});
}
ExtensionManager.prototype.getAvailableMessagesByDecorator = function(selectedClassname){

	for (var i = 0; i < this.decorators.length; i++) {
		if(this.decorators[i].name == selectedClassname){
			return this.decorators[i].getMessages(); //should have id and name
		}
	};
    return;
}
ExtensionManager.prototype.getWorker = function(config) {

	return this.attachToActiveWebpage(config);
};
ExtensionManager.prototype.onceInSidebar = function(callback, args){
	//TODO: PROBLEM WITH CALLBACK
	if(this.sidebar.isOpen) {
		callback(args);
	}
	else {
		this.temp = {};
		this.onSidebarReady = function(){
			callback(args);
		};
		this.sidebar.show();
	}
}
ExtensionManager.prototype.createBaseMenuItems = function() { 

	var window = utils.getMostRecentBrowserWindow();
	var menupopup = window.document.getElementById("contentAreaContextMenu");
	var xpopupset = window.document.getElementById("mainPopupSet");
	var man = this;
	
	this.searchEngineMenu = this.createParentContextMenu({
		id: 'woa-add-search-engine',
		label:this.locale('add_as_search_engine'), 
		menu: menupopup,
		doc: window.document
	});

	this.propertiesMenu = this.createParentContextMenu({
		id: 'woa-add-property',
		label:this.locale('add_as_property'),
		at: 'contentAreaContextMenu',
		menu: menupopup,
		doc: window.document
	});
	
	this.conceptsMenu = this.createParentContextMenu({
		id: 'woa-add-concept',
		label:this.locale('add_as_concept'), 
		at: 'contentAreaContextMenu',
		menu: menupopup,
		doc: window.document
	});
	this.loadSearchEngineItems();
	//this.hideInternalContextMenuItems();

	this.loadPopupEventsInPage(menupopup, window);
}
ExtensionManager.prototype.loadPopupEventsInPage = function(menupopup, window){

	this.unloadPopupEventsInPage();
	var man = this;
	man.pageListener = function(e) {
		// KEYS: We can use altKey (right), ctrlKey (down), metaKey (left) and shiftKey (up).
		if(e.eventPhase != 2) return;
		
		var sel = window.content.getSelection().toString();
		var domElem;
		if(e.shiftKey){
			domElem = e.target.triggerNode.parentElement;
		} 
		else{
			domElem = e.target.triggerNode;
		}
		man.target = { 
			text: sel,
			dom: domElem,
			img: man.createCTemplateThumbnail(domElem)
		};
		man.unloadItemsFromUi();
		man.loadItemsFromUi(man.target); //ANALYZING THE TARGET WITH THE COLLECTORS
	};
	menupopup.addEventListener("popupshowing", this.pageListener, false);
}
ExtensionManager.prototype.unloadPopupEventsInPage = function(){

	var window = utils.getMostRecentBrowserWindow();
	var menupopup = window.document.getElementById("contentAreaContextMenu");
		menupopup.removeEventListener("popupshowing", this.pageListener, false);
	console.log("Events from the current Web page were removed");
}
ExtensionManager.prototype.loadSearchEngineItems = function() { 

	var man = this;
	var window = utils.getMostRecentBrowserWindow();
	this.createChildContextMenu({
		id: 'woa-extract-search-input', 
		label: this.locale('input'),
		menu: this.searchEngineMenu,
		callback: function(){ 
			var target = man.getElementByType("input", man.target.dom);
			if(target) man.loadXpathInSearchForm({dom:target}, "entry"); 
			else utils.getMostRecentBrowserWindow().alert(man.locale("no_input_element")) 
		},
		doc: window.document
	});
	this.createChildContextMenu({
		id: 'woa-extract-search-trigger', 
		label: this.locale('trigger'),
		menu: this.searchEngineMenu,
		callback: function(e){ 
			var target = man.getTriggerElement(man.target.dom);
			if(target) man.loadXpathInSearchForm({dom:target}, "trigger"); 
			else utils.getMostRecentBrowserWindow().alert(man.locale("no_trigger_element"))
		},
		doc: window.document
	});
	this.createChildContextMenu({
		id: 'woa-extract-next-page', 
		label: this.locale('next_page'),
		menu: this.searchEngineMenu,
		callback: function(e){ 
			var target = man.getTriggerElement(man.target.dom);
			//console.log(target);
			if(target) man.loadXpathInSearchForm({dom:target}, "next"); 
			else utils.getMostRecentBrowserWindow().alert(man.locale("no_trigger_element"))
		},
		doc: window.document
	});
	this.createChildContextMenu({
		id: 'woa-extract-prev-page', 
		label: this.locale('prev_page'),
		menu: this.searchEngineMenu,
		callback: function(e){ 
			var target = man.getTriggerElement(man.target.dom);
			if(target) man.loadXpathInSearchForm({dom:target}, "prev"); 
			else utils.getMostRecentBrowserWindow().alert(man.locale("no_trigger_element"))},
		doc: window.document
	});
}
ExtensionManager.prototype.getElementByType = function(type, element) { 

	if(element.tagName && element.tagName.toLowerCase() == type.toLowerCase()){
		return element;
	} 
	else if(element.getElementsByTagName){
		var possibleElems = element.getElementsByTagName(type);
		if(possibleElems && possibleElems.length && possibleElems.length > 0)
			return possibleElems[0];
	} 
	return;
}
ExtensionManager.prototype.getTriggerElement = function(element) { 

	if(element.onclick || element.href || element.type == "submit")
		return element;

	var descendants = element.querySelectorAll("*");
	for (var i = 0; i < descendants.length; i++) {
		if(descendants[i].onclick || descendants[i].href || descendants[i].type == "submit")
			return descendants[i];
	}
	return;
}
ExtensionManager.prototype.getDomElementSimpleXPath = function(target){
 	//TODO: atadísimo con alambre. Instanciar uno nuevo. Para eso, hay que hacer el TODO de collectors.js
 	this.collectors[0].setTarget(target); 
 	var xpaths = this.collectors[0].getTargetXPaths();
	return this.collectors[0].getLabeledXPaths(xpaths);
};
ExtensionManager.prototype.loadXpathInSearchForm = function(target, key){
	//FROM THE CURRENT WEBPAGE CONTEXT
	var man = this;
	//console.log(target, key);
	this.onceInSidebar(function(){
		//console.log(target);
		var xpaths = man.getDomElementSimpleXPath(target); //TODO: remove all the complex part for obtaining the labeled xpath. It's not useful anymore
		if(xpaths && xpaths.length && xpaths.length > 0){

			//me.sidebarWorker.port.emit("editSearchEngineElement", elemId, [xpaths[0]]);
			var storedData = man.persistence.getSearchEngineData(man.currCTemplateId);
			if(storedData == undefined || !storedData)
				storedData = {};
			//The new extracted value
			//storedData[key] = xpaths[0].value; 
			//Copy the tmp values in the "stored data"
			man.temp[key] = xpaths[0].value;
			for(var xxx in man.temp){
		      	storedData[xxx] = man.temp[xxx];
		   	}
			
			man.sidebarWorker.port.emit("editSearchEngine", storedData);
		}
	});
}
ExtensionManager.prototype.getRequest = function(url) { 

	var responseText, req = new XMLHttpRequest();
	req.open('GET', url, false); 
	req.send(null);
	if (req.status == 200)
	  responseText = req.responseText;
	return responseText;
}
ExtensionManager.prototype.loadItemsFromUi = function(target) { 

	var concepts = this.persistence.getCTemplates();
	if(concepts==undefined || concepts==null || concepts.length==0){
		this.hideMenu(this.propertiesMenu, true);
		this.hideMenu(this.searchEngineMenu, true);
	}
	else {
		this.hideMenu(this.propertiesMenu, false);
		this.hideMenu(this.searchEngineMenu, false);
	}
	this.loadItemsByStrategy(target);
}
ExtensionManager.prototype.hideMenu = function(menu, hide) { 

	/*if(hide){
		menu.style.visibility = "hidden";
		menu.style.display = "none";
	}else{
		menu.style.visibility = "visible";
		menu.style.display = "";
	}*/
}
ExtensionManager.prototype.loadItemsByStrategy = function(target) { 

	for (var i = 0; i < this.collectors.length; i++) {
		this.collectors[i].renderMenuIfApplicable(target, this);
	};
}
ExtensionManager.prototype.unloadItemsFromUi = function() { 

	this.unloadItemsFromMenu(this.conceptsMenu);
	this.unloadItemsFromMenu(this.propertiesMenu);
}
ExtensionManager.prototype.unloadItemsFromMenu = function(menu) { 

	if(menu && menu != undefined && menu != null){
		var menupopup = menu.getElementsByTagName("menupopup")[0];
			if(menupopup)
				menupopup.innerHTML = '';
	}
}
ExtensionManager.prototype.createCTemplateThumbnail = function(element) { 
	try{
		var document = element.ownerDocument;
		var hElems = document.getElementsByClassName("woa-highlighted-element");
		for (var i = 0; i < hElems.length; i++) {
			hElems[i].classList.remove("woa-highlighted-element");
		}
	    var canvas = document.createElement("canvas");
	    canvas.width = element.offsetWidth;
	    canvas.height = element.offsetHeight;
	    var ctx = canvas.getContext("2d");
	    var box = element.getBoundingClientRect();
	    ctx.drawWindow(document.defaultView, parseInt(box.left)+
	    	document.defaultView.scrollX,parseInt(box.top)+
	    	document.defaultView.scrollY, element.offsetWidth,element.offsetHeight, "rgb(0,0,0)");

	    element.classList.add("woa-highlighted-element");
	    return canvas.toDataURL();
	}catch(err){
		console.log(err.message);
		return;
	}
}
ExtensionManager.prototype.getContentAreaContextMenu = function(){

	return this.getCurrentWindow().document.getElementById("contentAreaContextMenu");
}
ExtensionManager.prototype.getCurrentWindow = function(){

	return utils.getMostRecentBrowserWindow();
}
ExtensionManager.prototype.createChildContextMenu = function(data) {

     var item;
    var document = this.getCurrentWindow().document;

    //Gets the element,if it already exists
    item = document.getElementById(data.id);

    //If the menu doesn't exist,it's created
    if(item == undefined) {
        //Creates the element
        item = document.createElement("menuitem");
        item.setAttribute("id", data.id);

        var popup = this.getMenupopup(data.menu, document);
        popup.appendChild(item);
    }

    //No matter if the item already exists or it was just created, we clear it and update the data (also useful if the user changes the language)
    item.setAttribute("label", data.label);
    item.specification = data.specification;
    
    item.onclick = data.callback;

    return item;
}
ExtensionManager.prototype.createParentContextMenu = function(data) { 

	var newmenu;
	var document = this.getCurrentWindow().document;

	if(data.menu && data.menu != undefined && data.menu != null){ //If parent exists

		//Gets the element,if it already exists
		newmenu = document.getElementById(data.id);

		//If the menu doesn't exist,it's created
		if(!newmenu || newmenu == undefined || newmenu == null) {
			newmenu = document.createElement("menu"); 

			data.menu.insertBefore(newmenu, data.menu.firstChild);
		}
		//Removes previous data and load the new one
		newmenu.innerHTML = "";
		newmenu.setAttribute("id", data.id);
		newmenu.id = data.id;
		newmenu.setAttribute("label", data.label);
		if(data.callback) newmenu.onclick = data.callback;	
	}
	return newmenu;
}
ExtensionManager.prototype.getMenupopup = function(elem, document) {

	if(elem){

		if(elem.tagName == 'menupopup'){ 
	        return elem;
	    } else { 
	        var parent = elem.getElementsByTagName("menupopup")[0];
	        if(parent == null) {
	        	var mpp = document.createElement("menupopup");
	        	elem.appendChild(mpp);
	        	return mpp; 
	        } 
	        return parent;
	    }
	}
	return document.createElement("menupopup");
}
ExtensionManager.prototype.attachToActiveWebpage = function(config){

	var wrk = tabs.activeTab.attach({
		contentScriptFile: this.getAsDataResources(config.jsFiles) /*TOCHECK: if empty, this could throw error*/
	});

	if(config.cssFiles)
		this.attachCssFiles(config.cssFiles);

	return wrk;
} 
ExtensionManager.prototype.getAsDataResources = function(res){
	//Process the string array into a valid data URIs array 

	var dataRes = new Array(),
		data = require("sdk/self").data;		
	for (var i = 0; i < res.length; i++) {
		dataRes.push(data.url(res[i]));
	};
	return dataRes
};
ExtensionManager.prototype.attachCssFiles = function(res){

	var { attach } = require('sdk/content/mod');
	var { Style } = require('sdk/stylesheet/style');
	
	for (var i = 0; i < res.length; i++) {
		var style = Style({ uri: res[i] });
		attach(style, tabs.activeTab);
	};
}
ExtensionManager.prototype.detachCssFiles = function(res){

	var { detach } = require('sdk/content/mod');
	var { Style } = require('sdk/stylesheet/style');
	
	for (var i = 0; i < res.length; i++) {
		var style = Style({ uri: res[i] });
		detach(style, tabs.activeTab);
	};
}
ExtensionManager.prototype.getExistingApplications = function(){

	var array = [];
	try{
		let file = FileUtils.getDir("ProfD", ["jetpack", "woa@lifia.info.unlp.edu.ar", "applications"], true);

		if(file.exists()){
			var entries = file.directoryEntries;

			while(entries.hasMoreElements()) {
				var entry = entries.getNext();
					entry.QueryInterface(Ci.nsIFile);

				if(entry.isDirectory()){
					entry.append('package.json');
					if(entry.exists()){
						var data = this.readFileAsJSON(entry);
						if(!(data && data.id && data.name && data.index)){

							console.log(this.locale('application_import_no_required_properties'));
						}
						else{
							var path, 	indexFile = entry.parent;
										indexFile.append(data.index);

							if(indexFile.exists());
								path = indexFile.path;
							//else path = entry.parent.path + '/' + data.index;
							array.push({
								name: data.id,
								display: data.name,
								path: path
							});
						}
					}
				}
			}
		}
	}catch(err){
		//console.log(err);
	}
	return array;
}
ExtensionManager.prototype.clearCTemplatesList = function(document){

    var list = document.getElementById('created-ctemplates-list');
        if(list) list.innerHTML = "";
}
ExtensionManager.prototype.createExtensionMainButton = function() {
	var man = this;
	this.extensionOptions = require("sdk/panel").Panel({
		width: 200,
  		height: 93,
		contentURL: require("sdk/self").data.url("./toolbar-context-menu.html")
	});
	this.extensionOptions.port.on("toggleHarvestingSidebar", function(value) {
		//This is the toolbar button that opens the sidebar
		if(value) {
			man.onSidebarReady = function(){ man.sidebarWorker.port.emit("manageCTemplates"); }
			man.sidebar.show();
		}
		man.extensionOptions.hide(); //in both cases, the panel should be hidden
	});

	this.extensionOptions.port.on("toggleCTemplatesSelection", function(enable) {
		if(enable) man.enableCTemplatesSelection();
		else man.disableCTemplatesSelection();
		man.extensionOptions.hide();
	});
    this.extensionOptions.port.on("toggleRemoteAugmentation", function() {
        man.callServiceAugmentation();

        man.extensionOptions.hide();
    });
	/*this.extensionOptions.port.on("toggleAppMakerSidebar", function(enable) {
		if(enable) {
			man.appMaker.enableAppMaker(man.persistence.getFullCtemplateData());
		}
		else {
			man.appMaker.disableAppMaker();
		}
		man.extensionOptions.hide();
	});*/

	var toolbarButton = ActionButton({
		id: "woa-button",
		label: "WOA",
		icon: {
			"16": "./src/img/icon-16.png",
			"32": "./src/img/icon-32.png",
			"64": "./src/img/icon-64.png"
	    },
		onClick: function(state) {
			man.extensionOptions.show({
				position: toolbarButton
			});
		}
	});
}
ExtensionManager.prototype.askUserToKeepDatabase = function() {

	let file = FileUtils.getFile("ProfD", ["jetpack", "woa@lifia.info.unlp.edu.ar", "woa.sqlite"]);
	if(file.exists()){
		if(!utils.getMostRecentBrowserWindow().confirm("do you want to keep the extension database?")){
			file.remove(0);
			console.log("You removed the database");
		} else console.log("You didn't remove the database");
	}
}

exports.getInstance = function(locale) {
    return new ExtensionManager(locale);
}
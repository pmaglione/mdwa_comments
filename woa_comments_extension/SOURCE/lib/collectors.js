// +++++++++++++++++++++++++++++++++++
// ++++++ ABSTRACT COLLECTOR  ++++++++
// +++++++++++++++++++++++++++++++++++
var utils = require('sdk/window/utils');
var { InstanceObjectTemplate, IOPropertyTemplate } = require("./templates").getClasses();


function AbstractCollector (lang, ui){
	this.lang = lang;
	this.locale = {
		'en': {
			'single_match': 'match',
			'matches': 'matches',
			'define_a_concept':"Define a concept's template",
			'define_a_property':'Define a property'
		},
		'es': {
			'single_match': 'coincidencia',
			'matches': 'coincidencias',
			'define_a_concept':'Define un concepto',
			'define_a_property':'Define una propiedad'
		},
		'fr': {
			'single_match': 'correspondance',
			'matches': 'correspondances',
			'define_a_concept':'Définissez un concept',
			'define_a_property':'Définissez une propriété'
		}
	};
	this.target; //text,dom,img
	this.xpathEngine = this.getXpathEngine();
}
AbstractCollector.prototype.getXpathEngine = function(key){

	const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
	let scope = sandbox(utils.getMostRecentBrowserWindow());
	load(scope, 'resource://woa-at-lifia-dot-info-dot-unlp-dot-edu-dot-ar/data/src/js/xpathManagement.js');    
	return new scope.XPathInterpreter();
}
AbstractCollector.prototype.getLocale = function(key){

	return (this.locale[this.lang])? this.locale[this.lang][key]: undefined;
}
AbstractCollector.prototype.setTarget = function(target){
	this.target = target;
}
AbstractCollector.prototype.getTarget = function(){
    return this.target;
}
AbstractCollector.prototype.getTargetXPaths = function(){
	//console.log('this.target.dom');
	//console.log(this.target.dom);
	if(this.target.dom.classList.contains("woa-highlighted-element")) 
		this.target.dom.classList.remove("woa-highlighted-element");
	var xpaths = this.xpathEngine.getMultipleXPaths(this.target.dom, this.target.dom.ownerDocument);
	this.target.dom.classList.add("woa-highlighted-element");
	console.log(xpaths);
	return xpaths;
};
AbstractCollector.prototype.getRelativeTargetXPaths = function(xpath){
	//dado un xpath de concepto y eltarget seleccionado, devuelve posibles xpath de las propiedades.
	//Esta verificación tiene que hacerse acá y no del sidebar, porque es desde donde setiene acceso al current DOM doc
	//Se obtiene las instancias, para luego tener un xpath de instancia y usarlo de base
    var baseNode = this.xpathEngine.getElementByXPath( xpath, this.target.dom.ownerDocument);
	var xpaths = this.xpathEngine.getMultipleXPaths(this.target.dom, baseNode, true);
	return xpaths;
};
AbstractCollector.prototype.getLabeledXPaths = function(xpaths, baseXpath){

	var labeledXpaths = [];
	for (var i = 0; i < xpaths.length; i++) {
		var matches;
		if(baseXpath) 
			matches = this.getMatchedElementsQuantity(baseXpath + "/" + xpaths[i]);
		else matches = this.getMatchedElementsQuantity(xpaths[i]);
		if(matches >= 1){
			var lbl = (matches==1)? this.getLocale('single_match'): this.getLocale('matches');
			labeledXpaths.push({
				order: matches,
				label: matches + ' ' + lbl,
				value: xpaths[i]
			});
		}
	};
	labeledXpaths.sort(function compare(a,b) {
		if (a.order < b.order) return -1;
		else if (a.order > b.order) return 1;
		else return 0;
	});

	return labeledXpaths;
};
AbstractCollector.prototype.getMatchedElementsQuantity = function(xpath){

	var elems = this.xpathEngine.getElementsByXpath(xpath, this.target.dom);
	return (elems && elems.length && elems.length > 0)? elems.length : 0;
};
AbstractCollector.prototype.renderMenuIfApplicable = function(target, ui){

	var applies = this.analyzeDomElement(target);
	if(applies) {
		this.setTarget(target);
		this.renderMenuItemFrom(ui);		
	}
}
AbstractCollector.prototype.renderMenuItem = function(man, data){
	var collector = this;
	man.createChildContextMenu({
		id: data.id, 
		label: data.label,
		menu: data.menu,
		doc: data.doc,
		callback: function(){
			man.onceInSidebar(function(e){
				man.currentCollector = collector;
				data.callback(e);
			});
		}
	});
};
AbstractCollector.prototype.analyzeDomElement = function(target){};
AbstractCollector.prototype.loadMaterializableOptions = function(doc){}
AbstractCollector.prototype.getMaterializable = function(ui){};
AbstractCollector.prototype.updateUiData = function(data, ui){};
AbstractCollector.prototype.callServiceAugmentation = function(doc){};

// +++++++++++++++++++++++++++++++++++
// +++++ XPATH BASED COLLECTORS  +++++
// +++++++++++++++++++++++++++++++++++

function XpathBasedCollector (lang){
	AbstractCollector.call(this, lang); 
	this.locale.en['from_ui_element']='from UI element';
	this.locale.es['from_ui_element']='a partir del elemento';
	this.locale.fr['from_ui_element']="à partir de l'élément";
}
XpathBasedCollector.prototype = new AbstractCollector();
XpathBasedCollector.prototype.analyzeDomElement = function(target){
	return true; //There is always a DOM element
}

function XBCTemplateCollector(lang){
	XpathBasedCollector.call(this, lang); 
}
XBCTemplateCollector.prototype = new XpathBasedCollector();
XBCTemplateCollector.prototype.renderMenuItemFrom = function(ui){

	this.renderMenuItem( ui, {
		id: 'woa-concept-from-xpath',
		label: this.getLocale('from_ui_element'), 
		menu: ui.conceptsMenu,
		doc: utils.getMostRecentBrowserWindow().document,
		callback: function(){ui.sidebarWorker.port.emit("createCTemplate")}
	});
}
XBCTemplateCollector.prototype.getMaterializable = function(ui){

	var win = ui.getSidebarWindow();
	var document = win.document;
	console.log(this.target);
	return new InstanceObjectTemplate({
		'name': document.getElementById('edit-concept-template-name').value,
		'dbp': document.getElementById('edit-concept-template-tag').getAttribute('dbp'),
		'tag': document.getElementById('edit-concept-template-tag').value,
		'decorator': 'GenericDecorator',
		'xpath': document.getElementById('edit-concept-template-xpath').value,
		'selected': '',
		'url': this.target.dom.ownerDocument.URL,
		'imageSrc': this.target.img,
		'properties': [],
		//'service_url': document.getElementById('service_url').value
	}, ui.getSidebarWindow().content); 
}
XBCTemplateCollector.prototype.loadMaterializableOptions = function(ui){

	var document = ui.getSidebarWindow().document;
	ui.focusSidebar();
	// +++++++++++++++ ENABLE TAGS FUNCTIONALITY
	
	// +++++++++++++++ HEADER 
	document.getElementById("concept-header-title").innerHTML = this.getLocale('define_a_concept');
	document.getElementById("concept-header-icon").className = "glyphicon glyphicon-plus";
	// +++++++++++++++ SELECT XPATH
	var sel = document.getElementById('edit-concept-template-xpath');
	var xpaths = this.getLabeledXPaths(this.getTargetXPaths());
	sel.innerHTML = '';
    for (var i = 0; i < xpaths.length; i++) {
		var opt = document.createElement('option');
			opt.text = xpaths[i].label; 
			opt.value = xpaths[i].value;
		sel.appendChild(opt);
	};
    sel.onchange = function(){ ui.currentWorker.port.emit('highlightInDom', this.value); }
    sel.onkeyup = function(){ ui.currentWorker.port.emit('highlightInDom', this.value); }
    // +++++++++++++++ IMAGE
    document.getElementById('concept-preview-image').src = this.target.img;
    // +++++++++++++++ SAVE BUTTON
    var col = this;

    var sidWindow = ui.getSidebarWindow();

    var xPathEngine = this.getXpathEngine();

    document.getElementById('save-concept').onclick = function(evt){
         
    	var concept = col.getMaterializable(ui);

    	// +++++++++++++++ Service augmentation call //// LLAMADAAAAAAAAAAA
        // var augmentation = col.callServiceAugmentation(sidWindow, col, xPathEngine);
        var save_concept_irapi = new sidWindow.XMLHttpRequest();

        var cors = "https://cors-anywhere.herokuapp.com/";

   		var irapi_url = cors + "http://irapi.herokuapp.com/web/app_dev.php/create_concept";

	    save_concept_irapi.open('POST', irapi_url);
	    
	    save_concept_irapi.onreadystatechange = function(){
	        if(save_concept_irapi.readyState == 4) {
	            if(save_concept_irapi.status == 200) {
	            	sidWindow.console.log("[INFO] Registro exitoso del concepto en IRAPI");
	            }else{
	            	sidWindow.console.log("[ERROR] Ocurrio un error registrando el concepto en IRAPI");
	            }
			}
    	};
    	var params = "name="+concept.name+"&category="+concept.category+"&tag="+concept.tag+"&url="+concept.url+"&xpath="+concept.xpath;
    	save_concept_irapi.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    	save_concept_irapi.send(encodeURI(params));


		var sdb = ui.getSidebarWindow().sidebar; 
		if(sdb.validateCTemplate()){
			ui.sidebarWorker.port.emit('storage.createCTemplate', JSON.stringify(concept)); 
		}
		else document.getElementById('edit-concept-template-name').focus();
	};
	document.getElementById('edit-concept-template-name').focus();
}

function XBPTemplateCollector(lang){
	XpathBasedCollector.call(this, lang); 
}
XBPTemplateCollector.prototype = new XpathBasedCollector();
XBPTemplateCollector.prototype.renderMenuItemFrom = function(ui){

	this.renderMenuItem(ui, {
		id: 'woa-property-from-xpath',
		label: this.getLocale('from_ui_element'), 
		menu: ui.propertiesMenu,
		doc: utils.getMostRecentBrowserWindow().document,
		callback: function(){ui.sidebarWorker.port.emit('createPTemplate')}
	});
}
XBPTemplateCollector.prototype.getMaterializable = function(ui){

	var win = ui.getSidebarWindow();
	var sDoc = win.document;
	console.log(this.target);
	return new IOPropertyTemplate({
		'name': sDoc.getElementById('edit-property-name').value,
		'tag': sDoc.getElementById('edit-property-tag').value,
		'dbp': sDoc.getElementById('edit-property-tag').getAttribute('dbp'),
		'xpath': sDoc.getElementById('edit-property-xpath').value,
		'selected': '',
		'url': this.target.dom.ownerDocument.URL,
		'imageSrc': this.target.img,
		//service_url': sDoc.getElementById('service_url').value
	}, ui.getSidebarWindow().content);
}
XBPTemplateCollector.prototype.getOwnerCTemplate = function(ui){

	return ui.getSidebarWindow().document.getElementById('edit-property-owner').value;
}
XBPTemplateCollector.prototype.loadMaterializableOptions = function(ui){

	var sWin = ui.getSidebarWindow();
	ui.focusSidebar();
	// +++++++++++++++ HEADER 
	sWin.document.getElementById("property-header-title").innerHTML = this.getLocale('define_a_property');
	sWin.document.getElementById("property-header-icon").className = "glyphicon glyphicon-plus";
	ui.sidebarWorker.port.emit("loadCTemplateForPTemplateLinkage", ui.persistence.getCTemplates(), ui.currCTemplateId, false);
	// +++++++++++++++ SELECT XPATH
    // +++++++++++++++ IMAGE
    sWin.document.getElementById('property-preview-image').src = this.target.img;
    // +++++++++++++++ SAVE BUTTON
    var col = this;
    sWin.document.getElementById('save-property').onclick = function(evt){
    	var prop = col.getMaterializable(ui);
    	var owner = col.getOwnerCTemplate(ui);
		var sdb = ui.getSidebarWindow().sidebar; 

		if(sdb.validateForm('edit-property-form')){
			ui.sidebarWorker.port.emit('storage.createPTemplate', owner, JSON.stringify(prop)); 
		}
		else sWin.document.getElementById('edit-property-name').focus();
	};
	sWin.document.getElementById('exit-property').onclick = function(evt){
        ui.getSidebarWindow().sidebar.manageCTemplates();
    }
    sWin.document.getElementById('edit-property-name').focus();
}
XBPTemplateCollector.prototype.updateUiData = function(data, ui){

	var sWin = ui.getSidebarWindow();
	//Get an instancexpath, not the template one
	var sel = sWin.document.getElementById('edit-property-xpath');
	var baseNode = this.xpathEngine.getElementsByXpath(data.xpath, this.target.dom.ownerDocument);
	sel.innerHTML = '';

    if(baseNode[0]){
        //var ciXpath = this.xpathEngine.getMultipleXPaths(this.target.dom, baseNode[0],);
        //var relativePropsXpaths = this.getRelativeTargetXPaths(ciXpath);
   		var relXpaths = this.xpathEngine.getMultipleXPaths(this.target.dom, baseNode[0], true);
   		//console.log('relXpaths: ' + relXpaths);
   		
   		var baseXpaths = this.xpathEngine.getMultipleXPaths(baseNode[0], baseNode[0].ownerDocument);
   		var baseXpath = baseXpaths.sort(function (a, b) { return b.length - a.length; })[0];
   		//console.log('baseXpath: ' + baseXpath);
		var xpaths = this.getLabeledXPaths(relXpaths,baseXpath);
		//console.log(xpaths);

	    for (var i = 0; i < xpaths.length; i++) {
			var opt = sWin.document.createElement('option');
				opt.text = xpaths[i].label; 
				opt.value = xpaths[i].value;
			sel.appendChild(opt);
		};
	    sel.onchange = function(e){ ui.currentWorker.port.emit('highlightInDom', baseXpath + '/' + this.value); }
	    sel.onkeyup = function(){ ui.currentWorker.port.emit('highlightInDom', baseXpath + '/' + this.value); }
	}
}

XBCTemplateCollector.prototype.callServiceAugmentation = function(ui)
{
    // var targetDoc = this.target.dom.ownerDocument;
    //
    // // var pointcut = sidWindow.document.getElementById('emp-pointcut-property').value;
    //
    // var conceptSpecies = targetDoc.getElementsByClassName("b-product_name")[0].innerHTML.replace(/\s/g,'');
    // var conceptName = targetDoc.getElementsByClassName("b-product_short_description")[0].innerHTML.replace(/\s/g,''); //to-do
    // var conceptPrice = targetDoc.getElementsByClassName("b-product_price-sales")[0].innerHTML.replace(/\s/g,'');
    //
    // var corsUrl = "https://cors-anywhere.herokuapp.com/";
    //
    // var seedServiceUrl = "http://freecd023-freeapp.eu.webratio.net/pcu1";
    // var fertilizerServiceUrl = "http://freecd023-freeapp.eu.webratio.net/pcu2";
    // var pesticideServiceUrl = "http://freecd023-freeapp.eu.webratio.net/pcu3";
    //
    // var category = sidWindow.document.getElementById('emp-category').value;
    //
    // var selectedService = "";
    //
    // switch(category) {
		// case "seed":
		// 	selectedService = seedServiceUrl;
		// 	break;
		// case "fertilizer":
		// 	selectedService = fertilizerServiceUrl;
		// 	break;
		// case "pesticide":
		// 	selectedService = pesticideServiceUrl;
		// 	break;
    // }
    //
    // var parameters = "/" + conceptName + "/" + conceptSpecies + "/" + conceptPrice;
    // var urlToCall = selectedService + parameters;
    //
    //
    // // var element = xPathEngine.getElementsByXpath(sidWindow.document.getElementById('edit-concept-template-xpath').value, targetDoc)[0];
    //
    // var mainDoc = col.target.dom.ownerDocument;
    // var newNode = mainDoc.createElement("iframe");
    // newNode.src = urlToCall;
    // newNode.height = 580;
    // newNode.widht= 450;
    // newNode.setAttribute("id", "augmentation_data_div");
    // newNode.setAttribute("style", "z-index: 10;position: absolute;right: 0;top: 0;margin: 10px;background:white;");
    //
    // // var newDiv = mainDoc.createElement("div");
    // // newDiv.setAttribute("style", "z-index: 10;position: absolute;right: 0;top: 0;margin: 10px;");
    // // newDiv.innerHTML = newNode;
    //
    // mainDoc.getElementsByTagName("body")[0].appendChild(newNode);
}


exports.getInstances = function(lang) {
    return [ 
    	new XBCTemplateCollector(lang), //Ojo con el orden, por ahora es importante este como primero. TODO: instantiate them from "the other side" haha
    	new XBPTemplateCollector(lang)
    ];
}
//addon es la variable global que el SDK de Firefox pone a disposición para acceder al puerto
//addon is the global var that Firefox SDK provides for accessing the port
function SidebarManager(lbundle) {
    this.locale = lbundle;
    this.temp = {};
    this.currCTemplateId;
    this.currConceptXpath;
    this.currentDecorator;
	this.initalize();
}
SidebarManager.prototype.initalize = function () {
    //Init required variable
    this.currentDecorator = {classname:undefined, messages:[], required:[]};
    //Init ports "on" and load the context menu for sidebar
    this.clearCurrCTemplateId();
    this.loadSubforms();
    this.initPorts();
    
    addon.port.emit("loadContextMenuForSidebar"); //It's required to be called just one time
    addon.port.emit("sidebarIsReady");
};
SidebarManager.prototype.initPorts = function() {
    var man = this;
    addon.port.on("accessWrappersManagement", function(){ man.loadView({id:['manage-decorators', 'decorators-management']}); });
    addon.port.on("enableLoading", function(){ man.enableLoading(); });
    addon.port.on("disableLoading", function(){ man.disableLoading(); });
    addon.port.on("loadConceptInstancesView", function(){ man.loadConceptInstancesView(); });
    addon.port.on("loadConceptInstancesIntoView", function(instances){ man.loadConceptInstancesIntoView(instances); });
    addon.port.on("loadCTemplateTokens", function(tags){ man.loadCTemplateTokens(tags) });
    addon.port.on("loadPTemplateTokens", function(tags){ man.loadPTemplateTokens(tags) });
    addon.port.on("loadDecoratorParamsMappings", function(c,m,p){ man.loadDecoratorParamsMappings(c,m,p); });
    addon.port.on("callback", function(callback){ man[callback](); });
    addon.port.on("loadTemplateInstances", function(callback){ man[callback](); });
    addon.port.on("storage.createCTemplate", function(data){ addon.port.emit("storage.createCTemplate", data); });
    addon.port.on("storage.createPTemplate", function(owner, data){ addon.port.emit("storage.createPTemplate", owner, data); });
    addon.port.on("loadExistingApplications", function(data){ man.loadExistingApplications(data); });
    addon.port.on("loadWrapperMessages", function(data){ man.loadWrapperMessages(data); });    
    addon.port.on("loadWrapperRequiredProps", function(data){ man.loadWrapperRequiredProps(data); });  
    addon.port.on("createCTemplate", function(){
        //In charge of the Collector
        man.openCTemplateForm();
            man.clearCTemplateEditionForm();
            man.enableCTemplateTags();
            console.log("from sidebar");
            addon.port.emit('loadMaterializableOptions'); 
    });
    addon.port.on("createPTemplate", function(){
        //In charge of the Collector
        man.openPTemplateForm();
            man.clearPTemplateEditionForm();
            man.enablePTemplateTags();
            addon.port.emit('loadMaterializableOptions'); 
    });
    addon.port.on("editCTemplate", function(collected){
        man.openCTemplateForm();
        man.enableCTemplateTags();
        man.focus('edit-concept-template-name');
        man.loadExistingCTemplateData(collected);
    });
    addon.port.on("editSearchEngine", function(data){ //New search engine component harvesting
        man.openSearchEngineForm();
        addon.port.emit("loadCTemplateForSearchEngineLinkage"); //The owner template
        man.enableEngineControls(data);     
    });
    addon.port.on("editSearchEngineElement", function(elemId, labeledXpaths){ //Management of the already opened form
        man.openSearchEngineForm();
        addon.port.emit("loadCTemplateForSearchEngineLinkage");
        man.loadXpathOptions(elemId, labeledXpaths.value); //enable and tmp store
        man.focus(elemId);
    });
    addon.port.on("loadCTemplateForSearchEngineLinkage", function(c,s,d){ man.loadCTemplateForSearchEngineLinkage(c,s,d); });
    addon.port.on("manageCTemplates", function(){ man.manageCTemplates(); });
    addon.port.on("managePTemplates", function(concept, properties){ man.managePTemplates(concept, properties); });
    addon.port.on("loadCTemplateForPTemplateLinkage", function(concepts, selected){ man.loadCTemplateForPTemplateLinkage(concepts, selected, false); })
    addon.port.on("removeFullConceptTemplate", function(id){ man.removeFullConceptTemplate(id); });
    addon.port.on("editDecorator", function(decoratorsData, selected){
        man.openDecoratorForm();
        man.currentDecorator = selected; //id classname 
        man.loadExistingWrapperData(decoratorsData, selected.classname);
    });
    addon.port.on("loadStoredCTemplates", function (concepts) { //Called through enableCTemplateDomSelection
        man.clearCTemplatesList();
        man.loadCTemplates(concepts);
    });
    addon.port.on("highlightMatchedPropsInUI", function (xpaths) { 
        //man.highlightMatchedPropsInUI(xpaths);
    });
    addon.port.on("showMatchingElems", function (params) { 
        //Muestra la cantidad de elementos coincidentes en el label
        //Shows the matched elements length in the label
        document.getElementById(params.displayId)
            .innerHTML = man.locale["concept_instances"] + ': ' + params.times;
    });
    addon.port.on("showNavigationComponents", function(show){
        //console.log("showNavigationComponents ", show);
        document.getElementById("se-nav-components").style["display"] = (show)? "":"none";
        document.getElementById("se-nav-prev").onclick = (show)? function(evt){addon.port.emit("prevConceptInstances");}: function(evt){evt.preventDefault();};
        document.getElementById("se-nav-next").onclick = (show)? function(evt){addon.port.emit("nextConceptInstances");}: function(evt){evt.preventDefault();};
    });
    addon.port.on("showSearchComponents", function(show){
        document.getElementById("se-search-components").style["display"] = (show)? "":"none";
        document.getElementById("se-search-trigger").onclick = (show)? function(evt){
            addon.port.emit("searchConceptInstances", document.getElementById("se-search-input").value);
        }: function(evt){evt.preventDefault();};
    });
}
SidebarManager.prototype.loadSubforms = function() {  
    this.loadSubform({ from:'subforms/edit-concept-template.html' });
    this.loadSubform({ from:'subforms/edit-search-engine.html' });
    this.loadSubform({ from:'subforms/manage-concept-instances.html' });
    this.loadSubform({ from:'subforms/properties-management.html' });
    this.loadSubform({ from:'subforms/edit-property.html' });
    this.loadSubform({ from:'subforms/choose-decorator.html' });
    this.loadSubform({ from:'subforms/choose-decorator-messages.html' });
    this.loadSubform({ from:'subforms/config-decorator-required.html' });
    this.loadSubform({ from:'subforms/apps-management.html' });
};
SidebarManager.prototype.loadRelatedPTemplates = function(properties) {

    $("#properties-list").innerHTML = "";
    for (var i = 0; i < properties.length; i++) {
        man.createPTemplate(man.buildPTemplateConfig({
            id: properties[i].id,
            name: properties[i].data['name'],
            xpathValue: properties[i].data['xpath'],
            occurrences: '0'
        }));
    };
    if (properties.length && properties.length > 0)
        man.setCurrentPTemplateId(properties[properties.length-1].id);
}
SidebarManager.prototype.loadMatchedCTemplatesData = function(xpaths) {

    try{            
        // Carga el select con los xpaths seleccionados
        // Loads the select with the selected xpaths
        var xpathsresults = document.getElementById(this.getCurrCTemplateId() + "-conceptXpath");
        // Limpia el select
        if(xpathsresults.length > 0) xpathsresults.innerHTML = "";
        for (var i = 0; i < xpaths.length; i++) {

            var option = xpathsresults.appendChild(document.createElement('option'));
                option.value = xpaths[i];
                option.text = xpaths[i];
        }
        //$(xpathsresults).trigger("change"); doesnt save the xpath, so better force it
        var id = this.getCurrCTemplateId(),
            uiXpath = this.getCTemplateXpath(id);
        addon.port.emit("selectCTemplateInDom", uiXpath);
        addon.port.emit("countCTemplatesInDom", {
            displayId: id + "-conceptOccurr", //No cambiar por data.id
            xpath: uiXpath});
        this.data.updateCTemplateXpath(id, uiXpath);

    }catch(err){ console.log(err.message); }
}
SidebarManager.prototype.removeFullConceptTemplate = function (id) {
    //console.log('removing ' + id);
    if(id){
        if(confirm(this.locale['delete_template_question'])) {
            document.getElementById(id).remove();
            addon.port.emit('storage.removeFullConceptTemplate', id);
        }
    }
}
SidebarManager.prototype.saveAsLocalFile = function (textContent) {
    textContent = JSON.stringify(textContent, null, 4);
    var uiValue = document.getElementById('model-name').value;
    var filename = (uiValue && uiValue.length>0 && uiValue.trim().length>1)? uiValue: this.locale['unknown_filename'];

    var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/xml;charset=utf-8,' +
            encodeURIComponent(textContent));
        pom.setAttribute('download', filename + '.json'); 

    var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);

    pom.dispatchEvent(event);
}
SidebarManager.prototype.loadStoredPTemplatesInUI = function (concept) {
    addon.port.emit("getStoredPTemplates", concept);
}
SidebarManager.prototype.highlightMatchedPropsInUI = function(xpaths) {

    try{            
        // Carga el select con los xpaths seleccionados en la propiedad
        // Loads the select with the selected xpaths
        var xpathsresults = document.getElementById(this.getCurrentPTemplateId() + "-propXpath");
        // Limpia el select
        if(xpathsresults.length > 0) xpathsresults.innerHTML = "";
        for (var i = 0; i < xpaths.length; i++) {

            var option = xpathsresults.appendChild(document.createElement('option'));
                option.value = xpaths[i];
                option.text = xpaths[i];
        }
        //$(xpathsresults).trigger("change"); doesnt save the xpath, so better force it
        var data = this.getPTemplateData(this.getCurrentPTemplateId()),
            man = this;
        addon.port.emit("selectCTemplateInDom", data.xpath); //TODO: change concept by elem
        addon.port.emit("countCTemplatesInDom", { //TODO: change concept by elem
            displayId: man.getCurrentPTemplateId() + "-propOccurr", //No cambiar por data.id
            xpath: data.xpath});
        this.data.updatePTemplate(data);
    }catch(err){ console.log(err.message); }
}
SidebarManager.prototype.clearCurrCTemplateId = function () {
    this.currCTemplateId = undefined;
}
SidebarManager.prototype.clearTempData = function(){
    this.temp = {};
}
SidebarManager.prototype.enableLoading = function(){

    var loading = document.createElement("div");
        loading.id= "woa-full-loading";
        loading.className = "loading";
        loading.onclick = function(){ this.remove(); }
    document.body.appendChild(loading);
}
SidebarManager.prototype.disableLoading = function(){

    var loading = document.getElementById("woa-full-loading");
    if(loading) loading.remove();
}
SidebarManager.prototype.enableCTemplateTags = function(){

    var ctrl = $('#edit-concept-template-tag');
    this.enableTags({ 
        ctrl: ctrl, 
        callback: function() {
            ctrl.addClass('input-loading');
            addon.port.emit('requestCTemplateTokens', ctrl[0].value);
        }
    });
}
SidebarManager.prototype.enablePTemplateTags = function(tags){

    var ctrl = $('#edit-property-tag');
    this.enableTags({ 
        ctrl: ctrl, 
        callback: function() {
            ctrl.addClass('input-loading');
            addon.port.emit('requestPTemplateTokens', 
                ctrl[0].value, 
                document.getElementById("edit-property-owner").value
            );
        }
    });
}
SidebarManager.prototype.enableTags = function(data){

    var man = this;
    data.ctrl.autocomplete({
        source: [],
        minLength: 1,
        select: function(event, ui) {
            event.preventDefault();
            $(this).val(ui.item.label); 
            this.setAttribute("dbp", ui.item.value);
        },
        open: function(event, ui) {
            $(this).removeClass('input-loading');
        },
        close: function(event, ui) {
            $(this).removeClass('input-loading');
        },
        change: function(event, ui) {
            var me = $(this);
            me.removeClass('input-loading');
            if (ui.item === null) { 
                //me.val(''); //This forced the tag to match an ontology entity 
                this.setAttribute("dbp", "");
            } 
            me.autocomplete('close');
        }
    });
    var searchTimeout;
    data.ctrl[0].onkeypress = function(evt){
        if(this==document.activeElement){
            if (evt.charCode != 0){
                if (searchTimeout != undefined) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(data.callback, 250);  
            }
        }
    };
}
SidebarManager.prototype.loadCTemplateTokens = function(tags){

    if( document.getElementById("edit-concept-template").style.display != 'none' ){
        var iTags = $(document.getElementById('edit-concept-template-tag'));
            iTags.autocomplete("option", "source", tags);
            iTags.autocomplete( "search", iTags[0].value );
    } else console.log('Not loading tags');
}
SidebarManager.prototype.loadPTemplateTokens = function(tags){
    if( document.getElementById("edit-property-tag").style.display != 'none'){
        var iTags = $(document.getElementById('edit-property-tag'));
        iTags.autocomplete("option", "source", tags);
        iTags.autocomplete("search", iTags[0].value);
    } else console.log('Not loading tags');
}
SidebarManager.prototype.getCTemplatesListContainer = function(){
    return document.getElementById('created-ctemplates-list');
}
SidebarManager.prototype.clearCTemplatesList = function(){
    var list = this.getCTemplatesListContainer();
        if(list) list.innerHTML = "";
}
SidebarManager.prototype.loadCTemplates = function(concepts){
    var list = this.getCTemplatesListContainer();

    for (var i = 0; i < concepts.length; i++) {
        if(concepts[i] && concepts[i].imageSrc && concepts[i].name){
            var thumb = this.createCTemplateThumbnail({
                imageSrc: concepts[i].imageSrc,
                name: concepts[i].name,
                id: concepts[i].id
            });
            list.appendChild(thumb);
        }
    };
}
SidebarManager.prototype.createCTemplateThumbnail = function(args){

    var container = document.createElement("div");
        container.className = "col-xs-6 col-md-3";
        container.id = args.id;

    var thumbnail = container.appendChild(document.createElement("div"));
        thumbnail.className = "thumbnail";

    var cfg = document.createElement("div"), ui = this;
        cfg.className = "thumbnail-cog woa-cog-concept";
        cfg.id = "cog-thumb-" + args.id;
        cfg.onclick = function(e){
            addon.port.emit("openSidebarContextMenu", {
                id: this.id,
                clientX: e.clientX,
                clientY: e.clientY
            });
        };
        thumbnail.appendChild(cfg);
        //HIDING AND DISPLAYING OPTIONS
        cfg.style.display = 'none';
        
        thumbnail.onmouseover = function(evt){
            this.getElementsByClassName('thumbnail-cog')[0].style.display = '';
        }

    var cfgIcon = document.createElement("i");
        cfgIcon.className = "woa-cog-concept glyphicon glyphicon-cog";
        cfg.appendChild(cfgIcon);

    var imgContainer = document.createElement("div");
        imgContainer.className = 'thumbnail-image-container'; 
        thumbnail.appendChild(imgContainer);

    var img = document.createElement("img");
        img.className = 'thumbnail-image'; 
        img.src = args.imageSrc; 
        imgContainer.appendChild(img);

    var caption = thumbnail.appendChild(document.createElement("div"));
        caption.className = "caption custom-caption";
        caption.innerHTML = args.name;

    var list = this.getCTemplatesListContainer();
        list.insertBefore(container, list.lastChild);

    return container;
}    
SidebarManager.prototype.getCInstancesListContainer = function(){
    return document.getElementById('created-cinstances-list');
}
SidebarManager.prototype.clearCInstancesList = function(){
    var list = this.getCInstancesListContainer();
        if(list) list.innerHTML = "";
}
SidebarManager.prototype.loadCInstances = function(instances){
    //console.log('Instances from sidebar context:');
    //console.log(instances);
    var list = this.getCInstancesListContainer();  
        list.innerHTML = ""; 
    for (var i = 0; i < instances.length; i++) {

        list.appendChild(this.createCInstanceThumbnail(instances[i]));
    };
}
SidebarManager.prototype.createCInstanceThumbnail = function(args){
    
    var container = document.createElement("a");
        container.href="#";
        container.className = "list-group-item";
        container.onclick = function(evt){ evt.stopPropagation(); evt.preventDefault(); }

    var control = document.createElement("div"), ui = this;
        control.className = "instance-item-cog";
        container.appendChild(control);

    var btn = document.createElement("button");
        btn.className = "btn-woa-instance-object btn-default glyphicon glyphicon-option-horizontal"; 
        btn.id = args.getOrder();
        //btn.setAttribute("contextmenu", "mymenu");
        control.appendChild(btn);

    var title = document.createElement("h4");
        title.className = "list-group-item-heading";
        title.innerHTML = args.getName() + " #" + args.getOrder();
        container.appendChild(title);

    var infobox = document.createElement("p");
        infobox.className = "list-group-item-text";
    var infoboxList = document.createElement("ul");
    infobox.appendChild(infoboxList);
    var props = "";

    var ioProperties = args.getProperties();
    for (var i = 0; i < ioProperties.length; i++) {

        var prop = document.createElement("li");
            prop.innerHTML = ioProperties[i].getName() + ": " + ioProperties[i].getValue();
        infoboxList.appendChild(prop);
    }
    //infoboxList.innerHTML = "<ul>" + props + "</ul>";
    container.appendChild(infobox);
  
    return container;
}    
SidebarManager.prototype.sendMessage = function(args){
    alert('message sent to ' + args);
}
SidebarManager.prototype.loadView = function(data){

    try{ 
        this.hideAllViews("subform-body");
        this.hideAllViews("subform");
        this.toggleActive(data.id, true);
        this.clearTempData();
    }catch(err){ console.log(err.message);}
}
SidebarManager.prototype.hideAllViews = function(classname){

    var views = document.getElementsByClassName(classname);
    for (var i = 0; i < views.length; i++) {
        var id = views[i].getAttribute("id");
        if(id && id.length && id.length > 0)
            this.toggleActive([id], false);
    };
}
SidebarManager.prototype.loadConceptInstancesView = function(){

    this.loadView({id:['manage-concept-instances']});
}
SidebarManager.prototype.loadConceptInstancesIntoView = function(instances){

    this.loadCInstances(window['woaInstanceObjects']);
    this.disableLoading();
}
SidebarManager.prototype.manageCTemplates = function (evt) {
    this.loadView({id:['manage-concept-templates', 'concepts-management']});
    addon.port.emit("loadStoredCTemplates");
}
SidebarManager.prototype.managePTemplates = function (concept, properties) {
    this.loadView({id:['manage-properties', 'properties-management']});
    this.loadPTemplates(concept, properties);
}
SidebarManager.prototype.loadPTemplates = function(concept, properties){
    
    var list = document.getElementById('created-properties-list');
    if(list) {
        list.innerHTML = "";
        if(properties && properties.length){

            document.getElementById('properties-instructions').innerHTML = "";
            for (var i = 0; i < properties.length; i++) {
                if(properties[i] && properties[i].id && properties[i].name){
                    var thumb = this.createPTemplateItem(concept, properties[i]);
                    if(thumb) list.appendChild(thumb);
                }
            };
        }
        else {
            document.getElementById('properties-instructions').innerHTML = this.locale['no_properties_for_concept'];
        }
    }
}
SidebarManager.prototype.createPTemplateItem = function (concept, prop) {

    return this.createConfigurableListItem({
        id: prop.id,
        name: prop.name,
        onRemove: function(evt){ 
            var listItem = evt.target.parentElement.parentElement.parentElement;
            if(listItem.parentElement.children && listItem.parentElement.children.length==1) 
                evt.target.ownerDocument.getElementById('properties-instructions').innerHTML = evt.target.ownerDocument.defaultView.sidebar.locale['no_properties_for_concept'];
            listItem.remove(); 
            addon.port.emit('storage.removePTemplate', prop.id);
        },
        onConfig: function(evt){
            var ui = evt.target.ownerDocument.defaultView.sidebar;
                ui.openPTemplateForm();
                ui.loadExistingPTemplateData(concept, prop);
                ui.focus('edit-property-name');
        }
    });
}
SidebarManager.prototype.createConfigurableListItem = function (data) {

    var desc = document.createElement("span");
        desc.innerHTML = data.name;

    var controls = document.createElement("div");
        controls.className = "property-item-cog";

    var cogIcon = document.createElement("span");
        cogIcon.className = "glyphicon glyphicon-cog";
    var configure = document.createElement("a");
        configure.onclick = data.onConfig;
        configure.appendChild(cogIcon);

    var remIcon = document.createElement("span");
        remIcon.className = "glyphicon glyphicon-remove-sign";
    var remove = document.createElement("a");
        remove.onclick = data.onRemove;
        remove.appendChild(remIcon);

    controls.appendChild(configure);
    controls.appendChild(remove);

    var groupItem = document.createElement("a");
        groupItem.className = "list-group-item left-border-deco";
        groupItem.id = data.id;
        groupItem.onclick = data.onClick;
        groupItem.appendChild(desc);
        groupItem.appendChild(controls);

    return groupItem;
}
SidebarManager.prototype.toggleActive = function (domIds, enable) {

    for (var i = 0; i < domIds.length; i++) {
        var elem = document.getElementById(domIds[i]);
        var nav = document.getElementById(domIds[i] + '-nav');

        if(!enable) {//elem.classList.contains('active')){
            if(nav) nav.className = 'inactive-tab';
            if(elem) elem.style['display'] = 'none';
        }
        else{
            if(elem) elem.style['display'] = '';
            if(nav) nav.className = 'active';   
        }
    };
}
SidebarManager.prototype.importFile = function(control){

    console.log(control);
    console.log(URL.createObjectURL(control.files[0]));
}
SidebarManager.prototype.manageApplications = function () {

    this.loadView({id:['manage-apps','apps-management']});
    addon.port.emit('loadExistingApplications'); 
}
SidebarManager.prototype.loadExistingApplications = function (items) {

    var list = document.getElementById("woa-apps-list");
        list.innerHTML = "";
 
    for (var i = 0; i < items.length; i++) {
        list.appendChild(this.createAppListItem(items[i]));
    };
}
SidebarManager.prototype.removeApplication = function (elemId) {
    if(document.getElementById(elemId)) document.getElementById(elemId).remove();
}
SidebarManager.prototype.createAppListItem = function (item) {

    var man = this;
    return this.createConfigurableListItem({
        id: item.name,
        name: item.display,
        onRemove: function(evt){  
            if(confirm(man.locale['delete_app_question'])) {
                addon.port.emit("removeApplication", item.name);
                man.removeApplication(item.name);
            }
            evt.stopPropagation(); evt.preventDefault(); 
        },
        onConfig: function(evt){
            alert('Nothing to configure for this app');
            evt.stopPropagation();
            evt.preventDefault(); 
        },
        onClick: function(evt){
            addon.port.emit("openApplication", item.path);
            evt.stopPropagation(); evt.preventDefault(); 
        }
    });
}
SidebarManager.prototype.initializeAccordion = function (id) {

    $("#" + id).accordion({
        animate: 200,
        heightStyle: "content",
        icons: false,
        collapsible: true,
        active: false
    });
}
SidebarManager.prototype.loadSubform = function (params) {
    //Extrae el contenido del panel actual desde el archivo 
    //Loads the required subform
    var req = new XMLHttpRequest();
        req.open('GET', params.from, false); 
        req.send(null);
    var container = document.getElementById(params.from.replace('.html', '').replace('subforms/',''));
    container.innerHTML = this.processSubformContent({
        src:req.responseText, 
        locale:this.locale
    });
    if(params.callback) params.callback();
}
SidebarManager.prototype.loadXpathOptions = function(elemId, value) {
    //console.log(elemId, value);
    if(value!=undefined && value.trim().length > 0){
        $("#"+elemId).bootstrapToggle('enable');
        $("#"+elemId).bootstrapToggle('on');
        this.temp[elemId] = value;
    }
};
SidebarManager.prototype.loadExistingCTemplateData = function (data) {

    this.clearCTemplateEditionForm();
    this.currCTemplateId = data.id;

    document.getElementById("concept-header-title").innerHTML = this.locale["edit_concept_title"];
    document.getElementById("concept-header-icon").className = "glyphicon glyphicon-pencil";
    document.getElementById("edit-concept-template-name").value = data.name;
    document.getElementById("edit-concept-template-tag").value = data.tag;

    var opt = document.createElement('option');
        opt.value = data.xpath;
        opt.text = data.xpath;

    document.getElementById('concept-preview-image').src = data.imageSrc; 
    document.getElementById("edit-concept-template-xpath").appendChild(opt);
    document.getElementById('discard-materializable-label').innerHTML = this.locale['discard_changes'];
    document.getElementById('save-concept').onclick = function(evt){

        var sdb = evt.target.ownerDocument.defaultView.sidebar;
        console.log(evt);
        if(sdb.validateCTemplate()){

            data.name = document.getElementById('edit-concept-template-name').value;
            data.tag = document.getElementById('edit-concept-template-tag').value;
            data.xpath = document.getElementById('edit-concept-template-xpath').value;
            data.imageSrc = document.getElementById('concept-preview-image').src;

            //no se toca decorator. TODO: Tampoco se toca url por ahora (debería ser onchange del select)
            addon.port.emit('storage.updateCTemplate', data);
            sdb.clearCTemplateEditionForm();
            sdb.manageCTemplates();
        }
    };
}
SidebarManager.prototype.loadCTemplateForPTemplateLinkage = function (concepts, selected, disabled) {
    // TODO: refactor --> loadXpathOptions

    var sel = document.getElementById("edit-property-owner");
        sel.innerHTML = "";

    for (var i = 0; i < concepts.length; i++) {
        var opt = document.createElement('option');
            opt.value = concepts[i].id;
            opt.text = concepts[i].name;
            opt.woaXpath = concepts[i].xpath;
        sel.appendChild(opt);
    };

    if(selected) sel.value = selected;
    sel.disabled = disabled;
    var me = this;
    sel.onchange = function(evt){
        addon.port.emit("updateCurrentCTemplate", this.value);
        addon.port.emit("updateCurrentPTemplateXpaths", this.options[this.selectedIndex].woaXpath) 
    } 
    //And for the first time
    addon.port.emit("updateCurrentCTemplate", sel.value);
    addon.port.emit("updateCurrentPTemplateXpaths", sel.options[sel.selectedIndex].woaXpath) 
} 
SidebarManager.prototype.loadExistingPTemplateData = function (concept, prop) {

    this.clearPTemplateEditionForm();
    this.enablePTemplateTags();
    this.currCTemplateId = prop.id;

    document.getElementById("property-header-title").innerHTML = "Edit the property";
    document.getElementById("property-header-icon").className = "glyphicon glyphicon-pencil";
    document.getElementById("edit-property-name").value = prop.name;
    
    this.loadCTemplateForPTemplateLinkage([concept], concept.id, true);

    document.getElementById("edit-property-tag").value = prop.tag;
    var opt = document.createElement('option');
        opt.value = prop.xpath;
        opt.text = prop.xpath;

    document.getElementById('property-preview-image').src = prop.imageSrc; 
    document.getElementById("edit-property-xpath").appendChild(opt);
    document.getElementById('discard-property-label').innerHTML = this.locale['discard_changes'];
    document.getElementById('save-property').onclick = function(evt){

        var sdb = evt.target.ownerDocument.defaultView.sidebar;
        if(sdb.validateCTemplate()){

            prop.name = document.getElementById('edit-property-name').value;
            prop.tag = document.getElementById('edit-property-tag').value;
            prop.xpath = document.getElementById('edit-property-xpath').value; //sdb.getRelativeXpathFromConcept(document.getElementById('edit-property-xpath').value);
            prop.imageSrc = document.getElementById('property-preview-image').src;
            //TODO: No se toca url por ahora (debería ser onchange del select)
            addon.port.emit('storage.updatePTemplate', prop);
            sdb.clearPTemplateEditionForm();
            sdb.manageCTemplates();
        }
    };
    document.getElementById('exit-property').onclick = function(evt){
        //evt.target.ownerDocument.defaultView.sidebar.managePTemplates(concept, prop);
        addon.port.emit("managePTemplates");
    }
}
SidebarManager.prototype.clearCTemplateEditionForm = function () {

    document.getElementById('edit-concept-template-name').value = '';
    document.getElementById('edit-concept-template-tag').value = '';
    document.getElementById('edit-concept-template-xpath').innerHTML = '';
    document.getElementById('concept-preview-image').src = '';
    document.getElementById('discard-materializable-label').innerHTML = this.locale['discard'];
    document.getElementById("concept-header-title").innerHTML = "";
    document.getElementById("concept-header-icon").className = "";
    document.getElementById('save-concept').onclick = undefined;
}
SidebarManager.prototype.clearPTemplateEditionForm = function () {

    document.getElementById('edit-property-name').value = '';
    document.getElementById('edit-property-tag').value = '';
    document.getElementById('edit-property-xpath').innerHTML = '';
    document.getElementById('property-preview-image').src = '';
    document.getElementById('discard-property-label').innerHTML = this.locale['discard'];
    document.getElementById("property-header-title").innerHTML = "";
    document.getElementById("property-header-icon").className = "";
    document.getElementById('save-property').onclick = undefined;
    document.getElementById('exit-property').onclick = undefined;
}
SidebarManager.prototype.processSubformContent = function (params) {

    var xmlSrc = new DOMParser().parseFromString(params.src, "text/html").documentElement;
    this.replaceL10nStrings({node:xmlSrc, locale:params.locale});

    return xmlSrc.innerHTML;
}
SidebarManager.prototype.replaceL10nStrings = function (params) {

    var nodes = new XPathInterpreter().getElementsByXpath(
        "//*[@data-l10n-id]", params.node, window
    );
    for (var i = 0; i < nodes.length; i++) {
        if(nodes[i]){
            $(nodes[i]).text(params.locale[nodes[i].getAttribute("data-l10n-id")]);
        }
    };
}
SidebarManager.prototype.loadFormValidation = function(data) {

    var form = $("#" + data.id), rules = {};
    for (var i = 0; i < data.required.length; i++) {
        rules[data.required[i]] = { required: true };
    };

    form.validate({
        rules: rules,
        errorPlacement: function(error, element) {
            if(element.parent('.form-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
};
SidebarManager.prototype.openCTemplateForm = function() {
    var ui = this;
    this.loadView({ id:['edit-concept-template'] });
    this.loadFormValidation({
        id:'edit-concept-template-form',
        required:['edit-concept-template-name', 'edit-concept-template-tag']
    });
}
SidebarManager.prototype.focus = function(domId) {
    
    document.getElementById(domId).focus();
}
SidebarManager.prototype.openPTemplateForm = function() {

    this.loadView({ id:['edit-property'] });
    this.loadFormValidation({
        id:'edit-property-form',
        required:['edit-property-name', 'edit-property-tag']
    });
}
SidebarManager.prototype.openSearchEngineForm = function() {

    this.loadView({ id:['edit-search-engine'] });
    var me = this;
    var toggles = $("#search-engine-entry, #search-trigger, #next-nav-page, #prev-nav-page");
        toggles.bootstrapToggle();
        toggles.bootstrapToggle('off');
        toggles.bootstrapToggle('disable');
}
SidebarManager.prototype.enableEngineControls = function(data) {

    if(data){
        if(data.entry) this.loadXpathOptions("search-engine-entry", data.entry); //enable and tmp store
        if(data.trigger) this.loadXpathOptions("search-trigger", data.trigger);
        if(data.next) this.loadXpathOptions("next-nav-page", data.next);
        if(data.prev) this.loadXpathOptions("prev-nav-page", data.prev);
    }
}
SidebarManager.prototype.openDecoratorForm = function() {
    this.loadView({ id:["manage-decorator", "choose-decorator"]});
}
SidebarManager.prototype.loadExistingWrapperData = function(decoratorsData, selectedId) {
    this.loadWrappers(decoratorsData);
    this.checkElement(selectedId);
}
SidebarManager.prototype.saveDecoratorData = function(callback) {
    //Store current selected classname if changed (at this point we have the id)
    var oldClassname = this.currentDecorator.classname;
    this.currentDecorator.classname = document.querySelector('input[name="decorators"]:checked').value;

    if(oldClassname != this.currentDecorator.classname){
        addon.port.emit('saveDecoratorClassname', 
            this.currentDecorator.id, 
            this.currentDecorator.classname, 
            callback);
    } else { this[callback](); }
}
SidebarManager.prototype.openDecoratorMessagesForm = function() {
    //Load the view and the stored data in the view 
    this.loadView({ id:["manage-decorator", "choose-decorator-messages"]});
    var me = this;
    addon.port.emit('loadWrapperMessagesData', me.currentDecorator.id, me.currentDecorator.classname ); 
}
SidebarManager.prototype.loadWrapperMessages = function(data) {
    //PARAMS 
    //data = {messages:[...], selected:[...]};
    //data.messages = [{id:..., name:..., propertied: [ {id:..., name:...} ]}]

    //Save current for comparing when leaving the form
    //this.currentDecorator.messages = data.messages;
    //load the options in UI
    this.loadListElements(
        "decorator-messages-list", 
        "checkbox",
        "decorator-messages-ctrl", //control selector
        data.messages,
        data.selected
    );
}
SidebarManager.prototype.saveDecoratorMessages = function(callback) {
    
    //Get the current selected messages
    this.currentDecorator.messages = [];
    var selMessages = $(document.querySelectorAll('input[class="decorator-messages-ctrl"]:checked'));
    for (var i = 0; i < selMessages.length; i++) {
        this.currentDecorator.messages.push(selMessages[i].getAttribute('id'));
    }
    //Save them (database check its existence and perform the proper CUD operations)
    addon.port.emit('saveDecoratorMessages', 
        this.currentDecorator.id, 
        this.currentDecorator.messages, 
        callback);
}
SidebarManager.prototype.openDecoratorMappingsForm = function() {

    var me = this;
    this.loadView({ id:["manage-decorator", "config-decorator-required"]});
    addon.port.emit('loadDecoratorParamsMappings', 
        me.currentDecorator.id, me.currentDecorator.classname, 
        me.currentDecorator.messages );
}
SidebarManager.prototype.saveDecoratorMappings = function(callback) {

    //Get the current selected messages
    this.currentDecorator.mappings = [];
    var selMessages = document.getElementsByClassName("mapping-list-item");
    for (var i = 0; i < selMessages.length; i++) {
        // container > popup > select
        if(selMessages[i].lastChild.lastChild.selectedIndex > 0)
            this.currentDecorator.mappings.push({
                paramId: selMessages[i].id, //It is a number (and it is reasonable, not an error!)
                propId: selMessages[i].lastChild.lastChild.value
            });
    }
    //Save them (database check its existence and perform the proper CUD operations)
    addon.port.emit('saveDecoratorMappings', 
        this.currentDecorator.id,
        this.currentDecorator.mappings, 
        callback);
}
SidebarManager.prototype.saveSearchEngineData = function() {
    
    addon.port.emit("saveSearchEngineData", {
        id: document.getElementById("edit-engine-owner").value,
        entry: (document.getElementById("search-engine-entry").checked)? this.temp["search-engine-entry"]: " ",
        trigger: (document.getElementById("search-trigger").checked)? this.temp["search-trigger"]: " ",
        next: (document.getElementById("next-nav-page").checked)? this.temp["next-nav-page"]: " ",
        prev: (document.getElementById("prev-nav-page").checked)? this.temp["prev-nav-page"]: " "
    });
    this.manageCTemplates();
}
SidebarManager.prototype.getSinglePropList = function(messages) {

    var properties = [], aux=[];
    for (var i = 0; i < messages.length; i++) {
        if(messages[i].properties){
            var currProps = messages[i].properties;

            for (var j = 0; j < currProps.length; j++) {
                if(aux.indexOf(currProps[j].id) > -1){
                    console.log(currProps[j] + ' already exist');
                }
                else { 
                    properties.push(currProps[j]); 
                    aux.push(currProps[j].id)
                }
            };
        }
    };
    return properties;
}
SidebarManager.prototype.loadDecoratorParamsMappings = function(allRequiredMappings, storedMappingsIds, properties) {
    // TODO: Modularize

    var list = document.getElementById("decorator-required-props-list");
        list.innerHTML = "";

    if(allRequiredMappings.length == 0){
        list.innerHTML = this.locale["no_required_parameter_to_link"];
        return;
    } else if(properties.length == 0){
        var no_property_to_link = document.createElement("p");
            no_property_to_link.innerHTML = this.locale["no_property_to_link"];
        list.appendChild(no_property_to_link);

        var required_parameters_are = document.createElement("p");
            required_parameters_are.innerHTML = this.locale["required_parameters_are"];
        list.appendChild(required_parameters_are);

        var ul = document.createElement("ul");
        list.appendChild(ul);

        for (var i = 0; i < allRequiredMappings.length; i++) {
            var item = document.createElement("li");
                item.innerHTML = allRequiredMappings[i].name;
            ul.appendChild(item);
        }
        return;
    }
    //Saving 
    for (var i = 0; i <  allRequiredMappings.length; i++) {
        var linked = false;
        for (var j = 0; j < storedMappingsIds.length; j++) {
            if(storedMappingsIds[j].id ==  allRequiredMappings[i].id) {
                linked = true;
                break;
            }
        };
        var domElem = this.createMappingItem( allRequiredMappings[i], properties, linked);
        list.appendChild(domElem);
    };
}
SidebarManager.prototype.setMappingAsLinked = function(container) {

    container.children[0].children[0].className = "base-parameter linked-parameter input-group-addon";
    container.children[0].children[0].children[0].className = "glyphicon glyphicon-link";
}
SidebarManager.prototype.createMappingItem = function(data, properties, linked) {
    
    var cnt = document.createElement("div");
        cnt.className = "mapping-list-item";
        cnt.id = data.id;
    var inputGroup = document.createElement("div");
        inputGroup.className = "input-group input-group-lg";
    cnt.appendChild(inputGroup);

    // STATUS
    var status = document.createElement("span"), statusIcon = document.createElement("span");
    if(linked) {
        statusIcon.className = "glyphicon glyphicon-link";
        status.className = "base-parameter linked-parameter input-group-addon";
    } else {
        statusIcon.className = "glyphicon glyphicon-remove";
        status.className = "base-parameter unlinked-parameter input-group-addon";
    }
    status.appendChild(statusIcon);

    //LABEL
    var propLabel = document.createElement("span");
        propLabel.innerHTML = data.name;
        propLabel.className = "form-control";
        propLabel.style['border-left'] = "0px none";
    
    //CONFIGURATION
    var configuration = document.createElement("div");
        configuration.className = "mapping-popup";
        configuration.style.display = 'none';
        configuration.className = '';
    
    var sel = document.createElement("select");
        sel.className = 'form-control';
    var selPlaceholder = document.createElement("option");
        selPlaceholder.text = this.locale["choose_property_to_link"];
        selPlaceholder.style['color'] = "#AAA !important";
        selPlaceholder.disabled =true;
        selPlaceholder.selected = true;
        selPlaceholder.hidden = true;
        sel.appendChild(selPlaceholder);

        for (var i = 0; i < properties.length; i++) {
            var prop = document.createElement("option"); 
                prop.value = properties[i].id;
                prop.text = properties[i].name;
            sel.appendChild(prop);
        }
        sel.onchange = function(evt){
            $(evt.target.parentElement).slideUp(); //parent>configuration
            evt.target.ownerDocument.defaultView.sidebar.setMappingAsLinked(evt.target.parentElement.parentElement);
            evt.stopPropagation(); 
            evt.preventDefault();
        }
    configuration.appendChild(sel);

    //CONFIGURATION BUTTON
    var configure = document.createElement("div");
        configure.className = "input-group-btn";
        configuration.className = 'mapping-popup';
    var configureButton = document.createElement("button");
        configureButton.className = "btn btn-default";
        configureButton.onclick = function(evt){ 
            var popup = evt.target.parentElement.parentElement.parentElement.children[1];
            var opened = (popup && popup.style.display != 'none')? true:false;   
            $(".mapping-popup:visible").slideUp();
            if(!opened) $(configuration).slideDown(300);
            evt.stopPropagation(); 
            evt.preventDefault();
        }
        configure.appendChild(configureButton);
    var configureButtonIcon = document.createElement("span");
        configureButtonIcon.className = "glyphicon glyphicon-cog";
        configureButton.appendChild(configureButtonIcon);

    var groupLabel = document.createElement("label");
        groupLabel.setAttribute("for", data.id);

    inputGroup.appendChild(status);
    inputGroup.appendChild(propLabel);
    inputGroup.appendChild(configure);
    cnt.appendChild(configuration);

    return cnt;
}
SidebarManager.prototype.loadListElements = function(listId, type, ctrlName, items, selItems, onConfig) {

    var list = document.getElementById(listId);
        list.innerHTML = "";
    
    for (var i = 0; i < items.length; i++) {
        var item = this.createCheckeableListItem(items[i], type, ctrlName); 

        for (var j = 0; j < selItems.length; j++) {
            if(selItems[j].name == items[i].name) { //TO CONSIDER: shouldn't be a good idea to compare against values??? (I don't remember the reason of value)
                item.children[0].children[0].children[0].checked = true; 
                break;
            }
        };
        if(onConfig) item.appendChild(this.buildConfigureButton(onConfig));
        list.appendChild(item);
    };
}
SidebarManager.prototype.buildConfigureButton = function(callback) {

    var controls = document.createElement("div");
        controls.className = "property-item-cog";

    var cogIcon = document.createElement("span");
        cogIcon.className = "glyphicon glyphicon-cog";
    var configure = document.createElement("a");
        configure.onclick = callback;
        configure.appendChild(cogIcon);

    controls.appendChild(configure);
    return controls;
}
SidebarManager.prototype.validateCTemplate = function() {

    return $("#edit-concept-template-form").valid();
}
SidebarManager.prototype.validateForm = function(domId) {

    return $("#" + domId).valid();
}
SidebarManager.prototype.loadWrappers = function (decoratorsData) {

    var list = document.getElementById("list-of-decorators");
        list.innerHTML = "";
    
    for (var i = 0; i < decoratorsData.length; i++) {
        var item = this.createCheckeableListItem(decoratorsData[i], 'radio', 'decorators'); 
        list.appendChild(item);
    };
}
SidebarManager.prototype.checkElement = function(id) {
    document.getElementById(id).checked = true;
}
SidebarManager.prototype.createCheckeableListItem = function(data, type, name) {
 
    var span = document.createElement("span");
        span.innerHTML = data.name;
        span.className = "custom-input-label";

        var groupItem = document.createElement("a");
        groupItem.className = "list-group-item custom-list-group-item";
        groupItem.onclick = function(evt){
            var ctrl = this.children[0].children[0].children[0];
                ctrl.checked = !ctrl.checked;
            evt.stopPropagation();
        }

    var groupLabel = document.createElement("label");
        groupLabel.setAttribute("for", data.id);
        groupLabel.onclick = function(evt){ evt.stopPropagation(); }

        var inputCtrl = document.createElement("div");
        var input = document.createElement("input");
            input.setAttribute("id", data.id);
            input.setAttribute("type", type);
            if(name && type == 'radio') input.setAttribute("name", name );
            else if(name) input.className = name;
            input.setAttribute("value", data.id);
            input.woaData = data;
            input.onclick = function(evt){ evt.stopPropagation(); }

    groupItem.appendChild(groupLabel);
    groupLabel.appendChild(inputCtrl);
    groupLabel.appendChild(span);
    inputCtrl.appendChild(input);

    return groupItem;
}
SidebarManager.prototype.loadCTemplateForSearchEngineLinkage = function (concepts, selected, disabled) {
    // TODO: refactor --> edit-property-owner

    var sel = document.getElementById("edit-engine-owner");
        sel.innerHTML = "";

    for (var i = 0; i < concepts.length; i++) {
        var opt = document.createElement('option');
            opt.value = concepts[i].id;
            opt.text = concepts[i].name;
            opt.woaXpath = concepts[i].xpath;
        sel.appendChild(opt);
    };

    if(selected) sel.value = selected;
    sel.disabled = disabled;
    var me = this;
    sel.onchange = function(evt){ 
        //TODO: also change the form
        addon.port.emit("editSearchEngineById", this.value);
    } 
    //And for the first time
    addon.port.emit("updateCurrentCTemplate", sel.value);
} 
var sidebar;
addon.port.on("initSidebar", function(props) {
    sidebar = new SidebarManager(props.locale);
});
var { Frame } = require("sdk/ui/frame");
var { Toolbar } = require("sdk/ui/toolbar");
var { ActionButton } = require('sdk/ui/button/action');
var utils = require('sdk/window/utils');
var self = require('sdk/self');
var tabsUtils = require('sdk/tabs/utils');
var tabs = require("sdk/tabs");
let { Cu } = require('chrome');

function AppMaker(){
	this.sidebars = {};
	this.sidebarManager = require('./sidebarManager.js').sidebarManager;
	//this.searchEngine = require("./searchEngine").getInstance();
}
AppMaker.prototype.createAppMakerUI = function() {
	this.createAppMakerToolbar();
}
AppMaker.prototype.createAppMakerToolbar = function() {

	var frame = new Frame({
	  url: "./frame.html"
	});
	frame.on("message", pong);
	function pong(e) {
		utils.getMostRecentBrowserWindow().alert("this is pong!");
	  if (e.data.type == "ping") {
	    //appMakerToolbarMenu.show();
	    //e.source.postMessage("pong", event.origin);
	    //appMakerToolbarMenu.show();
	  }
	}
	this.appMakerToolbar = require("sdk/ui/toolbar").Toolbar({
		name: "app-maker-toolbar",
	  	title: "App Maker Toolbar",
	  	items: [frame],
	  	hidden: true
	});
}
AppMaker.prototype.showToolbar = function() {

	console.log(this.appMakerToolbar);
	this.appMakerToolbar.hidden = false;
}
AppMaker.prototype.showPageEditor = function(onOpen) {

	var man=this;
	this.pageEditor = tabs.open({
		url: self.data.url("./app-maker-page-editor.html"),
		inBackground: false,
		onReady: onOpen	
	});
}
AppMaker.prototype.createAppMakerSidebar = function(config) {
	//TODO: This should be included in the extension manager, and getWorker instead getInstance
	var man = this;
	this.appMakerMainSidebar = require("sdk/ui/sidebar").Sidebar({ //can't set width
		id: 'woa-app-maker-sidebar',
		title: ' ',
		url: self.data.url("./app-maker-main-sidebar.html"),
		onAttach: function (worker) {
			man.appMakerMainSidebar.isOpen = false;
		},
		onShow: function () {
			man.appMakerMainSidebar.isOpen = true;
		},
		onHide: function () {
			man.appMakerMainSidebar.isOpen = false;
		}
	});
}
AppMaker.prototype.getSidebarId = function(pos){

    var tabId = tabsUtils.getTabId(tabsUtils.getActiveTab(utils.getMostRecentBrowserWindow()));
    return 'tab'+tabId+pos;
}
AppMaker.prototype.loadInfoObjectsSidebar = function(infoObjects){

	var man = this;
	var InfoObjectWidget = require('./appMakerWidgets.js').getIOClass();
	this.infoObjectsSidebar = this.loadWoaSidebar(
		self.data.url('app-maker-io-sidebar.html'),
		'right',
		300,
		{ 
			"DOMContentLoaded": function(evt){ 

				var document = evt.target;
				var list = document.getElementById("info-objects-list");
				//Add the thumbnails of the widgets 
				for (var i = infoObjects.length - 1; i >= 0; i--) {
					var ioWidget = new InfoObjectWidget(infoObjects[i]);
					list.appendChild(ioWidget.getThumbnail(document));
				}
			} 
		}
	);
}
AppMaker.prototype.loadInfoObject = function(concepts, document){

    var list = document.getElementById('info-objects-list');
    
    for (var i = 0; i < concepts.length; i++) {
        if(concepts[i] && concepts[i].imageSrc && concepts[i].name){

            var thumb = this.createIOThumbnail({
                imageSrc: concepts[i].imageSrc,
                name: concepts[i].name,
                id: concepts[i].id
            }, document);
            list.appendChild(thumb);
        }
    };
}
AppMaker.prototype.getWidgetsFromFile = function(){

}
AppMaker.prototype.loadWidgetsSidebar = function(){

	var widgets = require('./appMakerWidgets.js').getInstances();

	var man = this;
	this.widgetsSidebar = this.loadWoaSidebar(
		self.data.url('app-maker-main-sidebar.html'),
		'left',
		300,
		{ 
			"DOMContentLoaded": function(evt){ 
				var document = evt.target;
				var list = document.getElementById("widgets-list");
				//Add the thumbnails of the widgets 
				for (var i = widgets.length - 1; i >= 0; i--) {
					list.appendChild(widgets[i].getThumbnail(document));
				}
			} 
		}
	);
}
AppMaker.prototype.loadWoaSidebar = function(url, where, size, listeners){

    let sidebarId = this.getSidebarId(where);

    if(this.sidebars[sidebarId]){
    	if(this.sidebars[sidebarId][1].clientHeight == 0)
    		delete this.sidebars[sidebarId];
    	else return;
    }

    this.sidebars[sidebarId] = this.sidebarManager.createInterfacePanelIframe({
    	position: where,
        url:url,
        byWindow:false,
        width:size,
        useBrowser: true
    });

	for (var prop in listeners) {
		this.sidebars[sidebarId][1].addEventListener(prop, listeners[prop], true);
	}

	return this.sidebars[sidebarId][1];
}
AppMaker.prototype.enableAppMaker = function(infoObjects) {

	this.showToolbar();
	var man = this;
	this.showPageEditor(function onOpen(tab){
		man.loadInfoObjectsSidebar(infoObjects);
		man.loadWidgetsSidebar();
	});
}
AppMaker.prototype.disableAppMaker = function() {

	this.appMakerMainSidebar.hide();
} 

exports.getInstance = function() {
    return new AppMaker();
}
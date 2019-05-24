function SidebarManager(){}
SidebarManager.prototype.createInterfacePanelIframe = function(options){

    let doc = require('sdk/window/utils').getMostRecentBrowserWindow().document;
    
    var browser = this.createBrowser(doc, options.url, options.position);
    var vBox = this.createSidebarVBox(options.position, doc, options.width);
    var splitter = this.createSidebarSplitter(doc, options);
    var sidebarheader = this.createSidebarHeader(options.position, doc, [browser, splitter, vBox]);
    vBox.appendChild(sidebarheader);
    vBox.appendChild(browser);

    this.insertSidebarInTheBrowserUI(vBox, splitter, options.position);

    browser.style.height = (vBox.clientHeight - sidebarheader.clientHeight - 7)+"px";

    return [splitter, browser];
}
SidebarManager.prototype.createBrowser = function(doc, url, pos){

	let browserElem;
	    browserElem = doc.createElement('browser');
	    browserElem.id = "woa-"+pos+"-browser";
	    browserElem.setAttribute('src', url);
	    browserElem.setAttribute("autocompleteenabled", true);
	    browserElem.setAttribute("autocompletepopup", "PopupAutoComplete");
	    browserElem.setAttribute("disablehistory",true);
	    browserElem.setAttribute('type', 'content');
	return browserElem;
}
SidebarManager.prototype.createSidebarSplitter = function(doc, options){

	let splitter = doc.createElement('splitter');
    	splitter.id =  "woa-"+options.position+'-splitter';
    	splitter.setAttribute("class","chromeclass-extrachrome sidebar-splitter");
    return splitter;
}
SidebarManager.prototype.createSidebarVBox = function(pos, doc, width){

	var vbox = doc.createElement('vbox');
   		vbox.setAttribute("id", "woa-"+pos+"-vbox");
   		vbox.setAttribute("class","chromeclass-extrachrome");
		vbox.setAttribute("width","306");
		vbox.setAttribute("id","sidebar-box");
		vbox.setAttribute("width", width);

		return vbox;
}
SidebarManager.prototype.createSidebarHeader = function(pos, doc, elementsToClose){

	var sidebarheader = doc.createElement('sidebarheader');
   		sidebarheader.setAttribute("id","sidebar-header");
   		sidebarheader.setAttribute("align","center");

   	var labelSH = doc.createElement('label');
   		labelSH.setAttribute("persist","value");
   		labelSH.setAttribute("flex", "1");
   		labelSH.setAttribute("crop", "end"); 
   		labelSH.setAttribute("control", "sidebar");
   		labelSH.setAttribute("value", " ");
   		sidebarheader.appendChild(labelSH);

   	var tButtonSH = doc.createElement('toolbarbutton');
   		tButtonSH.setAttribute("class", "close-icon tabbable");
   		tButtonSH.setAttribute("sidebar-position", pos);
   		tButtonSH.onclick = function(evt){
   			
   			if(elementsToClose){ 
	            elementsToClose.forEach(
	            	el => {
	            		el.remove();
	        	}); 
	        }
	        delete elementsToClose;
   		}
   		sidebarheader.appendChild(tButtonSH);

   	return sidebarheader;
}
SidebarManager.prototype.insertSidebarInTheBrowserUI = function(objectEl, splitter, position) {
    
    let gBrowser = require('sdk/window/utils').getMostRecentBrowserWindow().gBrowser;
    let notificationBox = gBrowser.getNotificationBox( gBrowser.getBrowserForTab( gBrowser.selectedTab ) );
    let doc = gBrowser.ownerDocument;
    let docFrag = doc.createDocumentFragment();

    let theChild = notificationBox.firstChild;
    while (!theChild.hasAttribute('class')
        || (theChild.getAttribute('class').indexOf('browserSidebarContainer') === -1)
    ) {
        theChild = theChild.nextSibling;
    }
    
    if(position == 'right'){
        docFrag.appendChild(splitter);
        docFrag.appendChild(objectEl);
        theChild.appendChild(docFrag);
    }else {
        docFrag.appendChild(objectEl);
        docFrag.appendChild(splitter);
        theChild.insertBefore(docFrag,theChild.firstChild);
    }
}

exports.sidebarManager = new SidebarManager();
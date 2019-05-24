function WebPageManager(locale) {
	this.initPorts();
}
WebPageManager.prototype.initPorts = function () {

	var man = this;
	self.port.on("enableSelection", function() { man.enableSelection();});
	self.port.on("disableSelection", function() { man.disableSelection();});
	self.port.on("highlightInDom", function(t) { man.highlightInDom(t);});

	self.port.on("alertX", function(val) { alert('X: ' + val);}); //JUST DEMO
	self.port.on("console", function(val) { console.log('X: ' + val);}); //JUST DEMO
};
WebPageManager.prototype.disableDomSelection = function() {

	var target = $("body *");
	target.unbind("click.conceptSelection");
	target.unbind("mouseover.highlight");
	target.unbind("mouseout.unhighlight");
}
WebPageManager.prototype.highlightInDom = function(xpath) {

	var elems = document.getElementsByClassName('woa-highlighted-element');
	$(elems).removeClass('woa-highlighted-element');
	elems = new XPathInterpreter().getElementsByXpath(xpath, document);
	if(elems) $(elems).addClass('woa-highlighted-element');
}
WebPageManager.prototype.enableSelection = function() {
	
	var target = $("body *:visible"), man = this; 
		target.bind("mouseover.highlight", function (evt) {
			evt.stopImmediatePropagation(); evt.preventDefault();
			$(this).addClass('woa-highlighted-element');
		});
		target.bind("mouseout.unhighlight", function(evt) {
			evt.stopImmediatePropagation(); evt.preventDefault();
			$(this).removeClass('woa-highlighted-element');
		});
		target.on("contextmenu.selected", function(evt) {
			evt.stopImmediatePropagation(); 
			man.disableSelection();
		});
}
WebPageManager.prototype.disableSelection = function() {

	var target = $("body *:visible");
		target.removeClass('woa-highlighted-element');
		target.unbind("mouseover.highlight");
		target.unbind("mouseout.unhighlight");
}
window.domManager = new WebPageManager();





























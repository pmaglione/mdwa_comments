self.port.on("searchNewInstances", function(data){

	//console.log('Searching for: ' + data.keywords);
	var inp = document.evaluate(data.entry, document, null, 9, null).singleNodeValue;
		inp.value = data.keywords;
	var trg = document.evaluate(data.trigger, document, null, 9, null).singleNodeValue;
	if(trg) trg.click();
});
self.port.on("clickElement", function(data){

	var trg = document.evaluate(data.id, document, null, 9, null).singleNodeValue;
	if(trg) trg.click();
});
// We can not use window this way from this context. E.g.
// window.addEventListener("DOMContentLoaded", searching, false);
self.port.emit("externalPageIsLoaded", {
	url: document.URL, 
	textContent: (new XMLSerializer()).serializeToString(document) //document.body.textContent
});
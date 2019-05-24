/*
	IMPORTANT NOTE: this classes are similar to the ones at the beginning of the seacr engine file. 
	They should be normalized, I agree, we are using even different properties names, but
	if there is just one line using privileged access, every function of the object will be discarded
	when cloned into another context. That's the main reason for having both classes.  
*/
function MaterializableTemplate(data, content){

	this.loadBaseData = function(templateData){
		for (var prop in templateData) {
		    this[prop] = templateData[prop];
		}
		if(content && this["id"] == undefined || this["id"] == "")
			this["id"] = (content.wrappedJSObject)? content.wrappedJSObject.Date.now(): content.Date.now();
	}
	this.loadBaseData(data);
	var me = this;
	this.getId = function() { return me.id; };
	this.getValue = function() { return me.value; };
	this.getName = function() { return me.name; };
	this.getTag = function() { return me.tag; };
	this.getUrl = function() { return me.url; };
	this.getXpath = function() { return me.xpath; };
	this.getPath = function() { return me.xpath; };
	this.getClassName = function() { return undefined; };
	this.getServiceUrl = function() { return me.service_url; };
}
function InstanceObjectTemplate(data, content){

	MaterializableTemplate.call(this, data, content);
	this.properties = [];
	var me = this;
	this.addProperty = function(templateData){
		//HERE
		var iop = new IOPropertyTemplate(templateData, content);
		me.properties.push(iop);
	};
	this.getProperties = function(){
		return me.properties;
	};
	this.getPropertyByName = function(key) {

		if(me.getProperties().length == 0) return;

		for (var i = 0; i < me.properties.length; i++) {
			if(me.properties[i].name == key){
				return me.properties[i];	
			}
		}
	};
	this.getPropertyByTemplateId = function(key) {
		if(me.properties.length == 0) return;
		for (var i = 0; i < me.properties.length; i++) {
			//console.log(me.properties[i].id +"=="+ key);
			if(me.properties[i].id == key){
				return me.properties[i];
			}
		}
	};
}
function IOPropertyTemplate(data, content){
	MaterializableTemplate.call(this, data, content);
}

exports.getClasses = function() {
    return { InstanceObjectTemplate, IOPropertyTemplate };
}
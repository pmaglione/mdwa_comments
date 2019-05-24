/*
 * Clase principal de entrada
 */
function XPathInterpreter() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
    this.currentElement;
    this.xPaths;
    this.engine = [new BasicIdEngine(), new IdTreeXPathEngine(), 
    new FullXPathEngine(), new ClassXPathEngine() ];
    //, new CssPathEngine()

}
// setear un unico engine de busqueda de xpath
XPathInterpreter.prototype.setEngine = function(engine) {
    this.engine = engine;
    //this.engines = new array(engine);
};

// agregar un engine de busqueda de xpath a los existentes
XPathInterpreter.prototype.addEngine = function(engine) {
    this.engines.add(engine);
};

// borrar un engine de busqueda de xpaths
XPathInterpreter.prototype.removeEngine = function(engine) {
    if (this.engines.inlude(engine)){
        this.engines.remove(this.engines.indexOf(engine));
    }
};

// borrar todos los engine de busqueda de xpaths
XPathInterpreter.prototype.removeEngines = function() {
    this.engines = new array();
};

// obtener un array de xPaths correspondiente a los engines seteados
XPathInterpreter.prototype.getMultipleXPaths = function(element, parent, removeBase) {
    var xPathArray = [];
    if(element == undefined)
        return;
    if(parent == undefined)
        parent = element.parentNode;

    var console = element.ownerDocument.defaultView.console; //.log("********************************", element, parent);
    for (var i = 0; i < this.engine.length; i++) {
        try{
            var path = this.engine[i].getPath(element, parent);
            if (path !== undefined && path !== null && path.length && path.length > 0){

                for (var j = 0; j < path.length; j++) {
                    
                    if(removeBase && path[j] != null && path[j].indexOf('.//')>-1)
                        path[j] = path[j].slice(3,path[j].length);

                    xPathArray.push(path[j]);
                    if(!removeBase)
                        xPathArray.push(path[j].slice(0,path[j].lastIndexOf("[")));
                } 
            }
        }catch(err){ 
            element.ownerDocument.defaultView.console.log(err);
        }
    };
    //console.log(xPathArray);
    return xPathArray;
};

// obtiene un xpath unico
XPathInterpreter.prototype.getPath = function(element, parent) {
    return this.engine.getPath(element, parent);
    // return xPathArray;    
};

// obtiene el mejor Path
XPathInterpreter.prototype.getBetterPath = function(element) {
    var xPaths = this.getMultipleXPaths(element); 
    //console.info(xPaths);
    return xPaths[0];        
};
XPathInterpreter.prototype.getElementByXPath = function(xpath, doc){

    return  doc.evaluate( xpath, doc, null, 
        9, null).singleNodeValue; // 9 = FIRST_ORDERED_NODE_TYPE
}
XPathInterpreter.prototype.getElementsByXpath = function(xpath, node) {
    
    var doc = (node && node.ownerDocument)? node.ownerDocument : node;

    //TODO: ERROR ACÁ EN ALGUNOS SITIOS AL HACER  HARVESTING DE LAS PROPS, EJ: DBLP
    //node.ownerDocument.defaultView.console.log(doc, xpath, node);
    var results = doc.evaluate( xpath, doc, null, 4, null ); //4 = UNORDERED_NODE_ITERATOR_TYPE

    var nodes = [], res = results.iterateNext(), i=0;
    while (res) {
        nodes.push(res);
        res = results.iterateNext();
    }
    return nodes;
};


/* 
 * Clase strategy
 */
function XPathSelectorEngine() {
//    if ( arguments.callee.instance )    //Singleton pattern
//        return arguments.callee.instance;
//    arguments.callee.instance = this;
}

// Funcion para obtener elementos a partir de una expresion
// antiguo evaluateXpath
// recibe un nodo base o utiliza el documento
// una expresion Xpath
XPathSelectorEngine.prototype.getElement = function(aNode, aExpr) {
   
    var xpe = new aNode.defaultView.XPathEvaluator();
    var nsResolver = xpe.createNSResolver(aNode.ownerDocument === null ?
        aNode.documentElement : aNode.ownerDocument.documentElement);
    var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
    var found = [];
    var res;
    while (res = result.iterateNext())
        found.push(res);
    return found;
};


/* 
 * Estrategia por ID directo
 * Si no lo encuentra devuelve null
 */
function BasicIdEngine() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

BasicIdEngine.prototype = new XPathSelectorEngine();
BasicIdEngine.prototype.constructor = BasicIdEngine;

BasicIdEngine.prototype.getPath = function(element, parent){
    if (element && element.id){
        return ['.//'+ element.nodeName.toLowerCase() +'[@id="' + element.id + '"]']; 
    }else{
        return; 
    }
};

/* 
 * Función que obtiene un Xpath según su RelativePath.
 * Busca para arriba desde el padre un ID y a partir de ahi un path relativo.
 */
function IdTreeXPathEngine() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

IdTreeXPathEngine.prototype = new XPathSelectorEngine();
IdTreeXPathEngine.prototype.constructor = IdTreeXPathEngine;

IdTreeXPathEngine.prototype.getPath = function(element, parent){

    if(element == undefined)
        return null;
    var oldElem = element;
    var oldTag = oldElem.nodeName.toLowerCase();
    //element = element.parentNode;
    var paths = [];
    var parentNode = parent || element.ownerDocument;
    //paths.splice(0, 0, oldTag);
    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    var siblingId = false;    
    for (; element && element.nodeType == 1 && element.innerHTML != parentNode.innerHTML; element = element.parentNode) {
        var index = 1;
        if (element.id){
            siblingId = true;
        }
        else {
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
            // Ignore document type declaration.
            if (sibling.nodeType == 10){ //element.ownerDocument.defaultView.Node.DOCUMENT_TYPE_NODE
                continue;
            }

            if (sibling.nodeName == element.nodeName){
                index++;
            }
        }
        }
        
        var tagName = element.nodeName.toLowerCase();
        var pathIndex;
        if (!siblingId){
            pathIndex = (index ? "[" + (index) + "]" : ""); 
            paths.splice(0, 0, tagName + pathIndex);            
        }else{
            var result = this.getElementIdXPath(element) + (paths.length ? "/" + paths.join("/") : "");
            var oldElem2 = (new BasicIdEngine()).getPath(oldElem);
            if (oldElem2 && oldElem2.length && oldElem2.length > 0 && result == oldElem2[0]){
                return null;
            }
            else return [result];
        }        
    }
    var result =  paths.length ? ".//" + paths.join("/") : null;
    var oldElem2 = (new BasicIdEngine()).getPath(oldElem);
    if (oldElem2 && oldElem2.length && oldElem2.length > 0 && result == oldElem2[0]){
        return;
    }
    else return [result];
};
IdTreeXPathEngine.prototype.getElementIdXPath = function(element){
    if (element && element.id){
        return './/'+ element.nodeName.toLowerCase() +'[@id="' + element.id + '"]'; 
    }else{
        return null; //Siempre que no encontremos el Xpath devolvamos null.
    }
};


/* 
 * Función que obtiene un Xpath en relación a todos los elementos con la misma clase.
 */
function ClassXPathEngine() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

ClassXPathEngine.prototype = new XPathSelectorEngine();
ClassXPathEngine.prototype.constructor = ClassXPathEngine;

ClassXPathEngine.prototype.getPath = function(element, parent){
    if (!element) return;
    var elemClass = element.className;
    if (!elemClass) return;
    var tagName = element.nodeName.toLowerCase();
    
    // ESTO ES LO QUE DETERMINA COMO SERA EL XPATH -> VER VARIANTES
    //var elemPath = "//"+tagName+"[@class='"+elemClass+"']";
    var xpaths = [], elemClasses = elemClass.split(/[ ]+/);

    for (var i = 0; i < elemClasses.length; i++) {

        var elemPath = ".//"+tagName+"[contains(@class, '"+ elemClasses[i] +"')]";
        var res = this.getElement(element.ownerDocument, elemPath);
        for (var e in res){
            if (res[e]==element){
                xpaths.push(elemPath);
                break;
            }
        }
    }
    return (xpaths.length && xpaths.length > 0)? xpaths:undefined;
};


/* 
 * Estrategia xpath absoluto o full.
 * Funciona como el de firebug
 */
function FullXPathEngine() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

FullXPathEngine.prototype = new XPathSelectorEngine();
FullXPathEngine.prototype.constructor = FullXPathEngine;

//Función que obtiene un Xpath según su FullPath de árbol DOM. 
FullXPathEngine.prototype.getPath = function(element, parent) {

    if(element == undefined)
        return null;
    var paths = [];
    var parentNode = parent || element.ownerDocument;
    // Arma el path hasta llegar al parent node, que puede ser el parametro o "document"
    for (; element && element.nodeType == 1 && element.innerHTML != parentNode.innerHTML; element = element.parentNode) {
        var index = 1;
        // aumenta el indice para comparar con los hermanos superiores del elemento actual (del mismo tipo)
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
            if (sibling.nodeType == 10) //element.ownerDocument.defaultView.Node.DOCUMENT_TYPE_NODE
                continue;
            if (sibling.nodeName == element.nodeName)
                index++;
        }

        var tagName = element.nodeName.toLowerCase();
        var pathIndex = "[" + (index) + "]";
        paths.splice(0, 0, tagName + pathIndex);
    }
    if(paths.length)
        return [".//" + paths.join("/")];
    else return;
};

/* 
 * Estrategia CSS path (Se traduce con jquery, $('csspath')
 */
function CssPathEngine() {
    if ( arguments.callee.instance )    //Singleton pattern
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

CssPathEngine.prototype = new XPathSelectorEngine();
CssPathEngine.prototype.constructor = CssPathEngine;

//Función que obtiene un Xpath según su FullPath de árbol DOM. 
CssPathEngine.prototype.getPath = function(element, parent){
    var paths = [];

    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var selector = this.getElementCSSSelector(element);
        paths.splice(0, 0, selector);
    }

    if(paths.length)
        return paths.join(" ");
    else return;
};

//Funcion utilizada para obtener el selector de cada elemento
CssPathEngine.prototype.getElementCSSSelector = function(element){
    if (!element || !element.localName)
        return null;

    var label = element.localName.toLowerCase();
    if (element.id)
    label += "#" + element.id;

    if (element.classList && element.classList.length > 0)
    label += "." + element.classList.item(0);

    return label;
};


//Sobre escribo la funcion del padre, porque esto no es un xpath!
CssPathEngine.prototype.getElement = function(aNode, aExpr) {    
    if (aNode){
        return aNode.querySelector(aExpr);
    }else{
        return document.querySelector(aExpr);
    }

};

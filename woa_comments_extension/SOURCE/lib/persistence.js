/*
    Clase que maneja el almacenamiento de los conceptos creados
    https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-storage
	Se debe almacenar en: this.storage.model

    See https://developer.mozilla.org/en-US/docs/Storage
    https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

    let { Services } = require("resource/gre/modules/Services.jsm");   
    don't use require('chrome'), it is discouraged and on a deprecation path

*/
var { InstanceObjectTemplate, IOPropertyTemplate } = require("./templates").getClasses();
var Cu = require("chrome").Cu;
    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/FileUtils.jsm");

function Persistence() {
    /*if ( arguments.callee.instance )
        return arguments.callee.instance;
    arguments.callee.instance = this;*/
    let file = FileUtils.getFile("ProfD", ["jetpack", "woa@lifia.info.unlp.edu.ar", "woa.sqlite"]);
    this.file = file;
    this.initDatabase = function() {
        // Opens woa_db.sqlite in the profile directory. It creates the file if it does not exist
        let dbConn = this.openDatabase();
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'Materializable' ( \
                'id'    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                'name'  TEXT NOT NULL, \
                'tag'   TEXT NOT NULL, \
                'dbp'   TEXT NOT NULL, \
                'xpath' TEXT NOT NULL, \
                'selected'  TEXT, \
                'url'   TEXT NOT NULL, \
                'imageSrc'  INTEGER NOT NULL \
            );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'CTemplate' ( 'id' INTEGER NOT NULL PRIMARY KEY );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'PTemplate' ( 'id' INTEGER NOT NULL PRIMARY KEY );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'CTemplateToPTemplate' ( \
                'ownerId'   INTEGER NOT NULL, \
                'leafId'    INTEGER NOT NULL, \
                PRIMARY KEY(ownerId,leafId) \
            );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'Decorator' ( \
                'id'    INTEGER NOT NULL, \
                'classname' TEXT NOT NULL DEFAULT 'GenericDecorator', \
                PRIMARY KEY(id) \
            );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'SearchEngine' ( \
                'id'    INTEGER NOT NULL, \
                'entry' TEXT, \
                'trigger' TEXT, \
                'next' TEXT, \
                'prev' TEXT, \
                PRIMARY KEY(id) \
            );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'DecoratorMessage' ( \
                'decoratorId'    INTEGER NOT NULL, \
                'messageKey'  TEXT NOT NULL, \
                PRIMARY KEY(decoratorId,messageKey) \
            );");
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'DecoratorPTemplate' ( \
                'id'    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                'nameInDecorator'  TEXT NOT NULL, \
                'nameInCTemplate'  TEXT NOT NULL \
            );");    
            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS 'DecoratorParamMapping' ( \
                'decoratorId'   INTEGER NOT NULL, \
                'paramId'   TEXT NOT NULL, \
                'propId'  TEXT NOT NULL, \
                PRIMARY KEY(decoratorId,paramId,propId) \
            );");
            
        dbConn.asyncClose();
    };
    this.openDatabase = function() {

        return Services.storage.openDatabase(this.file);
    };
    // +++++++++++++++++++++++++++++++++++++++++
    // +++++++++++ MATERIALIZABLE ++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++
    this.createMaterializable = function(data){

        console.log(data);
        var dbConn = this.openDatabase();
            var statement = dbConn.createStatement("INSERT INTO 'Materializable'  \
                ('name', 'tag', 'dbp', 'xpath', 'selected', 'url', 'imageSrc')  \
                VALUES (:name, :tag, :dbp, :xpath, :selected, :url, :imageSrc )");
                statement.params.name = data.name;
                statement.params.tag = data.tag;
                statement.params.dbp = data.dbp;
                statement.params.xpath = data.xpath;
                statement.params.selected = data.selected;
                statement.params.url = data.url;
                statement.params.imageSrc = data.imageSrc;
                //statement.params.computedStyle = data.computedStyle;
            statement.step();
            statement.reset();
        dbConn.close();
    };
    this.getLastCreatedMaterializable = function(jsonData){

        //GET THE MATERIALIZABLE ID
        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("SELECT MAX(id) AS id FROM 'Materializable'");
            statement.step(); 
            var id = statement.row.id;
            statement.reset();
        dbConn.close();
        return id;
    };
    this.removeMaterializable = function(id, dbConn){

        var requiresNewCnx = (dbConn)? false: true;        
        if(requiresNewCnx) dbConn = this.openDatabase();

        var statement = dbConn.createStatement("DELETE FROM 'Materializable' WHERE id = :id");
            statement.params.id = id;
            statement.step(); 
            statement.reset();

        if(requiresNewCnx) dbConn.close();
    }
    // +++++++++++++++++++++++++++++++++++++++++
    // ++++++++++ CONCEPT TEMPLATES ++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++
    this.createCTemplate = function(jsonData){
        this.createMaterializable(JSON.parse(jsonData));
        var id = this.getLastCreatedMaterializable();

        //FINALLY, INSERT CONCEPT
        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("INSERT INTO 'CTemplate' ('id')  VALUES (:id);");
            statement.params.id = id;
            statement.step(); 
            statement.reset();

        statement = dbConn.createStatement("INSERT INTO 'Decorator' ('id')  VALUES (:id);");
            statement.params.id = id;
            statement.step(); 
            statement.reset();
        dbConn.close();

        return id;
    };
    this.getCTemplateById = function(id, dbConn){

        var requiresNewCnx = (dbConn)? false: true;        
        if(requiresNewCnx) {
            dbConn = this.openDatabase();
        }

        var statement = dbConn.createStatement("SELECT * FROM 'Materializable' WHERE id = :id");
            statement.params.id = id;

        statement.step();
        res = new InstanceObjectTemplate({
            id: statement.row.id,
            name: statement.row.name,
            tag: statement.row.tag,
            dbp: statement.row.dbp,
            xpath: statement.row.xpath,
            selected: statement.row.selected,
            url: statement.row.url,
            imageSrc: statement.row.imageSrc
        });

        statement.reset();
        if(requiresNewCnx) dbConn.close();
        return res;
    };
    this.getFullConceptTemplateData = function(id){
        var template = this.getCTemplateById(id);
        return {
            concept: template,
            properties: this.getPTemplatesByCTemplateId(id),
            decorator: this.getDecoratorByCTemplateId(template.getId()).classname
        };
    };
    this.getCTemplates = function(){
      
        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("SELECT Materializable.* FROM Materializable \
            INNER JOIN CTemplate \
            ON Materializable.id=CTemplate.id;");
        var res = [];

        while (statement.step()) {
            res.push(new InstanceObjectTemplate({
                id: statement.row.id,
                name: statement.row.name,
                tag: statement.row.tag,
                dbp: statement.row.dbp, 
                xpath: statement.row.xpath,
                selected: statement.row.selected,
                url: statement.row.url,
                imageSrc: statement.row.imageSrc
            }));
        }
        statement.reset();
        dbConn.close();
        return res;
    }
    this.getFullCtemplateData = function(){

        var templates = this.getCTemplates();
        for (var i = templates.length - 1; i >= 0; i--) {
            templates[i].classname = this.getDecoratorByCTemplateId(templates[i].getId()).classname;
        }
        return templates;
    }
    this.updateCTemplate = function(concept){
        
        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("UPDATE Materializable \
            SET name=:name, tag=:tag, dbp=:dbp, xpath=:xpath, selected=:selected, url=:url, imageSrc=:imageSrc \
            WHERE id = :id");
            statement.params.id = concept.id;
            statement.params.name = concept.name;
            statement.params.tag = concept.tag;
            statement.params.dbp = concept.dbp;
            statement.params.xpath = concept.xpath;
            statement.params.selected = concept.selected;
            statement.params.url = concept.url;
            statement.params.imageSrc = concept.imageSrc;

        statement.step();
        statement.reset();
        dbConn.close();
    };
    this.removeCTemplate = function(id, dbConn){

        var requiresNewCnx = (dbConn)? false: true;        
        if(requiresNewCnx) dbConn = this.openDatabase();

        var statement = dbConn.createStatement("DELETE FROM 'CTemplate' WHERE id = :id");
            statement.params.id = id;
            statement.step(); 
            statement.reset();
        
        if(requiresNewCnx) dbConn.close();
    }
    this.removeFullConceptTemplate = function(id){
        //PUBLIC - Removes the template and all the related data to it (props, decos, bindings, etc) 
        
        var dbConn = this.openDatabase();
        
        //Delete the template stuff
        this.removeMaterializable(id, dbConn);
        this.removeCTemplate(id, dbConn);

        //Delete the related property-templates
        this.removeRelatedPropertyTemplates(id, dbConn);
    
        //Delete the Decorator
        this.removeDecorator(id, dbConn);
        this.removeDecoratorMessages(id, dbConn);
        this.removeDecoratorMappings(id, dbConn);

        dbConn.close();
    };

    // +++++++++++++++++++++++++++++++++++++++++
    // +++++++++ PROPERTY TEMPLATES ++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++

    this.createPTemplate = function(ownerId, jsonData){

        this.createMaterializable(JSON.parse(jsonData));
        var leafId = this.getLastCreatedMaterializable();

        //FINALLY, INSERT PROPERTY AND LINK TO THE OWNER
        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("INSERT INTO 'PTemplate' ('id')  VALUES (:id)");
            statement.params.id = leafId;
            statement.step(); 
            statement.reset();

            statement = dbConn.createStatement("INSERT INTO 'CTemplateToPTemplate' ('ownerId', 'leafId')  VALUES (:ownerId, :leafId)");
            statement.params.ownerId = ownerId;
            statement.params.leafId = leafId;
            statement.step(); 
            statement.reset();
              
        dbConn.close();
    }
    this.removePTemplate = function(propId){
        var dbConn = this.openDatabase();
        // It is required to have one execution by statement!   
            // Materializable
        var statement = dbConn.createStatement("DELETE FROM 'Materializable' WHERE id = :id");
            statement.params.id = propId;
            statement.step(); 
            statement.reset();

            //Property template
            statement = dbConn.createStatement("DELETE FROM 'PTemplate' WHERE id = :id");
            statement.params.id = propId;
            statement.step(); 
            statement.reset();

            //Concept template matching register
            statement = dbConn.createStatement("DELETE FROM 'CTemplateToPTemplate' WHERE propId = :id");
            statement.params.id = propId;
            statement.step(); 
            statement.reset();
        dbConn.close();  
    };
    this.updatePTemplate = function(prop){

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("UPDATE Materializable \
            SET name=:name, tag=:tag, dbp=:dbp, xpath=:xpath, selected=:selected, url=:url, imageSrc=:imageSrc \
            WHERE id = :id");
            statement.params.id = prop.id;
            statement.params.name = prop.name;
            statement.params.tag = prop.tag;
            statement.params.dbp = prop.dbp;
            statement.params.xpath = prop.xpath;
            statement.params.selected = prop.selected;
            statement.params.url = prop.url;
            statement.params.imageSrc = prop.imageSrc;

        statement.step();
        statement.reset();
        dbConn.close();  
    };
    this.removeRelatedPropertyTemplates = function(id, dbConn){ //USED
        // Removes all the property-templates associated to a concept-template
        // TODO: modularize

        var requiresNewCnx = (dbConn)? false: true;           
        if(requiresNewCnx) dbConn = this.openDatabase();

        //Select all the properties IDs 
        var statement = dbConn.createStatement("SELECT leafId FROM 'CTemplateToPTemplate' WHERE ownerId = :id ");
            statement.params.id = id;
        var propTemplatesIds = [];
        while (statement.step()) { propTemplatesIds.push(statement.row.leafId); }
        statement.reset();

        //Remove the related property-templates bindings
        statement = dbConn.createStatement("DELETE FROM 'CTemplateToPTemplate' WHERE ownerId = :id");
        statement.params.id = id;
        statement.step(); 
        statement.reset();

        //Delete the related property-templates
        for (var i = 0; i < propTemplatesIds.length; i++) {
            statement = dbConn.createStatement("DELETE FROM 'PTemplate' WHERE id = :id");
            statement.params.id = propTemplatesIds[i];
            statement.step(); 
            statement.reset();
            this.removeMaterializable(propTemplatesIds[i], dbConn);
        }
        if(requiresNewCnx) dbConn.close();
    }
    this.getSelectedParamsMatches = function(id){ // ???
        return [];
    }
    this.getPTemplatesNamesByCTemplateId = function(id){

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("SELECT Materializable.name FROM Materializable \
            INNER JOIN PTemplate \
            ON Materializable.id=PTemplate.id \
            INNER JOIN CTemplateToPTemplate \
            ON CTemplateToPTemplate.leafId = PTemplate.id \
            WHERE CTemplateToPTemplate.ownerId = :ownerId ;"); 
            statement.params.ownerId = id;
        var res = [];
        while (statement.step()) { res.push(statement.row.name); }
        statement.reset();
        dbConn.close();
        return res;
    };
    this.getPTemplatesByCTemplateId = function(id, dbConn){
        //PUBLIC - Get all the property-templates data related to a concept-template

        var requiresNewCnx = (dbConn)? false: true;           
        if(requiresNewCnx) dbConn = this.openDatabase();

        var statement = dbConn.createStatement("SELECT Materializable.* FROM Materializable \
            INNER JOIN PTemplate \
            ON Materializable.id=PTemplate.id \
            INNER JOIN CTemplateToPTemplate \
            ON CTemplateToPTemplate.leafId = PTemplate.id \
            WHERE CTemplateToPTemplate.ownerId = :ownerId ;"); 
            statement.params.ownerId = id;

        var res = [];
        while (statement.step()) {
            res.push(new IOPropertyTemplate({
                id: statement.row.id,
                name: statement.row.name,
                tag: statement.row.tag,
                dbp: statement.row.dbp, 
                xpath: statement.row.xpath,
                selected: statement.row.selected,
                url: statement.row.url,
                imageSrc: statement.row.imageSrc
            }));
        }

        statement.reset();
        if(requiresNewCnx) dbConn.close();
        return res;
    };

    // +++++++++++++++++++++++++++++++++++++++++
    // ++++++++++++ DECORATORS +++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++
    this.getDecoratorByCTemplateId = function(id){

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("SELECT * FROM 'Decorator' WHERE id = :id");
            statement.params.id = id;

        statement.step();
        var res = {
            id: statement.row.id,
            classname: statement.row.classname
        };
        statement.reset();
        dbConn.close();
        return res;
    }
    //DECORATOR
    this.saveDecoratorClassname = function(id,classname){

        var exists;
        try{
            var dbConn = this.openDatabase();
            var statement = dbConn.createStatement("SELECT id FROM Decorator WHERE id=:id;");
                statement.params.id = id;
            statement.step();
            exists = (statement.row.id)? statement.row.id : undefined;
            statement.reset();
            dbConn.close();
        }catch(err){
            console.log(err.message);
            exists = false;
        }

        if(exists) this.updateDecoratorClassname(id,classname)
        else this.insertDecorator(id,classname);
    }
    this.insertDecorator = function(id,classname){

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("INSERT INTO Decorator(id, classname) VALUES(:id, :classname)");
            statement.params.id = id;
            statement.params.classname = classname;
        statement.step();
        statement.reset();
        dbConn.close();
    }
    this.updateDecoratorClassname = function(id,classname){ //USED

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("UPDATE Decorator SET classname = :classname WHERE id = :id");
        statement.params.classname = classname;
        statement.params.id = id;
        statement.step();
        statement.reset();

        statement = dbConn.createStatement("DELETE FROM DecoratorMessage WHERE decoratorId = :decoratorId");
        statement.params.decoratorId = id;
        statement.step();

        /*TODO: delete required
        statement = dbConn.createStatement("DELETE FROM DecoratorMessage WHERE decoratorId = :decoratorId");
        statement.params.decoratorId = id;
        statement.step();*/

        statement.reset();
        dbConn.close();
    }
    this.removeDecorator = function(id, dbConn){ //USED

        var requiresNewCnx = (dbConn)? false: true;           
        if(requiresNewCnx) dbConn = this.openDatabase();
        var statement = dbConn.createStatement("DELETE FROM Decorator WHERE id = :id");
        statement.params.id = id;
        statement.step();
        statement.reset();
        if(requiresNewCnx) dbConn.close();
    }
    //MESSAGES
    this.getMessagesByDecoratorId = function(id){
        
        var res = [], statement;
        try{
            var dbConn = this.openDatabase();
            statement = dbConn.createStatement("SELECT messageKey FROM DecoratorMessage WHERE decoratorId = :decoratorId");
            statement.params.decoratorId = id;            
            var res = [];
            while (statement.step()) { res.push(statement.row.messageKey); }
            statement.reset();
            dbConn.close();
        }catch(err){ console.log(err); } 
        return res;
    }
    this.saveDecoratorMessages = function(id,messagesIds){

        var dbConn = this.openDatabase();
        var storedKeys = [];
        var statement = dbConn.createStatement("SELECT messageKey FROM DecoratorMessage WHERE decoratorId=:decoratorId;");
            statement.params.decoratorId = id;

        while (statement.step()) { storedKeys.push(statement.row.messageKey); }
        statement.reset();
        dbConn.close(); 

        //Insert the messages that are not currently stored
        for (var i = 0; i < messagesIds.length; i++) {
            var msgIndex = storedKeys.indexOf(messagesIds[i]);
            if(msgIndex != -1) { //If exists, remove from stored
                storedKeys.splice(msgIndex, 1); 
            }else{ //If it doesn't exist, create it 
                this.insertMessage(id, messagesIds[i]); 
            } //update does not have sense (no more data but the keys)
        };
        //Remove the unselected messages by the user
        this.removeDecoratorMessages(id, storedKeys);  
    }
    this.insertMessage = function(decoratorId, messageKey){

        var dbConn = this.openDatabase();
        statement = dbConn.createStatement("INSERT INTO DecoratorMessage(decoratorId, messageKey) VALUES(:decoratorId, :messageKey);");
        statement.params.decoratorId = decoratorId;
        statement.params.messageKey = messageKey;
        statement.step();
        statement.reset();
        dbConn.close();
    }
    this.removeDecoratorMessages = function(decoratorId, storedKeys){
        var dbConn = this.openDatabase();
        for (var i = 0; i < storedKeys.length; i++) {
            statement = dbConn.createStatement("DELETE FROM DecoratorMessage WHERE decoratorId = :decoratorId AND messageKey = :messageKey;");
            statement.params.decoratorId = decoratorId;
            statement.params.messageKey = storedKeys[i];
            statement.step();
            statement.reset();
        };
        dbConn.close();
    }
    this.removeAllDecoratorMessages = function(id, dbConn){

        var requiresNewCnx = (dbConn)? false: true;           
        if(requiresNewCnx) dbConn = this.openDatabase();
        var statement = dbConn.createStatement("DELETE FROM DecoratorMessage WHERE decoratorId = :id");
        statement.params.id = id;
        statement.step();
        statement.reset();
        if(requiresNewCnx) dbConn.close();
    }

    //MAPPINGS 
    this.getParamMappings = function(decoratorId){
        
        var res = [], statement;
        try{
            var dbConn = this.openDatabase();
            statement = dbConn.createStatement("SELECT DecoratorParamMapping.paramId, Materializable.id, Materializable.name \
                FROM DecoratorParamMapping INNER JOIN Materializable \
                WHERE DecoratorParamMapping.propId = Materializable.id \
                AND DecoratorParamMapping.decoratorId = :decoratorId");
            statement.params.decoratorId = decoratorId;       
            var res = [];
            while (statement.step()) { res.push({
                'id':statement.row.paramId,
                'propId':statement.row.id,
                'propName': statement.row.name
            })}
            statement.reset();
            dbConn.close();
        }catch(err){ console.log(err); } 
        return res;
    }
    this.saveDecoratorMappings = function(id,mappings){ //mappings = {paramId, propertyId}

        var dbConn = this.openDatabase();
        var storedMappings = [];
        var statement = dbConn.createStatement("SELECT * FROM DecoratorParamMapping \
            WHERE decoratorId = :decoratorId");
            statement.params.decoratorId = id;

        while (statement.step()) { storedMappings.push({
            decoratorId: statement.row.decoratorId,
            paramId: statement.row.paramId,
            propId: statement.row.propId
        })}
        statement.reset();
        dbConn.close(); 

        //Insert the messages that are not currently stored
        var toInsert = [];
        for (var i = 0; i < mappings.length; i++) {
            var exists = false;
            for (var j = 0; j < storedMappings.length; j++) {
                if( mappings[i].paramId == storedMappings[j].paramId &&
                    mappings[i].propId == storedMappings[j].propId){
                        exists = true;
                        storedMappings[j].registered = true; 
                        break;
                }
            }
            if(!exists) toInsert.push(mappings[i]);
        };
        this.insertParamMappings(id,toInsert);

        //Remove the unselected messages by the user
        var toDelete = [];
        for (var i = 0; i < storedMappings.length; i++) {
            if(storedMappings[i].registered == false)
                toDelete.push(storedMappings[i]);
        };  
        this.deleteParamMappings(id,toDelete);
    }
    this.insertParamMappings = function(decoratorId, mappings){

        var dbConn = this.openDatabase(), statement;
        for (var i = 0; i < mappings.length; i++) {
            statement = dbConn.createStatement("INSERT INTO DecoratorParamMapping \
                (decoratorId, paramId, propId) VALUES( :decoratorId, :paramId, :propId);");
            statement.params.decoratorId = decoratorId;
            statement.params.paramId = mappings[i].paramId;
            statement.params.propId = mappings[i].propId;
            statement.step();
            statement.reset();
        }
        dbConn.close();
    }
    this.deleteParamMappings = function(decoratorId, mappings){

        var dbConn = this.openDatabase(), statement;
        for (var i = 0; i < mappings.length; i++) {
            statement = dbConn.createStatement("DELETE FROM DecoratorParamMapping WHERE \
                decoratorId = :decoratorId AND paramId = :paramId AND propId = :propId");
            statement.params.decoratorId = mappings[i].decoratorId;
            statement.params.paramId = mappings[i].paramId;
            statement.params.propId = mappings[i].propId;
            statement.step();
            statement.reset();
        }
        dbConn.close();
    }
    this.removeDecoratorMappings = function(id, dbConn){ //USED

        var requiresNewCnx = (dbConn)? false: true;           
        if(requiresNewCnx) dbConn = this.openDatabase();
        var statement = dbConn.createStatement("DELETE FROM DecoratorParamMapping WHERE decoratorId = :id");
        statement.params.id = id;
        statement.step();
        statement.reset();
        if(requiresNewCnx) dbConn.close();
    }
    //SEARCH ENGINE
    this.getSearchEngineData = function(id){
        try{
            var dbConn = this.openDatabase();
            var statement = dbConn.createStatement("SELECT * FROM SearchEngine WHERE id = :id");
                statement.params.id = id;
                statement.step();
            var data = {
                id: statement.row.id,
                entry: statement.row.entry,
                trigger: statement.row.trigger,
                next: statement.row.next,
                prev: statement.row.prev
            };
            statement.reset();
            dbConn.close();
            return data;

        }catch(err){
            return;
        }
    }
    this.saveSearchEngineData = function(data){
        var exists;
        try{
            var dbConn = this.openDatabase();
            var statement = dbConn.createStatement("SELECT * FROM SearchEngine WHERE id = " + data.id);
                statement.step();
            exists = (statement.row && statement.row.id)? statement.row.id : undefined; //Esto es medio al pedo,porque si no encuentra una row, tira error
            statement.reset();
            dbConn.close();
        }catch(err){
            exists = false;
        }

        if(exists) this.updateSearchEngine(data)
        else this.insertSearchEngine(data);
    }
    this.insertSearchEngine = function(data){

        var dbConn = this.openDatabase();
        var statement = dbConn.createStatement("INSERT INTO SearchEngine(id, entry, trigger, next, prev) \
            VALUES(:id, :entry, :trigger, :next, :prev)");
            statement.params.id = data.id;
            statement.params.entry = data.entry;
            statement.params.trigger = data.trigger;
            statement.params.next = data.next;
            statement.params.prev = data.prev;
        statement.step();
        statement.reset();
        dbConn.close();
    }
    this.updateSearchEngine = function(data){ 
        try{
            var dbConn = this.openDatabase();
            var statement = dbConn.createStatement("UPDATE SearchEngine SET entry=:entry, trigger=:trigger, next=:next, prev=:prev WHERE id = :id"); //, trigger = :trigger, next = :next, prev = :prev
            statement.params.entry = data.entry;
            statement.params.trigger = data.trigger;
            statement.params.next = data.next;
            statement.params.prev = data.prev;
            statement.params.id = data.id;
            statement.step();
            statement.reset();
            dbConn.close();
        }catch(err){
            console.log(err);
        }
    }
    this.initDatabase();
}

exports.getInstance = function(s) {
    return new Persistence(s);
}
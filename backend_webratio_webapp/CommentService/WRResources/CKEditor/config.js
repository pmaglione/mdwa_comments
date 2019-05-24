/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	
	//config.skin = 'kama';

	/* Toolbar definitions */
	config.toolbar_WebRatioDefault = [
		['Bold','Italic','-','NumberedList','BulletedList','-','Link','Unlink','-','About']
	];
	config.toolbar_Basic = config.toolbar_WebRatioDefault;
	config.toolbar_Full = [
		['Source','-','Save','NewPage','Preview','-','Templates'],
		['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
		['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
		'/',
		['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
		['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
		['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		['BidiLtr', 'BidiRtl' ],
		['Link','Unlink','Anchor'],
		['Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','Iframe'],
		'/',
		['Styles','Format','Font','FontSize'],
		['TextColor','BGColor'],
		['Maximize', 'ShowBlocks','-','About']
	];
	config.toolbar_Default = config.toolbar_Full;
	
	/* File Manager configuration */
	config.filebrowserBrowseUrl = CKEDITOR.getUrl("filemanager/browser/default/browser.html?Connector=../../connectors/java");
	config.filebrowserImageBrowseUrl = CKEDITOR.getUrl("filemanager/browser/default/browser.html?Type=Image&Connector=../../connectors/java");
	config.filebrowserFlashBrowseUrl = CKEDITOR.getUrl("filemanager/browser/default/browser.html?Type=Flash&Connector=../../connectors/java");
	config.filebrowserUploadUrl = CKEDITOR.getUrl("filemanager/connectors/java?Type=File");
	config.filebrowserImageUploadUrl = CKEDITOR.getUrl("filemanager/connectors/java?Type=Image");
	config.filebrowserFlashUploadUrl = CKEDITOR.getUrl("filemanager/connectors/java?Type=Flash");
	
	/* Other settings */
	config.baseFloatZIndex = 20000;
	config.allowedContent = true;
};
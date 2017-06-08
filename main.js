/* Brackets extension that adds simple and fast acces to all those essential libraries  */
define(function (require, exports, module) {
    "use strict";

// IMPORTANT! all our data    
var JSONfile = require('text!sources.json');
      
var Commands        = brackets.getModule("command/Commands"),
    CommandManager  = brackets.getModule("command/CommandManager"),
    Menus           = brackets.getModule("command/Menus"),
    EditorManager   = brackets.getModule("editor/EditorManager"),
    ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
    FileUtils       = brackets.getModule("file/FileUtils"),
    Dialogs         = brackets.getModule("widgets/Dialogs");
    
// get extension path, create dataObjectbject with all data from our JSON file
var sourcesObject = JSON.parse(JSONfile);
var libraryNames = Object.getOwnPropertyNames(sourcesObject);
var localPath = ExtensionUtils.getModulePath(module);
// isEnabled determines if a commented name of the inserted library is added (true by default)    
var isEnabled = true;

// function that inserts our content/snippet into the document  
function insertFunction(content) {
    var editor = EditorManager.getCurrentFullEditor();
    var insertionPos = editor.getCursorPos();
    if (editor) {
    editor.document.batchOperation(function() {
    editor.document.replaceRange(content, insertionPos);    
    });
    }
    else {    
        console.error("EditorManager error (insertFunction)");
    }
}

//construct the string to be put in the document
function prepareString(id) {
// object that stores all needed elements for content insertion
    var dataObject = { 
        name : id,
        comment : "<!--  " + id + "  -->",
        url : null,
        css: null,
        jscript: null,
        outputStr: "",
        sendString: function() {
            if (isEnabled == true) {
                this.outputStr += this.comment + "\n";
            }
            if (this.css != null ){
                this.outputStr += "<link rel=\"stylesheet\" href=\"" + this.url + "" + this.css + "\">\n";
            }
            if (this.jscript != null ) {
                this.outputStr += "<script src=\"" + this.url + "" + this.jscript + "\"></script>";
            }
                return this.outputStr;
            }
    };
    var dataHolder = sourcesObject[id];
    if (dataHolder.hasOwnProperty('url') ) {
        dataObject.url = dataHolder['url'];
    } // set url
    if (dataHolder.hasOwnProperty('script') ) {
        dataObject.jscript = dataHolder['script'];
    } // set JS
    if (dataHolder.hasOwnProperty('stylesheet') ) {
        dataObject.css = dataHolder['stylesheet'];
    } // set CSS
    // store output data into variable "result" with the Object.dataObject.sendString() method
    var result = dataObject.sendString();
    // send result to insertFunction
    insertFunction(result);
}   
    
// contruct extension 'quickLib' menu with the use of all data gathered from sources.json    
function constructMenu() {
    $.each(libraryNames, function(i, name) {
        var cleanName = name.replace(/[.-\s]/g,"").toUpperCase();
        var menuVariable = "MNU_" + cleanName.toUpperCase();
        CommandManager.register(name, menuVariable,  function(id) {
            prepareString(name);
        });
        menu.addMenuItem(menuVariable);
        //menu.addMenuItem(window[menuVariable]);
    });
}
 
/* opens the JSON file with all the CDN data
--------------------------------------------
   NOTICE: editing sources.json must be done without any mistakes. A single typo can cause the whole extension to go nuts because our 'quickLib' menu is 
           constructed and commands registered in a function with data from sources.json.                                                             */
function openJSON() {
    CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, {fullPath: localPath + "sources.json", paneId: "first-pane"});
}     
    
// Menus -> quickLib : display the "About Extension" modal
function aboutModal() {
    var displayAbout = "<img style=\"float: left; margin:11px 5px 0px 0px; padding:0;\" src=\"styles/images/brackets_icon.svg\" alt=\"logo\" width=\"20\" height=\"20\">";
    displayAbout += "<h3 style=\"margin-bottom:-5px;\">quickLib</h3></span>\n<small>version: 0.9.1</small><br><br>\n";
    displayAbout += "<span style=\"letter-spacing: 1px;\">Quick & simple adding all of those essential resources and snippets on Google Hosted Libraries.<hr>";
    displayAbout += "<p>&#1023; Author: Kopitar Anže</p><p>&#1023; Homepage: <a href=\"https://github.com/kopitar/brackets-quicklib\" >https://github.com/kopitar/brackets-quicklib</a></p>";
    displayAbout += "&#1023; Contact: kopitar71@gmail.com<br><hr>";
    // show modal dialog with "About Extension" information
    Dialogs.showModalDialog('a',"About Extension", displayAbout);
}
    
// extension main menu
Menus.addMenu('quickLib','quicklib.main');
var menu = Menus.getMenu('quicklib.main');     
    
// Allow enable and disable adding comments to inserted content 
var MNU_COMMENTS = CommandManager.register('Add Comment', "comments.quicklib", function() {  
this.setChecked(!this.getChecked());
isEnabled = this.getChecked();       
});
    
// menu option for opening sources.json
var MNU_JSON = "openjson.quicklib";
CommandManager.register("Open CDN source...", MNU_JSON, openJSON );    

// About Extension menu item
var MNU_ABOUT = "about.quicklib";
CommandManager.register("About Extension", MNU_ABOUT, aboutModal );
console.log(CommandManager)
               
// construct the menu for this extension, register all commands & show it
constructMenu();
menu.addMenuDivider();
// divider -> Enable/Disable comment prepending -> About Extension    
menu.addMenuItem(MNU_COMMENTS);
MNU_COMMENTS.setChecked(isEnabled);
menu.addMenuItem(MNU_JSON);    
menu.addMenuItem(MNU_ABOUT);     

});
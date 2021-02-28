# smartEvents
Smart events is a javascript library to give ordering to jQuery events

## Installation :

To use this library, you have 2 options which depend on the structure of your project.  
Either way you will need jQuery for this lib.

### 0°) Common : 
#### Download the library from here (or only one of the file you need)
#### Copy file/files to a folder where you put the Javascripts files in your project.
#### Or use NPM / Webpak install

### 1°) : Standard javascript usage :
#### Include a script call to jQuery : 

```HTML
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
```

#### Include a script call to the standalone js file like : 
```HTML
    <script src="src/lib_js/smartEvents.single.js"></script> 
```
	
### 2°) Use under Webpack structure (symfony 4+ projects or like) :
#### In the 'src' folder you'll find an 'app.js' file wich is provided as a template.

It show how to include globally jQuery and define this lib's functions in a folder named "lib_js".  
The functions are defined in the "smartEvents.webpack.js" file.  
Exemple:  

define it in your package.json file :
```JavaScript
// package.json and npm install smartEvents or npm install
    "dependencies": {
        "smartEvents": "github:loamok/smartEvents",

// app.js
    /* global global  */

    const $ = require('jquery');
    global.$ = global.jQuery = $;

    import { smartEventDefine } from 'smartEvents';
    global.smartEventDefine = smartEventDefine;

    /* In a file using smartEvent, you may need to get the global definition pattern such as like this (@see "Define a callback handler and library usage" below) */
    const smartEventDefine = global.smartEventDefine;
```

### 3°) Using the minified files :
#### You always need Jquery no matter how you load it.
#### Standard Js (1) :

```HTML
    <script src="dist/smartEvents.single.min.js"></script> 
```
#### Webpack (2) :
You can use smartEvents with webpack with npm :  
define it in your package.json file :

```JavaScript
    // package.json and npm install smartEvents or npm install
    "dependencies": {
        "smartEvents": "github:loamok/smartEvents",

```
Require from app.js :  
```JavaScript
    /* global global */

    const $ = require('jquery');
    global.$ = global.jQuery = $;

    import { smartEventDefine } from 'smartEvents'; // minified usage
    global.smartEventDefine = smartEventDefine;
```
Or you can import it in your assets folder :  
Exemple:  

```JavaScript
    /* global global */

    const $ = require('jquery');
    global.$ = global.jQuery = $;

    import { smartEventDefine } from '../dist/smartEvents.webpack.min'; // minified usage
    global.smartEventDefine = smartEventDefine;

    /* In a file using smartEvent, you may need to get the global definition pattern such as like this (@see "Define a callback handler and library usage" below)  */
    const smartEventDefine = global.smartEventDefine; 
```

Minified js files are planned to be optimized soon.  
A complete rewrite in full object mode is already availlable.

---

## Usage :

### Define a callback handler and library usage :

For convenience a configuration object template is provided you can copy it to a var in your scripts :

```JavaScript
var myDefine = { ...smartEventDefine } 
``` 
(Ecma 262 functionnal feature "spread operator" "..." come to clone object and do not let Javascript use a reference instead.)  
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

To define a **smartEvent** you will need 3 things who are :  
* the event name (like "click", "change", "apersonal:trigger", ...)
* a callback function (callback functions automatically recieves owner and jQuery Event as parameters, you can inject data in jQuery event)
* one and only one Html element with an id attribute  
*(sadly for now it could not work without ids and was tested only on one element. I work to find to make it work on elements collections and without id attribute).*
```JavaScript
    // handlers definition
    myDefine.event = 'click'; // jQuery event name
    myDefine.handler = function (obj, event) { // callback function
        // do something
    };
```

### Functions to manipulate events:
After having a callback definition you'll have to register it.  
Three functions let you manipulate the registering of an Event.  
You are free to use the one who matches your needs at a moment.

#### .smartEvent:
Register a smartEvent.  
The only mandatory parameter is the first one "definition" who accept a "smartEventDefine" like object.  
other parameters are:  
* order: optional: an order number
* isLast: optional and not recommended: boolean please use setMeLast instead.
* isFirst: optional and not recommended: boolean please use setMeFirst instead.

```JavaScript
    $('#someIdentifier').smartEvent(myDefine);
    // or
    $('#someIdentifier').smartEvent(myDefine, 5);
    // or (not recommended please use .smartEventLast instead.)
    $('#someIdentifier').smartEvent(myDefine, 999, true);
    // or (not recommended please use .smartEventFirst instead.)
    $('#someIdentifier').smartEvent (myDefine, -999, false, true);
```

#### .smartEventFirst:
Use the definition as first handler to be trigger.  
The only parameter is mandatory "definition" who accept a "smartEventDefine" like object.

```JavaScript
    $('#someIdentifier').smartEventFirst(myDefine);
```

#### .smartEventLast:
Use the definition as last handler to be trigger.  
The only parameter is mandatory "definition" who accept a "smartEventDefine" like object.

```JavaScript
    $('#someIdentifier').smartEventLast(myDefine);
```

With this 3 first functions you will be able to manipulate the order of all events.

#### .smartEventDeRegister:
Use the definition to deregister an event for an owning object  
The only parameter is mandatory "definition" who accept a "smartEventDefine" like object.  
You can only give event (event name like 'click') in mandatory parameter.  
All the handlers define for this event will be deleted/de-registered.  
New definitions will be needed to restore the object fonctionnality.  
Explanation:
* If you define 2 handlers with same event name on an object, this function will not bee able to remove only the first or the second handler.
* all of the handlers on the same event name will be removed.
* others event names handlers will be left untouched.

```JavaScript
    $('#someIdentifier').smartEventDeRegister(myDefine);
    // or
    $('#someIdentifier').smartEventDeRegister({event: 'click'});
```

---

## Advanced exemple :
We will assume the lib is correctly installed from here.

```JavaScript
    // handlers definition, lets play a litle
    // with one button we will : 
    // trigger a 'first' and second handler
    // define a personalized event with data from second handler 
    // (so we make perso dependent of second (for a post ajax call maybe))
    // and trigger it
    var firstHDef = { ...smartEventDefine };
    var secondHDef = { ...smartEventDefine };
    var persoHDef = { ...smartEventDefine };
    const PersonalEvent = 'personal:postClick'; // personal event Name
        
    secondHDef.event = 'click'; 
    secondHDef.handler = function (obj, event) { 
        console.log("In second Handler");
        var event = $.Event(PersonalEvent); // and make the personal event
        event.myData = "plop"; // with myData = "plop"
        
        $(obj).trigger(event); // and trigger it now
    };
    
    firstHDef.event = 'click';
    firstHDef.handler = function (obj, event) { 
        console.log("In first Handler");
    };
    
    persoHDef.event = PersonalEvent; // this is here where magic is made
    persoHDef.handler = function (obj, event) { 
        console.log("In personal trigered Handler myData : ", event.myData);
    };
    
    $(document).ready(function() {
        $('#myButton').smartEvent(secondHDef);
        $('#myButton').smartEventFirst(firstHDef);
        $('#myButton').smartEvent(persoHDef); // or first or last it is alone on 'personal:postClick' and will not collide with click
        // and that's all ! you could write those lines in any order or from 3 files if you want it do not matter
        // this will also work the same no writing order matter only your choices :
        // $('#myButton').smartEvent(persoHDef); 
        // $('#myButton').smartEventFirst(firstHDef);
        // $('#myButton').smartEventLast(secondHDef);
    });

```
Function to remove handlers just came out in this version.  
I, may, have forgoten something. If so ask if you need help with my lib.

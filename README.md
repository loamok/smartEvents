# smartEvents
Smart events is a javascript library to give ordering to jQuery events

## Usage :
To use this library, you have 2 options which depend on the structure of your project. 
Either way you will need jQuery for this lib.

* 0°) Common : 
	* Download the library from here (or only one of the file you need)
	* Copy file/files to a folder where you put the Javascripts files in your project.
* 1°) : Standard javascript usage :
	* Include a script call to jQuery : 
	``` <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> ```
	* Include a script call to the standalone js file like : 
	``` <script src="src/lib_js/smartEvents.single.js"></script> ```
* 2°) Use under Webpack structure (symfony 4+ projects or like) :
	* In the 'src' folder you'll find an 'app.js' file wich is provided as a template.
	It show how to include globally jQuery and define this lib's functions in a folder named "lib_js".
	The functions are defined in the "smartEvents.webpack.js" file.
        * In a file using smartEvent, you may need to get the global definition pattern such as like this (@see "Define a callback handler and library usage" below) 
        ``` const smartEventDefine = global.smartEventDefine; ```

Minified js files are planned to be provided soon.
A complete rewrite in full object mode is also planned.

### Define a callback handler and library usage :

For convenience a configuration object template is provided you can copy it to a var in your scripts : 
``` var myDefine = { ...smartEventDefine } ``` 
(Ecma 7 functionnal feature "..." comme to clone object and do not let Javascript use a reference instead.)

To define a **smartEvent** you will need 3 things who are : 
* the event name (like click, change, ...)
* a callback function (callback functions automatically recieve owner and jQuery Event as prameters)
* one and only one Html element with an id (sadly for now it could not work without ids and was tested only on one element. I plan to make it work on elements collections and without id attribute).
```
// handlers definition
myDefine.event = 'click'; // jQuery event name
myDefine.handler = function (obj, event) { // callback function
    // do something
};
```

### Functions to manipulate events:
After having a callback definition you'll have to register it.

Three functions let you manipulate the registring of an Event.
You are free to use the one who matches your needs at a moment.

#### .smartEvent:
Register a smartEvent.
The only mandatory parameter is the first one "definition" who accept a "smartEventDefine" like object.
other parameters are:
* order: optional: an order number
* isLast: optional and not recommended: boolean please use setMeLast instead.
* isFirst: optional and not recommended: boolean please use setMeFirst instead.
```
$('#someIdentifier').smartEvent(myDefine);
// or
$('#someIdentifier').smartEvent(myDefine, 5);
// or (not recommended please use .smartEventLast instead.)
$('#someIdentifier').smartEvent(myDefine, 999, true);
// or (not recommended please use .smartEventFirst instead.)
$('#someIdentifier').smartEvent (myDefine, -999, false, true);
```

#### .smartEventFirst:
Use the definition as first handler to be trigger
The only parameter is mandatory "definition" who accept a "smartEventDefine" like object.

```
$('#someIdentifier').smartEventFirst(myDefine);
```

#### .smartEventLast:
Use the definition as last handler to be trigger
The only parameter is mandatory "definition" who accept a "smartEventDefine" like object.

```
$('#someIdentifier').smartEventLast(myDefine);
```

With this 3 functions you will be able to manipulate the order of all events.

Functions to remove handlers are planned to be write in future version.


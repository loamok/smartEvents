/* 
 * LICENSE is attached to the project and is GNU LGPLv3
 * See the license file to the root of the project tree
 * 
 * @license GNU LGPLv3
 */

/**
 * A smart event base definition set like : 
 *  owner : event.data.obj : the jQuery html element who have the event to be attached
 *  event : the event name to be attached on. @todo give the possibility to trigger on several event names
 *  handler : the event function to trigger.  @see triggerMeOn for full description.
 *  
 * @type Object
 */
const smartEventDefine = {
    /*[Object])*/ owner: null, /*String*/ event: null, /*Function*/ handler: null
};

// For internal use only, but you can tune thoses constants for matching your needs
/**
 * Starting order number for forcing the 'setMeFirst' ability.
 * Next setMeFirst call would have -1000, -1001 order and so on.
 * 
 * @type integer
 */
const firstOrder = -999;
/**
 * Order number for forcing the 'setMeLast' ability.
 * Next setMeLast call would have 1000, 1001 order and so on.
 * 
 * @type integer
 */
const lastOrder = 999;
/**
 * Since javascript confuse null and 0 even with '===' comparison, 
 * ordering numbers are converted to strings with this prefix. (and a separator set below)
 * Ordering strings would look like "<sOrderKey><sOrderKeySep><order>" so it means sOrder_5 for an order of 5.
 * 
 * @type String
 */
const sOrderKey = 'sOrder';
/**
 * Separator for separating ordering string prefix from order number.
 * 
 * @type String
 */
const sOrderKeySep = '_';
/**
 * All the smartEvents definitions collection
 * 
 * @type Object
 */
var smartEvents = {};

/**
 * Optimized sorting function.
 * Used to ensure functions will be triggered in the correct order.
 * This is a mix between Bubble and Insertion sorting.
 * I put in index.html an ugly benchmark between thoses 3 algorithms.
 * This function can be 3 times faster of the others.
 * 
 * @param {Array} toSort array to sort
 * @returns {Array} sorted array
 */
function sortMe(/*Array*/ toSort) {
    var swapped = true;
    
    do {
        swapped = false;
        for(var j = 0; j < toSort.length; j++) {
            
            for(var i = toSort.length - 1; i > 0; i--) {
                if(i === j)
                    break;
            
                var elemOrder = parseInt(toSort[j].split(sOrderKeySep)[1]);
                var nextOrder = parseInt(toSort[i].split(sOrderKeySep)[1]);

                if(elemOrder > nextOrder) {
                    var tmp = toSort[j];
                    toSort[j] = toSort[i];
                    toSort[i] = tmp;
                    swapped = true;
                }
            }
        }
    } while (swapped);
    
    return toSort;
}

/**
 * Register an ordered handler in the smartEvent system
 * only the "definition" parameter is mandatory
 * other parameters are optionnals
 * 
 * @param {Object} definition
 * @param {integer} order*
 * @param {Boolean} isLast*
 * @param {Boolean} isFirst*
 * @returns {void}
 */
function recordSmartEvent(/*[Object])*/ definition, /*integer*/ order, /*Boolean*/ isLast, /*Boolean*/ isFirst) {
    // let use some vars
    var smartEvent;
    
    if(order === undefined) 
        order = 0;
    
    var sOrder = sOrderKey + sOrderKeySep + order; // order is used as a string since Js confuse 0 with null
    
    if(definition.owner) { // objet to put handlers on is mandatory
        if(definition.owner.attr('id')) { // with an id, ids are kept in collection
            if(!smartEvents[definition.owner.attr('id')]) 
                smartEvents[definition.owner.attr('id')] = [];
            
            smartEvent = smartEvents[definition.owner.attr('id')];
            
            // we need an event with some structural datas
            if(!smartEvent[definition.event]) 
                smartEvent[definition.event] = {toTrigger: [], defined: false, last: null, first: null};
            
            smartEvent[definition.event].last = (isLast === true)? sOrder: smartEvent[definition.event].last;
            smartEvent[definition.event].first = (isFirst === true)? sOrder: smartEvent[definition.event].first;
            
            if(!smartEvent[definition.event][sOrder]) {
                // store the handler definition like smartEvents.myId.click.sOrder_0
                smartEvent[definition.event][sOrder] = definition;
                
                // ordering the handler calls (array natural sort)
                smartEvent[definition.event].toTrigger.push(sOrder);
                if(!smartEvent[definition.event].defined) {
                    // we only put one callback for all of the handlers since "triggerMeOn" is warant of the call order
                    $(definition.owner).on(definition.event, {obj: definition.owner, eventName: definition.event}, triggerMeOn);
                    // and never put another jquery callback on the html element
                    smartEvent[definition.event].defined = true;
                }
                
            // Avoiding order numbers collisions. If number is already registered increase (or decrease (for setMeFirst) and self call
            // Only 
            } else {
                var nextOrder = (order < 0) ? order - 1: order + 1;
                
                recordSmartEvent(definition, nextOrder, isLast, isFirst);
                return;
            }
            
            // sorting the handlers to call (optimized bubble sort, my personal choice)
            smartEvent[definition.event].toTrigger = sortMe(smartEvent[definition.event].toTrigger);
            
        }
        
    }
}

/**
 * Set the definition as the 'first' to trigger
 * 
 * @param {Object} definition
 * @returns {void}
 */
function setMeFirst(/*[Object])*/ definition) {
    // more complex not work (replacing the definitions with new one with current def as first call) 
    // instead give it a '-999' order
    recordSmartEvent(definition, firstOrder, false, true);

}

/**
 * Set the definition as the 'last' to trigger
 * 
 * @param {Object} definition
 * @returns {void}
 */
function setMeLast(/*[Object])*/ definition) {
    // no deal here there is no events recorded yet we simply record a simple event with order 999
    // since ordinary orders would be before 999 and 999 could only be replaced by another 'setMe"Something"' call
    // with recordSmartEvent auto increase
    recordSmartEvent(definition, lastOrder, true);
}

/**
 * Trigger the recorded event Handlers
 * Parameters gived to handlers are (in this order !) :
 *  event.data.obj: the jQuery object (HTML element) to which the event (click, change, anything ...) is attached
 *  event : the full jQuery Event object
 *  
 * An event handler can be write like :
 *  function (owner, event) { .... }
 * 
 * @param {Event} event https://api.jquery.com/category/events/event-object/
 * @returns {void}
 */
function triggerMeOn(/*[Object])*/ event) {
    if(event.data.obj.attr('id')) { // do nothing wihtout a definition
        var smartEvent = smartEvents[event.data.obj.attr('id')];
        if(smartEvent === undefined)
            return; // and ensure it
        
        if(smartEvent[event.data.eventName] && smartEvent[event.data.eventName].toTrigger) {
            // trigger the first handler if it exists
            if(smartEvent[event.data.eventName].first !== null) 
                smartEvent[event.data.eventName][smartEvent[event.data.eventName].first].handler(event.data.obj, event);
            
            // have we got a collection of handlers and an ordered one
            for (const sOrder of smartEvent[event.data.eventName].toTrigger) {
                // trigger all handlers that are not flagged "last" or "first"
                if(sOrder !== smartEvent[event.data.eventName].last && sOrder !== smartEvent[event.data.eventName].first) {
                    smartEvent[event.data.eventName][sOrder].handler(event.data.obj, event);
                }
            }
            
            // finally trigger the last if it exists
            if(smartEvent[event.data.eventName].last !== null) 
                smartEvent[event.data.eventName][smartEvent[event.data.eventName].last].handler(event.data.obj, event);
        }
    }
}

/* 
 * Copyright (C) 2021 Huby Franck for Loamok.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
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

var smartEventManager = {
    
    // For internal use only, but you can tune thoses constants for matching your needs
    /**
     * Starting order number for forcing the 'setMeFirst' ability.
     * Next setMeFirst call would have -1000, -1001 order and so on.
     * 
     * @type integer
     */
    firstOrder: -999,
    /**
     * Order number for forcing the 'setMeLast' ability.
     * Next setMeLast call would have 1000, 1001 order and so on.
     * 
     * @type integer
     */
    lastOrder: 999,
    /**
     * Since javascript confuse null and 0 even with '===' comparison, 
     * ordering numbers are converted to strings with this prefix. (and a separator set below)
     * Ordering strings would look like "<sOrderKey><sOrderKeySep><order>" so it means sOrder_5 for an order of 5.
     * 
     * @type String
     */
    sOrderKey: 'sOrder',
    /**
     * Separator for separating ordering string prefix from order number.
     * 
     * @type String
     */
    sOrderKeySep: '_',
    /**
     * All the smartEvents definitions collection
     * 
     * @type Object
     */
    smartEvents: {},

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
    sortMe: function (/*Array*/ toSort) {
        var swapped = true;

        do {
            swapped = false;
            for(var j = 0; j < toSort.length; j++) {

                for(var i = toSort.length - 1; i > 0; i--) {
                    if(i === j)
                        break;

                    var elemOrder = parseInt(toSort[j].split(smartEventManager.sOrderKeySep)[1]);
                    var nextOrder = parseInt(toSort[i].split(smartEventManager.sOrderKeySep)[1]);

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
    },

    /**
     * Define the owner in jQuery plugin mode
     * 
     * @param {Object} definition
     * @param {Object} jQueryObj
     * @returns {Boolean}
     */
    ownerForPlugin: function (/*[Object])*/ definition, /*[Object])*/ jQueryObj) {
        if(definition !== undefined && definition !== null) {
            if(definition.owner === undefined || definition.owner === null)
                definition.owner = jQueryObj;
        } else if(smartEventManager.smartEvents[jQueryObj.attr('id')] === undefined) {
            smartEventManager.smartEvents[jQueryObj.attr('id')] = {};
        }
        
        return definition;
    },
    
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
    recordSmartEvent: function (/*[Object])*/ definition, /*integer*/ order, /*Boolean*/ isLast, /*Boolean*/ isFirst) {
        // let use some vars
        var smartE;

        if(order === undefined) 
            order = 0;

        var sOrder = smartEventManager.sOrderKey + smartEventManager.sOrderKeySep + order; // order is used as a string since Js confuse 0 with null

        if(definition.owner) { // objet to put handlers on is mandatory
            if(definition.owner.attr('id')) { // with an id, ids are kept in collection
                if(!smartEventManager.smartEvents[definition.owner.attr('id')]) 
                    smartEventManager.smartEvents[definition.owner.attr('id')] = {};

                smartE = smartEventManager.smartEvents[definition.owner.attr('id')];

                // we need an event with some structural datas
                if(!smartE[definition.event]) 
                    smartE[definition.event] = { /*Array*/ toTrigger: [], /*Boolean*/ defined: false, /*String*/ last: null, /*String*/ first: null };

                smartE[definition.event].last = (isLast === true)? sOrder: smartE[definition.event].last;
                smartE[definition.event].first = (isFirst === true)? sOrder: smartE[definition.event].first;

                if(!smartE[definition.event][sOrder]) {
                    // store the handler definition like smartEvents.myId.click.sOrder_0
                    smartE[definition.event][sOrder] = definition;

                    // ordering the handler calls (array natural sort)
                    smartE[definition.event].toTrigger.push(sOrder);
                    if(!smartE[definition.event].defined) {
                        // we only put one callback for all of the handlers since "triggerMeOn" is warant of the call order
                        $(definition.owner).on(definition.event, {obj: definition.owner, eventName: definition.event}, smartEventManager.triggerMeOn);
                        // and never put another jquery callback on the html element
                        smartE[definition.event].defined = true;
                    }

                // Avoiding order numbers collisions. If number is already registered increase (or decrease (for setMeFirst) and self call
                // Only 
                } else {
                    var nextOrder = (order < 0) ? order - 1: order + 1;

                    smartEventManager.recordSmartEvent(definition, nextOrder, isLast, isFirst);
                    return;
                }

                // sorting the handlers to call (optimized bubble sort, my personal choice)
                smartE[definition.event].toTrigger = smartEventManager.sortMe(smartE[definition.event].toTrigger);
            }

        }
    },

    /**
     * Set the definition as the 'first' to trigger
     * 
     * @param {Object} definition
     * @returns {void}
     */
    setMeFirst: function (/*[Object])*/ definition) {
        // more complex not work (replacing the definitions with new one with current def as first call) 
        // instead give it a '-999' order
        smartEventManager.recordSmartEvent(definition, smartEventManager.firstOrder, false, true);

    },

    /**
     * Set the definition as the 'last' to trigger
     * 
     * @param {Object} definition
     * @returns {void}
     */
    setMeLast: function (/*[Object])*/ definition) {
        // no deal here there is no events recorded yet we simply record a simple event with order 999
        // since ordinary orders would be before 999 and 999 could only be replaced by another 'setMe"Something"' call
        // with recordSmartEvent auto increase
        smartEventManager.recordSmartEvent(definition, smartEventManager.lastOrder, true);
    },

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
    triggerMeOn: function (/*[Object])*/ event) {
        if(event.data.obj.attr('id')) { // do nothing wihtout a definition
            var smartE = smartEventManager.smartEvents[event.data.obj.attr('id')];
            if(smartE === undefined)
                return; // and ensure it

            if(smartE[event.data.eventName] && smartE[event.data.eventName].toTrigger) {
                // trigger the first handler if it exists
                if(smartE[event.data.eventName].first !== null) 
                    smartE[event.data.eventName][smartE[event.data.eventName].first].handler(event.data.obj, event);

                // have we got a collection of handlers and an ordered one
                for (const sOrder of smartE[event.data.eventName].toTrigger) {
                    // trigger all handlers that are not flagged "last" or "first"
                    if(sOrder !== smartE[event.data.eventName].last && sOrder !== smartE[event.data.eventName].first) {
                        smartE[event.data.eventName][sOrder].handler(event.data.obj, event);
                    }
                }

                // finally trigger the last if it exists
                if(smartE[event.data.eventName].last !== null) 
                    smartE[event.data.eventName][smartE[event.data.eventName].last].handler(event.data.obj, event);
            }
        }
    }
};


(function ($) {
    $.fn.smartEvent = function(/*[Object])*/ definition, /*integer*/ order, /*Boolean*/ isLast, /*Boolean*/ isFirst) {
        
        var $this = $(this);
        var def = {...definition};
        def = smartEventManager.ownerForPlugin(def, $this);
        
        if(isLast !== undefined && isLast !== false) {
            smartEventManager.setMeLast(def);
            return;
        }

        if(isFirst !== undefined && isFirst !== false) {
            smartEventManager.setMeFirst(def);
            return;
        }

        smartEventManager.recordSmartEvent(def, order);

    };
    
    $.fn.smartEventFirst = function(/*[Object])*/ definition) {
        var $this = $(this);
        var def = {...definition};
        
        def = smartEventManager.ownerForPlugin(def, $this);
        
        smartEventManager.setMeFirst(def);
    };
    
    $.fn.smartEventLast = function(/*[Object])*/ definition) {
        var $this = $(this);
        var def = {...definition};
        
        def = smartEventManager.ownerForPlugin(def, $this);

        smartEventManager.setMeLast(def);
    };
    
})(jQuery);

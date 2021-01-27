/* 
 * LICENSE is attached to the project and is GNU LGPLv3
 * See the license file to the root of the project tree
 * 
 * @license GNU LGPLv3
 */
/* global global */

const $ = require('jquery');
global.$ = global.jQuery = $;

import { recordSmartEvent, triggerMeOn, setMeFirst, setMeLast,  smartEventDefine } from './js/let/smartEvents.webpack';
global.recordSmartEvent = recordSmartEvent;
global.triggerMeOn = triggerMeOn;
global.setMeFirst = setMeFirst;
global.setMeLast = setMeLast;
global.smartEventDefine = smartEventDefine;


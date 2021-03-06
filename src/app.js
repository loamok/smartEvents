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

/* global global */

const $ = require('jquery');
global.$ = global.jQuery = $;

import { smartEventDefine } from './lib_js/smartEvents.webpack';
//import { smartEventDefine } from '../dist/smartEvents.webpack.min'; // minified usage
global.smartEventDefine = smartEventDefine;

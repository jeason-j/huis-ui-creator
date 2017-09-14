﻿/*
    Copyright 2016 Sony Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/// <reference path="include/interfaces.d.ts" />

module Config {

    var global = global || window;

    var baseUrl = /(.+\/)[^/]*#[^/]+/.exec(location.href);
    if (!baseUrl) {
        baseUrl = /(.+\/)/.exec(location.href);
    }

    // require.js configration
    var requireConfig = {
        baseUrl: baseUrl[1],

        urlArgs: "bust=" + Date.now(),

        paths: {
            // external modules
            "backbone": "modules/backbone/scripts/backbone",
            "hogan": "modules/hogan/scripts/hogan",
            "i18n": "modules/i18next/scripts/i18next",
            "jquery": "modules/jquery/scripts/jquery",
            "jquery.mobile": "modules/jquery/scripts/jquery.mobile",
            "modernizr": "modules/modernizr/scripts/modernizr",
            "underscore": "modules/underscore/scripts/underscore",
            "pixi": "modules/pixi/scripts/pixi",
            "zip": "modules/zip/scripts/zip",

            // cdp modules
            "cdp.core": "modules/sony/cdp/scripts/cdp.core",
            "cdp.framework.jqm": "modules/sony/cdp/scripts/cdp.framework.jqm",
            "cdp.lazyload": "modules/sony/cdp/scripts/cdp.lazyload",
            "cdp.nativebridge": "modules/sony/cdp/scripts/cdp.nativebridge",
            "cdp.promise": "modules/sony/cdp/scripts/cdp.promise",
            "cdp.tools": "modules/sony/cdp/scripts/cdp.tools",
            "cdp.ui.jqm": "modules/sony/cdp/scripts/cdp.ui.jqm",
            "cdp.ui.listview": "modules/sony/cdp/scripts/cdp.ui.listview",

            // garage scripts
            "garage.util.huisfiles": "scripts/Util/HuisFiles",
            "garage.util.electrondialog": "scripts/Util/ElectronDialog",
            "garage.util.selectremotepagedialog": "scripts/Util/SelectRemotePageDialog",
            "garage.util.huisdev": "scripts/Util/HuisDev",
            "garage.util.miscutil": "scripts/Util/MiscUtil",
            "garage.util.jqutils": "scripts/Util/JQueryUtils",
            "garage.util.buttondeviceinfocache": "scripts/Util/ButtonDeviceInfoCache",
            "garage.util.zipmanager": "scripts/Util/ZipManager",
            "garage.util.importmanager": "scripts/Util/ImportManager",
            "garage.util.informationdialog": "scripts/Util/InformationDialog",
            "garage.util.itemclipboard": "scripts/Util/ItemClipboard",
            "garage.util.phnconfigfile": "scripts/Util/PhnConfigFile",
            "garage.util.pathmanager": "scripts/Util/PathManager",
            "garage.model.offscreeneditor": "scripts/Model/OffscreenEditor",
            "garage.view.fullcustomcommand": "scripts/View/FullCustomCommand",
            "garage.view.exportmanager": "scripts/View/ExportManager",


            /* <ATELIERMARKUP type="require-module-path" /> */
            // internal lib modules

            // application
            "app": "scripts/app",
            // wait for module load for 100 seconds
            "waitSeconds": 100,
        },

        shim: {
            /* <ATELIERMARKUP type="require-shim" /> */
            "zip": {
                init: function () {
                    zip.workerScriptsPath = requireConfig.baseUrl + "modules/zip/scripts/";
                }
            },
        },
    };
    // global export
    global.requirejs = requireConfig;

    // jQuery settings
    export function jquery(): void {
        $.support.cors = true;            // allow cross domain request
        $.ajaxSetup({ cache: false });    // disable ajax request cache
    }

    // jQuery Mobile settings
    export function jquerymobile(): void {
        $.mobile.allowCrossDomainPages = true;
        $.mobile.defaultPageTransition = "none";
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
    }

    // localize resource data path
    export function i18nDataPath(): string {
        return "res/locales/__ns__-__lng__.json";
    }

    /**
     * When not specifying domain information on a chrome inspector at sourceURL automatic insertion,
     * please set it as a false.
     */
    export var autoDomainAssign = true;

    // The string which is used to avoid a conflict
    export var namespace = "garage";

    // build configuration symbol
    export var DEBUG = ((): boolean => {
        return !!("%% buildsetting %%");    //! returns "false" on release build
    })();
}

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

/// <reference path="../../include/interfaces.d.ts" />


module Garage {
    export module Model {
        var TAG = "[Garage.Model.VersionDialog] ";

        export class ScreensaverDialog extends Backbone.Model {
            private _imagePath: string;

            get imagePath(): string {
                return this._imagePath;
            }

            set imagePath(path: string) {
                this._imagePath = path;
            }

            loadHuisDevData(): void {
                console.log("TODO: load screensaver setting");
            }
        }
    }
}

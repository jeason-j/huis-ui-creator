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

/// <reference path="../include/interfaces.d.ts" />
/// <reference path="LabelItem.ts" />

module Garage {
    export module Model {
        var TAG = "[Garage.Model.LabelItemsCollection] ";

        export class LabelItemsCollection extends Backbone.Collection<LabelItem> {

            // Backbone.Collection に対象の Model の型を与える
            model = LabelItem;

            //! constructor
            constructor(model?: any) {
                super(model);
            }

            //! destroy ハンドラ。
            private onDestroy(item: Model.LabelItem) {
                console.log(TAG + "onDestroy()");
            }
        }
    }
}

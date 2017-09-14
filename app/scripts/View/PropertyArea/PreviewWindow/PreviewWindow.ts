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

/// <reference path="../../../include/interfaces.d.ts" />

/* tslint:disable:max-line-length no-string-literal */

module Garage {
    export module View {

        var TAG = "[Garage.View.PropertyArea.PreviewWindow.PreviewWindow] ";

        export abstract class PreviewWindow extends PropertyAreaElement {

            protected domId_: string;
            protected preview_: Preview;

            constructor(item: Model.Item, domId: string, templateDomId: string, options?: Backbone.ViewOptions<Model.Item>) {
                super(item, templateDomId, options);
                this.domId_ = domId;
            }

            render(): Backbone.View<Model.Item> {
                super.render();
                this.$el.find(this.preview_.getDomId()).append(this.preview_.render().$el);
                this.endProcessOfRender();
                return this;
            };

            /**
             * @return {string} DOM全体を示すIDを返す。
             */
            getDomId(): string {
                return this.domId_;
            }

        }
    }
}

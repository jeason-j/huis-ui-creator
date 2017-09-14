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

/// <reference path="../../../../include/interfaces.d.ts" />

/* tslint:disable:max-line-length no-string-literal */

module Garage {
    export module View {

        var TAG = "[Garage.View.PropertyArea.PreviewWindow.Preview.ImagePreview] ";

        namespace ConstValue {
            export const TEMPLATE_DOM_ID: string = "#template-image-preview";
            export const DOM_ID: string = "#preview";

            export const IMAGE_CONTAINER_DOM_ID: string = "#image-container";
        }

        export class ImagePreview extends Preview {


            constructor(item: Model.ImageItem) {
                super(item, ConstValue.DOM_ID, ConstValue.TEMPLATE_DOM_ID);
            }


            events() {
                // Please add events
                return {

                };
            }


            render(option?: any): Backbone.View<Model.Item> {
                super.render();
                this.endProcessOfRender();
                return this;
            };


            /**
             * 保持しているモデルを取得する
             * @return {Model.ImagelItem}
             */
            getModel(): Model.ImageItem {
                return <Model.ImageItem>this.model;
            }


        }
    }
}

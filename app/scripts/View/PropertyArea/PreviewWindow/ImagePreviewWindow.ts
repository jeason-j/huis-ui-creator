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

        var TAG = "[Garage.View.PropertyArea.PreviewWindow.ImagePreviewWindow] ";

        namespace ConstValue {
            export const TEMPLATE_DOM_ID = "#template-image-preview-window";
            export const DOM_ID = "#image-preview-window";
            export const EDIT_BTN_DOM_ID = "#edit-btn";
        }

        export class ImagePreviewWindow extends ImageHandlePreviewWindow {

            constructor(image: Model.ImageItem, editingRemoteId: string) {
                super(image, editingRemoteId, ConstValue.DOM_ID, ConstValue.TEMPLATE_DOM_ID);
                this.preview_ = new ImagePreview(image);
            }

            events() {
                let events = {};
                events[Events.CLICK_WITH_DIVIDER + ConstValue.EDIT_BTN_DOM_ID] = "_onEditBtnClicked";
                return events;
            }

            private _onEditBtnClicked(event: Event) {
                let FUNCTION_NAME = TAG + "_onEditBtnClicked";

                this._showImageSelectDialog().done((imageFilePath: string) => {
                    if (imageFilePath == null) {
                        console.warn(FUNCTION_NAME + "imagePath is invalid");
                        return;
                    }
                    this.tmpImageFilePath_ = imageFilePath;
                    this.trigger(PropertyAreaEvents.Image.UI_CHANGE_PATH);
                });
            }

        }
    }
}

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

        var TAG = "[Garage.View.PropertyArea.PreviewWindow.LabelPreviewWindow] ";

        namespace ConstValue {
            export const TEMPLATE_DOM_ID = "#template-label-preview-window";
            export const DOM_ID = "#label-preview-window";
        }

        export class LabelPreviewWindow extends PreviewWindow {

            constructor(label: Model.LabelItem) {
                super(label, ConstValue.DOM_ID, ConstValue.TEMPLATE_DOM_ID);
                this.preview_ = new TextPreview(label);
                this.listenTo(this.preview_, PropertyAreaEvents.Label.UI_CHANGE_SIZE, this._onTextSizePulldownChanged);
                this.listenTo(this.preview_, PropertyAreaEvents.Label.UI_CHANGE_COLOR, this._onTextColorPulldownChanged);
                this.listenTo(this.preview_, PropertyAreaEvents.Label.UI_CHANGE_TEXT, this._onTextFieldChanged);
            }

            private _onTextSizePulldownChanged(event: Event) {
                this.trigger(PropertyAreaEvents.Label.UI_CHANGE_SIZE);//uiChange:textを親クラスであるPropertyAreaクラスに伝播させる
            }

            private _onTextColorPulldownChanged(event: Event) {
                this.trigger(PropertyAreaEvents.Label.UI_CHANGE_COLOR);//uiChange:colorを親クラスであるPropertyAreaクラスに伝播させる
            }

            private _onTextFieldChanged(event: Event) {
                this.trigger(PropertyAreaEvents.Label.UI_CHANGE_TEXT);//uiChange:textを親クラスであるPropertyAreaクラスに伝播させる
            }

            /**
             * @return {number} テキストサイズ用のプルダウンの値を取得
             */
            getTextSize(): number {
                return (<TextPreview>this.preview_).getTextSize();
            }

            /**
             * @return {number} テキストカラー用のプルダウンの値を取得
             */
            getTextColor(): string {
                return (<TextPreview>this.preview_).getTextColor();
            }

            /**
             * @return {string} テキストフィールドの値を取得
             */
            getText(): string {
                return (<TextPreview>this.preview_).getText();
            }
        }
    }
}

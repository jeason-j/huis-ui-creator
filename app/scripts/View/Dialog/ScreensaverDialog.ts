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
    export module View {
        export class ScreensaverDialog extends Backbone.View<Model.ScreensaverDialog> {
            constructor(options?: Backbone.ViewOptions<Model.ScreensaverDialog>) {
                super(options);
            }

            events(): any {
                return {
                    "click #dialog-about-button-ok": "close"
                };
            }

            initialize() {
                this.render();
            }

            render(): ScreensaverDialog {
                /*
                let templateFile = CDP.Framework.toUrl("/templates/dialogs.html");
                let jst = CDP.Tools.Template.getJST("#screensaver-setting-dialog", templateFile);

                let $dialog = $(jst({
                    title: $.i18n.t("app.name") + $.i18n.t("about.STR_ABOUT_TITLE"),
                    message: "test",
                }));
                this.$el.append($dialog);
                */

                let templateFile = CDP.Framework.toUrl("/templates/dialogs.html");
                let jst = CDP.Tools.Template.getJST("#screensaver-setting-dialog", templateFile);

                let text = "test";

                let $dialog = $(jst({
                    title: $.i18n.t("dialog.title.STR_DIALOG_TITLE_SCREENSAVER_SETTINGS"),
                    message: text,
                }));


                this.$el.append($dialog);

                // this.$el.children('#about-dialog-back').trigger('create');
                return this;
            }

            close(event: Event) {
                this.undelegateEvents();

                let dom = this.$el.find('#about-dialog-back');
                dom.remove();
            }
        }
    }
}
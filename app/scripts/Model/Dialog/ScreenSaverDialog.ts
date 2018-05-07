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
        export namespace ConstValue {
            export const DEFAULT_IMAGE_PATH: string = "./app/res/images/default_screensaver.png";
            export const SCREENSAVER_DIR_NAME: string = "screensaver";
            export const SCREENSAVER_IMAGE_FILE_NAME_PREFIX: string = "SS";
            export const SCREENSAVER_IMAGE_FILE_NAME_SUFFIX: string = ".png";
            export const SCREENSAVER_IMAGE_FILE_NAME: string = SCREENSAVER_IMAGE_FILE_NAME_PREFIX + "0000" + SCREENSAVER_IMAGE_FILE_NAME_SUFFIX;

            export const SCREENSAVER_WIDTH: number = 540;
            export const SCREENSAVER_HEIGHT: number = 960;
            export const SCREENSAVER_EDIT_IMAGE_PARAMS: IImageEditParams = {
                resize: {
                    width: SCREENSAVER_WIDTH,
                    height: SCREENSAVER_HEIGHT
                }
            };
        }

        export class ScreensaverDialog extends Backbone.Model {
            /**
             * imagePath はデフォルト画像のパスを初期値として与えておく
             * @param {any} attributes
             * @param {any} options
             */
            constructor(attributes?: any, options?: any) {
                super(attributes, options);
                this.imagePath = Util.PathManager.resolve(ConstValue.DEFAULT_IMAGE_PATH);
            }

            get imagePath(): string {
                return this.get("imagePath");
            }

            set imagePath(path: string) {
                // change イベント発火のため、attribute で管理する
                this.set({ "imagePath": path });
            }

            private getDirPath(): string {
                return Util.PathManager.getHuisFilesDir() + "/" + ConstValue.SCREENSAVER_DIR_NAME;
            }

            private getImagePath(): string {
                return this.getDirPath() + "/" + ConstValue.SCREENSAVER_IMAGE_FILE_NAME;
            }

            private prepareDir() {
                let dirPath = this.getDirPath();
                if (!fs.existsSync(dirPath)) {
                    fs.mkdir(dirPath);
                }
            }

            /**
             * HUIS本体が持っている画像データの情報を取得する
             */
            loadHuisDevData(): void {
                this.prepareDir();
                let targetFilePath: string = this.getImagePath();
                if (!fs.existsSync(targetFilePath)) {
                    console.log("no screensaver image : " + targetFilePath);
                    return;
                }
                this.imagePath = targetFilePath;
            }

            /**
             * 設定された画像を保存する。
             * @return {CDP.IPromise<string>} 成功時 コンバート後の絶対画像パスを返す。失敗時 nullを返す。
             */
            saveImage() {
                let imageFilePath: string = this.imagePath;
                let outputImagePath = this.getImagePath();

                Model.OffscreenEditor.editImage(imageFilePath, ConstValue.SCREENSAVER_EDIT_IMAGE_PARAMS, outputImagePath)
                    .done((editedImage) => {
                        editedImage.path;
                    }).fail((err) => {
                        console.error("editImage calling failed : err : " + err);
                    });
            }

            static isScreenSaverImage(dstPath: string): boolean {
                let regexp: RegExp = new RegExp(Model.ConstValue.SCREENSAVER_IMAGE_FILE_NAME);
                if (dstPath.match(regexp)) {
                    return true;
                }
                return false;
            }
        }
    }
}

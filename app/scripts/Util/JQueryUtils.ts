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

module Garage {
    export module Util {
        export interface IDataOptions {
            all?: boolean; //! true を指定した場合、すべての要素の deta 属性に値を入れる。それ以外の場合は、先頭の要素の data 属性に値を入れる。
        }

        export class JQueryUtils {


            /**
             * jQuery オブジェクトで選択された DOM の data 属性を取得する。
             * 
             * @param $elem {JQuery} DOM を選択した jQuery
             * @param key {string} data 属性のキー。キーは　data を除いて lowerCammelCase で書く ([例] data-key-value -> keyValue)
             * @return {any} 取得した値
             */
            static data($elem: JQuery, key: string, options?: IDataOptions): any;

            /**
             * jQuery オブジェクトで選択された DOM の data 属性に値を設定する。
             * 
             * @param $elem {JQuery} DOM を選択した jQuery
             * @param key {string} data 属性のキー。キーは　data を除いて lowerCammelCase で書く ([例] data-key-value -> keyValue)
             * @param value {string | number} 設定したい値
             * @pram options {IDataOptions} オプション
             * @return {any} 取得した値
             */
            static data($elem: JQuery, key: string, value: string | number, options?: IDataOptions): void;

            static data($elem: JQuery, key: string, param1?: any | string | number, param2?: IDataOptions): void | any {
                if (!$elem || $elem.length < 1) {
                    return null;
                }

                if (_.isString(param1) || _.isNumber(param1)) {
                    if (param2 && param2.all) {
                        $elem.each((index, elem) => {
                            (<HTMLElement>elem).dataset[key] = param1;
                        });
                    } else {
                        $elem.get(0).dataset[key] = param1;
                    }
                } else {
                    return $elem.get(0).dataset[key];
                }
            }


            static encodeUriValidInCSS(inputUrl: string): string {

                if (inputUrl == null) {
                    console.warn("[JQueryUtils]encodeUriValidInCSS : inputUrl is null");
                    return;
                }

                return this.encodeUriValidInWindowsAndCSS(inputUrl);
            }

            /*
              * CSSのURLが解釈できず、Windowsでは使用可能な文字を、CSSでも有効な文字に変換して返す。
              * @param url{string} cssのbackground-imageに設定する画像のurl
              * @return {string} CSSでも解釈可能なURL
              */
            static encodeUriValidInWindowsAndCSS(inputUrl: string): string {

                if (inputUrl == null) {
                    console.warn("[JQueryUtils]encodeUriValidInWindows : inputUrl is null");
                    return;
                }

                let tmpUrl: string = encodeURI(inputUrl);

                //encodeURIで未サポートの#と'を変換する。
                var regExp1 = new RegExp("\\#", "g");
                tmpUrl = tmpUrl.replace(regExp1, "%23");

                var regExp2 = new RegExp("\\'", "g");
                tmpUrl = tmpUrl.replace(regExp2, "%27");
                return tmpUrl;
            }




            /*
              * encodeUriValidInWindowsAndCSSで変換されたパスを元に戻す
              * @param inputUrl{string} encodeUriValidInWindowsAndCSSで変換されたurl
              * @return {string} encodeUriValidInWindowsAndCSSで変換される前のurl
              */
            static decodeUriValidInWindowsAndCSS(inputUrl: string): string {

                if (inputUrl == null) {
                    console.warn("[JQueryUtils]decodeUriValidInWindowsAndCSS : inputUrl is null");
                    return;
                }

                //encodeURIで未サポートの#と'を変換する。
                var regExp1 = new RegExp("%23", "g");
                inputUrl = inputUrl.replace(regExp1, "#");

                var regExp2 = new RegExp("%27", "g");
                inputUrl = inputUrl.replace(regExp2, "'");

                let tmpUrl: string = decodeURI(inputUrl);

                return tmpUrl;
            }

            /**
             * css の backgrond-image に設定されたURLからパスを取得する。
             * css としてエンコードされていた文字列はデコードされた状態で返す。
             * @param backgroundImageCss {string} background-image の設定値
             * @return パス
             */
            static extractBackgroundImagePathFromCss(backgroundImageCss: string): string {
                if (!backgroundImageCss) {
                    return "";
                }

                let cssPath = JQueryUtils.decodeUriValidInWindowsAndCSS(backgroundImageCss);

                //url("file: から ?xxx" までを抽出。 このとき ?xxx")とすると、ユーザー名に)があったときにバグを起こす。
                let path = cssPath.match(/[^url\("file:\/\/\/][^\?"]*/);
                if (path && path[0]) {
                    return path[0];
                } else {
                    return "";
                }
            }


            /*
              * CSSのURLが解釈できず、Macでは使用可能な文字を、CSSでも有効な文字に変換して返す。
              * @param url{string} cssのbackground-imageに設定する画像のurl
              * @return {string} CSSでも解釈可能なURL
              */
            static encodeUriValidInMacAndCSS(inputUrl: string): string {

                if (inputUrl == null) {
                    console.warn("[JQueryUtils]encodeUriValidInMacAndCSS : inputUrl is null");
                    return;
                }

                let tmpUrl: string = encodeURI(inputUrl);

                //encodeURIで未サポートの#と'を変換する。
                var regExp1 = new RegExp("\\#", "g");
                tmpUrl = tmpUrl.replace(regExp1, "%23");

                var regExp2 = new RegExp("\\'", "g");
                tmpUrl = tmpUrl.replace(regExp2, "%27");
                return tmpUrl;
            }

            //NaNか判定 Number.isNaNが使えないので代用
            static isNaN(v): boolean {
                return v !== v;
            }


            /**
             * margin-topのpx値をnumberとして取得
             * px以外の単位には未対応
             *
             * @param $elem {JQuery} 検査対象エレメント
             * @return {number} margin-topの値
             */
            static getMarginTopPx($elem: JQuery): number {
                let marginTop = $elem.css('margin-top');
                let pxIndex = marginTop.indexOf('px');

                return (pxIndex < 0) ? Number(marginTop) : Number(marginTop.substring(0, pxIndex));

            }


            /**
             * transform の scale値をnumberとして取得
             * x-scaleのみを取得し、y-scaleとの検証は行わない
             *
             * @param $elem {JQuery} 検査対象エレメント
             * @return {number} transform の scale値
             */
            static getScale($elem: JQuery): number {
                let scaleText = $elem.css('transform');
                let matrix = scaleText.match(/[^matrix\(].+[^\)]/);

                if (matrix.length < 0) {
                    return 1;
                } else {
                    let values = matrix[0].split(',');

                    if (values.length < 6) {
                        return 1;
                    } else {
                        return Number(values[0]);
                    }
                }
            }


            /**
             * 値が有効か判定する。
             * @return {boolen} nullでも、"none"でも、""でも、NaNでもない場合、trueを返す。
             */
            static isValidValue(value): boolean {
                if (value == null) {
                    return false;
                } else if (value == "none") {
                    return false;
                } else if (value === "") {
                    return false;
                } else if (Util.JQueryUtils.isNaN(value)) {
                    return false;
                }
                return true;
            }


            /**
             * JQuery要素が有効か判定する
             * @param $target{JQuery}判定対象
             * @return {boolean} 有効な場合、true
             */
            static isValidJQueryElement($target: JQuery): boolean {
                if ($target == null || $target.length == 0) {
                    return false;
                } else {
                    return true;
                }
            }

            /**
             * テキストエリアにフォーカスを移し、カーソルを末尾に移動する。
             * @param {JQuery} $target テキストエリアのJQuery
             */
            static setFocusAndMoveCursorToEnd($target: JQuery) {
                var FUNCTION_NAME = "setFocusAndMoveCursorToEnd";

                if (_.isUndefined($target)) {
                    console.log(FUNCTION_NAME + ": $target is Undefined");
                    return;
                }

                if ($target.attr('type') !== "text") {
                    console.log(FUNCTION_NAME + ": $target is not input[text]");
                    return;
                }

                var remoteName: string = $target.val();
                $target.val("");
                $target.focus();
                $target.val(remoteName);
            }


        }
    }
} 

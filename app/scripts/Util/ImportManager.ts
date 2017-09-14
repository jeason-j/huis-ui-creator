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
        let TAG = "[ImportManager]";
        import IPromise = CDP.IPromise;

        namespace importManagerConstValue {
            export const ALL_DEVICE: string = "all";
        }

        export class ImportManager {

            private filePathDecompressionFile: string; //一時的な作業フォルダのパス
            private hasBluetooth: boolean; //bluetoothのボタンを持っているか否か
            private hasAirconditioner: boolean;//Air conditionerのボタンを持っているか否か
            private needDisplayCautionDialog: boolean; // 注意ダイアログを表示するかどうか

            /*
            *コンストラクター
            */
            constructor() {
                this.filePathDecompressionFile = Util.PathManager.join(GARAGE_FILES_ROOT, "import");
                this.hasAirconditioner = false;
                this.hasBluetooth = false;
                this.needDisplayCautionDialog = false;
            }




            /*
            * インポートを実行する
            * @param callback{Function}インポート実行後に処理されるcallback
            */
            exec(callback?: Function) {
                let FUNCTION_NAME = TAG + "exec : ";

                let options: Util.ElectronOpenFileDialogOptions = {
                    title: PRODUCT_NAME,
                    filters: [{ name: DESCRIPTION_EXTENSION_HUIS_IMPORT_EXPORT_REMOTE, extensions: [EXTENSION_HUIS_IMPORT_EXPORT_REMOTE, EXTENSION_HUIS_IMPORT_EXPORT_REMOTE_B2B] }]
                };
                // ビジネス仕向けの場合、通常用もビジネス用も両方の拡張を読み込める
                if (Util.MiscUtil.isBz()) {
                    options = {
                        title: PRODUCT_NAME,
                        filters: [{ name: DESCRIPTION_EXTENSION_HUIS_IMPORT_EXPORT_REMOTE, extensions: [EXTENSION_HUIS_IMPORT_EXPORT_REMOTE, EXTENSION_HUIS_IMPORT_EXPORT_REMOTE_B2B] }]
                    };
                }

                //インポートするリモコンファイルを選択するダイアログを表示する。
                electronDialog.showOpenFileDialog(
                    options,
                    (files) => {
                        if (!files ||
                            files.length != 1) {
                            return;
                        }

                        let dialog: CDP.UI.Dialog = new CDP.UI.Dialog("#common-dialog-spinner", {
                            src: CDP.Framework.toUrl("/templates/dialogs.html"),
                            title: $.i18n.t("dialog.message.STR_GARAGE_DIALOG_MESSAGE_IN_IMPORTING")
                        });
                        dialog.show();


                        this.deleteTmpFolerAsync()
                            .then(() => {
                                //リモコンファイルを展開する。
                                return ZipManager.decompress(files[0], this.filePathDecompressionFile)

                            }).then(() => {
                                //展開されたフォルダのファイルパス
                                let dirPath = this.filePathDecompressionFile;

                                //展開されたリモコンのremoteIdを取得
                                let decompressedRemoteId = this.getDecompressedRemoteId(dirPath);
                                return this.convertByNewRemoteIdInfo(dirPath, decompressedRemoteId);

                            }).then(() => {
                                //HUISと同期
                                return this.syncToHuis();

                            }).then(() => {

                                // 同期が完了したら、コールバックを呼び出し終了
                                if (callback) {
                                    callback();
                                }

                                //一時フォルダを削除する。
                                this.deleteTmpFolder();

                                //完了を示すダイアログにする。
                                var $dialog = $(".spinner-dialog");
                                var $spinner = $("#common-dialog-center-spinner");

                                $spinner.removeClass("spinner");//アイコンが回転しないようにする。
                                $spinner.css("background-image", 'url("../res/images/icon_done.png")');
                                $dialog.find("p").html($.i18n.t("dialog.message.STR_GARAGE_DIALOG_MESSAGE_IMPORT_DONE"));

                                setTimeout(() => {
                                    dialog.close();

                                    //すぐにダイアログを表示すると、インポートの進捗ダイアログが消えないので、100ms待つ
                                    setTimeout(() => {
                                        this.showCautionDialog();
                                    }, 100);


                                }, DURATION_DIALOG_CLOSE);

                            }).fail((err: Error, errMsg: string) => {
                                let message = (errMsg && errMsg.length != 0) ? errMsg : $.i18n.t("dialog.message.STR_DIALOG_INIT_SYNC_WITH_HUIS_ERROR");

                                //失敗時、一時ファイルを削除する。
                                this.deleteTmpFolder();
                                this.showErrorDialog(err, message, FUNCTION_NAME);
                                dialog.close();
                            })


                    });
            }

            /**
             * リモコンファイルエラー時のエラーメッセージを取得
             */
            static createRemoteFileErrorMessage(): string {
                return $.i18n.t("dialog.message.STR_GARAGE_DIALOG_MESSAGE_IMPORT_FAIL") + $.i18n.t("dialog.message.STR_GARAGE_DIALOG_MESSAGE_IMPORT_REMOTE_FILE_ERROR");
            }

            /*
            * インポートにつかう一時ファイルを削除する。
            */
            deleteTmpFolder() {
                let FUNCTION_NAME = TAG + "deleteTmpFolder : ";
                let syncTask = new Util.HuisDev.FileSyncTask();
                if (fs.existsSync(this.filePathDecompressionFile)) {
                    syncTask.deleteDirectory(this.filePathDecompressionFile);

                }
            }

            /**
             * インポートに使う一時ファイルを非同期に削除する。
             */
            private deleteTmpFolerAsync(): CDP.IPromise<void> {
                let df = $.Deferred<void>();
                let promise = CDP.makePromise(df);

                let syncTask = new Util.HuisDev.FileSyncTask();
                if (fs.existsSync(this.filePathDecompressionFile)) {
                    syncTask.deleteDirectory(this.filePathDecompressionFile, (err) => {
                        if (err) {
                            df.reject();
                        } else {
                            df.resolve();
                        }
                    });
                } else {
                    df.resolve();
                }

                return promise;
            }


            /*
            * HUISと同期する。
            */
            syncToHuis(): IPromise<void> {
                let FUNCTION_NAME = TAG + "syncToHuis : ";
                let df = $.Deferred<void>();
                let promise = CDP.makePromise(df);

                if (HUIS_ROOT_PATH) {
                    let syncTask = new Util.HuisDev.FileSyncTask();
                    syncTask.exec(HUIS_FILES_ROOT, HUIS_ROOT_PATH, false, null, null, (err) => {

                        if (err) {

                            this.showErrorDialog(err, $.i18n.t("dialog.message.STR_DIALOG_INIT_SYNC_WITH_HUIS_ERROR"), FUNCTION_NAME);
                            df.reject(err, $.i18n.t("dialog.message.STR_DIALOG_INIT_SYNC_WITH_HUIS_ERROR"));
                        } else {
                            df.resolve();
                        }
                    });
                }

                return promise;

            }


            /*
             * 失敗時のダイアログを表示する。
             * err {Error} エラー内容
             * functionName {string} エラーが発生したfunction名
             */
            private showErrorDialog(err: Error, errMsg: string, functionName: string) {


                console.error(functionName + err);
                electronDialog.showMessageBox({
                    type: "error",
                    message: errMsg,
                    buttons: [$.i18n.t("dialog.button.STR_DIALOG_BUTTON_OK")],
                    title: PRODUCT_NAME,
                });

            }


            /*
             * 展開されたインポートファイルから、face情報を読み取る。
             * @param  dirPath{string} .faceファイルが格納されているフォルダのパス。
             * @param  fileName {string} .faceファイルの名前
             * @param  decompressedRemoteId{string} 展開されたリモコンのremoteId
             * @return {Model.Face} インポートされたリモコンのface情報
             */
            private readDecompressedFile(dirPath: string, fileName: string, decompressedRemoteId: string): Model.Face {
                let FUNCTION_NAME = TAG + "readDecompressionFile : ";

                if (dirPath == null) {
                    console.warn(FUNCTION_NAME + "dir is invalid");
                    return;
                }

                if (fileName == null) {
                    console.warn(FUNCTION_NAME + "faceFileName is invalid");
                    return;
                }

                if (decompressedRemoteId == null) {
                    console.warn(FUNCTION_NAME + "remoteId is invalid");
                    return;
                }

                //読み込み対象のファイルの.faceファイルのパス
                let facePath = Util.PathManager.join(dirPath, decompressedRemoteId, fileName);

                //対象のデータをModel.Faceとして読み込み
                return huisFiles._parseFace(facePath, decompressedRemoteId, dirPath);
            }


            /*
             * インポート対象のキャッシュをコピーする
             * @param dirPath{string} キャッシュファイルがあるフォルダのパス
             * @param oldRemoteId{string} コピー元のキャッシュファイルのremoteId
             * @param newRemoteId{string} 書き出し時のremoteId
             * @return キャッシュファイルがないときnullを変えす。
             */
            private copyCache(dirPath: string, newRemoteId: string, oldRemoteId: string) {
                let FUNCITON_NAME = TAG + "copyCache : ";

                if (newRemoteId == null) {
                    console.warn(FUNCITON_NAME + "newRemoteId is invalid");
                    return null;
                }

                if (oldRemoteId == null) {
                    console.warn(FUNCITON_NAME + "oldRemoteId is invalid");
                    return null;
                }

                try {
                    //インポート対象のキャッシュファイルを読み込み先
                    let cacheReadFilePath = path.join(dirPath, oldRemoteId, oldRemoteId + "_buttondeviceinfo.cache");
                    if (!fs.existsSync(cacheReadFilePath)) {
                        return null;
                    }

                    //コピー先のファイルパスを作成
                    let outputDirectoryPath: string = Util.PathManager.join(HUIS_FILES_ROOT, newRemoteId);
                    if (!fs.existsSync(outputDirectoryPath)) {// 存在しない場合フォルダを作成。
                        fs.mkdirSync(outputDirectoryPath);
                    }
                    let outputFilePath: string = path.join(outputDirectoryPath, newRemoteId + "_buttondeviceinfo.cache");



                    fs.copySync(cacheReadFilePath, outputFilePath);
                } catch (err) {
                    console.error(FUNCITON_NAME + "error occur : " + err);
                    return null;
                }

            }


            /*
             * インポート対象のファイルを、一時的な作業directoryにコピーする
             * @param targetFilePath{string} インポート対象として指定されたファイルのパス
             */
            copyTargetFiles(targetFilePath: string) {
                let FUNCTION_NAME = TAG + "copyTargetFiles : ";

                if (targetFilePath == null) {
                    console.warn(FUNCTION_NAME + "targetFilePath is invalid");
                    return;
                }

                //TODO:targetFilePathのファイルをすべて、 filePathDecompressionFileにコピー
            }



            /*
             * 展開されたファイルのフォルダ名から、圧縮前のremoteIdを取得する
             * 圧縮前のフォルダ名がremoteIdを表している。
             * @param dirPathDecompressedFile{string} 展開されたフォルダ名のパス
             * @return {string} 展開されたリモコンのremoteIdを返す。みつからない場合nullを返す。
             */
            private getDecompressedRemoteId(dirPathDecompressedFile: string): string {
                let FUNCTION_NAME = TAG + "getDecompressedRemoteId : ";

                let remoteId = null;
                let names = fs.readdirSync(dirPathDecompressedFile);

                //ひとつもファイル・フォルダがみつからない場合
                if (names.length < 0) {
                    console.warn(FUNCTION_NAME + "there is no file in " + dirPathDecompressedFile);
                    return null;
                }

                //ファイル・フォルダが一つ以外の場合、(フォーマット的にはremoteIdと同名のフォルダがひとつあるのみなはず)
                if (names.length != 1) {
                    console.warn(FUNCTION_NAME + "there is too many file in " + dirPathDecompressedFile);
                    return null;
                } else if (names.length == 1) {
                    //フォルダ名から、remoteIdを取得する。
                    remoteId = names[0];
                }

                return remoteId;
            }


            /*
             * ファイル・フォルダ・モジュールのうち、ふるいremoteIdが書かれた箇所を新しいremoteIdに書き換える。
             * @param dirPath {string} 展開されたフォルダのパス
             * @param decompressRemoteId {string} 展開されたリモコンのremoteId
             */
            private convertByNewRemoteIdInfo(dirPath: string, decompressRemoteId: string): IPromise<void> {
                let df = $.Deferred<void>();
                let promise = CDP.makePromise(df);

                let FUNCTION_NAME = TAG + "convertByNewRemoteIdInfo : ";

                //新しいremoteIdを取得
                //このとき、huisFilesの管理するリストにも、登録されてるので注意。途中で失敗した場合、削除する必要がある。
                let newRemoteId = huisFiles.createNewRemoteId();

                //画像をコピー
                //コピー元のファイルパス ：展開されたリモコン のremoteImages
                let oldRemoteId: string = decompressRemoteId;
                let src: string = Util.PathManager.join(dirPath, oldRemoteId, "remoteimages", oldRemoteId);
                //コピー先のファイルパス : HuisFiles以下のremoteImages
                let dst: string = Util.PathManager.join(HUIS_REMOTEIMAGES_ROOT, newRemoteId);
                if (!fs.existsSync(dst)) {// 存在しない場合フォルダを作成。
                    fs.mkdirSync(dst);
                }
                let syncTask = new Util.HuisDev.FileSyncTask();
                try {
                    //画像のコピーの実行
                    syncTask.copyFilesSimply(src, dst, () => {

                        //キャッシュファイルをコピー
                        this.copyCache(dirPath, newRemoteId, decompressRemoteId);

                        let faceFileName = decompressRemoteId + ".face";
                        let face: Model.Face = this.readDecompressedFile(dirPath, faceFileName, decompressRemoteId);

                        let masterFacefileName = "master_" + decompressRemoteId + ".face";
                        let masterFace: Model.Face = this.readDecompressedFile(dirPath, masterFacefileName, decompressRemoteId);

                        //faceを変換してコピー
                        this.convertAndOutputFace(face, newRemoteId)
                            .then(() => {

                                //masterFaceがある場合、masterFaceもコピー
                                if (masterFace != null) {
                                    return this.convertAndOutputFace(masterFace, newRemoteId, true);
                                } else {
                                    df.resolve();
                                }

                            }).done(() => {
                                df.resolve();
                            }).fail((err) => {
                                df.reject(err);
                            });

                    });
                } catch (err) {
                    console.error(FUNCTION_NAME + err);
                    df.reject(err, ImportManager.createRemoteFileErrorMessage());
                }


                return promise;

            }


            /*
             * 入力されたfaceモデルをインポート後に適した形に変換・書き出しする。
             * @param face{Model.Face} インポートするリモコンのFace
             * @param newRemoteId {string} インポート後のリモートID
             * @param isMaster{boolean} マスターFaceか否か分別する。入力がない場合、false
             */
            private convertAndOutputFace(oldFace: Model.Face, newRemoteId: string, isMaster: boolean = false): IPromise<void> {

                let FUNCTION_NAME = TAG + "convertAndOutputFace : ";

                if (oldFace == null) {
                    console.error(FUNCTION_NAME + "oldFace is null.");
                    return;
                }

                if (newRemoteId == null) {
                    console.error(FUNCTION_NAME + "newRemoteId is null.");
                    return;
                }

                let df = $.Deferred<void>();
                let promise = CDP.makePromise(df);

                let convertedFace: Model.Face = $.extend(true, {}, oldFace);

                //face名を変更
                convertedFace.remoteId = newRemoteId;


                if (convertedFace.modules == null) {
                    console.error("modules not found. remoteId: " + oldFace.remoteId);
                    df.reject("modules not found. remoteId: " + oldFace.remoteId, ImportManager.createRemoteFileErrorMessage());
                    return promise;
                }
                //module内の情報を更新
                for (let i = 0; i < convertedFace.modules.length; i++) {

                    //module内のremoteIdを更新
                    convertedFace.modules[i].remoteId = newRemoteId;

                    // pickup remote may have same module name with different remoteId,
                    // so leave name as it is in case of name confliction
                    //     e.g. "0000_guide_power.module" and "0001_guide_power.module"
                    if (convertedFace.category !== DEVICE_TYPE_CUSTOM) {
                        //module名を変更。先頭のremoteIdのみ新しいremoteIdと入れ替える。
                        let newModuleName: string = oldFace.modules[i].name;
                        newModuleName = newRemoteId + "_" + newModuleName.substr(newModuleName.indexOf("_") + 1);
                        convertedFace.modules[i].name = newModuleName;
                    }

                    //module内のbuttonのimageのfilePathを変更。
                    convertedFace.modules[i].button = this.convertButtonsFilePath(convertedFace.modules[i].button, newRemoteId);

                    //module内のimageのfilePathを変更。
                    convertedFace.modules[i].image = this.convertImagesFilePath(convertedFace.modules[i].image, newRemoteId);

                }

                //諸注意ダイアログが必要かどうか
                this.needDisplayCautionDialog = this.isIncludeSpecificCategoryButton(oldFace, importManagerConstValue.ALL_DEVICE);

                //インポートしたリモコンが注意が必要なカテゴリーを持っているかチェック
                this.hasBluetooth = this.isIncludeSpecificCategoryButton(oldFace, DEVICE_TYPE_BT);
                this.hasAirconditioner = this.isIncludeSpecificCategoryButton(oldFace, DEVICE_TYPE_AC);

                try {
                    huisFiles.updateFace(
                        convertedFace,
                        null,
                        true,
                        null,
                        isMaster).then(() => {
                            df.resolve();
                        }).fail((err) => {
                            df.reject(err);
                        });

                } catch (err) {
                    console.error(FUNCTION_NAME + err);
                    df.reject(err, ImportManager.createRemoteFileErrorMessage());
                }

                return promise;
            }

            /*
            * Face中に入力したカテゴリーボタンがあるかチェックする
            * @param face {Model.Face} チェック対象
            * @param category {string} チェックしたい対象カテゴリー
            * @return {boolean} カテゴリを含んでいるときtrue, 含んでいないときfalse
            */
            private isIncludeSpecificCategoryButton(face: Model.Face, category: string): boolean {
                let FUNCTION_NAME = TAG + "isIncludeAircondition : ";

                if (face == null) {
                    console.warn(FUNCTION_NAME + "face is invalid");
                    return;
                }

                if (category == null) {
                    console.warn(FUNCTION_NAME + "category is invalid");
                    return;
                }

                //モジュールがひとつもないとき含んでいないとみなす。
                let targetModules: Model.Module[] = face.modules;
                if (targetModules == null || targetModules.length == 0) {
                    return false;
                }

                for (let module of targetModules) {

                    //ターゲットのボタンがないとき、次のmoduleをチェック。
                    let targetButtons: Model.ButtonItem[] = module.button;
                    if (targetButtons == null || targetButtons.length == 0) {
                        continue;
                    }

                    // 全カテゴリが対象で、ボタンがある場合は含んでいるとみなす
                    if (category == importManagerConstValue.ALL_DEVICE
                        && targetButtons.length != 0) {
                        return true;
                    }

                    for (let button of targetButtons) {

                        //ターゲットのステートがないとき、次のボタンをチェック
                        let targetStates: Model.ButtonState[] = button.state;
                        if (targetStates == null || targetStates.length == 0) {
                            continue;
                        }

                        for (let state of targetStates) {

                            //ターゲットのアクションがないとき、次のステートをチェック
                            let targetActions = state.action;
                            if (targetActions == null || targetActions.length == 0) {
                                continue;
                            }
                            for (let action of targetActions) {

                                let targetAction = action;
                                if (targetAction != null) {
                                    //入力したカテゴリと一致するdevice_typeがあるときtrueを返す。
                                    if (targetAction.code_db != null
                                        && targetAction.code_db.device_type != null
                                        && targetAction.code_db.device_type == category) {
                                        return true;
                                    }//end if

                                    //categoryがbluetoothのときは特殊対応。bluetooth_dataがあるとき、true
                                    if (category == DEVICE_TYPE_BT
                                        && targetAction.bluetooth_data != null) {
                                        return true;
                                    }

                                }
                            }
                        }
                    }
                }

                return false;
            }


            /*
            * インポート後のユーザーに対しての諸注意をダイアログで知らせる。
            */
            private showCautionDialog() {
                let FUNCTION_NAME = TAG + "showCautionDialog :";

                // ダイアログを表示する必要がない場合は表示しない
                if (!this.needDisplayCautionDialog) {
                    return;
                }

                ///チェックすべき項目がない場合、エラーを表示
                if (this.hasAirconditioner == null) {
                    console.error(FUNCTION_NAME + "hasAirconditioner is null");
                    console.error(FUNCTION_NAME + "please check imported remote whether those category button exist");
                    this.hasAirconditioner = false;
                }
                if (this.hasBluetooth == null) {
                    console.error(FUNCTION_NAME + "hasBluetooth is null");
                    console.error(FUNCTION_NAME + "please check imported remote whether those category button exist");
                    this.hasBluetooth = false;
                }


                let dialogMessage: string = $.i18n.t("dialog.message.STR_DIALOG_MESSAGE_IMPORT_AFTER");

                //エアコンを含むとき、メッセージを追加
                if (this.hasAirconditioner) {
                    dialogMessage += $.i18n.t("dialog.message.STR_DIALOG_MESSAGE_IMPORT_AFTER_AC");
                }

                //Bluetoothを含むとき、メッセージを追加
                if (this.hasBluetooth) {
                    dialogMessage += $.i18n.t("dialog.message.STR_DIALOG_MESSAGE_IMPORT_AFTER_BT");
                }


                electronDialog.showMessageBox({
                    type: "info",
                    message: dialogMessage,
                    buttons: [$.i18n.t("dialog.button.STR_DIALOG_BUTTON_OK")],
                    title: PRODUCT_NAME,
                });
            }



            /*
             * Model.ImageItem内のpathをを新しいremoteIdのものに変更する。
             * @param images{Model.ImageItem[]} pathを変更する対象
             * @param newRemoteId{string} 変更後のpathに入力するremoteId
             * @return {Model.ImageItems[]} pathを変更した後のModel.ImageItems
             */
            private convertImagesFilePath(images: Model.ImageItem[], newRemoteId: string): Model.ImageItem[] {
                let FUNCTION_NAME: string = TAG + "convertImagesFilePath : ";

                if (images == null) {
                    console.warn(FUNCTION_NAME + "images is invalid");
                    return [];
                }

                if (newRemoteId == null) {
                    console.warn(FUNCTION_NAME + "newRemoteId is invalid");
                    return [];
                }

                let result: Model.ImageItem[] = $.extend(true, [], images);

                for (let image of result) {
                    image.path = this.convertFilePath(image.path, newRemoteId);
                    let extensions = image.garageExtensions;
                    if (extensions != null) {
                        extensions.original = this.convertFilePath(extensions.original, newRemoteId);
                        extensions.resolvedOriginalPath = this.convertFilePath(extensions.resolvedOriginalPath, newRemoteId);
                        image.garageExtensions = extensions;
                    }
                }

                return result;
            }



            /*
             * Model.ButtonItem内のModel.ImageItemのpathを新しいremoteIdのものに変更する。
             * @param buttons{Model.ButtonItem[]} pathを変更する対象
             * @param newRemoteId{string} 変更後のpathに入力するremoteId
             * @return {Model.ImageItems[]} pathを変更した後のModel.ImageItems
             */
            private convertButtonsFilePath(buttons: Model.ButtonItem[], newRemoteId: string): Model.ButtonItem[] {
                let FUNCTION_NAME: string = TAG + "convertButtonFilePath : ";

                if (buttons == null) {
                    console.warn(FUNCTION_NAME + "buttons is invalid");
                    return [];
                }

                if (newRemoteId == null) {
                    console.warn(FUNCTION_NAME + "newRemoteId is invalid");
                    return [];
                }


                let result: Model.ButtonItem[] = $.extend(true, [], buttons);

                for (let button of result) {
                    if (button.state != null && button.state.length > 0) {
                        for (let state of button.state) {
                            state.image = this.convertImagesFilePath(state.image, newRemoteId);
                        }
                    }
                }

                return result;
            }

            /**
             * pathを新しいremoteIdのものに変更する。親のフォルダの名前を古いremoteIdから新しいremoteIdにする。
             * @param inputPath{string} もともとのパス
             * @param newRemoteId{string} 変更後のpathに入力するremoteId
             * @return {string} 変更後のpath.失敗したとき、nullを返す。変換する親のフォルダがないときそのまま返す。
             */
            private convertFilePath(inputPath: string, newRemoteId: string): string {
                let FUNCTION_NAME: string = TAG + "convertFilePath : ";

                if (inputPath == null) {
                    console.warn(FUNCTION_NAME + "inputPath is invalid");
                    return null;
                }

                if (newRemoteId == null) {
                    console.warn(FUNCTION_NAME + "newRemoteId is invalid");
                    return null;
                }

                let basename = path.basename(inputPath);
                let dirname = path.dirname(inputPath);

                let result: string = inputPath;
                if (PathManager.isRemoteDir(inputPath)) {
                    result = newRemoteId + "/" + basename;
                }

                return result;
            }
        }
    }
}

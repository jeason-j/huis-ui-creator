/*
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

var {app, BrowserWindow, crashReporter} = require('electron');
// アプリの生存期間をコントロールするモジュール
// ネイティブのブラウザウィンドウを作るためのモジュール           
// 及びクラッシュレポーターをrequireする

// クラッシュレポートを送るための設定 // 受け取り先がないのでコメントアウトしておく
//crashReporter.start({
//    productName: 'HUIS UI CREATOR',
//    companyName: 'Sony Corporation',
//    submitURL: 'https://your-domain.com/url-to-submit',
//    autoSubmit: false
//});


// ウィンドウオブジェクトをグローバル宣言する
// JavaScript のオブジェクトが GC されたときにウィンドウが閉じてしまうため
var mainWindow = null;

var shouldQuit = app.makeSingleInstance(function(argv, workingDirectory) {
    if(mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
});

if (shouldQuit) {
    app.quit();
}

// すべてのウィンドウが閉じられたら終了
app.on('window-all-closed', function() {
    // OSXでもwindowを閉じる際にUI Creatorを終了する
    app.quit();
});

// Electron の初期化が終わってブラウザウィンドウを作る準備ができたら呼ばれる
app.on('ready', function() {
    // ブラウザウィンドウを作る

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        //minWidth :  1280,
        //minHeight :768,
        icon:  __dirname + '/app/huis-favicon.png',
        title: 'HUIS UI CREATOR'
    });

    // アプリの index.html をロードする
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // garage.exe と同じディレクトリーに "debug" があれば devtools を開く
    var fs = require("fs");
    if (fs.existsSync("debug")) {
        mainWindow.openDevTools();
    }

    // ウィンドウが閉じられたら実行
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
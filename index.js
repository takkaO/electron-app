"use strict";

/* Load Electron */
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
/* Load my modules */
const myMqtt = remote.require('./myMqtt.js');
const mySerial = remote.require('./mySerial.js');
const myParser = remote.require('./myParser.js');

/* HTML elements */
const button = document.getElementById('test_btn');
const serialButton = document.getElementById('checkbox1');
const connectButton = document.getElementById('connect_btn');
const txtarea = document.getElementById('txtarea1');
const txtarea2 = document.getElementById('txtarea2');
const sel = document.getElementById("sel_test");
const selBaudRate = document.getElementById("sel_baudrate");
const transButton = document.getElementById('trans');
const testPubButton = document.getElementById('testpub_btn');

/* Global variables */
var transferFlag;

function initialize(){
	transferFlag = false;
	initSerialPortsList();
}

function initSerialPortsList(){
	// 選択ボックスをクリア
	var selects = document.getElementById("sel_test");
	var length = selects.options.length;
	for (var i = length - 1; 0 <= i; i--) {
		// 逆順でないとうまくいかないので注意
		selects.options[i].selected = false;
		selects.options[i] = null;
	}
	// クリア完了
	// 未選択の選択肢を追加
	let op = document.createElement("option");
	op.value = "None";
	op.text = "None";
	document.getElementById("sel_test").appendChild(op);
	selects.options[0].selected = true;	// Noneを選択状態に
}

function updateSerialPortsList(ports){
	initSerialPortsList();

	ports.forEach((port) => {
		// 選択欄に追加
		// マルチバイト文字は化ける
		let op = document.createElement("option");
		op.value = port.comName;
		op.text = port.manufacturer + " (" + port.comName + ")";
		document.getElementById("sel_test").appendChild(op);
	});
}

function updateSerialConsole(identifier, msg){
	switch(identifier){
		case "open":
			txtarea.value = "[Info] " + msg + "\n";
			break;
		case "close":
			txtarea.value += "\n[Info] " + msg;
			break;
		case "error":
			txtarea.value += "\n[Error] " + msg + "\n";
			break;
		case "data":
			txtarea.value += msg + "\n";
			break;
		case "clear":
			txtarea.value = "";
			break;
		default:
			txtarea.value += msg + "\n";
	}

	/* 最大履歴の管理 */
	const maxLength = 10000;
	if (txtarea.value.length > maxLength){
		var len = txtarea.value.length - maxLength;
		var tmp = txtarea.value;
		txtarea.value = tmp.slice(len);
	}
	// スクロールを最下部に移動
	txtarea.scrollTop = txtarea.scrollHeight;
}

function transferSerial2MQTT(serialMsg){
	if (myMqtt.isConnected() === false){
		return;
	}
	if (transferFlag === false){
		return;
	}

	var data = myParser.parse(serialMsg);
	if (data === null){
		return;
	}
	myMqtt.publish(data.topic, data.payload);
}

function updateMqttConsole(identifier, msg){
	switch (identifier) {
		case "connect":
			txtarea2.value = "[Info] " + msg + "\n";
			break;
		case "disconnect":
			txtarea2.value += "\n[Info] " + msg;
			break;
		case "error":
			txtarea2.value += "\n[Error] " + msg + "\n";
			break;
		case "publish":
			txtarea2.value += "[Info] " + msg + "\n";
			break;
		case "clear":
			txtarea2.value = "";
			break;
		default:
			txtarea2.value += msg + "\n";
	}

	/* 最大履歴の管理 */
	const maxLength = 10000;
	if (txtarea2.value.length > maxLength) {
		var len = txtarea2.value.length - maxLength;
		var tmp = txtarea2.value;
		txtarea2.value = tmp.slice(len);
	}
	// スクロールを最下部に移動
	txtarea2.scrollTop = txtarea2.scrollHeight;
}

function openSerialPort(){
	var portName = sel.options[sel.selectedIndex].value;
	if (portName === 'None') {
		serialButton.checked = false;
		return;
	}
	// ポート選択と更新をロック
	sel.disabled = true;
	button.disabled = true;
	selBaudRate.disabled = true;

	// シリアル接続開始
	// TODO: ここに関数を追加（mySerialを呼び出し）
	var baud = selBaudRate.options[selBaudRate.selectedIndex].value;
	mySerial.attachSerialPort(portName, Number(baud));
}

function closeSerialPort(){
	mySerial.detachSerialPort();
	// ポート選択と更新をアンロック
	sel.disabled = false;
	button.disabled = false;
	selBaudRate.disabled = false;
}

function mqttConnect(){
	// 入力もDisableにする
	myMqtt.connect(broker.value, Number(port.value));
	transButton.disabled = false;
}

function mqttDisconnect(){
	myMqtt.disconnect();
	transButton.checked = false;
	transferFlag = false;
	transButton.checked = false;
	transButton.disabled = true;
}


/***********
 * イベント処理
************ */

ipcRenderer.on("ch_serialport_show", function (evt, identifier, msg){
	updateSerialConsole(identifier, msg);
	
	// 転送するかチェック
	// MQTT側へ送信
	transferSerial2MQTT(msg);
	
});

ipcRenderer.on("ch_mqtt", function (evt, identifier, msg){
	updateMqttConsole(identifier, msg);
});

ipcRenderer.on("ch_serialport_info", function (evt, ports){
	updateSerialPortsList(ports);
});

connectButton.addEventListener('change', function (){
	if (this.checked){
		mqttConnect();
	}
	else{
		mqttDisconnect();
	}
});


button.addEventListener('click', function(clickEvent){
	mySerial.fetchSerialPortInfo();
});

serialButton.addEventListener('change', function(){
	if (this.checked){
		openSerialPort();
	}
	else{
		closeSerialPort();
	}
});

transButton.addEventListener('change', function (){
	if (this.checked){
		transferFlag = true;
	}
	else{
		transferFlag = false;
	}
});

testPubButton.addEventListener("click", function(){
	myMqtt.publish("test", "testPubOK");
});

// window読み込み完了時に呼び出し
window.onload = function (){
	initialize();
	// シリアルポート情報を初期化
	mySerial.fetchSerialPortInfo();	
}

window.onbeforeunload = function (){
	myMqtt.disconnect();
	// シリアルポートを明示的に開放
	mySerial.detachSerialPort();
}

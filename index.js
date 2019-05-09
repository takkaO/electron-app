"use strict";

/* Load Electron */
const ipcRenderer = window.ipcRenderer;
const remote = window.remote;
/* Load my modules */
const myMqtt = remote.require('./myMqtt.js');
const mySerial = remote.require('./mySerial.js');
const myParser = remote.require('./myParser.js');

/* HTML elements */
const updateComPortButton = document.getElementById('test_btn');
const selectComPort = document.getElementById("sel_test");
const selectBaudRate = document.getElementById("sel_baudrate");
const startGetSerialDataToggle = document.getElementById('checkbox1');
const serialConsole = document.getElementById('txtarea1');

const connectButton = document.getElementById('connect_btn');
const mqttConsole = document.getElementById('txtarea2');
const transferSerial2MqttToggle = document.getElementById('trans');
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
			serialConsole.value = "[Info] " + msg + "\n";
			break;
		case "close":
			serialConsole.value += "\n[Info] " + msg;
			break;
		case "error":
			serialConsole.value += "\n[Error] " + msg + "\n";
			break;
		case "data":
			serialConsole.value += msg + "\n";
			break;
		case "clear":
			serialConsole.value = "";
			break;
		default:
			serialConsole.value += msg + "\n";
	}

	/* 最大履歴の管理 */
	const maxLength = 10000;
	if (serialConsole.value.length > maxLength){
		var len = serialConsole.value.length - maxLength;
		var tmp = serialConsole.value;
		serialConsole.value = tmp.slice(len);
	}
	// スクロールを最下部に移動
	serialConsole.scrollTop = serialConsole.scrollHeight;
}

function transferSerial2Mqtt(serialMsg){
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
			mqttConsole.value = "[Info] " + msg + "\n";
			transferSerial2MqttToggle.disabled = false;
			break;
		case "disconnect":
			mqttConsole.value += "\n[Info] " + msg;
			break;
		case "error":
			mqttConsole.value += "\n[Error] " + msg + "\n";
			mqttDisconnect();
			connectButton.checked = false;
			break;
		case "publish":
			mqttConsole.value += "[Info] " + msg + "\n";
			break;
		case "clear":
			mqttConsole.value = "";
			break;
		default:
			mqttConsole.value += msg + "\n";
	}

	/* 最大履歴の管理 */
	const maxLength = 10000;
	if (mqttConsole.value.length > maxLength) {
		var len = mqttConsole.value.length - maxLength;
		var tmp = mqttConsole.value;
		mqttConsole.value = tmp.slice(len);
	}
	// スクロールを最下部に移動
	mqttConsole.scrollTop = mqttConsole.scrollHeight;
}

function openSerialPort(){
	var portName = selectComPort.options[selectComPort.selectedIndex].value;
	if (portName === 'None') {
		startGetSerialDataToggle.checked = false;
		return;
	}
	// ポート選択と更新をロック
	selectComPort.disabled = true;
	updateComPortButton.disabled = true;
	selectBaudRate.disabled = true;

	// シリアル接続開始
	// TODO: ここに関数を追加（mySerialを呼び出し）
	var baud = selectBaudRate.options[selectBaudRate.selectedIndex].value;
	mySerial.attachSerialPort(portName, Number(baud));
}

function closeSerialPort(){
	mySerial.detachSerialPort();
	// ポート選択と更新をアンロック
	selectComPort.disabled = false;
	updateComPortButton.disabled = false;
	selectBaudRate.disabled = false;
}

function mqttConnect(){
	// 入力もDisableにする
	myMqtt.connect(broker.value, Number(port.value));
}

function mqttDisconnect(){
	myMqtt.disconnect();
	transferSerial2MqttToggle.checked = false;
	transferFlag = false;
	transferSerial2MqttToggle.checked = false;
	transferSerial2MqttToggle.disabled = true;
}


/***********
 * イベント処理
************ */
ipcRenderer.on("ch_serialport_show", function (evt, identifier, msg){
	updateSerialConsole(identifier, msg);
	
	// 転送するかチェック
	// MQTT側へ送信
	transferSerial2Mqtt(msg);
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


updateComPortButton.addEventListener('click', function(clickEvent){
	mySerial.fetchSerialPortInfo();
});

startGetSerialDataToggle.addEventListener('change', function(){
	if (this.checked){
		openSerialPort();
	}
	else{
		closeSerialPort();
	}
});

 transferSerial2MqttToggle.addEventListener('change', function (){
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
window.addEventListener("load", function() {
	initialize();
	// シリアルポート情報を初期化
	mySerial.fetchSerialPortInfo();	
});

// window終了前に実行
window.addEventListener("beforeunload", function(){
	// シリアルポートを明示的に開放
	mySerial.detachSerialPort();
});


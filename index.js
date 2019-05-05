"use strict";

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const mymqtt = remote.require('./mymqtt.js');
const myserial = remote.require('./myserial.js');


const button = document.getElementById('test_btn');
const serialButton = document.getElementById('checkbox1');
const connectButton = document.getElementById('connect_btn');
const txtarea = document.getElementById('txtarea1');
const txtarea2 = document.getElementById('txtarea2');
const sel = document.getElementById("sel_test");
const selBaudRate = document.getElementById("sel_baudrate");

let op = document.createElement("option");
op.value = "None";
op.text = "None";
document.getElementById("sel_test").appendChild(op);

ipcRenderer.on("ch_serialport_show", function (evt, msg){
	// myserial側でメッセージを構築するようにする
	if (msg === "open"){
		txtarea.value = "[Info] Serial port open.\n";
	}
	else if(msg === "close"){
		txtarea.value += "\n[Info] Serial port close.";
	}
	else{
		txtarea.value += msg + "\n";
	}

	// 転送するかチェック
	// もしオンならデータパーサー.jsでreturnをもらう
	// MQTT側へ送信
});

ipcRenderer.on("ch_mqtt_clear", function (evt){
	txtarea2.value = "";
});

ipcRenderer.on("ch_mqtt", function (evt, msg){
	txtarea2.value += msg;
});

ipcRenderer.on("ch_serialport_info", function (evt, ports){
	// 選択ボックスをクリア
	var selects = document.getElementById("sel_test");
	var length = selects.options.length;
	for(var i=length-1; 0<=i; i--){
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
	ports.forEach((port) => {
		// 選択欄に追加
		//console.log(port);
		//txtarea.value += port.comName;
		let op = document.createElement("option");
		op.value = port.comName;
		op.text = port.manufacturer + " (" + port.comName + ")";
		document.getElementById("sel_test").appendChild(op);
	});
	
});

connectButton.addEventListener('click', function(evt){
	mymqtt.mqttConnect(broker.value, port.value);
});

button.addEventListener('click', function(clickEvent){
	//log.info("Clicked");
	//document.write("Clicked");
	//console.log('OK');
	//txtarea.value += "Clicked!おっけ～\n";

	myserial.fetchSerialPortInfo();
});

serialButton.addEventListener('change', function(){
	if (this.checked){
		var portName = sel.options[sel.selectedIndex].value;
		if (portName === 'None'){
			serialButton.checked = false;
			return;
		}
		// ポート選択と更新をロック
		sel.disabled = true;
		button.disabled = true;
		selBaudRate.disabled = true;

		// シリアル接続開始
		// TODO: ここに関数を追加（myserialを呼び出し）
		var baud = selBaudRate.options[selBaudRate.selectedIndex].value;
		myserial.attachSerialPort(portName, Number(baud));
	}
	else{
		myserial.detachSerialPort();
		// ポート選択と更新をアンロック
		sel.disabled = false;
		button.disabled = false;
		selBaudRate.disabled = false;
	}
	
});

// window読み込み完了時に呼び出し
window.onload = function (){
	// シリアルポート情報を初期化
	myserial.fetchSerialPortInfo();
}

window.onbeforeunload = function (){
	// シリアルポートを明示的に開放
	myserial.detachSerialPort();
}

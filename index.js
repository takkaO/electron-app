"use strict";

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const mymqtt = remote.require('./mymqtt.js');
const myserial = remote.require('./myserial.js');


const button = document.getElementById('test_btn');
const connectButton = document.getElementById('connect_btn');
const txtarea = document.getElementById('txtarea1');
const txtarea2 = document.getElementById('txtarea2');
const sel = document.getElementById("sel_test");



ipcRenderer.on("ch_mqtt_clear", function (evt){
	txtarea2.value = "";
});

ipcRenderer.on("ch_mqtt", function (evt, msg){
	txtarea2.value += msg;
});

ipcRenderer.on("ch_serialport_info", function (evt, ports){
	ports.forEach((port) => {
		// 選択欄に追加
		txtarea.value += port.comName;
	});
	
});

connectButton.addEventListener('click', function(evt){
	mymqtt.mqttConnect(broker.value, port.value);
});

button.addEventListener('click', function(clickEvent){
	//log.info("Clicked");
	//document.write("Clicked");
	console.log('OK');
	txtarea.value += "Clicked!おっけ～\n";

	myserial.fetchSerialPortInfo();
});

sel.addEventListener('click', function(evt){
	let op = document.createElement("option");
	op.value = "01";
	op.text = "hello";
	document.getElementById("sel_test").appendChild(op);
});


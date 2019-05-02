"use strict";

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const mymqtt = remote.require('./mqtt.js');

console.log('test');
const button = document.getElementById('test_btn');
const connectButton = document.getElementById('connect_btn');
const txtarea = document.getElementById('txtarea1');
const txtarea2 = document.getElementById('txtarea2');
const sel = document.getElementById("sel_test");

/*
const serialPort = require("serialport");
serialPort.list(function(err, ports) {
	console.log(ports);
	ports.forEach(function(port){
	  console.log(port);
	});
});
*/

ipcRenderer.on("ch_mqtt_clear", function (evt){
	txtarea2.value = "";
});

ipcRenderer.on("ch_mqtt", function (evt, msg){
	txtarea2.value += msg;
});

ipcRenderer.on('channel-hoge', (evt, msg) => {
	console.log("OKOKOK");
	txtarea.value = msg;
});

connectButton.addEventListener('click', function(evt){
	mymqtt.mqttConnect(broker.value, port.value);
});

button.addEventListener('click', function(clickEvent){
	//log.info("Clicked");
	//document.write("Clicked");
	console.log('OK');
	txtarea.value += "Clicked!おっけ～\n";
	
	/*
	serialPort.list(function(err, ports){
		ports.forEach(function(port){
			console.log(port);
		});
	});
	*/
});

sel.addEventListener('click', function(evt){
	let op = document.createElement("option");
	op.value = "01";
	op.text = "hello";
	document.getElementById("sel_test").appendChild(op);
});


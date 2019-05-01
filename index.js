"use strict";

const electron = require('electron');
const remote = electron.remote;
const mymqtt = remote.require('./mqtt.js');

console.log('test');
const button = document.getElementById('test_btn');
const txtarea = document.getElementById('txtarea1');
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

console.log('test OK');
button.addEventListener('click', function(clickEvent){
	//log.info("Clicked");
	//document.write("Clicked");
	console.log('OK');
	txtarea.value += "Clicked!おっけ～\n";
	mymqtt.testout(function(ret){
		console.log(ret);
	});
	var ret = mymqtt.mqttConnect("localhost");
	console.log(ret);
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

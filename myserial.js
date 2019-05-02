"use strict";

const {remote, BrowserWindow} = require('electron');
var mainWindow = BrowserWindow.getFocusedWindow();
const serialPort = require("serialport");

/*
function(err, ports) {
	//console.log(ports);
	ports.forEach(function(port){
	  console.log(port.comName);
	});
}
*/
function callbackSerialPortInfo(ports){
	//console.log(ports);
	// ipcでレンダに送る
	mainWindow.webContents.send('ch_serialport_info', ports);
}

var getSerialPortInfo = function(callback) {
	serialPort.list(function(err, ports){
		callback(ports);
	});
}

const serialUtils = {
	testout: function (){
		console.log("Hello");
		
		getSerialPortInfo(callbackSerialPortInfo);

		return "OKOK";
	},
	fetchSerialPortInfo: function (){
		getSerialPortInfo(callbackSerialPortInfo);
	}
};

module.exports = serialUtils;

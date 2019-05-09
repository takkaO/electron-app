"use strict";

const {remote, BrowserWindow} = require('electron');
var mainWindow = BrowserWindow.getFocusedWindow();
const serialPort = require("serialport");
const Readline = require('@serialport/parser-delimiter');
var port = null;
var parser = null;

function callbackSerialPortInfo(ports){
	//console.log(ports);
	// レンダに送る
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
	},

	attachSerialPort: function(comName, baudrate){
		port = new serialPort(comName, {
			baudRate: baudrate,
			dataBits: 8,
			stopBits: 1,
			parity: "none",
		});

		parser = port.pipe(new Readline({delimiter: '\n'}));

		parser.on('data', data => mainWindow.webContents.send('ch_serialport_show', "data", String(data)));
		
		port.on("open", function(){
			var msg = "Serial port open.";
			mainWindow.webContents.send('ch_serialport_show', "open", msg);
		});

		port.on("close", function(){
			var msg = "Serial port close.";
			mainWindow.webContents.send('ch_serialport_show', "close", msg);
		});

		port.on("error", function(err){
			mainWindow.webContents.send('ch_serialport_show', "error", err.message + "\n");
		});
		
	},

	detachSerialPort: function(){
		if (port === null){
			return;
		}
		port.close();
		port = null; //必要ないかも
		//console.log("close");
	}
};

module.exports = serialUtils;

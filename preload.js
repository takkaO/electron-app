"use strict";

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;

// add global variables to your web page
function initRendererNodejs() {
	global.isElectron = true;
	global.ipcRenderer = ipcRenderer;
	global.remote = remote;
	// also OK
	//window.isElectron = true;
	//window.ipcRenderer = ipcRenderer;
}

initRendererNodejs();
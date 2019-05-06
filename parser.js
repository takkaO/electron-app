"use strict";

const parserUtils = {
	testout: function (msg){
		console.log("Hello");
		return {
            topic: "test",
            payload: "test payload OK: " + msg
        };
	},

};

module.exports = parserUtils;

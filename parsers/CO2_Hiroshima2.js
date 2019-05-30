"use strict";

const parserUtils = {
	testout: function (msg){
		console.log("Hello");
		return {
            topic: "test",
            payload: "test payload OK: " + msg
        };
	},

	parse: function (msg){
		var pattern = /([A-Z0-9]*_[0-9]*):([a-zA-Z0-9]*):(.*)/;
		var result = pattern.exec(msg);

		if (result !== null && result.length === 4){
			switch(result[2]){
				case "CO2":
				case "Pres":
					var baseTopic = "sensor2/data1/";
					break;
				case "Humi":
				case "Light":
					var baseTopic = "sensor2/data2/";
					break;
				default:
					return null;
			}
			
			return{
				topic: baseTopic + result[2],
				payload: result[3]
			};
		}
		else{
			return null;
		}
	}
};

module.exports = parserUtils;

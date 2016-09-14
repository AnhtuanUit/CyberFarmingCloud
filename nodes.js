
var exec = require('child_process');

var json = {
	"nodes": [
	{
		"_id": "579ea1b9e13528e405cc7556",
		"type": 1,
		"nodeName": "1",
		"__v": 0,
		"active": 0,
		"humidity": 0,
		"estimatedTime": 0
	},
	{
		"_id": "579ea21be13528e405cc7558",
		"type": 1,
		"nodeName": "2",
		"__v": 0,
		"active": 0,
		"humidity": 0,
		"estimatedTime": 0
	},
	{
		"_id": "579ea53bb8761ff80fce963a",
		"type": 0,
		"nodeName": "0",
		"__v": 0,
		"active": 0,
		"humidity": 0,
		"estimatedTime": 0
	}
	]
};


exec.execFile('./a.exe',
	[JSON.stringify(json)],
	function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
	});

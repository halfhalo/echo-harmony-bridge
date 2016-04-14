var alexa = require('alexa-app');
var app= new alexa.app('harmony');

app.intent("harmonyActivityIntent",
	{
		"slots":{
			"ACTIVITY":"LITERAL",
			"METHOD":"LITERAL"
		},
		"utterances":["tell {activity|ACTIVITY} to {method|METHOD}"]
	})
app.intent("harmonyButtonIntent",{
		"slots":{
			"BUTTON":"LITERAL"
		},
		"utterances":["press button {button|BUTTON}"]
	})
	console.log(app.schema())
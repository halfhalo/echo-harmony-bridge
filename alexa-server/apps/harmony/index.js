var alexa = require('alexa-app');
var app = new alexa.app('harmonyhub')
var harmony=require("./lib/harmony");
var _ =require("lodash")
harmony.start({port:5000},function(err,harmonyClient){
	app.intent('startactivity',{
		slots:{"ACTIVITYONE":"LITERAL","ACTIVITYTWO":"LITERAL","ACTIVITYTHREE":"LITERAL","ACTIVITYFOUR":"LITERAL"},
		"utterances":["start activity {ACTIVITYONE|ACTIVITYONE}",
		"start activity {ACTIVITYONE|ACTIVITYONE} {|ACTIVITYTWO|ACTIVITYTWO \{\|ACTIVITYTHREE\|ACTIVITYTHREE\} \{\|ACTIVITYFOUR\|ACTIVITYFOUR\}} ",
		"start {ACTIVITYONE|ACTIVITYONE}",
		"start {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO}",
		"start {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {ACTIVITYTHREE|ACTIVITYTHREE}",
		"start {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {ACTIVITYTHREE|ACTIVITYTHREE} {ACTIVITYFOUR|ACTIVITYFOUR}"]
		},function(request,response)
		{
			var activity = request.slot("ACTIVITYONE")
			if(request.slot("ACTIVITYTWO"))
			{
				activity+=" "+request.slot("ACTIVITYTWO")
				if(request.slot("ACTIVITYTHREE"))
				{
					activity+=" "+request.slot("ACTIVITYTHREE")
				}
			}
			console.log("Requested to start "+activity.toLowerCase());
			harmony.startActivity(activity.toLowerCase(),null,function(err,res){
				if(err)
				{
					console.log(err)
					harmony.activityList(function(err,activities){
						if(err)
						{
							response.say("An Error has Occured")
						}
						else
						{
							var actList="";
							_.each(activities,function(act){
	
								actList+=act.label+", "
							})
							response.say("No matching activity found.  Valid Acitities are: "+actList)
							response.send()
						}
					})
				}
				else
				{
					console.log(res)
					response.say("Starting Activity: "+activity.toLowerCase());
					response.send();
				}
			})
			return false;
		}
	)
	app.intent('currentactivity',{
		"utterances":["get activity","what is the current activity","what is active","what is it doing"]
		},function(request,response)
		{
			return false;
		}
	)
	app.intent('listactivities',{
		"utterances":["list activities","get activities"]
		},function(request,response)
		{
			return false;
		}
	)
	app.intent('listbuttons',{
		"utterances":["list buttons","get buttons"]
		},function(request,response)
		{
			return false;
		}
	)
	app.intent('pressbutton',{
		slots:{"BUTTONONE":"LITERAL","BUTTONTWO":"LITERAL"},
		"utterances":["press button {|a|it} {BUTTONONE|BUTTONONE}",
		"press button {|a|it} {BUTTONONE|BUTTONONE} {BUTTONTWO|BUTTONTWO}",
		"press {|a|it} {BUTTONONE|BUTTONONE}",
		"press {|a|it} {BUTTONONE|BUTTONONE} {BUTTONTWO|BUTTONTWO}"]
		},function(request,response)
		{
			var button = request.slot("BUTTONONE")
			if(request.slot("BUTTONTWO"))
			{
				button+=" "+request.slot("BUTTONTWO")
			}
			console.log("Requested to press "+button.toLowerCase());
			harmony.sendCommand(button.toLowerCase(),function(err,res){
				console.log("sendcommand Exit!")
				if(err)
				{
					console.log("Error:")
					console.log(err)
					response.say("An Error has Occured: "+err.toString())
					response.send()
				}
				else
				{
					console.log("Response:")
					console.log(res)
					response.say("Pressing Button: "+button.toLowerCase());
					response.send();
				}
			})
			return false;
		}
	)
	app.intent('stopactivity',{
		"utterances":["stop activity","turn off"]
		},function(request,response)
		{
			console.log("Requested to stop ");
			harmony.startActivityID(-1,null,function(err,res){
				if(err)
				{
					console.log(err)
					harmony.activityList(function(err,activities){
						if(err)
						{
							response.say("An Error has Occured")
						}
						else
						{
							var actList="";
							_.each(activities,function(act){
	
								actList+=act.label+", "
							})
							response.say("No matching activity found.  Valid Acitities are: "+actList)
							response.send()
						}
					})
				}
				else
				{
					console.log(res)
					response.say("Stopping Activity: ");
					response.send();
				}
			})
			return false;
		}
	)
	console.log(app.schema())
	console.log(app.utterances())
})

module.change_code =1;


module.exports=app;
var alexa = require('alexa-app');
var app = new alexa.app('harmonyhub')
var harmony=require("./lib/harmony");
var _ =require("lodash")
harmony.start({port:5000},function(err,harmonyClient){
	app.intent('startactivity',{
		slots:{"ACTIVITYONE":"LITERAL","ACTIVITYTWO":"LITERAL","ACTIVITYTHREE":"LITERAL","ACTIVITYFOUR":"LITERAL","ACTIVITYFIVE":"LITERAL"},
		"utterances":["start {|activity} {|watch|play} {|t. v.}",
		"start {|activity} {|watch|play} {ACTIVITYONE|ACTIVITYONE} {|t. v.}",
		"start {|activity} {|watch|play} {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {|t. v.}",
		"start {|activity} {|watch|play} {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {ACTIVITYTHREE|ACTIVITYTHREE} {|t. v.}",
		"start {|activity} {|watch|play} {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {ACTIVITYTHREE|ACTIVITYTHREE} {ACTIVITYFOUR|ACTIVITYFOUR} {|t. v.}",
		"start {|activity} {|watch|play} {ACTIVITYONE|ACTIVITYONE} {ACTIVITYTWO|ACTIVITYTWO} {ACTIVITYTHREE|ACTIVITYTHREE} {ACTIVITYFOUR|ACTIVITYFOUR} {ACTIVITYFIVE|ACTIVITYFIVE} {|t. v.}"]
		},function(request,response)
		{
			
			var activity = request.slot("ACTIVITYONE") || ""
			console.log("ACT1: "+activity)
			if(request.slot("ACTIVITYTWO"))
			{
				activity+=" "+request.slot("ACTIVITYTWO")
				console.log("ACT2: "+activity)
				if(request.slot("ACTIVITYTHREE"))
				{
					
					activity+=" "+request.slot("ACTIVITYTHREE")
					console.log("ACT3: "+activity)
					if(request.slot("ACTIVITYFOUR"))
					{
						activity+=" "+request.slot("ACTIVITYFOUR")
						console.log("ACT4: "+activity)
						if(request.slot("ACTIVITYFIVE"))
						{
							activity+=" "+request.slot("ACTIVITYFIVE")
							console.log("ACT5: "+activity)
						}
					}
				}
			}
			activity=activity.replace("activityone","")
			if(activity.length<=2)
				activity="Watch TV"
			
				var activityLabel=activity.toLowerCase();
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
							response.say("No matching activity for "+activity.toLowerCase()+" found.  Valid Activities are: "+actList)
							response.send()
						}
					})
				}
				else
				{
					activityLabel=res.label || activityLabel
					response.say("Starting Activity: "+activity.toLowerCase());
					response.send();
				}
			})
			return false;
		}
	)
	app.intent('whodat',{
		"utterances":["who {|is} {|that|dat} {|der}","who is on {|the|that} {|there} {|on} tv", "who is on {|the|that} t. v."]
		},function(request,response)
		{
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
			
			harmony.activeCommands(function(err,commands){
				if(err)
				{
					console.log(err)
					response.say("No Active Commands Available")
					response.send()
					
				}
				else
				{
					console.log(commands)
					var cmdList="";
					_.each(commands,function(cmd){

						cmdList+=cmd.label+", "
					})
					response.say("The following buttons are available: "+cmdList)
					response.send();
				}
			})
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
	app.intent('pressbuttonvolup',{
		"utterances":["press {|button} {|volume} up","volume up"]
		},function(request,response)
		{
			var button = "volume up"
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
	app.intent('pressbuttonvoldown',{
		"utterances":["press {|button} {|volume} down",]
		},function(request,response)
		{
			var button = "volume down"
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
	app.intent('pressbuttondown',{
		"utterances":["press {|button} {|direction} down",]
		},function(request,response)
		{
			var button = "direction down"
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
	app.intent('pressbuttonup',{
		"utterances":["press {|button} {|direction} up",]
		},function(request,response)
		{
			var button = "direction up"
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
	app.intent('pressbuttonright',{
		"utterances":["press {|button} {|direction} right",]
		},function(request,response)
		{
			var button = "direction right"
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
	app.intent('pressbuttonleft',{
		"utterances":["press {|button} {|direction} left",]
		},function(request,response)
		{
			var button = "direction left"
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
	app.intent('pressbuttonplay',{
		"utterances":["press {|button} {|direction} {play|pause}",]
		},function(request,response)
		{
			var button = "play"
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
							response.say("No matching activity found.  Valid Activities are: "+actList)
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
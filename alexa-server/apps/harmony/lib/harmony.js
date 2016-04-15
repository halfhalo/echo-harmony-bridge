var harmony={};
var harmonyserver=require("./harmony-server");
var harmonyServer= null;
var _=require("lodash")
var UUID=require('node-uuid');
var eventStack={"waiting":[],"completed":[]};
var winston=require("winston");
var async=require("async")
//Use UUID's to match incoming and outgoing commands
//console.log(process.env)
harmony.start=function(opts,cb)
{
	harmonyServer= new harmonyserver(opts,cb)
}
harmony.activityList=function(cb)
{
	console.log("activityList")
	var self=this;
	var uuid=harmonyServer.sendMessage({"method":"getActivities"})
	harmony.listen(uuid,function(data){
		//console.log("Listen Returns for event")
		//console.log(data)
		if(data)
		{
			cb(null,data)
		}
		else
		{
			cb(new Error("No Data returned?"))
		}
		
	})
}
harmony.currentActivity=function(cb,timeout)
{
	timeout=timeout||5000
	console.log("currentActivity")
	var self=this;
	var uuid=harmonyServer.sendMessage({"method":"getCurrentActivity"})
	harmony.listen(uuid,function(data){
		if(data)
		{
			harmony.activityList(function(err,activities){
				var currAct=null;
				_.each(activities,function(act){
					if(act.id==data)
						currAct=act
				})
				cb(null,currAct)
			})
			
		}
		
	},timeout)
}
harmony.activeCommands=function(cb)
{
	console.log("activeCommands")
	var self=this;
	var uuid=harmonyServer.sendMessage({"method":"getCurrentActivity"})
	harmony.listen(uuid,function(data){
		if(data)
		{
			harmony.activityList(function(err,activities){
				var currAct=null;
				_.each(activities,function(act){
					if(act.id==data)
						currAct=act
				})
				var actions=[]
				_.each(currAct.controlGroup,function(controlGroup){
					_.each(controlGroup.function,function(action){
						actions.push(action)
					})
				})
				cb(null,actions)
			})
			
		}
		
	})
}
harmony.deviceList=function(cb)
{
	var self=this;
	var uuid=harmonyServer.sendMessage({"method":"getDevices"})
	harmony.listen(uuid,function(data){
		if(data)
		{
			console.log(data)
		}
		
	})
}
harmony.startActivity=function(activity,cb,cbNow,eventID)
{
	cb=cb||cbNow
	eventID=eventID||UUID.v4()
	console.log("startActivity: "+activity)
	harmony.activityList(function(err,activities){
		console.log("ActvityListReturn!")
		if(err)
		{
			console.log(err)
			if(eventStack.completed.indexOf(eventID)!=-1)
			{
				eventStack.completed.push(eventID)
				cb(err)
			}
		}
		else
		{
			var matching = generateMatch(activity,activities);
			if(matching)
			{
				console.log("Matching activity from list for: "+matching.label)
				harmony.currentActivity(function(err,curAct){
					console.log("currentActivity Returned")
					if(err){
						console.log(err)
						if(eventStack.completed.indexOf(eventID)!=-1)
						{
							eventStack.completed.push(eventID)
							cb(err)
						}
					}
					else
					{
						console.log("else statement")
						if(curAct.id==matching.id)
						{
							console.log("Current id equals matching id")
							if(eventStack.completed.indexOf(eventID)==-1)
							{
								eventStack.completed.push(eventID)
								cb(null,curAct)
							}
							else
							{
								console.log("Previous eventID? "+eventID+" "+eventStack.completed.indexOf(eventID))
								console.log(eventStack.completed)
							}
							
						}
						else
						{
							console.log("Starting startActivityID")
							harmony.startActivityID(matching.id,cb,cbNow,eventID)
						}
					}
				})

			}
			else
			{
				console.log("No matching activity")
				cb(new Error("No Matching Activity"))
			}
		}
	})
}
harmony.startActivityID=function(activityid,cb,cbNow,eventID)
{
	eventID=eventID||UUID.v4()
	cb=cb||cbNow
	console.log("startActivityID")
	var uuid=harmonyServer.sendMessage({"method":"startActivity","id":activityid})
	harmony.listen(uuid,function(data){
		if(data)
		{
			if(cbNow)
			{
				cb(null,activityid)
			}
			else
			{
				var maxCount=30;
				var interval=setInterval(function(){
					maxCount--;
					if(maxCount>0)
					{
						harmony.currentActivity(function(err,currentAct){
							if(currentAct.id==activityid)
							{
								console.log("Matched!")
								clearInterval(interval)
								cb(null,currentAct)
							}
							else
							{
								console.log("Looking to match: "+currentAct.id+":"+activityid)
							}
						},1400,eventID)
					}
					else
					{
						clearInterval(interval)
						cb(null,null)
					}

				},1500,eventID)
			}

			//cb(null,data)
		}

	},20000)
}
harmony.stopActivity=function(cb)
{
	console.log("stopActivity")
	harmony.startActivityID(-1,cb)
}
harmony.powerOff=function(cb)
{
	console.log("powerOff")
	harmony.stopActivity(cb)
}
harmony.sendCommand=function(cmd,cb)
{
	console.log("sendCommand")
	var cmds=""
	harmony.activeCommands(function(err,actions){
		var matching=null;
		_.each(actions,function(action){
			if(action.label.toLowerCase()==cmd.toLowerCase())
			{
				matching=action
			}
			else
			{
				//console.log(action.label+" "+cmd)
				cmds+=action.label+", "
			}
				
		})
		if(matching)
		{
			var uuid=harmonyServer.sendMessage({"method":"sendCommand","obj":matching.action})
			harmony.listen(uuid,function(data){
				console.log("Finished!  Calling CB")
					cb(null,data)
			})
		}
		else
		{
			console.log("No Matching Buttons")
			cb(new Error("No matching buttons found.  Valid buttons are: "+cmds))
		}

	})
}
harmony.parseCmd=function(cmd)
{
	return cmd
}
harmony.listen=function(uuid,cb,timedOut,eventID)
{
	console.log("Listening for uuid: "+uuid)
	eventID=eventID||UUID.v4()
	if(eventStack.completed.indexOf(uuid)!=-1 || eventStack.completed.indexOf(eventID)!=-1)
	{
		console.log("########## Completed uuid listener ##########")
	}
	var self=this;
	timedOut=timedOut||5000;
	var sent=false;
	var listener=null
	harmonyServer.once(uuid,function(data){
		if(sent!=true)
		{
			sent=true;
			clearTimeout(timer);
			eventStack.completed.push(uuid);
			cb(data);
		}
		else
		{
			
		}
	},listener)
	var timer=setTimeout(function(){
		if(sent!=true)
		{
			
			sent=true;
			if(listener)
			{
				harmonyServer.removeListener(uuid,listener);
			}
			eventStack.completed.push(uuid);
			cb(null);
		}
	},timedOut)
}
/*
	In addition to checking for a simple match, we also need to check:
	when dropping watch from hub list
	adding watch to alexa input
	dropping TV from hub list
	dropping t. v. to alexa input
	And pretty much every combination possible.
	Also... this is totally not the way to do it if you want any sort of performance... or stability... or it to actually work.
	Its a POC
*/
function generateMatch(activity,activities,cb)
{
	var matchingInfo={"name":null,"fragment":null};
	var inputVariations=[activity];
	var activityVariations={}
	var comparisonFunctions={}
	var mangleFunctions=[dropTV,dropWatch,addTV,addWatch]
	_.each(mangleFunctions,function(f){
		var iLength=inputVariations.length;
		for(var i=0;i<iLength;i++)
		{
			var newItem=f(inputVariations[i]).replace("  "," ")
			if(inputVariations.indexOf(newItem)==-1)
				inputVariations.push(newItem)
		}
	})
	_.each(activities,function(act){
		activityVariations[act.label]=[act.label.toLowerCase()];
		comparisonFunctions[act.label]=[]
		_.each(mangleFunctions,function(f){
			var iLength=activityVariations[act.label].length;
			for(var i=0;i<iLength;i++)
			{
				var newItem=f(activityVariations[act.label][i]).replace("  "," ")
				if(activityVariations[act.label].indexOf(newItem)==-1)
					activityVariations[act.label].push(newItem)
			}
		})
	})
	_.each(activityVariations,function(actVar,actLabel){
		if(actVar.length>0)
		{
			var actVarBest={"name":"","match":""};
			_.each(inputVariations,function(input){
				if(input.length>0)
				{
					_.each(actVar,function(av){
						if(av.length>0)
						{
							if(av==input)
							{
								if(!actVarBest)
								{
									actVarBest["name"]=actLabel
									actVarBest["match"]=input
								}
								else
								{
									if(actVarBest["match"].length<input.length)
									{
									actVarBest["name"]=actLabel
									actVarBest["match"]=input
									}
								}
							}
						}
					})
				}
				
			})
			if(!matchingInfo.fragment || actVarBest["match"].length> matchingInfo.fragment.length)
			{
				matchingInfo.fragment=actVarBest["match"]
				matchingInfo.name=actVarBest["name"]
			}
		}
	})
	_.each(activities,function(act){
		if(act.label==matchingInfo["name"])
			matchingInfo["activity"]=act
	})
	return matchingInfo["activity"]
}
function compareActivities(input,possibilities,cb)
{
	console.log(input)
	console.log(possibilities)
}
function dropTV(str)
{
	str=str.toLowerCase()
	if(str.indexOf("tv")!=-1)
		str=str.replace("tv","")
	if(str.indexOf("t. v.")!=-1)
		str=str.replace("t. v.","")
	return str.trim();
}
function dropWatch(str)
{
	str=str.toLowerCase()
	if(str.indexOf("watch")!=-1)
		str=str.replace("watch","")
	return str.trim();
} 
function addTV(str)
{
	str=str.toLowerCase()
	if(str.indexOf("watch")==-1)
		str="watch "+str
	return str.trim();
}
function addWatch(str)
{
	str=str.toLowerCase()
	if(str.indexOf("tv")==-1)
		str=str+" tv"
	return str.trim();
}
module.exports=harmony
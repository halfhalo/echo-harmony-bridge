var harmonyClient={}
var harmonyDiscover = require("harmonyhubjs-discover");
var harmonyhub= require("harmonyhubjs-client");
var _ = require("lodash");
var hublist=[];
var harmonyList=[]
var discover = null;
harmonyClient.start = function(){
	console.log("Start")
	discover = new harmonyDiscover(61991)
	discover.on('online',function(hub){
		console.log("Discovered "+ hub.ip)
		harmonyhub(hub.ip).then(function(harmonyClient){
			//This really should be checked for duplicates..
			harmonyList.push({"ip":hub.ip,"hub":hub,"client":harmonyClient})
		})
	})
	discover.on('offline',function(hub){
		//Since we are not actually removing things from the array.
		//Pray to the demo gods instead!
		console.log('Hub went offline '+hub.ip)
	})
	discover.on('update',function(hubs){
		//hublist=hubs
	})
	
	return discover.start();
}
//Yes, it is doing what you think it is doing.  THE SHAME!!!
harmonyClient.online=function(cb,count)
{
	count=count||1000
	if(harmonyList.length>0)
		 cb(true);
	else
	{
		if(count>1)
		{
			setTimeout(function(){
				
				harmonyClient.online(function(status){
					cb(status)
				},count-1)
			},100)
		}
		else
		{
			cb(false)
		}
	}
}
harmonyClient.getHub=function(){
	return harmonyList[0] || null;
}
harmonyClient.getActivities=function(msg,cb)
{
	var hub=harmonyClient.getHub()["client"];
	hub.getActivities().then(function(activities){
		cb(activities)
	})
}
harmonyClient.getDevices=function(msq,cb)
{
	var hub=harmonyClient.getHub()["client"];
	hub.getAvailableCommands().then(function(commands){
		cb(commands)
	})
}
harmonyClient.getCurrentActivity=function(msq,cb)
{
	var hub=harmonyClient.getHub()["client"];
	hub.getCurrentActivity().then(function(activity){
		cb(activity)
	})
}
harmonyClient.startActivity=function(msg,cb)
{
	var hub=harmonyClient.getHub()["client"];
	cb(hub.startActivity(msg.id))
}
harmonyClient.sendCommand=function(msg,cb)
{
	var hub=harmonyClient.getHub()["client"];
	var encodedAction=msg.obj.replace(/\:/g, '::')
	hub.send('holdAction','action='+ encodedAction+':status=press').then(function(){
		setTimeout(function(){
			cb(null,hub.send('holdAction','action='+ encodedAction+':status=release'))
		},msg.holdTime||10)
		
	})
}

module.exports=harmonyClient
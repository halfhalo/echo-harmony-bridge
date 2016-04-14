var net=require("net");
var client= null;
var harmonyClient=require("./lib/harmony-client");
var buffer="";
var functionBuffer=[];
var _ = require("lodash")
console.log(harmonyClient)
//Start Discovery
harmonyClient.start()
//Do as I say, not as I do (badly)
harmonyClient.online(function(status){
	if(status)
	{
		console.log("Launching TCP Client")
		client=net.connect(5000,process.env["ECHO_HOSTNAME"]||"alexa.silentbluesystems.com")
		
		client.on('data', function(data){
				var remaining="";
				buffer+=data.toString();
				var split=buffer.split("@!@")
				//console.log(split)
				_.each(split,function(entry){
					try{
						aStr=new Buffer(entry,'base64').toString('ascii');
						var inc=JSON.parse(aStr)
						functionBuffer.push([harmonyClient,client,inc])
						/*
						if(harmonyClient[inc.msg.method])
						{
							harmonyClient[inc.msg.method](inc.msg,function(resp){
								var obj=inc;
								inc.resp=resp;
						
								client.write(new Buffer(JSON.stringify(inc)).toString('base64')+"\n")
							})
						}
						else
						{
							console.log("No method for: "+inc.msg.method)
						}
						*/
					}catch(e)
					{
						if(entry.length>0)
						remaining+=entry
					}
				})

				buffer=remaining
		})
		client.on('end',function(){
			console.log("Server disconnect.")
			console.log("Exiting...")
			process.exit(0)
		})
	}
	else
	{
		console.log(status)
		process.exit(1)
	}
})

function runFunctionBuffer(cb)
{
	//console.log("runFunctionBuffer")
	if(functionBuffer.length>0)
	{
		var funcItems=functionBuffer.pop();
		runFuncBuff(funcItems[0],funcItems[1],funcItems[2],function(){
			setTimeout(function(){
				runFunctionBuffer(cb)
			},50)
			
		})
	}
	else
	{
		setTimeout(function(){
			runFunctionBuffer()
		},250)
		if(cb)
			cb(true)
	}
}
function runFuncBuff(harmClient,tcpClient,msg,cb)
{
	//console.log(msg)
	//console.log("runFuncBuff")
	if(harmClient[msg.msg.method])
	{
		harmClient[msg.msg.method](msg.msg,function(resp){
			console.log("Responding to: "+msg)
			var obj=msg;
			msg.resp=resp;
			console.log(msg)
			client.write(new Buffer(JSON.stringify(msg)).toString('base64')+"@!@")
			cb(true)
		})
	}
	else
	{
		console.log("No method for: "+msg.msg.method)
		cb(false)
	}
	
}
setTimeout(function(){
	runFunctionBuffer();
},1000)
var harmony=require("./lib/harmony")
harmony.start({port:5000},function(err,harmonyClient){
	if(err)
	{
		//Die now, let external process respawn us for demo.
		console.log(err);
		process.exit(1);
	}
	else
	{
		
		setInterval(function(){
			console.log("setInverval")
			harmony.startActivity("Watch Fire TV",function(err,res){
				console.log(res)
				harmony.sendCommand("Direction Down",function(err,res){
					console.log(res)
					harmony.sendCommand("Direction Up",function(err,res){
						console.log(res)
					harmony.stopActivity(function(err,res){
						console.log(res)
						console.log("*******************")
					})
					})
				})
			})

		},20000)
	}
	
})
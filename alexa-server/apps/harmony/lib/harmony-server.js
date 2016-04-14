var util=require('util');
var _=require("lodash");
var net=require("net");
var uuid = require('node-uuid');
var EventEmitter = require('events');
var winston = require('winston');
var server= function(opts,cb){
	winston.info("Starting Server")
	var self=this;
	this.opts=opts;
	this.clients=[];
	this.server=null;
	this.buffer=""
	this.errorCount=0;
	this.server=net.createServer(function(socket){
		
		socket.name=socket.remoteAddress + ":" + socket.remotePort

		winston.info("Client Connected: ")
		self.clients.push(socket)
		socket.on('data',function(data){
			self.parseMessage(data)
		})
		socket.on('end',function(){
			self.clients.splice(self.clients.indexOf(socket),1)
			winston.info("Client Disconnected")
		})
	}).listen({port:opts.port||5000},function(){
		winston.info("Server listening...")
		cb(null,self)
	})
	this.sendMessage=function(obj){
		winston.info("SendMessage")
		var uid=null
		self.clients.forEach(function(client){{
			uid=uuid.v4()
			//console.log({uuid:uid,msg:obj})
			var str=JSON.stringify({uuid:uid,msg:obj})
			client.write(new Buffer(str).toString('base64')+"\n")
		}})
		if(!uid)
			return uuid.v4()
		else
			return uid;	
	}
	this.parseMessage=function(data){
		var self=this
		winston.info("parseMessage")
		self.buffer+=data.toString();
		var remaining=""
		var splitBuffer=self.buffer.split("\n")
		_.each(splitBuffer,function(sb){
			try{
				var aStr=new Buffer(sb,'base64').toString();
				var parsedData=JSON.parse(aStr)
				//console.log(parsedData)
				self.emit(parsedData.uuid,parsedData.resp);
			}catch(e){

			}
			//self.emit(parsedData.uuid,parsedData.resp);
		})
		if(self.errorCount<3)
		self.buffer=remaining


	

	}
}


util.inherits(server,EventEmitter)
module.exports=server
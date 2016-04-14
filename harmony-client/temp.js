var HarmonyHubDiscover = require('harmonyhubjs-discover')
var harmony = require('harmonyhubjs-client');
var discover = new HarmonyHubDiscover(61991)
var _ = require("lodash")
discover.on('online', function(hub) {
    // Triggered when a new hub was found
    console.log('discovered ' + hub.ip)
	harmony(hub.ip)
		.then(function(harmonyClient){
			console.log(harmonyClient)
			harmonyClient.getActivities().then(function(activities){
				console.log(activities)
			})
			harmonyClient.getAvailableCommands().then(function(commands){
				console.log(commands)
			})
		})
})

discover.on('offline', function(hub) {
    // Triggered when a hub disappeared
    console.log('lost ' + hub.ip)
})

discover.on('update', function(hubs) {
    // Combines the online & update events by returning an array with all known
    // hubs for ease of use.
    var knownHubIps = hubs.reduce(function(prev, hub) {
            return prev + (prev.length > 0 ? ', ' : '') + hub.ip
        }, '')

    console.log('known ips: ' + knownHubIps)
})

// Look for hubs:
discover.start()

// Stop looking for hubs:
// discover.stop()
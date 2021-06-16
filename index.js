var tokens = require('prismarine-tokens-fixed');
const Discord = require('discord.js');
const dbot = new Discord.Client({ disableEveryone: true });
const mineflayer = require('mineflayer');
const request = require('request');
const fs = require("fs-extra");
require('dotenv').config();

console.log("\nStashbot starting...");
mineflayerWait()

//Mineflayer bot setup

async function writeStartTime() {
    var jsonTime = {
        "time": Date.now()
    }
    fs.writeFileSync(`./startTime.json`, JSON.stringify(jsonTime, null, 2));
}


function mineflayerWait() {
    setTimeout(function(){ 
        if(fs.existsSync(`./startTime.json`)){
            var startTime = require(`./startTime.json`)
            if((Date.now() - startTime.time) <= 30000){
                var waitTime = (30000 - (Date.now() - startTime.time) + 5000) //Add 5 seconds because cocaine server
                console.log(`Waiting ${waitTime}ms to start mineflayer to avoid connection throttling`)
                setTimeout(function(){
                    start()
                }, waitTime);
            } else{
                start()
            }
            delete require.cache[require.resolve(`./startTime.json`)]
        } else {
            console.log("startTime.json missing. Creating file...")
            start()
        }
    },500)
}


function start() {


    var options = {
        host: process.env.IP,
        port: process.env.PORT,
        username: process.env.MCUSER,
        password: process.env.MCPASS,
        version: process.env.VERSION,
        tokensLocation: './bot_tokens.json'
    };

    tokens.use(options, function(_err, _opts){
        var bot = mineflayer.createBot(_opts);
        bind(bot);


        function bind(bot){

            console.log("\nMineflayer starting...");
            bot.on('login', function(){
                writeStartTime()
                console.log("Bot successfully logged in.")
            });
            bot.on('kicked', function(reason, loggedIn) {
                var msg = JSON.parse(reason)
                console.log(`Bot was kicked: ${msg.text}`)
                writeStartTime()    
            });
            bot.on('error', err => console.error(err));
            bot.on('end', function() {
                console.log("Mineflayer bot disconnected. Restarting...")
                setTimeout(function(){
                    mineflayerWait()
                },3000)
            });

        };


    });

}



//Discord bot setup

dbot.on("ready", async () => {
    console.log(`\nDiscord Bot starting up...`);
    dbot.user.setActivity('Starting...', {type: 'PLAYING'})
});

dbot.login(process.env.TOKEN)
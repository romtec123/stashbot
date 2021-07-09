var tokens = require('prismarine-tokens-fixed');
const Discord = require('discord.js');
const dbot = new Discord.Client({ disableEveryone: true });
const mineflayer = require('mineflayer');
const request = require('request');
const fs = require("fs-extra");
const mcproxy = require("@rob9315/mcproxy");
let mc = require("minecraft-protocol");

let server, proxyClient;
require('dotenv').config();

console.log("\nStashbot starting...");
mineflayerWait()

//Mineflayer bot setup


server = mc.createServer({ // create a server for us to connect to
    'online-mode':  process.env.whitelist,
    encryption: true,
    host: "0.0.0.0",
    port: process.env.PROXY_PORT,
    version: process.env.VERSION,
    'max-players': maxPlayers = 0
});

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
        var conn = new mcproxy.Conn(_opts);
        bind(conn.bot);


        function bind(bot){

            console.log("\nMineflayer starting...");
            bot.on('login', function(){
                writeStartTime()
                console.log("Bot successfully logged in.")

                server.maxPlayers = 1;

                server.on('login', (newProxyClient) => {
                    newProxyClient.on('packet', (data, meta, rawData) => { // redirect everything we do to 2b2t
                        if (meta.name !== "keep_alive" && meta.name !== "update_time") { //keep alive packets are handled by the client we created, so if we were to forward them, the minecraft client would respond too and the server would kick us for responding twice.
                            bot._client.writeRaw(rawData);
                          }
                    });
                    newProxyClient.on('end', (data, meta, rawData) => {
                        proxyClient = null;
                    });
                    conn.sendPackets(newProxyClient);
                    conn.link(newProxyClient);
                    //sets instance client to the current players client
                    proxyClient = newProxyClient;
                });
            });
            bot.on('kicked', function(reason, loggedIn) {
                var msg = JSON.parse(reason)
                console.log(`Bot was kicked: ${msg.text}`)
                try {
                    proxyClient.end("Bot kicked");
                } catch {}
                writeStartTime()    
            });
            bot.on('error', err => console.error(err));
            bot.on('end', function() {
                console.log("Mineflayer bot disconnected. Restarting...")
                try {
                    proxyClient.end("Bot disconnected");
                } catch {}
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
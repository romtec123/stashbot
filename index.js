var tokens = require('prismarine-tokens-fixed');
const Discord = require('discord.js');
const dbot = new Discord.Client({ disableEveryone: true });
const mineflayer = require('mineflayer');
const request = require('request');
const { chmodSync } = require("fs-extra");
require('dotenv').config();

console.log("\nStashbot starting...");


//Mineflayer bot setup

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
        bot.on('kicked', (reason, loggedIn) => console.log(`Bot was kicked: ${reason.text}`));
        bot.on('error', err => console.error(err));

    };


});






//Discord bot setup

dbot.on("ready", async () => {
    console.log(`\nDiscord Bot starting up...`);
    dbot.user.setActivity('Starting...', {type: 'PLAYING'})
});

dbot.login(process.env.TOKEN)
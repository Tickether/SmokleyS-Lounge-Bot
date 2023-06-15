require('dotenv').config(); 
const { Client, Events, GatewayIntentBits } = require('discord.js');
//const ethers = require('ethers'); 
//const axios = require('axios');
//const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// when bot is ready...
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, event => {
	console.log(`Ready! Logged in as ${event.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN); //login bot using token
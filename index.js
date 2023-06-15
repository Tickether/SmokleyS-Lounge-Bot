require('dotenv').config(); 
const { Client, Events, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
//const ethers = require('ethers'); 
//const axios = require('axios');
//const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const startEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Members Access')
	.setAuthor({ name: 'SmokleyS Lounge', iconURL: 'https://i.imgur.com/CF9LXqj.png', url: 'https://SmokleyS.shop' })
	.setDescription('Welcome to SmokleyS Lounge! We use our bouncer bot to safely verify members and give access to roles. Click the button below to get started.')
	.setThumbnail('https://i.imgur.com/CF9LXqj.png')
	.setFooter({ text: 'Remember, SmokleyS will never DM you or ask you to click on any links.', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
;
const verifyAccess = new ButtonBuilder()
    .setCustomId('verify')
    .setLabel('Verify Access')
    .setStyle(ButtonStyle.Danger)
;

const actionRow = new ActionRowBuilder()
    .addComponents( verifyAccess )
;


// when bot is ready...
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, event => {
    //channel.send({ embeds: [exampleEmbed] });
    client.channels.cache.get('1118860860434173996').send({ embeds: [startEmbed], components: [actionRow],  });
	console.log(`Ready! Logged in as ${event.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN); //login bot using token

////
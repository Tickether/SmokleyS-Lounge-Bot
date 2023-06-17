require('dotenv').config(); 
const { Client, Events, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ethers } = require('ethers'); 
const {Network, Alchemy} = require('alchemy-sdk')
const axios = require('axios');
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Replace YOUR_PROVIDER with the URL of a JSON-RPC provider

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/8231230ce0b44ec29c8682c1e47319f9');

// Replace YOUR_CONTRACT_ADDRESS with the address of the contract
const SmokleySLoungeAddress = '0x7C2A9525818B0c1589885de370323B1B385224D1';

// Replace YOUR_ABI_FILE with the path to the JSON file containing the ABI
const abiFile = './SmokleySLounge.json';

// read in content from file
const SmokleySLoungeAbi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));

// Instanciate Contract 
const SmokleySLoungeContract = new ethers.Contract(SmokleySLoungeAddress, SmokleySLoungeAbi.abi, provider);
//console.log(SmokleySLoungeContract)


//alchemy settings
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

// fetch token owned async
const checkMember = async (address) => {
    
    try {
        const nfts = await alchemy.nft.getNftsForOwner(address, { contractAddresses: ['0x7C2A9525818B0c1589885de370323B1B385224D1'] });
        console.log('this:', nfts.ownedNfts)
        return nfts.ownedNfts
    } catch(err) {
        console.log('Failed to fetch owned NFTs:', err);
    }
}


// fetch opensea bio
async function fetchOpensea(address) {
    ///header with opensea apiKey
    const options = {
        method: 'GET',
        headers: {'X-API-KEY': process.env.OPENSEA_TOKEN}
    };
    try {
        const opensea = await axios.get(`https://api.opensea.io/api/v1/user/${address}`, options);
        const data = opensea.data;
        console.log(data.username);
        return data.username;
    } catch (error) {
        console.error(error);
    }
}

const startEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Members Access')
	.setAuthor({ name: 'SmokleyS Lounge', iconURL: 'https://i.imgur.com/CF9LXqj.png', url: 'https://SmokleyS.shop' })
	.setDescription('Welcome to SmokleyS Lounge! We use our bouncer bot to safely verify members and give access to roles. Click the button below to get started.')
    .setThumbnail('https://i.imgur.com/CF9LXqj.png')
	.setFooter({ text: 'Remember, SmokleyS will never DM you or ask you to click on any links.', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
;

const errWalletEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Error!')
	.setAuthor({ name: 'Error!' })
	.setDescription('Invalid Address! Please, try again.')
	.setFooter({ text: 'Powered by SmokleyS', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
;

const errNotMemberEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Sorry! Not a Lounge Member!')
	.setDescription('The Bouncer Bot has to reject your accesss to SmokleyS Lounge! Please, come back with a Membership')
;
const errTimeoutEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Error!')
	.addFields(
		{ name: 'Error!', value: 'Your bio[Metrics] was not updated in time. Please restart the process by clicking the Verify Access button above' },
	)
    .setFooter({ text: 'Powered by SmokleyS', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
;

const memberNotActiveEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Lounge Member!')
	.setDescription(`The Bouncer Bot confirms Membership to SmokleyS Lounge! Unforntunately its not active & will have limited Lounge Experiece`)
    .addFields(
		{ name: 'Next Steps', value: 'Activate your membership with a month or few & wider access to the Lounge will be Granted' },
	)
    .setFooter({ text: 'Powered by SmokleyS', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
;

const verifyIsWalletEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Verifying your Lounge Access!')
	.setDescription('The Bouncer Bot is checking your Membership to SmokleyS Lounge! Please, wait...')
;

// Generate code
function generateCode() {
    const hex = Math.random().toString(36).substring(7);
    return hex;
}

const verifyAccess = new ButtonBuilder()
    .setCustomId('verify')
    .setLabel('Verify Access')
    .setStyle(ButtonStyle.Danger)
;

const actionRow = new ActionRowBuilder()
    .addComponents( verifyAccess )
;

const walletModal = new ModalBuilder()
    .setCustomId('walletModal')
    .setTitle('Next Steps for Access')
;

const walletInput = new TextInputBuilder()
    .setCustomId('walletInput')
    // The label is the prompt the user sees for this input
    .setLabel("Enter your Ethereum address below")
    // Short means only a single line of text
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('0x000...')
    .setMinLength(42)
    .setMaxLength(42)
;

const walletInputRow = new ActionRowBuilder()
    .addComponents( walletInput )
;

walletModal.addComponents(walletInputRow)

// when bot is ready...
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, event => {
    client.channels.cache.get('1118860860434173996').send({ embeds: [startEmbed], components: [actionRow],  });
	console.log(`Ready! Logged in as ${event.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	//show wallet submission modal
	if (interaction.isButton() && interaction.customId === 'verify') {
		await interaction.showModal(walletModal);
	}

    //after wallet submit conditions 
    if (interaction.isModalSubmit() && interaction.customId === 'walletModal') {
        const address = interaction.fields.getTextInputValue('walletInput')
        if (!ethers.isAddress(address)) {
            await interaction.reply({ embeds: [errWalletEmbed], ephemeral: true })
        } else {
            generateCode()
            code = generateCode();
            const verifyOwnWalletEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Lounge Member!')
                .setDescription(`The Bouncer Bot confirms Membership to SmokleyS Lounge! Please, wait...`)
                .addFields(
                    { name: 'Next Steps', value: 'Confirm your bio[Metrics]. Tag the unique Key below here to your Opensea name! You have 6 minutes!!' },
                    { name: 'Unique Key', value: `SmokleyS-${code}` },
                )
                .setFooter({ text: 'NB: You can go back to default after confirmation', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
            ;
            await interaction.reply({ embeds: [verifyIsWalletEmbed], ephemeral: true })
            const memberCheck = await checkMember(address)
            if (memberCheck.length === 0) {
                //await client.channels.cache.get('1118860860434173996').send({ embeds: [errNotMemberEmbed], ephemeral: true });
                await interaction.followUp({ embeds: [errNotMemberEmbed], ephemeral: true })
            } else {
                await interaction.followUp({ embeds: [verifyOwnWalletEmbed], ephemeral: true })
                let nameNow = await fetchOpensea(address)
                let dateNow = Date.now()
                
                const timeLimit = Date.now() + 10000; // 6 minutes in milliseconds
                console.log(timeLimit)
                /*
                while (!nameNow.includes(code) && dateNow < timeLimit ) {
                    nameNow = await fetchOpensea(address);
                    dateNow = Date.now();
                    console.log(nameNow)
                }
                */
                function delay(ms) {
                    return new Promise((resolve) => setTimeout(resolve, ms));
                }
                do {
                    nameNow = await fetchOpensea(address);
                    dateNow = Date.now();
                    console.log(nameNow)
                    if (!nameNow.includes(code) && dateNow < timeLimit) {
                        await delay(1000); // Wait for 1 second
                    }
                } while ( !nameNow.includes(code) && dateNow < timeLimit );
                console.log('exited loop', nameNow)
                
                if (!nameNow.includes(code)) {
                    await interaction.followUp({ embeds: [errTimeoutEmbed], ephemeral: true })
                } 
                    else if (nameNow.includes(code)) {
                    // check user is on active sub
                    let userOf = await SmokleySLoungeContract.userOf(memberCheck[0].tokenId)
                    console.log(userOf);
                    if (userOf === ethers.ZeroAddress) {
                        await interaction.followUp({ embeds: [memberNotActiveEmbed], ephemeral: true })
                        // limted role
                    } 
                    else if (userOf === address){
                        // check expiry of sub
                        let userExpires = await SmokleySLoungeContract.userExpires(memberCheck[0].tokenId)
                        userExpires = Number(userExpires)
                        console.log(userExpires);
                        const memberActiveEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle('Lounge Member!')
                            .setDescription(`The Bouncer Bot confirms Membership to SmokleyS Lounge! Congratulations, You have full unlimited access to SmokleyS Lounge`)
                            .addFields(
                                { name: 'Next Steps', value: `Enjoy your Experiece at the Lounge! Your Membership expires ${userExpires}, Remember to keep your membership active!!` },
                            )
                            .setFooter({ text: 'Powered by SmokleyS', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
                        ;
                        await interaction.followUp({ embeds: [memberActiveEmbed], ephemeral: true })
                        //give luounge role
                    }
                    
                }
                
            }
            
        }
        
    }
    
});

client.login(process.env.DISCORD_TOKEN); //login bot using token

////
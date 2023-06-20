require('dotenv').config(); 
const { Client, Events, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ethers } = require('ethers'); 
const {Network, Alchemy} = require('alchemy-sdk')
const axios = require('axios');
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers
    ] 
});

// Replace YOUR_PROVIDER with the URL of a JSON-RPC provider

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/8231230ce0b44ec29c8682c1e47319f9');

// Replace YOUR_CONTRACT_ADDRESS with the address of the contract
const SmokleySLoungeAddress = '0xe0EA5e8Bf175E517A6079716864524BE4a11CaBF';

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
        const nfts = await alchemy.nft.getNftsForOwner(address, { contractAddresses: [SmokleySLoungeAddress] });
        console.log('this:', nfts.ownedNfts)
        return nfts.ownedNfts
    } catch(err) {
        console.log('Failed to fetch owned NFTs:', err);
    }
}


//delay 
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// fetch opensea bio
const fetchOpensea = async (address) => {
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

// fetch LoungeMembers list 
const fetchLoungeMembers = async () => {
    
    try {
        const LoungeMembers = await axios.get('https://smokleys-lounge-bot-api.onrender.com/api/SmokleySLounge/');
        return LoungeMembers.data
    } catch(err) {
        console.log(err);
    }
}

// fetch LoungeMember
const fetchLoungeMember = async (discordID) => {
    
    try {
        const LoungeMember = await axios.get(`https://smokleys-lounge-bot-api.onrender.com/api/SmokleySLounge/${discordID}`);
        return LoungeMember.data
    } catch(err) {
        console.log(err);
    }
}

// add new LoungeMember
const addLoungeMember = async (memberData) => {
    
    try {
        const LoungeMemberAdd = await axios.post('https://smokleys-lounge-bot-api.onrender.com/api/SmokleySLounge/', memberData);
        return LoungeMemberAdd.data
    } catch(err) {
        console.log(err);
    }
}

// update LoungeMember 
const updateLoungeMember = async (discordID, memberData) => {
    
    try {
        const LoungeMemberUpate = await axios.put(`https://smokleys-lounge-bot-api.onrender.com/api/SmokleySLounge/${discordID}`, memberData);
        return LoungeMemberUpate.data
    } catch(err) {
        console.log(err);
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
const loungeMemberOutsideEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('Lounge Member!')
	.setDescription(`Your not supposed to be here!..Bouncer Bot will let you in on its next rounds!! We Apologize for the inconvienient interruption in your Experince!`)
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
const generateCode = () => {
    const hex = Math.random().toString(36).substring(7);
    return hex;
}

const verifyAccess = new ButtonBuilder()
    .setCustomId('verifyAccess')
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

// When the client is ready, run this code (only once every 12hrs)
client.on(Events.ClientReady, async event => {
    
    //get member list and remove/add based on expirry
    const manageMembers = async () => {
        // const for use
        const guild = await event.guilds.fetch('1118860859586912326');
        const LoungeRole = guild.roles.cache.get('1119792517299306546')
        const SmokleySRole = guild.roles.cache.get('1119792106144276510')
        const loungeMembers = await fetchLoungeMembers()

        if (loungeMembers.length >= 1 ) {
            // do checks for each item in Lounge Members
            for (let i = loungeMembers.length-1; i >= 0; i--){
                const loungeMember = loungeMembers[i]
                const Member = await guild.members.fetch(loungeMember.discordID)
                const timeStamp = Date.now();
                console.log(Member.roles.cache.has('1119792517299306546'))
                //console.log(userExpires)
                console.log(timeStamp)

                let userExpires = await SmokleySLoungeContract.userExpires(loungeMember.tokenID)
                userExpires = Number(userExpires)
                userExpires = (userExpires * 1000)
                console.log(userExpires)
                
                if (userExpires < timeStamp) {
                    // check if role them remove role
                    if (Member.roles.cache.has('1119792517299306546')) {
                        
                        //take luounge role
                        Member.roles.remove(LoungeRole)
                        console.log('removed LOUNGE')
                        //give SmokleyS role
                        Member.roles.add(SmokleySRole)
                        console.log('added SmokleyS')
                        // send embed about role removed
                        return;
                    }
                } else if( userExpires > timeStamp) {
                    if (Member.roles.cache.has('1119792106144276510')) {
                        
                        //give luounge role
                        Member.roles.add(LoungeRole)
                        console.log('added LOUNGE')
                        //take SmokleyS role
                        Member.roles.remove(SmokleySRole)
                        console.log('removed SmokleyS')
                        // send embed about role added again
                        return;
                    }
                    // checks if time remaing is less than 24hrs 
                    const dayInMilliSecs = 86400000
                    const timeLeft = userExpires - timeStamp
                    if (dayInMilliSecs > timeLeft) {
                        // send reminder embed with time left
                    }
                    console.log('just another run through the Lounge, nothing to see here...')
                }
            }
        } 
        else {
            console.log('no users wallets info')
        }
    }
    setInterval(manageMembers, 60000)
});

client.on(Events.InteractionCreate, async interaction => {
    // constant for use
    const Member = interaction.member
    const SmokleySRole = interaction.guild.roles.cache.get('1119792106144276510')
    const LoungeRole = interaction.guild.roles.cache.get('1119792517299306546')

	//show wallet submission modal
	if (interaction.isButton() && interaction.customId === 'verifyAccess') {
        
        
        if ( (Member.roles.cache.has('1119792517299306546'))) {
            //address & token from db
            const loungeMember = await fetchLoungeMember(Member.user.id)
            const addressFromDB = loungeMember.wallet
            const tokenFromDB = loungeMember.tokenID
            // check user is on active sub
            let userOf = await SmokleySLoungeContract.userOf(tokenFromDB)
            console.log(userOf);

            // check expiry of sub
            let userExpires = await SmokleySLoungeContract.userExpires(tokenFromDB)
            userExpires = Number(userExpires)
            userExpires = new Date(userExpires * 1000);
            userExpires = userExpires.toUTCString()
            console.log(userExpires);

            if (userOf === addressFromDB) {
                const memberActiveEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Lounge Member!')
                    .setDescription(`The Bouncer Bot confirms Membership to SmokleyS Lounge! Congratulations, You have full unlimited access to SmokleyS Lounge`)
                    .addFields(
                        { name: 'Next Steps', value: `Enjoy your Experiece at the Lounge! Your Membership expires ${userExpires}, Remember to keep your membership active!!` },
                    )
                    .setFooter({ text: 'Powered by SmokleyS', iconURL: 'https://i.imgur.com/CF9LXqj.png' })
                ;
                try {
                    await interaction.reply({ embeds: [memberActiveEmbed], ephemeral: true })
                } catch (error) {
                    console.log(error)
                }
            }
        } 
        else if ((Member.roles.cache.has('1119792106144276510')) ) {
            //address & token from db
            const loungeMember = await fetchLoungeMember(Member.user.id)
            const tokenFromDB = loungeMember.tokenID
            // check user is on active sub
            let userOf = await SmokleySLoungeContract.userOf(tokenFromDB)
            console.log(userOf);

            if (userOf === ethers.ZeroAddress) {
                try {
                    await interaction.reply({ embeds: [memberNotActiveEmbed], ephemeral: true })
                } catch (error) {
                    console.log(error)
                }
            }
            else {
                // send embed message
                await interaction.reply({ embeds: [loungeMemberOutsideEmbed], ephemeral: true })
                console.log('Your not supposed to be here sorry!..Bouncer Bot will let you in on its rounds')
            }
        } 
        else {
            try {
                await interaction.showModal(walletModal);
            } catch (error) {
                console.log(error)
            }
            
        }
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
                await interaction.followUp({ embeds: [errNotMemberEmbed], ephemeral: true })
            } else {
                await interaction.followUp({ embeds: [verifyOwnWalletEmbed], ephemeral: true })
                let nameNow = await fetchOpensea(address)
                let dateNow = Date.now()
                
                const timeLimit = Date.now() + 360000; // 6 minutes in milliseconds
                console.log(timeLimit)
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
                    // add wallet addres to user on db
                    const LoungeMember = {
                        discordID: Member.user.id,
                        wallet: address,
                        tokenID: memberCheck[0].tokenId,
                    }
                    await addLoungeMember(LoungeMember)

                    // check user is on active sub
                    let userOf = await SmokleySLoungeContract.userOf(memberCheck[0].tokenId)
                    console.log(userOf);
                    if (userOf === ethers.ZeroAddress) {
                        // give limted role
                        Member.roles.add(SmokleySRole);
                        await interaction.followUp({ embeds: [memberNotActiveEmbed], ephemeral: true })
                    } 
                    else if (userOf === address){
                        // check expiry of sub
                        let userExpires = await SmokleySLoungeContract.userExpires(memberCheck[0].tokenId)
                        userExpires = Number(userExpires)
                        userExpires = new Date(userExpires * 1000)
                        userExpires = userExpires.toUTCString()
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
                        //give luounge role
                        Member.roles.add(LoungeRole)
                        await interaction.followUp({ embeds: [memberActiveEmbed], ephemeral: true })
                        
                    }
                    
                }
                
            }
            
        }
        
    }
    
});

client.login(process.env.DISCORD_TOKEN); //login bot using token

////
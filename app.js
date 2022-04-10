'use strict';
require('dotenv').config();
import AppointmentManager from './src/managers/AppointmentManager';
import { registerCommands } from './src/utils/commandUtils.ts';
import { handleButtonInteraction } from './src/handlers/ButtonHandler';
import { handleCommandInteraction } from './src/handlers/CommandHandler';
import { handleDirectMessage } from './src/handlers/DirectMessageHandler';
import BookingManager from './src/managers/SessionManager';
import { mockAppointment } from './src/utils/generalUtils.ts';

//registerCommands();
mockAppointment();

const { Client, Intents } = require('discord.js');

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

const session = BookingManager.Instance;
const appointmentManager = AppointmentManager.Instance;
let guild;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	guild = client.guilds.cache.get(process.env.GUILD_ID);
	appointmentManager.initiate(guild);
	appointmentManager.observeWaitingRoom();
});

client.on('messageCreate', async (message) => {
	if (message.author.id === process.env.CLIENT_ID) return;
	if (message.inGuild()) {
		console.log('I got a message: ', message.content, message.author.id);
	} else {
		console.log('I got a DM: ', message.content);
		if (session.isActive(message.author.id)) handleDirectMessage(message);
	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isButton()) {
		handleButtonInteraction(interaction);
		return;
	}

	if (interaction.isCommand()) {
		handleCommandInteraction(interaction);
		return;
	}

	console.log('Got undefined interaction:', interaction.type);
	return;
});

// client.on('voiceStateUpdate', async (oldState, newState) => {
// 	if (oldState.name !== 'Waiting Room' && newState.channelId !== null) {
// 		const id = newState.id;
// 		const user = guild.members.cache.get(id);
// 		if (user !== undefined && user.voice.channel.name === 'Waiting Room') {
// 			let channel = guild.channels.cache.find(
// 				(channel) => channel.name === 'test'
// 			);
// 			user.send('Hello, I will move you!');
// 			user.voice.setChannel(channel).catch((err) => console.log(err));
// 		}
// 	}
// });

client.login(process.env.CLIENT_TOKEN);

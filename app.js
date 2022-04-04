'use strict';
require('dotenv').config();
import { registerCommands } from './src/commandsUtil.ts';
import { handleButtonInteraction } from './src/handler/ButtonHandler';
import { handleCommandInteraction } from './src/handler/CommandHandler';

//registerCommands();

const { Client, Intents } = require('discord.js');

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
	if (message.author.id === client.id) return;
	if (message.inGuild()) {
		console.log('I got a message: ', message.content);
	} else {
		console.log('I got a DM: ', message.content);
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
});

client.login(process.env.CLIENT_TOKEN);

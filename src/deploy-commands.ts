require('dotenv').config();
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export function registerCommands() {
	const clientId = process.env.CLIENT_ID;
	const guildId = process.env.GUILD_ID;
	const token = process.env.CLIENT_TOKEN;

	const commands = [
		new SlashCommandBuilder()
			.setName('ping')
			.setDescription('Sends private booking menu.'),
		new SlashCommandBuilder()
			.setName('init')
			.setDescription('Sends private booking menu.'),
		new SlashCommandBuilder()
			.setName('cdm')
			.setDescription('Sends private booking menu.'),
		new SlashCommandBuilder()
			.setName('clean')
			.setDescription('Sends private booking menu.'),
	].map((command) => command.toJSON());

	const rest = new REST({ version: '9' }).setToken(token!);

	rest
		.put(Routes.applicationGuildCommands(clientId!, guildId!), {
			body: commands,
		})
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}

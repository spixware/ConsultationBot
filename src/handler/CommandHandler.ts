import { CommandInteraction } from 'discord.js';
import { emoticons } from '../emoticons';
import { buildMainMenu, buildStartMenu } from '../MenuBuilder';

export async function handleCommandInteraction(
	interaction: CommandInteraction
) {
	switch (interaction.commandName) {
		case 'ping':
			interaction.reply('Pong!');
			break;
		case 'init':
			interaction.reply(buildMainMenu());
			break;

		case 'cdm': // dev
			const dmChannel = await interaction.user.createDM();
			console.log(await dmChannel.messages.fetch());
			dmChannel.send('Created DM channel with you!');
			break;

		case 'clean':
			interaction.deferReply();
			console.log('gonna clean up');
			const channel = interaction.channel;
			await channel!.messages.fetch().then((fetched) =>
				fetched.forEach((msg) => {
					console.log('removing: ' + msg);
					msg.delete();
				})
			);
			console.log('done');
			interaction.deleteReply();
			break;
	}
}

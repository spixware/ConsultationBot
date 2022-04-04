import { ButtonInteraction } from 'discord.js';
import { buildStartMenu } from '../MenuBuilder';

export async function handleButtonInteraction(interaction: ButtonInteraction) {
	const buttonId = interaction.customId;
	switch (buttonId) {
		case 'start':
			interaction.user.createDM();
			interaction.user.send(buildStartMenu());
			break;
		case 'apply':
			interaction.update(buildStartMenu());
			break;
		case 'backwards':
			interaction.update(buildStartMenu());
			break;
		case 'forwards':
			interaction.update(buildStartMenu());
			break;
		case 'name':
			interaction.update(buildStartMenu());
			break;
		case 'matrNum':
			interaction.update(buildStartMenu());
			break;
	}
}

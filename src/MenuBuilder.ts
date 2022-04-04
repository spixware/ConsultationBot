import {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	MessageButtonStyleResolvable,
} from 'discord.js';

const buttons = {
	start: buildButton('start', 'Start Booking', 'PRIMARY'),
	apply: buildButton('apply', 'Apply', 'SUCCESS'),
	navBack: buildButton('backwards', '<-', 'SECONDARY'),
	navFor: buildButton('forwards', '->', 'SECONDARY'),
	provideName: buildButton('name', 'Enter Name', 'PRIMARY'),
	provideMatrNumber: buildButton('matrNum', 'Enter Student ID', 'PRIMARY'),
	shiftMenu: buildButton('shift', 'Shift', 'PRIMARY'),
	reminderMenu: buildButton('reminder', 'Reminder', 'PRIMARY'),
	cancelMenu: buildButton('cancel', 'Cancel', 'PRIMARY'),
	checkMenu: buildButton('check', 'Check', 'PRIMARY'),
	instructionsMenu: buildButton('instructions', 'Instructions', 'PRIMARY'),
};

function buildButton(
	id: string,
	label: string,
	style: MessageButtonStyleResolvable
): MessageButton {
	return new MessageButton().setCustomId(id).setLabel(label).setStyle(style);
}

export function buildMainMenu() {
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Consultation Booking')
		.setDescription(
			'Let me know, if there is somehing I can help with. You can see my differnt capabilities below!'
		)
		.addFields(
			{
				name: 'Start Booking',
				value:
					'With that I can guide you through the appointment booking process.',
			},
			{
				name: 'Shift',
				value: 'Shift an existing appointment',
			},
			{
				name: 'Cancel',
				value: 'Cancel an appointment.',
			},
			{
				name: 'Check',
				value: 'Request all appointments that you are registered for.',
			},
			{
				name: 'Instructions',
				value:
					'Get the mandatory guidline about this whole appointment process and what to do on time.',
			},
			{
				name: 'Reminder',
				value:
					'Create or delete reminder, so I can inform you about upcomming appointments.',
			}
		);
	const row = new MessageActionRow().addComponents(
		buttons.start,
		buttons.checkMenu,
		buttons.cancelMenu,
		buttons.reminderMenu,
		buttons.shiftMenu
	);

	return {
		//content: 'My name is Yzi, how may I help you?',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestMenu() {
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Contact Informations')
		.setDescription('')
		.addFields(
			{
				name: 'Name:',
				value: student,
			},
			{
				name: 'Matriculation Number:',
				value: '1. your name\n 2. your matriculation number',
			}
		);

	const row = new MessageActionRow().addComponents(
		buttons.provideName,
		buttons.provideMatrNumber
	);
}

export function buildStartMenu() {
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Consultation Booking')
		.setDescription("Welcome to Yzi's appointment booking service.")
		.addFields({
			name: 'I need to know you better, therefore I ask you to provide:',
			value: '1. your name\n 2. your matriculation number',
		});

	const row = new MessageActionRow().addComponents(
		buttons.provideName,
		buttons.provideMatrNumber
	);

	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

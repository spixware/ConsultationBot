import { MessageEmbed, MessageActionRow } from 'discord.js';
import moment from 'moment';
import BUTTONS from './Buttons';
import { emoticons } from './emoticons';
import SessionManager from './SessionManager';
import Student, { Status } from './Student';

const session = SessionManager.Instance;

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
	const row = new MessageActionRow().addComponents(BUTTONS.start);

	return {
		embeds: [embed],
		components: [row],
	};
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
		BUTTONS.provideName,
		BUTTONS.provideMatrNumber
	);

	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestMenu(userId: string) {
	let student = session.getStudent(userId);

	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Contact Informations')
		.setDescription('')
		.addFields(
			{
				name: 'Name:',
				value:
					student !== undefined && student.name !== ''
						? student.name
						: 'No name provided yet.',
			},
			{
				name: 'Matriculation Number:',
				value:
					student !== undefined && student.matrNum !== ''
						? student.matrNum
						: 'No matricuation number provided yet.',
			}
		);

	const row = new MessageActionRow().addComponents(
		BUTTONS.provideName,
		BUTTONS.provideMatrNumber
	);

	if (student?.status === Status.FORM_COMPLETE) {
		row.addComponents(BUTTONS.continue);
	}

	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestNameMenu() {
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Enter your Name')
		.addFields({
			name: 'Please tell me your name!',
			value: emoticons.WRITING,
		});
	const row = new MessageActionRow().addComponents(BUTTONS.cancel);
	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestMatrNumMenu() {
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Enter your matriculation number!')
		.addFields({
			name: 'Please tell me your matriculation number!',
			value: emoticons.WRITING,
		});
	const row = new MessageActionRow().addComponents(BUTTONS.cancel);
	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildAppointmentMenu(userId: string) {
	let student = session.getStudent(userId);
	let prof = student!.cache.professor;
	let time = student!.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Details about your appointment:')
		.addFields(
			{
				name:
					emoticons.PROF + ' The professor that you have an appointment with: ',
				value: prof !== '' ? prof : 'No prof selected',
			},
			{
				name: emoticons.CALENDAR + ' The time and date of the appointment: ',
				value: time !== 0 ? moment(time).format() : 'No time and date selected',
			}
		);
	const row = new MessageActionRow().addComponents(
		BUTTONS.navBack,
		BUTTONS.profMenu,
		BUTTONS.timeMenu,
		BUTTONS.cancel
	);
	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestProfMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}
	let scrollWidth = adjustScrollWidth(student, 1);

	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Professors')
		.addFields({
			name: 'Choose your professor!',
			value:
				' Use ' +
				emoticons.LEFT_ARROW +
				' and ' +
				emoticons.RIGHT_ARROW +
				' to navigate!',
		});

	const row = new MessageActionRow().addComponents(
		BUTTONS.navBack,
		BUTTONS.profs[scrollWidth].selectProf,
		BUTTONS.profs[scrollWidth + 1].selectProf,
		BUTTONS.profs[scrollWidth + 2].selectProf,
		BUTTONS.navFor
	);
	return {
		content: 'Follow these guidlines:',
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestTimeMenu(userId: string) {
	return refreshMenu(userId);
}

export function refreshMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student?.status === Status.LISTEN_FOR_PROF) {
		return buildRequestProfMenu(userId);
	} else {
		return buildStartMenu();
	}
}

function adjustScrollWidth(student: Student, max: number): number {
	if (student.scrollWidth > max) {
		student.scrollWidth = 0;
	} else if (student.scrollWidth < 0) {
		student.scrollWidth = max;
	}
	return student.scrollWidth;
}

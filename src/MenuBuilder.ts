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
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}

	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Contact Informations')
		.setDescription('')
		.addFields(
			{
				name: 'Name:',
				value:
					student !== undefined && student.name !== ''
						? student.name + ' ' + emoticons.CHECK
						: 'No name provided yet. ' + emoticons.EMPTY,
			},
			{
				name: 'Matriculation Number:',
				value:
					student !== undefined && student.matrNum !== ''
						? student.matrNum + ' ' + emoticons.CHECK
						: 'No matricuation number provided yet. ' + emoticons.EMPTY,
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
		embeds: [embed],
		components: [row],
	};
}

export function buildAppointmentMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}
	let prof = student!.cache.professor;
	let time = student!.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Details about your appointment:')
		.addFields(
			{
				name:
					emoticons.PROF + ' The professor that you have an appointment with: ',
				value:
					prof !== ''
						? prof + ' ' + emoticons.CHECK
						: 'No prof selected ' + emoticons.EMPTY,
			},
			{
				name: emoticons.CALENDAR + ' The time and date of the appointment: ',
				value:
					time !== 0
						? moment.unix(time).format('DD-MMMM-YYYY HH:mm') +
						  ' ' +
						  emoticons.CHECK
						: 'No time and date selected ' + emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		BUTTONS.profMenu,
		BUTTONS.dateTime,
		BUTTONS.cancel
	);

	if (student.status === Status.CACHE_COMPLETE)
		row.addComponents(BUTTONS.continue);

	return {
		embeds: [embed],
		components: [row],
	};
}

export function buildAppointmentSuccessfulMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}
	let prof = student.cache.professor;
	let date = moment.unix(student.cache.time).format('Do-MMMM-YYYY');
	let time = moment.unix(student.cache.time).format('HH:mm a');
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle(
			'Hey ' +
				student.name +
				' I successfully booked a consultation appointment for you!'
		)
		.addFields({
			name:
				'You have an appoitment with ' +
				student.cache.professor +
				' on ' +
				date +
				' at ' +
				time,
			value:
				'Use the main menu on the server for further options and instrucations!',
		});

	if (student.status === Status.CACHE_COMPLETE)
		session.updateStudentStatus(userId, Status.REGISTERED);

	return {
		embeds: [embed],
		components: [],
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
		embeds: [embed],
		components: [row],
	};
}

export function buildTimeDateMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}
	let time = student.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Time & Date Information')
		.addFields(
			{
				name: emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + emoticons.CHECK
						: 'No date selected ' + emoticons.EMPTY,
			},
			{
				name: emoticons.CLOCK + ' Time:',
				value:
					time !== 0
						? moment.unix(time).format('HH:mm') + emoticons.CHECK
						: 'No time selected ' + emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		BUTTONS.cancel,
		BUTTONS.continue
	);
	return {
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestTimeMenu(userId: string) {
	let student = session.getStudent(userId);
	if (student === undefined) {
		return buildStartMenu();
	}
	let time = student.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle("Enter Time like '14:30'")
		.addFields(
			{
				name: emoticons.CLOCK + ' Time:',
				value: 'No time selected ' + emoticons.EMPTY,
			},
			{
				name: emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + emoticons.CHECK
						: 'No date selected ' + emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(BUTTONS.cancel);
	return {
		embeds: [embed],
		components: [row],
	};
}

export function buildRequestDateMenu(userId: string) {
	let student = session.getStudent(userId);
	let time = student?.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle("Enter Date like 'DD-MM-YYYY'")
		.addFields({
			name: emoticons.CALENDAR + ' Date:',
			value:
				time !== 0
					? emoticons.CALENDAR +
					  ' ' +
					  moment.unix(time!).format('"Do-MMMM-YYYY"') +
					  ' ' +
					  emoticons.CHECK
					: 'No date selected ' + emoticons.EMPTY,
		});
	const row = new MessageActionRow().addComponents(BUTTONS.cancel);
	return {
		embeds: [embed],
		components: [row],
	};
}

export function buildCheckMenu(userId: string) {
	let student = session.getStudent(userId);
	let prof = student!.cache.professor;
	let time = student!.cache.time;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Check your Stats')
		.addFields(
			{
				name: emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + emoticons.CHECK
						: 'No date selected ' + emoticons.EMPTY,
			},
			{
				name: emoticons.CLOCK + ' Time:',
				value:
					time !== 0
						? moment.unix(time).format('HH:mm') + ' ' + emoticons.CHECK
						: 'No time selected ' + emoticons.EMPTY,
			},
			{
				name:
					emoticons.PROF + ' The professor that you have an appointment with: ',
				value:
					prof !== ''
						? prof + ' ' + emoticons.CHECK
						: 'No prof selected ' + emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		BUTTONS.cancel,
		BUTTONS.submit
	);
	return {
		embeds: [embed],
		components: [row],
	};
}

export function refreshMenu(userId: string) {
	let status = session.getStudent(userId)?.status;
	let menu = buildStartMenu();
	if (status === Status.FORM_COMPLETE) {
		menu = buildRequestMenu(userId);
	} else if (
		status === Status.LISTEN_FOR_TIME ||
		status === Status.LISTEN_FOR_DATE
	) {
		session.updateStudentStatus(userId, Status.FORM_COMPLETE);
		menu = buildAppointmentMenu(userId);
	} else if (status === Status.LISTEN_FOR_PROF) {
		menu = buildRequestProfMenu(userId);
	} else {
		session.cancelSession(userId);
	}
	return menu;
}

function adjustScrollWidth(student: Student, max: number): number {
	if (student.scrollWidth > max) {
		student.scrollWidth = 0;
	} else if (student.scrollWidth < 0) {
		student.scrollWidth = max;
	}
	return student.scrollWidth;
}

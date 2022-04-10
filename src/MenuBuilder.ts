import { MessageEmbed, MessageActionRow } from 'discord.js';
import moment from 'moment';
import { Emoticons } from './resources/Emoticons';
import BookingManager from './managers/SessionManager';
import Student, { Status } from './entities/Student';
import Buttons from './resources/Buttons';

const session = BookingManager.Instance;

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
	const row = new MessageActionRow().addComponents(Buttons.start);

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
		Buttons.provideName,
		Buttons.provideMatrNumber
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
						? student.name + ' ' + Emoticons.CHECK
						: 'No name provided yet. ' + Emoticons.EMPTY,
			},
			{
				name: 'Matriculation Number:',
				value:
					student !== undefined && student.matrNum !== ''
						? student.matrNum + ' ' + Emoticons.CHECK
						: 'No matricuation number provided yet. ' + Emoticons.EMPTY,
			}
		);

	const row = new MessageActionRow().addComponents(
		Buttons.provideName,
		Buttons.provideMatrNumber
	);

	if (student?.status === Status.FORM_COMPLETE) {
		row.addComponents(Buttons.continue);
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
			value: Emoticons.WRITING,
		});
	const row = new MessageActionRow().addComponents(Buttons.cancel);
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
			value: Emoticons.WRITING,
		});
	const row = new MessageActionRow().addComponents(Buttons.cancel);
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
					Emoticons.PROF + ' The professor that you have an appointment with: ',
				value:
					prof !== ''
						? prof + ' ' + Emoticons.CHECK
						: 'No prof selected ' + Emoticons.EMPTY,
			},
			{
				name: Emoticons.CALENDAR + ' The time and date of the appointment: ',
				value:
					time !== 0
						? moment.unix(time).format('DD-MMMM-YYYY HH:mm') +
						  ' ' +
						  Emoticons.CHECK
						: 'No time and date selected ' + Emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		Buttons.profMenu,
		Buttons.dateTime,
		Buttons.cancel
	);

	if (student.status === Status.CACHE_COMPLETE)
		row.addComponents(Buttons.continue);

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
				'You have an appoitment with ' + prof + ' on ' + date + ' at ' + time,
			value:
				'Use the main menu on the server for further options and instructions!',
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
				Emoticons.LEFT_ARROW +
				' and ' +
				Emoticons.RIGHT_ARROW +
				' to navigate!',
		});

	const row = new MessageActionRow().addComponents(
		Buttons.navBack,
		Buttons.profs[scrollWidth].selectProf,
		Buttons.profs[scrollWidth + 1].selectProf,
		Buttons.profs[scrollWidth + 2].selectProf,
		Buttons.navFor
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
				name: Emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + Emoticons.CHECK
						: 'No date selected ' + Emoticons.EMPTY,
			},
			{
				name: Emoticons.CLOCK + ' Time:',
				value:
					time !== 0
						? moment.unix(time).format('HH:mm') + Emoticons.CHECK
						: 'No time selected ' + Emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		Buttons.cancel,
		Buttons.continue
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
				name: Emoticons.CLOCK + ' Time:',
				value: 'No time selected ' + Emoticons.EMPTY,
			},
			{
				name: Emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + Emoticons.CHECK
						: 'No date selected ' + Emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(Buttons.cancel);
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
			name: Emoticons.CALENDAR + ' Date:',
			value:
				time !== 0
					? Emoticons.CALENDAR +
					  ' ' +
					  moment.unix(time!).format('"Do-MMMM-YYYY"') +
					  ' ' +
					  Emoticons.CHECK
					: 'No date selected ' + Emoticons.EMPTY,
		});
	const row = new MessageActionRow().addComponents(Buttons.cancel);
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
				name: Emoticons.CALENDAR + ' Date:',
				value:
					time !== 0
						? moment.unix(time).format('Do-MMMM-YYYY') + ' ' + Emoticons.CHECK
						: 'No date selected ' + Emoticons.EMPTY,
			},
			{
				name: Emoticons.CLOCK + ' Time:',
				value:
					time !== 0
						? moment.unix(time).format('HH:mm') + ' ' + Emoticons.CHECK
						: 'No time selected ' + Emoticons.EMPTY,
			},
			{
				name:
					Emoticons.PROF + ' The professor that you have an appointment with: ',
				value:
					prof !== ''
						? prof + ' ' + Emoticons.CHECK
						: 'No prof selected ' + Emoticons.EMPTY,
			}
		);
	const row = new MessageActionRow().addComponents(
		Buttons.cancel,
		Buttons.submit
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

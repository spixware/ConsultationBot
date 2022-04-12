import { Message } from 'discord.js';
import {
	buildAppointmentMenu,
	buildMyAppointmentMenu,
	buildRequestMenu,
	buildRequestTimeMenu,
} from '../MenuBuilder';
import BookingManager from '../managers/BookingManager';
import Student, { Status } from '../entities/Student';
import moment from 'moment';
import { AppliedProfs } from '../resources/AppliedProfs';

const session = BookingManager.Instance;
export async function handleDirectMessage(message: Message) {
	console.log('content', message.content);
	const userId = message.author.id;
	const student: Student | undefined = session.getStudent(userId);
	const interaction = session.getSession(userId);
	console.log(student?.status);

	if (student === undefined) {
		console.log('DM from unknown student!');
		return;
	}

	if (student.status === Status.IDLE) return;
	if (student.status === Status.LISTEN_FOR_NAME) {
		student.name = message.content;
		checkFormCompletion(student);
		if (interaction !== undefined) {
			interaction.editReply(buildRequestMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}
	if (student.status === Status.LISTEN_FOR_MATRNUM) {
		student.matrNum = message.content;
		checkFormCompletion(student);
		if (interaction !== undefined) {
			interaction.editReply(buildRequestMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}

	if (student.status === Status.LISTEN_FOR_TIME) {
		let day = moment.unix(student.cache.time);
		let time = message.content.split(':');
		day.hours(parseFloat(time[0]));
		day.minutes(parseFloat(time[1]));
		console.log(day.format('DD-MM-YYYY HH:mm'));
		console.log(student.cache.professor);

		const timeValid: boolean = AppliedProfs.checkValidTime(
			day.unix(),
			student.cache.professor
		);

		console.log(timeValid);

		if (interaction !== undefined && timeValid && day.isValid()) {
			student.cacheTime(day.unix());
			session.updateStudentStatus(userId, Status.CACHE_COMPLETE);
			interaction.editReply(buildAppointmentMenu(userId));
		} else if ((interaction !== undefined && !timeValid) || !day.isValid()) {
			message.author.send(
				'Sorry, but you cannot book at that time. Please keep your time in the stated time range! Make sure to select no time that is in the past!'
			);
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}

	if (student.status === Status.LISTEN_FOR_DATE) {
		const date = moment(message.content, 'DD MM YYYY').startOf('day').unix();
		const dateValid = AppliedProfs.checkValidDay(date, student.cache.professor);

		if (interaction !== undefined && dateValid && moment.unix(date).isValid()) {
			student.cacheTime(date);
			session.updateStudentStatus(userId, Status.LISTEN_FOR_TIME);
			interaction.editReply(buildRequestTimeMenu(userId));
		} else if (interaction !== undefined && !dateValid) {
			interaction?.user.send(
				'Sorry, the professor does not acknowledge consultations on that day or days in the past. Please refer to the stated weekdays!'
			);
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}
	if (student.status === Status.LISTEN_FOR_REMINDER) {
		let text = message.content;
		let appointment = session
			.getAppointments(userId)
			.find((app) => app.timestamp === student.edits);

		if (!isReminderInputValid(text) && appointment !== undefined) {
			console.log('message includes unwanted characters', message.content);
			interaction?.user.send(
				'I do not know what you meant. Please use exactly this format: "hh:mm", ex. "1:30" aka. 1,5 hour before the appointment.) '
			);
			interaction?.editReply(
				buildMyAppointmentMenu(userId, appointment.prof, appointment.timestamp)
			);
			session.updateStudentStatus(userId, Status.REGISTERED);
			return;
		} else if (appointment === undefined) {
			interaction?.editReply({
				content: 'This reminder menu is outdated. Please re-initiate menu!',
				embeds: [],
				components: [],
			});
			session.updateStudentStatus(userId, Status.REGISTERED);
			return;
		}

		let hours = text.split(':')[0];
		let minutes = text.split(':')[1];
		let reminderTime = moment
			.unix(appointment!.timestamp)
			.clone()
			.subtract(hours, 'hours')
			.subtract(minutes, 'minutes');

		if (reminderTime.isBefore(moment())) {
			interaction?.user.send(
				'I do not know what you meant. Please use exactly this format: "hh:mm", ex. "1:30" aka. 1,5 hour before the appointment.) '
			);
			interaction?.editReply(
				buildMyAppointmentMenu(userId, appointment.prof, appointment.timestamp)
			);
			session.updateStudentStatus(userId, Status.REGISTERED);
			return;
		}

		appointment.customReminder = reminderTime.unix();
		message.author.send(
			'You will be notified on ' +
				moment.unix(appointment.customReminder).format('Do MMMM') +
				' at ' +
				moment.unix(appointment.customReminder).format('HH:mm')
		);
		interaction?.editReply(
			buildMyAppointmentMenu(userId, appointment.prof, appointment.timestamp)
		);
		session.updateStudentStatus(userId, Status.REGISTERED);
	}
}

function checkFormCompletion(student: Student) {
	if (student.name !== '' && student.matrNum !== '')
		student.status = Status.FORM_COMPLETE;
}

function isReminderInputValid(text: string) {
	for (let i = 0; i < text.length; i++) {
		if (!text[i].match(/[a-z]*[-!$%^&*()_+|~=`{}\[\]";'<>?,.\/]/) === null) {
			return false;
		}
	}
	return true;
}

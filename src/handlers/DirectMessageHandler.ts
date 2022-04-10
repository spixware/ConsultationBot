import { Message } from 'discord.js';
import {
	buildAppointmentMenu,
	buildRequestMenu,
	buildRequestTimeMenu,
	refreshMenu,
} from '../MenuBuilder';
import BookingManager from '../managers/BookingManager';
import Student, { Status } from '../entities/Student';
import moment from 'moment';

const session = BookingManager.Instance;
export async function handleDirectMessage(message: Message) {
	const userId = message.author.id;
	const student: Student | undefined = session.getStudent(userId);
	const interaction = session.getSession(userId);

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

		student.cacheTime(day.unix());
		if (student.cache.professor === '') {
			session.updateStudentStatus(userId, Status.LISTEN_FOR_PROF);
		} else {
			session.updateStudentStatus(userId, Status.CACHE_COMPLETE);
		}
		if (interaction !== undefined) {
			interaction.editReply(buildAppointmentMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}
	if (student.status === Status.LISTEN_FOR_DATE) {
		student.cacheTime(
			moment(message.content, 'DD-MM-YYYY').startOf('day').unix()
		);
		session.updateStudentStatus(userId, Status.LISTEN_FOR_TIME);
		if (interaction !== undefined) {
			interaction.editReply(buildRequestTimeMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}
	interaction?.editReply(refreshMenu(userId));
}

function checkFormCompletion(student: Student) {
	if (student.name !== '' && student.matrNum !== '')
		student.status = Status.FORM_COMPLETE;
}

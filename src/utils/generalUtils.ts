import { ButtonInteraction } from 'discord.js';
import moment from 'moment';
import BookingManager from '../managers/SessionManager';
import Student, { Status } from '../entities/Student';

const session = BookingManager.Instance;

export function mockAppointment() {
	const userId = process.env.USER_ID;
	const developer = new Student(userId!);
	let inAMoment = moment().add(20, 'seconds');
	developer.name = 'Max';
	developer.matrNum = '554721';
	developer.cacheProf('Prof. Dr. Johann H. Israel');
	developer.cacheTime(inAMoment.unix());
	developer.status = Status.CACHE_COMPLETE;
	session.devShortcut(developer, userId!);
	session.submitAppointment(userId!);
}

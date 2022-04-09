import { ButtonInteraction } from 'discord.js';
import moment from 'moment';
import SessionManager from './SessionManager';
import Student, { Status } from './Student';

const session = SessionManager.Instance;

export function mockAppointment(userId: string) {
	const developer = new Student(userId);
	let inAMoment = moment.unix(moment.now()).add(20, 'seconds');
	developer.name = 'Max';
	developer.matrNum = '554721';
	developer.cacheProf('Prof. Dr. Israel');
	developer.cacheTime(inAMoment.unix());
	developer.status = Status.CACHE_COMPLETE;
	session.devShortcut(developer, userId);
	session.submitAppointment(userId);
}

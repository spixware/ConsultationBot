import moment from 'moment';
import BookingManager from '../managers/BookingManager';
import Student, { Status } from '../entities/Student';

const session = BookingManager.Instance;

export function mockAppointment() {
	const userId = process.env.USER_ID;
	const developer = new Student(userId!);
	const inAMoment = moment().add(3, 'minutes');
	developer.name = 'Max';
	developer.matrNum = '554721';
	developer.cacheProf('Prof. Dr. Johann H. Israel');
	developer.cacheTime(inAMoment.unix());
	developer.status = Status.CACHE_COMPLETE;
	session.devShortcut(developer, userId!);
	session.submitAppointment(userId!);
	// session.submitReminder(
	// 	userId!,
	// 	inAMoment.unix(),
	// 	inAMoment.subtract(130, 'seconds').unix()
	// );
}

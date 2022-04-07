import { Message } from 'discord.js';
import { buildRequestMenu } from '../MenuBuilder';
import SessionManager from '../SessionManager';
import Student, { Status } from '../Student';

const session = SessionManager.Instance;
export async function handleDirectMessage(message: Message) {
	const userId = message.author.id;
	const student: Student | undefined = session.getStudent(userId);
	const interaction = session.getSession(userId);

	if (student === undefined) return;

	if (student.status === Status.IDLE) return;
	if (student.status === Status.LISTEN_FOR_NAME) {
		student.name = message.content;
		checkForCompletion(student);
		if (interaction !== undefined) {
			interaction.editReply(buildRequestMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;
	}
	if (student.status === Status.LISTEN_FOR_MATRNUM) {
		student.matrNum = message.content;
		checkForCompletion(student);
		if (interaction !== undefined) {
			interaction.editReply(buildRequestMenu(userId));
		} else {
			console.log('Failed to update Interaction!');
		}
		return;

		return;
	}
}

function checkForCompletion(student: Student) {
	if (student.name !== '' && student.matrNum !== '')
		student.status = Status.FORM_COMPLETE;
}

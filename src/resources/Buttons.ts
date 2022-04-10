import { MessageButton, MessageButtonStyleResolvable } from 'discord.js';
import { Emoticons } from './Emoticons';

const Buttons = {
	start: buildButton('start', 'Start Booking', 'PRIMARY'),
	continue: buildButton('continue', 'Continue', 'SUCCESS'),
	navBack: buildButton('backwards', Emoticons.LEFT_ARROW, 'SECONDARY'),
	navFor: buildButton('forwards', Emoticons.RIGHT_ARROW, 'SECONDARY'),
	provideName: buildButton('name', 'Enter Name', 'PRIMARY'),
	provideMatrNumber: buildButton('matrNum', 'Enter Student ID', 'PRIMARY'),
	shiftMenu: buildButton('shift', 'Shift', 'PRIMARY'),
	reminderMenu: buildButton('reminder', 'Reminder', 'PRIMARY'),
	cancel: buildButton('cancel', 'Cancel', 'DANGER'),
	checkMenu: buildButton('check', 'Check', 'PRIMARY'),
	instructionsMenu: buildButton('instructions', 'Instructions', 'PRIMARY'),
	submit: buildButton('submit', 'Book Appointment', 'SUCCESS'),
	profMenu: buildButton(
		'prof',
		'Select Professor ' + Emoticons.PROF,
		'PRIMARY'
	),
	profs: [
		{ selectProf: buildButton('p_israel', 'J.H. Israel', 'PRIMARY') },
		{ selectProf: buildButton('p_wulff', 'D. Weber-Wulff', 'PRIMARY') },
		{ selectProf: buildButton('p_lenz', 'T. Lenz', 'PRIMARY') },
		{ selectProf: buildButton('p_kleinen', 'B. Kleinen', 'PRIMARY') },
	],

	dateTime: buildButton(
		'dateTime',
		'Enter Date & Time' + Emoticons.CALENDAR,
		'PRIMARY'
	),
};

function buildButton(
	id: string,
	label: string,
	style: MessageButtonStyleResolvable
): MessageButton {
	return new MessageButton().setCustomId(id).setLabel(label).setStyle(style);
}

export default Buttons;

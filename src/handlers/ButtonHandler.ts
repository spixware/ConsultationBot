import { ButtonInteraction, MessageActionRow } from 'discord.js';
import {
	buildAppointmentMenu,
	buildRequestMatrNumMenu,
	buildRequestMenu,
	buildRequestNameMenu,
	buildRequestProfMenu,
	buildStartMenu,
	refreshMenu,
	buildRequestDateMenu,
	buildCheckMenu,
	buildAppointmentSuccessfulMenu,
} from '../MenuBuilder';
import BookingManager from '../managers/SessionManager';
import { Status } from '../entities/Student';

const session: BookingManager = BookingManager.Instance;

export async function handleButtonInteraction(interaction: ButtonInteraction) {
	const buttonId = interaction.customId;
	const userId = interaction.user.id;
	const sessionExists = session.isActive(userId);
	const student = session.getStudent(userId);
	const status = student?.status;
	let menu;
	switch (buttonId) {
		case 'start':
			if (sessionExists) {
				session.cancelSession(userId);
			}
			if (student?.status === Status.FORM_COMPLETE) {
				menu = buildRequestMenu(userId);
			} else {
				menu = buildStartMenu();
			}
			interaction.user.send(menu);
			interaction.deferReply();
			interaction.deleteReply();
			break;
		case 'continue':
			if (status === Status.FORM_COMPLETE) {
				menu = buildAppointmentMenu(userId);
			} else if (status === Status.CACHE_COMPLETE) {
				menu = buildCheckMenu(userId);
			} else {
				menu = refreshMenu(userId);
			}
			if (!sessionExists) session.startSession(userId, interaction);
			interaction.update(menu);
			break;

		case 'submit':
			if (status === Status.CACHE_COMPLETE) {
				menu = buildAppointmentSuccessfulMenu(userId);
			} else {
				menu = refreshMenu(userId);
			}
			session.submitAppointment(userId);
			interaction.update(menu);
			break;
		case 'backwards':
			if (student !== undefined) {
				student.scrollWidth -= 1;
			}
			interaction.update(refreshMenu(userId));
			break;
		case 'forwards':
			if (student !== undefined) {
				student.scrollWidth += 1;
			}
			interaction.update(refreshMenu(userId));
			break;
		case 'name':
			if (!sessionExists) {
				interaction.user.createDM();
				session.startSession(userId, interaction);
			}
			interaction.update(buildRequestNameMenu());
			session.updateStudentStatus(userId, Status.LISTEN_FOR_NAME);
			break;
		case 'matrNum':
			if (!sessionExists) {
				interaction.user.createDM();
				session.startSession(userId, interaction);
			}
			interaction.update(buildRequestMatrNumMenu());
			session.updateStudentStatus(userId, Status.LISTEN_FOR_MATRNUM);
			break;
		case 'cancel':
			if (status === Status.CACHE_COMPLETE) {
				menu = buildRequestMenu(userId);
			}
			menu = refreshMenu(userId);
			interaction.update(menu);
			break;
		case 'p_israel':
			student?.cacheProf('Prof. Dr. Johann H. Israel');
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_wulff':
			student?.cacheProf('Prof. Dr. Debora Weber-Wulff');
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_lenz':
			student?.cacheProf('Prof. Dr. Tobias Lenz');
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_kleinen':
			student?.cacheProf('Prof. Dr. Barne Kleinen');
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'prof':
			interaction.update(buildRequestProfMenu(userId));
			session.updateStudentStatus(userId, Status.LISTEN_FOR_PROF);
			break;
		case 'dateTime':
			interaction.update(buildRequestDateMenu(userId));
			session.updateStudentStatus(userId, Status.LISTEN_FOR_DATE);
			break;
	}
}

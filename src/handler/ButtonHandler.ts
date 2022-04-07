import { ButtonInteraction, MessageActionRow } from 'discord.js';
import { update } from 'lodash';
import {
	buildAppointmentMenu,
	buildRequestMatrNumMenu,
	buildRequestMenu,
	buildRequestNameMenu,
	buildRequestProfMenu,
	buildRequestTimeMenu,
	buildStartMenu,
	refreshMenu,
} from '../MenuBuilder';
import SessionManager from '../SessionManager';
import { Status } from '../Student';

const session: SessionManager = SessionManager.Instance;

export async function handleButtonInteraction(interaction: ButtonInteraction) {
	const buttonId = interaction.customId;
	const userId = interaction.user.id;
	const sessionExists = session.isActive(userId);
	const student = session.getStudent(userId);
	switch (buttonId) {
		case 'start':
			let menu;
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
			interaction.update(buildAppointmentMenu(userId));
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
			session.cancelSession(userId);
			interaction.update(buildStartMenu());
			break;
		case 'p_israel':
			student?.cacheProf('Prof. Dr. Habakuk Israel');
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_wulff':
			interaction.update(buildRequestProfMenu(userId));
			break;
		case 'p_lenz':
			interaction.update(buildRequestProfMenu(userId));
			break;
		case 'p_kleinen':
			interaction.update(buildRequestProfMenu(userId));
			break;
		case 'prof':
			interaction.update(buildRequestProfMenu(userId));
			session.updateStudentStatus(userId, Status.LISTEN_FOR_PROF);
			break;
		case 'time':
			interaction.update(buildRequestTimeMenu(userId));
			session.updateStudentStatus(userId, Status.LISTEN_FOR_TIME);
			break;
	}
}

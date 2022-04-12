import {
	ButtonInteraction,
	Guild,
	MessageActionRow,
	VoiceChannel,
} from 'discord.js';
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
	buildInstructionsMenu,
	buildMyAppointmentMenu,
	buildReminderMenu,
} from '../MenuBuilder';
import BookingManager from '../managers/BookingManager';
import { Status } from '../entities/Student';
import { AppliedProfs } from '../resources/AppliedProfs';
import AppointmentManager from '../managers/AppointmentManager';

const session: BookingManager = BookingManager.Instance;

export async function handleButtonInteraction(
	interaction: ButtonInteraction,
	guild: Guild
) {
	interaction.user.createDM();
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
			if (
				status === Status.FORM_COMPLETE ||
				status === Status.CACHE_COMPLETE ||
				status === Status.REGISTERED
			) {
				menu = buildRequestMenu(userId);
			} else {
				menu = buildStartMenu();
			}
			interaction.user.send(menu);
			interaction.deferReply();
			interaction.deleteReply();
			break;
		case 'continue':
			if (status === Status.FORM_COMPLETE || status === Status.REGISTERED) {
				menu = buildAppointmentMenu(userId);
			} else if (status === Status.CACHE_COMPLETE) {
				menu = buildCheckMenu(userId);
			} else {
				menu = refreshMenu(userId);
			}
			if (!sessionExists) session.updateSession(userId, interaction);
			interaction.update(menu);
			break;
		case 'check':
			if (!sessionExists) session.updateSession(userId, interaction);
			let appointments = BookingManager.Instance.getAppointments(userId);
			if (appointments.length === 0) {
				interaction.user.send('You currently have no appointments!');
				break;
			} else {
				interaction.user.send(
					'Here are your current consultation appointments:'
				);
				appointments.forEach((app) => {
					interaction.user.send(
						buildMyAppointmentMenu(
							userId,
							app.prof,
							app.timestamp,
							app.customReminder
						)
					);
				});
			}
			break;
		case 'instructions':
			menu = buildInstructionsMenu();
			interaction.user.send(menu);
			interaction.deferReply();
			interaction.deleteReply();
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
				session.updateSession(userId, interaction);
			}
			interaction.update(buildRequestNameMenu());
			session.updateStudentStatus(userId, Status.LISTEN_FOR_NAME);
			break;
		case 'matrNum':
			if (!sessionExists) {
				interaction.user.createDM();
				session.updateSession(userId, interaction);
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
			interaction.user.send(
				AppliedProfs.Israel.name +
					' is available ' +
					AppliedProfs.Israel.timeWindow
			);
			student!.cache.time = 0;
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_wulff':
			student?.cacheProf('Prof. Dr. Debora Weber-Wulff');
			interaction.user.send(
				AppliedProfs.Wulff.name +
					' is available ' +
					AppliedProfs.Wulff.timeWindow
			);
			student!.cache.time = 0;
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_lenz':
			student?.cacheProf('Prof. Dr. Tobias Lenz');
			interaction.user.send(
				AppliedProfs.Lenz.name + ' is available ' + AppliedProfs.Lenz.timeWindow
			);
			student!.cache.time = 0;
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'p_kleinen':
			student?.cacheProf('Prof. Dr. Barne Kleinen');
			interaction.user.send(
				AppliedProfs.Kleinen.name +
					' is available ' +
					AppliedProfs.Kleinen.timeWindow
			);
			student!.cache.time = 0;
			interaction.update(buildAppointmentMenu(userId));
			break;
		case 'prof':
			session.updateStudentStatus(userId, Status.LISTEN_FOR_PROF);
			interaction.update(buildRequestProfMenu(userId));
			break;
		case 'dateTime':
			session.updateStudentStatus(userId, Status.LISTEN_FOR_DATE);
			interaction.update(buildRequestDateMenu(userId));
			break;
		default:
			session.updateSession(userId, interaction);
			if (buttonId.match(/^[0-9]+$/) !== null) {
				menu = {
					content: 'Student will be moved!',
					components: [],
					embeds: [],
				};
				const user = guild.members.cache.get(buttonId);
				if (user !== undefined) {
					user.send(
						'The professor has now time for you. You will be moved shortly!'
					);
					session.updateStudentStatus(buttonId, Status.APPLIED);
				} else {
					menu.content = 'Student left the Server!';
				}
				interaction.update(menu);
				break;
			} else if (buttonId.match(/^@appDel/)) {
				let time = parseFloat(buttonId.split('-')[1]);
				session.deleteAppointment(userId, time);
				interaction.update({
					content: 'I canceled this appointment!',
					embeds: [],
					components: [],
				});
			} else if (buttonId.match(/^@remAdd/)) {
				let time = parseFloat(buttonId.split('-')[1]);
				student!.edits = time;
				interaction.update(buildReminderMenu(userId, time));
				session.updateStudentStatus(userId, Status.LISTEN_FOR_REMINDER);
			} else if (buttonId.match(/^@remReturn/)) {
				let time = parseFloat(buttonId.split('-')[1]);
				let prof = session
					.getAppointments(userId)
					.find((app) => app.timestamp == time)?.prof;
				if (prof === undefined) {
					interaction.update({
						content: 'This reminder menu is outdated. Please re-initiate menu!',
						embeds: [],
						components: [],
					});
				} else {
					interaction.update(buildMyAppointmentMenu(userId, prof, time));
				}
				session.updateStudentStatus(userId, Status.REGISTERED);
			}
			break;
	}
}

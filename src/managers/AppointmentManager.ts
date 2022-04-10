import { Guild, GuildMember, VoiceChannel } from 'discord.js';
import moment from 'moment';
import BookingManager, { Consultation } from './SessionManager';
import Student, { Status } from '../entities/Student';

class AppointmentManager {
	constructor() {}
	private _agent: NodeJS.Timer | number | undefined;
	private _guild: Guild | undefined;
	private static _instance: AppointmentManager;
	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	public observeWaitingRoom() {
		let guild = this._guild;

		// set interval to watch waiting room
		this._agent = setInterval(this.watchInstructions, 10000, guild);
	}

	public initiate(guild: Guild) {
		this._guild = guild;
	}
	public sendMoveRequest(userId: string, cons: Consultation) {
		const session = BookingManager.Instance;
		const student = session.getStudent(userId);
		console.log('moving ' + student!.name);
		session.deleteAppointment(userId, student!.cache.time);
		session.cancelSession(userId);
	}

	private watchInstructions(guild: { channels: { cache: any[] } }): void {
		const session = BookingManager.Instance;
		guild.channels.cache
			.find((channel: VoiceChannel) => channel.name === 'Waiting Room')
			.members.forEach((member: GuildMember) => {
				const ID = member.user.id;
				const student = session.getStudent(ID);
				if (student !== undefined)
					console.log(
						member.user.tag +
							' aka ' +
							student?.name +
							' ' +
							student?.cache.professor +
							' ' +
							moment.unix(student!.cache.time)
					);
				if (student !== undefined && student.status === Status.REGISTERED) {
					session.getAppointments(ID).forEach((appointment) => {
						const now = moment();
						const dateTime = moment.unix(appointment.timestamp);

						if (dateTime.isAfter(now)) {
							const timeLeft = moment.duration(dateTime.diff(moment()));
							if (Math.abs(timeLeft.asSeconds()) < 300) {
								member.user.send(
									'Hey buddy, nice to see you in time for your meeting with ' +
										appointment.prof
								);
								member.send(
									'You got ' +
										timeLeft.asSeconds() +
										' seconds left, take a seat!'
								);
								// Send Request to Prof.
								session.updateStudentStatus(ID, Status.WAITING);
								AppointmentManager.Instance.sendMoveRequest(ID, appointment);
								return;
							} else {
								session.updateStudentStatus(ID, Status.REGISTERED);
								return;
							}
						} else if (dateTime.isBefore(now)) {
							const timeMiss = moment.duration(dateTime.diff(moment()));

							if (Math.abs(timeMiss.asSeconds()) < 300) {
								member.user.send(
									'Hey there, you are a bit late for your meeting with ' +
										appointment.prof
								);
								member.send(
									'Your meeting began ' +
										timeMiss.asSeconds() +
										' seconds ago! I will check, if the professor is still available. Take a seat!'
								);
								session.updateStudentStatus(ID, Status.WAITING);
								AppointmentManager.Instance.sendMoveRequest(ID, appointment);
								return;
							}
						}
						member.send(
							'You missed your consultation! ' +
								dateTime.format('Do MMMM YYYY HH:mm') +
								' ' +
								appointment.prof
						);
						session.updateStudentStatus(ID, Status.FORM_COMPLETE);
					});
				}
			});
	}
}

export default AppointmentManager;

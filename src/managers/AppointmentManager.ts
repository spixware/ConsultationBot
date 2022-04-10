import {
	Guild,
	GuildBasedChannel,
	GuildMember,
	GuildVoiceChannelResolvable,
	VoiceChannel,
} from 'discord.js';
import moment from 'moment';
import BookingManager, { Consultation } from './BookingManager';
import Student, { Status } from '../entities/Student';
import { AppliedProfs } from '../resources/AppliedProfs';
import { joinRequestMenu } from '../MenuBuilder';

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
	public sendMoveRequest(cons: Consultation) {
		let profUserId = '';
		console.log('Got a move Request from ' + cons.name + ' to ' + cons.prof);

		if (cons.prof === AppliedProfs.Israel.name) {
			profUserId = AppliedProfs.Israel.userId!;
		} else if (cons.prof === AppliedProfs.Kleinen.name) {
			profUserId = AppliedProfs.Kleinen.userId!;
		} else if (cons.prof === AppliedProfs.Lenz.name) {
			profUserId = AppliedProfs.Lenz.userId!;
		} else {
			profUserId = AppliedProfs.Wulff.userId!;
		}
		console.log(profUserId);

		this._guild?.members.fetch().then((members) => {
			const user = members.get(profUserId);
			user?.send(joinRequestMenu(cons, this._guild));
		});
	}

	public moveStudent(userId: string, cons: Consultation) {
		if (cons === undefined) {
			console.log('Appointment is not available any longer!');
			return;
		}

		const user = this._guild?.members.cache.get(userId);
		let channel: GuildBasedChannel | undefined;
		if (cons.prof === AppliedProfs.Israel.name) {
			channel = this._guild?.channels.cache.find(
				(channel: GuildBasedChannel) =>
					channel.name === AppliedProfs.Israel.office
			);
			console.log(
				'Move request ' + cons.name + ' to ' + AppliedProfs.Israel.name
			);
		} else if (cons.prof === AppliedProfs.Kleinen.name) {
			channel = this._guild?.channels.cache.find(
				(channel: GuildBasedChannel) =>
					channel.name === AppliedProfs.Kleinen.office
			);
			console.log(
				'Move request ' + cons.name + ' to ' + AppliedProfs.Kleinen.name
			);
		} else if (cons.prof === AppliedProfs.Lenz.name) {
			channel = this._guild?.channels.cache.find(
				(channel: GuildBasedChannel) =>
					channel.name === AppliedProfs.Lenz.office
			);
			console.log(
				'Move request ' + cons.name + ' to ' + AppliedProfs.Lenz.name
			);
		} else if (cons.prof === AppliedProfs.Wulff.name) {
			channel = this._guild?.channels.cache.find(
				(channel: GuildBasedChannel) =>
					channel.name === AppliedProfs.Wulff.office
			);
			console.log(
				'Move request ' + cons.name + ' to ' + AppliedProfs.Wulff.name
			);
		}

		user?.voice
			.setChannel(channel as VoiceChannel)
			.catch((err) => console.log(err));

		// delete appointment data

		const session = BookingManager.Instance;
		session.deleteAppointment(userId, cons.timestamp);
		session.cancelSession(userId);
	}

	private watchInstructions(guild: { channels: { cache: any[] } }): void {
		const session = BookingManager.Instance;
		guild.channels.cache
			.find((channel: VoiceChannel) => channel.name === 'Waiting Room')
			.members.forEach((member: GuildMember) => {
				const ID = member.user.id;
				const student = session.getStudent(ID);
				const status = student?.status;
				if (student !== undefined)
					console.log(
						member.user.tag + ' aka ' + student.name + ' ' + student.status
					);
				if (student !== undefined && status === Status.REGISTERED) {
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
								console.log('Student is now waiting');
								AppointmentManager.Instance.sendMoveRequest(appointment);
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
								// Send request to professor
								session.updateStudentStatus(ID, Status.WAITING);
								console.log('Student is now waiting');
								AppointmentManager.Instance.sendMoveRequest(appointment);
								return;
							} else {
								member.send(
									'You missed your consultation! ' +
										dateTime.format('Do MMMM YYYY HH:mm') +
										' with ' +
										appointment.prof
								);
								session.deleteAppointment(ID, appointment.timestamp);
							}
						}
						session.updateStudentStatus(ID, Status.FORM_COMPLETE);
					});
				} else if (status === Status.APPLIED) {
					const consultation = session.getAppointments(ID)[0];
					AppointmentManager.Instance.moveStudent(ID, consultation);
				}
			});
	}
}

export default AppointmentManager;

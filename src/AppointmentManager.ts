import { Guild, GuildMember, VoiceChannel } from 'discord.js';
import moment from 'moment';
import SessionManager, { Consultation } from './SessionManager';
import Student, { Status } from './Student';

class AppointmentManager {
	constructor() {
		this._session = SessionManager.Instance;
	}
	private _agent: NodeJS.Timer | number | undefined;
	private _guild: Guild | undefined;
	private _session: SessionManager;
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
	public moveUser(userId: string) {
		console.log('moving ' + this._session.getStudent(userId)?.name);
	}

	private watchInstructions(guild: { channels: { cache: any[] } }): void {
		let students: Array<Student> = [];
		guild.channels.cache
			.find((channel: VoiceChannel) => channel.name === 'Waiting Room')
			.members.forEach((member: GuildMember) => {
				const ID = member.user.id;
				const student = this._session.getStudent(ID);
				console.log(member.user.tag + 'aka ' + student?.name + ' ' + ID);
				if (student !== undefined && student.status === Status.REGISTERED) {
					const consuls = this._session.getAppointments(ID);
					consuls.forEach((item) => {
						const now = moment.now();
						const dateTime = moment.unix(item.timestamp);
						if (dateTime.isAfter(now)) {
							const timeLeft = moment.duration(dateTime.diff(moment.now()));
							if (timeLeft.asSeconds() < 300) {
								member.user.send(
									'Hey buddy, nice to see you in time for your meeting with ' +
										item.prof
								);
								member.send(
									'You got ' +
										timeLeft.asSeconds() +
										' seconds left, take a seat!'
								);
								this._session.updateStudentStatus(ID, Status.WAITING);
								this.moveUser(ID);
								return;
							}
						} else if (dateTime.isBefore(now)) {
							const timeMiss = moment.duration(dateTime.diff(moment.now()));
							if (timeMiss.asSeconds() < 300) {
								member.user.send(
									'Hey there, you are a bit late for your meeting with ' +
										item.prof
								);
								member.send(
									'Your meeting began ' +
										timeMiss.asSeconds() +
										' seconds ago! I will check, if the prof is still available.'
								);
								this._session.updateStudentStatus(ID, Status.WAITING);
								this.moveUser(ID);
								return;
							}
						}
						member.send(
							'You missed your consultation!' + dateTime + ' ' + item.prof
						);
					});
				}
			});
	}
}

export default AppointmentManager;

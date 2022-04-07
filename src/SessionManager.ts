import { ButtonInteraction, Interaction } from 'discord.js';
import Student, { Status } from './Student';

class SessionManager {
	private constructor() {}
	private static _instance: SessionManager;
	public static get Instance() {
		return this._instance || (this._instance = new this());
	}
	private activeSessions: Map<string, ButtonInteraction> = new Map();
	private students: Map<string, Student> = new Map();

	public startSession(userId: string, interaction: ButtonInteraction) {
		this.activeSessions.set(userId, interaction);
		if (this.students.get(userId) === undefined)
			this.students.set(userId, new Student(userId));
	}

	public cancelSession(userId: string) {
		this.activeSessions.delete(userId);
		this.students.delete(userId);
	}

	public getSession(userId: string): ButtonInteraction | undefined {
		return this.activeSessions.get(userId);
	}

	public isActive(userId: string): boolean {
		return this.activeSessions.get(userId) !== undefined;
	}

	public getStudent(userId: string): Student | undefined {
		return this.students.get(userId);
	}

	public updateStudentStatus(userId: string, status: Status) {
		let student = this.getStudent(userId);
		if (student !== undefined) {
			student.status = status;
		} else {
			console.log('Could not find student', userId);
		}
	}
}

export default SessionManager;

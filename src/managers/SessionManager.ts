import { ButtonInteraction } from 'discord.js';
import moment from 'moment';
import Student, { Status } from '../entities/Student';

export type Consultation = {
	timestamp: number;
	prof: string;
	id: string;
	name: string;
	matrNum: string;
};

class BookingManager {
	private constructor() {}
	private static _instance: BookingManager;
	public static get Instance() {
		return this._instance || (this._instance = new this());
	}
	private activeSessions: Map<string, ButtonInteraction> = new Map();
	private students: Map<string, Student> = new Map();
	private appointments: Array<Consultation> = [];

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

	public submitAppointment(userId: string) {
		let student = this.getStudent(userId);
		console.log(student);

		if (student === undefined) {
			console.log('Session not found');
			return;
		}

		this.appointments.push({
			timestamp: student.cache.time,
			prof: student.cache.professor,
			id: userId,
			name: student.name,
			matrNum: student.matrNum,
		});
		this.updateStudentStatus(userId, Status.REGISTERED);
		student.clearCache();
	}

	public deleteAppointment(userId: string, timestamp: number) {
		this.appointments = this.appointments.filter(
			(app) => app.id !== userId && app.timestamp === timestamp
		);
	}

	public getAppointments(userId: string) {
		let collector: Array<Consultation> = [];
		this.appointments.forEach((app) => {
			if (app.id === userId) {
				collector.push(app);
			}
		});
		collector.sort((a, b) => {
			return a.timestamp - b.timestamp;
		});

		return collector;
	}

	// only for dev purposes
	public devShortcut(student: Student, userId: string) {
		this.students.set(userId, student);
	}
}

export default BookingManager;

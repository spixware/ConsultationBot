import { ButtonInteraction } from 'discord.js';
import moment from 'moment';
import Student, { Status } from '../entities/Student';

export type Consultation = {
	timestamp: number;
	prof: string;
	id: string;
	name: string;
	matrNum: string;
	customReminder?: number | undefined;
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

	public updateSession(userId: string, interaction: ButtonInteraction) {
		this.activeSessions.set(userId, interaction);
		if (this.students.get(userId) === undefined)
			this.students.set(userId, new Student(userId));
	}

	public cancelSession(userId: string) {
		this.activeSessions.delete(userId);
		//this.students.delete(userId);
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

		if (student === undefined) {
			console.log('Student not found');
			return;
		}

		this.appointments.push({
			timestamp: student.cache.time,
			prof: student.cache.professor,
			id: userId,
			name: student.name,
			matrNum: student.matrNum,
		});
		console.log(
			'Booked Appointment from ' +
				student.name +
				' with ' +
				student.cache.professor +
				' at ' +
				moment.unix(student.cache.time).format('Do MMMM YYYY HH:mm')
		);

		this.updateStudentStatus(userId, Status.REGISTERED);
		student.clearCache();
	}

	public deleteAppointment(userId: string, timestamp: number) {
		console.log(
			'Deleting Consultation with user ID: ' +
				userId +
				' and timestamp: ' +
				timestamp
		);
		const updatedAppointments: Array<Consultation> = [];
		this.appointments.forEach((app) => {
			if (!(app.id === userId && app.timestamp === timestamp))
				updatedAppointments.push(app);
		});
		this.appointments = updatedAppointments;
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

	public getAllAppointments() {
		return this.appointments;
	}

	public submitReminder(userId: string, timestamp: number, reminder: number) {
		this.getAppointments(userId).forEach((app) => {
			if (app.timestamp === timestamp) {
				app.customReminder = reminder;
				return;
			}
		});
	}

	public deleteReminder(userId: string, timestamp: number) {
		this.getAppointments(userId).forEach((app) => {
			if (app.timestamp === timestamp) {
				app.customReminder = undefined;
				return;
			}
		});
	}

	// only for dev purposes
	public devShortcut(student: Student, userId: string) {
		this.students.set(userId, student);
	}
}

export default BookingManager;

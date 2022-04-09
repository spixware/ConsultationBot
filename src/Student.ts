export enum Status {
	'IDLE',
	'LISTEN_FOR_NAME',
	'LISTEN_FOR_MATRNUM',
	'FORM_COMPLETE',
	'LISTEN_FOR_PROF',
	'LISTEN_FOR_TIME',
	'LISTEN_FOR_DATE',
	'CACHE_COMPLETE',
	'REGISTERED',
	'WAITING',
}

type Appointment = {
	professor: string;
	time: number;
};

class Student {
	constructor(userId: string) {
		this.userId = userId;
		this._status = Status.IDLE;
		this._name = '';
		this._userName = '';
		this._matrNum = '';
	}

	private _calendar: Array<Appointment> = [];
	private userId: string;
	private _status: Status;
	private _name: string;
	private _matrNum: string;
	private _userName: string;
	private _cache: Appointment = { professor: '', time: 0 };
	private _scrollWidth: number = 0;

	public set name(name: string) {
		this._name = name;
	}
	public set userName(name: string) {
		this._userName = name;
	}
	public set matrNum(name: string) {
		this._matrNum = name;
	}
	public set status(status: Status) {
		this._status = status;
	}
	public set scrollWidth(num: number) {
		this._scrollWidth = num;
	}
	public get name(): string {
		return this._name;
	}
	public get userName(): string {
		return this._userName;
	}
	public get matrNum(): string {
		return this._matrNum;
	}
	public get status(): Status {
		return this._status;
	}
	public get scrollWidth(): number {
		return this._scrollWidth;
	}
	public get cache(): Appointment {
		return this._cache;
	}
	public get calendar(): Array<Appointment> {
		return this._calendar;
	}
	public cacheProf(prof: string) {
		this._cache.professor = prof;
		if (this._cache.time !== 0) this._status = Status.CACHE_COMPLETE;
		else this._status = Status.LISTEN_FOR_TIME;
	}
	public cacheTime(time: number) {
		this._cache.time = time;
		if (this._cache.professor !== '') this._status = Status.CACHE_COMPLETE;
		else this._status = Status.LISTEN_FOR_PROF;
	}
	public submitAppointment() {
		if (this._cache.professor !== undefined && this._cache.time !== undefined) {
			console.log(this._cache);
			this._status = Status.REGISTERED;
			this._calendar.push(this._cache);
			this._cache = { professor: '', time: 0 };
		}
	}
}

export default Student;

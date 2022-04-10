class Professor {
	constructor(userId: string, office: string) {
		this._userId = userId;
		this._office = office;
		this._isOpen = true;
		this._channelId = '';
	}
	private _userId: string;
	private _office: string;
	private _channelId: string;
	private _isOpen: boolean;

	public get userId(): string {
		return this._userId;
	}

	public set userId(id: string) {
		this._userId = id;
	}

	public get channelId(): string {
		return this._channelId;
	}

	public set channelId(id: string) {
		this._channelId = id;
	}

	public get office(): string {
		return this._office;
	}

	public set office(name: string) {
		this._office = name;
	}

	public get isOpen(): boolean {
		return this._isOpen;
	}

	public set isOpen(state: boolean) {
		this._isOpen = state;
	}
}

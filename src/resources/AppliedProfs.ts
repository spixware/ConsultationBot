import moment from 'moment';

export const AppliedProfs = {
	Israel: {
		name: 'Prof. Dr. Johann H. Israel',
		userId: process.env.USER_ID,
		office: 'Office Prof. Israel',
		timeWindow: 'Tue and Thu from 16:00 to 17:00',
	},
	Wulff: {
		name: 'Prof. Dr. Debora Weber-Wulff',
		userId: process.env.USER_ID,
		office: 'Office Prof. Wulff',
		timeWindow: 'Mo from 15:00 to 17:00',
	},
	Kleinen: {
		name: 'Prof. Dr. Barne Kleinen',
		userId: process.env.USER_ID,
		office: 'Office Prof. Kleinen',
		timeWindow: 'Wed and Fri from 14:00 to 15:00',
	},
	Lenz: {
		name: 'Prof. Dr. Tobias Lenz',
		userId: process.env.USER_ID,
		office: 'Office Prof. Lenz',
		timeWindow: 'everyday at any time',
	},
	checkValidTime: function (unix: number, prof: string): boolean {
		const input = moment.unix(unix);
		if (input.isBefore(moment.now())) return false;

		switch (prof) {
			case AppliedProfs.Israel.name:
				return input.hour() === 16;

			case AppliedProfs.Wulff.name:
				return input.hour() === 16 || input.hour() === 15;

			case AppliedProfs.Kleinen.name:
				return input.hour() === 14;

			case AppliedProfs.Lenz.name:
				return true;
		}
		console.log('Professor not found during time validation!');
		return false;
	},
	checkValidDay: function (unix: number, prof: string): boolean {
		const input = moment.unix(unix).hour(12);
		if (input.isBefore(moment().startOf('day'))) return false;
		switch (prof) {
			case AppliedProfs.Israel.name:
				return input.day() === 2 || input.day() === 4;

			case AppliedProfs.Wulff.name:
				return input.day() === 1;

			case AppliedProfs.Kleinen.name:
				return input.day() === 3 || input.day() === 5;

			case AppliedProfs.Lenz.name:
				return true;
		}
		console.log('Professor not found during time validation!');
		return false;
	},
};

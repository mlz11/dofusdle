export interface Monster {
	id: number;
	name: string;
	ecosystem: string;
	race: string;
	niveau_min: number;
	niveau_max: number;
	pv_min: number;
	pv_max: number;
	couleur: string;
	image?: string;
}

export type FeedbackStatus = "correct" | "partial" | "wrong";
export type ArrowDirection = "up" | "down" | null;

export interface AttributeFeedback {
	value: string | number;
	status: FeedbackStatus;
	arrow: ArrowDirection;
}

export interface GuessResult {
	monster: Monster;
	feedback: {
		ecosystem: AttributeFeedback;
		race: AttributeFeedback;
		niveau: AttributeFeedback;
		couleur: AttributeFeedback;
		pv: AttributeFeedback;
	};
}

export interface GameStats {
	gamesPlayed: number;
	gamesWon: number;
	currentStreak: number;
	maxStreak: number;
	guessDistribution: Record<number, number>;
}

export interface DailyProgress {
	date: string;
	guesses: string[];
	won: boolean;
	hint1Revealed?: boolean;
	hint2Revealed?: boolean;
}

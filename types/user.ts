export interface User {
	id?: string;
	prefix: "!";
	authority: 0;
}

const defaultUser: User = {
	prefix: "!",
	authority: 0,
};

export { defaultUser };

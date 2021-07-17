export interface User {
	DiscordID?: string;
	Prefix: "!";
	Authority: 0;
}

const DefaultUser: User = {
	Prefix: "!",
	Authority: 0,
};

export { DefaultUser };

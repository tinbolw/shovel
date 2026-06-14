import fs from 'fs/promises';
import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('find')
		.setDescription('find users from ids'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
		const data = await fs.readFile("./src/commands/utility/ids.json", "utf8");
		const obj = JSON.parse(data);
		let names:{ id: string, displayName: string, username: string|null }[] = [];
		interaction.guild?.members.fetch().then(async (members) => {
			for (const member of members.values()) {
				names.push({ id: member.id, displayName: member.displayName, username: member.user.username });
				console.log("E");
			}
			await fs.writeFile("./names.json", JSON.stringify(names));
		});
	},
};

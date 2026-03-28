import { ChannelType, ForumChannel, SlashCommandBuilder, TextChannel, ThreadChannel, VoiceChannel } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import * as fs from 'fs';

export default {
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('counts stuff'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
		const guild = interaction.guild;
		let p:{ name: string, threads?: string[] }[] = [];
		if (guild?.available) {
			const channels = await interaction.guild?.channels.fetch().then(async (channels) => {
				for (const channel of channels.values()) {
					if (channel instanceof TextChannel) {
						let threads:string[] = [];
						const activeThreads = await channel.threads.fetchActive();
						const archivedThreads = await channel.threads.fetchArchived();
						for (const thread of activeThreads.threads.values()) {
							threads.push(thread.name);
							// console.log(thread.name);
						}
						for (const thread of archivedThreads.threads.values()) {
							threads.push(thread.name);
							// console.log(thread.name);
						}
						// await channel.threads.fetch();
						// for (const thread of channel.threads)
						// console.log(channel.threads);
						p.push({ name: channel.name, threads: threads });
					} else if (channel instanceof VoiceChannel) {
						p.push({ name: channel.name });
					} else if (channel instanceof ForumChannel) {
						console.log(channel.name);
						let threads:string[] = [];
						const activeThreads = await channel.threads.fetchActive();
						const archivedThreads = await channel.threads.fetchArchived();
						for (const thread of activeThreads.threads.values()) {
							threads.push(thread.name);
							console.log(thread.name);
						}
						for (const thread of archivedThreads.threads.values()) {
							threads.push(thread.name);
							console.log(thread.name);
						}
						p.push({ name: channel.name, threads: threads });
					} 
					// TextChannel
					// VoiceChannel
					// 
				}
			});
			// must also account for threads, channel by channel
		}
		fs.writeFile('./dump/channels.json', JSON.stringify(p), err => {
			
		});	
		console.log('complete');
	},
};
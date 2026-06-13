import { ChannelType, ForumChannel, SlashCommandBuilder, TextChannel, ThreadChannel, VoiceChannel } from 'discord.js';
import type { Channel, ChatInputCommandInteraction, Guild, GuildMessageManager } from 'discord.js';
import * as fs from 'fs';

export default {
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('counts stuff'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
		const guild = interaction.guild;
		let p: { channelName: string, messageCount?: number, channelType: ChannelType, threads?: { threadName: string, messageCount: number }[] }[] = [];
		// const channel = await guild?.channels.fetch("759989256587706420");
		// console.log(await countMessages((channel as TextChannel).messages));
		if (guild?.available) {
			await interaction.guild?.channels.fetch().then(async (channels) => {
				for (const channel of channels.values()) {
					if (channel instanceof TextChannel) {
						let threads: { threadName: string, messageCount: number }[] = [];
						const activeThreads = await channel.threads.fetchActive();
						const archivedThreads = await channel.threads.fetchArchived();
						for (const thread of activeThreads.threads.values()) {
							threads.push({ threadName: thread.name, messageCount: await(countMessages(thread.messages))});
						}
						for (const thread of archivedThreads.threads.values()) {
							threads.push({ threadName: thread.name, messageCount: await(countMessages(thread.messages))});
						}
						p.push({ channelName: channel.name, messageCount: await countMessages(channel.messages), channelType: channel.type, threads: threads });
					} else if (channel instanceof VoiceChannel) {
						p.push({ channelName: channel.name, messageCount: await countMessages(channel.messages), channelType: channel.type});
					} else if (channel instanceof ForumChannel) {
						let threads: { threadName: string, messageCount: number }[] = [];
						const activeThreads = await channel.threads.fetchActive();
						const archivedThreads = await channel.threads.fetchArchived();
						for (const thread of activeThreads.threads.values()) {
							threads.push({ threadName: thread.name, messageCount: await(countMessages(thread.messages))});
						}
						for (const thread of archivedThreads.threads.values()) {
							threads.push({ threadName: thread.name, messageCount: await(countMessages(thread.messages))});
						}
						p.push({ channelName: channel.name, channelType: channel.type, threads: threads });
					}
				}
			});
		}
		fs.writeFile('./dump/channels.json', JSON.stringify(p), err => {

		});	
		console.log('complete');
	},
};

async function countMessages(messageManager: GuildMessageManager, before?: string, progress = 0): Promise<number> {
	return await messageManager.fetch({ limit: 100, before: before }).then(async (messages) => {
		console.log(`Counting ${messageManager.channel.name}: ${progress} messages so far...`);
		if (messages.size !== 0) {
			let earliest;
			for (const message of messages.values()) {
				earliest = message;
			}
			await new Promise(resolve => setTimeout(resolve, 40)); // Discord rate limit
			return messages.size + await countMessages(messageManager, earliest?.id, progress + messages.size);
		} else {
			return 0;
		}
	})
}
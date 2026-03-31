import { ChannelType, ForumChannel, SlashCommandBuilder, TextChannel, ThreadChannel, VoiceChannel } from 'discord.js';
import type { Channel, ChatInputCommandInteraction, Guild, GuildMessageManager } from 'discord.js';
import { fetchMessages } from '../../lib/messages.js';

export default {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('start it'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
        const guild = interaction.guild;
        let p: { channelName: string, messageCount?: number, channelType: ChannelType, threads?: { threadName: string, messageCount: number }[] }[] = [];
        if (guild?.available) {
            await interaction.guild?.channels.fetch().then(async (channels) => {
                for (const channel of channels.values()) {
                    if (channel instanceof TextChannel || channel instanceof ForumChannel) {
                        let threads: { threadName: string, messageCount: number }[] = [];
                        const activeThreads = await channel.threads.fetchActive();
                        const archivedThreads = await channel.threads.fetchArchived();
                        for (const thread of activeThreads.threads.values()) {
                            threads.push({ threadName: thread.name, messageCount: await (fetchMessages(thread.messages, [])) });
                        }
                        for (const thread of archivedThreads.threads.values()) {
                            threads.push({ threadName: thread.name, messageCount: await (fetchMessages(thread.messages, [])) });
                        }
                        if (channel instanceof TextChannel) {
                            p.push({ channelName: channel.name, messageCount: await fetchMessages(channel.messages, []), channelType: channel.type, threads: threads });
                        } else {
                            p.push({ channelName: channel.name, channelType: channel.type, threads: threads });
                        }
                    } else if (channel instanceof VoiceChannel) {
                        p.push({ channelName: channel.name, messageCount: await fetchMessages(channel.messages, []), channelType: channel.type });
                    }
                }
            });
        }
        console.log('Done!');
    },
};
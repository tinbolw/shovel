import { ForumChannel, SlashCommandBuilder, TextChannel, VoiceChannel } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { fetchMessages } from '../../lib/messages.js';

export default {
    data: new SlashCommandBuilder()
        .setName('write')
        .setDescription('Write all messages of a channel')
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('the channel')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
        const channel = interaction.options.getChannel('channel');
        if (channel instanceof ForumChannel || channel instanceof TextChannel) {
            const activeThreads = await channel.threads.fetchActive();
            const archivedThreads = await channel.threads.fetchArchived();
            for (const thread of activeThreads.threads.values()) {
                await fetchMessages(thread.messages, []);
            }
            for (const thread of archivedThreads.threads.values()) {
                await fetchMessages(thread.messages, []);
            }
            if (channel instanceof TextChannel) {
                await fetchMessages(channel.messages, []);
            }
        } else if (channel instanceof VoiceChannel) {
            await fetchMessages(channel.messages, []);
        }
    },
};
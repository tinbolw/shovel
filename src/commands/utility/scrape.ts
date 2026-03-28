import { fetchMessages, fetchMessageData } from '../../lib/messages.js';
import { SlashCommandBuilder, TextChannel } from 'discord.js';
import type { ChatInputCommandInteraction, Emoji, Message, MessageResolvable, PollAnswer } from 'discord.js';
import * as fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('scrape')
    .setDescription('Scrape all of the messages of a channel.')
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("the target channel")
        .setRequired(true))
    .addStringOption((option) => 
      option
        .setName("messageid")
        .setDescription("the id of the message")
        .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
    const channel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("messageid");
    // console.log(channel);
    // const messages: Message[] = [];
    if (channel instanceof TextChannel) {
      // const messageCount = await fetchMessages(channel, messages);
      // console.log(messageCount);
      // const latest = messages.at(-1);
      const latest = await channel.messages.fetch(messageId as string);
      console.log(latest);
      const completeMessage = await fetchMessageData(latest);
      fs.writeFile('./dump/completeMessage.json', JSON.stringify(completeMessage), err => {
        if (err) {
          console.error(err);
        } else {

        }
      })
      console.log("Complete");
    }
  },
};
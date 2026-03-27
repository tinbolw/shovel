import { fetchMessages, fetchMessageData } from '../../lib/messages.js';
import { SlashCommandBuilder, TextChannel } from 'discord.js';
import type { ChatInputCommandInteraction, Emoji, Message, PollAnswer } from 'discord.js';
import type { CompletePoll, CompletePollAnswer } from '../../lib/messages.js';
import * as fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('scrape')
    .setDescription('Scrape all of the messages of a channel.')
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("the target channel")
        .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
    const channel = interaction.options.getChannel("channel");
    // console.log(channel);
    // const messages: Message[] = [];
    if (channel instanceof TextChannel) {
      // const messageCount = await fetchMessages(channel, messages);
      // console.log(messageCount);
      // const latest = messages.at(-1);
      const latest = await (await channel.fetch()).messages.fetch("1481026479298187536");
      // console.log(latest);
      const completeMessage = await fetchMessageData(latest);
      //  fs.writeFile('./message.json', JSON.stringify(latest), err => {
      //    if (err) {
      //      console.error(err);
      //    } else {
      //    }
      //  })
      fs.writeFile('./dump/completeMessage.json', JSON.stringify(completeMessage), err => {
        if (err) {
          console.error(err);
        } else {

        }
      })
    }
  },
};
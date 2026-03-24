const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrape')
    .setDescription('Scrape all of the messages of a channel.')
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("the target channel")
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    console.log(channel);
    await interaction.reply('Pong!');
  },
};
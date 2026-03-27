import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply(`There is no command with name \`${commandName}\`!`);
    }

    // delete require.cache[require.resolve(`./${command.data.name}.js`)];
    try {
      const newCommand = await import(`./${command.data.name}.js`);
      interaction.client.commands.set(newCommand.default.data.name, newCommand.default);
      await interaction.reply(`Command \`${newCommand.default.data.name}\` was reloaded!`);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        await interaction.reply(
          `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``,
        );
      } else {
        await interaction.reply(
          `There was an error while reloading a command \`${command.data.name}\``,
        );
      }
    }
  },
};
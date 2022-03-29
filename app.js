'use strict';
require('dotenv').config();
import { emoticons } from './src/emoticons.js';

const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id === client.id) return;
  if (message.inGuild()) {
    console.log('I got a message: ', message.content);
  } else {
    console.log('I got a DM: ', message.content);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    handleButtonInteraction();
  }

  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case 'ping':
      const { embed, row } = createEmbedMenu();
      interaction.user
        .send({
          content: 'Follow these guidelines:',
          embeds: [embed],
          components: [row],
        })
        .then((message) => {
          message.react(emoticons.PARTY_POPPER);
          console.log();
        });
      break;

    case 'cdm':
      const dmChannel = await message.author.createDM();
      console.log(await dmChannel.messages.fetch());
      dmChannel.send('Created DM channel with you!');
      break;

    case 'clean':
      console.log('gonna clean up');
      const channel = message.channel;
      await channel.messages.fetch().then((fetched) =>
        fetched.forEach((msg) => {
          console.log('removing: ' + msg);
          msg.delete();
        })
      );
      console.log('done');
      break;
  }
});

client.login(process.env.CLIENT_TOKEN);

async function handleButtonInteraction(interaction) {
  console.log('Button Interaction:', interaction);
  const { buttonId } = interaction.customId;
  switch (buttonId) {
    case 'start':
      interaction.update({
        content: 'updated',
        components: interaction.components,
      });
      break;
  }
}

function createEmbedMenu() {
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Consultation Booking')
    .setDescription('Use those reactions below to navigate.')
    .addFields(
      { name: 'Regular field title', value: 'Some value here' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Inline field title', value: 'Some value here', inline: true },
      { name: 'Inline field title', value: 'Some value here', inline: true }
    )
    .addField('Inline field title', 'Some value here', true);

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('start')
      .setLabel('Primary')
      .setStyle('PRIMARY')
  );
  return { embed, row };
}

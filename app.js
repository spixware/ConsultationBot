require('dotenv').config(); //initialize dotenv

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  switch (message.content) {
    case "ping":
      message.channel.send("Pong!");
      break;

      case "!meme":
        message.channel.send("Here's your meme!"); //Replies to user command
      break;
   }
})

client.login(process.env.CLIENT_TOKEN);
require("dotenv").config(); //initialize dotenv

const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");

const player = createAudioPlayer();
const resource = createAudioResource("./assets/audio/speech1.mp3");
const GUILD_ID = process.env.GUILD_ID;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

player.on(AudioPlayerStatus.Idle, () => {
  console.log("finished");
});

let connection = null;
let subscription = null;
client.on("messageCreate", async (message) => {
  switch (message.content) {
    case "ping":
      message.channel.send("Pong!");
      break;

    case "!meme":
      message.channel.send("Here's your meme!"); //Replies to user command
      break;

    case "!join":
      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: GUILD_ID,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      player.play(createAudioResource("./assets/audio/speech1.mp3"));
      subscription = connection.subscribe(player);
      break;

    case "!leave":
      if (connection) {
        subscription.unsubscribe();
        connection.destroy();
      }
      break;

    case "!play":
      player.play(createAudioResource("./assets/audio/speech1.mp3"));
      console.log(message.guild.id);
      break;
  }
});

client.login(process.env.CLIENT_TOKEN);

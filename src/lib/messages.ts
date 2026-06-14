import { GuildMessageManager, Message, TextChannel, ThreadChannel } from 'discord.js';
import { Attachment, ForumChannel, MessageReaction, PartialPollAnswer, Poll, PollAnswer, VoiceChannel } from 'discord.js';
import * as fs from 'fs';

/**
 * 
 * @param name 
 */
function createDir(name: string) {
  try {
    if (!fs.existsSync(name)) {
      fs.mkdirSync(name);
      console.log(`Created folder: ${name}`);
    } else {
      console.warn(`Folder ${name} already exists.`);
    }
  } catch (err) {
    console.error(err);
  }
}

// TODO may use 
function writeFile(messageList: CompleteMessage[], chunk: number) {
  if (messageList[0].dump.channel instanceof TextChannel ||
    messageList[0].dump.channel instanceof VoiceChannel
  ) {
    createDir('./dump');
    createDir(`./dump/${messageList[0].dump.channel.name}`);
    const fileName = `./dump/${messageList[0].dump.channel.name}/${chunk}.json`;
    fs.writeFileSync(fileName, JSON.stringify(messageList));
    console.log(`Wrote ${fileName}.`);
  } else if (messageList[0].dump.channel instanceof ThreadChannel) {
    createDir('./dump');
    createDir(`./dump/${messageList[0].dump.channel.parent?.name}`);
    createDir(`./dump/${messageList[0].dump.channel.parent?.name}/${messageList[0].dump.channel.name}`);
    const fileName = `./dump/${messageList[0].dump.channel.parent?.name}/${messageList[0].dump.channel.name}/${chunk}.json`;
    fs.writeFileSync(fileName, JSON.stringify(messageList));
    console.log(`Wrote ${fileName}.`);
  }
}

/**
 * 
 * @param channel 
 * @param before 
 * @param messageList 
 */
// TODO must handle threads, and messages sent in voice channels
export async function fetchMessages(messageManager: GuildMessageManager, messageList: CompleteMessage[], chunk = 0, before?: string): Promise<number> {
  return messageManager.fetch({ limit: 100, before: before }).then(async (messages) => {
    if (messageList.length >= 50000) { // Write chunk
      writeFile(messageList, ++chunk);
      // messageList = [];
      messageList.length = 0;
    }
    if (messages.size !== 0) {
      for (const message of messages.values()) {
        messageList.push(await fetchMessageData(message));
      }
      const earliest = messageList.at(-1)?.dump;
      await new Promise(resolve => setTimeout(resolve, 50)); // Discord rate limit
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${(new Date(Date.now()).toISOString())} Reading ${messages.size + messageList.length} messages from ${messageManager.channel.name}...`);
      return messages.size + await fetchMessages(messageManager, messageList, chunk, earliest?.id);
    } else {
      if (messageList.length > 0) {
        writeFile(messageList, ++chunk);
        // messageList = [];
        messageList.length = 0;
      }
      return 0;
    }
  });
}

/*
message.attachments - id is included by default, but fetching the attachment data upfront should
make parsing all message data faster in the future
message.poll, message.reactions - data is not included in JSON write by default
message.author, message.stickers - id is included; fetching relevant data into a cache as needed should be enough
message.components - omitted for now
*/
/**
 * Fetches message data including poll and reactions into an object that contains that data when written to JSON.
 * See the extended function comment for more details.
 * @param message 
 * @returns 
 */
export async function fetchMessageData(message: Message): Promise<CompleteMessage> {
  let completeMessage: CompleteMessage = {
    dump: message,
  }
  if (message.poll) {
    completeMessage.pollData = {
      dump: message.poll,
      answerData: [],
    }
    for (const answer of message.poll.answers.values()) {
      const completePollAnswer: CompletePollAnswer = {
        dump: answer,
        emojiData: answer.emoji?.id
      }
      await answer.voters.fetch();
      completeMessage.pollData.answerData.push(completePollAnswer);
    }
  }
  if (message.attachments) {
    completeMessage.attachmentData = [];
    for (const attachment of message.attachments.values()) {
      completeMessage.attachmentData.push(attachment);
    }
  }
  if (message.reactions) {
    completeMessage.reactionData = [];
    for (const reaction of message.reactions.cache.values()) {
      try {
        await reaction.users.fetch();
      } catch (err) {
        console.error(`Error fetching reactions for message ${message.id}`);
      }
      completeMessage.reactionData.push(reaction);
    }
  }
  return completeMessage;
}

interface CompleteMessage {
  dump: Message,
  pollData?: CompletePoll,
  attachmentData?: Attachment[],
  reactionData?: MessageReaction[],
}

interface CompletePollAnswer {
  dump: PollAnswer | PartialPollAnswer,
  emojiData?: string | null,
}

interface CompletePoll {
  dump: Poll,
  answerData: CompletePollAnswer[]
}

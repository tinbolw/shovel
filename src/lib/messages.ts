import * as fs from 'fs';
import { Message, TextChannel } from 'discord.js';
import type { Collection, Emoji, GuildEmoji, PartialPollAnswer, Poll, PollAnswer } from 'discord.js';

/**
 * 
 * @param channel 
 * @param before 
 * @param messageList 
 */
export async function fetchMessages(channel: TextChannel, messageList: Message[], before?: string): Promise<number> {
  return channel.messages.fetch({ limit: 100, before: before }).then(async (messages) => {
    if (messages.size !== 0) {
      for (const message of messages.values()) {
        messageList.push(message);
      }
      const earliest = messageList.at(-1);
      await new Promise(resolve => setTimeout(resolve, 25)); // Discord rate limit
      return messages.size + await fetchMessages(channel, messageList, earliest?.id);
    } else {
      return 0;
    }
  });
}

export async function messageToJson(message: Message) {
  for (const [key, value] of message.reactions.cache) {
    try {
      let reaction = await message.reactions.cache.get(key);
      await message.reactions.cache.get(key)?.users.fetch();
      if (reaction) {
        // reaction.userData = Object.values(Object.fromEntries(await message.reactions.cache.get(key)))
      }
    } catch (e) {

    }
  }
}

// TODO:
// embeds
// components
// attachments
// stickers
// editedTimestamp
// reactions
// mentions

// DONE:
// author can replace authorId, but opted not to include it for now
// poll
export async function fetchMessageData(message: Message): Promise<CompleteMessage> {
  let completeMessage: CompleteMessage = {
    dump: message,
  }
  if (message.poll) {
    let completePoll: CompletePoll = {
      dump: message.poll,
      answerData: [],
    }
    for (const answer of message.poll.answers.values()) {
      const completePollAnswer: CompletePollAnswer = {
        dump: answer,
        emojiData: answer.emoji
      }
      await answer.voters.fetch();
      completePoll.answerData.push(completePollAnswer);
    }
    completeMessage.pollData = completePoll;
    // fs.writeFile('./dump/test.json', JSON.stringify(completePoll), err => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //   }
    // })
    // fs.writeFile('./dump/poll.json', JSON.stringify(message.poll), err => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //   }
    // })
    // fs.writeFile('./dump/pollanswers.json', JSON.stringify(message.poll.answers), err => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //   }
    // })
  }
  return completeMessage;
}

interface CompleteMessage {
  dump: Message,
  pollData?: CompletePoll,
}
export interface CompletePollAnswer {
  dump: PollAnswer | PartialPollAnswer,
  emojiData: GuildEmoji | Emoji | null
}

export interface CompletePoll {
  dump: Poll,
  answerData: CompletePollAnswer[]
}
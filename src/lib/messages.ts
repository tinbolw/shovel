import { Message, TextChannel } from 'discord.js';
import type { Attachment, MessageReaction, PartialPollAnswer, Poll, PollAnswer } from 'discord.js';

/**
 * 
 * @param channel 
 * @param before 
 * @param messageList 
 */
// TODO must handle threads, and messages sent in voice channels
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
      await reaction.users.fetch();
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
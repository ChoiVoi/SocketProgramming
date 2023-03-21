import { getData, setData, messages, channels, channel } from './dataStore';

import { getAuthUserId, getChannelIdList } from './helper';

import HTTPError from 'http-errors';
/**
 * Creates a new channel with the given name that is either a public or
 * private channel. The user who created it automatically joins the channel.
 *
 * @param {string} token - A string containing the users token
 *
 * @returns {{ channels: channel[] }} On no error
 *
 * @throws { HTTPError(403) } - On the token is invalid
 *
*/

function channelsListV2(token: string): { channels: channel[]; } {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelsIdList = getChannelIdList(token, data);

  const channels = [] as channel[];

  for (const channelsId of channelsIdList) {
    const channel = {
      channelId: channelsId,
      name: data.channels[channelsId].nameChannel,
    } as channel;

    channels.push(channel);
  }

  return { channels: channels };
}

/**
 * Provide an array of all channels (and their associated details) that the authorised user is part of.
 *
 * @param {string} token - A string containing the users token
 *
 * @returns {{ channels: channel[] }} On no error
 * @throws { HTTPError(403) } - On the token is invalid
*/

function channelsListallV2(token: string): { channels: channel[]; } {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  const channels = [] as channel[];

  for (const channel of data.channels) {
    const chan = {
      channelId: channel.channelId,
      name: channel.nameChannel,
    } as channel;

    channels.push(chan);
  }

  return { channels: channels };
}

/**
 * Creates a new channel with the given name that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * @param {string} token - A string containing the users token
 * @param {string} name - A string containing the channels name
 * @param {boolean} isPublic - A boolean containing whether the channel is public or not
 *
 * @returns {{channelId: channelId}} On no error
 * @throws { HTTPError(400) } - The channel name is less than 1 character
 *                            - The channel name is longer than 20 characters
 * @throws { HTTPError(403) } - On the token is invalid
 *
*/

function channelsCreateV2(token: string, name: string, isPublic: boolean): { channelId: number; } {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  if (name.length < 1) {
    throw HTTPError(400, 'name is less than 1 character');
  }

  if (name.length > 20) {
    throw HTTPError(400, 'name is more than 20 characters');
  }

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      const channelId = data.channels.length;
      data.users[key].channelsIdList.push(channelId);

      const channel: channels = {
        channelId: channelId,
        nameChannel: name,
        isPublic: isPublic,
        ownersIdList: [data.users[key].uId],
        membersIdList: [data.users[key].uId],
        messagesList: [] as messages[],
        standup: {
          uId: 0,
          isActive: false,
          timeFinish: null,
          handles: [],
          messages: [],
        }
      };

      data.channels.push(channel);

      const time = Math.floor((new Date()).getTime() / 1000);

      data.users[key].userStats.channelsJoined.push({
        numChannelsJoined: data.users[key].channelsIdList.length,
        timeStamp: time,
      });

      data.workspaceStats.channelsExist.push({
        numChannelsExist: data.channels.length,
        timeStamp: time,
      });

      setData(data);

      return { channelId: channelId };
    }
  }
}

export { channelsListV2, channelsListallV2, channelsCreateV2 };

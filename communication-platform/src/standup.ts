import { getData, setData, messages } from './dataStore';

import { getAuthUserId, isValidChannelId, getHandleStrList } from './helper';

import HTTPError from 'http-errors';

/**
 * User starts standup with a length of time
 * @param {string} token
 * @param {number} channelId
 * @param {number} length
 * @returns { {timeFinish: number} } On no error
 * @throws { HTTPError(400) }
 *                - On invalid channelId
 *                - On negatvie value of length
 *                - On an active stanup is currently running in the channel
 * @throws { HTTPError(403) }
 *                - On invalid token
 *                - On authUserId is not a member of the channel
 */

function standupStartV1(token: string, channelId: number, length: number): { timeFinish: number; } {
  const data = getData();

  // get authUserId of the token and check if it is valid
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid channelId
  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'invalid channelId');
  }

  // channelId is valid but the authUserId is not a member of the channel
  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'authUserId is not a member of the channel');
  }

  // check if the length is not negative
  if (length < 0) {
    throw HTTPError(400, 'negative value of length');
  }

  // check if an active stand up is currently running
  if (data.channels[channelId].standup.isActive) {
    throw HTTPError(400, 'an active stanup is currently running in the channel');
  }

  const timeNow = Math.floor(Date.now() / 1000);
  data.channels[channelId].standup.isActive = true;
  data.channels[channelId].standup.timeFinish = timeNow + length;
  data.channels[channelId].standup.uId = authUserId;

  setTimeout(function() {
    helperStandup(channelId, authUserId, timeFinish);
  }, length * 1000);

  const timeFinish = timeNow + length;
  setData(data);

  return { timeFinish: timeFinish };
}

function helperStandup(channelId: number, authUserId: number, timeFinish: number) {
  const dataLater = getData();
  const messageId = dataLater.totalMessages;
  dataLater.totalMessages++;
  dataLater.channels[channelId].standup.isActive = false;
  dataLater.channels[channelId].standup.timeFinish = null;

  let msg = '';
  for (let i = 0; i < dataLater.channels[channelId].standup.handles.length; i++) {
    if (i === dataLater.channels[channelId].standup.handles.length - 1) {
      msg += dataLater.channels[channelId].standup.handles[i] + ': ' + dataLater.channels[channelId].standup.messages[i];
    } else {
      msg += dataLater.channels[channelId].standup.handles[i] + ': ' + dataLater.channels[channelId].standup.messages[i] + '\n';
    }
  }

  const mess: messages = {
    messageId: messageId,
    uId: authUserId,
    message: msg,
    timeSent: timeFinish,
    reacts: [{
      reactId: 1,
      uIds: [],
      isThisUserReacted: false
    }],
    isPinned: false
  };

  dataLater.channels[channelId].messagesList.unshift(mess);

  dataLater.currentMessages++;
  dataLater.workspaceStats.messagesExist.push(
    {
      numMessagesExist: dataLater.currentMessages,
      timeStamp: timeFinish,
    }
  );

  for (const key in dataLater.users) {
    if (dataLater.users[key].uId === authUserId) {
      dataLater.users[key].totalMessagesSent++;
      dataLater.users[key].userStats.messagesSent.push({
        numMessagesSent: dataLater.users[key].totalMessagesSent,
        timeStamp: timeFinish
      });
      break;
    }
  }
  setData(dataLater);
}

/**
 * check if the standup is acitve
 * @param {string} token
 * @param {number} channelId
 * @returns {{
 *            isActive: boolean,
 *            timeFinish: number
 *            }}  - On no error
 * @throws { HTTPError(400) }
 *                - On invalid channelId
 * @throws { HTTPError(403) }
 *                - On invalid token
 *                - On authUserId is not a member of the channel
 */

function standupActiveV1(token: string, channelId: number): { isActive: boolean; timeFinish: number; } {
  const data = getData();

  // get authUserId of the token and check if it is valid
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid channelId
  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'invalid channelId');
  }

  // channelId is valid but the authUserId is not a member of the channel
  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'authUserId is not a member of the channel');
  }

  return {
    isActive: data.channels[channelId].standup.isActive,
    timeFinish: data.channels[channelId].standup.timeFinish
  };
}

/**
 * Send all of the messages packaged together with handle string
 * @param {string} token
 * @param {number} channelId
 * @param {string} message
 * @returns {{}}  - On no error
 * @throws { HTTPError(400) }
 *                - On invalid channelId
 *                - On length of message is over 1000
 *                - On an active stanup is currently running in the channel
 * @throws { HTTPError(403) }
 *                - On invalid token
 *                - On authUserId is not a member of the channel
 */

function standupSendV1(token: string, channelId: number, message: string): Record<string, unknown> {
  const data = getData();

  // get authUserId of the token and check if it is valid
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid channelId
  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'invalid channelId');
  }

  // channelId is valid but the authUserId is not a member of the channel
  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'authUserId is not a member of the channel');
  }

  // check the length of message is over 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000');
  }

  // check if an active stand up is currently running
  if (!data.channels[channelId].standup.isActive) {
    throw HTTPError(400, 'an active stanup is currently running in the channel');
  }

  const authUserHandle = getHandleStrList([authUserId], data)[0];

  data.channels[channelId].standup.handles.push(authUserHandle);
  data.channels[channelId].standup.messages.push(message);
  setData(data);

  return {};
}

export { standupActiveV1, standupSendV1, standupStartV1 };

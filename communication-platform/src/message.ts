import { getData, setData, messages } from './dataStore';

import {
  isValidChannelId, getAuthUserId, getPermissionId, isValidDmId, getChannelTaggedUIds,
  getHandleStrList, getDMTaggedUIds, getChannelIdList, getDmIdList
} from './helper';

import HTTPError from 'http-errors';

/**
* Send a message from the authorised user to the channel specified by channelId.
* Note: Each message should have its own unique ID, i.e. no messages should share an ID with another message,
* even if that other message is in a different channel.
*
* @param {string} token
* @param {number} channelId
* @param {string} message
*
* @returns {{
*                messageId: number,
*           }} On no error
*
* @throws {HTTPError(400)} On - channelId does not refer to a valid channel
*                               - length of message is less than 1 or over 1000 characters
* @throws {HTTPError(403)} On - invalid token
*                               - channelId is valid and the authorised user is not a member of the channel
*/
function messageSendV1(token: string, channelId: number, message: string): { messageId: number; } {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid channel
  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'invachannelId does not refer to a valid channellid token');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the channel');
  }

  // check length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  // operations
  const messageId = data.totalMessages;
  const timeNow = Math.floor(Date.now() / 1000);

  const mess: messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: timeNow,
    reacts: [{
      reactId: 1,
      uIds: [],
      isThisUserReacted: false
    }],
    isPinned: false
  };

  data.channels[channelId].messagesList.unshift(mess);

  data.totalMessages++;

  data.currentMessages++;
  data.workspaceStats.messagesExist.push(
    {
      numMessagesExist: data.currentMessages,
      timeStamp: timeNow,
    }
  );

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].totalMessagesSent++;
      data.users[key].userStats.messagesSent.push({
        numMessagesSent: data.users[key].totalMessagesSent,
        timeStamp: timeNow
      });
      break;
    }
  }

  const taggedUIds = getChannelTaggedUIds(channelId, message, data);

  if (taggedUIds.length > 0) {
    const limit = 20;
    let shortenMessage = message;

    if (message.length > limit) {
      shortenMessage = message.substring(0, limit);
    }

    const authUserHandle = getHandleStrList([authUserId], data)[0];

    for (const id of taggedUIds) {
      for (const key in data.users) {
        if (data.users[key].uId === id) {
          data.users[key].notifications.unshift(
            {
              channelId: channelId,
              dmId: -1,
              notificationMessage: authUserHandle + ' tagged you in ' + data.channels[channelId].nameChannel + ': ' + shortenMessage
            }
          );
          break;
        }
      }
    }
  }

  setData(data);

  return { messageId: messageId };
}

/**
* Given a message, update its text with new text.
* If the new message is an empty string, the message is deleted.
*
* @param {string} token
* @param {number} messageId
* @param {string} message
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - length of message is over 1000 characters
*                               - messageId does not refer to a valid message within a channel/DM that the authorised user has joined
* @throws {HTTPError(403)} On - invalid token
*                               - the message was not sent by the authorised user making this request
*                               - the authorised user does not have owner permissions in the channel/DM
*/
function messageEditV1(token: string, messageId: number, message: string): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check permissionId
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserPermissionId = getPermissionId(token, data);

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  // check channel/dm Id is valid and the authorised user is not a member of the channel
  // check the message was not sent by the authorised user making this request
  // check the authorised user does not have owner permissions in the channel/DM
  if (isChannelMessage) {
    // if (!data.channels[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.channels[channelDMIndex].messagesList[messageIndex].uId !== authUserId) {
      throw HTTPError(403, 'the message was not sent by authUser');
    }
    if (!data.channels[channelDMIndex].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  } else {
    // if (!data.dms[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.dms[channelDMIndex].messagesList[messageIndex].uId !== authUserId) {
      throw HTTPError(403, 'the message was not sent by authUser');
    }
    if (data.dms[channelDMIndex].creatorId !== authUserId) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  }

  // check length of message is over 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  // operations
  if (message === '') {
    if (isChannelMessage) {
      data.channels[channelDMIndex].messagesList.splice(messageIndex, 1);
    } else {
      data.dms[channelDMIndex].messagesList.splice(messageIndex, 1);
    }
    const timeNow = Math.floor(Date.now() / 1000);
    data.currentMessages--;
    data.workspaceStats.messagesExist.push(
      {
        numMessagesExist: data.currentMessages,
        timeStamp: timeNow,
      }
    );
  } else {
    let taggedUIds = [];
    if (isChannelMessage) {
      data.channels[channelDMIndex].messagesList[messageIndex].message = message;
      taggedUIds = getChannelTaggedUIds(channelDMIndex, message, data);
    } else {
      data.dms[channelDMIndex].messagesList[messageIndex].message = message;
      taggedUIds = getDMTaggedUIds(channelDMIndex, message, data);
    }

    if (taggedUIds.length > 0) {
      const limit = 20;
      let shortenMessage = message;

      if (message.length > limit) {
        shortenMessage = message.substring(0, limit);
      }
      const authUserHandle = getHandleStrList([authUserId], data)[0];

      for (const id of taggedUIds) {
        for (const key in data.users) {
          if (data.users[key].uId === id) {
            if (isChannelMessage) {
              data.users[key].notifications.unshift(
                {
                  channelId: channelDMIndex,
                  dmId: -1,
                  notificationMessage: authUserHandle + ' tagged you in ' + data.channels[channelDMIndex].nameChannel + ': ' + shortenMessage
                }
              );
            } else {
              data.users[key].notifications.unshift(
                {
                  channelId: -1,
                  dmId: channelDMIndex,
                  notificationMessage: authUserHandle + ' tagged you in ' + data.dms[channelDMIndex].nameDM + ': ' + shortenMessage
                }
              );
            }
            break;
          }
        }
      }
    }
  }

  setData(data);
  return {};
}

/**
* Given a messageId for a message, this message is removed from the channel/DM
*
* @param {string} token
* @param {number} messageId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - messageId does not refer to a valid message within a channel/DM that the authorised user has joined
* @throws {HTTPError(403)} On - invalid token
*                               - the message was not sent by the authorised user making this request
*                               - the authorised user does not have owner permissions in the channel/DM
*/
function messageRemoveV1(token: string, messageId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check permissionId
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserPermissionId = getPermissionId(token, data);

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);
  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  // check channel/dm Id is valid and the authorised user is not a member of the channel
  // check the message was not sent by the authorised user making this request
  // check the authorised user does not have owner permissions in the channel/DM
  if (isChannelMessage) {
    // if (!data.channels[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.channels[channelDMIndex].messagesList[messageIndex].uId !== authUserId) {
      throw HTTPError(403, 'the message was not sent by authUser');
    }
    if (!data.channels[channelDMIndex].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  } else {
    // if (!data.dms[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.dms[channelDMIndex].messagesList[messageIndex].uId !== authUserId) {
      throw HTTPError(403, 'the message was not sent by authUser');
    }
    if (data.dms[channelDMIndex].creatorId !== authUserId) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  }

  // operations
  if (isChannelMessage) {
    data.channels[channelDMIndex].messagesList.splice(messageIndex, 1);
  } else {
    data.dms[channelDMIndex].messagesList.splice(messageIndex, 1);
  }

  const timeNow = Math.floor(Date.now() / 1000);
  data.currentMessages--;
  data.workspaceStats.messagesExist.push(
    {
      numMessagesExist: data.currentMessages,
      timeStamp: timeNow,
    }
  );

  setData(data);
  return {};
}

/**
* Send a message from authorisedUser to the DM specified by dmId.
* Note: Each message should have it's own unique ID, i.e. no messages should share an ID with another message,
* even if that other message is in a different channel or DM.
*
* @param {string} token
* @param {number} dmId
* @param {string} message
*
* @returns {{
*                messageId: number,
*           }} On no error
*
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*                             - length of message is less than 1 or over 1000 characters
* @throws {HTTPError(403)} On - invalid token
*                               - dmId is valid and the authorised user is not a member of the DM
*/
function messageSenddmV1(token: string, dmId: number, message: string): { messageId: number; } {
  const data = getData();

  // check valid token
  // check authUser is member or not
  // get the authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dmId
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the DM');
  }

  // check length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  // operations
  const messageId = data.totalMessages;
  const timeNow = Math.floor(Date.now() / 1000);

  const mess: messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: timeNow,
    reacts: [{
      reactId: 1,
      uIds: [],
      isThisUserReacted: false
    }],
    isPinned: false
  };

  data.dms[dmId].messagesList.unshift(mess);

  data.totalMessages++;

  data.currentMessages++;
  data.workspaceStats.messagesExist.push(
    {
      numMessagesExist: data.currentMessages,
      timeStamp: timeNow,
    }
  );

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].totalMessagesSent++;
      data.users[key].userStats.messagesSent.push({
        numMessagesSent: data.users[key].totalMessagesSent,
        timeStamp: timeNow
      });
      break;
    }
  }

  const taggedUIds = getDMTaggedUIds(dmId, message, data);

  if (taggedUIds.length > 0) {
    const limit = 20;
    let shortenMessage = message;

    if (message.length > limit) {
      shortenMessage = message.substring(0, limit);
    }
    const authUserHandle = getHandleStrList([authUserId], data)[0];

    for (const id of taggedUIds) {
      for (const key in data.users) {
        if (data.users[key].uId === id) {
          data.users[key].notifications.unshift(
            {
              channelId: -1,
              dmId: dmId,
              notificationMessage: authUserHandle + ' tagged you in ' + data.dms[dmId].nameDM + ': ' + shortenMessage
            }
          );
          break;
        }
      }
    }
  }
  setData(data);

  return { messageId: messageId };
}

/**
* ogMessageId is the ID of the original message. channelId is the channel that the message is
* being shared to, and is -1 if it is being sent to a DM. dmId is the DM that the message is
* being shared to, and is -1 if it is being sent to a channel. message is the optional message
* in addition to the shared message, and will be an empty string '' if no message is given.
*
* A new message containing the contents of both the original message and the optional message
* should be sent to the channel/DM identified by the channelId/dmId. The format of the new message
* does not matter as long as both the original and optional message exist as a substring within
* the new message. Once sent, this new message has no link to the original message, so if the
* original message is edited/deleted, no change will occur for the new message.
*
* @param {number} ogMessageId
* @param {string} message
* @param {number} channelId
* @param {number} dmId
*
* @returns {{
*                sharedMessageId: number,
*           }} On no error
*
* @throws {HTTPError(400)} On - both channelId and dmId are invalid
*                             - neither channelId nor dmId are -1
*                             - ogMessageId does not refer to a valid message within
*                               a channel/DM that the authorised user has joined
*                             - length of message is more than 1000 characters
* @throws {HTTPError(403)} On - invalid token
*                             - the pair of channelId and dmId are valid (i.e. one is -1, the
*                               other is valid) and the authorised user has not joined the channel
*                               or DM they are trying to share the message to
*/
function messageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): { sharedMessageId: number; } {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data) && !isValidDmId(dmId, data)) {
    throw HTTPError(400, 'both channelId and dmId are invalid');
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'neither channelId nor dmId are -1');
  }

  if (dmId === -1) {
    if (!data.channels[channelId].membersIdList.includes(authUserId)) {
      throw HTTPError(403, 'the authorised user has not joined the channel or DM they are trying to share the message to');
    }
  } else {
    if (!data.dms[dmId].membersIdList.includes(authUserId)) {
      throw HTTPError(403, 'the authorised user has not joined the channel or DM they are trying to share the message to');
    }
  }

  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);
  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === ogMessageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === ogMessageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  let newMessage = '';
  if (message.length !== 0) {
    if (isChannelMessage) {
      newMessage = data.channels[channelDMIndex].messagesList[messageIndex].message + ' ' + message;
    } else {
      newMessage = data.dms[channelDMIndex].messagesList[messageIndex].message + ' ' + message;
    }
  }

  const messageId = data.totalMessages;

  const timeNow = Math.floor(Date.now() / 1000);

  const mess: messages = {
    messageId: messageId,
    uId: authUserId,
    message: newMessage,
    timeSent: timeNow,
    reacts: [{
      reactId: 1,
      uIds: [],
      isThisUserReacted: false
    }],
    isPinned: false
  };

  if (dmId === -1) {
    data.channels[channelId].messagesList.unshift(mess);
  } else {
    data.dms[dmId].messagesList.unshift(mess);
  }

  data.totalMessages++;

  data.currentMessages++;
  data.workspaceStats.messagesExist.push(
    {
      numMessagesExist: data.currentMessages,
      timeStamp: timeNow,
    }
  );

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].totalMessagesSent++;
      data.users[key].userStats.messagesSent.push({
        numMessagesSent: data.users[key].totalMessagesSent,
        timeStamp: timeNow
      });
      break;
    }
  }

  let taggedUIds = [] as number[];
  if (dmId === -1) {
    taggedUIds = getChannelTaggedUIds(channelId, message, data);
  } else {
    taggedUIds = getDMTaggedUIds(dmId, message, data);
  }

  if (taggedUIds.length > 0) {
    const limit = 20;
    let shortenMessage = message;

    if (message.length > limit) {
      shortenMessage = message.substring(0, limit);
    }
    const authUserHandle = getHandleStrList([authUserId], data)[0];

    for (const id of taggedUIds) {
      for (const key in data.users) {
        if (data.users[key].uId === id) {
          if (dmId === -1) {
            data.users[key].notifications.unshift(
              {
                channelId: channelId,
                dmId: -1,
                notificationMessage: authUserHandle + ' tagged you in ' + data.channels[channelId].nameChannel + ': ' + shortenMessage
              }
            );
          } else {
            data.users[key].notifications.unshift(
              {
                channelId: -1,
                dmId: dmId,
                notificationMessage: authUserHandle + ' tagged you in ' + data.dms[dmId].nameDM + ': ' + shortenMessage
              }
            );
          }
          break;
        }
      }
    }
  }

  setData(data);
  return { sharedMessageId: messageId };
}

/**
* Given a message within a channel or DM the authorised user is part of,
* add a "react" to that particular message.
*
* @param {number} messageId
* @param {number} reactId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - messageId is not a valid message within a channel or DM
*                               that the authorised user has joined
*                             - reactId is not a valid react ID - currently, the only valid
*                               react ID the frontend has is 1
*                             - the message already contains a react with ID reactId from
*                               the authorised user
* @throws {HTTPError(403)} On - invalid token
*/
function messageReact(token: string, messageId: number, reactId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'invalid reactId');
  }

  if (isChannelMessage) {
    if (data.channels[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.includes(authUserId)) {
      throw HTTPError(400, 'the message already contains a react with ID reactId from the authorised user');
    }
  } else {
    if (data.dms[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.includes(authUserId)) {
      throw HTTPError(400, 'the message already contains a react with ID reactId from the authorised user');
    }
  }

  let isStillThere = false;
  let reactSendId = -1;
  if (isChannelMessage) {
    data.channels[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.push(authUserId);
    reactSendId = data.channels[channelDMIndex].messagesList[messageIndex].uId;
    if (data.channels[channelDMIndex].membersIdList.includes(reactSendId)) {
      isStillThere = true;
    }
  } else {
    data.dms[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.push(authUserId);
    reactSendId = data.dms[channelDMIndex].messagesList[messageIndex].uId;
    if (data.dms[channelDMIndex].membersIdList.includes(reactSendId)) {
      isStillThere = true;
    }
  }

  if (isStillThere) {
    const authUserHandle = getHandleStrList([authUserId], data)[0];
    for (const key in data.users) {
      if (data.users[key].uId === reactSendId) {
        if (isChannelMessage) {
          data.users[key].notifications.unshift(
            {
              channelId: channelDMIndex,
              dmId: -1,
              notificationMessage: authUserHandle + ' reacted to your message in ' + data.channels[channelDMIndex].nameChannel
            }
          );
        } else {
          data.users[key].notifications.unshift(
            {
              channelId: -1,
              dmId: channelDMIndex,
              notificationMessage: authUserHandle + ' reacted to your message in ' + data.dms[channelDMIndex].nameDM
            }
          );
        }
        break;
      }
    }
  }

  setData(data);
  return {};
}

/**
* Given a message within a channel or DM the authorised user is part of,
* remove a "react" to that particular message.
*
* @param {number} messageId
* @param {number} reactId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - messageId is not a valid message within a channel or DM
*                               that the authorised user has joined
*                             - reactId is not a valid react ID
*                             - the message does not contain a react with ID reactId from
*                               the authorised user
* @throws {HTTPError(403)} On - invalid token
*/
function messageUnreact(token: string, messageId: number, reactId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }

    if (reactId !== 1) {
      throw HTTPError(400, 'invalid reactId');
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  if (isChannelMessage) {
    if (!data.channels[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.includes(authUserId)) {
      throw HTTPError(400, 'the message does not contain a react with ID reactId from the authorised user');
    }
  } else {
    if (!data.dms[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.includes(authUserId)) {
      throw HTTPError(400, 'the message does not contain a react with ID reactId from the authorised user');
    }
  }

  if (isChannelMessage) {
    data.channels[channelDMIndex].messagesList[messageIndex].reacts[0].uIds = data.channels[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.filter((id: number) => id !== authUserId);
  } else {
    data.dms[channelDMIndex].messagesList[messageIndex].reacts[0].uIds = data.dms[channelDMIndex].messagesList[messageIndex].reacts[0].uIds.filter((id: number) => id !== authUserId);
  }

  setData(data);
  return {};
}

/**
* Given a message within a channel or DM, mark it as "pinned".
*
* @param {number} messageId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - messageId is not a valid message within a channel or DM
*                               that the authorised user has joined
*                             - the message is already pinned
* @throws {HTTPError(403)} On - invalid token
*                             - messageId refers to a valid message in a joined channel/DM and
*                               the authorised user does not have owner permissions in the channel/DM
*/
function messagePin(token: string, messageId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserPermissionId = getPermissionId(token, data);

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  // check channel/dm Id is valid and the authorised user is not a member of the channel
  // check the authorised user does not have owner permissions in the channel/DM
  if (isChannelMessage) {
    // if (!data.channels[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (!data.channels[channelDMIndex].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  } else {
    // if (!data.dms[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.dms[channelDMIndex].creatorId !== authUserId) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  }

  if (isChannelMessage) {
    if (data.channels[channelDMIndex].messagesList[messageIndex].isPinned) {
      throw HTTPError(400, 'the message is already pinned');
    }
  } else {
    if (data.dms[channelDMIndex].messagesList[messageIndex].isPinned) {
      throw HTTPError(400, 'the message is already pinned');
    }
  }

  if (isChannelMessage) {
    data.channels[channelDMIndex].messagesList[messageIndex].isPinned = true;
  } else {
    data.dms[channelDMIndex].messagesList[messageIndex].isPinned = true;
  }

  setData(data);
  return {};
}

/**
* Given a message within a channel or DM, remove its mark as "pinned".
*
* @param {number} messageId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - messageId is not a valid message within a channel or DM
*                               that the authorised user has joined
*                             - the message is not already pinned
* @throws {HTTPError(403)} On - invalid token
*                             - messageId refers to a valid message in a joined channel/DM and
*                               the authorised user does not have owner permissions in the channel/DM
*/
function messageUnpin(token: string, messageId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserPermissionId = getPermissionId(token, data);

  // check is the message valid or not
  // if yes, check the message is from channel of dm
  // get the channel or dm index and messageindex
  const channelIdList = getChannelIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  let isChannelMessage = false;
  let isValidMessage = false;

  let channelDMIndex = -1;
  let messageIndex = -1;

  for (const chanIndex of channelIdList) {
    for (const messIndex in data.channels[chanIndex].messagesList) {
      if (data.channels[chanIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
        isValidMessage = true;
        isChannelMessage = true;
        channelDMIndex = chanIndex;
        messageIndex = parseInt(messIndex);
        break;
      }
    }
    if (isValidMessage) {
      break;
    }
  }

  if (!isChannelMessage) {
    for (const dmIndex of dmIdList) {
      for (const messIndex in data.dms[dmIndex].messagesList) {
        if (data.dms[dmIndex].messagesList[parseInt(messIndex)].messageId === messageId) {
          isValidMessage = true;
          channelDMIndex = dmIndex;
          messageIndex = parseInt(messIndex);
          break;
        }
      }
      if (isValidMessage) {
        break;
      }
    }
  }

  if (!isValidMessage) {
    throw HTTPError(400, 'invalid messageId');
  }

  // check channel/dm Id is valid and the authorised user is not a member of the channel
  // check the authorised user does not have owner permissions in the channel/DM
  if (isChannelMessage) {
    // if (!data.channels[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (!data.channels[channelDMIndex].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  } else {
    // if (!data.dms[channelDMIndex].membersIdList.includes(authUserId)) {
    //   return { error: 'error' };
    // }
    if (data.dms[channelDMIndex].creatorId !== authUserId) {
      throw HTTPError(403, 'the authorised user does not have owner permissions');
    }
  }

  if (isChannelMessage) {
    if (!data.channels[channelDMIndex].messagesList[messageIndex].isPinned) {
      throw HTTPError(400, 'the message is not already pinned');
    }
  } else {
    if (!data.dms[channelDMIndex].messagesList[messageIndex].isPinned) {
      throw HTTPError(400, 'the message is not already pinned');
    }
  }

  if (isChannelMessage) {
    data.channels[channelDMIndex].messagesList[messageIndex].isPinned = false;
  } else {
    data.dms[channelDMIndex].messagesList[messageIndex].isPinned = false;
  }

  setData(data);
  return {};
}

/**
* Send a message from the authorised user to the channel specified by channelId automatically
* at a specified time in the future. The returned messageId will only be considered valid
* for other actions (editing/deleting/reacting/etc) once it has been sent (i.e. after timeSent).
*
* @param {number} channelId
* @param {string} message
* @param {number} timeSent
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - channelId does not refer to a valid channel
*                             - length of message is less than 1 or over 1000 characters
*                             - timeSent is a time in the past
* @throws {HTTPError(403)} On - invalid token
*                             - channelId is valid and the authorised user is not a member
*                               of the channel they are trying to post to
*/
function messageSendlater(token: string, channelId: number, message: string, timeSent: number): { messageId: number; } {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'invalid channelId');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'he authorised user is not a member of the channel they are trying to post to');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const timeNow = Math.floor(Date.now() / 1000);
  if (timeSent < timeNow) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  const messageId = data.totalMessages;
  data.totalMessages++;

  setTimeout(function() {
    helperSendlater(channelId, messageId, authUserId, message, timeSent);
  }, (timeSent - timeNow) * 1000);
  setData(data);
  return { messageId: messageId };
}

function helperSendlater(channelId: number, messageId: number, authUserId: number, message: string, timeSent: number) {
  const dataLater = getData();
  const mess: messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: timeSent,
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
      timeStamp: timeSent,
    }
  );

  for (const key in dataLater.users) {
    if (dataLater.users[key].uId === authUserId) {
      dataLater.users[key].totalMessagesSent++;
      dataLater.users[key].userStats.messagesSent.push({
        numMessagesSent: dataLater.users[key].totalMessagesSent,
        timeStamp: timeSent
      });
      break;
    }
  }

  const taggedUIds = getChannelTaggedUIds(channelId, message, dataLater);
  if (taggedUIds.length > 0) {
    const limit = 20;
    let shortenMessage = message;

    if (message.length > limit) {
      shortenMessage = message.substring(0, limit);
    }

    const authUserHandle = getHandleStrList([authUserId], dataLater)[0];

    for (const id of taggedUIds) {
      for (const key in dataLater.users) {
        if (dataLater.users[key].uId === id) {
          dataLater.users[key].notifications.unshift(
            {
              channelId: channelId,
              dmId: -1,
              notificationMessage: authUserHandle + ' tagged you in ' + dataLater.channels[channelId].nameChannel + ': ' + shortenMessage
            }
          );
          break;
        }
      }
    }
  }
  setData(dataLater);
}

/**
* Send a message from the authorised user to the DM specified by dmId automatically
* at a specified time in the future. The returned messageId will only be considered
* valid for other actions (editing/deleting/reacting/etc) once it has been sent
* (i.e. after timeSent). If the DM is removed before the message has sent,
* the message will not be sent.
*
* @param {number} dmId
* @param {string} message
* @param {number} timeSent
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*                             - length of message is less than 1 or over 1000 characters
*                             - timeSent is a time in the past
* @throws {HTTPError(403)} On - invalid token
*                             - dmId is valid and the authorised user is not a member of the
*                               DM they are trying to post to
*/
function messageSendlaterdm(token: string, dmId: number, message: string, timeSent: number): { messageId: number; } {
  const data = getData();

  // check valid token
  // check channelId is valid and the authorised user is not a member of the channel
  // also get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dmId
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the DM they are trying to post to');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  const timeNow = Math.floor(Date.now() / 1000);
  if (timeSent < timeNow) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  const messageId = data.totalMessages;
  data.totalMessages++;
  setTimeout(function () {
    helperSendlaterdm(dmId, messageId, authUserId, message, timeSent);
  }, (timeSent - timeNow) * 1000);

  setData(data);
  return { messageId: messageId };
}

function helperSendlaterdm (dmId: number, messageId: number, authUserId: number, message: string, timeSent: number) {
  const dataLater = getData();

  if (dataLater.dms[dmId].dmId !== -2) {
    const mess: messages = {
      messageId: messageId,
      uId: authUserId,
      message: message,
      timeSent: timeSent,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false
      }],
      isPinned: false
    };

    dataLater.dms[dmId].messagesList.unshift(mess);

    dataLater.currentMessages++;
    dataLater.workspaceStats.messagesExist.push(
      {
        numMessagesExist: dataLater.currentMessages,
        timeStamp: timeSent,
      }
    );

    for (const key in dataLater.users) {
      if (dataLater.users[key].uId === authUserId) {
        dataLater.users[key].totalMessagesSent++;
        dataLater.users[key].userStats.messagesSent.push({
          numMessagesSent: dataLater.users[key].totalMessagesSent,
          timeStamp: timeSent
        });
        break;
      }
    }

    const taggedUIds = getDMTaggedUIds(dmId, message, dataLater);

    if (taggedUIds.length > 0) {
      const limit = 20;
      let shortenMessage = message;

      if (message.length > limit) {
        shortenMessage = message.substring(0, limit);
      }
      const authUserHandle = getHandleStrList([authUserId], dataLater)[0];

      for (const id of taggedUIds) {
        for (const key in dataLater.users) {
          if (dataLater.users[key].uId === id) {
            dataLater.users[key].notifications.unshift(
              {
                channelId: -1,
                dmId: dmId,
                notificationMessage: authUserHandle + ' tagged you in ' + dataLater.dms[dmId].nameDM + ': ' + shortenMessage
              }
            );
            break;
          }
        }
      }
    }
  }
  setData(dataLater);
}
export {
  messageSendV1, messageEditV1, messageRemoveV1, messageSenddmV1, messageShare,
  messageReact, messageUnreact, messagePin, messageUnpin, messageSendlater, messageSendlaterdm
};

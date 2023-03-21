import { getData, messages } from './dataStore';

import { getAuthUserId, getChannelIdList, getDmIdList } from './helper';

import HTTPError from 'http-errors';

/**
* Given a query string, return a collection of messages in all of the channels/DMs
* that the user has joined that contain the query (case-insensitive).
* There is no expected order for these messages.
*
* @param {string} token
* @param {string} queryStr
*
* @returns {{
*                messages: messages,
*           }} On no error
*
* @throws {HTTPError(400)} On - length of queryStr is less than 1 or over 1000 characters
* @throws {HTTPError(403)} On - invalid token
*/
export function search(token: string, queryStr: string): { messages: messages[]; } {
  const data = getData();

  // get authUserId of the token
  // check valid token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check length of queryStr is less than 1 or over 1000 characters
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'length of queryStr is less than 1 or over 1000 characters');
  }

  const dmIdList = getDmIdList(token, data);
  const channelsIdList = getChannelIdList(token, data);

  const messages = [] as messages[];

  for (const channelId of channelsIdList) {
    for (const message of data.channels[channelId].messagesList) {
      const mess = message.message.toLowerCase();
      if (mess.includes(queryStr.toLowerCase())) {
        if (message.reacts[0].uIds.includes(authUserId)) {
          message.reacts[0].isThisUserReacted = true;
        } else {
          message.reacts[0].isThisUserReacted = false;
        }
        messages.push(message);
      }
    }
  }

  for (const dmId of dmIdList) {
    for (const message of data.dms[dmId].messagesList) {
      const mess = message.message.toLowerCase();
      if (mess.includes(queryStr.toLowerCase())) {
        if (message.reacts[0].uIds.includes(authUserId)) {
          message.reacts[0].isThisUserReacted = true;
        } else {
          message.reacts[0].isThisUserReacted = false;
        }
        messages.push(message);
      }
    }
  }

  return { messages: messages };
}

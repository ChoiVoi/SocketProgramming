import { getData, messages, setData, userP } from './dataStore';
import { isValidChannelId, getAuthUserId, getPermissionId, getHandleStrList, isValidUId } from './helper';
import HTTPError from 'http-errors';

/**
 * User joins the channel and the user becomes a member of the channel
 * @param {string} token - A string containing the user token
 * @param {number} channelId
 * @returns { {} } On no error
 * @throws { HTTPError(400) }
 *                - On channelId does not refer to a valid channel
 *                - On the authorised user is already a member of the channel
 * @throws { HTTPError(403) }
 *                - On invalid token
 *                - On channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner
*/

function channelJoinV2(token: string, channelId: number): Record<string, unknown> {
  const data = getData();
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(400, 'the authorised user is already a member of the channel');
  }

  if (!data.channels[channelId].isPublic) {
    for (const key in data.users) {
      if (data.users[key].uId === authUserId) {
        if (data.users[key].permissionId !== 1) {
          throw HTTPError(403, 'channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner');
        }
        break;
      }
    }
  }

  const timeNow = Math.floor(Date.now() / 1000);

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].channelsIdList.push(channelId);
      data.users[key].userStats.channelsJoined.push(
        {
          numChannelsJoined: data.users[key].channelsIdList.length,
          timeStamp: timeNow
        }
      );
      break;
    }
  }

  data.channels[channelId].membersIdList.push(authUserId);

  setData(data);
  return {};
}

/**
 * shows the channel details containing name, isPublic, ownerMembers and allMembers
 * @param {string} token - A string containing the user token
 * @param {number} channelId
 * @returns {{
 *            name: string,
 *            isPublic: boolean,
 *            ownerMembers: userP[],
 *            allMembers: userP[]
 *           }}   - On no error
 * @throws { HTTPError(400) }
 *                - On channelId does not refer to a valid channel
 * @throws { HttpError(403) }
 *                - On token is not valid
 *                - On channelId is valid and the authorised user is not a member of the channel
 */

function channelDetailsV2(token: string, channelId: number): { name: string; isPublic: boolean; ownerMembers: userP[]; allMembers: userP[]; } {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  const OwnerMembers = [] as userP[];
  for (const uId of data.channels[channelId].ownersIdList) {
    for (const key in data.users) {
      if (data.users[key].uId === uId) {
        const user = {
          uId: data.users[key].uId,
          email: key,
          nameFirst: data.users[key].nameFirst,
          nameLast: data.users[key].nameLast,
          handleStr: data.users[key].handleStr,
          profileImgUrl: data.users[key].profileImgUrl
        } as userP;

        OwnerMembers.push(user);
        break;
      }
    }
  }

  const allMembers = [] as userP[];
  for (const uId of data.channels[channelId].membersIdList) {
    for (const key in data.users) {
      if (data.users[key].uId === uId) {
        const user = {
          uId: data.users[key].uId,
          email: key,
          nameFirst: data.users[key].nameFirst,
          nameLast: data.users[key].nameLast,
          handleStr: data.users[key].handleStr,
          profileImgUrl: data.users[key].profileImgUrl
        } as userP;
        allMembers.push(user);
        break;
      }
    }
  }

  return {
    name: data.channels[channelId].nameChannel,
    isPublic: data.channels[channelId].isPublic,
    ownerMembers: OwnerMembers,
    allMembers: allMembers,
  };
}

/**
 * invites a user to the channel and becomes a member of the channel
 * @param {string} token - A string containing the user token
 * @param {number} channelId
 * @param {number} uId
 * @returns { {} } - On no error
 * @throws { HTTPError(400) }
 *                        - On channelId does not refer to a valid channel
 *                        - uId does not refer to a valid user
 *                        - uId refers to a user who is already a member of the channel
 * @throws { HttpError(403) }
 *                        - On the token is invalid
 *                        - channelId is valid and the authorised user is not a member of the channel
 */

function channelInviteV2(token: string, channelId: number, uId: number): Record<string, unknown> {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  if (!isValidUId(uId, data)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (data.channels[channelId].membersIdList.includes(uId)) {
    throw HTTPError(400, 'uId refers to a user who is already a member of the channel');
  }

  const authUserHandle = getHandleStrList([authUserId], data)[0];
  const timeNow = Math.floor(Date.now() / 1000);
  for (const key in data.users) {
    if (data.users[key].uId === uId) {
      data.users[key].notifications.unshift(
        {
          channelId: channelId,
          dmId: -1,
          notificationMessage: authUserHandle + ' added you to ' + data.channels[channelId].nameChannel
        }
      );
      data.users[key].channelsIdList.push(channelId);
      data.users[key].userStats.channelsJoined.push(
        {
          numChannelsJoined: data.users[key].channelsIdList.length,
          timeStamp: timeNow
        }
      );
      break;
    }
  }

  data.channels[channelId].membersIdList.push(uId);

  setData(data);

  return {};
}

/**
 * shows the messages in the channel
 * @param {string } token
 * @param {number} channelId
 * @param {number} start
 * @returns {{
 *            messages: messages[],
 *            start: number,
 *            end: number
 *            }}
 * @throws { HTTPError(400) }
 *                      - On channelId does not refer to a valid channel
 *                      - On start is greater than the total number of messages in the channel
 * @throws { HTTPError(403) }
 *                      - On invalid token
 *                      - On channelId is valid and the autoriesd user is not a member of the channel
 */

function channelMessagesV2(token: string, channelId: number, start: number): { messages: messages[]; start: number; end: number; } {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  if (start > data.channels[channelId].messagesList.length) {
    throw HTTPError(400, 'start is greater than total number of messages in the channel');
  }

  const messages = [] as messages[];

  if (data.channels[channelId].messagesList.length === 0) {
    return {
      messages: messages,
      start: start,
      end: -1,
    };
  }

  let isLeastRecent = false;

  for (let i = start; i < start + 50; i++) {
    if (i >= data.channels[channelId].messagesList.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }

    if (data.channels[channelId].messagesList[i].reacts[0].uIds.includes(authUserId)) {
      data.channels[channelId].messagesList[i].reacts[0].isThisUserReacted = true;
    } else {
      data.channels[channelId].messagesList[i].reacts[0].isThisUserReacted = false;
    }

    messages.push(data.channels[channelId].messagesList[i]);

    if (i === data.channels[channelId].messagesList.length - 1) {
      isLeastRecent = true;
    }
  }

  if (isLeastRecent) {
    return {
      messages: messages,
      start: start,
      end: -1,
    };
  } else {
    return {
      messages: messages,
      start: start,
      end: start + 50,
    };
  }
}

/**
 * user leaves the channel
 * @param {string} token - A string containing user token
 * @param {number} channelId
 * @returns { {} } -  On no error
 * @throws { HTTPError(400) }
 *                        - On channelId does not refer to a valid channel
 *                        - On  the authorised user is the starter of an active standup in the channel
 * @throws { HTTPError(403) }
 *                        - On user token is not valid
 *                        - On channelId is valid and the authorised user is not a member of the channel
 */

function channelLeaveV1(token: string, channelId: number): Record<string, unknown> {
  const data = getData();
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  if (data.channels[channelId].standup.uId === authUserId && data.channels[channelId].standup.isActive) {
    throw HTTPError(400, 'the authorised user is the starter of an active standup in the channel');
  }

  data.channels[channelId].membersIdList = data.channels[channelId].membersIdList.filter((id: number) => id !== authUserId);

  if (data.channels[channelId].ownersIdList.includes(authUserId)) {
    data.channels[channelId].ownersIdList = data.channels[channelId].ownersIdList.filter((id: number) => id !== authUserId);
  }

  const timeNow = Math.floor(Date.now() / 1000);
  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].channelsIdList = data.users[key].channelsIdList.filter((id: number) => id !== channelId);
      data.users[key].userStats.channelsJoined.push(
        {
          numChannelsJoined: data.users[key].channelsIdList.length,
          timeStamp: timeNow
        }
      );
      break;
    }
  }

  setData(data);

  return {};
}

/**
 * Channel owner or global user who joins the channel assigns a user as a owner of the channel
 * @param {string} token - A string containing user token
 * @param {number} channelId
 * @param {number} uId
 * @returns { {} } - On no error
 * @throws { HTTPError(400) }
 *                      - On channelId does not refer to a valid channel
 *                      - On uId does not refer to a valid user
 *                      - On uId refers to a user who is not a member of the channel
 *                      - On uId refers to a user who is already an owner of the channel
 * @throws { HTTPError(403) }
 *                      - invalid token
 *                      - channelId is valid and the authorised user does not have owner permissions in the channel
 */

function channelAddownerV1(token: string, channelId: number, uId: number): Record<string, unknown> {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserPermissionId = getPermissionId(token, data);

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!data.channels[channelId].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }

  // check uid valid or not
  if (!isValidUId(uId, data)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // check uid is not a member of a channel
  if (!(data.channels[channelId].membersIdList.includes(uId))) {
    throw HTTPError(400, 'uId refers to a user who is not a member of the channel');
  }

  // check uid is already a owner
  if (data.channels[channelId].ownersIdList.includes(uId)) {
    throw HTTPError(400, 'uId refers to a user who is already an owner of the channel');
  }

  data.channels[channelId].ownersIdList.push(uId);

  setData(data);

  return {};
}

/**
 * Channel owner or global user who joins the channel assigns a user as a owner of the channel
 * @param {string} token - A string containing user token
 * @param {number} channelId
 * @param {number} uId
 * @returns { {} } - On no error
 * @throws { HTTPError(400) }
 *                      - On channelId does not refer to a valid channel
 *                      - On uId does not refer to a valid user
 *                      - On uId refers to a user who is not a member of the channel
 *                      - On uId refers to a user who is not an owner of the channel
 *                      - On uId refers to a user who is currently the only owner of the channel
 * @throws { HTTPError(403) }
 *                      - On invalid token
 *                      - channelId is valid and the authorised user does not have owner permissions in the channel
 */

function channelRemoveownerV1(token: string, channelId: number, uId: number): Record<string, unknown> {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserPermissionId = getPermissionId(token, data);

  if (!isValidChannelId(channelId, data)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if ((!data.channels[channelId].ownersIdList.includes(authUserId) && authUserPermissionId !== 1) || !data.channels[channelId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }

  // check uid valid or not
  if (!isValidUId(uId, data)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // check uid is not a member of a channel
  if (!(data.channels[channelId].membersIdList.includes(uId))) {
    throw HTTPError(400, 'uId refers to a user who is not a member of the channel');
  }

  // check uId refers to a user who is not an owner of the channel
  if (!data.channels[channelId].ownersIdList.includes(uId)) {
    throw HTTPError(400, 'uId refers to a user who is not an owner of the channel');
  }

  // check uId refers to a user who is currently the only owner of the channel
  if (data.channels[channelId].ownersIdList.length === 1) {
    throw HTTPError(400, 'uId refers to a user who is currently the only owner of the chnanel');
  }

  data.channels[channelId].ownersIdList = data.channels[channelId].ownersIdList.filter((Id: number) => Id !== uId);
  setData(data);

  return {};
}

export {
  channelDetailsV2,
  channelJoinV2,
  channelInviteV2,
  channelMessagesV2,
  channelLeaveV1,
  channelAddownerV1,
  channelRemoveownerV1,
};

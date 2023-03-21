import { getData, setData, messages, userP, dm } from './dataStore';

import { getAuthUserId, isValidDmId, getDmIdList, isValidUIds, getHandleStrList } from './helper';

import HTTPError from 'http-errors';

/**
* uIds contains the user(s) that this DM is directed to,
* and will not include the creator. The creator is the owner of the DM. name should be automatically
* generated based on the users that are in this DM. The name should be an alphabetically-sorted,
* comma-and-space-separated array of user handles, e.g. 'ahandle1, bhandle2, chandle3'.
*
* @param {string} token
* @param {number[]} uIds
*
* @returns {{
*                dmId: number,
*           }} On no error
*
* @throws {HTTPError(400)} On - any uId in uIds does not refer to a valid user
*                               - there are duplicate 'uId's in uIds
* @throws {HTTPError(403)} On - invalid token
*/

function dmCreateV1(token: string, uIds: number[]): { dmId: number; } {
  const data = getData();

  // get authUserId of the token
  // check valid token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid uIds
  if (!isValidUIds(uIds, data)) {
    throw HTTPError(400, 'any uId in uIds does not refer to a valid user');
  }

  // check there are duplicate 'uId's in uIds
  const authUId = [authUserId];
  const allUId = authUId.concat(uIds);

  if (new Set(allUId).size !== allUId.length) {
    throw HTTPError(400, 'there are duplicate uIds in uIds');
  }

  const handleStrList = getHandleStrList(allUId, data);
  const authUserHandle = getHandleStrList(authUId, data)[0];
  // operations
  handleStrList.sort();

  let nameDM = '';
  for (let i = 0; i < handleStrList.length; i++) {
    nameDM += handleStrList[i];
    if (i < handleStrList.length - 1) {
      nameDM += ', ';
    }
  }

  const dmId = data.dms.length;

  const dm = {
    dmId: dmId,
    nameDM: nameDM,
    creatorId: authUserId,
    membersIdList: allUId,
    messagesList: [] as messages[]
  };
  const timeNow = Math.floor(Date.now() / 1000);
  data.dms.push(dm);
  data.currentDMs++;
  data.workspaceStats.dmsExist.push(
    {
      numDmsExist: data.currentDMs,
      timeStamp: timeNow,
    }
  );

  for (const id of allUId) {
    for (const key in data.users) {
      if (data.users[key].uId === id) {
        data.users[key].dmIdList.push(dmId);
        data.users[key].userStats.dmsJoined.push(
          {
            numDmsJoined: data.users[key].dmIdList.length,
            timeStamp: timeNow
          }
        );

        if (data.users[key].uId !== authUserId) {
          data.users[key].notifications.unshift(
            {
              channelId: -1,
              dmId: dmId,
              notificationMessage: authUserHandle + ' added you to ' + nameDM
            }
          );
        }
        break;
      }
    }
  }

  setData(data);

  return { dmId: dmId };
}

/**
* Returns the array of DMs that the user is a member of.
*
* @param {string} token
*
* @returns {{
*               dms: dm[],
*           }} On no error
*
* @throws {HTTPError(403)} On - invalid token
*
*/
function dmListV1(token: string): { dms: dm[]; } {
  const data = getData();

  // check valid token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // const dmIdList = getDmIdList(token, data);
  const dmIdList = getDmIdList(token, data);

  const dms = [] as dm[];

  for (const dmId of dmIdList) {
    const dm = {
      dmId: dmId,
      name: data.dms[dmId].nameDM,
    } as dm;

    dms.push(dm);
  }

  return { dms: dms };
}

/**
* Remove an existing DM, so all members are no longer in the DM.
* This can only be done by the original creator of the DM.
*
* @param {string} token
* @param {number} dmId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*
* @throws {HTTPError(403)} On - invalid token
*                               - dmId is valid and the authorised user is not the original DM creator
*                               - dmId is valid and the authorised user is no longer in the DM
*/
function dmRemoveV1(token: string, dmId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check dmId is valid and the authorised user is not the original DM creator
  // check dmId is valid and the authorised user is no longer in the DM
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dm Id
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (data.dms[dmId].creatorId !== authUserId) {
    throw HTTPError(403, 'the authorised user is not the original DM creator');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is no longer in the DM');
  }

  // operations
  const timeNow = Math.floor(Date.now() / 1000);

  for (const key in data.users) {
    if (data.users[key].dmIdList.includes(dmId)) {
      data.users[key].dmIdList = data.users[key].dmIdList.filter((id: number) => id !== dmId);
      data.users[key].userStats.dmsJoined.push(
        {
          numDmsJoined: data.users[key].dmIdList.length,
          timeStamp: timeNow
        }
      );
    }
  }

  const numMessages = data.dms[dmId].messagesList.length;
  data.dms[dmId].dmId = -2;
  data.dms[dmId].creatorId = -2;
  data.dms[dmId].membersIdList = [];
  data.dms[dmId].messagesList = [];

  data.currentDMs--;
  data.workspaceStats.dmsExist.push(
    {
      numDmsExist: data.currentDMs,
      timeStamp: timeNow,
    }
  );

  data.currentMessages -= numMessages;
  data.workspaceStats.messagesExist.push(
    {
      numMessagesExist: data.currentMessages,
      timeStamp: timeNow,
    }
  );
  // be aware of index in error check and correct cases when remove dm
  setData(data);
  return {};
}

/**
* Given a DM with ID dmId that the authorised user is a member of, provide basic details about the DM.
*
* @param {string} token
* @param {number} dmId
*
* @returns {{
*                name: string,
*                members: userP[],
*           }} On no error
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*
* @throws {HTTPError(403)} On - invalid token
*                               - dmId is valid and the authorised user is not a member of the DM
*/
function dmDetailsV1(token: string, dmId: number): { name: string; members: userP[]; } {
  const data = getData();

  // check valid token
  // check dmId is valid and the authorised user is not a member of the DM
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dm ID
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the DM');
  }

  // operations
  const members = [] as userP[];

  for (const uId of data.dms[dmId].membersIdList) {
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

        members.push(user);

        break;
      }
    }
  }

  return {
    name: data.dms[dmId].nameDM,
    members: members
  };
}

/**
* Given a DM ID, the user is removed as a member of this DM.
* The creator is allowed to leave and the DM will still exist if this happens.
* This does not update the name of the DM.
*
* @param {string} token
* @param {number} dmId
*
* @returns {{}} On no error
*
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*
* @throws {HTTPError(403)} On - invalid token
*                               - dmId is valid and the authorised user is not a member of the DM
*/
function dmLeaveV1(token: string, dmId: number): Record<string, unknown> {
  const data = getData();

  // check valid token
  // check dmId is valid and the authorised user is not a member of the DM
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dm ID
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the DM');
  }

  // operations
  data.dms[dmId].membersIdList = data.dms[dmId].membersIdList.filter((id: number) => id !== authUserId);

  const timeNow = Math.floor(Date.now() / 1000);

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].dmIdList = data.users[key].dmIdList.filter((id: number) => id !== dmId);
      data.users[key].userStats.dmsJoined.push(
        {
          numDmsJoined: data.users[key].dmIdList.length,
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
* Given a DM with ID dmId that the authorised user is a member of,
* return up to 50 messages between index "start" and "start + 50".
* Message with index 0 is the most recent message in the DM.
* This function returns a new index "end" which is the value of "start + 50", or,
* if this function has returned the least recent messages in the DM, returns -1 in "end" to indicate
* there are no more messages to load after this return.
*
* @param {string} token
* @param {number} dmId
* @param {number} start
*
* @returns {{
*               messages: message[],
*               start: number,
*               end: number
*           }} On no error
*
* @throws {HTTPError(400)} On - dmId does not refer to a valid DM
*                               - start is greater than the total number of messages in the channel
* @throws {HTTPError(403)} On - invalid token
*                               - dmId is valid and the authorised user is not a member of the DM
*/
function dmMessagesV1(token: string, dmId: number, start: number): { messages: messages[]; start: number; end: number; } {
  const data = getData();

  // check valid token
  // check dmId is valid and the authorised user is not a member of the DM
  // get authUserId of the token
  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'invalid token');
  }

  // check valid dm ID
  if (!isValidDmId(dmId, data)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!data.dms[dmId].membersIdList.includes(authUserId)) {
    throw HTTPError(403, 'the authorised user is not a member of the DM');
  }

  // check start is greater than the total number of messages in the channel
  if (start > data.dms[dmId].messagesList.length) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  }

  // operations
  const messages = [] as messages[];

  if (data.dms[dmId].messagesList.length === 0) {
    return {
      messages: messages,
      start: start,
      end: -1,
    };
  }

  let isLeastRecent = false;

  for (let i = start; i < start + 50; i++) {
    if (i >= data.dms[dmId].messagesList.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }
    if (data.dms[dmId].messagesList[i].reacts[0].uIds.includes(authUserId)) {
      data.dms[dmId].messagesList[i].reacts[0].isThisUserReacted = true;
    } else {
      data.dms[dmId].messagesList[i].reacts[0].isThisUserReacted = false;
    }
    messages.push(data.dms[dmId].messagesList[i]);

    if (i === data.dms[dmId].messagesList.length - 1) {
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

export { dmCreateV1, dmListV1, dmRemoveV1, dmDetailsV1, dmLeaveV1, dmMessagesV1 };

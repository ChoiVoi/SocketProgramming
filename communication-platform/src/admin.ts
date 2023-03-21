import { getData, setData } from './dataStore';
import { getAuthUserId } from './helper';
import HTTPError from 'http-errors';

/**
* Removes the given user of uId if the user requesting the removal has correct permissions
*
* @param {string} token - A string containing the users token
* @param {number} uId - An integer containing the users uId
*
* @throws { HTTPError(403) } - On
*                                 - token is invalid
*                                 - the authorised user is not a global owner
*
* @throws { HTTPError(400) } - On
*                                 - uId does not refer to a valid user
*                                 - uId refers to a user who is the only global owner
*/
function adminUserRemoveV1(token: string, uId: number): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  let numGlobalOwners = 0;
  let globalOwner = false;
  let validUid = false;

  for (const key in store.users) {
    if (store.users[key].permissionId === 1 && store.users[key].isRemoved === false) {
      numGlobalOwners += 1;
    }

    if (store.users[key].uId === authUserId && store.users[key].permissionId !== 1) {
      throw HTTPError(403, 'the authorised user is not a global owner');
    }

    if (store.users[key].uId === uId && store.users[key].permissionId === 1) {
      globalOwner = true;
    }

    if (store.users[key].uId === uId && store.users[key].isRemoved === false) {
      validUid = true;
    }
  }

  if (!validUid) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (numGlobalOwners <= 1 && globalOwner === true) {
    throw HTTPError(400, 'uId refers to a user who is the only global owner');
  }

  for (const channel of store.channels) {
    if (channel.ownersIdList.includes(uId)) {
      store.channels[store.channels.indexOf(channel)]
        .ownersIdList
        .splice((store.channels[store.channels.indexOf(channel)].ownersIdList.indexOf(uId)), 1);
    }
    if (channel.membersIdList.includes(uId)) {
      store.channels[store.channels.indexOf(channel)]
        .membersIdList
        .splice((store.channels[store.channels.indexOf(channel)].membersIdList.indexOf(uId)), 1);
    }

    for (const message of store.channels[store.channels.indexOf(channel)].messagesList) {
      if (message.uId === uId) {
        store.channels[store.channels.indexOf(channel)]
          .messagesList[store.channels[store.channels.indexOf(channel)]
            .messagesList.indexOf(message)].message = 'Removed user';
      }
    }
  }

  for (const dm of store.dms) {
    if (dm.membersIdList.includes(uId)) {
      store.dms[store.dms.indexOf(dm)]
        .membersIdList
        .splice((store.dms[store.dms.indexOf(dm)].membersIdList.indexOf(uId)), 1);
    }

    for (const message of store.dms[store.dms.indexOf(dm)].messagesList) {
      if (message.uId === uId) {
        store.dms[store.dms.indexOf(dm)]
          .messagesList[store.dms[store.dms.indexOf(dm)]
            .messagesList.indexOf(message)].message = 'Removed user';
      }
    }
  }

  const time = Math.floor((new Date()).getTime() / 1000);

  for (const key in store.users) {
    if (store.users[key].uId === uId) {
      store.users[key].isRemoved = true;
      store.users[key].nameFirst = 'Removed';
      store.users[key].nameLast = 'user';
      store.users[key].channelsIdList = [];
      store.users[key].dmIdList = [];
      store.users[key].userStats.channelsJoined.push({
        numChannelsJoined: 0,
        timeStamp: time,
      });
      store.users[key].userStats.dmsJoined.push({
        numDmsJoined: 0,
        timeStamp: time,
      });
      break;
    }
  }

  setData(store);

  return {};
}

/**
* Changes the given users permission if the user requesting the change has correct permissions
*
* @param {string} token - A string containing the users token
* @param {number} uId - An integer containing the users uId
* @param {number} permissionId - An integer containing the new permissionId
*
* @throws { HTTPError(403) } - On
*                                 - token is invalid
*                                 - the authorised user is not a global owner
*
* @throws { HTTPError(400) } - On
*                                 - uId does not refer to a valid user
*                                 - uId refers to a user who is the only global owner and they are being demoted to a user
*                                 - the user already has the permissions level of permissionId
*                                 - permissionId is invalid
*/
function adminPermissionChangeV1(token: string, uId: number, permissionId: number): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId && store.users[key].permissionId !== 1) {
      throw HTTPError(403, 'the authorised user is not a global owner');
    }
  }

  let numGlobalOwners = 0;
  let globalOwner = false;
  let validUid = false;

  for (const key in store.users) {
    if (store.users[key].permissionId === 1 && store.users[key].isRemoved === false) {
      numGlobalOwners += 1;
    }

    if (store.users[key].uId === uId && store.users[key].permissionId === 1) {
      globalOwner = true;
    }

    if (store.users[key].uId === uId && store.users[key].permissionId === permissionId) {
      throw HTTPError(400, 'the user already has the permissions level of permissionId');
    }

    if (store.users[key].uId === uId && store.users[key].isRemoved === false) {
      validUid = true;
    }
  }

  if (!validUid) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (numGlobalOwners === 1 && permissionId !== 1 && globalOwner === true) {
    throw HTTPError(400, 'uId refers to a user who is the only global owner and they are being demoted to a user');
  }

  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'permissionId is invalid');
  }

  for (const key in store.users) {
    if (store.users[key].uId === uId) {
      store.users[key].permissionId = permissionId;
      break;
    }
  }

  setData(store);

  return {};
}

export { adminPermissionChangeV1, adminUserRemoveV1 };

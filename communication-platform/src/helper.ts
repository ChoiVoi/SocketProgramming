import { dataType } from './dataStore';

import crypto from 'crypto';

export const SECRET = 'COMP1531EGGS';

function isValidChannelId(channelId: number, data: dataType) {
  let isValidChannelId = false;

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      isValidChannelId = true;
      break;
    }
  }

  return isValidChannelId;
}

function isValidDmId(dmId: number, data: dataType) {
  let isValidDmId = false;

  for (const dm of data.dms) {
    if (dm.dmId === dmId && dmId >= 0) {
      isValidDmId = true;
      break;
    }
  }

  return isValidDmId;
}

// return -1 if token is invalid, else return authUserId
function getAuthUserId(token: string, data: dataType) {
  let authUserId = -1;
  for (const key in data.users) {
    for (const currentToken of data.users[key].tokenList) {
      if (getHashOf(currentToken + SECRET) === token) {
        authUserId = data.users[key].uId;
        break;
      }
    }
  }

  return authUserId;
}

function getPermissionId(token: string, data: dataType) {
  const authUserId = getAuthUserId(token, data);
  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      return data.users[key].permissionId;
    }
  }
}

function getDmIdList(token: string, data: dataType) {
  const authUserId = getAuthUserId(token, data);
  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      return data.users[key].dmIdList;
    }
  }
}

function getChannelIdList(token: string, data: dataType) {
  const authUserId = getAuthUserId(token, data);
  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      return data.users[key].channelsIdList;
    }
  }
}

function isValidUIds(uIds: number[], data: dataType) {
  for (const id of uIds) {
    let isUId = false;
    for (const key in data.users) {
      if (data.users[key].uId === id) {
        isUId = true;
        break;
      }
    }
    if (!isUId) {
      return false;
    }
  }
  return true;
}

function getHandleStrList(uIds: number[], data: dataType) {
  const handleStrList = [];
  for (const id of uIds) {
    for (const key in data.users) {
      if (data.users[key].uId === id) {
        handleStrList.push(data.users[key].handleStr);
        break;
      }
    }
  }

  return handleStrList;
}

function getChannelTaggedUIds(channelId: number, message: string, data: dataType) {
  const channelTaggedUIds = [];

  const uIds = data.channels[channelId].membersIdList;

  const handleStrList = getHandleStrList(uIds, data);

  let messageSub = message;
  while (messageSub.includes('@')) {
    messageSub = messageSub.substring(messageSub.indexOf('@') + 1);
    const subStringIndex = messageSub.search(/[^A-Za-z0-9]/);
    let taggedHandle = messageSub;
    if (subStringIndex !== -1) {
      taggedHandle = messageSub.substring(0, subStringIndex);
    }
    if (handleStrList.includes(taggedHandle)) {
      channelTaggedUIds.push(getAuthUserIdFromHandle(taggedHandle, data));
      handleStrList.splice(handleStrList.indexOf(taggedHandle), 1);
    }
  }
  return channelTaggedUIds;
}

function getDMTaggedUIds(dmId: number, message: string, data: dataType) {
  const dmTaggedUIds = [];

  const uIds = data.dms[dmId].membersIdList;

  const handleStrList = getHandleStrList(uIds, data);

  let messageSub = message;
  while (messageSub.includes('@')) {
    messageSub = messageSub.substring(messageSub.indexOf('@') + 1);
    const subStringIndex = messageSub.search(/[^A-Za-z0-9]/);
    let taggedHandle = messageSub;
    if (subStringIndex !== -1) {
      taggedHandle = messageSub.substring(0, subStringIndex);
    }
    if (handleStrList.includes(taggedHandle)) {
      dmTaggedUIds.push(getAuthUserIdFromHandle(taggedHandle, data));
      handleStrList.splice(handleStrList.indexOf(taggedHandle), 1);
    }
  }

  return dmTaggedUIds;
}

function getAuthUserIdFromHandle(taggedHandle: string, data: dataType) {
  for (const key in data.users) {
    if (data.users[key].handleStr === taggedHandle) {
      return data.users[key].uId;
    }
  }
}

function getHashOf(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function isValidUId(uId: number, data: dataType) {
  for (const key in data.users) {
    if (data.users[key].uId === uId) {
      return true;
    }
  }
  return false;
}
export {
  isValidChannelId, getAuthUserId, getPermissionId, isValidDmId, getDmIdList, isValidUIds,
  getHandleStrList, getChannelIdList, getChannelTaggedUIds, getDMTaggedUIds, getHashOf, isValidUId
};

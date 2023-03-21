import { getData, setData, userP, userStats, workspaceStats } from './dataStore';

import validator from 'validator';

import { getAuthUserId } from './helper';

import HTTPError from 'http-errors';

import request from 'sync-request';
import sharp from 'sharp';
import config from './config.json';
const port = config.port;
const url = config.url;

/**
* For a valid user, returns information about their userId, email, first name,
* last name, and handle
*
* @param {string} token - A string containing the users token
* @param {number} uId - The users id
*
* @returns {{ user: userP }} On no error
*
* @throws { HTTPError(403) } - If token is invalid
* @throws { HTTPError(400) } - If the user id given is invalid
*/
function userProfileV2 (token: string, uId: number): { user: userP; } {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  let isValidUId = false;
  let user: userP;
  for (const key in store.users) {
    if (store.users[key].uId === uId) {
      isValidUId = true;
      user = {
        uId: store.users[key].uId,
        email: key,
        nameFirst: store.users[key].nameFirst,
        nameLast: store.users[key].nameLast,
        handleStr: store.users[key].handleStr,
        profileImgUrl: store.users[key].profileImgUrl,
      } as userP;

      break;
    }
  }

  if (isValidUId) {
    return { user: user };
  } else {
    throw HTTPError(400, 'Uid is not valid');
  }
}

/**
* Returns an array of all users and their associated details.
*
* @param {string} token - A string containing the users token
*
* @returns {{ users: userP[] }} On no error
* @throws { HTTPError(403) } - If token is invalid
*/
function usersAllV1 (token: string): { users: userP[]; } {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  const users = [] as userP[];
  for (const key in store.users) {
    if (store.users[key].isRemoved === false) {
      users.push({
        uId: store.users[key].uId,
        email: key,
        nameFirst: store.users[key].nameFirst,
        nameLast: store.users[key].nameLast,
        handleStr: store.users[key].handleStr,
        profileImgUrl: store.users[key].profileImgUrl,
      } as userP);
    }
  }

  return { users: users };
}

/**
* Update the authorised user's first and last name
*
* @param {string} token - A string containing the users token
* @param {string} nameFirst - A string containing the users first name
* @param {string} nameLast - A string containing the users last name
*
* @returns {{}} On no error
* @throws { HTTPError(403) } - If token is invalid
*
* @throws { HTTPError(400) } - On
*                                 -nameFirst is longer than 50
*                                 -nameFirst is shorter than 1
*                                 -nameLast is longer than 50
*                                 -nameLast is shorter than 1
*/
function userChangeNameV1 (token: string, nameFirst: string, nameLast: string): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  if (nameFirst.length < 1) {
    throw HTTPError(400, 'nameFirst is less than 1 character');
  }

  if (nameFirst.length > 50) {
    throw HTTPError(400, 'nameFirst is more than 50 characters');
  }

  if (nameLast.length < 1) {
    throw HTTPError(400, 'nameLast is less than 1 character');
  }

  if (nameLast.length > 50) {
    throw HTTPError(400, 'nameLast is more than 50 characters');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId) {
      store.users[key].nameFirst = nameFirst;
      store.users[key].nameLast = nameLast;
      break;
    }
  }

  setData(store);

  return {};
}

/**
* Update the authorised user's email address
*
* @param {string} token - A string containing the users token
* @param {string} email - A string containing the users email
*
* @returns {{}} On no error
* @throws { HTTPError(403) } - If token is invalid
*
* @throws { HTTPError(400) } - On
*                                 -email is not valid
*                                 -email is already in use
*/
function userChangeEmailV1 (token: string, email: string): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Email is invalid');
  }

  if (email in store.users) {
    throw HTTPError(400, 'Email already exists');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId) {
      store.users[email] = store.users[key];
      delete store.users[key];
      break;
    }
  }

  setData(store);

  return {};
}

/**
* Update the authorised user's handle
*
* @param {string} token - A string containing the users token
* @param {string} handleStr - A string containing the users handle
*
* @returns {{}} On no error
* @throws { HTTPError(403) } - If token is invalid
*
* @throws { HTTPError(400) } - On
*                                 -handleStr is less than 3 characters
*                                 -handleStr is more than 50 characters
*                                 -handleStr contains non-alphanumeric characters
*                                 -handleStr already exists
*/
function userChangeHandleV1 (token: string, handleStr: string): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  for (const key in store.users) {
    if (store.users[key].handleStr === handleStr) {
      throw HTTPError(400, 'handleStr already exists');
    }
  }

  if (handleStr.length < 3) {
    throw HTTPError(400, 'handleStr is less than 3 characters');
  }

  if (handleStr.length > 20) {
    throw HTTPError(400, 'handleStr is more than 20 characters');
  }

  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    throw HTTPError(400, 'handleStr contains non-alphanumeric characters');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId) {
      store.users[key].handleStr = handleStr;
      break;
    }
  }

  setData(store);

  return {};
}

/**
* Provides the given users stats
*
* @param {string} token - A string containing the users token
*
* @returns { {userStats: userStats} } On no error
*
* @throws { HTTPError(403) } - If token is invalid
*/
function userStatsV1 (token: string): { userStats: userStats; } {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId) {
      if (store.currentMessages + store.channels.length + store.currentDMs === 0) {
        store.users[key].userStats.involvementRate = 0;
      } else {
        let involvementRate = (store.users[key].totalMessagesSent +
        store.users[key].dmIdList.length +
        store.users[key].channelsIdList.length) /
        (store.currentMessages + store.channels.length + store.currentDMs);
        if (involvementRate > 1) {
          involvementRate = 1;
        }
        store.users[key].userStats.involvementRate = involvementRate;
      }
      setData(store);

      return { userStats: store.users[key].userStats };
    }
  }
}

/**
* Provides the workspace stats
*
* @param {string} token - A string containing the users token
*
* @returns { {workspaceStats: workspaceStats} } On no error
*
* @throws { HTTPError(403) } - If token is invalid
*/
function usersStatsV1 (token: string): { workspaceStats: workspaceStats; } {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  let numUsersInvolved = 0;

  for (const key in store.users) {
    if (store.users[key].channelsIdList.length > 0 || store.users[key].dmIdList.length > 0) {
      numUsersInvolved += 1;
    }
  }

  let numUsers = 0;
  for (const key in store.users) {
    if (store.users[key].isRemoved === false) {
      numUsers += 1;
    }
  }

  store.workspaceStats.utilizationRate = numUsersInvolved / numUsers;

  setData(store);

  return { workspaceStats: store.workspaceStats };
}

/**
* Uploads a profile image to the user
*
* @param {string} token - A string containing the users token
* @param {number} imgeUrl - A string containing the images url
* @param {number} xStart - The start of the x dimension
* @param {number} yStart - The start of the y dimension
* @param {number} xEnd - The end of the x dimension
* @param {number} yEnd - The end of the y dimension
*
* @throws { HTTPError(403) } - If token is invalid
* @throws { HTTPError(400) } - On
*                               -xEnd is less than or equal to xStart or yEnd is less than or equal to yStart
*                               -status other than 200
*                               -image uploaded is not a JPG
*                               -not within the dimensions of the image at the URL
*/
// : Promise<{}>
async function userProfileUploadphoto (token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const data = getData();

  const authUserId = getAuthUserId(token, data);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'xEnd is less than or equal to xStart or yEnd is less than or equal to yStart');
  }

  const res = request(
    'GET',
    imgUrl
  );

  if (res.statusCode !== 200) {
    throw HTTPError(400, 'status other than 200');
  }

  const image = res.getBody();

  const metadata = await sharp(image).metadata();
  const format = metadata.format;
  if (format.toLowerCase() !== 'jpeg' && format.toLowerCase() !== 'jpg') {
    throw HTTPError(400, 'image uploaded is not a JPG');
  }
  if (xStart > metadata.width || xEnd > metadata.width || yStart > metadata.height || yEnd > metadata.height) {
    throw HTTPError(400, 'not within the dimensions of the image at the URL');
  }

  sharp(image)
    .extract({ left: xStart, top: yStart, width: xEnd - xStart, height: yEnd - yStart })
    .toFile('imgurl/' + authUserId + '.jpg');

  for (const key in data.users) {
    if (data.users[key].uId === authUserId) {
      data.users[key].profileImgUrl = url + ':' + port + '/imgurl/' + authUserId + '.jpg';
      break;
    }
  }
  setData(data);
}
export {
  userProfileV2, usersAllV1, userChangeNameV1, userChangeEmailV1,
  userChangeHandleV1, userStatsV1, usersStatsV1, userProfileUploadphoto
};

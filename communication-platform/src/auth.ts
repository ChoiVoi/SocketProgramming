import { getData, setData, email, notification } from './dataStore';

import validator from 'validator';

import { getAuthUserId, getHashOf } from './helper';

import HTTPError from 'http-errors';

import nodemailer from 'nodemailer';

import config from './config.json';
const port = config.port;
const url = config.url;

import { SECRET } from './helper';

import SMTPTransport = require('nodemailer/lib/smtp-transport');

const SECRET_NUMBER = 16552;

/**
* Returns the user id correlated to the given email and password if both are
* valid.
*
* @param {string} email   - A string containing the given email.
* @param {string} password    - A string containing the given password.
*
* @returns {{
*                token: string
*                authUserId: number
*           }} On no error
* @throws { HTTPError(400) } - On email doesn't exist or password is incorrect
*/
function authLoginV2(email: string, password: string): { token: string; authUserId: number; } {
  const store = getData();

  if (!(email in store.users)) {
    throw HTTPError(400, 'Email does not exist');
  } else {
    if (store.users[email].password !== getHashOf(password)) {
      throw HTTPError(400, 'Password is incorrect');
    } else {
      const currentToken = String(store.totalTokens);

      store.users[email].tokenList.push(currentToken);

      store.totalTokens++;
      setData(store);
      return {
        token: getHashOf(currentToken + SECRET),
        authUserId: store.users[email].uId,
      };
    }
  }
}

/**
* Registers the new user using the given details, by adding their details to the
* database via an object containing
*    -uId
*    -permissionId
*    -password
*    -nameFirst
*    -nameLast
*    -handleStr
*    -channelsIdList
*    -dmIdList
*    -tokenList
*    -isRemoved
*    -resetCode
*    -notifications
*    -profileImgUrl
*    -userStats
*    -totalMessagesSent.
* Handle string being the concatenation of their first name and last name, and a
* number if duplicate.
*
* @param {string} email    - A string containing the given email.
* @param {string} password    - A string containing the given password.
* @param {string} nameFirst   - A string containing the first name of the user.
* @param {string} nameLast   - A string containing the last name of the user.
*
*
*
* @returns {{
*                token: string
*                authUserId: number
*           }} On no error
*
* @throws { HTTPError(400) } On
*                               -the email is not valid
*                               -the email already exist
*                               -password length is less than 6
*                               -first name length is not between 1 and 50
*                               -last name length is not between 1 and 50
*/

function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string):
{ token: string; authUserId: number; } {
  const store = getData();

  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Email is invalid');
  }

  if (Object.keys(store.users).length > 0) {
    for (const key in store.users) {
      if (store.users[key].isRemoved === false && key === email) {
        throw HTTPError(400, 'Email already exists');
      }
    }
  }

  if (password.length < 6) {
    throw HTTPError(400, 'Password is shorter than 6 characters');
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

  let handle = nameFirst.toLowerCase() + nameLast.toLowerCase();

  handle = handle.replace(/[^a-z0-9]/gi, '');

  const limit = 20;

  if (handle.length > limit) {
    handle = handle.substring(0, limit);
  }

  let sameHandle = -1;

  let handleSub = handle;

  let isNotUnique = true;
  while (isNotUnique) {
    if (Object.keys(store.users).length > 0) {
      for (const key in store.users) {
        if (store.users[key].handleStr === handleSub && store.users[key].isRemoved === false) {
          sameHandle += 1;
          handleSub = handle + sameHandle;
          isNotUnique = true;
          break;
        } else {
          isNotUnique = false;
        }
      }
    } else {
      isNotUnique = false;
    }
  }

  const currentToken = String(store.totalTokens);

  let permissionId: number;
  if (Object.keys(store.users).length === 0) {
    permissionId = 1;
    store.workspaceStats.channelsExist.push({
      numChannelsExist: 0,
      timeStamp: Math.floor((new Date()).getTime() / 1000),
    });
    store.workspaceStats.dmsExist.push({
      numDmsExist: 0,
      timeStamp: Math.floor((new Date()).getTime() / 1000),
    });
    store.workspaceStats.messagesExist.push({
      numMessagesExist: 0,
      timeStamp: Math.floor((new Date()).getTime() / 1000),
    });
  } else {
    permissionId = 2;
  }

  const user: email = {
    uId: Object.keys(store.users).length + 1,
    permissionId: permissionId,
    password: getHashOf(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleSub,
    channelsIdList: [],
    dmIdList: [],
    tokenList: [currentToken],
    isRemoved: false,
    resetCode: '',
    notifications: [] as notification[],
    profileImgUrl: url + ':' + port + '/imgurl/default.jpg',
    userStats: {
      channelsJoined: [{
        numChannelsJoined: 0,
        timeStamp: Math.floor((new Date()).getTime() / 1000),
      }],
      dmsJoined: [{
        numDmsJoined: 0,
        timeStamp: Math.floor((new Date()).getTime() / 1000),
      }],
      messagesSent: [{
        numMessagesSent: 0,
        timeStamp: Math.floor((new Date()).getTime() / 1000),
      }],
      involvementRate: 0
    },
    totalMessagesSent: 0,
  };

  store.users[email] = user;
  store.totalTokens++;
  setData(store);

  return {
    token: getHashOf(currentToken + SECRET),
    authUserId: store.users[email].uId,
  };
}

/**
* Given an active token, invalidates the token to log the user out.
*
* @param {string} token - A string containing the users token
*
* @returns {{}} On no error
*
* @throws { HTTPError(403) } - If token doesn't exist
*/
function authLogoutV1(token: string): Record<string, unknown> {
  const store = getData();

  const authUserId = getAuthUserId(token, store);
  if (authUserId === -1) {
    throw HTTPError(403, 'Invalid token');
  }

  for (const key in store.users) {
    for (const currentToken of store.users[key].tokenList) {
      if (getHashOf(currentToken + SECRET) === token) {
        const index = store.users[key].tokenList.indexOf(currentToken);
        store.users[key].tokenList.splice(index, 1);
        break;
      }
    }
  }

  setData(store);

  return {};
}

/**
* Sends an password request code to the given users email
*
* @param {string} email - A string containing the users email
*
* @returns {{}}
*/
function authPasswordRequestV1 (email: string): Record<string, unknown> {
  const store = getData();

  if (email in store.users) {
    const smtpConfig: SMTPTransport.Options = {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'e9ff4edc113953',
        pass: 'f063e761a81ec7'
      }
    };
    const transporter = nodemailer.createTransport(smtpConfig);

    const currentReset = SECRET_NUMBER + store.totalResetCodes;

    const mailOptions = {
      from: 'sender1531@hotmail.com',
      to: email,
      subject: 'Sending Email with resetCode',
      text: 'Password reset code from UNSW Treats',
      html: 'Your password reset code is ' + String(currentReset),
    };

    transporter.sendMail(mailOptions);
    store.users[email].resetCode = String(currentReset);
    store.users[email].tokenList = [];

    store.totalResetCodes += 1;
  }
  setData(store);

  return {};
}

/**
* Given a valid reset code changes the users password
*
* @param {string} resetCode - A string containing the reset code emailed to the user
* @param {string} newPassword - A string containing the new password the user wants to change to
*
* @throws { HTTPError(400) } On
*                           - The resetCode is invalid
*                           - The newPassword length is less than 6
*/
function authPasswordResetV1 (resetCode: string, newPassword: string): Record<string, unknown> {
  const store = getData();

  let validReset = false;
  let authUserId = -1;

  for (const key in store.users) {
    if (store.users[key].resetCode === resetCode) {
      authUserId = store.users[key].uId;
      validReset = true;
      break;
    }
  }

  if (!validReset) {
    throw HTTPError(400, 'resetCode is not a valid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'password entered is less than 6 characters long');
  }

  for (const key in store.users) {
    if (store.users[key].uId === authUserId) {
      store.users[key].password = getHashOf(newPassword);
      store.users[key].resetCode = '';
      break;
    }
  }

  setData(store);

  return {};
}

export { authLoginV2, authRegisterV2, authLogoutV1, authPasswordRequestV1, authPasswordResetV1 };

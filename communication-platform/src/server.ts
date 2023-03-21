import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import {
  messageEditV1, messageRemoveV1, messageSenddmV1,
  messageSendV1, messageShare, messageReact, messageUnreact, messagePin,
  messageUnpin, messageSendlater, messageSendlaterdm
} from './message';
import { dmCreateV1, dmDetailsV1, dmLeaveV1, dmListV1, dmMessagesV1, dmRemoveV1 } from './dm';
import {
  channelDetailsV2,
  channelJoinV2,
  channelInviteV2,
  channelMessagesV2,
  channelLeaveV1,
  channelAddownerV1,
  channelRemoveownerV1
} from './channel';
import {
  authRegisterV2, authLoginV2, authLogoutV1,
  authPasswordRequestV1, authPasswordResetV1
} from './auth';
import { channelsCreateV2, channelsListV2, channelsListallV2 } from './channels';
import { clearV1 } from './other';
import {
  userProfileV2, usersAllV1, userChangeNameV1, userChangeEmailV1,
  userChangeHandleV1, userStatsV1, usersStatsV1, userProfileUploadphoto
} from './users';
import { adminPermissionChangeV1, adminUserRemoveV1 } from './admin';
import { search } from './search';
import { notificationsGetV1 } from './notification';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

app.use('/imgurl', express.static('imgurl'));

app.post('/user/profile/uploadphoto/v1', async (req, res, next) => {
  try {
    const token = req.header('token');
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    await userProfileUploadphoto(token, imgUrl, xStart, yStart, xEnd, yEnd);
    return res.json({});
  } catch (err) {
    next(err);
  }
});
// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', (req, res, next) => {
  try {
    const { email, password } = req.body;
    return res.json(authLoginV2(email, password));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', (req, res, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    return res.json(authRegisterV2(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(authLogoutV1(token));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req, res, next) => {
  try {
    const { email } = req.body;
    return res.json(authPasswordRequestV1(email));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', (req, res, next) => {
  try {
    const { resetCode, newPassword } = req.body;
    return res.json(authPasswordResetV1(resetCode, newPassword));
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', (req, res, next) => {
  try {
    const { name, isPublic } = req.body;
    const token = req.header('token');
    return res.json(channelsCreateV2(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(channelsListV2(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(channelsListallV2(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    return res.json(channelDetailsV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    return res.json(channelJoinV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelInviteV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    return res.json(channelMessagesV2(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelAddownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelRemoveownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(notificationsGetV1(token));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, length } = req.body;
    return res.json(standupStartV1(token, channelId, length));
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    return res.json(standupActiveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, message } = req.body;
    return res.json(standupSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', (req, res, next) => {
  try {
    return res.json(clearV1());
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const uId = parseInt(req.query.uId as string);
    return res.json(userProfileV2(token, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, message } = req.body;
    return res.json(messageSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId, message } = req.body;
    return res.json(messageEditV1(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const messageId = parseInt(req.query.messageId as string);
    return res.json(messageRemoveV1(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { uIds } = req.body;
    return res.json(dmCreateV1(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(dmListV1(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmRemoveV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmDetailsV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId } = req.body;
    return res.json(dmLeaveV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    return res.json(dmMessagesV1(token, dmId, start));
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId, message } = req.body;
    return res.json(messageSenddmV1(token, dmId, message));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(usersAllV1(token));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req, res, next) => {
  try {
    const { nameFirst, nameLast } = req.body;
    const token = req.header('token');
    return res.json(userChangeNameV1(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req, res, next) => {
  try {
    const { email } = req.body;
    const token = req.header('token');
    return res.json(userChangeEmailV1(token, email));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req, res, next) => {
  try {
    const { handleStr } = req.body;
    const token = req.header('token');
    return res.json(userChangeHandleV1(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(userStatsV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(usersStatsV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const queryStr = req.query.queryStr as string;
    return res.json(search(token, queryStr));
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { ogMessageId, message, channelId, dmId } = req.body;
    return res.json(messageShare(token, ogMessageId, message, channelId, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId, reactId } = req.body;
    return res.json(messageReact(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId, reactId } = req.body;
    return res.json(messageUnreact(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId } = req.body;
    return res.json(messagePin(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId } = req.body;
    return res.json(messageUnpin(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, message, timeSent } = req.body;
    return res.json(messageSendlater(token, channelId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId, message, timeSent } = req.body;
    return res.json(messageSendlaterdm(token, dmId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', (req, res, next) => {
  try {
    const uId = parseInt(req.query.uId as string);
    const token = req.header('token');
    return res.json(adminUserRemoveV1(token, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req, res, next) => {
  try {
    const { uId, permissionId } = req.body;
    const token = req.header('token');
    return res.json(adminPermissionChangeV1(token, uId, permissionId));
  } catch (err) {
    next(err);
  }
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

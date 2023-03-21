
import request from 'sync-request';

import config from '../config.json';

import {
  httpAuthRegister, httpChannelsCreate, httpDMCreate, httpChannelInvite, httpMessageSend,
  httpMessageSendDM
} from './helperTest';

const OK = 200;
const port = config.port;
const url = config.url;

beforeAll(() => {
  request(
    'DELETE',
    url + ':' + port + '/clear/v1',
    {
      qs: {}
    }
  );
});

afterEach(() => {
  request(
    'DELETE',
    url + ':' + port + '/clear/v1',
    {
      qs: {}
    }
  );
});

describe('Notifications test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token + 'a'
        }
      }
    );

    expect(notifications.statusCode).toBe(403);
  });

  test('correct return - channel invite notification', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notificationDetail = [
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith added you to comp1531'
      }
    ];

    const bodyNotification = JSON.parse(notifications.getBody() as string);
    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - DM create notification', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );
    const bodyNotification = JSON.parse(notifications.getBody() as string);

    const notificationDetail = [
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith added you to haydensmith, jaychoi'
      }
    ];

    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - tagged notification in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'good evening @jaychoi');

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notificationDetail = [
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith tagged you in comp1531: good evening @jaycho'
      },
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith added you to comp1531'
      }
    ];

    const bodyNotification = JSON.parse(notifications.getBody() as string);
    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - tagged notification in channel more than one user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user4@gmail.com', 'poasdlfkj', 'Joseph', 'Lee');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser3.authUserId);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'good evening @jaychoi @josephlee');

    const notifications1 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notifications2 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser3.token
        }
      }
    );

    const bodyNotification1 = JSON.parse(notifications1.getBody() as string);
    const bodyNotification2 = JSON.parse(notifications2.getBody() as string);

    const notificationDetail = [
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith tagged you in comp1531: good evening @jaycho'
      },
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith added you to comp1531'
      }
    ];

    expect(notifications1.statusCode).toBe(OK);
    expect(notifications2.statusCode).toBe(OK);
    expect(bodyNotification1.notifications).toStrictEqual(notificationDetail);
    expect(bodyNotification2.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - tagged notification in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '@jaychoi good evening');

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const bodyNotification = JSON.parse(notifications.getBody() as string);

    const notificationDetail = [
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: @jaychoi good evenin'
      },
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith added you to haydensmith, jaychoi'
      }
    ];

    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - tagged notification in DM more than one user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'qweroiu', 'David', 'Paul');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId, bodyUser3.authUserId]);
    httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'good evening @jaychoi @davidpaul');

    const notifications1 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notifications2 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser3.token
        }
      }
    );

    const bodyNotification1 = JSON.parse(notifications1.getBody() as string);
    const bodyNotification2 = JSON.parse(notifications2.getBody() as string);

    const notificationDetail = [
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith tagged you in davidpaul, haydensmith, jaychoi: good evening @jaycho'
      },
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith added you to davidpaul, haydensmith, jaychoi'
      }
    ];

    expect(notifications1.statusCode).toBe(OK);
    expect(notifications2.statusCode).toBe(OK);
    expect(bodyNotification1.notifications).toStrictEqual(notificationDetail);
    expect(bodyNotification2.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - reacted message notification in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    const bodySendMessage = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, 'Hello');

    request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodySendMessage.messageId,
          reactId: 1
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );
    const bodyNotification = JSON.parse(notifications.getBody() as string);

    const notificationDetail = [
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith reacted to your message in comp1531'
      },
      {
        channelId: bodyChannel1.channelId,
        dmId: -1,
        notificationMessage: 'haydensmith added you to comp1531'
      }
    ];

    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - reacted message notification in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    const bodySendMessage = httpMessageSendDM(bodyUser2.token, bodyDM1.dmId, 'Hello');

    request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodySendMessage.messageId,
          reactId: 1
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notificationDetail = [
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith reacted to your message in haydensmith, jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDM1.dmId,
        notificationMessage: 'haydensmith added you to haydensmith, jaychoi'
      }
    ];

    const bodyNotification = JSON.parse(notifications.getBody() as string);
    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail);
  });

  test('correct return - being tagged and reacted message notification in dm', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'qwerlkj', 'David', 'Paul');
    const bodyDm = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId, bodyUser3.authUserId]);
    const bodyDMSend = httpMessageSendDM(bodyUser2.token, bodyDm.dmId, 'good evening @haydensmith @davidpaul');
    request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyDMSend.messageId,
          reactId: 1
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const notifications1 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const notifications2 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notifications3 = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser3.token
        }
      }
    );
    const bodyNotification1 = JSON.parse(notifications1.getBody() as string);
    const bodyNotification2 = JSON.parse(notifications2.getBody() as string);
    const bodyNotification3 = JSON.parse(notifications3.getBody() as string);

    const notificationDetail1 = [
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'jaychoi tagged you in davidpaul, haydensmith, jaychoi: good evening @hayden'
      },
    ];

    const notificationDetail2 = [
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith reacted to your message in davidpaul, haydensmith, jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith added you to davidpaul, haydensmith, jaychoi'
      }
    ];

    const notificationDetail3 = [
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'jaychoi tagged you in davidpaul, haydensmith, jaychoi: good evening @hayden'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith added you to davidpaul, haydensmith, jaychoi'
      }
    ];

    expect(notifications1.statusCode).toBe(OK);
    expect(notifications2.statusCode).toBe(OK);
    expect(notifications3.statusCode).toBe(OK);
    expect(bodyNotification1.notifications).toStrictEqual(notificationDetail1);
    expect(bodyNotification2.notifications).toStrictEqual(notificationDetail2);
    expect(bodyNotification3.notifications).toStrictEqual(notificationDetail3);
  });
  test('correct return - 20 notifications', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyDm = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');
    httpMessageSendDM(bodyUser1.token, bodyDm.dmId, 'hello @jaychoi');

    const notifications = request(
      'GET',
      url + ':' + port + '/notifications/get/v1',
      {
        qs: {},
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const notificationDetail1 = [
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
      {
        channelId: -1,
        dmId: bodyDm.dmId,
        notificationMessage: 'haydensmith tagged you in haydensmith, jaychoi: hello @jaychoi'
      },
    ];
    const bodyNotification = JSON.parse(notifications.getBody() as string);
    expect(notifications.statusCode).toBe(OK);
    expect(bodyNotification.notifications).toStrictEqual(notificationDetail1);
  });
});

import request from 'sync-request';

import config from '../config.json';

import { httpAuthRegister, httpChannelsCreate, httpChannelInvite } from './helperTest';

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

describe('channel details test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(channelDetail1.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelDetail1.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(channelDetail1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelDetails1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const bodyChannelDetail1 = JSON.parse(channelDetails1.getBody() as string);
    const details1 = {
      name: 'comp1531',
      isPublic: true,
      ownerMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelDetails1.statusCode).toBe(OK);
    expect(bodyChannelDetail1).toEqual(details1);
  });
});

describe('channel join test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelJoin = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token + 'a',
        }
      }
    );
    expect(channelJoin.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelJoin = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
        },
        headers: {
          token: bodyUser2.token
        }
      }
    );
    expect(channelJoin.statusCode).toBe(400);
  });

  test('the authorised user is already a member of the channel', () => {
    const user1 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'user1@gmail.com',
          password: 'sdflkwje',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      }
    );
    const bodyUser1 = JSON.parse(user1.getBody() as string);

    const channel1 = request(
      'POST',
      url + ':' + port + '/channels/create/v3',
      {
        json: {
          name: 'comp1531',
          isPublic: false,
        },
        headers: {
          token: bodyUser1.token,
        },
      }
    );

    const bodyChannel1 = JSON.parse(channel1.getBody() as string);

    const channelJoin = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelJoin.statusCode).toBe(400);
  });

  test('channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelJoin = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(channelJoin.statusCode).toBe(403);
  });

  test('valid user id and channel id in public channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelJoin = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const channelDetails1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const details1 = {
      name: 'comp1531',
      isPublic: true,
      ownerMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    const bodyChannelDetail1 = JSON.parse(channelDetails1.getBody() as string);
    expect(channelJoin.statusCode).toBe(OK);
    expect(new Set(bodyChannelDetail1.ownerMembers)).toEqual(new Set(details1.ownerMembers));
    expect(new Set(bodyChannelDetail1.allMembers)).toEqual(new Set(details1.allMembers));
  });

  test('valid user id and channel id in private channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);

    const channelJoin1 = request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetails1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyChannelDetail1 = JSON.parse(channelDetails1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelJoin1.statusCode).toEqual(OK);
    expect(bodyChannelDetail1.name).toEqual(details1.name);
    expect(bodyChannelDetail1.isPublic).toEqual(details1.isPublic);
    expect(new Set(bodyChannelDetail1.ownerMembers)).toEqual(new Set(details1.ownerMembers));
    expect(new Set(bodyChannelDetail1.allMembers)).toEqual(new Set(details1.allMembers));
  });
});

describe('channel invite test', () => {
  test('correct return value in public channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyChannelDetails = JSON.parse(channelDetail1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: true,
      ownerMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelDetail1.statusCode).toBe(OK);
    expect(bodyChannelDetails).toStrictEqual(details1);
  });

  test('correct return value in private channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyChannelDetails = JSON.parse(channelDetail1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelDetail1.statusCode).toBe(OK);
    expect(bodyChannelDetails).toStrictEqual(details1);
  });

  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'oiuqwer', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(channelInvite.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'oiuqwer', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelInvite.statusCode).toBe(400);
  });

  test('uId does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'oiuqwer', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelInvite.statusCode).toBe(400);
  });

  test('uId refers to a user who is already a member of the public channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', true);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelInvite.statusCode).toBe(400);
  });

  test('uId refers to a user who is already a member of the private channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelInvite.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'oiuwer', 'Pap', 'Lee');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelInvite = request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(channelInvite.statusCode).toBe(403);
  });
});

describe('channel messages test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelMessages = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(channelMessages.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelMessages = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId + 1,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelMessages.statusCode).toBe(400);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelMessages = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 5,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelMessages.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelMessages = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 0,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(channelMessages.statusCode).toBe(403);
  });

  test('correct return value with start + 50 == messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const messageIdList = [];
    const expectedTime = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 50; i++) {
      const message1 = request(
        'POST',
        url + ':' + port + '/message/send/v2',
        {
          json: {
            channelId: bodyChannel1.channelId,
            message: 'abc',
          },
          headers: {
            token: bodyUser1.token,
          }
        }
      );
      const bodyMessage1 = JSON.parse(message1.getBody() as string);
      messageIdList.unshift(bodyMessage1.messageId);
    }

    const channelMessages1 = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyChannelMessages1 = JSON.parse(channelMessages1.getBody() as string);

    const reacts = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];

    for (const messId in bodyChannelMessages1.messages) {
      expect(bodyChannelMessages1.messages[parseInt(messId)].messageId).toBe(messageIdList[parseInt(messId)]);
      expect(bodyChannelMessages1.messages[parseInt(messId)].uId).toBe(bodyUser1.authUserId);
      expect(bodyChannelMessages1.messages[parseInt(messId)].message).toEqual('abc');
      expect(bodyChannelMessages1.messages[parseInt(messId)].timeSent).toBeGreaterThanOrEqual(expectedTime);
      expect(bodyChannelMessages1.messages[parseInt(messId)].timeSent).toBeLessThan(expectedTime + 10);
      expect(bodyChannelMessages1.messages[parseInt(messId)].reacts).toStrictEqual(reacts);
      expect(bodyChannelMessages1.messages[parseInt(messId)].isPinned).toBe(false);
    }

    expect(channelMessages1.statusCode).toBe(OK);
    expect(bodyChannelMessages1.start).toBe(0);
    expect(bodyChannelMessages1.end).toBe(-1);
  });

  test('correct return value with start + 50 > messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const messageIdList = [] as number[];
    const expectedTime = Math.floor(Date.now() / 1000);

    for (let i = 0; i < 70; i++) {
      const message1 = request(
        'POST',
        url + ':' + port + '/message/send/v2',
        {
          json: {
            channelId: bodyChannel1.channelId,
            message: 'abc',
          },
          headers: {
            token: bodyUser1.token,
          }
        }
      );
      const bodyMessage1 = JSON.parse(message1.getBody() as string);
      messageIdList.unshift(bodyMessage1.messageId);
    }

    const channelMessages1 = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 5,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyChannelMessages1 = JSON.parse(channelMessages1.getBody() as string);

    const reacts = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];

    expect(channelMessages1.statusCode).toBe(OK);
    for (let i = 5; i < 55; i++) {
      expect(bodyChannelMessages1.messages[i - 5].messageId).toBe(messageIdList[i]);
      expect(bodyChannelMessages1.messages[i - 5].uId).toBe(bodyUser1.authUserId);
      expect(bodyChannelMessages1.messages[i - 5].message).toEqual('abc');
      expect(bodyChannelMessages1.messages[i - 5].timeSent).toBeGreaterThanOrEqual(expectedTime);
      expect(bodyChannelMessages1.messages[i - 5].timeSent).toBeLessThan(expectedTime + 10);
      expect(bodyChannelMessages1.messages[i - 5].reacts).toStrictEqual(reacts);
      expect(bodyChannelMessages1.messages[i - 5].isPinned).toBe(false);
    }

    expect(bodyChannelMessages1.start).toBe(5);
    expect(bodyChannelMessages1.end).toBe(55);
  });

  test('correct return value with start + 50 < messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const expectedTime = Math.floor(Date.now() / 1000);
    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'adsfasfas',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage1 = JSON.parse(message1.getBody() as string);

    const message2 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage2 = JSON.parse(message2.getBody() as string);

    request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const channelMessages1 = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodychannelMessages1 = JSON.parse(channelMessages1.getBody() as string);

    const reacts1 = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];

    const reacts2 = [{
      reactId: 1,
      uIds: [1],
      isThisUserReacted: true,
    }];

    expect(channelMessages1.statusCode).toBe(OK);
    expect(bodychannelMessages1.messages[0].messageId).toBe(bodyMessage2.messageId);
    expect(bodychannelMessages1.messages[0].uId).toBe(bodyUser1.authUserId);
    expect(bodychannelMessages1.messages[0].message).toEqual('abc');
    expect(bodychannelMessages1.messages[0].timeSent).toBeGreaterThanOrEqual(expectedTime);
    expect(bodychannelMessages1.messages[0].timeSent).toBeLessThan(expectedTime + 10);
    expect(bodychannelMessages1.messages[0].reacts).toStrictEqual(reacts1);
    expect(bodychannelMessages1.messages[0].isPinned).toBe(false);
    expect(bodychannelMessages1.messages[1].messageId).toBe(bodyMessage1.messageId);
    expect(bodychannelMessages1.messages[1].uId).toBe(bodyUser1.authUserId);
    expect(bodychannelMessages1.messages[1].message).toEqual('adsfasfas');
    expect(bodychannelMessages1.messages[1].timeSent).toBeGreaterThanOrEqual(expectedTime);
    expect(bodychannelMessages1.messages[1].timeSent).toBeLessThan(expectedTime + 10);
    expect(bodychannelMessages1.messages[1].reacts).toStrictEqual(reacts2);
    expect(bodychannelMessages1.messages[1].isPinned).toBe(false);

    expect(bodychannelMessages1.start).toBe(0);
    expect(bodychannelMessages1.end).toBe(-1);
  });

  test('correct return value with no messages are created', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelMessages1 = request(
      'GET',
      url + ':' + port + '/channel/messages/v3',
      {
        qs: {
          messages: [],
          channelId: bodyChannel1.channelId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodychannelMessages1 = JSON.parse(channelMessages1.getBody() as string);

    expect(channelMessages1.statusCode).toBe(OK);
    expect(bodychannelMessages1).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1,
      }
    );
  });
});

describe('channel leave test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(channelLeave.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelLeave.statusCode).toBe(400);
  });

  test('the authorised user is the starter of an active standup in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    const a = request(
      'POST',
      url + ':' + port + '/standup/start/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          length: 2
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(a.statusCode).toBe(200);
    expect(channelLeave.statusCode).toBe(400);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(channelLeave.statusCode).toBe(403);
  });

  test('channel leave', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyChannelDetails = JSON.parse(channelDetail1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelLeave.statusCode).toBe(OK);
    expect(bodyChannelDetails).toStrictEqual(details1);
  });

  test('owner leaves the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelLeave = request(
      'POST',
      url + ':' + port + '/channel/leave/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetail1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyChannelDetails = JSON.parse(channelDetail1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [] as number[],
      allMembers: [
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(channelLeave.statusCode).toBe(OK);
    expect(bodyChannelDetails).toStrictEqual(details1);
  });
});

describe('channel addowner test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelAddowner = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(channelAddowner.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelAddowner = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(channelAddowner.statusCode).toBe(400);
  });

  test('uId does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdflkj', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelAddowner = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelAddowner.statusCode).toBe(400);
  });

  test('uId refers to a user who is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelAddowner = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelAddowner.statusCode).toBe(400);
  });

  test('uId refers to a user who is already an owner of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelAddowner1 = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelAddowner1.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const channelAddowner2 = request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    // const body = JSON.parse(channelAddowner2.getBody() as string);
    expect(channelAddowner2.statusCode).toBe(403);
  });

  test('glober owner has the owner permission even though they do not create the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'oiuqwer', 'Joseph', 'Lee');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetails1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyChannelDetails1 = JSON.parse(channelDetails1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser3.authUserId,
          email: 'user3@gmail.com',
          nameFirst: 'Joseph',
          nameLast: 'Lee',
          handleStr: 'josephlee',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'

        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser3.authUserId,
          email: 'user3@gmail.com',
          nameFirst: 'Joseph',
          nameLast: 'Lee',
          handleStr: 'josephlee',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(new Set(bodyChannelDetails1.ownerMembers)).toStrictEqual(new Set(details1.ownerMembers));
    expect(new Set(bodyChannelDetails1.allMembers)).toStrictEqual(new Set(details1.allMembers));
  });
});

describe('channel remove owner test', () => {
  test('glober owner has the owener permission even though they do not create the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'oiuqwer', 'Joseph', 'Lee');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    request(
      'POST',
      url + ':' + port + '/channel/invite/v3',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelDetails1 = request(
      'GET',
      url + ':' + port + '/channel/details/v3',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyChannelDetails1 = JSON.parse(channelDetails1.getBody() as string);

    const details1 = {
      name: 'comp1531',
      isPublic: false,
      ownerMembers: [
        {
          uId: bodyUser3.authUserId,
          email: 'user3@gmail.com',
          nameFirst: 'Joseph',
          nameLast: 'Lee',
          handleStr: 'josephlee',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ],
      allMembers: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'

        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jay',
          nameLast: 'Choi',
          handleStr: 'jaychoi',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        },
        {
          uId: bodyUser3.authUserId,
          email: 'user3@gmail.com',
          nameFirst: 'Joseph',
          nameLast: 'Lee',
          handleStr: 'josephlee',
          profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
        }
      ]
    };
    expect(new Set(bodyChannelDetails1.ownerMembers)).toStrictEqual(new Set(details1.ownerMembers));
    expect(new Set(bodyChannelDetails1.allMembers)).toStrictEqual(new Set(details1.allMembers));
  });

  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelRemoveOwner = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(channelRemoveOwner.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authorisedUser);

    request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const channelRemoveOwner = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelRemoveOwner.statusCode).toBe(400);
  });

  test('uId refers to a user who is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelRemoveowner = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelRemoveowner.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'oiuqwer', 'Jospeh', 'Paul');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);
    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser3.authUserId);

    request(
      'POST',
      url + ':' + port + '/channel/addowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser2.token
        }
      }
    );

    const channelRemoveowner = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser3.token,
        }
      }
    );
    expect(channelRemoveowner.statusCode).toBe(403);
  });

  test('uId does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const channelRemoveOwner = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelRemoveOwner.statusCode).toBe(400);
  });

  test('uId refers to a user who is not an owner of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'oiuqwer', 'Joseph', 'Lee');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser3.authUserId);

    const channelRemoveowner1 = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser3.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(channelRemoveowner1.statusCode).toBe(400);
  });

  test('uId refers to a user who is currently the only owner of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const channelRemoveowner1 = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(channelRemoveowner1.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkjasdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const channelRemoveowner1 = request(
      'POST',
      url + ':' + port + '/channel/removeowner/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          uId: bodyUser1.authUserId
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(channelRemoveowner1.statusCode).toBe(403);
  });
});

import request from 'sync-request';

import config from '../config.json';
import { httpAuthRegister, httpMessageSendDM, httpDMCreate, httpMessageReact } from './helperTest';
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

describe('dm/create/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: [],
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dm1.statusCode).toBe(403);
  });

  test('any uId in uIds does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const uIds = [bodyUser1.authUserId + bodyUser2.authUserId + 1, bodyUser2.authUserId, bodyUser1.authUserId + bodyUser2.authUserId + 2];
    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dm1.statusCode).toBe(400);
  });

  test('there are duplicate uId in uIds', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const uIds = [bodyUser2.authUserId, bodyUser2.authUserId];
    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dm1.statusCode).toBe(400);
  });

  test('uids include the uid of creator', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const uIds = [bodyUser1.authUserId, bodyUser2.authUserId];

    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dm1.statusCode).toBe(400);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const uIds = [bodyUser2.authUserId];
    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDM1 = JSON.parse(dm1.getBody() as string);

    expect(dm1.statusCode).toBe(OK);
    expect(bodyDM1).toStrictEqual(expect.objectContaining({
      dmId: expect.any(Number),
    }));
  });

  test('correct return value with one user which is the creator', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const uIds = [] as number[];
    const dm1 = request(
      'POST',
      url + ':' + port + '/dm/create/v2',
      {
        json: {
          uIds: uIds,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDM1 = JSON.parse(dm1.getBody() as string);

    expect(dm1.statusCode).toBe(OK);
    expect(bodyDM1).toStrictEqual(expect.objectContaining({
      dmId: expect.any(Number),
    }));
  });
});

describe('dm/list/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    httpDMCreate(bodyUser1.token, []);

    const dmList1 = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {},
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dmList1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyDM3 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);

    const dmUser1List = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMUser1List = JSON.parse(dmUser1List.getBody() as string);

    const dms1 = [
      {
        dmId: bodyDM1.dmId,
        name: 'haydensmith',
      },
      {
        dmId: bodyDM3.dmId,
        name: 'haydensmith, jonlai',
      },
    ];

    expect(dmUser1List.statusCode).toBe(OK);
    expect(new Set(bodyDMUser1List.dms)).toEqual(new Set(dms1));

    const dmUser2List = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {},
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyDMUser2List = JSON.parse(dmUser2List.getBody() as string);

    const dms2 = [
      {
        dmId: bodyDM2.dmId,
        name: 'jonlai',
      },
      {
        dmId: bodyDM3.dmId,
        name: 'haydensmith, jonlai',
      },
    ];

    expect(dmUser2List.statusCode).toBe(OK);
    expect(new Set(bodyDMUser2List.dms)).toEqual(new Set(dms2));
  });

  test('correct return value for no DMs created', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    httpDMCreate(bodyUser1.token, []);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const dmUser2List = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {},
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyDMUser2List = JSON.parse(dmUser2List.getBody() as string);

    expect(dmUser2List.statusCode).toBe(OK);
    expect(new Set(bodyDMUser2List.dms)).toStrictEqual(new Set([]));
  });
});

describe('dm/remove/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dmRemove1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmRemove1.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not the original DM creator', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmRemove1.statusCode).toBe(403);
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);

    request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmRemove1.statusCode).toBe(403);
  });

  test('dmId is valid and the authorised user is not in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmRemove1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpAuthRegister('user3@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);

    const dmRemove1 = request(
      'DELETE',
      url + ':' + port + '/dm/remove/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMRemove1 = JSON.parse(dmRemove1.getBody() as string);

    expect(dmRemove1.statusCode).toBe(OK);
    expect(bodyDMRemove1).toStrictEqual({});

    const dmUser1List = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {
          token: bodyUser1.token,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMUser1List = JSON.parse(dmUser1List.getBody() as string);

    expect(new Set(bodyDMUser1List.dms)).toStrictEqual(new Set([]));

    const dmUser2List = request(
      'GET',
      url + ':' + port + '/dm/list/v2',
      {
        qs: {},
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyDMUser2List = JSON.parse(dmUser2List.getBody() as string);

    expect(new Set(bodyDMUser2List.dms)).toStrictEqual(new Set([]));
  });
});

describe('dm/details/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dmDetails1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmDetails1.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmDetails1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMdmDetails1 = JSON.parse(dmDetails1.getBody() as string);

    expect(dmDetails1.statusCode).toBe(OK);
    expect(bodyDMdmDetails1).toStrictEqual({
      name: 'haydensmith',
      members: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: expect.any(String)
        }
      ]
    });
  });

  test('correct return value for sorting handle in the DM name', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyUser3 = httpAuthRegister('user3@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId, bodyUser3.authUserId]);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const details1 = {
      name: 'haydensmith, haydensmith0, jonlai',
      members: [
        {
          uId: bodyUser1.authUserId,
          email: 'user1@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith',
          profileImgUrl: expect.any(String)
        },
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jon',
          nameLast: 'Lai',
          handleStr: 'jonlai',
          profileImgUrl: expect.any(String)
        },
        {
          uId: bodyUser3.authUserId,
          email: 'user3@gmail.com',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          handleStr: 'haydensmith0',
          profileImgUrl: expect.any(String)
        }
      ],
    };
    const bodyDMdmDetails1 = JSON.parse(dmDetails1.getBody() as string);

    expect(bodyDMdmDetails1.name).toEqual(details1.name);
    expect(dmDetails1.statusCode).toBe(OK);
    expect(new Set(bodyDMdmDetails1.members)).toEqual(new Set(details1.members));
  });
});

describe('dm/leave/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmLeave1 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dmLeave1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmLeave1 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmLeave1.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmLeave1 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmLeave1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);

    const dmLeave1 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMLeave1 = JSON.parse(dmLeave1.getBody() as string);

    expect(dmLeave1.statusCode).toBe(OK);
    expect(bodyDMLeave1).toStrictEqual({});

    const dmLeave11 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmLeave11.statusCode).toBe(403);

    const dmDetails1 = request(
      'GET',
      url + ':' + port + '/dm/details/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const details1 = {
      name: 'haydensmith, jonlai',
      members: [
        {
          uId: bodyUser2.authUserId,
          email: 'user2@gmail.com',
          nameFirst: 'Jon',
          nameLast: 'Lai',
          handleStr: 'jonlai',
          profileImgUrl: expect.any(String)
        },

      ],
    };
    const bodyDMdmDetails1 = JSON.parse(dmDetails1.getBody() as string);

    expect(bodyDMdmDetails1).toStrictEqual(details1);

    const dmLeave2 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyDMLeave2 = JSON.parse(dmLeave2.getBody() as string);

    expect(dmLeave2.statusCode).toBe(OK);
    expect(bodyDMLeave2).toStrictEqual({});

    const dmLeave22 = request(
      'POST',
      url + ':' + port + '/dm/leave/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmLeave22.statusCode).toBe(403);
  });
});

describe('dm/messages/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(dmMessages1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId + 1,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmMessages1.statusCode).toBe(400);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '123');

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 5,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(dmMessages1.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 0,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(dmMessages1.statusCode).toBe(403);
  });

  test('correct return value with start + 50 == messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const messageIdList = [] as number[];

    const expectedTime = Math.floor(Date.now() / 1000);

    for (let i = 0; i < 50; i++) {
      const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abc');
      messageIdList.unshift(bodyMessage1.messageId);
    }

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMMessages1 = JSON.parse(dmMessages1.getBody() as string);

    const reacts = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];

    expect(dmMessages1.statusCode).toBe(OK);
    for (const messId in bodyDMMessages1.messages) {
      expect(bodyDMMessages1.messages[parseInt(messId)].messageId).toBe(messageIdList[parseInt(messId)]);
      expect(bodyDMMessages1.messages[parseInt(messId)].uId).toBe(bodyUser1.authUserId);
      expect(bodyDMMessages1.messages[parseInt(messId)].message).toEqual('abc');
      expect(bodyDMMessages1.messages[parseInt(messId)].timeSent).toBeGreaterThanOrEqual(expectedTime);
      expect(bodyDMMessages1.messages[parseInt(messId)].timeSent).toBeLessThan(expectedTime + 10);
      expect(bodyDMMessages1.messages[parseInt(messId)].reacts).toStrictEqual(reacts);
      expect(bodyDMMessages1.messages[parseInt(messId)].isPinned).toBe(false);
    }

    expect(bodyDMMessages1.start).toBe(0);
    expect(bodyDMMessages1.end).toBe(-1);
  });

  test('correct return value with start + 50 > messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const messageIdList = [] as number[];
    const expectedTime = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 70; i++) {
      const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abc');
      messageIdList.unshift(bodyMessage1.messageId);
    }

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 5,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const bodyDMMessages1 = JSON.parse(dmMessages1.getBody() as string);

    const reacts = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];
    expect(dmMessages1.statusCode).toBe(OK);
    for (let i = 5; i < 55; i++) {
      expect(bodyDMMessages1.messages[i - 5].messageId).toBe(messageIdList[i]);
      expect(bodyDMMessages1.messages[i - 5].uId).toBe(bodyUser1.authUserId);
      expect(bodyDMMessages1.messages[i - 5].message).toEqual('abc');
      expect(bodyDMMessages1.messages[i - 5].timeSent).toBeGreaterThanOrEqual(expectedTime);
      expect(bodyDMMessages1.messages[i - 5].timeSent).toBeLessThan(expectedTime + 10);
      expect(bodyDMMessages1.messages[i - 5].reacts).toStrictEqual(reacts);
      expect(bodyDMMessages1.messages[i - 5].isPinned).toBe(false);
    }

    expect(bodyDMMessages1.start).toBe(5);
    expect(bodyDMMessages1.end).toBe(55);
  });

  test('correct return value with start + 50 < messages length', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const expectedTime = Math.floor(Date.now() / 1000);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'adsfasfas');
    const bodyMessage2 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abc');
    httpMessageReact(bodyUser1.token, bodyMessage2.messageId, 1);
    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMMessages1 = JSON.parse(dmMessages1.getBody() as string);

    expect(dmMessages1.statusCode).toBe(OK);
    const reacts1 = [{
      reactId: 1,
      uIds: [] as number[],
      isThisUserReacted: false,
    }];
    const reacts2 = [{
      reactId: 1,
      uIds: [bodyUser1.authUserId],
      isThisUserReacted: true,
    }];
    expect(bodyDMMessages1.messages[0].messageId).toBe(bodyMessage2.messageId);
    expect(bodyDMMessages1.messages[0].uId).toBe(bodyUser1.authUserId);
    expect(bodyDMMessages1.messages[0].message).toEqual('abc');
    expect(bodyDMMessages1.messages[0].timeSent).toBeGreaterThanOrEqual(expectedTime);
    expect(bodyDMMessages1.messages[0].timeSent).toBeLessThan(expectedTime + 10);
    expect(bodyDMMessages1.messages[0].reacts).toStrictEqual(reacts2);
    expect(bodyDMMessages1.messages[0].isPinned).toBe(false);
    expect(bodyDMMessages1.messages[1].messageId).toBe(bodyMessage1.messageId);
    expect(bodyDMMessages1.messages[1].uId).toBe(bodyUser1.authUserId);
    expect(bodyDMMessages1.messages[1].message).toEqual('adsfasfas');
    expect(bodyDMMessages1.messages[1].timeSent).toBeGreaterThanOrEqual(expectedTime);
    expect(bodyDMMessages1.messages[1].timeSent).toBeLessThan(expectedTime + 10);
    expect(bodyDMMessages1.messages[1].reacts).toStrictEqual(reacts1);
    expect(bodyDMMessages1.messages[1].isPinned).toBe(false);
    expect(bodyDMMessages1.start).toBe(0);
    expect(bodyDMMessages1.end).toBe(-1);
  });

  test('correct return value with no messages are created', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const dmMessages1 = request(
      'GET',
      url + ':' + port + '/dm/messages/v2',
      {
        qs: {
          dmId: bodyDM1.dmId,
          start: 0,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyDMMessages1 = JSON.parse(dmMessages1.getBody() as string);

    expect(dmMessages1.statusCode).toBe(OK);
    expect(bodyDMMessages1).toStrictEqual(
      {
        messages: [],
        start: 0,
        end: -1,
      }
    );
  });
});

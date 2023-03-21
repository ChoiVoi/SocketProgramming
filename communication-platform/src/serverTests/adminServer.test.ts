import request from 'sync-request';

import config from '../config.json';

import {
  httpAuthRegister, httpAuthLogin, httpChannelsCreate, httpUserProfile,
  httpMessageSend, httpMessageSendDM, httpDMCreate
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
// ##############################################################################

describe('admin/user/remove/v1', () => {
  test('uId does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: -9999,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminRemove.statusCode).toEqual(400);
  });

  test('uId refers to a user who is the only global owner', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminRemove.statusCode).toEqual(400);
  });

  test('the authorised user is not a global owner', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(adminRemove.statusCode).toEqual(403);
  });

  test('Correct return', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');
    const bodyUser3 = httpAuthRegister('userthree@gmail.com', 'password', 'User', 'Three');
    const channel1 = httpChannelsCreate(bodyUser2.token, 'Channel', true);

    request(
      'POST',
      url + ':' + port + '/channel/join/v3',
      {
        json: {
          channelId: channel1.channelId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    httpChannelsCreate(bodyUser1.token, 'Channel!', true);
    httpMessageSend(bodyUser1.token, channel1.channelId, 'Not going to be removed');
    httpMessageSend(bodyUser2.token, channel1.channelId, 'Going to be removed');
    const uIds1 = [bodyUser1.authUserId, bodyUser3.authUserId];
    const uIds2 = [bodyUser3.authUserId];
    const dm1 = httpDMCreate(bodyUser2.token, uIds1);
    httpDMCreate(bodyUser1.token, uIds2);
    httpMessageSendDM(bodyUser2.token, dm1.dmId, 'Going to be removed');
    httpMessageSendDM(bodyUser3.token, dm1.dmId, 'Not going to be removed');

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminRemove.statusCode).toBe(OK);

    const bodyUserProfile2 = httpUserProfile(bodyUser2.token, bodyUser2.authUserId);

    expect(bodyUserProfile2.user).toStrictEqual(expect.objectContaining({
      uId: bodyUser2.authUserId,
      email: 'usertwo@gmail.com',
      nameFirst: 'Removed',
      nameLast: 'user',
      handleStr: 'usertwo',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    }));

    const usersAll = request(
      'GET',
      url + ':' + port + '/users/all/v2',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersAllBody = JSON.parse(usersAll.getBody() as string);
    expect(usersAll.statusCode).toBe(OK);

    const users = [
      {
        uId: bodyUser1.authUserId,
        email: 'userone@gmail.com',
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'userone',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg',
      }, {
        uId: bodyUser3.authUserId,
        email: 'userthree@gmail.com',
        nameFirst: 'User',
        nameLast: 'Three',
        handleStr: 'userthree',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg',
      },
    ];

    expect(new Set(usersAllBody.users)).toEqual(new Set(users));
  });

  test('Correct return when an owner removes an owner', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminRemove.statusCode).toBe(OK);

    const bodyUserProfile2 = httpUserProfile(bodyUser2.token, bodyUser2.authUserId);

    expect(bodyUserProfile2.user).toStrictEqual(expect.objectContaining({
      uId: bodyUser2.authUserId,
      email: 'usertwo@gmail.com',
      nameFirst: 'Removed',
      nameLast: 'user',
      handleStr: 'usertwo',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    }));

    const usersAll = request(
      'GET',
      url + ':' + port + '/users/all/v2',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersAllBody = JSON.parse(usersAll.getBody() as string);
    expect(usersAll.statusCode).toBe(OK);

    const users = [
      {
        uId: bodyUser1.authUserId,
        email: 'userone@gmail.com',
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'userone',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg',
      },
    ];

    expect(new Set(usersAllBody.users)).toEqual(new Set(users));
  });

  test('Incorrect token', () => {
    httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(adminRemove.statusCode).toEqual(403);
  });
});

// ##############################################################################
// ##############################################################################

describe('admin/userpermission/change/v1', () => {
  test('uId does not refer to a valid user', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: -9999,
          permissionId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminPermission.statusCode).toEqual(400);
  });

  test('uId refers to a user who is the only global owner and they are being demoted to a user', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser1.authUserId,
          permissionId: 2,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminPermission.statusCode).toEqual(400);
  });

  test('permissionId is invalid', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 3,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminPermission.statusCode).toEqual(400);
  });

  test('the user already has the permissions level of permissionId', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 2,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminPermission.statusCode).toEqual(400);
  });

  test('the authorised user is not a global owner', () => {
    httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminChange = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 2,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(adminChange.statusCode).toEqual(403);
  });

  test('Correct return', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    httpAuthLogin('userone@gmail.com', 'password');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(adminPermission.statusCode).toBe(OK);

    const adminRemove = request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(adminRemove.statusCode).toBe(OK);

    const bodyUserProfile1 = httpUserProfile(bodyUser1.token, bodyUser1.authUserId);

    expect(bodyUserProfile1.user).toStrictEqual(expect.objectContaining({
      uId: bodyUser1.authUserId,
      email: 'userone@gmail.com',
      nameFirst: 'Removed',
      nameLast: 'user',
      handleStr: 'userone',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    }));
  });

  test('Incorrect token', () => {
    httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const bodyUser2 = httpAuthRegister('usertwo@gmail.com', 'password', 'User', 'Two');

    const adminPermission = request(
      'POST',
      url + ':' + port + '/admin/userpermission/change/v1',
      {
        json: {
          uId: bodyUser2.authUserId,
          permissionId: 1,
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(adminPermission.statusCode).toEqual(403);
  });
});

// ##############################################################################

import request from 'sync-request';

import config from '../config.json';

import {
  httpAuthRegister, httpUserProfile, httpAuthLogin, httpChannelsCreate,
  httpDMCreate, httpMessageSend
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
describe('user/profile/v3', () => {
  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);
    expect(user1ProfileBody.user).toStrictEqual(expect.objectContaining({
      uId: bodyUser1.authUserId,
      email: 'userone@gmail.com',
      nameFirst: 'User',
      nameLast: 'One',
      handleStr: 'userone',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    }));
  });

  test('Error when uId does not exist', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: 4,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(user1Profile.statusCode).toEqual(400);
  });

  test('name longer than 20 characters for concatenation', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '321321', 'Aaaaabbbbbccccc', 'dddddeeeee');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email5@gmail.com',
      nameFirst: 'Aaaaabbbbbccccc',
      nameLast: 'dddddeeeee',
      handleStr: 'aaaaabbbbbcccccddddd',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('name with non-alphanumeric characters removed in handle', () => {
    const bodyUser1 = httpAuthRegister('email7@gmail.com', '456231', 'A1t2@!!%^b', 'b23cdf');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email7@gmail.com',
      nameFirst: 'A1t2@!!%^b',
      nameLast: 'b23cdf',
      handleStr: 'a1t2bb23cdf',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('append numbers if handle taken V1', () => {
    httpAuthRegister('email9@gmail.com', 'password', 'abcdefg', 'hijk');

    const bodyUser1 = httpAuthRegister('email10@gmail.com', '983482', 'abcdefg', 'hijk');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);
    const result = {
      uId: bodyUser1.authUserId,
      email: 'email10@gmail.com',
      nameFirst: 'abcdefg',
      nameLast: 'hijk',
      handleStr: 'abcdefghijk0',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('append numbers if handle taken and exceed 20 characters', () => {
    httpAuthRegister('email12@gmail.com', '326489', 'abcdefghij', 'klmnopqrst');

    const bodyUser1 = httpAuthRegister('email13@gmail.com', '326489', 'abcdefghij', 'klmnopqrst');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email13@gmail.com',
      nameFirst: 'abcdefghij',
      nameLast: 'klmnopqrst',
      handleStr: 'abcdefghijklmnopqrst0',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('name with space between characters removed in handle ', () => {
    const bodyUser1 = httpAuthRegister('email19@gmail.com', '356124', 'sdf dfwe', 'lkj nk');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email19@gmail.com',
      nameFirst: 'sdf dfwe',
      nameLast: 'lkj nk',
      handleStr: 'sdfdfwelkjnk',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('append handleStr with double digit', () => {
    httpAuthRegister('email1@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email2@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email3@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email4@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email5@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email6@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email7@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email8@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email9@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email10@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email11@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email12@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email13@gmail.com', '356124', 'abc', 'efg');

    const bodyUser1 = httpAuthRegister('email14@gmail.com', '356124', 'abc', 'efg');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email14@gmail.com',
      nameFirst: 'abc',
      nameLast: 'efg',
      handleStr: 'abcefg12',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });

  test('append handleStr with coincidence', () => {
    httpAuthRegister('email1@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email2@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email3@gmail.com', '356124', 'abc', 'efg');
    httpAuthRegister('email4@gmail.com', '356124', 'abc', 'efg');

    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);
    expect(user1Profile.statusCode).toBe(OK);

    const result1 = {
      uId: bodyUser1.authUserId,
      email: 'email5@gmail.com',
      nameFirst: 'abc',
      nameLast: 'efg3',
      handleStr: 'abcefg3',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result1);

    const bodyUser2 = httpAuthRegister('email6@gmail.com', '123123', 'abc', 'efg');

    const user2Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser2.authUserId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const user2ProfileBody = JSON.parse(user2Profile.getBody() as string);
    expect(user2Profile.statusCode).toBe(OK);

    const result2 = {
      uId: bodyUser2.authUserId,
      email: 'email6@gmail.com',
      nameFirst: 'abc',
      nameLast: 'efg',
      handleStr: 'abcefg4',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user2ProfileBody.user).toStrictEqual(result2);

    const bodyUser3 = httpAuthRegister('email7@gmail.com', '123123', 'abc', 'efg3');

    const user3Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser3.authUserId,
        },
        headers: {
          token: bodyUser3.token,
        }
      }
    );

    const user3ProfileBody = JSON.parse(user3Profile.getBody() as string);
    expect(user3Profile.statusCode).toBe(OK);

    const result3 = {
      uId: bodyUser3.authUserId,
      email: 'email7@gmail.com',
      nameFirst: 'abc',
      nameLast: 'efg3',
      handleStr: 'abcefg30',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };
    expect(user3ProfileBody.user).toStrictEqual(result3);
  });

  test('Incorrect token', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const usersProfile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(usersProfile.statusCode).toEqual(403);
  });
});

describe('users/all/v2', () => {
  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');
    const bodyUser2 = httpAuthRegister('email2@gmail.com', '123123', 'User', 'Two');
    const bodyUser3 = httpAuthRegister('email3@gmail.com', '123123', 'User', 'Three');
    const bodyUser4 = httpAuthRegister('email4@gmail.com', '123123', 'User', 'Four');
    const bodyUser5 = httpAuthRegister('email5@gmail.com', '123123', 'User', 'Three');
    request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser5.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
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
        email: 'email1@gmail.com',
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'userone',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },

      {
        uId: bodyUser2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'User',
        nameLast: 'Two',
        handleStr: 'usertwo',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },

      {
        uId: bodyUser3.authUserId,
        email: 'email3@gmail.com',
        nameFirst: 'User',
        nameLast: 'Three',
        handleStr: 'userthree',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },

      {
        uId: bodyUser4.authUserId,
        email: 'email4@gmail.com',
        nameFirst: 'User',
        nameLast: 'Four',
        handleStr: 'userfour',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },
    ];

    expect(new Set(usersAllBody.users)).toEqual(new Set(users));
  });

  test('Incorrect token', () => {
    const usersAll = request(
      'GET',
      url + ':' + port + '/users/all/v2',
      {
        qs: {},
        headers: {
          token: 'token',
        }
      }
    );

    expect(usersAll.statusCode).toEqual(403);
  });
});

describe('user/profile/setname/v2', () => {
  test('First name too long', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
          nameLast: 'One',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newName.statusCode).toEqual(400);
  });

  test('First name too short', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: '',
          nameLast: 'One',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newName.statusCode).toEqual(400);
  });

  test('Last name too long', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: 'User',
          nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newName.statusCode).toEqual(400);
  });

  test('Last name too short', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: 'User',
          nameLast: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newName.statusCode).toEqual(400);
  });

  test('correct return', () => {
    httpAuthRegister('userone@gmail.com', '123123', 'User', 'Decoy');
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: 'NewUser',
          nameLast: 'NewOne',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const newNameBody = JSON.parse(newName.getBody() as string);
    expect(newName.statusCode).toBe(OK);

    expect(newNameBody).toStrictEqual({});

    const usersProfileBody = httpUserProfile(bodyUser1.token, bodyUser1.authUserId);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email1@gmail.com',
      nameFirst: 'NewUser',
      nameLast: 'NewOne',
      handleStr: 'userone',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };

    expect(usersProfileBody.user).toStrictEqual(result);
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newName = request(
      'PUT',
      url + ':' + port + '/user/profile/setname/v2',
      {
        json: {
          nameFirst: 'NewUser',
          nameLast: 'NewOne',
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(newName.statusCode).toEqual(403);
  });
});

describe('user/profile/setemail/v2', () => {
  test('Invalid email', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newEmail = request(
      'PUT',
      url + ':' + port + '/user/profile/setemail/v2',
      {
        json: {
          email: 'InvalidEmail'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newEmail.statusCode).toEqual(400);
  });

  test('Email already exists', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efgh');
    httpAuthRegister('email6@gmail.com', '123123', 'abc', 'efg');

    const newEmail = request(
      'PUT',
      url + ':' + port + '/user/profile/setemail/v2',
      {
        json: {
          email: 'email6@gmail.com'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newEmail.statusCode).toEqual(400);
  });

  test('Correct return', () => {
    const bodyDecoy1 = httpAuthRegister('userone@gmail.com', '123123', 'User', 'Decoy');
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'User', 'One');

    const newEmail = request(
      'PUT',
      url + ':' + port + '/user/profile/setemail/v2',
      {
        json: {
          email: 'email6@gmail.com'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const newEmailBody = JSON.parse(newEmail.getBody() as string);
    expect(newEmail.statusCode).toBe(OK);

    expect(newEmailBody).toStrictEqual({});

    const usersProfileBody = httpUserProfile(bodyUser1.token, bodyUser1.authUserId);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email6@gmail.com',
      nameFirst: 'User',
      nameLast: 'One',
      handleStr: 'userone',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };

    expect(usersProfileBody.user).toStrictEqual(result);

    const usersAll = request(
      'GET',
      url + ':' + port + '/users/all/v2',
      {
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersAllBody = JSON.parse(usersAll.getBody() as string);
    expect(usersAll.statusCode).toBe(OK);

    const users = [
      {
        uId: bodyDecoy1.authUserId,
        email: 'userone@gmail.com',
        nameFirst: 'User',
        nameLast: 'Decoy',
        handleStr: 'userdecoy',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },
      {
        uId: bodyUser1.authUserId,
        email: 'email6@gmail.com',
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'userone',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      }
    ];

    expect(new Set(usersAllBody.users)).toEqual(new Set(users));
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newEmail = request(
      'PUT',
      url + ':' + port + '/user/profile/setemail/v2',
      {
        json: {
          email: 'userfive@gmail.com',
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(newEmail.statusCode).toEqual(403);
  });
});
// ##############################################################################
describe('user/profile/sethandle/v2', () => {
  test('Handle length is less than 3 characters', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'to'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newHandle.statusCode).toEqual(400);
  });

  test('Handle length is more than 20 characters', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'hgnshiukahnmipolqtsfhsbrn'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newHandle.statusCode).toEqual(400);
  });

  test('Handle contains non-alphanumeric characters', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'newhandle^%&'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newHandle.statusCode).toEqual(400);
  });

  test('Handle already in use', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');
    httpAuthRegister('email6@gmail.com', '123123', 'abcd', 'efg');
    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'abcdefg'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newHandle.statusCode).toEqual(400);
  });

  test('Correct return', () => {
    const bodyDecoy1 = httpAuthRegister('userone@gmail.com', '123123', 'User', 'Decoy');
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'User', 'One');

    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'abcdefg'
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(newHandle.statusCode).toEqual(200);

    const newHandleBody = JSON.parse(newHandle.getBody() as string);
    expect(newHandleBody).toStrictEqual({});

    const usersProfileBody = httpUserProfile(bodyUser1.token, bodyUser1.authUserId);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'email5@gmail.com',
      nameFirst: 'User',
      nameLast: 'One',
      handleStr: 'abcdefg',
      profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
    };

    expect(usersProfileBody.user).toStrictEqual(result);

    const usersAll = request(
      'GET',
      url + ':' + port + '/users/all/v2',
      {
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersAllBody = JSON.parse(usersAll.getBody() as string);
    expect(usersAll.statusCode).toBe(OK);

    const users = [
      {
        uId: bodyDecoy1.authUserId,
        email: 'userone@gmail.com',
        nameFirst: 'User',
        nameLast: 'Decoy',
        handleStr: 'userdecoy',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      },
      {
        uId: bodyUser1.authUserId,
        email: 'email5@gmail.com',
        nameFirst: 'User',
        nameLast: 'One',
        handleStr: 'abcdefg',
        profileImgUrl: url + ':' + port + '/imgurl/default.jpg'
      }
    ];

    expect(new Set(usersAllBody.users)).toEqual(new Set(users));
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const newHandle = request(
      'PUT',
      url + ':' + port + '/user/profile/sethandle/v2',
      {
        json: {
          handleStr: 'newHandle',
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(newHandle.statusCode).toEqual(403);
  });
});
// ##############################################################################

describe('user/stats/v1', () => {
  test('Correct return', () => {
    httpAuthRegister('userone@gmail.com', '123123', 'User', 'Decoy');
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');
    const bodyUser2 = httpAuthRegister('email2@gmail.com', '123123', 'User', 'Two');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'Channel1', true);
    httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'hello');

    httpAuthLogin('email1@gmail.com', '123123');

    const userStat = request(
      'GET',
      url + ':' + port + '/user/stats/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const userStatBody = JSON.parse(userStat.getBody() as string);
    expect(userStat.statusCode).toBe(OK);
    expect(userStatBody.userStats).toStrictEqual({
      channelsJoined: [
        expect.objectContaining({
          numChannelsJoined: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numChannelsJoined: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      dmsJoined: [
        expect.objectContaining({
          numDmsJoined: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numDmsJoined: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      messagesSent: [
        expect.objectContaining({
          numMessagesSent: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numMessagesSent: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      involvementRate: expect.any(Number),
    });
  });

  test('Correct return with no data', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const userStat = request(
      'GET',
      url + ':' + port + '/user/stats/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const userStatBody = JSON.parse(userStat.getBody() as string);
    expect(userStat.statusCode).toBe(OK);
    expect(userStatBody.userStats).toStrictEqual({
      channelsJoined: [
        expect.objectContaining({
          numChannelsJoined: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      dmsJoined: [
        expect.objectContaining({
          numDmsJoined: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      messagesSent: [
        expect.objectContaining({
          numMessagesSent: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      involvementRate: 0,
    });
  });

  test('Correct return when involvementRate is above 1', () => {
    httpAuthRegister('userone@gmail.com', '123123', 'User', 'Decoy');
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'Channel1', true);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'hello');

    request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    httpAuthLogin('email1@gmail.com', '123123');

    const userStat = request(
      'GET',
      url + ':' + port + '/user/stats/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const userStatBody = JSON.parse(userStat.getBody() as string);
    expect(userStat.statusCode).toBe(OK);
    expect(userStatBody.userStats).toStrictEqual({
      channelsJoined: [
        expect.objectContaining({
          numChannelsJoined: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numChannelsJoined: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      dmsJoined: [
        expect.objectContaining({
          numDmsJoined: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      messagesSent: [
        expect.objectContaining({
          numMessagesSent: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numMessagesSent: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      involvementRate: 1,
    });
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const userStats = request(
      'GET',
      url + ':' + port + '/user/stats/v1',
      {
        qs: {},
        headers: {
          token: 'token',
        }
      }
    );

    expect(userStats.statusCode).toEqual(403);
  });
});

// ##############################################################################
// ##############################################################################

describe('users/stats/v1', () => {
  test('Correct return', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');
    const bodyUser2 = httpAuthRegister('email2@gmail.com', '123123', 'User', 'Two');
    const bodyUser3 = httpAuthRegister('email3@gmail.com', '123123', 'User', 'Three');

    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'Channel1', true);
    httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'hello');
    request(
      'DELETE',
      url + ':' + port + '/admin/user/remove/v1',
      {
        qs: {
          uId: bodyUser3.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    httpAuthLogin('email1@gmail.com', '123123');

    const usersStat = request(
      'GET',
      url + ':' + port + '/users/stats/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersStatBody = JSON.parse(usersStat.getBody() as string);
    expect(usersStat.statusCode).toBe(OK);
    expect(usersStatBody.workspaceStats).toStrictEqual({
      channelsExist: [
        expect.objectContaining({
          numChannelsExist: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numChannelsExist: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      dmsExist: [
        expect.objectContaining({
          numDmsExist: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numDmsExist: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      messagesExist: [
        expect.objectContaining({
          numMessagesExist: 0,
          timeStamp: expect.any(Number),
        }),
        expect.objectContaining({
          numMessagesExist: 1,
          timeStamp: expect.any(Number),
        }),
      ],
      utilizationRate: expect.any(Number),
    });
  });

  test('Correct return with no data', () => {
    const bodyUser1 = httpAuthRegister('email1@gmail.com', '123123', 'User', 'One');

    const usersStat = request(
      'GET',
      url + ':' + port + '/users/stats/v1',
      {
        qs: {},
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const usersStatBody = JSON.parse(usersStat.getBody() as string);
    expect(usersStat.statusCode).toBe(OK);
    expect(usersStatBody.workspaceStats).toStrictEqual({
      channelsExist: [
        expect.objectContaining({
          numChannelsExist: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      dmsExist: [
        expect.objectContaining({
          numDmsExist: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      messagesExist: [
        expect.objectContaining({
          numMessagesExist: 0,
          timeStamp: expect.any(Number),
        }),
      ],
      utilizationRate: expect.any(Number),
    });
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const userStats = request(
      'GET',
      url + ':' + port + '/users/stats/v1',
      {
        qs: {},
        headers: {
          token: 'token',
        }
      }
    );

    expect(userStats.statusCode).toEqual(403);
  });
});
// ##############################################################################
describe('user/profile/uploadphoto/v1', () => {
  test('Invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'http://myrehabteam.com.au/wp-content/uploads/2015/12/Monochrome-Apple.jpg',
          xStart: 300,
          yStart: 300,
          xEnd: 500,
          yEnd: 500
        },
        headers: {
          token: bodyUser1.token + 'a'
        }
      }
    );
    expect(profilePhoto.statusCode).toEqual(403);
  });

  test('Image file is not JPG', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'http://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
          xStart: 30,
          yStart: 30,
          xEnd: 50,
          yEnd: 50,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(profilePhoto.statusCode).toEqual(400);
  });

  test('xEnd is less than or equal to xStart', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'http://myrehabteam.com.au/wp-content/uploads/2015/12/Monochrome-Apple.jpg',
          xStart: 30,
          yStart: 30,
          xEnd: 30,
          yEnd: 50
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(profilePhoto.statusCode).toEqual(400);
  });

  test('yEnd is less than or equal to yStart', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'http://myrehabteam.com.au/wp-content/uploads/2015/12/Monochrome-Apple.jpg',
          xStart: 30,
          yStart: 30,
          xEnd: 50,
          yEnd: 20
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(profilePhoto.statusCode).toEqual(400);
  });

  test('larger dimensions of the image at the URL', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'https://myrehabteam.com.au/wp-content/uploads/2015/12/Monochrome-Apple.jpg',
          xStart: 900,
          yStart: 900,
          xEnd: 1000,
          yEnd: 1000,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(profilePhoto.statusCode).toEqual(400);
  });

  test('correct return', () => {
    httpAuthRegister('user0@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith213');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');

    const profilePhoto = request(
      'POST',
      url + ':' + port + '/user/profile/uploadphoto/v1',
      {
        json: {
          imgUrl: 'http://tinypng.com/images/social/website.jpg',
          xStart: 150,
          yStart: 150,
          xEnd: 1000,
          yEnd: 500,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(profilePhoto.statusCode).toBe(OK);
    const bodyProfilePhoto = JSON.parse(profilePhoto.getBody() as string);
    expect(bodyProfilePhoto).toStrictEqual({});

    const user1Profile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const user1ProfileBody = JSON.parse(user1Profile.getBody() as string);

    const result = {
      uId: bodyUser1.authUserId,
      email: 'user1@gmail.com',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      handleStr: 'haydensmith',
      profileImgUrl: url + ':' + port + '/imgurl/' + bodyUser1.authUserId + '.jpg'
    };
    expect(user1ProfileBody.user).toStrictEqual(result);
  });
});

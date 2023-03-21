import request from 'sync-request';

import config from '../config.json';

import { httpAuthRegister, httpAuthLogin } from './helperTest';

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

describe('auth/register/v3', () => {
  test('Invalid email', () => {
    const user1 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'InvalidEmail',
          password: 'password',
          nameFirst: 'User',
          nameLast: 'One',
        }

      }
    );

    expect(user1.statusCode).toEqual(400);
  });

  test('Duplicate emails', () => {
    httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const user2 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'userone@gmail.com',
          password: 'password',
          nameFirst: 'User',
          nameLast: 'Two',
        }
      }
    );

    expect(user2.statusCode).toEqual(400);
  });

  test('Short password', () => {
    const user2 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'usertwo@gmail.com',
          password: 'passw',
          nameFirst: 'User',
          nameLast: 'One',
        }
      }
    );

    expect(user2.statusCode).toEqual(400);
  });

  test('First name too long', () => {
    const user3 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'userthree@gmail.com',
          password: 'password',
          nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
          nameLast: 'Three',
        }
      }
    );

    expect(user3.statusCode).toEqual(400);
  });

  test('Last name too long', () => {
    const user4 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'userfour@gmail.com',
          password: 'password',
          nameFirst: 'User',
          nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
        }
      }
    );

    expect(user4.statusCode).toEqual(400);
  });

  test('First name too short', () => {
    const user4 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'userfour@gmail.com',
          password: 'password',
          nameFirst: '',
          nameLast: 'Four',
        }
      }
    );

    expect(user4.statusCode).toEqual(400);
  });

  test('Last name too short', () => {
    const user4 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'userfour@gmail.com',
          password: 'password',
          nameFirst: 'User',
          nameLast: '',
        }
      }
    );

    expect(user4.statusCode).toEqual(400);
  });

  test('Correct results', () => {
    const user4 = request(
      'POST',
      url + ':' + port + '/auth/register/v3',
      {
        json: {
          email: 'usereleven@gmail.com',
          password: 'password',
          nameFirst: 'User',
          nameLast: 'Eleven',
        }
      }
    );
    const bodyUser4 = JSON.parse(user4.getBody() as string);
    expect(user4.statusCode).toBe(OK);
    expect(bodyUser4).toStrictEqual(expect.objectContaining({
      token: expect.any(String),
      authUserId: expect.any(Number),
    }));
  });
});

describe('auth/login/v3 test', () => {
  test('Email does not exist', () => {
    const user5 = request(
      'POST',
      url + ':' + port + '/auth/login/v3',
      {
        json: {
          email: 'userfive@gmail.com',
          password: 'password',
        }
      }
    );

    expect(user5.statusCode).toEqual(400);
  });

  test('Password is incorrect', () => {
    httpAuthRegister('usersix@gmail.com', 'password', 'User', 'Six');

    const user6Login = request(
      'POST',
      url + ':' + port + '/auth/login/v3',
      {
        json: {
          email: 'usersix@gmail.com',
          password: 'password1',
        }
      }
    );

    expect(user6Login.statusCode).toEqual(400);
  });

  test('Correct Results', () => {
    const bodyUser7 = httpAuthRegister('userseven@gmail.com', 'password', 'User', 'Seven');

    const user7Login = request(
      'POST',
      url + ':' + port + '/auth/login/v3',
      {
        json: {
          email: 'userseven@gmail.com',
          password: 'password',
        }
      }
    );
    const bodyUserLogin7 = JSON.parse(user7Login.getBody() as string);
    expect(user7Login.statusCode).toBe(OK);
    expect(bodyUserLogin7).toStrictEqual(expect.objectContaining({
      token: expect.any(String),
      authUserId: bodyUser7.authUserId,
    }));
  });
});

describe('auth/logout/v2 test', () => {
  test('Correct Results', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');
    const User1Login = httpAuthLogin('userone@gmail.com', 'password');

    const userLogout = request(
      'POST',
      url + ':' + port + '/auth/logout/v2',
      {
        headers: {
          token: User1Login.token,
        }
      }
    );

    const userLogoutBody = JSON.parse(userLogout.getBody() as string);
    expect(userLogout.statusCode).toBe(OK);

    expect(userLogoutBody).toStrictEqual({});

    const usersProfile = request(
      'GET',
      url + ':' + port + '/user/profile/v3',
      {
        qs: {
          uId: bodyUser1.authUserId,
        },
        headers: {
          token: User1Login.token,
        }
      }
    );

    expect(usersProfile.statusCode).toEqual(403);
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const userLogout = request(
      'POST',
      url + ':' + port + '/auth/logout/v2',
      {
        headers: {
          token: 'token',
        }
      }
    );

    expect(userLogout.statusCode).toEqual(403);
  });
});

describe('/auth/passwordreset/request/v1 test', () => {
  test('Email not in valid', () => {
    httpAuthRegister('emailreceiver830@gmail.com', '123123', 'abc', 'efg3');

    const passwordReset = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/request/v1',
      {
        json: {
          email: 'emailreceiver83@gmail.com',
        },
      }
    );

    expect(passwordReset.statusCode).toEqual(200);

    const passwordResetBody = JSON.parse(passwordReset.getBody() as string);
    expect(passwordResetBody).toStrictEqual({});
  });

  test('Correct return', () => {
    httpAuthRegister('userone@gmail.com', '123123', 'User', 'One');
    httpAuthRegister('emailreceiver830@gmail.com', '123123', 'abc', 'efg3');

    const passwordReset = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/request/v1',
      {
        json: {
          email: 'emailreceiver830@gmail.com',
        },
      }
    );

    expect(passwordReset.statusCode).toEqual(200);

    const passwordResetBody = JSON.parse(passwordReset.getBody() as string);
    expect(passwordResetBody).toStrictEqual({});
  });
});

describe('/auth/passwordreset/reset/v1 test', () => {
  test('resetCode is not a valid reset code', () => {
    httpAuthRegister('emailreceiver830@gmail.com', '123123', 'abc', 'efg3');

    const passwordResetReq = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/request/v1',
      {
        json: {
          email: 'emailreceiver830@gmail.com',
        },
      }
    );

    expect(passwordResetReq.statusCode).toEqual(200);

    httpAuthLogin('emailreceiver830@gmail.com', '123123');

    const passwordReset = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/reset/v1',
      {
        json: {
          resetCode: 'resetCode',
          newPassword: 'newPassword',
        },
      }
    );

    expect(passwordReset.statusCode).toEqual(400);
  });

  test('password entered is less than 6 characters long', () => {
    httpAuthRegister('emailreceiver830@gmail.com', '123123', 'abc', 'efg3');

    const passwordResetReq = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/request/v1',
      {
        json: {
          email: 'emailreceiver830@gmail.com',
        },
      }
    );

    expect(passwordResetReq.statusCode).toEqual(200);

    httpAuthLogin('emailreceiver830@gmail.com', '123123');

    const passwordReset = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/reset/v1',
      {
        json: {
          resetCode: '16552',
          newPassword: 'newPa',
        },
      }
    );

    expect(passwordReset.statusCode).toEqual(400);
  });

  test('correct return', () => {
    httpAuthRegister('userone@gmail.com', '123123', 'User', 'One');
    httpAuthRegister('emailreceiver830@gmail.com', '123123', 'abc', 'efg3');

    const passwordResetReq = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/request/v1',
      {
        json: {
          email: 'emailreceiver830@gmail.com',
        },
      }
    );

    expect(passwordResetReq.statusCode).toEqual(200);

    httpAuthLogin('emailreceiver830@gmail.com', '123123');

    const passwordReset = request(
      'POST',
      url + ':' + port + '/auth/passwordreset/reset/v1',
      {
        json: {
          resetCode: '16552',
          newPassword: 'newPassword',
        },
      }
    );

    expect(passwordReset.statusCode).toEqual(200);

    const passwordResetBody = JSON.parse(passwordReset.getBody() as string);
    expect(passwordResetBody).toStrictEqual({});

    const user2 = request(
      'POST',
      url + ':' + port + '/auth/login/v3',
      {
        json: {
          email: 'emailreceiver830@gmail.com',
          password: 'newPassword',
        },
      }
    );

    expect(user2.statusCode).toEqual(200);
  });
});

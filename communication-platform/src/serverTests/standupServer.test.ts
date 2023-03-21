import request from 'sync-request';

import config from '../config.json';

import { httpAuthRegister, httpChannelsCreate } from './helperTest';

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

describe('standup start test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupStart = request(
      'POST',
      url + ':' + port + '/standup/start/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          length: 2
        },
        headers: {
          token: bodyUser1.token + 'a'
        }
      }
    );
    expect(standupStart.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupStart = request(
      'POST',
      url + ':' + port + '/standup/start/v1',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          length: 2
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupStart.statusCode).toBe(400);
  });

  test('length is a negative value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupStart = request(
      'POST',
      url + ':' + port + '/standup/start/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          length: -10
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupStart.statusCode).toBe(400);
  });

  test('an active standup is currently running in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    request(
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

    const standupStart = request(
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
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
    expect(standupStart.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'lkajsdf', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupStart = request(
      'POST',
      url + ':' + port + '/standup/start/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          length: 2
        },
        headers: {
          token: bodyUser2.token
        }
      }
    );
    expect(standupStart.statusCode).toBe(403);
  });

  test('correct return', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const timeNow = Math.floor(Date.now() / 1000);
    const standupStart = request(
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
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
    const bodyStandupStart = JSON.parse(standupStart.getBody() as string);
    expect(standupStart.statusCode).toBe(OK);
    expect(bodyStandupStart.timeFinish).toBeGreaterThanOrEqual(timeNow + 2);
  });
});

describe('standup active test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupactive = request(
      'GET',
      url + ':' + port + '/standup/active/v1',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token + 'a'
        }
      }
    );
    expect(standupactive.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupactive = request(
      'GET',
      url + ':' + port + '/standup/active/v1',
      {
        qs: {
          channelId: bodyChannel1.channelId + 1,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupactive.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'qwerlkj', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupactive = request(
      'GET',
      url + ':' + port + '/standup/active/v1',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser2.token
        }
      }
    );
    expect(standupactive.statusCode).toBe(403);
  });

  test('correct return', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const timeNow = Math.floor(Date.now() / 1000);

    request(
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

    const standupactive = request(
      'GET',
      url + ':' + port + '/standup/active/v1',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    const bodyStandupactive = JSON.parse(standupactive.getBody() as string);
    expect(standupactive.statusCode).toBe(OK);
    expect(bodyStandupactive.isActive).toStrictEqual(true);
    expect(bodyStandupactive.timeFinish).toBeGreaterThanOrEqual(timeNow);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('correct return when no standup is active', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const standupactive = request(
      'GET',
      url + ':' + port + '/standup/active/v1',
      {
        qs: {
          channelId: bodyChannel1.channelId,
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    const bodyStandupactive = JSON.parse(standupactive.getBody() as string);
    expect(standupactive.statusCode).toBe(OK);
    expect(bodyStandupactive.isActive).toStrictEqual(false);
    expect(bodyStandupactive.timeFinish).toStrictEqual(null);
  });
});

describe('standup send test', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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

    const standupSend = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'tttt'
        },
        headers: {
          token: bodyUser1.token + 'a'
        }
      }
    );
    expect(standupSend.statusCode).toBe(403);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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

    const standupSend = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          message: 'tttt'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupSend.statusCode).toBe(400);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('length of message is over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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
    const standupSend1 = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    expect(standupSend1.statusCode).toBe(400);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('an active standup is not currently running in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
    const standupSend1 = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'abc'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupSend1.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'asdflkj', 'Jay', 'Choi');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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

    const standupSend = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'tttt'
        },
        headers: {
          token: bodyUser2.token
        }
      }
    );
    expect(standupSend.statusCode).toBe(403);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('correct return1', () => {
    httpAuthRegister('user2@gmail.com', 'lkjqwer', 'Jay', 'Choi');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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

    const standupSend1 = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'abcasdfasdfasdf'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );
    expect(standupSend1.statusCode).toBe(200);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });

  test('correct return2', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);
    request(
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

    const standupSend1 = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'abcasdfasdfasdf'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    const standupSend2 = request(
      'POST',
      url + ':' + port + '/standup/send/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'abcasdfas'
        },
        headers: {
          token: bodyUser1.token
        }
      }
    );

    expect(standupSend1.statusCode).toBe(200);
    expect(standupSend2.statusCode).toBe(200);
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 3) {
        break;
      }
    }
  });
});

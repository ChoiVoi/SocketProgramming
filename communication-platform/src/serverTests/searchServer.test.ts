import request from 'sync-request';

import config from '../config.json';
import {
  httpAuthRegister, httpChannelsCreate, httpDMCreate,
  httpMessageSend, httpMessageSendDM, httpMessageReact
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

describe('search/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const search1 = request(
      'GET',
      url + ':' + port + '/search/v1',
      {
        qs: {
          queryStr: '451235dfas',
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(search1.statusCode).toBe(403);
  });

  test('length of queryStr is less than 1 or over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const search1 = request(
      'GET',
      url + ':' + port + '/search/v1',
      {
        qs: {
          queryStr: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(search1.statusCode).toBe(400);

    const search2 = request(
      'GET',
      url + ':' + port + '/search/v1',
      {
        qs: {
          queryStr: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(search2.statusCode).toBe(400);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser1.token, 'comp2521', false);
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    const bodyMessage3 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageSend(bodyUser1.token, bodyChannel2.channelId, '123');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);
    const bodyMessage2 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    const bodyMessage4 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageSendDM(bodyUser1.token, bodyDM2.dmId, 'dadsf');
    httpMessageReact(bodyUser1.token, bodyMessage2.messageId, 1);

    const search1 = request(
      'GET',
      url + ':' + port + '/search/v1',
      {
        qs: {
          queryStr: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodySearch1 = JSON.parse(search1.getBody() as string);
    expect(search1.statusCode).toBe(OK);

    const messageList = [
      {
        messageId: bodyMessage1.messageId,
        uId: bodyUser1.authUserId,
        message: 'abc',
        isPinned: false
      },
      {
        messageId: bodyMessage2.messageId,
        uId: bodyUser1.authUserId,
        message: 'abCabC123',
        isPinned: false
      },
      {
        messageId: bodyMessage4.messageId,
        uId: bodyUser1.authUserId,
        message: 'abCabC123',
        isPinned: false
      },
      {
        messageId: bodyMessage3.messageId,
        uId: bodyUser1.authUserId,
        message: 'abc',
        isPinned: false
      },
    ];

    const bodyMess = [];
    for (const message of bodySearch1.messages) {
      const mess = {
        messageId: message.messageId,
        uId: message.uId,
        message: message.message,
        isPinned: message.isPinned
      };
      bodyMess.push(mess);
    }
    expect(new Set(bodyMess)).toStrictEqual(new Set(messageList));
  });

  test('correct return value for nothing found', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser1.token, 'comp2521', false);
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser1.token, []);
    httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageSend(bodyUser1.token, bodyChannel2.channelId, '123');
    httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageSendDM(bodyUser1.token, bodyDM2.dmId, 'dadsf');

    const search1 = request(
      'GET',
      url + ':' + port + '/search/v1',
      {
        qs: {
          queryStr: 'xzy',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodySearch1 = JSON.parse(search1.getBody() as string);
    expect(search1.statusCode).toBe(OK);
    expect(new Set(bodySearch1.messages)).toStrictEqual(new Set([]));
  });
});

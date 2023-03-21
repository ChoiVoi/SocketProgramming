import request from 'sync-request';

import config from '../config.json';
import {
  httpAuthRegister, httpChannelInvite, httpChannelsCreate,
  httpDMCreate, httpMessageSend, httpMessageSendDM, httpDMMessages, httpMessageReact,
  httpMessagePin, httpChannelLeave, httpDMLeave, httpChannelMessages
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

describe('message/send/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '123',
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(message1.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          token: bodyUser1.token,
          channelId: bodyChannel1.channelId + 1,
          message: '123',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(message1.statusCode).toBe(400);
  });

  test('length of message is less than 1 or over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(message1.statusCode).toBe(400);

    const message2 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(message2.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235dfas',
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(message1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235dfas',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage1 = JSON.parse(message1.getBody() as string);

    expect(message1.statusCode).toBe(OK);
    expect(bodyMessage1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });

  test('tagged notifications', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage1 = JSON.parse(message1.getBody() as string);

    expect(message1.statusCode).toBe(OK);
    expect(bodyMessage1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    const message2 = request(
      'POST',
      url + ':' + port + '/message/send/v2',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235@jonlai',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage2 = JSON.parse(message2.getBody() as string);

    expect(message2.statusCode).toBe(OK);
    expect(bodyMessage2).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });
});

describe('message/edit/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '234O3',
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(403);
  });

  test('length of message is over 1000 characters in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(messageEdit1.statusCode).toBe(400);
  });

  test('length of message is over 1000 characters in dm', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(400);
  });

  test('messageId does not refer to a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(400);
  });

  test('messageId does not refer to a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(400);
  });

  test('the message was not sent by the authorised user making this request in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(messageEdit1.statusCode).toBe(403);
  });

  test('the message was not sent by the authorised user making this request in dm', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageEdit1.statusCode).toBe(403);
  });

  test('correct return value in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);

    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser1.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');
    const bodyMessage2 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451fas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    const messageEdit2 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage2.messageId,
          message: 'abcd',
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyMessageEdit2 = JSON.parse(messageEdit2.getBody() as string);

    expect(messageEdit2.statusCode).toBe(OK);
    expect(bodyMessageEdit2).toStrictEqual({});

    // const bodyMessages1 = httpChannelMessages(bodyUser1.token, bodyChannel1.channelId, 0);

    // expect(bodyMessages1.messages[0].message).toEqual('abcd');
    // expect(bodyMessages1.messages[1].message).toEqual('abc');
  });

  test('correct return value with new message is empty string in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    // const bodyMessages1 = httpChannelMessages(bodyUser1.token, bodyChannel1.channelId, 0);

    // expect(bodyMessages1.messages).toStrictEqual([]);
  });

  test('correct return value in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: 'abc',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    const bodyMessages1 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);

    expect(bodyMessages1.messages[0].message).toEqual('abc');
  });

  test('correct return value with new message is empty string in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    const bodyMessages1 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);

    expect(bodyMessages1.messages).toStrictEqual([]);
  });

  test('tagged notifications in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);

    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser1.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');
    const bodyMessage2 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451fas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    const messageEdit2 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage2.messageId,
          message: '451235@jonlai',
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyMessageEdit2 = JSON.parse(messageEdit2.getBody() as string);

    expect(messageEdit2.statusCode).toBe(OK);
    expect(bodyMessageEdit2).toStrictEqual({});

    // const bodyMessages1 = httpChannelMessages(bodyUser1.token, bodyChannel1.channelId, 0);

    // expect(bodyMessages1.messages[0].message).toEqual('abcd');
    // expect(bodyMessages1.messages[1].message).toEqual('abc');
  });

  test('correct return value in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageEdit1 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit1 = JSON.parse(messageEdit1.getBody() as string);

    expect(messageEdit1.statusCode).toBe(OK);
    expect(bodyMessageEdit1).toStrictEqual({});

    const bodyMessages1 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);

    expect(bodyMessages1.messages[0].message).toEqual('451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai');

    const messageEdit2 = request(
      'PUT',
      url + ':' + port + '/message/edit/v2',
      {
        json: {
          messageId: bodyMessage1.messageId,
          message: '4512 @haydensmith',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessageEdit2 = JSON.parse(messageEdit2.getBody() as string);

    expect(messageEdit2.statusCode).toBe(OK);
    expect(bodyMessageEdit2).toStrictEqual({});

    const bodyMessages2 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);

    expect(bodyMessages2.messages[0].message).toEqual('4512 @haydensmith');
  });
});

describe('message/remove/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageRemove1 = request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );

    expect(messageRemove1.statusCode).toBe(403);
  });

  test('messageId does not refer to a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');

    const messageRemove1 = request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageRemove1.statusCode).toBe(400);
  });

  test('messageId does not refer to a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageRemove1 = request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageRemove1.statusCode).toBe(400);
  });

  test('the message was not sent by the authorised user making this request in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');

    const messageRemove1 = request(
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
    expect(messageRemove1.statusCode).toBe(403);
  });

  test('the message was not sent by the authorised user making this request in dm', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM1.dmId, '451235dfas');

    const messageRemove1 = request(
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
    expect(messageRemove1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');

    const messageRemove1 = request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageRemove1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageRemove1 = request(
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
    expect(messageRemove1.statusCode).toBe(403);
  });

  test('correct return value in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);
    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser1.authUserId);

    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');
    const bodyMessage2 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '435dfas');

    const messageRemove1 = request(
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
    const bodyMessageRemove1 = JSON.parse(messageRemove1.getBody() as string);

    expect(messageRemove1.statusCode).toBe(OK);
    expect(bodyMessageRemove1).toStrictEqual({});

    const messageRemove2 = request(
      'DELETE',
      url + ':' + port + '/message/remove/v2',
      {
        qs: {
          messageId: bodyMessage2.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    const bodyMessageRemove2 = JSON.parse(messageRemove2.getBody() as string);

    expect(messageRemove2.statusCode).toBe(OK);
    expect(bodyMessageRemove2).toStrictEqual({});

    // const bodyMessages1 = httpChannelMessages(bodyUser1.token, bodyChannel1.channelId, 0);

    // expect(bodyMessages1.messages).toStrictEqual([]);
  });

  test('correct return value in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messageRemove1 = request(
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
    const bodyMessageRemove1 = JSON.parse(messageRemove1.getBody() as string);

    expect(messageRemove1.statusCode).toBe(OK);
    expect(bodyMessageRemove1).toStrictEqual({});

    const bodyMessages1 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);

    expect(bodyMessages1.messages).toStrictEqual([]);
  });
});

describe('message/senddm/v2', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '451235dfas',
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(message1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId + 1,
          message: '451235dfas',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(message1.statusCode).toBe(400);
  });

  test('length of message is less than 1 or over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(message1.statusCode).toBe(400);

    const message2 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(message2.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: 'fdasfa',
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(message1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: 'adsfasfas',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage1 = JSON.parse(message1.getBody() as string);

    expect(message1.statusCode).toBe(OK);
    expect(bodyMessage1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });

  test('tagged notifications', () => {
    httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);

    const message1 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage1 = JSON.parse(message1.getBody() as string);

    expect(message1.statusCode).toBe(OK);
    expect(bodyMessage1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    const message2 = request(
      'POST',
      url + ':' + port + '/message/senddm/v2',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '@haydensmith_1 12',
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    const bodyMessage2 = JSON.parse(message2.getBody() as string);

    expect(message2.statusCode).toBe(OK);
    expect(bodyMessage2).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });
});

describe('message/share/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: bodyChannel1.channelId,
          dmId: -1
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageShare1.statusCode).toBe(403);
  });

  test('channelId are invalid', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: bodyChannel1.channelId + 1,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('dmId are invalid', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: -1,
          dmId: bodyDM1.dmId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('neither channelId nor dmId are -1', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: bodyChannel1.channelId,
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('ogMessageId does not refer to a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId + 1,
          message: '123',
          channelId: bodyChannel1.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('ogMessageId does not refer to a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId + 1,
          message: '123',
          channelId: -1,
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('authorised users do not join the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel2.channelId, '123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: bodyChannel1.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('authorised users do not join the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM2.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: -1,
          dmId: bodyDM1.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('length of message is more than 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
          channelId: bodyChannel1.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(400);
  });

  test('the authorised user has not joined the channel they are trying to share the message to', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: 'abc',
          channelId: bodyChannel2.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(403);
  });

  test('the authorised user has not joined the DM they are trying to share the message to', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: -1,
          dmId: bodyDM2.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(403);
  });

  test('correct return value in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '123');
    httpChannelInvite(bodyUser2.token, bodyChannel2.channelId, bodyUser1.authUserId);

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: 'abc',
          channelId: bodyChannel2.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(OK);

    const bodyMessageShare1 = JSON.parse(messageShare1.getBody() as string);

    expect(bodyMessageShare1).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));
  });

  test('tagged notifications in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpAuthRegister('user3@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '123');
    httpChannelInvite(bodyUser2.token, bodyChannel2.channelId, bodyUser1.authUserId);

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
          channelId: bodyChannel2.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(OK);

    const bodyMessageShare1 = JSON.parse(messageShare1.getBody() as string);

    expect(bodyMessageShare1).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));

    const messageShare2 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '451235@jonlai',
          channelId: bodyChannel2.channelId,
          dmId: -1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare2.statusCode).toBe(OK);

    const bodyMessageShare2 = JSON.parse(messageShare2.getBody() as string);

    expect(bodyMessageShare2).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));
  });

  test('correct return value in DM ', () => {
    httpAuthRegister('user0@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '123',
          channelId: -1,
          dmId: bodyDM2.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(OK);
    const bodyMessageShare1 = JSON.parse(messageShare1.getBody() as string);

    expect(bodyMessageShare1).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));

    const messageShare2 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '',
          channelId: -1,
          dmId: bodyDM2.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare2.statusCode).toBe(OK);
    const bodyMessageShare2 = JSON.parse(messageShare2.getBody() as string);

    expect(bodyMessageShare2).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));
  });

  test('taggeg notifications in DM', () => {
    httpAuthRegister('user0@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageShare1 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
          channelId: -1,
          dmId: bodyDM2.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare1.statusCode).toBe(OK);
    const bodyMessageShare1 = JSON.parse(messageShare1.getBody() as string);

    expect(bodyMessageShare1).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));

    const messageShare2 = request(
      'POST',
      url + ':' + port + '/message/share/v1',
      {
        json: {
          ogMessageId: bodyMessage1.messageId,
          message: '@haydensmith_1 12',
          channelId: -1,
          dmId: bodyDM2.dmId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageShare2.statusCode).toBe(OK);
    const bodyMessageShare2 = JSON.parse(messageShare2.getBody() as string);

    expect(bodyMessageShare2).toStrictEqual(expect.objectContaining({
      sharedMessageId: expect.any(Number),
    }));
  });
});

describe('message/react/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageReact1.statusCode).toBe(403);
  });

  test('messageId is not a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('messageId is not a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('authorised users do not join the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel2.channelId, '123');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('authorised users do not join the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM2.dmId, 'abCabC123');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('reactId is not a valid react ID', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 2,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('the message already contains a react with ID reactId from the authorised user in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageReact2 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(messageReact2.statusCode).toBe(400);
  });

  test('the message already contains a react with ID reactId from the authorised user in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(400);
  });

  test('correct return value in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    expect(messageReact1.statusCode).toBe(OK);

    const bodyMessageReact1 = JSON.parse(messageReact1.getBody() as string);
    expect(bodyMessageReact1).toStrictEqual({});
  });

  test('correct return value in channel for user left', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpChannelLeave(bodyUser1.token, bodyChannel1.channelId);

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    expect(messageReact1.statusCode).toBe(OK);

    const bodyMessageReact1 = JSON.parse(messageReact1.getBody() as string);
    expect(bodyMessageReact1).toStrictEqual({});
  });

  test('correct return value in DM ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(OK);

    const bodyMessageReact1 = JSON.parse(messageReact1.getBody() as string);
    expect(bodyMessageReact1).toStrictEqual({});
  });

  test('correct return value in DM for user left', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, [bodyUser2.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpDMLeave(bodyUser1.token, bodyDM1.dmId);

    const messageReact1 = request(
      'POST',
      url + ':' + port + '/message/react/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageReact1.statusCode).toBe(OK);

    const bodyMessageReact1 = JSON.parse(messageReact1.getBody() as string);
    expect(bodyMessageReact1).toStrictEqual({});
  });
});

describe('message/unreact/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(403);
  });

  test('messageId is not a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('messageId is not a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('reactId is not a valid react ID', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 2,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('the message does not contain a react with ID reactId from the authorised user in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('the message does not contain a react with ID reactId from the authorised user in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('authorised users do not join the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel2.channelId, '123');
    httpMessageReact(bodyUser2.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('authorised users do not join the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM2.dmId, 'abCabC123');
    httpMessageReact(bodyUser2.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(400);
  });

  test('correct return value in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(OK);
    const bodyMessageUnreact1 = JSON.parse(messageUnreact1.getBody() as string);
    expect(bodyMessageUnreact1).toStrictEqual({});

    const bodyMessage = httpChannelMessages(bodyUser1.token, bodyChannel1.channelId, 0);
    expect(bodyMessage.messages[0].reacts[0].uIds.length).toBe(0);
  });

  test('correct return value in DM ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessageReact(bodyUser1.token, bodyMessage1.messageId, 1);

    const messageUnreact1 = request(
      'POST',
      url + ':' + port + '/message/unreact/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
          reactId: 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnreact1.statusCode).toBe(OK);
    const bodyMessageUnreact1 = JSON.parse(messageUnreact1.getBody() as string);
    expect(bodyMessageUnreact1).toStrictEqual({});
    const bodyMessage = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);
    expect(bodyMessage.messages[0].reacts[0].uIds.length).toBe(0);
  });
});

describe('message/pin/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messagePin1.statusCode).toBe(403);
  });

  test('messageId is not a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('messageId is not a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('authorised users do not join the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel2.channelId, '123');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('authorised users do not join the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM2.dmId, 'abCabC123');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('the message is already pinned in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('the message is already pinned in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(400);
  });

  test('the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(403);
  });

  test('correct return value in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);
    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser1.authUserId);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');
    const bodyMessage2 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '435dfas');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(OK);
    const bodyMessagePin1 = JSON.parse(messagePin1.getBody() as string);
    expect(bodyMessagePin1).toStrictEqual({});

    const messagePin2 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage2.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messagePin2.statusCode).toBe(OK);
    const bodyMessagePin2 = JSON.parse(messagePin2.getBody() as string);
    expect(bodyMessagePin2).toStrictEqual({});
  });

  test('correct return value in DM ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');

    const messagePin1 = request(
      'POST',
      url + ':' + port + '/message/pin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messagePin1.statusCode).toBe(OK);
    const bodyMessagePin1 = JSON.parse(messagePin1.getBody() as string);
    expect(bodyMessagePin1).toStrictEqual({});
  });
});

describe('message/unpin/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(403);
  });

  test('messageId is not a valid message within a channel that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('messageId is not a valid message within a DM that the authorised user has joined', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('authorised users do not join the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyChannel2 = httpChannelsCreate(bodyUser2.token, 'comp2521', false);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel2.channelId, '123');
    httpMessagePin(bodyUser2.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('authorised users do not join the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpDMCreate(bodyUser1.token, []);
    const bodyDM2 = httpDMCreate(bodyUser2.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser2.token, bodyDM2.dmId, 'abCabC123');
    httpMessagePin(bodyUser2.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('the message is not already pinned in channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, 'abc');

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('the message is not already pinned in DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, 'abCabC123');

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(400);
  });

  test('the authorised user does not have owner permissions in the channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    const bodyMessage1 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '451235dfas');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(403);
  });

  test('the authorised user does not have owner permissions in the DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser2.token, [bodyUser1.authUserId]);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');
    httpMessagePin(bodyUser2.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(403);
  });

  test('correct return value in channel ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser2.token, 'comp1531', false);
    httpChannelInvite(bodyUser2.token, bodyChannel1.channelId, bodyUser1.authUserId);
    const bodyMessage1 = httpMessageSend(bodyUser1.token, bodyChannel1.channelId, '451235dfas');
    const bodyMessage2 = httpMessageSend(bodyUser2.token, bodyChannel1.channelId, '435dfas');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);
    httpMessagePin(bodyUser2.token, bodyMessage2.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(OK);
    const bodyMessageUnpin1 = JSON.parse(messageUnpin1.getBody() as string);
    expect(bodyMessageUnpin1).toStrictEqual({});

    const messageUnpin2 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage2.messageId,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageUnpin2.statusCode).toBe(OK);
    const bodyMessageUnpin2 = JSON.parse(messageUnpin2.getBody() as string);
    expect(bodyMessageUnpin2).toStrictEqual({});
  });

  test('correct return value in DM ', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const bodyMessage1 = httpMessageSendDM(bodyUser1.token, bodyDM1.dmId, '451235dfas');
    httpMessagePin(bodyUser1.token, bodyMessage1.messageId);

    const messageUnpin1 = request(
      'POST',
      url + ':' + port + '/message/unpin/v1',
      {
        json: {
          messageId: bodyMessage1.messageId,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageUnpin1.statusCode).toBe(OK);
    const bodyMessageUnpin1 = JSON.parse(messageUnpin1.getBody() as string);
    expect(bodyMessageUnpin1).toStrictEqual({});
  });
});

describe('message/sendlater/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageSendlater1.statusCode).toBe(403);
  });

  test('channelId does not refer to a valid channel', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId + 1,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlater1.statusCode).toBe(400);
  });

  test('length of message is less than 1 or over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlater1.statusCode).toBe(400);

    const messageSendlater2 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlater2.statusCode).toBe(400);
  });

  test('timeSent is a time in the past', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '123',
          timeSent: timeNow - 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlater1.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel they are trying to post to', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageSendlater1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '123',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 2) {
        break;
      }
    }
    expect(messageSendlater1.statusCode).toBe(OK);
    const bodyMessageSendlater1 = JSON.parse(messageSendlater1.getBody() as string);
    expect(bodyMessageSendlater1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });

  test('tagged notifications', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyChannel1 = httpChannelsCreate(bodyUser1.token, 'comp1531', false);
    httpChannelInvite(bodyUser1.token, bodyChannel1.channelId, bodyUser2.authUserId);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlater1 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const messageSendlater2 = request(
      'POST',
      url + ':' + port + '/message/sendlater/v1',
      {
        json: {
          channelId: bodyChannel1.channelId,
          message: '451235@jonlai',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 2) {
        break;
      }
    }
    expect(messageSendlater1.statusCode).toBe(OK);
    const bodyMessageSendlater1 = JSON.parse(messageSendlater1.getBody() as string);
    expect(bodyMessageSendlater1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    expect(messageSendlater2.statusCode).toBe(OK);
    const bodyMessageSendlater2 = JSON.parse(messageSendlater2.getBody() as string);
    expect(bodyMessageSendlater2).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });
});

describe('message/sendlaterdm/v1', () => {
  test('invalid token', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token + 'a',
        }
      }
    );
    expect(messageSendlaterdm1.statusCode).toBe(403);
  });

  test('dmId does not refer to a valid DM', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId + 1,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlaterdm1.statusCode).toBe(400);
  });

  test('length of message is less than 1 or over 1000 characters', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlaterdm1.statusCode).toBe(400);

    const messageSendlaterdm2 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: 'pQP6Y7YGLnKSSD4Uq5FTbZRPoiYPbY1NOTAlfEN33HSVzv9pdr2Ng79wE82X2FO5CPXvlpkAJqf9exLQWp87HT43cnQLn8p8bXLNQZCQoC7FpsxmiXjZLdrQasoDT3ORvp8e9EReDhMYxaryhvOP3w1ueD6om5PkaOYqKbtpkJF6MjbMNtgeNI1Wr0Vd8rtSlsbFosRZb9O8j24PqWg0NFWJfkGV8fos81JiuY5guSPIhTJYrs0GOzEtrbc2GOXmXL0JIPgwSNoWQV4MM6zPHNIL7IFsfBvAKjexxvJn5i30oRA9Bk9JFZe8vbAL5KIIyG1ZBeggnMCVWtdv94mF3jZiiWwITOzEQihPBEV7oc5h9SeQKhLCG2bfzR9POOw7fLSS6zeQN1rlXfyLh9pVyukbCG8fHSFJ9pm5qxiZI03k3mktCZZo7Q78OcmaTnWxSGCsUmKZEYz17cmtEDeYfJ8pbAHUxQ3s8ExdIzliZwPkmVFmFCNbBxMRLB9A5a1gtkAxSgOg3ZK3SWxWrdecY3srQ2i1iZFzeCAPCMLTgEkFxbZ6sYPckX7PsYOVfrs9bEAbMdLOvTuQhkggSvc1R4GXOGjisFxbgow4o1j7mHR7q6VBCUnKrdDyy88nRFgkPfZpGyWVKMcveWsGBt7AAINjss9mPQyK8vBgwkp09j6Z3kA8XS37dbInwM4vTVEGgd3tE2kRretEW8tGsHhwNvWeOmzg6wBxSt2QHNdDhgoqvP8tpfYir6kToRcb1LcL2UkLUO8uyOJdqEPGlNM33YadXR4yzZns6VNgGl7OfaO7WxDr8Y8286VEpu3C1Od7Ydw8zUematvhy8mQ1YIalUVQzSk63DpXSRJcWDXl1AP1yyOv1n2Gm3MK3aZECjPXiAxhYOmg0Fano94pAE6AVi6aJfkuJiCkRf5LndspyM7toptogh4zNP6cDfZqT8gBHVU1hQbE94rkIgVcUXJotfKUsJs6f3vjnEeH1WeXJfWsqwSgN31FiBwF7EO3',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlaterdm2.statusCode).toBe(400);
  });

  test('timeSent is a time in the past', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '123',
          timeSent: timeNow - 10,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    expect(messageSendlaterdm1.statusCode).toBe(400);
  });

  test('dmId is valid and the authorised user is not a member of the DM they are trying to post to', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '123',
          timeSent: timeNow + 10,
        },
        headers: {
          token: bodyUser2.token,
        }
      }
    );
    expect(messageSendlaterdm1.statusCode).toBe(403);
  });

  test('correct return value', () => {
    httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '123',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 2) {
        break;
      }
    }
    expect(messageSendlaterdm1.statusCode).toBe(OK);
    const bodyMessageSendlaterdm1 = JSON.parse(messageSendlaterdm1.getBody() as string);
    expect(bodyMessageSendlaterdm1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    const bodyMessage1 = httpDMMessages(bodyUser1.token, bodyDM1.dmId, 0);
    expect(bodyMessage1.messages[0].messageId).toBe(bodyMessageSendlaterdm1.messageId);
    expect(bodyMessage1.messages[0].message).toBe('123');
    expect(bodyMessage1.messages[0].uId).toBe(bodyUser1.authUserId);
  });

  test('If the DM is removed before the message has sent, the message will not be sent.', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '123',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    request(
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

    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 2) {
        break;
      }
    }
    expect(messageSendlaterdm1.statusCode).toBe(OK);
    const bodyMessageSendlaterdm1 = JSON.parse(messageSendlaterdm1.getBody() as string);
    expect(bodyMessageSendlaterdm1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    // expect usersstat and workspace message = 0
  });
  test('tagged notifications', () => {
    httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyDM1 = httpDMCreate(bodyUser1.token, []);
    const timeNow = Math.floor(Date.now() / 1000);

    const messageSendlaterdm1 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '451235dfas @haydensmith @haydensmith@gmail.com@haydensmith@jonlai',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const messageSendlaterdm2 = request(
      'POST',
      url + ':' + port + '/message/sendlaterdm/v1',
      {
        json: {
          dmId: bodyDM1.dmId,
          message: '@haydensmith_1 12',
          timeSent: timeNow + 1,
        },
        headers: {
          token: bodyUser1.token,
        }
      }
    );
    while (true) {
      const time = Math.floor(Date.now() / 1000);
      if (time > timeNow + 2) {
        break;
      }
    }
    expect(messageSendlaterdm1.statusCode).toBe(OK);
    const bodyMessageSendlaterdm1 = JSON.parse(messageSendlaterdm1.getBody() as string);
    expect(bodyMessageSendlaterdm1).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));

    expect(messageSendlaterdm2.statusCode).toBe(OK);
    const bodyMessageSendlaterdm2 = JSON.parse(messageSendlaterdm2.getBody() as string);
    expect(bodyMessageSendlaterdm2).toStrictEqual(expect.objectContaining({
      messageId: expect.any(Number),
    }));
  });
});

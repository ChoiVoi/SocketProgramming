import request from 'sync-request';

import config from '../config.json';

const port = config.port;
const url = config.url;

function httpAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const user1 = request(
    'POST',
    url + ':' + port + '/auth/register/v3',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return JSON.parse(user1.getBody() as string);
}

function httpAuthLogin(email: string, password: string) {
  const user1 = request(
    'POST',
    url + ':' + port + '/auth/login/v3',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );

  return JSON.parse(user1.getBody() as string);
}

function httpChannelsCreate(token: string, name: string, isPublic: boolean) {
  const channel1 = request(
    'POST',
    url + ':' + port + '/channels/create/v3',
    {
      json: {
        name: name,
        isPublic: isPublic,
      },
      headers: {
        token: token,
      }
    }
  );
  return JSON.parse(channel1.getBody() as string);
}

function httpDMCreate(token: string, uIds: number[]) {
  const dm1 = request(
    'POST',
    url + ':' + port + '/dm/create/v2',
    {
      json: {
        uIds: uIds,
      },
      headers: {
        token: token,
      }
    }
  );
  return JSON.parse(dm1.getBody() as string);
}

function httpMessageSend(token: string, channelId: number, message: string) {
  const message1 = request(
    'POST',
    url + ':' + port + '/message/send/v2',
    {
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
  return JSON.parse(message1.getBody() as string);
}

function httpMessageSendDM(token: string, dmId: number, message: string) {
  const message1 = request(
    'POST',
    url + ':' + port + '/message/senddm/v2',
    {
      json: {
        dmId: dmId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );

  return JSON.parse(message1.getBody() as string);
}

function httpUserProfile(token: string, uId: number) {
  const user1Profile = request(
    'GET',
    url + ':' + port + '/user/profile/v3',
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );

  return JSON.parse(user1Profile.getBody() as string);
}

function httpChannelInvite (token: string, channelId: number, uId: number) {
  request(
    'POST',
    url + ':' + port + '/channel/invite/v3',
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );
}

function httpDMMessages (token: string, dmId: number, start: number) {
  const messages1 = request(
    'GET',
    url + ':' + port + '/dm/messages/v2',
    {
      qs: {
        dmId: dmId,
        start: start,
      },
      headers: {
        token: token,
      }
    }
  );
  return JSON.parse(messages1.getBody() as string);
}

function httpChannelMessages (token: string, channelId: number, start: number) {
  const messages1 = request(
    'GET',
    url + ':' + port + '/channel/messages/v3',
    {
      qs: {
        channelId: channelId,
        start: start,
      },
      headers: {
        token: token,
      }
    }
  );
  return JSON.parse(messages1.getBody() as string);
}

function httpMessageReact (token: string, messageId: number, reactId: number) {
  request(
    'POST',
    url + ':' + port + '/message/react/v1',
    {
      json: {
        messageId: messageId,
        reactId: reactId,
      },
      headers: {
        token: token,
      }
    }
  );
}

function httpMessagePin (token: string, messageId: number) {
  request(
    'POST',
    url + ':' + port + '/message/pin/v1',
    {
      json: {
        messageId: messageId,
      },
      headers: {
        token: token,
      }
    }
  );
}

function httpChannelLeave(token: string, channelId: number) {
  request(
    'POST',
    url + ':' + port + '/channel/leave/v2',
    {
      json: {
        channelId: channelId,
      },
      headers: {
        token: token,
      }
    }
  );
}

function httpDMLeave(token: string, dmId: number) {
  request(
    'POST',
    url + ':' + port + '/dm/leave/v2',
    {
      json: {
        dmId: dmId,
      },
      headers: {
        token: token,
      }
    }
  );
}
export {
  httpAuthRegister, httpAuthLogin, httpChannelsCreate,
  httpDMCreate, httpMessageSend, httpMessageSendDM, httpUserProfile,
  httpChannelInvite, httpDMMessages, httpChannelMessages, httpMessageReact,
  httpMessagePin, httpChannelLeave, httpDMLeave
};

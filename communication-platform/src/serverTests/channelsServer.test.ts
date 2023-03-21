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

describe('channelsCreateV1 test', () => {
  test('correct return value', () => {
    const bodyUser4 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const channel = request(
      'POST',
      url + ':' + port + '/channels/create/v3',
      {
        json: {
          name: 'channelName',
          isPublic: true,
        },
        headers: {
          token: bodyUser4.token,
        }
      }
    );
    const channelBody = JSON.parse(channel.getBody() as string);
    expect(channel.statusCode).toBe(OK);
    expect(channelBody).toStrictEqual(expect.objectContaining({
      channelId: expect.any(Number),
    }));
  });

  test('length of name is more than 20', () => {
    const bodyUser4 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const channel = request(
      'POST',
      url + ':' + port + '/channels/create/v3',
      {
        json: {
          name: 'Comp15231231231231312312331',
          isPublic: true,
        },
        headers: {
          token: bodyUser4.token,
        }
      }
    );

    expect(channel.statusCode).toEqual(400);
  });

  test('length of name is less than 1', () => {
    const bodyUser4 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const channel = request(
      'POST',
      url + ':' + port + '/channels/create/v3',
      {
        json: {
          name: '',
          isPublic: true,
        },
        headers: {
          token: bodyUser4.token,
        }
      }
    );

    expect(channel.statusCode).toEqual(400);
  });

  test('Incorrect token', () => {
    httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const channel = request(
      'POST',
      url + ':' + port + '/channels/create/v3',
      {
        json: {
          token: 'token',
          name: 'COMP1511',
          isPublic: true,
        },
        headers: {
          token: 'token',
        }
      }
    );

    expect(channel.statusCode).toEqual(403);
  });
});

describe('channelsListV1 test', () => {
  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');
    const bodyUser2 = httpAuthRegister('email6@gmail.com', '123123', 'abc', 'efg3');

    const channel1Body = httpChannelsCreate(bodyUser1.token, 'COMP1531', true);
    const channel2Body = httpChannelsCreate(bodyUser1.token, 'COMP2521', false);
    const channel3Body = httpChannelsCreate(bodyUser2.token, 'COMP1511', false);

    const channels1 = {
      channels: [
        {
          channelId: channel1Body.channelId,
          name: 'COMP1531',
        },
        {
          channelId: channel2Body.channelId,
          name: 'COMP2521',
        }
      ],
    };

    const channelUser1List = request(
      'GET',
      url + ':' + port + '/channels/list/v3',
      {
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channelUser1body = JSON.parse(channelUser1List.getBody() as string);
    expect(channelUser1List.statusCode).toBe(OK);
    expect(new Set(channelUser1body.channels)).toStrictEqual(new Set(channels1.channels));

    const channels2 = {
      channels: [
        {
          channelId: channel3Body.channelId,
          name: 'COMP1511',
        }
      ],
    };

    const channelUser2List = request(
      'GET',
      url + ':' + port + '/channels/list/v3',
      {
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const channelUser2body = JSON.parse(channelUser2List.getBody() as string);
    expect(channelUser2List.statusCode).toBe(OK);
    expect(new Set(channelUser2body.channels)).toStrictEqual(new Set(channels2.channels));
  });

  test('correct return value with no channels joined', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');
    const bodyUser2 = httpAuthRegister('email6@gmail.com', '123123', 'abc', 'efg3');

    httpChannelsCreate(bodyUser1.token, 'COMP1531', true);

    const channelUser2List = request(
      'GET',
      url + ':' + port + '/channels/list/v3',
      {
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const channelUser2body = JSON.parse(channelUser2List.getBody() as string);
    expect(channelUser2List.statusCode).toBe(OK);
    expect(channelUser2body).toStrictEqual(expect.objectContaining({
      channels: [],
    }));
  });

  test('Incorrect token', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    httpChannelsCreate(bodyUser1.token, 'COMP1531', true);

    const channelUser2List = request(
      'GET',
      url + ':' + port + '/channels/list/v3',
      {
        headers: {
          token: 'token',
        }
      }
    );

    expect(channelUser2List.statusCode).toEqual(403);
  });
});

describe('channelsListallV1 test', () => {
  test('correct return value', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');
    const bodyUser2 = httpAuthRegister('email6@gmail.com', '123123', 'abc', 'efg3');

    const channel1Body = httpChannelsCreate(bodyUser1.token, 'COMP1531', true);
    const channel2Body = httpChannelsCreate(bodyUser2.token, 'COMP2521', false);
    const channel3Body = httpChannelsCreate(bodyUser2.token, 'COMP1511', false);

    const chan = {
      channels: [
        {
          channelId: channel1Body.channelId,
          name: 'COMP1531',
        },
        {
          channelId: channel2Body.channelId,
          name: 'COMP2521',
        },
        {
          channelId: channel3Body.channelId,
          name: 'COMP1511',
        }
      ],
    };

    const channelUser1List = request(
      'GET',
      url + ':' + port + '/channels/listall/v3',
      {
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channel1body = JSON.parse(channelUser1List.getBody() as string);
    expect(channelUser1List.statusCode).toBe(OK);
    expect(new Set(channel1body.channels)).toStrictEqual(new Set(chan.channels));

    const channelUser2List = request(
      'GET',
      url + ':' + port + '/channels/listall/v3',
      {
        headers: {
          token: bodyUser2.token,
        }
      }
    );

    const channel2body = JSON.parse(channelUser2List.getBody() as string);
    expect(channelUser2List.statusCode).toBe(OK);
    expect(new Set(channel2body.channels)).toStrictEqual(new Set(chan.channels));
  });

  test('correct return value with no channels created', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    const channelUser1List = request(
      'GET',
      url + ':' + port + '/channels/listall/v3',
      {
        headers: {
          token: bodyUser1.token,
        }
      }
    );

    const channel1body = JSON.parse(channelUser1List.getBody() as string);
    expect(channelUser1List.statusCode).toBe(OK);
    expect(channel1body).toStrictEqual(expect.objectContaining({
      channels: [],
    }));
  });

  test('Incorrect token', () => {
    const bodyUser1 = httpAuthRegister('email5@gmail.com', '123123', 'abc', 'efg3');

    httpChannelsCreate(bodyUser1.token, 'COMP1531', true);

    const channelUser2List = request(
      'GET',
      url + ':' + port + '/channels/listall/v3',
      {
        headers: {
          token: 'token',
        }
      }
    );

    expect(channelUser2List.statusCode).toEqual(403);
  });
});

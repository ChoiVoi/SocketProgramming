import request from 'sync-request';

import config from '../config.json';

import { httpAuthRegister, httpChannelsCreate, httpDMCreate } from './helperTest';

const OK = 200;
const port = config.port;
const url = config.url;

describe('clearV1 test', () => {
  test('clear Id and channel', () => {
    httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    const clear1 = request(
      'DELETE',
      url + ':' + port + '/clear/v1',
      {
        qs: {}
      }
    );
    const bodyClear1 = JSON.parse(clear1.getBody() as string);

    expect(clear1.statusCode).toBe(OK);
    expect(bodyClear1).toStrictEqual({});
  });

  test('clear channel list all', () => {
    const bodyUser1 = httpAuthRegister('userone@gmail.com', 'password', 'User', 'One');

    httpChannelsCreate(bodyUser1.token, 'COMP1531', true);

    const clear1 = request(
      'DELETE',
      url + ':' + port + '/clear/v1',
      {
        qs: {}
      }
    );
    const bodyClear1 = JSON.parse(clear1.getBody() as string);

    expect(clear1.statusCode).toBe(OK);
    expect(bodyClear1).toStrictEqual({});
  });

  test('clear dms', () => {
    const bodyUser1 = httpAuthRegister('user1@gmail.com', 'cjkadsnfd', 'Hayden', 'Smith');
    const bodyUser2 = httpAuthRegister('user2@gmail.com', 'cjkadsnfd', 'Jon', 'Lai');

    const uIds = [bodyUser2.authUserId];

    httpDMCreate(bodyUser1.token, uIds);

    const clear1 = request(
      'DELETE',
      url + ':' + port + '/clear/v1',
      {
        qs: {}
      }
    );
    const bodyClear1 = JSON.parse(clear1.getBody() as string);

    expect(clear1.statusCode).toBe(OK);
    expect(bodyClear1).toStrictEqual({});
  });
});

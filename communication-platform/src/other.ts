import { getData, setData } from './dataStore';
/**
 * Resets the internal data of the application to its initial state
 * @returns {{}}
 */

function clearV1(): Record<string, never> {
  let data = getData();
  data = {
    users: {},
    channels: [],
    dms: [],
    totalMessages: 0,
    totalTokens: 0,
    workspaceStats: {
      channelsExist: [],
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 0,
    },
    currentMessages: 0,
    currentDMs: 0,
    totalResetCodes: 0,
  };
  setData(data);

  return {};
}

export { clearV1 };

import * as fs from 'fs';

interface notification {
  'channelId': number;
  'dmId': number;
  'notificationMessage': string;
}

interface channelsJoined {
  'numChannelsJoined': number;
  'timeStamp': number;
}

interface dmsJoined {
  'numDmsJoined': number;
  'timeStamp': number;
}

interface messagesSent {
  'numMessagesSent': number;
  'timeStamp': number;
}

interface userStats {
  'channelsJoined': channelsJoined[];
  'dmsJoined': dmsJoined[];
  'messagesSent': messagesSent[];
  'involvementRate': number;
}

interface email {
  'uId': number;
  'permissionId': number;
  'password': string;
  'nameFirst': string;
  'nameLast': string;
  'handleStr': string;
  'channelsIdList': number[];
  'dmIdList': number[];
  'tokenList': string[];
  'isRemoved': boolean;
  'resetCode': string;
  'notifications': notification[];
  'profileImgUrl': string;
  'userStats': userStats;
  'totalMessagesSent': number;
}

interface userP {
  'uId': number;
  'email': string;
  'nameFirst': string;
  'nameLast': string;
  'handleStr': string;
  'profileImgUrl' : string;
}

interface user {
  [key:string]: email;
}

interface react {
  'reactId': number;
  'uIds': number[];
  'isThisUserReacted': boolean;
}

interface messages {
  'messageId': number;
  'uId': number;
  'message': string;
  'timeSent': number;
  'reacts': react[];
  'isPinned': boolean;
}

interface standup {
  'uId': number;
  'isActive': boolean;
  'timeFinish': number;
  'handles': string[];
  'messages': string[];
}

interface channels {
  'channelId': number;
  'nameChannel': string;
  'isPublic': boolean;
  'ownersIdList': number[];
  'membersIdList': number[];
  'messagesList': messages[];
  'standup': standup;
}

interface channel {
  'channelId': number;
  'name': string;
}

interface dms {
  'dmId': number;
  'nameDM': string;
  'creatorId': number;
  'membersIdList': number[];
  'messagesList': messages[];
}

interface dm {
  'dmId': number;
  'name': string;
}

interface channelsExist {
  'numChannelsExist': number;
  'timeStamp': number;
}

interface dmsExist {
  'numDmsExist': number;
  'timeStamp': number;
}

interface messagesExist {
  'numMessagesExist': number;
  'timeStamp': number;
}

interface workspaceStats {
  'channelsExist': channelsExist[];
  'dmsExist': dmsExist[];
  'messagesExist': messagesExist[];
  'utilizationRate': number;
}

interface dataType {
  'users': user;
  'channels': channels[];
  'dms': dms[];
  'totalMessages': number;
  'totalTokens': number;
  'workspaceStats': workspaceStats;
  'currentMessages' : number;
  'currentDMs': number;
  'totalResetCodes': number;
}

let data: dataType = {
  users: {},
  channels: [],
  dms: [],
  totalMessages: 0,
  totalTokens: 0,
  workspaceStats: {
    channelsExist: [],
    dmsExist: [],
    messagesExist: [],
    utilizationRate: 0
  },
  currentMessages: 0,
  currentDMs: 0,
  totalResetCodes: 0,
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  data = JSON.parse(String(fs.readFileSync('data.json', { flag: 'r' })));
  return data;
  // return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataType) {
  data = newData;
  fs.writeFileSync('data.json', JSON.stringify(newData, null, 4), { flag: 'w' });
}

// data = newData;

export {
  getData, setData, dataType, messages, userP, email, channels,
  dm, channel, notification, standup, userStats, workspaceStats
};

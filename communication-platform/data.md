```javascript
// Users
// users are object that stores different email as a unique object
// owners of Treats are with permissionId 1
// channelsIdList stores all the Id of channels the user has joined
let data = {
        'users': {
                'hayhay123@gmail.com': {
                        'uId': 0,
                        'permissionId': 1,
                        'nameFirst': 'Hayden',
                        'nameLast': 'Smith',
                        'handleStr': 'haydensmith',
                        'password': 'abcd1234',
                        'channelsIdList': [0, 1, 2],
                        'dmIdList': [0, 1, 2],
                        'tokenList': ['rewt-3423-asds-fggf', 'jrrt-3243-asds-infe']
                },
                'z123456@gmail.com': {
                        'uId': 1,
                        'permissionId': 2,
                        'nameFirst': 'Hayden',
                        'nameLast': 'Smith',
                        'handleStr': 'haydensmith',
                        'password': 'abcd1234',
                        'channelsIdList': [0, 1, 2],
                        'dmIdList': [0, 1, 2]
                        'tokenList': ['8423-3423-asds-3241', '8dd3-3243-asds-3241']
                },
                
        },

// Channels 
// channels are array of obejcts with different channels
// ownersIdList stores the Id of the owners
// membersIdList stores the Id of the members including owners
// messageList is an array that stores all the messages in the chat from new to old

        'channels': [
                {
                        'channelId': 0,
                        'nameChannel': 'COMP1531',
                        'isPublic': false,
                        'ownersIdList': [0, 1],
                        'membersIdList': [0, 1, 2, 3, 4],
                        'messagesList': [
                                {
                                      'messageId': 0,
                                      'uId': 3,
                                      'message': 'abc',
                                      'timeSent': 1655623409167
                                },
                                {
                                        'messageId': 1,
                                        'uId': 0,
                                        'message': '123',
                                        'timeSent': 1655623409164
                                },
                        ],
                },
                {
                        'channelId': 1,
                        'nameChannel': 'COMP2521',
                        'isPublic': true,
                        'ownersIdList': [0, 1],
                        'membersIdList': [0, 1, 2, 3, 4],
                        'messagesList': [
                                {
                                      'messageId': 2,
                                      'uId': 3,
                                      'message': 'abc',
                                      'timeSent': 1655623409167
                                },
                                {
                                        'messageId': 3,
                                        'uId': 0,
                                        'message': '123',
                                        'timeSent': 1655623409164
                                },
                        ],
                },
        ],

        'dms': [
                {
                        'dmId': 0,
                        'nameDM': 'haydensmith, jonlai',
                        'creatorId': 0,
                        'membersIdList': [0, 1],
                        'messagesList': [
                                {
                                      'messageId': 4,
                                      'uId': 3,
                                      'message': 'abc',
                                      'timeSent': 1655623409167
                                },
                                {
                                        'messageId': 5,
                                        'uId': 0,
                                        'message': '123',
                                        'timeSent': 1655623409164
                                },
                        ]
                },
        ],

        'totalMessages': 6,
}
```

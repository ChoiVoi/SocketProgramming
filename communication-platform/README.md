# COMMUNICATION PLATFORM

### Running the server

To run the server, you can run the following command from the root directory of your project:

```bash
npm start
```

This will start the server on the port in the `src/server.ts` file, using `ts-node`.

### Input/Output types

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
</table>

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>length</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
  <tr>
    <td>has prefix <b>time</b></td>
    <td>integer (unix timestamp in seconds), <a href="https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript">[check this out]</a></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent }</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>channels</b></td>
    <td>Array of objects, where each object contains types { channelId, name }</td>
  </tr>
  <tr>
    <td>has suffix <b>Str</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>members</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>users</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
</table>

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>token</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>dms</b></td>
    <td>Array of objects, where each object contains types { dmId, name }</td>
  </tr>
  <tr>
    <td>named exactly <b>uIds</b></td>
    <td>Array of user ids</td>
  </tr>
</table>

<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>contains substring <b>code</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>Id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has prefix <b>num</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Rate</b></td>
    <td>float between 0 and 1 inclusive</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>userStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsJoined: [{numChannelsJoined, timeStamp}],<br/>
    &emsp;dmsJoined: [{numDmsJoined, timeStamp}], <br />
    &emsp;messagesSent: [{numMessagesSent, timeStamp}], <br />
    &emsp;involvementRate <br />
    }
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>workspaceStats</b></td>
    <td> Object of shape {<br />
    &emsp;channelsExist: [{numChannelsExist, timeStamp}], <br />
    &emsp;dmsExist: [{numDmsExist, timeStamp}], <br />
    &emsp;messagesExist: [{numMessagesExist, timeStamp}], <br />
    &emsp;utilizationRate <br />
    }
    </td>
  </tr>
  <tr>
    <td>has suffix <b>End</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>has suffix <b>Url</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>reacts</b></td>
    <td>Array of objects, where each object contains types { reactId, uIds, isThisUserReacted } where: 
      <ul>
        <li>reactId is the id of a react</li>
        <li>uIds is an array of user id's of people who've reacted for that react</li>
        <li>isThisUserReacted is whether or not the authorised user (user making the request) currently has one of the reacts to this message</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>notifications</b></td>
    <td>Array of objects, where each object contains types { channelId, dmId, notificationMessage } where 
      <ul>
        <li>channelId is the id of the channel that the event happened in, and is <code>-1</code> if it is being sent to a DM</li>
        <li>dmId is the DM that the event happened in, and is <code>-1</code> if it is being sent to a channel</li>
        <li>notificationMessage is a string of the following format for each trigger action:</li>
        <ul>
          <li>tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"</li>
          <li>reacted message: "{User’s handle} reacted to your message in {channel/DM name}"</li>
          <li>added to a channel/DM: "{User’s handle} added you to {channel/DM name}"</li>
        </ul>
      </ul>
    </td>
  </tr>
  <tr>
    <td>(Iteration 3) (outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr, profileImgUrl</td>
  </tr>
  <tr>
    <td>(Iteration 3) (outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent, reacts, isPinned  }</td>
  </tr>
</table>

### 6.2. Interface

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Exceptions</th>
  </tr>
  <tr>
    <td><code>auth/login/v3</code><br /><br />Given a registered user's email and password, returns their `authUserId` value.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( email, password )</code><br /><br /><b>Return type if no error:</b><br /><code>{ token, authUserId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>email entered does not belong to a user</li>
        <li>password is not correct</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>auth/register/v3</code><br /><br />Given a user's first and last name, email address, and password, create a new account for them and return a new `authUserId`.<br /><br />A handle is generated that is the concatenation of their casted-to-lowercase alphanumeric (a-z0-9) first name and last name (i.e. make lowercase then remove non-alphanumeric characters). If the concatenation is longer than 20 characters, it is cut off at 20 characters. Once you've concatenated it, if the handle is once again taken, append the concatenated names with the smallest number (starting from 0) that forms a new handle that isn't already taken. The addition of this final number may result in the handle exceeding the 20 character limit (the handle 'abcdefghijklmnopqrst0' is allowed if the handle 'abcdefghijklmnopqrst' is already taken).</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( email, password, nameFirst, nameLast )</code><br /><br /><b>Return type if no error:</b><br /><code>{ token, authUserId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>email entered is not a valid email (more in section 6.4)</li>
        <li>email address is already being used by another user</li>
        <li>length of password is less than 6 characters</li>
        <li>length of nameFirst is not between 1 and 50 characters inclusive</li>
        <li>length of nameLast is not between 1 and 50 characters inclusive</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channels/create/v3</code><br /><br />Creates a new channel with the given name that is either a public or private channel. The user who created it automatically joins the channel.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( name, isPublic )</code><br /><br /><b>Return type if no error:</b><br /><code>{ channelId }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>length of name is less than 1 or more than 20 characters</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channels/list/v3</code><br /><br />Provide an array of all channels (and their associated details) that the authorised user is part of.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ channels }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>channels/listall/v3</code><br /><br />Provide an array of all channels, including private channels, (and their associated details)</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ channels }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>channel/details/v3</code><br /><br />Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( channelId )</code><br /><br /><b>Return type if no error:</b><br /><code>{ name, isPublic, ownerMembers, allMembers }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>channelId does not refer to a valid channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channel/join/v3</code><br /><br />Given a channelId of a channel that the authorised user can join, adds them to that channel.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( channelId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>the authorised user is already a member of the channel</li>
        </ul>
        <b>403 Error</b> when:
        <ul>
        <li>channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channel/invite/v3</code><br /><br />Invites a user with ID uId to join a channel with ID channelId. Once invited, the user is added to the channel immediately. In both public and private channels, all members are able to invite users.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( channelId, uId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>uId does not refer to a valid user</li>
        <li>uId refers to a user who is already a member of the channel</li>
        </ul>
        <b>403 Error</b> when:
        <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channel/messages/v3</code><br /><br />Given a channel with ID channelId that the authorised user is a member of, return up to 50 messages between index "start" and "start + 50". Message with index 0 is the most recent message in the channel. This function returns a new index "end" which is the value of "start + 50", or, if this function has returned the least recent messages in the channel, returns -1 in "end" to indicate there are no more messages to load after this return.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( channelId, start )</code><br /><br /><b>Return type if no error:</b><br /><code>{ messages, start, end }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>start is greater than the total number of messages in the channel</li>
      </ul>
      <b>403 Error</b> when any of:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>user/profile/v3</code><br /><br />For a valid user, returns information about their userId, email, first name, last name, and handle
    </td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( uId )</code><br /><br /><b>Return type if no error:</b><br /><code>{ user }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>uId does not refer to a valid user</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>clear/v1</code><br /><br />Resets the internal data of the application to its initial state</td>
    <td style="font-weight: bold; color: red;">DELETE</td>
    <td><b>Parameters:</b><br /><code>()</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>auth/logout/v2</code><br /><br />Given an active token, invalidates the token to log the user out.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>channel/leave/v2</code><br /><br />Given a channel with ID channelId that the authorised user is a member of, remove them as a member of the channel. Their messages should remain in the channel. If the only channel owner leaves, the channel will remain.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when:
        <ul>
          <li>channelId does not refer to a valid channel</li>
          <li>the authorised user is the starter of an active standup in the channel</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
          <li>channelId is valid and the authorised user is not a member of the channel</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>channel/addowner/v2</code><br /><br />Make user with user id uId an owner of the channel.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, uId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code>
    </td>
    <td>
      <b>400 Error</b> when any of:
        <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>uId does not refer to a valid user</li>
        <li>uId refers to a user who is not a member of the channel</li>
        <li>uId refers to a user who is already an owner of the channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user does not have owner permissions in the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channel/removeowner/v2</code><br /><br />Remove user with user id uId as an owner of the channel.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, uId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>uId does not refer to a valid user</li>
        <li>uId refers to a user who is not an owner of the channel</li>
        <li>uId refers to a user who is currently the only owner of the channel</li>
      </ul>
      <b>403 Error</b> when any of:
      <ul>
        <li>channelId is valid and the authorised user does not have owner permissions in the channel</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/send/v2</code><br /><br />Send a message from the authorised user to the channel specified by channelId. Note: Each message should have its own unique ID, i.e. no messages should share an ID with another message, even if that other message is in a different channel.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, message }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>length of message is less than 1 or over 1000 characters</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/edit/v2</code><br /><br />Given a message, update its text with new text. If the new message is an empty string, the message is deleted. <b>NEW IN ITERATION 3</b>: If a shared/standup message is edited, the entire contents will be edited as if it was a normal message.</td>
    <td style="font-weight: bold; color: brown;">PUT</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId, message }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>
        <li>length of message is over 1000 characters</li>
        <li>messageId does not refer to a valid message within a channel/DM that the authorised user has joined</li>
      </ul>
      <b>403 Error</b> when any of:
      <ul>
        <li>If the authorised user does not have owner permissions, and the message was not sent by them</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/remove/v2</code><br /><br />Given a messageId for a message, this message is removed from the channel/DM</td>
    <td style="color: red; font-weight: bold;">DELETE</td>
    <td><b>Query Parameters:</b><br /><code>( messageId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
        <li>messageId does not refer to a valid message within a channel/DM that the authorised user has joined</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
        <li>If the authorised user does not have owner permissions, and the message was not sent by them</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>dm/create/v2</code><br /><br /><code>uIds</code> contains the user(s) that this DM is directed to, and will not include the creator. The creator is the owner of the DM. <code>name</code> should be automatically generated based on the users that are in this DM. The name should be an alphabetically-sorted, comma-and-space-separated concatenation of user handles, e.g. 'ahandle1, bhandle2, chandle3'.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ uIds }</code><br /><br /><b>Return type if no error:</b><br /><code>{ dmId }</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
        <li>any uId in uIds does not refer to a valid user</li>
        <li>there are duplicate 'uId's in uIds</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>dm/list/v2</code><br /><br />Returns the array of DMs that the user is a member of.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ dms }</code></td>
    <td> N/A </td>
  </tr>
  <tr>
    <td><code>dm/remove/v2</code><br /><br />Remove an existing DM, so all members are no longer in the DM. This can only be done by the original creator of the DM.</td>
    <td style="color: red; font-weight: bold;">DELETE</td>
    <td><b>Query Parameters:</b><br /><code>( dmId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when:
        <ul>  
         <li>dmId does not refer to a valid DM</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
        <li>dmId is valid and the authorised user is not the original DM creator</li>
        <li>dmId is valid and the authorised user is no longer in the DM</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>dm/details/v2</code><br /><br />Given a DM with ID dmId that the authorised user is a member of, provide basic details about the DM.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( dmId )</code><br /><br /><b>Return type if no error:</b><br /><code>{ name, members }</code></td>
    <td>
      <b>400 Error</b> when:
        <ul>  
         <li>dmId does not refer to a valid DM</li>
        </ul>
      <b>403 Error</b> when:
        <ul>
        <li>dmId is valid and the authorised user is not a member of the DM</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>dm/leave/v2</code><br /><br />Given a DM ID, the user is removed as a member of this DM. The creator is allowed to leave and the DM will still exist if this happens. This does not update the name of the DM.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ dmId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>dmId does not refer to a valid DM</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
          <li>dmId is valid and the authorised user is not a member of the DM</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>dm/messages/v2</code><br /><br />Given a DM with ID dmId that the authorised user is a member of, return up to 50 messages between index "start" and "start + 50". Message with index 0 is the most recent message in the DM. This function returns a new index "end" which is the value of "start + 50", or, if this function has returned the least recent messages in the DM, returns -1 in "end" to indicate there are no more messages to load after this return.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( dmId, start )</code><br /><br /><b>Return type if no error:</b><br /><code>{ messages, start, end }</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>dmId does not refer to a valid DM</li>
          <li>start is greater than the total number of messages in the channel</li>
        </ul>
        <b>403 Error</b> when any of:
        <ul>
          <li>dmId is valid and the authorised user is not a member of the DM</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/senddm/v2</code><br /><br />Send a message from authorisedUser to the DM specified by dmId. Note: Each message should have it's own unique ID, i.e. no messages should share an ID with another message, even if that other message is in a different channel or DM.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ dmId, message }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>dmId does not refer to a valid DM</li>
          <li>length of message is less than 1 or over 1000 characters</li>
        </ul>
      <b>403 Error</b> when any of:
        <ul>
          <li>dmId is valid and the authorised user is not a member of the DM</li>
        </ul> 
    </td>
  </tr>
  <tr>
    <td><code>users/all/v2</code><br /><br />Returns an array of all users and their associated details.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ users }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>user/profile/setname/v2</code><br /><br />Update the authorised user's first and last name</td>
    <td style="font-weight: bold; color: brown;">PUT</td>
    <td><b>Body Parameters:</b><br /><code>{ nameFirst, nameLast }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>length of nameFirst is not between 1 and 50 characters inclusive</li>
          <li>length of nameLast is not between 1 and 50 characters inclusive</li>
        </ul>
  </tr>
  <tr>
    <td><code>user/profile/setemail/v2</code><br /><br />Update the authorised user's email address</td>
    <td style="font-weight: bold; color: brown;">PUT</td>
    <td><b>Body Parameters:</b><br /><code>{ email }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>email entered is not a valid email (more in section 6.4)</li>
          <li>email address is already being used by another user</li>
        </ul>
  </tr>
  <tr>
    <td><code>user/profile/sethandle/v2</code><br /><br />Update the authorised user's handle (i.e. display name)</td>
    <td style="font-weight: bold; color: brown;">PUT</td>
    <td><b>Body Parameters:</b><br /><code>{ handleStr }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
        <ul>  
          <li>length of handleStr is not between 3 and 20 characters inclusive</li>
          <li>handleStr contains characters that are not alphanumeric</li>
          <li>the handle is already used by another user</li> 
        </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Exceptions</th>
  </tr>
  <tr>
    <td><code>notifications/get/v1</code><br /><br />Return the user's most recent 20 notifications, ordered from most recent to least recent.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ notifications }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>search/v1</code><br /><br />Given a query string, return a collection of messages in all of the channels/DMs that the user has joined that contain the query (case-insensitive). There is no expected order for these messages.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( queryStr )</code><br /><br /><b>Return type if no error:</b><br /><code>{ messages }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>length of queryStr is less than 1 or over 1000 characters</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/share/v1</code><br /><br /><code>ogMessageId</code> is the ID of the original message. <code>channelId</code> is the channel that the message is being shared to, and is <code>-1</code> if it is being sent to a DM. <code>dmId</code> is the DM that the message is being shared to, and is <code>-1</code> if it is being sent to a channel. <code>message</code> is the optional message in addition to the shared message, and will be an empty string <code>''</code> if no message is given.<br /><br />
    A new message containing the contents of both the original message and the optional message should be sent to the channel/DM identified by the channelId/dmId. The format of the new message does not matter as long as both the original and optional message exist as a substring within the new message. Once sent, this new message has no link to the original message, so if the original message is edited/deleted, no change will occur for the new message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ ogMessageId, message, channelId, dmId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ sharedMessageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>both channelId and dmId are invalid</li>
        <li>neither channelId nor dmId are -1
        <li>ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined</li>
        <li>length of message is more than 1000 characters</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the pair of channelId and dmId are valid (i.e. one is -1, the other is valid) and the authorised user has not joined the channel or DM they are trying to share the message to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/react/v1</code><br /><br />Given a message within a channel or DM the authorised user is part of, add a "react" to that particular message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId, reactId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>messageId is not a valid message within a channel or DM that the authorised user has joined</li>
        <li>reactId is not a valid react ID - currently, the only valid react ID the frontend has is 1</li>
        <li>the message already contains a react with ID reactId from the authorised user</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/unreact/v1</code><br /><br />Given a message within a channel or DM the authorised user is part of, remove a "react" to that particular message.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId, reactId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>messageId is not a valid message within a channel or DM that the authorised user has joined</li>
        <li>reactId is not a valid react ID</li>
        <li>the message does not contain a react with ID reactId from the authorised user</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/pin/v1</code><br /><br />Given a message within a channel or DM, mark it as "pinned".</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>messageId is not a valid message within a channel or DM that the authorised user has joined</li>
        <li>the message is already pinned</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/unpin/v1</code><br /><br />Given a message within a channel or DM, remove its mark as "pinned".</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ messageId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>messageId is not a valid message within a channel or DM that the authorised user has joined</li>
        <li>the message is not already pinned</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>messageId refers to a valid message in a joined channel/DM and the authorised user does not have owner permissions in the channel/DM</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/sendlater/v1</code><br /><br />Send a message from the authorised user to the channel specified by channelId automatically at a specified time in the future. The returned messageId will only be considered valid for other actions (editing/deleting/reacting/etc) once it has been sent (i.e. after timeSent).</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, message, timeSent }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>length of message is less than 1 or over 1000 characters</li>
        <li>timeSent is a time in the past</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel they are trying to post to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>message/sendlaterdm/v1</code><br /><br />Send a message from the authorised user to the DM specified by dmId automatically at a specified time in the future. The returned messageId will only be considered valid for other actions (editing/deleting/reacting/etc) once it has been sent (i.e. after timeSent). If the DM is removed before the message has sent, the message will not be sent.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ dmId, message, timeSent }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messageId }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>dmId does not refer to a valid DM</li>
        <li>length of message is less than 1 or over 1000 characters</li>
        <li>timeSent is a time in the past</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>dmId is valid and the authorised user is not a member of the DM they are trying to post to</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/start/v1</code><br /><br />For a given channel, start a standup period lasting <code>length</code> seconds. <br /><br />
    During this standup period, if someone calls <code>standup/send</code> with a message, it will be buffered during the <code>length</code>-second window. Then, at the end of the standup, all buffered messages are packaged into one message, and this packaged message is sent to the channel from the user who started the standup: see section 6.13. for more details. If no standup messages are sent during the standup, no message should be sent at the end.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, length }</code><br /><br /><b>Return type if no error:</b><br /><code>{ timeFinish }</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>length is a negative integer</li>
        <li>an active standup is currently running in the channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/active/v1</code><br /><br />For a given channel, return whether a standup is active in it, and what time the standup finishes. If no standup is active, then timeFinish should be <code>null</code>.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( channelId )</code><br /><br /><b>Return type if no error:</b><br /><code>{ isActive, timeFinish }</code></td>
    <td>
      <b>400 Error</b> when:
      <ul>
        <li>channelId does not refer to a valid channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>standup/send/v1</code><br /><br />For a given channel, if a standup is currently active in the channel, send a message to get buffered in the standup queue. Note: @ tags should not be parsed as proper tags (i.e. no notification should be triggered on send, or when the standup finishes)</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ channelId, message }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>channelId does not refer to a valid channel</li>
        <li>length of message is over 1000 characters</li>
        <li>an active standup is not currently running in the channel</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>channelId is valid and the authorised user is not a member of the channel</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>auth/passwordreset/request/v1</code><br /><br />Given an email address, if the email address belongs to a registered user, send them an email containing a secret password reset code. This code, when supplied to <code>auth/passwordreset/reset</code>, shows that the user trying to reset the password is the who got sent this email. No error should be raised when given an invalid email, as that would pose a security/privacy concern. When a user requests a password reset, they should be logged out of all current sessions.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ email }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      N/A
    </td>
  </tr>
  <tr>
    <td><code>auth/passwordreset/reset/v1</code><br /><br />Given a reset code for a user, set that user's new password to the password provided. Once a reset code has been used, it is then invalidated.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ resetCode, newPassword }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>resetCode is not a valid reset code</li>
        <li>password entered is less than 6 characters long</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>user/profile/uploadphoto/v1</code><br /><br />Given a URL of an image on the internet, crop the image within bounds (xStart, yStart) and (xEnd, yEnd). Position (0,0) is the top left. Please note: the URL needs to be a non-https URL (it should just have "http://" in the URL). We will only test with non-https URLs.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>{ imgUrl, xStart, yStart, xEnd, yEnd }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>imgUrl returns an HTTP status other than 200, or any other errors occur when attempting to retrieve the image</li>
        <li>any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL</li>
        <li>xEnd is less than or equal to xStart or yEnd is less than or equal to yStart</li>
        <li>image uploaded is not a JPG</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>user/stats/v1</code><br /><br />Fetch the required statistics about this user's use of UNSW Treats.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ userStats }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>users/stats/v1</code><br /><br />Fetch the required statistics about the workspace's use of UNSW Treats.</td>
    <td style="font-weight: bold; color: green;">GET</td>
    <td><b>Query Parameters:</b><br /><code>( )</code><br /><br /><b>Return type if no error:</b><br /><code>{ workspaceStats }</code></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><code>admin/user/remove/v1</code><br /><br />Given a user by their uId, remove them from the Treats. This means they should be removed from all channels/DMs, and will not be included in the array of users returned by <code>users/all</code>. Treats owners can remove other Treats owners (including the original first owner). Once users are removed, the contents of the messages they sent will be replaced by 'Removed user'. Their profile must still be retrievable with <code>user/profile</code>, however nameFirst should be 'Removed' and nameLast should be 'user'. The user's email and handle should be reusable.</td>
    <td style="color: red; font-weight: bold;">DELETE</td>
    <td><b>Query Parameters:</b><br /><code>( uId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>uId does not refer to a valid user</li>
        <li>uId refers to a user who is the only global owner</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the authorised user is not a global owner</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>admin/userpermission/change/v1</code><br /><br />Given a user by their user ID, set their permissions to new permissions described by permissionId.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( uId, permissionId )</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>400 Error</b> when any of:
      <ul>
        <li>uId does not refer to a valid user</li>
        <li>uId refers to a user who is the only global owner and they are being demoted to a user</li>
        <li>permissionId is invalid</li>
        <li>the user already has the permissions level of permissionId</li>
      </ul>
      <b>403 Error</b> when:
      <ul>
        <li>the authorised user is not a global owner</li>
      </ul>
    </td>
  </tr>
</table>



### What is Standups?
Once a standup is finished, all of the messages sent to `standup/send` are packaged together in *one single message* posted by *the user who started the standup*. This packaged message is sent as a message to the channel where the standup was started, timestamped at the moment the standup finished.

The structure of the packaged message is like this:

```txt
[messageSender1Handle]: [message1]
[messageSender2Handle]: [message2]
[messageSender3Handle]: [message3]
[messageSender4Handle]: [message4]
```

For example:

```txt
jake: I ate a catfish
hayden: I went to kmart
emily: I ate a toaster
nick: my catfish ate a kmart toaster
```

Standups can be started on the frontend by typing "/standup X" (where X is the number of seconds that the standup lasts for) into the message input and clicking send. E.g., to start a 90-second standup, type "/standup 90" and press send.

You will not be tested on any behaviour involving the user who started a standup being removed from the channel or Treats while the standup is ongoing, therefore you can decide this behaviour yourself.

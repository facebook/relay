export class Message extends Object {}
export class User extends Object {}

// Mock authenticated ID
const VIEWER_ID = 'me';

// Mock user data
var viewer = new User();
viewer.id = VIEWER_ID;
var usersById = {
  [VIEWER_ID]: viewer
};

// Mock message data
var messages = [
  {
    id: 'm_1',
    threadID: 't_1',
    threadName: 'Jing and Me',
    authorName: 'me',
    text: 'Hey Jing, want to give a Flux talk at ForwardJS?',
    timestamp: Date.now() - 99999
  },
  {
    id: 'm_2',
    threadID: 't_1',
    threadName: 'Jing and me',
    authorName: 'me',
    text: 'Seems like a pretty cool conference.',
    timestamp: Date.now() - 89999
  },
  {
    id: 'm_3',
    threadID: 't_1',
    threadName: 'Jing and me',
    authorName: 'Jing',
    text: 'Sounds good.  Will they be serving dessert?',
    timestamp: Date.now() - 79999
  },
  {
    id: 'm_4',
    threadID: 't_2',
    threadName: 'Dave and me',
    authorName: 'me',
    text: 'Hey Dave, want to get a beer after the conference?',
    timestamp: Date.now() - 69999
  },
  {
    id: 'm_5',
    threadID: 't_2',
    threadName: 'Dave and me',
    authorName: 'Dave',
    text: 'Totally!  Meet you at the hotel bar.',
    timestamp: Date.now() - 59999
  },
  {
    id: 'm_6',
    threadID: 't_3',
    threadName: 'Functional Heads',
    authorName: 'me',
    text: 'Hey Brian, are you going to be talking about functional stuff?',
    timestamp: Date.now() - 49999
  },
  {
    id: 'm_7',
    threadID: 't_3',
    threadName: 'me and Brian',
    authorName: 'Brian',
    text: 'At ForwardJS?  Yeah, of course.  See you there!',
    timestamp: Date.now() - 39999
  }
];

var messagesById = messages.reduce((preMessages, message) => {
  preMessages[message.id] = message;
  return preMessages;
}, {});
var messageIdsByUser = {
  [VIEWER_ID]: []
};

export function addMessage(text, currentThreadID) {
  var timestamp = Date.now();
  var message = new Message();
  message.id = 'm_' + timestamp;
  message.threadID = currentThreadID || 't_' + timestamp;
  message.authorName = 'me'; // hard coded for the exampl
  message.text = text;
  message.timestamp = timestamp;
  message.isRead = true;

  messagesById[message.id] = message;
  messageIdsByUser[VIEWER_ID].push(message.id);
  return message.id;
}

export function getMessage(id) {
  return messagesById[id];
}

export function getMessages() {
  return messageIdsByUser[VIEWER_ID].map((id) => getMessage[id]);
}

export function markMessageAsRead(id, isRead) {
  var message = getMessage(id);
  message.isRead = isRead;
}

export function getUser(id) {
  return usersById[VIEWER_ID];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

export class Thread extends Object {}
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
// inject raw messages into database
messages.map(mes => {
  let {threadID, threadName} = mes;
  if (!threadsById[threadID]) {
    let thread = new Thread();
    thread.id = threadID;
    thread.name = threadName;
    thread.isRead = false;
    threadIdsByUser[VIEWER_ID].push(thread.id);
    threadsById[thread.id] = thread;
  }

  let message = new Message();
  let {id, authorName, text, timestamp} = mes;
  message.id = id;
  message.authorName = authorName;
  message.text = text;
  message.timestamp = timestamp;
  messagesById[message.id] = message;
  messageIdsByThread[threadID].push(message.id);
});

var threadsById = {};
var threadIdsByUser = {
  [VIEWER_ID]: []
};

var messagesById = {};
var messageIdsByThread = {};

export function addMessage(text, currentThreadID) {
  var timestamp = Date.now();
  var message = new Message();
  message.id = 'm_' + timestamp;
  message.authorName = 'me'; // hard coded for the exampl
  message.text = text;
  message.timestamp = timestamp;

  messagesById[message.id] = message;
  messageIdsByThread[currentThreadID].push(message.id);
  return {
    messageID: message.id,
    currentThreadID
  };
}

export function getThread(id) {
  return threadsById[id];
}

export function getThreads() {
  return threadIdsByUser[VIEWER_ID].map(id => getThread(id));
}

export function getMessage(id) {
  return messagesById[id];
}

export function getMessagesByThreadId(threadID) {
  return messageIdsByThread[threadID].map(id => getMessage(id));
}

export function markThreadAsRead(id, isRead) {
  var thread = getThread(id);
  thread.isRead = isRead;
}

export function getUser(id) {
  return usersById[id];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

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

var threadsById = {};
var threadIdsByUser = {
  [VIEWER_ID]: []
};

var messagesById = {};
var messageIdsByThread = {};

// Mock raw message data then we can transform
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
    threadName: 'Brian and me',
    authorName: 'me',
    text: 'Hey Brian, are you going to be talking about functional stuff?',
    timestamp: Date.now() - 49999
  },
  {
    id: 'm_7',
    threadID: 't_3',
    threadName: 'Brian and me',
    authorName: 'Brian',
    text: 'At ForwardJS?  Yeah, of course.  See you there!',
    timestamp: Date.now() - 39999
  }
];
// inject raw messages into database
messages.map(mes => {
  let {threadID, threadName, timestamp} = mes;
  // if thread not exists
  if (!threadsById[threadID]) {
    let thread = new Thread();
    thread.id = threadID;
    thread.name = threadName;
    thread.isRead = false;
    thread.lastUpdated = timestamp;
    threadIdsByUser[VIEWER_ID].push(thread.id);
    threadsById[thread.id] = thread;
  }
  // if message are newer than lastUpdated, show update
  if (timestamp > threadsById[threadID].lastUpdated) {
    threadsById[threadID].lastUpdated = timestamp;
  }
  let message = new Message();
  let {id, authorName, text} = mes;
  message.id = id;
  message.authorName = authorName;
  message.text = text;
  message.timestamp = timestamp;
  messagesById[message.id] = message;
  if (!messageIdsByThread[threadID]) {
    messageIdsByThread[threadID] = [];
  }
  messageIdsByThread[threadID].push(message.id);
});

export function addMessage(text, currentThreadID) {
  var timestamp = Date.now();
  var message = new Message();
  message.id = 'm_' + timestamp;
  message.authorName = 'me'; // hard coded for the example
  message.text = text;
  message.timestamp = timestamp;

  threadsById[currentThreadID].isRead = true;
  threadsById[currentThreadID].lastUpdated = timestamp;

  messagesById[message.id] = message;
  messageIdsByThread[currentThreadID].push(message.id);

  return {
    messageID: message.id,
    threadID: currentThreadID
  };
}

export function markThreadAsRead(id) {
  var thread = getThread(id);
  thread.isRead = true;
}

export function getThread(id) {
  return threadsById[id];
}

export function getThreads() {
  let orderedThreads = threadIdsByUser[VIEWER_ID].map(id => getThread(id));
  // let newer thread get lower index
  orderedThreads.sort((x, y) => {
    return x.lastUpdated > y.lastUpdated ?
      -1 : x.lastUpdated < y.lastUpdated ? 1 : 0;
  });
  return orderedThreads;
}

export function getMessage(id) {
  return messagesById[id];
}

export function getMessagesByThreadId(threadID) {
  let orderedMessages = messageIdsByThread[threadID].map(id => getMessage(id));
  // let newer message get higher index
  orderedMessages.sort((x, y) => {
    return x.timestamp < y.timestamp ? -1 : x.timestamp > y.timestamp ? 1 : 0;
  });
  return orderedMessages;
}

export function getUser(id) {
  return usersById[id];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

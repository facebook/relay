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

var threadsById = {
  t_1: {
    id: 't_1',
    name: 'Jing and me',
    isRead: false,
    lastUpdated: 1439961049573
  },
  t_2: {
    id: 't_2',
    name: 'Dave and me',
    isRead: false,
    lastUpdated: 1439961069573
  },
  t_3: {
    id: 't_3',
    name: 'Brian and me',
    isRead: false,
    lastUpdated: 1439961089573
  }
};
var threadIdsByUser = {
  [VIEWER_ID]: [ 't_1', 't_2', 't_3' ]
};

var messagesById = {
  m_1: {
    id: 'm_1',
    authorName: 'me',
    text: 'Hey Jing, want to give a Flux talk at ForwardJS?',
    timestamp: 1439961029573
  },
  m_2: {
    id: 'm_2',
    authorName: 'me',
    text: 'Seems like a pretty cool conference.',
    timestamp: 1439961039573
  },
  m_3: {
    id: 'm_3',
    authorName: 'Jing',
    text: 'Sounds good.  Will they be serving dessert?',
    timestamp: 1439961049573
  },
  m_4: {
    id: 'm_4',
    authorName: 'me',
    text: 'Hey Dave, want to get a beer after the conference?',
    timestamp: 1439961059573
  },
  m_5: {
    id: 'm_5',
    authorName: 'Dave',
    text: 'Totally!  Meet you at the hotel bar.',
    timestamp: 1439961069573
  },
  m_6: {
    id: 'm_6',
    authorName: 'me',
    text: 'Hey Brian, are you going to be talking about functional stuff?',
    timestamp: 1439961079573
  },
  m_7: {
    id: 'm_7',
    authorName: 'Brian',
    text: 'At ForwardJS?  Yeah, of course.  See you there!',
    timestamp: 1439961089573
  }
};
var messageIdsByThread = {
  t_1: [ 'm_1', 'm_2', 'm_3' ],
  t_2: [ 'm_4', 'm_5' ],
  t_3: [ 'm_6', 'm_7' ]
};

export function addMessage(text, currentThreadID) {
  var timestamp = Date.now();
  var message = new Message();
  message.id = 'm_' + timestamp;
  message.authorName = 'me'; // hard coded for the exampl
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
  orderedThreads.sort((x, y) => {
    return x.lastUpdated < y.lastUpdated ?
      -1 : x.lastUpdated > y.lastUpdated ? 1 : 0;
  });
  return orderedThreads;
}

export function getMessage(id) {
  return messagesById[id];
}

export function getMessagesByThreadId(threadID) {
  let orderedMessages = messageIdsByThread[threadID].map(id => getMessage(id));
  orderedMessages.sort((x, y) => {
    return x.timestamp < y.timestamp ? -1 : x.timestamp > y.timestamp ? 1 : 0;
  });
  return orderedMessages;
}

export function getUser(id) {
  return usersById[VIEWER_ID]; // FIXME
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

import { doc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { db } from './firebase_auth.js';

function UpdateUnreadMsgBadge(unreadBadge, counterToRead, chatId){

  const parentDocRef = doc(db, `chats/${chatId}/unreadMsgCounters/{counterToRead}`);

  const unsubscribe = onSnapshot(parentDocRef, (docSnap) => {
    if (docSnap.exists()) {
       const count = docSnap.get(counter) || 0;
       unreadBadge .textContent = count;
    }
  });
}

export { UpdateUnreadMsgBadge };
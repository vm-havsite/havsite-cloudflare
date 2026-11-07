function UpdateUnreadMsgBadge(unreadBadge, counterToRead){

  const parentDocRef = doc(db, `chats/${chatId}/unreadMsgCounters/{counterToRead}`);

  const unsubscribe = onSnapshot(parentDocRef, (docSnap) => {
    if (docSnap.exists()) {
       const count = docSnap.get(counter) || 0;
       unreadBadge .textContent = count;
    }
  });
}


	
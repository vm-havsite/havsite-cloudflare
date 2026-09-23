async function setUnreadCounterToZero(chatId, counterToUpdate){
  try{
    await setDoc(doc(db, `chats/${chatId}`), {
       [counterToUpdate]: 0
   },  { merge: true });
  }
  catch(err){
    console.error('meta:', err.stack);
  }
}

export{ setUnreadCounterToZero }
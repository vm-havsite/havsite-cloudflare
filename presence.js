import { onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getDatabase, ref, onValue, set, off, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { app, db } from './firebase_auth.js';
const rtdb = getDatabase(app)

async function setpresence(userId){
  console.log("userId:", userId);
  console.log("rtdb:", rtdb);
  const userStatusRef = ref(rtdb, "status/" + userId);
  const connectedRef = ref(rtdb, ".info/connected");

  onValue(connectedRef, async (snapshot) => {
    if (snapshot.val() === false) return;

    await onDisconnect(userStatusRef).set({
      state: "offline",
      last_changed: Date.now()
    });

    await set(userStatusRef, {
      state: "online",
      last_changed: Date.now()
    });
  });
}

function listenToUserStatus(otherUserId, callback) {
  const statusRef = ref(rtdb, "status/" + otherUserId);

  const unsubscribe = onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });

  return unsubscribe; 
}

export { setpresence, listenToUserStatus };
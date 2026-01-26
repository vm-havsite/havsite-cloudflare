import { Authcheck } from './firebase_auth.js';
let state;
let userstate = localStorage.getItem("state");
const lastcheck = localStorage.getItem("lastcheck");
const now = new Date();
const today = parseInt(now.toISOString().split('T')[0].replace(/-/g, ''));

function authcheck(){
  Authcheck().then(user => {
      if (user) {
        localStorage.setItem("state", "signedin");
        state = 'signedin';
      } else {
        localStorage.setItem("state", "anonymous");
        state = 'anonymous';
      }
      localStorage.setItem("lastcheck", today);
      return state;
  });
}

if (today != lastcheck || userstate === null) {
    setTimeout(authcheck, 800); // optional buffer
} else {
    state = userstate;
}

// make getstate async
async function getstate() {
    if (state !== undefined) return state; // already known
    // wait until authcheck resolves
    return await authcheck();
}

function updatestate(newstate){
  localStorage.setItem("state", `${newstate}`);
  state = localStorage.getItem("state");
}

export{ getstate, updatestate };
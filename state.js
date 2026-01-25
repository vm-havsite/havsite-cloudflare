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
      return state;
      localStorage.setItem("lastcheck", today);
  });
}

if (today != lastcheck) {
    setTimeout(authcheck, 1000); // wait 1 second then run
}

if( userstate === null ){  // Use === for safety
  localStorage.setItem("state", "anonymous");
  state = anonymous;
}
else if(userstate != null){
  state = localStorage.getItem("state");
}

function getstate(){
    return state;
}

function updatestate(newstate){
  localStorage.setItem("userstate", `${newstate}`);
  state = localStorage.getItem("userstate");
}

export{ getstate, updatestate };
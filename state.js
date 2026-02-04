import { Authcheck, fetchUserPhotoURL } from './firebase_auth.js';
let state;
let userstate = localStorage.getItem("state");
const lastcheck = localStorage.getItem("lastcheck");
const now = new Date();
const today = parseInt(now.toISOString().split('T')[0].replace(/-/g, ''));


async function authcheck() {
    // Wait for the actual Auth process to finish
    const user = await Authcheck(); 

    if (user) {
        state = 'signedin';
    } else {
        state = 'anonymous';
    }

    // Update storage
    localStorage.setItem("state", state);
    localStorage.setItem("lastcheck", today);

    return state; // Now this returns the actual value to getstate()
}

async function fetchdp() {
  let dpurl;

  if (userstate === 'signedin') {
    dpurl = await fetchUserPhotoURL();
  }

  if (!dpurl) {
    dpurl = "https://havsite2.pages.dev/images/user.png";
  }

  localStorage.setItem("dpurl", dpurl);
  return dpurl;
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

async function getuserdp(){
  const userdp = localStorage.getItem("dpurl");
  if( userdp != null && today === lastcheck ){
    const dpurl = userdp;
    return dpurl;
  }
  else{
    const dpurl = await fetchdp();
    return dpurl;
  }
}

export{ getstate, updatestate, getuserdp };
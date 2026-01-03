import { Client, Account } from 'https://cdn.jsdelivr.net/npm/appwrite@12.0.0/+esm';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('havsite-user-login-0'); // Replace with your Appwrite project ID

const account = new Account(client);

// Signup function
async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    await account.create('unique()', email, password, name);
    alert('Signup successful! Please sign in.');
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
}

// Signin function
async function signin() {
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  if (!email || !password) {
    alert('Please fill in both email and password.');
    return;
  }

  try {
    await account.createEmailSession(email, password);
    alert('Signin successful!');
  } catch (error) {
    alert('Signin failed: ' + error.message);
  }
}

//logout
async function logout() {
    try {
        await account.deleteSession('current');
        alert('Logged out successfully!');
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
}


// Event listeners
document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('signin-btn').addEventListener('click', signin);
document.getElementById('signin-btn').addEventListener('click', logout);

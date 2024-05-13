function getFormData(formId) {
  const result = {};
  const form = document.getElementById(formId);
  const data = new FormData(form);
  data.forEach((value, key) => result[key] = value);
  return result;
}

function signup() {
  const { name, username, email, password } = getFormData('signup-form-element');
  fetch('/api/v1/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      username,
      email,
      password
    }),
  }).then(res => res.json())
  .then(data => {
    if (data.status === 'error') {
      document.getElementById('signup-message').innerText = data.message;
      document.getElementById('signup-message').style.color ='red';
    } else {
      document.getElementById('signup-message').innerText = 'account created, you can log in now!';
      document.getElementById('signup-message').style.color = 'green';
      signUpToLoginTransition();
    }
  }).catch(err => {
    console.log('oops, something went wrong!', err);
  });
}

function login() {
  const { email, password } = getFormData('login-form-element');
  fetch('/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    }),
  }).then(res => res.json())
  .then(data => {
    if (data.status === 'error') {
      document.getElementById('signup-message').innerText = data.message;
      document.getElementById('signup-message').style.color ='red';
    } else {
      localStorage.setItem('authToken', data.data.authToken);
      document.getElementById('signup-message').innerText = 'great, you are logged in!';
      document.getElementById('signup-message').style.color = 'green';
      setTimeout(() => window.location.href = '/', 2000);
    }
  }).catch(err => {
    console.log('oops, something went wrong!', err);
  });
}

function signUpToLoginTransition(){

  document.getElementById('signup-message').innerText = '';

  document.getElementById('login-title').style.marginLeft = '120%';
  document.getElementById('login-button').style.marginLeft = '120%';
  document.querySelectorAll(".login-input").forEach((input) => input.style.marginLeft = "120%");
  document.getElementById('signup-prompt').style.marginLeft = '120%';
  document.getElementById('login-form').style.display = 'inline-block';

  document.getElementById('signup-title').classList.remove('slide-delay-600ms');
  document.getElementById('signup-title').classList.remove('slide-in');
  document.getElementById('signup-name').classList.remove('slide-delay-800ms');
  document.getElementById('signup-name').classList.remove('slide-in');
  document.getElementById('signup-email').classList.remove('slide-delay-1000ms');
  document.getElementById('signup-email').classList.remove('slide-in');
  document.getElementById('signup-username').classList.remove('slide-delay-1200ms');
  document.getElementById('signup-username').classList.remove('slide-in');
  document.getElementById('signup-password').classList.remove('slide-delay-1400ms');
  document.getElementById('signup-password').classList.remove('slide-in');
  document.getElementById('signup-button').classList.remove('slide-delay-1600ms');
  document.getElementById('signup-button').classList.remove('slide-in');
  document.getElementById('login-prompt').classList.remove('slide-delay-1800ms');
  document.getElementById('login-prompt').classList.remove('slide-in');

  document.getElementById('signup-title').classList.add('slide-out');
  document.getElementById('signup-name').classList.add('slide-delay-200ms');
  document.getElementById('signup-name').classList.add('slide-out');
  document.getElementById('signup-email').classList.add('slide-delay-400ms');
  document.getElementById('signup-email').classList.add('slide-out');
  document.getElementById('signup-username').classList.add('slide-delay-600ms');
  document.getElementById('signup-username').classList.add('slide-out');
  document.getElementById('signup-password').classList.add('slide-delay-800ms');
  document.getElementById('signup-password').classList.add('slide-out');
  document.getElementById('signup-button').classList.add('slide-delay-1000ms');
  document.getElementById('signup-button').classList.add('slide-out');
  document.getElementById('login-prompt').classList.add('slide-delay-1200ms');
  document.getElementById('login-prompt').classList.add('slide-out');

  document.getElementById('login-title').classList.remove('slide-out');
  document.getElementById('login-email').classList.remove('slide-delay-400ms');
  document.getElementById('login-email').classList.remove('slide-out');
  document.getElementById('login-password').classList.remove('slide-delay-600ms');
  document.getElementById('login-password').classList.remove('slide-out');
  document.getElementById('login-button').classList.remove('slide-delay-1000ms');
  document.getElementById('login-button').classList.remove('slide-out');
  document.getElementById('signup-prompt').classList.remove('slide-delay-1200ms');
  document.getElementById('signup-prompt').classList.remove('slide-out');

  document.getElementById('login-title').classList.add('slide-delay-600ms');
  document.getElementById('login-title').classList.add('slide-in');
  document.getElementById('login-email').classList.add('slide-delay-1000ms');
  document.getElementById('login-email').classList.add('slide-in');
  document.getElementById('login-password').classList.add('slide-delay-1200ms');
  document.getElementById('login-password').classList.add('slide-in');
  document.getElementById('login-button').classList.add('slide-delay-1600ms');
  document.getElementById('login-button').classList.add('slide-in');
  document.getElementById('signup-prompt').classList.add('slide-delay-1800ms');
  document.getElementById('signup-prompt').classList.add('slide-in');
  document.getElementById('login-form').style.zIndex = '2';
  document.getElementById('signup-form').style.zIndex = '1';
}

function loginToSignupTransition(){
  
  document.getElementById('signup-message').innerText = '';

  document.getElementById('signup-title').style.marginLeft = '120%';
  document.getElementById('signup-button').style.marginLeft = '120%';
  document.querySelectorAll(".signup-input").forEach((input) => input.style.marginLeft = "120%");
  document.getElementById('login-prompt').style.marginLeft = '120%';

  document.getElementById('login-title').classList.remove('slide-delay-600ms');
  document.getElementById('login-title').classList.remove('slide-in');
  document.getElementById('login-email').classList.remove('slide-delay-1000ms');
  document.getElementById('login-email').classList.remove('slide-in');
  document.getElementById('login-password').classList.remove('slide-delay-1200ms');
  document.getElementById('login-password').classList.remove('slide-in');
  document.getElementById('login-button').classList.remove('slide-delay-1600ms');
  document.getElementById('login-button').classList.remove('slide-in');
  document.getElementById('signup-prompt').classList.remove('slide-delay-1800ms');
  document.getElementById('signup-prompt').classList.remove('slide-in');

  document.getElementById('login-title').classList.add('slide-out');
  document.getElementById('login-email').classList.add('slide-delay-400ms');
  document.getElementById('login-email').classList.add('slide-out');
  document.getElementById('login-password').classList.add('slide-delay-600ms');
  document.getElementById('login-password').classList.add('slide-out');
  document.getElementById('login-button').classList.add('slide-delay-1000ms');
  document.getElementById('login-button').classList.add('slide-out');
  document.getElementById('signup-prompt').classList.add('slide-delay-1200ms');
  document.getElementById('signup-prompt').classList.add('slide-out');

  document.getElementById('signup-title').classList.remove('slide-out');
  document.getElementById('signup-name').classList.remove('slide-delay-200ms');
  document.getElementById('signup-name').classList.remove('slide-out');
  document.getElementById('signup-email').classList.remove('slide-delay-400ms');
  document.getElementById('signup-email').classList.remove('slide-out');
  document.getElementById('signup-username').classList.remove('slide-delay-600ms');
  document.getElementById('signup-username').classList.remove('slide-out');
  document.getElementById('signup-password').classList.remove('slide-delay-800ms');
  document.getElementById('signup-password').classList.remove('slide-out');
  document.getElementById('signup-button').classList.remove('slide-delay-1000ms');
  document.getElementById('signup-button').classList.remove('slide-out');
  document.getElementById('login-prompt').classList.remove('slide-delay-1200ms');
  document.getElementById('login-prompt').classList.remove('slide-out');

  document.getElementById('signup-title').classList.add('slide-delay-600ms');
  document.getElementById('signup-title').classList.add('slide-in');
  document.getElementById('signup-name').classList.add('slide-delay-800ms');
  document.getElementById('signup-name').classList.add('slide-in');
  document.getElementById('signup-email').classList.add('slide-delay-1000ms');
  document.getElementById('signup-email').classList.add('slide-in');
  document.getElementById('signup-username').classList.add('slide-delay-1200ms');
  document.getElementById('signup-username').classList.add('slide-in');
  document.getElementById('signup-password').classList.add('slide-delay-1400ms');
  document.getElementById('signup-password').classList.add('slide-in');
  document.getElementById('signup-button').classList.add('slide-delay-1600ms');
  document.getElementById('signup-button').classList.add('slide-in');
  document.getElementById('login-prompt').classList.add('slide-delay-1800ms');
  document.getElementById('login-prompt').classList.add('slide-in');
  document.getElementById('login-form').style.zIndex = '1';
  document.getElementById('signup-form').style.zIndex = '2';
  setTimeout(() => document.getElementById('login-form').style.display = 'none', 2200);
}

function showSignup() {
  loginToSignupTransition();
}

function showLogin(){
  signUpToLoginTransition();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signup-button').addEventListener('click', signup);
  document.getElementById('login-button').addEventListener('click', login);
  document.getElementById('login-link').addEventListener('click', showLogin);
  document.getElementById('signup-link').addEventListener('click', showSignup);
});
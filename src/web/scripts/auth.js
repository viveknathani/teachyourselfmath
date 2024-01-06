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
      document.getElementById('signup-message').innerText = 'great, you have an account now, login to continue!';
      document.getElementById('signup-message').style.color = 'green';
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
      document.getElementById('login-message').innerText = data.message;
      document.getElementById('login-message').style.color ='red';
    } else {
      localStorage.setItem('authToken', data.data.authToken);
      document.getElementById('login-message').innerText = 'great, you are logged in!';
      document.getElementById('login-message').style.color = 'green';
    }
  }).catch(err => {
    console.log('oops, something went wrong!', err);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signup-button').addEventListener('click', signup);
  document.getElementById('login-button').addEventListener('click', login);
});
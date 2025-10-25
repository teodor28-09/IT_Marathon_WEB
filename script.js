function goToRegister() {
  window.location.href = "register.html"; 
}

function goToLogin() {
  window.location.href = "index.html";
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageElement = document.getElementById("message");

  messageElement.textContent = "";
  const existingButton = document.getElementById("goToLoginBtn");
  if (existingButton) {
    existingButton.remove();
  }

  if (!username || !password) {
    messageElement.textContent = "Please enter both username and password.";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username]) {
    messageElement.textContent = "Username already exists.";
    const loginBtn = document.createElement("button");
    loginBtn.id = "goToLoginBtn";
    loginBtn.textContent = "Go to Login";
    loginBtn.onclick = goToLogin;
    loginBtn.style.marginLeft = "10px";
    messageElement.appendChild(loginBtn);
  } else {
    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful!");
    window.location.href = "index.html";
  }
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username] === password) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "home.html";
  } else {
    alert("Invalid username or password");
  }
}

// --- Messaging logic starts here ---

function initContactsFromUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  let messages = JSON.parse(localStorage.getItem("messages"));

  if (!messages) {
    messages = {};
    for (const username in users) {
      messages[username] = [
        { from: username, text: "Hello! This is a default message." },
        { from: "You", text: "Hi! Nice to meet you." }
      ];
    }
    localStorage.setItem("messages", JSON.stringify(messages));
  }
}

function loadContacts() {
  return JSON.parse(localStorage.getItem("messages")) || {};
}

function saveContacts(contacts) {
  localStorage.setItem("messages", JSON.stringify(contacts));
}

// Initialize and load
initContactsFromUsers();
const contacts = loadContacts();

let currentContact = null;

const contactList = document.getElementById('contactList');
const chatHeader = document.getElementById('chatHeader');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Add image input
const imageInput = document.createElement('input');
imageInput.type = 'file';
imageInput.accept = 'image/*';
imageInput.style.display = 'none';
imageInput.id = 'imageInput';
document.body.appendChild(imageInput);

const imageBtn = document.createElement('button');
imageBtn.textContent = '📷';
imageBtn.className = 'btn btn-secondary me-2';
imageBtn.onclick = () => imageInput.click();
document.querySelector('.chat-footer').insertBefore(imageBtn, messageInput);

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file && currentContact) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (!contacts[currentContact]) contacts[currentContact] = [];
      contacts[currentContact].push({ from: "You", image: e.target.result });
      saveContacts(contacts);
      renderMessages();
    };
    reader.readAsDataURL(file);
  }
});

// Render contact buttons
for (const name in contacts) {
  const div = document.createElement('div');
  div.className = 'contact';
  div.textContent = name;
  div.addEventListener('click', () => switchContact(name, div));
  contactList.appendChild(div);
}

function switchContact(name, contactDiv) {
  currentContact = name;

  // Highlight active contact
  document.querySelectorAll('.contact').forEach(el => el.classList.remove('active-contact'));
  contactDiv.classList.add('active-contact');

  // Update header
  chatHeader.innerHTML = `<strong>${name}</strong>`;

  // Render messages
  renderMessages();
}

function renderMessages() {
  chatBody.innerHTML = '';
  if (!contacts[currentContact]) return;

  contacts[currentContact].forEach(msg => {
    const div = document.createElement('div');
    div.className = msg.from === "You" ? 'text-end mb-2 m-3' : 'text-start mb-2';
    const bubble = document.createElement('span');
    bubble.className = msg.from === "You" ? 'bg-success text-white p-2 rounded d-inline-block' : 'bg-white p-2 rounded d-inline-block';

    if (msg.image) {
      const img = document.createElement('img');
      img.src = msg.image;
      img.style.maxWidth = '200px';
      img.className = 'img-fluid rounded';
      bubble.innerHTML = '';
      bubble.appendChild(img);
    } else {
      bubble.textContent = msg.text;
    }

    div.appendChild(bubble);
    chatBody.appendChild(div);
  });
  chatBody.scrollTop = chatBody.scrollHeight;
}

messageInput.addEventListener('input', toggleSendButton);
function toggleSendButton() {
  sendBtn.style.display = messageInput.value.trim() === '' ? 'none' : 'inline-block';
}
toggleSendButton();

sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (text && currentContact) {
    if (!contacts[currentContact]) contacts[currentContact] = [];
    contacts[currentContact].push({ from: "You", text });
    saveContacts(contacts); // Save updated messages
    messageInput.value = '';
    renderMessages();
    toggleSendButton();
  }
});
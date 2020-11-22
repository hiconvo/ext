const message = document.getElementById("message");
const clearButton = document.getElementById("clear");
const authenticateButton = document.getElementById("authenticate");
const formContent = document.getElementById("formcontent");
const form = document.getElementById("form");

function showLogin() {
  clearButton.style.display = "none";
  message.innerText =
    "Before you can use this extension, you'll have to login.";
  authenticateButton.style.display = "inline-block";
  formContent.innerHTML = `
    <div>
      <p class="helptext">If you do not have a password associated with your account, you can create one on Convo's <a href="https://app.convo.events/settings" target="_blank">settings page</a>.</p>
    </div>

    <div>
      <p class="error" id="errorcontainer"></p>
    </div>

    <label>
      <span>Email</span>
      <input type="email" name="email" id="email" required autofocus>
    </label>
    <label>
      <span>Password</span>
      <input type="password" name="password" id="password" required>
    </label>
  `;
}

function showLogout() {
  message.innerHTML =
    "You are logged into Convo. &#x1f60a <br /><br /> You can now close this window and save links as you browse by clicking the Convo icon in the upper toolbar.";
  clearButton.style.display = "inline-block";
  authenticateButton.style.display = "none";
  formContent.innerHTML = "";
}

chrome.storage.local.get(["token"], values => {
  if (values.token) {
    showLogout();
  } else {
    showLogin();
  }
});

clearButton.addEventListener("click", () => {
  chrome.storage.local.set({ token: null }, () => {
    showLogin();
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();

  authenticateButton.disabled = true;

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("https://api.convo.events/users/auth", {
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      email: email,
      password: password
    })
  }).then(response => {
    response
      .json()
      .then(decoded => {
        if (response.status == 200) {
          chrome.storage.local.set({ token: decoded.token }, () => {
            showLogout();
          });
        } else {
          authenticateButton.disabled = false;
          document.getElementById("errorcontainer").innerText =
            decoded.message || "That didn't work. Please try again.";
        }
      })
      .catch(() => {
        authenticateButton.disabled = false;
        document.getElementById("errorcontainer").innerText =
          "Something went wrong.";
      });
  });
});

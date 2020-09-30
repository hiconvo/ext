const main = document.querySelector("main");

chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
  const tab = tabs[0];

  chrome.storage.local.get(["token"], store => {
    if (!store.token) {
      if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }

      main.innerHTML = "<p>&#x1f512</p>";
      return;
    }

    fetch("https://api.convo.events/notes", {
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`
      }),
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        name: tab.title,
        url: tab.url,
        favicon:
          tab.favIconUrl && tab.favIconUrl.startsWith("https")
            ? tab.favIconUrl
            : ""
      })
    })
      .then(response => {
        if (response.status == 201) {
          main.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#1b1f23" /></svg>';
        } else {
          main.innerHTML = "<p>&#x1f61e</p>";
        }
      })
      .catch(() => {
        main.innerHTML = "<p>&#x1f4e0</p>";
      });
  });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == 'icon_clicked') {
    var url = request.url;
    chrome.storage.local.get(url, function(result) {
      var hash = result[url];
      if (hash) {
        chrome.storage.local.get(hash, function(result) {
          var obj = {};
          if (result[hash] == 1) {
            obj[hash] = 0;
            chrome.storage.local.set(obj);
            chrome.runtime.sendMessage({action: 'unsubscribe', hash: hash});
            toggle();
          } else {
            obj[hash] = 1;
            chrome.storage.local.set(obj);
            chrome.runtime.sendMessage({action: 'subscribe', hash: hash});
            toggle();
          }
        });
      }
    });
  } else if (request.action == 'message') {
    var messageDiv = "<div class=\"woop-message\"><p>" +
                     "<span class=\"woop-time\">" +
                       getFormattedTime() +
                     "</span>" +
                       ' ' + request.content +
                     "</p></div>";
    var messagesDiv = document.getElementById('woop-messages');
    messagesDiv.innerHTML += messageDiv;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});

function getFormattedTime() {
  var date = new Date();
  var result = '';
  result += date.getFullYear();
  result += '-';
  result += date.getMonth() < 10 ? '0' : '' + date.getMonth();
  result += '-';
  result += date.getDay() < 10 ? '0' : '' + date.getDay();
  result += ' ';
  result += date.getHours() < 10 ? '0' : '' + date.getHours();
  result += ':';
  result += date.getMinutes() < 10 ? '0' : '' + date.getMinutes();
  result += ':'
  result += date.getSeconds() < 10 ? '0' : '' + date.getSeconds();
  return result;
}

function toggle() {
  var doc = document.getElementById('woop-sidebar');
  if (doc.style.visibility == 'hidden') {
    doc.style.visibility = 'visible';
  } else {
    doc.style.visibility = 'hidden';
  }
}

// Append sidebar
var body = document.body;
var div = "<div id=\"woop-sidebar\" style=\"visibility:hidden;\">" +
          "  <div id=\"woop-messages\">" +
          "  </div>" +
          "  <div id=\"woop-form\">" +
          "    <input type=\"text\" id=\"woop-input\">" +
          "    <input type=\"submit\" id=\"woop-submit\" value=\"Send\">" +
          "  </div>" +
          "</div>";
body.innerHTML += div;

document.getElementById('woop-submit').addEventListener('click', function() {
  var message = document.getElementById('woop-input').value;
  if (message) {
    chrome.runtime.sendMessage({action: 'send_message', message: message});
    document.getElementById('woop-input').value = '';
  }
})

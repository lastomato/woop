chrome.browserAction.onClicked.addListener(function(tab) {
  var url = tab.url;
  chrome.storage.local.get(tab.url, function(result) {
    if (!result[url]) {
      var obj = {};
      obj[url] = md5(url)
      chrome.storage.local.set(obj);
    }

    chrome.tabs.sendMessage(tab.id, {action: 'icon_clicked', url: url});
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = sender.tab.url;
  if (request.action == 'send_message') {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {}
    xhr.open('POST', 'https://woop.herokuapp.com', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    chrome.storage.local.get(url, function(result) {
      var hash = result[url];
      if (!hash) {
        hash = md5(url);
      }
      xhr.send('channel=' + hash + '&message=' + request.message);
    })
  } else if (request.action == 'subscribe') {
    subscribe(sender.tab.id, request.hash);
  } else if (request.action == 'unsubscribe') {
    unsubscribe(request.hash);
  }
});

var pusher = new Pusher('8cc8737328cf85fa396c', {
  disableStats: true,
  encrypted: true
});

function subscribe(id, channel) {
  var channel = pusher.subscribe(channel);
  console.log('subscribed');
  channel.bind('woop', function(data) {
    chrome.tabs.sendMessage(id, {action: 'message', content: data.message});
  });
}

function unsubscribe(channel) {
  console.log('unsubscribed');
  pusher.unsubscribe(channel);
}

Messages = new Meteor.Collection('messages');
PageLoadTime = Date.now();
////////// Helpers for in-place editing //////////
// Returns an event map that handles the "escape" and "return" key-
// events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13) {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};

Meteor.subscribe("messages");
Meteor.subscribe("userData");
var messages = Messages.find({}, { sort: {createdAt: -1} });
messages.observe({
  added: function(msg) {
    if (msg.createdAt < PageLoadTime) {
      return;
    }
    if (window.Notification) {
      var notification = new Notification(msg.user.nick, {
        body: msg.text,
        iconUrl: "image.jpg",
        tag: msg.user.nick
      });
      notification.onshow = function(evt) {
        setTimeout(function() { evt.target.close(); }, 15000);
      };
      notification.onclick = function(evt) {
        notification.close();
      };
      notification.onerror = function(evt) {
        console.log(evt);
      };
      //"image.jpg", msg.user && msg.user.nick, msg.text);
      notification.show(); // note the show()
    } else if(navigator.mozNotification) {
      var notification = navigator.mozNotification.createNotification(
          msg.user.nick, msg.text, "image.jpg");
      notification.show();
    }
  }
});
Template.msg.messages = function() {
  return messages;
};
Template.updateUserNick.nick = function () {
  if (Meteor.user())
    return Meteor.user().nick;
  else
    return '';
};
Template.updateUserNick.events(okCancelEvents('#nick', {
  ok: function(value) {
    Meteor.call('updateUserNick', {nick: value});
  },
  cancel: function(evt) {
    evt.target.value = Meteor.user().nick;
  }
}));
Template.menu.greeting = function () {
  return "Welcome to ykk_live";
};

Template.msg.events(okCancelEvents('#newMsg', {
  ok: function (value, evt) {
    // template data, if any, is available in 'this'
    console.log(value, evt);
    Meteor.call('insertMsg', {text: value}, function(err, res) {
      evt.target.value = null;
    });
  },
  cancel: function(evt) {
    evt.target.value = null;
  }
}));

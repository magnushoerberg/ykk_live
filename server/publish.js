Messages = new Meteor.Collection('messages');

Meteor.publish("messages", function() {
  return Messages.find({});
});
Meteor.publish("userData", function() {
  return Meteor.users.find({_id: this.userId},
    { fields: { 'nick': 1, } });
});
Meteor.publish("activeUsers", function() {
  return Meteor.users.find({active: true});
});
Meteor.methods({
  insertMsg: function(msg) {
    msg.text = msg.text;
    var usr = Meteor.user();
    msg.createdAt = Date.now();
    msg.user = usr;
    var res = Messages.insert(msg);
    return res
  },
  updateUserNick: function(nick) {
    return Meteor.users.update( Meteor.userId(), {$set: nick})
  },
  setActiveUser: function(active) {
    return Meteor.users.update( Meteor.userId(), {$set: active})
  }
});

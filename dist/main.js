'use strict';

const skygear = require('skygear');
skygear.endPoint = 'http://localhost:3001/';
skygear.configApiKey('my_skygear_key');

const Conversation = skygear.Record.extend('conversation');
const ChatUser = skygear.Record.extend('chat_user');

const container = function() {};

container._skygear = skygear;

container.getChatUser = function() {
  const query = new this._skygear.Query(ChatUser);
  query.equalTo('_owner_id', this._skygear.currentUser.id);

  return this._skygear.publicDB.query(query).then(function(records) {
    if (records.length > 0) {
      return records[0];
    }
  }).then(function(record) {
    if (record === null) {
      const user = new ChatUser();
      return this._skygear.publicDB.save(user);
    }
    return record;
  });
};

container.createConversation = function(
                          participant_ids,
                          is_direct_message,
                          distinct,
                          title,
                          metadata) {
  const _this = this;
  const query = new _this._skygear.Query(ChatUser);
  query.contains('_owner_id', participant_ids);

  return _this._skygear.publicDB.query(query).then(function(records) {
    if (records.length > 0) {
      return records;
    }
    throw new Error('no user found');
  }).then(function(participants) {
    const conversation = new Conversation();
    conversation.is_direct_message = is_direct_message;
    conversation.title = title;
    conversation.metadata = metadata;
    conversation.participant_ids = participant_ids;
    return _this._skygear.publicDB.save(conversation);
  });
};

container.getConversation = function(conversation_id) {
  const query = this._skygear.Query(Conversation);
  query.equalTo('_id', conversation_id);
  return this._skygear.publicDB.query(query).then(function(records) {
    if (records.length > 0) {
      return records[0];
    }
    throw new Error('no conversation found');
  });
};

container.getConversations = function() {
  const query = this._skygear.Query(Conversation);
  query.containsValue('participant_ids', this._skygear.currentUser.id);
  return this._skygear.publicDB.query(query)
};

container.deleteConversation = function(conversation_id) {
  const _this = this;
  return _this.getConversation(conversation_id).then(function(conversation) {
    return _this._skygear.publicDB.del(conversation);
  });
}

module.exports = container;

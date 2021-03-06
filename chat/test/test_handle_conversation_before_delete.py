import unittest
from unittest.mock import Mock, patch

from skygear.transmitter.encoding import deserialize_record

from ..conversation import (SkygearChatException,
                            handle_conversation_before_delete)


class TestHandleConversationBeforeDelete(unittest.TestCase):

    def setUp(self):
        self.conn = None
        self.patcher = patch('chat.conversation.skyoptions',
                             Mock(return_value={
                                'masterkey': 'secret'
                             }))
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def record(self):
        return deserialize_record({
            '_id': 'conversation/1',
            '_access': None,
            '_ownerID': 'user1',
            'participant_ids': ['user1', 'user2'],
            'admin_ids': ['user1']
        })

    @patch('chat.conversation.current_user_id',
           Mock(return_value='user2'))
    def test_delete_conversation(self):
        with self.assertRaises(SkygearChatException):
            handle_conversation_before_delete(self.record(), self.conn)

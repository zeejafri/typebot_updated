import { option, createAction } from '@typebot.io/forge';
import axios from 'axios';
import { auth } from '../auth'; // Adjust the path as necessary
import { messengerBaseOptions } from '../baseOptions'; // Adjust the path as necessary

// Define the messengerMessageOptions
const messengerMessageOptions = option.object({
  receiverId: option.string.layout({
    label: 'Receiver ID',
    placeholder: 'Enter the receiver\'s Facebook User ID',
    isRequired: true,
    helperText: 'The Facebook User ID of the message recipient.',
  }),
  messageContent: option.string.layout({
    input: 'textarea',
    label: 'Message Content',
    placeholder: 'Type your message here...',
    isRequired: true,
    helperText: 'The content of the message to be sent.',
  }),
  // You can add more fields as necessary
});

// Define the sendMessageToMessenger action
export const sendMessageToMessenger = createAction({
  name: 'Send Message to Messenger',
  auth: auth,
  baseOptions: messengerBaseOptions,
  options: messengerMessageOptions, // Use the messengerMessageOptions here
  run: {
    server: async ({ credentials, options }) => {
      const pageAccessToken = credentials.pageAccessToken;
      const recipientId = options.receiverId;
      const messageContent = options.messageContent;

      // Construct the request payload
      const payload = {
        messaging_type: 'RESPONSE',
        recipient: {
          id: recipientId,
        },
        message: {
          text: messageContent,
        },
      };

      try {
        const response = await axios.post(`https://graph.facebook.com/v14.0/me/messages?access_token=${pageAccessToken}`, payload);
        console.log(response.data);
      } catch (error) {
        console.error('Error sending message to Messenger:', error);
      }
    },
  },
  // ... other configurations as needed
});

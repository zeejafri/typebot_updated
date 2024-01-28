export const messengerConstants = {
  baseUrl: 'https://graph.facebook.com/v14.0', // Use the appropriate version
  defaultPageAccessToken: '', // Default token, if applicable
  defaultMessageOptions: {
    messaging_type: 'RESPONSE', // Default messaging type
  },
} as const;

export const defaultMessengerModelOptions = {
  model: 'your-messenger-model', // If you have a specific model or version you're working with
  // Other default options specific to your implementation
} as const;

// Include other constants as needed for your application

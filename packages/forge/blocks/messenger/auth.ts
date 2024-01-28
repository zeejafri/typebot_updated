import { createAuth, option } from '@typebot.io/forge';

export const auth = createAuth({
  type: 'encryptedCredentials',
  name: 'Messenger Account',
  schema: option.object({
    pageAccessToken: option.string.layout({
      label: 'Page Access Token',
      isRequired: true,
      input: 'password', // Use 'password' to hide the token in the UI
      helperText: 'Enter the Page Access Token from the Facebook Developer Portal.',
    }),
    // Optionally, you can add Page ID if your implementation requires it
    pageId: option.string.layout({
      label: 'Facebook Page ID',
      isRequired: false, // Set to true if Page ID is necessary for your implementation
      helperText: 'Enter the Facebook Page ID (if required by your implementation).',
    }),
  }),
});

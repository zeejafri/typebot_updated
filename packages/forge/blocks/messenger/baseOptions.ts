import { option } from '@typebot.io/forge';
import { messengerConstants } from './constants'; // Assuming you have a constants file for Messenger

export const messengerBaseOptions = option.object({
  baseUrl: option.string.layout({
    accordion: 'Customize Messenger Settings',
    label: 'Messenger Base URL',
    defaultValue: messengerConstants.baseUrl,
    helperText: 'URL for Messenger API requests.'
  }),
  apiVersion: option.string.layout({
    accordion: 'Customize Messenger Settings',
    label: 'Messenger API version',
    helperText: 'Version of the Messenger API to use.',
    defaultValue: 'v14.0', // Set the default API version you are targeting
  }),
  pageAccessToken: option.string.layout({
    accordion: 'Authentication',
    label: 'Page Access Token',
    input: 'password', // Use 'password' to hide the token in UI
    helperText: 'Access token for the Facebook Page.',
  }),
  // Include other options as needed for your Messenger integration
});

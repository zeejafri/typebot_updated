export enum GoogleCalendarAction {
    CREATE_EVENT = 'Create an event',
    UPDATE_EVENT = 'Update an event',
    DELETE_EVENT = 'Delete an event',
    GET_EVENT = 'Get data from calendar',
    RETRIEVE_CALENDAR = 'Retrieve calendar',
    APPOINT_BUILDER = 'Appoint builder',
  }
  
  export const defaultEventDurationOptions = [
    '15 minutes',
    '30 minutes',
    '1 hour',
    '2 hours',
    'All day',
  ] as const;
  
  export const defaultGoogleCalendarOptions = {
    defaultEventDuration: '1 hour',
  } as const;
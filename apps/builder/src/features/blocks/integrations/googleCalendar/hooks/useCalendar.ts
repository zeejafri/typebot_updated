import { stringify } from 'qs';
import { fetcher } from '@/helpers/fetcher';
import useSWR from 'swr';
import { Calendar } from '../types'; // replace with your actual Calendar type

export const useCalendars = ({
  credentialsId,
  calendarId,
  onError,
}: {
  credentialsId?: string;
  calendarId?: string;    
  onError?: (error: Error) => void;
}) => {
  const queryParams = stringify({ credentialsId });
  const { data, error, mutate } = useSWR<{ calendars: Calendar[] }, Error>(
    !credentialsId || !calendarId
      ? null
      : `/api/integrations/google-calendar/id/calendar?${queryParams}`,
    fetcher
  );
  if (error) onError && onError(error);
  return {
    calendars: data?.calendars,
    isLoading: !error && !data,
    mutate,
  };
};
export type Event = {
    id: string;
    summary: string;
    description: string;
    start: Date;
    end: Date;
  }
  
  export type Calendar = {
    id: string;
    name: string;
    timeZone: string;
  }
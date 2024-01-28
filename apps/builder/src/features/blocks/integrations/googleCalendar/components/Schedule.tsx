import {Button, FormControl, FormLabel, Input, Select, Stack } from '@chakra-ui/react';
import { useState } from 'react';

type TimeSlot = { start: string; end: string };
export type DayWithTimeSlots = { day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"; freeTimeSlots: TimeSlot[] };

type DayWithTimeSlotsStackProps = {
  item: DayWithTimeSlots;
  onItemChange: (item: DayWithTimeSlots) => void;
};

export const DayWithTimeSlotsStack: React.FC<DayWithTimeSlotsStackProps> = ({ item, onItemChange }) => {
  const [dayWithTimeSlots, setDayWithTimeSlots] = useState<DayWithTimeSlots>(item);

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDayWithTimeSlots = { ...dayWithTimeSlots, day: event.target.value };
    setDayWithTimeSlots({ ...newDayWithTimeSlots, day: event.target.value as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" });
    onItemChange(newDayWithTimeSlots as DayWithTimeSlots);
  };

  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    slotIndex: number,
    time: 'start' | 'end'
  ) => {
    const newDayWithTimeSlots = { ...dayWithTimeSlots };
    newDayWithTimeSlots.freeTimeSlots[slotIndex][time] = event.target.value;
    setDayWithTimeSlots(newDayWithTimeSlots);
    onItemChange(newDayWithTimeSlots);
  };

  const handleAddTimeSlot = () => {
    const newDayWithTimeSlots = { ...dayWithTimeSlots };
    newDayWithTimeSlots.freeTimeSlots.push({ start: '', end: '' });
    setDayWithTimeSlots(newDayWithTimeSlots);
    onItemChange(newDayWithTimeSlots);
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px" w="full">
      <FormControl>
        <FormLabel>Day</FormLabel>
        <Select value={dayWithTimeSlots.day} onChange={handleDayChange}>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
        </Select>
      </FormControl>
      {dayWithTimeSlots.freeTimeSlots.map((slot, slotIndex) => (
        <Stack key={slotIndex} direction="row">
          <FormControl>
            <FormLabel>Start Time</FormLabel>
            <Input
              type="time"
              value={slot.start}
              onChange={(e) => handleTimeChange(e, slotIndex, 'start')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Time</FormLabel>
            <Input
              type="time"
              value={slot.end}
              onChange={(e) => handleTimeChange(e, slotIndex, 'end')}
            />
          </FormControl>
        </Stack>
      ))}
      <Button onClick={handleAddTimeSlot}>Add Time Slot</Button>
    </Stack>
  );
};
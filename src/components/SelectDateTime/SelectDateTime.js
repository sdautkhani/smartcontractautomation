import * as React from 'react';
import moment from 'moment-js';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


export default function SelectDateTime({ setDateTime, onTimeChange}) {
  console.log(sessionStorage.getItem("startTime"));
  const currentDate=new Date();
  const [value, setValue] = React.useState(new Date(sessionStorage.getItem("startTime")));
  const changeDateTime = (newValue) => {
    setValue(newValue);
    setDateTime(newValue);
    onTimeChange(newValue);
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        renderInput={(props) => <TextField {...props} />}
        minDate={moment()}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        value={value}
        onChange={(newValue) => {
          changeDateTime(newValue);
        }}
      />
    </LocalizationProvider>
  );
}

import React from 'react';
import { useCountdown } from '../../helpers/useCountdown';
import DateTimeDisplay from '../DateTimeDisplay';
const ExpiredNotice = () => {
    return (
      <div className="expired-notice">
        <span>Expired!!!</span>
        <p>Please select a future date and time.</p>
      </div>
    );
  };
  const ShowCounter = ({ days, hours, minutes, seconds }) => {
    return (
      <div className="show-counter ">
        <a
          href="https://tapasadhikary.com"
          target="_blank"
          rel="noopener noreferrer"
          className="countdown-link"
        >
            <div className='flex flex-row'>
          <DateTimeDisplay value={days} type={'d'} isDanger={false} />
         
          <DateTimeDisplay value={hours} type={'h'} isDanger={false} />
          
          <DateTimeDisplay value={minutes} type={'m'} isDanger={false} />
          
          <DateTimeDisplay value={seconds} type={'s'} isDanger={false} />
          </div>
        </a>
      </div>
    );
  };
    
const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return "";
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};
export default CountdownTimer;
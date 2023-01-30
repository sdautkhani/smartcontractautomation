import React from 'react';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div className={`flex flex-row content-center mr-3 px-3 py-5  ${(isDanger) ? 'countdown danger' : 'countdown'} border border-yellow-500 border-solid w-15 text-sm bg-orange-500 text-white opacity-4`}>
      <p className='pl-1 text-xl font-semibold'>{value}</p>
      <p className='pl-1 pt-2'>{type}</p>
      </div>
  );
};

export default DateTimeDisplay;

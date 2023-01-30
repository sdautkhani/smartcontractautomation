import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';

// const Options = ({ tokenAddress, symbol }) => {
//     return (
//         <div>
//             <span>{tokenAddress} {`-`} ${symbol}</span>
//         </div>
//     )
// }

export default function CommandPalette(inputs) {
    console.log(inputs);
    const [value, setValue] = React.useState(null);
  return (
    <Stack sx={{
        display: 'inline-block',
        '& input': {
            height:15,
          bgcolor: 'background.gray',
          border:"1px",
          borderStyle:"rounded",
          Size:'small',
          color: (theme) =>
            theme.palette.getContrastText(theme.palette.background.paper),
        }, width: 420,
      }}>
      <Autocomplete
        id="free-solo-demo"
        selectOnFocus
        freeSolo
      clearOnBlur
      handleHomeEndKeys
        onChange={(e,newValue)=>{inputs.setTokenAddress(newValue)}}
        options={inputs.tokenList.map((option) => option.token_address)}
        renderInput={(params) => <TextField {...params}    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" label={inputs.inputLabel}  />}
      />

    </Stack>
  );
}


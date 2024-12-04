import React from 'react';
import './App.css';
import SearchComponent from './components/SearchComponent';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <div className="App">
        <SearchComponent />
      </div>
    </ChakraProvider>
  );
}

export default App;
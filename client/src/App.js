import logo from './logo.svg';
import './App.css';

const getListByDate = async (date) => {
  const axios = require('axios');

  const options = {
    method: 'GET',
    url: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-date',
    params: {
      Category: 'basketball',
      Date: '20240318',
      Timezone: '-5'
    },
    headers: {
      'X-RapidAPI-Key': 'fbdda89d74msh7b990edc2ea51eep1bcd58jsn73008d56b75f',
      'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

const getMatchResult = async (id) => {
  const axios = require('axios');

  const options = {
    method: 'GET',
    url: 'https://livescore6.p.rapidapi.com/matches/v2/get-scoreboard',
    params: {
      Category: 'basketball',
      Eid: '1057946'
    },
    headers: {
      'X-RapidAPI-Key': 'fbdda89d74msh7b990edc2ea51eep1bcd58jsn73008d56b75f',
      'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

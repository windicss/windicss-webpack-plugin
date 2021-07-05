import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div >
      <header className="flex items-center justify-center flex-col w-full h-screen">
        <img src={logo} className="animated animate-spin w-50 h-50" alt="logo" />
        <p className="bg-blue-500 p-3 rounded">
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

import './App.css';
import MultipleImageUpload from './components/file_upload';
import Dashboard from './components/dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        {/* Add navigation links */}
        <nav>
          <ul>
            <li><a href="/">Upload</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </nav>

        {/* Define your routes */}
        <Routes>
          <Route path="/" element={<MultipleImageUpload/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;

{/* <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
          <MultipleImageUpload/>
        
      </header>
    </div> */}
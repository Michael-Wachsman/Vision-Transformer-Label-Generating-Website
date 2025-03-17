import logo from './logo.svg';
import './App.css';
import MultipleImageUpload from './components/file_upload';
import DisplayAnnotations from './components/display_annotations';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <MultipleImageUpload/>
        </p>
        
      </header>
    </div>
  );
}

export default App;

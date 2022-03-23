import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Main from './components/Main';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Navbar />
    <div className='container flex flex-wrap justify-center items-center mx-auto'>
      <Main />
    </div>
    <Footer />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();

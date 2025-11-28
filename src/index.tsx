import ReactDOM from 'react-dom/client';
import './index.css';
import  { Toaster } from 'react-hot-toast';
import App from './App';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <>
      <App />
      {/* <AppTest /> */}
      <Toaster/>
    </>
);
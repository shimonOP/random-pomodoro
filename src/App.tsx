
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { orange } from '@mui/material/colors';
import './App.css';
import { AppCore } from './AppCore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { createContext } from 'react';
import { browserLanguage, TLL } from './langs/TransLangs';
import HowToUsePage from './pages/HowToUsePage';
import { DiceTodoProvider } from './contexts/DiceTodoContext';

const theme = createTheme({
  components: {
    //`MuiCssBaseline`になっているが`CssBaseLine`ても同様に作用した
    MuiCssBaseline: {
      styleOverrides: `
          ::-webkit-scrollbar-thumb {
              border-radius: 12px;
              background-color:darkgray;
          }
          `
    },
  },
  typography: {
    fontSize: 12,
    button: {
      textTransform: "none"
    }
  },
  palette: {
    text: {
      primary: "#000000c1"
    },
    primary: { 500: "#4169E1" },
    secondary: orange,
  }
});

export const TLLContext = createContext(new TLL(browserLanguage));
function App() {
  const page = <DiceTodoProvider><AppCore ></AppCore></DiceTodoProvider>
  theme.palette.background.default = "whitesmoke";

  return (
      <TLLContext.Provider value={new TLL(browserLanguage)}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  page
                }>
              </Route>
              <Route path="/terms-of-service/" element={<TermsOfServicePage></TermsOfServicePage>}></Route>
              <Route path="/privacy-policy/" element={<PrivacyPolicyPage></PrivacyPolicyPage>}></Route>
              <Route path="/how-to-use/" element={<HowToUsePage></HowToUsePage>}></Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TLLContext.Provider>
  )
}

export default App;

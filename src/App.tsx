
import { AppCore } from './AppCore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { createContext } from 'react';
import { browserLanguage, TLL } from './langs/TransLangs';
import HowToUsePage from './pages/HowToUsePage';


export const TLLContext = createContext(new TLL(browserLanguage));
function App() {
  const page = <AppCore ></AppCore>

  return (
      <TLLContext.Provider value={new TLL(browserLanguage)}>
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
      </TLLContext.Provider>
  )
}

export default App;

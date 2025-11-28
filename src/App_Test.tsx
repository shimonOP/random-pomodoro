import { createContext } from 'react';
import { browserLanguage, TLL } from './langs/TransLangs';


export const TLLContext = createContext(new TLL(browserLanguage));
function AppTest() {
  return (
    <div className="p-10 space-y-4">
      <button className="btn">Default</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
    </div>
  )
}

export default AppTest;

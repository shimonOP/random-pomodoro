import { TranslationLanguages } from '../langs/TransLangs';
export type Languages = "japanese"|"english"
export const languages:readonly Languages[] = ["japanese", "english"] 
export const lang2SpeechLang=(lang:Languages):string =>{
    switch (lang) {
        case "japanese":
            return 'ja-JP'
        case "english":
            return 'en'
        default:
            return 'en'
    }
}
export const translateLanguage2Lang=(tl:TranslationLanguages):Languages=>{
    switch (tl) {
        case "ja":
            return "japanese"
        default:
            return "english"
    }
}
export const lang2TranslateLanguage=(lang:Languages):TranslationLanguages =>{
    switch (lang) {
        case "japanese":
            return "ja" 
        default:
            return "en"
    }
}
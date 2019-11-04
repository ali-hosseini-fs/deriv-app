import { localize } from 'deriv-translations/lib/i18n';
// const t = key => (key in translation ? translation[key] : fallbackLang[key]);


export const translate = str => str;
// export const translate = str => (str && t(sha1(str))) || str;

// TODO: fix this for translating category names supplied to Blockly.
export const translateLangToLang = (str, fromLang, toLang) => {
    // if (supportedLanguages[fromLang]) {
    //     const hashIndex = Object.values(supportedLanguages[fromLang]).findIndex(translatedStr => str === translatedStr);
    //     if (hashIndex !== -1) {
    //         const hash = Object.keys(supportedLanguages[fromLang])[hashIndex];
    //         const translatedStr = supportedLanguages[toLang][hash];
    //         if (translatedStr) {
    //             return translatedStr;
    //         }
    //     }
    // }
    return str;
};

// TODO: fix this for translating category names supplied to Blockly.
export const xml = dom => {
    const categories = Array.from(dom.getElementsByTagName('category') || []);
    categories.forEach(child => {
        const text = child.getAttribute('i18n-text');
        if (text) {
            child.setAttribute('name', localize(text));
        }
        xml(child);
    });
    return dom;
};

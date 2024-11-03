import fsModule from 'fs';

const fs = fsModule.promises;

function Theme ({ name, group, tokenFiles }) {
    return {
        name, group, tokenFiles,
    };
}

Theme.of = (tokensPath, themeEntry, metadata) => Theme({
    name: themeEntry.name,
    group: themeEntry.group,
    tokenFiles: metadata.tokenSetOrder
        .filter(tokenSet => themeEntry.selectedTokenSets[tokenSet] && themeEntry.selectedTokenSets[tokenSet] && themeEntry.selectedTokenSets[tokenSet] !== 'disabled')
        .map(tokenSet => `${process.cwd()}/${tokensPath}/${tokenSet.replaceAll(' ', '')}.json`),
 
});

async function loadThemes (tokensPath) {
    const themes = JSON.parse(await fs.readFile(process.cwd() + `${tokensPath}/$themes.json`, 'utf-8')); 
    const metadata = JSON.parse(await fs.readFile(process.cwd() + `${tokensPath}/$metadata.json`))

    return themes.map(theme => Theme.of(tokensPath, theme, metadata));
}

export default loadThemes;

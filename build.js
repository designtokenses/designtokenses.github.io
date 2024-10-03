import StyleDictionary from 'style-dictionary';
import fsModule from 'fs';
const fs = fsModule.promises;

async function run () {
    const $themes = JSON.parse(await fs.readFile(process.cwd() + "/tokens/$themes.json", 'utf-8')); 

    const configs = $themes.map(theme => {
        const c = {
            source: Object.entries(theme.selectedTokenSets).filter(([_, val]) => val !== 'disabled').map(([tokenset]) => `${process.cwd()}/tokens/${tokenset.replaceAll(' ', '')}.json`),
            platforms: {
                css: {
                    transforms: [
                        'name/kebab',
                        'color/hex',
                    ],
                    files: [
                        {
                            destination: `build/${theme.name.toLowerCase()}/variables.css`,
                            format: 'css/variables',
                            filter: (token) => token.$type === 'color',
                        }
                    ],

                }

            }
        }

        return c;
        // return {
        //     source: Object.entries(kiwiTheme.selectedTokens).filter(([_, val]) => val !== 'disabled').map(([tokenset]) => `${process.cwd()}/kiwi/tokens/${tokenset.replaceAll(' ', '')}.json`),
        //
        //     platforms: {
        //     }
        // };
    });

    configs.forEach(config => {
        const sd = new StyleDictionary(config);

        sd.buildAllPlatforms();
    });
}

run();

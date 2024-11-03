import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap, getTransforms } from '@tokens-studio/sd-transforms';
import loadThemes from './lib/loadThemes.js';

register(StyleDictionary, {
    withSDBuiltins: false,
});

StyleDictionary.registerFormat({
    name: 'css/theme/variables',
    format: function (dictionary) {
        return `${this.themeName} {\n
${dictionary.allTokens.map(prop => `  --${prop.name}: ${prop.$value};`).join('\n')}
    }`
    }
});

StyleDictionary.registerTransform({
    name: 'assets/background',
    type: 'value',
    filter: (token) => token.$type === 'asset',
    transform: (token) => `url('/${token.$value}')`,
});

// StyleDictionary.registerFilter({
//     name: 'modes',
//     filter: (token) => {
//         return token.$type === 'color' || token.$type === 'asset';
//     }
// })
//
// function File (name, format, filter, theme) {
//     const themeName = theme.name.toLowerCase();
//     return { destination: `build/${themeName}/${name}.css`, filter, format, themeName };
// }
//
// function ModeFile (theme) {
//     return File({
//         name: 'variables',
//         format: 'css/theme/variables',
//         theme,
//         filter: 'no-dimensions',
//     });
// }
//
// function getFileFromTheme (theme) {
//
// }

async function run () {
    const themes = await loadThemes('/tokens');

    const configs = themes.map(theme => {
        return {
            source: theme.tokenFiles,
            preprocessors: ['tokens-studio'],
            expand: {
                typesMap: expandTypesMap,
            },
            platforms: {  
                css: {
                    transforms: [
                        'ts/resolveMath',
                        'ts/typography/fontWeight',
                        'ts/size/lineheight',
                        'name/kebab',
                        'size/pxToRem',
                        'assets/background',
                    ],
                    files: [
                        {
                            destination: `build/${theme.name.toLowerCase()}/variables.css`,
                            format: theme.group === 'mode' ? 'css/theme/variables' : 'css/variables',
                            themeName: `.${theme.name.toLowerCase()}`,
                        }
                    ],
                }

            },

            log: {
                verbosity: 'verbose',
            },
        };
    });


     configs.forEach(config => {
         const sd = new StyleDictionary(config);

         sd.buildAllPlatforms();
     });
}

// -- VERSION WITHOUT lib/loadThemes
// async function run () {
//     const $themes = JSON.parse(await fs.readFile(process.cwd() + "/tokens/$themes.json", 'utf-8')); 
//     const $metadata = JSON.parse(await fs.readFile(process.cwd() + "/tokens/$metadata.json"))
//
//     const configs = $themes.map(theme => {
//         const c = {
//             source: $metadata.tokenSetOrder.filter(tokenSet => theme.selectedTokenSets[tokenSet] && theme.selectedTokenSets[tokenSet] !== 'disabled').map((tokenset) => `${process.cwd()}/tokens/${tokenset.replaceAll(' ', '')}.json`),
//             preprocessors: ['tokens-studio'],
//                 expand: {
//                     typesMap: expandTypesMap,
//                 },
//             platforms: {
//                 css: {
//                     // transformGroup: 'css',
//                     transforms: [
//                         'ts/resolveMath',
//                         'ts/typography/fontWeight',
//                         'ts/size/lineheight',
//                         'name/kebab',
//                         'size/pxToRem',
//                         'assets/background',
//                     ],
//                     files: [
//                         {
//                             destination: `build/${theme.name.toLowerCase()}/variables.css`,
//                             format: theme.group === 'mode' ? 'custom/css/variables' : 'css/variables',
//                             theme: `.${theme.name.toLowerCase()}`,
//                             // filter: (token) => token.$type === 'color' || token.$type === 'asset',
//                         }
//                     ],
//                 }
//
//             },
//
//             log: {
//                 verbosity: 'verbose',
//             },
//
//             // name: theme.name,
//         }
//         //
//         // console.log(c.name);
//         // console.log(c.source);
//
//         return c;
//         // return {
//         //     source: Object.entries(kiwiTheme.selectedTokens).filter(([_, val]) => val !== 'disabled').map(([tokenset]) => `${process.cwd()}/kiwi/tokens/${tokenset.replaceAll(' ', '')}.json`),
//         //
//         //     platforms: {
//         //     }
//         // };
//     });
//
//     configs.forEach(config => {
//             const sd = new StyleDictionary(config);
//
//             sd.buildAllPlatforms();
//     });
// }

run();

import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap, getTransforms } from '@tokens-studio/sd-transforms';
import fsModule from 'fs';
import { isNumber } from 'util';
const fs = fsModule.promises;

const compose = (f, g) => x => f(g(x));

const log = x => {
    console.log(x);
    return x;
};

register(StyleDictionary, {
    withSDBuiltins: false,
});

StyleDictionary.registerFormat({
    name: 'custom/css/variables',
    format: function (dictionary) {
        return `${this.theme} {\n
${dictionary.allTokens.map(prop => `  --${prop.name}: ${prop.$value};`).join('\n')}
    }`
    }
});

// console.log(StyleDictionary.hooks.transforms['size/pxToRem']);
const pxToRem = StyleDictionary.hooks.transforms['size/pxToRem'];
const math = StyleDictionary.hooks.transforms['ts/resolveMath'];

const toRem = px => px / 16; 

StyleDictionary.registerTransform({
    name: 'custom/px/to/rem',
    // transitive: true,
    type: 'value',
    transform: (...params) => {
        // console.log(params[0].$value);
        // return pxToRem.transform(...params);
        return params[0].$value;
    },
    filter: compose(token => token.$type === 'fontSize', log),
});

// StyleDictionary.registerTransform({
//     name: 'custom/resolveMathWithRem',
//     type: 'value',
//     transitive: true,
//     transform: (...params) => {
//         const [token, ...rest] = params;
//         let flag = false;
//         if (token.$value.includes('rem')) {
//             token.$value = token.$value.replaceAll('rem', '');
//             flag = true;
//         }
//         const valueTransformed = math.transform(token, ...rest);
//
//         console.log(valueTransformed);
//         if (flag) {
//             return `${valueTransformed}rem`;
//         } 
//
//
//         return `${toRem(valueTransformed)}rem`;
//     },
//     filter: math.filter,
// });
//
    //
    //
StyleDictionary.registerTransform({
    name: 'custom/math',
    type: 'value',
    transitive: true,
    filter: function(token = {}) {
        return (typeof token.$value === "string" && ['+', '-', '*', '/'].filter(o => token.$value.includes(o)));
    },
    transform: function(token = { $value: '' }) {
        if (token.$value && token.$value.includes("rem")) {
            // let value = token.$value.replaceAll("rem", "");
            let value = token.$value;

            if (value.includes('roundTo')) {
                value = value.replaceAll('roundTo', 'Math.round');
                const [n] = value.match(/(\d+)(rem)/);
                value = value.replace(/(\d+)(rem)/, n + 16);

                console.log(n);
            }

            return ((eval(value) / 16) + 'rem');
        }
        return token.$value;
    }
});

StyleDictionary.registerTransform({
    name: 'assets/background',
    type: 'value',
    // transitive: true,
    filter: (token) => token.$type === 'asset',
    transform: (token) => `url('/${token.$value}')`,
});

const transforms = [...getTransforms({ platform: 'css'}), 'custom/math', 'size/pxToRem', 'assets/background'].filter(t => t !== 'asset/url' && t !== 'ts/resolveMath' && t !== 'ts/size/px');
const transforms_ = [
    'ts/resolveMathWithRem',
    // 'size/pxToRem',
    // 'custom/px/to/rem',
    // 'custom/resolveMath',
    // 'custom/px/to/rem',
];

// console.log(transforms);

StyleDictionary.registerTransformGroup({
    name: 'custom',
    transforms, 
});

async function run () {
    const $themes = JSON.parse(await fs.readFile(process.cwd() + "/tokens/$themes.json", 'utf-8')); 
    const $metadata = JSON.parse(await fs.readFile(process.cwd() + "/tokens/$metadata.json"))

    const configs = $themes.map(theme => {
        const c = {
            // source: Object.entries(theme.selectedTokenSets).filter(([_, val]) => val !== 'disabled').map(([tokenset]) => `${process.cwd()}/tokens/${tokenset.replaceAll(' ', '')}.json`),
            source: $metadata.tokenSetOrder.filter(tokenSet => theme.selectedTokenSets[tokenSet] && theme.selectedTokenSets[tokenSet] !== 'disabled').map((tokenset) => `${process.cwd()}/tokens/${tokenset.replaceAll(' ', '')}.json`),
            preprocessors: ['tokens-studio'],
            expand: {
                typesMap: expandTypesMap,
            },
            platforms: {
                css: {
                    transformGroup: 'tokens-studio',
                    // transformGroup: 'custom',
                    basePxFontSize: 14,
                    transforms: [
                        'size/pxToRem',
                        'name/kebab',
                        // 'ts/resolveMath',
                        // 'ts/size/px',
                        // 'size/pxToRem',
                        // 'color/hex',
                        // 'assets/background'
                    ],
                    files: [
                        {
                            destination: `build/${theme.name.toLowerCase()}/variables.css`,
                            format: theme.group === 'mode' ? 'custom/css/variables' : 'css/variables',
                            theme: `.${theme.name.toLowerCase()}`,
                            // filter: (token) => token.$type === 'color' || token.$type === 'asset',
                        }
                    ],
                }

            },

            log: {
                verbosity: 'verbose',
            },

            // name: theme.name,
        }
        //
        // console.log(c.name);
        // console.log(c.source);

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

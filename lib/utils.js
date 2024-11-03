export const compose = (f, g) => x => f(g(x));

export const log = x => {
    console.log(x);
    return x;
};

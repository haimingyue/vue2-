import babel from 'rollup-plugin-babel';

export default {
    input: './src/index.js',
    output: {
        format: 'umd',
        name: 'Vue',
        file: 'dist/vue.js',
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}
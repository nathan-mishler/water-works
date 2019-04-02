module.exports = {
    entry: __dirname + "/src/app.ts",
    output:{
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.webpack.js', 'web.js', '.ts', '.tsx','.js']
    },
    module: {
        loaders: [
            {test: /\.tsx?$/, loader: 'ts-loader'}
        ]
    }
};
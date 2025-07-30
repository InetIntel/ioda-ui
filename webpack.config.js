const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const Encore = require('@symfony/webpack-encore');

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or sub-directory deploy
    //.setManifestKeyPrefix('build/')

    // enable hash in file name to force cache busting
    .enableVersioning()

    /*
     * ENTRY CONFIG
     *
     * Add 1 entry for each "page" of your app
     * (including one that's included on every page - e.g. "app")
     */
    /* TODO: figure out which entries we want here */
    .addEntry('ioda', ['@babel/polyfill', './assets/js/Ioda/index.js'])

    // yaml-loader
    .addLoader({
        test: require.resolve('yaml-loader'),
        loader: 'yaml-loader',
    })
    .addRule({
        test: /\.ya?ml$/,
        use: 'yaml-loader'
    })

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    //.enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // enables React support
    .enableReactPreset()

    /*
     * Makes webpack consolidate the runtime logic into a single runtime chunk rather
     * than creating a separate runtime chunk for each entry chunk.
     */
    .enableSingleRuntimeChunk()

    // enables Sass/SCSS support
    //.enableSassLoader()

    // uncomment if you use TypeScript
    //.enableTypeScriptLoader()

    // uncomment if you're having problems with a jQuery plugin
    //.autoProvidejQuery()

    .configureBabel()
;

let webpackConfig = Encore.getWebpackConfig();

webpackConfig.resolve.alias = {
    // convenience for accessing our local static assets
    'css': path.resolve(__dirname, './assets/css/'),
    'images': path.resolve(__dirname, './assets/images/'),

    // convenience for accessing our top-level modules
    'utils': path.resolve(__dirname, './assets/js/utils/'),
    'Config': path.resolve(__dirname, './assets/js/config/'),
    'ioda/css': path.resolve(__dirname, './assets/css/Ioda/'),
    'ioda': path.resolve(__dirname, './assets/js/Ioda/'),
};

webpackConfig.plugins.push(
    new CopyWebpackPlugin({
        patterns: [{ from: './assets/images/logos/', to: 'images/'}],
    })
);

webpackConfig.plugins.push(
    new Dotenv({
        path: './.env.local',
    })
);

module.exports = webpackConfig;

const banner = require('rollup-plugin-banner').default;
const json = require('rollup-plugin-json');
const pkg = require('../package.json');
const util = require("./util");
const typescript = require("rollup-plugin-typescript");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

let year = new Date().getFullYear(),
    version = pkg.version;

let bannerText = `h-mysql v${version}
(c) 2018-${year} haizlin https://github.com/haizlin/h-mysql
Licensed MIT
Released on: February 1, 2018`;

const extensions = [".js", ".ts", ".tsx"];

const babelOptions = {
    extensions,
    runtimeHelpers: true,
    presets: [
        [
            "@babel/env",
            {
                modules: false,
                targets: {
                    node: "12.9.1"
                }
            }
        ]
    ]
};

const typescriptOptions = {
    strict: true,
    module: "ES6",
    target: "ESNext"
};

module.exports = {
    input: util.resolve("src/index.ts"),
    plugins: [
        typescript(typescriptOptions),
        nodeResolve({ extensions }),
        commonjs({ extensions, ignore: ["conditional-runtime-dependency"] }),
        babel(babelOptions),
        banner(bannerText),
        json()
    ],
    external: ["schema-verify"]
};

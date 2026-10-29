const util = require("./util");
const baseConfig = require("./rollup.config");

module.exports = {
    ...baseConfig,
    output: {
        file: util.resolve("dist/h-mysql.js"),
        format: "cjs",
        exports: "default" // 入口为 export default，显式声明生成 module.exports = 类，消除 Rollup 隐式模式警告
    }
};

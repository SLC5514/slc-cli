#!/usr/bin/env node

'use strict'

const program = require('commander') // node.js的命令行解决方案，用于自定义命令（如：slc -v）
const version = require('../package.json').version // 工具包版本

program
  .version(version, '-v, --version', 'output the current version') // 输出当前版本
  .helpOption('-h, --help', 'read more information') // 阅读更多信息（重写覆盖默认的帮助标识和描述）

program.usage('<command>') // 修改帮助信息的首行提示

program
  .command('init') // 配置命令
  .description('init a slc blog theme template ') // 初始化一个 slc 博客主题模板
  .alias('i') // 别名
  .action(() => {
    require('../lib/commands/init')
  }) // 执行

program.parse(process.argv) // 解析传递的命令行参数

if (!program.args.length) { // 无命令参数
  program.help() // 显示帮助提示
}

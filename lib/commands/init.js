const { prompt } = require('inquirer') // 一个用户与命令行交互工具，用于自定义项目名（如：? Project name: ）
const program = require('commander') // node.js的命令行解决方案，用于自定义命令（如：slc -v）
const shell = require('shelljs') // 重新包装了child_process,调用系统命令更加简单（如：git clone ... ）
const ora = require('ora') // 实现node.js 命令行环境的 loading效果， 和显示各种状态的图标
const chalk = require('chalk') // 终端字符串样式插件，可改变终端字符串的颜色（如：chalk.green('slc-cli init successfully. Now run:')）
const fs = require('fs')
const config = require('../../templates.json') // 模板配置文件

const option = program.parse(process.argv).args[0] // 参数命令

// 提示界面配置项 https://github.com/SBoudrias/Inquirer.js#inquirerpromptquestions-answers---promise
const question = [
  {
    type: 'input',
    name: 'template',
    message: 'Template name (you can input one like react, vue, angular):',
    default: typeof option === 'string' ? option : 'slc-blog-template',
    filter(val) {
      return val.trim()
    },
    validate(val) {
      // 检验模板中是否存在
      const validate = config.tpl[val]
      if (validate) {
        return true
      }
      return chalk.red('Template does not support!')
    },
    transformer(val) {
      return val
    },
  },
  {
    type: 'input',
    name: 'name',
    message: 'Project name',
    default: typeof option === 'string' ? option : 'slc-blog-template',
    filter(val) {
      return val.trim()
    },
    validate(val) {
      const validate = val.trim().split(' ').length === 1
      return validate || 'Project name is not allowed to have spaces '
    },
    transformer(val) {
      return val
    },
  },
  {
    type: 'input',
    name: 'description',
    message: 'Project description',
    default: 'Vue project',
    validate() {
      return true
    },
    transformer(val) {
      return val
    },
  },
  {
    type: 'input',
    name: 'author',
    message: 'Author',
    default: '',
    validate() {
      return true
    },
    transformer(val) {
      return val
    },
  },
]

module.exports = prompt(question).then(({ template, name, description, author }) => {
  gitUrl = config.tpl[template].url
  branch = config.tpl[template].branch

  const projectName = name
  const spinner = ora('Downloading please wait... \n')

  spinner.start()
  // 克隆模板
  let cmdStr = `git clone -b ${branch} ${gitUrl} ${projectName} `
  // childProcess.exec(cmdStr, function(error, stdout, stderr){
  if (shell.exec(cmdStr).code !== 0) {
    shell.echo('Error: Git clone failed')
    shell.exit(1)
  }

  // 读取package.json
  fs.readFile(`./${projectName}/package.json`, 'utf8', function (err, data) {
    if (err) {
      spinner.stop()
      console.error(err)
      return
    }

    const packageJson = JSON.parse(data)
    packageJson.name = name
    packageJson.description = description
    packageJson.author = author

    // 修改package.json
    fs.writeFile(`./${projectName}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8', function (err) {
      if (err) {
        spinner.stop()
        console.error(err)
      } else {
        spinner.stop()
        console.log(chalk.green('slc-cli init successfully. Now run:'))
        console.log(`
          ${chalk.yellow(`cd ${projectName}`)}
          ${chalk.yellow('npm install (or `yarn`)')}
          ${chalk.yellow('npm run dev (or `yarn dev`)')}
        `)
      }
    })
  })

  console.log(chalk.green('\n √ Generation completed!'))
})

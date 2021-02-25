const { src, dest } = require('gulp');
const { gitDescribeSync } = require('git-describe')
const replace = require('gulp-token-replace')

function defaultTask(cb) {    
    const gitInfo = gitDescribeSync()
    gitInfo.semverString = gitInfo.semverString || gitInfo.raw
    console.info(gitInfo.semverString)
    src(['*.js'])
    .pipe(replace({global:gitInfo}))
    .pipe(dest('./'))
    cb();
  }
  
exports.default = defaultTask
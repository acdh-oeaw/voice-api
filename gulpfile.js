const { src, dest } = require('gulp');
const { gitDescribeSync } = require('git-describe')
const logger = require('gulplog')
const replace = require('gulp-token-replace')

function defaultTask(cb) {    
    const gitInfo = gitDescribeSync()
    gitInfo.semverString = gitInfo.semverString || gitInfo.raw
    logger.info(gitInfo.semverString)
    logger.warn("Replaces placeholders in place. Do not git that.")
    src(['app.js'])
    .pipe(replace({global:gitInfo}))
    .pipe(dest('./'))
    cb();
  }
  
exports.default = defaultTask
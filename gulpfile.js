const { readdirSync } = require('fs');
const { src, dest, parallel, series } = require('gulp');
const del = require('del');
const request = require('request');
const source = require('vinyl-source-stream')
const untar = require('gulp-untar');
const globParent = require('glob-parent');
const { gitDescribeSync } = require('git-describe')
const logger = require('gulplog')
const replace = require('gulp-token-replace')

function gitVersion() {    
    const gitInfo = gitDescribeSync()
    gitInfo.semverString = gitInfo.semverString || gitInfo.raw
    logger.info(gitInfo.semverString)
    logger.warn("Replaces placeholders in place. Do not git that.")
    return src(['app.js'])
    .pipe(replace({global:gitInfo}))
    .pipe(dest('./'))
  }

function downloadData() {
  logger.info("Downloading VOICE XML data")
  let gitlabRequest = request.defaults({
    headers: {'PRIVATE-TOKEN': 'q3_c-GvQ_sV6upEw1xJE'}
  })
  return gitlabRequest('https://gitlab.com/api/v4/projects/21073173/repository/archive.tar')
  .pipe(source('archive.tar'))
  .pipe(untar())
  .pipe(dest('./'))
}

function copyXML() {
  logger.info("Copying VOICE XML data into the xmlfiles folder")
  let voiceData = readdirSync('./').filter( entry => entry.startsWith('voice_data') )[0]
  return src(voiceData + "/101_derived/VOICE3.0XML/XML/*.xml")
  .pipe(dest('xmlfiles'))
}

function removeDownloaded() {
  logger.info("Removing downloaded data")
  let voiceData = readdirSync('./').filter( entry => entry.startsWith('voice_data') )[0]
  return del([voiceData])
}

exports.default = parallel(gitVersion, series(downloadData, copyXML, removeDownloaded))
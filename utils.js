import AsyncLock from 'async-lock';
import { existsSync, mkdirSync, copyFile, writeFile, unlink } from 'fs'
import config from './config.json' assert {type: 'json'};

/** 是否是隐藏文件夹 */
export function isStartWithDot(file = '') {
  return file.startsWith('.');
}

/** 是否是指定扩展名的文件 */
export function isTargetFileType(extensions = []) {
  return function (fileName = '',) {
    const nameSplits = fileName.split('.');
    const ext = nameSplits[nameSplits.length-1];
    return extensions.includes(ext);
  }
}

/** 移动文件到指定文件夹 */
const LOCK_KEY = 'err-log';
const asyncLock = new AsyncLock();
export function moveFileToTargetDir({ filePath = '', targetDir = '', fileName }) {
  // 如果目标文件夹不存在，则创建一个
  if (!existsSync(targetDir)) mkdirSync(targetDir);

  // 执行文件复制
  copyFile(filePath, `${targetDir}/${fileName}`, function (err) {
    if (err) {
      asyncLock.acquire(LOCK_KEY, function () {
        writeFile(config.errorLogFilePath, `copy err: ${filePath}\n`, {flag: 'a'}, function (e) {
          console.log('copy filed write log error: ', e);
        })
      })
    }
    console.log(`${filePath} is copied!`)

    // 复制完成后删除原文件
    unlink(filePath, function (err) {
      if (err) {
        asyncLock.acquire(LOCK_KEY, function () {
          writeFile(config.errorLogFilePath, `unlink err: ${filePath}\n`, {flag: 'a'}, function (e) {
            console.log('delete filed write log error: ', e);
          })
        })
      }
      console.log(`${filePath} is deleted!`)
    })
  })
}

/** 是否是js文件 */
export const isJs = isTargetFileType(['js', 'cjs'])

/** 是否是vue文件 */
export const isVue = isTargetFileType(['vue'])

/** 是否是图片文件 */
export const isImage = isTargetFileType(['bmp','jpg','png','tif','gif','pcx','tga','exif','fpx','svg','psd','cdr','pcd','dxf','ufo','eps','ai','raw','WMF','webp','avif','apng'])

/** 是否是视频文件 */
export const isVideo = isTargetFileType(['wmv','avi','dat','asf','mpeg','mpg','rm','rmvb','ram','flv','mp4','3gp','mov','divx','dv','vob','mkv','qt','cpk','fli','flc','f4v','m4v','mod','m2t','swf','webm','mts','m2ts'])
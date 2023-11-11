import { readdirSync, statSync } from 'fs'
import dayjs from 'dayjs';
import { resolve } from 'path'
import config from './config.json' assert {type: 'json'};
import { isImage, isVideo, isStartWithDot, moveFileToTargetDir } from './utils.js'

console.log(config.targetDirPath);

function main(path = '', targetPath = '') {
  const files = readdirSync(path);
  const fileList = files.map(file => ({name: file, parentPath: path}))

  // 广度优先遍历文件（防止爆栈）
  while (fileList.length) {
    const { name, parentPath } = fileList.shift();
    const filePath = resolve(parentPath, name);
    // 如果是隐藏文件跳过
    if (isStartWithDot(name)) continue;

    const fileStat = statSync(filePath);
    // 如果是文件夹
    if (fileStat.isDirectory()) {
      const subFiles = readdirSync(filePath);
      const subFileList = subFiles.map(file => ({name: file, parentPath: filePath}));
      fileList.push(...subFileList);
      continue;
    }

    // 如果是文件则继续
    const targetDirName = dayjs(new Date(fileStat.ctime || fileStat.mtime)).format('YYYY-MM');
    if (isImage(name)) {
      moveFileToTargetDir({
        filePath,
        targetDir: `${config.imageTargetDirPath}/${targetDirName}`,
        fileName: name
      });
    }

    if (isVideo(name)) {
      moveFileToTargetDir({
        filePath,
        targetDir: `${config.videoTargetDirPath}/${targetDirName}`,
        fileName: name
      });
    }
  }
}

main(config.sourceDirPath, config.targetDirPath);
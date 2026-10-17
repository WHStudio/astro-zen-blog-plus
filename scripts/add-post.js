import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function resolvePostPath(filename, blogDir) {
    if (!filename || typeof filename !== 'string' || filename.trim() !== filename) {
        throw new Error('请提供文件名，且不要包含首尾空白。');
    }
    if (filename.includes('/') || filename.includes('\\') || filename.includes('\0') || filename === '.' || filename === '..') {
        throw new Error('文件名不能包含路径分隔符。');
    }

    const resolvedBlog = path.resolve(blogDir);
    const postPath = path.resolve(resolvedBlog, `${filename}.md`);
    const relative = path.relative(resolvedBlog, postPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('文件名不能跳出内容目录。');
    }
    return postPath;
}

export function formatLocalTimestamp(date) {
    const pad = (value) => String(value).padStart(2, '0');
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteMinutes = Math.abs(offsetMinutes);
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}:00.000${sign}${pad(Math.floor(absoluteMinutes / 60))}:${pad(absoluteMinutes % 60)}`;
}

function isDirectRun() {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

function main() {
    const filename = process.argv[2];
    let postPath;
    try {
        postPath = resolvePostPath(filename, path.join('src', 'content', 'blog'));
    } catch (error) {
        console.log(`\x1b[38;2;255;100;0m${error instanceof Error ? error.message : error}\x1b[0m`);
        console.log('\x1b[38;2;255;150;0m用法: node scripts/add-post.js <filename>\x1b[0m');
        process.exit(1);
    }

    if (fs.existsSync(postPath)) {
        console.error(`文件已存在：${postPath}`);
        process.exit(1);
    }

    const date = formatLocalTimestamp(new Date());
    const content = `---
title: 标题
description: 在此处添加描述
created: ${date}
updated: ${date}
tags: []
hidden: false
---

在此处写入内容...
`;

    fs.mkdirSync(path.dirname(postPath), { recursive: true });
    fs.writeFileSync(postPath, content, { flag: 'wx' });
    console.log(`Created new post at: ${postPath}`);
    console.log('\x1b[38;2;100;255;100m✓\x1b[38;2;150;255;150m Post created successfully!\x1b[0m');
}

if (isDirectRun()) {
    main();
}

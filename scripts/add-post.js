import fs from 'fs';
import path from 'path';

const filename = process.argv[2];

if (!filename) {
    console.log("\x1b[38;2;255;100;0mUsage: node scripts/add-post.js <filename>\x1b[0m");
    console.log("\x1b[38;2;255;150;0mFile will be created in src/content/blog/ directory\x1b[0m");
    process.exit(1);
}

// 获取当前UTC时间，精确到分钟
const now = new Date();
const date = now.toISOString().slice(0, 16) + ':00.000Z'; // 格式: YYYY-MM-DDTHH:MM:00.000Z
const postPath = path.join('src', 'content', 'blog', `${filename}.md`);

const content = `---
title: 标题
description: 在此处添加描述
created: ${date}
updated: ${date}
tags: []
image: ""
hidden: false
---

在此处写入内容...
`;

fs.mkdirSync(path.dirname(postPath), { recursive: true });
fs.writeFileSync(postPath, content);
console.log(`Created new post at: ${postPath}`);
console.log("\x1b[38;2;100;255;100m✓\x1b[38;2;150;255;150m Post created successfully!\x1b[0m");

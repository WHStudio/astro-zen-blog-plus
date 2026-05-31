#!/usr/bin/env bash

set -Eeuo pipefail

ARCHIVE_PATH="/root/dist.tar.gz"
TARGET_DIR="/var/www/blog/dist"
TARGET_PARENT="$(dirname "$TARGET_DIR")"
TMP_DIR="$(mktemp -d /tmp/blog-dist-deploy-XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

if [[ $EUID -ne 0 ]]; then
  echo "请使用 root 用户执行此脚本。" >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "未找到压缩包：$ARCHIVE_PATH" >&2
  exit 1
fi

if ! command -v tar >/dev/null 2>&1; then
  echo "系统未安装 tar，无法解压 dist.tar.gz" >&2
  exit 1
fi

echo "==> 解压到临时目录：$TMP_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"

if [[ ! -d "$TMP_DIR/dist" ]]; then
  echo "压缩包内容不符合预期，未找到 dist 目录。" >&2
  exit 1
fi

echo "==> 删除旧目录：$TARGET_DIR"
rm -rf "$TARGET_DIR"

echo "==> 确保目标父目录存在：$TARGET_PARENT"
mkdir -p "$TARGET_PARENT"

echo "==> 部署新文件到：$TARGET_DIR"
mv "$TMP_DIR/dist" "$TARGET_DIR"

echo "==> 删除压缩包：$ARCHIVE_PATH"
rm -f "$ARCHIVE_PATH"

echo "部署完成：$TARGET_DIR"

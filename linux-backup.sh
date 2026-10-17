#!/usr/bin/env bash
# 打包并覆盖还原站点自定义内容和已发布文章，便于迁移。
# 包含: src/config.ts、public/、src/content/blog/
# 不包含主题代码、依赖和构建结果。

set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_NAME="azbp-content-manifest.txt"
MAGIC="azbp-content-backup"
FORMAT_VERSION="1"

TMP=""
STAGE=""

cleanup() {
  if [[ -n "$TMP" ]]; then
    rm -rf "$TMP"
  fi
  if [[ -n "$STAGE" ]]; then
    rm -rf "$STAGE"
  fi
}

trap cleanup EXIT

die() {
  echo "错误: $*" >&2
  exit 1
}

usage() {
  cat <<EOF
用法:
  ./linux-backup.sh [pack] [-o 压缩包] [-y]
  ./linux-backup.sh unpack [-y] <压缩包>

不带参数时执行 pack。

打包内容（相对项目根目录）:
  src/config.ts        站点自定义配置
  public/              图标等静态资源
  src/content/blog/    已发布文章

unpack 会用压缩包里的上述内容替换当前项目，压缩包中没有的文章和静态文件会被删除。
脚本所在目录视为项目根目录，可从任意工作目录执行。

示例:
  ./linux-backup.sh pack
  ./linux-backup.sh unpack ./content-backup-20261017-120000.tar.gz
EOF
}

require_tar() {
  command -v tar >/dev/null 2>&1 || die "未找到 tar。"
}

require_project() {
  if [[ ! -f "$ROOT/astro.config.mjs" || ! -f "$ROOT/src/config.ts" || ! -f "$ROOT/src/content.config.ts" || ! -d "$ROOT/src/content/blog" || ! -d "$ROOT/public" ]]; then
    die "脚本需要位于 astro-zen-blog-plus 项目根目录。未在 $ROOT 找到完整的站点内容。"
  fi
  if [[ ! -f "$ROOT/src/config.ts" || -L "$ROOT/src/config.ts" ]]; then
    die "src/config.ts 必须是普通文件。"
  fi
  if [[ ! -d "$ROOT/src/content/blog" || -L "$ROOT/src/content/blog" ]]; then
    die "src/content/blog 必须是普通目录。"
  fi
  if [[ ! -d "$ROOT/public" || -L "$ROOT/public" ]]; then
    die "public 必须是普通目录。"
  fi
}

residue_paths() {
  printf '%s\n' \
    "$ROOT/src/.config.ts.replaced-bak" \
    "$ROOT/src/content/.blog.replaced-bak" \
    "$ROOT/.public.replaced-bak" \
    "$ROOT/src/.config.ts.incoming" \
    "$ROOT/src/content/.blog.incoming" \
    "$ROOT/.public.incoming"
}

assert_no_residue() {
  local path
  while IFS= read -r path; do
    if [[ -e "$path" || -L "$path" ]]; then
      die "发现未完成的还原残留：$path。请先确认项目内容完整并移走该残留后再试。"
    fi
  done < <(residue_paths)
}

normalize_entry() {
  local entry="$1"
  entry="${entry//$'\r'/}"
  entry="${entry//\\//}"
  while [[ "$entry" == ./* ]]; do
    entry="${entry#./}"
  done
  entry="${entry#/}"
  while [[ "$entry" == */ ]]; do
    entry="${entry%/}"
  done
  printf '%s' "$entry"
}

assert_entry_allowed() {
  local entry="$1"
  local normalized part
  local -a parts=()
  normalized="$(normalize_entry "$entry")"
  if [[ -z "$normalized" || "$normalized" == *:* ]]; then
    die "压缩包包含非法路径：$entry"
  fi
  local IFS='/'
  read -r -a parts <<< "$normalized"
  for part in "${parts[@]}"; do
    if [[ -z "$part" || "$part" == "." || "$part" == ".." ]]; then
      die "压缩包包含非法路径：$entry"
    fi
  done
  case "$normalized" in
    "$MANIFEST_NAME"|src/config.ts|src/content/blog|public|src/content/blog/*|public/*)
      NORMALIZED_ENTRY="$normalized"
      ;;
    *)
      die "压缩包包含未预期的路径：$normalized"
      ;;
  esac
}

assert_listing() {
  local archive="$1"
  local listing normalized
  local seen_manifest=0 seen_config=0 seen_blog=0 seen_public=0
  if ! listing="$(tar -tf "$archive")"; then
    die "无法读取压缩包：$archive"
  fi
  if [[ -z "$listing" ]]; then
    die "压缩包是空的：$archive"
  fi
  while IFS= read -r entry; do
    [[ -z "$entry" ]] && continue
    NORMALIZED_ENTRY=""
    assert_entry_allowed "$entry"
    normalized="$NORMALIZED_ENTRY"
    case "$normalized" in
      "$MANIFEST_NAME") seen_manifest=1 ;;
      src/config.ts) seen_config=1 ;;
      src/content/blog|src/content/blog/*) seen_blog=1 ;;
      public|public/*) seen_public=1 ;;
    esac
  done <<< "$listing"
  if [[ "$seen_manifest" -ne 1 || "$seen_config" -ne 1 || "$seen_blog" -ne 1 || "$seen_public" -ne 1 ]]; then
    die "压缩包缺少站点配置、文章、静态资源或备份清单。"
  fi
}

assert_manifest() {
  local manifest="$1"
  local line key value
  local -a paths=()
  local magic="" version=""
  [[ -f "$manifest" && ! -L "$manifest" ]] || die "不是内容备份包：缺少 $MANIFEST_NAME。"
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line//$'\r'/}"
    line="${line#$'\xEF\xBB\xBF'}"
    [[ -z "$line" ]] && continue
    [[ "$line" == *=* ]] || die "备份清单格式不正确。"
    key="${line%%=*}"
    value="${line#*=}"
    case "$key" in
      magic) magic="$value" ;;
      version) version="$value" ;;
      paths) paths+=("$value") ;;
      created|posts|public_files) ;;
      *) die "备份清单包含未知字段：$key" ;;
    esac
  done < "$manifest"
  [[ "$magic" == "$MAGIC" ]] || die "不是本项目的内容备份包。"
  [[ "$version" == "$FORMAT_VERSION" ]] || die "不支持的备份版本：$version"
  local expected actual
  expected="$(printf '%s\n' public src/config.ts src/content/blog | sort)"
  actual="$(printf '%s\n' "${paths[@]}" | sort)"
  [[ "$actual" == "$expected" ]] || die "备份清单中的路径与当前脚本不一致。"
}

assert_plain_tree() {
  local root="$1"
  local found
  found="$(find "$root" \( -type l -o \( ! -type f -a ! -type d \) \) -print)"
  if [[ -n "$found" ]]; then
    die "发现符号链接或特殊文件，已拒绝。"
  fi
}

assert_extracted_tree() {
  local root="$1"
  assert_plain_tree "$root"
  [[ -f "$root/src/config.ts" ]] || die "备份包中的 src/config.ts 不可用。"
  [[ -d "$root/src/content/blog" ]] || die "备份包中的 src/content/blog 不可用。"
  [[ -d "$root/public" ]] || die "备份包中的 public 不可用。"
  assert_manifest "$root/$MANIFEST_NAME"
}

resolve_archive_path() {
  local archive="$1"
  if [[ "$archive" != /* ]]; then
    archive="$(pwd)/$archive"
  fi
  printf '%s' "$archive"
}

assert_archive_location() {
  local archive="$1"
  local archive_real root_real
  archive_real="$(realpath -m "$archive")"
  root_real="$(realpath -m "$ROOT")"
  case "$archive_real" in
    "$root_real/public"|"$root_real/public/"*| \
      "$root_real/src/content/blog"|"$root_real/src/content/blog/"*| \
      "$root_real/src/config.ts")
      die "压缩包不能放在 src/config.ts、public 或 src/content/blog 里面。"
      ;;
  esac
}

count_files() {
  local dir="$1"
  local markdown_only="$2"
  if [[ "$markdown_only" -eq 1 ]]; then
    find "$dir" -type f -name '*.md' \
      ! -name '.DS_Store' ! -name 'Thumbs.db' ! -name 'desktop.ini' \
      ! -path '*/node_modules/*' ! -path '*/.git/*' \
      | wc -l | tr -d ' '
  else
    find "$dir" -type f \
      ! -name '.DS_Store' ! -name 'Thumbs.db' ! -name 'desktop.ini' \
      ! -path '*/node_modules/*' ! -path '*/.git/*' \
      | wc -l | tr -d ' '
  fi
}

write_manifest() {
  local dest="$1"
  local posts public_files created
  posts="$(count_files "$ROOT/src/content/blog" 1)"
  public_files="$(count_files "$ROOT/public" 0)"
  created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  cat > "$dest" <<EOF
magic=$MAGIC
version=$FORMAT_VERSION
created=$created
paths=src/config.ts
paths=src/content/blog
paths=public
posts=$posts
public_files=$public_files
EOF
}

confirm_overwrite() {
  local extracted="$1"
  local archive="$2"
  local yes="$3"
  local posts
  posts="$(count_files "$extracted/src/content/blog" 1)"
  echo "即将用压缩包覆盖以下内容："
  echo "  src/config.ts"
  echo "  public/"
  echo "  src/content/blog/（$posts 篇 Markdown）"
  echo "压缩包：$archive"
  echo "这些位置上、压缩包里没有的文件会被删除。"
  if [[ "$yes" -eq 1 ]]; then
    return 0
  fi
  if [[ ! -t 0 ]]; then
    die "非交互环境请追加 -y 确认覆盖。"
  fi
  local answer
  read -r -p "继续？[y/N] " answer
  case "$answer" in
    y|Y|yes|YES|Yes|是) ;;
    *) die "已取消。" ;;
  esac
}

replace_one() {
  local rel="$1"
  local incoming="$2"
  local dest="$ROOT/$rel"
  local parent leaf staged backup
  parent="$(dirname "$dest")"
  leaf="$(basename "$dest")"
  staged="$parent/.$leaf.incoming"
  backup="$parent/.$leaf.replaced-bak"
  mkdir -p -- "$parent" || return 1
  rm -rf -- "$staged" || return 1
  cp -a -- "$incoming" "$staged" || return 1
  if [[ -e "$dest" || -L "$dest" ]]; then
    mv -- "$dest" "$backup" || return 1
  fi
  if ! mv -- "$staged" "$dest"; then
    if [[ -e "$backup" || -L "$backup" ]]; then
      mv -- "$backup" "$dest" || true
    fi
    return 1
  fi
  return 0
}

rollback_replaced() {
  local -a done_rels=("$@")
  local rel dest parent leaf backup
  local i
  for ((i=${#done_rels[@]}-1; i>=0; i--)); do
    rel="${done_rels[$i]}"
    dest="$ROOT/$rel"
    parent="$(dirname "$dest")"
    leaf="$(basename "$dest")"
    backup="$parent/.$leaf.replaced-bak"
    rm -rf "$dest"
    if [[ -e "$backup" || -L "$backup" ]]; then
      mv "$backup" "$dest"
    fi
  done
  rm -rf "$ROOT/src/.config.ts.incoming" "$ROOT/src/content/.blog.incoming" "$ROOT/.public.incoming"
}

remove_backups() {
  rm -rf \
    "$ROOT/src/.config.ts.replaced-bak" \
    "$ROOT/src/content/.blog.replaced-bak" \
    "$ROOT/.public.replaced-bak"
}

apply_extracted_tree() {
  local extracted="$1"
  local -a rels=(src/config.ts src/content/blog public)
  local -a done_rels=()
  local rel
  for rel in "${rels[@]}"; do
    if ! replace_one "$rel" "$extracted/$rel"; then
      rollback_replaced "${done_rels[@]}"
      die "覆盖 $rel 失败，已尝试回滚。"
    fi
    done_rels+=("$rel")
  done
  remove_backups
}

pack_archive() {
  local archive="$1"
  local yes="$2"
  require_tar
  require_project
  assert_no_residue
  assert_archive_location "$archive"
  if [[ -e "$archive" && "$yes" -ne 1 ]]; then
    die "压缩包已存在：$archive（追加 -y 覆盖）"
  fi
  if [[ -d "$archive" ]]; then
    die "压缩包路径是目录：$archive"
  fi
  mkdir -p "$(dirname "$archive")"

  assert_plain_tree "$ROOT/src/content/blog"
  assert_plain_tree "$ROOT/public"
  STAGE="$(mktemp -d)"
  write_manifest "$STAGE/$MANIFEST_NAME"
  local partial="$STAGE/archive.tar.gz"
  echo "==> 打包 src/config.ts、public/、src/content/blog/"
  tar -czf "$partial" \
    --format pax \
    --exclude .DS_Store \
    --exclude Thumbs.db \
    --exclude desktop.ini \
    --exclude node_modules \
    --exclude .git \
    -C "$ROOT" src/config.ts src/content/blog public \
    -C "$STAGE" "$MANIFEST_NAME"

  assert_listing "$partial"
  TMP="$(mktemp -d)"
  tar -xzf "$partial" -C "$TMP"
  assert_extracted_tree "$TMP"
  local posts public_files
  posts="$(count_files "$TMP/src/content/blog" 1)"
  public_files="$(count_files "$TMP/public" 0)"
  rm -rf "$TMP"
  TMP=""

  mv -f "$partial" "$archive"
  rm -rf "$STAGE"
  STAGE=""

  local bytes kb
  bytes="$(wc -c < "$archive" | tr -d ' ')"
  kb="$(awk -v bytes="$bytes" 'BEGIN { printf "%.2f", bytes/1024 }')"
  echo "==> 已打包站点配置、静态资源和已发布文章"
  echo "    文章: $posts 篇"
  echo "    静态文件: $public_files 个"
  echo "    压缩包: $archive"
  echo "    大小: $kb KB"
  echo "还原覆盖请执行:"
  echo "  ./linux-backup.sh unpack $archive"
}

unpack_archive() {
  local archive="$1"
  local yes="$2"
  require_tar
  require_project
  assert_no_residue
  archive="$(resolve_archive_path "$archive")"
  assert_archive_location "$archive"
  [[ -f "$archive" ]] || die "未找到压缩包：$archive"
  assert_listing "$archive"

  TMP="$(mktemp -d)"
  echo "==> 检查备份包"
  tar -xzf "$archive" -C "$TMP"
  assert_extracted_tree "$TMP"
  confirm_overwrite "$TMP" "$archive" "$yes"
  echo "==> 覆盖 src/config.ts、public/、src/content/blog/"
  apply_extracted_tree "$TMP"
  local posts
  posts="$(count_files "$ROOT/src/content/blog" 1)"
  rm -rf "$TMP"
  TMP=""
  echo "==> 已覆盖还原"
  echo "    src/config.ts"
  echo "    public/"
  echo "    src/content/blog/（$posts 篇 Markdown）"
  echo "可以执行 pnpm dev 或 pnpm build 查看站点。"
}

pack_main() {
  local archive=""
  local yes=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o|--output)
        [[ $# -ge 2 ]] || die "-o 后面需要压缩包路径。"
        archive="$2"
        shift 2
        ;;
      -y|--yes)
        yes=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "无法识别的参数：$1"
        ;;
    esac
  done
  if [[ -z "$archive" ]]; then
    archive="$ROOT/content-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
  else
    archive="$(resolve_archive_path "$archive")"
  fi
  pack_archive "$archive" "$yes"
}

unpack_main() {
  local archive=""
  local yes=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -y|--yes)
        yes=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      --)
        shift
        break
        ;;
      -*)
        die "无法识别的参数：$1"
        ;;
      *)
        if [[ -n "$archive" ]]; then
          die "只能指定一个压缩包。"
        fi
        archive="$1"
        shift
        ;;
    esac
  done
  if [[ $# -gt 0 ]]; then
    die "只能指定一个压缩包。"
  fi
  [[ -n "$archive" ]] || die "请指定要还原的压缩包。例如: ./linux-backup.sh unpack ./content-backup-20261017-120000.tar.gz"
  unpack_archive "$archive" "$yes"
}

main() {
  case "${1:-pack}" in
    -h|--help|help)
      usage
      ;;
    pack)
      shift || true
      pack_main "$@"
      ;;
    unpack|restore)
      shift
      unpack_main "$@"
      ;;
    *)
      die "未知命令：$1。可用命令：pack、unpack。执行 --help 查看用法。"
      ;;
  esac
}

main "$@"

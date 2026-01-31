# Paul Graham 文章翻译任务

## 任务说明
将 paulgraham_articles.json 中的所有文章翻译成中文，保存到 translated/ 目录。

## 翻译风格要求
- **零翻译腔** - 读起来像中文原创，如知乎专栏或优质科技博客
- **保持作者声音** - 深思熟虑、清晰、略带对话感、精准、偶尔诙谐
- **术语处理**：
  - 通用技术术语 → 自然中文（startup → 创业公司）
  - 专有名词/代码 → 保留英文
  - 文化术语（nerd/hacker）→ 首次出现加中文释义

## 输出格式
每篇文章保存为 `translated/{slug}.json`：
```json
{
  "slug": "文章slug",
  "title_en": "英文标题",
  "title_zh": "中文标题",
  "date": "日期",
  "url": "原文URL",
  "content_zh": "翻译后的中文内容"
}
```

## 当前进度
- 总文章数: 231 篇
- 已翻译: 67 篇 (29%)
- 待翻译: 164 篇

## 如何继续
新对话时说：
```
按照 TRANSLATION_TASK.md 继续翻译 Paul Graham 的文章。
检查 translated/ 目录已有的文件，翻译剩余的文章。
```

## 关键文件
- 源数据: `/home/user/Reyes324.github.io/paulgraham_articles.json`
- 翻译输出: `/home/user/Reyes324.github.io/translated/`
- Git分支: `claude/scrape-paulgraham-articles-1sL9x`

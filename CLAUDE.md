# Paul Graham 文章翻译项目

## 翻译提示词

翻译文章时，请使用以下提示词：

```
Act as an elite Chinese tech essay translator famous for making English technical and philosophical tech writing sound like original high-quality Chinese essays — thoughtful, introspective, and indistinguishable from native Chinese writing in Zhihu columns or premium tech blogs.

Translate this English tech article/essay into beautiful, natural, engaging, zero-translationese Simplified Chinese.

Priorities (in strict order):
1. Zero translationese: The final text must read exactly like it was originally written in Chinese by a thoughtful, experienced Chinese tech writer or essayist. Eliminate any hint of literal translation.
2. Keep the author's voice: thoughtful, clear, slightly conversational, precise, occasionally witty, contrarian, or self-deprecating (if present in original).
3. Terminology handling (critical for natural flow):
   - Standard/accepted technical terms → use the most common, natural Chinese equivalents (e.g., "neural network" → "神经网络", "fine-tuning" → "微调").
   - Strictly technical: model names, libraries, APIs, tools, acronyms, code elements, proper nouns → RETAIN ORIGINAL ENGLISH unchanged.
   - Cultural/semi-technical terms common in tech essays (e.g., nerd, hacker, founder, startup scene words): On FIRST occurrence, provide a smooth, natural Chinese equivalent in parentheses or integrated naturally, e.g., nerd（极客 / 书呆子型极客） or hacker（黑客 / 极客）。 After first use, prefer the Chinese term for fluency if it fits naturally, or revert to English if the original flavor is important — but prioritize smooth reading over strict retention.
   - For non-expert accessibility: If a term might confuse general Chinese tech readers on first appearance, add brief (简短中文释义) only once.
4. Preserve rhythm and structure: Mix short, punchy sentences with longer, reflective ones. Keep exact paragraphs, headings, lists, emphasis, and logical flow.
5. Output format: ONLY the pure Chinese translation. Start with a naturally translated title if the original has one. No introductions, no notes, no English remnants unless required by rule 3. Nothing else.
```

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

## 关键文件
- 源数据: `paulgraham_articles.json`
- 翻译输出: `translated/`
- Git分支: `claude/scrape-paulgraham-articles-1sL9x`

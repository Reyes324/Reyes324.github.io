export const TRANSLATE_TO_ZH = (content: string) => `
你是专业的内容翻译专家。请将以下英文内容翻译成自然流畅的中文，保留原文的结构和段落。
只输出译文，不要有任何额外说明。

原文：
${content}
`;

export const SUMMARIZE_CONTENT = (contentZh: string, type: 'video' | 'article') => `
你是专业的内容分析专家。请对以下${type === 'video' ? '视频逐字稿' : '文章'}进行深度分析，生成结构化摘要。

请严格按照以下 JSON 格式输出，不要有任何额外文字：

{
  "core_summary": "核心摘要，200字以内，概括最重要的观点和结论",
  "key_points": [
    "关键观点1",
    "关键观点2",
    "关键观点3",
    "关键观点4",
    "关键观点5"
  ],
  "quotes": [
    "值得记录的金句1",
    "值得记录的金句2",
    "值得记录的金句3"
  ],
  "reflections": [
    "延伸思考问题1",
    "延伸思考问题2"
  ]
}

内容：
${contentZh}
`;

export const GENERATE_PODCAST_SCRIPT = (
  contentZh: string,
  title: string
) => `
你是专业的播客编剧。请将以下内容改编成一段自然、有趣、有深度的中文双人播客对话脚本。

播客主持人设定：
- Alex（男）：理性分析型，喜欢挖掘数据和逻辑，偶尔反问
- Sam（女）：感性共情型，善于联系实际生活，会分享个人感受

要求：
1. 对话自然流畅，有来有往，不要像念稿
2. 总长度约 800-1200 字
3. 保留原内容的核心观点，但用对话方式呈现
4. 可以加入简短的玩笑或感叹，体现真实播客氛围
5. 严格按以下 JSON 格式输出，不要有任何额外文字：

[
  {"speaker": "Alex", "text": "..."},
  {"speaker": "Sam", "text": "..."},
  ...
]

标题：${title}

内容：
${contentZh.slice(0, 8000)}
`;

export const ANNOTATE_SPEAKERS = (transcript: string) => `
以下是一段视频的逐字稿，可能有多个说话人。
请根据上下文推断说话人，并为每个句子标注说话人（用 Speaker A、Speaker B 等）。
只输出 JSON 格式，格式为：[{"speaker": "Speaker A", "text": "..."}]

逐字稿：
${transcript}
`;

let markdownConverter;
let defuddleClass;

async function loadConverter() {
  if (!markdownConverter || !defuddleClass) {
    const [fullModule, defuddleModule] = await Promise.all([
      import('defuddle/full'),
      import('defuddle'),
    ]);

    markdownConverter = fullModule.createMarkdownContent
      ?? fullModule.default?.createMarkdownContent;
    defuddleClass = defuddleModule.default ?? defuddleModule.Defuddle;

    if (typeof markdownConverter !== 'function' || !defuddleClass) {
      throw new Error('Unable to load the Defuddle Markdown converter.');
    }
  }

  return { markdownConverter, defuddleClass };
}

export async function defuddleToMarkdown(document, url) {
  const { markdownConverter, defuddleClass } = await loadConverter();
  const parsed = new defuddleClass(document, { url }).parse();
  const markdown = markdownConverter(parsed.content, url);
  return { parsed, markdown };
}

export async function htmlToMarkdown(html, url) {
  const { markdownConverter } = await loadConverter();
  return markdownConverter(html, url);
}

const POLICIES = {
  markdown: {
    dialect: 'markdown',
    citationStyle: 'markdown',
    sectionIdentifier: (target) => target.anchor,
    sectionLink: (target) => `#${target.anchor}`,
    references: 'footnotes',
    allowHtmlAnchors: false,
  },
  quarto: {
    dialect: 'quarto',
    citationStyle: 'quarto',
    sectionIdentifier: (target) => `sec-${target.anchor}`,
    sectionLink: (target) => `#sec-${target.anchor}`,
    references: 'refs',
    allowHtmlAnchors: false,
  },
  // Kept as an explicit compatibility mode for existing local configurations.
  links: {
    dialect: 'markdown',
    citationStyle: 'links',
    sectionIdentifier: (target) => target.anchor,
    sectionLink: (target) => `#${target.anchor}`,
    references: 'ordered-list',
    allowHtmlAnchors: true,
  },
};

export function outputPolicy(value = 'markdown') {
  return POLICIES[value] || POLICIES.markdown;
}

export function outputDialect(value = 'markdown') {
  return outputPolicy(value).dialect;
}

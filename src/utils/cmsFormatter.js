import { cleanHtml } from './sanitize';

/**
 * Parses CMS content (which can be HTML, Markdown, or plain text)
 * into semantic, accessible, beautifully styled HTML.
 */
export function formatCmsContent(rawContent, pageTitle = '') {
  if (!rawContent || typeof rawContent !== 'string') return '';

  let content = rawContent.trim();

  // Decode common entities
  content = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Check if content is already structured HTML (without markdown headings/bullets)
  const hasHtml = /<\/?(?:p|div|h[1-6]|ul|ol|li|table|blockquote|section|article)\b/i.test(content);
  if (hasHtml && !content.includes('##') && !content.includes('\n- ') && !content.includes('\n* ')) {
    return cleanHtml(content);
  }

  // Parse Markdown / formatted text line by line
  const lines = content.split(/\r?\n/);
  const output = [];
  let inList = false;
  let listType = 'ul'; // 'ul' | 'ol'

  const closeList = () => {
    if (inList) {
      output.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    // Level 1 Heading (# Title)
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      closeList();
      const headingText = h1Match[1].trim();
      // If it duplicates the page title, skip it to avoid double title
      if (pageTitle && headingText.toLowerCase() === pageTitle.toLowerCase()) {
        continue;
      }
      output.push(`<h2 class="cms-h2 cms-main-subhead">${parseInline(headingText)}</h2>`);
      continue;
    }

    // Level 2 Heading (## 1. Section Title)
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      closeList();
      const headingText = h2Match[1].trim();
      const slugId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      output.push(`<h2 id="${slugId}" class="cms-h2"><span class="cms-h2-accent"></span>${parseInline(headingText)}</h2>`);
      continue;
    }

    // Level 3 Heading (### Subtitle)
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      closeList();
      output.push(`<h3 class="cms-h3">${parseInline(h3Match[1].trim())}</h3>`);
      continue;
    }

    // Level 4 Heading (#### Subtitle)
    const h4Match = line.match(/^####\s+(.+)$/);
    if (h4Match) {
      closeList();
      output.push(`<h4 class="cms-h4">${parseInline(h4Match[1].trim())}</h4>`);
      continue;
    }

    // Blockquote (> Quote)
    const quoteMatch = line.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      closeList();
      output.push(`<blockquote class="cms-blockquote">${parseInline(quoteMatch[1].trim())}</blockquote>`);
      continue;
    }

    // Bullet List (- Item or * Item)
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        output.push('<ul class="cms-list">');
        inList = true;
        listType = 'ul';
      }
      output.push(`<li><span class="cms-bullet-dot"></span><span>${parseInline(bulletMatch[1].trim())}</span></li>`);
      continue;
    }

    // Numbered List (1. Item)
    const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        output.push('<ol class="cms-numbered-list">');
        inList = true;
        listType = 'ol';
      }
      output.push(`<li>${parseInline(numMatch[2].trim())}</li>`);
      continue;
    }

    // Regular paragraph
    closeList();
    output.push(`<p class="cms-p">${parseInline(line)}</p>`);
  }

  closeList();

  return cleanHtml(output.join('\n'));
}

function parseInline(text) {
  if (!text) return '';
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="cms-code">$1</code>')
    // Links: [label](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="cms-link" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Extracts Table of Contents headings from CMS content
 */
export function extractTableOfContents(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') return [];
  const headings = [];
  const lines = rawContent.split(/\r?\n/);

  for (const line of lines) {
    const match = line.trim().match(/^##\s+(.+)$/);
    if (match) {
      const text = match[1].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      headings.push({ id, text });
    }
  }

  return headings;
}

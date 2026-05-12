const markdownFiles = import.meta.glob('./projects/*/project.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const imageAssets = import.meta.glob('./projects/*/media/*.{png,jpg,jpeg,gif,webp,avif,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const REMOTE_MEDIA_BASE = (import.meta.env.VITE_PROJECT_MEDIA_BASE || 'https://daveseidmancom.s3.amazonaws.com').replace(/\/$/, '');
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm']);

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const parseScalar = (value) => {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed.replace(/^['"]|['"]$/g, '');
};

const parseFrontmatter = (raw) => {
  if (!raw.startsWith('---\n')) {
    return { data: {}, body: raw };
  }

  const end = raw.indexOf('\n---', 4);
  if (end === -1) {
    return { data: {}, body: raw };
  }

  const frontmatter = raw.slice(4, end).split('\n');
  const body = raw.slice(end + 4).trim();
  const data = {};
  let currentArrayKey = null;

  frontmatter.forEach((line) => {
    if (!line.trim()) return;

    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch && currentArrayKey) {
      data[currentArrayKey].push(parseScalar(arrayMatch[1]));
      return;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) return;

    const [, key, value] = keyMatch;
    if (value === '') {
      data[key] = [];
      currentArrayKey = key;
      return;
    }

    data[key] = parseScalar(value);
    currentArrayKey = null;
  });

  return { data, body };
};

const getExtension = (src) => src.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

const isAbsoluteUrl = (src) => /^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:');

const normalizeRelativePath = (src) => src.replace(/^\.\//, '').replace(/^\/+/, '');

const getRemoteMediaUrl = (projectId, src) => {
  const filename = normalizeRelativePath(src).replace(/^media\//, '');
  return `${REMOTE_MEDIA_BASE}/projects/${projectId}/${filename}`;
};

const getLocalMediaUrl = (projectId, src) => `/src/content/projects/${projectId}/${normalizeRelativePath(src)}`;

const resolveMediaPath = (projectId, src) => {
  if (!src || isAbsoluteUrl(src) || src.startsWith('/')) return src;

  const extension = getExtension(src);
  if (VIDEO_EXTENSIONS.has(extension)) {
    return import.meta.env.DEV
      ? getLocalMediaUrl(projectId, src)
      : getRemoteMediaUrl(projectId, src);
  }

  const assetKey = `./projects/${projectId}/${normalizeRelativePath(src)}`;
  return imageAssets[assetKey] || getLocalMediaUrl(projectId, src);
};

const parseAttributes = (source) => {
  const attributes = {};
  source.replace(/([A-Za-z0-9_-]+)=['"]([^'"]*)['"]/g, (_, key, value) => {
    attributes[key] = value;
    return '';
  });
  return attributes;
};

const renderVideo = (projectId, options) => {
  const src = resolveMediaPath(projectId, options.src);
  const poster = options.poster ? ` poster='${resolveMediaPath(projectId, options.poster)}'` : '';
  return `<video muted src='${src}'${poster} controls='true' playsinline='true'></video>`;
};

const renderVideoShortcodes = (projectId, markdown) => markdown.replace(/::video\n([\s\S]*?)\n::/g, (_, body) => {
  const options = {};
  body.split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (match) {
      options[match[1]] = match[2].trim();
    }
  });
  return options.src ? renderVideo(projectId, options) : '';
});

const renderInlineMarkdown = (projectId, text) => text
  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src='${resolveMediaPath(projectId, src.trim())}' alt='${escapeHtml(alt)}' />`)
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const target = href.startsWith('/') ? '_self' : '_blank';
    return `<a href='${href}' target='${target}'>${label}</a>`;
  })
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>');

const resolveHtmlMedia = (projectId, html) => html
  .replace(/(src|poster)=['"]([^'"]+)['"]/g, (_, attr, src) => `${attr}='${resolveMediaPath(projectId, src)}'`);

const markdownToHtml = (projectId, markdown) => {
  const withVideos = renderVideoShortcodes(projectId, markdown);
  const blocks = withVideos.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block) => {
    const resolvedBlock = resolveHtmlMedia(projectId, renderInlineMarkdown(projectId, block));

    if (resolvedBlock.startsWith('<')) {
      return resolvedBlock;
    }

    return `<p>${resolvedBlock.replace(/\n/g, '<br />')}</p>`;
  }).join('');
};

export const projects = Object.entries(markdownFiles)
  .map(([path, raw]) => {
    const projectId = path.match(/\.\/projects\/([^/]+)\/project\.md$/)[1];
    const { data, body } = parseFrontmatter(raw);

    return {
      ...data,
      projectId,
      desc: markdownToHtml(projectId, body),
      tags: data.tags || [],
    };
  })
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

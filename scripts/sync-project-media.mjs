import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);
const CONTENT_ROOT = 'src/content/projects';
const BUCKET = process.env.S3_MEDIA_BUCKET || 'daveseidmancom';
const PREFIX = (process.env.S3_MEDIA_PREFIX || 'projects').replace(/^\/+|\/+$/g, '');
const DRY_RUN = process.argv.includes('--dry-run');

const CONTENT_TYPES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

const runAws = (args, options = {}) => {
  const result = spawnSync('aws', args, {
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

const listProjectMedia = async () => {
  const projects = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const files = [];

  for (const project of projects) {
    if (!project.isDirectory()) continue;

    const mediaDir = join(CONTENT_ROOT, project.name, 'media');
    let mediaFiles = [];
    try {
      mediaFiles = await readdir(mediaDir, { withFileTypes: true });
    } catch {
      continue;
    }

    mediaFiles.forEach((file) => {
      const extension = extname(file.name).toLowerCase();
      if (file.isFile() && VIDEO_EXTENSIONS.has(extension)) {
        files.push({
          extension,
          path: join(mediaDir, file.name),
          key: `${PREFIX}/${project.name}/${file.name}`,
        });
      }
    });
  }

  return files;
};

const getSha256 = async (filePath) => {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
};

const getRemoteSha256 = (key) => {
  const result = runAws([
    's3api',
    'head-object',
    '--bucket',
    BUCKET,
    '--key',
    key,
    '--query',
    'Metadata.sha256',
    '--output',
    'text',
  ]);

  if (result.status !== 0) {
    return null;
  }

  const value = result.stdout.trim();
  return value === 'None' ? null : value;
};

const uploadFile = ({ path, key, extension }, sha256) => {
  const args = [
    's3',
    'cp',
    path,
    `s3://${BUCKET}/${key}`,
    '--metadata',
    `sha256=${sha256}`,
    '--cache-control',
    'public, max-age=86400',
  ];

  const contentType = CONTENT_TYPES[extension];
  if (contentType) {
    args.push('--content-type', contentType);
  }

  if (DRY_RUN) {
    console.log(`[dry-run] upload ${path} -> s3://${BUCKET}/${key}`);
    return;
  }

  const result = runAws(args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Upload failed for ${path}`);
  }
};

const files = await listProjectMedia();

if (files.length === 0) {
  console.log('No project videos found.');
  process.exit(0);
}

let uploaded = 0;
let skipped = 0;

for (const file of files) {
  const sha256 = await getSha256(file.path);
  const remoteSha256 = DRY_RUN ? null : getRemoteSha256(file.key);

  if (remoteSha256 === sha256) {
    console.log(`skip ${file.key}`);
    skipped += 1;
    continue;
  }

  uploadFile(file, sha256);
  uploaded += 1;
}

console.log(`${DRY_RUN ? 'Would upload' : 'Uploaded'} ${uploaded}; skipped ${skipped}.`);

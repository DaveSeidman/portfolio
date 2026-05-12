# Project Content

Each project lives in its own folder:

```text
src/content/projects/borderless/
  project.md
  media/
    image.webp
    demo.mp4
```

`project.md` starts with frontmatter for carousel metadata, followed by Markdown content.

```md
---
name: BorderlessVR
title: Virtual Reality, Delivered
slug: Borderless
shape: Headset
order: 11
tags:
  - frontend
  - backend
---

Project copy goes here.

![Image description](./media/image.webp)

::video
src: ./media/demo.mp4
poster: ./media/demo-poster.webp
::
```

Local dev serves videos from the project folder. Production resolves video URLs to S3 using:

```text
https://daveseidmancom.s3.amazonaws.com/projects/<project-folder>/<filename>
```

Video files are intentionally ignored by Git. Before deploying production changes that include video updates, run:

```sh
npm run media:sync
```

Use `npm run media:sync:dry-run` to see which videos would upload. The sync script requires the AWS CLI to be installed and authenticated.

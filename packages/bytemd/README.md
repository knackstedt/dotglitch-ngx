
# ByteMD wrapper for Angular

[![npm](https://img.shields.io/npm/v/@dotglitch/dotglitch-ngx.svg)](https://www.npmjs.com/package/@dotglitch/dotglitch-ngx)
[![npm](https://img.shields.io/npm/dm/@dotglitch/dotglitch-ngx.svg)](https://www.npmjs.com/package/@dotglitch/dotglitch-ngx)
[![npm downloads](https://img.shields.io/npm/dt/@dotglitch/dotglitch-ngx.svg)](https://npmjs.org/@dotglitch/dotglitch-ngx)
[![GitHub stars](https://img.shields.io/github/stars/knackstedt/dotglitch-ngx.svg?label=GitHub%20Stars&style=flat)](https://github.com/knackstedt/dotglitch-ngx)


This is a [ByteMD](https://github.com/bytedance/bytemd) wrapper library for Angular.


| :warning:        This library is still in alpha stages, some things may not work correctly.   |
|-----------------------------------------|
| If you find any bugs, please open a [PR](https://github.com/knackstedt/dotglitch-ngx/issues). |

## Installation
You can install the library with [npm](https://npmjs.com).

### Angular 15+
```sh
    # Install ngx-bytemd and dependencies
    npm i ngx-bytemd svelte @bytemd/plugin-frontmatter @bytemd/plugin-gfm @bytemd/plugin-highlight @bytemd/plugin-medium-zoom @bytemd/plugin-mermaid  --save
```
    
## Getting started

Use NgxByteMD in your project:

```typescript
import { Component } from '@angular/core';
import { ByteMDComponent } from 'ngx-bytemd';

@Component({
    selector: 'app-test-component',
    template: `<ngx-bytemd></ngx-bytemd>`
    imports: [
        ByteMDComponent
    ],
    standalone: true
})
export class TestComponent {
    markdownText = `
---
# frontmatter: https://jekyllrb.com/docs/front-matter/
layout: post
title: Blogging Like a Hacker
---

## Markdown Basic Syntax

I just love **bold text**. Italicized text is the _cat's meow_. At the command prompt, type `nano`.

My favorite markdown editor is [ByteMD](https://github.com/bytedance/bytemd).

1. First item
2. Second item
3. Third item

> Dorothy followed her through many of the beautiful rooms in her castle.

\`\`\`js
import gfm from '@bytemd/plugin-gfm'
import { Editor, Viewer } from 'bytemd'

const plugins = [
  gfm(),
  // Add more plugins here
]

const editor = new Editor({
  target: document.body, // DOM to render
  props: {
    value: '',
    plugins,
  },
})

editor.on('change', (e) => {
  editor.$set({ value: e.detail.value })
})
\`\`\`

## GFM Extended Syntax

Automatic URL Linking: https://github.com/bytedance/bytemd

~~The world is flat.~~ We now know that the world is round.

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

## Footnotes

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.
[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    \`{ my code }\`

    Add as many paragraphs as you like.

## Gemoji

Thumbs up: :+1:, thumbs down: :-1:.

Families: :family_man_man_boy_boy:

Long flags: :wales:, :scotland:, :england:.

## Mermaid Diagrams

\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`
    `
}
```


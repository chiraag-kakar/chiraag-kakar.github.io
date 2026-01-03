# Genesis Thread

> My portfolio, built as a story.

---

## What is this?

Most portfolios read like résumés with prettier fonts. Mine doesn't.

Genesis Thread treats my career as a narrative—each job is a chapter, each project is a quest, and each skill is a tool I picked up along the way. It's less "here's what I did" and more "here's why it mattered."

I got tired of bullet points. So I built something I'd actually want to read.

---

## The Stack

No frameworks. No build steps. Just files that work.

```
genesisthread/
├── index.html          # the whole page
├── styles.css          # everything visual
├── content.json        # my story, easy to edit
└── js/
    ├── app.js          # ties it together
    ├── renderer.js     # turns json into dom
    └── scroll-manager.js
```

**Why vanilla?** Because I wanted something I could deploy anywhere, understand completely, and maintain without chasing dependency updates. The whole thing is under 50KB.

---

## Things I'm Proud Of

**The chapter system.** Each role gets its own section with context (the setting), the problem I was solving (the quest), how I approached it (the journey), and what came out of it (the impact). It's structured enough to be scannable but narrative enough to be interesting.

**The little drawings.** Every chapter has a sketchy SVG illustration floating in the background—networks for my payments work, neural nets for my ML research, shopping carts for e-commerce. They're subtle but they add personality.

**The navigation dropdown.** Click "The Journey" and you get a mini table of contents. Jump to any chapter. It felt obvious once I built it, but I haven't seen many portfolios do this.

**The loading screen.** A little book with pages turning. Sets the tone before you even start scrolling.

**No hash URLs.** I hate seeing `#section` in URLs. The history API makes them clean.

---

## Design Choices

The color palette is intentional:

- **Cream background** — easier on the eyes than stark white
- **Gold accents** — warm, draws attention where it matters
- **Terracotta highlights** — for the important bits
- **Sage green** — secondary, calming

Typography is Inter for body (readable, professional) and JetBrains Mono for code (because code should look like code).

Everything animates with `transform` and `opacity` so the GPU handles it. Intersection Observer triggers animations as you scroll—no janky scroll listeners firing 60 times a second.

---

## Running It Locally

```bash
# any of these work
python -m http.server 8000
npx serve .
php -S localhost:8000
```

Then open `localhost:8000`.

---

## Editing the Content

Everything lives in `content.json`. Change your story, refresh the page. No rebuilds.

```json
{
  "chapters": [
    {
      "company": "Where you worked",
      "role": "What you did",
      "title": "The headline",
      "story": {
        "setting": "Context...",
        "quest": "The challenge..."
      },
      "journey": [
        { "title": "Step one", "text": "What happened..." }
      ],
      "impact": [
        { "value": "40%", "label": "Faster" }
      ]
    }
  ]
}
```

---

## Deploying

It's static files. Works anywhere:

- GitHub Pages — just enable it
- Vercel — drop the folder
- Netlify — same
- Any server that can serve HTML

---

## Credits

- [follow.art](https://follow.art) — the scroll feel I was chasing
- [Inter](https://rsms.me/inter/) — the typeface
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — for the monospace bits

---

## Why "Genesis Thread"?

Genesis = beginning. Thread = narrative.

It's the thread that connects everything—the origin story of my career, told the way I'd tell it over coffee.

---

*Built over a few weekends with too much coffee and a belief that developers deserve portfolios that feel human.*

— Chiraag

*"The best systems are built by people who care about the problem, not just the solution."*

</div>

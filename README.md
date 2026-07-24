# Sanguk Lee — Research Website

Static personal research website for Sanguk Lee, Ph.D., Assistant Professor in the Division of Media & Communication at Hankuk University of Foreign Studies.

## Local preview

From this folder, run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing with GitHub Pages

This repository is already configured with the GitHub remote `git@github.com:lsw555/lsw555.github.io.git`. After reviewing the site, publish it with:

```bash
git add index.html style.css README.md
git commit -m "Build research website"
git push origin main
```

In GitHub, open **Settings → Pages** and set **Build and deployment** to **Deploy from a branch**, using `main` and `/(root)`. The public URL will be `https://lsw555.github.io/`.

## Updating content

- Research themes and featured papers: `index.html`
- Design, layout, and colors: `style.css`
- Email and office address: the `Contact` section in `index.html`

The site intentionally does not publish the CV file or a recruitment section yet. Add those only after their content is ready for public sharing.

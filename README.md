# Calculus 1a notes

Public Hebrew notes edited based on previous notes by Shiri Artstein and Yaron Ostrover, Tel Aviv University.



## Publish with GitHub Pages (no terminal required)

1. Create a new **public** repository called `calculus-notes` on GitHub. Do not reuse the ODE game repository.
2. Unzip the supplied archive on your computer.
3. In the repository, choose **Add file → Upload files**. Drag the **contents** of the unzipped folder into the upload area, including the `assets` folder. Upload the extracted files, not the ZIP. `index.html` must be at the repository root, rather than inside an extra folder.
4. Choose **Commit changes**. If your computer hides `.nojekyll`, the site still works without it because it has no underscore-prefixed assets.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Choose branch **main** and folder **/(root)**, then **Save**.
8. Once GitHub finishes deployment, use the site link shown on that page. Its usual form is `https://YOUR-USERNAME.github.io/calculus-notes/`.

All paths are relative, so the website works under a GitHub project subdirectory or a university folder.

## Preview locally

Double-click `index.html` in the extracted folder to open the complete website in your browser. No server is required. Optionally run `python3 -m http.server 8000` from this folder and open `http://localhost:8000`.

## Updating the notes

Chapter 1 is stored in `assets/chapter-1.pdf`. Its 24 preview pages are in `assets/pages`, and section titles/page destinations are embedded at the beginning of `app.js`, with a reference copy in `assets/contents.json`.

When the PDF changes, refresh both the PDF and its page previews together. If pagination changes, refresh the section destinations too. Do not replace just the PDF while retaining old previews.

Later chapters can be added using the same structure. Keep the LyX sources as the authoritative editing copy.

The webpage does not use analytics, cookies, accounts, or external font/CDN services. There is no build process or package installation.

All rights reserved. Public reading access does not change the copyright status of the notes or embedded images.

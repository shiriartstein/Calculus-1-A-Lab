# Calculus 1A — trial reader

Hebrew notes edited by Shiri Artstein and Yaron Ostrover, Tel Aviv University.
The repository's existing GitHub Actions workflow builds and publishes the site
when files are committed to `main`. Keep the PDF files in `assets/`.

## Trial questions

Chapters 1–2 use `assets/checkpoints.json` for page locations and
`assets/questions.json` for the published question bank.

- Optional practice appears between pages, with sanity, rehearsal and challenge
  choices. Closing practice never blocks reading.
- Larger checkpoints require three correct answers from three distinct topic
  groups. The normal route uses sanity/rehearsal questions; the challenging
  route uses challenge questions. There is no skip button on these checkpoints.
- Chapter 1 checkpoints follow PDF pages 8 and 17, with a summary after page 25.
- Chapter 2 checkpoints follow PDF pages 11, 21 and 31, with a summary after page 41.
- Summaries do not lock another chapter. Chapters 3–7 retain ordinary reading.
- Questions become available only after their `available_after_page` in their
  own chapter. If a route lacks a topic, it is disabled rather than silently
  selecting another level. If no route can run, that checkpoint does not block.

The plan records the PDFs' SHA-256 hashes. If a PDF changes, questions for that
chapter pause and reading remains available until the plan is reviewed against
the new pagination. Update the locations and hash together after that review.

## Approval and the workshop

Only `status:"approved"` questions with `approval_stage:"partial"` or `"final"`
appear. Old approved records without a stage remain compatible. Drafts do not
appear. The initial expanded bank contains 144 publishable questions, including
96 new ones. The full working bank, drafts and issue-review list belong in the
workshop; do not upload them as the public `assets/questions.json`.

Export from the workshop and replace `assets/questions.json` when ready. Keep
question IDs stable. If a selected question's wording, answers or correct key
change, a saved checkpoint selection is revalidated before it can unlock pages.
The legacy `sets-001` question is available after page 6, where the set-operation
definitions finish; retain that timing when updating its workshop record.

## Trial profiles and progress

The four existing demo profiles are browser-local profiles, not authentication.
Names and older progress records are retained. The new checkpoints use separate
`gate-v2:` records because the earlier section checks did not assess the same
three-topic requirement. New checkpoints therefore start fresh.

Question selections, correct answers, hints and attempts survive reloads for the
selected profile in the same browser. Standalone practice draws from material
already reached and has the same three-level selector. Selecting another profile
keeps each profile's progress separate. Clearing browser storage removes these
local records. PDF downloads remain available; blur is a learning aid, not access
control.

## Report a question

Every displayed question has a report button. A report includes the question ID,
a short remark, timestamp and a snapshot of the wording. It does not change the
student's progress or automatically unpublish the question.

`feedback-config.js` controls this temporary feature:

```js
window.CALCULUS_FEEDBACK = {
  enabled: true,
  endpoint: ''
};
```

Until an HTTPS endpoint is configured, the interface explicitly says reports
stay on that device and offers a JSON download. The workshop can import that
file into its issue inbox. A central inbox implementation and deployment
instructions were supplied with Workshop V5. Do not put its private database
or admin key in this repository. After deployment, set `endpoint` to its HTTPS
`/api/reports` URL and allow this site's origin on the server.

Set `enabled:false` and publish to remove reporting from the student interface.

## Build and check locally

```sh
python3 -m pip install pymupdf pillow
node tests/checkpoint-core.test.cjs
python3 build_notes.py
python3 -m http.server 8000 --directory _site
```

Open `http://localhost:8000`. The build generates page images and section links
from all seven PDFs and bundles local KaTeX assets for formula display. Source
`index.html` is not a complete preview before the build. Question loading also
requires serving over HTTP rather than opening the HTML file directly.

## Updating the existing GitHub site

Upload the changed source files at the repository root and the supplied `assets`
contents at the matching paths. Do not upload an enclosing ZIP/folder as a file,
and do not delete existing PDFs or images. Commit to `main` and wait for the
existing **Update and publish notes** Action to finish. No Pages setting change
is needed for this already-configured repository.

All rights reserved. Public reading access does not change the copyright status
of the notes or embedded images. KaTeX's license accompanies its local assets.

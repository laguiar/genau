# Browser practice

Open **Practice** in the web app sidebar. The current pilot includes an eight-item A2-04 diagnostic, a seven-day follow-up with fresh sentences, and next-day review of missed rules. The diagnostic and follow-up keep the first answer and track hints separately from retries. Lesson statuses remain self-reported.

The B1 area has a four-minute selective-listening exercise, all three speaking tasks with paired role cards, and a four-point writing prompt. Transcripts and audio replay are available after the timed listening attempt. The speaking checklist is for partner feedback. Solo rehearsal audio is held only while the practice page is open. The browser's progress backup includes first attempts, writing drafts and revisions, and paired feedback.

## Review and scoring

The shipped pilot items have `"review": null`. They give item feedback while they await independent review. An assessment reports a tracked score only if **every item** was signed off for that revision by the time the learner started and the learner has never answered or requested a hint for any of its items. Practice completed before sign-off stays formative. The A2-04 diagnostic uses the course threshold of 7/8 first attempts without hints.

Before signing off, a qualified German reviewer should answer each item without the key, verify the level and context, list all accepted variants, and check the feedback. For listening, also compare the recording, transcript, and keyed answer. Send any correction using the item ID printed in the feedback. The reviewer records their name, qualification, ISO date, and the set revision in the item's `review` field.

Keep IDs stable for the same item. Give materially changed items new IDs, and advance a set's revision when its scored content changes. Revise the diagnostic and its follow-up together. Use fresh items for a new scored attempt. The checks verify IDs, keys, accepted variants, rationales, review metadata, linked follow-up sets, and audio assets. The automated checks cannot judge naturalness or resolve ambiguous translations.

## Audio and evidence

The pilot recording uses original Genau announcements synthesized with Piper 1.8.0 and the German [Thorsten medium voice](https://huggingface.co/rhasspy/piper-voices/blob/5ec43b186ef915a195d3ddbcfd9916e76c503c3f/de/de_DE/thorsten/medium/MODEL_CARD), trained on CC0 data. The telc page provides an official example and audio with human speakers. [Official exam format and practice materials](https://www.telc.net/sprachpruefungen/deutsch/zertifikat-deutsch-telc-deutsch-b1/)

The diagnostic design draws on evidence for spacing and effortful recall. The writing workflow gives learners a place to apply corrective feedback and compare a revision. [Kim & Webb](https://doi.org/10.1111/lang.12479) · [Rowland](https://doi.org/10.1037/a0037559) · [Kang & Han](https://doi.org/10.1111/modl.12189)

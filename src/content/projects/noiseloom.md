---
title: NoiseLoom
contributors: Yohta Kitagawa
year: "2026"
role: "Solo project"
oneLiner: Networked noise improvisation through collaborative spectral drawing.

order: 3
published: true

loop: /yohtanewwebsite/assets/noiseloom-loop.mp4
poster: /yohtanewwebsite/assets/noiseloom-poster.jpg

archiveVideo: /yohtanewwebsite/assets/noiseloom-archive.mp4
fullVideoUrl: https://drive.google.com/file/d/1oSuVYQExmBhu_eim22L8f4pwopkt-jns/view

concept: |
  NoiseLoom is a networked instrument for collective noise improvisation.
  Participants scan a QR code and draw on a shared spectral canvas from their
  phones. Their marks overlap on a projection and become one continuously
  changing sound.

  Everyone edits the same sonic material rather than playing a separate
  instrument. Participants listen to the collective result, see each other's
  actions, and respond by adding, erasing, blurring, or transforming the canvas.

technical:
  - "Phone browsers send touch and color data over WebSocket to a Node.js server."
  - "The server forwards OSC data to Max/MSP."
  - "A shared spectrogram drives spectral synthesis: position sets time and frequency, brightness sets volume."
  - "Image transformations (blur, erase, shift) reshape the sound."

credits: |
  Created by Yohta Kitagawa.

recognition:
  - text: "Poster submitted to ACM UIST 2026."
  - text: "Exhibited at BLIP, Brown University (May 13, 2026)."
---

NoiseLoom began from the question of how people without specialized software could improvise with complex sound together. A browser-based interface made it possible to join immediately from a phone.

The current system turns a shared spectrogram into both an image and an instrument. Overlapping edits accumulate instead of replacing one another, so the sound remains a collective construction.

A preliminary study with 11 participants showed strong social connectedness, while some newcomers felt less confident controlling the sound. This led toward clearer feedback, more varied sound materials, and further spatial-audio experiments.

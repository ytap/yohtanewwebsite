---
title: NoiseLoom
contributors: Yohta Kitagawa
year: "2026"
role: "Solo project"
oneLiner: An accessible interface for improvising noise and finding the sound together.

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
  Originally created in a class at Brown University.
  Thanks to Professor <a href="https://vivo.brown.edu/display/jrovan" target="_blank" rel="noopener noreferrer">Butch Rovan</a>.
  Videography by <a href="https://www.instagram.com/ingridjarvi_studio/" target="_blank" rel="noopener noreferrer">Ingrid Jarvi</a>.

recognition:
  - text: "Poster submitted to ACM UIST 2026."
  - text: "Exhibited at BLIP, Brown University (May 13, 2026)."
---

NoiseLoom began with a question: how can people improvise with complex sound together without specialized software? A browser-based interface answered it, letting anyone join from their own phone within seconds.

Turning the shared spectrogram into both an image and an instrument made the collective nature of the work explicit. Edits accumulate rather than replace one another, so the sound stays a construction that no single participant owns.

A preliminary study with eleven participants reported a strong sense of social connectedness, while newcomers felt less confident shaping the sound. That gap now guides the work toward clearer feedback, a wider range of sound materials, and further spatial-audio experiments.

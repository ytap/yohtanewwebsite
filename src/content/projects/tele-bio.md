---
title: Tele-Bio
contributors: Yohta Kitagawa, Zhiheng Xu (equal contribution)
year: "2026"
role: "Role: Concept, physical computing, interaction design"
oneLiner: Leaving and receiving physiological traces through a rotary telephone.

order: 5
published: true

# loop: (動画ができたら有効にする)
poster: /yohtanewwebsite/assets/telebio-left.png
fit: contain

# archiveVideo: (動画ができたら有効にする)

concept: |
  A public telephone connects people across space, but its handset also retains
  warmth and moisture after each person leaves. Tele-Bio extends this brief
  physical contact by recording anonymous physiological traces and replaying
  them for later visitors.

  Lifting the handset begins recording and replay. The rotary dial determines
  how far the system reaches into its archive, combining traces from multiple
  visitors. Heartbeat, skin response, temperature, and breath return as pulses,
  warmth or coolness, and mist.

technical:
  - "An EmotiBit measures PPG, electrodermal activity, and skin temperature from the palm."
  - "A thermistor near the mouthpiece detects breath."
  - "An ESP32 reads the rotary dial and drives a vibration actuator, a Peltier module, and an atomizer."
  - "Heartbeat intervals set the timing of the tactile pulses; EDA shapes their intensity."
  - "Skin temperature controls the earpiece temperature, and breath triggers the mist."

credits: |
  Created by Yohta Kitagawa and Zhiheng Xu with equal contribution.

recognition:
  - text: "Accepted to the ACM UIST 2026 Student Innovation Contest. To be presented Nov 2–5, 2026."
    url: https://doi.org/10.1145/3830397.3841318
---

Tele-Bio began from the physical residue of a shared telephone: the warmth or moisture that remains after someone hangs up. The project extends this fleeting contact without storing voices or identifying individual callers.

The telephone's familiar gestures were retained. Picking up begins the exchange, hanging up leaves a new trace, and dialing selects how far back into the archive the replay reaches. Longer spans combine more visitors rather than retrieving one person's record.

The current prototype integrates sensing and feedback into the handset. Earlier visitors return through vibration and temperature at the ear and mist near the mouth, allowing one telephone to connect anonymous bodies across time.

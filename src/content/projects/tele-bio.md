---
title: Tele-Bio
contributors: Yohta Kitagawa, Zhiheng Xu (equal contribution)
year: "2026"
role: "Role: Concept, physical computing, interaction design"
oneLiner: Leaving and receiving physiological traces through a public telephone.

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
  - "An Emotibit (Bio Sensor) measures PPG, electrodermal activity, and skin temperature from the palm."
  - "A thermistor near the mouthpiece detects breath."
  - "An ESP32 reads the rotary dial and drives a vibration actuator, a Peltier module, and an atomizer."
  - "Heartbeat intervals set the timing of the tactile pulses; EDA shapes their intensity."
  - "Skin temperature controls the earpiece temperature, and breath triggers the mist."

credits: |
  Created by Yohta Kitagawa and Zhiheng Xu with equal contribution.

paper: /yohtanewwebsite/assets/telebiopaper.pdf

recognition:
  - text: "Accepted to the ACM UIST 2026 Student Innovation Contest. To be presented Nov 2–5, 2026."
    url: https://doi.org/10.1145/3830397.3841318
---

Tele-Bio began from a sensor rather than a concept. The Emotibit reads heartbeat, skin response, and temperature from the palm, which left an open question: where should such a sensor sit?

Searching for something people already grip with a whole hand led to the telephone. Observed closely, the situation reads differently from the handset's side, where a stream of strangers arrives, holds it, breathes into it, and leaves.

The implementation followed from that view. A handset that registers each visitor can also return what it received, so those who came before reach the current caller as vibration, warmth, and mist.

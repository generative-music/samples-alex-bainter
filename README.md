# @generative-music/samples-alex-bainter

Audio sample files used in [Alex Bainter](https://alexbainter.com)'s projects, with conversion and deployment scripts.

## Usage

This package exports an object with `ogg`, `mp3`, and `wav` properties. Each property is a sample index which adheres to the schema defined by [@generative-music/sample-index-schema](https://github.com/generative-music/sample-index-schema) and contains URLs to audio samples of the specified type.

```javascript
import samplesByFormat from '@generative-music/samples-alex-bainter';
import Tone from 'tone';

const pianoSampler = new Tone.Sampler(samplesByFormat.wav['vsco2-piano-mf']);
```

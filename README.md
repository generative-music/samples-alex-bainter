# @generative-music/samples-alex-bainter

Audio sample files used in [Alex Bainter](https://alexbainter.com)'s projects, with conversion and deployment scripts.

## Usage

This package exports a function which takes an audio format (one of 'ogg','mp3', or 'wav') and returns a sample index which adheres to the schema defined by [@generative-music/sample-index-schema](https://github.com/generative-music/sample-index-schema) and contains URLs to audio samples of the specified type.

```javascript
import getSamples from '@generative-music/samples-alex-bainter';
import Tone from 'tone';

const samples = getSamples({ format: 'mp3' });

const pianoSampler = new Tone.Sampler(wav['vsco2-piano-mf']);
```

By default, the URLs in the sample index are relative (e.g. `'vsco2-piano-mf/ogg/<filename>.ogg'`). A string prefix can be added by passing a `host` parameter to the get function, or with an environment variable named `SAMPLE_FILE_HOST`. If a parameter is passed and the environment variable is also set, the argument will be used.

```javascript
import getSamples from '@generative-music/samples-alex-bainter';

const samples = getSamples({ host: 'http://example.com', format: 'ogg' });

console.log(samples);
/*
{https://github.com/metalex9/s3-sync
  'vsco2-piano-mf': {
    A0: 'http://example.com/vsco2-piano-mf/ogg/<filename>.ogg',
    'C#1': 'http://example.com/vsco2-piano-mf/ogg/<filename>.ogg'
    // ...
  },
  // ...
}
*/
```

To include only the index for a specific format, you can access it directly like so:

```javascript
import getMp3Samples from '@generative-music/samples-alex-bainter/src/mp3';

const mp3Samples = getSamples({ host: 'http://example.com' });
```

This can be useful for dynamically loading a sample index to reduce bundle sizes in the browser:

```javascript
const lazyMp3Index = () =>
  import('generative-music/samples-alex-bainter/src/mp3');
const lazyOggIndex = () =>
  import('generative-music/samples-alex-bainter/src/ogg');

const loadSampleIndex = isOggSupported => {
  if (isOggSupported) {
    return lazyOggIndex();
  }
  return lazyMp3Index();
};

loadSampleIndex.then(samples => {
  //...
});
```

## Local development

### Cached proxy server

```bash
npm run serve:proxy
```

Start a proxy server at http://localhost:6969 which serves sample files from an S3 bucket and caches them in the local file system.

### Building

> **This step takes a long time and is no longer necessary if you just want to get one of my projects running locally.** See [Cached proxy server](#cached-proxy-server) above.

```bash
npm run build
```

Prerenders necessary samples and converts all samples to the output formats with [FFmpeg](https://www.ffmpeg.org/) and creates `dist/index.json`. This may take a while. If `dist/index.json` exists prior to running this, only missing samples will be converted.

### Serving locally with Docker

> Requries [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

```bash
npm run serve
```

Serve the sample files on your local machine at http://localhost:6969/.

### CDN configuration with AWS S3

#### Prerequisites

See [`@alexbainter/s3-sync`](https://github.com/metalex9/s3-sync) configuration.

#### Uploading to S3

> Requires read and write access.

```bash
npm run deploy
```

Uploads the samples and the output index to the configured S3 bucket. This will only upload files if they're missing from the S3 bucket.

#### Downloading from S3

> Requires read access.

```bash
npm run pull
```

Downloads the samples and the ouput index from the configured S3 bucket. This will only download files if they're missing locally.

## Sample sources

- Directories prefixed with "vsco2-" contain samples from the [Versilian Studios Chamber Orchestra 2: Community Edition](https://vis.versilstudios.com/vsco-community.html).

- Directories prefixed with "vcsl-" contain samples from the [Versilian Community Sample Library](https://vis.versilstudios.com/vcsl.html).

- Directories prefixed with "sso-" contain samples from the [Sonatina Symphonic Orchesta](https://github.com/peastman/sso)

- Directories prefixed with "itslucid-" contain samples from [ItsLucid](https://soundcloud.com/itslucid2)'s free Lo-Fi Hip-Hop Drum Kit.

- The "kasper-singing-bowls" directory contains samples from [Kasper](https://kasper.bandcamp.com/album/singing-bowls).

- Other directories contain samples which were either recorded by [Alex Bainter](https://alexbainter.com) or downloaded from [Freesound](https://freesound.org/). In the latter case, all of the samples are released in the public domain.

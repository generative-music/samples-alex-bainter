# @generative-music/samples-alex-bainter

Audio sample files used in [Alex Bainter](https://alexbainter.com)'s projects, with conversion and deployment scripts.

## Usage

This package exports a function which returns an object with the properties `ogg`, `mp3`, and `wav`. Each property is a sample index which adheres to the schema defined by [@generative-music/sample-index-schema](https://github.com/generative-music/sample-index-schema) and contains URLs to audio samples of the specified type.

```javascript
import getSamplesByFormat from '@generative-music/samples-alex-bainter';
import Tone from 'tone';

const { wav } = getSamplesByFormat();

const pianoSampler = new Tone.Sampler(wav['vsco2-piano-mf']);
```

By default, the URLs in each sample index are relative (e.g. `'./vsco2-piano-mf/ogg/<filename>.ogg'`). A string prefix can be added by passing it as a parameter to the get function, or with an environment variable named `SAMPLE_FILE_HOST`. If a parameter is passed and the environment variable is also set, the argument will be used.

```javascript
import getSamplesByFormat from '@generative-music/samples-alex-bainter';

const { ogg } = getSamplesByFormat('http://example.com');

console.log(ogg);
/*
{
  'vsco2-piano-mf': {
    A0: 'http://example.com/./vsco2-piano-mf/ogg/<filename>.ogg',
    'C#1': 'http://example.com/./vsco2-piano-mf/ogg/<filename>.ogg'
    // ...
  },
  // ...
}
*/
```

## Local development

### Building

```bash
npm run build
```

Builds the samples, the sample index file (`dist/index.json`), and the npm package.

#### Building sample files

```bash
npm run build:samples
```

Converts the source samples to the output formats with [FFmpeg](https://www.ffmpeg.org/) and creates `dist/index.json`. This will take a while. If `dist/index.json` exists prior to running this, only missing samples will be converted.

#### Building npm package

```bash
npm run build:pkg
```

Build the npm package. Note that the package requires `dist/index.json`.

### Serving locally with Docker

> Requries [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

```bash
npm run serve
```

Serve the sample files on your local machine at http://localhost:6969/.

## CDN configuration with AWS S3

### Prerequisites

To store the samples on [AWS S3](https://aws.amazon.com/s3/), first create a file named `scripts/utils/env.js`. This file should export an object with an `s3BucketName` property that has a string value containing the name of an S3 bucket you have access to.

```javascript
// scripts/utils/env.js
module.exports = {
  s3BucketName: 'example-s3-bucket',
};
```

Next, you'll need to provide credentials to the [AWS SDK](https://aws.amazon.com/sdk-for-node-js/), either by using a [shared credentials file](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html) or [environment variables](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html). You can easily create a shared credentials file by installing the [AWS CLI](https://aws.amazon.com/cli/) and running `aws configure`.

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

# remark-encrypted-block

This plugin parses custom Markdown syntax to create an encrypted block
that gets rendered into an script tag.

Usage is pretty basic, just add a link pointing to `#!encrypt` and everything after will
be encrypted using `node-rsa` and rendered to `base64`.

## Syntax

```markdown
This will not be encrypted.
[\#!encrypt]()
This will be encrypted.
Also this.
```

produces:

```html
<p>This will not be encrypted</p>
<script type="application/base64" integrity="sha256-${cyphertext hash}">
...base64 cyphertext...
</script>
```

You need to configure by setting a public key string (format `pkcs1-public-pem`)
under the configuration object key named `key`.

```js
{
  key: '-----BEGIN RSA PUBLIC KEY-----${pubKey}-----END RSA PUBLIC KEY-----'
}
```

## Installation

[npm][npm]:

```bash
npm install --save remark-encrypted-block
```

## Usage

Dependencies:

```javascript
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const remarkCustomBlocks = require('remark-custom-blocks')
```

Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkEncryptedBlock, {
    key: '-----BEGIN RSA PUBLIC KEY-----${pubKey}-----END RSA PUBLIC KEY-----'
  })
  .use(remark2rehype)
  .use(stringify)
```

The sample configuration provided above would have the following effect:

1. Allows you to use the following Markdown syntax to define the beginning of the encrypted block:

    ```markdown
    This will not be encrypted.
    [\#!encrypt]()
    This will be encrypted.
    Also this.
    ```

1. This Remark plugin would create a [mdast][mdast] node for the encrypted block, this node would be of type:

    * `encryptedBlock`

1. If you're using [rehype][rehype], you will end up with a `script` like this:

```html
  <script type="application/base64" integrity="sha256-${cyphertext hash}">
  ...base64 cyphertext...
  </script>
```

## License

ISC

[npm]: https://www.npmjs.com/package/remark-custom-blocks
[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md
[remark]: https://github.com/wooorm/remark
[rehype]: https://github.com/wooorm/rehype

const RSA = require('node-rsa')
const crypto = require('crypto')

const C_NEWLINE = '\n'
const RE_MARKER = /\[\\#!encrypt\]\(#[^\)]*\)/

const injectAfter = (target, afterMethod, injectObject) => {
  target.splice(target.indexOf(afterMethod) + 1, 0, injectObject)    
}

module.exports = function blockPlugin (key) {
  const blockTokenizer = function (eat, value) {
    const match = RE_MARKER.exec(value)

    if (!match) return
    if (match.index !== 0) return

    const content = value.substring(value.indexOf(C_NEWLINE) + 1)
    const add = eat(`${match[0]}${C_NEWLINE}${content}`)

    const exit = this.enterBlock()
    exit()

    const rsa = new RSA(key, 'pkcs1-public-pem')
    const payload = rsa.encrypt(content, 'base64')
    const hash = crypto.createHash('sha256').update(payload)

    return add({
      type: 'encryptedBlock',
      data: {
        hName: 'script',
        hProperties: {
          type: 'application/base64',
          integrity: `sha256-${hash.digest('base64')}`
        },
        hChildren: [{
          type: 'text',
          value: payload
        }]
      }
    })
  }

  const { 
    blockTokenizers,
    blockMethods,
    interruptParagraph,
    interruptList,
    interruptBlockquote
  } = this.Parser.prototype

  const afterMethod = 'fencedCode'
  const methodName = 'encryptedBlock'

  blockTokenizers[methodName] = blockTokenizer

  injectAfter(blockMethods, afterMethod, methodName)
  injectAfter(interruptParagraph, afterMethod, [methodName])
  injectAfter(interruptList, afterMethod, [methodName])
  injectAfter(interruptBlockquote, afterMethod, [methodName])
}

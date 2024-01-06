function /* class */ Note (letter, accidental, octave, duration, dot_modifier) {
   this.letter = letter
   this.accidental = accidental
   this.octave = octave
   this.duration = duration
   this.dot_modifier = dot_modifier
}

function /* class */ MusicFunction (label, value) {
   this.label = label
   this.value = value
}

MusicFunction.prototype.to_ly = /* method */ function () {
   if (this.label === 'tie') {
      return '~ '
   } else {
      return ''
   }
}

Note.accidental_transform = /* static */ function(inacc, type) {
   if (type === 'ly') {
      if (inacc === '+' || inacc === '#') {
         return 'is'
      } else if (inacc === '-') {
         return 'es'
      } else {
         return inacc
      }
   } else {
      return inacc
   }
}

Note.octave_transform = /* static */ function (inoct, type) {
   if (type === 'ly') {
      if (inoct > 3) {
         return '\''.repeat(inoct - 3)
      } else if (inoct == 3) {
         return ''
      } else {
         return ','.repeat(Math.abs(3 - inoct))
      }
   } else {
      return inoct
   }
}

Note.prototype.to_ly = /* method */ function () {
   let resultant = ''
   let postfix = ''
   let duration = this.duration
   if ((this.duration % 3) == 0) {
      resultant += '\\tuplet 3/2 { '
      postfix = '}'
      duration *= 2
      duration /= 3
   }
   resultant += this.letter + Note.accidental_transform(this.accidental, 'ly') + (this.letter != 'r' ? Note.octave_transform(this.octave, 'ly') : '') + duration + this.dot_modifier + ' '
   return resultant + postfix
}

function split_mml(instring) {
   // Detect MML type
   let MML_TYPE = undefined
   if (instring.substr(0,3) === 'FM1') {
      MML_TYPE = 'MuSICA'
      return [99, 'MuSICA support is not yet implemented.']
   } else if (instring.substr(0,10) === '[Settings]') {
      MML_TYPE = '3MLE'
      return [99, '3MLE support is not yet implemented.']
   } else if (instring.substr(0,4) === 'MML@') {
      MML_TYPE = 'Mabinogi'
   } else {
      return [2, "Could not determine MML type, or MML type is unsupported."]
   }

   let DEFAULT_NOTE_LENGTH = undefined
   let DEFAULT_OCTAVE = undefined

   let outarr = []

   if (MML_TYPE === 'Mabinogi') {

      DEFAULT_NOTE_LENGTH = 4
      DEFAULT_OCTAVE = 4

      // add first channel
      outarr.push([])

      // process through the instring
      for (let i = 0; i < instring.length; i++) {
         let prospect = instring[i]
         let j = i

         // Note
         if (((prospect <= 'g') && (prospect >= 'a')) || (prospect == 'r')) {
            let letter = prospect
            let accidental = ''
            let length = DEFAULT_NOTE_LENGTH
            let dot_modifier = ''
            prospect = instring[++j]

            // check for accidental
            if (prospect == '-' || prospect == '+' || prospect == '#') {
               accidental = prospect
               prospect = instring[++j]
            }

            // check for length (base length)
            if (prospect >= '0' && prospect <= '9') {
               length = 0
               while (prospect >= '0' && prospect <= '9') {
                  length *= 10
                  length += prospect * 1

                  prospect = instring[++j]
               }
            }

            // check for .'s
            while (prospect == '.') {
               dot_modifier += prospect

               prospect = instring[++j]
            }

            outarr[outarr.length - 1].push(new Note(letter, accidental, DEFAULT_OCTAVE, length, dot_modifier))

            // correct i to the last char we pulled to generate the Note
            i = j - 1

         } else if (prospect == 'l') {
            prospect = instring[++j]
            if (prospect >= '0' && prospect <= '9') {
               let length = 0
               while (prospect >= '0' && prospect <= '9') {
                  length *= 10
                  length += prospect * 1

                  prospect = instring[++j]
               }
               DEFAULT_NOTE_LENGTH = length

               // correct i to last char we pulled in getting the length
               i = j - 1

               //outarr[outarr.length - 1].push(new MusicFunction('length', DEFAULT_NOTE_LENGTH))
            }
         } else if (prospect == 'o') {
            prospect = instring[++j]
            
            if (prospect >= '0' && prospect <= '9') {
               DEFAULT_OCTAVE = prospect * 1
               i = j - 1
            }
         } else if (prospect == '&') {
            outarr[outarr.length - 1].push(new MusicFunction('tie'))
         } else if (prospect == '<') {
            DEFAULT_OCTAVE -= 1
         } else if (prospect == '>') {
            DEFAULT_OCTAVE += 1
         } else if (prospect == ',') {
            // new part in the song
            outarr.push([])

            DEFAULT_NOTE_LENGTH = 4
            DEFAULT_OCTAVE = 4
         } else {
            // not yet supported, so skip it.
            // - volume
            // - tempo
            // - midi note pitch
         }
      }
   }

   return outarr
}

function to_ly(inarr) {
   let resultant = '\\score { <<'

   for (let i = 0; i < inarr.length; i++) {
      resultant += '\\new Staff { \\clef treble '
      for (let j = 0; j < inarr[i].length; j++) {
         resultant += inarr[i][j].to_ly()
      }
      resultant += '}'
   }

   resultant += '>> \\layout {} \\midi {}}'
   return resultant
}

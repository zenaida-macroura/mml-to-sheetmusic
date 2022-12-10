function renderSheetMusic(lines) {
   let defs = {}

   // clear out non def lines
   let mmltext = lines.split('\n')
   for (var i = 0; i < mmltext.length; i++) {
      mmltext[i] = mmltext[i].trim()
      // remove comments
      if (mmltext[i][0] == ';') {
         mmltext.splice(i, 1)
         i--
         continue
      }
      // remove blank lines
      if (mmltext[i].length == 0) {
         mmltext.splice(i, 1)
         i--
         continue
      }
      // remove nondefs
      if (!mmltext[i].includes('=')) {
         mmltext.splice(i, 1)
         i--
         continue
      }

      let duo = mmltext[i].split(';')
      let keypair = duo[0].split('=')
      defs[keypair[0]] = keypair[1] + (typeof duo[1] == 'undefined' ? '' : ';' + duo[1])
   }
   
   // filter out instruments from defs
   let instruments = {
      'FM1':undefined,
      'FM2':undefined,
      'FM3':undefined,
      'FM4':undefined,
      'FM5':undefined,
      'FM6':undefined,
      'FM7':undefined,
      'FM8':undefined,
      'FM9':undefined,
      'PSG1':undefined,
      'PSG2':undefined,
      'PSG3':undefined,
      'SCC1':undefined,
      'SCC2':undefined,
      'SCC3':undefined,
      'SCC4':undefined,
      'SCC5':undefined,
   }

   // dump instruments into instruments and out of defs
   Object.entries(defs).forEach(([key, value]) => {
      console.log(key, value)
      if (Object.keys(instruments).includes(key)) {
         if (value == '') {
            instruments[key] = []
         } else {
            instruments[key] = [value].toString().split(',')
            for (var j = 0; j < instruments[key].length; j++) {
               instruments[key][j] = instruments[key][j].trim()
            }
         }
         delete defs[key]
      }
   })

   // Now we can create the scores
   let scores = []

   // expand the macros to refs
   Object.entries(instruments).forEach(([key, value]) => {
      if (value.length != 0) {
         scores.push([])
      }
      for (var i = 0; i < value.length; i++) {
         let refpair = value[i].split('/')
         if (refpair.length == 1) {
            scores[scores.length - 1].push(refpair[0])
         } else {
            for (var j = 0; j < (refpair[1] * 1); j++) {
               scores[scores.length - 1].push(refpair[0])
            }
         }
      }
   })

   // expand the refs to the defs
   for (var i = 0; i < scores.length; i++) {
      for (var j = 0; j < scores[i].length; j++) {
         scores[i][j] = defs[scores[i][j]]
      }
   }

   // Process the tapes and dump the notes into the page
   for (var i = 0; i < scores.length; i++) {
      let scoretext = ''
      
      // defaults
      let vibrato = 0
      let length = 4
      let portamento_speed = undefined
      let octave = 4
      let portamento_width = 0
      let sustain = 0
      let tempo = 120
      let volume = 8
      let decay = undefined
      let detune = 0
      let legato = false
      let voice = undefined
      let instrument_name = undefined
      
      for (var j = 0; j < scores[i].length; j++) {
         for (var k = 0; k < scores[i][j].length; k++) {
            let thischar = scores[i][j][k].toLowerCase()
            switch (thischar) {
               case 'a':
               case 'b':
               case 'c':
               case 'd':
               case 'e':
               case 'f':
               case 'g':
                  scoretext += thischar.toUpperCase()
                  // [<halftone +# or ->][<period .>]
                  if ("+#".includes(scores[i][j][k+1])) {
                     // sharp
                     scoretext += '#'
                     k++
                  } else if ("-".includes(scores[i][j][k+1])) {
                     // flat
                     scoretext += 'b'
                     k++
                  }
                  scoretext += octave
                  scoretext += ' '
                  break
               case 'i':
                  // <depth 0-255, 0=off>
                  break
               case 'l':
                  // <length 1-64 def 4>
                  break
               case 'm':
                  // <speed 1-255>
                  break
               case 'o':
                  // <octave 1-8>
                  break
               case 'p':
                  // <width 0-255, 0=off>
                  break
               case 'r':
                  // <pause 1-64>[<period .>]
                  break
               case 's':
                  // <sustain 0-1 (off/on)
                  break
               case 't':
                  // <tempo 32-255>
                  break
               case 'v':
                  // <volume 0-15>
                  break
               case 'w':
                  // <length 0-8>
                  break
               case 'y':
                  // <register>,<length 0-255>
                  break
               case 'z':
                  // <detune 0-255, 0-off>
                  break
               case '<':
                  octave--
                  if (octave < 0) octave = 0
                  break
               case '>':
                  octave++
                  if (octave > 8) octave = 8
                  break
               case '(':
                  legato = true
                  break
               case ')':
                  legato = false
                  break
               case '@':
                  // <voice 0-99 OPLL, 0-29 PSG, 0-49 SCC>
                  break
               case ';':
                  //comment - that is, custom arguments
                  // for now we are omitting them
                  k = scores[i][j].length
               default:
                  // explode
            }
         }
      }
      rendercontainer.innerText += ((instrument_name == undefined) ? (i) : (instrument_name)) + ':' + scoretext + '\n'
   }

   window.scores = scores
}

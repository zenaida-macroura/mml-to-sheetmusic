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

   window.scores = scores
}

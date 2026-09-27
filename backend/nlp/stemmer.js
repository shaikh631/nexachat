/**
 * NexaChat Porter Stemmer implementation for word normalization
 */

export function stemWord(word = '') {
  if (!word || word.length < 3) return word.toLowerCase();

  let w = word.toLowerCase();
  
  // Step 1a
  if (w.endsWith('sses')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ies')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ss')) {
    // keep as is
  } else if (w.endsWith('s')) {
    w = w.slice(0, -1);
  }

  // Step 1b
  if (w.endsWith('eed')) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if (w.endsWith('ed')) {
    const stem = w.slice(0, -2);
    if (/[aeiouy]/.test(stem)) {
      w = stem;
      if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
        w += 'e';
      }
    }
  } else if (w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (/[aeiouy]/.test(stem)) {
      w = stem;
      if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
        w += 'e';
      }
    }
  }

  // Step 1c
  if (w.endsWith('y') && /[aeiouy]/.test(w.slice(0, -1))) {
    w = w.slice(0, -1) + 'i';
  }

  return w;
}

export function stemTokens(tokens = []) {
  return tokens.map(t => stemWord(t));
}

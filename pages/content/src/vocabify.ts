import { type VocabLookup, vocabToReplaceStorage, wanikaniSubjectStylePreferenceStorage } from '@extension/storage';

interface ToReplace {
  regex: RegExp | undefined;
  lookup: VocabLookup;
  styleTranslations: boolean;
}

let toReplace: ToReplace = {
  regex: undefined,
  lookup: {},
  styleTranslations: true,
};

export async function updateToReplace() {
  const newLookup = await vocabToReplaceStorage.get();
  if (newLookup.regexString === null) {
    toReplace = {
      regex: undefined,
      lookup: {},
      styleTranslations: true,
    };
    return;
  }
  const styleTranslations = await wanikaniSubjectStylePreferenceStorage.get();
  if (Object.keys(newLookup.lookup).length === 0) {
    toReplace = {
      regex: undefined,
      lookup: {},
      styleTranslations: styleTranslations,
    };
    return;
  }
  const newRegex = new RegExp(newLookup.regexString, 'gi');
  toReplace = {
    regex: newRegex,
    lookup: newLookup.lookup,
    styleTranslations: styleTranslations,
  };
}

export function style() {
  const queries = [
    'vocabify-radical-no-style',
    'vocabify-kanji-no-style',
    'vocabify-vocabulary-no-style',
    'vocabify-kana_vocabulary-no-style',
  ];
  const replacements = ['vocabify-radical', 'vocabify-kanji', 'vocabify-vocabulary', 'vocabify-kana_vocabulary'];
  for (let i = 0; i < queries.length; i++) {
    const elements = document.querySelectorAll('.' + queries[i]);
    for (const element of Array.from(elements)) {
      const htmlElement = element as HTMLElement;
      if (toReplace.lookup[htmlElement.title.toLowerCase()]) {
        element.classList.remove(queries[i]);
        element.classList.add(replacements[i]);
      }
    }
  }
}

export function unstyle() {
  const queries = ['vocabify-radical', 'vocabify-kanji', 'vocabify-vocabulary', 'vocabify-kana_vocabulary'];
  const replacements = [
    'vocabify-radical-no-style',
    'vocabify-kanji-no-style',
    'vocabify-vocabulary-no-style',
    'vocabify-kana_vocabulary-no-style',
  ];
  for (let i = 0; i < queries.length; i++) {
    const elements = document.querySelectorAll('.' + queries[i]);
    for (const element of Array.from(elements)) {
      element.classList.remove(queries[i]);
      element.classList.add(replacements[i]);
    }
  }
}

export function vocabify(mutations: MutationRecord[]) {
  if (toReplace.regex === undefined) return;
  for (const mutation of mutations) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node instanceof HTMLElement && node.classList.contains('vocabify')) continue;
      replaceTextNodes(node);
    }
  }
}

export function reverseVocabify() {
  const elements = document.querySelectorAll('.vocabify');
  for (const element of Array.from(elements)) {
    const htmlElement = element as HTMLElement;
    htmlElement.textContent = htmlElement.title;

    // Remove any subject-type classes and replace with no-style versions
    const subjectType = htmlElement.getAttribute('data-vocabify-subject-type');
    if (subjectType) {
      const subjectClass = 'vocabify-' + subjectType;
      const noStyleClass = subjectClass + '-no-style';

      // First remove the styled class if it exists
      if (htmlElement.classList.contains(subjectClass)) {
        htmlElement.classList.remove(subjectClass);
      }

      // Add the no-style class if it doesn't exist already
      if (!htmlElement.classList.contains(noStyleClass)) {
        htmlElement.classList.add(noStyleClass);
      }
    }
  }
}

function fastReplaceTextNode(node: Text) {
  if (node.parentElement === null) return;

  const currentTitle = node.parentElement.title.toLowerCase();
  const currentTranslation = node.textContent;
  const lookupEntry = toReplace.lookup[currentTitle];

  const oldSubjectType = node.parentElement.getAttribute('data-vocabify-subject-type');

  if (lookupEntry) {
    // If we have a translation in toReplace.lookup
    if (currentTranslation !== lookupEntry.characters || oldSubjectType !== lookupEntry.subjectType) {
      // If the current translation doesn't match what's in toReplace.lookup, update it
      node.textContent = lookupEntry.characters;

      // Update the subject type and classes
      const newSubjectType = lookupEntry.subjectType;
      const newSubjectClass = 'vocabify-' + newSubjectType;
      const newNoStyleClass = newSubjectClass + '-no-style';

      // Remove all existing subject-related classes
      if (oldSubjectType) {
        const oldSubjectClass = 'vocabify-' + oldSubjectType;
        const oldNoStyleClass = oldSubjectClass + '-no-style';
        node.parentElement.classList.remove(oldSubjectClass, oldNoStyleClass);
      }

      // Update the subject type attribute
      node.parentElement.setAttribute('data-vocabify-subject-type', newSubjectType);

      // Add the appropriate class based on style preference
      if (toReplace.styleTranslations) {
        node.parentElement.classList.add(newSubjectClass);
      } else {
        node.parentElement.classList.add(newNoStyleClass);
      }
    }
  } else if (currentTranslation !== currentTitle) {
    // If we don't have a translation in toReplace.lookup but the node is translated, reset it
    node.textContent = currentTitle;

    // Remove all subject-related classes
    const oldSubjectType = node.parentElement.getAttribute('data-vocabify-subject-type');
    if (oldSubjectType) {
      const oldSubjectClass = 'vocabify-' + oldSubjectType;
      const oldNoStyleClass = oldSubjectClass + '-no-style';
      node.parentElement.classList.remove(oldSubjectClass, oldNoStyleClass);
    }
  }
}

export function replaceTextNodes(node: Node) {
  if (toReplace.regex === undefined) {
    reverseVocabify();
    return;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.parentElement?.classList.contains('vocabify')) return fastReplaceTextNode(node as Text);
    const text = node.nodeValue || '';
    const parts = text.split(toReplace.regex);
    if (parts.length <= 1) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        fragment.appendChild(document.createTextNode(parts[i]));
      } else {
        const div = document.createElement('div');
        div.classList.add('vocabify');

        const subjectType = toReplace.lookup[parts[i].toLowerCase()].subjectType;
        const styleClass = 'vocabify-' + subjectType;
        const noStyleClass = styleClass + '-no-style';

        if (toReplace.styleTranslations) {
          div.classList.add(styleClass);
        } else {
          div.classList.add(noStyleClass);
        }

        div.title = parts[i];
        div.setAttribute('data-vocabify', toReplace.lookup[parts[i].toLowerCase()].characters);
        div.setAttribute('data-vocabify-subject-type', subjectType);
        const level = toReplace.lookup[parts[i].toLowerCase()].level;
        if (level !== undefined) {
          div.setAttribute('data-vocabify-level', level.toString());
        } else {
          div.setAttribute('data-vocabify-level', 'undefined');
        }
        div.textContent = toReplace.lookup[parts[i].toLowerCase()].characters;
        fragment.appendChild(div);
      }
    }
    node.parentNode?.replaceChild(fragment, node);
  } else {
    node.childNodes.forEach(child => {
      replaceTextNodes(child);
    });
  }
}

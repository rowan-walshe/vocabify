import { replaceTextNodes, reverseVocabify, style, unstyle, updateToReplace, vocabify } from './vocabify';
import {
  domainSettingsStorage,
  translationSettingsStorage,
  vocabToReplaceStorage,
  wanikaniSubjectStylePreferenceStorage,
} from '@extension/storage';

const observerOptions = {
  childList: true,
  subtree: true,
};

const observer = new MutationObserver(vocabify);

async function shouldTranslate(): Promise<boolean> {
  const currentDomain = window.location.hostname;
  const domainSettings = await domainSettingsStorage.get();
  const translationActive = await translationSettingsStorage.getTranslationActive();
  return (
    domainSettings.alwaysTranslateDomain.includes(currentDomain) ||
    (translationActive && !domainSettings.neverTranslateDomain.includes(currentDomain))
  );
}

async function initialReplacement() {
  await updateToReplace();
  if (!(await shouldTranslate())) {
    observer.disconnect();
    return;
  }
  observer.observe(document.body, observerOptions);
  replaceTextNodes(document.body);
}

async function handleSettingsUpdate() {
  if (!(await shouldTranslate())) {
    observer.disconnect();
    reverseVocabify();
  } else {
    observer.observe(document.body, observerOptions);
    replaceTextNodes(document.body);
  }
}

async function handleVocabUpdate() {
  await updateToReplace();
  if (!(await shouldTranslate())) return;
  replaceTextNodes(document.body);
}

async function handleStylePreferenceUpdate() {
  const stylePreference = await wanikaniSubjectStylePreferenceStorage.get();
  if (stylePreference) {
    style();
  } else {
    unstyle();
  }
}

// TODO figure out if we need to unsubscribe from the observer
domainSettingsStorage.subscribe(handleSettingsUpdate);
translationSettingsStorage.subscribe(handleSettingsUpdate);
vocabToReplaceStorage.subscribe(handleVocabUpdate);
wanikaniSubjectStylePreferenceStorage.subscribe(handleStylePreferenceUpdate);
initialReplacement();

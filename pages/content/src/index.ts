import { replaceTextNodes, reverseVocabify, style, unstyle, updateToReplace, vocabify } from './vocabify';
import {
  excludedDomainStorage,
  vocabToReplaceStorage,
  wanikaniSubjectStylePreferenceStorage,
} from '@extension/storage';

const observerOptions = {
  childList: true,
  subtree: true,
};

const observer = new MutationObserver(vocabify);

async function initialReplacement() {
  const currentDomain = window.location.hostname;
  await updateToReplace();
  const excludedDomains = await excludedDomainStorage.get();
  if (excludedDomains.includes(currentDomain)) {
    observer.disconnect();
    return;
  }
  observer.observe(document.body, observerOptions);
  replaceTextNodes(document.body);
}

async function handleExcludedDomainsUpdate() {
  const currentDomain = window.location.hostname;
  const excludedDomains = await excludedDomainStorage.get();
  if (excludedDomains.includes(currentDomain)) {
    observer.disconnect();
    reverseVocabify();
  } else {
    observer.observe(document.body, observerOptions);
    replaceTextNodes(document.body);
  }
}

async function handleVocabUpdate() {
  await updateToReplace();
  const currentDomain = window.location.hostname;
  const excludedDomains = await excludedDomainStorage.get();
  if (excludedDomains.includes(currentDomain)) return;
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
excludedDomainStorage.subscribe(handleExcludedDomainsUpdate);
vocabToReplaceStorage.subscribe(handleVocabUpdate);
wanikaniSubjectStylePreferenceStorage.subscribe(handleStylePreferenceUpdate);
initialReplacement();

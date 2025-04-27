import {
  assignmentStorage,
  userStorage,
  radicalSubjectStorage,
  kanjiSubjectStorage,
  vocabularySubjectStorage,
  kanaVocabularySubjectStorage,
  waniKaniSubjectTypeSelectionStorage,
  wanikaniSrsRangeStorage,
  vocabToReplaceStorage,
} from '@extension/storage';
import type {
  AssignmentResponse,
  KanaVocabularyResponse,
  KanjiResponse,
  RadicalResponse,
  SubjectResponse,
  SubjectType,
  UserData,
  VocabularyResponse,
} from '@extension/shared';
import type { SubjectTypeSelection, SrsRange, SubjectIdMap, VocabLookup } from '@extension/storage';

/**
 * Helper function to get a subject from the appropriate lookup based on its type
 */
function getSubjectFromLookup(
  subjectId: number,
  subjectType: SubjectType,
  radicalLookup: SubjectIdMap<RadicalResponse>,
  kanjiLookup: SubjectIdMap<KanjiResponse>,
  vocabularyLookup: SubjectIdMap<VocabularyResponse>,
  kanaVocabularyLookup: SubjectIdMap<KanaVocabularyResponse>,
): SubjectResponse | undefined {
  switch (subjectType) {
    case 'radical':
      return radicalLookup[subjectId];
    case 'kanji':
      return kanjiLookup[subjectId];
    case 'vocabulary':
      return vocabularyLookup[subjectId];
    case 'kana_vocabulary':
      return kanaVocabularyLookup[subjectId];
  }
}

export function createAssignmentFilter(
  selectedSubjectType: SubjectTypeSelection,
  srsRange: SrsRange,
  user: UserData,
  radicalLookup: SubjectIdMap<RadicalResponse>,
  kanjiLookup: SubjectIdMap<KanjiResponse>,
  vocabularyLookup: SubjectIdMap<VocabularyResponse>,
  kanaVocabularyLookup: SubjectIdMap<KanaVocabularyResponse>,
): (assignment: AssignmentResponse) => boolean {
  return assignment => {
    // Check that the assignment is within the user's SRS range
    if (assignment.data.srs_stage <= srsRange.min) return false;
    if (assignment.data.srs_stage >= srsRange.max) return false;
    // Check that the assignment is for a subject type that the user has selected
    if (!selectedSubjectType[assignment.data.subject_type]) return false;
    // Check that the assignment is not hidden
    if (assignment.data.hidden) return false;

    const subject = getSubjectFromLookup(
      assignment.data.subject_id,
      assignment.data.subject_type,
      radicalLookup,
      kanjiLookup,
      vocabularyLookup,
      kanaVocabularyLookup,
    );

    // Subject not found in our current storage
    if (subject === undefined) return false;
    // Subject was moved to level above the user's level
    if (subject.data.level > user.level) return false;
    // Subject is not covered by the user's subscription
    if (subject.data.level > user.subscription.max_level_granted) return false;

    return true;
  };
}

export interface VocabSrsStage {
  vocab: SubjectResponse;
  srsStage: number;
}

/**
 * Selects between two vocabulary items based on SRS stage and subject type priority.
 *
 * The selection follows these rules in order:
 * 1. If the second item is undefined, returns the first
 * 2. If the first item has a lower SRS stage, returns the first
 * 3. If both items are of the same type, randomly selects one
 * 4. Otherwise, prioritizes by subject type in this order:
 *    - vocabulary
 *    - kana_vocabulary
 *    - kanji
 *    - radical
 *
 * @param a - The first vocabulary item to consider
 * @param b - The second vocabulary item to consider (optional)
 * @returns The selected vocabulary item based on the priority rules
 */
export function chooseVocab(a: VocabSrsStage, b: VocabSrsStage | undefined): VocabSrsStage {
  if (b === undefined) return a;
  if (a.srsStage !== b.srsStage) return a.srsStage < b.srsStage ? a : b;
  if (a.vocab.object === b.vocab.object) {
    // Randomly choose a or b;
    return Math.random() < 0.5 ? a : b;
  }
  if (a.vocab.object === 'vocabulary') return a;
  if (b.vocab.object === 'vocabulary') return b;
  if (a.vocab.object === 'kana_vocabulary') return a;
  if (b.vocab.object === 'kana_vocabulary') return b;
  if (a.vocab.object === 'kanji') return a;
  return b;
  // They can't both be radical, so it will have returned before here
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates an optimized regex pattern for finding vocabulary in text
 */
function generateVocabRegex(originals: string[]): string | undefined {
  if (originals.length === 0) return undefined;
  // Sort by length in descending order to match longer words first
  const sorted = [...originals].sort((a, b) => b.length - a.length);
  // Escape special regex characters and join with | for alternation
  return `\\b(${sorted.map(escapeRegex).join('|')})\\b`;
}

/**
 * Updates the vocabulary replacement lookup based on current assignments and subjects.
 * This function:
 * 1. Filters assignments based on user preferences and SRS range
 * 2. Creates a lookup of vocabulary items by their meanings
 * 3. Generates a regex pattern for finding vocabulary in text
 * 4. Stores the results in vocabToReplaceStorage
 */
export async function updateVocabToReplace() {
  const selectedSubjectType = await waniKaniSubjectTypeSelectionStorage.get();
  const srsRange = await wanikaniSrsRangeStorage.get();
  const user = await userStorage.getUserResponse();
  const radicalLookup = await radicalSubjectStorage.get();
  const kanjiLookup = await kanjiSubjectStorage.get();
  const vocabularyLookup = await vocabularySubjectStorage.get();
  const kanaVocabularyLookup = await kanaVocabularySubjectStorage.get();

  if (user === null) {
    vocabToReplaceStorage.set({
      regexString: undefined,
      lookup: {},
    });
    return;
  }

  const assignmentFilter = createAssignmentFilter(
    selectedSubjectType,
    srsRange,
    user.data,
    radicalLookup.subjects,
    kanjiLookup.subjects,
    vocabularyLookup.subjects,
    kanaVocabularyLookup.subjects,
  );

  const assignments = await assignmentStorage.getAssignments(assignmentFilter);
  const vocab: VocabSrsStage[] = [];

  for (const assignment of assignments) {
    const subject = getSubjectFromLookup(
      assignment.data.subject_id,
      assignment.data.subject_type,
      radicalLookup.subjects,
      kanjiLookup.subjects,
      vocabularyLookup.subjects,
      kanaVocabularyLookup.subjects,
    );

    if (subject === undefined) continue;
    vocab.push({
      vocab: subject,
      srsStage: assignment.data.srs_stage,
    });
  }

  const intermediateLookup: { [key: string]: VocabSrsStage } = {};
  for (const subject of vocab) {
    // TODO consider using the radical images if there are no characters
    if (subject.vocab.data.characters === null) continue;
    for (const meaning of subject.vocab.data.meanings) {
      const original: string = meaning.meaning.toLowerCase();
      intermediateLookup[original] = chooseVocab(subject, intermediateLookup[original]);
    }
  }

  const finalLookup: VocabLookup = {};
  for (const [original, subject] of Object.entries(intermediateLookup)) {
    // Only subjects with non-null characters are added to the intermediate lookup
    finalLookup[original] = {
      characters: subject.vocab.data.characters!,
      subjectType: subject.vocab.object,
      srsStage: subject.srsStage,
      level: subject.vocab.data.level,
    };
  }

  const regexString = generateVocabRegex(Object.keys(finalLookup));
  vocabToReplaceStorage.set({
    regexString,
    lookup: finalLookup,
  });
}

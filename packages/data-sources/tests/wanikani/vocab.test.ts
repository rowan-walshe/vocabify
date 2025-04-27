import { expect, it, describe, beforeEach, vi } from 'vitest';
import { chooseVocab, escapeRegex, createAssignmentFilter, type VocabSrsStage } from '../../lib/wanikani/vocab';
import type {
  AssignmentResponse,
  KanaVocabularyResponse,
  KanjiResponse,
  RadicalResponse,
  UserData,
  VocabularyResponse,
} from '@extension/shared';
import type { SubjectTypeSelection, SrsRange, SubjectIdMap } from '@extension/storage';

const {
  mockUser,
  mockSelectedSubjectType,
  mockSrsRange,
  mockRadicalLookup,
  mockKanjiLookup,
  mockVocabularyLookup,
  mockKanaVocabularyLookup,
  mockAssignments,
} = vi.hoisted(() => {
  const mockUser: UserData = {
    id: '1',
    username: 'test',
    level: 5,
    subscription: {
      active: true,
      type: 'lifetime',
      max_level_granted: 10,
      period_ends_at: new Date(),
    },
    profile_url: '',
    started_at: new Date(0),
    current_vacation_started_at: null,
    preferences: {
      default_voice_actor_id: 1,
      lessons_autoplay_audio: false,
      lessons_batch_size: 10,
      lessons_presentation_order: 'ascending_level_then_subject',
      reviews_autoplay_audio: false,
      reviews_display_srs_indicator: true,
      extra_study_autoplay_audio: false,
      reviews_presentation_order: 'shuffled',
    },
  };

  const mockSelectedSubjectType: SubjectTypeSelection = {
    radical: true,
    kanji: true,
    vocabulary: true,
    kana_vocabulary: true,
  };

  const mockSrsRange: SrsRange = {
    min: 1,
    max: 9,
  };

  const mockRadicalLookup: SubjectIdMap<RadicalResponse> = {
    '1': {
      id: 1,
      object: 'radical',
      data: {
        auxiliary_meanings: [],
        characters: null,
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [{ meaning: 'one', primary: true, accepted_answer: true }],
        slug: '',
        spaced_repetition_system_id: 1,
        amalgamation_subject_ids: [],
        character_images: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockKanjiLookup: SubjectIdMap<KanjiResponse> = {
    '2': {
      id: 2,
      object: 'kanji',
      data: {
        auxiliary_meanings: [],
        characters: '日',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [{ meaning: 'sun', primary: true, accepted_answer: true }],
        slug: '',
        spaced_repetition_system_id: 1,
        amalgamation_subject_ids: [],
        component_subject_ids: [],
        meaning_hint: '',
        reading_hint: '',
        reading_mnemonic: '',
        readings: [],
        visually_similar_subject_ids: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockVocabularyLookup: SubjectIdMap<VocabularyResponse> = {
    '3': {
      id: 3,
      object: 'vocabulary',
      data: {
        auxiliary_meanings: [],
        characters: '日本語',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [{ meaning: 'japanese', primary: true, accepted_answer: true }],
        slug: '',
        spaced_repetition_system_id: 1,
        component_subject_ids: [],
        context_sentences: [],
        parts_of_speech: [],
        pronunciation_audios: [],
        reading_mnemonic: '',
        readings: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockKanaVocabularyLookup: SubjectIdMap<KanaVocabularyResponse> = {
    '4': {
      id: 4,
      object: 'kana_vocabulary',
      data: {
        auxiliary_meanings: [],
        characters: 'にほんご',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [{ meaning: 'japanese', primary: true, accepted_answer: true }],
        slug: '',
        spaced_repetition_system_id: 1,
        context_sentences: [],
        parts_of_speech: [],
        pronunciation_audios: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockAssignments: AssignmentResponse[] = [
    {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 2,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 2,
        subject_type: 'kanji',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 3,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 3,
        subject_type: 'vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 4,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 4,
        subject_type: 'kana_vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
  ];

  return {
    mockUser,
    mockSelectedSubjectType,
    mockSrsRange,
    mockRadicalLookup,
    mockKanjiLookup,
    mockVocabularyLookup,
    mockKanaVocabularyLookup,
    mockAssignments,
  };
});

vi.mock('@extension/storage', () => ({
  userStorage: {
    getUserResponse: vi.fn().mockResolvedValue(mockUser),
  },
  waniKaniSubjectTypeSelectionStorage: {
    get: vi.fn().mockResolvedValue(mockSelectedSubjectType),
  },
  wanikaniSrsRangeStorage: {
    get: vi.fn().mockResolvedValue(mockSrsRange),
  },
  radicalSubjectStorage: {
    get: vi.fn().mockResolvedValue({ subjects: mockRadicalLookup, lastUpdated: Date.now() }),
  },
  kanjiSubjectStorage: {
    get: vi.fn().mockResolvedValue({ subjects: mockKanjiLookup, lastUpdated: Date.now() }),
  },
  vocabularySubjectStorage: {
    get: vi.fn().mockResolvedValue({ subjects: mockVocabularyLookup, lastUpdated: Date.now() }),
  },
  kanaVocabularySubjectStorage: {
    get: vi.fn().mockResolvedValue({ subjects: mockKanaVocabularyLookup, lastUpdated: Date.now() }),
  },
  assignmentStorage: {
    getAssignments: vi.fn().mockResolvedValue(mockAssignments),
  },
  vocabToReplaceStorage: {
    set: vi.fn(),
  },
}));

describe('chooseVocab', () => {
  function randomSrsStage(min: number = 1, max: number = 9): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function createRadical(srsStage: number): VocabSrsStage {
    return {
      vocab: {
        id: 1,
        object: 'radical',
        data: {
          auxiliary_meanings: [],
          characters: null,
          created_at: new Date(0),
          document_url: '',
          hidden_at: null,
          lesson_position: 1,
          level: 1,
          meaning_mnemonic: '',
          meanings: [],
          slug: '',
          spaced_repetition_system_id: 1,
          amalgamation_subject_ids: [],
          character_images: [],
        },
        url: '',
        data_updated_at: new Date(0),
      },
      srsStage,
    };
  }

  function createKanji(srsStage: number): VocabSrsStage {
    return {
      vocab: {
        id: 2,
        object: 'kanji',
        data: {
          auxiliary_meanings: [],
          characters: '日',
          created_at: new Date(0),
          document_url: '',
          hidden_at: null,
          lesson_position: 1,
          level: 1,
          meaning_mnemonic: '',
          meanings: [],
          slug: '',
          spaced_repetition_system_id: 1,
          amalgamation_subject_ids: [],
          component_subject_ids: [],
          meaning_hint: '',
          reading_hint: '',
          reading_mnemonic: '',
          readings: [],
          visually_similar_subject_ids: [],
        },
        url: '',
        data_updated_at: new Date(0),
      },
      srsStage,
    };
  }

  function createVocabulary(srsStage: number): VocabSrsStage {
    return {
      vocab: {
        id: 3,
        object: 'vocabulary',
        data: {
          auxiliary_meanings: [],
          characters: '日本語',
          created_at: new Date(0),
          document_url: '',
          hidden_at: null,
          lesson_position: 1,
          level: 1,
          meaning_mnemonic: '',
          meanings: [],
          slug: '',
          spaced_repetition_system_id: 1,
          component_subject_ids: [],
          context_sentences: [],
          parts_of_speech: [],
          pronunciation_audios: [],
          reading_mnemonic: '',
          readings: [],
        },
        url: '',
        data_updated_at: new Date(0),
      },
      srsStage,
    };
  }

  function createKanaVocabulary(srsStage: number): VocabSrsStage {
    return {
      vocab: {
        id: 4,
        object: 'kana_vocabulary',
        data: {
          auxiliary_meanings: [],
          characters: 'にほんご',
          created_at: new Date(0),
          document_url: '',
          hidden_at: null,
          lesson_position: 1,
          level: 1,
          meaning_mnemonic: '',
          meanings: [],
          slug: '',
          spaced_repetition_system_id: 1,
          context_sentences: [],
          parts_of_speech: [],
          pronunciation_audios: [],
        },
        url: '',
        data_updated_at: new Date(0),
      },
      srsStage,
    };
  }

  it('should select the first vocab object if the second is undefined', () => {
    const radical = createRadical(1);
    expect(chooseVocab(radical, undefined)).toBe(radical);
  });

  it('should select the vocab with lower SRS stage', () => {
    const radical1 = createRadical(1);
    const radical2 = createRadical(2);
    const kanji1 = createKanji(1);
    const kanji2 = createKanji(2);
    expect(chooseVocab(radical1, kanji2)).toBe(radical1);
    expect(chooseVocab(radical2, kanji1)).toBe(kanji1);
    expect(chooseVocab(kanji1, radical2)).toBe(kanji1);
    expect(chooseVocab(kanji2, radical1)).toBe(radical1);
  });

  it('should randomly select between same type vocabs', () => {
    const srsStage = randomSrsStage();
    const radical1 = createRadical(srsStage);
    const radical2 = { ...radical1, vocab: { ...radical1.vocab, id: 5 } };

    // Run multiple iterations to test randomness
    const results = new Set<VocabSrsStage>();
    for (let i = 0; i < 100; i++) {
      results.add(chooseVocab(radical1, radical2));
    }

    // We should have gotten both options at least once (<1 in 10^30 to fail for a valid implementation)
    expect(results.has(radical1)).toBe(true);
    expect(results.has(radical2)).toBe(true);
  });

  it('should return second vocab when first is radical and second is kanji', () => {
    const srsStage = randomSrsStage();
    const radical = createRadical(srsStage);
    const kanji = createKanji(srsStage);
    expect(chooseVocab(radical, kanji)).toBe(kanji);
  });

  it('should prioritize vocabulary over other types', () => {
    const srsStage = randomSrsStage();
    const vocabulary = createVocabulary(srsStage);
    const kanji = createKanji(srsStage);
    const kanaVocabulary = createKanaVocabulary(srsStage);
    const radical = createRadical(srsStage);
    expect(chooseVocab(vocabulary, kanji)).toBe(vocabulary);
    expect(chooseVocab(vocabulary, kanaVocabulary)).toBe(vocabulary);
    expect(chooseVocab(vocabulary, radical)).toBe(vocabulary);
  });

  it('should prioritize kana_vocabulary over kanji and radical', () => {
    const srsStage = randomSrsStage();
    const kanaVocabulary = createKanaVocabulary(srsStage);
    const kanji = createKanji(srsStage);
    const radical = createRadical(srsStage);
    expect(chooseVocab(kanaVocabulary, kanji)).toBe(kanaVocabulary);
    expect(chooseVocab(kanaVocabulary, radical)).toBe(kanaVocabulary);
  });

  it('should prioritize kanji over radical', () => {
    const srsStage = randomSrsStage();
    const kanji = createKanji(srsStage);
    const radical = createRadical(srsStage);
    expect(chooseVocab(kanji, radical)).toBe(kanji);
  });
});

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    const specialChars = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(specialChars);
    expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('should not escape regular characters', () => {
    const regularString = 'hello world 123';
    const escaped = escapeRegex(regularString);
    expect(escaped).toBe(regularString);
  });

  it('should handle empty string', () => {
    const emptyString = '';
    const escaped = escapeRegex(emptyString);
    expect(escaped).toBe(emptyString);
  });

  it('should handle mixed special and regular characters', () => {
    const mixedString = 'hello.world+123?';
    const escaped = escapeRegex(mixedString);
    expect(escaped).toBe('hello\\.world\\+123\\?');
  });
});

describe('createAssignmentFilter', () => {
  const mockUser: UserData = {
    id: '1',
    username: 'test',
    level: 5,
    subscription: {
      active: true,
      type: 'lifetime',
      max_level_granted: 10,
      period_ends_at: new Date(),
    },
    profile_url: '',
    started_at: new Date(0),
    current_vacation_started_at: null,
    preferences: {
      default_voice_actor_id: 1,
      lessons_autoplay_audio: false,
      lessons_batch_size: 10,
      lessons_presentation_order: 'ascending_level_then_subject',
      reviews_autoplay_audio: false,
      reviews_display_srs_indicator: true,
      extra_study_autoplay_audio: false,
      reviews_presentation_order: 'shuffled',
    },
  };

  const mockSelectedSubjectType: SubjectTypeSelection = {
    radical: true,
    kanji: true,
    vocabulary: true,
    kana_vocabulary: true,
  };

  const mockSrsRange: SrsRange = {
    min: 1,
    max: 9,
  };

  const mockRadicalLookup: SubjectIdMap<RadicalResponse> = {
    '1': {
      id: 1,
      object: 'radical',
      data: {
        auxiliary_meanings: [],
        characters: null,
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [],
        slug: '',
        spaced_repetition_system_id: 1,
        amalgamation_subject_ids: [],
        character_images: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockKanjiLookup: SubjectIdMap<KanjiResponse> = {
    '2': {
      id: 2,
      object: 'kanji',
      data: {
        auxiliary_meanings: [],
        characters: '日',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [],
        slug: '',
        spaced_repetition_system_id: 1,
        amalgamation_subject_ids: [],
        component_subject_ids: [],
        meaning_hint: '',
        reading_hint: '',
        reading_mnemonic: '',
        readings: [],
        visually_similar_subject_ids: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockVocabularyLookup: SubjectIdMap<VocabularyResponse> = {
    '3': {
      id: 3,
      object: 'vocabulary',
      data: {
        auxiliary_meanings: [],
        characters: '日本語',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [],
        slug: '',
        spaced_repetition_system_id: 1,
        component_subject_ids: [],
        context_sentences: [],
        parts_of_speech: [],
        pronunciation_audios: [],
        reading_mnemonic: '',
        readings: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockKanaVocabularyLookup: SubjectIdMap<KanaVocabularyResponse> = {
    '4': {
      id: 4,
      object: 'kana_vocabulary',
      data: {
        auxiliary_meanings: [],
        characters: 'にほんご',
        created_at: new Date(0),
        document_url: '',
        hidden_at: null,
        lesson_position: 1,
        level: 1,
        meaning_mnemonic: '',
        meanings: [],
        slug: '',
        spaced_repetition_system_id: 1,
        context_sentences: [],
        parts_of_speech: [],
        pronunciation_audios: [],
      },
      url: '',
      data_updated_at: new Date(0),
    },
  };

  const mockAssignments: AssignmentResponse[] = [
    {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 2,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 2,
        subject_type: 'kanji',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 3,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 3,
        subject_type: 'vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
    {
      id: 4,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 4,
        subject_type: 'kana_vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.doMock('@extension/storage', () => ({
      userStorage: {
        getUserResponse: vi.fn().mockResolvedValue({
          object: 'user',
          url: '',
          data_updated_at: new Date(),
          data: mockUser,
        }),
      },
      waniKaniSubjectTypeSelectionStorage: {
        get: vi.fn().mockResolvedValue(mockSelectedSubjectType),
      },
      wanikaniSrsRangeStorage: {
        get: vi.fn().mockResolvedValue(mockSrsRange),
      },
      radicalSubjectStorage: {
        get: vi.fn().mockResolvedValue({ subjects: mockRadicalLookup, lastUpdated: Date.now() }),
      },
      kanjiSubjectStorage: {
        get: vi.fn().mockResolvedValue({ subjects: mockKanjiLookup, lastUpdated: Date.now() }),
      },
      vocabularySubjectStorage: {
        get: vi.fn().mockResolvedValue({ subjects: mockVocabularyLookup, lastUpdated: Date.now() }),
      },
      kanaVocabularySubjectStorage: {
        get: vi.fn().mockResolvedValue({ subjects: mockKanaVocabularyLookup, lastUpdated: Date.now() }),
      },
      assignmentStorage: {
        getAssignments: vi.fn().mockResolvedValue(mockAssignments),
      },
      vocabToReplaceStorage: {
        set: vi.fn(),
      },
    }));
  });

  const createFilter = () =>
    createAssignmentFilter(
      mockSelectedSubjectType,
      mockSrsRange,
      mockUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );

  it('should filter out assignments with SRS stage below min', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 0,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out assignments with SRS stage above max', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 10,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out assignments with unselected subject types', () => {
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    const unselectedSubjectType = { ...mockSelectedSubjectType, radical: false };
    const filterWithUnselected = createAssignmentFilter(
      unselectedSubjectType,
      mockSrsRange,
      mockUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    expect(filterWithUnselected(assignment)).toBe(false);
  });

  it('should filter out hidden assignments', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: true,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out assignments with non-existent subjects', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 999, // Non-existent subject ID
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out assignments with subjects above user level', () => {
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    const highLevelUser = { ...mockUser, level: 0 };
    const filterWithHighLevel = createAssignmentFilter(
      mockSelectedSubjectType,
      mockSrsRange,
      highLevelUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    expect(filterWithHighLevel(assignment)).toBe(false);
  });

  it('should filter out assignments with subjects above subscription level', () => {
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    const lowSubscriptionUser = {
      ...mockUser,
      subscription: { ...mockUser.subscription, max_level_granted: 0 },
    };
    const filterWithLowSubscription = createAssignmentFilter(
      mockSelectedSubjectType,
      mockSrsRange,
      lowSubscriptionUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    expect(filterWithLowSubscription(assignment)).toBe(false);
  });

  it('should accept valid assignments', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 1,
        subject_type: 'radical',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(true);
  });

  it('should accept valid kanji assignments', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 2, // Kanji ID
        subject_type: 'kanji',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(true);
  });

  it('should accept valid vocabulary assignments', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 3, // Vocabulary ID
        subject_type: 'vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(true);
  });

  it('should accept valid kana_vocabulary assignments', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 4, // Kana Vocabulary ID
        subject_type: 'kana_vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(true);
  });

  it('should filter out kanji assignments with unselected subject type', () => {
    const unselectedSubjectType = { ...mockSelectedSubjectType, kanji: false };
    const filter = createAssignmentFilter(
      unselectedSubjectType,
      mockSrsRange,
      mockUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 2,
        subject_type: 'kanji',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out vocabulary assignments with unselected subject type', () => {
    const unselectedSubjectType = { ...mockSelectedSubjectType, vocabulary: false };
    const filter = createAssignmentFilter(
      unselectedSubjectType,
      mockSrsRange,
      mockUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 3,
        subject_type: 'vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out kana_vocabulary assignments with unselected subject type', () => {
    const unselectedSubjectType = { ...mockSelectedSubjectType, kana_vocabulary: false };
    const filter = createAssignmentFilter(
      unselectedSubjectType,
      mockSrsRange,
      mockUser,
      mockRadicalLookup,
      mockKanjiLookup,
      mockVocabularyLookup,
      mockKanaVocabularyLookup,
    );
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 4,
        subject_type: 'kana_vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out kanji assignments with non-existent subjects', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 999, // Non-existent kanji ID
        subject_type: 'kanji',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out vocabulary assignments with non-existent subjects', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 999, // Non-existent vocabulary ID
        subject_type: 'vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });

  it('should filter out kana_vocabulary assignments with non-existent subjects', () => {
    const filter = createFilter();
    const assignment: AssignmentResponse = {
      id: 1,
      object: 'assignment',
      data: {
        created_at: new Date(0),
        subject_id: 999, // Non-existent kana vocabulary ID
        subject_type: 'kana_vocabulary',
        srs_stage: 5,
        unlocked_at: new Date(0),
        started_at: new Date(0),
        passed_at: null,
        burned_at: null,
        available_at: null,
        resurrected_at: null,
        hidden: false,
      },
      url: '',
      data_updated_at: new Date(0),
    };
    expect(filter(assignment)).toBe(false);
  });
});

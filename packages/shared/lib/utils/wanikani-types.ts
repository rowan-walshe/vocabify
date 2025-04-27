export interface BaseResponse {
  url: string; // URL for the resource
  data_updated_at: Date; // Timestamp when data was last updated
}

export interface BaseResourceResponse extends BaseResponse {
  id: number; // Unique identifier for the level progression
}

export type ResponseType =
  | 'assignment'
  | 'level_progression'
  | 'reset'
  | 'review'
  | 'review_statistic'
  | 'spaced_repetition_system'
  | 'study_material'
  | 'radical'
  | 'kanji'
  | 'vocabulary'
  | 'kana_vocabulary'
  | 'report'
  | 'user'
  | 'voice_actor'
  | 'collection';

export type SubjectType = 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary';

// Define the structure for the assignment data
export interface AssignmentData {
  available_at: Date | null; // Timestamp when the related subject will be available
  burned_at: Date | null; // Timestamp when the user reaches SRS stage 9 for the first time
  created_at: Date; // Timestamp when the assignment was created
  hidden: boolean; // Indicates if the associated subject has been hidden
  passed_at: Date | null; // Timestamp when the user reaches SRS stage 5 for the first time
  resurrected_at: Date | null; // Timestamp when the subject is resurrected
  srs_stage: number; // The current SRS stage interval
  started_at: Date | null; // Timestamp when the user completes the lesson
  subject_id: number; // Unique identifier of the associated subject
  subject_type: SubjectType; // The type of the associated subject
  unlocked_at: Date | null; // Timestamp when the subject is unlocked
}

export interface AssignmentResponse extends BaseResourceResponse {
  object: 'assignment';
  data: AssignmentData;
}

// Define the structure for the level progression data
export interface LevelProgressionData {
  abandoned_at: Date | null; // Timestamp when the user abandons the level (usually during a reset)
  completed_at: Date | null; // Timestamp when the user completes all assignments and burns the level's subjects
  created_at: Date; // Timestamp when the level progression is created
  level: number; // The level of the progression (ranges from 1 to 60)
  passed_at: Date | null; // Timestamp when the user passes at least 90% of the kanji for the level
  started_at: Date | null; // Timestamp when the user starts their first lesson for the level
  unlocked_at: Date | null; // Timestamp when the user can access lessons and reviews for the level
}

// Define the structure for the level progression response
export interface LevelProgressionResponse extends BaseResourceResponse {
  object: 'level_progression'; // Indicates that this is a level progression object
  data: LevelProgressionData; // The actual level progression data
}

// Define the structure for the reset data
export interface ResetData {
  confirmed_at: Date; // Timestamp when the reset was confirmed
  created_at: Date; // Timestamp when the reset was created
  original_level: number; // The level from which the user reset
  target_level: number; // The level to which the user is resetting
}

// Define the structure for the reset response
export interface ResetResponse extends BaseResourceResponse {
  object: 'reset'; // Indicates that this is a reset object
  data: ResetData; // The actual reset data
}

// Define the structure for the review data
export interface ReviewData {
  assignment_id: number; // Unique identifier of the associated assignment
  created_at: Date; // Timestamp when the review was created
  ending_srs_stage: number; // Ending SRS stage interval (1 to 9)
  incorrect_meaning_answers: number; // Number of incorrect meaning answers
  incorrect_reading_answers: number; // Number of incorrect reading answers
  spaced_repetition_system_id: number; // Unique identifier of the associated spaced repetition system
  starting_srs_stage: number; // Starting SRS stage interval (1 to 8)
  subject_id: number; // Unique identifier of the associated subject
}

// Define the structure for the review response
export interface ReviewResponse extends BaseResourceResponse {
  object: 'review'; // Indicates that this is a review object
  data: ReviewData; // The actual review data
}

// Define the structure for the review statistic data
export interface ReviewStatisticData {
  created_at: Date; // Timestamp when the review statistic was created
  hidden: boolean; // Indicates if the associated subject has been hidden
  meaning_correct: number; // Total number of correct answers for meaning
  meaning_current_streak: number; // Current streak of correct answers for meaning
  meaning_incorrect: number; // Total number of incorrect answers for meaning
  meaning_max_streak: number; // Longest streak of correct answers for meaning
  percentage_correct: number; // Overall percentage of correct answers
  reading_correct: number; // Total number of correct answers for reading
  reading_current_streak: number; // Current streak of correct answers for reading
  reading_incorrect: number; // Total number of incorrect answers for reading
  reading_max_streak: number; // Longest streak of correct answers for reading
  subject_id: number; // Unique identifier of the associated subject
  subject_type: SubjectType; // The type of the associated subject (one of: kana_vocabulary, kanji, radical, or vocabulary)
}

// Define the structure for the review statistic response
export interface ReviewStatisticResponse extends BaseResourceResponse {
  object: 'review_statistic'; // Indicates that this is a review statistic object
  data: ReviewStatisticData; // The actual review statistic data
}

// Define a type for the possible interval units
export type IntervalUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

// Define the structure for the stage data
export interface Stage {
  interval: number | null; // The length of time added, or null for unlocking and burning stages
  interval_unit: IntervalUnit | null; // Unit of time, now using the IntervalUnit type
  position: number; // The position of the stage within the continuous order
}

// Define the structure for the spaced repetition system data
export interface SpacedRepetitionSystemData {
  created_at: Date; // Timestamp when the spaced repetition system was created
  name: string; // The name of the spaced repetition system
  description: string; // Details about the spaced repetition system
  unlocking_stage_position: number; // Position of the unlocking stage
  starting_stage_position: number; // Position of the starting stage
  passing_stage_position: number; // Position of the passing stage
  burning_stage_position: number; // Position of the burning stage
  stages: Stage[]; // Collection of stages
}

// Define the structure for the spaced repetition system response
export interface SpacedRepetitionSystemResponse extends BaseResourceResponse {
  object: 'spaced_repetition_system'; // Indicates that this is a spaced repetition system object
  data: SpacedRepetitionSystemData; // The actual spaced repetition system data
}

// Define the structure for the study material data
export interface StudyMaterialData {
  created_at: Date; // Timestamp when the study material was created
  subject_id: number; // Unique identifier of the associated subject
  subject_type: SubjectType; // The type of the associated subject (e.g., kana_vocabulary, kanji, radical, vocabulary)
  meaning_note: string; // Free form note related to the meaning(s) of the associated subject
  reading_note: string; // Free form note related to the reading(s) of the associated subject
  meaning_synonyms: string[]; // Synonyms for the meaning of the subject
}

// Define the structure for the study material response
export interface StudyMaterialResponse extends BaseResourceResponse {
  object: 'study_material'; // Indicates that this is a study material object
  data: StudyMaterialData; // The actual study material data
}

// Meaning Object Structure
export interface SubjectMeaning {
  meaning: string; // Singular subject meaning
  primary: boolean; // Indicates the main meaning
  accepted_answer: boolean; // Determines if the meaning is used to evaluate user input
}

// Auxiliary Meaning Object Structure
export interface SubjectAuxiliaryMeaning {
  meaning: string; // Singular subject meaning
  type: 'whitelist' | 'blacklist'; // Meaning type used for input correctness evaluation
}

// Character Image Metadata Object Structure
export interface CharacterImageMetadata {
  inline_styles: boolean; // Indicates if the image has built-in CSS styling. Always true
}

// Character Image Object Structure
export interface CharacterImage {
  url: string; // Location of the image
  content_type: 'image/svg+xml'; // Only SVG format is supported
  metadata: CharacterImageMetadata; // Metadata about the image
}

// Common Subject Attributes
export interface CommonSubjectAttributes {
  auxiliary_meanings: SubjectAuxiliaryMeaning[]; // Collection of auxiliary meanings
  characters: string | null; // UTF-8 characters for the subject
  created_at: Date; // Timestamp when the subject was created
  document_url: string; // URL pointing to the subject's detail page on WaniKani
  hidden_at: Date | null; // Timestamp when the subject was hidden (null if not hidden)
  lesson_position: number; // Position in lessons (scoped to subject level)
  level: number; // The level of the subject (1 to 60)
  meaning_mnemonic: string; // Meaning mnemonic
  meanings: SubjectMeaning[]; // Collection of subject meanings
  slug: string; // Used in generating the document URL
  spaced_repetition_system_id: number; // Identifier for the spaced repetition system
}

// Radical Attributes
export interface RadicalData extends CommonSubjectAttributes {
  amalgamation_subject_ids: number[]; // Identifiers for kanji that have the radical as a component
  characters: string | null; // UTF-8 characters for the subject, can be null for radicals
  character_images: CharacterImage[]; // Images of the radical
}

export interface KanjiReading {
  reading: string; // A singular subject reading
  primary: boolean; // Indicates the main meaning
  accepted_answer: boolean; // Indicates if the reading is used to evaluate the user input for correctness
  type: 'kunyomi' | 'nanori' | 'onyomi'; // The kanji's reading classification
}

// Kanji Attributes
export interface KanjiData extends CommonSubjectAttributes {
  amalgamation_subject_ids: number[]; // Identifiers for vocab that have this kanji as a component
  component_subject_ids: number[]; // Identifiers for radicals that make up this kanji
  characters: string; // UTF-8 characters for the subject
  meaning_hint: string | null; // Meaning hint for this kanji
  reading_hint: string | null; // Reading hint for this kanji
  reading_mnemonic: string; // This kanji's mnemonic
  readings: KanjiReading[]; // Selected readings for thi kanji
  visually_similar_subject_ids: number[]; // Identifiers for kanji which are visually similar to this kanji
}

// Reading Object Attributes
export interface VocabularyReading {
  accepted_answer: boolean; // Indicates if the reading is used to evaluate user input for correctness
  primary: boolean; // Indicates priority in the WaniKani system
  reading: string; // A singular subject reading
}

// Context Sentence Object Attributes
export interface ContextSentence {
  en: string; // English translation of the sentence
  ja: string; // Japanese context sentence
}

// Pronunciation Audio Metadata Object Attributes
export interface PronunciationAudioMetadata {
  gender: string; // The gender of the voice actor
  source_id: number; // A unique ID shared between same source pronunciation audio
  pronunciation: string; // Vocabulary being pronounced in kana
  voice_actor_id: number; // A unique ID belonging to the voice actor
  voice_actor_name: string; // Humanized name of the voice actor
  voice_description: string; // Description of the voice
}

// Pronunciation Audio Object Attributes
export interface PronunciationAudio {
  url: string; // The location of the audio
  content_type: string; // The content type of the audio (audio/mpeg, audio/ogg)
  metadata: PronunciationAudioMetadata; // Details about the pronunciation audio
}

// Vocabulary Attributes
export interface VocabularyData extends CommonSubjectAttributes {
  component_subject_ids: number[]; // Array of numeric identifiers for kanji making up this vocabulary
  context_sentences: ContextSentence[]; // Collection of context sentences
  parts_of_speech: string[]; // Parts of speech
  pronunciation_audios: PronunciationAudio[]; // Collection of pronunciation audio objects
  readings: VocabularyReading[]; // Selected readings for the vocabulary
  reading_mnemonic: string; // Reading mnemonic
}

// Kana Vocabulary Attributes
export interface KanaVocabularyData extends CommonSubjectAttributes {
  context_sentences: ContextSentence[]; // Collection of context sentences
  parts_of_speech: string[]; // Array of parts of speech
  pronunciation_audios: PronunciationAudio[]; // Collection of pronunciation audio objects
}

// Define the structure for the radical response
export interface RadicalResponse extends BaseResourceResponse {
  object: 'radical'; // Indicates that this is a study material object
  data: RadicalData; // The actual study material data
}

// Define the structure for the kanji response
export interface KanjiResponse extends BaseResourceResponse {
  object: 'kanji'; // Indicates that this is a study material object
  data: KanjiData; // The actual study material data
}

// Define the structure for the vocab response
export interface VocabularyResponse extends BaseResourceResponse {
  object: 'vocabulary'; // Indicates that this is a study material object
  data: VocabularyData; // The actual study material data
}

// Define the structure for the kana vocab response
export interface KanaVocabularyResponse extends BaseResourceResponse {
  object: 'kana_vocabulary'; // Indicates that this is a study material object
  data: KanaVocabularyData; // The actual study material data
}

// Define the structure for a lesson object
export interface Lesson {
  available_at: Date; // When the paired subject_ids are available for lessons
  subject_ids: number[]; // Collection of unique identifiers for subjects
}

// Define the structure for a review object
export interface Review {
  available_at: Date; // When the paired subject_ids are available for reviews
  subject_ids: number[]; // Collection of unique identifiers for subjects
}

// Define the structure for the summary data
export interface SummaryData {
  lessons: Lesson[]; // Array of lessons available now
  next_reviews_at: Date | null; // Earliest date when the reviews are available, or null if none are scheduled
  reviews: Review[]; // Array of reviews available now and in the next 24 hours
}

// Define the structure for the summary response
export interface SummaryResponse extends BaseResourceResponse {
  object: 'report'; // Indicates that this is a summary report object
  data: SummaryData; // The actual summary data
}

// Define the structure for the user's preferences
export interface UserPreferences {
  default_voice_actor_id: number; // Deprecated user preference, always returns 1
  extra_study_autoplay_audio: boolean; // Automatically play pronunciation audio during extra study
  lessons_autoplay_audio: boolean; // Automatically play pronunciation audio during lessons
  lessons_batch_size: number; // Number of subjects introduced during lessons before quizzing
  lessons_presentation_order: string; // Deprecated, always returns ascending_level_then_subject
  reviews_autoplay_audio: boolean; // Automatically play pronunciation audio during reviews
  reviews_display_srs_indicator: boolean; // Display SRS change indicator after review
  reviews_presentation_order: 'shuffled' | 'lower_levels_first'; // Order of reviews presentation
}

// Define the structure for the user's subscription
export interface UserSubscription {
  active: boolean; // Whether the user has a paid subscription
  max_level_granted: number; // Maximum level of content accessible
  period_ends_at: Date | null; // When the user's subscription period ends, null if lifetime/free
  type: 'free' | 'recurring' | 'lifetime'; // Type of subscription
}

// Define the structure for the user data
export interface UserData {
  id: string; // Unique identifier for the user
  username: string; // The user's username
  level: number; // Current level of the user
  profile_url: string; // URL to the user's public profile
  started_at: Date; // User signup date
  current_vacation_started_at: Date | null; // Vacation start date, null if not on vacation
  subscription: UserSubscription; // User's subscription details
  preferences: UserPreferences; // User preferences
}

// Define the structure for the user response
export interface UserResponse extends BaseResourceResponse {
  object: 'user'; // Indicates that this is a user object
  data: UserData; // The actual user data
}

// Define the structure for the voice actor data
export interface VoiceActorData {
  created_at: Date; // Timestamp when the voice actor was created
  name: string; // The voice actor's name
  gender: 'male' | 'female'; // Gender of the voice actor
  description: string; // Details about the voice actor
}

// Define the structure for the voice actor response
export interface VoiceActorResponse extends BaseResourceResponse {
  object: 'voice_actor'; // Indicates that this is a voice actor object
  data: VoiceActorData; // The actual voice actor data
}

export type ResourceResponse =
  | AssignmentResponse
  | LevelProgressionResponse
  | ResetResponse
  | ReviewResponse
  | ReviewStatisticResponse
  | SpacedRepetitionSystemResponse
  | StudyMaterialResponse
  | RadicalResponse
  | KanjiResponse
  | VocabularyResponse
  | KanaVocabularyResponse
  | SummaryResponse
  | UserResponse
  | VoiceActorResponse;

export interface PaginationData {
  next_url: string | null;
  previous_url: string | null;
  per_page: number;
}

export interface CollectionResponse extends BaseResponse {
  object: 'collection';
  pages: PaginationData;
  total_count: number;
  data: ResourceResponse[];
}

export type SubjectResponse = RadicalResponse | KanjiResponse | VocabularyResponse | KanaVocabularyResponse;

export type SubjectData = RadicalData | KanjiData | VocabularyData | KanaVocabularyData;

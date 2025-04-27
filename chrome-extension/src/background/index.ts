import 'webextension-polyfill';
import {
  wanikaniApiKeyStorage,
  wanikaniSubjectUpdateIntervalStorage,
  wanikaniUserUpdateIntervalStorage,
  wanikaniAssignmentUpdateIntervalStorage,
  wanikaniSrsRangeStorage,
  waniKaniSubjectTypeSelectionStorage,
} from '@extension/storage';
import {
  updateAllWaniKaniSubjects,
  updateWaniKaniUser,
  updateAllWaniKaniAssignments,
  updateVocabToReplace,
} from '@extension/data-sources';

const ASSIGNMENT_ALARM_NAME = 'update-assignment-alarm';
const VOCAB_ALARM_NAME = 'update-vocabulary-alarm';
const USER_ALARM_NAME = 'update-user-alarm';

async function checkAlarmSet(alarmName: string, updateIntervalMinutes: number) {
  const alarm = await chrome.alarms.get(alarmName);
  if (!alarm) {
    await chrome.alarms.create(alarmName, { periodInMinutes: updateIntervalMinutes });
  } else if (alarm.periodInMinutes !== updateIntervalMinutes) {
    await chrome.alarms.clear(alarmName);
    await chrome.alarms.create(alarmName, { periodInMinutes: updateIntervalMinutes });
  }
}

async function checkAllAlarmsSet() {
  await checkAlarmSet(ASSIGNMENT_ALARM_NAME, await wanikaniAssignmentUpdateIntervalStorage.get());
  await checkAlarmSet(VOCAB_ALARM_NAME, await wanikaniSubjectUpdateIntervalStorage.get());
  await checkAlarmSet(USER_ALARM_NAME, await wanikaniUserUpdateIntervalStorage.get());
}
checkAllAlarmsSet();

// Update the subjects when the extension is installed or on a schedule
chrome.alarms.onAlarm.addListener(async alarm => {
  switch (alarm.name) {
    case ASSIGNMENT_ALARM_NAME:
      await updateAllWaniKaniAssignments();
      break;
    case VOCAB_ALARM_NAME:
      await updateAllWaniKaniSubjects();
      break;
    case USER_ALARM_NAME:
      await updateWaniKaniUser();
      break;
    default:
      console.error('Unknown alarm:', alarm.name);
  }
  await updateVocabToReplace();
});
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    await updateWaniKaniUser();
    await updateAllWaniKaniSubjects();
    await updateAllWaniKaniAssignments();
    await updateVocabToReplace();
  }
});

// If the SRS range changes, update the vocab to replace
wanikaniSrsRangeStorage.subscribe(updateVocabToReplace);
// If the subject type selection changes, update the vocab to replace
waniKaniSubjectTypeSelectionStorage.subscribe(updateVocabToReplace);

// If the API key changes, update all data
wanikaniApiKeyStorage.subscribe(async () => {
  await updateAllWaniKaniSubjects();
  await updateWaniKaniUser();
  await updateAllWaniKaniAssignments();
  await updateVocabToReplace();
});

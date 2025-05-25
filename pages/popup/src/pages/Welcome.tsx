import { useState } from 'react';
import { welcomeCompletedStorage, wanikaniApiKeyStorage, useStorage } from '@extension/storage';
import APIKeyInput from '@src/components/ApiKeyInput';

const Welcome = () => {
  const [isCompleting, setIsCompleting] = useState(false);
  const apiKey = useStorage(wanikaniApiKeyStorage);

  const handleGetStarted = async () => {
    setIsCompleting(true);
    await welcomeCompletedStorage.set(true);
    setIsCompleting(false);
  };

  const canProceed = apiKey && apiKey.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br">
      <div className="flex-1 flex flex-col justify-start items-center text-center space-y-2">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h1 className="mx-6 mt-4 text-3xl font-bold text-gray-800">Welcome to Vocabify!</h1>
        </div>

        {/* API Key Section */}
        <div className="w-full">
          <APIKeyInput />
        </div>

        {/* Privacy Statement */}
        <div className="bg-green-50 rounded-2xl p-1 m-2 max-w-md">
          <h3 className="font-semibold text-green-800 text-sm mb-2">🔒 Your Privacy Matters</h3>
          <p className="text-sm text-green-700">
            We don't collect any personal information. Vocabify only communicates directly with WaniKani's servers to
            fetch your study materials. It also uses your browsers storage to save your preferences and settings.
            <br />
            Note that depending on your browser, some settings may be synced across devices.
          </p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          disabled={!canProceed || isCompleting}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors text-xs ${
            canProceed && !isCompleting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          {isCompleting ? 'Setting up...' : 'Get Started'}
        </button>

        {!canProceed && <p className="text-sm text-gray-500">Please enter your WaniKani API key to continue</p>}
      </div>
    </div>
  );
};

export default Welcome;

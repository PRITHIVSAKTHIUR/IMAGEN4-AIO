/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// FIX: Import `PersonGeneration` and `SafetyFilterLevel` enums from `@google/genai` to fix type errors.
import {
  GoogleGenAI,
  PersonGeneration,
  SafetyFilterLevel,
} from '@google/genai';
import JSZip from 'jszip';
import {
  Archive,
  Download,
  ImageIcon,
  LoaderCircle,
  SendHorizontal,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {useState} from 'react';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

function parseError(error: string): React.ReactNode {
  if (error.includes('429') && error.includes('RESOURCE_EXHAUSTED')) {
    return (
      <>
        You've exceeded your current API quota (Rate Limit). This is a usage
        limit on Google's servers.
        <br />
        <br />
        Please check your plan and billing details, or try again after some
        time. For more information, visit the{' '}
        <a
          href="https://ai.google.dev/gemini-api/docs/rate-limits"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Gemini API rate limits documentation
        </a>
        .
      </>
    );
  }
  const regex = /"message":\s*"(.*?)"/g;
  const match = regex.exec(error);
  if (match && match[1]) {
    return match[1];
  }
  return error;
}


export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>('');
  const [numberOfImages, setNumberOfImages] = useState(2);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showSettings, setShowSettings] = useState(false);

  // New state for advanced settings
  const [model, setModel] = useState('imagen-4.0-fast-generate-001');
  // FIX: Use the PersonGeneration enum for the personGeneration state to fix type errors.
  const [personGeneration, setPersonGeneration] = useState<PersonGeneration>(
    PersonGeneration.ALLOW_ALL,
  );

  const handleClear = () => {
    setGeneratedImages([]);
    setPrompt('');
    setNumberOfImages(2);
    setAspectRatio('1:1');
    setModel('imagen-4.0-fast-generate-001');
    // FIX: Use enum members to set state, resolving type errors.
    setPersonGeneration(PersonGeneration.ALLOW_ALL);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) {
      setErrorMessage('Please enter a prompt to generate an image.');
      setShowErrorModal(true);
      return;
    }
    setIsLoading(true);
    setGeneratedImages([]); // Clear previous results

    try {
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: Number(numberOfImages),
          aspectRatio,
          personGeneration,
        },
      });

      const imageUrls = response.generatedImages.map(
        (img) => `data:image/png;base64,${img.image.imageBytes}`,
      );
      setGeneratedImages(imageUrls);
    } catch (error) {
      console.error('Error generating images:', error);
      const rawMessage = (error as Error).message || 'An unexpected error occurred.';
      setErrorMessage(parseError(rawMessage));
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (src: string, index: number) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `imagen4-studio-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < generatedImages.length; i++) {
        const src = generatedImages[i];
        const base64Data = src.split(',')[1];
        zip.file(`imagen4-studio-${i + 1}.png`, base64Data, {base64: true});
      }

      const content = await zip.generateAsync({type: 'blob'});

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'imagen4-studio-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating zip file:', error);
      setErrorMessage('Failed to create the zip file.');
      setShowErrorModal(true);
    } finally {
      setIsZipping(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const models = [
    {id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4 Fast'},
    {id: 'imagen-4.0-generate-001', name: 'Imagen 4'},
    {id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4 Ultra'},
  ];

  // FIX: Use enum members for option IDs to ensure type safety.
  const personGenerationOptions = [
    {id: PersonGeneration.ALLOW_ALL, name: 'Allow All'},
    {id: PersonGeneration.ALLOW_ADULT, name: 'Allow Adults'},
    {id: PersonGeneration.DONT_ALLOW, name: "Don't Allow"},
  ];

  const aspectRatios = ['1:1', '16:9', '4:3', '3:4', '9:16'];

  const SettingButton = ({onClick, current, value, children}) => (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
        current === value
          ? 'bg-black text-white'
          : 'bg-gray-200 hover:bg-gray-300'
      }`}>
      {children}
    </button>
  );

  return (
    <>
      <div className="min-h-screen text-gray-900 flex flex-col justify-start items-center">
        <main className="container mx-auto px-3 sm:px-6 py-5 sm:py-10 pb-32 max-w-5xl w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-0 leading-tight">
                IMAGEN4 AIO
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Powered by the{' '}
                <a
                  className="underline"
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer">
                  Google Gemini API
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 ${
                  showSettings ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
                }`}
                aria-label="Toggle Settings">
                <SlidersHorizontal className="w-6 h-6 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isLoading || isZipping || generatedImages.length === 0}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-200"
                aria-label="Download all images as a zip">
                {isZipping ? (
                  <LoaderCircle className="w-6 h-6 animate-spin text-gray-700" />
                ) : (
                  <Archive className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Clear Results">
                <Trash2 className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          <div
            className={`w-full mb-6 h-[60vh] bg-gray-200/50 rounded-lg flex justify-center p-4 border-2 border-dashed border-gray-300 overflow-y-auto ${
              generatedImages.length > 0 ? 'items-start' : 'items-center'
            }`}>
            {isLoading ? (
              <div className="text-center text-gray-600 self-center">
                <LoaderCircle className="w-12 h-12 animate-spin mx-auto" />
                <p className="mt-4 font-semibold">Generating images...</p>
                <p className="text-sm text-gray-500">This may take a moment</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div
                className={`grid gap-4 w-full ${
                  generatedImages.length > 1
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1'
                }`}>
                {generatedImages.map((src, index) => (
                  <div
                    key={index}
                    className="relative group flex items-center justify-center bg-black/5 rounded-md overflow-hidden">
                    <img
                      src={src}
                      alt={`Generated image ${index + 1}`}
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                    <button
                      onClick={() => handleDownload(src, index)}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Download image">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto" />
                <h3 className="font-semibold text-lg mt-4">
                  Your generated images will appear here
                </h3>
                <p>Enter a prompt below to get started</p>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="w-full p-3 sm:p-4 pr-12 sm:pr-14 text-sm sm:text-base border-2 border-black bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all h-14"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-none bg-black text-white hover:cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Submit">
                {isLoading ? (
                  <LoaderCircle
                    className="w-5 sm:w-6 h-5 sm:h-6 animate-spin"
                    aria-label="Loading"
                  />
                ) : (
                  <SendHorizontal className="w-5 sm:w-6 h-5 sm:h-6" />
                )}
              </button>
            </div>
          </form>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
            onClick={() => setShowSettings(false)}>
            <div
              className="bg-white rounded-lg shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close settings">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {models.map((m) => (
                      <SettingButton
                        key={m.id}
                        onClick={setModel}
                        current={model}
                        value={m.id}>
                        {m.name}
                      </SettingButton>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Person Generation
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {personGenerationOptions.map((opt) => (
                      <SettingButton
                        key={opt.id}
                        onClick={setPersonGeneration}
                        current={personGeneration}
                        value={opt.id}>
                        {opt.name}
                      </SettingButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="num-images"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Images
                  </label>
                  <input
                    type="number"
                    id="num-images"
                    min="1"
                    max="4"
                    value={numberOfImages}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(4, Number(e.target.value)),
                      );
                      setNumberOfImages(val);
                    }}
                    className="w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => (
                      <SettingButton
                        key={ratio}
                        onClick={setAspectRatio}
                        current={aspectRatio}
                        value={ratio}>
                        {ratio}
                      </SettingButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  Generation Failed
                </h3>
                <button
                  onClick={closeErrorModal}
                  className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="font-medium text-gray-600">
                {errorMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

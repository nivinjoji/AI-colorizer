
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { colorizeImage } from './services/geminiService';
import { UploadIcon, WandIcon, Spinner, PhotoIcon } from './components/icons';

const App: React.FC = () => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [coloredImage, setColoredImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Cleanup the object URL to avoid memory leaks
        return () => {
            if (originalImagePreview) {
                URL.revokeObjectURL(originalImagePreview);
            }
        };
    }, [originalImagePreview]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setOriginalImageFile(file);
            setColoredImage(null);
            setError(null);
            if (originalImagePreview) {
                URL.revokeObjectURL(originalImagePreview);
            }
            setOriginalImagePreview(URL.createObjectURL(file));
        }
    };

    const handleColorize = useCallback(async () => {
        if (!originalImageFile) {
            setError("Please upload an image first.");
            return;
        }
        if (!prompt.trim()) {
            setError("Please provide a coloring prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setColoredImage(null);

        try {
            const result = await colorizeImage(originalImageFile, prompt);
            setColoredImage(result);
        } catch (err: any) {
            setError(err.toString() || "Failed to colorize image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImageFile, prompt]);

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
            <header className="py-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 flex items-center justify-center">
                    <WandIcon className="w-8 h-8 mr-3 text-fuchsia-500" />
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
                        AI Image Colorizer
                    </h1>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    {/* Control Panel */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col space-y-6 shadow-2xl shadow-fuchsia-900/10">
                        <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-600 pb-3">Controls</h2>
                        
                        <div className="flex-grow flex flex-col">
                            <label className="text-lg font-medium mb-2">1. Upload Outline Image</label>
                            <div 
                                className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-fuchsia-500 hover:bg-gray-800 transition-all duration-300 h-64 flex flex-col justify-center items-center"
                                onClick={triggerFileSelect}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                />
                                {originalImagePreview ? (
                                    <img src={originalImagePreview} alt="Original outline" className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <div className="text-gray-400">
                                        <UploadIcon className="w-12 h-12 mx-auto mb-2" />
                                        <p>Click to upload or drag & drop</p>
                                        <p className="text-sm">PNG, JPG, WEBP</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="prompt" className="text-lg font-medium mb-2 block">2. Describe Colors</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A red car with a blue background, sunset lighting..."
                                rows={4}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleColorize}
                            disabled={isLoading || !originalImageFile}
                            className="w-full flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner className="w-5 h-5 mr-3" />
                                    Colorizing...
                                </>
                            ) : (
                                <>
                                    <WandIcon className="w-5 h-5 mr-3" />
                                    Colorize Image
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Panel */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center shadow-2xl shadow-cyan-900/10 min-h-[400px]">
                        <h2 className="text-2xl font-semibold text-gray-100 border-b border-gray-600 pb-3 w-full text-left mb-4">Result</h2>
                        <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-lg">
                            {isLoading && (
                                <div className="text-center text-gray-400">
                                    <Spinner className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-lg">AI is painting, please wait...</p>
                                    <p className="text-sm">This can take a moment.</p>
                                </div>
                            )}
                            {error && (
                                <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                                    <p className="font-semibold">An Error Occurred</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && coloredImage && (
                                <img src={coloredImage} alt="AI colored result" className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                            )}
                            {!isLoading && !error && !coloredImage && (
                                <div className="text-center text-gray-500">
                                    <PhotoIcon className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-lg">Your colored image will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 border-t border-gray-700 mt-8">
                <p className="text-gray-500 text-sm">Powered by Gemini API</p>
            </footer>
        </div>
    );
};

export default App;

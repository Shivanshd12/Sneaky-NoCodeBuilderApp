import React, { useCallback, useState } from 'react';
import { Upload, FileWarning, Figma, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFigmaGuide, setShowFigmaGuide] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndProcess = (file: File) => {
    setError(null);
    setShowFigmaGuide(false);
    
    if (file.name.endsWith('.fig')) {
      setShowFigmaGuide(true);
      return;
    }

    if (!file.type.startsWith('image/')) {
        setError("Please upload an image file (PNG, JPG, WebP).");
        return;
    }

    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  if (showFigmaGuide) {
      return (
        <div className="w-full max-w-xl mx-auto mt-20 p-6">
            <div className="relative rounded-3xl border-2 border-zinc-700 bg-zinc-900/80 flex flex-col items-center text-center p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                <div className="w-16 h-16 bg-[#F24E1E]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#F24E1E]/20 shadow-[0_0_15px_rgba(242,78,30,0.2)]">
                    <Figma className="w-8 h-8 text-[#F24E1E]" /> 
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">Figma File Detected</h3>
                <p className="text-zinc-400 text-sm mb-8 max-w-md leading-relaxed">
                    To edit this design, we need to "see" it first. <br/>
                    Please export your frame as an image (PNG/JPG).
                </p>

                <div className="w-full max-w-sm bg-zinc-950/50 rounded-xl border border-zinc-800 p-5 text-left space-y-4 mb-8">
                    <div className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 border border-zinc-700 shrink-0">1</div>
                         <div className="text-sm text-zinc-300">Open <strong>{`File > Export...`}</strong> in Figma</div>
                    </div>
                    <div className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 border border-zinc-700 shrink-0">2</div>
                         <div className="text-sm text-zinc-300">Select <strong>PNG</strong> or <strong>JPG</strong> (2x is best)</div>
                    </div>
                    <div className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 border border-zinc-700 shrink-0">3</div>
                         <div className="text-sm text-zinc-300">Upload the exported image here</div>
                    </div>
                </div>

                <div className="flex gap-3 w-full max-w-sm">
                     <button 
                        onClick={() => setShowFigmaGuide(false)}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button 
                        onClick={() => {
                            setShowFigmaGuide(false);
                            setTimeout(() => document.getElementById('file-input')?.click(), 100);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                </div>
                
                <p className="mt-6 text-xs text-zinc-500 max-w-xs mx-auto">
                    <strong>Tip:</strong> Once you upload the image, you can make unlimited changes to the generated code using the AI chat!
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-20 p-6">
      <div 
        className={cn(
          "relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-12 text-center cursor-pointer",
          dragActive ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input 
          id="file-input"
          type="file" 
          className="hidden" 
          accept=".png,.jpg,.jpeg,.webp,.fig"
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-black/20">
            {error ? <FileWarning className="w-8 h-8 text-red-400" /> : <Upload className="w-8 h-8 text-blue-400" />}
        </div>

        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
          {isProcessing ? "Analyzing Design..." : "Upload Design to Edit"}
        </h3>
        
        <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-6">
          Drag & drop a screenshot (PNG, JPG) <br/> or <span className="text-zinc-500">.fig (to see guide)</span>
        </p>
        
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2 text-left animate-in fade-in slide-in-from-bottom-2">
            <FileWarning className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!error && (
             <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono mt-2">
                <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> PNG/JPG</span>
                <span className="flex items-center gap-1"><Figma className="w-3 h-3" /> .fig (Export)</span>
             </div>
        )}
      </div>
    </div>
  );
};
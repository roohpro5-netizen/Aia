import React, { useState } from 'react';
import { Upload, Wand2, Sparkles, Copy, Check, ScanEye, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { AnalysisData } from '../types';
import { analyzeImageWithAI } from '../services/aiService';
import { storage } from '../services/storage';
import { AspectRatioSelectorBar } from './AspectRatioSelectorBar';
import { useQuotaManager } from '../hooks/useQuotaManager';
import { QuotaDisplayBanner } from './QuotaDisplayBanner';

interface ImageVisionAnalyzerProps {
  onPromptGenerated?: (prompt: string) => void;
}

export const ImageVisionAnalyzer: React.FC<ImageVisionAnalyzerProps> = ({ onPromptGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [userCustomNote, setUserCustomNote] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Quota Manager Hook (Phase 5: 5 attempts / 24h)
  const {
    maxQuota,
    remainingQuota,
    isExhausted,
    useAttempt,
    handleExternalGemini
  } = useQuotaManager();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    // Check quota before triggering AI generation
    if (isExhausted) {
      handleExternalGemini(userCustomNote || 'Reverse engineer this visual');
      return;
    }

    const quotaAllowed = useAttempt();
    if (!quotaAllowed) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const data = await analyzeImageWithAI(selectedImage, userCustomNote);
      setAnalysisResult(data);
      if (onPromptGenerated) {
        onPromptGenerated(data.extractedPrompt);
      }
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      {/* Top tri-color border stripe */}
      <div className="absolute top-0 left-0 right-0 tricolor-bar">
        <span />
        <span />
        <span />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-800 border-2 border-yellow-400">
            <ScanEye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              محلل الصور المربعة الذكي وهندسة البرومبت العكسي (AI Vision)
            </h3>
            <p className="text-xs text-slate-500">
              ارفع أي صورة لاستخراج البرومبت الهندسي المربع، أسلوب الإضاءة، الكاميرا والألوان فوراً
            </p>
          </div>
        </div>
        <span className="rounded-md bg-red-50 text-red-700 font-bold border border-red-300 px-2.5 py-1 text-xs">
          تحليل مربع 1:1
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Dropzone with STRICT SQUARE DIMENSION */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative flex w-full max-w-[340px] mx-auto aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
              selectedImage
                ? 'border-blue-500 bg-slate-50'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-slate-100'
            }`}
          >
            {selectedImage ? (
              <div className="relative h-full w-full p-2 flex flex-col items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Uploaded target"
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-lg object-cover shadow-2xs"
                />
                <label className="absolute bottom-4 flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-yellow-400 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-yellow-50 transition-colors shadow-md backdrop-blur-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>تغيير الصورة</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  انقر لاختيار صورة مربعة أو اسحبها هنا
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  يدعم JPG و PNG و WebP بنمط متناسق 1:1
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Quota Counter Display */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-700">الحصة اليومية للتوليد والتحليل:</span>
            <span
              className={`font-mono font-black px-2.5 py-0.5 rounded-full border text-[11px] ${
                isExhausted
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {remainingQuota} / {maxQuota} محاولات متبقية (24h)
            </span>
          </div>

          {isExhausted ? (
            <button
              type="button"
              onClick={() => handleExternalGemini(userCustomNote || '8k photorealistic square image')}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black shadow-md transition-all active:scale-[0.98] border-2 border-amber-400 bg-amber-500 hover:bg-amber-400 text-slate-950"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نسخ البرومبت للتوليد الخارجي عبر Gemini</span>
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-xs transition-all active:scale-[0.98] border-2 ${
                !selectedImage || isAnalyzing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-yellow-400'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>جاري تحليل الصورة واستخراج البرومبت...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-yellow-300" />
                  <span>تحليل الصورة واستخراج البرومبت ({remainingQuota} متبقية)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Analysis Results Display */}
        <div className="lg:col-span-7">
          {analysisResult ? (
            <div className="space-y-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">نتائج الفحص والتحليل البصري</span>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  دقة التحليل {analysisResult.confidenceScore}%
                </span>
              </div>

              {/* Extracted Prompt Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-400">
                    البرومبت المعكوس المستخرج (Prompt):
                  </span>
                  <button
                    onClick={() => handleCopy(analysisResult.extractedPrompt)}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs border border-yellow-400"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>{copiedPrompt ? 'تم النسخ!' : 'نسخ البرومبت'}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-emerald-400 leading-relaxed select-all">
                  {analysisResult.extractedPrompt}
                </p>
              </div>

              {/* Aspect Ratio Selector Bar under extracted prompt */}
              <AspectRatioSelectorBar
                currentPrompt={analysisResult.extractedPrompt}
                onApplyRatio={(updatedPrompt) => {
                  setAnalysisResult((prev) => prev ? ({ ...prev, extractedPrompt: updatedPrompt }) : null);
                  if (onPromptGenerated) onPromptGenerated(updatedPrompt);
                }}
              />

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <span className="font-bold text-slate-900 block mb-1">الإضاءة والظلال:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{analysisResult.lighting}</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <span className="font-bold text-slate-900 block mb-1">العدسة والكاميرا المقترحة:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{analysisResult.cameraLens || '85mm f/1.4 Lens'}</p>
                </div>
              </div>

              {/* Style Tags & Palette */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {analysisResult.styleKeywords.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Color Palette */}
              {analysisResult.colorPalette && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold">لوحة الألوان المستخرجة:</span>
                  <div className="flex items-center gap-1.5">
                    {analysisResult.colorPalette.map((color, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                اختر صورة مربعة واضغط على زر التحليل لمشاهدة تفكيك الإضاءة والبرومبت المستخرج هنا
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

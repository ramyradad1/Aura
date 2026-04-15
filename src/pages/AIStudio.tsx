import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Video, Image as ImageIcon, Map, Search, Key } from 'lucide-react';
import { generatePerfumeAdVideo, generatePerfumeBottleImage, findNearestStore, searchPerfumeTrends } from '../utils/geminiUtils';
import SEOHead from '../components/SEOHead';

export default function AIStudio() {
  const { isSuperAdmin, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'map' | 'search'>('video');
  const [hasApiKey, setHasApiKey] = useState(true);
  
  useEffect(() => {
    if (isAuthReady && !isSuperAdmin) {
      navigate('/');
    }
  }, [isSuperAdmin, isAuthReady, navigate]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof (window as any).aistudio !== 'undefined') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, [activeTab]);

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio !== 'undefined') {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Map State
  const [mapLocation, setMapLocation] = useState('');
  const [mapResult, setMapResult] = useState<{text: string, places: string[]} | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{text: string, links: string[]} | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [error, setError] = useState('');

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setVideoLoading(true);
    setError('');
    try {
      const url = await generatePerfumeAdVideo(videoPrompt);
      setVideoUrl(url || '');
    } catch (error) {
      setError('فشل إنشاء الفيديو. يرجى المحاولة لاحقاً.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setImageLoading(true);
    setError('');
    try {
      const url = await generatePerfumeBottleImage(imagePrompt, imageSize);
      setImageUrl(url || '');
    } catch (error) {
      setError('فشل إنشاء الصورة. يرجى المحاولة لاحقاً.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleFindStore = async () => {
    if (!mapLocation) return;
    setMapLoading(true);
    setError('');
    try {
      const res = await findNearestStore(mapLocation);
      if (res) {
        setMapResult({
          text: res.text || '',
          places: res.places?.filter(Boolean) as string[] || []
        });
      }
    } catch (error) {
      setError('فشل البحث عن المتاجر. يرجى المحاولة لاحقاً.');
    } finally {
      setMapLoading(false);
    }
  };

  const handleSearchTrends = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    setError('');
    try {
      const res = await searchPerfumeTrends(searchQuery);
      if (res) {
        setSearchResult({
          text: res.text || '',
          links: res.links?.filter(Boolean) as string[] || []
        });
      }
    } catch (error) {
      setError('فشل البحث عن التوجهات. يرجى المحاولة لاحقاً.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <SEOHead
        title="ستوديو الذكاء الاصطناعي"
        description="استخدم أدوات Aura Perfumes المدعومة بالذكاء الاصطناعي Gemini — صمم زجاجة عطرك، أنشئ فيديو إعلاني، ابحث عن أقرب متجر، واكتشف توجهات العطور العالمية."
        keywords="ذكاء اصطناعي, عطور, تصميم زجاجة عطر, Gemini AI, Aura Perfumes AI Studio"
        ogUrl="/ai-studio"
      />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">ستوديو Aura للذكاء الاصطناعي</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            استكشف أدواتنا المتقدمة المدعومة بنماذج Gemini لإنشاء محتوى إبداعي والبحث عن كل ما يخص العطور.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'video', icon: Video, label: 'إعلان فيديو (Veo 3)' },
            { id: 'image', icon: ImageIcon, label: 'تصميم زجاجة (Nano Banana)' },
            { id: 'map', icon: Map, label: 'أقرب متجر (Maps)' },
            { id: 'search', icon: Search, label: 'توجهات العطور (Search)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 min-h-[500px]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
              {error}
            </div>
          )}
          {/* API Key Requirement for Video and Image */}
          {!hasApiKey && (activeTab === 'video' || activeTab === 'image') ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12">
              <Key className="h-16 w-16 text-indigo-400" />
              <h2 className="text-2xl font-serif font-bold text-gray-900">مطلوب مفتاح API</h2>
              <p className="text-gray-600 max-w-md">
                لاستخدام نماذج توليد الصور والفيديو المتقدمة، يرجى اختيار مفتاح API الخاص بك من مشروع Google Cloud مدفوع.
              </p>
              <button
                onClick={handleSelectKey}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                اختيار مفتاح API
              </button>
            </div>
          ) : (
            <>
              {/* Video Tab */}
              {activeTab === 'video' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">إنشاء إعلان فيديو سينمائي</h2>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="صف الإعلان الذي تريده (مثال: زجاجة عطر فاخرة وسط غابة ضبابية مع إضاءة سينمائية...)"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              />
              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading || !videoPrompt}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {videoLoading ? 'جاري الإنشاء (قد يستغرق بضع دقائق)...' : 'إنشاء الفيديو'}
                <Sparkles className="h-4 w-4" />
              </button>
              
              {videoUrl && (
                <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-black">
                  <video src={videoUrl} controls className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">تصميم زجاجة عطر مخصصة</h2>
              <div className="flex gap-4 mb-4">
                {['1K', '2K', '4K'].map(size => (
                  <button
                    key={size}
                    onClick={() => setImageSize(size as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                      imageSize === size ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    دقة {size}
                  </button>
                ))}
              </div>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="صف شكل الزجاجة (مثال: زجاجة عطر كريستالية زرقاء بتصميم هندسي حديث...)"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              />
              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !imagePrompt}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {imageLoading ? 'جاري التصميم...' : 'تصميم الزجاجة'}
                <Sparkles className="h-4 w-4" />
              </button>
              
              {imageUrl && (
                <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 aspect-square max-w-md mx-auto bg-gray-50">
                  <img src={imageUrl} alt="Generated Perfume" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">البحث عن أقرب متجر عطور</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={mapLocation}
                  onChange={(e) => setMapLocation(e.target.value)}
                  placeholder="أدخل مدينتك أو منطقتك (مثال: الرياض، دبي...)"
                  className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleFindStore}
                  disabled={mapLoading || !mapLocation}
                  className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {mapLoading ? 'جاري البحث...' : 'بحث'}
                  <Map className="h-4 w-4" />
                </button>
              </div>
              
              {mapResult && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="prose prose-indigo max-w-none text-gray-800 whitespace-pre-wrap">
                    {mapResult.text}
                  </div>
                  {mapResult.places.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-900 mb-2">روابط المتاجر:</h4>
                      <ul className="space-y-2">
                        {mapResult.places.map((link, idx) => (
                          <li key={idx}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">البحث عن توجهات العطور العالمية</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن توجهات (مثال: أفضل العطور الصيفية 2026...)"
                  className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleSearchTrends}
                  disabled={searchLoading || !searchQuery}
                  className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {searchLoading ? 'جاري البحث...' : 'بحث'}
                  <Search className="h-4 w-4" />
                </button>
              </div>
              
              {searchResult && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="prose prose-indigo max-w-none text-gray-800 whitespace-pre-wrap">
                    {searchResult.text}
                  </div>
                  {searchResult.links.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-900 mb-2">المصادر:</h4>
                      <ul className="space-y-2">
                        {searchResult.links.map((link, idx) => (
                          <li key={idx}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

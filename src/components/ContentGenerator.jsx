import { useState } from 'react';
import { FileText, Sparkles, Copy, Download } from 'lucide-react';
import geminiService from '../services/geminiService';

const ContentGenerator = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const content = await geminiService.generateSEOContent(topic, keywordList);
      setGeneratedContent(content);
    } catch (err) {
      setError(err.message);
      console.error('Content generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    const content = `
# ${generatedContent.title}

**Meta Description:** ${generatedContent.metaDescription}

**Target Keywords:** ${generatedContent.targetKeywords?.join(', ') || 'N/A'}

**Estimated Read Time:** ${generatedContent.estimatedReadTime || 'N/A'}

**Word Count:** ${generatedContent.wordCount || 'N/A'}

---

${generatedContent.content}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-content.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Content Generator</h2>
            <p className="text-gray-600">Generate SEO-optimized content with Google Gemini AI</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Best AI Tools for Content Marketing'"
                className="input-field"
                disabled={isGenerating}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., 'ai tools, content marketing, automation'"
                className="input-field"
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate SEO Content
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              ⚠️ {error}
            </p>
          </div>
        )}
      </div>

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="space-y-4">
          {/* Content Metadata */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Generated Content</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedContent.content)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={downloadContent}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Word Count</p>
                <p className="font-semibold text-gray-900">{generatedContent.wordCount || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Read Time</p>
                <p className="font-semibold text-gray-900">{generatedContent.estimatedReadTime || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Keywords</p>
                <p className="font-semibold text-gray-900">{generatedContent.targetKeywords?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">✅ Generated</p>
              </div>
            </div>

            {/* Title and Meta Description */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (H1)</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900">{generatedContent.title}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900">{generatedContent.metaDescription}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {generatedContent.metaDescription?.length || 0} characters
                  </p>
                </div>
              </div>

              {generatedContent.targetKeywords && generatedContent.targetKeywords.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.targetKeywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Content</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedContent.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator; 
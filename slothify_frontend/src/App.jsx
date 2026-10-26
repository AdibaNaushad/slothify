import React, { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedAction, setSelectedAction] = useState('summarize');
  
  // State for backend connection
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const actions = [
    { id: 'summarize', icon: '✨', label: 'Summarize', desc: 'Condense long text', activeColor: 'border-[#A8C3A0] bg-[#F4F8F4]', iconColor: 'text-[#A8C3A0]' },
    { id: 'keypoints', icon: '📍', label: 'Key Points', desc: 'Extract essential info', activeColor: 'border-[#F5DDE4] bg-[#FDF7F9]', iconColor: 'text-[#F5DDE4]' },
    { id: 'checklist', icon: '✅', label: 'Make a Checklist', desc: 'Convert to tasks', activeColor: 'border-[#F7E7A6] bg-[#FEFDF2]', iconColor: 'text-[#F7E7A6]' },
    { id: 'simplify', icon: '💡', label: 'Simplify', desc: 'Explain simply', activeColor: 'border-[#C5A3D1] bg-[#F8F4F9]', iconColor: 'text-[#C5A3D1]' },
  ];

  // Function to call your FastAPI backend
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await fetch('http://localhost:8000/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, action: selectedAction }),
      });
      
      if (!response.ok) throw new Error('Failed to process text');
      
      const data = await response.json();
      setResult(data.result);
      
    } catch (error) {
      console.error(error);
      setResult("Oops! Something went wrong. Make sure Ollama and your FastAPI backend are running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#493F38] font-sans selection:bg-[#F7E7A6]">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between py-6 px-8 md:px-16 bg-[#FFF8F0] border-b border-[#EDE4D9]">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🦥</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#493F38]">Slothify</h1>
          <div className="h-6 w-px bg-[#EDE4D9] mx-2 hidden md:block"></div>
          <span className="text-[#8C8178] text-sm font-medium hidden md:block">You relax. AI handles the boring bits.</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-[#493F38] leading-tight">
              Too much text?<br/>
              <span className="text-[#A8C3A0]">Let's make it easy.</span>
            </h1>
            <p className="text-lg text-[#8C8178] mb-8 font-medium">
              Paste it, pick a task, and let your little AI helper<br className="hidden md:block"/> handle the boring bits.
            </p>
          </div>
          
          {/* Sloth Hero Image Placeholder */}
          <div className="hidden md:flex flex-col items-center justify-center w-80 h-64 bg-[#F2F6F1] rounded-[3rem] relative mt-10 md:mt-0 transform rotate-2">
            <span className="text-8xl">🦥</span>
            <span className="absolute -right-8 top-10 text-[#A8C3A0] font-bold text-sm transform rotate-12 bg-white px-3 py-2 rounded-xl shadow-sm">
              Small tasks.<br/>Big time back.
            </span>
          </div>
        </div>

        {/* Main Workspace Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#EDE4D9] p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Input Area */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-[#493F38] mb-4 flex items-center gap-2">
              <span className="text-[#A8C3A0] text-2xl">🍃</span> Drop the boring stuff here
            </h2>
            
            <div className="relative mb-6 flex-grow">
              <textarea
                className="w-full h-full min-h-[160px] p-5 rounded-2xl border-2 border-[#EDE4D9] bg-white text-[#493F38] focus:outline-none focus:border-[#A8C3A0] resize-none placeholder-[#B0A69D] font-medium"
                placeholder="Paste your email, article, study notes, or anything you'd rather not read twice..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {actions.map((action) => {
                const isActive = selectedAction === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                      isActive ? action.activeColor : 'border-[#EDE4D9] bg-white hover:border-[#A8C3A0]/40'
                    }`}
                  >
                    <div className="text-xl mt-0.5 drop-shadow-sm">{action.icon}</div>
                    <div>
                      <div className={`font-bold text-sm ${isActive ? 'text-[#A8C3A0]' : 'text-[#493F38]'}`}>
                        {action.label}
                      </div>
                      <div className="text-xs text-[#8C8178] mt-0.5 font-medium">{action.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-[#A8C3A0] hover:bg-[#96b38e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              {isLoading ? '🦥 Waking up AI...' : '✨ Make It Easy'}
            </button>
          </div>
          
          {/* Right Column: Dynamic Output Area */}
          <div className="flex-1 bg-[#F5F8F4] rounded-[2rem] border border-[#E1EBE0] flex flex-col p-8 min-h-[400px]">
            {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4 animate-bounce">🦥</div>
                  <h3 className="font-extrabold text-xl text-[#493F38]">Processing your text...</h3>
               </div>
            ) : result ? (
               <div className="flex-1 flex flex-col">
                  <h3 className="font-extrabold text-xl text-[#493F38] mb-4 flex items-center gap-2">
                    <span className="text-[#A8C3A0]">✨</span> All Done!
                  </h3>
                  <div className="text-[#493F38] whitespace-pre-wrap font-medium overflow-y-auto max-h-[300px]">
                    {result}
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="text-7xl">🦥</div>
                    <div className="absolute -top-6 -right-6 text-[#A8C3A0] font-bold text-xl tracking-widest transform -rotate-12 animate-pulse">Z Z Z</div>
                  </div>
                  <h3 className="font-extrabold text-2xl text-[#493F38] mb-3">Your result will nap here.</h3>
                  <p className="text-[#8C8178] max-w-xs font-medium leading-relaxed">
                    Add some text, choose a task, and let me handle the boring bits.
                  </p>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
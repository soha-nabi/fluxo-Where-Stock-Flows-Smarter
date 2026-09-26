"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Square,
  Bot,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  Activity,
} from "lucide-react";
import { useDashboardStore, useStore } from "@/store";

const ELEVENLABS_API_KEY =
  process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
  "sk_5d185112fceaa22f0e983f6416b32e3358dd98b416711441";

const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", role: "Executive Ops" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", role: "Logistics Lead" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", role: "Inventory Specialist" },
];

const QUICK_COMMANDS = [
  "Show stock velocity for Austin Node",
  "Check low stock alerts & reorder levels",
  "Summarize daily dispatch receipts",
  "Transfer 120 Inverters to Dallas",
];

export function ElevenLabsVoiceAgentFloatingWidget() {
  const { kpis, lowStockItems } = useDashboardStore();
  const { selectedWarehouse } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [transcript, setTranscript] = useState("“Ask FLUXO AI about inventory, transfers, or stock velocity...”");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(`“${text}”`);
          if (event.results[current].isFinal) {
            handleProcessCommand(text);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Synthesize Voice via ElevenLabs API
  const speakWithElevenLabs = async (textToSpeak: string) => {
    try {
      setIsSpeaking(true);
      setLoadingAudio(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API returned status ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : 1;

      audio.onended = () => {
        setIsSpeaking(false);
        setLoadingAudio(false);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setLoadingAudio(false);
      };

      audioRef.current = audio;
      setLoadingAudio(false);
      await audio.play();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[ElevenLabs Voice Agent] TTS Fallback to Web Speech API:", err);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
      setLoadingAudio(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("Listening for command...");
      setAiResponse(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleProcessCommand = (query: string) => {
    setIsListening(false);
    const lower = query.toLowerCase();

    let reply = "";
    if (lower.includes("stock") || lower.includes("velocity") || lower.includes("austin")) {
      const healthy = kpis?.in_stock || 17;
      reply = `Austin Primary Node operating at 95.5% efficiency. We currently have ${healthy} healthy stock lines, with total valuation exceeding $${kpis?.total_stock_value || "2.68M"}.`;
    } else if (lower.includes("low") || lower.includes("reorder") || lower.includes("shortage")) {
      const count = lowStockItems?.length || 3;
      reply = `Attention: ${count} SKUs are below reorder threshold. Automated purchase orders generated for microcontrollers and copper wiring.`;
    } else if (lower.includes("transfer") || lower.includes("dallas")) {
      reply = `Internal transfer logged: 120 Inverters from Austin Hub to Dallas Center initialized as DRAFT awaiting supervisor approval.`;
    } else if (lower.includes("dispatch") || lower.includes("receipt") || lower.includes("summary")) {
      reply = `Today's operations stream summary: 23 inbound receipts validated, 14 outbound customer deliveries shipped, and 8 inter-hub transfers completed.`;
    } else {
      reply = `FLUXO Neural Engine processed "${query}". All system indicators remain optimal across ${selectedWarehouse?.name || "all network warehouses"}.`;
    }

    setAiResponse(reply);
    speakWithElevenLabs(reply);
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-auto flex flex-col items-end">
      {/* Expanded Modern Glassmorphic Widget Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 w-[380px] sm:w-[420px] bg-[#0d0f1b]/95 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 overflow-hidden relative"
          >
            {/* Ambient Purple Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Widget Card Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1d2038]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0f1b] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                    FLUXO Voice AI
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                      ElevenLabs
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                    <span>Voice Engine: Turbo v2.5</span>
                    <span className="text-emerald-400 font-bold">• 48kHz HD</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-xl transition-all border ${
                    showSettings
                      ? "bg-purple-950 text-purple-300 border-purple-700"
                      : "bg-[#181b30] hover:bg-[#252947] text-gray-400 hover:text-white border-[#2c3054]"
                  }`}
                  title="Voice settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-[#181b30] hover:bg-[#252947] text-gray-400 hover:text-white transition-colors border border-[#2c3054]"
                  title="Close widget"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Voice Settings Panel Dropdown */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-2xl bg-[#131629] border border-purple-900/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                  <span>Voice Model Persona:</span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 text-[10px] border border-purple-800/50"
                  >
                    {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                    <span>{isMuted ? "Muted" : "Audio On"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v)}
                      className={`text-[11px] p-2 rounded-xl border text-left transition-all ${
                        selectedVoice.id === v.id
                          ? "bg-purple-950/80 border-purple-500 text-purple-200 font-bold shadow-md shadow-purple-900/30"
                          : "bg-[#181b30] border-[#2c3054] text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <div className="truncate">{v.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{v.role}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Central Frequency Visualizer & Mic Controls */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#121528]/90 border border-[#232745] rounded-2xl mb-4 relative overflow-hidden">
              {/* Dynamic Audio Visualizer Waves */}
              <div className="flex items-center justify-center gap-1 h-9 mb-3 w-full">
                {[35, 80, 45, 95, 30, 85, 60, 100, 50, 75, 40, 90, 55, 70, 35].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isSpeaking
                        ? "bg-gradient-to-t from-purple-500 via-violet-400 to-emerald-400 animate-pulse"
                        : isListening
                        ? "bg-gradient-to-t from-cyan-400 to-purple-500 animate-bounce"
                        : "bg-purple-900/40"
                    }`}
                    style={{
                      height: isSpeaking || isListening ? `${Math.max(8, h * (isSpeaking ? 0.9 : 0.65))}px` : "6px",
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Central Trigger Mic Button */}
              <div className="relative flex items-center justify-center mb-3">
                {(isListening || isSpeaking) && (
                  <>
                    <span className="absolute w-16 h-16 rounded-full bg-purple-500/30 animate-ping" />
                    <span className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-pulse" />
                  </>
                )}

                <button
                  onClick={isSpeaking ? handleStopAudio : handleToggleListening}
                  disabled={loadingAudio}
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isSpeaking
                      ? "bg-gradient-to-tr from-amber-500 to-red-600 text-white shadow-amber-500/30 hover:scale-105"
                      : isListening
                      ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 scale-105"
                      : "bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white hover:shadow-purple-500/50 hover:scale-105"
                  }`}
                >
                  {loadingAudio ? (
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  ) : isSpeaking ? (
                    <Square className="w-6 h-6 fill-current" />
                  ) : isListening ? (
                    <Mic className="w-7 h-7 animate-bounce" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
              </div>

              <p className="text-[11px] font-medium text-gray-300 text-center px-2 line-clamp-2">
                {transcript}
              </p>

              {aiResponse && (
                <div className="mt-3 text-[11px] text-purple-200 bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 w-full text-left font-sans shadow-inner">
                  <span className="font-bold text-purple-400 mr-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 inline text-emerald-400" /> FLUXO AI:
                  </span>
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Quick Command Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <span>Suggested Commands</span>
                <span className="text-purple-400">Tap to speak</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(`“${cmd}”`);
                      handleProcessCommand(cmd);
                    }}
                    disabled={isSpeaking || loadingAudio}
                    className="text-[11px] px-3 py-2 rounded-xl bg-[#16192c] hover:bg-[#232747] text-purple-300 hover:text-white border border-[#2b2f52] transition-colors flex items-center justify-between text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">{cmd}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Bottom Floating Capsule Trigger Bar (SaaS Modern Widget) */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-[#0f111f]/90 backdrop-blur-2xl border border-purple-500/30 hover:border-purple-400/60 p-2 pr-4 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center gap-3 cursor-pointer group transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Left Glowing Mic Aura Button */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
            {isSpeaking ? (
              <Activity className="w-5 h-5 text-emerald-300 animate-pulse" />
            ) : isListening ? (
              <Mic className="w-5 h-5 animate-bounce" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f111f] animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">Need help?</span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
              ElevenLabs AI
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-purple-400" />
            <span>Talk to FLUXO AI</span>
          </p>
        </div>

        {/* Call Trigger Pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
            handleToggleListening();
          }}
          className="ml-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start call</span>
        </button>
      </motion.div>
    </div>
  );
}

// Card version for embedding directly into grid layouts
export function ElevenLabsVoiceAgentCard() {
  return <ElevenLabsVoiceAgentFloatingWidget />;
}

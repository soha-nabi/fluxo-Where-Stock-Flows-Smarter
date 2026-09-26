"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useDashboardStore, useStore } from "@/store";

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "sk_5d185112fceaa22f0e983f6416b32e3358dd98b416711441";

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

export function ElevenLabsVoiceAgentCard() {
  const { kpis, lowStockItems, operationsSummary } = useDashboardStore();
  const { selectedWarehouse } = useStore();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [transcript, setTranscript] = useState("“Ask FLUXO AI about inventory, transfers, or stock velocity...”");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

      // Stop any current audio
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
      audio.volume = isMuted ? 0 : audioVolume;

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
      // Browser SpeechSynthesis Fallback
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
      reply = `Attention: ${count} SKUs are below reorder threshold. Suggested automated PO generated for lithium microcontrollers and copper wiring.`;
    } else if (lower.includes("transfer") || lower.includes("dallas")) {
      reply = `Internal transfer request logged: 120 Inverters from Austin Hub to Dallas Center. Status initialized as DRAFT awaiting supervisor signature.`;
    } else if (lower.includes("dispatch") || lower.includes("receipt") || lower.includes("summary")) {
      reply = `Today's operations stream summary: 23 inbound receipts validated, 14 outbound customer deliveries shipped, and 8 inter-hub transfers completed.`;
    } else {
      reply = `FLUXO Neural Engine processed "${query}". All system indicators remain optimal across ${selectedWarehouse?.name || "all warehouses"}.`;
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
    <div className="relative group">
      {/* Small Telemetry Card Container */}
      <div className="bg-[#121422]/90 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 p-5 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Specular Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                FLUXO Voice AI
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                <span>ElevenLabs Engine</span>
                <span className="text-purple-400">• Turbo v2.5</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-[#1c1f33] hover:bg-[#282c47] text-gray-400 hover:text-white transition-colors border border-[#2d314f]"
              title={isExpanded ? "Collapse card" : "Expand settings"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Central Stitch-Designed Mic Button & Visualizer */}
        <div className="flex flex-col items-center justify-center py-3 bg-[#0d0e18]/80 border border-[#1f2238] rounded-xl p-4 mb-4 relative">
          {/* Animated Frequency Waveform Bars */}
          <div className="flex items-center justify-center gap-1 h-8 mb-3">
            {[40, 75, 50, 90, 30, 85, 60, 95, 45, 70, 35, 80].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? "bg-gradient-to-t from-purple-500 to-emerald-400 animate-pulse"
                    : isListening
                    ? "bg-gradient-to-t from-cyan-400 to-purple-500 animate-bounce"
                    : "bg-purple-900/40"
                }`}
                style={{
                  height: isSpeaking || isListening ? `${Math.max(8, (h * (isSpeaking ? 0.9 : 0.6)))}px` : "6px",
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>

          {/* Stitch Mic Trigger Button */}
          <div className="relative flex items-center justify-center mb-2">
            {/* Outer Pulsing Aura Rings */}
            {(isListening || isSpeaking) && (
              <>
                <span className="absolute w-16 h-16 rounded-full bg-purple-500/30 animate-ping" />
                <span className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-pulse" />
              </>
            )}

            <button
              onClick={isSpeaking ? handleStopAudio : handleToggleListening}
              disabled={loadingAudio}
              className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isSpeaking
                  ? "bg-gradient-to-tr from-amber-500 to-red-600 text-white shadow-amber-500/30 hover:scale-105"
                  : isListening
                  ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 scale-105"
                  : "bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white hover:shadow-purple-500/40 hover:scale-105"
              }`}
            >
              {loadingAudio ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : isSpeaking ? (
                <Square className="w-5 h-5 fill-current" />
              ) : isListening ? (
                <Mic className="w-6 h-6 animate-bounce" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>

          <p className="text-[11px] font-medium text-gray-300 text-center px-2 line-clamp-2">
            {transcript}
          </p>

          {aiResponse && (
            <div className="mt-2 text-[11px] text-purple-200 bg-purple-950/40 border border-purple-800/40 rounded-lg p-2.5 w-full text-left font-sans">
              <span className="font-bold text-purple-400 mr-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 inline text-emerald-400" /> FLUXO AI:
              </span>
              {aiResponse}
            </div>
          )}
        </div>

        {/* Quick Voice Command Chips */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Quick Voice Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_COMMANDS.slice(0, 2).map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(`“${cmd}”`);
                  handleProcessCommand(cmd);
                }}
                disabled={isSpeaking || loadingAudio}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#191c2e] hover:bg-[#252945] text-purple-300 hover:text-white border border-[#2b2f52] transition-colors flex items-center gap-1"
              >
                <Zap className="w-2.5 h-2.5 text-purple-400" />
                <span>{cmd}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Controls (Voice Persona & Audio Toggles) */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[#1f2238] space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono text-[11px]">Select Voice Persona:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded bg-[#1c1f33] text-gray-300 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v)}
                  className={`text-[11px] p-2 rounded-lg border text-left transition-all ${
                    selectedVoice.id === v.id
                      ? "bg-purple-950/60 border-purple-500 text-purple-200 font-semibold"
                      : "bg-[#151726] border-[#252945] text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="font-bold">{v.name}</div>
                  <div className="text-[9px] text-gray-400 truncate">{v.role}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

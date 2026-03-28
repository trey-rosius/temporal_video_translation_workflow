import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Play, 
  Send, 
  Cpu, 
  Database, 
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Edit3,
  Check
} from "lucide-react";

const API_BASE_URL = 'https://t06l9e0o09.execute-api.us-east-1.amazonaws.com/prod/workflow';

type PipelineStatus = "IDLE" | "INITIALIZING" | "INGESTING" | "TRANSCRIBING" | "AWAITING_REVIEW" | "TRANSLATING" | "DUBBING" | "UPLOADING" | "COMPLETED" | "ERROR";

export default function App() {
  const [workflowId, setWorkflowId] = useState("video-uploads-final-tracking-test-mp4");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("IDLE");
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [editedTranscription, setEditedTranscription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>(["System initialized. Ready for command."]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-19), `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const fetchStatus = useCallback(async () => {
    if (!workflowId || pipelineStatus === "IDLE" || pipelineStatus === "COMPLETED") return;

    try {
      const resp = await fetch(`${API_BASE_URL}/${workflowId}`);
      const data = await resp.json();
      
      if (data.status) {
        setPipelineStatus(data.status as PipelineStatus);
        
        // Update progress based on status
        const progressMap: Record<PipelineStatus, number> = {
          IDLE: 0,
          INITIALIZING: 5,
          INGESTING: 15,
          TRANSCRIBING: 35,
          AWAITING_REVIEW: 45,
          TRANSLATING: 65,
          DUBBING: 80,
          UPLOADING: 95,
          COMPLETED: 100,
          ERROR: 0
        };
        setProgress(progressMap[data.status as PipelineStatus] || 0);

        if (data.transcription && data.transcription !== transcription) {
          setTranscription(data.transcription);
          setEditedTranscription(data.transcription);
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [workflowId, pipelineStatus, transcription]);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStartTracking = () => {
    setPipelineStatus("INITIALIZING");
    setProgress(5);
    addLog(`Initiating sequence for target: ${workflowId}`);
  };

  const handleResolveTranscription = async () => {
    setIsSubmitting(true);
    addLog("Injecting resolved transcription into workflow handler...");
    try {
      const resp = await fetch(`${API_BASE_URL}/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolveTranscription',
          text: editedTranscription
        })
      });
      if (resp.ok) {
        addLog("Transcription signal accepted. Resuming pipeline.");
        setPipelineStatus("TRANSLATING");
      }
    } catch (err) {
      addLog("ERROR: Failed to transmit signal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] selection:bg-[#00ff41] selection:text-black font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <main className="relative w-full max-w-2xl">
        <div className="bg-[#151619] border border-[#2a2c31] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c31] bg-[#1a1b1e]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2a2c31] rounded-md">
                <Cpu className="w-5 h-5 text-[#00ff41]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight uppercase">Temporal Console</h1>
                <p className="text-[10px] terminal-text text-[#8e9299]">Human-In-The-Loop Core</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pipelineStatus !== 'IDLE' && pipelineStatus !== 'COMPLETED' ? 'bg-[#00ff41] animate-pulse' : 'bg-[#8e9299]'}`} />
                <span className="text-[10px] terminal-text text-[#8e9299]">{pipelineStatus}</span>
              </div>
              <Settings2 className="w-4 h-4 text-[#8e9299] cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Target Selection */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] terminal-text text-[#8e9299]">Active Workflow Handle</label>
                <span className="text-[9px] font-mono text-[#4a4d55]">SIG: 0x7E2...</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  disabled={pipelineStatus !== 'IDLE' && pipelineStatus !== 'COMPLETED'}
                  className="w-full bg-[#0a0a0a] border border-[#2a2c31] px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00ff41] transition-colors disabled:opacity-50"
                  placeholder="Enter Workflow ID..."
                />
              </div>
              {pipelineStatus === 'IDLE' || pipelineStatus === 'COMPLETED' ? (
                <button 
                  onClick={handleStartTracking}
                  className="w-full bg-[#00ff41] text-black font-bold py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#00cc33] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Connect to Instance
                </button>
              ) : null}
            </section>

            {/* Status & Progress */}
            <section className="space-y-4 pt-4 border-t border-[#2a2c31]">
              <div className="flex justify-between items-center text-[10px] terminal-text text-[#8e9299]">
                <span>Pipeline Matrix</span>
                <span>{progress}% Loaded</span>
              </div>
              <div className="h-1.5 w-full bg-[#1a1b1e] rounded-full overflow-hidden border border-[#2a2c31]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                />
              </div>
            </section>

            {/* Human-In-The-Loop Step */}
            <AnimatePresence>
              {pipelineStatus === "AWAITING_REVIEW" && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 p-5 bg-[#1a1b1e] border border-[#00ff41]/30 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-[#00ff41] text-xs font-bold uppercase tracking-widest">
                    <Edit3 className="w-4 h-4" />
                    Manual Review Required
                  </div>
                  <p className="text-[10px] text-[#8e9299] leading-relaxed">
                    Transcription phase complete. Review and modify the output before the synthesis engine proceeds to translation.
                  </p>
                  <textarea 
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="w-full h-32 bg-[#0a0a0a] border border-[#2a2c31] p-3 font-mono text-xs text-white focus:outline-none focus:border-[#00ff41] resize-none"
                  />
                  <button 
                    onClick={handleResolveTranscription}
                    disabled={isSubmitting}
                    className="w-full bg-[#00ff41] text-black font-bold py-3 text-[10px] uppercase tracking-widest hover:bg-[#00cc33] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Activity className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Approve & Resume Workflow
                  </button>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Logs Window */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] terminal-text text-[#8e9299]">
                <TerminalIcon className="w-3 h-3" />
                <span>Encrypted Telemetry</span>
              </div>
              <div className="bg-[#0a0a0a] border border-[#2a2c31] p-4 h-40 overflow-y-auto font-mono text-[10px] text-[#4a4d55] space-y-1">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div 
                      key={`${i}-${log}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <span className="text-[#00ff41] opacity-50 select-none">›</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 bg-[#1a1b1e] border-t border-[#2a2c31] flex justify-between items-center text-[9px] font-mono text-[#4a4d55]">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              <span>TEMPRA_NET_V2 // ENABLED</span>
            </div>
            <span>STABILITY: 99.98%</span>
          </div>
        </div>
      </main>
    </div>
  );
}

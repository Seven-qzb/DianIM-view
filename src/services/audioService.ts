// Audio notification chime and feedback service

class SoundService {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Play standard IM incoming message chime
   */
  public playMessageChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Dual-tone harmonic chime (880Hz -> 1320Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);

      // Secondary soft overtone
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.05);
      gain2.gain.setValueAtTime(0.12, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.05);
      osc2.stop(now + 0.3);
    } catch {
      // Audio might be blocked by browser autoplay policy before user interaction
    }
  }

  /**
   * Play a softer click/toggle feedback sound
   */
  public playToggleSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  /**
   * Play subtle chime when voice transcription completes
   */
  public playTranscriptionDoneSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  /**
   * Play voice audio simulation / speech synthesis with realistic audio waves
   */
  public playVoiceAudio(
    text?: string,
    durationSeconds: number = 5,
    onProgress?: (elapsed: number, duration: number) => void,
    onEnd?: () => void
  ): () => void {
    let isStopped = false;
    let timerId: NodeJS.Timeout | null = null;
    let synthUtterance: SpeechSynthesisUtterance | null = null;
    let activeOscillator: OscillatorNode | null = null;
    let activeGain: GainNode | null = null;

    const stop = () => {
      if (isStopped) return;
      isStopped = true;
      if (timerId) clearInterval(timerId);
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (activeOscillator) {
        try {
          activeOscillator.stop();
          activeOscillator.disconnect();
        } catch {
          // ignore
        }
        activeOscillator = null;
      }
      if (activeGain) {
        try {
          activeGain.disconnect();
        } catch {
          // ignore
        }
        activeGain = null;
      }
      onEnd?.();
    };

    // Try SpeechSynthesis if text is provided and supported
    let usedSpeechSynthesis = false;
    if (text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        synthUtterance = new SpeechSynthesisUtterance(text);
        synthUtterance.lang = 'zh-CN';
        synthUtterance.rate = 1.05;
        synthUtterance.pitch = 1.0;

        let startTime = Date.now();
        const estDuration = Math.max(durationSeconds, Math.round(text.length * 0.28));

        synthUtterance.onend = () => {
          if (!isStopped) {
            stop();
          }
        };
        synthUtterance.onerror = () => {
          // Fallback to synthesized audio timer
          runSynthesizedPlayback();
        };

        window.speechSynthesis.speak(synthUtterance);
        usedSpeechSynthesis = true;

        // Progress timer
        timerId = setInterval(() => {
          if (isStopped) return;
          const elapsed = (Date.now() - startTime) / 1000;
          onProgress?.(Math.min(elapsed, estDuration), estDuration);
          if (elapsed >= estDuration && !window.speechSynthesis.speaking) {
            stop();
          }
        }, 100);
      } catch {
        usedSpeechSynthesis = false;
      }
    }

    const runSynthesizedPlayback = () => {
      if (isStopped) return;
      try {
        this.initAudio();
        if (this.audioCtx) {
          const now = this.audioCtx.currentTime;
          activeOscillator = this.audioCtx.createOscillator();
          activeGain = this.audioCtx.createGain();
          activeOscillator.type = 'triangle';
          activeOscillator.frequency.setValueAtTime(260, now);
          // Gently modulate frequency to simulate speech inflection
          for (let i = 0; i < durationSeconds; i += 0.4) {
            const freq = 220 + Math.sin(i * 3) * 60 + ((i * 17) % 40);
            activeOscillator.frequency.setValueAtTime(freq, now + i);
          }
          activeGain.gain.setValueAtTime(0.08, now);
          activeOscillator.connect(activeGain);
          activeGain.connect(this.audioCtx.destination);
          activeOscillator.start(now);
          activeOscillator.stop(now + durationSeconds);
        }
      } catch {
        // ignore
      }

      let elapsed = 0;
      const interval = 100;
      timerId = setInterval(() => {
        if (isStopped) return;
        elapsed += interval / 1000;
        onProgress?.(Math.min(elapsed, durationSeconds), durationSeconds);
        if (elapsed >= durationSeconds) {
          stop();
        }
      }, interval);
    };

    if (!usedSpeechSynthesis) {
      runSynthesizedPlayback();
    }

    return stop;
  }
}

export const soundService = new SoundService();

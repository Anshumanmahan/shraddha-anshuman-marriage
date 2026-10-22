"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EASE_SILK } from "@/lib/motion";
import { weddingConfig } from "@/wedding.config";

/* ==================================================================
   MUSIC
   Never autoplays on its own. Browsers would block it anyway, and a
   wedding invitation that starts singing at someone in a quiet room is
   worse than one that waits to be asked.

   It does start itself, but only off the tap that opens the envelope —
   `start()` is called synchronously from that click handler, inside the
   user gesture the autoplay policy requires. Deferring it by even a
   timeout would lose the gesture on iOS and playback would be refused.
   If it is refused anyway, the control simply stays there to be tapped.

   Playback begins partway in, past the intro, and returns to that same
   point when the track ends — so a guest who stays never falls into
   silence and never hears the opening we skipped.

   Nothing is fetched until the guest opens the envelope. Preloading
   metadata instead buffered the opening half-minute of a track we are
   about to skip past — roughly 600KB of someone data, thrown away.

   Renders nothing at all when there are no tracks.
   ================================================================== */

const BARS = [0, 0.18, 0.36, 0.12];

const { tracks, volume, startAt } = weddingConfig.music;

export type MusicHandle = {
  /** Begin playback. Must be called inside a user gesture. */
  start: () => void;
};

export const MusicToggle = forwardRef<MusicHandle, { visible: boolean }>(
  function MusicToggle({ visible }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [broken, setBroken] = useState(false);
    const [track, setTrack] = useState(0);
    const loadedRef = useRef(false);

    /* Pause when the guest leaves the tab; do not resume uninvited. */
    useEffect(() => {
      const onHidden = () => {
        if (document.visibilityState === "hidden") {
          audioRef.current?.pause();
          setPlaying(false);
        }
      };
      document.addEventListener("visibilitychange", onHidden);
      return () => document.removeEventListener("visibilitychange", onHidden);
    }, []);

    /**
     * The <audio> element carries no src prop: the source is set here, by
     * hand, immediately before play(). Rendering it through state meant
     * racing React to commit the new src, and play() kept firing against
     * whatever was still loaded.
     *
     * The entry point rides on the URL as a media fragment, so the browser
     * ranges straight to that offset on its first request rather than
     * fetching the opening seconds it is about to skip.
     */
    const prepare = useCallback((audio: HTMLAudioElement) => {
      if (loadedRef.current) return;

      const index = Math.floor(Math.random() * tracks.length);
      const chosen = tracks[index];
      const offset = Math.min(startAt, Math.max(0, chosen.duration - 5));

      audio.src = offset > 0 ? chosen.src + "#t=" + offset : chosen.src;
      /* Not `loop`: the browser would send it back to 0:00 and play the
         intro we deliberately skipped. The end is handled by hand. */
      audio.loop = false;
      audio.volume = volume;
      loadedRef.current = true;
      setTrack(index);

      /* Some browsers ignore the fragment. If the playhead is still at the
         top once metadata lands, place it by hand. */
      if (offset > 0) {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            if (audio.currentTime < 1) {
              try {
                audio.currentTime = offset;
              } catch {
                // Then it simply plays from the beginning.
              }
            }
          },
          { once: true },
        );
      }
    }, []);

    const toggle = useCallback(async () => {
      const audio = audioRef.current;
      if (!audio || broken) return;

      if (playing) {
        audio.pause();
        setPlaying(false);
        return;
      }

      prepare(audio);
      try {
        audio.volume = volume;
        await audio.play();
        setPlaying(true);
      } catch {
        /* Refused playback is not a broken file — the control stays put
           so the guest can try again. Only a media error hides it. */
        setPlaying(false);
      }
    }, [playing, broken, prepare]);

    /** The track has run out: go back to the entry point, not to 0:00. */
    const restart = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 5));
      } catch {
        // Then it resumes from wherever the browser puts it.
      }
      void audio.play().catch(() => setPlaying(false));
    }, []);

    /** Used by the envelope, from inside the tap that opens it. */
    const start = useCallback(() => {
      const audio = audioRef.current;
      if (!audio || broken || playing) return;

      prepare(audio);
      audio.volume = volume;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }, [broken, playing, prepare]);

    useImperativeHandle(ref, () => ({ start }), [start]);

    if (tracks.length === 0) return null;

    const current = tracks[track];

    return (
      <>
        {/* Always mounted, even while the envelope is sealed: the element
            has to exist before the tap that starts it. Until then it costs
            nothing — no source, no preload, not a single byte. */}
        <audio
          ref={audioRef}
          preload="none"
          onEnded={restart}
          onError={() => setBroken(true)}
        />

        <AnimatePresence>
          {visible && !broken && (
            <motion.div
              className="no-print fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.6, ease: EASE_SILK }}
            >
              <button
                type="button"
                onClick={toggle}
                aria-pressed={playing}
                aria-label={playing ? "Pause the music" : "Play the music"}
                title={playing ? current.title : "Play music"}
                className="group grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-burgundy/92 shadow-[0_10px_28px_-14px_rgba(20,4,10,0.8)] backdrop-blur-sm transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-13 sm:w-13"
              >
                <span
                  className="flex h-4 items-end gap-[3px]"
                  aria-hidden="true"
                >
                  {BARS.map((delay, i) => (
                    <span
                      key={i}
                      className="w-[2px] origin-bottom rounded-full bg-gold-pale"
                      style={
                        playing
                          ? {
                              height: "100%",
                              animation: `equalizer 1.05s ease-in-out ${delay}s infinite`,
                            }
                          : { height: i === 1 || i === 2 ? "62%" : "38%" }
                      }
                    />
                  ))}
                </span>
                <span className="sr-only">
                  {playing ? `Now playing: ${current.title}` : ""}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);

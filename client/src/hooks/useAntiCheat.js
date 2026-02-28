import { useEffect, useState, useCallback } from 'react';

export const useAntiCheat = (level = 'medium', onCheatEvent) => {
    const [violations, setViolations] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fullscreen Enforcement
    const requestFullscreen = useCallback(async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error("Error attempting to enable fullscreen:", err);
        }
    }, []);

    useEffect(() => {
        if (level === 'none') return;

        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);

            if (!isCurrentlyFullscreen) {
                // Exited fullscreen
                setViolations(v => v + 1);
                onCheatEvent('fullscreen_exit', violations + 1);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab switched or minimized
                setViolations(v => v + 1);
                onCheatEvent('tab_switch', violations + 1);
            }
        };

        const handleBlur = () => {
            // Window lost focus
            setViolations(v => v + 1);
            onCheatEvent('window_blur', violations + 1);
        };

        const blockShortcuts = (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+P, Ctrl+S
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))
            ) {
                e.preventDefault();
                setViolations(v => v + 1);
                onCheatEvent('devtools_shortcut_attempt', violations + 1);
            }

            // Block Copy/Paste keys
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X')) {
                e.preventDefault();
                setViolations(v => v + 1);
                onCheatEvent('copy_paste_attempt', violations + 1);
            }
        };

        const blockContextMenu = (e) => {
            e.preventDefault();
        };

        const blockCopyPaste = (e) => {
            e.preventDefault();
            setViolations(v => v + 1);
            onCheatEvent('copy_paste_attempt', violations + 1);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', blockShortcuts);
        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('copy', blockCopyPaste);
        document.addEventListener('cut', blockCopyPaste);
        document.addEventListener('paste', blockCopyPaste);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('keydown', blockShortcuts);
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('copy', blockCopyPaste);
            document.removeEventListener('cut', blockCopyPaste);
            document.removeEventListener('paste', blockCopyPaste);
        };
    }, [level, violations, onCheatEvent]);

    return { requestFullscreen, isFullscreen, violations };
};

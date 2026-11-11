import { chapterAt, chapterStarts, demoChapters, demoDuration, formatDemoTime } from "../data/demo";

/** One clock owns all output, including typed text, so every frame is safe to seek. */
export function initializeDemo(root: HTMLElement) {
    const scenes = [...root.querySelectorAll<HTMLElement>("[data-scene]")];
    const chapters = [...root.querySelectorAll<HTMLButtonElement>("[data-chapter]")];
    const play = root.querySelector<HTMLButtonElement>("[data-play]")!;
    const seek = root.querySelector<HTMLInputElement>("[data-seek]")!;
    const speed = root.querySelector<HTMLSelectElement>("[data-speed]")!;
    const previous = root.querySelector<HTMLButtonElement>("[data-prev]")!;
    const next = root.querySelector<HTMLButtonElement>("[data-next]")!;
    const caption = root.querySelector<HTMLElement>("[data-caption]")!;
    const captionNumber = root.querySelector<HTMLElement>("[data-caption-number]")!;
    const timeDisplay = root.querySelector<HTMLElement>("[data-time]")!;
    const surface = root.querySelector<HTMLElement>("[data-surface-label]")!;
    const status = root.querySelector<HTMLElement>("[data-demo-status]")!;
    const playLabel = root.querySelector<HTMLElement>("[data-play-label]")!;
    const playIcon = root.querySelector<SVGElement>("[data-play-icon]")!;
    const pauseIcon = root.querySelector<SVGElement>("[data-pause-icon]")!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = scenes.map((scene) => ({
        cues: [...scene.querySelectorAll<HTMLElement>("[data-cue]")].map((element) => ({
            element,
            at: Number(element.dataset.cue),
            until: Number(element.dataset.until ?? Infinity),
        })),
        typed: [...scene.querySelectorAll<HTMLElement>("[data-type-at]")].map((element) => ({
            element,
            at: Number(element.dataset.typeAt),
            duration: Number(element.dataset.typeFor),
            text: element.dataset.text || "",
        })),
        highlights: [...scene.querySelectorAll<HTMLElement>("[data-highlight-at]")],
        scroll: scene.querySelector<HTMLElement>(".demo-terminal-scroll"),
        review: scene.querySelector<HTMLElement>(".demo-review-workspace"),
        feedback: scene.querySelector<HTMLElement>(".demo-feedback"),
    }));
    let time = 0;
    let playing = false;
    let rate = 1;
    let currentChapter = -1;
    let lastFrame = 0;
    let animationFrame = 0;

    function render() {
        const index = chapterAt(time);
        const changed = currentChapter !== index;
        const chapter = demoChapters[index];
        const localTime = time - chapterStarts[index];
        if (changed) {
            currentChapter = index;
            scenes.forEach((scene, sceneIndex) => {
                scene.hidden = sceneIndex !== index;
            });
            chapters.forEach((button, buttonIndex) => {
                if (buttonIndex === index) button.setAttribute("aria-current", "step");
                else button.removeAttribute("aria-current");
                button.classList.toggle("is-complete", buttonIndex < index);
            });
            caption.textContent = chapter.caption;
            captionNumber.textContent = `${String(index + 1).padStart(2, "0")} / ${demoChapters.length}`;
            surface.textContent =
                chapter.surface === "terminal"
                    ? "Terminal"
                    : chapter.surface === "code"
                      ? "Code Review"
                      : chapter.surface === "end"
                        ? "Work Record"
                        : "Plan Review";
            status.textContent = `Step ${index + 1}: ${chapter.title}. ${chapter.caption}`;
            // Keep the active chapter visible on the mobile horizontal rail without moving the page.
            const rail = chapters[index].closest("ol");
            if (rail && rail.scrollWidth > rail.clientWidth) {
                rail.scrollLeft = chapters[index].offsetLeft - rail.offsetLeft - 12;
            }
        }
        const frame = frames[index];
        let contentChanged = changed;
        frame.cues.forEach(({ element, at, until }) => {
            const hidden = localTime < at || localTime >= until;
            if (element.hidden !== hidden) contentChanged = true;
            element.hidden = hidden;
        });
        frame.typed.forEach(({ element, at, duration, text }) => {
            const progress = localTime < at ? 0 : reducedMotion.matches ? 1 : Math.min(1, (localTime - at) / duration);
            const value = text.slice(0, Math.floor(text.length * progress));
            if (element.textContent !== value) {
                element.textContent = value;
                contentChanged = true;
            }
            element.classList.toggle("is-typing", progress > 0 && progress < 1);
        });
        frame.highlights.forEach((element) =>
            element.classList.toggle("is-highlighted", localTime >= Number(element.dataset.highlightAt)),
        );
        if (frame.scroll && contentChanged) frame.scroll.scrollTop = frame.scroll.scrollHeight;
        if (contentChanged) {
            // Mobile review panes stack inside a scrollport. Follow the current message,
            // never the outer page, and reconstruct the position on backward seeks.
            for (const container of [frame.review, frame.feedback]) {
                if (!container) continue;
                const lastCue = frame.cues.findLast(({ element }) => !element.hidden && container.contains(element));
                container.scrollTop = lastCue
                    ? Math.max(
                          0,
                          container.scrollTop +
                              lastCue.element.getBoundingClientRect().bottom -
                              container.getBoundingClientRect().top -
                              container.clientHeight +
                              16,
                      )
                    : 0;
            }
        }
        seek.value = String(time);
        seek.style.setProperty("--demo-progress", `${(time / demoDuration) * 100}%`);
        seek.setAttribute(
            "aria-valuetext",
            `${formatDemoTime(time)} of ${formatDemoTime(demoDuration)}. ${chapter.title}`,
        );
        timeDisplay.textContent = formatDemoTime(time);
        previous.disabled = index === 0;
        next.disabled = index === demoChapters.length - 1;
    }

    function updatePlayback() {
        root.classList.toggle("is-playing", playing);
        const label = playing ? "Pause" : time >= demoDuration ? "Replay" : "Play";
        playLabel.textContent = label;
        play.setAttribute("aria-label", `${label} demo`);
        playIcon.toggleAttribute("hidden", playing);
        pauseIcon.toggleAttribute("hidden", !playing);
    }

    function pause() {
        playing = false;
        cancelAnimationFrame(animationFrame);
        updatePlayback();
    }

    function tick(now: number) {
        if (!playing) return;
        time = Math.min(demoDuration, time + ((now - lastFrame) / 1000) * rate);
        lastFrame = now;
        render();
        if (time >= demoDuration) pause();
        else animationFrame = requestAnimationFrame(tick);
    }

    function start() {
        if (playing) return;
        if (time >= demoDuration) time = 0;
        playing = true;
        lastFrame = performance.now();
        render();
        updatePlayback();
        animationFrame = requestAnimationFrame(tick);
    }

    function jumpTo(value: number) {
        time = Math.max(0, Math.min(demoDuration, value));
        lastFrame = performance.now();
        render();
        if (time >= demoDuration) pause();
        else updatePlayback();
    }

    play.addEventListener("click", () => (playing ? pause() : start()));
    chapters.forEach((button, index) => button.addEventListener("click", () => jumpTo(chapterStarts[index])));
    previous.addEventListener("click", () => jumpTo(chapterStarts[Math.max(0, currentChapter - 1)]));
    next.addEventListener("click", () => jumpTo(chapterStarts[Math.min(demoChapters.length - 1, currentChapter + 1)]));
    seek.addEventListener("input", () => jumpTo(Number(seek.value)));
    speed.addEventListener("change", () => {
        rate = Number(speed.value);
    });
    root.querySelector<HTMLButtonElement>("[data-replay]")?.addEventListener("click", () => {
        jumpTo(0);
        play.focus({ preventScroll: true });
        start();
    });
    root.addEventListener("keydown", (event) => {
        const target = event.target;
        // Preserve native button, link, range, and select keyboard behavior.
        if (!(target instanceof HTMLElement) || target.closest("button, a, input, select")) return;
        if (event.code === "Space") {
            event.preventDefault();
            playing ? pause() : start();
        }
        if (event.code === "ArrowLeft") {
            event.preventDefault();
            jumpTo(time - 5);
        }
        if (event.code === "ArrowRight") {
            event.preventDefault();
            jumpTo(time + 5);
        }
        if (event.code === "Home") {
            event.preventDefault();
            jumpTo(0);
        }
        if (event.code === "End") {
            event.preventDefault();
            jumpTo(demoDuration);
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) pause();
    });
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) pause();
        }).observe(root);
    }
    reducedMotion.addEventListener("change", render);
    render();
    updatePlayback();
}

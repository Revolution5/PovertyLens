// Added by Reymes - 03/24/2026 - AI Chat Bot component
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown, Sparkles } from "lucide-react"; // Modified by Marisol for Work Review 3 - added Sparkles for header

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the PovertyLens AI assistant. I can help you understand poverty statistics, navigate the platform, or find ways to take action. How can I help you today?",
};

// Added by Marisol for Work Review 3 - quick questions aligned with PovertyLens platform features
const QUICK_QUESTIONS = [
  "How do I share a story?",
  "How does FreeRice work?",
  "Where can I donate?"
];
// End added by Marisol for Work Review 3

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null); // Added by Reymes 4/4/2026 - store user's profile image URL for chat avatars
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Added by Marisol for Work Review 3 - unread badge counter + quick questions visibility + dark mode detection
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);
  // End added by Marisol for Work Review 3

  // Added by Reymes 4/4/2026 - load signed-in user's profile image for chat avatars
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    let isCancelled = false;
    const controller = new AbortController();

    const loadProfileImage = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/profile/user-images?email=${encodeURIComponent(email)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (!data?.success || !data.profileImage || isCancelled) return;

        const rawImageUrl = String(data.profileImage);
        const fullImageUrl =
          rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
            ? rawImageUrl
            : `${BACKEND_URL}${rawImageUrl}`;

        setUserProfileImage(fullImageUrl);
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          console.error("Unable to load chat profile image", err);
        }
      }
    };

    loadProfileImage();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, []); //end of Added by Reymes 4/4/2026 - load signed-in user's profile image for chat avatars

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (overrideText?: string) => { // Modified by Marisol for Work Review 3 - added optional overrideText param for quick question buttons
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowQuickQuestions(false); // Added by Marisol for Work Review 3 - hide quick questions after first message

    try {
      const history = [...messages, userMessage].filter((m) => m.id !== "welcome");
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) setUnreadCount((prev) => prev + 1); // Added by Marisol for Work Review 3 - bump unread badge when chat is minimised

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat window ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 z-50 flex flex-col w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="PovertyLens AI Chat"
          // Modified by Marisol for Work Review 3 - CSS variables so all themes (light/dark/high-contrast) are respected
          style={{
            backgroundColor: "var(--background)",
            border: "1.5px solid var(--color-gray-light)",
            boxShadow: "var(--shadow-xl)",
            height: "520px",
            animation: "chatSlideUp 0.3s ease-out",
          }}
          // End of Modified by Marisol for Work Review 3 - CSS variables so all themes (light/dark/high-contrast) are respected
        >
          {/* ── Header ── */}
          {/* Modified by Marisol for Work Review 3 - site brand gradient + Sparkles + "Typing..." status */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-5 py-4"
            style={{
              // Modified by Reymes 4/4/2026 - solid color header for clean, readable appearance.
              background: isDark ? "#0f3c4a" : "#0b5a6e",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  PovertyLens AI
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                </h3>
                <p className="text-xs text-white/80">
                  {isLoading ? "Typing..." : "Always here to help"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* End header modification by Marisol for Work Review 3 */}

          {/* ── Messages ── */}
          {/* Start of Modified by Marisol for Work Review 3 - CSS variable background tint, works in all themes */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{
              backgroundColor: isDark
                ? "rgba(0,0,0,0.2)"
                : "rgba(140,228,255,0.04)",
            }}
          >
          {/* End of Modified by Marisol for Work Review 3 - CSS variable background tint, works in all themes */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar - Modified by Marisol for Work Review 3 - site gradient / orange for user */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-sm overflow-hidden" // Added overflow-hidden to ensure profile images are contained within avatar circle
                  style={{
                    background:
                      msg.role === "user"
                        ? "var(--color-orange)"
                        : "linear-gradient(135deg, var(--color-cyan) 0%, var(--color-orange) 100%)",
                  }}
                >
                {/* End of Modified by Marisol for Work Review 3 - site gradient / orange for user */}
                  {msg.role === "user" && userProfileImage ? ( // Added by Reymes 4/4/2026 - show user's profile image in avatar if available, fallback to default icons
                    <img
                      src={userProfileImage}
                      alt="Your profile picture"
                      className="w-full h-full object-cover"
                      onError={() => setUserProfileImage(null)}
                    />
                  ) : msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                {/* End of Added by Reymes 4/4/2026 - show user's profile image in avatar if available, fallback to default icons */}

                {/* Bubble - Modified by Marisol for Work Review 3 - CSS variables for all themes */}
                <div className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className="rounded-xl px-4 py-2.5"
                    style={{
                      backgroundColor:
                        msg.role === "assistant"
                          ? isDark ? "rgba(140,228,255,0.1)" : "rgba(140,228,255,0.18)"
                          : isDark ? "rgba(255,162,57,0.15)" : "rgba(255,162,57,0.2)",
                      border: `1px solid ${
                        msg.role === "assistant"
                          ? "rgba(140,228,255,0.25)"
                          : "rgba(255,162,57,0.25)"
                      }`,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                  {/* End of Bubble - Modified by Marisol for Work Review 3 - CSS variables for all themes */}
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "var(--foreground)" }}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, var(--color-cyan) 0%, var(--color-orange) 100%)",
                  }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                {/* Modified by Marisol for Work Review 3 - CSS variable colours */}
                <div
                  className="rounded-xl px-4 py-2.5 flex items-center gap-2"
                  style={{
                    backgroundColor: isDark ? "rgba(140,228,255,0.1)" : "rgba(140,228,255,0.18)",
                    border: "1px solid rgba(140,228,255,0.25)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                {/* End of Modified by Marisol for Work Review 3 - CSS variable colours */}
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: "var(--color-cyan)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--color-gray)" }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Added by Marisol for Work Review 3 - quick questions, hidden after first user message */}
            {showQuickQuestions && messages.length === 1 && !isLoading && (
              <div className="pt-1">
                <p
                  className="text-xs font-semibold mb-2 px-1 tracking-wide"
                  style={{ color: "var(--color-gray)" }}
                >
                  QUICK QUESTIONS
                </p>
                <div className="space-y-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(140,228,255,0.08)"
                          : "rgba(140,228,255,0.13)",
                        border: "1px solid rgba(140,228,255,0.3)",
                        color: "var(--foreground)", // Modified by Reymes 4/4/2026 - use foreground token so quick questions are readable.
                        transition: "transform var(--transition-fast), background-color var(--transition-fast)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* End added by Marisol for Work Review 3 */}

            {/* Error message */}
            {error && (
              <p className="text-xs text-center px-2" style={{ color: "var(--color-red)" }}>
                {error}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          {/* Start of Modified by Marisol for Work Review 3 - CSS variables throughout */}
          <div
            className="flex-shrink-0 px-3 py-2 border-t" // adjusted padding for better spacing Reymes
            style={{
              borderColor: "var(--color-gray-light)",
              backgroundColor: "var(--background)",
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-0.5" //adjusted for better spacing Reymes
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: "1px solid var(--color-gray-light)",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about poverty..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none h-8 max-h-8 leading-8 py-0"
                style={{ color: "var(--foreground)" }}
                aria-label="Chat input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                suppressHydrationWarning
                // Modified by Marisol for Work Review 3 - site gradient when active, gray when disabled
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed" // adjusted for better spacing and added disabled styles Reymes
                style={{
                  background:
                    input.trim() && !isLoading
                      ? "linear-gradient(135deg, var(--color-cyan) 0%, var(--color-orange) 100%)"
                      : "var(--color-gray-light)",
                  color: input.trim() && !isLoading ? "#ffffff" : "var(--color-gray)",// Modified by Reymes 4/4/2026 - fixed invalid color value and set high-contrast icon colors.
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p
              className="text-xs text-center mt-1.5"
              style={{ color: "var(--color-gray)" }}
            >
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
          {/* End of Modified by Marisol for Work Review 3 - CSS variables throughout */}
        </div>
      )}

      {/* ── FAB toggle button ── */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
          suppressHydrationWarning
          className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white"
          style={{
            // Modified by Reymes 4/4/2026 - deepened FAB gradient to improve icon contrast in light and dark modes.
            background: isDark
              ? "linear-gradient(135deg, #0f4c5c 0%, #1e3a8a 100%)"
              : "linear-gradient(135deg, #0b5a6e 0%, #1e40af 100%)",
          }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>


        {/* Added by Marisol for Work Review 3 - unread message badge */}
            {!isOpen && unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center animate-pulse pointer-events-none"
                  style={{ backgroundColor: "var(--color-red)", color: "#fff" }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          {/* End added by Marisol for Work Review 3 */}

      {/* Added by Marisol for Work Review 3 - slide-up animation for chat window */}
      <style jsx>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* End added by Marisol for Work Review 3 */}
    </>
  );
}
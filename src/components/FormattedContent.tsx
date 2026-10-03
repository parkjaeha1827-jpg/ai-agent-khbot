import React, { useState } from "react";
import { Check, Copy, Code2, BookOpen, CheckCircle2, Sparkles, Image as ImageIcon } from "lucide-react";
import katex from "katex";

interface FormattedContentProps {
  content: string;
}

// Helper to render LaTeX math using KaTeX safely
function renderKaTeX(expr: string, displayMode = false): React.ReactNode {
  try {
    const html = katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
    });
    return (
      <span
        className={
          displayMode
            ? "block my-2.5 overflow-x-auto text-center font-normal py-1"
            : "inline-block px-1 align-baseline font-normal"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span className="font-mono text-sky-300 font-normal">{expr}</span>;
  }
}

// Interactive SVG Diagram Component for exercise figures
const SvgDiagram: React.FC<{ svgCode: string }> = ({ svgCode }) => {
  const [copied, setCopied] = useState(false);

  let cleanedSvg = svgCode.trim();
  // Ensure xmlns is present for standalone rendering
  if (!cleanedSvg.includes("xmlns=")) {
    cleanedSvg = cleanedSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-sky-500/30 bg-[#0d1624] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-[#132338] border-b border-sky-500/20 text-xs text-sky-300 font-medium">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-sky-400" />
          <span className="font-semibold">📊 រូបភាពគំនូសបំព្រួញពន្យល់លំហាត់ (Explanatory Diagram)</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 text-[11px] transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "បានចម្លង!" : "ចម្លង SVG"}</span>
        </button>
      </div>

      <div
        className="p-4 flex items-center justify-center bg-[#0d1624] overflow-x-auto min-h-[160px]"
        dangerouslySetInnerHTML={{ __html: cleanedSvg }}
      />
      <div className="px-3 py-1.5 text-center text-[11px] text-sky-300/70 bg-[#132338]/60 border-t border-sky-500/10">
        💡 រូបភាពគូសបញ្ជាក់ និងកំណត់សម្គាល់សម្រាប់ស្វែងយល់ដំណោះស្រាយលំហាត់
      </div>
    </div>
  );
};

export const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  // Strip any accidental Thai characters from rendering
  const safeContent = content.replace(/[\u0E00-\u0E7F]+/g, "");

  // Split code blocks, block math, and embedded SVG tags
  const parts = safeContent.split(
    /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|<svg[\s\S]*?<\/svg>)/gi
  );

  return (
    <div className="space-y-2 text-[14.5px] leading-relaxed text-inherit break-words">
      {parts.map((part, index) => {
        if (!part) return null;

        // Embedded Raw SVG
        if (part.toLowerCase().startsWith("<svg") && part.toLowerCase().endsWith("</svg>")) {
          return <SvgDiagram key={index} svgCode={part} />;
        }

        // Code block
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim() || "";
          const isLanguageTag = /^[a-zA-Z0-9_+#.-]+$/.test(firstLine);
          const language = isLanguageTag ? firstLine : "code";
          const codeBody = isLanguageTag ? lines.slice(1).join("\n") : lines.join("\n");

          // If the code block itself contains SVG diagram, render as diagram
          if (
            language.toLowerCase() === "svg" ||
            (codeBody.includes("<svg") && codeBody.includes("</svg>"))
          ) {
            const svgMatch = codeBody.match(/<svg[\s\S]*?<\/svg>/i);
            if (svgMatch) {
              return <SvgDiagram key={index} svgCode={svgMatch[0]} />;
            }
          }

          return <CodeSnippet key={index} code={codeBody} language={language} />;
        }

        // Display Math Block $$...$$
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const mathExpr = part.slice(2, -2);
          return (
            <div key={index} className="p-2 my-2 bg-black/20 rounded-lg border border-white/5 overflow-x-auto">
              {renderKaTeX(mathExpr, true)}
            </div>
          );
        }

        // Display Math Block \[...\]
        if (part.startsWith("\\[") && part.endsWith("\\]")) {
          const mathExpr = part.slice(2, -2);
          return (
            <div key={index} className="p-2 my-2 bg-black/20 rounded-lg border border-white/5 overflow-x-auto">
              {renderKaTeX(mathExpr, true)}
            </div>
          );
        }

        return <TextSection key={index} text={part} />;
      })}
    </div>
  );
};

const CodeSnippet: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-white/10 bg-[#0f1722] text-[#d6e0ea] text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#17212b] border-b border-white/10 text-white/70">
        <div className="flex items-center space-x-1.5 font-mono text-[11px] uppercase tracking-wider text-sky-400">
          <Code2 className="w-3.5 h-3.5" />
          <span>{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">បានចម្លង!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>ចម្លងកូដ</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[12.5px] leading-relaxed text-[#cbe1f7] whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Detect Ministry pedagogical step blocks
        if (
          trimmed.startsWith("📝") ||
          trimmed.includes("បម្រាប់ប្រធាន") ||
          trimmed.includes("បម្រាប់:") ||
          trimmed.startsWith("• បម្រាប់")
        ) {
          return (
            <div
              key={idx}
              className="my-1.5 p-2.5 rounded-lg bg-sky-950/40 border-l-4 border-sky-400 text-sky-100 font-medium"
            >
              <div className="flex items-center gap-1.5 text-sky-300 font-semibold mb-1">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{renderInlineWithMath(trimmed)}</span>
              </div>
            </div>
          );
        }

        if (
          trimmed.startsWith("📐") ||
          trimmed.includes("រូបមន្ត") ||
          trimmed.includes("តាមរូបមន្ត") ||
          trimmed.includes("រូបមន្តដែលត្រូវប្រើ")
        ) {
          return (
            <div
              key={idx}
              className="my-1.5 p-2.5 rounded-lg bg-indigo-950/40 border-l-4 border-indigo-400 text-indigo-100"
            >
              <div className="font-semibold text-indigo-300">{renderInlineWithMath(trimmed)}</div>
            </div>
          );
        }

        if (
          trimmed.startsWith("🔢") ||
          trimmed.includes("ដំណោះស្រាយ") ||
          trimmed.includes("ការគណនា") ||
          trimmed.includes("ដំណោះស្រាយជាជំហានៗ")
        ) {
          return (
            <div
              key={idx}
              className="my-1.5 p-2.5 rounded-lg bg-blue-950/40 border-l-4 border-blue-400 text-blue-100"
            >
              <div className="font-semibold text-blue-300">{renderInlineWithMath(trimmed)}</div>
            </div>
          );
        }

        if (
          trimmed.startsWith("🎯") ||
          trimmed.includes("ចម្លើយចុងក្រោយ") ||
          trimmed.includes("សន្និដ្ឋាន") ||
          trimmed.startsWith("ដូចនេះ") ||
          trimmed.includes("ដូចនេះ:")
        ) {
          return (
            <div
              key={idx}
              className="my-2 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-100 shadow-sm"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{renderInlineWithMath(trimmed)}</span>
              </div>
            </div>
          );
        }

        // Headers: ###, ##, #
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-base text-sky-300 pt-1">
              {renderInlineWithMath(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-lg text-sky-200 border-b border-white/10 pb-1 pt-1.5">
              {renderInlineWithMath(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="font-extrabold text-xl text-white border-b border-white/20 pb-1.5 pt-2">
              {renderInlineWithMath(trimmed.slice(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5 py-0.5">
              <span className="text-sky-400 select-none">•</span>
              <span className="flex-1">{renderInlineWithMath(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered lists: 1. , 2. 
        const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5 py-0.5">
              <span className="text-sky-400 font-semibold select-none min-w-[1.2rem]">{numMatch[1]}</span>
              <span className="flex-1">{renderInlineWithMath(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="py-0.5">
            {renderInlineWithMath(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Handle inline math $...$ or \(...\) alongside bold/italic/code
function renderInlineWithMath(text: string): React.ReactNode {
  // Split on inline math delimiters: $...$ or \(...\)
  const mathParts = text.split(/(\$[^\$\n]+\$|\\\([^\n]+?\\\))/g);

  return mathParts.map((part, i) => {
    // Check if inline math $...$
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const expr = part.slice(1, -1);
      return <React.Fragment key={i}>{renderKaTeX(expr, false)}</React.Fragment>;
    }
    // Check if inline math \(...\)
    if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
      const expr = part.slice(2, -2);
      return <React.Fragment key={i}>{renderKaTeX(expr, false)}</React.Fragment>;
    }

    // Otherwise render standard markdown inline formatting
    return <React.Fragment key={i}>{renderInlineFormatting(part)}</React.Fragment>;
  });
}

// Inline helper for **bold**, *italic*, and `inline code`
function renderInlineFormatting(text: string): React.ReactNode {
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((codePart, i) => {
    if (codePart.startsWith("`") && codePart.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40 text-emerald-300 font-mono text-[12px] border border-white/10"
        >
          {codePart.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    const boldParts = codePart.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((boldPart, j) => {
      if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
        return (
          <strong key={`${i}-${j}`} className="font-bold text-white">
            {boldPart.slice(2, -2)}
          </strong>
        );
      }

      // Italic *text*
      const italicParts = boldPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((itPart, k) => {
        if (itPart.startsWith("*") && itPart.endsWith("*") && itPart.length > 2) {
          return (
            <em key={`${i}-${j}-${k}`} className="italic text-sky-200">
              {itPart.slice(1, -1)}
            </em>
          );
        }
        return itPart;
      });
    });
  });
}

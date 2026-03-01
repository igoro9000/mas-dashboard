import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;

            if (isInline) {
              return (
                <code
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-sm",
                    "bg-muted text-foreground border border-border"
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={cn(className, "text-sm")} {...props}>
                {children}
              </code>
            );
          },
          pre({ children, ...props }) {
            return (
              <pre
                className={cn(
                  "rounded-lg overflow-x-auto p-4 my-3",
                  "bg-zinc-900 dark:bg-zinc-950 border border-border"
                )}
                {...props}
              >
                {children}
              </pre>
            );
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1({ children, ...props }) {
            return (
              <h1
                className="text-2xl font-bold mt-6 mb-3 text-foreground"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                className="text-xl font-semibold mt-5 mb-2 text-foreground"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3
                className="text-lg font-semibold mt-4 mb-2 text-foreground"
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4({ children, ...props }) {
            return (
              <h4
                className="text-base font-semibold mt-3 mb-1 text-foreground"
                {...props}
              >
                {children}
              </h4>
            );
          },
          h5({ children, ...props }) {
            return (
              <h5
                className="text-sm font-semibold mt-3 mb-1 text-foreground"
                {...props}
              >
                {children}
              </h5>
            );
          },
          h6({ children, ...props }) {
            return (
              <h6
                className="text-xs font-semibold mt-3 mb-1 text-foreground"
                {...props}
              >
                {children}
              </h6>
            );
          },
          strong({ children, ...props }) {
            return (
              <strong className="font-bold text-foreground" {...props}>
                {children}
              </strong>
            );
          },
          em({ children, ...props }) {
            return (
              <em className="italic text-foreground" {...props}>
                {children}
              </em>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul
                className="list-disc list-outside ml-5 my-2 space-y-1 text-foreground"
                {...props}
              >
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol
                className="list-decimal list-outside ml-5 my-2 space-y-1 text-foreground"
                {...props}
              >
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="leading-relaxed" {...props}>
                {children}
              </li>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="my-2 leading-relaxed text-foreground" {...props}>
                {children}
              </p>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className={cn(
                  "border-l-4 border-border pl-4 my-3 italic",
                  "text-muted-foreground"
                )}
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          hr({ ...props }) {
            return (
              <hr className="my-4 border-border" {...props} />
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-3">
                <table
                  className="min-w-full border-collapse border border-border text-sm"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-muted" {...props}>
                {children}
              </thead>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="border border-border px-3 py-2 text-left font-semibold text-foreground"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td
                className="border border-border px-3 py-2 text-foreground"
                {...props}
              >
                {children}
              </td>
            );
          },
          tr({ children, ...props }) {
            return (
              <tr
                className="even:bg-muted/50 transition-colors"
                {...props}
              >
                {children}
              </tr>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
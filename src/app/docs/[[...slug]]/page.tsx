import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug ? resolvedParams.slug.join('/') : null;

  let doc;
  
  if (!slugPath) {
    // Fetch the very first document as default if no slug is provided
    doc = await db.docArticle.findFirst({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });
  } else {
    doc = await db.docArticle.findUnique({
      where: { slug: slugPath, isPublished: true }
    });
  }

  if (!doc) {
    // If absolutely no docs exist
    if (!slugPath) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] text-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">مرحباً بك في مركز التوثيق</h1>
            <p className="text-muted-foreground">لا توجد مقالات منشورة حتى الآن. سيتم إضافة المحتوى قريباً.</p>
          </div>
        </div>
      );
    }
    return notFound();
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">{doc.title}</h1>
      <hr className="my-6 border-slate-200 dark:border-slate-800" />
      
      <div className="markdown-body" dir="rtl">
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <div dir="ltr" className="my-6 rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code {...props} className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 text-sm font-mono text-pink-600 dark:text-pink-400" dir="ltr">
                  {children}
                </code>
              )
            },
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-100" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b text-slate-900 dark:text-slate-100" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-900 dark:text-slate-100" {...props} />,
            p: ({node, ...props}) => <p className="leading-7 [&:not(:first-child)]:mt-6 text-slate-700 dark:text-slate-300" {...props} />,
            ul: ({node, ...props}) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
            ol: ({node, ...props}) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
            li: ({node, ...props}) => <li className="text-slate-700 dark:text-slate-300" {...props} />,
            a: ({node, ...props}) => <a className="font-medium text-primary underline underline-offset-4 hover:text-blue-600" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="mt-6 border-r-2 border-slate-300 pr-6 italic text-slate-800 dark:text-slate-200" {...props} />,
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Lesson } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, BookOpen, Calendar, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { InteractiveQuiz } from '@/components/InteractiveQuiz';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!params.id) return;

    fetchLesson();

    const channel = supabase
      .channel(`lesson_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${params.id}`,
        },
        () => {
          fetchLesson();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  const fetchLesson = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching lesson:', fetchError);
        setError('Failed to load lesson');
        return;
      }

      if (!data) {
        setError('Lesson not found');
        return;
      }

      setLesson(data);
      setError(null);

      if (data.content) {
        extractQuizQuestions(data.content);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractQuizQuestions = (content: string) => {
    const quizRegex = /###?\s*(?:Quiz|Practice Questions|Test Your Knowledge)[\s\S]*?(?=###|$)/gi;
    const match = content.match(quizRegex);

    if (match && match[0]) {
      const questions: any[] = [];
      const questionRegex = /\d+\.\s*(.+?)\n(?:[A-Da-d][.)\s](.+?)\n)+/g;
      const matchesArray = Array.from(match[0].matchAll(questionRegex));

      for (const qMatch of matchesArray) {
        const questionText = qMatch[1].trim();
        const optionMatchesArray = Array.from(qMatch[0].matchAll(/[A-Da-d][.)\s](.+)/g));
        const options = optionMatchesArray.map(m => m[1].trim());

        if (options.length > 0) {
          questions.push({
            question: questionText,
            options: options,
            correctAnswer: 0,
            explanation: 'Review the lesson content for more details.'
          });
        }
      }

      if (questions.length > 0) {
        setQuizQuestions(questions);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-pink-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-400/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 relative z-10">
          <Skeleton className="h-10 w-32 bg-white/20" />
          <Card className="backdrop-blur-xl bg-white/10 border-0">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 bg-white/20" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-3/4 bg-white/10" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-pink-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-400/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="gap-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/30">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Alert variant="destructive" className="backdrop-blur-xl bg-red-500/20 border-red-400/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Lesson not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-pink-500 to-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-400/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="gap-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/30 transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-2xl border-0 backdrop-blur-xl bg-white/10 overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 animate-pulse" />
          <CardHeader className="space-y-4 border-b border-white/20 relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <BookOpen className="h-4 w-4" />
                  <span>Lesson</span>
                </div>
                <CardTitle className="text-3xl font-bold leading-tight text-white drop-shadow-lg">
                  {lesson.title || lesson.outline}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 relative z-10">
            {lesson.status === 'generating' && (
              <Alert className="mb-6 backdrop-blur-xl bg-blue-500/20 border-blue-400/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle className="text-white">Generating Lesson</AlertTitle>
                <AlertDescription className="text-white/80">
                  Your lesson is being generated by AI. This usually takes 10-30 seconds. The page
                  will update automatically when complete.
                </AlertDescription>
              </Alert>
            )}

            {lesson.status === 'error' && (
              <Alert variant="destructive" className="mb-6 backdrop-blur-xl bg-red-500/20 border-red-400/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>
                  {lesson.error_message || 'An error occurred while generating the lesson.'}
                </AlertDescription>
              </Alert>
            )}

            {lesson.status === 'generated' && lesson.content && (
              <div className="space-y-8">
                <div className="backdrop-blur-sm bg-white/5 p-6 rounded-lg border border-white/20 animate-slide-up">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="h-5 w-5 text-cyan-300" />
                    <h3 className="text-lg font-semibold text-white">Lesson Content</h3>
                  </div>
                  <div className="prose prose-invert max-w-none prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-white/90 prose-p:text-base prose-p:leading-relaxed prose-li:text-white/90 prose-li:text-base prose-strong:text-cyan-300 prose-code:text-sm prose-code:bg-white/10 prose-code:text-cyan-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-white/20" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-xl font-bold mt-6 mb-3 text-blue-300" {...props} />
                        ),
                        code: ({ node, className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ node, ...props }) => (
                          <pre
                            className="bg-slate-900/50 backdrop-blur-sm text-slate-100 p-4 rounded-lg overflow-x-auto my-6 border border-white/10"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside space-y-2 my-4" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside space-y-2 my-4" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-cyan-500 pl-4 italic my-6 text-white/80 bg-white/5 py-2 rounded-r"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {lesson.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {quizQuestions.length > 0 && (
                  <InteractiveQuiz questions={quizQuestions} />
                )}
              </div>
            )}

            {lesson.status === 'generated' && !lesson.content && (
              <Alert className="backdrop-blur-xl bg-yellow-500/20 border-yellow-400/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-white">No Content</AlertTitle>
                <AlertDescription className="text-white/80">
                  The lesson was marked as generated but no content is available.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

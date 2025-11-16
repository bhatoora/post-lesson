'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
}

export function InteractiveQuiz({ questions }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect && !answeredQuestions.includes(currentQuestion)) {
      setScore(score + 1);
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
  };

  const isComplete = currentQuestion === questions.length - 1 && showResult;
  const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;

  return (
    <Card className="shadow-2xl border-0 backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-slide-up overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            Interactive Quiz
          </CardTitle>
          <div className="text-sm text-white/80 backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        <CardDescription className="text-white/80">
          Test your knowledge with this interactive quiz
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {!isComplete ? (
          <>
            <div className="backdrop-blur-sm bg-white/10 p-6 rounded-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === questions[currentQuestion].correctAnswer;

                  let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ';

                  if (!showResult) {
                    buttonClass += isSelected
                      ? 'border-cyan-400 bg-cyan-500/30 text-white shadow-lg scale-[1.02]'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50';
                  } else {
                    if (isCorrectAnswer) {
                      buttonClass += 'border-green-400 bg-green-500/30 text-white';
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonClass += 'border-red-400 bg-red-500/30 text-white';
                    } else {
                      buttonClass += 'border-white/20 bg-white/5 text-white/60';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isCorrectAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        )}
                        {showResult && isSelected && !isCorrectAnswer && (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {showResult && questions[currentQuestion].explanation && (
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20 animate-slide-up">
                <p className="text-sm font-semibold text-cyan-300 mb-2">Explanation:</p>
                <p className="text-white/90">{questions[currentQuestion].explanation}</p>
              </div>
            )}

            {showResult && (
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20 text-center animate-slide-up">
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-semibold text-lg">Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <XCircle className="h-6 w-6" />
                    <span className="font-semibold text-lg">Incorrect</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {!showResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="backdrop-blur-sm bg-white/10 p-8 rounded-lg border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h3>
              <div className="text-6xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
                {score} / {questions.length}
              </div>
              <p className="text-white/80 text-lg">
                {score === questions.length
                  ? 'Perfect score! Outstanding!'
                  : score >= questions.length * 0.7
                  ? 'Great job! Well done!'
                  : score >= questions.length * 0.5
                  ? 'Good effort! Keep practicing!'
                  : 'Keep learning and try again!'}
              </p>
            </div>

            <Button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Restart Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

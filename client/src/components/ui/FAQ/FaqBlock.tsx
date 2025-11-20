'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useState } from 'react';
import InlineTextEditor from '../editor/InlineTextEditor';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqBlockProps = {
  faqs: FaqItem[];
  setFaqs: (faqs: FaqItem[]) => void;
};

export default function FaqBlock({ faqs, setFaqs }: FaqBlockProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOrUpdateFaq = () => {
    const question = newQuestion.trim();
    const answer = newAnswer.trim();
    if (!question || !answer) return;

    setFaqs([...faqs, { question, answer }]);

    setNewQuestion('');
    setNewAnswer('');
    setEditingIndex(null);
  };

  const handleEditFaq = (faq: FaqItem, index: number) => {
    setNewQuestion(faq.question);
    setNewAnswer(faq.answer);
    setEditingIndex(index);

    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Typography type="text">Блок FAQ</Typography>
        <Button onClick={handleAddOrUpdateFaq}>+</Button>
      </div>
      <div className="flex flex-col gap-1">
        <Typography type="text">Питання</Typography>
        <InlineTextEditor
          onChange={(val) => setNewQuestion(val)}
          value={newQuestion}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Typography type="text">Відповідь</Typography>
        <InlineTextEditor
          onChange={(val) => setNewAnswer(val)}
          value={newAnswer}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-border text-primary px-3 py-1 rounded-full text-sm"
          >
            <span
              onClick={() => handleEditFaq(faq, idx)}
              className="cursor-pointer underline"
            >
              {faq.question}
            </span>
            <button
              onClick={() => handleRemoveFaq(idx)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

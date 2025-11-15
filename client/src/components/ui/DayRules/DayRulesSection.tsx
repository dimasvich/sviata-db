'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Typography from '../Typography';
import Input from '../Input';
import DefaultTextEditor from '../editor/DefaultTextEditor';
import { apiFetch } from '@/http/api';

interface DayRulesSectionProps {
  date: string;
  baseUrl: string;
  onInit?: (submitFn: () => Promise<void>) => void;
}

interface Rule {
  _id?: string;
  title: string;
  html: string;
}

const DayRulesSection: React.FC<DayRulesSectionProps> = ({
  date,
  baseUrl,
  onInit,
}) => {
  const [loading, setLoading] = useState(false);
  const [rule1, setRule1] = useState<Rule>({
    title: 'Що можна робити сьогоді?',
    html: '',
  });
  const [rule2, setRule2] = useState<Rule>({
    title: 'Що не можна робити сьогоді?',
    html: '',
  });

  function convertHtmlToList(html: string): string {
    if (!html) return '';

    const cleaned = html.replace(/<p>\s*<\/p>/gi, '');

    const lines = cleaned
      .split(/<br\s*\/?>|<\/p>/i)
      .map((line) =>
        line
          .replace(/<p>/gi, '')
          .replace(/&nbsp;/g, '')
          .trim(),
      )
      .filter((line) => line.length > 0);

    const listItems = lines.map((line) => {
      line = line.replace(/^–\s*/, '');
      return `<li>${line}</li>`;
    });

    return `<ul>${listItems.join('')}</ul>`;
  }
  function convertListToParagraphs(html: string): string {
    if (!html) return '';

    let cleaned = html.replace(/<\/?ul>/gi, '');
    cleaned = cleaned.replace(/<li>/gi, '<p>');
    cleaned = cleaned.replace(/<\/li>/gi, '</p>');
    cleaned = cleaned.replace(/^–\s*/gm, '');
    cleaned = cleaned.replace(/&nbsp;/g, ' ');

    return cleaned.trim();
  }
  useEffect(() => {
    const fetchRules = async () => {
      if (!date) return;
      setLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}/api/day-rules/${date}`);
        if (res.ok) {
          const json = await res.json();
          setRule1({
            _id: json[0]?._id,
            title: json[0]?.title || 'Що можна робити сьогодні?',
            html: convertListToParagraphs(json[0]?.html) || '',
          });
          setRule2({
            _id: json[1]?._id,
            title: json[1]?.title || 'Що не можна робити сьогодні?',
            html: convertListToParagraphs(json[1]?.html) || '',
          });
        }
      } catch (err) {
        console.error('Помилка при завантаженні правил:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [date, baseUrl]);

  const handleSubmitRules = useCallback(async () => {
    if (!date) return;

    const requests = [];

    if (rule1.title && rule1.html.trim()) {
      requests.push({
        title: rule1.title,
        html: convertHtmlToList(rule1.html),
        date,
        id: rule1._id,
      });
    }

    if (rule2.title && rule2.html.trim()) {
      requests.push({
        title: rule2.title,
        html: convertHtmlToList(rule2.html),
        date,
        id: rule2._id,
      });
    }

    setLoading(true);
    try {
      for (const req of requests) {
        const method = req.id ? 'PUT' : 'POST';
        const url = req.id
          ? `${baseUrl}/api/day-rules/${req.id}`
          : `${baseUrl}/api/day-rules`;

        await apiFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [rule1, rule2, date, baseUrl]);

  useEffect(() => {
    if (onInit) {
      onInit(handleSubmitRules);
    }
  }, [onInit, handleSubmitRules]);

  if (loading) return <div>⏳ Завантаження правил...</div>;

  return (
    <div className="w-full flex flex-col gap-6">
      <Typography type="title">Що не/можна робити</Typography>

      {/* --- Rule 1 --- */}
      <div className="flex flex-col gap-2 w-full">
        <Input
          id="rule1-title"
          label="Заголовок"
          value={rule1.title}
          onChange={(e) => setRule1({ ...rule1, title: e.target.value })}
        />
        <DefaultTextEditor
          value={rule1.html}
          onChange={(val) =>
            setRule1({ ...rule1, html: val.replaceAll('<p></p>', '') })
          }
        />
      </div>

      {/* --- Rule 2 --- */}
      <div className="flex flex-col gap-2 w-full">
        <Input
          id="rule2-title"
          label="Заголовок"
          value={rule2.title}
          onChange={(e) => setRule2({ ...rule2, title: e.target.value })}
        />
        <DefaultTextEditor
          value={rule2.html}
          onChange={(val) =>
            setRule2({ ...rule2, html: val.replaceAll('<p></p>', '') })
          }
        />
      </div>
    </div>
  );
};

export default DayRulesSection;

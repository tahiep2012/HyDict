import React from 'react';
import { Button } from '@/components/ui';
import { BookOpen, Check, AlertCircle } from 'lucide-react';
import { AnkiNoteFields } from '../types';
import { useAnkiConnect } from '../hooks/useAnkiConnect';

export interface AddToAnkiButtonProps {
  fields: AnkiNoteFields;
  onSuccess?: () => void;
  className?: string;
}

export const AddToAnkiButton: React.FC<AddToAnkiButtonProps> = ({
  fields,
  onSuccess,
  className = '',
}) => {
  const { status, addCard } = useAnkiConnect();

  const handleClick = async () => {
    const success = await addCard(fields);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  if (status === 'success') {
    return (
      <Button variant="success" size="sm" className={className} disabled>
        <Check className="w-3.5 h-3.5 text-white" />
        <span>Đã thêm vào Anki</span>
      </Button>
    );
  }

  if (status === 'error') {
    return (
      <Button
        variant="danger"
        size="sm"
        className={className}
        onClick={handleClick}
        title="Bấm để thử lại"
      >
        <AlertCircle className="w-3.5 h-3.5 text-white" />
        <span>Thử lại</span>
      </Button>
    );
  }

  return (
    <Button
      variant="success"
      size="sm"
      className={className}
      isLoading={status === 'adding'}
      onClick={handleClick}
    >
      <BookOpen className="w-3.5 h-3.5" />
      <span>Thêm vào Anki</span>
    </Button>
  );
};

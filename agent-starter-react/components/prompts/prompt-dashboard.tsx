'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreatePrompt,
  useDeletePrompt,
  usePrompts,
  useUpdatePrompt,
} from '../../hooks/usePrompts';
import { Prompt, PromptFormData, promptFormSchema } from '../../lib/types/prompt';
import { Button } from '../livekit/button';

interface PromptDashboardProps {
  className?: string;
}

export function PromptDashboard({ className }: PromptDashboardProps) {
  const [search, setSearch] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { data: prompts, isLoading } = usePrompts(search);
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const watchedTags = watch('tags');

  const onSubmit = async (data: PromptFormData) => {
    try {
      if (isCreating) {
        await createPrompt.mutateAsync(data);
        setIsCreating(false);
      } else if (editingPrompt) {
        await updatePrompt.mutateAsync({
          id: editingPrompt.id,
          data,
        });
        setEditingPrompt(null);
      }
      reset();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await deletePrompt.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    reset({
      title: prompt.title,
      body: prompt.body,
      tags: prompt.tags,
    });
  };

  const cancelEdit = () => {
    setEditingPrompt(null);
    setIsCreating(false);
    reset();
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim()) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <p className="text-muted-foreground">Manage your AI agent prompts</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Create Prompt</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus:ring-primary flex-1 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingPrompt) && (
        <div className="bg-muted/50 space-y-4 rounded-lg p-6">
          <h3 className="text-lg font-semibold">
            {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter prompt title..."
                  />
                )}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Body</label>
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className={`focus:ring-primary h-32 w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.body ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter prompt content..."
                  />
                )}
              />
              {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tags</label>
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="focus:ring-primary flex-1 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                  placeholder="Add a tag..."
                  disabled={watchedTags.length >= 10}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  disabled={
                    !tagInput.trim() ||
                    watchedTags.includes(tagInput.trim()) ||
                    watchedTags.length >= 10
                  }
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isCreating ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Prompts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">Loading prompts...</div>
        ) : prompts?.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            {search ? 'No prompts found' : 'No prompts created yet'}
          </div>
        ) : (
          prompts?.map((prompt) => (
            <div key={prompt.id} className="bg-card space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{prompt.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Version {prompt.version} • Created{' '}
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(prompt)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prompt.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm whitespace-pre-wrap">{prompt.body}</p>
              </div>

              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag: string) => (
                    <span key={tag} className="bg-muted rounded-md px-2 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

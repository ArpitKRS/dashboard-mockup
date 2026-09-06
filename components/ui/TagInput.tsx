"use client";

import { useState } from "react";
import { X } from "lucide-react";

/**
 * Copied verbatim from osmosis/components/ui/TagInput.tsx: a free-text chip
 * field, generic and self-contained.
 */

interface TagInputProps {
    value: string[]
    onChange: (value: string[]) => void
    /** Used for the input's accessible name; render your own visible label. */
    label: string
    placeholder?: string
    /** Most chips allowed. The box stops accepting words once reached. */
    max?: number
    disabled?: boolean
    id?: string
    className?: string
}

export default function TagInput({
    value,
    onChange,
    label,
    placeholder = 'Enter Keywords and hit [Enter] key',
    max = 25,
    disabled = false,
    id,
    className = '',
}: TagInputProps) {
    const [draft, setDraft] = useState('')

    const atLimit = value.length >= max

    const addTag = () => {
        const tag = draft.trim()
        if (!tag || atLimit) return
        // Case-insensitive: "Remote" and "remote" are the same topic.
        if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
            setDraft('')
            return
        }
        onChange([...value, tag])
        setDraft('')
    }

    const removeTag = (tag: string) => {
        onChange(value.filter((existing) => existing !== tag))
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // Enter belongs to the chip field, not to the form around it.
            event.preventDefault()
            addTag()
            return
        }
        // Backspace on an empty box takes the previous chip back.
        if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div className={className}>
            <input
                id={id}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={atLimit ? `Up to ${max} keywords` : placeholder}
                disabled={disabled || atLimit}
                aria-label={label}
                className="w-full rounded-md border border-pod-border bg-pod-bg-soft px-4 py-2.5 text-sm text-pod-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-pod-primary disabled:cursor-not-allowed disabled:opacity-60"
            />

            {value.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <li key={tag}>
                            <span className="inline-flex items-center gap-2 rounded-md bg-pod-primary-medium px-3 py-1.5 text-sm font-medium text-pod-text">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    disabled={disabled}
                                    aria-label={`Remove ${tag}`}
                                    className="text-pod-muted transition hover:text-pod-text disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <X aria-hidden className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

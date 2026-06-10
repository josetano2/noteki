import { useGeneration } from '@/context/GenerationContext'
import { MOCK_NOTE_CONTENT } from '@/lib/mock-data'

export function NoteEditor() {
  const { noteContent, setNoteContent } = useGeneration()

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder={MOCK_NOTE_CONTENT}
        spellCheck={false}
        className="flex-1 w-full resize-none bg-transparent text-foreground font-mono text-sm leading-relaxed p-4 outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  )
}

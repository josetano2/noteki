import { NoteEditor } from '@/components/editor/NoteEditor'
import { RightPanel } from '@/components/editor/RightPanel'

export function MainView() {
  return (
    <div className="flex h-full">
      <div className="flex-[3] min-w-0 overflow-hidden">
        <NoteEditor />
      </div>
      <div className="flex-[2] min-w-0 overflow-hidden">
        <RightPanel />
      </div>
    </div>
  )
}

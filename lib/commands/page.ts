import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { CoreState } from '../state/types'
import { addNewTask } from './editor'
import { hideProfile } from './mode'

type Pages = CoreState['workspace']['page']

export function switchToPage(core: Core, target: Pages) {
  core.mutateWs((ws) => {
    ws.page = target
  })

  // some handlers
  if (target == 'editor') {
    resetQuestView(core)
    core.mutateWs(({ quest, ui, editor }) => {
      quest.title = core.strings.editor.title
      quest.description = core.strings.editor.description
      quest.tasks = []
      ui.isHighlightDescription = false
      quest.id = -1
      editor.editOptions = 'all'
      editor.saveProgram = true
    })

    submit_event('show_editor', core)
    addNewTask(core)
  }

  if (target == 'overview') {
    hideProfile(core)
    const hash = window.location.hash.toUpperCase()
    if (hash == '#DEMO') {
      switchToPage(core, 'demo')
    }
  }
}

function resetQuestView(core: Core) {
  // run this function for all quest views
  core.mutateWs((ws) => {
    ws.code = ''
    ws.ui.showOutput = false
    ws.ui.isAlreadyCompleted = false
    ws.ui.controlBarShowFinishQuest = false
    ws.ui.errorMessages = []
    ws.ui.isTesting = false
  })
}

import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { loadProject } from './load'

export async function initClient(core: Core) {
  const parameterList = new URLSearchParams(window.location.search)

  const id = parameterList.get('id')

  if (id) {
    core.mutateWs(({ ui }) => {
      ui.editorLoading = true
      ui.showQuestOverview = false
      ui.isImportedProject = true
    })
    loadProject(core, id)
  }

  if (core.ws.ui.showQuestOverview) {
    submit_event('show_overview', core)
  }

  const editor = parameterList.get('editor')

  if (editor) {
    core.mutateWs(({ ui, quest }) => {
      ui.isEditor = true
      ui.showQuestOverview = false
      quest.title = 'Titel der Aufgabe'
      quest.description = 'Hier kommt die Beschreibung ...'
    })
  }

  core.mutateWs(({ ui }) => {
    ui.clientInitDone = true
  })
}

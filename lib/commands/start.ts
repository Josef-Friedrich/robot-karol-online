import { sliderToDelay } from '../helper/speedSlider'
import { Core } from '../state/core'
import { runTask, closeOutput, startTesting, restartProgram } from './quest'
import { abort } from './vm'

export function startButtonClicked(core: Core) {
  if (core.ws.editor.editWorld !== null && core.ws.ui.state == 'ready') {
    if (core.ws.editor.showWorldPreview) {
      alert('Bitte wähle Start- oder Zielwelt aus.')
      return
    }
    runTask(core, core.ws.editor.editWorld)
    closeOutput(core)
    return
  }

  if (core.ws.ui.isTesting && core.ws.ui.state == 'ready') {
    startTesting(core)
    return
  }
  if (!core.ws.ui.showOutput && core.ws.ui.state == 'ready') {
    if (core.ws.ui.isPlayground) {
      runTask(core, 0)
    } else {
      startTesting(core)
    }
    return
  }

  if (core.ws.ui.state == 'running') {
    if (core.ws.vm.isDebugging) {
      core.mutateWs((ws) => {
        ws.vm.isDebugging = false
        ws.vm.startTime =
          Date.now() - (ws.vm.steps + 1) * sliderToDelay(ws.ui.speedSliderValue)
      })
    } else {
      abort(core)
      return
    }
  }

  if (core.ws.ui.showOutput && core.ws.ui.state == 'ready') {
    restartProgram(core)
  }
}

import {
  faCaretRight,
  faCode,
  faDownload,
  faExclamationTriangle,
  faLock,
  faPencil,
  faPlay,
  faPuzzlePiece,
  faQuestionCircle,
  faStop,
  faWarning,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { closeHighlightDescription, setMode } from '../../lib/commands/mode'
import { restartProgram, startTesting } from '../../lib/commands/quest'
import { useCore } from '../../lib/state/core'
import { EditArea } from './EditArea'
import { FaIcon } from '../helper/FaIcon'
import { Output } from './Output'
import { Structogram } from './Structogram'
import { Tasks } from './Tasks'
import { WorldEditor } from './WorldEditor'
import { HFullStyles } from '../helper/HFullStyles'
import { abort } from '../../lib/commands/vm'
import { showModal } from '../../lib/commands/modal'
import { useEffect, useState } from 'react'
import { JavaInfo } from './JavaInfo'
import { showJavaInfo, setLanguage } from '../../lib/commands/language'
import { Settings } from '../../lib/state/types'

export function IdeMain() {
  const core = useCore()

  const [toH, setToH] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const skipWait = core.ws.quest.description.length < 100

    core.mutateWs((ws) => {
      ws.ui.showOk = skipWait
    })

    function test() {
      const el = document.getElementById('progress-bar')
      if (el) {
        el.style.width = '0%'
        el.style.backgroundColor = '#a21caf'
        setToH(
          setTimeout(
            () => {
              core.mutateWs((ws) => {
                ws.ui.showOk = true
              })
            },
            skipWait ? 0 : 5000
          )
        )
      } else {
        setTimeout(test, 10)
      }
    }

    if (core.ws.ui.isHighlightDescription && !core.ws.ui.showOk) {
      test()
    }
  }, [core, core.ws.ui.isHighlightDescription])

  return (
    <>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement
          className="h-full !overflow-hidden relative"
          minSize={0}
          onResize={() => {
            if (core.blockyResize) {
              core.blockyResize()
            }
          }}
        >
          {core.ws.ui.isHighlightDescription && (
            <div
              className="fixed inset-0 bg-black/30 z-[200]"
              onClick={() => {
                if (!core.ws.ui.showOk && toH !== null) {
                  clearTimeout(toH)
                }
                closeHighlightDescription(core)
              }}
            ></div>
          )}
          <div className="h-full flex flex-col">
            <div className="flex-none h-8 bg-gray-50 flex justify-center items-start relative">
              <div className="absolute left-1 top-0.5">
                <button
                  className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 hover:text-black"
                  onClick={() => {
                    // 3. Create a Blob from the string
                    const blob = new Blob(
                      [
                        core.ws.settings.language == 'robot karol'
                          ? core.ws.code
                          : core.ws.settings.language == 'python'
                          ? core.ws.pythonCode
                          : core.ws.javaCode,
                      ],
                      {
                        type: 'text/plain',
                      }
                    )

                    // 4. Create a URL for the Blob
                    const url = window.URL.createObjectURL(blob)

                    // 5. Create an anchor element for the download link
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${new Date()
                      .toISOString()
                      .substring(0, 10)}-robot-karol.${
                      core.ws.settings.language == 'robot karol'
                        ? 'txt'
                        : core.ws.settings.language == 'python'
                        ? 'py.txt'
                        : 'java.txt'
                    }` // specify the filename

                    // 6. Simulate a click on the anchor element to trigger the download
                    a.click()

                    // 7. Clean up by revoking the Blob URL
                    window.URL.revokeObjectURL(url)
                  }}
                >
                  <FaIcon icon={faDownload} className="mr-1" />{' '}
                  {core.strings.ide.save}
                </button>
              </div>
              {core.ws.ui.lockLanguage ? (
                <span></span>
              ) : (
                <button
                  className={clsx(
                    'ml-4 mr-4 border-t-4 px-3  pb-1 z-10',
                    core.ws.settings.mode == 'blocks'
                      ? 'border-t-blue-500'
                      : 'border-t-transparent',
                    core.ws.settings.mode == 'code' &&
                      (core.ws.ui.state === 'error' ||
                        core.ws.ui.state === 'running' ||
                        core.ws.ui.toBlockWarning ||
                        core.ws.quest.testerHandler ||
                        core.ws.ui.proMode) &&
                      'text-gray-400',
                    core.ws.settings.mode == 'code' &&
                      core.ws.ui.state == 'ready' &&
                      !core.ws.ui.toBlockWarning &&
                      !core.ws.quest.testerHandler &&
                      !core.ws.ui.proMode
                      ? 'hover:border-t-gray-300 hover:bg-gray-200'
                      : 'cursor-default'
                  )}
                  onClick={() => {
                    setMode(core, 'blocks')
                  }}
                >
                  <FaIcon icon={faPuzzlePiece} className="mr-3" />
                  {core.strings.ide.blocks}
                </button>
              )}
              <button
                className={clsx(
                  'border-t-4 px-3 pb-1 z-10',
                  core.ws.settings.mode == 'code'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent',
                  core.ws.settings.mode == 'blocks' &&
                    (core.ws.ui.state !== 'ready' ||
                      core.ws.quest.testerHandler) &&
                    'text-gray-400 cursor-default',
                  core.ws.settings.mode == 'blocks' &&
                    core.ws.ui.state == 'ready' &&
                    !core.ws.quest.testerHandler
                    ? 'hover:bg-gray-200 hover:border-t-gray-300'
                    : 'cursor-default'
                )}
                onClick={() => {
                  setMode(core, 'code')
                }}
              >
                <FaIcon icon={faCode} className="mr-3" />
                Code
              </button>
              {core.ws.settings.lng == 'de' &&
                core.ws.settings.mode === 'code' && (
                  <div className="absolute right-0 top-0 z-0">
                    {core.ws.ui.proMode ? (
                      <div
                        className={clsx(
                          'px-2 py-1 bg-yellow-200 rounded pl-2',
                          core.ws.ui.state !== 'ready' && 'pointer-events-none'
                          // core.ws.ui.state == 'error' && 'invisible',
                          // core.ws.ui.state == 'running' && 'invisible'
                        )}
                      >
                        {core.ws.ui.lockLanguage ? (
                          <FaIcon icon={faLock} />
                        ) : (
                          <button
                            onClick={() => {
                              showJavaInfo(core)
                            }}
                          >
                            <FaIcon icon={faQuestionCircle} />
                          </button>
                        )}{' '}
                        Java Profi-Modus (im Aufbau)
                      </div>
                    ) : (
                      <div
                        className={clsx(
                          'p-1 bg-gray-200 rounded pl-2',
                          core.ws.ui.state !== 'ready' && 'pointer-events-none'
                          // core.ws.ui.state == 'error' && 'invisible',
                          // core.ws.ui.state == 'running' && 'invisible'
                        )}
                      >
                        {core.ws.ui.lockLanguage ? (
                          <FaIcon icon={faLock} />
                        ) : (
                          <button
                            onClick={() => {
                              showJavaInfo(core)
                            }}
                          >
                            <FaIcon icon={faQuestionCircle} />
                          </button>
                        )}{' '}
                        {core.strings.ide.language}:
                        <select
                          className="px-1 py-0.5 inline-block ml-2 bg-white rounded hover:bg-gray-100 cursor-pointer"
                          value={core.ws.settings.language}
                          onChange={(e) => {
                            setLanguage(
                              core,
                              e.target.value as Settings['language']
                            )
                          }}
                          disabled={
                            core.ws.ui.state !== 'ready' ||
                            !!core.ws.ui.lockLanguage
                          }
                        >
                          <option value="robot karol">Robot Karol</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>{' '}
                      </div>
                    )}
                  </div>
                )}
            </div>
            {!(
              core.ws.ui.isTesting &&
              core.ws.ui.state == 'ready' &&
              core.ws.quest.testerHandler
            ) &&
              !(
                core.ws.ui.isEndOfRun && core.ws.ui.controlBarShowFinishQuest
              ) &&
              !core.ws.ui.isHighlightDescription &&
              core.ws.modal !== 'name' && (
                <div className="absolute top-10 right-4 z-[101]">
                  {core.ws.ui.state == 'error' &&
                    core.ws.settings.mode == 'blocks' && (
                      <button
                        className="mr-3 bg-red-300 px-1.5 py-0.5 rounded"
                        onClick={() => {
                          showModal(core, 'error')
                        }}
                      >
                        <FaIcon icon={faExclamationTriangle} />
                        <span className="inline-block rounded-full bg-red-500 text-white w-6 ml-2 my-1">
                          {core.ws.ui.errorMessages.length}
                        </span>
                      </button>
                    )}
                  <button
                    className={clsx(
                      'rounded px-6 pt-1 pb-2 transition-colors',
                      core.ws.ui.state == 'ready' &&
                        'bg-green-300 hover:bg-green-400',
                      core.ws.ui.state == 'running' &&
                        'bg-yellow-500 hover:bg-yellow-600',
                      (core.ws.ui.state == 'error' ||
                        core.ws.ui.state == 'loading') &&
                        'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                    onClick={() => {
                      if (core.ws.ui.isTesting && core.ws.ui.state == 'ready') {
                        startTesting(core)
                        return
                      }
                      if (
                        !core.ws.ui.showOutput &&
                        core.ws.ui.state == 'ready'
                      ) {
                        startTesting(core)
                        return
                      }

                      if (core.ws.ui.state == 'running') {
                        abort(core)
                        return
                      }

                      if (
                        core.ws.ui.showOutput &&
                        core.ws.ui.state == 'ready'
                      ) {
                        restartProgram(core)
                      }
                    }}
                  >
                    <FaIcon
                      icon={core.ws.ui.state == 'running' ? faStop : faPlay}
                      className="mr-1"
                    />
                    <span className="text-xl">
                      {core.ws.ui.state == 'running'
                        ? core.strings.ide.stop
                        : core.strings.ide.start}
                    </span>
                  </button>
                </div>
              )}
            <EditArea />
          </div>
          {core.ws.ui.isHighlightDescription && (
            <span>
              <div
                className={clsx(
                  'absolute right-4 top-10 p-2 bg-white z-[300] rounded'
                )}
              >
                <p>{core.strings.ide.read}</p>
                <p className="text-center mt-2">
                  <button
                    onClick={() => {
                      closeHighlightDescription(core)
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded bg-green-200 hover:bg-green-300 transition-colors disabled:bg-gray-200'
                    )}
                    disabled={!core.ws.ui.showOk}
                  >
                    OK
                  </button>
                </p>
              </div>
              <div
                className={clsx(
                  'absolute right-0.5 top-10 text-white text-3xl z-[300]'
                )}
              >
                <FaIcon icon={faCaretRight} />
              </div>
            </span>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 6 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={0}>
          {core.ws.ui.showJavaInfo ? (
            <JavaInfo />
          ) : core.ws.ui.showOutput ? (
            <Output />
          ) : core.ws.ui.showStructogram ? (
            <Structogram />
          ) : core.ws.editor.editWorld !== null ? (
            <WorldEditor />
          ) : (
            <Tasks />
          )}
        </ReflexElement>
      </ReflexContainer>
      <HFullStyles />
    </>
  )
}

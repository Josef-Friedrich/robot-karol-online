import { faPencil } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { editCodeAndResetProgress, setMode } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { ErrorModal } from './ErrorModal'
import { FaIcon } from './FaIcon'
import { OptionsModal } from './OptionsModal'
import { Output } from './Output'
import { ResizeWorldModal } from './ResizeWorldModal'
import { ShareModal } from './ShareModal'
import { Structogram } from './Structogram'
import { Tasks } from './Tasks'
import { WorldEditor } from './WorldEditor'

export function Quest() {
  const core = useCore()

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
          <div className="h-full flex flex-col">
            <div className="flex-none h-8 bg-gray-50 flex justify-start items-start">
              <button
                className={clsx(
                  'ml-4 mr-6 border-t-4',
                  core.ws.settings.mode == 'blocks'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent'
                )}
                onClick={() => {
                  setMode(core, 'blocks')
                }}
              >
                Block-Editor
              </button>
              <button
                className={clsx(
                  'border-t-4',
                  core.ws.settings.mode == 'code'
                    ? 'border-t-blue-500'
                    : 'border-t-transparent'
                )}
                onClick={() => {
                  setMode(core, 'code')
                }}
              >
                Text-Editor
              </button>
              {window.location.hostname == 'localhost' &&
                !core.ws.ui.isEditor && (
                  <a
                    href={`/?editor=1&quest=${core.ws.quest.id}`}
                    className="underline text-gray-300 hover:text-gray-400 ml-8 mt-1"
                  >
                    in Aufgaben-Editor öffnen
                  </a>
                )}
            </div>
            <EditArea />
          </div>
          {(core.ws.ui.isTesting || core.ws.ui.isAlreadyCompleted) && (
            <div className="absolute inset-0 bg-gray-700/20 z-[100]">
              <div
                className={clsx(
                  'bottom-6 left-6 right-6 absolute',
                  'rounded-lg pl-4 bg-gray-200',
                  core.ws.ui.isAlreadyCompleted
                    ? 'h-28 pt-3 flex justify-around flex-col'
                    : 'h-10 pt-2'
                )}
              >
                <p className="ml-2">
                  {core.ws.ui.isAlreadyCompleted
                    ? 'Dein Programm wurde erfolgreich überprüft.'
                    : 'Dein Programm wird gerade überprüft und kann nicht bearbeitet werden.'}
                </p>
                {core.ws.ui.isAlreadyCompleted && (
                  <p className="mb-3">
                    <button
                      className="px-2 py-0.5 bg-gray-300 rounded"
                      onClick={() => {
                        editCodeAndResetProgress(core)
                      }}
                    >
                      <FaIcon icon={faPencil} className="mr-2" /> Programm
                      bearbeiten
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </ReflexElement>

        <ReflexSplitter
          style={{ width: 6 }}
          className="!bg-gray-300 !border-0 hover:!bg-blue-400 active:!bg-blue-400"
        />

        <ReflexElement minSize={0}>
          {core.ws.ui.showOutput ? (
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
      {core.ws.ui.showMenu && <OptionsModal />}
      {core.ws.ui.showErrorModal && <ErrorModal />}
      {core.ws.editor.showResizeWorld && <ResizeWorldModal />}
      {core.ws.editor.showShareModal && <ShareModal />}
    </>
  )
}

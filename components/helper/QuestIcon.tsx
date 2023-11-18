import clsx from 'clsx'
import { FaIcon } from './FaIcon'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { View } from './View'
import { useCore } from '../../lib/state/core'
import { Heading } from '../../lib/state/types'
import { Rating } from 'react-simple-star-rating'

interface QuestIconProps {
  title: string
  x: number
  y: number
  solved: boolean
  id: number
  dir?: Heading
  onClick: () => void
}

export function QuestIcon({
  title,
  x,
  y,
  solved,
  id,
  onClick,
  dir,
}: QuestIconProps) {
  const core = useCore()
  return (
    <div
      className={clsx(
        'flex items-center flex-col w-[64px] cursor-pointer group absolute pointer-events-none',
        (solved || core.ws.page == 'analyze') && 'pt-5'
      )}
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClick}
      key={title}
    >
      <button className="text-lg bg-gray-100/70 px-1 py-0.5 rounded group-hover:bg-white/80 pointer-events-auto whitespace-nowrap -ml-2">
        {title}
      </button>
      {solved || core.ws.page == 'analyze' ? (
        <div className="w-16 pt-3 flex justify-center items-center">
          <div className="bg-green-100 rounded-full w-6 h-6 pointer-events-auto mr-3">
            <FaIcon icon={faCheck} className="ml-[5px] text-green-500" />
          </div>
        </div>
      ) : (
        <View
          appearance={core.ws.appearance}
          world={{
            dimX: 1,
            dimY: 1,
            karol: {
              x: 0,
              y: 0,
              dir: dir == 'west' ? 'east' : dir ?? 'east',
            },
            blocks: [[false]],
            marks: [[false]],
            bricks: [[0]],
            height: 1,
          }}
          hideWorld
          className={clsx(
            'pointer-events-auto -mt-2',
            dir == 'south' && '-translate-x-3',
            dir == 'west' && '-scale-x-100 -translate-x-3'
          )}
        />
      )}
      {core.ws.page == 'analyze' && (
        <div className="whitespace-nowrap text-xs">
          {(() => {
            const entry = core.ws.analyze.quests[id]
            if (id == 1 && entry) {
              return <span>{entry.complete} Spieler*innen</span>
            }
            if (entry) {
              return (
                <span>
                  {entry.complete} /{' '}
                  <strong>
                    {Math.round((entry.complete / entry.reachable) * 100)}%
                  </strong>
                </span>
              )
            }
            return null
          })()}
          {/*<div
            className="[&>span]:align-[2px] pointer-events-auto"
            title={`${
              core.ws.analyze.ratings[id]?.values.filter((x) => x == 1)
                .length ?? 0
            } / ${
              core.ws.analyze.ratings[id]?.values.filter((x) => x == 2)
                .length ?? 0
            } / ${
              core.ws.analyze.ratings[id]?.values.filter((x) => x == 3)
                .length ?? 0
            } / ${
              core.ws.analyze.ratings[id]?.values.filter((x) => x == 4)
                .length ?? 0
            } / ${
              core.ws.analyze.ratings[id]?.values.filter((x) => x == 5)
                .length ?? 0
            }`}
          >
            <Rating
              SVGclassName="inline"
              readonly
              allowFraction
              initialValue={core.ws.analyze.ratings[id]?.average ?? 0}
              size={16}
            />{' '}
            <small className="inline-block">
              {Math.round(core.ws.analyze.ratings[id]?.average * 10) / 10} /{' '}
              {core.ws.analyze.ratings[id]?.count ?? 0} Bew.
            </small>
          </div>*/}
        </div>
      )}
    </div>
  )
}

import React, { type MouseEvent, useEffect, useRef, useState, type ReactElement } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions'

interface PlayerProps {
  audioLink: string
  title: string
}

const Player: React.FC<PlayerProps> = ({ audioLink, title }) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [leftHandleTime, setLeftHandleTime] = useState<number | null>(null)
  const [rightHandleTime, setRightHandleTime] = useState<number | null>(null)

  const [activeRegion, setActiveRegion] = useState<Region | null>(null)

  const el = useRef<HTMLDivElement | null>(null)

  /**
     * @see https://github.com/katspaugh/wavesurfer.js/blob/master/example/main.js
     */
  useEffect(() => {
    if (el.current != null) {
      const _wavesurfer = WaveSurfer.create({
        barWidth: 1,
        barHeight: 1,
        cursorWidth: 1,
        container: el.current,
        height: 100,
        progressColor: '#fff',
        waveColor: 'rgba(255,255,255,.38',
        cursorColor: '#fff',
        normalize: true
      })
      void _wavesurfer.load(audioLink)
      if (_wavesurfer != null) {
        setWavesurfer(_wavesurfer)
      }

      // Create regions
      const wsRegions = _wavesurfer.registerPlugin(RegionsPlugin.create())

      // Give regions a random color when they are created
      const random = (min: number, max: number): number => Math.random() * (max - min) + min
      const randomColor = (): string => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

      // Sets an initial duration when audio has loaded
      _wavesurfer.once('ready', () => {
        setDuration(_wavesurfer?.getDuration())
        setPlaying(true)

        // Initialize region
        const loopedRegion = wsRegions.addRegion({
          start: 0,
          end: _wavesurfer.getDuration(),
          color: randomColor()
        })
        setActiveRegion(loopedRegion)
      })

      // Updates time
      _wavesurfer.on('audioprocess', () => {
        setDuration(_wavesurfer?.getDuration() - _wavesurfer?.getCurrentTime())
      })
      // Update state when handles are updated
      wsRegions.on('region-updated', (region) => {
        if (region != null) {
          setLeftHandleTime(region.start)
          setRightHandleTime(region.end)
        }
      })

      // // Resets when finished playing
      // _wavesurfer.on('finish', function () {
      //   _wavesurfer.stop()
      //   setPlaying(false)
      //   setDuration(_wavesurfer?.getDuration())
      // })

      return () => {
        _wavesurfer.unAll()
        _wavesurfer.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (wavesurfer != null && activeRegion != null) {
      // eslint-disable-next-line
      wavesurfer.un('timeupdate')

      wavesurfer.on('timeupdate', (currentTime) => {
        if (wavesurfer.isPlaying() && currentTime >= activeRegion.end) {
          wavesurfer.seekTo(activeRegion.start / wavesurfer.getDuration())
        }
      })
    }
  }, [wavesurfer, activeRegion])

  useEffect(() => {
    console.log(leftHandleTime, rightHandleTime)
  }, [leftHandleTime, rightHandleTime])

  const handlePlay = (): void => {
    setPlaying(!playing)
    if (wavesurfer != null) {
      void wavesurfer.playPause()
    }
  }

  return (
    <div className="container">
      <h1 className="text-center text-2xl my-4">{title}</h1>
      <div className=" rounded-md bg-green-600 p-3">
        <div className="flex items-center flex-1">
          <PlayPauseButton onClick={handlePlay} playing={playing} />
          <div className="flex-1 ml-2" ref={el} />
        </div>
        <div className="pl-12">
          <span style={{ color: 'rgba(255,255,255,.38' }} className="text-sm">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Player

interface PlayPauseButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  playing: boolean
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ onClick, playing }): ReactElement => {
  return (
      <button
        style={{ background: 'rgba(255,255,255,.38' }}
        onClick={onClick}
        className="h-10 w-10 rounded-full bg-white/[0.3] hover:bg-white/[0.4] flex items-center justify-center cursor-pointer"
      >
        {playing ? <PlayIcon /> : <PauseIcon />}
      </button>
  )
}

const PlayIcon: React.FC = (): ReactElement => {
  return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 35.713 39.635"
      >
        <path
          d="M14.577.874C11-1.176,8.107.5,8.107,4.621V35.01c0,4.122,2.9,5.8,6.47,3.751L41.139,23.529c3.575-2.05,3.575-5.372,0-7.422Z"
          transform="translate(-8.107 0)"
          fill="#f7f7f7"
        />
      </svg>
  )
}

const PauseIcon: React.FC = (): ReactElement => {
  return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 33.025 39.63"
      >
        <g transform="translate(-42.667)">
          <g transform="translate(42.667)">
            <g transform="translate(0)">
              <path
                d="M53.4,0H45.144a2.48,2.48,0,0,0-2.477,2.477V37.153a2.48,2.48,0,0,0,2.477,2.477H53.4a2.48,2.48,0,0,0,2.477-2.477V2.477A2.48,2.48,0,0,0,53.4,0Z"
                transform="translate(-42.667)"
                fill="#f7f7f7"
              />
            </g>
          </g>
          <g transform="translate(62.482)">
            <g>
              <path
                d="M309.4,0h-8.256a2.48,2.48,0,0,0-2.477,2.477V37.153a2.48,2.48,0,0,0,2.477,2.477H309.4a2.48,2.48,0,0,0,2.477-2.477V2.477A2.48,2.48,0,0,0,309.4,0Z"
                transform="translate(-298.667)"
                fill="#f7f7f7"
              />
            </g>
          </g>
        </g>
      </svg>
  )
}

const formatTime = (_seconds: number): string => {
  const minutes = Math.floor(_seconds / 60)
  const minutesString = (minutes >= 10) ? String(minutes) : '0' + String(minutes)
  const seconds = Math.floor(_seconds % 60)
  const output = minutes + seconds >= 10 ? String(seconds) : '0' + String(seconds)
  return minutesString + ':' + output
}

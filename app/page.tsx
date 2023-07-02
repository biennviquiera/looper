/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import Layout from './layout'
import React, { useEffect, useState, useRef } from 'react'
import './globals.css'
import Player from './components/WaveSurferPlayer'

export default function Home () {
  const [audioFile, setAudioFile] = useState<string | undefined>(undefined)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('None')

  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [selectedRange, setSelectedRange] = useState<number[]>([0, 0])

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((event.target.files?.[0]) != null) {
      event.preventDefault()
      setSelectedFile(event.target.files[0])
      setFileName(event.target.files[0].name)
      setAudioFile(URL.createObjectURL(event.target.files[0]))
    }
  }

  const regionUpdatedHandler = (start: number, end: number) => {
    setSelectedRange([start, end])
  }

  const fileUploadHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const formData = new FormData()
    if (selectedFile != null) {
      formData.append('myFile', selectedFile, selectedFile.name)
      formData.append('startTime', selectedRange[0].toString())
      // offset used for delay in loop
      const offset = 0.08
      formData.append('endTime', (selectedRange[1] + offset).toString())
      console.log(...formData)
      // Used for sending to loop
      const res = fetch('http://localhost:3001/api/loop', {
        method: 'POST',
        body: formData
      })
    }
  }

  // ref for keeping track of current range
  const selectedRangeRef = useRef(selectedRange)
  useEffect(() => {
    selectedRangeRef.current = selectedRange
  }, [selectedRange])

  useEffect(() => {
    if (audioElement.current != null) {
      audioElement.current.ontimeupdate = () => {
        if (audioElement.current != null) {
          setCurrentTime(audioElement.current.currentTime)
          if (audioElement.current.currentTime > selectedRangeRef.current[1]) {
            audioElement.current.currentTime = selectedRangeRef.current[0]
          }
        }
      }
      audioElement.current.onloadedmetadata = () => {
        if (audioElement.current != null) {
          setDuration(audioElement.current.duration)
          setSelectedRange([0, audioElement.current.duration])
        }
      }
    }
  }, [audioFile])

  const togglePlayPause = () => {
    if (audioElement.current != null) {
      if (isPlaying) {
        audioElement.current.pause()
      } else {
        void audioElement.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const handleSpacebar = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (audioElement.current != null) {
          audioElement.current.currentTime = selectedRange[0]
        } else {
          console.error('audioElement.current is null')
        }
        togglePlayPause()
      }
    }
    window.addEventListener('keydown', handleSpacebar)
    return () => {
      window.removeEventListener('keydown', handleSpacebar)
    }
  }, [isPlaying])

  return (
      <div className="flex-1">
        <h1 className="bg-blue-200 m-8 font-bold py-10 text-4xl text-center">MP3 Looper</h1>
        <div className="flex flex-col items-center justify-center">
          <input type="file" accept=".mp3" onChange={fileSelectedHandler} />
          {/* NOTE: THESE ARE TEMPORARY CONTROLS FOR BASIC FUNCTIONALITY.
              TODO: Use https://wavesurfer-js.org/ as audio player
          */}
          <audio className="my-4" ref={audioElement} src={audioFile} controls />
          {duration > 0 && audioFile != null &&
          <Player
            key={audioFile}
            audioLink={audioFile}
            title={fileName}
            onRegionUpdated={regionUpdatedHandler}
          />
          }
          <button className="bg-orange-200 rounded-md px-4 py-2 mt-4" onClick={fileUploadHandler}>Upload</button>
        </div>
      </div>
  )
}

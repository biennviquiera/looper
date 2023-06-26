/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import Layout from './layout'
import React, { useEffect, useState, useRef } from 'react'
import './globals.css'

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
      setSelectedFile(event.target.files[0])
      setFileName(event.target.files[0].name)
      setAudioFile(URL.createObjectURL(event.target.files[0]))
    }
  }

  const fileUploadHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const formData = new FormData()
    if (selectedFile != null) {
      formData.append('myFile', selectedFile, selectedFile.name)
      console.log(...formData)
    //  // Used for sending to loop
    //   const res = fetch('http://localhost:3001/api/loop', {
    //     method: 'POST',
    //     body: formData,
    //   });
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

  const onSliderChange = (value: number | number[]) => {
    console.log(value)
    if (audioElement.current != null) {
      if (typeof value === 'number') {
        audioElement.current.currentTime = value
      } else if (value.length > 0) {
        audioElement.current.currentTime = value[0]
        setSelectedRange(value)
      }
    }
  }

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

  const handleStartInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRange([parseFloat(event.target.value), selectedRange[1]])
    onSliderChange([parseFloat(event.target.value), selectedRange[1]])
  }

  const handleEndInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRange([selectedRange[0], parseFloat(event.target.value)])
    onSliderChange([selectedRange[0], parseFloat(event.target.value)])
  }

  return (
      <div className="flex-1">
        <h1 className="bg-blue-200 m-8 font-bold py-10 text-4xl text-center">MP3 Looper</h1>
        <div className="flex flex-col items-center justify-center">
          <input type="file" accept=".mp3" onChange={fileSelectedHandler} />
          {/* NOTE: THESE ARE TEMPORARY CONTROLS FOR BASIC FUNCTIONALITY.
              TODO: Use https://wavesurfer-js.org/ as audio player
          */}
          <audio className="my-4" ref={audioElement} src={audioFile} controls />
          {duration > 0 &&
          <Slider
            className="py-8 slider-style"
            range
            defaultValue={[0, duration]}
            min={0}
            max={duration}
            step={0.001}
            onChange={onSliderChange}
            draggableTrack={true}
          />}
          <p>Currently selected: {selectedRangeRef.current[0]}s - {selectedRangeRef.current[1]}s</p>
          <input
          type="number"
          value={selectedRange[0]}
          onChange={handleStartInputChange}
          min="0"
          max={duration.toString()}
          step="0.001"
          />
          <input
          type="number"
          value={selectedRange[1]}
          onChange={handleEndInputChange}
          min="0"
          max={duration.toString()}
          step="0.001"
          />
          <button className="bg-orange-200 rounded-md px-4 py-2 mt-4" onClick={fileUploadHandler}>Upload</button>
        </div>
      </div>
  )
}

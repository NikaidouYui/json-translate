"use client"

import { createContext, useContext, useState } from 'react'

interface TranslatedResult {
  lang: string
  content: string
}

interface TranslateContextType {
  file: File | null
  setFile: (file: File | null) => void
  sourceLang: string
  setSourceLang: (lang: string) => void
  apiKey: string
  baseUri: string
  modelName:string
  apiType:string
  customPrompt:string
  setCustomPrompt: (key: string) => void
  setApiKey: (key: string) => void
  setbaseUri: (key: string) => void
  setmodelName: (key: string) => void  
  setapiType: (key: string) => void
  isTranslating: boolean
  setIsTranslating: (status: boolean) => void
  translatedContent: string
  setTranslatedContent: (content: string) => void
  progress: number
  setProgress: (progress: number) => void
  cancelTranslation: boolean
  setCancelTranslation: (cancel: boolean) => void
  streamContent: string
  setStreamContent: (content: string) => void
  translatedResults: TranslatedResult[]
  setTranslatedResults: (results: TranslatedResult[]) => void
  selectedLangs: string[]
  setSelectedLangs: (langs: string[]) => void
  currentTranslatingLang: string | null
  setCurrentTranslatingLang: (lang: string | null) => void
  totalProgress: number;
  setTotalProgress: (progress: number) => void;
  estimatedTime: number;
  setEstimatedTime: (time: number) => void;
  resetTranslation: () => void;
}

const TranslateContext = createContext<TranslateContextType | undefined>(undefined)

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null)
  const [sourceLang, setSourceLang] = useState('zh')
  const [apiKey, setApiKey] = useState('')
  const [baseUri, setbaseUri] = useState('')
  const [modelName, setmodelName] = useState('')
  const [apiType, setapiType] = useState('openAi')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState('')
  const [progress, setProgress] = useState(0)
  const [cancelTranslation, setCancelTranslation] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [translatedResults, setTranslatedResults] = useState<TranslatedResult[]>([])
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['zh'])
  const [currentTranslatingLang, setCurrentTranslatingLang] = useState<string | null>(null)
  const [totalProgress, setTotalProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)

  const resetTranslation = () => {
    setTranslatedResults([]);
    setTranslatedContent('');
    setStreamContent('');
    setProgress(0);
    setTotalProgress(0);
    setEstimatedTime(0);
    setCurrentTranslatingLang(null);
  };

  const value = {
    file,
    setFile,
    sourceLang,
    setSourceLang,
    apiKey, 
    setApiKey,    
    baseUri,
    setbaseUri,
    modelName,
    setmodelName,
    apiType,
    setapiType,
    customPrompt,
    setCustomPrompt,
    isTranslating,
    setIsTranslating,
    translatedContent,
    setTranslatedContent,
    progress,
    setProgress,
    cancelTranslation,
    setCancelTranslation,
    streamContent,
    setStreamContent,
    translatedResults,
    setTranslatedResults,
    selectedLangs,
    setSelectedLangs,
    currentTranslatingLang,
    setCurrentTranslatingLang,
    totalProgress,
    setTotalProgress,
    estimatedTime,
    setEstimatedTime,
    resetTranslation,
  }

  return (
    <TranslateContext.Provider value={value}>
      {children}
    </TranslateContext.Provider>
  )
}

export function useTranslate() {
  const context = useContext(TranslateContext)
  if (context === undefined) {
    throw new Error('useTranslate must be used within a TranslateProvider')
  }
  return context
} 
export interface PatternInfo {
  patternName?: {
    ko: string
    en: string
  }
  level: number
  floor: number | null
  rating: number | null
  patterner?: string | null
  version?: string | null
  score?: string | null
  maxCombo?: boolean | null
  maxScore?: number | null
  combo?: number | null
  patternFileName?: string | null
  max?: number | null
  djpower?: number | null
}

export interface BoardPatternInfo {
  title: number
  name: string
  composer: string
  pattern: string
  score: number | null
  maxCombo: number | null
  djpower?: number
  rating?: number
  dlc: string
  dlcCode: string
  floor: number
  level?: number
  board: number
  level?: number
}

export type PatternSet = Record<string, PatternInfo>

export type KeyPatterns = Record<string, PatternSet>

export interface SongData {
  title: number
  uuid?: string | null
  hardArchiveTitle?: string | null
  isVarchive?: boolean | null
  name: string
  composer: string | null
  dlcCode: string
  dlc: string
  artist?: string | null
  arranger?: string | null
  lyricist?: string | null
  vocal?: string | null
  featuring?: string | null
  genre?: string | null
  visualizer?: string | null
  license?: string | null
  bpm?: number | null
  bpmLow?: number | null
  bgaUrl?: string | null
  tag?: string | null
  search?: string | null
  time?: number | null
  folderName?: string | null
  mediaEditor?: string | null
  audioFileName?: string | null
  bgFileName?: string | null
  bgaFileName?: string | null
  bgaPreviewFileName?: string | null
  jacketFileName?: string | null
  officialCode?: string
  patterns: KeyPatterns
  plusPatterns?: KeyPatterns | null
}

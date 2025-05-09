import { Icon } from '@iconify/react'
import { globalDictionary } from '@render/constants/globalDictionary'
import { useNotificationSystem } from '@render/hooks/useNotifications'
import { createLog } from '@render/libs/logger'
import { RootState } from '@render/store'
import { setIsSetting, setSettingData } from '@render/store/slices/appSlice'
import type { SettingsData } from '@src/types/settings/SettingData'
import type { SettingItem } from '@src/types/settings/SettingItem'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { SyncLoader } from 'react-spinners'

// 카테고리 정의
const settingCategories = {
  general: { id: 'general', name: '일반', icon: 'lucide:settings' },
  storage: { id: 'storage', name: '저장공간', icon: 'lucide:database' },
  autoStart: { id: 'autoStart', name: '게임 자동 실행', icon: 'lucide:play' },
  capture: { id: 'capture', name: '자동 캡처 모드', icon: 'lucide:camera' },
}

// 설정 항목이 특정 카테고리에 속하는지 확인하는 함수들
const isGeneralSetting = (settingId: string): boolean => {
  return (
    settingId.includes('hardwareAcceleration') ||
    settingId.includes('language') ||
    settingId.includes('autoUpdate') ||
    settingId.includes('visible') ||
    settingId.includes('hideToTray') ||
    settingId.includes('isNotificationSound')
  )
}

const isCaptureSetting = (settingId: string): boolean => {
  return (
    settingId.includes('autoCapture') &&
    !settingId.includes('autoCaptureDjmax') &&
    !settingId.includes('autoCaptureWjmax') &&
    !settingId.includes('autoCapturePlatina')
  )
}

const isStorageSetting = (settingId: string): boolean => {
  return (
    settingId.includes('saveImage') ||
    settingId.includes('saveImageWhen') ||
    settingId.includes('saveImageWith') ||
    settingId.includes('saveImageWithout') ||
    settingId.includes('saveImageBlur')
  )
}

const isGameCaptureSetting = (settingId: string): boolean => {
  return (
    settingId.includes('autoCaptureDjmax') ||
    settingId.includes('autoCaptureWjmax') ||
    settingId.includes('autoCapturePlatina')
  )
}

const isAutoStartSetting = (settingId: string): boolean => {
  return settingId.includes('autoStart') || settingId.includes('StartGame')
}

// 설정 항목을 카테고리별로 분류
const categorizeSettings = () => {
  const { settingDictionary } = globalDictionary
  const categorized = {
    general: [] as SettingItem[],
    capture: [] as SettingItem[],
    storage: [] as SettingItem[],
    autoStart: [] as SettingItem[],
  }

  Object.entries(settingDictionary).forEach(([key, value]) => {
    const settingId = key
    const settingValue = value as SettingItem

    // isVisible이 false인 항목은 표시하지 않음
    if (settingValue.isVisible === false) {
      return
    }

    if (isGeneralSetting(settingId)) {
      categorized.general.push({ id: settingId, ...settingValue })
    } else if (isCaptureSetting(settingId)) {
      categorized.capture.push({ id: settingId, ...settingValue })
    } else if (isStorageSetting(settingId)) {
      categorized.storage.push({ id: settingId, ...settingValue })
    } else if (isGameCaptureSetting(settingId)) {
      categorized.capture.push({ id: settingId, ...settingValue })
    } else if (isAutoStartSetting(settingId)) {
      categorized.autoStart.push({ id: settingId, ...settingValue })
    } else {
      categorized.general.push({ id: settingId, ...settingValue })
    }
  })

  return categorized
}

// 토글 스위치 컴포넌트
const ToggleSwitch = ({
  value,
  onChange,
  disabled = false,
  theme,
}: {
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  theme: string
}) => {
  return (
    <div
      className={`tw:relative tw:w-10 tw:h-5 tw:rounded-full tw:transition-all tw:duration-300 tw:cursor-pointer ${
        disabled ? 'tw:opacity-50 tw:cursor-not-allowed' : ''
      } ${value ? 'tw:bg-indigo-600' : 'tw:dark:bg-slate-700 tw:bg-gray-300'}`}
      onClick={() => {
        !disabled && onChange(!value)
      }}
    >
      <div
        className={`tw:absolute tw:w-4 tw:h-4 tw:rounded-full tw:transition-all tw:duration-300 tw:top-0.5 tw:bg-white tw:shadow-md ${
          value ? 'tw:translate-x-[22px]' : 'tw:translate-x-0.5'
        }`}
      />
    </div>
  )
}

// 파일 선택 컴포넌트
const FileSelector = ({
  value,
  onChange,
  disabled = false,
  theme,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  theme: string
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language } = useSelector((state: RootState) => state.app.settingData)

  const getDialogConfig = () => {
    return {
      title: language === 'ko_KR' ? '파일 선택' : 'Select File',
      filters: [
        {
          name: language === 'ko_KR' ? '실행 파일' : 'Executable File',
          extensions: ['exe'],
        },
        { name: language === 'ko_KR' ? '모든 파일' : 'All Files', extensions: ['*'] },
      ],
    }
  }

  const handleElectronFileDialog = async () => {
    try {
      const filePath = await window.electron.openFileDialog(getDialogConfig())
      if (filePath) {
        onChange(filePath)
      }
    } catch (error) {
      createLog(
        'error',
        language === 'ko_KR' ? '파일 선택 오류:' : 'File selection error:',
        error.message,
      )
      // 오류 시 기존 방식으로 폴백
      fileInputRef.current?.click()
    }
  }

  const handleSelectFile = async () => {
    if (disabled) return

    if (window.electron?.openFileDialog) {
      await handleElectronFileDialog()
    } else {
      // 기존 파일 선택 방식으로 폴백
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file.path || file.name)
    }
  }

  return (
    <div className='tw:flex tw:items-center tw:gap-3 tw:min-w-[250px]'>
      <input
        type='text'
        value={value}
        readOnly
        className={`tw:p-2 tw:text-sm tw:rounded-lg tw:flex-1 tw:border tw:dark:bg-slate-700 tw:dark:text-white tw:dark:border-slate-600 tw:bg-white tw:text-gray-800 tw:border-gray-300`}
      />
      <input ref={fileInputRef} type='file' onChange={handleFileChange} className='tw:hidden' />
      <button
        onClick={() => {
          void handleSelectFile()
        }}
        disabled={disabled}
        className={`tw:p-2 tw:rounded-lg tw:transition-colors tw:bg-indigo-600 tw:hover:bg-indigo-700 tw:text-white ${disabled ? 'tw:opacity-50 tw:cursor-not-allowed' : ''}`}
      >
        <Icon icon='lucide:folder' className='tw:w-4 tw:h-4' />
      </button>
    </div>
  )
}

// 셀렉트 박스 컴포넌트
const SelectBox = ({
  id,
  value,
  options,
  onChange,
  disabled = false,
  theme,
}: {
  id: string
  value: string | number
  options: { id: string | number; name: string }[]
  onChange: (value: string) => void
  disabled?: boolean
  theme: string
}) => {
  const { t } = useTranslation(['settings'])
  return (
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      disabled={disabled}
      className={`tw:p-2 tw:min-w-[180px] tw:text-sm tw:rounded-lg tw:transition-colors tw:border tw:dark:bg-slate-700 tw:dark:text-white tw:dark:border-slate-600 tw:bg-white tw:text-gray-800 tw:border-gray-300 ${
        disabled ? 'tw:opacity-50 tw:cursor-not-allowed' : ''
      }`}
    >
      {options
        .filter((option) => option.id)
        .map((option) => (
          <option key={option.id} value={option.id}>
            {t(`${id}.${option.id}`)}
          </option>
        ))}
    </select>
  )
}

// 폴더 항목 컴포넌트
const FolderItem = ({
  title,
  path,
  size,
  folderType,
  theme,
  formatBytes,
  openFolder,
  children,
}: {
  title: string
  path: string
  size: number
  folderType: 'documents' | 'pictures' | 'logs' | 'appData'
  theme: string
  formatBytes: (bytes: number) => string
  openFolder: (folderType: 'documents' | 'pictures' | 'logs' | 'appData') => Promise<void>
  children?: React.ReactNode
}) => (
  <div
    className={`tw:px-4 tw:pt-3 tw:pb-4 tw:rounded-lg tw:border tw:dark:bg-slate-700 tw:dark:border-slate-600 tw:bg-white tw:border-gray-200`}
  >
    <div className='tw:flex tw:justify-between tw:items-center'>
      <h1 className='tw:text-sm'>{title}</h1>
      <div className='tw:flex tw:items-center tw:gap-3'>
        <span className='tw:font-mono tw:text-sm'>{formatBytes(size)}</span>
        <button
          onClick={() => {
            void openFolder(folderType)
          }}
          className={`tw:p-2 tw:rounded-lg tw:cursor-pointer tw:dark:tw:hover:text-slate-600 tw:text-indigo-400`}
        >
          <Icon icon='lucide:folder-open' className='tw:w-4 tw:h-4' />
        </button>
      </div>
    </div>
    <div className='tw:text-sm tw:opacity-70 tw:truncate'>{path}</div>
    {children}
  </div>
)

const StorageInfo = ({ theme }: { theme: string }) => {
  const dispatch = useDispatch()
  const { settingData } = useSelector((state: RootState) => state.app)
  const { language } = useSelector((state: RootState) => state.app.settingData)
  const { showNotification } = useNotificationSystem()
  const { t } = useTranslation(['settings'])
  const [storageInfo, setStorageInfo] = useState({
    total: 0,
    free: 0,
    used: 0,
    usedPercentage: 0,
    appDataSize: 0,
    imageDataSize: 0,
    logDataSize: 0,
  })

  const [folderPaths, setFolderPaths] = useState({
    documents: '',
    pictures: '',
    logs: '',
    appData: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isCleaningLogs, setIsCleaningLogs] = useState(false)
  const [autoDeleteDays, setAutoDeleteDays] = useState(0)

  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        if (window.electron) {
          const info = await window.electron.getStorageInfo()
          setStorageInfo(info)

          const paths = await window.electron.getFolderPaths()
          setFolderPaths(paths)

          if (settingData && settingData.autoDeleteCapturedImages !== undefined) {
            setAutoDeleteDays(settingData.autoDeleteCapturedImages)
          }
        }
      } catch (error) {
        createLog(
          'error',
          language === 'ko_KR' ? '스토리지 정보 로딩 실패:' : 'Storage information loading failed:',
          error.message,
        )
      } finally {
        setIsLoading(false)
      }
    }

    void fetchStorageInfo()
  }, [isCleaningLogs, settingData])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    // 인덱스가 유효한지 확인
    if (i >= 0 && i < sizes.length) {
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    return bytes + ' Bytes'
  }

  const openFolder = async (folderType: 'documents' | 'pictures' | 'logs' | 'appData') => {
    if (window.electron) {
      await window.electron.openFolder(folderType)
    }
  }

  const clearAllLogs = async () => {
    setIsCleaningLogs(true)
    try {
      if (window.electron) {
        const result = await window.electron.clearAllLogs()
        if (result) {
          showNotification(
            { mode: 'i18n', ns: 'settings', value: 'log.clearAllLogsSuccess' },
            'success',
          )
        } else {
          showNotification(
            { mode: 'i18n', ns: 'settings', value: 'log.clearAllLogsError' },
            'error',
          )
        }
      }
    } catch (error) {
      createLog('error', '로그 파일 삭제 실패:', error.message)
      showNotification({ mode: 'i18n', ns: 'settings', value: 'log.clearAllLogsError' }, 'error')
    } finally {
      setIsCleaningLogs(false)
    }
  }

  const handleAutoDeleteChange = (value: number) => {
    setAutoDeleteDays(value)

    const newSettings = {
      ...settingData,
      autoDeleteCapturedImages: value,
    }

    // 설정 저장
    dispatch(setSettingData(newSettings))

    // electron 설정 저장 호출
    if (window.electron?.saveSettings) {
      window.electron.saveSettings(newSettings)
    }
  }

  return (
    <div className='tw:space-y-6'>
      {isLoading ? (
        <div className='tw:flex tw:justify-center tw:py-8'>
          <SyncLoader color={theme === 'dark' ? '#fff' : '#000'} size={10} />
        </div>
      ) : (
        <>
          <div className='tw:space-y-4'>
            <FolderItem
              title={t('storageSettingFile')}
              path={folderPaths.documents}
              size={storageInfo.appDataSize}
              folderType='documents'
              theme={theme}
              formatBytes={formatBytes}
              openFolder={openFolder}
            />

            <FolderItem
              title={t('storageCaptureImage')}
              path={folderPaths.pictures}
              size={storageInfo.imageDataSize}
              folderType='pictures'
              theme={theme}
              formatBytes={formatBytes}
              openFolder={openFolder}
            >
              <div
                className={`tw:mt-3 tw:pt-3 tw:flex tw:justify-between tw:items-center tw:border-t tw:dark:border-slate-600 tw:border-gray-200`}
              >
                <div>
                  <h1 className='tw:text-sm'>{t('autoDeleteCapturedImages.name')}</h1>
                  <p className='tw:text-xs tw:mt-1 tw:dark:text-slate-400 tw:text-gray-600'>
                    {t('autoDeleteCapturedImages.description')}
                  </p>
                </div>
                <select
                  value={autoDeleteDays}
                  onChange={(e) => {
                    handleAutoDeleteChange(Number(e.target.value))
                  }}
                  className={`tw:p-2 tw:min-w-[120px] tw:text-sm tw:rounded-lg tw:transition-colors tw:border tw:dark:bg-slate-700 tw:dark:text-white tw:dark:border-slate-600 tw:bg-white tw:text-gray-800 tw:border-gray-300`}
                >
                  <option value={0}>{t('autoDeleteCapturedImages.0')}</option>
                  <option value={7}>{t('autoDeleteCapturedImages.7')}</option>
                  <option value={14}>{t('autoDeleteCapturedImages.14')}</option>
                  <option value={30}>{t('autoDeleteCapturedImages.30')}</option>
                  <option value={90}>{t('autoDeleteCapturedImages.90')}</option>
                </select>
              </div>
            </FolderItem>

            <FolderItem
              title={t('storageLogs')}
              path={folderPaths.logs}
              size={storageInfo.logDataSize}
              folderType='logs'
              theme={theme}
              formatBytes={formatBytes}
              openFolder={openFolder}
            >
              <div className='tw:mt-2 tw:flex tw:justify-end'>
                <button
                  onClick={() => {
                    void clearAllLogs()
                  }}
                  disabled={isCleaningLogs || storageInfo.logDataSize === 0}
                  className={`tw:px-2 tw:py-1 tw:text-xs tw:rounded tw:transition-colors tw:flex tw:items-center tw:gap-1 tw:dark:bg-red-700 tw:dark:hover:bg-red-800 tw:bg-red-600 tw:hover:bg-red-700 tw:text-white ${isCleaningLogs || storageInfo.logDataSize === 0 ? 'tw:opacity-50 tw:cursor-not-allowed' : ''}`}
                >
                  {isCleaningLogs ? (
                    <>
                      <Icon icon='lucide:loader' className='tw:w-3 tw:h-3 tw:animate-spin' />
                      {t('storageLogsDeleting')}
                    </>
                  ) : (
                    <>
                      <Icon icon='lucide:trash-2' className='tw:w-3 tw:h-3' />
                      {t('storageLogsDeleteAll')}
                    </>
                  )}
                </button>
              </div>
            </FolderItem>
          </div>
        </>
      )}
    </div>
  )
}

export default function SettingModal() {
  const dispatch = useDispatch()
  const { theme } = useSelector((state: RootState) => state.ui)
  const { isSetting, settingData } = useSelector((state: RootState) => state.app)
  const { font } = useSelector((state: RootState) => state.app.settingData)
  const [activeCategory, setActiveCategory] = useState<string>('general')
  const [localSettings, setLocalSettings] = useState<SettingsData>({} as SettingsData)
  const { t } = useTranslation(['settings'])
  const categorizedSettings = categorizeSettings()

  // 모달이 열릴 때 설정 데이터를 로컬 상태로 복사
  useEffect(() => {
    if (isSetting && settingData) {
      setLocalSettings({ ...settingData })
    }
  }, [isSetting, settingData])

  // ESC 키 누름 감지
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSetting) {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [isSetting])

  // 설정 값 변경 핸들러
  const handleSettingChange = (id: string, value: string | number | boolean) => {
    const updatedSettings = (prev: SettingsData) => {
      // Record를 사용해 타입 정의
      const newSettings = { ...prev } as SettingsData & Record<string, string | number | boolean>

      // 상호 배타적인 설정 처리 (예: 알림음)
      if (id.endsWith('Sound') && value === true) {
        const offItems = Object.keys(globalDictionary.settingDictionary).filter(
          (key) => key.endsWith('Sound') && key !== id,
        )

        // 안전하게 할당
        offItems.forEach((offItem) => {
          if (offItem && typeof offItem === 'string' && offItem in newSettings) {
            newSettings[offItem] = false
          }
        })
      }

      // 안전하게 설정 할당
      if (id && typeof id === 'string' && id in newSettings) {
        newSettings[id] = value
      }

      return newSettings as SettingsData
    }

    // Redux 상태 업데이트
    const newSettings = updatedSettings(settingData)
    dispatch(setSettingData(newSettings))

    // electron을 통해 설정 저장
    if (window.electron?.saveSettings) {
      window.electron.saveSettings(newSettings)
    }
  }

  // 모달 닫기
  const closeModal = () => {
    dispatch(setIsSetting(false))
  }

  // 설정 리셋
  // const resetSettings = () => {
  //   if (window.confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
  //     const defaultSettings = Object.entries(globalDictionary.settingDictionary).reduce(
  //       (acc, [key, value]) => {
  //         acc[key] = value.defaultValue
  //         return acc
  //       },
  //       {} as Record<string, any>,
  //     )

  //     setLocalSettings(defaultSettings)
  //     // 즉시 설정 저장
  //     applySettings(defaultSettings as SettingsData)
  //   }
  // }

  return (
    <div
      className={`tw:fixed ${font != 'default' ? 'tw:font-medium' : ''} tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:transition-all tw:duration-300 ${
        isSetting ? 'tw:opacity-100' : 'tw:opacity-0 tw:pointer-events-none'
      }`}
    >
      {/* 배경 오버레이 */}
      <div
        className={`tw:fixed tw:inset-0 tw:bg-black tw:transition-opacity tw:duration-300 ${
          isSetting ? 'tw:opacity-60' : 'tw:opacity-0'
        }`}
        onClick={closeModal}
      />

      {/* 모달 내용 */}
      <div
        className={`tw:relative tw:rounded-xl tw:shadow-2xl tw:w-full tw:max-w-4xl tw:max-h-[90vh] tw:flex tw:flex-col tw:transition-all tw:duration-300 tw:dark:bg-slate-800 tw:dark:text-slate-200 tw:bg-white tw:text-gray-800 ${isSetting ? 'tw:translate-y-0 tw:opacity-100' : 'tw:translate-y-4 tw:opacity-0'}`}
      >
        {/* 모달 헤더 */}
        <div className={`tw:py-3 tw:px-5 tw:border-b tw:dark:border-slate-700 tw:border-gray-200`}>
          <div className='tw:flex tw:justify-between tw:items-center'>
            <div className='tw:flex tw:items-center tw:gap-2'>
              <Icon icon='lucide:settings' className='tw:w-5 tw:h-5' />
              <h2 className='tw:text-lg tw:font-bold'>{t('settings')}</h2>
            </div>
            <button
              onClick={closeModal}
              className={`tw:p-2 tw:rounded-full tw:transition-colors tw:dark:hover:bg-slate-700 tw:hover:bg-gray-200`}
            >
              <Icon icon='lucide:x' className='tw:w-5 tw:h-5' />
            </button>
          </div>
        </div>

        {/* 모달 본문 */}
        <div className='tw:flex tw:flex-1 tw:overflow-hidden'>
          {/* 사이드바 - 카테고리 탭 */}
          <div
            className={`tw:w-48 tw:p-5 tw:border-r tw:flex tw:flex-col tw:gap-3 tw:dark:border-slate-700 tw:border-gray-200`}
          >
            {Object.entries(settingCategories).map(([key, category]) => (
              <span
                key={key}
                onClick={() => {
                  setActiveCategory(key)
                }}
                className={`tw:flex tw:items-center tw:cursor-pointer tw:gap-3 tw:px-4 tw:py-3 tw:rounded-lg tw:transition-colors tw:text-left ${
                  activeCategory === key
                    ? 'tw:dark:bg-slate-700 tw:dark:text-white tw:bg-indigo-100 tw:text-indigo-800'
                    : 'tw:dark:hover:bg-slate-700 tw:dark:text-slate-300 tw:hover:bg-gray-100 tw:text-gray-700'
                }`}
              >
                <span className='tw:text-sm'>{t(category.id)}</span>
              </span>
            ))}
          </div>

          {/* 설정 항목 */}
          <div className='tw:flex-1 tw:p-6 tw:overflow-y-auto tw:custom-scrollbar tw:h-[calc(100vh-10rem)]'>
            {activeCategory === 'storage' ? (
              <StorageInfo theme={theme} />
            ) : (
              <>
                {categorizedSettings[activeCategory as keyof typeof categorizedSettings].map(
                  (setting) => (
                    <div
                      key={setting.id}
                      className={`tw:pb-8 ${
                        categorizedSettings[activeCategory as keyof typeof categorizedSettings]
                          .length - 1
                          ? 'tw:border-b tw:mb-8'
                          : ''
                      } tw:dark:border-slate-700 tw:border-gray-200`}
                    >
                      <div className='tw:flex tw:justify-between tw:items-center tw:gap-8'>
                        <div className='tw:flex-1'>
                          <h3 className='tw:text-sm tw:mb-2'>{t(`${setting.id}.name`)}</h3>
                          <p
                            className={`tw:text-sm tw:mb-2 tw:dark:text-slate-400 tw:text-gray-600`}
                          >
                            {t(`${setting.id}.description`)}
                          </p>
                          {setting.requiresRestart && (
                            <p className='tw:text-sm tw:mt-2 tw:text-amber-500'>
                              {t('requiresRestart')}
                            </p>
                          )}
                          {!setting.isEditable && (
                            <p className='tw:text-sm tw:mt-2 tw:text-red-500'>{t('uneditable')}</p>
                          )}
                        </div>

                        <div className='tw:flex tw:items-center tw:ml-4'>
                          {setting.selectList ? (
                            <SelectBox
                              id={setting.id}
                              value={localSettings[setting.id] ?? setting.defaultValue}
                              options={setting.selectList}
                              onChange={(value) => {
                                handleSettingChange(setting.id, value)
                              }}
                              disabled={!setting.isEditable}
                              theme={theme}
                            />
                          ) : setting.isFile ? (
                            <FileSelector
                              value={localSettings[setting.id] ?? setting.defaultValue}
                              onChange={(value) => {
                                handleSettingChange(setting.id, value)
                              }}
                              disabled={!setting.isEditable}
                              theme={theme}
                            />
                          ) : (
                            <ToggleSwitch
                              value={localSettings[setting.id] ?? setting.defaultValue}
                              onChange={(value) => {
                                handleSettingChange(setting.id, value)
                              }}
                              disabled={!setting.isEditable}
                              theme={theme}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {/* 앱 재시작 버튼 (일반 카테고리일 때만 표시) */}
                {activeCategory === 'general' && (
                  <div
                    className={`tw:pt-4 tw:border-t tw:dark:border-slate-700 tw:border-gray-200`}
                  >
                    <div className='tw:flex tw:flex-col tw:gap-4'>
                      <button
                        onClick={() => {
                          window.electron.restartApp()
                        }}
                        className={`tw:px-4 tw:py-2 tw:rounded-lg tw:transition-colors tw:font-medium tw:flex tw:justify-center tw:items-center tw:gap-2 tw:cursor-pointer tw:duration-300 tw:bg-indigo-600 tw:hover:bg-indigo-700 tw:text-white`}
                      >
                        <Icon icon='lucide:refresh-cw' className='tw:w-4 tw:h-4' />
                        {t('restartApp')}
                      </button>

                      <div className='tw:mt-4 tw:text-xs tw:opacity-70 tw:text-center'>
                        <p className='tw:mb-1'>{globalDictionary.version}</p>
                        <p className='tw:whitespace-pre-line'>{t('copyright')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

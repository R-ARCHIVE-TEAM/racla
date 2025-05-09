// import {
//   getDifficultyClassName,
//   getDifficultyStarImage,
//   getSCPatternScoreDisplayText,
//   getScoreDisplayText,
// } from '@utils/wjmaxUtils'
// import { useCallback, useEffect, useState } from 'react'
// import { OverlayTrigger, Tooltip } from 'react-bootstrap'
// import { useDispatch, useSelector } from 'react-redux'

// import { globalDictionary } from '@constants/globalDictionary'
// import { logRendererError } from '@utils/rendererLoggerUtils'
// import axios from 'axios'
// import Image from 'next/image'
// import Link from 'next/link'
// import { useInView } from 'react-intersection-observer'
// import { RootState } from 'store'
// import { setBackgroundBgaName } from 'store/slices/uiSlice'

// interface RaScorePopupComponentProps {
//   gameCode: string
//   songItem?: any
//   songItemTitle?: string
//   keyMode: string
//   isScored?: boolean
//   isVisibleCode?: boolean
//   rivalName?: string
//   songDataPackIndex?: number
//   isFlatten?: boolean
//   delay?: { show: number; hide: number }
//   onMouseEnter?: () => void
//   onMouseLeave?: () => void
//   size?: number
//   judgementType?: string
// }

// const RaScorePopupComponent = ({
//   gameCode = 'wjmax',
//   songItem,
//   songItemTitle,
//   keyMode,
//   isScored = false,
//   isVisibleCode = false,
//   rivalName = '',
//   songDataPackIndex,
//   delay = { show: 500, hide: 0 },
//   onMouseEnter,
//   onMouseLeave,
//   size = 80,
//   judgementType,
// }: RaScorePopupComponentProps) => {
//   const dispatch = useDispatch()
//   const fontFamily = useSelector((state: RootState) => state.ui.fontFamily)
//   const userData = useSelector((state: RootState) => state.app.userData)
//   const wjmaxSongData = useSelector((state: RootState) => state.app.wjmaxSongData)
//   const songDataList = useSelector((state: RootState) => state.app.songData)
//   const selectedGame = useSelector((state: RootState) => state.app.selectedGame)
//   const [songData, setSongData] = useState<any>(null)
//   const [rivalSongData, setRivalSongData] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [isHovered, setIsHovered] = useState<boolean>(false)
//   const [showScore, setShowScore] = useState<boolean>(false)
//   const [mounted, setMounted] = useState<boolean>(false)
//   const [imageLoaded, setImageLoaded] = useState(false)
//   const { ref, inView } = useInView({
//     threshold: 0,
//     triggerOnce: true,
//   })

//   const handleImageLoad = useCallback(() => {
//     setImageLoaded(true)
//   }, [])

//   useEffect(() => {
//     let isMounted = true

//     const fetchData = async () => {
//       if (!userData.userName && !songItem && songItemTitle) {
//         const foundSong = songDataList.find((song) => song.title === songItemTitle)
//         if (foundSong) {
//           setSongData(foundSong)
//         }
//         return
//       }

//       if (userData.userName && isHovered && !isScored) {
//         setIsLoading(true)
//         try {
//           const response = await axios.get(
//             `${process.env.NEXT_PUBLIC_API_URL}/v2/racla/songs/${selectedGame}/${songItem?.title || songItemTitle}/user/${userData.userNo}`,
//             {
//               headers: {
//                 Authorization: `${userData.userNo}|${userData.userToken}`,
//               },
//               withCredentials: true,
//             },
//           )
//           if (response.status === 200 && isMounted) {
//             const { data } = await response
//             if (selectedGame == 'wjmax') {
//               const { patterns, plusPatterns } = data
//               const newPatterns = Object.fromEntries(
//                 Object.entries({
//                   ...patterns,
//                   ...Object.fromEntries(
//                     Object.keys(plusPatterns).map((key) => [`${key}_PLUS`, plusPatterns[key]]),
//                   ),
//                 }).sort(([keyA], [keyB]) => {
//                   const numA = parseInt(keyA)
//                   const numB = parseInt(keyB)
//                   if (numA !== numB) return numA - numB
//                   return keyA.includes('_PLUS') ? 1 : -1
//                 }),
//               )
//               if (songItem) {
//                 setSongData({ ...songItem, patterns: newPatterns })
//                 console.log({ ...songItem, patterns: newPatterns })
//               } else {
//                 setSongData({ ...data, patterns: newPatterns })
//                 console.log({ ...data, patterns: newPatterns })
//               }
//             } else {
//               const { patterns } = data
//               if (songItem) {
//                 setSongData({ ...songItem, patterns })
//                 console.log({ ...songItem, patterns })
//               } else {
//                 setSongData({ ...data, patterns })
//                 console.log({ ...data, patterns })
//               }
//             }
//           }
//         } catch (error) {
//           logRendererError(error, { message: 'Error fetching song data', ...userData })
//           console.error('Error fetching song data:', error)
//         }

//         if (rivalName && rivalName !== userData.userName) {
//           try {
//             const response = await axios.get(
//               `${process.env.NEXT_PUBLIC_API_URL}/api/v2/racla/songs/${selectedGame}/${songItem?.title || songItemTitle}/user/${rivalName}`,
//               {
//                 headers: {
//                   Authorization: `${rivalName}|${rivalName}`,
//                 },
//                 withCredentials: true,
//               },
//             )
//             if (response.status === 200 && isMounted) {
//               const { data } = await response
//               setRivalSongData(data)
//             }
//           } catch (error) {
//             logRendererError(error, { message: 'Error fetching rival data', ...userData })
//             console.error('Error fetching rival data:', error)
//           }
//         }

//         if (isMounted) {
//           setIsLoading(false)
//         }
//       }
//     }

//     fetchData()
//     return () => {
//       isMounted = false
//     }
//   }, [songItem, songItemTitle, userData.userName, rivalName, isHovered, isScored, songDataList])

//   useEffect(() => {
//     if (isHovered && !isLoading && displayData !== null) {
//       const timer = setTimeout(() => {
//         setMounted(true)
//       }, 100)
//       return () => clearTimeout(timer)
//     } else {
//       setMounted(false)
//     }
//   }, [isHovered, isLoading])

//   const handleMouseEnter = () => {
//     setIsHovered(true)
//     onMouseEnter?.()
//     if (songItem) {
//       dispatch(
//         setBackgroundBgaName(
//           'resources/music' + String(songItem?.bgaPreviewFileName).replace('.mp4', ''),
//         ),
//       )
//     }
//     if (songItemTitle) {
//       dispatch(
//         setBackgroundBgaName(
//           'resources/music' +
//             String(
//               wjmaxSongData.filter((song) => String(song.title) === String(songItemTitle))?.[0]
//                 ?.bgaPreviewFileName,
//             ).replace('.mp4', ''),
//         ),
//       )
//     }
//   }

//   const handleMouseLeave = () => {
//     setIsHovered(false)
//     onMouseLeave?.()
//     dispatch(setBackgroundBgaName(''))
//   }

//   const displayData = isScored ? songItem : songData || songItem

//   const patternToName = {
//     NM: '메시',
//     HD: selectedGame == 'wjmax' ? '엔젤' : 'HARD',
//     MX: '왁굳',
//     SC: '민수',
//     DPC: '거짓말',
//     EASY: 'EASY',
//     OVER: 'OVER',
//     PLUS_1: 'PLUS',
//     PLUS_2: 'PLUS',
//     PLUS_3: 'PLUS',
//   }

//   return (
//     <OverlayTrigger
//       key={'songDataPack_item' + (displayData?.title ?? songItemTitle)}
//       placement='auto'
//       delay={delay}
//       show={isHovered && !isLoading && displayData !== null}
//       overlay={
//         <Tooltip
//           id='btn-nav-home'
//           className={`tw-bg-gray-900 tw-bg-opacity-100 tw-text-xs tw-min-h-48 ${fontFamily}`}
//         >
//           <div className='tw-flex tw-gap-2'>
//             <style>{`
//               .tooltip-inner {
//                 opacity: 1 !important;
//                 background-color: rgb(17 24 39) !important;
//               }
//               .tooltip.show {
//                 opacity: 1 !important;
//               }

//             `}</style>
//             <div className='tw-flex tw-flex-col'>
//               <div className='tw-flex tw-flex-col tw-w-80 tw-h-32 tw-relative tw-mb-2 tw-mt-1 tw-bg-gray-800 tw-bg-opacity-100 tw-overflow-hidden tw-rounded-md'>
//                 <Image
//                   loading='lazy' // "lazy" | "eager"
//                   blurDataURL={globalDictionary.blurDataURL}
//                   src={`https://cdn.racla.app/${selectedGame}${selectedGame == 'wjmax' ? '/resources' : ''}/jackets/${selectedGame == 'platina_lab' ? 'cropped/' : ''}${String(songItem ? String(songItem.title) : String(songItemTitle))}.jpg`}
//                   className='tw-absolute tw-blur-sm'
//                   fill
//                   alt=''
//                   style={{ objectFit: 'cover' }}
//                 />
//                 <div className='tw-absolute tw-inset-0 tw-bg-gray-800 tw-bg-opacity-75' />
//                 <span className='tw-absolute tw-left-0 tw-bottom-0 tw-px-2 tw-font-bold tw-text-left tw-break-keep'>
//                   <span className='tw-font-medium tw-text-md'>
//                     {displayData?.artist ? displayData?.artist : displayData?.composer}
//                   </span>

//                   <br />
//                   <span className='tw-text-xl'>{displayData?.name}</span>
//                 </span>
//                 {selectedGame == 'wjmax' ? (
//                   <span className='tw-absolute tw-top-1 tw-right-1 wjmax_dlc_code_wrap tw-animate-fadeInLeft tw-rounded-md tw-bg-gray-900 p-1'>
//                     <span className={`wjmax_dlc_code wjmax_dlc_code_${displayData?.dlcCode ?? ''}`}>
//                       {displayData?.dlc ?? ''}
//                     </span>
//                   </span>
//                 ) : (
//                   <span className='tw-absolute tw-top-1 tw-right-1 platina_lab_dlc_code_wrap tw-animate-fadeInLeft tw-rounded-md tw-bg-gray-900 p-1'>
//                     <span
//                       className={`platina_lab_dlc_code platina_lab_dlc_code_${displayData?.dlcCode ?? ''}`}
//                     >
//                       {displayData?.dlc ?? ''}
//                     </span>
//                   </span>
//                 )}
//               </div>
//               <div className='tw-flex tw-flex-col tw-gap-2 tw-w-80 tw-p-2 tw-rounded-md tw-mb-1 tw-bg-gray-500 tw-bg-opacity-25'>
//                 {displayData?.patterns[`${keyMode}B`] !== undefined
//                   ? (selectedGame == 'wjmax'
//                       ? ['NM', 'HD', 'MX', 'SC', 'DPC']
//                       : ['EASY', 'HD', 'OVER', 'PLUS_1', 'PLUS_2', 'PLUS_3']
//                     ).map(
//                       (value, difficultyIndex) =>
//                         displayData?.patterns[
//                           `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                         ]?.[value] !== undefined &&
//                         displayData?.patterns[
//                           `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                         ]?.[value] !== null && (
//                           <div
//                             className='tw-flex tw-flex-col tw-gap-2'
//                             key={'songDataPack_item' + displayData.title + '_hover' + value}
//                           >
//                             <div className='tw-flex tw-items-center tw-gap-1'>
//                               {selectedGame == 'wjmax' && (
//                                 <span
//                                   className={`tw-text-base tw-font-extrabold tw-text-left tw-z-50 text-stroke-100 tw-me-auto ${
//                                     value === 'NM'
//                                       ? 'tw-text-wjmax-nm'
//                                       : value === 'HD'
//                                         ? 'tw-text-wjmax-hd'
//                                         : value === 'MX'
//                                           ? 'tw-text-wjmax-mx'
//                                           : value === 'SC'
//                                             ? 'tw-text-wjmax-sc'
//                                             : value === 'DPC'
//                                               ? 'tw-text-wjmax-dpc'
//                                               : ''
//                                   }`}
//                                 >
//                                   {globalDictionary.wjmax.difficulty[value].fullName}
//                                 </span>
//                               )}
//                               {selectedGame == 'platina_lab' && (
//                                 <span
//                                   className={`tw-text-base tw-font-extrabold tw-text-left tw-z-50 text-stroke-100 tw-me-auto ${
//                                     value === 'EASY'
//                                       ? 'tw-text-platina-lab-easy'
//                                       : value === 'HD'
//                                         ? 'tw-text-platina-lab-hd'
//                                         : value === 'OVER'
//                                           ? 'tw-text-platina-lab-over'
//                                           : 'tw-text-platina-lab-plus'
//                                   }`}
//                                 >
//                                   {globalDictionary.platina_lab.difficulty[value].fullName}
//                                 </span>
//                               )}
//                               {selectedGame == 'wjmax' && (
//                                 <Image
//                                   loading='lazy' // "lazy" | "eager"
//                                   blurDataURL={globalDictionary.blurDataURL}
//                                   src={getDifficultyStarImage(
//                                     displayData.patterns[
//                                       `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                     ][value].level,
//                                     value,
//                                   )}
//                                   height={20}
//                                   width={20}
//                                   alt=''
//                                 />
//                               )}
//                               <span
//                                 className={getDifficultyClassName(
//                                   displayData.patterns[
//                                     `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                   ][value].level,
//                                   value,
//                                   selectedGame,
//                                 )}
//                               >
//                                 {selectedGame == 'platina_lab' && 'Lv.'}
//                                 {selectedGame == 'wjmax'
//                                   ? Number(
//                                       displayData.patterns[
//                                         `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                       ][value].level,
//                                     ).toFixed(1)
//                                   : Number(
//                                       displayData.patterns[
//                                         `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                       ][value].level,
//                                     ).toFixed(0)}{' '}
//                                 <sup className='tw-text-xs'>
//                                   {displayData.patterns[
//                                     `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                   ][value].floor !== undefined &&
//                                   displayData.patterns[
//                                     `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                   ][value].floor !== null
//                                     ? `(${
//                                         displayData.patterns[
//                                           `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                         ][value].floor
//                                       }F)`
//                                     : null}
//                                 </sup>
//                               </span>
//                             </div>
//                             {userData.userName !== '' &&
//                             (displayData.patterns[
//                               `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                             ][value] !== undefined ||
//                               isScored) ? (
//                               <div className='tw-relative tw-w-full tw-h-6 tw-bg-gray-900 tw-rounded-sm tw-overflow-hidden'>
//                                 <div
//                                   className='tw-h-full tw-transition-all tw-duration-1000 tw-ease-out'
//                                   style={{
//                                     width: mounted
//                                       ? `${
//                                           displayData.patterns[
//                                             `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                           ][value]?.score
//                                             ? Number(
//                                                 displayData.patterns[
//                                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                                 ][value].score,
//                                               )
//                                             : 0
//                                         }%`
//                                       : '0%',
//                                     backgroundColor:
//                                       selectedGame == 'wjmax'
//                                         ? value === 'NM'
//                                           ? '#c79b61' // wjmax-nm
//                                           : value === 'HD'
//                                             ? '#9696ff' // wjmax-hd
//                                             : value === 'MX'
//                                               ? '#78ff91' // wjmax-mx
//                                               : value === 'SC'
//                                                 ? '#ff4c4c' // wjmax-sc
//                                                 : value === 'DPC'
//                                                   ? '#ffb401' // wjmax-dpc
//                                                   : ''
//                                         : value === 'EASY'
//                                           ? '#ffb31a' // platina-lab-nm
//                                           : value === 'HD'
//                                             ? '#fd6c6e' // platina-lab-hd
//                                             : value === 'OVER'
//                                               ? '#bb63da' // platina-lab-mx
//                                               : '#7581bf',
//                                   }}
//                                 />
//                                 <div className='tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-white'>
//                                   {getScoreDisplayText(
//                                     displayData.patterns[
//                                       `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                     ][value],
//                                     selectedGame,
//                                   )}
//                                 </div>
//                               </div>
//                             ) : null}
//                           </div>
//                         ),
//                     )
//                   : '조회된 데이터가 없습니다.'}
//               </div>
//               {userData.userName !== '' && (
//                 <span className='tw-text-xs tw-font-light tw-text-gray-300 tw-my-2'>
//                   <span className=''>{userData.userName}</span>님의 RACLA 성과 기록
//                 </span>
//               )}
//             </div>

//             {/* {rivalName && rivalName !== userData.userName && rivalSongData && (
//               <div className='tw-flex tw-flex-col'>
//                 <div className='tw-flex tw-flex-col tw-w-80 tw-h-32 tw-relative tw-mb-2 tw-mt-1 tw-bg-gray-900 tw-bg-opacity-100 tw-overflow-hidden tw-rounded-md'>
//                   <Image
//                     loading='lazy' // "lazy" | "eager"
//                     blurDataURL={globalDictionary.blurDataURL}
//                     src={`https://cdn.racla.app/${selectedGame}/resources/jackets/${String(songItem ? String(songItem.title) : String(songItemTitle))}.jpg`}
//                     className='tw-absolute tw-animate-fadeInLeft tw-rounded-md tw-blur tw-brightness-50 tw-bg-opacity-90'
//                     fill
//                     alt=''
//                     style={{ objectFit: 'cover' }}
//                   />
//                   <span className='tw-absolute tw-left-0 tw-bottom-0 tw-px-2 tw-font-bold tw-text-left tw-break-keep'>
//                     <span className='tw-font-medium tw-text-md'>{rivalSongData.composer}</span>
//                     <br />
//                     <span className='tw-text-xl'>{rivalSongData.name}</span>
//                   </span>
//                   <span className='tw-absolute tw-top-1 tw-right-1 wjmax_dlc_code_wrap tw-animate-fadeInLeft tw-rounded-md tw-bg-gray-950 p-1'>
//                     <span className={`wjmax_dlc_code wjmax_dlc_code_${rivalSongData.dlcCode}`}>
//                       {rivalSongData.dlc}
//                     </span>
//                   </span>
//                 </div>
//                 <div className='tw-flex tw-flex-col tw-gap-2 tw-w-80 tw-p-2 tw-rounded-md tw-mb-1 tw-bg-gray-700 tw-bg-opacity-20'>
//                   {['NM', 'HD', 'MX', 'SC', 'DPC'].map(
//                     (value, difficultyIndex) =>
//                       rivalSongData.patterns[
//                         `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                       ][value] !== undefined &&
//                       rivalSongData.patterns[
//                         `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                       ][value] !== null && (
//                         <div
//                           className='tw-flex tw-flex-col tw-gap-2'
//                           key={'songDataPack_item' + rivalSongData.title + '_hover' + value}
//                         >
//                           <div className='tw-flex tw-items-center tw-gap-1'>
//                             <span
//                               className={`tw-text-base tw-font-extrabold tw-text-left tw-z-50 text-stroke-100 tw-me-auto ${
//                                 value === 'NM'
//                                   ? 'tw-text-wjmax-nm'
//                                   : value === 'HD'
//                                     ? 'tw-text-wjmax-hd'
//                                     : value === 'MX'
//                                       ? 'tw-text-wjmax-mx'
//                                       : value === 'SC'
//                                         ? 'tw-text-wjmax-sc'
//                                         : value === 'DPC'
//                                           ? 'tw-text-wjmax-dpc'
//                                           : ''
//                               }`}
//                             >
//                               {globalDictionary.wjmax.difficulty[value].fullName}
//                             </span>
//                             <Image
//                               loading='lazy' // "lazy" | "eager"
//                               blurDataURL={globalDictionary.blurDataURL}
//                               src={getDifficultyStarImage(
//                                 rivalSongData.patterns[
//                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                 ][value].level,
//                                 value,
//                               )}
//                               height={20}
//                               width={20}
//                               alt=''
//                             />
//                             <span
//                               className={getDifficultyClassName(
//                                 rivalSongData.patterns[
//                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                 ][value].level,
//                                 value,
//                               )}
//                             >
//                               {
//                                 rivalSongData.patterns[
//                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                 ][value].level
//                               }{' '}
//                               <sup className='tw-text-xs'>
//                                 {rivalSongData.patterns[
//                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                 ][value].floor !== undefined &&
//                                 rivalSongData.patterns[
//                                   `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                 ][value].floor !== null
//                                   ? `(${
//                                       rivalSongData.patterns[
//                                         `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                       ][value].floor
//                                     }F)`
//                                   : null}
//                               </sup>
//                             </span>
//                           </div>
//                           {userData.userName !== '' &&
//                           (rivalSongData.patterns[
//                             `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                           ][value] !== undefined ||
//                             isScored) ? (
//                             <div className='tw-relative tw-w-full tw-h-6 tw-bg-gray-900 tw-rounded-sm tw-overflow-hidden'>
//                               <div
//                                 className='tw-h-full tw-transition-all tw-duration-1000 tw-ease-out'
//                                 style={{
//                                   width: mounted
//                                     ? `${
//                                         rivalSongData.patterns[
//                                           `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                         ][value]?.score
//                                           ? Number(
//                                               rivalSongData.patterns[
//                                                 `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                               ][value].score,
//                                             )
//                                           : 0
//                                       }%`
//                                     : '0%',
//                                   backgroundColor:
//                                     value === 'NM'
//                                       ? '#c79b61' // wjmax-nm
//                                       : value === 'HD'
//                                         ? '#9696ff' // wjmax-hd
//                                         : value === 'MX'
//                                           ? '#78ff91' // wjmax-mx
//                                           : value === 'SC'
//                                             ? '#ff4c4c' // wjmax-sc
//                                             : value === 'DPC'
//                                               ? '#ffb401' // wjmax-dpc
//                                               : '', // wjmax-sc
//                                 }}
//                               />
//                               <div className='tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-white'>
//                                 {getScoreDisplayText(
//                                   rivalSongData.patterns[
//                                     `${keyMode}B${String(judgementType) == 'HARD' || String(judgementType) == '1' ? '_PLUS' : ''}`
//                                   ][value],
//                                 )}
//                               </div>
//                             </div>
//                           ) : null}
//                         </div>
//                       ),
//                   )}
//                 </div>
//                 {rivalName !== '' && (
//                   <span className='tw-text-xs tw-font-light tw-text-gray-300 tw-my-2'>
//                     <span className=''>{rivalName}</span>님의 성과 기록
//                   </span>
//                 )}
//               </div>
//             )} */}
//           </div>
//         </Tooltip>
//       }
//     >
//       <div
//         ref={ref}
//         className='tw-inline-flex tw-flex-col tw-transition-all'
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//       >
//         <Link
//           href={`/projectRa/${selectedGame}/db/title/${displayData?.title ?? songItemTitle}`}
//           className={
//             selectedGame == 'wjmax'
//               ? 'tw-relative tw-rounded-md hover-scale-110 wjmax_record tw-cursor-pointer tw-overflow-hidden'
//               : 'tw-relative tw-rounded-md hover-scale-110 platina_lab_record tw-cursor-pointer tw-overflow-hidden'
//           }
//           style={{
//             width: selectedGame == 'wjmax' ? (size ? (size / 9) * 16 : 130) : size,
//             height: selectedGame == 'wjmax' ? (size ? size : 74) : size,
//           }}
//         >
//           <div className='tw-w-full tw-h-full'>
//             {inView && (
//               <Image
//                 loading='lazy'
//                 blurDataURL={globalDictionary.blurDataURL}
//                 src={`https://cdn.racla.app/${selectedGame}${selectedGame == 'wjmax' ? '/resources' : ''}/jackets/${selectedGame == 'platina_lab' ? 'resized/' : ''}${String(songItem ? String(songItem.title) : String(songItemTitle))}.jpg`}
//                 className={`tw-rounded-md tw-shadow-lg ${imageLoaded ? 'tw-animate-fadeIn' : 'tw-opacity-0'}`}
//                 fill
//                 style={{ objectFit: 'cover' }}
//                 alt=''
//                 onLoad={handleImageLoad}
//               />
//             )}
//           </div>
//           {isVisibleCode ? (
//             selectedGame == 'wjmax' ? (
//               <span className='tw-absolute tw-top-0 tw-left-0 wjmax_dlc_code_wrap tw-rounded-tl-md'>
//                 <span className={`wjmax_dlc_code wjmax_dlc_code_${displayData?.dlcCode ?? ''}`}>
//                   {displayData?.dlc ?? ''}
//                 </span>
//               </span>
//             ) : (
//               <span className='tw-absolute tw-top-0 tw-left-0 platina_lab_dlc_code_wrap tw-rounded-tl-md'>
//                 <span
//                   className={`platina_lab_dlc_code platina_lab_dlc_code_${displayData?.dlcCode ?? ''}`}
//                 >
//                   {displayData?.dlc ?? ''}
//                 </span>
//               </span>
//             )
//           ) : null}
//           {displayData?.pattern && (
//             <span
//               className={`tw-absolute tw-right-0 tw-bottom-0 pattern ${selectedGame} tw-rounded-br-md ${displayData.pattern}`}
//             >
//               <span className={`tw-text-white`}>
//                 {patternToName[String(displayData.pattern)]}{' '}
//                 {selectedGame == 'wjmax'
//                   ? Number(displayData.level).toFixed(1)
//                   : Number(displayData.level).toFixed(0)}
//               </span>
//             </span>
//           )}
//         </Link>
//         {userData.userName !== '' && isScored && displayData ? (
//           <span
//             className={
//               'tw-w-full tw-bg-gray-950 tw-text-center tw-rounded-md tw-text-xs tw-font-bold mt-2'
//             }
//           >
//             {getSCPatternScoreDisplayText(displayData.patterns, keyMode)}
//           </span>
//         ) : null}{' '}
//       </div>
//     </OverlayTrigger>
//   )
// }

// export default RaScorePopupComponent

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { request } from './utils'

type Album = {
  fileName: string
  album: string
}

type AlbumDetail = {
  fileName: string
  title?: string
  artist?: string
  album?: string
  albumArtist?: string
  year?: number
  genre?: string[]
  track?: {
    no: number
    of?: number
  }
  disk?: {
    no: number
    of?: number
  }
}

const App = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { data: albums, isLoading } = useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: () => request<Album[]>('/albums'),
  })

  const { data: album, isLoading: isDetailLoading } = useQuery<AlbumDetail>({
    queryKey: ['album', selectedFileName],
    queryFn: () => request<AlbumDetail>(`/albums/${selectedFileName}`),
    enabled: selectedFileName !== null,
  })

  return (
    <main>
      <h1>Albums</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {albums?.map(album => (
            <li
              key={album.fileName}
              onClick={() => setSelectedFileName(album.fileName)}>
              {album.album}
            </li>
          ))}
        </ul>
      )}

      {selectedFileName !== null && (
        <div>
          <button onClick={() => setSelectedFileName(null)}>Close</button>

          {isDetailLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p>Title: {album?.title}</p>
              <p>Artist: {album?.artist}</p>
              <p>Album: {album?.album}</p>
              <p>Album Artist: {album?.albumArtist}</p>
              <p>Year: {album?.year}</p>
              <p>Genre: {album?.genre?.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default App

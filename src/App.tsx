import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { request } from './utils'

type Album = {
  fileName: string
  album: string
}

type AlbumDetail = {
  artist?: string
  album?: string
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
      <h2>Albums</h2>

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
        <div className="inset-0 fixed bg-white overflow-y-auto overscroll-contain">
          <header className='flex justify-between'>
            <h2>Detail</h2>
            <button onClick={() => setSelectedFileName(null)}>Close</button>
          </header>

          {isDetailLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {JSON.stringify(album)}
              {/* <p>Artist: {album?.artist}</p>
              <p>Album: {album?.album}</p> */}
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default App

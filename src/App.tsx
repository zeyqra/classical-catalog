import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { request } from './utils'

type Album = {
  fileName: string
  album: string
}

type AlbumDetail = {
  title: string
  comment: string
  composers: {
    name: string
    works: {
      title: string
      recording: {
        conductor: string
        orchestra: string
        soloist: string
        year: string
      }
      movements: string[]
    }[]
  }[]
}

const App = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { data: albums, isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: () => request<Album[]>('/albums'),
  })

  const {
    data: detail = { composers: [] },
    isLoading: detailLoading,
  } = useQuery<AlbumDetail>({
    queryKey: ['album', selectedFileName],
    queryFn: () => request<AlbumDetail>(`/albums/${selectedFileName}`),
    enabled: selectedFileName !== null,
  })

  return (
    <main>
      <header>
        <div>Albums</div>
      </header>

      {albumsLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-0.5">
          {albums?.map(album => (
            <div
              key={album.fileName}
              onClick={() => setSelectedFileName(album.fileName)}>
              <img
                src={`http://localhost:3000${album.coverUrl}`}
                className="aspect-square object-cover min-w-[180px]"
                loading='lazy'
              />
              {/* <div className='line-clamp-2'>{album.album}</div> */}
            </div>
          ))}
        </div>
      )}

      {selectedFileName !== null && (
        <div className="inset-0 fixed bg-white overflow-y-auto overscroll-contain">
          <button
            onClick={() => setSelectedFileName(null)}
            className="absolute top-1 right-1">
            Close
          </button>

          {detailLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="">
              <div>Album Detail</div>
              <section className="p-1 max-w-[50vw] m-auto">
                <section className="flex items-start">
                  <img
                    src={`http://localhost:3000${detail.coverUrl}`}
                    className="w-44 mr-1"
                  />
                  <div>
                    <h2 className="font-semibold">{detail.title}</h2>
                    <p className="text-zinc-500">{detail.comment}</p>
                  </div>
                </section>

                {detail.composers.map(composer => (
                  <section key={composer.name} className="mt-2">
                    <h3 className="font-semibold">{composer.name}</h3>

                    {composer.works.map(work => (
                      <div key={work.title} className="mt-1">
                        <h3 className="font-semibold">{work.title}</h3>
                        <h3 className="font-semibold">
                          {[
                            work.recording.conductor,
                            work.recording.orchestra,
                            work.recording.soloist,
                          ]
                            .filter(Boolean)
                            .join(' / ')}
                          {work.recording.year && ` [${work.recording.year}]`}
                        </h3>

                        <ul className="text-zinc-500">
                          {work.movements.map(movement => (
                            <li key={movement}>{movement}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                ))}
              </section>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default App

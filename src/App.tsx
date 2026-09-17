import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { request } from './utils'

type Stats = {
  composers: {
    name: string
    workCount: number
  }[]
  performers: {
    name: string
    workCount: number
  }[]
}

type Album = {
  fileName: string
  album: string
}

type AlbumsResponse = {
  albums: Album[]
  stats: Stats
}


type AlbumDetail = {
  title: string
  comment: string
  composers: {
    name: string
    works: {
      title: string
      track?: number
      performers: {
        conductor: string
        orchestra: string
        soloist: string
      }
      year: string
      movements: {
        title: string
        track: number
      }[]
    }[]
  }[]
  tracks: {
    track: number
    composer: string
    work: string
    performers: {
      conductor?: string
      orchestra?: string
      soloist?: string
    }
    year?: string
    movement?: string
  }[]
}

const App = () => {
  const [currentSeries, setCurrentSeries] = useState('')
  const { data: series } = useQuery({
    queryKey: ['series'],
    queryFn: () => request(`/series`),
  })
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const {
    data: { albums, stats } = { albums: [], stats: [] },
    isLoading: albumsLoading,
  } = useQuery<AlbumsResponse>({
    queryKey: ['albums', currentSeries],
    queryFn: () => request<AlbumsResponse>(`/albums?series=${currentSeries}`),
  })
  

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<AlbumDetail | null>(null)

  const startEditing = () => {
    setForm(structuredClone(detail))
    setEditing(true)
  }

  const {
    data: detail = { composers: [] },
    isLoading: detailLoading,
  } = useQuery<AlbumDetail>({
    queryKey: ['album', selectedFileName],
    queryFn: () => request<AlbumDetail>(`/albums/${selectedFileName}`),
    enabled: selectedFileName !== null,
  })

  return (
    <main className="h-screen flex flex-col">
      <header className="flex-none">
        <div>Albums</div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[200px] h-full overflow-y-auto">
          <div
            className={`mb-2 cursor-pointer ${
              currentSeries === '' ? 'font-bold' : ''
            }`}
            onClick={() => setCurrentSeries('')}>
            全部
          </div>

          {series?.map(item => (
            <div
              key={item}
              className={`mb-2 cursor-pointer ${
                currentSeries === item ? 'font-bold' : ''
              }`}
              onClick={() => setCurrentSeries(item)}>
              {item}
            </div>
          ))}
        </aside>
        <main className="flex-1 relative">
          <div className="h-full overflow-y-auto">
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
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedFileName !== null && (
              <div className="absolute inset-0  bg-white overflow-y-auto overscroll-contain z-20">
                {detailLoading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="">
                    <div className="absolute right-0 flex justify-between">
                      <div>
                        {editing && (
                          <>
                            <button onClick={() => setEditing(false)}>
                              Cancel
                            </button>

                            <button
                              onClick={async () => {
                                await request(`/albums/${selectedFileName}`, {
                                  method: 'PUT',
                                  body: JSON.stringify(form),
                                })

                                setEditing(false)
                              }}>
                              Save
                            </button>
                          </>
                        )}
                        {!editing && (
                          <button onClick={startEditing}>Edit</button>
                        )}
                        <button onClick={() => setSelectedFileName(null)}>
                          Close
                        </button>
                      </div>
                    </div>
                    <section className="p-1 max-w-[680px] m-auto pt-6">
                      {editing && form ? (
                        <>
                          <input
                            className="w-full"
                            value={form.title}
                            onChange={e =>
                              setForm({
                                ...form,
                                title: e.target.value,
                              })
                            }
                          />
                          <textarea
                            className="w-full"
                            value={form.comment}
                            onChange={e =>
                              setForm({
                                ...form,
                                comment: e.target.value,
                              })
                            }
                          />

                          {form.tracks.map((track, index) => (
                            <section key={track.track} className="mt-2">
                              <h3 className="font-semibold">
                                Track {track.track}
                              </h3>

                              <div className="w-full flex flex-wrap">
                                <input
                                  className="flex-1"
                                  placeholder="Composer"
                                  value={track.composer}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      composer: e.target.value,
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />

                                <input
                                  className="flex-1"
                                  placeholder="Work"
                                  value={track.work}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      work: e.target.value,
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />
                                <input
                                  className="flex-1"
                                  placeholder="Movement"
                                  value={track.movement ?? ''}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      movement: e.target.value,
                                    }
                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />
                              </div>

                              <div className="w-full flex flex-wrap">
                                <input
                                  className="flex-1"
                                  placeholder="Conductor"
                                  value={track.performers.conductor ?? ''}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      performers: {
                                        ...track.performers,
                                        conductor: e.target.value,
                                      },
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />

                                <input
                                  className="flex-1"
                                  placeholder="Orchestra"
                                  value={track.performers.orchestra ?? ''}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      performers: {
                                        ...track.performers,
                                        orchestra: e.target.value,
                                      },
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />

                                <input
                                  className="flex-1"
                                  placeholder="Soloist"
                                  value={track.performers.soloist ?? ''}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      performers: {
                                        ...track.performers,
                                        soloist: e.target.value,
                                      },
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />

                                <input
                                  placeholder="Year"
                                  value={track.year ?? ''}
                                  onChange={e => {
                                    const tracks = [...form.tracks]
                                    tracks[index] = {
                                      ...track,
                                      year: e.target.value,
                                    }

                                    setForm({
                                      ...form,
                                      tracks,
                                    })
                                  }}
                                />
                              </div>
                            </section>
                          ))}
                        </>
                      ) : (
                        <>
                          <section className="flex items-start">
                            <img
                              src={`http://localhost:3000${detail.coverUrl}`}
                              className="w-56 mr-1"
                            />
                            <div>
                              <h2 className="font-medium">{detail.title}</h2>
                              <p className="text-zinc-500 line-clamp-9">
                                {detail.comment}
                              </p>
                            </div>
                          </section>

                          {detail.composers.map(composer => (
                            <section key={composer.name} className="mt-4">
                              <h3 className="font-medium">{composer.name}</h3>

                              {composer.works.map(work => {
                                const isSingleWork =
                                  work.movements.length === 1 &&
                                  work.movements[0]?.title === ''
                                return (
                                  <div key={work.title} className="mt-4">
                                    <h3 className="font-medium">{`${isSingleWork ? work.movements[0].track + ' ' : ''}${work.title}`}</h3>
                                    <h3 className="font-medium">
                                      {[
                                        work.performers.conductor,
                                        work.performers.orchestra,
                                        work.performers.soloist,
                                      ]
                                        .filter(Boolean)
                                        .join(' / ')}
                                      {work.year && ` [${work.year}]`}
                                    </h3>

                                    {!isSingleWork && (
                                      <ul className="mt-0">
                                        {work.movements.map(movement => (
                                          <li
                                            key={
                                              movement.track +
                                              ' ' +
                                              movement.title
                                            }>
                                            {movement.track +
                                              ' ' +
                                              movement.title}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )
                              })}
                            </section>
                          ))}
                        </>
                      )}
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <aside className="w-[280px] overflow-y-auto">
          <h2 className="font-bold">作曲家</h2>
          {stats.composers?.map(composer => (
            <div
              key={composer}
              onClick={() =>
                request<AlbumsResponse>(`/albums?series=${currentSeries}&composer=${composer}`)
              }>
              {composer}
            </div>
          ))}

          <h2 className="font-bold">演奏者</h2>
          {Object.entries(stats.performers || {}).map(
            ([performerType, performers]) => (
              <div>
                <h3>{performerType}</h3>
                {performers.map(performer => (
                  <div key={performer}>{performer}</div>
                ))}
              </div>
            )
          )}
        </aside>
      </div>
    </main>
  )
}

export default App

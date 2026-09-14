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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { data: albums, isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: () => request<Album[]>('/albums'),
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
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {selectedFileName !== null && (
        <div className="inset-0 fixed bg-white overflow-y-auto overscroll-contain">
          {detailLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="">
              <div className="fixed top-0 w-full flex justify-between">
                Album Detail
                <div>
                  {editing && (
                    <>
                      <button onClick={() => setEditing(false)}>Cancel</button>

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
                  {!editing && <button onClick={startEditing}>Edit</button>}
                  <button onClick={() => setSelectedFileName(null)}>
                    Close
                  </button>
                </div>
              </div>
              <section className="p-1 max-w-[50vw] m-auto">
                {editing && form ? (
                  <>
                    <input
                      value={form.title}
                      onChange={e =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                    />

                    <textarea
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
                        <h3 className="font-semibold">Track {track.track}</h3>

                        <input
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

                        <input
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
                      </section>
                    ))}
                  </>
                ) : (
                  <>
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
                            <h3 className="font-semibold">{`${work.track ? work.track + ' ' : ''}${work.title}`}</h3>
                            <h3 className="font-semibold">
                              {[
                                work.performers.conductor,
                                work.performers.orchestra,
                                work.performers.soloist,
                              ]
                                .filter(Boolean)
                                .join(' / ')}
                              {work.year &&
                                ` [${work.year}]`}
                            </h3>

                            <ul className="text-zinc-500">
                              {work.movements.map(movement => (
                                <li key={movement.track + ' ' + movement.title}>
                                  {movement.track + ' ' + movement.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    ))}
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default App

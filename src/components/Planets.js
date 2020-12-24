import React from 'react'
import {
    useQuery,
    useQueryClient
} from 'react-query'
import Planet from './Planet';


const fetchPlanets = async (page) => {
    const pageNo = parseInt(page) || 0
    const res = await fetch(`http://swapi.dev/api/planets/?page=${pageNo}`);
    if (res.ok) {
        await new Promise(r => setTimeout(r, 1000))
        return res.json()
    }
}

const Planets = () => {
    const queryClient = useQueryClient()

    const [page, setPage] = React.useState(1);

    const { status, data, error, isFetching, isPreviousData } = useQuery(
        ['planets', page],
        () => fetchPlanets(page),
        { keepPreviousData: true, staleTime: 15000, cacheTime: 10000 }
    )

    React.useEffect(() => {
        console.log(data?.next)
        if (data?.next) {
            queryClient.prefetchQuery(['planets', page + 1], () =>
                fetchPlanets(page + 1)
            )
        }
    }, [data, page, queryClient])

    return (
        <div>
            <h2>Planets</h2>

            <div>Current Page: {page}</div>
            <button
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={page === 1}
            >
                Previous Page
            </button>{' '}
            <button
                onClick={() => {
                    setPage(old => (!data || data?.next ? old + 1 : old))
                }}
                disabled={isPreviousData || !data?.next}
            >
                Next Page
            </button>


            {status === 'loading' ? (
                <div>Loading...</div>
            ) : status === 'error' ? (
                <div>Error: {error.message}</div>
            ) : (
                        <div>
                            {data.results.map(planet => <Planet key={planet.name} planet={planet} />)}
                        </div>
                    )}

            {
                // Since the last page's data potentially sticks around between page requests,
                // we can use `isFetching` to show a background loading
                // indicator since our `status === 'loading'` state won't be triggered
                isFetching ? <span> Loading...</span> : null
            }{' '}

        </div>
    )
}



export default Planets

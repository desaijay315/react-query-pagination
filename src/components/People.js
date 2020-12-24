import React from 'react';
import {
    useQuery,
    useQueryClient
} from 'react-query'
import Person from './Person';

const fetchPeople = async (page) => {
    const pageNo = parseInt(page) || 0
    const res = await fetch(`http://swapi.dev/api/people/?page=${pageNo}`);
    if (res.ok) {
        await new Promise(r => setTimeout(r, 1000))
        return res.json()
    }
}

const People = () => {
    const queryClient = useQueryClient()

    const [page, setPage] = React.useState(1);

    const { status, data, error, isFetching, isPreviousData } = useQuery(
        ['people', page],
        () => fetchPeople(page),
        { keepPreviousData: true, staleTime: 15000, cacheTime: 10000 }
    )

    React.useEffect(() => {
        console.log(data?.next)
        if (data?.next) {
            queryClient.prefetchQuery(['people', page + 1], () =>
                fetchPeople(page + 1)
            )
        }
    }, [data, page, queryClient])

    return (
        <div>
            <h2>People</h2>

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
                            {data.results.map(people => <Person key={people.name} person={people} />)}
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

export default People;
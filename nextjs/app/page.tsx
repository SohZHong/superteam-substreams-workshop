'use client';
import useSubstreams from '@/hooks/useSubstreams';

export default function Home() {
  const { blocks, error, cursor } = useSubstreams();

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Substreams Data</h1>
      {error && <p className='text-red-500'>Error: {error}</p>}
      <h2 className='text-xl font-bold'>Last Committed Cursor:</h2>{' '}
      <i>{cursor ?? <>-</>}</i>
      <h2 className='text-xl font-bold'>Output: </h2>
      <ul className='list-disc pl-6 space-y-2 text-gray-400'>
        {blocks.map((block, index) => (
          <li key={index} className=''>
            {block}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/types/documents';
import { GetServerSideProps } from 'next';
import { client } from '@/lib/prismic';

interface SearchProps {
  searchResults: Document[];
}

const Search = ({ searchResults }: SearchProps) => {

  const router = useRouter();
  const [search, setSearch] = useState('');

  function handleSubmit(e: FormEvent) {
      e.preventDefault();

      router.push(`/search?q=${encodeURIComponent(search)}`)

      setSearch('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <button type="submit">Search</button>
    
      </form>

      <ul>
          {searchResults.map((product) => {
            return (
              <li key={product.id}>
                <Link href={`/catalog/products/${product.uid}`}>
                  <a>
                    {PrismicDOM.RichText.asText(product.data.title)}
                  </a>
                </Link>
              </li>
            )
          })}
        </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async(context) => {
  const { q } = context.query;

  if(!q) {
    return { props: { searchResults: [] }}
  }
  
  const searchResults = await client().query([
    Prismic.Predicates.at('document.type', 'product'),
    Prismic.Predicates.fulltext('my.product.title', String(q)) // Uso o my.product.title pq foi u campo criado por mim e não nativo do prismic
  ])

  console.log(searchResults);
  return {
    props: {
      searchResults: searchResults.results,
    }
  }
}

export default Search;
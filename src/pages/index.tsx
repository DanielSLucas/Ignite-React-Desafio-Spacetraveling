import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadPosts() {
    if (nextPage) {
      const response = await fetch(nextPage);
      const { next_page, results } = await response.json();

      setPosts(state => [...state, ...results]);
      setNextPage(next_page);
    }
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <footer>
                  <span>
                    <FiCalendar />
                    {post.first_publication_date}
                  </span>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </footer>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button type="button" onClick={loadPosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = getPrismicClient({ previewData });

  const postsResponse = await prismic.getByType('post', { pageSize: 1 });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
    },
  };
};

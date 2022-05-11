/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-danger */
import { asText } from '@prismicio/helpers';
import { GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const timeToRead = useMemo(() => {
    const totalWords = post.data.content.reduce((acc, cur) => {
      const bodyContent = asText(cur.body as any);
      return acc + bodyContent.split(' ').length;
    }, 0);

    return Math.ceil(totalWords / 200);
  }, [post.data.content]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main>
        <img src={post.data.banner.url} alt="banner" />
        <section className={styles.post}>
          <header>
            <h1>{post.data.title}</h1>
            <div>
              <span>
                {' '}
                <FiCalendar /> {post.first_publication_date}
              </span>
              <span>
                {' '}
                <FiUser /> {post.data.author}
              </span>
              <span>
                {' '}
                <FiClock />
                {timeToRead} min
              </span>
            </div>
          </header>
          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                {content.body.map((bodyPart, i) => (
                  <p
                    key={`${post.data.title}-body-${i}`}
                    dangerouslySetInnerHTML={{ __html: bodyPart.text }}
                  />
                ))}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.getByType('post', { pageSize: 1 });

  const paths = postsResponse.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  // TODO
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ req, params }) => {
  const prismic = getPrismicClient({ req });

  const response = await prismic.getByUID('post', String(params.slug), {});

  const post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

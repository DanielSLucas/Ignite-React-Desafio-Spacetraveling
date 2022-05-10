/* eslint-disable @typescript-eslint/no-explicit-any */
import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { PrismicDocument } from '@prismicio/types';
import sm from '../../sm.json';

export const endpoint = sm.apiEndpoint;
export const repositoryName = prismic.getRepositoryName(endpoint);

// Update the Link Resolver to match your project's route structure
export function linkResolver(doc: PrismicDocument): string | null {
  switch (doc.type) {
    case 'homepage':
      return '/';
    case 'page':
      return `/posts/${doc.uid}`;
    default:
      return null;
  }
}

type Config = prismic.ClientConfig & {
  previewData?: any;
  req?: any;
};

// This factory function allows smooth preview setup
export function getPrismicClient(
  config: Config = {} as Config
): prismic.Client {
  const client = prismic.createClient(endpoint, {
    ...config,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  });

  return client;
}

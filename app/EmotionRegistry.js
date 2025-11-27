'use client';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

// This implementation of createCache is taken from
// https://github.com/mui/material-ui/blob/master/examples/material-ui-nextjs-ts/src/app/ThemeRegistry.tsx

export default function EmotionRegistry({ options, children }) {
  const [cache] = useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = cache.sheet.tags.map(tag => ({
      key: tag.getAttribute('data-emotion'),
      ids: tag.getAttribute('data-emotion').split(' ').slice(1),
      css: tag.innerHTML,
    }));

    return (
      <>
        {entries.map(entry => (
          <style
            key={entry.key}
            data-emotion={entry.key}
            dangerouslySetInnerHTML={{ __html: entry.css }}
          />
        ))}
      </>
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

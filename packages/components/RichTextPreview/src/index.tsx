import React from 'react';
import './index.less';

export default function RichTextPreview({ content }: { content?: string }) {
  return (
    // eslint-disable-next-line risxss/catch-potential-xss-react
    <div className="rich-text-preview" dangerouslySetInnerHTML={{ __html: content || '' }}></div>
  );
}

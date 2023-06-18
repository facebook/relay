import React from 'react';

export type ImageProps = {
  src: { default: string };
  width?: string;
  alt?: string;
  title?: string;
};

export default function Image({ src, width = '90%', alt = '', title }: ImageProps) {
  return (
    <div style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>
      <img src={src.default} width={width} alt={alt} title={title} />
    </div>
  );
}
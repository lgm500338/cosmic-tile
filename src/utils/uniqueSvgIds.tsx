import React from 'react';

/**
 * SVG 안의 id(그라데이션 등)를 타일마다 고유하게 바꾼다.
 *
 * 같은 천체 타일이 화면에 여러 개 있으면 같은 id가 여러 번 생기는데,
 * 아이폰(사파리)은 이때 일부 타일에서 url(#id) 연결을 잃어 그림 일부가 사라진다
 * (예: 시리우스 별 모양이 사라지고 흰 점만 남음). id 뒤에 고유 꼬리표를 붙여 해결.
 */
export function uniquifySvgIds(node: React.ReactNode, suffix: string): React.ReactNode {
  if (!React.isValidElement(node)) return node;
  const el = node as React.ReactElement<Record<string, unknown>>;
  const props = el.props || {};
  const next: Record<string, unknown> = {};
  let changed = false;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue;
    if (key === 'id' && typeof value === 'string') {
      next.id = `${value}${suffix}`;
      changed = true;
    } else if (typeof value === 'string' && value.includes('url(#')) {
      next[key] = value.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}${suffix})`);
      changed = true;
    } else if ((key === 'href' || key === 'xlinkHref') && typeof value === 'string' && value.startsWith('#')) {
      next[key] = `${value}${suffix}`;
      changed = true;
    }
  }

  const children = props.children as React.ReactNode;
  let newChildren: React.ReactNode = children;
  if (children !== undefined) {
    newChildren = React.Children.map(children, child => uniquifySvgIds(child, suffix));
    // Children.map 은 배열로 바꾸므로 단일 자식이면 원래 형태 유지
    if (!Array.isArray(children) && Array.isArray(newChildren) && newChildren.length === 1) newChildren = newChildren[0];
    changed = true;
  }

  if (!changed) return el;
  return React.cloneElement(el, next, ...(children === undefined ? [] : Array.isArray(newChildren) ? newChildren : [newChildren]));
}

/** React useId 값(':r1:')을 SVG id에 쓸 수 있는 글자로 바꾼다 */
export function useSvgSuffix(): string {
  const raw = React.useId();
  return '_' + raw.replace(/[^a-zA-Z0-9]/g, '');
}

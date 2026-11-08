/** Map a cropped part back onto the same model in the completed drawing. */
export function assemblyTransform(sourceRect, sourceView, targetRect, targetView) {
  const sourceScale = sourceRect.width / sourceView.width;
  const targetScale = targetRect.width / targetView.width;
  return {
    x: sourceRect.left - targetRect.left + (targetView.x - sourceView.x) * sourceScale,
    y: sourceRect.top - targetRect.top + (targetView.y - sourceView.y) * sourceScale,
    scale: sourceScale / targetScale,
  };
}

export function placementForScroll(boundary, viewportHeight, placed) {
  return boundary <= viewportHeight * .55 + (placed ? 72 : 0);
}

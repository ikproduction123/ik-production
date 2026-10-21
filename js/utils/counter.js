export function animateCounter(elementId, targetValue, duration = 2000) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let startValue = 0;
  const endValue = parseInt(targetValue, 10) || 0;
  if (endValue === 0) {
    element.innerText = '0';
    return;
  }

  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing Out Function
    const currentValue = Math.floor(progress * (endValue - startValue) + startValue);
    element.innerText = currentValue.toLocaleString('id-ID');

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.innerText = endValue.toLocaleString('id-ID');
    }
  }

  requestAnimationFrame(updateCounter);
}

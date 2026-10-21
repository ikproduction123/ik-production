document.addEventListener('DOMContentLoaded', () => {
  const btnOpen = document.getElementById('btn-open-invitation');
  const coverSection = document.getElementById('cover');
  const mainContent = document.getElementById('main-content');
  const bgVideo = document.getElementById('bg-video-motion');
  const audioBacksound = document.getElementById('audio-backsound');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      // Hide Cover & Show Main Invitation Content
      coverSection.style.display = 'none';
      mainContent.style.display = 'block';

      // Auto Play Video Background (Paket Motion)
      if (bgVideo) {
        bgVideo.play().catch(e => console.log('Video play error:', e));
      }

      // Auto Play Audio Backsound
      if (audioBacksound && audioBacksound.src) {
        audioBacksound.play().catch(e => console.log('Audio play error:', e));
      }
    });
  }
});

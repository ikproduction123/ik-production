import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MapPin, Calendar, Clock, Music, Pause, Instagram } from 'lucide-react';

export default function InvitationView() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';

  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [invitation, setInvitation] = useState(null);
  const [couple, setCouple] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      // 1. Ambil data undangan berdasarkan slug
      const { data: invData, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (invError || !invData) {
        setLoading(false);
        return;
      }
      setInvitation(invData);

      // 2. Ambil data mempelai
      const { data: coupleData } = await supabase.from('couples').select('*').eq('invitation_id', invData.id).single();
      if (coupleData) setCouple(coupleData);

      // 3. Ambil data acara
      const { data: eventsData } = await supabase.from('events').select('*').eq('invitation_id', invData.id).order('created_at', { ascending: true });
      if (eventsData) setEvents(eventsData);

      // 4. Ambil galeri
      const { data: galleryData } = await supabase.from('galleries').select('*').eq('invitation_id', invData.id).order('created_at', { ascending: true });
      if (galleryData) setGallery(galleryData);

      setLoading(false);
    };

    fetchInvitation();
  }, [slug]);

  const openInvitation = () => {
    setIsOpened(true);
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B4332', color: '#D4AF37' }}>Memuat Undangan...</div>;
  if (!invitation) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Undangan tidak ditemukan.</div>;

  return (
    <div style={{ fontFamily: '"Playfair Display", serif', backgroundColor: '#FDFBF7', color: '#1B4332', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ELEMEN AUDIO */}
      {invitation.music_url && (
        <audio ref={audioRef} loop src={invitation.music_url} />
      )}

      {/* FLOATING MUSIC BUTTON */}
      {isOpened && invitation.music_url && (
        <button 
          onClick={toggleAudio}
          style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50, width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#D4AF37', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isPlaying ? <Pause size={24} /> : <Music size={24} />}
        </button>
      )}

      {/* HALAMAN SAMPUL (COVER) - Akan hilang saat tombol "Buka Undangan" diklik */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, 
        backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.7), rgba(27, 67, 50, 0.9)), url(${invitation.cover_img || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000'})`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center',
        transition: 'transform 1s cubic-bezier(0.86, 0, 0.07, 1), opacity 1s',
        transform: isOpened ? 'translateY(-100%)' : 'translateY(0)',
        opacity: isOpened ? 0 : 1,
        padding: '2rem'
      }}>
        <h3 style={{ color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>The Wedding Of</h3>
        <h1 style={{ fontSize: '3.5rem', margin: '0 0 2rem 0', fontFamily: '"Great Vibes", cursive', fontWeight: 'normal' }}>
          {couple?.groom_name || 'Groom'} & {couple?.bride_name || 'Bride'}
        </h1>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#D4AF37' }}>{guestName}</h2>
        </div>
        <button 
          onClick={openInvitation}
          style={{ padding: '1rem 2.5rem', backgroundColor: '#D4AF37', color: '#1B4332', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}
        >
          Buka Undangan
        </button>
      </div>

      {/* ISI UNDANGAN (Hanya bisa discroll setelah sampul dibuka) */}
      <div style={{ height: isOpened ? 'auto' : '100vh', overflow: isOpened ? 'auto' : 'hidden' }}>
        
        {/* HERO SECTION */}
        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}>
          <h2 style={{ color: '#D4AF37', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '1rem' }}>Pernikahan</h2>
          <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0', fontFamily: '"Great Vibes", cursive', color: '#1B4332' }}>
            {couple?.groom_name} & {couple?.bride_name}
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.8', margin: '0 auto', color: '#555' }}>
            Kami mengundang Anda untuk merayakan cinta dan persatuan kami dalam ikatan suci pernikahan.
          </p>
        </section>

        {/* KUTIPAN SECTION */}
        {invitation.quote_text && (
          <section style={{ padding: '5rem 2rem', backgroundColor: '#1B4332', color: '#fff', textAlign: 'center' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <Music size={32} color="#D4AF37" style={{ marginBottom: '2rem' }} />
              <p style={{ fontSize: '1.2rem', fontStyle: 'italic', lineHeight: '2', marginBottom: '2rem' }}>
                "{invitation.quote_text}"
              </p>
              <h4 style={{ color: '#D4AF37', letterSpacing: '2px', fontSize: '1rem', margin: 0 }}>{invitation.quote_author}</h4>
            </div>
          </section>
        )}

        {/* MEMPELAI SECTION */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1B4332', marginBottom: '4rem', fontFamily: '"Great Vibes", cursive' }}>Sang Mempelai</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4rem', maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Pria */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ width: '200px', height: '250px', margin: '0 auto 1.5rem', borderRadius: '100px 100px 0 0', overflow: 'hidden', border: '4px solid #D4AF37' }}>
                <img src={couple?.groom_photo || 'https://via.placeholder.com/200x250'} alt="Groom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.8rem', color: '#1B4332', marginBottom: '0.5rem' }}>{couple?.groom_fullname}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Putra dari<br/>Bapak {couple?.groom_father} & Ibu {couple?.groom_mother}</p>
              {couple?.groom_instagram && (
                <a href={`https://instagram.com/${couple.groom_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 'bold' }}><Instagram size={18}/> {couple.groom_instagram}</a>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#D4AF37', fontFamily: '"Great Vibes", cursive' }}>&</div>

            {/* Wanita */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ width: '200px', height: '250px', margin: '0 auto 1.5rem', borderRadius: '100px 100px 0 0', overflow: 'hidden', border: '4px solid #D4AF37' }}>
                <img src={couple?.bride_photo || 'https://via.placeholder.com/200x250'} alt="Bride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.8rem', color: '#1B4332', marginBottom: '0.5rem' }}>{couple?.bride_fullname}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Putri dari<br/>Bapak {couple?.bride_father} & Ibu {couple?.bride_mother}</p>
              {couple?.bride_instagram && (
                <a href={`https://instagram.com/${couple.bride_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 'bold' }}><Instagram size={18}/> {couple.bride_instagram}</a>
              )}
            </div>
          </div>
        </section>

        {/* ACARA SECTION */}
        <section style={{ padding: '6rem 2rem', backgroundColor: '#F4F1EA', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1B4332', marginBottom: '4rem', fontFamily: '"Great Vibes", cursive' }}>Rangkaian Acara</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {events.map((ev, idx) => (
              <div key={idx} style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '3rem 2rem', borderRadius: '8px', borderTop: '5px solid #D4AF37', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#1B4332', marginBottom: '1.5rem' }}>{ev.title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#555' }}>
                  <Calendar size={18} color="#D4AF37" /> <span>{ev.event_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#555' }}>
                  <Clock size={18} color="#D4AF37" /> <span>{ev.time_start} - {ev.time_end}</span>
                </div>
                
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#1B4332' }}>{ev.location_name}</h4>
                <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>{ev.address}</p>
                
                {ev.map_url && (
                  <a href={ev.map_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', backgroundColor: '#1B4332', color: '#D4AF37', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', transition: 'background 0.3s' }}>
                    <MapPin size={16} /> Buka Google Maps
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* GALERI SECTION */}
        {gallery.length > 0 && (
          <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1B4332', marginBottom: '3rem', fontFamily: '"Great Vibes", cursive' }}>Momen Bahagia</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
              {gallery.map(img => (
                <div key={img.id} style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                  <img src={img.image_url} alt="Gallery" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer style={{ padding: '3rem 2rem', backgroundColor: '#1B4332', color: '#fff', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#D4AF37' }}>Terima Kasih</h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Merupakan suatu kehormatan bagi kami atas kehadiran dan doa restu Anda.</p>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '2rem', maxWidth: '300px', margin: '0 auto' }}>
            Created with ❤️ by <a href="https://ik-pro.my.id" style={{ color: '#D4AF37', textDecoration: 'none' }}>IK Production</a>
          </div>
        </footer>

      </div>
    </div>
  );
}

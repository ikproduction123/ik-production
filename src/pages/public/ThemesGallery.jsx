import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function ThemesGallery() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true });
        
      if (!error && data) setThemes(data);
      setLoading(false);
    };

    fetchThemes();
  }, []);

  return (
    <div style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--warning)', marginBottom: '1rem', fontSize: '2.5rem' }}>Galeri Tema Undangan</h1>
      <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>Pilih desain elegan yang paling sesuai dengan gaya pernikahan Anda.</p>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Memuat tema...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: 'var(--container-width)', margin: '0 auto' }}>
          {themes.map((theme) => (
            <div key={theme.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ height: '200px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>
                [Thumbnail {theme.name}]
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{theme.name}</h2>
                  <span style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--warning)', borderRadius: '12px', fontWeight: 'bold' }}>
                    {theme.tier}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.5rem', minHeight: '40px' }}>
                  {theme.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Nantinya tombol ini akan diarahkan ke halaman preview tema asli */}
                  <button style={{ flex: 1, padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>Preview</button>
                  <Link to="/register" style={{ flex: 1, padding: '0.6rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>Gunakan</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../features/auth/AuthContext';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';

export default function MyInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id, slug, title, status, cover_img, created_at,
          themes ( name, tier )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInvitations(data);
      }
      setLoading(false);
    };

    if (user) fetchInvitations();
  }, [user]);

  const getStatusBadge = (status) => {
    const styles = {
      draft: { bg: 'var(--bg-secondary)', color: 'var(--warning)' },
      published: { bg: '#e0f2f1', color: 'var(--success)' },
      expired: { bg: '#ffebee', color: 'var(--danger)' }
    };
    const style = styles[status] || styles.draft;
    return (
      <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {status}
      </span>
    );
  };

  if (loading) return <div>Memuat undangan Anda...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Undangan Saya</h1>
        <Link to="/dashboard/invitations/new" style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
          + Buat Baru
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div style={{ backgroundColor: 'var(--surface)', padding: '4rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Anda belum memiliki undangan.</p>
          <Link to="/dashboard/invitations/new" style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: 'bold' }}>Mulai buat undangan pertama Anda</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {invitations.map((inv) => (
            <div key={inv.id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '150px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', position: 'relative' }}>
                {inv.cover_img ? (
                  <img src={inv.cover_img} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>Tanpa Cover</span>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {getStatusBadge(inv.status)}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{inv.title || 'Tanpa Judul'}</h2>
                <p style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '0.5rem' }}>ik-pro.my.id/{inv.slug}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Tema: <strong>{inv.themes?.name}</strong> ({inv.themes?.tier})
                </p>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid var(--border)', backgroundColor: '#fafafa' }}>
                <Link to={`/dashboard/invitations/${inv.id}/edit`} style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none', borderRight: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <Edit size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Edit</span>
                </Link>
                <a href={`/${inv.slug}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', textDecoration: 'none', borderRight: '1px solid var(--border)' }}>
                  <ExternalLink size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Lihat</span>
                </a>
                <button style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Hapus">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

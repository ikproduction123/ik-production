import { useParams } from 'react-router-dom';

export default function Editor() {
  const { id } = useParams();

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)' }}>Editor Undangan</h1>
      <p>Mengedit undangan dengan ID: {id}</p>
      <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
        <p>Formulir Editor (Mempelai, Acara, Galeri, dll) akan diimplementasikan pada tahap selanjutnya.</p>
      </div>
    </div>
  );
}

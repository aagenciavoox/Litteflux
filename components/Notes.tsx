import React, { useState, useEffect } from 'react';
import { db } from '../services/supabase';
import { SystemNote, ModalType } from '../types';
import { NoteFormModal } from './Modals';

interface NotesProps {
  // Can extend if needed
}

const Notes: React.FC<NotesProps> = () => {
  const [notes, setNotes] = useState<SystemNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SystemNote | undefined>(undefined);

  const fetchNotes = async () => {
    try {
      const data = await db.getSystemNotes();
      setNotes(data as SystemNote[]);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenNew = () => {
    setEditingNote(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: SystemNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { title: string, content: string, color: string }) => {
    try {
      if (editingNote) {
        await db.updateSystemNote(editingNote.id, data);
      } else {
        await db.createSystemNote(data);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      alert("Erro ao salvar nota.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening edit modal
    if (confirm("Deseja realmente apagar esta nota?")) {
      try {
        await db.deleteSystemNote(id);
        fetchNotes();
      } catch (error) {
        console.error("Erro ao apagar nota:", error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Bloco de Notas</h3>
          <p className="text-slate-500 text-xs font-medium mt-0.5 uppercase tracking-widest">Lembretes e insights estratégicos.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-[#1F7A5F] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#156E56] transition-all"
        >
          Nova Nota
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando notas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => handleOpenEdit(note)}
              className={`${note.color || 'bg-white'} p-10 rounded-[40px] border shadow-sm relative group hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              <button
                onClick={(e) => handleDelete(note.id, e)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white z-10"
              >
                ✕
              </button>
              <h4 className="text-sm font-black uppercase mb-4 tracking-tight pr-6">{note.title}</h4>
              <p className="text-xs leading-relaxed font-medium opacity-70 whitespace-pre-line">{note.content}</p>
              <p className="text-[9px] mt-8 uppercase font-black opacity-30 tracking-widest">
                {note.created_at ? new Date(note.created_at).toLocaleDateString('pt-BR') : ''}
              </p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma nota registrada</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <NoteFormModal
          note={editingNote}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};

export default Notes;

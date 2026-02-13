import { useState, useEffect } from 'react';
import type { Task } from './types/task';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [language, setLanguage] = useState<'pt' | 'en' | 'fr'>('pt'); // ← NOVO
  const pendingTasks = tasks.filter(task => !task.completed);

  // ← TRADUÇÕES
  const translations = {
    pt: {
      title: '🛠️ Tarefas',
      placeholder: 'Adicionar nova tarefa...',
      empty: 'Sem tarefas pendentes',
      complete: 'Completar tarefa?',
      completeBtn: 'Completar',
      cancel: 'Cancelar'
    },
    en: {
      title: '🛠️ Tasks',
      placeholder: 'Add a new task...',
      empty: 'No pending tasks',
      complete: 'Complete task?',
      completeBtn: 'Complete',
      cancel: 'Cancel'
    },
    fr: {
      title: '🛠️ Tâches',
      placeholder: 'Ajouter une nouvelle tâche...',
      empty: 'Aucune tâche en attente',
      complete: 'Terminer la tâche?',
      completeBtn: 'Terminer',
      cancel: 'Annuler'
    }
  };

  const t = translations[language]; // ← FUNÇÃO DE TRADUÇÃO

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).chrome?.storage?.sync) {
      const chrome = (window as any).chrome;
      const loadTasks = () => new Promise<Task[]>((resolve) => {
        chrome.storage.sync.get(['tasks'], (result: any) => {
          resolve(result.tasks || []);
        });
      });
      loadTasks().then((loadedTasks) => {
        setTasks(loadedTasks);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      title: input.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    const newTasks = [newTask, ...tasks];
    if (typeof window !== 'undefined' && (window as any).chrome?.storage?.sync) {
      const chrome = (window as any).chrome;
      chrome.storage.sync.set({ tasks: newTasks });
    }
    setTasks(newTasks);
    setInput('');
  };

  const deleteTask = (id: string) => {
    setTaskToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      const newTasks = tasks.filter(task => task.id !== taskToDelete);
      if (typeof window !== 'undefined' && (window as any).chrome?.storage?.sync) {
        const chrome = (window as any).chrome;
        chrome.storage.sync.set({ tasks: newTasks });
      }
      setTasks(newTasks);
    }
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  if (loading) {
    return <div className="loading">{t.empty || 'Loading...'}</div>;
  }

  return (
    <div className="popup">
      <header>
        <h1>{t.title}</h1>
        <div className="language-selector"> {/* ← NOVO: BANDEIRAS */}
          <button 
            className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
            onClick={() => setLanguage('fr')}
            title="Français"
          >
            🇫🇷
          </button>
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            title="English"
          >
            🇬🇧
          </button>
          <button 
            className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
            onClick={() => setLanguage('pt')}
            title="Português"
          >
            🇵🇹
          </button>
          <span className="count">{pendingTasks.length}</span>
        </div>
      </header>
      
      <div className="add-task">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder={t.placeholder}
          autoFocus
        />
      </div>

      <div className="tasks">
        {pendingTasks.length === 0 ? (
          <div className="empty">{t.empty}</div>
        ) : (
          pendingTasks.map(task => (
            <div key={task.id} className="task">
              <div className="task-content">
                <span>{task.title}</span>
                <small className="task-date">
                  {new Date(task.createdAt).toLocaleDateString(
                    language === 'pt' ? 'pt-PT' : 
                    language === 'fr' ? 'fr-FR' : 'en-GB', 
                    {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )}
                </small>
              </div>
              <button 
                className="done-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
              >
                ✓
              </button>
            </div>
          ))
        )}
      </div>

      {showConfirm && taskToDelete && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>{t.complete}</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={cancelDelete}>
                {t.cancel}
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                {t.completeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

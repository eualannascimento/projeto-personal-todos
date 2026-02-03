import { Header, StatusPanel, QuestList, DailyQuests } from './components';
import { useTaskData } from './hooks/useTaskData';
import './App.css';

function App() {
  const { data, isLoading, refresh } = useTaskData();

  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <div className="loading">
            <div className="loading-spinner" />
            <p>Carregando dados...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <div className="error">
            <p>Erro ao carregar dados. Configure o Notion Integration.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        lastSync={data.lastSync}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <main className="main">
        <div className="layout">
          {/* Left sidebar - Status and Daily Quests */}
          <aside className="sidebar">
            <StatusPanel stats={data.playerStats} />
            <DailyQuests quests={data.dailyQuests} />
          </aside>

          {/* Main content - Quest List */}
          <section className="content">
            <QuestList
              tasks={data.tasks}
              title="Missoes Ativas"
              emptyMessage="Nenhuma missao disponivel. Adicione tarefas no Notion!"
            />
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>
          Sistema sincronizado com{' '}
          <a
            href="https://notion.so"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notion
          </a>
          {' '}• Hunter System v1.0
        </p>
      </footer>
    </div>
  );
}

export default App;

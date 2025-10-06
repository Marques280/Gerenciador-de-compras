// Variáveis globais
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editTaskId = null;

// Elementos DOM
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const taskList = document.getElementById('taskList');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const pendingTasksSpan = document.getElementById('pendingTasks');

// Event Listeners :cite[3]:cite[7]
document.addEventListener('DOMContentLoaded', initApp);
addTaskBtn.addEventListener('click', handleAddTask);
taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleAddTask();
});
filterStatus.addEventListener('change', renderTasks);
filterPriority.addEventListener('change', renderTasks);

// Inicialização da aplicação
function initApp() {
  renderTasks();
  updateStats();
}

// Gerenciador de adição/edição de tarefas
function handleAddTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  
  if (text === '') {
    showNotification('Por favor, digite uma tarefa!', 'error');
    return;
  }
  
  if (editTaskId !== null) {
    // Modo edição
    tasks = tasks.map(task => 
      task.id === editTaskId 
        ? { ...task, text, priority }
        : task
    );
    editTaskId = null;
    addTaskBtn.textContent = 'Adicionar';
    showNotification('Tarefa atualizada com sucesso!', 'success');
  } else {
    // Modo adição
    const newTask = {
      id: Date.now(),
      text,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    showNotification('Tarefa adicionada com sucesso!', 'success');
  }
  
  taskInput.value = '';
  saveTasks();
  renderTasks();
  updateStats();
}

// Renderiza a lista de tarefas
function renderTasks() {
  const statusFilter = filterStatus.value;
  const priorityFilter = filterPriority.value;
  
  let filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'todas' || 
                       (statusFilter === 'concluida' && task.completed) ||
                       (statusFilter === 'pendente' && !task.completed);
    
    const priorityMatch = priorityFilter === 'todas' || task.priority === priorityFilter;
    
    return statusMatch && priorityMatch;
  });
  
  taskList.innerHTML = '';
  
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li class="no-tasks">Nenhuma tarefa encontrada</li>';
    return;
  }
  
  filteredTasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'concluida' : ''} ${task.priority}`;
    taskItem.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleTask(${task.id})">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
      </div>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${task.id})">✏️</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    taskList.appendChild(taskItem);
  });
}

// Alternar estado de conclusão da tarefa
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
  updateStats();
  showNotification('Tarefa atualizada!', 'info');
}

// Editar tarefa
function editTask(id) {
  const task = tasks.find(task => task.id === id);
  if (task) {
    taskInput.value = task.text;
    prioritySelect.value = task.priority;
    editTaskId = id;
    addTaskBtn.textContent = 'Atualizar';
    taskInput.focus();
  }
}

// Excluir tarefa
function deleteTask(id) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    showNotification('Tarefa excluída!', 'warning');
  }
}

// Atualizar estatísticas
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  
  totalTasksSpan.textContent = total;
  completedTasksSpan.textContent = completed;
  pendingTasksSpan.textContent = pending;
}

// Salvar tarefas no localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Mostrar notificações
function showNotification(message, type) {
  // Remove notificação anterior se existir
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === 'success' ? 'background: #28a745;' : 
      type === 'error' ? 'background: #dc3545;' : 
      type === 'warning' ? 'background: #ffc107; color: #000;' : 
      'background: #17a2b8;'}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Segurança: evitar XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Adicionar estilos para a animação da notificação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .no-tasks {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
  }
`;
document.head.appendChild(style);


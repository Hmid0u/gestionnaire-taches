document.addEventListener('DOMContentLoaded', () => {
    /**
     * Classe représentant une tâche.
     * Sert de modèle pour chaque élément de la liste.
     */
    class Task {
      /**
       * Constructeur de la tâche.
       * @param {string} title - Titre de la tâche.
       * @param {string} description - Description de la tâche.
       * @param {string} dueDate - Date d’échéance.
       * @param {string} priority - Priorité (basse, moyenne, élevée).
       */
      constructor(title, description, dueDate, priority) {
        this.id = Date.now(); // identifiant unique
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.done = false; // état par défaut : tâche non terminée
      }
    }
  
    /**
     * Fonction pour éviter les injections HTML.
     * @param {string} str - Texte à sécuriser.
     * @returns {string} - Texte échappé (sécurisé pour le DOM).
     */
    function escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  
    // Chargement initial des tâches depuis le localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
    /**
     * Sauvegarde le tableau `tasks` dans le localStorage.
     */
    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    /**
     * Affiche les tâches dans la liste en fonction du filtre et de la recherche.
     * Met aussi à jour la barre de progression.
     */
    function displayTasks() {
      const searchInput = document.getElementById('searchInput');
      const statusFilter = document.getElementById('statusFilter');
      const taskList = document.getElementById('taskList');
  
      const searchTerm = searchInput.value.toLowerCase();
      const selectedStatus = statusFilter.value;
  
      // Nettoyage de la liste
      taskList.innerHTML = '';
  
      // Filtrage des tâches selon la recherche ET le statut
      const filteredTasks = tasks.filter(task => {
        const matchSearch = task.title.toLowerCase().includes(searchTerm);
        const matchStatus =
          selectedStatus === 'all' ||
          (selectedStatus === 'active' && !task.done) ||
          (selectedStatus === 'done' && task.done);
        return matchSearch && matchStatus;
      });
  
      // Génération dynamique des éléments HTML pour chaque tâche
      filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item d-flex flex-column gap-2' +
          (task.done ? ' list-group-item-secondary' : '');
  
        const priorityClass = {
          'élevée': 'text-danger',
          'moyenne': 'text-warning',
          'basse': 'text-success'
        }[task.priority];
  
        taskItem.innerHTML = `
          <div><strong class="${priorityClass}">${escapeHTML(task.title)}</strong> - ${escapeHTML(task.dueDate)}</div>
          <div><em>${escapeHTML(task.description)}</em></div>
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-success me-2" onclick="toggleTask(${task.id})">
              ${task.done ? 'Reprendre' : 'Terminer'}
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
              Supprimer
            </button>
          </div>
        `;
  
        taskList.appendChild(taskItem);
      });
  
      updateProgress(); // met à jour la barre de progression
    }
  
    /**
     * Marque une tâche comme terminée ou active.
     * @param {number} id - Identifiant de la tâche à modifier.
     */
    window.toggleTask = function (id) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.done = !task.done;
        saveTasks();
        displayTasks();
      }
    };
  
    /**
     * Supprime une tâche de la liste.
     * @param {number} id - Identifiant de la tâche à supprimer.
     */
    window.deleteTask = function (id) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      displayTasks();
    };
  
    /**
     * Met à jour visuellement la barre de progression des tâches complétées.
     */
    function updateProgress() {
      const progressBar = document.getElementById('progressBar');
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter(t => t.done).length;
  
      if (totalTasks === 0) {
        progressBar.style.width = '0%';
        progressBar.textContent = '';
        return;
      }
  
      const percent = Math.round((doneTasks / totalTasks) * 100);
      progressBar.style.width = percent + '%';
      progressBar.textContent = percent + '%';
    }
  
    /**
     * Gère la soumission du formulaire d'ajout de tâche.
     */
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', e => {
      e.preventDefault(); // empêche le rechargement de la page
  
      const title = escapeHTML(document.getElementById('title').value.trim());
      const description = escapeHTML(document.getElementById('description').value.trim());
      const dueDate = document.getElementById('dueDate').value;
      const priority = document.getElementById('priority').value;
  
      // Création de la nouvelle tâche
      tasks.push(new Task(title, description, dueDate, priority));
      saveTasks();
      displayTasks();
      taskForm.reset(); // Réinitialise les champs
    });
  
    /**
     * Bascule le thème entre clair et sombre.
     */
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      darkModeToggle.textContent = document.body.classList.contains('dark-mode')
        ? 'Mode Clair'
        : 'Mode Sombre';
    });
  
    // Mise à jour de l'affichage si on modifie les filtres
    document.getElementById('statusFilter').addEventListener('change', displayTasks);
    document.getElementById('searchInput').addEventListener('input', displayTasks);
  
    // Affichage initial au chargement
    displayTasks();
  });
   
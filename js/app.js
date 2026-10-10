// Media Tracker MVP - Local Storage
const STORAGE_KEY = 'media-tracker-items';

class MediaTracker {
    constructor() {
        this.items = this.loadItems();
        this.currentSection = 'all';
        this.currentEditId = null;
        
        this.initElements();
        this.initEventListeners();
        this.render();
    }
    
    initElements() {
        // Header
        this.addItemBtn = document.getElementById('addItemBtn');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        // Sidebar
        this.sidebar = document.getElementById('sidebar');
        this.navItems = document.querySelectorAll('.nav__item');
        
        // Content
        this.searchInput = document.getElementById('searchInput');
        this.typeFilter = document.getElementById('typeFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sectionTitle = document.getElementById('sectionTitle');
        this.itemsList = document.getElementById('itemsList');
        this.emptyState = document.getElementById('emptyState');
        this.emptyMessage = document.getElementById('emptyMessage');
        this.resetFiltersBtn = document.getElementById('resetFiltersBtn');
        
        // Modal
        this.itemModal = document.getElementById('itemModal');
        this.modalBackdrop = document.getElementById('modalBackdrop');
        this.modalClose = document.getElementById('modalClose');
        this.modalCancel = document.getElementById('modalCancel');
        this.itemForm = document.getElementById('itemForm');
        this.modalTitle = document.getElementById('modalTitle');
        
        this.itemIdInput = document.getElementById('itemId');
        this.itemTitleInput = document.getElementById('itemTitle');
        this.itemTypeInput = document.getElementById('itemType');
        this.itemStatusInput = document.getElementById('itemStatus');
        this.itemRatingInput = document.getElementById('itemRating');
        this.itemNoteInput = document.getElementById('itemNote');
        this.itemFavoriteInput = document.getElementById('itemFavorite');
    }
    
    initEventListeners() {
        // Header
        this.addItemBtn.addEventListener('click', () => this.openModal('add'));
        this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        
        // Sidebar
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.changeSection(item.dataset.section);
                this.closeMobileMenu();
            });
        });
        
        // Filters
        this.searchInput.addEventListener('input', () => this.render());
        this.typeFilter.addEventListener('change', () => this.render());
        this.statusFilter.addEventListener('change', () => {
            // Inside "Избранное" the status filter only refines the favorites
            // without switching the active section.
            if (this.currentSection === 'favorites') {
                this.render();
                return;
            }
            // Otherwise keep the left navigation in sync with the status.
            const statusValue = this.statusFilter.value;
            this.changeSection(statusValue === 'all' ? 'all' : statusValue);
        });
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        
        // Modal
        this.modalBackdrop.addEventListener('click', () => this.closeModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalCancel.addEventListener('click', () => this.closeModal());
        
        this.itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Close modal on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeMobileMenu();
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.sidebar.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }
    
    loadItems() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading items:', error);
            return [];
        }
    }
    
    saveItems() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving items:', error);
        }
    }
    
    toggleMobileMenu() {
        this.sidebar.classList.toggle('sidebar--active');
    }
    
    closeMobileMenu() {
        this.sidebar.classList.remove('sidebar--active');
    }
    
    resetFilters() {
        this.searchInput.value = '';
        this.typeFilter.value = 'all';
        this.statusFilter.value = 'all';
        
        // Keep the active section. For status sections re-applying the section
        // restores the synced status; "Избранное" simply stays with all statuses.
        if (this.currentSection === 'favorites') {
            this.render();
        } else {
            this.changeSection(this.currentSection);
        }
    }
    
    changeSection(section) {
        this.currentSection = section;
        
        // Sync status filter: regular status sections keep a matching status,
        // while "Все" and "Избранное" reset the status filter to "Все статусы".
        if (section === 'planned' || section === 'in_progress' || section === 'completed') {
            this.statusFilter.value = section;
        } else {
            this.statusFilter.value = 'all';
        }
        
        // Update nav
        this.navItems.forEach(item => {
            item.classList.toggle('nav__item--active', item.dataset.section === section);
        });
        
        // Update title
        const titles = {
            all: 'Все',
            planned: 'В планах',
            in_progress: 'В процессе',
            completed: 'Завершено',
            favorites: 'Избранное'
        };
        this.sectionTitle.textContent = titles[section] || 'Все';
        
        this.render();
    }
    
    openModal(mode, item = null) {
        this.itemModal.classList.add('modal--active');
        this.itemModal.focus();
        
        if (mode === 'add') {
            this.modalTitle.textContent = 'Добавить запись';
            this.currentEditId = null;
            this.itemIdInput.value = '';
            this.itemTitleInput.value = '';
            this.itemTypeInput.value = '';
            this.itemStatusInput.value = '';
            this.itemRatingInput.value = '';
            this.itemNoteInput.value = '';
            this.itemFavoriteInput.checked = false;
        } else if (mode === 'edit' && item) {
            this.modalTitle.textContent = 'Редактировать запись';
            this.currentEditId = item.id;
            this.itemIdInput.value = item.id;
            this.itemTitleInput.value = item.title || '';
            this.itemTypeInput.value = item.type || '';
            this.itemStatusInput.value = item.status || '';
            this.itemRatingInput.value = item.rating || '';
            this.itemNoteInput.value = item.note || '';
            this.itemFavoriteInput.checked = item.favorite || false;
        }
    }
    
    closeModal() {
        this.itemModal.classList.remove('modal--active');
    }
    
    handleFormSubmit() {
        const title = this.itemTitleInput.value.trim();
        const type = this.itemTypeInput.value;
        const status = this.itemStatusInput.value;
        const rating = this.itemRatingInput.value.trim();
        const note = this.itemNoteInput.value.trim();
        const favorite = this.itemFavoriteInput.checked;
        
        // Validation
        if (!title) {
            alert('Введите название');
            this.itemTitleInput.focus();
            return;
        }
        if (!type) {
            alert('Выберите тип');
            this.itemTypeInput.focus();
            return;
        }
        if (!status) {
            alert('Выберите статус');
            this.itemStatusInput.focus();
            return;
        }
        
        // Validate rating
        if (rating !== '') {
            const ratingNum = parseInt(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
                alert('Оценка должна быть от 1 до 10');
                this.itemRatingInput.focus();
                return;
            }
        }
        
        if (this.currentEditId) {
            // Update existing
            const index = this.items.findIndex(item => item.id === this.currentEditId);
            if (index > -1) {
                this.items[index] = {
                    ...this.items[index],
                    title,
                    type,
                    status,
                    rating: rating !== '' ? parseInt(rating) : '',
                    note,
                    favorite
                };
            }
        } else {
            // Create new
            const newItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title,
                type,
                status,
                rating: rating !== '' ? parseInt(rating) : '',
                note,
                favorite,
                createdAt: new Date().toISOString()
            };
            this.items.push(newItem);
        }
        
        this.saveItems();
        this.closeModal();
        this.render();
    }
    
    toggleFavorite(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.favorite = !item.favorite;
            this.saveItems();
            this.render();
        }
    }
    
    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            this.openModal('edit', item);
        }
    }
    
    deleteItem(id) {
        if (confirm('Удалить эту запись?')) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveItems();
            this.render();
        }
    }
    
    getFilteredItems() {
        let filtered = [...this.items];
        
        // Filter by section
        if (this.currentSection === 'planned') {
            filtered = filtered.filter(item => item.status === 'planned');
        } else if (this.currentSection === 'in_progress') {
            filtered = filtered.filter(item => item.status === 'in_progress');
        } else if (this.currentSection === 'completed') {
            filtered = filtered.filter(item => item.status === 'completed');
        } else if (this.currentSection === 'favorites') {
            filtered = filtered.filter(item => item.favorite);
        }
        
        // Filter by search
        if (this.searchInput.value.trim()) {
            const searchTerm = this.searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(item => 
                item.title && item.title.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by type
        if (this.typeFilter.value !== 'all') {
            filtered = filtered.filter(item => item.type === this.typeFilter.value);
        }
        
        // Filter by status
        if (this.statusFilter.value !== 'all') {
            filtered = filtered.filter(item => item.status === this.statusFilter.value);
        }
        
        return filtered;
    }
    
    render() {
        const filtered = this.getFilteredItems();
        
        if (filtered.length === 0) {
            this.itemsList.innerHTML = '';
            this.emptyState.style.display = 'block';
            
            if (this.items.length === 0) {
                this.emptyMessage.textContent = 'Пока нет записей';
                this.resetFiltersBtn.style.display = 'none';
            } else {
                this.emptyMessage.textContent = 'Нет записей, соответствующих выбранным условиям';
                this.resetFiltersBtn.style.display = 'inline-flex';
            }
            return;
        }
        
        this.emptyState.style.display = 'none';
        this.resetFiltersBtn.style.display = 'none';
        
        this.itemsList.innerHTML = filtered.map(item => {
            const typeLabels = {
                movie: 'Фильм',
                series: 'Сериал',
                book: 'Книга',
                anime: 'Аниме'
            };
            
            const statusLabels = {
                planned: 'В планах',
                in_progress: 'В процессе',
                completed: 'Завершено'
            };
            
            const favoriteClass = item.favorite ? 'item__favorite--active' : '';
            const favoriteIcon = item.favorite ? '★' : '☆';
            
            const typeClass = `badge--type-${item.type}`;
            const statusClass = `badge--status-${item.status}`;
            
            return `
                <article class="item" data-id="${this.escapeHtml(item.id)}">
                    <div class="item__header">
                        <h3 class="item__title">${this.escapeHtml(item.title || '')}</h3>
                        <button class="item__favorite ${favoriteClass}" 
                            onclick="tracker.toggleFavorite('${this.escapeHtml(item.id)}')" 
                            aria-label="${item.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}">
                            ${favoriteIcon}
                        </button>
                    </div>
                    <div class="item__meta">
                        <span class="badge ${typeClass}">${this.escapeHtml(typeLabels[item.type] || item.type)}</span>
                        <span class="badge ${statusClass}">${this.escapeHtml(statusLabels[item.status] || item.status)}</span>
                        ${item.rating ? `<span class="item__rating">★ ${this.escapeHtml(String(item.rating))}/10</span>` : ''}
                    </div>
                    ${item.note ? `<div class="item__note">${this.escapeHtml(item.note)}</div>` : ''}
                    <div class="item__actions">
                        <button class="item__btn" onclick="tracker.editItem('${this.escapeHtml(item.id)}')">Редактировать</button>
                        <button class="item__btn item__btn--danger" onclick="tracker.deleteItem('${this.escapeHtml(item.id)}')">Удалить</button>
                    </div>
                </article>
            `;
        }).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new MediaTracker();
});